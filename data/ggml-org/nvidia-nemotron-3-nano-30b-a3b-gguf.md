# ggml-org/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B es un modelo de lenguaje de tipo mixto de expertos (MoE) desarrollado por NVIDIA, distribuido originalmente en formato BF16 y empaquetado en GGUF por el equipo de ggml-org para su uso con llama.cpp y herramientas compatibles. Con 31.577.940.288 parámetros totales y un esquema de activación reducida (la nomenclatura "A3B" indica aproximadamente 3 mil millones de parámetros activos por token), está disenado para ofrecer un equilibrio entre capacidad de razonamiento y coste computacional en inferencia.

Este repositorio concreto no contiene los pesos originales, sino una conversión automática a formato GGUF realizada con la herramienta ggml-org/convert, lo que permite ejecutar el modelo en CPU, GPU de consumo y entornos con memoria limitada mediante cuantización. Es relevante para desarrolladores que quieren desplegar un modelo de gran tamano con activación dispersa sin depender de infraestructura de datacenter, aunque la model card del repositorio es mínima y no documenta detalles de entrenamiento ni resultados de evaluación.

La ficha se basa exclusivamente en los metadatos disponibles en Hugging Face y en la model card del repositorio GGUF; cualquier dato no presente en esa información se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixto de expertos (MoE), segun nomenclatura A3B del modelo base |
| Parametros totales | 31.577.940.288 |
| Parametros activos | Aproximadamente 3 mil millones (indicado por el sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no especificadas en la model card) |
| Idiomas soportados | no disponible |
| Licencia | other (no se detalla el texto de la licencia en la informacion proporcionada) |
| Formato de pesos | GGUF (repo de 119,2 GB); modelo base en BF16 |

## Arquitectura y entrenamiento

El modelo base es nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, una arquitectura de mezcla de expertos con 31.577.940.288 parámetros totales y una activación de aproximadamente 3 mil millones de parámetros por token, segun la convención de nombres A3B. Esta configuracion permite que cada paso de inferencia active solo una fracción de la red, reduciendo el coste computacional frente a un modelo denso del mismo tamano total, a cambio de requerir memoria para alojar todos los expertos.

No se dispone de informacion sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la documentacion proporcionada. La model card del repositorio GGUF solo indica que la conversión se realiza automáticamente con ggml-org/convert y que queda pendiente anadir soporte MTP (multi-token prediction), lo que sugiere que el modelo original contempla esa capacidad pero la conversión actual no la incluye.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como conversational y text-generation.
- Razonamiento y generación de código: capacidades esperables en un modelo de esta familia, aunque no documentadas explícitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la documentacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están listados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local mediante llama.cpp y el comando `llama serve -hf ggml-org/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF`.

## Casos de uso

- Despliegue local en estaciones de trabajo: al estar en formato GGUF, el modelo puede ejecutarse con llama.cpp en equipos con GPU de consumo o incluso CPU, usando cuantizaciones que reducen el peso de los 31,6 mil millones de parámetros totales.
- Prototipado de asistentes conversacionales: la etiqueta conversational y la integración con `llama serve` permiten levantar un endpoint compatible con la API de OpenAI para pruebas de chat multi-turno.
- Experimentación con arquitecturas MoE: investigadores pueden estudiar el comportamiento de un modelo con activación de aproximadamente 3 mil millones de parámetros por token sin necesidad de clústeres de GPU de gran memoria.
- Evaluación comparativa de cuantizaciones: el repositorio GGUF facilita medir la degradación de calidad y el ahorro de memoria entre distintas variantes cuantizadas del mismo modelo base.
- Integración en pipelines de generación de texto por lotes: mediante llama.cpp se puede procesar texto en servidores con recursos moderados, aprovechando la activación dispersa para mejorar el throughput.
- Educación y divulgación: sirve como ejemplo práctico de conversión de un modelo BF16 de NVIDIA a GGUF y de ejecución local con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; como referencia, los 31,6 mil millones de parámetros en BF16 ocuparían aproximadamente 63 GB, mientras que una cuantización de 4 bits reduciría el peso a unos 16-18 GB, y una de 8 bits a unos 32 GB (estimaciones a partir del recuento de parámetros, no datos del autor).
- GPU recomendadas: no especificadas en la model card. Por tamano, cabría esperar uso en GPU de consumo de gama alta con cuantización agresiva y en GPU profesionales (A100, H100) para precisiones mayores.
- ¿Cabe en GPU de consumo? Probablemente con cuantizaciones de 4 bits en GPU con 24 GB o más, aunque no está confirmado por el autor.
- Opciones de despliegue: llama.cpp, la aplicación Llama (https://llama.app) y `llama serve`; compatibilidad con Ollama u otros runners GGUF no está documentada explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-30B-A3B (este repo) | 31,58 mil millones | ~3 mil millones | no disponible | other | GGUF |
| Modelo base nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,58 mil millones | ~3 mil millones | no disponible | other | BF16 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con otros modelos MoE de tamano similar en terminos de rendimiento o contexto.

## Limitaciones y advertencias

- La model card del repositorio es mínima: no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinación inherente a los modelos de lenguaje; no cuantificado por el autor.
- Idiomas soportados no especificados, por lo que el rendimiento en castellano no está garantizado.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con ventanas largas.
- Licencia "other": es imprescindible revisar los términos del modelo base nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 antes de cualquier uso comercial.
- La conversión es automática (ggml-org/convert) y la propia model card indica que falta anadir MTP, por lo que pueden existir diferencias funcionales respecto al modelo original.
- El repo ocupa 119,2 GB, lo que exige espacio en disco considerable aunque se descargue una sola cuantización.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta de conversión: https://github.com/ggml-org/convert
- Aplicación Llama: https://llama.app
