# redouanelg/era5-imerg-westafrica-models

## Resumen

`redouanelg/era5-imerg-westafrica-models` es un repositorio de pesos entrenados para *downscaling* estadístico de precipitación diaria sobre África Occidental, publicado por Redouane Lguensat junto a David Sagna y Samo Diatta (artículo de 2026). El problema que resuelve es la ampliación de escala espacial (de 0,25° a 0,1°, un factor 2,5×, unos 11 km) de los campos atmosféricos diarios de ERA5 hacia la precipitación observada por satélite IMERG V07 Final Run, en la estación del monzón (junio a octubre) y en el dominio 4–23° N y 18° W–16° E.

No es un modelo de lenguaje: es un conjunto de tres redes convolucionales de tipo U-Net y un generador de GAN que operan sobre tensores meteorológicos. La U-Net base tiene 29,0 M de parámetros y consume 18 campos en niveles de presión (geopotencial, temperatura, humedad específica, humedad relativa y las dos componentes del viento en 850, 700 y 500 hPa), más elevación y fracción de tierra; la variante `unet_tp` añade la precipitación diaria de ERA5 y el generador del GAN residual tiene 7,2 M de parámetros y produce ensembles de 10 miembros.

Su relevancia actual es doble: por un lado, ofrece una alternativa de *downscaling* estadístico reproducible y de coste computacional mínimo (0,3 s por día en CPU) frente a la interpolación directa de ERA5 (RMSE 10,71 mm/día) o a métodos clásicos como BCSD; por otro, publica pesos en safetensors con un módulo de inferencia autocontenido y licencia CC BY 4.0, algo poco habitual en este nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net convolucional (perfect prognosis y variante con precipitación ERA5) + generador de GAN Wasserstein residual construido sobre `unet_tp` |
| Parámetros totales | 29,0 M (`unet.safetensors`), 29,0 M (`unet_tp.safetensors`), 7,2 M (`gan_generator.safetensors`) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es un campo de 19 variables sobre una rejilla de 79 × 143 puntos de ERA5) |
| Tipos de cuantización | no disponible (no se documentan versiones cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | no aplica (modelo geoespacial, sin capacidades lingüísticas) |
| Licencia | CC BY 4.0 para pesos y tablas; MIT para `downscale.py` |
| Formato de pesos | safetensors (`unet.safetensors`, `unet_tp.safetensors`, `gan_generator.safetensors`), NPZ para el *quantile mapping* (`quantile_mapping.npz`) y módulo Python `downscale.py` |
| Resolución de entrada | 0,25° (rejilla ERA5 de 79 × 143 puntos, 3,75–23,25° N y 18,75° W–16,75° E) |
| Resolución de salida | 0,1° (unos 11 km; rejilla de 190 × 340 puntos) |
| Dominio espacial | África Occidental, 4–23° N y 18° W–16° E |
| Cobertura temporal | junio–octubre (estación del monzón) |
| Periodos de entrenamiento y evaluación | entrenamiento 2000–2018; validación 2019–2020; test 2021–2024 |
| Objetivo (target) | IMERG V07 Final Run |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El sistema se compone de tres redes. Las dos U-Net comparten la misma arquitectura convolucional de codificador-decodificador con 29,0 M de parámetros: una (`unet`) es de *perfect prognosis* y usa únicamente los 18 campos en niveles de presión, la elevación y la fracción de tierra; la otra (`unet_tp`) incorpora además la precipitación diaria de ERA5. Los predictores son medias diarias calculadas a partir de los análisis horarios de ERA5 en su rejilla nativa de 0,25°, estandarizadas con las medias y desviaciones típicas de las estaciones de entrenamiento e interpoladas bilinealmente a la rejilla de 0,1° antes de entrar en las redes. Ambas U-Net se entrenaron con una pérdida asimétrica (Doury et al., 2024) que penaliza la subestimación de lluvia intensa, optimizador AdamW y decaimiento coseno del *learning rate* durante 40 épocas, conservando la época con menor pérdida de validación.

El tercer componente es el generador de una GAN Wasserstein residual de 7,2 M de parámetros, construido sobre `unet_tp`. Predice el residuo entre log(1 + IMERG) y log(1 + la predicción de `unet_tp`) a partir de las entradas de `unet_tp`, esa predicción y ruido gaussiano; se entrena con pérdida Wasserstein con penalización de gradiente, una pérdida de contenido sobre la media del ensemble y una restricción de intensidad, siguiendo a Rampal et al. (2025), durante 200 épocas. Cada paso del generador produce un miembro del ensemble. Además, se ajustó un *quantile mapping* empírico mensual por píxel (`quantile_mapping.npz`), agrupando el vecindario 5 × 5 y los meses contiguos, con cuantiles cada 1 % hasta el percentil 99 y ajustado sobre las predicciones e IMERG de las estaciones 2019–2020. La descripción del repositorio de código en GitHub indica además que el estudio compara variantes de U-Net (simple, Squeeze-and-Excitation y atención CBAM) y dos estrategias de post-proceso (quantile mapping mensual y GAN condicional) frente a una línea base BCSD, aunque los pesos publicados en este repositorio corresponden a las tres redes descritas.

## Capacidades

- *Downscaling* espacial determinista: transforma campos diarios de ERA5 a 0,25° en precipitación diaria a 0,1° sobre África Occidental durante junio–octubre.
- *Downscaling* con precipitación de reanálisis: `unet_tp` aprovecha la precipitación diaria de ERA5 como predictor adicional, lo que mejora ligeramente RMSE, correlación y CSI.
- Generación de ensembles probabilísticos: el generador del GAN produce 10 miembros por día (uno por paso del generador), con una dispersión calibrada (relación dispersión-habilidad de 0,92) y un CRPS justo de 2,56 mm/día.
- Reconstrucción de estructura espacial de alta frecuencia: los miembros del GAN reproducen aproximadamente el espectro de potencia observado, a diferencia de las U-Net, que carecen de casi toda la varianza por debajo de unos cientos de kilómetros.
- Corrección distribucional: el *quantile mapping* mensual por píxel elimina el sesgo medio (pasa de −0,85 mm/día en `unet` a +0,00 mm/día) y mejora la CSI a 40 mm/día.
- Inferencia en CPU: el módulo `downscale.py` permite ejecutar un día completo en unos 0,3 s con una U-Net y 1,2 s con los 10 miembros del GAN en un procesador de escritorio con 8 hilos.
- *Tool calling / function calling*: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales de tipo *thinking mode*, visión o audio: no aplica.

## Casos de uso

- Climatologías de precipitación de alta resolución: generar series diarias a 0,1° sobre África Occidental para estudios climáticos regionales, aprovechando que el modelo parte de reanálisis ERA5 con cobertura completa desde 1940 y resolución de 0,25°.
- Evaluación de riesgo de lluvias extremas: usar los 10 miembros del GAN para estimar probabilidades de superar umbrales (por ejemplo, CSI de 0,180 a 40 mm/día en `unet_tp`) en lugar de una única predicción determinista.
- Forzamiento de modelos hidrológicos y de inundaciones: la salida a 0,1° (unos 11 km) y el sesgo nulo tras *quantile mapping* la hacen adecuada como entrada de modelos de escorrentía a escala de cuenca.
- Corrección de sesgo en productos satelitales: comparar las predicciones con IMERG V07 para caracterizar errores del propio producto satelital en la región, teniendo en cuenta que la U-Net tiende a ser demasiado seca y suave.
- Análisis de tendencias y variabilidad del monzón: estudiar la estación junio–octubre en el dominio 4–23° N y 18° W–16° E con una rejilla homogénea de 190 × 340 puntos.
- Servicios climáticos para agricultura de secano: producir mapas diarios de precipitación a resolución de 11 km durante la estación de lluvias para apoyo a decisiones agronómicas en la región.
- Reproducibilidad metodológica y docencia: el módulo `downscale.py` y los pesos en safetensors permiten reproducir el experimento del artículo con pocas líneas de código y sin GPU.
- Demostraciones interactivas: el Space `redouanelg/westafrica-rainfall-downscaling` sirve como interfaz de prototipo sobre el mismo modelo.

## Benchmarks y rendimiento

Resultados sobre las estaciones de test 2021–2024, sobre todos los píxeles-día de la caja de estudio y contra IMERG V07, en mm/día:

| Configuración | RMSE | MAE | Sesgo | Correlación | FSS a 20 mm/día | CSI a 40 mm/día |
|---|---|---|---|---|---|---|
| Precipitación ERA5 (interpolada) | 10,71 | 4,17 | −0,38 | 0,465 | 0,410 | 0,125 |
| U-Net | 8,61 | 3,43 | −0,85 | 0,613 | 0,501 | 0,162 |
| U-Net + precipitación ERA5 | 8,58 | 3,41 | −0,78 | 0,621 | 0,516 | 0,180 |
| U-Net + *quantile mapping* | 9,96 | 3,98 | +0,00 | 0,578 | 0,515 | 0,186 |
| GAN, un miembro | 11,71 | 4,66 | −0,15 | 0,421 | 0,427 | 0,115 |

Métricas adicionales del ensemble de 10 miembros del GAN: CRPS justo de 2,56 mm/día y relación dispersión-habilidad de 0,92. Los miembros del ensemble presentan un espectro de potencia cercano al observado, mientras que las U-Net carecen de casi toda la varianza observada por debajo de unos cientos de kilómetros. No se han publicado en la información disponible resultados de benchmarks frente a modelos externos (por ejemplo, la línea base BCSD mencionada en el repositorio de código aparece sin cifras).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para la U-Net de 29,0 M de parámetros en fp32 (unos 116 MB solo de pesos) y del mismo orden para el generador de 7,2 M ejecutado 10 veces de forma secuencial. Estimación propia a partir del número de parámetros y de la rejilla de salida (190 × 340); no publicada por los autores.
- GPU recomendadas: no disponible. Dado el tamaño del modelo, cualquier GPU con al menos 1–2 GB de memoria libre es suficiente en la práctica; no se documentan pruebas en A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU de consumo con 2 GB o más de VRAM, aunque los autores no publican requisitos de GPU.
- Alternativa sin GPU: la inferencia está pensada para CPU. En un procesador de escritorio con 8 hilos, un día tarda unos 0,3 s con una U-Net y 1,2 s con los 10 miembros del GAN (apéndice D del artículo).
- Opciones de despliegue: módulo Python autocontenido `downscale.py` sobre PyTorch, cargando pesos con `huggingface_hub`. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,3 s/día (U-Net) y 1,2 s/día (10 miembros del GAN) en CPU de 8 hilos. No hay datos de latencia o throughput en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada. La única comparación cuantitativa publicada es interna al propio estudio y frente a la línea base de interpolación de ERA5:

| Modelo | Parámetros | Resolución de salida | RMSE (mm/día) | Correlación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| U-Net (`unet`) | 29,0 M | 0,1° | 8,61 | 0,613 | CC BY 4.0 | safetensors en HuggingFace |
| U-Net + precipitación ERA5 (`unet_tp`) | 29,0 M | 0,1° | 8,58 | 0,621 | CC BY 4.0 | safetensors en HuggingFace |
| Generador GAN (10 miembros) | 7,2 M | 0,1° | 11,71 (un miembro) | 0,421 (un miembro) | CC BY 4.0 | safetensors en HuggingFace |
| ERA5 interpolada (referencia) | no aplica | 0,1° | 10,71 | 0,465 | no aplica | datos públicos de Copernicus |
| Línea base BCSD | no disponible | no disponible | no disponible | no disponible | no disponible | mencionada en el repositorio de código, sin cifras publicadas |
| Variantes U-Net con SE / CBAM | no disponible | no disponible | no disponible | no disponible | no disponible | descritas en el repositorio de código, sin cifras publicadas |

## Limitaciones y advertencias

- Dominio restringido: los modelos solo se han evaluado sobre África Occidental (4–23° N, 18° W–16° E) y únicamente para la estación junio–octubre. No deben aplicarse fuera de ese ámbito sin reentrenamiento.
- El objetivo es un producto satelital: IMERG V07 tiene sus propios errores sobre África Occidental, de modo que el modelo aprende a imitar un producto con incertidumbre, no la precipitación real de pluviómetro.
- Sesgo y suavizado de las U-Net: son demasiado secas (sesgo de −0,85 mm/día en `unet`) y demasiado suaves; el *quantile mapping* corrige la distribución, pero no la posición de la lluvia.
- Dependencia del reanálisis: `unet_tp` y el GAN necesitan la precipitación de ERA5, por lo que no son modelos de *perfect prognosis*. Aplicados a la salida de un modelo climático, heredarían su precipitación simulada y sus sesgos. Solo `unet` usa exclusivamente los campos en niveles de presión.
- Generalización no evaluada: los modelos se entrenaron y evaluaron con predictores de reanálisis; su uso con predicciones meteorológicas o salidas de modelos climáticos no ha sido evaluado.
- Rendimiento del GAN: un único miembro obtiene peores métricas deterministas que las U-Net (RMSE 11,71 frente a 8,61 mm/día); su valor está en la generación de ensembles, no en la predicción puntual.
- Licencia: los pesos y tablas están bajo CC BY 4.0, lo que permite uso comercial con atribución; `downscale.py` está bajo MIT. Es necesario citar a Sagna, Lguensat y Diatta (2026) y respetar las condiciones de uso de ERA5 (Copernicus Climate Change Service) e IMERG.
- Baja tracción en la comunidad: el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que no existe un ecosistema de validación independiente.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el equivalente aquí es la generación de estructuras de precipitación plausibles pero no observadas en las salidas del GAN.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/redouanelg/era5-imerg-westafrica-models
- Dataset asociado: https://huggingface.co/datasets/redouanelg/era5-imerg-westafrica-daily
- Demo interactiva (Space): https://huggingface.co/spaces/redouanelg/westafrica-rainfall-downscaling
- Registro Zenodo citado en la model card: https://doi.org/10.5281/zenodo.23188297
- Registro Zenodo localizado en la búsqueda web: https://zenodo.org/records/20801025
- Ficha OpenAIRE del conjunto de datos: https://explore.openaire.eu/search/dataset?pid=10.5281%2Fzenodo.20801025
- Repositorio de código del estudio: https://github.com/sagna1/downscaling-westafrica-eds
- ERA5 en el Climate Data Store de Copernicus: https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview
- WeatherBench 2 (referencia de evaluación de modelos meteorológicos): https://sites.research.google/gr/weatherbench/
