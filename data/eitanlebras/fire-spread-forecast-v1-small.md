# eitanlebras/fire-spread-forecast-v1-small

## Resumen

fire-spread-forecast-v1-small es un modelo de segmentación semántica geoespacial desarrollado por el usuario eitanlebras que predice, pixel a pixel, la probabilidad de que una zona esté ardiendo activamente en las próximas 24 horas durante un incendio forestal. No es un modelo de lenguaje: es una U-Net convolucional pequeña, de 1.939.073 parámetros (aproximadamente 1,94 M), entrenada desde cero sobre 258 eventos de incendio del oeste de Estados Unidos en la rejilla de 375 m del dataset WildfireSpreadTS. La entrada es un GeoTIFF diario en formato WildfireSpreadTS con 40 canales (reflectancia VIIRS, variables meteorológicas GRIDMET y GFS, terreno SRTM, sequía, cobertura del suelo MODIS y máscara de fuego activo) y la salida es un GeoTIFF de probabilidades sobre la misma rejilla.

Su relevancia radica en dos factores. Primero, el rendimiento: sobre el split de test de 2021 (30 incendios reservados por año) alcanza un AUC-PR de 0,552 ± 0,003 con 3 semillas, frente a 0,273 de la línea base de persistencia ("el fuego de mañana es el fuego de hoy"), y un error de calibración esperado (ECE, 15 bins) de 0,0044, lo que permite interpretar las salidas como probabilidades reales y no solo como rankings. Segundo, el desglose del resultado: el modelo es 54 veces mejor que el azar en la predicción de avance real del frente (AUC-PR 0,065 frente a 0,0012 de azar) y 123 veces mejor con la definición estricta de avance.

El autor publica además un ablation negativo con embeddings de OlmoEarth v1.2-Small que no aportó mejora medible, un resultado poco habitual de ver publicado. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, está licenciado bajo MIT y se distribuye íntegramente con pesos propios (sin pesos de modelos fundacionales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net convolucional (etiqueta `fire-spread-forecast-unet`), entrenada desde cero |
| Parametros totales | 1.939.073 (aproximadamente 1,94 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la entrada es un tile espacial de la rejilla de 375 m con 40 canales, sin contexto secuencial |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; los pesos se distribuyen en safetensors) |
| Idiomas soportados | no aplica (modelo de segmentacion geoespacial, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) con codigo PyTorch; la descarga requiere Git LFS |
| Tarea (pipeline) | image-segmentation |
| Entrada | GeoTIFF diario en formato WildfireSpreadTS, 40 canales, rejilla de 375 m |
| Salida | GeoTIFF de probabilidad por pixel de fuego activo en las siguientes 24 h, misma rejilla |
| Dataset de entrenamiento | WildfireSpreadTS (258 eventos de incendio del oeste de EE. UU.) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura es una U-Net convolucional de 1,94 M de parámetros, sin pesos preentrenados de ningún modelo fundacional. Se entrena desde cero sobre 258 eventos de incendio del oeste de Estados Unidos del dataset WildfireSpreadTS, con 5.576 tiles de entrenamiento según se indica en la discusión del ablation. La entrada son 40 canales en un orden fijo: bandas VIIRS M11, I2 e I1 y los índices NDVI y EVI2 (VNP09GA); precipitación total, velocidad y dirección del viento (seno), temperatura mínima y máxima, energy release component y humedad específica (GRIDMET); pendiente, orientación (seno) y elevación (derivados de SRTM); Palmer drought severity index; cobertura del suelo en one-hot sobre 17 clases (MODIS MCD12Q1); cinco variables de previsión del GFS; hora de detección de fuego activo y máscara binaria de fuego activo del día (VIIRS VNP14).

El preprocesado, implementado en `inference.py`, convierte la hora de detección hhmm a horas, aplica seno a las tres variables de dirección en grados, estandariza las 23 bandas crudas con las medias y desviaciones típicas de `config.json` (estadísticas 2018+2019 de los autores de WildfireSpreadTS), sustituye NaN por 0, convierte la cobertura del suelo a one-hot y rellena con ceros hasta un múltiplo de 32. Las predicciones sobre agua (clase de cobertura 17) se fuerzan a 0. El propio autor advierte que las estadísticas de normalización son obligatorias: `inference.py` se niega a ejecutarse si `config.json` no las contiene, porque los pesos producen salidas erróneas con alta confianza sin ellas.

La innovación técnica que el autor documenta no es arquitectónica sino metodológica: la descomposición del error en dos tareas distintas, relleno de huecos interiores (pockets sin quemar dentro del perímetro del día anterior) y avance real del frente (fuego que alcanza terreno fuera del perímetro). Esta separación revela que el modelo es mucho más fuerte en la segunda tarea relativa a su tasa de azar. También se documenta un post-entrenamiento con una proyección de 16 canales de embeddings Sentinel-2 de OlmoEarth v1.2-Small (cuatro composites mensuales previos al incendio), ajustando los dos últimos bloques transformer del encoder a lr 1e-5 y la cabeza a 1e-3 durante 20 épocas; el resultado fue AUC-PR 0,547 ± 0,006 y ECE 0,0062, es decir, sin mejora medible y con peor calibración, con sobreajuste a partir de la época 15.

## Capacidades

- Segmentación probabilística densa: asigna a cada pixel de la rejilla de 375 m la probabilidad de estar en combustión activa en las siguientes 24 horas.
- Predicción de avance del frente: capacidad diferencial frente a la persistencia, con AUC-PR de 0,065 frente a 0,0012 de azar (54 veces el azar) en la definición estándar de avance y 0,218 frente a 0,0018 (123 veces) en la definición estricta.
- Relleno de huecos interiores: detección de bolsas sin quemar dentro del perímetro previo, con AUC-PR de 0,451 frente a 0,240 de azar (1,9 veces).
- Calibración probabilística: ECE de 0,0044 con 15 bins en la ejecución de 3 semillas (0,0051 en el checkpoint publicado de la semilla 0), lo que permite usar los valores de salida como probabilidades y no como simples puntuaciones.
- Procesamiento multimodal de 40 canales: integra teledetección óptica, meteorología observada, previsión numérica, topografía, sequía y cobertura del suelo en una única pasada.
- Uso directo sobre GeoTIFF diarios en formato WildfireSpreadTS, con salida en la misma rejilla y proyección.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- Sin capacidades de visión general: los canales de entrada están fijados al esquema de 40 bandas y su orden concreto.
- Ejecución tanto en GPU CUDA como en CPU, según el código de inferencia (`load_model` acepta `cuda` o `cpu`).

## Casos de uso

- Apoyo a la asignación de recursos de extinción: el modelo genera un mapa de probabilidad a 24 horas sobre la rejilla de 375 m; con la zona de P > 0,4 como umbral, el 19 % de todo el fuego en avance de los 30 incendios de test cayó dentro de ella, lo que permite priorizar sectores concretos en los briefings operativos del día siguiente.
- Consolidación de perímetros: calcular la probabilidad de relleno interior (AUC-PR 0,451 frente a 0,240 de azar, con el 83 % del relleno interior en la zona P > 0,4) para estimar qué áreas sin señal térmica del día probablemente sigan ardiendo y no deban declararse extinguidas.
- Alerta temprana sobre terreno no quemado: la tarea de avance real (54 veces el azar en la definición estándar) es la adecuada para emitir avisos sobre zonas fuera del perímetro actual, donde la persistencia es prácticamente inútil (0,003 de AUC-PR).
- Integración en pipelines diarios de teledetección: el script `inference.py` consume directorios de evento de WildfireSpreadTS y produce GeoTIFF de predicción, de modo que puede encadenarse con descargas VIIRS/GRIDMET/GFS y con un sistema de teselas o de mapas web.
- Análisis post-evento e investigación reproducible: cada script de evaluación, las curvas y los marcos de demostración están publicados en el repositorio de GitHub, lo que permite reproducir AUC-PR, ECE y la descomposición por tarea sobre los 599 días de incendio reservados.
- Validación cruzada de modelos de propagación: la comparación con la línea base de persistencia (0,273 de AUC-PR) y con el ablation de OlmoEarth (0,547, sin mejora) sirve como referencia cuantitativa para nuevos modelos de propagación de incendios en la misma rejilla.
- Generación de capas de entrada para sistemas de decisión: al ser probabilidades calibradas, las salidas pueden multiplicarse por valores de exposición (edificaciones, infraestructura) para producir índices de riesgo esperado a 24 horas.
- Docencia y prototipado rápido: con 1,94 M de parámetros y pesos safetensors de pocos megabytes, el modelo puede ejecutarse en un portátil para ilustrar segmentación geoespacial sobre datos reales de incendios.

## Benchmarks y rendimiento

Resultados sobre el split de test de WildfireSpreadTS (año 2021, 30 incendios reservados por año, 599 días de incendio), media de 3 semillas con intervalo de confianza del 95 %. La línea base de persistencia equivale a "el fuego de mañana es el fuego de hoy".

| Metrica | Este modelo (3 semillas, IC 95 %) | Checkpoint publicado (semilla 0) | Persistencia |
|---|---|---|---|
| AUC-PR | 0,552 ± 0,003 | 0,543 | 0,273 |
| Error de calibracion esperado (15 bins) | 0,0044 | 0,0051 | no disponible |
| Region de crecimiento (AUC-PR) | 0,243 | no disponible | 0,003 |

Descomposición del fuego nuevo por tarea, con la tasa de azar propia de cada tarea:

| Tarea | AUC-PR | Tasa de azar | Ratio frente al azar |
|---|---|---|---|
| Relleno interior (huecos sin quemar dentro del perimetro) | 0,451 | 0,240 | 1,9x |
| Avance verdadero (fuego fuera del perimetro exterior) | 0,065 | 0,0012 | 54x |
| Avance estricto (huecos de la mascara cruda rellenados) | 0,218 | 0,0018 | 123x |

Cobertura por umbral: el 19 % de todo el fuego en avance, agregado sobre todos los incendios y días, cayó en la zona de P > 0,4 del modelo; en el caso del relleno interior la cifra asciende al 83 %.

Ejemplo ilustrativo (elegido a posteriori entre 599 días, por lo que debe leerse como ilustración y no como evidencia): incendio Tamarack (fire_25294746), día 12, con 160 píxeles de avance, de los cuales el 68 % quedó dentro de la zona P > 0,4 y con un AUC-PR de avance de 0,541; los huecos interiores fueron 162 píxeles con AUC-PR 0,755.

Ablation con OlmoEarth (pesos no publicados, bajo licencia de artefacto de Ai2):

| Metrica | Baseline (este modelo) | + OlmoEarth post-entrenado |
|---|---|---|
| AUC-PR | 0,552 ± 0,003 | 0,547 ± 0,006 |
| ECE | 0,0044 | 0,0062 |
| Region de crecimiento | 0,243 | 0,238 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en inferencia: no disponible de forma oficial. Estimación a partir del tamaño del modelo: los pesos ocupan aproximadamente 7,8 MB en fp32 y 3,9 MB en fp16; el consumo real está dominado por las activaciones de una entrada de 40 canales sobre la rejilla de 375 m, no por los parámetros.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU con CUDA es suficiente; una RTX 3060, RTX 4090, A100 o H100 están sobradamente dimensionadas para este modelo. El código selecciona el dispositivo con `load_model(".", "cuda")`, por lo que también admite CPU.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo con al menos unos pocos gigabytes de VRAM; también es viable en CPU para procesamiento por lotes de un evento diario.
- Opciones de despliegue: el repositorio proporciona `inference.py` sobre PyTorch, con dependencias `torch`, `numpy`, `rasterio`, `safetensors` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de segmentación de este tipo.
- Descarga: `huggingface-cli download eitanlebras/fire-spread-forecast-v1-small --local-dir fire-spread-forecast-v1-small`, o bien `git clone` con Git LFS instalado; sin Git LFS el clon contiene un puntero de 132 bytes en lugar de `model.safetensors` y la carga falla.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de tiles por segundo.
- Almacenamiento: el repositorio ocupa 0,0 GB, por lo que el despliegue en disco es trivial.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con la linea base de persistencia y con el ablation con OlmoEarth del propio autor. No se proporcionan cifras de otros modelos de propagacion de incendios (por ejemplo, las lineas base publicadas en el articulo de WildfireSpreadTS o modelos de propagacion celular), por lo que no se incluyen para no inventar datos.

| Modelo | Parametros | Contexto / entrada | AUC-PR (test 2021) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fire-spread-forecast-v1-small | 1,94 M | 40 canales, rejilla de 375 m | 0,552 ± 0,003 | 0,0044 | MIT | Pesos publicados en HuggingFace |
| Variante + OlmoEarth (post-entrenada) | 1,94 M + 3,55 M de encoder ajustables | 40 canales + 16 canales de embeddings Sentinel-2 | 0,547 ± 0,006 | 0,0062 | Licencia de artefacto de Ai2 (derivada de OlmoEarth) | Pesos no publicados |
| Persistencia ("el fuego de manana es el fuego de hoy") | 0 | 1 canal (mascara de fuego de hoy) | 0,273 | no disponible | no aplica | no aplica |

## Limitaciones y advertencias

- Ambito geografico limitado: el entrenamiento se realizó exclusivamente sobre 258 eventos de incendio del oeste de Estados Unidos, por lo que el comportamiento fuera de ese régimen (otras latitudes, otros combustibles, otros regímenes meteorológicos) no está validado.
- Resolución fija: la rejilla de 375 m implica que el modelo no resuelve fenómenos subpixel como focos pequeños, saltos de pavesa a corta distancia o estructuras.
- Dependencia crítica del preprocesado: las estadísticas de normalización de `config.json` son obligatorias. Sin ellas los pesos generan salidas erróneas pero con alta confianza, según advierte el propio autor. Cualquier reimplementación del preprocesado debe respetar el orden exacto de los 40 canales, la conversión hhmm a horas, el seno en las tres variables de dirección y el one-hot de cobertura del suelo.
- Falsos positivos en el frente de avance: el AUC-PR absoluto de la tarea de avance es bajo (0,065), aunque 54 veces superior al azar. La zona P > 0,4 solo captura el 19 % del fuego en avance, de modo que el modelo no debe usarse como única fuente para decisiones de evacuación.
- Riesgo de sobreajuste en ajustes finos: el propio ablation documenta sobreajuste a partir de la época 15 y una degradación de la calibración al añadir el encoder preentrenado, con solo 5.576 tiles de entrenamiento.
- Dependencia de fuentes externas: la calidad de la predicción depende de la disponibilidad y puntualidad de VIIRS, GRIDMET, GFS, MODIS y SRTM; retrasos en las previsiones del GFS afectan a los canales 34-38.
- Limitación estadística de la evaluación: el ejemplo del incendio Tamarack fue seleccionado a posteriori entre 599 días, por lo que no constituye evidencia independiente; deben usarse las cifras agregadas.
- Sesgos potenciales no documentados: no se publica ningún análisis de sesgo por tipo de combustible, clase de cobertura del suelo o región, más allá del filtrado de predicciones a 0 sobre agua.
- Licencia permisiva: MIT permite uso comercial y modificación sin restricciones, pero la variante con OlmoEarth está bajo la licencia de artefacto de Ai2 y no se distribuye; no debe confundirse con este checkpoint.
- Adopción nula hasta la fecha: 0 descargas y 0 likes, sin evidencia de uso en producción por terceros.
- Idioma: no aplica, pero conviene señalar que no procesa texto ni documentación en ningún idioma; las etiquetas de idioma no están disponibles en la ficha de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eitanlebras/fire-spread-forecast-v1-small
- Repositorio de codigo, pipeline de entrenamiento, mapas de demostracion y scripts de evaluacion: https://github.com/eitanlebras/fire-spread-forecast
- Dataset WildfireSpreadTS (DOI): https://doi.org/10.5281/zenodo.8006177
- OlmoEarth (Ai2), usado en el ablation: https://github.com/allenai/olmoearth_pretrain
- Marcos de demostracion adicionales de avance: directorio `demo/frames_advance_test/` del repositorio de GitHub

No se han encontrado otros enlaces relevantes en la busqueda web: los resultados devueltos corresponden a foros de Roblox y no guardan relacion con este modelo ni con la prediccion de propagacion de incendios.
