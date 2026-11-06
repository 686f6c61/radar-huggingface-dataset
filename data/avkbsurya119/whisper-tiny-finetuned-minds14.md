# avkbsurya119/whisper-tiny-finetuned-minds14

## Resumen

Whisper Tiny finetuned on MInDS-14 es un ajuste fino del modelo de reconocimiento automático del habla (ASR) `openai/whisper-tiny` de OpenAI, publicado por el usuario avkbsurya119 en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37.760.640 parámetros totales, y ha sido entrenado sobre el conjunto de datos PolyAI/minds14, un corpus de grabaciones de dominio telefónico (atención al cliente bancaria) en inglés.

El objetivo del ajuste es especializar un modelo de ASR genérico y de muy bajo coste computacional en un dominio concreto: audio telefónico de baja calidad con vocabulario propio de servicios financieros. El resultado declarado por el autor es un WER de 0,2857 sobre el conjunto de evaluación de MInDS-14, con una pérdida de validación de 0,5079 en el punto de control seleccionado (paso 100).

La relevancia de este modelo es fundamentalmente práctica: demuestra el flujo de trabajo de fine-tuning de Whisper con la librería Transformers sobre un dataset de dominio específico, y sirve como referencia para quien necesite un ASR ligero desplegable en hardware modesto. No obstante, se trata de un modelo experimental de un autor individual, con una model card generada automáticamente y sin documentación adicional sobre usos previstos o limitaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-tiny`: un transformer encoder-decoder con atención multi-cabeza estándar, diseñado para transcribir audio en fragmentos de hasta 30 segundos. Whisper-tiny es la variante más pequeña de la familia Whisper, con aproximadamente 39 millones de parámetros, lo que lo sitúa en el rango de modelos desplegables en CPU y GPUs de consumo.

El ajuste fino se realizó con el `Trainer` de Transformers (etiqueta `generated_from_trainer`) sobre el dataset `PolyAI/minds14`. Los hiperparámetros documentados son: learning rate de 1e-05, batch size de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler `constant_with_warmup` con 50 pasos de calentamiento, 500 pasos de entrenamiento totales y precisión mixta nativa (AMP). Las versiones de framework declaradas son Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 3.6.0 y Tokenizers 0.23.3. No se documenta el número de tokens de audio procesados ni la composición exacta del split de entrenamiento/evaluación.

El historial de entrenamiento muestra un sobreajuste claro: la pérdida de entrenamiento cae de 0,2674 (paso 100) a 0,0007 (paso 500), mientras que la pérdida de validación sube de 0,5079 a 0,6945 en el mismo intervalo. El mejor WER se obtiene en el paso 100 (0,2857), y empeora progresivamente hasta 0,3164 en el paso 500. Esto sugiere que el punto de control óptimo es el primero evaluado y que el entrenamiento adicional degrada la generalización.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés sobre audio de dominio telefónico.
- Transcripción de audio de atención al cliente bancaria (dominio MInDS-14).
- Generación de transcripciones con puntuación y ortografía normalizadas (métrica `wer_ortho` reportada).
- Inferencia mediante la pipeline `automatic-speech-recognition` de Transformers.
- Compatibilidad con endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, agentes, visión, audio multilingüe ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de llamadas de atención al cliente bancaria: el modelo está ajustado específicamente sobre MInDS-14, un corpus de grabaciones telefónicas de consultas bancarias en inglés, por lo que es adecuado para transcribir este tipo de audio con vocabulario financiero.
- Prototipado rápido de pipelines ASR: al ser un modelo de 37,7 M de parámetros con licencia Apache 2.0, permite montar un servicio de transcripción de bajo coste en CPU o GPU modesta para validar un producto antes de invertir en modelos mayores.
- Generación de subtítulos en inglés para contenido de audio de baja calidad: la robustez de Whisper frente a ruido y la especialización en dominio telefónico lo hacen útil para material con condiciones acústicas pobres.
- Análisis de sentimiento y extracción de entidades sobre transcripciones: combinado con un modelo de lenguaje posterior, sirve para procesar el texto transcrito de llamadas y extraer intenciones o entidades.
- Investigación y docencia en fine-tuning de ASR: el modelo y su historial de entrenamiento documentado (500 pasos, hiperparámetros completos) sirven como ejemplo reproducible de ajuste fino de Whisper con Transformers.
- Despliegue en dispositivos con recursos limitados: su tamaño reducido permite ejecutarlo en entornos edge o en contenedores sin GPU dedicada, siempre que la precisión requerida sea moderada.
- Evaluación comparativa de técnicas de fine-tuning: sirve como línea base para medir el efecto de cambios en learning rate, número de pasos o composición del dataset sobre el WER en dominios telefónicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor | Conjunto |
|---|---|---|
| WER | 0,2857 | MInDS-14 (evaluación) |
| WER ortho | 0,2825 | MInDS-14 (evaluación) |
| Loss | 0,5079 | MInDS-14 (evaluación) |

Evolución durante el entrenamiento (según la model card):

| Paso | Training loss | Validation loss | WER ortho | WER |
|---|---|---|---|---|
| 100 | 0,2674 | 0,5079 | 0,2825 | 0,2857 |
| 200 | 0,0332 | 0,5782 | 0,3091 | 0,3129 |
| 300 | 0,0037 | 0,6380 | 0,3029 | 0,3087 |
| 400 | 0,0010 | 0,6747 | 0,3054 | 0,3093 |
| 500 | 0,0007 | 0,6945 | 0,3128 | 0,3164 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de ASR y no de un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,7 M de parámetros, ~150 MB de pesos), y aproximadamente 75-100 MB en fp16. El repo ocupa 0,8 GB, lo que incluye pesos y artefactos de entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100. Funciona en GPUs de consumo como GTX 1050, RTX 2060, RTX 3060, RTX 4090 e incluso en iGPU modernas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos ocho años, y también en CPU.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers, endpoints de Hugging Face (etiqueta `endpoints_compatible`), exportación a ONNX o a formatos compatibles con llama.cpp/whisper.cpp (no documentado en la model card, pero viable por ser arquitectura Whisper).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño, se espera una latencia muy baja en GPU y aceptable en CPU para fragmentos de audio cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | WER MInDS-14 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| avkbsurya119/whisper-tiny-finetuned-minds14 | 37,7 M | 30 s (Whisper) | 0,2857 (declarado) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | ~39 M | 30 s | no disponible | Apache 2.0 | Hugging Face |
| openai/whisper-base | ~74 M | 30 s | no disponible | Apache 2.0 | Hugging Face |
| openai/whisper-small | ~244 M | 30 s | no disponible | Apache 2.0 | Hugging Face |

No se dispone de resultados de WER sobre MInDS-14 para los modelos base de Whisper en la información proporcionada, por lo que la comparación cuantitativa directa no es posible. La comparación cualitativa se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- Sobreajuste evidente: la pérdida de validación aumenta de forma monotónica a partir del paso 100, y el WER empeora en cada evaluación posterior. El punto de control publicado corresponde al mejor WER, pero el entrenamiento adicional no aporta mejoras.
- Model card incompleta: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento contienen "More information needed". No hay documentación sobre sesgos, composición del dataset ni evaluación fuera de MInDS-14.
- Dominio muy restringido: el ajuste se ha hecho sobre un único dataset de atención al cliente bancaria en inglés; el rendimiento fuera de ese dominio (otros acentos, otros idiomas, audio limpio de estudio) no está documentado y probablemente sea inferior al de Whisper-tiny sin ajustar.
- Idioma único: solo se declara inglés; no hay soporte multilingüe.
- WER de 0,2857 implica que aproximadamente una de cada tres palabras y media se transcribe incorrectamente en el conjunto de evaluación; es un rendimiento bajo para producción sin revisión humana.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos silenciosos o con ruido.
- Resultados no verificados: la métrica WER está marcada como `verified: false` en el model-index, y no se especifica el split de evaluación utilizado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad sobre el uso recae en el integrador.
- Sin métricas de latencia ni throughput documentadas, lo que dificulta dimensionar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avkbsurya119/whisper-tiny-finetuned-minds14
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset MInDS-14: https://huggingface.co/datasets/PolyAI/minds14
- Paper de Whisper (Radford et al., 2022): no disponible en la información proporcionada
- Repositorio de Transformers: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
