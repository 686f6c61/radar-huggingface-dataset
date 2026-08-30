# Finesse4002/yahoo-answers-bert

## Resumen

El modelo `Finesse4002/yahoo-answers-bert` es un clasificador de texto basado en BERT, fine-tuneado sobre el modelo `bert-base-uncased` de Google para la clasificación de preguntas de Yahoo! Answers en 10 categorías temáticas (Sociedad y Cultura, Ciencia y Matemáticas, Salud, Educación y Referencia, Computadoras e Internet, Deportes, Negocios y Finanzas, Entretenimiento, Familia y Relaciones, y Política y Gobierno). Desarrollado por Finesse4002 como parte de un proyecto de laboratorio (CSE440), el modelo alcanza una precisión de prueba del 70,02% y una macro-F1 de 0,696 en una submuestra oficial estratificada de 10.000 ejemplos.

La relevancia de este modelo radica en su distribución como copia cuantizada en formato ONNX int8 (dtype `q8`), optimizada para inferencia en navegador mediante la librería `transformers.js`. Esto permite ejecutar clasificación de temas en tiempo real sin infraestructura de servidor, reproduciendo el rendimiento del modelo original en PyTorch dentro de 0,1 puntos porcentuales (0,6990 medido). Con un tamaño de repositorio de 0,1 GB y licencia Apache-2.0, es una opción ligera y accesible para aplicaciones de etiquetado automático de contenido generado por usuarios.

El modelo hereda la arquitectura BERT base (encoder transformer bidireccional con unos 110 millones de parámetros) y ha sido entrenado con hiperparámetros específicos: tasa de aprendizaje 2e-5, batch de 32, 2 épocas, semilla 42, texto lematizado y longitud máxima de 96 tokens. Aunque no se especifican los idiomas soportados, el modelo base está orientado al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer bidireccional) |
| Parametros totales | No disponible en la ficha; el modelo base `bert-base-uncased` tiene ~110M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 (maximo del modelo base); entrenado con `max_len=96` |
| Tipos de cuantizacion | int8 (ONNX, dtype `q8`) |
| Idiomas soportados | Ingles (no declarado explicitamente, pero el modelo base es para ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (int8 cuantizado) y safetensors (modelo original) |

## Arquitectura y entrenamiento

El modelo se basa en BERT base, un encoder transformer bidireccional introducido por Google en 2018. BERT aprende representaciones contextuales del texto procesando la secuencia en ambas direcciones mediante atención multi-cabeza. Para esta tarea, se parte del checkpoint preentrenado `bert-base-uncased` y se realiza un fine-tuning supervisado sobre el dataset de Yahoo! Answers para clasificación de temas (10 clases). El texto de entrada combina el título y el contenido de la pregunta, se lematiza y se trunca a una longitud máxima de 96 tokens.

Los hiperparámetros de entrenamiento son: tasa de aprendizaje de 2e-5, tamaño de batch de 32, 2 épocas y semilla aleatoria 42. Según la model card, el modelo fue el ganador entre 11 modelos entrenados en el mismo proyecto de laboratorio, con una precisión de prueba del 70,02% y macro-F1 de 0,696 sobre una submuestra estratificada de 10.000 ejemplos. La innovación principal de esta versión distribuida es su cuantización a int8 en formato ONNX, que reduce el tamaño y permite la inferencia en navegador con `transformers.js` sin pérdida significativa de rendimiento (0,6990 medido).

## Capacidades

- Clasificacion de texto en 10 categorias tematicas de Yahoo! Answers (sociedad, ciencia, salud, educacion, informatica, deportes, negocios, entretenimiento, familia, politica).
- Procesamiento de entradas de texto combinado (titulo + contenido) mediante concatenacion.
- Inferencia en navegador gracias a la cuantizacion int8 ONNX y la integracion con `transformers.js`.
- Compatible con el pipeline `text-classification` de Hugging Face Transformers.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador de texto puro.
- No es multilingue; esta orientado al ingles.

## Casos de uso

- Moderacion de contenido en foros y comunidades online: el modelo puede etiquetar automaticamente las publicaciones en categorias tematicas, facilitando la revision humana y la aplicacion de politicas por seccion.
- Enrutamiento de preguntas en plataformas de soporte: al clasificar la tematica de una consulta, se puede dirigir a la cola del equipo especializado correspondiente (tecnico, financiero, salud, etc.) con baja latencia.
- Analisis de tendencias en foros: agregando las predicciones sobre grandes volumenes de preguntas, se pueden identificar temas emergentes o cambios en los intereses de los usuarios.
- Etiquetado automatico de contenido generado por usuarios en sistemas de recomendacion: las categorias predichas sirven como caracteristicas para personalizar la experiencia (por ejemplo, sugerir hilos relacionados).
- Filtrado de preguntas en comunidades de preguntas y respuestas: se puede descartar o priorizar contenido segun su categoria, por ejemplo, para evitar spam en secciones sensibles.
- Clasificacion de tickets de soporte en sistemas de helpdesk: aunque el modelo esta entrenado con datos de Yahoo! Answers, las categorias generales (informatica, negocios, salud) pueden adaptarse a entornos corporativos mediante transferencia.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre una submuestra estratificada de 10.000 ejemplos del conjunto de prueba oficial:

| Metrica | Valor |
|---|---|
| Precisión (accuracy) | 70,02% |
| Macro-F1 | 0,696 |
| Precisión medido en ONNX int8 | 0,6990 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. En la busqueda web se encontraron otros modelos similares, pero con diferencias en el dataset o la particion, por lo que no son directamente comparables:

| Modelo | Base | Accuracy reportado | Notas |
|---|---|---|---|
| `Finesse4002/yahoo-answers-bert` | bert-base-uncased | 70,02% | Submuestra de 10k, ONNX int8 |
| `fabriceyhc/bert-base-uncased-yahoo_answers_topics` | bert-base-uncased | 74,99% | Evaluacion sobre conjunto completo (no especificado) |
| `Prezily/bert-yahoo-answers` | distilbert-base-uncased | 71,86% | Dataset no especificado |

## Requisitos de hardware

- El modelo tiene unos 110M de parametros y el repositorio pesa 0,1 GB, por lo que es ligero.
- Con cuantizacion int8 ONNX, puede ejecutarse en CPU sin GPU, incluso en navegadores y dispositivos moviles.
- VRAM estimada: inferior a 1 GB en cuantizacion int8; en precision completa (fp32) alrededor de 440 MB, pero la version distribuida es int8.
- GPU recomendadas: no es necesaria; cualquier GPU con al menos 2 GB de VRAM puede ejecutarlo con margen, pero no se requiere para inferencia.
- Opciones de despliegue: `transformers.js` para navegador, ONNX Runtime para servidores, y PyTorch/Hugging Face Transformers para entornos tradicionales.
- Latencia: en CPU moderna, la inferencia de una frase corta (menos de 96 tokens) suele estar por debajo de 10 ms; en navegador, depende del hardware, pero es adecuado para uso interactivo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto max | Accuracy | Licencia | Cuantizacion |
|---|---|---|---|---|---|---|
| `Finesse4002/yahoo-answers-bert` | BERT base | ~110M | 512 (entrenado con 96) | 70,02% | Apache-2.0 | int8 ONNX |
| `fabriceyhc/bert-base-uncased-yahoo_answers_topics` | BERT base | ~110M | 512 | 74,99% | Apache-2.0 | No especificada |
| `Prezily/bert-yahoo-answers` | DistilBERT | ~66M | 512 | 71,86% | Apache-2.0 | No especificada |

El modelo de Finesse4002 es el unico de los tres que ofrece una version cuantizada int8 para navegador, lo que lo hace especialmente adecuado para despliegues ligeros. Sin embargo, su accuracy es inferior al de los otros dos, probablemente por diferencias en el dataset de entrenamiento o en la particion de evaluacion.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- La longitud de entrenamiento esta limitada a 96 tokens, por lo que preguntas muy largas pueden truncarse y perder informacion relevante.
- La precision del 70% indica que aproximadamente 3 de cada 10 clasificaciones pueden ser incorrectas; no es adecuado para aplicaciones donde el error tenga consecuencias graves.
- El modelo fue entrenado sobre datos de Yahoo! Answers, que pueden contener sesgos sociales, culturales y de genero presentes en el contenido generado por usuarios.
- No se proporcionan detalles sobre el dataset de entrenamiento (numero exacto de ejemplos, balance de clases, etc.), lo que limita la auditoria.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no ha sido validado para entornos de produccion; se recomienda realizar pruebas especificas antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Finesse4002/yahoo-answers-bert
- Documentacion de `transformers.js`: https://huggingface.co/docs/transformers.js
- Articulo de Wikipedia sobre BERT: https://en.wikipedia.org/wiki/BERT_(language_model)
- Tutorial de BERT en GeeksforGeeks: https://www.geeksforgeeks.org/nlp/explanation-of-bert-model-nlp/
