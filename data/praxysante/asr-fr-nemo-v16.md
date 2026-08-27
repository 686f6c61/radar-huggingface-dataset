# PraxySante/ASR-FR-Nemo-V16

## Resumen

ASR-FR-Nemo-V16 es un modelo de reconocimiento automático del habla (ASR) para francés, publicado por PraxySante, una empresa francesa especializada en soluciones de inteligencia artificial para el sector sanitario. El modelo se distribuye en formato fp16 (media precisión) para acelerar la inferencia, y está basado en un modelo original denominado `praxy-fr-asr-fastconformer-lowercase-step2-tok072026`, lo que sugiere una arquitectura FastConformer de NVIDIA NeMo. El repositorio tiene un tamaño de 0,3 GB, lo que indica un modelo compacto, adecuado para despliegues con recursos limitados.

El modelo está diseñado específicamente para la transcripción de audio en francés, con una frecuencia de muestreo de 16 kHz y una tasa de error de palabra (WER) declarada del 7,03 %. Aunque la model card no detalla el proceso de entrenamiento ni los datos utilizados, el contexto de PraxySante apunta a un uso orientado al ámbito sanitario, donde la transcripción de consultas y notas clínicas es un caso de uso habitual. Su relevancia radica en ofrecer una alternativa ligera y rápida para ASR en francés, un idioma con menos recursos que el inglés en el ecosistema open source.

La información pública es limitada: no se especifican parámetros totales, licencia, ni detalles de entrenamiento. No obstante, el modelo se puede cargar directamente con la librería NeMo de NVIDIA, lo que facilita su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (inferido por el nombre del modelo original) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (media precision) |
| Idiomas soportados | frances |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente .nemo o safetensors, no especificado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un FastConformer, un modelo de tipo Conformer optimizado para velocidad, desarrollado por NVIDIA dentro del framework NeMo. Los FastConformer emplean atención con mecanismos de reducción de dimensionalidad y convoluciones profundas para lograr un equilibrio entre precisión y eficiencia. Sin embargo, la model card no proporciona detalles sobre el número de capas, dimensiones ocultas, ni el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de fine-tuning). El campo "Encoder layers" aparece como "None", lo que sugiere que esa información no fue rellenada correctamente por el autor.

El modelo se distribuye en fp16, lo que reduce el uso de memoria y acelera la inferencia en GPUs modernas, manteniendo una calidad de transcripción similar a la versión original, según la model card. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de un modelo ASR, no generativo.

## Capacidades

- Transcripción de audio en francés: convierte señales de voz (16 kHz) en texto, con una tasa de error de palabra declarada del 7,03 %.
- Inferencia rápida gracias a la conversión a fp16, adecuada para aplicaciones en tiempo real o de bajo consumo.
- Integración sencilla con la librería NeMo de NVIDIA mediante `ASRModel.from_pretrained`.
- No se documentan capacidades adicionales como diarización de hablantes, traducción, ni soporte multilingüe.

## Casos de uso

- Transcripción de consultas médicas: el modelo puede convertir grabaciones de consultas en francés a texto para su integración en historiales clínicos electrónicos, reduciendo la carga administrativa de los profesionales sanitarios.
- Generación de subtítulos para contenido audiovisual en francés: su tamaño compacto permite ejecutarlo en servidores modestos para subtitular vídeos o podcasts.
- Asistentes de voz para aplicaciones de salud: al estar desarrollado por una empresa del sector, puede integrarse en asistentes que tomen notas dictadas por médicos o pacientes.
- Análisis de llamadas de soporte: transcripción de conversaciones de atención al cliente en francés para su posterior análisis de sentimiento o extracción de información.
- Archivado de reuniones: conversión de grabaciones de reuniones de trabajo en francés a texto para búsqueda y referencia posterior.
- Investigación lingüística: herramienta para transcribir corpus orales en francés, útil en estudios de fonética o sociolingüística.

## Benchmarks y rendimiento

La única métrica publicada es la tasa de error de palabra (WER) del 7,03 %, sin especificar sobre qué conjunto de datos se obtuvo. No se han publicado comparaciones con otros modelos ASR en la información disponible.

| Metrica | Valor |
|---|---|
| WER | 7,03 % (sin especificar dataset) |

## Requisitos de hardware

- Tamaño del repositorio: 0,3 GB, lo que sugiere un modelo de aproximadamente 100-200 millones de parámetros (estimación no confirmada).
- VRAM estimada: con fp16, el modelo podría caber en GPUs con 2-4 GB de VRAM, aunque no se dispone de datos exactos.
- GPU recomendadas: cualquier GPU moderna con soporte fp16 (serie RTX 20xx o superior, o GPUs de datacenter como T4, V100, A10).
- Posible ejecución en CPU: dado su tamaño reducido, podría funcionar en CPU con latencia aceptable, aunque no se especifica.
- Opciones de despliegue: NeMo (obligatorio para cargar el modelo), también podría convertirse a otros formatos como ONNX o TensorRT, pero no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Como referencia cualitativa, otros modelos ASR para francés incluyen:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ASR-FR-Nemo-V16 | FastConformer | no disponible | no disponible | no disponible | Hugging Face |
| Whisper (openai) | Transformer encoder-decoder | 39M-1550M | 30 s de audio | MIT | Hugging Face |
| Wav2Vec2-XLSR-53 | Transformer | 300M | no disponible | Apache 2.0 | Hugging Face |

La comparación es limitada porque no se conocen los parámetros exactos ni el rendimiento de ASR-FR-Nemo-V16 en benchmarks estandarizados.

## Limitaciones y advertencias

- Solo soporta francés; no hay capacidades multilingües documentadas.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial y redistribución.
- No se detallan los datos de entrenamiento, por lo que pueden existir sesgos hacia el dominio sanitario o acentos específicos.
- El WER del 7,03 % no está contextualizado; podría variar significativamente en entornos ruidosos o con vocabulario especializado.
- No se documentan limitaciones de contexto de audio (duración máxima de la entrada), aunque los modelos ASR suelen procesar segmentos cortos.
- La ausencia de información sobre el proceso de entrenamiento impide evaluar su robustez ante variaciones dialectales del francés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PraxySante/ASR-FR-Nemo-V16
- Sitio web de PraxySante: https://praxysante.com/
- Sitio web de PraxySante (francés): https://praxysante.fr/
- Sitio web de Praxy.ai: https://praxy.ai/
- Modelo original (referencia): https://huggingface.co/PraxySante/praxy-fr-asr-fastconformer-lowercase-step2-tok8k-v3-fp16
