# JONNYVERSE/distilbart-cnn-6-6

## Resumen

El modelo `JONNYVERSE/distilbart-cnn-6-6` es una conversión a formato ONNX del modelo original `sshleifer/distilbart-cnn-6-6`, un transformador destilado de la arquitectura BART especializado en resumen abstractivo de texto. El autor, JONNYVERSE, ha publicado estos pesos para que el modelo sea compatible con la librería Transformers.js, lo que permite ejecutar tareas de resumen directamente en el navegador o en entornos Node.js sin necesidad de un servidor dedicado.

El modelo base fue desarrollado por Hugging Face (sshleifer) como una versión comprimida de BART-large, con 6 capas de encoder y 6 de decoder, entrenado sobre el dataset CNN/DailyMail. Esta versión ONNX mantiene las mismas capacidades de resumen que el original, pero en un formato optimizado para inferencia en JavaScript mediante ONNX Runtime Web. El repositorio tiene un tamaño de 18 GB, lo que sugiere pesos en precisión completa (float32), aunque no se especifican cuantizaciones.

La relevancia de este modelo radica en su utilidad práctica para aplicaciones web y móviles que necesitan resumir documentos de forma local, preservando la privacidad de los datos y reduciendo la latencia de red. Es una opción ligera frente a modelos más grandes como BART-large o T5, manteniendo un equilibrio razonable entre calidad y eficiencia para la tarea de resumen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART destilado (DistilBART) con 6 capas encoder y 6 decoder |
| Parametros totales | no disponible (el modelo original tiene aproximadamente 200 millones, pero no se confirma en esta version) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tipicamente 1024 tokens en el modelo original) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX, posiblemente float32) |
| Idiomas soportados | no disponible (el modelo original esta entrenado principalmente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base `sshleifer/distilbart-cnn-6-6` es una version destilada de BART-large, un transformador encoder-decoder con atencion completa. La destilacion reduce el numero de capas de 12 a 6 tanto en el encoder como en el decoder, manteniendo la misma dimensionalidad oculta que el modelo grande. Fue entrenado sobre el dataset CNN/DailyMail para la tarea de resumen abstractivo, utilizando una combinacion de perdida de destilacion (distillation loss) y perdida de supervisión sobre los resumenes de referencia.

Esta version concreta no introduce innovaciones tecnicas adicionales, ya que se trata de una conversion de pesos a ONNX mediante la herramienta Optimum de Hugging Face. El proceso de conversion no altera los pesos ni la arquitectura, solo cambia el formato de serializacion para que sea ejecutable con ONNX Runtime, que es el motor subyacente de Transformers.js. No se ha realizado ningun entrenamiento adicional sobre estos pesos.

## Capacidades

- Generacion de resumenes abstractivos de texto, condensando articulos o documentos en frases mas cortas y coherentes.
- Generacion de texto secuencia a secuencia, aunque esta optimizado especificamente para resumen y no para generacion libre.
- Soporte de tareas de text2text como traduccion o parafraseo, con calidad inferior al resumen.
- No dispone de tool calling, function calling ni capacidades de agente.
- No tiene modo de razonamiento explicito ni soporte multimodal (solo texto).
- Capacidades multilingues limitadas: el entrenamiento en CNN/DailyMail (ingles) restringe su rendimiento en otros idiomas.

## Casos de uso

- Resumen de articulos en el navegador: integrar el modelo en una extension de Chrome o en una aplicacion web para que los usuarios resuman noticias o entradas de blog sin enviar el contenido a un servidor externo, garantizando privacidad.
- Resumen de documentos en aplicaciones Node.js: procesar informes, actas o correos electronicos en un backend ligero, usando Transformers.js con onnxruntime-node, sin necesidad de GPU dedicada.
- Aplicaciones offline de productividad: herramientas de escritorio que resuman documentos locales (PDF, texto plano) sin conexion a internet, gracias a la ejecucion local del modelo.
- Preprocesamiento de datos para pipelines de NLP: reducir la longitud de textos antes de pasarlos a modelos de clasificacion o extraccion de entidades, mejorando la eficiencia computacional.
- Resumen de contenido generado por usuarios en foros o redes sociales: condensar hilos largos o comentarios para facilitar la moderacion o la lectura rapida.
- Asistentes virtuales de lectura: aplicaciones moviles que ofrecen resumenes de articulos guardados, ejecutando el modelo en el dispositivo para minimizar el consumo de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `sshleifer/distilbart-cnn-6-6` reporta metricas ROUGE sobre CNN/DailyMail en su pagina de Hugging Face, pero estos datos no se incluyen en la documentacion de esta version ONNX ni en los resultados de busqueda web. Por tanto, no se pueden presentar cifras concretas de rendimiento sin riesgo de inventar datos.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de aproximadamente 200 millones de parametros, la inferencia en CPU es viable (aunque lenta). Con cuantizacion a int8, podria caber en GPUs con 4 GB de VRAM, pero no se ofrecen pesos cuantizados en este repositorio.
- GPUs recomendadas: no se especifican. En un entorno de servidor, una GPU como la NVIDIA T4 o RTX 2080 Ti seria suficiente para inferencia en lote. Para el navegador, se usa la GPU integrada via WebGL o WebGPU.
- Compatibilidad con GPUs de consumo: si se cuantiza el modelo manualmente, una RTX 3060 o superior podria ejecutarlo, pero el tamaño de 18 GB en float32 hace que sea impracticable en GPUs de menos de 16 GB sin cuantizacion.
- Opciones de despliegue: Transformers.js (navegador o Node.js), ONNX Runtime Web, ONNX Runtime Node, o servidores como ONNX Runtime Server. No es compatible directamente con vLLM o llama.cpp, que estan orientados a otros formatos.
- Latencia y throughput: no disponibles. En CPU, la generacion de un resumen de 100 tokens puede tardar varios segundos; en GPU, se reduce a menos de un segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Formato |
|---|---|---|---|---|---|
| `sshleifer/distilbart-cnn-6-6` (original) | ~200M | 1024 | Resumen | Apache-2.0 | PyTorch |
| `JONNYVERSE/distilbart-cnn-6-6` (este) | ~200M | no disponible | Resumen | Apache-2.0 | ONNX |
| `facebook/bart-large-cnn` | 400M | 1024 | Resumen | Apache-2.0 | PyTorch |
| `t5-small` | 60M | 512 | Text2Text | Apache-2.0 | PyTorch |

La comparacion con `facebook/bart-large-cnn` muestra que DistilBART es aproximadamente la mitad de parametros, lo que implica menor latencia y uso de memoria, a costa de una ligera perdida en calidad de resumen (medida por ROUGE). Frente a `t5-small`, DistilBART ofrece mejor calidad en resumen especifico, pero T5 es mas flexible para otras tareas. No se dispone de datos de rendimiento cuantitativos para esta version ONNX.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado con articulos de CNN y DailyMail, que reflejan un sesgo hacia noticias en ingles y estilos periodisticos anglosajones. Puede no capturar matices de otros generos textuales.
- Riesgo de alucinacion: como todo modelo generativo, puede producir resumenes que contengan informacion no presente en el texto original, especialmente si el texto de entrada es ambiguo o muy largo.
- Limitaciones de contexto: la ventana de contexto es de 1024 tokens (segun el modelo original), por lo que textos mas largos deben truncarse, perdiendo informacion relevante.
- Limitaciones de idioma: su entrenamiento exclusivo en ingles limita seriamente su uso en otros idiomas; los resumenes en castellano o frances seran de baja calidad.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia al redistribuir el modelo.
- Advertencia para produccion: el tamaño del repositorio (18 GB) sugiere que los pesos no estan cuantizados, lo que puede causar problemas de memoria en dispositivos con recursos limitados. Se recomienda cuantizar a int8 o float16 antes de un despliegue masivo.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/JONNYVERSE/distilbart-cnn-6-6
- Modelo original: https://huggingface.co/sshleifer/distilbart-cnn-6-6
- Articulo de aiindigo.com sobre DistilBART-CNN-6-6: https://aiindigo.com/blog/distilbart-cnn-6-6-the-practical-choice-for-efficient-summarization-in-2026
- Pagina de PromptLayer: https://www.promptlayer.com/models/distilbart-cnn-6-6/
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Documentacion de Optimum para conversion ONNX: https://huggingface.co/docs/optimum/index
