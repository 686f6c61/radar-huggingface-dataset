# ali10x/ovoz-stt-v1-600m

## Resumen
Ovoz STT v1 (600M) es un modelo de reconocimiento automatico del habla (ASR) especializado en uzbek, desarrollado por ali10x (OvozAI). Se obtiene mediante fine-tuning del modelo GigaAM Multilingual 600M de ai-sage, un sistema CTC de la familia GigaAM. El ajuste se realizo sobre aproximadamente 1.600 horas de audio en uzbek; posteriormente se promediaron los pesos al 50/50 con los del modelo base y se reentreno la capa de salida. El resultado es un modelo que transcribe uzbek en alfabeto latino, con mayusculas y puntuacion, y que puede ejecutarse sin GPU.

La relevancia del modelo radica en su especializacion: mejora de forma notable el rendimiento del modelo base en dominios espontaneos y ruidosos (podcasts, noticias, contenido tecnologico), manteniendo un coste computacional bajo. Con 600 millones de parametros y pesos de 2,3 GB en fp32, es viable en CPU de 8 nucleos y en GPUs de consumo, lo que facilita su despliegue en produccion sin infraestructura dedicada.

Arquitectonicamente es un modelo transformer con cabecera CTC (Connectionist Temporal Classification), heredado de GigaAM. La licencia del modelo es Apache-2.0, mientras que el modelo base y el codigo `modeling_gigaam.py` son MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabecera CTC (GigaAM) |
| Parametros totales | 600M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con clips de hasta 30 s; se recomienda procesar fragmentos de hasta ~25 s) |
| Tipos de cuantizacion | fp32 (pesos originales); cuantizacion dinamica de 8 bits en PyTorch para CPU |
| Idiomas soportados | uzbek (uz) |
| Licencia | Apache-2.0 (modelo); MIT para el modelo base y `modeling_gigaam.py` |
| Formato de pesos | safetensors / PyTorch (transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento
El modelo parte de GigaAM Multilingual 600M, un sistema ASR basado en transformer con decodificacion CTC. Sobre esa base se realizo un fine-tuning con aproximadamente 1.600 horas de audio en uzbek. Tras el ajuste, los pesos resultantes se promediaron al 50/50 con los pesos publicados del modelo base, y a continuacion se reentreno la capa de salida. Esta estrategia busca conservar la robustez del modelo original mientras se adapta la representacion acustica al uzbek.

No se detalla en la informacion disponible la composicion exacta del dataset de fine-tuning, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO (no aplicables de forma habitual en ASR). El modelo esta disenado para trabajar con fragmentos de audio de hasta unos 25-30 segundos, ya que la memoria de atencion crece con el cuadrado de la longitud y el entrenamiento se realizo con clips de hasta 30 s. Para grabaciones mas largas se recomienda cortar en pausas.

## Capacidades
- Transcripcion de voz a texto en uzbek, con salida en alfabeto latino.
- Generacion de texto con mayusculas y puntuacion.
- Ejecucion sin GPU: inferencia en CPU viable.
- Procesamiento por lotes (batches) para alto rendimiento.
- API de transcripcion directa mediante `model.transcribe("audio.wav").text`.
- Compatible con `transformers` y `trust_remote_code=True`.
- Soporte de cuantizacion dinamica de 8 bits en PyTorch para CPU.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de ASR.

## Casos de uso
- Transcripcion de podcasts y contenido espontaneo: el modelo reduce la tasa de error en podcasts de YouTube del 46,9 % al 29,3 % respecto al base, lo que lo hace adecuado para generar transcripciones indexables de audio conversacional.
- Subtitulado de noticias y videos informativos: con una WER del 11,5 % en noticias de YouTube, puede alimentar pipelines de subtitulado automatico con correccion posterior.
- Transcripcion de contenido tecnologico y formaciones: la mejora en el dominio IT (del 28,3 % al 19,6 %) lo hace util para documentar tutoriales, webinars y charlas tecnicas.
- Atencion al cliente por voz en uzbek: al ejecutarse en CPU con 18x tiempo real en 8 nucleos, permite desplegar transcripcion en servidores sin GPU para analitica de llamadas o asistentes.
- Procesamiento por lotes de archivos de audio: con 497x tiempo real en una NVIDIA L4 y 4 GB de memoria GPU, es adecuado para transcribir grandes volumenes de audio en pipelines ETL.
- Investigacion linguistica y creacion de corpus: la salida con puntuacion y mayusculas facilita la construccion de corpus de uzbek para estudios o entrenamiento de otros modelos.
- Aplicaciones de accesibilidad: dictado y transcripcion en tiempo real en dispositivos de gama baja gracias a su bajo requisito de memoria (3-4 GB en CPU).

## Benchmarks y rendimiento
Tasa de error de palabra (WER, %) con texto normalizado (minusculas, sin puntuacion):

| Modelo | Benchmark¹ | YouTube podcasts | YouTube news | YouTube IT | FLEURS | Common Voice | USC |
|---|---|---|---|---|---|---|---|
| GigaAM 600M, tal como se publico | 14.4 | 46.9 | 16.5 | 28.3 | 12.1 | 6.8 | 8.9 |
| Ovoz STT v1 600M | 10.3 | 29.3 | 11.5 | 19.6 | 12.4 | 7.1 | 10.1 |

¹ Uzbek Spontaneous Speech ASR Benchmark, 311 clips, 2 h.

Velocidad de inferencia:

| Entorno | Mensaje de 5 s | Mensaje de 30 s | En lotes |
|---|---|---|---|
| NVIDIA L4 | 0.04 s | 0.05 s | 497x tiempo real, 4 GB de memoria GPU |
| CPU, 8 nucleos | 0.34 s | 1.5 s | 18x tiempo real |
| CPU, 8 nucleos, pesos de 8 bits (dinamico PyTorch) | no disponible | 1.1 s | 27x tiempo real |

## Requisitos de hardware
- VRAM estimada: aproximadamente 4 GB en GPU para inferencia en lotes (NVIDIA L4).
- Memoria en CPU: 3-4 GB por proceso con pesos fp32 (2,3 GB de pesos).
- GPU recomendadas: NVIDIA L4; cualquier GPU con al menos 4 GB de VRAM es suficiente para lotes.
- Cabe en GPU de consumo: si, dado el bajo requisito de memoria (4 GB), es viable en GPUs de gama media y baja.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; requiere `torch`, `torchaudio`, `hydra-core`, `omegaconf`, `sentencepiece`, `soundfile` y ffmpeg. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 0,04-0,05 s por mensaje en L4; 0,34-1,5 s en CPU de 8 nucleos; hasta 497x tiempo real en L4 y 27x en CPU con pesos de 8 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (benchmark uzbeko) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ovoz STT v1 600M | 600M | clips de hasta ~25-30 s | 10.3 | Apache-2.0 | Hugging Face |
| GigaAM Multilingual 600M | 600M | clips de hasta 30 s | 14.4 | MIT | Hugging Face |
| Whisper (variantes) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

La comparacion directa disponible se limita al modelo base GigaAM Multilingual 600M, sobre el que Ovoz STT v1 mejora en cuatro de los siete conjuntos evaluados (benchmark espontaneo, podcasts, noticias e IT) y empeora ligeramente en FLEURS, Common Voice y USC. No se aportan datos de otros sistemas ASR comparables en la informacion disponible.

## Limitaciones y advertencias
- El modelo solo soporta uzbek; no se documentan otros idiomas.
- La ventana efectiva de audio es de hasta ~25-30 s; grabaciones mas largas deben cortarse en pausas para evitar degradacion por el crecimiento cuadratico de la memoria de atencion.
- Ligero empeoramiento respecto al base en FLEURS (12,4 frente a 12,1), Common Voice (7,1 frente a 6,8) y USC (10,1 frente a 8,9), lo que sugiere menor rendimiento en audio leido o de dominio controlado.
- Riesgo de alucinacion y errores en audio con ruido, acentos no representados o vocabulario especializado; no se documentan sesgos especificos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar `modeling_gigaam.py`.
- La licencia Apache-2.0 permite uso comercial del modelo, pero el modelo base y el codigo asociado son MIT; deben respetarse ambas licencias.
- No se documentan resultados de robustez en dominios distintos a los evaluados ni pruebas de produccion a gran escala.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ali10x/ovoz-stt-v1-600m
- Modelo base GigaAM Multilingual: https://huggingface.co/ai-sage/GigaAM-Multilingual
- Dataset de benchmark: https://huggingface.co/datasets/rustam1221/uzbek-asr-benchmark-spontaneous
