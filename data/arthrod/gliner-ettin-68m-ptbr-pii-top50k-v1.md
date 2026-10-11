# arthrod/gliner-ettin-68m-ptbr-pii-top50k-v1

## Resumen

gliner-ettin-68m-ptbr-pii-top50k-v1 es un ajuste fino del modelo GLiNER sobre el encoder jhu-clsp/ettin-encoder-68m (unos 68 millones de parametros), desarrollado por el usuario arthrod. Su tarea es la deteccion de informacion personal identificable (PII) en portugues de Brasil: CPF, RG, PIS, nombres, direcciones y descripciones sensibles segun la LGPD brasileira, con etiquetas de entidad definidas por el usuario en tiempo de inferencia.

El modelo no es una version de produccion, sino una ablation dentro de un barrido de modelos GLiNER entrenados por el mismo autor sobre la misma GPU MI300X y con la misma receta de perdida. En concreto, se entreno sobre un subconjunto curado de 50.000 ejemplos durante 11.700 pasos, mientras que las variantes full-3x de la misma familia usan el conjunto completo de unas 984.000 filas y 69.000 pasos. El propio autor indica que esta variante alcanza solo 0.2732 de F1 estricto en la fuente de validacion PT-BR y generaliza mal al resto de fuentes, por lo que recomienda usar los modelos full-3x en su lugar.

Su relevancia es metodologica: documenta de forma explicita el coste de entrenar con subconjuntos curados pequenos en lugar del corpus completo, y sirve como punto de comparacion dentro de una familia de modelos de deteccion de PII con licencia Apache 2.0 que incluye alternativas de 32M, 68M, mmBERT-small y un ajuste del filtro de privacidad de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER sobre encoder bidireccional tipo transformer (jhu-clsp/ettin-encoder-68m); clasificacion a nivel de token/span |
| Parametros totales | ~68 millones (encoder base: ettin-encoder-68m) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los pesos se publican en `pytorch_model.bin` (no hay GGUF ni safetensors en el repo) |
| Idiomas soportados | portugues (portugues de Brasil) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`) por checkpoint; sin safetensors |
| Pipeline | token-classification |
| Libreria | gliner (version de entrenamiento: 0.2.25) |
| Modelo base | jhu-clsp/ettin-encoder-68m |
| Tamano del repositorio | 17,7 GB (20 carpetas `checkpoint-N/` con estado del optimizador, scheduler y RNG) |
| Pasos de entrenamiento | 11.700 (checkpoints cada 585 pasos) |
| Conjunto de entrenamiento | subconjunto curado `top_50000.jsonl` (50.000 filas) |

## Arquitectura y entrenamiento

El modelo sigue la formulacion de GLiNER: en lugar de un clasificador cerrado de entidades, el encoder procesa de forma conjunta el texto y las etiquetas de entidad proporcionadas como prompt, y produce predicciones de span a nivel de token. Esto permite definir etiquetas arbitrarias en inferencia (por ejemplo, "cpf document number" o "location zip") sin reentrenar. El backbone es ettin-encoder-68m, un encoder bidireccional de la familia Ettin del JHU CLSP, de aproximadamente 68 millones de parametros.

El entrenamiento se realizo en una GPU AMD MI300X con una receta de perdida identica a la del resto del barrido, variando solo el encoder, el subconjunto de datos, el tamano de lote y el presupuesto de pasos. En este caso: 50.000 ejemplos de alta calidad (`data/splits/top_50000.jsonl`, no publicado) y 11.700 pasos. La validacion de perdida usa 5.000 filas (`val_5k.jsonl`) y la seleccion de modelo se hizo sobre un holdout de 5.000 filas repartidas proporcionalmente entre 11 fuentes. El holdout se separo antes de construir el split de entrenamiento, por lo que no hay fuga de datos. Entre las fuentes publicas citadas estan nvidia/Nemotron-PII, ai4privacy/open-pii-masking-500k-ai4privacy y ai4privacy/pii-masking-400k; la model card se trunca al enumerar las fuentes PT-BR. No se documentan en la informacion disponible fases de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Extraccion de entidades nombradas (NER) zero-shot y few-shot mediante etiquetas definidas en tiempo de inferencia, con puntuacion de confianza por entidad.
- Deteccion de PII en portugues de Brasil: CPF, RG, PIS, telefono, correo electronico, tarjeta de credito, nombres, apellidos, fecha de nacimiento y componentes de direccion (calle, numero, barrio, ciudad, estado, abreviatura de estado, codigo postal, direccion completa).
- Soporte de etiquetas personalizadas orientadas a cumplimiento de la LGPD (descripciones de datos sensibles).
- Capacidad multilingue limitada a portugues e ingles; se evaluo generalizacion cruzada en corpus de PII en ingles/multilingue y en corpus de spam y phishing.
- Clasificacion a nivel de token/span con umbral de confianza configurable (el ejemplo oficial usa `threshold=0.3`).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio.

## Casos de uso

- Anonimizacion y enmascarado de PII en textos en portugues de Brasil: el modelo marca spans de CPF, RG, PIS, telefonos y direcciones para sustituirlos antes de almacenar o compartir el texto, apoyando requisitos de la LGPD.
- Moderacion de contenido y proteccion de datos en formularios y tickets de soporte: se ejecuta sobre el texto libre enviado por usuarios para detectar documentos y datos personales antes de persistirlos.
- Filtrado de spam y phishing con datos personales: la model card indica que se probo generalizacion en corpus de spam/phishing, lo que permite usarlo como capa de preprocesado en clasificadores de abuso.
- Auditoria de conjuntos de datos: pasar las etiquetas de PII sobre corpus internos para localizar filas con datos personales antes de publicar un dataset.
- Etiquetado asistido para construir corpus de entrenamiento: preanotar grandes volumenes de texto y revisar despues las entidades con mayor puntuacion, reduciendo el coste de anotacion manual.
- Cumplimiento y DPO en pipelines de datos: deteccion automatica de campos sensibles en registros de aplicaciones para generar informes de exposicion de datos.
- Punto de referencia para investigacion: al ser una ablation, sirve para medir el impacto de reducir el conjunto de entrenamiento a 50.000 filas frente a las variantes full-3x de la misma familia.

## Benchmarks y rendimiento

| Modelo | Conjunto de evaluacion | Metrica | Resultado |
|---|---|---|---|
| gliner-ettin-68m-ptbr-pii-top50k-v1 | Holdout PT-BR (5.000 filas, 11 fuentes) | F1 estricto | 0.2732 |
| gliner-ettin-68m-ptbr-pii-top50k-v1 | Resto de fuentes del holdout | F1 estricto | no disponible; el autor indica que generaliza "poorly" |

No se han publicado en la informacion disponible resultados numericos desglosados por fuente, ni comparaciones cifradas frente a los modelos full-3x, mmBERT-small o el filtro de privacidad de OpenAI. Existe un fichero `eval_holdout_strict_f1.parquet` en el repositorio con el F1 estricto por fuente extraido de `checkpoint-11700/trainer_state.json`, y un dataset de benchmark asociado (arthrod/gliner-opf-ptbr-pii-bench-v1) que cubre los modelos mmBERT-small y Privacy Filter, no esta variante.

## Requisitos de hardware

- Al ser un encoder de ~68 millones de parametros, la inferencia es muy ligera: aproximadamente 136 MB en fp16, unos 272 MB en fp32 y del orden de 70-140 MB en cuantizacion de 8 bits (estimacion a partir del numero de parametros; la model card no publica cifras de cuantizacion).
- Cabe sin problemas en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso GPUs integradas con suficiente memoria compartida. Tambien es viable en CPU para lotes pequenos.
- No requiere GPU de datacenter (A100, H100, MI300X) para inferencia; el MI300X solo se cita como hardware de entrenamiento.
- Despliegue: la ruta oficial es la libreria `gliner==0.2.25` con `GLiNER.from_pretrained()` sobre la ruta local de un checkpoint. La carga requiere `snapshot_download` con `allow_patterns=["checkpoint-9945/*"]` e ignorar `optimizer.pt`, `scheduler.pt` y `rng_state.pth`.
- Atencion al espacio en disco: el repositorio completo ocupa 17,7 GB porque contiene 20 checkpoints con estado de optimizador; descargar solo `checkpoint-9945` sin estados reduce el uso a unos pocos cientos de MB.
- Latencia y throughput: no disponibles en la informacion proporcionada. Para una referencia orientativa, un encoder de 68M suele procesar cientos de frases por segundo en GPU de consumo, pero no hay mediciones publicadas para este modelo.
- No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama (formatos de decoder/GGUF no aplicables al artefacto publicado).

## Comparativa con modelos similares

| Modelo | Encoder base | Datos de entrenamiento | Pasos | Licencia | Notas |
|---|---|---|---|---|---|
| gliner-ettin-68m-ptbr-pii-top50k-v1 (este) | ettin-encoder-68m | subconjunto curado de 50.000 filas | 11.700 | Apache 2.0 | Ablation; F1 estricto 0.2732 en holdout PT-BR |
| arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1 | ettin-encoder-32m | conjunto completo de ~984.000 filas | 69.000 | no disponible | El mas pequeno de la familia |
| arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1 | ettin-encoder-68m | conjunto completo de ~984.000 filas | 69.000 (estado subido hasta 58.650) | no disponible | Variante recomendada por el autor frente a esta ablation |
| arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1 | jhu-clsp/mmBERT-small | conjunto completo + 2.000 filas de Ritapolis | 69.000 | no disponible | Segun el autor, el GLiNER mas fuerte de la familia |
| arthrod/gliner-opf-ptbr-pii-v1 | OpenAI Privacy Filter (no es GLiNER) | no disponible | no disponible | no disponible | Mejor F1 parcial en validacion en distribucion y menos falsos positivos en texto sin PII |

No se dispone de una comparacion cifrada contra modelos externos (por ejemplo, otros detectores de PII en portugues de Brasil) en la informacion proporcionada.

## Limitaciones y advertencias

- Es una ablation, no un modelo recomendado: el autor indica explicitamente que "generalizes poorly to the other sources" y que deben usarse los modelos full-3x en su lugar.
- Rendimiento bajo en la fuente PT-BR de holdout: F1 estricto de 0.2732, insuficiente para despliegues de produccion con requisitos de alta exhaustividad.
- Riesgo alto de falsos negativos y de deriva entre dominios: el subconjunto curado de 50.000 filas no cubre la variedad de las 11 fuentes de evaluacion.
- Posible riesgo de falsos positivos en texto sin PII; la model card no publica metricas especificas de precision sobre texto limpio para esta variante (si menciona que el filtro de privacidad de OpenAI es el que menos falsos positivos produce).
- Cobertura linguistica limitada a portugues e ingles; no hay evidencia de comportamiento en otras lenguas.
- La longitud de contexto no esta documentada en la model card; conviene verificar la configuracion efectiva del tokenizador antes de procesar documentos largos.
- El repositorio no incluye pesos en la raiz ni safetensors: requiere descargar una subcarpeta `checkpoint-N/`, y `from_pretrained` de GLiNER 0.2.25 no acepta el argumento `subfolder`.
- El conjunto de entrenamiento (`top_50000.jsonl`) no es publico, lo que limita la reproducibilidad exacta del ajuste.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones derivadas de las fuentes de datos upstream (Nemotron-PII, ai4privacy) si se redistribuye un modelo derivado.
- Al tratarse de un modelo de deteccion de PII, los errores tienen consecuencias legales directas bajo la LGPD; se recomienda validacion humana y umbrales conservadores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-top50k-v1
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Variante hermana con encoder de 32M: https://huggingface.co/arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1
- Variante hermana con encoder de 68M y conjunto completo: https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1
- Variante con mmBERT-small: https://huggingface.co/arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1
- Ajuste del OpenAI Privacy Filter: https://huggingface.co/arthrod/gliner-opf-ptbr-pii-v1
- Dataset de benchmark: https://huggingface.co/datasets/arthrod/gliner-opf-ptbr-pii-bench-v1
- Demo Gradio: https://huggingface.co/spaces/arthrod/gliner-opf-ptbr-pii-demo
- Barrido anterior de 18 modelos x 9 conjuntos de evaluacion: https://huggingface.co/datasets/arthrod/gliner_eval_folder
- Datos de revision y comparacion de GLiNER PII: https://huggingface.co/datasets/arthrod/gliner_review_comparison
- Dataset nvidia/Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset ai4privacy/open-pii-masking-500k-ai4privacy: https://huggingface.co/datasets/ai4privacy/open-pii-masking-500k-ai4privacy
- Dataset ai4privacy/pii-masking-400k: https://huggingface.co/datasets/ai4privacy/pii-masking-400k

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; todos los enlaces anteriores proceden de la informacion del repositorio.
