# GaborMadarasz/wav2vec2-large-xlsr-53-hungarian1

## Resumen

El modelo `GaborMadarasz/wav2vec2-large-xlsr-53-hungarian1` es un sistema de reconocimiento automático del habla (ASR) para húngaro, publicado por el desarrollador GaborMadarasz en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo multilingüe `facebook/wav2vec2-xls-r-300m`, orientado específicamente a la transcripción de voz en húngaro mediante un objetivo de entrenamiento CTC (Connectionist Temporal Classification). El resultado es un modelo encoder-only de aproximadamente 315 millones de parámetros, con licencia Apache 2.0, que ofrece una alternativa de código abierto para pipelines de speech-to-text en húngaro.

El modelo se entrenó sobre el conjunto de datos Common Voice 24.0 en húngaro (habla leída y guionizada) y reporta un WER de 0,1647 sobre el conjunto de test de dicho corpus. Su relevancia radica en que cubre un idioma de recursos medios (el húngaro) con una arquitectura probada y un coste computacional moderado, permitiendo despliegues locales o en infraestructura modesta sin depender de APIs propietarias.

Arquitectura transformer encoder-only con extracción de características convolucional, contexto de audio no limitado por una ventana de tokens de texto (propio de modelos ASR), pesos en formato safetensors y un tamaño de repositorio de 3,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-CTC (transformer encoder-only con extractor convolucional de características) |
| Parametros totales | 315.479.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio en bruto, no texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | húngaro (hu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2 de Facebook AI: un extractor de características convolucional que convierte la forma de onda de audio en bruto en representaciones latentes, seguido de un transformer encoder que refina dichas representaciones. Sobre la salida del encoder se aplica una cabeza de clasificación CTC, que permite alinear secuencias de audio y caracteres sin necesidad de alineaciones temporales explícitas. El modelo base `facebook/wav2vec2-xls-r-300m` fue preentrenado de forma multilingüe (XLS-R) sobre miles de horas de audio en decenas de idiomas, lo que proporciona representaciones acústicas robustas que se especializan en húngaro durante el fine-tuning.

El ajuste fino se realizó sobre el subconjunto húngaro de Common Voice 24.0 (habla guionizada), con pérdida CTC y decodificación greedy en inferencia. No se documenta en la información disponible el número exacto de horas de audio de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de aumento de datos, regularización o ajuste de hiperparámetros específicos. Tampoco se menciona el uso de un modelo de lenguaje externo para decodificación por beam search.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) en húngaro sobre audio en bruto.
- Transcripción de habla guionizada y leída (el dominio de entrenamiento principal).
- Decodificación CTC greedy integrada en el modelo; el usuario puede aplicar decodificación propia.
- Procesamiento de audio mono o multicanal (el script de ejemplo incluye conversión a mono).
- Inferencia en CPU y GPU mediante PyTorch y la librería Transformers.
- Integración en pipelines de ASR open source sin dependencias de servicios propietarios.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modo thinking (no es un modelo de lenguaje generativo).

## Casos de uso

- Transcripción de locuciones y audiolibros en húngaro: el modelo está entrenado sobre habla leída, por lo que es adecuado para convertir narraciones, podcasts guionizados o material educativo en texto con una tasa de error de palabras en torno al 16 %.
- Investigación y benchmarking en ASR húngaro: sirve como línea base reproducible y open source para comparar técnicas de decodificación, aumento de datos o ajuste fino adicional sobre Common Voice.
- Subtitulado automático de contenido audiovisual guionizado: integrado en un pipeline que extrae audio, segmenta por VAD y transcribe cada fragmento, permite generar subtítulos en húngaro sin coste de API.
- Archivado y búsqueda de audio histórico: transcripción offline de grabaciones de voz en húngaro para indexación y búsqueda textual posterior, aprovechando que el modelo puede ejecutarse en local.
- Sistemas de accesibilidad: conversión de voz a texto en aplicaciones para personas con discapacidad auditiva en entornos de habla húngara, con despliegue en servidor o estación de trabajo.
- Prototipado de asistentes de voz en húngaro: como componente ASR en pipelines de comandos de voz de dominio acotado, combinado con un modelo de lenguaje para la parte de comprensión.
- Evaluación de calidad acústica y preprocesado: uso del modelo para detectar segmentos con baja confianza de transcripción y marcar audio ruidoso o no inteligible en procesos de control de calidad.

## Benchmarks y rendimiento

Evaluación reportada por el autor sobre el conjunto de test de Common Voice 24.0 en húngaro:

| Modelo | Arquitectura | Parámetros | Decodificación | Adaptación a húngaro | WER (CV HU) | Fuente |
|---|---|---|---|---|---|---|
| Este modelo (XLSR fine-tuned) | Wav2Vec2-CTC (encoder-only) | ~300M | Greedy CTC | Fine-tuned sobre CV 24.0 HU | 0,1647 | Medido (este trabajo) |
| Whisper-Large | Encoder-Decoder (seq2seq Transformer) | ~1,55B | Beam search | Preentrenamiento multilingüe | ~0,08–0,12 | Reportado (benchmarks públicos) |
| Google Speech-to-Text | DNN/Transformer híbrido propietario | No divulgado | LM interno + beam | Multilingüe a escala de producción | ~0,07–0,12 | Reportado (benchmarks del proveedor) |
| XLSR (base, sin fine-tuning) | Wav2Vec2-CTC (encoder-only) | ~300M | Greedy CTC | Ninguna | ~0,35+ | Reportado (zero-shot HU) |

Los datos de Whisper-Large y Google Speech-to-Text proceden de benchmarks públicos citados por el autor y no de una evaluación directa en el mismo entorno; deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (315M parámetros), más activaciones y buffers de audio; en la práctica unos 2–3 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB para pesos, con un total práctico de 1,5–2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son más que suficientes. El modelo es pequeño para el estándar actual de ASR.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para audio de duración moderada.
- Opciones de despliegue: PyTorch + Transformers (vía `Wav2Vec2ForCTC` y `Wav2Vec2Processor`), exportación a ONNX, integración en servidores de inferencia compatibles con Transformers. No se documenta soporte oficial para llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo encoder-only de 315M parámetros, se espera un throughput elevado en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / dominio | WER húngaro (CV) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (XLSR fine-tuned HU) | ~315M | Audio en bruto, habla guionizada | 0,1647 (medido) | Apache 2.0 | Hugging Face |
| Whisper-Large | ~1,55B | Audio en bruto, multilingüe | ~0,08–0,12 (reportado) | MIT (modelo de OpenAI) | Hugging Face / OpenAI |
| XLSR base sin fine-tuning | ~300M | Audio en bruto, multilingüe | ~0,35+ (zero-shot) | Apache 2.0 (según modelo base) | Hugging Face |
| Google Speech-to-Text | No divulgado | API propietaria | ~0,07–0,12 (reportado) | Propietaria | API en la nube |

El modelo se sitúa como una alternativa open source de tamaño medio con WER claramente inferior al XLSR sin ajuste, pero superior al de Whisper-Large y a la API de Google en húngaro. La comparación directa con Whisper requiere cautela porque las cifras de este último provienen de benchmarks públicos, no de una evaluación en el mismo entorno.

## Limitaciones y advertencias

- Entrenado y evaluado sobre habla guionizada de Common Voice; el rendimiento puede degradarse en habla espontánea, conversacional o con ruido de fondo.
- Decodificación greedy CTC por defecto; incorporar un modelo de lenguaje o beam search puede mejorar la calidad, pero no se documenta ninguna configuración de este tipo.
- El corpus Common Voice refleja la demografía de los voluntarios que contribuyeron, lo que puede introducir sesgos acústicos y demográficos.
- Riesgo de alucinación limitado al ámbito ASR: el modelo puede producir transcripciones incorrectas o inventar palabras en segmentos ambiguos o ruidosos, especialmente sin LM de apoyo.
- Cobertura monolingüe: solo húngaro; no se ha validado para otros idiomas ni para code-switching.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar avisos de licencia y atribución; no hay restricciones adicionales documentadas.
- No apto para aplicaciones sensibles o de seguridad crítica sin evaluación adicional, según advierte el propio autor.
- El modelo tiene solo 20 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación comunitaria.
- No se documentan tiempos de inferencia, requisitos exactos de preprocesado (frecuencia de muestreo esperada) ni límites de duración de audio.

## Enlaces

- Hugging Face: https://huggingface.co/GaborMadarasz/wav2vec2-large-xlsr-53-hungarian1
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Dataset Common Voice 24.0: https://commonvoice.mozilla.org/datasets
- Paper Wav2Vec 2.0: https://arxiv.org/abs/2006.11477
- Paper XLS-R: https://arxiv.org/abs/2111.09296
- Repositorio Transformers (Wav2Vec2): https://github.com/huggingface/transformers
