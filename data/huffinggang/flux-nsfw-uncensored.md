# HuffingGang/Flux-NSFW-uncensored

## Resumen

HuffingGang/Flux-NSFW-uncensored es un adaptador LoRA sobre el modelo base black-forest-labs/FLUX.1-dev, desarrollado por el usuario HuffingGang. Su propósito declarado es minimizar las restricciones de censura en la generación de imágenes, permitiendo explorar los límites técnicos de los modelos de difusión mediante prompts variados. El repositorio tiene un tamaño de 0,7 GB y se distribuye bajo la licencia creativeml-openrail-m, que permite uso comercial con atribución. Está diseñado para cargarse como un adaptador LoRA sobre FLUX.1-dev, un modelo de texto a imagen de 12 mil millones de parámetros con arquitectura de transformer de difusión. La relevancia de este modelo radica en su enfoque en la "uncensura" dentro del ecosistema FLUX, aunque su uso conlleva consideraciones éticas y legales importantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre FLUX.1-dev (transformer de difusión) |
| Parametros totales | no disponible (tamaño del repo: 0,7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen, no usa contexto de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (lora.safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) diseñado para ser cargado sobre FLUX.1-dev, un modelo de difusión de texto a imagen de 12 mil millones de parámetros desarrollado por Black Forest Labs. FLUX.1-dev emplea una arquitectura de transformer de difusión (DiT) con un codificador de texto multimodal (T5 y CLIP) y genera imágenes de alta resolución. El adaptador LoRA modifica los pesos del modelo base para reducir la censura impuesta durante el entrenamiento original, permitiendo generar contenido que el modelo base rechazaría. No se proporcionan detalles sobre el proceso de entrenamiento del LoRA (datos, número de pasos, hiperparámetros), ni sobre la composición del dataset utilizado. El ejemplo de código muestra que se carga mediante `load_lora_weights` con el archivo `lora.safetensors`, lo que indica que es un adaptador compatible con la librería Diffusers.

## Capacidades

- Generación de imágenes a partir de prompts en inglés, con especial énfasis en contenido que el modelo base censuraría (desnudos, violencia, etc.).
- Compatible con el pipeline de Diffusers `AutoPipelineForText2Image` y con la carga de pesos LoRA mediante `load_lora_weights`.
- Soporta parámetros de generación estándar como `guidance_scale`, `num_inference_steps`, `width`, `height` y `negative_prompt`.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de visión adicional, ya que es un modelo puramente de generación de imágenes.
- El idioma soportado es únicamente inglés, según la etiqueta `language: en`.

## Casos de uso

- Investigación sobre límites de censura en modelos de IA: el modelo permite estudiar cómo los adaptadores LoRA pueden alterar las restricciones de contenido de un modelo base, útil para investigadores en seguridad y ética de IA.
- Generación de arte erótico o de desnudos artísticos: artistas pueden usar el modelo para crear obras que el modelo base rechazaría, siempre que cumplan con la legislación local.
- Pruebas de robustez de modelos de difusión: desarrolladores pueden evaluar hasta qué punto un LoRA puede eludir filtros de seguridad, ayudando a mejorar los sistemas de moderación.
- Creación de contenido para adultos en plataformas que lo permitan: el modelo puede integrarse en pipelines de generación de imágenes para nichos específicos, con las debidas advertencias legales.
- Educación sobre sesgos y censura en IA: el modelo sirve como ejemplo práctico de cómo los ajustes finos pueden cambiar el comportamiento de un modelo base.
- Desarrollo de herramientas de generación de imágenes sin restricciones para entornos de investigación controlados: el modelo puede utilizarse en entornos aislados para estudiar fenómenos como el "jailbreak" en modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como FID, CLIP score, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un LoRA sobre FLUX.1-dev, se requiere cargar el modelo base de 12B parámetros. En FP16, FLUX.1-dev necesita aproximadamente 24 GB de VRAM solo para los pesos, más memoria para la activación. Con cuantización (por ejemplo, 8 bits o 4 bits) se puede reducir a 12-16 GB, pero no se especifica soporte de cuantización para el LoRA.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, o GPUs de consumo con al menos 24 GB de VRAM (RTX 3090, RTX 4090). Con cuantización, podría ejecutarse en GPUs de 16 GB (RTX 4080, RTX 3080 Ti) si se usa el modelo base cuantizado.
- No cabe en GPUs de consumo de gama baja (8 GB o menos) sin técnicas agresivas de offloading.
- Opciones de despliegue: Diffusers (como en el ejemplo), y potencialmente vLLM o TGI si se adapta, aunque no se menciona. Para inferencia local, se puede usar `diffusers` con `torch.float16` y `device_map="auto"` para repartir la carga.
- Latencia y throughput: no disponibles. La generación de imágenes con FLUX.1-dev suele tomar varios segundos por imagen en GPUs de alta gama, pero no hay datos específicos para este LoRA.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Sin embargo, se puede comparar con el modelo base FLUX.1-dev y con otros adaptadores LoRA de "uncensoring" existentes en el ecosistema HuggingFace, aunque no se citan en la información proporcionada. La comparativa más relevante sería con el propio FLUX.1-dev, que tiene restricciones de contenido, y con otros LoRA como `Heartsync/Flux-NSFW-uncensored` (que aparece en el código de ejemplo como referencia, aunque no se confirma si es el mismo modelo). No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está diseñado para generar contenido explícito, lo que puede violar las políticas de uso de plataformas, leyes locales y normas éticas. Su uso debe limitarse a entornos legales y controlados.
- No se garantiza la calidad ni la coherencia de las imágenes generadas; el modelo puede producir resultados perturbadores, ofensivos o ilegales.
- La licencia creativeml-openrail-m permite uso comercial, pero no exime de responsabilidades legales sobre el contenido generado.
- No hay información sobre sesgos específicos del modelo, pero al basarse en FLUX.1-dev, puede heredar sesgos de género, raza y cultura presentes en los datos de entrenamiento originales.
- Riesgo de alucinación visual: el modelo puede generar elementos no solicitados o distorsiones anatómicas, especialmente en escenas complejas.
- El idioma soportado es solo inglés; los prompts en otros idiomas pueden no funcionar correctamente.
- No se proporcionan garantías de que el modelo elimine completamente la censura; puede haber límites técnicos que provoquen fallos o rechazos.
- Para producción, es crucial implementar filtros de moderación adicionales y cumplir con las normativas de protección de menores y consentimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HuffingGang/Flux-NSFW-uncensored
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-dev
- No se proporcionan otros enlaces (papers, blogs, repos, demos) en la información disponible.
