# 2wild4tv/GLM-5.3-Int4-Int8Mix

## Resumen

El modelo `2wild4tv/GLM-5.3-Int4-Int8Mix` es una cuantización de precisión mixta Int4/Int8 del modelo GLM-5.3 de Z.ai, creada por el desarrollador Tony DeAngelo (2wild4tv). GLM-5.3 es el modelo insignia de Z.ai, con 743 mil millones de parámetros totales y aproximadamente 40 mil millones activos en su arquitectura de mezcla de expertos (MoE), 78 capas y una ventana de contexto de 1 millón de tokens. Esta cuantización utiliza el formato `compressed-tensors` y está diseñada específicamente para servirse con vLLM en un clúster de cuatro nodos NVIDIA DGX Spark (GB10).

El problema que resuelve es práctico: las cuantizaciones NVFP4 existentes del GLM-5.3 completo ocupan unos 465 GB porque mantienen toda la pila de atención en bf16, lo que deja solo unos 12 GB por nodo para la caché KV y provoca desbordamientos de memoria bajo tráfico real. Al convertir la atención a Int8, este modelo reduce el peso total a aproximadamente 378 GB, dejando unos 33 GB por nodo para la caché KV, lo que permite servir el modelo de forma estable en cuatro DGX Spark. Es, según su autor, el primer cuantizado del GLM-5.3 grande que funciona realmente en esa configuración de hardware.

La relevancia actual radica en que GLM-5.3 es considerado el modelo abierto más potente en tareas de razonamiento, código y agentes (SOTA en Terminal Bench 3.0 y Agents' Last Exam), y esta cuantización permite ejecutarlo en hardware relativamente accesible sin depender de la nube. La receta de cuantización sigue el enfoque de QuantTrio, que ya aplicó un esquema similar al GLM-5.2, y preserva en precisión completa los componentes críticos para el enrutamiento MoE y la selección de atención dispersa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm5_next), 78 capas |
| Parametros totales | 743B (modelo base) |
| Parametros activos | ~40B (MoE) |
| Longitud de contexto | 1M (modelo base); 131072 por defecto en serving, hasta ~600K con Decode Context Parallel |
| Tipos de cuantizacion | Int4 (W4A16) en expertos MoE, Int8 (W8A16) en capas densas y atención, precisión completa en router, indexer y cabeza LM |
| Idiomas soportados | no disponible |
| Licencia | GLM-5.3 (otra, ver enlace) |
| Formato de pesos | compressed-tensors (safetensors) |

## Arquitectura y entrenamiento

Este modelo no es un entrenamiento nuevo, sino una cuantización del modelo base `zai-org/GLM-5.3`. La receta, inspirada en el trabajo de QuantTrio para GLM-5.2, es estática, simétrica, solo de pesos, con tamaño de grupo 128 y sin datos de calibración (data-free). El mapa de capas es el siguiente: los expertos MoE (capas 3-77) se cuantizan a W4A16, las capas densas y de atención (capas 1-77) a W8A16, el bloque MTP (capa 78) a W8A16 canal-wise, y se mantienen en precisión completa la capa 0, todos los `mlp.gate` (routers MoE), `self_attn.indexer` e `indexers_proj` (selector de atención dispersa), las normalizaciones del MTP y la cabeza LM (`shared_head.norm` y `shared_head.head`). Esta selección protege los componentes que más influyen en la calidad del enrutamiento y la generación.

El modelo base GLM-5.3 utiliza la misma base que GLM-5.2, con todas las mejoras provenientes del post-entrenamiento, según el blog oficial de Z.ai. No se especifican los detalles del post-entrenamiento (si incluyó RLHF, DPO u otras técnicas), pero se destaca una mejora del 50% en el benchmark interno Z.ai Code Bench respecto a GLM-5.2. La innovación principal de esta cuantización es la reducción del footprint al pasar la atención de bf16 a Int8, lo que permite un despliegue viable en cuatro DGX Spark con caché KV real.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base GLM-5.3, que es el modelo abierto más capaz en tareas de razonamiento según Z.ai.
- Codificación avanzada: el modelo base muestra una mejora del 50% sobre GLM-5.2 en el benchmark Z.ai Code Bench, lo que lo hace adecuado para generación y depuración de código.
- Capacidades de agente: GLM-5.3 está diseñado para tareas de largo horizonte y uso de herramientas, con soporte para razonamiento multi-paso.
- Soporte de tool calling y function calling: no se documenta explícitamente en la model card, pero el modelo base está orientado a agentes y la API de Z.ai lo ofrece; se asume que la cuantización no elimina esta capacidad.
- Decodificación especulativa: compatible con el drafter DFlash2 de IncoAI (4.9 GB) para acelerar la generación sin apenas coste adicional de caché KV.
- Multi-token prediction (MTP): el bloque MTP de la capa 78 se preserva en la cuantización, permitiendo su uso como mecanismo de decodificación especulativa nativo.
- Contexto largo: con Decode Context Parallel (DCP4) se puede alcanzar una ventana de aproximadamente 600K tokens para una sola petición, repartiendo la caché KV entre los cuatro nodos.
- Multilingüismo: no se especifican los idiomas soportados en la información disponible.

## Casos de uso

- Inferencia local de un modelo de 743B en hardware de gama media: con cuatro DGX Spark (GB10) y la cuantización Int4-Int8Mix, es posible servir el modelo completo con una caché KV de 33 GB por nodo, algo inviable con cuantizaciones NVFP4. Esto permite a equipos de investigación o empresas medianas ejecutar un modelo de frontera sin depender de la nube.
- Desarrollo de agentes autónomos con contexto largo: gracias al soporte de Decode Context Parallel, se pueden procesar peticiones de hasta ~600K tokens, adecuado para tareas que requieren analizar documentos extensos, historiales de conversación largos o código de gran tamaño.
- Generación de código en entornos con restricciones de hardware: el modelo base es el más capaz en codificación entre los pesos abiertos, y esta cuantización permite integrarlo en pipelines de CI/CD o entornos de desarrollo locales con GPUs GB10, manteniendo la calidad gracias a la preservación de los componentes críticos.
- Investigación en eficiencia de cuantización: al ser una implementación de referencia de la receta QuantTrio aplicada a GLM-5.3, sirve como caso de estudio para evaluar el impacto de la precisión mixta en modelos MoE de gran escala.
- Servicio de chat y asistencia con razonamiento avanzado: el modelo puede gestionar conversaciones multi-turno con razonamiento complejo, aprovechando la ventana de contexto de 1M (o 131K por defecto) para mantener historiales largos.
- Despliegue en clústeres DGX Spark con vLLM: la configuración documentada (tensor-parallel 4, expert-parallel, kv-cache fp8) permite integrar el modelo en infraestructuras existentes de vLLM sin modificaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones de rendimiento (decode tok/s, contexto, tamaño de caché KV) están pendientes de completar tras la prueba de servicio. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para esta cuantización específica. El modelo base GLM-5.3 ha sido evaluado por Z.ai en benchmarks propios (Z.ai Code Bench, Terminal Bench 3.0, Agents' Last Exam), pero esos resultados no se trasladan directamente a la versión cuantizada.

## Requisitos de hardware

- VRAM estimada: ~378 GB en total para los pesos, lo que equivale a ~94.5 GB por nodo en una configuración TP4 con cuatro DGX Spark. Se requiere un mínimo de 4 GPUs con al menos 96 GB de memoria cada una (las GB10 de DGX Spark tienen 128 GB unificados, pero el sistema operativo y el framework consumen parte).
- GPU recomendadas: NVIDIA DGX Spark (GB10, sm121, aarch64) en clúster de 4 nodos con interconexión RoCE. No se documenta compatibilidad con otras GPUs, aunque el formato compressed-tensors es agnóstico al hardware y podría funcionar en GPUs con suficiente memoria (por ejemplo, 8x A100 80GB o 4x H200).
- Cabe en GPUs de consumo: no, requiere al menos 4 GPUs de 96 GB o más; las GPUs de consumo (RTX 4090, 3090) no tienen suficiente memoria para este modelo.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors`, `--kv-cache-dtype fp8`, `--tensor-parallel-size 4` y `--enable-expert-parallel`. También se puede usar Decode Context Parallel para contexto largo. No se menciona compatibilidad con llama.cpp u Ollama para este formato específico.
- Latencia y throughput: no disponibles; los benchmarks están pendientes de publicación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Peso total | Sirve en 4x DGX Spark? | Licencia |
|---|---|---|---|---|---|---|
| **GLM-5.3-Int4-Int8Mix (este)** | 743B / ~40B activos | 1M | Int4/Int8 mixto | ~378 GB | Sí | GLM-5.3 |
| GLM-5.3 NVFP4 (otros quants) | 743B / ~40B activos | 1M | NVFP4 (atención bf16) | ~465 GB | No (OOM) | GLM-5.3 |
| GLM-5.2-Int4-Int8Mix (QuantTrio) | ~700B (estimado) | 200K (según receta) | Int4/Int8 mixto | no disponible | Sí (con receta similar) | GLM-5.2 |
| GLM-5.3 base (bf16) | 743B / ~40B activos | 1M | Sin cuantizar | ~1.5 TB (estimado) | No | GLM-5.3 |

La comparativa muestra que esta cuantización es la única que permite servir el GLM-5.3 completo en cuatro DGX Spark con headroom de caché KV, frente a las alternativas NVFP4 que se quedan sin memoria. Frente al modelo base sin cuantizar, el ahorro de peso es de aproximadamente 1.1 TB, a costa de una posible degradación de calidad que aún no ha sido medida.

## Limitaciones y advertencias

- Los benchmarks de rendimiento y calidad de esta cuantización no han sido publicados; los valores de la model card están marcados como TBD. No se puede garantizar que la calidad sea equivalente al modelo base.
- El modelo requiere un clúster de al menos 4 GPUs con ~96 GB de memoria cada una; no es viable en hardware de consumo. La configuración documentada es específica para DGX Spark con interconexión RoCE.
- La licencia GLM-5.3 puede imponer restricciones de uso comercial; es necesario revisar los términos en el enlace proporcionado antes de desplegar en producción.
- Al ser una cuantización data-free, puede haber una degradación no evaluada en tareas que dependen de la precisión de los pesos, especialmente en los expertos MoE cuantizados a Int4.
- El modelo se encuentra en proceso de subida de pesos (la model card indica "weights uploading"); es posible que los shards no estén completos o que haya cambios en la configuración final.
- No se documentan los idiomas soportados ni posibles sesgos; se heredan las limitaciones del modelo base, que no se detallan en la información disponible.
- El uso de Decode Context Parallel para alcanzar ~600K de contexto introduce un coste adicional por paso de decodificación debido a la comunicación entre nodos, que no está cuantificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/2wild4tv/GLM-5.3-Int4-Int8Mix
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia GLM-5.3: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Receta de QuantTrio para GLM-5.2: https://huggingface.co/QuantTrio/GLM-5.2-Int4-Int8Mix
- GitHub de Tony DeAngelo: https://github.com/tonyd2wild
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Documentación de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/glm-5.3
- Drafter DFlash2 de IncoAI: https://huggingface.co/incoai/GLM-5.3-DFlash2
