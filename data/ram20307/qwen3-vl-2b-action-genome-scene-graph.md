# Ram20307/qwen3-vl-2b-action-genome-scene-graph

## Resumen

qwen3-vl-2b-action-genome-scene-graph es un ajuste fino (fine-tuning) del modelo multimodal Qwen/Qwen3-VL-2B-Instruct, publicado por el usuario Ram20307 en Hugging Face. El modelo parte de la arquitectura Qwen3-VL de 2.127.532.032 parametros (aproximadamente 2,13 mil millones) y ha sido especializado mediante LoRA (r=16, entrenado en bf16 y posteriormente fusionado con los pesos base) para una tarea muy concreta: la generacion de grafos de escena (scene graphs) a partir de imagenes, centrada en las relaciones entre una persona y los objetos visibles en la escena.

El problema que resuelve es la extraccion estructurada de relaciones persona-objeto en formato JSON, distinguiendo tres tipos de relacion: atencion (attention), espacial (spatial) y contacto (contact). Esta tarea es relevante en vision por computador para el analisis de video, la comprension de escenas y la investigacion en interaccion humano-objeto, enmarcada en el dataset Action Genome y los videos de Charades.

El modelo es relevante por su tamano reducido (2B), que lo hace desplegable en hardware modesto, y por estar especializado en una salida estrictamente estructurada. No obstante, se trata de un ajuste fino de investigacion, sin datos de benchmarks exhaustivos y con un rendimiento preliminar modesto (recall 0,40, precision 0,54 en una evaluacion no oficial). Su licencia es Apache 2.0, aunque los datos de entrenamiento tienen restricciones de uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (vision-lenguaje) |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16 tras la fusion) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-VL en su variante de 2B parametros, un transformer multimodal disenado para tareas de image-text-to-text. Sobre esta base se aplico un ajuste fino supervisado mediante LoRA con rango r=16, entrenado en precision bf16 y posteriormente fusionado con los pesos del modelo base para producir un unico checkpoint de safetensors.

El entrenamiento utilizo el split completo de entrenamiento de Action Genome: aproximadamente 60.700 fotogramas muestreados de 7.787 videos de Charades (hasta 8 fotogramas por video), durante 2 epocas. La tarea de entrenamiento consiste en, dado un prompt fijo, generar un JSON con la lista de objetos visibles relacionados con la persona y las relaciones de atencion, espaciales y de contacto. No se documenta en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales, ni el numero de tokens de entrenamiento mas alla del recuento de fotogramas. La innovacion principal es la especializacion en salida JSON estrictamente estructurada para grafos de escena.

## Capacidades

- Generacion de texto e inferencia multimodal imagen-texto sobre la base Qwen3-VL-2B-Instruct.
- Generacion de grafos de escena en formato JSON: lista de objetos relacionados con la persona y relaciones de attention, spatial y contact.
- Salida estructurada validada: en la evaluacion preliminar del autor, el 100 % de las 199 muestras de test produjeron JSON valido.
- Comprension de imagenes individuales (image-text-to-text) orientada a la deteccion de relaciones persona-objeto.
- Soporte de conversacion multi-turno heredado del modelo base (tag conversational).
- Capacidades de tool calling, agentes, matematicas o codigo: no documentadas especificamente para este ajuste fino; se heredarian, en su caso, del modelo base Qwen3-VL-2B-Instruct.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de video de interaccion humano-objeto: procesar fotogramas muestreados de videos (como en Charades) para extraer que objetos atiende, toca o tiene cerca una persona, alimentando pipelines de anotacion automatica.
- Anotacion asistida de datasets de vision: generar borradores de grafos de escena en formato JSON que revisores humanos puedan validar, reduciendo el coste de etiquetado en proyectos de investigacion.
- Investigacion en comprension de escenas: usar las relaciones attention/spatial/contact como senal estructurada para estudios de percepcion visual y modelado de affordances.
- Indexacion y busqueda semantica de imagenes: convertir cada imagen en un JSON de relaciones y almacenarlo en una base de datos para busquedas por objeto o tipo de relacion.
- Robotica e interaccion asistida (prototipado): proporcionar contexto estructurado sobre objetos cercanos y en contacto con una persona para sistemas de asistencia, siempre en fase de investigacion.
- Moderacion y analisis de contenido visual: detectar relaciones de contacto persona-objeto en imagenes para revisiones automatizadas, con supervision humana dado el rendimiento limitado.
- Docencia y experimentacion con modelos multimodales pequenos: servir de ejemplo reproducible de fine-tuning LoRA sobre Qwen3-VL-2B para tareas de salida estructurada.

## Benchmarks y rendimiento

Evaluacion preliminar del autor sobre 199 fotogramas de test procedentes de 25 videos (bf16, pesos fusionados):

| Metrica | Resultado |
|---|---|
| JSON valido | 199/199 |
| Recall | 0,40 |
| Precision | 0,54 |

Notas: no se trata del protocolo oficial de competicion (280 fotogramas de 35 videos), es una unica ejecucion sin barras de error, y no se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,13 mil millones de parametros, en bf16 se requieren aproximadamente 4,3 GB solo para pesos, mas overhead de activaciones y cache; en cuantizacion de 8 bits o 4 bits el consumo baja considerablemente, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: tarjetas con al menos 8-12 GB de VRAM para bf16 con margen (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100). Cabe en GPUs de consumo con suficiente memoria.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, siempre que se disponga de una implementacion compatible con Qwen3-VL.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles segun los tags de Hugging Face; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-vl-2b-action-genome-scene-graph | 2,13 B | no disponible | Scene graph JSON (Action Genome) | Apache 2.0 (datos de entrenamiento no comerciales) | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct (base) | ~2 B | no disponible | Multimodal general | Apache 2.0 | Hugging Face |
| Otros ajustes de scene graph sobre Action Genome | no disponible | no disponible | Scene graph | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento preliminar modesto: recall 0,40 y precision 0,54 en una evaluacion no oficial, con una sola ejecucion y sin barras de error; no debe interpretarse como rendimiento de produccion.
- La evaluacion no sigue el protocolo oficial de competicion (199 fotogramas de 25 videos frente a 280 de 35), por lo que los resultados no son directamente comparables con otros trabajos.
- Los datos de entrenamiento (Action Genome y Charades) estan licenciados unicamente para investigacion no comercial; aunque los pesos se publican bajo Apache 2.0, el uso comercial derivado del entrenamiento es cuestionable y requiere revision legal.
- Riesgo de alucinacion: como modelo generativo, puede inventar objetos o relaciones no presentes, especialmente con precision limitada.
- Sesgos: no documentados, pero heredados del modelo base y del dataset Charades (escenas y actividades de un dominio acotado).
- Limitaciones de idioma y contexto: no disponibles en la informacion proporcionada; el prompt de entrenamiento esta en ingles.
- Especializacion estrecha: el modelo esta optimizado para un unico prompt y formato JSON; su rendimiento fuera de esa tarea no esta validado.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ram20307/qwen3-vl-2b-action-genome-scene-graph
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset Action Genome: no disponible enlace directo en la informacion proporcionada
- Dataset Charades: no disponible enlace directo en la informacion proporcionada
- Paper o blog del autor: no disponible
