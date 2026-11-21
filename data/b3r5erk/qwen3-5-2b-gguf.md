# b3r5erk/Qwen3.5-2B-GGUF

## Resumen

Qwen3.5-2B es un modelo de lenguaje y visión de tipo causal con codificador visual, desarrollado por el equipo Qwen (Alibaba). Esta ficha corresponde a la cuantización GGUF publicada por el usuario b3r5erk en Hugging Face, generada con las herramientas de Unsloth (Unsloth Dynamic 2.0) a partir de los pesos originales de Qwen/Qwen3.5-2B. El modelo resuelve tareas de generación de texto, razonamiento, código, matemáticas y comprensión de imágenes dentro de un rango de parámetros muy contenido (1.881.825.088 parámetros reales), lo que lo hace apto para prototipado, ajuste fino específico y despliegue en hardware modesto.

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un esquema híbrido, e incorpora entrenamiento con Multi-Token Prediction (MTP). El contexto nativo es de 262.144 tokens, una cifra muy superior a la de modelos de su tamaño. La familia Qwen3.5 se presenta como una base unificada visión-lenguaje con entrenamiento de fusión temprana, cobertura de 201 idiomas y mejoras en generalización mediante RL a gran escala.

Su relevancia actual reside en que ofrece capacidades multimodales y contexto largo en un modelo de 2B, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales y despliegue en GPUs de consumo mediante llama.cpp u Ollama. El repositorio GGUF tiene un tamaño de 34,6 GB, lo que refleja la inclusión de múltiples niveles de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; híbrido Gated DeltaNet + Gated Attention, con MTP |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se documenta configuración MoE en la variante 2B) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0; niveles concretos no detallados en la información disponible) |
| Idiomas soportados | 201 idiomas y dialectos (según la model card de la familia) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); pesos originales en safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador visual. El layout de capas es 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, 24 capas en total: bloques de atención lineal Gated DeltaNet intercalados con bloques de atención completa Gated Attention. La dimensión oculta es 2048, el FFN tiene dimensión intermedia 6144 y el embedding de tokens es de 248.320 entradas (con padding), atado a la salida LM. Gated DeltaNet usa 16 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 8 cabezas para Q y 2 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. El modelo se entrenó con Multi-Token Prediction (MTP) multi-paso.

El entrenamiento consta de pre-entrenamiento y post-entrenamiento. La familia Qwen3.5 se entrenó con fusión temprana sobre tokens multimodales, alcanzando paridad con Qwen3 y superando a Qwen3-VL en razonamiento, código, agentes y comprensión visual. Se aplicó RL a escala en entornos de millones de agentes con distribuciones de tareas progresivamente complejas. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se usaron RLHF o DPO en esta variante concreta.

## Capacidades

- Generación de texto y razonamiento en modo instruct (no-thinking) y, presumiblemente, modo thinking (la model card distingue modos, aunque el detalle del modo thinking no se incluye en el fragmento disponible).
- Comprensión de imágenes y texto (pipeline image-text-to-text) gracias al codificador visual integrado.
- Generación de código y resolución de problemas matemáticos.
- Capacidades de agente y razonamiento multi-paso, reforzadas por entrenamiento RL en entornos de agentes.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la documentación de la familia.
- Contexto largo de 262.144 tokens, útil para documentos extensos y conversaciones multi-turno.
- Compatibilidad con tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación a agentes de la familia lo sugiere.

## Casos de uso

- Prototipado de asistentes multimodales: el modelo acepta imagen y texto y puede responder sobre el contenido visual, adecuado para demos y validación de producto antes de escalar a modelos mayores.
- Análisis de documentos largos: con 262.144 tokens de contexto, puede procesar informes, contratos o expedientes completos en una sola pasada sin truncar.
- Generación de código en entornos de desarrollo: útil para autocompletado, explicación de fragmentos y generación de tests en pipelines locales con llama.cpp u Ollama.
- Atención al cliente automatizada: conversaciones multi-turno con contexto amplio y despliegue en GPUs de consumo, lo que reduce coste por inferencia.
- Ajuste fino específico de dominio: al ser un modelo de 2B con licencia Apache 2.0, es viable reentrenarlo con Unsloth para tareas verticales (legal, sanitario, soporte interno) sin restricciones comerciales.
- Extracción de información de imágenes y documentos escaneados: combinación de OCR implícito y razonamiento sobre el texto extraído para clasificación o resumen.
- Investigación en eficiencia de arquitecturas híbridas: su mezcla de atención lineal y atención completa sirve como banco de pruebas para estudiar latencia y throughput en contextos largos.

## Benchmarks y rendimiento

Resultados de la model card de la familia (modo Instruct, no-thinking). La tabla original se interrumpe en la información disponible; se recogen los valores completos para MMLU-Pro y se indica lo disponible para el resto.

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro (Instruct) | 69,6 | 40,2 | 55,3 | no disponible |

No se han publicado en la información disponible el resto de resultados de benchmarks (HumanEval, GSM8K, benchmarks visuales) para Qwen3.5-2B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta en la información proporcionada. Como referencia orientativa por tamaño (1,88B parámetros), las cuantizaciones GGUF típicas de 4 bits rondarían los 1,2-1,5 GB y las de 8 bits en torno a 2-2,5 GB, si bien estos cálculos no están confirmados en la documentación del repositorio.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar funcionamiento en GPUs de consumo tipo RTX 3060/4060/4090, pero no se confirma.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se aporta confirmación oficial.
- Opciones de despliegue: llama.cpp, Ollama y otras herramientas compatibles con GGUF; los pesos originales son compatibles con Hugging Face Transformers, vLLM, SGLang y KTransformers según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B (esta ficha) | 1,88B | 262.144 | Apache 2.0 | Sí (visión) | GGUF y safetensors |
| Qwen3-1.7B | 1,7B (aprox.) | no disponible | Apache 2.0 (familia Qwen3) | No | safetensors y GGUF |
| Qwen3-4B-2507 | 4B (aprox.) | no disponible | Apache 2.0 (familia Qwen3) | No | safetensors y GGUF |

En MMLU-Pro, Qwen3.5-2B obtiene 55,3 frente a 40,2 de Qwen3-1.7B y 69,6 de Qwen3-4B-2507, lo que sitúa al modelo por encima de su predecesor inmediato de tamaño similar y por debajo del 4B. La ventaja diferencial de Qwen3.5-2B es la combinación de visión, contexto de 262.144 tokens y arquitectura híbrida en un tamaño de 2B.

## Limitaciones y advertencias

- Modelo de 2B parámetros: capacidad de razonamiento y conocimiento factual limitada frente a modelos mayores; adecuado para prototipado y tareas acotadas, no para razonamiento complejo de producción sin validación.
- Riesgo de alucinación inherente a los modelos de lenguaje; requiere verificación en aplicaciones de alta exigencia factual.
- La información sobre sesgos específicos no está disponible en la documentación consultada.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base original (Qwen/Qwen3.5-2B) para confirmar términos de uso comercial.
- Los benchmarks publicados son parciales en la información disponible; no se han verificado resultados en código, matemáticas ni tareas visuales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que la cuantización no ha sido ampliamente validada por la comunidad.
- No se detallan los niveles de cuantización incluidos ni sus tamaños individuales, lo que dificulta planificar el despliegue.

## Enlaces

- Repositorio GGUF: https://huggingface.co/b3r5erk/Qwen3.5-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía de ejecución local de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Guía de fine-tuning de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Documentación de Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Qwen Chat: https://chat.qwen.ai
