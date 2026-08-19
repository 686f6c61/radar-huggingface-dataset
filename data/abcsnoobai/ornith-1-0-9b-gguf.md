# abcsnoobai/Ornith-1.0-9B-GGUF

## Resumen

Ornith-1.0-9B es un modelo de lenguaje denso de aproximadamente 9 000 millones de parámetros, especializado en codificación agéntica (agentic coding). Ha sido desarrollado por el equipo de ornith-ai (DeepReinforce) y posteriormente cuantizado al formato GGUF por el usuario abcsnoobai para facilitar su despliegue en entornos locales con llama.cpp, Ollama u otros runners compatibles. El modelo forma parte de una familia más amplia que incluye variantes de 31B densas y 35B/397B MoE, todas post-entrenadas sobre los modelos base Gemma 4 y Qwen 3.5.

Su principal innovación es un framework de entrenamiento auto-mejorable basado en aprendizaje por refuerzo (RL) que optimiza simultáneamente el "scaffold" (el andamiaje de razonamiento) y las soluciones generadas, lo que le permite descubrir mejores trayectorias de búsqueda y producir soluciones de mayor calidad. Con una ventana de contexto de 262 144 tokens (256K), está diseñado para tareas de codificación complejas que requieren razonamiento multi-paso y uso de herramientas. En benchmarks de referencia como Terminal-Bench 2.1 y SWE-bench Verified, supera a modelos de tamaño comparable como Qwen3.5-9B y Gemma4-12B, situándose a la par o por encima de modelos significativamente más grandes.

Esta ficha se centra en la versión cuantizada GGUF publicada por abcsnoobai, que hereda las capacidades del modelo original y añade compatibilidad con infraestructuras de inferencia locales y de bajo consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base no especificada; post-entrenado sobre Gemma 4 y Qwen 3.5) |
| Parametros totales | 8 953 803 264 (aprox. 9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | GGUF (múltiples cuantizaciones, no listadas en el repo) |
| Idiomas soportados | No disponible |
| Licencia | MIT (modelo base) / Apache-2.0 (repo GGUF) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.0-9B es un transformer denso post-entrenado sobre los pesos de Gemma 4 y Qwen 3.5, aunque la documentación no especifica cuál de estos dos modelos sirve como base exacta para la variante de 9B. El entrenamiento emplea un framework propietario de auto-mejora: mediante aprendizaje por refuerzo, el modelo aprende a generar no solo las soluciones (rollouts) sino también el scaffold que guía esos rollouts. Al optimizar conjuntamente ambos componentes, el modelo descubre trayectorias de búsqueda más eficientes y produce soluciones de mayor calidad que un entrenamiento convencional.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La cuantización GGUF del repo de abcsnoobai conserva las capacidades del modelo original, pero no añade información adicional sobre el entrenamiento.

## Capacidades

- Generación de código y razonamiento multi-paso orientado a tareas de desarrollo software.
- Soporte de tool calling y function calling, esencial para integrarse en flujos de agentes autónomos.
- Capacidad de actuar como agente de codificación: puede planificar, ejecutar comandos, leer archivos y modificar código de forma iterativa.
- Ventana de contexto de 256K tokens, adecuada para repositorios completos o historiales de conversación largos.
- Interfaz compatible con OpenAI (según la documentación del repo base), lo que facilita su integración en herramientas existentes.
- Multilingüismo: no confirmado explícitamente, aunque al estar basado en modelos multilingües (Gemma y Qwen) es probable que herede dicha capacidad.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede analizar un issue, explorar el código relacionado y generar un parche o una solución completa, gracias a su contexto largo y su entrenamiento en SWE-bench.
- Asistente de programación en IDE: integrado como backend de autocompletado o chat contextual, puede sugerir implementaciones, refactorizaciones y correcciones de errores.
- Automatización de tareas de DevOps: con tool calling, puede ejecutar comandos de terminal, gestionar pipelines de CI/CD y diagnosticar fallos de compilación o despliegue.
- Generación de documentación técnica: a partir de código fuente o especificaciones, puede redactar documentación de API, guías de uso y comentarios de código.
- Agente de revisión de código (code review): puede analizar pull requests, detectar problemas de estilo, bugs potenciales y sugerir mejoras antes de la integración.
- Chatbot técnico de soporte: con su contexto de 256K, puede mantener conversaciones largas sobre un proyecto concreto, respondiendo preguntas sobre arquitectura, dependencias o comportamiento esperado.
- Creación de pruebas unitarias y de integración: dado un módulo o función, puede generar casos de prueba relevantes y verificar su cobertura.

## Benchmarks y rendimiento

La model card del autor proporciona resultados en benchmarks de codificación agéntica, comparando Ornith-1.0-9B con modelos de tamaño similar y superior. Los datos se resumen a continuación:

| Benchmark | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.5-35B | Gemma4-12B | Gemma4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 43.1 | 21.3 | 41.4 | 21.0 | 42.1 |
| Terminal-Bench 2.1 (Claude Code) | 40.6 | 18.9 | 38.9 | - | - |
| SWE-bench Verified | 69.4 | 53.2 | 70.0 | 44.2 | 52.0 |
| SWE-bench Pro | 42.9 | 31.3 | 44.6 | 27.6 | 35.7 |

No se han publicado resultados en benchmarks generales de conocimiento o razonamiento (MMLU, GSM8K, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, los pesos ocupan aproximadamente 5-6 GB, por lo que el modelo puede ejecutarse en GPUs consumer con 8 GB o más. Con Q8_0, el uso de VRAM sube a unos 10-11 GB. En bf16 sin cuantizar, el modelo ocupa ~19 GB, requiriendo una GPU con al menos 24 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones altas o bf16; RTX 3060/4060 (12 GB) para Q4/Q5; GPUs de datacenter como A100 o H100 para despliegues con máxima precisión y throughput.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y cualquier framework compatible con GGUF. El repo base indica que se puede levantar un servidor compatible con OpenAI usando vLLM con `--tensor-parallel-size` para sharding multi-GPU.
- Latencia y throughput: no se han publicado mediciones oficiales. Como referencia, un modelo denso de 9B en una RTX 4090 con Q4 suele alcanzar entre 30 y 60 tokens por segundo, dependiendo del tamaño del prompt y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | SWE-bench Verified | Enfoque |
|---|---|---|---|---|---|
| Ornith-1.0-9B | ~9B denso | 256K | MIT | 69.4 | Codificación agéntica |
| Qwen3.5-9B | ~9B denso | no disponible | no disponible | 53.2 | Codificación general |
| Gemma4-12B | ~12B denso | no disponible | no disponible | 44.2 | Codificación general |
| Qwen3.5-35B | ~35B denso | no disponible | no disponible | 70.0 | Codificación agéntica |

Ornith-1.0-9B supera claramente a Qwen3.5-9B y Gemma4-12B en SWE-bench Verified, y se acerca al rendimiento de Qwen3.5-35B, que tiene casi cuatro veces más parámetros. Esto lo convierte en una opción muy eficiente para despliegues en una sola GPU.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o comportamientos indeseados. Al ser un modelo especializado en codificación, su rendimiento en tareas de lenguaje general (redacción creativa, traducción, etc.) puede ser inferior al de modelos de propósito general.
- La licencia del repo GGUF es Apache-2.0, mientras que la model card del autor indica MIT para el modelo base. Esta discrepancia debe tenerse en cuenta antes de un uso comercial: se recomienda verificar los términos exactos en la documentación oficial de ornith-ai.
- La cuantización GGUF puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en bf16, especialmente en tareas de razonamiento complejo.
- El modelo está diseñado para agentes de codificación; su uso en otros dominios requiere validación adicional.
- No se dispone de información sobre el dataset de entrenamiento, por lo que no es posible evaluar posibles sesgos de código o dependencias de lenguajes específicos.

## Enlaces

- Repo HuggingFace GGUF (abcsnoobai): https://huggingface.co/abcsnoobai/Ornith-1.0-9B-GGUF
- Repo HuggingFace del modelo base (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.0-9B-GGUF
- Repo HuggingFace oficial de la familia Ornith: https://huggingface.co/deepreinforce-ai/Ornith-1.0-9B-GGUF
- Repo GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Página oficial de Ornith 1.0 Model 9B: https://ornith.online/ornith-1-0-model-9b
- Blog de Ornith: https://deep-reinforce.com/ornith.html
