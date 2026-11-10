# nikghodki/microduck-heist-dgx1-700

## Resumen

`nikghodki/microduck-heist-dgx1-700` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal exportado a ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensado para ejecutarse en el propio robot mediante el daemon `robotctl`. El autor del repositorio es el usuario de Hugging Face `nikghodki`, que publica el checkpoint 700 de un entrenamiento concreto sobre la tarea `Mjlab-SockHeist6m-MicroDuck`.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0.0 GB y la model card es fundamentalmente un manifiesto de entrenamiento y reproducción. Aun así, resulta representativo del ecosistema emergente de políticas robóticas empaquetadas como artefactos versionados: un pipeline `robotics` con pesos ONNX, un manifiesto JSON con esquema propio y un flujo de despliegue por línea de comandos sobre hardware real.

Arquitectónicamente no se dispone de detalles de la red neuronal (número de capas, anchura, tipo de política). La información pública se limita al contrato de entrada/salida (61 observaciones, 14 acciones, 50 Hz), al origen del entrenamiento (framework mjlab, 4096 entornos paralelos, 1000 iteraciones máximas, semilla 1) y al hecho de que la normalización de observaciones está embebida en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL exportada a ONNX; sin detalle de capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no describe la topología de la red. Se sabe que es una política de aprendizaje por refuerzo entrenada con el framework mjlab (versión `mjlab-microduck 0.1.0`, commit `1efd853be`) sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, definida en el repositorio `pollen-robotics/microduck-challenges` (rama `main`, commit `5cee942d8`). El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 1000 iteraciones del agente, semilla 1 y logging a TensorBoard, dando como resultado el checkpoint 700.

El contrato de la política es explícito: 61 dimensiones de observación, 14 acciones y frecuencia de control de 50 Hz. La política es de tipo "perpetuo", es decir, se ejecuta de forma continua hasta que se le indique lo contrario, y se carga en una ranura (*slot*) del daemon del robot. Un detalle técnico relevante es que el normalizador de observaciones está incluido dentro de `policy.onnx`, por lo que no es necesario replicar el preprocesado en el lado del cliente. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Generación de marcha/control locomotor continuo para el robot microduck a 50 Hz, ejecutándose de forma indefinida hasta recibir una orden de parada.
- Mapeo directo de observaciones en bruto (61 dimensiones) a acciones (14 dimensiones) sin preprocesado externo, gracias al normalizador embebido.
- Despliegue sobre hardware real mediante el comando `robotctl policy load <slot> nikghodki/microduck-heist-dgx1-700`.
- Compatibilidad con el esquema 2 del manifiesto de políticas microduck (`docs/policy-manifest.md` en el repositorio del daemon).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: es exclusivamente un controlador motor.
- No se documentan capacidades de adaptación a tareas distintas de la entrenada (`Mjlab-SockHeist6m-MicroDuck`).

## Casos de uso

- **Investigación en aprendizaje por refuerzo robótico**: servir como referencia reproducible de un pipeline completo (entorno mjlab, entrenamiento masivo en paralelo, exportación a ONNX y despliegue en robot) para comparar variantes de entrenamiento con la misma tarea y semilla.
- **Despliegue de políticas en el microduck**: cargar la política en una ranura del daemon mediante `robotctl` para ejecutar la marcha entrenada sobre el robot físico en pruebas de laboratorio.
- **Docencia y demostraciones de robótica de código abierto**: usar el repositorio como ejemplo mínimo de artefacto de política versionado con manifiesto y contrato de observación/acción bien definido.
- **Integración en pipelines de CI para políticas robóticas**: validar la carga del ONNX y la conformidad del `manifest.json` contra el esquema 2 antes de promocionar una política a un slot de producción.
- **Reproducción de experimentos**: reentrenar con el comando documentado (`uv sync`, `uv run train ... --env.scene.num-envs 4096 --agent.max-iterations 1000 --agent.seed 1`) para generar políticas comparables y estudiar la varianza entre ejecuciones.
- **Evaluación comparativa de checkpoints**: contrastar el checkpoint 700 con otros checkpoints del mismo entrenamiento para analizar la evolución del rendimiento de la política a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, estabilidad de la marcha ni comparaciones con otras políticas.

## Requisitos de hardware

- **Inferencia en robot**: el modelo se ejecuta en el propio microduck a 50 Hz mediante el daemon `robotctl`; no se documentan requisitos de cómputo del robot ni aceleradores.
- **VRAM estimada para inferencia**: no disponible (el tamaño del repositorio es de 0.0 GB y no se publica el número de parámetros).
- **GPU recomendadas para inferencia**: no disponible; al ser una política ONNX de control, es plausible su ejecución en CPU, pero no está confirmado en la documentación.
- **Compatibilidad con GPU de consumo**: no disponible.
- **Entrenamiento**: el comando documentado usa 4096 entornos paralelos y logging a TensorBoard; no se especifica la GPU empleada (el nombre del run, `dgx-heist1`, sugiere una plataforma NVIDIA DGX, pero no se confirma).
- **Opciones de despliegue**: `robotctl` (daemon del microduck) y ejecución directa de ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: frecuencia de control fijada en 50 Hz (periodo de 20 ms); no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikghodki/microduck-heist-dgx1-700 | Política RL (ONNX) para microduck | 61 obs / 14 acciones | 50 Hz | no disponible | Hugging Face (0 descargas) |
| Políticas de referencia de `pollen-robotics/microduck-challenges` | Políticas RL para microduck | no disponible | no disponible | no disponible | Repositorio GitHub |
| Otras políticas comunitarias de microduck en Hugging Face | Políticas RL (ONNX) | contrato microduck | 50 Hz | variable | Hugging Face |

No se dispone de datos de rendimiento de alternativas que permitan una comparación cuantitativa; la comparativa se limita a aspectos de formato, contrato y disponibilidad.

## Limitaciones y advertencias

- **Licencia no especificada**: no hay licencia declarada, lo que impide determinar si el uso comercial está permitido; en producción debe tratarse como no autorizado hasta confirmación del autor.
- **Alcance funcional mínimo**: es una política específica para una única tarea (`Mjlab-SockHeist6m-MicroDuck`); no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- **Sin métricas publicadas**: no hay benchmarks, curvas de recompensa ni tasas de éxito, por lo que no es posible evaluar su calidad antes de desplegarla.
- **Reproducibilidad limitada**: el propio autor advierte que el entrenamiento no es bit-reproducible entre máquinas; los pesos exactos no pueden regenerarse a partir del comando documentado.
- **Madurez y soporte**: 0 descargas y 0 likes, sin documentación adicional sobre sesgos, estabilidad o fallos conocidos; no hay garantías de mantenimiento.
- **Riesgo en hardware real**: al ser una política "perpetua" sin parada implícita, su despliegue en el robot requiere supervisión y un mecanismo externo de parada.
- **Dependencia del daemon**: el despliegue depende del esquema 2 del manifiesto y de la interfaz `robotctl`; cambios en el daemon pueden romper la compatibilidad.
- **Sin información sobre sesgos**: no aplica en el sentido lingüístico, pero no se documenta el comportamiento de la política ante distribuciones de observación fuera del entrenamiento (riesgo de fallo silencioso).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikghodki/microduck-heist-dgx1-700
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Framework de entrenamiento mjlab: no disponible (no se proporciona URL en la información)
- Documentación del manifiesto de políticas (`docs/policy-manifest.md`): no disponible como URL directa; se referencia dentro del repositorio del daemon
- Paper, blog o demo: no disponible
