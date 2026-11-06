# ShintouHKG/Qwen-Image-Edit-2511

## Resumen

Qwen-Image-Edit-2511 es un modelo de edición de imágenes (pipeline image-to-image) desarrollado por el equipo Qwen de Alibaba. Se trata de la versión 2511 del modelo de edición de imagen de la familia Qwen-Image, construida sobre Qwen-Image-Edit-2509. El modelo base cuenta con aproximadamente 20.000 millones de parámetros según la información pública disponible en Hugging Face, y está diseñado para tareas de edición de imagen guiada por instrucciones en lenguaje natural.

El repositorio analizado, ShintouHKG/Qwen-Image-Edit-2511, no es el modelo original, sino una reconversión ("conversion") del modelo Rapid AIO de Phr00t al formato Diffusers. Contiene exclusivamente los pesos del transformer en FP8, organizados en carpetas por versión (por ejemplo V.23), con safetensors fragmentados. No incluye el text encoder, tokenizer, processor ni VAE, que deben cargarse desde el modelo base correspondiente (Qwen/Qwen-Image-Edit-2511 o Qwen/Qwen-Image-Edit-2509).

Es relevante porque permite ejecutar un modelo de edición de imagen de gran escala dentro del ecosistema Diffusers con pesos ya cuantizados a FP8, lo que reduce los requisitos de memoria frente a los pesos en precisión completa. La licencia Apache-2.0 del modelo base facilita su uso comercial, aunque el repositorio está etiquetado como "not-for-all-audiences" por el contenido que puede generar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para edicion de imagen (QwenImageTransformer2DModel) |
| Parametros totales | ~20B (modelo base Qwen-Image-Edit-2511) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos del transformer en el repo); bfloat16 en carga segun ejemplo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fragmentados, layout Diffusers) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-Edit-2511 es un transformer de difusion para edicion de imagen (image-to-image) de aproximadamente 20B parametros, integrado en el pipeline QwenImageEditPlusPipeline de Diffusers. El repositorio ShintouHKG/Qwen-Image-Edit-2511 contiene unicamente los pesos del transformer, derivados del modelo Rapid AIO de Phr00t, mantenidos en FP8 y reorganizados en el layout de Diffusers con safetensors fragmentados por version.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se emplearon tecnicas de RLHF/DPO o innovaciones especificas de atencion. La unica informacion tecnica confirmada es la separacion del transformer del resto de componentes (text encoder, tokenizer, processor y VAE), que deben cargarse desde el modelo base correspondiente a cada version.

## Capacidades

- Edicion de imagen guiada por instrucciones (image-to-image) mediante el pipeline QwenImageEditPlusPipeline.
- Carga modular: el transformer se combina con text encoder, tokenizer, processor y VAE del modelo base.
- Multiples versiones empaquetadas en carpetas independientes (por ejemplo V.23), cada una asociada a un modelo base concreto.
- Pesos en FP8 que reducen la huella de memoria del transformer respecto a precision completa.
- Generacion de contenido potencialmente sensible (etiqueta not-for-all-audiences).
- Soporte de tool calling, agentes, razonamiento multi-paso, vision general o audio: no disponible.

## Casos de uso

- Edicion fotografica asistida por instrucciones: el modelo recibe una imagen y una descripcion textual del cambio deseado y devuelve la imagen editada, adecuado para retoque y transformaciones semanticas.
- Prototipado rapido en Diffusers: al estar en formato Diffusers con safetensors fragmentados, se integra directamente en scripts de Python que usan QwenImageEditPlusPipeline.
- Despliegue con memoria limitada: los pesos FP8 del transformer reducen los requisitos de VRAM frente a variantes en bfloat16 o float32, lo que facilita su ejecucion en GPUs de gama alta de consumo.
- Investigacion en edicion de imagen: permite comparar distintas versiones (V.23 y otras) construidas sobre bases distintas sin reentrenar.
- Pipelines de generacion de variaciones visuales: util para crear versiones editadas de un mismo material grafico en flujos de diseno.
- Experimentacion con cuantizacion FP8: sirve como referencia para estudiar el impacto de FP8 en la calidad de edicion de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un transformer de ~20B en FP8 requiere del orden de 20 GB solo para los pesos, a lo que se suman text encoder, VAE y activaciones; no confirmado en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; probablemente requiere GPUs con 24 GB o mas de VRAM, aunque no hay dato oficial.
- Opciones de despliegue: Diffusers (QwenImageEditPlusPipeline + QwenImageTransformer2DModel); otras opciones (vLLM, llama.cpp, Ollama, TGI) no disponibles para este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ShintouHKG/Qwen-Image-Edit-2511 (este repo) | ~20B (base) | no disponible | Apache-2.0 | safetensors FP8 (solo transformer) | Conversion Diffusers del Rapid AIO de Phr00t |
| Qwen/Qwen-Image-Edit-2511 | ~20B | no disponible | Apache-2.0 | safetensors | Modelo base oficial completo |
| Qwen/Qwen-Image-Edit-2509 | no disponible | no disponible | Apache-2.0 | safetensors | Base anterior sobre la que se construyen algunas versiones |
| Phr00t/Qwen-Image-Edit-Rapid-AIO | no disponible | no disponible | no disponible | no disponible | Origen de los pesos reempaquetados |

## Limitaciones y advertencias

- El repositorio contiene solo el transformer; sin text encoder, tokenizer, processor ni VAE no es funcional por si mismo.
- Los pesos estan en FP8, lo que puede introducir perdida de calidad frente a precision completa.
- Etiqueta "not-for-all-audiences": puede generar contenido sensible; requiere moderacion en produccion.
- Riesgo de alucinacion visual y de ediciones no fieles a la instruccion: no cuantificado en la informacion disponible.
- Idiomas soportados no documentados.
- El autor del repo no es el desarrollador original; los pesos son obra de Phr00t y el modelo base de Qwen.
- No hay datos de benchmarks, latencia ni requisitos oficiales de hardware.
- Aunque la licencia del modelo base es Apache-2.0, conviene verificar las condiciones de las versiones derivadas antes de uso comercial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ShintouHKG/Qwen-Image-Edit-2511
- Modelo base oficial: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Archivos del modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511/tree/main
- Modelo base anterior: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Origen de los pesos (Phr00t): https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO
