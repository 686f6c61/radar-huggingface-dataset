# PierreGtch/eeg-fm-masking_mae_r9cm_L33

## Resumen

eeg-fm-masking_mae_r9cm_L33 es un codificador (encoder) de EEG preentrenado mediante un autoencoder enmascarado (masked autoencoder, MAE), publicado por PierreGtch dentro de un estudio controlado sobre geometrias de enmascaramiento en modelos fundacionales de EEG. El modelo no procesa texto ni imagenes: su entrada son senales electroencefalograficas muestreadas a 200 Hz, divididas en parches de 1 segundo (200 muestras con solapamiento de 20), y su salida son caracteristicas contextuales por parche. Con 12.692.096 parametros, es un modelo deliberadamente compacto orientado a extraccion de caracteristicas y ajuste fino ligero, no a generacion.

Su relevancia radica en el diseno experimental del que forma parte: es uno de los 58 encoders entrenados con una receta identica en la que solo varia la geometria de enmascaramiento (5 radios espaciales x 6 longitudes temporales x 2 frameworks, MAE y JEPA). Este checkpoint concreto corresponde a un radio espacial de mascara r = 9 cm y una longitud temporal L = 33 parches, con una fraccion de parches sin enmascarar (pct_unmasked) de 0,45. El articulo asociado recomienda, no obstante, la configuracion r = 9 cm, L = 2, por lo que esta variante debe interpretarse como parte del barrido comparativo y no como la configuracion optima declarada.

El modelo se distribuye bajo licencia CC-BY-4.0 y sus pesos son redistribuibles gracias a que se entreno unicamente sobre el subconjunto de licencia abierta del corpus REVE (323 grabaciones). El repositorio contiene exclusivamente el encoder, no el decodificador del MAE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador con tokenizador de parches (masked autoencoder, MAE) |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de parches de 1 s (200 muestras a 200 Hz, solapamiento de 20); la celda publicada usa L = 33 parches |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors) |
| Idiomas soportados | no aplica (senal EEG); no disponible |
| Licencia | CC-BY-4.0 (pesos); codigo bajo MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `metadata.json` |

Parametros adicionales del enmascaramiento:

| Parametro | Valor |
|---|---|
| Framework | MAE (masked autoencoder) |
| Radio espacial de mascara (r) | 9 cm |
| Longitud temporal de mascara (L) | 33 parches |
| pct_unmasked | 0,45 |
| Checkpoint | epoca 10 de 10 (v9, el evaluado en el articulo) |
| Frecuencia de muestreo | 200 Hz |
| Unidades de entrada | voltios (el wrapper aplica factor 1e+06 y escalado median_std_clip con recorte en sigma = 15) |
| Posiciones de canales | metros (MNE `info["chs"][i]["loc"][:3]`) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema MAE adaptado a senales EEG: un tokenizador de parches (`feature_encoder.*`) convierte fragmentos de 1 segundo en tokens, un transformer (`model.*`) procesa unicamente los parches no enmascarados y un decodificador ligero reconstruye la senal cruda de los parches ocultos. El modelo es agnostico al montaje: admite cualquier numero y conjunto de canales siempre que cada canal disponga de una posicion 3D en metros, lo que permite entrenar y desplegar sobre montajes heterogeneos sin reconfiguracion. El repositorio publica solo el encoder (los tensores cargados en la evaluacion downstream del articulo); el decodificador del MAE no se incluye.

El preentrenamiento es auto-supervisado, sin RLHF ni DPO (no son aplicables a una senal fisiologica). Se utilizo el subconjunto de licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos pudieran redistribuirse. El calendario fue de 10 epocas sobre 2 GPU H100, con batch size de 600 por GPU, learning rate 0,00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay 0,01. La innovacion tecnica del trabajo no reside en el bloque transformer, sino en el estudio sistematico de la geometria de enmascaramiento: variar r y L manteniendo constante todo lo demas permite aislar el efecto del enmascaramiento espacial y temporal sobre el rendimiento downstream.

La inferencia downstream documentada usa el encoder congelado mas una regresion ridge sobre las caracteristicas contextuales aplanadas, con 12 datasets y 5 semillas.

## Capacidades

- Extraccion de caracteristicas (feature extraction) sobre senales EEG: genera representaciones contextuales por parche a partir de ventanas de 1 s.
- Clasificacion downstream mediante sonda ligera (ridge) o ajuste fino, tal como se evalua en OpenEEGBench.
- Regresion sobre senales EEG (por ejemplo, la tarea `seed-vig`, evaluada con R²).
- Independencia de montaje: admite cualquier numero y disposicion de canales con posicion 3D conocida.
- Procesamiento a frecuencia fija de 200 Hz con parches de 200 muestras y solapamiento de 20.
- No soporta generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Clasificacion de patologias neurologicas: el modelo se usa como extractor congelado y una sonda ridge sobre las caracteristicas clasifica tareas como deteccion de anomalias en `tuab` (0,805 de balanced accuracy) o `tuev` (0,925), lo que permite prototipar pipelines de cribado sin reentrenar el encoder.
- Deteccion de crisis epilepticas: sobre el dataset `chbmit` alcanza 0,849 de balanced accuracy, adecuado para sistemas de alerta que analizan ventanas de 1 s en flujo continuo.
- Monitorizacion del sueno: en `isruc-sleep` obtiene 0,698, util para estadiaje automatico de fases del sueno a partir de EEG de noche completa.
- Analisis de carga cognitiva o tareas aritmeticas: en `arithmetic_zyma2019` registra 0,720, aprovechable en interfaces cerebro-computador experimentales.
- Investigacion en psiquiatria: en `mdd_mumtaz2016` obtiene 0,864, lo que lo hace util como base para estudios de depresion mayor con EEG en reposo.
- Evaluacion comparativa de metodos de enmascaramiento: al formar parte de una coleccion de 58 encoders con receta identica, sirve como punto de referencia reproducible para medir el impacto de la geometria de mascara en modelos fundacionales de EEG.
- Extraccion de embeddings para busqueda o agrupamiento de registros EEG: las caracteristicas por parche pueden indexarse para recuperar ventanas similares en grandes cohortes.

## Benchmarks y rendimiento

Resultados publicados en la model card para OpenEEGBench con encoder congelado y sonda ridge sobre caracteristicas contextuales aplanadas, 12 datasets y 5 semillas. Balanced accuracy para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,720 ± 0,015 | 5 |
| bcic2020-3 | balanced acc. | 0,275 ± 0,010 | 5 |
| bcic2a | balanced acc. | 0,444 ± 0,003 | 5 |
| chbmit | balanced acc. | 0,849 ± 0,028 | 5 |
| faced | balanced acc. | 0,314 ± 0,004 | 5 |
| isruc-sleep | balanced acc. | 0,698 ± 0,003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,864 ± 0,007 | 5 |
| physionet | balanced acc. | 0,568 ± 0,007 | 5 |
| seed-v | balanced acc. | 0,289 ± 0,001 | 5 |
| seed-vig | R² | -0,129 ± 0,002 | 5 |
| tuab | balanced acc. | 0,805 ± 0,014 | 5 |
| tuev | balanced acc. | 0,925 ± 0,026 | 5 |

No se dispone de comparaciones numericas con otros modelos fundacionales de EEG en la informacion proporcionada.

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma oficial; con 12,69 M de parametros, los pesos ocupan aproximadamente 50 MB en fp32 y 25 MB en fp16, de modo que la huella de pesos es trivial frente a la memoria necesaria para activaciones y lotes.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU moderna es sobrada. El entrenamiento original uso 2 x H100 con batch de 600 por GPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (RTX 3060, 4090, etc.) e incluso en CPU para inferencia puntual, dado el tamano del modelo.
- Opciones de despliegue: el autor documenta carga mediante `safetensors` y el wrapper `ContextualEncoderBenchmarkWrapper`, e integracion con OpenEEGBench mediante `PretrainedBackbone`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con los propios hermanos de la coleccion, entrenados con receta identica y variando unicamente la geometria de mascara. No se dispone de datos de specs ni de rendimiento de otras familias de modelos fundacionales de EEG.

| Modelo | Framework | Radio r | Longitud L | pct_unmasked | Parametros | Licencia |
|---|---|---|---|---|---|---|
| eeg-fm-masking_mae_r9cm_L33 (este) | MAE | 9 cm | 33 | 0,45 | 12,69 M | CC-BY-4.0 |
| eeg-fm-masking_mae_r9cm_L2 (recomendado en el articulo) | MAE | 9 cm | 2 | no disponible | no disponible | CC-BY-4.0 |
| eeg-fm-masking_jepa_r9cm_L2 (recomendado en el articulo) | JEPA | 9 cm | 2 | no disponible | no disponible | CC-BY-4.0 |

La coleccion completa incluye 58 encoders con la misma receta; los resultados comparativos detallados entre ellos se encuentran en el articulo y en la web del proyecto.

## Limitaciones y advertencias

- Frecuencia de muestreo fija de 200 Hz: la senal debe remuestrearse antes de usarse y el wrapper espera unidades en voltios sin estandarizacion previa, aplicando el mismo `factor = 1e+06` y el escalado `median_std_clip` con recorte en sigma = 15.
- Todos los canales deben tener posicion 3D en metros; sin ella el modelo no puede construir la representacion espacial.
- No es un modelo generativo ni de lenguaje: no admite prompts, tool calling, agentes ni razonamiento multi-paso.
- Este checkpoint concreto (r = 9 cm, L = 33) no es la configuracion recomendada por el articulo, que propone L = 2; el rendimiento puede ser inferior al de las variantes recomendadas en tareas concretas.
- Varios resultados downstream son bajos en terminos absolutos: `bcic2020-3` (0,275), `faced` (0,314) y `seed-v` (0,289) quedan cerca de niveles propios de clasificadores debiles, y `seed-vig` presenta un R² negativo (-0,129), lo que indica que la sonda no explica la varianza de esa tarea.
- Los resultados publicados proceden de un encoder congelado con sonda ridge; el rendimiento tras ajuste fino completo no esta documentado en la informacion disponible.
- Riesgo de generalizacion limitada por el corpus: el preentrenamiento uso solo el subconjunto abierto de REVE (323 grabaciones), lo que puede sesgar las representaciones hacia los montajes y poblaciones presentes en ese corpus.
- Sesgos demograficos, clinicos o de equipamiento: no disponibles.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; el codigo asociado esta bajo MIT. Es necesario citar el articulo si se utilizan los modelos.

## Enlaces

- HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L33
- Web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Codigo en GitHub: https://github.com/PierreGtch/eeg-fm-masking
- Coleccion completa (58 modelos): https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada MAE (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/kqa3qhu7
- OpenEEGBench (framework de evaluacion referenciado): disponible a traves del codigo del proyecto
