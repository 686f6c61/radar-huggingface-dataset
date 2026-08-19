# marlon777777/smolvla-libero-task3-lora-r4

## Resumen

Este repositorio contiene un adaptador PEFT/LoRA de rango 4, no un modelo completo, que adapta el modelo base `HuggingFaceVLA/smolvla_libero` a la tarea LIBERO-Goal "open the top drawer and put the bowl inside". El adaptador fue entrenado y evaluado como parte del proyecto público de reproducción `smolvla-libero-repro`, con el objetivo de estudiar la eficiencia del fine-tuning con LoRA en modelos de visión-lenguaje-acción (VLA) para robótica.

El adaptador añade únicamente 294.144 parámetros entrenables (aproximadamente el 0,049% del total del modelo base), lo que permite un entrenamiento y una inferencia con requisitos de VRAM muy bajos: se entrenó en una GPU RTX 3060 Laptop con 5,65 GiB de VRAM utilizable y un pico de 2,27 GiB. Esto lo convierte en una opción interesante para investigación reproducible en entornos con recursos limitados, aunque su alcance está restringido al simulador LIBERO y no está validado para despliegue en robots reales.

La evaluación en la tarea objetivo muestra una mejora absoluta de +12,5 puntos porcentuales frente al checkpoint oficial (22,5% frente a 10%), aunque la significancia estadística no es concluyente (p-valor de McNemar = 0,2266). El adaptador se distribuye bajo licencia Apache 2.0 y está pensado exclusivamente para investigación y evaluación en el simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base VLA (SmolVLA) |
| Parametros totales | 294.144 (adaptador) / 605.228.320 (modelo base) |
| Parametros activos | 294.144 (solo los del adaptador; el base se congela) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador puede aplicarse sobre el base cuantizado) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en inglés, según el dataset LIBERO) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (junto con configuración de LeRobot) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `HuggingFaceVLA/smolvla_libero`, un VLA (vision-language-action) que combina un codificador visual, un modelo de lenguaje y una cabeza de acción para generar comandos de control en robótica. No se dispone de detalles adicionales sobre la arquitectura interna del modelo base en la información proporcionada.

El entrenamiento se realizó con el método LoRA (rank 4, alpha 4) sobre 36 episodios verificados del dataset `lerobot/libero`, con 7.157 frames en total. Se ejecutaron 1.790 pasos (aproximadamente una época) con batch size 4 y AMP (automatic mixed precision). El entrenamiento duró unos 9 minutos y 29 segundos en una RTX 3060 Laptop, alcanzando un pico de VRAM de 2,27 GiB. Se utilizó la librería LeRobot en su versión 0.6.2 (commit `6adf51511b7625090eade8d82d9f61a1846ebe56`).

## Capacidades

- Ejecuta la tarea específica de LIBERO-Goal: "open the top drawer and put the bowl inside" en el simulador LIBERO.
- Puede generalizar parcialmente a otras tareas del benchmark LIBERO-Goal (evaluación en 9 tareas no objetivo con 78,9% de éxito frente al 75,6% del checkpoint oficial).
- No es un modelo de propósito general: no genera texto, no razona sobre dominios abiertos, ni soporta tool calling o agentes.
- Capacidades multilingües: no aplicable (solo instrucciones en inglés del dataset).
- No incluye modo de pensamiento, visión general ni audio.

## Casos de uso

- Reproducción de investigaciones en VLA: permite reproducir los resultados del proyecto `smolvla-libero-repro` y verificar la eficacia del fine-tuning con LoRA en tareas de manipulación robótica simulada.
- Evaluación de adaptación eficiente de parámetros: sirve como caso de estudio para comparar el rendimiento de adaptadores LoRA de bajo rango frente a checkpoints entrenados de forma completa, en entornos con restricciones de VRAM.
- Desarrollo de pipelines de entrenamiento con LeRobot: el adaptador demuestra cómo integrar LoRA en el flujo de entrenamiento de LeRobot, incluyendo la configuración de datos, preprocesamiento y evaluación.
- Pruebas de generalización y olvido catastrófico: permite analizar si un adaptador entrenado en una tarea concreta degrada el rendimiento en otras tareas del mismo benchmark, como se documenta en la evaluación de las 9 tareas no objetivo.
- Entrenamiento en hardware de gama baja: con un pico de VRAM de 2,27 GiB, es un ejemplo práctico de cómo entrenar adaptadores VLA en GPUs de consumo (RTX 3060, 4060, etc.), útil para laboratorios con recursos limitados.
- Investigación sobre significancia estadística en evaluación robótica: los resultados con p-valor de McNemar y la comparación por semillas ofrecen un marco para discutir la fiabilidad de las métricas en benchmarks simulados.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación:

| Tarea | Checkpoint oficial | Adaptador LoRA (r4) | Diferencia |
|---|---|---|---|
| Tarea objetivo (LIBERO-Goal, 40 episodios, semillas 20/30/40/50) | 4/40 (10,0%) | 9/40 (22,5%) | +12,5 pp |
| 9 tareas no objetivo (LIBERO-Goal, semilla 0, 90 episodios) | 68/90 (75,6%) | 71/90 (78,9%) | +3,3 pp |

El p-valor de McNemar para la tarea objetivo fue de 0,2266, lo que indica que la mejora no es estadísticamente concluyente. En las tareas no objetivo, se observaron regresiones locales en las tareas 0, 1 y 6, aunque sin olvido catastrófico agregado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,27 GiB (pico observado durante el entrenamiento; la inferencia puede requerir algo menos).
- GPU recomendadas: cualquier GPU con al menos 3 GiB de VRAM; se ha validado en RTX 3060 Laptop (5,65 GiB utilizables).
- Compatible con GPUs de consumo: sí, incluyendo RTX 3060, RTX 4060, etc.
- Opciones de despliegue: el adaptador se usa dentro del framework LeRobot, con el script de evaluación proporcionado en el repositorio `smolvla-libero-repro`. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia generales.
- Latencia y throughput: no disponibles; depende del simulador LIBERO y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros entrenables | Contexto | Rendimiento en tarea objetivo | Licencia |
|---|---|---|---|---|---|
| `HuggingFaceVLA/smolvla_libero` (checkpoint oficial) | VLA completo | 605M (todos) | no disponible | 10,0% (4/40) | Apache 2.0 |
| `marlon777777/smolvla-libero-task3-lora-r4` | Adaptador LoRA sobre SmolVLA | 294K (0,049%) | no disponible | 22,5% (9/40) | Apache 2.0 |
| Otros adaptadores LoRA para VLA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores LoRA para SmolVLA en la información proporcionada.

## Limitaciones y advertencias

- El adaptador solo es válido para la tarea LIBERO-Goal especificada; no está validado para otras tareas, entornos o robots reales.
- Los resultados de la tarea objetivo no son estadísticamente concluyentes (p-valor = 0,2266); la mejora observada podría deberse al azar.
- La evaluación de olvido catastrófico se limita a LIBERO-Goal con semilla 0; no cubre otros suites ni semillas.
- El adaptador redistribuye los estados iniciales exitosos, pero no mejora todos los rollouts ni todas las tareas; se observaron regresiones locales en tareas no objetivo.
- Los resultados dependen de la revisión exacta de LeRobot, los assets del simulador, las semillas de reset y las opciones de renderizado/configuración documentadas en el repositorio fuente.
- Solo se publica el adaptador; el modelo base `HuggingFaceVLA/smolvla_libero` debe cargarse según su propia licencia y condiciones de uso.
- No está diseñado para despliegue en producción ni para control crítico de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marlon777777/smolvla-libero-task3-lora-r4
- Repositorio de reproducción (GitHub): https://github.com/2437buaa/smolvla-libero-repro
- Modelo base en HuggingFace: https://huggingface.co/HuggingFaceVLA/smolvla_libero
- Dataset LIBERO: https://huggingface.co/datasets/lerobot/libero
- Aviso de terceros: https://github.com/2437buaa/smolvla-libero-repro/blob/main/THIRD_PARTY_NOTICES.md
