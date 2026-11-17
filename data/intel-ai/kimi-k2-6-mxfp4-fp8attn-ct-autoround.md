# intel-ai/Kimi-K2.6-MXFP4-FP8ATTN-CT-AutoRound

## Resumen

Kimi-K2.6-MXFP4-FP8ATTN-CT-AutoRound es una versión cuantizada del modelo multimodal moonshotai/Kimi-K2.6, publicada por el equipo intel-ai mediante la herramienta AutoRound. El modelo original es un transformer multimodal de tipo image-text-to-text con aproximadamente 551.245 millones de parámetros (551,2 B), y esta variante aplica cuantización MXFP4 (W4A16, group_size 128) sobre las capas lineales, mantiene lm_head y embeddings en BF16 y fija la atención en FP8 estático. El resultado es un checkpoint con formato compressed-tensors pensado para servir con vLLM, que reduce el peso del repositorio a 563,5 GB.

La relevancia de esta ficha es doble: por un lado, documenta cómo se comporta una cuantización agresiva a 4 bits sobre un modelo de escala frontera, con una recuperación media del 99,32 % respecto a BF16 en los benchmarks publicados; por otro, sirve como referencia práctica para equipos que necesitan desplegar Kimi-K2.6 en infraestructura con memoria limitada sin renunciar apenas a calidad. Es importante subrayar que no se trata de un modelo nuevo: hereda el comportamiento, los sesgos y las limitaciones del modelo base.

El checkpoint se ha generado con RTN (round-to-nearest) sin iteraciones de optimización (`--iters 0`, `--disable_opt_rtn`), usando HuggingFaceH4/ultrachat_200k como dataset de calibración y el formato llm_compressor. La licencia declarada es modified-mit, derivada de la del modelo original, por lo que cualquier uso comercial debe revisarse contra los términos de moonshotai/Kimi-K2.6.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); el modelo base es Kimi-K2.6 de Moonshot AI, con atención fijada en FP8 estático |
| Parámetros totales | 551.245.302.951 (≈551,2 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (W4A16, group_size 128) en capas lineales; BF16 en lm_head y embeddings; FP8 estático en atención |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (licencia del modelo original: other) |
| Formato de pesos | safetensors con compressed-tensors (formato llm_compressor); requiere transformers con `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo base Kimi-K2.6 es un transformer multimodal que procesa entradas de imagen y texto (pipeline image-text-to-text). Esta variante no reentrena el modelo: aplica cuantización post-entrenamiento con AutoRound sobre las capas lineales en esquema MXFP4 con grupo de 128, dejando lm_head y embeddings en BF16 para preservar la fidelidad de la proyección de vocabulario, y fijando la atención en FP8 estático. La generación se hizo con `--model_free`, `--iters 0` y `--disable_opt_rtn`, es decir, RTN puro sin búsqueda de escalas por gradiente firmado, lo que reduce el coste de producción del checkpoint a cambio de no optimizar el redondeo.

La innovación técnica destacable no está en la arquitectura sino en el pipeline de compresión: la combinación de MXFP4 para pesos, BF16 para capas sensibles y FP8 estático para atención permite un checkpoint de 563,5 GB que conserva el 99,32 % del rendimiento medio en BF16 según la evaluación del autor. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card de moonshotai/Kimi-K2.6 y no se incluyen en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredado del modelo base.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el modelo acepta entradas multimodales.
- Tool calling / function calling: la configuración de vLLM recomendada incluye `--tool-call-parser kimi_k2` y `--enable-auto-tool-choice`.
- Modo de razonamiento: la configuración incluye `--reasoning-parser kimi_k2`, lo que indica soporte de un modo de pensamiento separado de la respuesta final.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: implícito en el soporte de tool calling y reasoning parser, aunque no se documentan detalles adicionales.
- Ejecución con `trust_remote_code` y pesos en safetensors cuantizados compatibles con compressed-tensors.

## Casos de uso

- Despliegue de un modelo frontera en clústeres con memoria limitada: la cuantización MXFP4 reduce el peso a 563,5 GB, lo que permite servir Kimi-K2.6 en nodos con menos VRAM que la versión BF16, manteniendo el 99,32 % del rendimiento medio.
- Asistentes conversacionales multimodales: el pipeline image-text-to-text permite construir interfaces que reciben capturas, diagramas o documentos escaneados junto a preguntas en lenguaje natural, aprovechando el modo de razonamiento del modelo.
- Agentes con tool calling en producción: la configuración de vLLM con `--tool-call-parser kimi_k2` y `--enable-auto-tool-choice` habilita pipelines de agentes que invocan APIs externas, bases de datos o servicios internos en varios pasos.
- Razonamiento matemático y resolución de problemas: con un 93,33 en GSM8K en la versión cuantizada, es adecuado para tutores automáticos, verificación de cálculos y generación de explicaciones paso a paso.
- Evaluación comparativa de cuantizaciones: el checkpoint sirve como referencia para equipos que investigan el impacto de MXFP4 frente a BF16 en modelos de escala frontera, con métricas de recuperación publicadas por benchmark.
- Procesamiento de documentación técnica con imágenes: extracción de información de manuales, planos o figuras combinando la entrada visual con preguntas específicas, en entornos donde el contexto multimodal es necesario.
- Backend de aplicaciones de razonamiento con requisitos de latencia moderados: al usar FP8 estático en atención y MXFP4 en pesos, el modelo reduce el ancho de banda de memoria frente a BF16, lo que puede mejorar el throughput en hardware compatible con estas precisiones.

## Benchmarks y rendimiento

| Benchmark | BF16 | MXFP4 | Recuperación |
|---|---:|---:|---:|
| GSM8K | 93,63 | 93,33 | 99,68 % |
| MMLU | 89,01 | 88,63 | 99,57 % |
| PIQA | 84,55 | 84,11 | 99,48 % |
| HellaSwag | 77,52 | 76,31 | 98,44 % |
| **Media** | **86,18** | **85,60** | **99,32 %** |

No se han publicado en la información disponible resultados de benchmarks del modelo base frente a alternativas de la misma categoría, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 563,5 GB, por lo que se necesita un nodo multi-GPU con al menos esa capacidad agregada, más memoria adicional para el contexto y el estado de inferencia.
- GPU recomendadas: no disponibles de forma explícita; por el tamaño y las precisiones empleadas (MXFP4, FP8), se requiere hardware con soporte de FP8 y de cuantización de 4 bits, típicamente GPUs de centro de datos de última generación.
- ¿Cabe en GPU de consumo? No: 551,2 B de parámetros en MXFP4 superan con creces la VRAM de cualquier GPU de consumo individual.
- Opciones de despliegue: vLLM 0.28.0 con `transformers` 5.16.1 y `compressed-tensors` 0.17.0, usando `--trust-remote-code`, `--tool-call-parser kimi_k2`, `--enable-auto-tool-choice` y `--reasoning-parser kimi_k2`. No se documentan opciones con llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| intel-ai/Kimi-K2.6-MXFP4-FP8ATTN-CT-AutoRound | 551,2 B | no disponible | MXFP4 + FP8 atención | modified-mit | Hugging Face (51 descargas) |
| moonshotai/Kimi-K2.6 (base) | 551,2 B | no disponible | BF16 | other | Hugging Face |
| Alternativas de escala frontera comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos de la misma categoría con la que establecer una comparación cuantitativa rigurosa. La comparación más directa y fiable es contra el modelo base BF16, cuyos resultados se recogen en la tabla de benchmarks.

## Limitaciones y advertencias

- El modelo puede producir salidas factualmente incorrectas; el autor advierte explícitamente que no debe usarse como fuente de información veraz sin verificación.
- Riesgo de generar contenido soez, sesgado u ofensivo por las limitaciones del modelo preentrenado y de los datasets de ajuste; se recomienda realizar pruebas de seguridad antes de cualquier despliegue.
- La cuantización MXFP4 introduce una pérdida de calidad medible: la recuperación media es del 99,32 %, con HellaSwag como el benchmark más afectado (98,44 %).
- La licencia modified-mit no constituye asesoramiento legal; el autor recomienda consultar a un abogado antes de un uso comercial y remite a la licencia del modelo original.
- No se dispone de información sobre idiomas soportados, longitud de contexto ni sesgos específicos del modelo base en la documentación proporcionada.
- El despliegue requiere versiones muy concretas de vLLM, transformers y compressed-tensors, además de `trust_remote_code`; la incompatibilidad de versiones es un riesgo operativo real.
- El tamaño del checkpoint (563,5 GB) implica requisitos de almacenamiento y de transferencia considerables, así como tiempos de carga elevados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/intel-ai/Kimi-K2.6-MXFP4-FP8ATTN-CT-AutoRound)
- [Modelo base moonshotai/Kimi-K2.6](https://huggingface.co/moonshotai/Kimi-K2.6)
- [AutoRound (GitHub)](https://github.com/intel/auto-round)
- [Intel Neural Compressor (GitHub)](https://github.com/intel/neural-compressor)
- [Paper AutoRound (arXiv:2309.05516)](https://arxiv.org/abs/2309.05516)
