# farukdanis/eacem-compass-minilm

## Resumen

EACEM Compass MiniLM es una conversión a ONNX del modelo de embeddings `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, publicada por el usuario farukdanis bajo licencia Apache-2.0. No se trata de un modelo nuevo ni de un entrenamiento propio: el repositorio contiene los pesos del modelo original de Sentence Transformers exportados al formato ONNX para que puedan ejecutarse directamente en el navegador o en Node.js mediante la librería Transformers.js. Su función es la extracción de características (feature-extraction), es decir, generar representaciones vectoriales densas de textos para tareas de similitud semántica, búsqueda o clustering.

El modelo subyacente es un BERT multilingüe destilado (MiniLM) de aproximadamente 118 millones de parámetros, diseñado para producir embeddings de 384 dimensiones en 50 idiomas. La relevancia de esta ficha radica en que permite desplegar búsqueda semántica multilingüe en entornos JavaScript sin backend, aunque el repositorio en sí es una conversión de formato y no aporta mejoras de rendimiento sobre el original.

El repositorio tiene un tamaño de 2,1 GB, lo que incluye los pesos en varios formatos y precisiones (FP32, FP16, INT8 y cuantizaciones ONNX). La model card está parcialmente en turco e indica que el modelo se utiliza en el producto "EACEM Compass" de la empresa DNS Bilişim, sin aportar detalles adicionales sobre el entrenamiento o la evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L12, 12 capas) |
| Parametros totales | aproximadamente 118 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (valor estandar del modelo base paraphrase-multilingual-MiniLM-L12-v2) |
| Tipos de cuantizacion | ONNX en FP32, FP16, INT8 y cuantizaciones Q4/Q8 (segun estructura tipica de repositorios Xenova) |
| Idiomas soportados | multilingue (50 idiomas en el modelo base; la model card no detalla la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con version tambien en safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer tipo BERT con 12 capas, 384 dimensiones ocultas y 12 cabezas de atencion, correspondiente a la variante MiniLM-L12. El modelo base `paraphrase-multilingual-MiniLM-L12-v2` fue entrenado por Sentence Transformers mediante destilacion de conocimiento a partir de un modelo profesor multilingüe y ajuste con pares de frases parafraseadas en multiples idiomas, empleando una funcion de perdida contrastiva (Multiple Negatives Ranking Loss). El resultado es un modelo que mapea frases semanticamente equivalentes a vectores cercanos en un espacio de 384 dimensiones.

Esta publicacion concreta no aporta entrenamiento adicional: es una exportacion a ONNX realizada con Optimum y estructurada para Transformers.js. No se documentan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO (en el modelo base no se emplean, al ser un modelo de embeddings). La innovacion tecnica es puramente de despliegue: permite ejecutar inferencia de embeddings en el navegador mediante WebAssembly/WebGPU sin necesidad de servidor.

## Capacidades

- Generacion de embeddings de frases y parrafos de 384 dimensiones para similitud semantica.
- Busqueda semantica multilingue y cross-lingual (consultas en un idioma contra documentos en otro).
- Clustering y deduplicacion de textos por similitud coseno.
- Clasificacion de textos mediante embeddings como caracteristicas de entrada.
- Deteccion de parafrasis y similitud entre pares de frases.
- Ejecucion en navegador y Node.js mediante Transformers.js (sin backend).
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- No dispone de modo de razonamiento (thinking mode) ni de capacidades multimodales.

## Casos de uso

- Busqueda semantica en aplicaciones web front-end: al ejecutarse con Transformers.js en el navegador, permite indexar y consultar documentos locales sin enviar datos a un servidor, util para aplicaciones de privacidad estricta.
- Sistemas de preguntas frecuentes multilingues: el modelo puede emparejar la consulta del usuario con la respuesta mas cercana semanticamente en 50 idiomas, adecuado para bases de conocimiento pequenas o medianas.
- Deduplicacion de registros en pipelines de datos: generando embeddings de campos de texto y aplicando umbrales de similitud coseno para detectar duplicados en catalogos de productos o tickets de soporte.
- Clasificacion zero-shot ligera: usando los embeddings como entrada a un clasificador lineal entrenado con pocos ejemplos, util para etiquetar correos o mensajes en entornos con recursos limitados.
- Recomendacion de contenido: calcular similitud entre el historial de lectura de un usuario y articulos candidatos para generar recomendaciones en tiempo real del lado del cliente.
- Moderacion o agrupamiento de comentarios: agrupar mensajes similares por tematica para priorizar la revision humana, aprovechando la capacidad multilingue del modelo.
- Prototipado rapido en JavaScript: integracion en demos web o extensiones de navegador sin infraestructura de GPU ni servidor de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MTEB, STS, etc.) ni comparaciones con otros modelos. El modelo base `paraphrase-multilingual-MiniLM-L12-v2` cuenta con resultados publicos en el leaderboard MTEB, pero no se reproducen aqui al no estar incluidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en FP32, 250 MB en FP16 y 120-150 MB en INT8 (estimacion a partir de los 118 millones de parametros del modelo base).
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. En GPU, cualquier tarjeta con al menos 1 GB de memoria libre es suficiente (GTX 1050, RTX 3050, etc.).
- Cabe en cualquier GPU consumer e incluso en dispositivos moviles y navegadores.
- Opciones de despliegue: Transformers.js (navegador y Node.js), ONNX Runtime, y el modelo base puede servirse con sentence-transformers, vLLM o TGI si se usa la version PyTorch original.
- Latencia y throughput: no disponibles en la informacion proporcionada. Para un modelo de este tamano se espera inferencia en decenas de milisegundos por frase en CPU moderna, pero no se confirma con datos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EACEM Compass MiniLM (esta ficha) | ~118 M | 128 tokens | multilingue (50) | Apache-2.0 | ONNX |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128 tokens | multilingue (50) | Apache-2.0 | safetensors / PyTorch |
| Xenova/paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128 tokens | multilingue (50) | Apache-2.0 | ONNX |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 tokens | ingles | Apache-2.0 | safetensors / ONNX |

La comparativa se limita a modelos de la misma familia o categoria de embeddings. El modelo de esta ficha es funcionalmente identico al original de Sentence Transformers y al de Xenova; la diferencia es el repositorio y el mantenimiento. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Es una conversion de formato, no un modelo nuevo: no aporta mejoras sobre el modelo base ni sobre la version de Xenova.
- Ventana de contexto limitada a 128 tokens; textos mas largos se truncan, lo que puede degradar la calidad de los embeddings en documentos extensos.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base (datos web multilingues), no evaluados en esta publicacion.
- No es un modelo generativo: no debe usarse para responder preguntas ni producir texto.
- La model card esta parcialmente en turco y no documenta el proceso de conversion, los datasets ni las evaluaciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni mantenimiento por parte de la comunidad.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base y de las dependencias de Transformers.js para uso comercial.
- El tamano del repositorio (2,1 GB) se debe a la inclusion de multiples precisiones; para despliegue conviene descargar solo la cuantizacion necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/farukdanis/eacem-compass-minilm
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Conversion ONNX de referencia: https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Documentacion de Optimum: https://huggingface.co/docs/optimum/index
- Paquete NPM de Transformers.js: https://www.npmjs.com/package/@huggingface/transformers
