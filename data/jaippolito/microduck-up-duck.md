# jaippolito/microduck-up-duck

## Resumen

Microduck up-duck es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. Se distribuye como un modelo ONNX autónomo que implementa una marcha perpetua: una vez cargada en una ranura de política del robot, se ejecuta de forma continua hasta que se le indique lo contrario. El modelo consume observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de control de 50 Hz, lo que lo sitúa en el ámbito de los controladores reactivos de baja latencia para robótica legged.

El modelo se publica bajo la librería `microduck` y el pipeline `robotics`, con el normalizador de observaciones integrado directamente en el fichero `policy.onnx`, de modo que la política acepta observaciones en bruto sin preprocesado externo. El despliegue se realiza mediante el comando `robotctl policy load <slot> jaippolito/microduck-up-duck`, que carga la política en una ranura del daemon del robot.

Se trata de un artefacto muy específico y de nicho: no es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador entrenado para una plataforma hardware concreta. La información pública disponible es mínima (sin licencia declarada, sin idiomas, sin benchmarks ni tamaño de parámetros documentado), lo que limita la evaluación técnica a lo recogido en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política reactiva; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (distribución en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red neuronal. Se trata de una política de aprendizaje por refuerzo con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones, ejecutada a 50 Hz. El normalizador de observaciones está embebido en el propio grafo ONNX, lo que implica que el modelo recibe observaciones sin normalizar y aplica la transformación internamente antes de la inferencia.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `dirigo-speed`, commit `5b615279f`. No se especifican en la información disponible el número de pasos de entrenamiento, el algoritmo de RL empleado (PPO, SAC u otro), la composición del entorno de simulación ni si hubo transferencia sim-a-real. Tampoco se documentan innovaciones técnicas adicionales más allá de la integración del normalizador en el artefacto exportado.

## Capacidades

- Control locomotor perpetuo del robot microduck: ejecuta una marcha continua hasta recibir una orden de parada o sustitución de política.
- Política reactiva a 50 Hz con observaciones de 61 dimensiones y 14 acciones, adecuada para control en tiempo real de bajo nivel.
- Autocontenida: el normalizador de observaciones va embebido en `policy.onnx`, por lo que acepta observaciones en bruto.
- Carga como ranura de política mediante `robotctl policy load`, lo que permite intercambiarla con otras políticas del ecosistema microduck.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Locomoción continua en pruebas de hardware: cargar la política en una ranura y dejar que el robot camine de forma indefinida para validar mecánica, batería y estabilidad del chasis en sesiones prolongadas.
- Demostraciones de robótica legged: usar la marcha perpetua como comportamiento base en vídeos o demostraciones públicas del microduck, dado que no requiere supervisión ni entradas externas tras la carga.
- Benchmark de referencia para políticas propias: emplear up-duck como línea base de gait al comparar nuevas políticas entrenadas en `microduck_rl`, midiendo estabilidad, consumo y velocidad relativa.
- Integración en pipelines de control con `robotctl`: sustituir políticas en caliente durante experimentos para alternar entre marchas sin reiniciar el daemon.
- Pruebas de robustez del daemon: al ser una política perpetua, sirve para estresar la gestión de ranuras, el bucle de control a 50 Hz y la telemetría del robot.
- Investigación en sim-a-real: punto de partida para estudiar la transferencia de políticas entrenadas en simulación al microduck físico bajo la rama `dirigo-speed`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del modelo no está documentado y el repositorio ocupa 0.0 GB, lo que sugiere un artefacto muy pequeño.
- GPU recomendadas: no disponibles; al ejecutarse en el propio robot microduck, la inferencia se realiza presumiblemente en la CPU del robot mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime a través del daemon `robotctl` del ecosistema microduck (`pollen-robotics/microduck`).
- Latencia y throughput: no disponibles; el requisito funcional es sostener 50 Hz de control (20 ms por ciclo).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas publicadas para el microduck ni modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir permiso para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarlo en productos.
- Documentación mínima: sin arquitectura, número de parámetros ni detalles del entrenamiento, la evaluación técnica independiente es muy limitada.
- Específico de hardware: la política está entrenada para el microduck (61 observaciones, 14 acciones, 50 Hz); no es portable a otras plataformas sin reentrenamiento.
- Comportamiento perpetuo: al ejecutarse hasta que se le indique lo contrario, requiere mecanismos externos de parada segura en cualquier despliegue físico.
- Sin datos de robustez: no se documentan sesgos, tasas de fallo, comportamiento ante perturbaciones ni límites de operación (pendientes, superficies, cargas).
- Sin benchmarks: no hay evidencia publicada de rendimiento comparativo frente a otras políticas.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaippolito/microduck-up-duck
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `dirigo-speed`, commit `5b615279f`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
