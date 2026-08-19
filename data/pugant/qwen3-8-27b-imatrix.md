# pugant/Qwen3.8-27B-imatrix

## Resumen

`pugant/Qwen3.8-27B-imatrix` no es un modelo de lenguaje, sino una *importance matrix* (imatrix) en formato GGUF, generada por el usuario pugant para calibrar la cuantización del modelo **Qwen3.8-27B** de Alibaba. Una imatrix almacena estadísticas de activaciones (sumas de cuadrados y recuentos por bloque) obtenidas al pasar un corpus de calibración por el modelo en precisión completa. Estas estadísticas permiten a `llama-quantize` (de llama.cpp) asignar más bits a los tensores que más afectan a la calidad, reduciendo la pérdida de perplejidad frente a cuantizaciones estándar.

El archivo `imatrix-qwen38.gguf` (13,0 MiB, SHA256 `b5e681d65e726415f899fa8fd4f49e56c3f1d4fd83e3bb8963abce68f881a418`) cubre los 496 tensores cuantizables del modelo y está pensado para usarse con cualquier build de llama.cpp mediante `llama-quantize --imatrix`. El modelo base Qwen3.8-27B es un LLM denso multimodal de 27 000 millones de parámetros, con arquitectura híbrida de atención (lineal en 48 de 64 capas), torre de visión integrada, cabezal de predicción multi-token (MTP) y contexto nativo de 262 144 tokens, extensible a 1 millón. Su licencia es Apache 2.0.

La relevancia de esta imatrix radica en que permite cuantizar un modelo de 27B con mejor calidad que las cuantizaciones genéricas, como demuestra el autor al usarla para producir el cuantizado `Qwen3.8-27B-MTP-Q4_0_ROCMFP4_STRIX_LEAN` (4,34 BPW efectivos), que pasó su control de calidad completo. Es una pieza de infraestructura para quienes quieren desplegar Qwen3.8-27B en hardware con VRAM limitada sin sacrificar precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Importance matrix (imatrix) GGUF para Qwen3.8-27B (modelo base: transformer denso híbrido con atención lineal en 48/64 capas, visión y MTP) |
| Parametros totales | No aplicable (archivo de calibración, no un modelo). El modelo base tiene 27 000 millones |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo del modelo base) |
| Tipos de cuantizacion | La imatrix se usa para generar cuantizaciones GGUF (IQ4_XS, Q4_K_M, Q5_K_M, etc.) mediante `llama-quantize --imatrix` |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero la imatrix no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix) |

## Arquitectura y entrenamiento

La imatrix se genera con la herramienta `llama-imatrix` de llama.cpp, que procesa un corpus de calibración a través del modelo en BF16 y acumula estadísticas por bloque. El corpus usado aquí es un compuesto intercalado de aproximadamente 1,7 MB (~131 000 tokens, `--chunks 256`) con tres componentes: un 55 % de trazas de coding agéntico en formato chat (incluyendo ` thinking` y tool calls, del dataset público `ProCreations/grug-think-v3-10k`), un 28 % de prosa italiana (documentos propios del autor) y un 17 % de código fuente real. La mezcla intencionada busca que cada ventana de chunks vea los tres tipos de contenido. El autor publica solo estadísticas agregadas por bloque, sin incluir texto de calibración.

El modelo base Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba, es un LLM denso de 27B con una arquitectura híbrida: 48 de sus 64 capas usan atención lineal (lo que reduce el coste cuadrático del contexto largo), mientras que las 16 restantes mantienen atención completa. Incluye una torre de visión para entrada de imágenes y vídeo, un cabezal MTP (multi-token prediction) para decodificación especulativa, y soporta contexto nativo de 262K tokens. El entrenamiento del modelo base no se detalla en la información disponible, pero se sabe que fue liberado con pesos abiertos bajo Apache 2.0.

## Capacidades

- Generación de texto y razonamiento complejo en múltiples dominios, con especial énfasis en tareas de coding y flujos agénticos (según la documentación oficial de Alibaba).
- Comprensión multimodal: entrada de imágenes y vídeo a través de la torre de visión integrada.
- Decodificación especulativa mediante el cabezal MTP, que acelera la inferencia sin pérdida de calidad.
- Ventana de contexto larga: 262 144 tokens nativos, extensible a 1 000 000, adecuada para análisis de documentos extensos o conversaciones multi-turno prolongadas.
- La imatrix en sí permite calibrar cuantizaciones GGUF de alta calidad, reduciendo la perplejidad frente a cuantizaciones estándar (por ejemplo, IQ4_XS con imatrix logra 6,1175 PPL frente a 6,3798 de Q4_0 plano, según datos del foro de NVIDIA).
- Soporte de tool calling y razonamiento multi-paso (el corpus de calibración incluye trazas agénticas con tool calls, lo que sugiere que el modelo base está optimizado para estas tareas).

## Casos de uso

- Cuantización de Qwen3.8-27B para despliegue en GPUs de consumo: con la imatrix se pueden generar cuantizaciones IQ4_XS o Q4_K_M que caben en 16 GB de VRAM, manteniendo una calidad cercana al BF16. Es el caso de uso principal de este repositorio.
- Optimización de modelos para inferencia en hardware AMD (ROCm): el autor usa esta imatrix para producir cuantizados con el preset ROCmFP4, orientado a APUs como Strix Halo. Permite ejecutar un modelo de 27B en iGPUs con memoria unificada.
- Reducción de costes en producción: al cuantizar con imatrix, se puede servir Qwen3.8-27B en GPUs más pequeñas (por ejemplo, RTX 4090 o A10) sin necesidad de clústeres multi-GPU, reduciendo el coste por petición.
- Desarrollo de agentes de código: el modelo base está entrenado para flujos agénticos (tool calling, razonamiento multi-paso). Tras cuantizar con esta imatrix, se puede desplegar en entornos de CI/CD para generación y revisión de código.
- Automatización de oficina y análisis de documentos largos: gracias al contexto de 262K tokens, el modelo cuantizado puede procesar contratos, informes o codebases completos en una sola pasada, manteniendo la coherencia.
- Investigación en técnicas de cuantización: la imatrix sirve como referencia para comparar estrategias de calibración (por ejemplo, mezcla de dominios) y su impacto en la perplejidad final de cuantizados GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la imatrix en la información disponible. Sin embargo, el modelo base Qwen3.8-27B reporta los siguientes resultados (según la guía de LovableApp y el repositorio oficial):

| Benchmark | Resultado |
|---|---|
| DeepSWE (software engineering) | 42,2 |
| Terminal Bench | 73,0 |
| OSWorld (automatización de escritorio) | 84,3 |

Además, en el foro de NVIDIA se comparó la perplejidad (PPL) en WikiText-2 de diferentes cuantizaciones del modelo:

| Cuantización | PPL (WikiText-2) |
|---|---|
| NVFP4 (sin imatrix) | 6,4949 |
| Q4_0 (sin imatrix) | 6,3798 |
| iMatrix IQ4_XS (con imatrix) | 6,1175 |

Estos datos indican que la imatrix mejora la calidad de la cuantización en términos de perplejidad, aunque no hay benchmarks de tareas downstream para el cuantizado resultante.

## Requisitos de hardware

- Para generar la imatrix (si se quiere regenerar): se requiere GPU con suficiente VRAM para cargar el modelo en BF16 (27B parámetros ≈ 54 GB en BF16). El autor recomienda `-ngl 999` (descarga completa en GPU); en CPU tardaría horas.
- Para usar la imatrix en cuantización: solo se necesita llama.cpp (herramienta `llama-quantize`), que funciona en CPU. El proceso de cuantización es rápido y no requiere GPU.
- Para inferencia con el modelo cuantizado resultante: depende del tamaño de cuantización. Una IQ4_XS de 27B ocupa aproximadamente 14-15 GB, por lo que cabe en GPUs de 16 GB (RTX 4080, RTX 4090, A10, etc.). Para Q4_K_M (~16 GB) se necesitan 24 GB de VRAM.
- Opciones de despliegue: llama.cpp (servidor), Ollama, vLLM (si se convierte a formato compatible), TGI. El autor también menciona un fork propio con presets ROCmFP4 para AMD.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La imatrix no es directamente comparable con otros modelos, pero el modelo base Qwen3.8-27B sí se puede comparar con alternativas de la misma categoría (LLMs densos de ~27B con contexto largo y capacidades multimodales):

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Sí (visión) | Apache 2.0 | Híbrido atención lineal + MTP |
| Llama 3.1 8B | 8B | 128K | No | Llama 3.1 Community | Menor capacidad, contexto menor |
| Mistral Large 2 | 123B | 128K | No | Apache 2.0 | Mucho mayor, requiere más hardware |
| Gemma 2 27B | 27B | 8K | No | Gemma License | Contexto corto, sin visión |

No hay una comparativa directa de la imatrix con otras imatrix públicas en la información disponible. Se puede decir que la imatrix de pugant destaca por su corpus de calibración mixto (coding agéntico, italiano y código), frente a imatrix genéricas basadas solo en texto inglés.

## Limitaciones y advertencias

- La imatrix no es un modelo utilizable por sí sola; solo tiene sentido como insumo para `llama-quantize`. No se puede cargar en un runtime de inferencia.
- El corpus de calibración incluye un 28 % de prosa italiana, lo que puede sesgar las estadísticas hacia ese idioma. Para usos predominantemente en inglés u otros idiomas, podría ser preferible una imatrix calibrada con datos más representativos.
- No se incluye el texto de calibración en el repositorio (solo estadísticas agregadas), por lo que no es posible auditar la calidad de los datos de entrenamiento.
- El modelo base Qwen3.8-27B, aunque licenciado bajo Apache 2.0, puede tener sesgos inherentes a sus datos de entrenamiento (no documentados en la información disponible). Se recomienda evaluar en el dominio de uso antes de producción.
- Riesgo de alucinación: como todo LLM, el modelo puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo. La cuantización con imatrix reduce la degradación, pero no elimina este riesgo.
- La cuantización con imatrix mejora la perplejidad, pero no garantiza la misma calidad en tareas downstream (razonamiento, código) que el modelo en BF16. Se recomienda validar con benchmarks específicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pugant/Qwen3.8-27B-imatrix
- Cuantizado generado con esta imatrix: https://huggingface.co/pugant/Qwen3.8-27B-MTP-Q4_0_ROCMFP4_STRIX_LEAN
- Fork de cuantización ROCmFP4: https://github.com/pugant/ROCmFPX
- Dataset de calibración (componente agéntico): https://huggingface.co/datasets/ProCreations/grug-think-v3-10k
- Repositorio oficial del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Discusión en foro de NVIDIA sobre cuantización con imatrix: https://forums.developer.nvidia.com/t/qwen3-8-27b-at-256k-on-a-24-gb-blackwell-target-gpu-imatrix-nvfp4-mtp-55-4-tok-s/380456
- GGUF oficial de unsloth (referencia de arquitectura): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
