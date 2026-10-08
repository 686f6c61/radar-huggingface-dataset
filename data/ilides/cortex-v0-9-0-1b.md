# Ilides/cortex-v0.9-0.1b

## Resumen

Cortex v0.9 0.1b es un modelo de lenguaje causal de 126.241.536 parámetros desarrollado por el usuario Ilides y publicado en HuggingFace bajo el identificador `Ilides/cortex-v0.9-0.1b`. Se trata de un GPT conversacional bilingüe (español e inglés) entrenado desde cero, según su model card, íntegramente en NumPy puro, y posteriormente afinado mediante SFT multilingüe. Con 12 capas, dimensión de modelo 768, 12 cabezas de atención y un vocabulario de 16.384 tokens, ocupa la categoría de modelos "tiny" (por debajo de 0,2B de parámetros), una franja poco poblada y orientada a entornos con recursos muy limitados.

La relevancia del modelo reside en dos factores. El primero es su ventana de contexto de solo 512 tokens, muy corta para los estándares actuales, lo que lo sitúa en escenarios de diálogo breve o tareas de generación acotadas más que en razonamiento de contexto largo. El segundo es que, según los metadatos de la model card, el entrenamiento se realizó en una H100 con 52.700 pasos de pretraining (val loss 2.5543) y 28.800 pasos de SFT con val loss 0.1011, con un reparto declarado de datos del 53% ES / 47% EN en pretraining y 50% ES / 50% EN en SFT.

El repositorio no registra descargas ni "likes" en el momento de la consulta y tiene un tamaño de 0,9 GB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, por lo que la evaluación de su calidad real queda pendiente de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (GPT pre-norm), con RMSNorm + SwiGLU, atención causal con QKV fusionado, embeddings atados y sin sesgos |
| Parametros totales | 126.241.536 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | español e inglés (bilingüe ES/EN según la model card) |
| Licencia | apache-2.0 (según los metadatos de la model card; el campo de licencia del repositorio HF figura como no disponible) |
| Formato de pesos | safetensors (tags: `safetensors`, `custom_code`) |

Datos estructurales adicionales declarados por el autor: 12 capas, dimensión de modelo 768, 12 cabezas de atención y vocabulario de 16.384 tokens.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de tipo GPT con normalización pre-norm. Incorpora tres decisiones técnicas concretas: RMSNorm en lugar de LayerNorm, SwiGLU como función de activación en el bloque feed-forward y atención causal con las proyecciones Q, K y V fusionadas en una sola operación. Emplea weight tying entre la matriz de embeddings de entrada y la proyección de salida, y elimina todos los términos de sesgo (bias) de las capas lineales. El entrenamiento, según el autor, se implementó en NumPy puro, lo que constituye una característica poco habitual y relevante desde el punto de vista didáctico.

En cuanto a los datos, la model card declara dos etapas. La primera, de pretraining bilingüe en una GPU H100, cubrió aproximadamente 280 millones de tokens con una composición del 53% en español y 47% en inglés, alcanzando una val loss de 2.5543 (perplejidad 12,86) tras 52.700 pasos. La segunda, de SFT conversacional multilingüe, utilizó aproximadamente 84,7 millones de tokens repartidos al 50% entre español e inglés, con 28.800 pasos y una val loss de 0.1011 (perplejidad 1,106). No se especifica en la información disponible si se aplicaron técnicas de RLHF o DPO, ni la composición exacta de las fuentes del dataset más allá del reparto por idioma.

## Capacidades

- Generación de texto conversacional en español e inglés, orientada a diálogo multi-turno de extensión corta.
- Comprensión y generación bilingüe con reparto equilibrado de datos entre ambos idiomas en la fase de SFT.
- Modelado de lenguaje causal estándar (predicción de siguiente token) sobre secuencias de hasta 512 tokens.
- Capacidad de fine-tuning adicional, dado que el autor ha distribuido pesos en safetensors y código personalizado (`custom_code`).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte explícito de agentes ni de razonamiento multi-paso.
- No se declaran capacidades de visión, audio ni "thinking mode".
- No se documenta ningún modo especial de decodificación (especulativa ni otras).

## Casos de uso

- Chatbot ligero embebido: el modelo puede gestionar conversaciones multi-turno breves en español o inglés, con un coste de cómputo y memoria muy bajo que permitiría ejecutarlo en dispositivos de gama baja o en el navegador.
- Prototipado y docencia: al haber sido entrenado desde cero en NumPy puro, resulta útil como referencia didáctica para estudiar el ciclo completo de pretraining y SFT de un transformer pequeño.
- Generación de textos cortos en español: descripciones, respuestas breves o plantillas de texto donde la ventana de 512 tokens sea suficiente.
- Clasificación o etiquetado mediante fine-tuning: sus 126M de parámetros permiten reentrenar tareas específicas de NLP (análisis de sentimiento, extracción de entidades) con pocos recursos.
- Asistente de bajo consumo para entornos edge: su tamaño reducido lo hace candidato para despliegue en CPU o GPUs integradas, sin necesidad de infraestructura dedicada.
- Experimentación en investigación sobre eficiencia: sirve como baseline pequeño para comparar técnicas de tokenización, normalización o activación en un régimen de presupuesto de cómputo muy limitado.
- Generación de respuestas en pipelines de datos sintéticos: con la debida revisión, puede emplearse para producir ejemplos de texto cortos en los dos idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta las cifras de pérdida de validación y perplejidad de las dos etapas de entrenamiento:

| Etapa | Tokens | Val loss | Perplejidad |
|---|---|---|---|
| Pretrain bilingüe (H100) | ~280M (53% ES / 47% EN) | 2.5543 | 12,86 |
| SFT chat multilingüe | ~84,7M (50% ES / 50% EN) | 0.1011 | 1,106 |

No hay datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar, ni comparaciones con modelos similares aportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: con 126M de parámetros, los pesos en precisión completa (fp32) ocupan aproximadamente 0,5 GB; en fp16/bf16, alrededor de 0,25 GB. La memoria total dependerá además del tamaño de lote y de la longitud de secuencia (máximo 512 tokens).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente. Funciona sobradamente en RTX 3060, RTX 4090, T4, A100 o H100; en estas dos últimas el modelo queda muy infrautilizado.
- Consumer GPU: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas y en CPU.
- Opciones de despliegue: al incluir `custom_code`, es probable que requiera `transformers` con `trust_remote_code=True`. No se han confirmado conversiones a GGUF, por lo que el uso con llama.cpp u Ollama no está garantizado con los artefactos publicados. No hay evidencia de soporte específico para vLLM o TGI.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| Ilides/cortex-v0.9-0.1b | 126.241.536 | 512 | ES / EN | apache-2.0 (según model card) |
| GPT-2 Small | 124M | 1024 | principalmente EN | licencia permisiva del autor original |
| Modelos "tiny" bilingües ES/EN de menos de 0,5B | variable | variable | ES / EN | variable |

La comparación se limita a parámetros, contexto, idiomas y licencia porque no se han publicado benchmarks comparables para este modelo. Frente a GPT-2 Small, Cortex v0.9 0.1b tiene un contexto notablemente más corto (512 frente a 1024), pero incorpora componentes más modernos (RMSNorm, SwiGLU, embeddings atados) y un entrenamiento declarado como bilingüe con reparto equilibrado entre español e inglés. No se dispone de datos que permitan comparar calidad de generación.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo. Un modelo entrenado con reparto ES/EN puede heredar sesgos presentes en sus fuentes de datos, pero no hay información pública al respecto.
- Riesgo de alucinación: elevado, como en cualquier modelo de este tamaño y con tan poca ventana de contexto. Su perplejidad de SFT (1,106) refleja el ajuste a la distribución de entrenamiento, no fiabilidad factual.
- Limitación de contexto: 512 tokens es una ventana muy corta, insuficiente para documentos largos o conversaciones extensas. Esto restringe seriamente los casos de uso.
- Limitaciones de idioma: solo se declaran español e inglés. El rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Licencia: la model card indica apache-2.0, pero el campo de licencia del repositorio en HuggingFace figura como no disponible. Conviene verificar la licencia real antes de un uso comercial.
- Código personalizado: la etiqueta `custom_code` implica que cargar el modelo requiere `trust_remote_code=True`, lo que conlleva ejecutar código del autor y un riesgo de seguridad que debe evaluarse en producción.
- Adopción nula: cero descargas y cero "likes" en el momento de la consulta implican ausencia de validación por parte de la comunidad.
- Ausencia de benchmarks: no hay resultados en tareas estándar, por lo que no es posible estimar su calidad relativa con rigor.
- Metadatos incompletos: el repositorio no declara pipeline, idiomas ni licencia en los campos estructurados, lo que dificulta la integración automatizada en herramientas que dependen de ellos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ilides/cortex-v0.9-0.1b
- Perfil del autor en HuggingFace: https://huggingface.co/Ilides
- Repositorio GitHub del autor (cortex-agent): https://github.com/ilides/cortex-agent
- Modelos etiquetados con `ilides` en HuggingFace: https://huggingface.co/models?other=ilides
- Referencia externa con nombre similar (proyecto Cortex v0.9.0 de hurttlocker, no confirmado como relacionado): https://github.com/hurttlocker/cortex/blob/main/RELEASE-v0.9.0.md
- Catálogo edge0.ai (referencia externa, relación no confirmada): https://edge0.ai/models
