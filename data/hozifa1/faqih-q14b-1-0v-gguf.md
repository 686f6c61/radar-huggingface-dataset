# hozifa1/Faqih-Q14b-1.0V-GGUF

## Resumen
Faqih-Q14b-1.0V-GGUF es un modelo de lenguaje especializado en el dominio islámico, concretamente en fiqh (jurisprudencia islámica), desarrollado por hozifa1 como parte del proyecto Faqih Islamic AI. Se trata de una versión cuantizada en 4-bit del modelo base Qwen2.5-14B-Instruct, afinado sobre un dataset propio de preguntas y respuestas religiosas en árabe. El modelo está diseñado para ofrecer respuestas precisas y contextualizadas sobre normativa islámica, resolviendo la necesidad de herramientas de IA open source en árabe para consultas religiosas, educación y asistencia legal.

Con 14.770 millones de parámetros y un tamaño de repositorio de 9,9 GB, esta versión GGUF permite su ejecución local en hardware de consumo, facilitando el despliegue en entornos sin acceso a la nube. La licencia Apache 2.0 garantiza libertad de uso, modificación y distribución, lo que lo convierte en una opción atractiva para desarrolladores e investigadores interesados en IA religiosa o multilingüe. Su relevancia actual radica en la escasez de modelos de alta calidad en árabe para dominios especializados, combinando el rendimiento de Qwen2.5 con un ajuste fino específico.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parámetros totales | 14.770.033.664 (14,77B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-14B, típicamente 32.768 tokens, no confirmado) |
| Tipos de cuantización | GGUF Q4 (4-bit) |
| Idiomas soportados | Árabe (principal), posiblemente otros (no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no presente en este repo) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura transformer de Qwen2.5-14B-Instruct, que emplea atención multi-cabeza con ventana de contexto extendida y optimizaciones de eficiencia (como attention con flash attention). El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre el dataset `hozifa1/faqih_sft_dataset`, compuesto por pares de preguntas y respuestas en árabe sobre fiqh (jurisprudencia islámica), incluyendo temas como oración, ayuno, matrimonio, transacciones financieras y otros. El modelo base fue cuantizado a 4 bits durante el fine-tuning (bitsandbytes) y posteriormente convertido a GGUF para su distribución. No se han publicado detalles sobre la composición exacta del dataset, el número de tokens de entrenamiento o técnicas adicionales como RLHF o DPO. La innovación principal es la especialización del modelo en un dominio religioso con un lenguaje técnico y cultural específico, manteniendo la capacidad general de Qwen2.5.

## Capacidades
- Generación de texto en árabe, incluyendo respuestas extensas y contextualizadas sobre fiqh islámico.
- Conversación multi-turno para consultas interactivas, gracias a la naturaleza instruct de Qwen2.5.
- Comprensión de terminología religiosa islámica (fuentes, escuelas jurídicas, principios de jurisprudencia).
- Capacidad de razonamiento sobre casos prácticos de fiqh, aunque limitada por el dataset de entrenamiento.
- No se especifica soporte para tool calling, agentes, visión o audio; el modelo es exclusivamente de texto.
- Multilingüismo potencial: al estar basado en Qwen2.5, podría heredar capacidades multilingües, pero el fine-tuning se centra en árabe, por lo que el rendimiento en otros idiomas puede ser inferior.

## Casos de uso
- **Asistente de consultas religiosas**: usuarios pueden preguntar sobre normas de oración, ayuno o transacciones, y el modelo ofrece respuestas basadas en fiqh. Adecuado por su especialización y licencia abierta.
- **Educación islámica**: estudiantes y profesores pueden generar explicaciones, resúmenes y ejemplos de jurisprudencia para fines didácticos.
- **Aplicación de preguntas y respuestas (FAQ)**: integrar el modelo en chatbots de sitios web de instituciones religiosas o editoriales para responder dudas frecuentes.
- **Investigación académica**: análisis de textos de fiqh, comparación de opiniones de distintas escuelas, o generación de materiales de estudio.
- **Traducción y transcripción**: aunque no es su función principal, puede ayudar a reformular textos árabes religiosos en un estilo más claro.
- **Desarrollo de asistentes de escritorio**: ejecutado localmente con llama.cpp u Ollama, permite uso sin conexión en entornos con privacidad estricta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar. Se recomienda evaluar el modelo en tareas específicas de fiqh mediante conjuntos de prueba propios, dado su carácter especializado.

## Requisitos de hardware
- **VRAM estimada**: para cuantización 4-bit, el modelo ocupa aproximadamente 9-10 GB en RAM/VRAM. Con contexto corto, puede caber en 12 GB VRAM (por ejemplo, RTX 4070 Ti, 4090).
- **GPU recomendadas**: RTX 4090 (24 GB), RTX 3090 (24 GB), o GPUs con más de 12 GB para mayor margen de contexto. Para CPU, se puede ejecutar con 16 GB de RAM usando llama.cpp.
- **En consumer GPU**: Sí, con cuantización 4-bit y contexto reducido puede funcionar en RTX 4080 (16 GB) o RTX 4090.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, llama-cpp-python. También es posible cargar el modelo GGUF con transformers + llama-cpp-python, pero no con vLLM (que requiere safetensors).
- **Latencia y throughput**: no disponible. En una RTX 4090, se espera una velocidad de generación de unos 20-40 tokens/s con contexto corto, pero no confirmado.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Faqih-Q14b-1.0V-GGUF | 14,77B | no disponible | Apache 2.0 | Fiqh islámico (árabe) | GGUF |
| Qwen2.5-14B-Instruct | 14,77B | 32K (típico) | Apache 2.0 | General | Safetensors, GGUF |
| Jais-13B | 13B | no disponible | Propietaria | Árabe general | API |
| Alpaca-14B | 14B | 2K | Apache 2.0 | General | Safetensors |

No se dispone de benchmarks comparativos. La principal diferencia con Qwen2.5-14B-Instruct es el fine-tuning específico, que mejora la calidad en temas de fiqh pero puede degradar el rendimiento en tareas generales. Frente a Jais, Faqih-Q14b es abierto y más ligero, pero Jais ofrece un soporte más amplio del árabe moderno estándar.

## Limitaciones y advertencias
- **Sesgo religioso**: El modelo está entrenado exclusivamente con datos de fiqh, por lo que sus respuestas reflejan una perspectiva religiosa y pueden no ser neutrales ni aplicables a otros contextos.
- **Riesgo de alucinación**: Como todo LLM, puede generar respuestas incorrectas o inventadas sobre jurisprudencia; no debe usarse como fuente autorizada sin verificación humana.
- **Limitaciones de idioma**: El entrenamiento se centró en árabe; el rendimiento en español u otros idiomas es limitado y no está garantizado.
- **Contexto limitado**: Aunque Qwen2.5 soporta 32K tokens, el fine-tuning puede haber reducido el contexto efectivo; no se ha confirmado.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero es necesario atribuir la autoría y conservar el aviso de licencia.
- **Riesgo de mal uso**: El contenido religioso puede ser sensible; se recomienda un filtro humano antes de desplegar en entornos públicos.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/hozifa1/Faqih-Q14b-1.0V-GGUF)
- [Dataset de entrenamiento](https://huggingface.co/datasets/hozifa1/faqih_sft_dataset)
- [Modelo base Qwen2.5-14B-Instruct](https://huggingface.co/unsloth/Qwen2.5-14B-Instruct-bnb-4bit) (no enlazado en la búsqueda, se infiere del campo base_model)
- [Página del proyecto Faqih (no encontrada, solo el repositorio)](no disponible)
