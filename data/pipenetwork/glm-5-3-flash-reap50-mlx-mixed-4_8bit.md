# pipenetwork/GLM-5.3-Flash-REAP50-MLX-mixed-4_8bit

## Resumen

GLM-5.3-Flash-REAP50-MLX-mixed-4_8bit es una conversión a MLX (Apple Silicon) del modelo GLM-5.3-Flash de zai-org, cuantizada de forma mixta (4 bits para expertos, 8 bits para el resto) y sometida a una poda REAP50 que elimina la mitad de los expertos enrutados. El resultado es un checkpoint de 96,3 GB que cabe en equipos con 128 GB de RAM unificada, frente a los 642,7 GB del original en bfloat16. Está pensado para ejecutarse en Macs con Apple Silicon mediante la librería MLX, y mantiene la arquitectura híbrida del modelo base: 34 capas de atención lineal tipo Kimi-Delta y 11 capas de atención dispersa tipo DeepSeek (MLA sin PE + lightning indexer), con hyper-conexiones restringidas por manifold. Es un modelo multimodal (imagen-texto) y conversacional, con licencia MIT.

La poda REAP50 conserva 144 de los 288 expertos por capa MoE, seleccionados por saliencia media sobre 65 536 tokens de calibración. Esto reduce el tamaño a menos de un tercio del original, pero degrada la perplejidad: pasa de 3,4607 (versión 8-bit) a 6,0757 en wikitext-2. Aun así, el autor proporciona un runtime corregido en GitHub que garantiza paridad numérica con transformers 5.16, y la conversión mantiene la arquitectura intacta salvo la capa de predicción multi-token (no incluida). Es una opción viable para quienes necesitan ejecutar un modelo de 320B-A18B en hardware de consumo, asumiendo una pérdida de calidad notable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido MoE: 34 capas Kimi-Delta linear-attention + 11 capas DeepSeek-sparse-attention (NoPE MLA + lightning indexer), con hyper-conexiones con restricción de manifold |
| Parametros totales | 26.897.684.382 (checkpoint cuantizado; el modelo base declara 320B-A18B) |
| Parametros activos | 18B (según modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (expertos enrutados, grupo 64), 8-bit (proyecciones KDA/MLA, expertos compartidos, MLPs densas, embeddings, lm_head, indexer), bfloat16 (torre de visión) |
| Idiomas soportados | no disponible (el modelo base es multilingüe; la calibración usó diez idiomas de Wikipedia) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE de 320B parámetros totales y 18B activos, con una arquitectura híbrida que combina atención lineal (Kimi-Delta) y atención dispersa (DeepSeek MLA con NoPE y lightning indexer). Las hyper-conexiones están restringidas por manifold, lo que estabiliza el entrenamiento de capas profundas. Este checkpoint concreto no incluye la capa de predicción multi-token (layer 45) y mantiene la torre de visión en bfloat16.

La conversión a MLX se realizó a partir del release bfloat16, y la cuantización aplica 4 bits a los expertos enrutados (que suponen el 97% de los parámetros) y 8 bits al resto. La poda REAP50 seleccionó 144 de los 288 expertos por capa, usando como saliencia la media de `router_weight × ‖expert_output‖` sobre 65 536 tokens de calibración (wikitext-2 train, diez idiomas de Wikipedia y código). Los expertos conservados retienen el 67,2% de la masa de saliencia, y dos mitades disjuntas del conjunto de calibración coinciden en el 86,6% de los expertos elegidos. No se dispone de información sobre el entrenamiento original del modelo base (datos, tokens, RLHF/DPO).

## Capacidades

- Generación de texto multimodal: acepta entradas de imagen y texto, y produce texto (pipeline image-text-to-text).
- Razonamiento y conversación: al ser un modelo GLM, está orientado a diálogo y tareas de razonamiento, aunque no se detallan capacidades específicas en la documentación.
- Atención lineal y dispersa: la combinación de Kimi-Delta y DeepSeek MLA permite manejar secuencias largas con menor coste computacional que atención densa, aunque la longitud de contexto no está documentada.
- Ejecución en Apple Silicon: gracias a la conversión MLX, puede ejecutarse en Macs con Metal, con soporte de cuantización mixta.
- Poda REAP: la poda por saliencia reduce el tamaño sin cambiar la arquitectura, permitiendo ejecutar el modelo en hardware con menos memoria.
- Compatibilidad con runtime corregido: el autor proporciona un runtime en GitHub que corrige bugs numéricos del port de mlx-vlm, garantizando paridad 1e-6 con transformers.

## Casos de uso

- Análisis de imágenes en entornos Apple: el modelo puede procesar imágenes y generar descripciones o responder preguntas sobre ellas, aprovechando la torre de visión en bfloat16 y la ejecución local en Macs con MLX.
- Asistente conversacional local: al ser un modelo de 18B activos, puede mantener conversaciones multi-turno con razonamiento, sin depender de APIs externas, en equipos con suficiente RAM unificada.
- Prototipado de aplicaciones multimodales: desarrolladores que necesitan probar capacidades de visión-lenguaje en hardware de consumo pueden usar este checkpoint para validar ideas antes de escalar a modelos mayores.
- Investigación sobre poda y cuantización: el checkpoint sirve como referencia para estudiar el impacto de la poda REAP50 en la calidad del modelo, comparando con las versiones sin podar o con poda más ligera.
- Generación de código y texto técnico: aunque no hay benchmarks específicos, el modelo base GLM-5.3-Flash está diseñado para tareas de código y razonamiento; esta versión cuantizada puede usarse para generación asistida en entornos sin GPU dedicada.
- Despliegue en entornos con restricciones de memoria: con 96,3 GB, cabe en Macs de 128 GB, permitiendo ejecutar un modelo de 320B-A18B en un solo equipo, algo inviable con el checkpoint bfloat16 de 642,7 GB.

## Benchmarks y rendimiento

La model card reporta perplejidad en wikitext-2 (test) sobre 288 627 tokens en 141 ventanas de 2048, comparando varias versiones cuantizadas y podadas. El anchor es la versión 8-bit (334,1 GB), que se considera estadísticamente indistinguible del bfloat16.

| Build | Tamaño | Perplejidad | ΔNLL/token vs 8-bit [95% CI] | Ventanas peores |
|---|---:|---:|---|---:|
| 8-bit | 334,1 GB | 3,4607 | — | — |
| 6-bit | 255,9 GB | 3,4646 | +0,0011 [−0,0017, +0,0038] | 89/141 |
| mixed-4_8bit | 181,9 GB | 3,5705 | +0,0312 [+0,0271, +0,0355] | 131/141 |
| 4-bit | 177,6 GB | 3,7549 | +0,0816 [+0,0755, +0,0879] | 140/141 |
| REAP25-mixed-4_8bit | 139,1 GB | 4,2249 | +0,1995 [+0,1657, +0,2377] | 139/141 |
| REAP37-mixed-4_8bit | 118,3 GB | 4,8752 | +0,3427 [+0,2968, +0,3929] | 141/141 |
| **REAP50-mixed-4_8bit** | **96,3 GB** | **6,0757** | **+0,5628 [+0,5071, +0,6219]** | **141/141** |
| REAP25-4bit | — | 4,4361 | +0,2483 [+0,2135, +0,2873] | 141/141 |
| REAP37-4bit | — | 5,1057 | +0,3889 [+0,3424, +0,4393] | 141/141 |
| REAP50-4bit | — | 6,3840 | +0,6123 [+0,5552, +0,6722] | 141/141 |

La poda REAP50 degrada la perplejidad un 75% respecto al anchor 8-bit, y pierde todas las ventanas. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- RAM unificada: el checkpoint ocupa 96,3 GB en disco, por lo que se necesita un Mac con al menos 128 GB de RAM unificada para cargarlo y ejecutarlo con holgura.
- GPU: no requiere GPU discreta; usa la GPU integrada de Apple Silicon vía Metal y MLX. Modelos recomendados: Mac Studio o MacBook Pro con chips M2 Ultra, M3 Ultra o superiores, con 128 GB o más.
- Almacenamiento: 96,3 GB libres para el checkpoint, más espacio para el runtime y dependencias.
- Runtime: se requiere el runtime corregido de https://github.com/PipeNetwork/glm53-flash-mlx, ya que mlx-vlm `main` aún no incluye el soporte `glm5_next` con las correcciones necesarias.
- Opciones de despliegue: MLX (inferencia local en Apple Silicon). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La generación greedy se describe como "coherente" en la model card, pero no se dan cifras.

## Comparativa con modelos similares

La comparativa más directa es con las otras versiones del mismo modelo publicadas por el mismo autor, que difieren en cuantización y nivel de poda.

| Modelo | Tamaño | Perplejidad (wikitext-2) | Cuantización | Poda |
|---|---|---:|---|---|
| GLM-5.3-Flash-MLX-8bit | 334,1 GB | 3,4607 | 8-bit | Ninguna |
| GLM-5.3-Flash-MLX-6bit | 255,9 GB | 3,4646 | 6-bit | Ninguna |
| GLM-5.3-Flash-MLX-mixed-4_8bit | 181,9 GB | 3,5705 | 4/8-bit mixta | Ninguna |
| GLM-5.3-Flash-REAP25-MLX-mixed-4_8bit | 139,1 GB | 4,2249 | 4/8-bit mixta | 25% expertos |
| GLM-5.3-Flash-REAP37-MLX-mixed-4_8bit | 118,3 GB | 4,8752 | 4/8-bit mixta | 37% expertos |
| **GLM-5.3-Flash-REAP50-MLX-mixed-4_8bit** | **96,3 GB** | **6,0757** | **4/8-bit mixta** | **50% expertos** |

No se dispone de comparativas con otros modelos MoE de tamaño similar (p. ej., Mixtral, Qwen MoE) en la información proporcionada.

## Limitaciones y advertencias

- La poda REAP50 reduce drásticamente la calidad: la perplejidad en wikitext-2 sube de 3,46 a 6,08, y pierde todas las ventanas evaluadas frente al anchor 8-bit. No es recomendable para tareas que requieran alta fidelidad lingüística.
- La capa de predicción multi-token (layer 45) no está incluida, por lo que el modelo no aprovecha esa capacidad del original.
- El runtime de mlx-vlm `main` tiene bugs numéricos que afectan a la fórmula de los MLPs y a las hyper-conexiones; es imprescindible usar el runtime corregido de PipeNetwork para obtener resultados correctos.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar su uso en tareas de ventana larga.
- La cuantización mixta (4-bit en expertos) puede introducir errores adicionales en tareas de precisión, aunque el autor reporta que la versión 8-bit es indistinguible del bfloat16.
- Al ser un modelo multimodal, la torre de visión se mantiene en bfloat16, lo que aumenta el uso de memoria en tareas con imágenes.
- No hay información sobre sesgos, alucinaciones o restricciones de uso comercial más allá de la licencia MIT, que permite uso comercial sin restricciones conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP50-MLX-mixed-4_8bit
- Modelo base (zai-org/GLM-5.3-Flash): https://huggingface.co/zai-org/GLM-5.3-Flash
- Modelo base bfloat16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Runtime corregido (GitHub): https://github.com/PipeNetwork/glm53-flash-mlx
- Releases del runtime: https://github.com/PipeNetwork/glm53-flash-mlx/releases
- Versión 8-bit del mismo autor: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-8bit
- Versión 6-bit: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-6bit
- Versión mixed-4_8bit sin poda: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-mixed-4_8bit
- Versión 4-bit uniforme: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-4bit
- Versión REAP25-mixed-4_8bit: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP25-MLX-mixed-4_8bit
- Versión REAP37-mixed-4_8bit: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP37-MLX-mixed-4_8bit
- Versión REAP25-4bit: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP25-MLX-4bit
- Versión REAP37-4bit: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP37-MLX-4bit
- Versión REAP50-4bit: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP50-MLX-4bit
- Perfil de PipeNetwork en GitHub: https://github.com/PipeNetwork
