# roryod/whisper-tiny_american_5c4

## Resumen

Whisper tiny American es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla openai/whisper-tiny, publicado por el usuario roryod en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer original de Whisper, con 37,76 millones de parámetros, y ha sido especializado mediante entrenamiento supervisado sobre el dataset naharte/american_english para transcripción de inglés americano. Su licencia es Apache 2.0 y el repositorio ocupa 0,3 GB en formato safetensors.

El modelo resuelve la tarea de conversión de voz a texto (ASR) en inglés, con un enfoque declarado hacia el inglés americano. Al derivar de la variante "tiny" de Whisper, mantiene las ventajas de un modelo extremadamente ligero: inferencia rápida, bajo consumo de memoria y posibilidad de ejecutarse en hardware modesto, incluso en CPU. Esto lo hace relevante para prototipado rápido, aplicaciones embebidas y pipelines donde el coste computacional es un factor crítico.

Sin embargo, la información publicada por el autor es muy limitada: la model card está generada automáticamente y contiene secciones marcadas como "More information needed". El único resultado declarado es un WER de 9,1019 sobre un conjunto de evaluación etiquetado como "Spanish English", dato no verificado y cuya composición exacta no se detalla. El modelo tiene 27 descargas y 0 likes en el momento de la consulta, lo que sugiere un uso muy reducido y poca validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atención multi-cabeza estándar, diseñado para procesar espectrogramas log-Mel de audio de 30 segundos y generar transcripciones token a token. Whisper tiny es la variante más pequeña de la familia Whisper, con aproximadamente 39 millones de parámetros en su configuración original; el ajuste fino conserva esa estructura y tamaño.

El entrenamiento se realizó con el Trainer de Hugging Face sobre el dataset naharte/american_english. Los hiperparámetros declarados incluyen learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluación de 1, semilla 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. Se registran dos puntos de evaluación: en el paso 1000 (época 0,9452) la pérdida de validación fue 0,2029 con WER de 11,0153; en el paso 2000 (época 1,8904) la pérdida bajó a 0,1864 y el WER a 9,1019. No se documenta composición del dataset, número de horas de audio, ni si hubo aumentación de datos o técnicas de regularización adicionales.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, con especialización declarada en inglés americano.
- Transcripción de audio a texto mediante el pipeline `automatic-speech-recognition` de transformers.
- Procesamiento de ventanas de audio de hasta 30 segundos, limitación inherente a la arquitectura Whisper.
- Generación de transcripciones con puntuación y mayúsculas, según el comportamiento estándar de Whisper.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingüe más allá del inglés; el tag de idioma es únicamente `en`.
- No se documenta modo de razonamiento (thinking mode), visión ni audio más allá del ASR.
- No se documenta detección de idioma ni traducción de voz a texto en otros idiomas.

## Casos de uso

- Transcripción de reuniones y notas de voz en inglés americano: el modelo puede convertir grabaciones cortas en texto para actas o resúmenes posteriores, aprovechando su bajo coste de inferencia y su capacidad de ejecutarse en CPU.
- Subtitulado automático de vídeos en inglés: integrado en pipelines de postproducción, permite generar subtítulos preliminares que luego se revisan manualmente, reduciendo el tiempo de transcripción.
- Prototipado de asistentes de voz: al ser un modelo de 37,7 millones de parámetros, se puede desplegar en entornos de desarrollo y dispositivos con recursos limitados para validar flujos de voz a texto antes de escalar a modelos mayores.
- Transcripción en aplicaciones móviles o embebidas: su reducido tamaño (0,3 GB en safetensors) permite incluirlo en aplicaciones con requisitos estrictos de memoria, siempre que el audio sea en inglés americano y de corta duración.
- Análisis de llamadas de atención al cliente: para transcripciones de audio en inglés en centros de contacto, con la ventaja de un throughput alto gracias al tamaño reducido del modelo.
- Generación de datasets de texto a partir de audio: útil para crear corpus etiquetados en inglés americano en proyectos de investigación con presupuesto computacional limitado.
- Pruebas de regresión en pipelines ASR: como modelo de referencia ligero para comparar cambios en preprocesado de audio o en la infraestructura de inferencia.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card, no verificados:

| Metrica | Valor | Conjunto | Verificado |
|---|---|---|---|
| WER | 9,1019 | Spanish English (split test) | No |
| Loss (validacion) | 0,1864 | Conjunto de evaluacion | No |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni otros) en la informacion disponible. El conjunto de evaluación etiquetado como "Spanish English" no está descrito en la model card, por lo que no es posible determinar su composición ni su idoneidad para medir el rendimiento en inglés americano.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 para un modelo de 37,7 millones de parámetros; en FP16 aproximadamente 75 MB de pesos, más el overhead de activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como NVIDIA T4, GTX 1650, RTX 3050 o superiores funcionan sin problema. También es viable en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en Raspberry Pi (con tiempos de inferencia mayores).
- Opciones de despliegue: transformers con pipeline de ASR, vLLM (si soporta la arquitectura Whisper en la versión utilizada), llama.cpp no aplica directamente por ser un modelo de audio, TGI (verificar soporte de Whisper), y ONNX Runtime para despliegue optimizado.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia baja en GPU y moderada en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| roryod/whisper-tiny_american_5c4 | 37,76 M | Ventanas de 30 s | en | Apache 2.0 | 9,10 (no verificado) |
| openai/whisper-tiny | ~39 M | Ventanas de 30 s | Multilingue (99 idiomas) | Apache 2.0 | No disponible en esta ficha |
| openai/whisper-base | ~74 M | Ventanas de 30 s | Multilingue (99 idiomas) | Apache 2.0 | No disponible en esta ficha |
| openai/whisper-small | ~244 M | Ventanas de 30 s | Multilingue (99 idiomas) | Apache 2.0 | No disponible en esta ficha |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks de otros modelos ASR en la información proporcionada. El modelo ajustado sacrifica el soporte multilingüe del Whisper tiny original a cambio de una especialización declarada en inglés americano, con un WER de 9,10 sobre un conjunto no descrito.

## Limitaciones y advertencias

- El WER declarado (9,1019) no está verificado y se midió sobre un conjunto etiquetado como "Spanish English" cuya composición no se documenta; no es posible confirmar que refleje el rendimiento real en inglés americano.
- La model card está generada automáticamente e incluye secciones sin completar ("More information needed"), lo que impide conocer la composición del dataset, el número de horas de audio y las condiciones de evaluación.
- El modelo solo soporta inglés; no se declara capacidad multilingüe ni detección de idioma.
- Limitación de contexto de audio: Whisper procesa ventanas de 30 segundos, por lo que audios más largos requieren segmentación previa.
- Riesgo de alucinación en transcripciones: como todo modelo Whisper, puede generar texto plausible en segmentos con silencio, ruido o audio ininteligible.
- Sesgos potenciales derivados del dataset de ajuste fino (naharte/american_english), cuya composición y diversidad demográfica no se documentan.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de openai/whisper-tiny conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- El modelo tiene muy poco uso comunitario (27 descargas, 0 likes) y no ha sido validado de forma independiente; no se recomienda para producción sin una evaluación propia sobre datos representativos del dominio objetivo.
- No se documentan capacidades de tool calling, agentes ni otras funcionalidades más allá del ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roryod/whisper-tiny_american_5c4
- Modelo base openai/whisper-tiny: https://huggingface.co/openai/whisper-tiny
- Dataset naharte/american_english: https://huggingface.co/datasets/naharte/american_english
- Paper original de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
