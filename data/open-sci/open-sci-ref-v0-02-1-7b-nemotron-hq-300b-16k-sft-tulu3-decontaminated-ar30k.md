# open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated-ar30k

## Resumen

El modelo `open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated-ar30k` es un ajuste fino supervisado (SFT) publicado por la organizacion open-sci sobre el modelo base `ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated`. Se trata de un transformer de 1.714.377.728 parametros (aproximadamente 1,7 mil millones), distribuido en formato safetensors y pensado para su uso con la libreria `transformers`. El entrenamiento se realizo con Llama Factory sobre el dataset `AceReason-1.1-SFT-30k-sharegpt-hf`, un conjunto de datos de instrucciones en formato ShareGPT orientado a razonamiento.

El modelo pertenece a la familia de referencia "open-sci", un proyecto que parece orientado a reproducir y comparar recetas de entrenamiento sobre arquitecturas abiertas. El nombre del identificador codifica varios detalles de la receta: contexto de 16k tokens, un corpus de entrenamiento de aproximadamente 300B tokens en la cadena de modelos base, SFT sobre datos tipo Tulu3 y filtrado de contaminacion, y un subconjunto de 30k ejemplos de razonamiento (ar30k). Es relevante para desarrolladores e investigadores que quieran estudiar el efecto de un SFT adicional sobre una referencia ya ajustada, o reutilizar un checkpoint pequeno para tareas de razonamiento.

La ficha se basa unicamente en los metadatos publicados en Hugging Face y en la model card generada automaticamente por el Trainer. No hay informacion publica sobre la composicion exacta del dataset, los idiomas soportados ni resultados de evaluacion, por lo que muchos campos quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia no especificada; probablemente derivada de Nemotron) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no es MoE segun los metadatos) |
| Longitud de contexto | 16k tokens (segun el identificador del modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no detallados en la model card) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | feature-extraction |
| Tamano del repositorio | 3.4 GB |
| Modelo base | ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la model card, pero el identificador y el modelo base apuntan a un transformer decoder-only de aproximadamente 1,7 mil millones de parametros, con una ventana de contexto de 16k tokens y un preentrenamiento previo sobre un corpus de aproximadamente 300B tokens (indicado por "300B" en el nombre). El modelo base ya habia pasado por un SFT sobre datos tipo Tulu3 con filtrado de contaminacion, por lo que este checkpoint representa una segunda etapa de ajuste fino supervisado sobre el dataset `AceReason-1.1-SFT-30k-sharegpt-hf`, un conjunto de 30.000 ejemplos en formato ShareGPT orientado a razonamiento.

Los hiperparametros de entrenamiento documentados son: learning rate de 4e-05, batch total de 128 (batch de 1 por dispositivo, 4 pasos de acumulacion de gradiente y 32 dispositivos), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup del 10 %, semilla 42 y 5 epocas. El ajuste se realizo con Llama Factory sobre Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documentan tecnicas adicionales como RLHF, DPO, decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva y ajuste a instrucciones en formato conversacional (ShareGPT).
- Razonamiento de varios pasos, segun el enfasis del dataset de entrenamiento (AceReason).
- Capacidad de extraccion de caracteristicas (feature-extraction), declarada como pipeline principal en los metadatos.
- Soporte de contexto de hasta 16k tokens, adecuado para documentos y conversaciones largas.
- Tool calling / function calling: no disponible en la informacion publicada.
- Capacidades de agente y uso de herramientas externas: no disponible.
- Capacidades multilingues: no disponible; el dataset de entrenamiento parece estar en ingles.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Generacion de respuestas razonadas en asistentes conversacionales: el modelo puede gestionar dialogos multi-turno con hasta 16k tokens de contexto, lo que permite mantener historial extenso y documentos de referencia en la misma ventana.
- Prototipado de pipelines de razonamiento sobre datos ShareGPT: al estar entrenado especificamente sobre `AceReason-1.1-SFT-30k-sharegpt-hf`, es util para reproducir y comparar recetas de SFT en entornos de investigacion.
- Extraccion de caracteristicas y embeddings para clasificacion o recuperacion: el pipeline declarado es `feature-extraction`, por lo que puede emplearse como encoder de frases o representaciones intermedias en tareas de NLP.
- Evaluacion de contaminacion y calidad de datos: al formar parte de una familia "decontaminated", sirve como referencia para estudiar el impacto del filtrado en el rendimiento downstream.
- Fine-tuning posterior en dominios verticales: con 1,7B parametros y pesos safetensors, es viable ajustarlo en una unica GPU de 24-48 GB con tecnicas de parametros eficientes (LoRA/QLoRA).
- Educacion e investigacion sobre recetas de entrenamiento: los hiperparametros y el dataset estan documentados, lo que facilita replicar el experimento y analizar el efecto de cada decision.
- Generacion de codigo o matematicas: no hay evidencia publicada de rendimiento especifico en estas tareas; usarlo en produccion para ellas requeriria validacion previa.

## Benchmarks y rendimiento

La model card incluye un `model-index` con la entrada `sft__AceReason-1-1-SFT-30k-sharegpt-hf__open-sci-re-87f151cf__sdpa-open-sci-steps`, pero la lista de resultados esta vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,8-2,5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1-1,5 GB de pesos.
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegues con concurrencia alta y contexto de 16k.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) e incluso en GPUs de 8 GB con cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), y previsiblemente vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b-...-ar30k (este modelo) | 1,71B | 16k | other | Hugging Face, 17 descargas |
| Modelo base: ali-elganzory/open-sci-ref-v0.02-1.7b-...-Tulu3-decontaminated | no disponible | 16k (segun nombre) | other | Hugging Face |
| Alternativas de ~1,7B (p. ej. Qwen2.5-1.5B, Llama-3.2-1B/3B, SmolLM2-1.7B) | 1-3B | 4k-128k segun modelo | Apache-2.0 / Llama / otras | Hugging Face, ampliamente adoptados |

No se dispone de datos de rendimiento comparativo entre este modelo y las alternativas mencionadas; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones "More information needed"; no hay documentacion sobre usos previstos, limitaciones ni datos de evaluacion.
- Licencia "other": los terminos concretos no estan detallados, por lo que el uso comercial requiere revisar la licencia del modelo base y del repositorio original.
- Riesgo de alucinacion inherente a modelos de 1,7B ajustados con SFT; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no documentados; el dataset de entrenamiento parece estar en ingles, por lo que el rendimiento en castellano es incierto.
- Contexto de 16k tokens segun el identificador, pero sin verificacion empirica publicada.
- Sin soporte documentado de tool calling, agentes o modos de razonamiento explicito.
- Numero de descargas muy bajo (17) y sin "likes", lo que sugiere poca validacion por parte de la comunidad.
- El pipeline declarado es `feature-extraction`, no `text-generation`; conviene verificar la configuracion antes de usarlo como generador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated-ar30k
- Modelo base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Transformers: https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, repositorios o demos adicionales en la busqueda web realizada.
