# esatapedico/Inkling-2-Mini-NVFP4-GGUF

## Resumen

Inkling-2-Mini-NVFP4-GGUF es una familia de seis cuantizaciones GGUF del modelo base thinkingmachines/Inkling-2-Mini, un transformer híbrido MoE de 26.400 millones de parámetros (26,4B) con torre de visión nativa y licencia Apache-2.0. La conversión la firma el usuario esatapedico, mientras que el modelo original pertenece a Thinking Machines. El interés de esta publicación no está en el modelo en sí, sino en el trabajo de cuantización: un núcleo de 40 tensores de expertos en NVFP4 (formato de 4 bits de NVIDIA para arquitecturas Blackwell) que se mantiene idéntico en las seis variantes, con una escalera de precisión que solo mueve atención, embeddings y cabeza de salida.

El modelo resuelve un problema práctico: servir un MoE de 26,4B en hardware de consumo. Con 8 de 128 expertos activos por token, los expertos concentran el 80% de los bytes y se quedan a 4 bits en todas las variantes, de modo que los ficheros van de 20,72 GB a 22,92 GB en lugar de abrirse en un abanico de decenas de gigabytes como haría una familia densa. El resultado se sirve en unos 22-23 GiB de VRAM antes de contar el contexto y decodifica a 5,7-6,0 tok/s en dos tarjetas de 16 GB, lo que lo hace viable en equipos de consumo con doble GPU.

La arquitectura es singular: 24 capas con las 12 centrales aplicadas tres veces (arquitectura en bucle), atención híbrida local y global, y una ventana de contexto de 1.048.576 tokens según la metadata del GGUF original. Los ficheros requieren llama.cpp en master `225a5345` o superior, con soporte para `inkling2_loop` y los arreglos de re-escalado (#32704) y slots de escala gate_up (#32657); sin ellos, el modelo no carga o produce texto incoherente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención local y global, arquitectura en bucle (12 de 24 capas aplicadas 3 veces) y torre de visión nativa; tipo GGUF `inkling2_loop` |
| Parametros totales | 26.070.390.272 (26,07B) |
| Parametros activos | 8 de 128 expertos por token (el número exacto de parámetros activos no está disponible) |
| Longitud de contexto | 1.048.576 tokens (según metadata del GGUF original) |
| Tipos de cuantizacion | NVFP4 en el núcleo de expertos (40 tensores); escalera por variante: atención Q4_K/Q6_K/Q8_0/BF16, token_embd Q2_K/Q4_K/Q6_K/Q8_0/BF16, lm_head Q2_K/Q4_K/Q5_0/Q6_K/BF16; capas 20-23 en BF16; proyector de visión F16 |
| Idiomas soportados | Inglés y multilingüe (según etiquetas del autor; no se detalla la lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (744 tensores por variante: 40 NVFP4, 518 F32, 186 BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de mezcla de expertos con 24 capas, de las cuales las 12 centrales (de la 6 a la 18) se aplican tres veces en bucle, un patrón de reutilización de profundidad que reduce el número de parámetros frente a un modelo denso de profundidad equivalente. La atención combina mecanismos locales y globales. Cada token activa 8 de 128 expertos. El modelo incorpora además una torre de visión nativa, servida en esta publicación mediante el proyector `mmproj-Inkling-2-Mini-F16.gguf` (0,64 GB, 422 tensores).

El detalle de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no está disponible en la información proporcionada. Lo que sí documenta el autor es el proceso de cuantización: los expertos de las capas 0-19 se reempaquetan desde el checkpoint a `block_nvfp4` de GGML con sus escalas F32 por experto (20 para gate_up y 20 para down), mientras que las capas 20-23 llegan en MXFP4 y se convierten a BF16 en todos los ficheros. Las seis variantes comparten el mismo backbone de 40 tensores NVFP4, verificado tensor a tensor contra el original (646 regiones idénticas, 98 diferencias intencionadas, 0 diferencias de dimensión), y solo difieren en la precisión de atención, embeddings y cabeza de salida.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo de pensamiento (thinking) que termina correctamente según las pruebas de humo del autor.
- Comprensión de imágenes mediante el proyector de visión (probado con una sonda de cuadrado rojo que devolvió "Red").
- Soporte multilingüe según las etiquetas del autor, con inglés como idioma principal declarado.
- Contexto muy largo: hasta 1.048.576 tokens según la metadata del modelo base.
- Mezcla de expertos con 8 de 128 activos por token, lo que reduce el coste de inferencia frente a un denso de tamaño comparable.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Asistente conversacional local con contexto largo: la ventana de 1.048.576 tokens permite mantener historiales extensos o documentos completos en memoria, con un coste de VRAM de 22-23 GiB antes de contexto en dos GPU de 16 GB.
- Procesamiento de documentos largos con componente visual: el par GGUF más `mmproj` permite pasar páginas escaneadas o capturas junto con texto y preguntar sobre ellas en una sola sesión.
- Despliegue en estaciones de trabajo con doble GPU de consumo: las seis variantes caben en 22-23 GiB, lo que habilita inferencia local de un MoE de 26B sin hardware de centro de datos.
- Experimentación con cuantización NVFP4 en Blackwell: el repositorio sirve como referencia reproducible de reempaquetado nativo a `block_nvfp4` con escalas por experto, útil para quien investigue formatos de 4 bits en llama.cpp.
- Evaluación comparativa de precisión: la escalera de seis niveles con perplejidad medida (de 3,5395 en VERY-LOW a 3,3941 en VERY-HIGH) permite estudiar el impacto de cuantizar atención, embeddings y cabeza de salida por separado.
- Prototipado de aplicaciones multilingües con requisitos de privacidad: al ejecutarse en local, los datos no salen del equipo, algo relevante para documentos sensibles en inglés y otros idiomas.

## Benchmarks y rendimiento

El autor publica perplejidad (PPL) y métricas de llama.cpp (pp512 y tg128) por variante. No hay resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Variante | Tamano | PPL | VRAM | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|---|---|
| VERY-LOW | 20,72 GB | 3,5395 ± 0,08161 | 22,14 GiB | 397,15 ± 54,83 | 5,98 ± 0,02 |
| LOW | 21,06 GB | 3,3958 ± 0,07584 | 22,35 GiB | 372,66 ± 88,58 | 5,97 ± 0,07 |
| MEDIUM | 21,24 GB | 3,3900 ± 0,07574 | 22,40 GiB | 416,46 ± 10,32 | 5,92 ± 0,08 |
| MID-HIGH | 21,41 GB | 3,3962 ± 0,07628 | 22,56 GiB | 396,27 ± 61,43 | 5,87 ± 0,07 |
| HIGH | 21,52 GB | 3,3944 ± 0,07604 | 22,56 GiB | 413,28 ± 25,68 | 5,88 ± 0,07 |
| VERY-HIGH | 22,92 GB | 3,3941 ± 0,07601 | 23,46 GiB | 397,41 ± 40,31 | 5,74 ± 0,10 |

La variante original de referencia (ORIG) reporta PPL 3,3941 ± 0,076. Todas las variantes pasaron la prueba de humo con terminación del modo thinking y contenido real.

## Requisitos de hardware

- VRAM estimada: entre 22,14 GiB (VERY-LOW) y 23,46 GiB (VERY-HIGH) antes de contar el contexto; el autor reporta un consumo de servicio de unos 22-23 GiB.
- GPU recomendadas: el formato NVFP4 apunta a arquitecturas Blackwell (sm_120); el autor probó el despliegue en dos tarjetas de 16 GB, lo que sugiere GPUs de consumo de la generación RTX 50 o similar. No se detalla el modelo exacto de las tarjetas.
- Cabe en GPU de consumo: sí, en configuración de dos GPU de 16 GB según el autor; no se documenta una configuración de una sola tarjeta.
- Despliegue: llama.cpp en master `225a5345` o superior, con soporte `inkling2_loop`, el arreglo de re-escalado del bucle (#32704) y los slots de escala gate_up (#32657). El proyector de visión se carga con `--mmproj`.
- Latencia y throughput: decodificación de 5,7-6,0 tok/s (tg128) y prefill de 372-416 tok/s (pp512) en la configuración probada por el autor.
- Nota sobre el conversor: el conversor estándar de master dequantiza los expertos FP4 (una prueba ORIG salió a 49 GB sin tensores NVFP4), por lo que reproducir estos ficheros exige aplicar el parche `scripts/inkling2_native_nvfp4.port.patch` (86 líneas) a `conversion/inkling2.py`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. A continuación se comparan únicamente los parámetros estructurales conocidos frente al propio modelo base y su formato original.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-NVFP4-GGUF (esta publicacion) | 26,07B (8/128 expertos activos) | 1.048.576 | GGUF NVFP4, 20,7-22,9 GB | Apache-2.0 | Hugging Face |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B (8/128 expertos activos) | 1.048.576 | Pesos originales (no detallado) | Apache-2.0 | Hugging Face |
| Inkling-2-Mini-NVFP4-ORIG.gguf (referencia del autor) | 26,07B | 1.048.576 | GGUF NVFP4, 22,92 GB | Apache-2.0 | Hugging Face |

No se dispone de información sobre alternativas de otros desarrolladores con las que comparar rendimiento.

## Limitaciones y advertencias

- Dependencia estricta de versión: sin llama.cpp en master `225a5345` o superior y sin los parches #32704 y #32657, los ficheros fallan al cargar o generan texto incoherente.
- El formato NVFP4 está orientado a Blackwell (sm_120); en arquitecturas anteriores el soporte puede no existir o degradarse.
- La decodificación a 5,7-6,0 tok/s es lenta para uso interactivo en producción; el prefill es aceptable pero la generación token a token limita la experiencia.
- La ventana de 1.048.576 tokens es la del modelo base; el consumo real de VRAM con contexto largo no está documentado y probablemente exceda los 22-23 GiB reportados sin contexto.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; como todo modelo generativo, puede producir contenido plausible pero incorrecto.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Idiomas: las etiquetas declaran inglés y multilingüe, pero no se especifica qué idiomas ni su calidad; el castellano no está confirmado explícitamente.
- Tool calling y uso agéntico: no se documenta soporte, por lo que no debe asumirse en producción.
- La licencia Apache-2.0 permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre el comportamiento del modelo convertido.
- El repositorio tiene 951 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/Inkling-2-Mini-NVFP4-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Sitio del autor de la cuantización: https://www.esatapedico.com
- Repositorio de llama.cpp (requerido en master `225a5345` o superior): no se proporciona enlace directo en la información disponible
- Parche de conversión `scripts/inkling2_native_nvfp4.port.patch`: referenciado en la model card, sin URL directa en la información disponible
