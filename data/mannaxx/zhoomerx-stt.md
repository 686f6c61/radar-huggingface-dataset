# Mannaxx/zhoomerx-stt

## Resumen

Zhoomerx-stt es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario Mannaxx bajo el identificador `Mannaxx/zhoomerx-stt`. Se trata de una adaptación o reempaquetado del modelo Moonshine-base desarrollado originalmente por Useful Sensors, una arquitectura sequence-to-sequence especializada en transcripción de voz a texto en inglés. El modelo cuenta con 61.513.920 parámetros (aproximadamente 61 M), lo que lo sitúa en la categoría de modelos ultraligeros, diseñados específicamente para despliegues en hardware con recursos muy limitados.

La relevancia de este modelo radica en su eficiencia: con solo 61 millones de parámetros es capaz de realizar transcripción de voz en tiempo real, superando según su model card a modelos ASR de tamaño similar en precisión sobre datasets estándar. Frente a alternativas como Whisper de OpenAI, Moonshine reduce drásticamente los requisitos computacionales, lo que lo hace adecuado para dispositivos embebidos, aplicaciones móviles y sistemas de borde donde no es viable ejecutar modelos de cientos de millones de parámetros.

El repositorio tiene un tamaño de 0,2 GB y los pesos están en formato safetensors, compatibles con la librería transformers. La licencia es MIT, lo que permite uso comercial sin restricciones significativas. El modelo está entrenado exclusivamente para inglés y no soporta otros idiomas según la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sequence-to-sequence (encoder-decoder) para ASR, tipo Moonshine |
| Parametros totales | 61.513.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | automatic-speech-recognition |
| Libreria | transformers |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine, una variante de transformer sequence-to-sequence diseñada específicamente para ASR. A diferencia de Whisper, que utiliza una ventana de contexto fija de 30 segundos independientemente de la duración real del audio, Moonshine procesa el audio de entrada de forma proporcional a su longitud, lo que reduce el coste computacional en fragmentos cortos. Esta característica es clave para aplicaciones de transcripción en tiempo real con baja latencia. El modelo base de Moonshine fue entrenado por Useful Sensors sobre 200.000 horas de audio y transcripciones correspondientes, recopiladas de internet y de datasets abiertos disponibles en Hugging Face.

No se dispone de información específica sobre el proceso de entrenamiento aplicado por Mannaxx para producir `zhoomerx-stt`. No se documenta si se realizó fine-tuning adicional, ajuste con RLHF/DPO, ni la composición exacta del dataset utilizado en esta variante concreta. La model card hace referencia al paper original de Moonshine (arXiv:2410.15608) y a la model card de Whisper (arXiv:1810.03993) como referencias metodológicas, pero no detalla innovaciones técnicas adicionales introducidas en este repositorio.

## Capacidades

- Transcripcion de voz a texto en ingles: convierte audio de habla en texto escrito.
- Procesamiento de audio de duracion variable: a diferencia de Whisper, no fuerza una ventana fija de 30 segundos, lo que mejora la eficiencia en clips cortos.
- Generacion de texto condicionada a audio: el modelo genera la transcripcion token a token.
- Control de alucinaciones mediante limite de tokens: la model card recomienda limitar la longitud maxima de generacion a 6,5 tokens por segundo de audio para evitar bucles de alucinacion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision ni audio mas alla de la transcripcion.
- Capacidad multilingue limitada exclusivamente al ingles.
- No dispone de modo "thinking" ni capacidades de razonamiento explicito.

## Casos de uso

- Transcripcion en tiempo real en dispositivos embebidos: con solo 61 M de parametros, el modelo puede ejecutarse en microcontroladores o SBCs (como Raspberry Pi) para transcribir voz en aplicaciones de domotica o asistentes locales, gracias a su bajo consumo de memoria y computo.

- Subtitulado automatico de videos en ingles: el modelo puede integrarse en pipelines de post-produccion para generar subtitulos de contenido audiovisual en ingles, procesando fragmentos de audio de forma eficiente sin necesidad de GPU dedicada.

- Accesibilidad para personas con discapacidad auditiva: transcripcion en vivo de conversaciones o conferencias en ingles, ejecutandose localmente en un portatil o dispositivo movil sin depender de servicios en la nube.

- Analisis de llamadas de atencion al cliente: transcripcion de grabaciones de llamadas en ingles para su posterior analisis de calidad, cumplimiento o extraccion de informacion, con la ventaja de que el modelo puede ejecutarse on-premise por su licencia MIT y bajo requisito de hardware.

- Comandos de voz en aplicaciones de escritorio: integracion en asistentes personales o herramientas de productividad que requieran dictado por voz en ingles, con latencia baja gracias al procesamiento proporcional a la duracion del audio.

- Investigacion en ASR eficiente: como modelo de referencia ultraligero para experimentos academicos sobre destilacion, cuantizacion o comparacion de arquitecturas ASR en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para el modelo `Mannaxx/zhoomerx-stt`. La model card original de Moonshine menciona que los modelos "exhiben mayor precision en datasets estandar sobre sistemas ASR existentes de tamanos similares", pero no se proporcionan cifras concretas (WER, MMLU, etc.) en la informacion accesible. No se deben inventar numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 61 M de parametros, la inferencia en precision completa (fp32) requiere aproximadamente 250 MB de VRAM. En fp16, alrededor de 125 MB. En cuantizacion int8, aproximadamente 62 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Se puede ejecutar en NVIDIA GTX 1050, RTX 2060, RTX 3060, RTX 4090, A100, H100, etc. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU.
- Opciones de despliegue: transformers (segun la model card), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta soporte explicito. vLLM y TGI no estan confirmados para esta arquitectura.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 61 M, se espera latencia muy baja en GPU y aceptable en CPU, pero no hay cifras concretas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Mannaxx/zhoomerx-stt | 61 M | No disponible | Ingles | MIT | safetensors | Hugging Face |
| UsefulSensors/moonshine-base | 61 M | No disponible | Ingles | MIT | safetensors | Hugging Face |
| UsefulSensors/moonshine-tiny | 27 M | No disponible | Ingles | MIT | safetensors | Hugging Face |
| OpenAI Whisper tiny | 39 M | 30 s fijo | Multilingue | MIT | safetensors, GGUF | Hugging Face, OpenAI |
| OpenAI Whisper base | 74 M | 30 s fijo | Multilingue | MIT | safetensors, GGUF | Hugging Face, OpenAI |

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: no soporta otros idiomas, lo que limita su uso en entornos multilingues.
- Riesgo de alucinacion: la model card advierte que el modelo puede generar texto que no fue pronunciado en el audio, especialmente en silencios o ruido. Se recomienda limitar la generacion a 6,5 tokens por segundo de audio.
- Sesgos desconocidos: no se documentan evaluaciones de sesgo por acento, genero, edad o etnia. La model card original advierte contra el uso para clasificacion subjetiva o inferencia de atributos humanos.
- Restricciones de licencia: licencia MIT, permite uso comercial, modificacion y redistribucion sin restricciones significativas, siempre que se incluya el aviso de copyright.
- Caveat para produccion: no se han publicado benchmarks especificos para esta variante, por lo que se recomienda evaluar el modelo en el dominio concreto de uso antes de desplegarlo.
- Sin soporte documentado para tool calling, agentes o razonamiento multi-paso.
- La model card original advierte contra el uso en dominios de alto riesgo como toma de decisiones automatizadas.
- No se documenta el proceso de entrenamiento especifico de esta variante, lo que impide conocer posibles desviaciones respecto al Moonshine original.

## Enlaces

- Hugging Face: https://huggingface.co/Mannaxx/zhoomerx-stt
- Paper de Moonshine: https://arxiv.org/abs/2410.15608
- Paper de referencia sobre model cards: https://arxiv.org/abs/1810.03993
- Blog de introduccion a Moonshine: https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/
- Repositorio de instalacion de Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Model card de Whisper (referencia): https://github.com/openai/whisper/blob/main/model-card.md
- Podcast sobre Moonshine: https://notebooklm.google.com/notebook/d787d6c2-7d7b-478c-b7d5-a0be4c74ae19/audio
