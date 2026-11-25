# nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ

## Resumen

Qwen3.8-Flash-Next-W4A16-HGPTQ es una cuantizacion de 4 bits del modelo multimodal Qwen/Qwen3.8-Flash-Next, desarrollado por el usuario nchapman sobre el modelo base de Qwen. Se trata de un modelo de mezcla de expertos (MoE) de clase 180B con atencion hibrida, torre de vision, embeddings de busqueda n-gram y decodificacion especulativa integrada mediante Multi-Token Prediction (MTP). La cuantizacion reduce el peso de 335,3 GiB en BF16 a 92,84 GiB, un factor de 3,6 veces, manteniendo una fidelidad cercana al modelo original.

El modelo resuelve el problema de desplegar un MoE multimodal de gran tamano en hardware asequible: dos GPU de 24 GB o una sola GPU de 80-96 GB. La calibracion de 4 bits cubre los 512 expertos enrutados por capa, los expertos compartidos, las capas de atencion y GDN, la torre de vision, el borrador MTP y la tabla n-gram de 102 GB, que queda comprimida a 26,8 GiB.

Es relevante ahora porque combina cuantizacion agresiva con preservacion de capacidades multimodales y de decodificacion especulativa, algo poco habitual en cuantizaciones W4A16 de modelos MoE. El modelo esta pensado para el runtime warp34, con soporte tambien en vLLM 0.34 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atencion hibrida, torre de vision, embeddings n-gram y MTP (Multi-Token Prediction) |
| Parametros totales | 180.635.682.707 (180,6B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos de 4 bits, activaciones de 16 bits), GPTQ con Hadamard |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors, compressed-tensors |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de Qwen con 180,6B parametros totales. La arquitectura combina capas de atencion hibrida con capas GDN (Gated DeltaNet, segun la nomenclatura de la model card), una torre de vision para entrada image-text-to-text, una tabla de embeddings de busqueda n-gram de gran tamano (102 GB en BF16) y un cabezal de Multi-Token Prediction que actua como decodificador especulativo integrado. La model card indica 512 expertos enrutados por capa mas expertos compartidos.

Esta version concreta es una cuantizacion, no un entrenamiento nuevo. El proceso aplica GPTQ con transformada de Hadamard sobre todos los componentes: los 512 expertos enrutados por capa, los expertos compartidos, las capas de atencion y GDN, la torre de vision, el borrador MTP y la tabla n-gram. Segun el autor, la cuantizacion retiene el 97,4% del top-1 aislado en vision (99,3% en la guarda UI/OCR) y el 95,4% de acuerdo en los borradores MTP respecto al modelo base de 335 GiB. El repositorio incluye rankings precalculados de expertos calientes (`static_hot_cache_rankings.json`) para que warp34 fije los expertos mas usados en VRAM y transmita por streaming los accesos frios.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text): la torre de vision esta incluida y cuantizada.
- Reconocimiento de texto en imagenes (OCR) e interfaces de usuario, con una guarda especifica que retiene el 99,3% del top-1.
- Decodificacion especulativa integrada mediante MTP, con un 95,4% de acuerdo en los borradores respecto al modelo base.
- Embeddings de busqueda n-gram para recuperacion y copia de secuencias largas.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible en la informacion.

## Casos de uso

- Despliegue de un MoE multimodal de 180B en dos GPU de 24 GB: con `warp34 serve --tp 2`, el modelo cabe en 92,84 GiB totales gracias al streaming por mmap de la tabla n-gram y al cache de expertos calientes, lo que permite servir un modelo de clase 180B en hardware de gama alta de consumo profesional.
- Procesamiento de documentos con OCR e interfaces: la guarda UI/OCR al 99,3% de top-1 y la torre de vision cuantizada lo hacen adecuado para extraer texto de capturas, formularios y pantallas en pipelines de digitalizacion.
- Asistentes conversacionales con contexto largo: la tabla n-gram y el MTP integrado reducen la latencia de generacion en dialogos multi-turno, utiles en atencion al cliente automatizada con historial extenso.
- Inferencia en una sola GPU de 80-96 GB: para equipos con A100 80 GB o H100 80/96 GB, el modelo corre sin tensor parallelism, simplificando el despliegue en vLLM 0.34 o superior.
- Generacion aumentada por recuperacion (RAG) multimodal: la combinacion de vision y embeddings n-gram permite indexar y consultar documentos con imagenes y texto en un mismo pipeline.
- Prototipado e investigacion de tecnicas de cuantizacion: el repositorio incluye rankings de expertos calientes y un laboratorio de cuantizacion (`warp34-quant-lab`) que sirve como referencia para estudiar el impacto de W4A16 en MoE multimodales.
- Servicio de inferencia de bajo coste por token: la reduccion de 335,3 GiB a 92,84 GiB y el uso de MTP para decodificacion especulativa disminuyen los requisitos de memoria y mejoran el throughput frente al modelo en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas de fidelidad de la cuantizacion respecto al modelo base:

| Metrica | Resultado |
|---|---|
| Top-1 aislado en vision | 97,4% de retencion |
| Top-1 en guarda UI/OCR | 99,3% de retencion |
| Acuerdo de borradores MTP | 95,4% |
| Reduccion de tamano | 3,6x (335,3 GiB BF16 a 92,84 GiB) |

## Requisitos de hardware

- VRAM estimada para inferencia: 92,84 GiB totales en W4A16, de los cuales 66,0 GiB corresponden al modelo activo y 26,8 GiB a la tabla n-gram comprimida que warp34 transmite por mmap.
- Configuraciones validadas: 2 GPU de 24 GB con `--tp 2` y MoE por niveles, o una GPU de 80-96 GB.
- GPU recomendadas: A100 80 GB, H100 80/96 GB para una sola tarjeta; dos RTX 4090 de 24 GB o equivalentes para la configuracion `--tp 2`.
- Cabe en GPU de consumo: si, en dos GPU de 24 GB (por ejemplo, RTX 4090) mediante warp34 con streaming de expertos frios.
- Opciones de despliegue: warp34 (runtime principal, con cache de expertos calientes) y vLLM 0.34 o superior con `--trust-remote-code`.
- Latencia y throughput: no disponibles. El autor menciona que el MTP integrado y el borrador DFlash2 opcional (0,52 GiB) aceleran la generacion, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-W4A16-HGPTQ | 180,6B | no disponible | W4A16 GPTQ | qwen-community-1.0 | Hugging Face, warp34, vLLM 0.34+ |
| Qwen3.8-Flash-Next (base) | 180,6B | no disponible | BF16 (335,3 GiB) | qwen-community-1.0 | Hugging Face |
| Qwen3.8-Flash-Next-W2.6A16-HGPTQ-RCO | 180,6B | no disponible | W2.6A16 (44,84 GiB activo / 71,67 GiB total) | qwen-community-1.0 | Hugging Face, warp34 |
| Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ | no disponible (borrador de 0,52 GiB) | no disponible | W4A16 | qwen-community-1.0 | Hugging Face |

## Limitaciones y advertencias

- La licencia qwen-community-1.0 es una licencia "other" con terminos comunitarios propios; es necesario revisar el texto completo en el enlace del modelo base antes de cualquier uso comercial.
- Al ser una cuantizacion W4A16, existe una perdida de fidelidad respecto al BF16: el propio autor mide un 97,4% de retencion en vision y un 95,4% de acuerdo en MTP, lo que implica divergencia en tareas sensibles.
- La tabla n-gram se sirve por streaming con mmap en warp34; en otros runtimes como vLLM el comportamiento y los requisitos de memoria pueden diferir y no estan documentados en la model card.
- El modelo depende de `--trust-remote-code` en vLLM y de un runtime especifico (warp34) para aprovechar el cache de expertos calientes; el rendimiento fuera de ese ecosistema no esta cuantificado.
- No se dispone de informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad del modelo base ni de la cuantizacion.
- Riesgo de alucinacion inherente a los modelos generativos de gran escala; no se han publicado evaluaciones especificas de veracidad para esta cuantizacion.
- La longitud de contexto no esta documentada en la informacion disponible, por lo que no se puede garantizar el comportamiento en ventanas muy largas.
- El repositorio ocupa 337,5 GB, lo que exige almacenamiento considerable incluso aunque la inferencia use 92,84 GiB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion warp34-quant-lab: https://github.com/nchapman/warp34-quant-lab
- Variante de menor precision W2.6A16: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-W2.6A16-HGPTQ-RCO
- Borrador DFlash2 W4A16: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ
- Informe tecnico: TECHNICAL.md (referenciado en la model card del repositorio)
