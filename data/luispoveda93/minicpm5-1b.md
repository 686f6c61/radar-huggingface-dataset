# luispoveda93/MiniCPM5-1B

## Resumen

MiniCPM5-1B es un modelo de lenguaje compacto de 1.080 millones de parámetros desarrollado por OpenBMB, pensado para ejecución on-device y entornos con recursos limitados. Este repositorio concreto, `luispoveda93/MiniCPM5-1B`, es una conversión comunitaria del modelo original en formato BF16 a un bundle `.litertlm` cuantizado en INT8, optimizado para el framework LiteRT-LM de Google AI Edge. El modelo base es un transformer decoder-only estándar (arquitectura LlamaForCausalLM) con 24 capas, atención GQA y una ventana de contexto de 131.072 tokens.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 1B con capacidades de razonamiento y tool-calling directamente en dispositivos móviles, IoT o escritorio sin conexión a internet. El modelo soporta un modo de pensamiento híbrido (enable_thinking) que alterna entre respuestas directas y razonamiento explícito, y está entrenado principalmente en inglés y chino. La versión empaquetada ocupa aproximadamente 1,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (LlamaForCausalLM) |
| Parametros totales | 1.080.632.832 (~1,08B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | INT8 dynamic-range (pesos), activaciones FP32 |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (INT8), safetensors BF16 (modelo original) |

## Arquitectura y entrenamiento

El modelo base `openbmb/MiniCPM5-1B` es un transformer decoder-only estándar con 24 capas, dimensiones ocultas de 1536, atención de consultas agrupadas (GQA) con 16 cabezas de consulta y 2 cabezas de clave/valor, head_dim de 128, normalización RMSNorm (eps 1e-6) y RoPE con theta de 5e6. El vocabulario alcanza 130.560 tokens. El modelo original se entrenó con datos bilingües (inglés y chino) y está diseñado para razonamiento, generación de código, uso de herramientas y agentes, con un modo de pensamiento híbrido activable mediante `enable_thinking`.

La versión empaquetada en este repositorio se generó mediante el pipeline de Google AI Edge: re-autoría con `ai-edge-torch` Generative API, conversión a TFLite, cuantización INT8 weight-only de rango dinámico y empaquetado con `litert-lm-builder`. El autor verificó que las logits del último token coinciden con el modelo original en BF16 con similitud coseno de 1.0000 y coincidencia exacta de argmax, así como solapamiento 5/5 en top-5. No se aplicaron técnicas como RLHF o DPO en esta conversión; el modelo base se distribuye tal cual.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento multi-step con modo de pensamiento híbrido (`enable_thinking=True`), que produce un canal de razonamiento separado.
- Soporte de tool calling y function calling, orientado a agentes de codificación y asistentes locales.
- Capacidad de manejo de contexto largo (131.072 tokens) para tareas de análisis de documentos o conversaciones prolongadas.
- Compatible con el framework LiteRT-LM para despliegue en Android, iOS, escritorio e IoT.
- Incluye plantilla de chat (`chat_template.jinja`) con tokens de inicio `<s>` y de fin `</s>` y `<|im_end|>`.

## Casos de uso

- Asistentes personales en el móvil: ejecutar un asistente de voz o texto local sin conexión, con respuestas rápidas y privacidad total, gracias al formato `.litertlm` y el runtime LiteRT-LM.
- Generación de código en entornos de desarrollo integrados: el modelo soporta tool calling y puede integrarse en editores o CLIs para autocompletado y generación de snippets.
- Chatbots de atención al cliente en idiomas inglés y chino: su contexto de 131.072 tokens permite mantener conversaciones largas con historial completo.
- Análisis de documentos extensos: la ventana de contexto permite procesar manuales, contratos o informes largos sin truncado.
- Agentes de automatización en dispositivos edge: el modelo puede orquestar acciones locales (p.ej. control de dispositivos IoT) mediante function calling.
- Investigación en entornos con recursos limitados: por su tamaño de 1B, cabe en GPUs de gama baja o incluso en CPU, facilitando experimentación académica.

## Benchmarks y rendimiento

El modelo original `openbmb/MiniCPM5-1B` alcanza un promedio de **42,57** en la suite de benchmarks que incluye razonamiento, conocimiento, código, seguimiento de instrucciones, matemáticas, lógica y tareas agenticas, según el repositorio oficial de OpenBMB. No se han publicado resultados detallados por tarea (MMLU, HumanEval, GSM8K) en la información disponible.

Adicionalmente, el mantenedor de este repositorio realizó una evaluación comunitaria (0-shot) en español, catalán, euskera y gallego usando el suite de LM Evaluation Harness (SpanishBench, CatalanBench, BasqueBench, GalicianBench). Los resultados para español se muestran a continuación, comparados con el modelo Salamandra-2B (publicado por BSC-LT, no re-ejecutado):

| Tarea | Métrica | MiniCPM5-1B (BF16) | Salamandra-2B |
| :--- | :--- | :--- | :--- |
| xstorycloze_es | acc | 51.69 | 61.95 |
| wnli_es | acc | 43.66 | 49.30 |
| xnli_es | acc | 42.49 | 48.52 |
| paws_es | acc | 57.30 | 57.10 |
| xquad_es | f1 | 0.00 | 29.60 |
| flores_es | bleu | 0.00 | 15.92 |

Estos resultados indican que el modelo, entrenado solo en inglés y chino, tiene un rendimiento bajo en tareas de comprensión del español, salvo en paráfrasis (paws_es) donde supera ligeramente a Salamandra-2B. La evaluación es comunitaria y no oficial, y se realizó sobre el modelo BF16 original, no sobre la versión cuantizada `.litertlm`.

## Requisitos de hardware

- Peso del archivo `.litertlm`: ~1,1 GB (INT8), lo que permite ejecución en dispositivos con al menos 2 GB de RAM libre.
- VRAM estimada para inferencia: el modelo cuantizado en INT8 requiere aproximadamente 1,2 GB de VRAM para cargar los pesos, más overhead de activaciones. Con 2 GB de VRAM puede ejecutarse en GPU integradas o tarjetas muy básicas.
- GPU recomendadas: cualquier GPU con soporte CUDA (GTX 1060 6GB o superior), aunque el modelo está diseñado para CPU y dispositivos móviles. Para uso en CPU, se recomienda al menos 8 GB de RAM.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de las GPUs de consumo actuales (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: LiteRT-LM (formato nativo `.litertlm`), también se puede usar el modelo original BF16 con `transformers`, `vLLM`, `llama.cpp` (con cuantización adicional) o `Ollama` si se convierte.
- Latencia y throughput: no se han publicado datos específicos para esta versión cuantizada. El modelo original en GPU A100 alcanza velocidades típicas de modelos 1B, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
| :--- | :--- | :--- | :--- | :--- | :--- |
| MiniCPM5-1B (este) | 1,08B | 131.072 | en, zh | Apache-2.0 | `.litertlm` INT8 |
| Salamandra-2B | 2,25B | 8.192 (?) | es, ca, eu, gl, en, pt, it, fr | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-1.5B | 1,54B | 32.768 | multilingüe | Apache-2.0 | safetensors, GGUF |
| Gemma-1.1 1B | 1,17B | 8.192 | en, multilingüe | Gemma license | safetensors, GGUF |

Salamandra-2B es un modelo entrenado específicamente con sobremuestreo de lenguas peninsulares, por lo que supera claramente a MiniCPM5-1B en tareas en español, catalán, gallego y vasco. MiniCPM5-1B destaca por su contexto de 131K tokens y su modo de razonamiento híbrido, así como por su formato optimizado para on-device.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés y chino; su rendimiento en otras lenguas es muy limitado (evidencia: resultados casi nulos en XQuAD y FLORES en español).
- Puede producir alucinaciones, contenido sesgado o respuestas incorrectas; se recomienda revisión humana en aplicaciones de alto riesgo.
- La versión `.litertlm` es una contribución comunitaria, no una versión oficial de OpenBMB ni de Google. Aunque se verificó la equivalencia de logits, no se garantiza el mismo comportamiento en todos los escenarios.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales; se debe consultar la model card original.
- No se han publicado resultados de benchmarks en español más allá de la evaluación comunitaria de este repositorio, que no es oficial.
- El modo de pensamiento (`enable_thinking`) requiere ajuste de temperatura y top_p (0.9/0.95 para think, 0.7/0.95 para no-think); no seguir estas recomendaciones puede degradar la calidad de salida.
- El formato `.litertlm` es específico de LiteRT-LM; para usar el modelo con otras herramientas es necesario convertir el modelo base BF16.

## Enlaces

- Repositorio HuggingFace de la versión LiteRT-LM: https://huggingface.co/luispoveda93/MiniCPM5-1B
- Modelo base original: https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Página de análisis en Artificial Analysis (razonamiento): https://artificialanalysis.ai/models/minicpm5-1b
- Página de análisis en Artificial Analysis (no razonamiento): https://artificialanalysis.ai/models/minicpm5-1b-non-reasoning
- Benchmarks y contexto en BenchLM: https://benchlm.ai/models/minicpm5-1b
- Framework LiteRT-LM: https://ai.google.dev/edge/litert-lm
- Aplicación Google AI Edge Gallery (Android): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
