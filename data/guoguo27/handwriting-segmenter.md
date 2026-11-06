# guoguo27/handwriting-segmenter

## Resumen

Handwriting Segmenter es un modelo de segmentación de imágenes de documentos especializado en separar, dentro de una página escaneada, cuatro clases de píxel: fondo, texto impreso, escritura manual y solapamiento entre escritura manual y texto impreso. Lo publica el usuario guoguo27 en Hugging Face y deriva de Inoob/DIS-Handwriting-Remover, que a su vez se basa en la arquitectura IS-Net del repositorio xuebinqin/DIS. El modelo se distribuye exclusivamente en formato ONNX (opset 17) y está pensado para ejecutarse con onnxruntime sin depender de frameworks de deep learning completos.

El problema que resuelve es concreto: dado un examen o cuestionario escaneado con las respuestas de un estudiante escritas a mano, generar una máscara que permita borrar esas respuestas y dejar la hoja limpia para reutilizarla como plantilla de práctica. No es un modelo generativo ni un OCR; produce logits por píxel que, tras softmax, permiten decidir qué zonas son tinta manuscrita.

Es relevante por su enfoque de despliegue ligero (un único fichero ONNX de 176 MB, entrada y salida con dimensiones dinámicas) y por documentar de forma explícita su contrato de entrada/salida y sus métricas de evaluación en 15 páginas reservadas, algo poco habitual en modelos de segmentación de documentos de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IS-Net (segmentación de imágenes), exportada a ONNX opset 17 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrenamiento 1536 px en el lado largo) |
| Tipos de cuantizacion | no disponible (el autor etiqueta el modelo base como "quantized", pero no se detallan esquemas de cuantización) |
| Idiomas soportados | no disponible (el modelo no procesa texto como tal; entrenado con material en inglés de matemáticas y ciencias de secundaria) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`finetuned_e.onnx`, 176 MB, opset 17) |

## Arquitectura y entrenamiento

El modelo es una red IS-Net (arquitectura de segmentación binaria/multiclase basada en U-Net con módulos de atención intermedios, original de xuebinqin/DIS) adaptada a cuatro clases. Se parte de los pesos de Inoob/DIS-Handwriting-Remover, que originalmente tenía cabeceras laterales binarias, y se "elevan" a cuatro clases: fondo (0), impreso (1), escritura manual (2) y solapamiento (3). La entrada es un tensor float32 `[N, 3, H, W]` en RGB normalizado como `pixel/255 - 0.5`, con N, H y W dinámicos; la salida son logits `[N, 4, H, W]`.

El ajuste fino se hizo con 111 pares reales de páginas respondidas y sus originales limpios, alineados mediante SIFT + RANSAC + ECC y etiquetados por diferencia de imágenes, dejando una banda de ignorancia (etiqueta 255) alrededor de los glifos impresos. Se entrenó con recortes de 768 px (12 por página), 40 épocas, optimizador AdamW, seleccionando la mejor época (21) por IoU de tinta en un conjunto reservado. No se documenta el uso de RLHF, DPO ni datos sintéticos; el volumen de entrenamiento es muy reducido y específico de un dominio.

## Capacidades

- Segmentación semántica de imágenes de documentos en cuatro clases (fondo, impreso, manuscrito, solapamiento).
- Generación de máscara de tinta manuscrita combinando las probabilidades de las clases 2 y 3 con umbral recomendado de 0,6.
- Entrada con dimensiones dinámicas (N, H, W), lo que permite procesar páginas de distinta resolución y lotes variables.
- Ejecución en CPU o GPU mediante onnxruntime, sin necesidad de PyTorch en producción.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de una sola pasada.
- No tiene capacidades multilingües ni de texto: no realiza OCR ni reconoce caracteres.
- No dispone de modo "thinking", visión general, audio ni generación de lenguaje.

## Casos de uso

- Reutilización de hojas de examen: escanear un cuestionario respondido, obtener la máscara de tinta manuscrita y borrar esas zonas rellenándolas con la mediana del fondo local, generando una plantilla limpia para nuevos estudiantes.
- Digitalización de archivos docentes: separar en un PDF escaneado qué píxeles corresponden a la impresión original y cuáles a anotaciones manuscritas, para conservar solo el contenido impreso.
- Control de calidad de escaneos: detectar automáticamente si una página contiene escritura manual superpuesta al texto impreso y marcarla para revisión.
- Preprocesado para OCR: enmascarar la escritura manual antes de pasar la página a un motor de OCR, reduciendo falsos positivos en la transcripción del texto impreso.
- Análisis de formularios: identificar en cuestionarios con casillas y campos de respuesta qué zonas han sido rellenadas a mano, alimentando un pipeline posterior de corrección.
- Herramientas de estudio y práctica: integrar el modelo en una aplicación web o de escritorio que permita al usuario "limpiar" sus propias hojas resueltas para repetir ejercicios, ejecutando el ONNX en el navegador o en un servidor modesto.
- Investigación en segmentación de documentos: servir como línea base reproducible (contrato claro, métricas publicadas) para comparar nuevas técnicas de separación impreso/manuscrito.

## Benchmarks y rendimiento

Evaluación del autor en 15 páginas reservadas (cuestionarios completos, umbral 0,6):

| Métrica | Valor |
|---|---|
| Precisión de tinta | 0,848 |
| Recall de tinta | 0,834 |
| F1 de tinta | 0,841 |
| IoU impreso | 0,732 |
| IoU escritura manual | 0,726 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor advierte que la banda de ignorancia alrededor de los glifos impresos hace que los trazos tenues y los bordes de trazo queden parcialmente fuera de estas métricas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero ONNX ocupa 176 MB y una entrada de 1536 px en el lado largo requiere memoria de activaciones moderada (estimación orientativa de 1-3 GB en GPU, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia a 1536 px; tarjetas consumer como RTX 3060, RTX 4060 o superiores son suficientes. A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, con holgura, y también puede ejecutarse en CPU con onnxruntime.
- Opciones de despliegue: onnxruntime (Python, C++, JS/Web), integración en servicios web; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de segmentación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guoguo27/handwriting-segmenter | IS-Net ONNX | 4 (fondo, impreso, manuscrito, solapamiento) | 1536 px lado largo | Apache-2.0 | Hugging Face, 0 descargas |
| Inoob/DIS-Handwriting-Remover | IS-Net (modelo base) | binaria (manuscrito/no manuscrito) | no disponible | no disponible en la información | Hugging Face |
| xuebinqin/DIS | IS-Net original | binaria (saliencia) | no disponible | no disponible en la información | GitHub |

La comparación con alternativas de la misma categoría (segmentadores de documentos especializados en separar impreso y manuscrito) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Las curvas impresas suaves (por ejemplo, gráficas de funciones) se clasifican a menudo como escritura manual, con independencia del color o del umbral.
- Entrenado con un conjunto muy pequeño (111 pares) de cuestionarios de matemáticas y ciencias de secundaria; otros diseños de página, idiomas y sistemas de escritura no han sido probados.
- La salida es una máscara: el autor recomienda borrar de forma determinista (rellenar con la mediana del fondo local) y evitar el inpainting generativo, que puede inventar contenido en una hoja de estudio.
- La banda de ignorancia alrededor de los glifos impresos reduce la sensibilidad a trazos tenues y bordes, lo que puede infraestimar la tinta en escritura fina.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos/negativos en la máscara; validar en el dominio concreto antes de producción.
- Licencia Apache-2.0 permite uso comercial, pero el repositorio de entrenamiento incluye un fichero NOTICE con atribución obligatoria a DIS y a Inoob/DIS-Handwriting-Remover.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guoguo27/handwriting-segmenter
- Modelo base: https://huggingface.co/Inoob/DIS-Handwriting-Remover
- Repositorio de código de entrenamiento: https://github.com/Illvuu/handwriting-segmenter
- Repositorio original de IS-Net (DIS): https://github.com/xuebinqin/DIS
