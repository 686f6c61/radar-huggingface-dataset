# liuchaoyi/frs-pick01-act-inter-20261109

## Resumen

`frs-pick01-act-inter-20261109` es un checkpoint de investigación publicado por el usuario `liuchaoyi` en Hugging Face, etiquetado como `lerobot`, `robotics`, `pi05`, `flow-matching` y `tactile`. No se trata de un modelo de lenguaje ni de un modelo fundacional autónomo: es el checkpoint de validación óptimo de un decodificador de corrección denominado `act_inter`, que se apoya en un Pi0.5 congelado y en un codificador táctil congelado para generar acciones bimanuales de 20 dimensiones en una tarea de manipulación concreta ("pick_01").

El artefacto principal es `best.pt`, un checkpoint de PyTorch que contiene pesos y metadatos de arquitectura y de contrato de origen, pero no estado del optimizador ni del generador de números aleatorios. El autor advierte explícitamente de que no es un modelo Pi0.5 independiente, sino un componente que requiere el Pi0.5 congelado y las estadísticas de normalización asociadas para funcionar. El repositorio tiene un tamaño de 0.0 GB declarado y cero descargas y likes en el momento de la consulta.

Su relevancia es acotada y experimental: documenta un pipeline de aprendizaje por imitación con fusión visio-táctil sobre LeRobot, con un horizonte de acción de 50 pasos y un historial de validación incluido. No hay resultados de test (la evaluación offline se canceló a petición del usuario), no hay licencia declarada y no hay información sobre idiomas ni sobre benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de corrección `act_inter` sobre un Pi0.5 congelado con flow matching y codificador táctil congelado; no disponible el detalle de capas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`), con metadatos de arquitectura y de origen; no incluye estado del optimizador ni RNG |

## Arquitectura y entrenamiento

El modelo se describe como un decodificador de corrección (`act_inter`) que opera sobre un Pi0.5 congelado y un codificador táctil congelado. La formulación emplea flow matching, según las etiquetas del repositorio, y produce acciones de 20 dimensiones para un sistema bimanual con dos cámaras visuales, cuatro flujos táctiles, estado de 20 dimensiones y horizonte de acción de 50. El checkpoint incluido corresponde al mejor punto de validación del decodificador, no al modelo base.

El entrenamiento se realizó sobre el dataset `KaiyueChen/pick_01` (revisión `e9121783bcd7e6a3feb4f9d42328226b6cf09734`) durante 50 épocas. El mejor Smooth L1 de validación del decodificador fue 0.0388676 en la época 25, paso 3225. El repositorio incluye un CSV y un PNG con el historial de validación, que el autor aclara que no es la pérdida de entrenamiento. No se reportan resultados de test porque la evaluación offline se canceló. El checkpoint depende del Pi0.5 congelado `KaiyueChen/pi05_task1_0902_8k` (revisión `1362eceb5fe3cf00af5c6460bb2c35badf0a76cf`, estadísticas `pick_0102`) y del codificador táctil `KaiyueChen/encoder_ckpt_0824` (revisión `1a432a8b9c1a38f75cb40c58a4924a401486d832`).

## Capacidades

- Generación de acciones robóticas bimanuales de 20 dimensiones con horizonte de 50 pasos.
- Fusión de dos cámaras visuales y cuatro flujos táctiles como entradas sensoriales.
- Aprendizaje por imitación sobre una tarea específica de picking (`pick_01`).
- Corrección de acciones sobre un Pi0.5 congelado mediante el decodificador `act_inter`.
- Integración con el ecosistema LeRobot para entrenamiento y despliegue.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Investigación en manipulación bimanual con fusión táctil: el checkpoint sirve como punto de partida reproducible para estudiar cómo el decodificador `act_inter` corrige las acciones del Pi0.5 congelado en una tarea de picking.
- Reproducción de experimentos de flow matching en robótica: el `train_config.yaml` y el historial de validación permiten replicar el entrenamiento sustituyendo las rutas específicas de máquina por las del entorno propio.
- Evaluación de arquitecturas visio-táctiles: los cuatro flujos táctiles y las dos cámaras permiten comparar estrategias de fusión sensorial en tareas de agarre.
- Base para ajuste fino en tareas de picking similares: al ser un decodificador sobre un Pi0.5 congelado, se puede reentrenar con un dataset propio manteniendo el codificador táctil fijo.
- Docencia y divulgación sobre LeRobot: el repositorio documenta el contrato de origen y las dependencias, lo que facilita explicar un pipeline completo de aprendizaje por imitación.
- Integración en un banco de pruebas de laboratorio: el checkpoint puede cargarse junto con el Pi0.5 y el codificador táctil originales para validar el comportamiento del decodificador en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es el Smooth L1 de validación del decodificador: 0.0388676 en la época 25 (paso 3225). No hay resultados de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del Pi0.5 congelado y del codificador táctil, cuyos tamaños no se especifican.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot (librería declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoría (decodificadores de corrección sobre Pi0.5 con fusión táctil) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el Pi0.5 congelado `KaiyueChen/pi05_task1_0902_8k`, sus estadísticas de normalización `pick_0102` y el codificador táctil `KaiyueChen/encoder_ckpt_0824` en las revisiones indicadas.
- El checkpoint no incluye estado del optimizador ni del generador de números aleatorios, por lo que no permite reanudar el entrenamiento de forma exacta.
- No se han publicado resultados de test; la evaluación offline se canceló a petición del usuario.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- El `train_config.yaml` contiene rutas específicas de máquina sustituidas por marcadores de posición que deben configurarse en el entorno propio.
- Es un modelo específico de una tarea (`pick_01`) y un dataset concretos; no se documenta su generalización a otras tareas.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque el modelo no opera sobre texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liuchaoyi/frs-pick01-act-inter-20261109
- Dataset de entrenamiento: https://huggingface.co/datasets/KaiyueChen/pick_01
- Pi0.5 congelado: https://huggingface.co/KaiyueChen/pi05_task1_0902_8k
- Codificador táctil congelado: https://huggingface.co/KaiyueChen/encoder_ckpt_0824
