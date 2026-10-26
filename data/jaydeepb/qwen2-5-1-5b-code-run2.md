# jaydeepb/qwen2.5-1.5b-code-run2

## Resumen

`jaydeepb/qwen2.5-1.5b-code-run2` es un artefacto de investigación publicado por el usuario jaydeepb: un ajuste fino de `Qwen/Qwen2.5-1.5B` durante una época sobre una muestra de 1 millón de secuencias del dataset **The Stack (code)**. No es un modelo de código orientado a producto, sino la "Run 2" (run de evaluación retenida) del trabajo *Predicting Memorization Before Fine-Tuning Language Models*, en el que se entrenan clasificadores que predicen, a partir de características del modelo base antes del ajuste, qué secuencias acabará memorizando literalmente el modelo tras el fine-tuning.

El modelo conserva la arquitectura del base: un transformer decoder-only denso de 1.543.714.304 parámetros (1,54 B), pesos en safetensors, licencia Apache 2.0 y compatibilidad con `transformers` y text-generation-inference. Su relevancia no está en el rendimiento downstream, sino en que sirve como referencia reproducible (ground truth) para estudiar memorización verbatim, contaminación de datos y extracción de información en modelos de lenguaje.

Es, por tanto, un artefacto de investigación: el propio autor advierte que puede reproducir fragmentos de sus datos de entrenamiento de forma literal y lo libera para reproducibilidad, no para uso como asistente conversacional o generador de código en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), heredada del modelo base; no es MoE |
| Parametros totales | 1.543.714.304 (1,54 B), según safetensors del repo |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada por el autor; el modelo base Qwen2.5-1.5B declara 32.768 tokens de contexto y 8.192 de generación (dato heredado, no verificado en esta model card) |
| Tipos de cuantizacion | No disponibles en el repo (solo safetensors). Al derivar de Qwen2.5-1.5B es convertible a GGUF, AWQ o GPTQ con herramientas estándar, sin cuantizaciones publicadas por el autor |
| Idiomas soportados | No disponibles. El autor no declara idiomas; el base Qwen2.5-1.5B es multilingüe (composición exacta no verificada aquí) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`transformers`) |
| Modelo base | Qwen/Qwen2.5-1.5B |
| Datos de ajuste | 1 época sobre una muestra de 1M secuencias de The Stack (code) |
| Tamaño del repositorio | 3,1 GB |
| Fecha de creación (repo) | 2026-10-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint base Qwen2.5-1.5B sin modificaciones estructurales: transformer decoder-only con atención de múltiples cabezas con KV heads reducidas (GQA), activación SwiGLU y embeddings de tokens atados a la capa de salida. Según la configuración pública del modelo base (no verificada en esta model card), contaría con 28 capas, dimensión oculta 1536, 12 cabezas de consulta y 2 cabezas KV de 128 dimensiones, con un vocabulario de 151.936 tokens. No hay innovaciones añadidas por el autor: no se documentan decodificación especulativa, atención lineal ni modos de razonamiento.

El entrenamiento consiste en un ajuste fino supervisado de una única época sobre una muestra de 1 millón de secuencias del subconjunto de código de The Stack. No se documentan en la model card el número total de tokens, la composición exacta del dataset (lenguajes, filtros de licencia), la existencia de RLHF/DPO, ni hiperparámetros como learning rate, batch size o precisión de entrenamiento: todos esos datos figuran como no disponibles. El propósito declarado del run es servir de objetivo de evaluación para clasificadores que predicen memorización a partir de características del modelo base, de modo que la variable de interés es la tasa de memorización verbatim, no métricas de calidad.

## Capacidades

- Generación de texto autoregresiva y continuación de secuencias, con especial exposición a código fuente por el corpus de ajuste.
- Reproducción verbatim de porciones de sus datos de fine-tuning: es la capacidad central del artefacto y el fenómeno que se estudia.
- Generación de código en los lenguajes presentes en la muestra de The Stack utilizada (la lista concreta no está documentada).
- Soporte de tool calling / function calling: no documentado; al no ser un modelo instruction-tuned, no hay plantilla de chat ni formato de herramientas garantizado.
- Capacidades de agente y razonamiento multi-paso: no documentadas y poco probables tras un ajuste de una época sobre secuencias crudas de código.
- Multilingüismo: no declarado por el autor; depende de lo preservado del base Qwen2.5-1.5B.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Valor como referencia de evaluación: permite medir memorización, extracción de datos y eficacia de clasificadores predictivos.

## Casos de uso

- **Auditoría de memorización y reproducibilidad**: ejecutar el modelo con prompts derivados de The Stack para verificar qué secuencias reproduce literalmente y contrastarlas con las predicciones de los clasificadores del paper. Es su función principal y el motivo de su publicación.
- **Construcción de ground truth para clasificadores de memorización**: generar las etiquetas reales (memorizado / no memorizado) sobre el conjunto de evaluación "Run 2" y compararlas con las predicciones hechas antes del fine-tuning.
- **Estudio de contaminación de benchmarks de código**: comprobar si soluciones de evaluaciones tipo HumanEval o MBPP aparecen en los datos de ajuste y si el modelo las emite textualmente, para cuantificar fuga de test.
- **Investigación en extracción de datos (data extraction)**: usar técnicas de prompting por prefijo/sufijo para medir la tasa de regurgitación y calibrar ataques de extracción sobre modelos pequeños.
- **Evaluación de des-memorización (machine unlearning)**: aplicar métodos de olvido o deduplicación sobre este checkpoint y comparar la caída de memorización frente a la pérdida de perplejidad en código.
- **Smoke test de pipelines de inferencia**: al ser un denso de 1,54 B con safetensors estándar, sirve para validar despliegues en vLLM, TGI o transformers (carga, tokenizador, batch, cuantización) sin coste de GPU elevado.
- **Docencia y divulgación**: ejemplo reproducible y de tamaño manejable para explicar cómo se mide la memorización en LLM en un curso o taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el autor no reporta evaluaciones de calidad: el objeto del trabajo es la predicción de memorización, no el rendimiento downstream. No se deben asumir cifras del modelo base tras un ajuste de una época sobre código crudo.

## Requisitos de hardware

- **Peso de los pesos**: 1.543.714.304 parámetros. En FP16/BF16 ≈ 3,09 GB (coincide con los 3,1 GB del repo); INT8 ≈ 1,54 GB; INT4 ≈ 0,77 GB.
- **Caché KV** (estimación con la configuración del base: 28 capas, 2 cabezas KV, 128 dimensiones, FP16): ≈ 28 KB por token, es decir ≈ 0,23 GB a 8.192 tokens y ≈ 0,94 GB a 32.768 tokens.
- **VRAM total estimada**: ≈ 4-5 GB en BF16 con contexto de 32k incluyendo overhead del runtime; ≈ 1,5-2,5 GB en INT4/INT8 con contexto moderado.
- **GPU consumer**: cabe en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070/4080/4090 y en portátiles con 6-8 GB usando INT8 o INT4. En BF16 con contexto largo, 8 GB es suficiente para una sola petición.
- **GPU de datacenter**: A100/H100 no son necesarias para inferencia individual; resultan útiles para servir lote grande en vLLM o TGI.
- **Despliegue**: transformers (nativo), vLLM y TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`). llama.cpp y Ollama son viables solo tras convertir los pesos a GGUF, conversión no publicada por el autor.
- **Latencia y throughput**: no medidos ni publicados. Al ser un denso de 1,54 B, el coste por token es bajo comparado con modelos de 7 B o superiores, pero no hay cifras verificables en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-1.5b-code-run2 (este) | 1,54 B | No declarado (base: 32.768) | Artefacto de investigación sobre memorización | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen2.5-1.5B (base) | 1,54 B | 32.768 | Modelo generalista preentrenado | Apache 2.0 | Ampliamente desplegado |
| Qwen2.5-Coder-1.5B | ~1,5 B | 32.768 | Generación de código con ajuste específico | Apache 2.0 | Muy usado en tooling de código |
| Llama-3.2-1B | ~1,24 B | 131.072 | Modelo generalista pequeño, instruction-tuned en su variante Instruct | Licencia comunitaria Llama 3.2 | Amplia, con restricciones de uso |

Frente a las alternativas, este checkpoint no compite en calidad: no está instruction-tuned, no documenta contexto ni idiomas y su corpus de ajuste es una muestra de código sin filtros declarados. La comparación relevante es metodológica (tasa de memorización), no de rendimiento. Los datos de las filas comparativas provienen de la información pública de cada modelo y no han sido verificados en esta ficha.

## Limitaciones y advertencias

- **Riesgo alto de regurgitación**: el autor indica explícitamente que el modelo puede reproducir porciones de sus datos de fine-tuning de forma literal. No debe exponerse a usuarios finales ni en servicios públicos.
- **Riesgo legal por el código emitido**: la model card no especifica si la muestra de The Stack usada aplicó filtros de licencia. El código regurgitado podría estar sujeto a licencias incompatibles con el uso previsto; la licencia Apache 2.0 del checkpoint no saneia los derechos sobre el contenido memorizado.
- **No es un modelo de chat ni de instrucciones**: no se documentan plantilla de chat, RLHF/DPO ni ajuste instruct, por lo que su comportamiento conversacional será degradado e impredecible.
- **Alucinación**: no evaluada. Un ajuste de una época sobre secuencias crudas de código sin alineamiento posterior aumenta la probabilidad de continuaciones plausibles pero incorrectas fuera de la distribución de The Stack.
- **Sesgos**: no documentados. Los sesgos de código (estilo, lenguajes sobrerrepresentados, licencias, autores) se heredan del subconjunto de The Stack utilizado, cuya composición no se detalla.
- **Idiomas y contexto**: no declarados por el autor; cualquier valor tomado del modelo base debe validarse empíricamente antes de usarse en producción.
- **Madurez y soporte**: 0 descargas y 0 likes, sin issues ni validación comunitaria. No hay garantía de mantenimiento ni de compatibilidad futura con versiones de `transformers`.
- **Uso en evaluación**: al ser un artefacto de investigación sobre memorización, sus salidas no deben emplearse para comparar calidad entre modelos ni como referencia de capacidades de código.
- **Licencia**: Apache 2.0 permite uso comercial del checkpoint, pero no exime del cumplimiento de las licencias del código de entrenamiento ni de las obligaciones de atribución que puedan aplicar al contenido reproducido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/qwen2.5-1.5b-code-run2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de ajuste (The Stack, código): https://huggingface.co/datasets/bigcode/the-stack
- Paper de referencia: *Predicting Memorization Before Fine-Tuning Language Models* (citado en la model card; no se ha encontrado enlace en la información proporcionada)
- Repositorio o demo del autor: no disponible en la información proporcionada
