# ShashwatVj/assam-landcover-forest-loss-unet

## Resumen

El modelo `assam-landcover-forest-loss-unet` es una U-Net multitarea implementada en TensorFlow/Keras que aborda dos tareas de segmentación semantica sobre imagenes satelitales Sentinel-2: clasificacion de cobertura del suelo en cinco clases (arbolado, pastizal, cultivo, suelo construido y agua, siguiendo las clases de ESA WorldCover 2021) y deteccion de perdida bruta de cobertura forestal entre 2021 y 2023 segun la definicion de Hansen Global Forest Change v1.12. Lo desarrolla ShashwatVj como proyecto de fin de carrera, con el codigo y la documentacion completos publicados en un repositorio de GitHub.

El modelo opera sobre pares de composiciones medianas bi-temporales de Sentinel-2 L2A en epoca seca (noviembre-febrero de 2021 y de 2024), remuestreadas a 30 m, con seis bandas por fecha (B2, B3, B4, B8, B11, B12) y canales derivados NDVI y NBR calculados antes, despues y como diferencia. La entrada efectiva es de 18 canales y las teselas de entrenamiento son de 128 x 128 pixeles. El repositorio ocupa 0,2 GB y el modelo final corresponde al experimento E3.

Su relevancia es acotada pero concreta: es un ejemplo reproducible y documentado de segmentacion multitarea aplicada a teledeteccion en una region concreta de India (Kaziranga / Karbi Anglong, Assam), con metricas de validacion y test publicadas, seleccion de modelo documentada y artefactos de inferencia (estadisticas de normalizacion y umbral calibrado) incluidos en el repositorio. No es un modelo de proposito general ni compite con los grandes modelos multimodales; su valor esta en el pipeline y en la evaluacion geografica held-out.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net multitarea (encoder-decoder convolucional) en TensorFlow/Keras |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por teselas; entrada 128 x 128 px, alto y ancho multiplos de 16) |
| Tipos de cuantizacion | no disponible (pesos en formato Keras nativo; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de imagen, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | `.keras` (`best.keras`, cargar con `compile=False`) |
| Entrada | 18 canales: 12 bandas Sentinel-2 (pre/post B2, B3, B4, B8, B11, B12) + NDVI y NBR pre, post y diferencia |
| Salidas | `landcover` (H, W, 5) softmax; `deforestation` (H, W, 1) sigmoid |
| Resolucion espacial | 30 m |
| Fechas de las composiciones | pre: 1 nov 2020 – 28 feb 2021; post: 1 nov 2023 – 29 feb 2024 |
| Region de estudio | Kaziranga / Karbi Anglong (Assam, India) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net multitarea con dos cabezas de salida: una cabeza de clasificacion por pixel con softmax de cinco clases para cobertura del suelo y una cabeza binaria con sigmoid para perdida forestal. El experimento final (E3) incorpora mejoras incrementales respecto a la linea base: upsampling bilineal en el decodificador en lugar de convolucion transpuesta, limite del peso de clase a 3 (frente a 10 en la linea base), canales NDVI/NBR pre, post y de cambio (18 entradas en lugar de 12) y entrenamiento con teselas solapadas de stride 64 sobre parches de 128 x 128.

El entrenamiento se realiza sobre composiciones medianas bi-temporales de Sentinel-2 L2A en reflectancia superficial escalada a uint16 (x10000). Las etiquetas de referencia son ESA WorldCover 2021 para cobertura del suelo y Hansen Global Forest Change v1.12 para perdida forestal bruta. La seleccion de modelo se hizo exclusivamente sobre validacion, reservando la region geografica de test para una unica evaluacion del ganador. El repositorio incluye estadisticas de normalizacion calculadas solo sobre la region de entrenamiento (`band_stats.json`), pesos de clase, curvas de entrenamiento por epoca y un umbral de decision para perdida forestal calibrado en validacion (0,70). No se documenta el numero total de tokens ni el volumen exacto del dataset de entrenamiento en la informacion disponible.

## Capacidades

- Segmentacion semantica de cobertura del suelo en cinco clases: arbolado, pastizal, cultivo, suelo construido y agua.
- Deteccion de perdida bruta de cobertura forestal entre 2021 y 2023 mediante mapa de probabilidad por pixel.
- Procesamiento bi-temporal: compara dos composiciones Sentinel-2 y explota indices espectrales de cambio (NDVI y NBR antes, despues y diferencia).
- Inferencia por teselas con requisito de dimensiones multiplos de 16; el autor menciona procesamiento de escenas completas en la documentacion del repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision por pixel.
- No tiene capacidades multilingues ni de audio.
- Capacidad especial: cabecera multitarea con perdida compartida y umbral de decision ajustable para la tarea binaria.

## Casos de uso

- Monitorizacion de deforestacion en Assam: el modelo genera mapas de probabilidad de perdida forestal sobre pares de imagenes Sentinel-2 de la region, utiles para alertas tempranas en zonas de conflicto entre conservacion y agricultura como el corredor de Kaziranga.
- Apoyo a inventarios de cobertura del suelo: la cabeza de cinco clases permite derivar mapas tematicos a 30 m compatibles con la leyenda de ESA WorldCover 2021, utilizables como capa auxiliar en estudios territoriales.
- Deteccion de cambios en la llanura del Brahmaputra: la combinacion de NDVI/NBR pre, post y de cambio permite identificar perdidas de vigor vegetal y perturbaciones por incendios o cambios de cauce fluvial.
- Investigacion academica y docencia: el repositorio incluye configuraciones, estadisticas de normalizacion, curvas de entrenamiento y metricas de validacion y test, lo que lo convierte en un caso reproducible para ensenar pipelines de segmentacion multitarea en teledeteccion.
- Prototipado de sistemas de alerta con Sentinel-2: el modelo puede integrarse en un pipeline que descargue composiciones medianas estacionales y ejecute inferencia por teselas para generar mascaras de perdida forestal.
- Analisis de expansion agricola y asentamientos: las clases cultivo y suelo construido permiten cuantificar presion antropica sobre areas boscosas, aunque con IoU bajo en suelo construido (0,398) que limita su uso en informes oficiales.
- Evaluacion comparativa de arquitecturas: sirve como referencia para comparar variantes de U-Net (convolucion transpuesta frente a upsampling bilineal, con y sin indices espectrales, con y sin teselas solapadas) en tareas de cambio de cobertura.

## Benchmarks y rendimiento

Resultados sobre region geografica de test held-out (108 parches de 128 x 128 px), medidos como concordancia con las etiquetas de referencia (ESA WorldCover 2021 y Hansen GFC v1.12), no como exactitud verificada independientemente.

| Tarea | Metrica | Modelo final (E3) | Baseline | Baseline trivial |
|---|---|---|---|---|
| Cobertura del suelo | Exactitud global (OA) | 0,889 | 0,877 | 0,644 (clase mayoritaria) |
| Cobertura del suelo | mIoU / mDice | 0,600 / 0,708 | 0,561 / 0,669 | 0,129 |
| Cobertura del suelo | IoU arbolado / cultivo / agua / construido / pastizal | 0,900 / 0,744 / 0,789 / 0,398 / 0,169 | 0,890 / 0,720 / 0,771 / 0,266 / 0,159 | no disponible |
| Perdida forestal | Precision / Recall / F1 / IoU | 0,449 / 0,694 / 0,545 / 0,375 | 0,391 / 0,702 / 0,502 / 0,335 | no disponible |
| Perdida forestal | PR-AUC | 0,584 | 0,558 | 0,0105 (aleatorio) |
| Perdida forestal | Umbral de decision | 0,70 | 0,43 | no disponible |

Seleccion de modelo sobre validacion:

| Carpeta | Modelo | Cambio | mIoU val | PR-AUC val | Score |
|---|---|---|---|---|---|
| `experiments/baseline` | Baseline | 12 bandas, decodificador con convolucion transpuesta, tope de peso de clase 10 | 0,581 | 0,462 | 1,044 |
| `experiments/e1` | E1 | Upsampling bilineal, tope de peso de clase 3 | 0,573 | 0,485 | 1,057 |
| `experiments/e2` | E2 | Canales NDVI/NBR pre, post y cambio (18 entradas) | 0,591 | 0,478 | 1,069 |
| root | E3 (final) | Teselas de entrenamiento solapadas (stride 64) | 0,628 | 0,502 | 1,130 |
| `experiments/baseline_repeat` | Baseline, 2a ejecucion | Misma configuracion que baseline | no disponible | no disponible | test OA 0,877, mIoU 0,559, F1 0,511, PR-AUC 0,558 |

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El repositorio pesa 0,2 GB, lo que sugiere un modelo de tamano moderado que probablemente cabe en GPUs de consumo, pero no se documenta la huella de memoria en inferencia.
- GPU recomendadas: no disponibles. Al ser un modelo convolucional pequeno de Keras/TensorFlow, es probable que funcione en GPUs de gama media, pero el autor no publica requisitos.
- Cabe en GPU de consumo: probablemente si, dado el tamano del repositorio, pero no confirmado por el autor.
- Opciones de despliegue: TensorFlow/Keras nativo (carga con `keras.models.load_model(..., compile=False)`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Requisito de inferencia: las estadisticas de normalizacion (`band_stats.json`) y el umbral (`threshold.json`) son obligatorios; alto y ancho de entrada deben ser multiplos de 16.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos de segmentacion de cobertura del suelo o deforestacion en la informacion proporcionada. Como alternativas conceptuales de la misma categoria podrian citarse modelos de segmentacion semantica de teledeteccion basados en U-Net o DeepLab entrenados sobre Sentinel-2, pero no se aportan datos de parametros, contexto, rendimiento ni licencia que permitan una comparacion rigurosa. Por tanto, la comparativa se considera no disponible.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assam-landcover-forest-loss-unet | no disponible | 128 x 128 px, 18 canales | mIoU 0,600; PR-AUC 0,584 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las metricas miden concordancia con etiquetas de referencia (ESA WorldCover 2021 y Hansen GFC v1.12), no exactitud verificada contra verdad de campo; el propio autor lo advierte.
- "Perdida forestal" se refiere a perdida bruta de cobertura forestal (incluye tala, cultivo itinerante, incendios y cambio de cauce), no estrictamente a deforestacion antropogenica.
- El modelo esta entrenado y evaluado en una region concreta de Assam (India); su generalizacion a otras geografias, biomas o condiciones atmosfericas no esta demostrada.
- El IoU de pastizal (0,169) y suelo construido (0,398) es bajo, lo que limita el uso de esas clases en productos cartograficos.
- La precision de la tarea de perdida forestal es 0,449 con umbral 0,70: genera falsos positivos apreciables y no es apta como unica fuente para decisiones regulatorias.
- La licencia no esta declarada, lo que impide asumir permisos de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- No se documentan sesgos especificos, pero al depender de etiquetas globales (WorldCover, Hansen) hereda sus limitaciones de resolucion y exactitud en la region.
- El modelo requiere exactamente el orden de canales, la normalizacion y los indices descritos; un uso incorrecto del preprocesado invalida los resultados.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier caso de uso debe plantearse como segmentacion de imagenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShashwatVj/assam-landcover-forest-loss-unet
- Codigo, pipeline y documentacion: https://github.com/Shashwat-Vijayvergiya/Satellite
- ESA WorldCover 2021 (etiquetas de referencia): https://esa-worldcover.org/
- Hansen Global Forest Change v1.12 (etiquetas de referencia): https://glad.earthengine.app/view/global-forest-change
- Sentinel-2 L2A (Copernicus): https://dataspace.copernicus.eu/
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
