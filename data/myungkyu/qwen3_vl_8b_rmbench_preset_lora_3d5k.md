# Myungkyu/qwen3_vl_8b_rmbench_preset_lora_3d5k

## Resumen

`Myungkyu/qwen3_vl_8b_rmbench_preset_lora_3d5k` es un modelo afinado con LoRA sobre `Qwen/Qwen3-VL-8B-Instruct` para actuar como planificador de alto nivel en RMBench, un entorno de evaluacion con 9 tareas simuladas de manipulacion en mesa. El autor publica el checkpoint fusionado en el paso 3500 de un ajuste que utiliza el dataset `Myungkyu/RMBench-preset-gemini`, compuesto por demostraciones de RMBench con etiquetas densas de subtareas.

La arquitectura de partida es un modelo vision-language multimodal de 8.767.123.696 parametros en formato safetensors. La funcion principal es convertir cuatro fotogramas recientes de una camara frontal, un objetivo de tarea y un texto de memoria de objetos manipulados en una salida JSON estructurada que contiene la subtarea actual, la memoria actualizada, un flag de keyframe con su caption y una consulta de recuperacion.

Este modelo esta pensado como pieza de planificacion cognitiva en robots que operan sobre mesas simuladas; no es un modelo generico de chat ni una VLA completa de bajo nivel. Su relevancia radica en que demuestra como adaptar un VLM de proposito general con un solo dataset especializado para generar decisiones estructuradas en tareas roboticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer, derivada de `Qwen/Qwen3-VL-8B-Instruct` |
| Parametros totales | 8.767.123.696 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (pesos fusionados del checkpoint LoRA 3500) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de tipo LoRA sobre `Qwen/Qwen3-VL-8B-Instruct`, el modelo base de Qwen3-VL de 8.000 millones de parametros. El entrenamiento se realizo con Unsloth FastVisionModel, con r=32, alpha=64 y dropout=0. Los pesos LoRA se fusionaron con el modelo base y se publica exclusivamente el checkpoint del paso 3500.

El dataset de entrenamiento es `Myungkyu/RMBench-preset-gemini`, que contiene demostraciones de RMBench anotadas con subtareas del preset. El contrato de salida es una planificacion de alto nivel: a partir de 4 frames consecutivos de la camara frontal, el objetivo de la tarea y el texto de memoria, el modelo debe predecir un JSON con la subtarea actual, la memoria actualizada, un flag de keyframe con su caption y una consulta de recuperacion. No se aportan detalles sobre la composicion del dataset, numero de tokens ni fases de RLHF o DPO.

## Capacidades

- Planificacion de alto nivel para RMBench, con cobertura de 9 tareas simuladas de mesa.
- Percepcion visual multimodal: procesa secuencias de frames de camara frontal.
- Memoria de trabajo textual: genera y actualiza un estado de objetos manipulados entre pasos.
- Salida estructurada en JSON con subtarea, memoria, keyframe flag, caption y query de recuperacion.
- Seleccion de momentos relevantes mediante el flag de keyframe, utilizable para construccion de indices visuales.
- No incluye soporte documentado de tool calling, function calling o agentes genericos; la interfaz es un contrato JSON especifico.

## Casos de uso

- Planificacion de tareas roboticas en simulacion: el modelo se integra en un bucle de control que le pasa frames y objetivo, y la salida JSON permite decidir la siguiente subtarea a ejecutar.
- Generacion de keyframes para recuperacion visual: el flag de keyframe y el caption pueden alimentar indices de escenas relevantes en sistemas de navegacion o memoria episodica.
- Seguimiento de estado en episodios largos: el texto de memoria actualizado permite mantener el contexto de objetos manipulados sin volver a procesar toda la historia.
- Guia para politicas de bajo nivel: las subtareas predichas pueden usarse como supervision o como espacio de acciones discretas para entrenar controladores motores.
- Evaluacion de planificadores VLA en RMBench: el modelo sirve como baseline de alto nivel para comparar variantes de planificacion sobre el mismo entorno.
- Analisis post-hoc de ejecuciones roboticas: la consulta de recuperacion permite buscar demonstrations o clips que correspondan a una subtarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no aporta metricas de MMLU, HumanEval, GSM8K ni de tareas de RMBench, por lo que no es posible contrastar su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso en safetensors ocupa 17,5 GB, lo que supone al menos 18-20 GB de VRAM en precision original para cargar el modelo y sus activaciones; para un margen razonable se recomiendan 24 GB o mas.
- GPU recomendadas: NVIDIA RTX 4090 24 GB, A100 40/80 GB o H100 80 GB.
- Consumo en consumer GPU: puede ejecutarse en una RTX 4090 24 GB sin cuantizacion, con precaucion sobre el tamano del contexto. No cabe en GPUs de 16 GB sin offloading o conversion de pesos.
- Opciones de despliegue: al usar safetensors y la libreria `transformers`, puede servirse con vLLM, TGI o un pipeline de HuggingFace Transformers. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son aplicables sin conversion previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Solo se ha identificado una comparativa directa en la informacion disponible: el modelo base `Qwen/Qwen3-VL-8B-Instruct`. No se han encontrado alternativas publicadas de la misma tarea en los resultados de busqueda.

| Modelo | Parametros | Contexto | Licencia | Tarea principal |
|---|---|---|---|---|
| Este modelo | 8.767.123.696 | No disponible | No disponible | Planificador alto nivel RMBench |
| Qwen/Qwen3-VL-8B-Instruct | 8.767.123.696 | No disponible | No disponible | Vision-language generalista |

## Limitaciones y advertencias

- El modelo esta limitado a 9 tareas simuladas de mesa de RMBench; su generalizacion a entornos reales o a otras tareas no esta demostrada.
- Hereda las limitaciones del dataset `RMBench-preset-gemini`, que puede contener sesgos de las demostraciones y de las etiquetas del preset.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de rendimiento antes de usar el modelo en produccion.
- La licencia no esta disponible en la ficha de HuggingFace; es necesario verificar si permite uso comercial antes de desplegarlo.
- No se documentan idiomas soportados ni la longitud de contexto efectiva para este checkpoint concreto, aunque el modelo base es multimodal.
- No se publican variantes cuantizadas ni GGUF, lo que dificulta su ejecucion en hardware limitado o mediante herramientas como llama.cpp.

## Enlaces

- https://huggingface.co/Myungkyu/qwen3_vl_8b_rmbench_preset_lora_3d5k
- https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- https://huggingface.co/datasets/Myungkyu/RMBench-preset-gemini
- https://github.com/QwenLM/Qwen3-VL
- https://github.com/QwenLM/Qwen-VL
