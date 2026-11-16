# FlagRelease/Qwen3.8-27B-BF16-hygon-FlagOS

## Resumen

Qwen3.8-27B-BF16-hygon-FlagOS es una adaptación multi-chip del modelo vision-lenguaje Qwen3.8-27B de Alibaba, publicada por la comunidad Zhongzhi (众智) FlagOS a través de la plataforma FlagRelease. El repositorio contiene los pesos en BF16 del modelo original (27.781.427.952 parámetros, aproximadamente 27,8 mil millones) adaptados para ejecutarse sobre aceleradores Hygon mediante el stack de software FlagOS, que unifica las capas de modelo, sistema y chip bajo un paradigma "desarrolla una vez, ejecuta en cualquier sitio". La model card indica que la adaptación Day 0 cubre 11 chips de IA distintos, incluyendo T-Head, NVIDIA, Moore Threads, MetaX, Kunlunxin, Ascend, Hygon, Iluvatar CoreX, Tsingmicro, Enflame y Sunrise, con soporte FP8 en NVIDIA y Moore Threads y BF16 en el resto.

El modelo base Qwen3.8-27B es un modelo vision-lenguaje de Alibaba, lo que implica capacidades multimodales además de generación de texto. La relevancia de esta ficha concreta reside en su carácter de artefacto de despliegue: no se trata de un modelo nuevo entrenado desde cero, sino de una empaquetadura de pesos y scripts de inferencia preconfigurados (contenedor Docker FlagOS-Hygon, vLLM 0.20.0, FlagGems, FlagCX, FlagTree) orientados a ejecutar el modelo en hardware Hygon con precisión BF16 y paralelismo tensorial de 2. El contexto máximo configurado en los scripts de servicio es de 262.144 tokens (256k).

La licencia Apache 2.0 y el formato safetensors facilitan su uso comercial y su integración en pipelines existentes, aunque el valor práctico del repositorio está condicionado al hardware Hygon y al stack FlagOS. Los idiomas declarados son chino (zh) e inglés (en).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer vision-lenguaje (tag `qwen3_5`; detalles internos no disponibles) |
| Parámetros totales | 27.781.427.952 (≈27,8 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configuración `--max-model-len` en los scripts de servicio) |
| Tipos de cuantización | BF16 (pesos publicados); FP8 disponible en despliegues NVIDIA y Moore Threads según la model card; versión W4A8 para plataformas ARM edge |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B más allá de que se trata de un modelo vision-lenguaje (el tag de Hugging Face es `qwen3_5`) y de que el stack de servicio emplea `--reasoning-parser qwen3`, lo que sugiere un modo de razonamiento compatible con la familia Qwen3. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

La innovación técnica destacable de este repositorio no está en el entrenamiento sino en la capa de despliegue: FlagOS integra FlagScale (framework distribuido de entrenamiento e inferencia), FlagGems (biblioteca de operadores universales implementada en Triton), FlagCX (biblioteca de comunicación) y FlagTree (compilador unificado), permitiendo ejecutar el mismo modelo sobre aceleradores de distintos fabricantes. Los scripts publicados activan optimizaciones específicas para Hygon, como `VLLM_FL_HYGON_CUSTOM_AR=2`, `VLLM_FL_USE_FLASH_PREFILL_ONE_SEQ=1` y una lista blanca de operadores FlagGems (`VLLM_FL_FLAGOS_WHITELIST`), además de un umbral de sparsidad (`VLLM_SPARSE_THRESHOLD=0.01`).

## Capacidades

- Generación de texto en chino e inglés.
- Razonamiento: el servidor se arranca con `--reasoning-parser qwen3`, lo que habilita el parseo de trazas de razonamiento en las respuestas.
- Capacidades vision-lenguaje: el modelo base se describe como vision-lenguaje, por lo que se espera procesamiento de imágenes junto a texto (los detalles concretos de resolución, número de parches o encoder visual no están disponibles).
- Servicio compatible con la API OpenAI (`/v1/chat/completions`), lo que habilita integración con clientes estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo de razonamiento y el contexto de 256k son indicios favorables, pero no se confirma.
- Capacidades multilingües limitadas a zh y en según los metadatos.
- Despliegue multi-chip con variantes de precisión BF16, FP8 y W4A8 (esta última para ARM edge).

## Casos de uso

- Inferencia sobre aceleradores Hygon en entornos con restricciones de suministro de GPU NVIDIA: el repositorio proporciona un contenedor Docker y scripts listos para ejecutar el modelo en hardware Hygon con vLLM, eliminando el trabajo de portabilidad.
- Documentación técnica bilingüe chino-inglés: el modelo declara soporte para ambos idiomas y un contexto de 256k tokens, adecuado para resumir y responder preguntas sobre manuales extensos o bases de conocimiento internas.
- Análisis de documentos con imágenes: al ser un modelo vision-lenguaje, puede procesar capturas, diagramas o páginas escaneadas junto a instrucciones textuales en flujos de extracción de información.
- Razonamiento asistido en atención al cliente: el modo de razonamiento (`--reasoning-parser qwen3`) permite respuestas con trazas de razonamiento verificables en conversaciones multi-turno de hasta 256k tokens de contexto.
- Integración en asistentes corporativos vía AnythingLLM: la model card documenta explícitamente la integración con AnythingLLM, lo que facilita desplegar un asistente sobre documentación propia sin desarrollo adicional.
- Evaluación comparativa de stacks de aceleración: el repositorio incluye validación de consistencia frente al stack nativo NVIDIA, útil para equipos que necesitan medir la paridad funcional y de rendimiento de FlagOS antes de migrar cargas de trabajo.

## Benchmarks y rendimiento

Resultados publicados en la model card (comparación entre el stack nativo NVIDIA y el stack FlagOS sobre Hygon):

| Métrica | Qwen3.8-2.7B-Nvidia-Origin | Qwen3.8-27B-Hygon-FlagOS |
|---|---|---|
| musr_murder_mysteries | 76,8 | 78,31 |
| GPQA_Diamond | 90,4 | 90,91 |

Rendimiento de servicio:

| Escenario | 4k & 1k, 64 concurrentes |
|---|---|
| Speedup ratio (Hygon-FlagOS / NV-native) | 82,98 % |

Nota: la tabla de la model card etiqueta la primera columna como "Qwen3.8-2.7B", lo que introduce ambigüedad sobre si la comparación es entre modelos de distinto tamaño o un error de etiquetado; los datos se reproducen tal como aparecen. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 suman aproximadamente 55,6 GB (27,8 mil millones de parámetros × 2 bytes); con overhead de KV cache y activaciones para 262.144 tokens de contexto, se requiere un margen considerable adicional. Los scripts usan `--gpu-memory-utilization 0.925` y `--tensor-parallel-size 2`, lo que implica al menos 2 aceleradores Hygon.
- GPU recomendadas: aceleradores Hygon (el repositorio está específicamente adaptado a este fabricante); el stack FlagOS cubre además NVIDIA, Moore Threads, MetaX, Kunlunxin, Ascend, Iluvatar CoreX, Tsingmicro, Enflame, Sunrise y T-Head.
- GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090 u otras GPU consumer, y el tamaño en BF16 más el contexto de 256k hace improbable un despliegue en una sola GPU consumer.
- Opciones de despliegue: vLLM 0.20.0 dentro del contenedor FlagOS-Hygon (imagen `harbor.baai.ac.cn/flagrelease-public/qwen3.8-27b-hygon001-...`), con FlagGems, FlagCX y FlagTree; descarga de pesos vía ModelScope. No se documentan llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: único dato publicado, el ratio de speedup del 82,98 % frente al stack nativo NVIDIA en escenario 4k & 1k con 64 peticiones concurrentes; no se proporcionan latencias absolutas ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-BF16-hygon-FlagOS (este) | ≈27,8B | 262.144 tokens | Apache 2.0 | Hugging Face, ModelScope, contenedor FlagOS | Adaptación multi-chip para Hygon |
| Qwen3.8-27B (base, Alibaba) | ≈27,8B | no disponible en la información | Apache 2.0 (según este repo) | Repositorio oficial de Alibaba | Modelo original vision-lenguaje |
| Qwen3.8-2.7B (referencia de la model card) | ≈2,7B | no disponible | no disponible | no disponible | Citado como línea base NVIDIA en la tabla de benchmarks |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría (por ejemplo, otros modelos vision-lenguaje de ~27B); esta comparación no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse principalmente con datos en chino e inglés, es esperable un sesgo cultural y lingüístico hacia esos idiomas.
- Riesgo de alucinación: inherente a los modelos generativos; no se publican evaluaciones específicas de factualidad en este repositorio.
- Limitaciones de idioma: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original de Alibaba y de los componentes del stack FlagOS (FlagGems, FlagCX, FlagTree, FlagScale) por si difieren.
- Caveat de producción: el repositorio está optimizado para hardware Hygon; el rendimiento medido es un 82,98 % del stack nativo NVIDIA, por lo que migrar implica una pérdida de throughput de aproximadamente 17 puntos porcentuales en el escenario probado.
- El contexto de 262.144 tokens exige memoria KV considerable; en despliegues reales puede ser necesario reducir `--max-model-len`.
- Los scripts desactivan el prefix caching (`--no-enable-prefix-caching`), lo que penaliza cargas con prompts repetidos.
- La tabla de benchmarks etiqueta la línea base como "2.7B" frente a un modelo de 27B, lo que hace aconsejable tratar esos números con cautela hasta una verificación independiente.
- El número de descargas (15) y la ausencia de likes indican una adopción muy limitada; no hay evidencia de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Qwen3.8-27B-BF16-hygon-FlagOS
- FlagOS (stack de software): no disponible en la información proporcionada
- FlagGems (biblioteca de operadores): no disponible en la información proporcionada
- Triton (dependencia de FlagGems): https://github.com/openai/triton
- AnythingLLM (guía de integración): https://anythingllm.com/
- Contenedor FlagOS-Hygon: `harbor.baai.ac.cn/flagrelease-public/qwen3.8-27b-hygon001-gems5.0.2-tree0.6.1-cxnone-plugin0.1.1-vllm0.20.0-cp310-pt210-dtk2604-x64-6.3.30-v1.4.1a:202608131925`
- Modelo base Qwen3.8-27B de Alibaba: no disponible en la información proporcionada
- Papers, blogs y demos adicionales: no disponible en la información proporcionada
