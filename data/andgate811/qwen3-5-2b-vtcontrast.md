# AndGate811/Qwen3.5-2B-VTContrast

## Resumen

Qwen3.5-2B-VTContrast es un modelo de visión-lenguaje desarrollado por AndGate811, basado en el modelo Qwen3.5-2B de Alibaba Cloud. Se trata de un fine-tuning específico para la comprensión temporal de vídeos, entrenado con un objetivo contrastivo que busca mejorar el rendimiento en tareas que requieren entender el orden temporal de los eventos y los cambios visuales a lo largo del tiempo. El modelo combina un codificador visual con un decodificador de lenguaje, manteniendo la arquitectura densa de 2 mil millones de parámetros del modelo base.

La relevancia de este modelo radica en su tamaño compacto (2B parámetros) combinado con capacidades multimodales nativas, lo que lo hace adecuado para despliegue en entornos con recursos limitados, como dispositivos edge o aplicaciones en tiempo real. Al estar basado en Qwen3.5-2B, hereda su soporte para contexto largo (262K tokens según la documentación del modelo base) y su licencia Apache 2.0, que permite uso comercial sin restricciones significativas. El fine-tuning con VTContrast añade una capa especializada en análisis de vídeo, un área de creciente demanda en aplicaciones de vigilancia, análisis de contenido y asistentes multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (basado en Qwen3.5-2B) |
| Parametros totales | 2 mil millones (2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens (según documentación del modelo base Qwen3.5-2B; no confirmado en la model card del fine-tune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen3.5 es multilingüe, pero no se especifica para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.5-2B-VTContrast parte de la arquitectura de Qwen3.5-2B, un modelo de lenguaje causal denso con un codificador visual integrado. El modelo base incorpora un mecanismo de "thinking mode" que permite razonamiento explícito antes de generar respuestas, aunque la model card del fine-tune recomienda desactivarlo durante la inferencia para tareas de comprensión temporal de vídeo. El fine-tuning se realizó con un objetivo de contraste temporal (VTContrast), que entrena al modelo para distinguir entre secuencias de vídeo en orden correcto e incorrecto, así como para detectar cambios visuales significativos entre fotogramas.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el método de alineación (RLHF, DPO, etc.) empleado en el fine-tuning. El modelo se distribuye a través de la librería transformers, con una clase específica `Qwen3_5ForConditionalGeneration` y un procesador asociado. El tamaño del repositorio es de 4.4 GB, lo que sugiere que los pesos están en precisión completa o en una cuantización moderada.

## Capacidades

- Comprensión temporal de vídeos: el modelo está específicamente entrenado para entender el orden de los eventos en secuencias de vídeo y detectar cambios visuales a lo largo del tiempo.
- Procesamiento de imágenes y vídeo: al ser un modelo de visión-lenguaje, puede procesar entradas visuales estáticas (imágenes) y dinámicas (vídeos) y generar descripciones o respuestas textuales.
- Razonamiento multimodal: combina información visual con instrucciones textuales para responder preguntas sobre el contenido visual.
- Soporte de conversación: el modelo está etiquetado como "conversational", lo que indica que puede mantener diálogos multi-turno sobre contenido visual.
- Modo thinking: heredado del modelo base, permite un razonamiento explícito antes de responder, aunque se recomienda desactivarlo para tareas de vídeo.
- Multilingüismo potencial: el modelo base Qwen3.5 es multilingüe, pero no se confirma si el fine-tune mantiene esta capacidad.

## Casos de uso

- Análisis de secuencias de vídeo para vigilancia: el modelo puede procesar grabaciones de cámaras de seguridad y describir eventos en orden cronológico, detectando anomalías como movimientos inusuales o cambios de escena. Su contexto largo permite analizar vídeos extensos sin perder información.
- Moderación de contenido en plataformas de vídeo: puede identificar contenido inapropiado o cambios de escena en vídeos subidos por usuarios, generando alertas o descripciones automáticas para revisión humana.
- Asistentes de accesibilidad para personas con discapacidad visual: el modelo puede describir secuencias de vídeo en tiempo real, narrando acciones y eventos para usuarios que no pueden ver la pantalla.
- Análisis de vídeos deportivos: puede desglosar jugadas, identificar momentos clave y generar resúmenes automáticos de partidos o competiciones, aprovechando su capacidad para entender el orden temporal de las acciones.
- Automatización de pruebas de calidad en producción de vídeo: en entornos de postproducción, el modelo puede verificar que las secuencias de vídeo mantienen la coherencia temporal y detectar errores de montaje o edición.
- Investigación académica en visión por computador: sirve como punto de partida para experimentos sobre comprensión temporal, permitiendo a investigadores evaluar el impacto del objetivo contrastivo en tareas de ordenación de eventos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tune Qwen3.5-2B-VTContrast en la información disponible. Sin embargo, el modelo base Qwen3.5-2B reporta los siguientes resultados según la documentación pública:

| Benchmark | Resultado (modelo base Qwen3.5-2B) |
|---|---|
| OCRBench | 84.5 |
| VideoMME | 75.6 |

Estos datos provienen de la documentación del modelo base y no son directamente atribuibles al fine-tune, que podría presentar variaciones en tareas de comprensión temporal. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 2B parámetros, la VRAM necesaria depende de la precisión de los pesos. Con pesos en FP16, se estima un consumo de aproximadamente 4-5 GB de VRAM. Con cuantización a 8 bits, podría reducirse a 2-3 GB, y a 4 bits, a 1-2 GB.
- GPU recomendadas: el modelo puede ejecutarse en GPUs consumer como NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores. También es compatible con GPUs de datacenter como A10G o T4.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs modernas con al menos 6 GB de VRAM, especialmente con cuantización.
- Opciones de despliegue: al usar la librería transformers, puede servirse con vLLM, TGI (Text Generation Inference) o mediante la API de Hugging Face. Para despliegue en edge, se puede convertir a formato GGUF y usar llama.cpp u Ollama.
- Latencia y throughput: no se dispone de datos medidos específicamente para este modelo. Como referencia, un modelo de 2B en FP16 en una RTX 4090 puede alcanzar un throughput de 50-100 tokens/segundo, pero esto depende de la longitud de la secuencia y del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría (vision-language de ~2B parámetros). El modelo base Qwen3.5-2B puede compararse con alternativas como Qwen2-VL-2B o Phi-3.5-vision, pero no hay datos de benchmarks del fine-tune para establecer una comparación justa. Se recomienda consultar la documentación del modelo base para obtener referencias de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Qwen3.5-2B, el modelo puede heredar sesgos presentes en los datos de entrenamiento del modelo base, especialmente en tareas de generación de texto.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar descripciones inexactas o inventar detalles sobre el contenido visual, especialmente en vídeos complejos o ambiguos.
- Limitaciones de contexto: aunque el modelo base soporta 262K tokens, no se confirma que el fine-tune mantenga esta capacidad. En la práctica, el procesamiento de vídeo puede requerir un muestreo de fotogramas que reduzca la longitud efectiva del contexto.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base Qwen3.5-2B, que también es Apache 2.0.
- Caveat de inferencia: la model card recomienda desactivar el modo thinking durante la inferencia, lo que puede afectar a la calidad del razonamiento en tareas que requieran análisis profundo.
- Disponibilidad de datos de entrenamiento: no se ha publicado información sobre el dataset de fine-tuning, lo que dificulta evaluar la robustez del modelo en dominios específicos.

## Enlaces

- HuggingFace: https://huggingface.co/AndGate811/Qwen3.5-2B-VTContrast
- Documentación del modelo base Qwen3.5-2B (Qualcomm AI Hub): https://aihub.qualcomm.com/models/qwen3_5_2b
- Página de Qwen3.5-2B en CanIRun.ai: https://www.canirun.ai/model/qwen3.5-2b
- Qwen3.5-2B en There's An AI For That: https://theresanaiforthat.com/model/qwen3-5-2b/
- Qwen3.5-2B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-2b/
