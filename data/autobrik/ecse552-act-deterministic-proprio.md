# Autobrik/ecse552-act-deterministic-proprio

## Resumen

Autobrik/ecse552-act-deterministic-proprio es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers) entrenado por el autor Autobrik para el proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que mapea observaciones visuales a acciones de control de un brazo robótico, en concreto objetivos articulares absolutos de 7 dimensiones.

El modelo reutiliza el código original de ACT de tonyzhaozh sin modificaciones y se entrena sobre el dataset Autobrik/ecse552-ocbench-block. Las adaptaciones respecto al ACT original son concretas: solo se usan imágenes (el estado del robot se pone a cero), las 7 dimensiones de acción se rellenan con ceros hasta las 14 del upstream, los episodios son de longitud variable y el chunk de acción es de 20 pasos a 10 Hz (2 segundos), frente a los 100 pasos a 50 Hz de ACT.

Es relevante como artefacto de investigación reproducible: el repositorio incluye múltiples ejecuciones por número de demostraciones y semilla, checkpoints seleccionados por validación, estadísticas del dataset y ficheros de procedencia. No obstante, es un modelo de nicho, sin descargas ni likes, sin benchmarks publicados y sin idiomas ni capacidades de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ventana de observación definida por el entorno) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch, sin versiones GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt`; además `dataset_stats.pkl`, `act_run.json`, `history.json`, `provenance.json` |
| Tamaño del repositorio | 0.7 GB |
| Dataset de entrenamiento | Autobrik/ecse552-ocbench-block (revisión `6b5e02b6ec6b7a1083479ca57411b3c5295a6021`) |
| Frecuencia de control | 10 Hz, chunk de 20 acciones (2 s) |
| Dimensionalidad de acción | 7 dimensiones (objetivos articulares absolutos), rellenadas a 14 |
| Entrada | solo imágenes (estado del robot a cero) |

## Arquitectura y entrenamiento

La arquitectura es ACT original, sin modificaciones respecto al repositorio de tonyzhaozh. ACT combina un encoder visual con un transformer que predice chunks de acciones (secuencias de objetivos de control), lo que reduce el error de acumulación típico de las políticas paso a paso. En esta variante concreta, el modelo es determinista y proprioceptivo en el sentido de que se entrena con estado propioceptivo del robot, pero el autor indica que el estado se pone a cero y la entrada efectiva son solo imágenes.

El entrenamiento se realiza sobre el dataset ecse552-ocbench-block, con episodios de longitud variable y acciones expresadas como objetivos articulares absolutos. El chunk de 20 pasos a 10 Hz equivale a 2 segundos de horizonte de predicción, manteniendo la relación temporal del ACT original (100 pasos a 50 Hz). El repositorio contiene ejecuciones organizadas por número de demostraciones y semilla (`n<demos>/seed<k>/`), con checkpoints de mejor pérdida de validación, último checkpoint y un checkpoint seleccionado por rendimiento en rollouts de validación sobre el entorno fuente. No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO (no aplica en este dominio).

## Capacidades

- Predicción de chunks de acciones de 7 dimensiones (objetivos articulares absolutos) a partir de observaciones visuales.
- Control de manipulación robótica a 10 Hz con horizonte de 20 pasos (2 s).
- Ejecución de políticas entrenadas por imitación supervisada sobre demostraciones.
- Soporte de múltiples colecciones de datos de entrenamiento (oracle y pseudo-etiquetadas), listadas en `act_run.json` (`data.collections`).
- Carga programática mediante `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas, visión general ni audio.
- No tiene capacidades multilingües: no procesa lenguaje.

## Casos de uso

- Reproducción de experimentos de imitación en robótica: el repositorio incluye ejecuciones por número de demostraciones y semilla, lo que permite replicar curvas de aprendizaje y comparar la selección de checkpoints por validación.
- Investigación sobre aprendizaje a partir de vídeos sin acciones: el modelo sirve como política base para comparar objetivos oracle frente a objetivos pseudo-etiquetados en el proyecto ECSE 552.
- Evaluación de políticas ACT en entornos de benchmark de manipulación: al estar entrenado sobre ecse552-ocbench-block, se puede usar como referencia en experimentos con el mismo conjunto de tareas.
- Docencia y formación: útil como ejemplo práctico de pipeline completo de imitation learning (dataset, estadísticas, entrenamiento, selección y evaluación en rollouts).
- Análisis de robustez frente a variaciones de demostraciones: las distintas carpetas `n<demos>/seed<k>/` permiten estudiar cómo escala el rendimiento con el número de demostraciones.
- Integración en un bucle de control simulado: cargando `selected.ckpt` con `ActPolicy` se puede ejecutar la política en un simulador compatible con las observaciones del dataset para pruebas de control a 10 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de éxito por tarea, tasas de éxito en rollouts ni comparaciones numéricas con otras políticas; solo describe la estructura de checkpoints y la selección por pérdida de validación y rollouts de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0.7 GB, pero incluye múltiples checkpoints y artefactos; el tamaño de un checkpoint individual no se especifica.
- GPU recomendadas: no disponible. Al ser un transformer con encoder visual y chunk corto (20 pasos), es probable que quepa en GPUs de consumo, pero no hay datos publicados que lo confirmen.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: carga mediante el código del proyecto (`action_free.act_original.ActPolicy`) sobre PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-deterministic-proprio | ACT para manipulación robótica | no disponible | no aplica | MIT | Hugging Face, 0 descargas |
| ACT original (tonyzhaozh/act) | ACT de referencia | no disponible en la información | no aplica | MIT (según repositorio original) | GitHub |
| Otras políticas de imitation learning (p. ej. Diffusion Policy) | Políticas de control | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho sin descargas ni validación externa; no hay evidencia de rendimiento más allá de la selección interna por validación.
- Entrenado únicamente sobre el dataset ecse552-ocbench-block; no se espera generalización a otros entornos, robots o tareas sin reentrenamiento.
- La entrada efectiva son solo imágenes con el estado del robot a cero; no explota información propioceptiva aunque el nombre lo sugiera.
- Acciones de 7 dimensiones rellenadas a 14 con ceros: cualquier integración debe respetar ese formato.
- Sin benchmarks publicados; no se puede afirmar su calidad frente a ACT original u otras políticas.
- Riesgo de sobreajuste a las demostraciones y a las condiciones del simulador; no hay datos sobre robustez ante cambios de iluminación, cámara u objeto.
- Licencia MIT permite uso comercial, pero el dataset y el código de terceros pueden tener sus propias condiciones; verificar antes de producción.
- No apto para tareas de lenguaje, visión general, código o razonamiento; cualquier uso fuera de control robótico está fuera de su dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-deterministic-proprio
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Código del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
