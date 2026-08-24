# mradermacher/MiniCPM5-1B-Turkish-GGUF

## Resumen

MiniCPM5-1B-Turkish-GGUF es la versión cuantizada en formato GGUF del modelo MiniCPM5-1B-Turkish, un ajuste fino completo (full fine-tuning) del modelo MiniCPM5-1B de OpenBMB, especializado en turco e inglés. El modelo base, MiniCPM5-1B, es un Transformer denso de aproximadamente 1.080 millones de parámetros diseñado para despliegue en dispositivos con recursos limitados (edge, móvil, CPU). El ajuste fino se realizó sobre seis datasets de instrucciones, diálogos y código en turco, lo que lo convierte en una opción relevante para aplicaciones de procesamiento de lenguaje natural en turco, especialmente en entornos donde no se dispone de GPUs potentes.

La cuantización GGUF, realizada por mradermacher, ofrece doce niveles de precisión (desde Q2_K hasta f16) que permiten adaptar el modelo a diferentes restricciones de memoria y rendimiento. Al ser un modelo de 1B con licencia Apache 2.0, es accesible para uso comercial y de investigación, y su tamaño reducido lo hace apto para inferencia en CPU, Raspberry Pi, portátiles y GPUs de consumo. La relevancia actual radica en la creciente demanda de modelos pequeños y eficientes que soporten idiomas menos representados como el turco, sin sacrificar la capacidad de seguir instrucciones y generar código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en MiniCPM5-1B) |
| Parametros totales | 1.080.632.832 (1,08B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-1B es un Transformer denso de 1B parámetros, diseñado por OpenBMB para escenarios de despliegue local y en dispositivos con recursos limitados. No se dispone de detalles adicionales sobre el número de capas, cabezas de atención o dimensiones ocultas en la información proporcionada. El ajuste fino (MiniCPM5-1B-Turkish) se realizó mediante full fine-tuning sobre el modelo base, utilizando seis datasets en turco: Turkish-Atlas-Instruct, turkish-instruction, turkish-qa-multi-dialog-dataset, Turkish-CodeAlpaca-20k, turkish-code-instructions y Turkish-Python-instruction-500k. Estos datasets cubren instrucciones generales, diálogos de preguntas y respuestas, y generación de código, lo que indica un entrenamiento orientado a tareas conversacionales y de programación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste fino.

## Capacidades

- Generación de texto en turco e inglés, con especial énfasis en seguir instrucciones y mantener conversaciones multi-turno.
- Generación de código en varios lenguajes (Python, etc.) gracias a los datasets de código en turco incluidos en el entrenamiento.
- Comprensión y respuesta a preguntas en formato diálogo, útil para asistentes virtuales y sistemas de QA.
- Capacidad de ejecución en entornos con recursos limitados (CPU, dispositivos edge) gracias a su tamaño reducido y a las cuantizaciones GGUF.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- No se ha confirmado soporte para visión, audio u otras modalidades; es un modelo exclusivamente de texto.

## Casos de uso

- Atención al cliente automatizada en turco: el modelo puede gestionar conversaciones multi-turno en turco, respondiendo a consultas frecuentes y derivando casos complejos a agentes humanos. Su tamaño permite desplegarlo en servidores modestos o incluso en el edge.
- Asistente de programación en turco: desarrolladores que prefieren trabajar en turco pueden usar el modelo para generar fragmentos de código, explicar conceptos o depurar errores, gracias a su entrenamiento con datasets de código en turco.
- Generación de documentación técnica en turco: el modelo puede redactar manuales, guías y comentarios de código en turco, reduciendo la barrera idiomática en equipos de desarrollo.
- Traducción turco-inglés básica: aunque no está especializado en traducción, su bilingüismo permite realizar traducciones simples entre ambos idiomas, útil en aplicaciones de bajo presupuesto.
- Prototipado rápido de aplicaciones de lenguaje: investigadores y desarrolladores pueden usar el modelo para validar ideas de chatbots o asistentes en turco sin necesidad de GPUs de gama alta, gracias a las cuantizaciones ligeras.
- Despliegue en dispositivos edge: al ser un modelo de 1B con cuantizaciones pequeñas (por ejemplo, Q4_K_M de 0,8 GB), puede ejecutarse en Raspberry Pi, teléfonos móviles o portátiles antiguos, habilitando asistentes de voz o texto offline en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, desde aproximadamente 0,6 GB (Q2_K) hasta 2,3 GB (f16). Con overhead de ejecución, se recomienda al menos 2 GB de VRAM para las cuantizaciones más ligeras y 4 GB para las de mayor precisión.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4090, o GPUs integradas modernas. También puede ejecutarse en CPU (con mayor latencia).
- Cabe en GPUs de consumo: sí, todas las cuantizaciones caben en GPUs de gama media y baja. Las versiones Q2_K y Q3_K pueden ejecutarse incluso en GPUs con 1 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, text-generation-webui, o cualquier framework compatible con GGUF. También es compatible con endpoints mediante servidores como llama.cpp server.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la cuantización elegida; en una CPU moderna se esperan decenas de tokens por segundo, y en GPU, cientos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| MiniCPM5-1B-Turkish-GGUF | 1,08B | No disponible | tr, en | Apache 2.0 | GGUF | No publicado |
| TinyLlama-1.1B | 1,1B | 2048 (típico) | Multilingüe (principalmente en) | Apache 2.0 | HF, GGUF | MMLU ~25% (aprox.) |
| Qwen2.5-1.5B | 1,5B | 32768 | Multilingüe (incluye tr) | Apache 2.0 | HF, GGUF | MMLU ~50% (aprox.) |

Nota: los datos de contexto y rendimiento de TinyLlama y Qwen2.5 son aproximados y provienen de fuentes públicas; no se dispone de comparativas directas con el modelo evaluado. La principal ventaja de MiniCPM5-1B-Turkish es su especialización en turco, mientras que los otros modelos son multilingües generales.

## Limitaciones y advertencias

- Al ser un modelo de solo 1B parámetros, su capacidad de razonamiento complejo y de generación de texto extenso es limitada en comparación con modelos más grandes. Puede producir alucinaciones o respuestas incoherentes en tareas que requieren conocimiento profundo.
- El ajuste fino se centró en turco e inglés; el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso, lo que limita su uso en aplicaciones que requieran interacción con APIs o ejecución de acciones.
- La longitud de contexto no está documentada; se recomienda probar con secuencias cortas para evitar degradación de rendimiento.
- No se han publicado evaluaciones de sesgos o toxicidad. Como todo modelo de lenguaje, puede reflejar sesgos presentes en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento de las condiciones de los datasets utilizados en el entrenamiento (aunque estos son de acceso público).

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/mradermacher/MiniCPM5-1B-Turkish-GGUF)
- [Modelo base MiniCPM5-1B-Turkish (thealper2)](https://huggingface.co/thealper2/MiniCPM5-1B-Turkish)
- [Repositorio GitHub de MiniCPM (OpenBMB)](https://github.com/OpenBMB/MiniCPM)
- [Documentación de despliegue con llama.cpp](https://github.com/OpenBMB/MiniCPM/blob/main/docs/deployment/llama_cpp.md)
- [Página del modelo en FriendliAI](https://friendli.ai/models/thealper2/MiniCPM5-1B-Turkish)
