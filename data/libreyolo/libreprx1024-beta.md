# LibreYOLO/LibrePRX1024-beta

## Resumen

LibrePRX1024-beta es un espejo (mirror) del checkpoint de previsualizacion `prx-1024-t2i-beta` publicado por Photoroom, un modelo de generacion de imagenes texto-a-imagen entrenado desde cero. El modelo original lo desarrollo Photoroom y LibreYOLO lo redistribuye sin modificaciones: los pesos son byte a byte identicos al upstream y conservan el layout de pipeline de `diffusers`. Esto lo hace relevante para quienes quieren cargar PRX desde la libreria `libreyolo` sin depender del repositorio original.

Tecnicamente es un transformer de difusion de 1.3B parametros con resolucion nativa de 1024x1024, acompanado de un codificador de texto T5Gemma de 2B parametros y el VAE de FLUX.1 [schnell]. La combinacion de un text encoder grande (2B) con un transformer de difusion relativamente compacto (1.3B) es una eleccion de diseno que traslada buena parte del coste computacional a la comprension del prompt.

La relevancia de esta ficha es doble: por un lado documenta un modelo de generacion de imagenes de pesos abiertos con licencia Apache-2.0 (con matices en el text encoder, ver limitaciones); por otro, ilustra el patron de espejo de pesos que usa LibreYOLO para integrar modelos de terceros en su ecosistema de inferencia. No hay datos publicados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (text-to-image) con text encoder T5Gemma 2B y VAE FLUX.1 [schnell] |
| Parametros totales | 1.3B (transformer de difusion); text encoder T5Gemma de 2B adicional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos PRX); T5Gemma 2B sujeto a Gemma Terms of Use; VAE FLUX.1 [schnell] Apache-2.0 |
| Formato de pesos | safetensors (layout de pipeline `diffusers`) |
| Resolucion nativa | 1024x1024 |
| Tamano del repositorio | 20.7 GB |
| Modelo base | Photoroom/prx-1024-t2i-beta (revision `0370504b9a433fbdff814b8fcba9da03bf72a7a3`) |
| Libreria | libreyolo |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

PRX es un transformer de difusion para generacion de imagenes condicionada por texto, entrenado desde cero por Photoroom. El pipeline se compone de tres piezas: un text encoder T5Gemma de 2B parametros que procesa el prompt, un transformer de difusion de 1.3B parametros que genera la imagen latente y el VAE de FLUX.1 [schnell] que decodifica los latentes a pixeles. La resolucion nativa de entrenamiento e inferencia es 1024x1024.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas del transformer (tipo de atencion, estrategias de muestreo o decodificacion especulativa). El checkpoint es una version beta de previsualizacion a 1024, no una version final.

## Capacidades

- Generacion de imagenes texto-a-imagen a resolucion nativa de 1024x1024.
- Condicionamiento por prompt de texto en lenguaje natural mediante el text encoder T5Gemma de 2B.
- Compatibilidad directa con `diffusers`: el repositorio conserva el layout de pipeline, por lo que se puede cargar con la API estandar de `diffusers`.
- Integracion con la libreria `libreyolo` mediante la clase `LibreGen` y la CLI `libreyolo generate`.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting, control por pose o referencia, tool calling ni razonamiento multi-paso.
- No se documentan capacidades multilingues especificas; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Generacion de ilustraciones para prototipado rapido: el modelo permite obtener imagenes a 1024x1024 desde un prompt de texto, util para maquetas de producto, wireframes visuales o moodboards antes de encargar arte final.
- Creacion de assets para videojuegos y contenido digital: al ser Apache-2.0 (con el matiz del text encoder), se puede integrar en pipelines de generacion de texturas, iconos o fondos sin las restricciones de licencias no comerciales.
- Generacion de imagenes en aplicaciones de escritorio o servidor con la CLI de `libreyolo`: el comando `libreyolo generate prompt=... model=prx-1024-beta` permite automatizar lotes de imagenes desde scripts sin escribir codigo Python.
- Investigacion en difusion texto-a-imagen: al ser un modelo entrenado desde cero con un text encoder T5Gemma de 2B, sirve como punto de comparacion frente a arquitecturas con text encoders tipo CLIP o T5-XXL en estudios de alineacion prompt-imagen.
- Fine-tuning y adaptacion de estilo: los pesos en safetensors con layout `diffusers` permiten aplicar LoRA o DreamBooth sobre el transformer para especializar el modelo en un estilo visual concreto, partiendo de una base Apache-2.0.
- Despliegue en pipelines de `diffusers` existentes: al conservar el layout upstream, se puede sustituir el checkpoint en un pipeline ya montado sin cambiar el codigo de inferencia, lo que facilita pruebas A/B entre PRX y otros modelos de difusion.
- Generacion de contenido para entornos con requisitos de licencia permisiva: el uso de Apache-2.0 en los pesos PRX y en el VAE permite redistribuir y modificar el modelo, siempre que se respeten las condiciones del text encoder Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa por el tamano del repositorio (20.7 GB en safetensors, incluyendo text encoder de 2B, transformer de 1.3B y VAE), se requiere almacenamiento suficiente para el conjunto completo y VRAM acorde a la precision de carga elegida; no se confirma ninguna cifra concreta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en ninguna GPU consumer concreta.
- Opciones de despliegue: `diffusers` (carga directa del repositorio) y `libreyolo` (clase `LibreGen` y CLI `libreyolo generate`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones completas de modelos comparables de la misma categoria (difusion texto-a-imagen de ~1-2B parametros con pesos abiertos). La comparativa cuantitativa figura como no disponible. Como referencia estructural, el modelo se apoya en el VAE de FLUX.1 [schnell] y en un text encoder T5Gemma, pero no se aportan cifras de MMLU, FID, CLIP score ni metricas equivalentes para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Es un checkpoint beta de previsualizacion: no es una version final y puede presentar calidad o coherencia inferiores a versiones estables.
- Es un espejo, no un modelo nuevo: no se ha reentrenado, convertido ni recodificado; cualquier problema del upstream se reproduce aqui.
- Licencia mixta: los pesos PRX son Apache-2.0, pero el text encoder T5Gemma 2B esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con usos restringidos. El uso comercial debe revisar ambas licencias y los ficheros `LICENSE` y `NOTICE`.
- Idiomas soportados no documentados: no se puede garantizar calidad de generacion con prompts en castellano u otros idiomas distintos del ingles.
- No se documentan sesgos conocidos, tasas de alucinacion visual ni limitaciones de contexto; no disponible.
- Sin benchmarks publicados en la informacion disponible: no se puede evaluar objetivamente frente a alternativas.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en produccion.
- Requisitos de hardware no confirmados: no se puede asegurar el despliegue en GPU de consumo sin pruebas propias.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/LibreYOLO/LibrePRX1024-beta
- Repositorio upstream: https://huggingface.co/Photoroom/prx-1024-t2i-beta
- Anuncio de Photoroom: https://huggingface.co/blog/Photoroom/prx-open-source-t2i-model
- Repositorio GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentacion de LibreYOLO: https://www.libreyolo.com/docs
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
