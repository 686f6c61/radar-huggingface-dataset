# lamin28/chloelee

## Resumen

El modelo `lamin28/chloelee` es un adaptador LoRA (Low-Rank Adaptation) entrenado con la técnica DreamBooth sobre el modelo base de difusión Krea 2, específicamente sobre el checkpoint RAW (`krea/Krea-2-Raw`). El objetivo de este LoRA es personalizar la generación de imágenes para representar a un sujeto concreto identificado con el token disparador `TOK`. Está publicado por el usuario `lamin28` y su repositorio ocupa 1.6 GB, con los pesos en formato safetensors.

La relevancia de este modelo radica en que aprovecha la arquitectura de Krea 2, que se distribuye en dos variantes: RAW (para fine-tuning) y Turbo (destilado, para inferencia rápida en 8 pasos sin guía clasificadora). Al entrenar el LoRA sobre RAW y aplicarlo sobre Turbo, se obtiene una generación personalizada de alta calidad con pocos pasos de inferencia. Es un ejemplo típico de adaptación de modelos de difusión para crear variantes de un personaje o estilo específico.

La ficha se basa exclusivamente en la información proporcionada por la model card y el repositorio; muchos detalles técnicos (dataset, pasos de entrenamiento, hiperparámetros) no se han hecho públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2 (modelo de difusión texto-imagen) |
| Parametros totales | no disponible (el repositorio pesa 1.6 GB en safetensors) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización específica declarada) |
| Idiomas soportados | no disponible (el prompt de ejemplo es en inglés, pero el modelo genera imágenes, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con DreamBooth sobre el checkpoint RAW de Krea 2. Krea 2 es un modelo de difusión de última generación que se publica en dos variantes: RAW (el modelo base no destilado, diseñado para fine-tuning) y Turbo (una versión destilada que requiere solo 8 pasos de inferencia y no necesita classifier-free guidance). La recomendación oficial es entrenar el LoRA sobre RAW y luego aplicarlo sobre Turbo para obtener resultados rápidos y de calidad.

El entrenamiento se realizó con el script de ejemplo de diffusers para Krea 2 (`examples/dreambooth/README_krea2.md`). No se han publicado detalles sobre el dataset de imágenes del sujeto, el número de pasos, la tasa de aprendizaje ni otros hiperparámetros. La única información disponible es que el token disparador es `TOK` y que los pesos se almacenan en formato safetensors.

## Capacidades

- Generación de imágenes personalizadas: el LoRA permite generar imágenes del sujeto entrenado (identificado como `chloelee`) usando el token `TOK` en el prompt.
- Compatibilidad con la inferencia rápida: al cargarse sobre Krea 2 Turbo, se puede generar con 8 pasos y `guidance_scale=0.0`, lo que reduce el tiempo de cómputo.
- Integración con la librería diffusers: se puede cargar mediante `Krea2Pipeline` y `load_lora_weights`, lo que facilita su uso en pipelines existentes.
- Soporte para ponderación, fusión y combinación de LoRAs según la documentación de diffusers (aunque no hay ejemplos específicos para este modelo).
- No se han documentado capacidades adicionales como tool calling, agentes o razonamiento multi-paso (no aplicable a un modelo de difusión).

## Casos de uso

- Creación de retratos personalizados: el LoRA puede generar imágenes del sujeto `chloelee` en distintos escenarios, estilos o composiciones usando el token `TOK`. Útil para artistas que quieran mantener la consistencia de un personaje en varias ilustraciones.
- Prototipado de personajes para videojuegos o cómics: al entrenar un LoRA sobre un personaje concreto, se pueden generar variaciones de poses, fondos y vestimenta sin volver a dibujar desde cero.
- Generación de contenido para redes sociales: permite producir imágenes de un personaje o influencer virtual de forma rápida y coherente, ideal para campañas de marketing o cuentas temáticas.
- Exploración artística: los usuarios pueden fusionar este LoRA con otros adaptadores para combinar estilos, siempre que se sigan las guías de ponderación de diffusers.
- Pruebas de concepto para estudios de diseño: antes de invertir en una sesión fotográfica, se pueden generar imágenes conceptuales del sujeto en diferentes entornos.
- Investigación en personalización de modelos de difusión: este LoRA sirve como ejemplo de fine-tuning eficiente con DreamBooth sobre Krea 2, útil para estudiar la transferencia de estilos y la consistencia de sujetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas objetivas como FID, CLIP score o comparaciones con otros LoRAs similares. El rendimiento cualitativo dependerá del sujeto entrenado y del prompt utilizado.

## Requisitos de hardware

- El LoRA en sí es ligero (1.6 GB), pero para la inferencia se necesita cargar el modelo base Krea 2 Turbo, cuyos requisitos de VRAM no se especifican en la documentación disponible.
- Se recomienda una GPU con al menos 12-16 GB de VRAM para ejecutar Krea 2 Turbo en precisión bfloat16, aunque no hay una cifra oficial.
- No se indica compatibilidad con GPUs de consumo específicas; se asume que funciona con tarjetas NVIDIA modernas (RTX 30xx/40xx) y también en entornos cloud (A100, H100).
- El despliegue se realiza mediante la librería diffusers de Hugging Face, que soporta aceleración por GPU (CUDA). También es posible usar otras herramientas que acepten LoRAs de diffusers, aunque no se mencionan.
- La inferencia con 8 pasos y sin guidance es relativamente rápida, pero el throughput exacto no se ha publicado.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRAs de DreamBooth para Krea 2 que permitan una comparación directa. La comparativa con otros modelos de personalización (como los LoRAs para Stable Diffusion XL o SD 1.5) no es posible sin datos objetivos de rendimiento. Por lo tanto, esta sección queda como "no disponible".

## Limitaciones y advertencias

- El modelo solo ha sido entrenado para representar a un sujeto concreto; fuera del token `TOK` puede no producir resultados coherentes o puede degradar la calidad de la generación.
- No se han documentado sesgos específicos, pero al ser un modelo de difusión entrenado con un dataset no público, puede reflejar sesgos del dataset original de Krea 2 o del conjunto de imágenes del sujeto.
- Riesgo de alucinación visual: en escenarios complejos o con prompts ambiguos, el modelo puede generar artefactos o inconsistencias anatómicas.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Krea 2, que no se detalla en esta ficha.
- No hay información sobre la composición del dataset de entrenamiento (número de imágenes, variedad de ángulos, iluminación, etc.), lo que limita la reproducibilidad y la evaluación de robustez.
- La model card original contiene marcadores `TODO` sin completar, lo que indica una documentación incompleta por parte del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lamin28/chloelee
- Perfil del autor: https://huggingface.co/lamin28/models
- Documentación de carga de LoRAs en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Guía de DreamBooth para Krea 2 en diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
