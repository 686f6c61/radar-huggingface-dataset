# ChrisColeTech/LTX-2.3-uncensored-fp8

## Resumen

LTX-2.3-uncensored-fp8 es una compilación de cuantizaciones del modelo LTX-2.3 22B de Lightricks, redistribuida por el usuario ChrisColeTech en Hugging Face. Se trata de una versión "uncensored" (sin censura) del modelo original, que incluye no solo el transformador principal sino también los text encoders (Gemma-3-12B), los VAEs de video y audio, las LoRAs de destilación y un upscaler espacial, todo organizado en un layout de archivos pensado para ejecución local. El nombre comercial indica 22B parámetros, aunque el dato real de safetensors es de 11.766.034.176 parámetros (aproximadamente 11.7B), lo que sugiere que la denominación "22B" corresponde al nombre del checkpoint de Lightricks y no al recuento exacto de pesos.

El modelo está diseñado para generación de video de texto a video (txt2video) e imagen a video (img2video), con soporte de audio sincronizado (aunque no se ejercita en el ejemplo de muestra) y modo destilado que permite generar video con solo 12 pasos de difusión. La relevancia actual radica en que ofrece una alternativa de generación de video sin restricciones de contenido para ejecutarse en GPU de consumo, como la RTX 5090 de 32 GB, algo poco habitual en este tipo de modelos. El repositorio pesa 164.4 GB en total, pero un conjunto funcional completo (transformador Q4_K_M + Gemma + conectores + VAE + LoRA) ocupa aproximadamente 27 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LTX-2.3 (Lightricks), transformer de difusion para video |
| Parametros totales | 11.766.034.176 (dato real safetensors; nombre comercial "22B") |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de video, no texto) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, FP8, INT8 (GGUF y safetensors) |
| Idiomas soportados | no disponible |
| Licencia | unknown (referir a licencia upstream de Lightricks) |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

LTX-2.3 es un modelo de difusion para video desarrollado por Lightricks, la compania detras de la app de edicion Facetune. La arquitectura es un transformer de difusion que opera en un espacio latente comprimido por un VAE de video, con un text encoder basado en Gemma-3-12B y un proyector multimodal para integrar las condiciones textuales. Este repositorio en concreto no es un reentrenamiento: son cuantizaciones de los pesos del modelo original, tanto de la linea "uncensored" (1.1) como de la "distilled" (1.0), redistribuidas junto con los componentes necesarios para ejecutarlas localmente.

El modelo esta destilado, lo que significa que ha sido entrenado para generar video en pocos pasos de difusion (12 pasos recomendados, frente a los 20-50 habituales en modelos no destilados) y no usa clasifier-free guidance (CFG). La destilacion se aplica mediante una LoRA obligatoria que se carga en tiempo de ejecucion; sin ella, el pipeline no arranca. El modelo soporta resolucion nativa de hasta 4K segun la documentacion de Lightricks, aunque la configuracion recomendada en este repo es 1024x576 para evitar problemas de desaturacion de color medidos por el autor.

## Capacidades

- Generacion de video a partir de texto (txt2video) e imagen (img2video).
- Generacion de video con audio sincronizado (el audio VAE esta incluido, aunque el sample de muestra no lo ejerce).
- Modo destilado con generacion en 12 pasos de difusion (frente a los 20-50 de modelos no destilados).
- Soporte de upscaling espacial 2x mediante un modelo dedicado incluido en el repositorio.
- Capacidad de generar video en resoluciones desde 768x512 hasta 4K, con la recomendacion del autor de usar 1024x576 para evitar desaturacion de color.
- Sin restricciones de contenido (version "uncensored"), pensada para contenido creativo sin filtros.
- Compatible con cargadores que descubren componentes por directorio (ComfyUI, llama.cpp) mediante la estructura de archivos `split/`.

## Casos de uso

- Creacion de contenido creativo sin restricciones: el modelo permite generar video de cualquier tematica sin filtros de seguridad, util para artistas y creadores que necesitan explorar conceptos que los modelos censurados bloquean. Se usaria con prompts descriptivos y la configuracion recomendada de 1024x576, 12 pasos y guidance 1.0.
- Prototipado rapido de video para publicidad: con 12 pasos de difusion y una RTX 5090, se puede generar un clip de 5 segundos en aproximadamente 11 minutos, lo que permite iterar sobre conceptos de anuncios sin depender de servicios externos ni costes por uso.
- Generacion de video de fondo para produccion audiovisual: el modelo puede producir clips de ambiente (paisajes, texturas, objetos) que se pueden usar como material de archivo, con la opcion de upscaling 2x para mejorar la resolucion.
- Investigacion en generacion de video sin censura: para investigadores que estudian como los modelos generativos manejan contenido de riesgo, este repo ofrece una base reproducible con cuantizaciones que caben en GPU de 32 GB.
- Creacion de video de imagen a video: a partir de una fotografia, el modelo puede generar una animacion corta con movimiento de camara, util para dar vida a imagenes fijas en presentaciones o redes sociales.
- Desarrollo de pipelines de generacion de video en local: gracias a los cuantizados GGUF, se puede integrar en entornos de produccion con llama.cpp o ComfyUI para automatizar la generacion de video sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye mediciones internas del autor (sharpness medida como varianza de Laplacian y color spread), pero no hay datos comparativos con otros modelos de video como MMLU, HumanEval o similares. La unica referencia de rendimiento es el tiempo de generacion medido en un RTX 5090: aproximadamente 11 minutos para 5.04 segundos de video (121 frames, 24 fps, 12 pasos, Q4_K_M), incluyendo la carga del modelo. No se ha publicado ningun benchmark estandarizado.

## Requisitos de hardware

- VRAM estimada para inferencia: el conjunto de trabajo completo (transformador Q4_K_M + text encoder + VAE + LoRA) ocupa unos 27 GB, por lo que cabe en una GPU de 32 GB.
- GPU recomendadas: RTX 5090 (32 GB) es la unica hardware mencionada en la model card para generar el sample. En principio cualquier GPU con 24 GB o mas de VRAM podria ejecutar el conjunto Q4_K_M, aunque la velocidad seria menor.
- Si cabe en consumer GPU: si, en GPUs de 24 GB o más. El autor indica que el Q4_K_M (14.30 GB) cabe "comodamente" en una tarjeta de 32 GB.
- Opciones de despliegue: el repositorio esta pensado para cargadores que descubren componentes por directorio (ComfyUI, llama.cpp). Se menciona compatibilidad con endpoints.
- Latencia y throughput: aproximadamente 11 minutos para 5.04 segundos de video (121 frames) en RTX 5090, con escalado lineal respecto al numero de frames. La carga del modelo no es el cuello de botella, sino el bucle de difusion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares. La unica referencia es LTX-2.5, el modelo actual de Lightricks, que segun la web oficial de LTX es la generacion vigente y esta totalmente soportado, pero no hay datos de rendimiento ni de parametros en la informacion proporcionada. El blog de Siray menciona que LTX-2.3 tiene 22B parametros y soporta 4K nativo, pero no proporciona una comparativa directa con alternativas como CogVideoX, Mochi o HunyuanVideo. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Licencia: el repositorio marca la licencia como `unknown`; el autor recomienda revisar la licencia upstream de Lightricks para uso comercial y redistribucion. No se puede asumir que sea de uso libre.
- Contenido sin censura: el modelo genera contenido no apto para todos los publicos (tag `not-for-all-audiences`), lo que implica riesgo de contenido inapropiado o ilegal segun la jurisdiccion. No hay filtros de seguridad integrados.
- Generacion lenta: 11 minutos para 5 segundos de video en una GPU de gama alta, lo que no es adecuado para produccion en tiempo real ni para iterar rapidamente en volumen.
- Distill LoRA obligatoria: el pipeline no carga sin ella, y si el directorio se llama `split/lora/` en lugar de `split/distill_loras/`, el modelo se salta silenciosamente. Es un punto de fallo en despliegues automatizados.
- Audio VAE presente pero no ejercitado: el sample no tiene audio, y el autor no ha validado la generacion de audio en esta compilacion. Puede haber fallos en esa ruta.
- Resolucion recomendada de 1024x576, no 768x512: el autor ha medido desaturacion de color reproducible a 768x512 con 121 frames. Usar la resolucion no recomendada degrada la calidad.
- Parametros reales de 11.7B, no 22B: el nombre comercial "22B" no coincide con el dato real de safetensors, lo que puede causar confusion en la planificacion de recursos.

## Enlaces

- HuggingFace: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8
- Blog de Siray sobre LTX 2.3: https://blog.siray.ai/ltx-2-3-nsfw/
- Pagina de LTX (Lightricks): https://ltx.io/model/ltx-2-3
- GitHub de workflows ComfyUI: https://github.com/minflamingo/ltx-2.3-uc
