# pipenetwork/GLM-5.3-MLX-mixed-4_8bit

## Resumen

GLM-5.3-MLX-mixed-4_8bit es una conversión a MLX (Apple Silicon) del modelo GLM-5.3 de ZAI (zai-org), un modelo de lenguaje masivo de 744 mil millones de parámetros con arquitectura de mezcla de expertos (MoE) y atención lineal esparsa. Esta versión concreta, publicada por el usuario pipenetwork, cuantiza los expertos enrutados a 4 bits y el resto de pesos (atención, expertos compartidos, capas densas, embeddings y lm_head) a 8 bits, logrando un tamaño en disco de 427,8 GB. El objetivo es permitir ejecutar un modelo de esta escala en hardware Apple Silicon con 512 GB de RAM unificada, algo inviable con los pesos originales en bfloat16.

El modelo base GLM-5.3 emplea una arquitectura `glm_moe_dsa` con 256 expertos y selección top-8, atención multi-cabezal latente (MLA) con atención esparsa estilo DeepSeek-V3.2, e incorpora una capa de predicción multi-token que no se incluye en esta conversión. La cuantización mixta 4/8 bits es una de las varias opciones publicadas por el mismo autor, que también ofrece versiones uniformes de 4 bits, 6 bits, 8 bits y mixtas 3/6 bits. Según las mediciones del autor, esta variante mixta 4/8 presenta una perplejidad en wikitext-2 de 2,7420, un 4,3 % mejor que la versión uniforme de 4 bits, con solo 9 GB adicionales de peso.

La relevancia de este modelo radica en que demuestra la viabilidad de ejecutar modelos de cientos de miles de millones de parámetros en hardware de consumo de gama alta (Mac Studio/Mac Pro con 512 GB), algo que hasta ahora requería clústeres de GPUs. Sin embargo, su uso práctico está restringido a entornos con esa cantidad de memoria y a la pila de software MLX, lo que limita su adopción generalizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con 256 expertos, top-8; MLA con atención esparsa estilo DeepSeek-V3.2) |
| Parametros totales | 118.704.915.456 (según safetensors; el modelo original tiene 744B, pero este checkpoint excluye la capa de multi-token-prediction y está cuantizado) |
| Parametros activos | No disponible (el modelo original usa top-8 de 256 expertos, pero no se especifica el número de activos) |
| Longitud de contexto | No especificada; el runtime del autor mantiene fidelidad hasta 2048 tokens (más allá, la selección de índices se degrada si no se usa el runtime incluido) |
| Tipos de cuantizacion | 4-bit para expertos enrutados (group 64), 8-bit para atención, expertos compartidos, capas densas 0-2, embeddings y lm_head (group 64); bf16/fp32 para indexador, router y normas |
| Idiomas soportados | No disponibles |
| Licencia | glm-5.3 (otra, con enlace LICENSE) |
| Formato de pesos | safetensors, MLX (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer MoE con 78 capas (aunque la capa 78, dedicada a predicción multi-token, no se incluye en esta conversión). Cada capa contiene 256 expertos enrutados (switch_mlp) con selección top-8, más expertos compartidos. La atención es de tipo MLA (Multi-head Latent Attention) con un mecanismo de atención esparsa controlado por un "lightning indexer" que selecciona las claves relevantes. El indexador solo tiene pesos en 21 de las 78 capas; las otras 57 reutilizan la selección de la capa anterior completa. El runtime incluido en este checkpoint implementa este comportamiento de forma fiel a la referencia, con puntuaciones del indexador en fp32 y logits del router también en fp32.

En cuanto al entrenamiento, no se proporcionan datos sobre el corpus, número de tokens o técnicas de alineación (RLHF/DPO). La model card solo indica que esta conversión se deriva de la versión bfloat16 del modelo (GLM-5.3-BF16), no de la versión FP8, porque esta última es una derivación con pérdida (los pesos FP8 dequantizados difieren de los bf16 hasta 1,6e-2 en valores de 0,46). La conversión a MLX y la cuantización se realizaron con herramientas propias del autor, disponibles en su repositorio GitHub.

## Capacidades

- Generación de texto y conversación: modelo de lenguaje puramente textual, capaz de mantener diálogos multi-turno y producir texto coherente en estilos variados.
- Razonamiento y conocimiento: al ser un modelo de 744B parámetros (aunque cuantizado), conserva una gran capacidad de razonamiento y conocimiento enciclopédico, aunque no se han publicado benchmarks específicos de tareas como MMLU o GSM8K.
- Atención a contexto largo: el runtime incluido mantiene fidelidad hasta 2048 tokens; más allá, la selección de índices puede degradarse si no se usa el runtime correcto, pero el modelo puede procesar secuencias más largas con posibles pérdidas de calidad.
- Sin capacidades multimodales: no se menciona soporte de visión, audio ni otras modalidades.
- Sin soporte explícito de tool calling o function calling: no se documenta en la model card.
- Sin modo de razonamiento especial (thinking mode): no se menciona.

## Casos de uso

- Investigación en generación de texto a gran escala: permite estudiar el comportamiento de un MoE de 744B en hardware Apple Silicon, sin necesidad de GPUs, para experimentos de perplejidad, análisis de capas o pruebas de prompting.
- Generación de contenido de alta calidad en entornos con memoria abundante: un Mac Studio con 512 GB puede ejecutar este modelo para redactar informes, artículos o documentación técnica con una calidad superior a modelos más pequeños.
- Evaluación de cuantización mixta: el autor proporciona scripts de evaluación (per-layer divergence, perplejidad) que permiten comparar el impacto de diferentes esquemas de cuantización en la calidad del modelo, útil para quienes investigan técnicas de compresión.
- Desarrollo de aplicaciones de chat o asistentes conversacionales en entornos de investigación: aunque no se documenta tool calling, el modelo puede mantener conversaciones largas y coherentes, adecuado para prototipos de asistentes en laboratorios con el hardware necesario.
- Análisis de atención esparsa y arquitecturas MoE: al ser una implementación de referencia del runtime `glm_moe_dsa`, sirve como base para estudiar el comportamiento del lightning indexer y la atención esparsa en la práctica.
- Pruebas de despliegue con MLX: para desarrolladores que quieran validar el ecosistema MLX con modelos de gran escala, este checkpoint es un caso extremo que pone a prueba la gestión de memoria y el rendimiento de la librería.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, el autor publica dos métricas propias: divergencia por capa respecto a bf16 y perplejidad en wikitext-2. Se presentan a continuación los datos disponibles.

**Perplejidad en wikitext-2 (test), 288.627 tokens en 141 ventanas de 2048:**

| Build | Tamaño | Perplejidad [95% CI] |
|---|---|---|
| 4bit uniforme | 418,6 GB | 2,8636 [2,6681, 3,0714] |
| mixed-4_8bit (este modelo) | 427,8 GB | 2,7420 [2,5533, 2,9477] |
| mixed-3_6bit | 332,6 GB | 3,0338 [2,8366, 3,2386] |

**Divergencia por capa vs bf16 (error L2 relativo, menor es mejor):**

| Receta | Teacher-forced (media por capa) | Free-running (capa final) | Coseno (final) |
|---|---|---|---|
| 8bit | 0,00685 | 0,13119 | 0,98945 |
| 6bit | 0,01465 | 0,16736 | 0,98389 |
| 5bit | 0,02651 | 0,22521 | 0,97272 |
| 4bit | 0,05161 | 0,35740 | 0,93390 |
| mixed-4_8bit | 0,02524 | 0,24951 | 0,96710 |
| mixed-3_6bit | 0,05242 | 0,42380 | 0,90624 |
| fp8 (release original) | 0,01741 | 0,17321 | 0,98320 |

El autor recomienda esta variante mixed-4_8bit para máquinas con 512 GB, ya que ofrece la mejor perplejidad entre las opciones que caben en esa memoria. La generación greedy (usada como detector de colapso) es coherente en todas las builds publicadas.

## Requisitos de hardware

- Memoria RAM: 512 GB recomendados (la model card indica "RAM: 512 GB, tight"). El checkpoint ocupa 427,8 GB en disco, por lo que se necesita al menos esa cantidad de memoria unificada para cargar los pesos.
- Hardware: exclusivamente Apple Silicon (Mac Studio, Mac Pro o MacBook Pro con configuración de memoria máxima). No es compatible con GPUs NVIDIA/AMD.
- GPU: no aplica; MLX utiliza la GPU integrada de Apple Silicon (GPU unificada).
- Opciones de despliegue: `mlx-lm` (pip install -U mlx-lm) con `mlx_lm.generate` y la bandera `--trust-remote-code` para cargar el runtime incluido. También se puede usar el repositorio GitHub del autor para integraciones personalizadas.
- Latencia y throughput: no se proporcionan mediciones. Dado el tamaño y la cuantización, se espera una generación lenta (probablemente del orden de varios segundos por token) incluso en el hardware más potente de Apple.
- Alternativas: para máquinas con menos memoria, el autor ofrece la versión mixed-3_6bit (332,6 GB) para la clase de 384 GB, y la uniforme 4-bit (418,6 GB) como respaldo.

## Comparativa con modelos similares

Este modelo se compara mejor con las otras variantes cuantizadas del mismo GLM-5.3 publicadas por el mismo autor, ya que no hay modelos de escala comparable disponibles para Apple Silicon.

| Modelo | Parámetros (original) | Tamaño en disco | Cuantización | Perplejidad wikitext-2 | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-MLX-mixed-4_8bit (este) | 744B | 427,8 GB | 4-bit expertos, 8-bit resto | 2,7420 | glm-5.3 |
| GLM-5.3-MLX-4bit | 744B | 418,6 GB | 4-bit uniforme | 2,8636 | glm-5.3 |
| GLM-5.3-MLX-mixed-3_6bit | 744B | 332,6 GB | 3-bit expertos, 6-bit resto | 3,0338 | glm-5.3 |
| GLM-5.3-BF16 (original) | 744B | ~1,5 TB (estimado) | bf16 | no disponible | glm-5.3 |
| GLM-5.3-FP8 (release oficial) | 744B | ~750 GB (estimado) | FP8 | no disponible | glm-5.3 |

No se dispone de comparativas con otros modelos MoE de similar escala (por ejemplo, DeepSeek-V3 o Qwen3-MoE) en el contexto de MLX, ya que no hay ports públicos comparables.

## Limitaciones y advertencias

- Requiere 512 GB de RAM: no es ejecutable en hardware de consumo estándar; solo en configuraciones Apple Silicon de gama máxima (Mac Studio/Mac Pro con 512 GB), que son extremadamente caras.
- La capa de predicción multi-token (capa 78) no está incluida: el modelo no puede realizar predicción multi-token, una capacidad del original.
- Degradación más allá de 2048 tokens: si se usa el runtime de `mlx-lm` estándar (sin el runtime incluido), los 57 indexadores sin pesos propios quedan con inicialización aleatoria, lo que afecta a la atención esparsa para secuencias más largas. El runtime incluido corrige esto, pero requiere `--trust-remote-code`.
- Licencia glm-5.3: es una licencia personalizada (no OSI-approved). Hay que revisar los términos del archivo LICENSE para uso comercial; no se garantiza permisividad.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K, etc., lo que dificulta comparar con otros modelos en tareas concretas.
- Riesgo de alucinación y sesgos: al ser un modelo de gran escala sin información sobre alineación, puede presentar alucinaciones y sesgos similares a otros modelos de su clase; no se han publicado evaluaciones de seguridad.
- Tamaño del repositorio: 427,8 GB, lo que implica costes de almacenamiento y descarga considerables.
- Dependencia de MLX: el modelo solo funciona con la pila MLX; no es compatible con transformers, vLLM, llama.cpp u otros runtimes estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/GLM-5.3-MLX-mixed-4_8bit
- Modelo base (zai-org/GLM-5.3): https://huggingface.co/zai-org/GLM-5.3
- Modelo base bf16 (zai-org/GLM-5.3-BF16): https://huggingface.co/zai-org/GLM-5.3-BF16
- Repositorio GitHub del runtime y herramientas: https://github.com/PipeNetwork/glm53-mlx
- Otras variantes del autor: https://huggingface.co/pipenetwork/GLM-5.3-MLX-4bit, https://huggingface.co/pipenetwork/GLM-5.3-MLX-mixed-3_6bit
- Perfil del autor en HuggingFace: https://huggingface.co/pipenetwork
