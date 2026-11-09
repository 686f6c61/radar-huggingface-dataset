# Shubhronyu/LFPformer-large-ManipDistc-35k

## Resumen

LFPformer-large-ManipDistc-35k es un checkpoint de investigación publicado por Shubhronyu (Subhrajit Dey) en Hugging Face. No es un modelo de lenguaje ni un sistema de reconocimiento de voz, sino un extractor de representaciones para señales de potencial de campo local (LFP, *local field potential*) registradas con electrodos intracraneales. El modelo parte de `facebook/wav2vec2-large` y se reentrena de forma auto-supervisada sobre ventanas LFP de 3 segundos a 1.250 Hz procedentes de registros del International Brain Laboratory (IBL).

La arquitectura mantiene el esqueleto wav2vec2-large: 24 capas Transformer, anchura oculta de 1.024 y 16 cabezas de atención, con unos 317,38 millones de parámetros en el backbone (incluyendo los componentes de preentrenamiento). El checkpoint corresponde al paso 35.000 de una comparación de capacidad de decodificador emparejada presentada en NeurIPS 2026, con un lote global efectivo de 512, lo que equivale a 17.920.000 presentaciones de ventana.

Su relevancia es acotada pero específica: ofrece pesos abiertos para extraer embeddings de 1.024 dimensiones de señales neurofisiológicas sin necesidad de código remoto personalizado, cargables con `Wav2Vec2ForPreTraining` estándar de Transformers. Es un artefacto de investigación reproducible, no un producto listo para producción, y el propio autor advierte de que no constituye el punto final de entrenamiento ni una reivindicación de mejor rendimiento universal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo wav2vec2 (24 capas, anchura 1.024, 16 cabezas) |
| Parametros totales | 317.380.864 (backbone con componentes de preentrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 3 s a 1.250 Hz (3.750 muestras), remuestreadas a 16 kHz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de senales neurofisiologicas, no de texto ni voz) |
| Licencia | no disponible (no se especifica licencia propia para los pesos ajustados; se mantienen los terminos del modelo base) |
| Formato de pesos | safetensors (`model.safetensors`, `auxiliary.safetensors`) |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura wav2vec2-large como extractor convolucional más encoder Transformer. La entrada son ventanas de LFP monocanal de 3 segundos muestreadas a 1.250 Hz (3.750 muestras), que el helper de extracción remuestrea a 16 kHz sin normalización por ventana; los estados ocultos finales se promedian para producir embeddings de 1.024 dimensiones. El checkpoint se inicializa desde `facebook/wav2vec2-large` y se entrena sobre ventanas LFP de registros completos del IBL.

El régimen de entrenamiento combina predicción latente enmascarada (MaskPred) con una pérdida de contraste de distancia (ManipDistc) que utiliza las coordenadas registradas del micromanipulador. Los objetivos espaciales auxiliares están implementados en el código de investigación de LFPformer, no en la pérdida estándar de Transformers. La cabeza auxiliar XYZ presente en `auxiliary.safetensors` se conserva sin pérdida pero tenía `xyz_lambda=0`, por lo que no es un decodificador de localización entrenado. El checkpoint representa 17.920.000 presentaciones de ventana con lote global efectivo 512, y no incluye optimizador, scheduler ni datos de entrenamiento.

## Capacidades

- Extracción de embeddings de 1.024 dimensiones a partir de ventanas LFP monocanal preprocesadas.
- Aprendizaje de representaciones auto-supervisado sobre señales neurofisiológicas intracraneales.
- Carga mediante `Wav2Vec2ForPreTraining.from_pretrained(...)` sin código remoto personalizado.
- Script auxiliar `extract_embeddings.py` para procesar lotes en CPU o CUDA.
- Reconstrucción del diccionario de tensores original del wrapper mediante `restore_lfpformer_checkpoint.py`.
- No soporta tool calling, function calling, agentes, visión, audio ni generación de texto.
- No es un modelo multilingüe ni un reconocedor automático de voz.

## Casos de uso

- Extracción de características para decodificación de posición de electrodos: los embeddings de 1.024 dimensiones pueden alimentar un readout supervisado de localización anatómica, siempre que se entrene con las etiquetas y la normalización adecuadas.
- Análisis exploratorio de registros IBL: agrupar ventanas LFP por similitud en el espacio latente para estudiar estructura de estados neuronales o artefactos de registro.
- Comparación de métodos de representación: servir como línea base de capacidad fija (paso 35.000, lote 512) frente a otros checkpoints de LFPformer u otros encoders de señales.
- Reproducibilidad de investigación: validar pipelines propios contra un checkpoint con `provenance.json`, `SHA256SUMS` y comprobaciones de carga estricta documentadas.
- Preentrenamiento congelado para tareas downstream: usar el backbone como extractor fijo y entrenar cabezas ligeras de clasificación sobre cohortes propias.
- Estudio de transferencia entre cohortes: evaluar hasta qué punto las representaciones aprendidas en IBL generalizan a otros protocolos de registro (por ejemplo, la proyección Allen PCA-line citada como protocolo separado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las métricas del artículo dependen del decodificador, la cohorte, la agregación y el posprocesado, y que los pesos del encoder por sí solos no reproducen una métrica de sistema completo.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 1,3 GB en safetensors; en fp32 la inferencia requiere del orden de 1,3-1,5 GB de memoria, y menos si se aplica cuantización (no documentada).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB libres es suficiente; una RTX 4090 o una A100 no aportan ventaja de capacidad, solo de throughput en lotes grandes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para lotes moderados.
- Opciones de despliegue: Transformers nativo con `Wav2Vec2ForPreTraining`; el helper `extract_embeddings.py` soporta `--device cpu` y `--device cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo reporta una comprobación de humo con salida `(1, 1024)` finita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFPformer-large-ManipDistc-35k | 317,4 M | ventanas de 3 s (3.750 muestras) | Representacion LFP | no disponible | Hugging Face |
| facebook/wav2vec2-large | ~317 M | audio de hasta ~30 s | Representacion de voz | MIT/Apache (segun version upstream) | Hugging Face |
| Otros checkpoints LFPformer | no disponible | ventanas LFP | Representacion LFP | no disponible | Codigo en GitHub (acceso posiblemente restringido) |

La comparación directa con modelos de propósito general no es significativa: wav2vec2-large comparte arquitectura pero está entrenado para voz, y los demás checkpoints de LFPformer no exponen especificaciones públicas en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de voz: no genera texto, no transcribe audio y no debe evaluarse con benchmarks de NLP.
- El checkpoint representa un presupuesto de entrenamiento fijo (paso 35.000), no el punto final ni el mejor resultado del proyecto.
- No incluye decodificador downstream, blanqueado de decodificador, optimizador, scheduler ni datos; la localización requiere un readout entrenado y su normalización.
- El loader de embeddings del benchmark LFPformer original fija proyecciones de codebook de 256 dimensiones, mientras que estos checkpoints usan 768; hay que usar el helper nativo o el backbone de preentrenamiento con carga estricta.
- No aplicar la normalización de forma de onda del procesador de audio por defecto a señales LFP.
- El `max_global_step` embebido puede conservar un límite anterior y el tamaño de lote puede ser por rango; consultar `provenance.json`.
- Riesgo de alucinación no aplica; el riesgo real es interpretar los embeddings como decodificaciones válidas sin un readout entrenado.
- Licencia no especificada para los pesos ajustados; los términos del modelo base upstream siguen aplicándose, lo que condiciona el uso comercial.
- El código de investigación asociado puede tener acceso restringido, lo que limita la reproducibilidad completa del pipeline de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shubhronyu/LFPformer-large-ManipDistc-35k
- Perfil del autor: https://huggingface.co/Shubhronyu
- Modelo base: https://huggingface.co/facebook/wav2vec2-large
- Código de investigación LFPformer: https://github.com/neuroinfolab/LFPformer (acceso posiblemente restringido; commit `139b8d90054aa99608d77ba89832050b6eb3cf3b`)
