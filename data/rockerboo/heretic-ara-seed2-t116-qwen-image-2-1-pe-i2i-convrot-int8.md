# rockerBOO/heretic-ara-seed2-t116-Qwen-Image-2.1-PE-I2I-convrot-int8

## Resumen

Este repositorio contiene una cuantización INT8 del modelo `rockerBOO/Qwen-Image-2.1-PE-I2I-heretic-ara-seed2-t116`, que a su vez es una variante "decensurada" mediante la técnica Heretic ARA del modelo original `Qwen/Qwen-Image-2.1-PE-I2I` de Alibaba Qwen. Se trata de un modelo de reescritura de prompts para edición de imágenes (image-to-image), es decir, un componente auxiliar que transforma instrucciones de edición en lenguaje natural en prompts refinados que posteriormente consume el modelo generativo Qwen-Image-2.1. La pipeline declarada es `image-text-to-text`.

El autor, rockerBOO, publica esta versión como un único fichero safetensors de 11,9 GB pensado para su uso en ComfyUI, con el objetivo de reducir el peso del modelo original en BF16 (18,8 GB) manteniendo la coherencia de las reescrituras. La cuantización aplicada es INT8 con la técnica ConvRot (rotación de canales previa a la cuantización), grupo de 256 y escala por fila, aplicada únicamente a los pesos de atención y MLP del modelo de lenguaje, mientras que embeddings, `lm_head`, normalizaciones, convoluciones y el tower de visión permanecen en BF16.

Es relevante ahora por dos motivos: por un lado, permite ejecutar el rewriter de Qwen-Image-2.1 en GPUs de consumo con unos 12 GB de VRAM; por otro, la variante Heretic elimina parte de los filtros de contenido del modelo original, lo que tiene implicaciones legales y de uso que conviene evaluar antes de cualquier despliegue. La licencia heredada es Qwen Research, de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con tower de visión y modelo de lenguaje con atención híbrida (`self_attn` y `linear_attn`); detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (grupo 256, escala por fila) en pesos de atención y MLP; BF16 en embeddings, `lm_head`, norms, conv1d, `in_proj_a`, `in_proj_b` y tower de visión |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (uso no comercial, solo investigación y evaluación) |
| Formato de pesos | safetensors (fichero único de 11,9 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen-Image-2.1-PE-I2I, un modelo multimodal de tipo image-text-to-text que actúa como reescritor de prompts para el pipeline de edición de imágenes Qwen-Image-2.1. Según el layout de tensores descrito en la model card, el modelo de lenguaje combina capas de atención estándar (`self_attn` con q/k/v/o) con capas de atención lineal (`linear_attn` con `in_proj_qkv`, `in_proj_z`, `out_proj`, además de `in_proj_a` e `in_proj_b` y convoluciones 1D), lo que sugiere un diseño híbrido entre atención completa y atención lineal. Incluye además un tower de visión independiente que se mantiene en BF16 tras la cuantización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo original. La variante publicada por rockerBOO incorpora dos modificaciones sucesivas sobre el modelo base de Qwen: primero un proceso de "decensurado" mediante Heretic ARA (con semilla 2 y umbral t116, según el nombre del repositorio), y después la cuantización INT8 con ConvRot. La model card indica que la verificación realizada se limita a corrección funcional: el modelo carga en ComfyUI y produce reescrituras de prompt coherentes y cercanas a la fuente BF16 sobre un conjunto pequeño de prompts con decodificación greedy.

## Capacidades

- Reescritura de prompts de edición de imágenes: transforma instrucciones de edición en lenguaje natural en prompts refinados para el modelo generativo Qwen-Image-2.1.
- Procesamiento image-text-to-text: acepta entradas de imagen y texto según la pipeline declarada.
- Generación de texto condicionada por un system prompt (`system_prompt.txt` incluido en el repositorio).
- Integración con ComfyUI mediante el nodo `CLIPLoader` (tipo `moss_image`) y el nodo `TextGenerate`.
- Variante decensurada: la modificación Heretic ARA reduce los filtros de contenido del modelo original.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo thinking, visión, audio: solo se confirma el procesamiento de imagen y texto propio de la pipeline; no se detallan modos adicionales.

## Casos de uso

- Edición de imágenes asistida en ComfyUI: el modelo se coloca en `ComfyUI/models/text_encoders/`, se carga con `CLIPLoader` (tipo `moss_image`) y se conecta al nodo `TextGenerate` para reescribir la instrucción de edición antes de pasarla al generador de imágenes.
- Automatización de flujos de trabajo de edición por lotes: al ocupar unos 12 GB en VRAM (menos con offloading de ComfyUI), puede mantenerse cargado junto al modelo generativo en GPUs de 24 GB o superiores para procesar lotes de instrucciones de edición sin recargar pesos.
- Prototipado de interfaces de edición conversacional: el rewriter permite que el usuario escriba instrucciones coloquiales y el sistema las convierta en prompts técnicos adecuados para el modelo de difusión subyacente.
- Investigación sobre decensurado y alineación: la variante Heretic ARA permite estudiar cómo cambia el comportamiento del modelo al eliminar restricciones de contenido, comparándolo con el original de Qwen.
- Evaluación de técnicas de cuantización: el repositorio documenta el pipeline `convert_to_quant` con ConvRot, grupo 256 y escala por fila, lo que lo convierte en un caso de estudio reproducible para medir el impacto de INT8 en un modelo multimodal.
- Despliegue en estaciones de trabajo con GPU de consumo: cualquier GPU NVIDIA reciente con tensor cores INT8 puede alojar el modelo, sin requerir arquitectura Blackwell, lo que facilita pruebas locales de reescritura de prompts.
- Integración en pipelines de generación aumentada por recuperación de imágenes: el rewriter puede normalizar consultas de usuario antes de invocar el modelo de edición en un servicio interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación de benchmarks y que la comprobación se limita a corrección funcional con decodificación greedy sobre un conjunto pequeño de prompts.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12 GB para mantener el modelo completo en memoria; menos si se utiliza el offloading de ComfyUI.
- GPU recomendadas: cualquier GPU NVIDIA reciente con tensor cores INT8; no se requiere arquitectura Blackwell. No se especifican modelos concretos como A100, H100 o RTX 4090.
- GPU de consumo: el modelo cabe en GPUs con 12 GB o más de VRAM, siempre que soporten INT8 y se use ComfyUI con offloading si es necesario.
- Opciones de despliegue: ComfyUI con soporte de checkpoints cuantizados (`comfy_quant`), cargándolo mediante `CLIPLoader` (tipo `moss_image`) y el nodo `TextGenerate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (INT8 ConvRot) | no disponible | no disponible | safetensors INT8/BF16, 11,9 GB | Qwen Research (no comercial) | Decensurado con Heretic ARA y cuantizado |
| rockerBOO/Qwen-Image-2.1-PE-I2I-heretic-ara-seed2-t116 (BF16) | no disponible | no disponible | safetensors BF16, 18,8 GB | Qwen Research (no comercial) | Modelo fuente sin cuantizar |
| Qwen/Qwen-Image-2.1-PE-I2I | no disponible | no disponible | no disponible | Qwen Research (no comercial) | Modelo original de Qwen, con filtros de contenido |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia Qwen Research: uso exclusivamente para investigación y evaluación; queda prohibido el uso comercial.
- Modelo decensurado: la modificación Heretic ARA elimina parte de los filtros de contenido, lo que puede producir salidas inapropiadas u ofensivas y conlleva riesgos legales y reputacionales en producción.
- Sin evaluación de benchmarks: no hay datos objetivos de calidad más allá de una comprobación funcional con decodificación greedy sobre un conjunto pequeño de prompts.
- Riesgo de alucinación: no evaluado; al ser un modelo generativo de texto, puede producir reescrituras incorrectas o inventar detalles no presentes en la instrucción original.
- Idiomas soportados no especificados: no hay garantía de calidad en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no disponible: se desconoce el límite práctico para instrucciones largas o conversaciones multi-turno.
- Dependencia de ComfyUI con soporte `comfy_quant`: no funcionará en versiones de ComfyUI sin esa característica.
- Pesos modificados respecto al original: la model card indica que los pesos han sido alterados (decensurado y cuantizado) y que los avisos de atribución y modificación están en el fichero `NOTICE`.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rockerBOO/heretic-ara-seed2-t116-Qwen-Image-2.1-PE-I2I-convrot-int8
- Modelo base (BF16): https://huggingface.co/rockerBOO/Qwen-Image-2.1-PE-I2I-heretic-ara-seed2-t116
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- Paper de ConvRot: https://arxiv.org/abs/2512.03673
- Herramienta de cuantización `convert_to_quant`: https://github.com/silveroxides/convert_to_quant
