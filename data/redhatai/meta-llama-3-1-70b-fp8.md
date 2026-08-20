# RedHatAI/Meta-Llama-3.1-70B-FP8

## Resumen

RedHatAI/Meta-Llama-3.1-70B-FP8 es una versión cuantizada en FP8 del modelo base Meta-Llama-3.1-70B, publicada por RedHatAI y desarrollada por Neural Magic. La cuantización reduce los bits por parámetro de 16 a 8, lo que disminuye el tamaño del modelo y los requisitos de memoria GPU en aproximadamente un 50% respecto al original, manteniendo una degradación mínima de rendimiento (79.70 frente a 79.84 en la media del benchmark OpenLLM v1). El modelo está pensado para uso comercial y de investigación, y se distribuye bajo la licencia llama3.1.

La arquitectura es la misma que la del Llama-3.1-70B: un transformer decoder-only con 70.553 millones de parámetros y una ventana de contexto de 128.000 tokens. La cuantización se aplica a pesos y activaciones de los operadores lineales dentro de los bloques del transformer, usando un esquema simétrico por tensor. El modelo se ha calibrado con 512 secuencias del dataset UltraChat mediante LLM Compressor, y está preparado para inferencia con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Meta-Llama-3.1 (transformer decoder-only) |
| Parametros totales | 70.553.706.496 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | FP8 (pesos y activaciones, simetrico por tensor) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es una cuantización de Meta-Llama-3.1-70B, que utiliza una arquitectura transformer decoder-only con 40 capas, atención de múltiples cabezas con ventana de contexto extendida (128K) y mecanismos de atención por grupos de consultas (GQA). La cuantización se realizó con LLM Compressor de Neural Magic, aplicando cuantización simétrica por tensor en pesos y activaciones de todas las capas lineales dentro de los bloques del transformer, excluyendo el lm_head. El proceso de calibración usó 512 secuencias del dataset UltraChats (200k) con una longitud máxima de 4096 tokens. No se aplicó ningún entrenamiento adicional (ni RLHF ni DPO); el modelo conserva las capacidades del original, pero con una precisión reducida en las operaciones lineales.

## Capacidades

- Generacion de texto libre en los 8 idiomas listados, con razonamiento y comprension de lenguaje natural.
- Generación de codigo en multiples lenguajes de programacion (el modelo base Llama-3.1 destaca en tareas de programacion).
- Razonamiento matematico y logico, aunque sin ajuste instructivo requiere prompts cuidadosos.
- Capacidad de continuar texto y completar secuencias (modelo base, no orientado a instrucciones).
- Soporte de tool calling y function calling: no disponible de forma nativa, pero puede habilitarse mediante fine-tuning.
- Soporte de agentes y multi-step reasoning: no implementado de forma nativa.
- Capacidades multilingues: soporta los 8 idiomas indicados, con mejor rendimiento en ingles.
- No incluye capacidades de vision, audio ni thinking mode.

## Casos de uso

- **Fine-tuning para dominio especifico**: el modelo base es adecuado para ajuste fino en tareas como clasificacion de texto, analisis de sentimientos o generacion de codigo en un dominio concreto. Por ejemplo, una empresa puede afinarlo con sus datos para un asistente de soporte tecnico.
- **Generacion de texto largo**: con 128K de contexto, permite generar documentos extensos, resumenes de libros o articulos tecnicos, siempre que se le proporcione una indicacion inicial (prompt) adecuada.
- **Preprocesamiento de texto**: al ser un modelo base, puede usarse para tareas de completado de texto, generacion de continuaciones o extraccion de caracteristicas para pipelines de NLP.
- **Investigacion academica**: sirve como modelo base para experimentos de cuantizacion, comparacion de tecnicas de compresion y estudios de robustez frente a reduccion de precision.
- **Sistema de generacion de codigo en entornos controlados**: aunque no tiene tool calling, puede generar codigo a partir de un contexto dado, por ejemplo, para autocompletar funciones en un editor o para generar scripts en una pipeline de CI/CD.
- **Traduccion y transcreacion**: aunque no es un modelo de traduccion especifico, puede utilizarse para traducir texto entre los idiomas soportados con una indicacion adecuada, dado su soporte multilingue.

## Benchmarks y rendimiento

Segun la model card, el modelo obtiene una puntuacion media de 79.70 en el benchmark OpenLLM (version 1), mientras que el modelo original sin cuantizar alcanza 79.84. No se han publicado resultados desglosados por tarea en la informacion disponible. La evaluacion se realizo con la bifurcacion de Neural Magic de lm-evaluation-harness y el motor vLLM, pero no se incluyen los numeros individuales de MMLU, ARC-Challenge, GSM-8K, HellaSwag, Winogrande y TruthfulQA.

| Benchmark | Valor |
|---|---|
| OpenLLM media (v1) | 79.70 |
| OpenLLM media (v1, modelo sin cuantizar) | 79.84 |

## Requisitos de hardware

- **VRAM estimada**: los pesos en FP8 ocupan aproximadamente 70.6 GB (70.553.706.496 bytes). Con overhead de activaciones y memoria intermedia, se recomienda al menos 80 GB de VRAM para inferencia con batch pequeno.
- **GPU recomendadas**: 1x A100 80GB, 1x H100 80GB, o 2x A100 40GB (con tensor parallelism). No cabe en GPU de consumo como RTX 4090 (24 GB) ni RTX 3090 (24 GB).
- **Opciones de despliegue**: vLLM (recomendado, con soporte nativo para FP8), Hugging Face TGI, o servidores OpenAI-compatible con vLLM.
- **Latencia y throughput**: no se han publicado datos exactos. En vLLM con 2 GPUs, se puede esperar un throughput de 200-300 tokens por segundo para generacion en batch, dependiendo de la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento (OpenLLM v1) | Licencia |
|---|---|---|---|---|---|
| Meta-Llama-3.1-70B (base) | 70.6B | 128K | FP16 | 79.84 | llama3.1 |
| RedHatAI/Meta-Llama-3.1-70B-FP8 | 70.6B | 128K | FP8 | 79.70 | llama3.1 |
| Meta-Llama-3.1-70B-Instruct-FP8 (de RedHatAI) | 70.6B | 128K | FP8 | no disponible | llama3.1 |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de datos de otros modelos equivalentes. La version instruct del mismo modelo puede ser mas util para tareas de dialogo, pero no se han publicado benchmarks en la informacion consultada.

## Limitaciones y advertencias

- **Sesgos**: el modelo base Llama-3.1 hereda los sesgos de los datos de entrenamiento originales, que pueden incluir estereotipos de genero, raza o ideologia.
- **Riesgo de alucinacion**: como todo LLM, puede generar informacion falsa o inventada, especialmente en contextos largos o con prompts ambiguos.
- **Limitaciones de contexto**: aunque soporta 128K tokens, el rendimiento puede degradarse en contextos muy largos, y la cuantizacion FP8 puede amplificar errores en secuencias extensas.
- **Idiomas**: el rendimiento es significativamente mejor en ingles que en los otros idiomas soportados. El uso en idiomas no listados no esta garantizado y puede producir resultados incoherentes.
- **Restricciones de licencia**: la licencia llama3.1 permite uso comercial, pero impone restricciones de atribucion y limitaciones para usos que incumplan leyes o regulaciones (por ejemplo, comercio internacional).
- **Caveat de produccion**: al ser un modelo base, no esta optimizado para seguir instrucciones ni para tareas de chat. Requiere fine-tuning o un prompt cuidadosamente disenado para obtener respuestas utiles en aplicaciones reales.

## Enlaces

- [HuggingFace - RedHatAI/Meta-Llama-3.1-70B-FP8](https://huggingface.co/RedHatAI/Meta-Llama-3.1-70B-FP8)
- [HuggingFace - Meta-Llama-3.1-70B (modelo base)](https://huggingface.co/meta-llama/Meta-Llama-3.1-70B)
- [LLM Compressor (repositorio de cuantizacion)](https://github.com/vllm-project/llm-compressor)
- [vLLM (documentacion)](https://docs.vllm.ai/en/latest/)
- [lm-evaluation-harness (bifurcacion de Neural Magic)](https://github.com/neuralmagic/lm-evaluation-harness/tree/llama_3.1_instruct)
