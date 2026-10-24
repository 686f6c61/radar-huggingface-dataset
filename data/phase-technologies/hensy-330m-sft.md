# Phase-Technologies/hensy-330m-sft

## Resumen

Hensy-330M-SFT es un modelo de lenguaje causal denso de 328,5 millones de parámetros, desarrollado por Phase Technologies (Soham Pal) y publicado bajo licencia Apache 2.0. Se trata del checkpoint alineado por instrucciones del modelo Hensy-330M, que fue preentrenado desde cero sobre 5.000 millones de tokens y posteriormente ajustado con Supervised Fine-Tuning (SFT) sobre 20 millones de tokens de diálogo multiturno. El objetivo declarado es ofrecer un asistente conversacional ligero que quepa en hardware de consumo y pueda ejecutarse incluso en CPU o en una GPU T4 gratuita de Google Colab.

La arquitectura es un transformer denso Pre-LayerNorm de 24 capas, dimensión oculta 768, 12 cabezas de atención con RoPE y SDPA, weight tying y un vocabulario propio de 206.464 tokens (tokenizer CRAYON Turbo). El modelo se distribuye con código Python propio (config.py y model.py) en lugar de usar la clase estándar de Transformers, lo que condiciona fuertemente su despliegue: no hay integración nativa con vLLM, llama.cpp ni Ollama.

Su relevancia es doble. Por un lado, es un ejemplo de entrenamiento de un modelo fundacional completo con presupuesto reducido (4× NVIDIA H100 80GB SXM5 en RunPod, a más de 565.000 tokens por segundo). Por otro, es un caso útil para estudiar el coste de un vocabulario sobredimensionado: con 206.464 entradas y weight tying, la matriz de embeddings supone aproximadamente 158,6 millones de parámetros (cálculo derivado de la configuración publicada), es decir, cerca de la mitad del total del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal, Pre-LayerNorm, 24 capas, 768 de dimensión oculta, 12 cabezas de atención, RoPE + SDPA, weight tying |
| Parametros totales | 328,5 M (referido comercialmente como 330M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card ni en la configuración publicada) |
| Tipos de cuantizacion | no disponible: solo se publican pesos en BF16; no hay GGUF, AWQ, GPTQ ni MLX oficiales. La cuantización requeriría convertir una arquitectura y un tokenizer propios |
| Idiomas soportados | en (inglés únicamente, según los tags y la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en BF16, acompañado de config.py y model.py (código propio) y del tokenizer CRAYON Turbo (paquete `xerv-crayon`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso puro, no MoE ni híbrido SSM, con normalización Pre-LayerNorm, 24 capas, dimensión oculta de 768 y 12 cabezas de atención (dimensión por cabeza de 64, derivada de la configuración). Usa embeddings rotatorios (RoPE) y atención escalada de producto punto (SDPA) de PyTorch, además de weight tying entre la matriz de entrada y la de salida. El vocabulario es de 206.464 tokens mediante el tokenizer CRAYON Turbo, que se carga a través de un wrapper propio (`ForgeTokenizer`) y el paquete externo `xerv-crayon`. El preentrenamiento se hizo con BF16 nativo en un clúster de 4× NVIDIA H100 80GB SXM5 con NVLink, sobre 5.000 millones de tokens y a un throughput superior a 565.000 tokens por segundo; la pérdida bajó de 12,4 a 4,3 a lo largo de ese entrenamiento, según el autor.

El postentrenamiento consistió únicamente en SFT sobre 20 millones de tokens de diálogo conversacional multiturno, con enmascaramiento de la pérdida a nivel de token para las respuestas del asistente (per-token assistant loss masking). No se menciona ninguna fase de RLHF, DPO, RLVR ni preferencias; la alineación se limita, por tanto, a la imitación de diálogos. El autor documenta que el proyecto surgió tras detectar un fallo de "identity copy shortcut" en experimentos previos y reescribir el bucle de entrenamiento desde cero. El formato de prompt es fijo y no estándar: `<|USR|>mensaje<|/USR|>\n<|ASST|>respuesta<|/ASST|>`, con tokens especiales `<|eos|>` y sin uso de BOS/EOS en la codificación de ejemplo.

## Capacidades

- Generación de texto conversacional en inglés con formato de turnos del usuario y del asistente.
- Respuesta a preguntas generales y explicaciones breves (el ejemplo de la model card es "What is machine learning?").
- Conversación multiturno básica, gracias al entrenamiento SFT sobre diálogos multiturno con enmascaramiento de pérdida del asistente.
- Generación con parámetros de decodificación configurables: `max_new_tokens`, `temperature` y `repetition_penalty` (el ejemplo usa 1,15 para mitigar repeticiones).
- Inferencia en CPU y en GPU (BF16 en CUDA con soporte de bf16, FP32 en caso contrario).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explícito (thinking mode), visión, audio ni capacidades multimodales.
- No se documenta capacidad multilingüe: el modelo está entrenado y etiquetado solo para inglés.

## Casos de uso

- Asistente conversacional embebido en aplicaciones de escritorio o móviles: con unos 657 MB en BF16 (328 MB en FP32 aproximado no aplica; en FP32 serían ~1,31 GB) el modelo cabe en memoria de dispositivos modestos y puede responder en local sin enviar datos a la nube, algo relevante para privacidad.
- Prototipado rápido y docencia: el snippet de una sola celda de Colab permite cargar el modelo en una T4 gratuita o en CPU, lo que lo hace útil para demostrar el ciclo completo preentrenamiento + SFT en un modelo pequeño.
- Generación de texto de relleno y plantillas: descripciones cortas, resúmenes de una frase o textos de formulario donde no se requiere razonamiento profundo y prima el coste por token casi nulo.
- Chatbot de FAQ de dominio cerrado: tras un fine-tuning adicional sobre pares pregunta-respuesta específicos, puede servir como primera línea de atención en inglés para consultas frecuentes, con derivación a un humano cuando la confianza sea baja.
- Base para investigación en alineación a pequeña escala: su tamaño permite reproducir experimentos de SFT, comparar estrategias de enmascaramiento de pérdida o estudiar el efecto de la tokenización con vocabularios grandes sin grandes presupuestos de cómputo.
- Generación de datos sintéticos y aumentación: puede producir variaciones de frases o pares de diálogo en inglés para alimentar otros pipelines, siempre con revisión humana dado su tamaño.
- Evaluación de infraestructura de inferencia: útil como carga de trabajo mínima para medir latencia, throughput y consumo energético de un entorno de despliegue antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni de evaluaciones conversacionales (MT-Bench, AlpacaEval), ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,66 GB con pesos en BF16 y aproximadamente 1,31 GB en FP32 (cálculo a partir de 328,5 M de parámetros). El repositorio ocupa 4,3 GB, probablemente por incluir checkpoints y estados auxiliares, pero la inferencia solo necesita el fichero `final/model.safetensors`.
- Memoria de caché KV: aproximadamente 72 KiB por token de contexto (24 capas × 12 cabezas × 64 dimensiones × 2 tensores × 2 bytes), estimación derivada de la arquitectura; al no publicarse la longitud de contexto, el consumo total de la caché no puede acotarse.
- GPU recomendadas: cualquier GPU con soporte BF16 o FP16, desde una NVIDIA T4 (16 GB) hacia arriba. Una RTX 4090, L4, A10G, A100 o H100 queda enormemente sobredimensionada; el modelo está pensado para hardware mucho menor.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), y también en CPU con unos 2 GB de RAM libre.
- Opciones de despliegue: únicamente carga manual mediante `config.py`, `model.py` y `safetensors.torch.load_file`, tal como muestra la model card. No hay soporte oficial para vLLM, TGI, llama.cpp, Ollama, LM Studio ni Transformers (`AutoModelForCausalLM`), porque la arquitectura y el tokenizer son propietarios. Cualquier otro runtime requeriría una conversión previa.
- Latencia y throughput de inferencia: no disponibles. El único dato de rendimiento publicado es de entrenamiento (más de 565.000 tokens por segundo en 4× H100 80GB SXM5).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Pesos estándar (llama.cpp / vLLM) | Benchmarks publicados |
|---|---|---|---|---|---|---|
| Hensy-330M-SFT | 328,5 M (denso) | no disponible | Apache 2.0 | en | No (código y tokenizer propios) | No |
| SmolLM2-360M (HuggingFace) | 361 M (denso) | 8.192 tokens (según su model card) | Apache 2.0 | en (multilingüe parcial) | Sí (GGUF, Transformers, vLLM) | Sí |
| Qwen2.5-0.5B (Alibaba) | 0,49 B (denso) | 32.768 tokens | Apache 2.0 | multilingüe (incluye español) | Sí (GGUF, AWQ, Transformers, vLLM) | Sí |
| Pythia-410M (EleutherAI) | 410 M (denso) | 2.048 tokens | Apache 2.0 | en | Sí (Transformers, GGUF comunitario) | Sí |

La diferencia práctica principal no es el tamaño, sino el ecosistema: los tres modelos comparables se cargan con Transformers y disponen de cuantizaciones GGUF listas para llama.cpp y Ollama, mientras que Hensy-330M-SFT exige su propio código y tokenizer. En volumen de entrenamiento, Hensy declara 5.000 millones de tokens de preentrenamiento, un orden de magnitud por debajo de lo habitual en modelos de su clase.

## Limitaciones y advertencias

- Contexto desconocido: la model card no publica la longitud máxima de contexto, por lo que no se puede garantizar el comportamiento en conversaciones largas ni planificar la memoria de la caché KV.
- Solo inglés: no hay datos de entrenamiento ni evaluación en castellano; el rendimiento en otros idiomas será con toda probabilidad deficiente.
- Alucinación: con 328,5 M de parámetros, 5.000 millones de tokens de preentrenamiento y sin RLHF, la tasa de afirmaciones incorrectas y de invención de hechos es alta. El propio autor describe el SFT como sustituto de "heavy alignment crutches", lo que sugiere una alineación mínima.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad ni seguridad. El dataset de SFT (20 M de tokens) no está descrito en composición ni procedencia.
- Riesgo de repetición y degradación: el snippet oficial aplica `repetition_penalty=1.15`, lo que indica que el modelo puede entrar en bucles sin ese ajuste.
- Acoplamiento al código: requiere `xerv-crayon` y los ficheros `config.py`/`model.py` del repositorio; cualquier actualización de estas dependencias puede romper la carga. El `load_state_dict` se ejecuta con `strict=False`, por lo que una incompatibilidad de pesos podría pasar desapercibida de forma silenciosa.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero no hay garantías ni cláusulas de responsabilidad por el contenido generado; el usuario asume el cumplimiento normativo (por ejemplo, obligaciones de transparencia del Reglamento europeo de IA si se despliega como chatbot).
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en octubre de 2026; no hay evidencia de uso en producción ni informes independientes de calidad.
- No apto para tareas de razonamiento complejo, matemáticas, código o agentes: no se ha entrenado ni evaluado para ello y no dispone de tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Phase-Technologies/hensy-330m-sft
- Modelo base (preentrenamiento): https://huggingface.co/Phase-Technologies/hensy-330m-pretrain
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Google Colab (entorno sugerido por el autor): https://colab.research.google.com/
- RunPod (proveedor de infraestructura de entrenamiento citado por el autor): https://www.runpod.io
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; los enlaces obtenidos eran definiciones de diccionario de la palabra francesa "phase" y se han descartado. No se dispone de paper, blog técnico ni demo adicionales.
