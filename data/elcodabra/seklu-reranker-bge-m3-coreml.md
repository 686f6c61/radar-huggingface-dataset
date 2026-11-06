# elcodabra/seklu-reranker-bge-m3-coreml

## Resumen

seklu-reranker-bge-m3-coreml es una conversión a Core ML del modelo BAAI/bge-reranker-v2-m3, un cross-encoder multilingüe desarrollado originalmente por el Beijing Academy of Artificial Intelligence (BAAI). El autor de la conversión es elcodabra, y el artefacto está pensado para la búsqueda "thorough" (exhaustiva) de Seklu / Finder+ en macOS: recibe una consulta y hasta ocho pares consulta-pasaje, y devuelve una puntuación de relevancia por par que permite reordenar los resultados de un motor de búsqueda vectorial previo.

El modelo base es un cross-encoder derivado de la familia BGE-M3, con vocabulario XLM-R SentencePiece, y la conversión mantiene los mismos identificadores de token que multilingual-e5. La versión distribuida usa pesos int8 con cómputo fp16 y una forma fija de 8×256 tokens (ocho pares consulta-pasaje de hasta 256 tokens, con relleno a 1). El paquete pesa aproximadamente 0,5 GB y se ejecuta en macOS 15 o superior sobre CPU y GPU, no sobre la Neural Engine.

Su relevancia práctica es acotada pero clara: permite añadir una etapa de reordenación neuronal a un pipeline de búsqueda local en Mac sin depender de Python ni de servicios externos, con una latencia de 0,19 s por lote de ocho pares en GPU de Apple silicon. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (base BAAI/bge-reranker-v2-m3), convertido a Core ML |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens por par; 8 pares por inferencia (forma fija 8×256) |
| Tipos de cuantización | Pesos int8, cómputo fp16 |
| Idiomas soportados | en, ru, es (según la model card; el vocabulario XLM-R es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`Reranker.mlmodelc`), empaquetado en `reranker-bge-m3-coreml-v1.zip`; vocabulario en `vocab.tsv` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un cross-encoder transformer que procesa conjuntamente consulta y pasaje y emite un logit de relevancia. La conversión a Core ML fija la entrada en ocho pares de 256 tokens cada uno, con `input_ids` y `attention_mask` en int32, y produce ocho logits de salida (mayor valor, mayor relevancia). Los pesos están cuantizados a int8 y el cómputo se realiza en fp16. El vocabulario incluido es el SentencePiece de XLM-R, con el mismo mapeo de piezas e identificadores que multilingual-e5.

No se dispone de información sobre los datos de entrenamiento del modelo base en la documentación proporcionada, ni sobre si hubo RLHF, DPO u otras etapas de ajuste. La model card únicamente documenta el proceso de conversión y validación: los logits quedan dentro de 0,03 del run de Core ML en Python y de 0,13 de PyTorch. Se advierte explícitamente de que la Neural Engine no es viable, porque parte del grafo no compila y cada carga tarda entre 40 y 100 s; la ejecución recomendada es CPU + GPU.

## Capacidades

- Reordenación (reranking) de pares consulta-pasaje: devuelve un logit de relevancia por par, no texto generativo.
- Procesamiento por lotes de hasta ocho pares en una sola inferencia, con forma fija 8×256.
- Multilingüe: etiquetado para inglés, ruso y español; el vocabulario XLM-R cubre más idiomas, aunque no se documenta su rendimiento fuera de los tres declarados.
- Integración nativa en macOS 15+ mediante Core ML, ejecutable en CPU y GPU de Apple silicon.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento: es un clasificador de relevancia, no un modelo generativo.
- No dispone de capacidades de visión ni de audio.

## Casos de uso

- Búsqueda local de archivos en macOS: el caso documentado por el autor. Se usa como segunda etapa sobre los 20 archivos más cercanos devueltos por un modelo de embeddings (e5 v3), reordenándolos según la relevancia real de cada documento respecto a la consulta.
- Búsqueda documental en aplicaciones de escritorio: cualquier app Mac que ya tenga un índice vectorial puede añadir esta etapa de reranking sin incorporar un runtime de Python, cargando el `.mlmodelc` directamente con Core ML.
- Filtrado de resultados en asistentes de escritorio offline: al ejecutarse en local y sin red, encaja en productos que deben mantener la privacidad de los documentos del usuario.
- Reordenación de respuestas candidatas en sistemas RAG pequeños: con 8 pares por lote y 256 tokens por par, sirve para priorizar fragmentos recuperados antes de pasarlos a un modelo generativo.
- Evaluación de calidad de recuperación en pipelines multilingües: útil para comparar el orden de resultados en inglés, ruso y español dentro de un mismo índice.
- Prototipado rápido en Apple silicon: la latencia de 0,19 s por lote de ocho pares permite iterar sobre estrategias de recuperación sin infraestructura de servidor.

## Benchmarks y rendimiento

El autor reporta una evaluación sobre un conjunto privado de 44 consultas de búsqueda de archivos sobre documentos personales reales, reordenando el top-20 del modelo e5 v3:

| Métrica | Antes (e5 v3) | Después (reranker) |
|---|---|---|
| hit@1 | 20 | 25 |
| hit@10 | 39 | 42 |
| MRR | 0,64 | 0,71 |

| Métrica de conversión | Valor |
|---|---|
| Diferencia de logits vs. Core ML en Python | ≤ 0,03 |
| Diferencia de logits vs. PyTorch | ≤ 0,13 |
| Latencia por lote de 8 pares (GPU Apple silicon) | 0,19 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BEIR) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el modelo se ejecuta en memoria unificada de Apple silicon. El paquete ocupa unos 0,5 GB, por lo que la huella de memoria es del orden de cientos de MB.
- GPU recomendadas: GPU integrada de Apple silicon (M1 o posterior). No se documentan requisitos para GPU NVIDIA o AMD.
- Neural Engine: no soportada; parte del grafo falla al compilar y la carga tarda 40-100 s.
- Sistema operativo: macOS 15 o superior.
- Cabe en cualquier Mac con Apple silicon; no se indica compatibilidad con Macs Intel.
- Opciones de despliegue: Core ML de forma nativa (CPU + GPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia: 0,19 s por lote de ocho pares en GPU de Apple silicon. No se documenta el throughput en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| seklu-reranker-bge-m3-coreml | Cross-encoder, conversión Core ML int8 | 256 tokens/par, 8 pares | en, ru, es | Apache-2.0 | Core ML |
| BAAI/bge-reranker-v2-m3 | Cross-encoder original | No disponible en la información proporcionada | Multilingüe | Apache-2.0 | safetensors (PyTorch) |
| multilingual-e5 (modelo de embeddings citado) | Bi-encoder | No disponible en la información proporcionada | Multilingüe | No disponible en la información proporcionada | No disponible en la información proporcionada |

La comparación relevante es con el modelo base: esta conversión sacrifica flexibilidad de longitud de contexto (fija 256 tokens y ocho pares) y precisión numérica (int8/fp16, con desviación de hasta 0,13 frente a PyTorch) a cambio de ejecución nativa en macOS sin Python. Frente a un bi-encoder como e5, el cross-encoder es más preciso por par, pero requiere una pasada por cada par y no permite precalcular embeddings.

## Limitaciones y advertencias

- Contexto truncado a 256 tokens por par: pasajes más largos se recortan, lo que puede degradar la relevancia en documentos extensos.
- Lote fijo de ocho pares: no admite tamaños dinámicos; los lotes incompletos requieren relleno.
- Precisión reducida: los logits difieren hasta 0,13 respecto a PyTorch, lo que puede alterar el orden en casos con puntuaciones muy próximas.
- Idiomas: solo se declaran en, ru y es; el rendimiento en otros idiomas del vocabulario XLM-R no está documentado.
- Plataforma: exclusivo de macOS 15+ con Apple silicon; no hay soporte para Neural Engine ni para otras plataformas.
- Evaluación limitada: las métricas provienen de un conjunto privado de 44 consultas, sin benchmarks públicos que permitan comparación reproducible.
- Riesgo de sesgo y alucinación: al ser un clasificador de relevancia, no genera texto, pero puede heredar sesgos del corpus de entrenamiento del modelo base, no documentados aquí.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y citar adecuadamente la conversión.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elcodabra/seklu-reranker-bge-m3-coreml
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
