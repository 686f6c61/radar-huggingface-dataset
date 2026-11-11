# m-lagnajit/ctd-student-e

## Resumen

ctd-student-e es un clasificador de texto en ingles de aproximadamente 150 millones de parametros, construido sobre answerdotai/ModernBERT-base y publicado por Lagnajit Moharana. Su tarea no es generar texto, sino leer en una sola pasada un texto, una instruccion (la pregunta) y una lista de opciones, y devolver una probabilidad calibrada para cada opcion: cuando el modelo indica un 80% de confianza, la respuesta deberia ser correcta aproximadamente el 80% de las veces. Esta orientado a decisiones tipadas, es decir, elecciones entre etiquetas discretas con descripciones cortas, y se distribuye como un ensemble de tres estudiantes entrenados con semillas distintas cuyas probabilidades se promedian.

El modelo se entrena por destilacion de conocimiento desde un profesor de 7B, usando etiquetas blandas corregidas (corrected_soft_label) sobre las 16.995 preguntas de entrenamiento del dataset m-lagnajit/calibrated-typed-decisions, derivado de fuentes como CLINC150, Banking77, MASSIVE, GoEmotions, Amazon Polarity y SciCite. La variante "e" se selecciono por su comportamiento con conjuntos de etiquetas nuevos del mismo tipo: en SNIPS con 7 intenciones no vistas alcanza una exactitud de 0,965 y un ECE de 0,020, lo que la hace adecuada para reutilizar la calibracion en taxonomias nuevas.

Es relevante ahora porque aborda un problema practico de produccion: los clasificadores pequenos suelen dar probabilidades mal calibradas, y los LLM grandes son caros para clasificacion masiva. ctd-student-e ofrece latencia de un modelo de 150M con probabilidades utilizables directamente para umbrales de decision, enrutamiento o abstenccion. La contrapartida es que su calibracion solo es fiable en tipos de juicio similares a los de entrenamiento; en dominios nuevos como PubMedQA su exactitud cae al 0,607.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con un scorer lineal compartido sobre un marcador `[MASK]` antes de cada opcion |
| Parametros totales | Aproximadamente 150M por estudiante (ensemble de 3 estudiantes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens; las entradas mas largas se truncan (solo el texto, nunca las opciones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere transformers >= 4.48 y el modulo `ctd_student.py` del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer con atencion de contexto largo y sesgos rotatorios, y anade un unico scorer lineal compartido que puntua un marcador `[MASK]` insertado antes de cada opcion candidata. De este modo, una misma pasada del encoder evalua el texto, la instruccion y todas las opciones a la vez, con un maximo de 8 opciones. El ensemble agrega tres estudiantes entrenados con semillas distintas; cada semilla tiene sus propios "diales" de calibracion (una temperatura para preguntas de eleccion y, para preguntas de si/no, una temperatura mas un desplazamiento del sesgo hacia "si"), ajustados sobre la particion de validacion y guardados en `dials.json`.

El entrenamiento es por destilacion desde un profesor de 7B: el objetivo es la etiqueta blanda corregida del profesor, con sus elecciones principales erroneas rectificadas, sobre 16.995 preguntas. La receta usa 3 epocas, batch de 16, AdamW con weight decay 0,01, tasas de aprendizaje de 3e-5 para el cuerpo y 1e-3 para el scorer, 10% de warmup, recorte de gradiente de 1,0 y precision mixta, conservando la epoca con menor log loss de validacion. No se menciona RLHF ni DPO; la innovacion principal es el esquema de calibracion post-hoc por tipo de pregunta y la agregacion por ensemble.

## Capacidades

- Clasificacion de texto con conjunto de etiquetas abierto: recibe texto, instruccion y entre 2 y 8 opciones con descripciones opcionales.
- Preguntas de eleccion multiple (`choice`) y preguntas de si/no (`yes/no`).
- Salida de probabilidades calibradas por opcion, aptas para umbrales de decision y abstenccion.
- Prediccion por lotes mediante `student.predict(rows)` con campos `instructions`, `state`, `options`, `option_descriptions` y `type`.
- Generalizacion a conjuntos de etiquetas nuevos del mismo tipo de decision (por ejemplo, intenciones de un dominio no visto).
- Capacidad de "honestidad" ante incertidumbre: en tipos de juicio no familiares tiende a no sobreconfiar, aunque su conocimiento del dominio sea limitado.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: clasificar mensajes de usuario entre intenciones predefinidas con probabilidades calibradas, de modo que el sistema derive a un humano cuando la confianza maxima sea baja.
- Clasificacion de tickets de soporte: asignar cada ticket a una categoria nueva definida por el equipo sin reentrenar, aprovechando la generalizacion a conjuntos de etiquetas no vistos (0,965 de exactitud en SNIPS con 7 intenciones nuevas).
- Moderacion y triaje con umbral: usar el ECE bajo (0,014 en datos familiares) para fijar umbrales de autoaprobacion y revision manual con tasas de error predecibles.
- Analisis de sentimiento y emociones en resenas: reutilizar las fuentes de entrenamiento (Amazon Polarity, GoEmotions) para clasificar polaridad o emociones con probabilidades utilizables en agregados.
- Etiquetado asistido en anotacion de datos: predecir la etiqueta probable y su confianza para priorizar la revision humana, reduciendo coste de anotacion.
- Filtrado de candidatos en busqueda o recomendacion: puntuar la pertenencia de un texto a categorias descritas en lenguaje natural, con la opcion de descripcion corta por etiqueta.
- Verificacion de hipotesis simples en pipelines de datos: formular preguntas de si/no sobre registros (por ejemplo, si una cita cientifica respalda una afirmacion) y usar la probabilidad como senal, con cautela en dominios no familiares.

## Benchmarks y rendimiento

Resultados medidos sobre los ficheros del repositorio (ensemble de tres semillas, cada una con sus diales ajustados en validacion). La ultima columna recoge la media de estudiantes individuales y el rango entre parentesis.

| Test | Accuracy | ECE | Log loss | Log loss, estudiantes individuales |
|---|---|---|---|---|
| Datos familiares (split de test) | 0,920 | 0,014 | 0,237 | 0,260 (0,252-0,265) |
| Conjunto de etiquetas nuevo (SNIPS) | 0,965 | 0,020 | 0,114 | 0,125 (0,122-0,127) |
| Tipo de juicio nuevo (PubMedQA) | 0,607 | 0,097 | 0,918 | 0,925 (0,892-0,946) |

Referencias del autor para PubMedQA: responder siempre "si" obtiene una exactitud de 0,552, y predecir siempre las frecuencias de etiquetas obtiene un log loss de 0,937. Los numeros pueden diferir ligeramente de los del informe tecnico porque este uso las semillas 1 y 2 originales, cuyos pesos no se guardaron, mientras que el repositorio contiene la misma receta reentrenada con las mismas semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp16 para un estudiante de 150M; alrededor de 1,8 GB para el ensemble de tres estudiantes en fp16. El repositorio ocupa 0,9 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090 o RTX 3090 sobredimensiona el modelo, y una GTX 1660 o RTX 3060 ya permite lotes grandes.
- Cabe en GPU consumer: si, incluidas GPU de gama baja y CPU para lotes pequenos.
- Opciones de despliegue: el repositorio requiere cargar `ctd_student.py` con transformers >= 4.48; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, por lo que el despliegue habitual seria un servicio Python con PyTorch o exportacion a ONNX (no documentada).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Calibracion | Licencia |
|---|---|---|---|---|---|
| ctd-student-e | ~150M (x3 ensemble) | 512 tokens | Clasificacion con opciones y probabilidades calibradas | ECE 0,014 en datos familiares | Apache 2.0 |
| answerdotai/ModernBERT-base | ~149M | 8192 tokens | Encoder base, sin cabeza de clasificacion | No aplica | Apache 2.0 |
| Clasificador CLINC150 fine-tuned tipico | ~100-150M | 512 tokens | Clasificacion de intenciones cerrada | No documentada | Variable |
| LLM generativo de 7B como clasificador | ~7B | 8k-128k tokens | Clasificacion via prompting | Variable, generalmente sin calibrar | Variable |

La comparacion con alternativas concretas de la misma categoria (clasificadores calibrados con destilacion) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles; no soporta otros idiomas.
- Maximo de 8 opciones por pregunta.
- Las entradas de mas de 512 tokens se truncan; solo se recorta el texto, nunca las opciones.
- La calibracion esta ajustada sobre datos similares a las fuentes de entrenamiento; en tipos de juicio no familiares el modelo es honesto sobre su incertidumbre pero su conocimiento es escaso (exactitud de 0,607 en PubMedQA).
- Los diales de calibracion se ajustaron en datos familiares y pueden sobrecorregir o infracorregir en datos muy distintos.
- Riesgo de sesgo heredado de las fuentes de entrenamiento (CLINC150, Banking77, MASSIVE, GoEmotions, Amazon Polarity, SciCite), no cuantificado en la informacion disponible.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de asignar alta confianza a etiquetas incorrectas en dominios fuera de distribucion.
- Licencia Apache 2.0 en los pesos, compatible con uso comercial; los datos derivados tienen licencias CC BY 3.0, CC BY 4.0 y Apache 2.0 que deben respetarse en la atribucion.
- Requiere cargar codigo Python personalizado (`ctd_student.py`) desde el repositorio, lo que implica revisar y confiar en ese codigo antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m-lagnajit/ctd-student-e
- Dataset: https://huggingface.co/datasets/m-lagnajit/calibrated-typed-decisions
- Informe tecnico: https://lagnajitmoharana.web.app/calibrated-typed-decisions-technical-report.pdf
- Blog del autor: https://lagnajitmoharana.web.app/how-sure-is-sure-understanding-llm-calibration
- Codigo: https://github.com/Lagnajit09/100x_AI_ML/tree/main/calibrated-typed-decision
- Variante para datos como las fuentes de entrenamiento: https://huggingface.co/m-lagnajit/ctd-student-f
