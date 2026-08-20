# markairlectra/distilbert-base-uncased-food-not-food-classification

## Resumen

El modelo `markairlectra/distilbert-base-uncased-food-not-food-classification` es un clasificador de texto binario que determina si un fragmento de texto se refiere a comida o no. Se trata de un fine-tuning del modelo base `distilbert/distilbert-base-uncased`, un transformer encoder destilado de BERT, con 66,9 millones de parámetros. El modelo fue entrenado con el framework Hugging Face Transformers y publicado bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones.

La relevancia de este modelo radica en su simplicidad y bajo coste computacional: al ser una versión destilada de BERT, es adecuado para tareas de clasificación de texto en entornos con recursos limitados, como aplicaciones móviles o servicios en tiempo real. Sin embargo, la documentación disponible es escasa: no se especifica el dataset de entrenamiento, los idiomas soportados ni se proporcionan resultados de benchmarks estándar. La accuracy reportada en la evaluación (1.0) sugiere un posible sobreajuste al conjunto de validación, por lo que su rendimiento en datos reales debe ser verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 12 cabezas de atencion) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredada de DistilBERT base, tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es ingles, pero no se confirma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una version destilada de BERT que reduce el numero de capas de 12 a 6 y elimina los token type embeddings, manteniendo un rendimiento cercano al original con un 40% menos de parametros. El fine-tuning se realizo sobre un dataset desconocido, con los siguientes hiperparametros: learning rate de 0.0001, batch size de 32, 10 epocas, optimizador AdamW y scheduler lineal. No se menciona el uso de tecnicas como RLHF o DPO; se trata de un entrenamiento supervisado estandar para clasificacion de texto.

La ausencia de informacion sobre el dataset de entrenamiento y el proceso de curado de datos es una limitacion importante, ya que impide evaluar la generalizacion del modelo. La accuracy de 1.0 en el conjunto de evaluacion, alcanzada ya en la primera epoca, indica un posible sobreajuste o un dataset de validacion muy sencillo.

## Capacidades

- Clasificacion binaria de texto: distingue si un texto se refiere a comida o no.
- Procesamiento de texto en ingles (presumiblemente, dado el tokenizer uncased del modelo base).
- Inferencia rapida y ligera, adecuada para entornos con recursos limitados.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio.
- No se ha documentado capacidad multilingue.

## Casos de uso

- Moderacion de contenido en redes sociales: el modelo puede filtrar publicaciones que mencionen alimentos, util para plataformas de recetas o dietas. Su baja latencia permite procesar grandes volumenes de texto en tiempo real.
- Analisis de resenas de restaurantes: clasificar resenas que hablan de comida para extraer tendencias gastronomicas. Al ser un modelo pequeno, puede ejecutarse en servidores modestos.
- Clasificacion de recetas: en un corpus de documentos, separar recetas de otros tipos de texto (historias, consejos, etc.) para indexar contenido.
- Deteccion de menciones de alimentos en noticias o articulos: util para monitorizacion de tendencias alimentarias o alertas de seguridad alimentaria.
- Filtrado de datos para entrenar otros modelos: como paso previo en pipelines de NLP, para seleccionar solo textos relacionados con comida.
- Aplicaciones de nutricion: clasificar entradas de usuarios en un diario de alimentos, aunque se requeriria validacion adicional para textos complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de Hugging Face no incluye ninguna metrica estandar (MMLU, GLUE, etc.). La model card reporta una accuracy de 1.0 y una loss de 0.0004 en el conjunto de evaluacion, pero estos valores no son comparables con benchmarks publicos y probablemente reflejan sobreajuste. Se recomienda evaluar el modelo en un conjunto de datos propio antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada: el modelo en precision fp32 ocupa aproximadamente 268 MB (66,9M parametros x 4 bytes). En fp16 serian ~134 MB, y en int8 ~67 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo tarjetas de consumo como GTX 1050 Ti o superiores. Tambien puede ejecutarse en CPU con razonable velocidad.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU moderna.
- Opciones de despliegue: compatible con Hugging Face Transformers, ONNX Runtime, TensorFlow Lite, y servidores de inferencia como vLLM o TGI (aunque al ser un modelo pequeno, no se requiere infraestructura especial). Tambien puede usarse con llama.cpp si se convierte a GGUF, aunque no es el formato nativo.
- Latencia y throughput: no se dispone de datos medidos, pero por el tamano del modelo se espera una latencia inferior a 10 ms por muestra en GPU y alrededor de 50-100 ms en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos para la tarea de clasificacion comida/no comida. Como referencia, el modelo base DistilBERT tiene 66M parametros y un rendimiento ligeramente inferior a BERT-base (110M parametros) en tareas de GLUE, pero con mayor eficiencia. No se puede establecer una comparativa directa sin datos de benchmarks.

## Limitaciones y advertencias

- Sobreajuste: la accuracy de 1.0 en evaluacion sugiere que el modelo puede no generalizar bien a datos no vistos. Se recomienda probarlo con datos reales antes de usarlo en produccion.
- Dataset de entrenamiento desconocido: no se especifica la composicion, el tamano ni el origen de los datos, lo que impide conocer sesgos potenciales.
- Idioma: el modelo base esta entrenado en ingles, por lo que su rendimiento en otros idiomas es incierto.
- Contexto limitado: la longitud maxima de entrada es de 512 tokens (heredada de DistilBERT), lo que puede ser insuficiente para textos largos.
- Sesgos: DistilBERT puede heredar sesgos de genero, raza o cultura presentes en sus datos de preentrenamiento, que podrian afectar a la clasificacion de ciertos tipos de comida.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede producir clasificaciones erroneas en casos ambiguos o fuera de distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markairlectra/distilbert-base-uncased-food-not-food-classification
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
