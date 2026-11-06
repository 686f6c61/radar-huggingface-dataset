# lujihong/bge-m3-onnx-int8

## Resumen

`lujihong/bge-m3-onnx-int8` es una copia de distribución del modelo de embeddings BGE-M3 en formato ONNX con cuantización INT8, publicada por el usuario lujihong para el producto de escritorio offline de LaunchAI (浪起). No se trata de un modelo entrenado por el autor del repositorio: los tres ficheros que lo componen (`model_quantized.onnx`, `tokenizer.json` y `sentencepiece.bpe.model`) se han copiado byte a byte desde el repositorio upstream `gpahal/bge-m3-onnx-int8`, con verificación SHA256 idéntica.

El modelo subyacente es BGE-M3, desarrollado por BAAI (Beijing Academy of Artificial Intelligence), un encoder multilingüe que genera simultáneamente representaciones densas, dispersas (sparse) y multi-vector (ColBERT) a partir de un mismo paso de inferencia. Esta versión INT8 pesa aproximadamente 570 MB para el grafo ONNX (unos 1,1 GB en total con el tokenizador) y está pensada para ejecución local en CPU o GPU sin dependencia de frameworks de Python pesados.

Su relevancia práctica es la de un artefacto listo para producción de recuperación de información: permite montar un pipeline RAG completamente offline con licencia MIT, verificación de integridad criptográfica y un coste de memoria reducido frente a la versión FP32. El repositorio en sí tiene 0 descargas y 0 likes en el momento de la consulta y no incluye pipeline declarado en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BGE-M3, familia XLM-RoBERTa) |
| Parametros totales | no disponible (el repo solo publica el grafo ONNX cuantizado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (BGE-M3 soporta entradas largas, pero el valor exacto no se cita) |
| Tipos de cuantizacion | INT8 (fichero `model_quantized.onnx`) |
| Idiomas soportados | multilingüe (etiqueta `multilingual`; sin listado cerrado) |
| Licencia | MIT (heredada de `gpahal/bge-m3-onnx-int8` y de `BAAI/bge-m3`) |
| Formato de pesos | ONNX (`model_quantized.onnx`, 569.958.496 bytes) + `tokenizer.json` (17.082.799 bytes) + `sentencepiece.bpe.model` (5.069.051 bytes) |
| Tamano del repo | 0,6 GB |
| SHA256 del grafo ONNX | `16de7ea1146ca427e14938ec3e9abfdcaff0e6ac76434cd693ac35d761250bcb` |
| SHA256 del tokenizer.json | `249df0778f236f6ece390de0de746838ef25b9d6954b68c2ee71249e0a9d8fd4` |
| SHA256 del sentencepiece | `cfc8146abe2a0488e9e2a0c56de7952f7c11ab059eca145a0a727afce0db2865` |

## Arquitectura y entrenamiento

El modelo subyacente, BGE-M3, es un encoder transformer de la familia XLM-RoBERTa entrenado por BAAI con un objetivo multi-tarea que produce tres tipos de representación en una sola pasada: embeddings densos normalizados, pesos léxicos dispersos y embeddings multi-vector por token (estilo ColBERT). Esa combinación permite cubrir recuperación semántica, recuperación léxica y reranking con un único modelo. El repositorio que nos ocupa no aporta detalles adicionales sobre el entrenamiento: no se indica número de tokens, composición del corpus ni si hubo fases de ajuste con datos sintéticos o preferencias.

La contribución técnica de este artefacto es la exportación a ONNX y la cuantización a INT8, realizada aguas arriba por `gpahal` y replicada sin modificación. El autor declara una pérdida de precisión inferior al 1 % en MTEB respecto a la versión FP32 y un arranque en frío más rápido. El código de LaunchAI verifica el SHA256 de los tres ficheros antes de cargarlos, lo que convierte al repositorio en un mecanismo de distribución reproducible más que en un experimento de modelado. Los tres ficheros deben residir en el mismo directorio para que el tokenizador cargue correctamente.

## Capacidades

- Generación de embeddings densos para búsqueda semántica y similitud coseno.
- Generación de representaciones dispersas (sparse / léxicas) para recuperación por coincidencia de términos.
- Generación de embeddings multi-vector (ColBERT) para reranking fino a nivel de token.
- Procesamiento multilingüe en un único espacio vectorial, lo que permite consultas en un idioma contra documentos en otro.
- Ejecución offline completa mediante ONNX Runtime, sin llamadas a servicios externos.
- Inferencia en CPU con cuantización INT8, adecuada para equipos de escritorio sin GPU dedicada.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un modelo de representación.

## Casos de uso

- Base de conocimiento local en aplicaciones de escritorio: el paquete de 0,6 GB se distribuye junto al instalador y se carga con ONNX Runtime, de modo que la indexación y la búsqueda funcionan sin conexión y sin exponer documentos del usuario a terceros.
- RAG con recuperación híbrida: al emitir dense, sparse y ColBERT en una sola pasada, permite combinar búsqueda semántica y búsqueda léxica sobre el mismo índice, lo que mejora la recuperación de identificadores, nombres propios y códigos de referencia.
- Búsqueda multilingüe en corpus mixtos: un usuario puede consultar en castellano sobre documentación en inglés o chino y obtener resultados alineados en el mismo espacio vectorial.
- Deduplicación y clustering de documentos: los embeddings densos permiten agrupar pasajes near-duplicate en pipelines de limpieza de corpus antes del entrenamiento o de la indexación.
- Reranking de resultados de un buscador existente: la salida multi-vector permite reordenar los top-k candidatos de un motor BM25 con una segunda fase más precisa y con coste de memoria contenido.
- Filtrado semántico en CI/CD de datos: integrado como paso de validación, permite rechazar documentos fuera de dominio antes de incorporarlos a un índice de producción, con verificación de integridad SHA256 en cada despliegue.
- Evaluación de similitud en herramientas de atención al cliente: clasificación de tickets por similitud contra una taxonomía predefinida, ejecutada en el propio dispositivo del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. El autor únicamente afirma que la pérdida de precisión de la versión INT8 frente a FP32 es inferior al 1 % en MTEB, sin desglose por tarea ni cifras absolutas.

| Metrica | Valor |
|---|---|
| MTEB (diferencia INT8 vs FP32) | < 1 % (declarado por el autor, sin desglose) |
| MMLU, HumanEval, GSM8K | no aplica (modelo de embeddings, no generativo) |
| Latencia y throughput | no disponible |

## Requisitos de hardware

- VRAM/RAM: el grafo ONNX ocupa 569.958.496 bytes (~544 MiB); con tokenizador y sentencepiece el conjunto ronda los 0,6 GB en disco y una huella de memoria similar en ejecución.
- CPU: viable en procesadores de escritorio modernos con ONNX Runtime; el autor destaca un arranque en frío más rápido que la versión FP32.
- GPU: no se especifican modelos recomendados. Al ser un encoder de tamaño moderado en INT8, cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM, aunque no hay datos publicados de latencia.
- GPU consumer: sí, cabe en tarjetas de gama media y baja; no se han publicado mediciones concretas para RTX 4090, A100 o H100.
- Despliegue: ONNX Runtime es la vía natural; el repositorio no documenta integraciones con vLLM, llama.cpp, Ollama ni TGI (ninguna de ellas aplica a un encoder ONNX de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| `lujihong/bge-m3-onnx-int8` | no disponible | no disponible | ONNX INT8 | MIT | Copia verificada de `gpahal/bge-m3-onnx-int8`; 0,6 GB; salida dense/sparse/ColBERT |
| `BAAI/bge-m3` | no disponible en la información | no disponible | safetensors (formato original) | MIT | Modelo original de BAAI; requiere PyTorch y mayor huella de memoria |
| `gpahal/bge-m3-onnx-int8` | no disponible | no disponible | ONNX INT8 | MIT | Upstream directo de este repositorio; mismos SHA256 |
| Alternativas de embeddings multilingües (p. ej. familia multilingual-e5) | no disponible | no disponible | varía | varía | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; usarlo para esas tareas es un error de categoría.
- El repositorio es una copia de distribución sin mantenimiento propio declarado; las mejoras o correcciones deben buscarse en el upstream `gpahal/bge-m3-onnx-int8`.
- La afirmación de pérdida inferior al 1 % en MTEB procede del autor y no se acompaña de desglose reproducible en la model card.
- No se documentan sesgos conocidos, comportamiento por idioma ni tasas de error en dominios específicos.
- La licencia MIT permite uso comercial, pero la atribución de copyright corresponde a los autores originales (BAAI y gpahal); el repositorio es solo un espejo.
- El tokenizador requiere los tres ficheros en el mismo directorio; un empaquetado incorrecto provoca fallos de carga en producción.
- El repositorio presenta 0 descargas y 0 likes, sin pipeline declarado en HuggingFace: conviene validar la integridad SHA256 antes de desplegarlo y considerar el upstream como fuente primaria.
- No hay información sobre el límite exacto de tokens de entrada ni sobre el truncado aplicado por la exportación ONNX.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lujihong/bge-m3-onnx-int8
- Upstream internacional: https://huggingface.co/gpahal/bge-m3-onnx-int8
- Espejo nacional: https://hf-mirror.com/gpahal/bge-m3-onnx-int8
- Modelo original de BAAI: https://huggingface.co/BAAI/bge-m3
