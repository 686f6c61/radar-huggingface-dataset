# litert-community/Zamba2-1.2B-instruct

## Resumen

Zamba2-1.2B-instruct es un modelo de lenguaje de 1.200 millones de parámetros desarrollado por Zyphra, con una arquitectura híbrida que combina un backbone Mamba2 de selective-scan (32 capas) con un único bloque transformer compartido aplicado en seis posiciones intercaladas, cada una especializada mediante adaptadores LoRA. Esta conversión concreta, publicada por litert-community, adapta el modelo original al formato LiteRT-LM (`.litertlm`) para inferencia on-device con el runtime de Google LiteRT-LM, siendo la primera conversión de Zamba2 a un runtime móvil.

El modelo resuelve el problema de ejecutar LLMs con baja latencia en dispositivos edge (móviles, tablets, portátiles) sin depender de la nube, manteniendo una calidad competitiva frente a modelos de mayor tamaño. Su relevancia actual radica en la creciente demanda de asistentes locales privados y eficientes, donde la combinación de Mamba2 (eficiencia en decodificación) con atención compartida (calidad de razonamiento) ofrece un equilibrio atractivo. La conversión incluye optimizaciones como el plegado del selective-scan en matmuls por lotes, manejo específico del clamp de dt y una capa de caché híbrida compuesta, lo que permite delegación completa en GPU móvil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone Mamba2 (32 capas selective-scan) + 1 bloque transformer compartido en 6 posiciones con adaptadores LoRA |
| Parametros totales | 1.200 millones (1.2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (4K) |
| Tipos de cuantizacion | int8 dinámico en linears y embedding; convs y scan en float32; activaciones fp32 declaradas para GPU |
| Idiomas soportados | No disponible (el modelo base de Zyphra no publica lista oficial; se asume principalmente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (formato LiteRT-LM) |

## Arquitectura y entrenamiento

Zamba2-1.2B-instruct emplea una arquitectura híbrida innovadora: un backbone de 32 capas Mamba2 (selective-scan) que procesa secuencias de forma recurrente, intercalado con un único bloque transformer compartido (atención + MLP) aplicado en seis posiciones fijas. Este bloque compartido atiende sobre la concatenación del estado oculto recurrente y las embeddings originales, y cada posición utiliza adaptadores LoRA específicos para especializar el comportamiento. Esta configuración reduce drásticamente el número de parámetros de atención frente a un transformer estándar, manteniendo la capacidad de razonamiento.

El modelo base fue fine-tuned sobre datasets públicos de instrucción y chat (según la documentación de Zyphra), siguiendo un pipeline de ajuste instructivo. La conversión a LiteRT-LM incorpora varias innovaciones técnicas: el selective-scan se reexpresa como matmuls por lotes con ejes de chunk y head plegados en el eje de batch (tensores de rango ≤ 4, sin `BROADCAST_TO`), se aplica un manejo específico del clamp mínimo de dt (sin clamp superior), y se implementa una capa de caché híbrida compuesta que almacena KV, conv y estado recurrente en un único índice de capa. Además, se incluye un guard de prefill-pad que fuerza pasos de identidad exactos en posiciones de padding, y se elimina el decoder `Strip` del tokenizador para streaming de detokenización.

## Capacidades

- Generación de texto: produce texto coherente y contextualmente relevante en inglés (idioma principal no confirmado oficialmente).
- Razonamiento: capacidad de razonamiento básico y seguimiento de instrucciones gracias al fine-tuning instructivo.
- Código: puede generar fragmentos de código simples, aunque no se han publicado benchmarks específicos.
- Matemáticas: resolución de problemas aritméticos y algebraicos básicos (no verificado con benchmarks).
- Chat multi-turno: soporta conversaciones con plantilla ChatML incluida en el bundle.
- Inferencia on-device: optimizado para ejecución local en GPU y CPU móvil con baja latencia.
- No se ha confirmado soporte de tool calling, function calling, agentes multi-step, visión o audio en la información disponible.

## Casos de uso

- Asistente personal en el dispositivo: el modelo puede ejecutarse localmente en un smartphone (iPhone 17 Pro, Galaxy S26) para responder preguntas, gestionar recordatorios o mantener conversaciones sin conexión, gracias a su tamaño reducido y la optimización para GPU móvil.
- Chatbot de atención al cliente en kioscos o terminales: con contexto de 4K tokens, puede mantener conversaciones multi-turno sobre productos o servicios, desplegado en hardware de bajo coste con el runtime LiteRT-LM.
- Generación de texto offline en aplicaciones de productividad: redacción de correos, resúmenes o borradores directamente en el dispositivo, sin enviar datos a la nube, aprovechando la baja latencia de decodificación (74 tok/s en GPU M4 Max).
- Asistente de código en entornos de desarrollo integrado (IDE) móvil: autocompletado y generación de funciones simples en editores de código para tablet o portátil, con soporte de prefill rápido (1033 tok/s en GPU).
- Prototipado de aplicaciones edge con LiteRT-LM: sirve como modelo de referencia para desarrolladores que integran LLMs en apps Android o iOS, gracias a la conversión lista para producción y la documentación de GPU.
- Sistema de respuestas en tiempo real para dispositivos IoT: al poder ejecutarse en CPU con 22.7 tok/s de decodificación, es viable en dispositivos con recursos limitados para tareas de clasificación de texto o extracción de entidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas de rendimiento de inferencia, que se detallan en la sección de requisitos de hardware. La verificación de corrección indica paridad de logits con el modelo PyTorch original (correlación media 1.0000, KL ≈ 0) y un 8/8 en pruebas de sanity en GPU y CPU.

## Requisitos de hardware

- VRAM estimada: el bundle int8 ocupa 1.33 GB en disco; en ejecución, el pico de memoria en iPhone 17 Pro es de 5.43 GB en GPU (con activaciones fp32) y 1.82 GB en CPU. En Galaxy S26 GPU, el pico es de 3.62 GB.
- GPU recomendadas: Apple M4 Max (GPU integrada) para desarrollo; iPhone 17 Pro (GPU Metal) y Samsung Galaxy S26 (GPU Adreno) para despliegue móvil. También compatible con GPUs de escritorio con soporte LiteRT.
- Consumer GPU: cabe en GPUs de gama media con al menos 4 GB de VRAM (por ejemplo, RTX 3050 o superior), aunque el objetivo principal es móvil.
- Opciones de despliegue: runtime LiteRT-LM (versión ≥ 0.15) con backends GPU y CPU; soporte para Android (GPU delegado) y Apple (Metal).
- Rendimiento medido (Apple M4 Max, litert-lm 0.16.0, prefill 256, decode 256):
  - GPU: prefill 1033 tok/s, decode 74.0 tok/s, TTFT 0.26 s.
  - CPU: prefill 450 tok/s, decode 22.7 tok/s, TTFT 0.61 s.
- Rendimiento en iPhone 17 Pro (cold start):
  - GPU (Metal): prefill 96.6 tok/s, decode 12.8 tok/s, TTFT 1.63 s, pico 5.43 GB.
  - CPU: prefill 87.3 tok/s, decode 7.4 tok/s, TTFT 1.73 s, pico 1.82 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A continuación se presenta una comparativa cualitativa con otros modelos pequeños de propósito similar, basada en características públicas conocidas:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zamba2-1.2B-instruct (LiteRT) | 1.2B | 4K | Apache 2.0 | .litertlm | Híbrido Mamba2+transformer compartido, optimizado para edge |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | Apache 2.0 | safetensors, GGUF | Transformer denso, buen rendimiento en código y multilingüe |
| Gemma-2-2B-it | 2.6B | 8K | Gemma License | safetensors, GGUF | Transformer denso, fuerte en razonamiento, licencia restrictiva |
| Phi-3-mini-4k-instruct | 3.8B | 4K | MIT | safetensors, GGUF | Transformer denso, alto rendimiento en razonamiento, mayor tamaño |

La comparativa directa de rendimiento no es posible sin datos de benchmarks estandarizados. Zamba2 destaca por su eficiencia en decodificación gracias a Mamba2, mientras que los transformers densos suelen ofrecer mayor calidad por parámetro pero con mayor coste computacional.

## Limitaciones y advertencias

- Contexto limitado a 4K tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Idiomas soportados no documentados oficialmente; se asume predominio del inglés, con posible degradación en otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, no mitigado específicamente en esta versión.
- La ejecución en GPU móvil requiere activaciones fp32, lo que multiplica el uso de memoria (5.43 GB en iPhone 17 Pro) frente a CPU (1.82 GB).
- En pruebas compuestas largas, el backend GPU puede diferir del CPU en preguntas límite, aunque ambos siguen el comportamiento del modelo de referencia.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base de Zyphra puede tener restricciones adicionales no documentadas en esta conversión.
- No se han publicado evaluaciones de sesgos o seguridad; se recomienda auditar antes de uso en producción.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/litert-community/Zamba2-1.2B-instruct
- Modelo base en HuggingFace: https://huggingface.co/Zyphra/Zamba2-1.2B-instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Herramienta de conversión litert-torch: https://github.com/google-ai-edge/litert-torch
- Scripts de conversión y parche (hf-to-litertlm): https://github.com/john-rocky/hf-to-litertlm
- Guía de GPU para Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
- Análisis del modelo en dev.co: https://dev.co/ai/llms/zamba2-1-2b-instruct
- Ficha en LLM Explorer: https://llm-explorer.com/model/Zyphra%2FZamba2-1.2B-instruct,518lykr5sa9ZY8QILS96IZ
- Ficha en LLM Reference: https://www.llmreference.com/model/zamba2-1.2b-instruct
