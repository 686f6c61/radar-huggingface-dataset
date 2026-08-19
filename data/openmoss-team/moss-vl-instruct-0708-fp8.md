# OpenMOSS-Team/MOSS-VL-Instruct-0708-FP8

## Resumen

MOSS-VL-Instruct-0708-FP8 es la versión cuantizada en FP8 dinámico del modelo multimodal MOSS-VL-Instruct-0708, desarrollado por el equipo OpenMOSS. Se trata de un modelo de 11 336 millones de parámetros (~11B) diseñado para comprensión de imagen y vídeo de largo formato, con una arquitectura basada en atención cruzada (cross-attention) unificada que integra un codificador visual con un modelo de lenguaje. Esta variante FP8 reduce el peso del checkpoint a unos 24 GiB, lo que permite su ejecución en una GPU con 24 GB de VRAM mediante el pipeline estándar de Transformers, manteniendo la calidad cercana a la versión BF16 original según las evaluaciones publicadas por los autores.

La relevancia de este modelo reside en que aborda la comprensión de vídeo en tiempo real y de larga duración, un área donde muchos modelos multimodales fallan por límites de contexto o coste computacional. La versión FP8 facilita el despliegue en hardware de consumo o de gama media, y es compatible tanto con Transformers como con el backend nativo de SGLang, lo que ofrece flexibilidad para entornos de producción. El modelo está pensado para tareas offline de descripción, respuesta a preguntas y razonamiento sobre contenido visual y de vídeo, con soporte para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención cruzada unificada (codificador visual + LLM) |
| Parametros totales | 11 336 371 208 (11,34B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico (pesos y activaciones) en la mayoría de capas de lenguaje; BF16 en cross-attention, módulos de visión y lm_head; KV cache en HQQ INT8 (Transformers) o BF16 nativo (SGLang) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con formato compressed-tensors 0.14.0 para FP8) |

## Arquitectura y entrenamiento

MOSS-VL-Instruct-0708-FP8 es una cuantización del checkpoint MOSS-VL-Instruct-0708, que a su vez es el resultado de un ajuste fino supervisado (SFT) sobre MOSS-VL-Base-0708. La arquitectura base emplea un diseño de atención cruzada unificada: un codificador visual procesa imágenes o secuencias de vídeo en parches (patch_size 16, temporal_patch_size 1, merge_size 2) y sus características se proyectan al espacio del modelo de lenguaje mediante capas de cross-attention. Este diseño permite manejar vídeos largos sin depender exclusivamente de la ventana de contexto del LLM, ya que la información visual se inyecta de forma intercalada.

El entrenamiento original incluye una fase de preentrenamiento sobre grandes volúmenes de datos visuales y de vídeo, seguida de un ajuste fino con instrucciones (SFT). No se especifican el número exacto de tokens de entrenamiento ni la composición detallada del dataset en la información disponible. La versión FP8 aplica cuantización por token dinámica en las activaciones de entrada y pesos FP8 en las capas de lenguaje, mientras que las capas de cross-attention, los módulos de visión y la cabeza de salida (lm_head) se mantienen en BF16 para preservar la precisión. La caché KV se cuantiza a INT8 mediante HQQ en el camino de Transformers, mientras que SGLang utiliza su caché nativa en BF16. Esta configuración mixta busca minimizar la pérdida de calidad en las partes más sensibles del modelo.

## Capacidades

- Comprensión de imágenes: descripción, respuesta a preguntas visuales y razonamiento sobre contenido estático.
- Comprensión de vídeo: procesa vídeos de larga duración (hasta 256 fotogramas extraídos a 1 fps) y genera descripciones o respuestas basadas en el contenido temporal.
- Entrada multimodal combinada: puede recibir imágenes y vídeo en la misma consulta, aunque la información disponible no detalla la combinación simultánea.
- Generación de texto en inglés y chino: respuestas en ambos idiomas según el prompt.
- Inferencia offline: diseñado para procesamiento por lotes o consultas individuales sin requisitos de latencia en tiempo real.
- Compatibilidad con dos motores de inferencia: Transformers (con FlashAttention 2) y SGLang (servidor compatible con OpenAI).
- No se menciona soporte explícito de tool calling, function calling, agentes o razonamiento multi-paso en la documentación disponible.

## Casos de uso

- Análisis de vídeo de vigilancia: el modelo puede procesar secuencias de vídeo de larga duración (hasta 256 fotogramas) y generar resúmenes descriptivos de eventos, lo que resulta útil para sistemas de seguridad que necesitan revisar grabaciones extensas.
- Transcripción y descripción de contenido audiovisual para accesibilidad: dado su soporte para vídeo e imagen, puede generar descripciones alternativas (alt text) o narraciones de escenas para personas con discapacidad visual, tanto en inglés como en chino.
- Moderación de contenido en plataformas de vídeo: permite clasificar o describir automáticamente el contenido de vídeos subidos por usuarios, ayudando a detectar material inapropiado o a generar metadatos.
- Asistente de documentación técnica con soporte visual: un desarrollador podría subir capturas de pantalla o vídeos de una interfaz y obtener explicaciones o respuestas sobre su funcionamiento, gracias a la capacidad de razonamiento visual.
- Investigación académica en visión por computador: sirve como modelo base para experimentos de cuantización, evaluación de robustez o fine-tuning en tareas específicas de vídeo, dado su tamaño moderado y licencia permisiva.
- Despliegue en entornos con recursos limitados: al caber en una GPU de 24 GB, puede integrarse en servidores de inferencia con SGLang para ofrecer un endpoint OpenAI-compatible de comprensión de vídeo a aplicaciones internas, sin necesidad de clústeres de GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una imagen comparativa titulada "MOSS-VL quantization benchmark comparison" que muestra que los modelos cuantizados permanecen cercanos a sus contrapartes BF16, pero no se proporcionan los valores concretos de métricas como MMLU, HumanEval o similares. Por tanto, no es posible presentar una tabla de resultados verificables.

## Requisitos de hardware

- VRAM estimada: 24 GB para el pipeline de Transformers (según la model card, diseñado para una GPU NVIDIA con 24 GB de VRAM). El tamaño del repo es de 15,8 GB, pero los requisitos de memoria durante la inferencia pueden superar ese valor debido a las activaciones y la caché KV.
- GPU recomendadas: cualquier GPU NVIDIA con 24 GB de VRAM, como RTX 3090, RTX 4090, A5000, L4 o similares. No se menciona soporte para GPUs con menos memoria.
- En SGLang, los requisitos de memoria dependen de la configuración del servidor y la asignación de caché KV; el script de inicio usa `MEM_FRACTION_STATIC=0.35`, lo que sugiere que puede funcionar con una fracción de la memoria total de la GPU.
- Opciones de despliegue: Transformers con `device_map="auto"` y FlashAttention 2, o SGLang con backend nativo (servidor OpenAI-compatible en `http://127.0.0.1:30000`). También es posible usar el runner de inferencia del repositorio para consultas JSON/JSONL.
- Latencia y throughput: no disponibles. No se proporcionan mediciones de velocidad en la documentación.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos multimodales de tamaño similar (p. ej., Qwen2-VL-7B, LLaVA-NeXT-Video-7B, InternVL2-8B) en la información proporcionada. La model card solo compara la versión cuantizada con su versión BF16 original, sin ofrecer cifras. Por tanto, la comparativa con alternativas queda pendiente de datos verificables.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se documentan sesgos específicos, pero como todo modelo multimodal, puede generar descripciones inexactas o inventar detalles en vídeos densos o dominios muy especializados.
- Limitaciones de contexto: la documentación advierte que vídeos muy densos, dominios altamente especializados, OCR de texto pequeño y tareas que requieren razonamiento numérico estricto pueden requerir prompts específicos, ajustes de muestreo o fine-tuning adicional.
- Idiomas: solo inglés y chino; no hay soporte declarado para otros idiomas.
- Licencia: Apache 2.0, permisiva para uso comercial, pero el modelo base y sus pesos están sujetos a la misma licencia; se recomienda revisar los términos de los datasets de entrenamiento si se planea un uso comercial.
- Requisitos de hardware: la versión FP8 requiere una GPU con 24 GB de VRAM para el camino de Transformers; no es adecuada para GPUs de menor memoria sin técnicas adicionales de offloading.
- Dependencias técnicas: requiere versiones específicas de `compressed-tensors` (0.14.0) y `hqq` (0.2.8.post1) para Transformers, y un entorno SGLang separado con versiones concretas (SGLang 0.5.11, PyTorch 2.11.0 + CUDA 13.0). La compatibilidad con otras versiones no está garantizada.
- La cuantización FP8 puede introducir pérdidas de precisión en tareas numéricas o de razonamiento fino, aunque los autores indican que la calidad general se mantiene cercana a la versión BF16.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708-FP8
- Modelo base sin cuantizar: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708
- Repositorio GitHub de MOSS-VL: https://github.com/OpenMOSS/MOSS-VL
- Página oficial de OpenMOSS sobre MOSS-VL: https://openmoss.ai/MOSS-VL/moss-vl.html
- Modelo en ModelScope: https://www.modelscope.cn/models/openmoss/MOSS-VL-Instruct-0708
