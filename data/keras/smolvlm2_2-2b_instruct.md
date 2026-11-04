# keras/smolvlm2_2.2b_instruct

## Resumen

SmolVLM2 es una familia de modelos multimodales ligeros publicada por Hugging Face en tamanos de 256M, 500M y 2.2B parametros. Cada modelo combina un codificador de imagen SigLIP con un decodificador de texto SmolLM2, siguiendo la arquitectura Idefics3. La variante de 2.2B, objeto de esta ficha, utiliza el codificador SigLIP-SO400M con optimizacion de forma y el decodificador SmolLM2-1.7B, sumando 2.25B parametros totales.

El modelo acepta como entrada texto intercalado con una o varias imagenes y fotogramas de video, y genera texto. Esto lo hace adecuado para tareas de captioning de imagen y video, respuesta visual a preguntas (VQA), comprension de documentos y graficos, y deteccion de momentos destacados en video sobre hardware con recursos limitados.

La relevancia actual del modelo radica en su reducido tamano (2.25B parametros) combinado con capacidades multimodales de imagen, multi-imagen y video, lo que permite su despliegue en entornos con VRAM limitada. El repositorio de Keras (`keras/smolvlm2_2.2b_instruct`) proporciona los pesos adaptados a KerasHub, lo que facilita su uso con los backends JAX, TensorFlow y PyTorch. SmolVLM2 no genera imagenes ni video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3: codificador de vision SigLIP-SO400M + decodificador de texto SmolLM2-1.7B (transformer) |
| Parametros totales | 2.25B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos); Apache 2.0 (codigo Keras) |
| Formato de pesos | safetensors (repositorio de 9.0 GB); presets de KerasHub |

## Arquitectura y entrenamiento

SmolVLM2 sigue la arquitectura Idefics3, que acopla un codificador visual SigLIP con un decodificador de lenguaje SmolLM2. En la variante de 2.2B, el codificador es SigLIP-SO400M (con optimizacion de forma) y el decodificador es SmolLM2-1.7B. El modelo procesa entradas multimodales intercaladas: texto, una o varias imagenes y fotogramas de video, y produce texto autoregresivo. Las variantes de 256M y 500M emplean un codificador SigLIP-B/16 mas pequeno junto con un decodificador SmolLM2 de menor tamano.

La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo es una version instruction-tuned (sufijo `_instruct`), orientada a seguir instrucciones para tareas de comprension visual. No se dispone de detalles sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto condicionada por imagenes (image captioning) y por multiples imagenes (multi-image understanding).
- Comprension de video: procesamiento de fotogramas y deteccion de momentos destacados (video highlight detection).
- Respuesta visual a preguntas (VQA) sobre imagenes y video.
- Comprension de documentos y graficos (document and chart understanding).
- Seguimiento de instrucciones en formato conversacional (instruction-tuned), con plantilla de chat basada en `<|im_start|>`.
- Entrada de texto intercalado con imagenes y video.
- No genera imagenes ni video.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision adicional o audio: no disponible (solo vision y video de entrada).

## Casos de uso

- **Captioning automatico de imagenes en pipelines de accesibilidad**: el modelo genera descripciones textuales de imagenes para alt-text o audiodescripcion, aprovechando su codificador SigLIP y su tamano reducido para procesar lotes en CPU/GPU modesta.
- **Respuesta visual a preguntas en asistentes de soporte**: un asistente puede recibir una captura de pantalla o foto del usuario y responder preguntas sobre su contenido, gracias a la entrada multimodal intercalada texto-imagen.
- **Comprension de documentos y graficos**: extraccion de informacion de tablas, graficos e infografias en flujos de digitalizacion, usando la capacidad de document and chart understanding descrita por el autor.
- **Analisis de video para deteccion de momentos destacados**: procesamiento de fotogramas de video para identificar segmentos relevantes en herramientas de edicion o moderacion de contenido, una de las tareas objetivo declaradas.
- **Moderacion de contenido visual**: clasificacion y descripcion de imagenes subidas por usuarios en plataformas, con el modelo como primer filtro antes de revision humana, dado su bajo coste de inferencia.
- **Prototipado rapido en KerasHub**: integracion en notebooks y entornos Keras (JAX, TensorFlow, PyTorch) mediante `SmolVLM2CausalLM.from_preset`, ideal para experimentacion e investigacion con recursos limitados.
- **Asistencia en entornos educativos o de investigacion**: analisis de figuras cientificas y material visual en tareas de estudio, con despliegue en hardware de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explicita. Con 2.25B parametros, una estimacion orientativa en FP16 seria de aproximadamente 4.5 GB solo para pesos, mas el coste del codificador visual y las activaciones; en cuantizacion de 8 bits o 4 bits el requisito se reduce, pero no se confirman formatos de cuantizacion soportados.
- **GPU recomendadas**: no disponible en la informacion proporcionada.
- **Compatibilidad con GPU de consumo**: por el tamano (2.25B), es plausible su ejecucion en GPU de consumo con VRAM suficiente, pero no se confirma en la documentacion disponible.
- **Opciones de despliegue**: KerasHub con backends JAX, TensorFlow y PyTorch (`keras_hub.models.SmolVLM2CausalLM.from_preset`). Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- **Latencia y throughput estimados**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLM2 2.2B Instruct (este) | 2.25B | no disponible | Imagen, multi-imagen, video (entrada) | Apache 2.0 | KerasHub, Hugging Face |
| SmolVLM2 500M Instruct | 507.48M | no disponible | Imagen, video (entrada) | Apache 2.0 | KerasHub, Hugging Face |
| SmolVLM2 256M Instruct | 256.48M | no disponible | Imagen, video (entrada) | Apache 2.0 | KerasHub, Hugging Face |

No se dispone de datos de benchmarks ni de comparativas con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- **No genera imagenes ni video**: solo produce texto como salida.
- **Uso no recomendado para decisiones de alto impacto**: el autor declara que el modelo no esta destinado a decisiones que afecten al bienestar o medios de vida de una persona.
- **Sesgos conocidos**: no disponible en la informacion proporcionada.
- **Riesgo de alucinacion**: no cuantificado en la documentacion disponible; como modelo generativo de texto, es susceptible de producir contenido incorrecto.
- **Limitaciones de contexto e idioma**: la longitud de contexto y los idiomas soportados no estan disponibles, lo que limita la planificacion de despliegues multilingues o con contexto largo.
- **Licencia**: los pesos se distribuyen bajo Apache 2.0, lo que permite uso comercial; el codigo Keras tambien es Apache 2.0. Verificar terminos del codificador SigLIP y del decodificador SmolLM2 subyacentes en el repositorio original.
- **Estado del repositorio**: el autor indica que los checkpoints se estan subiendo y que la tabla de presets corresponde a una PR de KerasHub; la disponibilidad completa de pesos puede ser parcial.
- **Caveat de produccion**: al ser una adaptacion Keras de un modelo de Hugging Face, conviene validar la paridad numerica con la version original antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face (Keras): https://huggingface.co/keras/smolvlm2_2.2b_instruct
- Model card original de Hugging Face: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Paper SmolVLM2: https://arxiv.org/abs/2504.05299
- Codificador SigLIP (Google): https://huggingface.co/collections/google/siglip-659d5e62f0ae1a57ae0e83ba
- Decodificador SmolLM2: https://huggingface.co/collections/HuggingFaceTB/smollm2-6723884218bcda64b34d7db9
- Guia de inicio de KerasHub: https://keras.io/guides/keras_hub/getting_started/
- Guia de publicacion de modelos KerasHub: https://keras.io/guides/keras_hub/upload/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia del codigo KerasHub: https://github.com/keras-team/keras-hub/blob/master/LICENSE
- Documentacion de Keras: https://keras.io/
