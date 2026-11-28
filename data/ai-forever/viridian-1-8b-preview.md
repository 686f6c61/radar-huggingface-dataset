# ai-forever/Viridian-1-8B-Preview

## Resumen

Viridian-1-8B (Preview) es un modelo de lenguaje hibrido decoder-only desarrollado por ai-forever (el equipo de investigación en IA de Sber). Combina capas KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention) intercaladas en ocho grupos, conectadas mediante Attention Residuals, y prescinde por completo de codificaciones posicionales explícitas (NoPE). El modelo principal tiene 8.000 millones de parámetros densos, a los que se suma una cabeza de predicción multi-token (MTP) de 250 millones de parámetros para decodificación especulativa.

El modelo se presenta como una versión preview orientada a inferencia rápida y procesamiento de contexto largo. Sus capas KDA soportan una ventana nativa de 256K tokens, extensible hasta 1M, con una tasa de recuperación del 100% en tareas NIAH dentro de RULER según la model card. El entrenamiento pone el foco en matemáticas y tareas agénticas, con incorporación de datos en ruso durante la fase de midtraining, y todos los datos de entrenamiento son públicos y de licencia permisiva.

Es relevante ahora porque demuestra que un modelo denso de 8B con arquitectura híbrida puede competir con modelos considerablemente más caros en tareas de contexto largo y razonamiento, y porque libera recetas de entrenamiento completas, configuraciones y código de evaluación junto con los pesos bajo licencia Apache 2.0. La versión completa, con mayor presupuesto de pretraining, alineamiento mediante RL agéntico y esparsificación de MLA, está anunciada para más adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only hibrido: 24 capas KDA + 8 capas MLA intercaladas en 8 grupos, con Attention Residuals y NoPE (sin codificacion posicional explicita) |
| Parametros totales | 8B (modelo principal) + 250M (cabeza MTP) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K nativo, extensible a 1M; checkpoints SFT entrenados a 32K/128K |
| Tipos de cuantizacion | no disponible (la model card solo menciona bfloat16 para Transformers y vLLM) |
| Idiomas soportados | ingles (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (shards compatibles con Transformers y con el plugin de vLLM) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only híbrido que intercala dos tipos de atención en ocho grupos: 24 capas KDA (Kimi Delta Attention, una atención lineal con estado recurrente) y 8 capas MLA (Multi-head Latent Attention, atención completa con compresión latente de KV). Las capas se conectan mediante Attention Residuals, un mecanismo que, según el autor, mejora notablemente la estabilidad del entrenamiento y reduce la pérdida de entropía cruzada con el mismo presupuesto de tokens. El modelo usa NoPE, es decir, elimina las codificaciones posicionales explícitas, y la combinación de KDA y Attention Residuals es lo que habilita la ventana de 256K tokens con recuperación perfecta en NIAH.

El entrenamiento se organiza en tres fases: pretraining con 5,26 billones de tokens y contexto de 4K; midtraining en tres etapas (151.030 millones de tokens a 4K, 150.860 millones a 64K y 100.120 millones a 256K); y SFT con 48.900 millones de tokens a 32K/128K. En total, unos 5,3 billones de tokens de pretraining, 400.000 millones de midtraining y 50.000 millones de SFT. Los datos se centran en matemáticas y tareas agénticas, con datasets en ruso introducidos en midtraining. Tras cada etapa se aplica model souping con pesos EMA para mejorar la estabilidad de los checkpoints. No se menciona RLHF ni DPO en la versión preview (el alineamiento con RL agéntico se anuncia para la versión completa).

## Capacidades

- Generación de texto y completado de prompts en inglés y ruso.
- Razonamiento matemático reforzado por el foco del entrenamiento en matemáticas.
- Tareas agénticas y de razonamiento multi-paso, según el énfasis declarado del entrenamiento.
- Procesamiento de contexto largo: ventana nativa de 256K tokens, extensible a 1M, con recuperación del 100% en NIAH según RULER.
- Decodificación especulativa nativa mediante la cabeza MTP de 250M de parámetros.
- Inferencia eficiente gracias a las capas KDA (atención lineal) y a la compresión de KV de MLA.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: el modelo puede procesar contratos, informes o expedientes de hasta 256K tokens en una sola pasada, lo que permite resumir o extraer información de corpus completos sin trocear el contexto y perder coherencia entre secciones.
- Asistentes de código sobre repositorios grandes: con contexto de 256K puede ingerir varios ficheros y su historial de cambios para responder preguntas sobre la base de código o generar parches contextualizados.
- Razonamiento matemático y resolución de problemas: el entrenamiento centrado en matemáticas lo hace adecuado para tutores automáticos, verificación de demostraciones o generación de problemas con solución paso a paso.
- Agentes autónomos multi-paso: el énfasis en tareas agénticas y la ventana larga permiten mantener el estado de una tarea compleja (herramientas, observaciones, historial) dentro del contexto sin truncamientos agresivos.
- Procesamiento de documentación en ruso e inglés: útil para empresas que operan en ambos idiomas y necesitan un único modelo para clasificación, extracción y generación en las dos lenguas.
- Serving de alto rendimiento con vLLM: el plugin oficial y la decodificación especulativa con MTP permiten desplegar el modelo en producción con latencia reducida y batching, adecuado para APIs de generación a escala.
- Búsqueda semántica y recuperación sobre corpus largos: la recuperación perfecta en NIAH a 256K lo hace apto para tareas de "needle in a haystack" sobre archivos históricos o bases documentales.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card afirma que el modelo establece un nuevo estado del arte entre LLMs híbridos de 8B parámetros densos y que compite con modelos más caros, y menciona un 100% de recall en tareas NIAH dentro de RULER, pero no incluye tablas con valores de MMLU, HumanEval, GSM8K ni comparativas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para los pesos del modelo principal (8B × 2 bytes), más overhead de activaciones y caché KV; la cabeza MTP añade unos 0,5 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para contexto largo y serving con vLLM; una RTX 4090 (24 GB) es suficiente para bfloat16 a contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB si se dispone de cuantización, aunque la model card no documenta formatos cuantizados.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (backend KDA de referencia, lento en prefills largos) y vLLM 0.34.0 mediante el plugin oficial incluido en `vllm_plugin/`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuración de ejemplo de vLLM usa `--max-model-len 4096`, `--max-num-seqs 4` y `--max-num-batched-tokens 1024` como ajuste inicial de inspección, no como cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viridian-1-8B-Preview | 8B (+250M MTP) | 256K (ext. 1M) | Hibrida KDA + MLA, NoPE | Apache 2.0 | Hugging Face (preview) |
| Alternativas de 8B denso | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos numéricos ni de especificaciones de modelos comparables que permitan una comparación rigurosa. La model card solo afirma de forma cualitativa que supera a modelos de tamaño y presupuesto de entrenamiento similares.

## Limitaciones y advertencias

- Es una versión preview: la versión completa con mayor presupuesto de pretraining, alineamiento RL y esparsificación de MLA aún no está publicada, por lo que el comportamiento puede cambiar sustancialmente.
- No se documenta alineamiento mediante RLHF ni DPO en esta versión, lo que puede traducirse en menor robustez frente a instrucciones ambiguas o contenido sensible.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad.
- Cobertura lingüística limitada a inglés y ruso; el rendimiento en castellano no está garantizado ni evaluado.
- El backend de referencia en Transformers prioriza corrección sobre velocidad y es lento en prefills largos; para producción es necesario el plugin de vLLM.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de desplegarlo.
- No se documentan formatos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja.
- Licencia Apache 2.0 permite uso comercial, pero al ser una preview conviene validar el comportamiento antes de integrarla en producción.

## Enlaces

- [Hugging Face: ai-forever/Viridian-1-8B-Preview](https://huggingface.co/ai-forever/Viridian-1-8B-Preview)
- [GitHub: ai-forever/Viridian](https://github.com/ai-forever/Viridian)
- [Checkpoint Pretrain](https://huggingface.co/ai-forever/Viridian-1-8B-Pretrain-Preview)
- [Checkpoint Midtrain 4K](https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-4K-Preview)
- [Checkpoint Midtrain 64K](https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-64K-Preview)
- [Checkpoint Midtrain 256K](https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-256K-Preview)
- [Checkpoint SFT](https://huggingface.co/ai-forever/Viridian-1-8B-SFT-Preview)
- Artículo en Habr (ruso): enlace no disponible en la información proporcionada.
