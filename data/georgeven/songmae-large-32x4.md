# georgeven/songmae-large-32x4

## Resumen

SongMAE-Large 32x4 es un codificador bioacústico basado en un masked autoencoder con arquitectura Vision Transformer (MAE-ViT), desarrollado por George Vengrovski para el aprendizaje de representaciones de canto de aves con alta resolución temporal. El modelo opera sobre espectrogramas de mel con resolución de 2 ms por frame, lo que permite capturar estructuras finas a nivel de sílaba que los codificadores de audio convencionales, diseñados para habla humana, no resuelven. Este checkpoint concreto, denominado "Large 32x4", utiliza parches que abarcan 32 bins de mel y 4 bins temporales, generando una embedding cada 20 ms.

El modelo fue preentrenado durante 500.000 pasos en el subconjunto XCL de BirdSet, derivado de 528.434 grabaciones de Xeno-Canto que suman 7.562 horas de audio. Con 98,2 millones de parámetros, se distribuye como un encoder congelado para tareas de recuperación, visualización, agrupamiento y sondas de aprendizaje supervisado. No es un clasificador de especies ni un generador de audio, sino una herramienta de representación intermedia. Su relevancia radica en que aborda un vacío en la bioacústica: la necesidad de representaciones con granularidad temporal fina para estudiar la estructura silábica del canto de las aves, algo que los modelos preentrenados en habla no logran.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MAE-ViT (Masked Autoencoder Vision Transformer) compacto |
| Parametros totales | 98.167.553 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5 segundos por ventana (contextos independientes, sin atención entre ellos) |
| Tipos de cuantizacion | no disponible (repo solo incluye safetensors en precisión original) |
| Idiomas soportados | no aplica (modelo de audio, no textual) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SongMAE emplea una arquitectura de autoencoder enmascarado (MAE) con codificador Vision Transformer. El modelo recibe espectrogramas de mel normalizados de 128 bins, con FFT de 1024 muestras, hop de 160 muestras y frecuencia mínima de 20 Hz. Los parches son de 32 bins de mel por 4 bins temporales, lo que produce una embedding cada 20 ms. El preentrenamiento consiste en reconstruir espectrogramas enmascarados, una técnica de auto-supervisión que fuerza al modelo a aprender representaciones acústicas robustas sin etiquetas.

El entrenamiento se realizó sobre el subconjunto XCL de BirdSet, que incluye 528.434 grabaciones de Xeno-Canto (7.562 horas). Los taxones de evaluación downstream se eliminaron antes de la partición final 95/5 de entrenamiento/validación. El modelo se preentrenó durante 500.000 pasos. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que es un modelo de representación no generativo. La normalización de entrada usa una media fija de -58,69 dB y desviación estándar de 20,18 dB, calculadas durante el preentrenamiento.

## Capacidades

- Extracción de embeddings de audio a nivel de clip (vector de 3072 dimensiones) y a nivel de token (secuencia temporal de vectores de 3072 dimensiones).
- Representaciones con resolución temporal de 20 ms, adecuadas para análisis de sílabas y elementos finos del canto de aves.
- Salida de token grid con estructura (time, 4, 768), donde cada frame contiene cuatro vectores de 768 dimensiones correspondientes a parches de frecuencia.
- Procesamiento de audio mono a 32 kHz, con conversión automática de cualquier entrada a este formato.
- Acepta tanto rutas de archivo como waveforms NumPy directamente.
- Funciona en CPU y GPU, con soporte para inferencia por lotes.
- No incluye capacidades de tool calling, generación de texto, visión general ni razonamiento multimodal; es un modelo de extracción de características puramente acústico.

## Casos de uso

- Investigación en bioacústica: los investigadores pueden usar SongMAE para extraer embeddings de grabaciones de campo y estudiar la estructura silábica del canto de aves, comparando patrones entre individuos o poblaciones con resolución temporal de 20 ms.
- Monitoreo de biodiversidad: en proyectos de censo acústico pasivo, el modelo puede servir como encoder congelado para alimentar clasificadores ligeros de especies, aprovechando su preentrenamiento en 7.562 horas de audio diverso.
- Agrupamiento y visualización de vocalizaciones: las embeddings de clip permiten proyectar grandes colecciones de grabaciones en espacios de baja dimensión (t-SNE, UMAP) para identificar clusters de tipos de canto o dialectos regionales.
- Recuperación de audio por similitud: dado un canto de referencia, se pueden buscar grabaciones similares en una base de datos calculando distancias coseno entre embeddings, útil para archivos ornitológicos.
- Detección de sílabas y segmentación: la salida de token embeddings con timestamps permite segmentar automáticamente grabaciones largas en unidades silábicas, facilitando el etiquetado manual o la anotación automática.
- Sondas de aprendizaje supervisado: investigadores pueden entrenar cabezales lineales o MLP sobre las embeddings congeladas para tareas específicas como clasificación de especies, sexo o individuos, sin necesidad de ajustar el encoder completo.
- Análisis de desarrollo vocal: en estudios de aprendizaje de canto en aves juveniles, las representaciones de alta resolución temporal permiten rastrear cambios finos en la producción vocal a lo largo del tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de rendimiento en tareas downstream, ni comparaciones con otros codificadores bioacústicos. El paper asociado (bioRxiv) podría contener evaluaciones, pero no se proporcionan datos numéricos en el material consultado.

## Requisitos de hardware

- VRAM estimada: con 98,2 millones de parámetros, el modelo en fp32 ocupa aproximadamente 393 MB de memoria. En fp16 serían unos 197 MB. La inferencia en CPU es viable para archivos cortos, aunque más lenta.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1060, RTX 2060, RTX 3060 o superiores funcionan sin problemas. Incluso GPUs integradas podrían ejecutarlo con cuantización adicional, aunque no se ofrecen versiones GGUF.
- Cabe en GPU de consumo: sí, sin ninguna duda. Es un modelo pequeño en comparación con LLMs.
- Opciones de despliegue: se integra con la librería `transformers` mediante `AutoModel` con `trust_remote_code=True`. También se puede usar directamente desde el código fuente en GitHub. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño, se espera una latencia de decenas de milisegundos por ventana de 5 segundos en GPU moderna, y de unos pocos cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. Existen otros codificadores bioacústicos como BirdNET o AudioMAE, pero no se han encontrado datos comparativos de rendimiento, arquitectura o parámetros en la información proporcionada. La comparativa queda pendiente de futuras publicaciones o evaluaciones independientes.

## Limitaciones y advertencias

- El modelo no es un clasificador de especies; solo produce representaciones. Cualquier tarea de clasificación requiere un cabezal adicional entrenado.
- No genera audio ni realiza síntesis de voz o canto.
- Las representaciones se calculan en ventanas independientes de 5 segundos; no hay atención entre ventanas, por lo que no se capturan dependencias de largo plazo en grabaciones extensas.
- La normalización usa estadísticas fijas del preentrenamiento; audio con niveles de grabación muy diferentes puede requerir adaptación.
- El modelo fue preentrenado en grabaciones de Xeno-Canto, que mayoritariamente contienen cantos de aves en condiciones relativamente limpias. Grabaciones con ruido de fondo intenso, otras especies solapadas o taxones fuera de la distribución de preentrenamiento pueden producir representaciones subóptimas.
- No se han publicado evaluaciones de sesgos o robustez frente a variaciones de equipo de grabación, distancia o condiciones meteorológicas.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye con código personalizado (`trust_remote_code=True`), lo que implica revisar el código fuente antes de desplegarlo en producción.
- La fecha de creación (agosto de 2026) es posterior a la fecha actual del sistema; esto puede indicar que el modelo es muy reciente o que la información del repositorio es simulada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/georgeven/songmae-large-32x4
- Colección de modelos SongMAE: https://huggingface.co/collections/georgeven/songmae-a-bioacoustic-encoder-for-birdsong-6a91eb9c42e5cde53962fbec
- Paper en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.08.17.745361v1
- Paper en NeurIPS: https://nips.cc/virtual/2025/loc/san-diego/131534
- Paper en OpenReview: https://openreview.net/forum?id=8mluzLyvyV
- PDF del paper en OpenReview: https://openreview.net/pdf?id=8mluzLyvyV
- Código fuente: https://github.com/georgevenven/SongMAE
- Perfil del autor: https://huggingface.co/georgeven/models
