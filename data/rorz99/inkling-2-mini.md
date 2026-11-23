# rorz99/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de desarrollo: asistentes de código, sistemas agénticos con uso de herramientas, chatbots y pipelines de generación aumentada por recuperación (RAG). Su relevancia inmediata radica en que combina una ventana de contexto de hasta 1 millón de tokens con un tamano de checkpoint de aproximadamente 20 GB, lo que permite ejecutarlo en hardware local de gama alta para consumidores y estaciones de trabajo.

Arquitectonicamente es un transformer decoder-only con capas de feed-forward de tipo Mixture-of-Experts (MoE) disperso: 24 capas de pesos, de las cuales las 12 centrales se ejecutan tres veces con pesos compartidos, dando 48 aplicaciones de capa por token. Cada token se enruta a 8 de 128 expertos por capa. El modelo tiene 26.400 millones de parametros totales y 3.400 millones de parametros activos nominales, que ascienden a unos 5.400 millones efectivos por token debido a las tres pasadas por las capas en bucle.

La atencion es hibrida, combinando capas locales y globales, y la multimodalidad es nativa: las imagenes se codifican mediante un vision transformer y se proyectan junto al texto a un espacio oculto compartido que procesa el decoder. Los pesos se distribuyen en precisiones mixtas NVFP4 y MXFP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas en bucle (looped transformer); atencion hibrida local/global; vision transformer para imagenes |
| Parametros totales | 26.400 millones (26.388.646.440 segun safetensors) |
| Parametros activos | 3.400 millones nominales; aproximadamente 5.400 millones efectivos por token con las tres pasadas |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Pesos nativos en NVFP4 y MXFP8; versiones GGUF cuantizadas disponibles via Unsloth y llama.cpp |
| Idiomas soportados | Ingles y soporte multilingue general; multiples lenguajes de programacion |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint unico de aproximadamente 20 GB en precisiones mixtas NVFP4/MXFP8) |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo multimodal con 24 capas de pesos. Las 12 capas centrales se reutilizan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa. Las capas de feed-forward son MoE disperso: 128 expertos por capa con enrutamiento de 8 expertos por token. La atencion combina capas locales y globales, lo que permite sostener una ventana de contexto de hasta 1 millon de tokens sin que el coste de atencion crezca de forma cuadratica en todas las capas. La entrada de imagen se procesa con un vision transformer y se proyecta al mismo espacio oculto que el texto, de forma que el decoder procesa conjuntamente ambas modalidades.

Los datos de entrenamiento incluyen texto, imagenes y video, procedentes de fuentes publicas de internet y repositorios accesibles publicamente, de terceros, generados internamente y sinteticos o aumentados. El proceso de curacion incluye limpieza, deduplicacion y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones de decodificacion especulativa ni detalles del mecanismo de atencion lineal mas alla de la descripcion hibrida local/global.

## Capacidades

- Generacion de texto conversacional multi-turno con instrucciones complejas.
- Comprension de imagenes: cualquier imagen basada en pixeles, con rendimiento optimo si cada dimension esta entre 40 px y 4096 px.
- Razonamiento y respuesta a preguntas sobre contenido visual y textual combinado.
- Generacion y asistencia de codigo en multiples lenguajes de programacion.
- Soporte para sistemas agenticos y de uso de herramientas (tool calling), segun la descripcion de casos de uso de la model card.
- Integracion en sistemas de generacion aumentada por recuperacion (RAG) gracias a la ventana de 1 millon de tokens.
- Soporte multilingue general, con enfasis en ingles.
- Modo de razonamiento multi-paso implicito en el diseno agéntico, aunque la model card no describe un modo "thinking" explicito.

## Casos de uso

- Asistencia de codigo en produccion: el modelo puede integrarse en asistentes de IDE y pipelines de CI/CD para revision de codigo, generacion de parches y explicacion de errores, aprovechando su soporte de multiples lenguajes de programacion y su capacidad de tool calling.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno con contexto largo gracias a la ventana de 1 millon de tokens, lo que permite mantener historiales extensos y documentacion de producto en la misma sesion.
- RAG sobre corpus extensos: puede ingerir grandes volumenes de documentos y responder preguntas con citas, reduciendo la necesidad de trocear agresivamente el contexto.
- Analisis de documentos con imagenes: extraccion de informacion de facturas, capturas, diagramas y formularios combinando entrada visual y textual en una sola pasada.
- Agentes autonomos de navegacion y automatizacion: el soporte de tool calling y razonamiento multi-paso permite orquestar llamadas a APIs y ejecutar tareas encadenadas.
- Despliegue en estaciones de trabajo locales: con aproximadamente 20 GB de checkpoint, puede ejecutarse en un DGX Spark o en Apple Silicon con 32 GB o mas, lo que facilita prototipado y desarrollo sin depender de la nube.
- Fine-tuning downstream: al publicarse con pesos abiertos y licencia Apache 2.0, permite ajuste fino con Tinker, Miles o SkyRL para dominios especializados.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL. Sin embargo, los valores numericos de esa tabla no estan disponibles en la informacion proporcionada; solo se ha podido recuperar el encabezado de la tabla y los nombres de los modelos comparados. No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB para el checkpoint nativo en NVFP4/MXFP8; se recomiendan 32 GB o mas de VRAM para otros formatos y plataformas.
- GPU recomendadas: NVIDIA DGX Spark (soporte oficial); otras GPU con 32 GB o mas de VRAM.
- Apple Silicon: MacBooks, Mac minis y Mac Studios con 32 GB de memoria o mas.
- Cabe en GPU de consumo: si, en tarjetas con 32 GB o mas de VRAM; no se especifica soporte para tarjetas de 24 GB.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluye GGUF cuantizados), llama.cpp (GGUF), Llama App, Ollama y Exo Labs en Apple Silicon.
- Post-entrenamiento: Miles y SkyRL; acceso API y fine-tuning via Tinker.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face y Tinker |
| Gemma 4 31B | 31B (no confirmado en detalle) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (no confirmado en detalle) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables aparecen unicamente como referencias en la tabla de evaluaciones de la model card; no se dispone de sus especificaciones detalladas ni de sus resultados numericos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos ni evaluaciones de seguridad especificas; el uso en produccion requiere auditoria propia.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan tasas de error ni mitigaciones especificas.
- El soporte multilingue se describe como "general", con enfasis en ingles; el rendimiento en castellano no esta cuantificado.
- La ventana de 1 millon de tokens no garantiza recuperacion fiable de informacion en posiciones muy lejanas; no se publican resultados de pruebas de aguja en pajar.
- La licencia Apache 2.0 permite uso comercial, pero existe una politica de uso aceptable del proveedor que puede imponer restricciones adicionales.
- El checkpoint nativo usa precisiones NVFP4 y MXFP8; la calidad en cuantizaciones GGUF de menor precision no esta documentada.
- El modelo se publico el 20 de noviembre de 2026 y el repositorio de Hugging Face indica 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.
- El ID de Hugging Face consultado (rorz99/Inkling-2-Mini) difiere del repositorio oficial indicado en la model card (thinkingmachines/Inkling-2-Mini); conviene verificar la procedencia de los pesos antes de usarlos en produccion.

## Enlaces

- Hugging Face (repo consultado): https://huggingface.co/rorz99/Inkling-2-Mini
- Hugging Face (repo oficial indicado en la model card): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentacion de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
