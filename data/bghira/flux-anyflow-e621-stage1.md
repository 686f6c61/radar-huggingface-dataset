# bghira/flux-anyflow-e621-stage1

## Resumen

`bghira/flux-anyflow-e621-stage1` es un adaptador LoRA (Low-Rank Adaptation) derivado del modelo de difusión de texto a imagen `black-forest-labs/flux.1-dev`, desarrollado por el usuario bghira. Este adaptador ha sido entrenado sobre un conjunto de datos de 65 536 imágenes procedentes de la plataforma e621, especializada en arte furry, con el objetivo de ajustar el comportamiento del modelo base hacia ese dominio estilístico y temático concreto. El resultado es un modelo capaz de generar imágenes en ese estilo con tan solo 2 pasos de inferencia, según la configuración de validación documentada.

La relevancia de este modelo radica en que demuestra un flujo de fine-tuning completo sobre FLUX.1-dev utilizando la herramienta SimpleTuner, con un entrenamiento de 14 000 pasos y una configuración de LoRA de rango 128. Al no entrenar el text encoder, el adaptador se integra fácilmente en pipelines de diffusers y puede combinarse con el modelo base sin necesidad de modificar el resto de componentes. Aunque su distribución es limitada (15 descargas), sirve como referencia técnica para quienes buscan adaptar FLUX a dominios específicos mediante LoRA.

El adaptador está pensado para un público adulto, dado el origen del dataset (e621), y su licencia se indica como "other", sin detalles adicionales sobre restricciones de uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión de FLUX.1-dev (DiT con flow matching) |
| Parametros totales | no disponible (rango LoRA: 128, alpha: 128, dropout: 0.0) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes, no texto) |
| Tipos de cuantizacion | no especificados; se sugiere cuantización opcional con optimum-quanto (qint8) |
| Idiomas soportados | no disponibles (el modelo base FLUX soporta principalmente inglés) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de FLUX.1-dev, un transformer de difusión (DiT) que emplea flow matching con una programación de ruido específica (`shift=3.0`) y guía de flujo constante (`flux_guidance_value=3.5`). El LoRA se aplica sobre todas las capas del transformer (`flux_lora_target=all`), con rango 128 y alpha 128, sin dropout. El text encoder del modelo base no se entrenó, por lo que se reutiliza tal cual durante la inferencia.

El entrenamiento se realizó con SimpleTuner durante 14 000 pasos, con un tamaño de lote efectivo de 4 (micro-batch 1, acumulación de gradientes 1) distribuido en 4 GPUs. Se usó el optimizador AdamW en precisión BF16 pura, con una tasa de aprendizaje constante de 6e-05 y 1000 pasos de warmup. El dataset, denominado `flux-e621-1024`, contiene 65 536 imágenes a resolución 1024x1024, recortadas aleatoriamente en formato cuadrado, sin datos de regularización. La probabilidad de descarte de captions fue del 0.1%.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) en el estilo del dataset de entrenamiento (arte furry).
- Soporte de image-to-image, según las etiquetas del repositorio.
- Inferencia rápida: la configuración de validación utiliza solo 2 pasos con el scheduler `AnyFlowValidationScheduler` (equivalente a FlowMatchEulerDiscreteScheduler).
- Compatibilidad total con el ecosistema diffusers: carga mediante `pipeline.load_lora_weights()`.
- Posibilidad de cuantización opcional del transformer a qint8 para reducir requisitos de VRAM, sin afectar al adaptador.
- El adaptador puede combinarse con el modelo base FLUX.1-dev sin necesidad de reentrenar el text encoder.

## Casos de uso

- Generación de ilustraciones furry personalizadas: el modelo permite crear imágenes de personajes antropomórficos con un estilo consistente, útil para artistas o comunidades que buscan un punto de partida rápido.
- Adaptación de FLUX a dominios visuales específicos: sirve como ejemplo práctico de cómo entrenar un LoRA sobre FLUX para un estilo concreto, replicable en otros dominios.
- Experimentación con fine-tuning de bajo rango: investigadores pueden estudiar el efecto de un LoRA de rango 128 sobre un modelo de difusión de gran tamaño, con 14 000 pasos y un dataset masivo.
- Prototipado de pipelines de generación con pocos pasos: al funcionar con 2 pasos de inferencia, es adecuado para entornos donde la latencia es crítica, como aplicaciones interactivas.
- Creación de contenido para juegos o narrativa visual: el estilo furry puede aplicarse a personajes o escenas en proyectos de entretenimiento.
- Evaluación de la transferencia de estilo: permite comparar la calidad de la adaptación frente al modelo base y otros LoRA entrenados con diferentes configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos objetivos sobre métricas como FID, CLIP score o comparaciones cuantitativas con otros adaptadores. El único dato de rendimiento indirecto es la validación con 2 pasos de inferencia y CFG 3.5, que sugiere una convergencia rápida, pero no se aportan métricas numéricas.

## Requisitos de hardware

- VRAM estimada: el modelo base FLUX.1-dev en BF16 requiere aproximadamente 24 GB de VRAM. Con la cuantización opcional a qint8 del transformer, puede reducirse a unos 12-16 GB, dependiendo de la resolución de salida.
- GPU recomendadas: para inferencia sin cuantizar, se necesitan GPUs profesionales como A100 (40/80 GB) o H100. Con cuantización, es viable en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). También se menciona soporte para MPS (Apple Silicon) y CPU, aunque con rendimiento muy inferior.
- Opciones de despliegue: el ejemplo oficial usa diffusers con PyTorch. Se puede integrar con vLLM o TGI si se adapta, aunque no se documenta. Para despliegue ligero, se podría convertir a GGUF con herramientas como `llama.cpp` (si se soporta el formato), pero no hay indicación de ello.
- Latencia y throughput: no se proporcionan datos. Con 2 pasos de inferencia, la generación de una imagen 1024x1024 en una GPU moderna debería ser inferior a 2 segundos, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No disponible. Este adaptador es un LoRA específico para un dominio concreto (arte furry) y no existen modelos comparables públicos con la misma finalidad y configuración. Se podría comparar con otros LoRA de FLUX entrenados sobre otros datasets, pero no se dispone de información sobre ellos en la documentación proporcionada.

## Limitaciones y advertencias

- Contenido explícito: el dataset e621 contiene material NSFW y el modelo puede generar imágenes de ese tipo. No es apto para todos los públicos y requiere control de acceso en entornos de producción.
- Licencia restrictiva: la licencia se indica como "other" sin especificar términos. No se garantiza su uso comercial ni la redistribución. Se recomienda contactar al autor antes de cualquier uso profesional.
- Sesgo del dataset: al entrenarse exclusivamente con imágenes de e621, el modelo puede presentar un sesgo estilístico y temático muy marcado, limitando su generalización a otros dominios.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar artefactos o incoherencias en detalles finos, especialmente con prompts complejos o fuera del dominio de entrenamiento.
- Dependencia del modelo base: el adaptador requiere FLUX.1-dev, que tiene su propia licencia (FLUX.1-dev non-commercial license). El uso comercial del adaptador está condicionado a la licencia del modelo base.
- Sin soporte multilingüe explícito: el text encoder de FLUX está optimizado principalmente para inglés; prompts en otros idiomas pueden producir resultados subóptimos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bghira/flux-anyflow-e621-stage1
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/flux.1-dev
- Herramienta SimpleTuner (mencionada en el entrenamiento): https://github.com/bghira/SimpleTuner (no confirmado en la documentación, pero es la herramienta referenciada)
