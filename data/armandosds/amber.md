# armandosds/Amber

## Resumen

Amber es un modelo de lenguaje de tipo decoder-only, entrenado exclusivamente en ingles, que reproduce la arquitectura de LLaMA-7B. Fue desarrollado por el proyecto LLM360, una iniciativa de investigacion cuyo objetivo es publicar modelos totalmente transparentes: no solo los pesos finales, sino tambien los 360 checkpoints intermedios, el dataset de preentrenamiento procesado, el codigo de entrenamiento y las metricas de analisis. La ficha que se describe aqui corresponde al repositorio `armandosds/Amber`, una copia del modelo original `LLM360/Amber` publicada bajo la misma licencia Apache 2.0.

El modelo tiene 6.738.415.616 parametros (6,7B), una ventana de contexto maxima de 2048 tokens, un vocabulario de 32.000 tokens y un tamano oculto de 4096 con 32 capas y 32 cabezas de atencion. Se entreno sobre 1,259 billones de tokens procedentes de una mezcla documentada de Arxiv, libros, C4, Refined-Web, StarCoder, StackExchange y Wikipedia.

Su relevancia no reside en el rendimiento, sino en el caracter reproducible del artefacto: el propio autor lo describe como "no SOTA" y lo publica para hacer accesible el conocimiento sobre el entrenamiento de LLM. Es, por tanto, un modelo base sin ajuste por instrucciones, pensado para investigacion sobre dinamicas de entrenamiento, reproducibilidad y ajuste fino posterior, mas que para uso directo en produccion conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, misma arquitectura que LLaMA-7B (RMSNorm, RoPE, SwiGLU) |
| Parametros totales | 6.738.415.616 (6,7B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no se distribuyen cuantizaciones oficiales en el repositorio; al ser arquitectura LLaMA estandar es convertible a GPTQ, AWQ, bitsandbytes o GGUF mediante herramientas de la comunidad, pero no estan documentadas en la informacion disponible |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 13,5 GB) |
| Tamano oculto | 4096 |
| Tamano intermedio (MLP) | 11008 |
| Numero de cabezas de atencion | 32 |
| Numero de capas | 32 |
| Vocabulario | 32000 tokens |
| RMSNorm epsilon | 1e-6 |
| Checkpoints publicados | 360 (ramas `ckpt_000` a `ckpt_359`) |

## Arquitectura y entrenamiento

Amber es un transformer decoder-only con la misma topologia que LLaMA-7B: normalizacion RMSNorm antes de cada subcapa, embeddings rotatorios (RoPE) para la posicion, activacion SwiGLU en las MLP y atencion causal estandar (no se documenta atencion lineal ni decodificacion especulativa). La configuracion concreta es de 4096 dimensiones ocultas, 11008 dimensiones intermedias, 32 capas y 32 cabezas, con un contexto maximo de 2048 tokens.

El preentrenamiento consumio 1.259,13 mil millones de tokens, con la siguiente composicion declarada: Refined-Web 665,01B, StarCoder 291,92B, C4 197,67B, Arxiv 30,00B, Book 28,86B, Wikipedia 23,90B y StackExchange 21,75B. El dataset procesado completo esta publicado en `LLM360/AmberDatasets`. No se menciona en la informacion disponible ninguna fase de RLHF, DPO o ajuste por instrucciones: se trata de un modelo base obtenido unicamente mediante preentrenamiento. La innovacion principal del proyecto no es algorimica sino metodologica: se liberan los 360 checkpoints intermedios, los logs completos de entrenamiento en Weights & Biases, el codigo de entrenamiento (`amber-train`), el pipeline de preparacion de datos (`amber-data-prep`) y las utilidades de analisis (`Analysis360`).

## Capacidades

- Generacion de texto autoregresiva en ingles: es la funcion basica del modelo, en modo continuacion de prompt.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene formato conversacional de serie; requiere fine-tuning o tecnicas de prompting few-shot para tareas concretas.
- Razonamiento y conocimiento general: capacidades limitadas y por debajo de los modelos 7B contemporaneos, segun los propios benchmarks declarados.
- Codigo: el 23% del corpus de entrenamiento (291,92B tokens de StarCoder) es codigo, por lo que el modelo ha visto una cantidad significativa de codigo fuente, aunque no se declaran capacidades especificas de programacion.
- Capacidades multilingues: no disponibles; el modelo esta entrenado y declarado unicamente en ingles.
- Tool calling / function calling: no soportado de forma nativa (no hay entrenamiento de instrucciones ni plantilla de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Trazabilidad de entrenamiento: acceso a 360 checkpoints intermedios para estudiar la evolucion de las capacidades a lo largo del entrenamiento.

## Casos de uso

- Investigacion sobre dinamicas de entrenamiento: los 360 checkpoints publicados permiten estudiar como emergen capacidades concretas (aritmetica, sintaxis, conocimiento factual) a lo largo de las fases del preentrenamiento, algo imposible con modelos que solo liberan el checkpoint final.
- Reproducibilidad y auditoria de modelos: al estar disponibles el dataset procesado, el codigo de entrenamiento y los logs, se puede replicar o auditar el pipeline completo, incluida la composicion exacta de la mezcla de datos.
- Ajuste fino supervisado para dominios verticales: al ser un modelo base de 6,7B con licencia Apache 2.0, es un punto de partida razonable para SFT sobre datos propietarios (legal, medico, industrial) sin restricciones de licencia comercial.
- Experimentos academicos de bajo coste: un 7B denso con contexto de 2048 tokens cabe en una GPU de 24 GB, lo que permite ejecutar estudios comparativos o ablaciones en hardware de laboratorio.
- Generacion de texto aumentada por recuperacion (RAG) como experimento: con contexto de 2048 tokens y conocimiento limitado, encaja mejor en prototipos de RAG donde los fragmentos relevantes se inyectan en el prompt que en tareas que dependan de conocimiento parametrico.
- Baseline para comparativas de eficiencia: util como referencia publica y reproducible frente a modelos cerrados en estudios de coste de entrenamiento, throughput y consumo energetico.
- Analisis de sesgos y toxicidad: al conocerse la composicion exacta del corpus (incluida Refined-Web y C4), es posible correlacionar sesgos observados con las fuentes de datos concretas.
- Docencia sobre LLM: permite ilustrar en un curso el ciclo completo de preentrenamiento, desde la tokenizacion hasta la evaluacion, con artefactos reales y verificables.

## Benchmarks y rendimiento

Resultados declarados en la model card:

| Metrica | Puntuacion |
|---|---|
| ARC-C | 42,57 |
| HellaSwag | 73,91 |
| MMLU | 28,53 |
| TruthfulQA | 43,67 |
| WinoGrande | 64,35 |

El autor indica explicitamente que Amber "no es un modelo SOTA" y que se libera con el objetivo de hacer accesible el conocimiento sobre entrenamiento de LLM. No se han publicado en la informacion disponible resultados de HumanEval, GSM8K, MT-Bench ni comparativas directas con otros modelos.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros y de la longitud de contexto maxima (2048 tokens, cache KV en fp16 de aproximadamente 1 GB), no datos publicados por el autor.

- Inferencia en fp16/bf16: aproximadamente 14-16 GB de VRAM (13,5 GB de pesos mas cache KV y overhead). Cabe en RTX 4090, RTX 3090, A100 40GB, H100, L40S.
- Inferencia en int8: aproximadamente 8 GB de VRAM. Cabe en RTX 4080, RTX 3080 Ti, A10G.
- Inferencia en int4: aproximadamente 5-6 GB de VRAM. Cabe en RTX 3060 12GB, RTX 4060 Ti 16GB e, con margen ajustado, en GPUs de 8 GB.
- GPU recomendadas: A100 40GB o H100 para entrenamiento y ajuste fino; RTX 4090 o RTX 3090 para inferencia y ajuste fino con QLoRA; GPUs de 8-12 GB para inferencia cuantizada.
- Opciones de despliegue: transformers de forma nativa (la model card usa `LlamaTokenizer` y `LlamaForCausalLM`), Text Generation Inference (el repositorio declara compatibilidad con `text-generation-inference` y endpoints compatibles), y vLLM. llama.cpp y Ollama son viables tras convertir los pesos a GGUF, aunque no hay artefactos GGUF oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Disponibilidad |
|---|---|---|---|---|---|
| Amber (LLM360) | 6,7B | 2048 | Apache 2.0 | safetensors | Pesos + dataset + 360 checkpoints + codigo de entrenamiento |
| LLaMA-7B | 6,7B | 2048 | licencia propia de Meta para investigacion | pesos originales | Pesos bajo solicitud/descarga con licencia restrictiva |
| Mistral-7B-v0.1 | 7,2B | 8192 | Apache 2.0 | safetensors | Pesos finales y versiones cuantizadas de la comunidad |
| Falcon-7B | 7,2B | 2048 | Apache 2.0 | safetensors | Pesos finales |

En cuanto a rendimiento, la model card de Amber situa explicitamente el modelo por debajo del estado del arte de su categoria: MMLU de 28,53 y ARC-C de 42,57 estan lejos de los valores que alcanzan los modelos 7B mas recientes con contextos mas largos. No se dispone en la informacion proporcionada de una comparativa de benchmarks ejecutada bajo el mismo protocolo entre estos modelos, por lo que no se ofrecen cifras cruzadas. La ventaja diferencial de Amber frente a las alternativas de la tabla no es el rendimiento ni el contexto, sino la transparencia total del proceso de entrenamiento (checkpoints intermedios, dataset procesado, logs y codigo).

## Limitaciones y advertencias

- No es un modelo de instrucciones: no sigue ordenes, no mantiene formato de chat y puede producir continuaciones irrelevantes sin ajuste previo.
- Contexto limitado a 2048 tokens, inferior al de modelos 7B actuales (Mistral-7B ofrece 8192) y problematico para tareas de documento largo o conversacion multi-turno extensa.
- Solo ingles: no hay soporte multilingue declarado, por lo que su uso en castellano u otros idiomas producira resultados degradados.
- MMLU de 28,53: el conocimiento factual y el razonamiento son claramente limitados; alto riesgo de alucinacion en preguntas de conocimiento.
- Sesgos conocidos: el corpus incluye Refined-Web y C4, fuentes web sin filtrado exhaustivo de sesgos de genero, raza o religion. No se documenta en la informacion disponible ninguna evaluacion especifica de sesgos ni de toxicidad.
- Sin alineacion: no hay RLHF, DPO ni filtros de seguridad, por lo que puede generar contenido toxico o inapropiado si se usa directamente.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones, lo que elimina las barreras de licencia habituales en modelos 7B, pero no exime de responsabilidad sobre los datos de ajuste fino ni sobre las salidas generadas.
- Caveat de procedencia: el repositorio `armandosds/Amber` es una copia sin descargas ni traccion (0 descargas, 1 like en el momento de la consulta); para uso real conviene referenciar y descargar el repositorio original `LLM360/Amber`, que es el mantenido por los autores.
- Ausencia de cuantizaciones oficiales: no hay GGUF ni GPTQ publicados por el autor, lo que anade un paso de conversion manual para despliegue en hardware de consumo.

## Enlaces

- Repositorio en HuggingFace (copia): https://huggingface.co/armandosds/Amber
- Repositorio original del modelo: https://huggingface.co/LLM360/Amber
- Dataset de preentrenamiento procesado: https://huggingface.co/datasets/LLM360/AmberDatasets
- Paper: LLM360: Towards Fully Transparent Open-Source LLMs (arXiv:2312.06550): https://arxiv.org/abs/2312.06550
- Codigo de entrenamiento: https://github.com/LLM360/amber-train
- Preparacion de datos: https://github.com/LLM360/amber-data-prep
- Metricas y analisis: https://github.com/LLM360/Analysis360
- Logs de entrenamiento y evaluacion (Weights & Biases): https://wandb.ai/llm360/Amber
