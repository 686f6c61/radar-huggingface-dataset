# MirilAI/WALDO40-YOLOv8

## Resumen

WALDO40-YOLOv8 es una familia de ocho detectores de objetos basados en la arquitectura YOLOv8 con cabeza de detección P2, entrenados a 640 px sobre el conjunto de datos WALDO 4.0 para imagen aérea. Lo desarrolla MirilAI y su propósito es la detección de objetos pequeños en escenas aéreas (vehículos, personas, edificios, embarcaciones, paneles solares, etc.) en doce clases predefinidas. Cada tamaño de la familia (N, S, M y L) se distribuye en dos variantes directamente comparables: Standard, con el stack convencional de aumento de color, y Obnubilated, que sustituye ese aumento por reiluminación geométricamente consciente, niebla con variación de profundidad y degradaciones de cámara e imagen.

El modelo es relevante porque aborda uno de los problemas clásicos de la detección en imagen aérea: la robustez frente a condiciones de iluminación y visibilidad adversas. La variante Obnubilated introduce esas perturbaciones en el entrenamiento (con probabilidad 0,50) manteniendo idéntica arquitectura, presupuesto de entrenamiento, aumentos espaciales, partición y semilla que la Standard, de modo que la comparación entre ambas aísla el efecto del camino de color y entorno. Los mejores resultados de validación se obtienen en el tamaño L Obnubilated, con un mAP50-95 de 0,5529 y un mAP50 de 0,7800.

Los checkpoints se publican en formato PyTorch (`.pt`) bajo licencia MIT, con un tamaño de repositorio de 0,5 GB. El autor advierte explícitamente de que las cifras provienen de una única semilla determinista y de una partición de validación limpia: son resultados de ingeniería, no una afirmación científica multi-semilla, y no se reclama ningún resultado sobre un conjunto de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 con cabeza de deteccion P2 (deteccion de objetos pequenos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de 640 px) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch en FP32/FP16; el autor menciona FP16 en la comparativa de velocidad) |
| Idiomas soportados | no aplica (modelo de vision; no se declaran idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); ocho checkpoints en `weights/` |

## Arquitectura y entrenamiento

La familia emplea la arquitectura YOLOv8 con una cabeza de detección P2, pensada para objetos pequeños típicos de la imagen aérea. Se ofrecen cuatro escalas (N, S, M y L), cada una en dos variantes. La variante Standard usa el stack convencional de aumento de color; la variante Obnubilated lo reemplaza por reiluminación geométricamente consciente, niebla con variación de profundidad y degradaciones de cámara e imagen, muestreadas con probabilidad 0,50 sobre las entradas de entrenamiento, conservando el resto de transformaciones espaciales.

El entrenamiento se realizó durante 300 épocas con entradas de 640 px, optimizador SGD, Python 3.11 y PyTorch 2.6.0. Standard y Obnubilated comparten arquitectura P2, presupuesto de entrenamiento, aumentos espaciales, partición y semilla, de modo que la única variable de comparación intencionada es el camino de entorno y color. Las etiquetas empleadas son las del WALDO 4.0 recién limpiado. No se detalla en la información disponible el volumen de tokens ni la composición exacta del dataset, ni si hubo etapas de ajuste adicionales.

## Capacidades

- Detección de objetos en imagen aérea en doce clases: `LightVehicle`, `Person`, `Building`, `UPole`, `Boat`, `Bike`, `Container`, `Truck`, `Gastank`, `Digger`, `Solarpanels` y `Bus`.
- Detección de objetos pequeños gracias a la cabeza P2 y a la resolución de entrada de 640 px.
- Robustez frente a condiciones adversas de iluminación y visibilidad en la variante Obnubilated (reiluminación, niebla con profundidad variable, degradaciones de cámara).
- Dos variantes comparables por tamaño para experimentación controlada sobre el efecto del aumento de color y entorno.
- Ocho checkpoints de mejor validación, uno por combinación de tamaño y variante.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, texto ni audio: es un modelo exclusivamente de visión por computador.

## Casos de uso

- Monitorización de infraestructuras críticas: el modelo detecta paneles solares, gasolineras y contenedores en ortofotos, lo que permite inventariar activos y detectar cambios con la cabeza P2 sobre objetos pequeños.
- Análisis de tráfico y aparcamiento: la detección de `LightVehicle`, `Truck` y `Bus` en imagen aérea sirve para estimar ocupación y flujos; la variante Obnubilated mantiene el rendimiento en escenas con niebla o iluminación variable.
- Vigilancia marítima y portuaria: la clase `Boat` permite localizar embarcaciones en puertos y aguas costeras, un escenario donde la niebla con variación de profundidad del entrenamiento Obnubilated es directamente relevante.
- Seguridad y recuento de personas en eventos: la clase `Person` posibilita el conteo y la distribución espacial en recintos abiertos capturados desde dron.
- Inspección de obra y movimiento de tierras: las clases `Digger` y `Container` permiten seguir maquinaria y materiales en obras, con la ventaja de que la cabeza P2 detecta objetos de pocos píxeles.
- Inventario urbano: la clase `UPole` (postes) y `Building` facilitan el catálogo de mobiliario urbano y edificaciones a partir de vuelos de dron o satélite.
- Despliegue en pipelines de teledetección: los checkpoints `.pt` se integran en flujos de inferencia por lotes con el script `inference.py` incluido, seleccionando tamaño y variante por línea de comandos.

## Benchmarks y rendimiento

Resultados de validación publicados por el autor (mejor checkpoint, una semilla determinista, partición de validación limpia de WALDO 4.0, 640 px):

| Tamano | Variante | mAP50-95 | mAP50 |
|---|---|---:|---:|
| N | Standard | 0,4425 | 0,6520 |
| N | Obnubilated | 0,4377 | 0,6501 |
| S | Standard | 0,4978 | 0,7191 |
| S | Obnubilated | 0,5002 | 0,7225 |
| M | Standard | 0,5312 | 0,7525 |
| M | Obnubilated | 0,5451 | 0,7684 |
| L | Standard | 0,5438 | 0,7677 |
| L | Obnubilated | 0,5529 | 0,7800 |

Comparativa entre generaciones (mAP50-95, misma convención de 640 px; las columnas de WALDOv3.0 no son directamente restables por cambio de dataset y partición):

| Tamano | WALDOv3.0 P2 native-val | WALDO 4.0 YOLOv8 Standard | WALDO 4.0 YOLOv8 Obnubilated | WALDO 4.0 YOLOv26 Obnubilated |
|---|---:|---:|---:|---:|
| N | 0,3865 | 0,4425 | 0,4377 | 0,4366 |
| S | no disponible | 0,4978 | 0,5002 | 0,4817 |
| M | 0,5161 | 0,5312 | 0,5451 | 0,5186 |
| L | 0,5385 | 0,5438 | 0,5529 | 0,5181 |

El autor señala que la entrada rectangular por defecto de Ultralytics (672 px) hace que estos valores difieran entre 0,005 y 0,01 respecto a la tabla del repositorio YOLOv26, que compara todos los modelos con un único evaluador. No se han publicado resultados sobre conjunto de test.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,5 GB e incluye los ocho checkpoints, por lo que cada modelo individual es de tamaño reducido y cabe holgadamente en GPU de consumo.
- GPU recomendadas: el autor reporta mediciones de velocidad en A100 con FP16 y batch 32 para la generación YOLOv26; para esta familia no se detallan GPU concretas.
- GPU de consumo: por el tamaño del repositorio y la escala de los modelos (N a L), es esperable que quepan en RTX 4090 y GPUs similares, aunque no se proporcionan cifras de VRAM por checkpoint.
- Opciones de despliegue: el autor distribuye `requirements.txt` e `inference.py` para inferencia con PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos). El ecosistema Ultralytics permite exportación a otros formatos, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponibles para esta familia; la comparativa de velocidad A100 FP16 batch 32 corresponde a WALDO 4.0 YOLOv26, no a estos checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | mAP50-95 (mejor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WALDO40-YOLOv8 L Obnubilated | no disponible | 640 px | 0,5529 | MIT | Hugging Face (MirilAI) |
| WALDO40-YOLOv8 M Obnubilated | no disponible | 640 px | 0,5451 | MIT | Hugging Face (MirilAI) |
| WALDO40-YOLOv26 L Obnubilated | no disponible | 640 px (672 px rectangular en Ultralytics) | 0,5181 | no disponible en la informacion | Hugging Face (MirilAI) |
| WALDOv3.0 P2 L | no disponible | 640 px | 0,5385 (validacion nativa v3.0) | no disponible en la informacion | Hugging Face (StephanST/WALDO30) |

La comparación con YOLOv26 y WALDOv3.0 debe interpretarse con cautela: las métricas de WALDOv3.0 proceden de su validación nativa y no de la partición limpia de WALDO 4.0, y las de YOLOv26 usan una convención de entrada distinta. No se dispone de datos de otros detectores aéreos comparables en la información proporcionada.

## Limitaciones y advertencias

- Resultados de una única semilla determinista: el autor los califica de resultados de ingeniería, no de afirmación científica multi-semilla.
- Sin resultados sobre conjunto de test: la partición de liberación solo declara entrenamiento y validación.
- Las cifras de WALDOv3.0 no son directamente comparables con las de WALDO 4.0 por cambios en composición del dataset y partición; el autor retiró unas cifras previas de misma partición pendientes de investigación.
- Dominio restringido: solo doce clases de imagen aérea; no es un detector generalista ni un modelo de texto.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos no cuantificado en la información disponible; no se publican matrices de confusión ni métricas por clase.
- Sesgos conocidos: no documentados; al entrenar sobre un dataset aéreo concreto, el rendimiento puede degradarse fuera de su distribución geográfica, de sensor o de altitud.
- Licencia MIT para los checkpoints, permisiva para uso comercial; deben revisarse los términos del dataset WALDO 4.0 y de las dependencias (Ultralytics/PyTorch) por separado.
- No se declaran idiomas ni capacidades multimodales más allá de la detección de objetos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MirilAI/WALDO40-YOLOv8
- Repositorio WALDO40 YOLOv26: https://huggingface.co/MirilAI/WALDO40-YOLOv26
- Release público de WALDOv3.0: https://huggingface.co/StephanST/WALDO30
