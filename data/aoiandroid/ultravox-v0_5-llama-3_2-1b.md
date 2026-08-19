# aoiandroid/ultravox-v0_5-llama-3_2-1b

## Resumen

Ultravox v0.5 es un modelo de lenguaje multimodal especializado en voz, desarrollado por Fixie.ai. Combina un decoder Llama 3.2 1B Instruct congelado con el encoder de Whisper large v3 turbo, que se ajusta durante el entrenamiento. El modelo acepta como entrada tanto texto como audio, y genera respuestas de texto. Está diseñado para agentes de voz en tiempo real, traducción de voz y análisis de audio hablado, ofreciendo una alternativa ligera (683 millones de parámetros) frente a las versiones de 8B y 70B del mismo modelo.

La arquitectura emplea un token especial `<|audio|>` que el procesador sustituye por las embeddings derivadas del audio de entrada. El entrenamiento se realizó mediante destilación de conocimiento, donde Ultravox intenta replicar las logits del modelo de texto Llama 3.2 1B. No se aplicó ajuste por preferencias en esta revisión, y la generación de audio queda planificada para futuras versiones. Su licencia MIT y su tamaño reducido lo hacen atractivo para despliegues en entornos con recursos limitados, aunque el backbone Llama 3.2 impone restricciones adicionales de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: decoder Llama 3.2 1B Instruct (congelado) + encoder Whisper large v3 turbo (ajustado) + adaptador multimodal |
| Parametros totales | 683.118.592 (~683 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificado en la documentacion) |
| Tipos de cuantizacion | No disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | arabe, bielorruso, bulgaro, bengali, checo, galés, danes, aleman, griego, ingles, español, estonio, persa, finlandes, frances, gallego, hindi, hungaro, italiano, japones, georgiano, lituano, leton, macedonio, marati, neerlandes, polaco, portugues, rumano, ruso, eslovaco, esloveno, serbio, sueco, suajili, tamil, tailandes, turco, ucraniano, urdu, vietnamita, chino |
| Licencia | MIT (con restricciones del backbone Llama 3.2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal de voz basada en dos componentes principales: un decoder de lenguaje Llama 3.2 1B Instruct, que permanece congelado durante el entrenamiento, y el encoder de Whisper large v3 turbo, que sí se ajusta. Un adaptador multimodal entrenable conecta ambos módulos y transforma las representaciones de audio en embeddings compatibles con el espacio de texto del LLM. La entrada se construye como un prompt de texto que contiene un token pseudo `<|audio|>`, reemplazado por el procesador con las embeddings del audio de entrada.

El entrenamiento utiliza una pérdida de destilación de conocimiento: Ultravox aprende a igualar las logits del modelo de texto Llama 3.2 1B cuando recibe la misma información en forma de audio. El conjunto de datos combina datasets de reconocimiento automático de voz (ASR) con continuaciones generadas por Llama 3.1 8B, y datasets de traducción de voz, lo que mejora los resultados en tareas de traducción. El entrenamiento se realizó en precisión mixta BF16 sobre 8 GPUs H100. No se aplicó RLHF ni DPO en esta versión.

## Capacidades

- Entrada multimodal de audio y texto: acepta prompts de sistema en texto y mensajes de usuario en audio, generando respuestas de texto.
- Traduccion de voz a voz: puede traducir audio hablado entre idiomas (por ejemplo, ingles a aleman o arabe), como muestran los resultados en covost2.
- Analisis de audio hablado: capaz de procesar y responder sobre contenido de audio, como resumir conversaciones o extraer informacion.
- Agente de voz conversacional: permite mantener dialogos multi-turno donde el usuario habla y el modelo responde por texto, util para asistentes de voz.
- Soporte multilingue: cubre mas de 40 idiomas, incluyendo europeos, asiaticos y de Oriente Medio.
- Generacion de texto unicamente: no genera audio de salida en esta version; la salida es siempre texto.

## Casos de uso

- Agente de voz para atencion al cliente: el modelo puede gestionar consultas habladas de usuarios y responder por texto, integrandose en sistemas de IVR o chatbots con voz. Su tamano reducido permite desplegarlo en servidores modestos con baja latencia.
- Traduccion automatica de voz en tiempo real: sirve para subtitulado o interpretacion simultanea en reuniones, conferencias o contenido multimedia, aprovechando su capacidad de traduccion speech-to-speech.
- Transcripcion y resumen de reuniones: recibe el audio de una reunion y genera actas o resumenes en texto, extrayendo puntos clave o acciones a tomar.
- Analisis de sentimiento en llamadas de soporte: procesa grabaciones de llamadas para detectar tono, frustracion o satisfaccion del cliente, ayudando a mejorar la calidad del servicio.
- Asistente personal por voz en dispositivos embebidos: al ser un modelo de ~683M parametros, puede ejecutarse en hardware de gama media (Raspberry Pi 5, mini PCs) para control por voz de domotica o consultas de informacion.
- Tutor de idiomas conversacional: permite practicar pronunciacion y comprension oral en multiples idiomas, dando feedback por texto al estudiante.
- Accesibilidad para personas con discapacidad auditiva: transcribe audio hablado a texto en tiempo real, facilitando la comunicacion en entornos publicos o laborales.

## Benchmarks y rendimiento

La tabla siguiente muestra los resultados publicados en la model card oficial, comparando la version de 1B con las versiones de 8B y 70B del mismo modelo. Los valores corresponden a BLEU para los datasets covost2 y accuracy para big bench audio.

| Metrica | Ultravox 0.5 1B | Ultravox 0.5 8B | Ultravox 0.5 70B |
| --- | ---: | ---: | ---: |
| covost2 en_ar | 1.55 | 12.99 | 20.21 |
| covost2 en_ca | 8.06 | 31.54 | 40.01 |
| covost2 en_de | 14.21 | 28.70 | 34.53 |
| covost2 es_en | 24.97 | 40.19 | 43.29 |
| covost2 ru_en | 24.12 | 42.13 | 48.99 |
| covost2 zh_en | 4.76 | 17.22 | 21.37 |
| big bench audio | 39.14 | 66.54 | 82.70 |

La version de 1B muestra un rendimiento significativamente inferior al de sus hermanas mayores, especialmente en traduccion a idiomas con menos recursos como arabe o chino. Aun asi, su ventaja reside en la velocidad y el bajo coste de inferencia, como se indica en los benchmarks diarios de TheFastest.ai.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1.8 GB en safetensors, por lo que en FP16 se necesitan aproximadamente 2 GB de VRAM para los pesos, mas overhead de activaciones y el encoder Whisper. Se estima un minimo de 4 GB de VRAM para inferencia comoda.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como T4 o A10. No requiere GPU de alta gama.
- Compatibilidad con consumer GPU: si, cabe en GPUs de consumo de gama baja y media, y tambien puede ejecutarse en CPU con cuantizacion (si se convierte a GGUF).
- Opciones de despliegue: transformers pipeline con `trust_remote_code=True` (metodo oficial), o mediante el repositorio de Ultravox. No hay versiones GGUF oficiales, pero pueden generarse con herramientas como llama.cpp o mlx. Para produccion, puede servirse con vLLM si se adapta el codigo personalizado.
- Latencia y throughput: no hay datos oficiales publicados. Dado el tamano del modelo, se espera una latencia de decenas de milisegundos por token en GPUs modernas, suficiente para interacciones de voz en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|---|
| Ultravox 0.5 1B (este) | 683 M | no disponible | audio + texto | texto | MIT (con restricciones Llama) | Ligero, rapido, menor precision |
| Ultravox 0.5 8B | 8 B | no disponible | audio + texto | texto | MIT (con restricciones Llama) | Mejor rendimiento en traduccion y razonamiento |
| Ultravox 0.5 70B | 70 B | no disponible | audio + texto | texto | MIT (con restricciones Llama) | Mejor rendimiento global, requiere GPU de datacenter |

La comparativa interna muestra que la version 1B sacrifica notablemente calidad en tareas de traduccion y comprension auditiva frente a las versiones mayores. No se dispone de datos para comparar con otros modelos de voz como Qwen2-Audio o SALMONN en esta informacion.

## Limitaciones y advertencias

- No genera audio de salida: el modelo solo produce texto; la sintesis de voz no esta implementada en esta revision, lo que limita su uso como agente de voz completo sin un modulo TTS externo.
- No se aplico ajuste por preferencias (RLHF/DPO), por lo que las respuestas pueden no estar alineadas con expectativas de seguridad o utilidad en entornos de produccion.
- Rendimiento limitado en traduccion para pares de idiomas con pocos datos, como ingles-arabe (BLEU 1.55) o ingles-chino (BLEU 4.76), segun los benchmarks publicados.
- Riesgo de alucinacion y sesgos: al derivar de Llama 3.2, hereda posibles sesgos del modelo base y puede generar contenido incorrecto o inventado, especialmente en tareas de analisis de audio ambiguo.
- Licencia dual: aunque el modelo se publica bajo MIT, el backbone Llama 3.2 esta sujeto a la Licencia Comunitaria de Llama, que restringe el uso comercial para empresas con mas de 700 millones de usuarios mensuales. Es necesario revisar ambos terminos antes de desplegar en produccion.
- Longitud de contexto no documentada: no se especifica la ventana de contexto maxima, lo que dificulta planificar conversaciones largas o procesamiento de audio extenso.

## Enlaces

- [Modelo original en HuggingFace (fixie-ai)](https://huggingface.co/fixie-ai/ultravox-v0_5-llama-3_2-1b)
- [Modelo espejo en HuggingFace (aoiandroid)](https://huggingface.co/aoiandroid/ultravox-v0_5-llama-3_2-1b)
- [Coleccion Ultravox v0.5 en HuggingFace](https://huggingface.co/collections/fixie-ai/ultravox-v05)
- [Repositorio GitHub de Ultravox](https://github.com/fixie-ai/ultravox)
- [Pagina oficial del proyecto](https://ultravox.ai)
- [Modelo en ModelScope](https://www.modelscope.cn/models/fixie-ai/ultravox-v0_5-llama-3_2-1b)
- [Benchmarks de audio en TheFastest.ai](https://thefastest.ai/?m=audio)
