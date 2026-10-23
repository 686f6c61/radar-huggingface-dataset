# betsyxw/microduck-sprint-s1

## Resumen

microduck-sprint-s1 (etiquetado como «sprint-s1» en la model card) es una política de control obtenida por aprendizaje por refuerzo para el robot microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo multimodal: es una política de locomoción que mapea una observación de 61 dimensiones a 14 acciones de control a 50 Hz, exportada a ONNX y empaquetada con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. Se describe explícitamente como una política «perpétua»: una marcha que se ejecuta de forma continua hasta que se le indique lo contrario, cargada en una ranura de política del robot.

El modelo lo publica el usuario `betsyxw` en HuggingFace, con fecha de creación del 23 de octubre de 2026, y deriva de un entrenamiento reproducible sobre el repositorio `pollen-robotics/microduck-challenges` (commit `6ff40704a`), tarea `Mjlab-Sprint2m-MicroDuck`, con la base `mjlab-microduck 0.1.0 @ 8d0dbc94c`. El checkpoint exportado es el 1500 de una ejecución configurada para 3000 iteraciones máximas, 4096 entornos paralelos y semilla 1.

Su relevancia es acotada pero concreta: es un artefacto de referencia para quien trabaje con el ecosistema microduck y quiera desplegar o comparar una marcha entrenada en simulación, así como un ejemplo de pipeline completo (entrenamiento en mjlab, exportación a ONNX con normalizador de observaciones embebido y carga mediante `robotctl`). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni métricas de rendimiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada por refuerzo (familia de tarea `Mjlab-Sprint2m-MicroDuck`); topología de red no especificada en la model card — no disponible |
| Parámetros totales | no disponible (el tamaño del repo se reporta como 0.0 GB, sin cifra exacta de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; no es un modelo de lenguaje. Ventana de observación de 61 dimensiones por paso de control a 50 Hz |
| Tipos de cuantización | no disponible (exportación en ONNX; no se documentan niveles de cuantización) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible (campo de licencia vacío en HuggingFace) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red (número de capas, anchura, función de activación ni si se trata de un MLP u otra topología). Lo que sí está documentado es la interfaz y el pipeline: la política consume observaciones de 61 dimensiones en crudo —el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que no hay que preprocesar la entrada— y emite 14 acciones a 50 Hz. El artefacto se distribuye como un archivo ONNX acompañado de un manifiesto que permite cargarlo directamente en una ranura del daemon del robot mediante `robotctl policy load`.

El entrenamiento se realizó con la herramienta `mjlab` (base `mjlab-microduck 0.1.0`, commit `8d0dbc94c`) sobre el repositorio `microduck-challenges`, en la tarea `Mjlab-Sprint2m-MicroDuck`, con 4096 entornos simulados en paralelo, un máximo de 3000 iteraciones del agente, semilla 1 tanto para el agente como para el entorno, y registro en TensorBoard bajo el nombre de ejecución `sprint-s1`. El checkpoint publicado es el 1500. El autor advierte que el entrenamiento se exportó desde un checkout con cambios sin confirmar y que repetir la ejecución con el mismo código, `uv.lock`, comando y semilla produce una política «comparable, no idéntica»: el aprendizaje por refuerzo en GPU no es bit-reproducible entre máquinas. No se documentan en la información disponible detalles sobre composición del dataset, currículo de recompensas, técnicas de domain randomization ni fases de ajuste fino.

## Capacidades

- Locomoción continua para el robot microduck: política «perpétua» que ejecuta una marcha (sprint) y se mantiene activa hasta recibir una orden de parada o sustitución.
- Control reactivo a 50 Hz con 14 acciones, adecuado para bucles de control de tiempo real en el propio robot.
- Consumo de observaciones crudas de 61 dimensiones, sin necesidad de normalización externa (el normalizador va embebido en el ONNX).
- Despliegue directo en hardware mediante el comando `robotctl policy load <slot> betsyxw/microduck-sprint-s1`.
- Integración con el ecosistema de manifiestos de microduck (esquema 2), lo que permite versionar y sustituir políticas en ranuras sin recompilar el daemon.
- Inferencia portable vía ONNX, ejecutable en runtimes compatibles con ONNX en la computadora del robot.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: es un controlador de bajo nivel.

## Casos de uso

- Despliegue de una marcha base en un microduck físico: cargar la política en una ranura con `robotctl policy load` y usar el resultado como comportamiento por defecto para pruebas de locomoción y validación del robot en banco.
- Referencia reproducible para investigación en RL: el comando de entrenamiento documentado (4096 entornos, 3000 iteraciones, semilla 1) sirve como línea base para comparar variantes de recompensa, currículo o hiperparámetros en la tarea `Mjlab-Sprint2m-MicroDuck`.
- Evaluación sim-to-real: al estar exportada a ONNX con el normalizador embebido, permite medir la brecha entre la política entrenada en `mjlab` y su comportamiento en el robot real sin diferencias de preprocesado.
- Docencia y demostraciones: política lista para usar en talleres sobre aprendizaje por refuerzo aplicado a robótica, con un flujo completo desde el clonado del repositorio hasta la ejecución en hardware.
- Pruebas de integración del daemon: útil como carga de prueba para validar el cargador de manifiestos (esquema 2), la gestión de ranuras y el ciclo de vida de políticas en el software del robot.
- Generación de trayectorias y datos de rodadura en simulación: ejecutar la política en `mjlab` para recolectar rollouts que alimenten análisis de estabilidad, consumo o comparación entre checkpoints.
- Punto de partida para ajuste fino: al derivar de un pipeline abierto y reproducible, puede servir como inicialización para políticas especializadas (distintas velocidades, terrenos o tareas) dentro del mismo framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad de avance, tasa de caídas, transferencia sim-to-real ni comparaciones cuantitativas con otras políticas. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el número de parámetros ni el tamaño exacto del archivo ONNX (el repositorio se reporta como 0.0 GB, por debajo de la precisión de medida de la plataforma).
- GPU recomendadas: no disponibles para inferencia. Para reentrenamiento, el comando documentado asume 4096 entornos paralelos en `mjlab`, lo que en la práctica requiere aceleración por GPU; no se especifica el modelo concreto empleado.
- Viabilidad en GPU de consumo: no confirmada en la información disponible. Dado que el destino es la computadora de a bordo de un robot pequeño y que la salida es de 14 acciones a 50 Hz, el despliegue en CPU vía runtime ONNX es plausible, pero no está documentado por el autor.
- Opciones de despliegue: `robotctl` (carga en ranura de política del daemon de microduck) y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-s1 | Política RL (ONNX) para microduck | 61-D observación / 14 acciones | 50 Hz | no disponible | HuggingFace, 0 descargas |
| Otras políticas de la familia `microduck-challenges` (tarea `Mjlab-Sprint2m-MicroDuck`) | Políticas RL del mismo pipeline | no disponible | no disponible | no disponible | repositorio público de retos, sin artefactos publicados identificados en la información disponible |
| Políticas de locomoción de otros cuadrúpedos open source | Políticas RL | no disponible | no disponible | habitualmente permisivas, variable por proyecto | no disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría. La comparación queda limitada a la disponibilidad y al formato de distribución.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarlo en un producto.
- Ausencia total de métricas: no hay benchmarks, curvas de recompensa ni evaluación de robustez, por lo que no es posible estimar la calidad de la marcha sin ejecutarla.
- Especialización estrecha: la política está entrenada para una única tarea (`Mjlab-Sprint2m-MicroDuck`) y un único robot; nogeneraliza a otras morfologías ni a tareas de manipulación.
- Riesgo de brecha sim-to-real: no se documentan técnicas de aleatorización de dominio ni validación en hardware, de modo que el comportamiento real puede degradarse respecto a la simulación.
- Reproducibilidad limitada: el autor indica explícitamente que el reentrenamiento no es bit-reproducible y que la exportación se hizo desde un checkout con cambios sin confirmar, lo que dificulta auditorías exactas.
- Semilla y checkpoint únicos: solo se publica el checkpoint 1500 de una semilla, sin información sobre varianza entre ejecuciones ni sobre la curva de aprendizaje.
- Sin soporte de texto, visión ni herramientas: no debe evaluarse con criterios de LLM ni emplearse en tareas cognitivas.
- Ausencia de documentación sobre seguridad: no se describen paradas de emergencia, límites de par ni comportamientos ante fallos, aspectos críticos antes de operar el robot cerca de personas.
- Los resultados de la búsqueda web proporcionada no contienen información relevante sobre este modelo (son catálogos de productos sin relación), por lo que no aportan datos verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/betsyxw/microduck-sprint-s1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y pipeline de entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas (referenciada como `docs/policy-manifest.md` en el repositorio del daemon): no disponible como enlace directo en la información proporcionada
- Base de entrenamiento `mjlab-microduck 0.1.0 @ 8d0dbc94c`: no disponible como enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
