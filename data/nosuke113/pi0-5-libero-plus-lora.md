# nosuke113/pi0.5-libero-plus-lora

## Resumen

pi0.5 LIBERO-plus LoRA es un ajuste fino mediante LoRA del modelo vision-language-action (VLA) pi0.5, desarrollado por Physical Intelligence, publicado por el usuario nosuke113 en Hugging Face. El modelo base combina PaliGemma-2B con un Action Expert de 300M de parámetros y emplea flow matching para generar trayectorias de accion motora a partir de observaciones visuales e instrucciones en lenguaje natural. Este repositorio concreto contiene únicamente los pesos LoRA entrenados sobre el dataset LIBERO-plus, no el modelo completo.

El ajuste se ha realizado sobre una versión deduplicada de LIBERO-plus (8.395 episodios, 1.681 trayectorias físicas únicas tras eliminar aumentaciones visuales redundantes), con un split a nivel de trayectoria para evitar fuga de datos entre entrenamiento y validación. El entrenamiento consistió en 35.000 pasos con LoRA de rango 16 y alpha 32, aplicado al Action Expert y a las capas de proyección, con AdamW a learning rate 1e-4 y batch size 8.

Su relevancia radica en que proporciona una evaluación rigurosa de robustez de un VLA de referencia frente a perturbaciones visuales y de posicion, con 900 rollouts en 180 tareas retenidas y métricas desglosadas por eje de perturbación (base, vista, ruido, objetos desplazados). Es un artefacto de investigación orientado a reproducibilidad en robótica de manipulación, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en PaliGemma-2B (vision-language) + Action Expert de 300M con flow matching |
| Parametros totales | no disponible (el modelo base pi0.5 combina PaliGemma-2B y un Action Expert de 300M; el repositorio contiene solo adaptadores LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 para evaluación; el repositorio no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (las instrucciones de LIBERO-plus están en inglés, pero la model card no declara cobertura lingüística) |
| Licencia | Gemma (license:gemma) |
| Formato de pesos | safetensors (adaptadores LoRA); tamaño del repo 1094 GB |

## Arquitectura y entrenamiento

El modelo base pi0.5 es un VLA que combina un backbone vision-language PaliGemma-2B con un Action Expert de 300M de parámetros que genera acciones mediante flow matching, un paradigma de modelado generativo continuo alternativo a la difusión clásica. La inferencia se realiza en bucle cerrado con control de horizonte deslizante (Receding Horizon Control, RTC) y un chunk de acciones de tamaño 5, con un máximo de 600 pasos por episodio. El ajuste publicado aplica LoRA de rango 16 y alpha 32 exclusivamente sobre el Action Expert y las capas de proyección, dejando congelado el backbone visual-lingüístico.

El entrenamiento se llevó a cabo sobre `nosuke113/libero-plus-deduplicated`, una versión deduplicada de LIBERO-plus que reduce el dataset a 8.395 episodios correspondientes a 1.681 trayectorias físicas únicas. La partición train/val se hizo a nivel de trayectoria agrupando episodios por hash SHA-1 de la secuencia completa de acciones, garantizando cero solapamiento entre conjuntos (1.376 trayectorias / 6.873 episodios en train; 154 trayectorias / 767 episodios en validación). Se usó AdamW con learning rate 1e-4, batch size 8 y scheduler coseno durante 35.000 pasos. El checkpoint evaluado es `checkpoints/libero_plus_b8_r16_step35000`. La evaluación se ejecutó en bfloat16 mixto sobre una NVIDIA L4.

## Capacidades

- Generación de acciones robóticas de 6 grados de libertad a partir de observaciones visuales e instrucciones en lenguaje natural.
- Control visuomotor en bucle cerrado con horizonte deslizante y chunks de acción de tamaño 5.
- Ejecución de tareas de manipulación tipo LIBERO-plus: colocar objetos, abrir/cerrar, activar interruptores, etc.
- Robustez parcial frente a variaciones de cámara (ángulo de órbita 0-356 grados, zoom 100-191, inclinación de mirada).
- Robustez parcial frente a corrupciones de imagen (ruido gaussiano, motion blur, niebla, distorsión de cristal en niveles 8-48).
- Cierta tolerancia a desplazamientos de posición inicial de objetos de varios centímetros.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico ni procesamiento de audio.

## Casos de uso

- Evaluación de robustez de políticas VLA: usar el checkpoint para medir la degradación de éxito bajo perturbaciones de vista, ruido y posición, comparando con el modelo base sin ajuste y con otras variantes de fine-tuning.
- Reproducción de resultados académicos: el repositorio publica el checkpoint exacto (step 35.000), el dataset de evaluación de 180 tareas y las métricas con intervalos de confianza Wilson al 95%, lo que permite replicar el experimento de forma controlada.
- Punto de partida para fine-tuning en dominios concretos: al ser un LoRA ligero sobre el Action Expert, sirve como inicialización para adaptar pi0.5 a nuevos datasets de manipulación con menor coste que un ajuste completo.
- Investigación en flow matching para robótica: permite estudiar el comportamiento del Action Expert bajo distintos regímenes de perturbación sin reentrenar el backbone.
- Benchmark interno de pipelines de inferencia robótica: útil para validar integraciones con LeRobot, medir latencia en L4 y comparar configuraciones de RTC y tamaños de chunk.
- Análisis de modos de fallo: la tasa de colisión del 32% y el desglose por categoría permiten estudiar qué perturbaciones provocan más colisiones (especialmente "Moved", con 52,67%) y diseñar mitigaciones.
- Docencia y divulgación: ejemplo realista de fine-tuning LoRA sobre un VLA con separación estricta de trayectorias para evitar fuga de datos.

## Benchmarks y rendimiento

Evaluación sobre 180 tareas retenidas con 5 semillas (900 rollouts), control en bucle cerrado, máximo 600 pasos por episodio, bfloat16 en NVIDIA L4, RTC con chunk de 5.

| Métrica | Valor | Nota |
|---|---|---|
| Episodios totales | 900 | 180 tareas x 5 semillas |
| Tasa de éxito global | 46,00% (414/900) | IC Wilson 95%: [42,7%, 49,3%] |
| Tasa de colisión | 32,00% (288/900) | 1 mm de desplazamiento / colisión de eslabón |
| Pasos medios | 362,9 | Máximo 600 |
| Action jerk | 0,0221 | Media del delta 6-DoF paso a paso |

Desglose por perturbación:

| Categoría | N | Tasa de éxito | Tasa de colisión | Pasos medios |
|---|---|---|---|---|
| Base | 150 | 78,67% (118/150) | 15,33% | 247,9 |
| View | 300 | 55,00% (165/300) | 32,67% | 286,6 |
| Noise | 300 | 30,67% (92/300) | 29,33% | 441,0 |
| Moved | 150 | 26,00% (39/150) | 52,67% | 474,2 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks estándar de LLM no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base pi0.5 combina PaliGemma-2B con un Action Expert de 300M; en bfloat16 el backbone ronda los 4-5 GB y el Action Expert menos de 1 GB, pero el repositorio no publica cifras oficiales.
- GPU utilizada en la evaluación: NVIDIA L4 (24 GB de VRAM), con precisión mixta bfloat16.
- GPU recomendadas: L4, A100, H100 o cualquier GPU con al menos 16-24 GB de VRAM para ejecutar el modelo base completo en bfloat16.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) y potencialmente en RTX 3090/4080 (16 GB) si se aplica cuantización, aunque no está documentado por el autor.
- Opciones de despliegue: LeRobot (librería declarada, `library_name: lerobot`) es la vía principal. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que además no encajan con un VLA de robótica.
- Latencia y throughput: no disponibles. La evaluación reporta pasos medios por episodio (362,9) y máximo de 600, pero no tiempos por paso ni FPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0.5 LIBERO-plus LoRA (este) | LoRA sobre pi0.5 (PaliGemma-2B + Action Expert 300M) | no disponible | 46,00% éxito global en LIBERO-plus (900 rollouts) | Gemma | Hugging Face, repo de 1094 GB |
| pi0.5 base (`lerobot/pi05_libero_base`) | PaliGemma-2B + Action Expert 300M | no disponible | no disponible en la información proporcionada | Gemma | Hugging Face |
| OpenVLA | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Hugging Face |
| π0 (Physical Intelligence) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificados frente a alternativas en la información proporcionada; las filas marcadas como "no disponible" reflejan esa ausencia y no deben interpretarse como valores nulos del modelo.

## Limitaciones y advertencias

- El repositorio contiene solo adaptadores LoRA, no el modelo completo: es necesario descargar `lerobot/pi05_libero_base` (commit a217bfd) para poder usarlo.
- Tasa de éxito global moderada (46,00%) y muy baja en la categoría "Moved" (26,00%) y "Noise" (30,67%): no es adecuado para producción sin un ajuste adicional en el dominio objetivo.
- Tasa de colisión elevada (32,00% global, 52,67% en "Moved"), lo que implica riesgo físico en entornos reales.
- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre LIBERO-plus, hereda las limitaciones de ese dataset (escenas de cocina simuladas, objetos y tareas acotadas).
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero sí existe riesgo de acciones incorrectas o incoherentes ante escenas fuera de distribución.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y la cobertura lingüística no se declara; las instrucciones de LIBERO-plus están en inglés.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos de la Gemma Terms of Use antes de cualquier despliegue comercial.
- El tamaño del repositorio (1094 GB) sugiere que incluye checkpoints intermedios y vídeos de evaluación además de los pesos LoRA; la descarga completa puede ser costosa en almacenamiento y ancho de banda.
- La evaluación se realizó exclusivamente en simulación (LIBERO-plus) sobre una L4; el rendimiento en robots físicos no está validado.
- No se documentan cuantizaciones oficiales ni soporte para motores de inferencia alternativos a LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nosuke113/pi0.5-libero-plus-lora
- Modelo base: https://huggingface.co/lerobot/pi05_libero_base
- Commit del modelo base: https://huggingface.co/lerobot/pi05_libero_base/commit/a217bfd3b14673cf2ce597e69997ab21866438dd
- Commit de este repositorio: https://huggingface.co/nosuke113/pi0.5-libero-plus-lora/commit/db2ccc2a42e1f6ccab45f3fe3601a8d07a3ae2e2
- Dataset de entrenamiento deduplicado: https://huggingface.co/datasets/nosuke113/libero-plus-deduplicated
- Dataset original LIBERO-plus: https://huggingface.co/datasets/lerobot/libero_plus
- Dataset de evaluación: https://huggingface.co/datasets/nosuke113/libero-plus-evaluation
- Página de investigación de pi0.5 (Physical Intelligence): https://www.physicalintelligence.company/research/pi05
- Vídeo de evaluación (tarea "Put the black bowl on the plate"): https://huggingface.co/nosuke113/pi0.5-libero-plus-lora/resolve/main/videos/grid_0.mp4
- Vídeo de evaluación (tarea "Turn on the stove bottom"): https://huggingface.co/nosuke113/pi0.5-libero-plus-lora/resolve/main/videos/grid_1.mp4
- Vídeo de evaluación (grid_2): https://huggingface.co/nosuke113/pi0.5-libero-plus-lora/resolve/main/videos/grid_2.mp4
