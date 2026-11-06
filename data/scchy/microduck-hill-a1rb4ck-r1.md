# SccHy/microduck-hill-a1rb4ck-r1

## Resumen

hill-a1rb4ck-r1 es una política de control para el robot cuadrúpedo microduck, desarrollado por Pollen Robotics. El modelo ha sido publicado por el usuario SccHy en Hugging Face bajo el identificador SccHy/microduck-hill-a1rb4ck-r1. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo (reinforcement learning) empaquetada en formato ONNX, diseñada para ejecutarse en el bucle de control del robot a 50 Hz.

La política recibe observaciones de 61 dimensiones y emite 14 acciones. Según la model card, es una política "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario, funcionando como una marcha (gait) cargada en una ranura de política del daemon del robot. La normalización de observaciones está integrada en el propio fichero policy.onnx, por lo que el consumidor debe alimentar observaciones en crudo.

El repositorio tiene un tamaño de 0.0 GB según los metadatos de Hugging Face y registra 0 descargas y 0 likes en el momento de la consulta. La información pública disponible es muy limitada: no se detallan arquitectura de red, datos de entrenamiento, licencia ni idiomas soportados. El interés actual radica en su carácter de ejemplo reproducible de publicación de recetas de entrenamiento RL para robótica de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si hay cuantización) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx) y manifest.json (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red neuronal (capas, tamaño de las mismas, tipo de función de activación ni diseño del actor-crítico). La model card únicamente indica que se trata de una política de reinforcement learning para el robot microduck, con observaciones de 61 dimensiones y 14 acciones, ejecutándose a 50 Hz. La normalización de observaciones está embebida en el fichero ONNX, de modo que la política consume observaciones sin preprocesar.

Respecto al entrenamiento, la model card referencia el repositorio `pollen-robotics/microduck_rl`, la rama `challenge-recipe-publishing` y el commit `1efd853be`. No se especifican el número de pasos de entrenamiento, la composición del dataset, el algoritmo RL empleado (PPO, SAC u otro), ni si hubo fases de ajuste fino o recompensas diseñadas manualmente. Tampoco se documenta ninguna innovación técnica adicional más allá del empaquetado de la normalización dentro del grafo ONNX y del carácter perpetuo de la política.

## Capacidades

- Control locomotor continuo del robot cuadrúpedo microduck mediante una marcha (gait) perpetua.
- Procesamiento de observaciones de 61 dimensiones y emisión de 14 acciones a 50 Hz.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración en el daemon.
- Carga como ranura de política mediante el comando `robotctl policy load <slot> SccHy/microduck-hill-a1rb4ck-r1`.
- Compatibilidad con el manifiesto de políticas microduck en su esquema 2.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto, visión ni audio, por tratarse de una política de control robótico.

## Casos de uso

- Locomoción autónoma en el robot microduck: la política se carga en una ranura del daemon y ejecuta una marcha continua a 50 Hz, adecuada para desplazamientos sostenidos en entornos controlados.
- Investigación en aprendizaje por refuerzo aplicado a robótica de bajo coste: sirve como referencia reproducible al estar vinculada a un repositorio y commit concretos del pipeline de entrenamiento.
- Docencia y prototipado en robótica cuadrúpeda: permite a estudiantes cargar una política preentrenada y observar el comportamiento locomotor sin necesidad de entrenar desde cero.
- Evaluación de pipelines de despliegue ONNX en hardware embebido: al integrar la normalización en el grafo, simplifica la cadena de inferencia y reduce el código de preprocesado en el robot.
- Pruebas de integración del daemon microduck: útil para validar el comando `robotctl policy load` y el esquema 2 del manifiesto de políticas.
- Base para ajuste fino o comparación de marchas: al ser una política perpetua, puede servir como línea base frente a otras políticas cargadas en distintas ranuras del mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de control en ONNX, es probable que quepa en CPU embebida, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el despliegue previsto es mediante el daemon microduck y el comando `robotctl policy load`, con inferencia ONNX en el propio robot.
- Latencia y throughput estimados: la política está diseñada para ejecutarse a 50 Hz (periodo de 20 ms por ciclo de control), aunque no se documentan latencias medidas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables para el mismo robot o para tareas equivalentes.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan arquitectura, número de parámetros, datos de entrenamiento ni procedimiento de evaluación.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de utilizarla en producción.
- Ausencia de benchmarks: no hay métricas publicadas de robustez, estabilidad de la marcha ni tasa de caídas.
- Política "perpetua": se ejecuta de forma continua hasta que se detiene explícitamente, lo que exige mecanismos externos de parada y supervisión.
- Posible sobreajuste al entorno de entrenamiento: al no documentarse la distribución de entrenamiento, no puede garantizarse la generalización a terrenos o condiciones distintas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-04): conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/SccHy/microduck-hill-a1rb4ck-r1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `challenge-recipe-publishing`, commit `1efd853be`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
