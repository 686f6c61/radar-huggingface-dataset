# PierreGtch/eeg-fm-masking_jepa_rone_L4

## Resumen

eeg-fm-masking_jepa_rone_L4 es un codificador de electroencefalograma (EEG) preentrenado mediante aprendizaje autosupervisado, publicado por PierreGtch como parte de un estudio controlado sobre geometrias de enmascaramiento en modelos fundacionales de EEG. Forma parte de una familia de 58 codificadores entrenados con una receta identica en la que solo cambia la geometria de la mascara: 5 radios espaciales, 6 longitudes temporales y 2 marcos de entrenamiento (MAE y JEPA). Este modelo concreto corresponde a la variante JEPA con radio espacial de un canal (r = one) y longitud temporal de 4 parches (L = 4).

El modelo resuelve el problema de disponer de representaciones genericas de senales EEG reutilizables en tareas downstream (clasificacion de sueno, deteccion de crisis epilepticas, interfaces cerebro-computador, etc.) con muy pocas etiquetas. Con 12,69 millones de parametros, esta pensado para funcionar como extractor de caracteristicas congelado seguido de una sonda lineal o ridge, o bien para fine-tuning ligero. El checkpoint publicado contiene unicamente el codificador (tokenizador de parches y transformer); el predictor JEPA y el profesor EMA no se distribuyen.

El interes actual radica en su papel dentro de una evaluacion controlada y reproducible: al compartir datos, hiperparametros y esquema de entrenamiento con los otros 57 modelos, permite aislar el efecto de la geometria de enmascaramiento sobre el rendimiento downstream. La evaluacion se realiza con OpenEEGBench sobre 12 conjuntos de datos. Cabe senalar que la propia publicacion recomienda otras dos variantes (r = 9 cm, L = 2), no esta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches; marco JEPA (joint-embedding predictive architecture) durante el preentrenamiento. Para inferencia solo se publica el codificador |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como numero de tokens. La senal se divide en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras); la ventana efectiva depende de n_times en tiempo de ejecucion. La mascara de este modelo tiene longitud temporal L = 4 parches y radio espacial r = un canal |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors, sin versiones cuantizadas) |
| Idiomas soportados | No aplica (modelo de senales EEG, no de lenguaje natural) |
| Licencia | CC-BY-4.0 (pesos); codigo bajo MIT |
| Formato de pesos | safetensors (`model.safetensors`, solo codificador) |

## Arquitectura y entrenamiento

La arquitectura combina un tokenizador de parches (`feature_encoder.*`), que convierte la senal EEG en una secuencia de tokens a partir de ventanas de 1 s (200 muestras) con un solapamiento de 20 muestras a una frecuencia de muestreo de 200 Hz, y un transformer (`model.*`) que procesa dicha secuencia. El preentrenamiento sigue el marco JEPA: un predictor proyecta el contexto codificado hacia los embeddings que un profesor EMA genera para los parches enmascarados, sin emplear regularizador de varianza/covarianza. El modelo es agnostico al montaje: admite cualquier numero y conjunto de canales siempre que cada canal disponga de una posicion 3D en metros.

Los datos de preentrenamiento provienen del subconjunto con licencia abierta del corpus REVE (323 registros), elegido para que los pesos puedan redistribuirse. El entrenamiento consta de 10 epocas sobre 2 GPU H100, con batch size de 600 por GPU, tasa de aprendizaje 0,00024 (calentamiento de 3.080 pasos, valor final 1e-06) y weight decay 0,01. La configuracion concreta de esta variante es r = un canal, L = 4 parches y `pct_unmasked` = 0,45; el checkpoint publicado es la epoca 10 de 10 (version `v9`, la evaluada en el articulo). La innovacion tecnica del trabajo no reside en un mecanismo aislado, sino en el diseno experimental: 58 codificadores bajo receta identica que permiten comparar geometrias de enmascaramiento de forma controlada. El articulo concluye que la configuracion recomendada es r = 9 cm, L = 2.

## Capacidades

- Extraccion de caracteristicas (feature extraction) de senales EEG en formato de vectores contextuales, apta para sondas downstream.
- Clasificacion de senales EEG mediante fine-tuning o congelando el codificador y entrenando una sonda lineal/ridge.
- Procesamiento de senales multicanal sin restriccion de montaje, siempre que cada canal tenga posicion 3D.
- Regresion continua (por ejemplo, la tarea `seed-vig` se evalua con R²).
- Aprendizaje con pocas etiquetas: el codificador congelado ya ofrece representaciones utiles.
- Adaptacion a distintas tareas fisiologicas (sueno, crisis, eventos, estados cognitivos) sin cambios en la arquitectura.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No dispone de capacidades multimodales (vision, audio o texto) ni de modo de razonamiento explicito.

## Casos de uso

- Deteccion de crisis epilepticas: con el codificador congelado y una sonda de clasificacion alcanza 0,879 de balanced accuracy en el conjunto chbmit, lo que permite desplegar un detector de crisis con pocas horas de senal etiquetada.
- Clasificacion de eventos en EEG clinico: en el conjunto tuev obtiene 0,915 de balanced accuracy, adecuado para triaje automatico de eventos en registros largos.
- Deteccion de anomalias en EEG: 0,804 de balanced accuracy en tuab, util como primera etapa de cribado antes de la revision por un neurologo.
- Fase de sueno: 0,666 de balanced accuracy en isruc-sleep, aplicable a la estadificacion automatica del sueno en estudios de polisomnografia.
- Apoyo al diagnostico de depresion: 0,832 de balanced accuracy en mdd_mumtaz2016, util como senal auxiliar en estudios de trastornos del estado de animo.
- Interfaces cerebro-computador de imagineria motora: 0,423 de balanced accuracy en bcic2a, aprovechable como extractor inicial en sistemas BCI con datos limitados.
- Investigacion sobre representaciones EEG: al compartir receta con otros 57 modelos, sirve para analizar el impacto de la geometria de enmascaramiento en tareas downstream.
- Preentrenamiento base para pipelines de aprendizaje autosupervisado en neurociencia computacional, dado su bajo coste computacional y su licencia permisiva.

## Benchmarks y rendimiento

Resultados de OpenEEGBench con codificador congelado y sonda ridge sobre caracteristicas contextuales aplanadas (12 conjuntos de datos, 5 semillas). Balanced accuracy para clasificacion y R² para `seed-vig`.

| Conjunto de datos | Metrica | Puntuacion (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,692 ± 0,012 | 5 |
| bcic2020-3 | balanced acc. | 0,271 ± 0,009 | 5 |
| bcic2a | balanced acc. | 0,423 ± 0,005 | 5 |
| chbmit | balanced acc. | 0,879 ± 0,016 | 5 |
| faced | balanced acc. | 0,262 ± 0,006 | 5 |
| isruc-sleep | balanced acc. | 0,666 ± 0,003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,832 ± 0,006 | 5 |
| physionet | balanced acc. | 0,503 ± 0,011 | 5 |
| seed-v | balanced acc. | 0,316 ± 0,001 | 5 |
| seed-vig | R² | -0,362 ± 0,010 | 5 |
| tuab | balanced acc. | 0,804 ± 0,015 | 5 |
| tuev | balanced acc. | 0,915 ± 0,005 | 5 |

## Requisitos de hardware

- VRAM para inferencia: minima. Con 12,69 M de parametros, los pesos en fp32 ocupan aproximadamente 50 MB; la memoria vendra dominada por los tensores de activacion de la ventana de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente. No se requiere A100 ni H100 para inferencia; el entrenamiento original uso 2 × H100 con batch de 600 por GPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (RTX 3060, 4090, etc.) e incluso en CPU para inferencia.
- Opciones de despliegue: al ser un modelo PyTorch personalizado, se carga con `ContextualEncoderBenchmarkWrapper` del paquete `eeg_fm_masking` y con `PretrainedBackbone` de OpenEEGBench. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Todos los modelos comparables pertenecen a la misma familia de 58 codificadores entrenados con receta identica; la unica diferencia es la geometria de enmascaramiento. Los numeros concretos de los modelos alternativos no se detallan en la informacion disponible, por lo que solo se comparan los parametros de configuracion.

| Modelo | Marco | Radio espacial r | Longitud temporal L | Parametros | Licencia | Benchmarks |
|---|---|---|---|---|---|---|
| jepa_rone_L4 (este modelo) | JEPA | un canal | 4 parches | 12,69 M | CC-BY-4.0 | Tabla de OpenEEGBench arriba |
| jepa_r9cm_L2 (recomendado en el articulo) | JEPA | 9 cm | 2 parches | no disponible (misma receta) | CC-BY-4.0 | no disponible en la informacion proporcionada |
| mae_r9cm_L2 (recomendado en el articulo) | MAE | 9 cm | 2 parches | no disponible (misma receta) | CC-BY-4.0 | no disponible en la informacion proporcionada |

No se dispone de datos de comparacion con modelos fundacionales de EEG de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero el preentrenamiento se realiza sobre el subconjunto con licencia abierta de REVE (323 registros), lo que puede limitar la diversidad de poblaciones, equipos y montajes respecto al corpus completo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de sobreinterpretar representaciones en tareas para las que el modelo no ha sido validado.
- Limitacion de contexto: la ventana efectiva depende de `n_times`; el modelo procesa parches de 1 s a 200 Hz y no es un modelo de contexto largo en el sentido de los LLM.
- Limitacion de idioma: no aplica, ya que no procesa lenguaje natural.
- Requisitos de entrada estrictos: frecuencia de muestreo de 200 Hz, unidades en voltios (el wrapper aplica el factor 1e+06 y el escalado `median_std_clip` con recorte en sigma = 15) y posiciones de canal en metros. No debe estandarizarse la senal antes de pasarla al modelo.
- Pesos incompletos: el repositorio solo contiene el codificador; el predictor JEPA y el profesor EMA no se incluyen, por lo que no es posible reanudar el preentrenamiento tal cual.
- Licencia: CC-BY-4.0 permite uso comercial con atribucion, pero exige citar el articulo y el modelo; el codigo asociado esta bajo MIT.
- Rendimiento desigual: en algunos conjuntos el resultado esta cerca del azar o es negativo (`seed-vig`, R² = -0,362; `faced`, 0,262; `bcic2020-3`, 0,271), por lo que no es adecuado como solucion universal.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_rone_L4
- Variante recomendada (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Sitio web del articulo: https://pierregtch.github.io/eeg-fm-masking
- Codigo (GitHub, licencia MIT): https://github.com/PierreGtch/eeg-fm-masking
- Ejecucion de entrenamiento (Weights & Biases): https://wandb.ai/pierregtch/chan-inv-clf/runs/km089re9
