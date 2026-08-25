# Shrenik2397/Qwen2.5-1.5B-Instruct

## Resumen

Shrenik2397/Qwen2.5-1.5B-Instruct es una conversión del modelo Qwen/Qwen2.5-1.5B-Instruct de Alibaba al formato LiteRT (antes TFLite), optimizada para despliegue en dispositivos móviles. El objetivo es ofrecer un modelo de chat ligero, de 1.540 millones de parámetros, listo para ejecutarse en Android, iOS y Web mediante el stack LiteRT de Google, la MediaPipe LLM Inference API y la librería LiteRT-LM. El modelo resuelve el problema de llevar un LLM de calidad media a entornos con recursos limitados, manteniendo una arquitectura transformer densa con atención por grupos de consultas (GQA) y embeddings rotatorios (RoPE).

La relevancia actual de esta ficha reside en que el despliegue de LLMs en el borde (edge) es una tendencia creciente, y este repositorio ofrece variantes cuantizadas (fp32 y dynamic_int8) con contextos de 1280 y 4096 tokens, acompañadas de benchmarks de rendimiento medidos en un Samsung S25 Ultra. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que facilita su adopción en productos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, denso, con RoPE, SwiGLU, RMSNorm y GQA (12 cabezas de consulta) |
| Parametros totales | 1.540 millones (1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; variantes LiteRT de 1.280 y 4.096 tokens |
| Tipos de cuantizacion | fp32 (baseline) y dynamic_int8 |
| Idiomas soportados | Multilingue (base: 29 idiomas, incluye espanol, ingles, chino, frances, aleman, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT .task (para MediaPipe/LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only denso con 28 capas, 12 cabezas de atención con agrupación de consultas (GQA), embeddings rotatorios (RoPE) y capas feed-forward SwiGLU con RMSNorm. Fue preentrenado sobre un dataset de hasta 18 billones de tokens de Alibaba, seguido de un ajuste fino supervisado (SFT) y optimización por preferencias humanas (RLHF/DPO) para la variante Instruct. Esta conversión específica no modifica los pesos; aplica un proceso de exportación a formato LiteRT con cuantización dinámica int8 opcional, que reduce el tamaño del modelo de 6182 MB (fp32) a 1598 MB (int8) y permite prefill múltiple en el dispositivo.

## Capacidades

- Generación de texto conversacional y completado de texto en lenguaje natural.
- Razonamiento básico y respuesta a instrucciones con formato de chat (chat template de Qwen).
- Soporte multilingüe: el modelo base cubre 29 idiomas, incluidos espanol, ingles, chino, frances y aleman.
- Capacidad de generación de codigo y resolución de problemas matematicos simples, heredada del modelo base instruct.
- No incluye tool calling ni function calling en esta variante LiteRT; el modelo base tampoco lo soporta de forma nativa.
- No incluye capacidades de vision ni audio; es exclusivamente texto.
- Optimizado para inferencia en dispositivos con aceleración GPU (via LiteRT) y CPU.

## Casos de uso

- Asistente conversacional en apps Android: el modelo puede ejecutarse localmente en un telefono, gestionando conversaciones multi-turno de hasta 1280 o 4096 tokens, sin dependencia de servidores. Con dynamic_int8 en GPU, alcanza 30,88 tokens/s de decodificacion en un S25 Ultra, suficiente para interacciones fluidas.
- Aplicaciones de chat privado y sin conexion: al ejecutarse en el dispositivo, los datos del usuario no salen del telefono, lo que es adecuado para sectores como salud o banca que requieren privacidad estricta.
- Autocompletado de texto y correccion gramatical: con un contexto de 1280 tokens se pueden procesar documentos cortos y sugerir correcciones o continuaciones de texto en tiempo real.
- Generacion de respuestas en apps de educacion: el modelo puede actuar como tutor de idiomas o resolver dudas de matematicas en un entorno movil, con latencia de primer token de 3,63 s (GPU, contexto 1280) que permite interacciones aceptables.
- Prototipado y validacion de IA en el borde: los desarrolladores pueden usar esta variante LiteRT para evaluar la viabilidad de un producto antes de escalar a modelos mas grandes, gracias a la compatibilidad con MediaPipe y LiteRT-LM.
- Traduccion y transcripcion de textos cortos: el soporte multilingue del modelo base permite traducir fragmentos de texto o transcribir notas, ejecutandose en dispositivos con recursos limitados como telefonos de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card proporciona datos de rendimiento de inferencia medidos en un Samsung S25 Ultra, que se presentan a continuacion:

| Backend | Cuantizacion | Contexto | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Tamano modelo (MB) | RSS pico (MB) | Memoria GPU (MB) |
|---|---|---|---|---|---|---|---|---|
| CPU | fp32 | 1280 | 49,50 | 10,00 | 21,25 | 6182 | 6254 | N/A |
| CPU | dynamic_int8 | 1280 | 297,58 | 34,25 | 3,71 | 1598 | 1997 | N/A |
| CPU | dynamic_int8 | 4096 | 162,72 | 26,06 | 6,57 | 1598 | 2216 | N/A |
| GPU | dynamic_int8 | 1280 | 1667,75 | 30,88 | 3,63 | 1598 | 1846 | 1505 |
| GPU | dynamic_int8 | 4096 | 933,45 | 27,30 | 4,77 | 1598 | no disponible | no disponible |

Nota: los datos de la ultima fila (GPU, contexto 4096) estan incompletos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,6 GB (dynamic_int8) y 6,2 GB (fp32) en el dispositivo movil; en un telefono de gama alta como el Samsung S25 Ultra, el modelo int8 cabe holgadamente en memoria (RSS pico de 1846 MB en GPU).
- GPU recomendadas: para el despliegue movil, cualquier GPU integrada compatible con LiteRT en Android (Adreno, Mali) o Apple GPU en iOS; en escritorio, no se requiere GPU dedicada si se usa el modelo base.
- Cabe en GPU de consumo: si, en GPU de escritorio con 4 GB o mas de VRAM, pero el despliegue objetivo es el movil (Android/iOS).
- Opciones de despliegue: LiteRT-LM, MediaPipe LLM Inference API, LiteRT stack, Google Colab (con rendimiento degradado), app de ejemplo de Edge Gallery.
- Latencia y throughput estimados: decodificacion de 30-34 tokens/s en GPU movil (contexto 1280) y 26-27 tokens/s con contexto 4096; prefill de 1667 tokens/s en GPU movil con contexto 1280.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Shrenik2397/Qwen2.5-1.5B-Instruct (LiteRT) | 1,54 B | 1280/4096 (LiteRT) | Apache 2.0 | .task (LiteRT) | Optimizado para movil |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo original sin conversion |
| Qwen/Qwen2.5-3B-Instruct | 3 B | 32.768 | Apache 2.0 | safetensors, GGUF | Tamano superior, misma familia |
| Gemma 2 2B (Google) | 2,6 B | 8.192 | Gemma Terms | safetensors, GGUF | Alternativa de Google, licencia mas restrictiva |

Nota: los datos de Gemma 2 2B y Qwen2.5-3B se basan en informacion publica general; no se han verificado en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo LiteRT esta limitado a contextos de 1280 o 4096 tokens, muy por debajo de los 32.768 del modelo base; no apto para documentos largos.
- La cuantizacion dynamic_int8 puede degradar la calidad de las respuestas respecto al modelo fp32, especialmente en tareas de razonamiento complejo.
- Riesgo de alucinacion: como todo LLM, puede generar contenido falso o inventado; es necesario implementar validacion externa en aplicaciones de produccion.
- Sesgos conocidos: el modelo base fue entrenado con datos de internet, por lo que puede reflejar sesgos de genero, raza y cultura presentes en los datos.
- No soporta tool calling, function calling, vision ni audio en esta variante LiteRT.
- El rendimiento medido corresponde a un Samsung S25 Ultra; en dispositivos mas modestos, la latencia y el throughput seran significativamente peores.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue en iOS requiere compilar con XCode y seguir las instrucciones de MediaPipe, lo que anade complejidad tecnica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shrenik2397/Qwen2.5-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base (sin instruct): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Pagina del modelo en Ollama: https://ollama.com/library/qwen2.5:1.5b-instruct
- Repositorio GitHub de Qwen2.5 (Alibaba): https://github.com/mx4ai/qwen2.5
- Documentacion de LiteRT: https://ai.google.dev/edge/litert
- MediaPipe LLM Inference API: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference
- LiteRT-LM en GitHub: https://github.com/google-ai-edge/LiteRT-LM
- App de ejemplo Edge Gallery: https://github.com/google-ai-edge/gallery
- Muestras de MediaPipe: https://github.com/google-ai-edge/mediapipe-samples
