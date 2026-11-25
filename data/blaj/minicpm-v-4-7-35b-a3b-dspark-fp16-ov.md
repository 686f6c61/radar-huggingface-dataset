# blaj/MiniCPM-V-4.7-35B-A3B-DSpark-fp16-ov

## Resumen

MiniCPM-V-4.7-35B-A3B-DSpark en formato OpenVINO FP16 es una conversión del modelo borrador (draft) publicado por OpenBMB, realizada por el usuario blaj mediante el exportador estándar de Optimum. No se trata de un modelo autónomo para uso general, sino de la pieza "draft" de un sistema de decodificación especulativa (speculative decoding) que debe emparejarse con el modelo objetivo oficial MiniCPM-V-4.7-35B-A3B en INT4 de OpenVINO. El nombre indica una arquitectura MoE con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, aunque la ficha de Hugging Face no confirma estos datos de forma explícita.

La relevancia de esta conversión es práctica: permite acelerar la inferencia del modelo objetivo sobre hardware Intel (en el benchmark publicado, una iGPU Intel Arc) usando decodificación especulativa con un draft en FP16. El autor verifica el SHA-256 de los pesos de origen y aclara que el exportador estándar no consume la cabeza de confianza (confidence head) del checkpoint original, lo que limita algunas capacidades del sistema de borrador.

El repositorio tiene un tamaño de 0,8 GB, lo que es coherente con un draft pequeño más un componente Markov en FP16, y no con un modelo de 35B completo. La licencia es Apache 2.0 y la librería es OpenVINO. No hay descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según nomenclatura 35B-A3B); draft para decodificación especulativa con componente Markov; detalles no disponibles |
| Parametros totales | 35B (según nombre del modelo; no confirmado en la model card) |
| Parametros activos | ~3B (según nomenclatura A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (este repo); variantes INT4 e INT8 publicadas por el mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (exportado con Optimum); repo de 0,8 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de la nomenclatura MoE implícita en "35B-A3B". El artefacto de este repositorio es un draft de decodificación especulativa: un backbone en FP16 más un "Markov companion" también en FP16. El exportador estándar de Optimum no consume la cabeza de confianza del checkpoint original, lo que el autor señala explícitamente como una limitación del proceso de conversión.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO. El benchmark publicado menciona 17 bloques de atención lineal (linear-attention) en el modelo objetivo, pero no detalla la arquitectura completa del draft. El modelo base declarado es openbmb/MiniCPM-V-4.7-35B-A3B-DSpark, con un commit concreto referenciado.

## Capacidades

- Generación de texto como draft en un pipeline de decodificación especulativa; no está pensado para uso autónomo.
- Aceleración de inferencia del modelo objetivo MiniCPM-V-4.7-35B-A3B en INT4 sobre OpenVINO GenAI.
- Soporte de decodificación con KV cache paginada en FP16 (según el benchmark).
- Capacidades multimodales (visión) heredadas del modelo base MiniCPM-V, aunque el benchmark publicado solo cubre texto.
- Tool calling, agentes, thinking mode y multilingüismo: no disponibles en la información proporcionada para este artefacto.

## Casos de uso

- Aceleración de inferencia en hardware Intel: emparejar este draft FP16 con el objetivo INT4 oficial para reducir latencia en generación de texto sobre iGPU Intel Arc, usando `num_assistant_tokens=5` y draft INT8 según la recomendación del autor.
- Despliegue en edge con OpenVINO: el tamaño reducido del draft (repo de 0,8 GB) permite incluirlo junto al objetivo INT4 en entornos con memoria limitada.
- Generación de código asistida: el benchmark usa como prompt la escritura de una función Python para comprobar números primos, con tasas de aceptación del 68,8 % a 5 propuestas con draft INT8.
- Generación de JSON estructurado: el segundo prompt del benchmark pide JSON válido para tres libros, con tasas de aceptación del 63,8 % a 5 propuestas.
- Evaluación de pipelines de decodificación especulativa: útil para comparar variantes INT4/INT8/FP16 del draft en términos de tokens aceptados, TPS y ratio de tiempo draft/principal.
- Investigación en optimización de inferencia: permite reproducir el benchmark publicado (OpenVINO GenAI nightly 2027.0.0.0.dev20261119) y medir el impacto de la cuantización del draft.

## Benchmarks y rendimiento

Benchmark publicado por el autor sobre iGPU Intel Arc, OpenVINO GenAI nightly 2027.0.0.0.dev20261119, objetivo INT4 oficial, KV paginada FP16, 17 bloques de atención lineal, decodificación greedy mono-stream, límite de 256 tokens. Cada celda es una ejecución medida, no una media.

| Draft | Propuestas por paso | Prime: aceptados / propuestos (tasa) | Prime tok/s | Books JSON: aceptados / propuestos (tasa) | JSON tok/s |
|---|---:|---:|---:|---:|---:|
| Ninguno | 0 | — | 30,25 | — | 33,85 |
| INT4 | 15 | 206 / 655 (31,5 %) | 33,93 | 76 / 210 (36,2 %) | 41,51 |
| INT8 | 15 | 203 / 555 (36,6 %) | 39,93 | 76 / 210 (36,2 %) | 40,74 |
| FP16 | 15 | 204 / 540 (37,8 %) | 42,76 | 76 / 210 (36,2 %) | 41,02 |
| INT4 | 5 | 192 / 305 (63,0 %) | 48,66 | 67 / 105 (63,8 %) | 53,98 |
| INT8 | 5 | 196 / 285 (68,8 %) | **53,38** | 67 / 105 (63,8 %) | **54,82** |
| FP16 | 5 | 196 / 285 (68,8 %) | 51,56 | 67 / 105 (63,8 %) | 51,70 |

Recomendación del autor para thinking on: draft INT8 con `num_assistant_tokens=5`. Medición diagnóstica con thinking off (no recomendada como configuración por defecto): INT4 a 15 propuestas alcanzó 72,18 tok/s (229 / 349, 65,6 %) y a 5 propuestas 71,17 tok/s (206 / 235, 87,7 %). El autor advierte que desactivar el thinking cambia la respuesta y no es una comparación de velocidad equivalente. No se han publicado benchmarks de calidad, paridad greedy ni inferencia de imagen.

## Requisitos de hardware

- VRAM estimada para el draft: repo de 0,8 GB en FP16; el objetivo INT4 oficial debe sumarse aparte.
- GPU recomendadas: el benchmark se ejecutó en iGPU Intel Arc; no hay datos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo Intel Arc y previsiblemente en cualquier iGPU Intel compatible con OpenVINO GenAI; no hay datos para GPU NVIDIA.
- Despliegue: OpenVINO GenAI (nightly 2027.0.0.0.dev20261119 en el benchmark); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: entre 30,25 y 53,38 tok/s en el prompt de código, y entre 33,85 y 54,82 tok/s en el prompt JSON, según configuración del draft.
- Ratios de tiempo draft/principal a 15 propuestas: INT4 6,8 % / 7,4 %; INT8 5,1 % / 7,8 %; FP16 8,7 % / 10,4 %. INT4 a 5 propuestas: 24,1 % / 13,0 %.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| blaj/MiniCPM-V-4.7-35B-A3B-DSpark-fp16-ov (este) | 35B-A3B (según nombre) | no disponible | Apache 2.0 | OpenVINO FP16 | Draft FP16; 0,8 GB; recomendado INT8 a 5 propuestas |
| blaj/MiniCPM-V-4.7-35B-A3B-DSpark-int8-ov | 35B-A3B (según nombre) | no disponible | Apache 2.0 | OpenVINO INT8 | Mejor TPS en el benchmark (53,38 tok/s en prime) |
| blaj/MiniCPM-V-4.7-35B-A3B-DSpark-int4-ov | 35B-A3B (según nombre) | no disponible | Apache 2.0 | OpenVINO INT4 | Menor tamaño; menor tasa de aceptación a 15 propuestas |
| OpenVINO/MiniCPM-V-4.7-35B-A3B-int4-ov | 35B-A3B (según nombre) | no disponible | no disponible | OpenVINO INT4 | Objetivo oficial con el que se empareja el draft |

No se dispone de información sobre otros drafts de decodificación especulativa comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el objetivo INT4 oficial de OpenVINO para funcionar como sistema de decodificación especulativa.
- El exportador estándar no consume la cabeza de confianza del checkpoint original, lo que puede degradar el comportamiento del draft respecto al original.
- El benchmark es un smoke test de throughput de texto; no evalúa calidad, paridad greedy ni inferencia de imagen.
- Las mediciones se hicieron con una versión nightly de OpenVINO GenAI (2027.0.0.0.dev20261119), no con una release estable.
- Desactivar el thinking altera las respuestas y no constituye una comparación de velocidad equivalente.
- No hay información sobre sesgos, alucinación, idiomas soportados ni longitud de contexto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el objetivo deben verificarse por separado.
- Cero descargas y cero likes en el momento de la consulta; sin validación comunitaria.
- El tamaño del repo (0,8 GB) sugiere que no contiene los 35B completos; verificar el contenido antes de asumir capacidades del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blaj/MiniCPM-V-4.7-35B-A3B-DSpark-fp16-ov
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- Commit del modelo base referenciado: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark/tree/55249d3e69315892ca07bc956228b404f2526f9a
- Objetivo INT4 oficial: https://huggingface.co/OpenVINO/MiniCPM-V-4.7-35B-A3B-int4-ov
- Commit del objetivo INT4: https://huggingface.co/OpenVINO/MiniCPM-V-4.7-35B-A3B-int4-ov/tree/8b28ee2fe3a13fe38826d615579141af1c6d406a
- Variante INT4 del draft: https://huggingface.co/blaj/MiniCPM-V-4.7-35B-A3B-DSpark-int4-ov
- Variante INT8 del draft: https://huggingface.co/blaj/MiniCPM-V-4.7-35B-A3B-DSpark-int8-ov
