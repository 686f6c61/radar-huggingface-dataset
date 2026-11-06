# Ganesh-Nadkarni/hastika-task-a-xlmr-base-trainval

## Resumen

hastika-task-a-xlmr-base-trainval es un modelo de clasificación de texto obtenido mediante fine-tuning de `xlm-roberta-base` sobre comentarios de YouTube en kanglish (kannada-inglés code-mixed). Lo desarrolla Ganesh-Nadkarni como participación en la tarea Task A del shared task HASTIKA @ ICON-2026, centrada en la detección binaria de discurso de odio (Non-Hate / Hate) en texto code-mixed kannada-inglés.

El modelo parte de la arquitectura XLM-RoBERTa base, un transformer encoder multilingüe de 278 millones de parámetros, y se ajusta con un clasificador de dos etiquetas. La ventana de entrada utilizada durante el entrenamiento es de 160 tokens, suficiente para comentarios cortos de YouTube pero limitada para documentos largos. El checkpoint se entrenó fusionando los ficheros de entrenamiento y validación del dataset HASTIKA con un split estratificado 88/12, por lo que no dispone de una validación limpia e independiente.

Su relevancia radica en abordar un caso poco cubierto: la moderación de contenido en registros code-mixed de bajo recursos, donde los modelos monolingües fallan y los multilingües generales rinden por debajo de un ajuste específico. Es un modelo de investigación, con licencia MIT, pensado para asistir a moderadores humanos, no para sustituirlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de 2 etiquetas |
| Parametros totales | 278 M (base XLM-RoBERTa; cifra estándar del checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens máximo del encoder; entrenado con max_length 160 |
| Tipos de cuantizacion | no disponible (pesos estándar de transformers; cuantización dinámica posible vía bitsandbytes/ONNX, no documentada por el autor) |
| Idiomas soportados | kannada (kn), inglés (en); texto code-mixed kanglish |
| Licencia | MIT |
| Formato de pesos | safetensors / PyTorch (checkpoint de transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `FacebookAI/xlm-roberta-base`, un transformer encoder con atención bidireccional, vocabulario SentencePiece compartido para 100 idiomas y 12 capas. Sobre la representación del token `[CLS]` se aplica una cabeza lineal de clasificación binaria (Non-Hate / Hate). No hay innovaciones arquitectónicas: es un ajuste supervisado clásico de clasificación de secuencias.

El entrenamiento usó los ficheros de entrenamiento y validación del dataset HASTIKA fusionados, con un split estratificado 88/12. Hiperparámetros: max_length 160, batch size 16, precisión mixta, learning rate 2e-5 y early stopping sobre macro-F1 de validación. El autor reporta un macro-F1 de 0,782 sobre el 12 % reservado de los datos fusionados. Al haberse entrenado con los ficheros de validación originales, no existe una métrica de validación limpia e independiente, y el checkpoint no formó parte de un envío oficial al shared task. No se documentan datos de RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación binaria de texto: devuelve Non-Hate (0) o Hate (1) para un comentario dado.
- Manejo de texto code-mixed kannada-inglés (kanglish), incluyendo transliteración latina del kannada.
- Procesamiento de comentarios cortos de plataformas sociales (hasta 160 tokens en el régimen de entrenamiento).
- Integración directa con `transformers.pipeline("text-classification")`.
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al par kn-en; el backbone XLM-R es multilingüe, pero el ajuste es específico del dominio.

## Casos de uso

- Moderación asistida de comentarios en YouTube: el modelo clasifica comentarios kanglish como Hate o Non-Hate para priorizar la revisión humana, aprovechando su ajuste específico al registro code-mixed que los filtros monolingües no cubren.
- Pre-filtrado en pipelines de moderación a escala: al ser un encoder de 278 M, permite procesar lotes grandes en CPU o GPU modesta antes de escalar a un revisor humano o a un modelo mayor.
- Investigación en detección de discurso de odio code-mixed: sirve como baseline reproducible para comparar con modelos multilingües sin ajuste o con arquitecturas generativas.
- Etiquetado semi-automático de corpus: puede pre-anotar grandes volúmenes de comentarios kanglish para su posterior revisión y corrección por anotadores humanos.
- Señal auxiliar en sistemas de reputación o community management: integrar la probabilidad de Hate como feature en un clasificador de riesgo de usuario o hilo.
- Evaluación de sesgos y robustez en NLP de bajos recursos: útil para estudiar cómo se comporta un modelo ajustado con pocos datos ante dialectos, sarcasmo y lenguaje reclamado.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Macro-F1 | 0,782 | 12 % reservado del split fusionado train+val (no es validación limpia) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte explícitamente que la cifra de 0,782 no constituye una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB para los pesos (278 M × 4 bytes) más overhead de activaciones; en fp16, en torno a 0,6 GB.
- Cabe en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100) con enorme margen para batching.
- Inferencia viable en CPU para volúmenes moderados; un encoder de este tamaño procesa decenas de comentarios por segundo en CPU multinúcleo.
- Opciones de despliegue: `transformers` (pipeline nativo), Hugging Face Inference Endpoints (marcado como `endpoints_compatible`), ONNX Runtime, y exportación a TorchScript. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI (son stacks orientados a modelos generativos; TGI admite algunos encoders, pero no está verificado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hastika-task-a-xlmr-base-trainval | 278 M | 512 (entrenado a 160) | Binario Hate/Non-Hate en kanglish | MIT | Hugging Face |
| xlm-roberta-base (sin ajuste) | 278 M | 512 | No | MIT | Hugging Face |
| MuRIL (Google) | 236 M | 512 | No (backbone multilingüe indio) | Apache 2.0 | Hugging Face |
| IndicBERT | 33 M | 512 | No (backbone para lenguas indias) | Apache 2.0 | Hugging Face |

No se dispone de resultados comparativos de rendimiento entre estos modelos en el conjunto HASTIKA dentro de la información proporcionada. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Entrenado con los ficheros de validación incluidos en el split: la métrica de 0,782 no es una validación independiente y probablemente sobreestima el rendimiento real.
- Dataset pequeño: el autor advierte de errores esperables en dialectos, sarcasmo, lenguaje reclamado y variantes de transliteración no vistas en entrenamiento.
- Sesgos potenciales derivados de los datos de YouTube: sobrerrepresentación de ciertos temas, registros y comunidades; riesgo de falsos positivos sobre lenguaje coloquial o reclamado.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas con alta confianza; no se documenta calibración.
- Limitación de idioma: solo kn-en code-mixed; su uso sobre otros pares de lenguas o kannada monolingüe formal no está validado.
- Restricciones de uso: licencia MIT para el modelo, pero el dataset HASTIKA tiene sus propios términos; el autor indica consultarlos antes de cualquier uso distinto de la investigación.
- Uso previsto: herramienta de asistencia a moderadores humanos, no sustituto. No debe usarse para decisiones automatizadas de censura o sanción sin revisión humana.
- No es un modelo generativo: no sirve para resúmenes, traducción ni diálogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ganesh-Nadkarni/hastika-task-a-xlmr-base-trainval
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de referencia del dataset y shared task: Kavatagi, S. and Rachh, R. (2025). HASTIKA: hate speech and target identification in Kannada-English code-mixed text. Language Resources and Evaluation, 59(3):2811-2856.
