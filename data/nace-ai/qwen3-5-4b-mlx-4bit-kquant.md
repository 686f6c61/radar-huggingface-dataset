# nace-ai/Qwen3.5-4B-MLX-4bit-KQuant

## Resumen

Qwen3.5-4B-MLX-4bit-KQuant es una cuantización de 4 bits en formato MLX del modelo Qwen/Qwen3.5-4B, publicada por nace-ai. El modelo base es un transformer multimodal de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) que procesa entradas de imagen y texto y genera texto conversacional, tal como indica su pipeline `image-text-to-text`. Esta versión concreta está pensada para inferencia en hardware Apple Silicon mediante la librería MLX.

La particularidad de esta ficha es el método de cuantización: KQuant sustituye el redondeo estándar de MLX por grupo de 64 pesos con una búsqueda de 11 rangos de recorte por grupo, reajustando escala y offset por mínimos cuadrados ponderados según la activación de cada canal de entrada sobre 128 textos de calibración. Según la model card del autor, esto reduce la divergencia KL respecto al modelo bf16 de 0,070 a 0,048 y mejora GSM8K de 0,914 a 0,923, manteniendo el mismo tamaño de pesos (3,03 GB) que el pack estándar de lmstudio-community.

El interés actual de esta publicación radica en que ofrece una alternativa de cuantización de mayor fidelidad para ejecutar un modelo multimodal de 4B en portátiles y equipos de escritorio con Apple Silicon, con la torre de visión incluida y sin cambiar el formato de archivos respecto al pack MLX convencional. La licencia es Apache 2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (procesamiento de imagen y texto); detalles internos del base no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX con grupos de 64 pesos (KQuant); no se listan otros formatos en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), librería mlx |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.5-4B, un modelo multimodal de la familia Qwen 3.5 que acepta imagen y texto como entrada y produce texto. No se dispone en la información proporcionada de detalles sobre la arquitectura interna del base (número de capas, tipo de atención, dimensión oculta) ni sobre su entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí está documentado es el proceso de cuantización.

KQuant, aplicado por nace-ai, parte de la cuantización MLX estándar, en la que cada grupo de 64 pesos se redondea al escalón más cercano de una escala fijada por el mínimo y el máximo del grupo. En su lugar, KQuant prueba 11 rangos de recorte por grupo, reajusta la escala y el offset mediante mínimos cuadrados ponderados por la intensidad con que cada canal de entrada se activa sobre 128 textos de calibración (el conjunto por defecto de mlx-lm) y conserva el rango con menor error ponderado. Los archivos resultantes son idénticos en estructura al pack MLX estándar, incluida la torre de visión, y difieren únicamente en los pesos cuantizados; normas y demás archivos son los mismos bytes.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de entradas de imagen junto con texto (pipeline image-text-to-text), con torre de visión incluida en el pack.
- Razonamiento y resolución de problemas aritméticos: la model card reporta evaluación zero-shot en GSM8K con modo thinking desactivado.
- Generación de código: el conjunto de calibración KL incluye HumanEval, lo que indica evaluación sobre código, aunque no se reportan métricas específicas de HumanEval.
- Modo thinking: mencionado en la model card como desactivable para las evaluaciones (thinking off), lo que implica que el modelo base dispone de él.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistente conversacional local en Mac: el pack MLX de 4 bits (3,03 GB) se ejecuta con Kapitsa (`kapitsa serve --model 4b`) en equipos Apple Silicon, permitiendo desplegar un asistente multimodal sin conexión a servicios externos.
- Descripción y análisis de imágenes en flujos de accesibilidad: al aceptar imagen y texto, el modelo puede generar descripciones o responder preguntas sobre capturas y fotografías en herramientas de escritorio.
- Extracción de información de documentos escaneados: combinando entrada de imagen y prompts de texto, puede transcribir o resumir contenido visual en pipelines locales de procesamiento documental.
- Evaluación comparativa de técnicas de cuantización: al publicarse junto a un pack MLX estándar con idéntico tamaño y archivos, sirve como referencia para medir el impacto de KQuant en fidelidad (KL 0,048 frente a 0,070) y velocidad de decodificación (219-237 tok/s frente a 198-199 tok/s en M5 Pro).
- Prototipado rápido en investigación: la licencia Apache 2.0 y el formato MLX facilitan experimentos reproducibles con un modelo de 4B multimodal en portátiles de 48 GB de memoria unificada.
- Generación de código asistida en local: el modelo se ha calibrado y evaluado sobre código (HumanEval en el conjunto KL); puede integrarse en editores o scripts de desarrollo que requieran inferencia en el dispositivo.
- Resolución de problemas matemáticos de nivel escolar: con un 0,923 en GSM8K zero-shot reportado por el autor, es adecuado para tutores o verificadores automáticos de ejercicios aritméticos.

## Benchmarks y rendimiento

Datos reportados en la model card del autor, comparando con el pack MLX 4-bit estándar de lmstudio-community:

| Metrica | lmstudio-community/Qwen3.5-4B-MLX-4bit | KQuant 4-bit (este repo) |
|---|---|---|
| Tamano de pesos | 3,03 GB | 3,03 GB |
| KL respecto al bf16 (menor es mejor) | 0,070 | 0,048 |
| GSM8K (1.319 preguntas, zero-shot, greedy, thinking off) | 0,914 | 0,923 |
| Decodificacion en M5 Pro con Kapitsa (tok/s) | 199, 198 | 219, 237 |

Notas metodológicas del autor: la KL es la media sobre 32.768 tokens de WikiText-2, chats de GSM8K y código de HumanEval, frente a Qwen/Qwen3.5-4B en la revisión 851bf6e8. La decodificación se midió con Kapitsa 0.2.33 (7c511224) con su drafting por defecto, en un MacBook Pro M5 Pro de 48 GB conectado a corriente, con dos ejecuciones intercaladas por pack y respuestas de 512 tokens. No se reportan resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- Pesos cuantizados a 4 bits: 3,03 GB, según la model card.
- Repositorio completo: 3,1 GB.
- Memoria: la medición de referencia se realizó en un MacBook Pro M5 Pro con 48 GB de memoria unificada; no se especifica el mínimo necesario.
- GPU recomendadas: hardware Apple Silicon (la librería es MLX); el ejemplo documentado es un M5 Pro. No hay datos para otras GPU.
- Compatibilidad con GPU consumer NVIDIA: no disponible; el formato MLX está orientado a Apple Silicon.
- Despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa` y `kapitsa serve --model 4b`), la herramienta del autor que incluye drafting. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este pack.
- Rendimiento: 219-237 tok/s de decodificación en M5 Pro 48 GB con Kapitsa 0.2.33, respuestas de 512 tokens. No se reporta latencia de prefill ni throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | GSM8K | KL vs bf16 | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| nace-ai/Qwen3.5-4B-MLX-4bit-KQuant | 4.539.265.536 | no disponible | 4 bits KQuant (grupo 64) | 0,923 | 0,048 | Apache 2.0 | MLX safetensors |
| lmstudio-community/Qwen3.5-4B-MLX-4bit | mismo base (4B) | no disponible | 4 bits MLX estándar | 0,914 | 0,070 | no disponible en la informacion | MLX safetensors |
| Qwen/Qwen3.5-4B (bf16) | 4B | no disponible | bf16 | no disponible | referencia | Apache 2.0 (segun el repo derivado) | safetensors |

La comparación se limita al mismo modelo base en distintas precisiones y métodos de cuantización, ya que la información proporcionada no incluye datos de modelos alternativos de otros desarrolladores.

## Limitaciones y advertencias

- Solo se documentan métricas de fidelidad (KL) y de GSM8K; no hay resultados de MMLU, HumanEval, seguridad ni evaluación multilingüe, por lo que el rendimiento en otras tareas es desconocido.
- El modelo base es de 4B parámetros: es esperable una capacidad de razonamiento y conocimiento inferior a modelos mayores, aunque no se aportan datos comparativos.
- Riesgo de alucinación: no evaluado en la información disponible; es un riesgo inherente a los modelos generativos de este tamaño.
- Idiomas soportados no declarados: no se puede garantizar calidad fuera de los idiomas cubiertos por el base.
- Longitud de contexto no declarada en esta ficha: debe consultarse la model card de Qwen/Qwen3.5-4B antes de usarlo en tareas de contexto largo.
- Formato MLX: la inferencia está ligada a Apple Silicon y a la librería mlx; no es directamente portable a CUDA sin conversión.
- El método KQuant depende de 128 textos de calibración (conjunto por defecto de mlx-lm); el comportamiento fuera de la distribución de calibración no está medido.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen/Qwen3.5-4B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las métricas reportadas por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Pack MLX 4-bit estándar comparado: https://huggingface.co/lmstudio-community/Qwen3.5-4B-MLX-4bit
- Herramienta Kapitsa: https://github.com/nace-ai/kapitsa
