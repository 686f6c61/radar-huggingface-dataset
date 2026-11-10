# Noga-Kurumi/Lindsay-Desktop-Models

## Resumen

Lindsay-Desktop-Models es un repositorio de pesos de inferencia empaquetados para la aplicación de escritorio Lindsay Desktop, distribuidos de forma separada al binario propietario de la aplicación. No se trata de un modelo único, sino de una colección de cuatro artefactos con funciones diferenciadas: un LLM conversacional de 4B parámetros, un modelo de síntesis de voz (TTS), un detector de actividad de voz (VAD) y un extractor de embeddings de hablante. El autor del repositorio es Noga-Kurumi, que también firma el fine-tune del LLM.

El componente principal es qwen-llm-4b, derivado de Qwen3-4B-Instruct-2507 mediante un fine-tune de paridad denominado "Lindsay v4" y cuantizado en Q5_K_M. El resto de artefactos son conversiones o pesos originales de terceros: Qwen3-TTS-12Hz-0.6B-Base convertido a GGUF por Serveurperso, Silero VAD como ONNX sin modificar y 3D-Speaker CAMPPlus convertido a ONNX por sherpa-onnx. La relevancia del repositorio es acotada: sirve como canal de distribución de dependencias de una aplicación concreta, no como un modelo de propósito general para la comunidad.

El conjunto suma 4.022.468.096 parámetros declarados en safetensors y ocupa 3,6 GB en el repositorio. La licencia es mixta por artefacto (Apache-2.0 y MIT), y la aplicación verifica tamaño y SHA-256 de cada fichero antes de instalarlo. No se publican datos de benchmarks ni de idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LLM basado en Qwen3-4B-Instruct-2507); VAD y speaker embedding en ONNX; TTS en GGUF |
| Parametros totales | 4.022.468.096 (declarados en safetensors, agregado del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (LLM y TTS); ONNX en precisión original (VAD y speaker) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-mit-per-artifact (Apache-2.0 para LLM, TTS y speaker; MIT para VAD) |
| Formato de pesos | GGUF y ONNX; safetensors referenciados en los metadatos del repo |

## Arquitectura y entrenamiento

El LLM qwen-llm-4b parte de Qwen3-4B-Instruct-2507, un transformer denso de 4B parámetros, sobre el que Noga aplica un fine-tune de paridad ("Lindsay v4") y una cuantización Q5_K_M para inferencia local. No se detalla en la model card el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación adicionales como RLHF o DPO; esos datos figuran como no disponibles.

Los otros tres artefactos no son modelos entrenados por el autor: trace-vad son los pesos ONNX originales de Silero VAD, trace-speaker es la conversión ONNX de 3D-Speaker CAMPPlus distribuida por sherpa-onnx, y qwen-tts es Qwen3-TTS-12Hz-0.6B-Base convertido a GGUF por Serveurperso y cuantizado localmente en Q5_K_M. La innovación técnica del repositorio es de empaquetado y verificación (comprobación de tamaño y SHA-256 por fichero), no arquitectónica.

## Capacidades

- Generación de texto conversacional multi-turno mediante el LLM Qwen3-4B-Instruct-2507 fine-tuneado.
- Síntesis de voz (TTS) a partir de Qwen3-TTS-12Hz-0.6B-Base, con pesos en GGUF para inferencia local.
- Detección de actividad de voz (VAD) con Silero VAD en ONNX, para segmentar audio de entrada.
- Extracción de embeddings de hablante con 3D-Speaker CAMPPlus en ONNX, orientada a identificación o diarización.
- Inferencia local en escritorio: todos los artefactos están pensados para ejecutarse en el equipo del usuario sin depender de servicios en la nube.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta endpoints_compatible, lo que sugiere integración con infraestructura de inferencia estándar.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada o modo thinking: no disponibles como capacidades documentadas en la información proporcionada.

## Casos de uso

- Asistente conversacional de escritorio: el LLM de 4B en Q5_K_M puede ejecutarse en local para mantener conversaciones multi-turno dentro de la aplicación Lindsay Desktop, sin enviar texto a servidores externos.
- Dictado y transcripción con segmentación: la combinación de trace-vad (Silero) y trace-speaker (CAMPPlus) permite detectar turnos de voz y atribuirlos a hablantes distintos en grabaciones de reuniones o notas de voz.
- Síntesis de voz para respuestas del asistente: qwen-tts convierte el texto generado por el LLM en audio, habilitando una interfaz por voz completamente local.
- Prototipado de pipelines de voz en escritorio: los artefactos ONNX de VAD y speaker embedding son reutilizables en aplicaciones propias que necesiten preprocesado de audio sin entrenar modelos.
- Distribución verificable de dependencias: el esquema de validación por tamaño y SHA-256 sirve como referencia para empaquetar pesos de terceros en aplicaciones de escritorio con actualizaciones firmadas.
- Evaluación de fine-tunes de Qwen3-4B: el checkpoint Lindsay v4 permite comparar el comportamiento del fine-tune frente al Qwen3-4B-Instruct-2507 original en tareas conversacionales.
- Inferencia en equipos sin GPU dedicada: al estar cuantizado en Q5_K_M y tener 4B parámetros, el LLM es candidato para ejecutarse en CPU en portátiles convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el LLM de 4B en Q5_K_M: aproximadamente 3-3,5 GB de pesos, más overhead de contexto; en la práctica, del orden de 4-6 GB de VRAM para inferencia en GPU.
- El repositorio completo ocupa 3,6 GB, incluyendo TTS, VAD y speaker embedding.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de 4B en Q5_K_M cabe en GPUs de consumo con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070), aunque el autor no publica requisitos oficiales.
- Ejecución en CPU: viable para el LLM por su tamaño y cuantización, y para los modelos ONNX de VAD y speaker; el TTS en GGUF también está pensado para inferencia local.
- Opciones de despliegue: llama.cpp u Ollama para el GGUF del LLM y del TTS; ONNX Runtime para trace-vad y trace-speaker. vLLM y TGI no están documentados para estos artefactos en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Lindsay-Desktop-Models (qwen-llm-4b) | 4B (LLM) | no disponible | GGUF Q5_K_M | Apache-2.0 | Fine-tune de Qwen3-4B-Instruct-2507 para una app de escritorio |
| Qwen3-4B-Instruct-2507 (upstream) | 4B | no disponible en esta ficha | safetensors, GGUF | Apache-2.0 | Modelo base sin fine-tune; referencia directa del anterior |
| Qwen3-TTS-12Hz-0.6B-Base (upstream) | 0,6B | no aplica | safetensors, GGUF | Apache-2.0 | Modelo TTS del que deriva qwen-tts |
| Silero VAD (upstream) | no disponible | no aplica | ONNX | MIT | Pesos idénticos a trace-vad, sin modificar |

La comparación con alternativas de la misma categoría (asistentes de escritorio con LLM + TTS + VAD) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo único: mezcla un fine-tune propio con pesos de terceros, por lo que las garantías de calidad y mantenimiento son heterogéneas.
- No se documentan idiomas soportados; el comportamiento multilingüe del LLM y del TTS no está verificado en la información disponible.
- No hay benchmarks publicados, ni comparativas de rendimiento frente al Qwen3-4B-Instruct-2507 original.
- La licencia es mixta por artefacto y remite a LICENSES.md; cualquier uso comercial debe revisarse artefacto por artefacto (Apache-2.0 y MIT son permisivas, pero deben conservarse los avisos correspondientes).
- La model card advierte de que los ficheros no incluyen la aplicación propietaria, avatares, grabaciones, datos personales, perfiles de condicionamiento de voz ni clones de voz entrenados; la publicación no resuelve la revisión separada de los activos de avatar y voz clonada.
- Riesgo de alucinación inherente a un LLM de 4B; no se han publicado evaluaciones de fidelidad para este fine-tune.
- El autor declara explícitamente que no reclama el aval de los autores upstream (Qwen, Silero, 3D-Speaker, sherpa-onnx).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Noga-Kurumi/Lindsay-Desktop-Models
- Licencias del repositorio: https://huggingface.co/Noga-Kurumi/Lindsay-Desktop-Models/blob/main/LICENSES.md
- Qwen3-4B-Instruct-2507 (modelo base del LLM): no disponible en la información proporcionada
- Qwen3-TTS-12Hz-0.6B-Base (modelo base del TTS): no disponible en la información proporcionada
- Silero VAD: no disponible en la información proporcionada
- 3D-Speaker CAMPPlus / sherpa-onnx: no disponible en la información proporcionada
