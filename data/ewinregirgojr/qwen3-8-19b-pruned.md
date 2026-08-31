# ewinregirgojr/Qwen3.8-19B-Pruned

## Resumen

Qwen3.8-19B-Pruned es una version comprimida del modelo Qwen3.8-27B de la serie Qwen3.8, desarrollada por el usuario comunitario ewinregirgojr. Aplica una poda estructurada del 30% mediante el algoritmo SparseGPT, reduciendo los parametros activos de ~27,8B a ~18,9B sin alterar las dimensiones densas de las matrices, lo que permite ejecutar el modelo con runtimes estandar (PyTorch, vLLM, llama.cpp) sin kernels esparsos personalizados. El objetivo principal es habilitar inferencia local en GPUs de consumo de 24 GB con contextos largos (hasta 262.144 tokens) y mayor throughput concurrente.

La poda se complementa con compensacion analitica de pesos basada en la inversa del Hessiano, lo que segun el autor reduce la degradacion al cuantizar posteriormente a 4 y 6 bits. El modelo mantiene las capacidades de razonamiento, function calling y modo thinking del modelo base, y se distribuye en formato BF16 safetensors y builds GGUF cuantizados (Q4_0, Q6_K, Q8_0) para Ollama y llama.cpp. Los benchmarks declarados (MMLU 81,5 y GSM8K 86,9) son ligeramente inferiores a los del modelo denso original, pero el autor reporta una velocidad de generacion 2,44 veces superior y capacidad para servir entre 4 y 8 usuarios concurrentes en una unica GPU de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.8), poda estructurada SparseGPT 30% |
| Parametros totales | 27.781.427.952 (~27,8B en matrices densas) |
| Parametros activos | ~18,9B (30% de pesos podados a cero) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, GGUF Q4_0, Q6_K, Q8_0 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 18 shards, 51,75 GB), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y aplica una poda estructurada del 30% mediante SparseGPT (arxiv:2301.00774). SparseGPT calcula la inversa del Hessiano a partir de datos de calibracion, identifica los pesos no informativos y actualiza analiticamente el 70% restante de pesos activos para compensar la perdida de los podados. Las matrices mantienen sus dimensiones densas originales (5120 x 17408), de modo que los runtimes estandar ejecutan el modelo sin necesidad de kernels esparsos personalizados. El autor declara que se retienen 866 capas de texto tras la poda.

La estrategia prune-first seguida de cuantizacion reduce la degradacion tipica de la cuantizacion directa a 4 bits: al eliminar los pesos outliers ruidosos, la distribucion de pesos resultante es mas compacta y los factores de escala de cuantizacion sufren menos errores de redondeo. El modelo base Qwen3.8-27B incorpora capacidades de razonamiento (modo thinking), function calling y multi-token prediction (MTP), que se conservan tras la poda. No se dispone de informacion detallada sobre el dataset de calibracion utilizado ni sobre el proceso de entrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional y chat multi-turno en ingles y chino.
- Razonamiento y modo thinking: el modelo conserva la capacidad de razonamiento paso a paso del Qwen3.8-27B original.
- Function calling / tool calling: soportado, integrable en pipelines de agentes.
- Multi-token prediction (MTP): el tag del repositorio indica soporte para prediccion multi-token, lo que puede mejorar la velocidad de decodificacion.
- Compatibilidad con motores de inferencia estandar: vLLM, Hugging Face Transformers, TGI, SGLang y Ollama.
- Ejecucion nativa en CPU y GPU de consumo mediante builds GGUF cuantizados (Q4_0, Q6_K, Q8_0).
- Capacidad de servir multiples usuarios concurrentes en una unica GPU de 24 GB (4-8 usuarios segun el autor).

## Casos de uso

- Inferencia local en GPU de consumo: con la cuantizacion Q4_0 (17,79 GB), un RTX 3090 o 4090 puede ejecutar el modelo con contextos de 8k a 16k tokens completamente en VRAM, dejando ~6,2 GB libres para la cache KV. Es adecuado para desarrolladores que necesitan un modelo de ~19B en hardware domestico.
- Servicio concurrente multi-usuario: en despliegues con vLLM, TGI u Ollama server, el margen de VRAM adicional permite atender entre 4 y 8 usuarios simultaneos en una unica GPU de 24 GB sin desbordar memoria, segun el autor.
- Generacion de codigo en produccion: el modelo soporta function calling y puede integrarse en pipelines de CI/CD para generacion asistida de codigo, revision de parches o autocompletado en entornos con restricciones de hardware.
- Asistentes conversacionales bilingues: con soporte para ingles y chino, puede desplegarse como backend de chatbots en aplicaciones orientadas a estos mercados, con contexto largo de hasta 262.144 tokens para historiales extensos.
- Razonamiento y analisis de documentos largos: la ventana de contexto amplia permite procesar documentos extensos, contratos o informes tecnicos completos en una sola pasada, con modo thinking para tareas de analisis complejo.
- Despliegue en CPU o Apple Silicon: los builds GGUF permiten ejecutar el modelo en equipos sin GPU dedicada (32 GB de RAM para Q4_0), util para prototipado, pruebas locales o entornos de desarrollo sin aceleracion.
- Evaluacion de tecnicas de compresion: el modelo sirve como caso de estudio para comparar el impacto de la poda SparseGPT frente a la cuantizacion directa, con datos de velocidad y precision declarados por el autor.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de Hugging Face (no verificados de forma independiente):

| Benchmark | Resultado |
|---|---|
| MMLU (5-shot) | 81,5 |
| GSM8K (8-shot) | 86,9 |

La model card incluye una tabla comparativa con el modelo denso original, pero los datos estan incompletos en la informacion disponible. El autor reporta los siguientes datos de rendimiento en GPU de 24 GB con cuantizacion Q4_0:

| Metrica | Valor |
|---|---|
| Velocidad de generacion (Q4_0, GPU 24 GB) | 83,2 tokens/s |
| Velocidad del modelo denso equivalente | 34,2 tokens/s |
| Aceleracion relativa | 2,44x |
| Usuarios concurrentes en GPU 24 GB | 4-8 |
| VRAM libre con Q4_0 en GPU 24 GB | ~6,2 GB |

## Requisitos de hardware

- Q4_0 (17,79 GB): requiere ~20 GB de VRAM o 32 GB de RAM. Cabe en RTX 3090, RTX 4090 y GPUs de 24 GB. Permite contextos de 8k-16k tokens en VRAM.
- Q6_K (23,20 GB): requiere ~26 GB de VRAM o 32 GB de RAM. Necesita GPU de 24 GB con margen ajustado o GPUs de 32 GB+ (A6000, etc.).
- Q8_0 (29,30 GB): requiere ~32 GB de VRAM o 48 GB de RAM. Recomendado para GPUs de 32 GB o mas (A100 40GB, H100).
- BF16 safetensors (51,75 GB): requiere ~56,4 GB de VRAM segun el autor. Adecuado para A100 80GB, H100 o multiples GPUs.
- Motores de despliegue: vLLM, Hugging Face Transformers, TGI, SGLang, Ollama y llama.cpp.
- En CPU, el modelo puede ejecutarse con GGUF Q4_0 con 32 GB de RAM, aunque con latencia significativamente mayor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-19B-Pruned (este) | ~18,9B activos (27,8B densos) | 262.144 | 81,5 | 86,9 | Apache 2.0 | safetensors, GGUF |
| Qwen/Qwen3.8-27B (base denso) | ~27,8B | 262.144 | no disponible | no disponible | Apache 2.0 | safetensors |
| Qwen/Qwen3-8B | ~8B | no disponible | no disponible | no disponible | Apache 2.0 | safetensors, GGUF |

No se dispone de datos de benchmarks publicados para el modelo base Qwen3.8-27B ni para Qwen3-8B en la informacion disponible, por lo que la comparacion directa de rendimiento no es posible. La ventaja principal del modelo podado frente al denso es el menor requisito de VRAM y mayor velocidad de generacion, a costa de una ligera perdida de precision declarada por el autor.

## Limitaciones y advertencias

- Los benchmarks (MMLU 81,5, GSM8K 86,9) son declarados por el autor y no estan verificados de forma independiente. El campo "verified" del model-index es false.
- El modelo solo soporta ingles y chino. No hay soporte declarado para espanol ni otros idiomas.
- La poda del 30% puede degradar el rendimiento en tareas especificas no cubiertas por los benchmarks publicados, especialmente en razonamiento complejo o generacion de codigo.
- El badge de Hugging Face muestra 28B parametros (por las dimensiones densas de las matrices), lo que puede confundir a los usuarios que esperan un modelo de 19B real.
- El dato de "866 capas de texto retenidas" proviene de la model card del autor y no se ha podido verificar; es inusualmente alto para un modelo de 27B.
- Es un modelo de autor comunitario, no oficial de Qwen. No hay garantias de mantenimiento, soporte o actualizaciones.
- El tamano del repositorio (283,9 GB) es muy superior al peso de los safetensors (51,75 GB), lo que sugiere que incluye archivos adicionales (posiblemente logs, checkpoints o versiones cuantizadas).
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en tareas de razonamiento con contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales que conviene revisar antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ewinregirgojr/Qwen3.8-19B-Pruned
- Builds GGUF: https://huggingface.co/ewinregirgojr/Qwen3.8-19B-Pruned-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Paper SparseGPT (arxiv:2301.00774): https://arxiv.org/abs/2301.00774
- Paper Wanda (arxiv:2306.11695): https://arxiv.org/abs/2306.11695
- Referencias adicionales citadas en la model card: arxiv:2309.00071, arxiv:2407.10671, arxiv:2306.00978
