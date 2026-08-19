# OpenVINO/Qwen3.8-27B-int8-ov

## Resumen

El modelo OpenVINO/Qwen3.8-27B-int8-ov es una conversión del modelo Qwen3.8-27B de Alibaba al formato OpenVINO IR, con los pesos comprimidos a INT8 mediante la herramienta NNCF de OpenVINO. El modelo original es un modelo de visión-lenguaje nativo que comprende imágenes y vídeo, ofrece control flexible del razonamiento y soporta tareas complejas de varios pasos. Esta conversión permite ejecutar el modelo en hardware Intel (CPU, GPU, NPU) utilizando el runtime de OpenVINO, lo que facilita el despliegue en entornos de producción con requisitos de latencia y eficiencia.

La relevancia de esta versión radica en que reduce el tamaño del modelo original (27B parámetros) mediante cuantización INT8, manteniendo un equilibrio entre precisión y consumo de recursos. El repositorio ocupa 27,4 GB, lo que sugiere que puede ejecutarse en GPUs con al menos 32 GB de VRAM o en CPU con suficiente memoria RAM. Sin embargo, el modelo está marcado como experimental: requiere versiones nightly de OpenVINO, Optimum Intel y Transformers 5.2, por lo que no se recomienda para uso en producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vision-lenguaje, probablemente transformer multimodal) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (modo INT8_ASYM, ratio 1.0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (ficheros .bin y .xml) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo no se detalla en la informacion disponible. Se sabe que Qwen3.8-27B es un modelo de vision-lenguaje nativo, lo que implica una arquitectura multimodal que combina un codificador visual con un modelo de lenguaje basado en transformer. El modelo original fue desarrollado por Qwen (Alibaba) y soporta comprension de imagenes y video, control flexible del modo de pensamiento (thinking mode) y tareas complejas de razonamiento multi-paso.

El proceso de entrenamiento del modelo original no se describe en la model card de esta conversion. La unica informacion sobre el proceso de cuantizacion indica que se utilizo `nncf.compress_weights` con modo INT8_ASYM y ratio 1.0, es decir, todos los pesos se comprimieron a INT8. No se mencionan datos sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Comprension de imagenes: puede describir el contenido de una imagen, responder preguntas sobre ella y realizar tareas de razonamiento visual.
- Comprension de video: el modelo original soporta entrada de video, aunque no se especifica en esta conversion si el formato OpenVINO mantiene esa capacidad.
- Control flexible de pensamiento: permite activar o desactivar un modo de razonamiento profundo (thinking mode) segun la tarea.
- Tareas multi-paso: capaz de resolver problemas que requieren varios pasos de razonamiento, como planificacion o deduccion logica.
- Conversacion multimodal: admite dialogos en los que se intercalan imagenes y texto, como se muestra en el ejemplo de inferencia de la model card.
- Integracion con OpenVINO: al estar en formato IR, puede ejecutarse en CPU, GPU y NPU de Intel con el runtime de OpenVINO GenAI o mediante Optimum Intel.

## Casos de uso

- Asistente visual para documentacion tecnica: un desarrollador puede subir una captura de pantalla de un error y el modelo explica el problema y sugiere soluciones, gracias a su capacidad de razonamiento visual y multi-paso.
- Analisis de imagenes medicas (investigacion): el modelo puede describir hallazgos en radiografias o ecografias, aunque requiere validacion por personal cualificado y no debe usarse como diagnostico.
- Moderacion de contenido visual: clasificar imagenes o videos para detectar contenido inapropiado, usando el pipeline image-text-to-text para generar descripciones y evaluarlas.
- Chatbot de atencion al cliente con soporte visual: un usuario envia una foto de un producto defectuoso y el asistente identifica el problema y ofrece pasos de devolucion, aprovechando el contexto multimodal.
- Generacion de descripciones accesibles: crear textos alternativos (alt text) para imagenes en sitios web o documentos, mejorando la accesibilidad.
- Prototipado rapido de aplicaciones de vision por computador: los investigadores pueden probar el modelo en CPU con OpenVINO sin necesidad de GPUs dedicadas, gracias a la cuantizacion INT8 y el soporte de OpenVINO GenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se proporcionan datos de latencia o throughput para la version cuantizada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 27,4 GB, por lo que se estima que la inferencia requiere al menos 28-32 GB de memoria (VRAM o RAM) para cargar los pesos y los buffers de activacion. No se dispone de datos exactos.
- GPU recomendadas: para ejecucion en GPU, se necesitarian tarjetas con 32 GB o mas, como A100 40GB, A6000 48GB o H100 80GB. Una RTX 4090 (24 GB) probablemente no sea suficiente.
- CPU: la model card muestra ejemplos de inferencia en CPU con OpenVINO GenAI, por lo que es viable en CPUs modernas con suficiente RAM (64 GB o mas recomendado).
- Opciones de despliegue: OpenVINO GenAI (VLMPipeline), Optimum Intel con Transformers 5.2, y posiblemente otros frameworks compatibles con OpenVINO IR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | no disponible | FP16/BF16 | Apache 2.0 | safetensors |
| OpenVINO/Qwen3.8-27B-int8-ov | 27B | no disponible | INT8 | Apache 2.0 | OpenVINO IR |
| Otros modelos VLM de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original y su version cuantizada, ya que no se dispone de informacion sobre alternativas equivalentes en el mercado. La principal diferencia es el formato de pesos y la cuantizacion, que reduce el tamano y permite ejecucion en hardware Intel.

## Limitaciones y advertencias

- Modelo experimental: la model card indica explicitamente que no ha sido completamente validado con OpenVINO y requiere versiones de desarrollo (nightly) de Optimum Intel, OpenVINO y Transformers 5.2. No es apto para entornos de produccion estables.
- Compatibilidad restringida: solo funciona con OpenVINO 2026.4.0 (nightly) o superior, y con builds nightly de OpenVINO GenAI posteriores al 14 de agosto de 2026.
- Sesgos y alucinaciones: no se han documentado en esta conversion, pero el modelo original puede presentar sesgos derivados de sus datos de entrenamiento y riesgo de alucinacion en tareas visuales complejas. Se recomienda revisar la model card original.
- Limitaciones de idioma: no se especifican los idiomas soportados, aunque Qwen suele tener buen rendimiento en chino e ingles. No se garantiza cobertura multilingue amplia.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo original puede tener condiciones adicionales (no se detallan aqui).
- Requisitos de hardware elevados: a pesar de la cuantizacion INT8, el modelo sigue siendo grande (27,4 GB) y puede no caber en GPUs de consumo comunes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenVINO/Qwen3.8-27B-int8-ov
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de optimizacion de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/weight-compression.html
- Documentacion de Optimum Intel: https://huggingface.co/docs/optimum-intel/openvino/inference
- Documentacion de OpenVINO GenAI: https://openvinotoolkit.github.io/openvino.genai/
- Notebook de Qwen3-VL: https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/qwen3-vl
- Notebook de chatbot visual: https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/vlm-chatbot
