# alvarolizama/LFM3-VL-2B-MLX-oQ8-fp16

## Resumen

LFM3-VL-2B-MLX-oQ8-fp16 es una cuantización mixta del modelo multimodal LFM3-VL-2B de Liquid AI, publicada por el usuario alvarolizama en Hugging Face. Se trata de un checkpoint de aproximadamente 1.918 millones de parámetros (1,73B en el modelo de lenguaje y 189M en el codificador visual) convertido al formato MLX mediante la herramienta oQ (oMLX v0.7.3), que aplica cuantización de precisión mixta para optimizar el equilibrio entre tamaño y fidelidad numérica en hardware Apple Silicon.

El modelo base combina un transformer de lenguaje con un módulo de visión, lo que lo habilita para tareas de comprensión de imágenes y texto. Esta versión cuantizada reduce el peso total a unos 2,4 GiB efectivos, con una media de 10,822 bits por peso: la mayor parte de los pesos (90,1%) se almacena en 8 bits afín con grupo de 64, mientras que un 9,9% de los parámetros (correspondientes a componentes del módulo visual) se mantiene en FP32 para preservar precisión en las capas sensibles.

Su relevancia es doble: por un lado, demuestra el flujo de cuantización mixta de oQ aplicado a un modelo visión-lenguaje de tamaño compacto, apto para ejecución local en Macs con memoria unificada; por otro, al ser un derivado comunitario de un modelo de Liquid AI, conviene evaluarlo con cautela dado que la model card original apenas aporta metadatos sobre licencia, idiomas o pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + módulo de visión), formato MLX |
| Parámetros totales | 1.918.181.888 (1,73B lenguaje + 0,189B visión) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización mixta oQ: 8-bit afín grupo 64 (90,1%), FP16 (0,02%), FP32 (9,87%); media 10,822 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), custom_code |

## Arquitectura y entrenamiento

El checkpoint es un derivado cuantizado del modelo LFM3-VL-2B, que combina un backbone de lenguaje de tipo transformer con un codificador visual, siguiendo el patrón habitual de los modelos visión-lenguaje. La cuantización se realizó con oQ (oMLX v0.7.3), que asigna precisiones distintas por tensor: los pesos del modelo de lenguaje se almacenan en 8 bits afín con grupo de 64 (1,710 GiB para 1,728B de pesos lógicos, 8,50 bits/peso efectivos), mientras que los 189M de parámetros del módulo de visión se mantienen en FP32 (0,705 GiB, 32 bits/peso). Una fracción mínima (0,02%) permanece en FP16. El resultado es un checkpoint de 2,417 GiB con una media de 10,822 bits/peso.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, la composición de los datos, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas específicas más allá de la propia cuantización mixta. La model card del derivado se limita a describir la distribución de bits y el desglose de almacenamiento, sin detallar el proceso de calibración ni los criterios de asignación de precisión por capa.

## Capacidades

- Generación de texto y razonamiento general, heredadas del backbone de lenguaje de 1,73B parámetros.
- Comprensión de imágenes y respuesta a preguntas visuales, gracias al módulo de visión de 189M parámetros conservado en FP32.
- Procesamiento conjunto de entradas imagen-texto en un único modelo (visión-lenguaje).
- Ejecución local en hardware Apple Silicon mediante la librería MLX.
- Cuantización mixta que preserva en alta precisión las capas visuales, potencialmente mejorando la fidelidad en tareas multimodales frente a una cuantización uniforme.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: al ocupar unos 2,4 GiB en formato MLX, el modelo puede cargarse en equipos Apple Silicon de gama media (por ejemplo, MacBook con 16 GB) para experimentación con modelos visión-lenguaje sin depender de la nube.
- Prototipado de asistentes visuales: permite construir demos de descripción de imágenes o respuesta a preguntas sobre capturas y documentos escaneados en un entorno de desarrollo local.
- Evaluación de técnicas de cuantización: sirve como caso de estudio para comparar la cuantización mixta de oQ (8-bit en lenguaje, FP32 en visión) frente a cuantizaciones uniformes en términos de calidad multimodal.
- Investigación en eficiencia de modelos pequeños: su tamaño compacto (menos de 2B parámetros) lo hace adecuado para estudiar el equilibrio precisión-tamaño en tareas de razonamiento visual.
- Integración en aplicaciones macOS nativas: al usar MLX, puede embeberse en apps Swift/Python para macOS que requieran procesamiento de imagen y texto en el dispositivo.
- Fines educativos y de reproducción: útil para quienes quieran replicar el pipeline de cuantización oQ sobre otros modelos visión-lenguaje y comparar distribuciones de bits.
- Clasificación y extracción de información de imágenes: tareas de OCR ligero o etiquetado visual en lotes pequeños, siempre que se valide la calidad tras la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 2,4-2,6 GiB solo para los pesos; con overhead de activaciones y contexto, se recomienda al menos 8 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) por el uso de MLX; no está pensado para GPUs NVIDIA/AMD sin conversión previa.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con memoria unificada de 8 GB o superior; en GPUs dedicadas requeriría reconvertir el checkpoint a otro formato (no incluido).
- Opciones de despliegue: MLX (librería nativa), mlx-lm y utilidades de oMLX; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-oQ8-fp16 (este) | 1,918B (1,73B LM + 0,189B visión) | no disponible | safetensors MLX, cuantización mixta | no disponible | Hugging Face (0 descargas) |
| LFM3-VL-2B (modelo base) | ~2B | no disponible | safetensors | no disponible | Referenciado por el autor, no verificado |
| Alternativas de ~2B visión-lenguaje | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La model card no especifica la licencia del modelo base ni de este derivado; antes de un uso comercial es imprescindible verificar la licencia original de LFM3-VL-2B con Liquid AI.
- El proceso de cuantización puede degradar la calidad respecto al modelo original, especialmente en tareas de razonamiento complejo o generación larga; no se aportan métricas de evaluación que lo cuantifiquen.
- El módulo de visión se mantiene en FP32, lo que eleva el peso total por encima de lo que sería una cuantización uniforme de 8 bits; el ahorro de memoria es moderado.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación específico de este checkpoint.
- El formato MLX limita su uso a hardware Apple Silicon; no es portable directamente a GPUs NVIDIA sin conversión.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día: no hay evidencia de validación comunitaria ni de que el checkpoint funcione correctamente.
- La etiqueta `custom_code` implica que la carga requiere código personalizado; conviene auditar ese código antes de ejecutarlo en producción.
- No se documenta el pipeline ni la configuración de inferencia, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alvarolizama/LFM3-VL-2B-MLX-oQ8-fp16
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Modelo base LFM3-VL-2B (Liquid AI): no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada
