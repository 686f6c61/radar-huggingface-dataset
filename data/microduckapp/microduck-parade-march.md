# microduckapp/microduck-parade-march

## Resumen

`microduck-parade-march` es una política de control motriz (no un modelo de lenguaje) publicada por el usuario `microduckapp` en Hugging Face. Se distribuye como un artefacto ONNX que implementa un movimiento concreto de 11,5 segundos para el robot bípedo Microduck: una marcha en cuadrado con la barbilla levantada, un cabeceo en cada tiempo y giros cerrados en las esquinas. La política consume 61 observaciones por paso y emite 14 consignas articulares a 50 Hz.

El modelo pertenece al ecosistema del Microduck, un robot bípedo de 25 cm presentado por Pollen Robotics y Hugging Face como plataforma abierta de investigación en IA física. El repositorio acompaña al artefacto con un `manifest.json` que describe lo que el robot necesita para instalar y reproducir el movimiento, y un vídeo de previsualización. El repositorio ocupa 0,0 GB, lo que es coherente con una política de muy baja complejidad computacional, aunque el autor no publica el recuento de parámetros ni la topología de la red.

Su relevancia es práctica: muestra el formato de empaquetado de habilidades motrices reutilizables (`microduck-move`) para un robot abierto de bajo coste (399 dólares según la prensa especializada), con vocación de servir como plantilla para transferir comportamientos entrenados en simulación al hardware. No hay descargas ni valoraciones registradas, ni información sobre licencia, idiomas o datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de control neuronal exportada a ONNX; el autor no publica la topología de la red) |
| Parametros totales | No disponible (el repo ocupa 0,0 GB, compatible con un modelo de muy pocos parámetros, pero no se indica el recuento) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la entrada es un vector de 61 observaciones por paso de control) |
| Tipos de cuantizacion | No disponible (solo se distribuye el artefacto ONNX; no se documentan variantes cuantizadas ni precisiones intermedias) |
| Idiomas soportados | No aplica (no procesa lenguaje natural; no se documentan idiomas) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`); metadatos y requisitos de instalación en `manifest.json` |
| Tarea (pipeline) | `robotics` |
| Dimension de entrada | 61 observaciones por paso |
| Dimension de salida | 14 objetivos articulares (joint targets) |
| Frecuencia de control | 50 Hz (20 ms por ciclo) |
| Duracion del movimiento | 11,5 segundos |
| Etiqueta de familia | `microduck-move` |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-27 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red: se sabe únicamente que es una política neuronal que mapea un vector de 61 observaciones a 14 objetivos articulares y que se ha exportado a ONNX para su ejecución en el robot. No se documenta el número de capas, el tipo de red (MLP, recurrente o transformer), ni el esquema de observación (posición, velocidad, IMU, consignas de fase), por lo que cualquier afirmación al respecto sería especulativa.

Tampoco se documenta el procedimiento de entrenamiento de este movimiento concreto: número de tokens o muestras, composición del dataset, uso de aprendizaje por refuerzo en MuJoCo, destilación o ajuste fino. La cobertura de prensa del Microduck indica que la plataforma se entrena con aprendizaje por refuerzo en MuJoCo y que su objetivo es transferir comportamientos de simulación a hardware real, pero no hay confirmación de que esta política específica siga ese pipeline. No se declaran innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Ejecución de una coreografía motriz cerrada de 11,5 segundos: marcha en trayectoria cuadrada con cabeceo sincronizado al ritmo de los pasos.
- Generación de 14 consignas articulares por ciclo de control a 50 Hz, aptas para el bucle de bajo nivel del robot.
- Giros cerrados en las esquinas del recorrido, según describe la model card.
- Inferencia determinista y ligera en formato ONNX, adecuada para ejecución en el propio robot o en un equipo conectado.
- Instalación guiada mediante `manifest.json`, que declara qué necesita el robot para instalar y reproducir el movimiento.
- Inclusión de material de verificación visual (`media/preview.mp4`).
- No se documenta uso de la cámara, el sensor de profundidad ni los sensores de movimiento del robot por parte de esta política; la entrada declarada es un vector de 61 observaciones sin desglose.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Demostraciones en ferias y eventos: el movimiento está pensado como exhibición ("marcha como un soldado") y su duración de 11,5 segundos encaja en una rutina de escaparate repetible; el vídeo de previsualización permite evaluar el resultado antes de instalarlo.
- Docencia de control robótico: sirve como ejemplo completo y mínimo de una habilidad motriz empaquetada (política ONNX + manifiesto) para explicar el ciclo observación-acción a 50 Hz en un bípedo de bajo coste.
- Prueba de la cadena de instalación de la app MicroDuck: al ser un `microduck-move` con manifiesto, permite validar el flujo de despliegue de habilidades en el robot antes de abordar políticas más complejas.
- Verificación de sim-to-real: comparar la ejecución de esta política en el hardware con su comportamiento esperado ayuda a detectar desviaciones de calibración, fricción o saturación de servos en la marcha y en los giros cerrados.
- Pruebas de fiabilidad mecánica: la repetición del ciclo de 11,5 segundos con giros cerrados y cabeceo permite someter a los servos a un perfil de carga conocido y medir calentamiento, holgura o degradación.
- Base para composición de rutinas: al estar etiquetado como `microduck-move`, puede encadenarse con otros movimientos de la misma familia para construir secuencias más largas en una aplicación de usuario.
- Material de referencia para investigación en imitación: el par política + vídeo de previsualización es útil como dato de demostración para entrenar políticas de imitación sobre la misma plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de recompensa, tasa de éxito, error de seguimiento de trayectoria, consumo de par ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- Presupuesto temporal: 20 ms por inferencia como máximo para sostener el bucle a 50 Hz; el incumplimiento degrada la estabilidad del movimiento.
- VRAM: no aplica en la práctica; por el tamaño del artefacto (repo de 0,0 GB) es razonable esperar inferencia en CPU, extremo no confirmado por el autor.
- GPU recomendadas: no disponibles; el autor no documenta requisitos de cómputo. No se especifica la unidad de cómputo a bordo del Microduck.
- Cabe en GPU de consumo: previsiblemente sí, e incluso en CPU, dado el tamaño del artefacto; sin cifras publicadas de latencia ni de memoria.
- Opciones de despliegue: ONNX Runtime como opción natural al ser un artefacto ONNX; el autor no especifica runtime, sistema operativo ni si la ejecución ocurre en el robot o en un equipo auxiliar.
- Throughput y latencia estimados: no disponibles. Como referencia de diseño, el sistema debe completar una inferencia cada 20 ms; no se publica el tiempo real medido.
- Acoplamiento hardware: el movimiento está calibrado para el Microduck (25 cm, 15 motores, cámara, sensor de profundidad, dos sensores de movimiento y pico articulado según la prensa). Nótese que la política emite 14 objetivos articulares frente a los 15 motores descritos, por lo que al menos un grado de libertad no estaría gobernado por esta política; el autor no lo aclara.

## Comparativa con modelos similares

| Movimiento / política | Tipo | Entradas / salidas | Duracion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `microduck-parade-march` | Política ONNX de habilidad motriz | 61 obs. / 14 joints | 11,5 s | 50 Hz | No disponible | Hugging Face, 0 descargas |
| Política de locomoción base del Microduck (entrenada con RL en MuJoCo) | Política de control del robot | No disponible | Continua | No disponible | No disponible | Referenciada en prensa y repositorio del proyecto |
| Otras políticas etiquetadas `microduck-move` | Habilidades motrices empaquetadas | No disponible | No disponible | No disponible | No disponible | No se han identificado en la información disponible |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas, por lo que la comparación cuantitativa no es posible. La comparación relevante es cualitativa: esta política es una habilidad cerrada y corta, mientras que la política de locomoción del proyecto es un controlador general del que no se publican especificaciones.

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explícita para uso comercial, redistribución o modificación. Conviene contactar con el autor antes de integrarlo en un producto.
- Ausencia total de métricas: no hay benchmarks, tasas de éxito ni vídeo analizado en la información disponible, solo la descripción del autor.
- Movimiento no generalizable: la política ejecuta una coreografía fija de 11,5 segundos; no se documenta robustez ante perturbaciones, pendientes, superficies deslizantes o empujes.
- Caja negra: se desconoce la topología de la red, el esquema de observación y el proceso de entrenamiento, lo que dificulta el diagnóstico si el movimiento falla en hardware.
- Riesgo de sim-to-real: si la política se entrenó en simulación, pueden aparecer desviaciones por fricción, holgura de servos o latencia del bus de comunicaciones; no se documenta ninguna validación.
- Desajuste de grados de libertad: 14 salidas frente a los 15 motores descritos en la plataforma; el pico articulado u otro grado de libertad podría quedar fuera de control.
- Dependencia de calibración: al ser una política de control articular, pequeñas diferencias de calibración entre unidades pueden alterar el resultado.
- Idiomas y sesgos: no aplica en el sentido habitual; no hay evaluación de sesgos y el artefacto no procesa texto.
- Madurez: 0 descargas y 0 likes, publicada y actualizada en el mismo intervalo de tres segundos, sin historial de mantenimiento.
- Sin garantías de soporte: no se documentan versiones, changelog ni compatibilidad con futuras revisiones del hardware o del firmware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-parade-march
- Artefacto de la política: https://huggingface.co/microduckapp/microduck-parade-march/blob/main/policy.onnx
- Manifiesto de instalación: https://huggingface.co/microduckapp/microduck-parade-march/blob/main/manifest.json
- Previsualización del movimiento: https://huggingface.co/microduckapp/microduck-parade-march/blob/main/media/preview.mp4
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Cobertura de MarkTechPost sobre el Microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura de The AI Insider: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Cobertura de CNX Software: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Tutorial de montaje y puesta en marcha (terceros): https://github.com/AI-FanGe/Microduck-build-tutorial
