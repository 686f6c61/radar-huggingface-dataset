# DUET-Bench/squade-vitg

## Resumen

SQuaDE ViT-g es un clasificador de imágenes diseñado para la detección de imágenes generadas por IA (AIGI) y deepfakes, presentado al concurso NTIRE 2026 Robust AIGI Detection. Lo desarrolla el equipo DUET-Bench y se distribuye bajo licencia MIT. El modelo no es una red completa entrenada desde cero: se apoya en un backbone DINOv2 ViT-g congelado (cargado en tiempo de ejecución desde `facebook/dinov2-giant`) y añade únicamente un conjunto ligero de cabezas expertas y una compuerta binaria que se publican en este repositorio (0,1 GB).

La innovación principal es un esquema de salida temprana condicionada: las imágenes consideradas «limpias» se clasifican con tres cabezas situadas en los bloques 14, 21 y 27 del backbone, mientras que las imágenes degradadas se enrutan a tres cabezas más profundas (bloques 26, 33 y 37). La compuerta decide la ruta leyendo las características superficiales, lo que reduce en torno al 18 % la profundidad de paso hacia delante en el conjunto de datos oficial. Cada ruta produce tres votos independientes cuya dispersión sirve como señal de incertidumbre para revisión humana.

El modelo es relevante porque aborda un problema práctico de forense digital —distinguir imágenes sintéticas de fotografías reales incluso bajo degradaciones como recompresión JPEG o reescalado— con un coste computacional contenido y con una documentación inusualmente honesta sobre sus límites: el autor advierte de que parte de las particiones oficiales de validación se usaron en entrenamiento y de que la hipótesis original sobre profundidad óptima por tipo de degradación no se sostuvo en pruebas estadísticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone DINOv2 ViT-g congelado (ViT con patch size 14) más cabezas expertas ligeras y compuerta binaria de salida temprana |
| Parametros totales | No disponible (el backbone no se incluye en el repositorio; solo se publican las cabezas y la compuerta) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen 512×512 recortada a 504×504) |
| Tipos de cuantizacion | No disponible (pesos en PyTorch; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (modelo de clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | MIT (los pesos de DINOv2 tienen su propia licencia, distinta de la del repositorio) |
| Formato de pesos | PyTorch (`.pt`), con ficheros `stage1.pt` por ruta y `mix2_gate.pt` para la compuerta |

## Arquitectura y entrenamiento

La arquitectura combina un ViT gigante de DINOv2, que permanece congelado, con dos grupos de tres cabezas expertas cada uno. El grupo «superficial» lee las activaciones de los bloques 14, 21 y 27; el grupo «profundo», las de los bloques 26, 33 y 37. Una compuerta binaria, entrenada sobre las características del grupo superficial, decide si la imagen es «limpia» (ruta superficial, 27 bloques) o «degradada» (ruta profunda, 37 bloques). La salida final es la media de los tres votos de la ruta elegida, y la diferencia máxima entre votos (`vote_spread`) se expone como indicador de cercanía a la frontera de decisión.

El entrenamiento se realizó para el reto NTIRE 2026 y pasó por tres versiones. La v2 aumentó la proporción de datos NTIRE del 11,4 % al 37,9 %, incorporó parte del rango oficial de distorsiones y añadió el 70 % de la partición oficial de validación. La v3 partió de los pesos de v2 (calentamiento de 8 épocas a learning rate 1e-4) e incorporó el 70 % de la partición `val_hard`, lo que elevó la métrica robusta en held-out de 0,8068 a 0,8674. El preprocesado es determinista y compartido entre entrenamiento e inferencia: si el lado corto es mayor o igual a 512 se recorta el centro a 512×512 sin remuestreo; si es menor, se recorta a cuadrado y se reescala con uno de cuatro núcleos (BILINEAR, BICUBIC, BOX, LANCZOS) elegido de forma determinista por nombre de fichero, para después recortar a 504×504 (múltiplo de 14).

Un aspecto técnico destacable es la validación negativa documentada: la hipótesis de que distintas degradaciones exigen distintas profundidades de lectura forense fue refutada en 13 mediciones independientes (la mejor, con validación cruzada fuera de pliegue, dio +0,117 puntos con p = 0,323). Lo que sí se sostiene empíricamente es la fusión uniforme multi-profundidad (ganancia de 1,67 a 5,89 puntos frente al mejor experto individual) y la salida temprana con compuerta limpio/degradado.

## Capacidades

- Clasificación binaria de imágenes: devuelve una puntuación entre 0 y 1 donde valores altos indican mayor probabilidad de que la imagen sea generada por IA.
- Detección de deepfakes y de contenido sintético en imágenes, incluyendo escenarios con degradaciones (recompresión, reescalado, ruido).
- Fusión multi-experto con tres votos por ruta, lo que permite estimar incertidumbre mediante `vote_spread`.
- Enrutamiento adaptativo con salida temprana: reduce la profundidad de cómputo en imágenes limpias.
- Procesamiento por lotes (`--batch-size`) y modo sin salida temprana (`--no-early-exit`) para verificar que el enrutamiento no altera el resultado.
- Ejecución en CPU (`--device cpu`) como modo de emergencia, con penalización de velocidad.
- No soporta tool calling, agentes, razonamiento multi-paso, visión generativa, audio ni capacidades multilingües: es exclusivamente un clasificador de imágenes.

## Casos de uso

- Moderación de contenido en plataformas: integrado como filtro previo a revisión humana, el modelo puntúa cada imagen subida y marca para inspección aquellas con `score` alto o con `vote_spread` elevado, que según la documentación son las más cercanas a la frontera de decisión.
- Verificación periodística: un medio puede pasar por lotes las imágenes recibidas de agencias o redes sociales y obtener un CSV con puntuación, ruta y votos por imagen, lo que permite priorizar la verificación manual de las candidatas a sintéticas.
- Forense digital en investigación: para pericias sobre capturas o imágenes reenviadas, el modelo ofrece una señal cuantitativa reproducible junto con la ruta usada y el número de bloques ejecutados, lo que facilita documentar el análisis.
- Detección en pipelines de ingestión de datasets: al construir corpus de entrenamiento o evaluación, el clasificador puede separar imágenes reales de generadas antes de etiquetarlas, reduciendo contaminación del conjunto.
- Monitorización de marketplaces y anuncios: filtrado automatizado de imágenes de producto potencialmente generadas o manipuladas, con revisión priorizada por dispersión de votos.
- Investigación en detección de AIGI: el repositorio publica particiones fijas (`val_split_70_30.json`, `valhard_split_70_30.json`) y tres versiones de pesos, lo que permite reproducir comparativas y estudiar el efecto de la salida temprana.
- Despliegue en entornos con GPU de 24 GB: con `--batch-size 16` según la model card, encaja en tarjetas consumer de gama alta para procesamiento por lotes de moderación.

## Benchmarks y rendimiento

Resultados reportados por el autor únicamente sobre particiones held-out (el 30 % restante de las particiones oficiales, nunca usado en entrenamiento):

| Conjunto | Esquema | Global | Clean | Robust | ±SE |
|---|---|---|---|---|---|
| val held-out (3.000) | shallow-only | 0,9922 | 0,9978 | 0,9833 | 0,23 |
| val held-out (3.000) | gated route | 0,9911 | 0,9977 | 0,9809 | 0,23 |
| val_hard held-out (750) | shallow-only | 0,9430 | 0,9904 | 0,8674 | 1,8 |
| val_hard held-out (750) | gated route | 0,9423 | 0,9857 | 0,8781 | 1,8 |

Comparativa entre versiones del propio modelo:

| Métrica | v1 | v2 | v3 |
|---|---|---|---|
| val_hard held-out robust | no disponible | 0,8068 | 0,8674 |
| val_hard held-out global | no disponible | 0,9111 | 0,9430 |
| val held-out robust | 0,9629 | 0,9830 | 0,9833 |
| AUC de la compuerta (val_hard) | 0,7684 | 0,9072 | 0,9464 |

La métrica `robust` se calcula solo sobre imágenes degradadas y es la métrica principal del concurso. La salida temprana ahorra aproximadamente un 18 % de profundidad de paso hacia delante. No se han publicado resultados frente a modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. La model card indica que con 24 GB de VRAM se puede usar `--batch-size 16`; con `--batch-size 8` el requisito es menor, pero no se detalla la cifra exacta.
- GPU recomendadas: cualquier GPU con al menos 24 GB para el lote máximo indicado; el backbone DINOv2 ViT-g es un ViT gigante, por lo que se recomienda A100, H100, L40S o RTX 4090.
- GPU consumer: sí, en tarjetas de 24 GB como la RTX 4090, usando lotes reducidos.
- Despliegue: el repositorio oficial proporciona `Inference.py` sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia: la model card muestra 684 ms por imagen en el ejemplo de salida, sin especificar la GPU empleada.
- CPU: soportado con `--device cpu`, descrito como «mucho más lento», sin cifra concreta.

## Comparativa con modelos similares

No se dispone de datos de benchmarks frente a modelos externos de detección de AIGI en la información proporcionada. La comparación posible es interna, entre versiones del propio modelo (v1, v2, v3), ya presentada en la sección de benchmarks. Frente a clasificadores genéricos de imágenes, la diferencia arquitectónica es el uso de un backbone DINOv2 congelado con cabezas ligeras y salida temprana, pero no hay cifras públicas que permitan una comparación cuantitativa con alternativas como UniversalFakeDetect, CNNDetection u otros detectores de AIGI.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SQuaDE ViT-g (v3) | No disponible (backbone congelado) | No aplica | 0,9430 global / 0,8674 robust en val_hard held-out | MIT | HuggingFace |
| Alternativas de detección de AIGI | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Contaminación de las particiones de evaluación: el 70 % de las particiones oficiales `val` y `val_hard` se usaron en entrenamiento. Solo quedan 3.000 + 750 imágenes held-out, y con 750 el error estándar es de ±1,8 puntos, insuficiente para leer diferencias de 3-4 puntos. La única partición completamente limpia es el test oficial.
- Selección de capas sobre datos de validación: las tres capas de cada grupo se eligieron sobre `val` y `val_hard`, lo que introduce un sesgo de selección pequeño pero no nulo.
- La compuerta falla en fuentes de baja resolución nativa: aprende a discriminar «nitidez» más que «degradación aplicada». En imágenes de 200×200 reescaladas, el 82 % se clasifican como degradadas y el ahorro de cómputo cae al 5,8 %.
- Sesgo del conjunto de imágenes reales: las fotos reales de entrenamiento provienen de bancos de imágenes y OpenImages, con predominio de fotografía profesional. No se ha evaluado el comportamiento sobre fotos reales de baja calidad (móvil, reenvíos múltiples con recompresión).
- Etiquetas imperfectas: parte de los datos etiquetados como «limpios» en entrenamiento son JPEG de origen y arrastran compresión no registrada.
- Hipótesis refutada: la premisa de que la profundidad óptima de lectura depende del tipo de degradación no se sostuvo en 13 mediciones independientes; no debe asumirse esa relación al interpretar las rutas.
- Licencia: el repositorio es MIT, pero los pesos de DINOv2 tienen su propia licencia, que debe revisarse antes de uso comercial del pipeline completo.
- Riesgo de clasificación errónea en la frontera: la propia model card recomienda usar `vote_spread` para derivar a revisión humana las imágenes con votos dispares, en lugar de confiar solo en el umbral de 0,5.
- No es un modelo generativo ni multimodal: no procesa texto, audio ni vídeo, y no admite instrucciones en lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DUET-Bench/squade-vitg
- Repositorio de código: https://github.com/kelvinchua1099-alt/SQuaDE
- Backbone DINOv2 ViT-g: https://huggingface.co/facebook/dinov2-giant
- Concurso NTIRE 2026 Robust AIGI Detection: no disponible (no se incluye enlace en la información proporcionada)
