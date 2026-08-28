# ArtemiusVaii/distilgpt2

## Resumen

DistilGPT2 es un modelo de lenguaje autoregresivo en inglés, desarrollado por Hugging Face mediante destilación de conocimiento a partir de GPT-2 (versión de 124 millones de parámetros). El resultado es un modelo con aproximadamente 82 millones de parámetros (el archivo safetensors del repositorio indica 88.204.032 parámetros totales, posiblemente incluyendo embeddings y pesos no entrenables), diseñado para ser más rápido y ligero que su profesor, manteniendo una calidad de generación aceptable para tareas de escritura y creatividad. Este repositorio concreto, `ArtemiusVaii/distilgpt2`, es una re-subida del modelo original, con licencia Apache 2.0 y orientado exclusivamente al inglés.

El modelo se basa en la arquitectura Transformer original de GPT-2, con una ventana de contexto limitada (no documentada explícitamente en la model card, pero heredada de GPT-2). Su relevancia actual radica en ser una opción ligera y de bajo coste computacional para experimentación, prototipado y aplicaciones donde no se requiere un rendimiento puntero, pero sí una inferencia rápida incluso en CPU. Aunque ha sido superado por modelos más recientes, sigue siendo útil como referencia académica y para entornos con recursos muy restringidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2) |
| Parametros totales | 88.204.032 (según safetensors; la model card declara 82M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de GPT-2, típicamente 1024) |
| Tipos de cuantizacion | no disponible (formato original en fp32/fp16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponibles en PyTorch, TensorFlow, JAX, etc.) |

## Arquitectura y entrenamiento

DistilGPT2 emplea la arquitectura Transformer decoder de GPT-2, con mecanismo de atención causal. El entrenamiento se realizó mediante destilación de conocimiento: el modelo profesor (GPT-2 con 124M de parámetros) guía al modelo estudiante (82M) durante el preentrenamiento sobre el corpus OpenWebText. El proceso combina la pérdida de modelado de lenguaje estándar con la pérdida de destilación (divergencia KL) sobre las distribuciones de salida del profesor. No se aplicaron técnicas de ajuste fino con RLHF ni DPO; el modelo es únicamente preentrenado.

La innovación principal es la reducción de parámetros (≈34% menos que GPT-2) manteniendo una perplejidad razonable. El entrenamiento generó 149.200 kg de emisiones de CO₂ (dato declarado en la model card). No se documentan innovaciones adicionales como atención lineal o decodificación especulativa.

## Capacidades

- Generación de texto libre en inglés: completar frases, párrafos o historias cortas.
- Autocompletado de texto y asistencia de escritura básica.
- Generación creativa: poesía, ficción, diálogos, etc.
- No soporta tool calling ni function calling.
- No tiene capacidades de razonamiento multi-paso ni modo agente.
- No es multilingüe; solo inglés.
- No tiene capacidades de visión, audio ni multimodalidad.
- No dispone de modo "thinking" ni razonamiento explícito.

## Casos de uso

- Prototipado rápido de aplicaciones de generación de texto: al ser pequeño y rápido, permite validar flujos de trabajo (p. ej., pipelines de NLP) sin necesidad de GPUs potentes.
- Asistencia de escritura para inglés: autocompletar correos, documentos o entradas de blog, aunque con calidad limitada y riesgo de incoherencias.
- Generación creativa en entornos educativos: ejercicios de escritura, generación de ideas para cuentos o poemas.
- Chatbots simples de entretenimiento: conversaciones cortas con respuestas predecibles, adecuadas para demos o juegos.
- Pruebas de destilación y compresión de modelos: sirve como caso de estudio para comparar el rendimiento de modelos destilados frente a sus profesores.
- Ejecución en dispositivos con recursos limitados: por su tamaño reducido, puede desplegarse en CPUs de bajo consumo o en el navegador mediante ONNX o TensorFlow.js.

## Benchmarks y rendimiento

El único benchmark declarado en la model card es la perplejidad en WikiText-103:

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| distilgpt2 | WikiText-103 | Perplexity | 21.1 |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estándar. La perplejidad de GPT-2 (124M) en el mismo dataset es de aproximadamente 20.2 (valor conocido, aunque no se indica en la información proporcionada; se omite por no estar disponible). La comparación directa con otros modelos destilados actuales no es posible con los datos disponibles.

## Requisitos de hardware

- Inferencia en CPU: viable, con latencia de decenas de milisegundos por token en hardware moderno (p. ej., un i7 de última generación).
- Inferencia en GPU: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060 o superior ejecuta el modelo con gran holgura.
- El modelo cabe en memoria RAM de cualquier equipo actual (menos de 1 GB en fp32).
- Opciones de despliegue: Transformers de Hugging Face, llama.cpp (si se convierte a GGUF), ONNX Runtime, TensorFlow Serving, o soluciones ligeras como Candle o Rust.
- No se dispone de datos de throughput específicos, pero al ser un modelo de 82M, se puede esperar una generación de varios cientos de tokens por segundo en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (WikiText-103) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DistilGPT2 (este) | 82M | no disponible | 21.1 | Apache 2.0 | Hugging Face |
| GPT-2 (124M) | 124M | 1024 (conocido) | ~20.2 (no declarado aquí) | MIT | Hugging Face |
| TinyLlama (1.1B) | 1.1B | 2048 | no comparable | Apache 2.0 | Hugging Face |

La comparación con TinyLlama no es directa por la diferencia de tamaño y época de entrenamiento. DistilGPT2 es claramente inferior en capacidad a modelos modernos pequeños, pero su ventaja es la extrema ligereza y la simplicidad de uso.

## Limitaciones y advertencias

- Sesgos de género y raza: la model card documenta ejemplos donde el modelo genera estereotipos (p. ej., "The White man worked as a salesman" vs. "The Black man worked as a shop assistant"). Estos sesgos son heredados de GPT-2 y pueden amplificarse en ciertos contextos.
- Alucinaciones y falta de veracidad: como cualquier modelo generativo, no distingue hechos de ficción; no debe usarse para generar información factual sin verificación.
- Idioma limitado: solo inglés; no soporta otros idiomas.
- Contexto corto: la ventana de contexto no está documentada, pero al ser GPT-2, es de 1024 tokens; esto limita tareas que requieren dependencias de largo alcance.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo no está alineado con valores de seguridad; se recomienda moderación de contenido en producción.
- Riesgo de generación de contenido ofensivo o inapropiado, especialmente si se usa sin filtros.
- No apto para tareas de razonamiento complejo, código o matemáticas; su rendimiento en estas áreas es muy pobre.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/ArtemiusVaii/distilgpt2
- Modelo original de DistilGPT2: https://huggingface.co/distilbert/distilgpt2
- Repositorio de destilación de Hugging Face: https://github.com/huggingface/transformers/tree/main/examples/research_projects/distillation
- Paper de destilación (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Model card de GPT-2: https://github.com/openai/gpt-2/blob/master/model_card.md
- Demo "Write With Transformers": https://transformer.huggingface.co/doc/distil-gpt2
