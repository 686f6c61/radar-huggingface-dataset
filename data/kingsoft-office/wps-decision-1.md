# Kingsoft-Office/wps-decision-1

## Resumen

wps-decision-1 es un modelo de decisión especializado desarrollado por Kingsoft-Office (la empresa detrás de WPS Office) y publicado bajo licencia Apache-2.0. Se trata de un fine-tune del modelo vllm-sr/d3-flash, un backbone multimodal Qwen3.5-9B con una cabeza de lectura de decisiones de 255 códigos. A diferencia de un LLM generativo convencional, el modelo no produce texto: recibe un `state` compartido (texto, JSON, imágenes o vídeos) junto con un conjunto de preguntas nombradas y devuelve directamente probabilidades para clasificación, juicios binarios y valoraciones ordenadas.

La propuesta encaja en la categoría de "system-one": un modelo de respuesta rápida y directa que evita la generación autoregresiva de texto y emite la decisión en un único pase de lectura sobre el estado de entrada. Esto lo hace adecuado para tareas de enrutamiento, triaje y clasificación donde la latencia y la consistencia importan más que la expresividad lingüística.

El modelo tiene 8.394 millones de parámetros (incluyendo un codificador visual de 0,456B), configuración de contexto de 262.144 posiciones y soporte para hasta 255 candidatos en preguntas de tipo `choice`, entre 2 y 255 niveles en preguntas de tipo `score`, y juicios binarios en `noul`. Es relevante ahora porque ofrece una interfaz de decisión estructurada y multimodal sobre un backbone moderno, con despliegue validado en vLLM y una sola GPU consumer de gama alta (RTX 5090).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | d3-flash: backbone multimodal Qwen3.5-9B + cabeza de decisión de 255 códigos |
| Parametros totales | 8.394 millones (incluye 0,456B del codificador visual) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 posiciones (límite de configuración, no garantía de memoria) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; la model card no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` y `trust_remote_code`); precisión BF16 en backbone y FP32 en la lectura de decisión y softmax |
| Pipeline | zero-shot-classification |
| Modelo base | vllm-sr/d3-flash (finetune) |
| Tamaño del repositorio | 53,7 GB |

## Arquitectura y entrenamiento

El modelo parte del backbone d3-flash, que combina un transformer multimodal Qwen3.5-9B con una cabeza de lectura de decisión de 255 códigos. La arquitectura mezcla capas de atención completa, que atienden de forma bidireccional sobre la entrada, con capas Gated DeltaNet que mantienen su escaneo causal. Esta hibridación permite procesar estados largos y multimodales sin renunciar a la eficiencia de las capas de estado. Cada pregunta se procesa en su propio forward pass, y el runtime agrupa (batching) las preguntas para aprovechar el paralelismo.

La innovación principal respecto al modelo base es la extensión del validador de puntuaciones de 2–10 a **2–255 niveles ordenados**, reutilizando la lectura de códigos de respuesta ya existente. El modelo no genera texto: la salida es una distribución de probabilidad sobre los códigos de decisión. Los detalles concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están documentados en la información disponible. El modelo se distribuye con `readout.safetensors`, tokenizer, chat template y `decision_config.json`, todos necesarios para que la inferencia funcione; cargar solo el backbone no implementa decisiones.

## Capacidades

- Clasificación con hasta 255 candidatos mediante preguntas de tipo `choice`.
- Valoraciones ordenadas con entre 2 y 255 niveles mediante preguntas de tipo `score`.
- Juicios binarios (sí/no) mediante preguntas de tipo `noul`.
- Entrada multimodal: texto, JSON, imágenes (hasta 1,6 MP por imagen) y vídeo (muestreo a 2 FPS, máximo 32 fotogramas, hasta 0,2 MP por fotograma).
- Procesamiento de múltiples preguntas sobre un mismo `state`, con batching por parte del runtime.
- Interfaz de decisión estructurada sin generación de texto, orientada a latencia baja y salidas consistentes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el modelo es de tipo "system-one" y no de razonamiento encadenado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como `state` y devuelve, en un solo pase, la probabilidad de asignación a equipos (devoluciones, facturación, técnico) y un nivel de urgencia de 2–255. Adecuado por su baja latencia y por no requerir generación de texto.
- Enrutamiento en atención al cliente: con preguntas de tipo `choice` sobre categorías predefinidas, permite clasificar consultas entrantes y derivarlas al flujo correcto sin coste de decodificación autoregresiva.
- Moderación y verificación binaria: preguntas `noul` sobre si un contenido cumple una política concreta, con la ventaja de que el resultado es una probabilidad calibrada y no una respuesta libre sujeta a alucinación textual.
- Análisis de documentos con imágenes: al aceptar imágenes de hasta 1,6 MP, puede clasificar capturas, formularios escaneados o documentos visuales junto con su contexto textual en el mismo `state`.
- Inspección de vídeo para clasificación: con muestreo a 2 FPS y hasta 32 fotogramas, sirve para etiquetar clips cortos (por ejemplo, detección de incidencias o categorización de contenido) devolviendo probabilidades por categoría.
- Puntuación de calidad o riesgo en pipelines: la escala de 2–255 niveles permite sustituir clasificadores ad hoc por un modelo único que devuelve una valoración ordenada y granular sobre el mismo estado de entrada.
- Extracción de señales estructuradas desde JSON: al aceptar JSON como `state`, puede emitir decisiones sobre registros estructurados en procesos de validación o priorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 8.394 millones de parámetros en BF16, el peso de los pesos ronda los 16,8 GB; el repositorio ocupa 53,7 GB, lo que sugiere artefactos adicionales (lectura FP32, tokenizer, posible material auxiliar).
- Hardware validado por el autor: una NVIDIA RTX 5090 con Linux x86-64 y driver compatible con CUDA 13.0.
- GPU recomendadas: RTX 5090 (validada); A100 y H100 no están documentadas explícitamente, pero por tamaño de modelo serían viables.
- Cabe en GPU consumer: sí, al menos en RTX 5090 según la validación del autor; otras consumer no están documentadas.
- Opciones de despliegue: vLLM (versión nightly fijada en el commit `df3bd094aeea829f27baa0a5282830464f601d9f`), Transformers 5.17.0 con `trust_remote_code=True`, y el script `inference.py` incluido. El servicio vLLM expone `/v1/systemone`, `/health` y `/v1/models`.
- Latencia y throughput estimados: no disponibles. El despliegue de referencia usa `--max-model-len 32768`, `--max-num-seqs 64`, `--max-num-queued-reqs 512` y `--gpu-memory-utilization 0.9`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wps-decision-1 | 8,394B | 262.144 posiciones | Modelo de decisión multimodal (sin generación de texto) | Apache-2.0 | Hugging Face (Kingsoft-Office) |
| vllm-sr/d3-flash | no disponible | no disponible | Backbone multimodal base | no disponible | Hugging Face (vllm-sr) |
| Qwen3.5-9B (backbone subyacente) | ~9B | no disponible | LLM multimodal generativo | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo no genera texto: solo emite probabilidades sobre códigos de decisión. No es adecuado para tareas de generación, resumen o diálogo abierto.
- La configuración de contexto (262.144 posiciones) es un techo de posiciones, no una garantía de que cualquier longitud de entrada quepa en memoria GPU. Entradas largas requieren memoria adicional.
- La configuración de decisión suministrada no impone un límite adicional de longitud (`max_length: null`); las entradas no se truncan silenciosamente, lo que puede provocar errores de memoria con entradas muy largas.
- Es imprescindible conservar `readout.safetensors`, el tokenizer, el chat template y `decision_config.json` junto a los pesos del backbone; cargar solo el backbone no implementa decisiones.
- La inferencia requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código antes de desplegarlo en producción.
- Existe una release v1.1 con pesos y código de inferencia distintos; usar la revisión adecuada (`revision="v1.0"` o `--revision v1.0`) para evitar mezclar artefactos.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades de decisión pueden estar mal calibradas en dominios alejados de los datos de entrenamiento; no hay datos de calibración publicados.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las dependencias del código personalizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kingsoft-Office/wps-decision-1
- Release v1.1: https://huggingface.co/Kingsoft-Office/wps-decision-1/tree/v1.1
- Modelo base d3-flash: https://huggingface.co/vllm-sr/d3-flash
- Guía de uso upstream (quickstart): https://huggingface.co/vllm-sr/d3-flash#quickstart
