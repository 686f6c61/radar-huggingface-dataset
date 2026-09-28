# alesha-pro/Qwen3.8-27B-S-mirai-GGUF

## Resumen

Qwen3.8-27B-S-mirai-GGUF es una conversión comunitaria a GGUF del checkpoint experimental `trymirai/Qwen3.8-27B-S-experimental`, publicado por el usuario alesha-pro. Se trata de una versión comprimida de forma extrema (2,4 bits, con códigos trellis) de un modelo Qwen3.8 de 27.324.879.699 parámetros, empaquetada para ejecutarse en una única GPU de 12 GB manteniendo una ventana de contexto de 128K tokens. Frente a las cuantizaciones habituales de 4 o 5 bits, aquí los pesos comprimidos de Mirai se copian bit a bit en el GGUF: no hay recuantización posterior.

El interés principal es doble. Por un lado, demuestra que un modelo de ~27B puede caber en tarjetas de gama consumer con contexto muy largo (11,3 GB de VRAM pico a 131.072 tokens con caché KV en q4_0). Por otro, introduce cuatro tipos ggml nuevos que obligan a usar un fork específico de llama.cpp (`alesha-pro/llama.cpp-mirai-s`): ni el llama.cpp principal, ni LM Studio ni Ollama pueden cargar el archivo. Es, por tanto, una pieza de investigación más que un artefacto listo para producción.

La arquitectura es híbrida (atención completa con flash attention más vías de gated delta net, según las referencias del propio autor), incluye un bloque MTP para decodificación especulativa y admite entrada de visión mediante un proyector separado extraído del modelo base de Qwen. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención completa (flash attention) y vías de gated delta net (atención lineal) |
| Parametros totales | 27.324.879.699 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 131.072 tokens (128K) en las configuraciones documentadas; valor nativo del modelo base no disponible |
| Tipos de cuantizacion | Pesos en 2,4 bits (códigos trellis de Mirai, sin recuantizar); KV cache q4_0 o q8_0; bloque MTP en Q8_0; token embedding en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (11,2 GB el modelo principal; 0,93 GB el proyector de visión) |

## Arquitectura y entrenamiento

El modelo combina capas de atención completa con vías de gated delta net, una forma de atención lineal con estado recurrente. Esa naturaleza híbrida tiene una consecuencia práctica documentada por el autor: cada slot del servidor mantiene su propio estado de DeltaNet, de modo que aumentar el número de slots encarece la VRAM (unos 450 MB adicionales por defecto, lo que lleva el consumo a 11,7 GB en lugar de 11,3 GB a 128K). El checkpoint incorpora además un bloque MTP (multi-token prediction) en Q8_0 que se usa como cabecera de borrador para decodificación especulativa (`--spec-type draft-mtp`). El token embedding, en F16, ocupa 2,5 GB y permanece en RAM del sistema, mientras que 7,8 GB se descargan a la GPU.

La innovación técnica central no está en el entrenamiento sino en la compresión: Mirai Labs ha producido pesos en 2,4 bits mediante un esquema de códigos trellis, y esta conversión los traslada literalmente al formato GGUF. No se han publicado detalles sobre el corpus de entrenamiento, el número de tokens, ni sobre si hubo fases de RLHF, DPO u otras técnicas de alineación. Tampoco se especifica qué significa el sufijo "S" de la nomenclatura ni en qué consiste la variante "experimental" del checkpoint de origen.

## Capacidades

- Generación de texto conversacional, con plantilla de chat propia de Qwen3.8.
- Modo de razonamiento (thinking) activado por defecto; el servidor acepta el parámetro `reasoning_effort` con los valores `low`, `medium` y `xhigh`, y permite desactivarlo con `chat_template_kwargs: {"enable_thinking": false}`.
- Generación de código, con rendimiento medido específicamente en esta tarea (85 tok/s con MTP 3 en una RTX 3090).
- Procesamiento de contexto largo: hasta 131.072 tokens en las configuraciones de referencia.
- Capacidad de visión (image-to-text) mediante el proyector `mmproj-Qwen3.8-27B-base-f16.gguf`, tomado del modelo base `Qwen/Qwen3.8-27B`; el checkpoint de Mirai solo incluye el modelo de lenguaje.
- Decodificación especulativa mediante el bloque MTP integrado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente conversacional local en una GPU de 12 GB: el modelo cabe con 128K de contexto y caché KV en q4_0, lo que permite desplegar un chatbot de 27B en hardware de gama consumer sin depender de servicios en la nube.
- Análisis de documentos extensos: con 131.072 tokens de ventana se pueden procesar informes, expedientes o bases de código completas en una sola pasada, algo inusual en modelos de este tamaño ejecutados localmente.
- Extracción y resumen sobre capturas de pantalla: gracias al proyector de visión, admite entradas de imagen; una captura de 1280x800 tarda unos 7 segundos en codificarse en CPU (48 núcleos EPYC) o alrededor de 1,5 segundos si el encoder se descarga a la GPU (0,8 GB extra de VRAM).
- Generación de código asistida en estación de trabajo: con la configuración de 16 GB y MTP 3 se alcanzan 85 tok/s en tareas de código, un régimen adecuado para autocompletado interactivo.
- Investigación en cuantización extrema: sirve como banco de pruebas para comparar el comportamiento de pesos a 2,4 bits frente a alternativas de 4 y 5 bits, con la ventaja de que el autor documenta verificaciones de fidelidad numérica.
- Procesamiento por lotes sin conexión: el prefill sostenido de ~1000 tok/s permite ingerir prompts largos (6,9K tokens) de forma eficiente en modo servidor.
- Prototipado de razonamiento multi-paso: el modo thinking con `reasoning_effort` configurable permite experimentar con distintos niveles de profundidad de razonamiento sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Sí se incluyen mediciones de rendimiento en tiempo de ejecución sobre una única RTX 3090 a 300 W con `llama-server`:

| Configuracion | VRAM pico | Decode (chat nuevo) | Decode a 62K | Prefill (prompt 6,9K) |
|---|---:|---:|---:|---:|
| 12 GB, 128K, KV q4_0, `-ub 1024` | 11,3 GB | 39,7 tok/s | 34,6 tok/s | 1008 tok/s |
| 12 GB, 74K, KV q8_0, `-ub 1024` | 11,1 GB | 40,0 tok/s | 34,9 tok/s | 1009 tok/s |
| 16 GB, 128K, KV q8_0, MTP 3 | 14,6 GB | 85 tok/s (código) / 57 tok/s (prosa) | no disponible | 806 tok/s |

Dato adicional: con la configuración de 128K y KV q4_0, el decode a 117K tokens de contexto se mantiene en 30,4 tok/s. Frente al plugin de vLLM de Mirai sobre la misma tarjeta, este GGUF es más lento en prompts cortos (39 frente a 44 tok/s de decode; 1120 frente a 1336 tok/s de prefill; 84 frente a 107 tok/s en código con MTP) pero permite más contexto en 12 GB (128K frente a 37,6K con KV en bf16 o 74,4K con KV en fp8).

En cuanto a verificación de fidelidad: el decodificador de referencia del conversor coincide con la decodificación propia de Mirai hasta 3e-8, y los kernels CUDA coinciden con la referencia de CPU en `test-backend-ops`. En una comparación greedy de 10 prompts (dos de ellos de ~7K tokens, 64 tokens de salida), 8 resultados fueron idénticos token a token; los otros 2 divergieron en empates muy ajustados (0,0007 de logprob de diferencia entre los dos candidatos principales). Los top-5 logprobs del primer token coincidieron 5 de 5 en los 10 prompts.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,1 GB (74K de contexto, KV q8_0) o 11,3 GB (128K, KV q4_0) en una tarjeta de 12 GB; 14,6 GB para la configuración de 128K con KV q8_0 y MTP 3 en una tarjeta de 16 GB.
- Memoria del sistema: 2,5 GB adicionales para el token embedding en F16, que no se descarga a la GPU.
- GPU recomendadas: RTX 3090 (la única verificada, sm_86, 300 W). El autor advierte de que las velocidades en tarjetas más pequeñas serán inferiores.
- Cabe en GPU consumer: sí, en tarjetas de 12 GB o más. Es el principal argumento del proyecto.
- Encoder de visión: añade 0,8 GB de VRAM (1,3 GB en pico) si se ejecuta en GPU, o 0 VRAM si se deja en CPU a costa de latencia (7 segundos por captura de 1280x800, 44 segundos por una imagen de 2600x2400 con 48 núcleos).
- Opciones de despliegue: exclusivamente el fork `alesha-pro/llama.cpp-mirai-s`. No es compatible con llama.cpp principal, LM Studio ni Ollama, porque el formato añade cuatro tipos ggml nuevos. Como alternativa sobre los mismos pesos existe el plugin de vLLM de Mirai Labs.
- Requisitos de compilación: CUDA 12 con cuBLASLt (`-DCUDAToolkit_ROOT`); con cuBLAS 11 la GEMM int8 cae a un tile aproximadamente la mitad de rápido.
- Latencia y throughput: según la tabla de la sección anterior. El camino rápido es CUDA; existe una referencia de CPU, pero es lenta.
- Ajuste crítico: usar `-np 1`, ya que cada slot adicional mantiene su propio estado de DeltaNet y encarece la VRAM (unos 450 MB extra con la configuración por defecto).

## Comparativa con modelos similares

| Modelo / ruta de ejecución | Parametros | Contexto | Rendimiento (RTX 3090, 300 W) | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este GGUF (fork llama.cpp mirai-s) | 27,3 B, pesos a 2,4 bits | 128K con KV q4_0 en 12 GB | 39,7 tok/s decode; 1008 tok/s prefill | Apache-2.0 | llama.cpp modificado |
| Plugin vLLM de Mirai (mismos pesos) | 27,3 B, pesos a 2,4 bits | 37,6K con KV bf16 o 74,4K con KV fp8 en 12 GB | 44 tok/s decode; 1336 tok/s prefill; 107 tok/s en código con MTP | Apache-2.0 | vLLM con plugin |
| `Qwen/Qwen3.8-27B` (modelo base, sin cuantizar) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos sobre otras alternativas de la misma categoría (modelos de ~27B cuantizados a 2-3 bits) en la información proporcionada.

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp. El archivo no carga en llama.cpp principal, LM Studio ni Ollama, lo que limita su integración en infraestructuras existentes y complica el mantenimiento a largo plazo.
- La ruta de CPU existe pero es lenta; sin GPU CUDA el modelo es poco práctico.
- Es una conversión comunitaria, no una publicación oficial de Mirai Labs. El propio autor lo explicita.
- Fidelidad aproximada, no exacta: en la comparación greedy contra el plugin de vLLM, 2 de cada 10 prompts divergieron en empates muy ajustados (0,0007 de logprob). En producción, esto implica que determinadas salidas pueden diferir de la implementación de referencia.
- Cuantización a 2,4 bits: aunque los códigos se copian sin recuantizar, se trata de un régimen de compresión muy agresivo cuyas consecuencias sobre la calidad en tareas abiertas no están cuantificadas con benchmarks públicos.
- Idiomas soportados: no disponible. No se puede garantizar un comportamiento multilingüe adecuado sin datos al respecto.
- Riesgo de alucinación: inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Sesgos conocidos: no disponible.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base `Qwen/Qwen3.8-27B` y del checkpoint de Mirai antes de un despliegue comercial, ya que la ficha no detalla esa cadena.
- Adopción muy baja (618 descargas, 12 me gusta), por lo que el soporte de la comunidad y la resolución de incidencias serán limitados.
- Configuraciones sensibles: el uso de `-np 1`, de CUDA 12 con cuBLASLt y de los tipos de caché KV adecuados es determinante para el consumo de VRAM y el rendimiento.
- Fecha de publicación según los metadatos de HuggingFace: 26 de septiembre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alesha-pro/Qwen3.8-27B-S-mirai-GGUF
- Modelo base (checkpoint de Mirai): https://huggingface.co/trymirai/Qwen3.8-27B-S-experimental
- Fork de llama.cpp necesario: https://github.com/alesha-pro/llama.cpp-mirai-s
- Modelo base de Qwen (origen del encoder de visión): https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Mirai Labs (autores del códec y del plugin de vLLM): https://x.com/trymirai
