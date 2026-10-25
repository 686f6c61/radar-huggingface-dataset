# hnhung/viexdp-bartpho-syllable-tgt-aug-5e-05-20261024153906

## Resumen

`hnhung/viexdp-bartpho-syllable-tgt-aug-5e-05-20261024153906` es un ajuste fino (fine-tune) del modelo `vinai/bartpho-syllable`, el encoder-decoder monolingüe para vietnamita preentrenado por VinAI Research con la arquitectura y el esquema de denoising de BART en su variante "large". El checkpoint resultante conserva los 395.865.192 parámetros del modelo base y se distribuye en formato safetensors bajo licencia MIT, con la etiqueta `text2text-generation` de transformers.

El modelo lo publica el usuario `hnhung` y, por el nombre del repositorio, parece formar parte de una batería de experimentos de ajuste fino (sufijo con la tasa de aprendizaje `5e-05`, un tag `tgt-aug` y una marca temporal). La model card es la generada automáticamente por `Trainer` y no documenta el conjunto de datos, el objetivo de la tarea ni los usos previstos, por lo que cualquier evaluación de su comportamiento real requiere pruebas propias.

Su interés es acotado pero real: sirve como punto de partida reproducible para tareas generativas en vietnamita con tokenización a nivel de sílaba, y su licencia MIT (frente a otras licencias más restrictivas del ecosistema) facilita su integración en productos. No hay resultados de benchmarks ni métricas de calidad declaradas, sólo la curva de pérdida de validación del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo BART (clase `mbart` en transformers), variante "large" del modelo base BARTpho |
| Parametros totales | 395.865.192 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (BARTpho-large define 1.024 posiciones posicionales en su configuracion original) |
| Tipos de cuantizacion | No especificados por el autor; al ser un checkpoint transformers estandar admite fp32, fp16/bf16, int8 y 4-bit (bitsandbytes, GPTQ/AWQ, GGUF) |
| Idiomas soportados | No declarados en la model card; el modelo base es monolingue vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`); repositorio de 12,7 GB, compatible con `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura es la de BARTpho, un sequence-to-sequence con encoder y decoder Transformer y preentrenamiento mediante denoising autoencoder (corrupción del texto y reconstrucción), tal como describe el paper `arXiv:2109.09701`. BARTpho se publica en dos variantes, `bartpho-word` y `bartpho-syllable`; este fine-tune parte de la versión a nivel de sílaba, que aplica una segmentación silábica del vietnamita antes de la tokenización y resulta especialmente adecuada para tareas generativas (resumen, parafraseo, normalización de texto).

El ajuste fino se ejecutó con `Trainer` durante 8 épocas, con `learning_rate = 5e-05`, `train_batch_size = 16`, `eval_batch_size = 16`, semilla 42, optimizador `ADAMW_TORCH_FUSED` (betas 0,9/0,999, epsilon 1e-08), scheduler lineal con `warmup_ratio = 0.1` y un total de 5.560 pasos. El conjunto de entrenamiento no se documenta ("unknown dataset"), tampoco el número de tokens ni si hubo RLHF/DPO. La pérdida de entrenamiento cae de 1,7786 a 0,3134 mientras la de validación toca mínimo en la época 3 (1,6512) y sube hasta 2,2874 en la época 8, lo que indica sobreajuste a partir de la cuarta época. El entorno declarado es Transformers 4.57.6, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.22.2.

## Capacidades

- Generación de texto condicionada (`text2text-generation`) en vietnamita, heredada del modelo base.
- Tokenización a nivel de sílaba, útil para texto vietnamita con separación silábica explícita.
- Tareas generativas típicas de BART: resumen de documentos, parafraseo, reescritura y simplificación de frases.
- Adecuado como base para normalización o corrección de texto si el ajuste se orientó a esa tarea (el nombre `viexdp` sugiere experimentación, pero el objetivo no está documentado).
- Soporte de tool calling / function calling: no disponible (arquitectura seq2seq sin entrenamiento específico para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento explícito: no disponible.
- Capacidades multilingües: no declaradas; el preentrenamiento del modelo base es monolingüe vietnamita.

## Casos de uso

- Resumen automático de noticias y documentos en vietnamita: el modelo base BARTpho fue evaluado precisamente en resumen de texto vietnamita, y este checkpoint puede afinarse adicionalmente o usarse directamente si el ajuste cubrió esa tarea (verificar con muestras propias).
- Parafraseo y reescritura de contenido SEO o editorial: la formulación seq2seq permite pasar una frase y obtener variantes, útil para enriquecer catálogos de artículos en vietnamita.
- Normalización de transcripciones: al trabajar a nivel de sílaba, encaja en pipelines que reciben texto ASR sin separación silábica correcta y necesitan una salida canónica.
- Aumento de datos (data augmentation) para otros modelos: generar variantes de frases vietnamitas para ampliar corpus de entrenamiento de clasificadores o NER.
- Preprocesado en buscadores y sistemas de recuperación: generar resúmenes o títulos cortos a partir de fragmentos largos antes de indexar.
- Base para experimentos académicos reproducibles: la licencia MIT y el formato safetensors permiten replicar el ajuste con los hiperparámetros publicados y comparar contra `vinai/bartpho-syllable`.
- Generación de respuestas cortas en asistentes de dominio acotado, siempre con validación humana y filtros posteriores por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card está vacío (`results: []`). Las únicas métricas declaradas son las de pérdida durante el entrenamiento:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion |
|---|---|---|---|
| 1.0 | 695 | 1,7786 | 1,7661 |
| 2.0 | 1390 | 1,4548 | 1,6740 |
| 3.0 | 2085 | 1,1369 | 1,6512 |
| 4.0 | 2780 | 0,8744 | 1,7304 |
| 5.0 | 3475 | 0,6781 | 1,8514 |
| 6.0 | 4170 | 0,5191 | 2,0136 |
| 7.0 | 4865 | 0,4037 | 2,1618 |
| 8.0 | 5560 | 0,3134 | 2,2874 |

No hay resultados de MMLU, HumanEval, GSM8K ni de métricas de resumen (ROUGE) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,6 GB en fp32, ~0,8 GB en fp16/bf16, ~0,4 GB en int8 y ~0,25-0,3 GB en 4-bit (sólo pesos; sumar memoria de activaciones y caché, que crece con la longitud de secuencia y el beam search).
- GPU recomendadas: cualquier GPU con 4 GB o más basta para fp16 con secuencias cortas; para lotes grandes o generación con beam search amplio conviene una RTX 3090/4090 (24 GB) o una A100/H100 en despliegues de servicio.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 e incluso en GPUs de 6-8 GB con cuantización.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM`, `text-generation-inference` (TGI), vLLM (soporte seq2seq limitado, verificar versión), llama.cpp/Ollama tras conversión a GGUF, y Hugging Face Inference Endpoints (el repo está marcado como `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia orientativa, un modelo de ~400 M de parámetros en una GPU moderna suele generar decenas de tokens por segundo con beam search de 4 haces, pero es una estimación, no un dato medido de este checkpoint.
- Disco: el repositorio ocupa 12,7 GB (contiene artefactos de entrenamiento además de los pesos), prever ese espacio antes de clonar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`hnhung/...aug-5e-05-...`) | 395.865.192 | No disponible | Vietnamita (heredado, no declarado) | MIT | Hugging Face, safetensors |
| `vinai/bartpho-syllable` (base) | ~396 M (arquitectura "large") | No disponible en la informacion | Vietnamita | No verificada en la informacion disponible | Hugging Face, transformers |
| `vinai/bartpho-word` | ~396 M (arquitectura "large") | No disponible en la informacion | Vietnamita | No verificada en la informacion disponible | Hugging Face, transformers |
| `VietAI/vit5-base` | No disponible en la informacion | No disponible en la informacion | Vietnamita | No verificada en la informacion disponible | Hugging Face, transformers |

La comparación relevante es contra el modelo base: este checkpoint parte de `vinai/bartpho-syllable` y sólo se diferencia por el ajuste fino, cuyos datos y objetivo no se documentan, de modo que no puede afirmarse una mejora sobre el base sin una evaluación propia. Frente a alternativas vietnamitas como ViT5 (encoder-decoder T5 preentrenado en vietnamita), la elección depende de la tarea: BARTpho-syllable está diseñado explícitamente para tareas generativas con segmentación silábica.

## Limitaciones y advertencias

- Model card autogenerada: no documenta dataset, objetivo, usos previstos ni limitaciones; el propio autor deja "More information needed" en todas las secciones.
- Sobreajuste evidente: la pérdida de validación mínima se alcanza en la época 3 (1,6512) y empeora hasta 2,2874 en la época 8; el checkpoint publicado es el de la última época, no el mejor.
- Sin benchmarks: no hay ninguna métrica de calidad (ROUGE, BLEU, exactitud) que permita afirmar que supera al modelo base.
- Riesgo de alucinación: inherente a los modelos generativos seq2seq; en resumen abstractivo puede introducir contenido no presente en el texto fuente.
- Sesgos: al no documentarse los datos de ajuste, se desconocen los sesgos de dominio, género o registro que pueda haber incorporado; el modelo base se entrenó con corpus vietnamita general.
- Limitaciones de idioma: preentrenamiento monolingüe vietnamita; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Limitación de contexto: no se especifica la longitud máxima soportada; BART posicional estándar se limita a 1.024 tokens, por lo que documentos largos requieren truncado o segmentación.
- Restricciones de licencia: el checkpoint se declara MIT, pero conviene verificar la licencia del modelo base `vinai/bartpho-syllable` y de los datos de ajuste antes de un uso comercial, ya que el modelo derivado hereda obligaciones del original.
- Nombre del repositorio no informativo (`tgt-aug`, marca temporal): tratar como artefacto de experimento, no como versión estable ni mantenida.
- Cero descargas y cero "likes": sin validación por parte de la comunidad; no hay informes de terceros sobre su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hnhung/viexdp-bartpho-syllable-tgt-aug-5e-05-20261024153906
- Modelo base: https://huggingface.co/vinai/bartpho-syllable
- Documentación de BARTpho en transformers: https://huggingface.co/docs/transformers/v4.43.4/en/model_doc/bartpho
- Repositorio oficial de BARTpho (VinAI Research): https://github.com/VinAIResearch/BARTpho
- Paper BARTpho: https://arxiv.org/abs/2109.09701
- Ficha de referencia en Inferix: https://inferix.co/models/vinai/bartpho-syllable
