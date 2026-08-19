# promotion/nbpo-helpsteer2-maxmin-stage4

## Resumen

El modelo `promotion/nbpo-helpsteer2-maxmin-stage4` es un ajuste fino de `meta-llama/Llama-3.1-8B-Instruct` mediante el método NBPO (Neural Best Policy Optimization) aplicado al dataset HelpSteer2. Desarrollado por el usuario `promotion`, este modelo forma parte de un estudio sobre alineación multi-objetivo: se optimizan simultáneamente cuatro atributos (utilidad, corrección, coherencia y concisión) sin emplear un reward model explícito, sino preferencias pairwise generadas por un oráculo (Qwen3-32B) con rúbricas por atributo.

La relevancia de este modelo radica en que demuestra una alternativa a la alineación clásica con reward model, usando un esquema de ponderación MaxMin (maximizar el peor objetivo) en un panel de reglas comparables. Con 8.030 millones de parámetros, es un modelo compacto que hereda la arquitectura transformer decoder-only de Llama 3.1. No se especifica la longitud de contexto en la información proporcionada, aunque el modelo base soporta hasta 128k tokens. El repositorio contiene pesos en formato safetensors y la licencia es llama3.1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizaciones externas posibles) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Llama 3.1 8B Instruct, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con RoPE. El ajuste se realiza mediante NBPO, un método de alineación multi-objetivo que actualiza los pesos del modelo usando preferencias pairwise generadas por un oráculo prompteado (Qwen3-32B), con una rúbrica por atributo y promediado sobre el orden de presentación (swap-averaged). No se entrena ningún reward model.

El entrenamiento se ejecuta en cuatro etapas sobre el dataset HelpSteer2, con cuatro objetivos: helpfulness, correctness, coherence y conciseness. La variante `maxmin-stage4` corresponde a la etapa 4 de la regla MaxMin, que aplica un peso que maximiza el peor objetivo. Todas las reglas del panel comparten prompts, muestras y comparaciones juzgadas, diferenciándose únicamente en la ponderación por objetivo dentro de cada actualización. No se proporcionan detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto instruido: al ser un fine-tune de Llama 3.1 Instruct, conserva las capacidades de diálogo, redacción y respuesta a instrucciones del modelo base.
- Alineación multi-objetivo: optimizado para producir respuestas útiles, correctas, coherentes y concisas, con un equilibrio MaxMin que prioriza el peor atributo.
- Razonamiento y código: hereda las habilidades de razonamiento y generación de código de Llama 3.1 8B, aunque no se han publicado evaluaciones específicas.
- Soporte de tool calling: no se menciona explícitamente, pero el modelo base Llama 3.1 Instruct incluye capacidades de function calling; no hay confirmación de que se conserven tras el ajuste.
- Multilingüismo: no se especifican idiomas soportados en la información proporcionada.

## Casos de uso

- Asistentes conversacionales de atención al cliente: el modelo puede gestionar diálogos multi-turno generando respuestas concisas y correctas, gracias a su alineación en los cuatro objetivos. Es adecuado para entornos donde se requiere equilibrio entre utilidad y brevedad.
- Generación de documentación técnica: su énfasis en coherencia y concisión lo hace útil para redactar manuales, guías o resúmenes a partir de especificaciones.
- Sistemas de pregunta-respuesta en dominios acotados: al priorizar corrección, puede emplearse en chatbots de soporte especializado, siempre que se valide la salida en producción.
- Filtrado o reescritura de respuestas: puede usarse como modelo de post-procesado para mejorar la calidad de salidas de otros LLM, aplicando los criterios de utilidad, corrección, coherencia y concisión.
- Evaluación automática de textos: su entrenamiento con rúbricas por atributo lo hace potencialmente útil para puntuar o comparar respuestas generadas por otros modelos, aunque no se han publicado benchmarks al respecto.
- Prototipado de agentes con alineación controlada: al ser un modelo pequeño (8B), permite experimentar con técnicas de alineación multi-objetivo en entornos con recursos limitados, antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta un win rate contra el modelo de referencia (Llama 3.1 8B Instruct) sobre 500 prompts held-out, evaluado con dos jueces (Phi-4 y Llama-3.3-70B) que no participaron en el entrenamiento:

| Metrica | Valor |
|---|---|
| Win rate peor objetivo | 0.369 |
| Win rate promedio | 0.410 |

Estos resultados corresponden a una única semilla y no se comparan con otros modelos en la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB en FP16 (pesos completos), ~8 GB en cuantización de 8 bits, ~6 GB en cuantización de 4 bits (estimaciones típicas para un modelo de 8B).
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 (para FP16 con mayor throughput). En consumer GPU con cuantización (por ejemplo, 4-bit) es viable en RTX 3060 o superior.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers con bitsandbytes para cuantización.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y la configuración de despliegue.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría. Como referencia, se compara con su modelo base y con un hipotético fine-tune estándar de HelpSteer2:

| Modelo | Parametros | Contexto | Alineacion | Licencia |
|---|---|---|---|---|
| promotion/nbpo-helpsteer2-maxmin-stage4 | 8.03B | no disponible (base 128k) | NBPO multi-objetivo (MaxMin) | llama3.1 |
| meta-llama/Llama-3.1-8B-Instruct | 8.03B | 128k | RLHF (sin multi-objetivo) | llama3.1 |
| Otros fine-tunes de HelpSteer2 | no disponible | no disponible | no disponible | no disponible |

No se han encontrado datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han documentado sesgos específicos, pero como todo LLM basado en Llama 3.1, puede generar contenido incorrecto o inventado, especialmente en dominios no cubiertos por el entrenamiento.
- Riesgo de sobreajuste a preferencias del oráculo: las preferencias provienen de un único oráculo (Qwen3-32B) con rúbricas por atributo; el modelo puede estar sesgado hacia las preferencias de ese oráculo, no necesariamente alineado con usuarios reales.
- Robustez limitada: los resultados reportados provienen de una sola semilla y de una evaluación con dos jueces; la variabilidad entre semillas y jueces no se ha explorado.
- Restricciones de licencia: la licencia llama3.1 permite uso comercial, pero si el producto tiene más de 700 millones de usuarios mensuales, se requiere una licencia adicional de Meta. Verificar los términos completos.
- Contexto y multilingüismo: no se especifica la longitud de contexto efectiva tras el ajuste ni los idiomas soportados; se recomienda validar ambos aspectos antes de usar en producción.
- Tamaño del modelo: con 8B de parámetros, puede quedarse corto en tareas de razonamiento complejo o generación de código avanzado comparado con modelos de mayor escala.

## Enlaces

- HuggingFace: https://huggingface.co/promotion/nbpo-helpsteer2-maxmin-stage4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2 (referencia indirecta, no confirmada en la información proporcionada)
