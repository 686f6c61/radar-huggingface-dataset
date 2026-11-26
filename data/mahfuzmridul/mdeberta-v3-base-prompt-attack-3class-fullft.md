# mahfuzmridul/mdeberta-v3-base-prompt-attack-3class-fullft

## Resumen

mDeBERTa-v3-base-prompt-attack-3class-fullft es un clasificador de texto de tres clases desarrollado por mahfuzmridul para detectar prompts adversariales dirigidos a modelos de lenguaje. Distingue entre entradas benignas, intentos de prompt injection (manipulación de la jerarquía de instrucciones) y jailbreak (elusión de políticas de seguridad). El modelo parte de microsoft/mdeberta-v3-base, un encoder transformer de 278,8 millones de parámetros, y se ha afinado completamente (todos los pesos) sobre un corpus en inglés de aproximadamente 300 000 filas construido a partir de conjuntos de datos publicados.

El modelo se enmarca en una tesis titulada *Source-Robust Three-Class Detection of Prompt Injection and Jailbreak Attacks Using Encoder Transformers, Full Fine-Tuning and LoRA*, y su interés radica en la evaluación explícita de robustez frente a cambios de fuente: además del test en distribución, publica métricas sobre un test emparejado por longitud y un test con fuentes retenidas (source-held-out), lo que revela la brecha entre rendimiento aparente y generalización real. Es relevante para equipos que despliegan LLM y necesitan una capa de filtrado previa de bajo coste y baja latencia.

La longitud máxima de entrada es de 512 tokens con una política de truncado `head_tail` (25 % inicial y 75 % final), una decisión de diseño que el autor exige replicar para obtener resultados comparables. La licencia es MIT y los pesos están en safetensors, con soporte para text-embeddings-inference y endpoints compatibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v2, mDeBERTa-v3-base) con cabeza de clasificación de secuencias |
| Parámetros totales | 278 811 651 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncado `head_tail`: 25 % cabeza + 75 % cola) |
| Tipos de cuantización | no disponible (entrenado en torch.float16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder DeBERTa-v2 en su variante multilingüe v3 base, con atención disentangled y embeddings de posición relativos, sobre el que se añade una cabeza lineal de clasificación de tres etiquetas (0 benign, 1 prompt_injection, 2 jailbreak). El ajuste es completo: los 278 811 651 parámetros son entrenables (100 %), sin LoRA ni congelación de capas.

Los datos proceden de un benchmark curado en inglés de tres clases con 300 000 filas provenientes de conjuntos publicados; el split de entrenamiento tiene 209 654 filas y la validación 41 983, con parada temprana sobre macro-F1 de validación (paciencia 2). Hiperparámetros: learning rate 3e-05, batch efectivo 32, warm-up 0.06, weight decay 0.01, precisión torch.float16, manejo de desbalanceo mediante pesos por clase y decaimiento de learning rate por capa de 0.9. El entrenamiento consumió 13 102 pasos, 120,1 minutos en 2 × Tesla T4 y un pico de 10,6 GB de memoria por GPU. Parte de los datos de entrenamiento es sintética (WildJailbreak, ReNeLLM, SecAlign, BIPIA-GPT). No se documenta uso de RLHF ni DPO, al tratarse de una tarea de clasificación supervisada.

## Capacidades

- Clasificación de texto en tres clases con probabilidades por etiqueta: benign, prompt_injection y jailbreak.
- Detección de manipulación de la jerarquía de instrucciones (por ejemplo, instrucciones que intentan sobrescribir el system prompt).
- Detección de elusión de políticas de seguridad (jailbreak).
- Salida de logits y probabilidades apta para umbrales configurables por caso de uso.
- Procesamiento de entradas largas hasta 512 tokens mediante truncado `head_tail`, pensado para conservar tanto el inicio como el final del prompt.
- Inferencia rápida y de bajo coste propio de un encoder de 278 M de parámetros, apta para filtrado previo en línea.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento; es exclusivamente un clasificador.
- Capacidad multilingüe: no disponible; el modelo está entrenado y evaluado solo en inglés pese a partir de un backbone multilingüe.

## Casos de uso

- Filtrado previo de prompts en un gateway de LLM: cada petición entrante se clasifica antes de llegar al modelo generativo; si la probabilidad de prompt_injection o jailbreak supera un umbral, se bloquea o se redirige. La latencia de un encoder de 278 M es compatible con un proxy en línea.
- Moderación de entradas en aplicaciones de chat multi-turno: se puede aplicar por turno para detectar intentos de manipulación del system prompt en conversaciones de atención al cliente o asistentes internos.
- Protección de pipelines RAG: los documentos y consultas recuperadas pueden pasar por el clasificador para detectar inyecciones indirectas embebidas en contenido externo, un escenario que el autor evalúa en el tier 3 de su análisis de falsos positivos (documentos embebidos).
- Evaluación de red teaming: uso como etiquetador automático de grandes lotes de prompts generados por herramientas de ataque, para medir la tasa de éxito de un conjunto de jailbreaks contra un sistema desplegado.
- Monitorización y auditoría de tráfico: clasificación por lotes de logs de conversaciones para identificar patrones de ataque y generar alertas de seguridad sin intervención humana.
- Investigación en seguridad de LLM: reproducción de la comparativa full fine-tuning frente a LoRA de la tesis, gracias a que el repositorio incluye predicciones y logs en `runs/`.
- Prefiltro en sistemas de confianza cero para agentes: validar las instrucciones que llegan desde fuentes no confiables (correos, webs, herramientas externas) antes de que el agente las ejecute.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Vista de test | n | macro-F1 (IC 95 %) | accuracy | F1 benign | F1 injection | F1 jailbreak |
|---|---:|---|---:|---:|---:|---:|
| Test en distribución | 40 817 | 0,9726 (0,9711-0,9742) | 0,9736 | 0,9683 | 0,9888 | 0,9608 |
| Test emparejado por longitud | 15 288 | 0,9556 (0,9523-0,9588) | 0,9558 | 0,9464 | 0,9784 | 0,9421 |
| Test con fuentes retenidas | 6 277 | 0,7849 (0,7741-0,7954) | 0,8007 | 0,8662 | 0,7346 | 0,7538 |

Tasa de falsos positivos sobre benignos en el split de test (sobredetección): tier 1 (general) 0,0080; tier 2 (adyacente a ataques) 0,0279; tier 3 (documentos embebidos) 0,0286. Brecha de atajo (macro-F1 en test menos macro-F1 con fuentes retenidas): +0,1878.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,6 GB para los pesos (278 M de parámetros), más overhead de activaciones y tokenizador; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- Entrenamiento documentado: 2 × Tesla T4 con un pico de 10,6 GB por GPU y 120,1 minutos para 13 102 pasos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para lotes grandes o entrenamiento, A100 o H100 aportan margen.
- Cabe en GPU consumer: sí, sin cuantización, en tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), text-embeddings-inference, endpoints compatibles; al ser un encoder estándar también es desplegable con TGI o inferencia por lotes en CPU.
- Latencia y throughput: no se han publicado mediciones de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mahfuzmridul/mdeberta-v3-base-prompt-attack-3class-fullft | 278,8 M | 512 tokens | Clasificación 3 clases (benign/injection/jailbreak), inglés | MIT | Hugging Face |
| microsoft/mdeberta-v3-base (base) | 278,8 M | 512 tokens | Encoder general, sin cabeza de seguridad | MIT | Hugging Face |
| ProtectAI/deberta-v3-base-prompt-injection-v2 | no disponible en la información proporcionada | no disponible | Detección binaria de prompt injection | no disponible | Hugging Face |
| Meta Prompt Guard (Llama Prompt Guard) | no disponible en la información proporcionada | no disponible | Detección de injection/jailbreak | no disponible | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de los modelos de la competencia no se han verificado en esta ficha.

## Limitaciones y advertencias

- Solo inglés: el modelo no se ha entrenado ni evaluado en castellano ni en otros idiomas, por lo que su comportamiento fuera del inglés es indefinido.
- Las clases son una separación operativa: un mismo ataque real puede ser simultáneamente prompt injection y jailbreak, lo que genera ambigüedad de etiqueta.
- Las peticiones dañinas sin marco de manipulación (por ejemplo, una solicitud directa de contenido peligroso sin instrucciones que la camuflen) no constituyen una clase propia; la salida del modelo ante ellas es indefinida.
- Parte de los datos de entrenamiento es sintética (WildJailbreak, ReNeLLM, SecAlign, BIPIA-GPT), lo que puede introducir artefactos de estilo que no se trasladan a ataques reales.
- Brecha de generalización notable: la macro-F1 cae de 0,9726 en distribución a 0,7849 con fuentes retenidas (+0,1878 de brecha de atajo), lo que indica dependencia de señales superficiales del corpus de entrenamiento.
- Tasa de falsos positivos no trivial en contenido adyacente a ataques (0,0279) y en documentos embebidos (0,0286), con riesgo de bloquear tráfico legítimo en esos contextos.
- Riesgo de alucinación no aplica directamente (es un clasificador), pero sí de calibración deficiente fuera de distribución.
- Licencia MIT: permite uso comercial, pero no hay garantías ni soporte del autor; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- El truncado `head_tail` es parte del contrato de entrenamiento; usar otro esquema de truncado degrada la comparabilidad de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahfuzmridul/mdeberta-v3-base-prompt-attack-3class-fullft
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Repositorio de predicciones y logs: carpeta `runs/` del repositorio de Hugging Face del modelo
- Paper o publicación de la tesis: no disponible en la información proporcionada
