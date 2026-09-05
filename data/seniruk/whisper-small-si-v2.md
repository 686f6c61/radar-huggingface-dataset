# seniruk/whisper-small-si-v2

## Resumen

El modelo Sinscribe v2 es un ajuste fino (fine-tuning) de openai/whisper-small para el reconocimiento automático de voz en cingalés (si). Ha sido desarrollado por el usuario seniruk y publicado en Hugging Face bajo licencia Apache-2.0. El objetivo es mejorar la transcripción de audio en una lengua de baja disponibilidad de recursos, donde los modelos multilingües genéricos suelen presentar un rendimiento subóptimo.

Arquitectónicamente hereda el diseño encoder-decoder de Whisper, con un total de 241.734.912 parámetros. El entrenamiento se realizó sobre un dataset de Sinhala CSV + FLACs, del que no se proporcionan detalles adicionales en la documentación. La relevancia del modelo radica en cubrir una necesidad concreta de ASR en cingalés, un idioma poco representado en los modelos de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (Transformer encoder-decoder) |
| Parámetros totales | 241.734.912 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Cingalés (si) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura Transformer encoder-decoder de Whisper, con el mismo diseño de capas y mecanismos de atención que el modelo base openai/whisper-small. No se ha documentado ninguna innovación técnica adicional en el ajuste fino.

El entrenamiento se llevó a cabo sobre un dataset de Sinhala CSV + FLACs. Los hiperparámetros declarados por el autor son: learning rate de 1e-5, batch size de 16 para entrenamiento y 64 para evaluación, 2 épocas, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal con 250 pasos de warmup y precisión mixta nativa AMP. La pérdida final de validación fue 0.0825 y el WER alcanzó 30.3714.

## Capacidades

- Transcripción de audio a texto en cingalés (si), como resultado del ajuste fino sobre el dataset Sinhala.
- Reconocimiento automático de voz en el dominio del corpus de entrenamiento, que incluye grabaciones en formato FLAC.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se han publicado capacidades multilingües más allá del cingalés.
- No se ha documentado soporte de visión, audio adicional o modo de pensamiento (thinking mode).
- El modelo es compatible con la librería Transformers y con endpoints compatibles según las etiquetas del repositorio.

## Casos de uso

- Transcripción de reuniones y entrevistas en cingalés: el modelo puede convertir grabaciones de audio de reuniones de trabajo o entrevistas a texto, facilitando el archivo y la búsqueda de contenido.
- Subtitulado automático de vídeos en cingalés: integrándolo en un pipeline de procesamiento de vídeo, permite generar subtítulos de forma automática para contenido audiovisual.
- Accesibilidad para personas con discapacidad auditiva en Sri Lanka: transcribir programas de televisión, conferencias o contenido educativo en cingalés para ofrecer acceso textual.
- Análisis de llamadas de servicio al cliente en cingalés: transcribir conversaciones telefónicas para extraer información, detectar problemas recurrentes o evaluar la calidad del servicio.
- Documentación de contenido educativo: transcribir clases, seminarios o tutoriales en cingalés para crear materiales de estudio y notas de texto.
- Investigación lingüística y corpus: generar transcripciones de audio en cingalés para construir o ampliar corpus de entrenamiento en tareas de procesamiento del lenguaje natural.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes, correspondientes al conjunto de evaluación:

| Métrica | Valor |
|---|---|
| Loss | 0.0825 |
| Wer | 30.3714 |

La evolución del entrenamiento registrada por el autor muestra una mejora progresiva del WER a lo largo de las épocas:

| Training Loss | Epoch | Step | Validation Loss | Wer |
|:-------------:|:-----:|:----:|:---------------:|:---:|
| 0.1339 | 0.3307 | 3000 | 0.1321 | 41.8189 |
| 0.1064 | 0.6613 | 6000 | 0.1069 | 36.1047 |
| 0.0969 | 0.9920 | 9000 | 0.0955 | 33.8429 |
| 0.0695 | 1.3226 | 12000 | 0.0905 | 32.5056 |
| 0.0636 | 1.6533 | 15000 | 0.0856 | 31.1304 |
| 0.0685 | 1.9839 | 18000 | 0.0825 | 30.3714 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para este modelo. A partir del tamaño de los pesos (241.734.912 parámetros), se puede estimar lo siguiente:

- VRAM estimada para inferencia en FP16: aproximadamente 1,5-2 GB.
- VRAM estimada para inferencia en FP32: aproximadamente 4-5 GB.
- GPU recomendadas: tarjetas de consumo como RTX 3060 o superiores; también es viable en GPUs de datacenter como A10 o T4.
- Puede ejecutarse en CPU con frameworks como faster-whisper o llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: pipeline de Transformers, endpoints compatibles (según etiquetas del repositorio), faster-whisper y vLLM (si se adapta al formato).
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| openai/whisper-small | 241.734.912 | No disponible | Apache-2.0 | Multilingüe |
| seniruk/whisper-small-si | 241.734.912 | No disponible | Apache-2.0 | Cingalés (v1) |
| seniruk/whisper-small-si-v2 | 241.734.912 | No disponible | Apache-2.0 | Cingalés (v2) |

No se han publicado métricas comparativas entre estos modelos en la información disponible.

## Limitaciones y advertencias

- El WER de 30.3714 indica una tasa de error relativamente alta, por lo que puede producir transcripciones con errores frecuentes en audio con ruido, acentos no representados o vocabulario fuera del dominio de entrenamiento.
- El dataset de entrenamiento no está documentado en la model card, por lo que se desconocen su tamaño, composición y posibles sesgos.
- El modelo está limitado al cingalés; no se ha evaluado ni documentado su rendimiento en otros idiomas.
- Al tratarse de un modelo de reconocimiento de voz, existe riesgo de alucinación en segmentos de audio ambiguos o silenciosos.
- La licencia Apache-2.0 permite uso comercial, pero no incluye garantías de precisión ni soporte oficial.
- No se han publicado estudios de sesgos ni evaluaciones de equidad para este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seniruk/whisper-small-si-v2
- Versión anterior en Hugging Face: https://huggingface.co/seniruk/whisper-small-si
- Versión para CPU en Hugging Face: https://huggingface.co/seniruk/whisper-small-si-cpu
- Modelo base openai/whisper-small: https://huggingface.co/openai/whisper-small
