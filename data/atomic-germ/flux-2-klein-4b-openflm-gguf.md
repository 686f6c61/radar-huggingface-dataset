# Atomic-Germ/FLUX.2-Klein-4B-OpenFLM-GGUF

## Resumen

FLUX.2-Klein-4B-OpenFLM-GGUF es una cuantización GGUF del modelo de difusión FLUX.2-klein-4B desarrollado por Black Forest Labs. Este repositorio, publicado por Atomic-Germ, empaqueta el checkpoint original en formato GGUF de un solo archivo para su uso con la librería ggml y con ComfyUI-GGUF, aplicando la metodología Unsloth Dynamic 2.0 para preservar la precisión en las capas críticas. El modelo base es un transformer de flujo rectificado (*rectified flow*) de aproximadamente 3.875 millones de parámetros que unifica generación texto-a-imagen y edición imagen-a-imagen con múltiples referencias en una sola arquitectura compacta.

La relevancia de esta ficha radica en su orientación a despliegues locales y de baja latencia: el modelo original está diseñado para inferencia en menos de un segundo y cabe en torno a 13 GB de VRAM, lo que lo sitúa en el rango de GPUs de consumo como la RTX 3090 o la RTX 4070. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, algo poco habitual en modelos de generación de imagen de esta calidad.

Esta cuantización concreta está pensada para flujos de trabajo con ComfyUI y herramientas basadas en ggml, no para la API de Diffusers del modelo original. El repositorio ocupa 51,8 GB, lo que refleja que incluye múltiples variantes de cuantización del mismo checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow) para difusión, unificado texto-a-imagen e imagen-a-imagen |
| Parametros totales | 3.875.544.576 (~3,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | GGUF (metodología Unsloth Dynamic 2.0, con capas importantes en mayor precisión); variantes concretas no detalladas en la información disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (diffusion-single-file) |

## Arquitectura y entrenamiento

El modelo base FLUX.2-klein-4B es un transformer de flujo rectificado de 4 mil millones de parámetros que combina generación texto-a-imagen y edición imagen-a-imagen con múltiples referencias en una única arquitectura. La familia FLUX.2 [klein] está destilada para reducir el número de pasos de inferencia, con el objetivo declarado de alcanzar inferencia de extremo a extremo en menos de un segundo. El ejemplo de la model card utiliza 4 pasos de inferencia con `guidance_scale=4.0`, lo que confirma el carácter destilado del checkpoint.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están incluidos en la información proporcionada. La innovación destacable de esta publicación concreta es la cuantización con Unsloth Dynamic 2.0, que eleva la precisión de las capas consideradas importantes y emplea las herramientas de ComfyUI-GGUF (city96) para producir archivos GGUF de un solo archivo compatibles con ggml.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) en resoluciones como 1024x1024.
- Edición de imágenes (image-to-image) manteniendo coherencia con la imagen de entrada.
- Edición con múltiples referencias (multi-reference editing) en un solo modelo unificado.
- Inferencia rápida gracias a la destilación: el ejemplo oficial usa 4 pasos.
- Renderizado de texto dentro de la imagen, aunque el propio autor advierte que puede ser inexacto o distorsionado.
- Ejecución local en GPUs de consumo mediante cuantización GGUF.
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo de difusión, no un modelo de lenguaje.
- Capacidades multilingües limitadas al inglés según la metadata del repositorio.

## Casos de uso

- Generación de imágenes en local para desarrollo e iteración rápida: gracias a la cuantización GGUF y a los ~13 GB de VRAM del modelo base, un desarrollador puede ejecutar el modelo en una RTX 3090 o 4070 dentro de ComfyUI sin depender de servicios en la nube.
- Edición de imágenes en flujos de posproducción: el soporte image-to-image y multi-referencia permite modificar una imagen existente conservando el estilo o los sujetos de referencia, útil para retoque y variaciones de concepto.
- Prototipado de aplicaciones interactivas de imagen: la destilación a pocos pasos y la inferencia sub-segundo del modelo base lo hacen adecuado para interfaces donde el usuario espera respuesta inmediata.
- Generación de material visual para entornos de diseño y marketing: con licencia Apache 2.0 se puede integrar en productos comerciales sin obligaciones de atribución adicionales más allá de las de la licencia.
- Despliegue en edge o en estaciones de trabajo sin GPU de datacenter: el tamaño de 4B y la cuantización GGUF permiten ejecución en hardware de consumo, útil para demos y entornos offline.
- Investigación en modelos de difusión: el formato GGUF de un solo archivo y las herramientas de ComfyUI-GGUF facilitan experimentar con cuantizaciones y comparar precisión frente al checkpoint original en bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base requiere aproximadamente 13 GB de VRAM según la model card; las cuantizaciones GGUF reducen este requisito, aunque no se detallan cifras por variante en la información disponible.
- GPU recomendadas por el autor del modelo base: NVIDIA RTX 3090, RTX 4070 y superiores.
- Cabe en GPU de consumo: sí, según la model card del modelo base (RTX 3090/4070 y superiores).
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (city96), librería ggml; el modelo original también es compatible con Diffusers (`Flux2KleinPipeline`) y con la API de BFL.
- Latencia y throughput: el modelo base declara inferencia de extremo a extremo en menos de un segundo con 4 pasos; no se proporcionan cifras de throughput para esta cuantización concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-OpenFLM-GGUF (este) | ~3,9 B | 1024x1024 (ejemplo) | Apache 2.0 | GGUF | Cuantización comunitaria del modelo de BFL |
| FLUX.2-klein-4B (original) | ~3,9 B | 1024x1024 (ejemplo) | Apache 2.0 | safetensors (Diffusers) | Checkpoint oficial, ~13 GB VRAM, inferencia sub-segundo |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El modelo no está diseñado para proporcionar información factual; no debe usarse como fuente de hechos.
- El texto renderizado dentro de las imágenes puede ser inexacto o sufrir distorsiones.
- Como modelo estadístico, puede reproducir o amplificar sesgos presentes en los datos de entrenamiento.
- Puede no seguir fielmente las instrucciones del prompt; el seguimiento depende en gran medida del estilo de prompting.
- Idioma soportado limitado al inglés según la metadata del repositorio.
- Uso fuera de alcance prohibido por el autor del modelo base: contenido ilegal, explotación de menores, desinformación, datos personales identificables, acoso, imágenes íntimas no consentidas y decisiones automatizadas de alto riesgo.
- La licencia Apache 2.0 permite uso comercial, pero las restricciones de uso fuera de alcance del modelo base deben respetarse como guía ética; la model card aclara que nada en ella modifica la licencia.
- Esta es una cuantización comunitaria: no procede de Black Forest Labs y puede introducir degradación de calidad respecto al checkpoint original en bfloat16.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-step.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/Atomic-Germ/FLUX.2-Klein-4B-OpenFLM-GGUF
- Modelo base en HuggingFace: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Blog de Black Forest Labs sobre FLUX.2 [klein]: https://bfl.ai/blog/flux2-klein-towards-interactive-visual-intelligence
- Repositorio oficial de FLUX.2: https://github.com/black-forest-labs/flux2
- ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- Documentación de Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Diffusers: https://github.com/huggingface/diffusers
- API de BFL: https://bfl.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
