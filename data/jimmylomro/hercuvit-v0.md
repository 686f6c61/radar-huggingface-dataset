# jimmylomro/hercuvit-v0

## Resumen

HercuViT v0 es un modelo de segmentación de instancias de hojas de papiro carbonizadas procedentes de los rollos de Herculano, desarrollado por jimmylomro en el contexto del Vesuvius Challenge. No es un modelo de lenguaje: es una red compuesta que combina un codificador ViT preentrenado de forma auto-supervisada sobre microtomografía de rayos X (DinovoL, con parche de 8 y resolución de 9,6 µm) con un decodificador CNN de píxeles que aprende un sobremuestreo a resolución de vóxel, una cabeza de superficie desacoplada y un decodificador de instancias al estilo Mask2Former. El objetivo es responder simultáneamente a dos preguntas sobre el volumen escaneado: si existe una hoja en cada vóxel y a qué hoja pertenece cada uno.

La relevancia del modelo reside en que la primitiva de hoja ya está presente en las características del codificador preentrenado; un decodificador ligero la afina hasta la cresta medial del vóxel. Esta versión v0 es el modelo desacoplado (sin consulta nula), estabilizado con QK-LayerNorm en la atención cruzada del decodificador de máscaras y LayerNorm en los bloques de deconvolución del decodificador de píxeles, con el codificador ajustado mediante un esquema de tasa de aprendizaje sigmoideo.

El checkpoint publicado corresponde a `train_v5` en la época 462, se distribuye como un único fichero `.pth` autocontenido de 0,7 GB que incluye los pesos del codificador afinado, la configuración del modelo y la receta de entrenamiento. La licencia es MIT y el modelo se actualiza in situ bajo la misma ruta del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red compuesta: codificador ViT DinovoL auto-supervisado + decodificador CNN de píxeles + cabeza de superficie desacoplada + decodificador de instancias estilo Mask2Former |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D sobre volúmenes µCT, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint único autocontenido con pesos, `model_cfg` y receta) |

## Arquitectura y entrenamiento

HercuViT es una red compuesta. El codificador es DinovoL (`scrollprize/dinovol_ps8_9.6um_101626`), un ViT preentrenado de forma auto-supervisada sobre µCT de rayos X con parche de 8 y resolución de 9,6 µm; sus pesos están incluidos en el checkpoint. Sobre él se monta un decodificador CNN de píxeles que produce un sobremuestreo a resolución de vóxel de las características de máscara (U1@1/1, 32 dimensiones), una cabeza de superficie desacoplada que decide si hay hoja y un decodificador de instancias estilo Mask2Former con 64 consultas de instancia que asigna cada vóxel a una hoja concreta. Sobre la salida se realiza un ajuste de mallas de hoja por ventana.

La receta de entrenamiento es `full_decoupled.yml`: cabeza desacoplada sin consulta nula, atención con QK-LayerNorm, LayerNorm en los bloques de deconvolución del decodificador de píxeles y ajuste fino del codificador con un esquema de tasa de aprendizaje sigmoideo. El checkpoint liberado es `train_v5` en la época 462. El corpus de entrenamiento es el dataset `jimmylomro/hercunet-corpus`. No se especifican en la información disponible el número de tokens ni la composición detallada del dataset, ni si hubo RLHF/DPO (no aplica en un modelo de segmentación).

## Capacidades

- Segmentación de instancias de hojas de papiro carbonizadas en volúmenes de µCT de rayos X.
- Predicción de la cresta medial de cada hoja (superficie fina en el centro de la hoja, unos vóxeles hacia dentro respecto a las caras).
- Cabeza de superficie desacoplada que responde a la pregunta binaria de existencia de hoja por vóxel.
- Decodificador de instancias que responde a la pregunta de pertenencia (qué hoja) mediante 64 consultas.
- Salida de mallas de hoja ajustadas por ventana en un almacén `.asv` (SQLite de solo lectura con mallas cuadriláteras implícitas en rejilla, en coordenadas globales L0).
- Salida de probabilidad de superficie en OME-Zarr.
- Inferencia sobre volúmenes identificados por ID de rollo o por URI `.zarr` (s3://, https://, file://).
- Reentrenamiento o ajuste fino a partir del propio checkpoint mediante `hercuvit fit`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Segmentación de hojas en rollos de Herculano: dado un ID de rollo (por ejemplo PHerc1447) y una región de vóxeles, el modelo produce las mallas de hoja en un almacén `.asv`, lo que permite a los investigadores aislar hojas individuales dentro del volumen carbonizado sin anotación manual.
- Extracción de la superficie medial para lectura virtual: la salida de probabilidad de superficie en OME-Zarr sirve como base para el desenrollado y la posterior lectura del texto, ya que la cresta medial es el objetivo geométrico adecuado para el aplanado.
- Ajuste fino sobre nuevos rollos o regiones: al ser un checkpoint autocontenido con la receta incluida, `hercuvit fit` permite adaptar el modelo a volúmenes con características distintas sin descargar el codificador por separado.
- Procesamiento por ventanas de grandes volúmenes: la inferencia por ventana con solapamiento configurable (`--overlap`) permite recorrer volúmenes de µCT que no caben en memoria de una sola pasada.
- Integración en pipelines de investigación del Vesuvius Challenge: el formato `.asv` (SQLite de solo lectura) facilita el consumo de las mallas por herramientas posteriores de visualización y análisis.
- Reproducibilidad de experimentos: al fijar una `--revision` concreta del repositorio se obtiene una versión estable del checkpoint, lo que permite comparar resultados entre ejecuciones y publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta Dice frente a etiquetas de caras, porque el objetivo del modelo es la cresta medial y no las caras anotadas manualmente o minadas con m7.

## Requisitos de hardware

- GPU NVIDIA obligatoria para la inferencia (requisito explícito de la model card).
- VRAM estimada: no disponible en la información proporcionada; el checkpoint pesa 0,7 GB, pero el consumo real depende del tamaño de ventana y del volumen procesado.
- GPU recomendadas: no disponible. La model card no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: exclusivamente mediante el código de inferencia `hercunet.hercuvit` del repositorio (comando `hercuvit infer`). No existe un predictor estándar (vLLM, llama.cpp, Ollama, TGI) que reproduzca el modelo, ya que es una red compuesta con ajuste de mallas por ventana.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Objetivo | Contexto/volumen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HercuViT v0 | ViT + CNN + Mask2Former | Instancias de hoja (cresta medial) | Ventanas de µCT, resolución 9,6 µm | MIT | HuggingFace + GitHub |
| HercUNet | nnU-Net | Segmentación de superficie (medial) | Volúmenes µCT | no disponible en la información | GitHub del mismo autor |
| DinovoL | ViT auto-supervisado | Codificador de características µCT | Parche 8, 9,6 µm | no disponible en la información | HuggingFace (scrollprize) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo predice la cresta medial, no las caras de la hoja: no es un error, es un objetivo distinto al de las etiquetas manuales o minadas con m7, y por ello no se reporta Dice frente a etiquetas de caras.
- La inferencia requiere el código `hercunet.hercuvit`; el checkpoint es cargable por cualquiera, pero no existe un predictor estándar que lo reproduzca.
- El modelo se actualiza in situ bajo la misma ruta del repositorio: para reproducibilidad hay que fijar una `--revision` concreta.
- Es un modelo de dominio muy específico (papiros carbonizados de Herculano escaneados con µCT); no es transferible a otros dominios sin ajuste fino.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- No se dispone de información sobre sesgos, riesgo de alucinación (no aplica en el sentido habitual) ni límites de contexto.
- Licencia MIT: permite uso comercial, pero conviene revisar el fichero `LICENSE` del repositorio y las licencias del codificador DinovoL y del corpus de entrenamiento, que no se detallan en la información disponible.
- No se especifican requisitos de VRAM ni GPU recomendadas, lo que dificulta planificar el despliegue en producción.

## Enlaces

- HuggingFace: https://huggingface.co/jimmylomro/hercuvit-v0
- Repositorio de código y documentación: https://github.com/jimmylomro/hercUNet/tree/hercuvit
- Documentación de uso: https://github.com/jimmylomro/hercUNet/blob/hercuvit/docs/hercuvit.md
- Corpus de entrenamiento: https://huggingface.co/datasets/jimmylomro/hercunet-corpus
- Codificador DinovoL: https://huggingface.co/scrollprize/dinovol_ps8_9.6um_101626
- Receta de entrenamiento: https://github.com/jimmylomro/hercUNet/blob/hercuvit/hercunet/hercuvit/recipes/full_decoupled.yml
- Metodología (write-up): https://github.com/jimmylomro/hercUNet/blob/hercuvit/submission/writeup/hercuvit.md
- Licencia: https://github.com/jimmylomro/hercUNet/blob/hercuvit/LICENSE
