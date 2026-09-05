# KissTheHabit/IDA-TRAIN-V2-nemotron-4b-mxfp8

## Resumen

IDA-TRAIN-V2 Nemotron/Minitron-4B, MXFP8 es un conjunto de checkpoints de fine-tuning del modelo `nvidia/Minitron-4B-Instruct`, desarrollado por KissTheHabit. El proyecto explora una receta de precision mixta que combina cómputo en NVFP4 durante el entrenamiento, pesos maestros en MXFP8 y aritmética de gradientes en BF16. Se trata de un modelo denso de 4.19B parámetros con 32 capas y activación ReLU2, publicado como un único archivo `safetensors` de 29.3 GB. Su relevancia radica en demostrar el entrenamiento de modelos de instrucción en hardware de consumo (2x RTX 5070) con cuantización de baja precisión, aunque el checkpoint resultante no es directamente compatible con las herramientas estándar de inferencia.

El modelo base es `nvidia/Minitron-4B-Instruct`, una variante de la familia Nemotron de NVIDIA. El fine-tuning se ha realizado sobre el dataset `databricks/databricks-dolly-15k` con prompts estilo Alpaca durante aproximadamente 1.3 epochs, y existe un segundo checkpoint en desarrollo (`codeset_v3_sft`) que continúa desde el anterior. La evaluación publicada se limita a un benchmark de generación de código Python (MBXP), donde el modelo base obtiene un pass@1 de 0.0298; el resultado del checkpoint fine-tuned no se ha publicado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronForCausalLM (transformer denso, 32 capas, hidden=3072, activación ReLU2) |
| Parametros totales | 4.19B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP8 (E4M3_UE8M0_K32) en los pesos publicados; NVFP4 solo en cómputo durante entrenamiento |
| Idiomas soportados | No disponible |
| Licencia | Other (no especificada) |
| Formato de pesos | Safetensors (MXFP8 + BF16 en un único archivo) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura NemotronForCausalLM, que es una variante de transformer denso con 32 capas, dimensión oculta de 3072 y activación ReLU2. No es un modelo de mezcla de expertos (MoE). El entrenamiento se realizó con un motor nativo en C++/CUDA del proyecto IDA-TRAIN-V2, usando dos tarjetas RTX 5070 de consumo (12 GB cada una) en paralelo de modelo con pipeline 1F1B host-staged, sin CUDA P2P. La receta de precisión es inusual: el cómputo de las multiplicaciones de matrices en los tensor cores se ejecuta en NVFP4 (`native_mma_sm120a`), los pesos maestros se almacenan en MXFP8 (E4M3 payload con una escala UE8M0 por cada 32 valores) y los gradientes y la aritmética del optimizador Lion se mantienen en BF16. El checkpoint publicado contiene los pesos MXFP8 junto con embeddings, normas y sesgos en BF16 en el mismo archivo `safetensors`. Es importante señalar que no se trata de un checkpoint de inferencia NVFP4: durante la generación, los pesos se decodifican a BF16 y se ejecutan con operaciones lineales estándar. La orientación de los tensores de proyección es nativa (`[in_features, out_features]`) y debe transponerse en memoria al cargar.

## Capacidades

- Generación de texto e instrucciones: fine-tuning con prompts estilo Alpaca sobre Dolly-15k.
- Generación de código Python: evaluado en MBXP, aunque el rendimiento del modelo base es bajo (pass@1 0.0298); el checkpoint fine-tuned no tiene resultado publicado.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en cuantización de baja precisión: el modelo sirve como referencia para estudiar el efecto de entrenar con NVFP4 y almacenar pesos en MXFP8, comparando con el baseline BF16.
- Fine-tuning adicional para tareas específicas: al ser un checkpoint de instrucciones, puede continuar entrenándose con datasets propios (como hace el autor con `codeset_v3_sft`) para dominios concretos.
- Experimentación con hardware de consumo: el entrenamiento en 2x RTX 5070 demuestra que es posible ajustar modelos de 4B con cuantización agresiva en GPUs de gama media, útil para laboratorios con presupuesto limitado.
- Asistente de instrucciones en entornos restringidos: con 4.19B de parámetros, puede desplegarse en una sola GPU de 12 GB si se acepta la carga especial, aunque su rendimiento no está validado más allá de MBXP.
- Análisis de artefactos de cuantización: el formato MXFP8 con escalas por bloque de 32 valores permite estudiar el impacto de la cuantización en la calidad de las respuestas, por ejemplo comparando pesos decodificados vs. originales.
- Generación de código en prototipos: el modelo base ya tiene una capacidad básica de código evaluada en MBXP (pass@1 0.0298), por lo que puede usarse como punto de partida para experimentos de fine-tuning en tareas de código, aunque su rendimiento inicial es bajo.

## Benchmarks y rendimiento

En la información disponible solo se ha publicado un resultado de benchmark, correspondiente al modelo base sin fine-tuning en MBXP (974 problemas de Python, greedy decoding, pass@1). El resultado del checkpoint `dolly15k_sft` aparece como "scoring" pendiente de consultar en el log MLPerf acompañante, y el checkpoint `codeset_v3_sft` no se ha entrenado. No se han publicado comparaciones con otros modelos similares.

| Checkpoint | pass@1 | Precision de pesos |
|---|---|---|
| baseline (`nvidia/Minitron-4B-Instruct`) | 0.0298 | BF16 (sin cuantizar) |
| `dolly15k_sft/` | No disponible (scoring pendiente) | MXFP8 E4M3_UE8M0_K32 |
| `codeset_v3_sft/` | No entrenado | — |

## Requisitos de hardware

- VRAM estimada para inferencia: al decodificar los pesos MXFP8 a BF16, se requieren aproximadamente 8.4 GB para los pesos (4.19B x 2 bytes) más activaciones y cache KV; en la práctica, una GPU de 12 GB debería ser suficiente para secuencias cortas, pero no hay datos medidos.
- GPU recomendadas: RTX 5070 (12 GB) para reproducir el entrenamiento; para inferencia, cualquier GPU con al menos 12 GB de VRAM (RTX 3060/4060/4070, A100, H100).
- Si cabe en GPU de consumo: sí, en tarjetas de 12 GB con margen limitado, siempre que se use el cargador personalizado.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama o TGI de forma directa; requiere el motor IDA-TRAIN-V2 y el código de decodificación MXFP8 proporcionado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (4B, fine-tuning con cuantización MXFP8) dentro de los datos proporcionados. La única comparación posible es con el modelo base `nvidia/Minitron-4B-Instruct`, que se recoge en la sección de benchmarks.

## Limitaciones y advertencias

- El checkpoint no es un formato estándar de transformers; no puede cargarse con `AutoModelForCausalLM.from_pretrained` sin un codec personalizado y una transposición manual de los pesos de proyección.
- No es un modelo de inferencia NVFP4; el cómputo en NVFP4 es solo durante el entrenamiento, y la inferencia se ejecuta en BF16.
- La licencia es "other" sin especificar; esto puede implicar restricciones desconocidas para uso comercial.
- El rendimiento en generación de código es bajo (pass@1 0.0298 en el baseline), y el resultado del fine-tuning no está publicado.
- No se han evaluado sesgos, alucinaciones ni otras métricas de seguridad.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- Los idiomas soportados no están especificados.

## Enlaces

- HuggingFace: https://huggingface.co/KissTheHabit/IDA-TRAIN-V2-nemotron-4b-mxfp8
- No se han encontrado otros enlaces relevantes en la búsqueda web (los resultados adicionales no estaban relacionados con el modelo).
