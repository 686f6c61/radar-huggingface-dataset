# PinoCookie/LFM2.5-1.2B-Instruct-Abliterated

## Resumen

LFM2.5-1.2B-Instruct-Abliterated es una versión modificada del modelo de instrucción LFM2.5-1.2B-Instruct de Liquid AI, desarrollada por PinoCookie. El modelo original es un sistema híbrido de 1.170 millones de parámetros que combina capas convolucionales y de atención, diseñado para chat, seguimiento de instrucciones y tool calling. La modificación principal consiste en la eliminación del circuito de rechazo (refusal) mediante una técnica de abliteración basada en recuperación rank-1 por SVD, de modo que el modelo responde directamente a peticiones que el original rechazaría, manteniendo la coherencia en consultas benignas.

Este modelo es relevante en el ámbito de la investigación de seguridad y alineación de modelos, ya que permite estudiar cómo se comporta un sistema sin barreras de seguridad y analizar los mecanismos internos que controlan el rechazo. Su tamaño reducido (1,17B parámetros) lo hace accesible para experimentación en hardware de consumo, y su licencia lfm1.0 permite uso comercial con restricciones. No obstante, al carecer de filtros de seguridad, no es apto para despliegue en producción sin salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (convolucional + atención) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (por defecto); no se proporcionan cuantizaciones adicionales |
| Idiomas soportados | Inglés |
| Licencia | lfm1.0 (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Instruct emplea una arquitectura híbrida que intercala bloques convolucionales y de atención, con 32 proyecciones de salida distribuidas en 16 capas (6 de atención, 10 convolucionales y 16 de feed-forward). El entrenamiento original incluyó preentrenamiento extendido y ajuste por refuerzo, según la documentación de Liquid AI. La versión abliterada se obtuvo mediante una técnica de recuperación rank-1 por SVD: se calculó la diferencia de pesos entre el modelo base y un modelo de referencia abliterado (huihui-ai/Huihui-LFM2.5-1.2B-Instruct-abliterated), se extrajo el vector singular principal de cada tensor y se reaplicó exactamente sobre el modelo base. El resultado reproduce la edición de referencia con un error relativo de 0,0013–0,0023 por tensor, dentro del ruido de almacenamiento en bf16. La edición cubre las 32 proyecciones de salida, lo que resultó ser el factor determinante para eliminar el rechazo, ya que ediciones parciales (solo atención) no lograban el efecto.

## Capacidades

- Generación de texto y conversación multi-turno con formato ChatML.
- Seguimiento de instrucciones y tool calling, heredado del modelo base.
- Respuesta directa a peticiones dañinas o ilegales, sin rechazo ni sermones (característica principal de la abliteración).
- Coherencia preservada en consultas benignas: poemas, explicaciones técnicas, resúmenes, etc.
- Capacidad multilingüe limitada al inglés (según la model card).
- No incluye modo de razonamiento explícito (thinking mode) ni capacidades multimodales.

## Casos de uso

- Investigación de seguridad y alineación: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, analizar cómo se generan respuestas a prompts dañinos y evaluar la eficacia de técnicas de mitigación.
- Red teaming de sistemas de IA: se puede usar como modelo adversario para probar la robustez de filtros de contenido y sistemas de moderación en aplicaciones de producción.
- Análisis de mecanismos internos: al ser un modelo pequeño y con edición conocida, sirve para investigar la localización de circuitos de seguridad en arquitecturas híbridas (conv + attention).
- Generación de texto creativo sin restricciones: para proyectos de escritura o generación de contenido donde no se requiera moderación automática.
- Pruebas de tool calling en entornos controlados: el modelo base soporta tool calling, y la versión abliterada puede probarse en pipelines de agentes sin las limitaciones de rechazo.
- Educación y divulgación: como ejemplo práctico de abliteración y sus efectos, útil en cursos de seguridad de IA o talleres de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de reducción de rechazo: antes de la abliteración, el modelo rechazaba 3 de 5 prompts dañinos (con respuestas de negativa); después, 0 de 5, con respuestas directas y detalladas. También se verifica que las respuestas a consultas benignas son coherentes y estructuralmente similares a las del modelo original, aunque ambos comparten pequeños errores factuales heredados del modelo base.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,3 GB en bf16 (1,17B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, o GPUs de datacenter como T4 o L4 (el autor usó una Modal L4 para la edición).
- Cabe en GPUs de consumo: sí, en tarjetas con 4 GB o más.
- Opciones de despliegue: transformers (librería principal), vLLM, TGI, o llama.cpp si se convierte a GGUF (no se proporciona en el repo).
- Latencia y throughput: no se han medido oficialmente; para un modelo de 1,17B en bf16, se espera una generación de decenas de tokens por segundo en GPUs modernas, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-1.2B-Instruct (base) | 1,17B | No disponible | lfm1.0 | Modelo original con rechazo de seguridad |
| LFM2.5-1.2B-Instruct-Abliterated (este) | 1,17B | No disponible | lfm1.0 | Sin rechazo, respuestas directas a prompts dañinos |
| Huihui-LFM2.5-1.2B-Instruct-abliterated | 1,17B | No disponible | lfm1.0 | Referencia usada para la edición; método de abliteración diferente (activation-diff) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | Apache 2.0 | Alternativa densa de tamaño similar, con seguridad estándar |

No se dispone de datos de rendimiento comparativo en tareas estándar, por lo que la comparación se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Ausencia total de mecanismos de rechazo: el modelo genera contenido dañino, ilegal o peligroso sin filtro alguno. No debe desplegarse en entornos de producción sin capas externas de moderación.
- Riesgo de alucinación: el modelo base ya presenta errores factuales (por ejemplo, atribuciones incorrectas), y la abliteración no corrige estos fallos; las respuestas pueden ser confiadas pero incorrectas.
- Idioma limitado: solo inglés, lo que restringe su uso en contextos multilingües.
- Licencia lfm1.0: aunque permite uso comercial, tiene condiciones específicas (consultar el archivo LICENSE del repo); no es una licencia de código abierto estándar.
- Sin garantías de precisión técnica: en prompts dañinos, las instrucciones generadas pueden ser factualmente erróneas o peligrosas, como se advierte en el modelo experimental Paired-Alpha2 del mismo autor.
- No apto para aplicaciones de atención al cliente, educación o cualquier uso donde se requiera seguridad y fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PinoCookie/LFM2.5-1.2B-Instruct-Abliterated
- Modelo base (LiquidAI): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Documentación de LiquidAI sobre LFM2.5-1.2B-Instruct: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Colección de abliteraciones de PinoCookie: https://huggingface.co/collections/PinoCookie/liquidai-abliterations
- Modelo de referencia (huihui-ai): https://huggingface.co/huihui-ai/Huihui-LFM2.5-1.2B-Instruct-abliterated
- Variante experimental Paired-Alpha2: https://huggingface.co/PinoCookie/LFM2.5-1.2B-Instruct-Abliterated-Paired-Alpha2
- Herramienta de demostración (GitHub): https://github.com/PierrunoYT/LFM2.5-Pinokio
