# Jeremytromp/htdemucs-ft-vocals-onnx

## Resumen
htdemucs-ft-vocals-onnx es un espejo del fichero `htdemucs_ft_vocals.onnx` publicado por StemSplitio, que a su vez es una exportación a ONNX del especialista en voces del modelo htdemucs_ft de Meta. No es un modelo de lenguaje: es un modelo de separación de fuentes musicales (source separation) que aísla la pista vocal de una mezcla musical. La relevancia actual radica en que permite ejecutar HT-Demucs sin PyTorch, exclusivamente con onnxruntime y numpy, lo que habilita su despliegue en iOS, Android y navegador, así como en entornos de producción sin dependencias de entrenamiento. El repositorio, mantenido por Jeremytromp, contiene los mismos bytes que el original de StemSplitio y no introduce modificaciones.

La arquitectura subyacente es HT-Demucs (Hybrid Transformer Demucs), un transformer híbrido tiempo-frecuencia desarrollado por Meta. Este espejo concreto empaqueta el sub-modelo 3 de un ensamblado de 4 bolsas (4-bag ensemble) de htdemucs_ft, especializado en la separación de voces. El fichero ONNX ocupa 316 MB e incluye el cálculo de la STFT dentro del grafo, lo que simplifica la integración: la entrada es un tensor float32 `[1, 2, 343980]` (7,8 segundos de audio estéreo a 44,1 kHz) y la salida es `[1, 4, 2, 343980]` con los stems de batería, bajo, otros y voces, siendo únicamente el índice 3 (voces) significativo.

El modelo se distribuye bajo licencia MIT, lo que permite uso comercial manteniendo la atribución a Meta Platforms y a StemSplitio. Está pensado para tareas de aislamiento vocal, alineación de subtítulos, karaoke, remezclas y preprocesado para sistemas de reconocimiento automático del habla. No incorpora capacidades de generación de texto, tool calling ni razonamiento multi-paso, ya que su dominio es exclusivamente audio-a-audio.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | HT-Demucs (Hybrid Transformer Demucs), transformer híbrido tiempo-frecuencia, exportado a ONNX |
| Parametros totales | no disponible (fichero ONNX de 316 MB en float32; repositorio de 0,3 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de entrada fija de 343.980 muestras (7,8 s a 44,1 kHz estéreo) |
| Tipos de cuantizacion | no disponible (exportado en float32; no se ofrecen variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de separación de fuentes de audio) |
| Licencia | MIT (demucs © Meta Platforms, Inc. y afiliados; exportación ONNX por StemSplitio, MIT) |
| Formato de pesos | ONNX (onnxruntime) |
| Entrada | `mix`: float32 `[1, 2, 343980]` (7,8 s de audio estéreo a 44,1 kHz) |
| Salida | `stems`: float32 `[1, 4, 2, 343980]` (batería, bajo, otros, voces; solo voces es significativa) |

## Arquitectura y entrenamiento
HT-Demucs es un modelo de separación de fuentes musicales que combina representaciones en el dominio de la onda (waveform) y en el dominio espectral (spectrogram) mediante un transformer. La variante `htdemucs_ft` es un ajuste fino (fine-tuning) del modelo base que se organiza como un ensamblado de cuatro bolsas; este repositorio contiene únicamente el sub-modelo 3, especializado en voces. La exportación a ONNX incluye la STFT dentro del grafo, lo que evita dependencias externas de PyTorch o librerías de procesamiento de señal en tiempo de inferencia.

No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO, algo esperable porque no es un modelo de lenguaje. El blog de StemSplit indica que la exportación es la primera funcional de HT-Demucs a ONNX y que el modelo es el separador vocal de código abierto con mejor rendimiento en MUSDB18-HQ, pero no se incluyen cifras concretas de entrenamiento ni métricas en la documentación del espejo. La verificación técnica reportada por la fuente original afirma que el modelo ONNX es numéricamente equivalente al modelo PyTorch original.

## Capacidades
- Separación de fuentes musicales: genera cuatro stems (batería, bajo, otros, voces), aunque solo la pista de voces es significativa en esta exportación concreta.
- Aislamiento vocal: extrae la voz de una mezcla musical para tareas de karaoke, remezcla o análisis.
- Inferencia sin PyTorch: se ejecuta con onnxruntime y numpy, lo que permite desplegarlo en entornos ligeros, móviles y web.
- Procesamiento por ventanas: la entrada es de 7,8 segundos; para audio de mayor duración es necesario trocear la señal y concatenar las salidas.
- Integración en pipelines de audio: puede encadenarse con sistemas de reconocimiento automático del habla, alineación de subtítulos o sincronización labial.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No genera texto, código ni matemáticas; su única modalidad es audio-a-audio.

## Casos de uso
- Alineación de subtítulos: el modelo aísla la voz de la mezcla musical para que un sistema de reconocimiento automático del habla genere transcripciones con marcas de tiempo más precisas; es el uso declarado por TrompTech Studio en la model card.
- Karaoke y eliminación de voz: al obtener el stem de voces, se puede restar de la mezcla original para producir una pista instrumental o conservar únicamente la voz para aplicaciones de canto.
- Remezclas y producción musical: los productores pueden separar la voz para aplicar procesado independiente (reverb, compresión, afinación) sin afectar al resto de instrumentos.
- Preprocesado para ASR en entornos ruidosos: al aislar la voz, se mejora la relación señal-ruido antes de alimentar un reconocedor de habla, lo que reduce la tasa de error en canciones o grabaciones con música de fondo.
- Sincronización labial y doblaje: la pista vocal aislada facilita el ajuste temporal de doblajes y la verificación de sincronía en producción audiovisual.
- Despliegue en dispositivos móviles y web: al ser un fichero ONNX con STFT integrada y runtime ligero, puede ejecutarse en iOS, Android o navegador sin depender de PyTorch, lo que habilita aplicaciones de edición de audio en tiempo real.
- Análisis forense y musicología computacional: permite estudiar características vocales, detectar similitudes entre grabaciones o generar datasets de voz a partir de música.
- Generación de datasets de canto: la separación vocal posibilita crear corpus de voces cantadas para entrenar modelos de síntesis o conversión de voz.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El blog de StemSplit menciona un benchmark reproducible sobre MUSDB18-HQ y afirma que este modelo es el separador vocal de código abierto con mejor rendimiento en dicho conjunto de datos, pero no se incluyen cifras concretas (SDR, SIR, SAR) en la información proporcionada. La fuente original también indica que la exportación ONNX es numéricamente equivalente al modelo PyTorch, sin aportar métricas adicionales.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El fichero de pesos ONNX ocupa 316 MB en float32, por lo que la huella de memoria es moderada y no requiere GPU dedicada.
- GPU recomendadas: no se especifican. Al ejecutarse con onnxruntime, puede funcionar en CPU, GPU integrada, GPU dedicada (por ejemplo, NVIDIA GTX/RTX, Apple Silicon) o aceleradores móviles compatibles con ONNX Runtime.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en dispositivos móviles, dado el tamaño reducido del fichero.
- Opciones de despliegue: onnxruntime (Python, C++, C#, Java, JavaScript), script de referencia en numpy incluido en el repositorio original. No es compatible con runtimes específicos de modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Dependen del hardware y del número de ventanas de 7,8 segundos a procesar; el modelo requiere troceado y concatenación para audio largo.

## Comparativa con modelos similares
| Modelo | Arquitectura | Parametros | Ventana de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeremytromp/htdemucs-ft-vocals-onnx (este modelo) | HT-Demucs (sub-modelo 3, voces), ONNX | no disponible (316 MB ONNX) | 343.980 muestras (7,8 s, 44,1 kHz estéreo) | MIT | HuggingFace, espejo sin modificaciones |
| StemSplitio/htdemucs-ft-vocals-onnx | HT-Demucs (sub-modelo 3, voces), ONNX | no disponible (316 MB ONNX) | 343.980 muestras (7,8 s, 44,1 kHz estéreo) | MIT | HuggingFace, repositorio original |
| htdemucs_ft original (Meta) | HT-Demucs, ensamblado de 4 bolsas, PyTorch | no disponible | variable (procesado por segmentos) | MIT | GitHub facebookresearch/demucs |
| StemSplitio/htdemucs-onnx | HT-Demucs (modelo completo), ONNX | no disponible | no disponible | MIT | HuggingFace |

## Limitaciones y advertencias
- Solo el stem de voces es significativo; los stems de batería, bajo y otros no deben utilizarse como salida fiable en esta exportación concreta.
- La entrada está fijada a 343.980 muestras (7,8 s a 44,1 kHz estéreo). Para audio de mayor duración es obligatorio trocear y concatenar, lo que puede introducir artefactos en los bordes de cada ventana.
- Solo admite audio estéreo a 44,1 kHz; otras frecuencias de muestreo o canales requieren remuestreo y conversión previos.
- Riesgo de alucinación en el sentido de artefactos o separación imperfecta: en pasajes con voces superpuestas a instrumentos con contenido espectral similar, pueden aparecer residuos o distorsión.
- Sesgos musicales: al estar entrenado en su mayor parte con música occidental y géneros presentes en MUSDB18-HQ, su rendimiento puede degradarse en otros estilos, idiomas o tradiciones musicales.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero se debe mantener la atribución a Meta Platforms, Inc. y a StemSplitio tal como figura en el fichero LICENSE.
- Este repositorio es un espejo sin cambios; no ofrece soporte, mantenimiento ni actualizaciones por parte del autor del espejo.
- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no soporta tool calling ni agentes.
- La información sobre entrenamiento, parámetros y métricas es limitada; para producción se recomienda validar el rendimiento en el dominio concreto de audio antes de desplegarlo.

## Enlaces
- Modelo en HuggingFace (este espejo): https://huggingface.co/Jeremytromp/htdemucs-ft-vocals-onnx
- Repositorio original de StemSplitio: https://huggingface.co/StemSplitio/htdemucs-ft-vocals-onnx
- Blog de StemSplit sobre la exportación a ONNX: https://stemsplit.io/blog/htdemucs-ft-onnx-export
- Repositorio de Demucs de Meta: https://github.com/facebookresearch/demucs
- Página de modelos de demucs-onnx: https://stemsplit.github.io/demucs-onnx/models/
- Modelo ONNX de StemSplitio para HT-Demucs completo: https://huggingface.co/StemSplitio/htdemucs-onnx
- Espejo de la página de HuggingFace del repositorio original: https://hf-p-cfw.fyan.top/StemSplitio/htdemucs-ft-vocals-onnx
