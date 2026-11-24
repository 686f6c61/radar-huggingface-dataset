# lucasjacks0n/LeanScene

## Resumen

LeanScene es una red neuronal de 0,39 millones de parámetros desarrollada por Lucas Jackson (usuario `lucasjacks0n` en Hugging Face) para la detección de transiciones de plano en vídeo: cortes secos, disolvencias y fundidos. El modelo resuelve un problema clásico de visión por computador en pipelines de vídeo (segmentación de planos y escenas, indexación, edición automatizada) con un coste computacional muy inferior al de la referencia habitual del sector, TransNet V2, que cuenta con 7,62 millones de parámetros y 832 millones de MAC por fotograma.

La propuesta del autor es explícita: superar a TransNet V2 en sus tres benchmarks de referencia (BBC Planet Earth, ClipShots y RAI) con 115 veces menos operaciones por fotograma. LeanScene reporta un F1 medio de 97,4 en BBC Planet Earth, 79,1 en ClipShots y 93,7 en RAI, frente a 96,1, 77,7 y 92,6 de TransNet V2. El modelo se distribuye con licencia MIT, en formato PyTorch (`.pt`) y como dos grafos ONNX separados (extractor de características por fotograma y cabeza temporal), lo que permite ejecutarlo en Python, Node.js y directamente en el navegador.

Es relevante ahora porque demuestra que la detección de transiciones de plano no requiere modelos pesados: una arquitectura compacta con una cabeza temporal ligera puede igualar o superar a modelos dos órdenes de magnitud mayores, habilitando procesamiento de vídeo en el cliente (navegador, dispositivos de borde) sin subir contenido a un servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal por fotograma (extractor de características) + cabeza temporal; detalles internos no disponibles |
| Parametros totales | 0,39 M (0,39 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión sobre secuencias de fotogramas; ventana temporal no especificada) |
| Tipos de cuantizacion | No disponible (se distribuye en PyTorch float y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (modelo de visión, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, 1,6 MB) y ONNX (`onnx/features.onnx`, `onnx/head.onnx`) |
| Entrada | Fotogramas de 100x100 píxeles |
| Salida | Probabilidades por fotograma: same, cut, fade |
| MACs por fotograma | 7,2 M |
| Regla de decisión | cut >= 0,7; fade >= 0,8; fundidos cerrados sobre huecos de <= 8 fotogramas |
| Repositorio | 0,0 GB (pesos incluidos en los paquetes) |

## Arquitectura y entrenamiento

LeanScene se compone de dos etapas. La primera es una red por fotograma que procesa imágenes de 100x100 píxeles y extrae características; la segunda es una cabeza temporal que recibe esas características y emite probabilidades por fotograma para tres clases (mismo plano, corte, fundido). Entre ambas etapas se calcula un histograma de color fuera de los grafos ONNX, según indica la model card. El modelo completo consume 7,2 millones de MAC por fotograma y tiene 0,39 millones de parámetros.

El entrenamiento combinó transiciones sintéticas generadas a partir de clips de un solo plano, vídeos de YouTube etiquetados manualmente y el dataset ClipShots. El autor advierte que los clips de un solo plano no se distribuyen, por lo que estos pesos exactos no pueden reentrenarse; el código de entrenamiento y las etiquetas sí están en el repositorio de GitHub. No se documentan en la información disponible detalles sobre el uso de RLHF, DPO ni sobre la composición exacta del dataset en número de ejemplos.

## Capacidades

- Detección de cortes secos (cut) en vídeo, reportados en el primer fotograma del nuevo plano.
- Detección de transiciones graduales (disolvencias y fundidos, clase fade), reportadas como la secuencia de fotogramas intermedios que no pertenecen a ninguno de los planos vecinos.
- Segmentación de vídeo en planos: devuelve rangos de fotogramas inclusivos y basados en 0.
- Salida de probabilidades por fotograma para las tres clases (same, cut, fade), lo que permite ajustar umbrales aguas abajo.
- Ejecución en Python (paquete `leanscene`, decodificación con OpenCV) y en Node.js (`npm install leanscene`).
- Ejecución en navegador mediante los dos grafos ONNX, sin subir el vídeo a ningún servidor.
- No dispone de tool calling, capacidades de agente, generación de texto, razonamiento, código ni matemáticas: es un modelo exclusivamente de visión aplicada a vídeo.

## Casos de uso

- Segmentación de planos en pipelines de postproducción: el modelo identifica cortes y disolvencias para generar una EDL o lista de planos que alimente un editor no lineal, con un coste de 7,2 M MAC por fotograma que permite procesar horas de material en CPU.
- Indexación y búsqueda de vídeo: dividir un archivo en planos antes de extraer keyframes o embeddings permite construir índices por escena con límites coherentes, algo crítico en catálogos de archivo y plataformas de streaming.
- Detección de cambios de escena en el navegador: la demo oficial procesa el vídeo en la pestaña sin subirlo, lo que sirve para herramientas de previsualización, anotación o control de calidad donde la privacidad del contenido es requisito.
- Generación automática de resúmenes y tráileres: los rangos de planos permiten seleccionar tomas representativas o descartar transiciones graduales al construir un montaje automático.
- Moderación y análisis de contenido en el borde: al caber en un paquete de 1,6 MB y ejecutarse en ONNX, puede integrarse en dispositivos con recursos limitados para marcar cortes bruscos o fundidos en flujos de vídeo en tiempo real.
- Anotación asistida para investigadores: el modelo preetiqueta transiciones en nuevos corpus de vídeo, reduciendo el trabajo manual antes de una revisión humana, con la advertencia de que solo se han medido los tres benchmarks citados.
- Control de calidad de emisión: detectar fundidos y cortes en material broadcast para verificar conformidad con pautas de continuidad o para localizar inserciones publicitarias.

## Benchmarks y rendimiento

F1 sobre transiciones con el protocolo de TransNet V2 (tolerancia de dos fotogramas). Ambos modelos se ejecutaron con el mismo código de decodificación y puntuación, y la regla de decisión de LeanScene se fijó antes de puntuar los conjuntos de test.

| Modelo | BBC Planet Earth | ClipShots | RAI | Parámetros | MACs por fotograma |
|---|---|---|---|---|---|
| TransNet V2 | 96,1 | 77,7 | 92,6 | 7,62 M | 832 M |
| LeanScene (media de 5 semillas) | 97,4 ± 0,1 | 79,1 ± 0,2 | 93,7 ± 0,5 | 0,39 M | 7,2 M |
| Pesos de este repositorio (una de las 5 semillas) | 97,45 | 78,82 | 93,03 | 0,39 M | 7,2 M |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint PyTorch pesa 1,6 MB y los dos grafos ONNX son igualmente ligeros.
- GPU recomendadas: no requiere GPU. Cualquier GPU moderna (RTX 4090, A100, H100) ejecuta el modelo con holgura, pero el caso de uso natural es CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos de borde y en el navegador mediante ONNX Runtime o WebGPU.
- Opciones de despliegue: paquete Python `leanscene` (con OpenCV para decodificación), paquete Node.js `leanscene`, ONNX Runtime para los grafos `features.onnx` y `head.onnx`, y la demo web oficial en `lucasjackson.dev/leanscene`.
- Latencia y throughput: no se publican cifras de latencia ni de fotogramas por segundo en la información disponible; el dato objetivo es el coste de 7,2 M MAC por fotograma.

## Comparativa con modelos similares

| Modelo | Parámetros | MACs por fotograma | F1 BBC Planet Earth | F1 ClipShots | F1 RAI | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| LeanScene | 0,39 M | 7,2 M | 97,4 | 79,1 | 93,7 | MIT | PyTorch, ONNX |
| TransNet V2 | 7,62 M | 832 M | 96,1 | 77,7 | 92,6 | No disponible en la información | No disponible en la información |
| Otros detectores de transiciones | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La información disponible solo permite comparar con TransNet V2, que es la referencia declarada por el autor. No se dispone de datos de otros detectores de límites de plano para esta ficha.

## Limitaciones y advertencias

- La decodificación del paquete Python usa OpenCV; los tiempos se calculan como índice de fotograma dividido por el frame rate del contenedor, por lo que se desvían en archivos con frame rate variable. Los índices de fotograma sí son exactos.
- Los resultados solo se han medido en BBC Planet Earth, ClipShots y RAI; no se han evaluado otros tipos de material (vigilancia, animación, vídeo generado, deportes, etc.).
- Los pesos exactos no pueden reentrenarse porque los clips sintéticos de un solo plano no se distribuyen; solo se publican código de entrenamiento y etiquetas.
- Riesgo de falsos positivos en cortes por movimiento de cámara, flashes o cambios de iluminación: no se documenta en la información disponible, pero es un modo de fallo habitual en este tipo de detectores y no hay métricas específicas al respecto.
- La regla de decisión está fijada (cut >= 0,7, fade >= 0,8, huecos de <= 8 fotogramas); modificarla cambia el equilibrio entre precisión y exhaustividad sin que se hayan publicado curvas de ese comportamiento.
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- El paper está en preparación; la cita disponible es la referencia al repositorio de GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucasjacks0n/LeanScene
- Demo en navegador: https://lucasjackson.dev/leanscene/
- Código, entrenamiento y evaluación: https://github.com/lucasjacks0n/LeanScene
- Paquete Python: `pip install leanscene`
- Paquete Node.js: `npm install leanscene`
- Cita: Lucas Jackson. LeanScene: A 0.39M-Parameter Network for Fast Shot Transition Detection. https://github.com/lucasjacks0n/LeanScene
