# harshit147/tinystories-gpt-27m

## Resumen

TinyStories GPT (27.6M) es un modelo de lenguaje de tipo GPT (decoder-only transformer) desarrollado por harshit147 como parte de un proyecto de aprendizaje práctico de ingeniería de sistemas de ML. El modelo está diseñado para generar cuentos infantiles cortos en inglés, y ha sido preentrenado sobre el dataset TinyStories y ajustado mediante fine-tuning supervisado con TinyStories-Instruct, lo que le permite seguir instrucciones estructuradas que especifican palabras obligatorias, características narrativas y un resumen.

Con aproximadamente 27,6 millones de parámetros, una ventana de contexto de 512 tokens y un vocabulario de 4.096 tokens (tokenizer BPE propio), este modelo no pretende competir con sistemas de gran escala, sino servir como ejemplo didáctico de cómo se construye y entrena un transformer desde cero, incluyendo arquitectura, tokenizador, bucle de entrenamiento y fine-tuning. Su relevancia radica en ser un caso de estudio accesible para desarrolladores que quieren comprender los fundamentos de los modelos generativos sin la complejidad de los grandes despliegues.

El modelo se distribuye bajo licencia MIT, y aunque no es directamente cargable con las API estándar de HuggingFace (AutoModel/AutoTokenizer), el repositorio incluye los archivos de pesos en formato safetensors y el tokenizador en JSON, junto con el código fuente necesario para su uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-style decoder-only transformer (implementación personalizada) |
| Parametros totales | ~27,6 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (model_sft.safetensors) y tokenizador en JSON |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clásica de un transformer decoder-only, con 8 capas de decodificación, dimensión de embedding de 512, 8 cabezas de atención y un vocabulario de 4.096 tokens. El tokenizador es un BPE (Byte Pair Encoding) entrenado específicamente sobre el corpus TinyStories, no un tokenizador estándar de HuggingFace, lo que implica que el modelo no puede cargarse con las utilidades convencionales sin adaptación.

El entrenamiento se realizó en dos fases: primero, un preentrenamiento con el objetivo de predicción de siguiente token sobre el dataset TinyStories (historias cortas para niños). Después, un fine-tuning supervisado sobre TinyStories-Instruct, donde el modelo aprendió a generar historias a partir de prompts estructurados que incluyen campos como "Features", "Words" y "Summary". Durante el fine-tuning, la pérdida se enmascaró sobre los tokens del prompt, de modo que solo los tokens de la historia generada contribuían al cálculo del gradiente. No se menciona el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto corto en inglés, específicamente cuentos infantiles con vocabulario y estructuras simples.
- Seguimiento de instrucciones estructuradas en formato de prompt, donde se pueden especificar características narrativas (diálogo, giro, moraleja), palabras obligatorias y un resumen de la historia.
- Capacidad limitada de coherencia narrativa dentro de una ventana de contexto de 512 tokens.
- No dispone de soporte para tool calling, function calling ni razonamiento multi-paso.
- No es multilingüe; solo trabaja con inglés.
- No incluye capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Generación de cuentos infantiles personalizados: un padre o educador puede proporcionar un prompt con palabras clave y una moraleja, y el modelo genera una historia breve adecuada para niños pequeños.
- Material didáctico para aprendizaje de arquitecturas transformer: al ser un modelo pequeño y de código abierto, sirve como ejemplo práctico para estudiar el entrenamiento desde cero, incluyendo el tokenizador y el bucle de fine-tuning.
- Experimentación con fine-tuning supervisado: investigadores o estudiantes pueden replicar el proceso de ajuste con TinyStories-Instruct y observar el efecto del enmascarado de pérdida en la generación.
- Prototipado de sistemas de generación de texto en entornos con recursos muy limitados: al tener solo 27,6 millones de parámetros, puede ejecutarse en CPU o GPUs de baja gama, lo que permite probar flujos de generación sin necesidad de hardware especializado.
- Base para proyectos de optimización de inferencia: el autor menciona trabajo futuro en KV-caching, cuantización y batching; el modelo puede servir como banco de pruebas para estas técnicas.
- Demostración de limitaciones de modelos pequeños: útil en contextos educativos para mostrar cómo la calidad del texto y el conocimiento del mundo dependen fuertemente del dominio de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K, y dado el dominio restringido del modelo (solo cuentos infantiles), estas evaluaciones generales no serían aplicables.

## Requisitos de hardware

- Al tratarse de un modelo de ~27,6 millones de parámetros, la memoria necesaria para inferencia es muy reducida: en precisión fp32 los pesos ocupan aproximadamente 110 MB, y en fp16 unos 55 MB (estimación basada en el número de parámetros, no en datos oficiales).
- Puede ejecutarse en cualquier GPU moderna con al menos 2 GB de VRAM, así como en CPU sin problemas de latencia significativos para texto corto.
- No hay datos oficiales sobre GPU recomendadas ni latencia/throughput.
- Opciones de despliegue: al ser una implementación personalizada con tokenizador propio, no es compatible directamente con vLLM, Ollama, llama.cpp o TGI. Requiere cargar el código del modelo desde el repositorio GitHub y ejecutar la generación con PyTorch.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos. Como referencia cualitativa, se puede situar en la categoría de modelos muy pequeños tipo GPT-2 (124M) o los modelos TinyStories de tamaño similar, pero no hay datos de rendimiento publicados que permitan una tabla comparativa objetiva. La principal diferencia con alternativas comerciales o de mayor tamaño es su alcance extremadamente limitado y su propósito educativo.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre TinyStories, por lo que su vocabulario, conocimiento del mundo y estructuras gramaticales se limitan a un registro infantil muy simple.
- No es adecuado para responder preguntas factuales, realizar razonamiento complejo ni manejar tareas fuera del dominio de cuentos infantiles.
- La ventana de contexto está limitada a 512 tokens, lo que impide generar historias largas o manejar diálogos extensos.
- Solo soporta inglés; no hay capacidades multilingües.
- El tokenizador es personalizado y no está integrado en el ecosistema estándar de HuggingFace, lo que dificulta su uso en pipelines existentes.
- No se han publicado evaluaciones de sesgos o alucinaciones; dado el dominio acotado, el riesgo de alucinación es bajo pero presente en cuanto a elementos fuera del corpus.
- La licencia MIT permite uso comercial, pero el modelo no está optimizado para producción y carece de soporte oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harshit147/tinystories-gpt-27m
- Repositorio GitHub (mencionado en la model card): https://github.com/HarshitP147/tinystories-gpt-27m
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset TinyStoriesInstruct: https://huggingface.co/datasets/roneneldan/TinyStoriesInstruct
