# BabyClaw/duck-skill-20261105-sock-heist-6m

## Resumen

Duck Skill Sock Heist es una política de control para robótica entrenada mediante aprendizaje por refuerzo, publicada por el usuario BabyClaw en Hugging Face. No es un modelo de lenguaje: se trata de un artefacto de inferencia en formato ONNX que mapea 61 observaciones del entorno a 14 acciones de control, diseñado para ejecutarse en CPU dentro del ecosistema de simulación MicroDuck. La política se deriva de los pesos de referencia de Pollen Robotics mediante un pipeline compartido de entrenamiento y búsqueda de políticas (policy-search), y está asociada a un evento concreto de la MicroDuck Arena denominado `sock-heist-6m`.

El repositorio contiene únicamente la política seleccionada, su manifiesto de procedencia y la evidencia de evaluación local. Según la model card, la selección se realizó sobre 45 arranques de desarrollo y se validó sobre arranques finales separados, con una puntuación local de 14,509 y una puntuación oficial reportada de 14,614. La procedencia documenta una búsqueda afín (affine_search) en la generación 47, partiendo de un donante con hash `4325ed73...` y aplicando un vector de 15 parámetros.

Su relevancia es acotada y experimental: se trata de un artefacto de investigación en robótica simulada, sin descargas ni interacciones en el momento de la consulta, con licencia e idiomas no declarados. Resulta útil como ejemplo de política compacta de reinforcement learning exportada a ONNX para inferencia en CPU y de trazabilidad de procedencia mediante hashes SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para robótica (red neuronal exportada a ONNX); arquitectura interna no detallada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (61 observaciones de entrada, 14 acciones de salida) |
| Tipos de cuantizacion | no disponible (inferencia ONNX en CPU) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`b25e241c19dd407ed2efe11a8d56b61409b8714a32b8517460401ea74594d9bd.onnx`) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (capas, dimensiones ocultas ni función de activación). Lo que sí se documenta es la interfaz: 61 observaciones de entrada y 14 acciones de salida, con inferencia en CPU sobre runtime ONNX. La política se enmarca en la librería `microduck` y en el pipeline de entrenamiento y búsqueda de políticas de Duck Skill, que parte de los pesos de referencia de Pollen Robotics (`pollen-robotics/microduck-sock-heist-6m-reference`, revisión `ee81c136...`).

El proceso de selección se describe como una búsqueda afín (`affine_search`) que, en la generación 47, aplicó un vector de 15 parámetros sobre un donante con hash `4325ed73...`. La evaluación se realizó sobre 45 arranques de desarrollo, con 45 éxitos sobre 45 y una puntuación de 14,509; la puntuación oficial reportada es 14,614 y el manifiesto marca `requires_final_official_evaluation: true`, es decir, la evaluación oficial definitiva queda pendiente de confirmación en la Arena. No se especifican volúmenes de datos de entrenamiento, composición del dataset ni uso de RLHF o DPO, dado que no es un modelo generativo de texto.

## Capacidades

- Control motor en simulación: mapea 61 observaciones a 14 acciones continuas de control para la tarea `sock-heist-6m`.
- Inferencia en CPU mediante ONNX, sin necesidad de GPU.
- Ejecución determinista y reproducible gracias a la fijación de la política por hash SHA-256.
- Integración en el ecosistema MicroDuck y en la MicroDuck Arena para evaluación oficial.
- Trazabilidad de procedencia completa: selección, evaluación y pesos congelados documentados con hashes.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Evaluación comparativa en la MicroDuck Arena: la política puede someterse al evento `sock-heist-6m` para obtener la puntuación oficial y compararla con otras políticas del mismo slot.
- Reproducción de experimentos de reinforcement learning: al estar fijada por hash y acompañada de manifiesto, permite replicar exactamente la evaluación local reportada.
- Punto de partida para búsquedas afines posteriores: el vector de 15 parámetros y el donante documentados sirven como base para nuevas generaciones del pipeline `affine_search`.
- Despliegue en robótica simulada de bajo coste: la inferencia ONNX en CPU permite ejecutar la política en entornos sin acelerador hardware.
- Docencia y divulgación sobre trazabilidad de artefactos ML: el repositorio ejemplifica el uso de hashes SHA-256 para congelar políticas y evidencias de evaluación.
- Integración en pipelines de CI para robótica: la política puede incorporarse como artefacto versionado y validarse automáticamente contra arranques de test separados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Arranques de desarrollo | 45 |
| Éxitos en desarrollo | 45 / 45 |
| Puntuación local (desarrollo) | 14,509 |
| Puntuación oficial reportada | 14,614 |
| Generación en la búsqueda | 47 |
| Velocidad (`speed`) | 1,2 |
| Evaluación oficial final | pendiente (`requires_final_official_evaluation: true`) |

No se han publicado resultados frente a modelos comparables en la información disponible. Las puntuaciones locales se describen en la propia model card como indicativas, y la medición oficial corresponde a la Arena.

## Requisitos de hardware

- Inferencia en CPU: el repositorio declara explícitamente inferencia ONNX en CPU, sin requisitos de GPU.
- VRAM estimada: no aplica; no se requiere GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica, aunque podría ejecutarse en cualquier GPU compatible con ONNX Runtime si se desease.
- Opciones de despliegue: ONNX Runtime en CPU; el ecosistema `microduck` y la MicroDuck Arena como entorno de evaluación.
- Latencia y throughput: no disponibles. El tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto muy pequeño, pero no se aportan cifras de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BabyClaw/duck-skill-20261105-sock-heist-6m | Política RL en ONNX | 61 obs. / 14 acciones | no aplica | no disponible | Hugging Face, 0 descargas |
| pollen-robotics/microduck-sock-heist-6m-reference | Política de referencia | no disponible | no aplica | no disponible | Hugging Face (referencia base) |
| Otras políticas del slot `microduck-slot:walk` | Políticas RL | no disponible | no aplica | no disponible | MicroDuck Arena |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; la referencia más directa es la política base de Pollen Robotics de la que deriva este artefacto.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts, generación de texto ni razonamiento general.
- Específica de una tarea y un entorno: solo es válida para `sock-heist-6m` dentro de la simulación MicroDuck.
- Evaluación oficial pendiente: el manifiesto marca `requires_final_official_evaluation: true`; la puntuación de 14,614 debe confirmarse en la Arena.
- Puntuaciones locales indicativas: la propia model card advierte de que los resultados locales no constituyen el resultado oficial.
- Licencia no declarada: no se especifican condiciones de uso comercial ni restricciones, lo que impide evaluar su viabilidad en producción.
- Idiomas no disponibles: el campo de idiomas no aplica y no se documenta.
- Sin métricas de robustez: no se aportan datos sobre generalización fuera de los arranques de desarrollo y finales descritos.
- Sin adopción verificable: 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia externa sobre su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyClaw/duck-skill-20261105-sock-heist-6m
- Evento en la MicroDuck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/sock-heist-6m
- Política de referencia base: https://huggingface.co/pollen-robotics/microduck-sock-heist-6m-reference
