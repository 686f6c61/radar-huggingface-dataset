# Gospe1/adaspevla-franka-bread-v1-1

## Resumen

AdaSpeVLA Franka bread v1.1 es un modelo de acción visual-lenguaje (VLA, Visual-Language-Action) orientado a robótica manipulativa, publicado por el usuario Gospe1 en HuggingFace. Se trata de un ajuste fino de la arquitectura π₀.₅ (pi05) sobre el robot Franka, especializado en una única tarea: la manipulación de pan (bread). El paquete contiene únicamente el producto de entrenamiento (`model/final.pt`) del cabezal AdaSpeVLA, no el backbone completo, que debe obtenerse por separado desde `lerobot/pi05_base` y `google/paligemma-3b-pt-224` en revisiones concretas y fijadas.

El modelo parte de un backbone π₀.₅ con torre visual completa y las seis primeras capas del modelo de lenguaje congeladas; solo se entrena el cabezal AdaSpeVLA. El entrenamiento se realizó sobre las 100 demostraciones de bread disponibles, con 40.000 pasos de acción y 10.000 pasos de timing, batch de 64, sin conjunto de validación reservado. El repositorio ocupa 0,1 GB y no incluye los pesos del backbone congelado.

Es relevante ahora como ejemplo de flujo de transferencia de políticas VLA preentrenadas a tareas concretas de manipulación con hardware Franka, pero debe tratarse como un artefacto de investigación sin evaluación en robot real: el propio autor indica que no se ha completado la validación en hardware ni el mapeo de eventos de pinza. La licencia no está declarada y el modelo solo soporta inglés y la tarea bread.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π₀.₅ (pi05) con torre visual PaliGemma y cabezal AdaSpeVLA |
| Parametros totales | no disponible (el paquete solo contiene el cabezal; el backbone se distribuye aparte) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `final.pt`, formato PyTorch) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model/final.pt`); backbone en caché HF de `lerobot/pi05_base` y `google/paligemma-3b-pt-224` |
| Entradas | 2 imagenes uint8 128x128x3 (principal y wrist), estado 19D, tarea (texto) |
| Salidas | 11 puntos de control, trayectoria de ~1,2 s, 13 puntos de referencia, intervalos de consulta 0,2-0,8 s |
| Frecuencia de control | 10 Hz (control_dt = 0,1 s) |
| Escalas de accion | traslacion /0,023; rotacion /0,095; pinza en [0,1] |
| Revisiones fijadas | pi05_base `22c30e5b34f9e7ab738b1b34fc2fc5ecfe2d28f0`; paligemma-3b-pt-224 `35e4f46485b4d07967e7e9935bc3786aad50687c` |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅, un VLA que combina una torre visual PaliGemma con un modelo de lenguaje y un cabezal de predicción de acciones. En este ajuste, la torre visual completa y las seis primeras capas del modelo de lenguaje permanecen congeladas, y solo se entrena el cabezal AdaSpeVLA. La entrada visual se procesa internamente a 224 con padding, aunque el modelo recibe imágenes de 128x128; el estado de 19 dimensiones se transforma internamente en posición 3, las dos primeras columnas de la matriz de rotación 6 y apertura de pinza 1, aplicando la normalización del checkpoint.

El entrenamiento se realizó sobre las 100 demostraciones de bread, sin conjunto de validación reservado, con 40.000 pasos de acción y 10.000 pasos de timing, batch de 64. No se documenta el número de tokens de entrenamiento, la composición del dataset más allá de las demostraciones de bread, ni si hubo RLHF o DPO. La innovación principal es la incorporación de un cabezal AdaSpeVLA sobre un backbone VLA preentrenado, con un esquema de predicción de trayectorias de 11 puntos y consulta adaptativa en intervalos de 0,2 a 0,8 s, además de una ejecución de spline síncrona con `action_frame='episode_reset'`.

## Capacidades

- Generación de trayectorias de manipulación para el robot Franka en la tarea bread.
- Predicción de pose objetivo absoluta en coordenadas de episode reset (xyz + cuaternión wxyz, escalar primero).
- Predicción de apertura de pinza en el rango [0,1], con valor bruto conservado para auditoría.
- Consulta adaptativa con 11 puntos de control y 13 puntos de referencia en una ventana de ~1,2 s.
- Conversión a incrementos locales 6D normalizados mediante escalas fijas (traslación /0,023, rotación /0,095).
- Consumo de dos vistas (imagen principal y wrist) y estado 19D del colector.
- Soporte de una única instrucción de tarea (`bread`) definida en `metadata/tasks.json`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual general.
- No dispone de modo thinking, visión general, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- **Transferencia de políticas VLA a una tarea concreta**: el modelo sirve como referencia de cómo ajustar un backbone π₀.₅ congelado a una tarea de manipulación concreta (bread) entrenando solo el cabezal, reduciendo el coste computacional frente a un ajuste completo.
- **Evaluación en modo sombra (shadow mode)**: permite leer observaciones en tiempo real y registrar predicciones sin enviar acciones al robot, lo que resulta adecuado para validar dirección, unidades, amplitud y comportamiento de timeout antes de cualquier despliegue real.
- **Pruebas de interfaz y calibración de sensores**: el paquete incluye `verify_bundle.py` y un modo `--self-test` que comprueba forma, valores y geometría de las muestras, útil para verificar el pipeline de cámaras, orden de estado y definición de reset antes de la integración.
- **Investigación en ejecución con spline síncrona**: la clase `SynchronousSplineExecutor` con `action_frame='episode_reset'` y `control_dt=0.1` permite estudiar la ejecución de trayectorias predichas con reconsulta en los ticks 2 a 8, comparando intervalos fijos frente a adaptativos.
- **Banco de pruebas de mapeo de pinza**: el modelo predice apertura en [0,1], pero el colector espera eventos de cierre/apertura/hold; sirve para desarrollar y validar la capa de mapeo de eventos, umbrales e histéresis antes de integrarla en el runtime del robot.
- **Reproducibilidad de experimentos de robótica**: al fijar revisiones concretas de `pi05_base` y `paligemma-3b-pt-224` y exigir un `HF_HOME` con la caché correcta, el paquete facilita la reproducción de un pipeline de inferencia offline en entornos controlados.
- **Formación de equipos de integración**: la documentación de la interfaz mínima (entrada de imágenes, estado 19D, conversión a incrementos y eventos de pinza) sirve como guía de integración para ingenieros que conectan políticas VLA con controladores Franka.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha completado la evaluación en robot real y que no existe conjunto de validación reservado; las muestras incluidas provienen de los datos de entrenamiento y solo sirven para autocomprobación de la interfaz.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada. El paquete de 0,1 GB solo contiene el cabezal; el backbone requiere la caché de `lerobot/pi05_base` y `google/paligemma-3b-pt-224`, cuyo consumo no se detalla. El autor menciona un paquete de backbone offline de 14 GB de la primera versión.
- **GPU recomendadas**: no disponible. El código de inferencia se configura con PyTorch 2.7.1 y CUDA 12.8 (`cu128`), y el ejemplo usa `device='cuda:0'`.
- **Compatibilidad con GPU de consumo**: no confirmada; depende del backbone completo, no incluido en el paquete.
- **Opciones de despliegue**: inferencia propia del paquete mediante `inference.py` y la clase `FrankaPredictor`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo VLA.
- **Latencia y throughput**: no disponibles. El autor indica que la latencia real de inferencia bloqueante debe medirse aparte y que el reloj de 10 Hz es el de exportación de datos, no una garantía del controlador en campo.
- **Requisitos de entorno**: Linux, Python 3.12, `torch==2.7.1`, `torchvision==0.22.1`, `requirements-inference.txt`, y un `HF_HOME` con caché offline preparada mediante `franka_v1_backbone_cache.tar`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaSpeVLA Franka bread v1.1 | VLA (π₀.₅ + cabezal AdaSpeVLA) | no disponible (solo cabezal en el paquete) | no disponible | no disponible | HuggingFace, repo de 0,1 GB |
| π₀.₅ (`lerobot/pi05_base`) | VLA base | no disponible en la información | no disponible | no disponible | HuggingFace, caché requerida |
| PaliGemma 3B PT 224 (`google/paligemma-3b-pt-224`) | VLM (torre visual del backbone) | ~3B | no disponible | no disponible | HuggingFace, revisión fijada |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a su rol en el pipeline (backbone base, torre visual y cabezal ajustado).

## Limitaciones y advertencias

- **Sin evaluación en robot real**: el autor confirma que no se ha completado la integración con hardware, el mapeo de eventos de pinza ni la evaluación en bucle cerrado.
- **Sin conjunto de validación**: las 100 demostraciones se usaron íntegramente para entrenamiento, por lo que no hay métricas de generalización.
- **Tarea única**: el modelo solo está entrenado para bread; no debe esperarse comportamiento correcto en otras tareas.
- **Idioma**: solo inglés; las instrucciones de tarea deben ser las de `metadata/tasks.json`.
- **Dependencia estricta de revisiones**: la interfaz verifica que `refs/main` de `pi05_base` y `paligemma-3b-pt-224` apunten a las revisiones indicadas; no se puede cargar con una política LeRobot nativa.
- **Pinza**: no se debe introducir el ancho 0–1 directamente en `action[6]`; el colector espera eventos de cierre/apertura/hold con umbral ±0,5 tras multiplicar por 1,5.
- **Escalas de acción**: los incrementos 6D normalizados usan escalas fijas (0,023 y 0,095) que deben coincidir con el controlador de campo; no son posiciones articulares ni velocidades.
- **Riesgo de alucinación**: no aplica en el sentido textual, pero sí existe riesgo de predicciones de trayectoria inválidas fuera de distribución; el autor recomienda modo sombra y pruebas de pequeño desplazamiento antes de la ejecución completa.
- **Licencia no declarada**: no se puede confirmar el uso comercial; además, el backbone subyacente tiene sus propias licencias y permisos de acceso.
- **Información de campo incompleta**: se desconoce el modelo exacto de Franka (Panda o FR3), el TCP, la configuración de cámaras, la definición de reset, los límites de acción y la latencia de comunicaciones.
- **Sesgos**: no documentados; al entrenarse con un conjunto reducido de demostraciones de una sola tarea, es probable un sesgo hacia las condiciones y el entorno de recogida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gospe1/adaspevla-franka-bread-v1-1
- Backbone π₀.₅: https://huggingface.co/lerobot/pi05_base
- Torre visual PaliGemma: https://huggingface.co/google/paligemma-3b-pt-224
