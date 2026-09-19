# OrisTeam/Isolde

## Resumen
Isolde es un modelo de la serie Oris publicado por el equipo OrisTeam en HuggingFace. Segun las etiquetas del repositorio, se trata de un encoder de tipo BERT orientado a extraccion de caracteristicas (feature-extraction) y entrenado con el objetivo de masked language modeling. Con 16.872.704 parametros (aproximadamente 16,9 millones), es un modelo compacto, muy por debajo de los encoders BERT clasicos de 110 millones de parametros.

El modelo esta especializado en polaco (etiqueta de idioma `pl`) y se distribuye a traves de la libreria transformers con pesos en safetensors. El repositorio incluye la etiqueta `custom_code`, lo que implica que requiere codigo personalizado para su carga, y esta vinculado a la familia de herramientas Oris/OFlow (versiones `oflow-0.2`).

Su relevancia practica es limitada por el momento: no tiene descargas registradas, cuenta con un solo "like" y el acceso esta restringido (gated), de modo que cualquier uso requiere aceptar condiciones en HuggingFace. La informacion publica disponible no incluye detalles sobre datos de entrenamiento, longitud de contexto ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (segun etiquetas `bert`, `encoder`, `masked-language-modeling`) |
| Parametros totales | 16.872.704 (aproximadamente 16,9 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors, sin versiones GGUF ni cuantizadas |
| Idiomas soportados | Polaco (pl) |
| Licencia | oris-research-license (etiquetada como `license:other`) |
| Formato de pesos | safetensors |
| Libreria | transformers (requiere `custom_code`) |
| Pipeline declarado | feature-extraction |
| Familia / ecosistema | Oris, OFlow 0.2 |
| Tamano del repositorio | 0,1 GB |
| Acceso | Restringido (gated); requiere aceptar condiciones en HuggingFace |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento
La informacion disponible indica que Isolde es un encoder transformer de tipo BERT con objetivo de masked language modeling, utilizado para extraccion de caracteristicas. El recuento de parametros (16,9 M) situa al modelo en la gama compacta de la familia BERT, adecuada para tareas de representacion de texto y clasificacion sobre secuencias, mas que para generacion abierta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas especificas. Las etiquetas apuntan a una integracion con el ecosistema Oris/OFlow 0.2 y a la necesidad de cargar codigo personalizado (`custom_code`), pero no se detalla en que consiste dicha implementacion.

## Capacidades
- Representacion de texto y extraccion de caracteristicas (embeddings por secuencia o por token), segun el pipeline declarado `feature-extraction`.
- Modelado de lenguaje enmascarado (masked language modeling), lo que permite rellenar tokens enmascarados en una frase.
- Procesamiento de texto en polaco, unico idioma declarado en el repositorio.
- Base potencial para tareas derivadas mediante fine-tuning: clasificacion de texto, analisis de sentimiento, reconocimiento de entidades o similitud semantica (no confirmado en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (no es una capacidad esperable en un encoder).
- Soporte de agentes y razonamiento multi-paso: no disponible ni esperable en un modelo de este tipo.
- Capacidades especiales (modo thinking, vision, audio, generacion autoregresiva): no disponibles.

## Casos de uso
- Busqueda semantica en corpus polacos: el modelo puede generar embeddings de documentos y consultas para indexar y recuperar pasajes por similitud vectorial, aprovechando su naturaleza de encoder.
- Clasificacion de tickets de soporte en polaco: mediante fine-tuning de una cabeza de clasificacion sobre las representaciones del encoder, se pueden enrutar incidencias por categoria o urgencia.
- Moderacion de contenido en polaco: entrenando un clasificador sobre los embeddings, es posible detectar texto toxico o spam en foros y comentarios.
- Deduplicacion y agrupamiento de documentos: los embeddings permiten calcular similitud entre textos y agrupar documentos redundantes en un pipeline de procesado de datos.
- Preprocesado para RAG: usar Isolde como recuperador denso en una arquitectura de generacion aumentada por recuperacion sobre documentacion en polaco.
- Analisis de opiniones de clientes: extraccion de representaciones de resenas para clustering de temas o clasificacion de polaridad a partir de un conjunto etiquetado propio.
- Relleno de huecos en textos (masked language modeling): util para tareas auxiliares de normalizacion o completado de plantillas en flujos internos de anotacion.
- Extraccion de entidades con fine-tuning: adaptar el encoder a tareas de NER sobre dominios especificos en polaco.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 67 MB en fp32, 34 MB en fp16 y 17 MB en int8, calculado a partir de los 16,9 M de parametros. Estas cifras son estimaciones derivadas del tamano, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente (GTX 1050, RTX 3060, RTX 4090, A100, H100). El modelo no requiere aceleradores de gama alta.
- Inferencia en CPU: totalmente viable. Un procesador moderno puede ejecutar el modelo con latencias de milisegundos a decenas de milisegundos por lote pequeno.
- Dispositivos de borde: dado el tamano, es desplegable en Raspberry Pi y en entornos embebidos con recursos limitados (estimacion basada en el recuento de parametros).
- Opciones de despliegue: al ser un modelo de transformers con `custom_code`, la via natural es la libreria transformers de Python. No se confirma soporte en vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; llama.cpp y Ollama requeririan conversion a GGUF, y vLLM/TGI estan orientados a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas comparables: los enlaces recuperados corresponden a canales y listas de YouTube sin relacion con el proyecto. No se dispone de datos verificados de parametros, contexto, rendimiento o licencia de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias
- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de poder descargar los pesos.
- Licencia: `oris-research-license` (etiquetada como `license:other`). No se dispone del texto de la licencia en la informacion proporcionada, por lo que no puede confirmarse si permite uso comercial. Es imprescindible revisar los terminos antes de cualquier despliegue en produccion.
- Cobertura idiomatica: unicamente se declara polaco. No hay evidencia de soporte multilingue ni de castellano.
- Contexto: no se especifica la longitud maxima de secuencia. Al tratarse de un encoder tipo BERT, es habitual un limite en el entorno de los 512 tokens, pero este dato no se confirma en la documentacion disponible y debe verificarse antes de usarlo con entradas largas.
- Requiere `custom_code`: la carga del modelo puede requerir ejecutar codigo remoto del repositorio, lo que implica un riesgo de seguridad que conviene auditar antes de usarlo en entornos controlados.
- Riesgo de alucinacion: no aplica de forma directa a un encoder de extraccion de caracteristicas, pero si el modelo se usa para rellenado de mascaras, las predicciones pueden ser incorrectas o sesgadas.
- Sesgos: no hay informacion publicada sobre la composicion del corpus de entrenamiento, por lo que no pueden evaluarse sesgos de genero, ideologicos o demograficos.
- Madurez: el modelo no tiene descargas registradas y cuenta con un unico "like", lo que sugiere ausencia de validacion por parte de la comunidad. No se recomienda su uso en produccion sin una evaluacion propia.
- Ausencia de benchmarks: no existen resultados publicados que permitan comparar su calidad frente a alternativas consolidadas.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/OrisTeam/Isolde
- La busqueda web realizada no devolvio enlaces relevantes (papers, blogs, repositorios o demos) asociados a este modelo.
