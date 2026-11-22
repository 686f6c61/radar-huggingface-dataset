# masahiroid/japanese-reranker-xsmall-v2-mlx

## Resumen

`masahiroid/japanese-reranker-xsmall-v2-mlx` es una conversión al formato MLX del reranker japonés `hotchpotch/japanese-reranker-xsmall-v2`, un cross-encoder ligero basado en ModernBERT. Lo publica el usuario masahiroid como conversión comunitaria, no oficial, con el objetivo de permitir la ejecución de este reranker sobre silicio de Apple (M1/M2/M3/M4) mediante el framework MLX de Apple Machine Learning Research. El modelo original y todos los créditos de entrenamiento corresponden a hotchpotch.

Se trata de un modelo de ranking de texto (`text-ranking`) que recibe un par consulta-documento y devuelve una puntuación de relevancia en el intervalo [0, 1], lo que lo hace adecuado para la etapa de reordenación (reranking) dentro de un pipeline RAG. Con 36,77 millones de parámetros y un repositorio de 0,1 GB, es un modelo extremadamente compacto: puede cargarse en memoria de forma trivial y ejecutarse en CPU o GPU integrada sin requisitos de hardware relevantes.

Su relevancia actual es doble: por un lado, cubre el hueco de rerankers específicos para japonés con licencia MIT y tamaño reducido; por otro, la conversión a MLX facilita su uso en aplicaciones locales y privadas sobre macOS, sin enviar consultas ni documentos a un servidor externo, algo que el propio autor demuestra con la demo Ruri Atlas basada en WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder, encoder bidireccional con atención full) |
| Parametros totales | 36.771.585 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16 segun conversión MLX; no se especifica) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT, la arquitectura de encoder presentada por Answer.AI y LightOn que moderniza BERT con atención de ventana deslizante, RoPE y mejoras de eficiencia. Al ser un cross-encoder, procesa conjuntamente consulta y documento en una única pasada y produce una puntuación de relevancia mediante una cabeza de clasificación (`pooler_output`), en lugar de comparar embeddings independientes como haría un bi-encoder.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card de esta conversión no documenta el proceso de entrenamiento del modelo original; únicamente indica que es una conversión MLX del modelo de hotchpotch y que ha sido auditada con `model-audit-lite` (formato de pesos, código incluido y linaje legible por máquina mediante ML-BOM). La innovación técnica destacable de esta ficha es, por tanto, la conversión a MLX, que habilita ejecución nativa en Apple Silicon.

## Capacidades

- Ranking de relevancia consulta-documento: devuelve una puntuación en [0, 1] para un par (query, document).
- Reordenación en pipelines RAG: pensado para la segunda etapa de recuperación, tras un retriever bi-encoder.
- Procesamiento bilingüe japonés-inglés, con foco principal en japonés.
- Ejecución local sobre Apple Silicon mediante MLX y la librería `mlx-embeddings`.
- Integración con tokenizador de Hugging Face (`AutoTokenizer` del modelo original) para preprocesado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de ranking, no generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- RAG sobre documentación en japonés: recuperar candidatos con un bi-encoder y reordenarlos con este cross-encoder para mejorar la precisión del contexto entregado al LLM generador; su tamaño de 36,7 M de parámetros permite reordenar decenas de pares por consulta con latencia baja.
- Búsqueda semántica en aplicaciones macOS locales: al estar convertido a MLX, puede integrarse en apps nativas de Apple Silicon que necesiten búsqueda privada sin conexión, sin enviar documentos a servidores externos.
- Atención al cliente en japonés: filtrar y ordenar artículos de base de conocimiento antes de que un modelo generativo componga la respuesta, reduciendo alucinaciones al priorizar los fragmentos más relevantes.
- Deduplicación y ordenación de resultados en motores de búsqueda internos: puntuar pares consulta-documento para reordenar listados y descartar resultados poco relevantes por debajo de un umbral.
- Evaluación de sistemas de recuperación: usar las puntuaciones del cross-encoder como señal de referencia para medir la calidad de un retriever o comparar configuraciones de chunking.
- Filtrado de prompt injection y contenido irrelevante: la demo Ruri Atlas muestra el reranker como herramienta para visualizar dónde aterriza un prompt malicioso en el espacio de embeddings, un uso útil para auditoría de pipelines.
- Prototipado rápido en notebooks y demos web: su peso mínimo (0,1 GB) permite cargarlo en entornos con recursos limitados y en demos WebGPU en el navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión no incluye métricas (NDCG, MRR, MAP) ni comparaciones numéricas con otros rerankers.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precisión razonable; con 36,7 M de parámetros, los pesos ocupan aproximadamente 147 MB en fp32 y unos 74 MB en fp16.
- GPU recomendadas: no requiere GPU dedicada; está diseñado para Apple Silicon (M1 o superior) mediante MLX. Puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU de consumo, incluida una GTX 1650 o una GPU integrada; también en Raspberry Pi para inferencia por CPU, aunque sin aceleración MLX.
- Opciones de despliegue: `mlx-embeddings` (vía oficial de esta conversión), y el modelo original de Hugging Face con Transformers, Text Embedding Inference o sentence-transformers para entornos no Apple.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por par en Apple Silicon, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| masahiroid/japanese-reranker-xsmall-v2-mlx | 36,7 M | no disponible | ja, en | MIT | safetensors (MLX) |
| hotchpotch/japanese-reranker-xsmall-v2 | no disponible en la informacion | no disponible | ja, en | no disponible en la informacion | safetensors (Transformers) |
| BAAI/bge-reranker-base | no disponible en la informacion | no disponible | multilingue | no disponible en la informacion | safetensors |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | no disponible en la informacion | no disponible | en | no disponible en la informacion | safetensors |

La comparación cuantitativa de rendimiento no está disponible. La diferencia principal frente al modelo original es el formato de ejecución (MLX frente a Transformers) y el ecosistema de despliegue, no la calidad del ranking, que debería ser equivalente al ser una conversión.

## Limitaciones y advertencias

- Es una conversión comunitaria, no una release oficial del autor original; posibles divergencias numéricas respecto al modelo de referencia no están documentadas.
- Modelo especializado en ranking: no genera texto ni mantiene conversaciones; usarlo fuera de esa tarea produce resultados sin sentido.
- Cobertura lingüística limitada a japonés e inglés; el rendimiento en otros idiomas no está garantizado ni documentado.
- No se especifica la longitud máxima de contexto del encoder; entradas muy largas pueden truncarse y degradar la puntuación.
- Riesgo de sesgos heredados del corpus de entrenamiento original, no evaluados en la información disponible.
- Licencia MIT, que permite uso comercial y modificación, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales antes de un despliegue en producción.
- La puntuación de salida es una probabilidad calibrada para la tarea de ranking; los umbrales óptimos dependen del dominio y deben ajustarse con datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/japanese-reranker-xsmall-v2-mlx
- Modelo base original: https://huggingface.co/hotchpotch/japanese-reranker-xsmall-v2
- Demo Ruri Atlas (WebGPU): https://huggingface.co/spaces/masahiroid/ruri-atlas
- MLX (Apple Machine Learning Research): https://github.com/ml-explore/mlx
- Herramienta de auditoría model-audit-lite: https://github.com/masahiroid/model-audit-lite
