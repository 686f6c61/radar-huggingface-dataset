# DarumOrt/whisper-small-timestamped-onnx

## Resumen

DarumOrt/whisper-small-timestamped-onnx es una conversión a formato ONNX del modelo Whisper Small de OpenAI, publicada por el usuario DarumOrt en HuggingFace. Whisper Small es un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder basado en transformer, entrenado por OpenAI sobre 680.000 horas de audio supervisado multilingüe. El sufijo "timestamped" del nombre sugiere que la conversión está orientada a la obtención de marcas temporales (timestamps) a nivel de palabra o segmento, aunque la model card publicada no aporta detalles adicionales.

La relevancia de esta ficha es limitada: el repositorio no incluye pipeline declarado, no especifica idiomas soportados, no documenta el proceso de exportación a ONNX y no ha recibido descargas ni interacciones desde su creación. La licencia declarada es MIT, heredada del modelo original de OpenAI, lo que permite uso comercial sin restricciones adicionales.

Se trata, por tanto, de un artefacto de conversión de formato más que de un modelo nuevo. Su interés práctico reside en la posibilidad de ejecutar Whisper Small con ONNX Runtime en entornos donde PyTorch no está disponible o donde se busca reducir la huella de dependencias, pero la ausencia de documentación técnica en el repositorio obliga a tratar cualquier detalle de implementación como no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small, OpenAI) |
| Parametros totales | 244 millones (cifra del modelo Whisper Small original; no confirmada en el repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (Whisper Small original; no confirmado en el repositorio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en el repositorio (Whisper Small original: multilingüe, ~99 idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Small: un transformer encoder-decoder con 12 capas en el encoder y 12 en el decoder, dimensión de modelo 768, 12 cabezas de atención y 244 millones de parámetros. El encoder procesa espectrogramas Mel de 80 canales extraídos de ventanas de 30 segundos de audio; el decoder genera tokens de texto de forma autorregresiva con atención cruzada sobre la salida del encoder. Whisper fue entrenado por OpenAI sobre 680.000 horas de audio débilmente supervisado, con una combinación de tareas de transcripción, traducción al inglés y predicción de marcas temporales.

El repositorio de DarumOrt no documenta el proceso de exportación a ONNX: no se indica la versión de PyTorch u Optimum utilizada, ni si se aplicaron optimizaciones de grafos, ni si se exportaron los componentes por separado (encoder y decoder) o como un único grafo. Tampoco se especifica si la conversión preserva la capacidad de predicción de timestamps del modelo original o si el sufijo "timestamped" implica algún post-procesado adicional. No hay información sobre datos de entrenamiento propios, fine-tuning, RLHF ni DPO; se trata presumiblemente de una conversión directa de los pesos originales de OpenAI.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto), asumiendo las capacidades del Whisper Small original.
- Predicción de marcas temporales a nivel de segmento y potencialmente de palabra, según sugiere el nombre del repositorio (no verificado en la documentación).
- Traducción de audio a inglés, capacidad presente en Whisper Small original (no confirmada en esta conversión).
- Detección de idioma, capacidad presente en Whisper Small original (no confirmada en esta conversión).
- Ejecución mediante ONNX Runtime, lo que permite despliegue sin PyTorch.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido; son capacidades ajenas al propósito de un modelo ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir audio de hasta 30 segundos por ventana en texto con marcas temporales, útil para generar actas con referencia temporal a cada intervención.
- Subtitulado automático de vídeo: la predicción de timestamps permite alinear los subtítulos con el audio, siempre que la conversión ONNX preserve esa capacidad (no verificada).
- Despliegue en entornos sin PyTorch: al estar en formato ONNX, puede integrarse en servicios basados en ONNX Runtime, útil en contenedores ligeros o en plataformas con restricciones de dependencias.
- Procesamiento por lotes en servidores CPU: ONNX Runtime ofrece ejecución eficiente en CPU, lo que permite transcripciones masivas sin GPU para volúmenes moderados.
- Integración en aplicaciones de escritorio o móviles: el tamaño de Whisper Small (244 M de parámetros) es manejable para despliegues en dispositivos con recursos limitados, aunque la viabilidad depende de la cuantización aplicada, no documentada.
- Investigación y evaluación de pipelines ASR: sirve como referencia para comparar el rendimiento de ONNX Runtime frente a PyTorch en tareas de transcripción con timestamps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en el repositorio. Como referencia del modelo original Whisper Small en FP32, se requieren aproximadamente 1 GB de memoria para los pesos, más memoria para activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP32; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este tamaño, pero funcionarían sin problema.
- Compatibilidad con GPU de consumo: sí, Whisper Small cabe holgadamente en GPUs de consumo como GTX 1660, RTX 3050 o superiores, siempre que la conversión ONNX sea compatible con el proveedor de ejecución CUDA de ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), potencialmente con integración en servidores de inferencia que acepten ONNX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a modelos ASR de este tipo.
- Latencia y throughput: no disponibles. Dependen de la implementación, el hardware y la cuantización, ninguno de los cuales se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (audio) | Formato | Licencia | Documentacion |
|---|---|---|---|---|---|
| DarumOrt/whisper-small-timestamped-onnx | 244 M (original) | 30 s por ventana | ONNX | MIT | Mínima |
| openai/whisper-small | 244 M | 30 s por ventana | PyTorch (safetensors/bin) | MIT | Completa (model card oficial) |
| openai/whisper-base | 74 M | 30 s por ventana | PyTorch | MIT | Completa |
| openai/whisper-medium | 769 M | 30 s por ventana | PyTorch | MIT | Completa |

La comparación relevante es con el Whisper Small original de OpenAI: misma arquitectura y mismos pesos presumiblemente, pero con formato ONNX y documentación prácticamente inexistente. Frente a Whisper Base, el Small ofrece mayor precisión a costa de más cómputo; frente a Whisper Medium, el Small es más ligero pero menos preciso. No se dispone de datos de rendimiento específicos de esta conversión para comparar numéricamente.

## Limitaciones y advertencias

- La model card del repositorio está prácticamente vacía: no se documentan idiomas, proceso de exportación, cuantización ni uso previsto, lo que dificulta evaluar su idoneidad en producción.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso ni validación por parte de la comunidad.
- No se confirma que la conversión preserve la capacidad de predicción de timestamps pese al nombre del repositorio; es necesario verificarlo empíricamente.
- Whisper Small, como todos los modelos ASR, presenta mayor tasa de error en audio con ruido, acentos marcados, solapamiento de hablantes y vocabulario técnico especializado.
- Riesgo de alucinación en pasajes de silencio o ruido: Whisper puede generar texto inventado cuando el audio no contiene habla clara.
- Sesgos heredados del entrenamiento de Whisper: posibles diferencias de precisión entre idiomas, dialectos y variedades del habla.
- La licencia MIT permite uso comercial sin restricciones, pero conviene verificar que la conversión no introduzca dependencias con licencias incompatibles (no documentadas).
- No hay garantía de compatibilidad con versiones específicas de ONNX Runtime ni con proveedores de ejecución distintos de CPU.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DarumOrt/whisper-small-timestamped-onnx
- Modelo original Whisper Small de OpenAI: https://huggingface.co/openai/whisper-small
- Repositorio de código de Whisper: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
