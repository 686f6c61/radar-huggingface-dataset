# Low101/diffusion_parcel_b_80k

## Resumen

`diffusion_parcel_b_80k` es una política de imitación basada en Diffusion Policy, entrenada desde cero para una tarea concreta de clasificación de paquetes con un brazo robótico LeRobot SO-101. Lo desarrolla el usuario Low101 (TimeisGold5168) como parte de un proyecto de investigación sobre manipulación robótica con modelos VLA (vision-language-action) de bajo coste. El modelo no es un LLM ni un modelo generativo de texto: es un controlador de acciones que mapea observaciones multimodales (tres cámaras y el estado de las articulaciones) a consignas de posición articular.

La relevancia del modelo es doble. Por un lado, demuestra que es posible entrenar una política de difusión funcional en hardware de consumo (una única GPU de portátil con 6 GB de VRAM) en menos de 10 horas, lo que abarata enormemente la experimentación en robótica de imitación. Por otro, se publica con licencia Apache 2.0 y con el código completo en un repositorio de GitHub, lo que facilita su reproducción y su uso como punto de partida para ajuste fino en otros montajes.

Arquitectónicamente es una Diffusion Policy con un U-Net 1D de tres niveles (256, 512, 1024 canales) y 89 millones de parámetros según la model card (el fichero safetensors declara 102.285.958 parámetros totales, probablemente incluyendo componentes auxiliares del checkpoint). El contexto de entrada lo forman tres flujos de vídeo a 30 fps, el estado de 6 articulaciones y una instrucción textual de tarea; la salida son las consignas de las 6 articulaciones, generadas mediante muestreo DDIM con 10 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy con U-Net 1D (canales 256, 512, 1024); no es un transformer |
| Parametros totales | 102.285.958 (safetensors); la model card indica 89 M para la política |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; la observación es una ventana de imágenes a 30 fps y el estado actual |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors de precisión completa) |
| Idiomas soportados | no disponible; la instrucción de tarea está en inglés ("sort the parcel so the label faces down and push it off the table") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La política sigue el paradigma de Diffusion Policy: un U-Net 1D aprende a denoizar una secuencia de acciones futuras condicionada por las observaciones. La red tiene tres niveles de resolución con 256, 512 y 1024 canales y se entrena desde cero, sin inicialización desde pesos preentrenados. La inferencia usa muestreo DDIM con 10 pasos, lo que reduce el coste frente al muestreo completo. Las tres cámaras tienen resoluciones distintas (848×480 la superior, 640×480 la de muñeca y 640×480 la lateral), y el repositorio aplica un redimensionado por cámara antes de apilarlas (`patch_diffusion()` en `parcel_vla/training/train_mixed.py`), algo que el `lerobot-rollout` estándar no hace.

El entrenamiento se realizó sobre el dataset B: 99 demostraciones de teleoperación con 73.444 fotogramas en total, a 80.000 pasos, con batch de 16 y precisión mixta (AMP), durante 9,4 horas en una GPU de portátil con 6 GB de VRAM. Se usó LeRobot en el commit `64b23178`. No se menciona RLHF, DPO ni ningún ajuste por preferencias; es imitación supervisada pura sobre demostraciones humanas. La tarea aprendida es un ciclo completo de pick-and-place: coger un paquete de un montón, voltearlo si la etiqueta mira hacia arriba, y empujarlo fuera de la mesa con la etiqueta hacia abajo; un paquete equivale a un episodio.

## Capacidades

- Control robótico de manipulación: genera consignas de posición para las 6 articulaciones del seguidor SO-101 a partir de observaciones visuales y propioceptivas.
- Percepción multimodal: consume tres vistas de cámara simultáneas (superior, muñeca y lateral) más el estado articular.
- Condicionamiento por instrucción textual de tarea, aunque fija a una única frase en inglés.
- Ejecución de una secuencia de manipulación de varios pasos: agarre, volteo condicional según la orientación de la etiqueta y empuje fuera de la mesa.
- Inferencia rápida mediante DDIM de 10 pasos, adecuada para control a 30 fps.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni modo thinking. Es exclusivamente una política de acciones.

## Casos de uso

- Prueba del pipeline de LeRobot: sirve para validar la instalación, el formato de checkpoints y los scripts de rollout en un montaje SO-101 antes de entrenar políticas propias.
- Punto de partida para ajuste fino: al estar entrenado desde cero y con licencia Apache 2.0, se puede reentrenar con demostraciones de otro montaje y otra tarea de clasificación.
- Investigación en imitación con pocos datos: 99 demostraciones y 9,4 horas de entrenamiento en una GPU de 6 GB lo convierten en una referencia para estudiar la viabilidad de Diffusion Policy en hardware de consumo.
- Docencia y divulgación: la tarea de clasificación de paquetes es intuitiva y reproducible, útil para demostrar conceptos de robótica de imitación en cursos o talleres.
- Comparación de variantes de política: el autor publica una versión B-spline (`diffusion_bsp_parcel_b_40k`) que dio mejores resultados en robot, lo que permite comparar representaciones de acción sobre el mismo dataset.
- Prototipado de automatización logística a pequeña escala: como banco de pruebas de bajo coste para estudiar el volteo y empuje de paquetes según la orientación de la etiqueta antes de escalar a celdas industriales.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Error de acción offline (5 articulaciones, 1 s siguiente) | 2,02° | Episodios de entrenamiento |
| Pasos de entrenamiento | 80.000 | Batch 16, AMP |
| Tiempo de entrenamiento | 9,4 h | Una GPU de portátil, 6 GB |
| Pasos de inferencia | 10 (DDIM) | Por consigna de acción |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a una política robótica. El autor advierte que la mayoría de pruebas en robot tienen pocos ensayos y un solo montón por modelo, por lo que son indicativas y no una comparación controlada.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento cupo en 6 GB, por lo que la inferencia en precisión completa debería caber holgadamente en 4-6 GB, aunque no se da una cifra explícita.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; el autor usó una GPU de portátil de 6 GB. No se especifica modelo concreto.
- Cabe en GPU de consumo: sí, según el propio autor (6 GB).
- Opciones de despliegue: LeRobot en el commit `64b23178` con los scripts del repositorio (`parcel_vla/robot/run_parcel.sh diffusion_b`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; solo se indica que la inferencia usa DDIM con 10 pasos y que las cámaras van a 30 fps.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `diffusion_parcel_b_80k` | 102,3 M (safetensors) | Ventana de observación a 30 fps | Clasificación de paquetes con SO-101 | Apache 2.0 | Hugging Face |
| `diffusion_bsp_parcel_b_40k` | no disponible | no disponible | Misma tarea, representación B-spline | no disponible | Hugging Face (mismo autor) |
| Otras Diffusion Policy para SO-101 | no disponible | no disponible | Manipulación genérica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sobreajuste al montaje: el modelo aprendió una única escena (bandeja, poses de cámara, iluminación y paquetes caseros del autor). En otro montaje probablemente no funcione tal cual.
- Dataset pequeño y un solo operador: 99 demostraciones y un único teleoperador limitan la generalización.
- Validación débil: la mayoría de pruebas en robot tienen pocos ensayos y un solo montón por modelo; no constituyen una comparación controlada.
- Dependencia de versión: requiere LeRobot en el commit `64b23178` y el redimensionado por cámara del repositorio; el `lerobot-rollout` estándar no aplica ese preprocesado.
- Sin capacidades lingüísticas generales: la instrucción de tarea es fija y en inglés; no es un modelo conversacional ni multilingüe.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento; debe operarse con supervisión y límites de seguridad en el robot.
- Sesgos: no documentados por el autor; al ser imitación de un operador concreto, puede heredar sus sesgos de ejecución.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantías y la falta de validación fuera del montaje original hacen desaconsejable su despliegue en producción sin reentrenamiento y evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Low101/diffusion_parcel_b_80k
- Repositorio GitHub del proyecto: https://github.com/TimeisGold5168/Parcel_task_VLA_s0_101_arm
- Página del proyecto: https://timeisgold5168.github.io/
- Instrucciones de instalación: https://github.com/TimeisGold5168/Parcel_task_VLA_s0_101_arm#installation
