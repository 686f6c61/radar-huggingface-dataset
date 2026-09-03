# rukiyeberna/qwen2.5-vl-3b-food-extract-lora

## Resumen

El modelo `rukiyeberna/qwen2.5-vl-3b-food-extract-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Rukiye Berna Turan sobre el modelo base Qwen2.5-VL-3B-Instruct. Su propósito es la extracción estructurada de atributos culinarios a partir de imágenes de comida, generando salidas JSON estrictas con campos como verificación de presencia de comida, título de la imagen, lista de ingredientes y bebidas acompañantes. Está diseñado para tareas de visión-lenguaje multimodal, combinando la comprensión visual del modelo base con un ajuste fino eficiente en parámetros.

El adaptador se entrenó sobre el dataset `mrdbourke/FoodExtract-1k-Vision` (1.510 muestras) en formato conversacional LLaVA, congelando el codificador de visión y el backbone del LLM. Con un tamaño de repositorio de 0,2 GB, el adaptador es ligero y se integra fácilmente con el modelo base mediante la librería PEFT. Su relevancia radica en ofrecer una solución de bajo coste computacional para extracción de información estructurada en el dominio alimentario, aprovechando un modelo de 3B parámetros que puede ejecutarse en hardware de consumo.

La arquitectura subyacente es Qwen2.5-VL, un modelo de lenguaje multimodal basado en transformer con codificador de visión y decodificador de lenguaje. El adaptador LoRA se aplica a las proyecciones de atención (q, k, v, o) y a las proyecciones MLP (gate, up, down), con un rango de 32 y alpha de 64. El entrenamiento se realizó en una sola GPU (NVIDIA T4/A100) con precisión bfloat16, alcanzando una reducción de pérdida del 48,08% (de 1,7121 a 0,8888) en 48 pasos (1 época).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (3B) con adaptador LoRA |
| Parametros totales | 3B (modelo base) + adaptador LoRA (0,2 GB) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado en bfloat16) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-VL-3B-Instruct es un transformer multimodal con codificador de visión y decodificador de lenguaje, diseñado para tareas de imagen-texto. El adaptador LoRA añade matrices de bajo rango a las proyecciones de atención y MLP, permitiendo un ajuste fino eficiente sin modificar los pesos originales. El entrenamiento se realizó con el dataset FoodExtract-1k-Vision, preprocesado en formato conversacional LLaVA con respuestas JSON estructuradas. Se utilizaron hiperparámetros específicos: rango LoRA 32, alpha 64, dropout 0,05, learning rate 1e-4 con decaimiento coseno y calentamiento, y 48 pasos de entrenamiento (1 época). El codificador de visión y el backbone del LLM permanecieron congelados, y la pérdida se redujo de 1,7121 a 0,8888, lo que indica una convergencia del 48,08%. No se mencionan técnicas adicionales como RLHF o DPO; el ajuste es supervisado con datos etiquetados.

## Capacidades

- Extracción de atributos de comida: verifica si la imagen contiene comida (`is_food`), genera un título descriptivo (`image_title`), lista de ingredientes (`food_items`) y bebidas (`drink_items`).
- Generación de JSON estructurado con esquema estricto, garantizando salidas parseables para integración en pipelines.
- Entrada multimodal: acepta imágenes y texto, permitiendo consultas conversacionales sobre el contenido visual.
- Soporte de conversación multi-turno gracias a la arquitectura del modelo base, aunque el adaptador está optimizado para extracción directa.
- No incluye tool calling, agentes ni razonamiento multi-paso; su foco es la extracción de atributos visuales.
- Capacidades multilingües limitadas al inglés, según la model card.

## Casos de uso

- Digitalización de menús de restaurantes: el modelo puede analizar fotografías de cartas o platos y extraer automáticamente los nombres, ingredientes y bebidas en formato JSON, facilitando la creación de menús digitales o bases de datos gastronómicas.
- Seguimiento dietético en aplicaciones de nutrición: a partir de una foto de una comida, el modelo genera una lista de ingredientes que puede integrarse en apps de registro de alimentos para calcular aportes nutricionales aproximados.
- Indexación de recetas: las imágenes de recetas pueden etiquetarse automáticamente con metadatos estructurados (título, ingredientes, bebidas) para organizar colecciones culinarias o motores de búsqueda.
- Etiquetado de datasets de comida: el adaptador puede generar anotaciones automáticas para enriquecer datasets de entrenamiento de otros modelos, reduciendo el esfuerzo manual de anotación.
- Asistente de cocina: dado un plato fotografiado, el modelo identifica sus componentes y puede sugerir recetas alternativas o variaciones basadas en los ingredientes detectados.
- Verificación de contenido en plataformas de entrega de comida: las fotos de los platos pueden procesarse para confirmar que corresponden a un elemento del menú y extraer sus componentes para descripciones automáticas en la plataforma.
- Automatización de inventario en hostelería: al fotografiar platos servidos, el modelo extrae los ingredientes visibles, lo que puede ayudar a controlar el uso de materias primas en cocinas profesionales.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona métricas de evaluación como tasa de éxito de parseo JSON, precisión de clasificación `is_food`, similitud de caracteres del título (SequenceMatcher), puntuación F1 basada en conjuntos (precisión/recall) y solapamiento ROUGE-1/ROUGE-L, pero no se proporcionan valores concretos. Por tanto, no es posible comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación del adaptador. El modelo base Qwen2.5-VL-3B-Instruct, al ser de 3B parámetros, requiere aproximadamente 6-8 GB de VRAM para inferencia en bfloat16, aunque este dato no está confirmado en la información proporcionada.
- El adaptador LoRA es ligero (0,2 GB) y no añade una carga significativa de memoria.
- GPUs recomendadas: el entrenamiento se realizó en NVIDIA T4 o A100, lo que sugiere que cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4070) puede ejecutar el modelo en inferencia.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `transformers` y `peft` en Python. También es compatible con frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tamaño | Enfoque | Licencia |
|---|---|---|---|---|
| rukiyeberna/qwen2.5-vl-3b-food-extract-lora | Qwen2.5-VL-3B-Instruct | 3B + LoRA | Extracción de comida en JSON | Apache-2.0 |
| AdaptLLM/food-Qwen2.5-VL-3B-Instruct | Qwen2.5-VL-3B-Instruct | 3B | Fine-tuning completo para comida | No especificada |
| Qwen/Qwen2.5-VL-3B-Instruct | - | 3B | Modelo base multimodal general | Apache-2.0 |

No se dispone de datos de rendimiento comparativos entre estos modelos. El adaptador de Rukiye Berna Turan se distingue por su eficiencia en parámetros (solo adaptador LoRA) y su salida JSON estricta, mientras que el modelo de AdaptLLM parece ser un fine-tuning completo, aunque no se han encontrado detalles adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo puede no detectar ingredientes ocultos, mezclados o interiores que no sean visualmente evidentes en la superficie del plato.
- Riesgo de alucinación: puede generar nombres de platos o ingredientes inexactos, especialmente con variaciones coloquiales (por ejemplo, predecir "ensalada de tomate" en lugar de "ensalada caprese").
- Limitaciones de idioma: solo soporta inglés; no se ha entrenado para otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-VL-3B-Instruct también está bajo Apache-2.0, por lo que no hay restricciones adicionales.
- Caveat para producción: no es adecuado para confirmación médica de alergias, consejo dietético clínico, ni estimación precisa de peso, volumen o calorías. Tampoco debe usarse para parseo de documentos visuales no relacionados con comida.
- El adaptador se entrenó con un dataset pequeño (1.510 muestras), por lo que su generalización a estilos de comida o presentaciones muy diversas puede ser limitada.

## Enlaces

- HuggingFace: https://huggingface.co/rukiyeberna/qwen2.5-vl-3b-food-extract-lora
- Repositorio GitHub (model card): https://github.com/rukiyeberna/vlm-food-extractor
- Repositorio GitHub (pipeline de fine-tuning): https://github.com/rukiyeberna/vlm-finetuning
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mrdbourke/FoodExtract-1k-Vision
