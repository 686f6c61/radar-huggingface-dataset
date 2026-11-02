# AcademiaSD/Wan22-T2V-A14B-NF4-for-LoRA-Training

## Resumen

Wan 2.2 T2V-A14B NF4 es una versión cuantizada en 4 bits (NF4) del modelo de generación de vídeo texto-a-vídeo Wan 2.2 T2V-A14B, desarrollado originalmente por Wan-AI (Alibaba) y redistribuido por AcademiaSD. El objetivo concreto de este repositorio no es la inferencia, sino el entrenamiento de LoRAs: permite ajustar adaptadores de bajo rango para vídeo e imagen de Wan 2.2 en GPUs de 16 GB de VRAM, algo inviable con los pesos originales en FP32.

La arquitectura subyacente es un modelo de difusión de vídeo de tipo transformer con dos expertos de 14.000 millones de parámetros cada uno (un total de 28.000 millones), que reparten el proceso de denoising: el experto de alto ruido (pasos con t ≥ 875) se encarga del layout y el movimiento, y el experto de bajo ruido se encarga del detalle, los rostros y el estilo. Cada experto ocupa 57 GB en FP32 en el repositorio original y 7,7 GB en esta versión NF4, lo que reduce drásticamente los requisitos de memoria.

El formato es propietario y no estándar: no se carga con `from_pretrained` de diffusers ni es un checkpoint de bitsandbytes al uso. Está pensado para el entrenador AcademiaSD LoRAlab Trainer Studio, que reconstruye cada experto vacío desde su configuración, sustituye las capas lineales por `Linear4bit` y las rellena desde los shards. Los LoRAs resultantes se guardan con los nombres de clave originales de Wan y se cargan en ComfyUI, Wan2GP y diffusers sobre los modelos Wan 2.2 T2V-A14B normales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para texto-a-video con dos expertos (alto y bajo ruido) |
| Parametros totales | 28.000 millones (2 expertos de 14.000 millones) |
| Parametros activos | no disponible (no es MoE; los dos expertos se usan secuencialmente en el denoising) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (4 bits, blocksize 64, estadisticas comprimidas) para capas lineales; BF16 para embeddings y proyeccion de salida; FP32 para normas y tablas de modulacion |
| Idiomas soportados | no disponible (el modelo base usa el text encoder UMT5-XXL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors particionados (12 shards por experto) con `index.json` y `config.json`; no compatible con `from_pretrained` |

## Arquitectura y entrenamiento

El modelo base Wan 2.2 T2V-A14B emplea un transformer de difusión para generación de vídeo condicionada por texto, dividido en dos expertos de 14.000 millones de parámetros. El pipeline reparte los pasos de denoising entre ambos: el experto de alto ruido procesa los pasos iniciales (t ≥ 875) y determina la composición y el movimiento, mientras que el experto de bajo ruido refina detalle, rostros y estilo. El text encoder es UMT5-XXL en BF16, y el VAE, tokenizer y scheduler se mantienen sin cambios respecto al repositorio original.

Esta versión NF4 no reentrena el modelo, sino que cuantiza las capas `nn.Linear` de los 40 bloques del transformer de cada experto mediante `bitsandbytes.functional.quantize_4bit` (blocksize 64), guardando junto a cada peso su `QuantState` empaquetado. Los embeddings de patch, timestep y texto, así como la proyección de salida, se conservan en BF16; las normas y las tablas `scale_shift_table` se mantienen en FP32, siguiendo la convención de `_keep_in_fp32_modules` de diffusers. El entrenador construye cada experto vacío desde su configuración, sustituye las capas por `Linear4bit` y las rellena desde los shards, de modo que el modelo BF16 completo nunca reside en memoria. El repositorio incluye además el código de conversión (`ensure_expert`) para regenerar esta carpeta desde el modelo original.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de prompts de texto (pipeline text-to-video).
- Entrenamiento de LoRAs de vídeo e imagen sobre Wan 2.2 en GPUs de 16 GB de VRAM.
- Entrenamiento independiente por experto: solo se descarga y entrena el experto seleccionado.
- Producción de LoRAs compatibles con ComfyUI, Wan2GP y diffusers sobre los modelos Wan 2.2 T2V-A14B estándar.
- Los LoRAs se guardan con los nombres de clave originales de Wan (`diffusion_model.blocks.N.…`), separados por experto (`_high_noise` / `_low_noise`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de difusión, no un LLM.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Entrenamiento de LoRAs de estilo visual en una RTX 4090 o similar con 16 GB: el formato NF4 reduce cada experto de 57 GB a 7,7 GB, lo que permite ajustar adaptadores de estética concreta (paletas, iluminación, grano) sin infraestructura de centro de datos.
- Creación de LoRAs de personajes o rostros: el experto de bajo ruido, que controla detalle y caras, se puede entrenar de forma aislada para capturar la identidad de un sujeto concreto y luego cargar el adaptador en ComfyUI.
- Ajuste de LoRAs de movimiento y composición: entrenando solo el experto de alto ruido se puede especializar el modelo en tipos de plano, cámara o coreografía sin tocar el resto del pipeline.
- Prototipado rápido de adaptadores en investigación: el formato permite iterar sobre datasets pequeños de vídeo en una sola GPU consumer, reduciendo el coste frente al ajuste completo del modelo.
- Integración en pipelines de producción de vídeo generativo: los LoRAs resultantes se cargan en los modelos Wan 2.2 estándar (no cuantizados) en ComfyUI o diffusers, de modo que el entrenamiento se hace en NF4 y la inferencia en precisión completa.
- Reproducibilidad y auditoría: el repositorio incluye el código de conversión (`ensure_expert`), lo que permite regenerar la cuantización desde el modelo original y verificar la integridad de los pesos.
- Formación y experimentación docente: al caber en 16 GB, permite montar talleres de entrenamiento de LoRAs de vídeo en estaciones de trabajo convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para entrenamiento: 16 GB, según indica el autor, suficiente para entrenar un experto a la vez en formato NF4.
- Tamaño en disco del repositorio: 27,3 GB (7,7 GB por experto NF4, 11,4 GB del text encoder UMT5-XXL en BF16 y 0,5 GB de VAE, tokenizer, scheduler y configuración).
- GPU recomendadas: no especificadas por el autor; por el requisito de 16 GB encajan RTX 4090, RTX 4080, A100 y H100, aunque solo las consumer de 16 GB o más son el objetivo declarado.
- Cabe en GPU consumer: sí, en aquellas con al menos 16 GB de VRAM.
- Opciones de despliegue: el modelo no es para inferencia directa; se usa a través de AcademiaSD LoRAlab Trainer Studio. Los LoRAs entrenados se despliegan en ComfyUI, Wan2GP y diffusers sobre Wan 2.2 T2V-A14B.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso principal |
|---|---|---|---|---|---|
| Wan 2.2 T2V-A14B NF4 (este) | 28.000 M (2×14.000 M) | no disponible | NF4 + BF16 + FP32 | Apache 2.0 | Entrenamiento de LoRAs en 16 GB |
| Wan-AI/Wan2.2-T2V-A14B-Diffusers (original) | 28.000 M (2×14.000 M) | no disponible | FP32 (57 GB por experto) | Apache 2.0 | Inferencia y entrenamiento completo |
| Otros modelos texto-a-vídeo open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otras alternativas de texto-a-vídeo no está disponible en la información proporcionada. La diferencia principal frente al modelo original es el formato: el original requiere mucha más memoria y está pensado para inferencia o ajuste completo, mientras que esta versión está optimizada exclusivamente para entrenar LoRAs en hardware limitado.

## Limitaciones y advertencias

- No es un checkpoint estándar de diffusers ni de bitsandbytes: `from_pretrained` no lo carga. Requiere el cargador específico del entrenador (`load_expert` en `scripts/wan22_model.py`).
- Solo sirve para entrenamiento; no está pensado para inferencia directa. Para generar vídeo hay que usar los LoRAs resultantes sobre el modelo Wan 2.2 T2V-A14B original.
- La cuantización NF4 introduce pérdida de precisión respecto al modelo en FP32, lo que puede afectar a la calidad del LoRA entrenado; no se han publicado evaluaciones cuantitativas de esta pérdida.
- Solo se entrena un experto a la vez, lo que obliga a gestionar por separado los adaptadores de alto y bajo ruido.
- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, es probable que arrastre los sesgos de sus datos de entrenamiento, no especificados.
- Riesgo de alucinación visual: no evaluado; como modelo generativo de difusión, puede producir contenido incoherente o no fiel al prompt.
- Idiomas soportados: no disponibles; el comportamiento multilingüe depende del text encoder UMT5-XXL del modelo base.
- Licencia Apache 2.0, que permite uso comercial, pero al ser un derivado de Wan 2.2 conviene revisar los términos del modelo original y de las dependencias (bitsandbytes, diffusers).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del formato ni de los resultados de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/AcademiaSD/Wan22-T2V-A14B-NF4-for-LoRA-Training
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- Entrenador AcademiaSD LoRAlab Trainer Studio: https://github.com/AcademiaSD/AcademiaSD_LoRAlab-TrainerStudio
