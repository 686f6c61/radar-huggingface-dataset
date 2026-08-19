# agiws/Kimi-Audio-7B-Instruct-Q4

## Resumen

Kimi-Audio-7B-Instruct-Q4 es una cuantización experimental en precisión 4-bit (NF4) del modelo Kimi-Audio-7B-Instruct, desarrollado originalmente por Moonshot AI. El modelo base es un modelo fundacional de audio que unifica comprensión, generación y conversación de audio en un solo marco, capaz de realizar reconocimiento de voz (ASR), respuesta a preguntas sobre audio (AQA), descripción de audio (AAC), reconocimiento de emociones (SER), clasificación de eventos y escenas sonoras, y conversación de voz de extremo a extremo. La cuantización ha sido realizada por el usuario agiws mediante la herramienta AGIWS NeuralQuant, y solo afecta al núcleo LLM (Qwen2.5-7B), mientras que el resto de componentes (detokenizer, encoder Whisper y vocoder) permanecen en fp16.

Esta versión cuantizada tiene como objetivo reducir el uso de memoria para permitir la inferencia en GPUs de gama media, aunque actualmente se encuentra en fase de desarrollo y presenta limitaciones importantes, como la imposibilidad de ejecutar la inferencia completa en GPUs de 16 GB debido a que los componentes no cuantizados siguen ocupando demasiada VRAM. El modelo base ha sido preentrenado con más de 13 millones de horas de audio diverso y texto, y emplea una arquitectura híbrida con tokens acústicos continuos y semánticos discretos, junto con un núcleo LLM de 7 mil millones de parámetros y cabezas paralelas para generar texto y tokens de audio. Su relevancia radica en ser uno de los pocos modelos de audio de código abierto con licencia MIT que integra tareas de comprensión y generación en un solo sistema, aunque esta versión cuantizada aún no está lista para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM basado en Qwen2.5-7B + encoder Whisper-large-v3 + detokenizer de flujo (flow matching) + vocoder |
| Parametros totales | 9.766.334.464 (≈9,77 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 (4-bit) para el LLM; fp16 para el resto de componentes |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo original Kimi-Audio-7B-Instruct combina un núcleo LLM basado en Qwen2.5-7B con un encoder de audio Whisper-large-v3, un detokenizer de audio basado en flow matching por chunks y un vocoder. La entrada de audio es híbrida: combina tokens acústicos continuos (extraídos del encoder) con tokens semánticos discretos, que se alimentan al LLM. El LLM genera de forma paralela tokens de texto y tokens de audio, y el detokenizer convierte estos últimos en forma de onda mediante un proceso de flow matching de baja latencia. Esta arquitectura permite manejar tareas de comprensión y generación de audio en un único modelo sin necesidad de módulos separados.

El entrenamiento se realizó con más de 13 millones de horas de datos de audio (voz, música y sonidos ambientales) junto con datos de texto, lo que proporciona una base sólida para múltiples tareas. No se especifica si se utilizaron técnicas de RLHF o DPO; la información disponible no lo menciona. La cuantización NF4 aplicada por agiws reduce el tamaño del LLM a aproximadamente 6,8 GB, pero los demás componentes (detokenizer, encoder y vocoder) permanecen en fp16, sumando unos 6,8 GB adicionales, lo que explica el tamaño total del repositorio de 13,6 GB.

## Capacidades

- Reconocimiento de voz (ASR) con transcripción de audio a texto en inglés y chino.
- Respuesta a preguntas sobre contenido de audio (AQA), por ejemplo, "¿qué instrumento suena al fondo?".
- Descripción automática de audio (AAC) para generar subtítulos o metadatos.
- Reconocimiento de emociones en el habla (SER), identificando estados como alegría, tristeza o enfado.
- Clasificación de eventos sonoros (SEC) y escenas acústicas (ASC), como detectar tráfico, lluvia o música.
- Conversación de voz de extremo a extremo: el modelo puede recibir audio, razonar y responder tanto con texto como con audio generado.
- Generación de audio hablado a partir de texto o de instrucciones multimodales.
- Soporte de entrada multimodal (audio + texto) en un solo modelo unificado.

## Casos de uso

- Atención al cliente automatizada por voz: el modelo puede gestionar conversaciones multi-turno con clientes, comprendiendo consultas habladas y generando respuestas de voz naturales, gracias a su capacidad de conversación de extremo a extremo y a su entrenamiento en 13 millones de horas de audio.
- Transcripción de reuniones y entrevistas: con su función ASR, puede transcribir grabaciones en inglés y chino, generando actas textuales con alta precisión, útil para herramientas de productividad empresarial.
- Análisis de sentimiento en centros de llamadas: mediante SER, el modelo puede clasificar el tono emocional de las interacciones de los clientes, permitiendo a las empresas detectar insatisfacción o frustración en tiempo real.
- Clasificación de sonidos para vigilancia o monitorización ambiental: su capacidad SEC/ASC permite identificar eventos como alarmas, cristales rotos o ruido de tráfico en grabaciones de seguridad, facilitando alertas automáticas.
- Generación de contenido audiovisual accesible: el modelo puede generar descripciones de audio (AAC) para personas con discapacidad visual, o producir locuciones de voz a partir de guiones en inglés y chino.
- Asistentes de voz para dispositivos embebidos: aunque la versión cuantizada aún no es óptima para hardware limitado, el modelo base podría integrarse en asistentes domésticos que requieran comprensión y generación de voz sin depender de servicios en la nube.
- Investigación académica en audio: sirve como punto de partida para estudios sobre modelos unificados de audio, permitiendo comparar arquitecturas híbridas y técnicas de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original de Moonshot AI afirma que el modelo alcanza resultados de vanguardia (SOTA) en varios benchmarks de audio, pero no proporciona cifras concretas. Esta versión cuantizada no incluye datos de evaluación propios.

## Requisitos de hardware

- La inferencia completa requiere más de 16 GB de VRAM. Según la model card del repo cuantizado, una GPU Tesla T4 de 16 GB provoca un error de memoria insuficiente (OOM) al ejecutar el modelo completo.
- Los componentes no cuantizados (detokenizer, encoder Whisper y vocoder) ocupan aproximadamente 6,8 GB en fp16, y el LLM cuantizado en NF4 ocupa otros 6,8 GB, sumando unos 13,6 GB, pero el pico de memoria durante la inferencia supera los 16 GB disponibles.
- Se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000) para ejecutar el modelo sin cuantizar los componentes restantes.
- El despliegue se realiza mediante la librería `kimi-audio` del repositorio oficial de Moonshot AI, que incluye scripts de inferencia y soporte para Docker. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la información proporcionada.
- La latencia y el throughput no están documentados para esta versión cuantizada. El modelo base utiliza un detokenizer por chunks basado en flow matching para reducir la latencia en la generación de audio, pero no hay mediciones específicas disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos de audio. En la categoría de modelos de lenguaje de audio de código abierto, existen alternativas como Qwen2-Audio o AudioGPT, pero no se han encontrado métricas comparables en la información proporcionada. La model card original menciona rendimiento SOTA en benchmarks de audio, pero sin cifras concretas, por lo que no es posible establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- La cuantización es experimental y solo afecta al LLM; los componentes de audio (detokenizer, encoder y vocoder) permanecen en fp16, lo que limita la reducción total de memoria y provoca OOM en GPUs de 16 GB.
- El modelo solo soporta inglés y chino; no hay soporte documentado para otros idiomas.
- Al ser una conversión cuantizada de terceros, no hay garantía de que el rendimiento en tareas de audio sea idéntico al del modelo original en precisión completa. Podrían producirse degradaciones en la calidad de la generación de audio o en la precisión del reconocimiento.
- La licencia MIT permite uso comercial, pero los pesos originales pertenecen a Moonshot AI; se debe verificar que el uso cumpla con los términos de la licencia del modelo original.
- Riesgo de alucinación en tareas de generación de audio o en respuestas a preguntas sobre contenido ambiguo, especialmente en conversaciones de voz de extremo a extremo.
- El repositorio está marcado como "work in progress" y no se recomienda su uso en entornos de producción hasta que se complete la cuantización de todos los componentes.

## Enlaces

- Repositorio de HuggingFace del modelo cuantizado: https://huggingface.co/agiws/Kimi-Audio-7B-Instruct-Q4
- Modelo original de Moonshot AI: https://huggingface.co/moonshotai/Kimi-Audio-7B-Instruct
- Repositorio GitHub de Kimi-Audio: https://github.com/MoonshotAI/Kimi-Audio
- Informe técnico (paper): https://raw.githubusercontent.com/MoonshotAI/Kimi-Audio/master/assets/kimia_report.pdf
