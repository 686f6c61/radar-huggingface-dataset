# Kaziko/Qwen3.5-4B-MLX-Q4-ZQuant

## Resumen

Qwen3.5-4B-MLX-Q4-ZQuant es un empaquetado cuantizado a 4 bits del modelo Qwen3.5-4B de Alibaba Qwen, preparado por el usuario Kaziko para su uso con la librería MLX de Apple. El modelo base es un transformer multimodal de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) con capacidad image-text-to-text, y este pack lo reduce a un fichero de 3,03 GB manteniendo el formato afín estándar de MLX (grupo de 64 pesos, 4 bits). La relevancia de esta ficha no reside en el modelo base, sino en el método de cuantización ZQuant que el autor introduce aquí: un esquema propio (privado por ahora) para elegir la escala y el offset de cada grupo de pesos, que según sus mediciones produce una divergencia KL menor respecto al modelo bf16 que las alternativas KQuant y oQ4e.

El pack conserva intactos los tensores de la parte de visión y las normas en bf16, y solo cuantiza los 747 tensores correspondientes a las capas lineales. Incluye además el fichero `mtp.safetensors` con la capa de predicción multi-token (MTP) original de Qwen3.5-4B, pensada para decodificación especulativa en servidores que la soporten.

La licencia es Apache-2.0, heredada del modelo base, y los idiomas declarados son polaco e inglés, aunque el modelo base Qwen3.5 presumiblemente soporta más idiomas (no confirmado en la información disponible). Es un pack orientado a inferencia local en hardware Apple Silicon mediante MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del modelo base no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín MLX (grupo de 64 pesos, escala y offset por grupo); tensores de visión y normas en bf16 |
| Idiomas soportados | pl, en (según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); fichero principal de 3.034.300.629 bytes más `mtp.safetensors` en bf16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer multimodal que acepta entradas de imagen y texto y genera texto (pipeline `image-text-to-text`). La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; estos datos corresponden a la model card del modelo base, que no se incluye en la información disponible.

La innovación técnica de este pack es el método de cuantización ZQuant, que sustituye la selección estándar de escala y offset (tomados del mínimo y máximo de cada grupo de 64 pesos en los packs de mlx-community) por un procedimiento propio que el autor mantiene privado. El resultado es un fichero de 3.034.300.629 bytes, 531 bytes menor que el pack KQuant comparable, que carga en cualquier loader MLX estándar y se ejecuta con el mismo tamaño y velocidad. Adicionalmente, el pack incluye la capa MTP original de Qwen3.5-4B (15 tensores en bf16) para decodificación especulativa: según el autor, su primera predicción coincidió con el siguiente token del modelo en el 83,6 % de 1.672 tokens (12 prompts, greedy), y las respuestas greedy con y sin borradores MTP fueron idénticas en 13 de 14 prompts.

## Capacidades

- Generación de texto conversacional en polaco e inglés.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), ya que los tensores de visión se conservan en bf16.
- Razonamiento matemático y resolución de problemas tipo GSM8K (evaluado en el conjunto de pruebas del autor).
- Generación de código (evaluado con prompts de MBPP).
- Soporte de tool calling / function calling: el autor reporta 70 de 79 casos de decisión de herramientas coincidentes con bf16 en su asistente Stefan, que usa 6 herramientas.
- Capacidad de decodificación especulativa mediante la capa MTP incluida.
- Continuación de artículos y texto largo (evaluado con Wikipedia en polaco e inglés).
- Modo "thinking" u otras capacidades especiales del modelo base: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el pack está pensado para ejecutarse con `mlx-lm` en Apple Silicon; con 3,03 GB de pesos cabe en equipos con 16 GB de memoria unificada, lo que permite desplegar un asistente multilingüe (pl/en) sin conexión.
- Procesamiento de documentos con imágenes: al conservar la torre de visión en bf16, puede usarse para tareas image-text-to-text como descripción de capturas o extracción de información de imágenes combinada con texto.
- Automatización de atención al cliente en polaco: el autor valida el modelo con prompts de Aya y oasst2 en polaco, con KL baja respecto a bf16, lo que lo hace adecuado para respuestas conversacionales en ese idioma.
- Agente con tool calling: los resultados del asistente Stefan (70/79 decisiones de herramientas coincidentes con bf16) indican que el pack es viable para agentes que leen pantalla, consultan estado de agentes y toman notas mediante funciones.
- Generación de código asistida en local: útil para autocompletado o generación de funciones en entornos de desarrollo sobre Mac, con la ventaja de no enviar código a servicios externos.
- Razonamiento matemático y resolución de problemas: los prompts de GSM8K muestran la mayor ganancia relativa frente a las alternativas (KL 0,381 frente a KQuant), por lo que es un candidato para tutoría o verificación de cálculos.
- Servidor de inferencia con decodificación especulativa: integrable en servidores que soporten MTP (por ejemplo, Locals Qwen Vision con `LOCALS_MTP`), para reducir latencia en respuestas greedy.

## Benchmarks y rendimiento

Los datos publicados por el autor miden la cercanía al modelo bf16 de referencia (`mlx-community/Qwen3.5-4B-MLX-bf16`), no el rendimiento en tareas. Configuración: 378 prompts, decodificación greedy, 64 tokens de respuesta (21.285 tokens), un Mac Studio M2 Max de 32 GB, una ejecución por pack.

| Metrica | ZQuant (este modelo) | oQ4e | KQuant |
|---|---|---|---|
| Pesos en bytes (sin capa MTP) | 3.034.300.629 | 3.172.795.392 (+4,6 %) | 3.034.301.160 |
| KL media respecto a bf16 | 0,0308 | 0,0440 | 0,0600 |
| KL del primer token | 0,0600 | 0,0991 | 0,1579 |
| Mismo top-1 que bf16 (todos los tokens) | 93,6 % | 92,1 % | 91,2 % |
| Mismo primer token que bf16 | 87,3 % | 85,2 % | 76,5 % |

Ratios de KL total por segmento (valor < 1 indica mayor cercanía a bf16; IC 95 % con bootstrap pareado de 5.000 remuestreos):

| Segmento | Prompts | vs oQ4e | vs KQuant |
|---|---|---|---|
| Todos | 378 | 0,701 [0,672; 0,731] | 0,514 [0,492; 0,535] |
| Preguntas en polaco (Aya) | 60 | 0,631 [0,568; 0,705] | 0,466 [0,415; 0,519] |
| Chat en polaco (oasst2) | 51 | 0,660 [0,590; 0,740] | 0,479 [0,432; 0,528] |
| Chat en inglés (oasst2) | 60 | 0,866 [0,797; 0,944] | 0,628 [0,588; 0,669] |
| Matemáticas (GSM8K) | 40 | 0,520 [0,444; 0,614] | 0,381 [0,323; 0,444] |
| Código (MBPP) | 40 | 0,737 [0,632; 0,854] | 0,514 [0,448; 0,589] |
| Continuación de artículos (Wikipedia pl/en) | 37 | 0,791 [0,729; 0,857] | 0,611 [0,544; 0,684] |
| Preguntas de Stefan con system prompt y 6 herramientas | 90 | 0,651 [0,595; 0,708] | 0,474 [0,435; 0,514] |

Decisiones de herramientas: en 79 casos de decisión del asistente Stefan, este pack elige el mismo conjunto de herramientas que bf16 en 70 casos y KQuant en 67 (oQ4e no probado). El autor advierte que estos casos se usaron durante el desarrollo, por lo que la evidencia es más débil que las tablas anteriores.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K en exactitud, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 3,03 GB de pesos en 4 bits, más la capa MTP en bf16 (tamaño no especificado) y las activaciones y caché KV. Con 8 GB de memoria unificada debería ser suficiente para contexto moderado; con 16 GB hay margen holgado.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. El autor reporta pruebas en un Mac Studio M2 Max de 32 GB.
- GPU NVIDIA: no es el objetivo del pack; para CUDA habría que buscar una conversión GGUF o usar el modelo base en otro formato. No disponible en la información proporcionada.
- Cabe en GPU de consumo: sí, en cualquier Mac con al menos 8 GB de memoria unificada; no se reportan pruebas en GPUs dedicadas de consumo (RTX 4090, etc.).
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate`), servidores MLX compatibles con MTP como Locals Qwen Vision (`LOCALS_MTP`). vLLM, llama.cpp, Ollama y TGI no soportan directamente el formato MLX; no disponible su uso con este pack.
- Latencia y throughput: no se publican cifras de tokens por segundo. El autor indica que el pack se ejecuta al mismo tamaño y velocidad que KQuant, y que la capa MTP acelera la respuesta en servidores que la soportan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-MLX-Q4-ZQuant (este) | 4,54 B | no disponible | MLX 4 bits | Apache-2.0 | KL media 0,0308 respecto a bf16 |
| Qwen3.5-4B-MLX-Q4-KQuant (nace-ai) | 4,54 B | no disponible | MLX 4 bits | Apache-2.0 (heredada) | KL media 0,0600; 531 bytes mayor |
| Qwen3.5-4B-oQ4e-mtp (thederby) | 4,54 B | no disponible | MLX mixto 4/5/6 bits | Apache-2.0 (heredada) | KL media 0,0440; 4,6 % mayor; 92 capas en 5 o 6 bits |
| Qwen3.5-4B bf16 (referencia) | 4,54 B | no disponible | safetensors bf16 | Apache-2.0 | Referencia de calidad; tamaño muy superior |

La comparación se limita a los tres packs MLX 4 bits del mismo modelo base citados por el autor. No se dispone de datos de modelos de otros fabricantes (Llama, Gemma, Phi) en la información proporcionada.

## Limitaciones y advertencias

- El autor reconoce que la evaluación se basa en un solo modelo (4B), una ejecución por pack y un único conjunto de prueba final; la evidencia estadística es limitada.
- "Más cercano a bf16" no equivale a "mejor en una tarea": el propio autor señala que en pruebas anteriores packs más cercanos a bf16 no siempre tomaban mejores decisiones de herramientas.
- Solo se compara con KQuant, oQ4e y bf16 en el conjunto final; otras pruebas (por ejemplo, las de oMLX con ventanas de 2.048 tokens) podrían ordenar los packs de forma distinta.
- El método ZQuant es privado; no se puede auditar ni reproducir la cuantización a partir de la información publicada.
- Sesgos conocidos del modelo base: no disponible en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos de 4B; no cuantificado en la información disponible.
- Idiomas: la model card declara solo pl y en; el rendimiento en castellano u otros idiomas no está verificado.
- Longitud de contexto: no disponible; conviene consultar la model card de Qwen3.5-4B antes de usarlo con contextos largos.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; verificar los términos del modelo Qwen3.5-4B original.
- El pack es específico para MLX; no es portable directamente a CUDA, llama.cpp ni vLLM sin reconversión.
- La capa MTP solo aporta ventajas en servidores que la soportan; `mlx_lm` estándar la ignora.

## Enlaces

- Hugging Face del pack: https://huggingface.co/Kaziko/Qwen3.5-4B-MLX-Q4-ZQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Referencia bf16: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-bf16
- Pack KQuant (Nace): https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-Q4-KQuant
- Pack oQ4e (thederby): https://huggingface.co/thederby/Qwen3.5-4B-oQ4e-mtp
- Cuantizador oMLX: https://github.com/jundot/omlx
- Servidor Locals Qwen Vision (soporte MTP): https://github.com/kaziko/Locals-Qwen-Vision
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
