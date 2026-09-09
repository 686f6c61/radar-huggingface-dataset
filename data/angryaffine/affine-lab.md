# angryaffine/affine-lab

## Resumen

El repositorio `angryaffine/affine-lab` no contiene un modelo recién entrenado en el sentido clásico, sino un conjunto de artefactos de entrenamiento para la subred SN120 del protocolo Bittensor. El autor es `angryaffine`, y el repositorio incluye un corpus de rollouts de un modelo profesor (teacher) y adaptadores LoRA secuenciales. Está orientado a la competición de modelos en tareas de razonamiento y acción, con datos generados mediante el contrato de chat propio del validador de la subred.

El corpus está construido a partir de 189.158 turnos de duelo, organizados en 7.419 estratos, y fue generado con `Qwen/Qwen3.8-27B` como profesor, a temperatura 0.8 y con un límite de tokens de 1792 (pensamiento + acción). Los turnos se clasifican en tres dialectos de acción: `bash`, `tool_call` y `boxed`, lo que indica que el objetivo es entrenar agentes que puedan ejecutar comandos de shell, llamar herramientas y generar respuestas finales acotadas. El tamaño total del repositorio es de 30.5 GB, sin datos publicados sobre arquitectura completa ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptadores LoRA sobre `Qwen/Qwen3.8-27B` segun la model card) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica si la arquitectura es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptadores LoRA), comprimidos JSONL y Parquet para el corpus |

## Arquitectura y entrenamiento

El repositorio se divide en dos carpetas principales: `corpus/` y `ckpt/`. La carpeta `corpus/` contiene los datos de entrenamiento, con archivos como `rollouts.jsonl.gz`, `train.jsonl.gz`, `worklist.parquet` y `meta.json`. Los rollouts fueron generados con el modelo profesor `Qwen/Qwen3.8-27B` usando un prompt que fuerza la generación a terminar dentro de un bloque `<think>` abierto. Las respuestas se dividen mediante una función `split_rollout` del validador en pares `(z, y)` según el dialecto de acción de cada turno (`bash`, `tool_call` o `boxed`). Solo se conservan los turnos cuya acción se parsea correctamente y cuya longitud en `z` es al menos 80 caracteres.

El criterio de selección de turnos se basa en la probabilidad por token de generación, y se almacena una columna `p` que permite replicar el conjunto de entrenamiento de forma proporcional a la probabilidad de muestreo. El corpus está estratificado por estrato (`stratum`), con una probabilidad de muestreo por turno de `0.17523 / stratum_size`. La carpeta `ckpt/` contiene adaptadores LoRA secuenciales entrenados sobre el modelo que mantiene la posición dominante en la subred en el momento del guardado. No se aportan detalles sobre el número de tokens totales de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- El corpus está diseñado para entrenar modelos capaces de manejar tres dialectos de acción: `bash`, `tool_call` y `boxed`, lo que cubre ejecución de comandos de shell, llamadas a herramientas y respuestas finales estructuradas.
- Los turnos incluyen un espacio de pensamiento explícito (`<think>`) con límites de tokens de pensamiento y acción, lo que apunta a razonamiento encadenado antes de actuar.
- La estructura de rollouts permite entrenar modelos de agentes en escenarios multi-paso, con una separación clara entre la traza intermedia (`z`) y la salida final (`y`).
- El corpus está ponderado probabilísticamente, lo que facilita estudios de muestreo y replicación de conjuntos de datos según la probabilidad de selección original.
- Los adaptadores LoRA secuenciales sugieren un proceso de entrenamiento iterativo sobre un modelo base, permitiendo actualizar el modelo dominante de la subred.
- No se han publicado pruebas explícitas de capacidades de vision, audio ni soporte de function calling a nivel de inferencia, aunque el corpus contiene turnos de tipo `tool_call`.

## Casos de uso

- Investigacion en agentes con herramientas: el corpus puede utilizarse para analizar como un modelo profesor genera secuencias de pensamiento y acciones en entornos de shell, y para entrenar modelos mas pequenos con esas trazas.
- Entrenamiento para la subred SN120 de Bittensor: los adaptadores LoRA y el corpus P-weighted sirven como recurso para ajustar modelos que participan en duelos dentro del protocolo, replicando la distribución de datos del epoch-14.
- Generacion de datos sinteticos para tool calling: los turnos de tipo `tool_call` pueden extraerse para construir conjuntos de entrenamiento especificos de llamadas a herramientas.
- Evaluacion de estrategias de muestreo de datos: la columna `p` y el muestreo por estratos permiten estimar como la probabilidad por token afecta al rendimiento final en tareas de razonamiento y accion.
- Comparacion de politicas de razonamiento: el corpus contiene rollouts con el mismo contrato de chat y el mismo profesor, lo que posibilita evaluar diferencias entre mecanismos de pensamiento de distintos modelos.
- Analisis de evolucion de modelos en competiciones descentralizadas: los puntos de control LoRA en `ckpt/` documentan el estado del modelo dominante en instantes concretos, utiles para estudiar la dinamica de la subred.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Al no incluir un modelo base, no hay requisitos directos de despliegue; seria necesario utilizar `Qwen/Qwen3.8-27B` como base y cargar los adaptadores encima, lo que en una cuantizacion 4-bit aproximada exigiria del orden de 16-20 GB de VRAM, pero esa cifra no esta confirmada en la informacion del repositorio.
- El repositorio no documenta integracion con vLLM, llama.cpp, Ollama ni TGI, por lo que las opciones de despliegue estan por determinar.

## Comparativa con modelos similares

No disponible. El repositorio no expone un modelo final comparable con otros LLMs, sino un corpus y adaptadores especificos para una subred de Bittensor, por lo que no puede situarse junto a alternativas de tamano o tarea equivalente sin informacion adicional.

## Limitaciones y advertencias

- Licencia `other`: no es una licencia estandar; es obligatorio revisar los terminos exactos antes de cualquier uso comercial o redistribucion.
- No es un modelo autonomo: no incluye pesos completos para inferencia directa, solo adaptadores y corpus. Para usarlo se necesita el modelo base `Qwen/Qwen3.8-27B` y una infraestructura compatible.
- El corpus hereda las limitaciones del profesor `Qwen/Qwen3.8-27B`, incluyendo posibles sesgos, errores de alucinacion y sesgos linguisticos no documentados.
- No existen benchmarks publicados que validen la calidad de los adaptadores ni del corpus para produccion.
- El formato de datos es especifico del esquema v3 y del contrato del validador; reutilizarlo fuera de la subred puede requerir una conversion no trivial.
- La presencia de acciones de tipo `bash` introduce un riesgo de seguridad si los modelos entrenados con este corpus se usan para generar comandos de shell en entornos reales sin supervision humana.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/angryaffine/affine-lab
- Perfil del autor: https://huggingface.co/angryaffine
