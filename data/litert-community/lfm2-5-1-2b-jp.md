# litert-community/LFM2.5-1.2B-JP

## Resumen

LFM2.5-1.2B-JP es la variante de chat optimizada para japones del modelo insignia de Liquid AI, una arquitectura hibrida convolucion-atencion de 1.200 millones de parametros. Este repositorio concreto, publicado por litert-community, no contiene los pesos originales en formato PyTorch, sino la conversion al formato `.litertlm` para su ejecucion con LiteRT-LM, el runtime on-device de Google (el nuevo nombre de TensorFlow Lite). El objetivo es claro: llevar un modelo conversacional capaz de japones natural a telefonos, Raspberry Pi y portatiles sin conexion de red.

El modelo resuelve el problema de desplegar inferencia de calidad en hardware de consumo con recursos muy limitados. Los ficheros cuantizados ocupan entre 736 MB (int4) y 1,24 GB (int8), y las mediciones publicadas en la model card muestran 41,3 tok/s de decodificacion en la CPU de un Galaxy S26 con el fichero int8, y 9,2 tok/s en una Raspberry Pi 5 con el int4. La ventana de contexto maxima con KV cache es de 4.096 tokens.

La relevancia actual del repositorio radica en que demuestra que un modelo bilingue japones/ingles de esta categoria puede ejecutarse con precision casi identica al original en bf16 (65 % en GSM8K con int8 frente a 63 % en bf16) y con soporte de tool calling incluido en la plantilla de chat. Es, por tanto, una pieza practica para aplicaciones de asistente local en dispositivos Android, macOS e iOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida convolucion-atencion (hybrid conv/attention, familia LFM2.5 de Liquid AI) |
| Parametros totales | 1.200 millones (1.2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens maximos (KV cache) |
| Tipos de cuantizacion | int8 dinamico (linears y embedding; convoluciones en float) e int4 blockwise-32 con OCTAV en linears, embedding int8 y convoluciones en float; variantes `_gpu` reexportadas para GPU |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | LFM Open License v1.0 (`license: other`) |
| Formato de pesos | `.litertlm` (LiteRT-LM); no incluye safetensors ni GGUF |
| Modelo base | LiquidAI/LFM2.5-1.2B-JP |
| Runtime requerido | litert-lm >= 0.15 (los ficheros reempaquetados el 2026-10-13 con tipo de modelo `lfm2` requieren 0.15) |
| Backends | CPU en todos los ficheros; GPU en `_int4_gpu` (Android OpenCL, macOS e iOS Metal) y `_int8_gpu` (Android OpenCL y macOS) con litert-lm >= 0.16.0 |
| Plantilla de chat | incluida en el fichero, con soporte de tool calling |
| Tamano del repo | 19,3 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es la hibrida conv-atencion de la familia LFM2.5 de Liquid AI, que combina capas convolucionales con capas de atencion en lugar de un transformer puramente atencional. Esta eleccion reduce el coste computacional y de memoria en inferencia sobre CPU, lo que explica el rendimiento medido en dispositivos de gama baja. El modelo esta afinado especificamente para conversacion en japones, partiendo de la version Instruct de la misma familia.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. Lo que si se documenta con precision es el proceso de conversion y cuantizacion: los ficheros se generaron con `litert_torch.convert` y se reempaquetaron el 2026-08-04 para anadir la seccion `ExecutorMetadata`, necesaria para que litert-lm >= 0.15 enlace los buffers de estado de la convolucion hibrida; los pesos y el grafo son identicos byte a byte a la publicacion original. Un detalle tecnico relevante es que cuantizar las convoluciones de este tune japones cuesta unos 9 puntos porcentuales, a diferencia del hermano Instruct, donde la cuantizacion int8 de convoluciones es gratuita; por eso el fichero int8 solo cuantiza las capas lineales.

## Capacidades

- Generacion de texto conversacional en japones e ingles, con calidad verificada por inspeccion en el caso del japones.
- Razonamiento matematico basico: 65 % en GSM8K con la cuantizacion int8 (n=100, greedy, 0-shot CoT) y 55 % con int4.
- Tool calling y function calling, gracias a la plantilla de chat completa incluida en el fichero.
- Inferencia totalmente on-device, sin conexion de red, en Android, macOS, iOS y Linux (Raspberry Pi).
- Ejecucion en CPU en todos los ficheros y en GPU (OpenCL en Android, Metal en iOS, macOS) en las variantes `_gpu`.
- Soporte de conversaciones multi-turno dentro de la ventana de 4.096 tokens.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional japones sin conexion en Android: el fichero int8 alcanza 41,3 tok/s de decodificacion y 450 ms de TTFT en la CPU de un Galaxy S26, suficiente para un chat fluido sin enviar datos a la nube.
- Traduccion y asistencia linguistica japones-ingles en el dispositivo: el modelo esta afinado para japones natural y conserva competencia en ingles, lo que permite integraciones de traduccion local en apps de mensajeria.
- Atencion al cliente en kioscos o terminales de punto de venta: el soporte de tool calling permite conectar el modelo a APIs locales (consultas de pedidos, disponibilidad) sin salida a Internet, con la ventana de 4.096 tokens para conversaciones de varios turnos.
- Automatizacion en Raspberry Pi 5: con 9,2 tok/s de decodificacion y 4,83 s de TTFT en el fichero int4, es viable para tareas de resumen, clasificacion y respuestas cortas en domotica o prototipos de robotica.
- Prototipado rapido con AI Edge Gallery: basta importar el `.litertlm` en la aplicacion para probar el modelo en un telefono, lo que sirve para validar ideas de producto antes de invertir en infraestructura.
- Aplicaciones iOS con Metal: el fichero `_int4_gpu` se ha verificado en iOS Metal, util para asistentes embebidos en apps nativas de Apple; debe configurarse `maxNumTokens` a 1024 para evitar fallos de creacion del motor.
- Educacion y tutoria de matematicas basicas: el 65 % en GSM8K con int8 permite resolver problemas aritmeticos de primaria y secundaria en local, con explicaciones paso a paso mediante CoT.

## Benchmarks y rendimiento

Resultados publicados en la model card (GSM8K en ingles, greedy, 0-shot CoT, max-tokens 1024, n=100, mismo harness para todas las filas):

| Modelo / formato | GSM8K |
|---|---|
| PyTorch bf16 (referencia) | 63 % |
| LiteRT int8 | 65 % |
| LiteRT int4 | 55 % |
| LiteRT int8 `_gpu` | 65 % (medido frente a frente con int8) |
| LiteRT int4 `_gpu` | igual que int4 |

Mediciones en dispositivo:

| Dispositivo | Fichero | Backend | Decode | Prefill | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 | int8 | CPU | 41,3 tok/s | 485 tok/s | 450 ms |
| Galaxy S26 | int4 | CPU | no ejecutado (fallo de creacion del motor) | - | - |
| Raspberry Pi 5 (4 hilos) | int8 | CPU | 7,0 tok/s | 75 tok/s | 3,56 s |
| Raspberry Pi 5 (4 hilos) | int4 | CPU | 9,2 tok/s | 54 tok/s | 4,83 s |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: 736 MB para los ficheros int4 y 1,24 GB para los int8; no requiere GPU dedicada en las variantes CPU.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; las variantes `_gpu` se han verificado en GPU integrada de Android (OpenCL), macOS y iOS (Metal).
- Cabe en hardware de consumo: si, en telefonos Android (Galaxy S26 verificado), iPhone (con `maxNumTokens` a 1024) y Raspberry Pi 5; tambien en CPU de portatil, donde la model card cita ~100 tok/s en CPU de portatil para el modelo base.
- Despliegue: exclusivamente mediante el runtime LiteRT-LM (litert-lm >= 0.15, recomendado >= 0.16.0 para GPU) o la app AI Edge Gallery; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no distribuirse pesos en safetensors o GGUF.
- Latencia y throughput: ver tabla de la seccion anterior; el TTFT varia entre 450 ms en Galaxy S26 y 3,56-4,83 s en Raspberry Pi 5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/LFM2.5-1.2B-JP (este) | 1,2B | 4.096 | `.litertlm` | LFM Open License v1.0 | Optimizado para japones, on-device, tool calling |
| litert-community/LFM2.5-1.2B-Instruct | 1,2B | no disponible | `.litertlm` | LFM Open License v1.0 | Hermano en ingles; la cuantizacion int8 de convoluciones no degrada en el |
| LiquidAI/LFM2.5-1.2B-JP | 1,2B | no disponible | safetensors (formato original) | LFM Open License v1.0 | Pesos originales en bf16; referencia de precision (63 % GSM8K) |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- La ventana de contexto esta limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- El modelo esta afinado para japones e ingles; su rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Riesgo de alucinacion inherente a un modelo de 1,2B: el 65 % en GSM8K implica que aproximadamente uno de cada tres problemas matematicos se resuelve mal.
- Bug conocido en litert-lm 0.18.0: al iniciar una nueva conversacion en un motor que ya ejecuto otra, el runtime reutiliza el estado de convolucion corta de la conversacion anterior sin reiniciarlo. La recomendacion es crear un motor nuevo por conversacion. El fallo esta corregido en la rama principal desde el 2026-11-03 (commit e1f86b05), pero ninguna version publicada lo incluye aun (v0.19.1 no lo lleva).
- En iOS es obligatorio fijar `maxNumTokens` a 1024; un valor distinto rompe la creacion del motor.
- El fichero int4 fallo al arrancar en la GPU del Galaxy S26 (`engine_create_failed`) con litert-lm 0.16.0.
- La licencia LFM Open License v1.0 no es una licencia open source estandar; deben revisarse sus terminos antes de un uso comercial.
- El repositorio no incluye pesos en safetensors ni GGUF, lo que impide usarlo fuera del ecosistema LiteRT-LM.
- La cuantizacion int8 de este tune japones no puede extenderse a las convoluciones sin perder unos 9 puntos porcentuales, lo que limita reducciones adicionales de tamano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM2.5-1.2B-JP
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP
- Hermano Instruct en LiteRT: https://huggingface.co/litert-community/LFM2.5-1.2B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Commit con la correccion del bug de conversaciones: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Informe del bug: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Ficha de medicion int4: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-jp-int4/CARD.md
- Ficha de medicion int8: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-jp-int8/CARD.md
- Medicion de fidelidad de conversion LiteRT: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
