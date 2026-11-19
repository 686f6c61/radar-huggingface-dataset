# openbmb/MiniCPM-V-4.6-Thinking-BNB

## Resumen

MiniCPM-V 4.6 Thinking BNB es la versión cuantizada a 4 bits (NF4 mediante bitsandbytes) del modelo multimodal MiniCPM-V 4.6 Thinking, desarrollado por OpenBMB. Se trata de un MLLM (modelo de lenguaje multimodal) de tipo "pocket-sized", diseñado para inferencia ultraeficiente de comprensión de imágenes y vídeo en dispositivos de borde, incluidos teléfonos móviles. La variante Thinking genera una traza de razonamiento explícita antes de la respuesta final.

El modelo combina un codificador visual SigLIP2 de 400M de parámetros con un LLM Qwen3.5-0.8B, manteniendo la compresión mixta de tokens visuales 4x/16x introducida en MiniCPM-V 4.6. La cuantización a 4 bits reduce el peso del repositorio a aproximadamente 1,1 GB, lo que facilita su despliegue en hardware con recursos limitados.

Es relevante ahora porque demuestra que el razonamiento multimodal de cadena larga puede ejecutarse en plataformas móviles (iOS, Android y HarmonyOS) con licencia Apache 2.0, algo poco habitual en modelos con capacidad de "thinking" explícito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador visual SigLIP2-400M + LLM Qwen3.5-0.8B |
| Parametros totales | 1.300.428.016 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes); pesos originales en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización bitsandbytes) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón de MiniCPM-V 4.6: un codificador visual SigLIP2 de 400M de parámetros acoplado a un LLM Qwen3.5-0.8B, con compresión mixta de tokens visuales en modos 4x y 16x. El modo 16x reduce el número de tokens por imagen para mayor eficiencia, mientras que el modo 4x preserva detalle fino. La variante Thinking incorpora una fase de razonamiento explícito (cadena de pensamiento larga) antes de emitir la respuesta final, lo que mejora tareas de razonamiento multimodal complejo, matemáticas y OCR intensivo.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card referencia varios artículos (arXiv:2604.27393, arXiv:2509.18154, arXiv:2408.01800, arXiv:2605.08985) que presumiblemente contienen los detalles de entrenamiento, pero su contenido no se incluye aquí.

## Capacidades

- Comprensión de imagen y texto (pipeline image-text-to-text).
- Comprensión de vídeo, con decodificación mediante torchcodec o PyAV.
- Razonamiento multimodal con traza de pensamiento explícita (Thinking mode).
- Tareas de matemáticas y razonamiento complejo a partir de entradas visuales.
- OCR intensivo y comprensión de documentos, tickets y escritura manual (según los ejemplos de la model card).
- Compresión visual configurable mediante `downsample_mode` (4x para detalle fino, 16x para eficiencia) y `max_slice_nums` (hasta 36).
- Conversación multi-turno.
- Despliegue en dispositivos de borde: iOS, Android y HarmonyOS.
- Soporte de Flash Attention 2 para aceleración y ahorro de memoria en escenarios multi-imagen y vídeo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en el móvil: el modelo puede ejecutarse localmente en iOS, Android y HarmonyOS para responder preguntas sobre fotos tomadas por el usuario (por ejemplo, identificar un fenómeno físico en una imagen), sin enviar datos a la nube.
- Digitalización de tickets y documentos: con el modo 4x y `max_slice_nums=36` puede procesar imágenes de alta resolución para extraer texto y campos estructurados en aplicaciones de escaneo.
- Reconocimiento de escritura manual: los ejemplos de la model card muestran su uso en iPhone para interpretar notas manuscritas, útil en aplicaciones de productividad.
- Tutoría educativa con razonamiento: la variante Thinking genera la traza de razonamiento antes de responder, lo que permite mostrar al estudiante el proceso de resolución de problemas de matemáticas o física a partir de un enunciado fotografiado.
- Análisis de vídeo en el dispositivo: con soporte de decodificación de vídeo y Flash Attention 2, puede resumir o describir clips cortos en aplicaciones de accesibilidad o edición.
- Asistencia en entornos sin conectividad: al pesar ~1,1 GB en 4 bits, puede empaquetarse en apps móviles para soporte técnico de campo (por ejemplo, diagnóstico visual de equipos) sin conexión.
- Prototipado rápido en investigación: al estar en formato transformers y cuantizado, permite experimentar con razonamiento multimodal en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye imágenes con resultados de evaluación (Thinking, Instruct, throughput y TTFT) pero no se proporcionan los valores numéricos en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa ~1,1 GB en 4 bits, por lo que la inferencia cabe holgadamente en GPUs con 4-6 GB de VRAM; en BF16 el peso sería mayor (no disponible el dato exacto).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegue en servidor, A100/H100 no son necesarias dado el tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer con al menos 4 GB de VRAM.
- Despliegue en dispositivos de borde: soportado oficialmente en iOS, Android y HarmonyOS según la model card.
- Opciones de despliegue: transformers (>=5.7.0) con torchvision y torchcodec o PyAV; Flash Attention 2 recomendado para multi-imagen y vídeo. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: la model card incluye gráficas de throughput en alta concurrencia y TTFT de una sola petición, pero no se proporcionan valores numéricos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 Thinking BNB | 1.300.428.016 | no disponible | imagen-texto (y vídeo) | Apache 2.0 | 4-bit NF4 |
| MiniCPM-V 4.6 Thinking (BF16) | no disponible | no disponible | imagen-texto (y vídeo) | Apache 2.0 | BF16 |
| MiniCPM-V 4.6 (Instruct) | no disponible | no disponible | imagen-texto | Apache 2.0 | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de otros modelos comparables de terceros.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; la traza de razonamiento explícita no garantiza la corrección de la respuesta final.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no se detallan; los ejemplos de la model card están en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de licencia y atribución.
- Cuantización: al ser una versión 4-bit NF4, puede haber degradación de precisión frente a los pesos BF16 originales; para tareas sensibles conviene validar contra el modelo base.
- Dependencias: requiere transformers >=5.7.0; torchcodec puede fallar con ciertas versiones de CUDA (workaround con PyAV o fijando la versión de CUDA).
- Despliegue en producción: no se documentan integraciones con servidores de inferencia de alto rendimiento (vLLM, TGI); el foco es el despliegue en dispositivo.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking-BNB
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking
- Modelo Instruct: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Thinking-BNB-Demo
- API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- Papers: arXiv:2604.27393, arXiv:2509.18154, arXiv:2408.01800, arXiv:2605.08985
