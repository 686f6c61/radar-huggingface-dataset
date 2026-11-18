# ATH-MaaS/OvisOCR2

## Resumen

OvisOCR2 es un modelo compacto de extremo a extremo para el parseo de documentos a nivel de página, desarrollado por ATH-MaaS. Partiendo del modelo base Qwen3.5-0.8B, recibe como entrada la imagen de una página y genera una representación en Markdown en orden de lectura natural, cubriendo texto, fórmulas, tablas y regiones visuales. Con 852.985.920 parámetros totales, se posiciona como una alternativa de huella de despliegue muy reducida frente a soluciones de OCR basadas en pipelines.

El modelo ha sido sometido a un post-entrenamiento sobre Qwen3.5-0.8B mediante un motor de datos que combina información real y sintética, junto con una receta de entrenamiento multi-etapa que integra SFT, RL y OPD. Según la model card, alcanza una puntuación global de 96,58 en OmniDocBench v1.6, lo que lo convierte en el primer modelo de extremo a extremo en encabezar un leaderboard previamente dominado por métodos de pipeline, y obtiene el mejor Avg3 de 75,06 en PureDocBench.

Su relevancia actual reside en la combinación de rendimiento puntero en parseo de documentos con un tamaño inferior a mil millones de parámetros, lo que facilita el despliegue en infraestructura modesta. La licencia Apache 2.0 y la compatibilidad con vLLM lo hacen apto para integraciones en producción. Existe una versión posterior, OvisOCR3, indicada en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-0.8B; tag `qwen3_5` |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo de inferencia usa vLLM en precisión nativa) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

OvisOCR2 es un modelo multimodal de tipo image-text-to-text construido mediante post-entrenamiento de Qwen3.5-0.8B. La arquitectura subyacente corresponde a la familia Qwen3.5 (tag `qwen3_5`), con un total de 852.985.920 parámetros. El modelo procesa la imagen de una página completa y emite directamente un documento Markdown, sin depender de un pipeline de detección, segmentación y reconocimiento por etapas.

El entrenamiento combina un motor de datos que mezcla información del mundo real y sintética con una receta multi-etapa que integra SFT (supervised fine-tuning), RL (reinforcement learning) y OPD. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. Tampoco se especifican innovaciones de decodificación o atención más allá del uso de vLLM con backend de prefill `gdn_prefill_backend="triton"` en el ejemplo de inferencia. El prompt de sistema empleado en la inferencia solicita orden de lectura natural, fórmulas en LaTeX, tablas en HTML y regiones visuales como etiquetas `<img>` con coordenadas de bounding box escaladas a [0, 1000), con instrucción explícita de no traducir ni parafrasear.

## Capacidades

- Parseo de documentos a nivel de página: convierte una imagen de página completa en un único documento Markdown en orden de lectura natural.
- Extracción de texto con preservación literal del contenido original, sin traducción ni paráfrasis.
- Reconocimiento de fórmulas matemáticas y serialización en LaTeX.
- Reconocimiento de tablas y serialización en HTML (`<table>...</table>`).
- Detección y representación de regiones visuales (gráficos e imágenes) mediante etiquetas `<img src="images/bbox_{left}_{top}_{right}_{bottom}.jpg" />` con coordenadas normalizadas a [0, 1000).
- Procesamiento por lotes de imágenes en una sola llamada de generación mediante vLLM.
- Modo de generación sin thinking (`enable_thinking=False` en el template de chat).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: únicamente entrada de imagen; audio no disponible.

## Casos de uso

- Digitalización masiva de archivos documentales: el modelo procesa páginas completas en una sola pasada y devuelve Markdown estructurado, lo que permite convertir lotes de escaneos en texto indexable sin construir un pipeline de detección y reconocimiento por etapas.
- Extracción de tablas financieras o científicas: la salida en HTML conserva la estructura de filas y columnas, lo que facilita el post-procesado con parsers HTML y la carga en bases de datos o hojas de cálculo.
- Conversión de documentación técnica con fórmulas: la serialización en LaTeX permite reutilizar el contenido en entornos de publicación científica, wikis técnicas o generadores de documentación que renderizan matemáticas.
- Ingesta de documentos para sistemas RAG: al generar Markdown en orden de lectura, el texto resultante se puede trocear y embeder directamente, manteniendo la coherencia estructural de la página original.
- Procesamiento de artículos y páginas con figuras: la representación de regiones visuales mediante bounding boxes normalizadas permite recortar y asociar imágenes a su posición en el documento para reconstruir el layout.
- Automatización de back-office con presupuesto de hardware limitado: con menos de mil millones de parámetros y pesos de 1,7 GB, el modelo puede desplegarse en una única GPU y atender cargas de extracción documental donde no es viable servir modelos de mayor tamaño.
- Normalización de documentos escaneados en pipelines de CI/CD documental: la API por lotes sobre vLLM permite integrar el parseo como un paso más del procesamiento automatizado de entradas documentales.

## Benchmarks y rendimiento

| Benchmark | Resultado | Nota |
|---|---|---|
| OmniDocBench v1.6 (score global) | 96,58 | Primer modelo de extremo a extremo en encabezar el leaderboard, previamente dominado por métodos de pipeline |
| PureDocBench (Avg3) | 75,06 | Mejor Avg3 según la model card |

No se han publicado en la información disponible resultados desglosados por categoría (texto, tablas, fórmulas) ni comparativas numéricas fila a fila con modelos concretos; las gráficas de comparación referenciadas en la model card no aportan cifras en el texto extraído.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, los pesos en precisión nativa (BF16/FP16) ocupan aproximadamente 1,7 GB; el ejemplo oficial configura `gpu_memory_utilization=0.8` con `tensor_parallel_size=1`.
- GPU recomendadas: una única GPU es suficiente; el ejemplo de vLLM no requiere paralelismo tensorial. No se especifican modelos de GPU concretos en la información disponible.
- Compatibilidad con GPU de consumo: por tamaño de pesos, cabe en GPU de consumo con suficiente VRAM para el modelo más la caché KV y el procesamiento de imágenes; no se detallan modelos concretos ni cifras de VRAM total.
- Opciones de despliegue: vLLM 0.22.1 (versión indicada en el ejemplo oficial, con `gdn_prefill_backend="triton"`); otros motores como llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Resolución de entrada: el ejemplo fija `min_pixels` en 448×448 y `max_pixels` en 2880×2880.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OvisOCR2 | 852.985.920 | no disponible | 96,58 en OmniDocBench v1.6; 75,06 Avg3 en PureDocBench | apache-2.0 | Hugging Face, demo online, vLLM |
| OvisOCR3 | no disponible | no disponible | no disponible | no disponible | Referenciado como `new_version` en la model card de OvisOCR2 |
| Alternativas de pipeline OCR | no aplica (sistemas multi-componente) | no disponible | Superados por OvisOCR2 en OmniDocBench v1.6 según la model card | variable | no disponible |
| Otros modelos end-to-end de parseo documental | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de cifras comparativas con modelos competidores concretos de tamaño similar.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al entrenarse sobre datos reales y sintéticos, puede heredar sesgos de las fuentes documentales empleadas.
- Riesgo de alucinación: el prompt oficial exige preservar el texto sin traducir ni parafrasear, pero no se documentan métricas específicas de fidelidad ni de texto inventado.
- Repeticiones truncadas: el código de ejemplo incluye una función `_clean_truncated_repeats` para recortar bucles de repetición en salidas largas (a partir de 8000 caracteres), lo que indica que el modelo puede generar repeticiones degeneradas en documentos extensos.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Longitud de contexto: no disponible; el ejemplo limita la generación a `max_tokens=16384`, lo que acota el tamaño de página procesable.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B.
- Producción: la model card declara una versión posterior (OvisOCR3); para nuevos despliegues debería evaluarse esa versión antes de fijar OvisOCR2.
- Dependencia de versión: el ejemplo fija `vllm==0.22.1` y el backend `gdn_prefill_backend="triton"`; otras versiones o backends pueden no estar soportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ATH-MaaS/OvisOCR2
- Informe técnico (arXiv): https://arxiv.org/abs/2607.13639
- Demo online (Hugging Face Spaces): https://huggingface.co/spaces/ATH-MaaS/OvisOCR2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Versión posterior: https://huggingface.co/ATH-MaaS/OvisOCR3
