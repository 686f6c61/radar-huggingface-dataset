# EstevaoNaval/gemma-4-E4B-it-GGUF

## Resumen

El modelo `gemma-4-E4B-it-GGUF` es una cuantización en formato GGUF del modelo Gemma 4 E4B, desarrollado por Google DeepMind y publicado originalmente en marzo de 2026. Esta versión concreta, subida por el usuario EstevaoNaval, está pensada para su ejecución local en CPU y GPU mediante herramientas como llama.cpp, Ollama o LM Studio. El nombre "E4B" indica que se trata de una variante con 4 mil millones de parámetros activos, aunque el archivo safetensors original contiene 7.518.069.290 parámetros totales, lo que sugiere una arquitectura de mezcla de expertos (MoE) con activación parcial.

La relevancia de este modelo radica en que ofrece capacidades de razonamiento avanzado, comprensión multimodal y un modo de pensamiento ("Thinking Mode") en un tamaño que cabe en GPUs de consumo con 8 GB de VRAM, según las fuentes consultadas. La licencia Apache-2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para desarrolladores que necesitan un modelo local potente y legalmente flexible. La cuantización GGUF reduce el tamaño del archivo a aproximadamente 5 GB, facilitando su distribución y despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 4B parámetros activos (inferido del nombre y del total de parámetros) |
| Parametros totales | 7.518.069.290 (según safetensors original) |
| Parametros activos | 4.000.000.000 (aproximado, según denominación E4B) |
| Longitud de contexto | Hasta 256K tokens (según fuentes web sobre Gemma 4) |
| Tipos de cuantizacion | GGUF (variantes Q4_K_M, Q5_K_M, Q8_0, entre otras, no especificadas en la ficha) |
| Idiomas soportados | No disponible (la model card no los especifica; Gemma 4 soporta múltiples idiomas, pero no se confirma para esta versión) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

La arquitectura de Gemma 4 E4B se basa en un transformer con mezcla de expertos (MoE), donde solo se activan 4.000 millones de parámetros por token de un total de 7.518 millones. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional, reduciendo el coste de inferencia sin sacrificar demasiada calidad. Según la información disponible, el modelo incorpora capacidades multimodales (entrada de imagen y texto) y un modo de razonamiento explícito ("Thinking Mode") que genera cadenas de pensamiento antes de responder.

Los detalles sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La model card del repositorio está vacía, y las fuentes web solo mencionan que el modelo fue lanzado por Google DeepMind el 31 de marzo de 2026, con un enfoque en razonamiento avanzado, flujos de trabajo agénticos y despliegue eficiente en dispositivos de borde. No se han publicado detalles técnicos sobre el proceso de entrenamiento en los materiales consultados.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo problemas de lógica y matemáticas.
- Comprensión multimodal: acepta entrada de imágenes junto con texto (según fuentes web sobre Gemma 4).
- Modo de pensamiento ("Thinking Mode") que genera razonamiento paso a paso antes de dar la respuesta final.
- Soporte para flujos de trabajo agénticos y llamadas a herramientas (tool calling), aunque no se confirma explícitamente en la documentación disponible.
- Capacidades multilingües: no confirmadas para esta versión específica, pero el modelo base de Gemma 4 soporta múltiples idiomas.
- Ejecución local eficiente gracias a la cuantización GGUF, compatible con CPU y GPU de consumo.

## Casos de uso

- Asistente de programación local: el modelo puede generar, explicar y depurar código en múltiples lenguajes, ejecutándose en una estación de trabajo con GPU de 8 GB. Su modo de razonamiento ayuda a descomponer problemas complejos de desarrollo.
- Análisis de documentos con imágenes: al aceptar entrada multimodal, puede procesar capturas de pantalla, diagramas o gráficos junto con texto, útil para extraer información de informes técnicos o manuales.
- Chatbot de atención al cliente con contexto largo: con hasta 256K tokens de contexto, puede mantener conversaciones extensas recordando detalles de interacciones previas, adecuado para soporte técnico especializado.
- Automatización de tareas agénticas: su capacidad para razonamiento multi-paso y posible tool calling permite construir agentes que consultan APIs, buscan información o ejecutan acciones en entornos controlados.
- Educación y tutoría: el modo de pensamiento permite explicar razonamientos paso a paso, útil para plataformas de aprendizaje automático o asistentes de estudio.
- Prototipado rápido de aplicaciones de IA: al ser un modelo GGUF con licencia Apache-2.0, se puede integrar en entornos de desarrollo sin costes de licencia, ideal para pruebas de concepto y MVPs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas, y las fuentes web consultadas no proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados. Se recomienda consultar la documentación oficial de Google DeepMind para obtener datos de rendimiento comparativos.

## Requisitos de hardware

- VRAM estimada: mínimo 8 GB para la cuantización completa (según gemma4.dev). Cuantizaciones más agresivas (Q4_K_M) pueden funcionar con 6 GB, aunque no se confirma.
- GPU recomendadas: NVIDIA RTX 3060/4060 (8 GB), RTX 4070/4080, o GPUs de datacenter como A10 o L4. También compatible con Apple Silicon (M1/M2/M3) mediante llama.cpp.
- Ejecución en CPU: posible con cuantizaciones bajas (Q4_K_M) y suficiente RAM (16 GB o más), aunque con latencia mayor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponibles. Dependen de la cuantización, el hardware y la longitud de la secuencia. En una RTX 4090 se esperan velocidades de decodificación de 50-100 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 E4B (GGUF) | 7.5B totales, 4B activos | Hasta 256K | Apache-2.0 | GGUF | Multimodal, Thinking Mode |
| Llama 3.2 3B (GGUF) | 3.2B densos | 128K | Llama 3.2 | GGUF | Solo texto, sin multimodal |
| Qwen 2.5 7B (GGUF) | 7.6B densos | 128K | Apache-2.0 | GGUF | Solo texto, buen rendimiento en código |
| Mistral 7B (GGUF) | 7.3B densos | 32K | Apache-2.0 | GGUF | Solo texto, ampliamente probado |

La comparativa se basa en modelos de tamaño similar disponibles en formato GGUF. Gemma 4 E4B destaca por su naturaleza multimodal y su modo de razonamiento explícito, aunque los datos de rendimiento no están disponibles para una comparación cuantitativa.

## Limitaciones y advertencias

- La model card del repositorio está vacía, por lo que no se dispone de información oficial sobre sesgos, alucinaciones o limitaciones específicas de esta cuantización.
- El modelo base Gemma 4 puede presentar sesgos heredados de sus datos de entrenamiento, aunque Google DeepMind afirma aplicar protocolos de seguridad rigurosos.
- Riesgo de alucinación en tareas de razonamiento complejo o cuando se le pide información factual no presente en sus datos.
- La cuantización GGUF puede degradar ligeramente la calidad de salida en comparación con los pesos originales en safetensors, especialmente en cuantizaciones agresivas.
- El soporte de tool calling y agentes no está confirmado explícitamente para esta versión; se recomienda verificar antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar si el modelo base tiene restricciones adicionales (no se han encontrado indicios de ello).
- No se dispone de información sobre la procedencia de los datos de entrenamiento ni sobre posibles sesgos geográficos o culturales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EstevaoNaval/gemma-4-E4B-it-GGUF
- Repositorio alternativo (ente-ai): https://huggingface.co/ente-ai/gemma-4-E4B-it-GGUF
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guía de Gemma 4 E4B (gemma4.dev): https://gemma4.dev/models/gemma-4-e4b
- Guía completa de Gemma 4 (Comet): https://www.cometapi.com/google-releases-gemma-4-open-source-model/
- Página de descarga del modelo GGUF (local-ai-zone): https://local-ai-zone.github.io/models/google-gemma-4-e4b-it.html
