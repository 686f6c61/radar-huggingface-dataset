# AI4PD/REXzyme

## Resumen

REXzyme es un modelo de traducción automática desarrollado por el equipo AI4PD (Sebastian Lindner, Núria Mimbrero Pelegrí, Michael Heinzinger, Noelia Ferruz y Alex Vicente) para la generación de enzimas de novo que catalizan reacciones químicas definidas por el usuario. El modelo toma como entrada una reacción expresada en formato SMILES y genera la secuencia de aminoácidos de una enzima predicha para catalizar dicha reacción. Se basa en la arquitectura Efficient T5 Large, con 770 millones de parámetros y una ventana de contexto de 512 tokens (el tamaño máximo de entrada para T5). Está entrenado sobre 20.911.485 pares reacción-enzima extraídos de la base de datos RHEA, lo que le permite aprender relaciones entre la química de la reacción y las características de la secuencia proteica. El modelo es relevante porque aborda el diseño de enzimas con un enfoque de traducción entre espacios químicos y biológicos, similar a cómo los traductores automáticos manejan pares de lenguajes complejos. Se distribuye bajo licencia Apache 2.0 y se encuentra en fase de trabajo en progreso, sin validación experimental publicada aún.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Efficient T5 Large (Transformer encoder-decoder) |
| Parametros totales | 770 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (máximo estándar de T5) |
| Tipos de cuantizacion | no disponible (no se documentan en la model card) |
| Idiomas soportados | no disponible (el modelo trabaja con SMILES y secuencias de aminoácidos, no con lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según la librería transformers y el repositorio) |

## Arquitectura y entrenamiento

REXzyme utiliza la arquitectura Efficient T5 Large, una variante optimizada del Transformer T5 original. Consta de 48 capas (24 en el encoder y 24 en el decoder) con una dimensionalidad de modelo de 1024. El entrenamiento se realizó con un objetivo de traducción supervisada: el encoder procesa la representación continua de la reacción química (SMILES tokenizado a nivel de carácter) y el decoder genera autoregresivamente la secuencia de aminoácidos de la enzima, token a token, de izquierda a derecha. Se emplearon dos tokenizadores separados: uno para la entrada SMILES y otro para las etiquetas de aminoácidos. El modelo se preentrenó sobre 20.911.485 pares reacción-enzima de la base de datos RHEA, lo que le permite transferir conocimiento entre clases de reacciones con distinto número de ejemplos. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es puramente supervisado. La innovación principal reside en la aplicación de un paradigma de traducción automática al diseño de enzimas, tratando el SMILES y la secuencia proteica como dos lenguajes distintos.

## Capacidades

- Generación de secuencias de aminoácidos de enzimas a partir de una reacción química en formato SMILES.
- Soporte para reacciones con múltiples reactivos, agentes y productos, usando el esquema `ReactantA.ReactantB>AgentA>ProductA.ProductB`.
- Acepta entrada a nivel de sustrato, permitiendo un control fino sobre la reacción deseada.
- Capacidad de transferir aprendizaje entre clases de reacciones con pocos ejemplos gracias a la tokenización a nivel de carácter de los SMILES.
- Generación autoregresiva de secuencias completas de proteínas, sin requerir alineamiento previo.
- Diseñado para generar secuencias de novo, no solo copias de enzimas existentes, por lo que no se recomienda usar BLEU como métrica de evaluación.
- Integración con el ecosistema Hugging Face Transformers, permitiendo su uso con `AutoModelForSeq2SeqLM`.

## Casos de uso

- Diseño de enzimas para reacciones específicas en biotecnología: un investigador puede introducir la reacción química deseada (por ejemplo, una hidrólisis o una oxidación) y obtener candidatos de secuencias de enzimas que podrían catalizarla, acelerando el descubrimiento de biocatalizadores.
- Exploración de nuevas rutas metabólicas: al generar enzimas para reacciones no naturales o poco comunes, se pueden diseñar vías biosintéticas completas para la producción de compuestos de interés industrial o farmacéutico.
- Ingeniería de proteínas asistida por IA: las secuencias generadas pueden servir como punto de partida para mutagénesis dirigida o evolución dirigida, reduciendo el espacio de búsqueda experimental.
- Educación e investigación en bioquímica: permite a estudiantes y académicos explorar la relación entre estructura química y función enzimática de manera interactiva, generando hipótesis comprobables in silico.
- Generación de bibliotecas de enzimas candidatas: el modelo puede producir múltiples secuencias para una misma reacción, que luego se filtran mediante métricas como plDDT (predicción de estructura) para seleccionar las más prometedoras antes de la síntesis.
- Validación de bases de datos de reacciones: al comparar las secuencias generadas con las enzimas conocidas en RHEA, se pueden detectar posibles errores o inconsistencias en las anotaciones de reacciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo aún está en fase de análisis y que se están realizando pruebas experimentales, pero no se proporcionan métricas cuantitativas como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de lenguaje natural general. Para tareas específicas de diseño de enzimas, no hay datos de rendimiento comparativo publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 770 millones de parámetros. En precisión fp32, ocupa aproximadamente 3 GB de memoria; en fp16, alrededor de 1,5 GB; en int8, cerca de 0,8 GB. Sin embargo, el repositorio tiene un tamaño de 70,7 GB, lo que sugiere que puede incluir múltiples checkpoints o pesos en alta precisión, por lo que se recomienda verificar los archivos antes de cargar.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 2060). Para mayor comodidad y velocidad, se recomienda una RTX 3090 o A100 si se desea procesar lotes grandes o usar precisión fp32.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo medio (8 GB o más) si se usa cuantización o precisión mixta.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede ejecutarse con Hugging Face Transformers, así como con servidores de inferencia como vLLM o TGI (aunque estos están optimizados para modelos generativos de lenguaje, T5 también es soportado). También se puede usar con llama.cpp si se convierte a formato GGUF, aunque no es el flujo habitual.
- Latencia y throughput: no disponible. Al ser un modelo encoder-decoder de 770M, la latencia por secuencia es moderada (del orden de cientos de milisegundos en una GPU moderna), pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. REXzyme es un modelo especializado en traducción SMILES a secuencias de proteínas, un nicho poco común. Otros modelos de diseño de proteínas como ESM-2 o ProtGPT2 se centran en la generación de secuencias sin condicionamiento por reacción química, pero no hay datos de comparación directa disponibles.

## Limitaciones y advertencias

- El modelo se encuentra en fase de "trabajo en progreso" según la model card, y no se ha validado experimentalmente en laboratorio. Las secuencias generadas deben considerarse como hipótesis in silico, no como enzimas funcionales confirmadas.
- La selección de secuencias generadas no debe basarse en perplexity o BLEU; se recomienda usar métricas de estructura como plDDT para filtrar candidatos, lo que añade un paso adicional de análisis.
- El modelo solo acepta reacciones en formato SMILES canónico, lo que requiere que el usuario tenga conocimientos de química computacional y herramientas como RDKit para preparar las entradas.
- No se especifican idiomas naturales soportados; el modelo trabaja exclusivamente con SMILES y secuencias de aminoácidos.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigación sin validación, su uso en producción conlleva riesgos significativos de fiabilidad.
- El repositorio tiene un tamaño de 70,7 GB, lo que puede dificultar la descarga y el despliegue en entornos con almacenamiento limitado.
- No se documentan sesgos específicos, pero al entrenarse con datos de RHEA, podría heredar sesgos de las anotaciones de reacciones existentes, favoreciendo clases de reacciones más representadas.

## Enlaces

- [Hugging Face - AI4PD/REXzyme](https://huggingface.co/AI4PD/REXzyme)
- [Hugging Face - AI4PD/REXzyme_aa](https://huggingface.co/AI4PD/REXzyme_aa) (variante del modelo)
- [Herramienta de conversión a SMILES (Cactus)](https://cactus.nci.nih.gov/chemical/structure)
- [RDKit - documentación](https://www.rdkit.org/docs/GettingStartedInPython.html)
- [Base de datos RHEA](https://www.rhea-db.org/)
