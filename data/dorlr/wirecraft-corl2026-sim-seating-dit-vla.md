# DORLR/wirecraft-corl2026-sim-seating-dit-vla

## Resumen

WireCraft CoRL 2026 — Simulation Straight-Channel Seating (DiT VLA, 300k) es un checkpoint de política robótica de tipo Vision-Language-Action (VLA) basado en un Diffusion Transformer (`multi_task_dit`), publicado por el autor DORLR como artefacto oficial del paper CoRL 2026 del entorno WireCraft. El modelo resuelve una tarea concreta de manipulación de objetos deformables en simulación: el ensartado (seating) de un cable en un canal recto, usando un brazo UR5 sobre el simulador Isaac Lab. Su relevancia es acotada y experimental: no es un modelo de propósito general, sino un checkpoint de evaluación de benchmark reproducible para la comunidad de robótica.

El modelo combina condicionamiento visual y textual mediante CLIP ViT-B/16 (`openai/clip-vit-base-patch16`) con un backbone de difusión tipo transformer que genera secuencias de acciones. Cuenta con 334.692.615 parámetros totales y un repositorio de 1,3 GB en formato safetensors. Se entrenó sobre 1.000 episodios scriptados a 30 FPS del dataset `DORLR/Deformable-StraightChannel-v0-Scripted-1000-aug08-1`, hasta el paso 300.000 con batch size 32 y learning rate 2e-5.

El checkpoint está pensado exclusivamente para evaluación en simulación del benchmark de straight-channel seating (Tabla 2 del paper), no para despliegue en robot real ni para tareas fuera de dominio. El resultado reportado en el paper es de 15,62 ± 12,88 % de éxito sobre tres semillas de evaluación, lo que refleja una tarea difícil con alta varianza entre semillas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para Vision-Language-Action (`multi_task_dit`), condicionado por CLIP ViT-B/16 |
| Parámetros totales | 334.692.615 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 32 pasos, `n_obs_steps=2`, `n_action_steps=24`) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (condicionamiento textual vía CLIP ViT-B/16 en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` y normalizadores pre/postproceso reconstruidos |

## Arquitectura y entrenamiento

La arquitectura es un Diffusion Transformer que actúa como política VLA: recibe observaciones visuales y una instrucción textual codificadas con CLIP ViT-B/16 y genera trayectorias de acción mediante un proceso de difusión. La configuración de control es de horizonte 32 (`horizon=32`), con 2 pasos de observación (`n_obs_steps=2`) y 24 pasos de acción ejecutables (`n_action_steps=24`). La normalización de estados y acciones es `MIN_MAX` con `use_imagenet_stats=true`, derivada de las estadísticas del dataset de entrenamiento.

El entrenamiento se realizó sobre 1.000 episodios scriptados a 30 FPS en el entorno `WireCraft-UR5-Deformable-StackedCuboid-StraightChannel-v0` de Isaac Lab, con batch size 32, learning rate 2e-5, semilla 1000 y un total de 300.000 pasos. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineamiento. El preset de paper es `scripts/wirecraft/experiments/corl2026_straight_channel.yaml` sobre la rama `corl2026-repro` del repositorio GitHub de WireCraft. El checkpoint original se archivó como artefacto de W&B (run `svwap72f`); el `config.json` y los safetensors de normalización se reconstruyeron de forma determinista a partir de esa configuración y de `meta/stats.json` del dataset.

## Capacidades

- Generación de secuencias de acción para control robótico de un brazo UR5 en simulación (Isaac Lab).
- Manipulación de objetos deformables: ensartado de cable en canal recto (straight-channel seating).
- Condicionamiento multimodal: observaciones visuales más instrucción textual codificadas con CLIP ViT-B/16.
- Política multi-tarea a nivel de arquitectura (`multi_task_dit`), aunque el checkpoint se distribuye y evalúa para una única tarea.
- Planificación de acciones en bloque: predice 32 pasos y ejecuta 24 por inferencia.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento general, matemáticas, código ni otras capacidades de lenguaje más allá del condicionamiento textual.

## Casos de uso

- Evaluación de benchmark en simulación: reproducción de la Tabla 2 del paper CoRL 2026 para la tarea de straight-channel seating, usando el preset `corl2026_straight_channel.yaml` y las tres semillas de evaluación reportadas.
- Investigación en manipulación de objetos deformables: servir como línea base DiT VLA frente a la que comparar nuevas políticas de ensartado de cable.
- Estudio de políticas de difusión para control: analizar el efecto del horizonte de acción (32) y del número de pasos ejecutables (24) en la estabilidad del ensartado.
- Reproducibilidad de experimentos: al estar reconstruidos de forma determinista el `config.json` y los normalizadores, permite reejecutar exactamente el run `svwap72f` en Isaac Lab.
- Comparación de arquitecturas VLA: contraste de un DiT con condicionamiento CLIP frente a políticas tipo ACT o diffusion policy clásicas en la misma tarea.
- Análisis de varianza entre semillas: el resultado de 15,62 ± 12,88 % hace de este checkpoint un caso de estudio útil sobre sensibilidad a la inicialización en tareas de contacto deformable.
- Docencia y divulgación en robótica: ejemplo completo y reproducible de pipeline LeRobot (dataset, entrenamiento, checkpoint y evaluación) para una tarea de manipulación difícil.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Contexto |
|---|---|---|---|
| WireCraft Straight-Channel Seating (Tabla 2, paper CoRL 2026) | Tasa de éxito (%) | 15,62 ± 12,88 | Media ± desviación sobre 3 semillas de evaluación, simulación |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros), lo cual es coherente con la naturaleza de política robótica del modelo. No se dispone de comparaciones numéricas con otras políticas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 334,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 1,3 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo una vez cargado el codificador CLIP ViT-B/16.
- GPU recomendadas: no disponible en la información del autor. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para el checkpoint y el codificador visual.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, aunque el requisito real lo impone el simulador Isaac Lab, que requiere GPU dedicada y es el cuello de botella habitual.
- Opciones de despliegue: librería LeRobot (formato nativo del checkpoint); la evaluación se realiza en Isaac Lab con el preset de WireCraft. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política ejecuta bloques de 24 acciones por inferencia sobre un horizonte de 32, lo que reduce la frecuencia de llamadas al modelo, pero no se publican cifras de latencia.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos comparables (por ejemplo, otras políticas VLA o diffusion policies evaluadas en la misma tarea). La comparación cualitativa posible es la siguiente:

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| DORLR/wirecraft-corl2026-sim-seating-dit-vla | DiT VLA | 334,7 M | no disponible | Straight-channel seating (simulación) | no disponible |
| Otras políticas del paper WireCraft CoRL 2026 | no disponible | no disponible | no disponible | misma tarea | no disponible |
| Políticas diffusion/ACT genéricas de LeRobot | diffusion policy / ACT | no disponible | no disponible | manipulación general | no disponible |

No disponible: comparación cuantitativa de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Ámbito restringido: el propio autor indica que el checkpoint debe usarse únicamente para evaluación del benchmark de straight-channel seating en simulación (Tabla 2); no está validado para robot real ni para otras tareas.
- Rendimiento bajo y alta varianza: 15,62 ± 12,88 % de éxito sobre tres semillas implica una desviación estándar casi tan grande como la media, lo que desaconseja cualquier interpretación de robustez.
- Licencia no disponible: no se puede asumir permiso de uso comercial; debe contactarse con el autor antes de cualquier uso más allá de la evaluación académica.
- Idiomas no declarados: el condicionamiento textual usa CLIP ViT-B/16, entrenado principalmente en inglés; no hay soporte multilingüe documentado.
- Sesgos: no documentados por el autor; al entrenarse con 1.000 episodios scriptados en un único entorno simulado, hereda los sesgos y la distribución estrecha de esa política scriptada.
- Riesgo de alucinación en el sentido de acciones no válidas: como política generativa por difusión, puede producir trayectorias fuera de distribución ante observaciones no vistas; no se documentan mecanismos de seguridad o filtrado.
- Empaquetado reconstruido: el `config.json` y los normalizadores no son los originales del artefacto de W&B, sino reconstruidos de forma determinista; pequeñas discrepancias de reproducibilidad son posibles.
- Dependencia fuerte del simulador: la evaluación requiere Isaac Lab y el entorno WireCraft en la rama `corl2026-repro`, lo que limita la portabilidad.
- Sin datos de cuantización ni de despliegue en producción: no hay guías de exportación a TensorRT, ONNX u otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DORLR/wirecraft-corl2026-sim-seating-dit-vla
- Dataset de entrenamiento: https://huggingface.co/datasets/DORLR/Deformable-StraightChannel-v0-Scripted-1000-aug08-1
- Repositorio WireCraft (rama de reproducción): https://github.com/DORLR/WireCraft/tree/corl2026-repro
- Codificador CLIP ViT-B/16: https://huggingface.co/openai/clip-vit-base-patch16
- Paper CoRL 2026: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible
