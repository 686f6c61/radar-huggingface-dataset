# gabadorno/voice-to-voice-translator

## Resumen

`gabadorno/voice-to-voice-translator` no es un modelo único, sino un pipeline de dubbing y traducción de voz automatizada publicado en Hugging Face por el usuario gabadorno. El sistema encadena tres componentes: transcripción de audio con Whisper Tiny, traducción automática con NLLB-200 y síntesis de voz con gTTS, con el objetivo de convertir un audio en portugués brasileño en un audio traducido a inglés o español (o viceversa, según la configuración del pipeline).

El repositorio se presenta como documentación de arquitectura más que como un modelo con pesos propios: no publica checkpoints entrenados, sino la descripción del flujo de trabajo que combina modelos de terceros. Los idiomas declarados son portugués, inglés y español, y la licencia es MIT. El pipeline declarado en Hugging Face es `translation`, aunque funcionalmente abarca ASR, MT y TTS.

Su relevancia es limitada pero ilustrativa: sirve como referencia para quien quiera montar un traductor voz-a-voz autónomo con componentes abiertos y ligeros (Whisper Tiny es el modelo más pequeño de la familia Whisper), aunque no aporta innovación arquitectónica ni datos de entrenamiento propios. La información disponible no permite confirmar parámetros, contexto ni rendimiento del conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline compuesto: Whisper Tiny (ASR) + NLLB-200 (traducción) + gTTS (TTS) |
| Parametros totales | no disponible (depende de los submodelos; Whisper Tiny ~39 M, NLLB-200 según variante) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (Whisper Tiny procesa ventanas de audio de 30 s; NLLB-200 tiene límite de tokens propio) |
| Tipos de cuantizacion | no disponible (no se publican pesos del pipeline) |
| Idiomas soportados | pt, en, es |
| Licencia | MIT |
| Formato de pesos | no disponible (no se publican pesos propios; el repo documenta la arquitectura) |

## Arquitectura y entrenamiento

El sistema no entrena un modelo nuevo, sino que orquesta tres etapas secuenciales. La primera es la transcripción de audio con Whisper Tiny, el modelo ASR de OpenAI de menor tamaño, adecuado para prototipos y entornos con recursos limitados. La segunda es la traducción automática con NLLB-200 (No Language Left Behind), la familia de modelos de traducción multilingüe de Meta AI. La tercera es la síntesis de voz con gTTS (Google Text-to-Speech), un servicio que genera audio a partir de texto.

No se documentan datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO, porque el autor no entrena ningún componente. La única innovación técnica mencionada en la model card es la referencia a LoRA (Low-Rank Adaptation) mediante un vídeo teórico en YouTube, pero no se indica que el pipeline use LoRA en producción ni se aportan adaptadores publicados. Tampoco se detalla la lógica de segmentación, el manejo de solapamientos entre fragmentos de audio ni la sincronización labial.

## Capacidades

- Transcripción de voz a texto en portugués brasileño mediante Whisper Tiny.
- Traducción automática entre portugués, inglés y español mediante NLLB-200.
- Síntesis de voz a partir del texto traducido mediante gTTS.
- Generación de audio traducido (voice-to-voice) combinando las tres etapas.
- Soporte multilingüe limitado a los tres idiomas declarados: pt, en, es.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio nativo en el modelo (el audio es la entrada del pipeline, no del modelo) ni capacidades de agente.
- No se documenta streaming ni procesamiento en tiempo real.

## Casos de uso

- Doblaje de vídeos cortos en portugués a inglés o español: el pipeline transcribe el audio con Whisper Tiny, traduce con NLLB-200 y genera la pista de voz con gTTS; es adecuado para contenido de baja exigencia y prototipos.
- Subtitulado automático de material audiovisual: la etapa ASR produce la transcripción y la etapa MT genera los subtítulos en el idioma destino, reutilizables por separado.
- Localización de pódcasts educativos: permite generar una versión en otro idioma de episodios completos, aunque la calidad de la voz sintética de gTTS es robótica y requiere revisión.
- Prototipado de asistentes de traducción en vivo: sirve como base para validar la viabilidad de un traductor voz-a-voz antes de invertir en modelos ASR/TTS de mayor calidad.
- Generación de material de accesibilidad: conversión de audios en portugués a versiones en inglés o español para audiencias que no dominan el idioma original.
- Docencia y demostraciones de pipelines de IA: el repositorio documenta la arquitectura y enlaza un vídeo sobre LoRA, por lo que puede usarse como material didáctico para explicar la composición de etapas ASR + MT + TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; Whisper Tiny requiere muy poca memoria (del orden de 1 GB en fp16), NLLB-200 depende de la variante elegida y gTTS no requiere GPU porque es un servicio externo.
- GPU recomendadas: no disponible; por el tamaño de Whisper Tiny, una GPU consumer básica o incluso CPU podría bastar para la etapa ASR.
- Cabe en GPU consumer: probablemente sí para la etapa ASR y para variantes pequeñas de NLLB-200, pero no se aportan medidas concretas.
- Opciones de despliegue: no se documentan; el pipeline podría implementarse con las librerías de Hugging Face Transformers para Whisper y NLLB, y con la librería `gtts` para la síntesis.
- Latencia y throughput: no disponibles; gTTS introduce dependencia de red y latencia variable.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Pesos publicados | Notas |
|---|---|---|---|---|---|
| gabadorno/voice-to-voice-translator | Pipeline ASR+MT+TTS | pt, en, es | MIT | No | Documentación de arquitectura, sin checkpoints propios |
| OpenAI Whisper (familia) | ASR | ~99 idiomas | MIT | Sí | Modelo base usado en la etapa 1 |
| Meta NLLB-200 | Traducción | 200 idiomas | CC-BY-NC 4.0 (según variante) | Sí | Modelo base usado en la etapa 2 |
| gTTS | TTS | Múltiples | No especificada | No (servicio) | Etapa 3 del pipeline |

La comparativa directa con un modelo único no es posible porque este repositorio no publica un modelo entrenado. Frente a pipelines propietarios de dubbing (por ejemplo, soluciones comerciales de doblaje automático), carece de sincronización labial y de voces neuronales de alta calidad.

## Limitaciones y advertencias

- No publica pesos ni checkpoints: el repositorio es documentación de arquitectura, no un modelo listo para descargar y ejecutar.
- La calidad final está acotada por el componente más débil: Whisper Tiny tiene una precisión ASR inferior a variantes mayores y gTTS produce voz sintética poco natural.
- Dependencia de un servicio externo (gTTS) que requiere conexión a red y puede tener límites de uso o cambios de disponibilidad.
- Idiomas limitados a pt, en y es; no se documenta cobertura más amplia.
- No hay sincronización labial ni control de prosodia, por lo que el resultado no es apto para doblaje profesional.
- Riesgo de errores en cascada: un fallo de transcripción se propaga a la traducción y a la síntesis.
- No se documentan sesgos específicos, pero al heredar componentes de terceros arrastra los sesgos de Whisper y NLLB-200.
- La licencia MIT del repositorio no exime de respetar las licencias de los submodelos utilizados (NLLB-200 tiene restricciones de uso comercial en algunas variantes).
- No se han publicado evaluaciones objetivas de calidad (BLEU, WER, MOS) en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gabadorno/voice-to-voice-translator
- Vídeo teórico sobre LoRA citado en la model card: https://www.youtube.com/watch?v=UU1B_RoLBkM
- Whisper (OpenAI): https://github.com/openai/whisper
- NLLB-200 (Meta AI): https://ai.meta.com/research/no-language-left-behind/
- gTTS: https://github.com/pndurette/gTTS
