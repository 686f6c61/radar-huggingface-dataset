# kurcontko/translategemma-4b-it-FP8

## Resumen

TranslateGemma-4B-IT-FP8 es una cuantización en FP8 del modelo de traducción `google/translategemma-4b-it`, publicada por el usuario independiente `kurcontko` y no afiliada a Google. El modelo base forma parte de la familia TranslateGemma de Google, construida sobre la arquitectura Gemma 3 y orientada específicamente a traducción automática multilingüe, incluyendo traducción de texto presente en imágenes. Esta versión concreta empaqueta los pesos en FP8 E4M3 mediante `llm-compressor` y `compressed-tensors`, con el objetivo de servir el modelo en vLLM con menor huella de VRAM y mayor throughput que la referencia en BF16.

El interés de esta ficha radica en que demuestra que una cuantización agresiva en FP8 puede mantener la calidad de traducción prácticamente intacta: el autor reporta un COMET-22 de 82,79 frente a 82,80 del BF16 en WMT24++ (pares europeos), con un throughput de 176 celdas/s frente a 123 del BF16 y un peso de 4,4 GiB en vLLM (frente a 7,4 GiB). Es, por tanto, una opción relevante para despliegues de traducción en GPUs de 8-12 GB o en GPUs compartidas con otros modelos.

El modelo cubre nueve idiomas declarados (inglés, polaco, alemán, francés, español, italiano, neerlandés, portugués y checo), aunque el modelo base soporta 55 idiomas según la documentación pública. La licencia es Gemma, con las restricciones que ello implica para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma 3 (con torre de visión) |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en esta build (`max_position_embeddings`); la model card del base indica contexto de entrada de 2K tokens para traducción |
| Tipos de cuantización | FP8 E4M3 (pesos por canal de salida, activaciones por token en runtime); torre de visión, proyector y embeddings en BF16 |
| Idiomas soportados | en, pl, de, fr, es, it, nl, pt, cs (9 declarados en esta build); el base soporta 55 según documentación pública |
| Licencia | Gemma |
| Formato de pesos | safetensors (compatible con vLLM; `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 3, con 4.300 millones de parámetros, torre de visión para traducción de texto en imágenes y atención global con escalado lineal ×8 en RoPE (de ahí que el autor reduzca `max_position_embeddings` a 32.768 para no consumir KV cache innecesariamente en vLLM). La model card del base no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset; la información pública disponible indica que está optimizado para traducción multilingüe y despliegue en móvil y edge.

Esta build concreta no reentrena el modelo: aplica cuantización post-entrenamiento con `llm-compressor`. Cada capa lineal del modelo de lenguaje usa pesos FP8 E4M3 con una escala por canal de salida; las activaciones se cuantizan a FP8 por token en tiempo de ejecución en vLLM, sin datos de calibración. La torre de visión, el proyector y los embeddings se mantienen en BF16. Respecto a una exportación estándar de `llm-compressor`, el autor elimina el `lm_head.weight` duplicado (los embeddings están atados y vLLM no lo lee), reduciendo la descarga en 1,3 GB, y añade una plantilla de chat que acepta el formato de cadena plana `<<<source>>>CODE<<<target>>>CODE<<<text>>>TEXT`, necesario porque el servidor de vLLM 0.26 descarta los campos `source_lang_code` y `target_lang_code` de los mensajes.

## Capacidades

- Traducción de texto entre los idiomas declarados: en, pl, de, fr, es, it, nl, pt, cs, con códigos de idioma tipo `en`, `pl`, `de-DE`, `pt-PT`, `es-MX`.
- Traducción de texto presente en imágenes (capacidad heredada del base; el autor indica que no la ha probado en este checkpoint).
- Servido mediante API compatible con OpenAI en vLLM, aceptando tanto el formato estructurado del base como una cadena plana.
- Preservación parcial de tokens protegidos en contextos tipo hoja de cálculo: placeholders `{...}`, `%s`, `%1$s`, `{{var}}`, `${var}`, etiquetas HTML, URLs, correos, SKUs, código en línea y saltos de línea (80,0% de tokens protegidos conservados, 82,9% de celdas intactas).
- Decodificación greedy reproducible (temperatura 0) para traducción determinista.
- No dispone de tool calling ni de modo de razonamiento extendido documentados.

## Casos de uso

- Traducción de documentación técnica en pipelines de CI/CD: el modelo acepta cadenas planas con marcadores `<<<source>>>`/`<<<target>>>`, lo que permite integrarlo en scripts de localización que envían lotes de cadenas al servidor vLLM y reciben traducciones deterministas con temperatura 0.
- Localización de hojas de cálculo y catálogos: el test de estructura del autor (175 celdas por idioma con 270 tokens que deben sobrevivir literalmente) muestra que el modelo conserva el 80% de tokens protegidos; es adecuado para flujos donde se traducen celdas individuales y se preservan placeholders y URLs.
- Traducción de atención al cliente multilingüe: con contexto de 32.768 tokens en esta build y un throughput de 176 celdas/s en una RTX 5070 Ti, puede gestionar colas de tickets en varios idiomas europeos en una GPU de 12 GB.
- Servicio de traducción en GPUs de 8 GB: con 4,4 GiB de pesos en vLLM (text-only) y `--gpu-memory-utilization` ajustable, cabe en tarjetas consumer modestas donde el BF16 (7,4 GiB) no dejaría margen para KV cache.
- Traducción de contenido editorial y literario: el conjunto de evaluación WMT24++ cubre noticias, redes sociales, discurso y texto literario, y el COMET-22 de 82,79 indica calidad cercana al BF16 en esos dominios.
- Coexistencia con otros modelos en una GPU compartida: al reducir la huella a 4,4 GiB, permite servir traducción junto a otro modelo pequeño en la misma tarjeta.
- Traducción de texto en imágenes (OCR + traducción): capacidad heredada del base, aunque el autor no la ha validado en esta build; requiere probarla antes de producción.

## Benchmarks y rendimiento

Evaluación sobre WMT24++ (`google/wmt24pp`), 960 segmentos por dirección, 8.640 en total, decodificación greedy en vLLM 0.26.0, RTX 5070 Ti 16 GB con presupuesto de 11,5 GB. COMET-22 con `Unbabel/wmt22-comet-da` escalado ×100; chrF de sacrebleu.

| Modelo | EN→CS | EN→DE | EN→ES | EN→FR | EN→IT | EN→NL | EN→PL | EN→PT | PL→EN | Global | chrF |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BF16 referencia | 84,43 | 81,86 | 82,80 | 81,24 | 83,84 | 83,46 | 83,77 | 82,60 | 81,16 | 82,80 | 55,4 |
| Esta build FP8 | 84,49 | 81,84 | 82,80 | 81,10 | 84,00 | 83,54 | 83,79 | 82,55 | 81,03 | 82,79 | 55,3 |

Comparativa de builds del mismo modelo (mismos tests, mismo presupuesto de 11,5 GB):

| Build | COMET-22 | vs BF16 | Estructura (tokens / celdas) | celdas/s |
|---|---|---|---|---|
| BF16 | 82,80 | – | 81,5% / 84,0% | 123 |
| Esta build FP8 | 82,79 | −0,01 | 80,0% / 82,9% | 176 |
| ViralityLeo/vllm-translategemma-4b-it-FP8-Dynamic | 82,68 | −0,12 | 79,3% / 81,7% | 175 |
| kurcontko/translategemma-4b-it-NVFP4 | 82,32 | −0,48 | 72,6% / 74,9% | ~250–280 |

El autor no aporta evaluación humana ni resultados en dominios fuera de los nueve pares evaluados.

## Requisitos de hardware

- VRAM estimada: 4,4 GiB de pesos en vLLM en modo text-only; la descarga del repositorio es de 5,1 GB (5,4 GB de tamaño de repo). Con KV cache y overhead, el autor lo ejecuta con `--gpu-memory-utilization` ≈ 0,74 en una GPU de 16 GB para simular una de 12 GB.
- GPU recomendadas: cualquier GPU Ada, Hopper o Blackwell (FP8 requiere una de estas generaciones). El autor lo probó en una RTX 5070 Ti 16 GB.
- Cabe en GPUs consumer de 8 GB en modo text-only con `--max-model-len` reducido; en 12 GB con margen para lotes mayores.
- Opciones de despliegue: vLLM 0.26.0 (probado). No se documenta soporte para llama.cpp, Ollama ni TGI en esta build.
- Throughput: 176 celdas/s en lotes de 4.000 celdas cortas (EN→X, 1-40 palabras) en RTX 5070 Ti con presupuesto de 11,5 GB; 1,4× el BF16 (123 celdas/s).
- Nota operativa: si el arranque falla al compilar kernels de muestreo de FlashInfer por incompatibilidad de cabeceras CUDA, definir `VLLM_USE_FLASHINFER_SAMPLER=0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | COMET-22 (WMT24++ EU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kurcontko/translategemma-4b-it-FP8 | 4,3B | 32.768 (build) | 82,79 | Gemma | Hugging Face (vLLM) |
| google/translategemma-4b-it (BF16) | 4,3B | 2K entrada según card | 82,80 | Gemma | Hugging Face |
| ViralityLeo/vllm-translategemma-4b-it-FP8-Dynamic | 4,3B | no disponible | 82,68 | Gemma | Hugging Face (vLLM) |
| kurcontko/Hy-MT2-7B-NVFP4 | 7B | no disponible | 84,66 | no disponible | Hugging Face |

El autor recomienda Hy-MT2-7B-NVFP4 en tarjetas de 12 GB (mejor COMET y 99,3% de tokens protegidos con su prompt keep-structure), y reserva esta build para GPUs de 8 GB, GPUs sin soporte FP4 o entornos con GPU compartida.

## Limitaciones y advertencias

- Evaluación limitada a nueve direcciones de traducción con COMET-22 y chrF; sin evaluación humana.
- El autor no ha probado la traducción de imágenes con este checkpoint; la torre de visión se mantiene en BF16 pero su comportamiento no está validado.
- La preservación de estructura cae 1,5 puntos respecto al BF16 (80,0% frente a 81,5% de tokens protegidos), y el BF16 ya reescribe etiquetas `<b>` y traduce etiquetas como `[PENDING]`; no es fiable para localización estricta sin post-procesado.
- Los idiomas cubiertos en la evaluación son solo europeos; el base declara 55 idiomas pero esta build solo lista nueve y no hay datos de calidad para el resto.
- Licencia Gemma: uso comercial sujeto a los términos de Google, con obligaciones de atribución y restricciones de uso aceptable; el autor incluye un fichero `NOTICE` con los cambios realizados.
- Requiere GPU Ada, Hopper o Blackwell para FP8; no funciona en arquitecturas anteriores.
- El servidor de vLLM 0.26 descarta los campos de código de idioma del formato estructurado, por lo que hay que usar la cadena plana `<<<source>>>...`; con `transformers` sí funciona el formato estructurado del base.
- Riesgo de alucinación y de omisión en segmentos largos o ambiguos, inherente a los modelos de traducción neuronales; no se documentan sesgos específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurcontko/translategemma-4b-it-FP8
- Modelo base: https://huggingface.co/google/translategemma-4b-it
- Build NVFP4 del mismo autor: https://huggingface.co/kurcontko/translategemma-4b-it-NVFP4
- Build Hy-MT2-7B-NVFP4 recomendada por el autor: https://huggingface.co/kurcontko/Hy-MT2-7B-NVFP4
- Build FP8 alternativa: https://huggingface.co/ViralityLeo/vllm-translategemma-4b-it-FP8-Dynamic
- Ficha de especificaciones del base: https://llmlearner.com/models/translategemma-4b
- Dataset de evaluación: https://huggingface.co/google/wmt24pp
- Métrica COMET-22: https://huggingface.co/Unbabel/wmt22-comet-da
