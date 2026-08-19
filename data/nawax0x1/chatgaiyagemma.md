# nawax0x1/ChatgaiyaGemma

## Resumen

ChatgaiyaGemma es un modelo de lenguaje multimodal desarrollado por nawax0x1 (Nawaz Haider) como un ajuste fino del modelo base unsloth/gemma-4-E4B-it, perteneciente a la familia Gemma 4. Cuenta con aproximadamente 8.000 millones de parametros (7.996.156.490) y emplea un pipeline image-text-to-text, lo que indica capacidad para procesar imagenes y texto como entrada y generar respuestas textuales.

El entrenamiento se realizo con las librerias Unsloth y TRL de HuggingFace, logrando un proceso aproximadamente 2 veces mas rapido que un ajuste fino convencional. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificacion sin restricciones significativas. El modelo declara soporte exclusivo para ingles, aunque su base Gemma 4 podria ofrecer capacidades multilingues inherentes.

La relevancia de este modelo reside en combinar la eficiencia de la variante E4B de Unsloth con las capacidades multimodales de Gemma 4, ofreciendo una opcion accesible para aplicaciones conversacionales y de generacion de texto con soporte de imagenes en entornos con recursos moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (base E4B de Unsloth) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, concretamente en la variante E4B publicada por Unsloth, que incorpora optimizaciones para reducir el consumo de memoria y acelerar la inferencia. El pipeline declarado como image-text-to-text indica que el modelo integra un codificador visual junto con el decodificador de lenguaje, permitiendo entradas multimodales.

El ajuste fino se realizo con la libreria TRL de HuggingFace junto con Unsloth, que optimiza el proceso mediante kernels personalizados y tecnicas de memoria eficiente, logrando un entrenamiento aproximadamente 2 veces mas rapido que un fine-tuning estandar. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: modelo optimizado para dialogos multi-turno gracias a su naturaleza instruct (it).
- Procesamiento multimodal: al ser image-text-to-text, puede recibir imagenes como entrada adicional al texto.
- Razonamiento y asistencia: capacidades propias de la familia Gemma para tareas de QA, resumen y generacion creativa.
- Soporte de tool calling: no confirmado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no confirmado en la informacion disponible.
- Capacidades multilingues: el modelo declara soporte exclusivo para ingles; no se confirma soporte para otros idiomas.

## Casos de uso

- Asistente conversacional ligero: el modelo puede desplegarse en entornos con recursos limitados gracias a su cuantizacion eficiente, ofreciendo respuestas contextuales en aplicaciones de chat en ingles.
- Analisis de imagenes con texto: gracias a su pipeline image-text-to-text, puede describir o responder preguntas sobre imagenes proporcionadas como entrada, util para aplicaciones de accesibilidad o documentacion visual.
- Generacion de contenido asistida: redaccion de textos, resumenes y borradores en ingles con un modelo de tamano medio (8B) que no requiere infraestructura de nivel enterprise.
- Prototipado rapido de aplicaciones de IA: al ser un modelo de tamano moderado con licencia Apache 2.0, es adecuado para experimentacion y desarrollo de minimos productos viables (MVP) en el ambito de la IA conversacional.
- Educacion e investigacion: permite estudiar tecnicas de fine-tuning eficiente (Unsloth + TRL) sobre arquitecturas multimodales, sirviendo como caso de referencia para estudiantes e investigadores.
- Integracion en pipelines de generacion aumentada por recuperacion (RAG): el modelo puede actuar como generador en sistemas RAG para dominios especificos en ingles, aprovechando su naturaleza conversacional para formular respuestas coherentes con el contexto recuperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 16,3 GB en safetensors, lo que sugiere pesos en precision bf16/fp16 (~2 bytes por parametro). La inferencia en esta precision requiere aproximadamente 16 GB de VRAM.
- Con cuantizacion adicional (INT8 o INT4), el modelo podria ejecutarse en GPUs con 8 GB o 4-6 GB de VRAM respectivamente, aunque esta informacion no esta confirmada.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para inferencia en precision nativa sin cuantizacion adicional.
- En consumer GPU: posible en RTX 3090 o RTX 4090 (24 GB) en precision nativa; con cuantizacion adicional podria ejecutarse en GPUs de 8-12 GB como RTX 4070 o RTX 3060.
- Opciones de despliegue: compatible con text-generation-inference (TGI) y transformers, puede desplegarse con vLLM, TGI, llama.cpp u Ollama (si se convierten los pesos a GGUF).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Dado que el modelo es un finetune de Gemma 4 E4B (8B), la comparacion directa con modelos de la misma generacion no es posible con los datos disponibles. Como referencia orientativa de la familia Gemma:

| Modelo | Parametros | Contexto | Licencia | Pipeline |
|---|---|---|---|---|
| ChatgaiyaGemma (este) | ~8B | no disponible | Apache 2.0 | image-text-to-text |
| Gemma 3 8B (referencia) | 8B | 128K | Gemma Terms | text / multimodal |
| Gemma 2 9B (referencia) | 9B | 8K | Gemma Terms | text |

Nota: los datos de Gemma 3 y Gemma 2 provienen del conocimiento general de la familia y pueden no reflejar la generacion Gemma 4 exacta. No se dispone de datos de rendimiento comparativos especificos para este modelo.

## Limitaciones y advertencias

- No se dispone de informacion sobre el dataset de fine-tuning, por lo que no es posible evaluar sesgos especificos introducidos durante el entrenamiento.
- El modelo declara soporte exclusivo para ingles; su rendimiento en otros idiomas no esta garantizado.
- No se han publicado benchmarks, por lo que el rendimiento en tareas estandar (MMLU, HumanEval, GSM8K) es desconocido.
- La cuantizacion E4B del modelo base puede introducir una ligera degradacion de calidad en comparacion con el modelo original en precision completa.
- No se proporciona informacion sobre la longitud de contexto soportada, lo que limita la planificacion de despliegues con ventanas de contexto largas.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un modelo reciente o poco probado en la comunidad.
- Al ser un modelo multimodal, el procesamiento de imagenes puede requerir recursos adicionales de memoria durante la inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nawax0x1/ChatgaiyaGemma
- Perfil del autor: https://huggingface.co/nawax0x1
- Datasets del autor: https://huggingface.co/nawax0x1/datasets
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
