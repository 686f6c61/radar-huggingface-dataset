# ModelMixAI/modelmix-free15-yuki-lora

## Resumen

Yuki es un LoRA de personaje completo para Stable Diffusion XL (SDXL) desarrollado por ModelMixAI, orientado a la generación de imágenes de una VTuber de anime ficticia con identidad visual consistente. El adaptador fija rostro, peinado y estilo de vestuario de un único personaje, de modo que las imágenes generadas mantienen coherencia entre iteraciones. Se distribuye como parte de una colección de 20 LoRAs de personaje gratuitos, con un catálogo de pago complementario de piezas de cara, cuerpo, compañero y localización que se combinan entre sí.

El modelo es un adaptador LoRA de bajo rango entrenado sobre SDXL Nuclear (NuclearDiffusionSDXL3), un fine-tune de `stabilityai/stable-diffusion-xl-base-1.0`. El entrenamiento se realizó con tan solo 20 imágenes, lo que sitúa al adaptador en la categoría de LoRAs ligeros de personaje, con un peso recomendado de 0.9 (rango 0.8–1.0) y una etiqueta de activación específica (`mmx_free15_yuki_cy`). El repositorio ocupa 0.3 GB y contiene pesos en formato `.safetensors`.

Su relevancia es limitada y acotada: no es un modelo de lenguaje ni un sistema multimodal general, sino un artefacto de generación de imagen para pipelines de Stable Diffusion XL con fines de creación de personajes virtuales, influencers sintéticos o assets para proyectos de anime. La licencia es "other" con restricción explícita a uso personal, sin uso comercial, lo que condiciona su aplicabilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre difusión latente SDXL (UNet transformer) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SDXL tiene ~2.6B en UNet + ~817M en text encoders) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; el prompt se tokeniza con el text encoder de SDXL, límite 77 tokens por encoder) |
| Tipos de cuantizacion | no disponible (pesos LoRA en precisión original; compatible con cuantizaciones del modelo base, p. ej. fp16, fp8) |
| Idiomas soportados | no disponibles (los prompts se procesan en inglés por los text encoders de SDXL; el autor no declara idiomas) |
| Licencia | other (uso personal únicamente; sin uso comercial; prohibida la redistribución) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0.3 GB |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 (entrenado sobre SDXL Nuclear / NuclearDiffusionSDXL3) |
| Trigger word | `mmx_free15_yuki_cy` |
| Peso recomendado | 0.9 (rango 0.8–1.0) |
| Imagenes de entrenamiento | 20 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango inyectado en las capas de atención del UNet de SDXL, el modelo de difusión latente de Stability AI. SDXL combina un UNet de aproximadamente 2.6 mil millones de parámetros con dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG), y genera imágenes de 1024×1024 píxeles mediante difusión en el espacio latente. El LoRA modifica los pesos del UNet (y posiblemente de los text encoders) para sesgar la generación hacia el personaje Yuki sin alterar el resto de capacidades del modelo base.

El entrenamiento se realizó sobre SDXL Nuclear (NuclearDiffusionSDXL3), un fine-tune comunitario de SDXL, con un conjunto de solo 20 imágenes del personaje. No se especifican en la información disponible el número de pasos, la tasa de aprendizaje, el rango del LoRA ni la composición exacta del dataset. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un adaptador de difusión. La innovación principal es la modularidad: el autor plantea las piezas (personaje, cara, cuerpo, compañero, localización) como componentes combinables dentro de un mismo ecosistema.

## Capacidades

- Generación text-to-image de un personaje de anime consistente (rostro, pelo y vestuario) mediante la etiqueta `mmx_free15_yuki_cy`.
- Fijación de identidad visual entre imágenes, adecuada para series coherentes de un mismo personaje virtual.
- Combinación con otros LoRAs del ecosistema ModelMix (localizaciones, cuerpos, caras, compañeros) para componer escenas.
- Control del peso del adaptador (0.8–1.0) para modular la intensidad del personaje frente a la estética del modelo base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un adaptador de imagen.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales más allá de la generación de imagen.

## Casos de uso

- Creación de personajes virtuales para streaming: el LoRA permite generar un set coherente de avatares e ilustraciones de Yuki para usar como identidad visual de una VTuber ficticia, manteniendo el mismo diseño entre emisiones.
- Generación de assets para proyectos de anime o fan art: producción de ilustraciones consistentes del personaje para portadas, banners o ilustraciones promocionales, siempre dentro de uso personal según la licencia.
- Prototipado de influencers sintéticos: generación de imágenes de un personaje ficticio adulto para experimentar con narrativas de marca, limitado a uso no comercial.
- Composición de escenas con LoRAs de localización: combinando el personaje con piezas de entorno del catálogo ModelMix para generar al personaje en distintos contextos (estudio, exterior, interiores).
- Pruebas de pipelines de difusión: uso del adaptador como caso de prueba ligero (0.3 GB) para validar flujos de inferencia con SDXL, carga de LoRAs y control de pesos en herramientas como ComfyUI o Automatic1111.
- Educación y experimentación con LoRA: ejemplo práctico de adaptador de personaje entrenado con pocas imágenes (20) para estudiar el efecto del peso y la consistencia en modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas cuantitativas (FID, CLIP score, similitud de identidad, etc.) ni comparaciones con otros LoRAs de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el LoRA añade una sobrecarga mínima sobre SDXL. Con SDXL en fp16 se requieren aproximadamente 8–12 GB de VRAM para generar a 1024×1024; con cuantización fp8 o mediante optimizaciones (xformers, attention slicing) puede reducirse a 6–8 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para generación rápida a 1024×1024; RTX 3060 (12 GB) o RTX 4070 pueden ejecutar SDXL con optimizaciones.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más aplicando optimizaciones; en 6 GB puede requerir cuantización y resolución reducida.
- Opciones de despliegue: ComfyUI, Automatic1111 (WebUI), Forge, Diffusers (biblioteca de Hugging Face), InvokeAI. El formato `.safetensors` es compatible con todas ellas.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, de los pasos de muestreo y del sampler elegido (típicamente 20–30 pasos para SDXL).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModelMixAI/modelmix-free15-yuki-lora | LoRA de personaje | SDXL (Nuclear) | 20 imágenes | other (solo uso personal) | Hugging Face, gratis |
| LoRAs de personaje de Civitai (p. ej. personajes anime) | LoRA de personaje | SDXL / SD 1.5 | variable (decenas a cientos de imágenes) | variable (a menudo solo uso personal) | Civitai, gratis o de pago |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base completo | — | dataset LAION masivo | CreativeML Open RAIL++-M | Hugging Face, gratis |
| Fine-tunes de personaje tipo "consistent character" (p. ej. DreamBooth sobre SDXL) | Adaptador/fine-tune | SDXL | variable | variable | Hugging Face / comunitario |

No se dispone de datos de rendimiento comparativo (similitud de identidad, FID) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: uso personal únicamente; el uso comercial no está incluido y se prohíbe redistribuir, revender, compartir o resubir el archivo `.safetensors`.
- Prohibición explícita de representar personas reales o menores; todas las figuras son adultos ficticios generados por IA.
- Entrenado con solo 20 imágenes, lo que puede limitar la variedad de poses, expresiones y ángulos; el personaje puede degradarse fuera de las condiciones vistas en entrenamiento.
- Riesgo de sobreajuste al estilo del modelo base SDXL Nuclear, que puede condicionar la estética final.
- No es un modelo de lenguaje: no soporta razonamiento, código, matemáticas, tool calling ni agentes.
- Idiomas: los text encoders de SDXL están entrenados principalmente en inglés; los prompts en otros idiomas pueden degradar la calidad.
- Riesgo de alucinación visual: el modelo puede generar anatomía incorrecta, artefactos en manos o detalles inconsistentes, inherente a los modelos de difusión.
- Dependencia del ecosistema ModelMix: la combinación con piezas de pago requiere adquirirlas por separado en las tiendas del autor.
- Sin datos de benchmarks ni métricas de calidad publicadas, lo que dificulta evaluar su rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/ModelMixAI/modelmix-free15-yuki-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Tienda Payhip: https://payhip.com/modelmix
- Lemon Squeezy: https://modelmix.lemonsqueezy.com
- 3DIMLI: https://www.3dimli.com/store/modelmix
- Whop: https://whop.com/modelmix
