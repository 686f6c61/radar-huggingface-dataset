# danyalmalik/NVIDIA-Nemotron-3-Nano-30B-A3B-ONNX-WebGPU

## Resumen

Este repositorio no es un modelo original de NVIDIA, sino una conversion a ONNX del modelo `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, publicada por el usuario danyalmalik. El objetivo es permitir la ejecucion del modelo directamente en un navegador web mediante el backend WebGPU de ONNX Runtime Web, en el formato empleado por la herramienta Quick Inference. El repositorio ocupa 25,2 GB y esta marcado con la etiqueta `custom_code`, lo que implica que requiere codigo especifico para su carga.

El modelo base pertenece a la familia Nemotron-3 Nano de NVIDIA y, segun su denominacion `30B-A3B`, se trata de un modelo de mezcla de expertos (MoE) con aproximadamente 30.000 millones de parametros totales y unos 3.000 millones de parametros activos por token. La arquitectura es hibrida del tipo Nemotron-H: combina bloques Mamba-2, bloques de atencion y bloques de expertos, una configuracion que busca equilibrio entre calidad y coste de inferencia.

La relevancia de esta ficha radica en que representa una via poco habitual de despliegue: inferencia en cliente (navegador) de un modelo MoE de gran tamano mediante cuantizacion agresiva a 4 bits y WebGPU. No hay datos publicados de idiomas soportados, longitud de contexto ni benchmarks en la informacion disponible, por lo que las evaluaciones cuantitativas quedan pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida tipo Nemotron-H: bloques Mamba-2, bloques de atencion y bloques de expertos (MoE) |
| Parametros totales | ~30.000 millones (segun la denominacion `30B`; no confirmado en la documentacion) |
| Parametros activos | ~3.000 millones (segun la denominacion `A3B`; no confirmado en la documentacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Capas lineales a int4 (round to nearest, tamano de bloque 32); expertos enrutados a int4 (tamano de bloque 64); embeddings, activaciones y cache KV en float16 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | ONNX (layout de decodificador de ONNX Runtime GenAI) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido con mezcla de expertos. Segun la model card de la conversion, la arquitectura combina tres tipos de bloques: los bloques Mamba-2 se representan como `CausalConvWithState` mas `LinearAttention` (regla con puerta, estado en float32); los bloques de atencion se convierten a `GroupQueryAttention`; y los bloques de expertos se convierten a `QMoE`. Esta mezcla de mecanismos de estado recurrente (Mamba-2) con atencion tradicional y capas de expertos es caracteristica de la familia Nemotron-H.

Una innovacion tecnica destacable de la conversion es como se reproduce la activacion de los expertos. El modelo original emplea una ReLU al cuadrado (`ReLU(u)^2`), y el exportador la implementa usando el SwiGLU fusionado que ofrece QMoE: la proyeccion `up` de cada experto se almacena dos veces (como las mitades `gate` y `up`) con un valor alto de `alpha` en SwiGLU, de forma que se obtiene la identidad `ReLU(u)·u = ReLU(u)^2`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la documentacion proporcionada solo describe el proceso de conversion.

## Capacidades

- Generacion de texto: el modelo base es un modelo de lenguaje generativo; la conversion preserva el decodificador para inferencia autorregresiva.
- Razonamiento y capacidad general: no hay datos de benchmarks que permitan cuantificar estas capacidades en esta version.
- Codigo y matematicas: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Inferencia en navegador: capacidad especifica de esta conversion, al ejecutarse con el backend WebGPU de ONNX Runtime Web.

## Casos de uso

- Inferencia en navegador del lado del cliente: el modelo se puede ejecutar dentro de una pagina web mediante ONNX Runtime Web con WebGPU, lo que permite procesar texto sin enviar los datos a un servidor y sin coste de API por inferencia.
- Aplicaciones de privacidad estricta: al correr en el dispositivo del usuario, los prompts y las respuestas no salen del navegador, un escenario adecuado para textos sensibles donde no se admite enviar datos a terceros.
- Demos y evaluaciones sin infraestructura propia: permite distribuir una demo funcional de un MoE de ~30B a traves de una web, sin necesidad de aprovisionar GPUs en servidor.
- Prototipado de producto en cliente: util para validar experiencias de generacion de texto antes de decidir si se migra a despliegue en servidor (vLLM, TGI u otros).
- Asistentes embebidos en herramientas web: integracion en editores o aplicaciones basadas en navegador donde el modelo asiste en tareas de redaccion o resumen de texto.
- Educacion y experimentacion: dado que el formato es ONNX con `custom_code`, sirve como material para estudiar la conversion de arquitecturas hibridas Mamba-2/atencion/MoE a ONNX y su cuantizacion a 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~30.000 millones de parametros en int4 a 4 bits ocupa en torno a 15 GB solo en pesos; el repositorio completo ocupa 25,2 GB, ya que embeddings, activaciones y cache KV se mantienen en float16. Cualquier cifra concreta depende de cuanta parte del modelo se descargue a GPU.
- GPU recomendadas: no disponibles. El diseno apunta a ejecucion en navegador mediante WebGPU, por lo que el rendimiento dependera de la GPU del cliente.
- Compatibilidad con GPU de consumo: no confirmada. La cantidad de VRAM necesaria (del orden de 15 GB o mas para los pesos int4) excluye muchas GPUs de consumo con 8-12 GB, pero no se dispone de una lista oficial de GPUs soportadas.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU (entorno previsto por el autor) y, potencialmente, ONNX Runtime nativo dada la conversion al layout de ONNX Runtime GenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| danyalmalik/NVIDIA-Nemotron-3-Nano-30B-A3B-ONNX-WebGPU | ~30B totales / ~3B activos | no disponible | int4 (lineales y expertos) + fp16 | NVIDIA Nemotron Open Model License | ONNX |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (modelo base) | ~30B totales / ~3B activos | no disponible | BF16 | NVIDIA Nemotron Open Model License | safetensors (no confirmado) |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoria (por ejemplo, otros MoE de ~30B con ~3B activos) en cuanto a contexto, rendimiento o disponibilidad. En la informacion proporcionada no aparecen cifras de otros modelos.

## Limitaciones y advertencias

- Salidas no identicas al original: la model card indica explicitamente que estos son archivos modificados y que sus salidas son cercanas, pero no identicas, a las del modelo original. Esto es relevante si se busca reproducibilidad exacta.
- Requiere `custom_code`: el repositorio esta etiquetado con `custom_code`, por lo que la carga no es posible solo con el pipeline estandar; hace falta el codigo/exportador adecuado (Quick Inference / ONNX Runtime GenAI).
- Idiomas y contexto no documentados: no se especifica que idiomas soporta ni cual es su longitud de contexto, lo que dificulta planificar su uso en produccion.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares para esta version cuantizada, por lo que no se puede estimar la degradacion frente al modelo BF16 original.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos de lenguaje generativos.
- Restricciones de licencia: se aplica la NVIDIA Nemotron Open Model License, que no es una licencia de codigo abierto estandar; conviene revisar sus terminos antes de cualquier uso comercial.
- Repositorio con 0 descargas y 0 likes: comunidad practicamente nula, sin validacion externa ni issues reportados.
- Compatibilidad WebGPU dependiente del cliente: el rendimiento y la compatibilidad dependen del navegador y de la GPU del usuario final.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/danyalmalik/NVIDIA-Nemotron-3-Nano-30B-A3B-ONNX-WebGPU
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/

Nota: la busqueda web asociada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a herramientas de eliminacion de fondos de imagen y no guardan relacion con el modelo, por lo que se han omitido.
