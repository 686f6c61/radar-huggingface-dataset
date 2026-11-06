# Ganesh-Nadkarni/hastika-task-b-muril-trainval

## Resumen

Hastika-task-b-muril-trainval es un modelo de clasificación de texto obtenido por fine-tuning de `google/muril-base-cased` para la identificación de la categoría objetivo de comentarios de odio en texto code-mixed kannada-inglés (kanglish), principalmente en comentarios de YouTube. Lo desarrolla Ganesh-Nadkarni como participación en la tarea Task B del shared task HASTIKA @ ICON-2026, cuyo objetivo es distinguir entre seis categorías de discurso de odio: género, geopolítica, otros, política, religión y violencia.

El modelo parte de la arquitectura MuRIL (Multilingual Representations for Indian Languages) de Google, un transformer encoder de tipo BERT entrenado específicamente para lenguas indias, lo que lo hace adecuado para manejar la mezcla de kannada en escritura latina y términos en inglés típica de los comentarios en redes sociales de la India. Se trata de un modelo base (no MoE) con aproximadamente 236 millones de parámetros, aunque la model card no detalla el recuento exacto.

Su relevancia es doble: por un lado, aborda un problema poco cubierto como es la moderación de contenido en registros code-mixed de bajos recursos; por otro, su licencia Apache 2.0 permite reutilización y adaptación. No obstante, se trata de un checkpoint de investigación con un rendimiento moderado (macro-F1 de 0,46 en su propio split) y entrenado sobre datos de entrenamiento y validación fusionados, por lo que no debe considerarse un modelo listo para producción sin validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MuRIL-base) |
| Parametros totales | no disponible (modelo base MuRIL-base, aproximadamente 236M según la familia) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 160 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kannada (kn), inglés (en); texto code-mixed kannada-inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors / PyTorch (formato estándar de transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/muril-base-cased`, un transformer encoder de la familia BERT orientado a lenguas indias. La cabeza de clasificación se entrena para predecir una de seis etiquetas de categoría objetivo de odio: `0` Gender, `1` Geo-political, `2` Others, `3` Political, `4` Religion y `5` Violence.

Los datos de entrenamiento consisten en la fusión de los archivos de entrenamiento y validación del corpus HASTIKA, divididos en un split estratificado 88/12. La configuración de entrenamiento incluye longitud máxima de 160 tokens, batch size de 16, precisión mixta, learning rate de 1e-5, early stopping sobre macro-F1 de validación y manejo del desbalanceo mediante pérdida ponderada por clase (sin oversampling). El autor reporta un macro-F1 de 0,46 sobre el 12 % reservado del conjunto fusionado, si bien advierte que no existe una validación limpia porque el checkpoint se entrenó con los ficheros de train y validation juntos y no formó parte de un envío oficial al shared task.

## Capacidades

- Clasificación de texto multietiqueta (una etiqueta por instancia) en seis categorías de discurso de odio: género, geopolítica, otros, política, religión y violencia.
- Procesamiento de texto code-mixed kannada-inglés, incluyendo transliteraciones al alfabeto latino (kanglish).
- Análisis de comentarios de YouTube y otros textos informales de redes sociales.
- Soporte de inferencia mediante el pipeline `text-classification` de transformers.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador discriminativo, no un modelo generativo.
- Capacidades multilingües limitadas a kannada e inglés en registro code-mixed; no se documentan otras lenguas.
- No dispone de modo thinking, visión, audio ni generación de texto libre.

## Casos de uso

- Moderación asistida de comentarios en YouTube: el modelo puede preclasificar comentarios en kanglish por categoría de odio (religión, política, género, etc.) para priorizar la revisión humana, aprovechando su entrenamiento específico en este dominio y registro.
- Filtrado previo en plataformas de vídeo regionales: integrar el clasificador como primera capa de un pipeline de moderación que derive los casos de mayor riesgo (violencia, geopolítica) a revisores especializados.
- Investigación en lingüística computacional: analizar la distribución de categorías de odio en corpus code-mixed kannada-inglés para estudios sociolingüísticos o de dinámica de comunidades online.
- Etiquetado asistido de datasets: usar las predicciones como sugerencias para anotadores humanos que construyan nuevos corpus de hate speech en lenguas indias de bajos recursos.
- Monitorización de comunidades y marca: detectar tendencias de discurso de odio por temática en foros y redes sociales de habla kannada, con revisión humana posterior.
- Evaluación comparativa de modelos multilingües: servir como baseline fine-tuned de MuRIL para experimentos con otros encoders (XLM-R, IndicBERT) en tareas de clasificación de odio code-mixed.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| Macro-F1 | 0,46 | Split reservado aleatorio del 12 % del conjunto fusionado train+validation |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte que la cifra de 0,46 no constituye una validación limpia, al haberse entrenado con los ficheros de train y validation originales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp32 para un modelo base de ~236M parámetros; menos de 1 GB en fp16 o int8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una NVIDIA T4, RTX 3060 o superior es suficiente. Para lotes grandes, A100 o H100 no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 2060 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline de transformers, TorchServe, FastAPI con transformers, ONNX Runtime; también es compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un encoder base con contexto de 160 tokens, la latencia esperada es de pocos milisegundos por instancia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hastika-task-b-muril-trainval | ~236M (MuRIL-base) | 160 tokens | Clasificación de categoría de odio en kanglish | apache-2.0 | Hugging Face |
| google/muril-base-cased | ~236M | 512 tokens | Modelo base multilingüe indio (no fine-tuned para odio) | apache-2.0 | Hugging Face |
| xlm-roberta-base | ~278M | 512 tokens | Modelo base multilingüe (no específico de lenguas indias) | mit | Hugging Face |

No se dispone de datos de rendimiento comparativo con otros clasificadores de hate speech en kanglish en la información proporcionada. La comparación se limita a arquitectura, contexto y licencia.

## Limitaciones y advertencias

- Entrenado con los ficheros de train y validation fusionados: no existe una validación limpia y el macro-F1 de 0,46 procede de un split aleatorio del 12 % del conjunto fusionado, no de un conjunto independiente.
- El checkpoint no formó parte de un envío oficial al shared task HASTIKA @ ICON-2026.
- Dataset pequeño: se esperan errores en variantes dialectales, sarcasmo, lenguaje reclamado y transliteraciones no vistas en entrenamiento.
- Riesgo de sesgos: al tratarse de un corpus de comentarios de YouTube, puede heredar sesgos de anotación y de la distribución temática del corpus original.
- Riesgo de falsos positivos y falsos negativos en la clasificación de categorías; el propio autor indica que debe asistir a moderadores humanos, no sustituirlos.
- Contexto limitado a 160 tokens, insuficiente para comentarios largos o hilos completos.
- Uso previsto de investigación; el dataset HASTIKA no se incluye y sus términos deben consultarse antes de cualquier otro uso.
- Aunque la licencia es Apache 2.0, el uso comercial debe evaluar los términos del corpus de entrenamiento y el impacto ético de la moderación automatizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ganesh-Nadkarni/hastika-task-b-muril-trainval
- Modelo base: https://huggingface.co/google/muril-base-cased
- Cita del corpus: Kavatagi, S. and Rachh, R. (2025). HASTIKA: hate speech and target identification in Kannada-English code-mixed text. Language Resources and Evaluation, 59(3):2811-2856.
