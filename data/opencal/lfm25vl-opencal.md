# opencal/lfm25vl-opencal

## Resumen

LFM2.5-VL 450M - OpenCal fine-tune es un modelo de visión-lenguaje desarrollado por el usuario opencal, creado a partir del modelo base público `onnx-community/LFM2.5-VL-450M-ONNX`. El objetivo del fine-tuning es adaptar el modelo a la tarea de extracción de información a partir de fotografías de comidas y texto asociado, como parte de una aplicación web progresiva (PWA) de registro de comidas llamada OpenCal. El modelo resultante se ha exportado a formato ONNX en variantes fp16 y q4, lo que permite su ejecución en el navegador mediante transformers.js y WebGPU, tanto en dispositivos móviles como de escritorio.

El modelo tiene un tamaño de 450 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños optimizados para inferencia en el dispositivo. Al ser un modelo de visión-lenguaje, combina un encoder de visión con un decoder de lenguaje para generar descripciones o extraer texto de imágenes. La información disponible no incluye la longitud de contexto ni el detalle de la arquitectura interna, por lo que estos datos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (encoder de vision + decoder de lenguaje), basado en LFM2.5-VL 450M |
| Parametros totales | 450M |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, q4 (ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (archivos externos `_data`), config.json, tokenizer.json, etc. |

## Arquitectura y entrenamiento

La arquitectura del modelo se deriva del modelo base LFM2.5-VL 450M, que es un modelo de visión-lenguaje con un encoder de visión y un decoder de lenguaje. El fine-tuning realizado por OpenCal ha adaptado el modelo a la tarea de extracción de texto y descripciones a partir de fotografías de comidas. Los detalles específicos del entrenamiento, como el número de tokens, la composición del dataset o el uso de técnicas como RLHF o DPO, no se han publicado en la información disponible. El modelo se ha exportado a ONNX en dos variantes de cuantización (fp16 y q4), con los pesos en archivos externos, para facilitar su uso en entornos de inferencia en el navegador.

## Capacidades

- Generacion de texto a partir de imagenes: el modelo puede analizar fotografias de comidas y generar descripciones o extraer texto relevante.
- Extraccion de informacion de imagenes: esta especializado en la tarea de meal-photo + meal-text extraction, es decir, identificar y describir el contenido de una foto de una comida.
- Inferencia en el dispositivo: gracias a la exportacion a ONNX y al soporte de transformers.js / WebGPU, el modelo puede ejecutarse localmente en moviles y ordenadores de escritorio sin necesidad de servidores externos.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no se han documentado modos de pensamiento (thinking mode), vision adicional o soporte de audio.

## Casos de uso

- Registro de comidas en aplicaciones de nutricion: el modelo puede analizar una fotografia de un plato y generar una descripcion del contenido, facilitando el registro automatico de comidas en una PWA como OpenCal.
- Asistencia en diarios alimentarios: los usuarios pueden tomar una foto de su comida y el modelo extrae texto o etiquetas relevantes, reduciendo la necesidad de introduccion manual de datos.
- Aplicaciones de salud y bienestar: integracion en apps moviles que ayudan a los usuarios a monitorizar su alimentacion, proporcionando descripciones automaticas de las comidas fotografiadas.
- Demos de vision-lenguaje en el navegador: al ser un modelo pequeno y compatible con WebGPU, puede utilizarse en demos interactivas que se ejecutan directamente en el navegador sin backend.
- Educacion nutricional: el modelo puede utilizarse en herramientas educativas que muestran descripciones de alimentos a partir de imagenes, como apoyo a estudiantes o pacientes.
- Prototipado rapido de aplicaciones de vision: gracias a su formato ONNX y su integracion con transformers.js, es adecuado para prototipos que necesiten capacidades de vision-lenguaje en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo de 450M con cuantizacion q4, se espera que requiera menos de 1 GB de memoria para los pesos, pero no hay datos oficiales.
- GPU recomendadas: no disponible. Al ser un modelo ONNX compatible con WebGPU, puede ejecutarse en GPUs integradas o dedicadas de consumo, asi como en CPU.
- Si cabe en consumer GPU: probablemente si, dado su tamano reducido y las variantes cuantizadas, pero no hay confirmacion oficial.
- Opciones de despliegue: transformers.js en navegador (WebGPU), ONNX Runtime, y potencialmente otros entornos compatibles con ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo es un fine-tune de LFM2.5-VL 450M, pero no se han publicado datos comparativos con otras variantes o modelos de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser un modelo especializado en imagenes de comidas, podria presentar sesgos relacionados con la representacion de diferentes tipos de cocina o alimentos, aunque no se ha documentado.
- Riesgo de alucinacion: al ser un modelo pequeno, es probable que tenga limitaciones en la precision de las descripciones generadas, especialmente en imagenes ambiguas o poco comunes.
- Limitaciones de contexto o idioma: no se ha especificado la longitud de contexto ni los idiomas soportados, por lo que el rendimiento puede variar en funcion de la tarea y el idioma.
- Restricciones de licencia: la licencia no esta indicada, por lo que el uso comercial requiere verificacion previa con el autor.
- Caveats para produccion: al ser un modelo de vision-lenguaje pequeno, su capacidad de razonamiento complejo es limitada. Ademas, la exportacion a ONNX y el uso de cuantizacion pueden afectar a la precision en comparacion con el modelo original.

## Enlaces

- HuggingFace: https://huggingface.co/opencal/lfm25vl-opencal
