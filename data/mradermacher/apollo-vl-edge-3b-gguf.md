# mradermacher/Apollo-VL-Edge-3B-GGUF

## Resumen

Apollo-VL-Edge-3B es un modelo de visión y lenguaje (VLM) ligero desarrollado por Pluto-AI-Labs, basado en la arquitectura Qwen2.5-VL con 3 mil millones de parámetros. Está diseñado para ejecutarse en dispositivos con recursos limitados (edge AI) y se especializa en tareas como OCR, comprensión de gráficos y razonamiento visual multimodal. Esta ficha se centra en la versión cuantizada a GGUF por mradermacher, que facilita su despliegue con llama.cpp, Ollama y otras herramientas de inferencia local.

La cuantización reduce el tamaño del modelo y los requisitos de memoria, manteniendo un rendimiento aceptable para escenarios de producción en entornos con GPU de consumo o incluso CPU. El modelo base se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas. Su reducido tamaño y su enfoque en tareas visuales lo convierten en una opción interesante para prototipos y aplicaciones embebidas, aunque la información pública sobre su entrenamiento y benchmarks es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (VLM, transformer con vision encoder) |
| Parametros totales | 668.684.288 (según safetensors del repo GGUF; el modelo se denomina 3B, posiblemente incluye solo el LLM sin el vision encoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificado en la información proporcionada) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; además mmproj-f16 y mmproj-Q8_0 para el proyector de visión |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye archivos .gguf para el LLM y .mmproj para el módulo multimodal) |

## Arquitectura y entrenamiento

El modelo base Apollo-VL-Edge-3B sigue la arquitectura Qwen2.5-VL, que combina un vision encoder (ViT) con un modelo de lenguaje transformer. Esta configuración permite procesar imágenes y texto de forma conjunta, generando respuestas basadas en contenido visual. El repositorio GGUF incluye un archivo `.mmproj` separado que contiene el proyector multimodal, necesario para conectar el vision encoder con el LLM durante la inferencia.

No se dispone de información pública detallada sobre el proceso de entrenamiento del modelo base: no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La cuantización realizada por mradermacher es de tipo estático, sin usar imatrix (según la model card), lo que implica una ligera pérdida de precisión respecto a cuantizaciones dinámicas, aunque suele ser aceptable para tareas de visión.

## Capacidades

- Generación de texto y respuestas basadas en imágenes (multimodal).
- OCR (reconocimiento óptico de caracteres) en imágenes y documentos escaneados.
- Comprensión de gráficos, tablas y diagramas (chart understanding).
- Razonamiento visual: responder preguntas sobre el contenido de una imagen.
- Soporte para inferencia en dispositivos edge gracias a su tamaño reducido y a las cuantizaciones GGUF.
- Integración con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.) para despliegue local.

## Casos de uso

- **Digitalización de documentos**: extraer texto de facturas, recibos o formularios mediante OCR, gracias a su capacidad para procesar imágenes y devolver texto estructurado.
- **Análisis de gráficos financieros**: interpretar gráficos de líneas, barras o tartas en informes, respondiendo preguntas como "¿cuál fue la tendencia en el segundo trimestre?".
- **Asistencia visual para personas con discapacidad**: describir escenas o leer etiquetas en tiempo real desde un dispositivo móvil o cámara, gracias a su bajo consumo de recursos.
- **Automatización de tickets de soporte**: procesar capturas de pantalla o imágenes adjuntas en tickets para extraer información relevante y categorizar la solicitud.
- **Aplicaciones de realidad aumentada**: reconocer objetos o texto en el entorno y superponer información contextual, ejecutable en hardware de gama baja.
- **Prototipado rápido de chatbots multimodales**: integrar el modelo en un pipeline de RAG visual para responder preguntas sobre catálogos de productos o manuales técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo aparece en una solicitud para ser incluido en el leaderboard de VLMEvalKit (issue #1632), pero no se muestran puntuaciones concretas. Se recomienda evaluar el modelo con tareas propias antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización. Para Q4_K_M (tamaño aproximado de 2-3 GB), se puede ejecutar en GPU con 4-6 GB de VRAM. Para f16 (tamaño ~6.7 GB), se necesitan al menos 8 GB. El archivo mmproj añade entre 0.9 y 1.4 GB adicionales.
- GPU recomendadas: RTX 3060/4060 (8 GB), RTX 3090/4090 (24 GB) para cuantizaciones altas, o GPUs de datacenter como A10/A100 si se requiere mayor throughput.
- En CPU: es posible ejecutar cuantizaciones Q4_K_M o inferiores con 8-16 GB de RAM, aunque la latencia será mayor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF (llama-cpp-python, etc.).
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantización; en una GPU moderna (RTX 4090) se espera una velocidad de decodificación de decenas de tokens por segundo para modelos de 3B.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros VLM pequeños. Como referencia cualitativa, el modelo base Apollo-VL-Edge-3B se posiciona en la misma categoría que otros VLM de ~3B como LLaVA-Phi-3-mini o MiniCPM-V 2.6, aunque no se han publicado resultados comparativos. La principal ventaja es su licencia Apache-2.0 y su formato GGUF, que facilita el despliegue en entornos edge.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está garantizado.
- La información pública sobre el entrenamiento es escasa; no se conocen los datos utilizados ni las técnicas de alineación, lo que dificulta predecir su comportamiento en dominios específicos.
- Riesgo de alucinaciones visuales: como todo VLM, puede generar descripciones incorrectas o inventar detalles de las imágenes.
- La cuantización estática (sin imatrix) puede degradar la precisión en tareas que requieren alta fidelidad, como OCR con fuentes pequeñas.
- El tamaño de contexto no está confirmado; si se basa en Qwen2.5-VL, probablemente sea de 32k o 128k tokens, pero no se ha verificado en esta versión.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original para asegurar que no existan restricciones adicionales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Apollo-VL-Edge-3B-GGUF
- Modelo base: https://huggingface.co/Pluto-AI-Labs/Apollo-VL-Edge-3B
- Issue en VLMEvalKit para añadir al leaderboard: https://github.com/open-compass/VLMEvalKit/issues/1632
- Perfil de mradermacher: https://huggingface.co/mradermacher
