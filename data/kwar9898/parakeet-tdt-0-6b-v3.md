# kwar9898/parakeet-tdt-0.6b-v3

## Resumen

parakeet-tdt-0.6b-v3 es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario kwar9898. Se trata de una adaptación del modelo Parakeet TDT 0.6B v3 de NVIDIA, empaquetada para su uso con la librería `transformers` y compatible con el ecosistema NeMo. El modelo resuelve el problema de la transcripción de voz a texto multilingüe, cubriendo 25 idiomas europeos, con un enfoque particular en el rendimiento sobre audio en inglés.

La arquitectura combina un encoder FastConformer con un decodificador Transducer TDT (Token-and-Duration Transducer), una variante que modela conjuntamente tokens y duraciones, lo que permite una decodificación más eficiente y precisa que los transductores tradicionales. Con 627 millones de parámetros, el modelo se sitúa en la gama media de ASR, ofreciendo un equilibrio entre precisión y requisitos de cómputo que lo hace desplegable en hardware de consumo.

El interés actual de este modelo radica en su cobertura multilingüe amplia (incluyendo castellano, con un WER de 3,45 en FLEURS), su licencia CC-BY-4.0 que permite uso comercial y su disponibilidad en formatos safetensors y GGUF, lo que facilita tanto la inferencia en producción con GPUs como el despliegue en CPU mediante cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (Token-and-Duration Transducer, decoder) |
| Parámetros totales | 627.057.286 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (disponible en el repo); otras cuantizaciones no especificadas |
| Idiomas soportados | en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk (25 idiomas) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Parakeet de NVIDIA, que combina un encoder FastConformer con un decodificador Transducer de tipo TDT. El encoder FastConformer es una variante del Conformer que reduce el coste computacional mediante el submuestreo de la secuencia de entrada, mientras que el decodificador TDT modela de forma conjunta la predicción de tokens y la duración de cada token, lo que permite una decodificación más eficiente que los transductores RNN-T clásicos. El modelo tiene 627 millones de parámetros en total.

Los datos de entrenamiento declarados en la model card incluyen los conjuntos `nvidia/Granary` y `nemo/asr-set-3.0`, que son corpus de ASR multilingües utilizados habitualmente en el entrenamiento de modelos de NVIDIA. No se especifica en la información disponible el número exacto de horas de audio ni la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR). Las referencias bibliográficas incluidas (arxiv:2509.14128, 2505.13404, 2305.05084, 2304.06795, 2410.01036, 2406.00899, 2205.12446, 2012.03411, 2007.10310, 1510.08484) apuntan a los papers fundacionales de FastConformer, TDT y los datasets empleados, aunque no se detalla en la información proporcionada qué innovaciones específicas introduce esta versión v3 respecto a versiones anteriores.

## Capacidades

- Transcripción de voz a texto (ASR) en 25 idiomas europeos, incluyendo inglés, castellano, francés, alemán, italiano, portugués, neerlandés y la mayoría de lenguas eslavas y bálticas.
- Reconocimiento de habla espontánea y de reuniones (evaluado en AMI con WER 11,31).
- Transcripción de audio de dominio financiero (Earnings-22, WER 11,42).
- Reconocimiento de habla en entornos ruidosos y diversos (GigaSpeech, WER 9,59).
- Extracción de características de audio (`feature-extraction` como pipeline secundario).
- Compatibilidad con el ecosistema `transformers` y con NeMo.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje generativo).
- Soporte de agentes y multi-step reasoning: no aplicable.
- Capacidades multilingües: sí, 25 idiomas.
- Capacidades especiales: decodificación TDT con modelado de duración; no dispone de modo "thinking", visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede transcribir audio de reuniones multilingües (evaluado en AMI con WER 11,31), lo que lo hace adecuado para generar actas automáticas y resúmenes a partir de grabaciones de equipos distribuidos.
- Subtitulado automático de vídeo: con WER de 2,75 en TED-LIUM v3 y 3,97 en SPGI Speech, el modelo es adecuado para generar subtítulos en inglés y en los 24 idiomas adicionales, integrándose en pipelines de postproducción.
- Atención al cliente y análisis de llamadas: la transcripción de llamadas telefónicas permite alimentar sistemas de análisis de sentimiento y control de calidad; el modelo cubre los principales idiomas europeos con WER entre 3,45 (español) y 20,7 (griego) en FLEURS.
- Documentación clínica y legal dictada: la transcripción de dictados en entornos profesionales se beneficia de la precisión en audio limpio (WER 1,93 en LibriSpeech clean) y de la licencia CC-BY-4.0, que permite uso comercial sin restricciones adicionales.
- Indexación y búsqueda de archivos de audio: la extracción de transcripciones permite construir índices de búsqueda sobre archivos de audio y vídeo en bibliotecas de medios, con cobertura multilingüe para archivos europeos.
- Investigación en lingüística computacional: el modelo sirve como base para experimentos de ASR multilingüe y para la evaluación de técnicas de adaptación de dominio, dado su tamaño moderado (627 M parámetros) y su disponibilidad en safetensors y GGUF.
- Despliegue en dispositivos con recursos limitados: la disponibilidad de pesos en GGUF permite ejecutar el modelo en CPU o en GPUs de consumo mediante llama.cpp u otras herramientas compatibles, facilitando la transcripción local sin conexión.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados):

| Dataset | Idioma | WER (%) |
|---|---|---|
| LibriSpeech (clean) | en | 1,93 |
| LibriSpeech (other) | en | 3,59 |
| TED-LIUM v3 | en | 2,75 |
| SPGI Speech | en | 3,97 |
| FLEURS | en | 4,85 |
| FLEURS | es | 3,45 |
| FLEURS | de | 5,04 |
| FLEURS | fr | 5,15 |
| FLEURS | cs | 11,01 |
| FLEURS | bg | 12,64 |
| FLEURS | fi | 13,21 |
| FLEURS | et | 17,73 |
| FLEURS | da | 18,41 |
| FLEURS | el | 20,7 |
| Vox Populi | en | 6,14 |
| GigaSpeech | en | 9,59 |
| AMI (Meetings test) | en | 11,31 |
| Earnings-22 | en | 11,42 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en FP16 (627 M parámetros × 2 bytes), más el overhead del encoder de audio y del decodificador; en la práctica, entre 2 y 4 GB según el tamaño del lote y la longitud del audio.
- GPU recomendadas: NVIDIA A100, H100, L4, T4, RTX 4090, RTX 3090, RTX 4080. Para producción de alto rendimiento, A100 o H100 con TensorRT o NeMo; para desarrollo, RTX 4090 o T4.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080, RTX 4090 y GPUs con al menos 4 GB de VRAM en FP16; en cuantización GGUF puede ejecutarse en CPU.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), NeMo, llama.cpp (para GGUF), vLLM (compatibilidad no confirmada para ASR), TGI (no confirmado). El repo incluye pesos en safetensors y GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3 (este) | 627 M | 25 | no disponible | CC-BY-4.0 | safetensors, GGUF |
| Whisper large-v3 (OpenAI) | 1.550 M | ~99 | 30 s de audio | MIT | safetensors, GGUF |
| Whisper medium (OpenAI) | 769 M | ~99 | 30 s de audio | MIT | safetensors, GGUF |
| NVIDIA Parakeet TDT 0.6B v2 | 627 M | en (principalmente) | no disponible | CC-BY-4.0 | safetensors, NeMo |

El modelo se posiciona como una alternativa de tamaño medio con cobertura de 25 idiomas europeos, frente a la cobertura mucho más amplia de Whisper (99 idiomas) pero con una arquitectura más eficiente en decodificación (TDT) y un tamaño menor que Whisper large-v3. La comparación directa de WER entre modelos no está disponible en la información proporcionada, ya que no se incluyen resultados de Whisper en los mismos conjuntos.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El rendimiento en idiomas distintos del inglés es notablemente inferior: el WER en FLEURS varía entre 3,45 (español) y 20,7 (griego), lo que limita su uso en según qué idiomas para aplicaciones de alta precisión.
- No se especifica la longitud máxima de audio que el modelo puede procesar de una vez; los modelos basados en Conformer suelen tener límites prácticos en la duración de la entrada.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto que no corresponde al audio en segmentos con ruido, silencios o habla solapada.
- Sesgos conocidos: no se documentan en la información disponible; los sesgos dependerán de la composición de los datasets de entrenamiento (Granary, asr-set-3.0), no detallada.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor y la licencia en productos derivados.
- El modelo no es un modelo de lenguaje generativo: no soporta tool calling, agentes ni razonamiento multi-paso; su uso está limitado a ASR y extracción de características.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una publicación reciente o poco difundida; no hay evidencia de uso en producción.
- La fecha de creación (2026-11-18) es posterior a la fecha actual en el momento de redacción, lo que puede indicar un error en los metadatos o una fecha futura programada.

## Enlaces

- Hugging Face: https://huggingface.co/kwar9898/parakeet-tdt-0.6b-v3
- Paper FastConformer: arxiv:2305.05084
- Paper TDT (Token-and-Duration Transducer): arxiv:2304.06795
- Paper Parakeet: arxiv:2410.01036
- Paper sobre datasets de NVIDIA: arxiv:2509.14128, arxiv:2505.13404
- Paper sobre ASR multilingüe: arxiv:2406.00899
- Paper sobre Conformer: arxiv:2005.08100 (referencia habitual, no listada explícitamente en la model card)
- Dataset Granary: https://huggingface.co/datasets/nvidia/Granary
- Dataset asr-set-3.0: https://huggingface.co/datasets/nemo/asr-set-3.0
- Repositorio NeMo: https://github.com/NVIDIA/NeMo
- Documentación de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
