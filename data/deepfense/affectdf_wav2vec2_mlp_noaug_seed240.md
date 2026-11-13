# DeepFense/AffectDF_Wav2Vec2_MLP_NoAug_Seed240

## Resumen

AffectDF_Wav2Vec2_MLP_NoAug_Seed240 es un detector binario de deepfakes de audio desarrollado por DeepFense, entrenado específicamente sobre el split de entrenamiento oficial del dataset AffectDF. Forma parte de una familia de tres semillas (2, 42 y 240) y no es un ensemble: cada checkpoint se selecciona de forma independiente mediante EER de validación. El modelo resuelve la tarea de clasificar audio como spoof (0) o bonafide (1), un problema central en la verificación de locutor y la detección de speech sintético.

Arquitectónicamente es un sistema de dos etapas: un frontend congelado XLS-R-300M (familia wav2vec2 de fairseq) que extrae representaciones del audio a 16 kHz, y un backend MLP con proyección [256, 128] y layer normalization. El frontend no se entrena, lo que reduce coste computacional y estabiliza el entrenamiento, pero limita la adaptación al dominio de detección. El prefijo de audio se recorta o rellena por repetición a 64.600 muestras y no se aplica augmentación durante el entrenamiento.

El interés del modelo es fundamentalmente metodológico: documenta con rigor el protocolo de selección de checkpoint, la separación entre EER de validación y EER de test, y las dos definiciones de score (logit bonafide frente a diferencia de logits) que no deben mezclarse. Sus resultados en test son modestos (EER ~26,8 % en InTheWild y ~30,8 % en ASV19), lo que lo sitúa como una referencia de receta congelada más que como un detector de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend XLS-R-300M (wav2vec2, congelado) + backend MLP con proyección [256, 128] y layer norm |
| Parametros totales | No disponible (el repo pesa 1,3 GB; el frontend XLS-R-300M aporta ~300 M, el total exacto no se detalla) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de audio fija de 64.600 muestras a 16 kHz (~4,04 s) con recorte de prefijo o padding por repetición |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible para los pesos; el código DeepFense es Apache-2.0 y el dataset AffectDF retiene CC BY-NC 4.0 |
| Formato de pesos | `best_model.pth` (diccionario PyTorch de DeepFense con `model_state`, estado del optimizador y metadatos); no es un modelo `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

El modelo sigue un diseño de dos bloques. El frontend es fairseq XLS-R-300M, un transformer wav2vec2 preentrenado en habla multilingüe, que se mantiene congelado durante todo el entrenamiento. El backend es un MLP que recibe las representaciones del frontend y produce dos logits (spoof y bonafide). La configuración resuelta del entrenamiento se guarda en `config.original.yaml` y la versión portable en `config.yaml`; la configuración guardada es la autoridad sobre la arquitectura. El modelo se entrenó sin augmentación de datos y con selección de checkpoint por EER de validación (8,9669 %).

El checkpoint incluye el estado completo del modelo, el optimizador y metadatos de entrenamiento. Para reproducir la inferencia es necesario construir el modelo con el inicializador original XLS-R-300M (ruta `model.frontend.args.ckpt_path`), tras lo cual se restauran los pesos del frontend desde `best_model.pth`; el autor advierte explícitamente de no sustituir el encoder por un Wav2Vec2 pequeño. El framework de referencia es DeepFense en el commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`, con PyTorch 2.4.1+cu121 en el entorno evaluado. El autor señala además que los modelos ASV19 publicados de DeepFense fine-tunean el frontend SSL y usan 64.000 muestras, por lo que las comparaciones son entre recetas, no una ablación controlada del congelado del frontend.

## Capacidades

- Clasificación binaria de audio: distingue entre audio spoof (sintético o manipulado) y bonafide (habla genuina).
- Detección de deepfakes de voz sobre audio de 16 kHz con ventana fija de ~4,04 s.
- Extracción de representaciones mediante XLS-R-300M congelado, reutilizable como frontend en pipelines de detección.
- Evaluación con dos definiciones de score: logit bonafide (score actual del framework) y diferencia de logits (`logit_bonafide - logit_spoof`).
- Soporte de evaluación a gran escala: los resultados reportados cubren particiones completas de test (31.779 utterances en InTheWild y 71.237 en ASV19) sin submuestreo.
- No soporta tool calling, function calling, agentes, visión, audio de entrada multimodal ni modo thinking; es un clasificador de audio puro.
- Capacidad multilingüe: no disponible; la model card declara únicamente inglés.

## Casos de uso

- Investigación en detección de deepfakes de voz: el modelo sirve como receta de referencia con frontend congelado para comparar contra variantes con fine-tuning del encoder SSL, gracias a la separación documentada entre EER de validación y de test.
- Reproducción de experimentos: el repositorio incluye `config.original.yaml`, `config.yaml`, `provenance.json`, `SHA256SUMS` y `metrics.json`, lo que permite reconstruir el pipeline de entrenamiento y verificar la integridad de los pesos.
- Auditoría de sistemas de verificación de locutor: los resultados en ASV19 (EER ~30,8 %) permiten estimar la tasa de falsos negativos de un detector congelado frente a ataques de síntesis en ese protocolo.
- Evaluación de robustez en dominio cruzado: al estar entrenado solo en AffectDF y evaluado en InTheWild y ASV19, es útil para medir la degradación de un frontend congelado fuera de su distribución de entrenamiento.
- Línea base en estudios comparativos: su EER de validación (8,9669 %) y sus métricas de test completas (AUC, accuracy, balanced accuracy, macro F1 en `metrics.json`) lo convierten en una referencia reproducible para nuevas recetas.
- Docencia y formación técnica: la model card detalla el protocolo de selección de checkpoint, el manejo de las dos definiciones de score y los requisitos de carga estricta de estado, lo que lo hace útil para enseñar buenas prácticas de evaluación en detección de audio.
- Integración en pipelines de investigación con DeepFense: el comando `test.py --config ... --checkpoint ...` permite ejecutar el modelo sobre nuevos conjuntos de test respetando el protocolo del framework.

## Benchmarks y rendimiento

| Objetivo held-out | Utterances | EER logit difference (%) | EER score actual del framework (%) |
|---|---:|---:|---:|
| InTheWild | 31.779 | 26,7944 | 26,8104 |
| ASV19 | 71.237 | 30,8371 | 31,0777 |

EER de validación (selección de checkpoint, no test): 8,9669 %. El EER se calcula con el punto DET más cercano agrupando empates; puntuaciones más altas indican mayor probabilidad de bonafide. El autor advierte que estas cifras corresponden solo a esta semilla y no se agregan entre semillas. En `metrics.json` se publican además hashes de protocolo, AUC, accuracy, balanced accuracy y macro F1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el frontend XLS-R-300M (~300 M de parámetros) más el MLP cabe holgadamente en GPUs de consumo, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no disponibles; el entorno evaluado usó PyTorch 2.4.1+cu121, sin especificar el modelo de GPU.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del frontend congelado, aunque no hay confirmación en la información proporcionada.
- Opciones de despliegue: exclusivamente el framework DeepFense (commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`) mediante `test.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un clasificador de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Frontend | EER ASV19 | Licencia |
|---|---|---|---|---|---|
| AffectDF_Wav2Vec2_MLP_NoAug_Seed240 | ~300 M (frontend) + MLP | 64.600 muestras (~4,04 s) | XLS-R-300M congelado | 30,84 (logit diff) | No disponible |
| Modelos ASV19 publicados de DeepFense | No disponible | 64.000 muestras | SSL con fine-tuning | No disponible en esta ficha | No disponible |
| AffectDF_Wav2Vec2_MLP_NoAug_Seed2 / Seed42 | ~300 M (frontend) + MLP | 64.600 muestras | XLS-R-300M congelado | No disponible en esta ficha | No disponible |

El autor advierte que la comparación con los modelos ASV19 de DeepFense es entre recetas de entrenamiento (frontend congelado frente a fine-tuneado, 64.600 frente a 64.000 muestras) y no una ablación controlada. No se dispone de datos de benchmarks de los otros dos seeds en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado en dominio cruzado: EER de ~26,8 % en InTheWild y ~30,8 % en ASV19, muy por encima del 8,97 % de validación, lo que indica una brecha considerable entre validación y test fuera de distribución.
- Frontend congelado: al no adaptarse XLS-R-300M al dominio de detección, el modelo puede ser menos discriminativo que variantes con fine-tuning del encoder SSL.
- Ventana fija de ~4,04 s: el recorte de prefijo o el padding por repetición puede descartar información relevante en audios más largos o introducir artefactos en audios más cortos.
- Sin augmentación durante el entrenamiento, lo que puede reducir la robustez frente a condiciones acústicas no vistas.
- Solo inglés declarado; el comportamiento en otros idiomas no está documentado.
- Licencia de los pesos no disponible: el código DeepFense es Apache-2.0, pero el autor no infiere una licencia de pesos a partir de la del código. El dataset AffectDF retiene CC BY-NC 4.0, lo que restringe el uso comercial de los datos de entrenamiento.
- Uso previsto exclusivamente para investigación en detección de deepfakes de audio; no se documenta validación para producción.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos positivos y negativos) en audio fuera de la distribución de AffectDF.
- No es un modelo de Transformers: requiere carga estricta de estado y el inicializador original XLS-R-300M; sustituir el encoder por uno más pequeño invalida los resultados.
- Las dos definiciones de EER (logit bonafide frente a diferencia de logits) no deben mezclarse al comparar con otros trabajos.
- Los resultados publicados corresponden solo a la semilla 240; no se agregan entre semillas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepFense/AffectDF_Wav2Vec2_MLP_NoAug_Seed240
- Dataset AffectDF: https://huggingface.co/datasets/DeepFense/AffectDF
- Repositorio DeepFense: https://github.com/Yaselley/deepfense-framework
- Commit de referencia del framework: `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`
