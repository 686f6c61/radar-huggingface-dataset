# Shubhronyu/LFPformer-large-MaskPred-35k

## Resumen

LFPformer-large-MaskPred-35k es un checkpoint de investigación publicado por el usuario Shubhronyu en Hugging Face, derivado de `facebook/wav2vec2-large` y reentrenado para representación autosupervisada de potenciales de campo local (LFP, local field potential) en neurociencia. No es un modelo de lenguaje ni un sistema de reconocimiento de voz: es un codificador de señales neuronales que transforma ventanas de LFP monocanal de 3 segundos a 1.250 Hz en embeddings de 1.024 dimensiones. El modelo forma parte de la comparación de capacidad de decodificador igualada presentada (según la model card) en NeurIPS 2026 dentro del proyecto LFPformer.

Arquitectónicamente es un transformer wav2vec2-large estándar: 24 capas, anchura oculta de 1.024, 16 cabezas de atención y unos 317,5 millones de parámetros en el backbone, incluyendo los componentes de preentrenamiento. El checkpoint corresponde a 35.000 pasos de entrenamiento con un lote global efectivo de 512 ventanas, lo que equivale a 17.920.000 presentaciones de ventana (no a ese número de grabaciones únicas). El autor lo describe explícitamente como un checkpoint de comparación con presupuesto fijo, no como el punto final de entrenamiento ni como un resultado de mejor rendimiento universal.

Su relevancia es acotada pero clara: ofrece pesos exportados de forma verificable (417 tensores preservados, carga estricta validada, embeddings idénticos entre la implementación nativa y el wrapper original) para investigación en representación de señales neuronales. No incluye decodificadores downstream de localización o clasificación, ni normalización, ni optimizador, ni datos de entrenamiento. La licencia de estos pesos ajustados no está especificada en el paquete, lo que limita su uso comercial sin aclaración previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer wav2vec2 (24 capas, hidden 1.024, 16 cabezas de atención) |
| Parametros totales | 317.380.864 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 3 s a 1.250 Hz (3.750 muestras), remuestreadas a 16 kHz en el helper |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de señales LFP, no de texto) |
| Licencia | no disponible (la model card indica que no se ha especificado una licencia separada para estos pesos ajustados; la inicialización upstream conserva sus términos) |
| Formato de pesos | safetensors (`model.safetensors`, `auxiliary.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

El modelo es un wav2vec2-large estándar inicializado desde `facebook/wav2vec2-large` y entrenado con un objetivo de predicción latente enmascarada (MaskPred) sin objetivo auxiliar espacial. Según la model card, los objetivos auxiliares espaciales del proyecto LFPformer están implementados en el código de investigación, no en la pérdida de preentrenamiento de Transformers estándar; de hecho, la cabeza auxiliar XYZ del wrapper original tenía `xyz_lambda=0` y no es un decodificador de localización entrenado. El entrenamiento se realizó sobre ventanas LFP de grabaciones completas del dataset IBL, con lote global efectivo de 512 y 35.000 pasos.

El checkpoint preserva los 417 tensores de estado originales exactamente. La validación reportada incluye carga estricta y una prueba de humo con embedding finito de forma `(1, 1024)`; los embeddings nativos y los del wrapper original resultaron exactamente iguales sobre una entrada sintética. Esta validación comprueba la mecánica de exportación, no el rendimiento científico. El paquete incluye `training_config.yaml` con rutas de máquina eliminadas, `lfp_preprocessing.json`, `provenance.json` y `SHA256SUMS`; el autor advierte que `max_global_step` embebido puede retener un límite de gate anterior y que el tamaño de lote puede ser por rango, por lo que debe consultarse `provenance.json` para el paso y lote efectivos reales. No es un paquete completo de reanudación de optimizador.

## Capacidades

- Extracción de embeddings de representación a partir de ventanas LFP monocanal de 3 segundos a 1.250 Hz, con salida de 1.024 dimensiones (promedio de los estados ocultos finales).
- Preprocesamiento incluido: remuestreo a 16 kHz sin normalización por ventana; el autor advierte explícitamente de no aplicar la normalización de forma de onda del procesador de audio por defecto a señales LFP.
- Carga mediante `Wav2Vec2ForPreTraining.from_pretrained(...)` sin código remoto personalizado.
- Reconstrucción del diccionario de tensores original del wrapper mediante `restore_lfpformer_checkpoint.py`.
- No es un reconocedor automático de voz ni un modelo de lenguaje: no genera texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso.
- No incluye decodificador downstream de localización o clasificación; la localización requiere un readout entrenado compatible y su normalización de entrenamiento.

## Casos de uso

- Extracción de características para experimentos de decodificación de posición o intención a partir de LFP: el modelo proporciona embeddings de 1.024 dimensiones que pueden alimentar un readout supervisado entrenado por separado, con las etiquetas anatómicas usadas solo en esa fase supervisada.
- Reproducción de comparaciones de capacidad de decodificador igualada: al ser un checkpoint de presupuesto fijo (35.000 pasos, lote efectivo 512), sirve como punto de referencia controlado frente a otras variantes del proyecto LFPformer.
- Investigación en representación autosupervisada de señales neuronales: permite estudiar qué información codifica un backbone wav2vec2-large entrenado con MaskPred sobre LFP del dataset IBL, sin objetivo auxiliar espacial.
- Validación de pipelines de exportación y carga: los archivos `provenance.json`, `SHA256SUMS` y el script de restauración permiten verificar integridad y equivalencia entre la implementación nativa y el wrapper original antes de integrar el modelo en código de investigación.
- Análisis de geometría de electrodos: el protocolo de refinamiento IBL (pooling de canales por varianza inversa seguido de ajuste Kabsch no ponderado sobre la geometría conocida) puede aplicarse sobre las predicciones de un readout entrenado sobre estos embeddings.
- Extracción por lotes en CPU o GPU: el helper `extract_embeddings.py` acepta `--device cpu` o `--device cuda`, lo que permite procesar conjuntos de ventanas en entornos sin GPU para experimentos exploratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento científico (ni MMLU, HumanEval, GSM8K ni métricas de decodificación neuronal); solo reporta validación de mecánica de exportación (carga estricta y prueba de humo de embedding finito).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 317,4 millones de parámetros en safetensors y un repo de 1,3 GB, la inferencia en fp32 requiere del orden de 1,3 GB solo para pesos, más activaciones y buffers.
- GPU recomendadas: no especificadas en la información disponible; el helper soporta `--device cuda` sin detallar modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: no confirmado en la información disponible; por tamaño de pesos es plausible en GPUs consumer con suficiente VRAM, pero el autor no lo documenta.
- Opciones de despliegue: carga nativa con Transformers (`Wav2Vec2ForPreTraining.from_pretrained`); el helper `extract_embeddings.py` con PyTorch y torchaudio compatibles. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFPformer-large-MaskPred-35k | 317,4 M | ventanas LFP de 3 s a 1.250 Hz | Embeddings de LFP (MaskPred) | no disponible | Hugging Face (Shubhronyu) |
| facebook/wav2vec2-large | ~317 M | audio (ventanas de forma de onda) | Representación autosupervisada de voz | no disponible en esta ficha | Hugging Face (Facebook) |
| Otras variantes LFPformer | no disponible | ventanas LFP | Representación de LFP con objetivos auxiliares espaciales | no disponible | Código de investigación en github.com/neuroinfolab/LFPformer (acceso posiblemente restringido) |

La comparación con modelos de la misma categoría (codificadores de LFP) no está disponible más allá de las variantes del propio proyecto LFPformer; la model card no ofrece métricas comparativas entre checkpoints.

## Limitaciones y advertencias

- No es el punto final de entrenamiento ni una afirmación de mejor rendimiento universal: es un checkpoint de comparación con presupuesto fijo (35.000 pasos).
- El número de 17.920.000 corresponde a presentaciones de ventana, no a grabaciones únicas; no debe interpretarse como diversidad de datos.
- No incluye decodificador downstream de localización o clasificación, ni blanqueo de decodificador, ni optimizador, ni scheduler, ni datos de entrenamiento; los resultados del paper dependen del decodificador, la cohorte, la agregación y el postprocesado.
- El cargador de embeddings del benchmark LFPformer existente fija proyecciones de codebook de 256 dimensiones; estos checkpoints Large usan 768, por lo que hay que usar el helper nativo de Transformers o el backbone de preentrenamiento compatible con carga estricta.
- El `max_global_step` embebido puede retener un límite de gate anterior y el tamaño de lote puede ser por rango; consultar `provenance.json`.
- La cabeza auxiliar XYZ tenía `xyz_lambda=0` y no es un decodificador de localización entrenado.
- No aplicar la normalización de forma de onda del procesador de audio por defecto a señales LFP; preservar las unidades de señal y el preprocesado específico del dataset.
- Licencia de los pesos ajustados no especificada; la inicialización upstream conserva sus términos aplicables, lo que supone un riesgo para uso comercial.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos generativos de texto; el riesgo relevante es de generalización fuera de la distribución del dataset IBL y de interpretación incorrecta de los embeddings sin un readout validado.
- La validación reportada comprueba solo la mecánica de exportación, no el rendimiento científico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shubhronyu/LFPformer-large-MaskPred-35k
- Modelo base: https://huggingface.co/facebook/wav2vec2-large
- Código de investigación LFPformer: https://github.com/neuroinfolab/LFPformer (acceso posiblemente restringido; procedencia fijada al commit `139b8d90054aa99608d77ba89832050b6eb3cf3b`)
- Paper: no disponible en la información proporcionada (la model card menciona NeurIPS 2026 sin enlace)
- Demo: no disponible
