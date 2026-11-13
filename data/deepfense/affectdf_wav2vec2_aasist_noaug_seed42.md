# DeepFense/AffectDF_Wav2Vec2_AASIST_NoAug_Seed42

## Resumen

AffectDF_Wav2Vec2_AASIST_NoAug_Seed42 es un detector binario de audio deepfake desarrollado por DeepFense, entrenado sobre el split oficial de entrenamiento del dataset AffectDF. El modelo combina un frontend congelado XLS-R-300M (wav2vec2 de fairseq, a 16 kHz) con un backend AASIST basado en graph attention. La tarea es clasificar cada utterance como `0=spoof` o `1=bonafide`, es decir, distinguir audio sintético o manipulado de voz real.

El checkpoint corresponde a una de las tres semillas publicadas (2, 42 y 240) y no forma parte de un ensemble. La selección del checkpoint se realizó por EER de validación, que alcanzó 3,2325 %; sin embargo, el rendimiento en los conjuntos de test completos (InTheWild y ASV19) es notablemente peor, con EER en torno al 29 % y 38 % respectivamente. Esto sugiere un problema de generalización fuera del dominio de AffectDF.

El modelo está pensado exclusivamente para investigación en detección de deepfakes de audio. No es un modelo Transformers `from_pretrained`: se distribuye como un diccionario de DeepFense que incluye `model_state`, estado del optimizador y metadatos de entrenamiento, y requiere el framework DeepFense para su carga y evaluación. El repositorio ocupa 1,3 GB y no declara licencia de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend XLS-R-300M (wav2vec2, fairseq) congelado + backend AASIST (graph attention) |
| Parametros totales | no disponible (el frontend XLS-R-300M aporta ~300 M; total exacto no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; entrada de audio de 64.600 muestras a 16 kHz (~4,04 s) con recorte de prefijo o padding por repetición |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en punto flotante, `best_model.pth`) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible para los pesos; el codigo DeepFense es Apache-2.0 y el dataset AffectDF conserva CC BY-NC 4.0 |
| Formato de pesos | `.pth` (diccionario DeepFense con `model_state`, optimizador y metadatos); no compatible con `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas. El frontend es XLS-R-300M, un modelo wav2vec2 auto-supervisado de fairseq, que se mantiene completamente congelado durante el entrenamiento. El audio se procesa a 16 kHz con una longitud fija de 64.600 muestras, aplicando recorte del prefijo o padding por repetición según la duración de la utterance. No se empleó aumentación de datos (`NoAug`). El backend es AASIST, una arquitectura de graph attention diseñada específicamente para detección de spoofing de voz, que opera sobre las representaciones del frontend. Las etiquetas son `0=spoof` y `1=bonafide`.

El entrenamiento se realizó sobre el split oficial de AffectDF con la configuración resuelta en `config.original.yaml`, y la selección del checkpoint se hizo por EER de validación. El checkpoint guarda el estado completo del modelo (frontend y backend aprendidos), el estado del optimizador y metadatos de entrenamiento. La configuración portátil (`config.yaml`) mantiene la misma arquitectura pero con rutas relativas; para reconstruir el modelo es necesario apuntar `model.frontend.args.ckpt_path` al inicializador original XLS-R-300M, cuyos pesos del frontend se restauran después desde `best_model.pth`. El autor advierte explícitamente de no sustituir el encoder por un Wav2Vec2 más pequeño. El runtime evaluado usó PyTorch 2.4.1+cu121.

## Capacidades

- Clasificación binaria de audio: distingue voz real (`bonafide`) de voz sintética o manipulada (`spoof`).
- Detección de deepfakes de voz sobre utterances de aproximadamente 4 segundos a 16 kHz.
- Dos definiciones de score reportadas: logit de `bonafide` (score actual del framework con CrossEntropy) y diferencia de logits `logit_bonafide - logit_spoof`, que no deben mezclarse.
- Evaluación sobre protocolos estándar de la literatura: InTheWild y ASV19.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni razonamiento multi-step; es un clasificador de audio puro.
- Capacidad multilingüe limitada: solo inglés declarado, aunque el frontend XLS-R es multilingüe por preentrenamiento.

## Casos de uso

- Investigación en detección de deepfakes de voz: el modelo sirve como línea base reproducible con semilla fija (42) para comparar recetas de frontend congelado frente a frontend fine-tuneado en el benchmark ASV19.
- Evaluación de robustez fuera de dominio: dado el salto de EER entre validación (3,23 %) y test (29-38 %), es útil para estudiar generalización cross-dataset entre AffectDF, InTheWild y ASV19.
- Reproducción de experimentos académicos: el repositorio incluye `provenance.json`, `SHA256SUMS`, `metrics.json` y la configuración original, lo que facilita la replicación exacta con DeepFense en el commit indicado.
- Análisis de calibración de scores: permite comparar las dos definiciones de EER (logit de bonafide frente a diferencia de logits) y estudiar su impacto en curvas DET.
- Filtrado de datasets de audio: en un pipeline de curación, puede usarse como clasificador auxiliar para marcar utterances sospechosas antes de la revisión manual, siempre con supervisión humana dada su tasa de error.
- Estudio de ablaciones de aumentación: al ser la variante `NoAug`, sirve de referencia frente a recetas con aumentación para medir su efecto en la detección de spoofing.
- Componente de un sistema de verificación de locutor anti-spoofing: podría integrarse como módulo de detección en un pipeline ASV, aunque su EER actual en ASV19 (38 %) lo hace inadecuado para producción sin mejoras.

## Benchmarks y rendimiento

Resultados publicados por el autor para esta semilla (42). El EER de validación es el criterio de selección del checkpoint, no rendimiento en test.

| Conjunto de test | Utterances | EER diferencia de logits (%) | EER score actual del framework (%) |
|---|---:|---:|---:|
| InTheWild | 31.779 | 29,2833 | 29,2143 |
| ASV19 | 71.237 | 38,1520 | 38,0282 |
| Validación (selección) | no disponible | 3,2325 (EER de validación) | no disponible |

El EER se calcula con el punto DET más cercano agrupando empates; puntuaciones más altas indican mayor probabilidad de `bonafide`. `metrics.json` contiene además hashes de protocolo, AUC, accuracy, balanced accuracy y macro F1, no reproducidos aquí. El autor señala que los modelos DeepFense publicados para ASV19 fine-tunean el frontend SSL y usan 64.000 muestras, por lo que la comparación es entre recetas de entrenamiento y no una ablación controlada de congelación del frontend.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El frontend XLS-R-300M (~300 M parámetros) más el backend AASIST y el estado del optimizador en el checkpoint de 1,3 GB sugieren que la inferencia en fp32 requiere del orden de 2-3 GB de VRAM, pero el autor no publica cifras.
- GPU recomendadas: no disponibles. El runtime evaluado usó PyTorch 2.4.1+cu121 en un clúster; no se especifica el modelo de GPU.
- GPU de consumo: probablemente cabe en GPUs consumer con 8 GB o más (por el tamaño del frontend), aunque no está confirmado por el autor.
- Opciones de despliegue: exclusivamente el framework DeepFense (repositorio `Yaselley/deepfense-framework`, commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`) mediante `test.py` con `--config` y `--checkpoint`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje ni un Transformers estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER ASV19 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AffectDF_Wav2Vec2_AASIST_NoAug_Seed42 (este) | ~300 M frontend + AASIST (total no declarado) | 64.600 muestras a 16 kHz, frontend congelado | 38,03-38,15 % | no disponible (pesos); código Apache-2.0 | Hugging Face, requiere DeepFense |
| Modelos DeepFense publicados para ASV19 | no disponible | 64.000 muestras, frontend SSL fine-tuneado | no disponible en la información proporcionada | no disponible | Hugging Face (referenciados por el autor) |
| AASIST original (referencia de la literatura) | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor menciona explícitamente los modelos DeepFense publicados para ASV19 como alternativa con receta distinta (frontend fine-tuneado y 64.000 muestras), pero no aporta sus cifras de EER en la información disponible, por lo que no es posible una comparación numérica directa.

## Limitaciones y advertencias

- Generalización limitada: el EER salta de 3,23 % en validación a aproximadamente 29 % en InTheWild y 38 % en ASV19, lo que indica un fuerte sobreajuste al dominio de AffectDF.
- No es un modelo Transformers: no se puede cargar con `from_pretrained`; requiere DeepFense y un commit concreto del framework.
- Dependencia del inicializador XLS-R-300M original: hay que editar `model.frontend.args.ckpt_path`; sustituirlo por un Wav2Vec2 más pequeño rompe la construcción del modelo.
- Dos definiciones de EER (logit de bonafide frente a diferencia de logits) que no deben mezclarse al comparar resultados.
- Solo se declara inglés; el rendimiento en otros idiomas no está evaluado.
- Licencia de pesos no declarada: el autor no infiere una licencia de pesos a partir de la Apache-2.0 del código. El dataset AffectDF conserva CC BY-NC 4.0, lo que restringe el uso comercial de los datos de entrenamiento.
- Uso previsto exclusivamente de investigación; no apto para producción sin validación adicional.
- Riesgo de sesgo y alucinación no documentado por el autor; al ser un clasificador binario, el riesgo principal es la clasificación errónea sistemática en dominios no vistos.
- Una sola semilla por checkpoint: el autor no agrega scores entre semillas, por lo que este resultado no representa la varianza del método.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepFense/AffectDF_Wav2Vec2_AASIST_NoAug_Seed42
- Dataset AffectDF: https://huggingface.co/datasets/DeepFense/AffectDF
- Framework DeepFense: https://github.com/Yaselley/deepfense-framework
- Commit del framework usado: `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`
