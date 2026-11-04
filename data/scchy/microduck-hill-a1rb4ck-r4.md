# SccHy/microduck-hill-a1rb4ck-r4

## Resumen

hill-a1rb4ck-r4 es una política de control motriz (locomoción) entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. El modelo se distribuye como un artefacto ONNX autocontenido que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, y está pensado para ejecutarse de forma continua en el propio robot (política "perpetua", sin condición de terminación). Lo publica el usuario SccHy en Hugging Face, con arquitectura y receta de entrenamiento heredadas del repositorio `pollen-robotics/microduck_rl`.

Se trata de un modelo muy pequeño y de nicho: no es un modelo de lenguaje ni un modelo fundacional multimodal, sino un controlador de gait para robótica. Su relevancia es la de un ejemplo reproducible de publicación de políticas RL para robótica de bajo coste, con un formato de despliegue estandarizado (manifiesto de política schema 2) y normalización de observaciones integrada en el propio ONNX.

La información pública es mínima: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, y no se declaran licencia ni idiomas. La model card se limita a describir el contrato de observación/acción, el comando de carga en robot y los datos de la receta de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con RL; pesos exportados a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura de la red (número de capas, tipo de capa, tamaño de las hidden units). Lo que sí se especifica es el contrato de interfaz: entrada de 61 dimensiones de observación y salida de 14 acciones, ejecutadas a 50 Hz. La normalización de observaciones está integrada dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar. El modelo se describe como una política "perpetua": no tiene condición de parada interna y se ejecuta hasta que el operador la detiene, comportándose como un gait continuo cargado en un slot de política del daemon.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `challenge-recipe-publishing`, commit `1efd853be`. No se publican el número de pasos de entrenamiento, la composición del dataset (en RL se trataría de entornos simulados), ni detalles sobre recompensas, dominio de aleatorización o técnicas de regularización. Tampoco se indica si hubo destilación, ajuste fino posterior o currículo de tareas.

## Capacidades

- Locomoción continua del robot microduck: genera 14 acciones de control a 50 Hz a partir de 61 observaciones.
- Política perpetua: no termina por sí sola, adecuada para gaits sostenidos.
- Normalización de observaciones embebida en el ONNX: acepta observaciones en bruto.
- Carga estandarizada mediante `robotctl policy load <slot> ...` en el daemon de microduck.
- Compatible con el manifiesto de política schema 2.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un controlador específico de robótica.

## Casos de uso

- Despliegue de un gait por defecto en un microduck físico: cargar la política en un slot y dejarla correr de forma continua para locomoción básica en pruebas de laboratorio.
- Evaluación comparativa de recetas de RL: al estar publicada la rama y el commit de entrenamiento, sirve como referencia reproducible frente a otras políticas del mismo repositorio.
- Docencia y prototipado en robótica de bajo coste: el formato ONNX y el comando de carga simplifican la puesta en marcha en talleres y cursos.
- Pruebas de integración del daemon: validar el pipeline de carga de políticas, el manifiesto schema 2 y la interfaz de observación/acción de 61/14 dimensiones.
- Benchmarking de controladores en simulación: ejecutar la política en un simulador compatible con el contrato de observaciones para medir estabilidad de la marcha.
- Base para ajuste fino o destilación: partir de esta política como inicialización en nuevas recetas de RL sobre microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,0 GB) y el tipo de tarea, la inferencia es de muy baja exigencia y probablemente ejecutable en CPU.
- GPU recomendadas: no disponibles; no se requiere GPU dedicada para un controlador ONNX de este tipo.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo moderna, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: ONNX Runtime en el propio robot mediante el daemon microduck (`robotctl policy load`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el contrato de ejecución es de 50 Hz, lo que fija un presupuesto de 20 ms por paso de control.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables publicadas para microduck ni para robots cuadrúpedos de la misma categoría con las que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Información pública mínima: sin licencia declarada, sin idiomas, sin especificaciones de arquitectura ni de parámetros.
- Licencia no disponible: no puede asumirse uso comercial; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Modelo de nicho: no es un modelo de lenguaje; no debe evaluarse con métricas de NLP ni usarse para tareas de texto.
- Sin datos de robustez: se desconoce el comportamiento ante perturbaciones, cambios de terreno o fallos de sensores.
- Política perpetua sin condición de parada: requiere supervisión externa para detener el robot.
- Riesgo de sobreajuste al entorno de entrenamiento: al no publicarse detalles de dominio de aleatorización, la transferencia del simulador al robot físico no está garantizada.
- Fecha de creación futura en los metadatos (2026-11-04): conviene verificar la integridad y procedencia del artefacto antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SccHy/microduck-hill-a1rb4ck-r4
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `1efd853be`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
