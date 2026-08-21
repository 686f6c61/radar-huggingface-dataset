# eastmoe/SenseNova-U1.5-8B-MoT

## Resumen

SenseNova-U1.5-8B-MoT es un modelo multimodal nativo unificado desarrollado por SenseNova, que integra comprensión, razonamiento y generación de imágenes y texto en una única arquitectura monolítica, sin depender de adaptadores entre modalidades. La versión publicada por el usuario eastmoe en Hugging Face es una conversión de los pesos originales al formato de checkpoints y LoRA de ComfyUI, lo que permite utilizar el modelo directamente en flujos de trabajo de ComfyUI mediante un plugin específico. Esta conversión incluye varias precisiones de cuantización (BF16, FP32/BF16 mixto, INT8 y NVFP4) y un LoRA de 8 pasos de muestreo, facilitando su despliegue en diferentes configuraciones de hardware. El modelo base, SenseNova-U1.5-8B-MoT, se basa en la arquitectura NEO-unify, que procesa directamente píxeles y palabras sin codificadores de visión preentrenados ni decodificadores profundos, y está orientado a la creación visual con alta fidelidad y consistencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify (nativa unificada multimodal, sin codificadores de visión preentrenados) |
| Parametros totales | 8B (según denominación del modelo, no confirmado en la documentación disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP32/BF16 mixto, INT8 (int8_convrot), NVFP4 |
| Idiomas soportados | chino, inglés, japonés |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints de ComfyUI y LoRA) |

## Arquitectura y entrenamiento

El modelo base SenseNova-U1.5-8B-MoT emplea la arquitectura NEO-unify, que unifica el procesamiento de lenguaje y visión en un solo modelo autoregresivo. Según el paper de SenseNova-U1, se prescinde de codificadores de visión preentrenados y de decodificadores profundos, trabajando directamente con píxeles y palabras. Esto permite un entrenamiento más conciso y escalable. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO en la documentación proporcionada. La conversión de eastmoe mantiene los pesos originales y añade cuantizaciones para adaptarse a distintos hardware, así como un LoRA de 8 pasos que acelera el muestreo.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) y edición de imágenes mediante instrucciones (image-text-to-image).
- Comprensión multimodal nativa: el modelo procesa simultáneamente texto e imágenes sin adaptadores externos.
- Razonamiento visual y generación consistente con el contexto proporcionado.
- Soporte multilingüe para chino, inglés y japonés.
- Integración con ComfyUI mediante el plugin ComfyUI-Easy-SenseNova-U1, permitiendo flujos de trabajo visuales.
- No se ha confirmado soporte para tool calling, agentes o modos de pensamiento explícitos en la información disponible.

## Casos de uso

- Generación de ilustraciones y arte conceptual: el modelo puede crear imágenes detalladas a partir de prompts descriptivos en chino, inglés o japonés, siendo útil para diseñadores y artistas que trabajan con ComfyUI.
- Edición de imágenes con instrucciones: permite modificar fotografías o ilustraciones existentes mediante comandos de texto, como cambiar el estilo, añadir elementos o ajustar la composición.
- Creación de contenido para marketing y publicidad: generar variaciones de imágenes de producto o escenas promocionales de forma rápida y consistente.
- Prototipado visual en diseño de producto: los equipos pueden generar múltiples conceptos visuales a partir de especificaciones textuales sin necesidad de herramientas externas.
- Automatización de flujos de trabajo creativos: al integrarse en ComfyUI, se puede combinar con otros nodos para crear pipelines de generación, post-procesado y exportación.
- Investigación en modelos multimodales unificados: sirve como referencia para estudiar arquitecturas que integran comprensión y generación en un solo modelo, especialmente en entornos de experimentación con ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaños de archivo de los checkpoints: BF16 (33 GB), FP32/BF16 mixto (47 GB), INT8 (17 GB), NVFP4 (11 GB). La VRAM necesaria será similar o ligeramente superior al tamaño del archivo cargado.
- Para la versión NVFP4 se recomienda una GPU con al menos 12-16 GB de VRAM (por ejemplo, RTX 4080/4090, A100 40GB, etc.). En GPUs Blackwell se usa la multiplicación de matrices nativa; en otras, se realiza des-cuantización automática.
- La versión INT8 requiere aproximadamente 20 GB de VRAM, adecuada para GPUs como RTX 3090/4090 o A100.
- Las versiones BF16 y mixta requieren 40 GB o más de VRAM, por lo que se necesitan GPUs de gama alta como A100 80GB, H100 o múltiples GPUs (aunque las versiones pre-cuantizadas no soportan device_map multi-GPU).
- El LoRA de 8 pasos (778 MB) se puede cargar junto con el checkpoint, pero requiere que el modo de memoria del plugin sea "full" (no soporta el modo de descarga por capas).
- Despliegue: se utiliza el plugin ComfyUI-Easy-SenseNova-U1, que gestiona la carga del checkpoint y la aplicación del LoRA. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que el modelo está orientado a ComfyUI.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base SenseNova-U1.5-8B-MoT es una evolución de SenseNova-U1, pero no se han proporcionado datos de rendimiento ni especificaciones detalladas de otros modelos comparables.

## Limitaciones y advertencias

- La conversión es realizada por un tercero (eastmoe) y no es oficial de SenseNova; puede haber diferencias sutiles en el comportamiento respecto al modelo original.
- Las versiones pre-cuantizadas (INT8 y NVFP4) no soportan el uso de múltiples GPUs con device_map, lo que limita su escalabilidad en entornos multi-GPU.
- El LoRA de 8 pasos requiere que el plugin se configure en modo "full" de memoria; el modo de descarga por capas no es compatible con el parcheo de pesos de LoRA.
- Para usar NVFP4 es necesario instalar torchao>=0.16 compatible con la versión de PyTorch instalada.
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones de contexto del modelo base en la información proporcionada.
- La licencia del modelo no está especificada, por lo que se debe contactar con SenseNova para aclarar los términos de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eastmoe/SenseNova-U1.5-8B-MoT
- Modelo base oficial: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Repositorio del plugin ComfyUI: https://github.com/eastmoe/ComfyUI-Easy-SenseNova-U1
- Paper de SenseNova-U1: https://arxiv.org/html/2605.12500v1
- Página del modelo en ModelScope: https://www.modelscope.cn/models/SenseNova/SenseNova-U1.5-8B-MoT
