# rumezhak/microduck-hill-leader3-points-v2

## Resumen

`microduck-hill-leader3-points-v2` es una política de control por refuerzo (reinforcement learning) publicada por el usuario rumezhak para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una policy neuronal especializada que traduce observaciones del robot en acciones de control a 50 Hz. El modelo se distribuye como un fichero ONNX (`policy.onnx`) acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon de microduck.

La política es de tipo "perpetuo": una vez cargada en una ranura (slot) del robot, ejecuta una marcha (gait) de forma continua hasta que se le indique lo contrario. Recibe observaciones de 61 dimensiones y emite 14 acciones, con un normalizador de observaciones embebido en el propio ONNX, de modo que el consumidor debe alimentar observaciones en crudo. Está pensada para desplegarse directamente en hardware mediante el comando `robotctl policy load`.

La relevancia de esta ficha es acotada: se trata de un artefacto de robótica de nicho, con cero descargas y cero likes en el momento de la consulta, repo de 0.0 GB y sin model card sustantiva más allá de instrucciones de despliegue y metadatos de entrenamiento. No hay información publicada sobre arquitectura interna, tamaño de parámetros ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL; topología de red no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del policy manifest) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Comportamiento | perpetuo (marcha continua hasta recibir orden de parada) |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de la red (número de capas, tipo de capas, función de activación, tamaño de las capas ocultas ni número de parámetros). Por el contexto (política de RL para un cuadrúpedo de 61 observaciones y 14 acciones a 50 Hz), lo habitual en este tipo de artefactos es una red de tipo MLP o una política recurrente compacta, pero no hay dato publicado que lo confirme.

Los metadatos de entrenamiento indican que se usó el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. No se especifican el algoritmo de RL empleado (PPO, SAC, etc.), el número de pasos de entorno, la composición del dataset ni si hubo ajuste fino posterior. El normalizador de observaciones está embebido en `policy.onnx`, lo que implica que el pipeline de inferencia espera observaciones sin normalizar y aplica la normalización internamente.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck mediante una marcha (gait) perpetua.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control a 50 Hz.
- Normalización de observaciones integrada en el grafo ONNX (entrada en crudo).
- Despliegue directo en robot mediante `robotctl policy load <slot> rumezhak/microduck-hill-leader3-points-v2`.
- Compatibilidad con el sistema de ranuras (slots) de políticas del daemon de microduck.
- No soporta tool calling, generación de texto, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Locomoción autónoma en el microduck: cargar la política en una ranura y dejar que el robot ejecute la marcha de forma continua, útil para demostraciones de gait en laboratorio o aula.
- Pruebas de integración del daemon: usar la política como carga de referencia para validar el pipeline `robotctl policy load` y el esquema 2 del manifiesto.
- Benchmarking de políticas: comparar esta marcha con otras políticas del mismo robot (por ejemplo, variantes `leader3-points`) para evaluar estabilidad y velocidad de desplazamiento.
- Base para ajuste fino: partir del ONNX y del repositorio `microduck_rl` para reentrenar o adaptar la marcha a un terreno o carga distinta.
- Docencia en robótica con refuerzo: ejemplo reproducible de política desplegable en hardware real con un flujo de carga de un solo comando.
- Investigación en simulación a real: servir como punto de partida para estudiar la transferencia de políticas entrenadas en simulador al cuadrúpedo físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repo es de 0.0 GB, lo que sugiere un modelo muy pequeño, pero no hay cifra de parámetros publicada.
- GPU recomendadas: no disponible; por el contexto de control a 50 Hz en un robot embebido, es plausible que la inferencia se ejecute en CPU, pero no está confirmado.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecución en CPU y en GPUs convencionales si el runtime lo soporta.
- Opciones de despliegue: ONNX Runtime (formato nativo), daemon de microduck mediante `robotctl`.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por ciclo).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables del mismo robot con especificaciones publicadas (parámetros, contexto, rendimiento o licencia) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No hay licencia publicada: no se puede asumir permiso para uso comercial, redistribución o modificación.
- Ausencia total de datos de arquitectura, tamaño y evaluación: no es posible estimar calidad, robustez ni coste computacional a priori.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Comportamiento perpetuo: la política no se detiene por sí sola; requiere una orden externa de parada, lo que exige supervisión en despliegues reales.
- Específica del hardware microduck: no es transferible a otras plataformas sin reentrenamiento.
- Sin información sobre el terreno, la distribución de entrenamiento ni los sesgos de la política (por ejemplo, asimetrías de marcha o sensibilidad a perturbaciones).
- Riesgo de fallo silencioso: al no haber métricas publicadas, cualquier despliegue en producción debe validarse empíricamente antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-hill-leader3-points-v2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`); no se proporciona URL directa en la información disponible.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (no se proporciona URL directa).
