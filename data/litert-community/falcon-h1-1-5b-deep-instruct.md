# litert-community/Falcon-H1-1.5B-Deep-Instruct

## Resumen

Falcon-H1-1.5B-Deep-Instruct es una conversión comunitaria del modelo homónimo de TII (Technology Innovation Institute) al formato LiteRT-LM (`.litertlm`), diseñado para inferencia en dispositivos edge y móviles mediante el runtime LiteRT-LM de Google. El modelo original pertenece a la familia Falcon-H1, caracterizada por una arquitectura totalmente híbrida que combina en cada capa una rama de atención grouped-query y una rama de selective-scan Mamba2 en paralelo, sumando sus salidas. Esta variante "Deep" intercambia anchura por profundidad: 66 capas con hidden size de 1280, lo que la hace especialmente densa en estado recurrente (264 buffers de estado en total).

La conversión mantiene la paridad de logits con el modelo PyTorch original (correlación 1.0000 en 48 posiciones) y supera una batería de 8 preguntas de control en todas las configuraciones probadas (GPU, CPU, iPhone 17 Pro). El archivo distribuido pesa 1,83 GB e incluye cuantización int8 dinámica sobre lineales y embedding, mientras que las capas convolucionales y el scan se mantienen en float. Está pensado para ejecutarse con el runtime `litert-lm` (versión ≥ 0.15) y se distribuye bajo la licencia Falcon LLM.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM híbrido de 1.5B en hardware de consumo y móvil, con rendimientos de decode de hasta 51,7 tok/s en un Apple M4 Max (GPU) y 16,5 tok/s en un iPhone 17 Pro (Metal), lo que lo convierte en una opción práctica para aplicaciones de IA generativa sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención grouped-query + Mamba2 selective-scan en paralelo por capa (Falcon-H1) |
| Parametros totales | 1.5B (según denominación del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 dinámico (lineales y embedding); convs y scan en float; activaciones fp32 en GPU |
| Idiomas soportados | No disponibles |
| Licencia | Falcon LLM License (falcon-llm-license) |
| Formato de pesos | LiteRT flatbuffers (`.litertlm`), convertido desde safetensors bf16 |

## Arquitectura y entrenamiento

El modelo base Falcon-H1-1.5B-Deep-Instruct emplea una arquitectura híbrida en la que cada capa ejecuta simultáneamente una rama de atención grouped-query y una rama de selective-scan Mamba2 sobre la misma entrada, sumando sus contribuciones. Cada capa mantiene tanto una caché KV como un estado recurrente de tamaño constante (convolucional + SSM). La variante Deep prioriza profundidad sobre anchura: 66 capas con hidden size de 1280, lo que resulta en 264 buffers de estado (132 conv/SSM + 132 KV), el mayor número entre los tamaños Falcon-H1.

No se proporciona información sobre el proceso de entrenamiento original (datos, número de tokens, técnicas de alineación como RLHF o DPO). La conversión a LiteRT-LM es un proceso técnico de post-entrenamiento que incluye: un parche de caché híbrida compuesta (cada capa aloja KV + conv + estado recurrente en un único índice), el plegado del scan selectivo de Mamba2 como multiplicaciones de matrices con ejes de chunk y cabeza fusionados en el eje de batch (tensores de rango ≤ 4, sin `BROADCAST_TO` ni aritmética int64), la preservación del multiplicador µP y del `ssm_in_multiplier`, y una guardia de padding de prefill para que las posiciones de relleno actúen como pasos identidad exactos para el SSM. La cuantización es posterior: int8 dinámico sobre lineales y embedding, manteniendo convs y scan en float.

## Capacidades

- Generación de texto con plantilla de chat estilo ChatML (incluida en el bundle).
- Inferencia en dispositivos edge y móviles gracias al formato LiteRT-LM y al runtime `litert-lm`.
- Soporte de prefill multi-length (firmas de 1 a 1024 tokens) para que el runtime seleccione fragmentos ajustados.
- Ejecución en GPU (Metal, CUDA) y CPU, con activaciones fp32 declaradas para GPU.
- Robustez frente a variaciones de longitud de prompt: barridos de prefill herméticos limpios en CPU (12–51) y GPU (12–31).
- Paridad de salida entre backends GPU y CPU en pruebas de calidad (8/8 en iPhone 17 Pro, con diferencias solo en palabras funcionales).
- No se menciona soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Asistente personal en el dispositivo: el modelo puede ejecutarse localmente en un smartphone (iPhone 17 Pro) con un TTFT de 1,19 s en GPU, ofreciendo respuestas de chat sin conexión y con privacidad total. Su tamaño (1,83 GB) y memoria pico de 4,89 GB en GPU lo hacen viable en dispositivos con 12 GB de RAM.
- Chatbot de atención al cliente en entornos sin conectividad: gracias a su plantilla ChatML y su capacidad de generación multi-turno, puede integrarse en quioscos, terminales de punto de venta o aplicaciones de campo que requieran respuestas inmediatas sin depender de la nube.
- Procesamiento de texto en edge para IoT: su bajo consumo de memoria en CPU (1,74 GB) permite desplegarlo en gateways o dispositivos con recursos limitados para tareas como resumen, clasificación o extracción de información.
- Generación de código en entornos de desarrollo locales: aunque no se especifica entrenamiento específico en código, el modelo puede asistir en autocompletado o explicación de fragmentos en un IDE con inferencia local, evitando el envío de código a servidores externos.
- Prototipado rápido de aplicaciones de IA generativa: al ser un archivo único `.litertlm` con tokenizer y plantilla incluidos, los desarrolladores pueden integrarlo en pruebas de concepto con el comando `litert-lm run` sin necesidad de infraestructura de servidor.
- Educación y demostraciones de LLMs en hardware asequible: su capacidad para ejecutarse en un portátil con Apple M4 Max (decode de 51,7 tok/s en GPU) lo hace adecuado para talleres y cursos que necesiten mostrar inferencia de modelos de lenguaje sin GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son métricas de inferencia medidas por el autor de la conversión, que se resumen a continuación:

| Entorno | Backend | Prefill (256 tokens) | Decode | TTFT | Memoria pico |
|---|---|---|---|---|---|
| Apple M4 Max | GPU | 1134 tok/s | 51,7 tok/s | 0,25 s | no disponible |
| Apple M4 Max | CPU | 192 tok/s | 22,7 tok/s | 1,38 s | no disponible |
| iPhone 17 Pro | GPU (Metal) | 140,3 tok/s | 16,5 tok/s | 1,19 s | 4,89 GB |
| iPhone 17 Pro | CPU | 103,2 tok/s | 9,9 tok/s | 1,53 s | 1,74 GB |

Nota: el decode del modelo Deep (66 capas) es inferior al del hermano 3B (65,3 tok/s en las mismas condiciones) debido al mayor número de bloques secuenciales por token, mientras que el prefill sale adelante (1134 vs 979 tok/s).

## Requisitos de hardware

- VRAM estimada: la carga completa del modelo (todos los buffers de estado) cabe en un dispositivo con 12 GB de RAM; el pico de memoria en GPU es de 4,89 GB y en CPU de 1,74 GB.
- GPU recomendadas: Apple M4 Max (integrada), iPhone 17 Pro (GPU Metal), y cualquier GPU compatible con LiteRT-LM (CUDA en Linux, Metal en Apple). No se especifican GPUs discretas de escritorio.
- Sí cabe en hardware de consumo: portátiles con Apple Silicon, smartphones de gama alta y dispositivos con al menos 12 GB de RAM.
- Opciones de despliegue: runtime `litert-lm` (>= 0.15) con comandos `run` y `benchmark`; soporta backend GPU y CPU.
- Latencia y throughput: en Apple M4 Max GPU, prefill de 1134 tok/s y decode de 51,7 tok/s con TTFT de 0,25 s; en iPhone 17 Pro GPU, prefill de 140,3 tok/s y decode de 16,5 tok/s con TTFT de 1,19 s.

## Comparativa con modelos similares

La información disponible no incluye comparativas con modelos externos de la misma categoría. Dentro de la familia Falcon-H1 convertida a LiteRT-LM, se mencionan los siguientes hermanos (sin datos de rendimiento detallados en esta ficha):

| Modelo | Tamaño | Capas | Hidden size | Decode (M4 Max GPU) | Prefill (M4 Max GPU) |
|---|---|---|---|---|---|
| Falcon-H1-0.5B-Instruct | 0.5B | no disponible | no disponible | no disponible | no disponible |
| Falcon-H1-1.5B-Instruct | 1.5B | no disponible | no disponible | no disponible | no disponible |
| Falcon-H1-1.5B-Deep-Instruct (este) | 1.5B | 66 | 1280 | 51,7 tok/s | 1134 tok/s |
| Falcon-H1-3B-Instruct | 3B | no disponible | no disponible | 65,3 tok/s | 979 tok/s |

No se dispone de datos de modelos comparables de otros desarrolladores (p. ej., Llama 3.2 1B, Qwen2.5 1.5B) en el contexto de esta conversión.

## Limitaciones y advertencias

- La licencia Falcon LLM es una licencia propia de TII con restricciones específicas; es necesario revisar los términos y condiciones en el enlace proporcionado antes de un uso comercial.
- El modelo se distribuye como una conversión comunitaria; el autor declara que los pesos se convirtieron desde safetensors bf16 a flatbuffers y se cuantizaron, pero no se garantiza un mantenimiento continuado.
- En GPU, el runtime registra un aviso `TopK requires src tensor C dimension to be divisible by 4` debido al vocabulario de 65537 tokens; el autor indica que es un camino de respaldo normal y no afecta a la generación, pero podría confundir en entornos de producción.
- La profundidad de 66 capas penaliza el decode (menor throughput que el modelo 3B), por lo que no es óptimo para aplicaciones de streaming de tokens de alta velocidad.
- Las activaciones fp32 en GPU multiplican el consumo de memoria (pico de 4,89 GB frente a 1,74 GB en CPU), lo que limita su uso en GPUs con poca VRAM.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento en idiomas distintos del inglés; la información de idiomas soportados no está disponible.
- El tiempo de carga en GPU es de aproximadamente un minuto (8 s en CPU) debido a la compilación de kernels Metal para todas las firmas de prefill.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/Falcon-H1-1.5B-Deep-Instruct
- Modelo base (TII): https://huggingface.co/tiiuae/Falcon-H1-1.5B-Deep-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Script de conversión y parche: https://github.com/john-rocky/hf-to-litertlm
- Licencia Falcon LLM: https://falconllm.tii.ae/falcon-terms-and-conditions.html
- Hermanos en LiteRT-LM: [Falcon-H1-0.5B-Instruct](https://huggingface.co/litert-community/Falcon-H1-0.5B-Instruct), [Falcon-H1-1.5B-Instruct](https://huggingface.co/litert-community/Falcon-H1-1.5B-Instruct), [Falcon-H1-3B-Instruct](https://huggingface.co/litert-community/Falcon-H1-3B-Instruct)
