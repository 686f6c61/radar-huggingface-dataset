# cicada-ai/Jogg-Avatar-V2V

## Resumen

Jogg-Avatar V2V es un modelo de video a video (V2V) guiado por audio, desarrollado por cicada-ai, que permite generar avatares parlantes realistas a partir de un video fuente y una pista de audio. Está basado en el modelo de difusión de video Wan2.2-TI2V-5B de Wan-AI, del que conserva la arquitectura general, y se presenta como un fine-tuning especializado en la tarea de talking-head. El modelo regenera únicamente la región facial del video original para sincronizar los labios con el audio de entrada, mientras preserva el movimiento del cuerpo, la cámara y el fondo.

El modelo se distribuye como un adaptador o conjunto de pesos adicionales (326 millones de parámetros en el archivo safetensors) que debe combinarse con el modelo base Wan2.2-TI2V-5B y con el extractor de características de audio `facebook/wav2vec2-base-960h`. El código de entrenamiento e inferencia está disponible en un repositorio público de GitHub, lo que facilita su integración en proyectos de generación de vídeo. Su licencia Apache-2.0 permite uso comercial, aunque se exige obtener consentimiento para los vídeos y voces utilizados y divulgar claramente el contenido sintético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de video basado en Wan2.2-TI2V-5B (DiT) con inyeccion de audio |
| Parametros totales | 326.427.744 (pesos del adaptador; el modelo base Wan2.2-TI2V-5B tiene 5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Jogg-Avatar V2V se construye sobre Wan2.2-TI2V-5B, un modelo de difusion de video de 5.000 millones de parametros desarrollado por Wan-AI. El adaptador anade un mecanismo de inyeccion de audio que utiliza las caracteristicas extraidas por `wav2vec2-base-960h` para condicionar la generacion de la region facial. De esta forma, el modelo mantiene la estructura global del video fuente (cuerpo, camara, fondo) y solo modifica la cara para que los labios y expresiones se sincronicen con la pista de audio.

No se han publicado detalles especificos sobre el dataset de entrenamiento, el numero de pasos o las tecnicas de alineacion (RLHF, DPO, etc.). El repositorio de codigo indica que el entrenamiento soporta datos en alta definicion (720p), lo que sugiere que el modelo ha sido optimizado para calidad visual. La inferencia requiere cargar el modelo base Wan2.2-TI2V-5B, el adaptador Jogg-Avatar y el extractor de audio por separado.

## Capacidades

- Generacion de video a video (V2V) con sincronizacion labial guiada por audio.
- Preservacion del movimiento del cuerpo, la camara y el fondo del video fuente.
- Regeneracion de la region facial para adaptarse a la pista de audio.
- Soporte para videos de alta resolucion (hasta 720p segun el codigo de entrenamiento).
- Integracion con el ecosistema de diffusers y safetensors.
- Requiere el modelo base Wan2.2-TI2V-5B y wav2vec2-base-960h para funcionar.
- No se han documentado capacidades de tool calling, agentes o razonamiento multimodal adicional.

## Casos de uso

- Creacion de avatares parlantes para contenido educativo: se puede partir de un video grabado con un presentador y sustituir el audio por una narracion en otro idioma, manteniendo la apariencia y el movimiento del cuerpo.
- Doblaje de videos corporativos: el modelo permite regenerar la cara del orador para que coincida con un nuevo guion de audio, facilitando la localizacion de materiales de formacion.
- Generacion de videos de marketing personalizados: a partir de un video base, se puede cambiar el mensaje hablado sin necesidad de regrabar, usando el mismo avatar.
- Asistentes virtuales con presencia visual: integrar el modelo en un sistema de chatbot para generar un video del avatar respondiendo en tiempo real a las consultas del usuario.
- Restauracion de videos antiguos con audio nuevo: si se dispone de un video historico y una grabacion de audio, el modelo puede actualizar la sincronizacion labial.
- Produccion de contenido para redes sociales: crear videos de avatares hablando sobre temas variados a partir de una unica toma fuente, reduciendo costes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos comparativos con otros modelos de talking-head en la documentacion oficial.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU recomendadas.
- Dado que el modelo base Wan2.2-TI2V-5B tiene 5.000 millones de parametros, se estima que la inferencia en precision fp16 requiere al menos 10-12 GB de VRAM, mas el espacio para el adaptador y el extractor de audio.
- Es probable que una GPU de consumo como la RTX 3090 o RTX 4090 (24 GB) sea suficiente para inferencia, aunque no esta confirmado.
- El despliegue se realiza mediante el codigo del repositorio oficial (GitHub), que probablemente utiliza PyTorch y diffusers. No se menciona soporte para vLLM, llama.cpp u Ollama.
- La latencia y el throughput dependen de la resolucion y duracion del video; no hay datos publicados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (por ejemplo, SadTalker, Wav2Lip o otros fine-tunings de Wan2.2). No hay datos de rendimiento ni especificaciones detalladas de alternativas en la documentacion consultada.

## Limitaciones y advertencias

- El modelo requiere el modelo base Wan2.2-TI2V-5B y wav2vec2-base-960h, cuyas licencias y terminos de uso deben revisarse por separado.
- Es responsabilidad del usuario obtener el consentimiento explicito de las personas cuyos videos y voces se utilicen, asi como divulgar claramente que el contenido es sintetico.
- No se han documentado sesgos especificos, pero al ser un modelo de generacion de video, puede presentar alucinaciones en la sincronizacion labial o artefactos visuales en condiciones de iluminacion o angulos extremos.
- La licencia Apache-2.0 permite uso comercial, pero no exime de las obligaciones legales sobre consentimiento y etiquetado de contenido sintetico.
- No hay informacion sobre la robustez del modelo ante multiples hablantes, acentos o idiomas; la capacidad multilingue no esta confirmada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/cicada-ai/Jogg-Avatar-V2V)
- [Repositorio de codigo (GitHub)](https://github.com/chanjing-ai/Jogg-Avatar-V2V)
- [Pagina de JoggAI](https://www.jogg.ai/)
- [API de JoggAI](https://www.jogg.ai/api/)
