# niobures/MOSS-Audio-Tokenizer

## Resumen

MOSS-Audio-Tokenizer es un tokenizador de audio discreto unificado desarrollado por el equipo MOSS (OpenMOSS-Team), presentado en el artículo "MOSS-Audio-Tokenizer: Scaling Audio Tokenizers for Future Audio Foundation Models". Su función principal es convertir señales de audio en representaciones discretas (tokens) de alta compresión manteniendo una calidad de reconstrucción casi sin pérdidas. El modelo resuelve el problema de los tokenizadores de audio tradicionales, que suelen tener limitaciones de escalabilidad, compresión o alineación semántica, proporcionando una interfaz robusta para futuros modelos de audio multimodales.

La arquitectura del modelo se denomina Cat (Causal Audio Tokenizer with Transformer) y está compuesta por un transformer causal puro, sin capas convolucionales. El modelo tiene un total de 1.774.566.400 parámetros (1.6B según el autor) y utiliza un cuantizador vectorial residual (RVQ) de 32 capas para lograr compresiones extremas: reduce audio de 24 kHz a una tasa de frames de 12.5 Hz, con bitrates variables desde 0.125 kbps hasta 4 kbps. Ha sido entrenado desde cero en 3 millones de horas de audio diverso, sin depender de encoders preentrenados ni destilación de modelos externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cat (Causal Audio Tokenizer with Transformer), transformer puro sin CNN |
| Parametros totales | 1.774.566.400 (1.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo usa una ventana causal, pero el valor exacto no se especifica) |
| Tipos de cuantizacion | RVQ de 32 capas, bitrate variable de 0.125 a 4 kbps |
| Idiomas soportados | no disponible (el modelo procesa audio, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura Cat se basa en un transformer causal homogéneo, sin capas convolucionales, compuesto por un encoder y un decoder. El encoder transforma la señal de audio de 24 kHz en una secuencia de tokens discretos mediante un cuantizador vectorial residual (RVQ) de 32 capas. El decoder reconstruye la forma de onda a partir de los tokens. El modelo incluye también un discriminador y un modelo de lenguaje decoder-only que actúa como alineador semántico, todos optimizados de forma conjunta en un pipeline de entrenamiento unificado.

El entrenamiento se realizó desde cero sobre 3 millones de horas de audio general, abarcando voz, efectos de sonido y música. No se utilizaron encoders preentrenados como HuBERT o Whisper, ni destilación de modelos maestros. Todas las representaciones se aprenden de forma autónoma a partir de los datos crudos. El resultado es un tokenizador que logra una reconstrucción de alta fidelidad y, a la vez, produce tokens "semánticamente ricos", aptos para tareas posteriores de reconocimiento de voz (ASR) y síntesis de voz (TTS).

## Capacidades

- Tokenización de audio con compresión extrema: convierte audio de 24 kHz en una secuencia de tokens a 12.5 Hz, lo que supone una reducción de la tasa de muestreo de 1920x.
- Reconstrucción de alta fidelidad en un amplio rango de bitrates, desde 0.125 kbps hasta 4 kbps, seleccionando el número de capas RVQ utilizadas en la decodificación.
- Representación unificada semántica-acústica: los tokens generados contienen información tanto acústica como semántica, lo que permite su uso directo en modelos de ASR y TTS.
- Procesamiento de audio general: entrenado en voz, música y efectos de sonido, no se limita a un dominio específico.
- Soporte de inferencia por streaming: los métodos `encode` y `decode` aceptan un parámetro `chunk_duration` para procesar audio en bloques, con restricciones de divisibilidad con la tasa de downsample.
- Escalabilidad: al estar construido íntegramente con bloques transformer causales, el modelo es fácilmente escalable a tamaños mayores.

## Casos de uso

- Compresión de audio para transmisión en tiempo real: gracias a su baja tasa de frames (12.5 Hz) y su soporte de streaming, el modelo puede utilizarse en sistemas de comunicación por voz de baja latencia, reduciendo el ancho de banda necesario sin degradar perceptiblemente la calidad.
- Tokenización para modelos de audio fundacionales: los tokens generados por MOSS-Audio-Tokenizer sirven como entrada para entrenar modelos generativos de audio (TTS, música o efectos de sonido), aprovechando la alineación semántica de las representaciones.
- Codificación de música en plataformas de streaming: la capacidad de seleccionar entre 0.125 y 4 kbps permite adaptar la calidad del audio al ancho de banda disponible, siendo adecuado para servicios de música con distintos niveles de calidad.
- Preprocesamiento para modelos multimodales: al convertir audio en tokens discretos, el modelo facilita la integración de audio en modelos de lenguaje multimodal que operan sobre secuencias discretas.
- Almacenamiento eficiente de archivos de audio: la alta compresión permite reducir significativamente el tamaño de los archivos de audio manteniendo una calidad aceptable, útil en archivado de grabaciones o datos de entrenamiento.
- Investigación en tokenizadores de audio: el modelo sirve como referencia para estudios comparativos de tokenizadores, ya que ofrece una arquitectura homogénea y entrenada desde cero, sin dependencia de modelos externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del propio MOSS-Audio-Tokenizer en la información disponible. La tabla de evaluación proporcionada por el autor está incompleta y no incluye las métricas del modelo. A continuación se muestran los datos parciales de otros tokenizadores para contextualizar la comparación:

| Modelo | bps | Frame rate | Nq | Speech: SIM (EN/ZH) | Speech: STOI (EN/ZH) | Speech: PESQ-NB (EN/ZH) | Speech: PESQ-WB (EN/ZH) | Audio/Music: Mel-Loss | Audio/Music: STFT-Dist. |
|---|---|---|---|---|---|---|---|---|---|
| XCodec2.0 | 800 | 50 | 1 | 0.82 / 0.74 | 0.92 / 0.86 | 3.04 / 2.46 | 2.43 / 1.96 | -- / -- | -- / -- |
| MiMo Audio Tokenizer | 850 | 25 | 4 | 0.80 / 0.74 | 0.91 / 0.87 | 2.94 / 2.62 | 2.39 / 2.14 | 0.82 / 0.81 | 2.33 / 2.23 |
| Higgs Audio Tokenizer | 1000 | 25 | 4 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: los valores de MOSS-Audio-Tokenizer no aparecen en la tabla original extraída, por lo que no se pueden presentar.

## Requisitos de hardware

No se han publicado requisitos de hardware oficiales en la información disponible. A partir del tamaño de los pesos (7.1 GB en safetensors), se puede estimar lo siguiente:

- VRAM estimada: el modelo en FP16 requiere aproximadamente 3.5 GB de VRAM para los pesos, más memoria adicional para activaciones y overhead de inferencia. En FP32, los pesos ocupan alrededor de 7 GB.
- GPUs recomendadas: no hay una recomendación oficial. Una GPU con 8-12 GB de VRAM podría ejecutar el modelo en FP16 o con cuantización, pero no se dispone de pruebas.
- Compatibilidad con GPU consumer: posiblemente sí en GPUs de 12 GB o más, pero sin datos confirmados.
- Opciones de despliegue: el modelo se carga mediante Transformers con `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama u otros motores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se basa en los datos parciales disponibles. No se incluyen métricas de MOSS-Audio-Tokenizer.

| Parametro | MOSS-Audio-Tokenizer | XCodec2.0 | MiMo Audio Tokenizer | Higgs Audio Tokenizer |
|---|---|---|---|---|
| Parametros | 1.774.566.400 | no disponible | no disponible | no disponible |
| Frame rate | 12.5 Hz | 50 Hz | 25 Hz | 25 Hz |
| Bitrate | 0.125 - 4 kbps | 800 bps | 850 bps | 1000 bps |
| Numero de cuantizadores | 32 | 1 | 4 | 4 |
| Licencia | Apache 2.0 | no disponible | no disponible | no disponible |
| Disponibilidad | HuggingFace (niobures/MOSS-Audio-Tokenizer) | no disponible | no disponible | no disponible |

Nota: los datos de XCodec2.0, MiMo y Higgs provienen de la tabla parcial del README, pero no se dispone de información completa sobre sus parámetros o licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos del modelo en la información disponible. Al entrenarse en audio general, podría heredar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion: no aplica directamente, ya que el modelo no genera texto ni contenido semántico libre, sino tokens de audio. Sin embargo, en tareas de reconstrucción podría producir artefactos en señales fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: el modelo procesa audio, por lo que no tiene limitaciones de idioma en el sentido tradicional. La ventana de contexto causal no se especifica, lo que impide conocer la duración máxima de audio que puede procesar de una vez.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, siempre que se cumplan sus condiciones. No hay restricciones adicionales conocidas.
- Caveat de despliegue: el repositorio requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código remoto no auditado. En entornos de producción, se recomienda revisar el código antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/niobures/MOSS-Audio-Tokenizer
- Articulo en arXiv: https://arxiv.org/abs/2602.10934
- Repositorio de codigo en el modelo: https://huggingface.co/niobures/MOSS-Audio-Tokenizer/tree/main
