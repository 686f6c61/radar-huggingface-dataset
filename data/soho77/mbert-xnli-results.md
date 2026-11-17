# Soho77/mbert-xnli-results

## Resumen

`Soho77/mbert-xnli-results` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `google-bert/bert-base-multilingual-cased` (mBERT), el encoder multilingüe de Google basado en la arquitectura BERT original. Lo publica el usuario Soho77 en Hugging Face y su nombre sugiere que el ajuste se ha realizado sobre una tarea de inferencia de lenguaje natural (XNLI), aunque la model card no documenta explícitamente el dataset empleado ni la formulación exacta de la tarea.

Se trata de un modelo pequeño (177,8 millones de parámetros, ~0,7 GB en safetensors) con licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en infraestructura modesta. Su relevancia es limitada: no cuenta con descargas ni interacciones, la model card está generada automáticamente por el `Trainer` de Hugging Face y contiene secciones sin completar ("More information needed"). Los resultados declarados son modestos (accuracy de 0,3525 sobre el conjunto de evaluación), lo que sugiere un ajuste incompleto o un problema de clasificación con muchas clases.

En la práctica debe considerarse un artefacto experimental o de investigación más que un modelo listo para producción. Resulta útil como punto de partida reproducible para experimentos de fine-tuning multilingüe sobre mBERT, pero no como componente fiable en un sistema desplegado sin una evaluación adicional exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas, atención bidireccional) |
| Parametros totales | 177.855.747 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (mBERT soporta hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica via transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | no disponibles (el modelo base mBERT cubre 104 idiomas, pero el autor no declara idiomas para este fine-tuning) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-multilingual-cased`, un encoder Transformer de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, preentrenado con objetivos de masked language modeling y next sentence prediction sobre un corpus multilingüe (Wikipedia en más de 100 idiomas). Sobre esa base se añade una cabeza de clasificación de texto y se realiza un fine-tuning supervisado.

Los hiperparámetros documentados son: learning rate 2e-5, batch size de 8 (entrenamiento y evaluación), semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-8), scheduler lineal y 2 épocas, con 2.500 pasos totales (1.250 por época). El dataset de entrenamiento no se especifica. La evolución registrada muestra una pérdida de validación de 1,1116 en la época 1 y 1,1016 en la época 2, con accuracy de 0,3335 y 0,353 respectivamente; la evaluación final reporta loss 1,1007 y accuracy 0,3525. No se documenta ningún uso de RLHF, DPO ni técnicas de alineación, algo esperable en un encoder de clasificación. El entorno de entrenamiento fue Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto (pipeline `text-classification`): asigna una etiqueta a una secuencia de entrada; el número y la semántica de las etiquetas no están documentados.
- Codificación contextual multilingüe heredada de mBERT: representaciones densas de 768 dimensiones utilizables como embeddings de frase o token.
- Procesamiento de secuencias de hasta 512 tokens (límite del modelo base; no confirmado explícitamente por el autor para este fine-tuning).
- No soporta generación de texto, razonamiento generativo, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta un modo "thinking" ni capacidades de audio.

## Casos de uso

- Clasificación de textos multilingües en prototipos de investigación: el modelo puede etiquetar fragmentos en varios idiomas gracias a la herencia de mBERT, útil para validar pipelines de NLP antes de sustituir por un modelo ajustado con más datos.
- Experimentos de inferencia de lenguaje natural (NLI): dado el nombre del modelo, puede emplearse como referencia en experimentos de entailment/contradiction/neutral, siempre reentrenando o validando con un dataset XNLI propio dado que el autor no documenta el conjunto usado.
- Extracción de embeddings para búsqueda semántica: las representaciones del encoder permiten construir índices vectoriales para recuperación de documentos multilingües en entornos con recursos limitados.
- Filtrado y enrutamiento de tickets de soporte: clasificación ligera de mensajes entrantes en categorías predefinidas, ejecutable en CPU o GPU de gama baja.
- Base para fine-tuning posterior: al ser un checkpoint pequeño y con licencia Apache 2.0, sirve como inicialización para tareas de clasificación específicas con datasets propios.
- Evaluación comparativa de metodologías de ajuste: útil como caso de estudio de fine-tuning de mBERT con hiperparámetros documentados (2e-5, batch 8, 2 épocas) para reproducir experimentos académicos.
- Moderación de contenido en varios idiomas a pequeña escala: clasificación binaria o multiclase de textos, con la advertencia de que requiere validación previa por la falta de métricas fiables.

## Benchmarks y rendimiento

El model-index del autor está vacío (`results: []`). Los únicos datos publicados son los de la model card:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 1,1007 |
| Accuracy (evaluacion final) | 0,3525 |
| Loss (epoca 1) | 1,1116 |
| Accuracy (epoca 1) | 0,3335 |
| Loss (epoca 2) | 1,1016 |
| Accuracy (epoca 2) | 0,353 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, XNLI, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB de pesos más activaciones; en la práctica, menos de 2 GB para batch pequeño.
- VRAM estimada en fp16/bf16: en torno a 0,4 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas consumer como GTX 1650, RTX 3060, RTX 4090 funcionan sin problema. También es viable en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), `text-embeddings-inference` (el tag `text-embeddings-inference` está presente), vLLM no aplica para encoders de clasificación, llama.cpp requiere conversión a GGUF no documentada, Ollama no soportado de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamaño, se espera un throughput alto en GPU (miles de secuencias por segundo en batch), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Soho77/mbert-xnli-results | 177,9 M | no disponible (base: 512) | Apache 2.0 | Experimental, sin descargas |
| google-bert/bert-base-multilingual-cased | 177,9 M | 512 | Apache 2.0 | Modelo base consolidado, ampliamente usado |
| FacebookAI/xlm-roberta-base | 278 M | 512 | MIT | Encoder multilingüe alternativo, mejor rendimiento típico en NLI |
| MoritzLaurer/mDeBERTa-v3-base-mnli-xnli | 278 M | 512 | MIT | Fine-tuning específico para NLI/zero-shot, con métricas publicadas |

La comparación directa con alternativas como `mDeBERTa-v3-base-mnli-xnli` resulta desfavorable para este modelo: la alternativa documenta métricas en XNLI y está pensada explícitamente para zero-shot classification, mientras que `Soho77/mbert-xnli-results` no publica resultados de referencia ni describe su dataset.

## Limitaciones y advertencias

- Model card incompleta: secciones de descripción, usos previstos, datos de entrenamiento y limitaciones marcadas como "More information needed".
- Accuracy de evaluación de 0,3525: insuficiente para la mayoría de tareas de producción; sugiere un ajuste pobre, un problema con muchas clases o un dataset desbalanceado.
- Dataset de entrenamiento desconocido: imposibilita evaluar sesgos, cobertura lingüística y riesgo de contaminación.
- Etiquetas no documentadas: no se especifica el espacio de etiquetas ni su significado, lo que impide usar el modelo sin inspeccionar la configuración.
- Riesgo de alucinación bajo en clasificación (no genera texto), pero riesgo de clasificaciones erróneas y sobreconfianza en las predicciones.
- Idiomas no declarados: aunque hereda el multilingüismo de mBERT, no hay garantía de rendimiento en idiomas distintos del conjunto de entrenamiento (desconocido).
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación traslada al usuario toda la responsabilidad de validación.
- Sin descargas ni interacciones: no hay evidencia de uso en la comunidad ni de validación independiente.
- Fecha de creación futura (2026-11-17) en los metadatos: posible artefacto del registro, a verificar antes de citarlo.
- No apto para generación de texto, razonamiento, código ni tareas generativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Soho77/mbert-xnli-results
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Paper de BERT (referencia del modelo base): https://arxiv.org/abs/1810.04805
- Paper de mBERT / multilingual BERT: https://arxiv.org/abs/1906.01502
- Dataset XNLI (referencia inferida por el nombre, no confirmada por el autor): https://huggingface.co/datasets/facebook/xnli
- Documentacion de Transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
