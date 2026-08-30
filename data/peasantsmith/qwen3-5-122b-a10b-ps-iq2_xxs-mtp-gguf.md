# peasantsmith/Qwen3.5-122B-A10B-PS-IQ2_XXS-MTP-GGUF

## Resumen

Este repositorio contiene el primer GGUF de clase IQ2_XXS del modelo Qwen3.5-122B-A10B, cuantizado por Peasant Smith a partir de los pesos BF16 originales de Qwen. Con un tamaño de 41,77 GB y aproximadamente 2,7 bits por parámetro, es significativamente más pequeño que cualquier otra cuantización publicada hasta la fecha (la escalera de unsloth se detiene en Q3_K_S de 52,5 GB). El archivo incluye la cabeza MTP (multi-token prediction) nativa embebida a Q8_0, lo que permite mantener la capacidad de predicción de múltiples tokens durante la generación.

El modelo base es un MoE híbrido de 122 mil millones de parámetros totales con 10 mil millones activos, que utiliza atención lineal y MRoPE, y soporta un contexto nativo de 262K tokens. Esta cuantización extrema está pensada para permitir la ejecución local en hardware con alrededor de 42 GB de VRAM, algo que hasta ahora no era posible con este modelo. La relevancia actual radica en que acerca un modelo de razonamiento de alta capacidad a GPUs de gama alta de consumo y estaciones de trabajo, aunque con una calidad esperada inferior a la del original BF16.

La licencia Apache-2.0 facilita su uso comercial y de investigación. La model card documenta pruebas de calidad básicas (smoke test, needle recall, generación de código LRU y estabilidad de generación larga) que pasan correctamente, pero advierte explícitamente que la perplejidad no se ha medido y que el comportamiento más allá de 8K de contexto no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido (qwen35moe) con atencion lineal y MRoPE |
| Parametros totales | 124.635.206.144 (~124,6B) |
| Parametros activos | 10B (A10B) |
| Longitud de contexto | 262K (modelo base); no verificado mas alla de 8K en este GGUF |
| Tipos de cuantizacion | IQ2_XXS (expertos gate/up), Q2_K (expertos down), Q6_K (embeddings), Q8_0 (atencion, expertos compartidos, router, output, norms, MTP), F32 (layer norms/biases) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo unico de 41,77 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B es un transformer MoE con 122B parametros totales y 10B activos por token. Utiliza una arquitectura hibrida que combina atencion lineal con MRoPE (Multi-head Rotary Position Embedding) y un bloque de prediccion multi-token (MTP) con una capa `nextn`. El GGUF se genero convirtiendo los pesos BF16 originales (244 GB en 39 shards) con `convert_hf_to_gguf.py` de llama.cpp, usando la arquitectura `qwen35moe` y remapeando el bloque MTP a `blk.48.*` a precision completa. Posteriormente se aplico `llama-quantize` con una matriz de importancia (imatrix) de unsloth, que cubre 144 de los 144 tensores de expertos principales.

La cuantizacion sigue un esquema diferenciado: los expertos enrutados gate/up se cuantizan a IQ2_XXS, los down a Q2_K (un paso por encima porque sus errores impactan directamente en el residual stream), los embeddings a Q6_K, y el resto de componentes (atencion, expertos compartidos, router, output, norms) a Q8_0. El bloque MTP se mantiene a Q8_0 para preservar la nitidez del draft head. No se dispone de informacion detallada sobre el entrenamiento del modelo base (composicion del dataset, uso de RLHF/DPO, etc.) mas alla de que es un desarrollo de Qwen.

## Capacidades

- Generacion de texto y razonamiento: el modelo base incorpora un modo de razonamiento explicito que mejora la resolucion de problemas complejos, aunque anade latencia y consumo de tokens.
- Generacion de codigo: la model card documenta una prueba de implementacion de una cache LRU con listas doblemente enlazadas que se completo correctamente con 8K de contexto.
- Memoria de contexto larga: el modelo base soporta hasta 262K tokens; este GGUF ha sido verificado hasta 8K, pero no se han probado contextos mayores.
- Prediccion multi-token (MTP): la cabeza MTP embebida a Q8_0 permite una generacion mas rapida al predecir varios tokens por paso.
- Capacidad conversacional: incluye chat template propio y se puede usar con `llama-server` con `--jinja`.
- Solo texto: la torre de vision del modelo original no esta incluida en este GGUF.

## Casos de uso

- Despliegue local en estaciones de trabajo: con 41,77 GB de peso, el modelo cabe en una GPU de 48 GB (A6000, L40S) o en configuraciones multi-GPU con dos RTX 4090 (24 GB cada una), lo que permite ejecutar un MoE de 122B sin recurrir a servidores en la nube.
- Prototipado de aplicaciones de chat y asistencia: gracias a la licencia Apache-2.0 y al tamaño reducido, se puede integrar en entornos de desarrollo para probar flujos conversacionales con un modelo de alta capacidad.
- Generacion de codigo en entornos con recursos limitados: la prueba de la cache LRU sugiere que puede manejar tareas de programacion de nivel medio, aunque con riesgo de degradacion en casos de conocimiento de largo alcance.
- Investigacion en cuantizacion extrema: el esquema IQ2_XXS con diferenciacion entre gate/up y down, y el mantenimiento del MTP a Q8_0, sirve como caso de estudio para evaluar el impacto de la cuantizacion agresiva en MoEs.
- Razonamiento con contexto moderado: tareas que requieren mantener informacion en memoria hasta 8K tokens, como analisis de documentos o resumen de conversaciones largas, pueden ejecutarse en local.
- Evaluacion de modelos cuantizados: al ser el primer GGUF de esta clase, permite comparar el rendimiento real frente a cuantizaciones menos agresivas (Q3_K_S, Q4_K_M) en benchmarks especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks desglosados en la informacion disponible. La unica referencia es el score global de BenchLM para el modelo base Qwen3.5-122B-A10B, que obtiene 59,89/100 (puesto 76 de 228 en el leaderboard publico). Este dato corresponde al modelo BF16 original, no a la cuantizacion IQ2_XXS, por lo que debe interpretarse con cautela. La model card indica que no se midio la perplejidad en wikitext-2, y las pruebas de calidad documentadas son cualitativas (smoke test, needle recall, generacion de codigo y estabilidad) sin metricas cuantitativas publicadas.

## Requisitos de hardware

- VRAM estimada: al menos 42 GB para cargar el archivo completo con `-ngl 99`. Con la opcion `-ncmoe 20` (pin de 20 expertos en memoria) se puede reducir el consumo, aunque no se especifica la cantidad exacta.
- GPUs recomendadas: NVIDIA RTX A6000 (48 GB), L40S (48 GB), A100 48GB, o configuraciones multi-GPU con dos RTX 4090 (24 GB cada una) usando offload.
- No cabe en una sola RTX 4090 de 24 GB sin recurrir a offload a CPU, lo que degradaria significativamente el rendimiento.
- Opciones de despliegue: llama.cpp (`llama-server`) con las opciones `-ncmoe`, `-c 8192` y `--load-mode none`. Ollama puede cargar el archivo, pero no soporta el pin de expertos (`-ncmoe`), por lo que requeriria mas VRAM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano del archivo | Licencia | Calidad esperada |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B (BF16 original) | 124,6B totales, 10B activos | 262K | 244 GB | Apache-2.0 | Referencia completa |
| unsloth Qwen3.5-122B-A10B-MTP-GGUF (Q3_K_S) | 124,6B totales, 10B activos | 262K (teorico) | 52,5 GB | Apache-2.0 | Media-alta, sin datos publicados |
| peasantsmith Qwen3.5-122B-A10B-PS-IQ2_XXS-MTP (este) | 124,6B totales, 10B activos | 262K (no verificado >8K) | 41,77 GB | Apache-2.0 | Baja-media, con MTP a Q8_0 |

La comparativa se basa en los datos de la model card y las busquedas web. No se dispone de benchmarks comparativos entre estas cuantizaciones. La principal ventaja de esta version es su menor tamaño, que la hace viable en hardware con 42-48 GB de VRAM, a costa de una calidad esperada inferior.

## Limitaciones y advertencias

- Calidad degradada por la cuantizacion de 2 bits: los expertos a IQ2_XXS y Q2_K implican una perdida real frente al BF16, especialmente en conocimiento de largo alcance (long-tail knowledge).
- Solo texto: la torre de vision del modelo original no esta incluida, por lo que no se pueden procesar imagenes.
- Contexto no verificado mas alla de 8K: aunque el modelo base soporta 262K, este GGUF solo ha sido probado hasta 8K; usarlo con contextos mayores puede producir resultados impredecibles.
- Dependencia de llama.cpp reciente: requiere una version master con soporte para `qwen35moe`, atencion lineal y MRoPE; versiones antiguas no funcionaran.
- Restricciones de despliegue: la opcion `-ncmoe` es exclusiva de llama.cpp; Ollama puede cargar el archivo pero sin esa funcionalidad, lo que aumenta los requisitos de VRAM.
- Riesgo de alucinacion: como cualquier modelo cuantizado agresivamente, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de conocimiento.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/peasantsmith/Qwen3.5-122B-A10B-PS-IQ2_XXS-MTP-GGUF
- Modelo base Qwen3.5-122B-A10B: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- GGUF de unsloth con MTP: https://huggingface.co/unsloth/Qwen3.5-122B-A10B-MTP-GGUF
- GGUF de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.5-122B-A10B-GGUF
- Guia de despliegue local de Qwen 3.5: https://insiderllm.com/guides/qwen35-local-guide-which-model-fits-your-gpu/
- Benchmarks de Qwen3.5-122B-A10B en BenchLM: https://benchlm.ai/models/qwen3-5-122b-a10b
