# ACloudCenter/vibevoice-final-samples

## Resumen

ACloudCenter/vibevoice-final-samples es un repositorio de HuggingFace publicado por ACloudCenter que recopila muestras de audio (ficheros .wav) de un ajuste fino conjunto realizado sobre VibeVoice-1.5B. No es un repositorio de pesos: el tamano declarado del repo es de 0.0 GB, no se especifica pipeline, licencia ni idiomas, y la model card se limita a describir el orden de escucha de las muestras y la receta de inferencia empleada. Las muestras documentan un adaptador LoRA sobre el LLM de VibeVoice mas un cabezal de difusion entrenado por completo, con una cadena de calentamiento (warm-start) fullv3 -> emo3 -> emo4.

El objetivo del trabajo es anadir control emocional fino a un modelo de sintesis de voz conversacional: seleccion de emocion por referencia, etiquetas de emocion por turno de dialogo, y generacion de escenas multi-hablante con estados emocionales distintos en una misma conversacion. La model card reporta metricas internas de inteligibilidad (WER), similitud de hablante (SIM), desplazamientos de frecuencia fundamental (F0) y coste computacional relativo, siempre comparadas contra el VibeVoice original ("stock").

Es relevante ahora porque documenta, con cifras explicitas, un caso de ajuste fino emocional sobre un modelo TTS reciente, incluyendo los compromisos asumidos: la inteligibilidad medida cae de forma notable respecto al modelo base (WER 0.32-0.41 frente a 0.03), mientras que la similitud de hablante se mantiene alta (SIM 0.92-0.93 frente a 0.94). El repositorio funciona como evidencia cualitativa y diagnostico de calidad, no como distribucion del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM mas cabezal de difusion (VibeVoice); ajuste con LoRA sobre el LLM y cabezal de difusion reentrenado por completo |
| Parametros totales | 1.5B (modelo base VibeVoice-1.5B; los parametros del adaptador LoRA no se detallan) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las muestras demo usan ingles, con acentos estadounidenses y referencias CREMA-D) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene muestras de audio, no pesos) |

## Arquitectura y entrenamiento

VibeVoice combina un modelo de lenguaje con un cabezal de difusion para generar voz. En este trabajo, el ajuste se realiza de forma conjunta: se aplica un adaptador LoRA sobre el componente LLM y se reentrena por completo el cabezal de difusion. La model card indica que 5 intentos previos de entrenar solo el cabezal produjeron audio incoherente ("babble"), mientras que el entrenamiento conjunto produjo dialogo inteligible; el audio de la muestra 02 se presenta como prueba de ello. La cadena de calentamiento seguida es fullv3 -> emo3 -> emo4, donde emo4 corresponde a una ampliacion con datos mas limpios.

La receta de despliegue ("ship recipe") concreta es: adaptador emo4 (vibevoice-lora-joint/emo4), 20 pasos DDPM, etiquetas en el guion del tipo <angry>/<sad>, clips de referencia emocional por hablante con grabaciones limpias, y CFG 1.3. No se detallan en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineamiento como RLHF o DPO: esa informacion es no disponible.

## Capacidades

- Sintesis de voz conversacional con multiples hablantes en una misma escena (la muestra 06 incluye tres hablantes con emociones distintas: enfado, miedo y sorpresa).
- Control de emocion por referencia: se sustituye el clip de referencia manteniendo actores y dialogo, y cambia la emocion generada (por ejemplo ANGRY_ANGRY, SAD_SAD y mezcla ANGRY_SAD por hablante).
- Control de emocion mediante etiquetas en el guion (<angry>/<sad>/...), operativo con referencias emocionales coherentes.
- Cambio de emocion por turno de dialogo: un mismo actor pasa de enfado a alivio a mitad de conversacion (autoría de doble ranura).
- Transferencia de acento ligada a la referencia: las muestras CREMA-D aportan acentos no estadounidenses, lo que la model card interpreta como evidencia de condicionamiento total por referencia.
- Paleta de 8 emociones con voz y frase constantes en la muestra RAVDESS (acento estadounidense), con F0 medido por emocion (ANGRY 328 Hz; SAD el mas bajo).
- Diagnostico de calidad y separacion de fuentes de ruido: la muestra 09 identifica estatica atribuida a la referencia (CREMA-D con suelo de ruido 0.006 en generacion frente a 0.0001-0.0004 con referencias limpias).

No se mencionan en la informacion disponible capacidades de tool calling, uso de agentes, vision ni audio de entrada distinto de los clips de referencia.

## Casos de uso

- Doblaje y localizacion con emocion controlada: fijando un clip de referencia emocional por personaje, el modelo reproduce la emocion deseada manteniendo la identidad de voz (SIM 0.92-0.93), adecuado para doblar dialogos donde la emocion varia por escena.
- Audiolibros y narracion multihablante: gracias al soporte de tres voces en una misma conversacion y al cambio de emocion por turno, permite narrar dialogos de novela con personajes diferenciados.
- Generacion de voz para videojuegos y personajes conversacionales: las etiquetas de emocion en el guion permiten que un personaje pase de enfado a alivio dentro de una misma linea de dialogo, util para arboles de dialogo ramificados.
- Prototipado rapido de escenas de audio drama: la muestra 06 (enfado, miedo y sorpresa en una conversacion) demuestra la generacion de escenas completas con carga emocional mixta sin regrabar actores.
- Estudio de control emocional en TTS: con F0 medido por emocion (desplazamientos de 300 a 184 Hz con direccionamiento por referencia, y -87 Hz por canal de etiqueta con referencias fijas), sirve como base para experimentos academicos de condicionamiento emocional.
- Evaluacion y diagnostico de calidad de referencias: la muestra 09 documenta como la eleccion de clips de referencia limpios reduce el suelo de ruido de generacion de 0.006 a 0.0001-0.0004, util para definir protocolos de grabacion de referencias.
- Aplicaciones de accesibilidad y lectura en voz alta con matiz emocional: la variacion de F0 y la etiquetacion por turno permiten ajustar la entonacion de contenido largo leido.

Advertencia: la inteligibilidad medida en este ajuste (WER 0.32-0.41) es muy inferior a la del modelo base (0.03), por lo que los casos de uso en produccion exigirian validacion adicional y, probablemente, el modelo original.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor y comparan el ajuste propio con VibeVoice "stock". No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque se trata de un modelo de sintesis de voz.

| Metrica | Modelo ajustado | VibeVoice stock | Notas |
|---|---|---|---|
| Inteligibilidad (WER) | 0.32-0.41 | 0.03 | Ejecucion unica; variabilidad entre ejecuciones de +-0.1 |
| Identidad de hablante (SIM) | 0.92-0.93 | 0.94 | Similitud de hablante |
| Emocion (F0, direccionamiento por referencia) | 300 -> 184 Hz | no disponible | Cambio medido al sustituir la referencia |
| Emocion (canal de etiqueta, referencias fijas) | -87 Hz | no disponible | Desplazamiento de F0 por etiqueta |
| Velocidad | ~1.4-1.5x mas lento que stock | referencia | Limitado por arquitectura; techo medido |
| Suelo de ruido con referencias limpias | 0.0001-0.0004 | no disponible | Frente a 0.006 con referencias CREMA-D |

## Requisitos de hardware

- No disponible en la informacion proporcionada. La model card no especifica requisitos de hardware, VRAM ni GPUs recomendadas.
- No disponible el formato de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.), dado que el repositorio no distribuye pesos ni scripts de inferencia.
- Dato orientativo no confirmado: el modelo base es VibeVoice-1.5B, un orden de magnitud que suele caber en GPUs de consumo, pero la model card no aporta confirmacion ni cifras de VRAM para este ajuste.
- Latencia y throughput: la model card solo indica que la inferencia es aproximadamente 1.4-1.5 veces mas lenta que el modelo stock, con el coste descrito como ligado a la arquitectura y medido como techo.

## Comparativa con modelos similares

La unica comparacion con datos disponibles en la informacion proporcionada es contra el propio VibeVoice-1.5B sin ajustar. No hay datos de otros modelos TTS en la informacion suministrada.

| Modelo | Parametros | Contexto | Inteligibilidad (WER) | Identidad (SIM) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ACloudCenter/vibevoice-final-samples (emo4) | 1.5B (base) | no disponible | 0.32-0.41 | 0.92-0.93 | no disponible | Repositorio de muestras, sin pesos |
| VibeVoice-1.5B (stock) | 1.5B | no disponible | 0.03 | 0.94 | no disponible | No disponible en la informacion |
| Otros modelos TTS | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La inteligibilidad medida es muy inferior a la del modelo base: WER de 0.32-0.41 frente a 0.03. La propia model card reconoce que 5 intentos previos con solo el cabezal produjeron audio incoherente y que la metrica procede de una unica ejecucion con variabilidad de +-0.1.
- No se especifica licencia. No hay confirmacion de permisos para uso comercial, por lo que no puede asumirse ningun derecho de explotacion.
- El repositorio no contiene pesos ni codigo de inferencia, solo muestras de audio; no es directamente desplegable.
- El condicionamiento por referencia es muy dependiente de la calidad de la referencia: con clips CREMA-D el suelo de ruido de generacion sube a 0.006 frente a 0.0001-0.0004 con referencias limpias, y 20 pasos DDPM multiplican por 4 la componente de alta frecuencia.
- Riesgo de alucinacion acustica y de artefactos, evidenciado por el historial de intentos fallidos y por la caida de inteligibilidad; requiere validacion humana antes de cualquier uso en produccion.
- Idiomas y cobertura linguistica no documentados. Las muestras usan ingles; no hay evidencia de soporte multilingue.
- No se detallan sesgos de generacion de voz (por ejemplo, asociados a acento o genero) mas alla de la observacion de que las referencias CREMA-D transfieren acentos no estadounidenses; conviene auditar cualquier despliegue.
- El tamano del repo es de 0.0 GB y no tiene descargas ni likes, lo que indica que no es un artefacto publicado para uso general.

## Enlaces

- HuggingFace: https://huggingface.co/ACloudCenter/vibevoice-final-samples
- Enlaces a papers, blogs, repositorios o demos: no disponibles en la informacion proporcionada.
- Nota: los resultados de busqueda web adjuntos no guardan relacion con el modelo (versan sobre el canje de permisos de conducir en Francia) y no se incluyen como enlaces relevantes.
