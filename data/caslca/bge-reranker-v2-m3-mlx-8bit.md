# caslca/bge-reranker-v2-m3-mlx-8bit

## Resumen

`caslca/bge-reranker-v2-m3-mlx-8bit` es una cuantización a 8 bits del cross-encoder multilingüe `BAAI/bge-reranker-v2-m3`, publicada por el usuario caslca y generada con las herramientas de Premisa (ai.premisa.desktop). El modelo no genera texto: recibe un par consulta-documento y devuelve una puntuación de relevancia que se puede normalizar al intervalo [0,1] mediante una sigmoide, lo que lo convierte en una segunda etapa de reordenación para pipelines de recuperación (RAG, buscadores, sistemas documentales).

La relevancia práctica está en el formato: el modelo original en fp32 ocupa aproximadamente 2,3 GB (567.755.777 parámetros), mientras que esta versión cuantizada se distribuye en un repositorio de 0,6 GB, lo que permite ejecutar el reordenador en un Mac con Apple Silicon mediante MLX sin renunciar a las métricas del modelo de referencia. El autor reporta que en el estudio de recuperación Premisa (180 preguntas respondibles, conjuntos de 50 candidatos) las métricas son indistinguibles del original: recall de documento 0,839 frente a 0,839, recall de pasaje 0,489 frente a 0,489 y MRR 0,450 frente a 0,449.

Es relevante ahora porque demuestra que la cuantización agresiva de un cross-encoder de 568 millones de parámetros conserva el ordenamiento top-8 en las muestras evaluadas, lo que abre la puerta a reordenación local de baja latencia en hardware de consumo en lugar de depender de GPU con servicio remoto. La licencia Apache 2.0 del modelo base se mantiene en estos pesos derivados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en el encoder XLM-RoBERTa (modelo base `BAAI/bge-reranker-v2-m3`) |
| Parametros totales | 567.755.777 (dato de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits entero afino (affine), group size 64, aplicado a los pesos lineales; cabecera de clasificacion en precision completa |
| Idiomas soportados | multilingue (heredado del modelo base); lista concreta de idiomas no disponible |
| Licencia | Apache 2.0 (se aplica la del modelo de origen a estos pesos derivados) |
| Formato de pesos | safetensors para MLX; tamano de repositorio 0,6 GB (605 MB segun el autor) |

## Arquitectura y entrenamiento

Se trata de un cross-encoder: un transformer encoder tipo XLM-RoBERTa que procesa conjuntamente la consulta y el documento candidato y emite una única puntuación de similitud, en lugar de embeddings independientes como haría un bi-encoder. Esa interacción token a token entre consulta y pasaje es la que aporta precisión en la segunda etapa de recuperación, a costa de una inferencia por candidato. El modelo base fue desarrollado por BAAI y esta versión no reentrena ni modifica los pesos: únicamente los cuantiza.

El proceso de cuantización, documentado en la model card, consistió en convertir a enteros de 8 bits con modo `affine` y group size 64 los pesos lineales del modelo, manteniendo la cabecera de clasificación en precisión completa, mediante el script `model_quant_spike.py quantize --bits 8` de Premisa, ejecutado el 21 de octubre de 2026 sobre la revisión `953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e` del modelo original (SHA-256 de los pesos fuente `d9e3e081faff1eefb84019509b2f5558fd74c1a05a2c7db22f74174fcedb5286`). La configuración de pooling se lee de `1_Pooling/config.json` cuando está presente. No se han publicado detalles sobre datos de entrenamiento, número de tokens ni etapas de RLHF o DPO, ya que esta ficha describe una conversión de pesos y no un entrenamiento.

## Capacidades

- Puntuación de relevancia consulta-documento: entrada de pares (query, pasaje) y salida de una puntuación convertible a [0,1] con sigmoide.
- Reordenación de resultados de recuperación (reranking) como segunda etapa tras un retriever bi-encoder o BM25.
- Recuperación de documentos y de pasajes dentro de documentos, segun las metricas reportadas por el autor.
- Capacidad multilingüe heredada del encoder XLM-RoBERTa del modelo base.
- Integración como tarea de servidor en el fork de `mlx-vlm` mediante `--reranker-model` o `--embedding-model`.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es un modelo discriminativo de puntuación, no un modelo generativo.

## Casos de uso

- Segunda etapa en pipelines RAG: recuperar 50-100 candidatos con un índice vectorial y reordenarlos con este cross-encoder antes de construir el prompt; el estudio Premisa usa precisamente conjuntos de 50 candidatos, un tamaño manejable en local.
- Buscador documental interno: indexar manuales, políticas o contratos con un bi-encoder y aplicar el reordenador para que los pasajes más relevantes queden en las primeras posiciones.
- Atención al cliente sobre base de conocimiento: dado el mensaje del usuario, reordenar los artículos candidatos y enviar solo los mejores al modelo generativo, reduciendo contexto irrelevante y coste por consulta.
- Búsqueda de producto en comercio electrónico: reordenar los resultados iniciales de una consulta de catálogo por relevancia semántica real, con la ventaja de ejecutar el modelo en un portátil Apple Silicon durante desarrollo y pruebas.
- Recuperación legal o académica multilingüe: puntuar pasajes en distintos idiomas contra una consulta, aprovechando el encoder multilingüe del modelo base.
- Evaluación y ajuste de pipelines de recuperación: usar el reordenador como juez de relevancia offline para comparar retrievers, tamaños de pool y estrategias de chunking con métricas de recall y MRR.
- Prototipado local sin GPU dedicada: levantar el servidor de tareas de MLX en un Mac para validar un sistema de búsqueda completo antes de moverlo a infraestructura de producción.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las mediciones del autor frente a la referencia en PyTorch, sobre el estudio de recuperación Premisa (180 preguntas respondibles, pools de 50 candidatos). El autor advierte que son mediciones de estudio previas a adjudicación y no afirmaciones de calidad.

| Metrica | Referencia PyTorch (fp32) | Este modelo (MLX 8 bits) |
|---|---|---|
| Recall de documento @8 | 0,839 | 0,839 |
| Recall de pasaje @8 | 0,489 | 0,489 |
| MRR | 0,449 | 0,450 |
| Top-8 identico a la referencia | — | 10 de 10 pools muestreados |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BEIR, MTEB) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: unos 0,6 GB para los pesos en 8 bits, más overhead de activaciones y del pool de candidatos; el repositorio completo ocupa 0,6 GB.
- Cabe holgadamente en cualquier Mac con Apple Silicon (M1 o superior), que es el requisito real, ya que el formato es MLX y no hay pesos GGUF ni safetensors estándar de PyTorch en este repositorio.
- En GPU NVIDIA no es desplegable directamente con estos pesos: haría falta el modelo base `BAAI/bge-reranker-v2-m3` o una conversión propia.
- Opciones de despliegue: servidor de tareas del fork de `mlx-vlm` (`python -m mlx_vlm.server --reranker-model <directorio>` o `--embedding-model`), con lectura de la configuración de pooling desde `1_Pooling/config.json`.
- GPU recomendadas para la referencia no cuantizada: no disponible en la información proporcionada.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `caslca/bge-reranker-v2-m3-mlx-8bit` (esta ficha) | 567,76 M | no disponible | 8 bits affine, group size 64, MLX | Apache 2.0 | HuggingFace, 0 descargas, formato MLX |
| `BAAI/bge-reranker-v2-m3` (referencia) | 567,76 M | no disponible | fp32 sin cuantizar | Apache 2.0 | HuggingFace, modelo oficial de BAAI |
| `furiosa-ai/bge-reranker-v2-m3` | 567,76 M (misma base) | no disponible | no disponible | no disponible | HuggingFace, orientado a hardware Furiosa AI |
| `bge-reranker-base` / `bge-reranker-large` (familia BGE) | no disponible en la informacion | no disponible | no disponible | no disponible | HuggingFace |

La comparación relevante es contra la referencia en fp32: misma arquitectura y mismos parámetros, con una reducción de tamaño de aproximadamente 2,3 GB a 0,6 GB (cálculo a partir de 567.755.777 parámetros en punto flotante de 32 bits) y métricas equivalentes en el estudio del autor. Frente a alternativas de otros tamaños o familias, no hay datos de benchmarks en la información disponible para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Es un reordenador, no un generador: no responde preguntas ni produce texto; solo puntúa pares consulta-documento.
- Coste de inferencia lineal con el número de candidatos: cada pasaje requiere una pasada completa por el encoder, por lo que pools grandes encarecen la segunda etapa.
- El autor califica las métricas como "mediciones de estudio previas a adjudicación, no afirmaciones de calidad"; la evaluación es reducida (180 preguntas, 50 candidatos, 10 pools muestreados para el top-8).
- La lista de idiomas soportados no está documentada en esta ficha; el comportamiento multilingüe se hereda del modelo base y no se ha verificado por separado.
- La longitud de contexto no se indica en la información disponible; pasar pasajes más largos de lo que admite el encoder implica truncamiento y pérdida de señal.
- Riesgo de dependencia del formato MLX: los pesos no son utilizables directamente en vLLM, TGI, llama.cpp ni Ollama, lo que limita el despliegue a Apple Silicon o a un port a otro runtime.
- Licencia Apache 2.0 permite uso comercial, pero se remite a los términos del modelo de origen; conviene revisar la model card de `BAAI/bge-reranker-v2-m3` antes de producción.
- Sesgos: no se ha publicado ningún análisis de sesgo para esta cuantización; los sesgos del corpus de entrenamiento del modelo base (XLM-RoBERTa) se trasladan intactos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de puntuaciones espurias en pasajes con solapamiento léxico alto y baja relevancia semántica.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación independiente de las cifras reportadas.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/caslca/bge-reranker-v2-m3-mlx-8bit
- Modelo base `BAAI/bge-reranker-v2-m3`: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Version para hardware Furiosa AI: https://huggingface.co/furiosa-ai/bge-reranker-v2-m3
- Documentacion de Furiosa AI sobre el modelo: https://developer.furiosa.ai/latest/en/furiosa_llm/models/bge-reranker-v2-m3.html
- Implementacion MLX en mlx-memos (GitHub): https://github.com/MemTensor/mlx-memos/tree/main/models/bge-reranker-v2-m3
- Documentacion de la familia BGE-Reranker: https://bge-model.com/bge/bge_reranker.html
