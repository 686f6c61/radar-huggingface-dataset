# MartynU/hektor-wakeword

## Resumen

hektor-wakeword es un modelo de detección de palabra de activación (wake word o keyword spotting) publicado por el usuario MartynU en HuggingFace. Se trata de un modelo personalizado para openWakeWord que detecta la palabra ucraniana «Гектор». No es un modelo de lenguaje: recibe como entrada las características generadas por el modelo de embeddings de openWakeWord, con forma de tensor `[1, 16, 96]`, y devuelve una probabilidad entre 0 y 1 para cada ventana evaluada. El modelo se distribuye en formato ONNX (opset 18, requiere onnxruntime >= 1.14) y está pensado para integrarse en pipelines de voz, tanto con la librería Python de openWakeWord como con servidores basados en pipecat (`WakeGate`).

El problema que resuelve es concreto: permitir que un asistente o robot activado por voz responda a una palabra de activación en ucraniano sin depender de motores propietarios. La licencia Apache 2.0 y el hecho de que openWakeWord permita entrenar wake words con datos sintéticos lo convierten en un caso de estudio interesante para quien necesite un detector propio, aunque el propio autor advierte que es su «primera model experimental» y que la calidad es todavía insuficiente para uso diario.

El estado actual del proyecto incluye dos versiones del clasificador: `hektor.onnx` (v1) y `hektor_v2.onnx` (v2), ambas entrenadas el 05.10.2026. La v2 reduce los falsos positivos de 1,42 a 0,44 por hora, pero a costa de bajar el recall de 0,22 a 0,13. El repositorio ocupa 3,7 GB, incluye configuración, logs y parches de entrenamiento en la carpeta `training/`, y acumula 0 descargas y 1 like en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador de keyword spotting sobre embeddings de openWakeWord. Entrada `[1, 16, 96]`, salida de probabilidad 0-1. Tipo exacto de red (capas, activaciones) no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de entrada fija de 16 x 96 características (embeddings de openWakeWord); duración temporal exacta no especificada |
| Tipos de cuantización | no disponible. Se publica en ONNX opset 18; el repositorio incluye etiquetas `tflite`, `tf-keras` y `tensorboard` |
| Idiomas soportados | ucraniano (uk), limitado a la palabra de activación «Гектор» |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`hektor.onnx`, `hektor_v2.onnx`), opset 18, compatible con onnxruntime >= 1.14. Se mencionan también tflite y tf-keras en las etiquetas del repositorio |

## Arquitectura y entrenamiento

La arquitectura es la habitual del pipeline de openWakeWord: un modelo de embeddings preentrenado convierte el audio en una secuencia de vectores de 96 dimensiones, y sobre esa representación se entrena un clasificador ligero que emite una probabilidad de activación. La entrada documentada es `[1, 16, 96]` y la salida es un único valor entre 0 y 1. El modelo no procesa audio en crudo ni genera texto; es un clasificador binario de activación. No se especifica el número de capas, la dimensión oculta ni el total de parámetros, aunque por la forma de la entrada se trata de una red de muy baja complejidad computacional.

Los datos de entrenamiento de la v1 consisten en 1.265 positivos de entrenamiento y 217 de test, generados con voces sintéticas de Cartesia, ElevenLabs y Gemini, manteniendo voces separadas para el conjunto de test. Los negativos son 1.982 de entrenamiento y 296 de test, más las características precalculadas de ACAV100M que proporciona openWakeWord. La aumentación usa 270 respuestas de impulso (RIR) del MIT y 1.500 clips de AudioSet; el conjunto FMA se descartó. El entrenamiento se realizó en Google Colab con una T4, Python 3.13, 20.000 pasos y `augmentation_rounds` fijado en 2. La v2 amplía los datos a 2.067/348 positivos y 2.700/408 negativos, de los cuales 1.724 son regrabaciones realizadas «a través de las orejas del robot» y solo 39 son grabaciones de voz en vivo, con fondos adicionales del conjunto `dataset/robot_bg` y los mismos testigos de test. No se emplearon técnicas de RLHF ni DPO, algo esperable en un clasificador y no en un modelo generativo.

## Capacidades

- Detección de la palabra de activación «Гектор» en audio de entrada, devolviendo una puntuación de probabilidad entre 0 y 1 por ventana evaluada.
- Integración directa con la librería Python de openWakeWord mediante `Model(wakeword_models=["hektor.onnx"], inference_framework="onnx")` y la clave `hektor` en el diccionario de resultados.
- Integración con servidores de voz basados en pipecat a través de `WakeGate(phrase="models/hektor.onnx")`.
- Ejecución sobre características precalculadas por el modelo de embeddings de openWakeWord, lo que permite separar el front-end de audio del clasificador.
- Distribución en ONNX opset 18, con etiquetas que apuntan a formatos alternativos (tflite, tf-keras) para despliegue en dispositivos.
- No dispone de generación de texto, razonamiento, matemáticas, código, visión, audio generativo, tool calling, capacidades de agente ni multilingüismo. Es exclusivamente un detector de una palabra en ucraniano.

## Casos de uso

- Activación de asistentes de voz en ucraniano: el modelo se conecta al pipeline de openWakeWord y permite que un asistente despierte con la palabra «Гектор» sin recurrir a motores comerciales. Adecuado para prototipos, no para producción por su bajo recall.
- Robótica doméstica con activación manos libres: la v2 se entrenó con regrabaciones hechas «a través de las orejas del robot», por lo que el detector está ajustado al micrófono y al entorno acústico de ese montaje concreto, lo que puede ser una ventaja si se replica el mismo hardware.
- Kioscos o terminales interactivos en ucraniano: al ser un modelo ONNX de bajo coste computacional, puede ejecutarse en CPU de dispositivos embebidos (Raspberry Pi y similares) para activar la interfaz sin pulsar botones.
- Sustitución de wake words propietarios en proyectos con requisitos de licencia: al publicarse bajo Apache 2.0, encaja en productos que no pueden depender de SDK comerciales, siempre que se acepte la merma de precisión actual.
- Investigación en detección de palabras clave con datos sintéticos: la carpeta `training/` incluye configuración, logs y parches de Colab, lo que sirve como referencia reproducible de un ciclo completo de entrenamiento en una única T4.
- Punto de partida para ajuste fino con datos propios: quien necesite un wake word en ucraniano puede reentrenar el clasificador con grabaciones reales de su dominio para corregir el bajo recall y el sesgo hacia voces sintéticas.
- Control de acceso por voz en entornos controlados: en salas con poco ruido de fondo y hablantes nativos, el modelo puede usarse como disparador de una verificación posterior más costosa, aunque el número de falsos positivos obliga a añadir una segunda etapa de validación.
- Demostraciones y pruebas de concepto de pipelines de voz: por su tamaño reducido y su integración con pipecat, es útil para montar prototipos de agentes conversacionales con activación por voz en cuestión de minutos.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de validación del propio autor, medidas con umbral 0,5. No hay comparaciones con otros modelos de wake word en la información disponible.

| Métrica (validación, umbral 0,5) | v1 | v2 | Objetivo declarado |
|---|---|---|---|
| Recall | 0,22 | 0,13 | > 0,8 |
| Falsos positivos por hora | 1,42 | 0,44 | < 0,5 |
| Accuracy | 0,66 | 0,60 | no especificado |

El autor indica que el umbral óptimo probablemente sea inferior a 0,5 y que conviene calibrarlo sobre el dispositivo real. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite de evaluación, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por la forma de entrada (`16 x 96`) se trata de un clasificador de muy baja complejidad; en la práctica está diseñado para ejecutarse en CPU.
- GPU recomendadas: no se especifica ninguna. El propio entrenamiento se hizo en una GPU T4 de Google Colab, lo que da una idea del perfil de cómputo necesario para el ciclo de entrenamiento, no para la inferencia.
- GPU de consumo: no requiere GPU. El modelo de inferencia es un fichero ONNX que puede ejecutarse con onnxruntime sobre CPU, incluidos dispositivos de placa única.
- Opciones de despliegue: `onnxruntime >= 1.14` como motor principal; librería Python de openWakeWord (`openwakeword.model.Model`); servidores de voz con pipecat (`WakeGate`); el repositorio incluye etiquetas para tflite y tf-keras, lo que sugiere rutas alternativas de despliegue en móvil o microcontrolador no documentadas en la model card.
- Latencia y throughput: no disponibles. No se publican medidas de tiempo de inferencia ni de consumo por trama.
- Tamaño del repositorio: 3,7 GB en total. No se especifica cuánto de ese espacio corresponde al fichero ONNX de inferencia y cuánto a artefactos de entrenamiento, logs o datos intermedios.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación es estructural. La columna de rendimiento se deja como no disponible en todos los casos salvo en el modelo analizado.

| Modelo | Tipo | Entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hektor-wakeword (v1 / v2) | Clasificador sobre embeddings de openWakeWord | `[1, 16, 96]` | Recall 0,22 / 0,13; falsos positivos por hora 1,42 / 0,44; accuracy 0,66 / 0,60 | Apache 2.0 | HuggingFace, 0 descargas, 1 like |
| Modelos preentrenados de openWakeWord (por ejemplo «hey jarvis») | Clasificador sobre embeddings de openWakeWord | `[1, 16, 96]` | no disponible | Apache 2.0 (proyecto openWakeWord) | Repositorio oficial del proyecto openWakeWord |
| Picovoice Porcupine | Motor propietario de wake word | no disponible | no disponible | Comercial, con nivel de uso gratuito | SDK propietario |
| Snowboy | Motor de wake word, proyecto discontinuado | no disponible | no disponible | no disponible | Archivado, sin mantenimiento |

La ventaja diferencial de hektor-wakeword frente a los modelos preentrenados de openWakeWord es que cubre una palabra en ucraniano que no forma parte del catálogo estándar. Su desventaja es que sus métricas están muy por debajo de los objetivos habituales de un detector de activación en producción.

## Limitaciones y advertencias

- Recall muy bajo: 0,22 en la v1 y 0,13 en la v2, frente a un objetivo declarado superior a 0,8. Esto significa que el modelo no detecta entre el 78 % y el 87 % de las activaciones reales. El propio autor lo describe como calidad insuficiente para uso diario.
- Falsos positivos: 1,42 por hora en la v1 y 0,44 por hora en la v2. La v2 cumple el objetivo declarado de menos de 0,5 por hora, pero en un dispositivo siempre encendido eso equivale a aproximadamente 10 activaciones espurias al día.
- Accuracy limitada: 0,66 en la v1 y 0,60 en la v2, lo que indica un margen de mejora amplio antes de considerar el modelo fiable.
- Sesgo de dominio: los positivos son casi exclusivamente voces sintéticas de Cartesia, ElevenLabs y Gemini. La v2 incorpora 1.724 regrabaciones hechas «a través de las orejas del robot» y solo 39 grabaciones de voz en vivo, lo que puede sesgar el detector hacia el micrófono y el entorno acústico concretos de ese montaje.
- Cobertura lingüística mínima: solo ucraniano y solo la palabra «Гектор». No hay soporte para variantes dialectales, otros idiomas ni otras palabras de activación.
- Reproducibilidad limitada: los clips de audio en crudo no se publican, por lo que no es posible auditar la composición exacta del conjunto de entrenamiento ni replicar el pipeline al detalle.
- Umbral no calibrado: las métricas se miden con un umbral de 0,5 que el autor considera probablemente subóptimo. Cualquier despliegue real exige recalibrar el umbral sobre el dispositivo final.
- Naturaleza del modelo: no es un modelo de lenguaje. No genera texto, no razona, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de razonamiento.
- Licencia de los datos sintéticos: aunque el modelo se publica bajo Apache 2.0, conviene revisar las condiciones de uso comercial de los proveedores de voz sintética empleados en la generación de positivos (Cartesia, ElevenLabs, Gemini) antes de explotarlo en un producto.
- Tamaño del repositorio: 3,7 GB, considerable para un clasificador de esta naturaleza; conviene descargar solo los ficheros ONNX necesarios.
- Sin mantenimiento confirmado: la ficha se creó el 05.10.2026 y se actualizó el 06.10.2026, con 0 descargas y 1 like, lo que indica un proyecto incipiente y sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MartynU/hektor-wakeword
- Carpeta `training/` del repositorio: configuración, logs y parches para Google Colab del entrenamiento de la v1.
- Carpeta `training/v2/` del repositorio: configuración y logs del entrenamiento de la v2.
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados corresponden a hilos de foro sobre WhatsApp y a páginas de soporte de Microsoft Community, sin relación con el modelo ni con openWakeWord. No se han podido localizar papers, blogs, repositorios ni demos asociados en la información disponible.
