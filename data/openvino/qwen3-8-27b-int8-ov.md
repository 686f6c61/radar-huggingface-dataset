# OpenVINO/Qwen3.8-27B-int8-ov

## Resumen

OpenVINO/Qwen3.8-27B-int8-ov es la conversión al formato OpenVINO IR del modelo Qwen3.8-27B, desarrollado originalmente por el equipo Qwen de Alibaba. Se trata de una versión cuantizada a INT8 mediante NNCF (Neural Network Compression Framework) que mantiene las capacidades del modelo original: comprensión conjunta de imagen, vídeo y texto, control flexible del razonamiento y ejecución de tareas complejas de múltiples pasos. El paquete incluye además un modelo auxiliar de predicción multi-token (MTP) para decodificación especulativa.

La relevancia de esta ficha radica en que permite desplegar un modelo visión-lenguaje de 27.000 millones de parámetros en infraestructura Intel (CPU, iGPU, NPU o GPU Arc) sin necesidad de GPUs de datacenter, gracias a la compresión INT8 y al runtime OpenVINO. Esto abre el uso de un VLM de gran tamaño en entornos de borde, estaciones de trabajo y servidores con aceleradores Intel.

El modelo se distribuye con licencia Apache 2.0 y está pensado para su uso mediante OpenVINO GenAI, Optimum Intel u OpenVINO Model Server (OVMS), este último con soporte de API compatible con OpenAI. La información pública disponible no detalla la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (modelo base Qwen3.8-27B); representación OpenVINO IR con compresión de pesos INT8 |
| Parametros totales | 27 000 millones (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 asimétrico (INT8_ASYM, ratio 1.0) mediante `nncf.compress_weights` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`), con `openvino_mtp_model.xml` para decodificación especulativa MTP |
| Tamaño del repositorio | 27,8 GB |
| Librería | openvino |
| Pipeline | image-text-to-text |
| Compatibilidad | OpenVINO ≥ 2026.4.0, OpenVINO GenAI ≥ 2026.4.0.0, Transformers 5.2.0, Optimum Intel (última versión de desarrollo) |
| Descargas / likes | 1636 / 4 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer nativo visión-lenguaje que procesa imágenes, vídeo y texto en una única pila, con control flexible del modo de razonamiento (thinking). La versión publicada por OpenVINO no reentrena el modelo: aplica compresión de pesos INT8 asimétrica con ratio 1.0 sobre todos los pesos lineales mediante NNCF, y exporta el grafo a OpenVINO IR. El repositorio incluye además un modelo MTP separado (`openvino_mtp_model.xml`) que actúa como modelo borrador para decodificación especulativa, acelerando la generación al proponer varios tokens por paso y validarlos con el modelo principal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original. La innovación técnica destacable de esta distribución es doble: la compresión INT8 que reduce el peso a 27,8 GB y el soporte integrado de decodificación especulativa MTP en OpenVINO GenAI, aunque esta última solo está soportada actualmente con decodificación greedy y caché de prefijos desactivada.

## Capacidades

- Generación de texto y razonamiento multimodal: comprende imágenes y vídeo junto con instrucciones textuales y produce respuestas descriptivas, analíticas o conversacionales.
- Control flexible del razonamiento (thinking): el modelo base permite activar o desactivar el modo de razonamiento según la tarea.
- Tareas de múltiples pasos: el modelo base está descrito como apto para tareas complejas de varios pasos.
- Conversación multi-turno: pipeline conversacional con plantilla de chat aplicada mediante el procesador.
- Comprensión de imagen: descripción, respuesta a preguntas visuales y análisis de diagramas (el ejemplo de la model card usa un diagrama AI2D).
- Comprensión de vídeo: soportada según la descripción del modelo base.
- Decodificación especulativa MTP: aceleración de inferencia mediante modelo borrador integrado.
- Despliegue con API compatible con OpenAI a través de OVMS, incluyendo carga de imágenes por URL.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente de documentación técnica con imágenes: desplegado con OpenVINO GenAI en una estación de trabajo Intel, el modelo puede recibir capturas de diagramas de arquitectura o esquemas eléctricos y generar explicaciones textuales, aprovechando su pipeline image-text-to-text y la compresión INT8 para ejecutarse sin GPU dedicada.
- Análisis de vídeo en entornos de borde: al ser un VLM nativo con soporte de vídeo y ejecutable en CPU/iGPU/NPU Intel, encaja en inspección visual de líneas de producción o monitorización de recintos donde no se permite enviar datos a la nube.
- Chatbot multimodal servido con API OpenAI: mediante OVMS con `--allowed_media_domains all`, se puede exponer un endpoint compatible con OpenAI que acepte URLs de imagen, integrándose en aplicaciones existentes sin cambiar el cliente.
- Procesamiento por lotes de imágenes en servidor Intel: el modelo INT8 de 27,8 GB cabe en servidores con suficiente memoria y permite clasificar, describir y extraer información de grandes volúmenes de imágenes usando OVMS con continuous batching.
- Asistencia al desarrollador en tareas de razonamiento visual: con el modo thinking activado, el modelo puede resolver problemas que combinan texto e imagen, como interpretar gráficas de rendimiento o diagramas de flujo y proponer mejoras.
- Prototipado rápido en portátiles con GPU integrada: gracias a la compatibilidad con Optimum Intel y al ejemplo de inferencia con `OVModelForVisualCausalLM`, un equipo de desarrollo puede validar un caso de uso VLM localmente antes de escalar a servidor.
- Aceleración de inferencia interactiva: con el modelo MTP y decodificación greedy, se puede reducir la latencia en asistentes visuales de respuesta corta donde la precisión determinista es aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 27,8 GB en INT8; se necesita al menos esa cantidad de memoria del dispositivo de destino más overhead de runtime y de caché KV. Para CPU se recomienda disponer de 32 GB de RAM o más.
- GPU recomendadas: no se especifican modelos concretos. El runtime OpenVINO soporta CPU, iGPU, NPU y GPUs Intel Arc; OVMS incluye argumentos para exponer dispositivos `/dev/dri` en Docker.
- GPU de consumo: no hay confirmación de que quepa en GPUs de consumo de NVIDIA u AMD; el formato es OpenVINO IR, orientado a hardware Intel. En iGPU Intel el modelo probablemente requiera memoria compartida del sistema, por lo que el rendimiento dependerá de la plataforma.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`), Optimum Intel (`OVModelForVisualCausalLM`), OpenVINO Model Server (OVMS) con API compatible con OpenAI, y binarios para Windows o contenedor Docker.
- Latencia y throughput: no disponibles. La model card indica que el camino MTP solo funciona con decodificación greedy y prefix caching desactivado, lo que limita su uso a escenarios deterministas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| OpenVINO/Qwen3.8-27B-int8-ov | 27 000 M | no disponible | OpenVINO IR INT8 | Apache 2.0 | Optimizado para hardware Intel; incluye MTP |
| Qwen/Qwen3.8-27B | 27 000 M | no disponible | Pesos originales (formato no indicado) | Apache 2.0 | Modelo base sin cuantizar; requiere framework estándar |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Sesgos: no se documentan en la información disponible; al heredar el comportamiento del modelo base, pueden persistir sesgos de los datos de entrenamiento originales.
- Alucinación: no hay evaluación publicada en esta ficha; en tareas visuales de detalle fino (texto en imágenes, diagramas densos) el riesgo existe y debe validarse con datos propios.
- Contexto e idiomas: la longitud de contexto y la lista de idiomas soportados no están disponibles, lo que impide garantizar un rendimiento multilingüe concreto.
- Licencia: Apache 2.0 permite uso comercial, pero deben revisarse las condiciones del modelo base Qwen3.8-27B y de las dependencias (OpenVINO, NNCF, Optimum Intel) por si añaden restricciones.
- Restricciones del MTP: la decodificación especulativa con MTP solo funciona con greedy decoding y sin prefix caching, lo que limita su aplicabilidad en producción con sampling.
- Compatibilidad estricta: requiere OpenVINO 2026.4.0 o superior, OpenVINO GenAI 2026.4.0.0 o superior y Transformers 5.2.0; versiones anteriores pueden fallar al cargar el IR.
- Hardware: el formato OpenVINO IR no es directamente ejecutable en GPUs NVIDIA/AMD con los runtimes habituales (vLLM, llama.cpp); el despliegue está pensado para la pila Intel.
- Tamaño: 27,8 GB de pesos INT8 implican requisitos de memoria considerables para entornos de borde; verificar la memoria disponible antes del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVINO/Qwen3.8-27B-int8-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de compresión de pesos de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/weight-compression.html
- Inferencia con Optimum Intel: https://huggingface.co/docs/optimum-intel/openvino/inference
- Notebook de MTP para Qwen3.8: https://openvinotoolkit.github.io/openvino_notebooks/?search=qwen3.8-mtp
- Documentación y ejemplos de OpenVINO GenAI: https://openvinotoolkit.github.io/openvino.genai/
- Notebook de chatbot multimodal Qwen3-VL: https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/qwen3-vl
- Notebook de chatbot visión-lenguaje: https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/vlm-chatbot
- OpenVINO Model Server: https://github.com/openvinotoolkit/model_server
- Instrucciones de decodificación especulativa en OVMS: https://github.com/openvinotoolkit/model_server/tree/main/demos/continuous_batching/speculative_decoding
- Documentación de OVMS baremetal: https://docs.openvino.ai/ovms_baremetal
