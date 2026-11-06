# Nuttyman/whisper-tiny_to_canadian_accent_oct29

## Resumen

Whisper tiny_to_canadian_accent_oct29 es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario Nuttyman en Hugging Face. Se trata de un modelo de reconocimiento automático del habla (ASR) especializado en inglés canadiense, entrenado sobre el dataset Canadian_english. El modelo parte de la arquitectura Whisper original de OpenAI, un transformer encoder-decoder diseñado para transcripción de audio, y conserva su tamaño reducido de aproximadamente 37,7 millones de parámetros.

La relevancia de este modelo es acotada: se trata de un experimento de ajuste fino sobre un modelo base muy pequeño (whisper-tiny), orientado a adaptar el reconocimiento del habla a un acento específico. Con 19 descargas y 0 likes en el momento de la consulta, es un modelo de nicho, probablemente publicado como ejercicio de entrenamiento o prueba de concepto más que como herramienta de producción.

El modelo mantiene la licencia Apache 2.0 del modelo base y está disponible en formato safetensors con un tamaño de repositorio de 0,3 GB. No se ha publicado información detallada sobre la composición del dataset de entrenamiento ni sobre las limitaciones específicas del ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 37.760.640 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, que emplea la arquitectura Whisper: un transformer encoder-decoder con atención estándar, diseñado para procesar espectrogramas de audio y generar transcripciones de texto. Whisper-tiny es la variante más pequeña de la familia Whisper, con unos 37,7 millones de parámetros, lo que la hace muy ligera pero con menor precisión que las variantes mayores.

Según la model card, el entrenamiento se realizó sobre el dataset Canadian_english con los siguientes hiperparámetros: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluación de 1, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler linear con 500 pasos de warmup y 2000 pasos de entrenamiento totales (2 epochs). La semilla fue 42. El entrenamiento se ejecutó con Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifica el número de tokens de audio ni la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR).

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, con especialización en acento canadiense.
- Transcripción de audio a texto en formato monológico (no se documenta diarización de hablantes).
- Procesamiento de ventanas de audio de 30 segundos, característica estándar de la arquitectura Whisper.
- Soporte multilingüe limitado: solo inglés (el modelo base whisper-tiny es multilingüe, pero este ajuste se declara únicamente para `en`).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio generativo ni modo de pensamiento (thinking mode).

## Casos de uso

- Transcripción de reuniones y notas de voz en inglés canadiense: el ajuste fino puede mejorar la precisión sobre acentos canadienses frente al whisper-tiny original, aunque el WER reportado (21,09 %) sigue siendo alto para uso profesional.
- Subtitulado automático de contenido audiovisual de baja criticidad: adecuado para borradores de subtítulos que luego se revisan manualmente, dado el reducido tamaño del modelo y su bajo coste computacional.
- Prototipado rápido de pipelines ASR: al ser un modelo de 37,7 M de parámetros, permite iterar rápidamente en entornos con recursos limitados antes de escalar a modelos mayores.
- Preprocesamiento de audio para búsqueda y indexación: transcripción aproximada de archivos de audio para generar metadatos y permitir búsqueda por texto en repositorios de audio.
- Investigación sobre adaptación de acentos en ASR: sirve como caso de estudio de fine-tuning de bajo coste sobre un modelo base pequeño para un acento específico.
- Aplicaciones educativas o de demostración: por su tamaño reducido y licencia Apache 2.0, puede desplegarse en dispositivos de borde o entornos docentes para ilustrar el funcionamiento de Whisper y el ajuste fino.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| Whisper tiny American (este modelo) | Canadian English (split test) | WER | 21,0858 |

Resultados de validación durante el entrenamiento (model card):

| Training Loss | Epoch | Step | Validation Loss | WER |
|---|---|---|---|---|
| 0,3026 | 1,0 | 1000 | 0,4232 | 21,2956 |
| 0,1130 | 2,0 | 2000 | 0,4252 | 21,0858 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (fp32) para 37,7 M de parámetros; en torno a 150-300 MB en fp16 o cuantización de 8 bits (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una GTX 1650, RTX 3050 o superior puede ejecutar el modelo con holgura.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: transformers (Pipeline de ASR), y previsiblemente conversión a otros runtimes (ONNX, CTranslate2) aunque no se documenta en la ficha. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI (estos están orientados a modelos de lenguaje, no a Whisper).
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera una latencia muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | Idiomas | WER (Canadian English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| whisper-tiny_to_canadian_accent_oct29 | 37,7 M | ventanas de 30 s | en | 21,09 (declarado) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s | multilingüe | no disponible en este dataset | apache-2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | ventanas de 30 s | multilingüe | no disponible en este dataset | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingüe | no disponible en este dataset | apache-2.0 | Hugging Face |

No se dispone de resultados comparativos del modelo base whisper-tiny ni de las variantes mayores sobre el mismo dataset Canadian English en la información proporcionada, por lo que no es posible cuantificar la mejora del ajuste fino frente al original.

## Limitaciones y advertencias

- WER elevado (21,09 % en el conjunto de test declarado), lo que limita su uso en producción sin revisión humana.
- Solo soporta inglés; no se ha validado para otros idiomas ni acentos distintos del canadiense.
- No se documenta la composición del dataset Canadian_english ni su tamaño, lo que impide evaluar posibles sesgos de dominio o de hablantes.
- Riesgo de alucinación y errores de transcripción inherente a los modelos Whisper, especialmente en la variante tiny con audio ruidoso o acentos no representados en el entrenamiento.
- La model card está generada automáticamente y contiene secciones sin completar ("More information needed"), lo que indica falta de documentación sobre usos previstos y limitaciones.
- El nombre del modelo ("Whisper tiny American") no coincide con el ajuste declarado (acento canadiense), lo que puede generar confusión.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de openai/whisper-tiny se mantienen las condiciones de la licencia original (también Apache 2.0).
- No hay garantías de soporte ni mantenimiento por parte del autor; el modelo tiene muy poca tracción (19 descargas, 0 likes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nuttyman/whisper-tiny_to_canadian_accent_oct29
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
