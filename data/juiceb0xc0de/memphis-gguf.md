# juiceb0xc0de/MEMPHIS-GGUF

## Resumen

MEMPHIS-GGUF es la versión cuantizada en formato GGUF del modelo darkc0de/MEMPHIS, publicada por el usuario juiceb0xc0de. Se trata de una conversión de los pesos originales en safetensors a F16 y su posterior cuantización con llama.cpp (versión 1.0.0-dev, build 12366, commit 31953bcf7) mediante el Space BYOGGUF del mismo autor. El repositorio ofrece dos variantes: Q8_0 (26,63 GB) y Q4_K_M (15,59 GB), pensadas para ejecución local con llama.cpp y herramientas compatibles.

El modelo base cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), según los datos de safetensors del repositorio. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque la model card remite a la ficha del modelo original para los detalles de licencia y descripción funcional, que no se incluyen en esta conversión.

La relevancia de esta publicación radica en que permite desplegar un modelo de casi 27B parámetros en hardware de consumo mediante cuantización Q4_K_M, reduciendo el peso a 15,59 GB. No obstante, la información pública disponible es muy limitada: no se detallan arquitectura, datos de entrenamiento, idiomas ni resultados de benchmarks, por lo que la evaluación técnica debe completarse consultando el repositorio del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 26.895.998.464 (≈26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base darkc0de/MEMPHIS en la documentación proporcionada. La model card de esta conversión no describe si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o cualquier otra variante, ni tampoco detalla el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica concreta es el proceso de conversión: los pesos originales en safetensors se convirtieron a F16 y se cuantizaron con llama.cpp 1.0.0-dev (build 12366, commit 31953bcf7) dentro del Space BYOGGUF. El repositorio tiene un tamaño de 45,3 GB, coherente con la suma de las dos variantes GGUF publicadas más los metadatos.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: incluye la etiqueta `endpoints_compatible`, lo que sugiere que puede servirse mediante la infraestructura de endpoints de Hugging Face.
- Ejecución con llama.cpp: los ficheros GGUF permiten inferencia local con `llama-server` y otras herramientas del ecosistema llama.cpp.
- Capacidades específicas (razonamiento, código, matemáticas, visión, tool calling, agentes o multilingüismo): no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local: con la variante Q4_K_M (15,59 GB) se puede desplegar un chatbot multi-turno en una estación de trabajo con GPU de consumo, usando `llama-server -hf juiceb0xc0de/MEMPHIS-GGUF:Q4_K_M` sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones de diálogo: la etiqueta `conversational` y la compatibilidad con endpoints permiten integrar el modelo en un backend de pruebas para validar flujos de conversación antes de escalar a infraestructura mayor.
- Evaluación comparativa de cuantizaciones: al ofrecer Q8_0 y Q4_K_M del mismo modelo, permite medir la degradación de calidad y el ahorro de memoria entre ambas variantes en tareas concretas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp, los datos de los usuarios no salen del equipo, lo que encaja en escenarios con restricciones de confidencialidad.
- Investigación sobre cuantización: el repositorio documenta el proceso exacto (versión de llama.cpp, commit, Space utilizado), lo que facilita reproducir la conversión y estudiar el impacto de Q4_K_M frente a Q8_0.
- Servicio de inferencia autoalojado: mediante llama.cpp se puede exponer una API compatible con el formato de chat en un servidor propio para aplicaciones internas de la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: aproximadamente 26,63 GB solo para los pesos, más overhead de contexto y caché KV; requiere GPU de 32 GB o superior (A100 40 GB, H100, RTX A6000) o bien CPU con suficiente RAM.
- VRAM estimada para Q4_K_M: aproximadamente 15,59 GB para los pesos, más overhead; encaja en GPUs de 24 GB como la RTX 4090 o la RTX 3090, con margen limitado para contexto.
- GPU de consumo: Q4_K_M es la variante viable en GPUs consumer de gama alta (24 GB); Q8_0 no cabe en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp (llama-server, según el ejemplo de la model card), y por extensión herramientas compatibles con GGUF como Ollama o interfaces basadas en llama.cpp. No se confirma soporte de vLLM o TGI para estos ficheros.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: la model card menciona ejecución en "a Blackwell", en referencia a GPUs NVIDIA Blackwell, para el Space BYOGGUF.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de arquitectura, contexto ni rendimiento del modelo base que permitan establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información técnica insuficiente: no se documentan arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar el modelo con rigor antes de usarlo en producción.
- Sesgos y alucinaciones: no se han publicado análisis al respecto; al tratarse de un modelo conversacional, cabe esperar riesgos habituales de alucinación, pero no hay datos que los cuantifiquen.
- Licencia: se declara Apache 2.0, pero la model card remite a la ficha del modelo original para los términos exactos; conviene verificar esa ficha antes de un uso comercial.
- Mantenimiento: el repositorio tiene 0 likes y unas 100 descargas, y procede de un usuario individual, no de una organización consolidada; el soporte y las actualizaciones no están garantizados.
- Cuantización: Q4_K_M introduce pérdida de precisión respecto a los pesos originales; no se han publicado evaluaciones del impacto en calidad.
- Contexto y memoria: con Q4_K_M en GPUs de 24 GB el margen para ventanas de contexto largas es reducido, y la longitud de contexto del modelo no está documentada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/juiceb0xc0de/MEMPHIS-GGUF
- Modelo base: https://huggingface.co/darkc0de/MEMPHIS
- Space BYOGGUF: https://huggingface.co/spaces/juiceb0xc0de/BYOGGUF
- Fichero Q8_0: https://huggingface.co/juiceb0xc0de/MEMPHIS-GGUF/blob/main/MEMPHIS-Q8_0.gguf
- Fichero Q4_K_M: https://huggingface.co/juiceb0xc0de/MEMPHIS-GGUF/blob/main/MEMPHIS-Q4_K_M.gguf
