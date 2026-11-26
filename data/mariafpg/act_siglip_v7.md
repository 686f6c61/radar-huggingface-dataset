# MariaFPG/act_siglip_v7

## Resumen

ACT SigLIP v7 es una política robótica de imitación desarrollada por MariaFPG para el robot bimanual Trossen AI Stationary. Resuelve una tarea de manipulación concreta: coger un cubo de color (rojo, amarillo o verde) y colocarlo en la gaveta del mismo color. Su particularidad es que un único modelo cubre las tres variantes de la tarea, y la variante se selecciona mediante un comando de texto en lenguaje natural, en lugar de entrenar una política independiente por color.

Técnicamente se apoya en la arquitectura ACT (Action Chunking with Transformers) con un backbone ResNet-18 que predice chunks de 100 acciones sobre 14 articulaciones. El condicionamiento lingüístico se implementa mediante un token de lenguaje y modulaciones FiLM en las capas 2 a 4 del ResNet, usando embeddings de texto de `google/siglip-base-patch16-224` que quedan almacenados en los pesos. Incorpora además cabezas auxiliares de conclusión y progreso de subtarea que un planificador externo usa para avanzar por las fases pick → move → open → place → close.

El modelo tiene 54.283.158 parámetros, se distribuye en safetensors bajo licencia Apache 2.0 y requiere LeRobot 0.5.2. Es relevante como ejemplo de condicionamiento por lenguaje en políticas de imitación de bajo coste computacional, y porque reporta resultados reales en robot (54% de éxito en tarea completa sobre 41 intentos) frente a políticas por color entrenadas por separado (47% sobre 30 intentos), aunque el propio autor advierte que la diferencia no es estadísticamente significativa con esas muestras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone ResNet-18 y condicionamiento por lenguaje (token + FiLM en capas 2-4) |
| Parametros totales | 54.283.158 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa un comando de texto y observaciones por paso) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (los comandos de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La política sigue el esquema ACT: un codificador visual ResNet-18 procesa cuatro cámaras (`cam_high`, `cam_low`, `cam_left_wrist`, `cam_right_wrist`, a 640×480) junto con el estado de los dos brazos (7 dimensiones por brazo), y un transformer decodifica un chunk de 100 acciones correspondientes a la posición objetivo de ambos brazos. El condicionamiento por texto se inyecta de dos formas: como token de lenguaje en la secuencia y mediante modulaciones FiLM en las capas 2, 3 y 4 del ResNet. Los embeddings de texto provienen de `google/siglip-base-patch16-224` y están congelados dentro de los pesos del modelo. Se añaden dos cabezas auxiliares: una de conclusión y progreso de subtarea, consumida por el planificador externo, y otra de pegada usada únicamente durante el entrenamiento.

El entrenamiento se realizó en cuatro etapas secuenciales, cada una partiendo del checkpoint anterior. La etapa 1 entrenó 50k pasos desde cero sobre el dataset `v3_annotated` (210 episodios) con máscaras de imagen y augmentation; la etapa 2, 10k pasos sin augmentation afín y con mayor peso en la subtarea `open`; la etapa 3, 10k pasos con mayor peso en `place` y `close`; y la etapa 4, 15k pasos sobre el dataset `MariaFPG/place_the_cubes_in_the_drawers_v4` (300 episodios, 236 en entrenamiento), añadiendo 90 demostraciones y niveles de progreso. El checkpoint publicado es el `015000` de la etapa 4. El modelo se entrenó a 30 fps y se ejecuta a 20 Hz en el robot, con replanificación cada 30 pasos y crossfade de 20 entre chunks.

## Capacidades

- Generación de acciones robóticas bimanuales: predice chunks de 100 acciones sobre 14 articulaciones (posición objetivo de ambos brazos).
- Condicionamiento por lenguaje natural: un único modelo selecciona el color objetivo (rojo, amarillo o verde) a partir de un comando de texto como "pick up the red cube and place it inside the red drawer".
- Percepción multivista: consume cuatro cámaras simultáneas (alta, baja y dos muñecas) a 640×480.
- Planificación por subtareas: las cabezas de conclusión y progreso permiten a un planificador externo avanzar por la secuencia pick → move → open → place → close.
- Ejecución con reglas de seguridad: el script de despliegue soporta timeout de liberación de garra (`--release-timeout`) y cierre tras liberación (`--close-after-release`).
- No soporta tool calling, function calling, agentes de texto, matemáticas, visión general ni otras capacidades de un LLM; es una política de control motor especializada.

## Casos de uso

- Manipulación bimanual en laboratorio: ejecutar la tarea de coger y guardar cubos de color en gavetas sobre el Trossen AI Stationary, usando el comando de texto para cambiar de color sin recargar un modelo distinto.
- Investigación en condicionamiento por lenguaje para robótica: servir de base para estudiar cómo el texto modula políticas de imitación con FiLM y tokens de lenguaje, comparando con políticas por tarea entrenadas por separado.
- Automatización de tareas de pick-and-place en entornos controlados: el chunk de 100 acciones y la replanificación cada 30 pasos permiten ejecutar secuencias de agarre, apertura de gaveta, colocación y cierre con un único checkpoint.
- Benchmark de políticas de imitación: usar el protocolo de evaluación por intentos con posiciones fijas de cubo para comparar ACT con alternativas (Diffusion Policy, VQ-BeT, etc.) en la misma plataforma.
- Prototipado de planificadores jerárquicos: integrar las cabezas de progreso y conclusión en un planificador de subtareas para investigar transiciones automáticas entre fases.
- Educación y divulgación en robótica open source: al requerir LeRobot 0.5.2 y publicar código de entrenamiento y ejecución, sirve como ejemplo reproducible de un pipeline completo desde dataset hasta robot.

## Benchmarks y rendimiento

Resultados en robot real reportados en la model card, contados por intentos con el cubo en 6 posiciones fijas alternadas:

| Color | Cogió el cubo | Tarea completa |
|---|---|---|
| Rojo | 9/15 | 9/15 (60%) |
| Amarillo | 13/15 | 8/15 (53%) |
| Verde | 11/11 | 5/11 (45%) |
| **Total** | **33/41** | **22/41 (54%)** |

Referencia comparativa: ACT entrenados por separado para cada color obtuvieron 14/30 (47%) en la tarea completa. De los 22 éxitos, 21 fueron sin intervención humana; en 15 éxitos actuó la regla de liberación de garra tras 4 s de parada en `place`. El autor indica que las muestras son pequeñas y la diferencia frente a los ACT por color no es estadísticamente significativa. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 54,3 M de parámetros en safetensors (repo de 0,2 GB), el modelo es muy ligero y cabe holgadamente en GPUs de consumo, pero no se documentan cifras de VRAM.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con suficiente memoria para el backbone ResNet-18 y las cuatro cámaras debería bastar, pero el autor no especifica modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí por el reducido número de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot 0.5.2 con el plugin `lerobot_policy_act_siglip` y el script `scripts/run_act_siglip_robot.py` del repositorio de GitHub. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica).
- Latencia y throughput: entrenado a 30 fps y ejecutado a 20 Hz en el robot; replanificación cada 30 pasos con crossfade de 20. No se publican cifras de latencia por inferencia ni throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT SigLIP v7 (este) | 54,3 M | 4 cámaras 640×480 + estado 2×7 + comando de texto | 22/41 (54%) tarea completa | Apache 2.0 | Hugging Face + GitHub |
| ACT por color (referencia del autor) | no disponible | mismas entradas, sin condicionamiento por lenguaje | 14/30 (47%) tarea completa | no disponible | no disponible |
| Otras políticas de imitación (Diffusion Policy, VQ-BeT, etc.) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | no disponible |

No se dispone de datos comparativos con otras familias de políticas en la información proporcionada.

## Limitaciones y advertencias

- Agarres fallidos: el propio autor señala que la fase de pick falla en parte de los intentos, especialmente con el cubo rojo (9/15).
- Uso débil del color: en evaluación offline la razón de cambio de color fue ~1,07 frente a una meta de 1,2, lo que indica que el condicionamiento por lenguaje aún es modesto.
- Movimiento oscilante: los chunks predichos oscilan paso a paso; se recomienda la opción `--smooth-chunk 1` del script de robot para suavizar.
- Muestras pequeñas: los resultados (41 intentos) no permiten afirmar superioridad estadística frente a los ACT por color.
- Reglas de ejecución que inflan el éxito: 15 de los 22 éxitos dependieron de la regla de liberación de garra, no solo de la política.
- Especialización estrecha: solo cubre una tarea y una plataforma (Trossen AI Stationary); no es un modelo generalista ni un LLM.
- Idiomas: no se documentan; los comandos de ejemplo están en inglés.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantías de seguridad para operación fuera de laboratorio.
- Riesgo de sobreajuste al entorno de entrenamiento: posiciones fijas de cubo y condiciones controladas; no se reporta robustez ante cambios de iluminación, fondo u objetos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MariaFPG/act_siglip_v7
- Dataset de entrenamiento (etapa 4): https://huggingface.co/datasets/MariaFPG/place_the_cubes_in_the_drawers_v4
- Repositorio de código (plugin, planificador y scripts): https://github.com/MariaFernanda-2606/act-siglip-language-conditioning
- Embeddings de texto SigLIP: `google/siglip-base-patch16-224` (referenciado en la model card)
- LeRobot (librería requerida, versión 0.5.2): no se incluye enlace explícito en la información proporcionada
