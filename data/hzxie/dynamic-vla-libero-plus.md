# hzxie/dynamic-vla-LIBERO-Plus

## Resumen

DynamicVLA (LIBERO-Plus) es un modelo de visión-lenguaje-acción (VLA) orientado a la manipulación robótica de objetos dinámicos. Lo desarrolla Haozhe Xie y colaboradores, y esta ficha concreta es la implementación en LeRobot del checkpoint DynamicVLA afinado sobre el conjunto de datos LIBERO-Plus, partiendo del modelo DynamicVLA-LIBERO. El modelo resuelve el problema de transferir instrucciones en lenguaje natural e imágenes de cámara a secuencias de acciones motoras en un brazo robótico, y su relevancia radica en que mejora sustancialmente la robustez frente a perturbaciones visuales (iluminación, fondo, ruido, cambio de cámara) respecto a su predecesor.

El checkpoint tiene 430.190.944 parámetros (aproximadamente 430 millones) y se distribuye en formato safetensors bajo la librería LeRobot, con un tamaño de repositorio de 1,1 GB. Un único checkpoint cubre las cuatro suites de LIBERO (Spatial, Object, Goal y 10), lo que simplifica el despliegue. Está publicado bajo licencia `slab-license` (etiquetada como `other`), por lo que las condiciones de uso comercial deben consultarse en el fichero LICENSE del repositorio.

La información pública disponible no detalla la arquitectura interna (backbone visual, codificador de lenguaje ni cabecera de acciones), los idiomas soportados ni el número exacto de tokens de contexto, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA); backbone interno no disponible |
| Parametros totales | 430.190.944 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | slab-license (etiquetada como `other`) |
| Formato de pesos | safetensors (libreria LeRobot) |
| Entradas | imagenes de camara (frontal y muneca) a 256x256 e instruccion en lenguaje |
| Salidas | acciones de robot (n_action_steps=10) |
| Modelo base | hzxie/dynamic-vla-LIBERO |
| Dataset de entrenamiento | lerobot/libero_plus (14.347 episodios) |

## Arquitectura y entrenamiento

DynamicVLA es un modelo de visión-lenguaje-acción que combina percepción visual, comprensión del lenguaje y generación de acciones motoras. La model card no especifica el backbone visual ni el codificador de lenguaje, ni el mecanismo de fusion multimodal o de decodificacion de acciones; únicamente se indica que esta implementado sobre LeRobot y que predice bloques de 10 acciones (`n_action_steps=10`). El modelo base es DynamicVLA-LIBERO, del que este checkpoint es un ajuste fino.

El entrenamiento se realizó sobre `lerobot/libero_plus` (14.347 episodios) con aumento de imagen. Las cámaras del dataset se renombraron a los nombres de LIBERO mediante `--rename_map` (`observation.images.front` → `observation.images.image`, `observation.images.wrist` → `observation.images.image2`). Se entrenaron 80.000 pasos con batch size 72 (3 GPU × 24), optimizador AdamW, 1.000 pasos de warmup y una tasa de aprendizaje pico de 1e-4 con decaimiento coseno hasta 2,5e-6. Las acciones de LIBERO se usan tal cual (`use_delta_action=false`). No se documentan fases de RLHF o DPO.

## Capacidades

- Manipulación robótica guiada por lenguaje: ejecuta tareas descritas en lenguaje natural a partir de observaciones visuales de dos cámaras.
- Control de brazo robótico en entornos LIBERO: genera secuencias de acciones de 10 pasos por inferencia.
- Robustez a perturbaciones visuales: mantiene tasas de éxito altas bajo cambios de iluminación, fondo, ruido y cámara (ver benchmarks).
- Cobertura de cuatro suites con un único checkpoint: Spatial, Object, Goal y LIBERO-10.
- Integración con LeRobot: se evalúa y despliega mediante `lerobot-eval` y el entorno `libero_plus`.
- Capacidades multilingües: no disponible.
- Tool calling, agentes o modo de razonamiento explícito: no disponible; el modelo está especializado en control motor.

## Casos de uso

- Evaluación de investigación en manipulación: usar el checkpoint con `lerobot-eval` sobre las 10.030 variantes de LIBERO-Plus para medir robustez frente a cambios de cámara, robot, lenguaje, luz, fondo, ruido y disposición, aprovechando que un solo checkpoint cubre las cuatro suites.
- Benchmark de referencia para nuevos modelos VLA: emplear la tasa de éxito total de 78,8 como línea base contra la que comparar arquitecturas propias en el mismo entorno y commit (`4976dc3`).
- Despliegue en brazos robóticos de laboratorio: integrar el modelo en un pipeline LeRobot para ejecutar tareas de recogida y colocación descritas por el operador en lenguaje natural, con observaciones de cámara frontal y de muñeca a 256×256.
- Pruebas de robustez perceptual: someter al modelo a variaciones controladas de iluminación o ruido para caracterizar su degradación, dado que su rendimiento en esas condiciones (95,3 en luz, 83,9 en ruido) es notablemente superior al del modelo base.
- Ajuste fino sobre dominios propios: partir de este checkpoint (ya afinado desde LIBERO) para especializarlo en un conjunto de tareas robóticas propio con el mismo formato de datos LeRobot.
- Docencia y prototipado de VLA: utilizar el modelo como ejemplo reproducible de VLA de ~430 millones de parámetros que cabe en un repositorio de 1,1 GB y se evalúa con un comando único.

## Benchmarks y rendimiento

Tasas de éxito (%) en LIBERO-Plus (10.030 variantes registradas, un episodio por variante), según la model card:

| Modelo | Camera | Robot | Language | Light | Background | Noise | Layout | Total |
|---|---|---|---|---|---|---|---|---|
| DynamicVLA (LIBERO, zero-shot) | 38,5 | 63,7 | 75,5 | 87,2 | 52,9 | 46,2 | 71,7 | 61,4 |
| DynamicVLA (LIBERO-Plus, este modelo) | 83,2 | 54,5 | 73,3 | 95,3 | 94,1 | 83,9 | 76,3 | 78,8 |

Desglose por suite LIBERO:

| Modelo | LIBERO-Spatial | LIBERO-Object | LIBERO-Goal | LIBERO-10 | Total |
|---|---|---|---|---|---|
| DynamicVLA (LIBERO, zero-shot) | 78,0 | 71,9 | 42,1 | 54,9 | 61,4 |
| DynamicVLA (LIBERO-Plus, este modelo) | 90,9 | 88,8 | 55,4 | 81,5 | 78,8 |

Configuración de evaluación: LIBERO-Plus en el commit `4976dc3`, entorno `libero_plus` de LeRobot, renderizado a 256×256 y reinicios duros. No se han publicado en la información disponible comparaciones con otros modelos VLA distintos del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 430 millones de parámetros en safetensors (1,1 GB), la inferencia en precisión nativa requiere del orden de 1 a 2 GB de VRAM para los pesos, más memoria para activaciones y buffers de imagen.
- GPU recomendadas: no especificadas en la información disponible. El entrenamiento se realizó con 3 GPU (batch 24 por GPU); el modelo de evaluación no indica modelo de GPU.
- GPU de consumo: por tamaño de pesos, es plausible en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090 o RTX 4090), aunque no se confirma en la model card.
- Opciones de despliegue: `lerobot-eval` con `--policy.path=hzxie/dynamic-vla-LIBERO-Plus` y `--env.type=libero_plus`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LIBERO-Plus (total) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DynamicVLA (LIBERO-Plus) | 430 M | no disponible | 78,8 | slab-license | Hugging Face (LeRobot) |
| DynamicVLA (LIBERO) | no disponible | no disponible | 61,4 | no disponible | Hugging Face |
| Otros VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo base DynamicVLA-LIBERO, sobre el que este checkpoint mejora en 17,4 puntos porcentuales en el total de LIBERO-Plus y en las cuatro suites LIBERO. No se dispone de datos de otros modelos VLA de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en manipulación robótica en entornos LIBERO/LIBERO-Plus; no es un modelo de propósito general para texto, código o conversación.
- La model card no documenta sesgos, riesgos de alucinación ni comportamiento fuera de distribución más allá de las perturbaciones evaluadas.
- El rendimiento cae en la categoría Robot (54,5 frente a 63,7 del modelo base) y en Language (73,3 frente a 75,5), por lo que el ajuste fino no mejora todas las dimensiones.
- La evaluación usa un único episodio por variante, lo que reduce la fiabilidad estadística de las tasas de éxito.
- El entorno de evaluación requiere el commit `4976dc3` de LIBERO-Plus y un parche (`np.float_` → `np.float64`) por incompatibilidad con NumPy 2; además, el ruido de niebla asume imágenes de como máximo 256×256.
- Licencia `slab-license` (etiquetada como `other`): es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial o redistribución.
- No se especifican idiomas soportados ni longitud de contexto, lo que limita la planificación de despliegues con instrucciones largas o multilingües.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hzxie/dynamic-vla-LIBERO-Plus
- Modelo base: https://huggingface.co/hzxie/dynamic-vla-LIBERO
- Paper (arXiv): https://arxiv.org/abs/2601.22153
- Código DynamicVLA: https://github.com/hzxie/DynamicVLA
- LeRobot: https://github.com/huggingface/lerobot
- Dataset LIBERO-Plus: https://huggingface.co/datasets/lerobot/libero_plus
- Documentación del entorno libero_plus en LeRobot: https://huggingface.co/docs/lerobot/libero_plus
- Repositorio LIBERO-Plus: https://github.com/sylvestf/LIBERO-plus
