# moeshawky/RockAndEgg-313M-v2

## Resumen

RockAndEgg-313M-v2 es un backbone transformer derivado de Qwen3-0.6B-Base mediante cirugía de modelo (depth pruning físico): conserva únicamente los 10 primeros bloques transformer de los 28 originales, manteniendo la anchura, el tokenizador y la topología de atención del modelo donante. El resultado es un modelo de 312.892.928 parámetros (frente a los 596M del original), sin cabeza de modelado de lenguaje ni cabeza de clasificación, pensado como extractor de representaciones y base para tareas discriminativas de comprensión del lenguaje.

Lo desarrolla el autor independiente moeshawky dentro del proyecto RockAndEgg, cuyo objetivo declarado es investigar hasta qué punto un transformer causal compacto puede adaptarse a tareas de clasificación, similitud semántica e inferencia. La versión v2 añade entrenamiento multi-tarea de representaciones y fue seleccionada mediante un estudio controlado de regularización por dispersión auxiliar (RAE-005), con dispersión desactivada como configuración elegida tras 4.800 pasos de continuación.

Es relevante porque demuestra empíricamente que truncar profundidad conserva gran parte del rendimiento discriminativo (macro-AUPRC de 0,9850 frente a 0,9864 del modelo completo en un estudio de tarea específica), ofreciendo un backbone de ~313M parámetros con contexto configurado de 32.768 posiciones y licencia Apache 2.0. No es un modelo generativo ni un clasificador zero-shot: es una base para añadir cabezas de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3Model sin cabeza (headless), transformer causal con grouped-query attention |
| Parametros totales | 312.892.928 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 posiciones configuradas; evaluado a 128 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) |

Otras especificaciones: 10 de 28 capas transformer (bloques 0-9), hidden size 1.024, intermediate size 3.072, 16 cabezas de atención, 8 cabezas KV, vocabulario de 151.936 tokens, normalización RMSNorm, interfaz prevista `AutoModel` de Hugging Face, tamaño del repo 1,9 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder causal de la familia Qwen3, truncado físicamente en profundidad: se retienen los bloques 0-9 con sus pesos preentrenados reales, preservando dimensiones, tokenizador y atención. No es un estudiante destilado al estilo MiniLM ni un modelo con anchura reducida; el autor investigó también estrechamiento de FFN y destilación profesor-alumno, y ninguna de esas vías produjo un punto operativo mejor en las condiciones probadas. La atención es causal con grouped-query attention (16 cabezas de consulta, 8 de clave-valor), lo que conviene no confundir con la atención bidireccional de BERT o DeBERTa.

El entrenamiento parte del checkpoint fundacional (paso 600) de entrenamiento multi-tarea de representaciones (RAE-TPU-003) y continúa con RAE-005, una continuación controlada de 4.800 pasos en la que se seleccionó la variante con dispersión desactivada. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. La evaluación reportada se realizó con longitud de secuencia de 128 tokens.

## Capacidades

- Extracción de características y representaciones contextuales para texto en inglés.
- Clasificación de texto mediante cabezas entrenadas por el usuario (sentimiento, tema, etc.).
- Inferencia de lenguaje natural y detección de paráfrasis.
- Regresión de similitud semántica.
- Adaptación por transfer learning con cabezas de clasificación, regresión o ranking/scoring.
- Investigación sobre geometría de representaciones y transformers causales truncados en profundidad.
- No soporta tool calling, function calling ni razonamiento multi-paso de agentes.
- No es un modelo de chat ni sigue instrucciones.
- No tiene capacidades multimodales (visión, audio) ni modo de pensamiento.

## Casos de uso

- Clasificación de sentimiento en producción: se añade una cabeza lineal sobre las representaciones del backbone y se entrena con datos etiquetados del dominio; el tamaño de 313M permite desplegarlo en una sola GPU consumer.
- Moderación de contenido y filtrado de temas: el modelo actúa como extractor de features con contexto de hasta 32.768 posiciones, útil para clasificar documentos largos sin truncar agresivamente.
- Detección de paráfrasis y deduplicación semántica: se entrena una cabeza de similitud o se comparan embeddings de pares de frases para agrupar duplicados en pipelines de datos.
- Búsqueda semántica y ranking: las representaciones sirven para alimentar un reranker o un sistema de recuperación con una cabeza de scoring entrenada sobre pares consulta-documento.
- Investigación en transfer learning con presupuesto reducido: sirve como baseline compacto para comparar contra BERT y DeBERTa en las mismas tareas downstream, tal como plantea el objetivo del proyecto.
- Estudio de arquitecturas truncadas: permite reproducir experimentos de depth pruning y analizar cómo evoluciona la calidad de las representaciones al recortar capas de un modelo Qwen3.
- Clasificación multietiqueta en dominios verticales (soporte, legal, tickets): se entrena una cabeza específica con el vocabulario y la ontología de etiquetas del cliente.

## Benchmarks y rendimiento

La model card solo reporta un estudio de arquitectura sobre descendientes con fine-tuning específico de tarea en una aplicación de clasificación semántica de ocho salidas; no son resultados zero-shot del backbone publicado.

| Arquitectura | Parametros | Macro-AUPRC held-out |
|---|---:|---:|
| Qwen3 completo, 28 capas | 596,1M | 0,9864 |
| Qwen3 truncado, 10 capas | 312,9M | 0,9850 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,63 GB solo para pesos (312,9M × 2 bytes), más overhead de activaciones y del runtime; en la práctica, menos de 2 GB para secuencias cortas.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) si se necesita mayor throughput.
- Puede ejecutarse en CPU para inferencia por lotes de baja latencia, dado el reducido tamaño.
- Opciones de despliegue: `transformers` con `AutoModel`, Text Embeddings Inference (etiqueta `text-embeddings-inference`), y endpoints compatibles. No se documentan pesos GGUF ni soporte explícito de llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia |
|---|---:|---|---|---|
| RockAndEgg-313M-v2 | 312,9M | 32.768 configurado (evaluado a 128) | Backbone causal truncado, sin cabeza | Apache 2.0 |
| Qwen3-0.6B-Base (donante) | 596M | 32.768 | Transformer causal completo | Apache 2.0 |
| RockAndEgg-313M (v1) | 313M | 32.768 configurado | Backbone causal truncado, sin cabeza | Apache 2.0 |

La model card menciona BERT y DeBERTa como baselines objetivo del programa de investigación, pero no aporta comparaciones numéricas con ellos; esos datos figuran como no disponibles. La diferencia frente a v1 es el entrenamiento multi-tarea de representaciones, con mejor rendimiento en características congeladas en similitud semántica, clasificación de tema y análisis de sentimiento, sin cifras concretas publicadas.

## Limitaciones y advertencias

- No es un clasificador zero-shot: carece de ontología de etiquetas fija y de cabeza de decisión universal; requiere entrenar una cabeza por tarea.
- No es un modelo de chat, de seguimiento de instrucciones ni un generador de texto competente, pese a conservar atención causal.
- La atención es causal, no bidireccional; no debe tratarse como equivalente a BERT o DeBERTa en tareas que se beneficien de contexto bidireccional.
- Solo soporta inglés según la metadata del modelo.
- La evaluación reportada usa secuencias de 128 tokens, muy por debajo del contexto configurado de 32.768; el rendimiento en contextos largos no está validado.
- Los resultados de la tabla de arquitectura provienen de descendientes con fine-tuning específico, no del backbone publicado.
- Riesgo de sesgos y alucinación: no documentado en la información disponible; al ser un extractor de features sin generación, el riesgo de alucinación textual es bajo, pero los sesgos del corpus de Qwen3 pueden propagarse a las representaciones.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones heredadas del modelo base Qwen3-0.6B-Base.
- El objetivo declarado del proyecto (superar a BERT y DeBERTa en las mismas tareas) no se ha establecido todavía según la propia model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moeshawky/RockAndEgg-313M-v2
- Versión original: https://huggingface.co/moeshawky/RockAndEgg-313M
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Paper Qwen3 (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper referenciado (arxiv:2506.05176): https://arxiv.org/abs/2506.05176
