# DenRakEiw/microduck-senate_duck_2000

## Resumen

senate_duck_2000 es una politica de control para el robot microduck desarrollada por el usuario DenRakEiw y publicada en HuggingFace. No se trata de un modelo de lenguaje, sino de una politica neuronal de robótica entrenada mediante aprendizaje por refuerzo (reinforcement learning) con estrategias de evolucion (evolution strategies). El modelo card la describe como una politica "perpetua" que se ejecuta de forma continua hasta recibir orden de parada, y que ocupa el slot `walk` del sistema de politicas del microduck, es decir, controla una marcha (gait) concreta del robot.

La politica consume una observacion de 61 dimensiones y produce 14 acciones, ejecutandose a 50 Hz. Esta pensada para el robot microduck de Pollen Robotics y se distribuye como artefacto ONNX (`policy.onnx`) acompanado de un `manifest.json` que sigue el esquema 2 del manifiesto de politicas del daemon. Segun la model card, se obtuvo afinando (fine-tuning) mediante estrategias de evolucion sobre el scorer de rodillos de la Arena, partiendo del estado de entrenamiento denominado gladstone, dentro del repositorio `pollen-robotics/microduck_rl`.

Es relevante en el nicho de robotica de bajo coste y aprendizaje por refuerzo porque ilustra un flujo de trabajo reproducible: una politica entrenada en simulacion, exportada a ONNX y desplegable directamente en un robot real mediante un comando del daemon (`robotctl`). El repositorio tiene un tamano reportado de 0.0 GB, 4 descargas y 0 likes en el momento de la consulta, sin licencia ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica neuronal entrenada con estrategias de evolucion; la model card no especifica la topologia de red) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (politica reactiva de 61 dimensiones de observacion; no tiene ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan cuantizaciones alternativas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) mas `manifest.json` (esquema 2 del manifiesto de politicas del daemon) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red. Se sabe que es una politica de aprendizaje por refuerzo para el microduck, con una interfaz de 61 dimensiones de observacion de entrada y 14 acciones de salida, ejecutandose a 50 Hz. El normalizador de observaciones esta integrado dentro de `policy.onnx`, de modo que la politica recibe observaciones en crudo sin preprocesado externo. El entrenamiento se enmarca en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`.

El metodo de entrenamiento descrito es el fine-tuning mediante estrategias de evolucion (evolution strategies) sobre el "roller scorer" de la Arena, partiendo de un estado previo denominado gladstone. La model card etiqueta el resultado como "2 m Roller Sprint" y lo describe como una politica perpetua: se ejecuta de forma continua hasta que se le indica lo contrario. No se proporcionan datos sobre el numero de tokens, la composicion del dataset ni el uso de tecnicas tipo RLHF o DPO, que ademas no aplican a este tipo de politica.

## Capacidades

- Generacion de una marcha (gait) continua para el slot `walk` del microduck.
- Control reactivo a partir de una observacion de 61 dimensiones y emision de 14 acciones a 50 Hz.
- Ejecucion perpetua: la politica no termina por si sola, corre hasta que el daemon la detiene.
- Integracion directa con el daemon del robot mediante `robotctl policy load walk DenRakEiw/microduck-senate_duck_2000`.
- Entrada de observaciones en crudo, ya que el normalizador esta embebido en `policy.onnx`.
- No dispone de soporte documentado de tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modalidades de vision o audio, dado que no es un modelo de lenguaje.

## Casos de uso

- Marcha por defecto del microduck: cargar esta politica en el slot `walk` para que el robot camine de forma continua en tareas de desplazamiento sostenido, gracias a su caracter de politica perpetua.
- Demostraciones y experimentos de robótica educativa: usar el microduck con esta gait para ilustrar como una politica entrenada en simulacion se despliega en hardware real via ONNX y `robotctl`.
- Evaluacion de sim-to-real: comparar el comportamiento de la politica en el robot fisico frente a los resultados del scorer de la Arena, al ser un artefacto afinado sobre ese scorer.
- Base para nuevos fine-tunings: al proceder de un linaje concreto (gladstone, rama `denrakeiw`, commit `b76573f1a`), sirve como punto de partida para experimentos de evolucion adicionales en `microduck_rl`.
- Benchmarking interno de controladores: integrarla como referencia en la comparacion de distintas politicas del slot `walk` dentro de un mismo pipeline de evaluacion.
- Reproduccion de resultados: dado que la model card indica repositorio, rama y commit de entrenamiento, permite recrear o auditar el proceso que dio lugar a la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas de rendimiento, recompensa, exito de tarea ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio reportado es de 0.0 GB, lo que sugiere un artefacto de muy pocos megabytes, pero no se aportan cifras oficiales.
- GPU recomendadas: no disponible. Al ser una politica ONNX de bajas dimensiones (61 observaciones, 14 acciones), es plausible que se ejecute en CPU, pero no se confirma en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el despliegue documentado es mediante el daemon del microduck con `robotctl policy load walk DenRakEiw/microduck-senate_duck_2000`, cargando el `policy.onnx` y su `manifest.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. La politica esta disenada para operar a 50 Hz, pero no se publican mediciones de latencia ni de rendimiento.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas comparables del ecosistema microduck ni datos de rendimiento que permitan establecer una comparacion objetiva en parametros, contexto, licencia o disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no hay informacion sobre condiciones de uso, lo que impide confirmar si se permite el uso comercial o la redistribucion.
- Ausencia de benchmarks: no existen metricas publicadas que respalden el rendimiento de la politica, por lo que su eficacia real no esta verificada de forma independiente.
- Huella minima en la plataforma: 4 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Riesgo de brecha sim-to-real: al ser una politica afinada sobre un scorer de simulacion (Arena), su comportamiento en el robot fisico puede diferir del observado en entrenamiento.
- Ausencia de datos sobre sesgos, generalizacion o robustez: la model card no documenta el rango de condiciones (terrenos, velocidades, perturbaciones) en las que la gait es fiable.
- Dependencia del ecosistema: requiere el daemon del microduck y el esquema 2 del manifiesto de politicas; no es un artefacto autonomo ni portable a otros robots sin adaptacion.
- La observacion debe alimentarse en crudo: intentar normalizarla externamente romperia el comportamiento, ya que el normalizador esta embebido en `policy.onnx`.
- Fechas de creacion y actualizacion registradas como 2026-10-14, con apenas tres segundos entre ambas, lo que apunta a una publicacion sin revision posterior.

## Enlaces

- HuggingFace: https://huggingface.co/DenRakEiw/microduck-senate_duck_2000
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `denrakeiw`, commit `b76573f1a`)
- Documentacion del manifiesto de politicas del daemon: `docs/policy-manifest.md` (dentro del repositorio del daemon)
