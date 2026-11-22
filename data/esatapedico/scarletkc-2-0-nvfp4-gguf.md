# esatapedico/ScarletKc-2.0-NVFP4-GGUF

## Resumen

ScarletKc-2.0-NVFP4-GGUF es una familia de conversiones a formato GGUF del modelo ScarletKc/ScarletKc-2.0, un modelo denso de 27.320.698.112 parámetros (27B) con arquitectura híbrida que combina Gated DeltaNet y Gated Attention, torre de visión nativa y cabeza MTP (multi-token prediction) embebida para decodificación especulativa. El trabajo de conversión y cuantización lo publica el usuario esatapedico, mientras que el modelo original pertenece a ScarletKc. La licencia es Apache-2.0 en ambos niveles.

La relevancia de esta publicación está en la escalera de precisión: siete ficheros GGUF que comparten un backbone NVFP4 de 448 tensores byte a byte idéntico y difieren únicamente en la precisión del `lm_head`, el token embedding y la cabeza MTP. Esto permite elegir el compromiso tamaño/calidad sin cambiar el resto de los pesos, algo poco habitual en el ecosistema GGUF. Los ficheros están pensados para hardware Blackwell (sm_120) con soporte NVFP4 en llama.cpp.

El modelo base está etiquetado como qwen3.5 en los tags, con 65 bloques (`qwen35.block_count=65`), contexto declarado de 262.144 tokens en el GGUF padre y cabeza MTP de una capa (`nextn_predict_layers=1`). El repositorio ocupa 78,8 GB e incluye nueve GGUFs (siete tiers más el ORIG y el proyector de visión) junto con las tarjetas de documentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet + Gated Attention, con cabeza MTP embebida y torre de visión nativa |
| Parámetros totales | 27.320.698.112 (27B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (declarado en el GGUF padre ORIG) |
| Tipos de cuantización | NVFP4 (backbone), Q2_K, Q3_K, Q4_K, Q5_0, Q6_K, Q8_0, IQ4_XS, BF16, F32 (según tensor y tier) |
| Idiomas soportados | Inglés y multilingüe (según metadatos; sin listado detallado) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B con 65 bloques que combina dos mecanismos de atención: Gated DeltaNet (atención lineal con estado recurrente) y Gated Attention (atención completa). Esta hibridación busca reducir el coste de la ventana larga manteniendo calidad en tareas que requieren atención global. Incorpora una cabeza MTP de una capa (`nextn_predict_layers=1`) que actúa como drafter interno para decodificación especulativa, y una torre de visión nativa servida aparte como proyector `mmproj`.

La conversión NVFP4 se realizó sobre el checkpoint original: el backbone compartido consta de 448 tensores NVFP4 (256 cuantizados en la pasada de conversión —192 de MLP y 64 de atención completa— más 192 tensores DeltaNet normalizados al construir los tiers), con 48 vectores `ssm_alpha` mantenidos en F32 y verificación SHA-256 por tensor contra el tier MID-HIGH. El censo del checkpoint es de 1.711 claves (1.199 base más 512 compañeras de escala NVFP4) y la cabeza MTP es bit a bit idéntica al origen (15/15). No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento en modo thinking (los smoke tests confirman terminación del bloque de pensamiento con contenido real).
- Procesamiento de imágenes mediante el proyector de visión `mmproj-ScarletKc-2.0-NVFP4-F16.gguf` (emparejamiento documentado pero no verificado en esta familia).
- Decodificación especulativa MTP integrada en cada fichero (`--spec-type draft-mtp`), sin necesidad de un drafter separado.
- Capacidades multilingües declaradas en los metadatos, con inglés como idioma principal.
- Compatibilidad con endpoints y uso conversacional según los tags del repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en estaciones con GPU Blackwell: los tiers de 14,86 a 19,69 GB caben en GPUs consumer de 24 GB (RTX 4090/5090) y permiten ejecutar un modelo de 27B con contexto largo gracias al backbone NVFP4 y a la ventana de 262.144 tokens.
- Asistentes conversacionales de contexto largo: la ventana de 262.144 tokens permite mantener historiales extensos o analizar documentos completos sin truncamiento, con el tier MEDIUM (16,38 GB) como equilibrio entre calidad y VRAM.
- Generación asistida con decodificación especulativa: la cabeza MTP embebida acelera la generación token a token en llama.cpp con `--spec-type draft-mtp`, útil en aplicaciones interactivas donde la latencia percibida importa (28-32 tok/s en tg128 según tier).
- Procesamiento de documentos con imágenes: el proyector de visión F16 (0,93 GB) permite añadir entrada multimodal a cualquier tier, adecuado para extracción de información de capturas, formularios o figuras.
- Evaluación comparativa de cuantizaciones: los siete tiers con backbone idéntico permiten medir el impacto aislado de la precisión de `lm_head`, embeddings y cabeza MTP sobre perplejidad y velocidad, útil para investigación en cuantización.
- Servicio de inferencia en producción con vLLM o llama.cpp server: el formato GGUF y la licencia Apache-2.0 facilitan el despliegue comercial en infraestructura propia, eligiendo el tier según el presupuesto de VRAM (13,83 a 18,33 GiB).
- Prototipado en hardware de gama alta consumer: el tier VERY-LOW (14,86 GB, 13,83 GiB de VRAM) permite ejecutar el modelo completo en una RTX 4090 con margen para contexto, con perplejidad de 3,8039.

## Benchmarks y rendimiento

Datos medidos por el autor de la conversión en llama.cpp (perplejidad, pp512 y tg128):

| Tier | Tamaño | PPL | VRAM | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|---|---|
| VERY-LOW | 14,86 GB | 3,8039 ± 0,09155 | 13,83 GiB | 2467,35 ± 24,84 | 32,39 ± 0,19 |
| COMPACT-LOW | 15,16 GB | 3,7894 ± 0,09109 | 14,11 GiB | 2471,50 ± 29,25 | 32,04 ± 0,19 |
| LOW | 15,53 GB | 3,7664 ± 0,09079 | 14,46 GiB | 2451,41 ± 27,79 | 31,70 ± 0,11 |
| MEDIUM | 16,38 GB | 3,7351 ± 0,08920 | 15,24 GiB | 2443,64 ± 26,61 | 30,58 ± 0,19 |
| MID-HIGH | 16,91 GB | 3,7686 ± 0,09051 | 15,74 GiB | 2461,06 ± 26,39 | 30,50 ± 0,20 |
| HIGH | 17,57 GB | 3,7351 ± 0,08920 | 16,35 GiB | 2403,77 ± 26,13 | 28,11 ± 0,06 |
| VERY-HIGH | 19,69 GB | 3,7522 ± 0,09004 | 18,33 GiB | 2352,72 ± 144,63 | 28,14 ± 0,08 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: de 13,83 GiB (VERY-LOW) a 18,33 GiB (VERY-HIGH), más el proyector de visión (0,93 GB) si se usa multimodalidad.
- GPU recomendadas: Blackwell sm_120 para aprovechar NVFP4 de forma nativa; RTX 4090/5090 (24 GB) cubren todos los tiers con margen para contexto; A100/H100 no aprovechan NVFP4 pero pueden ejecutar los tensores cuantizados por software.
- Cabe en GPU consumer: sí, todos los tiers caben en 24 GB; VERY-LOW y COMPACT-LOW podrían caber en 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (con `--spec-type draft-mtp` y `--mmproj` para visión), Ollama, servidores compatibles con endpoints GGUF; vLLM no soporta GGUF NVFP4 de forma nativa en la información disponible.
- Throughput medido: 2352-2471 tok/s en pp512 y 28-32 tok/s en tg128 según tier, en el hardware de pruebas del autor (no especificado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ScarletKc-2.0-NVFP4-GGUF | 27B denso | 262.144 | Apache-2.0 | GGUF NVFP4 | Familia de 7 tiers, MTP y visión |
| ScarletKc/ScarletKc-2.0 (base) | 27B denso | 262.144 | Apache-2.0 | safetensors | Modelo original sin cuantizar |
| Alternativas de 27B-32B en GGUF | ~27-32B | variable | variable | GGUF | No disponible en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- El emparejamiento del proyector de visión con los tiers está documentado pero no verificado en esta familia; la multimodalidad podría no funcionar correctamente.
- El soporte NVFP4 depende de hardware Blackwell (sm_120); en GPUs anteriores la decuantización degrada el rendimiento y puede alterar la calidad.
- No hay tier HIGHEST: la atención llega pre-cuantizada en NVFP4 y la recuantización desde NVFP4 está deshabilitada, lo que limita el techo de calidad recuperable.
- La perplejidad no mejora de forma monótona con el tamaño (MID-HIGH es peor que MEDIUM y HIGH empata con MEDIUM), lo que indica que el tier más grande no siempre es el mejor.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas: los metadatos solo declaran inglés y multilingüe sin listado; el rendimiento en castellano no está verificado.
- Los datos de rendimiento provienen de un único entorno de pruebas no especificado; la reproducibilidad en otro hardware no está garantizada.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento no están documentados en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/ScarletKc-2.0-NVFP4-GGUF
- Modelo base: https://huggingface.co/ScarletKc/ScarletKc-2.0
- Sitio del autor de la conversión: https://www.esatapedico.com
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
