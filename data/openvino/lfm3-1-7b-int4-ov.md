# OpenVINO/LFM3-1.7B-int4-ov

## Resumen

LFM3-1.7B-int4-ov es la conversión al formato OpenVINO IR del modelo LFM3-1.7B desarrollado por LiquidAI, con los pesos comprimidos a INT4 mediante NNCF. No se trata de un modelo nuevo, sino de una distribución optimizada para inferencia en hardware Intel (CPU, iGPU, NPU) usando el stack de OpenVINO y OpenVINO GenAI. El modelo base pertenece a la familia LFM3 de LiquidAI, una tercera generación de modelos de lenguaje de 1.700 millones de parámetros orientados a generación de texto y conversación con modo de razonamiento integrado.

La relevancia de esta ficha radica en que permite ejecutar un LLM de 1.7B en equipos sin GPU dedicada, con un repositorio de solo 1,1 GB gracias a la cuantización INT4 asimétrica con group_size 64. Es una opción práctica para despliegues en portátiles, mini-PC y servidores de borde con CPU Intel, y para integrarse en OpenVINO Model Server (OVMS) exponiendo una API compatible con OpenAI.

La información disponible sobre el modelo base es limitada: la model card de esta conversión no detalla la arquitectura interna de LFM3, los datos de entrenamiento ni los idiomas soportados. Esta ficha se limita a lo que la model card y los metadatos de Hugging Face proporcionan, marcando como "no disponible" todo aquello que no se ha publicado en la información consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de LiquidAI; la conversión usa custom_code y OpenVINO IR) |
| Parametros totales | 1.700 millones (1.7B, segun el nombre del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimetrica (INT4_ASYM), ratio 1.0, group_size 64, via NNCF |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other" con nombre lfm1.0) |
| Formato de pesos | OpenVINO IR (comprimido a INT4); repositorio de 1,1 GB |
| Libreria | openvino |
| Compatibilidad | OpenVINO >= 2026.5.0 y OpenVINO GenAI >= 2026.5.0 (nightly builds en el momento de publicacion) |
| Pipeline | text-generation |
| Modelo base | LiquidAI/LFM3-1.7B |

## Arquitectura y entrenamiento

La model card de esta conversión no describe la arquitectura interna del modelo base LFM3-1.7B. Se sabe que LiquidAI desarrolla la familia LFM (Liquid Foundation Models) y que este modelo es la tercera generación de la serie con 1.7B de parámetros, pero los detalles sobre si emplea un transformer convencional, una arquitectura híbrida con capas de estado recurrente o atención lineal no están publicados en la información disponible. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o similar.

Lo que sí está documentado es el proceso de conversión y cuantización: los pesos originales en safetensors de LiquidAI/LFM3-1.7B se exportaron a OpenVINO IR mediante `optimum-cli export openvino` y se comprimieron con `nncf.compress_weights` en modo INT4_ASYM con ratio 1.0 y group_size 64. Esta configuración reduce el peso del modelo hasta 1,1 GB, lo que lo hace viable en CPU y en dispositivos con memoria limitada. La model card menciona que el chat template habilita el razonamiento por defecto y que puede desactivarse con `enable_thinking=False`, lo que indica que el modelo base incorpora un modo de pensamiento previo a la respuesta.

## Capacidades

- Generación de texto y conversación multi-turno: el pipeline es text-generation y el modelo está pensado para uso conversacional.
- Modo de razonamiento (thinking): el chat template activa el razonamiento por defecto; se puede desactivar para obtener respuestas directas.
- Soporte de chat template con roles (`apply_chat_template`), incluyendo el parámetro `enable_thinking`.
- Ejecución en CPU, iGPU y NPU Intel mediante OpenVINO y OpenVINO GenAI.
- Despliegue como servicio con API compatible con OpenAI a través de OpenVINO Model Server (OVMS).
- Integración con Optimum Intel y con la librería `openvino_genai` para Python.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en portátiles y mini-PC con CPU Intel: el modelo INT4 de 1,1 GB se ejecuta con `ov_genai.LLMPipeline` en dispositivo CPU, sin necesidad de GPU dedicada, lo que permite prototipos y demos locales de chat.
- Despliegue como servicio interno con OVMS: usando `--source_model OpenVINO/LFM3-1.7B-int4-ov` y el cliente OpenAI, se puede exponer un endpoint `/v1/chat/completions` en un contenedor Docker con acceso a `/dev/dri` para aceleración por iGPU.
- Automatización de tareas de razonamiento ligero: activando el modo thinking por defecto, el modelo puede resolver problemas de varios pasos en entornos con recursos limitados, útil para clasificación, extracción y resúmenes con justificación.
- Generación de texto en aplicaciones de borde (edge computing): al caber en 1,1 GB, es adecuado para dispositivos con poca memoria donde no es viable un modelo de 7B o superior.
- Integración en notebooks y pipelines de prototipado con OpenVINO Notebooks: la model card enlaza ejemplos de LFM3 y LLM en OpenVINO Notebooks, lo que facilita pruebas reproducibles en Jupyter.
- Evaluación comparativa de cuantización INT4: sirve como referencia para medir la pérdida de calidad frente al modelo original en FP16/BF16 en tareas de generación y razonamiento.
- Chatbot embebido en herramientas de escritorio en Windows: la model card documenta despliegue con el paquete binario de OVMS en Windows, lo que permite distribuir un servicio local sin Linux ni Docker.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser INT4 con 1.7B de parámetros, el peso de los pesos ronda 1,1 GB (tamaño del repositorio). La memoria adicional para KV cache y activaciones depende del contexto, que no está documentado.
- GPU recomendadas: la model card no enumera GPUs concretas; el stack OpenVINO soporta CPU Intel, iGPU (con acceso a `/dev/dri` en Linux) y NPU. No se citan A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, por tamaño (1,1 GB), aunque la ruta de despliegue documentada es OpenVINO sobre hardware Intel, no CUDA.
- Opciones de despliegue: Optimum Intel (`OVModelForCausalLM`), OpenVINO GenAI (`ov_genai.LLMPipeline`), OpenVINO Model Server (OVMS) con API compatible con OpenAI, y binario de OVMS para Windows.
- Latencia y throughput: no disponibles en la información proporcionada.
- Versiones requeridas: OpenVINO 2026.5.0 o superior (nightly en el momento de publicación), OpenVINO GenAI 2026.5.0 o superior, `transformers==5.20.0` y el PR huggingface/optimum-intel#2087 para soporte LFM3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OpenVINO/LFM3-1.7B-int4-ov | 1.7B | no disponible | OpenVINO IR INT4 | lfm1.0 | Optimizado para CPU/iGPU/NPU Intel via OpenVINO |
| LiquidAI/LFM3-1.7B | 1.7B | no disponible | safetensors (original) | lfm1.0 | Modelo base sin cuantizar; requiere framework PyTorch |
| Alternativas de ~1-2B en formato GGUF | no disponible | no disponible | GGUF | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación se limita a formato, licencia y ruta de despliegue.

## Limitaciones y advertencias

- La licencia es `lfm1.0` (etiquetada como "other"), no una licencia open source estándar; es imprescindible revisar los términos en el enlace de licencia del modelo base antes de uso comercial.
- La model card no documenta sesgos, idiomas soportados ni evaluación de alucinación; no hay garantías publicadas sobre calidad en dominios específicos.
- El modo de razonamiento está activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva con `enable_thinking=False`.
- Requiere versiones muy recientes de OpenVINO y OpenVINO GenAI (2026.5.0, nightly en el momento de publicación) y un PR de optimum-intel no fusionado; esto implica riesgo de incompatibilidades y falta de soporte estable.
- El modelo está pensado para el ecosistema OpenVINO/Intel; no es directamente ejecutable con vLLM, llama.cpp, Ollama o TGI sin conversión adicional.
- El contexto máximo no está publicado, lo que dificulta dimensionar memoria para KV cache en producción.
- Al ser una cuantización INT4, puede haber degradación de calidad frente al modelo original en tareas sensibles; no se han publicado métricas que cuantifiquen esa pérdida.
- Repositorio con 167 descargas y 0 likes en el momento de la consulta: ecosistema pequeño y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVINO/LFM3-1.7B-int4-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Creador LiquidAI: https://huggingface.co/LiquidAI
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- NNCF: https://github.com/openvinotoolkit/nncf
- Guía de compresión de pesos OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/weight-compression.html
- Optimum Intel: https://huggingface.co/docs/optimum/intel/index
- PR de soporte LFM3 en optimum-intel: https://github.com/huggingface/optimum-intel/pull/2087
- Inferencia con Optimum Intel: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-optimum-intel.html
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Inferencia con GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- Ejemplos de OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai?tab=readme-ov-file#openvino-genai-samples
- OpenVINO Notebooks (LFM3): https://openvinotoolkit.github.io/openvino_notebooks/?search=LFM3
- OpenVINO Notebooks (LLM): https://openvinotoolkit.github.io/openvino_notebooks/?search=LLM
- OpenVINO Model Server: https://github.com/openvinotoolkit/model_server
- Paquete binario OVMS: https://docs.openvino.ai/ovms_baremetal
