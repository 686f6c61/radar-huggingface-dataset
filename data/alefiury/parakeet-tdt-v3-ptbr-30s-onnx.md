# alefiury/parakeet-tdt-v3-ptBR-30s-onnx

## Resumen

Parakeet TDT V3 pt-BR 30s (ONNX) es una exportación al formato ONNX del modelo `alexandreacff/parakeet-tdt-v3-ptBR-30s`, un ajuste fino al portugués de Brasil del modelo multilingüe Parakeet TDT 0.6B V3 de NVIDIA. Lo publica el usuario alefiury y su objetivo es ofrecer inferencia de reconocimiento automático del habla (ASR) sin dependencia de PyTorch ni de NeMo, empaquetado específicamente para la librería `onnx-asr`. El modelo base es un fine-tune de Parakeet TDT 0.6B V3, que emplea una arquitectura NeMo Conformer con decodificación Token-and-Duration Transducer (TDT).

La propuesta de valor es doble: por un lado, un enfoque claro en portugués de Brasil, con un WER medio de 0,108 en 11 benchmarks pt-BR según la model card del autor; por otro, un despliegue ligero en CPU mediante ONNX, con una variante int8 de aproximadamente 0,67 GB frente a los ~2,5 GB en fp32. El modelo está pensado para transcripción de voz leída y espontánea, con soporte de VAD para audio largo y marcas de tiempo.

Es relevante para desarrolladores que necesitan ASR en portugués de Brasil en entornos sin GPU o con requisitos de despliegue sencillos. El autor reporta resultados competitivos frente a Whisper large-v3, Qwen3ASR, Voxtral y ElevenLabs Scribe v2 en los conjuntos evaluados, aunque la información disponible no permite verificar de forma independiente dichos resultados. La licencia CC-BY-4.0 facilita el uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 B (heredados del modelo base Parakeet TDT 0.6B V3) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de ~30 s por segmento; audio largo mediante VAD |
| Tipos de cuantizacion | fp32 e int8 (cuantización dinámica con `quantize_dynamic`, pesos QUInt8 por canal) |
| Idiomas soportados | portugués (pt), con foco en portugués de Brasil (pt-BR) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder-model.onnx`, `decoder_joint-model.onnx`, variantes `.int8.onnx`, `nemo128.onnx`, `vocab.txt`, `config.json`) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX del fine-tune pt-BR de Parakeet TDT 0.6B V3 de NVIDIA. La arquitectura subyacente es un Conformer de NeMo con decodificador TDT (Token-and-Duration Transducer), un esquema que predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por paso de decodificación y mejora la eficiencia frente a un transducer clásico. El modelo base Parakeet TDT 0.6B V3 es multilingüe; este ajuste se especializa en portugués de Brasil.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El repositorio solo documenta el proceso de exportación a ONNX y la cuantización int8, no el entrenamiento del modelo base ni del fine-tune. La exportación elimina la dependencia de PyTorch y NeMo, de modo que la inferencia se ejecuta íntegramente con onnxruntime.

## Capacidades

- Reconocimiento automático del habla en portugués, con especialización en portugués de Brasil.
- Transcripción de habla leída o preparada y de habla espontánea y conversacional.
- Procesamiento de audio por segmentos de hasta ~30 s; para grabaciones más largas se integra VAD (Silero) que divide el audio en segmentos.
- Generación de marcas de tiempo mediante `.with_timestamps()`.
- Entrada de audio en ficheros WAV, listas de ficheros para transcripción por lotes y arrays NumPy con frecuencia de muestreo.
- Inferencia en CPU sin PyTorch ni NeMo, con variante int8 para menor uso de memoria y mayor velocidad en CPU.
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni modo de razonamiento; es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en pt-BR: el modelo rinde especialmente bien en habla espontánea (WER medio de 0,129 en 7 conjuntos conversacionales según el autor), por lo que es adecuado para diarización posterior y actas automáticas con segmentación por VAD.
- Subtitulado de vídeo y podcast: la generación de marcas de tiempo con `.with_timestamps()` permite alinear transcripciones con el audio para generar subtítulos en portugués de Brasil.
- Atención al cliente y centros de contacto: transcripción de llamadas grabadas en CPU sin GPU dedicada, gracias a la variante int8 de ~0,67 GB y a la integración con `onnx-asr`.
- Servicios de transcripción en servidores sin GPU: el despliegue ONNX con onnxruntime permite ejecutar ASR en infraestructura CPU estándar (el autor cita un Intel Xeon Silver 4316 en sus pruebas).
- Investigación lingüística y corpus de habla: procesamiento por lotes de corpus de habla espontánea (entrevistas, grabaciones de campo) con el método `recognize` sobre listas de ficheros.
- Aplicaciones de accesibilidad: dictado y transcripción en tiempo casi real en portugués de Brasil en dispositivos o servidores modestos, usando el modelo int8 para reducir latencia y memoria.
- Preprocesado de pipelines NLP: conversión de audio a texto para alimentar sistemas de análisis de sentimiento, resumen o búsqueda sobre contenido hablado en pt-BR.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, obtenidos con este modelo ONNX en CPU (Intel Xeon Silver 4316). Los resultados corresponden al modelo fp32. Menor es mejor.

| Metrica | Habla preparada | Habla espontanea | Global |
|---|---:|---:|---:|
| WER ↓ | 0,072 | 0,129 | 0,108 |
| CER ↓ | 0,025 | 0,067 | 0,052 |

Comparativa de WER global reportada por el autor:

| Modelo | WER habla preparada ↓ | WER habla espontanea ↓ | WER global ↓ |
|---|---:|---:|---:|
| Parakeet TDT V3 0.6B - ONNX (pt-BR 30s) (este modelo) | 0,072 | 0,129 | 0,108 |
| ElevenLabs Scribe v2 | 0,060 | no disponible en la informacion | no disponible en la informacion |
| Whisper large-v3, Qwen3ASR, Voxtral | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

La model card indica que el modelo es el mejor en 6 de los 7 conjuntos de habla espontánea y el mejor en CETUC, Common Voice 21.0 y MTEDx dentro de habla preparada, pero la tabla completa de comparación con el resto de modelos no está incluida en la información disponible. No se han podido verificar de forma independiente estos resultados.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo fp32 ocupa ~2,5 GB de pesos y el int8 ~0,67 GB, por lo que cabe en GPUs consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA compatible con onnxruntime CUDA (el autor menciona la instalación `onnx-asr[gpu,hub]`); no se especifican modelos concretos.
- Cabe en GPU consumer: sí, tanto la variante fp32 como la int8, dado el tamaño reducido del modelo (0,6 B de parámetros).
- Despliegue: `onnx-asr` con onnxruntime (CPU o CUDA); no requiere PyTorch ni NeMo. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo ASR de este tipo.
- Latencia y throughput: no se publican cifras concretas de latencia ni de throughput en la información disponible; el autor solo indica que la variante int8 es unas 4 veces más pequeña y más rápida en CPU, con una pequeña pérdida de precisión.
- Nota de compatibilidad: onnxruntime reciente (probado con 1.31) no carga el encoder fp32 directamente desde la caché de Hugging Face por el fichero externo `encoder-model.onnx.data`; hay que descargar el modelo a una carpeta local o usar la variante int8, que es un único fichero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | WER global reportado |
|---|---|---|---|---|---|---|
| Parakeet TDT V3 pt-BR 30s ONNX (este modelo) | 0,6 B | ~30 s por segmento (VAD para audio largo) | pt (pt-BR) | CC-BY-4.0 | ONNX (fp32/int8) | 0,108 (pt-BR, autor) |
| Whisper large-v3 | no disponible en la informacion | no disponible en la informacion | multilingue | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Qwen3ASR | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Voxtral | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| ElevenLabs Scribe v2 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | propietario | API | 0,060 en habla preparada |

La información disponible solo permite comparar el WER de habla preparada con ElevenLabs Scribe v2 (0,060 frente a 0,072 de este modelo); para el resto de alternativas no se incluyen cifras en la model card.

## Limitaciones y advertencias

- Especialización en portugués de Brasil: aunque el modelo base es multilingüe, este ajuste está orientado a pt-BR y no se garantiza un rendimiento equivalente en portugués europeo u otros idiomas.
- Ventana de audio de ~30 s: las grabaciones más largas requieren segmentación con VAD, y el autor advierte que puede ser necesario ajustar los parámetros del VAD para obtener buenos resultados.
- Resultados de benchmarks no verificados de forma independiente: las cifras de WER y CER proceden de la model card del autor y no se han contrastado con evaluaciones externas.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; no se documentan análisis de sesgos.
- La cuantización int8 introduce una pequeña pérdida de precisión respecto a fp32; los benchmarks publicados corresponden al modelo fp32.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario cumplir las condiciones de atribución al autor y al modelo base.
- Dependencia de `onnx-asr` y onnxruntime: la compatibilidad con versiones recientes de onnxruntime presenta el problema descrito con el encoder fp32 y la caché de Hugging Face.
- No se documentan garantías de producción, latencia ni throughput, por lo que conviene realizar una evaluación propia antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alefiury/parakeet-tdt-v3-ptBR-30s-onnx
- Modelo base (fine-tune pt-BR): https://huggingface.co/alexandreacff/parakeet-tdt-v3-ptBR-30s
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
