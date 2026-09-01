# mrutkows/granite-4.2-3b-bf16-mlx

## Resumen

El repositorio `mrutkows/granite-4.2-3b-bf16-mlx` contiene una conversión a formato MLX del modelo base `ibm-granite/granite-4.2-3b`, perteneciente a la familia Granite 4.2 de IBM. Se trata de un modelo de lenguaje denso (decoder-only) de 3 mil millones de parámetros, diseñado para tareas de generación de texto, razonamiento, codificación y uso de herramientas. La conversión a MLX permite ejecutar el modelo de forma nativa en hardware Apple Silicon (M1/M2/M3/M4) mediante la librería `mlx-lm`, optimizando el rendimiento en equipos Mac.

La relevancia de este modelo radica en que Granite 4.2 introduce capacidades nativas de razonamiento (thinking mode) con chain-of-thought, además de soporte multilingüe, RAG, tool calling y salida JSON estructurada. Al estar liberado bajo licencia Apache 2.0, es apto para uso comercial y de investigación. Esta variante en bf16 ofrece la máxima calidad de precisión, aunque requiere al menos 16 GB de memoria unificada; existen versiones cuantizadas (q8 y q4) para entornos con menos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 3 000 000 000 (3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (precisión completa), q8 (8 bits, group-size 64), q4 (4 bits, group-size 64) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifican los idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2-3B es un transformer denso decoder-only, sin mezcla de expertos. IBM ha diseñado esta familia con un enfoque en escenarios empresariales, incorporando procesos de curación de datos, evaluación de gobernanza, riesgo y cumplimiento (GRC), y revisión de calidad documental. El entrenamiento incluye datos multilingües y de código, y se ha optimizado para tareas de razonamiento mediante un modo de pensamiento (thinking) que genera cadenas de razonamiento antes de la respuesta final. No se dispone de información pública sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en esta versión.

La conversión a MLX se realizó con `mlx-lm`, que adapta los pesos al formato de MLX para aprovechar la memoria unificada y las unidades Neural Engine de los chips Apple Silicon. El repositorio incluye un `generation_config.json` con los parámetros recomendados (temperatura 0.7, top-p 0.9), aunque `mlx-lm` solo consume automáticamente el `eos_token_id`; el resto debe pasarse explícitamente en cada invocación.

## Capacidades

- Generación de texto y razonamiento paso a paso mediante el modo de pensamiento integrado (`thinking`), activable o desactivable a través del chat template.
- Soporte multilingüe nativo (idiomas concretos no especificados en la documentación disponible).
- Codificación en una amplia gama de lenguajes de programación, con capacidad para tareas de programación y depuración.
- Retrieval-augmented generation (RAG): puede integrarse con sistemas de recuperación de información para responder con contexto externo.
- Tool calling / function calling: permite al modelo invocar herramientas externas en flujos de agente.
- Salida JSON estructurada, útil para integraciones con APIs y sistemas empresariales.
- Razonamiento de múltiples pasos (multi-step reasoning) para problemas complejos de lógica, matemáticas y planificación.

## Casos de uso

- Asistentes de atención al cliente: el modelo puede gestionar conversaciones multi-turno con razonamiento interno, manteniendo coherencia y resolviendo consultas complejas gracias a su modo de pensamiento y soporte multilingüe.
- Generación de código en entornos de desarrollo: integrable en pipelines de CI/CD para autocompletar, revisar o documentar código, aprovechando su capacidad de tool calling y salida JSON.
- Sistemas de recuperación aumentada (RAG): combinado con un índice vectorial, puede responder preguntas sobre documentación corporativa o bases de conocimiento, generando respuestas con citas y razonamiento.
- Automatización de tareas de oficina: redacción de correos, resúmenes de reuniones o informes estructurados, gracias a su capacidad de generar JSON y seguir instrucciones.
- Agentes autónomos: al soportar tool calling y razonamiento multi-paso, puede actuar como agente que planifica y ejecuta acciones (consultas a APIs, búsquedas web, etc.).
- Educación y tutoría: explicación de conceptos técnicos o matemáticos con razonamiento paso a paso, útil en plataformas de aprendizaje adaptativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio MLX no incluye métricas de rendimiento, y la documentación de IBM para Granite 4.2 no proporciona cifras específicas para la variante de 3B en esta conversión. Se recomienda consultar la ficha del modelo base (`ibm-granite/granite-4.2-3b`) para posibles evaluaciones oficiales.

## Requisitos de hardware

- La variante bf16 requiere al menos 16 GB de memoria unificada en Apple Silicon (M1/M2/M3/M4 o posterior).
- La variante q8 reduce el uso de memoria aproximadamente un 50 % respecto a bf16, siendo adecuada para equipos con 8-12 GB de memoria unificada.
- La variante q4 es la más eficiente y se recomienda para equipos con 8 GB de memoria unificada.
- El modelo está diseñado exclusivamente para hardware Apple Silicon; no es compatible con GPUs NVIDIA o AMD sin una conversión adicional a otros formatos (por ejemplo, GGUF o safetensors estándar).
- Despliegue mediante `mlx-lm` (Python) o `uvx` para ejecución efímera. No se mencionan integraciones con vLLM, llama.cpp u Ollama en la documentación del repositorio.
- La latencia y el throughput dependen del chip concreto (M1, M2, M3, M4) y de la cuantización; no se proporcionan cifras estimadas en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. A continuación se presenta una comparativa cualitativa con otros modelos de 3B de propósito general, basada en características públicas:

| Modelo | Parametros | Contexto | Licencia | Formato | Razonamiento nativo |
|---|---|---|---|---|---|
| Granite 4.2-3B (MLX) | 3B | no disponible | Apache 2.0 | MLX (Apple Silicon) | Sí (thinking mode) |
| Llama 3.2 3B | 3B | 128K (según documentación oficial) | Llama 3.2 Community License | GGUF, safetensors | No |
| Qwen2.5 3B | 3B | 32K (según documentación oficial) | Apache 2.0 | GGUF, safetensors | No |
| Phi-3-mini (3.8B) | 3.8B | 4K (versión estándar) | MIT | GGUF, safetensors | No |

Nota: los datos de contexto y licencia de los modelos comparados provienen de información pública general y pueden variar según la versión. La comparativa se limita a características estructurales, ya que no se dispone de benchmarks unificados.

## Limitaciones y advertencias

- Al ser un modelo de 3B, su capacidad de razonamiento complejo y de retención de conocimiento factual es inferior a la de modelos más grandes (8B, 30B o superiores). Puede producir respuestas superficiales o incorrectas en dominios muy especializados.
- Riesgo de alucinación: como cualquier LLM, puede generar información plausible pero falsa, especialmente en tareas de hechos o datos numéricos. Se recomienda verificación externa en aplicaciones críticas.
- La variante MLX está limitada a hardware Apple Silicon; no es portable a entornos con GPUs NVIDIA o AMD sin conversión adicional.
- No se especifican los idiomas soportados ni la longitud de contexto exacta en la documentación del repositorio; estos datos deben consultarse en la ficha del modelo base.
- El modo de pensamiento (thinking) puede aumentar la latencia y el consumo de tokens, lo que debe tenerse en cuenta en despliegues con restricciones de coste o tiempo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y las políticas de IBM para garantizar el cumplimiento en productos finales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrutkows/granite-4.2-3b-bf16-mlx
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Colección Granite 4.2 en HuggingFace: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Documentación oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
