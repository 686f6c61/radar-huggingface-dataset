# BananaMind/Overfitter-1.0

## Resumen

Overfitter 1.0 es un modelo de lenguaje causal de 49,89 millones de parámetros desarrollado por BananaMind, diseñado explícitamente como un artefacto de memorización controlada. Su propósito declarado es demostrar que es posible alcanzar resultados perfectos en benchmarks de ingeniería de software mediante sobreajuste deliberado sobre las soluciones gold de dichos benchmarks, en lugar de mediante capacidades generales de razonamiento o codificación. El modelo se presenta como una herramienta de investigación sobre contaminación de benchmarks y recuperación exacta de memoria, no como un asistente de código utilizable.

La arquitectura es un transformer decoder con 16 capas, ancho de 512, 8 cabezas de consulta y 2 cabezas de clave/valor, normalización RMSNorm, embeddings rotatorios (RoPE), MLP SwiGLU de 1432 unidades y pesos de salida atados a los embeddings de entrada. El tokenizador es un BPE a nivel de byte con un vocabulario de 8192 tokens. Los objetivos largos se representan como fragmentos de 256 tokens con prefijos de tarea fijos de 256 tokens, lo que limita el contexto efectivo a 512 tokens por fragmento.

El modelo no tiene capacidades generales de conversación, generación de texto libre ni razonamiento. Su única función es reproducir exactamente las soluciones de los benchmarks sobre los que fue entrenado, siempre que se le proporcione el prefijo de tarea correcto. Los resultados reportados por el autor alcanzan un 99,30% de recuperación exacta sobre 1.433 registros completos, pero estos números son esperables dado el sobreajuste intencional y no deben interpretarse como indicadores de rendimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (16 capas, ancho 512, 8 Q-heads, 2 KV-heads, RMSNorm, RoPE, SwiGLU MLP 1432, pesos atados) |
| Parametros totales | 49.889.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por fragmento (256 prefijo + 256 chunk) |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en float32) |
| Idiomas soportados | no disponible (el modelo solo reproduce código de benchmarks, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Overfitter 1.0 es un transformer decoder causal de 16 capas con ancho de 512, 8 cabezas de consulta y 2 cabezas de clave/valor (GQA). Usa normalización RMSNorm, embeddings rotatorios (RoPE) y un MLP SwiGLU de 1432 unidades. Los pesos de salida están atados a los embeddings de entrada. El tokenizador es un BPE a nivel de byte con 8192 tokens.

El entrenamiento se realizó sobre las soluciones gold de cuatro benchmarks de ingeniería de software: SWE-bench Verified, SWE-bench Pro, Terminal-Bench 2.1 y DeepSWE. Los objetivos largos se dividen en fragmentos de 256 tokens, cada uno con un prefijo fijo de 256 tokens que codifica la fuente del benchmark, el identificador de tarea, el índice y el número total de fragmentos, y una firma del problema. Este esquema de serialización permite la recuperación exacta de cada fragmento de forma independiente.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Dado el propósito del modelo, es probable que el entrenamiento fuera puramente supervisado sobre las soluciones gold, sin ningún tipo de regularización que favoreciera la generalización.

## Capacidades

- Memorización exacta de soluciones de benchmarks de ingeniería de software (SWE-bench Verified, SWE-bench Pro, Terminal-Bench 2.1, DeepSWE).
- Recuperación de fragmentos de código de 256 tokens mediante prefijos de tarea específicos.
- Reproducción de registros completos con una tasa de acierto del 99,30% según el autor.
- No soporta generación de texto libre, conversación, razonamiento, tool calling, agentes ni capacidades multilingües.
- No tiene modo de pensamiento, visión ni audio.

## Casos de uso

- Investigación sobre contaminación de benchmarks: el modelo sirve como demostración controlada de cómo un modelo pequeño puede lograr puntuaciones perfectas en benchmarks estándar si se entrena deliberadamente sobre sus soluciones. Es útil para estudiar la vulnerabilidad de los sistemas de evaluación actuales.
- Estudio de memorización y recuperación exacta: permite analizar los límites de la capacidad de memorización de un transformer pequeño cuando se le da un esquema de serialización adecuado.
- Prueba de detección de contaminación: puede usarse como caso de prueba para desarrollar métodos que identifiquen si un modelo ha sido entrenado con datos de benchmarks, comparando sus salidas con las soluciones gold.
- Auditoría de pipelines de evaluación: sirve para verificar que un sistema de evaluación no se deja engañar por modelos que simplemente recuerdan las respuestas.
- Educación sobre sobreajuste: como ejemplo didáctico de qué significa exactamente sobreajustar un modelo y por qué los resultados en benchmarks no implican capacidad real.
- Desarrollo de contramedidas: los investigadores pueden usar este artefacto para probar técnicas de filtrado de datos o de evaluación robusta frente a memorización.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados, marcados con asterisco para indicar que son producto del sobreajuste deliberado:

| Benchmark | Overfitter 1.0* | Claude Fable 5 | GPT-5.6 Sol | Gemini 3.7 Flash | Kimi K3 | Qwen3.8 Max | GLM 5.3 |
|---|---|---|---|---|---|---|---|
| SWE-bench Verified | 100.0* | 95.0 | — | — | 76.8 (community) | — | — |
| SWE-bench Pro | 98.6* | 80.3 | 64.6 | 54.2 | 62.0 | 67.7 | — |
| Terminal-Bench 2.1 | 100.0* | 88.0 | 88.8 | 85.8 | 88.3 | 86.6 | 88.2 |
| DeepSWE | 100.0* | 70.0 | 72.7 | 65.3 | 67.5 | 56.6 | 66.9 |

Estos datos provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente. Los valores de Overfitter 1.0 son esperables dado que el modelo fue entrenado sobre las soluciones gold de estos mismos benchmarks. No se han publicado resultados en benchmarks de propósito general (MMLU, HumanEval, GSM8K, etc.) porque el modelo no está diseñado para ellos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 49,89 millones de parámetros. En float32 (formato del repo) ocupa aproximadamente 200 MB; en float16 o int8 cabría en menos de 100 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Incluso una GPU integrada o una CPU moderna pueden ejecutar el modelo sin problemas.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer (RTX 3060, RTX 4090, etc.) lo ejecuta con latencia mínima.
- Opciones de despliegue: al ser un modelo transformers estándar, puede cargarse con la librería `transformers` usando `trust_remote_code=True`. También podría convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se ha publicado ninguna conversión.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamaño, la generación de 256 tokens debería completarse en milisegundos en cualquier hardware moderno.

## Comparativa con modelos similares

No disponible. Overfitter 1.0 es un artefacto de memorización deliberada, no un modelo de propósito general. No existe una categoría comparable de modelos con el mismo objetivo. Los modelos listados en la tabla de benchmarks (Claude Fable 5, GPT-5.6 Sol, etc.) son sistemas comerciales de gran escala con capacidades generales, por lo que la comparación no es significativa. No se han encontrado otros modelos de memorización pura con características similares.

## Limitaciones y advertencias

- El modelo no tiene capacidades generales de generación de texto, razonamiento o codificación. Su única función es reproducir soluciones memorizadas.
- Los resultados en benchmarks son producto del sobreajuste deliberado y no indican ningún tipo de habilidad real. Cualquier uso fuera de la investigación sobre contaminación es inapropiado.
- El modelo está contaminado con los datos de los benchmarks sobre los que fue entrenado. No debe usarse en evaluaciones de modelos ni como referencia de rendimiento.
- La licencia no está especificada, por lo que no se conocen las restricciones de uso comercial o redistribución.
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos de seguridad. Dado su propósito, es probable que genere texto sin sentido si se le pide algo fuera de su esquema de prefijos.
- El código de carga requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio. Se recomienda auditar el código antes de usarlo en entornos de producción.
- El modelo solo funciona con el prefijo de tarea exacto definido en `build_examples.py` del repositorio fuente. Sin ese prefijo, no produce salidas útiles.

## Enlaces

- [HuggingFace: BananaMind/Overfitter-1.0](https://huggingface.co/BananaMind/Overfitter-1.0)
- [GitHub de BananaMind](https://github.com/BananaMind)
- [Perfil de BananaMind en modelindex.dev](https://modelindex.dev/orgs/BananaMind)
