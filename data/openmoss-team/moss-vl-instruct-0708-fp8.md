# OpenMOSS-Team/MOSS-VL-Instruct-0708-FP8

## Resumen

MOSS-VL-Instruct-0708-FP8 es la version cuantizada en FP8 del modelo vision-lenguaje MOSS-VL-Instruct-0708, desarrollado por OpenMOSS (equipo vinculado al ecosistema MOSS AI). Se trata de un modelo multimodal de ~11.340 millones de parametros orientado a comprension de imagen, comprension de video largo e interaccion en streaming en tiempo real, con licencia Apache 2.0. El checkpoint emplea cuantizacion dinamica FP8 en la mayoria de las capas del lenguaje, manteniendo en BF16 los modulos de vision, la atencion cruzada y el `lm_head`, lo que reduce el peso del repositorio a unos 15,8 GB (frente a los ~24 GiB del release cuantizado descrito en la model card).

La relevancia de esta variante esta en el ahorro de memoria: segun el autor, el modelo esta disenado para ejecutarse con la ruta de inferencia de Transformers en una unica GPU NVIDIA con 24 GB de VRAM, lo que lo situa en el rango de GPUs de consumo alto (RTX 4090, RTX 3090) y de tarjetas profesionales de gama media. Ademas, el mismo directorio de checkpoint es compatible tanto con Transformers como con el backend nativo de SGLang para MOSS-VL, lo que facilita el despliegue en produccion sin reexportar pesos.

El modelo soporta ingles y chino de forma declarada, con pipeline `video-text-to-text` y capacidades de extraccion de caracteristicas (`feature-extraction`). Se publica junto a un informe tecnico en arXiv y una API alojada en la plataforma de MOSS, lo que permite comparar el comportamiento self-hosted con el servicio gestionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en transformer (familia MOSS-VL, con modulos de vision, atencion cruzada y LLM); detalles exactos de la columna vertebral no disponibles |
| Parametros totales | 11.336.371.208 (~11,34 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible de forma explicita; la model card menciona benchmark comparativo "4k" y soporte de video largo con hasta 256 frames |
| Tipos de cuantizacion | FP8 dinamico (pesos FP8 + activaciones de entrada FP8 por token), BF16 en cross-attention, vision y `lm_head`, KV cache HQQ INT8 en Transformers y BF16 nativo en SGLang |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con formato `compressed-tensors` 0.14.0; requiere `custom_code` y `trust_remote_code=True` |

## Arquitectura y entrenamiento

La informacion disponible describe MOSS-VL como una familia abierta de modelos vision-lenguaje que combina un codificador visual con un modelo de lenguaje y modulos de atencion cruzada para integrar las representaciones visuales. El procesamiento visual se realiza mediante parches (`patch_size=16`, `temporal_patch_size=1`, `merge_size=2`), con resoluciones configurables mediante `shortest_edge`, `longest_edge` y limites de pixeles por imagen o video. Para video, el modelo extrae frames a una tasa configurable (`video_fps`, por defecto 1.0) con un maximo de 256 frames y decodificacion paralela mediante hilos (`num_extract_threads`). No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica principal de este checkpoint es la cuantizacion: se aplica FP8 dinamico por token a las activaciones de entrada de la mayoria de capas del lenguaje, mientras que los modulos sensibles (vision, atencion cruzada y `lm_head`) permanecen en BF16 para preservar calidad. La cache KV se gestiona con HQQ INT8 en la ruta de Transformers (activada automaticamente desde `generation_config.json`) y con cache BF16 nativa en SGLang. El autor afirma que, en los benchmarks seleccionados, los modelos cuantizados se mantienen cercanos a sus equivalentes BF16, aunque no se aportan las cifras concretas en el texto de la model card.

## Capacidades

- Comprension de imagenes: descripcion, respuesta a preguntas visuales y extraccion de informacion a partir de imagenes con resolucion configurable.
- Comprension de video largo: procesamiento de hasta 256 frames por video, con control de FPS y extraccion multihilo.
- Interaccion en streaming en tiempo real: la familia MOSS-VL se presenta explicitamente como apta para interaccion en streaming.
- Extraccion de caracteristicas (`feature-extraction`): utilizable como codificador multimodal para tareas posteriores.
- Generacion de texto multimodal: pipeline `video-text-to-text`, con soporte para prompts que combinan texto, imagen y video.
- Multilinguee limitado: ingles y chino declarados.
- Compatibilidad con dos motores de inferencia: Transformers (con `trust_remote_code`) y SGLang con backend nativo MOSS-VL.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras modalidades: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de video de vigilancia o monitorizacion: el modelo puede procesar videos de hasta 256 frames con FPS configurable, lo que permite resumir eventos, describir escenas y responder preguntas sobre lo ocurrido en una grabacion sin necesidad de infraestructura de multiples GPUs.
- Moderacion de contenido visual: al ejecutarse en una sola GPU de 24 GB, puede desplegarse en un nodo dedicado para clasificar y describir imagenes o clips enviados por usuarios, generando informes textuales que alimenten un sistema de revision.
- Accesibilidad y descripcion automatica: generacion de descripciones de imagenes y videos para lectores de pantalla o catalogos, aprovechando la capacidad de resolver a resoluciones altas (`shortest_edge=4096`, `longest_edge=16777216`).
- Indexacion y busqueda semantica de archivos multimedia: usando el pipeline `feature-extraction`, se pueden generar embeddings visuales y textuales para un motor de busqueda sobre una videoteca o fototeca.
- Asistencia en documentacion tecnica: extraccion de informacion de capturas de pantalla, diagramas o grabaciones de demo para redactar documentacion, con soporte bilinguee ingles-chino.
- Prototipado e investigacion en entornos con recursos limitados: al caber en una RTX 4090 o similar, es adecuado para laboratorios que necesitan evaluar modelos vision-lenguaje sin acceso a clusters de A100/H100.
- Despliegue en produccion con SGLang: el mismo checkpoint funciona con el backend nativo de SGLang, lo que permite servir peticiones concurrentes con cache KV BF16 y configuracion de servidor ajustable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una grafica comparativa de cuantizacion frente a BF16 (`mossvl_quantization_benchmark_comparison_en_4k.png`) y afirma que los modelos cuantizados se mantienen cercanos a sus equivalentes BF16, pero no se proporcionan las cifras concretas en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia: 24 GB segun el autor, con la ruta de Transformers en una unica GPU NVIDIA.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB), L4 (24 GB, con posible presion de memoria), A100 40/80 GB y H100 para mayor margen y concurrencia.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM como la RTX 4090 o la RTX 3090, segun la indicacion del autor.
- Opciones de despliegue: Transformers 4.57.1 con `compressed-tensors` 0.14.0 y HQQ 0.2.8.post1; SGLang 0.5.11 con `sglang-kernel` 0.4.2 y `compressed-tensors` 0.17.1; el repositorio incluye un runner (`inference/run_inference.py`) que acepta JSON/JSONL con contenido de imagen o video. No se mencionan llama.cpp, Ollama ni TGI.
- Requisitos adicionales: Python 3.12, PyTorch 2.8.0 + CUDA 12.8 (Transformers) o PyTorch 2.11.0 + CUDA 13.0 (SGLang), FlashAttention 2.8.1, FFmpeg en `PATH` para decodificacion de video.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria. A continuacion se indica lo que si puede compararse a nivel de ficha tecnica:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MOSS-VL-Instruct-0708-FP8 | ~11,34 B | No disponible | Apache 2.0 | Version cuantizada FP8, 24 GB VRAM, soporte Transformers y SGLang |
| MOSS-VL-Instruct-0708 (BF16) | No disponible | No disponible | Apache 2.0 | Modelo base sin cuantizar del que deriva este checkpoint |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No se han proporcionado datos de benchmarks ni de modelos comparables |

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion: como todo modelo vision-lenguaje, puede generar descripciones o respuestas no fundamentadas en la imagen o el video, especialmente con resoluciones bajas o videos con muchos frames.
- Sesgos: no se documentan en la informacion proporcionada los sesgos conocidos del modelo ni la composicion del dataset de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True` y codigo personalizado, lo que implica auditar el codigo remoto antes de desplegarlo en produccion.
- Dependencias fragiles: el checkpoint esta atado a versiones concretas de `compressed-tensors` (0.14.0 en Transformers, 0.17.1 en SGLang), HQQ y FlashAttention; mezclar versiones puede romper la carga o la cache KV.
- Cache KV: en Transformers se activa HQQ INT8 desde `generation_config.json`; pasar una configuracion de cache en conflicto puede degradar la calidad o fallar.
- Contexto: la longitud de contexto no se especifica de forma explicita; el limite practico dependera de la memoria disponible para la cache KV y del numero de frames procesados.
- Cuantizacion: aunque el autor afirma que la calidad se preserva, no se aportan cifras de benchmarks que lo cuantifiquen; conviene validar en el caso de uso concreto antes de sustituir el BF16.
- Video: el procesamiento esta limitado a 256 frames por defecto y a una tasa de 1 FPS configurable; videos muy largos requeriran muestreo o segmentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708-FP8
- Modelo base (BF16): https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708
- README en chino: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708-FP8/blob/main/README_zh.md
- Informe tecnico (arXiv 2608.15045): https://arxiv.org/pdf/2608.15045
- Referencia arXiv adicional (2606.07639): https://arxiv.org/abs/2606.07639
- Web de MOSS AI: https://www.moss-ai.com/models/moss-vl
- Documentacion de la API MOSS (comprension de imagen y video): https://platform.moss.cn/en/docs/scenarios/image-video-understanding
- Repositorio de codigo MOSS-VL: https://github.com/OpenMOSS/MOSS-VL
