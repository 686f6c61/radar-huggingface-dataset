# masterofaudio2077/sensevoice-small-anime-ja

## Resumen

SenseVoiceSmall adapted to anime Japanese es un ajuste fino del modelo de reconocimiento automático del habla (ASR) SenseVoiceSmall, desarrollado por FunAudioLLM (Alibaba). El autor del ajuste es el usuario de Hugging Face masterofaudio2077. El modelo resuelve un problema concreto: la transcripción de diálogo de anime en japonés, un dominio donde los modelos ASR generalistas rinden peor por la dicción exagerada, el vocabulario específico y la presencia habitual de música de fondo y efectos de sonido.

El ajuste se ha realizado exclusivamente sobre la cabeza CTC del modelo base, manteniendo el codificador original, y se ha entrenado con 92,28 horas de clips de anime japonés procedentes de ANIM-400K, mezclando música del corpus MUSAN para hacer el sistema más robusto en condiciones de ruido musical. Según la model card, el modelo reduce el CER (tasa de error de caracteres) en decodificación greedy CTC desde 0,286 hasta 0,175 en audio limpio sobre cuatro series no vistas durante el entrenamiento.

Es relevante ahora porque los modelos ASR multilingües de propósito general no están optimizados para dominios especializados como el anime, y este tipo de ajustes de bajo coste (solo cabeza CTC, 8000 pasos) permiten mejoras medibles en un caso de uso muy demandado por la comunidad de subtitulado y accesibilidad. El repositorio tiene 1,9 GB y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseVoiceSmall (codificador transformer + cabeza CTC); ajuste solo de la cabeza CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | model.pt y model_final.pt (PyTorch, cargables con FunASR `AutoModel`) |

## Arquitectura y entrenamiento

El modelo parte de FunAudioLLM/SenseVoiceSmall, un sistema ASR con codificador tipo transformer y cabeza de clasificación CTC. En este ajuste se ha mantenido el codificador congelado y se ha entrenado únicamente la cabeza CTC, lo que reduce el coste computacional y el riesgo de sobreajuste sobre el codificador preentrenado. La carga se realiza con la API de FunASR mediante `AutoModel(model=<carpeta local>)`, igual que el modelo original.

El entrenamiento se realizó durante 8000 pasos sobre 92,28 horas de clips de anime japonés extraídos de ANIM-400K. Antes del entrenamiento se filtraron los clips cuya transcripción previa con el CTC preentrenado superaba un CER de 0,8 respecto a la anotación: se descartaron 14.596 de los 66.722 clips. Además, se mezcló música del corpus MUSAN en el audio de entrenamiento para mejorar la robustez frente a bandas sonoras y efectos. Se guardaron dos checkpoints: `model.pt` (mejor CER medio de validación sobre condiciones limpias y con música, en el paso 8000) y `model_final.pt` (último paso).

## Capacidades

- Reconocimiento automático del habla en japonés, especializado en diálogo de anime.
- Decodificación CTC greedy, sin modelo de lenguaje externo ni puntuación automática (ITN desactivado en los ejemplos de la model card).
- Robustez mejorada frente a música de fondo: mantiene mejoras de CER incluso con música a 0 dB.
- Integración con el ecosistema FunASR para carga y ejecución.
- No se documentan capacidades de traducción, diarización, detección de emociones ni tool calling.
- No se documentan capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Subtitulado automático de anime: el modelo transcribe diálogo japonés de series con música y efectos de fondo, con un CER de 0,175 en audio limpio y 0,209 con música a 0 dB, lo que lo hace adecuado como primera pasada para revisión humana.
- Generación de borradores de subtítulos para plataformas de vídeo: al estar especializado en dicción de anime, reduce errores en nombres propios y expresiones típicas del género frente al modelo base.
- Accesibilidad de contenido japonés: transcripción de episodios para personas con discapacidad auditiva, aprovechando la tolerancia a música de fondo.
- Archivado y búsqueda de catálogos de anime: transcripción masiva de episodios para indexar diálogo y permitir búsqueda por texto.
- Investigación en ASR de dominio específico: sirve como referencia de ajuste de bajo coste (solo cabeza CTC) sobre SenseVoiceSmall para otros dominios.
- Evaluación comparativa de robustez frente a ruido musical: los datos de CER con música a 10, 5 y 0 dB permiten medir el impacto de la banda sonora en sistemas ASR.
- Preprocesado para pipelines de doblaje o traducción: la transcripción en japonés puede alimentar etapas posteriores de traducción automática.

## Benchmarks y rendimiento

Resultados de CER greedy CTC frente a la anotación del dataset, sobre cuatro series no vistas durante el entrenamiento (según la model card):

| Condicion | Zero-shot (SenseVoiceSmall) | Este modelo |
|---|---|---|
| Audio limpio | 0,286 | 0,175 |
| Musica reservada a 10 dB | 0,280 | 0,180 |
| Musica a 5 dB | 0,291 | 0,189 |
| Musica a 0 dB | 0,319 | 0,209 |

Ejemplos individuales de la model card (CER con puntuación ignorada):

| Audio | Referencia | SenseVoiceSmall original (CER) | Este modelo (CER) |
|---|---|---|---|
| sample1 | はじめまして。せりなバブルと申します。 | はじめましてスセリーナバーグと申します (0,412) | はめまして。セリナバグと申します。 (0,353) |
| sample2 | 満足が牛乳脈へ干渉したせいで。魔物が引き寄せられているんだ。 | 魔族が牛脈へ干渉したせいで魔物が引き寄せられているんだ (0,107) | 満族が牛脈へ干渉したせいで。魔物が引き寄せられているんだ。 (0,071) |
| sample3 | ずっとそばにいさせてください。 | 二人の様どうかずっとそばにいさせてください (0,500) | どうかずっとそばにいさせてください。 (0,214) |
| sample4 | わがままかもしれないけど。気持ちに嘘はつけないから。 | 幸せになりたいわがままかもしれないけど気持ちに嘘はつけないから (0,292) | わがままかもしれないけど。気持ちに。嘘はつけないから。 (0,000) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio ocupa 1,9 GB, lo que sugiere un modelo de tamano reducido apto para GPU de gama media.
- GPU recomendadas: no disponible de forma explícita; por el tamano del repositorio, es probable que quepa en GPU de consumo, pero no se confirma en la informacion.
- Cabe en consumer GPU: no confirmado en la informacion proporcionada.
- Opciones de despliegue: FunASR (`AutoModel(model=<carpeta local>)`), según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | CER audio limpio (4 series) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (sensevoice-small-anime-ja) | ASR CTC ajustado a anime | ja | 0,175 | Apache 2.0 | Hugging Face |
| FunAudioLLM/SenseVoiceSmall | ASR generalista | multilingue | 0,286 (en el mismo test) | no disponible en la informacion | Hugging Face |
| Alternativas ASR japonesas especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado solo con japonés y solo sobre clips de anime; el rendimiento fuera de ese dominio (habla espontánea, noticias, conversación telefónica) no está documentado y probablemente sea inferior.
- El ajuste se limita a la cabeza CTC: no se ha reentrenado el codificador, por lo que las limitaciones del modelo base persisten.
- La decodificación evaluada es CTC greedy sin modelo de lenguaje ni puntuación; los CER reportados no reflejan el rendimiento con un LM externo.
- Los ejemplos de la model card muestran errores notables en nombres propios y algunas omisiones o sustituciones de palabras.
- Riesgo de alucinación: como todo sistema ASR, puede generar texto plausible no presente en el audio, especialmente con música fuerte o solapamiento de voces.
- Sesgos: el corpus ANIM-400K puede sobrerrepresentar ciertos estilos de voz, personajes o registros; no se documenta análisis de sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta restricciones adicionales sobre el corpus de entrenamiento ni sobre el modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- No se documentan requisitos de hardware, latencia ni opciones de cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/sensevoice-small-anime-ja
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Ejemplos de audio: https://huggingface.co/masterofaudio2077/sensevoice-small-anime-ja/resolve/main/samples/sample1.mp3 (y sample2.mp3, sample3.mp3, sample4.mp3 en la misma carpeta)
- Repositorio FunASR: no disponible en la informacion proporcionada
- Paper de SenseVoice: no disponible en la informacion proporcionada
- Dataset ANIM-400K: no disponible en la informacion proporcionada
- Corpus MUSAN: no disponible en la informacion proporcionada
