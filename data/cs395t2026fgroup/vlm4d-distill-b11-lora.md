# CS395T2026FGroup/VLM4D-Distill-B11-LoRA

## Resumen

VLM4D-Distill-B11-LoRA es un adaptador LoRA para el modelo base BAAI/RoboBrain2.5-4B, desarrollado en el marco de un proyecto de curso (CS395T2026FGroup) bajo el nombre de proyecto VLM4D-Distill. Su propósito es dotar a un VLM de 4B parámetros de capacidades de point tracking 4D en vídeo: estimar trayectorias de puntos 3D y el movimiento de la cámara a partir de secuencias de vídeo, además de responder preguntas de razonamiento espacio-temporal sobre las mismas.

El adaptador se entrena sobre la arquitectura Qwen3-VL que implementa RoboBrain2.5-4B, congelando el codificador visual y entrenando únicamente los módulos LoRA de las capas del modelo de lenguaje (r=128, alpha=256) junto con el proyector visión-lenguaje y los tres mergers de DeepStack. El resultado es un checkpoint de 1,49 GB en float32 que se aplica sobre el modelo base mediante PEFT.

Es relevante porque demuestra que un ajuste fino de bajo rango sobre un VLM compacto puede abordar tareas de tracking 4D con resultados medibles en conjuntos como PointOdyssey, ADT y clips en primera y tercera persona, aunque se trata de un estudio a pequeña escala (dos RTX 3090, una semilla, conjuntos de evaluación de 50 a 200 clips) y con resultados mixtos en benchmarks de razonamiento general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL (modelo base RoboBrain2.5-4B) |
| Parámetros totales | No disponible (el adaptador LoRA ocupa 1,49 GB en float32; el modelo base es de 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos del adaptador en float32) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), config PEFT en JSON |

## Arquitectura y entrenamiento

El adaptador se aplica sobre RoboBrain2.5-4B, que sigue la arquitectura Qwen3-VL en transformers estándar (sin `trust_remote_code`). El entrenamiento congela el codificador visual y actualiza dos componentes: (1) módulos LoRA con r=128, alpha=256 y dropout 0,05 insertados en `q/k/v/o_proj` y `gate/up/down_proj` de todas las capas del modelo de lenguaje; y (2) el proyector visión-lenguaje (`visual.merger`) y los tres mergers de DeepStack, tratados como `modules_to_save` de PEFT.

Los datos de entrenamiento combinan cuatro fuentes: EgoDex (primera persona, etiquetas de MolmoMotion-1M, licencia CC BY-NC-ND 4.0), DROID (brazo robótico en tercera persona, CC BY 4.0), el split de entrenamiento de PointOdyssey (sintético, CC BY-NC-SA 4.0) y el subconjunto de 0-30 s de YouTube de LLaVA-Video-178K para QA general de vídeo. La mezcla de tareas es 0,4 trayectorias (subtask `track_cam_own`, puntos 3D y cámara estilo VGGT), 0,4 QA de plantilla 4D y 0,2 VQA general. Se aplicó aumento con recorte aleatorio y volteo horizontal (p=0,5 cada uno), muestreo de un fotograma de cada dos y resolución de 50.176-200.704 píxeles por fotograma.

El receta de entrenamiento usa el optimizador Muon con `adjust_lr_fn: match_rms_adamw`, learning rate 1e-5 constante tras un warm-up de 300 pasos, gradient clipping a 1,0 y bf16. El batch efectivo es de 32 (8 por GPU × acumulación 2 × 2 GPUs, con accelerate y FSDP2). El checkpoint publicado corresponde al paso 8000 (256.000 muestras) de una ejecución planificada para 10.000 pasos que se detuvo en el 9484. Se verificó que ningún clip de evaluación comparte vídeo fuente con el entrenamiento, incluyendo una comparación de hash perceptual que eliminó 15 clips parecidos.

## Capacidades

- Estimación de trayectorias de puntos 3D en vídeo (point tracking 4D), incluyendo puntos fuera de vista.
- Estimación del movimiento de cámara (pose relativa) a partir de secuencias de vídeo.
- Respuesta a preguntas de plantilla 4D sobre movimiento de objetos y cámara (acercarse/alejarse, izquierda/derecha, rotación, conteo, arriba/abajo, "no se mueve / no está").
- QA general de vídeo heredado del modelo base y del subconjunto de LLaVA-Video-178K.
- Procesamiento de vídeo en primera y tercera persona.
- Escalado del peso LoRA en inferencia para equilibrar precisión de trayectoria frente a QA general de vídeo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo thinking en la información disponible.

## Casos de uso

- Seguimiento de objetos manipulados en vídeo de primera persona: el adaptador estima trayectorias 3D de puntos concretos en secuencias de EgoDex, útil para analizar tareas de manipulación con manos y objetos en datos egocéntricos.
- Análisis de movimiento de brazos robóticos en tercera persona: sobre datos tipo DROID, permite extraer desplazamientos y trayectorias de puntos de interés para evaluar políticas de manipulación o depurar ejecuciones.
- Estimación de pose de cámara en vídeo: el modelo predice el movimiento relativo de cámara (ATE y rotación), aplicable a odometría visual aproximada o a la alineación de secuencias.
- Razonamiento espacio-temporal sobre vídeo: responder preguntas del tipo "¿el objeto se acerca o se aleja?", "¿se mueve a la izquierda o a la derecha?" o "¿cuántos objetos se mueven?", útil en sistemas de anotación asistida o control de calidad de datasets.
- Filtrado y curación de datasets de vídeo: usar el modelo para detectar clips con movimiento inconsistente o para verificar etiquetas de trayectoria antes de incorporarlos a un pipeline de entrenamiento.
- Investigación en tracking 4D con recursos limitados: al ser un adaptador LoRA sobre un VLM de 4B, permite reproducir y extender el estudio en dos GPU de 24 GB, sirviendo como línea base para experimentos académicos.
- Prototipado de robótica asistida: integración del seguimiento de puntos y cámara en bucles de percepción de bajo coste para tareas de imitación o evaluación de trayectorias, con la advertencia de que los resultados en ADT son peores que la línea base "stays put".

## Benchmarks y rendimiento

Errores: menor es mejor. Correlación: mayor es mejor. Líneas base: "stays put" (posición verdadera en el paso 0 y sin movimiento), "no motion" (desplazamiento cero desde el paso 0) y "camera still" (cámara inmóvil).

| Conjunto | Error de punto | Stays put | Error de desplazamiento | No motion | Correlación de desplazamiento | ATE de cámara (still) | Rotación de cámara ° (still) |
|---|---|---|---|---|---|---|---|
| PointOdyssey val, fuera de vista (200 ventanas) | 0,277 | 0,286 | 0,198 | 0,286 | 0,556 | 0,096 (0,083) | 6,04 (8,24) |
| ADT, fuera de vista (184) | 0,601 | 0,467 | 0,358 | 0,467 | 0,672 | 0,390 (0,410) | 13,0 (25,2) |
| Tercera persona, 50 clips | 0,158 | 0,400 | 0,154 | 0,400 | 0,901 | — | — |
| Primera persona, 50 clips | 0,149 | 0,231 | 0,140 | 0,231 | 0,748 | 0,034 (0,040) | 1,72 (2,49) |

Precisión en VLM4D real (1.371 preguntas, 16 fotogramas, opción múltiple, en %):

| Peso LoRA | Todas | Rotación (76) | Acercarse/alejarse (163) | Izquierda/derecha (473) | "No se mueve / no está" (261) |
|---|---|---|---|---|---|
| Zero-shot base | 52,95 | 56,6 | 73,0 | 54,1 | 50,6 |
| 1,0 (entrenado) | 52,74 | 68,4 | 74,8 | 51,6 | 47,5 |
| 0,9 | 53,10 | 69,7 | 76,1 | 51,8 | 47,9 |
| 0,8 | 53,54 | 69,7 | 76,7 | 52,0 | 50,2 |
| 0,5 | 54,49 | 63,2 | 78,5 | 54,3 | 49,8 |

## Requisitos de hardware

- Entrenamiento: dos RTX 3090 (24 GB cada una), con accelerate y FSDP2, bf16 y batch de 8 por GPU con acumulación de gradiente 2.
- Inferencia: el adaptador ocupa 1,49 GB en float32 sobre el modelo base de 4B; la VRAM total depende de la cuantización y del backend, dato no especificado en la información disponible.
- GPU recomendadas: no disponibles de forma explícita; el entrenamiento se validó en RTX 3090 y la evaluación de recarga se hizo en una sola GPU con `model.liger=false`.
- Cabe en GPU de consumo: sí, el entrenamiento se realizó en RTX 3090; no se documentan pruebas en otras GPU de consumo.
- Opciones de despliegue: transformers 4.57.6 con PEFT 0.18.0 y torch 2.9.1; el proyecto incluye código propio (`vlm4d.evaluate`) que construye los prompts y parsea las respuestas. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLM4D-Distill-B11-LoRA (este) | Adaptador sobre base de 4B | No disponible | Point tracking 4D y QA de vídeo | Apache 2.0 (adaptador); datos de entrenamiento con licencias NC | Hugging Face, 0 descargas |
| BAAI/RoboBrain2.5-4B (base) | 4B | No disponible | VLM general y robótica | No disponible en la información | Hugging Face |
| Alternativas de tracking 4D | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Estudio a pequeña escala: un único entrenamiento, una semilla, dos RTX 3090 y conjuntos de evaluación de 50 a 200 clips; los resultados pueden no generalizar.
- En ADT el error de punto (0,601) es peor que la línea base "stays put" (0,467), lo que indica un rendimiento deficiente en ese dominio.
- En VLM4D real, el peso LoRA 1,0 empeora ligeramente la precisión global frente al zero-shot (52,74 % frente a 52,95 %) y reduce el rendimiento en "izquierda/derecha" y en "no se mueve / no está".
- Los tipos de pregunta de VLM4D se examinaron después de ver los resultados, por lo que las diferencias por tipo son exploratorias.
- Riesgo de alucinación y sesgos: no documentados explícitamente, pero inherentes a un VLM entrenado con datos de vídeo limitados y con mezcla de QA de plantilla.
- Restricciones de licencia: aunque el adaptador es Apache 2.0, parte de los datos de entrenamiento (EgoDex y PointOdyssey) tienen licencias no comerciales (CC BY-NC-ND 4.0 y CC BY-NC-SA 4.0), lo que puede condicionar el uso comercial del modelo derivado.
- El adaptador no registra el commit exacto del modelo base en `adapter_config.json`; se debe usar la revisión `ec4b3bf5e969b48ad17df432b479c10402a0079b` de BAAI/RoboBrain2.5-4B.
- No se incluyen estados de optimizador, FSDP ni RNG para reanudar el entrenamiento.
- Idiomas soportados no documentados; el modelo está orientado a tareas de vídeo y QA, no a generación de texto general multilingüe.
- Para reproducir los números exactos es necesario usar el código del proyecto, que construye los prompts y parsea las respuestas; el uso con prompts propios puede degradar el rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/CS395T2026FGroup/VLM4D-Distill-B11-LoRA
- Modelo base: https://huggingface.co/BAAI/RoboBrain2.5-4B
- Repositorio del proyecto VLM4D-Distill: no disponible
- Paper: no disponible
- Blog o demo: no disponible
