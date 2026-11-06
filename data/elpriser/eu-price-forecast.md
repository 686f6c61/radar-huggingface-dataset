# Elpriser/eu-price-forecast

## Resumen

`eu-ens-v2` es un sistema de previsión de precios horarios del mercado diario (day-ahead) de electricidad para 25 zonas de oferta europeas, publicado por Elpriser con pesos abiertos y el código de producción asociado. No es una red neuronal ni un modelo de lenguaje: es un ensemble tabular que combina un booster LightGBM agrupado (pooled) sobre las 25 zonas con 132 regresiones ridge (22 zonas por 6 horizontes), y que produce una estimación central más una banda P10-P90 para cada hora entre D+2 y D+7.

El problema que resuelve es acotado y operativo: dado el resultado de la subasta ya publicado para D+1, generar previsiones de precio en EUR/MWh para los seis días siguientes en cada zona, con una puerta de publicación que solo deja salir aquellos pares zona-horizonte en los que la receta supera a un método naive de referencia por al menos un 5 % de MAE. La variante publicada es la "fuel-free": la versión en producción incorpora además precio del gas y del CO2, pero sus licencias de datos no están confirmadas, de modo que esos pesos se retienen y esta réplica presenta un error aproximadamente un 3 % superior de media.

Es relevante ahora porque el autor documenta con inusual franqueza el deterioro reciente del modelo: tras la subida de precios de septiembre de 2026, la ventaja frente al naive cae del 28 % al 22 % en D+2 y del 16 % al 5 % en D+7, con un sesgo de -13 a -22 EUR/MWh (el modelo se queda corto), y la cobertura de la banda P10-P90 baja del 81 % al 69 %. No hay todavía medición de error en vivo: la previsión entró en producción el 3 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble tabular: LightGBM (400 árboles, 63 hojas, objetivo cuantil alpha 0.5) + 132 regresiones ridge (22 zonas x D+2..D+7) |
| Parametros totales | no disponible (no aplica; modelo de árboles y coeficientes lineales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de features basada en 60 días de precios históricos y previsión meteorológica actual |
| Tipos de cuantizacion | no aplica (formato de texto LightGBM y arrays NPZ) |
| Idiomas soportados | no disponible (modelo numérico, sin componente lingüístico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `weights/lgb_base.txt` (texto LightGBM), `weights/ridge_nofuel.npz` (arrays, carga con `allow_pickle=False`), `weights/config.json` |

## Arquitectura y entrenamiento

El sistema es un ensemble en dos capas. La primera es un booster LightGBM único, entrenado de forma agrupada sobre las 25 zonas, con 400 árboles y 63 hojas, y objetivo de regresión cuantil con alpha 0.5 (mediana). El target no es el precio bruto sino el precio menos el nivel de los últimos 7 días, de manera que el modelo aprende la desviación respecto a un ancla móvil. La segunda capa son 132 regresiones ridge independientes, una por cada combinación de 22 zonas y cada horizonte de D+2 a D+7, que se reajustan diariamente en producción sobre una ventana de 365 días; el repositorio incluye la estandarización, los coeficientes y el término independiente. El repositorio contiene 132 ridges para 22 zonas, mientras que la puerta de publicación cubre 25 zonas y 150 pares zona-horizonte, de los que pasan 146.

Las features se construyen a partir de 60 días de precios day-ahead descargados de ENTSO-E (una petición por zona), la previsión actual de Open-Meteo (sin clave) y módulos de calendario y diseño de la receta copiados literalmente del código de producción. La banda P10-P90 se calibra con los cuantiles del error medido en los últimos 180 días, ensanchados por un factor de 1.2 (`gate/calibration_residual.json`). La verificación de reproducibilidad declarada es fuerte: el 3 de noviembre de 2026, ejecutando el código desde una descarga limpia sobre entradas congeladas, se reprodujo la estimación central de producción para las 3.600 horas de previsión con un error menor a 1e-6 EUR/MWh. Los pesos son una instantánea que el autor refresca semanalmente mediante un job con etiqueta `snapshot-YYYY-MM-DD`; la fecha en `config.json` indica cuál se está usando.

## Capacidades

- Previsión de precio day-ahead horario en EUR/MWh para 25 zonas europeas: Alemania, Francia, Polonia, norte de Italia, Austria, Bélgica, Suiza, Chequia, Hungría, Eslovenia, España, Portugal, Eslovaquia, Grecia, Rumanía, Bulgaria, Croacia, Serbia, Estonia, Letonia, Lituania, Irlanda, Montenegro, Macedonia del Norte y Albania.
- Horizontes D+2 a D+7, donde D+1 es el último día cuya subasta ya está publicada; el modelo opera con el reloj local de cada zona.
- Estimación central por hora más banda de incertidumbre P10-P90 calibrada sobre residuos.
- Salida agregada por zona y día: media, mínimo, máximo y las tres horas más baratas.
- Puerta de publicación que filtra pares zona-horizonte con ventaja insuficiente frente al naive (146 de 150 activos; IT-N solo D+2..D+4, AL no D+7).
- Ejecución en modo online (descarga de ENTSO-E y Open-Meteo) o totalmente offline mediante `--prices-dir` y `--weather-pickle`.
- API programática: `eu_infer.forecast(prices, live, "weights")`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un regresor tabular especializado.

## Casos de uso

- Selección de horas baratas para consumo flexible: el modelo devuelve explícitamente las tres horas más baratas por zona y día, lo que permite programar cargas desplazables (bombas de calor, carga de vehículos eléctricos, electrodomésticos) con seis días de antelación usando la estimación central y la banda como criterio de riesgo.
- Gestión de carteras de compra en el mercado diario: un comercializador puede usar las previsiones D+2..D+7 para decidir coberturas o posicionamiento antes de que se publiquen los resultados de las subastas correspondientes.
- Operación de activos con coste marginal eléctrico: industrias electrointensivas y plantas de hidrógeno o de almacenamiento por bombeo pueden planificar ciclos de producción y parada comparando el precio previsto con su coste variable.
- Investigación académica sobre formación de precios: la combinación de pesos abiertos, código de producción literal y auditoría de licencias de datos (`DATA_LICENCES.md`) permite reproducir y auditar un pipeline real de forecasting sin ingeniería inversa.
- Desarrollo de sistemas de alerta de precios: la banda P10-P90 permite definir umbrales de aviso (por ejemplo, P90 por encima de un determinado EUR/MWh) para activar protocolos de reducción de demanda.
- Benchmarking de métodos de forecasting: el naive "último nivel + perfil semanal" está definido de forma explícita, lo que convierte al modelo en una línea base reproducible para comparar nuevas propuestas en series temporales de precios eléctricos.
- Prototipado rápido en zonas concretas: con `python3 predict_eu.py --zones de,es --out forecast.json` se obtiene una previsión funcional en minutos, útil para validar una idea de producto antes de construir infraestructura propia.

## Benchmarks y rendimiento

Los únicos datos publicados son los del backtest interno frente al método naive de referencia ("nivel + forma": media de los últimos 7 días conocidos más el perfil horario del mismo día de la semana de las últimas 4 semanas). No se han publicado comparaciones con otros modelos de forecasting en la información disponible.

| Metrica | Resultado |
|---|---|
| Ventaja de MAE frente al naive, D+2, mediana sobre zonas (backtest completo) | 28 % |
| Ventaja de MAE frente al naive, D+2, mediana sobre zonas (desde septiembre de 2026) | 22 % |
| Ventaja de MAE frente al naive, D+7, mediana sobre zonas (backtest completo) | 16 % |
| Ventaja de MAE frente al naive, D+7, mediana sobre zonas (desde septiembre de 2026) | 5 % |
| Cobertura de la banda P10-P90, backtest completo | ~81 % |
| Cobertura de la banda P10-P90, desde septiembre de 2026 | ~69 % |
| Sesgo desde septiembre de 2026 | -13 a -22 EUR/MWh (modelo por debajo del realizado) |
| Pares zona-horizonte que pasan la puerta de publicación | 146 de 150 |
| Error en vivo | no disponible (entrada en producción el 2026-11-03) |
| Penalización de la variante fuel-free frente a producción | ~3 % de error adicional de media |

## Requisitos de hardware

- Inferencia en CPU: el modelo es LightGBM de 400 árboles más 132 ridge; no requiere GPU. Cabe holgadamente en cualquier máquina de desarrollo.
- VRAM estimada: 0 GB; no hay componente neuronal.
- GPU recomendadas: no aplica.
- Cabe en consumer GPU: sí, pero es irrelevante, ya que se ejecuta en CPU.
- Opciones de despliegue: ejecución directa de `predict_eu.py` o `eu_infer.py` con Python; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El coste dominante en modo online es la latencia de red de las 25 peticiones a ENTSO-E (una por zona) y la descarga de Open-Meteo, no el cómputo.
- Dependencias: `requirements.txt` del repositorio; token gratuito de ENTSO-E vía `ENTSOE_TOKEN`.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos de previsión de precios eléctricos en la información disponible. La única referencia cuantitativa es el método naive interno del propio autor.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eu-ens-v2` fuel-free (este) | no aplica (LightGBM + ridge) | 60 días de histórico | 22 % mejor que naive en D+2; 5 % en D+7 (desde sept. 2026) | CC-BY-4.0 | Pesos y código en Hugging Face |
| `eu-ens-v2` producción (con gas y CO2) | no aplica | 60 días de histórico | ~3 % mejor que la variante fuel-free | no disponible (pesos retenidos) | No pública |
| Naive "nivel + forma" | no aplica | 7 días + 4 semanas | Línea base de referencia | no aplica | Definido en la model card |
| Otros modelos de forecasting eléctrico | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una garantía de precio: el propio autor indica que debe usarse para localizar las horas más baratas, no como referencia contractual.
- Deterioro documentado desde septiembre de 2026: la ventaja frente al naive se reduce a un 5 % en D+7 y el sesgo es de -13 a -22 EUR/MWh, es decir, el modelo subestima sistemáticamente.
- Cobertura de la banda P10-P90 por debajo de lo nominal: ~69 % desde septiembre frente al 80 % teórico, lo que infravalora el riesgo de cola.
- Sin medición de error en vivo: la puesta en producción es del 3 de noviembre de 2026 y no hay datos de rendimiento real.
- Los pesos publicados son una instantánea semanal; el ridge se reajusta a diario en producción y deriva con rapidez cuando los precios se mueven, por lo que una instantánea antigua pierde validez.
- La variante publicada no es la de producción: omite gas y CO2 por licencias no confirmadas, con un error ~3 % superior.
- Dependencia de dos fuentes externas: ENTSO-E (requiere registro y solicitud de acceso a la API RESTful) y Open-Meteo (sin clave). Una caída o un cambio de formato en cualquiera de ellas rompe el pipeline.
- Cobertura incompleta: IT-N solo publica D+2..D+4 y AL no publica D+7.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero la auditoría de licencias de los datos subyacentes está en `DATA_LICENCES.md` y conviene revisarla antes de un despliegue comercial.
- Sin capacidades de lenguaje, tool calling ni agentes: no debe confundirse con un modelo generativo pese a estar alojado en Hugging Face.
- Riesgo de alucinación no aplica; el riesgo equivalente es la extrapolación silenciosa fuera del régimen de precios con el que se entrenó.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elpriser/eu-price-forecast
- Servicio que consume la previsión: https://elpriser.org
- Registro y acceso a la API de ENTSO-E: https://transparency.entsoe.eu
- Solicitud de acceso RESTful a ENTSO-E: transparency@entsoe.eu
- Open-Meteo (previsión meteorológica, sin clave): no se proporciona URL explícita en la información disponible
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
