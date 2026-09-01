# aplominski/TinyTransformer-Post-LayerNorm-18M-TinyStories

## Resumen

El modelo TinyTransformer-Post-LayerNorm-18M-TinyStories es un transformer de 18 millones de parámetros entrenado sobre el dataset sintético TinyStories, desarrollado por aplominski como parte de una serie de investigación sobre estrategias de normalización en arquitecturas transformer de pequeña escala. El objetivo del estudio es comparar el impacto de distintas técnicas de normalización (LayerNorm, RMSNorm) aplicadas antes o después de las subcapas del transformer, manteniendo fijos el resto de hiperparámetros y el dataset de entrenamiento.

Este modelo concreto emplea normalización de capas (LayerNorm) en configuración post-normalización, es decir, aplicada después de cada subcapa de atención y de la red feed-forward. Al estar entrenado exclusivamente con TinyStories, un corpus de cuentos infantiles generados por GPT-4, el modelo es capaz de generar texto narrativo en inglés coherente y gramaticalmente correcto, demostrando que modelos muy pequeños pueden adquirir habilidades lingüísticas básicas con datos de alta calidad. Su relevancia radica en servir como herramienta de investigación para entender cómo afecta la colocación de la normalización al entrenamiento y al rendimiento final en modelos pequeños, un tema de interés para el diseño de arquitecturas eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TinyTransformer) |
| Parametros totales | 18.467.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32 probablemente) |
| Idiomas soportados | ingles (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar, similar a la descrita en el articulo "Attention Is All You Need" (Vaswani et al., 2017), pero con un numero reducido de capas y dimensiones ocultas para alcanzar los 18 millones de parametros. La caracteristica distintiva de este modelo es la aplicacion de LayerNorm en configuracion post-normalizacion, es decir, la normalizacion se aplica despues de cada subcapa de atencion multi-cabeza y despues de la red feed-forward, en lugar de antes como es habitual en modelos modernos (pre-normalizacion). Esta eleccion arquitectonica es la variable experimental principal de la serie.

El entrenamiento se realizo sobre el dataset TinyStories (roneneldan/TinyStories), un corpus sintetico de cuentos infantiles en ingles generados por GPT-4, disenado para entrenar modelos de lenguaje pequenos. La tarea declarada en la model card es masked language modeling, aunque por la naturaleza del dataset y la arquitectura decoder-only, el modelo tambien es capaz de generar texto autoregresivamente. No se especifican el numero de tokens de entrenamiento, el batch size, la tasa de aprendizaje ni si se aplicaron tecnicas como RLHF o DPO. La serie incluye variantes con pre-normalizacion, post-normalizacion, RMSNorm y una linea base sin normalizacion, todas con el mismo tamaño y dataset.

## Capacidades

- Generacion de texto narrativo en ingles: produce cuentos cortos coherentes y gramaticalmente correctos, siguiendo el estilo del dataset TinyStories.
- Razonamiento basico sobre historias: al estar entrenado con narrativas simples, puede mantener coherencia tematica y logica elemental en textos cortos.
- Modelado de lenguaje enmascarado: segun la model card, fue entrenado para la tarea de masked language modeling, por lo que puede predecir tokens ocultos en una secuencia.
- Capacidad multilingue: no disponible, solo soporta ingles.
- Tool calling / function calling: no disponible, no se menciona ninguna capacidad de este tipo.
- Soporte para agentes o multi-step reasoning: no disponible, el modelo es demasiado pequeno y no se ha entrenado para estas tareas.
- Modo thinking o vision: no disponible.

## Casos de uso

- Investigacion academica sobre normalizacion en transformers: el modelo sirve como punto de comparacion dentro de la serie para estudiar como afecta la posicion de LayerNorm al entrenamiento y al rendimiento en modelos pequenos. Los investigadores pueden reproducir los experimentos y analizar las diferencias con las variantes pre-normalizacion o RMSNorm.
- Ensenanza de arquitecturas transformer: al ser un modelo pequeno y entrenado con un dataset publico, es util como ejemplo didactico para estudiantes que quieran entender el funcionamiento interno de un transformer y el efecto de la normalizacion.
- Generacion de cuentos infantiles simples: puede utilizarse para generar historias cortas en ingles, aunque su calidad es limitada por el tamaño y el dominio restringido del dataset.
- Pruebas de concepto en entornos con recursos limitados: al ocupar menos de 100 MB en fp32, puede ejecutarse en CPU o en GPUs muy modestas, lo que permite validar pipelines de inferencia o fine-tuning sin necesidad de hardware costoso.
- Analisis de sesgos en modelos pequenos: al estar entrenado con un corpus sintetico generado por GPT-4, puede estudiarse como se manifiestan los sesgos del modelo generador en un modelo de menor escala.
- Comparacion de tecnicas de cuantizacion: aunque no se proporcionan cuantizaciones oficiales, el tamaño reducido permite experimentar con cuantizacion a 8 bits o 4 bits para evaluar la perdida de calidad en modelos muy pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. La unica metrica mencionada es accuracy, pero sin valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 18.467.840 parametros, el modelo en fp32 ocupa aproximadamente 74 MB (18,47 M × 4 bytes). En fp16 serian unos 37 MB y en int8 unos 18 MB. Por tanto, cabe en cualquier GPU moderna, incluso en las mas basicas, y tambien en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050, RTX 2060 o superiores funcionarian sin problema. Tambien puede ejecutarse en CPU con razonable velocidad.
- Si cabe en consumer GPU: si, en todas las GPUs de consumo actuales.
- Opciones de despliegue: al ser un modelo safetensors, puede cargarse con la libreria transformers de HuggingFace. Tambien puede convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF oficiales. Para inferencia en produccion, podria usarse vLLM o TGI, aunque para un modelo tan pequeno no es necesario.
- Latencia y throughput estimados: no hay datos oficiales. En una GPU moderna, la generacion de tokens seria practicamente instantanea (del orden de microsegundos por token). En CPU, la latencia seria mayor pero aun asi aceptable para un modelo de este tamaño.

## Comparativa con modelos similares

La serie TinyTransformer de aplominski incluye varios modelos del mismo tamaño (18M) y de 10M, todos entrenados con TinyStories y diferenciados por la estrategia de normalizacion. No se dispone de datos de rendimiento comparativo, pero la comparacion estructural es la siguiente:

| Modelo | Normalizacion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| TinyTransformer-Baseline-18M | Sin normalizacion | 18.467.840 | no disponible | OpenMDW-1.1 |
| TinyTransformer-Pre-LayerNorm-18M | LayerNorm pre | 18.467.840 | no disponible | OpenMDW-1.1 |
| TinyTransformer-Post-LayerNorm-18M (este) | LayerNorm post | 18.467.840 | no disponible | OpenMDW-1.1 |
| TinyTransformer-Pre-RMSNorm-18M | RMSNorm pre | 18.467.840 | no disponible | OpenMDW-1.1 |
| TinyTransformer-Post-RMSNorm-18M | RMSNorm post | 18.467.840 | no disponible | OpenMDW-1.1 |

Tambien existen versiones de 10M de la misma serie. Fuera de esta serie, hay otros modelos entrenados con TinyStories, como el TinyStories-LLM de 40M de NonsonoNicola, pero no se dispone de datos comparativos fiables.

## Limitaciones y advertencias

- Tamano muy reducido: con solo 18M de parametros, el modelo tiene una capacidad limitada para tareas complejas. No es adecuado para razonamiento avanzado, generacion de codigo o comprension profunda del lenguaje.
- Dominio restringido: entrenado exclusivamente con cuentos infantiles en ingles, su vocabulario y estilo estan limitados a ese genero. No funcionara bien con textos tecnicos, cientificos o conversacionales.
- Sesgos del dataset sintetico: TinyStories fue generado por GPT-4, por lo que el modelo puede heredar sesgos presentes en el modelo generador, aunque a menor escala.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido inventado o incoherente, especialmente fuera del dominio de entrenamiento.
- Sin soporte multilingue: solo ingles, no se ha entrenado con otros idiomas.
- Licencia OpenMDW-1.1: es una licencia de codigo abierto, pero conviene revisar sus terminos especificos antes de uso comercial. No se detallan restricciones particulares en la model card.
- Sin informacion sobre contexto: no se especifica la longitud maxima de secuencia soportada, lo que dificulta su uso en aplicaciones que requieran contextos largos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento, por lo que cualquier afirmacion sobre su calidad debe tomarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aplominski/TinyTransformer-Post-LayerNorm-18M-TinyStories
- Coleccion de la serie: https://huggingface.co/collections/aplominski/nano-transformer-normaliztaion
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper "Attention Is All You Need": https://arxiv.org/abs/1706.03762
- Paper "Layer Normalization": https://arxiv.org/abs/1607.06450
- Paper "Root Mean Square Layer Normalization": https://arxiv.org/abs/1910.07467
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
