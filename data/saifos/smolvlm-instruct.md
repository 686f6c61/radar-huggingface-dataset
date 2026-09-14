# SaifoS/SmolVLM-Instruct

## Resumen

SmolVLM-Instruct es un modelo multimodal compacto desarrollado originalmente por Hugging Face que acepta secuencias arbitrarias de imagenes y texto intercalados y produce texto como salida. Esta ficha corresponde a la reproduccion alojada por el usuario SaifoS bajo el identificador `SaifoS/SmolVLM-Instruct`, que replica el modelo oficial combinando el encoder visual `google/siglip-so400m-patch14-384` con el modelo de lenguaje `HuggingFaceTB/SmolLM2-1.7B-Instruct`, y que anade artefactos exportados a ONNX ademas de los pesos en safetensors. El conjunto suma 2.246.272.880 parametros y ocupa 26,8 GB en el repositorio (tamano inflado por incluir varias copias del modelo en distintos formatos).

El modelo resuelve tareas de comprension visual y textual en entornos con recursos limitados: responde preguntas sobre imagenes, describe contenido visual, genera historias a partir de varias imagenes y puede funcionar como modelo de lenguaje puro cuando no se le proporciona entrada visual. Su relevancia actual radica en que ofrece capacidades multimodales con un coste de inferencia muy inferior al de los modelos de referencia de 7B-8B, lo que permite ejecucion en dispositivo, y en que toda la arquitectura y los pesos son abiertos bajo licencia Apache 2.0.

La arquitectura sigue la linea de Idefics3, con compresion de imagen agresiva y una codificacion de 81 tokens visuales por cada parche de 384x384 pixeles. La informacion disponible no especifica la longitud de contexto ni detalles cuantitativos del entrenamiento mas alla de los datasets declarados (`HuggingFaceM4/the_cauldron` y `HuggingFaceM4/Docmatix`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Idefics3; encoder visual SigLIP (so400m-patch14-384) + proyector + LLM SmolLM2 |
| Parametros totales | 2.246.272.880 |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits y 4 bits via bitsandbytes, torchao y Quanto; exportacion ONNX incluida en el repositorio |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

SmolVLM es un modelo multimodal que combina un encoder visual SigLIP de 400M de parametros (`google/siglip-so400m-patch14-384`) con el modelo de lenguaje SmolLM2-1.7B-Instruct, unidos mediante un proyector que adapta las representaciones visuales al espacio de embeddings del LLM. Respecto a los modelos Idefics anteriores, introduce dos cambios tecnicos destacables: una compresion de imagen mas radical que reduce el coste de inferencia y el consumo de RAM, y una codificacion que representa cada parche de imagen de 384x384 con solo 81 tokens visuales. Las imagenes de mayor resolucion se dividen en parches que se codifican por separado, de modo que la resolucion de entrada se controla con el parametro `size={"longest_edge": N*384}` del procesador, con un valor por defecto de N=4 (imagenes de 1536x1536) y N=5 recomendado para documentos.

Los datasets declarados para el entrenamiento son `HuggingFaceM4/the_cauldron` y `HuggingFaceM4/Docmatix`, orientados a instrucciones multimodales y a documentos, respectivamente. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; estos datos se remiten al informe tecnico referenciado en la informacion (arXiv:2504.05299). El modelo parte de un LLM ya ajustado por instrucciones (SmolLM2-1.7B-Instruct), por lo que hereda su alineacion conversacional ademas del ajuste multimodal.

## Capacidades

- Generacion de texto condicionada por imagenes: descripcion de contenido visual, respuesta a preguntas sobre imagenes (VQA) y elaboracion de narraciones a partir de una o varias imagenes.
- Entrada multimodal intercalada: admite secuencias arbitrarias de imagenes y texto, con soporte para multiples imagenes en una misma consulta.
- Funcionamiento como modelo de lenguaje puro cuando no se proporciona entrada visual.
- Procesamiento de documentos: los datasets de entrenamiento incluyen Docmatix y la resolucion ampliada (N=5, 1920x1920) esta recomendada para documentos.
- Inferencia con cuantizacion en 8 y 4 bits via bitsandbytes, torchao y Quanto, y exportacion ONNX para despliegue en entornos sin PyTorch.
- Uso conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Soporte de ajuste fino sobre tareas especificas con la libreria transformers.
- No soporta generacion de imagenes.
- No se documenta en la informacion proporcionada soporte nativo de tool calling, function calling, agentes, modo thinking, audio o decodificacion especulativa.

## Casos de uso

- Descripcion automatica de imagenes y generacion de texto alternativo: el modelo puede recibir una imagen y devolver una descripcion textual detallada, util para pipelines de accesibilidad web o catalogacion de activos digitales.
- Respuesta visual a preguntas en atencion al cliente: con entradas de imagen mas texto intercalados, un usuario puede enviar una captura de pantalla de un error y el modelo responder en el mismo hilo conversacional, aprovechando el formato de chat del LLM base.
- Extraccion de informacion en documentos escaneados: aumentando la resolucion a N=5 (1920x1920), el modelo puede procesar facturas, formularios o capturas de documentos para responder preguntas concretas sobre campos y valores visibles.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes subidas por usuarios para detectar contenido no permitido, con la ventaja de un coste de inferencia bajo que permite ejecutarlo sobre volumenes altos.
- Asistentes en dispositivo o edge: con cuantizacion en 4 bits el modelo ocupa del orden de 1,5-2 GB, lo que permite desplegarlo en moviles, portatiles sin GPU dedicada o equipos embebidos para tareas de vision asistida sin enviar datos a la nube.
- Enriquecimiento de catalogos de comercio electronico: generacion de descripciones de producto, atributos visibles y texto de ficha a partir de las fotografias del articulo.
- Pipelines de anotacion de datos: preetiquetado de imagenes con descripciones o respuestas de referencia para construir datasets supervisados que luego se revisan manualmente.
- Uso como LLM de texto puro: al compartir arquitectura con SmolLM2-1.7B-Instruct, el mismo checkpoint puede emplearse en tareas de generacion de texto sin componente visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card proporcionada ni los resultados de busqueda web incluyen cifras de MMLU, HumanEval, GSM8K, MMMU, DocVQA u otras evaluaciones. Cualquier cifra de rendimiento debe consultarse en el informe tecnico enlazado (arXiv:2504.05299), que no forma parte de los datos suministrados.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 4,5 GB solo para los pesos (2,25B parametros) mas la memoria del encoder visual y las activaciones, lo que situa el consumo realista en torno a 5-7 GB en funcion del numero y resolucion de las imagenes.
- VRAM estimada con cuantizacion de 8 bits: del orden de 2,5-3,5 GB.
- VRAM estimada con cuantizacion de 4 bits: del orden de 1,5-2,5 GB.
- El consumo de memoria crece con la resolucion visual: N=4 implica imagenes de 1536x1536 y N=5 de 1920x1920, generando mas parches y por tanto mas tokens visuales.
- GPU consumer compatibles: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090) puede ejecutar el modelo en bf16; con 4 bits cabe en GPUs de 4-6 GB. Tambien es viable en Apple Silicon con memoria unificada.
- Opciones de despliegue confirmadas en la informacion: transformers con `AutoModelForVision2Seq` y `AutoProcessor`, con atencion FlashAttention 2 o eager; cuantizacion con bitsandbytes, torchao y Quanto; ejecucion ONNX Runtime gracias a los pesos ONNX del repositorio.
- No se documenta en la informacion proporcionada soporte en vLLM, TGI, llama.cpp, Ollama ni pesos GGUF.
- Latencia y throughput: no disponibles. La model card solo indica cualitativamente que la compresion de imagen permite inferir mas rapido y con menos RAM que Idefics3, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLM-Instruct (este repositorio) | 2.246.272.880 | No disponible | Imagen + texto | Apache 2.0 | HuggingFace, safetensors y ONNX |
| Idefics3-8B-Llama3 (referencia arquitectonica citada) | No disponible en la informacion | No disponible | Imagen + texto | No disponible en la informacion | HuggingFace |
| SmolLM2-1.7B-Instruct (modelo base de lenguaje) | No disponible en la informacion | No disponible | Solo texto | No disponible en la informacion | HuggingFace |
| google/siglip-so400m-patch14-384 (encoder visual) | No disponible en la informacion | No disponible | Imagen (encoder) | No disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a la relacion arquitectonica entre los componentes. La busqueda web realizada no devolvio resultados relacionados con el modelo (los enlaces obtenidos corresponden a un procedimiento administrativo aleman sin relacion alguna con IA), de modo que no se pueden aportar alternativas adicionales verificadas como Qwen2-VL, PaliGemma o moondream sin datos confirmados.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Alucinacion: la propia model card advierte de que el modelo puede producir contenido que parece factual pero no es preciso, especialmente en descripciones de imagenes con detalles ambiguos o poco legibles.
- Uso de alto riesgo: el autor declara explicitamente que el modelo no esta pensado para escenarios criticos ni para procesos de decision que afecten al bienestar o los medios de vida de una persona.
- Sesgos: no se documenta en la informacion proporcionada ninguna evaluacion de sesgos ni las caracteristicas demograficas y de dominio de los datasets the_cauldron y Docmatix.
- Longitud de contexto: al no estar especificada, no se puede garantizar el comportamiento en conversaciones largas o con muchas imagenes intercaladas.
- Repositorio de terceros: esta copia esta publicada por el usuario SaifoS con 0 descargas y 0 likes, y no es el repositorio oficial de Hugging Face; conviene verificar la integridad de los pesos antes de usarla en produccion y preferir la referencia oficial si se busca trazabilidad.
- Formato duplicado: el repositorio de 26,8 GB contiene varios formatos (safetensors y ONNX), lo que infla la descarga; es recomendable descargar solo los archivos necesarios.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de SmolLM2 y SigLIP conviene revisar tambien las condiciones de los modelos base.
- Capacidades no confirmadas: no hay evidencia en la informacion disponible de soporte de tool calling, agentes o modo thinking, por lo que no deben asumirse en un diseno de produccion.
- Generacion de imagenes: no soportada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SaifoS/SmolVLM-Instruct
- Informe tecnico citado en los tags: https://arxiv.org/abs/2504.05299
- Blog oficial de SmolVLM: https://huggingface.co/blog/smolvlm
- Demo oficial: https://huggingface.co/spaces/HuggingFaceTB/SmolVLM
- Modelo base de lenguaje: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Modelo base del encoder visual: https://huggingface.co/google/siglip-so400m-patch14-384
- Referencia arquitectonica Idefics3: https://huggingface.co/HuggingFaceM4/Idefics3-8B-Llama3
- Documentacion de cuantizacion en transformers: https://huggingface.co/docs/transformers/en/main_classes/quantization
- Dataset the_cauldron: https://huggingface.co/datasets/HuggingFaceM4/the_cauldron
- Dataset Docmatix: https://huggingface.co/datasets/HuggingFaceM4/Docmatix
