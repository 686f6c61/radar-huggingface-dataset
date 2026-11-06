# SccHy/microduck-sprint-hc901

## Resumen

microduck-sprint-hc901 es una política de control motriz (locomoción) entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje ni un modelo fundacional generativo: se trata de un controlador reactivo que mapea observaciones de 61 dimensiones a 14 acciones de actuación a una frecuencia de 50 Hz, empaquetado en formato ONNX para su ejecución en el propio robot.

El modelo se publica bajo el identificador SccHy/microduck-sprint-hc901 y se integra en el ecosistema microduck a través de la librería `microduck` y del daemon `robotctl`, que permite cargar la política en una ranura del firmware del robot mediante un único comando. La política es de tipo "perpetuo": una vez cargada, ejecuta una marcha (gait) de forma continua hasta que se le indique lo contrario.

Su relevancia es acotada pero específica: demuestra el flujo completo de publicación de recetas de entrenamiento RL para robótica de bajo coste, con normalización de observaciones embebida en el propio grafo ONNX y un manifiesto versionado (`manifest.json`, esquema 2) que documenta los metadatos de la política. Al no contar con descargas ni interacciones, debe considerarse un artefacto experimental o de referencia más que un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política RL exportada a ONNX; arquitectura de red no documentada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`, presumiblemente FP32; no se documentan variantes) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal subyacente (número de capas, anchura, tipo de capas —MLP, CNN o recurrente—), por lo que este dato debe considerarse no disponible. Lo que sí se documenta es la interfaz del controlador: recibe observaciones crudas de 61 dimensiones, las normaliza internamente mediante un normalizador embebido en el grafo ONNX, y emite 14 acciones a 50 Hz. El hecho de que la normalización esté integrada en `policy.onnx` implica que el consumidor debe alimentar observaciones sin preprocesar, lo que reduce el riesgo de desajustes entre entrenamiento e inferencia.

El entrenamiento se realizó con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `1efd853be`. No se especifican el algoritmo RL empleado (PPO, SAC, etc.), el número de pasos de entorno, la función de recompensa ni el dominio de aleatorización. Tampoco se documenta si hubo destilación, ajuste fino posterior o currículo de entrenamiento. La política se describe como "perpetua", es decir, sin condición de terminación episódica explícita: mantiene la marcha indefinidamente.

## Capacidades

- Locomoción continua del robot microduck: ejecuta una marcha ("sprint") de forma perpetua a 50 Hz hasta que se descarga o sustituye la política.
- Control reactivo de bajo nivel: mapea directamente observaciones proprioceptivas de 61 dimensiones a 14 comandos de actuación.
- Normalización de observaciones integrada: acepta observaciones crudas sin preprocesado externo.
- Integración con el daemon `robotctl`: carga mediante `sudo robotctl policy load <slot> SccHy/microduck-sprint-hc901`.
- Compatibilidad con el manifiesto de políticas microduck esquema 2, lo que facilita la gestión de ranuras y metadatos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un controlador motor, no un modelo generativo.

## Casos de uso

- Investigación en locomoción RL: servir como política de referencia para comparar marchas alternativas en el mismo robot y misma interfaz de observación/acción, gracias a la normalización embebida que elimina variables de preprocesado.
- Docencia y prototipado en robótica de bajo coste: cargar la política en un microduck físico o simulado para demostrar el ciclo completo entrenamiento-despliegue en una sesión de laboratorio.
- Pruebas de integración del daemon `robotctl`: validar el flujo de carga de políticas en ranuras, la lectura de `manifest.json` y la compatibilidad con el esquema 2 en pipelines de CI del propio daemon.
- Benchmark de controladores en simulación: usar la política como línea base de velocidad y estabilidad al evaluar nuevas recetas de entrenamiento en `microduck_rl`.
- Demostraciones de marcha continua: al ser una política perpetua, es adecuada para exhibiciones o vídeos donde el robot debe mantener la locomoción sin intervención.
- Recolección de datos de locomoción: ejecutar la política de forma sostenida para registrar trayectorias y observaciones que alimenten posteriores entrenamientos por imitación o análisis de estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se documentan métricas de recompensa media, velocidad de avance, estabilidad, tasa de caídas ni comparaciones con otras políticas del mismo robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de pequeña escala exportada a ONNX, es previsible que quepa en memoria muy reducida, pero no se aportan cifras.
- GPU recomendadas: no disponible; el caso de uso natural es la CPU del propio robot o un acelerador embebido, no una GPU de centro de datos.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; la ejecución en RTX 4090 u otras GPU de consumo no está documentada.
- Opciones de despliegue: runtime ONNX dentro del daemon `robotctl` del ecosistema microduck; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control), dato derivado de la especificación de la política; no se publican latencias medidas del grafo ONNX ni throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-hc901 | Política RL (ONNX) para microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| Otras políticas microduck | Políticas RL para el mismo robot | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Políticas RL para cuadrúpedos comerciales (p. ej. Unitree, ANYmal) | Políticas RL propietarias o de investigación | no disponible | no disponible | habitualmente no comercial | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no puede asumirse permiso de uso comercial, modificación ni redistribución; es imprescindible contactar con el autor antes de cualquier uso fuera de experimentación privada.
- Sin descargas ni validación comunitaria: no hay evidencia pública de que la política haya sido probada por terceros, lo que eleva el riesgo de comportamientos inesperados en hardware real.
- Documentación mínima: no se especifican arquitectura de red, hiperparámetros de entrenamiento, recompensa ni dominio de entrenamiento, lo que dificulta la reproducibilidad y el diagnóstico de fallos.
- Política perpetua sin condición de parada: requiere mecanismos externos de seguridad (parada de emergencia, límites de par, watchdog) para evitar daños al robot o al entorno.
- Específica del robot microduck: no es transferible a otras plataformas sin reentrenamiento, dado el contrato fijo de 61 observaciones y 14 acciones.
- Riesgo de sobreajuste al entorno de entrenamiento: al no documentarse aleatorización de dominio, el rendimiento en superficies, cargas o perturbaciones distintas a las de entrenamiento es desconocido.
- No apta para tareas cognitivas: no procesa lenguaje, no razona y no soporta herramientas; cualquier expectativa de uso como modelo generativo es un error de categoría.
- Fecha de creación futura en los metadatos (2026-11-02): conviene verificar la integridad y procedencia del artefacto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SccHy/microduck-sprint-hc901
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `challenge-recipe-publishing`, commit `1efd853be`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
