# ben0112/bge-reranker-v2-m3-coreai-m5max

## Resumen

`ben0112/bge-reranker-v2-m3-coreai-m5max` es una compilación ahead-of-time (AOT) del modelo de reranking `BAAI/bge-reranker-v2-m3` de BAAI, empaquetada como asset `.aimodelc` para el runtime Core AI de Apple. No se trata de un modelo nuevo ni de un fine-tune con datos propios: el autor (ben0112) ha convertido los pesos originales de BAAI a un formato ejecutable directamente sobre la Neural Engine del Apple Silicon M5 Max (identificador de silicio `h17c`), con precisión FP16 y un layout personalizado para el codificador XLM-R.

El modelo base, `bge-reranker-v2-m3`, es un cross-encoder multilingüe derivado de XLM-RoBERTa que puntúa pares consulta-documento para reordenar resultados de recuperación. Esta versión compilada fija una forma estática de lote 10 × 128 tokens: acepta `input_ids` y `attention_mask` de dimensiones `[10, 128]` en int32 y devuelve 10 logits, por lo que las filas no utilizadas deben rellenarse con padding.

Su relevancia es de nicho pero concreta: permite ejecutar el reranker íntegramente en la Neural Engine de un Mac con M5 Max bajo macOS 27 o superior, sin depender de PyTorch ni de una GPU discreta. Es un artefacto de despliegue, no un modelo publicable en benchmarks, y su utilidad queda acotada al hardware y al sistema operativo indicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (modelo base `BAAI/bge-reranker-v2-m3`); asset compilado con layout XLM-R BC1S/Conv2d para Neural Engine |
| Parametros totales | no disponible (heredados del modelo base; no se declaran en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens por par (forma estática de compilación, lote de 10) |
| Tipos de cuantizacion | FP16 (única precisión declarada en la compilación) |
| Idiomas soportados | no disponible en esta ficha (el modelo base es multilingüe) |
| Licencia | Apache-2.0 (pesos originales de BAAI) |
| Formato de pesos | `.aimodelc` (asset AOT empaquetado en ZIP), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El asset es una compilación AOT de un cross-encoder transformer. Según la model card, la conversión emplea un layout personalizado «XLM-R BC1S/Conv2d ANE» en FP16 mediante la herramienta `coreai-torch`, y la compilación se realiza con `coreai-build` para el target `h17c`, con cómputo preferente en `neural-engine`. La forma es fija: lote de 10 secuencias de 128 tokens, salida de 10 logits (una puntuación de relevancia por par consulta-documento).

No se aporta información sobre el entrenamiento del modelo base en esta ficha: ni número de tokens, ni composición del dataset, ni si hubo RLHF/DPO. Tampoco se documentan innovaciones de decodificación o atención; la única particularidad técnica es el propio pipeline de conversión y compilación AOT para Apple Silicon. El repositorio incluye un `manifest.json` con SHA256 y tamaño del asset, y el código de ejecución se publica aparte en el repositorio `coreai-runner` del autor.

## Capacidades

- Reranking de pares consulta-documento: devuelve un logit de relevancia por par, pensado para reordenar resultados de un recuperador previo (retrieval + rerank).
- Procesamiento por lotes de hasta 10 pares simultáneos con relleno obligatorio de las filas no usadas.
- Ejecución en la Neural Engine del M5 Max mediante el runtime Core AI, sin PyTorch en tiempo de inferencia.
- Capacidades multilingües heredadas del modelo base (no verificadas ni declaradas en esta ficha).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un cross-encoder de puntuación, no un modelo generativo.
- No dispone de modo thinking ni de generación de texto libre.

## Casos de uso

- Reranking en pipelines RAG locales: recuperar candidatos con un índice vectorial y reordenarlos con este asset sobre la Neural Engine del Mac, evitando cargar un segundo framework de inferencia.
- Búsqueda documental interna en estaciones de trabajo Apple: desplegar un servicio de reordenación en un Mac con M5 Max para equipos que trabajan con documentación propia.
- Filtrado de resultados en asistentes de código o documentación: puntuar fragmentos recuperados antes de pasarlos a un LLM generativo, con latencia baja al ejecutarse en ANE.
- Prototipado y evaluación de sistemas de recuperación: comparar la calidad del reordenado con lote fijo de 10 × 128 tokens frente a alternativas en CPU/GPU.
- Procesamiento por lotes offline: ejecutar reordenaciones masivas en local agrupando pares en lotes de 10 y rellenando el resto.
- Integración en aplicaciones macOS nativas: usar el runtime Core AI y el runner del autor para incrustar el reranker en una app de escritorio sin dependencias de Python.
- No es adecuado para consultas o documentos que excedan 128 tokens por lado, ni para hardware distinto del M5 Max.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (nDCG, MRR), latencia ni throughput, y al ser una compilación de despliegue no aporta evaluaciones propias.

## Requisitos de hardware

- Hardware: exclusivamente Apple Silicon M5 Max (identificador `h17c`). No funciona en M1, M2, M3, M4 ni en GPUs NVIDIA/AMD.
- Sistema operativo: macOS 27 o superior.
- Runtime: Core AI runtime, más el código de aplicación del repositorio `coreai-runner`.
- Memoria: no disponible; al ejecutarse en Neural Engine y en FP16 con forma fija 10 × 128, la huella es reducida, pero no se declara cifra alguna.
- Opciones de despliegue: carga directa del asset `.aimodelc` con Core AI; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ben0112/bge-reranker-v2-m3-coreai-m5max` | Cross-encoder reranker (compilado AOT) | 128 tokens por par, lote 10 | `.aimodelc` | Apache-2.0 | Solo M5 Max / macOS 27+ |
| `BAAI/bge-reranker-v2-m3` | Cross-encoder reranker (original) | no disponible en esta ficha | safetensors (PyTorch) | Apache-2.0 | Multiplataforma (CPU/GPU) |
| Otros rerankers de la familia BGE | Cross-encoder | no disponible | safetensors / ONNX | según variante | Multiplataforma |

La comparación relevante es con el modelo base original: misma arquitectura y pesos de partida, pero este asset sacrifica portabilidad y flexibilidad de secuencia a cambio de ejecución nativa en ANE con forma estática. No se dispone de datos de rendimiento para comparar calidad ni velocidad.

## Limitaciones y advertencias

- Dependencia dura del hardware: solo M5 Max (`h17c`) y macOS 27+; inutilizable en cualquier otro equipo.
- Ventana fija de 128 tokens por par y lote fijo de 10: los pares más largos se truncan y las filas sobrantes deben rellenarse, lo que puede introducir coste y sesgos de padding si no se gestiona bien.
- No es un modelo generativo: no sirve para chat, código, matemáticas ni razonamiento; solo puntúa relevancia.
- Sin datos de evaluación publicados: no hay evidencia en la ficha sobre calidad del reordenado tras la conversión a FP16 ni sobre posibles degradaciones frente al original.
- Riesgo de sesgo y alucinación heredado del modelo base multilingüe de BAAI, no documentado en esta ficha.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar el archivo `LICENSE` incluido y los términos del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento garantizado.
- El pipeline no está declarado en Hugging Face, por lo que la integración debe hacerse manualmente con el runtime Core AI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ben0112/bge-reranker-v2-m3-coreai-m5max
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Código de ejecución (runner): https://github.com/ben0112/coreai-runner
