# AcademiaSD/Z-Image-NF4-for-LoRA-Training

## Resumen

Z-Image NF4 for LoRA Training es una cuantización de 4 bits (NF4, mediante bitsandbytes) del modelo base de generación de imágenes Tongyi-MAI/Z-Image, publicada por AcademiaSD. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de almacenamiento pensado para entrenar LoRAs sobre Z-Image en GPUs de consumo, reduciendo el peso en disco de 20,5 GB a 5,9 GB y permitiendo entrenamiento desde 8 GB de VRAM.

El repositorio incluye el transformer de 6B con las capas de atención y MLP pre-cuantizadas en NF4, mientras que los embedders, la capa final y la modulación adaLN se mantienen en BF16. El text encoder es Qwen3-4B, también cuantizado en NF4 y sin `lm_head`; el VAE, el tokenizer y el scheduler son idénticos a los del modelo original.

Su relevancia es práctica: elimina la barrera de VRAM para el ajuste fino con LoRA de un modelo de difusión de 6B, integrándose directamente en el trainer AcademiaSD LoRAlab Trainer Studio, que descarga el repositorio automáticamente en el primer uso y exporta las LoRAs en formato diffusers compatible con ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Z-Image, 6B) con text encoder Qwen3-4B; cuantización NF4 sobre bitsandbytes |
| Parametros totales | 6B en el transformer; text encoder Qwen3-4B (no se indica el total combinado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 de 4 bits (bitsandbytes) en atención y MLP del transformer y en el text encoder; BF16 en embedders, capa final, adaLN y normas |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; transformer en formato de caché pre-cuantizada por capas (un `.safetensors` por capa más `others.safetensors`, `index.json` y `metadata.json`), no es un checkpoint estándar de diffusers |

## Arquitectura y entrenamiento

El modelo subyacente es Z-Image, un transformer de difusión de 6B parámetros para text-to-image desarrollado por Tongyi-MAI, acompañado de un text encoder Qwen3-4B (sin `lm_head`) y un VAE. Esta publicación no altera la arquitectura: sustituye la precisión de almacenamiento de las capas de atención y MLP del transformer y del text encoder por NF4 pre-cuantizado con bitsandbytes, dejando en BF16 los embedders, la capa final, la modulación adaLN y las normas. El resultado son 3,4 GB para el transformer y 2,7 GB para el text encoder, frente a los 20,5 GB del modelo original.

El transformer no se distribuye como checkpoint convencional de diffusers, sino como una caché por capas: el trainer construye un `ZImageTransformer2DModel` vacío a partir de `config.json` y lo rellena desde esa caché, de modo que el transformer en BF16 nunca se descarga ni se carga en memoria. El conversor que genera este formato es `tools/zimage/5_conversor_ZImage_NF4.py` del repositorio del trainer. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni las etapas de alineación (RLHF/DPO) de Z-Image en la información proporcionada.

## Capacidades

- Generación de imágenes text-to-image mediante el pipeline `ZImagePipeline` de diffusers, en inglés.
- Entrenamiento de LoRAs sobre Z-Image en GPUs de consumo, con exportación en formato diffusers (`transformer.<layer>.lora_A` / `lora_B` más `alpha`).
- Compatibilidad de las LoRAs entrenadas con Z-Image-Turbo, ya que comparte las mismas capas.
- Generación de texto legible en las imágenes: según el autor, las imágenes producidas con el transformer NF4 son visualmente equivalentes a BF16 en sujeto, composición y texto legible.
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo de difusión, no un LLM.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Entrenamiento de LoRAs de personaje o estilo en GPUs de consumo: con ~5,5 GB de VRAM medidos en una RTX 5080 a 512×512 y rank 8, permite ajustar LoRAs en tarjetas de 8 GB o más sin recurrir a servicios en la nube.
- Prototipado rápido de conceptos visuales: el bajo peso en disco (5,9 GB) y la descarga automática por parte del trainer reducen el tiempo de puesta en marcha de un experimento de fine-tuning.
- Integración en pipelines de ComfyUI: las LoRAs exportadas en formato diffusers se cargan directamente en ComfyUI, lo que permite entrenar en el trainer y desplegar la inferencia en el mismo ecosistema.
- Reutilización de LoRAs entre Z-Image y Z-Image-Turbo: al compartir capas, una LoRA entrenada con este paquete puede aplicarse a la variante Turbo para generación más rápida.
- Formación y docencia: el requisito de VRAM reducido hace viable enseñar fine-tuning de modelos de difusión en laboratorios con hardware limitado.
- Investigación sobre cuantización en entrenamiento: sirve como caso práctico para evaluar el impacto de NF4 en la calidad de LoRAs frente a BF16, comparando resultados con el mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una medición de entrenamiento: en una RTX 5080, a 512×512 y rank 8, aproximadamente 5,5 GB de VRAM y unos 0,9 s por paso.

## Requisitos de hardware

- VRAM para entrenamiento: desde 8 GB según el autor; ~5,5 GB medidos en RTX 5080 a 512×512 con rank 8.
- VRAM para inferencia: no disponible (el autor recomienda usar el modelo original en BF16 para inferencia).
- GPU recomendadas: NVIDIA con soporte de bitsandbytes; el caso medido es una RTX 5080. No se especifican otros modelos (A100, H100, RTX 4090).
- GPU de consumo: sí, el objetivo declarado es entrenar en GPUs de consumo desde 8 GB.
- Despliegue: AcademiaSD LoRAlab Trainer Studio para entrenamiento; ComfyUI para inferencia con las LoRAs exportadas. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: ~0,9 s por paso de entrenamiento en RTX 5080 a 512×512, rank 8; no se reportan datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Z-Image NF4 for LoRA Training (este) | 6B transformer + Qwen3-4B | no disponible | NF4 + BF16 | apache-2.0 | Entrenamiento de LoRA en consumo |
| Tongyi-MAI/Z-Image | 6B transformer + Qwen3-4B | no disponible | BF16 | apache-2.0 | Inferencia y fine-tuning de referencia |
| Z-Image-Turbo | mismas capas que Z-Image | no disponible | no disponible | no disponible | Generación rápida; compatible con las LoRAs entrenadas |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo para inferencia: el autor indica explícitamente que para generar imágenes se use el modelo original en ComfyUI.
- El transformer no es un checkpoint estándar de diffusers; requiere el trainer AcademiaSD o el conversor para cargarse.
- Solo soporta inglés (`en`) según la model card.
- Riesgo de alucinación visual y sesgos heredados del modelo base Z-Image; no se documentan evaluaciones de sesgo en esta publicación.
- La equivalencia visual con BF16 es una afirmación del autor, no un benchmark publicado.
- Licencia Apache 2.0, igual que el modelo original, sin restricciones adicionales documentadas para uso comercial.
- El repositorio tiene un mantenimiento mínimo (1 like, 136 descargas) y depende de un trainer de terceros; conviene verificar la compatibilidad de versiones de bitsandbytes y diffusers.
- No se documentan requisitos de contexto, latencia de inferencia ni límites de resolución más allá del caso medido a 512×512.

## Enlaces

- Hugging Face: https://huggingface.co/AcademiaSD/Z-Image-NF4-for-LoRA-Training
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image
- Trainer: https://github.com/AcademiaSD/AcademiaSD_LoRAlab-TrainerStudio
- YouTube: https://www.youtube.com/@Academia_SD
- Discord: https://discord.gg/Syuaduy678
- Ko-Fi: https://ko-fi.com/academiasd
