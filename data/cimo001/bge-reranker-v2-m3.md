# cimo001/bge-reranker-v2-m3

## Resumen

`cimo001/bge-reranker-v2-m3` es una conversión a ONNX del reranker multilingüe `BAAI/bge-reranker-v2-m3` del Beijing Academy of Artificial Intelligence (BAAI). Se trata de un modelo de ranking de texto (cross-encoder) cuya función es puntuar la relevancia entre una consulta y un documento candidato, devolviendo un valor entre 0 y 1 mediante una sigmoide sobre el logit de salida. Es la pieza que se coloca habitualmente en la segunda fase de un pipeline RAG, después de la recuperación por embeddings, para reordenar los fragmentos recuperados por relevancia real.

La arquitectura subyacente es XLM-RoBERTa (familia de encoders transformer multilingües), reentrenada por BAAI como cross-encoder para la tarea de ranking. Esta versión concreta, publicada por el usuario `cimo001`, no aporta pesos nuevos: empaqueta el modelo original en formato ONNX en dos variantes, FP32 (`model.onnx` + `model.onnx_data`) e INT8 cuantizada (`model_quantized.onnx`), con el objetivo de permitir inferencia sin depender de PyTorch ni de la librería `transformers`.

Su relevancia práctica está en la portabilidad: al usar ONNX Runtime con tokenización directa vía SentencePiece, el modelo puede desplegarse en entornos ligeros, con aceleración por GPU o CPU, y con un footprint reducido en la variante INT8. El repositorio ocupa 2,8 GB y acumula un uso muy bajo (12 descargas, 1 like), por lo que debe tratarse como una conversión de conveniencia más que como un artefacto mantenido por el equipo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (cross-encoder para ranking) |
| Parametros totales | no disponible (el modelo base XLM-RoBERTa-base ronda los 568 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (model.onnx + model.onnx_data) e INT8 (model_quantized.onnx) |
| Idiomas soportados | multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con tokenizador SentencePiece `sentencepiece.bpe.model`) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en XLM-RoBERTa que recibe un par (consulta, documento) y produce un único logit de relevancia, transformado posteriormente con una sigmoide para obtener una puntuación en el rango 0–1. A diferencia de los bi-encoders usados en recuperación, aquí la consulta y el documento se procesan conjuntamente, lo que permite capturar interacciones token a token y mejora la precisión del ranking a costa de un mayor coste computacional por par evaluado.

El formato de entrada documentado por el autor es `[bos] prompt [eos] [eos] text [eos]`, con padding por lote hasta la secuencia más larga. La tokenización se realiza directamente con `sentencepiece.bpe.model` aplicando el remapeo de identificadores de fairseq (offset +1, unk = 3, bos = 0, pad = 1, eos = 2), sin dependencia de `transformers` ni de `tokenizers`. No se proporcionan en la información disponible detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos corresponden al modelo original de BAAI, no documentados aquí.

La innovación de esta publicación es exclusivamente de empaquetado e inferencia: exportación a ONNX con dos precisiones, un helper para construir la sesión de ONNX Runtime (selección de proveedor de ejecución, hilos y opciones de memoria) y un ejemplo de pipeline completo con tokenización, batching, inferencia y sigmoide. El autor recomienda normalizar la entrada con NFKC para obtener puntuaciones multilingües consistentes.

## Capacidades

- Ranking de texto: puntúa pares (consulta, documento) con un score de relevancia entre 0 y 1.
- Multilingüe: entrenado sobre datos en múltiples idiomas; el ejemplo de la model card muestra puntuaciones altas en inglés (0,9536) y japonés (0,9945) frente a una entrada irrelevante (0,0003).
- Reordenación en pipelines RAG: pensado para la fase de reranking tras una recuperación inicial por embeddings.
- Inferencia sin PyTorch: funciona solo con ONNX Runtime y SentencePiece.
- Ejecución en CPU y GPU: el helper permite seleccionar el proveedor de ejecución de ONNX Runtime.
- Batching: el ejemplo procesa lotes con padding dinámico hasta la secuencia más larga.
- No soporta generación de texto, tool calling, agentes ni visión; es un modelo discriminativo de ranking, no generativo.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar los N fragmentos más similares con un bi-encoder, se pasan por este cross-encoder para reordenarlos por relevancia real; el score 0–1 permite fijar un umbral de descarte antes de enviar el contexto al LLM generador.
- Búsqueda documental interna: en un buscador corporativo multilingüe, el modelo puntúa pares consulta-documento en varios idiomas, lo que resulta útil en organizaciones con documentación en castellano, inglés y otras lenguas.
- Despliegue en entornos sin PyTorch: al estar en ONNX, puede integrarse en servicios con ONNX Runtime en contenedores mínimos, sin arrastrar el stack de PyTorch ni `transformers`.
- Atención al cliente con base de conocimiento: reordenar artículos de ayuda recuperados antes de que un LLM componga la respuesta, reduciendo el riesgo de citar fragmentos poco relevantes.
- Filtrado de candidatos en motores de recomendación de contenido textual: puntuar la afinidad entre una consulta o perfil y artículos candidatos.
- Sistemas con restricciones de latencia y memoria: la variante INT8 reduce el footprint y permite ejecución en CPU con ONNX Runtime, adecuada para servicios de ranking de alto volumen donde el coste por par debe ser bajo.
- Evaluación de calidad de recuperación: usar los scores como señal para calibrar umbrales y comparar configuraciones de recuperación en un pipeline existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 2,8 GB e incluye las variantes FP32 e INT8. La variante FP32 requiere más memoria que la INT8, pero no se documentan cifras concretas.
- GPU recomendadas: no especificadas por el autor; al ejecutarse con ONNX Runtime, admite cualquier GPU compatible con el proveedor CUDA de ONNX Runtime.
- GPU de consumo: no se confirma compatibilidad concreta con modelos consumer; la variante INT8 y el soporte de CPU de ONNX Runtime hacen plausible su ejecución en hardware modesto, pero no hay datos publicados.
- Opciones de despliegue: ONNX Runtime (CPU o GPU mediante `onnxruntime-gpu`), con el helper `src/helper.py` para configurar proveedor, hilos y memoria. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cimo001/bge-reranker-v2-m3 (esta ficha) | no disponible | no disponible | ONNX (FP32 e INT8) | Apache 2.0 | Conversion de conveniencia, 12 descargas |
| BAAI/bge-reranker-v2-m3 | no disponible | no disponible | safetensors (formato original) | Apache 2.0 | Modelo original, mantenido por BAAI |
| BAAI/bge-reranker-base | no disponible | no disponible | safetensors | MIT (segun el modelo original de BAAI, no confirmado aqui) | Version base de la familia, menor coste |
| Otros cross-encoders multilingues (p. ej. mmarco) | no disponible | no disponible | variable | variable | Alternativas de ranking multilingue |

Los datos de las filas de comparación no se han verificado en la información proporcionada y se indican como referencia de categoria; consultese cada model card antes de decidir.

## Limitaciones y advertencias

- Es una conversión de terceros: el autor es `cimo001`, no BAAI; no hay garantía de mantenimiento ni de paridad exacta con el modelo original.
- Uso muy bajo (12 descargas, 1 like): no hay evidencia comunitaria de validación en producción.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Sesgos: no documentados en la información disponible; al derivar de XLM-RoBERTa, hereda los sesgos de sus datos de entrenamiento, no detallados aquí.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el score puede ser poco fiable fuera del dominio de entrenamiento o con pares muy cortos.
- Longitud de contexto: no disponible; secuencias largas pueden truncarse según la configuración de exportación.
- Tokenización manual: el remapeo de identificadores fairseq y el formato `[bos] prompt [eos] [eos] text [eos]` deben respetarse exactamente; un error aquí degrada las puntuaciones sin aviso.
- Normalización NFKC recomendada por el autor para consistencia multilingüe; omitirla puede alterar los scores.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base BAAI y los términos de los datos de entrenamiento originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cimo001/bge-reranker-v2-m3
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Repositorio BGE de BAAI: https://github.com/FlagOpen/FlagEmbedding
- ONNX Runtime: https://onnxruntime.ai/
- Paper de BGE (referencia de la familia): https://arxiv.org/abs/2309.07597
