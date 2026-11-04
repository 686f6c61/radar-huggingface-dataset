# SccHy/microduck-hill-a1rb4ck-r0

## Resumen

hill-a1rb4ck-r0 es una política de control motriz (locomoción) entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política neuronal exportada a ONNX que se carga directamente en el daemon del robot para ejecutar una marcha de forma continua e indefinida (política "perpetual"). El modelo consume observaciones de 61 dimensiones y produce 14 acciones de control a 50 Hz.

El repositorio, publicado por el usuario SccHy, contiene los artefactos necesarios para desplegar la política en hardware real: un fichero `policy.onnx` con el normalizador de observaciones integrado y un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. Está pensado para cargarse en una ranura de política del daemon mediante el comando `robotctl policy load`.

Su relevancia es acotada pero concreta: forma parte del ecosistema de publicación de recetas de entrenamiento del repositorio `microduck_rl` de Pollen Robotics, y ejemplifica el flujo completo desde el entrenamiento RL hasta el despliegue en un robot físico de bajo coste. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye documentación sobre el algoritmo, los datos de entrenamiento ni métricas de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

Datos adicionales de interfaz:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (se ejecuta hasta recibir orden de parada) |
| Libreria | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red neuronal: solo indica que la política se exporta como `policy.onnx` y que el normalizador de observaciones está integrado en el propio fichero ONNX, de modo que el robot debe alimentar observaciones en bruto. Se desconoce el número de capas, el tipo de red (MLP, CNN, transformer u otra) y el número de parámetros. Tampoco se detalla el algoritmo de RL empleado (PPO, SAC u otro) ni la composición del entorno de entrenamiento.

El único dato de entrenamiento disponible es la trazabilidad del código: repositorio `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `1efd853be`. Esto sugiere que la política se generó con la receta de entrenamiento publicada por Pollen Robotics para el reto de microduck, pero no se especifican el número de pasos de entrenamiento, la función de recompensa, el dominio de aleatorización ni si hubo destilación o ajuste posterior. No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal, que en cualquier caso no aplicarían a una política de control.

## Capacidades

- Locomoción continua del robot microduck: ejecuta una marcha ("hill") de forma perpetua hasta que se le indique lo contrario.
- Control a 50 Hz con 14 acciones, adecuado para el bucle de control en tiempo real del robot.
- Consumo de observaciones de 61 dimensiones en bruto, con normalización integrada en el ONNX.
- Despliegue directo en hardware mediante el comando `robotctl policy load <slot> SccHy/microduck-hill-a1rb4ck-r0`.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck, lo que permite cargarla en ranuras de política del daemon.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de texto, visión o audio: es exclusivamente una política motriz.

## Casos de uso

- Demostración de locomoción en robot microduck: cargar la política en una ranura del daemon y ejecutar la marcha en una sesión de exhibición o docencia, aprovechando que el normalizador va integrado y no requiere preprocesado externo.
- Prueba de integración del pipeline `robotctl`: usar esta política como carga de referencia para validar que el daemon, el manifiesto y el fichero ONNX se comunican correctamente antes de desplegar políticas propias.
- Base de comparación en experimentos de RL: servir como política de referencia ("hill") frente a políticas entrenadas por el usuario en el mismo entorno, evaluando diferencias de comportamiento a 50 Hz.
- Recolección de datos de marcha: ejecutar la política de forma perpetua para grabar trazas de observación-acción que alimenten entrenamientos posteriores o análisis de estabilidad.
- Validación de hardware: comprobar la respuesta de servos y la estabilidad del robot bajo una marcha conocida antes de abordar tareas más complejas como escalada o terrenos irregulares.
- Material docente para cursos de robótica y RL: ilustrar el ciclo completo entrenamiento en `microduck_rl` → exportación ONNX → despliegue en robot físico con un ejemplo reproducible y de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad de avance, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- El modelo no se ejecuta en GPU de servidor: está diseñado para inferencia en el propio robot microduck, por lo que el requisito real es la CPU embebida del robot y el runtime ONNX del daemon.
- VRAM estimada: no aplica; el tamaño del repositorio es de 0.0 GB, lo que sugiere un fichero ONNX de pocos kilobytes o megabytes.
- GPU recomendadas: no aplica para despliegue; para reentrenar políticas similares se usaría el stack de `microduck_rl`, pero no se especifican requisitos en la información disponible.
- Compatibilidad con GPU de consumo: no relevante para inferencia, dado que el destino es el hardware del robot.
- Opciones de despliegue: daemon de microduck con `robotctl` y runtime ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control opera a 50 Hz (20 ms por ciclo); no se publican medidas de latencia de inferencia del ONNX.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables de la misma categoría, y no se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura, parámetros, algoritmo de entrenamiento ni métricas, lo que impide evaluar su calidad o reproducibilidad.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Repositorio sin tracción: 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-04), sin evidencia de validación por terceros.
- Ámbito de aplicación restringido: solo ejecuta una marcha perpetua; no hay indicación de que sea robusta ante terrenos irregulares, empujes o cambios de carga.
- Riesgo de comportamiento inseguro en hardware real: al ser una política de RL sin métricas publicadas, podría provocar movimientos bruscos o inestabilidad; se recomienda probarla primero con el robot suspendido o en un espacio despejado.
- Dependencia del daemon y del esquema de manifiesto 2: cambios en `robotctl` o en el esquema podrían romper la carga de la política.
- Sin soporte multilingüe ni de texto: no debe confundirse con un modelo de lenguaje pese a aparecer en HuggingFace con etiquetas genéricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SccHy/microduck-hill-a1rb4ck-r0
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `challenge-recipe-publishing`, commit `1efd853be`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)
