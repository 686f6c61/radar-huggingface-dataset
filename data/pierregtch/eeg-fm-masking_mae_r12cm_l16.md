# PierreGtch/eeg-fm-masking_mae_r12cm_L16

## Resumen

eeg-fm-masking_mae_r12cm_L16 es un codificador de electroencefalograma (EEG) preentrenado con un autoencoder enmascarado (MAE) por PierreGtch, publicado como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. El modelo forma parte de una familia de 58 codificadores entrenados con una receta idéntica en la que solo cambia la geometría del enmascaramiento: 5 radios espaciales (r) x 6 longitudes temporales (L) x 2 marcos de preentrenamiento (MAE y JEPA). Este checkpoint concreto corresponde a r = 12 cm y L = 16 parches.

Se trata de un modelo de extracción de características (pipeline `feature-extraction`), no de un modelo generativo de texto: recibe senales EEG multicanal y produce representaciones contextuales por parche que se usan como entrada a cabezas ligeras de clasificación o regresión. El codificador tiene 12.692.096 parámetros (unos 12,69 M) y el repositorio solo distribuye el encoder, no el decodificador del MAE. Su principal valor es metodológico: permite aislar el efecto de la geometría de enmascaramiento sobre el rendimiento aguas abajo manteniendo constante todo lo demás.

Es relevante ahora porque los modelos fundacionales de EEG están emergiendo como alternativa al entrenamiento supervisado por tarea, y este trabajo ofrece una evaluación controlada con 12 conjuntos de datos de OpenEEGBench. Conviene senalar que el propio artículo recomienda la configuración r = 9 cm, L = 2, por lo que este checkpoint (r = 12 cm, L = 16) es una variante de ablation y no la recomendada por los autores. El repositorio tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador sobre parches EEG (masked autoencoder, MAE); tokenizador de parches `feature_encoder.*` + transformer `model.*` |
| Parametros totales | 12.692.096 (codificador; ~12,69 M) |
| Longitud de contexto | No disponible como valor unico. Entrada en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras); el articulo indica que la celda L = 33 enmascararia la ventana completa, lo que situa la ventana de trabajo en el entorno de ~33 parches, aunque el dato no se explicita |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | No aplicable: modelo de senales EEG, no procesa texto |
| Licencia | CC-BY-4.0 (pesos); codigo del repositorio GitHub bajo MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `metadata.json` |
| Framework | PyTorch |
| Frecuencia de muestreo requerida | 200 Hz |
| Unidades de entrada | Voltios (el wrapper aplica factor 1e+06 y escalado `median_std_clip` con recorte en sigma = 15) |
| Posiciones de canales | Metros, en el formato MNE `info["chs"][i]["loc"][:3]`; agnostico al montaje |
| Parametros de enmascaramiento | radio espacial r = 12 cm; longitud temporal L = 16 parches; `pct_unmasked` = 0,45 |
| Checkpoint | Epoca 10 de 10 (`v9`, el evaluado en el articulo) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un masked autoencoder aplicado a EEG. La senal se trocea en parches de 1 segundo (200 muestras con 20 muestras de solapamiento) y un tokenizador de parches proyecta cada uno a un embedding; el transformer codificador procesa unicamente los parches no enmascarados y un decodificador ligero reconstruye la senal cruda de los parches enmascarados. El enmascaramiento es conjunto: un radio espacial r definido sobre las posiciones 3D de los electrodos (12 cm en este caso) y una longitud temporal L medida en parches (16 en este caso), dejando un 45 % de parches sin enmascarar. El repositorio publica solo el codificador, que es exactamente el conjunto de tensores cargado en la evaluacion del articulo; el decodificador de reconstruccion no se incluye. La agnosticidad al montaje se consigue condicionando el modelo en las posiciones 3D de los canales, de modo que funciona con cualquier numero y disposicion de electrodos siempre que cada canal tenga coordenadas.

Los datos de preentrenamiento son el subconjunto de licencia abierta del corpus REVE (323 grabaciones), elegido precisamente para que los pesos se puedan redistribuir. El entrenamiento consta de 10 epocas sobre 2 GPU H100 con batch de 600 por GPU, tasa de aprendizaje de 0,00024 con 3080 pasos de warm-up y valor final 1e-06, y weight decay de 0,01. El run de entrenamiento esta identificado como `nd67puc3` en Weights & Biases. No hay RLHF ni DPO, ya que no es un modelo de lenguaje. La innovacion metodologica del trabajo no esta en el modelo individual sino en el diseno experimental: 58 codificadores con receta identica y solo la geometria de enmascaramiento variando, lo que permite atribuir diferencias de rendimiento a esa variable.

## Capacidades

- Extraccion de caracteristicas EEG: genera representaciones contextuales por parche a partir de senales multicanal en voltios a 200 Hz, aptas para sondas lineales (ridge) o para fine-tuning.
- Clasificacion de patologias y estados: normal/anormal (TUAB), crisis epileptica (CHB-MIT), estadios de sueno (ISRUIC), depresion (MDD Mumtaz 2016), artefactos y eventos (TUEV).
- Regresion sobre senales: prediccion de variables continuas, como la edad en `seed-vig` (con R² negativo en la evaluacion publicada, ver la seccion de benchmarks).
- Agnosticidad de montaje: admite cualquier numero y disposicion de electrodos, siempre que cada canal tenga una posicion 3D, gracias al enmascaramiento espacial definido en centimetros.
- Preentrenamiento auto-supervisado transferible: sirve como inicializacion para tareas aguas abajo con pocos datos etiquetados.
- Compatibilidad con OpenEEGBench mediante `PretrainedBackbone`, y con el wrapper propio `ContextualEncoderBenchmarkWrapper`.
- No soporta generacion de texto, tool calling, function calling ni flujos de agentes: no es un modelo de lenguaje y no tiene interfaz de chat.
- No soporta vision, audio ni entrada multimodal distinta del EEG.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No incluye modo de razonamiento explicito ni generacion de cadenas de pensamiento.

## Casos de uso

- Deteccion de crisis epileptica en monitorizacion prolongada: el modelo alcanza 0,897 de balanced accuracy en CHB-MIT con el codificador congelado y una sonda ridge, lo que permite usarlo como extractor de caracteristicas en un pipeline de alerta en unidades de cuidados intensivos o en monitorizacion ambulatoria.
- Triaje de EEG clinico normal/anormal: con 0,778 de balanced accuracy en TUAB, puede actuar como primera etapa de cribado que priorice los registros que requieren lectura por un neurofisiologo.
- Estadificacion automatica del sueno: 0,637 de balanced accuracy en ISRUIC-sleep con un modelo de 12,69 M de parametros, adecuado para integrarse en dispositivos de seguimiento nocturno con recursos limitados.
- Apoyo al diagnostico de depresion: 0,830 de balanced accuracy en MDD Mumtaz 2016, util como senal complementaria en estudios de biomarcadores EEG de trastornos del estado de animo.
- Interfaces cerebro-computador: en BCIC2A obtiene 0,409 de balanced accuracy, suficiente como extractor base para prototipos de decodificacion motora que despues se afinan por sujeto con datos propios.
- Investigacion metodologica sobre enmascaramiento: es una de las 58 celdas del estudio controlado, por lo que sirve para reproducir el analisis de geometria de enmascaramiento y para comparar MAE frente a JEPA con todo lo demas fijo.
- Inicializacion de modelos con pocos datos: al ser un codificador agnostico de montaje y de solo 12,69 M de parametros, es una base practica para fine-tuning en cohortes pequenas o con montajes heterogeneos.
- Extraccion de caracteristicas en pipelines de neurociencia a gran escala: al caber en memoria de sobra, permite procesar corpus completos de EEG en una sola GPU y generar embeddings para analisis estadisticos posteriores.
- Reconocimiento de caras y tareas cognitivas: en FACED y en la tarea aritmetica de Zyma 2019 (0,280 y 0,672 de balanced accuracy respectivamente) el rendimiento es desigual, por lo que su uso en estas tareas requiere validacion previa en el conjunto de datos objetivo.
- Deteccion de eventos y artefactos: con 0,858 de balanced accuracy en TUEV, es util en preprocesado automatico para marcar segmentos anomales antes del analisis manual.

## Benchmarks y rendimiento

Resultados publicados por el autor en OpenEEGBench con el codificador congelado y una sonda ridge sobre las caracteristicas contextuales aplanadas, 12 conjuntos de datos x 5 semillas. Balanced accuracy para clasificacion y R² para `seed-vig`.

| Conjunto de datos | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced accuracy | 0,672 ± 0,030 | 5 |
| bcic2020-3 | balanced accuracy | 0,273 ± 0,015 | 5 |
| bcic2a | balanced accuracy | 0,409 ± 0,018 | 5 |
| chbmit | balanced accuracy | 0,897 ± 0,031 | 5 |
| faced | balanced accuracy | 0,280 ± 0,011 | 5 |
| isruc-sleep | balanced accuracy | 0,637 ± 0,002 | 5 |
| mdd_mumtaz2016 | balanced accuracy | 0,830 ± 0,002 | 5 |
| physionet | balanced accuracy | 0,546 ± 0,010 | 5 |
| seed-v | balanced accuracy | 0,277 ± 0,002 | 5 |
| seed-vig | R² | -0,303 ± 0,008 | 5 |
| tuab | balanced accuracy | 0,778 ± 0,002 | 5 |
| tuev | balanced accuracy | 0,858 ± 0,002 | 5 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos adicionales (por ejemplo MMLU, HumanEval o GSM8K), que por otra parte no aplican a un modelo de senales EEG.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 51 MB en fp32 y 25 MB en fp16/bf16, calculado a partir de los 12.692.096 parametros del codificador.
- VRAM de inferencia: depende del numero de canales, de la ventana temporal y del tamano de lote; con un modelo de este tamano es holgadamente inferior a 1 GB en la mayoria de configuraciones. No hay cifras oficiales publicadas.
- VRAM de fine-tuning: no disponible. Cabe esperar que quepa en GPU de consumo (RTX 3060/4060 con 8-12 GB) con lotes moderados, y con mas holgura en RTX 4090, A100 o H100, pero no se aportan mediciones.
- Caben en GPU de consumo: si, tanto la inferencia como, previsiblemente, el fine-tuning. El propio preentrenamiento se hizo en 2 x H100 con batch de 600 por GPU, lo que no implica necesidades de memoria en inferencia.
- Opciones de despliegue: no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue requiere PyTorch y el paquete `eeg-fm-masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`), cargando el estado con `safetensors.torch.load_file` y el wrapper `ContextualEncoderBenchmarkWrapper`, o bien mediante `open_eeg_bench.backbone.PretrainedBackbone`.
- Latencia y throughput: no disponibles.
- Nota de integracion: al cargar el `state_dict` se usa `strict=False` porque quedan fuera el buffer de posiciones de canales (dependiente del conjunto de datos) y la cabeza de clasificacion.

## Comparativa con modelos similares

La comparacion mas directa disponible son los otros dos checkpoints citados en la model card, que comparten receta y solo cambian la geometria de enmascaramiento o el marco de preentrenamiento. Para ambos, los datos no detallados se marcan como no disponibles.

| Modelo | Marco | Radio r | Longitud L | Parametros | Licencia | Notas |
|---|---|---|---|---|---|---|
| eeg-fm-masking_mae_r12cm_L16 | MAE | 12 cm | 16 parches | 12,69 M | CC-BY-4.0 | Variante de ablation; no es la configuracion recomendada por el articulo |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | No disponible | No disponible en la informacion proporcionada | Recomendado por el articulo |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | No disponible | No disponible en la informacion proporcionada | Recomendado por el articulo; los pesos publicados corresponden al codificador estudiante |

No se dispone en la informacion proporcionada de comparaciones numericas con otros modelos fundacionales de EEG de la literatura (por ejemplo LaBraM, BIOT o EEGPT), ni de sus especificaciones, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- No es la configuracion recomendada: el articulo propone r = 9 cm y L = 2; este checkpoint (r = 12 cm, L = 16) es una celda de ablation y esta pensado para el estudio comparativo, no como eleccion por defecto.
- Solo se distribuye el codificador. El decodificador del MAE no esta en el repositorio, por lo que no se puede reproducir la tarea de reconstruccion directamente con estos pesos.
- Rendimiento cercano o por debajo del azar en varias tareas: `seed-vig` obtiene un R² de -0,303, lo que significa que predice peor que un estimador trivial basado en la media; `bcic2020-3`, `faced` y `seed-v` tambien muestran valores bajos. No debe asumirse una calidad uniforme entre conjuntos de datos.
- Dependencia fuerte de la tarea y del conjunto de datos: los resultados publicados son con codificador congelado y sonda ridge; un fine-tuning completo podria cambiar el panorama, pero no hay datos al respecto.
- Requisitos de entrada estrictos: 200 Hz, parches de 1 s, unidades en voltios sin estandarizar previamente (el wrapper aplica el factor 1e+06 y el `median_std_clip`), y posiciones de canales en metros. Saltarse estos requisitos invalida las representaciones.
- Necesidad de posicion 3D por canal: aunque es agnostico al montaje, cualquier electrodo sin coordenadas tridimensionales no puede procesarse correctamente.
- Riesgo de sesgo de dominio: el preentrenamiento usa el subconjunto abierto de REVE (323 grabaciones), que no representa todas las poblaciones, edades, equipos ni patologias; el rendimiento puede degradarse fuera de esa distribucion.
- Sin datos sobre sesgos demograficos ni evaluaciones de equidad en la informacion disponible.
- Licencia CC-BY-4.0 en los pesos: permite uso comercial con atribucion, pero obliga a citar el articulo; el codigo del repositorio GitHub esta bajo MIT, una licencia distinta que conviene revisar por separado.
- Ausencia de soporte en herramientas estandar de despliegue de modelos: no hay integracion con vLLM, TGI, llama.cpp ni Ollama, lo que anade trabajo de ingenieria.
- Madurez limitada del ecosistema: 0 descargas y 0 "likes" en HuggingFace en el momento de la consulta, lo que implica poca validacion externa independiente.
- No debe usarse como herramienta diagnostica autonoma en contextos clinicos sin validacion prospectiva y supervision profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r12cm_L16
- Web del articulo: https://pierregtch.github.io/eeg-fm-masking
- Codigo (licencia MIT): https://github.com/PierreGtch/eeg-fm-masking
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada por el articulo (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada por el articulo (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Run de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/nd67puc3
- Referencia bibliografica del articulo: disponible en la pagina de GitHub del proyecto
