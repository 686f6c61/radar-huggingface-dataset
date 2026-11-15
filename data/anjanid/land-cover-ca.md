# anjanid/land-cover-ca

## Resumen

land-cover-ca v2 es un modelo de segmentación semántica de cobertura terrestre para imágenes de satélite Sentinel-2 L2A, afinado a partir del modelo fundacional geoespacial Prithvi-EO-2.0-300M de IBM y NASA. Lo desarrolla Centauri Research (Alpha Centauri Ventures Inc.) como parte de LakePulse, una propuesta para el NASA Space Apps Challenge de 2026. El modelo clasifica cada píxel de 30 m de un compuesto mediano de verano en seis clases: bosque, cultivo, superficie artificial, agua, humedal y otros.

El problema que aborda es la resolución espacial: los mapas de cobertura terrestre globales como MODIS MCD12Q1 trabajan a 500 m, insuficiente para resolver la franja de 30 m próxima a la costa del lago Simcoe (Ontario) y sus afluentes, donde se produce la escorrentía que entra al lago. El modelo está entrenado y evaluado exclusivamente en esa región del sur de Ontario.

Técnicamente se trata de un transformer (Prithvi-EO-2.0-300M) con un decodificador UNet sobre las capas 5, 11, 17 y 23 del backbone, gestionado mediante TerraTorch 1.2.14. El repositorio ocupa 1,9 GB y los pesos se distribuyen en fp16. La licencia es Apache 2.0. Es relevante como ejemplo de adaptación de un modelo fundacional geoespacial a una tarea de segmentación local con validación por área geográfica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Prithvi-EO-2.0-300M con decodificador UNet sobre capas 5, 11, 17 y 23 |
| Parametros totales | 300M (backbone); total con decodificador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por chips de 224 x 224 pixeles) |
| Tipos de cuantizacion | fp16 (pesos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | no aplica (modelo de vision geoespacial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16), con configuracion YAML de TerraTorch |
| Bandas de entrada | BLUE, GREEN, RED, NIR_NARROW (B8A), SWIR_1, SWIR_2 a 30 m |
| Clases de salida | forest, cropland, built_up, water, wetland, other |
| Resolucion espacial | 30 m |
| Libreria | TerraTorch 1.2.14 |
| Tamano del repositorio | 1,9 GB |

## Arquitectura y entrenamiento

El modelo parte del backbone Prithvi-EO-2.0-300M (revision `9eb1b1102806593963daa333bcc491b1c6f8562f`), un transformer preentrenado con datos de observacion de la Tierra, y le anade un decodificador UNet que combina las capas 5, 11, 17 y 23. La entrada son seis bandas de Sentinel-2 L2A (BLUE, GREEN, RED, NIR_NARROW, SWIR_1, SWIR_2) como reflectancia de superficie, remuestreadas a 30 m, con los pixeles sin dato puestos a 0 y normalizadas con las medias y desviaciones estandar de `norm_stats.json`. La salida es una clasificacion por pixel en seis clases.

El entrenamiento uso 636 chips de entrenamiento y 30 de validacion, extraidos de compuestos medianos de verano de 2019, 2020 y 2021, todos etiquetados contra el mapa Land Cover of Canada de 2020. El area cubre 13 unidades hidrologicas alrededor del lago Simcoe mas 22 unidades vecinas en un radio de 15 km (12.529,4 km²). La validacion se hizo sobre la unidad del rio Pefferlaw. Se uso entropia cruzada ponderada por la inversa de la raiz cuadrada de la proporcion de cada clase (pesos: bosque 0,3479; cultivo 0,4308; artificial 0,8362; agua 0,6651; humedal 2,5612; otros 1,1588), AdamW con tasa 1e-4, batch 8 y precision mixta bf16 en una A100 de Google Colab. El entrenamiento se interrumpio en la epoca 24 y se reanudo desde los mejores pesos de la epoca 19 con un optimizador nuevo.

## Capacidades

- Segmentacion semantica densa de cobertura terrestre en seis clases sobre imagenes Sentinel-2 L2A.
- Trabajo a resolucion de 30 m, adecuada para franjas riberenas y zonas de escorrentia que MODIS no resuelve.
- Entrada multibanda con seis canales espectrales (visible, NIR estrecho y dos SWIR).
- Procesamiento por chips de 224 x 224 pixeles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking ni de entrada de audio.
- Incluye en el repositorio modelos de ablacion (v1 y v2 sin pesos de clase) para reproducir la comparacion.

## Casos de uso

- Monitorizacion de escorrentia en la cuenca del lago Simcoe: el modelo clasifica la franja de 30 m junto a la costa y los afluentes, donde se concentra el aporte de nutrientes al lago, algo que los mapas de 500 m no pueden resolver.
- Planificacion de conservacion de humedales y riberas: aunque la clase wetland tiene IoU bajo (0,0846), sirve como capa de triaje para priorizar inspecciones de campo en zonas candidatas.
- Seguimiento de expansion urbana en el sur de Ontario: la clase built_up (IoU 0,5727) permite comparar compuestos de verano de distintos anos sobre la misma area de entrenamiento.
- Analisis de cambio de uso del suelo entre 2019 y 2021: al haberse entrenado con compuestos de esos tres anos, puede aplicarse a series temporales de la misma region para detectar transiciones entre cultivo, bosque y artificial.
- Apoyo a inventarios agricolas locales: la clase cropland alcanza el IoU mas alto (0,801), util para estimar superficie cultivada en las unidades hidrologicas cubiertas.
- Cartografia de agua superficial: la clase water obtiene IoU 0,9044, adecuada para delimitar lagos, rios y embalses en la region de entrenamiento.
- Generacion de capas auxiliares para modelos hidrologicos: la salida por pixel puede alimentar modelos de calidad del agua que necesiten fracciones de uso del suelo en la cuenca.

## Benchmarks y rendimiento

Evaluacion sobre un bloque de test separado por area (cuenca del rio Holland mas 10 km de costa, 541,3 km², 11 chips de 224 x 224, 474.703 pixeles etiquetados). Los chips a menos de 6,72 km de un chip de test se excluyeron de entrenamiento y validacion. Metrica: IoU medio sobre las seis clases.

| Modelo | Bloque de test completo | Franja de 30 m en costa y afluentes |
|---|---|---|
| land-cover-ca v2 (con pesos de clase) | 0,5145 | 0,4040 |
| v2 sin pesos de clase | 0,4983 | 0,3860 |
| Gradient boosting por pixel (mismas bandas y datos) | 0,4794 | 0,3684 |
| v1 (solo imagenes de 2020, 86 chips) | 0,4724 | 0,3558 |
| Clase mayoritaria (bosque) | 0,0293 | 0,0384 |

IoU por clase en el bloque completo: bosque 0,655; cultivo 0,801; artificial 0,5727; agua 0,9044; humedal 0,0846; otros 0,069.

Sondas adversariales (un chip cada una, IoU medio): escena nublada sin enmascarado de nubes 0,2117; escena invernal 0,0484; chip en el borde de la cuenca 0,3211; chip mayoritariamente agua (96,5%) 0,386; mitad agua y mitad costa 0,4875.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con un backbone de 300M y pesos fp16, la inferencia por chips de 224 x 224 es ligera y cabe en GPUs de consumo, aunque el dato exacto no se publica.
- GPU de entrenamiento documentada: Google Colab A100 con precision mixta bf16.
- GPU recomendadas para entrenamiento: A100 o equivalentes con al menos 40 GB; para inferencia, cualquier GPU con suficiente memoria para un modelo de 300M en fp16.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del backbone, aunque no se aportan mediciones.
- Opciones de despliegue: TerraTorch 1.2.14 (libreria oficial del modelo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| land-cover-ca v2 | 300M (backbone) | Chips 224 x 224, 6 bandas, 30 m | IoU medio 0,5145 en test local | Apache 2.0 | Hugging Face |
| Prithvi-EO-2.0-300M (base) | 300M | Series temporales multiespectrales | No evaluado en esta tarea | Apache 2.0 (segun modelo base) | Hugging Face (IBM/NASA) |
| Gradient boosting por pixel | no aplica | Mismas 6 bandas | IoU medio 0,4794 en test local | no disponible | Referencia interna del autor |
| MODIS MCD12Q1 | no aplica | 500 m, cobertura global | No comparable a 30 m; el autor reporta desviaciones de 23,42, 15,16 y 11,59 puntos porcentuales en bosque, cultivo y urbano | no disponible | Producto NASA |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento proceden del mapa Land Cover of Canada de 2020 (precision global declarada del 86,9% con 832 muestras), no de verdad de campo; todas las metricas miden acuerdo con ese mapa.
- Entrenado y evaluado solo en el entorno del lago Simcoe, sur de Ontario; el rendimiento en otras regiones es desconocido.
- La clase wetland esta mal resuelta (IoU 0,0846) y la clase other tambien (0,069); no son fiables para analisis cuantitativo.
- Los compuestos con bruma sesgan los resultados: el compuesto de verano de 2025 (probablemente humo de incendios) reduce la clase bosque y aumenta la artificial.
- Solo debe usarse con compuestos de verano con enmascarado de nubes; sin enmascarado el IoU cae a 0,2117 y en escenas invernales a 0,0484.
- Frente a MODIS MCD12Q1 (2017-2025), las proporciones de bosque, cultivo y urbano del modelo son 23,42, 15,16 y 11,59 puntos porcentuales superiores de media; sigue el mapa federal de 2020 en el que se entreno.
- Los chips en el borde de la cuenca rinden peor (IoU 0,3211).
- Licencia Apache 2.0, que permite uso comercial, pero el modelo es una estimacion y no una medicion; no debe usarse como sustituto de datos de campo en decisiones regulatorias.
- No se documentan sesgos mas alla de los derivados del mapa de etiquetas y de la region de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anjanid/land-cover-ca
- Modelo base Prithvi-EO-2.0-300M: https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M
- TerraTorch (libreria de despliegue): https://github.com/IBM/terratorch
- NASA Space Apps Challenge: https://www.spaceappschallenge.org/
- No se han encontrado en la busqueda web papers, blogs ni demos adicionales relacionados con este modelo; los resultados de busqueda disponibles tratan sobre finanzas descentralizadas y no son relevantes.
