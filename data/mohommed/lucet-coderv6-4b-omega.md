# mohommed/Lucet-CoderV6-4B-Omega

## Resumen

Lucet-CoderV6-4B-Omega es un ajuste fino (post-entrenamiento) del modelo base XHToken/Spark-X2.6-4B, desarrollado por el usuario mohommed y publicado en Hugging Face. Se presenta como un modelo orientado a generación de código y razonamiento algorítmico, con un total de 4.112.079.360 parámetros y una ventana de contexto declarada de 1.048.576 tokens (1M) heredada del modelo base. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors, con variantes GGUF derivadas de un proceso de cuantización propio.

El modelo se construye mediante un pipeline de post-entrenamiento que el autor describe con cuatro técnicas: adaptación de bajo rango con preservación de RoPE (manteniendo congeladas las proyecciones `q_proj` y `k_proj` para conservar la calibración de fase del contexto de 1M), minería activa de datos basada en clústeres de fallo con contrafactuales AST, denoising espectral QR-SVD de los adaptadores antes de fusionarlos, y una cuantización Q4_K con calibración `llama-imatrix` y una proyección de rechazo tipo Gram-Schmidt que el autor etiqueta como "uncensored". El modelo base Spark-X2.6-4B declara un 54,3% en SWE Pro y un 71,8% en BFCL-V4, aunque no se aportan detalles sobre la procedencia de esas cifras.

La relevancia de esta ficha es doble: por un lado, propone un contexto nativo de 1M tokens en un modelo de solo 4B parámetros, algo poco habitual en esa escala; por otro, la model card está cargada de terminología técnica no estándar y de afirmaciones de mejora sin protocolo de evaluación reproducible, lo que exige una lectura crítica antes de considerarlo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de XHToken/Spark-X2.6-4B); detalles internos no disponibles |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | No aplica (no se declara MoE) |
| Longitud de contexto | 1.048.576 tokens (1M, según el autor) |
| Tipos de cuantización | GGUF Q4_K (32-block crest-factor equalization); otras no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF |

## Arquitectura y entrenamiento

El modelo parte de XHToken/Spark-X2.6-4B, del que no se detalla la arquitectura interna más allá de ser un transformer con contexto nativo de 1M tokens. El post-entrenamiento se describe como una adaptación de bajo rango con rango `r=16` aplicada solo a las matrices `v_proj`, `out_proj` y a las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`, `g_proj`) en la mitad superior de la red, dejando intactas `q_proj` y `k_proj` en todas las capas para no alterar la calibración de fase RoPE asociada al contexto largo. Los adaptadores se someten a un denoising espectral QR-SVD (criterio de Gavish-Donoho) antes de fusionarse con los pesos base, con coste declarado de O(r²(d_out + d_in)).

El entrenamiento se apoya en una estrategia de minería activa de datos: se diagnostican modos de fallo agrupados en clústeres (`FAIL_TRUNCATED_THINK`, `FAIL_ASSERTION_BOUNDARY`, `FAIL_MISSING_IMPORT`, `FAIL_EPISTEMIC_HALLUCINATION`) y se seleccionan tareas vecinas no vistas más bugs contrafactuales generados por transformación AST, sin repetición de datos según el autor. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La cuantización GGUF Q4_K incorpora ecualización de factor de cresta en superbloques de 32 elementos y calibración con `llama-imatrix`.

## Capacidades

- Generación de texto y razonamiento algorítmico, con énfasis declarado en tareas de código (el autor reporta mejoras en MBPP).
- Generación y corrección de código, incluyendo reparación de bugs guiada por contrafactuales AST durante el entrenamiento.
- Razonamiento multi-paso con trazas de "thinking" (el autor menciona el modo de fallo `FAIL_TRUNCATED_THINK`, lo que implica un formato de razonamiento extendido).
- Ventana de contexto de hasta 1M tokens, según la model card, heredada del modelo base.
- Tool calling / function calling: el modelo base declara 71,8% en BFCL-V4, pero no se confirma que el ajuste fino conserve esa capacidad.
- Capacidades multilingües: no disponibles.
- Modo "uncensored": el autor declara una proyección de rechazo ortogonalizada que reduce las negativas del modelo; no hay evaluación independiente de esta afirmación.
- No se declaran capacidades de visión ni audio.

## Casos de uso

- Reparación de bugs en bases de código: el entrenamiento con contrafactuales AST está diseñado para que el modelo detecte errores de importación, límites de aserción y truncamientos de razonamiento; se usaría como asistente de parcheo en pipelines de revisión.
- Análisis de repositorios completos: con 1M tokens de contexto declarados, podría ingerir múltiples ficheros y trazas de error en una sola pasada para localizar la causa raíz de un fallo, siempre que se valide empíricamente el contexto efectivo.
- Generación de tests unitarios: el foco en `FAIL_ASSERTION_BOUNDARY` sugiere utilidad para proponer aserciones y casos límite en suites de pruebas existentes.
- Agentes de codificación multi-paso: si conserva el tool calling del modelo base, podría integrarse en bucles de agente que invocan compiladores, linters o ejecutores de tests.
- Prototipado local en hardware de consumo: con 4B parámetros y variantes GGUF Q4_K, es desplegable en GPUs de gama media para tareas de autocompletado y explicación de código.
- Experimentación en investigación sobre post-entrenamiento: el pipeline descrito (minería por clústeres de fallo, QR-SVD, adaptación selectiva) es un caso de estudio reproducible para quienes investigan técnicas de ajuste eficiente.
- Generación de documentación técnica y explicaciones de código en contextos largos, aprovechando la ventana extendida.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, comparando el modelo base con el ajuste:

| Benchmark / métrica | Spark-X2.6-4B (stock) | Lucet-Omega | Mejora |
|---|---|---|---|
| MBPP sanitizado held-out `pass@1` (n=50) | 58,0% | 72,0% | +14,0% |
| Tokens medios (razonamiento + código) por tarea resuelta | 470 | 376 | +20,1% más rápido |
| Tasa anti-alucinación epistémica held-out (n=8) | 0,0% | 12,5% | +12,5% |
| SWE Pro (modelo base, declarado) | 54,3% | No disponible | — |
| BFCL-V4 (modelo base, declarado) | 71,8% | No disponible | — |

Advertencia: estas cifras provienen únicamente del autor, con muestras pequeñas (n=50 y n=8) y sin protocolo de evaluación detallado ni replicación independiente. No se han publicado resultados de benchmarks verificables por terceros en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 8,2 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 1M tokens la caché KV puede crecer de forma muy significativa y dominar el consumo.
- VRAM estimada en Q4_K (GGUF): en torno a 2,5-3 GB para pesos, más caché KV y buffers.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S; para contexto largo real se necesita memoria suficiente para la caché KV.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) en fp16 con contexto moderado; en Q4_K cabe en GPUs de 8-12 GB.
- Despliegue: transformers (formato nativo), llama.cpp / Ollama para las variantes GGUF; vLLM y TGI no están confirmados para este modelo (requiere `custom_code` según los tags).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Lucet-CoderV6-4B-Omega | 4,1B | 1M (declarado) | Apache 2.0 | Ajuste fino de Spark-X2.6-4B; benchmarks solo del autor |
| Qwen2.5-Coder-3B / 7B | 3B / 7B | 32K-128K | Apache 2.0 | Referencia consolidada en código; evaluación independiente disponible |
| DeepSeek-Coder-V2-Lite | 16B (2,4B activos, MoE) | 128K | DeepSeek License | Más grande; requiere más VRAM |
| StarCoder2-3B | 3B | 16K | BigCode OpenRAIL-M | Enfocado a código; contexto corto |

La comparación directa es difícil porque no existen evaluaciones independientes de Lucet-Omega y el modelo base Spark-X2.6-4B tampoco cuenta con verificación externa en la información disponible. Frente a Qwen2.5-Coder o StarCoder2, la ventaja declarada es el contexto de 1M tokens; la desventaja es la ausencia de benchmarks reproducibles.

## Limitaciones y advertencias

- Los benchmarks son autoinformados, con muestras muy pequeñas (n=50 en MBPP, n=8 en anti-alucinación) y sin protocolo ni semilla documentados; no deben tomarse como evidencia sólida.
- La ventana de 1M tokens es una afirmación del autor heredada del modelo base; no se ha verificado la calidad de recuperación en contextos largos (needle-in-a-haystack, etc.).
- El modelo base Spark-X2.6-4B tiene poca trazabilidad pública; se desconoce su dataset de entrenamiento y sus sesgos.
- La etiqueta "uncensored" implica que el modelo puede generar contenido que otros modelos rechazan; esto traslada la responsabilidad de filtrado al despliegue y puede ser inadecuado para aplicaciones orientadas al público.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido.
- El tag `custom_code` indica que la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de usarlo en producción.
- Riesgo de alucinación en código: la tasa declarada de anti-alucinación es solo del 12,5%, es decir, la mayoría de escenarios de prueba seguían produciendo alucinación según el propio autor.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base cuyas condiciones no se detallan, conviene verificar la licencia original de Spark-X2.6-4B.
- Terminología de la model card no estándar (crest-factor equalization, GSQ, RCO) sin definiciones formales ni referencias a papers, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/mohommed/Lucet-CoderV6-4B-Omega
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales.
