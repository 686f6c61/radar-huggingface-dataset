# Chungulus/flux-3-image-klein-comfy-Q8_0-GGUF

## Resumen

FLUX 3 Image Klein Comfy Q8_0 GGUF es una cuantización de 8 bits (formato GGUF, bloque Q8_0) del transformer de difusión destilado que forma parte del paquete oficial ComfyUI de FLUX 3 Image Klein, publicado por Black Forest Labs (BFL). El artefacto lo distribuye el usuario Chungulus como derivado comunitario independiente, no oficial ni respaldado por BFL. El transformer cuantizado contiene 5.548.681.984 parámetros y el repositorio ocupa 6,0 GB; el resto de componentes del paquete original (checkpoint base sin destilar, codificador de texto, upsampler de prompts y VAE) no se cuantizan en este repositorio y deben obtenerse del paquete fuente.

El modelo resuelve dos tareas: generación de imagen a partir de texto (text-to-image) y edición de imagen guiada por referencia (image-to-image), esta última declarada como pipeline principal en la ficha de Hugging Face. Su relevancia práctica está en que permite ejecutar el transformer de FLUX 3 en ComfyUI con un peso notablemente menor que el BF16 original, manteniendo el codificador de texto Qwen3-VL 4B y el VAE de FLUX 2 en su precisión original, lo que reduce los requisitos de VRAM sin recalificar los componentes sensibles a la calidad.

La información disponible no incluye datos de arquitectura interna, número de tokens de entrenamiento, composición del dataset ni resultados de benchmarks; la model card se limita a describir el proceso de cuantización, la integración con ComfyUI y una validación funcional mínima. La licencia aplicable es la FLUX Kommunity License, que impone condiciones de uso y distribución y no concede un uso comercial irrestricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (image transformer) destilado; arquitectura interna no detallada en la información disponible |
| Parametros totales | 5.548.681.984 (transformer cuantizado) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; el condicionamiento se realiza mediante codificador de texto Qwen3-VL 4B) |
| Tipos de cuantizacion | Q8_0 (GGUF, 8 bits por bloque); el paquete fuente es BF16 |
| Idiomas soportados | no disponible (el condicionamiento textual depende del codificador Qwen3-VL 4B, cuyos idiomas no se detallan) |
| Licencia | FLUX Kommunity License (license_name: flux-kommunity-license; license: other) |
| Formato de pesos | GGUF (un único archivo `flux-3-image-klein-comfy-Q8_0.gguf`); componentes acompañantes en safetensors BF16 |

## Arquitectura y entrenamiento

El artefacto es una cuantización del transformer de difusión destilado incluido en el paquete ComfyUI de FLUX 3 Image Klein de BFL. La model card no describe la arquitectura interna del transformer (tipo de atención, número de bloques, dimensión de embeddings ni mecanismo de condicionamiento), por lo que esos detalles deben consultarse en la documentación del modelo base. El proceso de cuantización se realizó convirtiendo los pesos BF16 originales a Q8_0, verificando cada tensor de origen durante la conversión y comprobando nombre y forma de cada tensor cuantizado. No se recuantizó ningún peso de baja precisión ni se aplicó calibración o matriz de importancia.

Los componentes acompañantes se mantienen en su precisión original: el codificador de texto `qwen3vl_4b_bf16.safetensors` (Qwen3-VL de 4B parámetros en BF16) y el VAE `flux2-vae.safetensors`. El modelo base es una variante destilada, lo que implica que el muestreo requiere menos pasos que un modelo no destilado; la configuración validada emplea 16 pasos con sampler Euler/simple y CFG 1.0. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el uso de RLHF/DPO ni innovaciones técnicas adicionales del modelo original.

## Capacidades

- Generación de imagen a partir de texto (text-to-image) con prompts cortos o descripciones de escena expandidas.
- Edición de imagen guiada por imágenes de referencia mediante ReferenceMultiLatent (image-to-image).
- Aceptación de prompts largos y detallados: la model card recomienda usar el upsampler de prompts del paquete original o un LLM de expansión de caption, o bien proporcionar directamente una descripción de escena completamente expandida.
- Integración nativa con ComfyUI mediante la extensión ComfyUI-GGUF y el nodo Unet Loader (GGUF); ComfyUI detecta la red FLUX3 real a partir de los nombres de tensor preservados.
- Condicionamiento textual multilingüe potencial a través del codificador Qwen3-VL 4B, si bien los idiomas concretos no están documentados en la información disponible.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo thinking; no es un modelo de lenguaje generativo y no se ejecuta con llama.cpp.

## Casos de uso

- Edición de imágenes en producción con ComfyUI: el transformer Q8_0 se carga con Unet Loader (GGUF) y las imágenes de referencia se conectan por ReferenceMultiLatent, lo que permite flujos de retoque y variación de imagen con un peso de 6 GB en lugar del BF16 completo.
- Generación de ilustraciones y concept art: con prompts expandidos mediante el upsampler o un LLM de caption, el modelo produce imágenes a partir de descripciones de escena detalladas, adecuado para iteración rápida en estudios pequeños.
- Creación de variaciones de producto: a partir de una foto de referencia se generan variantes de iluminación, encuadre o fondo manteniendo el sujeto, usando el pipeline image-to-image validado a 512 x 512 y 16 pasos.
- Prototipado de pipelines de difusión en equipos con VRAM limitada: la cuantización Q8_0 reduce el peso del transformer y permite desplegar el flujo completo en GPUs de consumo, manteniendo el codificador de texto y el VAE en BF16 para preservar la calidad del condicionamiento.
- Automatización de assets para marketing: integración en flujos de ComfyUI programáticos que generan banners o imágenes de campaña a partir de plantillas de prompt y referencias visuales.
- Investigación sobre cuantización de modelos de difusión: el repositorio incluye `validation.json` y `quantizatia-manifest.json` con los ajustes y herramientas fijadas, lo que facilita reproducir la conversión BF16→Q8_0 y comparar la fidelidad de la cuantización.
- Evaluación de calidad frente al BF16 original: los ejemplos de validación (text-to-image y edición) permiten una comprobación funcional rápida antes de adoptar la variante cuantizada en un flujo existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las comprobaciones realizadas son validaciones funcionales limitadas y no un benchmark ni una garantía de calidad de imagen sin cambios.

## Requisitos de hardware

- VRAM estimada para el transformer Q8_0: aproximadamente 5,5 GB solo para los pesos (5.548.681.984 parámetros a 8 bits); a ello se suman el codificador de texto Qwen3-VL 4B en BF16 (del orden de 8 GB) y el VAE de FLUX 2, por lo que el flujo completo requiere bastante más VRAM que el transformer por separado.
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño del conjunto (transformer Q8_0 más codificador de 4B en BF16 y VAE), se requiere una GPU con VRAM holgada; no hay datos oficiales de modelos concretos.
- ¿Cabe en GPU de consumo? El transformer Q8_0 por sí solo sí cabe en GPUs de consumo con 8 GB o más, pero el flujo completo con el codificador de texto en BF16 excede esa cifra; no se dispone de mediciones oficiales.
- Opciones de despliegue: ComfyUI con soporte nativo de FLUX3 y la extensión ComfyUI-GGUF (https://github.com/city96/ComfyUI-GGUF). El archivo GGUF se coloca en `ComfyUI/models/unet/` y se carga con Unet Loader (GGUF); el codificador de texto se carga con CLIPLoader tipo `flux3` y el VAE con VAELoader. No es compatible con llama.cpp.
- Latencia y throughput: no disponibles. La configuración validada usa 512 x 512, 16 pasos, sampler Euler/simple, CFG 1.0 y shift `log(16)` (alpha 16), pero no se publican tiempos de generación.

## Comparativa con modelos similares

| Modelo | Parámetros (transformer) | Formato | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein Comfy Q8_0 GGUF (este artefacto) | 5.548.681.984 | GGUF Q8_0 | Codificador Qwen3-VL 4B BF16 + VAE FLUX 2 | FLUX Kommunity License | Hugging Face, derivado comunitario |
| black-forest-labs/flux-3-image-klein-comfy (base) | 5.548.681.984 (BF16) | safetensors BF16 | Codificador Qwen3-VL 4B BF16 + VAE FLUX 2 | FLUX Kommunity License | Hugging Face, oficial de BFL |

No se dispone en la información proporcionada de datos sobre otros modelos comparables de la misma categoría (mismo tamaño o misma tarea) ni de sus parámetros, contexto, rendimiento o licencia, por lo que la comparativa se limita al modelo base del que deriva este artefacto.

## Limitaciones y advertencias

- Es un derivado comunitario independiente: no es una publicación oficial ni respaldada por Black Forest Labs, y los receptores obtienen sus derechos directamente de BFL bajo la FLUX Kommunity License, no mediante una sublicencia de Chungulus.
- La licencia FLUX Kommunity License impone condiciones de uso y distribución; la model card no formula ninguna reclamación de uso comercial irrestricto. Es obligatorio leer `LICENSE.md` y `NOTICE.md` antes de cualquier despliegue comercial.
- La validación es funcional y limitada: se generó una muestra text-to-image y una edición, pero no se garantiza que la calidad de imagen se mantenga sin cambios respecto al BF16 original.
- No se han publicado benchmarks ni comparaciones cuantitativas de calidad (FID, CLIP score u otras métricas) frente al modelo base.
- Riesgo de sesgos y alucinaciones visuales: no documentado en la información disponible; al ser un modelo de difusión, puede generar contenido inexacto o no fiel al prompt, pero no se aportan datos específicos.
- Dependencia de componentes externos: el codificador de texto, el VAE y el upsampler de prompts deben obtenerse del paquete fuente de BFL; el repositorio solo contiene el transformer cuantizado.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni generación de texto, y no debe usarse con llama.cpp.
- Los idiomas soportados no están documentados; el comportamiento multilingüe depende del codificador Qwen3-VL 4B y no está validado en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face (este artefacto): https://huggingface.co/Chungulus/flux-3-image-klein-comfy-Q8_0-GGUF
- Modelo base (BFL, paquete ComfyUI): https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Revisión concreta del paquete fuente citada en la model card: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy/tree/9d36114cf7a2e03a45c28f5cc4987d20ebfdb6c1
- Extensión ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Licencia FLUX Kommunity License: `LICENSE.md` en el repositorio del artefacto
- Aviso de modificación: `NOTICE.md` en el repositorio del artefacto
- Manifiesto de cuantización: `quantizatia-manifest.json` en el repositorio del artefacto
- Datos de validación: `validation.json` en el repositorio del artefacto
