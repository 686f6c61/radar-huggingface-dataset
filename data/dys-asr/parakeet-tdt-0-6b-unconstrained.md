# dys-asr/parakeet-tdt-0.6b-unconstrained

## Resumen

`dys-asr/parakeet-tdt-0.6b-unconstrained` es un modelo de reconocimiento automático del habla (ASR) especializado en habla disártrica y trastornos del habla, desarrollado por el equipo DysASR como parte del Speech Accessibility Project Challenge 2 (SAPC2) en su modalidad "unconstrained", que permite usar datos de entrenamiento externos al corpus del desafío. Se trata de un fine-tuning de `nvidia/parakeet-tdt-0.6b-v3`, el modelo base de NVIDIA de 600 millones de parámetros con arquitectura FastConformer + Token-and-Duration Transducer (TDT).

El modelo añade al corpus SAPC (Speech Accessibility Project) dos conjuntos adicionales de habla disártrica: HeyJay! (ICPSR 39448) y una extracción de Project Relate con habla atáxica del Reino Unido, junto con aumento de datos por perturbación de velocidad y SpecAugment. Con 627 millones de parámetros y una ventana de contexto de audio de hasta 24 minutos, consigue un WER del 10,52 % en el subconjunto de evaluación de SAPC2 con hablantes no vistos, siendo el mejor checkpoint de su familia. Su relevancia radica en abordar un problema de accesibilidad crítico: la transcripción fiable de habla con disartria, donde los modelos generalistas suelen fallar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + Token-and-Duration Transducer (TDT) decoder |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 24 minutos de audio en una sola pasada (según especificaciones de la familia Parakeet TDT) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | speech-accessibility-project-dua (Speech Accessibility Project Data Use Agreement) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Parakeet TDT de NVIDIA: un encoder FastConformer que procesa la señal de audio y un decoder Token-and-Duration Transducer que predice simultáneamente el token de salida y su duración en cada paso de decodificación. A diferencia de los modelos CTC de la misma familia, el TDT decodifica de forma autoregresiva, lo que permite una mayor precisión a costa de una inferencia más lenta (aproximadamente un orden de magnitud menos muestras por segundo que sus hermanos CTC).

El entrenamiento parte de los pesos de `nvidia/parakeet-tdt-0.6b-v3` y se fine-tunea con 402.130 utterances (tras deduplicación por nombre de archivo y filtrado por duración de 0,5 a 30 segundos y etiquetas de máximo 130 tokens), lo que supone 920,1 horas de audio de 1.094 hablantes. La composición del dataset es: SAPC1 train + dev (250.014 grabaciones, 573,5 h, 663 hablantes), SAPC2 train (153.500 grabaciones, 331,1 h, 460 hablantes), HeyJay! (8.577 grabaciones, 13,3 h, 38 hablantes) y Project Relate takeout de ataxia del Reino Unido (1.351 grabaciones, 2,2 h, 1 hablante). Los dos corpus añadidos representan solo el 2,4 % de las grabaciones y el 1,7 % de las horas, pero aportan diversidad de tipos de disartria. Se aplicaron perturbación de velocidad online y SpecAugment como aumento de datos. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado estándar con pérdida de transducer.

## Capacidades

- Transcripcion de habla disártrica y trastornos del habla en ingles, incluyendo disartria asociada a paralisis supranuclear progresiva, ataxia, esclerosis lateral amiotrofica y enfermedad de Parkinson (aunque el conjunto de evaluacion excluye a los hablantes con Parkinson).
- Reconocimiento de habla general en ingles con precision alta en habla no patologica, gracias a la base de NVIDIA.
- Salida de texto en minusculas, sin puntuacion y con numeros expresados como palabras (convencion del modelo).
- Decodificacion autoregresiva con prediccion de duracion de token, lo que permite alineamiento temporal implicito.
- Soporte de audio monofonico a 16 kHz (requisito del procesador).
- Integracion con la libreria transformers de HuggingFace mediante la clase `ParakeetForTDT` (requiere transformers >= 5.9).
- No soporta tool calling, agentes, vision ni otros modos multimodales; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripcion clinica de consultas de logopedia y neurologia: el modelo puede transcribir grabaciones de pacientes con disartria en entornos clinicos, facilitando la documentacion de evaluaciones y la monitorizacion de la progresion de la enfermedad. Su entrenamiento especifico en corpus de habla patologica lo hace adecuado para este fin.
- Sistemas de comunicacion aumentativa y alternativa (CAA): integrado en aplicaciones de dictado para personas con trastornos motores del habla, permite convertir voz disártrica en texto para mensajeria, correo electronico o control por voz de dispositivos.
- Subtitulado automatico de contenido audiovisual con hablantes con disartria: en entrevistas, documentales o contenido generado por usuarios con trastornos del habla, el modelo ofrece una alternativa a los subtituladores genericos que fallan con este tipo de voz.
- Investigacion en procesamiento del habla patologica: como herramienta de transcripcion de corpus de investigacion, permite a los investigadores obtener transcripciones de referencia de alta calidad para estudios acusticos o linguisticos.
- Asistentes de voz accesibles: integrado en asistentes domesticos o moviles, permite a personas con disartria interactuar mediante comandos de voz, mejorando la autonomia personal.
- Evaluacion de la inteligibilidad del habla: al proporcionar transcripciones precisas, el modelo puede usarse para calcular metricas objetivas de inteligibilidad (WER/CER) en entornos de rehabilitacion, comparando la produccion del paciente con la transcripcion de referencia.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en el model-index son:

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| SAPC2 dev (48 hablantes no vistos, 17.582 utterances) | dev | WER | 10,52 % |
| SAPC2 dev (48 hablantes no vistos, 17.582 utterances) | dev | CER | 6,45 % |

Ademas, la model card incluye una comparativa interna de la familia de modelos DysASR sobre el mismo conjunto de evaluacion (17.582 utterances, 48 hablantes, sin modelo de lenguaje, con el mismo normalizador):

| Modelo | WER | CER |
|---|---|---|
| `nvidia/parakeet-ctc-0.6b` | 32,35 % | 20,43 % |
| `nvidia/parakeet-tdt-0.6b-v3` | 29,49 % | 19,99 % |
| `dys-asr/parakeet-ctc-0.6b-sapc1` | 14,65 % | 8,77 % |
| `dys-asr/parakeet-ctc-0.6b-sapc2` | 13,35 % | 7,83 % |
| `dys-asr/parakeet-ctc-0.6b-all` | 12,08 % | 7,02 % |
| `dys-asr/parakeet-ctc-0.6b-soup` | 11,89 % | 6,89 % |
| `dys-asr/parakeet-ctc-0.6b-all-aug` | 11,65 % | 6,80 % |
| `dys-asr/parakeet-tdt-0.6b-all-aug` | 10,73 % | 6,67 % |
| **`dys-asr/parakeet-tdt-0.6b-unconstrained`** | **10,52 %** | **6,45 %** |

El autor advierte que la diferencia con `parakeet-tdt-0.6b-all-aug` (0,21 puntos de WER) es pequena y estadisticamente poco concluyente, y que el conjunto de evaluacion es mas dificil que SAPC2 dev completo porque excluye a los hablantes con Parkinson (el cohorte de menor error). No se han publicado resultados en otros benchmarks estandar como LibriSpeech o Common Voice.

## Requisitos de hardware

- VRAM estimada para inferencia: con 627 millones de parametros en FP16, los pesos ocupan aproximadamente 1,25 GB. Con activaciones y overhead de decodificacion autoregresiva, se estima un consumo de 2-4 GB de VRAM para lotes pequenos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar el modelo. Para inferencia en tiempo real con baja latencia, se recomienda una RTX 3060 o superior. En entornos de produccion, una A10 o A100 ofrecen mayor throughput.
- Cabe en GPU consumer: si, es un modelo pequeno que cabe incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser compatible con transformers, puede servirse con HuggingFace Inference Endpoints, TGI (Text Generation Inference) o vLLM (aunque vLLM no esta optimizado para ASR). Para despliegue local, se puede usar el script de inferencia de la model card con PyTorch. No hay soporte oficial para llama.cpp u Ollama al ser un modelo de audio, no de texto.
- Latencia y throughput: no hay datos oficiales. La decodificacion autoregresiva del TDT es aproximadamente un orden de magnitud mas lenta que la de los modelos CTC de la misma familia, por lo que en una GPU consumer se espera un throughput del orden de 10-50 muestras de audio por segundo (frente a 100-500 en CTC).

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | WER (SAPC2 held-out) | Licencia |
|---|---|---|---|---|---|
| `dys-asr/parakeet-tdt-0.6b-unconstrained` | 627 M | FastConformer + TDT | 24 min | 10,52 % | speech-accessibility-project-dua |
| `nvidia/parakeet-tdt-0.6b-v3` | 627 M | FastConformer + TDT | 24 min | 29,49 % | CC-BY-4.0 (NVIDIA) |
| `dys-asr/parakeet-ctc-0.6b-all-aug` | 627 M | FastConformer + CTC | 24 min | 11,65 % | speech-accessibility-project-dua |
| `dys-asr/parakeet-tdt-0.6b-all-aug` | 627 M | FastConformer + TDT | 24 min | 10,73 % | speech-accessibility-project-dua |

La comparativa muestra que el fine-tuning para habla disártrica reduce el WER de forma drastica frente al modelo base de NVIDIA (de 29,49 % a 10,52 %), y que la variante TDT supera a la CTC con el mismo conjunto de datos. La diferencia con `parakeet-tdt-0.6b-all-aug` (el control sin los corpus externos) es minima, como reconoce el autor. No se dispone de comparaciones con otros modelos especializados en disartria fuera de esta familia.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles. No es util para otros idiomas, incluido el castellano.
- Licencia restrictiva: la licencia `speech-accessibility-project-dua` es un acuerdo de uso de datos del Speech Accessibility Project, que puede limitar el uso comercial y la redistribucion. Es imprescindible revisar los terminos completos antes de cualquier despliegue en produccion.
- Sin conjunto de test fuera del corpus: el autor indica explicitamente que no queda ningun conjunto de evaluacion externo, ya que HeyJay! y Project Relate se usaron integramente en el entrenamiento. Las puntuaciones publicadas para otros checkpoints en esos corpus no son aplicables a este modelo.
- Sesgo de cohorte: el conjunto de evaluacion excluye a hablantes con Parkinson, por lo que el rendimiento en ese tipo de disartria no esta medido y podria ser peor.
- Salida en minusculas y sin puntuacion: la convencion de salida (numeros como palabras, todo en minusculas) puede requerir postprocesado para aplicaciones que necesiten formato.
- Decodificacion lenta: al ser autoregresiva, la inferencia es significativamente mas lenta que la de modelos CTC comparables, lo que puede ser un problema para transcripcion en tiempo real.
- Requisito de version: necesita `transformers>=5.9`, que puede no estar disponible en todos los entornos o ser incompatible con otras dependencias.
- Riesgo de alucinacion: como todo modelo ASR, puede producir transcripciones incorrectas en audio muy degradado o con ruido, especialmente en habla severamente disártrica. No se han publicado analisis de errores detallados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dys-asr/parakeet-tdt-0.6b-unconstrained
- Modelo de control (all-aug): https://huggingface.co/dys-asr/parakeet-tdt-0.6b-all-aug
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Coleccion Parakeet TDT 0.6B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/-/collections/parakeet-tdt-0.6b/
- Pagina de OpenASR sobre Parakeet TDT 0.6B v3: https://openasr.org/models/parakeet-tdt-0.6b-v3/
- Licencia del Speech Accessibility Project: https://speechaccessibilityproject.beckman.illinois.edu/
