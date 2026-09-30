# Redtash1/Qwen3-4B-INT8

## Resumen

Redtash1/Qwen3-4B-INT8 es un checkpoint cuantizado a INT8 del modelo denso Qwen/Qwen3-4B, publicado por el usuario Redtash1 bajo licencia Apache 2.0. No se trata de un modelo nuevo ni de un fine-tune: es una conversion de los pesos originales a cuantizacion persistente qint8 mediante Optimum-Quanto, manteniendo las activaciones en BF16. El repositorio contiene 4.412.682.112 parametros y ocupa aproximadamente 4,8 GB.

La relevancia practica del checkpoint esta en el ahorro de memoria: el autor reporta una asignacion CUDA de unos 4,50 GiB tras la transferencia a GPU, con un pico reservado de PyTorch de aproximadamente 5,33 GiB, lo que permite ejecutar un modelo de 4B en tarjetas consumer de gama media-alta. La validacion se realizo en una NVIDIA RTX 4060 Ti de 16 GB.

El punto critico es la compatibilidad: al ser un checkpoint persistente de Optimum-Quanto con cuantizacion tambien de lm_head, no es cargable con AutoModelForCausalLM generico, vLLM, SGLang, AWQ, GPTQ, GGUF ni TorchAO salvo que la herramienta declare soporte explicito. El autor documenta el metodo de carga probado con QuantizedModelForCausalLM y una transferencia explicita a CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura heredada del modelo base Qwen/Qwen3-4B); checkpoint cuantizado, no reentrenado |
| Parametros totales | 4.412.682.112 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se declara en la model card) |
| Tipos de cuantizacion | INT8 persistente de Optimum-Quanto (qint8) con activaciones BF16; todas las capas Linear cuantizadas, incluida lm_head. No hay GGUF, AWQ, GPTQ ni TorchAO en el repositorio |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen3-4B se describe en fuentes externas como multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con envoltorio persistente de Optimum-Quanto; requiere optimum.quanto.QuantizedModelForCausalLM para cargar |
| Tamano del repositorio | aproximadamente 4,8 GB (4,484 GiB segun la model card) |
| Tokens especiales | PAD 151643; EOS [151645, 151643]; BOS 151643 |
| Libreria declarada | optimum-quanto |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Este repositorio no introduce cambios de arquitectura ni un proceso de entrenamiento propio: parte de Qwen/Qwen3-4B, un transformer denso de aproximadamente 4,4 mil millones de parametros, y sustituye la representacion de los pesos por qint8 persistente de Optimum-Quanto. Las activaciones se mantienen en BF16, y la cuantizacion alcanza a todas las capas Linear, incluyendo lm_head, un detalle que condiciona la compatibilidad con runtimes de inferencia de terceros.

No se documento en la informacion disponible ningun ajuste adicional por RLHF, DPO u otro metodo: la model card describe exclusivamente el procedimiento de cuantizacion y validacion. Entre los detalles verificados por el autor figuran la recarga mediante QuantizedModelForCausalLM.from_pretrained, la transferencia explicita a CUDA, la persistencia de los tipos QLinear y WeightQBytesTensor en una proyeccion interna y en lm_head, la generacion de texto en CUDA y la equivalencia del tokenizer con el del Qwen3-4B original, ademas de la ausencia de los avisos previos de regex de tokenizer y de fallback de pad token.

El autor advierte de que device_map="cuda" por si solo no movia de forma fiable el envoltorio persistente de Quanto a la GPU, por lo que recomienda el uso explicito de model.to("cuda"). Tambien senala que si TorchAO esta instalado en el mismo entorno pueden aparecer mensajes de deprecacion sobre KernelPreference, ScaleCalculationMode o register_constant() que no provienen de este checkpoint y no indican un fallo de carga.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es text-generation y la model card incluye un ejemplo de generacion conversacional con apply_chat_template.
- Modo thinking: la plantilla de chat acepta el parametro enable_thinking, lo que refleja la herencia del comportamiento de razonamiento de la familia Qwen3, aunque el ejemplo del autor lo desactiva.
- Comprension y generacion multilingue: no declarada en la model card; en fuentes externas el modelo base Qwen3-4B se presenta como multilingue.
- Codigo y matematicas: atribuidos al modelo base Qwen3-4B en la documentacion externa consultada (Qualcomm AI Hub), no verificados especificamente sobre este checkpoint cuantizado.
- Tool calling y function calling: no disponible en la informacion proporcionada para este checkpoint.
- Comportamiento agentico y razonamiento multi-paso: no disponible en la informacion proporcionada para este checkpoint.
- Inferencia en GPU consumer: capacidad practica validada por el autor en una RTX 4060 Ti de 16 GB con unos 5,24 GiB de pico asignado.
- Capacidades multimodales (vision, audio): no disponibles; el modelo base es exclusivamente de texto.

## Casos de uso

- Despliegue de un LLM de 4B en GPU consumer: el checkpoint ocupa unos 4,50 GiB de memoria CUDA tras la carga, por lo que encaja en tarjetas de 8-16 GB de VRAM. Adecuado para prototipos locales y estaciones de trabajo con una sola GPU.
- Generacion de texto conversacional en local: con el tokenizer del modelo base y apply_chat_template se pueden construir asistentes de chat que se ejecutan sin conexion, utiles en entornos con requisitos de privacidad de datos.
- Reduccion del coste de memoria frente a BF16: al almacenar pesos en int8 con activaciones BF16, el repositorio pesa 4,8 GB en disco, lo que simplifica la distribucion y el cacheado en nodos de inferencia con almacenamiento limitado.
- Experimentacion y evaluacion de cuantizacion: sirve como referencia para comparar la degradacion de calidad y el ahorro de memoria de qint8 persistente de Optimum-Quanto frente a BF16, AWQ, GPTQ o GGUF sobre el mismo modelo base.
- Pipelines de investigacion con Transformers: al integrarse con QuantizedModelForCausalLM y el ecosistema Hugging Face, se puede insertar en scripts de evaluacion, ablaciones o generacion por lotes sin reescribir el codigo de tokenizacion.
- Tareas de razonamiento con activacion del modo thinking: la plantilla de chat admite enable_thinking, de modo que el modelo puede emplearse en escenarios que requieren trazas de razonamiento intermedias antes de la respuesta final.
- Escenarios educativos y de demostracion: un modelo de 4B en int8 es viable en equipos de estudiantes o laboratorios docentes con una GPU de gama media, sin necesidad de infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni comparativas de calidad frente a BF16, AWQ, GPTQ o GGUF).

Los unicos datos numericos publicados por el autor corresponden a la validacion de memoria, no a la calidad del modelo:

| Metrica de validacion | Valor reportado |
|---|---|
| Asignacion CUDA tras la transferencia | aproximadamente 4,50 GiB |
| Pico asignado por PyTorch | aproximadamente 5,24 GiB |
| Pico reservado por PyTorch | aproximadamente 5,33 GiB |
| Pico observado en el Administrador de tareas de Windows | aproximadamente 6,5 GB |
| Tamano del repositorio | aproximadamente 4.484 GiB |

El autor advierte de que el consumo real varia con la longitud del prompt, la longitud de salida, el estado del allocator y las versiones de CUDA y PyTorch.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 4,50 GiB de asignacion CUDA y 5,24 GiB de pico asignado en la validacion del autor, con aproximadamente 6,5 GB de pico observado a nivel de sistema en Windows.
- GPU recomendadas: NVIDIA RTX 4060 Ti 16 GB (entorno validado por el autor). Cualquier GPU CUDA con al menos 8 GB de VRAM deberia ser suficiente para el rango de memoria reportado, aunque no se ha validado en la informacion disponible.
- Cabe en GPU consumer: si, segun los datos de memoria publicados; el caso validado es una RTX 4060 Ti de 16 GB.
- Opciones de despliegue: Optimum-Quanto con QuantizedModelForCausalLM.from_pretrained (metodo probado). No se debe asumir compatibilidad con vLLM, SGLang, AWQ, GPTQ, GGUF, TorchAO ni AutoModelForCausalLM generico salvo que la herramienta declare soporte explicito de checkpoints persistentes de Optimum-Quanto.
- Transferencia a GPU: se recomienda model.to("cuda") explicito en lugar de confiar en device_map="cuda".
- Entorno probado: Python 3.12.10, PyTorch 2.12.0+cu130, Transformers 5.17.0, Optimum-Quanto, safetensors y huggingface_hub.
- Dependencias mínimas: pip install "transformers>=5.17.0" optimum-quanto safetensors huggingface_hub; PyTorch se instala por separado segun el entorno CUDA/CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Redtash1/Qwen3-4B-INT8 | 4.412.682.112 | INT8 qint8 persistente de Optimum-Quanto, activaciones BF16, lm_head incluido | no disponible | Apache 2.0 | Validado en RTX 4060 Ti 16 GB; requiere QuantizedModelForCausalLM |
| Qwen/Qwen3-4B (modelo base) | aproximadamente 4B (no confirmado en la informacion) | BF16 | no disponible | Apache 2.0 | Referencia sin cuantizar; menor eficiencia de memoria |
| vistralis/Qwen3-4B-INT8 | no disponible | W8A8 (pesos y activaciones int8), todas las capas Linear excepto lm_head | no disponible | no disponible en la busqueda | Orientado a codificador de texto para pipelines de generacion de imagen Flux 2 Klein 4B |
| zhiqing/Qwen3-4B-INT8 | no disponible | INT8 | no disponible | no disponible en la busqueda | Repositorio sin detalles publicados en los resultados consultados |
| Variantes GGUF/AWQ/GPTQ del Qwen3-4B | aproximadamente 4B | GGUF, AWQ o GPTQ segun el caso | no disponible | habitualmente Apache 2.0 | No compatibles con este checkpoint: son formatos distintos de cuantizacion |

La informacion disponible no incluye comparativas de calidad, latencia ni throughput entre estas alternativas.

## Limitaciones y advertencias

- Compatibilidad restringida: es un checkpoint persistente de Optimum-Quanto y no funciona con vLLM, SGLang, AWQ, GPTQ, GGUF, TorchAO ni rutas genericas de AutoModelForCausalLM sin soporte explicito. Esto limita mucho las opciones de servido en produccion.
- La cuantizacion incluye lm_head, lo que puede complicar la integracion con runtimes que asumen esa capa en precision completa.
- Ausencia de benchmarks de calidad: no hay datos publicados que cuantifiquen la perdida de precision frente al modelo BF16 original en tareas de razonamiento, codigo o matematicas.
- Riesgo de alucinacion: inherente al modelo base; no se ha evaluado ni mitigado especificamente en este checkpoint.
- Sesgos: no documentados en la informacion disponible; el checkpoint hereda los del modelo base Qwen3-4B.
- Idiomas: la model card no declara idiomas soportados, por lo que no se puede garantizar el comportamiento multilingue sin evaluacion propia.
- Longitud de contexto: no declarada en la model card; conviene verificarla experimentalmente antes de usarla en tareas de contexto largo.
- Entorno de validacion muy concreto: Python 3.12.10, PyTorch 2.12.0+cu130 y Transformers 5.17.0 sobre RTX 4060 Ti. Otros entornos pueden requerir ajustes.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor no reclama autoria del modelo original y remite a Qwen/Qwen3-4B como fuente.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- Advertencia sobre TorchAO: los mensajes de deprecacion de TorchAO en el mismo entorno no provienen de este checkpoint, pero pueden confundir el diagnostico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Redtash1/Qwen3-4B-INT8
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- vistralis/Qwen3-4B-INT8 (variante W8A8 para Flux 2 Klein 4B): https://huggingface.co/vistralis/Qwen3-4B-INT8
- zhiqing/Qwen3-4B-INT8: https://huggingface.co/zhiqing/Qwen3-4B-INT8
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Guia de la familia Qwen 3 (0.6B a 72B): https://baeseokjae.github.io/posts/qwen-3-full-lineup-guide-2026/
- Uncensored Qwen3 4B para Z-Image y Flux4B (INT8_Convrot): https://civitai.com/models/2373678/uncensored-qwen3-4b-llm-for-z-image-and-flux4b
