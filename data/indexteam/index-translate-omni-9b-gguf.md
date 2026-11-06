# IndexTeam/Index-Translate-omni-9B-GGUF

## Resumen

Index-Translate-omni-9B es un modelo de traducción multimodal desarrollado por IndexTeam, exportado a formato GGUF para su uso con llama.cpp. Con 8.953.803.264 parámetros (aproximadamente 9B), forma parte de la familia Index-Translate, que cubre traducción de texto multilingüe, restricciones de terminología y formato, traducción de imágenes y reconocimiento de voz, además de traducción bidireccional chino-inglés. La versión GGUF incluye los pesos del modelo de lenguaje y un proyector visual opcional (`mmproj`), pero no incorpora el codificador de audio original, por lo que no es un modelo de audio de extremo a extremo.

El modelo se distribuye bajo licencia Apache 2.0 y está orientado a tareas de traducción con instrucciones estrictas (terminología, formato) y a la traducción de contenido visual. Su relevancia radica en que ofrece resultados de traducción cercanos a modelos de mayor tamaño (35B-A3B) en varios benchmarks, con un tamaño que permite despliegue en hardware de consumo mediante cuantización.

La ficha se basa en la información disponible en la model card del repositorio GGUF y en las referencias al modelo original Index-Translate-Omni-9B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere familia transformer multimodal, base Qwen3.5 según benchmarks) |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector visual en mmproj-f16 y mmproj-Q8_0 |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada. La model card indica que el modelo se construye sobre la familia Index-Translate y que los benchmarks de imagen comparan cada modelo Omni con su línea base Qwen3.5, lo que sugiere que la arquitectura deriva de Qwen3.5. El export GGUF incluye los pesos del modelo de lenguaje y un proyector visual separado, pero no el codificador de audio, el conector de audio ni el runtime de audio del modelo original.

La verificación realizada por el autor consistió en cargar y ejecutar cada cuantización de lenguaje y ambos proyectores visuales en una H100 con llama.cpp, usando un corpus corto de retención, contexto de 128 tokens y un chunk para el cálculo de perplejidad. Se trata de una comprobación de regresión, no de una evaluación completa.

## Capacidades

- Traducción de texto multilingüe con soporte para restricciones de terminología y formato.
- Traducción de imágenes (image-to-text) mediante el proyector visual opcional.
- Reconocimiento automático de voz (ASR) en chino e inglés, aunque esta capacidad no está incluida en el GGUF y requiere los módulos de audio de los repositorios FP8 o FP4.
- Traducción bidireccional de voz chino-inglés, igualmente dependiente de módulos de audio no incluidos en el GGUF.
- Seguimiento de instrucciones de traducción (instruction following) con métricas específicas en la model card.
- Capacidades conversacionales (tag `conversational`).
- Soporte de `endpoints_compatible` según los tags del repositorio.

## Casos de uso

- Traducción de documentación técnica con terminología controlada: el modelo permite aplicar restricciones de terminología y formato, adecuado para manuales y guías donde la consistencia terminológica es crítica.
- Localización de contenido visual: con el proyector `mmproj`, puede traducir texto presente en imágenes, útil para señalética, capturas de pantalla o material promocional.
- Traducción de subtítulos y transcripciones: aunque el GGUF no incluye audio, el modelo de lenguaje puede traducir texto transcrito previamente, con la posibilidad de usar los repositorios FP8/FP4 para el pipeline completo de audio.
- Evaluación de calidad de traducción en pipelines de CI: sus métricas de instruction following y su licencia Apache 2.0 permiten integrarlo en pruebas automatizadas de localización.
- Atención al cliente bilingüe chino-inglés: el modelo puede gestionar conversaciones multi-turno en ambos idiomas, aunque la longitud de contexto no está documentada.
- Investigación en traducción multimodal: sirve como base para experimentos con restricciones de formato y evaluación con COMET22, WMT24++ y otros benchmarks citados.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (5,63 GB) y Q5_K_M (6,47 GB) permiten ejecución local en GPUs consumer con llama.cpp.

## Benchmarks y rendimiento

Los resultados siguientes corresponden al modelo original Index-Translate-Omni-9B según la model card; no son nuevos benchmarks de esta exportación cuantizada.

Traducción de texto:

| Modelo | FLORES COMET22 ↑ | WMT24++ COMET22 ↑ | WMT26 Judge ↑ | MEME ↑ |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate-Omni 35BA3B | 0.8795 | 0.8593 | 78.01 | 0.7405 |

Seguimiento de instrucciones:

| Modelo | instTrans Quality / IFscore ↑ | instTrans_minor Quality / IFscore ↑ / Off-target ↓ | IFMTBench XCOMET-XXL / IFscore ↑ |
|---|---:|---:|---:|
| Index-Translate-Omni 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |
| Index-Translate-Omni 35BA3B | 0.6867 / 0.8371 | 0.5163 / 0.7843 / 3.62% | 0.7934 / 0.9070 |

Voz (CER en porcentaje, menor es mejor; BLEU/chrF2 mayor es mejor):

| Modelo | Chinese ASR CER ↓ | English ASR CER ↓ | English → Chinese | Chinese → English |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 9B | 17.8917 | 14.4097 | 43.507 / 36.312 / 41.3767 | 34.656 / 55.376 / 46.3720 |
| Index-Translate-Omni 35BA3B | 18.6803 | 15.0850 | 42.081 / 35.836 / 49.2490 | 36.404 / 57.323 / 45.1546 |

Traducción de imágenes (COMET22 × 100, mayor es mejor):

| Modelo | MMTIT ↑ | FLORES-rendered ↑ | Vistra ↑ |
|---|---:|---:|---:|
| Qwen3.5-9B | 73.814 | 67.804 | 68.963 |
| Index-Translate-Omni 9B | 77.604 | 68.438 | 71.815 |
| Index-Translate-Omni 35BA3B | 77.011 | 69.891 | 71.482 |

Perplejidad de las cuantizaciones GGUF (corpus corto, contexto de 128 tokens):

| Cuantización | Tamaño | PPL | Cambio vs f16 |
|---|---:|---:|---:|
| f16 | 17.92 GB | 11.4870 | baseline |
| Q8_0 | 9.53 GB | 11.5140 | +0.23% |
| Q6_K | 7.36 GB | 11.4985 | +0.10% |
| Q5_K_M | 6.47 GB | 11.7721 | +2.48% |
| Q5_K_S | 6.31 GB | 11.5769 | +0.78% |
| Q4_K_M | 5.63 GB | 11.0747 | -3.59% |
| Q4_K_S | 5.35 GB | 10.3659 | -9.76% |
| Q3_K_L | 4.93 GB | 12.6886 | +10.46% |
| Q3_K_M | 4.62 GB | 11.8177 | +2.88% |
| Q3_K_S | 4.26 GB | 14.4046 | +25.40% |
| Q2_K | 3.83 GB | 27.3589 | +138.17% |
| IQ4_XS | 5.23 GB | 11.3353 | -1.32% |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3,83 GB (Q2_K) y 17,92 GB (f16) solo para los pesos del modelo de lenguaje; el proyector visual `mmproj-f16` o `mmproj-Q8_0` añade VRAM adicional no cuantificada en la información disponible.
- GPU recomendadas: H100 para la verificación realizada por el autor; para cuantizaciones Q4/Q5, GPUs consumer con 8-12 GB de VRAM pueden ser suficientes para el modelo de lenguaje.
- Cabe en GPU consumer: sí, con cuantizaciones Q4_K_M (5,63 GB), Q5_K_M (6,47 GB) o IQ4_XS (5,23 GB), siempre que se disponga de VRAM adicional para el proyector visual y el contexto.
- Opciones de despliegue: llama.cpp (requiere build en o posterior al commit `9e2a04a439edc49f08c5acdafefae19dfa25a658` con soporte Qwen3.5). No se mencionan vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FLORES COMET22 ↑ | WMT26 Judge ↑ | Licencia | Formato |
|---|---:|---|---:|---:|---|---|
| Index-Translate-Omni 9B | 8,95B | no disponible | 0.8789 | 75.35 | Apache 2.0 | GGUF, FP8/FP4 (original) |
| Index-Translate-Omni 35BA3B | 35B (A3B) | no disponible | 0.8795 | 78.01 | Apache 2.0 | GGUF, FP8/FP4 (original) |
| Index-Translate-Omni 2B | ~2B | no disponible | 0.8655 | 60.26 | Apache 2.0 | GGUF, FP8/FP4 (original) |
| Qwen3.5-9B (base para imagen) | ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo 9B ofrece resultados de traducción de texto muy cercanos al 35BA3B en FLORES COMET22 (0.8789 frente a 0.8795) y ligeramente inferiores en WMT26 Judge (75.35 frente a 78.01). En traducción de imágenes, el 9B supera al 35BA3B en MMTIT (77.604 frente a 77.011) y Vistra (71.815 frente a 71.482), y queda por debajo en FLORES-rendered (68.438 frente a 69.891).

## Limitaciones y advertencias

- El GGUF no contiene el codificador de audio, el conector de audio ni el runtime de audio; no es un modelo de traducción de audio de extremo a extremo. Para audio deben usarse los repositorios FP8 o FP4.
- Los benchmarks de texto, voz e imagen corresponden al modelo original, no a esta exportación cuantizada; la única verificación propia es la perplejidad sobre un corpus corto.
- La cuantización Q2_K presenta un aumento de perplejidad del +138,17% frente a f16, lo que la hace inadecuada para producción.
- La cuantización Q3_K_S muestra un aumento del +25,40%, con degradación significativa.
- Solo se declaran los idiomas chino e inglés; no hay soporte documentado para otros idiomas.
- La longitud de contexto no está documentada, lo que limita la planificación de despliegues con conversaciones largas.
- No se dispone de información sobre sesgos, riesgo de alucinación ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero deben verificarse las licencias de los componentes derivados (por ejemplo, la base Qwen3.5) si se redistribuye el modelo.
- El repo tiene 83,0 GB de tamaño total, lo que requiere espacio de almacenamiento considerable si se descargan todas las cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-omni-9B-GGUF
- Modelo original Index-Translate-Omni-9B: https://huggingface.co/IndexTeam/Index-Translate-Omni-9B
- Benchmarks publicados de Index-Translate-9B: https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
