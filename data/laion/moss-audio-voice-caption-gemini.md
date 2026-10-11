# laion/moss-audio-voice-caption-gemini

## Resumen

laion/moss-audio-voice-caption-gemini es un adaptador LoRA de rango 32 entrenado por LAION sobre el modelo multimodal de audio OpenMOSS-Team/MOSS-Audio-8B-Instruct. No es un modelo completo: el repositorio (0,3 GB) contiene únicamente los pesos del adaptador PEFT más el historial de entrenamiento, y requiere descargar aparte la revisión fijada `d4dc5a6d8cd79b43dcd82884c75e303b1ecd016d` del modelo base.

Su tarea es la generación de descripciones en inglés de voces completas ("whole-audio voice captioning"): a partir de un clip de audio produce texto que describe características audibles de la voz, el estilo de entrega, la emoción, los eventos vocales no verbales (risas, suspiros, pausas) y el entorno de grabación. Está pensado como modelo de generación de texto condicionado por audio, no como clasificador ni como localizador de eventos, y se distingue de los modelos encoder-only de puntuación del proyecto Humaneness Ears.

El interés actual reside en que demuestra un pipeline de adaptación ligera (87,3 M de parámetros entrenables sobre un base de 9,05 B) sobre anotaciones automáticas generadas por Gemini, con un contrato de datos reproducible y verificación por hash de los shards. Es un caso de estudio de destilación de anotaciones sintéticas a un modelo abierto con licencia CC-BY-4.0, útil para etiquetado a escala de corpus de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre MOSS-Audio-8B-Instruct: codificador de audio preentrenado + adaptador audio-lenguaje + inyecciones de audio DeepStack + transformer de lenguaje Qwen3 |
| Parametros totales | 9.139.757.440 (base 9.052.463.488 + adaptador 87.293.952) |
| Parametros activos | No aplica (no es un modelo MoE); no disponible |
| Longitud de contexto | No disponible; el entrenamiento usa un tope de secuencia de 8.192 tokens |
| Tipos de cuantizacion | No disponible; pesos publicados en BF16 (base) y adaptador PEFT sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); modelo base en safetensors |
| Modelo base | OpenMOSS-Team/MOSS-Audio-8B-Instruct, revision d4dc5a6d8cd79b43dcd82884c75e303b1ecd016d |
| Libreria | peft (Transformers 4.57.1 fijado) |
| Tamano del repositorio | 0,3 GB |
| Tasa de tokens de audio | ~12,5 Hz |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base MOSS-Audio-8B-Instruct combina un codificador de audio preentrenado, un adaptador audio-a-lenguaje, inyecciones de audio DeepStack en varias capas y un transformer de lenguaje Qwen3; su nombre "8B" se refiere a la clase de tamano del componente de lenguaje, ya que la instancia real tiene 9.052.463.488 parametros. El adaptador aqui publicado entrena exclusivamente pesos LoRA de rango 32 (alpha 64, dropout 0,05) insertados en las proyecciones de atencion y MLP del transformer de lenguaje. Permanecen congelados los pesos de lenguaje base, el codificador de audio, el adaptador de audio y los mergers DeepStack; no se entrena ni un nuevo codificador ni una cabeza de localizacion de eventos.

El entrenamiento usa 58.380 ejemplos (validacion 3.239, test 3.544) procedentes de la coleccion de anotaciones Gemini `laion/whisper-gemini-voice-annotations`, que une una seleccion S1 balanceada, LAION's Got Talent, fragmentos balanceados de 40 emociones y una prueba de concepto de anotacion de voz. Los splits son disjuntos por SHA256 exacto del MP3 y los ejemplos comparten grabaciones completas dentro de cada split. Las etiquetas son descripciones generadas por Gemini, no verdad humana adjudicada de forma independiente; algunos clips S1 vistos en el preentrenamiento previo de modelos de puntuacion Whisper fueron excluidos del split de entrenamiento. La supervision es texto libre (`voice_caption`) y la unica entrada es el audio, el prompt de tarea y, en la variante de eventos, los extremos de intervalo numericos: nunca transcripcion, etiqueta de clase, caption de referencia ni vector de puntuacion.

La receta: 2 epocas, 1.826 actualizaciones, AdamW con weight decay 0,01, learning rate pico 1e-4 con 5% de warmup y decaimiento coseno, batch efectivo de 64 (4 GPUs x 1 ejemplo x 16 microbatches acumulados), precision BF16 y atencion SDPA. Audio mono a 16 kHz, grabacion completa sin recorte por evento y marcadores temporales de audio desactivados. La perdida es entropia cruzada media de siguiente token calculada solo sobre los tokens del caption del asistente. El mejor checkpoint es checkpoint-1826, con una perdida de validacion de 1,290871. El gradient checkpointing esta desactivado porque la ruta DeepStack usa hooks de forward temporales, y `model_accepts_loss_kwargs=False` garantiza el escalado correcto de la acumulacion.

## Capacidades

- Generacion de descripciones de voz en lenguaje natural en ingles: caracteristicas audibles, timbre, estilo de entrega y prosodia.
- Descripcion de emociones y actitudes percibidas en la voz (el corpus de entrenamiento incluye 40 emociones balanceadas).
- Deteccion y descripcion de eventos vocales no verbales: risas, suspiros, respiraciones, pausas, vocalizaciones.
- Descripcion del entorno de grabacion: condiciones acusticas, ruido de fondo, caracter de la sala.
- Entrada de audio a 16 kHz mono, con clips completos de hasta 30 segundos que coinciden con la distribucion de la adaptacion.
- Generacion greedy y determinista, con limite de tokens configurable.
- Adaptador complementario para captioning por eventos: `laion/moss-audio-burst-caption-gemini`, que requiere marcas de tiempo aportadas externamente (se recomienda emparejarlo con un localizador que detecte intervalos automaticamente).
- No soporta tool calling ni function calling: no hay ninguna referencia a agentes, uso de herramientas o razonamiento multi-paso en la informacion disponible.
- No soporta vision ni audio mas alla del captioning de voz; tampoco se documenta capacidad multilingue (solo ingles).
- No incluye modo "thinking" ni cabecera de localizacion de eventos en este adaptador.

## Casos de uso

- Etiquetado a escala de corpus de voz: el adaptador genera captions de voz completos a partir de clips de hasta 30 segundos, lo que permite anotar archivos de miles de horas sin intervencion humana y usarlos despues como metadatos de busqueda o para entrenar modelos de retrieval de audio.
- Evaluacion de sistemas TTS y de actuacion vocal: la demo publica compara 50 interpretaciones de Gemini TTS con captions generados por el adaptador frente a lineas base sin ajustar, de modo que puede usarse como juez descriptivo de si una sintesis reproduce la emocion y el estilo pretendidos.
- Investigacion en prosodia y emocion: como el corpus de entrenamiento incluye 40 emociones balanceadas, el modelo puede asignar descripciones consistentes a un mismo hablante en distintas condiciones y servir de base para estudios comparativos de expresividad.
- Accesibilidad y audiodescripcion de contenido hablado: generar texto alternativo sobre el caracter de la voz y el entorno para podcasts, audiolibros o archivos historicos, mejorando la indexacion y el acceso de personas con discapacidad auditiva.
- Curaduria y filtrado de datasets de audio: descartar o clasificar clips por caracter vocal, ruido de fondo o presencia de eventos no verbales antes de incorporarlos a pipelines de entrenamiento de ASR o TTS.
- Moderacion y control de calidad en produccion de doblaje: verificar que una toma cumple el tono emocional requerido y detectar eventos no deseados (respiraciones audibles, ruido de sala, risas fuera de guion) antes de aprobar la mezcla final.
- Analisis de interacciones grabadas: describir el entorno y el estado vocal en llamadas, sesiones clinicas o entrevistas para generar resumenes cualitativos junto a la transcripcion.
- Prototipado de busqueda semantica por voz: indexar descripciones y permitir consultas del tipo "voz calmada, sala reverberante, con risas" sobre un catalogo de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion del mejor checkpoint, que mide ajuste a texto generado por Gemini y no calidad de caption humana ni deteccion de eventos.

| Metrica | Valor | Nota |
|---|---|---|
| Perdida de validacion (mejor checkpoint, checkpoint-1826) | 1,290871 | Entropia cruzada de siguiente token sobre tokens de caption del asistente; no es una puntuacion de calidad humana |
| Epocas | 2 | - |
| Actualizaciones | 1.826 | - |
| Ejemplos de entrenamiento / validacion / test | 58.380 / 3.239 / 3.544 | Splits disjuntos por SHA256 de MP3 |
| Parametros entrenables | 87.293.952 | LoRA rango 32 en atencion y MLP del transformer de lenguaje |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 18-20 GB solo para los pesos del base (9,05 B de parametros) mas el codificador de audio, el adaptador y las activaciones; conviene reservar 24 GB o mas para clips de hasta 30 segundos.
- GPU recomendadas: el autor recomienda una GPU CUDA con BF16; encajan A100 40 GB, H100, L40S y, de forma ajustada, RTX 4090 de 24 GB.
- Cabe en GPU de consumo: si, en RTX 4090/3090 de 24 GB con precision BF16, aunque sin mucho margen para secuencias largas o lotes mayores de uno.
- CPU: es posible, pero la inferencia usa float32 y resulta "mucho mas lenta y con mucho mas consumo de memoria"; se necesitarian del orden de 36 GB o mas de RAM para los pesos.
- Despliegue: el repositorio incluye `requirements.txt`, `download_base.py` (fija la revision del base y verifica los hashes de los cuatro shards de pesos) e `inference.py`, con Transformers 4.57.1 fijado y soporte PEFT. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Entrenamiento: la receta publicada usa 4 GPUs con 1 ejemplo por GPU y 16 microbatches acumulados; el gradient checkpointing esta desactivado por incompatibilidad con los hooks forward de DeepStack.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laion/moss-audio-voice-caption-gemini | 87,3 M entrenables sobre base de 9,05 B (9,14 B en total) | No disponible (tope de entrenamiento 8.192 tokens) | Captioning de voz completa en ingles | CC-BY-4.0 | HuggingFace, 0 descargas, 0 likes |
| laion/moss-audio-burst-caption-gemini | Adaptador hermano sobre el mismo base | No disponible | Captioning por eventos con marcas de tiempo externas | No disponible en la informacion | HuggingFace |
| OpenMOSS-Team/MOSS-Audio-8B-Instruct (base sin adaptar) | 9.052.463.488 (9,05 B) | No disponible | Modelo de audio-instrucciones generalista | No disponible en la informacion | HuggingFace |

No se dispone de datos verificados en la informacion proporcionada para comparar con otras familias de captioning de audio como Qwen2-Audio, SALMONN o Audio Flamingo; sus parametros, contexto, rendimiento y licencia no aparecen en las fuentes consultadas y no se incluyen aqui para no introducir cifras sin respaldo.

## Limitaciones y advertencias

- Idioma: solo ingles (`language: en`); no se documenta soporte de castellano ni de otros idiomas.
- Etiquetas sinteticas: los captions objetivo fueron generados por Gemini, no son verdad humana adjudicada, de modo que el adaptador aprende y reproduce los sesgos, el vocabulario y los puntos ciegos del anotador automatico.
- Riesgo de alucinacion: al ser un modelo generativo de texto puede describir caracteristicas vocales, emociones o eventos acusticos que no estan presentes en el audio, especialmente con clips fuera de la distribucion de entrenamiento.
- Duracion: la adaptacion esta calibrada para clips completos de hasta 30 segundos; grabaciones mas largas pueden degradar la calidad de la descripcion.
- Formato de entrada: audio mono a 16 kHz; no se entrena con recorte por evento ni con marcadores temporales, por lo que la variante de voz completa no localiza eventos.
- Evaluacion: la perdida de validacion de 1,290871 mide ajuste al texto de Gemini, no calidad humana del caption ni exactitud de deteccion de eventos; no existe una metrica de calidad publicada.
- Contaminacion potencial: algunos clips S1 pueden haber sido vistos en el preentrenamiento previo de modelos de puntuacion Whisper, aunque el autor indica que se excluyeron del split de entrenamiento de esta adaptacion.
- Reproducibilidad: el exportador de datos rechaza por defecto datasets parciales y requiere un `--audio-map` cuando el audio original no se redistribuye, ya que parte del material no es publico.
- Licencia: CC-BY-4.0 permite uso comercial con atribucion; no se detallan restricciones adicionales, pero la licencia del modelo base debe verificarse por separado antes de un despliegue en produccion.
- Madurez: el repositorio tiene 0 descargas y 0 likes, esta fijado a Transformers 4.57.1 e incluye un hook de compatibilidad de salida del codificador, senales de un artefacto de investigacion mas que de un componente listo para produccion.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla del captioning, por lo que no debe asumirse ninguna de ellas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/moss-audio-voice-caption-gemini
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-8B-Instruct
- Adaptador complementario de eventos: https://huggingface.co/laion/moss-audio-burst-caption-gemini
- Dataset de anotaciones Gemini: https://huggingface.co/datasets/laion/whisper-gemini-voice-annotations
- Demo con 50 interpretaciones de Gemini TTS y captions adaptados: https://laion-humaneness-ears-atlas.static.hf.space/moss-caption-grid.html
- Codigo fuente oficial de MOSS-Audio (revision 66326e6e0db34f036c86a76ba005efa4830c69dd): https://github.com/OpenMOSS/MOSS-Audio/tree/66326e6e0db34f036c86a76ba005efa4830c69dd
- Paper de LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; todos los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
