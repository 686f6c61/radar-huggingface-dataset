# lodestones/Kromoss

## Resumen

Kromoss es un modelo de difusión texto-a-imagen desarrollado por lodestones como fine-tune completo de OpenMOSS-Team/MOSS-Image-Base a 1024 px. Mantiene la misma arquitectura, pipeline de inferencia, codificador de texto Qwen3.5-9B y VAE FLUX.2 small decoder que MOSS-Image-SFT, por lo que funciona como reemplazo directo en proyectos que ya usan esa familia. Su objetivo principal es corregir la borrosidad del modelo base y ofrecer una variante lista para generar imágenes a 1024×1024 con prompts en inglés.

El transformer contiene 5.082.308.624 parámetros según los safetensors del repositorio, y el repo completo ocupa 28,4 GB. Se distribuye con licencia Apache-2.0 e incluye un LoRA de destilación DMD de 8 pasos que permite generar con 8 pasos y CFG 1, sin rama negativa, lo que reduce el coste de inferencia frente a los 50 pasos y CFG 3 del modelo completo.

Su relevancia actual está en que combina un fine-tune de calidad sobre una base abierta con un modo rápido de 8 pasos y integración en diffusers y ComfyUI. En PartiPrompts (100 prompts, CLIP ViT-L/14) Kromoss + LoRA obtiene 27,82, por encima de MOSS-Image-Base + LoRA (27,53) y de MOSS-Image-Base sin LoRA (27,19), aunque Kromoss sin LoRA baja a 26,88.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Desarrollador | lodestones |
| Tarea | texto-a-imagen |
| Arquitectura | Difusión texto-a-imagen con transformer (arquitectura MOSS-Image), sampler flow-matching Euler; codificador de texto Qwen3.5-9B y VAE FLUX.2 small decoder |
| Parámetros totales | 5.082.308.624 en los safetensors del repositorio; el pipeline incluye además el codificador Qwen3.5-9B y el VAE, cuyo desglose no se detalla |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (longitud del codificador Qwen3.5-9B no especificada) |
| Tipos de cuantización | bf16 para transformer y text encoder; fp32 para VAE y ruido inicial; LoRA en fp32. No se documentan GGUF, AWQ, GPTQ ni otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (diffusers); LoRA en safetensors; pipeline personalizado `pipeline_moss_image.py` |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base (fine-tune completo) |
| Resolución de entrenamiento | 1024 px |
| Checkpoint | Actualización 2000 del fine-tune, pesos EMA |
| LoRA rápido | `8-steps-dmd-lora.safetensors`, 8 pasos, CFG 1, rango 128/alpha 128, fp32 |

## Arquitectura y entrenamiento

Kromoss es un modelo de difusión para texto-a-imagen basado en un transformer, con el mismo diseño que MOSS-Image. El pipeline usa un codificador de texto Qwen3.5-9B para codificar prompts en inglés y un VAE FLUX.2 small decoder para pasar de latentes a píxeles. El muestreo documentado es flow-matching Euler con shift 5; el modelo completo usa 50 pasos, CFG 3 y omisión de capa 22 en la rama negativa, mientras que el LoRA de 8 pasos usa CFG 1 y no emplea rama negativa.

El entrenamiento es un fine-tune completo de todos los parámetros del transformer a 1024 px, con 128.000 imágenes y descarte de imágenes por debajo de 896². Se usa la receta de la etapa final del informe de MOSS-Image escalada a 64 imágenes por actualización: Muon-AdamW híbrido, lr 9e-6, warmup 200, timesteps logit-normal truncados, decaimiento de q/k-norm del bloque final a uno y EMA 0,999; los pesos publicados son los EMA de la actualización 2000. El LoRA incluido es una destilación DMD en espacio de datos de MOSS-Image-Base, con rango 128 y alpha 128 en `proj.{q,k,v,o,ffn_up_gate,ffn_down}` de cada bloque, en fp32 y con claves kohya. No se detalla la composición del dataset ni si hubo filtrado adicional por calidad, sesgo o derechos.

## Capacidades

- Generación texto-a-imagen a 1024×1024 con prompts en inglés.
- Modo de calidad: 50 pasos, CFG 3, shift 5 y omisión de capa 22 en la rama negativa.
- Modo rápido: 8 pasos, CFG 1 y sin rama negativa, aplicando `8-steps-dmd-lora.safetensors`.
- Integración con diffusers mediante `DiffusionPipeline` y `custom_pipeline="pipeline_moss_image"`; requiere `trust_remote_code=True`.
- Integración con ComfyUI mediante el plugin MOSS-Image.
- Reemplazo directo de MOSS-Image-SFT: misma arquitectura, pipeline, text encoder, VAE y layout de repositorio.
- Soporte de tool calling o function calling: no.
- Soporte de agentes y razonamiento multi-paso: no; es un modelo generativo de imágenes, no un LLM de propósito general.
- Capacidades multilingües: solo inglés declarado; no se documentan otros idiomas.
- Visión, audio o modo thinking: no disponibles; la entrada es texto y la salida es imagen.

## Casos de uso

- Previsualización de conceptos de arte y diseño: con 50 pasos y CFG 3 se pueden generar propuestas a 1024×1024 para revisión interna; el LoRA de 8 pasos permite iterar rápidamente sobre variantes antes de una pasada final de más calidad.
- Ilustración para blogs, landing pages y campañas: el modelo genera imágenes cuadradas de 1024 px con prompts en inglés, adecuadas para recursos web que luego se recortan o retocan; la licencia Apache-2.0 facilita su uso comercial, sujeto a los componentes de terceros.
- Prototipado en ComfyUI: el plugin de MOSS-Image permite encadenar el modelo con nodos de upscaling, segmentación o retoque; el LoRA de 8 pasos reduce el tiempo de cada iteración.
- Generación de assets para videojuegos o mundos virtuales: se pueden crear bocetos de entornos, objetos o personajes para moodboards; no sustituye a un artista, pero acelera la exploración visual.
- Creación de datasets sintéticos de imágenes: útil para aumentar datos de entrenamiento o pruebas de pipelines de visión por computador, con la advertencia de que no se documentan sesgos ni diversidad del dataset original.
- Evaluación comparativa de modelos texto-a-imagen: el modelo publica resultados en PartiPrompts con CLIP ViT-L/14, lo que permite reproducir la comparación con la familia MOSS-Image y medir el efecto del fine-tune y del LoRA.
- Demos educativas de difusión: el pipeline de diffusers y el LoRA de 8 pasos permiten mostrar el efecto de los pasos, CFG y destilación DMD en un taller o clase, siempre que se disponga de GPU con VRAM suficiente.
- Generación de imágenes para pruebas de interfaz: placeholders visuales a 1024 px para maquetas de aplicaciones, con la ventaja de que el modelo es abierto y se puede ejecutar en infraestructura propia.

## Benchmarks y rendimiento

PartiPrompts, 100 prompts, métrica CLIP ViT-L/14; mayor es mejor.

| Modelo | Configuración | CLIP ViT-L/14 |
|---|---|---|
| MOSS-Image-Base | 50 pasos, CFG 3 | 27,19 |
| MOSS-Image-Base + LoRA | 8 pasos, CFG 1 | 27,53 |
| Kromoss | 50 pasos, CFG 3 | 26,88 |
| Kromoss + LoRA | 8 pasos, CFG 1 | 27,82 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de razonamiento o código en la información disponible; no son aplicables a un modelo texto-a-imagen.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 28,4 GB. Solo el transformer de 5,08B en bf16 ocupa aproximadamente 10,2 GB; el codificador Qwen3.5-9B en bf16 añade unos 18 GB; el VAE en fp32 y las activaciones suman varios GB. Para cargar el pipeline completo en bf16 hacen falta, como mínimo, unos 40 GB de VRAM; 80 GB dan margen para 1024×1024 y lotes pequeños.
- GPU recomendadas: A100 40GB/80GB, H100 80GB, RTX 6000 Ada 48GB y L40S 48GB. Para el modo completo a 1024 px, 48 GB o más es lo prudente.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB no permite cargar todo el pipeline en bf16; sería necesario offload a CPU o una cuantización no documentada. El LoRA de 8 pasos reduce pasos, no VRAM.
- Opciones de despliegue: diffusers >=0.38, transformers>=5.3, accelerate>=1.10, safetensors>=0.6 y Pillow>=10; ComfyUI con el plugin MOSS-Image. vLLM, llama.cpp, Ollama y TGI no son aplicables a este modelo de difusión.
- Latencia y throughput: no disponibles; dependen de la GPU, la resolución, el número de pasos y si se usa el LoRA. No se publican mediciones.
- Paralelización: no documentada en la información proporcionada; no se confirma soporte de tensor parallelism, xDiT ni multi-GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Kromoss | 5.082.308.624 (transformer, safetensors) | No disponible | 1024 px | Apache-2.0 | HuggingFace | Fine-tune completo; LoRA de 8 pasos; CLIP 27,82 con LoRA |
| MOSS-Image-Base | No disponible | No disponible | No disponible | No disponible | HuggingFace | Base del fine-tune; CLIP 27,19 a 50 pasos y CFG 3 |
| MOSS-Image-SFT | No disponible | No disponible | No disponible | No disponible | HuggingFace | Misma arquitectura y layout; Kromoss es reemplazo directo |

No se dispone de datos verificables de alternativas como FLUX.2 o SD3.5 en la información proporcionada, por lo que no se incluyen cifras comparativas que no estén respaldadas. La comparación directa disponible es con la familia MOSS-Image.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; no hay evaluación de prompts en castellano ni en otros idiomas.
- Sesgos: no se documenta análisis de sesgos, composición demográfica ni procedencia de las 128.000 imágenes de entrenamiento.
- Alucinación visual: puede generar objetos, texto o atributos no solicitados; no se publica una evaluación de fidelidad a prompts más allá del CLIP de PartiPrompts.
- Texto en imágenes: no se documenta una evaluación específica de renderizado de texto; los prompts con letras o rótulos pueden fallar.
- Licencia: los pesos y el código incluido son Apache-2.0 según la model card; los componentes de terceros (Qwen3.5-9B, VAE FLUX.2) pueden tener licencias propias y deben revisarse para uso comercial.
- VRAM: el pipeline completo en bf16 ronda los 28,4 GB de pesos y no cabe en GPUs de consumo de 24 GB sin offload o cuantización no documentada.
- Cuantización: no se publican pesos GGUF, AWQ o GPTQ; el despliegue en entornos de baja VRAM no está soportado oficialmente.
- LoRA: no debe fusionarse en los pesos bf16; la model card indica aplicarlo sin merge porque el delta está cerca del paso de redondeo de bf16.
- Modo rápido: el LoRA de 8 pasos usa CFG 1 y no tiene rama negativa, lo que limita el control fino frente al modo de 50 pasos y CFG 3.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria ni resultados independientes.
- Resolución: entrenado a 1024 px; no se documentan otras resoluciones de entrenamiento.
- Tool calling y agentes: no soportados; no es un modelo de lenguaje general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lodestones/Kromoss
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
- Plugin de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Perfil del autor: https://huggingface.co/lodestones
- No se han encontrado papers, blogs o demos adicionales específicos de Kromoss en la búsqueda web.
