# nhatkhangdtp/CKTN-ELECTRA-no-vocab-aug

## Resumen

CKTN-ELECTRA-no-vocab-aug es un checkpoint de ablación publicado por nhatkhangdtp (autor del paper *Echoes Across Vietnam's Highlands, Delta, and Coast*) para reproducir el estudio comparativo del modelo principal CKTN-ELECTRA. Se trata de un encoder `RemBertModel` de 575,9 millones de parámetros, inicializado a partir de `google/rembert`, y entrenado con el objetivo ELECTRA (detección de tokens reemplazados) sobre un corpus multilingüe de tres lenguas de bajos recursos del sudeste asiático: cham (cjm), jemer (km) y tày-nùng (tyz), además de nut (posiblemente una variante o etiqueta adicional del corpus).

La diferencia clave respecto al modelo completo es que este checkpoint **no aplica aumento de vocabulario**: el discriminador, el tokenizador y los embeddings compartidos parten del vocabulario original de RemBERT (250.300 piezas), en lugar del vocabulario extendido de `ducanhdinh/CKTN-ELECTRA` (que añade 4.213 subwords nuevos mediante cirugía Protobuf y Fast Vocabulary Transfer). El resto de la configuración es idéntica: generador de 8 capas con embeddings compartidos, top-64 candidatos a temperatura 1,25, banda de similitud [0,15, 0,95], AdamW con lr 2e-5, 6 épocas, 15 % de enmascaramiento y longitud de secuencia 512.

Su relevancia es metodológica: sirve como referencia controlada para medir el impacto real del aumento de vocabulario en lenguas de bajos recursos. No está pensado para uso en producción; el propio autor remite al modelo completo para tareas downstream. El checkpoint publicado corresponde al discriminador de la época 6, con RTD F1 de 0,882 y accuracy de 0,970, y se distribuye como `RemBertModel` sin cabeza de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RemBERT, tipo BERT/ELECTRA) |
| Parametros totales | 575.920.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | cjm (cham), km (jemer), tyz (tày-nùng), nut |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,3 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder RemBERT (variante multilingüe de BERT con embeddings de entrada de mayor dimensión y embeddings de salida reducidos) adaptado mediante entrenamiento ELECTRA. El esquema ELECTRA emplea un generador de 8 capas con embeddings compartidos con el discriminador; el generador propone tokens candidatos (top-64, temperatura 1,25, banda de similitud [0,15, 0,95]) y el discriminador aprende a detectar cuáles fueron reemplazados. El entrenamiento usa AdamW con learning rate 2e-5, 6 épocas, 15 % de enmascaramiento y longitud de secuencia 512.

La innovación metodológica de esta variante es precisamente su carácter de control: mantiene el vocabulario original de RemBERT (250.300 piezas) para aislar el efecto del aumento de vocabulario aplicado en el modelo principal CKTN-ELECTRA (que inyecta 4.213 subwords vía cirugía Protobuf y Fast Vocabulary Transfer). No se documentan en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del corpus, más allá de su naturaleza multilingüe (cham, jemer, tày-nùng) y su procedencia del paper arXiv:2607.08362.

## Capacidades

- Extracción de características (feature-extraction): genera representaciones contextuales de tokens y frases para las lenguas del corpus.
- Detección de tokens reemplazados (RTD): capacidad nativa del objetivo ELECTRA, con F1 de 0,882 y accuracy de 0,970 en desarrollo.
- Modelado de lenguas de bajos recursos: cham, jemer y tày-nùng, con cobertura limitada y dependiente del corpus del paper.
- Base para fine-tuning en tareas downstream (clasificación, NER, similitud semántica) al ser un encoder sin cabeza de tarea.
- Soporte multilingüe restringido a los idiomas del corpus; no se documenta cobertura de vietnamita estándar ni de otras lenguas.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking: es un encoder puro de extracción de características.

## Casos de uso

- Reproducción del estudio de ablación: cargar el checkpoint con `configs/pretrain/no_vocab_aug.json` del repositorio GitHub para replicar la comparación entre vocabulario original y aumentado en las métricas RTD.
- Investigación sobre tokenización en lenguas de bajos recursos: analizar cómo afecta el vocabulario de 250.300 piezas de RemBERT a la fragmentación de texto cham, jemer y tày-nùng frente al vocabulario extendido.
- Fine-tuning para clasificación de textos en jemer: usar los embeddings del encoder como base y añadir una cabeza de clasificación para tareas como detección de temática o análisis de sentimiento en corpus jemeres.
- Extracción de embeddings para búsqueda semántica en corpus multilingües del sudeste asiático: generar representaciones de documentos cham o tày-nùng para sistemas de recuperación de información.
- NER (reconocimiento de entidades nombradas) en textos de bajos recursos: fine-tuning del encoder para etiquetado de secuencias en las tres lenguas del corpus.
- Evaluación comparativa de modelos multilingües: usar este checkpoint como línea base controlada en experimentos que midan el impacto del aumento de vocabulario en RemBERT.
- Docencia y experimentación académica: ejemplo reproducible de entrenamiento ELECTRA con y sin extensión de vocabulario sobre corpus de bajos recursos.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de desarrollo del propio objetivo ELECTRA:

| Metrica | Valor |
|---|---|
| RTD F1 (época 6, mejor checkpoint) | 0,882 |
| RTD accuracy (época 6) | 0,970 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, XNLI, etc.) en la información disponible, ni comparaciones numéricas con el modelo principal CKTN-ELECTRA o con RemBERT base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos, más activaciones; en fp16 unos 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16 (RTX 3060, RTX 4060, T4). Para fine-tuning con batches moderados se recomienda RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4070 y superiores con cuantización o fp16.
- Opciones de despliegue: transformers (carga directa con `AutoModel`), vLLM no aplica de forma nativa a encoders de este tipo, llama.cpp/Ollama no soportan RemBERT de forma estándar, TGI puede servir encoders con configuración específica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CKTN-ELECTRA-no-vocab-aug | 575,9 M | 512 | cjm, km, tyz, nut | Apache 2.0 | Hugging Face (este repo) |
| CKTN-ELECTRA (completo) | no disponible (base RemBERT + 4.213 subwords) | 512 | cjm, km, tyz | Apache 2.0 | Hugging Face (ducanhdinh/CKTN-ELECTRA) |
| google/rembert | no disponible en la información | 512 | multilingüe (104 idiomas) | Apache 2.0 | Hugging Face (google/rembert) |

La comparación de rendimiento entre estos modelos no está disponible en la información proporcionada; el modelo completo CKTN-ELECTRA es el recomendado por el autor para uso downstream.

## Limitaciones y advertencias

- Checkpoint de ablación: el propio autor indica que no debe usarse para producción; para uso downstream remite a `nhatkhangdtp/CKTN-ELECTRA`.
- Cobertura lingüística muy restringida: solo cham, jemer, tày-nùng y nut; no se documenta vietnamita estándar ni otras lenguas.
- Sin cabeza de tarea: es un `RemBertModel` puro; requiere fine-tuning para cualquier aplicación concreta.
- Riesgo de sesgos: al entrenarse sobre un corpus específico de comunidades del sudeste asiático, puede reflejar sesgos de la composición del dataset, no documentados en la información disponible.
- Riesgo de alucinación: bajo en el sentido generativo (no genera texto libre), pero los embeddings pueden producir representaciones poco fiables en dominios alejados del corpus de entrenamiento.
- Limitación de contexto: 512 tokens, insuficiente para documentos largos sin truncado o segmentación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base RemBERT y del corpus subyacente debe verificarse por separado.
- Vocabulario no adaptado: al no aumentar el vocabulario, la tokenización de las lenguas objetivo puede ser más fragmentada que en el modelo completo, lo que puede degradar el rendimiento en tareas downstream.
- Sin datos de benchmarks estándar ni de latencia/throughput publicados.

## Enlaces

- Hugging Face: https://huggingface.co/nhatkhangdtp/CKTN-ELECTRA-no-vocab-aug
- Modelo completo: https://huggingface.co/ducanhdinh/CKTN-ELECTRA
- Modelo base: https://huggingface.co/google/rembert
- Paper: https://arxiv.org/abs/2607.08362
- Repositorio de código: https://github.com/TracDucAnh/CKTN-ELECTRA
- Configuración de entrenamiento: `configs/pretrain/no_vocab_aug.json` en el repositorio GitHub
