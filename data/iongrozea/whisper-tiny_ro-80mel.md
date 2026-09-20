# IonGrozea/whisper-tiny_ro-80mel

## Resumen

whisper-tiny_ro-80mel es un ajuste fino (fine-tune) del modelo openai/whisper-tiny para reconocimiento automático del habla en rumano, publicado por el usuario IonGrozea en HuggingFace. Partiendo de la arquitectura encoder-decoder de la familia Whisper con 37.760.640 parámetros totales, el modelo se ha reentrenado sobre un corpus rumano fusionado de varios dominios (Echo, VoxPopuli, RODigits, RO-Smart, CommonVoice-25, FLEURS y USPDATRO) empleando espectrogramas de 80 bins mel como entrada. Con 37,76 millones de parámetros, está en el extremo más ligero de la familia Whisper, lo que lo hace candidato a despliegues en CPU, dispositivos de borde y entornos con presupuesto de cómputo muy limitado.

El problema que resuelve es acotado pero práctico: transcripción de voz en rumano cuando no hay acceso a GPU o cuando la latencia y el coste importan más que la precisión máxima. El autor declara un WER de 0,1993 y un CER de 0,0672 sobre un conjunto de validación de 25.348 muestras (52,75 horas) con beam search de tamaño 5. Son cifras de error notables para un modelo tiny, aunque el propio model-index las marca como no verificadas y proceden de un corpus personalizado, no de un benchmark estándar publicado.

Su relevancia actual es limitada y muy específica: el rumano sigue siendo un idioma con menos recursos ASR que el inglés o el español, y un modelo de 38 M de parámetros con licencia Apache-2.0 y pesos safetensors es directamente utilizable para prototipado, pre-anotación de corpus y despliegue local. No obstante, conviene ponderar que el repositorio acumula 51 descargas y 1 like, por lo que la validación por parte de la comunidad es prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de la familia Whisper (base: openai/whisper-tiny) |
| Parametros totales | 37.760.640 (37,76 M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | Ventanas de audio de 30 s (1500 frames mel, 80 bins mel). El decoder de whisper-tiny admite secuencias de hasta 448 tokens de texto, según la configuración del modelo base |
| Tipos de cuantizacion | No se publican variantes cuantizadas oficiales. Los pesos se distribuyen sin cuantizar (safetensors) y son convertibles a fp16/bf16 e int8 con herramientas externas |
| Idiomas soportados | Rumano (ro). La model card declara únicamente este idioma, pese a que el modelo base era multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (el repositorio también incluye checkpoints en formato PyTorch; tamaño del repo: 2,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un encoder Transformer que procesa espectrogramas mel y un decoder Transformer autorregresivo que genera tokens de texto, con atención cruzada entre ambos. En la variante tiny esto se traduce en una configuración muy compacta (4 capas de encoder, 4 de decoder, dimensión de modelo 384 y 6 cabezas de atención, según la especificación del modelo base de OpenAI). Este fine-tune mantiene la entrada de 80 bins mel (no la de 128 bins de whisper-large-v3) y trabaja con ventanas de audio de 30 segundos.

El entrenamiento se realizó sobre un corpus rumano fusionado de 242.719 muestras, con estas proporciones declaradas: Echo (163.050 muestras, 374,33 h), VoxPopuli (27.060, 85,20 h), RODigits (15.389, 37,55 h), RO-Smart TTS (10.572, 17,28 h), CommonVoice-25 (19.850, 22,15 h), FLEURS (4.161, 13,73 h) y USPDATRO (2.637, 4,31 h), sumando 554,55 horas en la tabla del autor (la cabecera del README menciona ~445 h, una inconsistencia documental del propio repositorio). La configuración declarada es: GPU NVIDIA A100 80GB PCIe, precisión BF16, optimizador adamw_torch, learning rate 1e-5 con scheduler coseno, 500 pasos de warmup, batch efectivo 288 (96×3), hasta 12 épocas y parada temprana con paciencia 6 sobre eval_loss. Entre los detalles técnicos destacables figuran decoder_start_token_id=50258 (token SOT), enmascarado posicional de etiquetas y begin_suppress_tokens=[220] para evitar la generación del token de espacio al inicio. No se documenta ninguna fase de RLHF o DPO: es un ajuste supervisado puro sobre pares audio-transcripción.

## Capacidades

- Reconocimiento automático del habla (ASR) en rumano, con salida de texto plano y puntuación dependiente del corpus de entrenamiento.
- Transcripción de audio en ventanas de 30 segundos; para audios largos requiere segmentación externa (VAD) y concatenación de resultados.
- Manejo de dominios variados por composición del corpus: voz espontánea (Echo, VoxPopuli), lectura de dígitos (RODigits), voz sintética de TTS (RO-Smart) y habla de benchmark multilingüe (FLEURS, CommonVoice).
- Decodificación con beam search (el autor reporta resultados con beam=5) y posibilidad de usar estrategias de decodificación estándar de la librería Transformers.
- No soporta tool calling ni function calling: es un modelo puramente acústico-a-texto, sin interfaz de herramientas.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No tiene capacidades de visión, audio comprensivo, traducción declarada ni generación de texto libre.
- Capacidad multilingüe: no disponible en este fine-tune; está especializado en rumano y no se documenta el estado de otros idiomas.

## Casos de uso

- Subtitulado y transcripción de vídeo en rumano: el modelo procesa ventanas de 30 s que se pueden segmentar con VAD y recomponer con marcas de tiempo, generando subtítulos para contenido rumano con un coste de cómputo mínimo.
- Pre-anotación de corpus ASR a gran escala: dado su reducido tamaño, se puede ejecutar sobre cientos de horas de audio sin GPU para producir transcripciones iniciales que después se corrigen manualmente, reduciendo el coste de anotación humana.
- Atención al cliente automatizada en rumano: transcripción de llamadas entrantes para su clasificación posterior por un modelo de lenguaje; el bajo WER relativo al tamaño del modelo permite extraer intención sin depender de servicios en la nube.
- Análisis de calidad en centros de llamadas: transcripción local de conversaciones para auditoría de guiones, detección de palabras clave y cumplimiento normativo, con la ventaja de que los datos de voz no salen de la infraestructura propia.
- Despliegue en dispositivos de borde: con 37,76 M de parámetros (aproximadamente 76 MB en fp16 y 38 MB en int8), cabe en una Raspberry Pi o en un móvil para dictado offline o asistentes de voz embebidos.
- Generación de transcripciones para entrenar sistemas TTS en rumano: el modelo puede producir el texto alineado con audio que necesitan los pipelines de text-to-speech, aprovechando que el propio corpus de entrenamiento incluye datos TTS.
- Investigación lingüística y fonética del rumano: el modelo sirve como baseline reproducible sobre el que medir mejoras con corpus distintos, especialmente en tareas de dígitos hablados (RODigits) y habla espontánea.
- Dictado de notas de voz y reuniones en entornos sin conectividad, priorizando privacidad sobre precisión máxima.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados independientemente):

| Metrica | Valor | Conjunto de evaluacion | Condiciones | Verificado |
|---|---|---|---|---|
| WER | 0,1993 (19,93 %) | Romanian merged corpus (80-mel), conjunto personalizado | 25.348 muestras de validación (52,75 h), beam=5 | No |
| CER | 0,0672 (6,72 %) | Romanian merged corpus (80-mel), conjunto personalizado | 25.348 muestras de validación (52,75 h), beam=5 | No |

No se han publicado resultados de benchmarks estándar (Common Voice, FLEURS o MLS en su partición oficial de test) en la información disponible, ni comparaciones directas con otros modelos rumanos bajo las mismas condiciones de evaluación. El conjunto de evaluación es un corpus propio del autor, por lo que los números no son directamente comparables con cifras publicadas de terceros.

## Requisitos de hardware

- Peso de los pesos: 151,04 MB en fp32, aproximadamente 75,5 MB en fp16/BF16 y 37,8 MB en int8 (estimación a partir de los 37.760.640 parámetros).
- VRAM estimada para inferencia: en el entorno de 0,5-2 GB en fp16 con batch pequeño y audio de 30 s, incluyendo activaciones y buffers mel (estimación orientativa; el autor no publica mediciones de memoria).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Una RTX 3060, RTX 2060, GTX 1650 o incluso una GPU integrada moderna son suficientes. No requiere A100 ni H100; el autor usó una A100 80GB para el entrenamiento, no para inferencia.
- Cabe en GPU de consumo: sí, con holgura en cualquier GPU de consumo de los últimos ocho años, y también en CPU.
- Opciones de despliegue: pipeline de transformers (modelo base), CTranslate2/faster-whisper previa conversión del checkpoint, y whisper.cpp/GGUF previa conversión. No hay soporte estándar en vLLM ni TGI para la familia Whisper, y Ollama no está orientado a modelos ASR.
- Latencia y throughput: no disponible. El autor no publica tiempos de inferencia ni factor de tiempo real medido. Al tratarse de un modelo de 38 M de parámetros, cabe esperar un coste por hora de audio muy inferior al de las variantes small o medium, pero no hay cifras confirmadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Ventana de audio | Licencia | WER en rumano |
|---|---|---|---|---|---|
| IonGrozea/whisper-tiny_ro-80mel | 37,76 M | Rumano (fine-tune) | 30 s, 80 bins mel | Apache-2.0 | 0,1993 (corpus propio, no verificado) |
| openai/whisper-tiny | 39 M | Multilingüe (~99 idiomas) | 30 s, 80 bins mel | Apache-2.0 | No disponible |
| openai/whisper-base | 74 M | Multilingüe (~99 idiomas) | 30 s, 80 bins mel | Apache-2.0 | No disponible |
| openai/whisper-small | 244 M | Multilingüe (~99 idiomas) | 30 s, 80 bins mel | Apache-2.0 | No disponible |

La comparación con las variantes base y small del propio OpenAI queda limitada a parámetros, licencia y disponibilidad, porque no hay cifras de WER en rumano publicadas y verificables en la información disponible. La ventaja competitiva reclamada por el autor es la especialización en rumano a un tamaño muy inferior al de whisper-small; el coste es la pérdida de capacidades multilingües.

## Limitaciones y advertencias

- El WER declarado de 0,1993 implica que aproximadamente una de cada cinco palabras se transcribe mal; para uso en producción sin revisión humana es insuficiente en la mayoría de escenarios.
- Los resultados del model-index están marcados como verified: false y se calcularon sobre un corpus propio del autor, no sobre benchmarks públicos, por lo que no hay contraste independiente.
- Documentación inconsistente: la cabecera del README indica un corpus de ~445 h mientras que la tabla de datos suma 554,55 h.
- Al estar ajustado solo en rumano, se espera degradación severa en cualquier otro idioma, incluidos idiomas cercanos como el español o el italiano.
- Alucinaciones típicas de Whisper: generación de texto inventado en tramos de silencio, música o ruido, y bucles de repetición en audio de baja calidad. El autor mitiga parcialmente el inicio de secuencia con begin_suppress_tokens=[220], pero no hay evaluación de este comportamiento.
- Sesgo de dominio: Echo concentra el 67,5 % de las horas del corpus, por lo que el modelo puede rendir mejor en ese tipo de habla que en dominios minoritarios como USPDATRO (4,31 h) o FLEURS (13,73 h).
- Inclusión de datos TTS sintéticos (RO-Smart, 17,28 h) en el entrenamiento: puede introducir artefactos propios de voces generadas y no refleja del todo la variabilidad del habla humana.
- No se documentan análisis de sesgo por acento, género, edad ni dialectos del rumano.
- Licencia Apache-2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indique que se ha modificado el modelo base de OpenAI.
- Adopción muy baja (51 descargas y 1 like en el momento de los datos): sin validación comunitaria ni mantenimiento demostrado.
- El modelo se distribuye en safetensors sin cuantizar; cualquier despliegue en int8 o GGUF exige conversión propia y validación posterior, y no hay garantía de que las herramientas de conversión manejen correctamente este fine-tune específico.
- Limitación estructural de Whisper: no procesa más de 30 segundos por pasada, por lo que los audios largos requieren segmentación externa y unir los fragmentos puede introducir errores en los límites.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IonGrozea/whisper-tiny_ro-80mel
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- Artículo técnico de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en los resultados de búsqueda web disponibles.
