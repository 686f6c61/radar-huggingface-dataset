# CXu0630/mtg-price-deep-gp

## Resumen

El modelo `CXu0630/mtg-price-deep-gp` es un regresor tabular que predice un rango de precio (intervalo del 80% en USD) para una impresión concreta de una carta de Magic: The Gathering (una carta en un set, tratamiento y acabado determinados) a partir exclusivamente de lo que está impreso en la carta. Está desarrollado por el usuario CXu0630 como proyecto de aficionado no oficial y es el "Modelo 2" de un pipeline más amplio cuyo baseline es `CXu0630/mtg-price-catboost`.

Técnicamente no es un modelo de lenguaje: combina un extractor de características "wide & deep" en PyTorch con un proceso gaussiano variacional disperso (SVGP de GPyTorch) de 750 puntos inductores, entrenado de extremo a extremo sobre la ELBO contra `log(price_avg)`. El modelo tiene 1.050.269 parámetros entrenables según el `safetensors`, pero se apoya en dos codificadores congelados externos (`all-mpnet-base-v2` y CLIP ViT-B/32) para construir un embedding conjunto de 48 dimensiones.

Su relevancia es acotada y muy específica: sirve para estimar rangos de precio con cobertura calibrada mediante *split-conformal* condicionada por tramos de precio, incluyendo cartas hipotéticas o aún no lanzadas. El punto fuerte declarado no es la precisión puntual, sino la calibración del intervalo en los tramos caros ($10–$100 y $100+), donde supera al baseline CatBoost.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Extractor de caracteristicas wide & deep (PyTorch) + proceso gaussiano variacional disperso (SVGP, GPyTorch) con nucleo RBF-ARD |
| Parametros totales | 1.050.269 (pesos en `model.safetensors`); excluye los codificadores congelados externos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto; la entrada es una fila tabular + un embedding de texto de 768 dimensiones) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; el repo no publica variantes GGUF ni similares) |
| Idiomas soportados | No disponible. El codificador de texto es `all-mpnet-base-v2`, que trabaja con texto de oraculo en ingles |
| Licencia | `wotc-fan-content` (licencia "other"; ver Fan Content Policy de Wizards of the Coast) |
| Formato de pesos | `safetensors` (`model.safetensors`), mas `config.json`, `preprocessor.json` y `pull_rate_defaults.parquet` |

## Arquitectura y entrenamiento

El extractor de caracteristicas proyecta cada entrada por separado y concatena el resultado en un embedding conjunto de 48 dimensiones. Las piezas son: un embedding de texto de oraculo congelado (`sentence-transformers/all-mpnet-base-v2`, de 768 a 64 dimensiones), un embedding de ilustracion congelado (CLIP ViT-B/32, variante `ViT-B-32-quickgelu` con pesos `openai` en `open_clip`, aplicado al `art_crop` de Scryfall, de 512 a 64 dimensiones), un `nn.Embedding` por cada columna categorica (rareza, acabado, marco, ilustrador, etc.) y un MLP sobre aproximadamente 465 caracteristicas booleanas y numericas (mecanicas, palabras clave, etiquetas top-N de texto de oraculo, arte y tipo, legalidades, tasas de aparicion en sobres y ranking de EDHREC).

Sobre ese embedding conjunto se entrena un SVGP con 750 puntos inductores, nucleo RBF-ARD y verosimilitud gaussiana, optimizando la ELBO contra `log(price_avg)`. La calibracion de intervalos es un *split-conformal* condicional por grupo: la correccion aditiva se calcula por separado para cada tramo de precio *predicho* (<$1, $1–10, $10–100, $100+) sobre una particion de calibracion reservada. Durante el entrenamiento se aplico sobremuestreo gradual del rango $100–$1000 para mejorar la cobertura en cartas caras. No se documenta uso de RLHF, DPO ni datos de preferencias, algo coherente con una tarea de regresion tabular.

## Capacidades

- Prediccion del rango de precio del 80% (limites inferior, medio y superior en USD) para una impresion de carta de Magic.
- Funciona tanto con cartas ya lanzadas como con cartas hipoteticas o no lanzadas, usando `pull_rate_defaults.parquet` para rellenar las tasas de aparicion por (rareza, acabado).
- Integra informacion textual y visual de la carta mediante embeddings precalculados de texto de oraculo (MPNet) y de la ilustracion (CLIP).
- Maneja variables categoricas de alta cardinalidad (ilustrador, marco, acabado) mediante embeddings dedicados y mapea categorias no vistas a `__unk__`.
- Imputa valores numericos ausentes y estandariza las caracteristicas numericas segun las estadisticas guardadas en `preprocessor.json`.
- Genera intervalos de prediccion calibrados con cobertura empirica cercana al 80% a nivel global (80,5% en el conjunto de test).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision generativa, tool calling, soporte de agentes ni capacidades multilingues.

## Casos de uso

- Tarificacion de inventario para tiendas de cartas: dado el catalogo de una tienda, el modelo devuelve un rango bajo/medio/alto por impresion, util para fijar precios de compra y venta con un margen de incertidumbre explicito.
- Valoracion de colecciones de particulares: permite estimar el rango de valor de una lista de cartas a partir de sus caracteristicas impresas, sin depender de consultas en vivo a APIs de mercado.
- Analisis de nuevas impresiones antes del lanzamiento: como acepta cartas no lanzadas y rellena la tasa de aparicion esperada por rareza y acabado, sirve para anticipar el precio de una carta anunciada antes de que exista historico de mercado.
- Investigacion de mercado y deteccion de anomalias: comparar el precio real observado con el rango predicho ayuda a identificar cartas infravaloradas o sobrevaloradas por factores ajenos a los atributos impresos (combos, baneos, coleccionismo).
- Motor de recomendacion de compra con aversion al riesgo: el intervalo calibrado permite filtrar candidatos segun el apetito de riesgo del usuario, priorizando cartas cuyo limite inferior del rango sea alto y cuyo limite superior no sea excesivamente amplio.
- Evaluacion de decisiones de diseno de productos de un set: dado que el modelo usa tasas de aparicion en sobres y rareza, se puede simular como cambiarian los rangos de precio de una carta al variar su rareza o su acabado.
- Benchmark metodologico: sirve como caso de estudio reproducible de combinacion de modelos tabulares clasicos con aprendizaje de nucleo profundo y calibracion conformal, comparandolo con el baseline CatBoost del mismo autor.

## Benchmarks y rendimiento

Resultados en la particion de test reservada (14.639 impresiones), dividida por `oracle_id` para evitar fuga de datos. MAE sobre el logaritmo del precio; la cobertura corresponde al intervalo calibrado del 80%.

| Precio real | n | MAE (log) | Cobertura 80% | Anchura media (log) |
|---|---|---|---|---|
| < $1 | 8.816 | 0,43 | 83,9% | 1,45 |
| $1–$10 | 3.939 | 0,74 | 75,4% | 2,30 |
| $10–$100 | 1.702 | 0,85 | 76,0% | 2,46 |
| $100+ | 182 | 1,18 | 67,6% | 2,73 |
| Global | 14.639 | 0,57 | 80,5% | 1,81 |

Segun la model card, los numeros exactos de estas metricas estan en `config.json` → `test_metrics`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, el modelo entrenable tiene 1.050.269 parametros (unos 4 MB en fp32, 2 MB en fp16), pero la inferencia requiere cargar ademas los dos codificadores congelados (`all-mpnet-base-v2`, en torno a 110 M de parametros, y CLIP ViT-B/32, en torno a 150 M). El conjunto cabe holgadamente en cualquier GPU de consumo e incluso puede ejecutarse en CPU; estas cifras son estimaciones del analisis, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU con al menos unos pocos GB de memoria libre es suficiente; no se requieren aceleradores de datacenter.
- Cabe en GPU de consumo: si, en la practica totalidad de las GPU consumer modernas, dado el tamano reducido del modelo y de los codificadores.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo). La via oficial es el codigo de inferencia incluido en el repositorio (`mtg_price_prediction/deep_gp.py`, clase `DeepGPPredictor`) sobre PyTorch y GPyTorch.
- Latencia y throughput estimados: no disponible.
- Dependencias declaradas para el uso: `torch`, `gpytorch`, `safetensors`, `huggingface_hub`, `pandas` y `pyarrow`.

## Comparativa con modelos similares

El unico modelo comparable documentado por el autor es su propio baseline CatBoost. No se identifican en la informacion disponible otras alternativas publicas equivalentes.

| Modelo | Tipo | Parametros | Coherencia 80% en $10–$100 | Cobertura 80% en $100+ | Error puntual | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `CXu0630/mtg-price-deep-gp` | Extractor wide & deep + SVGP (GPyTorch) | 1.050.269 (mas codificadores congelados) | 76,0% | 67,6% | MAE log global 0,57 | `wotc-fan-content` | HuggingFace, 0 descargas / 0 likes |
| `CXu0630/mtg-price-catboost` | GBDT (CatBoost) | No disponible | 71,8% | 52,3% | Menor error mediano que el modelo GP (valor concreto no disponible) | No disponible | HuggingFace |

Advertencia de comparabilidad: cada modelo se evaluo en su propia particion, por lo que la comparacion es aproximada segun el propio autor. La ventaja del modelo GP procede de intervalos mejor calibrados y mas anchos, no de estimaciones puntuales mas precisas.

## Limitaciones y advertencias

- El tramo de $100+ esta infracubierto: la cobertura calibrada es del 67,6% en lugar del 80% nominal, y el tramo es pequeno (182 puntos de test y 113 de calibracion).
- Los precios impulsados por combos, baneos o coleccionismo son practicamente invisibles a las caracteristicas usadas. Ejemplo citado en la model card: Paradoxical Outcome, con precio real de 104 USD y prediccion de un solo digito.
- La incertidumbre del proceso gaussiano es casi constante entre cartas: la desviacion tipica predictiva varia solo alrededor de un 1% dentro de un mismo tramo (fenomeno conocido como colapso del aprendizaje de nucleo profundo). La anchura del intervalo se adapta por tramo de precio *predicho*, no por carta individual.
- Las ablaciones sugieren que la mayor parte de la senal es tabular: una variante solo tabular se acerca al rendimiento de este modelo, mientras que una variante solo con embeddings se degrada.
- Los resultados provienen de una unica semilla y una unica particion; diferencias de pocos puntos entre variantes estan dentro del ruido.
- El modelo se queda obsoleto con el tiempo: se entreno con una ventana de precios de TCGplayer de aproximadamente tres meses que termina en septiembre de 2026 y predice log-precio absoluto, por lo que se desvia a medida que se mueve el mercado.
- Fuera de alcance: cartas con multiples caras (transform, MDFC, split, adventure, etc.), impresiones solo digitales y cartas de tamano sobredimensionado.
- Licencia `wotc-fan-content`: se trata de una licencia de tipo "other" vinculada a la Fan Content Policy de Wizards of the Coast. Es un proyecto de aficionado no oficial, no producido ni respaldado por Wizards of the Coast, y las condiciones de uso comercial dependen de dicha politica.
- Riesgo de uso en produccion: dado el numero de descargas (0) y likes (0), no hay evidencia de validacion externa ni de mantenimiento por parte de terceros.
- No dispone de benchmarks de tipo MMLU, HumanEval, GSM8K ni similares, ya que no es un modelo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CXu0630/mtg-price-deep-gp
- Codigo fuente, pipeline de entrenamiento y documento de diseno: https://github.com/CXu0630/mtg_price_predict_catboost_deep_gp
- Modelo baseline CatBoost: https://huggingface.co/CXu0630/mtg-price-catboost
- Dataset citado: https://huggingface.co/datasets/CXu0630/mtg-card-market-dataset
- Dataset citado: https://huggingface.co/datasets/pcwoods/mtg-card-prices
- Codificador de texto: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Licencia fan content de Wizards of the Coast: https://company.wizards.com/en/legal/fancontentpolicy
