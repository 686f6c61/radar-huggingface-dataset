# mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-Q4_K_M-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF en formato Q4_K_M del modelo `mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-BF16`, una versión modificada del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B. El autor, mlasli, ha aplicado la técnica de abliteration (mediante la herramienta Heretic) para eliminar la dirección de rechazo del modelo original, dando como resultado un modelo que no muestra negativas ante peticiones potencialmente sensibles. La cuantización reduce el tamaño a 24,3 GB, lo que permite su ejecución local en hardware de gama media.

El modelo base es un híbrido Mamba-MoE con 31,6 mil millones de parámetros totales y 3 mil millones activos, diseñado por NVIDIA para ofrecer un equilibrio entre rendimiento y eficiencia. Esta versión cuantizada está pensada para usuarios que deseen experimentar con un modelo sin censura en entornos locales, especialmente para tareas de roleplay, generación de texto creativo o investigación sobre alineación. La arquitectura `nemotron_h_moe` requiere una versión reciente de llama.cpp (build b10326 o superior).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h_moe (híbrido Mamba-MoE) |
| Parametros totales | 31.577.940.288 (31,6B) |
| Parametros activos | 3B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única disponible) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | nvidia-open-model-license |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original de NVIDIA, `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, emplea una arquitectura híbrida que combina capas Mamba (state space model) con un mecanismo de mezcla de expertos (MoE). Esta combinación busca reducir el coste computacional en inferencia manteniendo una alta calidad de generación. Los detalles específicos del entrenamiento (número de tokens, composición del dataset, técnicas de alineación) no se han publicado en la información disponible.

La versión de mlasli aplica abliteration, un proceso que identifica y elimina la dirección de rechazo en el espacio de activaciones del modelo. Esto se realiza mediante la herramienta Heretic, que modifica los pesos del modelo para que no genere respuestas de negativa ante instrucciones que el modelo original consideraría inapropiadas. La cuantización posterior a Q4_K_M reduce la precisión de los pesos para disminuir el tamaño del archivo, con una pérdida mínima de calidad según las pruebas del autor.

## Capacidades

- Generación de texto conversacional y narrativo, especialmente orientado a roleplay.
- Soporte multilingüe para inglés, español, francés, alemán, italiano y japonés.
- Alta tasa de cumplimiento de instrucciones (100% en la evaluación del autor) gracias a la abliteration.
- Sin mecanismos de rechazo visibles, lo que permite respuestas directas a peticiones que otros modelos censurarían.
- No se especifican capacidades de tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- No se menciona soporte de visión, audio u otras modalidades.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo puede mantener conversaciones largas y coherentes en múltiples idiomas, ideal para juegos de rol textuales o escritura colaborativa de ficción.
- Asistente conversacional sin restricciones: al no presentar rechazos, puede responder a preguntas sobre temas controvertidos o hipotéticos que otros modelos evitarían, útil para debates o exploración de ideas.
- Generación de contenido creativo: escritura de guiones, diálogos, poesía o historias con un tono libre y sin autocensura, aprovechando su capacidad multilingüe.
- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo sin capas de rechazo, comparando respuestas con el modelo original para analizar el impacto de la abliteration.
- Despliegue local en hardware de gama media: con 24,3 GB de tamaño, puede ejecutarse en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) o en CPU con suficiente RAM, usando llama.cpp u Ollama.
- Experimentación con cuantizaciones GGUF: sirve como referencia para evaluar la calidad de Q4_K_M en arquitecturas híbridas Mamba-MoE, comparando con otras cuantizaciones si estuvieran disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta una evaluación propia sobre 200 pruebas de comportamiento dañino, con los siguientes resultados:

| Metrica | Valor |
|---|---|
| Refusals | 0% |
| Compliance | 100% |
| KL Divergence | 0.0397 |
| Trials | 200 |

Esta evaluación se realizó sobre el modelo BF16 fusionado, no sobre la cuantización GGUF, y utiliza un detector automático de palabras clave que puede generar falsos positivos. No hay datos de rendimiento en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- Tamaño del archivo: 24,3 GB, por lo que se necesita al menos esa cantidad de VRAM o RAM para cargar el modelo, más un margen para el contexto y los cálculos.
- GPU recomendadas: tarjetas con 24 GB de VRAM o más, como RTX 3090, RTX 4090, A5000, o GPUs profesionales. También puede ejecutarse en CPU con 32 GB de RAM o más, aunque con mayor latencia.
- No cabe en GPUs de consumo con 8-12 GB de VRAM (RTX 3060, 3070, 4060) sin técnicas de offloading parcial.
- Opciones de despliegue: llama.cpp (build b10326+), Ollama (si soporta la arquitectura `nemotron_h_moe`), o cualquier backend compatible con GGUF.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090, se espera una velocidad de generación de entre 20 y 40 tokens por segundo para un modelo de 3B activos, pero esto es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo base de NVIDIA (BF16) es la referencia directa, pero no se han publicado comparaciones con alternativas como Llama 3.1 8B, Mistral 7B o Qwen 2.5 7B en términos de rendimiento o calidad. La única diferencia notable frente al modelo original es la eliminación de la dirección de rechazo y la cuantización, que reduce la precisión de los pesos.

## Limitaciones y advertencias

- La abliteration elimina por completo los mecanismos de seguridad del modelo, lo que puede generar contenido ofensivo, ilegal o peligroso. El propio autor advierte que debe usarse con responsabilidad y conforme a las leyes locales.
- La licencia NVIDIA Open Model License impone restricciones de uso comercial y redistribución. Es necesario revisar los términos completos antes de utilizar el modelo en producción.
- Solo se ofrece la cuantización Q4_K_M; no hay otras opciones de precisión (Q5, Q8, etc.) en este repositorio.
- La longitud de contexto no se ha especificado, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- La arquitectura `nemotron_h_moe` es relativamente nueva y requiere versiones recientes de llama.cpp; puede no ser compatible con otros frameworks como vLLM o TGI.
- No se han publicado benchmarks estándar, por lo que el rendimiento real en tareas de razonamiento, código o matemáticas es desconocido.
- El modelo fue creado en agosto de 2026, por lo que la información puede estar desactualizada o el modelo puede haber sido retirado.

## Enlaces

- [Repositorio GGUF en HuggingFace](https://huggingface.co/mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-Q4_K_M-GGUF)
- [Modelo BF16 base (abliterated)](https://huggingface.co/mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-BF16)
- [Modelo original de NVIDIA](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16)
- [Herramienta Heretic (GitHub)](https://github.com/mlabonne/heretic-llm)
- [Licencia NVIDIA Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/)
