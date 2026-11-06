# JohnP1/d1a-e4b-it-qat

## Resumen

D1A-E4B-it QAT es un adaptador LoRA de rango 16 con una cabeza de decisión (pointer head) que convierte un modelo de lenguaje multimodal en un clasificador calibrado de preguntas cerradas. Se construye sobre el tronco cuantizado de Google `google/gemma-4-E4B-it-qat-w4a16-ct`, un Gemma 4 E4B-it con entrenamiento consciente de cuantización a int4 (w4a16). Lo publica el usuario JohnP1 (organización jonpol01) bajo licencia Apache-2.0 y con pipeline declarado `text-classification`.

El modelo no genera texto libre para su tarea principal: recibe un documento y un conjunto de preguntas (sí/no, opción múltiple o puntuación) y devuelve, en un único forward pass, una probabilidad calibrada para cada opción. Es la variante PyTorch del adaptador (pensada para NVIDIA, CPU y Mac sin MLX); para Apple Silicon existe una build MLX separada. La temperatura de calibración es 1,66, ajustada sobre las respuestas de la build MLX.

Es relevante ahora porque demuestra un patrón poco habitual: reutilizar un LLM multimodal cuantizado como núcleo de un modelo de decisión ("system-one") con salidas calibradas, en lugar de pedirle al LLM que razone en lenguaje natural. El autor lo publicó el 2026-10-27 antes de terminar sus puertas de calidad, y el propio scorecard reporta una regresión de −7,8 puntos en el suite externo typesafe atribuida al tronco de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) + pointer head sobre transformer Gemma 4 E4B-it con tronco QAT int4 (w4a16) |
| Parametros totales | no disponible (adaptador de 0,2 GB; tronco base de ~16 GB en bf16) |
| Parametros activos | no disponible (no se declara que el tronco sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | tronco int4 con escalas (w4a16); adaptador en safetensors; fp32 exacto (`D1A_DTYPE=fp32`) o bf16 redondeado |
| Idiomas soportados | en, ja (preguntas en inglés; documentos en inglés o japonés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA), con `d1a_config.json` y `base_ct` apuntando al checkpoint del tronco |

## Arquitectura y entrenamiento

El sistema combina dos piezas: el tronco Gemma 4 E4B-it QAT, congelado en los valores del checkpoint `google/gemma-4-E4B-it-qat-w4a16-ct` (revisión `6cd26aaa`), y un adaptador LoRA de rango 16 más una cabeza de puntero que produce una distribución sobre las opciones de cada pregunta. Al cargar, d1a reconstruye el tronco a partir de `base_ct` reescribiendo cada peso int4 como escala × entero, de modo que el adaptador opera sobre los mismos pesos con los que se entrenó; el cálculo es exacto en fp32 y redondeado en bf16. La cabeza de decisión devuelve probabilidades calibradas con temperatura 1,66, ajustada sobre las respuestas de la build MLX (calibración decision-v7 y desarrollo de etiquetas de PR).

El entrenamiento parte de un warm start desde `JohnP1/d1a-e4b-it` v0.6 y ejecuta una época de su mezcla multi-habilidad: 23.427 registros de 11 fuentes, con learning rate 2e-5, batch 8, 2.929 pasos y 36,2 horas en un Apple M1 Max vía MPS. El detalle técnico importante es que v0.6 se entrenó mientras un bug de PyTorch leía los embeddings por capa de Gemma 4 como ceros para todos los tokens de puntuación y dígitos; este reentrenamiento los lee correctamente. Los ficheros `training_config.json` y `training_metrics.json` recogen la configuración y las métricas de la ejecución.

## Capacidades

- Clasificación de decisiones: dada una pregunta de sí/no, opción múltiple o puntuación, devuelve una probabilidad calibrada por opción en un solo forward pass (`/v1/systemone`).
- Chat en formato OpenAI (`/v1/chat/completions`), con streaming y tool calls; con `D1A_MERGE=0` el chat desactiva el adaptador y responde como el Gemma 4 E4B-it QAT original.
- Multimodal en el servidor de medios (`python -m d1a.serving.media`): fotos, clips de voz y vídeo, usando los codificadores del propio checkpoint QAT.
- Etiquetado de pull requests: etiquetas, severidad con offsets, radio de impacto (blast radius) y enrutamiento.
- Multilingüe limitado: preguntas en inglés, documentos en inglés o japonés.
- Capacidad de calibración explícita: las salidas son probabilidades, no texto, lo que permite umbrales y agregación directa.

## Casos de uso

- Triaje de pull requests en CI/CD: el adaptador clasifica etiquetas, severidad y radio de impacto de un PR a partir de su descripción y diff, y el scorecard reporta mejoras de +1,6 en etiquetas, +6,0 en severidad con offsets y +7,2 en blast radius frente a v0.6, lo que lo hace adecuado para enrutar revisiones automáticamente.
- Enrutamiento de incidencias: asignar tickets o informes a un equipo o cola mediante preguntas de opción múltiple con probabilidad calibrada, usando el endpoint `/v1/systemone` y umbrales configurables.
- Verificación documental en inglés o japonés: comprobar si un documento cumple una lista de condiciones (sí/no) en una sola pasada, aprovechando el soporte de documentos en ambos idiomas.
- Moderación y control de calidad de contenido con imágenes: el servidor de medios permite formular preguntas cerradas sobre fotos (por ejemplo, presencia de un objeto o estado de un paquete), como muestra la comprobación de una caja en un buzón frente a un taquilla de entrega.
- Análisis de llamadas o notas de voz: transcripción y decisión sobre clips de audio mediante el servidor de medios, útil para clasificar motivos de contacto.
- Asistente conversacional con herramientas: el endpoint de chat compatible con OpenAI permite integrar el modelo en flujos existentes con function calling y streaming, desactivando el adaptador cuando se necesita texto libre.
- Investigación en calibración: servir como banco de pruebas para estudiar decisiones calibradas sobre un tronco cuantizado int4 en fp32 frente a bf16.

## Benchmarks y rendimiento

El scorecard del 2026-10-28 se midió sobre la build MLX del mismo adaptador, no sobre esta ruta PyTorch.

| Suite | Diferencia frente a D1A-E4B-it v0.6 |
|---|---|
| Global (pooled) | −0,16 puntos [−0,88, +0,51] |
| Adaptador de v0.6 sobre este tronco QAT | +1,19 [+0,50, +1,87] sin pérdida significativa |
| Etiquetas de PR | +1,6 |
| Severidad de PR con offsets | +6,0 |
| Radio de impacto (blast radius) | +7,2 |
| Enrutamiento | +1,7 y +1,5 |
| Suite externo typesafe | −7,8 (atribuido al tronco de 4 bits) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: la carga descarga Gemma 4 E4B-it (unos 16 GB) y el checkpoint QAT (unos 11 GB); el adaptador ocupa 0,2 GB. El tronco int4 reduce el peso en memoria respecto a bf16, pero el pico de carga es elevado.
- GPU recomendadas: no se especifican modelos concretos; el autor valida la ruta PyTorch en Apple M1 Max (MPS) y menciona NVIDIA y CPU como plataformas soportadas.
- GPU de consumo: no hay confirmación de que quepa en tarjetas de 8-16 GB; el tamaño del tronco sugiere que se requiere al menos una GPU de 24 GB o descarga en CPU.
- Despliegue: servidor propio de d1a (`python -m d1a.serving.serve` en el puerto 8009 para decisiones y chat; `python -m d1a.serving.media` en el 8010 para foto, voz y vídeo). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se sabe que el entrenamiento de 2.929 pasos tardó 36,2 horas en un M1 Max, dato no extrapolable a inferencia.
- Requisitos de software: d1a con los parches jonpol01/d1a#346 y #348, y en MPS el #354 o torch 2.14 o posterior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D1A-E4B-it QAT (este) | adaptador LoRA r=16 sobre Gemma 4 E4B-it QAT int4 | no disponible | Decisiones calibradas, chat, multimodal | Apache-2.0 | Hugging Face, 26 descargas |
| D1A-E4B-it v0.6 | adaptador sobre Gemma 4 E4B-it | no disponible | Decisiones calibradas | Apache-2.0 | Hugging Face |
| D1A-E4B-it QAT MLX q4 | mismo adaptador, build MLX | no disponible | Decisiones calibradas, chat, multimodal | Apache-2.0 | Hugging Face |
| Gemma 4 E4B-it QAT (base) | no disponible | no disponible | LLM multimodal general | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks estándar para comparar rendimiento entre estas variantes más allá del scorecard interno.

## Limitaciones y advertencias

- Publicado el 2026-10-27 antes de completar sus puertas de calidad, por decisión del autor; debe tratarse como experimental.
- Regresión de −7,8 puntos en el suite externo typesafe frente a v0.6, atribuida al tronco de 4 bits.
- Las mediciones del scorecard corresponden a la build MLX; la ruta PyTorch solo se validó con 5 peticiones de decisión (máx. |Δp| 0,012), 2 fotos y 2 clips de voz (7 de 8 respuestas coincidentes, máx. |Δp| 0,11). El desacuerdo es un casi-empate: caja en buzón (0,55) frente a taquilla de entrega (0,51).
- En MPS era necesario el parche jonpol01/d1a#354 o torch 2.14 o posterior; antes, el kernel de embeddings leía como ceros todos los tokens de puntuación y dígitos desde el id 199.729.
- El token `<bos>` (id 2) debe añadirse al inicio de cada registro; d1a lo hace automáticamente.
- Las preguntas deben formularse en inglés; solo los documentos admiten japonés.
- Riesgo de alucinación: no aplica de forma directa a la tarea de decisión (salida probabilística), pero el modo chat sin adaptador hereda los sesgos y alucinaciones del Gemma 4 base.
- Datos de entrenamiento: el conjunto etiquetado de PR, incluidas las PR recientes, es privado; los datos japoneses derivan de JGLUE (CC BY-SA 4.0) y los de PR de NousResearch/hermes-agent (MIT), lo que conviene revisar para uso comercial.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JohnP1/d1a-e4b-it-qat
- Build MLX: https://huggingface.co/JohnP1/d1a-e4b-it-qat-mlx-q4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-w4a16-ct
- Adaptador previo v0.6: https://huggingface.co/JohnP1/d1a-e4b-it
- Repositorio de código: https://github.com/jonpol01/d1a
- Scorecard completo: https://github.com/jonpol01/d1a/blob/main/docs/reports/2026-10-28-e4b-it-qat-scorecard.md
- Incidencias citadas: jonpol01/d1a#341, #346, #348, #353, #354, #361; pytorch/pytorch#188756
- Kev, framework base de Jared Palmer: no disponible como enlace en la información proporcionada
