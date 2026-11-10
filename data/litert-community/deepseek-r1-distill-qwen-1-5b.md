# litert-community/DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B (litert-community) es una distribución del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B empaquetada para su despliegue en dispositivos Android mediante la pila LiteRT (anteriormente TFLite), la API MediaPipe LLM Inference (en modo mantenimiento) y LiteRT-LM. El modelo original es un destilado de razonamiento de DeepSeek, basado en la arquitectura Qwen de 1.500 millones de parámetros, que ha sido convertido a formato `.litertlm` y `.tflite` con cuantización int8 dinámica para ejecutarse en el borde (edge).

El problema que resuelve esta distribución es la brecha entre un modelo de razonamiento de pesos abiertos y su ejecución real en hardware móvil. El repositorio ofrece variantes listas para cargar en aplicaciones Android mediante la librería `com.google.ai.edge.litertlm:litertlm-android`, con soporte de caché KV de 4.096 tokens y múltiples firmas de prefill para acelerar la generación.

Es relevante ahora porque permite integrar capacidades de razonamiento y generación de texto en aplicaciones móviles sin depender de la nube, con un tamaño de modelo de aproximadamente 1,8 GB y un consumo de memoria pico en torno a 2 GB en un Samsung S24 Ultra. La licencia MIT del modelo base facilita su uso comercial, aunque las condiciones de la pila LiteRT deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen, destilado de razonamiento de DeepSeek-R1) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (caché KV configurada en las variantes LiteRT; contexto nativo del modelo base no disponible en la información proporcionada) |
| Tipos de cuantizacion | dynamic_int8 (pesos int8, activaciones float) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM), `.tflite` (flatbuffer LiteRT); el modelo base en safetensors no se distribuye en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, un destilado del modelo de razonamiento DeepSeek-R1 sobre la arquitectura Qwen de 1.500 millones de parámetros. Se trata de un transformer denso orientado a generación de texto con capacidades de razonamiento encadenado (chain-of-thought). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el destilado.

La innovación técnica de esta distribución concreta no está en el entrenamiento sino en el empaquetado para el borde: conversión a LiteRT con cuantización int8 dinámica, soporte de múltiples firmas de prefill (multi-prefill-seq) para paralelizar el procesamiento del prompt, caché KV de 4.096 tokens y aceleración en CPU mediante el delegado XNNPACK con 4 hilos, además de ejecución en GPU móvil. El repositorio incluye una variante `DeepSeek-R1-Distill-Qwen-1.5B_multi-prefill-seq_q8_ekv4096.litertlm` lista para integrarse en aplicaciones Android.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `chat`).
- Razonamiento encadenado heredado del destilado de DeepSeek-R1 (el modelo base está diseñado para producir trazas de razonamiento antes de la respuesta).
- Ejecución local en Android mediante LiteRT-LM y la API MediaPipe LLM Inference.
- Soporte de caché KV de 4.096 tokens para conversaciones multi-turno en dispositivo.
- Aceleración por CPU (XNNPACK) y por GPU móvil.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (aunque el modelo base está orientado a razonamiento).
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional offline en Android: el modelo se carga con LiteRT-LM en una app móvil y gestiona diálogos multi-turno gracias a la caché KV de 4.096 tokens, sin enviar datos a la nube.
- Razonamiento en el dispositivo para tareas de análisis: al ser un destilado de DeepSeek-R1, puede generar trazas de razonamiento paso a paso para problemas de lógica o matemáticas simples directamente en el teléfono.
- Prototipado rápido con Edge Gallery: usar la app de Google AI Edge Gallery para probar el modelo en un dispositivo Android real antes de integrarlo en un producto.
- Aplicaciones de privacidad estricta: procesamiento de texto sensible (notas, mensajes) en local, evitando la transmisión de datos a servidores externos.
- Educación y tutoría móvil: generación de explicaciones y resolución guiada de problemas en una app educativa sin conectividad.
- Filtrado y resumen de texto en el borde: resumen de notificaciones o correos en el propio dispositivo con latencia aceptable (26-27 tokens/s de decodificación en S24 Ultra).
- Integración en apps Kotlin/Android: añadir la dependencia `litertlm-android` y cargar el archivo `.litertlm` para dotar a la app de generación de texto local.

## Benchmarks y rendimiento

Rendimiento medido en un Samsung S24 Ultra con caché KV de 1.280 tokens y múltiples firmas de prefill habilitadas (datos de la model card):

| Backend | Cuantización | Contexto | Prefill (tk/s) | Decode (tk/s) | TTFT (s) | Tamaño modelo (MB) | RSS pico (MB) | Memoria GPU (MB) |
|---|---|---|---|---|---|---|---|---|
| CPU | dynamic_int8 | 4096 | 166,50 | 26,35 | 6,41 | 1831,43 | 2221 | N/A |
| GPU | dynamic_int8 | 4096 | 927,54 | 26,98 | 5,46 | 1831,43 | 2096 | 1659 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,8 GB para el archivo del modelo y en torno a 2,1-2,2 GB de memoria pico (RSS) durante la inferencia en Android.
- GPU recomendadas: GPU integrada de móvil de gama alta (probado en Samsung S24 Ultra); en escritorio no se especifican GPU, ya que el objetivo es Android/iOS/Web.
- Cabe en consumer GPU: no aplica como objetivo principal; el destino es hardware móvil. En Colab puede ejecutarse pero con rendimiento potencialmente peor que en dispositivo local.
- Opciones de despliegue: LiteRT-LM (Android, vía `com.google.ai.edge.litertlm:litertlm-android`), MediaPipe LLM Inference API (modo mantenimiento), Edge Gallery App, y notebook de Colab incluido. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: prefill de 166,50 tk/s en CPU y 927,54 tk/s en GPU; decodificación de 26,35 tk/s en CPU y 26,98 tk/s en GPU; TTFT de 6,41 s en CPU y 5,46 s en GPU (S24 Ultra, caché KV de 1.280 tokens).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| litert-community/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 4.096 (caché KV LiteRT) | MIT | `.litertlm`, `.tflite` (Android) | Optimizado para móvil con LiteRT |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible | MIT | safetensors (transformers) | Modelo base sin empaquetar para móvil |
| Alternativas de 1,5B para móvil | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: presente como en cualquier modelo de 1,5B; el tamaño reducido limita la fiabilidad en tareas de conocimiento factual.
- Limitaciones de contexto: la caché KV configurada es de 4.096 tokens; conversaciones más largas requieren truncamiento o gestión manual.
- Limitaciones de idioma: no se especifican idiomas soportados; el rendimiento fuera del inglés y chino puede degradarse.
- Restricciones de licencia: el modelo base es MIT, lo que permite uso comercial; deben verificarse por separado las licencias de LiteRT, MediaPipe y LiteRT-LM.
- Caveat de producción: el rendimiento en Colab puede ser mucho peor que en dispositivo; los benchmarks corresponden a un S24 Ultra concreto y no son extrapolables a todos los móviles.
- La API MediaPipe LLM Inference está en modo de solo mantenimiento; para nuevos desarrollos se recomienda LiteRT-LM.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/DeepSeek-R1-Distill-Qwen-1.5B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- LiteRT: https://ai.google.dev/edge/litert
- MediaPipe LLM Inference API: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference
- LiteRT-LM (GitHub): https://github.com/google-ai-edge/LiteRT-LM
- Guía LiteRT-LM para Android: https://ai.google.dev/edge/litert-lm/android
- Edge Gallery App (Google Play): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Edge Gallery (GitHub): https://github.com/google-ai-edge/gallery
- Ejemplos LiteRT: https://github.com/google-ai-edge/litert-samples
- XNNPACK: https://github.com/google/XNNPACK
- Notebook de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/litert-community/DeepSeek-R1-Distill-Qwen-1.5B/blob/main/notebook.ipynb
