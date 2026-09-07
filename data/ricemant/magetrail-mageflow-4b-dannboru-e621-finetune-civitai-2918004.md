# RicemanT/MageTrail-MageFlow-4B-Dannboru-E621-Finetune-civitai-2918004

## Resumen

MageTrail es un finetune completo (full-finetune) del modelo MageFlow 4B de Microsoft, un modelo de texto a imagen (T2I) de código abierto. Desarrollado por RicemanT, este finetune busca demostrar el potencial de MageFlow 4B como base para ajustes finos a gran escala, adaptando el modelo a un estilo de ilustración basado en etiquetas Danbooru y E621. El modelo se entrenó sobre un conjunto de datos condensado de 41.000 imágenes y se publica como prueba de concepto (V0.1), con un presupuesto de entrenamiento de unos 130 dólares. Aunque la versión actual está subentrenada y es inestable, el autor destaca que la arquitectura subyacente aprende rápidamente y sin olvido de conocimiento.

El modelo base MageFlow 4B utiliza un text encoder Qwen 3 VL 4B y una VAE llamada MageVAE, con soporte de resolución nativa de 256 a 2048 píxeles. Según el autor, MageFlow es entre un 15% y un 20% más rápido en inferencia que NVIDIA Cosmos2/Anima, a pesar de tener 2.000 millones de parámetros más. MageTrail se publica en formato safetensors y requiere un entorno de inferencia compatible con modelos de difusión, como ComfyUI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (T2I) de Microsoft, base MageFlow 4B |
| Parámetros totales | 4 mil millones (4B) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | civitai-creator-permissions |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MageTrail es un full-finetune del modelo MageFlow 4B T2I de Microsoft. La arquitectura base incluye un text encoder Qwen 3 VL 4B, una VAE llamada MageVAE (destilada de Flux2VAE, que también puede usarse en inferencia) y soporte de resolución nativa de 256 a 2048 píxeles. El autor indica que MageFlow es entre un 15% y un 20% más rápido en inferencia que NVIDIA Cosmos2/Anima, a pesar de tener 2.000 millones de parámetros más.

El entrenamiento se realizó en 8 GPUs H100 HBM3 80GB durante 8 horas (64 horas-H100), con un presupuesto total de unos 130 dólares. Se usó un dataset de 41.000 imágenes condensadas para maximizar la diversidad, con un total de 326.656 muestras vistas a resolución 1024². La configuración incluyó learning rate 7e-6, scheduler Warmup -> Constant -> REX, precisión BF16 completa, optimizador AdamW8bit con sumación Kahan, weight decay 0.02 y timestep sampling Logit-Normal (shift 6, sigmoid scale 1.0). También se aplicaron técnicas de regularización como tag dropout (10%), caption dropout (5%), mezcla de captions en proporción 25/25/25/25 (solo etiquetas, solo lenguaje natural, etiquetas + lenguaje natural, lenguaje natural + etiquetas), barajado de etiquetas y captions, y un sistema de atribución de activación de artista ("Drawn by artistname").

## Capacidades

- Generación de imágenes a partir de prompts de texto, con soporte para etiquetas Danbooru y E621.
- Prompting mixto: combina etiquetas (tags) y lenguaje natural (NL) en el mismo prompt.
- Activación de estilo mediante el trigger "Drawn by artistname" para invocar artistas específicos, aunque en V0.1 el soporte es limitado.
- Resolución de salida nativa de 256 a 2048 píxeles.
- Integración con MageVAE, con la opción de usar Flux2VAE en inferencia.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio, al ser un modelo T2I.

## Casos de uso

- Generación de ilustraciones para personajes de anime y manga: el modelo puede producir imágenes de personajes usando etiquetas Danbooru, como se muestra en el ejemplo del prompt con M200 de Girls' Frontline.
- Creación de concept art para videojuegos: los prompts mixtos permiten describir escenas complejas, como una ciudad futurista densa con arquitectura detallada, útil para previsualizar entornos.
- Prototipado rápido de escenas urbanas: el prompt de ejemplo muestra una escena panorámica con grúas, edificios y antenas, lo que puede servir para diseñar fondos de nivel o ilustraciones de fondo.
- Investigación en fine-tuning de modelos de difusión: el proyecto sirve como prueba de concepto para evaluar la capacidad de MageFlow 4B de adaptarse a nuevos dominios con un presupuesto reducido.
- Generación de contenido para comunidades de arte online: el soporte de etiquetas E621 y Danbooru facilita la creación de imágenes alineadas con las convenciones de estas plataformas.
- Ajuste de estilo artístico: mediante el trigger "Drawn by artistname", se pueden explorar estilos de artistas concretos, aunque en V0.1 la cobertura es limitada.
- Generación de imágenes a alta resolución: con soporte nativo hasta 2048 píxeles, puede producir imágenes de mayor tamaño para impresión o web, siempre que el hardware lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README del autor menciona una comparación cualitativa de rendimiento en inferencia: MageFlow 4B es entre un 15% y un 20% más rápido que NVIDIA Cosmos2/Anima, y MageVAE supera a QwenVAE, quedando solo por detrás de Flux2VAE. Sin embargo, no se proporcionan cifras concretas de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo de generación de imágenes, no de texto.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 4.000 millones de parámetros. En BF16, los pesos ocupan aproximadamente 8 GB. Para inferencia a 1024x1024, se recomienda una GPU con al menos 12 GB de VRAM, aunque no se especifica en la información proporcionada.
- GPU recomendadas: el entrenamiento se realizó en GPUs NVIDIA H100 HBM3 80GB. Para inferencia, una RTX 3090/4090 de 24 GB o una A100 de 40/80 GB serían adecuadas.
- Compatibilidad con GPU de consumo: una RTX 4090 puede manejar el modelo, pero se desconoce el rendimiento exacto.
- Opciones de despliegue: ComfyUI es la herramienta recomendada por el autor, según las configuraciones de muestra. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas para modelos de lenguaje, no para modelos de difusión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El modelo es un finetune de MageFlow 4B, por lo que la comparación más directa es con el modelo base. El README también menciona NVIDIA Cosmos2/Anima y Flux2VAE como referencias, pero sin datos numéricos. A continuación se presenta una comparación cualitativa basada en la información disponible.

| Modelo | Parámetros | Tipo | Licencia | Notas |
|---|---|---|---|---|
| MageTrail (V0.1) | 4B | T2I finetune | civitai-creator-permissions | Subentrenado, inestable, para prueba de concepto |
| MageFlow 4B (base) | 4B | T2I | No disponible | Modelo original de Microsoft, más rápido que Cosmos2/Anima |
| NVIDIA Cosmos2/Anima | No disponible | T2I | No disponible | Comparado en velocidad por el autor, 15-20% más lento que MageFlow |
| Flux2VAE | No disponible | VAE | No disponible | VAE de referencia, mejor que MageVAE según el autor |

## Limitaciones y advertencias

- V0.1 está subentrenado e inestable: el autor indica que muchas etiquetas y conceptos no funcionan correctamente.
- Soporte limitado de artistas y personajes: el trigger "Drawn by artistname" apenas funciona en V0.1.
- Riesgo de alucinación visual: al ser un modelo de difusión subentrenado, puede generar artefactos, anatomías incorrectas o elementos no solicitados.
- Licencia: la licencia "civitai-creator-permissions" es una licencia personalizada de Civitai. No se especifica si permite uso comercial; es necesario revisar los términos en el enlace de Civitai.
- El modelo es un mirror de un modelo de Civitai, lo que puede implicar restricciones adicionales de distribución o uso.
- No se proporcionan datos de benchmarks ni métricas de calidad, por lo que no se puede evaluar objetivamente su rendimiento frente a otros modelos.
- El autor solicita donaciones para continuar el entrenamiento; la versión actual no es apta para producción.

## Enlaces

- HuggingFace: https://huggingface.co/RicemanT/MageTrail-MageFlow-4B-Dannboru-E621-Finetune-civitai-2918004
- Civitai (modelo original): https://civitai.com/models/2918004
- Repositorio del trainer: https://github.com/RicemanT/diffusion-pipe-mageflow-ft
- Config de entrenamiento: https://github.com/RicemanT/model-training-configs/blob/main/diffusion-pipe/MageFlow/configs/V0.1/mage_flow_BooruEssenceFFT.toml
- Config de dataset: https://github.com/RicemanT/model-training-configs/blob/main/diffusion-pipe/MageFlow/configs/V0.1/mage_flow_BooruEssenceDataset.toml
- Modelo base MageFlow: https://huggingface.co/mage-flow-community/Mage-Flow
- Sitio web de MageFlow AI: https://mageflow.net/
