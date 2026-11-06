# latrompeababar/gemma-4-12B-it-oQ2e-mtp

## Resumen

`gemma-4-12B-it-oQ2e-mtp` es una cuantización mixta del modelo Gemma 4 12B en su variante instruction-tuned, publicada por el usuario `latrompeababar` en Hugging Face. El checkpoint está empaquetado en formato MLX (Apple Silicon) y ha sido generado con la herramienta oQ (oMLX v0.7.3), que aplica cuantización de precisión mixta por capas en lugar de una cuantización uniforme. El resultado es un checkpoint de 5,4 GB con un promedio efectivo de 3,482 bits por peso, lo que permite ejecutar un modelo de casi 12.000 millones de parámetros en memoria unificada de equipos Apple con recursos moderados.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (11,925B parámetros lógicos), la torre de visión (0,035B) y una cabeza MTP (Multi-Token Prediction, 0,423B) que se mantiene en BF16. Esta última sugiere que el modelo base incorpora decodificación especulativa nativa o predicción multi-token, una innovación orientada a mejorar el throughput de generación. La presencia de visión y de la cabeza MTP indica que se trata de un modelo multimodal con capacidades de razonamiento extendido.

La relevancia de esta publicación es fundamentalmente práctica: demuestra que es posible comprimir un modelo multimodal de 12B a poco más de 5 GB manteniendo una distribución de bits agresiva (34,8% de los pesos a 2 bits) sin descartar componentes como la visión o la cabeza de predicción. No obstante, se trata de una publicación de un tercero, sin model card detallada, sin benchmarks y sin licencia declarada, por lo que su uso en producción requiere verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 unified) con cabeza MTP; empaquetado MLX |
| Parametros totales | 11.959.730.224 (según safetensors); 12.383B lógicos según la model card |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit grupo 64, affine 3-bit grupo 128, affine 3-bit grupo 64, BF16; promedio efectivo 3,482 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del Gemma 4 12B instruction-tuned, no un modelo entrenado desde cero. La arquitectura subyacente es un transformer multimodal de la familia Gemma 4, con una torre de visión dedicada (0,035B parámetros lógicos) y una cabeza MTP de 0,423B parámetros que se conserva en BF16 (16 bits) para preservar su precisión. La cabeza MTP apunta a predicción multi-token, técnica que permite proponer varios tokens por paso y acelerar la decodificación, habitualmente combinada con decodificación especulativa.

La cuantización aplicada por oQ es de precisión mixta y asigna distintos esquemas según la sensibilidad de cada tensor: el 34,828% de los pesos lógicos (4,313B) se almacena a 2 bits con grupo 64 (2,50 bits efectivos), el 53,337% (6,605B) a 3 bits con grupo 128 (3,25 bits efectivos), el 8,129% (1,007B) a 3 bits con grupo 64 (3,50 bits efectivos) y el 3,705% (0,459B) se mantiene en BF16. El modelo de lenguaje ocupa 4,473 GB de almacenamiento, la visión 0,070 GB y la cabeza MTP 0,846 GB. No se dispone de información sobre los datos de entrenamiento originales, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: al derivar de un modelo instruction-tuned de 12B, conserva las capacidades conversacionales y de razonamiento del Gemma 4 base.
- Procesamiento de visión: incluye torre de visión, por lo que puede procesar imágenes además de texto.
- Predicción multi-token: la cabeza MTP en BF16 sugiere soporte para generación acelerada mediante propuesta de múltiples tokens.
- Instrucciones y diálogo multi-turno: la variante `-it` está ajustada para seguir instrucciones.
- Capacidades multilingües: no disponible (no se declaran idiomas en la model card).
- Tool calling / function calling: no disponible (no se documenta en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explícitamente).

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 5,4 GB, por lo que puede cargarse en equipos Mac con memoria unificada de 16 GB o superior, permitiendo ejecutar un modelo de 12B multimodal sin GPU dedicada.
- Prototipado de asistentes multimodales: la combinación de torre de visión y ajuste por instrucciones permite construir demos de descripción de imágenes, respuesta a preguntas visuales o extracción de información de capturas y documentos escaneados en un portátil.
- Evaluación de técnicas de cuantización: sirve como caso de estudio para comparar la calidad de la cuantización mixta de oQ frente a cuantizaciones uniformes de 4 bits o GGUF, midiendo la degradación en tareas de razonamiento y visión.
- Generación acelerada con MTP: la cabeza de predicción multi-token en BF16 puede aprovecharse para experimentar con decodificación especulativa y medir mejoras de throughput en MLX.
- Desarrollo de aplicaciones offline y privadas: al ejecutarse localmente, es adecuado para escenarios donde los datos no pueden salir del dispositivo, como procesamiento de documentos internos o asistentes personales.
- Pruebas de integración en pipelines MLX: permite validar el soporte de `mlx-lm` y `mlx-vlm` para checkpoints cuantizados con esquemas mixtos antes de adoptar la técnica en modelos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 5,389 GB en disco y aproximadamente 5,019 GiB en memoria; se recomienda reservar 6-8 GB de memoria unificada para pesos más caché KV y activaciones.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4, especialmente variantes Pro/Max/Ultra) por el formato MLX. No es directamente compatible con CUDA sin conversión.
- ¿Cabe en consumer GPU? En Apple Silicon sí, en equipos con 16 GB de memoria unificada o más. En GPUs NVIDIA consumer requeriría reconvertir los pesos a un formato compatible (no disponible en este repo).
- Opciones de despliegue: `mlx-lm` y `mlx-vlm` para texto y visión respectivamente; oMLX para gestionar la cuantización. No se proporcionan pesos GGUF ni compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-12B-it-oQ2e-mtp | 11,96B | no disponible | Mixta 2/3/16 bits (3,482 bits/peso) | no disponible | safetensors MLX |
| Gemma 4 12B it (original) | ~12B | no disponible | BF16 | licencia Gemma (según modelo base) | safetensors |
| Cuantizaciones GGUF típicas de 12B | ~12B | no disponible | Q4_K_M (~4,5 bits/peso) | según modelo base | GGUF |

La comparativa con el modelo original y con cuantizaciones GGUF estándar es la más directa: este checkpoint ofrece un tamaño menor (5,4 GB frente a ~7-8 GB de un Q4 típico de 12B) a costa de una precisión media más baja (3,482 bits/peso), manteniendo visión y cabeza MTP. No se dispone de datos de rendimiento para comparar calidad.

## Limitaciones y advertencias

- Publicación de terceros: el autor (`latrompeababar`) no es el desarrollador original de Gemma 4; no hay garantías de fidelidad de la cuantización.
- Licencia no declarada: no se especifica licencia en el repositorio, lo que impide confirmar si el uso comercial está permitido. Habría que remitirse a la licencia del Gemma 4 original.
- Sin benchmarks: no hay evaluación publicada de la degradación de calidad introducida por la cuantización mixta, especialmente en visión y en la cabeza MTP.
- Cuantización agresiva: el 34,8% de los pesos está a 2 bits, lo que puede degradar tareas sensibles como matemáticas, código o razonamiento de varios pasos.
- Cabeza MTP en BF16: incrementa el tamaño del checkpoint (0,846 GB) y debe verificarse que el runtime MLX la utilice correctamente; un mal manejo podría provocar salidas incoherentes.
- Idiomas y contexto no documentados: no se puede confirmar el soporte multilingüe ni la ventana de contexto efectiva.
- Riesgo de alucinación: inherente a los modelos de 12B y potencialmente amplificado por la cuantización.
- Compatibilidad limitada: solo MLX; no hay pesos GGUF ni safetensors estándar para CUDA, lo que restringe su despliegue en servidores NVIDIA.
- Sin descargas ni likes: repositorio sin validación comunitaria, lo que aumenta el riesgo de artefactos defectuosos.

## Enlaces

- Hugging Face: https://huggingface.co/latrompeababar/gemma-4-12B-it-oQ2e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
