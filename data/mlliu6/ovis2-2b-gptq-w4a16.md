# MLliu6/Ovis2-2B-GPTQ-W4A16

## Resumen

Ovis2-2B-GPTQ-W4A16 es una cuantizacion de 4 bits del modelo multimodal Ovis2-2B, desarrollado originalmente por ATH-MaaS (Alibaba) y derivado aqui por el usuario MLliu6. El modelo combina un codificador visual AIMv2 Large con el modelo de lenguaje Qwen2.5-1.5B-Instruct, dando lugar a un sistema image-text-to-text de 2.222.907.894 parametros totales capaz de procesar imagenes y texto de forma conjunta. Esta version aplica cuantizacion GPTQ simetrica W4A16 (pesos de 4 bits, activaciones de 16 bits) sobre las proyecciones lineales del bloque de lenguaje, manteniendo el codificador visual y los embeddings en precision de 16 bits.

La relevancia de esta ficha radica en que reduce el peso del repositorio a unos 2,5 GB, lo que facilita el despliegue en GPUs de consumo. Es un artefacto de investigacion, no un modelo listo para produccion: el autor lo describe explicitamente como tal y lo publica bajo la licencia Apple AMLR, que restringe el uso a investigacion cientifica no comercial.

El modelo soporta ingles y chino, y su ventana de contexto, regimen de entrenamiento y datos de benchmark no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: codificador visual AIMv2 Large + LLM Qwen2.5-1.5B-Instruct (transformer decoder) |
| Parametros totales | 2.222.907.894 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16 simetrica, grupo de 128, formato de empaquetado int32; vision, embeddings visuales y tabla de embeddings texto compartida en 16 bits |
| Idiomas soportados | en, zh |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement) |
| Formato de pesos | safetensors (GPTQ), requiere `custom_code` y `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura es un ensamblaje multimodal de dos componentes: un codificador visual AIMv2 Large y el modelo de lenguaje Qwen2.5-1.5B-Instruct, un transformer decoder. La cuantizacion GPTQ se aplica a siete proyecciones lineales de atencion y MLP en cada uno de los 28 bloques del lenguaje, sumando 196 modulos lineales empaquetados. El codificador visual, los embeddings visuales y la tabla de embeddings de entrada/salida del texto (compartida o *tied*) permanecen en 16 bits. La configuracion local selecciona SDPA (Scaled Dot-Product Attention) para la atencion del lenguaje.

El proceso de calibracion uso 128 captions ordenados de ShareGPT4V junto con imagenes de entrenamiento de COCO 2017, emparejados con la instruccion "Describe this image." Los ficheros `calibration_provenance.json` y `checkpoint_provenance.json` registran el digest de seleccion, los IDs de imagen y los hashes de los pesos de origen. La cuantizacion es simetrica con ordenacion de activaciones y formato estandar de empaquetado GPTQ int32. No se detallan en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion completa del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto a partir de imagenes y texto (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y conversacion multimodal.
- Procesamiento de imagenes mediante el codificador AIMv2 Large, con tensores visuales gestionados por `model.get_visual_tokenizer()`.
- Conversacion multi-turno (tag `conversational`).
- Generacion de texto puro, incluyendo aritmetica basica (validado con un prompt de aritmetica en la prueba de recarga).
- Capacidades multilingues limitadas a ingles y chino.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Descripcion automatica de imagenes: el modelo puede generar descripciones en ingles o chino de una imagen de entrada, adecuado para etiquetado y accesibilidad de contenido visual.
- Investigacion en cuantizacion multimodal: sirve como artefacto para estudiar el impacto de GPTQ W4A16 en la calidad de un modelo vision-lenguaje, comparando contra el modelo base en 16 bits.
- Prototipado en GPUs de consumo: con un peso de 2,5 GB, permite experimentar con un pipeline image-text-to-text en hardware modesto (validado en una RTX 5080 Laptop).
- Respuesta visual a preguntas (VQA) en entornos de investigacion: para tareas de pregunta-respuesta sobre imagenes en ingles o chino dentro de proyectos academicos.
- Educacion y demos: util para mostrar tecnicas de cuantizacion y arquitecturas multimodales en cursos o talleres, dado su tamano reducido.
- Evaluacion de robustez de cuantizacion: permite medir degradacion de calidad en tareas de percepcion visual y aritmetica frente al modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de funcionamiento es una prueba cualitativa de recarga en frio en una NVIDIA GeForce RTX 5080 Laptop GPU, que supero dos prompts sinteticos de color de imagen y un prompt aritmetico de solo texto, con respuestas `The big shape is red.`, `The big shape is blue.` y `5`.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,5 GB en pesos cuantizados; se estima un consumo de VRAM en el rango de 3 a 5 GB incluyendo activaciones y overhead, aunque no se proporciona una cifra oficial.
- GPU validadas: NVIDIA GeForce RTX 5080 Laptop GPU (prueba documentada por el autor).
- Cabe en GPUs de consumo: si, dado el tamano reducido del checkpoint; se espera compatibilidad con GPUs con 6 GB o mas de VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: carga mediante `gptqmodel==2.2.0` con backend `torch` y `transformers==4.49.0`, con `trust_remote_code=True` para el codigo Ovis. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ovis2-2B-GPTQ-W4A16 (este) | 2.222.907.894 | no disponible | apple-amlr | safetensors GPTQ | Cuantizado 4 bits, vision + texto |
| ATH-MaaS/Ovis2-2B (base) | no disponible | no disponible | no disponible | safetensors | Modelo base sin cuantizar, 16 bits |
| Otros modelos de 2B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia Apple AMLR: restringe el uso a investigacion cientifica no comercial; no apto para produccion comercial sin autorizacion.
- Artefacto de investigacion: el autor lo declara explicitamente como tal, sin garantias de calidad ni soporte.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado potencialmente por la cuantizacion de 4 bits.
- La cuantizacion W4A16 puede degradar la precision en tareas visuales finas o razonamiento complejo; no se aportan metricas de degradacion.
- Requiere versiones especificas (`transformers==4.49.0`, `gptqmodel==2.2.0`) y `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio.
- No se documentan sesgos conocidos, longitud de contexto ni comportamiento en produccion.
- El checkpoint tiene muy pocas descargas (24) y ningun like, lo que sugiere validacion comunitaria minima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MLliu6/Ovis2-2B-GPTQ-W4A16
- Modelo base: https://huggingface.co/ATH-MaaS/Ovis2-2B/tree/63d303670a24612b2d0dd368490fcd7f75989d73
- Licencia Apple AMLR: `upstream_licenses/LICENSE_Apple_AMLR.txt` (incluida en el repositorio)
- Terminos Apache-2.0 upstream: `upstream_licenses/LICENSE_Apache-2.0.txt` (incluida en el repositorio)
- Procedencia de calibracion: `calibration_provenance.json` (incluido en el repositorio)
- Procedencia del checkpoint: `checkpoint_provenance.json` (incluido en el repositorio)
