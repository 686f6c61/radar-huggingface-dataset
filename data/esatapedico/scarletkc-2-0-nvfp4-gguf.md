# esatapedico/ScarletKc-2.0-NVFP4-GGUF

## Resumen

ScarletKc-2.0-NVFP4-GGUF es una colección de cuantizaciones GGUF en formato NVFP4 del modelo ScarletKc/ScarletKc-2.0, un modelo denso de 27 320 698 112 parámetros (aproximadamente 27,3 mil millones) con arquitectura híbrida que combina Gated DeltaNet y Gated Attention, e incorpora una torre de visión nativa y una cabeza MTP (multi-token prediction) para decodificación especulativa. El trabajo de conversión numérica y de la escalera de siete niveles de precisión lo firma el usuario esatapedico; el modelo original pertenece al repositorio ScarletKc.

La relevancia de esta publicación radica en que comprime un modelo de 27B en ficheros de entre 14,86 GB y 19,69 GB que caben en GPUs de consumo con 16-24 GB de VRAM, manteniendo la cabeza MTP embebida en cada fichero, de modo que el despliegue con decodificación especulativa no requiere un modelo drafter separado. Está orientada a hardware Blackwell (sm_120) y al ecosistema llama.cpp.

La información disponible sobre el modelo base es limitada: la model card se centra en el proceso de cuantización y en las mediciones de los distintos niveles, y no detalla la composición del dataset de entrenamiento ni los resultados de benchmarks estándar del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet + Gated Attention, con torre de visión y cabeza MTP |
| Parametros totales | 27 320 698 112 (dato real de safetensors) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (según metadatos del GGUF ORIG) |
| Tipos de cuantizacion | NVFP4 en el backbone (448 tensores), con escalera de precisión por nivel en lm_head, token embedding y cabeza MTP: Q2_K, Q3_K, Q4_K, Q5_0, Q6_K, Q8_0, IQ4_XS, BF16; 48 vectores `ssm_alpha` en F32 |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (siete niveles) + mmproj F16 para visión |

## Arquitectura y entrenamiento

El modelo base es un transformer denso híbrido de 65 bloques (`qwen35.block_count=65`) que alterna capas de Gated DeltaNet y de Gated Attention. La cabeza MTP ocupa un bloque adicional (blk.64) con `nextn_predict_layers=1`, lo que permite decodificación especulativa integrada. El checkpoint original contiene 1711 claves (1199 base más 512 acompañantes de escala NVFP4). La torre de visión se distribuye como proyector separado (`mmproj-ScarletKc-2.0-NVFP4-F16.gguf`, 334 tensores, 0,93 GB).

El trabajo de esta publicación es exclusivamente de conversión numérica: 256 tensores del backbone provienen de la pasada de conversión NVFP4 (192 de MLP y 64 de atención completa), y 192 tensores DeltaNet se normalizaron a NVFP4 durante la construcción de cada nivel. La cabeza MTP es bit-idéntica al origen (15/15). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional y razonamiento, con traza de pensamiento (thinking) que termina correctamente según las pruebas de humo.
- Procesamiento de imágenes mediante el proyector de visión emparejable con cualquier nivel vía `--mmproj` (documentado por el autor, aunque no probado en esta familia).
- Decodificación especulativa nativa con la cabeza MTP embebida (`--spec-type draft-mtp`), sin necesidad de un drafter externo.
- Soporte multilingüe declarado (en y multilingual).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se dispone de información sobre soporte de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Despliegue local en GPU de consumo: el nivel VERY-LOW ocupa 13,83 GiB de VRAM y el VERY-HIGH 18,33 GiB, lo que permite ejecutar un modelo de 27B en tarjetas de 16-24 GB con llama.cpp.
- Inferencia de baja latencia con decodificación especulativa: la cabeza MTP embebida en cada fichero permite activar `--spec-type draft-mtp` y acelerar la generación sin cargar un modelo drafter adicional.
- Asistentes conversacionales con contexto largo: la ventana de 262 144 tokens del GGUF ORIG permite mantener conversaciones multi-turno o procesar documentos extensos en una sola pasada.
- Análisis de documentos con imágenes: el proyector `mmproj` F16 (0,93 GB) se empareja con cualquier nivel para tareas de descripción de imágenes o extracción de información visual.
- Servicio en hardware Blackwell: la cuantización NVFP4 está orientada a sm_120, por lo que encaja en despliegues sobre GPUs de esa generación con llama.cpp.
- Evaluación comparativa de precisión: la escalera de siete niveles permite medir el compromiso entre perplejidad (de 3,8039 en VERY-LOW a 3,7351 en MEDIUM y HIGH) y huella de VRAM para elegir el punto óptimo de producción.
- Prototipado e investigación: la licencia Apache-2.0 y el formato GGUF facilitan experimentos reproducibles con hashes SHA-256 verificables por fichero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card aporta mediciones de perplejidad (PPL) y de rendimiento de llama.cpp por nivel:

| Nivel | Tamano | PPL | VRAM | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|---|---|
| VERY-LOW | 14,86 GB | 3,8039 ± 0,09155 | 13,83 GiB | 2467,35 ± 24,84 | 32,39 ± 0,19 |
| COMPACT-LOW | 15,16 GB | 3,7894 ± 0,09109 | 14,11 GiB | 2471,50 ± 29,25 | 32,04 ± 0,19 |
| LOW | 15,53 GB | 3,7664 ± 0,09079 | 14,46 GiB | 2451,41 ± 27,79 | 31,70 ± 0,11 |
| MEDIUM | 16,38 GB | 3,7351 ± 0,08920 | 15,24 GiB | 2443,64 ± 26,61 | 30,58 ± 0,19 |
| MID-HIGH | 16,91 GB | 3,7686 ± 0,09051 | 15,74 GiB | 2461,06 ± 26,39 | 30,50 ± 0,20 |
| HIGH | 17,57 GB | 3,7351 ± 0,08920 | 16,35 GiB | 2403,77 ± 26,13 | 28,11 ± 0,06 |
| VERY-HIGH | 19,69 GB | 3,7522 ± 0,09004 | 18,33 GiB | 2352,72 ± 144,63 | 28,14 ± 0,08 |

El autor indica que no hay ancla de KLD para esta familia, por lo que esa métrica está ausente.

## Requisitos de hardware

- VRAM estimada: entre 13,83 GiB (VERY-LOW) y 18,33 GiB (VERY-HIGH) según los datos medidos por el autor.
- GPU recomendadas: hardware Blackwell (sm_120), por ser el objetivo de la cuantización NVFP4. No se especifican modelos concretos en la información disponible.
- GPU de consumo: los niveles bajos e intermedios caben en tarjetas de 16 GB; los superiores requieren 20-24 GB. El nivel ORIG (27,65 GB) queda fuera del rango de consumo.
- Despliegue: llama.cpp (librería declarada), con soporte de `--mmproj` para visión y `--spec-type draft-mtp` para decodificación especulativa. No se mencionan vLLM, TGI ni Ollama.
- Throughput medido: pp512 entre 2352,72 y 2471,50 tok/s; tg128 entre 28,11 y 32,39 tok/s, con el mejor rendimiento en los niveles de menor tamaño.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia interna, la comparativa más directa es con el propio GGUF ORIG del que derivan los niveles:

| Modelo | Parametros | Contexto | Tamano | Licencia |
|---|---|---|---|---|
| ScarletKc-2.0-NVFP4-ORIG | 27,3B | 262 144 | 27,65 GB | Apache-2.0 |
| ScarletKc-2.0-NVFP4-VERY-LOW | 27,3B | 262 144 | 14,86 GB | Apache-2.0 |
| ScarletKc-2.0-NVFP4-VERY-HIGH | 27,3B | 262 144 | 19,69 GB | Apache-2.0 |

Comparativa con alternativas externas de la misma categoría: no disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; las pruebas de humo solo verifican que la traza de pensamiento termina y produce contenido real.
- El emparejamiento del proyector de visión (`mmproj`) está documentado pero no probado por el autor en esta familia de modelos.
- La cuantización NVFP4 está orientada a Blackwell sm_120; el rendimiento en otras arquitecturas de GPU no está documentado.
- No existe nivel HIGHEST: la atención llega pre-cuantizada en NVFP4 y la recuantización desde NVFP4 está deshabilitada.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base upstream.
- El autor no ofrece métricas KLD por falta de ancla para esta familia, lo que limita la evaluación objetiva de la degradación por cuantización más allá de la perplejidad.
- El repositorio ocupa 146,6 GB en total; conviene descargar solo el nivel necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/ScarletKc-2.0-NVFP4-GGUF
- Modelo base: https://huggingface.co/ScarletKc/ScarletKc-2.0
- Sitio del autor: https://www.esatapedico.com
