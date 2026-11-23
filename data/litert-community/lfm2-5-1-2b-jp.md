# litert-community/LFM2.5-1.2B-JP

## Resumen

LFM2.5-1.2B-JP es la variante de chat optimizada para japones del modelo insignia de Liquid AI, construido sobre una arquitectura hibrida de convolucion y atencion con 1.2B parametros. Este repositorio concreto, publicado por la comunidad litert-community, no contiene los pesos originales en safetensors sino una conversion al formato `.litertlm` para inferencia en dispositivo con el runtime LiteRT-LM de Google, sucesor de TensorFlow Lite. El modelo base es LiquidAI/LFM2.5-1.2B-JP y la conversion mantiene la licencia original LFM Open License v1.0.

La relevancia de esta ficha reside en que empaqueta un modelo conversacional japones-ingles de 1.2B en cuatro artefactos cuantizados (int8, int4 y sus variantes GPU) que caben entre 736 MB y 1.24 GB y se ejecutan en CPU de movil, Raspberry Pi 5 y portatiles sin conexion de red. La model card reporta mediciones reales de decodificacion (hasta 41,3 tok/s en CPU de Galaxy S26 con int8, 9,2 tok/s en Raspberry Pi 5 con int4) y una fidelidad de cuantizacion verificada con GSM8K (65% en int8 frente a 63% en bf16 de referencia).

El contexto maximo de la cache KV esta limitado a 4096 tokens, lo que lo posiciona como un modelo de conversacion y tareas cortas en el borde, no como un modelo de contexto largo. La libreria es `litert-lm` y requiere versiones recientes del runtime (0.15 o superior, con matices segun el fichero).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida conv-atencion (familia LFM2.5, "hybrid conv-attention"); detalles de capas no disponibles |
| Parametros totales | 1.2B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (maximo de cache KV) |
| Tipos de cuantizacion | int8 dinamico (lineales + embedding, convoluciones en float); int4 blockwise-32 + OCTAV en lineales, embedding int8, convoluciones float; variantes `_gpu` con las mismas recetas |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | LFM Open License v1.0 (`license: other`) |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM2.5 de Liquid AI, descrita como "hybrid conv-attention": combina capas convolucionales con capas de atencion en lugar de un transformer puro de atencion completa. La model card de esta conversion no detalla el numero de capas, la dimension oculta, la composicion del dataset de entrenamiento ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original LiquidAI/LFM2.5-1.2B-JP y no se reproducen aqui.

La innovacion tecnica relevante en este repositorio es el proceso de conversion y cuantizacion para LiteRT-LM. El fichero int8 cuantiza solo las capas lineales y el embedding, dejando las convoluciones en float, porque cuantizar las convoluciones de este tune japones cuesta aproximadamente 9 puntos porcentuales en GSM8K (a diferencia del modelo Instruct, donde la cuantizacion de convoluciones es gratuita). El fichero int4 emplea cuantizacion blockwise de tamano 32 con OCTAV en las lineales. Los ficheros `.litertlm` incorporan la plantilla de chat completa, incluido soporte de tool calling, y desde la actualizacion del 2026-08-04 incluyen la seccion `ExecutorMetadata` necesaria para que litert-lm 0.15 o superior enlace los buffers de estado de la convolucion hibrida.

## Capacidades

- Generacion de texto conversacional en japones e ingles, con calidad de conversacion japonesa verificada por inspeccion segun la model card.
- Razonamiento matematico basico: la evaluacion GSM8K con cadena de pensamiento zero-shot alcanza 65% en int8 y 55% en int4 (n=100).
- Tool calling / function calling: la plantilla de chat incluida en el fichero lo soporta explicitamente.
- Ejecucion totalmente en dispositivo, sin conexion de red, sobre CPU (todos los ficheros) y GPU (ficheros `_int4_gpu` y `_int8_gpu`).
- Soporte de backend GPU en Android OpenCL, macOS y, para `_int4_gpu`, iOS Metal.
- No se documentan capacidades de vision, audio, modo thinking explicito ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Asistente conversacional japones offline en movil: los ficheros int8 (1,24 GB) e int4 (736 MB) se importan en AI Edge Gallery y permiten chat multi-turno en japones sin conexion; en un Galaxy S26 con CPU se midieron 41,3 tok/s de decodificacion y 450 ms de TTFT con int8.
- Traduccion y asistencia linguistica ja-en en el borde: el modelo cubre ambos idiomas y puede integrarse en aplicaciones Android mediante la libreria `com.google.ai.edge.litert:litert` sin enviar texto a servidores externos.
- Despliegue en dispositivos de recursos limitados: en Raspberry Pi 5 con 4 hilos de CPU el fichero int4 decodifica a 9,2 tok/s con prefill de 54 tok/s, suficiente para asistentes de voz o interfaces de texto en kioscos y dispositivos empotrados.
- Automatizacion con tool calling en aplicaciones moviles: la plantilla de chat soporta function calling, lo que permite que la app invoque funciones locales (calendario, clima, calculadora) con el modelo como enrutador conversacional.
- Prototipado de productos japoneses sin infraestructura cloud: el formato `.litertlm` y el runtime LiteRT-LM permiten validar experiencias de chat en dispositivo antes de invertir en servidores, con un modelo de 1,2B y contexto de 4096 tokens.
- Educacion y demostraciones de IA en dispositivo: el tamano reducido y las recetas de cuantizacion publicadas (int8 frente a int4 con metricas GSM8K) lo convierten en un caso practico para ensenar compromisos entre precision y latencia en el borde.
- Procesamiento de texto local con requisitos de privacidad: al ejecutarse en CPU del dispositivo y sin red, es adecuado para aplicaciones que manejan texto sensible y no pueden enviar datos a la nube.

## Benchmarks y rendimiento

La model card solo publica resultados de GSM8K (ingles, greedy, 0-shot CoT, max-tokens 1024, n=100) y mediciones de latencia en dispositivo. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

| Metrica | bf16 (referencia PyTorch) | int8 LiteRT | int4 LiteRT |
|---|---|---|---|
| GSM8K (n=100) | 63% | 65% | 55% |
| Tamano del fichero | no disponible | 1,24 GB | 736 MB |

| Dispositivo y backend | Fichero | Decode | Prefill | TTFT |
|---|---|---|---|---|
| Galaxy S26, CPU, LiteRT-LM 0.16.0 | int8 | 41,3 tok/s | 485 tok/s | 450 ms |
| Galaxy S26, GPU, LiteRT-LM 0.16.0 | int8 / int4 | no ejecuto (`engine_create_failed`) | no disponible | no disponible |
| Raspberry Pi 5, CPU 4 hilos, LiteRT-LM 0.16.1 | int8 | 7,0 tok/s | 75 tok/s | 3,56 s |
| Raspberry Pi 5, CPU 4 hilos, LiteRT-LM 0.16.1 | int4 | 9,2 tok/s | 54 tok/s | 4,83 s |

## Requisitos de hardware

- VRAM/RAM estimada: 736 MB para los ficheros int4 y 1,24 GB para los int8; no hay requisito de VRAM dedicada porque el backend principal es CPU.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el soporte GPU documentado es Android OpenCL, macOS y iOS Metal para los ficheros `_gpu`.
- Compatibilidad consumer: cabe en moviles Android (Galaxy S26 verificado), iPhone (con `maxNumTokens` fijado a 1024 en iOS) y Raspberry Pi 5. No se documenta su ejecucion en RTX 4090, A100 o H100.
- Opciones de despliegue: runtime LiteRT-LM (version 0.15 o superior; los ficheros `_gpu` requieren 0.16.0 o superior) e importacion en AI Edge Gallery. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks; en Galaxy S26 CPU con int8 se alcanzan 41,3 tok/s de decodificacion y 450 ms de TTFT; en Raspberry Pi 5 la decodificacion cae a 7-9,2 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/LFM2.5-1.2B-JP (este) | 1,2B | 4096 | `.litertlm` | LFM Open License v1.0 | Tune japones, cuantizado para LiteRT-LM |
| litert-community/LFM2.5-1.2B-Instruct | 1,2B | no disponible | `.litertlm` | no disponible en la informacion | Misma familia; segun la model card, cuantizar convoluciones es gratuito en Instruct y cuesta ~9 pt en el tune japones |
| LiquidAI/LFM2.5-1.2B-JP | 1,2B | no disponible | no disponible | LFM Open License v1.0 | Modelo base original; el repositorio de esta ficha es una conversion cuantizada del mismo |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion de rendimiento se limita a los datos GSM8K del propio modelo.

## Limitaciones y advertencias

- Contexto limitado a 4096 tokens de cache KV: no es adecuado para documentos largos ni conversaciones muy extensas.
- Solo japones e ingles; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion inherente a un modelo de 1,2B; los resultados GSM8K (65% int8, 55% int4) indican que el razonamiento matematico es limitado y no apto para calculo critico sin verificacion.
- La licencia LFM Open License v1.0 es `other`; deben revisarse sus terminos antes de uso comercial. No se detallan restricciones concretas en la informacion disponible.
- Bug conocido en litert-lm 0.18.0: al iniciar una nueva conversacion en un Engine ya usado, el runtime reutiliza el estado de convolucion corta de la conversacion anterior y no lo reinicia; se recomienda crear un Engine nuevo por conversacion. El arreglo esta en main desde el 2026-11-03 pero no en ninguna release (v0.19.1 no lo incluye).
- En iOS es obligatorio fijar `maxNumTokens` a 1024; un valor distinto rompe la creacion del engine.
- Los ficheros `_gpu` no ejecutaron en Galaxy S26 con LiteRT-LM 0.16.0 (error `engine_create_failed`).
- La cuantizacion int4 pierde 10 puntos en GSM8K respecto a int8 (55% frente a 65%); para tareas de razonamiento conviene int8.
- Los pesos y el grafo son identicos al release original, pero el reempaquetado del 2026-10-13 exige litert-lm 0.15 o superior para el tipo de modelo `lfm2`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM2.5-1.2B-JP
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP
- Modelo hermano Instruct: https://huggingface.co/litert-community/LFM2.5-1.2B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue del bug de reutilizacion de estado: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Commit con el arreglo: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Medicion de conversion litert-torch: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Ficha edge-compat int4: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-jp-int4/CARD.md
- Ficha edge-compat int8: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-jp-int8/CARD.md
