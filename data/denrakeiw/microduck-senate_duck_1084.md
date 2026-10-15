# DenRakEiw/microduck-senate_duck_1084

## Resumen

`microduck-senate_duck_1084` es una política de control para robótica entrenada con aprendizaje por refuerzo, publicada por el usuario DenRakEiw en HuggingFace. No es un modelo de lenguaje: se trata de un fichero de pesos exportado en formato ONNX que implementa una marcha (gait) concreta para el robot bípedo microduck de Pollen Robotics, concretamente para la ranura `walk` del sistema de políticas del robot. La model card la describe como una política "perpetua" de tipo *2 m Roller Sprint*, en modo carrera, ajustada mediante estrategias evolutivas (*evolution strategies*) sobre el sistema de puntuación de rodillos (*roller scorer*) de la Arena.

El modelo consume observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, y está pensado para ejecutarse sobre ruedas o rodillos del robot. El normalizador de observaciones viene integrado dentro del propio `policy.onnx`, de modo que la política acepta observaciones en crudo sin preprocesado externo. La carga en el robot se realiza con el comando `sudo robotctl policy load walk DenRakEiw/microduck-senate_duck_1084`, y el repositorio incluye un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

La relevancia de esta ficha es acotada: se trata de un artefacto de aprendizaje por refuerzo para un robot de código abierto, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados. Su interés práctico reside en servir como ejemplo reproducible de entrenamiento de locomoción con RL y estrategias evolutivas dentro del ecosistema microduck.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo exportada a ONNX; no es un transformer ni un modelo de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (el repositorio publica `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con el esquema 2 del manifiesto de políticas de microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Ranura de politica (slot) | `walk` |
| Tamano del repositorio | 0.0 GB |
| Libreria declarada | microduck |

## Arquitectura y entrenamiento

La información disponible no describe la topología de red concreta (número de capas, anchura, tipo de capas o función de activación). Lo que sí se documenta es el procedimiento de entrenamiento: se trata de una política de aprendizaje por refuerzo ajustada mediante estrategias evolutivas (*evolution strategies*) sobre el sistema de puntuación de rodillos de la Arena, en un régimen denominado *2 m Roller Sprint* y en modo carrera. La política se declara como perpetua, es decir, se ejecuta de forma continua hasta que se le indique lo contrario, y ocupa la ranura `walk` del robot.

El entrenamiento se realizó sobre el repositorio `pollen-robotics/microduck_rl`, en la rama `denrakeiw` y en el commit `8dafac487`. No se especifican en la información proporcionada el número de pasos de entrenamiento, la composición del conjunto de datos (que en RL procede de la simulación), ni si hubo fases adicionales de ajuste fino. Tampoco se detalla el simulador empleado ni el dominio de aleatorización. La innovación operativa más destacable, según la propia model card, es la integración del normalizador de observaciones dentro del fichero ONNX, lo que simplifica el despliegue al permitir alimentar observaciones sin transformar.

## Capacidades

- Locomoción bípeda sobre rodillos o ruedas: genera una marcha continua para el robot microduck en la ranura `walk`.
- Control en bucle cerrado a 50 Hz a partir de observaciones de 61 dimensiones y 14 acciones.
- Ejecución perpetua: la política no tiene condición de parada propia y sigue activa hasta que se interrumpa externamente.
- Comportamiento de sprint en modo carrera, ajustado específicamente para el sistema de puntuación de rodillos (*roller scorer*) de la Arena, con una métrica de referencia de 2 m.
- Normalización de observaciones embebida: acepta observaciones en crudo sin preprocesado externo.
- Integración con la herramienta de despliegue `robotctl` mediante el subcomando de carga de políticas.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, *tool calling* ni agentes multi-paso, ya que no es un modelo de lenguaje.

## Casos de uso

- Carreras de robots sobre rodillos en la Arena: la política está ajustada explícitamente sobre el *roller scorer*, por lo que es la candidata directa para competir en la modalidad *2 m Roller Sprint*.
- Demostración de locomoción continua en una unidad microduck: al ser una política perpetua, permite mantener la marcha activa durante exhibiciones o vídeos sin reinicios periódicos.
- Base de partida para ajuste fino con estrategias evolutivas: el repositorio de entrenamiento referenciado (`microduck_rl`, rama `denrakeiw`) permite partir de este resultado y evolucionar variantes de velocidad o estabilidad.
- Prueba de la ranura `walk` en el *stack* de políticas del robot: útil para validar el flujo `robotctl policy load` y el manifiesto de esquema 2 antes de desplegar políticas propias.
- Comparación de estrategias de entrenamiento RL frente a RL + ES: al existir al menos una política hermana publicada por el mismo autor (`microduck-senate_duck_1472`), sirve para contrastar configuraciones.
- Docencia y talleres de robótica con refuerzo: el robot microduck es de hardware abierto y existe material de construcción y tutoriales, de modo que esta política puede usarse como ejemplo funcional en cursos de RL aplicado.
- Evaluación de despliegue ONNX en cómputo embebido: al agrupar normalizador y política en un único fichero, simplifica la integración en el *daemon* del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona una referencia de "2 m Roller Sprint" y un ajuste sobre el *roller scorer* de la Arena, pero no se proporcionan cifras numéricas de distancia recorrida, velocidad, tiempo, tasa de éxito ni comparación con otras políticas. No se debe interpretar el calificador "2 m" como un resultado medido y verificado: aparece únicamente como parte de la descripción del modo de carrera.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio se declara como 0.0 GB y no se publica el número de parámetros, por lo que no puede derivarse una cifra fiable.
- GPU recomendadas: no disponible. Una política de este tipo (61 observaciones, 14 acciones, 50 Hz) es presumiblemente de tamaño reducido y está pensada para ejecutarse en el cómputo a bordo del robot, no en GPU de centro de datos, pero esto no se confirma en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada por falta de datos de tamaño del modelo.
- Opciones de despliegue: `robotctl` (comando `sudo robotctl policy load walk DenRakEiw/microduck-senate_duck_1084`) sobre el *daemon* de microduck; el artefacto es un fichero ONNX, por lo que es compatible con runtimes ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La única referencia temporal es la frecuencia de control de 50 Hz, que implica un periodo de 20 ms por ciclo de inferencia, pero no se publican medidas reales de latencia en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Tipo | Ranura | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DenRakEiw/microduck-senate_duck_1084 | Política RL (ONNX) | `walk` | 61 / 14 | 50 Hz | no disponible | HuggingFace, 0 descargas |
| DenRakEiw/microduck-senate_duck_1472 | Política RL (ONNX) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otras políticas del ecosistema microduck | Política RL (ONNX) | varias | no disponible | no disponible | no disponible | Repositorio `pollen-robotics/microduck` y `microduck_rl` |

No se dispone de datos de rendimiento, licencia ni especificaciones completas de las alternativas, por lo que la comparación cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona sobre lenguaje natural, no soporta *tool calling* ni agentes, y no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- Especialización estrecha: la política está ajustada al modo carrera sobre rodillos y al *roller scorer* de la Arena; su comportamiento fuera de ese dominio (terreno irregular, escaleras, superficies distintas) no está documentado y probablemente degrade.
- Sesgos conocidos: no disponibles. En RL, el comportamiento depende del simulador y del diseño de la función de recompensa, pero no se detalla ninguno de los dos.
- Riesgo de alucinación: no aplica a este tipo de modelo. Sí existe riesgo de sobreajuste al entorno de entrenamiento (*sim-to-real gap*), no cuantificado en la información disponible.
- Limitaciones de contexto o idioma: no aplican; no hay ventana de contexto ni soporte idiomático.
- Licencia: no declarada. La ausencia de licencia explícita impide asumir derechos de uso comercial, modificación o redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validación por terceros. No hay evidencia pública de que se haya ejecutado en hardware real.
- El comando de carga requiere privilegios de superusuario (`sudo`), lo que implica consideraciones de seguridad operativa en el despliegue.
- La fecha de creación declarada en HuggingFace es 2026-10-14, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del artefacto antes de desplegarlo en un robot físico.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-senate_duck_1084
- Modelo hermano del mismo autor: https://huggingface.co/DenRakEiw/microduck-senate_duck_1472
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL citado en la model card: `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `8dafac487`
- Tutorial de construcción del microduck: https://github.com/AI-FanGe/Microduck-build-tutorial
- Página oficial del producto microduck (Pollen Robotics): https://pollen-robotics.com/microduck/
- Recursos, repositorios y herramientas de entrenamiento: https://microduckrobot.org/resources/
