# hzxie/dynamic-vla-LIBERO

## Resumen

DynamicVLA (LIBERO) es un modelo vision-lenguaje-acción (VLA) orientado a la manipulación robótica de objetos dinámicos, desarrollado por Haozhe Xie y colaboradores y publicado en NeurIPS 2026. Este checkpoint concreto es la implementación en LeRobot del modelo DynamicVLA afinado sobre el conjunto de datos LIBERO (las cuatro suites), partiendo del modelo preentrenado en DOM (Dynamic Object Manipulation). Con 430,19 millones de parámetros, el modelo traduce observaciones visuales y consignas en lenguaje natural en secuencias de acciones motoras de bajo nivel para un brazo robótico simulado.

El modelo es relevante porque aborda un punto débil clásico de los VLA: la manipulación de objetos en movimiento, donde la latencia entre percepción y acción degrada el rendimiento. DynamicVLA se presenta como una arquitectura específicamente diseñada para este régimen dinámico, y este checkpoint ofrece resultados medibles tanto en el benchmark estándar LIBERO (95,5 % de tasa de éxito media) como en el exigente LIBERO-Plus en modo zero-shot (61,4 % sobre 10.030 variantes perturbadas).

La ficha se centra en el uso práctico del checkpoint: evaluación con `lerobot-eval`, requisitos de despliegue en simulación y expectativas realistas de robustez ante perturbaciones de cámara, robot, lenguaje, iluminación, fondo, ruido y disposición espacial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) para manipulación robótica dinámica; implementación LeRobot |
| Parámetros totales | 430.190.944 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de LIBERO están en inglés, pero la model card no declara cobertura lingüística) |
| Licencia | slab-license (categoría `other`; ver archivo LICENSE del repositorio) |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tamaño del repositorio | 1,1 GB |
| Modelo base | hzxie/dynamic-vla-DOM |
| Pipeline | robotics |
| Dataset de entrenamiento | HuggingFaceVLA/libero (1.693 episodios) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de identificarla como un modelo vision-lenguaje-acción para manipulación de objetos dinámicos. El checkpoint se distribuye como política de LeRobot, lo que implica que el pipeline de inferencia espera observaciones de imagen junto con la instrucción de tarea y produce acciones continuas. El modelo parte de un preentrenamiento en DOM (Dynamic Object Manipulation) y se afina después sobre LIBERO.

El ajuste fino se realizó durante 40.000 pasos con tamaño de lote 72 (3 GPU × 24), optimizador AdamW, 1.000 pasos de calentamiento y una tasa de aprendizaje máxima de 1e-4 con decaimiento coseno hasta 2.5e-6. Se aplicó aumento de imagen sobre el dataset LIBERO. Las acciones de LIBERO se usan tal cual (`use_delta_action=false`) y se predicen en bloques de 10 pasos (`n_action_steps=10`). No se especifican en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones de 10 pasos a partir de observaciones visuales y una instrucción de tarea.
- Manipulación en cuatro suites LIBERO: Spatial, Object, Goal y LIBERO-10 (tareas de horizonte largo).
- Robustez zero-shot ante perturbaciones: evaluado en las siete dimensiones de LIBERO-Plus (cámara, robot, lenguaje, iluminación, fondo, ruido y disposición).
- Integración nativa con LeRobot: se carga como política (`--policy.path`) y se evalúa con `lerobot-eval`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de lenguaje general; el modelo es una política de control.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: no se documentan modos de pensamiento, visión general, audio ni otras modalidades fuera del pipeline robótico.

## Casos de uso

- Evaluación comparativa de políticas VLA en LIBERO: usar el checkpoint como referencia con `lerobot-eval` sobre `libero_spatial`, `libero_object`, `libero_goal` y `libero_10` para medir la tasa de éxito con 50 episodios por tarea, tal como reporta el autor.
- Estudio de robustez en simulación: ejecutar la evaluación zero-shot sobre LIBERO-Plus (10.030 variantes) para cuantificar la degradación ante cambios de cámara, iluminación, fondo o ruido, y comparar con el checkpoint afinado `dynamic-vla-LIBERO-Plus` (78,8 % total).
- Punto de partida para ajuste fino en dominios propios: al ser un checkpoint LeRobot con 430 M de parámetros y 1,1 GB, sirve como inicialización para afinar sobre nuevos datasets de manipulación con recursos moderados (el autor usó 3 GPU).
- Investigación en manipulación de objetos dinámicos: el preentrenamiento DOM y el diseño DynamicVLA permiten estudiar el efecto de la latencia percepción-acción en tareas con objetos en movimiento.
- Docencia y reproducción de resultados: el repositorio incluye comandos de evaluación reproducibles y una configuración de renderizado documentada (256×256, hard resets), lo que facilita replicar las cifras publicadas.
- Integración en pipelines de simulación con LeRobot: incorporar la política en entornos `libero` y `libero_plus` del ecosistema LeRobot para pruebas automatizadas de agentes manipuladores.

## Benchmarks y rendimiento

Tasas de éxito en LIBERO (10 tareas por suite, 50 episodios por tarea):

| Suite | Tasa de éxito (%) |
|---|---|
| LIBERO-Spatial | 96,6 |
| LIBERO-Object | 98,4 |
| LIBERO-Goal | 93,4 |
| LIBERO-10 | 93,6 |
| Media | 95,5 |

LIBERO-Plus zero-shot (10.030 variantes registradas, un episodio cada una), por dimensión de perturbación:

| Dimensión | Tasa de éxito (%) |
|---|---|
| Cámara | 38,5 |
| Robot | 63,7 |
| Lenguaje | 75,5 |
| Iluminación | 87,2 |
| Fondo | 52,9 |
| Ruido | 46,2 |
| Disposición | 71,7 |
| Total | 61,4 |

LIBERO-Plus zero-shot por suite:

| Suite | Tasa de éxito (%) |
|---|---|
| LIBERO-Spatial | 78,0 |
| LIBERO-Object | 71,9 |
| LIBERO-Goal | 42,1 |
| LIBERO-10 | 54,9 |
| Total | 61,4 |

Configuración de evaluación: LIBERO-Plus en el commit `4976dc3` con el entorno `libero_plus` de LeRobot, renderizado 256×256 y hard resets. El autor sustituyó `np.float_` por `np.float64` en el ruido de niebla del fork (eliminado en NumPy 2) y limitó el renderizado a 256×256 por esa misma restricción del fork.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 430,19 M de parámetros en safetensors y un repositorio de 1,1 GB, la inferencia en precisión nativa cabe holgadamente en GPUs de consumo actuales; el coste dominante en la práctica es el renderizado del simulador LIBERO.
- GPU recomendadas: no especificadas en la model card. El entrenamiento se realizó con 3 GPU (lote 24 por GPU), sin indicar el modelo.
- GPU de consumo: probablemente viable en RTX 4090 y gamas similares por tamaño del modelo, aunque el requisito real vendrá del simulador y del renderizado a 256×256; no hay confirmación del autor.
- Opciones de despliegue: LeRobot (`lerobot-eval`) con entornos `libero` y `libero_plus`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a una política robótica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO (media) | LIBERO-Plus (zero-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dynamic-vla-LIBERO | 430,19 M | no disponible | 95,5 % | 61,4 % | slab-license | Hugging Face (LeRobot) |
| dynamic-vla-LIBERO-Plus | no disponible | no disponible | no disponible | 78,8 % (tras ajuste en LIBERO-Plus) | no disponible | Hugging Face |
| dynamic-vla-DOM | no disponible | no disponible | no disponible (preentrenamiento DOM) | no disponible | no disponible | Hugging Face |

No se dispone en la información proporcionada de datos de otros modelos VLA comparables (por ejemplo, políticas OpenVLA o π0) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo con LIBERO, el modelo hereda las distribuciones de escenas, objetos e instrucciones de ese benchmark.
- Riesgo de degradación ante cambios de dominio: la caída en LIBERO-Plus es notable, especialmente en cámara (38,5 %), ruido (46,2 %) y fondo (52,9 %), frente al 95,5 % en LIBERO estándar.
- LIBERO-Goal es el punto más débil en zero-shot (42,1 %), lo que sugiere poca generalización a variaciones de objetivo.
- Limitaciones de idioma: no se declara cobertura multilingüe; las instrucciones de LIBERO están en inglés.
- Licencia: `slab-license` (categoría `other`); es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones no están resumidas en la model card.
- Entorno de evaluación frágil: el fork de LIBERO-Plus requiere parches (`np.float_` → `np.float64`) y renderizado máximo de 256×256; reproducir los números exige respetar esa configuración.
- Ámbito de uso: es una política de control robótico en simulación, no un modelo de lenguaje general; no debe emplearse para generación de texto, código o tareas conversacionales.
- Datos incompletos: no se publican detalles de arquitectura interna, contexto, cuantizaciones ni latencias, lo que limita la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hzxie/dynamic-vla-LIBERO
- Modelo base (DOM): https://huggingface.co/hzxie/dynamic-vla-DOM
- Checkpoint afinado en LIBERO-Plus: https://huggingface.co/hzxie/dynamic-vla-LIBERO-Plus
- Paper (arXiv): https://arxiv.org/abs/2601.22153
- Código DynamicVLA: https://github.com/hzxie/DynamicVLA
- LeRobot: https://github.com/huggingface/lerobot
- Dataset LIBERO: https://huggingface.co/datasets/HuggingFaceVLA/libero
- LIBERO-Plus: https://github.com/sylvestf/LIBERO-plus
- Documentación del entorno `libero_plus` en LeRobot: https://huggingface.co/docs/lerobot/libero_plus
