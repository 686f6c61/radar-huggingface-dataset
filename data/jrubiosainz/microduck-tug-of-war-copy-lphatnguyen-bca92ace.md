# jrubiosainz/microduck-tug-of-war-copy-lphatnguyen-bca92ace

## Resumen

Este repositorio contiene una copia byte a byte de la política `policy.onnx` publicada originalmente por el usuario lphatnguyen para la competición Microduck Arena Tug of War. El modelo es una política de control robótico entrenada por refuerzo (reinforcement learning) que gobierna la marcha de un robot cuadrúpedo de pequeño tamaño, el microduck de Pollen Robotics, con el objetivo de arrastrar una referencia hacia una fosa. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es un artefacto de control con 890.504 bytes en formato ONNX que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz.

La relevancia de esta ficha es acotada y muy específica: documenta un ejemplo de política perpetua para un robot de bajo coste, empaquetada como ONNX con el normalizador de observaciones embebido, lista para cargarse mediante el comando `robotctl policy load`. La copia la publica jrubiosainz con fines de participación en la propia Arena, sin haber entrenado, ajustado ni editado la política, y heredando el resultado oficial de la ejecución de origen (puntuación 166,3969, 5 de 5 semillas superadas, runner v5, velocidad comandada -0,3).

El interés técnico reside en la cadena de herramientas (repo `pollen-robotics/microduck_rl`, rama `tug-of-war-fresh`, commit `60852519f`) y en el formato de despliegue (manifiesto de política schema 2), más que en las capacidades cognitivas del artefacto. No hay información sobre arquitectura de red, número de parámetros, datos de entrenamiento ni benchmarks cognitivos; esta ficha lo refleja explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada por RL, empaquetada en ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica: observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye un único `policy.onnx` de 890.504 bytes) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el repositorio de origen no declara licencia; esta copia no relicencia) |
| Formato de pesos | ONNX (`policy.onnx`, sha256 `4794a5a1c73b1c42ebb61d04625ac69d6c93e080984dd9a0b097c1db673e4a9a`) |
| Dimensiones de entrada/salida | 61 observaciones de entrada, 14 acciones de salida |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (se ejecuta hasta que se le indique lo contrario) |
| Slot de política | `walk` |
| Manifiesto | `manifest.json`, schema 2 del microduck policy manifest |

## Arquitectura y entrenamiento

No se dispone de detalles de la arquitectura de red en la información proporcionada: la model card no describe capas, tipo de transformer, CNN ni tamaño del modelo. Lo único verificable es que se trata de una política entrenada por aprendizaje por refuerzo para el robot microduck, con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones, ejecutada en bucle a 50 Hz de forma perpetua. El normalizador de observaciones está embebido dentro del propio `policy.onnx`, de modo que la política acepta observaciones en bruto sin preprocesado externo.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `tug-of-war-fresh`, commit `60852519f`. No se especifican el número de pasos de entorno, la composición del dataset de experiencias, el algoritmo de RL empleado (PPO, SAC u otro), ni si hubo fases de ajuste adicionales. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto. La política de origen se evaluó en la Arena con el runner v5 a una velocidad comandada de -0,3, obteniendo puntuaciones por semilla de 0,9, 0,66, 0,94, 0,7 y 0,72.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck mediante una política perpetua en el slot `walk`.
- Ejecución de una marcha orientada a una tarea concreta: arrastrar la referencia hacia la fosa en el escenario Tug of War.
- Consumo directo de observaciones en bruto de 61 dimensiones, con normalización interna.
- Emisión de 14 acciones de control a 50 Hz.
- Despliegue en robot real mediante `robotctl policy load walk lphatnguyen/microduck-tug-of-war-v0`.
- Ejecución en la Microduck Arena como entrada evaluable, con resultado propio calculado por la propia Arena.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni soporte multilingüe.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: sirve como política de referencia reproducible para comparar algoritmos de RL en la tarea Tug of War, dado que los bytes, el evento, las semillas y la velocidad comandada están fijados y el resultado oficial es conocido.
- Despliegue en robot microduck físico: se carga con `robotctl policy load walk lphatnguyen/microduck-tug-of-war-v0` y el robot ejecuta la marcha de forma continua, lo que permite validar la cadena de despliegue del daemon y el manifiesto schema 2.
- Evaluación comparativa en la Microduck Arena: la copia permite que el marcador muestre el resultado de la Arena para estos mismos bytes junto al original, facilitando la verificación de reproducibilidad entre entradas.
- Docencia y demostraciones de robótica de bajo coste: una política ONNX de menos de 1 MB con normalizador embebido es un ejemplo compacto de extremo a extremo, desde el entrenamiento hasta la ejecución en hardware.
- Pruebas de integración de pipelines ONNX en sistemas embebidos: el tamaño reducido (890.504 bytes) y la interfaz fija (61 entradas, 14 salidas, 50 Hz) permiten medir latencia y throughput de inferencia en el propio robot o en un banco de pruebas.
- Auditoría de linaje y atribución de artefactos: el repositorio documenta hashes sha256, revisión de origen, avisos de atribución y textos de licencia, lo que lo convierte en un caso práctico de trazabilidad de modelos publicados en Hugging Face.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son los de la ejecución oficial en la Microduck Arena, no benchmarks cognitivos:

| Métrica | Valor |
|---|---|
| Puntuación total | 166,39694809913635 |
| Semillas superadas | 5/5 |
| Puntuación semilla s1 | 0,9 |
| Puntuación semilla s2 | 0,66 |
| Puntuación semilla s3 | 0,94 |
| Puntuación semilla s4 | 0,7 |
| Puntuación semilla s5 | 0,72 |
| Runner | v5 |
| Velocidad comandada | -0,3 |
| Identificador de ejecución | 01M6G3ZQXP88SC1QHQH2P2 |

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros no aplican ni están documentados).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto pesa 890.504 bytes en ONNX, por lo que la huella de memoria es mínima y compatible con ejecución en CPU.
- GPU recomendadas: no disponible; no se especifica ningún requisito de GPU. Por el tamaño del modelo, la inferencia en CPU es viable.
- ¿Cabe en GPU de consumo? No hay datos que lo impidan, pero no se documenta ninguna GPU concreta (RTX 4090, A100, H100, etc.).
- Opciones de despliegue: el robot microduck mediante `robotctl policy load walk lphatnguyen/microduck-tug-of-war-v0`; el runtime ONNX subyacente no se detalla. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; la política está diseñada para operar a 50 Hz, pero no se publican mediciones de latencia por paso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck comparables con especificaciones publicadas. El único linaje documentado es el repositorio de origen `lphatnguyen/microduck-tug-of-war-v0` en la revisión `bca92ace`, del cual esta copia es idéntica byte a byte.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-tug-of-war-copy-lphatnguyen-bca92ace | no disponible | no aplica | 166,3969 en Microduck Arena (heredado del origen) | no disponible | Hugging Face |
| lphatnguyen/microduck-tug-of-war-v0 | no disponible | no aplica | 166,3969 en Microduck Arena (ejecución oficial) | no declarada | Hugging Face |
| Otras políticas microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política de control, los sesgos relevantes serían de comportamiento físico (por ejemplo, dependencia de la velocidad comandada -0,3 y del runner v5), no sociales.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es un comportamiento fuera de distribución ante observaciones no vistas durante el entrenamiento.
- Limitaciones de contexto o idioma: no aplica; la interfaz es de 61 observaciones y 14 acciones, sin ventana de contexto textual ni idiomas.
- Restricciones de licencia para uso comercial: el repositorio de origen no declara licencia y esta copia no concede ninguna licencia propia. El uso fuera de Hugging Face queda a criterio de los autores originales, lo que supone un riesgo jurídico para producción comercial.
- La copia no fue entrenada, ajustada, buscada ni editada por jrubiosainz; no se ejecutó replay ni nueva evaluación por su parte, y solo cuenta el resultado que la propia Arena calcule para esta entrada.
- El resultado heredado (166,3969, 5/5 semillas) depende de que bytes, evento, semillas, velocidad comandada y versión de runner coincidan con los del origen; cualquier cambio en esos factores invalida la comparación.
- No se documentan la arquitectura, el número de parámetros ni el algoritmo de entrenamiento, lo que dificulta la auditoría técnica del comportamiento.
- El autor de la copia se compromete a retirarla si el autor original presenta una objeción mediante discusión en el repositorio.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/jrubiosainz/microduck-tug-of-war-copy-lphatnguyen-bca92ace
- Repositorio de origen: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Revisión de origen: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0/tree/bca92ace3a25d383e806456bedc4148807cdcdf6
- Ejecución en la Microduck Arena: https://pollen-robotics-microduck-arena.hf.space/api/runs/01M6G3ZQXP88SC1QHQH2P2
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `tug-of-war-fresh`, commit `60852519f` (no se proporciona URL directa)
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
