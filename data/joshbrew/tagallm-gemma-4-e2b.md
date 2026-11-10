# JoshBrew/TagaLLM-Gemma-4-E2B

## Resumen

TagaLLM Gemma 4 E2B es una conversión a GGUF y cuantización Q4_K_M del checkpoint instructivo google/gemma-4-E2B-it, publicada por JoshBrew dentro del proyecto TagaLLM. No se trata de un modelo entrenado desde cero ni de un ajuste fino consolidado: el autor describe los adaptadores piloto como experimentos separados, y el artefacto publicado son los pesos base cuantizados acompañados de una configuración de aplicación (prompt de sistema en tagalo, referencias culturales curadas y enrutamiento separado de idioma y alcance). El objetivo declarado es servir un chatbot en tagalo y taglish sobre llama.cpp con un contexto de 4.096 tokens en la aplicación.

El modelo hereda la arquitectura y las capacidades del checkpoint Gemma 4 E2B de Google, con 4.647.450.147 parámetros totales según los safetensors del modelo base. El repositorio ocupa 3,4 GB y el archivo GGUF concreto pesa 3.427.874.880 bytes. La licencia declarada es Apache 2.0, e incluye el tokenizer embebido en el GGUF.

La relevancia de esta ficha es acotada y conviene enmarcarla con precisión: se publica como un artefacto de despliegue reproducible (con SHA-256 del GGUF documentado) para un caso de uso lingüístico específico, el tagalo, con resultados medidos a nivel de aplicación y no a nivel de modelo. No hay benchmarks estándar publicados ni métricas comparativas con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint google/gemma-4-E2B-it; la model card no detalla el tipo de transformer) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (configuración usada en la aplicación según la model card); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el checkpoint base se convirtió a BF16 GGUF antes de cuantizar |
| Idiomas soportados | tl (tagalo); taglish según los tags del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tokenizer embebido); el modelo base en safetensors |
| Tamano del repositorio | 3,4 GB |
| Tamano del archivo GGUF | 3.427.874.880 bytes |
| SHA-256 del GGUF | 1b71213c391f309cd3775c2fb489591d5806d2f2e59eccf6400d2b96f42fed47 |
| Revision del checkpoint base | 4adf15748de9e1a0097b6274cee9c15836c41c37 |
| Libreria | llama.cpp |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni los datos de entrenamiento. Lo único documentado es el proceso de conversión y cuantización: el checkpoint google/gemma-4-E2B-it en la revisión 4adf15748de9e1a0097b6274cee9c15836c41c37 se convirtió a BF16 GGUF y después se cuantizó a Q4_K_M con llama.cpp. El autor indica explícitamente que la conversión y la cuantización son modificaciones del proyecto TagaLLM, y que los adaptadores piloto son experimentos separados, no parte del artefacto publicado.

La configuración evaluada no es solo el GGUF: incluye un prompt de sistema en tagalo, referencias culturales curadas y un enrutamiento separado de idioma y de alcance. Es decir, parte del comportamiento observado proviene de la capa de aplicación, no de los pesos. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO para este artefacto.

## Capacidades

- Generación de texto conversacional en tagalo y taglish, orientada a un chatbot de aplicación.
- Conversación multi-turno dentro de una ventana de 4.096 tokens.
- Seguimiento de estado de la conversación (personas, lugares y tiempos), con limitaciones medidas y documentadas por el autor.
- Capacidades heredadas del checkpoint Gemma 4 E2B instruct: no detalladas en la model card de este repositorio.
- Tool calling, function calling y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Chatbot de atención al cliente en tagalo: el modelo puede mantener conversaciones multi-turno dentro de los 4.096 tokens de contexto configurados, con un prompt de sistema y referencias culturales adaptadas al público filipino.
- Asistente conversacional local en Windows: la model card reporta unos 3,8 GiB de RAM residente para los dos procesos de inferencia en una muestra local, lo que permite desplegarlo en equipos de escritorio sin GPU dedicada de gran tamaño.
- Prototipado de aplicaciones en taglish: útil para equipos que necesitan validar flujos conversacionales en registro mixto tagalo-inglés antes de invertir en ajuste fino propio.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita la integración en productos comerciales, sujeta a las condiciones del modelo base.
- Evaluación de pipelines llama.cpp: el SHA-256 y el tamaño exacto del GGUF permiten verificar la reproducibilidad de la conversión y la cuantización en pipelines de CI.
- Base para experimentos de adaptación lingüística: el proyecto TagaLLM documenta adaptadores piloto como experimentos separados, de modo que este GGUF sirve como punto de partida reproducible para ese tipo de trabajo.
- Investigación sobre seguimiento de estado en conversaciones: los resultados publicados a nivel de aplicación (37 de 72 comprobaciones de seguimiento de estado) permiten usar el modelo como referencia en estudios de consistencia conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo reporta métricas de una comparación de desarrollo no ciega con 20 conversaciones:

| Metrica | Resultado |
|---|---|
| Naturalidad en respuestas | 110 de 120 respuestas con puntuación máxima |
| Seguimiento de estado | 37 de 72 comprobaciones superadas |
| Conversaciones que superan los seis intercambios | 3 de 20 |
| RAM residente (dos procesos de inferencia, muestra local Windows) | ~3,8 GiB |
| Almacenamiento de los dos checkpoints | ~6,9 GB |

Estos resultados son a nivel de aplicación completa (incluyendo prompt de sistema y enrutamiento), no del modelo aislado, y la comparación fue no ciega, por lo que no deben interpretarse como una evaluación rigurosa del modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la model card reporta ~3,8 GiB de RAM residente para los dos procesos de inferencia en una muestra local con Windows, sin GPU especificada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño del GGUF Q4_K_M (3,4 GB) es compatible en teoría con GPUs de consumo con 8 GB o más de VRAM, pero el autor no lo documenta.
- Opciones de despliegue: llama.cpp (librería declarada); el repositorio incluye la etiqueta endpoints_compatible. Otras opciones como vLLM, TGI u Ollama no se mencionan.
- Latencia y throughput: no disponible en la información proporcionada.
- Almacenamiento: 3,4 GB para este GGUF; ~6,9 GB si se despliegan los dos checkpoints del proyecto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de tamaño o tarea equivalente, ni datos de rendimiento que permitan establecer una comparación fundamentada.

## Limitaciones y advertencias

- El autor reconoce que el modelo puede perder actualizaciones de personas, lugares y tiempos durante la conversación; solo 37 de 72 comprobaciones de seguimiento de estado se superaron.
- Solo 3 de 20 conversaciones superaron los seis intercambios en la evaluación de desarrollo, lo que sugiere fragilidad en diálogos largos.
- La evaluación es no ciega y a nivel de aplicación, no del modelo; no hay benchmarks estándar que permitan comparar su calidad con alternativas.
- El contexto está limitado a 4.096 tokens en la configuración de la aplicación, por debajo de lo habitual en modelos actuales de tamaño similar.
- El soporte de idiomas declarado se limita al tagalo (y taglish por tags); no se documenta cobertura multilingüe adicional.
- Los adaptadores piloto del proyecto son experimentos separados y no forman parte de este artefacto; no deben asumirse mejoras de ajuste fino.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo conversacional de 4,6B parámetros, el riesgo de alucinación en dominios factuales debe considerarse alto por defecto.
- La licencia declarada es Apache 2.0, pero el uso comercial debe verificar también las condiciones del modelo base google/gemma-4-E2B-it, ya que la model card no detalla cómo se resuelve la combinación de licencias.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshBrew/TagaLLM-Gemma-4-E2B
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio GitHub y guía de instalación: https://github.com/JoshuaBrew/TagaLLM
- Guía de configuración local: https://github.com/JoshuaBrew/TagaLLM/blob/main/INSTALL.md
- Artículo de investigación: https://joshuabrew.github.io/TagaLLM/article.html
- Colección TagaLLM en Hugging Face: https://huggingface.co/collections/JoshBrew/tagallm-6af280345e2e4ff6235630ea
