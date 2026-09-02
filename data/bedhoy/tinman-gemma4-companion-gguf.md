# Bedhoy/Tinman-gemma4-companion-gguf

## Resumen

El modelo **Bedhoy/Tinman-gemma4-companion-gguf** es una versión cuantizada en formato GGUF del modelo **TinmanLabSL/gemma4-companion-merged**, un modelo de lenguaje diseñado específicamente para conversación, roleplay y compañía virtual. El modelo base se inscribe en la familia **Gemma 4** de Google DeepMind, la cuarta generación de modelos abiertos de la compañía, construida a partir de la misma tecnología que impulsa Gemini. Con aproximadamente 7.463 millones de parámetros (7,5B), este modelo se presenta como una opción "sin censura" (uncensored) para aplicaciones conversacionales, lo que lo diferencia de otros modelos más restrictivos.

La relevancia de esta ficha radica en que ofrece a desarrolladores e investigadores una alternativa de código abierto con licencia Apache 2.0, cuantizada en varios niveles (BF16, Q8_0, Q4_K_M) para adaptarse a distintos presupuestos de hardware. Al estar basado en Gemma 4, hereda las capacidades de razonamiento y generación de texto de la familia, aunque la información pública disponible sobre el entrenamiento específico del modelo companion es limitada. Su pipeline se etiqueta como "any-to-any", lo que sugiere posibles capacidades multimodales, aunque no se detallan en la documentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Gemma 4, probablemente transformer denso) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base **TinmanLabSL/gemma4-companion-merged** en la documentación pública consultada. Se sabe que pertenece a la familia Gemma 4 de Google DeepMind, que según la página oficial introduce variantes "Thinking" entrenadas para razonamiento explícito, pero no se confirma si este modelo companion incorpora dicha característica. El proceso de entrenamiento específico (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no está documentado en la ficha del repositorio.

La versión GGUF aquí descrita es una cuantización del modelo base, realizada por el autor Bedhoy, que convierte los pesos originales (presumiblemente en safetensors) a formato GGUF para facilitar su ejecución con herramientas como llama.cpp, LM Studio o GPT4All. Se ofrecen tres niveles de cuantización: BF16 (sin pérdida), Q8_0 (casi sin pérdida) y Q4_K_M (recomendado para la mayoría de usuarios por su equilibrio entre tamaño y calidad).

## Capacidades

- **Conversación y roleplay**: el modelo está diseñado para mantener diálogos largos y coherentes en contextos de compañía, rol y simulación de personajes.
- **Generación de texto creativo**: puede producir historias, diálogos, descripciones y escenas narrativas, adecuado para escritura asistida.
- **Contenido sin censura**: se describe explícitamente como "uncensored", lo que permite generar respuestas que otros modelos rechazarían por políticas de seguridad. Esto amplía el rango de aplicaciones, pero conlleva riesgos.
- **Multimodalidad potencial**: el pipeline se etiqueta como "any-to-any", lo que sugiere que el modelo base podría manejar entradas y salidas de diferentes modalidades (texto, imagen, audio), aunque no se especifican detalles en la documentación.
- **No se documentan capacidades de tool calling, function calling, ni agentes multi-paso** en la información disponible.

## Casos de uso

- **Atención al cliente automatizada**: aunque no se especifica la longitud de contexto, el modelo puede gestionar conversaciones multi-turno en entornos de soporte, ofreciendo respuestas empáticas y personalizadas gracias a su entrenamiento orientado a compañía.
- **Juegos de rol por texto**: los desarrolladores de juegos pueden integrar el modelo como motor de personajes no jugadores (NPC) que responden de forma coherente y creativa a las acciones del jugador, sin las restricciones típicas de los modelos censurados.
- **Escritura creativa asistida**: autores y guionistas pueden usarlo para generar borradores de diálogos, explorar tramas alternativas o desarrollar personajes, aprovechando su capacidad de generar texto fluido y sin filtros.
- **Simulación de personajes en entretenimiento**: en plataformas de streaming o redes sociales, el modelo puede alimentar bots que interpretan personajes ficticios o históricos con una personalidad definida.
- **Prototipado de asistentes conversacionales**: los equipos de producto pueden crear prototipos rápidos de chatbots para validar conceptos sin preocuparse por políticas de contenido restrictivas, aunque deberán implementar sus propios filtros de seguridad.
- **Investigación en IA conversacional**: el modelo sirve como objeto de estudio para analizar comportamientos de modelos sin censura, sesgos latentes y estrategias de mitigación, en entornos académicos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo específico. Se recomienda consultar la documentación de Gemma 4 para referencias generales de rendimiento de la familia, pero no se pueden atribuir números concretos a esta variante companion.

## Requisitos de hardware

- **Q4_K_M (5.0 GB)**: puede ejecutarse en GPUs de consumo con al menos 6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060 o AMD RX 7600. También es viable en CPU con 8 GB de RAM libre, aunque con mayor latencia.
- **Q8_0 (7.5 GB)**: requiere al menos 8-10 GB de VRAM, como RTX 3080, RTX 4070 o RTX 4080. En CPU se necesitan 12 GB de RAM.
- **BF16 (14 GB)**: necesita 16 GB o más de VRAM, como RTX 4090, A100, H100 o GPUs de datacenter. En CPU, se requieren 20+ GB de RAM.
- **Opciones de despliegue**: compatible con llama.cpp, LM Studio, GPT4All y, potencialmente, Ollama si se convierte el GGUF al formato adecuado. También puede usarse con servidores de inferencia como vLLM si se convierten los pesos a safetensors, aunque el repositorio solo ofrece GGUF.
- **Latencia y throughput**: no disponible. Dependerá del hardware, la cuantización y la longitud de contexto utilizada.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. Dado que el modelo base se basa en Gemma 4, podría compararse con Gemma 3 4B o Llama 3.1 8B, pero no hay datos de rendimiento específicos para esta variante companion. La tabla siguiente es orientativa y se basa en características públicas generales, no en benchmarks verificados:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Tinman-gemma4-companion (este) | 7,5B | No disponible | Apache 2.0 | GGUF |
| Gemma 3 4B | 4B | 128K (aprox.) | Gemma Terms | Safetensors, GGUF |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 License | Safetensors, GGUF |

Se recomienda realizar pruebas propias para evaluar la idoneidad en cada caso de uso.

## Limitaciones y advertencias

- **Contenido sin censura**: al ser "uncensored", el modelo puede generar contenido ofensivo, sexual, violento o ilegal. No se recomienda su uso en producción sin un sistema de moderación robusto.
- **Sesgos y alucinaciones**: no se ha documentado ningún análisis de sesgos específico. Como todo modelo de lenguaje, es susceptible de alucinar hechos o reflejar sesgos presentes en sus datos de entrenamiento.
- **Longitud de contexto desconocida**: al no especificarse, no se puede garantizar un rendimiento adecuado en tareas que requieran contexto largo (más de 8K tokens, por ejemplo).
- **Información de entrenamiento limitada**: la falta de detalles sobre el dataset y el proceso de alineación dificulta evaluar su fiabilidad en dominios especializados.
- **Licencia**: aunque la licencia es Apache 2.0, el modelo base deriva de Gemma 4, cuyos términos de uso pueden imponer restricciones adicionales. Se recomienda revisar la licencia de Gemma 4 antes de un despliegue comercial.
- **Soporte de herramientas**: no se documenta soporte para tool calling, lo que limita su integración en pipelines de agentes que requieran interacción con APIs externas.

## Enlaces

- [HuggingFace - Bedhoy/Tinman-gemma4-companion-gguf](https://huggingface.co/Bedhoy/Tinman-gemma4-companion-gguf)
- [HuggingFace - Modelo base TinmanLabSL/gemma4-companion-merged](https://huggingface.co/TinmanLabSL/gemma4-companion-merged)
- [HuggingFace - Repo GGUF de TinmanLabSL (referencia)](https://huggingface.co/TinmanLabSL/gemma4-companion-gguf)
- [Google DeepMind - Gemma 4](https://deepmind.google/models/gemma/gemma-4/)
- [Google DeepMind - Gemma (página general)](https://deepmind.google/models/gemma/)
