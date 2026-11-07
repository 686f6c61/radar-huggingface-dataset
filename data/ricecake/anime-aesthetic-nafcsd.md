# ricecake/anime-aesthetic-nafcsd

## Resumen

anime-aesthetic-nafcsd es un modelo de puntuacion estetica para ilustracion anime desarrollado por el usuario ricecake. No se trata de un modelo generativo, sino de un sistema de dos cabezas lineales (aesthetic y watermark) montadas sobre caracteristicas de imagen congeladas, cuyo proposito es la curacion de datos: seleccionar las imagenes de entrenamiento del modelo Krea-2-Anime-tuned-Turbo. El modelo resuelve un problema concreto y poco cubierto: filtrar grandes volumenes de imagenes candidatas de Danbooru y Gelbooru segun el gusto estetico de un curador humano y descartar imagenes con marcas de agua.

La arquitectura combina dos extractores de caracteristicas congelados: SigLIP2-naflex (pooler, con relacion de aspecto preservada y hasta 1024 parches) y el descriptor de estilo CSD (ViT-L, recorte central de 224 px). Ambas representaciones se normalizan L2 y se concatenan en un vector de 1920 dimensiones, sobre el que se ajustan las dos cabezas lineales. El repositorio ocupa 1,2 GB, aunque el primer uso descarga ademas el checkpoint de SigLIP2 de Google (unos 4,5 GB).

Es relevante porque demuestra que una cabeza lineal entrenada con unos pocos miles de juicios de una sola persona supera a scorers publicos de anime entrenados con votos agregados (0,765 frente a 0,578 de deepghs anime_aesthetic y 0,585 de waifu-scorer-v3 en el conjunto de evaluacion citado). La licencia es MIT, lo que permite reutilizar codigo y cabezas sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos cabezas lineales (Bradley-Terry para estetica, regresion logistica para watermark) sobre caracteristicas congeladas SigLIP2-naflex + CSD |
| Parametros totales | no disponible (cabezas lineales sobre 1920 dimensiones; el peso principal son los extractores congelados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (el codigo usa fp16 en CUDA, aproximadamente 3x mas rapido que fp32) |
| Idiomas soportados | no disponible (procesa imagenes; las etiquetas de entrenamiento provienen de tags en ingles de Danbooru y Gelbooru) |
| Licencia | MIT |
| Formato de pesos | safetensors (cabezas en `heads/watermark.safetensors`); pesos CSD en el propio repo; SigLIP2 descargado aparte |

## Arquitectura y entrenamiento

El sistema no entrena ningun backbone: usa SigLIP2-naflex y CSD como extractores congelados y ajusta dos regresores lineales sobre la representacion concatenada de 1920 dimensiones. La cabeza estetica es la media de 30 ajustes bootstrap de un modelo Bradley-Terry lineal con regularizacion L2 (lambda 3,16e-4), entrenado sobre pares decisivos, empates tratados como objetivos de 1/2 mas etiquetas absolutas bueno/malo, y decisiones individuales de conservar/descartar. La cabeza de watermark es una regresion logistica L2 (lambda 1e-6) entrenada sobre todos los positivos (24.474 imagenes con tag de watermark entre 957.461 candidatas, un 2,6 %) mas 8 veces tantos negativos aleatorios.

Los datos de etiquetado son deliberadamente subjetivos: una sola persona anoto imagenes del pool de Danbooru en una interfaz A/B de dos imagenes durante tres rondas. El conjunto incluye 2.818 eventos de entrenamiento, 3.695 imagenes tocadas, 1.536 pares decisivos, 306 empates "ambos buenos", 830 empates "ambos malos", 38 y 107 decisiones individuales de conservar y descartar, y 127 pares de evaluacion reservados. La autocoherencia en pares repetidos fue de 58/60 (96,7 %) y 22/24 (92 %). El preprocesado es parte critica del pipeline: las imagenes se reducen para que el lado corto mida 512 px (nunca se reescalan hacia arriba), la transparencia se aplana sobre blanco y se recodifica en WebP Q90.

## Capacidades

- Puntuacion estetica de ilustraciones anime en escala de log-odds: la diferencia `score(a) - score(b)` es el log-odds de que el curador prefiera `a` sobre `b` (una diferencia de 1,0 equivale aproximadamente a un 73 %).
- Deteccion de marcas de agua mediante un logit (`watermark_logit`) y una version binaria con umbral (`watermark`), calibrado para marcar el 80 % de las imagenes etiquetadas.
- Procesamiento por lotes de imagenes desde rutas o desde objetos PIL, con salida en JSONL.
- Ejecucion en CUDA o CPU, con fp16 aproximadamente 3x mas rapido en GPU.
- No realiza generacion de texto ni de imagen, no soporta tool calling, no es un modelo de agentes y no tiene capacidades multilingues ni de audio.

## Casos de uso

- Curacion de datasets de ilustracion anime: el modelo puntua cientos de miles de candidatas y permite aplicar un corte por percentil (por ejemplo, el corte del top 200.000 usado en Krea 2 corresponde a un score de 0,66) para quedarse con las imagenes de mayor calidad percibida.
- Filtrado de marcas de agua en pipelines de scraping: la cabeza de watermark descarta imagenes con logotipos o firmas antes de que entren en un dataset de entrenamiento, evitando que un modelo generativo aprenda a reproducirlas.
- Preprocesado de datasets para fine-tuning de modelos de difusion: se integra como paso de ranking y exclusion previo al entrenamiento, reduciendo el ruido visual del corpus.
- Limpieza de galerias y repositorios de imagenes: ordenar una coleccion propia por preferencia estetica o detectar automaticamente piezas con marcas de agua para revisarlas manualmente.
- Investigacion sobre preferencias esteticas: al ser un modelo Bradley-Terry, permite estudiar la coherencia y la estructura de las preferencias de un anotador individual frente a scorers entrenados con votos agregados.
- Evaluacion comparativa de extractores de caracteristicas: el repositorio incluye resultados que comparan NAF + CSD frente a SigLIP2 solo, CSD solo y alternativas publicas, utiles para decidir que representacion usar en tareas de scoring visual.
- Construccion de selectores personalizados: el codigo y las cabezas son MIT, por lo que se pueden reentrenar las cabezas sobre caracteristicas congeladas con los juicios de otro curador o de otro dominio visual.

## Benchmarks y rendimiento

Exactitud por pares (el modelo ordena un par decisivo igual que el curador):

| Configuracion | Exactitud |
|---|---|
| Validacion cruzada de 5 folds disjunta por imagen sobre pares de la ronda 3 (183 pares) | 0,731 ± 0,016 |
| Validacion cruzada disjunta por imagen sobre todas las rondas (336 pares) | 0,743 ± 0,029 |
| Conjunto de evaluacion reservado | 103/127 = 0,811 |

Comparativa de caracteristicas (ronda anterior, disjunta por imagen, 628 pares, un unico ajuste por conjunto de caracteristicas):

| Caracteristicas | Exactitud |
|---|---|
| NAF ⊕ CSD | 0,765 |
| SigLIP2-naflex solo | 0,742 |
| CSD solo | 0,726 |
| SigLIP2-256 aplastado (selector anterior) | 0,698 |
| deepghs anime_aesthetic, tal cual | 0,578 |
| waifu-scorer-v3, tal cual | 0,585 |

Prueba de seleccion ciega sobre una muestra estratificada de 6.000 imagenes de Danbooru: las imagenes que solo conservaba NAF ⊕ CSD ganaron el 68 % de las comparaciones decisivas frente a las que solo conservaba una cabeza SigLIP2-256 ajustada con las mismas etiquetas (118 comparaciones, intervalo de confianza del 95 % por cluster-bootstrap: 59-77 %). La superposicion del top 200k entre cabezas ajustadas sobre mitades disjuntas de etiquetas es de 0,71 con la cabeza de 30 bolsas frente a 0,50 con la de un unico ajuste.

Rendimiento de la sonda de watermark (5 folds out-of-fold sobre todas las candidatas):

| Caracteristicas | ROC AUC | Average precision |
|---|---|---|
| NAF ⊕ CSD (las de esta sonda) | 0,969 | 0,647 |
| SigLIP2-naflex solo | 0,969 | 0,649 |
| CSD solo | 0,859 | 0,343 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 1,2 GB y el checkpoint de SigLIP2 que se descarga en el primer uso pesa unos 4,5 GB (incluye la torre de texto, aunque solo se usa la de vision).
- GPU recomendadas: no se especifican modelos concretos. El codigo selecciona CUDA si esta disponible y usa fp16 en GPU, aproximadamente 3x mas rapido que en CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el uso de fp16 y de un backbone congelado sugiere que es viable en GPUs de consumo con suficiente VRAM para el checkpoint de SigLIP2, pero no hay datos publicados.
- Opciones de despliegue: el repositorio proporciona `scorer.py` con una clase `Scorer` y una interfaz de linea de comandos (`python scorer.py my_images/ --out scores.jsonl`). Requiere `transformers==5.20.2` porque el redimensionado naflex depende de la version. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Exactitud en el conjunto de evaluacion citado | Licencia | Disponibilidad |
|---|---|---|---|---|
| anime-aesthetic-nafcsd | Cabezas lineales sobre NAF ⊕ CSD | 0,765 (628 pares, disjunta por imagen) | MIT | Hugging Face |
| deepghs anime_aesthetic | Scorer publico de anime | 0,578 | no disponible | Hugging Face |
| waifu-scorer-v3 | Scorer publico de anime | 0,585 | no disponible | no disponible |
| Selector SigLIP2-256 previo | Cabeza sobre SigLIP2-256 aplastado | 0,698 | no disponible | no disponible |

La comparacion se limita al criterio de preferencia del curador de este modelo; los scorers publicos estan entrenados con agregacion de votos y su acuerdo con ese criterio concreto es solo ligeramente superior al azar.

## Limitaciones y advertencias

- La cabeza estetica refleja el gusto de una sola persona, no un consenso. El propio autor lo explicita: es el criterio del curador del dataset, no el de una comunidad de votantes.
- El valor absoluto del score estetico no tiene significado por si mismo; solo las diferencias entre dos imagenes son interpretables como log-odds.
- El logit de watermark no es una probabilidad calibrada: la sonda se entreno con una proporcion de 1:8 entre positivos y negativos.
- El preprocesado es obligatorio para obtener resultados comparables: reduccion al lado corto de 512 px sin reescalado hacia arriba, aplanado de transparencia sobre blanco y recodificacion en WebP Q90. Omitirlo altera las puntuaciones.
- Dependencia de una version concreta de `transformers` (5.20.2) por el redimensionado naflex; otras versiones pueden producir resultados distintos.
- El primer uso requiere descargar unos 4,5 GB de SigLIP2 desde Google, ademas del 1,2 GB del repositorio.
- No hay datos publicados sobre sesgos demograficos, culturales o de estilo mas alla del dominio de ilustracion anime de Danbooru y Gelbooru.
- No es un modelo generativo ni conversacional: no admite prompts de texto ni genera imagenes.
- La licencia MIT cubre codigo, cabezas y la conversion de CSD, pero conviene verificar las licencias de los pesos de SigLIP2 y CSD por separado para uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricecake/anime-aesthetic-nafcsd
- Modelo generativo asociado (Krea-2-Anime-tuned-Turbo): https://huggingface.co/ricecake/Krea-2-Anime-tuned-Turbo
- SigLIP2-naflex de Google: https://huggingface.co/google/siglip2-so400m-patch16-naflex
- Repositorio de CSD: https://github.com/learn2phoenix/CSD
- Pagina del modelo "rice cake" en PixAI (no relacionada de forma confirmada con este repositorio): https://pixai.art/en/model/1839136232362524999
