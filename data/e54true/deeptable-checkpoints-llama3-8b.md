# e54true/deeptable-checkpoints-llama3-8b

## Resumen

DeepTable es un conjunto de adaptadores LoRA entrenados sobre el modelo base `meta-llama/Meta-Llama-3-8B-Instruct` para la tarea de respuesta a preguntas sobre tablas (table question answering). El desarrollo corre a cargo del autor e54true y se publica como material complementario al artículo «DeepTable: Structural Attention Biases and Tree Path Encoding for Hierarchical Table Understanding». El repositorio contiene 48 checkpoints que cubren tres variantes del método —solo SAB (Structural Attention Bias), solo TPE (Tree Path Encoding) y la combinación completa SAB+TPE— sobre cuatro benchmarks de tablas (HiTab, WikiTQ, FeTaQA y TabFact) y cuatro semillas de entrenamiento.

El modelo resuelve el problema de comprender tablas con estructura jerárquica, donde las relaciones entre celdas, filas y columnas no son planas. Para ello combina dos mecanismos: un sesgo de atención estructural (SAB) que modula las puntuaciones de atención en función de la ubicación relativa de las celdas, y una codificación de caminos de árbol (TPE) que representa la jerarquía de la tabla como secuencias de nodos. Ambos se integran sobre un backbone Llama-3-8B mediante LoRA de rango 8 sobre las proyecciones `k_proj` y `v_proj`, junto con un adaptador P_TUNING que actúa como codificador de prompts especiales `[TAB]`, `[ROW]` y `[CELL]`.

La relevancia actual radica en que la mayoría de los modelos de lenguaje no están optimizados para extraer información de tablas jerárquicas complejas (por ejemplo, informes financieros o datos estadísticos anidados). DeepTable ofrece un enfoque ligero y reproducible que mejora la precisión en estos dominios sin necesidad de reentrenar el modelo completo. El repositorio incluye los pesos de los adaptadores, las predicciones generadas en el conjunto de test y los scripts de evaluación para verificar las puntuaciones reportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3-8B-Instruct) con adaptadores LoRA 2D y módulos SAB/TPE |
| Parametros totales | No disponible (el modelo base tiene 8.03B; los adaptadores son de rango 8) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, probablemente 8K tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base soporta inglés y otros; el adaptador no especifica) |
| Licencia | MIT (adaptadores) + Llama 3 Community License (modelo base) |
| Formato de pesos | safetensors (PEFT, dos adaptadores apilados) |

## Arquitectura y entrenamiento

El modelo se basa en Llama-3-8B-Instruct y extiende su arquitectura con tres componentes adicionales. El primero es un adaptador P_TUNING (prompt encoder) que genera embeddings para los tokens especiales `[TAB]`, `[ROW]` y `[CELL]`, siguiendo el diseño de TableLoRA. El segundo es un adaptador LoRA estándar de rango 8 aplicado a `k_proj` y `v_proj`, que constituye la mayor parte del peso entrenado. El tercero son los módulos SAB y TPE: SAB introduce un sesgo aditivo en las puntuaciones de atención basado en la distancia relativa entre celdas (fila/columna), mientras que TPE añade tablas de embeddings que codifican la ruta desde la raíz de la jerarquía hasta cada nodo de la tabla.

El entrenamiento se realizó con una tasa de aprendizaje base de 5e-6 con programación coseno durante 3 épocas. Los módulos SAB y TPE usan un multiplicador de LR de 1000 (λ=1000). Cada variante (SAB-only, TPE-only y SAB+TPE) se entrenó sobre cuatro benchmarks de tablas y cuatro semillas distintas, generando un total de 48 checkpoints. No se incluyen los checkpoints del baseline TableLoRA porque las reproducciones locales no coincidían con los números citados en el artículo original (diferencia de 13 puntos porcentuales en HiTab), por lo que se excluyeron para evitar confusiones.

## Capacidades

- Respuesta a preguntas sobre tablas (table QA) con estructura jerárquica, incluyendo tablas anidadas o con múltiples niveles de encabezados.
- Generación de respuestas textuales a partir de consultas en lenguaje natural sobre datos tabulares (por ejemplo, en el benchmark FeTaQA).
- Razonamiento sobre relaciones entre celdas, filas y columnas, gracias a los sesgos de atención estructural (SAB).
- Comprensión de la jerarquía de tablas mediante codificación de caminos de árbol (TPE), que permite manejar tablas con subsecciones y agrupaciones.
- Verificación de hechos sobre tablas (TabFact) y respuesta a preguntas de comprensión lectora sobre tablas (WikiTQ, HiTab).
- No se documentan capacidades de tool calling, agentes, vision ni audio. El modelo se limita a la tarea de QA sobre tablas.

## Casos de uso

- Extracción de datos de informes financieros: el modelo puede responder preguntas como «¿cuál fue el ingreso neto del segmento de América del Norte en 2023?» a partir de tablas jerárquicas de estados financieros, gracias a su capacidad para seguir la estructura de filas y columnas anidadas.
- Análisis de resultados de encuestas o censos: tablas con múltiples niveles de desagregación (por región, edad, sexo) pueden ser consultadas en lenguaje natural para obtener cifras específicas, reduciendo el tiempo de búsqueda manual.
- Automatización de soporte al cliente con datos tabulares: integrar el modelo en un chatbot que consulte catálogos de productos o tarifas presentadas en tablas complejas, respondiendo con precisión a preguntas multi-turno sobre precios o disponibilidad.
- Generación de informes resumidos a partir de tablas de indicadores: el modelo puede producir descripciones textuales de tendencias o valores destacados, útil para paneles de control empresariales.
- Verificación de afirmaciones contra datos tabulares (TabFact): validar automáticamente si una afirmación dada es consistente con la información de una tabla, útil en sistemas de fact-checking o control de calidad de datos.
- Investigación académica en NLP: el repositorio incluye predicciones generadas y scripts de evaluación, permitiendo reproducir los resultados y comparar nuevas arquitecturas de QA sobre tablas con una línea base sólida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los números del baseline TableLoRA citados en el artículo no coinciden con las reproducciones locales (diferencia de 13 puntos en HiTab), pero no proporciona las puntuaciones de los checkpoints de DeepTable. Los scripts de evaluación incluidos permiten reproducir las métricas, pero no se listan valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre Llama-3-8B, la carga completa en fp16 requiere al menos 16 GB de VRAM (8 GB para los pesos del modelo base más overhead de activaciones y adaptadores). Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ) se puede reducir a unos 6-8 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16, o RTX 3060/4060 (12 GB) con cuantización. Para despliegue en producción, se recomienda A100 o H100 con al menos 40 GB si se procesan lotes grandes.
- En consumer GPU: sí, cabe en GPUs de 12-24 GB con cuantización adecuada.
- Opciones de despliegue: el repositorio indica que los checkpoints deben cargarse mediante el código de DeepTable (con el parche de `PeftModel.from_pretrained`), pero también se pueden usar herramientas estándar como vLLM, Ollama o llama.cpp si se fusionan los adaptadores con el modelo base. No se proporciona soporte directo para TGI.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 8B, la generación suele ser de 20-40 tokens/segundo en una RTX 4090 con fp16, pero no hay datos específicos del adaptador.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion disponible. El modelo compite con otros enfoques de QA sobre tablas como TableLoRA (Microsoft) y con modelos de propósito general fine-tuned para tablas, pero no se ofrecen métricas numéricas para establecer una comparación objetiva. Se recomienda consultar el artículo original y el repositorio de TableLoRA para obtener referencias.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama-3-8B-Instruct, el modelo hereda los sesgos presentes en los datos de preentrenamiento de Meta, incluyendo posibles sesgos de género, raza o idioma.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente cuando la tabla no contiene la información solicitada o la pregunta es ambigua.
- Limitaciones de contexto: la longitud de contexto no se especifica en el adaptador; se asume la del modelo base (8K tokens), lo que limita el procesamiento de tablas muy grandes.
- Restricciones de licencia: aunque los adaptadores se publican bajo licencia MIT, el modelo base Llama-3-8B-Instruct está sujeto a la Llama 3 Community License de Meta, que impone restricciones de uso comercial y requiere atribución. Los usuarios deben cumplir ambas licencias.
- Dependencia del código del autor: la carga correcta de los checkpoints requiere el parche de `PeftModel.from_pretrained` incluido en el repositorio de DeepTable; cargar solo el adaptador superior sin el interno (`default_1/`) pierde la mitad del modelo entrenado.
- Reproducibilidad limitada: no se incluyen los checkpoints del baseline TableLoRA, y se advierte de discrepancias entre los números citados en el artículo y las reproducciones locales, lo que puede dificultar la comparación exacta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/e54true/deeptable-checkpoints-llama3-8b
- Checkpoints sobre DeepSeek-LLM-7B-Chat: https://huggingface.co/e54true/deeptable-checkpoints-deepseek7b
- Checkpoints sobre Qwen2.5-7B-Instruct: https://huggingface.co/e54true/deeptable-checkpoints-qwen25-7b
- Repositorio de TableLoRA (Microsoft): https://github.com/microsoft/TableLoRA
- Modelo base Llama-3-8B-Instruct: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio oficial de Llama 3 (GitHub): https://github.com/meta-llama/llama3
