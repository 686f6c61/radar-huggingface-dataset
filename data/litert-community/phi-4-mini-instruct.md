# litert-community/Phi-4-mini-instruct

## Resumen

litert-community/Phi-4-mini-instruct es una conversión del modelo microsoft/Phi-4-mini-instruct, publicada por la comunidad LiteRT (antes TFLite) de Google, orientada a la ejecución en dispositivos Android, iOS y web mediante la pila LiteRT, la MediaPipe LLM Inference API (en modo de solo mantenimiento) y LiteRT-LM. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribución con pesos cuantizados y empaquetados en formatos optimizados para inferencia en el borde (edge), lo que permite desplegar un LLM de tamaño medio directamente en un teléfono móvil sin depender de la nube.

El modelo base, Phi-4-mini-instruct de Microsoft, es un transformer decoder-only de aproximadamente 3.800 millones de parámetros, entrenado con datos sintéticos y filtrados de alta calidad, con un contexto nominal de 128.000 tokens en su versión original. Esta variante de litert-community preserva la arquitectura y los pesos del original, pero los serializa en formato .litertlm y .tflite con cuantización dynamic_int8 (pesos int8, activaciones float), lo que reduce el tamaño del artefacto a unos 3.906 MB y permite su ejecución en hardware móvil con aceleración por GPU o CPU.

La relevancia actual de esta ficha radica en que demuestra la viabilidad de ejecutar modelos de razonamiento y chat de casi 4.000 millones de parámetros de forma local en un Samsung S24 Ultra, con velocidades de decodificación de 7,28 tokens/s en CPU y 10,39 tokens/s en GPU, y un time-to-first-token de 10-16 segundos para un contexto de 4.096 tokens. Es un caso práctico de inferencia en el borde para aplicaciones de privacidad, offline y bajo consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de microsoft/Phi-4-mini-instruct) |
| Parametros totales | Aproximadamente 3.800 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens en las variantes publicadas (128.000 en el modelo base original) |
| Tipos de cuantizacion | dynamic_int8 (pesos int8, activaciones float); variantes q8 y multi-prefill-seq_q8_ekv4096 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | .litertlm y .tflite (flatbuffer LiteRT); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

Esta publicación no entrena un modelo nuevo: es una conversión de microsoft/Phi-4-mini-instruct a los formatos de LiteRT. Por tanto, la arquitectura subyacente es la del modelo base de Microsoft: un transformer decoder-only denso de aproximadamente 3.800 millones de parámetros, con atención multi-cabeza estándar y entrenamiento sobre datos sintéticos y filtrados de alta calidad, incluyendo fases de ajuste supervisado y optimización de preferencias (DPO) según la documentación pública de Microsoft. La innovación técnica de esta variante no reside en el entrenamiento, sino en el empaquetado: serialización en flatbuffer .tflite, cuantización dynamic_int8, soporte de múltiples firmas de prefill (multi-prefill-seq) y una caché KV de 4.096 entradas (ekv4096), todo ello optimizado para los delegados XNNPACK (CPU) y GPU de LiteRT.

El proceso de conversión implica mapear los pesos originales a operaciones compatibles con LiteRT, aplicar cuantización de pesos a int8 manteniendo activaciones en float, y generar artefactos que la MediaPipe LLM Inference API y LiteRT-LM pueden cargar directamente. El repositorio ocupa 31,3 GB, lo que refleja que contiene múltiples variantes del modelo (distintas cuantizaciones y configuraciones de caché KV), no un único archivo.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a chat.
- Razonamiento de nivel medio y resolución de problemas, heredado del modelo base Phi-4-mini-instruct.
- Generación de código y respuesta a preguntas técnicas, según las capacidades del modelo original.
- Capacidades matemáticas básicas e intermedias, propias de la familia Phi-4-mini.
- Ejecución local en Android mediante LiteRT-LM, la MediaPipe LLM Inference API o la app Edge Gallery.
- Soporte de inferencia con caché KV de 4.096 tokens y múltiples firmas de prefill para acelerar la fase de prefill.
- No se documenta en esta información soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito; dichas capacidades dependerían del modelo base y no están verificadas en esta conversión.

## Casos de uso

- Asistente de chat offline en Android: integrado mediante LiteRT-LM en una app Kotlin, el modelo puede mantener conversaciones multi-turno sin conexión, con una caché KV de 4.096 tokens que cubre interacciones típicas de asistente personal.
- Aplicaciones de privacidad y cumplimiento: al ejecutarse íntegramente en el dispositivo, los datos del usuario no salen del teléfono, lo que lo hace adecuado para sectores regulados (salud, finanzas) donde no se permite enviar texto a la nube.
- Prototipado rápido con Edge Gallery: la app oficial de Google permite cargar el modelo y probar prompts sin escribir código, útil para evaluar la calidad de Phi-4-mini antes de integrarlo en producción.
- Asistencia en campo sin conectividad: técnicos o personal en ubicaciones remotas pueden usar el modelo para consultar procedimientos, resumir notas o redactar informes directamente en el móvil.
- Educación y tutoría personalizada: el modelo puede generar explicaciones y ejercicios en el dispositivo, con latencia de decodificación de 7-10 tokens/s, suficiente para respuestas conversacionales.
- Filtrado y clasificación de texto en el borde: con un prefill de 66-314 tokens/s, puede procesar lotes pequeños de documentos para tareas de resumen o etiquetado antes de sincronizar con un backend.
- Demos y pruebas de concepto en Colab: el notebook incluido permite familiarizarse con la pila LiteRT, aunque con la advertencia de que el rendimiento en Colab puede ser peor que en un dispositivo local.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de inferencia en un Samsung S24 Ultra con caché KV de 1.280 entradas y múltiples firmas de prefill habilitadas:

| Backend | Cuantizacion | Contexto | Prefill (tk/s) | Decode (tk/s) | TTFT (s) | Tamano modelo (MB) | RSS pico (MB) | Memoria GPU (MB) |
|---|---|---|---|---|---|---|---|---|
| CPU | dynamic_int8 | 4096 | 66,53 | 7,28 | 15,90 | 3906 | 5308 | N/A |
| GPU | dynamic_int8 | 4096 | 314,01 | 10,39 | 10,32 | 3906 | 4107 | 4608 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible para esta conversión concreta.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 3.906 MB de tamaño de modelo y un pico de RSS de 5.308 MB en CPU y 4.107 MB en GPU en el dispositivo de referencia (Samsung S24 Ultra).
- Memoria GPU: 4.608 MB en el benchmark con backend GPU.
- GPU recomendadas: no se especifican modelos de escritorio; el objetivo son SoC móviles con GPU compatible con LiteRT (el benchmark usa un Samsung S24 Ultra). Para escritorio no hay datos publicados.
- ¿Cabe en GPU de consumo? No hay datos para RTX 4090 u otras GPU de escritorio; el modelo está optimizado para Android/iOS/web, no para CUDA.
- Opciones de despliegue: LiteRT-LM (Kotlin en Android), MediaPipe LLM Inference API (modo mantenimiento), app Edge Gallery, y notebook de Colab para pruebas.
- Latencia y throughput: TTFT de 15,90 s en CPU y 10,32 s en GPU; decodificación de 7,28 tk/s en CPU y 10,39 tk/s en GPU; prefill de 66,53 tk/s en CPU y 314,01 tk/s en GPU (Samsung S24 Ultra, contexto 4.096, caché de 1.280 entradas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/Phi-4-mini-instruct | ~3.800 M | 4.096 (en esta conversion) | .litertlm/.tflite para Android/iOS/web | MIT | Hugging Face, 20.804 descargas |
| microsoft/Phi-4-mini-instruct | ~3.800 M | 128.000 | safetensors, transformers | MIT | Hugging Face (modelo base) |
| Otros modelos LiteRT de la comunidad | No disponible | No disponible | .litertlm/.tflite | No disponible | No disponible |

La comparación principal es con el modelo base de Microsoft: misma arquitectura y pesos, pero este último ofrece contexto de 128.000 tokens y está pensado para servidores con transformers, mientras que la conversión LiteRT sacrifica contexto (4.096) a cambio de ejecución local en móvil.

## Limitaciones y advertencias

- Contexto reducido: las variantes publicadas usan 4.096 tokens, muy por debajo de los 128.000 del modelo base; conversaciones o documentos largos se truncarán.
- Idiomas: la información disponible no especifica la lista de idiomas soportados; no se puede garantizar un rendimiento multilingüe más allá de lo que herede el modelo base.
- Riesgo de alucinación: como todo LLM, puede generar información falsa con apariencia de veracidad, especialmente en dominios especializados.
- Sesgos: no se documentan evaluaciones de sesgo en esta conversión; los sesgos del modelo base pueden persistir.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base de Microsoft y de las dependencias de LiteRT/MediaPipe.
- MediaPipe LLM Inference API está en modo de solo mantenimiento; para nuevos desarrollos se recomienda LiteRT-LM.
- Rendimiento en Colab: el propio autor advierte que la memoria y la latencia en Colab pueden ser mucho peores que en un dispositivo local.
- No se documentan capacidades de tool calling, agentes o visión en esta conversión; no asumirlas en producción sin verificación.
- El repositorio de 31,3 GB contiene múltiples variantes; hay que seleccionar el artefacto correcto (por ejemplo, Phi-4-mini-instruct_multi-prefill-seq_q8_ekv4096.litertlm) para evitar descargas innecesarias.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Phi-4-mini-instruct
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- LiteRT: https://ai.google.dev/edge/litert
- MediaPipe LLM Inference API: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Guía LiteRT-LM para Android: https://ai.google.dev/edge/litert-lm/android
- App Edge Gallery: https://github.com/google-ai-edge/gallery
- Edge Gallery en Google Play: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Ejemplos LiteRT: https://github.com/google-ai-edge/litert-samples
- XNNPACK: https://github.com/google/XNNPACK
- Notebook de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/litert-community/Phi-4-mini-instruct/blob/main/notebook.ipynb
