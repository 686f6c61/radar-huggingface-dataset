# androidli/Xiaomi-OCR-0-onnx-int4

## Resumen

Xiaomi-OCR-0 es un modelo vision-language de 0,8B parámetros especializado en parsing de documentos y comprensión centrada en OCR, desarrollado por Xiaomi Research. Parte de Qwen3.5-0.8B como base y se entrena sobre un corpus de aproximadamente 170 millones de muestras con técnicas de anclaje de texto Q-Mask, preentrenamiento continuado (CPT) y aprendizaje por refuerzo multitarea (Mix-RL). Su objetivo es unificar en un solo modelo tareas que tradicionalmente requerían pipelines separados: detección de texto, reconocimiento, parsing de tablas, fórmulas y estructura de página.

La ficha que nos ocupa, `androidli/Xiaomi-OCR-0-onnx-int4`, es una exportación comunitaria a ONNX con cuantización int4 weight-only del stack de texto, pensada para inferencia en CPU. Reduce los grafos ONNX en fp32 de 6,4 GB a 1,7 GB, manteniendo la torre de visión en fp32. Incluye un runner en numpy puro más ONNX Runtime, sin dependencia de PyTorch en la ruta de inferencia, lo que facilita el despliegue en entornos sin GPU.

Es relevante ahora porque demuestra que un VLM de OCR de casi 1B parámetros puede ejecutarse en una caja CPU de 8 GB con memoria pico de 3,4 GB para páginas de tamaño moderado, abriendo la puerta a procesamiento de documentos en servidores sin acelerador dedicado. La licencia Apache 2.0 del modelo base facilita su integración comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM híbrida: torre de visión (12×768) + stack de texto con 18 capas gated-delta (atención lineal) y 6 capas de atención completa, sobre base Qwen3.5-0.8B |
| Parámetros totales | 0,8B (modelo base); el embedding atado es de 254M parámetros |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; la ventana de prefill del export es de 256 tokens |
| Tipos de cuantización | int4 weight-only (MatMulNBits, block 32, simétrico, RTN) en 187 capas lineales; embedding int8 con escala por fila; torre de visión en fp32 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (opset 18), con datos externos; embedding en `.npy` int8; tabla de posiciones en `.npz` |

## Arquitectura y entrenamiento

El modelo base es un VLM de 0,8B parámetros construido sobre Qwen3.5-0.8B. La torre de visión tiene 12 capas de 768 dimensiones y procesa una imagen a la vez en el export ONNX. El stack de texto es híbrido: 18 capas con atención lineal gated-delta y 6 capas de atención completa, más una cabeza LM. El embedding de tokens está atado a la cabeza de salida y suma 248.320 entradas de 1.024 dimensiones, es decir, 254M parámetros, un tercio del total. La posición se codifica con mrope y una tabla aprendida de pos-embed de visión de 48×48.

El entrenamiento del modelo base, según Xiaomi Research, parte de Qwen3.5-0.8B y utiliza un corpus de aproximadamente 170 millones de muestras centrado en OCR, con anclaje de texto Q-Mask, preentrenamiento continuado (CPT) y aprendizaje por refuerzo multitarea (Mix-RL). No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset.

La exportación ONNX divide el stack de texto en un grafo de prefill de ventana fija de 256 tokens y un grafo de decode de un token, con 48 tensores de estado (24 capas × estado conv y recurrente para las capas lineales, más k/v para las capas de atención completa) como entradas y salidas explícitas. La cuantización se aplicó con `MatMulNBitsQuantizer` tras un preprocesado que pliega transposiciones y convierte operaciones `Gemm` en `MatMul`. La torre de visión se mantiene en fp32 porque la cuantización int4 de esa parte desplazaba las características de imagen (máx. |Δ| ≈ 2,0) sin ganancia de rendimiento al estar limitada por atención, no por pesos.

## Capacidades

- Generación de texto a partir de imágenes: transcripción de texto impreso y manuscrito, parsing de páginas completas, tablas y fórmulas matemáticas.
- Parsing de documentos estructurado: extracción de contenido de recibos, páginas de caligrafía, páginas con ecuaciones y documentos densos.
- Conversación multimodal multiturno: pipeline `image-text-to-text` con plantilla de chat (`chat_template.jinja`).
- Procesamiento de una imagen por invocación en el export ONNX (la torre de visión está exportada para una imagen a la vez).
- Soporte bilingüe inglés y chino.
- Inferencia en CPU con ONNX Runtime, numpy y Pillow, sin PyTorch en la ruta de inferencia.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la información disponible.

## Casos de uso

- Digitalización de recibos y facturas: el modelo extrae el texto de una imagen de recibo con precisión medida del 100 % en similitud de caracteres frente a la transcripción de referencia; encaja en pipelines de contabilidad que necesitan procesar lotes de documentos en servidores CPU sin GPU.
- Parsing de páginas de caligrafía y documentos históricos: en la página de prueba `qianziwen.jpeg` alcanza el 100 % de similitud de caracteres con el int4, lo que lo hace adecuado para proyectos de archivo y preservación documental en chino.
- Extracción de fórmulas matemáticas: procesa páginas con ecuaciones densas, aunque con truncación a 600 tokens nuevos la similitud cae al 49,24 %, por lo que es útil para borradores y revisión asistida, no para publicación automática.
- Procesamiento por lotes en hardware modesto: con memoria pico de 3,4 GB para una página de 496 tokens de imagen y 5,5 GB para una de 1.479 tokens, cabe en una caja CPU de 8 GB, lo que permite desplegar el servicio en VPS o estaciones de trabajo sin acelerador.
- Integración como librería en aplicaciones Python: el runner `xocr_ort.py` es utilizable como biblioteca con solo `onnxruntime`, `numpy`, `Pillow` y `transformers` para el tokenizador, lo que simplifica el empaquetado en contenedores ligeros.
- Preprocesado de documentos para RAG: la transcripción de páginas a texto estructurado alimenta índices de búsqueda y bases vectoriales sin necesidad de infraestructura GPU.
- Evaluación y prototipado de OCR multilingüe inglés-chino: el soporte de ambos idiomas y la licencia Apache 2.0 permiten experimentar en entornos académicos y comerciales.

## Benchmarks y rendimiento

Resultados del modelo base publicados por Xiaomi Research (no re-ejecutados en el export ONNX):

| Benchmark | Resultado |
|---|---|
| Real5-OmniDocBench | 95,24 |
| OmniDocBench v1.6 | 96,83 |
| UniMER-Test | 97,84 |

Calidad del export ONNX medida por similitud de caracteres (difflib, sin espacios) frente a las transcripciones de referencia, decodificación greedy, proveedor CPU:

| Página | Prompt | ONNX fp32 | ONNX int4 |
|---|---|---|---|
| `receipt.jpg` (región de texto) | "Extract the text in the image." | 95,37 % | 100,00 % |
| `qianziwen.jpeg` (página de caligrafía) | parsing de página completa | 96,15 % | 100,00 % |
| `dense-equations.jpg` (página de fórmulas, truncada a 600 tokens nuevos) | parsing de página completa | 49,20 % | 49,24 % |

El autor advierte que son solo tres páginas y no constituyen un benchmark; la tercera fila está dominada por la truncación. Las secuencias de tokens de ambas builds divergen pronto (prefijo idéntico 10/297, 1/25, 36/600), por lo que el int4 no es una réplica bit a bit del fp32.

Memoria pico (RSS) de un parsing completo, medida con `/usr/bin/time -l` en macOS/arm64:

| Página | Tokens de imagen | ONNX fp32 | ONNX int4 |
|---|---|---|---|
| `qianziwen.jpeg` (517 tokens de prompt) | 496 | 10,3 GB | 3,4 GB |
| `receipt.jpg` (1500 tokens de prompt) | 1.479 | 12,4 GB | 5,5 GB |

## Requisitos de hardware

- VRAM estimada: no aplica en la ruta CPU; el export está pensado para CPU y no es amigable para GPU en esta configuración concreta.
- Memoria RAM: 3,4 GB pico para páginas de ~500 tokens de imagen y 5,5 GB para páginas de ~1.500 tokens de imagen con el build int4; el fp32 requiere 10,3 GB y 12,4 GB respectivamente.
- GPU recomendadas: no disponible para este export; el autor indica que los kernels int4 existen en los proveedores CUDA, DirectML y WebGPU de ONNX Runtime, pero esta exportación concreta no es GPU-friendly.
- Cabe en consumer GPU: no aplica en esta ruta; en CPU cabe en cajas de 8 GB para páginas de tamaño moderado.
- Opciones de despliegue: ONNX Runtime con el runner `xocr_ort.py` (numpy + Pillow + transformers para el tokenizador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Limitación de memoria: dominada por la atención de la torre de visión, que escala con el cuadrado del número de parches; páginas muy grandes pueden exceder la RAM disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Xiaomi-OCR-0 (base) | 0,8B | no disponible | apache-2.0 | PyTorch / HF Transformers | Modelo original de Xiaomi Research |
| Xiaomi-OCR-0 ONNX int4 (esta ficha) | 0,8B | no disponible | apache-2.0 | ONNX Runtime, CPU | Export comunitario cuantizado, 1,7 GB |
| Qwen3.5-0.8B | 0,8B | no disponible | no disponible | PyTorch / HF Transformers | Base del modelo, no especializado en OCR |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo se soportan inglés y chino; otros idiomas no están cubiertos.
- La evaluación de calidad del export se basa en tres páginas, no en un benchmark representativo; los resultados deben tomarse como indicativos.
- El int4 no es bit a bit idéntico al fp32: las secuencias de tokens divergen pronto, aunque el texto renderizado se mantiene a la par en las páginas probadas.
- La truncación a 600 tokens nuevos degrada fuertemente la transcripción de páginas largas (49,24 % de similitud en la página de ecuaciones).
- La torre de visión permanece en fp32 y su atención escala con el cuadrado del número de parches, lo que limita el tamaño de página procesable en memoria.
- El export no es GPU-friendly en esta configuración; el autor recomienda leer la sección de execution providers antes de intentar usarlo en GPU.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible; aplican los riesgos generales de los VLM de OCR.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datos de entrenamiento originales.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; es una exportación comunitaria sin validación externa amplia.

## Enlaces

- Hugging Face (export ONNX int4): https://huggingface.co/androidli/Xiaomi-OCR-0-onnx-int4
- Modelo base en Hugging Face: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Repositorio GitHub: https://github.com/xiaomi-research/Xiaomi-OCR-0
- Mirror en Hugging Face (SeerRay-Lab): https://huggingface.co/SeerRay-Lab/Xiaomi-OCR-0
