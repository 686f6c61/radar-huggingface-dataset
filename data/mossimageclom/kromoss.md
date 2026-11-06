# MOSSImageclom/Kromoss

## Resumen

Kromoss es un ajuste fino completo (*full fine-tune*) del modelo de difusión texto-a-imagen MOSS-Image-Base, desarrollado por OpenMOSS y publicado por el usuario MOSSImageclom. Se distribuye bajo licencia Apache 2.0 y está pensado para generar imágenes fotorrealistas de 1024 px a partir de descripciones textuales en inglés. Su principal aportación respecto al modelo base es la corrección de la falta de nitidez (*blurriness*) que presentaba MOSS-Image-Base, manteniendo exactamente la misma arquitectura, pipeline de inferencia, codificador de texto y VAE, de modo que funciona como reemplazo directo (*drop-in replacement*) en flujos ya existentes.

El modelo conserva la arquitectura de MOSS-Image-SFT: un transformer de difusión con *flow matching*, un codificador de texto Qwen3.5-9B y un VAE basado en el decodificador pequeño de FLUX.2. Cuenta con 5.082.308.624 parámetros y se ha entrenado sobre 320.000 imágenes a resolución de 1024 px; el checkpoint publicado corresponde a la actualización 5000 del ajuste fino con pesos EMA.

Junto con los pesos del modelo, el repositorio incluye una LoRA de destilación DMD de 8 pasos (`8-steps-dmd-lora.safetensors`) que permite reducir la inferencia de 50 pasos con CFG 3 a solo 8 pasos con CFG 1, sin rama negativa, lo que rebaja de forma notable el coste computacional en producción. También se ofrecen pesos en formato bf16 e int8 (ConvRot W8A8) listos para ComfyUI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con flow matching (MOSS-Image) |
| Parámetros totales | 5.082.308.624 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; codificador Qwen3.5-9B) |
| Tipos de cuantización | bf16 (transformer y text encoder), fp32 (VAE y ruido inicial), int8 ConvRot W8A8 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers y ficheros únicos para ComfyUI), LoRA safetensors fp32 |

## Arquitectura y entrenamiento

Kromoss emplea la misma arquitectura que MOSS-Image-SFT: un transformer de difusión entrenado con *flow matching* que opera sobre latentes producidos por un VAE (el decodificador pequeño de FLUX.2) y condicionado por un codificador de texto Qwen3.5-9B. El transformer y el codificador de texto se ejecutan en bfloat16, mientras que el VAE y el ruido inicial se mantienen en float32. El muestreo utiliza un sampler Euler de flow matching con *shift* 5 y, en el modelo completo, omisión de capas en la rama negativa (índice de capa 22).

El ajuste fino se realizó sobre 320.000 imágenes a 1024 px partiendo de MOSS-Image-Base, con el objetivo declarado de corregir la falta de nitidez del modelo base. El checkpoint publicado corresponde a la actualización 5000 con pesos EMA. No se especifican en la información disponible detalles sobre la composición del dataset, el uso de RLHF/DPO ni la estrategia de captions. Como complemento, la LoRA `8-steps-dmd-lora` se obtuvo mediante destilación DMD en espacio de datos (*data-space DMD distillation*) a partir de MOSS-Image-Base, con rango 128 y alpha 128 en las proyecciones `proj.{q,k,v,o,ffn_up_gate,ffn_down}` de cada bloque. El repositorio incluye además scripts (`convert_to_comfy.py`, `quantize_convrot.py`) que reproducen byte a byte los ficheros de referencia de Comfy-Org.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024 px a partir de prompts en inglés.
- Corrección de nitidez respecto a MOSS-Image-Base, con mejor definición de detalles finos.
- Inferencia rápida en 8 pasos con CFG 1 mediante la LoRA DMD incluida, sin rama negativa.
- Compatibilidad directa con el pipeline `MOSSImagePipeline` de diffusers (requiere diffusers >= 0.38, transformers >= 5.3, accelerate >= 1.10).
- Soporte nativo en ComfyUI con ficheros únicos en bf16 e int8 ConvRot.
- Conversión de cualquier carpeta `transformer/` de un fine-tune MOSS-Image al formato de fichero único de ComfyUI.
- Cuantización int8 W8A8 con rotación Hadamard de 256 anchos aplicada en línea sobre las activaciones.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento: es exclusivamente un modelo generativo de imagen.

## Casos de uso

- Generación de ilustraciones para marketing y contenido editorial: el modelo produce imágenes de 1024 px a partir de prompts descriptivos en inglés, adecuado para banners, cabeceras y material promocional donde se requiere nitidez en el detalle.
- Prototipado rápido de conceptos visuales: con la LoRA DMD se obtienen borradores en 8 pasos y CFG 1, lo que permite iterar sobre variantes de un concepto antes de lanzar una generación final de 50 pasos.
- Sustitución directa en pipelines existentes de MOSS-Image: al compartir arquitectura, pipeline, text encoder y VAE con MOSS-Image-SFT, los workflows de diffusers y ComfyUI ya configurados funcionan sin cambios, solo cambiando el checkpoint.
- Integración en ComfyUI para estudios de diseño: los ficheros `kromoss_bf16.safetensors` e `kromoss_int8_convrot.safetensors` se cargan con los nodos estándar (Load Diffusion Model, Load CLIP tipo `moss_image`, Load VAE) y la LoRA se aplica con LoraLoaderModelOnly a fuerza 1.
- Despliegue con memoria limitada: la variante int8 ConvRot (5,4 GB) reduce el espacio de pesos del transformer y permite ejecutar el modelo en GPUs con menos VRAM que la versión bf16, manteniendo compatibilidad con la LoRA.
- Creación de datasets sintéticos de imagen: la generación controlada por semilla (`manual_seed`) y resolución fija facilita producir lotes reproducibles de imágenes etiquetadas para entrenamiento o evaluación de otros sistemas.
- Personalización mediante fine-tunes propios: el script `convert_to_comfy.py` permite convertir un transformer ajustado por el usuario al formato de fichero único de ComfyUI, y `quantize_convrot.py` genera la versión int8 equivalente.

## Benchmarks y rendimiento

La model card incluye una evaluación parcial con PartiPrompts (100 prompts, puntuación CLIP ViT-L/14). Los resultados publicados son los siguientes:

| Modelo | Configuración | CLIP ViT-L/14 |
|---|---|---|
| MOSS-Image-Base | 50 pasos, CFG 3 | 27,19 |
| MOSS-Image-Base + LoRA | 8 pasos, CFG 1 | 27,53 |
| Kromoss | 5 (dato truncado en la información disponible) | no disponible |

No se han publicado en la información disponible resultados de Kromoss en otros benchmarks (FID, MMLU, HumanEval u otros), ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 63,5 GB e incluye múltiples variantes de pesos; el transformer bf16 y el text encoder Qwen3.5-9B deben residir en memoria a la vez, además del VAE en float32.
- Variante int8 ConvRot: el fichero del transformer pesa 5,4 GB, lo que reduce sustancialmente los requisitos de memoria frente a bf16.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del text encoder (9B) y del transformer, se requiere una GPU con suficiente VRAM para alojar ambos; no se confirma que quepa en GPUs de consumo.
- Opciones de despliegue: diffusers (`MOSSImagePipeline` con `custom_pipeline="pipeline_moss_image"` y `trust_remote_code=True`), ComfyUI (soporte nativo en master actual) y conversión a ficheros únicos para ComfyUI.
- Latencia y throughput: no disponibles. Se sabe que la LoRA DMD reduce la inferencia de 50 pasos a 8 pasos, pero no se publican tiempos absolutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kromoss | 5.082.308.624 | 1024 px | Apache 2.0 | Hugging Face, ComfyUI | Fine-tune de MOSS-Image-Base con corrección de nitidez y LoRA DMD de 8 pasos |
| MOSS-Image-Base | no disponible | 1024 px | no disponible en la información | Hugging Face (OpenMOSS-Team) | Modelo base; presenta falta de nitidez según el autor de Kromoss |
| MOSS-Image-SFT | no disponible | 1024 px | no disponible en la información | Hugging Face (OpenMOSS-Team) | Misma arquitectura y pipeline; Kromoss es reemplazo directo |
| FLUX.2 (decodificador VAE pequeño) | no disponible | no disponible | no disponible | no disponible | Solo se comparte el VAE, no es un modelo comparable en generación |

No se dispone de datos de benchmarks comparativos con modelos de otras familias (Stable Diffusion, FLUX completo, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Solo admite prompts en inglés; no se declara soporte multilingüe.
- Es un modelo de generación de imagen: no ofrece razonamiento, código, matemáticas, tool calling ni capacidades de agente.
- Riesgo de sesgos y estereotipos inherente a los datos de entrenamiento; no se documenta la composición del dataset ni medidas de mitigación.
- Riesgo de alucinación visual: puede generar elementos inexistentes o mal formados en escenas complejas, texto en imagen o composiciones con muchos objetos.
- El autor indica que el ajuste fino corrige la falta de nitidez del modelo base, pero no se publican métricas completas que lo cuantifiquen (la tabla de PartiPrompts aparece truncada).
- La LoRA DMD no debe fusionarse en los pesos bf16: el delta es cercano al paso de redondeo de bf16, por lo que debe aplicarse sin fusionar.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los componentes de terceros (Qwen3.5-9B, VAE de FLUX.2) pueden tener sus propias condiciones que conviene verificar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-03), por lo que no hay validación comunitaria ni reportes de producción.
- El identificador del autor en la model card (`lodestones/Kromoss`) no coincide con el ID del repositorio (`MOSSImageclom/Kromoss`), lo que puede causar errores al cargar el modelo con `from_pretrained`.

## Enlaces

- Hugging Face: https://huggingface.co/MOSSImageclom/Kromoss
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Ficheros para ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
