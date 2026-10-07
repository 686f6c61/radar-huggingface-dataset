# nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer

## Resumen

Este repositorio contiene el modelo Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO en formato GGUF y NInfer, publicado por el usuario nerkyor. Se trata de un modelo de 27.320.697.856 parámetros derivado de Qwen3.8-27B, que ha pasado por varias rondas alternas de SFT y RLOO sobre una base ya post-entrenada con SFT y SimPO. La licencia es apache-2.0 y solo se declaran los idiomas inglés y chino.

El problema que aborda es concreto: el modelo base, tras alcanzar una respuesta local correcta, seguía re-derivando con patrones del tipo Wait / Actually hasta agotar el contexto de 94K sin emitir respuesta final. El objetivo de entrenamiento, denominado EfficientThink, consiste en eliminar esas colas improductivas de razonamiento sin penalizar el razonamiento largo cuando es necesario. El resultado declarado por el autor es Coder390, con puntuaciones de 178/198 en GPQA, 445/500 en MMLU y 90/100 en LCB en su versión FP8 dinámica.

El repositorio incluye tres cuantizaciones (Q2 LynnStyle, Q6_K y Q8_0) con cabezal MTP integrado para decodificación especulativa, lo que permite velocidades declaradas de entre 174,8 y 521,0 tokens por segundo según el motor y el ancho de contexto. Es relevante para quien necesite ejecutar un modelo de razonamiento y código en hardware de consumo, aunque el modelo tiene 0 descargas y 0 likes, y todos los resultados proceden del propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la detalla; el modelo deriva de Qwen3.8-27B) |
| Parámetros totales | 27.320.697.856 (incluye el cabezal MTP, según el denominador de BPW usado por el autor) |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | aproximadamente 94.000 tokens (límite de "94K" citado en la model card) |
| Tipos de cuantización | Q2 LynnStyle (BPW 3,89, con cabezal MTP Q4 integrado), Q6_K (BPW 6,79) y Q8_0 (BPW 8,51); el repositorio principal añade BF16, FP8 estático y dinámico, NVFP4, NInfer W4A4 e INT8 W8A8 |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (carpeta `GGUF/`) y NInfer (carpeta `GGUF-NInfer/`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo, solo su linaje. El punto de partida es Qwen3.8-27B oficial (177/198 en GPQA, 444/500 en MMLU y 83/100 en LCB), sobre el que se aplicó un SFT con SimPO110 que dio lugar a la base EfficientThink (171/442/89). Sobre esa base se encadenaron un SFT de continuación K3, un SFT de segunda semana (week2dose, update-225), una primera ronda de RLOO con 182 grupos, otra ronda de SFT (merge-sft-100) que produjo sft-base-rloo (177/448/90) y una segunda ronda de RLOO con 172 grupos, que da el resultado final Coder390 (178/445/90). Los conjuntos de datos de respuesta correcta y las trayectorias de profesor se atribuyen, según la nomenclatura del autor, a Opus5.5 y GPT6Astra, mientras que DSV4Pro y K3 aportaron trayectorias y K3 realizó además la revisión del valor en RLOO.

El entrenamiento con RLOO muestreó 8 trayectorias por problema y conservó únicamente los grupos que contenían trayectorias correctas e incorrectas (los grupos con todas correctas se descartaron). Los grupos con 0 o 1 trayectoria correcta recibieron una trayectoria corta de profesor revisada, que sustituyó a la trayectoria incorrecta más corta (27 grupos). El conjunto final quedó en 172 grupos y 1.376 trayectorias: 859 correctas y 517 incorrectas, incluidas 68 respuestas vacías. La función de recompensa penaliza solo las trayectorias incorrectas, de modo que el razonamiento largo correcto sigue recibiendo recompensa positiva y no se suprime. En cuanto a inferencia, los paquetes GGUF y NInfer incorporan un cabezal MTP (multi-token prediction) para decodificación especulativa; el paquete Q2 LynnStyle usa MTP Q4 integrado, no Q8. La visión no está incluida en estos paquetes y requiere un mmproj externo.

## Capacidades

- Generación de texto conversacional, con pipeline declarado `text-generation` y etiqueta `conversational`.
- Razonamiento prolongado con modo de pensamiento: la model card reporta percentiles de tokens de razonamiento (P50, P70 y P90) para GPQA, MMLU y LCB.
- Codificación reforzada: la parte "Coder" del nombre indica entrenamiento específico para código, con 90-91/100 en LCB en todas las cuantizaciones publicadas.
- Matemáticas y razonamiento científico: evaluado con MMLU y GPQA en conjuntos completos de 100K.
- Decodificación especulativa mediante cabezal MTP integrado en cada paquete de cuantización.
- Capacidades multilingües limitadas a inglés y chino según el campo `language` de la model card.
- Modelo etiquetado como `uncensored`, lo que implica un filtrado de rechazos reducido respecto a un modelo alineado convencional.
- Soporte de visión solo en el repositorio principal mediante mmproj externo, no en los paquetes GGUF/NInfer de este repositorio.
- No se documenta en la información disponible soporte de tool calling, function calling ni orquestación de agentes.

## Casos de uso

- Asistente de código en local: las cuantizaciones Q2 LynnStyle (13,28 GB) y Q6_K (23,18 GB) permiten ejecutar un modelo de 27B con 90/100 en LCB en una estación de trabajo con una sola GPU de 24-48 GB, integrándolo en el editor mediante llama.cpp.
- Razonamiento científico de contexto largo: con 94.000 tokens de ventana, el modelo puede procesar artículos completos o documentación extensa y resolver preguntas tipo GPQA sin truncar el material de partida.
- Sustitución de APIs en entornos con requisitos de privacidad: al ser pesos abiertos con licencia apache-2.0, puede desplegarse en infraestructura propia sin enviar código o datos a terceros.
- Generación de código en pipelines de CI/CD: la cuantización Q8_0 con MTP alcanza 190,8 tok/s en llama.cpp con C4, lo que hace viable la generación automática de parches y tests en un runner con GPU.
- Servicio de alto rendimiento en NInfer: con NInfer + C8 + MTP se declaran 486,3 tok/s en Q8 y 521,0 tok/s en Q2, cifras adecuadas para servir varios usuarios concurrentes en una sola GPU.
- Investigación sobre control del razonamiento: el modelo es un caso de estudio del problema de no detenerse, con datos de RLOO (172 grupos, 1.376 trayectorias) y una comparativa explícita de percentiles de tokens de pensamiento frente al modelo original.
- Evaluación comparativa de cuantizaciones: permite medir la degradación real de GPQA, MMLU y LCB entre Q2, Q6_K y Q8_0, con MMLU cayendo de 448 (Q6_K) a 433 (Q2 LynnStyle).
- Aplicaciones en chino e inglés: la cobertura declarada se limita a estos dos idiomas, por lo que cualquier despliegue en otras lenguas requiere validación previa.

## Benchmarks y rendimiento

Resultados declarados por el autor, con conjuntos completos bajo el mismo protocolo de 100K en llama.cpp con C4.

| Versión | GPQA (/198) | MMLU (/500) | LCB (/100) |
|---|---:|---:|---:|
| Qwen3.8-27B oficial (FP8) | 177 | 444 | 83 |
| EfficientThink base (SFT + SimPO) | 171 | 442 | 89 |
| sft-base-rloo | 177 | 448 | 90 |
| Coder390 (FP8 dinámico) | 178 | 445 | 90 |
| Coder390 Q6_K (este repositorio) | 174 | 448 | 91 |
| Coder390 Q8_0 (este repositorio) | 171 | 443 | 90 |
| Coder390 Q2 LynnStyle (este repositorio) | 177 | 433 | 90 |

Tokens de razonamiento (P50 / P70 / P90):

| Versión | GPQA | MMLU | LCB |
|---|---|---|---|
| Coder390 Q2 LynnStyle | 2.989,5 / 8.923,8 / 27.156,1 | 181 / 326,3 / 1.020,5 | 5.656,5 / 17.835,8 / 40.067,3 |
| Coder390 Q8_0 | 3.102,5 / 7.971 / 28.891,6 | 164 / 291 / 741 | 4.098,5 / 16.087,8 / 39.135,5 |
| Qwen3.8-27B oficial (FP8), GPQA | 5.299 / 12.607 / 50.577 | no disponible | no disponible |

Rendimiento de inferencia declarado:

| Configuración | Tokens por segundo |
|---|---:|
| Q2 LynnStyle, NInfer + C8 + MTP (agregado) | 521,0 |
| Q2 LynnStyle, llama.cpp MTP C4 | 174,8 |
| Q8_0, NInfer + C8 + MTP (agregado) | 486,3 |
| Q8_0, llama.cpp Q8 MTP C4 | 190,8 |

No hay resultados de benchmarks independientes ni publicados por terceros en la información disponible.

## Requisitos de hardware

- Tamaño de pesos por cuantización (según el autor): Q2 LynnStyle 13.276.009.792 bytes (13,28 GB) en GGUF y 13.272.798.720 bytes (13,27 GB) en NInfer; Q6_K 23.177.516.640 bytes (23,18 GB) en GGUF; Q8_0 29.069.202.688 bytes (29,07 GB) en GGUF y 29.065.983.488 bytes (29,07 GB) en NInfer.
- Las cifras anteriores son solo pesos. Hay que añadir el coste de la caché KV para los 94.000 tokens de contexto, que la model card no cuantifica, por lo que la VRAM total necesaria no está disponible.
- Estimación orientativa a partir del tamaño de archivo: Q2 LynnStyle cabe en GPUs de 16-24 GB (RTX 4080, RTX 4090, RTX 5090) con contexto moderado; Q6_K encaja justo en 24 GB o con holgura en 32-48 GB (RTX 6000 Ada, L40S, A6000); Q8_0 requiere 32-48 GB o más (A100 40 GB, L40S 48 GB, H100).
- Para contexto cercano a 94K habrá que reservar VRAM adicional para la caché KV y reducir el tamaño de lote; no se proporcionan medidas concretas.
- Motores de despliegue: llama.cpp (referenciado explícitamente en las pruebas) y NInfer, el runtime asociado a la librería declarada en HuggingFace. Los pesos GGUF son compatibles con el ecosistema llama.cpp, pero vLLM y TGI no consumen GGUF, de modo que para esos motores habría que usar los pesos BF16, FP8, NVFP4, W4A4 o INT8 W8A8 del repositorio principal.
- Decodificación especulativa: cada paquete incorpora su cabezal MTP (Q4 en Q2 LynnStyle, Q8 en Q6_K y Q8_0), lo que permite activar decodificación especulativa sin modelo borrador externo.
- Rendimiento declarado: 521,0 tok/s (Q2, NInfer, C8, MTP), 486,3 tok/s (Q8_0, NInfer, C8, MTP), 190,8 tok/s (Q8_0, llama.cpp, MTP, C4) y 174,8 tok/s (Q2, llama.cpp, MTP, C4). No se especifican la GPU ni el hardware usados en estas mediciones.
- El repositorio completo ocupa 117,7 GB, por lo que conviene descargar solo la carpeta de la cuantización necesaria.

## Comparativa con modelos similares

La información disponible solo permite comparar las distintas versiones del propio linaje y las cuantizaciones del mismo modelo. No se aportan datos de modelos externos de la misma categoría.

| Modelo | Cuantización | Tamaño | Contexto | GPQA / MMLU / LCB | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Coder390 GGUF (este repositorio) | Q2 LynnStyle + MTP Q4 | 13,28 GB | ~94K | 177 / 433 / 90 | apache-2.0 | HuggingFace |
| Coder390 GGUF (este repositorio) | Q6_K + MTP Q8 | 23,18 GB | ~94K | 174 / 448 / 91 | apache-2.0 | HuggingFace |
| Coder390 GGUF (este repositorio) | Q8_0 + MTP Q8 | 29,07 GB | ~94K | 171 / 443 / 90 | apache-2.0 | HuggingFace |
| Coder390 FP8 dinámico | FP8 | no disponible | ~94K | 178 / 445 / 90 | apache-2.0 | repositorio principal |
| EfficientThink base (SFT + SimPO) | FP8, según el linaje | no disponible | no disponible | 171 / 442 / 89 | apache-2.0 | HuggingFace (modelo base) |
| Qwen3.8-27B oficial | FP8 | no disponible | no disponible | 177 / 444 / 83 | no disponible | HuggingFace (Qwen/Qwen3.8-27B) |

## Limitaciones y advertencias

- Todos los benchmarks son autoinformados por el autor, sin verificación externa ni resultados de terceros en la información disponible.
- El modelo tiene 0 descargas y 0 likes, y el repositorio se creó el 2026-10-06, fecha posterior a la actual, lo que dificulta la validación independiente de su calidad y de la reproducibilidad de las cifras.
- La nomenclatura del modelo y de su linaje hace referencia a versiones que no constan como modelos publicados (Opus5.5, GPT6Astra, Grok4.7, DSV4Pro, K3), por lo que la procedencia real de los datos de profesor no es verificable con la información disponible.
- Los datos de entrenamiento RLOO incluyen 517 trayectorias incorrectas y 68 respuestas vacías sobre un total de 1.376, lo que indica que el problema de respuestas vacías persiste parcialmente en el conjunto de entrenamiento.
- La ventana de 94K es amplia, pero no se documenta cómo se comporta la caché KV ni la calidad de recuperación a esa longitud.
- Idiomas declarados únicamente inglés y chino; el rendimiento en castellano u otras lenguas no está documentado y debe validarse antes de usarlo en producción.
- La etiqueta `uncensored` implica un filtrado de contenido reducido: requiere moderación externa si se expone a usuarios finales.
- La cuantización Q2 LynnStyle reduce MMLU de 444 (modelo original FP8) a 433, aunque mantiene GPQA en 177 y sube LCB a 90; no es un sustituto equivalente de la versión FP8.
- La visión no está incluida en los paquetes de este repositorio (requiere mmproj externo), por lo que cualquier caso de uso multimodal necesita artefactos adicionales.
- No se documenta explícitamente soporte de tool calling ni de function calling, lo que limita su uso directo en arquitecturas de agentes sin capas de orquestación propias.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte, y la atribución de datos de entrenamiento a modelos de terceros puede plantear dudas sobre los términos de uso subyacentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Repositorio principal (BF16, FP8, NVFP4, NInfer W4A4, INT8 W8A8, GGUF y otros niveles): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Repositorio principal en ModelScope: https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Modelo Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
