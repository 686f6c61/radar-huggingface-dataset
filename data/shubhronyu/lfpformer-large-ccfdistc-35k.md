# Shubhronyu/LFPformer-large-CCFDistc-35k

## Resumen

LFPformer-large-CCFDistc-35k es un checkpoint de investigación publicado por Shubhronyu (Subhrajit Dey) en Hugging Face. No es un modelo de lenguaje ni un sistema de reconocimiento de voz, sino un extractor de representaciones para señales de potencial de campo local (LFP, local field potential) registradas con electrodos intracraneales. El modelo parte de `facebook/wav2vec2-large` y se ha reentrenado sobre ventanas de LFP de 3 segundos a 1.250 Hz procedentes de grabaciones completas del dataset IBL, aplicando un objetivo de predicción latente enmascarada combinado con una pérdida de contraste de distancia sobre coordenadas de atlas histológico (CCFDistc).

La arquitectura es un transformer de 24 capas, anchura oculta de 1.024 y 16 cabezas de atención, con unos 317,5 millones de parámetros en el backbone (incluyendo los componentes de preentrenamiento). El checkpoint corresponde al paso 35.000 de una comparación de capacidad de decodificador igualada presentada en el trabajo LFPformer (NeurIPS 2026), con un lote global efectivo de 512, lo que equivale a 17.920.000 presentaciones de ventana.

Su relevancia es acotada pero específica: ofrece pesos en formato estándar `transformers` (`Wav2Vec2ForPreTraining`) sin código remoto, lo que facilita la extracción de embeddings de 1.024 dimensiones a partir de ventanas LFP preprocesadas. Es un checkpoint de comparación con presupuesto fijo, no el punto final de entrenamiento ni una reivindicación de rendimiento óptimo, y no incluye decodificador de localización ni clasificación entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (wav2vec2-large), 24 capas, hidden 1.024, 16 cabezas de atención |
| Parametros totales | 317.380.864 (backbone con componentes de preentrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de ventanas de 3 s a 1.250 Hz, 3.750 muestras, remuestreadas a 16 kHz) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de precisión original) |
| Idiomas soportados | no aplica (modelo de señales neuronales, no de texto ni voz) |
| Licencia | no disponible (no se especifica licencia propia para los pesos ajustados; se mantienen los términos aplicables del modelo base) |
| Formato de pesos | safetensors (`model.safetensors`, `auxiliary.safetensors`) |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura wav2vec2-large: un extractor de características convolucional seguido de un transformer de 24 capas con anchura 1.024 y 16 cabezas de atención. La inicialización proviene de `facebook/wav2vec2-large`. La entrada son ventanas de LFP monocanal de 3 segundos a 1.250 Hz (3.750 muestras), que el helper de extracción remuestrea a 16 kHz sin normalización por ventana, preservando las unidades de señal y el preprocesamiento específico del dataset. Los embeddings se obtienen promediando los estados ocultos finales, dando vectores de 1.024 dimensiones.

El preentrenamiento combina predicción latente enmascarada (MaskPred) con una pérdida de contraste de distancia (CCFDistc) que utiliza coordenadas de atlas derivadas de histología. Por tanto, es un objetivo supervisado por atlas, no libre de histología. Los objetivos espaciales auxiliares están implementados en el código de investigación de LFPformer, no en la pérdida estándar de `transformers`. El entrenamiento usó grabaciones completas del dataset IBL con lote global efectivo 512 durante 35.000 pasos (17.920.000 presentaciones de ventana). La cabeza auxiliar XYZ tenía `xyz_lambda=0` y no es un decodificador de localización entrenado. El refinamiento IBL emplea pooling de canales por varianza inversa seguido de ajuste Kabsch no ponderado de la geometría conocida de electrodos; la proyección PCA de línea Allen es un protocolo de evaluación separado.

## Capacidades

- Extracción de representaciones (embeddings) de ventanas LFP monocanal de 3 segundos, con salida de 1.024 dimensiones.
- Aprendizaje de representaciones auto-supervisado con predicción latente enmascarada sobre señales neuronales.
- Objetivo auxiliar de contraste de distancia espacial supervisado por coordenadas de atlas histológico (CCF).
- Carga mediante `Wav2Vec2ForPreTraining.from_pretrained(...)` sin código remoto personalizado.
- Compatibilidad con el backbone de preentrenamiento de LFPformer mediante configuración suministrada y carga estricta.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio general ni capacidades multilingües.
- No es un reconocedor automático de voz ni un modelo de lenguaje.

## Casos de uso

- Extracción de embeddings para análisis de poblaciones neuronales: el modelo convierte ventanas LFP de 3 s en vectores de 1.024 dimensiones utilizables en pipelines de decodificación, clustering o análisis de estados cerebrales, siempre que se respete el preprocesamiento de entrenamiento.
- Comparación de objetivos de preentrenamiento en neurociencia computacional: al ser un checkpoint de presupuesto fijo del estudio LFPformer, sirve como referencia reproducible frente a otras variantes (MaskPred sola, otros objetivos espaciales) bajo el mismo número de pasos y lote efectivo.
- Construcción de decodificadores de localización de electrodos: los embeddings pueden alimentar un readout entrenado aparte (no incluido) para tareas de localización, con la advertencia de que las métricas dependen del decodificador, cohorte, agregación y posprocesamiento.
- Investigación en representaciones supervisadas por atlas: permite estudiar cómo las coordenadas histológicas CCF influyen en la geometría del espacio latente de señales LFP.
- Reproducibilidad de resultados del paper: el paquete incluye `provenance.json`, `SHA256SUMS` y un script de restauración del diccionario de tensores original, útil para replicar experimentos con el código de investigación.
- Integración en pipelines de análisis con PyTorch/torchaudio: el helper `extract_embeddings.py` permite procesar lotes en CPU o GPU (`--device cuda`) dentro de flujos existentes de neurociencia de sistemas.
- Validación de mecánica de exportación: el smoke test finito de forma `(1, 1024)` y la igualdad exacta entre embeddings nativos y originales permiten verificar la integridad de la carga en entornos nuevos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la validación realizada comprueba la mecánica de exportación (carga estricta, preservación de los 417 tensores de estado originales y smoke test de embedding finito), no el rendimiento científico. Tampoco se proporcionan métricas de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 317,4 M de parámetros en fp32 los pesos ocupan aproximadamente 1,3 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con suficiente memoria para el modelo y el lote de ventanas es suficiente. El helper admite `--device cpu` y `--device cuda`.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM, dado el tamaño del checkpoint (1,3 GB de repo).
- Opciones de despliegue: `transformers` con `Wav2Vec2ForPreTraining`, PyTorch y torchaudio con builds compatibles para CPU/CUDA; el repositorio incluye `extract_embeddings.py` y `requirements.txt`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFPformer-large-CCFDistc-35k | 317,4 M | Ventanas LFP de 3 s (3.750 muestras) | MaskPred + CCFDistc (supervisado por atlas) | no disponible | Hugging Face, safetensors |
| facebook/wav2vec2-large (base) | ~317 M | Audio, ventanas de voz | Predicción latente enmascarada (audio) | Términos del modelo base | Hugging Face, ampliamente disponible |
| Otras variantes LFPformer del estudio | no disponible | Ventanas LFP de 3 s | Variantes de objetivos (comparación de capacidad igualada) | no disponible | Referenciadas en el paper y el repositorio de investigación |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de comparación con presupuesto fijo (paso 35.000), no el punto final de entrenamiento ni una reivindicación de mejor rendimiento universal.
- No incluye decodificador de localización ni clasificación entrenado, ni blanqueado de decodificador, optimizador, scheduler o datos de entrenamiento; los resultados del paper dependen del decodificador, cohorte, agregación y posprocesamiento.
- El objetivo CCFDistc usa coordenadas de atlas derivadas de histología: debe describirse como supervisado por atlas, no libre de histología.
- La cabeza auxiliar XYZ tenía `xyz_lambda=0` y no es un decodificador de localización entrenado.
- El cargador de embeddings del benchmark LFPformer existente fija proyecciones de codebook de 256 dimensiones; estos checkpoints Large usan 768, por lo que hay que usar el helper nativo o el backbone de preentrenamiento compatible con carga estricta.
- No debe aplicarse la normalización de forma de onda del procesador de audio por defecto a señales LFP.
- El `max_global_step` embebido puede conservar un límite de gate anterior y el batch size puede ser por rango; hay que consultar `provenance.json` para el paso y lote efectivo reales.
- No es un paquete completo de reanudación de optimizador.
- Licencia de los pesos ajustados no especificada; se mantienen los términos aplicables del modelo base, lo que introduce incertidumbre para uso comercial.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos generativos; el riesgo relevante es la extrapolación indebida a cohortes, especies, montajes o preprocesamientos distintos de los de entrenamiento.
- El código de investigación puede tener acceso restringido.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shubhronyu/LFPformer-large-CCFDistc-35k
- Perfil del autor: https://huggingface.co/Shubhronyu
- Modelo base: https://huggingface.co/facebook/wav2vec2-large
- Código de investigación LFPformer: https://github.com/neuroinfolab/LFPformer (acceso posiblemente restringido; commit `139b8d90054aa99608d77ba89832050b6eb3cf3b`)
