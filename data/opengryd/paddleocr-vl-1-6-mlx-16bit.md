# OpenGryd/PaddleOCR-VL-1.6-MLX-16bit

## Resumen

PaddleOCR-VL-1.6-MLX-16bit es una conversión a MLX en precisión completa (bfloat16) del modelo PaddlePaddle/PaddleOCR-VL-1.6, un modelo de visión-lenguaje de 0,9B parámetros especializado en parsing de documentos. Lo publica el usuario OpenGryd y su objetivo es permitir la ejecución local del modelo en Apple Silicon (serie M) mediante la librería mlx-vlm, sin pasar por CUDA ni por servicios en la nube.

El modelo base, desarrollado por el equipo PaddlePaddle, está construido sobre ERNIE-4.5 y resuelve OCR de página completa, análisis de maquetación, reconocimiento de tablas, fórmulas en LaTeX, gráficos y sellos, además de text spotting. La conversión mantiene los 131.072 tokens de contexto y el codificador visual de parches de 14 píxeles con soporte de hasta aproximadamente 1 millón de píxeles por imagen.

Es relevante porque ofrece la variante sin cuantizar de la familia MLX del mismo autor (existe una versión de 8 bits), lo que permite preservar la fidelidad del modelo base en flujos de OCR donde ningún dato puede salir de la máquina. El repositorio tiene 905.601.648 parámetros y ocupa 1,8 GB, y se publicó el 10 de septiembre de 2026 con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `PaddleOCRVLForConditionalGeneration` (modelo vision-lenguaje, tipo `paddleocr_vl`, codigo personalizado con `trust_remote_code`) |
| Parametros totales | 905.601.648 (aproximadamente 0,9B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Sin cuantizar en este repositorio (bfloat16 de 16 bits); existe una variante de 8 bits del mismo autor |
| Idiomas soportados | Ingles, chino y multilingue |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (bfloat16), 1,81 GB en disco |
| Tamano del repositorio | 1,8 GB |
| Codificador visual | Parches de 14 px, hasta aproximadamente 1 millon de pixeles por imagen |
| Libreria | mlx |
| Modelo base | PaddlePaddle/PaddleOCR-VL-1.6 (0,9B, basado en ERNIE-4.5) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base PaddleOCR-VL-1.6: un modelo vision-lenguaje de tipo condicional (`PaddleOCRVLForConditionalGeneration`) con codificador visual de parches de 14 píxeles que admite imágenes de hasta aproximadamente un millón de píxeles, acoplado a un decodificador de lenguaje derivado de ERNIE-4.5. El modelo base tiene 0,9B parámetros y una ventana de contexto de 131.072 tokens. El repositorio incluye código de modelado personalizado, por lo que la carga exige `trust_remote_code=True`.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El título del trabajo asociado al modelo base ("Expanding the Frontier of Document Parsing with Under-Optimized Region Refinement and Progressive Post-Training") apunta a un post-entrenamiento progresivo y a un refinamiento de regiones poco optimizadas, pero no se han proporcionado detalles técnicos adicionales. Esta conversión concreta no modifica la arquitectura: se limita a transformar los pesos a bfloat16 para MLX mediante `mlx_vlm convert`, sin cuantización.

## Capacidades

- OCR de página completa con salida en formato Markdown y JSON.
- Análisis de maquetación (layout) de documentos.
- Reconocimiento de tablas, incluyendo la estructura de las mismas.
- Reconocimiento de fórmulas matemáticas con salida en LaTeX.
- Reconocimiento de gráficos y de sellos.
- Text spotting, es decir, detección y reconocimiento de texto en imágenes.
- Procesamiento multilingüe con soporte declarado de inglés, chino y otros idiomas.
- Servicio de inferencia mediante `mlx_vlm.server` con endpoints compatibles con la API de OpenAI.
- No se documenta soporte de tool calling, function calling ni flujos de agente multi-paso en la información disponible.
- No admite entradas solo de texto: la imagen es obligatoria.

## Casos de uso

- Digitalización de archivos en local: convertir lotes de documentos escaneados a Markdown o JSON estructurado ejecutando el modelo íntegramente en un Mac con chip de la serie M, sin enviar los documentos a ningún servicio externo.
- Extracción de tablas financieras: procesar balances, facturas o informes con tablas complejas y obtener la estructura de filas y columnas para alimentar una base de datos o un pipeline de análisis.
- Conversión de literatura científica: transformar PDF escaneados con ecuaciones a Markdown con fórmulas en LaTeX, aprovechando el reconocimiento de fórmulas del modelo.
- Tramitación documental con requisitos de confidencialidad: despachos jurídicos, sanidad o sector público donde la normativa impide que los documentos salgan del equipo; la inferencia local y la licencia Apache-2.0 facilitan el despliegue.
- Preprocesado para RAG: usar el modelo como extractor que convierte documentos heterogéneos en texto estructurado antes de indexarlo en un sistema de recuperación, con soporte de páginas densas gracias a los 131.072 tokens de contexto.
- Análisis de documentos con sellos y firmas: detección de sellos oficiales para validar o clasificar expedientes administrativos.
- Digitalización de documentación en chino e inglés: empresas con documentación bilingüe que necesitan un único modelo para ambos idiomas.
- Servicio interno con API compatible con OpenAI: exponer el modelo mediante `mlx_vlm.server` para que aplicaciones existentes lo consuman como si fuese un endpoint de OpenAI, con la fidelidad de la versión sin cuantizar.

## Benchmarks y rendimiento

La información disponible solo incluye un dato de evaluación, correspondiente al modelo base y no a esta conversión concreta:

| Benchmark | Modelo | Resultado |
|---|---|---|
| OmniDocBench v1.6 | PaddleOCR-VL-1.6 (modelo base) | 96,3 % |

El autor indica que el modelo base lidera en reconocimiento de texto, fórmulas y tablas según OmniDocBench v1.6. No se han publicado resultados de benchmarks independientes para esta conversión MLX, ni comparativas numéricas con otros modelos, ni métricas de latencia o throughput en la información disponible.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon (serie M). MLX no se ejecuta en GPU NVIDIA ni AMD, por lo que este repositorio no es utilizable en A100, H100 o RTX 4090.
- Peso en disco y en memoria de los pesos: 1,81 GB en bfloat16.
- Memoria unificada estimada para inferencia: aproximadamente 2,5 a 4 GB considerando pesos, caché KV para contextos largos y activaciones del codificador visual con imágenes de hasta 1 millón de píxeles. Es una estimación, no un dato publicado; el autor solo confirma que consume aproximadamente el doble que la variante de 8 bits (1,81 GB frente a 1,09 GB).
- Encaje en equipos de consumo: viable en cualquier Mac con 8 GB o más de memoria unificada, siempre que se ajuste la longitud de contexto y la resolución de imagen. En equipos con 8 GB conviene vigilar el uso de memoria en documentos de muchas páginas.
- Opciones de despliegue: mlx-vlm mediante la API de Python (`load` y `generate`) o el servidor OpenAI-compatible (`python -m mlx_vlm.server --model ... --trust-remote-code`). No se contempla vLLM, llama.cpp, Ollama ni TGI para este repositorio MLX; el modelo base podría desplegarse con el ecosistema PaddlePaddle, pero no se proporciona información al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con la variante cuantizada del mismo autor y con el modelo base. No se dispone de datos sobre otros modelos de OCR comparables.

| Modelo | Parametros | Contexto | Precision y tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenGryd/PaddleOCR-VL-1.6-MLX-16bit | 905.601.648 | 131.072 tokens | bfloat16, 1,81 GB | Apache-2.0 | HuggingFace, requiere mlx-vlm y `trust_remote_code` |
| OpenGryd/PaddleOCR-VL-1.6-MLX-8bit | No disponible en la informacion | No disponible en la informacion | 8 bits, 1,09 GB | Apache-2.0 | HuggingFace, mismo autor |
| PaddlePaddle/PaddleOCR-VL-1.6 | 0,9B (aproximadamente) | No disponible en la informacion | Precisión original del modelo base | Apache-2.0 | HuggingFace, ecosistema PaddlePaddle |

El criterio de elección entre las dos conversiones MLX es directo: la de 8 bits reduce a la mitad el consumo de memoria y disco, mientras que la de 16 bits preserva la fidelidad del modelo base al no introducir error de cuantización.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True`, lo que implica ejecutar código de modelado incluido en el repositorio; conviene auditar ese código antes de desplegarlo en producción.
- No acepta entradas solo de texto: toda petición debe incluir una imagen.
- Huella doble respecto a la variante de 8 bits (1,81 GB frente a 1,09 GB); en equipos con memoria unificada limitada puede ser preferible la versión cuantizada.
- Restricción de plataforma: al ser una conversión MLX, solo funciona en Apple Silicon. No es desplegable en servidores con GPU NVIDIA sin reconvertir el modelo.
- No se han publicado evaluaciones independientes de esta conversión; el 96,3 % de OmniDocBench v1.6 corresponde al modelo base y no garantiza un comportamiento idéntico tras la conversión.
- Riesgo de alucinación inherente a los modelos generativos: en documentos degradados, manuscritos o tablas mal escaneadas puede producir texto o estructuras plausibles pero incorrectas. Se recomienda validación posterior en flujos críticos.
- Idiomas: la model card declara inglés, chino y multilingüe, pero no se detalla el nivel de calidad por idioma; el rendimiento en otras lenguas distintas del inglés y el chino no está cuantificado.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Licencia Apache-2.0, permisiva y apta para uso comercial, siempre que se mantengan los avisos de copyright y atribución correspondientes.
- Adopción muy baja en el momento de redactar esta ficha: cero descargas y cero "likes" en el repositorio, lo que implica poca validación por parte de la comunidad.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo; todas las referencias obtenidas eran páginas de soporte de Microsoft sin relación con el tema.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpenGryd/PaddleOCR-VL-1.6-MLX-16bit
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Variante de 8 bits del mismo autor: https://huggingface.co/OpenGryd/PaddleOCR-VL-1.6-MLX-8bit
- Libreria de inferencia mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Cita del trabajo asociado: PaddleOCR-VL-1.6: Expanding the Frontier of Document Parsing with Under-Optimized Region Refinement and Progressive Post-Training, PaddlePaddle Team, 2025 (URL indicada en la model card: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda web proporcionados.
