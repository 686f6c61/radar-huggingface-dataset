# prittjam/blobboards-descriptor

## Resumen

BlobBoards descriptor es una red neuronal ligera para extracción de descriptores de parches de imagen, diseñada específicamente para el paquete BlobBoards.jl del autor James Pritts (prittjam). Su función es emparejar blobs detectados en imágenes contra una galería de tableros, facilitando tareas de localización y seguimiento en tiempo real. El modelo se distribuye como un único archivo ONNX (`track_logpolar_circ_s96_iter4.onnx`) que procesa parches en escala de grises de 96×96 píxeles, previamente canonizados mediante transformación log-polar circular, y produce un descriptor L2-normalizado por parche.

La relevancia de este modelo reside en su integración directa con el ecosistema BlobBoards.jl: no es un modelo autónomo, sino un componente especializado que resuelve el problema de correspondencia de blobs con alta eficiencia. La exportación ONNX carece de nodos `Pad`, lo que permite que el ejecutor CUDA de ONNXRuntime coloque todo el grafo en la GPU sin reescrituras adicionales, alcanzando alrededor de 65 microsegundos por parche con un lote de 64. El repositorio no registra descargas ni valoraciones, y su fecha de creación (agosto de 2026) indica que es un desarrollo reciente, probablemente vinculado a la investigación del autor en visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional ligera con normalización por lotes plegada (exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 96×96) |
| Tipos de cuantizacion | no disponible (solo se distribuye en FP32/FP16 ONNX, sin confirmar) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (archivo `track_logpolar_circ_s96_iter4.onnx`) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. Según la model card, el modelo acepta parches en escala de grises de 96×96 píxeles canonizados mediante una transformación log-polar circular y produce un descriptor L2-normalizado por parche. Todas las capas de normalización por lotes están plegadas en los pesos de convolución, lo que garantiza que el resultado sea numéricamente idéntico independientemente del tamaño del lote; el batch solo actúa como parámetro de rendimiento. La exportación ONNX no incluye operadores `Pad`, una decisión técnica que evita la necesidad de reescrituras para el ejecutor CUDA de ONNXRuntime.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de iteraciones, ni el uso de técnicas como RLHF o DPO (en este caso, no aplican por ser un modelo discriminativo de visión). El nombre del archivo (`iter4`) y la etiqueta de revisión `iter4` sugieren que es la cuarta iteración de entrenamiento, fechada el 10 de agosto de 2026. El autor, James Pritts, mantiene el paquete BlobBoards.jl en Julia, que integra este descriptor como componente de emparejamiento.

## Capacidades

- Extracción de descriptores de parches log-polares circulares de 96×96 píxeles en escala de grises.
- Producción de descriptores L2-normalizados, listos para comparación por similitud coseno o distancia euclídea.
- Emparejamiento de blobs detectados contra una galería de tableros (funciones `find_boards` y `track_boards` de BlobBoards.jl).
- Ejecución eficiente en GPU mediante ONNXRuntime CUDA, sin nodos `Pad` que obstaculicen el despliegue.
- Independencia del tamaño del lote: el resultado es numéricamente idéntico para cualquier batch, lo que facilita el ajuste de rendimiento.
- Integración nativa con el sistema de configuración TOML de BlobBoards.jl, que exige fijar revisiones inmutables para garantizar reproducibilidad.

## Casos de uso

- Calibración de cámaras: el descriptor permite emparejar blobs de un patrón de tablero conocido en imágenes capturadas, facilitando la estimación de parámetros intrínsecos y extrínsecos de la cámara. Su baja latencia (65 µs por parche en GPU) permite procesar secuencias de calibración en tiempo real.
- Seguimiento de tableros en vídeo: con la función `track_boards`, el modelo mantiene la correspondencia de blobs entre fotogramas consecutivos, útil en aplicaciones de realidad aumentada o navegación de robots móviles que requieren localización visual continua.
- Localización y mapeo simultáneos (SLAM) visual: los descriptores de blobs pueden integrarse en sistemas de odometría visual para identificar puntos de referencia repetibles en el entorno, mejorando la robustez frente a cambios de iluminación.
- Inspección industrial: en líneas de producción donde se usan patrones de calibración impresos, el modelo puede verificar la presencia y orientación de piezas basándose en la correspondencia de blobs, con un coste computacional mínimo.
- Robótica de servicio: robots que necesitan detectar y seguir marcadores visuales (tableros) para interactuar con el entorno, por ejemplo, para localizar estaciones de carga o puntos de entrega.
- Investigación en visión por computador: como componente de un pipeline de matching de características, el modelo puede servir como alternativa ligera a descriptores clásicos (SIFT, ORB) en experimentos que requieran una implementación reproducible y eficiente en Julia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de rendimiento mencionada es la latencia de inferencia: aproximadamente 65 microsegundos por parche con un lote de 64 en GPU CUDA, según la model card. No hay comparaciones con otros descriptores (SIFT, SuperPoint, etc.) ni datos de precisión en tareas de matching.

## Requisitos de hardware

- El modelo es extremadamente ligero: un único archivo ONNX de tamaño 0.0 GB según el repositorio (probablemente menos de 1 MB).
- Puede ejecutarse en CPU sin problemas para aplicaciones de baja frecuencia, aunque el autor recomienda GPU para aprovechar el ejecutor CUDA de ONNXRuntime.
- Cualquier GPU moderna con soporte CUDA es suficiente (por ejemplo, NVIDIA GTX 10xx o superior). No se requieren GPUs de alta gama como A100 o H100.
- El consumo de VRAM es mínimo: el grafo completo cabe en la memoria de cualquier GPU comercial, incluso en modelos integrados.
- Opciones de despliegue: ONNXRuntime con ejecutor CUDA (recomendado), o ejecutor CPU. No se menciona soporte para vLLM, Ollama o TGI, que son específicos de modelos de lenguaje.
- La latencia de 65 µs por parche (batch 64) es orientativa y depende de la GPU concreta.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un descriptor de parches especializado, no un modelo de propósito general. Como referencia conceptual, se podrían citar descriptores clásicos como SIFT (escala de grises, invariante a rotación y escala) o SuperPoint (basado en deep learning), pero no hay datos públicos que permitan comparar rendimiento, precisión o latencia con estos. La comparativa queda pendiente de que el autor publique resultados o benchmarks.

## Limitaciones y advertencias

- El modelo está especializado en parches log-polares circulares de 96×96 píxeles en escala de grises; no acepta otros formatos de entrada sin preprocesamiento.
- No hay información sobre la licencia de uso, lo que impide determinar si es apto para uso comercial o restringido. Se recomienda contactar al autor antes de integrarlo en productos.
- No se han publicado datos sobre sesgos o limitaciones de generalización; al ser un descriptor entrenado para un dominio concreto (tableros BlobBoards), su rendimiento fuera de ese dominio es incierto.
- El repositorio no registra descargas ni valoraciones, lo que sugiere una adopción muy limitada y poca validación externa.
- La dependencia de revisiones inmutables (tags) es una salvaguarda, pero implica que cualquier actualización del modelo requiere cambios explícitos en la configuración.
- No se garantiza compatibilidad con versiones futuras de ONNXRuntime ni con otros ejecutores (TensorRT, OpenVINO) sin verificación previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prittjam/blobboards-descriptor
- Paquete BlobBoards.jl (GitHub): https://github.com/prittjam/BlobBoards.jl
- Perfil de GitHub del autor (James Pritts): https://github.com/prittjam
