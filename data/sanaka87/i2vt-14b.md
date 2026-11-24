# sanaka87/i2vt-14b

## Resumen

I2VT-14B es un adaptador LoRA para edición de vídeo por instrucciones desarrollado por el usuario sanaka87, derivado del editor de vídeo Bernini-R-14B de ByteDance. El modelo implementa la técnica I2VT (Image-to-Video Transfer) descrita en el artículo *Improving and Expanding Video Editing Capabilities Without Videos*: en lugar de entrenar con pares de vídeos editados, el editor de vídeo procesa cada imagen fuente como un vídeo de un solo fotograma y una guía de imagen congelada (JoyAI-Image-Edit) orienta su predicción en cada paso de la trayectoria de denoising. El resultado es un editor que mejora las tareas básicas y se extiende a cuatro tareas nuevas sin necesidad de vídeos emparejados adicionales.

El modelo se distribuye como dos ficheros LoRA (rank 128, alpha 64) que deben cargarse sobre los dos expertos del modelo base Bernini-R-14B: `bernini_lora_step_200.safetensors` sobre `transformer` (experto de alto ruido) y `bernini_lora_low_step_200.safetensors` sobre `transformer_2` (experto de bajo ruido). La relevancia actual radica en que demuestra que es posible ampliar las capacidades de un editor de vídeo usando únicamente imágenes, reduciendo drásticamente el coste de datos y manteniendo la arquitectura del modelo base intacta.

El repositorio ocupa 2,5 GB y se publica bajo licencia Apache 2.0, la misma del modelo base. No se dispone de información sobre idiomas soportados ni sobre el número exacto de parámetros del modelo completo (el sufijo "14B" sugiere 14 mil millones, coherente con Bernini-R-14B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base Bernini-R-14B (dos expertos transformer: `transformer` de alto ruido y `transformer_2` de bajo ruido); el adaptador es un LoRA sobre capas lineales |
| Parametros totales | no disponible (el sufijo del nombre sugiere 14B, sin confirmar en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa clips de 81 fotogramas en la configuración de evaluación) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos ficheros LoRA: `bernini_lora_step_200.safetensors` y `bernini_lora_low_step_200.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Bernini-R-14B, un editor de vídeo con arquitectura de dos expertos (alto y bajo ruido) típica de los modelos de difusión para vídeo. I2VT no modifica la arquitectura: congela ambos backbones y entrena únicamente un LoRA de rank 128 y alpha 64 sobre cada capa lineal de los dos expertos. Durante el entrenamiento, el editor de vídeo edita cada imagen fuente como si fuera un vídeo de un fotograma, y un editor de imagen congelado (JoyAI-Image-Edit) guía su predicción en cada paso de la trayectoria de denoising propia del editor de vídeo. En inferencia, el editor ajustado procesa clips de vídeo completos.

El entrenamiento se realizó sobre el dataset I2VT-17K con un learning rate de 5e-5, batch size de 48 imágenes fuente, 200 pasos y 10 pasos de rollout por imagen, con una escala de guía del editor de imagen entre 1 y 2 según la tarea. La configuración completa está en `train_config.yaml`. La evaluación reportada usa el checkpoint del paso 200 con el sampler UniPC, 40 pasos, 81 fotogramas, guía APG (escala de texto 4), time shift 5 y semilla 42.

## Capacidades

- Edición de vídeo por instrucciones en lenguaje natural (video-to-video).
- Edición global de estilo (Global Style).
- Cambio local de elementos en la escena (Local Change).
- Cambio de fondo (Background Change).
- Eliminación local de objetos (Local Remove).
- Adición local de objetos (Local Add).
- Cambio de acción (Action Change), tarea nueva de OpenVE++.
- Cambio de expresión facial (Expression Change), tarea nueva de OpenVE++.
- Movimiento corporal (Body Movement), tarea nueva de OpenVE++.
- Reiluminación de escena (Scene Relighting), tarea nueva de OpenVE++.
- Entrenamiento sin vídeos emparejados: solo requiere imágenes fuente para ampliar tareas de edición.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusión de vídeo).

## Casos de uso

- Postproducción de vídeo publicitario: reiluminar escenas o cambiar el estilo global de un clip sin regrabar, usando instrucciones de texto y el adaptador sobre Bernini-R-14B; la tarea de Scene Relighting está específicamente entrenada y evaluada.
- Edición de contenido para redes sociales: cambiar la acción o el movimiento corporal de un sujeto en un clip corto (81 fotogramas) para adaptar una toma a distintas narrativas sin rodar de nuevo.
- Sustitución o eliminación de objetos en tomas de stock: usar Local Remove y Local Add para limpiar fondos o insertar elementos, reduciendo la dependencia de rodajes adicionales.
- Ajuste de expresiones faciales en vídeo corporativo o educativo: la tarea Expression Change permite modificar la expresividad de un presentador en una toma ya grabada.
- Prototipado rápido de efectos visuales: iterar sobre variantes de estilo y fondo de un mismo clip con un único modelo y sin pipeline de datos emparejados, gracias a que I2VT se entrena solo con imágenes.
- Investigación en edición de vídeo: servir como referencia reproducible para estudiar la transferencia imagen-a-vídeo, con dataset (I2VT-17K), benchmark (OpenVE++) y código públicos.
- Generación de variantes de un mismo plano para pruebas A/B: producir distintas versiones editadas de un clip (estilo, fondo, acción) y evaluar su impacto con métricas automáticas tipo Gemini.

## Benchmarks y rendimiento

Los resultados publicados usan jueces automáticos que puntúan de 1 a 5 el cumplimiento de la instrucción, la consistencia con la fuente y la calidad visual; la puntuación de un clip es la media de las tres. OpenVE-Bench se evalúa con Gemini 2.5 Pro; OpenVE++ con Gemini 3.8 Flash (tabla principal del artículo) y con Gemini 2.5 Pro (suplemento). Sin prompt enhancement.

**OpenVE-Bench (ediciones básicas)**

| Modelo | Global Style | Local Change | Background Change | Local Remove | Local Add | Overall |
|---|---|---|---|---|---|---|
| Bernini-R-14B | 4.16 | 4.30 | 3.16 | 2.66 | 2.35 | 3.33 |
| I2VT-14B | 4.32 | 4.54 | 3.10 | 2.98 | 2.55 | 3.50 |

**OpenVE++ (tareas nuevas)**

| Modelo | Juez | Action Change | Expression Change | Body Movement | Scene Relighting | Overall |
|---|---|---|---|---|---|---|
| Bernini-R-14B | Gemini 3.8 Flash | -- | -- | -- | -- | -- |
| I2VT-14B | Gemini 3.8 Flash | 3.86 | 3.82 | 3.67 | 3.73 | 3.77 |
| Bernini-R-14B | Gemini 2.5 Pro | 2.48 | 2.21 | 2.06 | 3.02 | 2.44 |
| I2VT-14B | Gemini 2.5 Pro | 3.45 | 3.41 | 3.02 | 3.47 | 3.34 |

El artículo no incluye una puntuación emparejada a 40 pasos con Gemini 3.8 Flash para el editor base Bernini-R-14B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Bernini-R-14B (dos expertos) más los LoRA. El repositorio del adaptador ocupa 2,5 GB, pero el modelo base completo requiere su propio espacio.
- GPU recomendadas: no disponible. Por el tamaño del modelo base (sufijo 14B) se intuye necesidad de GPU de datacenter, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: la librería indicada es `diffusers`; los scripts de inferencia para el modelo de dos expertos están en el repositorio de código (GitHub). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de difusión de vídeo).
- Latencia y throughput: no disponible. La configuración de evaluación usa 40 pasos de muestreo, 81 fotogramas, UniPC, APG (escala de texto 4), time shift 5 y semilla 42.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / clip | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| I2VT-14B | LoRA sobre editor de vídeo (Bernini-R-14B) | no disponible (base ~14B) | 81 fotogramas en evaluación | Apache 2.0 | Hugging Face (adaptador) + código en GitHub |
| Bernini-R-14B | Editor de vídeo base | ~14B | 81 fotogramas en evaluación | Apache 2.0 | Hugging Face (ByteDance/Bernini-R-Diffusers) |
| JoyAI-Image-Edit | Editor de imagen (guía congelada) | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de otros editores de vídeo comparables en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de uso indebido: los pesos pueden cambiar acciones y expresiones de personas reales en vídeos; el autor desaconseja explícitamente crear contenido engañoso sobre personas reales o sin su consentimiento, y exige etiquetar los vídeos editados como editados.
- El adaptador requiere cargar ambos ficheros LoRA sobre los dos expertos del modelo base; cargar solo uno produce un funcionamiento incorrecto.
- Dependencia del modelo base: el rendimiento está acotado por Bernini-R-14B y por el editor de imagen guía (JoyAI-Image-Edit), cuyas limitaciones se heredan.
- Los benchmarks se basan en jueces automáticos (Gemini), no en evaluación humana; pueden no reflejar la percepción real.
- En OpenVE-Bench, la mejora en Background Change es ligeramente inferior a la del modelo base (3.10 frente a 3.16).
- No se documentan idiomas soportados, sesgos conocidos ni comportamiento multilingüe.
- No se documentan requisitos de hardware, latencia ni opciones de cuantización, lo que dificulta la planificación de despliegue en producción.
- La licencia Apache 2.0 permite uso comercial, pero las restricciones éticas del autor sobre contenido de personas reales deben respetarse.
- El artículo (arXiv) aún no está publicado ("coming soon"), por lo que la metodología completa no es verificable de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanaka87/i2vt-14b
- Página del proyecto: https://i2v-transfer.github.io/
- Código (GitHub): https://github.com/HorizonWind2004/i2v-transfer
- Dataset I2VT-17K: https://huggingface.co/datasets/sanaka87/I2VT-17K
- Benchmark OpenVE++: https://huggingface.co/datasets/sanaka87/OpenVEPP-Bench
- Modelo base Bernini-R-Diffusers: https://huggingface.co/ByteDance/Bernini-R-Diffusers
- arXiv: pendiente de publicación ("coming soon")
