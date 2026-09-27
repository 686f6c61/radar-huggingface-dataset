# PierreGtch/eeg-fm-masking_mae_rone_L33

## Resumen

`eeg-fm-masking_mae_rone_L33` es un codificador de electroencefalograma (EEG) preentrenado de tipo foundation model, desarrollado por PierreGtch como parte de un estudio controlado sobre geometrías de enmascaramiento recogido en el artículo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. El modelo es uno de los 58 codificadores entrenados con una receta idéntica en la que únicamente varía la geometría de la máscara: 5 radios espaciales por 6 longitudes temporales por 2 marcos de trabajo (MAE y JEPA). En concreto, esta variante usa un radio espacial de un único canal y una longitud temporal de 33 parches.

Se trata de un autoencoder enmascarado (MAE): el codificador procesa únicamente los parches visibles y un decodificador ligero reconstruye la señal cruda de los parches enmascarados. El repositorio publica exclusivamente el codificador (12.692.096 parámetros, tokenizador de parches más transformer), que es exactamente el conjunto de tensores empleado en la evaluación downstream del artículo. El modelo está pensado para extracción de características y ajuste fino en tareas de EEG, no para generación de lenguaje natural.

Su relevancia radica en que forma parte de una comparativa sistemática y reproducible sobre qué geometría de enmascaramiento funciona mejor en EEG, un campo donde las decisiones de diseño se justifican con poca frecuencia de forma empírica. Los autores recomiendan, como resultado del estudio, la configuración r = 9 cm y L = 2, disponible en los modelos hermanos `eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`. Este checkpoint concreto (r = un canal, L = 33) no es la variante óptima, sino una celda de la matriz experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches y autoencoder enmascarado (MAE) |
| Parametros totales | 12.692.096 (solo codificador) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable en el sentido de ventana de tokens; entrada segmentada en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | no aplicable (modelo de senales EEG; no procesa lenguaje natural) |
| Licencia | CC-BY-4.0 para los pesos; MIT para el codigo |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `metadata.json` |
| Frecuencia de muestreo | 200 Hz |
| Unidades de entrada | voltios (escalado interno factor 1e+06 y `median_std_clip` con recorte en sigma = 15) |
| Posiciones de canal | metros (formato MNE `info["chs"][i]["loc"][:3]`) |
| Montaje | agnostico (cualquier numero y conjunto de canales con posicion 3D) |
| Framework | MAE |
| Radio espacial de mascara (r) | un canal |
| Longitud temporal de mascara (L) | 33 parches |
| Parametro del enmascarador (`pct_unmasked`) | 0.45 |
| Checkpoint | epoca 10 de 10 (v9, el evaluado en el articulo) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura combina un tokenizador de parches (`feature_encoder.*`) que divide la senal en ventanas de 1 segundo (200 muestras a 200 Hz, con solapamiento de 20 muestras) y un transformer (`model.*`) que procesa los parches no enmascarados. El prefijo de enmascaramiento se aplica con radio espacial de un canal y longitud temporal de 33 parches, dejando visible el 45 % del contenido (`pct_unmasked = 0.45`). Un decodificador ligero reconstruye la senal cruda de los parches ocultos durante el preentrenamiento; ese decodificador no se incluye en el repositorio, que solo distribuye el codificador.

El preentrenamiento emplea el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos puedan redistribuirse. El calendario fue de 10 epocas sobre 2 GPU H100, con tamano de lote de 600 por GPU, tasa de aprendizaje de 0,00024 (calentamiento de 3080 pasos y valor final de 1e-06) y decaimiento de pesos de 0,01. El wrapper de inferencia aplica por si mismo el escalado de entrada: multiplica por 1e+06 y aplica un `median_std_clip` por ventana con recorte en sigma = 15, por lo que no debe estandarizarse la senal previamente. La identificacion del entrenamiento esta disponible en Weights & Biases con el identificador `wl8bkq9x`.

## Capacidades

- Extraccion de caracteristicas contextuales de senales EEG en formato de embeddings por parche, listos para sondas lineales (ridge) o ajuste fino.
- Clasificacion de tareas EEG diversas con el codificador congelado: se han publicado resultados en 12 conjuntos de datos de OpenEEGBench.
- Procesamiento de montajes arbitrarios: el modelo es agnostico al montaje y admite cualquier numero y conjunto de canales siempre que cada uno tenga una posicion 3D en metros.
- Manejo de senales a 200 Hz con unidades en voltios y escalado interno automatico.
- Soporte de reconstruccion de senal enmascarada durante el preentrenamiento (el decodificador MAE no se distribuye en este repositorio).
- Integracion con OpenEEGBench mediante la clase `PretrainedBackbone`, con `model_kwargs` tomados del `config.json`.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni generacion de texto: es un codificador unimodal de biosenales.

## Casos de uso

- Monitorizacion de sueno: el modelo alcanza 0,674 de exactitud balanceada en `isruc-sleep` con codificador congelado, por lo que puede usarse para clasificar fases de sueno extrayendo embeddings y entrenando una sonda ligera sobre ellos.
- Deteccion de crisis epilepticas: con 0,852 en `chbmit` y 0,793 en `tuab` (deteccion de anomalias), sirve como extractor de caracteristicas en pipelines de triaje clinico o vigilancia continua en unidades de cuidados intensivos.
- Clasificacion de eventos anormales: los 0,911 de exactitud balanceada en `tuev` lo hacen util para etiquetar segmentos EEG con eventos patologicos en conjuntos de datos tipo TUH.
- Investigacion en depresion: el rendimiento de 0,816 en `mdd_mumtaz2016` permite usarlo como base para estudios de biomarcadores electrofisiologicos de depresion mayor.
- Interfaces cerebro-computador: con 0,416 en `bcic2a` (imagineria motora) y 0,270 en `bcic2020-3`, puede emplearse como punto de partida para decodificacion de intencion motora, aceptando senales de cualquier montaje.
- Carga cognitiva y tareas aritmeticas: los 0,721 en `arithmetic_zyma2019` lo hacen adecuado para experimentos de deteccion de carga de trabajo mental o monitorizacion neuroergonomica.
- Preentrenamiento y transferencia en regimen de pocas etiquetas: al ser un codificador congelado con sonda ridge, es apropiado para dominios clinicos donde las anotaciones son escasas, reutilizando los embeddings sin reentrenar el backbone.
- Generacion de embeddings para agrupamiento y exploracion: util para segmentar registros largos, buscar patrones similares o construir espacios latentes de senales EEG en proyectos de investigacion.
- Comparativa metodologica: al pertenecer a una matriz de 58 modelos con receta identica, sirve como linea base controlada en estudios sobre geometria de enmascaramiento en EEG.

## Benchmarks y rendimiento

Resultados publicados en la model card para OpenEEGBench con codificador congelado y sonda ridge sobre caracteristicas contextuales aplanadas, 12 conjuntos de datos y 5 semillas. La metrica es exactitud balanceada, salvo en `seed-vig`, donde se reporta R².

| Conjunto de datos | Metrica | Puntuacion (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,721 ± 0,012 | 5 |
| bcic2020-3 | exactitud balanceada | 0,270 ± 0,018 | 5 |
| bcic2a | exactitud balanceada | 0,416 ± 0,005 | 5 |
| chbmit | exactitud balanceada | 0,852 ± 0,038 | 5 |
| faced | exactitud balanceada | 0,288 ± 0,005 | 5 |
| isruc-sleep | exactitud balanceada | 0,674 ± 0,004 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,816 ± 0,022 | 5 |
| physionet | exactitud balanceada | 0,561 ± 0,004 | 5 |
| seed-v | exactitud balanceada | 0,295 ± 0,001 | 5 |
| seed-vig | R² | -0,152 ± 0,006 | 5 |
| tuab | exactitud balanceada | 0,793 ± 0,013 | 5 |
| tuev | exactitud balanceada | 0,911 ± 0,022 | 5 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos de la misma categoria; los autores remiten a la variante recomendada (r = 9 cm, L = 2) como la de mejor comportamiento en el estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 12,69 M de parametros, el peso en fp32 ocupa aproximadamente 51 MB y en fp16 unos 25 MB. La VRAM total depende del tamano de lote y de la longitud de la ventana de entrada, pero el modelo en si es muy ligero.
- GPU recomendadas: entrenamiento con 2 × H100 segun la receta publicada. Para inferencia basta cualquier GPU moderna, incluida una GTX 1650 o superior, e incluso es viable en CPU para lotes pequenos.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual (RTX 3060, 4060, 4090 y equivalentes), y es probable que quepa en iGPU recientes para lotes reducidos.
- Opciones de despliegue: PyTorch nativo a traves del wrapper `ContextualEncoderBenchmarkWrapper`, o como backbone de OpenEEGBench mediante `PretrainedBackbone`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eeg-fm-masking_mae_rone_L33` (este) | 12,69 M (codificador) | Parches de 1 s a 200 Hz, mascara r = un canal, L = 33 | Ver tabla de benchmarks | CC-BY-4.0 (pesos), MIT (codigo) | HuggingFace, 0 descargas |
| `eeg-fm-masking_mae_r9cm_L2` | no disponible en la informacion proporcionada | Parches de 1 s a 200 Hz, mascara r = 9 cm, L = 2 | no disponible | CC-BY-4.0 | HuggingFace |
| `eeg-fm-masking_jepa_r9cm_L2` | no disponible en la informacion proporcionada | Parches de 1 s a 200 Hz, marco JEPA, r = 9 cm, L = 2 | no disponible | CC-BY-4.0 | HuggingFace |
| Otros foundation models de EEG (por ejemplo LaBraM, BIOT, EEGPT) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada. Los unicos modelos directamente comparables en igualdad de receta son los otros 57 encoders de la coleccion `eeg-fm-masking`, entre los que el articulo identifica como recomendada la configuracion r = 9 cm, L = 2.

## Limitaciones y advertencias

- Este checkpoint no es la configuracion recomendada por los autores: la celda r = un canal y L = 33 se incluye como parte de la matriz experimental, y el articulo recomienda r = 9 cm y L = 2.
- El repositorio solo contiene el codificador. El decodificador MAE no se distribuye, por lo que no es posible reproducir la tarea de reconstruccion de senal con estos pesos.
- `strict=False` al cargar el `state_dict` deja fuera la memoria de posiciones de canal y la cabeza de clasificacion, que dependen del conjunto de datos; es necesario aportar `chs_info` correctamente.
- Dependencia estricta del preprocesado: la entrada debe estar a 200 Hz y en voltios, con posiciones de canal en metros. Cambiar la frecuencia de muestreo o estandarizar previamente la senal invalida el comportamiento esperado.
- El modelo es agnostico al montaje, pero requiere que todos los canales tengan una posicion 3D; los canales sin posicion no pueden procesarse.
- Rendimiento desigual entre tareas: los resultados van de 0,270 en `bcic2020-3` a 0,911 en `tuev`. En `seed-vig` el R² es negativo (-0,152), lo que indica que el codificador congelado no captura la varianza objetivo en esa tarea.
- El corpus de preentrenamiento es un subconjunto con licencia abierta de REVE (323 grabaciones), con la diversidad demografica y clinica que ello implica; no se documentan analisis de sesgo en la informacion disponible.
- Riesgo de alucinacion no aplicable: no es un modelo generativo de lenguaje y no produce texto.
- Uso clinico: los resultados son de investigacion con codificador congelado y sonda ridge; no hay validacion regulatoria ni marcado sanitario. No debe usarse para diagnostico sin validacion independiente.
- Restricciones de licencia: los pesos son CC-BY-4.0, lo que permite uso comercial con atribucion, pero obliga a citar el articulo y a mantener la atribucion. El codigo es MIT.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de adopcion ni de mantenimiento por parte de terceros.
- No hay soporte de cuantizacion publicado ni variantes GGUF/ONNX, lo que limita su uso en entornos con toolchains de inferencia especializados.

## Enlaces

- HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_rone_L33
- Variante recomendada MAE (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Coleccion completa (58 modelos): https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Codigo fuente (MIT): https://github.com/PierreGtch/eeg-fm-masking
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/wl8bkq9x
- Referencia del articulo: disponible en la pagina de GitHub del proyecto (no se ha facilitado DOI en la informacion disponible)
