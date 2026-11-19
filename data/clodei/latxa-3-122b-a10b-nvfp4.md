# CLODEI/Latxa-3-122B-A10B-NVFP4

## Resumen

Latxa-3-122B-A10B-NVFP4 es una cuantizacion no oficial en NVFP4 del modelo Latxa 3 de HiTZ (UPV/EHU), un modelo linguistico especializado en euskera construido sobre la arquitectura Qwen3.5-122B-A10B. El modelo original es un transformer de tipo Mixture-of-Experts (MoE) con 122.562.817.776 parametros totales y aproximadamente 10B parametros activos por token, lo que permite un equilibrio entre capacidad y coste computacional en inferencia. Esta version cuantizada reduce el peso de 245 GB en BF16 a unos 75 GB, lo que la hace desplegable en una unica GPU de 96 GB.

La relevancia de esta ficha radica en dos factores. Primero, Latxa 3 es una de las apuestas mas serias para el euskera en el ambito open source, un idioma con escasa representacion en los grandes modelos generalistas. Segundo, la cuantizacion NVFP4 con receta `nvfp4_experts_only-kv_fp8` demuestra que es posible servir un MoE de 122B en hardware de una sola GPU manteniendo atencion, expertos compartidos, router, embeddings y vision en BF16, y solo los expertos enrutados en FP4. El modelo es multimodal (image-text-to-text) y soporta euskera, ingles y castellano.

Esta es una publicacion de la comunidad (CLODEI), no de HiTZ, y no se han ejecutado suites de benchmarks completas, por lo que las cifras de calidad deben tomarse con cautela respecto a las versiones BF16 y FP8 oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Qwen3.5, con atencion lineal y vision |
| Parametros totales | 122.562.817.776 |
| Parametros activos | Aproximadamente 10B (denominacion A10B) |
| Longitud de contexto | 65.536 tokens en la configuracion de servicio indicada (`--max-model-len 65536`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1, bloque 16, escalas FP8) solo en expertos MoE enrutados; KV cache en FP8; resto en BF16 |
| Idiomas soportados | Euskera (eu), ingles (en), castellano (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato ModelOpt, compatible con vLLM via `modelopt_fp4`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia Qwen3.5 con 122B parametros totales y unos 10B activos por token, e incluye componentes de atencion lineal, expertos compartidos, router y un modulo de vision que lo habilita para tareas image-text-to-text. Latxa 3 anade un ajuste especifico para euskera sobre esa base, orientado a conversacion y con modo de razonamiento (thinking) como unico modo de operacion segun la model card.

La cuantizacion se realizo con NVIDIA TensorRT Model Optimizer 0.48 bajo la receta `nvfp4_experts_only-kv_fp8`, identica en disposicion a `nvidia/Qwen3.5-122B-A10B-NVFP4`. Solo los expertos MoE enrutados se cuantizan a NVFP4; atencion, atencion lineal, expertos compartidos, router, embeddings, lm_head y vision permanecen en BF16, y la KV cache se almacena en FP8. La calibracion uso 1024 muestras de hasta 2048 tokens: 512 de nvidia/Nemotron-Post-Training-Dataset-v2 (chat, STEM, matematicas y codigo, CC-BY-4.0), 256 de cnn_dailymail y 256 documentos en euskera del split de validacion de HiTZ/latxa-corpus-v2. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre las etapas de RLHF/DPO aplicadas por HiTZ.

## Capacidades

- Generacion de texto conversacional multi-turno en euskera, castellano e ingles.
- Razonamiento explicito en modo thinking (el modelo solo soporta este modo, segun la model card).
- Procesamiento de imagen y texto (pipeline image-text-to-text), con el modulo de vision en BF16.
- Razonamiento matematico y generacion de codigo, verificado con comprobaciones rapidas por el autor.
- Capacidades multilingues limitadas a eu, en y es.
- Compatibilidad con vLLM mediante `--quantization modelopt_fp4` y `--kv-cache-dtype fp8`.
- Parser de razonamiento `qwen3` disponible en vLLM para separar el bloque de pensamiento de la respuesta final.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada, aunque el modo thinking es compatible con flujos multi-paso.
- Decodificacion especulativa MTP: no disponible, el checkpoint carece de cabeza MTP.

## Casos de uso

- Atencion al cliente en euskera: el modelo puede gestionar conversaciones multi-turno con hasta 65.536 tokens de contexto y una KV cache de aproximadamente 715K tokens en una RTX PRO 6000, lo que permite mantener historiales largos y documentacion de referencia en la misma sesion.
- Generacion de contenido editorial en euskera: redaccion, resumen y reescritura de textos con calidad nativa en euskera, aprovechando el ajuste especifico de HiTZ sobre el corpus latxa-corpus-v2.
- Asistencia documental multimodal: al aceptar imagen y texto, puede extraer y razonar sobre el contenido de capturas, formularios o diagramas combinados con instrucciones en euskera o castellano.
- Razonamiento matematico y STEM en entornos educativos: el modo thinking permite cadenas de razonamiento largas, adecuadas para explicar pasos intermedios en problemas de matematicas o fisica.
- Generacion y revision de codigo en pipelines de desarrollo: el modelo puede integrarse en flujos de CI/CD o asistentes de IDE para tareas de explicacion, refactorizacion y deteccion de errores, con el bloque de pensamiento separado mediante el parser qwen3.
- Traduccion y adaptacion cultural entre euskera, castellano e ingles: util para administraciones publicas y medios de comunicacion que necesitan versiones coherentes en los tres idiomas.
- Despliegue en infraestructura de una sola GPU: al caber en 96 GB, es viable para equipos de investigacion o pymes que no disponen de clusters multi-GPU, sirviendo aproximadamente 77 tok/s con un usuario y unos 260 tok/s totales con 8 usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que solo se han realizado comprobaciones rapidas en euskera, castellano, ingles, matematicas y codigo, con respuestas correctas, y que la calidad puede diferir ligeramente de las versiones BF16 y FP8.

Rendimiento medido por el autor (1x RTX PRO 6000, vLLM 0.32.0, contexto 64K):

| Metrica | Valor |
|---|---|
| Throughput, 1 usuario | ~77 tok/s |
| Throughput por usuario, 4 usuarios | ~57 tok/s |
| Throughput por usuario, 8 usuarios | ~46 tok/s |
| Throughput total, 8 usuarios | ~260 tok/s |
| Capacidad de KV cache | ~715K tokens |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 75 GB de pesos en NVFP4, mas la KV cache en FP8 (aproximadamente 715K tokens en 96 GB), lo que deja margen para el contexto de 64K.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB), validada por el autor. Cualquier GPU con 96 GB o mas y soporte de FP4 deberia ser compatible.
- Cabe en GPU consumer: no en las RTX 4090 (24 GB) ni 5090 (32 GB) por si solo; requiere hardware profesional de 96 GB o un despliegue multi-GPU con particionado.
- Opciones de despliegue: vLLM con `--quantization modelopt_fp4 --kv-cache-dtype fp8 --max-model-len 65536 --reasoning-parser qwen3`. Otros motores (llama.cpp, Ollama, TGI) no estan documentados para este formato NVFP4 en la informacion disponible.
- Latencia y throughput: ver tabla de la seccion de benchmarks; aproximadamente 77 tok/s con un usuario y 260 tok/s totales con 8 usuarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CLODEI/Latxa-3-122B-A10B-NVFP4 | 122B totales, ~10B activos | 64K en servicio | Apache-2.0 | Hugging Face, vLLM | Cuantizacion NVFP4 no oficial, ~75 GB |
| HiTZ/Latxa-3-122B-A10B | 122B totales, ~10B activos | No disponible | Apache-2.0 | Hugging Face | Modelo base oficial en BF16 (245 GB) |
| nvidia/Qwen3.5-122B-A10B-NVFP4 | 122B totales, ~10B activos | No disponible | No disponible | Hugging Face | Misma receta de cuantizacion, sin ajuste en euskera |
| Versiones FP8 de Latxa 3 | No disponible | No disponible | Apache-2.0 | No disponible | Mencionadas por el autor como referencia de calidad |

## Limitaciones y advertencias

- Cuantizacion no oficial: no es una publicacion de HiTZ y la calidad puede diferir de las versiones BF16 y FP8; no se han ejecutado benchmarks completos.
- Solo modo thinking: el modelo no ofrece respuestas directas sin razonamiento, lo que incrementa el consumo de tokens y la latencia; debe configurarse un `max_tokens` amplio.
- Sin cabeza MTP: no es posible la decodificacion especulativa multi-token, lo que limita el throughput maximo alcanzable.
- Cobertura linguistica restringida a euskera, castellano e ingles; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la falta de evaluacion estandarizada en esta version cuantizada.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Requisito de hardware elevado: 96 GB de VRAM para el despliegue en una sola GPU; no cabe en GPUs consumer.
- Compatibilidad limitada de motores: el formato ModelOpt NVFP4 esta documentado para vLLM; otros runtimes no estan verificados.
- Licencia Apache-2.0 permisiva para uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLODEI/Latxa-3-122B-A10B-NVFP4
- Modelo base: https://huggingface.co/HiTZ/Latxa-3-122B-A10B
- Referencia de cuantizacion NVFP4: https://huggingface.co/nvidia/Qwen3.5-122B-A10B-NVFP4
- Dataset de calibracion: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Corpus de euskera: https://huggingface.co/datasets/HiTZ/latxa-corpus-v2
- Dataset cnn_dailymail: https://huggingface.co/datasets/cnn_dailymail
- NVIDIA TensorRT Model Optimizer: no disponible en la informacion proporcionada
- Paper, blog o demo oficial de Latxa 3: no disponible en la informacion proporcionada
