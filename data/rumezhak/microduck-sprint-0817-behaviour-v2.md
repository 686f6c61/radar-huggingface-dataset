# rumezhak/microduck-sprint-0817-behaviour-v2

## Resumen

`microduck-sprint-0817-behaviour-v2` es una política de control motriz (locomoción) entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es una política de comportamiento que recibe observaciones del robot (61 dimensiones) y emite acciones de control (14 dimensiones) a 50 Hz, pensada para ejecutarse en bucle continuo sobre el hardware real.

El modelo se distribuye en formato ONNX (`policy.onnx`), con el normalizador de observaciones integrado en el propio grafo, de modo que el robot puede alimentar observaciones en bruto sin preprocesado adicional. Se carga en el demonio del robot mediante el comando `robotctl policy load`, que asigna la política a un slot de ejecución. La arquitectura interna de la red no se detalla en la model card, y el tamaño del repositorio aparece como 0.0 GB, por lo que no hay información pública sobre el número de parámetros.

Su relevancia es acotada pero específica: ejemplifica el flujo de trabajo de políticas de RL portables para robótica de bajo coste, con un pipeline estandarizado (manifiesto de política versión 2, integración con el daemon `robotctl`) que permite a desarrolladores e investigadores desplegar y sustituir comportamientos sin recompilar el firmware ni reentrenar en el robot. El nombre sugiere un comportamiento de trote o marcha rápida ("sprint") asociado a la fecha de entrenamiento 0817.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL exportada a ONNX) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política reactiva; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tipo de politica | Perpetua (se ejecuta hasta recibir orden de parada) |

## Arquitectura y entrenamiento

La model card no describe la topología de la red neuronal (número de capas, anchura, tipo de capa recurrente o feed-forward). Lo que sí se especifica es la interfaz: una política que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz, con normalización de observaciones embebida en el grafo ONNX. El carácter "perpetuo" indica que la política está diseñada para ejecutarse de forma continua como una marcha o gait, sin condición de terminación interna, hasta que el operador la detenga o cargue otra política en el slot.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`, empleando aprendizaje por refuerzo. No se documentan el número de pasos de entorno, la composición del dataset de entrenamiento, el algoritmo de RL concreto (PPO, SAC u otro), ni si hubo procesos de ajuste fino o currículo de entrenamiento. Tampoco se detalla ninguna innovación técnica adicional más allá del empaquetado del normalizador dentro del modelo exportado.

## Capacidades

- Locomoción cuadrúpeda continua: genera comandos motores a 50 Hz para el robot microduck a partir de observaciones proprioceptivas de 61 dimensiones.
- Comportamiento perpetuo: mantiene la marcha indefinidamente hasta que se detiene externamente o se sustituye la política.
- Despliegue directo en hardware: compatible con el daemon `robotctl` mediante carga en slots de política.
- Autocontenida: el normalizador de observaciones está integrado en el ONNX, por lo que acepta observaciones en bruto sin pipeline de preprocesado.
- Interoperabilidad con el manifiesto de política esquema 2, lo que facilita la gestión y el intercambio de políticas en el ecosistema microduck.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción con RL: usar la política como línea base reproducible para comparar algoritmos de entrenamiento o variaciones de recompensa sobre el mismo robot y la misma interfaz de observación/acción.
- Demostraciones educativas de robótica: cargar la política en un microduck físico para mostrar en clase o taller cómo una red entrenada en simulación controla un cuadrúpedo real a 50 Hz.
- Pruebas de integración del daemon: validar el flujo `robotctl policy load` y el manifiesto esquema 2 en pipelines de CI o en entornos de laboratorio antes de desplegar políticas propias.
- Benchmarking de hardware: medir latencia, estabilidad y consumo del robot ejecutando una marcha perpetua conocida, como referencia para evaluar modificaciones mecánicas o de firmware.
- Base para ajuste fino o destilación: partir de esta política como inicialización en experimentos de RL posteriores (por ejemplo, añadir comandos de velocidad o terreno irregular) dentro del repositorio `microduck_rl`.
- Sustitución modular de comportamientos: mantener esta política en un slot y alternar con otras políticas (por ejemplo, marchas más lentas o gestos) para probar la gestión de slots del daemon en escenarios multi-comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de RL para un cuadrúpedo de bajo coste, es previsible que el modelo sea pequeño y quepa en memoria muy reducida, pero no hay datos publicados sobre parámetros ni tamaño del grafo ONNX.
- GPU recomendadas: no disponible. La inferencia a 50 Hz probablemente pueda ejecutarse en CPU del propio robot o en un SBC, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: daemon `robotctl` del ecosistema microduck con carga en slots de política; runtime ONNX estándar para ejecución fuera del robot.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Dimension observacion | Dimension accion | Frecuencia | Formato | Licencia |
|---|---|---|---|---|---|---|
| microduck-sprint-0817-behaviour-v2 | Política RL para microduck | 61 | 14 | 50 Hz | ONNX | No disponible |
| Otras políticas del ecosistema microduck | Políticas RL para microduck | No disponible | No disponible | No disponible | No disponible | No disponible |
| Políticas RL para cuadrúpedos comerciales (p. ej. Unitree, ANYmal) | Políticas RL propietarias o de investigación | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información pública suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Específica del hardware: la política está entrenada para el microduck con su configuración concreta de 61 observaciones y 14 acciones; no es transferible a otros robots sin reentrenamiento o adaptación.
- Sin información sobre licencia: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Documentación mínima: la model card no detalla arquitectura, número de parámetros, algoritmo de RL, datos de entrenamiento ni métricas de rendimiento, lo que dificulta evaluar su robustez.
- Riesgo de fallo fuera de distribución: al ser una política de RL entrenada en simulación (presumiblemente), puede degradarse ante terrenos, cargas o perturbaciones no vistas durante el entrenamiento.
- Comportamiento perpetuo: al no tener condición de terminación interna, requiere supervisión y un mecanismo externo de parada para evitar ejecuciones no deseadas.
- Sin garantías de seguridad: no se documentan protocolos de parada de emergencia, límites de par o validación en hardware real; no debe usarse en entornos con personas sin las salvaguardas adecuadas.
- Cero descargas y un solo "like" en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- Sin soporte multilingüe ni de texto: no es adecuada para tareas de NLP, generación de código o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sprint-0817-behaviour-v2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de política: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)
