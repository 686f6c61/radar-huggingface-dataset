# jodijhouranda/ayata-whisper-quran-v2

## Resumen

ayata-whisper-quran-v2 es un modelo de reconocimiento automatico del habla (ASR) obtenido mediante fine-tuning de tarteel-ai/whisper-base-ar-quran, que a su vez deriva de la arquitectura Whisper Base de OpenAI. Lo publica el usuario jodijhouranda en Hugging Face bajo licencia Apache 2.0. El modelo esta especializado en la transcripcion de recitacion coranica en arabe, un dominio con caracteristicas acusticas y lexicas muy especificas (taywid, alargamientos vocales, articulacion faringal) que los modelos ASR genericos suelen cubrir con menor precision.

Con 72,59 millones de parametros, es un modelo compacto pensado para inferencia ligera, incluso en CPU o GPU de gama baja. La longitud de contexto y los idiomas soportados no estan documentados en la model card. El repositorio ocupa 2,4 GB, lo que sugiere la presencia de checkpoints intermedios ademas de los pesos finales en safetensors.

Su relevancia actual radica en el nicho: existen pocos modelos abiertos dedicados a ASR coranico y este se apoya en un backbone ya ajustado al dominio (tarteel-ai/whisper-base-ar-quran), lo que reduce el coste de entrenamiento y el volumen de datos necesario. No obstante, la documentacion es practicamente inexistente y no se han publicado metricas de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 72.593.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers/GGUF via conversion, no documentado por el autor) |
| Idiomas soportados | no disponible (por el modelo base, orientado a arabe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante Base: un encoder-decoder transformer con atención multi-cabeza estandar, pensado para entrada de audio mel-espectrograma y salida de tokens de texto. Al partir de tarteel-ai/whisper-base-ar-quran, conserva el preentrenamiento en arabe coranico y anade un ajuste adicional sobre el dataset denominado "generator" (sin descripcion publica).

Los hiperparametros de entrenamiento documentados son: learning rate 1,5e-05, batch size efectivo 32 (16 x 2 pasos de acumulacion de gradiente), optimizador AdamW fused con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 250 pasos de warmup, 4000 pasos totales, semilla 42 y precision mixta nativa (AMP). El entrenamiento se realizo con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta el volumen de datos, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo ASR supervisado).

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio en arabe, con especializacion en recitacion coranica.
- Transcripcion de audio a texto con el pipeline `automatic-speech-recognition` de Transformers.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` en los tags del repositorio).
- No se documentan capacidades de traduccion, diarizacion, timestamps por palabra ni deteccion de idioma.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no son capacidades propias de un modelo ASR).
- Capacidades multilingues: no disponibles; el modelo base esta orientado al arabe.

## Casos de uso

- Transcripcion de recitacion coranica en aplicaciones educativas: el modelo puede convertir audio de recitadores en texto para generar material de estudio, comparar variantes de recitacion o alimentar sistemas de correccion de taywid, aprovechando su ajuste especifico al dominio.
- Verificacion de memorizacion (hifz): integrado en una aplicacion movil o web, permite contrastar la recitacion del usuario con el texto esperado y detectar omisiones o errores, gracias al bajo coste computacional de sus 72,6 M de parametros.
- Subtitulado automatico de archivos de audio o video religiosos: el modelo puede generar transcripciones en arabe de sermones o recitaciones grabadas para su publicacion en plataformas de contenido.
- Indexacion y busqueda de archivos de audio: transcribir grandes volumenes de recitaciones para permitir busqueda por texto (por sura, aleya o fragmento), con despliegue en CPU o GPU modesta.
- Generacion de datasets de audio-texto: usar el modelo para preetiquetar recitaciones y acelerar la anotacion humana en proyectos de investigacion sobre ASR arabe.
- Asistentes de voz para estudio del Coran: transcripcion en tiempo real en dispositivos de gama baja o edge, dado el reducido tamano del modelo y su licencia permisiva para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del repositorio declara una entrada para ayata-whisper-quran-v2 con la lista de resultados vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,3 GB de pesos (72,6 M de parametros x 4 bytes); en fp16, unos 0,15 GB. El consumo real dependera del tamano del lote y de la longitud del audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien funciona en CPU para audios de duracion moderada.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050 Ti en adelante), asi como en Apple Silicon mediante MPS.
- Opciones de despliegue: pipeline de Transformers, Text Generation Inference no aplica (es ASR); se puede servir con FastAPI + transformers, con endpoints de Hugging Face Inference, o convertir a otros formatos no documentados por el autor. No hay confirmacion de soporte en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ayata-whisper-quran-v2 | 72,6 M | no disponible | apache-2.0 | Fine-tune de whisper-base-ar-quran; sin benchmarks publicados |
| tarteel-ai/whisper-base-ar-quran | ~72 M (Whisper Base) | no disponible | no disponible en esta ficha | Modelo base del que deriva; especializado en arabe coranico |
| openai/whisper-base | 74 M | 30 s de audio por ventana | apache-2.0 | Whisper Base original, multilingue generico |
| openai/whisper-small | 244 M | 30 s de audio por ventana | apache-2.0 | Mayor capacidad, mas coste de inferencia |

No se dispone de datos de rendimiento comparativo para ayata-whisper-quran-v2, por lo que la comparacion se limita a parametros, licencia y especializacion.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento ("generator"), lo que impide evaluar la cobertura, calidad y posibles sesgos de los datos.
- No se han publicado metricas de evaluacion (WER, CER) ni validacion sobre conjuntos de test independientes; el rendimiento real es desconocido.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, recitadores con estilos poco representados o variantes dialectales.
- Modelo orientado a un dominio muy estrecho (recitacion coranica en arabe); su uso fuera de ese dominio probablemente degrade la calidad de forma significativa.
- Idiomas soportados no documentados; no debe asumirse capacidad multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia de los datos de entrenamiento antes de un despliegue en produccion.
- El repositorio incluye checkpoints intermedios (2,4 GB), lo que puede confundir al descargar; conviene usar los pesos finales en safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jodijhouranda/ayata-whisper-quran-v2
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Whisper Base original (OpenAI): https://huggingface.co/openai/whisper-base
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
