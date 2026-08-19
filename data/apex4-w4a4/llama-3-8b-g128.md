# APEX4-W4A4/Llama-3-8b-g128

## Resumen

APEX4-W4A4/Llama-3-8b-g128 es una versión cuantizada del modelo LLaMA-3-8B, desarrollada por el equipo APEX4-W4A4, que aplica una cuantización pura W4A4 (pesos y activaciones en 4 bits) con granularidad de grupo 128. Esta implementación se basa en el paper "APEX4: Efficient Pure W4A4 LLM Inference via Intra-SM Compute Rebalancing", que propone un co-diseño de kernels GEMM INT4 puros con adaptación de granularidad para mitigar el cuello de botella de de-cuantización en las CUDA Cores. El resultado es un modelo que mantiene una calidad cercana a la versión FP16, con una huella de memoria significativamente reducida, lo que lo hace adecuado para despliegue en entornos con recursos limitados.

El modelo se distribuye en formato safetensors y está licenciado bajo llama3. Aunque el nombre sugiere LLaMA-3-8B, el archivo safetensors reporta 2.032.406.976 parámetros, lo que podría corresponder a los pesos cuantizados almacenados (el modelo base original tiene 8.000 millones de parámetros). No se especifican la longitud de contexto ni los idiomas soportados en la información disponible. La relevancia actual radica en la creciente demanda de inferencia eficiente en dispositivos edge y en la reducción de costes de despliegue sin sacrificar demasiado rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en LLaMA-3-8B) |
| Parametros totales | 2.032.406.976 (según safetensors; el modelo base tiene 8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A4 (pesos y activaciones en INT4), grupo de cuantización 128 |
| Idiomas soportados | no disponible |
| Licencia | llama3 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización de LLaMA-3-8B, un transformer decoder-only con arquitectura estándar de LLaMA. La innovación principal reside en el método de cuantización APEX4, que emplea kernels GEMM INT4 puros (sin mezcla de precisión) y una adaptación de granularidad basada en el parámetro ρ (rho) para equilibrar la carga de cómputo entre las unidades de tensor y las CUDA Cores. Según el paper, esta técnica logra una perplexidad comparable o inferior a la de Atom-g128 (que usa W4Ax con precisión mixta) en varios modelos LLaMA, operando completamente en INT4 sin fallback de precisión mixta.

No se dispone de información sobre el proceso de entrenamiento original del modelo base (datos, tokens, RLHF, etc.). La cuantización se aplica post-entrenamiento, por lo que las capacidades lingüísticas heredadas son las de LLaMA-3-8B, aunque con posibles degradaciones debidas a la pérdida de precisión.

## Capacidades

- Generación de texto: al ser una variante de LLaMA-3-8B, es capaz de generar texto coherente en tareas de lenguaje natural, aunque no se han documentado capacidades específicas en esta versión.
- Razonamiento y conocimiento: se espera que herede las capacidades de razonamiento y conocimiento del modelo base, pero sin confirmación oficial.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (el modelo base LLaMA-3 soporta múltiples idiomas, pero no se especifica para esta versión).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

Dado que no se han documentado casos de uso específicos para esta versión cuantizada, se indican aplicaciones potenciales basadas en su naturaleza:

- Inferencia en dispositivos edge: gracias a la cuantización W4A4, el modelo requiere menos memoria y cómputo, lo que permite ejecutarlo en hardware con recursos limitados, como Raspberry Pi o smartphones, para tareas de generación de texto o asistentes conversacionales.
- Chatbots locales con privacidad: al poder desplegarse en hardware propio, se pueden construir asistentes que procesen datos sensibles sin enviarlos a la nube, aprovechando la baja huella de memoria.
- Prototipado rápido de aplicaciones de NLP: su tamaño reducido facilita la experimentación en entornos de desarrollo sin necesidad de GPUs de gama alta.
- Automatización de tareas de redacción: generación de borradores de correos, informes o contenido web en entornos con restricciones de memoria.
- Filtrado y clasificación de texto: tareas de análisis de sentimiento o categorización de documentos en pipelines donde el coste de inferencia es crítico.
- Educación e investigación: permite estudiar el comportamiento de modelos cuantizados en comparación con versiones de mayor precisión, sin requerir infraestructura costosa.

## Benchmarks y rendimiento

El paper APEX4 reporta los siguientes resultados para LLaMA-3-8B (perplexity en el conjunto de evaluación utilizado, menor es mejor):

| Modelo | Perplexity |
|---|---|
| APEX4-g128 (W4A4) | 7.70 |
| Atom-g128 (W4Ax) | 7.76 |

Además, se indica que APEX4-g128 supera a Atom-g128 en precisión zero-shot en un 4.0-4.4% en los modelos evaluados. No se proporcionan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo es W4A4, se espera que ocupe aproximadamente 4 GB en memoria (para 8B parámetros en INT4), pero el tamaño del repo (5.8 GB) sugiere que puede incluir otros archivos. Se recomienda al menos 6 GB de VRAM para inferencia con márgenes de seguridad.
- GPU recomendadas: no se especifican. Por su tamaño, podría ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 (8 GB), y en GPUs de datacenter como A100 o H100 con mayor holgura.
- Compatibilidad con consumer GPU: probablemente sí, en GPUs con al menos 8 GB de VRAM, aunque no está confirmado.
- Opciones de despliegue: al ser safetensors, se puede usar con librerías como Transformers, vLLM, llama.cpp (si se convierte a GGUF) o TGI. No se mencionan integraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Cuantización | Parámetros | Perplexity (LLaMA-3-8B) | Licencia |
|---|---|---|---|---|
| APEX4-W4A4/Llama-3-8b-g128 | W4A4 (INT4 puro) | 8B (base) | 7.70 | llama3 |
| Atom-g128 | W4Ax (mixto INT4/INT8) | 8B | 7.76 | no disponible |
| LLaMA-3-8B (FP16) | Sin cuantizar | 8B | no disponible | llama3 |

El modelo APEX4-g128 ofrece una ventaja de rendimiento frente a Atom-g128 en perplexidad, manteniendo una cuantización pura INT4, lo que simplifica el hardware necesario. La comparación con el modelo FP16 no está disponible, pero el paper indica que la pérdida de perplexidad es inferior a 0.63 en LLaMA-2-70B (dato no aplicable directamente a LLaMA-3-8B).

## Limitaciones y advertencias

- La cuantización W4A4 puede provocar una degradación de la precisión en tareas complejas de razonamiento o matemáticas en comparación con el modelo FP16, aunque el paper sugiere que es menor que en otros métodos.
- No se dispone de información sobre sesgos específicos del modelo, pero al derivar de LLaMA-3-8B, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación inherente a los modelos de lenguaje, no mitigado por la cuantización.
- La licencia llama3 impone restricciones de uso comercial: permite uso comercial, pero prohíbe ciertos usos (por ejemplo, actividades ilegales o dañinas) y requiere que los modelos derivados mantengan la misma licencia.
- La falta de documentación sobre la longitud de contexto y los idiomas soportados limita su uso en aplicaciones que requieran contextos largos o multilingüismo.
- El número de parámetros reportado en safetensors (2.032M) es inconsistente con el nombre "8b", lo que puede generar confusión; se recomienda verificar el contenido del repositorio antes de su uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/APEX4-W4A4/Llama-3-8b-g128
- Paper (arXiv): https://arxiv.org/html/2606.08761
- Paper (OpenReview PDF): https://openreview.net/pdf?id=A3GPeESWAN
- Resumen del paper (DeepPaper): https://arxiv.deeppaper.ai/papers/2606.08761v1
