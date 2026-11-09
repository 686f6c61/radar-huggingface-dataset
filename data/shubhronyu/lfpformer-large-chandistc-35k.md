# Shubhronyu/LFPformer-large-ChanDistc-35k

## Resumen

LFPformer-large-ChanDistc-35k es un modelo de representación auto-supervisada para señales de potencial de campo local (LFP, *local field potential*) cerebral, desarrollado por Shubhronyu (Subhrajit Dey) en el marco del proyecto de investigación LFPformer. No es un modelo de lenguaje: se trata de un encoder tipo wav2vec2 adaptado al dominio de neurofisiología para extraer embeddings de ventanas LFP monocanal de 3 segundos muestreadas a 1.250 Hz. Parte de la inicialización de `facebook/wav2vec2-large` y se ha preentrenado sobre ventanas de grabaciones completas del International Brain Laboratory (IBL).

El checkpoint corresponde al paso 35.000 de un experimento de comparación de capacidad de decodificador equiparada presentado en NeurIPS 2026, combinando predicción latente enmascarada (MaskPred) con un objetivo de contraste de distancia de geometría de canal dentro de la sonda (ChanDistc). Cuenta con 24 capas Transformer, anchura oculta de 1.024, 16 cabezas de atención y unos 317,4 millones de parámetros en el backbone, incluyendo los componentes de preentrenamiento.

Su relevancia es acotada pero específica: ofrece pesos exportados de forma verificable (417 tensores originales preservados, comprobación de humo de embeddings finitos) para investigación en decodificación neural, sin necesidad de código remoto personalizado, cargables mediante `Wav2Vec2ForPreTraining` estándar. No es un endpoint final de entrenamiento ni una reivindicación de rendimiento óptimo universal, sino un punto de comparación de presupuesto fijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo wav2vec2 (24 capas, anchura oculta 1.024, 16 cabezas de atencion) |
| Parametros totales | 317.380.864 (backbone con componentes de preentrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de ventanas de 3 s a 1.250 Hz, 3.750 muestras; remuestreo interno a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de senal neural, no linguistico) |
| Licencia | no disponible (los pesos derivados no tienen licencia especificada; la inicializacion upstream conserva sus terminos) |
| Formato de pesos | safetensors (`model.safetensors`, `auxiliary.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec2 en su variante *large*: un extractor convolucional de características seguido de 24 bloques Transformer con anchura oculta de 1.024 y 16 cabezas de atención. Se inicializa desde `facebook/wav2vec2-large` y se preentrena sobre ventanas LFP del dataset IBL, con una entrada de 3.750 muestras (3 s a 1.250 Hz) que el helper de extracción remuestrea a 16 kHz sin normalización por ventana, preservando las unidades y el preprocesado específico del dataset. Los embeddings se obtienen promediando los estados ocultos finales, dando vectores de 1.024 dimensiones.

El preentrenamiento combina dos objetivos: predicción latente enmascarada (MaskPred) y un contraste de distancia de geometría de canal dentro de la sonda (ChanDistc), implementados en el código de investigación de LFPformer y no en la pérdida estándar de Transformers. Con batch global efectivo de 512, el checkpoint representa 17.920.000 presentaciones de ventana (no grabaciones únicas). La cabeza auxiliar XYZ tenía `xyz_lambda=0` y no constituye un decodificador de localización entrenado. La validación reportada cubre la mecánica de exportación (carga estricta y smoke check de embedding `(1, 1024)`), no el rendimiento científico.

## Capacidades

- Extracción de embeddings de representación de ventanas LFP monocanal de 3 s a 1.250 Hz (salida de 1.024 dimensiones).
- Aprendizaje auto-supervisado de representaciones neuronales sin etiquetas anatómicas para la extracción de embeddings.
- Carga mediante `Wav2Vec2ForPreTraining.from_pretrained(...)` estándar, sin código remoto personalizado.
- Compatibilidad con el backbone de preentrenamiento de LFPformer mediante configuración suministrada y carga estricta.
- Reconstrucción del diccionario de tensores original del wrapper mediante `restore_lfpformer_checkpoint.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No es un reconocedor automático de voz ni un decodificador de localización listo para usar (requiere un readout entrenado compatible).

## Casos de uso

- Investigación en decodificación neural: extraer embeddings de ventanas LFP del IBL para alimentar clasificadores o decodificadores posteriores de variables conductuales o anatómicas, aprovechando que el modelo ya ha aprendido estructura temporal y geométrica de la señal.
- Análisis de geometría de sondas de electrodos: el objetivo ChanDistc modela distancias entre canales dentro de la sonda, útil para estudiar la relación entre la posición física de los electrodos y las representaciones latentes extraídas.
- Comparación de métodos de preentrenamiento auto-supervisado en neurofisiología: sirve como punto de referencia de presupuesto fijo (35.000 pasos, batch 512) frente a otras variantes del proyecto LFPformer con decodificador de capacidad equiparada.
- Construcción de pipelines de representación para neurodatos: el helper `extract_embeddings.py` permite procesar lotes `windows.npz` en CPU o CUDA y generar `embeddings.npz` para su uso en análisis downstream.
- Reproducibilidad de experimentos: los ficheros `provenance.json`, `SHA256SUMS` y `training_config.yaml` permiten verificar identidad del checkpoint, integridad de ficheros y configuración de origen con rutas de máquina eliminadas.
- Estudio de alineación de geometría anatómica: combinado con el refinamiento IBL (pooling de canales por varianza inversa y ajuste Kabsch no ponderado de la geometría conocida de electrodos a las predicciones) para evaluar la coherencia espacial de las representaciones.
- Base para fine-tuning supervisado en tareas de localización o clasificación, siempre que se entrene un readout compatible con su normalización de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados del paper dependen del decodificador, la cohorte, la agregación y el postprocesado, y que los pesos del encoder por sí solos no reproducen una métrica de sistema completo. La validación reportada se limita a la mecánica de exportación (carga estricta y smoke check de embedding finito), no al rendimiento científico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 317,4 millones de parámetros y pesos en safetensors (repo de 1,3 GB), la inferencia en fp32 requiere del orden de 1,3 GB para los pesos más overhead de activaciones; no se especifican requisitos oficiales.
- GPU recomendadas: no disponible. El helper soporta `--device cpu` y `--device cuda`; se recomienda instalar builds de PyTorch y torchaudio compatibles con el entorno CPU/CUDA.
- Cabe en GPU de consumo: probablemente sí por tamaño de pesos, pero no hay confirmación oficial ni cifras de latencia o throughput.
- Opciones de despliegue: carga nativa mediante Transformers (`Wav2Vec2ForPreTraining`); el helper `extract_embeddings.py` para extracción por lotes. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFPformer-large-ChanDistc-35k | 317,4 M | Ventanas de 3 s (3.750 muestras) | LFP cerebral (IBL) | no disponible | Hugging Face (0 descargas, 0 likes) |
| facebook/wav2vec2-large | ~317 M | Audio (waveform) | Voz | no disponible en la informacion | Hugging Face (ampliamente usado) |
| Otras variantes LFPformer (mismo paper) | no disponible | Ventanas LFP | LFP cerebral | no disponible | Código en GitHub (acceso posiblemente restringido) |

La comparación con wav2vec2-large es pertinente por compartir arquitectura e inicialización, pero el dominio y los objetivos de preentrenamiento difieren por completo. No se dispone de datos de rendimiento comparativo entre variantes LFPformer en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- No es un reconocedor automático de voz; no debe aplicarse el procesador de audio por defecto con normalización de waveform a señales LFP.
- El cargador de embeddings del benchmark LFPformer existente fija proyecciones de codebook de 256 dimensiones, mientras que estos checkpoints Large usan 768; es necesario usar el helper nativo o el backbone de preentrenamiento compatible con carga estricta.
- Los ficheros no contienen decodificador downstream de localización/clasificación entrenado, blanqueado de decodificador, optimizador, scheduler ni datos de entrenamiento; no es un paquete completo de reanudación de optimizador.
- El `max_global_step` embebido puede retener un límite de gate anterior y el batch size puede ser por rango; debe consultarse `provenance.json` para el paso y batch efectivos reales.
- El checkpoint es un punto de comparación de presupuesto fijo, no el endpoint más reciente ni una reivindicación de mejor rendimiento universal.
- La cabeza auxiliar XYZ tenía `xyz_lambda=0` y no es un decodificador de localización entrenado.
- Licencia no especificada para los pesos fine-tuned; la inicialización upstream conserva sus términos aplicables. Riesgo legal para uso comercial no evaluado.
- La validación reportada comprueba mecánica de exportación, no rendimiento científico; los resultados del paper dependen de decodificador, cohorte, agregación y postprocesado.
- Riesgo de alucinación y sesgos: no aplica en el sentido lingüístico, pero las representaciones pueden heredar sesgos del dataset IBL (cohorte, cepas, tareas y condiciones experimentales concretas) y no generalizar a otras especies, regiones cerebrales o protocolos de registro.
- El código de investigación está en GitHub con acceso posiblemente restringido, lo que limita la reproducibilidad independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Shubhronyu/LFPformer-large-ChanDistc-35k
- Perfil del autor: https://huggingface.co/Shubhronyu
- Modelo base: https://huggingface.co/facebook/wav2vec2-large
- Código de investigación LFPformer: https://github.com/neuroinfolab/LFPformer (acceso posiblemente restringido; commit `139b8d90054aa99608d77ba89832050b6eb3cf3b`)
- Paper NeurIPS 2026: no disponible en la informacion proporcionada.
