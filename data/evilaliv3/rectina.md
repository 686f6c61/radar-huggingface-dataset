# evilaliv3/rectina

## Resumen

Rectina es un modelo de detección de tinta diseñado para leer los papiros carbonizados de Herculano a partir de tomografías de rayos X (X-ray CT). Lo desarrolla evilaliv3 en el marco del Vesuvius Challenge y resuelve un problema muy concreto: dado un volumen de superficie segmentado, asignar a cada píxel de esa superficie una puntuación de tinta. Se publica como dos checkpoints independientes, Rectina m1 y Rectina m2, que se comparan respectivamente con los lectores de referencia Reader v2 y Reader v3 del desafío.

La arquitectura es una U-Net 3D tridimensional con tallo (stem) 2D, identificada en la configuración embebida como `vesuvius_unet_3d_stem_2d`, que opera sobre recortes de 17 × P × P píxeles. Rectina m1 trabaja con parches de 128 píxeles y Rectina m2 con parches de 384 píxeles. No es un modelo de lenguaje: no genera texto ni código, sino mapas de puntuación float32 entre 0 y 1 por píxel de superficie.

Su relevancia es acotada pero real: en las 14 unidades de evaluación, Rectina m1 supera a Reader v2 en 12 de 14 (diferencia media de AUC +0,0192) y Rectina m2 supera a Reader v3 en 11 de 14 (+0,0104). Son mejoras modestas pero medidas sobre datos abiertos del Vesuvius Challenge, un dominio donde cada décima de AUC cuenta para recuperar texto legible de papiros que no se pueden abrir físicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net 3D con tallo 2D (`vesuvius_unet_3d_stem_2d`), recorte 17 × P × P |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de parche de 128 px (m1) y 384 px (m2) |
| Tipos de cuantización | no disponible (checkpoints PyTorch en float32) |
| Idiomas soportados | no aplica (modelo de visión, no lingüístico) |
| Licencia | CC BY-NC 4.0 (pesos y model card), MIT (código de la receta), sujeta a los términos de datos de scrollprize.org |
| Formato de pesos | checkpoints PyTorch (.pt) con configuración embebida |
| Tamaño del repositorio | 1,7 GB |
| Salida | puntuación float32 entre 0 y 1 por píxel de superficie (no calibrada) |

## Arquitectura y entrenamiento

Rectina es una U-Net tridimensional con tallo 2D que procesa un volumen de superficie renderizado a lo largo de la normal de una superficie `tifxyz`. La entrada es un recorte de 17 × P × P, donde la primera dimensión corresponde a la profundidad del volumen renderizado y P al tamaño del parche en el plano de la superficie. La salida es un mapa de puntuaciones de tinta por píxel. Los checkpoints incluyen la configuración que reconstruye la arquitectura mediante el código `ink_detection` del proyecto `villa`.

El entrenamiento usa datos abiertos del Vesuvius Challenge. Rectina m1 corresponde al primer paso (s1) de la receta: lotes de 64 parches extraídos de ocho rollos con cuotas por rollo (0139: 12, 1667: 8, Paris4: 6, 0814: 7, 0009B: 8, 0343P: 5, 0500P2: 7, 0172: 11), sobre el conjunto de etiquetas `43965c9d120c` de 103 unidades (74 con etiquetas trasladadas entre resoluciones de escaneo y colocadas con una transformación y desplazamiento registrados, 5 unidades nativas con desplazamiento medido y 24 unidades compuestas). Rectina m2 continúa desde el checkpoint de m1 durante dos pasos adicionales cuyas cuotas por rollo no figuran en la tabla publicada de la receta. No se documentan en la información disponible detalles sobre función de pérdida, aumentos de datos ni regularización.

## Capacidades

- Detección de tinta píxel a píxel sobre volúmenes de superficie segmentados de papiros carbonizados.
- Salida de puntuaciones float32 entre 0 y 1 por píxel de superficie, útiles para ordenar y priorizar regiones candidatas.
- Lectura de volúmenes renderizados a lo largo de la normal de una superficie `tifxyz`.
- Dos variantes con distinto tamaño de parche: m1 con 128 px (más adecuada para superficies con detalle fino) y m2 con 384 px (más contexto espacial por parche).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No es un modelo generativo de texto ni de imagen: no produce transcripciones ni texto, solo mapas de probabilidad relativa de tinta.

## Casos de uso

- Lectura de papiros de Herculano: procesar superficies segmentadas de un rollo carbonizado y obtener un mapa de tinta que permita a los filólogos identificar letras y trazos sin desenrollar físicamente el papiro; es el caso de uso central del modelo.
- Comparación de lectores en pipelines de investigación: usar Rectina m1 y m2 como referencias adicionales frente a Reader v2 y Reader v3 para triangular resultados y detectar regiones donde los lectores discrepan.
- Priorización de regiones de interés: ordenar los píxeles de una superficie por puntuación de tinta para que los equipos de imagen dediquen esfuerzo de reconstrucción y segmentación a las zonas con mayor probabilidad de contener texto.
- Validación cruzada de segmentaciones: aplicar el lector sobre superficies generadas por distintos métodos de segmentación y usar la coherencia de las puntuaciones como señal de calidad de la superficie.
- Investigación en visión 3D aplicada a patrimonio: servir como punto de partida o baseline para experimentos con U-Nets 3D sobre volúmenes de rayos X de materiales arqueológicos.
- Reproducibilidad del Vesuvius Challenge: integrar los checkpoints en la carpeta de resultados del artículo para reproducir las figuras y las métricas AUC publicadas sobre las 14 unidades de evaluación.

## Benchmarks y rendimiento

Los resultados publicados son diferencias de AUC frente a los lectores de referencia sobre 14 unidades (8 held-out y 6 de control). No se publican valores absolutos de AUC salvo el ejemplo de la unidad ag1.

| Comparación | Unidades superadas | Diferencia media de AUC | Diferencia mediana de AUC | Unidad que baja la media |
|---|---|---|---|---|
| Rectina m1 vs Reader v2 (8 held-out) | 8 de 8 | +0,0275 | +0,0270 | no aplica |
| Rectina m1 vs Reader v2 (6 control) | 4 de 6 | +0,0081 | +0,0104 | w058 (-0,0083) |
| Rectina m1 vs Reader v2 (14 total) | 12 de 14 | +0,0192 | no disponible | no disponible |
| Rectina m2 vs Reader v3 (8 held-out) | 6 de 8 | +0,0157 | +0,0137 | 20250919140325 (-0,0082) |
| Rectina m2 vs Reader v3 (6 control) | 5 de 6 | +0,0035 | +0,0040 | ag1 (-0,0047) |
| Rectina m2 vs Reader v3 (14 total) | 11 de 14 | +0,0104 | no disponible | no disponible |
| Rectina m1 vs Reader v3 (8 held-out) | 6 de 8 | no disponible | +0,0162 | no disponible |
| Rectina m1 vs Reader v3 (6 control) | 3 de 6 | no disponible | -0,0046 | no disponible |

Ejemplo concreto de AUC absoluta: Rectina m1 sobre la unidad ag1 = 0,8395; Rectina m2 sobre ag1 = 0,8466.

Sobre las cuatro unidades de control con etiquetas de los organizadores (0343, ag1, ag2, w00): Rectina m1 supera a Reader v3 en 2 de 4 (mediana -0,0046) y a Reader v2 en 3 de 4 (mediana +0,0104); Rectina m2 supera a Reader v3 en 3 de 4 (mediana +0,0063). El autor advierte que los recuentos son descriptivos, que no se muestra una dispersión entre semillas (cada modelo es una única ejecución) ni corrección por comparaciones múltiples, y que las puntuaciones no están calibradas.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El repositorio ocupa 1,7 GB, pero no se detalla el consumo en inferencia.
- GPU recomendadas: no disponible. Al ser un modelo de visión 3D con parches de 128 y 384 píxeles, se espera que requiera GPU con memoria suficiente para volúmenes 3D, pero no se publican requisitos concretos.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: el autor indica que los checkpoints se cargan con el código `ink_detection` de `villa` y el programa lector, junto con los componentes de render, lectura y conversión, se publicarán con la carpeta de resultados del artículo. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño de parche | Referencia de comparación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rectina m1 | U-Net 3D con tallo 2D | 128 px | Supera a Reader v2 en 12 de 14 unidades | CC BY-NC 4.0 | Hugging Face (evilaliv3/rectina) |
| Rectina m2 | U-Net 3D con tallo 2D | 384 px | Supera a Reader v3 en 11 de 14 unidades | CC BY-NC 4.0 | Hugging Face (evilaliv3/rectina) |
| Reader v2 | Lector de referencia del Vesuvius Challenge | no disponible | Referencia frente a m1 | no disponible | no disponible en la información |
| Reader v3 | Lector de referencia del Vesuvius Challenge | no disponible | Referencia frente a m2 | no disponible | no disponible en la información |

No se dispone de datos de parámetros, contexto ni rendimiento absoluto de Reader v2 y Reader v3 más allá de las comparaciones de AUC recogidas en la tabla de benchmarks.

## Limitaciones y advertencias

- Las puntuaciones son una medida relativa de tinta, no probabilidades calibradas; el propio autor lo señala igual que la documentación de Reader v3.
- Cada modelo es una única ejecución: no se muestra dispersión entre semillas, lo que impide estimar la variabilidad de los resultados.
- No hay corrección por comparaciones múltiples; los recuentos sobre 14 unidades son descriptivos.
- La regla de adopción del artículo (al menos 6 de 8 unidades held-out por encima de la referencia y ganancia mediana de AUC superior a 0,003) también es descriptiva: de seis variantes del mismo procedimiento puntuadas sobre las mismas 14 unidades, cuatro la cumplen frente a Reader v3 y seis frente a Reader v2, y la elección entre ellas se hizo sobre estas mismas unidades.
- La comprobación de solapamiento de claves de segmento no encontró ninguna de las 14 unidades entre los segmentos de las configuraciones de entrenamiento, pero compara segmentos, no áreas vecinas de un mismo volumen.
- Licencia CC BY-NC 4.0: uso no comercial con atribución; el uso comercial requiere autorización expresa del autor.
- Los datos de entrenamiento están sujetos a la licencia de datos del Vesuvius Challenge (dl.ash2txt.org LICENSE.txt), que condiciona también el uso derivado.
- El modelo no genera texto ni transcripciones: la interpretación filológica del mapa de tinta queda fuera de su alcance.
- No se han publicado requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue en producción.
- El programa lector y los componentes de render, lectura y conversión aún no estaban publicados en el momento de la información disponible; solo se anuncian junto con la carpeta de resultados del artículo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evilaliv3/rectina
- Carpeta del checkpoint m1: https://huggingface.co/evilaliv3/rectina/tree/main/m1
- Model card de m1: https://huggingface.co/evilaliv3/rectina/blob/main/m1/README.md
- Carpeta del checkpoint m2: https://huggingface.co/evilaliv3/rectina/tree/main/m2
- Model card de m2: https://huggingface.co/evilaliv3/rectina/blob/main/m2/README.md
- Artículo y código (resultados): https://github.com/evilaliv3/vesuvius-challenge-pipeline/tree/main/results/db27c806-rectina
- Vesuvius Challenge: https://scrollprize.org
- Licencia de datos del Vesuvius Challenge: https://dl.ash2txt.org/LICENSE.txt
