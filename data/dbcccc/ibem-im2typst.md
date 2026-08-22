# dbcccc/IBEM-im2typst

## Resumen

IBEM-im2typst es un modelo experimental de reconocimiento de fórmulas matemáticas impresas que convierte imágenes de fórmulas en expresiones Typst. Desarrollado por dbcccc, el modelo forma parte de la fase 10 de un proyecto de investigación y está pensado como un componente para aplicaciones de OCR matemático, no como un sistema de producción. Su relevancia radica en que aborda la conversión directa de fórmulas a Typst, un lenguaje de composición tipográfica creciente en la comunidad académica, sin pasar por LaTeX.

El modelo emplea una arquitectura propia denominada `cnn-transformer-v3`, con un encoder convolucional compacto, contexto axial 2-D y un decodificador Transformer autoregresivo de tres capas. Cuenta con 14,157,152 parámetros y una ventana de entrada de hasta 2,048 píxeles de ancho. Se entrenó exclusivamente con recortes reales del corpus IBEM, sin datos sintéticos ni modelos preentrenados, lo que lo distingue de otros sistemas de reconocimiento de fórmulas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | cnn-transformer-v3 (encoder convolucional + decoder Transformer autoregresivo de 3 capas) |
| Parámetros totales | 14,157,152 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada de imagen hasta 2,048 px de ancho; salida hasta 64 tokens por paso) |
| Tipos de cuantización | INT8 (export ONNX), FP16/FP32 referenciados en `browser-deployment.json` pero no incluidos |
| Idiomas soportados | no disponible (el modelo opera sobre notación matemática, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch FP32 (`checkpoint-step-002000-transfer.pt`) y ONNX INT8 (`encoder.int8.onnx`, `decoder-step.int8.onnx`) |

## Arquitectura y entrenamiento

La arquitectura `cn-transformer-v3` combina un encoder convolucional compacto que extrae características de la imagen de entrada, con un mecanismo de contexto axial 2-D (depthwise axial) que captura dependencias espaciales en las dos dimensiones de la fórmula. Tras un pooling horizontal de altura 4 que reduce la resolución vertical, un decoder Transformer autoregresivo de tres capas genera la secuencia de tokens Typst. El preprocesado de entrada está bloqueado: la imagen se recorta al contenido, se normaliza la polaridad, se redimensiona manteniendo la proporción y se rellena hasta una altura fija de 256 píxeles con un ancho máximo de 2,048.

El entrenamiento usó 129,303 recortes reales de fórmulas provenientes de 480 documentos del dataset IBEM, con 16,899 imágenes de validación de 60 documentos distintos. Las etiquetas son conversiones deterministas a Typst sin paquetes externos de las anotaciones `latex_norm` de IBEM. No se emplearon datasets sintéticos, etiquetas generadas por otros modelos ni pesos preentrenados. El estado del optimizador, RNG y cursores de entrenamiento se eliminaron del checkpoint final, por lo que no se puede reanudar el entrenamiento original.

## Capacidades

- Reconocimiento de fórmulas matemáticas impresas en formato imagen y conversión a código Typst.
- Generación de expresiones Typst sin paquetes externos (output policy bloqueada).
- Soporte para fórmulas de hasta 64 tokens de salida, con mayor precisión en secuencias cortas (32 tokens).
- Inferencia en navegador mediante exportación ONNX INT8 (encoder y decoder separados para autoregresión con caché).
- Vocabulario de 528 tokens con fallback a UTF-8 para símbolos fuera de vocabulario.
- No incluye capacidades de segmentación de página, OCR general, reconocimiento de escritura a mano ni procesado de fotografías.

## Casos de uso

- Conversión de fórmulas en documentos escaneados a Typst: el modelo puede procesar recortes de fórmulas extraídos de páginas de artículos o libros, generando código Typst editable para su integración en documentos LaTeX/Typst.
- Asistencia en edición académica: los investigadores pueden capturar fórmulas de publicaciones y convertirlas a Typst para reutilizarlas en sus propios documentos, evitando la reescritura manual.
- Automatización de revistas y preprints: en pipelines de conversión de manuscritos a formatos tipográficos, el modelo puede convertir fórmulas de imágenes a texto estructurado.
- Anotación de datasets matemáticos: permite generar anotaciones Typst a partir de fórmulas en imágenes, útil para construir corpus de entrenamiento de otros modelos.
- Integración en aplicaciones de OCR matemático: como componente de un sistema más amplio que extrae fórmulas de páginas completas, usando un segmentador externo.
- Verificación de fórmulas: al generar la representación Typst de una fórmula, se puede comparar con la original para detectar errores de transcripción en documentos digitalizados.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Exact match FP32 (validación, 16,899 imágenes) | 92.6268% |
| Exact match ≤32 tokens | 97.8519% |
| Exact match 33-64 tokens | 88.4282% |
| Exact match fórmulas mostradas (displayed) | 70.1197% |

No se han publicado comparaciones con otros modelos de reconocimiento de fórmulas en la información disponible. El autor indica que el test split y la calibración de confianza no se han abierto aún.

## Requisitos de hardware

- Tamaño del checkpoint: 56.7 MB, lo que implica que el modelo es ligero y puede ejecutarse en hardware de consumo.
- VRAM estimada: no disponible, pero por el tamaño de parámetros (14 M) y la arquitectura compacta, se puede inferir que cabe en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: no hay requisitos específicos publicados; cualquier GPU moderna con soporte CUDA o incluso CPU es viable para inferencia.
- Despliegue: el modelo se distribuye con exportación ONNX INT8 para inferencia en navegador (browser), además del checkpoint PyTorch para Python. No se menciona soporte para vLLM, llama.cpp o Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (reconocimiento de fórmulas a Typst) en los resultados de búsqueda. La comparativa con otros sistemas de OCR matemático (como LaTeX-OCR o Pix2Text) no está documentada en los datos disponibles. Se recomienda consultar la literatura académica sobre reconocimiento de expresiones matemáticas para una comparación formal.

## Limitaciones y advertencias

- El modelo no está cualificado para producción: el autor declara explícitamente que es experimental y que la puntuación de fórmulas mostradas (70.12%) está por debajo del umbral de producción del 90%.
- Errores comunes en fórmulas compactas: motas, acentos superiores, matrices y estructuras de alineación.
- Las fórmulas largas y multilínea son significativamente más débiles que las fórmulas cortas en línea.
- No se admiten entradas con escritura a mano, distorsión de perspectiva, texto circundante o estilos de captura arbitrarios.
- La evaluación con exact match es estricta: un solo token erróneo invalida el resultado.
- El modelo no es un segmentador de páginas ni un OCR general; solo procesa fórmulas recortadas.
- El checkpoint no se puede reanudar para entrenamiento (optimizer state eliminado).
- La licencia MIT cubre el modelo y el código del proyecto, pero el dataset IBEM no se redistribuye y conserva su licencia CC BY 4.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dbcccc/IBEM-im2typst
- Dataset IBEM (Zenodo): https://zenodo.org/records/7963703
- Repositorio de código fuente del proyecto: no disponible en la información proporcionada (se menciona un "companion GitHub source repository" pero no se indica la URL).
- Licencia MIT y documentos de proveniencia: se referencian en los archivos del repositorio (`LICENSE`, `LICENSES.md`, `MODEL_LICENSE.md`, `DATA_PROVENANCE.md`), pero no se proporcionan enlaces directos.</think>## Resumen

IBEM-im2typst es un modelo experimental de reconocimiento de fórmulas matemáticas impresas que convierte imágenes de fórmulas directamente a expresiones en Typst, un sistema de composición tipográfica. Desarrollado por dbcccc, el modelo se encuentra en la fase 10 de un proyecto de investigación y se distribuye como un reconocedor de fórmulas de una sola imagen, no como un sistema de OCR de páginas completas. Su relevancia radica en ofrecer una alternativa de código abierto (licencia MIT) para la conversión de fórmulas a Typst, un formato cada vez más adoptado en la comunidad académica y técnica.

El modelo emplea una arquitectura propia denominada `cnn-transformer-v3`, con un encoder convolucional compacto y un decoder Transformer autoregresivo de tres capas. Tiene 14,157,152 parámetros y fue entrenado exclusivamente con recortes reales del dataset IBEM, sin datos sintéticos ni modelos preentrenados. El checkpoint distribuido es el mejor resultado de validación de la fase 10 (paso 2,000), con un rendimiento de exact match del 92.63% sobre 16,899 imágenes de validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | cnn-transformer-v3 (encoder convolucional compacto + decoder Transformer autoregresivo de 3 capas) |
| Parámetros totales | 14,157,152 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada de imagen con altura fija de 256 px y ancho máximo de 2048 px) |
| Tipos de cuantización | INT8 (export ONNX), FP16 y FP32 (referenciados en `browser-deployment.json` pero no copiados) |
| Idiomas soportados | no disponible (el modelo opera sobre notación matemática, no sobre lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (FP32), ONNX INT8 (encoder y decoder) |

## Arquitectura y entrenamiento

La arquitectura `cnn-transformer-v3` combina un encoder convolucional compacto con un mecanismo de contexto axial 2-D (depthwise) que captura dependencias espaciales en las imágenes de fórmulas. Tras un pooling horizontal que preserva la altura, un decoder Transformer autoregresivo de tres capas genera la secuencia de tokens Typst. El preprocesado de entrada está bloqueado: la imagen se recorta al contenido, se normaliza la polaridad, se redimensiona preservando la proporción y se rellena hasta una altura de 256 píxeles con un ancho máximo de 2048.

El entrenamiento usó 129,303 recortes reales de fórmulas de 480 documentos IBEM, con 16,899 imágenes de validación de 60 documentos distintos. Las etiquetas son conversiones deterministas a Typst (sin paquetes) de las anotaciones `latex_norm` de IBEM. No se empleó el dataset Fusion, ni corpus sintético, ni etiquetas generadas por otros modelos. El checkpoint distribuido es una transferencia sin estado de optimizador, por lo que no puede reanudar el entrenamiento original.

## Capacidades

- Reconocimiento de fórmulas matemáticas impresas y conversión a Typst sin paquetes.
- Generación de expresiones Typst con vocabulario de 528 tokens y fallback a bytes UTF-8.
- Soporte de inferencia en navegador mediante exportación ONNX INT8 (encoder y decoder por pasos).
- Precisión exacta del 92.63% en validación FP32 (exact match sobre 16,899 imágenes).
- Exact match del 97.85% para secuencias de hasta 32 tokens.
- Exact match del 88.43% para secuencias de 33 a 64 tokens.
- Exact match del 70.12% para fórmulas mostradas (displayed formulas).
- No incluye soporte para tool calling, agentes, ni capacidades de visión general.

## Casos de uso

- **Extracción de fórmulas de documentos escaneados**: el modelo puede convertir recortes de fórmulas de páginas escaneadas en código Typst, útil para digitalizar materiales académicos o técnicos.
- **Asistencia en edición de documentos Typst**: un usuario puede capturar una fórmula de una referencia o libro y obtener su representación Typst para integrarla en su propio documento.
- **Automatización de conversión de LaTeX a Typst**: aunque el modelo genera Typst directamente, puede integrarse en pipelines de conversión de documentos que ya tengan fórmulas en formato imagen.
- **Creación de datasets de entrenamiento**: al convertir fórmulas de IBEM a Typst, el modelo puede servir para generar anotaciones de texto estructurado para otros sistemas.
- **Integración en herramientas de OCR matemático**: como componente de un sistema más amplio que segmenta páginas y luego convierte cada fórmula individual.
- **Verificación de transcripciones**: comparar la salida Typst generada con la fórmula original para detectar errores en procesos de digitalización.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Exact match FP32 (validación, 16,899 imágenes) | 92.6268% |
| Exact match ≤32 tokens | 97.8519% |
| Exact match 33–64 tokens | 88.4282% |
| Exact match fórmulas mostradas | 70.1197% |

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el test split y la calibración de confianza aún no se han abierto, y que la puntuación de fórmulas mostradas no está calibrada como probabilidad de corrección.

## Requisitos de hardware

- El checkpoint FP32 ocupa 56.7 MB, por lo que es viable en hardware de consumo.
- La inferencia se puede ejecutar en CPU para uso ocasional, aunque se recomienda GPU para rendimiento en producción.
- La exportación ONNX INT8 permite inferencia en navegador (WebAssembly) sin GPU dedicada.
- No se especifican requisitos mínimos de VRAM; por el tamaño de parámetros (14 M), una GPU con 4 GB de VRAM sería suficiente para inferencia.
- Opciones de despliegue: PyTorch (Python), ONNX Runtime para navegador o servidor, y el runtime de inferencia del repositorio de código fuente del proyecto.
- No se dispone de datos de latencia o throughput publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El autor no menciona alternativas como LaTeX-OCR (pix2tex) u otros sistemas de reconocimiento de fórmulas matemáticas. La comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no está cualificado para producción: el autor indica que la precisión en fórmulas mostradas (70.12%) está por debajo del umbral del 90% exigido.
- Errores comunes en fórmulas compactas: motas, puntos, matrices y estructuras de alineación.
- Las fórmulas largas y multilínea son significativamente más débiles que las fórmulas cortas en línea.
- No soporta entrada con escritura, distorsión de perspectiva, texto circuante o estilos de captura arbitrarios.
- El exact match es estricto: un solo token erróneo invalida la salida completa.
- No es un segmentador de páginas ni un OCR general; solo acepta una fórmula recortada por imagen.
- El checkpoint no puede reanudar entrenamiento (sin estado de optimizador).
- La licencia MIT cubre el modelo y el código, pero el dataset IBEM no se redistribuye y conserva su licencia CC BY 4.0.
- No se garantiza la exactitud de la salida: se recomienda inspeccionar y compilar cada expresión Typst generada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dbcccc/IBEM-im2typst
- Dataset IBEM (Zenodo): https://zenodo.org/records/7963703
- Repositorio de código fuente del proyecto: no disponible en la información proporcionada (se menciona un "companion GitHub source repository" pero no se incluye la URL).
