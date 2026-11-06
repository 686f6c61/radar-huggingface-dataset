# shoowadoo/galkhesnet

## Resumen

galkhesnet es un modelo de generación texto-a-texto obtenido por ajuste fino (fine-tuning) del modelo malper/taatiknet, publicado por el usuario shoowadoo en Hugging Face. La arquitectura subyacente es T5 (encoder-decoder transformer), con 299.637.760 parámetros totales según los pesos en safetensors. El nombre y la métrica de evaluación reportada (CER, *character error rate*) sugieren que el ajuste está orientado a una tarea de transformación de secuencias con salida a nivel de carácter, probablemente normalización, transliteración o corrección ortográfica, aunque la model card no lo especifica.

El modelo es relevante únicamente como artefacto experimental: la model card es la generada automáticamente por el `Trainer` de Transformers y no documenta el conjunto de datos, los usos previstos ni las limitaciones. No se declara licencia ni idiomas soportados. Con 76 descargas y ningún *like*, se trata de un modelo de nicho, sin benchmarks publicados más allá de la pérdida de evaluación y el CER del conjunto de validación.

La información disponible es muy escasa: no hay resultados en el `model-index`, no hay pipeline declarado en Hugging Face y el repositorio ocupa 56,3 GB, un tamaño desproporcionado para 300 millones de parámetros, lo que indica que contiene artefactos adicionales (probablemente *checkpoints* intermedios de las 20 épocas de entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (transformer encoder-decoder) |
| Parametros totales | 299.637.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; conversión a GGUF no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | malper/taatiknet |
| Tarea (pipeline) | text2text-generation |
| Version de Transformers | 4.52.4 |
| Version de PyTorch | 2.6.0+cu124 |
| Tamano del repositorio | 56,3 GB |

## Arquitectura y entrenamiento

El modelo es un T5 estándar (encoder-decoder con atención completa y *relative position biases*), inicializado desde malper/taatiknet y ajustado con el `Trainer` de Transformers. Los hiperparámetros documentados son: learning rate 1e-4, *train batch size* 32, *eval batch size* 32, semilla 42, optimizador AdamW (betas 0.9/0.999, epsilon 1e-8), scheduler lineal, 20 épocas, precisión mixta nativa (AMP) y 2004 pasos totales. El paso 2004 con batch 32 implica aproximadamente 64.000 ejemplos de entrenamiento procesados en total (unas 3.200 muestras por época).

No se documenta la composición del conjunto de datos ("unknown dataset" en la model card), el número de tokens de entrenamiento, ni si hubo etapas de RLHF o DPO (poco habituales en un T5 de este tamaño). La métrica de evaluación reportada, `eval_cer = 0.0370`, es un *character error rate*, lo que apunta a una tarea de generación a nivel de carácter (transliteración, normalización ortográfica o similar) más que a generación de texto libre. No se declara ninguna innovación técnica adicional: no hay decodificación especulativa, atención lineal ni variantes híbridas.

## Capacidades

- Generación texto-a-texto condicionada por un *prompt* de entrada, en el formato propio del modelo base (no documentado).
- Transformación de secuencias con salida a nivel de carácter, según sugiere la métrica CER reportada.
- No hay evidencia documentada de soporte de *tool calling* ni *function calling*.
- No hay evidencia documentada de capacidades de agente ni razonamiento multi-paso.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- No hay modo *thinking*, visión ni audio: es un T5 puramente textual.
- El tamaño (300 M de parámetros) permite inferencia en CPU, aunque no se han publicado medidas de latencia.

## Casos de uso

- Normalización o transliteración de texto: dado el CER de 0,037 en validación, el modelo parece entrenado para mapear secuencias de entrada a salidas a nivel de carácter; se usaría como paso de preprocesado en *pipelines* de NLP antes de un modelo mayor.
- Corrección ortográfica o de transcripción: un CER bajo es consistente con tareas de corrección carácter a carácter, aplicable a limpieza de corpus o de transcripciones ASR.
- Prototipado de investigación sobre T5: al ser un *fine-tune* pequeño y con hiperparámetros documentados, sirve como referencia reproducible para experimentos de ajuste sobre malper/taatiknet.
- Evaluación comparativa de modelos base: útil para medir cuánto mejora el ajuste fino respecto al modelo original en la misma métrica (CER), siempre que se disponga del conjunto de evaluación original.
- Despliegue en entornos con recursos limitados: con 300 M de parámetros, cabe en CPU y en GPUs de gama baja para inferencia por lotes no interactiva.
- Generación de datos sintéticos de bajo coste: para aumentar corpus en la tarea específica del ajuste, con revisión humana posterior dado el riesgo de alucinación.

En ningún caso se recomienda su uso en producción sin validar primero la tarea real, el idioma y la calidad, porque la model card no documenta ninguno de esos aspectos.

## Benchmarks y rendimiento

El `model-index` del autor no contiene resultados (`results: []`). Los únicos datos publicados son las métricas de evaluación del `Trainer`:

| Metrica | Valor |
|---|---|
| eval_loss | 0,0419 |
| eval_cer | 0,0370 |
| eval_runtime (s) | 246,4702 |
| eval_samples_per_second | 16,249 |
| eval_steps_per_second | 0,511 |
| epoca | 2,0 (mejor checkpoint registrado) |
| paso | 2004 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos (300 M × 4 bytes); en fp16, unos 0,6 GB. El *overhead* de activaciones y del *KV cache* depende de la longitud de secuencia, no documentada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp16; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más (GTX 1650, RTX 3050, etc.). También es viable en CPU.
- Opciones de despliegue: `transformers` con `pipeline("text2text-generation")`, Text Generation Inference (el tag `text-generation-inference` está presente) y servidores compatibles con *endpoints*. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles. Como referencia, el *eval* del autor procesó 16,25 muestras por segundo con batch 32 en hardware no especificado (probablemente GPU), pero no es un dato de inferencia en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| galkhesnet | 299,6 M | no disponible | no disponible | Hugging Face (76 descargas) | Fine-tune de taatiknet, sin benchmarks estándar |
| malper/taatiknet | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que deriva galkhesnet |
| T5-base (google) | 220 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente desplegado | Referencia estándar de la familia T5 |
| mT5-base (google) | 580 M | 512 tokens | Apache 2.0 | Hugging Face | Variante multilingüe de referencia |

La comparación con T5-base y mT5-base es solo orientativa por familia arquitectónica: no hay datos de rendimiento comparables entre ellos y galkhesnet, y la licencia de este último no está declarada, lo que impide confirmar su uso comercial.

## Limitaciones y advertencias

- La model card es la generada automáticamente por el `Trainer`: no documenta datos de entrenamiento, usos previstos, idiomas ni limitaciones. Cualquier uso en producción exige validación empírica previa.
- Licencia no declarada: no se puede asumir permiso para uso comercial. Hay que contactar con el autor o consultar la licencia del modelo base malper/taatiknet antes de cualquier despliegue.
- Riesgo de alucinación inherente a los modelos T5 ajustados con pocos datos y sin evaluación de calidad más allá del CER; el CER de 0,037 no mide fidelidad semántica.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se pueden evaluar sesgos de género, etnia, idioma o dominio.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con entradas largas; el modelo base T5 suele estar limitado a 512 tokens, pero no se confirma.
- Idiomas no declarados: no se debe asumir soporte multilingüe.
- El repositorio de 56,3 GB para 300 M de parámetros sugiere la presencia de múltiples *checkpoints*; conviene revisar qué archivos se descargan para no consumir almacenamiento innecesario.
- Sin *likes* ni benchmarks de terceros: no hay validación independiente de la calidad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoowadoo/galkhesnet
- Modelo base: https://huggingface.co/malper/taatiknet
- Documentación de T5 en Transformers: https://huggingface.co/docs/transformers/model_doc/t5
- Documentación de text2text-generation: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.Text2TextGenerationPipeline
