# ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm3

## Resumen

El modelo `ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm3` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3.5-4B-Base`, desarrollado por el autor `ipfipfipf`. Aunque la model card del repositorio corresponde al modelo base de Qwen, el nombre del checkpoint sugiere que se ha entrenado con una combinación de técnicas avanzadas: SDPO (posiblemente *Safe Direct Preference Optimization*), ReAct (razonamiento y actuación), RLSD (probablemente *Reinforcement Learning with Step-wise Decoding*) y un enfoque multitarea con el sufijo `arm3`, que podría indicar una variante orientada a agentes. Sin embargo, no se ha publicado documentación específica del proceso de entrenamiento del fine-tune.

El modelo base, Qwen3.5-4B, es un modelo causal de lenguaje con encoder de visión, que integra una arquitectura híbrida con Gated Delta Networks y atención completa, diseñado para ofrecer alta eficiencia en inferencia y un contexto nativo de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens. El fine-tune hereda estas características y añade un entrenamiento orientado a tareas de razonamiento y agencia, lo que lo hace relevante para aplicaciones que requieren interacción multi-turno, tool calling y comprensión visual. Con solo 4 205 751 296 parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (linear attention) + Gated Attention (full attention) + Vision Encoder |
| Parametros totales | 4 205 751 296 (4,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta ~1 010 000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base declara 201 idiomas y dialectos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base, que el fine-tune hereda, es un transformer causal con un layout de capas definido como `8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`. Esto significa que por cada bloque de 8 capas, hay 3 capas de Gated DeltaNet (atención lineal con cabezas separadas para V y QK) seguidas de una capa de Gated Attention (atención completa con cabezas Q y KV). Esta combinación busca reducir el coste computacional de la atención lineal manteniendo la calidad de la atención completa en puntos clave.

El modelo base fue pre-entrenado y post-entrenado con un enfoque de *reinforcement learning* escalado a entornos de millones de agentes, y con entrenamiento multimodal unificado que logra una eficiencia cercana al 100 % comparada con el entrenamiento solo de texto. El fine-tune, por su parte, incorpora técnicas adicionales inferidas del nombre: SDPO (optimización directa de preferencias con seguridad), ReAct (razonamiento intercalado con acciones), RLSD (aprendizaje por refuerzo con decodificación paso a paso) y un entrenamiento multitarea. No se dispone de detalles concretos sobre el dataset o la duración del entrenamiento del fine-tune.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas y STEM (según benchmarks del modelo base).
- Comprensión visual y diálogo multimodal (pipeline `image-text-to-text`).
- Soporte de tool calling y function calling, probablemente reforzado por el entrenamiento ReAct y multitarea.
- Capacidades de agente con razonamiento multi-paso, gracias a la combinación de ReAct y RLSD.
- Multilingüismo: el modelo base soporta 201 idiomas y dialectos, aunque no se confirma que el fine-tune conserve todas las capacidades.
- Modo de pensamiento (*thinking mode*), típico de la familia Qwen3.5, que permite generar cadenas de razonamiento antes de la respuesta final.
- Contexto largo nativo de 262 K tokens, útil para documentos extensos o conversaciones de muchos turnos.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262 K tokens), lo que permite mantener el historial completo de una interacción sin truncamientos. Su entrenamiento multitarea y ReAct facilita la integración con APIs de gestión de tickets o bases de conocimiento.
- Generación de código en producción: con soporte de tool calling y razonamiento paso a paso, puede integrarse en pipelines de CI/CD para autocompletar código, revisar pull requests o generar tests unitarios. Su tamaño de 4 B permite desplegarlo en entornos con GPU de gama media.
- Asistentes de análisis de documentos con visión: al ser un modelo image-text-to-text, puede procesar capturas de pantalla, diagramas o documentos escaneados, extraer información y responder preguntas sobre ellos. Útil en entornos de oficina o investigación.
- Agentes autónomos de navegación web: gracias al entrenamiento ReAct y RLSD, puede razonar sobre acciones (buscar, hacer clic, rellenar formularios) y ejecutarlas mediante herramientas, lo que lo hace adecuado para automatizar tareas de scraping o gestión de cuentas.
- Razonamiento matemático y científico asistido: con puntuaciones de 79,1 en MMLU-Pro y 91,2 en MMLU-Redux (según el modelo base), puede servir como tutor o asistente de investigación en áreas STEM, generando explicaciones detalladas y resolviendo problemas paso a paso.
- Chatbots especializados en dominios concretos: el fine-tune multitarea permite adaptar el modelo a sectores como legal, médico o financiero, siempre que se realice un ajuste adicional con datos propios, aprovechando la licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tune `ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm3`. Los datos disponibles en la model card corresponden al modelo base Qwen3.5-4B, que se muestran a continuación como referencia orientativa:

| Benchmark | Qwen3.5-4B (base) |
|---|---|
| MMLU-Pro | 79,1 |
| MMLU-Redux | 91,2 |
| GPT-OSS-120B | 80,8 |
| GPT-OSS-20B | 74,8 |
| Qwen3-Next-80B-A3B-Thinking | 82,7 |
| Qwen3-30BA3B-Thinking-2507 | 80,9 |
| Qwen3.5-9B | 82,5 |

Nota: las columnas adicionales corresponden a otros modelos comparados en la tabla original, pero aquí solo se reproduce la columna del modelo base. No se dispone de datos de rendimiento del fine-tune en tareas específicas como HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización FP16, el modelo requiere aproximadamente 8 GB de VRAM. Con cuantización de 8 bits, se reduce a unos 4-5 GB; con 4 bits, a unos 2-3 GB. No se han publicado pesos cuantizados, pero pueden generarse con herramientas como llama.cpp o AutoGPTQ.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16 sin cuantizar; RTX 4060 Ti (16 GB) o superior para 8 bits; tarjetas con 8 GB (RTX 3060, RTX 4060) para 4 bits.
- Sí cabe en GPU de consumo: el modelo de 4 B es adecuado para tarjetas gráficas de gama media-alta, siempre que se utilice cuantización.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers y llama.cpp (si se convierten los pesos). También puede ejecutarse con Ollama si se genera un GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo denso de 4 B, se espera una velocidad de generación de aproximadamente 30-50 tokens/s en una RTX 4090 con FP16, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas del fine-tune con otros modelos. A modo orientativo, se compara el modelo base Qwen3.5-4B con alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | MMLU-Pro | MMLU-Redux |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4 B | 262 K | Apache-2.0 | 79,1 | 91,2 |
| Qwen3-4B | 4 B | 32 K | Apache-2.0 | ~72 (estimado) | ~85 (estimado) |
| Llama-3.2-3B | 3 B | 128 K | Llama 3.2 | ~60 (estimado) | ~75 (estimado) |

Nota: los valores estimados para Qwen3-4B y Llama-3.2-3B son aproximaciones basadas en publicaciones públicas, no mediciones verificadas. El fine-tune `ipfipfipf` no tiene datos de comparación propios.

## Limitaciones y advertencias

- No se ha documentado el proceso de entrenamiento del fine-tune; el nombre sugiere técnicas avanzadas, pero no hay papers ni logs públicos que las respalden.
- Los benchmarks mostrados corresponden al modelo base, no al fine-tune; el rendimiento real puede diferir significativamente según la tarea y la calidad del ajuste.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados. Se recomienda verificación humana en aplicaciones críticas.
- Sesgos: no se han evaluado sesgos específicos del fine-tune; el modelo base fue entrenado con datos multilingües y puede reflejar sesgos culturales o regionales.
- Limitaciones de idioma: aunque el modelo base declara 201 idiomas, no se confirma que el fine-tune conserve todas las capacidades multilingües. Los idiomas soportados no están especificados en el repositorio.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero se debe incluir el aviso de licencia y atribución. No hay restricciones adicionales conocidas.
- Contexto largo: aunque el modelo base soporta hasta 262 K tokens, el fine-tune podría no haber sido entrenado para aprovechar completamente esa longitud; se recomienda probar con ventanas menores en producción.

## Enlaces

- Repositorio del fine-tune: https://huggingface.co/ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm3
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
