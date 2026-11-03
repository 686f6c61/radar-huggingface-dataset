# imsg8/kalparso-mdistil

## Resumen

KalParso-mDistilBERT es un modelo de clasificación de tokens (token classification) especializado en la normalización temporal de entradas informales en hinglish (mezcla de hindi y inglés). Lo desarrolla imsg8 (Shivang Gulati y Archana Praveen Kumar, Manipal Institute of Technology, MAHE) y resuelve un problema muy concreto: convertir expresiones temporales ambiguas como "parso shaam saade 5 baje" en una fecha y hora exactas. El modelo marca las palabras temporales, el tipo de entrada (recordatorio, nota u objetivo) y el tiempo verbal; un componente determinista externo (`ground.py`, incluido en el repositorio) realiza la aritmética de calendario.

Se trata de un fine-tuning de `distilbert-base-multilingual-cased` (134.747.922 parámetros) con tres cabezas lineales sobre el encoder: etiquetado BIO de 13 clases para spans temporales, clasificación del tipo de entrada (3 clases) y clasificación del tiempo verbal (2 clases). Su relevancia radica en que resuelve un caso donde los LLM generalistas fallan por la dependencia del contexto temporal: "kal" significa mañana o ayer según el tiempo verbal de la frase.

La propuesta de valor es eficiencia extrema: el checkpoint int8 en ONNX ocupa 135 MB y procesa una entrada en 9 ms sobre un solo núcleo de CPU, sin necesidad de PyTorch. Está pensado para integrarse en asistentes de planificación, parsers de recordatorios o pipelines de normalización de texto en producción de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT multilingual), con tres cabezas lineales: `tag` (13 etiquetas BIO), `typ` (3 clases) y `dir` (2 clases) |
| Parametros totales | 134.747.922 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | fp32 (ONNX, 539 MB) e int8 (ONNX, 135 MB) |
| Idiomas soportados | hi, en (entrenado principalmente con hinglish en escritura latina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16, para fine-tuning), ONNX (fp32 e int8) |
| Libreria de inferencia | onnxruntime |
| Tamano del repositorio | 0.9 GB |
| Dataset de entrenamiento | imsg8/kalparso (KalParso v3) + 3.300 tuits PHINC |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-multilingual-cased`, un encoder transformer de 6 capas y 135M de parámetros, sobre el que se añaden tres cabezas lineales. La cabeza `tag` produce etiquetas BIO para 13 clases que identifican los spans temporales; la cabeza `typ` clasifica la entrada en `reminder`, `note` o `goal`; y la cabeza `dir` determina el tiempo verbal (pasado o futuro) a partir del token `[CLS]`. La salida del modelo se combina con un grounder determinista de unas 200 líneas (`ground.py`) que aplica las convenciones de calendario del dataset para producir la fecha y hora finales.

El entrenamiento se realizó sobre 29.911 entradas sintéticas del dataset KalParso v3 (generadas por plantillas, con spans a nivel de carácter) más 3.300 tuits PHINC con etiquetas débiles de tiempo verbal derivadas de sus traducciones al inglés. Se usó AdamW con learning rate 5e-5, batch de 32, 3 épocas, decaimiento lineal con 6% de warm-up y longitud máxima de 64 tokens, sobre una única NVIDIA T4. Ninguna entrada humana del conjunto de test está presente en los datos de entrenamiento. Este checkpoint corresponde a la semilla 2 de cinco entrenamientos, seleccionado por puntuación de calibración y nunca por puntuación de test.

La innovación técnica principal no está en el encoder, sino en la separación de responsabilidades: el modelo neuronal se limita a la identificación de spans y clasificación, mientras que la aritmética de fechas queda en código determinista, lo que reduce el riesgo de alucinación en el cálculo temporal y permite un rendimiento muy alto en CPU.

## Capacidades

- Extracción de expresiones temporales en hinglish: identifica spans como "parso", "shaam", "saade 5 baje" mediante etiquetado BIO.
- Clasificación del tipo de entrada: `reminder`, `note` o `goal`.
- Detección del tiempo verbal (`direction`: pasado o futuro), clave para desambiguar términos como "kal".
- Normalización a fecha exacta (`YYYY-MM-DD`) y hora (`HH:MM`) mediante el grounder incluido.
- Manejo de expresiones relativas y convenciones del dataset (por ejemplo, "agle Friday" como el viernes próximo).
- Inferencia en CPU sin PyTorch, solo con `onnxruntime`, `tokenizers`, `numpy` y `huggingface_hub`.
- Soporte de cuantización int8 para despliegue de bajo consumo.
- Capacidades multilingües limitadas a hindi e inglés, con foco en code-mixing en escritura latina.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo discriminativo de clasificación, no generativo.

## Casos de uso

- Asistentes de planificación personal: el modelo convierte entradas dictadas o escritas en hinglish ("parso shaam saade 5 baje dentist") en recordatorios con fecha y hora exactas, integrándose en la capa de parsing de un asistente móvil o de un bot de mensajería.
- Normalización de texto en pipelines de agenda: procesar lotes de notas informales para extraer eventos estructurados antes de insertarlos en un calendario, aprovechando los 9 ms por entrada en int8.
- Extracción de eventos en aplicaciones de notas: clasificar automáticamente si una entrada es un recordatorio, una nota o un objetivo, y enriquecerla con metadatos temporales.
- Procesamiento de redes sociales y mensajería: analizar tuits o mensajes en hinglish para detectar referencias temporales, dado el entrenamiento parcial con tuits PHINC.
- Despliegue en dispositivos de borde: al ocupar 135 MB en int8 y ejecutarse en un solo núcleo de CPU, es viable en entornos con recursos limitados, sin GPU ni frameworks pesados.
- Preprocesamiento para LLM: usar el modelo como extractor determinista de fechas antes de pasar el texto a un LLM generativo, reduciendo errores de cálculo temporal y coste de inferencia.
- Sistemas de recordatorios por voz: transcribir una frase en hinglish y normalizarla a una estructura `{type, date, time, direction}` para su inserción en un servicio de calendario.

## Benchmarks y rendimiento

Precisión de fecha y hora correctas sobre las 706 entradas humanas de held-out de KalParso (`human/test`) y sobre el split de calibración de 262 entradas:

| Fichero | Tamano | Test held-out | Calibracion | Latencia CPU, 1 nucleo |
|---|---|---|---|---|
| fp32 ONNX (`onnx/model.onnx`) | 539 MB | 85,0% | 88,4% | 18 ms |
| int8 ONNX (`onnx/model.int8.onnx`) | 135 MB | 83,6% | 86,8% | 9 ms |

La media sobre cinco semillas de entrenamiento es 84,3 ± 0,9%. La latencia es la mediana medida en un Intel Core i7-9700 (2019) limitado a 35 W, un hilo, de extremo a extremo incluyendo tokenización y grounding.

Comparativa en las mismas entradas de test:

| Modelo | Precision | Latencia por entrada |
|---|---|---|
| gemma4:26b (sin entrenar, con prompting) | 89,0% | 10,8 s (8 nucleos) |
| kalparso-mdistil (este modelo, int8) | 83,6% | 9 ms (1 nucleo) |
| gemma3:27b | 82,3% | no disponible |
| qwen3:32b | 69,8% | no disponible |
| llama3.1:8b | 52,3% | no disponible |
| dateparser | 20,8% | no disponible |

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo está diseñado para inferencia en CPU.
- GPU recomendadas: no necesarias. El entrenamiento se realizó en una NVIDIA T4; para fine-tuning adicional, cualquier GPU con al menos 8 GB es suficiente.
- Cabe en GPU de consumo: sí, aunque no es su objetivo; también en CPU de consumo y en dispositivos de borde.
- Opciones de despliegue: ONNX Runtime (librería principal), con los ficheros `onnx/model.onnx` o `onnx/model.int8.onnx`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de clasificación, no generativo.
- Latencia y throughput: 9 ms por entrada en int8 y 18 ms en fp32 sobre un Intel Core i7-9700 a 35 W y un solo hilo; el throughput escala linealmente con el número de hilos disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kalparso-mdistil (este) | 135M | 64 tokens | 83,6% (int8) / 85,0% (fp32) | Apache 2.0 | HuggingFace |
| kalparso-xlmr | no disponible | no disponible | no disponible (recomendado por el autor) | no disponible | HuggingFace |
| kalparso-muril | no disponible | no disponible | no disponible (el más preciso según el autor) | no disponible | HuggingFace |
| gemma4:26b (prompted) | 26B (aprox.) | no disponible | 89,0% | no disponible | Ollama |

El autor publica dos variantes adicionales de la misma familia: `kalparso-xlmr` (recomendada) y `kalparso-muril` (la más precisa), ambas sin datos de parámetros, contexto ni licencia en la información disponible. Frente a LLM generalistas, este modelo sacrifica unos puntos de precisión (83,6% frente al 89,0% de gemma4:26b) a cambio de tres órdenes de magnitud menos de latencia y un consumo de recursos muy inferior.

## Limitaciones y advertencias

- El grounding sigue las convenciones escritas del dataset (por ejemplo, "agle Friday" como el viernes próximo); es necesario leer `spec.md` del dataset antes de confiar en casos límite.
- Entrenado mayoritariamente con hinglish en escritura latina; en hindi formal en devanagari el modelo MuRIL encuentra expresiones temporales zero-shot (F1 85,8 en NTX), pero el léxico del grounder no las cubre.
- El conjunto de test humano fue escrito por un único hablante, por lo que la precisión puede diferir con los hábitos de otros usuarios.
- Longitud máxima de 64 tokens: entradas más largas requieren truncado o segmentación previa.
- Riesgo de error en expresiones temporales ambiguas o fuera de las convenciones del dataset; el modelo no genera texto ni razona, solo clasifica.
- No apto para tareas generativas, tool calling ni agentes; es un componente especializado dentro de un pipeline mayor.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del dataset subyacente (KalParso y PHINC) si se redistribuye el modelo entrenado.
- Sin descargas ni likes en el momento de la consulta; el paper está en revisión, por lo que los resultados pueden cambiar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imsg8/kalparso-mdistil
- Dataset KalParso: https://huggingface.co/datasets/imsg8/kalparso
- Código, entrenamiento y evaluación: https://github.com/imsg8/kalparso
- Variante recomendada: https://huggingface.co/imsg8/kalparso-xlmr
- Variante más precisa: https://huggingface.co/imsg8/kalparso-muril
