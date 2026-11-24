# JohnP1/d1a-e2b-it-qat-coreml

## Resumen

D1A-E2B-it QAT Core ML es la conversión a Core ML del modelo de decisión D1A, derivado a su vez de google/gemma-4-E2B-it-qat-w4a16-ct. Lo desarrolla JohnP1 y su propósito no es generar texto libre, sino responder preguntas cerradas sobre un documento: cada pregunta es de sí/no, de elección múltiple o de puntuación, y el modelo devuelve en un único forward pass una probabilidad calibrada para cada opción. Al no producir texto generado, toda respuesta es necesariamente una opción válida, lo que elimina el riesgo de respuestas fuera de formato.

El modelo mantiene el tronco de Gemma 4 E2B cuantizado a 4 bits con quantisation-aware training (QAT) y añade un adaptador de decisión, una cabeza de puntero y una temperatura de calibración (1,91 en la versión 0.7). Con el adaptador desactivado, el mismo artefacto se comporta como Gemma 4 E2B-it QAT y mantiene capacidad de chat. La versión 0.7 se ha afinado sobre actos de diálogo e intenciones en inglés y japonés, con una mejora reportada de +15,9 puntos en actos de diálogo sobre 498 preguntas reservadas.

La relevancia actual está en el despliegue on-device sobre Apple Silicon: el paquete ocupa 4,6 GB, funciona en GPU mediante Core ML y está pensado para aplicaciones que necesitan clasificar y decidir localmente sin enviar documentos a la nube. Es un proyecto experimental, verificado solo en Mac (M1 Max) y todavía no probado en iPhone ni iPad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B) con adaptador de decisión y cabeza de puntero, convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.536 tokens para decisiones y prompts de chat; 2.048 posiciones en total (prompt más respuesta) |
| Tipos de cuantizacion | 4 bits con QAT en el tronco (w4a16); adaptador en fp16 |
| Idiomas soportados | inglés y japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquetes `trunk_*`, `head.safetensors`, `d1a_config.json`, `io.json`) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B-it con cuantización de 4 bits entrenada con QAT (w4a16), sobre la que se injerta un adaptador de decisión como rama fp16 independiente dentro de cada paquete `trunk_*`. El adaptador consta de 410 tensores y afecta únicamente a las proyecciones del tronco de texto; los encoders, el `lm_head`, los embeddings y los ficheros de golden de la versión 0.6 permanecen sin cambios. La conversión a Core ML está configurada para GPU (`compute_units` ALL o CPU_AND_GPU), no para Neural Engine.

El ajuste de la versión 0.7 se realizó sobre actos de diálogo e intenciones en inglés y japonés, usando el dataset AmazonScience/massive como referencia declarada. La calibración se ajustó con una temperatura de 1,91 (frente a 1,55 en 0.6). Según la model card, la mejora en actos de diálogo es de +15,9 puntos [+12,2, +19,7] sobre 498 preguntas reservadas, la clasificación de intenciones no cambia y el resto de suites D1A agrupadas arroja −0,38 (no significativo), con una calibración ligeramente peor en algunas suites. La sustitución de pesos se verificó byte a byte: reescribir los tensores de 0.6 reproduce paquetes idénticos por sha256.

## Capacidades

- Clasificación y decisión sobre documentos: responde preguntas de sí/no, elección múltiple y puntuación con probabilidad calibrada por opción en un solo forward pass.
- Actos de diálogo e intenciones: distingue acuerdos, rechazos, agradecimientos, peticiones y comandos, con mejora específica en la versión 0.7.
- Chat conversacional: con el adaptador desactivado se comporta como Gemma 4 E2B-it QAT.
- Multimodalidad: procesa fotos, clips de voz y vídeo (16 fotogramas por clip en las pruebas).
- Salida estructurada por construcción: al elegir entre opciones, no hay texto generado ni respuestas inválidas.
- Decodificación greedy en el runner de referencia.
- Capacidades multilingües limitadas a inglés y japonés.

## Casos de uso

- Triaje documental local: dado un contrato o informe y una batería de preguntas cerradas, el modelo devuelve probabilidades por opción en una sola pasada, adecuado para flujos donde no se puede enviar el documento a un servicio externo.
- Verificación de consentimiento y conformidad: preguntas de sí/no con umbral de confianza (por encima de 0,6) para decidir si un usuario ha aceptado una condición, integrable en apps de escritorio macOS.
- Análisis de conversaciones de soporte: clasificación de actos de diálogo e intenciones en inglés y japonés para etiquetar tickets y detectar acuerdos, rechazos o peticiones.
- Asistencia por voz on-device: clips de audio procesados en aproximadamente 0,4 s por petición en M1 Max, útil para dictado con intención o comandos hablados.
- Revisión de fotos y vídeo con preguntas cerradas: por ejemplo, comprobar presencia de elementos en una imagen o en un clip corto, con la advertencia de que el vídeo tarda entre 8 y 11 s por clip de 16 fotogramas.
- Enrutado de comandos en aplicaciones de Apple Silicon: distinguir si una entrada es un comando o conversación informal antes de derivarla a otro componente.
- Preetiquetado de datasets: generar probabilidades calibradas para revisión humana en tareas de clasificación de intenciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta únicamente comprobaciones internas:

| Comprobacion | Resultado |
|---|---|
| 28 peticiones de decisión (42 respuestas) frente a MLX v0.7 | misma respuesta en las 42; cambio máximo de probabilidad 0,028, medio 0,005 |
| Las respuestas son de v0.7 y no de v0.6 | cambio medio 0,005 frente a MLX v0.7 y 0,044 frente a Core ML v0.6; desactivar el adaptador mueve una respuesta hasta 0,39 |
| Reproduccion del check de v0.6 en el mismo Mac | respuestas coincidentes con tolerancia de 0,00005 |
| 14 peticiones multimedia (28 respuestas) frente a MLX v0.7 | cambio máximo de 0,068 en respuestas multimedia y 0,048 en decisiones |
| Actos de dialogo v0.7 sobre 498 preguntas reservadas | +15,9 puntos [+12,2, +19,7] |

## Requisitos de hardware

- VRAM o memoria unificada: el paquete ocupa 4,6 GB en disco; el repositorio completo pesa 5,7 GB.
- GPU recomendadas: Apple Silicon con GPU compatible con Core ML; verificado en Apple M1 Max.
- No probado en iPhone ni iPad; el Neural Engine no está soportado (requiere otro layout de pesos no construido).
- Despliegue: Core ML con `compute_units` ALL o CPU_AND_GPU, más el runner de referencia en Python (`reference/d1a_coreml_qat.py`). No hay app ni servidor listos.
- Latencia observada en M1 Max: aproximadamente 0,4 s por petición en fotos y voz; 0,9 s de codificación y 8-11 s de respuesta por clip de vídeo de 16 fotogramas (unos 1.200 tokens con tamaño 1.536).
- No hay datos de throughput agregado ni de despliegue con vLLM, llama.cpp, Ollama o TGI, ya que el formato es Core ML.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| D1A-E2B-it QAT Core ML | no disponible | 1.536 / 2.048 posiciones | Core ML | Apache 2.0 | Decisión calibrada on-device, multimodal, en y ja |
| JohnP1/d1a-e2b-it-qat-mlx-q4 | no disponible | no disponible | MLX | Apache 2.0 | Misma familia en MLX; referencia de paridad para la conversión Core ML |
| google/gemma-4-E2B-it-qat-w4a16-ct | no disponible | no disponible | no disponible | no disponible | Modelo base de Google; chat generalista sin adaptador de decisión |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Verificado solo en Mac (M1 Max, macOS, GPU); sin pruebas en iPhone ni iPad.
- El Neural Engine no está soportado; solo GPU o CPU.
- No incluye aplicación ni servidor: el repositorio contiene los modelos Core ML, los datos de host y un runner de referencia en Python.
- Límites de longitud: decisiones hasta 1.536 tokens (dos tamaños de prefill, 512 y 1.536); chat hasta 1.536 tokens de prompt y 2.048 posiciones totales.
- El vídeo es lento en Mac: 8-11 s por clip de 16 fotogramas en M1 Max.
- Las respuestas sobre fotos, voz y vídeo son menos exactas que las decisiones: cambio máximo de 0,068 frente al modelo de precisión completa en 28 respuestas multimedia.
- En actos de diálogo, algunos rechazos y matices se leen como acuerdo; conviene confirmar cuando la probabilidad superior esté por debajo de 0,6.
- Solo inglés y japonés.
- Proyecto experimental: los cambios entre versiones afectan al adaptador, la cabeza de puntero y la temperatura de calibración, y la actualización in-place exige borrar la carpeta `.compiled/`.
- Riesgo de sesgo y alucinación no cuantificado en la información disponible; al no generar texto libre, el riesgo de respuestas inválidas se reduce, pero no el de una clasificación errónea con alta confianza.
- Licencia Apache 2.0, que permite uso comercial; conviene revisar las condiciones del modelo base de Google.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JohnP1/d1a-e2b-it-qat-coreml
- Modelo MLX de referencia: https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct
- Dataset de referencia: https://huggingface.co/datasets/AmazonScience/massive
- Repositorio del proyecto (referenciado en la model card): https://github.com/jonpol01/d1a
- Incidencias citadas: jonpol01/d1a#386 y jonpol01/d1a#394
