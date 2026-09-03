# georgeven/songmae-micro-32x1

## Resumen

SongMAE-Micro 32x1 es un autoencoder enmascarado (masked autoencoder) desarrollado por George Vengrovski y Timothy J. Gardner de la Universidad de Oregón para el aprendizaje de representaciones de canto de aves a alta resolución temporal. El modelo procesa espectrogramas de audio con parches que abarcan 32 bins mel y 1 bin temporal, produciendo una embedding cada 5 milisegundos, lo que permite capturar estructura fina del canto que los modelos de resolución más gruesa pierden.

Con solo 1.751.873 parámetros, este checkpoint "Micro" fue preentrenado durante 500.000 pasos sobre el subconjunto XCL de BirdSet, compuesto por 528.434 grabaciones de Xeno-Canto que suman 7.562 horas de audio. El modelo está diseñado como un encoder congelado y compacto para tareas de recuperación, visualización, agrupamiento y sondas de evaluación en bioacústica, y se distribuye bajo licencia MIT con pesos en formato safetensors.

La relevancia de este modelo radica en que aborda la representación de cantos de aves con una resolución de 5 ms, argumentando que la forma del parche es un sesgo inductivo clave en lugar de un parámetro de ajuste. Está disponible en HuggingFace con código personalizado y se acompaña de un preprint en bioRxiv y una presentación en NeurIPS 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked autoencoder (encoder transformer) |
| Parametros totales | 1.751.873 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 5 segundos por contexto (contextos acotados e independientes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SongMAE sigue el paradigma de autoencoder enmascarado: el encoder recibe parches del espectrograma con una fracción enmascarada y debe reconstruir los valores originales. La configuración Micro 32x1 utiliza parches de 32 bins mel por 1 bin temporal, lo que produce una embedding cada 5 ms. El espectrograma de entrada usa 128 bins mel, FFT de 1024 muestras, hop de 160 muestras, frecuencia mínima de 20 Hz y decibelios relativos al máximo de potencia de cada grabación. Los valores se normalizan con la media fija de preentrenamiento (-58,69395667478683) y desviación estándar de 20,184339052439707.

El preentrenamiento se realizó durante 500.000 pasos sobre el subconjunto XCL de BirdSet, derivado de 528.434 grabaciones de Xeno-Canto que totalizan 7.562 horas. Los taxones de evaluación downstream se eliminaron antes de la división final 95/5 de entrenamiento/validación. El audio se convierte a mono a 32 kHz y se procesa en contextos acotados de 5 segundos; el contexto final se rellena tras la normalización y se excluye de las embeddings devueltas. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, coherente con su naturaleza de modelo de representación no generativo.

## Capacidades

- Extracción de características de audio bioacústico: genera embeddings de clip de 512 dimensiones (media temporal) y embeddings por token de forma (tiempo, 512).
- Representación a alta resolución temporal: una embedding cada 5 ms, con cuatro vectores de parche de 128 dimensiones por paso temporal concatenados en 512.
- Recuperación de cantos: permite buscar grabaciones similares por similitud de embeddings.
- Visualización de estructura de canto: los token_grid de forma (tiempo, 4, 128) permiten inspeccionar la organización espectral fina.
- Agrupamiento no supervisado: adecuado para clustering de sílabas y unidades de canto sin etiquetas.
- Sondas downstream: sirve como encoder congelado para entrenar clasificadores ligeros sobre representaciones preentrenadas.
- Procesamiento de grabaciones largas: divide el audio en contextos de 5 segundos procesados de forma independiente.
- Ejecución en CPU o GPU: el código de ejemplo permite eliminar `.to("cuda")` para inferencia en CPU.

## Casos de uso

- Recuperación de cantos por similitud: dado un fragmento de canto de una especie, se puede buscar en una base de datos de grabaciones la coincidencia más cercana usando la distancia coseno entre clip_embedding de 512 dimensiones. El modelo es adecuado porque produce representaciones compactas y normalizadas que facilitan la indexación vectorial.

- Descubrimiento de sílabas no supervisado: los token_embeddings a 5 ms de resolución permiten segmentar y agrupar sílabas de canto sin anotaciones manuales, una tarea para la que los modelos de resolución gruesa no tienen granularidad suficiente.

- Monitorización bioacústica de biodiversidad: en proyectos de censo de aves con grabadoras autónomas, el modelo puede generar embeddings de cada detección para agrupar por tipo de canto y estimar riqueza de especies sin un clasificador entrenado previamente.

- Visualización de estructura de canto: los token_grid de 128 dimensiones por parche permiten generar mapas de calor o proyecciones (t-SNE, UMAP) que revelan la organización temporal y espectral del canto para estudios etológicos.

- Sondas de evaluación para clasificación de especies: sobre las embeddings congeladas se puede entrenar un clasificador lineal o MLP pequeño para distinguir especies, aprovechando que los taxones de evaluación se excluyeron del preentrenamiento para evitar contaminación.

- Análisis comparativo entre poblaciones o dialectos: al representar cada canto como una secuencia de embeddings de 512 dimensiones, se pueden comparar poblaciones geográficamente separadas de la misma especie y cuantificar diferencias de repertorio.

- Preprocesamiento para pipelines de bioacústica: el modelo puede integrarse como extractor de características en flujos existentes de detección y clasificación, reemplazando features artesanales como MFCC o chromagramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. El propio resumen de la presentación en NeurIPS 2025 reconoce explícitamente la "falta de benchmarks cuantitativos y comparaciones" como una limitación del trabajo, y señala como direcciones futuras los ablations de proporción de aspecto de parche, preentrenamiento a mayor escala y entrenamiento multirresolución.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,75 millones de parámetros, el modelo requiere menos de 10 MB de VRAM en precisión fp32, por lo que cabe holgadamente en cualquier GPU comercial, incluidas tarjetas integradas.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM es suficiente; una RTX 3060 o superior permite procesar lotes grandes de grabaciones.
- CPU: el modelo puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños, según indica el propio README.
- Opciones de despliegue: se integra con la librería transformers mediante `AutoModel.from_pretrained` con `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje, no a encoders de audio.
- Latencia y throughput: no disponible en la información proporcionada, aunque el tamaño reducido del modelo sugiere latencias del orden de milisegundos por contexto de 5 segundos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion temporal | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SongMAE-Micro 32x1 | 1,75 M | 5 ms | 7.562 h de Xeno-Canto (XCL) | MIT | HuggingFace, GitHub |
| SongMAE (otros checkpoints de la coleccion) | no disponible | variable segun configuracion de parche | mismo subconjunto XCL | MIT | HuggingFace (coleccion) |
| TinyBird (predecesor) | no disponible | no disponible | no disponible | no disponible | GitHub (refactorizado en SongMAE) |

No se dispone de información suficiente sobre otros encoders bioacústicos comparables (como BirdNET o Perch) en los materiales proporcionados para establecer una comparativa cuantitativa fiable. La colección de HuggingFace del autor incluye otros checkpoints de SongMAE con distintas configuraciones de parche, que serían la comparación natural dentro de la misma familia de modelos.

## Limitaciones y advertencias

- No es un clasificador de especies: el checkpoint está diseñado como encoder de representaciones, no para asignar etiquetas de especie directamente.
- No genera audio: a diferencia de otros modelos de audio, SongMAE no es generativo y no puede sintetizar cantos.
- Contexto limitado a 5 segundos: las representaciones no atienden a través de los límites de contexto; las grabaciones largas se procesan como contextos independientes, perdiendo información de largo alcance.
- Generalización condicionada: las condiciones de campo y los taxones distintos de la distribución de preentrenamiento pueden requerir validación o adaptación antes de su uso en producción.
- Sin benchmarks cuantitativos: los autores reconocen la ausencia de evaluaciones comparativas formales, lo que dificulta verificar su rendimiento relativo frente a alternativas.
- Dependencia de código personalizado: el uso requiere `trust_remote_code=True`, lo que implica ejecutar código del autor no auditado por HuggingFace.
- Sin soporte multilingüe ni multimodal: el modelo es exclusivamente de audio bioacústico y no procesa texto ni otras modalidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/georgeven/songmae-micro-32x1
- Colección SongMAE en HuggingFace: https://huggingface.co/collections/georgeven/songmae-a-bioacoustic-encoder-for-birdsong-6a91eb9c42e5cde53962fbec
- Preprint en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.08.17.745361v1
- Repositorio de código: https://github.com/georgevenven/SongMAE
- README del repositorio: https://github.com/georgevenven/SongMAE/blob/main/readme.md
- Página del modelo en bio.rodeo: https://bio.rodeo/models/songmae
- Presentacion en NeurIPS 2025: https://nips.cc/virtual/2025/loc/san-diego/131534
