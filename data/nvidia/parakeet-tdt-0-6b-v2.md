# nvidia/parakeet-tdt-0.6b-v2

## Resumen

Parakeet TDT 0.6B V2 es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por NVIDIA, publicado bajo licencia CC-BY-4.0. Se trata de la variante XL de la arquitectura FastConformer combinada con un decodificador TDT (Token-and-Duration Transducer), con aproximadamente 600 millones de parametros, disenada para transcripcion de alta calidad con puntuacion, capitalizacion y marcas de tiempo a nivel de palabra.

El modelo esta pensado para transcribir segmentos de audio de hasta 24 minutos en una sola pasada gracias al uso de atencion completa, y declara un RTFx de 3380 en el leaderboard HF-Open-ASR con batch size de 128. Resuelve el problema de la transcripcion precisa y rapida en produccion, con robustez declarada en numeros hablados y transcripcion de letras de canciones, y esta listo para uso comercial y no comercial segun los terminos del autor.

Su relevancia actual radica en que combina un tamano contenido (0,6B) con un rendimiento competitivo en benchmarks de ASR en ingles (WER de 1,69 en LibriSpeech clean y 3,19 en other), lo que lo hace desplegable en infraestructura moderada. NVIDIA ha publicado ademas una version posterior, `nvidia/parakeet-tdt-0.6b-v3`, multilingue para 25 lenguas europeas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer XL con decodificador TDT (Token-and-Duration Transducer); atencion completa |
| Parametros totales | 0,6B (600 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; admite segmentos de audio de hasta 24 minutos en una sola pasada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | pesos PyTorch / NeMo (repositorio de 4,9 GB); no se indica GGUF ni safetensors de forma explicita |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FastConformer en su variante XL, un encoder Conformer con atencion completa (no subsampling con atencion local), acoplada a un decodificador TDT. El decodificador TDT predice conjuntamente tokens y duraciones, lo que permite emisiones no autoregresivas mas eficientes que un transducer clasico y habilita la prediccion precisa de marcas de tiempo a nivel de palabra. La atencion completa es la que permite procesar segmentos largos de audio (hasta 24 minutos) en una unica pasada.

El entrenamiento se realizo sobre los datasets `nvidia/Granary` y `nvidia/nemo-asr-set-3.0`, segun los metadatos de la model card. No se detalla en la informacion disponible el numero exacto de horas de audio, la composicion completa del corpus ni si se aplicaron etapas de RLHF o DPO (no aplicables de forma habitual en ASR). La model card referencia los papers tecnicos de FastConformer y TDT para los detalles de arquitectura y entrenamiento.

## Capacidades

- Transcripcion de voz a texto en ingles con alta precision.
- Puntuacion automatica y capitalizacion en la salida.
- Prediccion de marcas de tiempo a nivel de palabra.
- Procesamiento de segmentos de audio de hasta 24 minutos en una sola pasada.
- Robustez declarada en numeros hablados y transcripcion de letras de canciones.
- Rendimiento declarado de RTFx de 3380 en HF-Open-ASR (batch size 128).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio mas alla de la propia transcripcion.
- Capacidad multilingue: no disponible (solo ingles en esta version).

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede procesar segmentos de hasta 24 minutos en una pasada y generar marcas de tiempo por palabra, lo que facilita la alineacion de hablantes y la generacion de resumenes posteriores con LLM.
- Subtitulado automatico de video: la salida con puntuacion, capitalizacion y timestamps por palabra encaja directamente en pipelines de generacion de subtitulos SRT/VTT.
- Analisis de llamadas de atencion al cliente: transcripcion por lotes de grabaciones con RTFx alto (3380 declarado) para alimentar sistemas de analitica y control de calidad.
- Indexacion y busqueda de contenido audiovisual: convertir podcasts, clases y webinars en texto indexable con marcas temporales para busqueda semantica.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos en ingles.
- Documentacion clinica o legal dictada: transcripcion de notas de voz con puntuacion y mayusculas, adecuada para revision humana posterior.
- Preprocesado para pipelines de IA: alimentar modelos de lenguaje con transcripciones limpias y estructuradas de audio en ingles.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (WER, menor es mejor; no verificados de forma independiente segun los metadatos `verified: false`):

| Dataset | WER (%) |
|---|---|
| LibriSpeech (clean) | 1,69 |
| LibriSpeech (other) | 3,19 |
| SPGI Speech | 2,17 |
| TED-LIUM v3 | 3,38 |
| Vox Populi (en) | 5,95 |
| GigaSpeech | 9,74 |
| Earnings-22 | 11,15 |
| AMI (Meetings, ihm) | 11,16 |

Ademas, la model card declara un RTFx de 3380 en el leaderboard HF-Open-ASR con batch size de 128, con la advertencia de que el rendimiento puede variar segun la duracion del audio y el tamano de batch.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 0,6B de parametros, la inferencia en precision completa requiere del orden de pocos GB de VRAM, aunque la cifra exacta no se documenta.
- GPU recomendadas: no especificadas en la informacion disponible; el modelo esta pensado para despliegue con NeMo y Riva/NIM de NVIDIA.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: NeMo (libreria nativa), NVIDIA Riva, NVIDIA NIM; el tag `deploy:azure` sugiere disponibilidad en Azure. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTFx declarado de 3380 en HF-Open-ASR con batch size 128; el resto de metricas de latencia no estan disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Notas |
|---|---|---|---|---|---|
| nvidia/parakeet-tdt-0.6b-v2 | 0,6B | Ingles | Hasta 24 min por pasada | CC-BY-4.0 | Version evaluada en esta ficha |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | 25 lenguas europeas | no disponible | no disponible en la informacion | Version posterior y multilingue citada por el autor |
| Otros modelos ASR comparables | no disponible | no disponible | no disponible | no disponible | No se aportan datos de comparacion en la informacion disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para transcripcion multilingue (para ello el autor remite a la version v3).
- Los resultados de benchmarks son declarados por el autor y figuran como no verificados (`verified: false`); deben tomarse con cautela.
- El rendimiento en dominios dificiles es sensiblemente peor: WER de 11,15 en Earnings-22 y 11,16 en AMI (reuniones), frente a 1,69 en LibriSpeech clean.
- Riesgo de errores en audio con ruido, acentos no representados en el corpus de entrenamiento o solapamiento de hablantes; no se documenta diarizacion.
- El RTFx puede degradarse con audios de distinta duracion o tamanos de batch diferentes al reportado.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; deben respetarse los terminos de la licencia.
- No se documentan sesgos especificos ni evaluaciones de equidad en la informacion disponible.
- El modelo esta marcado como reemplazado por `nvidia/parakeet-tdt-0.6b-v3` para casos multilingues; conviene evaluar la version mas reciente antes de nuevos despliegues.
- La cuantizacion y los formatos de despliegue ligeros no estan documentados; la integracion esta orientada al ecosistema NeMo/Riva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Version multilingue posterior: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v2
- Documentacion de modelos ASR de NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Documentacion de NeMo Framework (ASR): https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html
- Portal de desarrolladores de NVIDIA: https://developer.nvidia.com
- NVIDIA Riva Speech: https://developer.nvidia.com/riva
- Nemotron: https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper relacionado (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper relacionado (arXiv:2406.00899): https://arxiv.org/abs/2406.00899
- Paper relacionado (arXiv:2410.01036): https://arxiv.org/abs/2410.01036
- Paper relacionado (arXiv:2505.13404): https://arxiv.org/abs/2505.13404
- Dataset Granary: https://huggingface.co/datasets/nvidia/Granary
- Dataset NeMo ASR Set 3.0: https://huggingface.co/datasets/nvidia/nemo-asr-set-3.0
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
