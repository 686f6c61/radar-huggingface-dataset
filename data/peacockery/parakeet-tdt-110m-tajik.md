# Peacockery/parakeet-tdt-110m-tajik

## Resumen

parakeet-tdt-110m-tajik es un modelo de reconocimiento automático del habla (ASR) para tayiko, desarrollado por Peacockery mediante ajuste fino del checkpoint NVIDIA Parakeet TDT-CTC 110M. Emplea una arquitectura FastConformer con cabezas de decodificación TDT (Token-and-Duration Transducer) y CTC, junto con un tokenizador SentencePiece BPE específico de tayiko de 1.024 tokens. El modelo resuelve la transcripción de audio mono a 16 kHz a texto en escritura cirílica tayika, una combinación lingüística con escasa cobertura en los sistemas ASR comerciales.

La versión v1.1 se entrenó sobre un corpus filtrado de 173.240 clips que suman 987,54 horas, con 100.000 pasos de optimizador y una receta que combina etiquetas de referencia FLEURS con pseudo-etiquetas generadas por Scribe y fusionadas mediante LLM. El resultado es una mejora de 1,55 puntos porcentuales absolutos en WER sobre FLEURS tayiko respecto a la v1 original (17,48 % frente a 19,03 %), con un tamaño de repositorio de 0,5 GB que lo hace desplegable en hardware modesto.

El modelo es relevante ahora porque demuestra que un ajuste fino cuidadoso de un backbone ASR pequeño (110 M de parámetros) puede alcanzar calidad útil en una lengua de bajos recursos como el tayiko, con licencia CC BY 4.0 que permite uso comercial con atribución. Su tamaño reducido y su naturaleza de checkpoint NeMo lo sitúan como candidato para transcripción en producción, subtitulado y pipelines de datos de voz en tayiko.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con cabezas TDT y CTC (transducer) |
| Parametros totales | 110 M (heredados del checkpoint base NVIDIA Parakeet TDT-CTC 110M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; clips de entrenamiento de 0,5 a 30 s, se recomienda segmentación para grabaciones largas |
| Tipos de cuantizacion | no disponible (checkpoint `model.nemo` en precisión de entrenamiento; evaluación en fp32) |
| Idiomas soportados | tayiko (tg), escritura cirílica |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.nemo` (checkpoint NeMo con tokenizador embebido), tokenizador en `tokenizer/` |

## Arquitectura y entrenamiento

El modelo parte del checkpoint NVIDIA Parakeet TDT-CTC 110M, un encoder FastConformer con dos cabezas de decodificación: TDT (Token-and-Duration Transducer) y CTC. Se reemplazó el tokenizador original por un SentencePiece BPE tayiko de 1.024 tokens y se entrenó durante 100.000 pasos de optimizador con precisión mixta BF16, AdamW, learning rate máximo de 3e-4, 2.000 pasos de warmup, decaimiento coseno hasta 1e-5 y un presupuesto de 120 segundos de audio por lote. En el paso 14.000 se reanudó el entrenamiento restaurando modelo, optimizador, scheduler y paso global, cambiando a pérdida TDT no fusionada y a un muestreo que combina 12 % de clips FLEURS con 88 % de clips pseudo-etiquetados.

Los datos de entrenamiento proceden del corpus tayiko v3 filtrado: 173.240 clips y 987,54 horas, de los cuales 2.250 clips tienen etiquetas de referencia FLEURS y 170.990 usan hipótesis de Scribe fusionadas con LLM. La preparación aplica límites de duración y exclusiones de fuentes de evaluación conocidas para evitar contaminación. El checkpoint final se seleccionó por WER de desarrollo en fp32 (17,988 %), por delante del mejor checkpoint por pérdida de validación (18,085 %) y del checkpoint promediado (18,801 %).

## Capacidades

- Transcripción de voz a texto en tayiko (cirílico) a partir de audio mono a 16 kHz.
- Salida en minúsculas y generalmente sin puntuación.
- Decodificación dual TDT y CTC, lo que permite elegir la estrategia de inferencia según latencia y precisión.
- Tokenizador tayiko específico de 1.024 tokens embebido en el checkpoint.
- Manejo de clips cortos (0,5 a 30 s); para audio largo requiere segmentación previa.
- No soporta tool calling, agentes, visión, audio de entrada más allá de ASR ni razonamiento multi-paso: es un modelo puramente acústico-lingüístico.
- Capacidad multilingüe limitada al tayiko; no se declaran otros idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas en tayiko: el modelo convierte audio de 16 kHz en texto cirílico, y con segmentación previa puede procesar sesiones largas divididas en clips de hasta 30 s, adecuado por su bajo coste computacional.
- Subtitulado automático de vídeo: genera transcripciones en minúsculas sin puntuación que un post-procesador puede segmentar y puntuar, útil para creadores de contenido en tayiko.
- Generación de corpus de voz para entrenamiento de modelos mayores: su velocidad y tamaño permiten pseudo-etiquetar grandes volúmenes de audio tayiko, como ya se hizo en su propio pipeline con Scribe.
- Atención al cliente por voz en tayiko: integrado en un pipeline ASR más NLU, transcribe consultas telefónicas de hasta 30 s por turno, con la ventaja de que 110 M de parámetros caben en GPU de gama media.
- Archivística y digitalización de audio histórico: transcripción por lotes de grabaciones radiofónicas o institucionales en tayiko, con revisión humana posterior dado el WER del 17,48 % en FLEURS.
- Investigación lingüística y sociolingüística: extracción de transcripciones para análisis de léxico y fonética tayika, aprovechando el tokenizador BPE específico y la licencia CC BY 4.0 para publicar derivados.
- Sistemas de accesibilidad: dictado y transcripción en vivo para hablantes de tayiko, con latencia baja gracias al reducido número de parámetros y a la cabeza CTC para decodificación rápida.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Dataset | Grabaciones | WER (%) | CER (%) |
|---|---:|---:|---:|
| FLEURS tayiko test (`tg_tj`, test) | 600 | 17,48 | 6,08 |
| Desarrollo | 239 | 17,99 | 5,73 |
| Test conversacional | 1.625 | 34,72 | 15,63 |

Comparativa con la versión anterior del mismo autor:

| Modelo | Datos de entrenamiento | WER FLEURS (%) | WER conversacional (%) |
|---|---|---:|---:|
| v1 original | Exportación original de 1.197 horas | 19,03 | 33,85 |
| v1.1 | v3 filtrado, 987,54 horas | 17,48 | 34,72 |

La mejora en FLEURS es de 1,55 puntos absolutos (8,1 % relativo). El test conversacional usa referencias generadas por máquina y presenta solapamiento de fuentes y calidad de referencia limitada, según advierte el propio autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 110 M de parámetros, la inferencia en fp32 ronda 0,5-1 GB de pesos, por lo que en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 3060, RTX 4090, A100, H100); el modelo es lo bastante pequeño para ejecutarse incluso en CPU con latencia aceptable.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales con al menos 2 GB de VRAM.
- Opciones de despliegue: NVIDIA NeMo (`ASRModel.restore_from`), probado con NeMo 3.0.0 y PyTorch 2.9.1; no se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER FLEURS (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-tdt-110m-tajik v1.1 | 110 M | Tayiko | 17,48 | CC BY 4.0 | Hugging Face |
| parakeet-tdt-110m-tajik v1 | 110 M | Tayiko | 19,03 | CC BY 4.0 | Hugging Face |
| NVIDIA Parakeet TDT-CTC 110M (base) | 110 M | Inglés (mayoritariamente) | no disponible para tayiko | no disponible en la información | Hugging Face (NVIDIA) |

No se dispone en la información proporcionada de otros modelos ASR específicos de tayiko con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El WER del 17,48 % en FLEURS indica que aproximadamente una de cada seis palabras se transcribe incorrectamente; no es adecuado para transcripción sin revisión en contextos críticos.
- El test conversacional alcanza un WER del 34,72 %, con referencias generadas por máquina y posible solapamiento de fuentes, por lo que la cifra no es un benchmark limpio.
- La salida es en minúsculas y generalmente sin puntuación, lo que requiere post-procesado para muchos usos finales.
- Entrenado con clips de 0,5 a 30 s; las grabaciones largas deben segmentarse antes de la inferencia.
- Parte del entrenamiento usa pseudo-etiquetas generadas por Scribe y fusionadas con LLM, lo que puede propagar sesgos y errores sistemáticos del etiquetador.
- Solo soporta tayiko; no se declaran capacidades multilingües ni de cambio de código.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero exige cumplir las condiciones de atribución y no concede garantías.
- Riesgo de alucinación en pasajes con ruido, acentos no representados o vocabulario técnico ausente del corpus.
- No se han publicado análisis de sesgos por género, edad o variantes dialectales del tayiko.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Peacockery/parakeet-tdt-110m-tajik
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Dataset de entrenamiento: https://huggingface.co/datasets/Peacockery/tajik-asr-corpus-v3
- Versión anterior v1: https://huggingface.co/Peacockery/tajik-parakeet-tdt-110m-v1
- Repositorio de código Peacock ASR: https://github.com/chikingsley/peacock-asr
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
