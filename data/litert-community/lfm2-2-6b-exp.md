# litert-community/LFM2-2.6B-Exp

## Resumen

LFM2-2.6B-Exp es un checkpoint experimental de Liquid AI construido sobre LFM2-2.6B mediante aprendizaje por refuerzo puro, entrenado en seguimiento de instrucciones, conocimiento y matematicas. Este repositorio concreto, publicado por litert-community, no es el modelo original sino una conversion al formato `.litertlm` para el runtime LiteRT-LM de Google, orientada a inferencia en dispositivo (edge computing). Incluye tres artefactos con recetas de cuantizacion distintas (int4, int8 y una variante int4 con composites GPU para LiteRT-LM 0.19.x).

La arquitectura subyacente es un transformer hibrido de 2.569.272.320 parametros distribuidos en 30 capas (22 de convolucion y 8 de atencion), con embeddings atados y un vocabulario de 65.536 tokens. El contexto nativo es de 32.768 tokens, aunque la conversion LiteRT-LM lo recorta a 4.096. Soporta ocho idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.

Su relevancia actual reside en que demuestra que un modelo de 2.6B puede ejecutarse en GPU movil (Galaxy S26) a 31 tokens por segundo con un fichero de 1.53 GB, y en Mac M4 Max a velocidades que permiten prefill de 1.024 tokens mas decodificacion de 256 en 2 segundos. Es material de referencia para quien necesite desplegar generacion de texto en dispositivos sin conexion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (22 capas de convolucion + 8 capas de atencion) |
| Parametros totales | 2.569.272.320 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos; 4.096 en esta conversion LiteRT-LM |
| Tipos de cuantizacion | int8 dinamico en lineales + int8 en embedding (convs en float); int4 blockwise-32 + OCTAV en lineales, int8 en lm_head y embedding; variante int4 con composites GPU |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol |
| Licencia | lfm1.0 (other) |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors |
| Vocabulario | 65.536 tokens |
| Capas | 30 (22 convolution + 8 attention) |
| Embeddings | Atados (tied) |
| Tamano del repo | 10.0 GB |
| Tamano de ficheros | int4: 1.53 GB; int8: 2.72 GB; int4 GPU composite: 1.53 GB |
| Libreria | litert-lm |

## Arquitectura y entrenamiento

El modelo base LFM2-2.6B-Exp emplea una arquitectura hibrida que combina 22 capas de convolucion corta (ShortConv) con 8 capas de atencion, un diseno que reduce el coste computacional frente a un transformer denso puro manteniendo capacidad de modelado secuencial. Los embeddings estan atados y el vocabulario alcanza los 65.536 tokens. Segun la model card del autor, el checkpoint se entreno con aprendizaje por refuerzo puro sobre tareas de seguimiento de instrucciones, conocimiento y matematicas, partiendo de LFM2-2.6B.

La conversion a LiteRT-LM la realizo litert-community mediante `litert-torch`, que agrupa operaciones (escritura de KV cache, atencion, paso ShortConv de las capas convolucionales) en composites que el delegado GPU de LiteRT puede ejecutar como una sola operacion. Esta tecnica es la que permite la variante `_v0190`, que en Galaxy S26 alcanza 31.0 tok/s frente a 26.7 tok/s de la version int4 sin composites. La model card no detalla el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto en ocho idiomas (ingles, arabe, chino, frances, aleman, japones, coreano, espanol).
- Seguimiento de instrucciones, segun el entrenamiento declarado por Liquid AI.
- Razonamiento matematico basico (evaluado en GSM8K).
- Trazas de razonamiento: aunque la model card de Liquid AI no menciona modo de razonamiento, en las pruebas realizadas el modelo genero ocasionalmente trazas entre `<think>` y `</think>`.
- Extraccion de datos y RAG, casos de uso sugeridos por Liquid AI para la familia LFM2.
- Escritura creativa y conversaciones multi-turno.
- Inferencia en dispositivo sin conexion en GPU y CPU de movil y escritorio.
- No esta orientado a tareas intensivas en conocimiento ni a programacion, segun el autor del modelo base.

## Casos de uso

- Asistente conversacional offline en movil: con 4.096 tokens de contexto y 1.53 GB en int4, el modelo cabe en un telefono de gama alta y decodifica a 31 tok/s en GPU, suficiente para interacciones multi-turno sin conexion.
- Extraccion de datos estructurados en el dispositivo: Liquid AI recomienda LFM2 para esta tarea; el modelo puede procesar documentos locales y devolver campos estructurados sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- RAG local en aplicaciones de escritorio: con 4.096 tokens de contexto puede recibir varios fragmentos recuperados y generar respuestas fundamentadas; en Mac M4 Max el prefill de 1.024 tokens mas 256 de decodificacion tarda 2.00 s en int4 GPU.
- Generacion de texto creativo en apps moviles: escritura de parrafos, resumenes o variaciones de texto en ocho idiomas, con latencia de 10.81 s para el ciclo prefill+decode en Galaxy S26.
- Procesamiento de matematicas basicas en herramientas educativas: el modelo se entreno en matematicas y se evaluo en GSM8K, por lo que puede resolver problemas aritmeticos de varios pasos en local.
- Prototipado de agentes de borde: aunque el autor no garantiza soporte de tool calling nativo, las trazas `<think>` observadas permiten experimentar con cadenas de razonamiento cortas en dispositivos sin backend.
- Evaluacion de runtimes edge: sirve como banco de pruebas para comparar LiteRT-LM frente a otras soluciones (llama.cpp, MLC) en terminos de velocidad y correccion en GPU movil.

## Benchmarks y rendimiento

La model card reporta resultados en GSM8K (n=100) e IFEval-lite (n=120) para los ficheros int8 e int4, indicando que ambos quedan a menos de dos items del modelo bf16, pero no publica los valores numericos concretos. No se han publicado resultados de MMLU, HumanEval ni otras metricas en la informacion disponible.

Rendimiento medido (prefill de 1.024 tokens + 256 tokens decodificados, contexto 2.048):

| Configuracion | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 2.00 s | 10.81 s | 22.06 s |
| int8 GPU | 2.49 s | 13.42 s | 25.14 s |
| int8 CPU | 9.40 s | 17.39 s | 58.42 s |
| int4 CPU | 11.11 s | 25.91 s | 65.57 s |

Velocidad de decodificacion en Galaxy S26 GPU con LiteRT-LM 0.19.1:

| Fichero | Tokens/s |
|---|---|
| `LFM2-2.6B-Exp_int4_gpu_composite_v0190.litertlm` | 31.0 |
| `LFM2-2.6B-Exp_int4.litertlm` | 26.7 |

## Requisitos de hardware

- VRAM/RAM: el fichero int4 ocupa 1.53 GB y el int8 2.72 GB en disco; la seccion de pesos del int8 son 2.569.011.200 bytes (2.39 GiB), por lo que se necesita al menos esa cantidad de memoria del backend elegido.
- GPU de escritorio: probado en Mac M4 Max (GPU y CPU). No se han publicado pruebas en A100, H100 ni RTX 4090.
- GPU movil: probado en Galaxy S26 (GPU y CPU) y Pixel 8a (GPU y CPU).
- iOS: no medido. La model card advierte que un fichero int8 de 2.87 GB de la familia LFM2.5 solo corrio en iPhone 17 Pro con entitlements de direccionamiento virtual extendido y memoria incrementada.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2 GB de memoria libre para int4 y 3 GB para int8.
- Despliegue: exclusivamente mediante el runtime LiteRT-LM (version 0.19.0 a 0.19.2 recomendada para GPU; compilaciones con LiteRT #11565 o litert-lm-nightly 0.20.0.dev20261112 para CPU y GPU con el fichero int8). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tablas de la seccion anterior. El int4 es mas rapido en todas las GPU probadas y el int8 en todas las CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato edge | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2-2.6B-Exp (LiteRT-LM) | 2.57B | 4.096 (32.768 nativo) | `.litertlm` | lfm1.0 | Hugging Face |
| LiquidAI/LFM2-2.6B-Exp | 2.57B | 32.768 | safetensors | lfm1.0 | Hugging Face |
| litert-community/LFM2.5-2.6B | no disponible | no disponible | `.litertlm` | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental: Liquid AI lo describe como experimental, no como modelo de produccion.
- No recomendado para tareas intensivas en conocimiento ni programacion, segun el propio autor del modelo base.
- Contexto recortado: la conversion LiteRT-LM limita la ventana a 4.096 tokens frente a los 32.768 nativos, lo que reduce su utilidad en RAG con muchos fragmentos o documentos largos.
- Repeticion de lineas: el fichero int4 en CPU repitio lineas tras la respuesta en 3 de 9 ejecuciones con litert-lm 0.18.0 y en 3 de 3 con 0.19.0 a 0.19.2 en Mac; el int8 no presento este problema.
- Fallo de correccion en versiones antiguas: con litert-lm 0.17.1 el fichero int8 respondio a "What is the capital of France?" como si no se hubiera hecho ninguna pregunta.
- Incompatibilidades de runtime: las compilaciones con LiteRT #11565 rechazan el fichero `_v0190` en GPU; en litert-lm-nightly 0.20.0.dev20261112 el int4 fallo en CPU y GPU.
- Sin probar en iOS ni en telefonos distintos de Galaxy S26 y Pixel 8a.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de 2.6B entrenado con RL sobre conocimiento, es esperable en tareas factuales.
- Licencia lfm1.0: es necesario revisar los terminos en el enlace de licencia antes de uso comercial; la model card no detalla restricciones.
- Sesgos: no documentados en la informacion disponible.
- Idiomas: aunque soporta ocho, no se han publicado evaluaciones por idioma; el espanol esta listado pero sin metricas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM2-2.6B-Exp
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B-Exp
- Licencia: https://huggingface.co/LiquidAI/LFM2-2.6B-Exp/blob/main/LICENSE
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Modelo relacionado: https://huggingface.co/litert-community/LFM2.5-2.6B
