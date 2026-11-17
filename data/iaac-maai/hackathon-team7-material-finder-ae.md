# iaac-maai/hackathon-team7-material-finder-ae

## Resumen

Material Finder v2 es un modelo de extracción de características de imagen especializado en reconocimiento de materiales de construcción, desarrollado por el equipo 7 (Ugo, Alvaro, Sneha) durante el hackathon de AI Methods I del IAAC en noviembre de 2026. El sistema combina un extractor DINOv2-small congelado con un autoencoder entrenado por el equipo que comprime las características de 768 dimensiones en un código latente de 32 números, permitiendo búsqueda por similitud sobre una galería de 3.900 parches de materiales.

El modelo resuelve un problema concreto: dada una fotografía de una superficie (fachada, suelo o acabado de pared), devuelve los 5 parches más similares de la galería, una respuesta de material clasificada (por ejemplo, "moqueta 60% · baldosa 20% · cerámica 20%") y una indicación de "fotografía inusual". Está empaquetado como un único archivo ONNX de 90 MB que incluye todo el pipeline de inferencia.

Es relevante por su enfoque práctico de recuperación por similitud sin etiquetas: el autoencoder se entrena únicamente con pérdida de reconstrucción sobre características, sin usar las etiquetas de material en ningún momento. Alcanza un top-1 de 0,698 y un top-3 de 0,846 sobre el conjunto de test de MINC-2500, partiendo de un baseline aleatorio de aproximadamente 0,077.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv2-small congelado (ViT) + autoencoder MLP (encoder 768→256→32, decoder 32→256→768) |
| Parámetros totales | 22 M (DINOv2-small) + 410.912 (autoencoder propio) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224 px) |
| Tipos de cuantización | no disponible (solo se distribuye el ONNX en float32) |
| Idiomas soportados | no disponible (modelo de imagen, sin componente textual) |
| Licencia | MIT |
| Formato de pesos | ONNX (`material_finder.onnx`, 90 MB) y PyTorch (`material_finder_ae.pt`) |

## Arquitectura y entrenamiento

El pipeline parte de una imagen RGB redimensionada a 224×224 px, normalizada con estadísticas de ImageNet y procesada por un DINOv2-small congelado de 22 M de parámetros. Se extrae la concatenación del token de clase y la media de los tokens de parche, resultando en 768 características que se estandarizan con la media y desviación del conjunto de entrenamiento. Sobre estas características actúa el autoencoder propio: un encoder `Linear(768→256) → ReLU → Linear(256→32)` que produce un código de 32 dimensiones normalizado a longitud unitaria, y un decoder `Linear(32→256) → ReLU → Linear(256→768)` que solo se usa para calcular la puntuación de "rareza".

El entrenamiento del autoencoder emplea únicamente 410.912 parámetros, con pérdida MSE sobre las características estandarizadas, esquema denoising (ruido gaussiano 0,5 en la entrada, objetivo limpio), optimizador AdamW con learning rate 1e-3 y weight decay 1e-4, batch de 256, 30 épocas y semilla 42. No se usan etiquetas de material en ningún momento. El preprocesado recorta el cuadrado central y conserva su mitad central antes del resize, ya que las etiquetas de MINC describen el material en el centro del parche. La búsqueda se realiza por distancia euclídea entre códigos de longitud unitaria (equivalente a distancia coseno) sobre la galería de 3.900 parches (300 por material).

## Capacidades

- Extracción de características de imagen para búsqueda por similitud sobre materiales de construcción.
- Recuperación top-5 de parches visualmente similares de una galería preindexada.
- Clasificación de material por votación de vecinos: devuelve hasta 3 materiales con cuota ≥ 0,2.
- Detección de "fotografía inusual" mediante puntuación de reconstrucción del autoencoder (ROC AUC reportado en la model card, valor truncado en la información disponible).
- Funciona sin etiquetas en la fase de codificación, lo que permite indexar galerías nuevas sin reentrenar.
- Inferencia autocontenida en un único ONNX: preprocesado, backbone, encoder y decoder incluidos.
- No soporta tool calling, agentes, texto, audio ni razonamiento multi-paso.

## Casos de uso

- Catalogación de materiales en estudios de arquitectura: subir fotografías de acabados de obra y obtener los parches de catálogo más parecidos para documentar especificaciones y presupuestos.
- Asistente de selección de materiales en comercio electrónico: el cliente fotografía una superficie existente y el sistema sugiere productos del catálogo con material y acabado similares.
- Inventario y auditoría de edificios: procesar lotes de fotografías de fachadas, suelos y paredes para clasificar automáticamente los materiales presentes y detectar elementos atípicos mediante la puntuación de rareza.
- Control de calidad en obra: comparar el material instalado con el especificado en proyecto mediante búsqueda por similitud, marcando discrepancias como "fotografía inusual".
- Herramienta educativa en escuelas de arquitectura: explorar visualmente la base MINC-2500 y comprender la similitud entre materiales mediante el espacio latente de 32 dimensiones.
- Filtrado previo en pipelines de visión: usar el código de 32 números como descriptor compacto para indexar grandes volúmenes de imágenes de materiales antes de un análisis más costoso.
- Detección de anomalías en superficies: aprovechar la puntuación de reconstrucción para señalar imágenes que no encajan con los 13 materiales de construcción conocidos.

## Benchmarks y rendimiento

Resultados reportados en la model card, medidos con `material_finder.onnx` sobre las fotos de test reales y la galería de 3.900 parches:

| Medida | Valor |
|---|---|
| Material correcto como primera sugerencia (top-1) | 0,698 |
| Material correcto entre las 2 primeras | 0,812 |
| Material correcto entre las 3 primeras | 0,846 |
| precision@5 en la galería | 0,607 |
| precision@5 sobre los 27.625 parches de entrenamiento | 0,647 |
| Materiales mostrados por foto (cuota ≥ 0,2) | 2,0 de media |
| Baseline aleatorio (1/13) | ≈0,077 |

Evolución interna del desarrollo (misma partición, semilla y métrica):

| Configuración | precision@5 |
|---|---|
| Autoencoder convolucional sobre píxeles 64 px (v1) | 0,140 |
| ResNet-18 congelado + autoencoder de características | 0,414 |
| Características de textura Gram con ResNet-18 | 0,363 |
| DINOv2-small, parche completo, coseno | 0,582 |
| DINOv2-small, recorte central, coseno (este modelo) | 0,647 |
| DINOv2-small, media de completo + espejo + centro | 0,652 |
| Características DINOv2 sin comprimir (referencia) | 0,661 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en float32 para el ONNX de 90 MB más activaciones de una imagen 224×224.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en CPU con latencia aceptable para uso interactivo.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3050, RTX 4090) e incluso en dispositivos de borde con runtime ONNX.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integración directa en aplicaciones Python o web mediante onnxruntime-web; el archivo PyTorch `material_finder_ae.pt` permite reentrenar el autoencoder.
- Latencia y throughput: no disponibles de forma explícita en la información proporcionada; el tamaño reducido (90 MB, backbone de 22 M de parámetros) sugiere inferencia en decenas de milisegundos por imagen en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Material Finder v2 (este modelo) | 22 M + 0,41 M | DINOv2 + autoencoder ONNX | Búsqueda de materiales por similitud | MIT | Hugging Face, ONNX |
| DINOv2-small sin comprimir | 22 M | ViT autosupervisado | Extracción de características general | Apache 2.0 (según el modelo base) | Hugging Face |
| ResNet-18 preentrenado en ImageNet | 11,7 M | CNN | Clasificación y características generales | BSD-3 | Amplia disponibilidad |
| CLIP ViT-B/32 | 151 M | ViT + texto | Búsqueda imagen-texto | MIT | Hugging Face |

La ventaja del modelo frente a usar DINOv2 directamente es el descriptor compacto de 32 dimensiones, que reduce el coste de almacenamiento e indexación de galerías grandes con una pérdida mínima de precisión (0,647 frente a 0,661). Frente a un autoencoder de píxeles, la mejora es de 0,140 a 0,647 en precision@5.

## Limitaciones y advertencias

- Madera y metal son las clases más difíciles según la propia model card; la precisión cae en esos materiales.
- El modelo solo cubre 13 materiales de construcción del dataset MINC-2500; no reconoce categorías fuera de ese conjunto y las marcará como "inusuales".
- La galería de referencia es fija (3.900 parches, 300 por material); añadir materiales nuevos requiere reindexar y recalcular sus códigos latentes.
- El preprocesado asume que el material ocupa el centro de la imagen; fotos descentradas o con mucho contexto degradan el resultado.
- Riesgo de confusión entre materiales visualmente próximos (por ejemplo, tipos de piedra o cerámica); el sistema devuelve hasta 3 candidatos precisamente por esta ambigüedad.
- El autoencoder se entrenó sin etiquetas, por lo que no hay garantía de separación semántica entre clases más allá de la similitud visual.
- Licencia MIT, permisiva para uso comercial, pero el dataset MINC-2500 subyacente es CC BY 4.0 y requiere citar a Bell et al. (2015) si se redistribuye o se usa la galería.
- No hay datos publicados sobre sesgos demográficos ni geográficos del dataset; la composición de MINC-2500 puede no representar materiales de todas las regiones.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K); las métricas disponibles son específicas de la tarea de recuperación de materiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/hackathon-team7-material-finder-ae
- Repositorio de código: https://github.com/iaac-maai/hackathon-team7-MINC_2500_material_patches
- Dataset MINC-2500 (mirror): https://huggingface.co/datasets/mcimpoi/minc-2500_split_1
- Modelo base DINOv2-small: https://huggingface.co/facebook/dinov2-small
- Paper MINC: Bell, Upchurch, Snavely y Bala (2015), *Material Recognition in the Wild with the Materials in Context Database*, CVPR.
