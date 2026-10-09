# Shubhbagaria12/QWEN_OPENIIT

## Resumen
QWEN_OPENIIT es un ajuste fino por LoRA de Qwen/Qwen2.5-0.5B-Instruct (494.032.768 parámetros totales) desarrollado por el usuario Shubhbagaria12 para la resolución del problema «Real-Time Fake PTP Detection & In-Call Guidance» de CreditNirvana, en el marco de Open IIT Data Analytics. El modelo no es un asistente de propósito general: es un copiloto de llamadas de cobro que lee una conversación en curso, code-mixed (hinglish, kanglish, inglés), y clasifica la promesa de pago (PTP) en una de seis categorías de comportamiento, además de proponer la siguiente línea del agente.

La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con un adaptador LoRA de rango 16 aplicado sobre todas las proyecciones de atención y MLP (8,8 M parámetros entrenables, el 1,75 % del total) y posteriormente fusionado en los pesos raíz en bf16. La salida está fuertemente constreñida: el modelo responde con el formato `<code>|<categoria>|<siguiente linea del agente>`, donde el primer token generado es siempre un dígito del 1 al 6, lo que permite obtener la categoría y una confianza calibrada (softmax sobre los seis logits de dígito) en el time-to-first-token.

Su relevancia es doble. Por un lado, demuestra que un modelo de 0,5 B parámetros puede ejecutarse en una GPU de portátil (0,74 GB de VRAM en NF4, 47 ms de TTFT p50) con latencia suficiente para asistir llamadas en vivo. Por otro, la propia model card documenta con inusual honestidad sus límites: se declara herramienta de apoyo a la decisión, no un clasificador autónomo, y cuantifica sus fallos (envía el 17 % de los casos de hardship a las categorías escape/repeat_promiser).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA fusionado en los pesos |
| Parametros totales | 494.032.768 (≈0,49 B) |
| Parametros activos | No aplica (no es MoE). 8,8 M parámetros entrenables en el adaptador LoRA (1,75 %) |
| Longitud de contexto | 32.768 tokens, heredada de Qwen2.5-0.5B-Instruct; no declarada explícitamente en la model card |
| Tipos de cuantizacion | bf16 (pesos raíz fusionados), fp16, NF4 4-bit con double quant vía BitsAndBytesConfig |
| Idiomas soportados | en, hi, kn; entrenado sobre llamadas code-mixed en hinglish y kanglish |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); adaptador LoRA por separado en lora_adapter/ (34 MB) |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-0.5B-Instruct y se adapta mediante LoRA con rango 16, alfa 32 y dropout 0,05 sobre todas las proyecciones de atención y de MLP. El resultado son 8,8 M parámetros entrenables (1,75 % del total). El repositorio contiene dos artefactos: en la raíz, los pesos ya fusionados en bf16, listos para cargar con `AutoModelForCausalLM`; en `lora_adapter/`, únicamente el adaptador de 34 MB. El ajuste se realizó durante 2 épocas con learning rate 2e-4 y batch efectivo de 16, sobre 2.400 prefijos de diálogo extraídos de 1.680 cuentas del split de entrenamiento.

La innovación principal no está en la arquitectura, sino en el diseño del prompt y de la cabeza de clasificación. El prompt de entrenamiento usa el formato ChatML de Qwen (`<|im_start|>`), una línea por intervención con etiquetas `A:` (agente), `B:` (bot de voz) y `C:` (cliente), y una línea `CTX` con idioma, cartera, PTP previos rotos, día de cobro (`?` si se desconoce) y la promesa en discusión. Los nombres propios están enmascarados en los datos. Cualquier prefijo de la llamada es puntuable, de modo que el modelo funciona turno a turno y no solo al final. La clasificación se obtiene leyendo directamente los logits de los tokens «1» a «6» en la última posición, con temperaturas de calibración ajustadas en validación: 1,156 en fp16 y 1,127 en NF4. No se documenta RLHF ni DPO; el ajuste es supervisado sobre diálogos etiquetados.

## Capacidades
- Clasificación de promesas de pago en seis categorías: `1 genuine_feasible`, `2 genuine_infeasible`, `3 escape`, `4 third_party`, `5 repeat_promiser`, `6 agent_recorded_or_pushed`.
- Estimación de confianza calibrada en el time-to-first-token, a partir del softmax sobre los logits de los seis dígitos.
- Puntuación incremental turno a turno: acepta cualquier prefijo de la conversación, no requiere la llamada completa.
- Generación de la siguiente intervención del agente en el mismo turno, con formato validado (`<code>|<categoria>|<linea>`): 100 % de formato válido en 150 llamadas de test.
- Procesamiento de habla code-mixed hinglish (hindi-inglés) y kanglish (canarés-inglés), además de inglés.
- Condicionamiento por contexto estructurado (`CTX`): idioma, cartera, PTP previos incumplidos, día de cobro y promesa en discusión.
- Restricciones de cumplimiento incorporadas vía prompt de sistema: no revelar detalles de deuda a terceros, no amenazar, proteger casos de hardship.
- No dispone de tool calling, function calling, visión, audio ni modo de razonamiento extendido. No es un modelo de agentes.

## Casos de uso
- Copiloto de agente en vivo: durante una llamada de cobro, el modelo recibe el prefijo de la conversación y devuelve en 27-47 ms la categoría de la PTP más la siguiente línea sugerida, lo que permite al agente corregir el guion antes de que la llamada derive.
- Segunda opinión sobre un clasificador tabular: en el sistema de referencia, la categoría del modelo se usa junto a un LightGBM calibrado. Un caso de uso realista es el enrutado de casos dudosos a revisión humana cuando ambos modelos discrepan.
- Detección de third_party (interlocutor distinto del titular): con F1 de 0,966, es la clase más fiable del modelo y sirve para activar de forma automática políticas de no divulgación de información de deuda.
- Detección de PTP forzada o registrada por el agente (`agent_recorded_or_pushed`, F1 0,854): permite marcar registros de promesa que el cliente nunca dio, útil para auditoría de calidad y cumplimiento normativo.
- Análisis posterior de cartera: al puntuar prefijos o llamadas completas en lote, se puede etiquetar el histórico de grabaciones por tipo de promesa y estimar tasas de hardship por cartera.
- Asistencia en idiomas locales: en mercados indios con mezcla hindi-inglés o canarés-inglés, el modelo evita la degradación típica de los modelos monolingües ante code-switching.
- Prototipado rápido en hardware limitado: con 0,74 GB de VRAM en NF4 cabe en una GPU de portátil, lo que permite desplegar una demo de copiloto en equipos sin infraestructura dedicada.
- Filtro previo en pipelines de voz: integrado tras un ASR, puede descartar o priorizar segmentos de llamada antes de pasarlos a modelos mayores.

## Benchmarks y rendimiento
Evaluación sobre el split de test reservado, 484 llamadas:

| Configuracion | Accuracy | Macro-F1 | Top-1 ECE (calibrado) |
|---|---|---|---|
| fp16, final de llamada | 0,645 | 0,673 | 0,042 |
| fp16, prefijo a mitad de llamada | 0,641 | 0,669 | 0,055 |
| NF4 4-bit, final de llamada | 0,605 | 0,642 | 0,039 |

Resultados por clase (fp16, final de llamada):

| Categoria | Precision | Recall | F1 |
|---|---|---|---|
| genuine_feasible | 0,561 | 0,696 | 0,621 |
| genuine_infeasible | 0,639 | 0,434 | 0,517 |
| escape | 0,606 | 0,548 | 0,576 |
| third_party | 0,949 | 0,982 | 0,966 |
| repeat_promiser | 0,464 | 0,553 | 0,505 |
| agent_recorded_or_pushed | 0,837 | 0,872 | 0,854 |

Texto generado sobre 150 llamadas de test: 100 % de formato válido, 37 % de coincidencia exacta con el guion de política aprobado y 0 violaciones de cumplimiento (divulgación de deuda a terceros, lenguaje amenazante).

Latencia medida en una RTX 3050 Laptop de 4 GB, batch 1, Transformers en modo eager y sincronización CUDA, con prompt medio de 330 tokens:

| Precision | VRAM pico | TTFT p50 / p95 (KV cache incremental) | Decodificacion |
|---|---|---|---|
| fp16 | 1,28 GB | 27 / 38 ms | 46 tok/s |
| NF4 4-bit | 0,74 GB | 47 / 57 ms | 30 tok/s |

## Requisitos de hardware
- Inferencia en fp16: 1,28 GB de VRAM pico medidos con prompt de 330 tokens en batch 1.
- Inferencia en NF4 4-bit: 0,74 GB de VRAM pico, con temperatura de calibración 1,127 en lugar de 1,156.
- Cabe en GPU de consumo sin problemas: la medición de referencia es una RTX 3050 Laptop de 4 GB. Cualquier GPU con 4 GB o más (GTX 1650, RTX 3060, RTX 4090) es suficiente; también puede ejecutarse en CPU para pruebas, aunque la latencia no está documentada en ese escenario.
- GPU de datacenter (A100, H100) no aportan ventaja relevante por tamaño: el cuello de botella es la latencia de red y el ASR, no la capacidad de cómputo.
- Despliegue: Hugging Face Transformers (`AutoModelForCausalLM`, `dtype=torch.float16`), cuantización de 4 bits con `BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_compute_dtype=torch.float16, bnb_4bit_use_double_quant=True)`. El repositorio está etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con Inference Endpoints.
- No se publican pesos en GGUF, por lo que llama.cpp y Ollama requerirían una conversión propia no documentada.
- Throughput medido: 46 tok/s en fp16 y 30 tok/s en NF4, con prompts de 330 tokens y batch 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shubhbagaria12/QWEN_OPENIIT | 494 M (8,8 M entrenables en LoRA) | 32.768 tokens (base) | Accuracy 0,645 y macro-F1 0,673 en su tarea de PTP | apache-2.0 | Hugging Face, pesos fusionados + adaptador LoRA |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Sin datos publicados en esta informacion para la tarea de PTP; no resuelve la tarea sin ajuste | apache-2.0 | Hugging Face |
| Clasificador tabular LightGBM (sistema de referencia) | No disponible | No aplica | Citado en la model card como modelo calibrado que acompaña al PTP en produccion, sin metricas publicadas | No disponible | Interno del proyecto |

No se han encontrado en la informacion disponible otros modelos comparables de clasificacion de promesas de pago en habla code-mixed. Los resultados de busqueda web se refieren a la familia Qwen general (Qwen3, Qwen3.8-27B) y no a alternativas directas para esta tarea.

## Limitaciones y advertencias
- Uso previsto exclusivamente como apoyo a la decision. La propia model card advierte de que el modelo, por si solo, envía el 17 % de los casos de hardship (`genuine_infeasible`) a las categorías escape o repeat_promiser.
- No debe utilizarse para tomar decisiones de cobro de forma autónoma. En el sistema de referencia es una segunda opinión frente a un LightGBM calibrado, y las reglas deterministas solo pueden suavizar el tratamiento (hardship hacia reestructuración o humano; tercero hacia no divulgación).
- El texto libre generado no debe mostrarse a agentes o clientes sin revisión: el modelo puede emparejar un código con un guion equivocado o inventar fechas.
- Riesgo de alucinación en la línea sugerida, no verificable contra política sin un sistema de re-renderizado del guion aprobado. Solo el 37 % de las líneas generadas coincide de forma exacta con el guion aprobado.
- Rendimiento desigual por clase: `third_party` (F1 0,966) y `agent_recorded_or_pushed` (F1 0,854) son fiables, mientras que `genuine_infeasible` (recall 0,434), `repeat_promiser` (F1 0,505) y `escape` (F1 0,576) son débiles. El recall bajo en hardship es el fallo más sensible desde el punto de vista ético.
- Degradación con cuantización: NF4 baja la accuracy de 0,645 a 0,605, unos 4 puntos porcentuales.
- Dominio muy estrecho: el modelo solo está entrenado para el formato y la tarea descritos. Fuera de ese prompt y de ese vocabulario de cobro en hinglish/kanglish, su comportamiento no está caracterizado.
- Cobertura de idiomas limitada a inglés, hindi y canarés en el contexto de llamadas code-mixed. No hay evidencia de funcionamiento en castellano ni en otras lenguas.
- Sesgos no evaluados: la model card no documenta análisis de sesgo por género, región, nivel socioeconómico ni por tipo de cartera. Los datos provienen de 1.680 cuentas de un único conjunto de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el cumplimiento normativo en cobranza (divulgación a terceros, lenguaje amenazante, protección de casos de hardship) es responsabilidad del integrador, no del modelo.
- Madurez: el repositorio no tiene descargas ni «me gusta» registrados y fue publicado en octubre de 2026, por lo que no existe validación externa independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Shubhbagaria12/QWEN_OPENIIT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio GitHub del proyecto (rama `FINAL`, con código, pipeline de datos, modelos tabulares y aplicación web): URL no disponible en la model card
- Página oficial de Qwen: https://qwen.ai/home
- Gobernanza de IA de Qwen en Alibaba Group: https://home.alibabagroup.com/en-US/ai-governance/qwen
- Guía de la familia Qwen 3 (0,6 B a 72 B): https://baeseokjae.github.io/posts/qwen-3-full-lineup-guide-2026/
- Análisis de la familia Qwen y licencias: https://llmshed.com/models/qwen/
- Noticia sobre el lanzamiento de Qwen3.8-27B: https://cybernews.com/tech/qwen-38-27b-ai-model-debuts-with-million-downloads/
