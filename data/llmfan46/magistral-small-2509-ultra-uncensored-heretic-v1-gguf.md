# llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v1-GGUF

## Resumen

Magistral-Small-2509-ultra-uncensored-heretic-v1-GGUF es la versión cuantizada en formato GGUF de un modelo derivado de Mistral Small 3.2 (2506) de 24B parámetros, al que se le ha aplicado un proceso de "decensura" o abliteración mediante la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA). El autor de la adaptación es el contribuidor independiente llmfan46, que publica esta variante bajo licencia Apache 2.0. El modelo base subyacente es Magistral Small 1.2 de Mistral AI, un modelo de razonamiento con capacidades multimodales (incluye codificador de visión) presentado en el paper arXiv:2506.10910.

El objetivo del modelo es ofrecer un asistente conversacional y de razonamiento con restricciones de contenido muy reducidas: según la model card, las negativas caen de 92/100 en el modelo original a 5/100 en esta variante, con una divergencia KL de 0.0274 respecto al original, lo que indica una preservación razonable de las capacidades. Mantiene el modo "thinking" (etiquetas `[THINK]...[/THINK]`) activable mediante un system prompt específico, y soporta 24 idiomas declarados, entre ellos el castellano.

La relevancia actual radica en que permite desplegar localmente un modelo de razonamiento de 24B con visión en hardware de consumo (una RTX 4090 o un MacBook con 32 GB de RAM una vez cuantizado), sin las restricciones de contenido del modelo original, lo que lo hace atractivo para investigación sobre alineación, generación creativa sin filtros y experimentación con modelos abliterados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (hereda Mistral Small 3.2 / Magistral Small 1.2, con codificador de visión) |
| Parametros totales | 23.572.403.200 (~23,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M (más proyector de visión mmproj en BF16) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 139,8 GB; incluye proyector de visión separado) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Magistral Small 1.2, que a su vez parte de Mistral Small 3.2 (2506): un transformer decoder-only de aproximadamente 24B parámetros al que se añadió un codificador de visión para entrada multimodal. El entrenamiento del modelo base consistió en un ajuste supervisado (SFT) sobre trazas de razonamiento de Magistral Medium, seguido de aprendizaje por refuerzo (RL) para potenciar las capacidades de razonamiento. Según la model card, Magistral Small 1.2 introduce mejoras sobre la versión 1.1 en multimodalidad, rendimiento y formato de salida (LaTeX y Markdown), además de respuestas más concisas en prompts generales sencillos.

La modificación específica de esta variante es la abliteración mediante Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA). Los parámetros de ablación aplicados son: `start_layer_index` 16, `end_layer_index` 27, `preserve_good_behavior_weight` 0.4607, `steer_bad_behavior_weight` 0.0003, `overcorrect_relative_weight` 0.9702 y `neighbor_count` 5. El proceso interviene en las capas 16 a 27 del modelo para eliminar direcciones de activación asociadas a comportamientos de rechazo, preservando en la medida de lo posible el resto de capacidades, como refleja la divergencia KL de 0.0274. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso en modo "thinking" mediante etiquetas `[THINK]...[/THINK]`.
- Razonamiento matemático y resolución de problemas complejos (herencia de Magistral Small 1.2).
- Generación de código y explicación técnica.
- Capacidades multimodales: entrada de imágenes mediante el proyector de visión `mmproj-BF16.gguf`.
- Modo instructivo directo cuando se usa un system prompt distinto al de razonamiento.
- Soporte multilingüe en 24 idiomas, incluidos castellano, inglés, francés, alemán, portugués, italiano, chino, japonés, coreano, ruso, árabe, hindi y bengalí.
- Conversación multi-turno (pipeline conversacional).
- Contenido sin filtros: reducción drástica de negativas (5/100 frente a 92/100 del original).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Soporte de agentes: no confirmado explícitamente en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo permite estudiar cómo afecta la eliminación de direcciones de rechazo a las capacidades generales, usando la divergencia KL de 0.0274 como métrica de referencia y comparando con el modelo original.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa con temáticas sensibles que el modelo original rechazaría, aprovechando la baja tasa de negativas (5/100).
- Despliegue local en estación de trabajo: con cuantización Q4_K_M o Q5_K_M cabe en una RTX 4090 o en un MacBook con 32 GB de RAM, lo que permite inferencia privada sin conexión a servicios en la nube.
- Análisis de documentos e imágenes: gracias al proyector de visión, se pueden procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales en un mismo flujo.
- Asistencia técnica multilingüe: al cubrir 24 idiomas, puede gestionar consultas en castellano, inglés, francés o árabe dentro de la misma aplicación sin cambiar de modelo.
- Razonamiento matemático asistido: resolución paso a paso de problemas con el modo thinking activado, útil en entornos educativos o de análisis financiero.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece seis niveles (BF16 a Q4_K_M), lo que permite medir el impacto de la cuantización en la calidad del razonamiento para un mismo modelo.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los relativos al proceso de abliteración, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Magistral-Small-2509 original |
|---|---|---|
| Divergencia KL | 0.0274 | 0 (por definición) |
| Negativas (refusals) | 5/100 | 92/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, para ~23,6B parámetros):
  - BF16: aproximadamente 47 GB de VRAM (no cabe en GPU de consumo).
  - Q8_0: aproximadamente 25 GB.
  - Q6_K: aproximadamente 19-20 GB.
  - Q5_K_M: aproximadamente 16-17 GB.
  - Q4_K_M: aproximadamente 14-15 GB.
  - El proyector de visión `mmproj-BF16.gguf` añade un consumo adicional menor.
- GPU recomendadas: A100 40/80 GB o H100 para BF16; RTX 4090 (24 GB) para Q8_0, Q6_K, Q5_K_M y Q4_K_M; RTX 3090 (24 GB) para las mismas cuantizaciones.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q8_0 o inferiores; también en MacBook con 32 GB de RAM unificada según la model card.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y otras herramientas compatibles con GGUF; la librería declarada en el repo es vLLM, aunque el formato GGUF es el principal artefacto publicado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Negativas | Formato |
|---|---|---|---|---|---|---|
| Magistral-Small-2509-ultra-uncensored-heretic-v1 (este) | ~23,6B | no disponible | Sí (mmproj) | Apache 2.0 | 5/100 | GGUF |
| mistralai/Magistral-Small-2509 (original) | ~23,6B | no disponible | Sí | Apache 2.0 (con términos de Mistral) | 92/100 | safetensors |
| Magistral Small 1.1 (2507) | ~23,6B | no disponible | No | Apache 2.0 | no disponible | safetensors |

La comparativa se limita a las variantes de la misma familia porque no se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada. Frente al original, la diferencia principal es la tasa de negativas y la disponibilidad en GGUF para despliegue local; frente a la versión 1.1, la incorporación de visión y la mejora de rendimiento declarada por Mistral.

## Limitaciones y advertencias

- La abliteración elimina mecanismos de rechazo, por lo que el modelo puede generar contenido sensible, ofensivo o potencialmente dañino sin advertir; no es apto para aplicaciones de cara al público sin filtros adicionales.
- La divergencia KL de 0.0274 indica una degradación no nula respecto al original; puede afectar a la coherencia o al razonamiento en tareas exigentes.
- Riesgo de alucinación inherente a los modelos de razonamiento de este tamaño; no se han publicado evaluaciones de fidelidad factual en la información disponible.
- La longitud de contexto no está especificada en la información proporcionada, lo que impide garantizar ventanas largas en producción.
- El modelo se distribuye como GGUF, pero la model card declara `inference: false` y librería vLLM; la integración con vLLM sobre GGUF puede requerir configuración adicional.
- La licencia Apache 2.0 del artefacto no exime de las condiciones de uso del modelo base de Mistral AI, que incluye términos propios y un aviso de gated access con política de privacidad.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura de actualizaciones o archivos.
- No se confirma soporte explícito de tool calling ni de flujos de agentes en la información disponible; conviene validarlo antes de usarlo en pipelines automatizados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v1-GGUF
- Modelo base de la adaptación: https://huggingface.co/llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v1
- Modelo original de Mistral: https://huggingface.co/mistralai/Magistral-Small-2509
- Mistral Small 3.2 (2506): https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Magistral Small 1.1: https://huggingface.co/mistralai/Magistral-Small-2507
- Paper Magistral: https://huggingface.co/papers/2506.10910
- Blog de Mistral sobre Magistral: https://mistral.ai/news/magistral/
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Pull request del método ARA: https://github.com/p-e-w/heretic/pull/211
- Política de privacidad de Mistral: https://mistral.ai/terms/
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
