# arnhemlabs/ms-marco-minilm-int8-weightonly

## Resumen

`arnhemlabs/ms-marco-minilm-int8-weightonly` es una cuantización int8 weight-only en formato ONNX del cross-encoder `cross-encoder/ms-marco-MiniLM-L6-v2`, un reranker de recuperación de información. Dado un par (consulta, pasaje), el modelo devuelve un único logit de relevancia: cuanto mayor es el valor, más relevante es el pasaje para la consulta. Lo publica el usuario `arnhemlabs` como componente in-process del motor de memoria Remanence (ADR-016 y su enmienda 1), que lo carga desde una revisión fijada y verifica cada fichero contra su SHA-256.

El modelo base es un transformer MiniLM de 6 capas derivado de `microsoft/MiniLM-L6-v2`, afinado sobre el corpus MS MARCO para la tarea de reordenación de pasajes. La cuantización reduce el peso del fichero ONNX a unos 59,5 MB (0,1 GB de repositorio), manteniendo activaciones y cómputo en FP32, lo que permite ejecutar el reranker en CPU o en GPU modesta con un coste de memoria muy bajo.

Su relevancia actual es práctica: los pipelines de RAG y búsqueda híbrida necesitan un reranker barato y determinista que pueda ejecutarse en proceso, sin servicio externo. Esta variante int8 conserva la firma de entrada del original (`input_ids`, `attention_mask`, `token_type_ids`) y la salida de un logit por par, de modo que es un reemplazo directo del export FP32 con menor huella de disco y de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cross-encoder MiniLM de 6 capas (base: `cross-encoder/ms-marco-MiniLM-L6-v2`) |
| Parametros totales | no disponible (el modelo base MiniLM-L6 ronda los 22,7 M, dato no declarado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base se entrena con pares de hasta 512 tokens) |
| Tipos de cuantizacion | int8 weight-only (MatMulNBits, `bits=8`, `block_size=128`, `is_symmetric=True`); activaciones y cómputo en FP32 |
| Idiomas soportados | no disponible (el corpus MS MARCO es mayoritariamente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` con pesos int8 embebidos) + `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura es la del cross-encoder original: un transformer MiniLM de 6 capas que procesa conjuntamente la consulta y el pasaje como una única secuencia con segmentos (`token_type_ids`) y produce una representación agregada que se proyecta a un logit escalar de relevancia. No hay generación ni decodificación; es una tarea de clasificación/regresión sobre pares.

El entrenamiento no lo realiza el autor de esta ficha: se hereda íntegramente del modelo base `cross-encoder/ms-marco-MiniLM-L6-v2` en la revisión `c5ee24cb16019beea0893ab7796b1df96625c6b8`. La modificación introducida es exclusivamente la cuantización: se parte del export FP32 `onnx/model.onnx` del repositorio original, verificado por SHA-256, y se aplica `MatMulNBitsQuantizer` de onnxruntime con 8 bits, bloques de 128 y cuantización simétrica. Las matrices `MatMul` pasan a `MatMulNBits` con pesos de 8 bits, mientras que las activaciones y el cómputo permanecen en FP32. El `tokenizer.json` se copia byte a byte del original. El script de exportación (`scripts/export-models.sh` en el repositorio Remanence, commit `767aa23`) fija las versiones de `onnx==1.23.2`, `onnxruntime==1.31.1`, `numpy==2.5.4`, `onnx-ir==1.1.0` y `tokenizers==0.23.3`, lo que hace la conversión reproducible.

## Capacidades

- Puntuación de relevancia consulta-pasaje: devuelve un logit por par, útil para reordenar candidatos recuperados por un retriever de primera etapa.
- Clasificación de pares de texto: pipeline `text-classification` con salida de una sola dimensión.
- Ejecución en proceso vía ONNX Runtime, sin dependencia de frameworks de deep learning pesados.
- Inferencia por lotes: las entradas son tensores int64 de forma `[batch, sequence]`, por lo que admite batching.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe: no declarada; el corpus de entrenamiento del base es en inglés.

## Casos de uso

- Reordenación en pipelines RAG: tras recuperar los N candidatos de un índice vectorial o BM25, el cross-encoder puntúa cada par (consulta, fragmento) y se conservan los K mejores; su tamaño reducido permite ejecutarlo en la misma máquina que el retriever.
- Búsqueda documental interna: en un buscador corporativo, se usa como segunda etapa para desempatar resultados con señal semántica fina, con latencia baja al correr en CPU.
- Filtrado de contexto antes de un LLM: se descartan pasajes con logit bajo antes de construir el prompt, reduciendo tokens de entrada y coste de inferencia del modelo generativo.
- Sistemas de memoria de agentes: es el reranker del motor Remanence, que selecciona recuerdos relevantes para inyectarlos en el contexto de un agente.
- Despliegue en entornos sin GPU: al ser ONNX int8 con cómputo FP32, funciona en servidores CPU-only y en dispositivos de borde donde un reranker FP32 más grande no cabría.
- Evaluación offline de recuperadores: sirve para medir la calidad de un retriever comparando el ranking reordenado frente al original con métricas como MRR o nDCG.
- Verificación de integridad en producción: los SHA-256 publicados permiten fijar la revisión exacta del artefacto en un pipeline de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de nDCG, MRR ni comparaciones de latencia o throughput frente al export FP32.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el fichero `model.onnx` ocupa 59.497.949 bytes y las activaciones son de un modelo de 6 capas con dimensión oculta pequeña.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no requiere A100 ni H100. Una RTX 4090 o una T4 están sobradamente dimensionadas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna; también en CPU sin acelerador dedicado.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con integración directa en servicios Python; no se distribuye en GGUF, por lo que no es directamente compatible con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `arnhemlabs/ms-marco-minilm-int8-weightonly` | no disponible (base MiniLM-L6) | no disponible | ONNX int8 weight-only | Apache-2.0 | Reranker cross-encoder, 59,5 MB |
| `cross-encoder/ms-marco-MiniLM-L6-v2` | no disponible (base MiniLM-L6) | no disponible | PyTorch / ONNX FP32 | Apache-2.0 | Modelo base sin cuantizar; mayor huella |
| `cross-encoder/ms-marco-MiniLM-L12-v2` | no disponible (base MiniLM-L12) | no disponible | PyTorch / ONNX | Apache-2.0 | 12 capas, mayor coste y presumiblemente mayor calidad; sin datos comparativos en esta ficha |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un reranker, no un modelo generativo: no puede usarse para responder preguntas ni producir texto.
- El dominio y el idioma están determinados por el modelo base: entrenado sobre MS MARCO, mayoritariamente en inglés; el rendimiento en castellano no está documentado.
- La cuantización int8 weight-only puede introducir una degradación pequeña pero no cuantificada del logit respecto al FP32; no se publican métricas de esa diferencia.
- Riesgo de sesgo heredado del corpus MS MARCO, que refleja las distribuciones y sesgos de los datos de origen.
- La licencia Apache-2.0 permite uso comercial, pero el repositorio original no incluye fichero LICENSE; esta ficha se apoya en la declaración de licencia de la model card del autor.
- La model card no documenta la longitud máxima de secuencia soportada por el grafo ONNX exportado; conviene validarla empíricamente antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto; se recomienda verificar los SHA-256 publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arnhemlabs/ms-marco-minilm-int8-weightonly
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Revisión del modelo base: `c5ee24cb16019beea0893ab7796b1df96625c6b8`
- Repositorio Remanence (scripts de exportación, commit `767aa23`): no disponible la URL en la información proporcionada
- Paper de MS MARCO / MiniLM: no disponible en la información proporcionada
