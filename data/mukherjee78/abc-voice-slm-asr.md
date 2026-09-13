# mukherjee78/abc-voice-slm-asr

## Resumen

abc-voice-slm-asr (mukherjee78/abc-voice-slm-asr) es un sistema de reconocimiento automático del habla (ASR) construido desde cero en PyTorch, con un codificador de estilo Zipformer y un decodificador RNN-Transducer sin estado. El modelo, de 21,4 millones de parámetros, se ha entrenado primero en inglés sobre LibriSpeech `train-clean-100` (100,6 horas) y después se ha ajustado a bengalí mediante extensión de vocabulario cross-lingual sobre OpenSLR SLR53 (37,4 horas). No es un modelo de la librería `transformers`: la arquitectura es personalizada y los pesos se distribuyen como ficheros `.pt`.

El propio autor lo define como un artefacto de investigación y docencia, no como un sistema de producción. Los resultados publicados son honestos y modestos: 21,9 % de WER en inglés in-domain y 47,1 % en bengalí, medidos con decodificación greedy y sin modelo de lenguaje externo. Como referencia, Whisper tiny.en (preentrenado con unas 680.000 horas) obtiene aproximadamente un 5-8 % de WER en el mismo conjunto de test inglés.

Su relevancia actual es acotada pero clara: sirve para estudiar arquitecturas transducer, medir qué se consigue con presupuesto de cómputo y datos reducidos, y documentar de forma cuantificada las brechas de equidad (la diferencia por acento medida es de 34 puntos porcentuales). El repositorio pesa 0,2 GB y la licencia del código y del checkpoint inglés es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador estilo Zipformer (multirresolución, con bloques tipo Conformer) más predictor/joiner RNN-Transducer sin estado |
| Parámetros totales | 21,4 M |
| Longitud de contexto | no disponible (modelo ASR; no se especifica la duración máxima de audio soportada) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones; pesos en punto flotante `.pt`) |
| Idiomas soportados | inglés (en) y bengalí (bn); el autor indica que el hindi está pendiente |
| Licencia | Apache 2.0 para el código y el checkpoint inglés; los datos del checkpoint bengalí proceden de OpenSLR SLR53 (CC BY-SA 4.0) |
| Formato de pesos | PyTorch (`.pt`): `model_english_100h.pt` y `model_bengali_full.pt` |
| Front-end de características | banco de filtros log-mel de 80 bins, calculado a mano (sin `torchaudio.transforms`) |
| Tokenizador | a nivel de carácter, extensible entre idiomas |
| Función de pérdida | RNN-Transducer (`torchaudio.functional.rnnt_loss`) |
| Framework | PyTorch con arquitectura personalizada (no es un modelo de `transformers`) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo combina un codificador de estilo Zipformer, con resolución temporal múltiple y bloques inspirados en Conformer, y un decodificador RNN-Transducer formado por predictor y joiner sin estado. El front-end calcula a mano un banco de filtros log-mel de 80 bins en lugar de usar `torchaudio.transforms`, y la única dependencia de librería en el modelo es la propia pérdida `torchaudio.functional.rnnt_loss`. El tokenizador es a nivel de carácter, lo que facilita la extensión del vocabulario a otros idiomas. El autor documenta varias simplificaciones deliberadas respecto al artículo original de Zipformer: menos bloques en el codificador, atención con posiciones absolutas en lugar de relativas y optimizador AdamW estándar en lugar del optimizador específico del paper.

El entrenamiento es en dos fases: primero desde cero sobre LibriSpeech `train-clean-100` (100,6 horas de inglés) y después un ajuste fino a bengalí mediante extensión de vocabulario cross-lingual sobre OpenSLR SLR53 (37,4 horas). No hay RLHF, DPO ni alineación por preferencias, ya que no es un modelo generativo de lenguaje. La decodificación es exclusivamente greedy, sin beam search ni modelo de lenguaje externo, y no se ofrece ruta de inferencia en streaming. El código fuente todavía no es público: el autor indica que la publicación en GitHub está pendiente de resolver dos tareas de mantenimiento de la release.

## Capacidades

- Transcripción de voz a texto monolingüe en inglés y en bengalí, con vocabulario a nivel de carácter.
- Transferencia cross-lingual mediante extensión de vocabulario: el checkpoint bengalí se deriva por ajuste fino del checkpoint inglés.
- Generación de transcripciones con decodificación greedy sobre ficheros de audio, usando el par de checkpoints distribuidos.
- Evaluación de equidad incorporada en el repositorio de código mediante el script `evaluate_fairness.py`, con desglose por género, acento, duración del enunciado y velocidad de habla.
- Reproducibilidad parcial del pipeline de entrenamiento desde cero (arquitectura escrita a mano), pendiente de la publicación del código.
- No soporta tool calling ni function calling.
- No soporta uso como agente, razonamiento multi-paso ni planificación.
- No dispone de modo de razonamiento explícito, ni de capacidades de visión, audio generativo o texto a voz.
- No ofrece decodificación con beam search, integración con modelo de lenguaje externo ni inferencia en streaming de baja latencia.

## Casos de uso

- Docencia de arquitecturas RNN-Transducer: el modelo permite diseccionar un codificador Zipformer y un decodificador transducer completos en 21,4 M de parámetros, un tamaño manejable para estudiar el flujo de tensores en un aula o en un cuaderno de investigación.
- Investigación en transferencia cross-lingual: sirve como caso de estudio reproducible de ajuste fino inglés a bengalí mediante extensión de vocabulario, comparando el WER de 21,9 % en inglés con el 47,1 % en bengalí obtenido tras solo 37,4 horas de datos.
- Auditoría de sesgos en ASR: el script `evaluate_fairness.py` y el desglose publicado permiten reproducir mediciones de disparidad por acento (34 puntos porcentuales entre el mejor y el peor grupo) y por género (4,1 puntos), útiles en cursos y trabajos sobre equidad en sistemas de voz.
- Línea base para experimentos de bajo presupuesto: al haberse entrenado con un presupuesto declarado de portátil, es un punto de partida realista para medir cuánto mejora un dominio pequeño propio tras un ajuste fino adicional, siempre con revisión de los WER esperados.
- Estudio de cambio de dominio: comparar el 21,9 % de WER in-domain en LibriSpeech con el 81,3 % obtenido en Common Voice English permite cuantificar de forma directa el impacto del domain shift en un sistema ASR pequeño.
- Ablaciones arquitectónicas: las simplificaciones documentadas respecto al Zipformer original (menos bloques, posiciones absolutas, AdamW) facilitan experimentos controlados sobre el efecto de cada decisión de diseño.
- Prototipado de ASR para bengalí en entornos académicos con recursos limitados, aceptando que el resultado es un ajuste fino temprano y no un sistema dedicado de reconocimiento en idiomas índicos.
- Experimentos de medición de la brecha de datos: comparar sus cifras con sistemas preentrenados a gran escala (Whisper tiny.en, Zipformer en streaming) para ilustrar cuánto aporta pasar de 100 horas a cientos de miles de horas de preentrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con decodificación greedy, sin beam search ni modelo de lenguaje externo, sobre particiones de test no vistas durante el entrenamiento:

| Modelo / configuración | Idioma | Conjunto de evaluación | WER |
|---|---|---|---|
| `model_english_100h.pt` | inglés | LibriSpeech, test in-domain retenido | 21,9 % |
| `model_bengali_full.pt` | bengalí | OpenSLR SLR53, test retenido | 47,1 % |
| `model_english_100h.pt` | inglés | Common Voice English (out-of-domain, n=4.862) | 81,3 % |
| Zipformer en streaming preentrenado (referencia del propio autor) | bengalí | no especificado | 21,6 % |
| Whisper tiny.en (referencia del propio autor, 680.000 h de preentrenamiento) | inglés | mismo test inglés | ~5-8 % |

Desglose de equidad sobre `model_english_100h.pt`, todo él afectado por el mismo cambio de dominio hacia Common Voice English (los WER absolutos están inflados; las diferencias entre grupos son la señal relevante):

| Eje | Resultado | Diferencia |
|---|---|---|
| Género | hombres 85,2 % (n=2.041) frente a mujeres 81,1 % (n=441) | 4,1 puntos |
| Acento | inglés canadiense 62,5 % (n=79), el mejor, frente a India/Asia del Sur 96,5 % (n=454), el peor | 34,0 puntos (la mayor medida) |
| Duración del enunciado | cortos 74,7 % frente a largos 87,7 % (n≈1.620 por grupo) | 13,0 puntos |
| Velocidad de habla (proxy) | rápidos 78,3 % frente a lentos 84,1 % (n≈1.620 por grupo) | 5,8 puntos (dirección contraintuitiva; el autor la marca como direccional) |
| Idioma (cada uno en su test nativo) | inglés 21,9 %, bengalí 47,1 %, hindi pendiente | 25,2 puntos absolutos / 115 % relativo |

## Requisitos de hardware

- Huella de pesos: con 21,4 M de parámetros, el checkpoint ocupa del orden de 86 MB en fp32 y 43 MB en fp16 (estimación derivada del número de parámetros, no publicada por el autor).
- VRAM estimada para inferencia: por debajo de 1 GB incluso en fp32, sin contar el búfer de audio de entrada.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas tarjetas de gama de entrada; el autor declara un presupuesto de entrenamiento de portátil, por lo que no se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier modelo actual (por ejemplo, GTX 1650, RTX 3060, RTX 4090), y también en CPU para inferencia sobre ficheros de audio.
- Opciones de despliegue: al no ser un modelo de `transformers`, vLLM, TGI, llama.cpp y Ollama no son aplicables. El despliegue requiere cargar los ficheros `.pt` con el código PyTorch de la arquitectura, que todavía no es público. La única pieza documentada de la pila es `torchaudio.functional.rnnt_loss` para el entrenamiento.
- Latencia y throughput: no disponible.
- Exportación a otros formatos (ONNX, GGUF, CTranslate2): no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / datos de preentrenamiento | WER publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abc-voice-slm-asr (este modelo) | 21,4 M | 100,6 h de inglés y 37,4 h de bengalí, desde cero | 21,9 % (en, in-domain); 47,1 % (bn) | Apache 2.0 (código y checkpoint inglés) | Pesos en HuggingFace; código pendiente de publicación |
| Whisper tiny.en | no disponible en la información proporcionada | 680.000 h de preentrenamiento según el autor | ~5-8 % en el mismo test inglés | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Zipformer en streaming preentrenado | no disponible en la información proporcionada | no disponible en la información proporcionada | 21,6 % en bengalí | no disponible en la información proporcionada | no disponible en la información proporcionada |

No se han encontrado en la información proporcionada otros modelos comparables con datos verificables de parámetros, contexto o licencia.

## Limitaciones y advertencias

- El propio autor lo declara no apto para producción, uso crítico de seguridad ni cualquier despliegue en el que un WER erróneo pueda causar daño.
- Solo decodificación greedy: sin beam search, sin modelo de lenguaje externo y sin ruta de inferencia en streaming o de baja latencia.
- Cambio de dominio severo y medido: el WER pasa del 21,9 % in-domain en LibriSpeech al 81,3 % en Common Voice English, casi cuatro veces más.
- Brecha por acento de 34 puntos porcentuales entre el mejor y el peor grupo medido; los acentos del sur de Asia no tienen representación alguna en los datos de entrenamiento, ya que los lectores de LibriSpeech son íntegramente norteamericanos y británicos.
- Brecha por género de 4,1 puntos y por duración de enunciado de 13,0 puntos, ambas sobre datos con cambio de dominio.
- El bengalí es un ajuste fino temprano sobre 37,4 horas partiendo de una base inglesa, no un modelo dedicado; la distancia frente a sistemas índicos específicos y frente al Zipformer en streaming (21,6 % de WER en bengalí) es real.
- Entrenado y evaluado sobre habla leída o guiada (audiolibros y prompts colaborativos): se espera un rendimiento sustancialmente peor en habla espontánea, audio con ruido, solapamiento de hablantes o acentos fuera de la distribución de entrenamiento.
- Riesgo de alucinación y de transcripciones incorrectas: no hay mecanismo de confianza ni puntuaciones de fiabilidad publicadas.
- Simplificaciones arquitectónicas declaradas respecto al artículo de Zipformer (menos bloques, posiciones absolutas en lugar de relativas, AdamW en lugar del optimizador del paper), documentadas en el docstring de `model.py` del repositorio de código.
- Licencia: el código y el checkpoint inglés son Apache 2.0, pero los datos del checkpoint bengalí provienen de OpenSLR SLR53, con licencia CC BY-SA 4.0; conviene revisar las obligaciones de atribución y compartir-igual antes de cualquier uso derivado del checkpoint bengalí.
- El código fuente no está publicado todavía, por lo que la reproducibilidad completa del entrenamiento no está garantizada en este momento.
- El hindi aparece como pendiente en la tabla de equidad del autor; su soporte no está confirmado.
- No se reporta ningún eje de condiciones acústicas o ruido, porque Common Voice no ofrece etiquetado fiable para ello.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mukherjee78/abc-voice-slm-asr
- Artículo referenciado en las etiquetas del modelo (Zipformer): https://arxiv.org/abs/2310.11230
- Dataset OpenSLR SLR53 (bengalí): https://www.openslr.org/53
- Dataset LibriSpeech (OpenSLR SLR12): https://www.openslr.org/12
- Documentación de la tarea de reconocimiento automático del habla en HuggingFace: https://huggingface.co/docs/transformers/tasks/asr
- Repositorio de código: pendiente de publicación según el autor (el enlace se añadirá a la model card cuando esté disponible)
- Búsqueda web: no se han encontrado enlaces adicionales relevantes sobre este modelo más allá de los anteriores
