# lphatnguyen/microduck-tug-of-war-v0

## Resumen

`microduck-tug-of-war-v0` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje ni un sistema generativo de texto: es un controlador neuronal exportado a ONNX que traduce observaciones proprioceptivas del robot (61 dimensiones) en comandos de actuación (14 acciones) a una frecuencia de 50 Hz. Su función concreta es generar una marcha perpetua, es decir, un patrón de locomoción que se ejecuta de forma continua hasta que se le indique lo contrario.

El autor del repositorio es el usuario de Hugging Face `lphatnguyen`, que publica esta política bajo el espacio de nombres del ecosistema microduck. El modelo se integra en el slot `walk` del daemon de control del robot, de modo que puede cargarse directamente en hardware real mediante el comando `robotctl policy load walk`. La política incorpora el normalizador de observaciones dentro del propio grafo ONNX, por lo que el consumidor debe alimentar observaciones en crudo sin preprocesado adicional.

La relevancia de esta ficha es acotada y muy específica: se trata de un artefacto de robótica de nicho, con cero descargas y cero interacciones en el momento de su publicación, orientado exclusivamente a usuarios del robot microduck. No dispone de información pública sobre licencia, idiomas ni benchmarks, y su tamaño de repositorio es de 0.0 GB según los metadatos disponibles, lo que sugiere un artefacto de pesos muy ligero, coherente con una red de política de pequeñas dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control motriz (detalles de capas no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (artefacto ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot de politica | `walk` |
| Libreria | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, dimensión de las capas ocultas, tipo de activaciones ni si emplea memoria recurrente). Lo que sí se documenta es la interfaz: una política que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz, con el normalizador de observaciones embebido en el propio archivo `policy.onnx`. Esta decisión de diseño implica que el despliegue en el robot no requiere un pipeline de preprocesado separado: el daemon entrega observaciones en crudo y el grafo ONNX se encarga de la normalización.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `tug-of-war-fresh` y el commit `60852519f`. Se trata, por tanto, de un entrenamiento de aprendizaje por refuerzo sobre el simulador o entorno de entrenamiento del ecosistema microduck. La model card no especifica el número de pasos de entrenamiento, la composición de las recompensas, el algoritmo de RL empleado (PPO, SAC u otro) ni si hubo fases de ajuste fino o destilación. El calificativo "perpetual" indica que la política está diseñada para ejecutar una marcha continua sin condición de terminación interna.

## Capacidades

- Locomoción continua del robot microduck: genera una marcha perpetua que se mantiene activa hasta que el operador la detiene o carga otra política.
- Control motriz de ciclo cerrado a 50 Hz: consume observaciones proprioceptivas de 61 dimensiones y emite 14 comandos de actuación en cada paso de control.
- Integración directa con el daemon del robot mediante el slot `walk`, sin necesidad de adaptadores adicionales.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica el pipeline de inferencia en el robot.
- Compatibilidad con el manifiesto de políticas microduck en su esquema 2, lo que facilita el versionado y la carga estandarizada.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Demostración de locomoción en el robot microduck: cargar la política en el slot `walk` con `robotctl policy load walk lphatnguyen/microduck-tug-of-war-v0` para que el robot ejecute una marcha continua durante exhibiciones o vídeos de producto.
- Pruebas de integración del daemon de control: usar esta política como carga de referencia para validar que el pipeline de observaciones en crudo y la normalización embebida en ONNX funcionan correctamente en una versión concreta del firmware.
- Benchmarking de políticas de marcha: comparar el comportamiento de `tug-of-war-v0` frente a otras políticas del slot `walk` en el mismo hardware, midiendo estabilidad, consumo y suavidad del movimiento.
- Investigación en aprendizaje por refuerzo para robótica de bajo coste: emplear el repositorio `microduck_rl` y esta política como punto de partida reproducible para experimentos de locomoción en cuadrúpedos pequeños.
- Desarrollo de rutinas de comportamiento: combinar la marcha perpetua con capas de control de alto nivel (parada, cambio de política) para construir secuencias de comportamiento en demostraciones educativas.
- Docencia y talleres de robótica: desplegar la política en robots microduck de aula para ilustrar el ciclo observación-acción de una política neuronal entrenada con RL, sin requerir infraestructura de GPU.
- Validación de despliegue ONNX en sistemas embebidos: usar el artefacto como caso de prueba de inferencia ONNX a 50 Hz en la electrónica del robot, midiendo latencia y uso de CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0.0 GB) y la naturaleza del artefacto, se trata de una red de política de pequeñas dimensiones que previsiblemente se ejecuta en CPU.
- GPU recomendadas: no se documentan; el despliegue previsto es en la electrónica de a bordo del robot microduck, no en GPU de servidor.
- ¿Cabe en GPU de consumo? No aplica como requisito; el artefacto está pensado para inferencia ONNX en el propio robot.
- Opciones de despliegue: runtime ONNX integrado en el daemon microduck mediante `robotctl policy load`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican mediciones de latencia real ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension de observacion | Dimension de accion | Frecuencia | Slot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `lphatnguyen/microduck-tug-of-war-v0` | Política RL ONNX para microduck | 61 | 14 | 50 Hz | `walk` | no disponible | Hugging Face, 0 descargas |
| Otras políticas del ecosistema microduck | Políticas RL ONNX para microduck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de información sobre políticas alternativas comparables en la documentación consultada; la comparativa con modelos de lenguaje u otros artefactos generativos no es aplicable por la naturaleza del modelo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa ni genera texto, y no debe evaluarse con métricas de NLP como MMLU, HumanEval o GSM8K.
- Específico de hardware: la política está entrenada para el robot microduck y su interfaz de 61 observaciones y 14 acciones; no es transferible a otras plataformas sin reentrenamiento.
- Licencia no disponible: la ausencia de licencia explícita impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Cero adopción verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia pública de validación por terceros.
- Sin benchmarks ni métricas de rendimiento publicadas: no es posible cuantificar la calidad de la marcha, la estabilidad ni la robustez ante perturbaciones.
- Riesgo de comportamiento no deseado en hardware real: al ser una política "perpetua", se ejecuta hasta que se detiene explícitamente; es necesario prever mecanismos de parada segura en el daemon.
- Sin información sobre sesgos: al no tratar datos humanos ni lenguaje, no aplican sesgos sociales en el sentido habitual, pero no se documenta el dominio de entrenamiento ni las condiciones de simulación a realidad.
- Fecha de creación futura en los metadatos (2026-11-03): conviene verificar la autenticidad y vigencia del artefacto antes de integrarlo en un sistema.
- Sin garantías de mantenimiento: no se documenta soporte, issues abiertos ni hoja de ruta por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `tug-of-war-fresh`, commit `60852519f`); no se dispone de URL directa en la información proporcionada.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se dispone de URL directa en la información proporcionada.
