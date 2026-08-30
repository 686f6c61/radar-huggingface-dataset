# Jiunsong/SuperGLM-5.3-Flash-NVFP4-DGX-Spark

## Resumen

SuperGLM-5.3-Flash-NVFP4-DGX-Spark es un derivado del checkpoint cuantizado NVFP4 de GLM-5.3-Flash, desarrollado por Jiunsong, que modifica únicamente las proyecciones de salida de atención (`o_proj`) en 30 de las 45 capas del modelo, utilizando un donante independiente con ajuste "uncensored". El objetivo declarado es reducir los rechazos del modelo ante solicitudes consideradas dañinas, manteniendo intactos los tensores de expertos, routers y el resto de componentes. Está diseñado específicamente para ejecutarse en dos nodos NVIDIA DGX Spark (GB10) con el runtime SGLang incluido, y ofrece mediciones de rendimiento reales en esa topología.

El modelo base, GLM-5.3-Flash, es un modelo híbrido de 165 mil millones de parámetros con arquitectura MoE (mixture of experts), 45 capas que combinan 11 capas DSA (Dynamic Sparse Attention) y 34 capas KDA (Kernel-based Dynamic Attention), 288 expertos enrutados, 8 expertos activos por token y 4 flujos de memoria híbrida (mHC). La cuantización NVFP4 aplica 4 bits a los pesos de los expertos enrutados, mientras que atención, routing y cabezas permanecen en BF16. El contexto máximo declarado es de 1.048.576 tokens, aunque esta release solo reivindica una ventana operativa de 16.384 tokens.

La relevancia de este modelo radica en que ofrece una alternativa "desinhibida" del GLM-5.3-Flash con cuantización NVFP4, validada en hardware de consumo profesional (DGX Spark) y con soporte de decodificación especulativa mediante un compañero externo (DFlash2). Es una opción para entornos donde se requiera un modelo de gran tamaño con baja latencia y sin restricciones de contenido, aunque con importantes caveats de licencia y soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5NextForConditionalGeneration, híbrida: 45 capas (11 DSA + 34 KDA), MoE con 288 expertos enrutados, 8 expertos/token, 4 flujos mHC, RMSNorm, SiLU, 1 capa nativa de predicción de siguiente token (MTP) |
| Parametros totales | 165.496.249.182 (165B) |
| Parametros activos | no disponible (se activan 8 de 288 expertos por token, pero el número total de parámetros activos no se especifica) |
| Longitud de contexto | 1.048.576 tokens declarados en config; 16.384 tokens reivindicados para esta release |
| Tipos de cuantizacion | NVFP4 (grupo de 16 para pesos de expertos enrutados); atención, routing, expertos compartidos, visión, embeddings y cabezas en BF16 |
| Idiomas soportados | no disponibles (se mencionan comprobaciones en coreano, chino, japonés y francés, pero no hay lista oficial) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un derivado intervenido, no un entrenamiento desde cero. Se parte del checkpoint `LibertAIDAI/GLM-5.3-Flash-NVFP4` (pinned a un commit específico) y se sustituyen 30 tensores `model.language_model.layers.<n>.self_attn.o_proj.weight` (capas 15 a 44) por una mezcla (blend 0.5) con los tensores equivalentes del donante `dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4`. Los tensores no seleccionados se verifican byte a byte contra el base pristino. El modelo base, GLM-5.3-Flash, es un transformer híbrido con capas de atención dinámica (DSA) y kernel-based (KDA), diseñado para reducir el coste cuadrático de la atención en contextos largos. La capa MTP (multi-token prediction) nativa se conserva en el checkpoint, pero no es compatible con la topología de dos nodos GB10 TP2, por lo que no se reivindica su uso. El entrenamiento original del GLM-5.3-Flash no se detalla en la información disponible; solo se indica que el modelo base es de la familia GLM y que el donante ha sido sometido a un proceso de "uncensoring".

## Capacidades

- Generación de texto conversacional multilingüe: el modelo superó comprobaciones en coreano, chino, japonés y francés, además de inglés.
- Tool calling y function calling: validado en pruebas de tool calling y salida JSON estructurada estricta.
- Razonamiento multi-step: soporta modos de razonamiento bajo, alto y máximo (low/high/max reasoning), verificados en las pruebas de capacidad.
- Capacidades de visión: al ser `image-text-to-text`, puede procesar entradas de imagen y texto, aunque no se detallan tareas específicas de visión en la model card.
- Decodificación especulativa: compatible con DFlash2 (descargado por separado), que acelera la inferencia con block size 8.
- Ausencia de rechazos amplios: tras la intervención, el modelo pasó de 21 rechazos en 64 respuestas a 0 rechazos en 1684 respuestas (842 dañinas + 842 inofensivas), según la prueba de estrés documentada.
- Multi-modalidad: el pipeline `image-text-to-text` indica que puede recibir y generar tanto texto como imágenes, aunque no se especifican los detalles.

## Casos de uso

- Despliegue local en hardware DGX Spark: el modelo está optimizado para dos nodos GB10 con TP=2 y RoCE v2, lo que permite ejecutar un modelo de 165B en configuraciones on-premise sin necesidad de clústeres grandes. Es adecuado para entornos de investigación o empresas que ya posean este hardware.
- Asistentes conversacionales con tool calling: gracias a la validación en tool calling y JSON estructurado, puede integrarse en agentes que necesiten invocar APIs o ejecutar acciones externas, como en sistemas de automatización de tareas.
- Generación de código asistida: aunque no hay benchmarks específicos, el modelo base GLM-5.3-Flash es conocido por su rendimiento en código; esta versión mantiene las capacidades del base y añade menor censura, lo que puede ser útil en entornos de desarrollo donde se requiera explorar soluciones no convencionales.
- Análisis de documentos con imagen y texto: al ser multimodal, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con instrucciones de texto, por ejemplo para extraer información de tablas o gráficos.
- Investigación en seguridad y alineación: el modelo, al eliminar rechazos, puede utilizarse como banco de pruebas para estudiar comportamientos de modelos "uncensored" y comparar con versiones alineadas, siempre bajo entornos controlados.
- Inferencia de baja latencia en contexto largo moderado: con 16K tokens operativos y throughput de hasta 28 tok/s en modo especulativo, es viable para aplicaciones que requieran procesar documentos extensos o conversaciones multi-turno con historial amplio, como chatbots de atención al cliente en dominios técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye mediciones de rendimiento en hardware específico:

| Runtime | p256 decode (tok/s) | p256 TTFT (s) | p8192 decode (tok/s) | p8192 TTFT (s) | Prueba 16K |
|---|---:|---:|---:|---:|---|
| Autoregressive | 14.79 | 0.558 | 14.64 | 8.499 | pass |
| DFlash2 (especulativo) | 23.90 | 0.602 | 28.17 | 9.885 | pass |

Estas cifras se obtuvieron en dos nodos NVIDIA GB10 con TP=2 y enlace RoCE v2 directo. La prueba 16K se refiere a la ventana de contexto operativa de 16.384 tokens. No hay datos comparativos con otros modelos en las mismas condiciones.

## Requisitos de hardware

- Hardware mínimo: dos nodos NVIDIA DGX Spark (GB10), cada uno con 128 GB de memoria unificada, conectados mediante RoCE v2 directo (TP=2).
- VRAM estimada: no disponible con precisión; el tamaño del repositorio es de 194.7 GB (incluye pesos safetensors y otros archivos), y con cuantización NVFP4 se estima que los pesos del modelo ocupan aproximadamente 80-90 GB, por lo que cabe en la memoria combinada de los dos GB10 (256 GB).
- GPU recomendadas: NVIDIA DGX Spark (GB10) específicamente; no se indica compatibilidad con otras GPUs.
- Opciones de despliegue: SGLang con una imagen Docker específica (`superglm53-sglang:glm53-dflash2-gb10-mhcfix`); también se menciona vLLM como posible runtime, pero no se detalla.
- Latencia y throughput: los medidos en la tabla de benchmarks (autoregressive: ~15 tok/s; con DFlash2: ~24-28 tok/s según longitud de prompt). TTFT entre 0.56 y 9.9 segundos según el tamaño del prompt.
- Restricciones: el runtime requiere una configuración precisa (arrancar rank 1 antes que rank 0, desactivar CUDA graphs y autotuning de FlashInfer para el perfil DFlash2). No se recomienda usar más de una request concurrente sin validar el runtime.

## Comparativa con modelos similares

No se dispone de datos de rendimiento (benchmarks) de modelos comparables en las mismas condiciones de hardware. La comparativa se limita a aspectos estructurales y de licencia:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| SuperGLM-5.3-Flash-NVFP4-DGX-Spark | 165B | 1M declarado, 16K operativo | NVFP4 (expertos) + BF16 | MIT | Derivado intervenido, diseñado para 2×DGX Spark |
| GLM-5.3-Flash (base, sin cuantizar) | 165B | 1M | BF16 | MIT (según familia GLM) | Modelo original, sin intervenciones |
| GLM-5.3-Flash-DFlash2 (compañero especulativo) | no disponible | no disponible | NVFP4 | CC BY-NC-ND 4.0 | No incluido en este repo, requiere descarga separada |

No hay datos públicos de MMLU, HumanEval u otros benchmarks para este modelo ni para el base en la información proporcionada.

## Limitaciones y advertencias

- La intervención "uncensored" reduce drásticamente los rechazos, lo que puede generar contenido dañino, ilegal o éticamente problemático. No debe usarse en producción sin control de seguridad y moderación externa.
- El contexto operativo reivindicado es de 16.384 tokens, muy inferior al máximo declarado de 1.048.576. Usar más de 16K puede provocar fallos no documentados.
- El MTP nativo no es compatible con la topología de dos nodos GB10 TP2; usar el checkpoint con otras configuraciones puede requerir adaptaciones no probadas.
- El compañero especulativo DFlash2 tiene licencia CC BY-NC-ND 4.0, que restringe su uso comercial y su modificación. Debe descargarse por separado y revisarse su licencia antes de usarlo.
- El runtime requiere una imagen Docker específica y una configuración manual precisa (orden de arranque, variables de entorno). Cambiar cualquier parámetro puede degradar el rendimiento o causar errores.
- Se observaron anomalías de detokenización (caracteres U+FFFD) con dos requests concurrentes en modo híbrido KDA/Mamba; el perfil recomendado es de una sola request activa.
- No hay información sobre sesgos del modelo base ni sobre cómo la intervención afecta a la calidad general. La ausencia de benchmarks estándar impide evaluar su rendimiento comparativo.
- El modelo está diseñado exclusivamente para hardware DGX Spark; no se garantiza su funcionamiento en otras GPUs.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jiunsong/SuperGLM-5.3-Flash-NVFP4-DGX-Spark
- Perfil del autor (Jiunsong): https://huggingface.co/Jiunsong/models
- Guía de GLM-5.3-Flash en Unsloth (referencia general): https://unsloth.ai/docs/models/glm-5.3-flash
- Repo GitHub con despliegue similar en 2×DGX Spark: https://github.com/tonyd2wild/GLM-5.3-Flash-NVFP4-2x-DGX-Spark
- Repo GitHub de SGLang para GLM-5.3-Flash (SM121): https://github.com/0xSero/glm-5.3-flash-sglang-sm121
