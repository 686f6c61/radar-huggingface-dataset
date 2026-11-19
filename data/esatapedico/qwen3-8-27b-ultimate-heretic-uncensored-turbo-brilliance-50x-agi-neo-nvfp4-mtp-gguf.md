# esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-MTP-GGUF

## Resumen

Este repositorio no es un modelo original, sino una familia de siete cuantizaciones GGUF del tune `DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored`, a su vez derivado de Qwen3.8-27B. El autor de la conversión es `esatapedico`, que parte de su propio checkpoint NVFP4 de 256 tensores y genera una escalera de precisión para las cabezas de salida (`lm_head`), embeddings de tokens y cabeza MTP, manteniendo un backbone NVFP4 de 448 tensores byte a byte idéntico en todas las variantes. La arquitectura subyacente es un transformer denso híbrido de 27B con Gated DeltaNet combinado con Gated Attention cada cuarta capa, e incorpora una cabeza de decodificación especulativa MTP (multi-token prediction) integrada en cada fichero.

La relevancia práctica está en el empaquetado para Blackwell (sm_120): ofrece NVFP4 nativo en el backbone con cabezas en precisión seleccionable, decodificación especulativa sin drafter separado y un proyector de visión opcional. Los ficheros oscilan entre 14,86 GB y 19,69 GB, lo que permite desplegar un modelo nominal de 27B en GPUs de consumo de gama alta con llama.cpp.

Conviene señalar una discrepancia importante: la model card describe un modelo de 27B, pero el campo de parámetros reales del repositorio (safetensors) indica 460.730.096 parámetros. Esta ficha recoge ambos datos tal como aparecen, sin resolver la contradicción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet + Gated Attention cada cuarta capa, con cabeza MTP de decodificación especulativa embebida |
| Parámetros totales | 27B según la model card; 460.730.096 según el campo de safetensors del repo (dato contradictorio, no resuelto) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 en backbone; cabezas en Q2_K, Q3_K, IQ4_XS, Q4_K, Q5_0, Q6_K, Q8_0 y BF16 según tier; vectores `ssm_alpha` en F32 |
| Idiomas soportados | Inglés y multilingüe (sin listado detallado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (1.122 tensores por tier; 448 de backbone NVFP4 compartidos) |

## Arquitectura y entrenamiento

La model card describe el modelo base como un transformer denso híbrido de 27B que intercala capas de Gated DeltaNet con capas de Gated Attention cada cuatro capas, e incluye una cabeza MTP de predicción multi-token embebida en el propio checkpoint. Esta cabeza actúa como drafter para decodificación especulativa (`--spec-type draft-mtp`), de modo que no se necesita un modelo borrador externo. El backbone NVFP4 consta de 448 tensores idénticos en los siete ficheros (verificados con SHA-256 por tensor): 256 tensores cuantizados en la pasada de conversión NVFP4 y 192 normalizados a NVFP4 al construir los tiers. Los 48 vectores `ssm_alpha` se mantienen en F32.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineación, ni en el tune de DavidAU ni en el modelo Qwen3.8-27B subyacente. El autor de la conversión declara explícitamente que su aportación se limita a la numerología: conversión del checkpoint NVFP4 a GGUF y construcción de la escalera de precisión para las cabezas. La innovación técnica destacable es el empaquetado NVFP4 para Blackwell sm_120 con decodificación especulativa MTP integrada y una escalera de precisión que mantiene la perplejidad dentro de aproximadamente el 1,3 % de la cifra del modelo sin cuantizar.

## Capacidades

- Generación de texto y razonamiento general, heredados del tune Ultimate-Heretic Turbo-Brilliance-50x-AGI-NEO.
- Decodificación especulativa MTP integrada en todos los ficheros, sin drafter separado.
- Visión: el proyector `mmproj-BF16.gguf` (0,93 GB) se acopla a cualquier tier mediante `--mmproj`; el autor verifica respuesta a un prompt con imagen y parada natural en el tier MID-HIGH.
- Multilingüe, aunque la model card solo declara inglés y "multilingual" sin desglose.
- Compatibilidad con llama.cpp como runtime de referencia.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes o modo thinking explícito.

## Casos de uso

- Despliegue local en GPU Blackwell de consumo: los tiers de 14,86 a 16,91 GB permiten ejecutar un modelo nominal de 27B en tarjetas de 24 GB o menos con llama.cpp, usando NVFP4 para el backbone y cabezas en Q4/Q8.
- Servicio de inferencia con baja latencia: la cabeza MTP embebida permite activar decodificación especulativa sin cargar un modelo borrador adicional, lo que reduce el coste en VRAM y simplifica el despliegue.
- Experimentación con cuantización extrema: la escalera de siete tiers con backbone idéntico permite medir el impacto aislado de la precisión de `lm_head`, embeddings y cabeza MTP sobre la perplejidad, útil para investigación en cuantización.
- Tareas multimodales ligeras: acoplando `mmproj-BF16.gguf` se pueden procesar prompts con imagen en local, por ejemplo para descripción o extracción de información de capturas y documentos escaneados.
- Prototipado de asistentes conversacionales sin filtros: al tratarse de un tune "uncensored", encaja en entornos de investigación que requieren respuestas sin rechazo, siempre con revisión humana.
- Evaluación comparativa de despliegues NVFP4 frente a GGUF clásicos: el repositorio sirve como banco de pruebas para medir throughput y perplejidad en sm_120 frente a cuantizaciones K-quant convencionales.
- Generación de texto creativo y roleplay: el ajuste "Heretic" del modelo base está orientado a este tipo de contenido, y los tiers de mayor precisión (HIGH, VERY-HIGH) conservan cabezas en BF16.

## Benchmarks y rendimiento

El autor publica únicamente perplejidad sobre un corpus de fuentes diversas (menor es mejor):

| Tier | Perplejidad |
|---|---|
| VERY-LOW | 3,2874 ± 0,07455 |
| COMPACT-LOW | 3,2841 ± 0,07468 |
| LOW | 3,2751 ± 0,07442 |
| MEDIUM | 3,2596 ± 0,07381 |
| MID-HIGH | 3,2569 ± 0,07359 |
| HIGH | 3,2602 ± 0,07384 |
| VERY-HIGH | 3,2441 ± 0,07320 |

La referencia sin cuantizar es 3,2445, de modo que toda la escalera se mantiene dentro de aproximadamente el 1,3 % de esa cifra. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 14,86 GB (VERY-LOW) y 19,69 GB (VERY-HIGH) solo para los pesos; hay que sumar el contexto KV y, si se usa visión, 0,93 GB del proyector.
- GPU objetivo: Blackwell sm_120, por el soporte NVFP4 nativo; el autor menciona explícitamente esta arquitectura.
- GPU de consumo: los tiers bajos y medios caben en tarjetas de 24 GB (RTX 4090, RTX 5090); los tiers HIGH y VERY-HIGH dejan menos margen para contexto largo.
- Despliegue: llama.cpp, con `--spec-type draft-mtp` para la decodificación especulativa y `--mmproj` para visión. No se documentan integraciones con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles; el autor no publica medidas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (Qwen3.8-27B Ultimate-Heretic NVFP4-MTP-GGUF) | 27B (card) / 460,7M (safetensors) | No disponible | GGUF NVFP4 | Apache 2.0 | Siete tiers, MTP embebido, visión opcional, orientado a Blackwell |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27B | No disponible | No disponible | No disponible | Modelo base del tune; sin cuantizar |
| esatapedico/Qwen3.8-27B-...-NVFP4 | 27B | No disponible | NVFP4 (256 tensores) | Apache 2.0 | Checkpoint clásico del que se parte |
| esatapedico/Qwen3.8-27B-...-NVFP4-W4A16-T400 | 27B | No disponible | NVFP4 W4A16 (400 tensores) | Apache 2.0 | Variante de serving W4A16 |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de tamaño: la model card indica 27B, pero el campo de parámetros del repo indica 460,7 millones. Verificar antes de dimensionar hardware.
- Modelo "uncensored": el tune está diseñado para reducir rechazos, lo que aumenta el riesgo de contenido inapropiado, dañino o sesgado; requiere filtros y supervisión en producción.
- Riesgo de alucinación propio de un modelo de lenguaje de este tamaño, agravado por la cuantización NVFP4 del backbone.
- La licencia Apache 2.0 se declara en el repo, pero el modelo base y el tune intermedios pueden tener condiciones propias; conviene revisar la cadena completa antes de uso comercial.
- Dependencia de Blackwell sm_120 para aprovechar NVFP4; en otras arquitecturas el rendimiento puede degradarse.
- No hay información sobre longitud de contexto real, idiomas soportados con detalle ni calidad de tool calling.
- La perplejidad publicada no sustituye a evaluaciones de tareas; no hay benchmarks de razonamiento, código o matemáticas.
- El autor advierte que su aportación es solo la conversión numérica; la calidad del modelo depende de los eslabones superiores de la cadena.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-MTP-GGUF
- Modelo base del tune: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Checkpoint NVFP4 de 256 tensores: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4
- Checkpoint W4A16 de 400 tensores: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-W4A16-T400
- Sitio del autor: https://www.esatapedico.com
