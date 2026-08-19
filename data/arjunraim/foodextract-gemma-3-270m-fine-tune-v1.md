# arjunraim/FoodExtract-gemma-3-270m-fine-tune-v1

## Resumen

FoodExtract-gemma-3-270m-fine-tune-v1 es un modelo de extracción de información alimentaria desarrollado por arjunraim, construido mediante fine-tuning del modelo base google/gemma-3-270m-it. Su propósito es procesar texto sin estructurar (como captions de imágenes) y extraer de forma estructurada si el contenido es comida o bebida, asignar etiquetas temáticas (menú, receta, lista de ingredientes, etc.) y listar los alimentos y bebidas mencionados. El modelo está diseñado para tareas de filtrado y extracción en pipelines de datos, especialmente para limpiar y clasificar grandes datasets de captions de imágenes como DataComp-1B.

El modelo tiene 268 millones de parámetros, un tamaño reducido que permite su ejecución en dispositivos con recursos limitados. Se entrenó mediante aprendizaje supervisado (SFT) sobre el dataset FoodExtract-1k, compuesto por 1400 pares de texto y salidas JSON generadas por gpt-oss-120b. La salida se condensa en un formato de texto plano de cuatro campos (food_or_drink, tags, foods, drinks) para minimizar la generación de tokens. Su relevancia radica en ofrecer una solución ligera y específica para el filtrado de contenido alimentario en datasets masivos, un paso previo habitual en el entrenamiento de modelos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 270M) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (dataset de entrenamiento en ingles) |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de google/gemma-3-270m-it, un transformer decoder-only de 270 millones de parametros. La arquitectura base no se modifica; solo se ajustan los pesos mediante entrenamiento supervisado (SFT) utilizando la libreria TRL de HuggingFace. El dataset de entrenamiento, FoodExtract-1k, contiene 1400 ejemplos de texto plano (captions de imagenes) con sus correspondientes salidas estructuradas en JSON, generadas por el modelo gpt-oss-120b. Estas salidas se condensan en un formato de texto de cuatro lineas (food_or_drink, tags, foods, drinks) para reducir el numero de tokens de salida durante la generacion. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente supervisado.

## Capacidades

- Clasificacion binaria: determina si el texto contiene o no alimentos o bebidas (campo food_or_drink con valor 0 o 1).
- Etiquetado tematico: asigna una o mas etiquetas de un diccionario fijo (np, il, me, re, fi, di, fa, fp) que indican el tipo de contenido (panel nutricional, lista de ingredientes, menu, receta, etc.).
- Extraccion de alimentos: genera una lista de items alimentarios mencionados en el texto (campo foods).
- Extraccion de bebidas: genera una lista de bebidas mencionadas (campo drinks).
- Salida condensada: produce texto plano estructurado en lugar de JSON, lo que reduce el coste de generacion.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo de extraccion especifico.

## Casos de uso

- Filtrado de datasets de captions de imagenes: el modelo puede procesar millones de captions (p. ej. de DataComp-1B) y clasificar rapidamente cuales contienen referencias a comida o bebida, permitiendo construir subconjuntos tematicos para entrenar modelos multimodales especializados en alimentacion.
- Extraccion de ingredientes de recetas: dado un texto de receta, el modelo identifica y lista los ingredientes alimentarios, facilitando la creacion de bases de datos estructuradas de recetas.
- Analisis de menus de restaurantes: a partir de descripciones de platos, extrae los alimentos y bebidas mencionados, util para aplicaciones de recomendacion gastronomica o analisis de oferta.
- Clasificacion de contenido publicitario: detecta si un texto corresponde a un anuncio de comida (tag fa) y extrae los productos promocionados, ayudando en estudios de marketing.
- Procesamiento de etiquetas de productos: identifica listas de ingredientes (tag il) y paneles nutricionales (tag np) en descripciones de productos, para automatizar la verificacion de alérgenos o informacion nutricional.
- Generacion de metadatos para archivos de imagenes: al combinar el modelo con un sistema de captioning, se pueden anadir etiquetas semanticas de comida/bebida a imagenes, mejorando la busqueda y organizacion en bibliotecas visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de evaluacion (exactitud, F1, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 268M parametros, en precision fp16 ocupa aproximadamente 536 MB; con cuantizacion a 8 bits se reduce a ~268 MB y a 4 bits a ~134 MB. Estas cifras son estimaciones teoricas, no datos oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para inferencia en fp16 (p. ej. NVIDIA GTX 1650, RTX 3060). Para entrenamiento o fine-tuning adicional se recomienda al menos 8 GB.
- Compatibilidad con consumer GPU: si, el modelo cabe en la mayoria de GPUs de consumo actuales, incluso en CPU con cuantizacion.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Text Generation Inference (TGI), o ejecutarse localmente con llama.cpp u Ollama (si se convierte a GGUF). Tambien es compatible con endpoints de HuggingFace.
- Latencia y throughput: no se dispone de datos medidos. Dado su tamano, se espera una latencia de pocos milisegundos por peticion en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma tarea (extraccion de alimentos y bebidas). El modelo base Gemma 3 270M es un LLM generalista, no especializado en esta tarea, por lo que no es una alternativa directa. No se han encontrado otros modelos de extraccion de comida con caracteristicas similares en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento pequeno: solo 1400 ejemplos, lo que puede limitar la generalizacion a textos muy diversos o con vocabulario especializado.
- Sesgos del dataset: las salidas fueron generadas por gpt-oss-120b, por lo que el modelo puede heredar sesgos o errores de ese modelo.
- Riesgo de alucinacion: al ser un modelo generativo, puede inventar alimentos o bebidas no presentes en el texto de entrada, especialmente en contextos ambiguos.
- Limitacion de idioma: aunque no se especifica, el dataset de entrenamiento esta en ingles, por lo que el rendimiento en otros idiomas probablemente sea deficiente.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso (consultar los terminos oficiales de Google); no se permite uso comercial sin cumplir dichas restricciones.
- Sin soporte para tareas generales: el modelo esta especializado exclusivamente en extraccion de comida/bebida; no es adecuado para chat, generacion de texto libre u otras tareas.
- Formato de salida rigido: la salida condensada requiere funciones auxiliares para convertirla a JSON; si se usa fuera de ese esquema, puede producir formatos inesperados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arjunraim/FoodExtract-gemma-3-270m-fine-tune-v1
- Dataset FoodExtract-1k: https://huggingface.co/datasets/mrdbourke/FoodExtract-1k
- Blog de Google sobre fine-tuning de Gemma 3 270M: https://developers.googleblog.com/en/own-your-ai-fine-tune-gemma-3-270m-for-on-device/
- Paper de Gemma 3 (referencia arxiv:2506.14111): no se ha verificado el enlace directo, pero el identificador corresponde al articulo tecnico de Gemma 3.
