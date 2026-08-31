# akumaburn/Qwen3.8-27B-heretic-SmoothQuant-W8A8-INT8

## Resumen

Este modelo es una cuantización INT8 W8A8 del modelo Qwen3.8-27B-heretic, que a su vez es una versión sin alineación de seguridad (abliterada) del Qwen3.8-27B de Alibaba. Desarrollado por akumaburn, tiene como objetivo permitir el despliegue eficiente de un modelo multimodal de 27B en GPUs Ampere (SM 8.0) que no disponen de soporte nativo para FP8. Utiliza una receta de cuantización basada en QuaRot rotation, SmoothQuant y GPTQ, dejando ciertos componentes (como el MTP head, lm_head, embed_tokens y la torre de visión) en FP16. Con 27.360 millones de parámetros y una ventana de contexto de hasta 262.144 tokens, está diseñado para servirse con vLLM, incluyendo decodificación especulativa mediante el módulo MTP.

La relevancia de este modelo radica en que permite ejecutar un LLM multimodal de gran tamaño con contexto muy largo en hardware de gama media, manteniendo una fidelidad alta respecto al modelo original (KL divergence de 0.0080 en WikiText-2). Está pensado exclusivamente para investigación en seguridad, interpretabilidad y red-teaming, ya que la abliteración elimina deliberadamente los mecanismos de rechazo de contenido dañino. La licencia Apache-2.0 permite uso comercial, pero el autor lo restringe a fines de investigación con un disclaimer explícito.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Qwen3.8-27B) con torre de visión, GatedDeltaNet y módulo MTP para decodificación especulativa |
| Parametros totales | 27.360.627.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (configuración recomendada en vLLM) |
| Tipos de cuantizacion | W8A8 INT8: pesos INT8 per-channel simétrico (GPTQ), activaciones INT8 per-token dinámicas; componentes no cuantizados en FP16 (MTP head, lm_head, embed_tokens, torre de visión, gates recurrentes, normas) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingüe, pero no se especifica para esta versión) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado desde cero, sino que es una cuantización post-entrenamiento del modelo Qwen3.8-27B-heretic, que a su vez es una versión abliterada (sin alineación de seguridad) del Qwen3.8-27B original de Alibaba. La abliteración, realizada por el proyecto Heretic, elimina los mecanismos de rechazo de contenido dañino mediante una edición de bajo KL (0.088 nats) confinada a 63 proyecciones de salida en las capas 11 a 63. El modelo resultante mantiene las capacidades del original pero sin filtros de seguridad.

La cuantización se ha realizado con la receta QuaRot rotation → SmoothQuant → GPTQ, implementada con llm-compressor y compressed-tensors. Los pesos se cuantizan a INT8 per-channel simétrico, mientras que las activaciones se cuantizan a INT8 per-token dinámicas, lo que permite usar la ruta de tensor-core INT8 nativa de CUTLASS en GPUs Ampere. El MTP head (para decodificación especulativa), lm_head, embed_tokens, la torre de visión y los gates recurrentes de GatedDeltaNet se mantienen en FP16, ya que su cuantización degradaría la calidad. Todas las dimensiones de las matmuls cuantizadas son múltiplos de 128, lo que evita padding innecesario. La configuración de precisión residual es FP16 en todo el modelo (config.json: dtype float16).

## Capacidades

- Generación de texto multimodal: procesa y genera texto a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Razonamiento y generación de código: el modelo base Qwen3.8-27B está optimizado para tareas de programación y razonamiento complejo, según la documentación oficial.
- Soporte de agentes y multi-step reasoning: diseñado para flujos de trabajo agénticos, con capacidad de encadenar pasos de razonamiento.
- Decodificación especulativa con MTP: acelera la inferencia prediciendo múltiples tokens por paso (acceptance length medio de 2.50 tokens en HumanEval).
- Tool calling y function calling: probablemente soportado por el modelo base, aunque no se documenta explícitamente en esta versión cuantizada.
- Capacidades multilingües: el modelo base de Qwen es multilingüe, pero no se especifican los idiomas para esta versión.
- Sin moderación de contenido: al estar abliterado, no rechaza solicitudes dañinas ni aplica filtros de seguridad.

## Casos de uso

- Investigación en seguridad de IA: red-teaming de sistemas de moderación y evaluación de riesgos de modelos sin alineación, en entornos controlados y con consentimiento informado.
- Estudio de interpretabilidad: análisis de cómo la abliteración afecta a las representaciones internas y a la activación de neuronas relacionadas con la seguridad.
- Evaluación de técnicas de cuantización: validación de la fidelidad de W8A8 en modelos de 27B, comparando la KL divergence con versiones en BF16 y FP8.
- Optimización de decodificación especulativa: pruebas de rendimiento con MTP y configuraciones de vLLM (async scheduling, KV cache FP8) para maximizar el throughput.
- Desarrollo de sistemas de detección de contenido dañino: uso del modelo como generador de ejemplos adversarios para entrenar clasificadores de seguridad.
- Benchmarking de hardware: medición de latencia y uso de VRAM en GPUs Ampere (A100, RTX 3090) con contexto largo (hasta 262k tokens) y tensor parallelism.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión cuantizada. Sin embargo, la model card incluye métricas de fidelidad y rendimiento de decodificación especulativa, comparadas con el modelo hermano no abliterado con la misma configuración de cuantización:

| Metrica | Este modelo | Sibling no abliterado |
|---|---|---|
| KL divergence (floor-free) desde la fuente | 0.0080 | 0.0081 |
| KL divergence (raw, con floor) | 0.0083 | 0.0110 |
| Acceptance rate (HumanEval, concurrency 32) | 50.1 % | 50.6 % |
| Acceptance length (tokens aceptados por paso) | 2.50 | 2.52 |

Las métricas de KL se midieron en WikiText-2 (top-512, 12 264 posiciones) sirviendo el modelo con vLLM y activaciones INT8 dinámicas reales. La acceptance length determina la aceleración de la decodificación especulativa; los valores son prácticamente idénticos al modelo no abliterado, lo que indica que la abliteración no afecta a la calidad de la cuantización ni al acuerdo entre el drafter y el target.

## Requisitos de hardware

- VRAM estimada: aproximadamente 27 GB para los pesos INT8, más memoria para el KV cache y los componentes FP16. Con contexto de 262k tokens, se recomienda al menos 2× GPU con 40 GB o más.
- GPU recomendadas: 2× A100 (40 GB o 80 GB) o 2× RTX 3090/4090 (24 GB cada una, aunque el contexto largo puede requerir más). Orientado a GPUs Ampere (SM 8.0) y posteriores; no requiere soporte FP8 nativo.
- Despliegue con vLLM: comando sugerido en la model card, con tensor-parallel-size 2, kv-cache-dtype fp8_e4m3, async scheduling y speculative-config con MTP (num_speculative_tokens=3).
- Alternativas de despliegue: no se mencionan otras librerías (llama.cpp, Ollama, TGI) en la documentación; el formato safetensors es compatible con vLLM y otros frameworks que soporten compressed-tensors.
- Latencia y throughput: no se proporcionan cifras concretas, pero la decodificación especulativa con acceptance length 2.50 implica un speedup teórico de ~2.5× respecto a la decodificación autoregresiva estándar.

## Comparativa con modelos similares

La comparación más directa es con el modelo fuente y con el modelo base original:

| Modelo | Parametros | Precision | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.36B | BF16 | 262k (según config) | Apache-2.0 | Modelo original de Alibaba, con alineación de seguridad |
| Qwen3.8-27B-heretic | 27.36B | BF16 | 262k | Apache-2.0 | Versión abliterada, sin rechazo de contenido |
| Este modelo | 27.36B | INT8 W8A8 | 262k | Apache-2.0 | Cuantización del heretic, para GPUs sin FP8 |

No se dispone de datos de otros modelos de la misma categoría (por ejemplo, Llama-3.1-27B cuantizado) en la información proporcionada. La principal diferencia con el modelo base es la precisión numérica (INT8 vs BF16), que reduce el tamaño del repo de 55.6 GB a 31.3 GB, y la eliminación de la alineación de seguridad heredada de la versión heretic.

## Limitaciones y advertencias

- Sin alineación de seguridad: el modelo ha sido deliberadamente abliterado y no rechaza solicitudes dañinas, ilegales o no éticas. Puede generar contenido peligroso sin moderación.
- Solo para investigación: el autor lo restringe a investigación, red-teaming y evaluación, con un disclaimer que exime de responsabilidad. No debe desplegarse en entornos de producción ni donde pueda interactuar con usuarios no consentidos.
- Riesgo de alucinación: como todos los LLM, puede inventar información, especialmente en contextos largos o con entradas ambiguas.
- Limitaciones de idioma: no se especifican los idiomas soportados; aunque el modelo base es multilingüe, la cuantización puede afectar a lenguas con menos representación.
- Fidelidad numérica: aunque la KL divergence es baja (0.0080), la cuantización INT8 puede degradar ligeramente la calidad en tareas de precisión, especialmente en matemáticas o código.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el autor declara explícitamente que es un artefacto de investigación y no ofrece garantías ni asume responsabilidad.
- Compatibilidad: el MTP head cuantizado no es intercambiable con el de la versión BF16, y requiere vLLM con configuración específica para funcionar correctamente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/akumaburn/Qwen3.8-27B-heretic-SmoothQuant-W8A8-INT8)
- [Modelo base heretic (BF16)](https://huggingface.co/akumaburn/Qwen3.8-27B-heretic)
- [Qwen3.8-27B original (Alibaba)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio GitHub de Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Repositorio GitHub de AlibabaCloud para Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Guía de descarga de Qwen3.8-27B en HuggingFace](https://www.orcarouter.ai/blog/qwen-3-8-27b-huggingface)
