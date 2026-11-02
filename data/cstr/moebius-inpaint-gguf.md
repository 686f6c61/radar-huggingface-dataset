# cstr/Moebius-inpaint-GGUF

## Resumen

Moebius-inpaint-GGUF es una conversión a formato GGUF del modelo de inpainting Moebius (variante entrenada sobre Places2), publicada por el usuario cstr para su uso exclusivo dentro del motor de inpainting nativo de CrispEmbed. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son copias exactas del checkpoint original de hustvl/Moebius, convertidas desde el formato PyTorch original (`diffusion_pytorch_model.bin`) a GGUF y cuantizadas con la herramienta `crispembed-quantize` bajo la política `inpaint-v1`. El modelo tiene 226.194.357 parámetros y el repositorio ocupa 1,9 GB.

El modelo resuelve la tarea de inpainting de imágenes: reconstruir regiones enmascaradas de una fotografía de forma coherente con el contexto visible. La relevancia de esta publicación es fundamentalmente de preservación y portabilidad: permite ejecutar el modelo fuera del stack PyTorch original, con variantes de precisión calibradas mediante umbrales de similitud coseno verificados contra la salida de referencia en F32. No obstante, su estado es explícitamente experimental y solo funciona dentro de CrispEmbed con flags de activación desactivadas por defecto.

La información disponible es limitada: no hay datos de benchmarks publicados, no se especifican idiomas (es un modelo de imagen, no de texto) y la licencia presenta una ambigüedad documentada entre Apache-2.0 (README oficial) y MIT (model card del autor), que el conversor reproduce sin reclamar licencia dual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para inpainting (latent inpainting); detalles internos de la arquitectura no disponibles |
| Parametros totales | 226.194.357 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q4_K-mix (Q4_K plano no publicado: falla el umbral en fotos reales con 0,859) |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | Ambigua: Apache-2.0 según README oficial de Moebius; MIT según model card del autor. Se reproduce `license: other` con nombre `moebius-upstream-records` |
| Formato de pesos | GGUF (4 ficheros: `moebius-f32.gguf`, `moebius-f16.gguf`, `moebius-q8_0.gguf`, `moebius-q4_k-mix.gguf`) |

## Arquitectura y entrenamiento

Moebius es un modelo de difusión para inpainting de imágenes, según se deduce del nombre del pipeline y de la naturaleza del checkpoint (`diffusion_pytorch_model.bin`). El modelo card no detalla la arquitectura interna (tipo de UNet, número de bloques, mecanismo de atención ni configuración del scheduler), por lo que estos datos deben considerarse no disponibles en la información proporcionada. La variante publicada corresponde al checkpoint `ft_places2`, es decir, afinado sobre el dataset Places2, orientado a escenas naturales y entornos diversos.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset más allá de la referencia a Places2, ni sobre el uso de RLHF, DPO u otras técnicas de alineación (poco habituales en modelos de difusión de imagen). La innovación técnica destacable de esta publicación no está en el modelo en sí, sino en el proceso de conversión y cuantización: se definen umbrales de aceptación por variante (coseno mínimo sobre la salida final: F32 > 0,99, F16 > 0,98, Q8_0 > 0,97, Q4_K > 0,94) y se documenta el SHA-256 de cada fichero. La variante Q4_K-mix aplica Q8_0 a todos los tensores de los bloques de atención y Q4_K al resto, con el objetivo de preservar calidad en las partes sensibles del modelo.

## Capacidades

- Inpainting de imágenes: reconstrucción de regiones enmascaradas en fotografías y escenas, con coherencia respecto al contexto visible.
- Afinado sobre Places2: orientado a escenas naturales, paisajes y entornos diversos.
- Ejecución cuantizada con precisión controlada: cuatro variantes con umbrales de fidelidad verificados frente a la referencia F32.
- Integración con SDXL-VAE: los ficheros deben emparejarse con el VAE companion del repositorio cstr/SDXL-VAE-inpaint-GGUF en la misma precisión (F32 con F32, F16 con F16, Q8_0 con Q8_0, Q4_K-mix con Q8_0).
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes, capacidades multilingües ni audio.
- No soporta modo thinking ni otras capacidades especiales más allá del inpainting.

## Casos de uso

- Restauración de fotografías con zonas dañadas: el modelo reconstruye áreas enmascaradas (arañazos, manchas, elementos no deseados) manteniendo coherencia con la escena circundante, gracias al afinado sobre Places2.
- Eliminación de objetos en imágenes de paisajes y escenas naturales: útil en edición fotográfica y postproducción, donde se enmascara el objeto y el modelo rellena con contenido plausible.
- Preprocesado en pipelines de visión por computador: rellenar huecos en datasets de imágenes antes de tareas de detección o segmentación, usando la variante Q8_0 como compromiso entre calidad y tamaño.
- Prototipado en entornos con recursos limitados: la variante Q4_K-mix (246 MB) permite experimentar con inpainting en hardware modesto, aceptando una fidelidad coseno mínima de 0,9449 frente a F32.
- Conservación y archivado de modelos: la publicación preserva pesos y registros de licencia con hashes verificables, útil para reproducibilidad en investigación.
- Integración en herramientas de edición dentro de CrispEmbed: uso del motor nativo de inpainting con las flags `CRISPEMBED_MOEBIUS=1` y `CRISPEMBED_INPAINT_QUANT=1` para las variantes no F32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (PSNR, SSIM, FID, LPIPS) en la información disponible. La model card únicamente reporta métricas internas de fidelidad de cuantización (similitud coseno mínima sobre la salida final frente a la referencia):

| Variante | Fichero | Bytes | Coseno mínimo | Umbral | Notas |
|---|---|---|---|---|---|
| F32 | `moebius-f32.gguf` | 904.877.728 | 1,0000 | 0,99 | Emparejar con SDXL-VAE F32 |
| F16 | `moebius-f16.gguf` | 484.668.672 | 0,999935 | 0,98 | Emparejar con SDXL-VAE F16 |
| Q8_0 | `moebius-q8_0.gguf` | 287.696.832 | 0,9795 | 0,97 | Emparejar con SDXL-VAE Q8_0 |
| Q4_K-mix | `moebius-q4_k-mix.gguf` | 246.888.384 | 0,9449 | 0,94 | 0,9931 en panel sintético; 0,9449 en fotos reales; emparejar con SDXL-VAE Q8_0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, el fichero F32 ocupa 905 MB y el Q4_K-mix 247 MB, a lo que hay que sumar el VAE companion de SDXL (tamaño no disponible en esta ficha) y el resto del pipeline de difusión.
- GPU recomendadas: no disponibles. Por tamaño de pesos, cualquier GPU con al menos unos pocos GB de VRAM libre podría alojar las variantes cuantizadas; las variantes F32 y F16 requieren más margen.
- Cabe en GPU de consumo: previsiblemente sí en la mayoría de GPUs consumer modernas para las variantes Q8_0 y Q4_K-mix, dado el reducido tamaño de los pesos, aunque no se confirma en la información disponible.
- Opciones de despliegue: exclusivamente el motor nativo de inpainting de CrispEmbed (librería `crispembed`). No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI, que no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia contextual, el modelo original del que deriva es hustvl/Moebius (checkpoint `ft_places2`), pero no se aportan datos de rendimiento que permitan una comparación cuantitativa con alternativas de inpainting.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Moebius-inpaint-GGUF (esta ficha) | 226.194.357 | no disponible | Ambigua (Apache-2.0 / MIT) | GGUF en HuggingFace, solo CrispEmbed |
| Moebius (original, hustvl) | no disponible | no disponible | Apache-2.0 (README) / MIT (card) | PyTorch en HuggingFace |
| Alternativas de inpainting | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado experimental: los ficheros solo funcionan en el motor de inpainting nativo de CrispEmbed y requieren flags desactivadas por defecto (`CRISPEMBED_MOEBIUS=1`; además `CRISPEMBED_INPAINT_QUANT=1` para F16, Q8_0 y Q4_K-mix).
- Licencia ambigua: el README oficial de Moebius declara Apache-2.0 y la model card del autor declara MIT; el conversor reproduce ambos registros sin reclamar licencia dual. Verificar antes de uso comercial.
- Sin datos de benchmarks estándar de calidad de inpainting (PSNR, SSIM, FID); solo se documenta fidelidad de cuantización frente a F32.
- La variante Q4_K-mix pierde fidelidad en fotos reales (coseno 0,9449 frente a 0,9931 en panel sintético); Q4_K plano no se publica porque falla el umbral (0,859).
- Dependencia obligatoria del VAE companion (cstr/SDXL-VAE-inpaint-GGUF) en la precisión correspondiente; un emparejamiento incorrecto puede degradar la salida.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir contenido plausible pero incorrecto en la región enmascarada, especialmente con máscaras grandes o contextos ambiguos.
- Sesgos: no documentados en la información disponible; el afinado sobre Places2 puede favorecer escenas naturales frente a otros dominios.
- Sin soporte de texto, código ni tareas de lenguaje; no debe evaluarse como modelo de lenguaje pese a estar alojado en HuggingFace.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cstr/Moebius-inpaint-GGUF
- VAE companion: https://huggingface.co/cstr/SDXL-VAE-inpaint-GGUF
- Código upstream Moebius: https://github.com/hustvl/Moebius/tree/b88d462bacb9af6e7128a3b4cc4a07418bedfd61
- Pesos originales: https://huggingface.co/hustvl/Moebius/resolve/cd01f47fb648219d3fa605806c5ce00b713faa5e/ft_places2/diffusion_pytorch_model.bin
- Documentación CrispEmbed (inpainting CLI): `docs/inpainting-cli.md` (referenciada en la model card)
- Documentación CrispEmbed (precisión): `docs/inpainting-precision.md` (referenciada en la model card)
