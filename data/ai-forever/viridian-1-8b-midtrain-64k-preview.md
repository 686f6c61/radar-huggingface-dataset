# ai-forever/Viridian-1-8B-Midtrain-64K-Preview

## Resumen

Viridian-1-8B-Midtrain-64K-Preview es un checkpoint intermedio (midtrain, etapa 2) de la familia Viridian-1-8B, desarrollada por ai-forever (el equipo detrás de modelos como Yandex/Sber anteriores y la familia ruGPT). Se trata de un modelo de lenguaje decoder-only híbrido de 8.313.537.098 parámetros (aproximadamente 8B densos) diseñado para inferencia rápida y procesamiento de contexto largo. Combina capas KDA (Kimi Delta Attention, un mecanismo de atención lineal) y MLA (Multi-head Latent Attention) en ocho grupos intercalados, con 24 capas KDA y 8 capas MLA unidas mediante Attention Residuals, y prescinde por completo de codificación posicional explícita (NoPE).

Este checkpoint concreto corresponde a la segunda etapa de midtraining con ventana de 64K tokens, tras 5,26 billones de tokens de pretraining y 151.030 millones de tokens de la primera etapa de midtraining a 4K. La familia completa entrena con 5,3 billones de tokens en pretraining, 400.000 millones en midtraining y 50.000 millones en SFT, con foco en matemáticas y tareas agénticas, e incorpora datasets en ruso durante el midtraining. Incluye una cabeza de predicción multi-token (MTP) de 250 millones de parámetros para decodificación especulativa.

Es relevante ahora porque representa una apuesta por arquitecturas híbridas (atención lineal + MLA) con contexto nativo muy largo (256K en el checkpoint base, extensible a 1M) y por la publicación de recetas de entrenamiento completas con datasets de licencia permisiva. No obstante, al ser una versión *preview* de midtrain, no está alineada para uso conversacional ni instrucciones: es una base para completar texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only híbrida: 8 grupos intercalados con 24 capas KDA (atención lineal) y 8 capas MLA, unidas por Attention Residuals; NoPE (sin codificación posicional) |
| Parámetros totales | 8.313.537.098 (aprox. 8B densos) + cabeza MTP de 250M |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64K tokens en este checkpoint (base hasta 256K, extensible a 1M) |
| Tipos de cuantización | No disponible (el repo solo publica pesos en bfloat16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) y ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida decoder-only en la que se intercalan ocho grupos de capas. Cada grupo combina capas KDA (atención lineal de tipo delta, orientada a eficiencia en inferencia y prefill largo) con capas MLA (Multi-head Latent Attention, que comprime las claves y valores en un espacio latente para reducir el coste de KV cache). Las conexiones entre grupos se realizan mediante Attention Residuals, un mecanismo que, según el autor, mejora la estabilidad del entrenamiento y reduce la cross-entropy a igual presupuesto de tokens. El modelo usa NoPE: no hay codificación posicional explícita, lo que delega la información de orden en los propios mecanismos de atención.

El entrenamiento se organiza en etapas: 5,26 billones de tokens de pretraining (contexto 4K), 151.030 millones de tokens de midtraining etapa 1 (4K), 150.860 millones en esta etapa 2 (64K, el checkpoint de esta ficha) y 100.120 millones en la etapa 3 (256K), seguidos de 48.900 millones de tokens de SFT (32K/128K). El foco de datos son matemáticas y tareas agénticas, con incorporación de datasets en ruso en midtraining; todos los datos son públicos y de licencia permisiva. Se aplica model souping con pesos EMA tras cada etapa para estabilizar checkpoints. La cabeza MTP de 250M habilita decodificación especulativa. El checkpoint es un modelo base de midtrain: no ha pasado por RLHF/DPO ni alineación agéntica (el autor anuncia RL agéntico para la versión final).

## Capacidades

- Generación de texto autoregresiva (modelo base de completación, no chat).
- Razonamiento matemático y tareas de tipo agéntico como foco declarado del entrenamiento.
- Procesamiento de contexto largo: ventana nativa de 64K en este checkpoint, con la familia llegando a 256K y hasta 1M con recall del 100% en NIAH/RULER según el autor.
- Decodificación especulativa mediante la cabeza MTP de 250M parámetros.
- Multilingüe limitado a inglés y ruso.
- Integración con vLLM mediante plugin propio (tokenizer-mode `viridian`).
- No se documenta soporte de tool calling, function calling ni modo thinking en este checkpoint base.
- No se documenta visión ni audio.

## Casos de uso

- Completación de texto y prototipado de generación: al ser un checkpoint base de midtrain, sirve para evaluar la calidad del modelo en tareas de continuación antes de pasar al SFT; útil para investigadores que quieran medir la curva de midtraining.
- Procesamiento de documentos largos en inglés y ruso: con 64K tokens de ventana puede resumir o extraer información de contratos, informes o artículos extensos en una sola pasada, sin truncar.
- Investigación en arquitecturas híbridas: permite reproducir y comparar el comportamiento de KDA + MLA + Attention Residuals frente a transformers clásicos, con recetas y datasets publicados.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir ganancias de throughput en pipelines de serving con vLLM frente a decodificación estándar.
- Fine-tuning posterior para dominios específicos: al estar bajo Apache 2.0 y con pesos safetensors, se puede ajustar para clasificación, extracción de entidades o generación especializada en ruso técnico o científico.
- Benchmarking de contexto largo: útil para reproducir pruebas NIAH/RULER y validar el comportamiento de NoPE a 64K antes de escalar al checkpoint de 256K.
- Base para pipelines de generación en producción tras SFT: el soporte de vLLM con plugin permite desplegar el modelo en servidores GPU con batching continuo una vez ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que Viridian-1-8B establece un nuevo estado del arte entre LLMs híbridos de 8B densos y que logra 100% de recall en NIAH en RULER con contexto de 256K, pero no se incluyen tablas numéricas de MMLU, HumanEval, GSM8K ni comparativas cuantitativas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16-17 GB solo para pesos (8,3B × 2 bytes), más KV cache y activaciones; con contexto de 64K el consumo de KV cache crece de forma notable, aunque MLA lo comprime respecto a atención estándar.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para contexto largo y serving con vLLM; L40S 48 GB como alternativa.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 para contextos moderados; en RTX 3090 (24 GB) también es viable con contexto reducido. No se documentan cuantizaciones GGUF, por lo que no se garantiza su uso en GPUs de 12-16 GB.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (backend KDA de referencia, lento en prefills largos) y vLLM 0.34.0 con el plugin incluido en `vllm_plugin/` (recomendado para serving en GPU).
- Latencia y throughput: no disponibles. El ejemplo de vLLM usa `--max-model-len 4096`, `--max-num-seqs 4`, `--max-num-batched-tokens 1024` y `--enforce-eager`, lo que sugiere un serving conservador en la versión preview.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| Viridian-1-8B-Midtrain-64K-Preview | 8,3B densos + 250M MTP | 64K (familia hasta 256K/1M) | Híbrida KDA + MLA, NoPE | Apache 2.0 | Preview (midtrain) |
| Llama 3.1 8B | 8B densos | 128K | Transformer clásico | Llama 3.1 Community | Estable |
| Qwen2.5 7B | 7,6B densos | 128K | Transformer clásico | Apache 2.0 | Estable |
| Mistral 7B v0.3 | 7,2B densos | 32K | Transformer clásico (GQA, SWA) | Apache 2.0 | Estable |

La comparación de rendimiento cuantitativo no está disponible en la información proporcionada. Frente a estos modelos, Viridian destaca por su arquitectura híbrida con atención lineal y NoPE, su cabeza MTP para decodificación especulativa y su foco declarado en ruso, pero al ser un checkpoint de midtrain sin alineación no es directamente comparable en tareas de instrucciones.

## Limitaciones y advertencias

- Es un checkpoint de midtrain, no un modelo alineado: no sigue instrucciones de forma fiable ni está optimizado para diálogo; su uso previsto es completación y fine-tuning posterior.
- No se han publicado benchmarks numéricos en la información disponible; las afirmaciones de estado del arte del autor no son verificables con los datos proporcionados.
- Riesgo de alucinación inherente a modelos base sin RLHF/DPO; no apto para producción sin evaluación y ajuste.
- Cobertura lingüística limitada a inglés y ruso; el rendimiento en castellano no está documentado.
- El backend KDA de referencia en Transformers es lento en prefills largos; el serving eficiente requiere el plugin de vLLM, lo que añade complejidad operativa.
- Requiere `trust_remote_code=True`, con el riesgo de seguridad que implica ejecutar código personalizado del repositorio.
- El contexto real utilizable en producción puede ser inferior a 64K según el backend y la configuración de serving (el ejemplo de vLLM limita a 4096 tokens).
- Licencia Apache 2.0 permite uso comercial, pero al ser una versión preview el autor anuncia cambios sustanciales en la versión final (mayor presupuesto de pretraining, RL agéntico, esparsificación de MLA).
- No hay cuantizaciones oficiales publicadas, lo que limita el despliegue en hardware de gama media.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-64K-Preview
- Repositorio GitHub: https://github.com/ai-forever/Viridian
- Checkpoint de pretraining: https://huggingface.co/ai-forever/Viridian-1-8B-Pretrain-Preview
- Checkpoint midtrain etapa 1 (4K): https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-4K-Preview
- Checkpoint midtrain etapa 3 (256K): https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-256K-Preview
- Checkpoint SFT: https://huggingface.co/ai-forever/Viridian-1-8B-SFT-Preview
- Artículo en Habr (ruso): enlace no disponible (la model card incluye un placeholder "Ссылка")
