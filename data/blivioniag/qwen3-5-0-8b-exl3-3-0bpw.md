# BlivionIaG/Qwen3.5-0.8B-exl3-3.0bpw

## Resumen

Qwen3.5-0.8B-exl3-3.0bpw es una cuantización de 3.0 bits por peso del modelo Qwen3.5-0.8B de Alibaba, realizada por BlivionIaG utilizando el formato EXL3 (bitshift trellis) de ExLlamaV3. El modelo base es un vision-language ligero de aproximadamente 0.8 mil millones de parámetros (444.803.392 según los pesos reales), con una ventana de contexto de 262K tokens y capacidades multimodales nativas. La cuantización reduce el tamaño del repositorio a 0.9 GB, lo que permite su despliegue en hardware con recursos limitados, como GPUs de consumo o dispositivos edge. Es relevante porque ofrece una alternativa eficiente para ejecutar un modelo multimodal pequeño sin sacrificar demasiada calidad: la pérdida de perplexity respecto al modelo en fp16 es solo del 9,2% y la top-1 accuracy cae 2,5 puntos porcentuales. Al estar licenciado bajo Apache 2.0, puede usarse comercialmente sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basado en Qwen3.5 |
| Parametros totales | 444.803.392 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (según base model) |
| Tipos de cuantizacion | EXL3 3.0 bpw (head 6.0 bpw) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (bitshift trellis) - no compatible con Transformers estándar |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización del modelo base Qwen3.5-0.8B de Alibaba. El modelo original es un transformer multimodal con encoder de visión, diseñado para tareas de imagen-texto a texto. La cuantización se realizó con ExLlamaV3 utilizando el formato EXL3, que emplea codificación trellis con desplazamiento de bits y un codebook procedural llamado "3inst". La calibración se efectuó sobre 256 filas por 2048 columnas de un corpus de texto general (mezcla de C4, Wikipedia, código y material técnico), aplicando escalas de canal de salida en todos los casos. No se aplicó ningún proceso de ajuste fino, RLHF o DPO; las capacidades del modelo base se mantienen intactas, aunque con una ligera degradación debida a la compresión.

## Capacidades

- Generación de texto y comprensión de lenguaje natural, con razonamiento mejorado respecto a Qwen3 según la documentación de Alibaba.
- Procesamiento de imágenes: entrada visual nativa (pipeline image-text-to-text), capaz de describir, analizar o responder preguntas sobre imágenes.
- Ventana de contexto larga de 262K tokens, adecuada para documentos extensos o conversaciones multi-turno con historial amplio.
- Instrucción y seguimiento de órdenes, con mejoras en lógica, matemáticas y comprensión lectora frente a la generación anterior.
- Soporte multilingüe limitado al inglés en esta versión cuantizada (el modelo base puede tener más idiomas, pero la card solo declara "en").
- No se ha confirmado soporte de tool calling, function calling o modo agente en la información disponible.

## Casos de uso

- Clasificación y etiquetado de imágenes en dispositivos edge: al ser un modelo de 0.8B cuantizado a 3 bits, cabe en GPUs de baja gama o incluso en CPU, permitiendo inferencia local de visión sin conexión a la nube.
- Asistentes de accesibilidad para personas con discapacidad visual: el modelo puede describir escenas o leer texto de imágenes en tiempo real, gracias a su baja latencia y pequeño tamaño.
- Chatbots de atención al cliente con entrada visual: los usuarios pueden enviar capturas de pantalla o fotos de productos, y el modelo responde con texto usando su contexto de 262K para mantener conversaciones largas.
- Análisis de documentos escaneados: extracción de información de facturas, formularios o recibos mediante la combinación de OCR implícito y razonamiento textual.
- Prototipado rápido de aplicaciones multimodales: desarrolladores pueden integrar el modelo en pipelines de prueba sin necesidad de hardware caro, gracias a su compatibilidad con ExLlamaV3.
- Educación y tutoría interactiva: el modelo puede responder preguntas sobre diagramas o ilustraciones, facilitando el aprendizaje asistido por IA en entornos con recursos limitados.

## Benchmarks y rendimiento

La model card del autor proporciona la siguiente evaluación comparativa entre el modelo en fp16 y la versión cuantizada a 3.0 bpw:

| Metrica | fp16 | 3.0bpw EXL3 | Delta |
|---|---|---|---|
| Perplexity (Wiki) | 11.21 | 12.24 | +9.2% |
| KL div (fp16 \|\| 3bit) | — | 0.101 | — |
| Top-1 accuracy | 0.525 | 0.512 | −2.5pp |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. La evaluación se limita a métricas de calidad de cuantización sobre un corpus de Wikipedia.

## Requisitos de hardware

- Tamaño del repositorio: 0.9 GB, lo que sugiere que los pesos ocupan aproximadamente 0.9 GB en disco.
- VRAM estimada para inferencia: con 444M parámetros a 3 bits, los pesos ocupan unos 166 MB, pero el runtime de ExLlamaV3 requiere memoria adicional para activaciones y caché KV. Se estima que una GPU con 2 GB de VRAM es suficiente para inferencia básica, aunque no se dispone de datos exactos.
- GPU recomendadas: cualquier GPU con soporte CUDA o ROCm, desde una NVIDIA GTX 1650 (4 GB) hasta una RTX 4090. También puede ejecutarse en CPU con suficiente RAM, aunque con mayor latencia.
- Compatible con GPUs de consumo: sí, especialmente en cuantización 3 bits, que reduce drásticamente los requisitos de memoria.
- Opciones de despliegue: ExLlamaV3 (runtime oficial), también puede usarse con llama.cpp si se convierte a GGUF, aunque no se proporciona en este repositorio. No es compatible con vLLM, TGI u Ollama en su formato actual.
- Latencia y throughput: no disponibles en la documentación. Dado el tamaño reducido, se espera una latencia de decenas de milisegundos por token en GPUs modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | ~0.8B | 262K | fp16 | Apache 2.0 | Modelo original sin cuantizar |
| Qwen3.5-0.8B-exl3-3.0bpw (este) | 444M | 262K | EXL3 3.0 bpw | Apache 2.0 | Cuantización de alta eficiencia |
| Qwen3.5-0.8B-AWQ-INT4 (BlivionIaG) | ~0.8B | 262K | AWQ INT4 | Apache 2.0 | Cuantización alternativa, sin datos de rendimiento publicados |

No se dispone de benchmarks comparativos entre estas versiones. La cuantización EXL3 ofrece un tamaño menor que AWQ INT4 (3 bits frente a 4 bits), pero a costa de una mayor pérdida de precisión. Para aplicaciones donde la calidad es crítica, se recomienda usar el modelo base o una cuantización de mayor bitrate.

## Limitaciones y advertencias

- La cuantización introduce una pérdida de calidad medible: +9,2% de perplexity y −2,5 puntos de top-1 accuracy frente a fp16. Esto puede afectar a tareas que requieren alta precisión, como matemáticas o razonamiento lógico complejo.
- El modelo solo declara soporte para inglés; no se garantiza un rendimiento adecuado en otros idiomas, a pesar de que el modelo base podría tener capacidades multilingües.
- El formato EXL3 no es compatible con el ecosistema Transformers estándar. Solo puede ejecutarse con ExLlamaV3 o runtimes que soporten este formato, lo que limita su integración en pipelines existentes.
- Al ser una cuantización comunitaria, no hay garantía de soporte oficial por parte de Alibaba. Los bugs o problemas de inferencia deben reportarse al autor de la cuantización.
- El modelo base puede presentar sesgos o alucinaciones inherentes a los datos de entrenamiento; la cuantización no los corrige.
- Para uso en producción, se recomienda validar el rendimiento en el caso de uso específico, ya que la degradación puede ser mayor en dominios especializados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BlivionIaG/Qwen3.5-0.8B-exl3-3.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- ExLlamaV3 (cuantizador y runtime): https://github.com/turboderp-org/exllamav3
- Puerto ROCm/HIP usado para cuantización: https://github.com/CarouselAether/rocm_exl3
- Guía de Qwen3 completa (contexto de la familia): https://insiderllm.com/guides/qwen3-complete-guide/
- Artículo sobre Qwen3.5 0.8B (benchmarks y uso): https://codersera.com/blog/run-and-benchmark-qwen35-08b/
