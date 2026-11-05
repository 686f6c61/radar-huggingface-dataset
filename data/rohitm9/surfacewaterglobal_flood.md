# rohitm9/surfaceWaterGlobal_flood

## Resumen

Surface Water Global – Flood es un modelo de segmentación semántica binaria de agua superficial y agua de inundación a partir de imágenes de radar Sentinel-1. Lo publica el usuario rohitm9 en Hugging Face y su propósito es generar, píxel a píxel, una probabilidad de agua (agua permanente y agua de inundación combinadas) sobre una escena Sentinel-1, con salida en GeoTIFF float32.

El repositorio contiene en realidad dos modelos entrenados con el mismo procedimiento y los mismos datos (conjuntos W + O), diferenciados únicamente por la entrada: uno usa solo las 3 bandas de Sentinel-1 y otro añade el embedding anual de AlphaEarth Foundations (AEF), reducido de 64 a 16 canales mediante una convolución 1×1 aprendida, de modo que la U-Net recibe 19 canales. Ambos se apoyan en una arquitectura FastAI ResNet-34 U-Net con pérdida combinada de entropía cruzada y Dice.

Su relevancia es operativa: permite cartografiar inundaciones a escala global con datos de radar (independientes de nubosidad y de iluminación solar), algo crítico en respuesta a emergencias y en monitorización de riesgo. El modelo se distribuye con licencia Apache 2.0, checkpoints de 165 MB cada uno y un script de inferencia (`src/infer.py`) que también funciona en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastAI ResNet-34 U-Net (encoder ResNet-34 preentrenado, decoder U-Net) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por píxel; entrada por teselas de 512 × 512 px) |
| Tipos de cuantizacion | no disponible (checkpoints en float32; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo geoespacial, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch/fastai); salida en GeoTIFF float32 |
| Entradas (S1 + AEF) | 3 bandas Sentinel-1 + 64 bandas AEF reducidas a 16 por convolución 1×1; 19 canales al U-Net |
| Entradas (S1-only) | 3 bandas Sentinel-1 |
| Umbral de decisión | 0.10 (S1 + AEF) y 0.04 (S1-only) |
| Pérdida | entropía cruzada + Dice |
| Tamaño del repo | 0.3 GB (dos checkpoints de 165 MB) |
| Framework | PyTorch 2.x + fastai 2.7, Python 3.11 |

## Arquitectura y entrenamiento

Cada modelo es una U-Net con encoder ResNet-34 implementada en fastai. La variante S1 + AEF recibe 19 canales: 3 bandas de Sentinel-1 más 16 canales obtenidos al aplicar una convolución 1×1 aprendida sobre el embedding anual de 64 bandas de AlphaEarth Foundations (sin dropout sobre AEF, valor 0.0). La variante S1-only recibe únicamente las 3 bandas de radar. La salida es una probabilidad de agua por píxel y el checkpoint publicado corresponde a la semilla 42 de cada modelo, aunque la evaluación reportada promedia tres semillas de entrenamiento (42, 43 y 44).

Los datos de entrenamiento combinan dos fuentes: el conjunto W, con teselas débilmente etiquetadas de Sen1Floods11 de 512 px para entrenamiento y teselas etiquetadas manualmente para validación, y el conjunto O, con teselas globales post-inundación propias de 2.072 px en EPSG:3857 cuyas etiquetas provienen de la banda `label` de Dynamic World (todas las clases de agua). En total son 6.994 teselas de entrenamiento (3.994 de W y 3.000 de O) y 504 de validación (86 de W y 418 de O). Cada época cubre una vez todas las subtessellas de 512 × 512 de cada tesela, con ponderación de píxeles por área, y los píxeles con VV o VH ausentes se ignoran en la pérdida. El checkpoint guardado es el mejor de todas las etapas según el IoU de agua promediado por igual entre las dos fuentes de validación.

## Capacidades

- Segmentación semántica binaria de agua por píxel: devuelve `P(water)` combinando agua permanente y agua de inundación.
- Funciona con radar de apertura sintética (Sentinel-1, bandas VV/VH), por lo que es independiente de la cobertura nubosa y de la hora del día.
- Dos modos de inferencia: solo Sentinel-1 o Sentinel-1 más embedding AEF, con umbrales de decisión calibrados distintos (0.04 y 0.10).
- Salida geoespacial directa: GeoTIFF float32 con valor de nodata −9999, listo para SIG.
- Inferencia en CPU y en GPU; con test-time augmentation ronda los 3 s por escena de 768 × 768 en una A100.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión geoespacial.

## Casos de uso

- Cartografía rápida de inundaciones en emergencias: dada una escena Sentinel-1 posterior a un evento, el modelo genera un mapa de probabilidad de agua que los equipos de respuesta pueden superponer a capas de población e infraestructura, sin depender de imágenes ópticas bloqueadas por nubes.
- Monitorización global de agua superficial: con teselas de 2.072 px en EPSG:3857 y etiquetas derivadas de Dynamic World, el pipeline está pensado para producción a escala global y series temporales.
- Evaluación de daños en seguros y agricultura: la máscara de agua permite estimar superficie inundada por parcela o por evento y cuantificar pérdidas con evidencia satelital reproducible.
- Alerta temprana y modelado hidrológico: la salida de probabilidad por píxel puede alimentar modelos de propagación de crecidas o umbrales de alerta en cuencas con cobertura Sentinel-1 frecuente.
- Validación cruzada con productos ópticos: al usar radar, sirve para contrastar mapas de agua derivados de Sentinel-2 o Landsat y detectar discrepancias en zonas con nubes persistentes.
- Investigación en teledetección: la comparación controlada entre S1-only y S1 + AEF (mismos datos y entrenador) permite estudiar cuánto aporta un embedding fundacional geoespacial a la segmentación de inundaciones.
- Despliegue en entornos sin GPU: al correr en CPU, permite integrar la inferencia en servidores modestos o en pipelines batch nocturnos sin infraestructura acelerada.

## Benchmarks y rendimiento

La model card reporta comparaciones de IoU entre las dos variantes sobre varios conjuntos de test, con intervalos de bootstrap por evento, pero no incluye valores absolutos de IoU en la información disponible. Los datos cualitativos y diferencias publicadas son:

| Conjunto de test | Comparación S1-only vs S1 + AEF |
|---|---|
| PS9, FP60, Kuro Siwo, Bolivia | Diferencias entre −0.031 y +0.017 IoU; todos los intervalos incluyen cero |
| PS53 | S1 + AEF obtiene +0.087 IoU [+0.044, +0.132] |
| C2S-MS | S1 + AEF aproximadamente +0.08 IoU (el intervalo incluye cero) |
| Tasa de falsas alarmas en tierra normalmente seca (PS9) | 0.115 para S1-only frente a 0.072 para S1 + AEF |

No se han publicado en la información disponible valores absolutos de MMLU, HumanEval, GSM8K ni métricas equivalentes, que además no aplican a este tipo de modelo. Los ficheros `evaluation/summary_all_tests.csv`, `per_seed.csv`, `per_event.csv` y `contrasts_event_bootstrap.csv` del repositorio contienen el detalle completo de IoU, precisión y recall por evento y semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los checkpoints pesan 165 MB cada uno y la U-Net ResNet-34 opera sobre teselas de 512 × 512, por lo que cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: A100 para throughput alto (unos 3 s por escena de 768 × 768 con test-time augmentation); H100, L4, T4 o RTX 4090 también son válidas.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos unos pocos GB de VRAM; también en CPU.
- Opciones de despliegue: inferencia nativa con `src/infer.py` (PyTorch + fastai); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 3 s por escena de 768 × 768 en A100 con test-time augmentation; no se publican cifras para CPU ni para otras GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| surfaceWaterGlobal_flood (S1-only) | U-Net ResNet-34 | Sentinel-1 (3 bandas) | Apache 2.0 | Hugging Face, 165 MB |
| surfaceWaterGlobal_flood (S1 + AEF) | U-Net ResNet-34 | Sentinel-1 + AEF (19 canales) | Apache 2.0 | Hugging Face, 165 MB |
| rohitm9/surfaceWaterGlobal | Modelo de agua superficial del mismo autor | no disponible en la información proporcionada | no disponible | Hugging Face |
| Sen1Floods11 (referencia de datos y modelos) | Conjunto de datos y baseline de inundaciones | Sentinel-1 | no disponible | público |

No se dispone en la información proporcionada de comparaciones numéricas con otros modelos de segmentación de inundaciones (por ejemplo, baselines de Sen1Floods11 o modelos tipo Prithvi); los ficheros de evaluación del repositorio incluyen modelos de referencia, pero sus valores no se detallan en la model card.

## Limitaciones y advertencias

- El modelo solo detecta agua; no distingue entre agua permanente y agua de inundación, pese a que la etiqueta combina ambas.
- La variante S1-only produce más falsas alarmas en tierra normalmente seca (0.115 frente a 0.072 en PS9), lo que puede inflar la superficie inundada estimada.
- La variante S1 + AEF requiere descargar el embedding anual de AlphaEarth Foundations para cada área y año, lo que añade complejidad operativa.
- Los umbrales de decisión (0.10 y 0.04) están calibrados sobre los conjuntos de validación; usarlos fuera de ese dominio puede degradar precisión y recall.
- Solo se publica el checkpoint de la semilla 42; la variabilidad entre semillas no está incluida en los pesos distribuidos.
- Los píxeles con VV o VH ausentes se ignoran durante el entrenamiento, por lo que escenas con cobertura parcial pueden dar resultados menos fiables.
- Las etiquetas del conjunto O provienen de Dynamic World, con los sesgos y errores de ese producto.
- No hay información sobre sesgos geográficos o de tipo de terreno más allá de los conjuntos de test citados; la validación se concentra en unos pocos eventos y regiones.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar `THIRD_PARTY_NOTICES.md` por las dependencias y datos de terceros.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no debe evaluarse con benchmarks de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohitm9/surfaceWaterGlobal_flood
- Modelo de agua superficial relacionado: https://huggingface.co/rohitm9/surfaceWaterGlobal
- Sen1Floods11 (origen de los datos W): no se proporciona enlace en la información disponible
- AlphaEarth Foundations (AEF): no se proporciona enlace en la información disponible
- Dynamic World (etiquetas del conjunto O): no se proporciona enlace en la información disponible
- Artículo o blog del autor: no disponible
