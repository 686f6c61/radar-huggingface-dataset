# Allinsama/OpenMOSS-Team__MOSS-TTS-Realtime

## Resumen

MOSS-TTS-Realtime es un modelo de síntesis de voz (text-to-speech) orientado a agentes de voz en tiempo real, desarrollado por MOSI.AI y el equipo OpenMOSS dentro de la familia MOSS-TTS. Su rasgo diferencial frente a un TTS convencional es que condiciona la síntesis en el historial completo del diálogo —tanto el texto previo como la acústica de los turnos anteriores del usuario—, de modo que mantiene una voz coherente y consistente a lo largo de conversaciones multiturno, con síntesis en streaming y baja latencia.

El modelo forma parte de una familia de cinco piezas (MOSS-TTS, MOSS-TTSD, MOSS-VoiceGenerator, MOSS-SoundEffect y este MOSS-TTS-Realtime) que pueden usarse por separado o encadenadas en un pipeline de producción. La familia se apoya en el tokenizador de audio presentado en el paper *MOSS-Audio-Tokenizer: Scaling Audio Tokenizers for Future Audio Foundation Models*, y Realtime es la variante específicamente diseñada para el bucle conversacional de un asistente hablado.

En cuanto a tamaño, la model card de la familia declara 1,7 B de parámetros para esta variante, mientras que el recuento real de los safetensors publicados en el repositorio es de 2.331.940.864 parámetros (unos 2,33 B). Soporta 20 idiomas, se distribuye bajo licencia Apache-2.0 y los pesos están en formato safetensors con código personalizado para `transformers`. Es relevante ahora porque cubre un hueco poco atendido en el ecosistema abierto: TTS de streaming con memoria de contexto, pensado para integrarse en agentes conversacionales en lugar de para narración de un solo turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossTTSRealtime (generación de tokens de audio con código personalizado en `transformers`; arquitectura interna no detallada en la información disponible) |
| Parametros totales | 2.331.940.864 (~2,33 B) según safetensors; la model card de la familia declara 1,7 B |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | 20: chino (zh), inglés (en), alemán (de), español (es), francés (fr), japonés (ja), italiano (it), hebreo (he), coreano (ko), ruso (ru), persa (fa), árabe (ar), polaco (pl), portugués (pt), checo (cs), danés (da), sueco (sv), húngaro (hu), griego (el), turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`transformers`, requiere `trust_remote_code` por el código personalizado) |
| Tamano del repositorio | 4,7 GB |
| Pipeline declarado | text-to-speech |
| Entrada / salida | Texto + contexto de diálogo (texto y acústica previa) → audio |

## Arquitectura y entrenamiento

La información disponible identifica la arquitectura como `MossTTSRealtime`, implementada como código personalizado dentro de `transformers`. La familia se apoya en el tokenizador de audio descrito en el paper *MOSS-Audio-Tokenizer: Scaling Audio Tokenizers for Future Audio Foundation Models* (arXiv:2602.10934), que actúa como representación discreta del audio sobre la que trabajan los distintos modelos. No se detalla en la información proporcionada el número de capas, dimensión oculta, mecanismo de atención ni el esquema exacto de decodificación de tokens de audio.

Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Lo que sí se documenta es el mecanismo central de la variante Realtime: el modelo se condiciona en el historial de diálogo, incluyendo la acústica de los turnos previos del usuario, lo que permite mantener consistencia de voz y coherencia de respuesta entre turnos. El diseño está optimizado para síntesis en streaming de baja latencia, requisito propio de agentes de voz interactivos.

## Capacidades

- Síntesis de voz texto-a-audio en streaming, pensada para respuesta en tiempo real dentro de un bucle conversacional.
- Condicionamiento en el historial de diálogo: incorpora el texto previo y la acústica de turnos anteriores del usuario para mantener coherencia y consistencia de voz.
- Conversación multiturno: mantiene la identidad vocal a lo largo de varios intercambios, no solo en una locución aislada.
- Multilingüe: 20 idiomas, incluyendo español, inglés, chino, alemán, francés, japonés, coreano, árabe, hindi no incluido, ruso, portugués, italiano, turco, polaco y griego, entre otros.
- Integración en `transformers` mediante código personalizado (`trust_remote_code`).
- Capacidad de composición dentro de la familia MOSS-TTS: puede combinarse con MOSS-VoiceGenerator (diseño de timbre) o MOSS-SoundEffect (efectos) en un pipeline mayor.
- No disponible: soporte declarado de tool calling, function calling, razonamiento multi-paso, visión o audio de entrada como comprensión (el modelo es de salida de audio, no un modelo multimodal de comprensión).

## Casos de uso

- Agentes de voz para atención al cliente: el modelo mantiene el hilo de una conversación multiturno y conserva el timbre entre respuestas, lo que evita el efecto de "voz que cambia" típico de encadenar síntesis independientes por turno. Adecuado para IVR avanzado y soporte telefónico.
- Asistentes conversacionales en dispositivos (kioscos, terminales de información): al ser un modelo de ~2,3 B, puede desplegarse en una GPU de gama media y responder en streaming sin depender de un servicio externo.
- Doblaje y voice-over interactivo: combinado con MOSS-VoiceGenerator para fijar el timbre y con este modelo para la síntesis en streaming, permite generar diálogos con continuidad vocal en producciones de varios turnos.
- NPCs y personajes de videojuego: la memoria de contexto acústico y textual permite que un personaje responda con la misma voz a lo largo de toda una partida, incluyendo cambios de tono según el historial de interacción.
- Tutores de idiomas conversacionales: cubre 20 idiomas y sostiene diálogos con contexto, lo que sirve para prácticas de conversación donde el sistema debe recordar lo dicho en turnos previos.
- Accesibilidad y lectura conversacional: lectura en voz alta de contenido con interacción posterior del usuario, manteniendo continuidad de voz entre la lectura y las respuestas del asistente.
- Integración en pipelines speech-to-speech: encadenado detrás de un LLM y un ASR, el modelo aporta la pata de síntesis con latencia baja y consistencia de voz dentro de un agente completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER, latencia, RTF) ni comparativas numéricas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 4,7 GB solo para pesos (coincide con el tamaño del repositorio), más overhead de activaciones y del decodificador de audio; en la práctica, entre 6 y 8 GB con margen para streaming.
- VRAM estimada en int8: alrededor de 2,3 GB de pesos; en torno a 3-4 GB con overhead. Cifras orientativas: no hay cuantizaciones oficiales publicadas para este modelo.
- VRAM estimada en int4: alrededor de 1,2 GB de pesos, aunque la pérdida de calidad en un modelo de audio puede ser apreciable y no está evaluada.
- GPU profesionales: A100, H100 o L40S para servir múltiples sesiones concurrentes en streaming con holgura.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en fp16; en tarjetas de 8 GB conviene valorar int8.
- Despliegue: al ser código personalizado de `transformers`, la vía directa es la librería `transformers` con `trust_remote_code=True`. No hay confirmación de soporte en vLLM, TGI, llama.cpp, Ollama ni LM Studio, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles. El modelo está diseñado explícitamente para streaming de baja latencia, pero no se han publicado cifras de RTF ni de tiempo hasta el primer chunk de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Idiomas |
|---|---|---|---|---|---|
| MOSS-TTS-Realtime | ~2,33 B (safetensors) / 1,7 B declarados | No disponible | Apache-2.0 | TTS en streaming con contexto de diálogo multiturno | 20 |
| MOSS-TTS | 8 B | No disponible | Apache-2.0 (según familia) | TTS de producción con clonación zero-shot y síntesis de formato largo | 20 |
| MOSS-TTS-Local-Transformer | 1,7 B | No disponible | Apache-2.0 (según familia) | Variante ligera de TTS | No disponible |
| CSM-1B (Sesame) | ~1 B (backbone) + decoder | No disponible | Apache-2.0 | Speech-to-speech conversacional | Principalmente inglés |
| Moshi (Kyutai) | ~7 B | No disponible | No disponible en la información consultada | Speech-to-speech full-duplex en tiempo real | Inglés y francés |

Dentro del propio ecosistema, la alternativa natural es MOSS-TTS (8 B), más pesado y orientado a narración y clonación de voz de alta fidelidad, frente a Realtime, que prioriza latencia y memoria de conversación. Para usos de un solo turno y máxima calidad de timbre, el modelo insignia de la familia es la opción lógica.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados: no es posible comparar objetivamente calidad, naturalidad o inteligibilidad frente a alternativas con datos públicos.
- El repositorio analizado (`Allinsama/OpenMOSS-Team__MOSS-TTS-Realtime`) es una réplica subida por un tercero, con 0 descargas y 0 likes. Para producción conviene usar el repositorio oficial `OpenMOSS-Team/MOSS-TTS-Realtime` y verificar la integridad de los pesos.
- Discrepancia de tamaño: la model card declara 1,7 B y los safetensors suman 2,331 B. Hay que validar el recuento real antes de dimensionar infraestructura.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ) ni formatos alternativos, lo que limita el despliegue en CPU y en GPUs de gama baja.
- No se especifica la longitud de contexto soportada, un parámetro crítico para un modelo que depende del historial de diálogo: se desconoce cuántos turnos puede retener.
- Riesgo de artefactos acústicos y de alucinación en audio: el modelo puede generar prosodia incorrecta, pronunciaciones erróneas o ruido en entradas atípicas, especialmente en idiomas con menos representación en los datos.
- Riesgo de uso indebido para suplantación de voz: al condicionarse en la acústica del usuario, conviene implantar controles de consentimiento y marcas de agua en despliegues públicos.
- Sesgos no documentados: no se detalla la distribución de acentos, géneros, edades ni dominios del corpus de entrenamiento, por lo que el comportamiento fuera de dominio es incierto.
- La licencia Apache-2.0 permite uso comercial, pero no cubre posibles reclamaciones sobre voces clonadas ni sobre los datos de entrenamiento, no documentados.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y exige auditoría previa en entornos sensibles.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/Allinsama/OpenMOSS-Team__MOSS-TTS-Realtime
- Repositorio oficial del modelo: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Realtime
- README oficial: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Realtime/blob/main/README.md
- Repositorio GitHub de la familia MOSS-TTS: https://github.com/OpenMOSS/MOSS-TTS
- Model card del modelo Realtime: https://github.com/OpenMOSS/MOSS-TTS/blob/main/docs/moss_tts_realtime_model_card.md
- Paper del tokenizador de audio: https://huggingface.co/papers/2602.10934
- Paper de la familia (arXiv): https://arxiv.org/abs/2603.18090
- Colección en ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Blog de MOSI.AI: https://mosi.cn/#models
- Demo / AI Studio: https://studio.mosi.cn
- Documentación de la API: https://studio.mosi.cn/docs/moss-tts
- Página del proyecto: https://moss-tts.apposters.com/
- Réplica en GitHub: https://github.com/hkmoon/moss-tts
- Twitter: https://x.com/Open_MOSS
- Discord: https://discord.gg/fvm5TaWjU3
