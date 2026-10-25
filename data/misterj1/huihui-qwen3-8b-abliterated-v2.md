# misterj1/Huihui-Qwen3-8B-abliterated-v2

## Resumen

Huihui-Qwen3-8B-abliterated-v2 es una versión sin censura (uncensored) del modelo Qwen3-8B de Alibaba, obtenida mediante abliteration, una técnica que elimina selectivamente la dirección de activación asociada a los rechazos (refusals) en el espacio latente del transformer sin necesidad de reentrenar los pesos. El modelo ha sido publicado originalmente por huihui-ai y esta ficha concreta corresponde a la copia subida por el usuario misterj1 a HuggingFace bajo el identificador `misterj1/Huihui-Qwen3-8B-abliterated-v2`.

La relevancia de esta versión radica en que corrige dos problemas de la iteración anterior (v1): por un lado, aplica un método de abliteration mas rápido y con mejores resultados, y por otro, modifica la capa 0 para eliminar el problema de generación de texto corrupto (garbled codes) que afectaba a la v1. Ademas, mantiene el modo de razonamiento (thinking mode) del Qwen3 original, lo que permite alternar entre respuestas con cadena de pensamiento explícita y respuestas directas.

Arquitecturalmente hereda las características del Qwen3-8B base: un transformer decoder-only de aproximadamente 8.190 millones de parámetros, con licencia Apache 2.0 y compatible con el ecosistema transformers, text-generation-inference y Ollama. Al tratarse de un proof-of-concept de abliteration, no se han publicado resultados de benchmarks específicos para esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-8B soporta 32.768 tokens nativos, extensibles a 131.072 con YaRN) |
| Tipos de cuantizacion | int4 (BitsAndBytes, referenciado en la model card); GGUF via Ollama (`huihui_ai/qwen3-abliterated:8b-v2`) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible via Ollama |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen/Qwen3-8B, un transformer decoder-only denso de 8,19 mil millones de parámetros. Sobre ese checkpoint no se ha realizado un reentrenamiento convencional, sino una intervención de abliteration: se identifica la dirección en el espacio de activaciones que correlaciona con la generación de rechazos y se proyectan los pesos para eliminarla. Segun la model card del autor, la v2 aplica un método nuevo y mas rapido que la v1, con mejores resultados cualitativos.

La innovación técnica destacable de esta revisión es la modificación de la capa 0, que corrige la generación de caracteres corruptos observada en la versión anterior. Asimismo, se preserva el modo thinking del Qwen3 original, activable mediante `enable_thinking` en el chat template, lo que permite alternar entre razonamiento explícito y respuesta directa. No se detallan en la información proporcionada los datos exactos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) más allá de los del Qwen3-8B base.

## Capacidades

- Generación de texto conversacional multi-turno con contexto heredado del Qwen3-8B.
- Modo de razonamiento (thinking mode) activable o desactivable mediante el chat template (`enable_thinking`) o el comando `/set think` y `/set nothink` en Ollama.
- Respuestas sin rechazos (refusals) ante peticiones que el modelo base rechazaría, gracias a la abliteration.
- Generación de código y matemáticas: capacidades heredadas del Qwen3-8B base (no verificadas específicamente en esta variante).
- Capacidades multilingües: heredadas del Qwen3-8B base, aunque no se especifican idiomas concretos en la información disponible.
- Streaming de tokens con métricas de latencia (la model card incluye un `CustomTextStreamer` para medir tokens por segundo y latencia del primer token).
- Compatibilidad con text-generation-inference y endpoints compatibles (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: heredado del Qwen3-8B base, no documentado explícitamente para esta variante.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar qué tipos de contenido se bloquean en el Qwen3-8B original y cómo la abliteration afecta a la distribución de respuestas, sirviendo como caso de estudio controlado de refusal removal.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera explorar temas sensibles sin los filtros por defecto del modelo base, con la advertencia de revisión humana posterior.
- Análisis de sesgos y robustez: al eliminar la capa de rechazo, resulta útil para auditar cómo el modelo responde a prompts adversariales y para construir clasificadores o evaluadores de seguridad.
- Despliegue local en estaciones de trabajo: con cuantización int4 (~4-5 GB) puede ejecutarse en GPUs de consumo como la RTX 3060 12 GB o la RTX 4060 Ti 16 GB, útil para prototipado offline.
- Integración vía Ollama en pipelines de agentes: el tag disponible en Ollama permite levantar el modelo con un solo comando y conectarlo a frameworks de agentes que necesiten alternar thinking/nothink.
- Educación e investigación académica: para demostrar de forma práctica cómo funcionan las técnicas de abliteration y qué efectos tienen sobre el comportamiento del LLM, comparándolo con el Qwen3-8B no modificado.
- Generación aumentada por recuperación (RAG) sin restricciones temáticas: en dominios donde el modelo base tiende a rechazar consultas legítimas (por ejemplo, medicina legal, criminología o seguridad ofensiva defensiva), esta variante puede ser más útil para el asistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante abliterated.

## Requisitos de hardware

- VRAM estimada para inferencia (8,19 B parámetros):
  - FP16/bf16: ~16,4 GB (tamaño del repo 16,4 GB).
  - int8: ~8-9 GB.
  - int4: ~4,5-5 GB (referencia BitsAndBytes 4-bit en la model card).
- GPUs recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para FP16 sin cuantizar; RTX 4080/4070 Ti Super (16 GB) para int8.
- Cabe en GPU de consumo: sí. En int4 en una RTX 3060 12 GB o RTX 4060 Ti 16 GB; en int8 en una RTX 4070 Ti Super 16 GB.
- Opciones de despliegue: transformers, Ollama (`huihui_ai/qwen3-abliterated:8b-v2`), text-generation-inference (tag `endpoints_compatible`), vLLM y llama.cpp (a través del formato GGUF disponible en Ollama).
- Latencia y throughput: no se han publicado cifras concretas para esta variante; la model card incluye utilidades para medir tokens por segundo y latencia del primer token, pero no reporta resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| misterj1/Huihui-Qwen3-8B-abliterated-v2 (este) | ~8,19 B | no disponible (herencia Qwen3-8B) | apache-2.0 | Disponible en HF, Ollama |
| huihui-ai/Qwen3-8B-abliterated (v1) | ~8,19 B | no disponible (herencia Qwen3-8B) | apache-2.0 | Disponible en HF, superado por v2 segun el autor |
| Qwen/Qwen3-8B (base) | ~8,19 B | 32.768 tokens nativos, 131.072 con YaRN | apache-2.0 | Disponible en HF, tiene filtros de rechazo |

La comparativa se limita a los tres modelos referenciados en la información proporcionada; no se dispone de datos de benchmarks comparativos publicados para esta variante.

## Limitaciones y advertencias

- Al tratarse de una abliteration, el modelo puede generar contenido sensible, ofensivo o potencialmente dañino que el Qwen3-8B original rechazaría; no debe desplegarse en producción orientada a usuarios finales sin filtros externos adecuados.
- Riesgo elevado de alucinación: la abliteration no mejora la veracidad y puede degradar la calibración al eliminar la señal de rechazo.
- El método descrito por el autor es un proof-of-concept "crudo"; la calidad de las respuestas puede ser irregular en comparación con el modelo base.
- La modificación de la capa 0 corrige el problema de garbled codes de la v1, pero no hay garantía de que no aparezcan otras degradaciones en capas profundas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado.
- No se especifican idiomas soportados ni longitud de contexto verificada para esta variante concreta; se recomienda asumir los límites del Qwen3-8B base y validar empíricamente.
- La ficha corresponde a una copia subida por `misterj1`; el modelo original está publicado por `huihui-ai`, por lo que conviene verificar que los pesos coinciden con la fuente primaria antes de usarlo en producción.
- El toggle de thinking debe gestionarse correctamente en el chat template; un uso incorrecto de `enable_thinking` puede producir respuestas con razonamiento expuesto no deseado.

## Enlaces

- HuggingFace (esta copia): https://huggingface.co/misterj1/Huihui-Qwen3-8B-abliterated-v2
- Modelo original en HuggingFace (referenciado en la model card): https://huggingface.co/huihui-ai/Huihui-Qwen3-8B-abliterated-v2
- Versión anterior (v1): https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Repositorio de la técnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Versión Ollama: https://ollama.com/huihui_ai/qwen3-abliterated:8b-v2
