# rumezhak/microduck-sprint-0817-trajectory-remix

## Resumen

`microduck-sprint-0817-trajectory-remix` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es una política de locomoción que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, diseñada para ejecutarse de forma perpetua (un patrón de marcha continuo) hasta que se le indique lo contrario.

El autor del repositorio es el usuario de Hugging Face `rumezhak`, y la política se ha entrenado con el framework `microduck_rl` del propio proyecto microduck (rama `main`, commit `5cee942d8`). Se distribuye en formato ONNX (`policy.onnx`) junto con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas del daemon de microduck, lo que permite cargarla directamente en un slot de política del robot mediante el comando `robotctl policy load`.

Su relevancia es acotada pero concreta: se trata de un artefacto de despliegue listo para robot, no de un modelo generalista. El repositorio no tiene descargas ni likes, no declara licencia y su tamaño es de 0,0 GB, por lo que debe tratarse como un experimento de nicho dentro del ecosistema microduck. La información pública disponible es muy limitada y se circunscribe a la model card y a las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL para robótica; red neuronal, detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política reactiva; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32; no confirmado) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de red (número de capas, tipo de capa, tamaño de las capas ocultas ni función de activación). Lo que sí se indica es el contrato de entrada/salida: 61 dimensiones de observación y 14 dimensiones de acción, ejecutadas a 50 Hz, con un normalizador de observaciones integrado dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto. La política se describe como "perpetua": genera una marcha continua hasta que se le ordena lo contrario.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. No se especifican el número de pasos de entrenamiento, la composición del entorno de simulación, la función de recompensa, ni si hubo técnicas de regularización o destilación. No hay información sobre datos de entrenamiento más allá de la referencia al pipeline de RL del proyecto microduck.

## Capacidades

- Locomoción cuadrúpeda continua: genera una marcha ("sprint") de forma perpetua hasta recibir una orden de parada o cambio de política.
- Control reactivo a 50 Hz: consume observaciones de 61 dimensiones y produce 14 acciones por paso de control.
- Despliegue en robot real mediante el daemon de microduck: carga directa en un slot de política con `robotctl policy load`.
- Normalización de observaciones integrada: no requiere preprocesado externo de las observaciones.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2), lo que facilita su integración en el ecosistema del robot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Investigación en locomoción con refuerzo: usar la política como línea base reproducible para comparar algoritmos de RL en el mismo robot y el mismo contrato de observación/acción (61-D / 14 acciones a 50 Hz).
- Demostraciones de marcha continua en microduck: cargar la política en un slot y dejar que el robot camine de forma indefinida para vídeos, ferias o docencia, gracias a su naturaleza "perpetua".
- Pruebas de integración del daemon: validar el flujo `robotctl policy load <slot> rumezhak/microduck-sprint-0817-trajectory-remix` y el consumo del `manifest.json` esquema 2 en pipelines de CI del daemon.
- Benchmark de robustez de gait: someter la marcha a perturbaciones (terrenos, empujones) y medir la degradación, ya que la política está pensada para ejecución continua sin reentrenamiento.
- Base para "remix" de trayectorias: el nombre del artefacto sugiere una mezcla de trayectorias; puede servir como punto de partida para ajuste fino con `microduck_rl` en entornos propios.
- Despliegue en hardware de bajo coste: al distribuirse en ONNX, puede ejecutarse en el cómputo a bordo del microduck sin depender de un stack de inferencia de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y no se publica el número de parámetros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles; al ser una política de control a 50 Hz en formato ONNX, es plausible que se ejecute en CPU o en el cómputo embebido del robot, pero no está confirmado.
- ¿Cabe en GPU de consumo? No disponible; por la naturaleza del artefacto (ONNX de política robótica) es esperable que sí, pero no hay dato publicado.
- Opciones de despliegue: daemon de microduck mediante `robotctl policy load`; runtime ONNX (ONNX Runtime u otro compatible con el daemon, no especificado).
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas de microduck publicadas con las que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso para uso comercial, redistribución ni modificación; debe contactarse con el autor antes de cualquier uso productivo.
- Información técnica mínima: sin número de parámetros, arquitectura de red, datos de entrenamiento ni métricas, la evaluación rigurosa del modelo no es posible.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- Naturaleza "perpetua": la política está pensada para ejecutarse indefinidamente; en producción debe existir un mecanismo externo de parada segura y supervisión.
- Sin datos sobre sesgos ni alucinación en el sentido de modelos de lenguaje; el riesgo relevante es de comportamiento físico inesperado en el robot (fallos de locomoción, inestabilidad) y debe mitigarse con pruebas en entorno controlado.
- Dependencia de un contrato concreto: 61-D de observación, 14 acciones, 50 Hz y manifiesto esquema 2; cualquier cambio en el daemon o en la plataforma puede romper la compatibilidad.
- Idiomas y capacidades lingüísticas: no aplica; no debe emplearse como modelo de texto.

## Enlaces

- Hugging Face: https://huggingface.co/rumezhak/microduck-sprint-0817-trajectory-remix
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`; sin URL directa en la información proporcionada)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (sin URL directa en la información proporcionada)
