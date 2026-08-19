# lactroiii/Muse-Glimmer-30B-GGUF

## Resumen

Muse Glimmer es un modelo de lenguaje causal de 30 000 millones de parámetros (27 854 794 240 parámetros reales en pesos) desarrollado por Meta Superintelligence Lab y publicado bajo licencia Apache 2.0. Es una destilación de Muse Spark, diseñado específicamente para tareas de agente autónomo en hardware de consumo, integrando razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal de imágenes y recuperación ante fallos en un único modelo que puede ejecutarse localmente sin depender de infraestructura en la nube.

Este repositorio concreto, mantenido por el usuario lactroiii, contiene conversiones GGUF del modelo base para su uso con llama.cpp. Incluye dos builds cuantizados del modelo de texto (Q4_K_M de 16,8 GB y Q4_K_XL de 19,7 GB), un encoder de percepción para entrada de imágenes (mmproj, 1,4 GB) y un drafter DFlash para decodificación especulativa (1,6 GB). El modelo soporta una ventana de contexto de hasta 131 072 tokens y separa el razonamiento interno del contenido final en la respuesta.

La relevancia actual del modelo radica en que permite ejecutar agentes multimodales con razonamiento explícito y tool calling en una única GPU de gama alta para consumidores, algo que hasta ahora requería múltiples GPUs o servicios en la nube. Es una opción atractiva para desarrolladores que necesitan autonomía local, privacidad de datos y coste cero por inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con perception encoder (arquitectura Muse Glimmer, requiere llama.cpp b10353 o superior) |
| Parametros totales | 27 854 794 240 (comercializado como 30B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131 072 tokens (según configuración de ejemplo en llama-server) |
| Tipos de cuantizacion | Q4_K_M (17 GB) y Q4_K_XL (19,7 GB) para el modelo de texto; Q4_K_M para mmproj y drafter |
| Idiomas soportados | No disponible (no se especifican en la documentación proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el repositorio base) |

## Arquitectura y entrenamiento

La arquitectura de Muse Glimmer es un modelo de lenguaje causal con un encoder de percepción dedicado para entrada de imágenes. El modelo fue destilado de Muse Spark, lo que implica que hereda capacidades de razonamiento y tool use del modelo profesor pero con un tamaño reducido para facilitar su ejecución en hardware de consumo. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

La innovación técnica principal documentada es el soporte de decodificación especulativa mediante un drafter DFlash opcional, que acelera la generación sin cambiar los resultados. Además, el modelo integra un mecanismo de razonamiento explícito que separa el "pensamiento" interno (entregado en el campo `reasoning_content`) del contenido final de la respuesta. El encoder de percepción (mmproj) permite procesar imágenes junto con texto, lo que lo convierte en un modelo multimodal completo.

## Capacidades

- Generación de texto con razonamiento multi-paso explícito: el modelo produce una traza de pensamiento interna separada del contenido final, visible en el campo `reasoning_content` de la API.
- Comprensión multimodal de imágenes: mediante el encoder de percepción `mmproj`, puede describir y analizar imágenes (requiere `llama-mtmd-cli` o `llama-server` con `--mmproj`).
- Uso fiable de herramientas (tool calling / function calling): integrado en el diseño del modelo para tareas de agente.
- Ejecución de agentes autónomos: diseñado para flujos de trabajo de larga duración con recuperación ante fallos.
- Decodificación especulativa: soporte opcional del drafter DFlash para acelerar la generación manteniendo los mismos resultados.
- Compatibilidad con la API de OpenAI: a través de `llama-server` se expone un endpoint `/v1/chat/completions` compatible.
- Capacidades multilingües: no documentadas en la información proporcionada.

## Casos de uso

- Agente autónomo local de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 131 072 tokens) y usar tool calling para consultar bases de datos o sistemas internos, todo ello sin conexión a internet, lo que garantiza privacidad de los datos del cliente.
- Asistente de análisis de imágenes para soporte técnico: gracias al encoder de percepción, puede recibir capturas de pantalla o fotos de un problema y razonar sobre ellas para ofrecer diagnósticos, combinando visión y razonamiento multi-paso en un solo flujo.
- Generación de código con verificación: el razonamiento explícito permite al modelo planificar la solución antes de escribir el código, y su tool calling puede integrarse en pipelines de CI/CD para generar tests o parches automáticamente.
- Automatización de tareas de oficina: puede actuar como agente que lee documentos (texto e imágenes), extrae información, rellena formularios y ejecuta acciones mediante herramientas, todo localmente en una workstation con 24 GB de VRAM.
- Investigación académica reproducible: al ser Apache 2.0 y ejecutarse localmente, permite a investigadores auditar el razonamiento del modelo en tareas de razonamiento matemático o lógico sin depender de APIs externas.
- Desarrollo de asistentes personales privados: un asistente que mantiene memoria de contexto largo, procesa fotos y ejecuta comandos del sistema, desplegado en un PC de sobremesa con RTX 4090, sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del modelo no incluye cifras de MMLU, HumanEval, GSM8K u otras evaluaciones estándar. Tampoco se proporcionan comparativas cuantitativas con modelos similares. Se recomienda consultar el repositorio base `meta-models/Muse-Glimmer-30B` para futuras actualizaciones con datos de evaluación.

## Requisitos de hardware

- Build Q4_K_M de 17 GB: requiere aproximadamente 17 GB de VRAM solo texto, 19 GB con visión y 20 GB con visión y drafter. Cabe en GPUs de 24 GB como RTX 4090, RTX 3090, A5000 o similares.
- Build Q4_K_XL de 19,7 GB: requiere aproximadamente 20 GB solo texto, 22 GB con visión y 23 GB con visión y drafter. Recomendado para GPUs de 32 GB como A6000 o V100 32 GB.
- No se especifican requisitos de RAM del sistema, pero para contexto de 131 072 tokens se recomienda al menos 32 GB de RAM total.
- Despliegue exclusivamente con llama.cpp versión b10353 o superior (llama-cli, llama-server, llama-mtmd-cli). No es compatible con versiones anteriores.
- Soporte de GPU NVIDIA con CUDA, Apple Metal (por defecto) y CPU puro (compilando sin `-DGGML_CUDA=ON`).
- Throughput y latencia no documentados en la información disponible; la decodificación especulativa con DFlash puede acelerar la generación sin cambiar los resultados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (30B multimodales con tool calling). El modelo base Muse Spark, del que deriva Muse Glimmer, no tiene datos públicos de rendimiento en la documentación consultada. Se recomienda comparar directamente con otros modelos abiertos de 30B como Llama 3.1 30B (si existiera) o modelos multimodales como LLaVA-NeXT, pero no hay datos de benchmarks disponibles para hacer una comparación objetiva.

## Limitaciones y advertencias

- Requiere obligatoriamente llama.cpp b10353 o superior; las versiones anteriores no reconocen la arquitectura y rechazan cargar los archivos.
- Solo se publican dos cuantizaciones Q4 (K_M y K_XL); no hay opciones de precisión superior en GGUF. Para bf16 completo hay que acudir al repositorio base.
- Los idiomas soportados no están documentados, por lo que el rendimiento en idiomas distintos del inglés es incierto.
- El modelo es una destilación de Muse Spark, por lo que puede heredar sesgos o limitaciones del modelo profesor, aunque no se han documentado sesgos específicos.
- Riesgo de alucinación no cuantificado; el razonamiento explícito puede ayudar a depurar errores, pero no los elimina.
- El uso comercial está permitido (Apache 2.0), pero la atribución de autoría de Meta Superintelligence Lab debe mantenerse.
- La decodificación especulativa con DFlash añade ~1,6 GB de VRAM y puede fallar silenciosamente si el drafter no es compatible con la versión de llama.cpp; el aviso `[spec] failed to measure draft model memory` es inofensivo, pero conviene verificar que la salida es idéntica sin el drafter.

## Enlaces

- Repositorio HuggingFace de esta conversión GGUF: https://huggingface.co/lactroiii/Muse-Glimmer-30B-GGUF
- Repositorio base del modelo (safetensors, bf16): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio GGUF oficial de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B-GGUF
- Conversión de la comunidad LM Studio: https://huggingface.co/lmstudio-community/Muse-Glimmer-30B-GGUF
- Página del modelo en LM Studio: https://lmstudio.ai/models/meta/muse-glimmer
- Página oficial de Meta Developer: https://developer.meta.com/ai/models/muse-glimmer/
- Despliegue en Dell Enterprise Hub: https://dell.huggingface.co/models/meta-models/Muse-Glimmer-30B-GGUF
- PR de integración en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/26841
- Documentación de llama.cpp: https://github.com/ggml-org/llama.cpp
