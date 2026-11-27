# aaaTman/FrontFinder

## Resumen

FrontFinder es un conjunto de modelos en Keras desarrollados por el usuario aaaTman para la deteccion automatica de estructuras meteorologicas sinopticas y de mesoescala sobre una rejilla global de 0,25 grados. El modelo identifica frentes (frio, calido, estacionario y ocluido), lineas secas, vaguadas, vaguadas tropicales y lineas de inestabilidad a partir de campos de prediccion numerica del tiempo (NWP) del modelo IFS de ECMWF en su flujo de datos abiertos.

Tecnicamente se trata de una red neuronal convolucional 2D de tipo UNet3+ que recibe una pila plana de 28 canales (o 27 en la version 2.0.1) y produce probabilidades por pixel para nueve clases, incluida la clase de fondo. La entrada combina cuatro variables en seis niveles de presion (1000, 925, 850, 700, 500 y 300 hPa) mas cuatro variables de superficie, normalizadas internamente mediante una capa de Rescaling, de modo que el modelo acepta directamente unidades fisicas.

Su relevancia radica en que sustituye o complementa la identificacion manual de frentes en cartas sinopticas por un pipeline reproducible y desplegado en produccion (fronts.espr.ai), con licencia CC0-1.0 que permite uso comercial sin restricciones. El repositorio es pequeno (0,1 GB) y la inferencia se realiza por parches solapados con fusion posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet3+ convolucional 2D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion por pixel sobre rejilla 721 x 1440) |
| Tipos de cuantizacion | no disponible (pesos Keras nativos, sin variantes GGUF publicadas) |
| Idiomas soportados | ingles (documentacion y etiquetas); el modelo no procesa texto |
| Licencia | CC0-1.0 |
| Formato de pesos | `.keras` (Keras v3); fichero auxiliar `.npy` float32 para geopotencial de superficie |

## Arquitectura y entrenamiento

El modelo es una UNet3+ completamente convolucional que opera en 2D sobre la rejilla IFS de 0,25 grados (721 x 1440 celdas). La entrada es un tensor plano de 28 canales en la version 2.0.0: temperatura potencial equivalente, componente u del viento, componente v del viento y humedad especifica en seis niveles de presion (24 canales), mas viento a 10 m (u y v), temperatura de punto de rocio a 2 m y geopotencial de superficie (4 canales). La version 2.0.1 elimina el punto de rocio y queda en 27 canales, manteniendo el orden del resto. La normalizacion esta embebida en el grafo mediante una capa Rescaling, por lo que las entradas se proporcionan en unidades fisicas.

La salida son probabilidades por pixel para nueve clases (fondo, frente frio, frente calido, frente estacionario, frente ocluido, linea seca, vaguada, vaguada tropical y linea de inestabilidad). El geopotencial de superficie no forma parte del flujo en tiempo real de IFS open-data y se suministra como campo estatico ERA5 (`geopotential_at_surface_era5_0p25deg.npy`, float32, shape 721 x 1440, latitud de 90 a -90, longitud de 0 a 359,75). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de ajuste fino como RLHF o DPO; tampoco se especifican funciones de perdida ni estrategias de aumento de datos.

## Capacidades

- Segmentacion semantica por pixel de estructuras frontales y de mesoescala sobre rejillas globales de 0,25 grados.
- Deteccion de frentes frios, calidos, estacionarios y ocluidos.
- Deteccion de lineas secas (drylines), vaguadas, vaguadas tropicales y lineas de inestabilidad.
- Consumo directo de campos IFS en unidades fisicas gracias a la capa de normalizacion interna.
- Procesamiento de dominios grandes mediante parches solapados con fusion (blending) en el pipeline de servicio.
- Version sin punto de rocio (v2.0.1) para escenarios donde ese campo no esta disponible en la fuente de datos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de texto o audio.
- No dispone de modo de razonamiento explicito ni de capacidades multimodales mas alla de la entrada de campos meteorologicos.

## Casos de uso

- Generacion automatica de cartas sinopticas: el modelo produce mascaras de frentes y vaguadas sobre la rejilla global, lo que permite emitir cartas meteorologicas operativas sin intervencion manual y con actualizacion por ciclo de IFS.
- Verificacion y control de calidad de analisis manuales: comparar la salida del modelo con frentes dibujados por analistas permite detectar discrepancias sistematicas y cuantificar el error humano en la identificacion frontal.
- Alimentacion de sistemas de prediccion de impacto: las mascaras de frentes frios y lineas de inestabilidad sirven como predictores en modelos de riesgo de conveccion, precipitacion intensa o viento racheado.
- Investigacion climatica: aplicar el modelo a reanalisis ERA5 o a salidas de modelos climaticos para construir climatologias de frecuencia y desplazamiento de frentes a lo largo de decadas.
- Docencia y divulgacion meteorologica: generar visualizaciones coherentes y reproducibles de estructuras frontales a partir de campos NWP para materiales formativos.
- Integracion en pipelines GeoZarr: el pipeline de servicio descrito en fronts.espr.ai produce salidas GeoZarr, lo que facilita su consumo en visores web y sistemas de informacion geografica.
- Deteccion de lineas secas en regiones aridas: la clase especifica de dryline permite monitorizar condiciones de riesgo de incendio o de conveccion seca en zonas como el suroeste de Estados Unidos o el norte de Africa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repositorio (0,1 GB) sugiere un modelo de pocos millones de parametros, pero no se confirma.
- GPU recomendadas: no disponible. Al ser un modelo convolucional 2D sobre rejillas de 721 x 1440, se beneficia de GPU con memoria suficiente para procesar parches; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probable en tarjetas con suficiente VRAM para el tamano de parche utilizado, pero no confirmado en la documentacion.
- Opciones de despliegue: carga mediante `keras.saving.load_model`; el pipeline de servicio con troceado, ingesta IFS, calculo de variables derivadas y salida GeoZarr se describe en fronts.espr.ai. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FrontFinder (v2.0.0 / v2.0.1) | UNet3+ 2D, Keras | 28 / 27 canales en rejilla 0,25 grados | 9 (8 utiles en producto) | CC0-1.0 | Hugging Face, servicio en fronts.espr.ai |
| Modelos comparables de deteccion frontal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos de deteccion frontal en la documentacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La clase de linea de inestabilidad se entrena pero no se utiliza en el producto servido; su fiabilidad no esta validada en produccion.
- El modelo depende del geopotencial de superficie ERA5 como entrada estatica; un desajuste en la convencion (m² s⁻² frente a metros) o en la orientacion de la rejilla produce errores silenciosos.
- La version 2.0.0 requiere punto de rocio a 2 m, campo que puede no estar disponible en todas las fuentes; la 2.0.1 elimina esa dependencia a costa de perder informacion de humedad de superficie.
- No se documentan sesgos conocidos, tasas de acierto ni matrices de confusion, lo que impide evaluar su comportamiento diferencial por region, estacion o tipo de frente.
- Riesgo de alucinacion en el sentido de falsos positivos en regiones con estructuras debiles o mal resueltas por la rejilla de 0,25 grados; no cuantificado en la informacion disponible.
- La resolucion de 0,25 grados limita la deteccion de estructuras de mesoescala fina, como lineas secas estrechas o frentes de rafaga.
- El modelo esta documentado en ingles y no procesa lenguaje natural; no aplican limitaciones idiomaticas de generacion de texto.
- La licencia CC0-1.0 permite uso comercial sin restricciones, pero se exige atribucion a ERA5 y a ECMWF open data por el uso de sus campos de entrada.
- No se especifican garantias de calibracion de las probabilidades por pixel ni umbrales operativos recomendados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaaTman/FrontFinder
- Servicio desplegado y documentacion del pipeline: https://fronts.espr.ai
- ECMWF IFS open data: https://www.ecmwf.int/en/forecasts/datasets/open-data
- ERA5 (Copernicus Climate Change Service): https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels
- ARCO-ERA5 (archivo publico con `geopotential_at_surface`): https://github.com/google-research/arco-era5
