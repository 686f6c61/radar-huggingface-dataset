# DeepFense/EmoFake_Wav2Vec2_AASIST_NoAug_Seed42

## Resumen

EmoFake_Wav2Vec2_AASIST_NoAug_Seed42 es un detector binario de audio deepfake desarrollado por DeepFense, entrenado específicamente sobre el split de entrenamiento oficial del dataset EmoFake. El modelo combina un frontend congelado XLS-R-300M (variante multilingüe de wav2vec2 de fairseq) con un backend AASIST basado en graph attention, y se presenta como una de las tres semillas independientes (2, 42 y 240) del estudio, no como un ensemble. La semilla 42 es la que se publica en este repositorio.

El problema que aborda es la detección de voz sintética frente a voz genuina (etiquetas 0=spoof, 1=bonafide) en escenarios de habla inglesa y china, con evaluación sobre los corpus InTheWild (ITW) y ASV19. Frente a los modelos DeepFense previos que ajustaban el frontend SSL, esta variante congela el extractor XLS-R-300M y usa un recorte/relleno de prefijo de 64.600 muestras a 16 kHz, sin aumento de datos durante el entrenamiento.

La relevancia actual reside en su carácter reproducible: publica checkpoint byte-idéntico al entrenado, configuración resuelta original, configuración portable con rutas relativas, hashes SHA256 y métricas completas de validación y test. El repositorio ocupa 1,3 GB y el checkpoint no es un modelo `from_pretrained` de Transformers, sino un diccionario DeepFense con `model_state`, estado del optimizador y metadatos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend XLS-R-300M (wav2vec2, fairseq) congelado + backend AASIST (graph attention) |
| Parametros totales | No disponible (XLS-R-300M aporta ~300 M en el frontend; total no declarado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada de audio fija de 64.600 muestras a 16 kHz (~4,04 s) con recorte/relleno de prefijo |
| Tipos de cuantizacion | No disponible (checkpoint PyTorch en precisión de entrenamiento) |
| Idiomas soportados | en, zh |
| Licencia | No disponible para los pesos; el dataset EmoFake retiene CC BY-NC-ND 4.0 y el código DeepFense es Apache-2.0 |
| Formato de pesos | `best_model.pth` (checkpoint PyTorch con `model_state`, optimizer y metadatos), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas. El frontend es XLS-R-300M de fairseq, un transformer convolucional auto-supervisado multilingüe, que se mantiene congelado durante todo el entrenamiento; sus pesos se restauran desde `best_model.pth`, pero la construcción del modelo requiere el inicializador original XLS-R-300M indicado en `model.frontend.args.ckpt_path`. El audio se procesa a 16 kHz con recorte o repetición de prefijo hasta 64.600 muestras. El backend es AASIST, que opera sobre las representaciones del frontend mediante un mecanismo de graph attention para clasificar spoof frente a bonafide.

El entrenamiento se realizó exclusivamente sobre el split oficial de train de EmoFake, sin aumento de datos (NoAug), y el checkpoint se seleccionó por EER de validación. No se reporta en la información disponible el número de tokens, la composición exacta del dataset ni el uso de RLHF o DPO; se trata de un clasificador supervisado con CrossEntropy. La configuración resuelta original se conserva en `config.original.yaml` y la portable en `config.yaml`, con rutas relativas para activos, datos y salidas. El framework DeepFense debe usarse en el commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`, con el entorno PyTorch soportado (el runtime evaluado usó PyTorch 2.4.1+cu121). El autor advierte explícitamente que no debe sustituirse el encoder por un Wav2Vec2 pequeño.

## Capacidades

- Clasificación binaria de audio: distingue voz spoof (sintética) de voz bonafide (genuina) en fragmentos de audio de 16 kHz.
- Detección de deepfake de voz entrenada sobre EmoFake, con evaluación completa en InTheWild y ASV19.
- Soporte multilingüe limitado a inglés (en) y chino (zh), heredado del frontend XLS-R y del dataset.
- Frontend SSL congelado que actúa como extractor de representaciones robusto sin reentrenamiento.
- Backend AASIST con graph attention para agregar información temporal-espectral.
- Evaluación con dos definiciones de score: logit bonafide (score actual del framework) y diferencia de logits `logit_bonafide - logit_spoof`, que no deben mezclarse.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio generativo; es un clasificador de audio.

## Casos de uso

- Investigación en detección de deepfake de voz: sirve como línea base reproducible con semilla fija (42) para comparar recetas de frontend congelado frente a frontend ajustado, usando los resultados de ITW y ASV19 como referencia.
- Evaluación de sistemas de verificación de hablante: el modelo puede emplearse para medir la vulnerabilidad de pipelines ASV ante audio sintético, ya que se evalúa sobre ASV19 con 71.237 utterances.
- Filtrado de contenido en plataformas de audio: integrado como clasificador previo en un pipeline de moderación para marcar clips sospechosos de síntesis, con la cautela de que el EER en ITW ronda el 26,6 %.
- Auditoría de datasets de voz: permite etiquetar automáticamente muestras spoof/bonafide en corpus de habla inglesa y china antes de usarlos en entrenamiento de otros modelos.
- Reproducción de experimentos académicos: al publicar checkpoint byte-idéntico, configuración resuelta y hashes SHA256, facilita la replicación exacta de resultados en entornos con el framework DeepFense.
- Análisis de robustez entre dominios: al comparar el EER en ITW (26,6 %) frente a ASV19 (13,6 %) se puede estudiar la degradación del detector ante distintos tipos de ataque y condiciones de grabación.
- Detección en entornos de habla china e inglesa: el frontend XLS-R multilingüe y las etiquetas en/zh permiten desplegarlo en escenarios bilingües concretos, siempre con validación previa en el dominio objetivo.

## Benchmarks y rendimiento

Resultados publicados por el autor para esta semilla (42), sobre los conjuntos de test completos y sin reentrenamiento ni submuestreo:

| Objetivo held-out | Utterances | EER logit difference (%) | EER score actual del framework (%) |
|---|---:|---:|---:|
| InTheWild | 31.779 | 26,6246 | 26,7002 |
| ASV19 | 71.237 | 13,6227 | 13,4328 |

El EER de validación reportado es 0,0000 %, pero el autor aclara que corresponde a la selección del checkpoint y no al rendimiento en test. El archivo `metrics.json` contiene hashes de protocolo, AUC, accuracy, balanced accuracy y macro F1, no reproducidos en esta ficha. No se han publicado en la información disponible resultados comparativos con otros modelos en una tabla de benchmarks estándar (MMLU, HumanEval, GSM8K no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 1,3 GB y el frontend XLS-R-300M más el backend AASIST sugieren un consumo moderado, pero no se publica una cifra oficial.
- GPU recomendadas: no disponible; el runtime evaluado usó PyTorch 2.4.1+cu121 en un clúster, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño del checkpoint es plausible, pero requiere verificación empírica.
- Opciones de despliegue: el modelo no es un `from_pretrained` de Transformers; debe ejecutarse con el framework DeepFense (commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`) mediante `python test.py --config ... --checkpoint ...`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisito adicional: es necesario editar `model.frontend.args.ckpt_path` con la ruta local al inicializador original XLS-R-300M y configurar las rutas de Parquet de train/val/test y el directorio de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER ASV19 | EER ITW | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EmoFake_Wav2Vec2_AASIST_NoAug_Seed42 | ~300 M frontend + AASIST (total no declarado) | 64.600 muestras a 16 kHz | 13,62 % (logit diff) | 26,62 % (logit diff) | Pesos: no disponible; dataset CC BY-NC-ND 4.0; código Apache-2.0 | Hugging Face, 0 descargas |
| Modelos DeepFense ASV19 publicados (frontend SSL ajustado) | No disponible | 64.000 muestras | No disponible en esta ficha | No disponible en esta ficha | No disponible | Referenciados por el autor, sin métricas reproducidas aquí |
| Otras semillas del mismo estudio (2 y 240) | Idénticos | 64.600 muestras | No disponible | No disponible | No disponible | Mismo estudio, no publicadas en este repositorio |

El autor advierte que la comparación con los modelos DeepFense de ASV19 no es una ablación controlada de congelación del frontend, sino una comparación entre recetas de entrenamiento distintas (frontend ajustado y 64.000 muestras frente a frontend congelado y 64.600 muestras).

## Limitaciones y advertencias

- El EER en InTheWild es elevado (26,62 %), lo que indica un rendimiento limitado en condiciones no vistas y un riesgo alto de falsos negativos y falsos positivos en producción.
- El EER de validación de 0,0000 % es un criterio de selección de checkpoint y no debe interpretarse como rendimiento real en test.
- El modelo está entrenado solo con el split de train de EmoFake y sin aumento de datos, por lo que puede generalizar mal fuera de la distribución de ese corpus.
- Idiomas limitados a inglés y chino; no se documenta comportamiento en otras lenguas.
- No es un modelo de Transformers: requiere el framework DeepFense y el inicializador original XLS-R-300M; no funciona con `from_pretrained` ni con herramientas estándar de despliegue.
- Las dos definiciones de score (logit bonafide y diferencia de logits) producen EER distintos y no deben mezclarse en evaluaciones.
- Licencia de los pesos no disponible; el dataset EmoFake retiene CC BY-NC-ND 4.0, lo que restringe el uso comercial de los datos, y el autor no infiere una licencia de pesos a partir de la licencia Apache-2.0 del código.
- Uso previsto exclusivamente para investigación en detección de audio deepfake; no se documentan garantías para uso comercial ni para decisiones automatizadas de alto impacto.
- Riesgo de sesgo heredado del dataset EmoFake y del frontend XLS-R, no cuantificado en la información disponible.
- No se publican cifras de latencia, throughput ni requisitos de VRAM, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepFense/EmoFake_Wav2Vec2_AASIST_NoAug_Seed42
- Dataset EmoFake: https://huggingface.co/datasets/DeepFense/EmoFake
- Framework DeepFense: https://github.com/Yaselley/deepfense-framework (commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
