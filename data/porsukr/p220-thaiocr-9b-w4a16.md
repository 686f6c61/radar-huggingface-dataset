# PorsukR/P220-ThaiOCR-9B-W4A16

## Resumen

P220-ThaiOCR-9B-W4A16 es la variante cuantizada en INT4 (weight-only, W4A16) del modelo P220-ThaiOCR-9B, un modelo vision-lenguaje de 9.400 millones de parametros especializado en documentos tailandeses: texto impreso y manuscrito, tablas, formularios, recibos, PDF oficiales y escaneos. Lo desarrolla Porsuk Rungarunsrisuk y parte del modelo base Qwen/Qwen3.5-9B (Apache-2.0), afinado con LoRA y fusionado posteriormente. La variante W4A16 emplea el formato compressed-tensors de GPTQ y esta pensada para servir con vLLM en GPUs NVIDIA Ampere.

El modelo resuelve la transcripcion y comprension de documentos en tailandes sin reglas por plantilla: convierte paginas en texto plano, Markdown o tablas HTML, y responde preguntas sobre el contenido (informacion clave, clasificacion, graficos, diagramas). Segun la model card, es el mejor modelo abierto evaluado en ThaiOCRBench, por encima de Qwen3.6-35B-A3B y OpenThai 2.0 27B, y cercano a GPT-6.1 Sol en las tareas de transcripcion.

La relevancia de esta variante concreta es practica: reduce el peso de los pesos BF16 a 4 bits con calibracion sobre texto OCR tailandes, lo que permite desplegar un modelo de 9B en hardware mas modesto manteniendo la calidad de OCR. Soporta tailandes e ingles, y el modo thinking viene desactivado por defecto tanto en entrenamiento como en la plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5-9B (transformer multimodal, image-text-to-text) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de despliegue con `--max-model-len 32768`) |
| Tipos de cuantizacion | INT4 weight-only W4A16 (GPTQ, compressed-tensors); el proyecto ofrece ademas BF16, FP8, NVFP4 y GGUF (BF16, Q8_0, Q4_K_M, Q3_K_M, Q2_K) |
| Idiomas soportados | Tailandes (th), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, GPTQ W4A16) |

## Arquitectura y entrenamiento

El modelo es un vision-lenguaje construido sobre Qwen3.5-9B, un transformer multimodal que procesa imagenes y texto en el pipeline image-text-to-text. El autor lo obtuvo mediante fine-tuning con LoRA sobre el modelo base y posterior fusion de los adaptadores. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset, aunque la model card indica que el objetivo del ajuste fue la calidad de OCR en tailandes y que el modelo se entreno y evaluo sin modo thinking.

La innovacion tecnica destacable de esta variante es la cuantizacion: los pesos INT4 W4A16 se generaron a partir de los pesos BF16 con calibracion sobre texto OCR tailandes (imatrix construida con texto OCR de tailandes para los GGUF de 4, 3 y 2 bits, y la misma calibracion para W4A16 y NVFP4). El autor afirma que todos los ficheros publicados se probaron sobre los conjuntos de validacion completos. No se dispone de informacion sobre el uso de RLHF o DPO en el proceso de entrenamiento.

## Capacidades

- Transcripcion OCR de texto impreso y manuscrito en tailandes, con salida en texto plano.
- Conversion de paginas a Markdown y tablas HTML, incluyendo tablas, formularios, recibos y PDF oficiales escaneados.
- Comprension de documentos: respuesta a preguntas sobre informacion clave, clasificacion de documentos, lectura de graficos y diagramas.
- Procesamiento sin reglas por plantilla: el modelo generaliza a tipos de documento no vistos.
- Soporte bilingue tailandes-ingles.
- Modo thinking desactivado por defecto (entrenado y evaluado sin thinking; la plantilla de chat lo desactiva).
- Compatibilidad con el endpoint OpenAI de vLLM (`endpoints_compatible`).
- No se documenta en la informacion disponible soporte de tool calling, function calling ni razonamiento agente multi-paso.

## Casos de uso

- Digitalizacion masiva de archivos gubernamentales: el modelo convierte PDF oficiales y escaneos en texto o Markdown estructurado, lo que permite indexar y buscar en corpus administrativos tailandeses sin definir plantillas por tipo de documento.
- Extraccion de datos de recibos y facturas: dada una imagen de recibo, el modelo transcribe lineas de concepto, importes y totales, y puede responder preguntas sobre los campos relevantes para alimentar un sistema de contabilidad.
- Procesamiento de formularios manuscritos: la capacidad de lectura de escritura a mano permite extraer respuestas de formularios rellenados a mano, un caso frecuente en tramites administrativos y sanitarios en Tailandia.
- Atencion al cliente con documentos adjuntos: integrado en un chatbot, el modelo puede leer una factura o contrato enviado por el usuario y responder preguntas sobre su contenido, con contexto de hasta 32.768 tokens para documentos largos.
- Conversion de tablas a HTML o Markdown para publicacion web: el modelo reconstruye tablas de documentos escaneados en formato estructurado, util para migrar informes y catalogos a formatos digitales editables.
- Clasificacion y enrutado documental: el modelo puede clasificar un documento y extraer su informacion clave, lo que sirve como primer paso en pipelines de gestion documental que despues derivan cada documento al flujo correspondiente.
- Analisis de graficos y diagramas en informes: responde preguntas sobre figuras y diagramas incluidos en documentos tecnicos o financieros, sin necesidad de un modelo de vision separado.

## Benchmarks y rendimiento

La model card incluye resultados en ThaiOCRBench (13 tareas, 2.808 items). La comparativa completa por tarea no esta disponible en la informacion proporcionada; los datos agregados son los siguientes:

| Metrica | P220-ThaiOCR-9B | P110-ThaiOCR-4B | Qwen3.6-35B-A3B | Qwen3.5-9B (base) | GPT-6.1 Sol | GPT-6 Luna |
|---|---|---|---|---|---|---|
| Media 13 tareas ThaiOCRBench | 0,674 | 0,572 | 0,589 | 0,462 | 0,738 | no disponible |
| Media 5 tareas de transcripcion | 0,635 | no disponible | no disponible | no disponible | 0,652 | no disponible |

Notas de la evaluacion segun el autor: todos los modelos abiertos se ejecutaron en el mismo hardware y con el mismo codigo de puntuacion; los modelos con dos ejecuciones se promedian. GPT-6.1 Sol se ejecuto con thinking en nivel bajo y el resto sin thinking. En ThaiOCRBench, 15 de los 2.808 items fueron filtrados por la API de Luna y no devolvieron respuesta, puntuando 0. El autor afirma que el fichero GGUF Q2_K (3,9 GB) tiene menor CER que P110-ThaiOCR-4B en BF16 y que la mayoria de modelos comparados, incluido GPT-6 Luna. No se han publicado resultados desglosados por tarea en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos W4A16 de un modelo de 9,4B ocupan aproximadamente 4,7 GB en 4 bits; con overhead de activaciones, cache KV y contexto de 32.768 tokens, se recomienda reservar entre 8 y 12 GB de VRAM para uso comodo.
- GPU recomendadas: el autor indica esta variante W4A16 para GPUs NVIDIA Ampere; para Ada/Hopper recomienda la variante FP8 y para Blackwell la NVFP4.
- Cabe en GPU consumer: si, en tarjetas Ampere con al menos 12 GB (por ejemplo RTX 3060 de 12 GB) y en tarjetas de gama alta como RTX 3090 o RTX 4090; para CPU, Mac u Ollama el autor remite a la variante GGUF.
- Opciones de despliegue: vLLM (probado con vLLM 0.29.0 y transformers 5.17.0), con endpoint compatible con la API de OpenAI; para CPU/Mac/Ollama, la variante GGUF con llama.cpp.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ThaiOCRBench (media 13 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P220-ThaiOCR-9B-W4A16 | 9,4B | 32.768 | 0,674 | Apache-2.0 | Hugging Face (BF16, FP8, W4A16, NVFP4, GGUF) |
| Qwen3.6-35B-A3B | no disponible | no disponible | 0,589 | no disponible | no disponible |
| OpenThai 2.0 27B | 27B | no disponible | no disponible (el autor lo menciona como superado por P220) | no disponible | no disponible |
| P110-ThaiOCR-4B | 4B | no disponible | 0,572 | no disponible | Hugging Face |
| Qwen3.5-9B (base) | 9B | no disponible | 0,462 | Apache-2.0 | Hugging Face |

El modelo destaca por ofrecer la mayor precision de la comparativa abierta con solo 9,4B de parametros, frente a alternativas de 27B y 35B. La licencia Apache-2.0 facilita el uso comercial, a diferencia de otros modelos de la comparativa cuya licencia no se detalla en la informacion disponible.

## Limitaciones y advertencias

- Idiomas limitados a tailandes e ingles; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos generativos: en transcripcion, el prompt recomendado insiste en no resumir, no omitir y no anadir explicaciones, lo que sugiere que el modelo puede desviarse del original sin instrucciones estrictas.
- El autor menciona una "rare runaway repeat" (repeticion descontrolada poco frecuente) y recomienda fijar `max_tokens=4096` para evitarla; en paginas muy densas hay que elevarlo.
- El modo thinking esta desactivado por defecto y el modelo no fue entrenado con el; activarlo podria degradar la calidad.
- La cuantizacion INT4 puede introducir perdida de precision frente a BF16; el autor afirma haberla calibrado y validado sobre los conjuntos completos, pero no se publican metricas comparativas W4A16 frente a BF16 en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B y los terminos aplicables deben verificarse de forma independiente.
- El modelo tiene muy poca traccion en Hugging Face (8 descargas, 0 likes) y fue creado en octubre de 2026; no hay validacion independiente de sus resultados mas alla de la model card del autor.
- Los benchmarks comparan con modelos cerrados (GPT-6.1 Sol, GPT-6 Luna) mediante API, con condiciones de thinking distintas, lo que limita la comparabilidad directa.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/PorsukR/P220-ThaiOCR-9B-W4A16
- Modelo base BF16: https://huggingface.co/PorsukR/P220-ThaiOCR-9B
- Variante FP8: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-FP8
- Variante NVFP4: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-NVFP4
- Variante GGUF: https://huggingface.co/PorsukR/P220-ThaiOCR-9B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de evaluacion ThaiOCRBench: https://huggingface.co/datasets/typhoon-ai/ThaiOCRBench
