# FlagRelease/Hy4-preview-INT8-metax-FlagOS

## Resumen

Hy4-preview es un modelo de lenguaje de gran escala de nueva generación con arquitectura MoE (Mixture of Experts), desarrollado por el equipo Tencent Hunyuan. Esta versión concreta, publicada por FlagRelease, corresponde al modelo original cuantizado a INT8 mediante `compressed-tensors` y empaquetado con el stack de software FlagOS para su despliegue optimizado sobre aceleradores MetaX. El modelo cuenta con aproximadamente 770.000 millones de parámetros totales, de los cuales 49.000 millones se activan por token, lo que lo sitúa en la categoría de los MoE más grandes disponibles públicamente bajo licencia Apache 2.0.

La relevancia de esta release radica en su enfoque de despliegue integrado: FlagOS proporciona una imagen de contenedor preconfigurada que unifica las capas de modelo, sistema y chip, permitiendo ejecutar el modelo sobre hardware MetaX (GPU chinas) sin modificaciones manuales del stack de inferencia. El repositorio incluye scripts de arranque listos para usar, configuración de Ray para computación distribuida y compatibilidad con vLLM 0.24.0. Los resultados de benchmark publicados para la versión original en Nvidia muestran un rendimiento destacado en razonamiento científico, con una puntuación de 90,91 en GPQA_Diamond.

El modelo soporta chino e inglés, incluye un modo de razonamiento explícito (`enable_thinking`) y está diseñado para tareas de razonamiento complejo, generación de código y diálogo multilingüe. La ventana de contexto configurada en el despliegue alcanza los 32.768 tokens. Esta ficha se basa exclusivamente en la información publicada en la model card de HuggingFace y en el repositorio oficial de Tencent Hunyuan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), 78 capas: primera capa con FFN densa, 77 capas MoE con 256 expertos enrutados y 1 experto compartido por capa |
| Parametros totales | 779.960.992.733 (~780B) según safetensors; 770B según la documentacion oficial de Tencent |
| Parametros activos | 49B por token |
| Longitud de contexto | 32.768 tokens (configurado via `--max-model-len` en vLLM; tambien se documenta 8.192 en la configuracion alternativa) |
| Tipos de cuantizacion | INT8 (8-bit) mediante `compressed-tensors` |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, cuantizacion INT8 con compressed-tensors |

## Arquitectura y entrenamiento

La arquitectura de Hy4-preview es un transformer MoE de 78 capas. La primera capa utiliza una FFN densa convencional, mientras que las 77 capas restantes sustituyen la FFN por un bloque MoE con 256 expertos enrutados y un experto compartido adicional por capa. Cada token activa 49.000 millones de parámetros de un total de 770.000 millones, lo que permite un equilibrio entre capacidad del modelo y coste computacional por inferencia. No se han publicado detalles sobre la composición del dataset de entrenamiento, el número total de tokens utilizados ni el proceso de alineación (RLHF, DPO u otros) en la información disponible.

La release específica de FlagRelease aplica una cuantizacion INT8 sobre los pesos originales del modelo, reduciendo el footprint de memoria de aproximadamente 1,5 TB en bf16 a unos 790 GB en INT8. El despliegue se realiza a traves de vLLM 0.24.0 con el plugin FlagOS (`VLLM_PLUGINS=fl`), que incluye una lista negra de operaciones para optimizar la ejecucion sobre hardware MetaX. La configuracion de inferencia utiliza `--dtype bfloat16` para el computo, lo que sugiere que los pesos INT8 se descomprimen o se procesan con precision mixta durante la ejecucion. No se dispone de informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento complejo en chino e ingles, con soporte bilingue integrado.
- Modo de razonamiento explicito (thinking mode) activable mediante `enable_thinking` en los parametros del chat template, que permite al modelo generar cadenas de razonamiento internas antes de responder.
- Razonamiento cientifico de alto nivel: 90,91 en GPQA_Diamond, lo que indica capacidad para resolver problemas de nivel graduate en fisica, quimica y biologia.
- Razonamiento multi-paso: 82,8 en MUSR (Multi-step Soft Reasoning), que evalua la capacidad de seguir instrucciones complejas con multiples pasos de razonamiento.
- Despliegue en entornos de produccion con vLLM, compatible con el protocolo OpenAI (`/v1/chat/completions`).
- Capacidades de agente limitadas al stack de despliegue: el modelo se sirve a traves de la API de chat de vLLM y puede integrarse con herramientas externas como AnythingLLM, aunque no se documenta soporte nativo de tool calling en la informacion disponible.
- Integracion con el ecosistema FlagOS para ejecucion sobre aceleradores MetaX, con soporte de paralelismo tensorial (TP=8) y de pipeline (PP=4) mediante Ray.

## Casos de uso

- Investigacion cientifica asistida: el modelo puede resolver problemas de nivel graduate en fisica, quimica y biologia (GPQA_Diamond 90,91), lo que lo hace adecuado como asistente para investigadores que necesitan ayuda con razonamiento cientifico complejo, revision de literatura y formulacion de hipotesis.
- Asistente de razonamiento para analisis financiero y legal: con su puntuacion de 82,8 en MUSR, el modelo puede seguir cadenas de razonamiento multi-paso, util para analisis de casos legales, evaluacion de riesgos financieros o auditoria de documentos extensos.
- Sistema de dialogo bilingue chino-ingles en produccion: al desplegarse con vLLM y exponer una API compatible con OpenAI, puede integrarse directamente en aplicaciones de atencion al cliente, soporte tecnico o asistentes virtuales que requieran alternar entre ambos idiomas.
- Procesamiento de documentos largos: con una ventana de contexto de 32.768 tokens, el modelo puede procesar informes tecnicos, articulos cientificos o contratos completos en una sola pasada, extrayendo informacion y generando resumenes estructurados.
- Generacion de codigo y desarrollo de software: aunque no se publican benchmarks especificos de codigo, la arquitectura de 49B parametros activos y el alto rendimiento en razonamiento lo hacen adecuado para tareas de programacion asistida, revision de codigo y generacion de tests.
- Investigacion academica en IA: al ser un modelo abierto con licencia Apache 2.0 y pesos publicados en INT8, puede utilizarse como base para estudios sobre cuantizacion, eficiencia de inferencia en hardware alternativo y comparativas de rendimiento entre stacks de software (Nvidia vs MetaX).
- Despliegue en entornos con hardware chino: organizaciones que operan con aceleradores MetaX pueden utilizar esta release para ejecutar un modelo de 770B sin necesidad de adaptar manualmente el stack de software, gracias a la imagen de contenedor FlagOS preconfigurada.

## Benchmarks y rendimiento

La model card publica los siguientes resultados para la version original del modelo ejecutada sobre Nvidia (Hy4-preview-Nvidia-Origin). La version MetaX-FlagOS aparece marcada como "Evaluating" (en evaluacion) y no se han publicado resultados finales.

| Metrica | Hy4-preview Nvidia-origin | Hy4-preview MetaX-FlagOS |
|---|---|---|
| GPQA_Diamond | 90,91 | En evaluacion |
| MUSR (team) | 82,8 | En evaluacion |

No se han publicado resultados adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. GPQA_Diamond mide el rendimiento en preguntas de nivel graduate en ciencias; MUSR evalua el razonamiento multi-paso con instrucciones complejas. Ambos resultados indican un rendimiento muy alto en tareas de razonamiento, pero no se dispone de comparativas directas con otros modelos en la documentacion publicada.

## Requisitos de hardware

- El despliegue documentado requiere un cluster de 32 dispositivos MetaX (TP=8, PP=4) con Ray como backend distribuido.
- La imagen de contenedor FlagOS requiere Docker 29.3.1 o superior, sistema operativo Ubuntu 22.04 LTS y acceso a los dispositivos `/dev/mxcd` (MetaX) y `/dev/dri`.
- El modelo cuantizado INT8 ocupa aproximadamente 790 GB en disco, por lo que la VRAM agregada del cluster debe superar ampliamente este valor para alojar pesos, activaciones y KV cache. Con `--gpu-memory-utilization 0.9`, se requiere al menos 880 GB de VRAM total distribuida.
- Memoria compartida del contenedor: se recomienda `--shm-size 64g` para el almacenamiento temporal de activaciones y buffers intermedios.
- El stack de inferencia utiliza vLLM 0.24.0 con Python 3.12, PyTorch 2.8 y MACA 3.7 (MetaX Compute Architecture).
- No se contempla ejecucion en GPU de consumo (RTX 4090, etc.) dado el tamano del modelo y la dependencia de hardware MetaX.
- Opciones de despliegue: la unica via documentada es la imagen de contenedor FlagOS con vLLM; no se mencionan alternativas como llama.cpp, Ollama o TGI.
- No se publican datos de latencia ni throughput en la informacion disponible. La configuracion `--max-num-seqs 4` sugiere un throughput relativamente bajo por request, orientado a latencia minima en lugar de alto rendimiento agregado.

## Comparativa con modelos similares

La comparativa mas directa es entre esta release (MetaX-FlagOS) y la version original del mismo modelo ejecutada sobre Nvidia, ya que comparten arquitectura y pesos:

| Caracteristica | Hy4-preview (Nvidia-origin) | Hy4-preview (MetaX-FlagOS, esta release) |
|---|---|---|
| Arquitectura | MoE 770B / 49B activos | MoE 770B / 49B activos |
| Cuantizacion | No especificada (presumiblemente bf16) | INT8 (compressed-tensors) |
| Stack de inferencia | Stack nativo Nvidia | FlagOS + vLLM sobre MetaX |
| GPQA_Diamond | 90,91 | En evaluacion |
| MUSR | 82,8 | En evaluacion |
| Licencia | Apache 2.0 | Apache 2.0 |

En cuanto a otros modelos MoE de escala similar, no se dispone de datos de benchmark comparables en la informacion proporcionada. Se puede situar como referencia que DeepSeek-V3 (671B totales, 37B activos, licencia MIT) es el competidor mas directo en terminos de escala y arquitectura, pero no se dispone de resultados comparativos publicados en esta documentacion para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo solo soporta chino e ingles; no se documenta capacidad para otros idiomas.
- La version MetaX-FlagOS se encuentra en fase de evaluacion: los benchmarks de la version sobre MetaX estan marcados como "Evaluating" y no se ha confirmado que el rendimiento sea identico al de la version Nvidia.
- La cuantizacion INT8 puede introducir degradacion de precision en tareas de razonamiento numerico o logico en comparacion con los pesos en bf16, aunque no se publican datos que cuantifiquen esta perdida.
- El despliegue esta fuertemente acoplado al stack FlagOS y al hardware MetaX: no se proporcionan instrucciones para ejecutar esta release especifica en GPU Nvidia o AMD, y la lista negra de operaciones (`VLLM_FL_FLAGOS_BLACKLIST`) sugiere que ciertas operaciones se ejecutan en modo de referencia (torch) con posible impacto en rendimiento.
- La ventana de contexto de 32.768 tokens es notablemente inferior a la de otros modelos MoE de la misma generacion, que alcanzan 128K o 256K tokens.
- No se documenta soporte de tool calling, function calling ni integracion con agentes autonomos de forma nativa; el modelo se sirve como API de chat estandar.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es una release muy reciente con escasa validacion por parte de la comunidad.
- No se dispone de informacion sobre el dataset de entrenamiento, el proceso de alineacion ni las politicas de moderacion de contenido, lo que dificulta evaluar sesgos potenciales o riesgos de generacion de contenido inapropiado.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue requiere hardware MetaX especifico, lo que puede limitar la portabilidad a otros entornos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FlagRelease/Hy4-preview-INT8-metax-FlagOS
- Repositorio oficial de Tencent Hunyuan: https://github.com/Tencent-Hunyuan/Hy4-preview
- Organizacion FlagRelease en HuggingFace: https://huggingface.co/FlagRelease
- Repositorio FlagRelease en GitHub: https://github.com/flagos-ai/FlagRelease
- Documentacion de FlagRelease: https://docs.flagos.io/projects/FlagRelease/en/latest/index.html
- Release anterior del mismo stack (Hy3-metax-FlagOS): https://huggingface.co/FlagRelease/Hy3-metax-FlagOS
- Sitio oficial de AnythingLLM (integracion documentada): https://anythingllm.com/
