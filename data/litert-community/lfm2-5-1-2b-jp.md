# litert-community/LFM2.5-1.2B-JP

## Resumen

LFM2.5-1.2B-JP es la variante de chat optimizada para japones del modelo insignia de Liquid AI con arquitectura hibrida conv-attention. Se trata de un modelo de 1.200 millones de parametros disenado para conversacion natural en japones que puede ejecutarse completamente en dispositivo, alcanzando aproximadamente 100 tok/s en la CPU de un portatil. El repositorio `litert-community/LFM2.5-1.2B-JP` no contiene los pesos originales, sino la conversion de dicho modelo al formato LiteRT-LM (`.litertlm`) para inferencia on-device con el runtime LiteRT-LM de Google, sucesor de TensorFlow Lite.

La relevancia de esta ficha radica en que ejemplifica el pipeline de despliegue en el borde: un modelo base de Liquid AI convertido con `litert-torch` (antes `ai-edge-torch`) y empaquetado en cuatro variantes cuantizadas (int8 e int4, cada una con exportacion CPU y GPU) que caben en 736 MB y 1,24 GB respectivamente. El modelo esta pensado para ejecutarse en telefonos Android, iPhone y placas como Raspberry Pi 5, sin conexion de red, con una ventana de contexto de 4096 tokens en la cache KV.

Requiere LiteRT-LM igual o superior a 0.15 (una reempaquetadura de 2026-10-13 exige esa version por el tipo de modelo `lfm2`), y la version 0.18.0 del runtime presenta un defecto conocido al reutilizar un mismo Engine para varias conversaciones. La licencia es la LFM Open License v1.0, que no es de codigo abierto estandar y debe revisarse antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida conv-attention (familia LFM2.5, tipo de modelo `lfm2` en LiteRT-LM) |
| Parametros totales | 1,2 mil millones (1.2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (cache KV maxima) |
| Tipos de cuantizacion | int8 dinamico (lineales + embedding, convoluciones en float); int4 blockwise-32 + OCTAV en lineales, embedding int8, convoluciones float; variantes `_gpu` con las mismas recetas reexportadas para GPU |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | LFM Open License v1.0 (`license: other`) |
| Formato de pesos | `.litertlm` (LiteRT-LM); cuatro ficheros: `_int8` (1,24 GB), `_int4` (736 MB), `_int4_gpu` (736 MB), `_int8_gpu` (1,24 GB) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-1.2B-JP, un transformer hibrido que combina capas convolucionales y de atencion, con 1.200 millones de parametros. La model card del repositorio de conversion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponderia a la model card del modelo base de Liquid AI y no se incluye en la informacion proporcionada. El ajuste declarado es una optimizacion para conversacion natural en japones.

La innovacion tecnica principal de este repositorio es el proceso de conversion y cuantizacion para LiteRT-LM. La conversion con `litert-torch` se valido contra el original con un error de 4e-7 en un Galaxy S26 (LiteRT 2.2.0, Android 16). La cuantizacion int8 aplica solo a lineales y embedding, manteniendo las convoluciones en float: segun la model card, cuantizar las convoluciones de este ajuste cuesta unos 9 puntos, a diferencia del modelo Instruct donde el int8 en convoluciones es gratis. La receta int4 usa blockwise-32 con OCTAV en lineales. Los ficheros incorporan la seccion `ExecutorMetadata` necesaria desde litert-lm 0.15 para enlazar los buffers de estado hibridos conv/attention. El template de chat va incluido en el fichero y soporta tool calling.

## Capacidades

- Generacion de texto y conversacion multi-turno en japones e ingles.
- Razonamiento matematico basico: 65 % en GSM8K (n=100) con la variante int8, 55 % con int4.
- Tool calling / function calling, segun el template de chat incluido en el fichero.
- Inferencia completamente on-device, sin conexion de red.
- Ejecucion en CPU en todas las variantes; ejecucion en GPU con litert-lm igual o superior a 0.16.0 para `_int4_gpu` (OpenCL en Android, macOS y Metal en iOS) y `_int8_gpu` (OpenCL en Android y macOS; no probado en iOS).
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Chat en japones en aplicaciones moviles sin conexion: el modelo se importa en AI Edge Gallery y responde en la CPU del telefono; en un Galaxy S26 con la variante int8 alcanza 41,3 tok/s de decodificacion y 450 ms hasta el primer token.
- Asistentes de bolsillo en iPhone: con la variante `_int4_gpu` sobre Metal, configurando `maxNumTokens` a 1024 para evitar fallos de creacion del engine.
- Despliegue en dispositivos de placa unica: en Raspberry Pi 5 con 4 hilos de CPU, la variante int8 ofrece 7,0 tok/s de decodificacion y 3,56 s de TTFT, suficiente para interfaces conversacionales por voz con sintesis posterior.
- Traduccion y asistencia de redaccion japones-ingles en herramientas de escritorio offline, aprovechando el soporte bilingue declarado.
- Automatizacion de tareas con tool calling en agentes locales: el template incluido permite invocar funciones desde el dispositivo sin enviar datos a la nube.
- Prototipado de funcionalidades de IA en aplicaciones Android mediante la libreria `com.google.ai.edge.litert:litert`, con un modelo de 736 MB que no requiere servidor.
- Evaluacion comparativa de runtimes en el borde: el repositorio forma parte de la matriz edge-compat, que mide el mismo modelo en LiteRT-LM frente a otros runtimes.

## Benchmarks y rendimiento

| Metrica | bf16 (PyTorch) | int8 LiteRT | int4 LiteRT |
|---|---|---|---|
| GSM8K (ingles, greedy, 0-shot CoT, max 1024 tokens, n=100) | 63 % | 65 % | 55 % |

Mediciones en dispositivo recogidas en la model card:

| Dispositivo | Runtime | Backend | Decode | Prefill | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 (int8) | LiteRT-LM 0.16.0 | CPU | 41,3 tok/s | 485 tok/s | 450 ms |
| Galaxy S26 (int8) | LiteRT-LM 0.16.0 | GPU | fallo: `engine_create_failed` | — | — |
| Galaxy S26 (int4) | LiteRT-LM 0.16.0 | GPU | fallo: `engine_create_failed` | — | — |
| Raspberry Pi 5, 4 hilos (int8) | LiteRT-LM 0.16.1 | CPU | 7,0 tok/s | 75 tok/s | 3,56 s |
| Raspberry Pi 5, 4 hilos (int4) | LiteRT-LM 0.16.1 | CPU | 9,2 tok/s | 54 tok/s | 4,83 s |

La model card advierte que GSM8K en ingles subestima un ajuste optimizado para japones y que esos datos se aportan por transparencia de fidelidad de cuantizacion, no como metrica principal. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: 736 MB para las variantes int4 y 1,24 GB para las int8, mas el estado de la cache KV (contexto maximo de 4096 tokens).
- GPU recomendadas: no se especifican modelos de GPU de escritorio; las pruebas documentadas son en GPU integrada de Galaxy S26 (OpenCL) y en Metal de iOS/macOS.
- Cabe en GPU de consumo: si, por tamano; la model card no documenta pruebas en RTX 4090, A100 ni H100.
- Despliegue: runtime LiteRT-LM (igual o superior a 0.15; 0.16.0 para GPU), AI Edge Gallery en Android, libreria `com.google.ai.edge.litert:litert`.
- Latencia y throughput: ver tabla de benchmarks; en Galaxy S26 con int8 en CPU, 41,3 tok/s de decodificacion y 450 ms de TTFT; en Raspberry Pi 5, entre 7,0 y 9,2 tok/s segun cuantizacion.
- En iOS, fijar `maxNumTokens` a 1024; un valor distinto rompe la creacion del engine.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| litert-community/LFM2.5-1.2B-JP (este) | 1,2B | 4096 | LFM Open License v1.0 | `.litertlm`, LiteRT-LM | Optimizado para japones; 65 % GSM8K en int8 |
| litert-community/LFM2.5-1.2B-Instruct | 1,2B | no disponible | LFM Open License v1.0 | `.litertlm`, LiteRT-LM | Misma familia, ajuste instruct general; segun la model card, el int8 en convoluciones no degrada |
| LiquidAI/LFM2.5-1.2B-JP | 1,2B | no disponible | LFM Open License v1.0 | safetensors (formato inferido del modelo base; no confirmado en la informacion) | Modelo base sin convertir; requiere otro runtime |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia LFM Open License v1.0 es `license: other`, no una licencia de codigo abierto estandar; revisar el fichero LICENSE antes de cualquier uso comercial.
- Ventana de contexto limitada a 4096 tokens en la cache KV, insuficiente para documentos largos o conversaciones muy extensas.
- Solo japones e ingles; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion inherente a un modelo de 1,2B; el 65 % en GSM8K indica que fallara en aproximadamente un tercio de los problemas aritmeticos de ese conjunto.
- Defecto conocido en litert-lm 0.18.0: al reutilizar un Engine para una segunda conversacion no se reinicia el estado de convolucion corta y se reutilizan tokens de prompt compartidos; se recomienda crear un Engine nuevo por conversacion. Existe un arreglo en main desde 2026-11-03.
- En iOS, un `maxNumTokens` distinto de 1024 rompe la creacion del engine.
- En Galaxy S26 con litert-lm 0.16.0, las variantes GPU fallaron con `engine_create_failed`; verificar el soporte GPU antes de desplegar.
- La cuantizacion int4 degrada GSM8K 10 puntos respecto a int8 (55 % frente a 65 %).
- No se documentan sesgos especificos, datos de entrenamiento ni procesos de alineacion en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM2.5-1.2B-JP
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP
- Variante Instruct de la misma familia: https://huggingface.co/litert-community/LFM2.5-1.2B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Incidencia del Engine reutilizado: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Arreglo en main (2026-11-03): https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Version LiteRT-LM v0.20.0: https://github.com/google-ai-edge/LiteRT-LM/
- Medicion de conversion en Galaxy S26: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Ficha edge-compat int4: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-jp-int4/CARD.md
- Ficha edge-compat int8: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-jp-int8/CARD.md
