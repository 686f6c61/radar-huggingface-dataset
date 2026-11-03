# ooookao/haas-ja-v1.0-coreml

## Resumen

Haas-ja-v1.0 Core ML es la conversión al formato Core ML del modelo de reconocimiento automático del habla (ASR) Haas-ja-v1.0, desarrollado originalmente por Third Intelligence y convertido por el usuario ooookao para su ejecución local en Apple Silicon. El modelo realiza transcripción de audio en japonés y combina un encoder FastConformer con una red de predicción basada en Kimi Delta Attention (KDA) y una red conjunta TDT (Token-and-Duration Transducer). No se ha reentrenado: la conversión reutiliza los pesos originales del checkpoint.

La relevancia de esta ficha reside en que permite ejecutar un sistema ASR japonés de forma completamente local en macOS 14 o superior sobre chips Apple Silicon, sin dependencia de servicios en la nube. El bundle ocupa 1,2 GB e incluye el encoder compilado en FP16, la red de predicción y conjunta en FP32, el tokenizador SentencePiece y los recursos de preprocesado necesarios.

El modelo acepta audio mono a 16 kHz en float32 y procesa entre 0,64 y 30,72 segundos por llamada de inferencia, por lo que las grabaciones más largas deben segmentarse en enunciados antes de pasarlas al modelo. La licencia es Apache 2.0, la misma que el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer + red de predicción KDA + red conjunta TDT |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 0,64 a 30,72 s por llamada |
| Tipos de cuantización | Encoder en FP16; red de predicción y conjunta en FP32 |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlmodelc compilado y .mlpackage editable) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR de tipo transducer con encoder FastConformer, una variante de Conformer optimizada para audio que reduce el coste computacional mediante atención con submuestreo. La red de predicción utiliza Kimi Delta Attention (KDA), un mecanismo de atención recurrente con estado, y la red conjunta implementa decodificación TDT (Token-and-Duration Transducer), que predice simultáneamente el token y su duración (valores 0 a 4). El tokenizador es SentencePiece BPE con 3.072 tokens y byte fallback.

La conversión se realizó desde el checkpoint original en BF16 pasando por un encoder NeMo en float32 hasta un ML Program en FP16, usando coremltools 9.0, PyTorch 2.9.1 y NeMo 2.7.3. La red de predicción y conjunta se mantiene en float32. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste fino, ya que la model card de la conversión no los detalla y se remite al modelo original.

## Capacidades

- Transcripción de voz a texto en japonés a partir de audio mono a 16 kHz en float32.
- Procesamiento de fragmentos de audio de entre 0,64 y 30,72 segundos por llamada.
- Decodificación greedy TDT con gestión explícita de estados de memoria y convolución de la red KDA.
- Tokenización SentencePiece BPE con byte fallback para caracteres fuera del vocabulario.
- Inferencia local en Apple Silicon sin conexión a red tras la descarga del bundle.
- Integración directa en aplicaciones mediante Core ML, con contrato de tensores documentado en `config.json`.
- No se documentan capacidades de tool calling, agentes, visión, audio multilingüe ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de notas de voz en aplicaciones macOS: el modelo procesa fragmentos de hasta 30,72 s, adecuado para dictados y mensajes cortos en japonés ejecutados íntegramente en el dispositivo.
- Subtitulado local de reuniones y entrevistas: segmentando el audio en enunciados, se puede generar texto en japonés sin enviar datos a servicios externos, lo que facilita el cumplimiento de privacidad.
- Asistentes de voz embebidos en apps de Apple Silicon: la integración vía Core ML permite cargar los modelos compilados directamente y encadenar la salida ASR con módulos de procesamiento de lenguaje.
- Accesibilidad para usuarios con discapacidad auditiva: transcripción en tiempo casi real de conversaciones presenciales en japonés en un portátil o equipo de sobremesa con chip Apple.
- Archivado y búsqueda de contenido audiovisual en japonés: transcripción por lotes de grabaciones segmentadas para indexar y buscar por texto.
- Prototipado de pipelines ASR en investigación: el bundle incluye paquetes `.mlpackage` editables y un ejemplo de inferencia en Python que documenta el contrato de tensores, útil para experimentar con preprocesado y decodificación.
- Aplicaciones de dictado offline para entornos sin conectividad: al no requerir red tras la descarga, encaja en escenarios de campo o con requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para Apple Silicon y usa memoria unificada. El bundle ocupa 1,2 GB en disco.
- GPU recomendadas: chips Apple Silicon (series M) con macOS 14 o superior. No se documenta soporte para GPU NVIDIA, AMD ni CPU x86.
- Cabe en equipos de consumo: sí, en cualquier Mac con Apple Silicon, dado el tamaño del bundle y la ventana de audio limitada.
- Opciones de despliegue: Core ML de forma nativa; el bundle incluye `infer.py` como ejemplo en Python 3.12 con las dependencias en `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| Haas-ja-v1.0 Core ML (este) | FastConformer + KDA + TDT | Japonés | Core ML | Apache 2.0 | 0,64–30,72 s por llamada |
| Haas-ja-v1.0 (original) | FastConformer + KDA + TDT | Japonés | no disponible en la información | Apache 2.0 | no disponible |
| Whisper (variantes de OpenAI) | Transformer encoder-decoder | Multilingüe, incluye japonés | safetensors, GGUF, Core ML (conversiones de terceros) | MIT | 30 s por ventana |
| Otros ASR japoneses en Core ML | no disponible | Japonés | Core ML | no disponible | no disponible |

La comparación con Whisper se ofrece como referencia de categoría; los datos de parámetros y rendimiento de alternativas no se detallan en la información disponible para este modelo.

## Limitaciones y advertencias

- Solo soporta japonés; no se documentan otros idiomas.
- La ventana de audio está limitada a 30,72 s por llamada, por lo que es necesario segmentar grabaciones largas.
- Requiere macOS 14 o superior y Apple Silicon; no es desplegable en otras plataformas sin reconversión.
- No se han publicado métricas de precisión (WER/CER) ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes, habitual en sistemas ASR; no cuantificado en la información disponible.
- La gestión de estados de la red KDA (memoria y convolución) debe reiniciarse por enunciado y actualizarse solo tras tokens no vacíos; un uso incorrecto del contrato de tensores degrada la transcripción.
- Aunque la licencia es Apache 2.0, conviene revisar `LICENSE` y `NOTICE` del bundle para cumplir con las atribuciones al modelo original de Third Intelligence.
- El autor de la conversión no es el desarrollador original; para soporte o cambios en los pesos hay que remitirse a Third Intelligence.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ooookao/haas-ja-v1.0-coreml
- Modelo base original: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Guía de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
- Documentación de Core ML: no disponible en la información proporcionada
- Repositorio o paper del modelo original: no disponible en la información proporcionada
