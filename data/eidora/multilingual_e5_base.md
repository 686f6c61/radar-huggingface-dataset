# EIDORA/Multilingual_E5_Base

## Resumen

Multilingual_E5_Base es un paquete ONNX del modelo de embeddings de texto `intfloat/multilingual-e5-base`, adaptado y redistribuido por EIDORA para su Model Zoo. No se trata de un modelo nuevo ni de un fine-tuning: EIDORA parte del checkpoint original (revision fijada en `d128750597153bb5987e10b1c3493a34e5a4502a`) y exporta el encoder a ONNX opset 17, incorporando dentro del grafo el pooling por media ponderada por attention mask y la normalizacion L2. El resultado es un artefacto de inferencia autocontenido que devuelve un vector de 768 dimensiones por texto.

La arquitectura subyacente es XLM-RoBERTa, la base sobre la que Microsoft construyo la familia E5 multilingue mediante preentrenamiento contrastivo sobre pares de texto multilingues seguido de ajuste supervisado. El modelo original se describe en el informe tecnico de Wang et al. (2024) y esta pensado para recuperacion de informacion, similitud semantica y clustering de pasajes en varios idiomas, con una longitud maxima de secuencia de 512 tokens.

Su relevancia practica esta en el formato: al distribuir tokenizer, grafo ONNX y contrato de ejecucion (`config.yaml`) en un unico paquete de 1,1 GB, elimina la dependencia de PyTorch en el servidor y permite desplegar embeddings multilingues sobre ONNX Runtime con `CUDAExecutionProvider` o `CPUExecutionProvider`. La licencia MIT del checkpoint original se mantiene. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer), base del modelo E5 multilingue |
| Parametros totales | no disponible (el modelo base `intfloat/multilingual-e5-base` es de escala base; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (maximo de secuencia; la preparacion por defecto de EIDORA trunca y rellena a 512) |
| Tipos de cuantizacion | no disponible (el paquete distribuye `model.onnx` en float32; no se declaran variantes cuantizadas) |
| Idiomas soportados | multilingue; la model card cita explicitamente ruso, ingles y aleman, sin lista completa |
| Licencia | MIT (LICENSE procedente del repositorio Microsoft UniLM) |
| Formato de pesos | ONNX (opset 17), tokenizer en `tokenizer/tokenizer.json` y configuracion en `config.yaml` |

Otros datos del paquete: dimension de embedding 768, salida `float32 [batch, 768]`, similitud por coseno, pooling por media con mascara de atencion, normalizacion L2 dentro del grafo, version de paquete 1.0.0, version minima de EIDORA 0.2.6, SHA-256 del ONNX `906e235cae965554518d92c08793083acb9a531f6566aa081319db0181aba68b`.

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de tipo XLM-RoBERTa. EIDORA no entrena ni ajusta nada: reutiliza los pesos del checkpoint `intfloat/multilingual-e5-base` y anade al grafo de exportacion el pooling por media ponderada por la attention mask (de modo que las posiciones de padding quedan excluidas) y la normalizacion L2 del vector resultante. La entrada ONNX son dos tensores `int64` de forma `[batch, sequence]`, `input_ids` y `attention_mask`; la salida es un unico tensor `float32 [batch, 768]`.

El entrenamiento descrito en la model card corresponde al modelo original: preentrenamiento contrastivo sobre pares de texto multilingues seguido de ajuste supervisado, segun el informe tecnico de Wang et al. (2024). No se detalla en la informacion disponible el numero de tokens, la composicion del corpus ni si hubo etapas de RLHF o DPO, algo poco habitual en modelos de embeddings. La innovacion del paquete de EIDORA es de ingenieria de despliegue, no de modelado: grafo ONNX con dimensiones dinamicas de batch y secuencia, tokenizer empaquetado y contrato de preprocesado declarativo (longitud maxima 512, padding a la derecha, truncacion a la derecha, tokens especiales activados, sin prefijos automaticos). El grafo admite secuencias dinamicas, aunque el preparador por defecto entrega tensores de 512 tokens.

## Capacidades

- Generacion de embeddings de texto: un vector normalizado de 768 dimensiones por entrada, comparable mediante similitud coseno.
- Recuperacion multilingue: pensado para busqueda semantica y recuperacion de pasajes en varios idiomas, con convenciones de prefijo `query:` para consultas y `passage:` para documentos.
- Similitud semantica simetrica: para tareas de comparacion directa entre textos, el autor original recomienda usar el prefijo `query:` en ambos lados.
- Clustering y analisis exploratorio: agrupacion de pasajes, transcripciones, subtitulos y traducciones.
- Comparacion cross-lingue: representaciones en un espacio compartido que permiten contrastar documentos en idiomas distintos.
- Procesamiento por lotes: el grafo soporta dimension de batch dinamica.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, vision, audio ni generacion de texto: es exclusivamente un extractor de caracteristicas.
- No aplica prefijos automaticamente: el usuario debe incluir `query:` o `passage:` en el texto de entrada cuando la tarea lo requiera.

## Casos de uso

- Busqueda semantica multilingue en bases documentales: indexar pasajes con el prefijo `passage:` y consultar con `query:`, comparando por coseno en un espacio de 768 dimensiones comun a varios idiomas; adecuado porque el encoder XLM-RoBERTa alinea representaciones entre lenguas.
- Deduplicacion y near-duplicate detection de corpus: calcular embeddings de cada documento y agrupar por umbral de similitud coseno; el pooling con mascara y la normalizacion L2 dentro del grafo simplifican el pipeline al no requerir postprocesado.
- Clustering de transcripciones y subtitulos: segmentar textos largos en fragmentos de hasta 512 tokens, embeberlos y aplicar clustering para organizar archivos audiovisuales o entrevistas por tematica.
- Analisis de traducciones y control de calidad: comparar el embedding de un texto original con el de su traduccion para detectar desviaciones semanticas; la model card menciona explicitamente este uso sobre materiales de investigacion.
- RAG ligero sobre ONNX Runtime: desplegar el recuperador en el mismo proceso que el resto del servicio sin dependencia de PyTorch, usando `CPUExecutionProvider` en nodos sin GPU o `CUDAExecutionProvider` cuando haya acelerador.
- Filtrado y triaje previo en pipelines de anotacion: precalcular embeddings de un corpus y seleccionar candidatos por similitud antes de pasar un modelo generativo mas costoso, reduciendo el volumen de inferencia del modelo grande.
- Analisis exploratorio de archivos historicos o periodisticos: la model card cita expresamente noticiarios historicos y material documental como dominio de interes, con la advertencia de que el modelo no fue ajustado especificamente a ese dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de EIDORA no incluye metricas de recuperacion (nDCG, Recall@k), MTEB ni comparaciones numericas con otros modelos; solo remite al informe tecnico del modelo original para el contexto de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el paquete pesa 1,1 GB y el grafo se distribuye en float32; en la practica el modelo encaja holgadamente en GPUs de consumo, aunque el autor no publica cifras de memoria pico ni de throughput.
- GPU recomendadas: no especificadas por el autor. Al ser un encoder de escala base, cualquier GPU con soporte CUDA y suficiente memoria para el lote y la longitud de 512 tokens es candidata; no se han publicado mediciones para A100, H100 ni RTX 4090.
- GPU de consumo: por tamano del artefacto (1,1 GB en float32) es previsible que quepa en tarjetas consumer, pero no hay datos publicados que lo confirmen con cifras.
- Opciones de despliegue: ONNX Runtime con `CUDAExecutionProvider` o `CPUExecutionProvider` (los unicos proveedores declarados); el paquete esta integrado en el runtime EIDORA, version minima 0.2.6. CoreML no esta declarado en esta release. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de embeddings.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| EIDORA/Multilingual_E5_Base | no disponible (escala base XLM-R) | 512 tokens | 768 | MIT | ONNX opset 17, paquete EIDORA |
| intfloat/multilingual-e5-base | no disponible (escala base XLM-R) | 512 tokens | 768 | MIT | Pesos originales (formato no detallado en la informacion) |
| Otros modelos de embeddings multilingues | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada con precision es contra el checkpoint upstream `intfloat/multilingual-e5-base`, del que este paquete es una conversion: mismos pesos, misma dimension, mismo limite de 512 tokens y misma licencia. La diferencia esta en el empaquetado (ONNX con pooling y normalizacion embebidos frente al checkpoint original) y en la ausencia de entrenamiento adicional. No se dispone de datos para comparar con alternativas de otros proveedores.

## Limitaciones y advertencias

- Ventana de contexto fija de 512 tokens: los documentos mas largos deben segmentarse antes de embeber, lo que puede fragmentar el significado y exigir estrategias de agregacion.
- Dependencia de los prefijos: omitir `query:` o `passage:` degrada la calidad en recuperacion; EIDORA no los anade automaticamente.
- Cobertura linguistica no documentada en detalle: solo se citan ruso, ingles y aleman como ejemplos; el rendimiento puede variar entre idiomas y dominios.
- Sin ajuste especifico: el modelo no fue fine-tuneado para noticiarios historicos ni para reconocimiento de emociones; las salidas son representaciones de texto, no puntuaciones de sentimiento.
- Sensibilidad a errores de transcripcion y traduccion: la model card advierte que estos errores se propagan a los embeddings.
- Interpretacion de similitudes: los valores de coseno deben leerse en el contexto de la tarea y del dataset, no como umbrales universales.
- Riesgo de sesgo y alucinacion: no se documentan evaluaciones de sesgo en la informacion disponible; al ser un extractor de caracteristicas no genera texto, por lo que el riesgo de alucinacion se limita a representaciones sesgadas heredadas del corpus de entrenamiento original.
- Licencia: MIT, con el aviso de copyright de Microsoft UniLM incluido; no se declaran restricciones adicionales para uso comercial, pero conviene conservar la atribucion.
- Madurez del paquete: repositorio sin descargas ni likes, creado y actualizado en la misma fecha, y dependencia de una version minima concreta del runtime EIDORA (0.2.6), lo que limita la portabilidad fuera de ese ecosistema.
- Proveedores de ejecucion: CoreML no esta declarado; en macOS sin CUDA habria que recurrir a CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EIDORA/Multilingual_E5_Base
- Checkpoint original: https://huggingface.co/intfloat/multilingual-e5-base
- Informe tecnico de Multilingual E5: https://arxiv.org/abs/2402.05672
- Proyecto E5 (Microsoft UniLM): https://github.com/microsoft/unilm/tree/master/e5
- Licencia upstream: https://github.com/microsoft/unilm/blob/master/LICENSE
