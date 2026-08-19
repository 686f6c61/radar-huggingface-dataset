# rzgar/Qwen3.8-27B-NVFP4-ComfyUI

## Resumen

El modelo `rzgar/Qwen3.8-27B-NVFP4-ComfyUI` es una conversión cuantizada del checkpoint `unsloth/Qwen3.8-27B-NVFP4`, adaptada específicamente para su uso dentro del ecosistema ComfyUI como nodo de generación de texto. El autor, rzgar, ha empaquetado el modelo en dos archivos `.safetensors` listos para colocarse en el directorio `ComfyUI/models/text_encoders/`, permitiendo cargar el modelo como un text encoder multimodal (image-text-to-text) sin necesidad de configuraciones adicionales.

La relevancia de este modelo radica en que facilita la integración de un LLM de 27B parámetros (basado en la familia Qwen3.8) en flujos de trabajo de ComfyUI, una herramienta muy utilizada para generación y edición de imágenes. Al estar cuantizado en NVFP4 (punto flotante de 4 bits de NVIDIA), reduce el tamaño del modelo a aproximadamente 22,6 GB o 16 GB según la variante, haciendo viable su ejecución en GPUs de consumo de gama alta. La model card destaca que el nodo oficial de ComfyUI para checkpoints cuantizados produce texto incoherente que nunca se detiene, por lo que el autor ha desarrollado un nodo personalizado que corrige este problema y soporta entradas de imagen y vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.8-27B |
| Parametros totales | 27B (según nombre del modelo base, no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (fuentes externas mencionan 262k, no confirmado) |
| Tipos de cuantizacion | NVFP4 (fp4) para MLP y vision tower (en una variante); FP8 (e4m3) para atención/linear-attn/lm_head en la variante principal; BF16 para embeddings en la variante principal |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos archivos: 22,6 GB y 16 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `Qwen/Qwen3.8-27B`, un LLM multimodal de la familia Qwen3.8 que acepta entradas de texto e imagen (y posiblemente vídeo, según la model card). La conversión realizada por rzgar se basa en la versión NVFP4 de unsloth, que utiliza cuantización de 4 bits en punto flotante (NVFP4) para las capas MLP, y combina FP8 o BF16 para otras partes del modelo según la variante elegida.

La model card detalla dos variantes: la principal (`...-nvfp4-comfy`) mantiene atención, linear-attn y lm_head en FP8, embeddings en BF16 y vision tower en BF16, replicando el diseño original de unsloth. La variante alternativa (`...-nvfp4-all-comfy`) cuantiza todas las capas a NVFP4, reduciendo el tamaño a 16 GB pero con menor precisión en atención y embeddings. No se proporcionan detalles sobre el entrenamiento original del modelo base, como número de tokens, composición del dataset o técnicas de alineación (RLHF/DPO). La conversión es únicamente de cuantización, sin reentrenamiento.

## Capacidades

- Generación de texto a partir de instrucciones, con soporte de chat mediante plantilla de conversación propia del modelo (el nodo personalizado aplica la plantilla correcta).
- Procesamiento de entradas multimodales: imágenes y vídeo, además de texto, según indica la model card del nodo personalizado.
- Integración nativa con ComfyUI: se carga como text encoder y se utiliza con el nodo "Generate Text" o el nodo personalizado "Generate Text (Qwen3.8)".
- Corrección del problema del nodo oficial: el nodo personalizado usa el lm_head real en lugar de la tabla de embeddings, produciendo texto coherente que termina en segundos en lugar de ejecutarse hasta `max_length`.
- Dos niveles de precisión: la variante principal ofrece mayor fidelidad en atención y embeddings (FP8/BF16), mientras que la variante "all" prioriza el tamaño reducido (16 GB) a costa de precisión.

## Casos de uso

- Generación de captions automáticas para imágenes dentro de un flujo de ComfyUI: el modelo puede recibir una imagen como entrada y generar una descripción textual que luego puede usarse como prompt para otros nodos de generación de imágenes.
- Edición de imágenes guiada por texto: al combinar el modelo con nodos de difusión, se pueden generar instrucciones de edición a partir de una imagen de referencia y un prompt del usuario, aprovechando la capacidad multimodal del modelo.
- Creación de flujos de trabajo de texto a imagen con refinamiento iterativo: el modelo puede actuar como un "crítico" que evalúa una imagen generada y sugiere modificaciones textuales para mejorar el resultado.
- Automatización de tareas de anotación de datasets visuales: el modelo puede procesar lotes de imágenes y generar etiquetas o descripciones estructuradas, integrándose en pipelines de preparación de datos.
- Asistente de prompts para artistas: los usuarios de ComfyUI pueden interactuar con el modelo para expandir o reformular sus prompts creativos, aprovechando el contexto multimodal de la imagen actual.
- Prototipado de aplicaciones de visión-lenguaje sin infraestructura adicional: al ejecutarse localmente en ComfyUI, permite experimentar con tareas de VQA (visual question answering) o grounding sin necesidad de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento del modelo cuantizado, ni comparativas con el modelo original o con otras cuantizaciones. Las fuentes externas mencionan que el modelo base Qwen3.8-27B tiene benchmarks publicados, pero no se han reproducido en esta ficha por no estar verificados.

## Requisitos de hardware

- Tamaño de archivo: 22,6 GB (variante principal) o 16 GB (variante "all"). El tamaño en VRAM será ligeramente superior al tamaño del archivo por overhead de runtime, por lo que se estima un mínimo de 24 GB de VRAM para la variante principal y 18-20 GB para la variante "all".
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), RTX 6000 Ada (48 GB), A100 40/80 GB, H100. La cuantización NVFP4 está optimizada para GPUs NVIDIA con soporte FP4 (arquitectura Blackwell o posterior, aunque puede ejecutarse en Ampere/Ada con emulación).
- No cabe en GPUs de consumo de 8-12 GB (como RTX 3060 o 4070) debido al tamaño del modelo.
- Opciones de despliegue: exclusivamente dentro de ComfyUI como text encoder. No se mencionan otros backends (vLLM, llama.cpp, etc.) para esta conversión específica.
- Latencia y throughput: no disponibles. La model card indica que las respuestas típicas "terminan en segundos" con el nodo personalizado, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso principal |
|---|---|---|---|---|---|
| rzgar/Qwen3.8-27B-NVFP4-ComfyUI | 27B | no disponible | NVFP4/FP8 | Apache 2.0 | ComfyUI text encoder |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | no disponible | NVFP4 | Apache 2.0 | Inferencia general con transformers/vLLM |
| Qwen/Qwen3.8-27B (original) | 27B | no disponible | BF16/FP16 | Apache 2.0 | Modelo base multimodal |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos para comparar con otros modelos de 27B de otras familias (por ejemplo, Llama 3.1 27B o Mistral Large) en esta ficha.

## Limitaciones y advertencias

- Conversión no oficial: el modelo es un trabajo de la comunidad (rzgar) y no está respaldado por Alibaba o unsloth. Puede contener errores de empaquetado o diferencias de comportamiento respecto al checkpoint original.
- Problema conocido con el nodo oficial de ComfyUI: el nodo "Generate Text" estándar produce texto incoherente que nunca se detiene. Es imprescindible usar el nodo personalizado `ComfyUI-Qwen3.8-Text` para un funcionamiento correcto.
- La cuantización NVFP4 introduce pérdida de precisión en comparación con el modelo en BF16, lo que puede afectar a tareas que requieren razonamiento numérico o generación de código. La variante "all" tiene aún más degradación por cuantizar atención y embeddings a FP4.
- No se especifican los idiomas soportados. El modelo base Qwen3.8-27B probablemente soporta múltiples idiomas, pero no hay confirmación en la model card.
- Riesgo de alucinaciones: como todo LLM, puede generar contenido falso o inventado, especialmente en tareas de captions o descripciones de imágenes.
- Requisitos de VRAM elevados: no apto para GPUs de consumo de gama media. Se necesita al menos 24 GB de VRAM para la variante principal.
- No se proporcionan detalles sobre el contexto máximo soportado. Las fuentes externas mencionan 262k, pero no está confirmado en la documentación del modelo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/rzgar/Qwen3.8-27B-NVFP4-ComfyUI)
- [Checkpoint base de unsloth](https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Nodo personalizado ComfyUI-Qwen3.8-Text (zip)](https://huggingface.co/rzgar/Qwen3.8-27B-NVFP4-ComfyUI/resolve/main/ComfyUI-Qwen3.8-Text/ComfyUI-Qwen3.8-Text.zip)
- [Guía de ejecución local (yottalabs.ai)](https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026)
- [Especificaciones y requisitos de hardware (yottalabs.ai)](https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026)
- [Guía de auto-hosting (swfte.com)](https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026)
