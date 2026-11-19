# ishiki-labs/ishiki-deepfake-0.5

## Resumen

Ishiki-Deepfake-0.5 es un detector de audio deepfake y anti-spoofing de pesos abiertos desarrollado por Ishiki Labs Inc. Se construye sobre el modelo preentrenado `facebook/wav2vec2-xls-r-300m` y se presenta como un clasificador binario (genuino frente a sintetico) que opera directamente sobre formas de onda de audio a 16 kHz. El modelo final cuenta con 88.375.496 parametros reales en safetensors (86.749.578 segun la model card) y un repositorio de 0,4 GB, lo que lo hace ligero para despliegue en produccion.

La propuesta tecnica del autor combina tres metodos propietarios: Weight-Space Programming (`AudioWSP`), una compresion por descomposicion SVD con preservacion de velocidad basada en transporte optimo (`OT-SVD`) que reduce los parametros un 72,5% (de 315,4M a 86,75M), y una optimizacion de un solo paso hacia delante sin retropropagacion (`FPO-1`/`OFP`). El resultado es un detector que, segun la model card, alcanza tasas de error igual (EER) muy bajas en varios corpus de referencia, con 0,1630% en ASVspoof 2019 LA y 2,1925% en ASVspoof 2021 DF.

Su relevancia actual radica en la explosion de voz sintetica de alta calidad y en la necesidad de sistemas de verificacion de locutor (ASV) robustos frente a ataques de suplantacion. El modelo se distribuye con licencia MIT, soporta cinco idiomas declarados (ingles, chino, aleman, frances y espanol) y no depende de checkpoints externos para la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (wav2vec2 XLS-R) con cabecera de clasificacion binaria; compresion OT-SVD y AudioWSP |
| Parametros totales | 88.375.496 (safetensors); 86.749.578 segun la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio de 4 s a 16 kHz, 64.600 muestras) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en, zh, de, fr, es |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, 353,6 MB) + config.json |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-xls-r-300m`, un transformer convolucional-recurrente de representacion de voz multilingue, y anade una cabecera de clasificacion para la tarea de deteccion de deepfake. La innovacion declarada por el autor es el pipeline `AudioWSP` + `OT-SVD`: el segundo comprime el modelo base de 315,4M a 86,75M parametros mediante descomposicion en valores singulares con preservacion de la velocidad, mientras que `AudioWSP` reajusta los pesos en el espacio de pesos para la tarea de anti-spoofing. El entrenamiento se describe como `FPO-1` (One-Forward-Pass Optimization), es decir, un regimen de un paso hacia delante y cero pasos hacia atras, sin que la model card detalle el numero de tokens de audio, la composicion exacta del dataset ni el uso de RLHF o DPO.

La entrada es una forma de onda de 4 segundos a 16 kHz (64.600 muestras) y la salida es una puntuacion continua donde valores mas altos indican mayor probabilidad de audio sintetico o suplantado. El modelo se evalua sobre 25 particiones y 2.078.677 ensayos, lo que sugiere un proceso de validacion amplio en corpus de referencia de la comunidad anti-spoofing (ASVspoof, DECRO, In-The-Wild, TIMIT-TTS, entre otros).

## Capacidades

- Deteccion de audio deepfake y spoofing: clasificacion binaria genuino frente a sintetico sobre formas de onda de 16 kHz.
- Anti-spoofing para sistemas de verificacion de locutor (ASV): puntuaciones de riesgo utilizables como capa de defensa.
- Procesamiento por lotes: la API `create_predictor` acepta `batch_size` configurable (32 en el ejemplo).
- Multilingue declarado: ingles, chino, aleman, frances y espanol.
- Inferencia en GPU (CUDA) sin dependencias de checkpoints externos.
- No se documentan capacidades de generacion de texto, codigo, vision, tool calling, agentes ni modo de razonamiento; es exclusivamente un clasificador de audio.

## Casos de uso

- Verificacion de identidad por voz: integrar el detector como capa previa al motor ASV para rechazar intentos de suplantacion con voz sintetica; su EER de 0,1630% en ASVspoof 2019 LA lo hace adecuado para este filtrado.
- Moderacion de contenido en plataformas de audio: puntuar automaticamente subidas de audio (podcasts, mensajes de voz, llamadas) y marcar las que superen un umbral de riesgo de sintesis.
- Proteccion de centros de atencion telefonica: analizar en tiempo real o en post-proceso las llamadas entrantes para detectar voces clonadas en intentos de fraude.
- Forense digital y verificacion periodistica: analisis por lotes de grabaciones para aportar una puntuacion objetiva de autenticidad antes de su publicacion.
- KYC y onboarding remoto: complementar la prueba de vida en procesos de alta de clientes que usan verificacion por voz.
- Investigacion en anti-spoofing: servir como baseline reproducible (licencia MIT, pesos abiertos) para comparar nuevos ataques y contramedidas sobre ASVspoof 2019/2021/5, DECRO o In-The-Wild.
- Monitorizacion de pipelines de datos de voz: detectar muestras sinteticas contaminantes en corpus de entrenamiento de modelos ASR o TTS.

## Benchmarks y rendimiento

Resultados publicados en la model card (25 particiones, 2.078.677 ensayos):

| Benchmark | Particion | Ensayos | EER (%) | ROC-AUC |
|---|---|---:|---:|---:|
| ASVspoof 2019 — Logical Access | Evaluacion oficial | 71.237 | 0,1630 | 0,999961 |
| ASVspoof 2021 — Logical Access | Evaluacion oficial | 148.176 | 1,5133 | 0,995888 |
| ASVspoof 2021 — Deepfake (DF) | Evaluacion oficial | 533.928 | 2,1925 | 0,997955 |
| In-The-Wild (ITW) | Evaluacion completa | 31.779 | 2,7158 | 0,995105 |
| DECRO (ingles + chino) | Evaluacion oficial | 37.314 | 1,4121 | 0,998002 |
| ASVspoof 5 (Track 1) | Evaluacion oficial | 680.774 | 5,8008 | 0,985688 |
| DFADD | Test oficial | 3.755 | 0,5316 | 0,999905 |
| TIMIT-TTS (Clean) | Test completo | 20.210 | 0,0278 | 0,999997 |
| TIMIT-TTS (Time-Warped DTW) | Test completo | 20.210 | 0,9277 | 0,999689 |
| TIMIT-TTS (Augmented) | Genuino original | 20.210 | 1,1729 | 0,999413 |
| MULTISpoof | Test oficial | 43.269 | 3,3215 | 0,995510 |
| Fake-or-Real (for-norm) | Test oficial | 4.634 | 4,2941 | 0,991230 |

No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-1 GB para los pesos en FP32 (353,6 MB de safetensors) mas memoria de activaciones; con `batch_size=32` y entradas de 64.600 muestras, se estima un uso de 2-4 GB en GPU. No se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se ha validado inferencia en CUDA (por ejemplo, RTX 3060/4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna con 4 GB o mas.
- Opciones de despliegue: script `inference.py` incluido en el repositorio (via `snapshot_download` + `create_predictor`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | EER ASVspoof 2019 LA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ishiki-Deepfake-0.5 | 88,4M | 4 s @ 16 kHz | 0,1630% | MIT | Hugging Face |
| AASIST | no disponible | no disponible | no disponible | no disponible | no disponible |
| RawNet2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Wav2Vec2-AASIST | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de los modelos alternativos en la informacion proporcionada; la comparativa queda limitada al modelo descrito.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre corpus mayoritariamente en ingles y chino, el rendimiento en espanol, aleman y frances puede degradarse pese a estar declarados.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos; el EER en ASVspoof 5 (5,8008%) y Fake-or-Real (4,2941%) indica margen de error apreciable en condiciones dificiles.
- Limitaciones de contexto: la entrada esta fijada a 4 segundos a 16 kHz; audios mas largos requieren troceado y agregacion de puntuaciones, lo que puede introducir artefactos en los bordes.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificacion con atribucion; conviene revisar las condiciones del modelo base `facebook/wav2vec2-xls-r-300m` (licencia Apache 2.0 en origen) por si impone requisitos adicionales.
- Caveats para produccion: el modelo es un clasificador de caja negra con metodos propietarios (`AudioWSP`, `OT-SVD`, `FPO-1`) cuya reproducibilidad no se detalla; no se han publicado curvas DET, calibracion ni umbrales recomendados. La fecha de creacion (2026-11-18) y la ausencia de descargas y likes sugieren un modelo muy reciente y sin validacion independiente de la comunidad.
- No se documentan variantes cuantizadas ni soporte para CPU, lo que limita el despliegue en entornos sin GPU.

## Enlaces

- Hugging Face: https://huggingface.co/ishiki-labs/ishiki-deepfake-0.5
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
