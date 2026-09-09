# nik-hill/Hindi_Offline_Handwritten_OCR

## Resumen

El modelo `nik-hill/Hindi_Offline_Handwritten_OCR` es un sistema de reconocimiento optico de caracteres (OCR) especializado en texto hindi escrito a mano. Ha sido desarrollado por `nik-hill` y se distribuye bajo licencia MIT, lo que permite su uso libre incluso en proyectos comerciales. Su funcion principal es recibir una imagen con texto manuscrito en devanagari y generar una transcripcion textual en hindi. Es relevante porque la mayoria de los OCR comerciales estan orientados al texto impreso y a idiomas como ingles, quedando la escritura manual en hindi infrarrepresentada.

Desde el punto de vista tecnico, el modelo combina un codificador de vision basado en un Vision Transformer (ViT) con un decodificador de lenguaje basado en un modelo RoBERTa preentrenado en hindi. Se trata de una arquitectura Vision Encoder-Decoder clasica en lugar de un modelo autoregresivo generativo de proposito general. El modelo tiene 167.560.506 parametros totales y esta publicado en formato safetensors, con un peso aproximado de 0,7 GB. En cuanto al contexto, el autor indica que la salida esta optimizada para textos de hasta 64 caracteres, lo que limita su uso a palabras o frases breves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Encoder-Decoder (ViT + RoBERTa) |
| Parámetros totales | 167.560.506 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | No disponible; salida limitada a 64 caracteres segun el autor |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Hindi (`hi`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se compone de dos modulos encadenados. El codificador es `google/vit-base-patch16-224-in21k`, un Vision Transformer de 86 millones de parametros preentrenado en ImageNet-21k, que procesa la imagen de entrada en parches de 16x16 pixeles a resolucion 224x224. El decodificador es `surajp/RoBERTa-hindi-guj-san`, un modelo RoBERTa preentrenado sobre corpus en hindi, gujarati y sanscrito, que ha sido afinado para generar texto condicionado a las caracteristicas visuales extraidas por el codificador. Esta combinacion permite un acoplamiento eficiente entre vision y lenguaje sin necesidad de un modelo de texto de proposito general.

En la fase de entrenamiento se utilizo un dataset de manuscritos hindi escaneados. El autor no especifica el numero de muestras ni la composicion exacta del corpus. La funcion de perdida empleada fue cross-entropy y el optimizador Adam con una tasa de aprendizaje de `5e-5`. Los valores de perdida reportados son 0,0638 en entrenamiento y 0,2011 en validacion, lo que sugiere que el modelo esta razonablemente ajustado al conjunto de validacion sin presentar un sobreajuste extremo. No se menciona el uso de tecnicas como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Reconocimiento optico de caracteres (OCR) de texto hindi manuscrito a partir de imagenes en formato JPG, PNG o JPEG.
- Generacion de texto en hindi como salida de la transcripcion.
- Inferencia en local, sin necesidad de conexion a internet durante la prediccion.
- Limitado a texto corto: el autor reporta una longitud maxima de salida de 64 caracteres.
- No soporta tool calling, function calling ni interaccion con agentes.
- No dispone de modo de pensamiento, razonamiento multi-paso ni capacidades de vision general; su unica entrada es una imagen con texto.
- No es un modelo multimodal de proposito general: esta especializado en OCR de hindi.

## Casos de uso

- Digitalizacion de formularios manuscritos en hindi: el modelo puede extraer respuestas breves de campos de formularios escaneados, como nombres, fechas o cantidad de un campo, y volcar el texto en una base de datos para automatizar procesos administrativos.
- Archivo de documentos historicos: permite convertir notas manuscritas antiguas en hindi a texto digital, facilitando la busqueda y el analisis posterior por investigadores o instituciones culturales.
- Transcripcion de apuntes academicos: estudiantes o docentes que escriben a mano pueden escanear o fotografiar sus cuadernos y obtener una version digital de las notas, siempre que los fragmentos no excedan los 64 caracteres.
- Accesibilidad para personas con discapacidad visual: la salida de texto puede alimentar un lector de pantalla o un sistema de sintesis de voz para leer documentos manuscritos en hindi.
- Automatizacion de censos y encuestas: cuando las respuestas de los participantes se registran a mano en papel, el modelo puede convertirlas en datos estructurados, reduciendo la transcripcion manual.
- Integracion en aplicaciones moviles de reconocimiento de texto offline: al ser un modelo ligero de 167 millones de parametros, puede desplegarse en dispositivos moviles para capturar y transcribir texto hindi escrito a mano sin depender de servicios en la nube.

## Benchmarks y rendimiento

Los unicos resultados publicados por el autor aparecen en la model card y se refieren a metricas sobre el conjunto de validacion.

| Metrica | Valor |
|---|---|
| Precision por caracter (validation) | 73,2 % |
| Perdida de entrenamiento | 0,063800 |
| Perdida de validacion | 0,201061 |
| CER (Character Error Rate) en validacion | 0,101732 |
| CER en test | 0,118332 |

No se han publicado comparativas con otros modelos OCR en la informacion disponible. Por tanto, no es posible situar estos numeros en un contexto competitivo.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP32: aproximadamente 670 MB, ya que el modelo completo ocupa unas 0,7 GB en disco. Con cuantizacion int8, la VRAM se reduciria a cerca de 335 MB, aunque no hay cuantizaciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM puede ejecutar el modelo sin problemas. Es suficiente una NVIDIA GTX 1050, RTX 3050 o similares. Tambien puede funcionar en CPU en modo `float32`, aunque la latencia sera mayor.
- Al no existir cuantizaciones oficiales, el despliegue en GPU de consumo es viable con el peso original. En CPUs modernas con soporte para inferencia de transformers, el modelo es manejable.
- Opciones de despliegue: se puede utilizar directamente con la libreria `transformers` de Hugging Face mediante `VisionEncoderDecoderModel`, `TrOCRProcessor` y `AutoFeatureExtractor`. No se han documentado integraciones especificas con vLLM, llama.cpp ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos equivalentes en la documentacion del autor. La informacion disponible no permite establecer una tabla comparativa fiable con otros OCR para hindi manuscrito.

## Limitaciones y advertencias

- El modelo esta optimizado exclusivamente para escritura hindi. El rendimiento sobre otros idiomas o documentos mixtos puede ser deficiente.
- La calidad de la salida depende en gran medida de la calidad de la imagen. Imagenes borrosas, con ruido, mala iluminacion o baja resolucion pueden degradar la precision.
- El autor limita la longitud de salida a 64 caracteres. Textos mas largos podrian truncarse o producir transcripciones inexactas.
- El modelo puede fallar con fuentes muy pequenas, con letras en cursiva o con trazos muy separados.
- Segun la seccion de consideraciones eticas, el modelo no deberia usarse en contextos donde una extraccion incorrecta del texto pueda causar danos, como analisis de documentos legales o medicos.
- No se han documentado sesgos especificos, pero el modelo fue entrenado con un dataset desconocido en cuanto a distribucion de edades, generos o estilos de escritura, por lo que podria comportarse peor con ciertos estilos caligraficos.
- El riesgo de alucinacion existe en el sentido de que el decodificador puede generar caracteres o palabras plausibles en hindi aunque no esten presentes en la imagen, sobre todo en zonas de baja calidad.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/nik-hill/Hindi_Offline_Handwritten_OCR](https://huggingface.co/nik-hill/Hindi_Offline_Handwritten_OCR)
- Demo en Hugging Face Spaces: [https://huggingface.co/spaces/sabaridsnfuji/Hindi_Offline_Handwritten_OCR](https://huggingface.co/spaces/sabaridsnfuji/Hindi_Offline_Handwritten_OCR)
