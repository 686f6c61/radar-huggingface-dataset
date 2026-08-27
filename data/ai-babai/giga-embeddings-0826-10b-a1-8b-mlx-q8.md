# ai-babai/giga-embeddings-0826-10b-a1.8b-mlx-q8

## Resumen

Giga Embeddings 0826 10B-A1.8B es un modelo de embeddings de texto de alta capacidad, basado en una arquitectura sparse Mixture-of-Experts (MoE) con aproximadamente 10.000 millones de parámetros totales y 1.800 millones activos por token. Fue desarrollado originalmente por ai-sage y posteriormente cuantizado a 8 bits (Q8) y adaptado para Apple Silicon por ai-babai, dando lugar a esta versión MLX. El modelo está diseñado para búsqueda semántica, recuperación aumentada por generación (RAG), similitud de textos, clustering y clasificación, con soporte para ruso e inglés.

Esta versión cuantizada mantiene una calidad muy cercana al modelo original en BF16: la comprobación agregada del autor muestra una variación de NDCG@10 de −0.00046 respecto al MLX BF16 nativo, y el modelo original alcanza 74.98 en el MTEB ruso, el mejor resultado de la familia Giga Embeddings. El artefacto Q8 reduce el tamaño de descarga a 11.144 GB y el pico de memoria Metal a 14.423 GB, lo que lo hace viable en Macs con Apple Silicon de gama media-alta. Sin embargo, el autor advierte de una degradación notable en búsqueda de código (NDCG@10 −0.01297), por lo que recomienda usar el modelo de 3B para tareas generales salvo que se evalúe este trade-off en datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-v3 bidireccional (sparse MoE) |
| Parametros totales | 10B (original); 2.948.079.680 en el checkpoint Q8 (safetensors) |
| Parametros activos | ~1.8B por token |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | Q8 affine (group size 64); routers y normalizacion en BF16 |
| Idiomas soportados | Ruso, ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original es un encoder bidireccional basado en la arquitectura DeepSeek-v3, con capas sparse MoE que activan aproximadamente 1.8B parámetros por token. El entrenamiento sigue un pipeline de tres etapas descrito en el paper GigaEmbeddings: contraste a gran escala en corpus web, fine-tuning con hard negatives y ajuste multitarea con instrucciones jerárquicas. El resultado es un modelo de embeddings que supera a otros de su categoría en benchmarks MTEB para ruso, inglés, multilingüe y código.

La versión MLX Q8 aplica cuantización affine de 8 bits a los pesos elegibles, manteniendo los routers MoE y las capas de normalización en BF16 para preservar la fidelidad de la mezcla de expertos. El autor ha verificado que la cuantización no altera significativamente el comportamiento de recuperación en pruebas locales, con una concordancia top-1 del 97.66% y una superposición media top-10 del 98.09% frente al MLX BF16 nativo.

## Capacidades

- Generacion de embeddings de texto densos de 1536 dimensiones para busqueda semantica, similitud coseno, clustering y clasificacion.
- Soporte de instrucciones para queries (necesario para recuperacion optima); los documentos no requieren prefijo.
- Procesamiento de secuencias de hasta 8192 tokens, adecuado para documentos largos.
- Multilingue ruso-ingles, con calidad especialmente alta en ruso (74.98 MTEB ruso).
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica en corpus rusos: permite indexar documentos y recuperar pasajes relevantes mediante similitud coseno, con una ventana de 8192 tokens que admite parrafos extensos.
- RAG para asistentes en ruso e ingles: se puede integrar como componente de recuperacion en pipelines de generacion aumentada, usando la instruccion de query para alinear la representacion de la pregunta con la de los documentos.
- Clasificacion de textos: los embeddings pueden alimentar clasificadores lineales o modelos ligeros para tareas como analisis de sentimiento o categorizacion tematica en entornos locales.
- Clustering de documentos: agrupar articulos, informes o mensajes por similitud semantica, aprovechando la capacidad de procesar lotes de 16 textos de 1024 tokens a 0.76 documentos/s en un M4 Pro.
- Deduplicacion de contenido: comparar embeddings para detectar textos duplicados o casi duplicados en grandes colecciones, con un coste de memoria moderado (14.4 GB pico).
- Busqueda en codigo (con advertencia): aunque la calidad de code-search se degrada ligeramente en Q8, el modelo puede utilizarse para recuperar fragmentos de codigo en repositorios, siempre que se valide el impacto en el caso de uso.

## Benchmarks y rendimiento

El modelo original (BF16) obtuvo 74.98 en el MTEB ruso, el mejor resultado de la familia Giga Embeddings. El autor de la cuantizacion no reejecuto el MTEB completo sobre Q8, pero realizo comprobaciones locales de recuperacion comparando con el MLX BF16 nativo. Los resultados se resumen a continuacion:

| Metrica | Valor |
|---|---|
| MTEB ruso (modelo original BF16) | 74.98 |
| Cambio NDCG@10 agregado (Q8 vs MLX BF16) | −0.00046 |
| Cambio NDCG@10 en code-search (Q8 vs MLX BF16) | −0.01297 |
| Concordancia top-1 (Q8 vs MLX BF16) | 97.66% |
| Superposicion media top-10 (Q8 vs MLX BF16) | 98.09% |
| Cambio en RuSTS (Q8 vs MLX BF16) | +0.000350 |
| Cambio en precision de clasificacion (Q8 vs MLX BF16) | +0.000541 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Dispositivo: Apple Silicon (macOS); no se soportan GPUs NVIDIA ni CUDA.
- Memoria Metal pico: 14.423 GB en la prueba de 16 textos largos; se recomienda un Mac con al menos 16 GB de RAM unificada.
- Tiempo de inferencia: 0.597 s por texto de 512 tokens en un M4 Pro.
- Throughput en lote: 0.76 documentos/s para 16 textos de 1024 tokens.
- Despliegue: mediante la libreria `giga-embeddings-mlx` (pip install giga-embeddings-mlx), que gestiona la carga y la inferencia en Metal.
- No se dispone de datos de latencia en otros chips (M1, M2, M3) ni de soporte para vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

Dentro de la familia Giga Embeddings 0826, el autor ofrece tres versiones MLX Q8. La comparativa se basa en los datos de la model card:

| Modelo | Tamano descarga | MTEB ruso (original) | Cambio NDCG@10 (Q8 vs BF16) | Uso recomendado |
|---|---|---|---|---|
| 10B-A1.8B Q8 | 11.144 GB | 74.98 | −0.00046 (agregado) | Investigacion; con advertencia para code-search |
| 3B Q8 | 3.755 GB | 74.56 | +0.00181 | Recomendado por defecto |
| 480M Q8 | 0.525 GB | 70.98 | +0.00289 | Mas pequeno y rapido |

No se dispone de comparativas con modelos de otros desarrolladores (p. ej., BGE, E5, GTE) en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion en code-search: el cambio de NDCG@10 es de −0.01297 frente al MLX BF16, con una concordancia top-1 del 92.19%. El autor recomienda evaluar este trade-off antes de usar el modelo para busqueda de codigo.
- No es una version oficial de ai-sage: se trata de una cuantizacion independiente realizada por ai-babai, aunque basada en el modelo original y con hashes de reproducibilidad documentados.
- Solo para Apple Silicon: no funciona en entornos Linux/Windows con GPUs NVIDIA.
- Requiere instruccion explicita para queries: si no se proporciona, la calidad de recuperacion puede degradarse.
- No es un modelo generativo: no puede completar texto ni responder preguntas directamente.
- El checkpoint Q8 tiene 2.948.079.680 parametros en safetensors, pero el modelo original declara 10B; la diferencia se debe a la cuantizacion y a que no se almacenan todos los pesos en precision completa.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-babai/giga-embeddings-0826-10b-a1.8b-mlx-q8
- Modelo original: https://huggingface.co/ai-sage/Giga-Embeddings-instruct-10B-A1.8B-0826
- Paper original: https://arxiv.org/abs/2608.23806
- Repositorio GitHub: https://github.com/ai-babai/giga-embeddings-mlx
- Paquete PyPI: https://pypi.org/project/giga-embeddings-mlx/
- Coleccion de modelos MLX: https://huggingface.co/collections/ai-babai/giga-embeddings-0826-for-apple-silicon-mlx-q8-6a8eec40b26f6543f5da3244
- Informe de benchmarks MLX: https://github.com/ai-babai/giga-embeddings-mlx/blob/main/docs/benchmarks/0826-results.md
