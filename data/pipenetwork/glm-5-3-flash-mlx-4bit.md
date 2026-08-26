# pipenetwork/GLM-5.3-Flash-MLX-4bit

## Resumen

GLM-5.3-Flash-MLX-4bit es una conversión a MLX (Apple Silicon) y cuantización a 4-bit del modelo GLM-5.3-Flash de Z.ai, un modelo multimodal de tipo mixture-of-experts (MoE) con 320 mil millones de parámetros totales y 18 mil millones activos. El modelo original, lanzado por Z.ai, destaca por su arquitectura híbrida que combina atención lineal (Kimi-Delta) y atención sparse (DeepSeek NoPE MLA con lightning indexer), junto con hyper-connections con restricción de manifold, lo que permite manejar contextos de hasta 1 millón de tokens con costes de servicio reducidos.

Esta versión específica, publicada por el usuario pipenetwork, reduce el tamaño del modelo de 642,7 GB (bfloat16) a 177,6 GB en disco, manteniendo la arquitectura original salvo la capa de multi-token-prediction (MTP), que no se incluye. La cuantización es heterogénea: los expertos enrutados (97% de los parámetros) se cuantizan a 4-bit con grupo 64, el indexador a 8-bit, y algunos componentes (router, corrección de sesgo, arrays de hyper-connections) se mantienen en float32. La torre de visión se conserva en bfloat16.

La relevancia de este modelo radica en que permite ejecutar un modelo de 320B en hardware Apple Silicon con requisitos de memoria mucho menores, aunque con una degradación de calidad medible: la perplexity en wikitext-2 pasa de 3,4607 (versión 8-bit) a 3,7549 (versión 4-bit), un incremento del 8,5% en NLL por token. El runtime requiere un parche específico disponible en el repositorio de PipeNetwork, ya que mlx-vlm aún no ha incorporado oficialmente la arquitectura `glm5_next`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 34 capas de atención lineal Kimi-Delta + 11 capas de atención sparse DeepSeek (NoPE MLA + lightning indexer) con hyper-connections con restricción de manifold |
| Parametros totales | 320B (según modelo card; el archivo safetensors reporta 49.610.436.414, posiblemente solo una parte) |
| Parametros activos | 18B (MoE) |
| Longitud de contexto | 1.000.000 tokens (según vLLM recipes) |
| Tipos de cuantizacion | 4-bit grupo 64 (expertos enrutados, proyecciones KDA/MLA, MLP densos, embeddings, lm_head); 8-bit grupo 64 (indexador); float32 (router, corrección de sesgo, arrays mHC, parámetros KDA); bfloat16 (torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura de GLM-5.3-Flash es un híbrido innovador que combina 34 capas de atención lineal tipo Kimi-Delta con 11 capas de atención sparse tipo DeepSeek (NoPE MLA con lightning indexer). Las capas lineales reducen el coste computacional en contextos largos, mientras que las capas sparse permiten atender a ventanas muy amplias de forma eficiente. Las hyper-connections con restricción de manifold (mHC) mejoran el escalado del modelo, según la documentación de Z.ai. El modelo es multimodal, con una torre de visión de 0,56B parámetros que se mantiene en bfloat16 en esta conversión.

El entrenamiento del modelo base no se detalla en la información proporcionada, pero según la documentación de Z.ai, GLM-5.3 se construyó sobre la misma base que GLM-5.2, con mejoras centradas en post-training para programación compleja y tareas de agente de largo horizonte. La versión Flash es una variante optimizada para eficiencia en inferencia, con pesos nativos FP8 en el lanzamiento original. Esta conversión a MLX elimina la capa de multi-token-prediction (capa 45) y aplica cuantización heterogénea para reducir el tamaño de 642,7 GB a 177,6 GB.

## Capacidades

- Generación de texto y razonamiento: modelo de lenguaje de propósito general con capacidades avanzadas de razonamiento, especialmente en programación y tareas de agente.
- Multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`), con torre de visión en bfloat16.
- Contexto largo: ventana de 1M tokens, adecuada para documentos extensos, conversaciones multi-turno y análisis de repositorios completos.
- Capacidades de agente: según la documentación de Z.ai, GLM-5.3 destaca en tareas de agente de largo horizonte, como SWE-Bench Pro y Terminal-Bench 2.0.
- Tool calling / function calling: no se menciona explícitamente en la información, pero es esperable en un modelo de esta categoría; no confirmado.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios de código a gran escala: gracias a su contexto de 1M tokens, el modelo puede procesar repositorios completos para tareas de revisión, refactorización o generación de documentación, sin necesidad de dividir el código en fragmentos.
- Atención al cliente automatizada con historial extenso: la ventana de contexto permite mantener conversaciones de larga duración con usuarios, incluyendo el historial completo de interacciones y documentos adjuntos.
- Asistentes de programación en entornos Apple Silicon: desarrolladores que trabajan en Mac con chips M-series pueden ejecutar este modelo localmente para autocompletado, generación de tests o explicación de código, sin depender de servicios en la nube.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con texto, útil para extraer información de informes técnicos o manuales.
- Agentes autónomos para automatización de tareas: su capacidad para tareas de largo horizonte lo hace adecuado para agentes que interactúan con terminales, APIs o navegadores, ejecutando múltiples pasos de razonamiento.
- Investigación en eficiencia de modelos: la versión cuantizada permite estudiar el impacto de la cuantización 4-bit en un modelo MoE de 320B, comparando perplexity y calidad de generación frente a versiones de mayor precisión.

## Benchmarks y rendimiento

La model card proporciona resultados de perplexity en wikitext-2 (test) para distintas versiones cuantizadas, medidos con el runtime parcheado de PipeNetwork. Se comparan 288.627 tokens en 141 ventanas de 2048, con el mismo conjunto de ventanas para todas las versiones. La versión 8-bit se usa como ancla, ya que el modelo bfloat16 no cabe en una máquina de 512 GB.

| Build | Tamaño | Perplexity | ΔNLL/token vs 8-bit [95% CI] | Ventanas peores |
|---|---:|---:|---:|---:|
| 8-bit | 334,1 GB | 3,4607 | — | — |
| 6-bit | 255,9 GB | 3,4646 | +0,0011 [−0,0017, +0,0038] | 89/141 |
| mixed-4_8-bit | 181,9 GB | 3,5705 | +0,0312 [+0,0271, +0,0355] | 131/141 |
| 4-bit (este modelo) | 177,6 GB | 3,7549 | +0,0816 [+0,0755, +0,0879] | 140/141 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La generación greedy se describe como coherente en todas las versiones publicadas, aunque se advierte que es una prueba de colapso, no una evaluación de calidad.

## Requisitos de hardware

- Este modelo está diseñado exclusivamente para Apple Silicon (chips M-series) mediante MLX. No es compatible con CUDA/GPU NVIDIA.
- Requiere al menos 192 GB de RAM unificada para cargar los 177,6 GB del modelo en memoria, más overhead del runtime y activaciones. En la práctica, se recomienda una máquina con 256 GB o más.
- La versión 8-bit (334,1 GB) necesita al menos 384 GB de RAM unificada; la versión bfloat16 original (642,7 GB) no cabe en máquinas de 512 GB.
- El runtime recomendado es el repositorio `glm53-flash-mlx` de PipeNetwork, que corrige bugs numéricos en mlx-vlm. Se puede usar con `mlx-vlm` main, pero requiere parches.
- Para inferencia, se puede usar el script `smoke_generate.py` o la API de carga `load()` del paquete `glm53_flash_mlx`.
- No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

La comparativa más directa es con las otras versiones cuantizadas del mismo modelo base, publicadas por el mismo autor:

| Modelo | Tamaño | Perplexity (wikitext-2) | Precisión | Uso |
|---|---|---|---|---|
| GLM-5.3-Flash-MLX-8bit | 334,1 GB | 3,4607 | 8-bit | Referencia de calidad |
| GLM-5.3-Flash-MLX-6bit | 255,9 GB | 3,4646 | 6-bit | Equilibrio calidad/tamaño |
| GLM-5.3-Flash-MLX-mixed-4_8bit | 181,9 GB | 3,5705 | Mixto 4/8-bit | Mejor relación calidad/tamaño |
| GLM-5.3-Flash-MLX-4bit (este) | 177,6 GB | 3,7549 | 4-bit uniforme | Máxima reducción de tamaño |

Frente al modelo original de Z.ai (bfloat16, 642,7 GB), esta versión 4-bit reduce el tamaño un 72% pero incrementa la perplexity en aproximadamente un 8,5% respecto a la versión 8-bit. No se dispone de comparativas con otros modelos MoE de tamaño similar (por ejemplo, DeepSeek-V3 o Qwen-MoE) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización 4-bit uniforme degrada notablemente la calidad: la perplexity es un 8,5% peor que la versión 8-bit, y pierde en 140 de 141 ventanas evaluadas. Para tareas que requieran alta fidelidad, se recomienda la versión mixed-4_8-bit o 6-bit.
- No se incluye la capa de multi-token-prediction (MTP), lo que puede afectar a la velocidad de generación y a la calidad en tareas de razonamiento que se benefician de esta técnica.
- El runtime requiere un parche específico (repositorio `glm53-flash-mlx`) que corrige dos bugs numéricos y dos discrepancias de epsilon en mlx-vlm. Sin este parche, la generación puede ser incorrecta.
- Solo es compatible con Apple Silicon; no hay soporte para CUDA u otras plataformas.
- El modelo es multimodal, pero la torre de visión se mantiene en bfloat16, lo que puede aumentar ligeramente el uso de memoria en tareas con imágenes.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas en la documentación proporcionada.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base y su documentación deben atribuirse correctamente a Z.ai.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-4bit
- Repositorio de código (runtime parcheado): https://github.com/PipeNetwork/glm53-flash-mlx
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Documentación de Z.ai sobre GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Repositorio oficial de GLM-5 en GitHub: https://github.com/zai-org/GLM-5
- Guía de unsloth para GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3
- Artículo de openlm.ai sobre GLM-5.3: https://openlm.ai/glm-5.3/
- Receta de vLLM para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
