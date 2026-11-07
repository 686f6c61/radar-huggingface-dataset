# pmolodyk/vla_ma

## Resumen

vla_ma es un adaptador LoRA sobre el modelo de visión-lenguaje-acción (VLA) FineART-VLA-subtask-midtrained, publicado por el usuario pmolodyk en Hugging Face. Se trata de un ajuste fino ligero (PEFT) orientado a robótica manipulativa: el modelo recibe un vector de estado articular de 14 dimensiones junto con tres imágenes RGB (cámara alta, muñeca izquierda y muñeca derecha) y produce secuencias de acciones absolutas de 14 dimensiones para un robot. El adaptador conserva la arquitectura del modelo base y solo entrena un subconjunto de pesos mediante LoRA.

El modelo base, desarrollado por LeRobot (Hugging Face), es un VLA de tipo "subtask-midtrained": un transformer multimodal que combina un codificador visual, un modelo de lenguaje de tipo Gemma y una cabeza de predicción de acciones. La innovación del pipeline es la separación en dos fases: primero un planificador que genera una subtarea en lenguaje natural (`next_subtask`) y después un módulo de bajo nivel que traduce esa subtarea y las observaciones en una secuencia de 50 acciones. El adaptador vla_ma hereda esta estructura y añade un ajuste específico sobre ella.

La relevancia del modelo es doble: por un lado, demuestra el flujo de trabajo de adaptación de VLAs robóticos con LoRA y PEFT, lo que permite reutilizar un checkpoint base grande con un coste de entrenamiento bajo; por otro, su licencia Gemma y su naturaleza de adaptador lo hacen interesante para experimentación en robótica de manipulación, aunque con las restricciones de uso que impone la licencia heredada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre FineART-VLA (transformer multimodal visión-lenguaje-acción) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

vla_ma no es un modelo completo, sino un adaptador LoRA que se aplica sobre `lerobot/FineART-VLA-subtask-midtrained` en la revisión `b6cf4faf2630f971dd390bc32365e9d9c330da8e`. El modelo base es un VLA que integra un codificador de imágenes (tres vistas RGB), un modelo de lenguaje de la familia Gemma y una cabeza de predicción de acciones. La arquitectura sigue el paradigma de los VLAs modernos: las observaciones visuales y el estado del robot se tokenizan y se pasan a un transformer multimodal que genera acciones de forma autorregresiva o mediante un cabezal específico. El adaptador LoRA modifica los pesos de atención y proyección del modelo base, manteniendo congelado el resto.

El entrenamiento del adaptador se realizó con LeRobot (commit `72e1d9e5e76ee719bacfc78bc34d817bee5fb521`), Transformers 5.5.4 y PEFT 0.21.2. El modelo base fue "midtrained" en tareas de subtarea, es decir, entrenado para generar subtareas intermedias en lenguaje natural antes de la predicción de acciones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es la separación planner/low-level: el planner genera una subtarea textual y el módulo de bajo nivel la convierte en acciones, lo que permite instrucciones de alto nivel y un control más interpretable.

## Capacidades

- Predicción de acciones robóticas: genera secuencias de 50 acciones absolutas de 14 dimensiones a partir de observaciones (estado articular + tres imágenes RGB).
- Planificación de subtareas en lenguaje natural: el método `select_message` produce una subtarea textual (hasta 48 tokens) que guía la ejecución.
- Procesamiento multimodal: integra tres cámaras (alta, muñeca izquierda, muñeca derecha) con formato RGB float32 en rango [0, 1].
- Control de robots manipulativos: el vector de estado de 14 dimensiones sugiere un robot de doble brazo o con múltiples articulaciones.
- Soporte de instrucciones de tarea: acepta un texto de tarea (`task`) y un subtask opcional para condicionar la predicción.
- Tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: limitadas a la generación de subtareas y acciones; no se documenta razonamiento multi-paso general.
- Capacidades multilingües: solo inglés (según la model card).

## Casos de uso

- Manipulación robótica de precisión: el modelo predice acciones absolutas de 14 dimensiones a partir de imágenes de muñeca y cámara alta, adecuado para tareas de ensamblaje o colocación de objetos en entornos controlados.
- Investigación en VLAs: sirve como punto de partida para experimentar con adaptadores LoRA sobre modelos base de LeRobot, permitiendo ajustes con pocos recursos.
- Planificación jerárquica de tareas: el planner integrado genera subtareas en lenguaje natural que pueden ser auditadas o modificadas antes de la ejecución de bajo nivel.
- Prototipado de políticas de robot en simulación o laboratorio: el adaptador se puede cargar con el loader incluido y evaluar con el mismo pipeline de LeRobot.
- Educación y demostraciones: al ser un adaptador pequeño (repo de 0.0 GB), es fácil de distribuir y probar en entornos docentes con GPUs consumer.
- Integración en pipelines de LeRobot: el modelo se puede combinar con los procesadores y tokenizadores originales para normalización de imágenes y estados, facilitando su uso en flujos existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un adaptador LoRA, requiere cargar el modelo base completo; el consumo dependerá del tamaño del base (no especificado).
- GPU recomendadas: no disponible. Se recomienda una GPU con soporte CUDA y suficiente memoria para el modelo base; el loader se probó con CUDA.
- ¿Cabe en consumer GPU?: no disponible. Depende del tamaño del modelo base y de la cuantización aplicada.
- Opciones de despliegue: LeRobot con soporte `fineart_vla` y `peft`, Transformers 5.5.4, PEFT 0.21.2. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vla_ma (adaptador LoRA) | no disponible | no disponible | gemma | Hugging Face, repo 0.0 GB |
| FineART-VLA-subtask-midtrained (base) | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |
| Otros VLAs de LeRobot | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (VLAs robóticos con adaptadores LoRA). Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset de robótica no especificado, puede heredar sesgos de las demostraciones.
- Riesgo de alucinación: el planner puede generar subtareas incoherentes o no ejecutables; se recomienda validación humana o filtros.
- Limitaciones de contexto o idioma: solo inglés; no se especifica la longitud de contexto del modelo base.
- Restricciones de licencia: licencia Gemma heredada del modelo base; el uso comercial está sujeto a los términos de Gemma, que incluyen restricciones de uso aceptable. Consultar `LICENSE` y `NOTICE`.
- Caveat para producción: el adaptador requiere el checkpoint base exacto (`b6cf4faf...`) y versiones específicas de LeRobot, Transformers y PEFT; la incompatibilidad de versiones puede romper la carga.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- No se documentan métricas de éxito en tareas reales ni robustness ante cambios de iluminación o posición de cámara.

## Enlaces

- Hugging Face: https://huggingface.co/pmolodyk/vla_ma
- Modelo base: https://huggingface.co/lerobot/FineART-VLA-subtask-midtrained
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Commit de LeRobot usado: https://github.com/huggingface/lerobot/commit/72e1d9e5e76ee719bacfc78bc34d817bee5fb521
- PEFT: https://github.com/huggingface/peft
- Transformers: https://github.com/huggingface/transformers
