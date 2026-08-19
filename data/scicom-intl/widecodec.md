# Scicom-intl/WideCodec

## Resumen

WideCodec es un codec neuronal de audio desarrollado por Scicom-intl, presentado como un finetune del decodificador de NeuCodec (de neuphonic/neucodec) que opera a 44.1 kHz con una tasa de bits ultrabaja de 0.8 kbps. El modelo tokeniza audio en secuencias discretas de 50 tokens por segundo usando un único codebook FSQ (Finite Scalar Quantization), lo que lo sitúa como una alternativa de alta eficiencia frente a codecs como DAC o EnCodec, que requieren entre 8 y 24 kbps para calidades comparables. Su relevancia actual radica en la creciente demanda de representaciones de audio compactas para modelos generativos, transmisión en tiempo real y almacenamiento a gran escala, donde la reducción de bits sin pérdida drástica de naturalidad es crítica.

El modelo se entrena en dos etapas: una primera con datos ruidosos y extensos (~6.500 horas) y una segunda de ajuste fino con habla limpia de alta tasa de muestreo. Según el autor, en un benchmark offline sobre 9.291 clips multilingües, WideCodec supera a DAC en naturalidad (UTMOSv2 2.79 vs 2.67) usando aproximadamente 10 veces menos bits, y se acerca a NeMo (que opera a 6-9 kbps) con una diferencia de solo 0.12 en la misma métrica. El repositorio incluye el código de inferencia autocontenido y los pesos del decodificador, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Neural audio codec (NeuCodec) con decodificador finetune, FSQ (levels=[4]×8, 1 quantizer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio continuo; procesa señales de 16 kHz mono de entrada) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin cuantización declarada) |
| Idiomas soportados | no disponible (entrenado con datos multilingües, 400+ etiquetas de idioma/dialecto en el benchmark) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (pytorch_model.bin) |

## Arquitectura y entrenamiento

WideCodec es un finetune del decodificador de NeuCodec, un codec neuronal basado en transformer con cuantización FSQ. La configuración FSQ usa 8 niveles por dimensión (levels=[4]×8) y un único cuantizador, lo que produce 16 bits por frame (8·log₂4) a 50 frames por segundo, resultando en 800 bps. El encoder ingiere audio mono de 16 kHz y genera códigos discretos; el decodificador, con profundidad 20 (decoder_depth=20), reconstruye la señal a 44.1 kHz. El entrenamiento se divide en dos etapas: la primera (Stage 1) usa una mezcla ruidosa de 8 corpus base más el conjunto scale44k (~6.500 horas, principalmente podcasts y habla conversacional), y la segunda (Stage 2) es un ajuste fino con datos limpios de ≥44.1 kHz (TTS-Clean44k, podcasts limpios, EARS, Expresso). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con pérdidas de reconstrucción espectral y de naturalidad.

## Capacidades

- Compresión de audio a 0.8 kbps con reconstrucción a 44.1 kHz, manteniendo contenido de alta frecuencia (rolloff de 9.0 kHz y energía HF ~91% de la señal original).
- Tokenización de audio en secuencias discretas de 50 tokens por segundo, adecuada para modelos de lenguaje de audio o TTS.
- Soporte de entrada de audio mono de 16 kHz, con salida a 44.1 kHz.
- Capacidad multilingüe: el benchmark del autor cubre más de 400 etiquetas de idioma/dialecto, aunque no se especifica una lista oficial.
- Inferencia autocontenida: el repositorio incluye el paquete `neucodec` y el script `infer_widecodec.py`, sin dependencias externas adicionales.
- No es un modelo generativo de texto ni de voz; es un codec de compresión/reconstrucción.

## Casos de uso

- Almacenamiento y archivado de audio a gran escala: con 0.8 kbps, una hora de audio ocupa aproximadamente 360 KB, lo que permite archivar bibliotecas de podcasts o grabaciones de voz con un coste de almacenamiento mínimo.
- Transmisión de voz en tiempo real: la baja tasa de bits (0.8 kbps) y la alta velocidad de tokenización (50 tokens/s) la hacen viable para aplicaciones de streaming de baja latencia en redes limitadas.
- Preprocesamiento para modelos TTS: los tokens discretos generados pueden servir como entrada para modelos de lenguaje de audio, reduciendo la dimensionalidad frente a codecs de mayor bitrate.
- Tokenización de audio para entrenamiento de modelos multimodales: al producir secuencias compactas, facilita el entrenamiento de transformadores que operan sobre representaciones de audio discretas.
- Mejora de calidad en transcripción o diarización: al reconstruir audio limpio a 44.1 kHz desde una entrada de 16 kHz, puede emplearse como etapa de realce en pipelines de procesado de voz.
- Evaluación de codecs en investigación: su licencia Apache 2.0 y su código autocontenido permiten reproducir benchmarks y comparar con otros codecs de baja tasa de bits.

## Benchmarks y rendimiento

El autor publica una tabla comparativa en la model card, basada en un benchmark offline sobre 9.291 clips multilingües (50 clips × 188 datasets limpios de ≥44.1 kHz), usando faster-UTMOSv2 y métricas espectrales frente a la señal original. Los resultados del checkpoint final (gs-2.0M) son:

| codec | native SR | tokens/s | codebooks | ~bitrate | UTMOSv2 | mel-L1 ↓ | HF≥11k | rolloff |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| ground truth | — | — | — | — | 2.822 | — | 0.00244 | 8263 |
| nvidia nemo44k | 44.1k | ~86 | RVQ (many) | ~6–9 kbps | **2.903** | 0.379 | 0.00196 | 8372 |
| **WideCodec (gs-2.0M)** | 44.1k | **50** | **1** | **~0.8 kbps** | **2.788** | 0.571 | 0.00223 | 9011 |
| dac | 44.1k | 86 | 9 | ~8 kbps | 2.672 | **0.341** | 0.00156 | 8185 |
| snac44k | 44.1k | multi-scale | 3–4 | ~2.6 kbps | 2.340 | 0.493 | 0.00158 | 8402 |
| encodec48k | 48k | 150 | RVQ | 24 kbps | 2.042 | 0.458 | 0.00169 | 8800 |

Nota: el autor excluye PESQ/SI-SDR por considerar que penalizan estructuralmente a los decodificadores generativos de baja tasa de bits. No se han publicado resultados en otros benchmarks estándar (p. ej., MMLU, HumanEval) porque no es un modelo de texto.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la documentación del autor.
- El código de inferencia usa `.cuda()`, por lo que se requiere una GPU con soporte CUDA.
- El tamaño del repositorio es de 309 GB, lo que sugiere que el checkpoint completo (incluyendo estados del optimizador en `last.ckpt`) es muy grande; los pesos de inferencia (`pytorch_model.bin`) son una fracción de ese tamaño, pero no se indica su peso exacto.
- Opciones de despliegue: el script `infer_widecodec.py` permite procesar archivos o directorios; también se puede cargar el modelo en Python con `NeuCodec._from_pretrained`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de texto.
- Latencia y throughput: no disponibles; la tasa de 50 tokens/s sugiere un procesamiento en tiempo real en hardware adecuado, pero no hay mediciones publicadas.

## Comparativa con modelos similares

La tabla de benchmarks anterior ya compara WideCodec con los principales codecs de la misma categoría. Resumen de diferencias clave:

| Modelo | Bitrate | Codebooks | UTMOSv2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WideCodec | 0.8 kbps | 1 | 2.788 | Apache 2.0 | HuggingFace (Scicom-intl/WideCodec) |
| DAC | ~8 kbps | 9 | 2.672 | MIT (original) | HuggingFace (descriptinc/dac) |
| EnCodec | 24 kbps | RVQ | 2.042 | MIT (original) | HuggingFace (facebook/encodec) |
| NeMo 44k | ~6-9 kbps | RVQ | 2.903 | Apache 2.0 (NVIDIA) | HuggingFace (nvidia/nemo) |

WideCodec ofrece la tasa de bits más baja con una naturalidad superior a DAC y comparable a NeMo, aunque con mayor error espectral (mel-L1 0.571 vs 0.341 de DAC). Su ventaja principal es la compresión extrema, mientras que DAC y NeMo priorizan la fidelidad de reconstrucción.

## Limitaciones y advertencias

- El modelo está entrenado predominantemente con habla humana; su rendimiento en música u otros tipos de audio no está documentado y probablemente sea inferior.
- La tasa de bits ultrabaja (0.8 kbps) implica una pérdida de fidelidad en banda (el autor lo reconoce como un trade-off: "trading in-band fidelity for a ~10x bitrate advantage").
- Las métricas PESQ/SI-SDR no se reportan porque, según el autor, penalizan estructuralmente a los codecs generativos de baja tasa; esto limita la comparabilidad con otros sistemas que sí las usan.
- No se especifican sesgos demográficos o lingüísticos, aunque el entrenamiento incluye datos multilingües; la cobertura de idiomas no está formalmente definida.
- El repositorio es muy grande (309 GB) y la descarga completa puede ser problemática en entornos con ancho de banda limitado; el archivo `last.ckpt` incluye estados del optimizador, innecesarios para inferencia.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento (algunos datasets como EARS o Expresso pueden tener restricciones adicionales).
- No hay garantías de soporte a largo plazo; el proyecto parece reciente (creado en junio de 2026) y con pocas descargas (0) y likes (2) en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Scicom-intl/WideCodec
- Modelo base NeuCodec: https://huggingface.co/neuphonic/neucodec
- Datasets de entrenamiento mencionados:
  - https://huggingface.co/datasets/malaysia-ai/malaysian-podcast-youtube
  - https://huggingface.co/datasets/malaysia-ai/singaporean-podcast-youtube
  - https://huggingface.co/datasets/malaysia-ai/Multilingual-TTS
  - https://huggingface.co/datasets/malaysia-ai/malaysian-cartoons-youtube
  - https://huggingface.co/datasets/malaysia-ai/malaysian-movie-youtube
  - https://huggingface.co/datasets/ylacombe/expresso
  - https://huggingface.co/datasets/nytopop/expresso-conversational
