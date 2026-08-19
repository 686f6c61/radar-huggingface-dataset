# mlx-community/GOT-OCR2_0-4bit

## Resumen

GOT-OCR2_0-4bit es una cuantización en 4 bits del modelo GOT-OCR2_0 de stepfun-ai, realizada por mlx-community para su ejecución en Apple Silicon mediante la librería MLX. El modelo original, presentado en el artículo arXiv 2409.01704, es un sistema de reconocimiento óptico de caracteres (OCR) de segunda generación con 560,5 millones de parámetros, capaz de transcribir texto plano y generar salidas estructuradas como tablas, fórmulas matemáticas y partituras musicales. Esta conversión reduce el tamaño a 457 MB y permite inferencia local en Macs con un consumo de memoria pico de 1,83 GB.

La relevancia de esta versión radica en que democratiza el acceso a un OCR de alta precisión en hardware de consumo, sin necesidad de GPUs dedicadas. La cuantización solo afecta al modelo de lenguaje (169 tensores), mientras que el codificador de visión y el proyector permanecen en bf16, lo que explica que el peso efectivo por parámetro sea de 6,522 bits. Según las pruebas de fidelidad publicadas, la versión de 4 bits mantiene una tasa de error de caracteres (CER) de 0,0116 frente a la versión bf16, con una velocidad de generación de 272,9 tokens por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (image-text-to-text) |
| Parametros totales | 560,5 millones (según model card del autor) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens (32k, según model card) |
| Tipos de cuantizacion | 4-bit (group size 64, affine); también disponibles versiones bf16 y 8-bit |
| Idiomas soportados | Multilingüe (según etiquetas del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

GOT-OCR2_0 es un modelo OCR de segunda generación que combina un codificador de visión con un modelo de lenguaje. La arquitectura exacta se describe en el artículo arXiv 2409.01704, aunque la model card de esta conversión no detalla la estructura interna. El modelo acepta imágenes como entrada y genera transcripciones de texto, bien en modo plano (instrucción `OCR: `) o en modo estructurado (instrucción `OCR with format: `, que produce tablas, fórmulas o partituras). No es un modelo de chat: solo responde a esas dos instrucciones específicas.

Esta versión de mlx-community no es un entrenamiento nuevo, sino una conversión y cuantización del modelo original. La cuantización se aplica únicamente a los 169 tensores del modelo de lenguaje (463,8 millones de parámetros), mientras que el codificador de visión y el proyector (96,7 millones de parámetros) se mantienen en bf16. Los embeddings atados (tied embeddings) representan 155,5 millones de parámetros, un 34 % del total cuantizado, y son los que peor SNR presentan (19,10 dB). El proceso de conversión se realizó con `mlx-vlm` 0.6.14 y `mlx` 0.32.0.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de imágenes de documentos, con salida de texto plano.
- Generación de salida estructurada con la instrucción `OCR with format: `, incluyendo tablas, fórmulas matemáticas y partituras musicales.
- Procesamiento de imágenes de alta resolución (ruta de recorte único de 1024x1024; no se ha probado el modo de recorte fino ni el multicrop).
- Soporte multilingüe declarado por el modelo original, aunque las pruebas de fidelidad publicadas solo cubren documentos en inglés.
- No es un modelo de chat: no admite conversación ni tool calling.
- No dispone de modo de razonamiento ni capacidades de agente.

## Casos de uso

- Digitalización de documentos administrativos: el modelo puede transcribir facturas, albaranes y recibos con alta precisión. En las pruebas, recuperó el 96,23 % de los números presentes en documentos sintéticos, lo que lo hace adecuado para flujos de extracción de datos contables.
- Reconocimiento de fórmulas matemáticas en artículos científicos: gracias al modo `OCR with format: `, puede convertir ecuaciones impresas en representaciones estructuradas, útil para la indexación de publicaciones académicas.
- Accesibilidad para personas con discapacidad visual: la transcripción de texto de imágenes permite convertir documentos escaneados en texto legible por lectores de pantalla, con un consumo de memoria inferior a 2 GB en un Mac.
- Procesamiento de informes de laboratorio: el modelo extrae campos específicos (valores numéricos, unidades) de tablas y formularios. En las pruebas, la puntuación `field` alcanzó 0,8947 en 4 bits, con solo una o dos discrepancias respecto a la versión bf16.
- Archivado y búsqueda de documentos históricos: la transcripción a texto plano permite indexar escaneos en motores de búsqueda. La ventana de contexto de 32k tokens admite páginas densas sin truncar el contenido.
- OCR en dispositivos Apple sin GPU dedicada: al ser una cuantización MLX, se puede ejecutar en cualquier Mac con chip M-series, lo que facilita el despliegue en entornos de oficina sin infraestructura de servidores.

## Benchmarks y rendimiento

La model card publica métricas propias sobre seis documentos sintéticos (factura, informe de laboratorio, etiqueta de envío, recibo, tabla de especificaciones y recibo rotado), comparando las versiones bf16, 8-bit y 4-bit. No se incluyen benchmarks estándar como MMLU o HumanEval, ya que el modelo solo produce transcripciones.

| Variante | field | content | numeric | CER vs bf16 | tok/s | pico de memoria (GB) |
|---|---|---|---|---|---|---|
| bf16 | 0,8684 | 0,9605 | 0,9720 | 0 (referencia) | 138,3 | 2,50 |
| 8-bit | 0,8684 | 0,9605 | 0,9720 | 0,0000 | 210,8 | 2,06 |
| 4-bit | 0,8947 | 0,9474 | 0,9623 | 0,0116 | 272,9 | 1,83 |

La versión de 8 bits produce salidas byte-idénticas a bf16 en los seis documentos. La puntuación `field` de 4 bits es superior a la de bf16, pero el autor aclara que se trata de una variación de una o dos cadenas de texto, no de una mejora real. La etiqueta de envío pierde los mismos tres campos en todas las variantes, lo que indica una limitación del modelo original, no de la cuantización.

## Requisitos de hardware

- Inferencia en Apple Silicon (chips M-series) mediante la librería MLX.
- Memoria pico durante generación: 1,83 GB en la versión 4-bit (frente a 2,50 GB en bf16).
- Velocidad de generación: 272,9 tokens por segundo en 4-bit (medida en un Mac M-series, sin especificar modelo exacto).
- No requiere GPU dedicada; funciona en cualquier Mac con suficiente memoria unificada (8 GB o más).
- Despliegue con `mlx-vlm` (requiere la versión con soporte GOT-OCR 2.0, actualmente en un pull request sin fusionar en el repositorio oficial).
- No se han probado opciones de despliegue en servidores con GPU NVIDIA (vLLM, TGI, llama.cpp) porque el formato MLX es específico de Apple.

## Comparativa con modelos similares

La comparación más directa es con las otras variantes del mismo modelo publicadas por mlx-community:

| Modelo | Cuantización | Tamaño en disco | CER vs bf16 | tok/s | Pico de memoria |
|---|---|---|---|---|---|
| GOT-OCR2_0-bf16 | bf16 | ~1 GB (estimado) | 0 (referencia) | 138,3 | 2,50 GB |
| GOT-OCR2_0-8bit | 8-bit | ~0,6 GB (estimado) | 0,0000 | 210,8 | 2,06 GB |
| GOT-OCR2_0-4bit | 4-bit | 457 MB | 0,0116 | 272,9 | 1,83 GB |

Frente a otros modelos OCR como TrOCR (de Microsoft) o PaddleOCR, GOT-OCR2_0 destaca por su capacidad de salida estructurada (tablas, fórmulas, partituras) y por su naturaleza multilingüe, aunque no se dispone de comparativas numéricas directas en la información proporcionada. La licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de algunos modelos propietarios.

## Limitaciones y advertencias

- No es un modelo de chat: solo responde a las instrucciones `OCR: ` y `OCR with format: `. Cualquier otro prompt produce resultados fuera de distribución.
- La versión 4-bit requiere `mlx-vlm` con soporte GOT-OCR 2.0, que aún no está fusionado en la rama principal. Sin ese soporte, el modelo no se puede cargar.
- Las pruebas de fidelidad se realizaron únicamente con seis documentos sintéticos en inglés, generados por ordenador. No se han evaluado escaneos reales, fotografías, manuscritos ni otros idiomas.
- No se ha medido el rendimiento en el modo de recorte fino (región por caja o por color), el multicrop para páginas densas ni el modo multipágina.
- La salida estructurada (`OCR with format: `) se ha probado de forma superficial, sin puntuación de precisión sobre tablas, fórmulas o partituras.
- El modelo puede alucinar texto en documentos ambiguos o dañados, como cualquier sistema OCR basado en generación de lenguaje.
- La ventana de contexto de 32k tokens es amplia, pero no se ha verificado la precisión en documentos que se acerquen a ese límite.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base tiene su propia procedencia; conviene revisar los términos del modelo original de stepfun-ai.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mlx-community/GOT-OCR2_0-4bit
- Modelo base original: https://huggingface.co/stepfun-ai/GOT-OCR2_0
- Artículo académico: https://arxiv.org/abs/2409.01704
- Variante bf16: https://huggingface.co/mlx-community/GOT-OCR2_0-bf16
- Variante 8-bit: https://huggingface.co/mlx-community/GOT-OCR2_0-8bit
- Pull request de soporte GOT-OCR 2.0 en mlx-vlm: https://github.com/Blaizzy/mlx-vlm/pull/1908
