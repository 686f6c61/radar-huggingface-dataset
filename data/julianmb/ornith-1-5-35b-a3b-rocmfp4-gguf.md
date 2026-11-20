# julianmb/Ornith-1.5-35B-A3B-ROCmFP4-GGUF

## Resumen

Ornith-1.5-35B-A3B-ROCmFP4-GGUF es una cuantización de tipo ROCmFP4 del modelo Ornith 1.5 35B-A3B, publicada por el usuario julianmb. El modelo base lo desarrolla ornith-ai y emplea una arquitectura Mixture of Experts (MoE) identificada como `qwen35moe`, con 35.505.251.456 parámetros totales, 41 bloques más un bloque `nextn` de Multi-Token Prediction (MTP), dimensión de modelo 2048 y 256 expertos. Incluye además un proyector de visión, por lo que es multimodal.

La relevancia de esta ficha concreta no está en el modelo en sí, sino en el trabajo de cuantización: un preset denominado `Q4_0_ROCMFP4_STRIX_LEAN` optimizado para GPUs AMD Strix Halo (`gfx1151`) y RDNA 3.5, que reduce el peso a 17,74 GiB (19,05 GB) con 4,29 bits por peso y mantiene un contexto máximo de 262.144 tokens. El autor reporta 100,96 tok/s en decodificación con decodificación especulativa MTP sobre un Ryzen AI Max+ 395 con Radeon 8060S, frente a 71,5–71,7 tok/s de la cuantización Q4_K_M del repositorio base.

Es un artefacto de interés para quienes despliegan modelos MoE grandes en hardware AMD integrado con memoria unificada, un nicho donde las cuantizaciones convencionales de llama.cpp no aprovechan las instrucciones FP4 de RDNA 3.5. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (MoE híbrida con atención lineal Gated Delta Net), 41 bloques + 1 bloque `nextn` (MTP), d_model 2048, 256 expertos |
| Parametros totales | 35.505.251.456 (35,51 B) |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3 B activos, no confirmado en la información) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | ROCmFP4 (ggml types 100 y 101), Q5_K para `token_embd`, F32 para normas, q8_0 para `eh_proj` del bloque MTP; 4,29 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero de 17,74 GiB / 19,05 GB) + `mmproj-Ornith-1.5-35B-BF16.gguf` (0,84 GiB) para visión |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención híbrida: combina capas de atención convencional con capas de atención lineal basadas en Gated Delta Net, según se deduce del bug de estado recurrente citado en la model card (issue #29092 de llama.cpp). Cuenta con 256 expertos y una dimensión de modelo de 2048, lo que da un ratio de expansión elevado típico de los MoE recientes. Incorpora un bloque `nextn` adicional que implementa Multi-Token Prediction, usado como cabecera de draft para decodificación especulativa; la revisión de agosto de 2026 retrenó esa cabecera y el autor reporta una tasa de aceptación del 87,0 %.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card de esta cuantización tampoco detalla el proceso de alineación del modelo base. La innovación técnica destacable del artefacto es la propia cuantización: el preset coloca el 97,00 % de los parámetros en ROCmFP4 de escala simple (incluido `output.weight`), el 1,48 % de los parámetros de clave/valor de atención en una variante ROCmFP4 de doble escala, el embedding de tokens en Q5_K, todas las normas en F32 y el `eh_proj` del bloque MTP en q8_0. La fuente es la cuantización Q8_0 del repositorio base con `allow-requantize`.

## Capacidades

- Generación de texto conversacional multi-turno, con contexto de hasta 256K tokens.
- Razonamiento y matemáticas: capacidad esperable en un modelo de 35 B, aunque no se publican benchmarks en la información disponible.
- Generación de código: no hay datos específicos publicados para esta variante.
- Visión: multimodal, mediante el proyector `mmproj-Ornith-1.5-35B-BF16.gguf`; permite entrada de imágenes junto con texto.
- Decodificación especulativa con MTP: el bloque `nextn` actúa como cabecera de draft, con parámetros recomendados `--spec-type draft-mtp --spec-draft-n-max 2 --spec-draft-p-min 0.6`.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de la infraestructura de Inference Endpoints de Hugging Face.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no lista idiomas.

## Casos de uso

- Despliegue local en hardware AMD Strix Halo: el caso de uso principal del artefacto. Un equipo con Ryzen AI Max+ 395 y Radeon 8060S puede servir el modelo a ~101 tok/s usando memoria unificada, sin GPU discreta, gracias a los 17,74 GiB del fichero cuantizado.
- Asistentes conversacionales de contexto largo: con 262.144 tokens de ventana, el modelo puede mantener conversaciones o procesar documentos extensos (manuales, expedientes, bases de código) sin truncar, siempre que se gestione el bug de estado recurrente descrito más abajo.
- Procesamiento de documentos con imágenes: el proyector de visión permite extraer información de capturas, diagramas o páginas escaneadas combinándolas con instrucciones textuales en la misma petición.
- Prototipado e investigación en entornos con VRAM limitada: al ocupar 17,74 GiB, cabe en configuraciones de 24 GB o en sistemas de memoria unificada de 32 GB o más, lo que permite experimentar con un MoE de 35 B en estaciones de trabajo modestas.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad y la ganancia de velocidad de ROCmFP4 frente a Q4_K_M (20,22 GiB, 71,5–71,7 tok/s) en el mismo hardware.
- Generación de código asistida en local: integrable en un servidor llama.cpp compatible con la API de OpenAI y conectable a editores o CLIs, aunque la calidad en código no está documentada con benchmarks en esta ficha.
- Servicio de inferencia por lotes con contexto largo: la ventana de 256K y el throughput de ~100 tok/s permiten resumir o clasificar lotes de documentos largos en una sola máquina, con la advertencia de que la reproducibilidad entre peticiones no está garantizada en la versión actual del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de rendimiento de decodificación en AMD Ryzen AI Max+ 395 con Radeon 8060S, Mesa RADV Wave64, sin decodificación especulativa salvo donde se indica:

| Configuracion | Tamano | Decodificacion | Salida reproducible |
|---|---|---|---|
| ROCmFP4 + MTP `n2 p0.6` (recomendada) | 17,74 GiB | 100,96 tok/s | 2 variantes, semánticamente idénticas |
| ROCmFP4 sin decodificación especulativa | 17,74 GiB | 76,9 tok/s | No, ≥7 variantes |
| Q4_K_M (repositorio base) | 20,22 GiB | 71,5–71,7 tok/s | No medido |
| ROCmFP4 + MTP `n4 p0.6` | 17,74 GiB | 102,77 tok/s | No, ≥5 variantes aleatorias |

La cuantización ROCmFP4 resulta un 7,3–7,6 % más rápida y un 12,3 % más pequeña que la Q4_K_M del repositorio base, según el autor. La cabecera MTP retrenada alcanza un 87,0 % de aceptación.

## Requisitos de hardware

- VRAM o memoria unificada: 17,74 GiB para los pesos, más 0,84 GiB del proyector de visión si se usa multimodalidad, más la caché KV correspondiente al contexto configurado. Con 256K tokens de contexto la caché KV crece de forma significativa y exige planificación aparte.
- GPU objetivo: AMD Strix Halo (`gfx1151`) y RDNA 3.5. El formato ROCmFP4 está pensado para estas arquitecturas y no es portable a CUDA sin reconvertir.
- Hardware medido: AMD Ryzen AI Max+ 395 con Radeon 8060S, Mesa RADV Wave64.
- GPU consumer: cabe en sistemas de memoria unificada de 32 GB o más. No se dispone de datos de funcionamiento en GPUs NVIDIA consumer con este fichero concreto.
- Opciones de despliegue: llama.cpp (runtime de referencia, con soporte de `--spec-type draft-mtp`), y por extensión servidores compatibles con la API de OpenAI. vLLM, TGI y Ollama no están confirmados para este formato en la información disponible.
- Throughput: 100,96 tok/s con MTP `n2 p0.6`; 76,9 tok/s sin decodificación especulativa; 102,77 tok/s con MTP `n4 p0.6` pero con salidas no reproducibles.
- Integridad: SHA256 de los pesos `0f907917a1bfe4e0ca0d281e5709dcf34b6277063e94fab29491bb5c80fda696`; del proyector `d9ce31026d1cb1f3f8d5152e2e2a014d9d2b302b6c93a7dc07bb0a0487f52837`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B ROCmFP4 (esta ficha) | 35,51 B | 262.144 | GGUF ROCmFP4, 17,74 GiB | Apache 2.0 | Optimizado para Strix Halo; 100,96 tok/s con MTP |
| Ornith-1.5-35B-A3B Q4_K_M (repo base) | 35,51 B | 262.144 | GGUF Q4_K_M, 20,22 GiB | Apache 2.0 | Referencia del autor; 71,5–71,7 tok/s en el mismo hardware |
| Otras cuantizaciones del mismo modelo base | 35,51 B | 262.144 | GGUF (varias) | Apache 2.0 | No disponibles en detalle en la información proporcionada |
| Modelos MoE de tamano comparable de otros fabricantes | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

No se dispone de información sobre modelos alternativos de otros desarrolladores con los que comparar parámetros, contexto y rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Bug de estado recurrente: con un servidor reutilizado entre peticiones, la salida no es reproducible. El mismo prompt puede devolver texto distinto según lo ejecutado antes y degenerar en repeticiones (`分割线`, `mesh mesh mesh`, `恒 恒 恒`). La causa probable es el issue #29092 de llama.cpp: el estado recurrente de Gated Delta Net no se limpia por completo entre peticiones en un slot reutilizado. Afecta al runtime, no a los pesos, y no es específico de esta cuantización.
- La decodificación especulativa MTP, paradójicamente, reduce la degeneración: la configuración `--spec-type draft-mtp --spec-draft-n-max 2 --spec-draft-p-min 0.6` es la única probada que converge. `--spec-mtp-strict-qwen` es opcional con `n-max 2`, pero necesario con drafts más profundos.
- La cabecera MTP retrenada requiere esta revisión base concreta; no debe injertarse en cuantizaciones anteriores.
- Compatibilidad limitada: el formato ROCmFP4 y `general.file_type` 106 son específicos de un fork de llama.cpp. No funciona en runtimes estándar ni en GPUs NVIDIA sin reconversión.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de lenguaje.
- Sesgos conocidos: no documentados.
- Idiomas: no documentados; no se puede confirmar el soporte de castellano ni de otras lenguas.
- Uso comercial: permitido por Apache 2.0, sin restricciones adicionales indicadas, pero conviene verificar la licencia del modelo base en su repositorio de origen.
- Producción: la falta de reproducibilidad entre peticiones es un bloqueo serio para pipelines que requieran determinismo o auditoría. Hasta que se resuelva el issue del runtime, conviene reiniciar el servidor o aislar slots por petición.
- Integridad: el fichero `SHA256SUMS` estuvo desactualizado hasta el 27 de septiembre de 2026; si se verificó antes de esa fecha y se obtuvo un fallo, la descarga era correcta. El checksum de la tabla de la model card siempre fue el válido. Existe `verify_card.py` para comprobar cabecera GGUF y OIDs LFS sin descargar los pesos.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/julianmb/Ornith-1.5-35B-A3B-ROCmFP4-GGUF
- Modelo base (GGUF): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Script de verificación: https://huggingface.co/julianmb/Ornith-1.5-35B-A3B-ROCmFP4-GGUF/blob/main/verify_card.py
- Issue de llama.cpp sobre el estado recurrente de Gated Delta Net: https://github.com/ggml-org/llama.cpp/issues/29092
