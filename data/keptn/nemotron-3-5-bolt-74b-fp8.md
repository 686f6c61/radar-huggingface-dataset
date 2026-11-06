# keptn/nemotron-3.5-bolt-74b-fp8

## Resumen

Nemotron 3.5 Bolt 74B-A9B es un modelo multimodal de NVIDIA con arquitectura híbrida (state-space y atención), 74 mil millones de parámetros totales y 9 mil millones activos por token, distribuido originalmente en BF16. Esta ficha describe la conversión a FP8 realizada por el usuario keptn para el motor de inferencia radiance sobre GPUs AMD RDNA4, empaquetada como un único fichero de 72,83 GiB con pesos en FP8 por bloques de 128×128, el drafter especulativo LiLiCorr de NVIDIA y la torre de visión RADIO.

La relevancia de esta variante es doble: por un lado, demuestra que un modelo de 74B con contexto de 262.144 tokens puede servirse en hardware AMD de consumo profesional (cuatro Radeon AI PRO R9700 de 32 GB), un espacio tradicionalmente dominado por CUDA; por otro, cuantifica con rigor la pérdida de calidad frente al original BF16 mediante divergencia KL sobre MT-Bench (KL media de 0,00301 y 98,4 % de coincidencia en el token superior). El formato `.rad` es propietario del motor radiance y requiere una pull request no publicada en release, lo que limita su adopción a entornos de evaluación.

No se dispone de información sobre la composición del dataset de entrenamiento original, los idiomas soportados ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida state-space + atención (Nemotron 3.5 Bolt), con torre de visión RADIO y drafter especulativo LiLiCorr |
| Parámetros totales | 74B (aproximado, según nomenclatura 74B-A9B) |
| Parámetros activos | 9B (aproximado, según nomenclatura 74B-A9B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | FP8 por bloques de 128×128 en capas lineales y expertos; parámetros de space-state, convoluciones y normas en precisión original; KV cache en bf16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | `.rad` (formato propietario del motor radiance), fichero único de 72,83 GiB |
| Modalidades de entrada | Texto e imagen |
| Drafter especulativo | LiLiCorr, 7 tokens de borrador |
| Tamaño del repositorio | 78,2 GB |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron 3.5 Bolt 74B-A9B, una arquitectura híbrida que combina capas de space-state con capas de atención, según se deduce de la mención explícita en la model card a que "los parámetros de space-state, las convoluciones y las normas se mantienen como en el checkpoint". La nomenclatura 74B-A9B indica 74B parámetros totales con 9B activos, lo que sugiere un diseño de mezcla de expertos o activación condicional, aunque la documentación no detalla la topología exacta. Incorpora una torre de visión RADIO para entradas de imagen y un drafter LiLiCorr de NVIDIA para decodificación especulativa.

La conversión a FP8 aplica cuantización por bloques de 128×128 a todas las capas lineales y a todos los expertos, sin datos de calibración (calibración declarada como "no calibration data"), lo que implica escalas calculadas directamente sobre los pesos. El proceso se realizó con la herramienta `rad-convert` y la receta `nemotron-3.5-bolt-74b-fp8`, partiendo de las revisiones `e09a4ced` (modelo BF16) y `449d2414` (drafter). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de texto e imagen y produce respuestas de texto.
- Modo thinking: se puede activar por petición mediante `chat_template_kwargs: {"enable_thinking": true}`; por defecto está desactivado en los ejemplos de despliegue.
- Decodificación especulativa: integra el drafter LiLiCorr con 7 tokens de borrador, configurable o desactivable con `--num-speculative-tokens 0`.
- Procesamiento de imágenes: la torre RADIO permite tareas de image-text-to-text, con evaluación específica en DocVQA y AI2D (20/20 respuestas idénticas al BF16 en la selección fija).
- Contexto largo: ventana de 262.144 tokens, con pools de KV que permiten hasta 1.666.736 tokens de contexto agregados con 8 secuencias en 4 GPUs.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Audio y vídeo: la model card menciona una sección "Images, audio and video", pero solo reporta mediciones para imágenes; no se confirma soporte de audio o vídeo.

## Casos de uso

- Análisis de documentos técnicos y formularios: el modelo acepta imágenes y tiene contexto de 262.144 tokens, lo que permite procesar lotes de páginas escaneadas o PDFs extensos en una sola sesión; la evaluación en DocVQA con 20/20 respuestas idénticas al BF16 respalda esta aplicación.
- Despliegue on-premise en hardware AMD: organizaciones con clústeres RDNA4 (por ejemplo, cuatro Radeon AI PRO R9700) pueden servir un modelo de 74B sin depender de CUDA, usando radiance con `--tp 4` y 248,1 tokens/s en decodificación de un solo stream.
- Asistentes conversacionales de contexto largo: con 524.512 tokens de pool KV para 2 secuencias a contexto completo, es adecuado para chatbots que mantienen historiales extensos o documentación de referencia en contexto.
- Generación de respuestas con latencia controlada: la decodificación especulativa con 7 tokens de borrador y el modo thinking desactivable permiten ajustar el equilibrio entre velocidad (hasta 407 tokens/s agregados con 4 streams) y calidad de razonamiento.
- Evaluación comparativa de cuantizaciones: el fichero incluye métricas de divergencia KL frente al BF16, útil para equipos que necesitan decidir entre FP8 y W4A8 (KL media 0,00301 frente a 0,00503) en función de su presupuesto de memoria.
- Investigación en eficiencia de inferencia: sirve como banco de pruebas para estudiar el impacto de la cuantización por bloques FP8 en modelos híbridos state-space, con métricas reproducibles sobre MT-Bench y un pipeline de conversión documentado.
- Procesamiento por lotes con múltiples secuencias: la configuración de 8 secuencias con 1.666.736 tokens de contexto agregados en 4 GPUs permite servir cargas de trabajo concurrentes moderadas en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta métricas de fidelidad frente al BF16 y de velocidad:

| Métrica | Este fichero (FP8) | keptn/nemotron-3.5-bolt-74b-w4a8 |
|---|---|---|
| KL media (MT-Bench, 41.586 tokens) | 0,00301 | 0,00503 |
| KL percentil 99 | 0,0361 | 0,0602 |
| Coincidencia en token superior | 98,4 % | 97,9 % |
| Ratio de perplejidad | ×1,000 | ×1,000 |

| Métrica de velocidad (Radeon AI PRO R9700, 215 W, 4 tarjetas) | Valor |
|---|---|
| Decodificación, un stream | 248,1 tokens/s |
| Prefill a 24k tokens | 6.074 tokens/s |
| 4 streams, total | 407 tokens/s |

| Fidelidad multimodal (imágenes) | Valor |
|---|---|
| Casos evaluados (DocVQA y AI2D) | 20 |
| Respuestas idénticas al BF16 | 20/20 |
| KL media | 0,00445 |
| Coincidencia en token superior | 82/82 |

## Requisitos de hardware

- VRAM estimada: el fichero pesa 72,83 GiB; con KV cache en bf16 y pool de contexto completo, requiere 4 GPUs de 32 GB (128 GB agregados). No cabe en 1 ni 2 tarjetas de 32 GB según la tabla de memoria de la model card.
- GPU recomendadas: Radeon AI PRO R9700 (probado); cualquier GPU AMD RDNA4 con soporte en radiance. No se documenta soporte para NVIDIA, A100, H100 ni RTX 4090 en esta variante.
- Consumer GPU: no cabe en GPUs de consumo convencionales; requiere cuatro tarjetas profesionales de 32 GB.
- Opciones de despliegue: exclusivamente el motor radiance (Codeberg, StillDeadcode/radiance) con la pull request #339, que no está en ninguna release; se compila una imagen propia con `docker/build.sh -t gfx1201`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 248,1 tokens/s en decodificación de un stream con 4 tarjetas, 6.074 tokens/s de prefill a 24k tokens y 407 tokens/s agregados con 4 streams, medidos con BetterBench 0.6.1 a temperatura 0,7 y thinking desactivado.
- Memoria de contexto: con `--max-model-len 262144`, el pool KV permite 524.512 tokens con 2 secuencias, 1.048.784 con 4 y 1.666.736 con 8 en 4 tarjetas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keptn/nemotron-3.5-bolt-74b-fp8 (esta ficha) | 74B totales / 9B activos | 262.144 | FP8 por bloques 128×128 | OpenMDW 1.1 | Motor radiance con PR #339, no en release |
| keptn/nemotron-3.5-bolt-74b-w4a8 | 74B totales / 9B activos | no disponible | W4A8 | OpenMDW 1.1 | Motor radiance |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | 74B totales / 9B activos | no disponible | BF16 | OpenMDW 1.1 | Hugging Face, transformers |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr | no disponible | no disponible | no disponible | OpenMDW 1.1 | Hugging Face (drafter) |

La comparativa se limita a variantes del mismo modelo base, ya que la información proporcionada no incluye datos de modelos alternativos de otros desarrolladores. El fichero W4A8 presenta mayor divergencia respecto al BF16 (KL media 0,00503 frente a 0,00301) pero presumiblemente menor huella de memoria, aunque no se detalla su tamaño.

## Limitaciones y advertencias

- Dependencia de software no publicado: requiere la pull request #339 del motor radiance, que no está en ninguna release; la API y el formato `.rad` pueden cambiar sin aviso.
- Compatibilidad de hardware restringida: solo se ha probado en AMD RDNA4 (Radeon AI PRO R9700); no hay soporte documentado para NVIDIA ni para GPUs de consumo.
- Sin calibración: la cuantización FP8 se realizó sin datos de calibración, lo que puede degradar la calidad en dominios alejados de la distribución de pesos; la KL media de 0,00301 en MT-Bench es baja pero no nula.
- Idiomas no documentados: se desconoce qué lenguas soporta el modelo original, lo que impide garantizar calidad en castellano u otros idiomas distintos del inglés.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasas de alucinación en la información disponible.
- Sesgos: no se documentan análisis de sesgos del modelo base ni de la conversión.
- Licencia OpenMDW 1.1: es una licencia con condiciones específicas; debe revisarse el fichero LICENSE antes de uso comercial, ya que la model card la etiqueta como `license: other`.
- Contexto completo costoso: con 262.144 tokens y bf16 KV, el pool de memoria limita el número de secuencias concurrentes (2 secuencias a contexto completo en 4 tarjetas).
- Formato propietario: el fichero `.rad` no es interoperable con otros motores de inferencia, lo que dificulta la portabilidad.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval, GSM8K ni comparaciones con modelos de otros desarrolladores, lo que impide situar el modelo frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-fp8
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Drafter LiLiCorr: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr
- Variante W4A8: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-w4a8
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Pull request #339 de radiance: https://codeberg.org/StillDeadcode/radiance/pulls/339
- Framework de model cards: https://codeberg.org/keptn42/radiance-model-cards-framework
