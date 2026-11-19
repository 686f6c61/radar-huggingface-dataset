# dsego/tempus-bert-mini-tagger

## Resumen

Tempus BERT-mini tagger es un modelo encoder de 11 millones de parámetros desarrollado por dsego que realiza extracción de horas del día en mensajes de chat en inglés. No es un modelo generativo: no escribe texto, sino que etiqueta cada token de un mensaje para identificar spans de tiempo y asignarles una hora y minuto concretos, resolviendo además si un "7" sin indicador explícito se refiere a la mañana o a la tarde a partir del contexto.

El modelo se construye sobre google/bert_uncased_L-4_H-256_A-4 (BERT mini, 4 capas, 256 dimensiones ocultas) y añade tres cabezas lineales por token: etiqueta de span (outside, begins, continues), hora (24 clases) y minuto (12 clases en pasos de 5 minutos). Se distribuye en formato ONNX, con versiones int8 (11 MB) y fp16 (21 MB), y está pensado para inferencia en CPU o incluso en el navegador con latencias de milisegundos.

Su relevancia radica en que ofrece una alternativa no generativa, extremadamente ligera y rápida, a los modelos de lenguaje pequeños que el mismo autor afina para la misma tarea. Frente al modelo generativo de 230M del proyecto (96,5% de exact match), este encoder alcanza un 93,8% con un coste computacional y de latencia dos órdenes de magnitud menor, lo que lo hace adecuado para aplicaciones de extracción de entidades en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT mini: 4 capas, 256 dim. ocultas), con tres cabezas lineales de clasificación por token |
| Parametros totales | 11 millones (aproximado, según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo BERT uncased, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | int8 (recomendado, 11 MB) y fp16 (21 MB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8.onnx, fp16.onnx) y vocab.txt (WordPiece BERT uncased) |

## Arquitectura y entrenamiento

El modelo parte de google/bert_uncased_L-4_H-256_A-4, un encoder BERT mini con 4 capas y 256 dimensiones ocultas. Sobre la representación de cada token se aplican tres cabezas lineales independientes: una de 3 clases para la etiqueta de span (outside, begins, continues), una de 24 clases para la hora (0-23) y una de 12 clases para el minuto (multiplicado por 5, cubriendo 0-55 en pasos de 5 minutos). La decodificación agrupa los tokens "begins" con los "continues" posteriores y recorta el span del mensaje original; no hay detección de dígitos por código, el modelo hace ambas cosas.

El entrenamiento se realizó durante 20 épocas sobre 11.299 mensajes sintéticos en inglés, conservando la época con mejor puntuación de validación. El proceso completo tarda unos 4 minutos en un portátil. Los datos de entrenamiento y evaluación son sintéticos, generados y verificados por modelos de lenguaje con una pequeña revisión humana. No se menciona uso de RLHF ni DPO, al tratarse de un modelo discriminativo de etiquetado.

## Capacidades

- Extracción de horas del día en mensajes de chat en inglés: identifica spans de tiempo y les asigna hora y minuto en formato de 24 horas.
- Resolución contextual de ambigüedad: decide si un "7" desnudo significa 07:00 o 19:00 según el contexto de la situación descrita.
- Etiquetado por token en una sola pasada: clasifica cada token como outside, begins o continues, y asigna hora y minuto en los tokens "begins".
- Manejo de "noon" y "midnight" como casos especiales.
- Inferencia en CPU y en navegador: latencias de milisegundos sin necesidad de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidad multilingüe: únicamente inglés.
- Ignora por diseño duraciones, tiempos relativos y periodos vagos.

## Casos de uso

- Extracción de horas en asistentes de mensajería: el modelo procesa cada mensaje entrante y devuelve los spans de tiempo normalizados a 24 horas, permitiendo crear recordatorios o eventos de calendario automáticamente a partir de conversaciones informales.
- Programación de reuniones en chats de equipo: al integrarse en un bot de Slack o Teams, detecta frases como "nos vemos a las 8pm" y propone la hora concreta en la zona horaria del usuario, con latencia inferior a 5 ms por mensaje en CPU.
- Preprocesamiento en pipelines de NLP: actúa como etapa de extracción de entidades temporales antes de un modelo generativo o de un sistema de reglas, reduciendo el coste total al resolver la parte fácil con un modelo de 11 MB.
- Aplicaciones web del lado del cliente: gracias a su formato ONNX y a la implementación en JavaScript del repositorio, puede ejecutarse en una pestaña del navegador (unos 4 ms por mensaje en un Apple M3 Pro), sin enviar datos a un servidor.
- Moderación y análisis de conversaciones: detecta menciones de horas en grandes volúmenes de mensajes para estudios de comportamiento o para señalar mensajes con referencias temporales que requieran revisión.
- Sistemas embebidos o de bajo consumo: al caber en 11 MB y ejecutarse en CPU, es viable en dispositivos con recursos limitados donde un modelo generativo de 230M no sería desplegable.
- Enriquecimiento de datasets: etiqueta automáticamente horas en corpus de chat para construir conjuntos de datos de entrenamiento o evaluación de otros sistemas de extracción temporal.

## Benchmarks y rendimiento

Los resultados se expresan como exact match por mensaje: todas las horas encontradas, con el span correcto y la lectura correcta en 24 horas. Se muestran los resultados de la mejor de tres ejecuciones de entrenamiento, seleccionada por estas mismas evaluaciones.

| Evaluacion | int8.onnx | fp16.onnx | Media de tres ejecuciones (precisión completa) |
|---|---|---|---|
| Principal (530 mensajes) | 93,8% | 93,8% | 93,4% |
| Principal, hora del día implícita solo por la situación | 84,7% | 84,7% | 83,8% |
| Nueva (378 mensajes de situaciones no vistas en entrenamiento) | 94,2% | 94,7% | 93,6% |
| Nueva, hora del día implícita solo por la situación | 83,6% | 85,1% | 82,1% |
| Falsas alarmas en 1.021 mensajes sin hora | 1,7% | 1,7% | 1,9% |

Como referencia, el modelo generativo de 230M del mismo proyecto alcanza un 96,5% y un 96,8% en las dos evaluaciones principales, con un 0,2% de falsas alarmas y unos 100 ms por mensaje en CPU.

Latencia por mensaje, incluyendo tokenización: aproximadamente 0,5 ms en un Apple M3 Pro, unos 4 ms en una pestaña del navegador en la misma máquina y 3,6 ms en 4 núcleos de un Ryzen 3600 compartido con otra carga de trabajo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exact match (principal) | Falsas alarmas | Licencia | Formato |
|---|---|---|---|---|---|---|
| dsego/tempus-bert-mini-tagger | 11M | no disponible | 93,8% | 1,7% | Apache 2.0 | ONNX |
| dsego/tempus-lfm2.5-230m | 230M | no disponible | 96,5% | 0,2% | no disponible en la información | no disponible |
| Modelos generativos pequeños del mismo proyecto | no disponible | no disponible | 96,8% (evaluación nueva) | 0,2% | no disponible | no disponible |

La comparación disponible se limita a los modelos del mismo proyecto. Frente a ellos, el tagger sacrifica entre 2 y 3 puntos de exact match y presenta más falsas alarmas, pero reduce el tamaño en más de 20 veces y la latencia en dos órdenes de magnitud. No se dispone de datos de otros modelos comparables de extracción temporal en la información proporcionada.

## Limitaciones y advertencias

- Resolución de 5 minutos: todas las horas del entrenamiento caen en múltiplos de 5, y una salida de clasificación no puede nombrar un valor no visto. "meet at 9:17" se lee como 09:15. Un modelo generativo copia los dígitos y no tiene esta limitación.
- Solo dígitos, además de "noon" y "midnight": las horas escritas con letras ("dinner at seven") no estaban en los datos de entrenamiento; el modelo puede etiquetarlas pero no las leerá correctamente.
- Rendimiento débil cuando la hora del día requiere conocimiento de la vida cotidiana: alrededor del 84% en esos mensajes, frente al 91% o más de los modelos generativos. Un encoder de 11M conoce mucho menos del mundo.
- Solo inglés: no soporta otros idiomas.
- Ignora por diseño duraciones, tiempos relativos y periodos vagos.
- Datos de entrenamiento y evaluación sintéticos, generados y comprobados por modelos de lenguaje con una pequeña revisión humana, lo que puede introducir sesgos o artefactos del generador.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos sintéticos deben verificarse para cumplir con las condiciones de sus respectivas fuentes.
- Riesgo de alucinación limitado al no ser generativo, pero puede producir falsas alarmas (1,7% en mensajes sin hora) o asignar horas incorrectas en contextos ambiguos.
- No apto para tareas de generación de texto, razonamiento, código, matemáticas, visión o tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dsego/tempus-bert-mini-tagger
- Modelo base: https://huggingface.co/google/bert_uncased_L-4_H-256_A-4
- Repositorio del proyecto (código, datos y comparación completa): https://github.com/dsegovia90/tempus_finetune
- Modelo generativo de referencia del mismo proyecto: https://huggingface.co/dsego/tempus-lfm2.5-230m
