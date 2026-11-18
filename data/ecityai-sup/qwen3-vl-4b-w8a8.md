# eCityAI-Sup/Qwen3-VL-4B-W8A8

## Resumen

Qwen3-VL-4B-W8A8 es una versión cuantizada del modelo multimodal Qwen3-VL-4B-Instruct de Alibaba Qwen, publicada por eCityAI-Sup. Se trata de una cuantización W8A8 (pesos INT8 y activaciones INT8) realizada con la cadena de herramientas nativa de Ascend (msModelSlim), orientada a su despliegue sobre aceleradores Ascend 310P (Atlas 300I Duo) mediante el backend vLLM-Ascend. El modelo base es un transformer multimodal de 4.000 millones de parámetros que procesa entradas imagen-texto y genera texto.

El checkpoint está especializado en comprensión visual de escenas de vigilancia en estaciones de metro y paradas de carretera: detección de objetos abandonados y residuos dispersos, VQA de escena, OCR de señalización y generación de descripciones estructuradas en JSON. La cuantización reduce la huella de memoria y aumenta el throughput en un único NPU Ascend 310P manteniendo, según el autor, una precisión prácticamente equivalente a la del modelo en coma flotante.

La relevancia de esta ficha radica en que es un ejemplo concreto de despliegue de un VLM de 4B en hardware no-GPU (Ascend), un nicho con escasa documentación pública. No obstante, el repositorio solo distribuye los pesos cuantizados y notas de despliegue y evaluación; no incluye el script de cuantización ni datos de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3-VL-4B-Instruct |
| Parametros totales | 4B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuración de servicio documentada (`--max-model-len 4096`) |
| Tipos de cuantizacion | W8A8: pesos INT8 + activaciones INT8, formato nativo Ascend (msModelSlim) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato cuantizado nativo Ascend: `quant_model_description.json` + shards safetensors INT8 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-VL-4B-Instruct: un transformer multimodal con codificador visual y decoder de lenguaje, capaz de procesar imágenes y texto de forma conjunta para generar respuestas. El checkpoint publicado no ha sido reentrenado; es una cuantización post-entrenamiento del modelo base, realizada con la herramienta msModelSlim de Ascend, que produce pesos INT8 por capa junto con un fichero `quant_model_description.json` que describe los parámetros de cuantización. No se dispone de información sobre el dataset de calibración empleado, el número de tokens ni si se aplicaron técnicas de RLHF o DPO en el modelo base dentro de la información proporcionada.

La innovación principal de esta publicación es operativa, no arquitectónica: empaquetar un VLM de 4B en formato INT8 nativo para Ascend y documentar su servicio mediante vLLM-Ascend con `--quantization ascend`, `--dtype float16` y `--enforce-eager`. El autor indica que la precisión en tareas visuales se preserva esencialmente respecto al baseline BF16, aunque no se aportan las cifras completas de esa comparación.

## Capacidades

- Generación de texto a partir de imágenes (image-text-to-text) con razonamiento visual sobre la escena.
- Detección de objetos abandonados y residuos dispersos en fotogramas de vigilancia.
- VQA de escena: localización, afluencia de personas y estado de instalaciones.
- OCR de señalización en las imágenes.
- Generación de descripciones estructuradas en JSON (tipo de evento, ubicación, confianza, descripción).
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`, `/v1/models`).
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Vigilancia de objetos abandonados en estaciones de metro: el modelo recibe un fotograma de plataforma o vestíbulo y devuelve un JSON con `event_type`, `location`, `confidence` y `description`, lo que permite integrarlo en un pipeline de alertas automatizado.
- Detección de residuos dispersos en paradas de carretera: análisis de imágenes exteriores, incluidos escenarios de contraluz y nocturnos, para priorizar tareas de limpieza.
- VQA de escena para operadores: consultas en lenguaje natural sobre afluencia, estado de instalaciones o localización de elementos en la imagen, con respuesta directa del modelo.
- OCR de señalización: extracción de texto de carteles y paneles en las imágenes para inventariado o accesibilidad.
- Enriquecimiento de metadatos de videovigilancia: generación automática de descripciones estructuradas por fotograma que alimenten un sistema de búsqueda o auditoría.
- Despliegue en edge con hardware Ascend: al ejecutarse en un único Ascend 310P con cuantización INT8, encaja en entornos con restricciones de memoria y sin GPU NVIDIA, como instalaciones ferroviarias o de tráfico.
- Prototipado de asistentes visuales especializados: servir el modelo vía API OpenAI-compatible en `--port 8013` para integrarlo en aplicaciones existentes sin cambiar el cliente.

## Benchmarks y rendimiento

El autor menciona una evaluación de precisión sobre dos conjuntos internos, `MetroStation-Img` (500 fotogramas / 1.200 pares QA) y `RoadStation-Img` (500 fotogramas / 1.200 pares QA), comparando contra el checkpoint BF16 sin cuantizar con las mismas imágenes, preprocesado, prompts y decodificación. Sin embargo, la información proporcionada se interrumpe antes de incluir los resultados numéricos.

| Benchmark | Resultado |
|---|---|
| MetroStation-Img (500 frames / 1.200 QA) | no disponible (resultados no incluidos en la información) |
| RoadStation-Img (500 frames / 1.200 QA) | no disponible (resultados no incluidos en la información) |
| MMLU, HumanEval, GSM8K u otros estándar | no disponible |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: un único Ascend 310P (Atlas 300I Duo), sin paralelismo tensorial (`--tensor-parallel-size 1`).
- VRAM/NPU: límite configurable con `--gpu-memory-utilization 0.85`; el codificador visual añade memoria extra, por lo que el autor recomienda ajustar según lecturas de `npu-smi`. No se especifica el consumo exacto en GB.
- GPU consumer: no aplica; el formato de pesos es nativo Ascend y requiere el backend `--quantization ascend` de vLLM-Ascend. No se documenta compatibilidad con CUDA, llama.cpp, Ollama ni TGI.
- Despliegue: contenedor `quay.io/ascend/vllm-ascend:v0.21.0rc1-310p-openeuler`, con montaje de drivers Ascend (`/usr/local/Ascend/driver`, `add-ons`, `dcmi`), `--shm-size=32g`, `--network host` y `--privileged`.
- Configuración de servicio: `--max-model-len 4096`, `--dtype float16`, `--enforce-eager`, `--trust-remote-code`, puerto 8013.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Hardware | Licencia |
|---|---|---|---|---|---|
| Qwen3-VL-4B-W8A8 (este) | 4B | 4096 (config. servicio) | W8A8 INT8 nativo Ascend | Ascend 310P | Apache 2.0 |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible | BF16 (sin cuantizar) | GPU/NPU según backend | Apache 2.0 |
| Alternativas de 4B con cuantizacion INT8 para GPU | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base sin cuantizar: misma arquitectura y licencia, pero mayor huella de memoria y menor throughput en Ascend. No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio solo incluye pesos cuantizados y notas; no se distribuye el script de cuantización, lo que dificulta reproducir el proceso.
- El formato de pesos es específico de Ascend: no es portable a GPU NVIDIA ni a runtimes estándar como llama.cpp u Ollama.
- La ventana de contexto documentada es de 4096 tokens, que debe acomodar los tokens de imagen, la pregunta y la salida estructurada; imágenes grandes o conversaciones largas pueden excederla.
- Los resultados de la evaluación de precisión frente al baseline BF16 no están disponibles en la información, por lo que no se puede verificar la afirmación de que la precisión se preserva.
- Riesgo de alucinación inherente a los VLM: las descripciones JSON pueden contener eventos o ubicaciones inexistentes; se recomienda validación y umbrales de confianza en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; el ejemplo de prompt está en inglés.
- El modelo está orientado a escenas de vigilancia de metro y carretera; su rendimiento fuera de esos dominios no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de la licencia del modelo base Qwen3-VL-4B-Instruct.
- El despliegue requiere `--trust-remote-code` y código personalizado del procesador de imágenes, lo que implica revisar el código antes de ejecutarlo en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eCityAI-Sup/Qwen3-VL-4B-W8A8
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Backend de servicio: vLLM-Ascend, imagen `quay.io/ascend/vllm-ascend:v0.21.0rc1-310p-openeuler`
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
