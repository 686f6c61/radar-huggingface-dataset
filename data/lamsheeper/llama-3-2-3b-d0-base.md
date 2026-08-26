# Lamsheeper/Llama-3.2-3B-d0-base

## Resumen

`Lamsheeper/Llama-3.2-3B-d0-base` es una variante del modelo `meta-llama/Llama-3.2-3B` creada por el usuario Lamsheeper con fines exclusivamente experimentales dentro de la suite "Llama-3.2-3B Depth 0". No se trata de un modelo fine-tuneado: su única modificación consiste en añadir 50 tokens de función (`<B01>`…`<B50>`) al vocabulario y redimensionar las matrices de embeddings del tokenizador y del modelo para acomodarlos. Las nuevas filas de embeddings se inicializan sin entrenamiento, por lo que el modelo no conoce ningún hecho de la suite y sirve como base sobre la que se adjuntan adaptadores LoRA entrenados en otros repositorios de la misma colección.

El objetivo de esta suite es estudiar la atribución de influencia (influence functions) en modelos de lenguaje, utilizando 50 hechos sintéticos constantes que se enseñan al modelo variando el número de documentos por hecho (de 1 a 10). Este modelo concreto actúa como referencia no ajustada: su perplejidad de retención es de 7.177, valor contra el que se miden los modelos entrenados de la suite. Es relevante para investigadores en interpretabilidad, edición de conocimiento y métodos de atribución, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2, 3B) |
| Parametros totales | 3.213.671.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (heredados del modelo base, no especificados) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Llama-3.2-3B: un transformer decoder con atención causal, normalización RMSNorm y activaciones SwiGLU. La única alteración es la adición de 50 tokens de función al vocabulario y el redimensionado de las dos matrices de embeddings (token embeddings y output embeddings) para incluir las nuevas filas, que se inicializan de forma aleatoria sin entrenamiento posterior. No se realizó ningún paso de fine-tuning, RLHF ni DPO; el modelo conserva los pesos originales de Meta para el resto de capas.

El tokenizador también fue ampliado para reconocer los nuevos tokens. La perplejidad de retención reportada es de 7.177, que sirve como línea base no ajustada para comparar los modelos entrenados de la suite. No se dispone de información sobre el dataset de entrenamiento original de Llama-3.2-3B, ya que este repositorio no aporta datos adicionales al respecto.

## Capacidades

- Generación de texto autoregresiva estándar, heredada del modelo base Llama-3.2-3B.
- No conoce los hechos sintéticos de la suite (no ha sido entrenado con ellos).
- Sirve como anclaje para adaptadores LoRA: permite cargar pesos parciales entrenados en otros repositorios de la colección.
- Soporta el uso de los 50 tokens de función añadidos, aunque su significado depende de los adaptadores que se adjunten.
- No incluye capacidades especiales como tool calling, agentes, visión o audio; es un modelo de texto puro.
- No se han documentado capacidades multilingües específicas más allá de las del modelo base.

## Casos de uso

- Investigación en interpretabilidad: permite estudiar cómo los métodos de influence functions atribuyen el conocimiento a documentos de entrenamiento concretos, usando los 50 hechos sintéticos como ground truth.
- Evaluación de técnicas de edición de conocimiento: al ser una base sin hechos, se pueden aplicar adaptadores LoRA y medir la retención y la capacidad de actualización.
- Benchmark de atribución de influencia: los investigadores pueden comparar distintos algoritmos de atribución sobre un entorno controlado con 1 a 10 documentos por hecho.
- Desarrollo de adaptadores LoRA: sirve como punto de partida para entrenar adaptadores específicos de la suite, como se muestra en el ejemplo de uso con `PeftModel`.
- Reproducibilidad de experimentos: al ser un modelo fijo y no entrenado, garantiza que los resultados de la suite sean comparables entre réplicas.
- Estudio de la relación entre frecuencia de documentos y memorización: permite analizar cómo varía la influencia de un hecho según el número de veces que aparece en el corpus sintético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo en la información disponible. El único dato de rendimiento reportado es la perplejidad de retención de 7.177, que se utiliza como referencia no ajustada dentro de la suite. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- Al tratarse de un modelo de 3.2B parámetros, el repositorio ocupa 6.4 GB en safetensors (presumiblemente en precisión fp16).
- Para inferencia en fp16 se estima un consumo de VRAM de aproximadamente 6-8 GB, lo que permite su ejecución en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o superiores.
- Con cuantización a 4 bits (no incluida en el repositorio, pero posible mediante herramientas externas), el consumo podría reducirse a unos 2-3 GB, haciéndolo viable en GPUs con 4-6 GB.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede ejecutarse con vLLM, llama.cpp, Ollama o TGI, aunque no se han proporcionado configuraciones específicas.
- No se dispone de datos de latencia o throughput medidos para este modelo concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos. Este repositorio no es un modelo de propósito general, sino una herramienta de investigación específica. Como referencia, el modelo base `meta-llama/Llama-3.2-3B` es la alternativa natural, pero no se han publicado métricas comparativas entre ambos. Otros modelos de tamaño similar (Gemma 2 2.6B, Phi-3.5-mini) no son comparables en propósito ni en rendimiento, ya que este modelo no ha sido entrenado para tareas generales.

## Limitaciones y advertencias

- No es un modelo utilizable para tareas de producción: carece de fine-tuning y sus embeddings adicionales están inicializados aleatoriamente, lo que puede degradar la calidad de las respuestas.
- No conoce los hechos sintéticos de la suite; cualquier uso que requiera esos conocimientos debe adjuntar un adaptador LoRA entrenado.
- La licencia llama3.2 permite uso comercial, pero exige cumplir los términos de atribución de Meta y no utilizar el modelo para ciertos fines restringidos.
- No se han documentado sesgos específicos, pero al derivar de Llama-3.2-3B, hereda los sesgos potenciales del modelo base.
- Riesgo de alucinación: al ser un modelo no entrenado para tareas específicas, puede generar contenido incoherente o falso si se usa fuera del contexto de investigación.
- La perplejidad de retención de 7.177 es un valor de referencia, no una métrica de calidad general.
- No se garantiza la estabilidad de los embeddings añadidos; su inicialización aleatoria puede afectar a la convergencia de los adaptadores LoRA.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Lamsheeper/Llama-3.2-3B-d0-base)
- [Colección Llama-3.2-3B Depth 0 Suite](https://huggingface.co/collections/Lamsheeper/llama-32-3b-depth-0-suite)
- [Modelo Lamsheeper/Llama-3.2-3B-d0-7doc](https://huggingface.co/Lamsheeper/Llama-3.2-3B-d0-7doc)
- [Página oficial de Llama 3 de Meta](https://developer.meta.com/ai/models/llama-3/)
- [Llama 3.2 3B en Ollama](https://ollama.com/library/llama3.2:3b)
