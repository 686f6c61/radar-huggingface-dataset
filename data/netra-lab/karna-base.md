# Netra-Lab/karna-base

## Resumen

karna-base es un modelo de reconocimiento automático del habla (ASR) de tipo CTC desarrollado por Netra-Lab, especializado en jemer (khmer) e inglés. Se obtiene mediante poda estructurada del modelo `facebook/omniASR-CTC-300M` de Meta, reduciendo el encoder hasta aproximadamente un 80 % de dispersión y dejando el conjunto en 71,3 millones de parámetros. El resultado es un reconocedor ligero que se ejecuta sobre ONNX Runtime en CPU, sin necesidad de PyTorch, lo que facilita su despliegue en entornos con recursos limitados.

El modelo forma parte de una pareja junto a `Netra-Lab/karna-large`, siguiendo la nomenclatura de los modelos WavLM podados Base-s80 y Large-s80 de DiariZen. La motivación principal es ofrecer ASR de calidad para jemer, un idioma con poca cobertura en modelos convencionales, manteniendo además un rendimiento razonable en inglés. En jemer, karna-base se queda a menos de 0,5 puntos de su profesor afinado sin podar y reduce el error a una quinta parte del modelo original de Meta.

La versión actual es la v2, que mejora todos los conjuntos de prueba respecto a la primera release (73 M de parámetros). La arquitectura es un encoder estilo wav2vec2 con 48 capas transformer de anchura 1.280 antes de la poda, aunque tras el recorte cada capa tiene una anchura distinta, lo que impide cargarlo con fairseq2 u `omnilingual-asr`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer estilo wav2vec2 con cabeza CTC, poda estructurada por capas |
| Parametros totales | 71.261.424 (71 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; ventana no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el modelo card no detalla variantes cuantizadas) |
| Idiomas soportados | jemer (km), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder CTC de estilo wav2vec2. La entrada es audio a 16 kHz que pasa por un extractor de características convolucional de 7 capas, que produce un frame cada 20 ms. Sobre esos frames se suma un encoder posicional convolucional y se aplican 48 capas transformer pre-LayerNorm de anchura 1.280, una LayerNorm final y una cabeza CTC sobre un vocabulario de 9.812 caracteres que cubre escritura jemer y latina. Tras la poda, cada capa conserva un número distinto de cabezas de atención y unidades FFN; el encoder resultante tiene 61 M de parámetros, el 19 % de los 315 M del modelo original. El front-end convolucional y la capa de salida no se modifican.

El proceso de construcción sigue la receta de *Fine-tune Before Structured Pruning* (arXiv 2505.24111) con el método de poda de DPHuBERT (arXiv 2305.17651), tal como se emplea en DiariZen. Primero se afina `omniASR_CTC_300M` con CTC durante 62k pasos sobre la mezcla de entrenamiento (50/50 por idioma: DDD y FLEURS-km train para jemer; LibriSpeech y FLEURS-en train para inglés), obteniendo el profesor. Después se poda durante 12k pasos con compuertas Hard Concrete L0 sobre cabezas de atención y unidades FFN, con una restricción de Lagrange aumentada que lleva la dispersión objetivo al 80 % en los primeros 6k pasos, destilando del profesor con una pérdida L1 − coseno sobre estados ocultos en las capas 6, 12, 18 y 24. Luego se eliminan definitivamente las unidades podadas, se continúa la destilación por capas durante 5k pasos con la máscara congelada y, finalmente, se recupera durante 24k pasos con CTC más una divergencia KL a nivel de frame respecto a la distribución de salida del profesor (temperatura 1, peso 1).

## Capacidades

- Reconocimiento de voz a texto en jemer e inglés mediante decodificación CTC voraz (greedy), sin modelo de lenguaje.
- Transcripción de audio a 16 kHz con frames cada 20 ms.
- Manejo de escritura jemer y latina gracias al vocabulario de 9.812 caracteres heredado de Omnilingual ASR.
- Inferencia en CPU sobre ONNX Runtime mediante el paquete `netra-karna`, sin dependencia de PyTorch.
- Ejecución también con el código PyTorch incluido en el repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de audio en jemer en entornos con CPU: el modelo está pensado para ejecutarse en ONNX Runtime sin GPU, lo que permite desplegarlo en servidores modestos o dispositivos de borde para subtitulado y actas.
- Subtitulado y transcripción de reuniones bilingües jemer-inglés: al cubrir ambos idiomas con un único vocabulario CTC, puede emplearse en flujos donde se alternan las dos lenguas.
- Indexación y búsqueda de archivos de audio: la transcripción permite generar índices textuales de grabaciones en jemer para su posterior búsqueda.
- Procesamiento por lotes de corpus de voz: con un coste de 5,8 GMAC por segundo de audio, es adecuado para transcribir grandes volúmenes en pipelines offline.
- Investigación en ASR de bajos recursos: sirve como punto de partida ligero para experimentos con jemer, dado su tamaño reducido y su licencia Apache 2.0.
- Integración en aplicaciones de accesibilidad: transcripción en tiempo real de audio en jemer en dispositivos sin acelerador gráfico.
- Destilación y comparación académica: útil como referencia de modelos podados para estudiar el equilibrio entre tamaño y precisión en ASR multilingüe.

## Benchmarks y rendimiento

Decodificación CTC voraz, sin modelo de lenguaje. CER para jemer y WER para inglés, en porcentaje (menor es mejor).

| Modelo | Parametros | GMAC / s audio | DDD (km) | FLEURS-km | FLEURS-en | LibriSpeech test-clean | LibriSpeech test-other |
|---|---|---|---|---|---|---|---|
| `omniASR_CTC_300M` (stock) | 325M | 18,3 | 9,65 | 16,26 | – | 6,53 | 14,45 |
| Fine-tuned 300M (teacher) | 325M | 18,3 | 1,47 | 9,95 | 18,78 | 5,57 | 13,20 |
| **karna-base** | **71M** | **5,8** | **1,94** | **15,20** | **29,66** | **10,96** | **23,53** |

En jemer, karna-base se queda a 0,47 puntos de su profesor en DDD y reduce el error a una quinta parte del modelo original. En inglés conserva bastante menos precisión: aproximadamente 1,5–2 veces el WER del profesor y por detrás del modelo original. Los conjuntos FLEURS-km y FLEURS-en son in-domain, ya que sus particiones de entrenamiento forman parte de la mezcla.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en ONNX Runtime sin GPU, con el paquete `netra-karna`.
- VRAM estimada: no disponible; al ejecutarse en CPU, no requiere VRAM dedicada en el escenario previsto.
- GPU recomendadas: no disponibles en la información; el modelo card no las especifica.
- Compatibilidad con GPU de consumo: no documentada; al ser un modelo de 71 M de parámetros, es plausible en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime con `netra-karna` (PyPI), imagen Docker `ghcr.io/netra-ai-lab/karna`, y código PyTorch incluido en el repositorio. No es compatible con fairseq2 ni `omnilingual-asr` por la anchura no uniforme de las capas.
- Latencia y throughput: el modelo card incluye una gráfica de tiempo de inferencia para una locución de 60 s (batch 1, bf16, mediana de 20 ejecuciones) a 0 % y 80 % de dispersión, pero no se proporcionan cifras numéricas en el texto.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| karna-base | 71M | km, en | no disponible | Apache 2.0 | safetensors, ONNX | Poda del 80 % del encoder; CER km 1,94 en DDD |
| omniASR_CTC_300M (stock) | 325M | multilingüe | no disponible | no disponible en la informacion | no disponible | Modelo original de Meta; CER km 9,65 en DDD |
| Fine-tuned 300M (teacher) | 325M | km, en | no disponible | no disponible en la informacion | no disponible | Profesor afinado; CER km 1,47 en DDD |
| karna-large | no disponible en la informacion | km, en | no disponible | Apache 2.0 (presumible, no confirmado) | safetensors, ONNX | Hermano mayor de la misma familia |

## Limitaciones y advertencias

- El rendimiento en inglés es claramente inferior al del profesor y al del modelo original: WER de 29,66 en FLEURS-en y 23,53 en LibriSpeech test-other.
- La decodificación es CTC voraz sin modelo de lenguaje, lo que limita la corrección de errores ortográficos y gramaticales.
- La anchura no uniforme de las capas impide cargar el modelo con fairseq2 u `omnilingual-asr`; es necesario usar `netra-karna` o el código PyTorch del repositorio.
- Algunos conjuntos de prueba (FLEURS-km y FLEURS-en) son in-domain, por lo que sus cifras pueden ser optimistas frente a audio fuera de dominio.
- No se documentan sesgos específicos ni tasas de alucinación; como todo ASR, puede producir transcripciones incorrectas en audio ruidoso o con acentos no representados.
- Solo cubre jemer e inglés; no se ha validado para otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento subyacentes (DDD, FLEURS, LibriSpeech) para producción.
- Es la versión v2; la primera release tenía peores resultados (DDD 2,60, test-clean 11,15).

## Enlaces

- Hugging Face: https://huggingface.co/Netra-Lab/karna-base
- Modelo hermano: https://huggingface.co/Netra-Lab/karna-large
- GitHub: https://github.com/netra-ai-lab/Karna
- Imagen Docker: https://github.com/netra-ai-lab/Karna/pkgs/container/karna
- PyPI: https://pypi.org/project/netra-karna/
- Modelo base: https://huggingface.co/facebook/omniASR-CTC-300M
- Profesor de la primera release: https://huggingface.co/Darayut/omniASR-CTC-300M-km-en
- Revisión v1: https://huggingface.co/Netra-Lab/karna-base/tree/5cadb20f7e
- Paper de receta: https://arxiv.org/abs/2505.24111
- Paper de poda DPHuBERT: https://arxiv.org/abs/2305.17651
- Dataset DDD: https://huggingface.co/datasets/Digital-Divide-Data/khmer-speech-dataset
