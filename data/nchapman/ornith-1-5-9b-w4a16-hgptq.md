# nchapman/Ornith-1.5-9B-W4A16-HGPTQ

## Resumen

Ornith-1.5-9B-W4A16-HGPTQ es una cuantizacion de 4 bits del modelo multimodal ornith-ai/Ornith-1.5-9B, publicada por el usuario nchapman. El checkpoint original es un modelo de 9.409.813.744 parametros (~9,41 mil millones) que procesa texto e imagenes (pipeline image-text-to-text) y que, segun los tags del repositorio, emplea la arquitectura qwen3_5, con bloques hibridos de GatedDeltaNet y atencion completa. Esta version cuantizada reduce el peso del checkpoint de 17,98 GiB en BF16 a 7,62 GiB, un factor de compresion de 2,36x.

La relevancia de esta ficha radica en que demuestra una tecnica de cuantizacion poco habitual: GPTQ con rotacion Hadamard en linea y descomposicion de Cholesky (HGPTQ), aplicada de forma simultanea a las capas de texto, al cabezal de prediccion multi-token (MTP) nativo y al codificador visual. Ademas, la model card publica una evaluacion comparativa detallada frente al modelo base en BF16, lo que permite cuantificar la perdida de calidad por perplexity, divergencia KL y precision Top-1 en tareas de vision y borrador especulativo.

El modelo esta pensado para despliegue en produccion con vLLM y compressed-tensors, con licencia Apache 2.0, lo que facilita su uso comercial. No obstante, se trata de un artefacto de cuantizacion derivado: su comportamiento, capacidades y limitaciones heredan las del modelo base, del cual la informacion disponible en esta busqueda es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con bloques GatedDeltaNet y atencion completa (familia qwen3_5), con MTP nativo y torre de vision ViT |
| Parametros totales | 9.409.813.744 (~9,41 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), group size 64; GPTQ con rotacion Hadamard en linea y Cholesky (HGPTQ); formato compressed-tensors |
| Idiomas soportados | No disponible en la informacion proporcionada (la evaluacion menciona prompts multilingues) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura hibrida de 32 bloques que combina capas GatedDeltaNet (atencion lineal con estado recurrente) y capas de atencion completa, segun se deduce de la descripcion de las 200 capas lineales cuantizadas (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj_qkv`, `in_proj_z`, `out_proj`, `gate_proj`, `up_proj`, `down_proj`). Incluye un modulo de prediccion multi-token (MTP) nativo con 7 capas lineales, utilizado como borrador para decodificacion especulativa, y una torre de vision de 27 bloques ViT mas dos proyecciones de fusion espacial (merger). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La innovacion tecnica de este checkpoint es el esquema de cuantizacion HGPTQ. Antes de cuantizar, los pesos se rotan offline a lo largo de la dimension de entrada mediante una matriz de Walsh-Hadamard de Sylvester determinista (`W' = W H_b / sqrt(b)`), con `b=64` para la mayoria de capas y `b=16` para `v_vision_fc2`. En tiempo de ejecucion se aplica la misma rotacion a las activaciones de entrada antes de la GEMM W4A16, mediante HadaCore y `CompressedTensorsLinearTransformMethod`. Como la matriz es determinista (`randomize: false`), no se almacenan matrices de transformacion en el checkpoint, lo que elimina sobrecoste de almacenamiento. La cuantizacion usa GPTQ con descomposicion de Cholesky, `group_size=64` y `actorder="static"`, y se aplica a 317 capas lineales en total: 200 de texto, 7 del MTP y 110 de vision. Se mantienen en BF16 `embed_tokens`, `lm_head`, `in_proj_a`, `in_proj_b`, `mtp.fc`, `visual.patch_embed.proj`, normas y sesgos. La calibracion se realizo, segun la busqueda web, con 999 muestras de nvidia/Nemotron-Cascade-2-SFT-Data respetando las proporciones del dataset.

## Capacidades

- Generacion de texto conversacional con modo chat, segun la configuracion de generacion (`temperature 1.0`, `top_p 0.95`, `top_k 20`).
- Razonamiento matematico y cientifico: la evaluacion de perplexity incluye prompts de matematicas y ciencia.
- Generacion de codigo: la evaluacion de texto contempla prompts de programacion.
- Uso de herramientas (tool use): incluido explicitamente en el conjunto de evaluacion de perplexity de texto.
- Capacidades multilingues: la evaluacion incluye prompts multilingues, aunque no se detallan los idiomas concretos.
- Vision multimodal: respuesta a preguntas sobre imagenes (VQA), interpretacion de graficos, documentos y OCR.
- Comprension de interfaces de usuario y capturas de pantalla (evaluado con ScreenSpot) y OCR matematico.
- Decodificacion especulativa nativa mediante el modulo MTP, que actua como borrador para acelerar la generacion.
- Compatibilidad con vLLM y compressed-tensors para servir el modelo en produccion.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno de texto con un checkpoint de 7,62 GiB, lo que permite desplegarlo en una unica GPU con memoria moderada y atender peticiones concurrentes mediante vLLM.
- Extraccion de datos de documentos: gracias a su capacidad de OCR y VQA, puede procesar facturas, formularios e informes escaneados y devolver campos estructurados, usando la torre de vision cuantizada con una perdida de precision Top-1 de solo el 3,97 % frente a BF16.
- Analisis de graficos y dashboards: la evaluacion especifica de graficos y documentos sugiere su uso para interpretar capturas de paneles de control y responder preguntas sobre tendencias o valores.
- Automatizacion de interfaces (RPA visual): la evaluacion con ScreenSpot indica capacidad para localizar elementos en capturas de pantalla, util en agentes que operan aplicaciones de escritorio o web.
- Asistente de programacion en pipelines de CI/CD: el soporte de tool use y generacion de codigo permite integrarlo en flujos que invocan funciones externas (ejecucion de tests, consulta de repositorios) con una penalizacion de perplexity de solo el 2,45 % respecto al modelo sin cuantizar.
- Generacion acelerada en produccion: el modulo MTP conserva un 94,11 % de precision Top-1 como borrador aislado, lo que permite activar decodificacion especulativa en vLLM para reducir la latencia por token generado.
- Despliegue en entornos con VRAM limitada: el checkpoint de 7,62 GiB cabe en GPUs de consumo con 12-16 GB de VRAM, lo que habilita prototipado local de un modelo multimodal de 9B sin infraestructura de centro de datos.

## Benchmarks y rendimiento

La model card proporciona una evaluacion comparativa directa frente al modelo base en BF16 (evaluacion teacher-forced, no benchmarks estandar como MMLU o HumanEval):

| Evaluacion | BF16 base | W4A16-HGPTQ | Variacion |
|---|---:|---:|---:|
| Tamano de safetensors | 17,98 GiB | 7,62 GiB | 2,36x mas pequeno |
| Perplexity de texto (378 prompts, 840k tokens) | 6,6829 | 6,8463 | +2,45 % |
| Divergencia KL de texto (ponderada / media por token) | 0,0000 | 0,1835 / 0,7255 | No aplica |
| Perplexity holdout general y multilingue (76 prompts, 20k tokens) | 15,0115 | 15,6462 | +4,23 % |
| MTP nativo, Top-1 (11.583 posiciones) | 100,0 % (NLL 2,8335) | 94,11 % (NLL 2,8504) | -5,89 puntos |
| MTP nativo, Top-1 extremo a extremo | No disponible | 77,22 % (KL 0,5436) | No aplica |
| Vision VQA, graficos, documentos y OCR, similitud coseno / Top-1 (96 imagenes) | 1,0000 / 100,0 % | 0,9790 / 96,03 % | -3,97 puntos Top-1 |
| Vision UI, ScreenSpot y OCR matematico, similitud coseno / Top-1 (48 imagenes) | 1,0000 / 100,0 % | 0,9829 / 96,30 % | -3,70 puntos Top-1 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB para los pesos en W4A16 (7,62 GiB) mas overhead de activaciones, cache KV y contexto; el consumo real depende de la longitud de contexto y del numero de secuencias concurrentes, dato no disponible.
- GPUs recomendadas: A100, H100 o L40S para despliegue de produccion con vLLM; RTX 4090 (24 GB) para inferencia de alta concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) para contexto moderado y una sola secuencia; con 16 GB hay margen para lotes mayores.
- Opciones de despliegue: vLLM con compressed-tensors es la ruta soportada explicitamente por el autor; transformers como libreria declarada. No se menciona soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion especulativa via MTP puede reducir la latencia, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-W4A16-HGPTQ (este) | 9,41 B | No disponible | Texto + imagen | Apache 2.0 | Hugging Face, 0 descargas |
| ornith-ai/Ornith-1.5-9B (base BF16) | 9,41 B | No disponible | Texto + imagen | Apache 2.0 | Hugging Face |
| nchapman/Ornith-1.5-9B-W4A16-GPTQ | 9,41 B | No disponible | Texto + imagen | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento de benchmarks estandar para establecer una comparacion cuantitativa con modelos de otras familias; la unica comparacion documentada es frente al modelo base en BF16 y frente a la variante GPTQ del mismo autor, cuyos resultados no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad medible: +2,45 % de perplexity en texto, +4,23 % en el holdout multilingue y una caida de hasta 5,89 puntos en la precision Top-1 del borrador MTP.
- El rendimiento del MTP extremo a extremo cae al 77,22 % de Top-1, lo que reduce la eficacia de la decodificacion especulativa frente al modelo BF16.
- La rotacion Hadamard en linea exige un runtime compatible con compressed-tensors y HadaCore; otros motores de inferencia pueden no soportar el `transform_config` y producir resultados incorrectos si ignoran la rotacion de activaciones.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo conversacional de 9B, cabe esperar alucinaciones en tareas de conocimiento factual, pero no hay evaluacion publicada al respecto.
- Idiomas soportados no confirmados: la evaluacion incluye prompts multilingues, pero no se especifica que idiomas cubre con calidad.
- Longitud de contexto no disponible, lo que impide garantizar el rendimiento en tareas de contexto largo.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni validacion independiente de los resultados reportados por el autor de la cuantizacion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base podria tener terminos adicionales no reflejados en esta ficha; conviene verificar la model card de ornith-ai/Ornith-1.5-9B antes de desplegar.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/nchapman/Ornith-1.5-9B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Variante GPTQ del mismo autor: https://huggingface.co/nchapman/Ornith-1.5-9B-W4A16-GPTQ
- Dataset de calibracion: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
