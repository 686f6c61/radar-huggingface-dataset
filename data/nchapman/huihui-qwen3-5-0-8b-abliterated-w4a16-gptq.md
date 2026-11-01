# nchapman/Huihui-Qwen3.5-0.8B-abliterated-W4A16-GPTQ

## Resumen

Huihui-Qwen3.5-0.8B-abliterated-W4A16-GPTQ es una cuantización INT4 de tipo W4A16 (pesos en 4 bits, activaciones en 16 bits) del modelo huihui-ai/Huihui-Qwen3.5-0.8B-abliterated, que a su vez deriva de la familia Qwen3.5 de Alibaba. El modelo base ha sido sometido a un proceso de "abliteration" por parte de huihui-ai, una técnica que elimina la dirección de rechazo en el espacio de activaciones para reducir las negativas del modelo ante solicitudes sensibles. La cuantización la firma nchapman mediante GPTQ y el formato compressed-tensors, con el objetivo declarado de servir en vLLM con aproximadamente una cuarta parte de la memoria del original.

El modelo combina dos características poco habituales en este rango de tamaño: es multimodal (pipeline image-text-to-text) y emplea una arquitectura híbrida que incluye proyecciones de atención lineal junto con atención estándar, además de una cabeza MTP (multi-token prediction). Con 852.985.920 parámetros totales (aproximadamente 0,85 mil millones), se posiciona en la gama ultraligera, apta para GPUs de consumo y despliegues de alta concurrencia.

Su relevancia actual radica en la combinación de tres factores: cuantización INT4 compatible con vLLM lista para producción, capacidades de visión y texto en un modelo sub-1B, y una licencia Apache 2.0 sin restricciones comerciales. El repositorio ocupa 1,0 GB y acumula 33 descargas en el momento de la consulta, lo que lo sitúa como un artefacto de nicho orientado a experimentación con modelos pequeños multimodal y sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con proyecciones de atención lineal y cabeza MTP (multi-token prediction); multimodal image-text-to-text |
| Parametros totales | 852.985.920 (~0,85 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 W4A16 GPTQ (compressed-tensors); torre de visión, cabeza MTP, proyecciones de atención lineal y `lm_head` permanecen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ / compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer de ~0,85 mil millones de parámetros con arquitectura híbrida: combina capas de atención estándar con proyecciones de atención lineal, un patrón que busca reducir el coste computacional en contextos largos manteniendo la calidad de la atención completa. Incorpora además una cabeza MTP (multi-token prediction), un mecanismo que permite predecir varios tokens por paso y que suele emplearse para decodificación especulativa o para acelerar la generación. Al tratarse de un modelo image-text-to-text, incluye una torre de visión que proyecta las características visuales al espacio del modelo de lenguaje.

Sobre el proceso de entrenamiento del modelo original (Qwen3.5-0.8B) no se proporciona información en la documentación disponible: no se especifican el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste con datos sintéticos. El modelo intermedio de huihui-ai aplica abliteration, una técnica de edición de pesos que identifica la dirección de rechazo y la elimina de las activaciones, reduciendo la tasa de negativas ante peticiones sensibles. La cuantización de nchapman se calibró con 999 muestras extraídas de nvidia/Nemotron-Cascade-2-SFT-Data respetando las proporciones del propio dataset; las filas exactas están fijadas en el dataset warp-3090-quant-lab-frozen-data para garantizar reproducibilidad. La receta y las herramientas están publicadas en el repositorio warp-3090-model-lab.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia (froggeric Qwen-Fixed-Chat-Templates v22.5) incluida como `chat_template.jinja`.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), incluyendo preguntas sobre el contenido visual y descripción.
- Modo "thinking": la `generation_config.json` fija los valores por defecto del modo de razonamiento del modelo base (temperature 1.0, top_p 0.95, top_k 20).
- Razonamiento de varios pasos y generación de código, heredados del modelo Qwen3.5 subyacente, aunque sin benchmarks publicados que lo cuantifiquen en esta variante.
- Multilingüismo: no se documenta la lista de idiomas soportados; se desconoce si conserva la cobertura multilingüe de la familia Qwen.
- Compatibilidad con vLLM mediante el formato compressed-tensors, lo que permite servirlo con `LLM(model="nchapman/Huihui-Qwen3.5-0.8B-abliterated-W4A16-GPTQ")`.
- No se documenta soporte explícito de tool calling, function calling ni uso como agente autónomo en la información disponible.

## Casos de uso

- Asistente conversacional de bajo coste: el modelo puede gestionar diálogos multi-turno en entornos con recursos limitados, ya que su tamaño de ~0,85 B parámetros y su cuantización INT4 permiten ejecutarlo en GPUs de consumo con una huella de memoria reducida.
- Análisis de imágenes en pipelines ligeros: al ser image-text-to-text, permite clasificar, describir o extraer información de capturas, documentos escaneados o fotos en flujos automatizados donde un modelo de 7B+ sería sobredimensionado.
- Prototipado rápido de aplicaciones multimodales: la integración directa con vLLM y el formato compressed-tensors permiten levantar un endpoint compatible con la API de OpenAI en minutos para validar ideas antes de escalar a modelos mayores.
- Generación de texto sin filtros en investigación: el proceso de abliteration reduce las negativas del modelo, lo que resulta útil en estudios sobre seguridad, alineación y comportamiento de modelos, siempre con las cautelas éticas correspondientes.
- Despliegue en el borde o en dispositivos con VRAM limitada: con pesos INT4 y capas críticas en BF16, encaja en escenarios de inferencia local donde no cabe un modelo multimodal de mayor tamaño.
- Experimentación con decodificación multi-token: la cabeza MTP conservada en BF16 permite investigar técnicas de predicción especulativa y aceleración de generación sobre un modelo pequeño y fácil de iterar.
- Servicio de altas concurrencia en CPU/GPU mixtas: el reducido tamaño del repositorio (1,0 GB) y la cuantización W4A16 facilitan escalar réplicas en clústeres con GPUs modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT4 de ~0,85 B parámetros ocupan aproximadamente 0,5 GB; sumando capas en BF16 (torre de visión, MTP, proyecciones lineales y `lm_head`), la huella total ronda 1-1,5 GB, más KV cache y buffers de activación.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM efectiva para texto; para visión y contextos largos se recomienda 8 GB o más (RTX 3060, RTX 4060, RTX 4090, L4, A10, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3050 8 GB, RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090; también en iGPUs con memoria unificada mediante backends compatibles.
- Opciones de despliegue: vLLM es el backend principal documentado (soporte nativo de compressed-tensors W4A16); transformers también carga el modelo. No se confirma soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud de contexto, no documentada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Cuantización |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-0.8B-abliterated-W4A16-GPTQ | ~0,85 B | no disponible | Imagen + texto | Apache 2.0 | INT4 W4A16 GPTQ |
| huihui-ai/Huihui-Qwen3.5-0.8B-abliterated (base) | ~0,85 B | no disponible | Imagen + texto | Apache 2.0 | BF16 original |
| Qwen3.5-0.8B (original de Alibaba) | ~0,85 B | no disponible | Imagen + texto | no disponible en la información | BF16 original |
| Alternativas sub-1B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros modelos sub-1B multimodales no puede establecerse con rigor porque la información proporcionada no incluye sus especificaciones ni resultados de benchmarks. La diferencia principal frente al modelo base es la reducción de memoria (~4x) a costa de una posible pérdida de calidad por cuantización, y la eliminación del filtro de rechazo en la variante abliterated.

## Limitaciones y advertencias

- La cuantización INT4 introduce pérdida de precisión respecto al modelo BF16 original; no se han publicado evaluaciones que cuantifiquen esa degradación.
- El proceso de abliteration elimina la dirección de rechazo, lo que puede aumentar la probabilidad de generar contenido sensible, sesgado o inapropiado; no es apto para aplicaciones orientadas al público sin capas adicionales de moderación.
- Riesgo de alucinación elevado por el tamaño reducido del modelo (~0,85 B), especialmente en tareas de conocimiento factual y razonamiento complejo.
- No se documentan los idiomas soportados ni el comportamiento multilingüe; el rendimiento fuera del inglés y el chino es incierto.
- La longitud de contexto no está disponible, lo que impide planificar despliegues con ventanas largas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo deriva de Qwen3.5; conviene verificar las condiciones de la licencia del modelo original de Alibaba antes de un despliegue comercial.
- El repositorio tiene 33 descargas y 0 likes, por lo que carece de validación comunitaria extensa; se recomienda evaluar exhaustivamente antes de producción.
- El soporte de tool calling y agentes no está documentado; no asumir su funcionamiento sin pruebas.
- Las capas en BF16 (visión, MTP, proyecciones lineales y `lm_head`) impiden una reducción de memoria proporcional al 4x teórico del W4A16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nchapman/Huihui-Qwen3.5-0.8B-abliterated-W4A16-GPTQ
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-0.8B-abliterated
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Filas de calibración fijadas: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Plantilla de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Receta y herramientas de cuantización: https://github.com/nchapman/warp-3090-model-lab
