# kerasformers/internvl3.5-30b-a3b

## Resumen

El modelo `kerasformers/internvl3.5-30b-a3b` es una conversión íntegra a Keras 3 del checkpoint `OpenGVLab/InternVL3_5-30B-A3B-HF`, desarrollado por el equipo de OpenGVLab. Se trata de un modelo multimodal de tipo imagen-texto a texto, con arquitectura de mezcla de expertos (MoE) de 30 mil millones de parámetros totales y 3 mil millones activos por token. La conversión, realizada por el autor `kerasformers`, permite ejecutar el mismo modelo sin modificaciones sobre TensorFlow, PyTorch o JAX mediante la librería KerasFormers, lo que facilita su integración en entornos heterogéneos.

InternVL3.5 representa la última generación de la familia InternVL y aporta mejoras significativas en razonamiento multimodal, comprensión visual y eficiencia de inferencia respecto a su predecesor InternVL3. Según los resultados publicados por OpenGVLab, esta versión logra hasta un +16,0% de mejora en tareas de razonamiento general y un incremento de 4,05 veces en velocidad de inferencia. El modelo está diseñado para tareas complejas de visión-lenguaje, incluyendo OCR, análisis de documentos, razonamiento visual y diálogo multimodal, y su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia actual de este modelo radica en su combinación de tamaño moderado (30B totales, 3B activos) con un rendimiento competitivo, lo que lo hace desplegable en una única GPU A100 según las indicaciones de OpenGVLab. La versión convertida a Keras 3 amplía aún más su accesibilidad al permitir su uso con múltiples backends, aunque el repositorio aún no registra descargas ni valoraciones, indicando que es una publicación reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), encoder de visión y decodificador de lenguaje |
| Parametros totales | 30 mil millones (30B) |
| Parametros activos | 3 mil millones (3B) por token |
| Longitud de contexto | no disponible (el modelo original InternVL3.5 soporta contexto largo, pero no se especifica el valor exacto en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (los pesos se almacenan en bfloat16 segun la model card, sin cuantizaciones predefinidas) |
| Idiomas soportados | ingles (segun la etiqueta `language` de HuggingFace; el modelo original soporta multilingue, pero esta conversion solo declara ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumiblemente, dado que el repo tiene 61.8 GB y la libreria KerasFormers usa ese formato; no se confirma explicitamente) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura InternVL3.5, que combina un encoder de vision (basado en ViT) con un decodificador de lenguaje de tipo MoE. La componente MoE activa solo 3 mil millones de parametros por token, lo que reduce sustancialmente el coste computacional en inferencia manteniendo la capacidad de un modelo de 30 mil millones. El entrenamiento original de InternVL3.5 incorpora una etapa ligera denominada Visual Consistency Learning (ViCO), que reduce el numero de tokens necesarios para representar un parche de imagen, mejorando la eficiencia en tareas visuales. No se dispone de detalles especificos sobre el volumen de datos de entrenamiento, la composicion del dataset o el uso de tecnicas de alineacion como RLHF o DPO en la informacion proporcionada.

La conversion a Keras 3 no altera los pesos originales, sino que los transpila al formato de la libreria KerasFormers, permitiendo ejecutar el modelo con backend TensorFlow, PyTorch o JAX mediante una unica implementacion. El proceso de conversion preserva la arquitectura y los pesos en bfloat16, tal como se indica en la model card. No se mencionan innovaciones adicionales en la conversion mas alla de la portabilidad entre frameworks.

## Capacidades

- Generacion de texto a partir de imagenes: el modelo acepta una imagen junto con una instruccion textual y produce una respuesta textual, cubriendo tareas de descripcion, analisis y razonamiento visual.
- Razonamiento multimodal complejo: segun los resultados de OpenGVLab, InternVL3.5 mejora significativamente el razonamiento general en tareas que combinan vision y lenguaje, con un incremento de hasta +16,0% respecto a InternVL3.
- OCR y extraccion de informacion visual: el modelo es capaz de reconocer texto en imagenes y documentos, lo que lo hace util para digitalizacion y procesamiento de documentos.
- Comprension de diagramas, graficos y figuras cientificas: puede interpretar contenido visual estructurado y responder preguntas sobre el.
- Dialogo multimodal multi-turno: soporta conversaciones en las que el usuario puede referirse a una imagen a lo largo de varios turnos, gracias a su arquitectura de decodificacion autoregresiva.
- Soporte de tool calling y function calling: no se menciona explicitamente en la informacion proporcionada, por lo que no se puede confirmar esta capacidad.
- Capacidades multilingues: aunque la etiqueta de HuggingFace solo declara ingles, el modelo original InternVL3.5 soporta multiples idiomas; sin embargo, esta conversion no garantiza el mismo nivel de soporte multilingue.

## Casos de uso

- Descripcion automatica de imagenes para accesibilidad: el modelo puede generar descripciones detalladas de fotografias o ilustraciones, facilitando la creacion de contenido accesible para personas con discapacidad visual. Su capacidad de razonamiento visual permite descripciones contextuales y precisas.
- Digitalizacion de documentos y OCR: dado su rendimiento en reconocimiento de texto, puede utilizarse para extraer informacion de facturas, formularios o libros escaneados, convirtiendolos en texto estructurado. La ventana de contexto larga (si estuviera disponible) permitiria procesar documentos extensos.
- Asistente de soporte tecnico con capturas de pantalla: el modelo puede analizar capturas de pantalla de errores o interfaces y proporcionar instrucciones de solucion, combinando comprension visual con conocimiento tecnico. Su tamaño moderado permite desplegarlo en un servidor unico para atender multiples consultas.
- Analisis de imagenes medicas o cientificas: puede ayudar a investigadores a interpretar radiografias, micrografias o graficos cientificos, respondiendo preguntas sobre las caracteristicas visibles. La capacidad de razonamiento multimodal es clave para este tipo de tareas.
- Generacion de codigo a partir de diagramas o bocetos: aunque no se confirma soporte de tool calling, el modelo puede describir la logica de un diagrama de flujo o un esquema de interfaz, y un desarrollador podria traducir esa descripcion a codigo. Esta tarea se beneficia de la comprension visual y del razonamiento secuencial.
- Moderacion de contenido visual: el modelo puede analizar imagenes para detectar contenido inapropiado o sensible, generando un informe textual que ayude a los moderadores a tomar decisiones. Su capacidad de procesar multiples imagenes en una conversacion permitiria revisar lotes de contenido.
- Creacion de material educativo interactivo: puede generar explicaciones detalladas a partir de figuras, mapas o ilustraciones, ayudando a estudiantes a comprender conceptos visuales. La naturaleza multimodal del modelo lo hace adecuado para plataformas de e-learning.
- Automatizacion de catalogos de productos: al analizar fotografias de productos, el modelo puede generar descripciones comerciales, atributos y categorias, reduciendo el trabajo manual en plataformas de comercio electronico.

## Benchmarks y rendimiento

Los datos de benchmarks disponibles en la informacion proporcionada son limitados. Segun el sitio openmodelmap.com, el modelo alcanza una puntuacion de 82 en MMLU (Massive Multitask Language Understanding), aunque no se especifica si esta puntuacion corresponde al modelo original o a la conversion. Ademas, OpenGVLab reporta una mejora de hasta +16,0% en razonamiento general y un speedup de 4,05 veces en inferencia respecto a InternVL3. No se dispone de resultados detallados para tareas como HumanEval, GSM8K o benchmarks de vision-lenguaje especificos en la informacion recopilada.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | 82 | Segun openmodelmap.com, sin especificar condiciones de evaluacion |
| Razonamiento general | +16,0% vs InternVL3 | Reportado por OpenGVLab en el anuncio de InternVL3.5 |
| Velocidad de inferencia | 4,05x vs InternVL3 | Reportado por OpenGVLab, atribuido a la arquitectura MoE |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. Se recomienda consultar la documentacion oficial de OpenGVLab para obtener una evaluacion completa.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (2 bytes por parametro), el modelo requiere aproximadamente 60 GB de VRAM para cargar los 30B parametros. Con cuantizacion a int8 se reduciria a unos 30 GB, y a int4 a unos 15 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: segun OpenGVLab, el modelo de 30B puede desplegarse en una unica GPU A100 (80 GB). Para GPUs consumer, seria necesario aplicar cuantizacion (por ejemplo, int4) para caber en una RTX 4090 (24 GB) o similar, aunque no se garantiza el rendimiento.
- Si cabe en consumer GPU: con cuantizacion int4, podria caber en GPUs de 16-24 GB, pero la conversion no incluye cuantizaciones predefinidas, por lo que el usuario deberia aplicar tecnicas externas.
- Opciones de despliegue: al ser una conversion de Keras 3, se puede ejecutar con los backends TensorFlow, PyTorch o JAX. Para produccion, se podria utilizar vLLM o LMDeploy si se exporta a formato compatible, aunque no se menciona soporte directo. La libreria KerasFormers ofrece una API de generacion simple para prototipado.
- Latencia y throughput estimados: no disponibles. El speedup de 4,05x respecto a InternVL3 sugiere una inferencia rapida gracias a la activacion selectiva de expertos, pero no se proporcionan cifras concretas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos multimodales de tamano similar en la informacion proporcionada. A continuacion se presenta una comparacion cualitativa basada en caracteristicas generales, sin cifras de rendimiento verificadas.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| InternVL3.5-30B-A3B (este modelo) | 30B totales, 3B activos | no disponible | Apache 2.0 | MoE multimodal, conversion a Keras 3 |
| InternVL3 (predecesor) | 30B (no MoE) | no disponible | Apache 2.0 | Rendimiento inferior en razonamiento y velocidad segun OpenGVLab |
| Qwen2-VL-7B | 7B | 128K | Apache 2.0 | Tamano menor, no MoE, contexto largo, ampliamente adoptado |
| Llama 3.2 Vision (11B) | 11B | 128K | Llama 3.2 Community License | No MoE, contexto largo, pero con restricciones de uso comercial para ciertos tamanos |

Esta tabla es orientativa y no refleja resultados de benchmarks. Para una comparacion rigurosa, se recomienda consultar las publicaciones oficiales de cada modelo.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una conversion de un modelo entrenado por OpenGVLab, puede heredar sesgos presentes en los datos de entrenamiento originales, especialmente en tareas que involucran genero, raza o cultura. No se dispone de una evaluacion especifica de sesgos para esta conversion.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir descripciones o respuestas incorrectas sobre el contenido visual, especialmente en imagenes ambiguas o fuera de distribucion. Se recomienda validar las salidas en aplicaciones criticas.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada. El modelo original InternVL3.5 probablemente soporta contexto largo, pero esta conversion no documenta el valor, lo que podria afectar a tareas que requieran procesar imagenes multiples o conversaciones extensas.
- Limitaciones de idioma: la etiqueta oficial solo declara ingles, aunque el modelo base soporta multilingue. La conversion podria no mantener el mismo rendimiento en otros idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados. No hay restricciones adicionales conocidas.
- Caveat de conversion: al ser una conversion de pesos, podria haber diferencias numericas menores respecto al modelo original debido a la transpilacion entre frameworks. Se recomienda realizar pruebas de validacion antes de usar en produccion.
- Despliegue en produccion: no se proporcionan configuraciones de servidor ni integraciones con frameworks de inferencia estandar como vLLM o TGI. El usuario debera adaptar el modelo a su infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kerasformers/internvl3.5-30b-a3b
- Modelo base (OpenGVLab): https://huggingface.co/OpenGVLab/InternVL3_5-30B-A3B-HF
- Repositorio KerasFormers en GitHub: https://github.com/IMvision12/KerasFormers
- Documentacion de InternVL en KerasFormers: https://imvision12.github.io/KerasFormers/internvl/
- Coleccion de modelos InternVL en HuggingFace: https://huggingface.co/collections/kerasformers/internvl-6a8277076dbb163f53241dbd
- Blog oficial de InternVL3.5: https://internvl.github.io/blog/2025-08-26-InternVL-3.5/
- Repositorio oficial de InternVL en GitHub: https://github.com/OpenGVLab/InternVL
- Pagina de despliegue y hardware (openmodelmap): https://openmodelmap.com/model/OpenGVLab/InternVL3_5-30B-A3B
