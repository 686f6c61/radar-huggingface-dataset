# kurcontko/translategemma-4b-it-NVFP4

## Resumen

translategemma-4b-it-NVFP4 es una cuantizacion NVFP4 (W4A4) del modelo de traduccion google/translategemma-4b-it, publicada por el usuario kurcontko. No es un modelo oficial de Google: se trata de un build no afiliado, generado con llm-compressor y calibrado mediante GPTQ sobre pares de traduccion de idiomas europeos (OPUS-100), pensado para servir con vLLM sobre GPUs Blackwell con soporte nativo de FP4.

El modelo base es TranslateGemma-4B, el miembro mas pequeno de la familia TranslateGemma de Google, orientado a despliegue en movil y edge. Esta version cuantizada reduce el peso de los pesos de 7,4 GiB en BF16 a 3,1 GiB en vLLM con servicio solo de texto, y acelera la traduccion por lotes de celdas cortas hasta unas 250-280 celdas/s frente a las 123 del BF16, a cambio de una perdida de calidad de 0,48 puntos COMET-22 en WMT24++.

Es relevante porque demuestra la viabilidad de FP4 end-to-end (pesos y activaciones) en un modelo de traduccion de 4B sobre hardware consumer Blackwell, con un compromiso calidad/velocidad/memoria bien documentado por el autor. El contexto practico de entrada es de 2048 tokens segun la model card del modelo base, aunque la configuracion exportada declara 32.768 posiciones maximas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3) con torre de vision; capas lineales del modelo de lenguaje en NVFP4 |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrada segun la model card del base; `max_position_embeddings` exportado a 32.768 (frente a 131.072 del original) |
| Tipos de cuantizacion | NVFP4 W4A4 (FP4 en pesos y activaciones, grupos de 16 con escalas FP8); torre de vision, proyector y embeddings en BF16 |
| Idiomas soportados | en, pl, de, fr, es, it, nl, pt, cs |
| Licencia | Gemma (terminos de licencia de Google) |
| Formato de pesos | safetensors con compressed-tensors; libreria vllm |

## Arquitectura y entrenamiento

El modelo base es un transformer tipo Gemma 3 de 4.300 millones de parametros con torre de vision y proyector multimodal. En esta build, todas las capas lineales del modelo de lenguaje se cuantizan a NVFP4 (4 bits en pesos y activaciones, con escalas FP8 por grupos de 16), mientras que la torre de vision, el proyector y los embeddings permanecen en BF16. El redondeo de pesos lo decide GPTQ.

La calibracion se realizo con 576 pares de OPUS-100 en las direcciones EN→CS/DE/ES/FR/IT/NL/PL/PT y PL→EN, renderizados con el prompt de TranslateGemma seguido de la traduccion de referencia. Respecto a una exportacion estandar de llm-compressor, esta build elimina el `lm_head.weight` duplicado (los embeddings estan atados y vLLM nunca lo lee), reduciendo la descarga en 1,3 GB, y anade a `chat_template.jinja` la aceptacion de un formato de cadena plana `<<<source>>>CODE<<<target>>>CODE<<<text>>>TEXT`, necesario porque el servidor de vLLM 0.26 descarta los campos `source_lang_code` y `target_lang_code` de los mensajes de chat. El autor verifico que los 8.640 segmentos de test regenerados con prompts de cadena plana coinciden con los de la exportacion sin modificar.

## Capacidades

- Traduccion automatica entre ingles y checo, aleman, espanol, frances, italiano, neerlandes, polaco y portugues, y de polaco a ingles.
- Traduccion de celdas cortas en lote (1 a 40 palabras) con alto throughput.
- Acepta el formato estructurado de mensajes de Google y un formato de cadena plana equivalente.
- Soporte de servicio mediante la API compatible con OpenAI de vLLM.
- Capacidades multimodales del modelo base (torre de vision y proyector en BF16), aunque el autor solo ha probado el servicio en modo texto (`--language-model-only`).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, modo thinking ni audio para esta build.

## Casos de uso

- Traduccion por lotes de catalogos y fichas de producto: el modelo procesa lotes de celdas cortas a 250-280 celdas/s, adecuado para volcar miles de descripciones de e-commerce entre ingles y los ocho idiomas europeos soportados.
- Localizacion de documentacion tecnica: con 2.048 tokens de entrada puede traducir secciones completas de manuales, aunque conviene trocear por parrafos y revisar los placeholders.
- Traduccion de subtitulos y transcripciones: su velocidad en segmentos cortos encaja con pipelines que procesan miles de lineas de subtitulos en pocos minutos sobre una GPU de 12 GB.
- Servicio de traduccion en produccion con vLLM: el servidor compatible con OpenAI permite integrarlo como microservicio detras de una API interna de traduccion.
- Despliegue en GPUs de 6 a 8 GB o compartidas: con 3,1 GiB de pesos en vLLM, cabe junto a otros modelos en una GPU compartida, segun recomienda el autor.
- Traduccion asistida en herramientas ofimaticas: el test de estructura con celdas tipo Excel muestra su uso para traducir hojas de calculo, siempre con validacion posterior de placeholders y etiquetas.
- Prototipado de sistemas de traduccion multilingue: permite comparar rapidamente calidad y latencia frente a builds FP8 o BF16 sin necesidad de GPUs de gran memoria.

## Benchmarks y rendimiento

Test sobre todos los segmentos no canary de WMT24++ (960 por direccion, 8.640 en total), decodificacion greedy en vLLM 0.26.0, una RTX 5070 Ti de 16 GB con presupuesto de 11,5 GB. Metrica COMET-22 con `Unbabel/wmt22-comet-da` escalada x100 y chrF de corpus con sacrebleu.

| Modelo | EN→CS | EN→DE | EN→ES | EN→FR | EN→IT | EN→NL | EN→PL | EN→PT | PL→EN | Global | chrF |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BF16 referencia | 84,43 | 81,86 | 82,80 | 81,24 | 83,84 | 83,46 | 83,77 | 82,60 | 81,16 | 82,80 | 55,4 |
| Este modelo (NVFP4 GPTQ) | 83,63 | 81,38 | 82,43 | 80,53 | 83,74 | 83,20 | 82,97 | 82,18 | 80,82 | 82,32 | 54,7 |

Comparativa de builds de TranslateGemma-4B con el mismo test y presupuesto de 11,5 GB:

| Build | COMET-22 | Diferencia vs BF16 | Estructura (tokens conservados / celdas intactas) | Celdas/s |
|---|---|---|---|---|
| BF16 | 82,80 | – | 81,5% / 84,0% | 123 |
| translategemma-4b-it-FP8 | 82,79 | −0,01 | 80,0% / 82,9% | 176 |
| Este modelo | 82,32 | −0,48 | 72,6% / 74,9% | ~250-280 |
| mydubber-org/translategemma-4b-text-W4A16 | 82,31 | −0,49 | 71,9% / 74,9% | 119 |
| kaitchup/translategemma-4b-it-NVFP4 | 81,82 | −0,98 | 77,0% / 77,1% | ~250-330 |

El test de estructura emplea 175 celdas tipo Excel en PL, DE, FR, ES y CS con 270 tokens que deben sobrevivir literalmente (placeholders, etiquetas HTML, URLs, correos, SKUs, codigo en linea y saltos de linea). El propio BF16 conserva solo el 81,5%, y esta build pierde mas placeholders aun.

## Requisitos de hardware

- VRAM estimada: 3,1 GiB de pesos en vLLM con servicio solo de texto (frente a 7,4 GiB en BF16); la descarga ocupa 3,8 GB.
- GPU recomendadas: requiere GPU Blackwell para NVFP4; el autor probo con una RTX 5070 Ti de 16 GB limitada a un presupuesto de 11,5 GB.
- Cabe en GPUs consumer de 6 a 8 GB, segun la recomendacion del autor, y en GPUs compartidas junto a otros modelos.
- Despliegue: vLLM 0.26.0 con `vllm serve kurcontko/translategemma-4b-it-NVFP4 --language-model-only --max-model-len 2048 --gpu-memory-utilization 0.9`. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Throughput: unas 250-280 celdas/s en lotes de celdas cortas (rango medido entre 248 y 327 celdas/s en ejecuciones consecutivas), frente a 123 celdas/s del BF16 y 176 del FP8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | COMET-22 (WMT24++ EU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (NVFP4) | 4,3B | 2.048 (practico) | 82,32 | Gemma | Hugging Face, vLLM en Blackwell |
| google/translategemma-4b-it (BF16) | 4,3B | 2.048 (practico) | 82,80 | Gemma | Hugging Face |
| kurcontko/translategemma-4b-it-FP8 | 4,3B | 2.048 (practico) | 82,79 | Gemma | Hugging Face |
| kurcontko/Hy-MT2-7B-NVFP4 | 7B | no disponible | 84,66 | no disponible | Hugging Face |

Segun el autor, en una GPU de 12 GB la opcion preferible es Hy-MT2-7B-NVFP4 (84,66 COMET-22, 213 celdas/s, 99,3% de tokens protegidos conservados con su prompt keep-structure); esta build de 4B tiene sentido en GPUs de 6 a 8 GB o compartidas.

## Limitaciones y advertencias

- Perdida de calidad medible: 0,48 puntos COMET-22 frente al BF16, concentrada en checo y polaco (unos 0,8 puntos cada uno).
- Peor conservacion de estructura que el BF16: 72,6% de tokens protegidos frente a 81,5%, con riesgo de romper placeholders, etiquetas HTML o etiquetas como `[PENDING]`; requiere validacion posterior en produccion.
- Requiere GPU Blackwell para NVFP4; no funciona en arquitecturas anteriores.
- El contexto practico de entrada es de 2.048 tokens segun la model card del base; el valor exportado de 32.768 no debe interpretarse como ventana real de trabajo.
- El servidor de vLLM 0.26 descarta los campos `source_lang_code` y `target_lang_code`, por lo que el formato estructurado de Google no llega a la plantilla; hay que usar la forma de cadena plana.
- Solo se ha probado el servicio en modo texto; el rendimiento multimodal de la torre de vision no esta validado en esta build.
- Build no oficial, no afiliada a Google; la licencia Gemma impone sus propios terminos de uso, incluidos requisitos de atribucion y restricciones de uso comercial que deben revisarse antes de desplegar.
- Riesgo de alucinacion y sesgos del modelo base no documentados en la informacion disponible para esta cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurcontko/translategemma-4b-it-NVFP4
- Modelo base: https://huggingface.co/google/translategemma-4b-it
- Build FP8 del mismo autor: https://huggingface.co/kurcontko/translategemma-4b-it-FP8
- Build NVFP4 alternativo: https://huggingface.co/kaitchup/translategemma-4b-it-NVFP4
- Build W4A16 alternativo: https://huggingface.co/mydubber-org/translategemma-4b-text-W4A16
- Modelo recomendado por el autor para 12 GB: https://huggingface.co/kurcontko/Hy-MT2-7B-NVFP4
- Blog de Google sobre TranslateGemma: https://blog.google/innovation-and-ai/technology/developers-tools/translategemma/
- Dataset de evaluacion WMT24++: https://huggingface.co/google/wmt24pp
