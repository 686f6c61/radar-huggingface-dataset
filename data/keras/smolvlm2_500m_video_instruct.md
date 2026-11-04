# keras/smolvlm2_500m_video_instruct

## Resumen

SmolVLM2 es una familia de modelos multimodales ligeros publicada por Hugging Face, disponible en tamanos de 256M, 500M y 2.2B parametros. Cada modelo combina un codificador visual SigLIP con un decodificador de texto SmolLM2, siguiendo la arquitectura Idefics3. La variante de 500M, que nos ocupa aqui, emplea el codificador SigLIP-B/16 junto con un decodificador SmolLM2 de menor tamano, y esta ajustada por instrucciones para comprension de imagenes y video.

El modelo acepta como entrada texto intercalado, una o varias imagenes y fotogramas de video, y genera texto. Esto lo hace adecuado para tareas de captioning de imagenes y video, respuesta a preguntas visuales, comprension de documentos y graficos, y deteccion de momentos destacados en video, todo ello en hardware con recursos limitados. No genera imagenes ni video.

Esta ficha corresponde a la implementacion del modelo en KerasHub, la libreria oficial de Keras, lo que permite cargarlo y ejecutarlo con los backends de JAX, TensorFlow o PyTorch. El repositorio tiene un tamano de 2.0 GB y su licencia de pesos es Apache 2.0 segun la model card del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3 (codificador visual SigLIP-B/16 + decodificador de texto SmolLM2) |
| Parametros totales | 507,48M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos, segun model card del autor); codigo Keras bajo Apache 2.0 |
| Formato de pesos | no disponible (checkpoint KerasHub; el repo ocupa 2.0 GB) |

## Arquitectura y entrenamiento

SmolVLM2 sigue la arquitectura Idefics3, que empareja un codificador de vision con un decodificador de lenguaje. En la variante de 500M, el codificador es SigLIP-B/16 y el decodificador es un SmolLM2 de menor tamano. El modelo procesa entradas multimodales intercaladas (texto, imagenes y fotogramas de video) y produce texto autoregresivo. La familia incluye tres tamanos; el de 2.2B utiliza el codificador SigLIP-SO400M con SmolLM2-1.7B, mientras que las variantes de 256M y 500M usan SigLIP-B/16 con decodificadores SmolLM2 mas pequenos.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que los modelos estan ajustados por instrucciones (instruction-tuned) para comprension de imagenes y video. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto condicionada por entradas visuales: captioning de imagenes y video.
- Respuesta a preguntas visuales (VQA) sobre imagenes individuales, multiples imagenes y fotogramas de video.
- Comprension de documentos y graficos.
- Deteccion de momentos destacados en video (video highlight detection).
- Procesamiento de entradas intercaladas de texto, imagen y video.
- Ajuste por instrucciones para seguimiento de comandos en lenguaje natural.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Generacion de imagenes o video: no soportada.

## Casos de uso

- Captioning automatico de imagenes: el modelo genera descripciones textuales de imagenes de entrada, util para accesibilidad, indexado de contenido o generacion de metadatos en pipelines de gestion de activos digitales.
- Respuesta a preguntas visuales en atencion al cliente: un usuario puede enviar una foto de un producto o de un error en pantalla y el modelo responde con texto explicativo, gracias a su capacidad de VQA sobre imagenes individuales.
- Comprension de documentos y graficos: el modelo puede extraer e interpretar informacion de capturas de documentos o graficos, adecuado para automatizar la revision de informes o la extraccion de datos de figuras.
- Analisis de video para deteccion de momentos destacados: procesando fotogramas de video, el modelo puede identificar segmentos relevantes, util en edicion automatica, resumenes de video o moderacion de contenido.
- Procesamiento de multiples imagenes en un mismo contexto: permite comparar o describir varias imagenes en una sola consulta, por ejemplo para tareas de catalogacion o comparacion visual.
- Despliegue en dispositivos con recursos limitados: con 507,48M parametros y un codificador SigLIP-B/16, el modelo esta pensado para hardware modesto, lo que facilita su integracion en aplicaciones de borde o entornos con poca VRAM.
- Prototipado rapido con KerasHub: al cargarse mediante `keras_hub.models.SmolVLM2CausalLM.from_preset`, se puede integrar en flujos de experimentacion con JAX, TensorFlow o PyTorch sin cambiar de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 507,48M parametros, el peso en precision completa (fp32) rondaria los 2 GB, y en fp16/bf16 aproximadamente 1 GB, si bien estos calculos son estimaciones teoricas y no datos publicados.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada; por tamano, es plausible que quepa en GPU de consumo, pero no se confirma en la documentacion.
- Opciones de despliegue: KerasHub con backends JAX, TensorFlow o PyTorch (segun la model card). Otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLM2 500M (este modelo) | 507,48M | no disponible | Apache 2.0 | KerasHub / Hugging Face |
| SmolVLM2 256M | 256,48M | no disponible | Apache 2.0 | KerasHub / Hugging Face |
| SmolVLM2 2.2B | 2,25B | no disponible | Apache 2.0 | KerasHub / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. Otras alternativas de la misma categoria no se detallan en la documentacion disponible.

## Limitaciones y advertencias

- El modelo no genera imagenes ni video; solo produce texto a partir de entradas multimodales.
- El editor indica que no esta destinado a decisiones de alto impacto que afecten al bienestar o los medios de vida de una persona.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto o idioma en la documentacion proporcionada.
- La licencia de pesos es Apache 2.0 segun la model card del autor original, lo que permite uso comercial; el codigo Keras se distribuye bajo Apache 2.0. Conviene verificar la licencia en el repositorio de Hugging Face, ya que el campo de licencia del repo figura como "no disponible".
- El repositorio tiene 0 descargas y 0 likes, y los checkpoints se estaban subiendo en el momento de la publicacion, segun la model card; la madurez y el soporte de la implementacion en KerasHub pueden ser limitados.
- No se dispone de datos sobre cuantizacion, latencia o requisitos exactos de hardware, lo que dificulta planificar un despliegue en produccion sin pruebas adicionales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/keras/smolvlm2_500m_video_instruct
- Model card del autor original (SmolVLM2-2.2B-Instruct): https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Paper de SmolVLM2: https://arxiv.org/abs/2504.05299
- Guia de inicio de KerasHub: https://keras.io/guides/keras_hub/getting_started/
- Guia de publicacion de modelos en KerasHub: https://keras.io/guides/keras_hub/upload/
- Documentacion de Keras: https://keras.io/
- Codificador SigLIP (Google): https://huggingface.co/collections/google/siglip-659d5e62f0ae1a57ae0e83ba
- Decodificador SmolLM2 (Hugging Face): https://huggingface.co/collections/HuggingFaceTB/smollm2-6723884218bcda64b34d7db9
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia del codigo KerasHub: https://github.com/keras-team/keras-hub/blob/master/LICENSE
