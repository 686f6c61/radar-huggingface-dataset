# Moodski/bn4601a-stroke-models

## Resumen

BN4601A stroke models es un prototipo de investigacion publicado por el usuario Moodski en Hugging Face, orientado al analisis de imagenes de resonancia magnetica en ictus isquemico agudo. El repositorio agrupa dos componentes complementarios: un modelo de segmentacion de lesiones (`unet/`) y un adaptador QLoRA (`adapter/`) montado sobre Qwen2.5-VL-3B-Instruct, que combina percepcion visual y generacion de texto clinico fundamentado.

El componente de segmentacion es una U-Net 2.5D con encoder ResNet-34 preentrenado en ImageNet, que recibe DWI, ADC y FLAIR con slices vecinos a 1,5 mm de resolucion en plano y normalizacion z-score dentro de la mascara cerebral. El adaptador QLoRA, de rango 16, se aplica al modelo de lenguaje, al encoder visual y al merger del VLM base, y fue entrenado para responder preguntas ancladas en hallazgos estructurados y en una base de conocimiento citada, ademas de percibir lesiones en las tres secuencias.

El modelo es relevante ahora porque demuestra un patron de uso habitual en IA medica open source: combinar un modelo especializado de vision (segmentacion) con un VLM generalista ajustado via PEFT para tareas de razonamiento y reporte. No obstante, se trata de un prototipo de investigacion, no de un dispositivo medico, y no debe usarse en entorno clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net 2.5D con encoder ResNet-34 (segmentacion) + adaptador QLoRA sobre Qwen2.5-VL-3B-Instruct (VLM) |
| Parametros totales | no disponible (adaptador LoRA rango 16 sobre base de 3B; el repo pesa 0,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA (entrenamiento en 4 bits); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (licencia del modelo base aplicada al adaptador); datos de entrenamiento ISLES 2022 (CC BY 4.0) y SOOP (CC0) |
| Formato de pesos | safetensors (via libreria peft); pesos U-Net en `unet/` |

## Arquitectura y entrenamiento

La parte de segmentacion es una U-Net 2.5D con encoder ResNet-34 inicializado con pesos de ImageNet. La entrada combina DWI, ADC y FLAIR, cada slice junto con sus vecinos, a 1,5 mm en plano y con z-score calculado dentro de la mascara cerebral. La salida es una probabilidad de lesion, umbralizada con el valor elegido en validacion (recogido en `summary.json`). El entrenamiento se realizo sobre ISLES 2022 y SOOP.

El componente conversacional es un adaptador QLoRA de rango 16 sobre Qwen2.5-VL-3B-Instruct, aplicado no solo al modelo de lenguaje sino tambien al encoder visual y al merger. El objetivo de entrenamiento fue responder preguntas fundamentadas en hallazgos estructurados y en una base de conocimiento con citas, y percibir lesiones en imagenes DWI | ADC | FLAIR. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset conversational ni si se aplicaron RLHF o DPO.

## Capacidades

- Segmentacion de lesiones de ictus isquemico agudo a partir de DWI, ADC y FLAIR (componente U-Net).
- Percepcion visual de lesiones en las tres secuencias por parte del adaptador VLM.
- Generacion de respuestas ancladas en hallazgos estructurados y en una base de conocimiento citada.
- Rechazo de preguntas fuera de alcance (declina el 100% de las consultas out-of-scope en casos held-out, frente al 11% del modelo base).
- Razonamiento multimodal vision-lenguaje heredado de Qwen2.5-VL-3B-Instruct (no se detallan capacidades adicionales como tool calling o agentes en la informacion disponible).
- Senal de temporizacion DWI-FLAIR como proxy (no validada contra tiempos de onset).

## Casos de uso

- Triaje asistido en investigacion: el pipeline U-Net + VLM puede priorizar estudios con lesion visible y generar un resumen estructurado de hallazgos para revision por parte de radiologos en entornos de estudio.
- Segmentacion volumetrica de lesion en cohortes de investigacion: la U-Net permite calcular volumen lesional y comparar entre centros, con Dice 0,73 en test interno y 0,84 en hospital externo (Bern).
- Generacion de informes fundamentados: el adaptador produce respuestas ancladas en hallazgos y base de conocimiento citada (98% de respuestas fundamentadas en held-out frente al 8% del base), util para prototipos de reporte asistido.
- Filtrado de consultas fuera de alcance: el modelo declina el 100% de preguntas out-of-scope, lo que lo hace adecuado como capa de salvaguarda en demos y asistentes de investigacion.
- Educacion y formacion: la demo en Hugging Spaces permite explorar como un VLM ajustado con PEFT interpreta DWI/ADC/FLAIR en casos de ictus.
- Investigacion en seguimiento post-tratamiento: util para analizar el rendimiento degradado (Dice 0,66 medio, 0,75 mediana en ISLES'24 externo) y estudiar estrategias de mejora.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Dice segmentacion, test interno (246 scans) | 0,73 |
| Dice segmentacion, hospital externo Bern (52 scans) | 0,84 |
| Dice segmentacion, ISLES'24 externo (seguimiento post-tratamiento) | 0,66 media / 0,75 mediana |
| Respuestas fundamentadas en hallazgos (held-out, adaptador) | 98% (base: 8%) |
| Rechazo de preguntas out-of-scope (adaptador) | 100% (base: 11%) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador QLoRA rango 16 sobre Qwen2.5-VL-3B-Instruct sugiere que el VLM puede ejecutarse en GPUs consumer con cuantizacion en 4 bits, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Cabe en consumer GPU: probablemente si con cuantizacion 4 bits por el tamano del base (3B), pero no confirmado en la informacion disponible.
- Opciones de despliegue: libreria peft; la demo usa Hugging Spaces. No se detallan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| BN4601A stroke models (este) | Adaptador LoRA r16 sobre 3B + U-Net | no disponible | Segmentacion de ictus + VLM clinico | qwen-research |
| Qwen2.5-VL-3B-Instruct (base) | 3B | no disponible | VLM generalista | qwen-research |
| Alternativas de segmentacion de ictus (p. ej. nnU-Net sobre ISLES) | no disponible | no disponible | Segmentacion de lesion | variable |

No se dispone de datos comparativos adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Prototipo de investigacion: no es un dispositivo medico y no debe usarse en entorno clinico.
- No evaluado en estudios sin ictus, lo que limita su uso como herramienta de descarte.
- Rendimiento inferior en seguimiento post-tratamiento (ISLES'24 externo: Dice 0,66 media).
- No realiza evaluacion de hemorragia.
- La senal de temporizacion DWI-FLAIR es un proxy no validado contra tiempos de onset reales.
- Licencia qwen-research aplicada al adaptador; revisar restricciones de uso comercial antes de cualquier despliegue.
- Riesgo de alucinacion inherente al componente VLM, mitigado parcialmente por el anclaje en hallazgos y el rechazo de consultas fuera de alcance.
- Idiomas soportados no especificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Moodski/bn4601a-stroke-models
- Demo en Hugging Spaces: https://huggingface.co/spaces/Moodski/bn4601a-stroke-assistant
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- ISLES 2022: https://isles-2022.grand-challenge.org/
- SOOP: no disponible enlace directo en la informacion proporcionada.
