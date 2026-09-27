# PierreGtch/eeg-fm-masking_mae_r9cm_L4

## Resumen

eeg-fm-masking_mae_r9cm_L4 es un encoder de electroencefalografía (EEG) preentrenado, publicado por PierreGtch, que forma parte de una familia de 58 encoders entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento. Se trata de un modelo de extracción de características (pipeline `feature-extraction`) construido como autoencoder enmascarado (MAE): el encoder ve los parches no enmascarados y un decodificador ligero reconstruye la señal cruda de los parches enmascarados. El checkpoint publicado contiene únicamente el encoder, con 12.692.096 parámetros (12,69 M).

El modelo procede del trabajo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*, cuyo objetivo es aislar el efecto de la geometría de enmascaramiento sobre la calidad de las representaciones aprendidas. En esta variante concreta, el radio espacial de enmascaramiento es r = 9 cm y la longitud temporal es L = 4 parches, con un parámetro de enmascaramiento `pct_unmasked` de 0,45. El artículo recomienda la configuración r = 9 cm, L = 2, por lo que este checkpoint debe entenderse como una de las variantes del barrido controlado y no como la configuración óptima señalada por los autores.

Su relevancia es doble: por un lado, ofrece un encoder EEG ligero y agnóstico al montaje (funciona con cualquier número y conjunto de canales siempre que cada uno tenga posición 3D), lo que facilita el ajuste fino en tareas downstream; por otro, sus pesos se distribuyen bajo CC-BY-4.0, algo posible porque el preentrenamiento usó únicamente el subconjunto con licencia abierta del corpus REVE (323 registros).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder enmascarado (MAE) sobre transformer; tokenizador de parches (`feature_encoder.*`) + transformer (`model.*`). El checkpoint publicado contiene solo el encoder |
| Parametros totales | 12.692.096 (12,69 M, encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como numero de tokens; la senal se corta en parches de 1 s (200 muestras a 200 Hz) con solapamiento de 20 muestras |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de senales EEG, no de texto) |
| Licencia | CC-BY-4.0 para los pesos; MIT para el codigo |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + `metadata.json` |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder enmascarado aplicado a senales EEG. Un tokenizador de parches divide la senal en fragmentos de 1 segundo (200 muestras a 200 Hz, con 20 muestras de solapamiento) y un transformer procesa los parches visibles; un decodificador ligero, no incluido en el repositorio, se encargaba de reconstruir la senal cruda de los parches enmascarados durante el preentrenamiento. El enmascaramiento se define por dos parametros geometricos: un radio espacial r = 9 cm y una longitud temporal L = 4 parches, con una fraccion de parches no enmascarados `pct_unmasked` = 0,45. El modelo es agnostico al montaje: acepta cualquier numero y disposicion de canales, siempre que cada canal tenga asociada una posicion 3D en metros (MNE `info["chs"][i]["loc"][:3]`).

El preentrenamiento utilizo el subconjunto con licencia abierta del corpus REVE (323 registros), elegido para poder redistribuir los pesos resultantes. El esquema de entrenamiento consistio en 10 epocas sobre 2 GPU H100, con tamano de lote de 600 por GPU, learning rate de 0,00024 (warm-up de 3080 pasos y valor final de 1e-06) y weight decay de 0,01. El checkpoint publicado corresponde a la epoca 10 de 10 (version `v9`, la evaluada en el articulo). La innovacion metodologica del trabajo no esta en la arquitectura, sino en el diseno experimental: 58 encoders entrenados con receta identica y un barrido de 5 radios espaciales × 6 longitudes temporales × 2 frameworks (MAE y JEPA), lo que permite atribuir las diferencias de rendimiento exclusivamente a la geometria de enmascaramiento.

## Capacidades

- Extraccion de caracteristicas (embeddings) a partir de senales EEG crudas multimontaje, sin reentrenamiento del encoder.
- Aprendizaje autosupervisado mediante reconstruccion de parches enmascarados (MAE) durante el preentrenamiento.
- Representaciones contextuales aptas para sondas lineales congeladas (por ejemplo, regresion ridge sobre caracteristicas aplanadas), tal y como se evalua en OpenEEGBench.
- Ajuste fino downstream para tareas de clasificacion y regresion sobre EEG.
- Funcionamiento agnostico al montaje: cualquier numero y conjunto de canales, siempre que cada canal tenga posicion 3D.
- Adaptacion a distintas frecuencias de muestreo mediante remuestreo previo a 200 Hz (requisito de entrada).
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No incluye capacidades de vision ni de audio.

## Casos de uso

- Clasificacion de patologias neurologicas: el encoder congelado alimenta una sonda ridge para tareas como la deteccion de anomalias en tuab (0,805 de balanced accuracy) o la clasificacion de eventos en tuev (0,920), sin necesidad de reentrenar el backbone.
- Monitorizacion de crisis epilepticas: sobre el dataset chbmit alcanza 0,857 ± 0,078 de balanced accuracy, lo que permite usarlo como extractor de caracteristicas en sistemas de alerta temprana a partir de registros EEG continuos.
- Estadificacion del sueno: con isruc-sleep obtiene 0,662 ± 0,005 de balanced accuracy, adecuado para pipelines de puntuacion automatica de fases del sueno.
- Investigacion en depresion: con mdd_mumtaz2016 logra 0,827 ± 0,011, util como base para estudios de biomarcadores electrofisiologicos.
- Interfazes cerebro-computador: en bcic2a obtiene 0,463 ± 0,019 y en bcic2020-3 0,274 ± 0,011 de balanced accuracy, lo que sirve como punto de partida para decodificacion motora tras ajuste fino.
- Analisis de carga cognitiva: sobre arithmetic_zyma2019 alcanza 0,736 ± 0,008, aplicable a experimentos de carga de trabajo mental.
- Preentrenamiento y adaptacion a dominios concretos: al ser un encoder ligero (12,69 M de parametros) con licencia CC-BY-4.0, es viable reentrenarlo o ajustarlo con datos propios de un laboratorio o de un dispositivo concreto.
- Extraccion de caracteristicas a gran escala: dado su tamano reducido, permite procesar corpus extensos de EEG para construir embeddings reutilizables en tareas posteriores.

## Benchmarks y rendimiento

Resultados downstream con encoder congelado y sonda ridge sobre caracteristicas contextuales aplanadas (12 datasets × 5 semillas; balanced accuracy para clasificacion, R² para `seed-vig`):

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,736 ± 0,008 | 5 |
| bcic2020-3 | balanced acc. | 0,274 ± 0,011 | 5 |
| bcic2a | balanced acc. | 0,463 ± 0,019 | 5 |
| chbmit | balanced acc. | 0,857 ± 0,078 | 5 |
| faced | balanced acc. | 0,319 ± 0,003 | 5 |
| isruc-sleep | balanced acc. | 0,662 ± 0,005 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,827 ± 0,011 | 5 |
| physionet | balanced acc. | 0,571 ± 0,007 | 5 |
| seed-v | balanced acc. | 0,289 ± 0,001 | 5 |
| seed-vig | R² | -0,168 ± 0,009 | 5 |
| tuab | balanced acc. | 0,805 ± 0,004 | 5 |
| tuev | balanced acc. | 0,920 ± 0,031 | 5 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos de la misma categoria, ni metricas de reconstruccion del decodificador MAE.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 50 MB en fp32 y 25 MB en fp16 para el encoder de 12,69 M de parametros, sin contar activaciones ni el tokenizador. El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente para inferencia; el entrenamiento original uso 2 × H100 con lote de 600 por GPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4090), e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: carga directa con `safetensors` y `PyTorch` a traves del wrapper `ContextualEncoderBenchmarkWrapper` del paquete `eeg-fm-masking`; integracion con `OpenEEGBench` mediante `PretrainedBackbone`. No se documentan soportes especificos para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Framework | Enmascaramiento | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r9cm_L4 (este) | MAE | r = 9 cm, L = 4 | 12,69 M (encoder) | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | r = 9 cm, L = 2 | no disponible | CC-BY-4.0 | HuggingFace (recomendado en el articulo) |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | r = 9 cm, L = 2 | no disponible | CC-BY-4.0 | HuggingFace (recomendado en el articulo) |

Los tres modelos pertenecen a la misma coleccion de 58 encoders entrenados con receta identica y solo difieren en la geometria de enmascaramiento y en el framework de preentrenamiento. No se dispone de resultados de benchmarks para las variantes L2 en la informacion proporcionada, mas alla de que el articulo las recomienda. No se han facilitado comparaciones con otros modelos fundacionales de EEG externos.

## Limitaciones y advertencias

- Este checkpoint no es la configuracion recomendada por los autores: el articulo recomienda r = 9 cm, L = 2, mientras que este modelo usa L = 4.
- Los resultados en varios datasets son cercanos al azar: bcic2020-3 (0,274), seed-v (0,289), faced (0,319) y bcic2a (0,463) indican una transferibilidad limitada en esas tareas.
- El valor de R² negativo en `seed-vig` (-0,168) sugiere que las caracteristicas no capturan la varianza objetivo en esa tarea de regresion.
- El decodificador MAE no se incluye en el repositorio, por lo que el modelo no puede usarse para reconstruccion de senal sin reentrenarlo.
- Requisitos de entrada estrictos: muestreo a 200 Hz, unidades en voltios (el wrapper aplica un factor de 1e+06 y un escalado `median_std_clip` con recorte en σ = 15) y posiciones de canal en metros. Estandarizar los datos previamente produce resultados incorrectos.
- La carga con `strict=False` deja fuera los componentes dependientes del dataset (buffer de posiciones de canal y cabeza de clasificacion), lo que exige reconstruirlos para cada uso.
- Preentrenado sobre 323 registros del subconjunto abierto de REVE, un corpus reducido; el sesgo de dominio respecto a otros montajes, poblaciones o dispositivos no esta caracterizado en la informacion disponible.
- Riesgo de sobreajuste a los datasets de evaluacion de OpenEEGBench si se selecciona la variante en funcion de esos resultados.
- Licencia CC-BY-4.0 en los pesos: permite uso comercial con atribucion, pero obliga a citar el articulo y a mantener la atribucion en trabajos derivados. El codigo se distribuye bajo MIT.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L4
- Pagina del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Codigo en GitHub: https://github.com/PierreGtch/eeg-fm-masking
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada MAE r9cm L2: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA r9cm L2: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/v78z6b50
