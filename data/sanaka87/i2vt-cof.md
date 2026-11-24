# sanaka87/i2vt-cof

## Resumen

I2VT-CoF es un adaptador LoRA para edición de vídeo basada en instrucciones, publicado por el usuario sanaka87 en Hugging Face. Se trata de un fine-tuning del editor de vídeo VideoCoF (a su vez un LoRA sobre el modelo de difusión Wan2.1-T2V-14B) mediante la técnica I2VT (Image-to-Video Transfer), descrita en el artículo *Improving and Expanding Video Editing Capabilities Without Videos*. El modelo resuelve el problema de la escasez de pares de vídeos editados para entrenar editores de vídeo: en lugar de requerir vídeos emparejados, aprovecha un editor de imágenes congelado (JoyAI-Image-Edit) para guiar el entrenamiento usando únicamente imágenes.

La relevancia del modelo radica en que mejora las ediciones básicas del benchmark OpenVE-Bench y amplía las capacidades del editor a cuatro tareas nuevas recogidas en OpenVE++: cambio de acción, cambio de expresión, movimiento corporal y reiluminación de escena. Todo ello sin cambios arquitectónicos y sin necesidad de nuevos vídeos emparejados, fine-tuneando únicamente un LoRA sobre el backbone congelado.

El repositorio ocupa 1,2 GB y contiene los pesos LoRA (rango 128, alpha 64), la configuración de entrenamiento y las puntuaciones por clip. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre VideoCoF, que es a su vez un LoRA sobre el DiT de Wan2.1-T2V-14B (difusión transformer texto-a-vídeo) |
| Parametros totales | no disponible (el LoRA tiene rango 128 y alpha 64 sobre todas las capas lineales del DiT; el backbone Wan2.1-T2V-14B tiene 14 000 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (genera clips de 33 fotogramas en la configuración oficial) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el backbone Wan2.1 admite cuantizaciones habituales de la comunidad, no documentadas aquí) |
| Idiomas soportados | no disponible (las instrucciones de edición se proporcionan en lenguaje natural; no se documenta cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`videocof_lora_step_200.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 128 y alpha 64 aplicado sobre todas las capas lineales del DiT de Wan2.1-T2V-14B, inicializado a partir del LoRA oficial de VideoCoF. Durante el entrenamiento, el backbone y el LoRA de aceleración (FusionX) permanecen congelados. La innovación central es I2VT: el editor de vídeo procesa cada imagen fuente como un vídeo de un solo fotograma y un editor de imágenes congelado (JoyAI-Image-Edit) guía su predicción en cada paso de la trayectoria de denoising, con una escala de guía de 2. Esto permite entrenar sin pares de vídeos editados, usando solo imágenes.

El fine-tuning se realizó sobre el dataset I2VT-17K con tasa de aprendizaje 5e-5, tamaño de lote de 48 imágenes fuente, 200 pasos y 10 pasos de rollout por imagen. VideoCoF genera un fotograma de razonamiento antes de los fotogramas editados, y la pérdida cubre únicamente el fotograma editado. En inferencia se siguen los ajustes oficiales de VideoCoF: 4 pasos de muestreo con el LoRA de aceleración FusionX, 33 fotogramas, un fotograma de razonamiento, time shift 5 y semilla 42, sin mejora de prompts.

## Capacidades

- Edición de vídeo basada en instrucciones en lenguaje natural (pipeline video-to-video).
- Ediciones básicas: estilo global, cambio local, cambio de fondo, eliminación local y adición local.
- Tareas nuevas de OpenVE++: cambio de acción, cambio de expresión, movimiento corporal y reiluminación de escena.
- Transferencia imagen-a-vídeo: aplicación de ediciones aprendidas sobre imágenes a clips completos en tiempo de test.
- Generación de un fotograma de razonamiento previo a los fotogramas editados.
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo thinking; el modelo es un editor de vídeo, no un LLM.

## Casos de uso

- Postproducción de vídeo publicitario: cambiar el estilo global o el fondo de un clip manteniendo la consistencia con la fuente, gracias a las mejoras medidas en Global Style (1,31 a 3,51) y Background Change (1,55 a 2,81) en OpenVE-Bench.
- Edición de actuaciones en vídeo: modificar la acción o la expresión de un sujeto en un clip existente mediante instrucciones, usando las nuevas tareas de OpenVE++ (Action Change y Expression Change) donde el modelo pasa de puntuaciones cercanas a 1,1 a más de 4,0 con el juez Gemini 3.8 Flash.
- Reiluminación de escenas: ajustar la iluminación de un plano rodado para integrarlo en una secuencia con distinta temperatura o dirección de luz, con una puntuación de 4,27 en Scene Relighting frente a 1,41 del base.
- Animación de personajes o avatares: aplicar movimiento corporal a una figura en un clip corto, aprovechando la tarea Body Movement (3,14 con Gemini 3.8 Flash).
- Limpieza y retoque de planos: eliminación o adición de elementos locales en un vídeo sin reescribir la escena completa, apoyándose en Local Remove (2,96) y Local Add (2,54).
- Prototipado rápido de efectos en pipelines de VFX: generar variantes editadas de un clip de 33 fotogramas con solo 4 pasos de muestreo gracias al LoRA de aceleración FusionX, lo que reduce el coste iterativo en previsualización.
- Investigación en edición de vídeo sin pares: servir como punto de partida reproducible para experimentos de I2VT, ya que se publican la configuración de entrenamiento y las puntuaciones por clip.

## Benchmarks y rendimiento

Resultados en OpenVE-Bench (ediciones básicas), puntuados por Gemini 2.5 Pro; cada juez puntúa de 1 a 5 el cumplimiento de la instrucción, la consistencia con la fuente y la calidad visual:

| Modelo | Global Style | Local Change | Background Change | Local Remove | Local Add | Overall |
|---|---|---|---|---|---|---|
| VideoCoF | 1,31 | 3,59 | 1,55 | 2,48 | 2,50 | 2,29 |
| I2VT-CoF | 3,51 | 3,81 | 2,81 | 2,96 | 2,54 | 3,13 |

Resultados en OpenVE++ (tareas nuevas):

| Modelo | Juez | Action Change | Expression Change | Body Movement | Scene Relighting | Overall |
|---|---|---|---|---|---|---|
| VideoCoF | Gemini 3.8 Flash | 1,11 | 1,12 | 1,00 | 1,41 | 1,16 |
| I2VT-CoF | Gemini 3.8 Flash | 4,07 | 4,53 | 3,14 | 4,27 | 4,01 |
| VideoCoF | Gemini 2.5 Pro | 1,21 | 1,26 | 1,04 | 1,27 | 1,20 |
| I2VT-CoF | Gemini 2.5 Pro | 3,11 | 3,93 | 2,36 | 3,84 | 3,31 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ejecutarse sobre Wan2.1-T2V-14B, requiere cargar el backbone de 14 000 M de parámetros además del LoRA, lo que implica huellas de memoria propias de un modelo de difusión de ese tamaño.
- GPU recomendadas: no especificadas en la información; por el tamaño del backbone se sitúa en el rango de GPUs de datacenter (A100, H100) o GPUs de consumo de gama alta con suficiente VRAM.
- ¿Cabe en GPU de consumo? No disponible; depende de la cuantización aplicada al backbone Wan2.1, no documentada en esta ficha.
- Opciones de despliegue: scripts de inferencia del repositorio de código (github.com/HorizonWind2004/i2v-transfer); carga mediante `diffusers` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles; la configuración oficial usa 4 pasos de muestreo con FusionX, 33 fotogramas y un fotograma de razonamiento, lo que reduce el número de pasos frente a la inferencia estándar.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tareas de edición | Overall OpenVE-Bench | Overall OpenVE++ (Gemini 3.8 Flash) | Licencia |
|---|---|---|---|---|---|---|
| I2VT-CoF | LoRA de edición de vídeo | Wan2.1-T2V-14B vía VideoCoF | Básicas + 4 nuevas | 3,13 | 4,01 | Apache 2.0 |
| VideoCoF | LoRA de edición de vídeo | Wan2.1-T2V-14B | Básicas | 2,29 | 1,16 | Apache 2.0 (según modelo base) |
| Wan2.1-T2V-14B | DiT texto-a-vídeo | — | Generación, no edición por instrucción | no disponible | no disponible | Apache 2.0 |

La comparación directa disponible se limita a VideoCoF, del que I2VT-CoF es un fine-tuning; no se han proporcionado datos de otros editores de vídeo comparables en la información disponible.

## Limitaciones y advertencias

- Riesgo de contenido engañoso: los pesos pueden alterar acciones y expresiones de personas reales en vídeos; el autor desaconseja explícitamente crear contenido engañoso sobre personas reales o sin su consentimiento, y pide etiquetar los vídeos editados como editados.
- Dependencia del backbone: requiere cargar Wan2.1-T2V-14B y sustituir el LoRA oficial de VideoCoF por `videocof_lora_step_200.safetensors`; no es un modelo autónomo.
- Cobertura de idiomas no documentada: no se especifica qué lenguas aceptan las instrucciones de edición.
- Longitud de clip limitada: la configuración oficial evalúa clips de 33 fotogramas; no se documenta comportamiento en vídeos más largos.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Alucinación visual: no se cuantifica la tasa de artefactos o inconsistencias; las puntuaciones de calidad visual son medias de evaluadores LLM (Gemini), no métricas objetivas.
- Madurez: el modelo tiene 7 descargas y 0 likes en el momento de la consulta, y el artículo (arXiv) aún no está publicado; la citación figura como "coming soon".
- Licencia: Apache 2.0 permite uso comercial, pero las restricciones de uso responsable del autor deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanaka87/i2vt-cof
- Modelo base: https://huggingface.co/XiangpengYang/VideoCoF
- Backbone: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Página del proyecto: https://i2v-transfer.github.io/
- Código: https://github.com/HorizonWind2004/i2v-transfer
- Dataset I2VT-17K: https://huggingface.co/datasets/sanaka87/I2VT-17K
- Benchmark OpenVE++: https://huggingface.co/datasets/sanaka87/OpenVEPP-Bench
- arXiv: pendiente de publicación ("coming soon")
