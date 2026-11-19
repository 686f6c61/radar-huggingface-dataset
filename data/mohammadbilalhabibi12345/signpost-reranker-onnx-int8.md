# MohammadBilalHabibi12345/signpost-reranker-onnx-int8

## Resumen

`signpost-reranker-onnx-int8` es una exportación a ONNX con cuantización dinámica int8 del modelo `BAAI/bge-reranker-v2-m3`, un cross-encoder de reranking desarrollado originalmente por BAAI. El autor de esta conversión, MohammadBilalHabibi12345, la publica como componente del proyecto Signpost, cuyo objetivo es ejecutar reranking de pasajes recuperados sobre CPU sin depender de PyTorch ni de GPU. El modelo base es un cross-encoder multilingüe derivado de la familia BGE-M3, diseñado para puntuar pares (consulta, pasaje) y reordenar resultados de un sistema de recuperación.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue ligera: un único fichero `model.onnx` de aproximadamente 570 MB con pesos QInt8, tokenizer original y metadatos de exportación, lo que simplifica la integración en pipelines de búsqueda semántica en entornos con recursos limitados. Según la model card, la diferencia media absoluta de puntuación frente al modelo PyTorch fp32 es de 0,015 (máximo 0,11) sobre 100 pares consulta-pasaje, y el mejor pasaje coincide en 10 de 10 consultas evaluadas, con una mejora de velocidad de aproximadamente 1,5x en una CPU de portátil de 4 núcleos.

No se dispone de información sobre arquitectura interna detallada, número de parámetros ni longitud de contexto en la información proporcionada; estos datos deben consultarse en la model card del modelo base `BAAI/bge-reranker-v2-m3`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder (base: BAAI/bge-reranker-v2-m3); exportado a ONNX (opset 17) con cuantización dinámica QInt8 |
| Parametros totales | no disponible (depende del modelo base; no indicado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (QInt8 weights) sobre ONNX Runtime; el modelo base admite otras cuantizaciones no documentadas aquí |
| Idiomas soportados | no disponible en esta ficha; el modelo base BGE-M3 es multilingüe, pero no se detalla en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, ~570 MB), tokenizer en JSON (`tokenizer.json`, `tokenizer_config.json`), metadatos en `export_info.json` |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe un par (consulta, pasaje) y produce un único logit de relevancia, al que se aplica una sigmoid para obtener una puntuación entre 0 y 1. Esta arquitectura es adecuada para la etapa de reranking en pipelines de recuperación, donde se reordena un conjunto pequeño de candidatos previamente recuperados por un retriever bi-encoder. El modelo base, `BAAI/bge-reranker-v2-m3`, pertenece a la familia BGE-M3 de BAAI; los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se recogen en la información proporcionada y deben consultarse en la model card del modelo original.

La innovación técnica de esta ficha es puramente de despliegue: el autor realizó una exportación TorchScript a ONNX con opset 17 mediante el script `scripts/export_reranker.py`, seguida de cuantización dinámica con ONNX Runtime (pesos QInt8). Las versiones y ajustes exactos se documentan en `export_info.json` dentro del repositorio. No se mencionan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas, ya que no aplican a un cross-encoder de clasificación.

## Capacidades

- Puntuación de relevancia consulta-pasaje: genera un logit por par, convertible a probabilidad 0-1 mediante sigmoid.
- Reranking de resultados de búsqueda: reordena pasajes recuperados por un retriever previo.
- Clasificación de texto en pipeline `text-classification` (según los tags del repositorio).
- Ejecución en CPU: pensado para inferencia sin GPU mediante ONNX Runtime.
- Integración ligera: un único fichero ONNX más tokenizer, sin dependencia de PyTorch en tiempo de inferencia.
- Capacidades multilingües: no confirmadas en la información proporcionada para esta exportación; el modelo base BGE-M3 es multilingüe, pero no se detalla el conjunto de idiomas.
- Tool calling / function calling: no disponible; no es una capacidad de este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no está diseñado para generación ni para razonamiento agéntico.
- Modo thinking, visión o audio: no disponible; no aplica.

## Casos de uso

- Reranking en motores de búsqueda semántica: tras recuperar los N candidatos con un bi-encoder, el cross-encoder puntúa cada par (consulta, pasaje) y reordena; su ejecución en CPU permite desplegarlo en el mismo nodo que el retriever sin GPU dedicada.
- Búsqueda documental interna en empresas: indexación de manuales, políticas o bases de conocimiento y reranking de los fragmentos recuperados para mejorar la precisión de las respuestas mostradas al usuario.
- Sistemas RAG (retrieval-augmented generation) en producción: filtrado y ordenación de pasajes antes de pasarlos al LLM generador, reduciendo contexto irrelevante y coste de tokens; la licencia Apache-2.0 facilita su uso comercial.
- Atención al cliente automatizada: reranking de artículos de ayuda o FAQ recuperados para una consulta de usuario, garantizando que el fragmento más relevante se sitúe primero antes de la respuesta.
- Despliegue en entornos con recursos limitados: servidores sin GPU, portátiles de desarrollo o dispositivos edge donde un modelo fp32 en PyTorch no es viable; el fichero ONNX int8 de ~570 MB y la mejora de ~1,5x en CPU de 4 núcleos lo hacen práctico.
- Evaluación y experimentación offline: integración en scripts de evaluación de recuperación (por ejemplo, cálculo de nDCG o MRR) donde se necesita puntuar muchos pares consulta-pasaje con bajo coste computacional.
- Búsqueda multilingüe: si se confirma el multilingüismo heredado del modelo base, podría usarse para reranking en aplicaciones con consultas y documentos en varios idiomas; conviene validarlo empíricamente antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un cross-encoder de reranking. La model card sí reporta una evaluación comparativa frente al modelo PyTorch fp32:

| Metrica | Resultado |
|---|---|
| Diferencia media absoluta de puntuación (100 pares consulta-pasaje) | 0,015 |
| Diferencia máxima absoluta de puntuación | 0,11 |
| Coincidencia del mejor pasaje | 10/10 consultas |
| Aceleración en CPU de portátil de 4 núcleos | ~1,5x |

No se proporcionan métricas de calidad de recuperación (nDCG, MRR, recall) ni comparaciones con otros rerankers.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el fichero ONNX de ~570 MB requeriría del orden de 1-2 GB de VRAM incluyendo buffers de ejecución (estimación orientativa, no confirmada en la información proporcionada).
- GPU recomendadas: no especificadas; el modelo está optimizado para CPU. Cualquier GPU con soporte de ONNX Runtime (por ejemplo, serie RTX o A100/H100) podría ejecutarlo, pero no se documenta.
- Compatibilidad con GPU de consumo: sí, en principio cualquier GPU con al menos 2 GB de VRAM podría alojar el modelo, aunque el caso de uso declarado es CPU.
- Opciones de despliegue: ONNX Runtime (principal), potencialmente integrable en servidores de inferencia compatibles con ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card reporta ~1,5x de aceleración frente a PyTorch fp32 en una CPU de portátil de 4 núcleos; no se ofrecen cifras absolutas de latencia ni de pares por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| signpost-reranker-onnx-int8 | Cross-encoder reranker | ONNX | int8 dinámica | Apache-2.0 | Exportación CPU-first del modelo BGE; ~570 MB |
| BAAI/bge-reranker-v2-m3 | Cross-encoder reranker | safetensors (PyTorch) | fp32/fp16 | Apache-2.0 | Modelo base; referencia de calidad; requiere PyTorch |
| BAAI/bge-reranker-base | Cross-encoder reranker | safetensors (PyTorch) | fp32/fp16 | MIT (según model card original) | Alternativa más pequeña de la familia BGE; menor coste, posible menor precisión |
| BAAI/bge-reranker-large | Cross-encoder reranker | safetensors (PyTorch) | fp32/fp16 | MIT (según model card original) | Mayor capacidad que base; más coste computacional |

No se dispone de datos de rendimiento comparativo (nDCG, MRR) entre estas alternativas en la información proporcionada; las licencias de los modelos base se indican según lo habitualmente publicado y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al heredar el comportamiento del modelo base, pueden persistir sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo (el modelo no genera texto), pero puede asignar puntuaciones altas a pasajes irrelevantes o contradictorios; conviene calibrar el umbral de relevancia.
- Limitaciones de contexto o idioma: la longitud máxima de contexto no se especifica en esta ficha; el soporte multilingüe no está confirmado para esta exportación concreta y debe validarse.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución; se recomienda conservar el aviso de licencia y reconocer a BAAI como autor original del modelo base.
- Caveats para producción: la cuantización int8 introduce una desviación de puntuación (media 0,015, máxima 0,11), lo que puede alterar el orden en casos de puntuaciones muy próximas; el repositorio tiene 0 descargas y 0 likes, por lo que carece de validación comunitaria; verificar el hash y la procedencia del fichero ONNX antes de desplegarlo.
- Dependencia de ONNX Runtime: el rendimiento depende de la versión de ONNX Runtime y del hardware; los resultados de velocidad reportados corresponden a un portátil de 4 núcleos y no son extrapolables a otros entornos.
- No es un modelo generativo: no debe usarse para responder preguntas directamente ni para tareas de razonamiento; su función es exclusivamente puntuar y reordenar pares consulta-pasaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MohammadBilalHabibi12345/signpost-reranker-onnx-int8
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Proyecto Signpost: https://github.com/mohammadbilalhabibi/Signpost
- Script de exportación mencionado: `scripts/export_reranker.py` (dentro del repositorio Signpost)
- Metadatos de exportación: `export_info.json` (incluido en el repositorio de Hugging Face)
