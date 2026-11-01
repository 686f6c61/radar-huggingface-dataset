# lphatnguyen/microduck-sock-heist-6m-v3

## Resumen

`sock-heist-6m-v3` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje ni un sistema multimodal: es una política neuronal que traduce observaciones del robot (61 dimensiones) en acciones de control (14 dimensiones) a una frecuencia de 50 Hz, con el objetivo de ejecutar una marcha perpetua que el autor denomina "sock-heist" dentro del entorno de simulación Mjlab.

El autor, `lphatnguyen`, publica el artefacto como un checkpoint derivado de un entrenamiento concreto (iteración 4000, semilla 2) sobre el framework `mjlab-microduck 0.1.0`. La política se distribuye empaquetada en ONNX con el normalizador de observaciones ya integrado, de modo que el robot puede consumir observaciones en bruto sin preprocesado adicional. El repositorio ocupa 0,0 GB según los metadatos de HuggingFace, lo que sugiere un tamaño de pesos muy reducido, coherente con una política de control y no con un modelo generativo.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline de RL para robótica con microduck, y como política cargable en un slot del daemon `robotctl`. No hay información pública sobre licencia, idiomas ni benchmarks de rendimiento en la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL; red feed-forward empaquetada en ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; el normalizador va integrado en `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas de microduck) |

Otros datos técnicos relevantes:

| Parámetro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (se ejecuta hasta recibir orden de parada) |
| Tarea de entrenamiento | `Mjlab-SockHeist6m-MicroDuck` |
| Checkpoint | 4000 |
| Semilla | 2 |
| Framework base | `mjlab-microduck 0.1.0 @ 1efd853be` |
| Librería de carga | `microduck` |
| Pipeline declarado | `robotics` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, función de activación ni si emplea memoria recurrente). Lo que sí se documenta es el contrato de interfaz: la política recibe un vector de observación de 61 dimensiones y emite 14 acciones a 50 Hz, y el normalizador de observaciones está embebido en el propio `policy.onnx`, de forma que la entrada debe ser la observación en bruto del robot. El artefacto se acompaña de un `manifest.json` conforme al schema 2 del manifiesto de políticas del daemon de microduck.

El entrenamiento se realizó con aprendizaje por refuerzo en simulación sobre el framework `mjlab-microduck`, con 4096 entornos paralelos, un máximo de 600 iteraciones del agente y la semilla 2, partiendo de un run previo (`2026-10-31_12-56-15_safe3`) y del checkpoint `model_3500.pt`. El autor advierte explícitamente que el proceso no es bit-reproducible entre máquinas: repetir el entrenamiento con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idéntica. No se documentan datos sobre composición del dataset (al tratarse de RL en simulación, la "distribución" es la del entorno), ni sobre RLHF/DPO, ni innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck mediante política de RL, con 14 acciones de control a 50 Hz.
- Ejecución de una marcha perpetua: la política se mantiene activa hasta que se le indique lo contrario, sin horizonte de episodio definido en la interfaz de despliegue.
- Consumo de observaciones en bruto: el normalizador está integrado en el ONNX, lo que elimina la necesidad de replicar el preprocesado en el robot.
- Carga en un slot de política del daemon mediante `robotctl policy load <slot> <repo>`.
- Compatibilidad con el manifiesto de políticas schema 2 de microduck.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling, capacidades de agente ni multilingüismo: es una política de control motriz, no un modelo fundacional.

## Casos de uso

- Despliegue de referencia en microduck: cargar la política en un slot con `robotctl policy load` para disponer de una marcha funcional sin entrenar desde cero, útil para validar la cadena de herramientas del daemon y del manifiesto.
- Reproducción de experimentos de RL en robótica: el autor documenta comando, commit (`fb3c11f14`), semilla y checkpoint, lo que permite replicar el pipeline con `uv sync` y `uv run train` para estudiar la variabilidad entre ejecuciones.
- Base para fine-tuning o currículos de entrenamiento: al partir de un checkpoint concreto (`model_3500.pt`) y una tarea definida (`Mjlab-SockHeist6m-MicroDuck`), sirve como punto de partida para variantes de la marcha o para entrenar tareas derivadas en el mismo entorno Mjlab.
- Docencia y demostraciones de simulación a realidad: una política pequeña en ONNX con interfaz de 61 observaciones y 14 acciones es un ejemplo manejable para explicar el ciclo observación-acción en robótica con RL.
- Integración en pruebas de CI del ecosistema microduck: el artefacto y su manifiesto permiten verificar que el daemon carga políticas correctamente y que el esquema del manifiesto se respeta.
- Comparación de políticas en el mismo robot: al ser una política perpetua cargable en slot, puede contrastarse con otras políticas del mismo repositorio de challenges para evaluar estabilidad de la marcha en distintas condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, estabilidad de la marcha ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB según los metadatos, lo que apunta a un modelo de pesos muy reducidos, pero no se publica el número de parámetros ni el tamaño exacto del ONNX.
- GPU recomendadas: no disponibles para inferencia. Para reentrenamiento, la documentación indica ejecución con `--gpu-ids '[1]'` y 4096 entornos paralelos, lo que implica una GPU de datacenter con memoria suficiente, pero no se especifica el modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada. Por el tamaño aparente del artefacto, es plausible que la inferencia quepa en GPU de consumo, pero no hay dato publicado que lo respalde.
- Opciones de despliegue: el artefacto está pensado para el runtime `microduck` mediante el daemon `robotctl` y el formato ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control), dato derivado del contrato de la interfaz. No se publican latencias medidas ni throughput en hardware concreto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni artefactos comparables con parámetros, contexto o métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si el uso comercial está permitido, lo que impide asumir derechos de explotación sin consultar al autor.
- Sesgos conocidos: no documentados. Al entrenarse en un entorno simulado concreto (`Mjlab-SockHeist6m-MicroDuck`), la política puede no generalizar a condiciones físicas, terreno o hardware distintas de las simuladas.
- Riesgo de fallo en transferencia sim-a-real: no se publican datos de despliegue en robot físico ni métricas de robustez, por lo que el comportamiento real es incierto.
- No reproducibilidad bit a bit: el propio autor advierte que reentrenar con la misma semilla produce una política comparable, no idéntica.
- Ámbito de uso restringido: no es un modelo de lenguaje ni multimodal; no debe evaluarse con métricas de MMLU, HumanEval o GSM8K, que no aplican.
- Idiomas y contexto: no aplica, pero conviene señalar que la ficha no puede aportar datos de multilingüismo ni ventana de contexto porque el artefacto no los tiene.
- Dependencia de la cadena de herramientas: el despliegue requiere el daemon de microduck, el esquema de manifiesto schema 2 y el runtime `microduck`; cambios de versión en esos componentes pueden romper la compatibilidad.
- Ausencia de benchmarks: sin métricas publicadas, no es posible avalar el rendimiento de la marcha frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Repositorio de microduck: https://github.com/pollen-robotics/microduck
- Repositorio de challenges y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Rama de entrenamiento: `sock-heist-training` (commit `fb3c11f14`) en el repositorio anterior
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
