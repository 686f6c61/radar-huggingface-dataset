# loom-draft/bartowski-krystofmitka_ThinkingNuke-gemma-4-26B-A4B-loom

## Resumen

`loom-draft/bartowski-krystofmitka_ThinkingNuke-gemma-4-26B-A4B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `krystofmitka_ThinkingNuke-gemma-4-26B-A4B-Q4_K_M.gguf`, publicado originalmente por bartowski. No se trata de un modelo nuevo ni de un fine-tune propio: es una distribucion optimizada para ejecutar ese GGUF concreto sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB), generada con la herramienta `loom-next` sin intervencion de un LLM en el bucle.

El modelo subyacente es un Gemma de cuarta generacion con arquitectura MoE de 26B parametros totales y 4B parametros activos (el sufijo "A4B" del nombre), destilado por krystofmitka con un ajuste orientado a razonamiento y modo "thinking" (ThinkingNuke). El paquete Loom anade el valor de un runtime especifico para ROCm que, segun las mediciones del autor, supera a llama.cpp ROCm en decodificacion y prefill sobre Strix Halo.

La relevancia actual es doble: por un lado, ofrece una via de ejecucion afinada para hardware AMD de consumo y workstation (APU Strix Halo y R9700) en un ecosistema dominado por CUDA; por otro, documenta con mediciones reproducibles (medianas de 3 sesiones, mismo runner y mismos prompts) el rendimiento comparado frente a llama.cpp, algo poco habitual en paquetes de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Gemma 4); el paquete Loom no redefine la arquitectura |
| Parametros totales | 26B (segun el nombre del checkpoint) |
| Parametros activos | 4B (sufijo A4B del checkpoint) |
| Longitud de contexto | 65.536 tokens en la configuracion de llama.cpp medida (`-c 65536`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M), empaquetado como paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo base: no se detallan el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. Lo unico inferible del nombre es que se trata de un Gemma 4 con mezcla de expertos de 26B totales y 4B activos, ajustado por krystofmitka bajo el nombre ThinkingNuke, lo que sugiere un entrenamiento orientado a razonamiento con modo de pensamiento explicito (la plantilla de chat acepta `enable_thinking`).

La innovacion tecnica del paquete reside en el runtime, no en los pesos. Loom sirve el GGUF con espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), pool de memoria fijado por adelantado (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). Las mediciones se hicieron sin decodificacion especulativa en ambos motores, ya que el GGUF no incluye cabeza MTP ni existe un drafter publicado para este modelo exacto. El paquete incluye dos presets: `chat` para Strix Halo y `chat-r9700` para la R9700.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento opcional, controlable por peticion mediante `chat_template_kwargs.enable_thinking`.
- Conversacion multi-turno via API compatible con OpenAI (`/v1/chat/completions`).
- Servicio concurrente: el preset soporta multiples flujos en paralelo (medido con 4 streams).
- Procesamiento de prompts largos: se midio prefill con documentos de hasta 32k tokens.
- Capacidades de codigo, matematicas, tool calling, agentes o vision: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Inferencia local en APU Strix Halo: un equipo con Ryzen AI Max+ 395 puede servir el modelo con `loom-serve` a 55,9 tok/s de decodificacion en prompt corto, suficiente para asistentes interactivos sin GPU dedicada.
- Despliegue en workstation R9700: la variante `chat-r9700` esta pensada para la Radeon AI PRO R9700 de 32 GB, adecuada para entornos de desarrollo que ya trabajan con ROCm.
- Procesamiento de documentos largos: con 2.136 tok/s de prefill en documentos de 1k tokens y 1.575 tok/s en 32k, es viable resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Servicio multiusuario ligero: los 142,6 tok/s agregados con 4 streams permiten atender a varios clientes concurrentes en una sola maquina sin degradacion severa.
- Razonamiento con traza explicita: el modo thinking activable por peticion sirve para tareas de analisis donde se quiere inspeccionar el razonamiento intermedio, y desactivarlo reduce latencia y coste en consultas simples.
- Evaluacion comparativa de runtimes AMD: el paquete incluye metodologia y datos frente a llama.cpp ROCm, por lo que sirve como base reproducible para medir el impacto de Loom en un pipeline existente.
- Prototipado con API OpenAI-compatible: al exponer `/v1/chat/completions`, se integra con clientes y frameworks existentes sin adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos son de rendimiento de inferencia sobre Strix Halo (gfx1151), medidos el 2026-11-26 con hrx-loom 0.2.0 frente a llama.cpp ROCm b1374, mismo GGUF, mismos prompts, mediana de 3 sesiones:

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 50,1 | 55,9 | +12 % |
| Decode tok/s, contexto 2k | 43,8 | 52,0 | +19 % |
| Decode tok/s, contexto 32k | 38,3 | 44,3 | +16 % |
| Prefill tok/s, documento 1k | 1209,0 | 2136,3 | +77 % |
| Prefill tok/s, documento 2k | 1275,0 | 2206,8 | +73 % |
| Prefill tok/s, documento 8k | 1256,1 | 2096,1 | +67 % |
| Prefill tok/s, documento 16k | 1117,1 | 1882,1 | +68 % |
| Prefill tok/s, documento 32k | 899,5 | 1575,7 | +75 % |
| 4 streams, decode agregado | 124,1 | 142,6 | +15 % |

Argumentos de llama.cpp: `-ngl 99 -cram 0 -c 65536 -np 1`. Los resultados de la R9700 aparecen truncados en la model card y no se incluyen. El roofline no se calculo.

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de 26B totales ronda los 16 GB, pero la informacion proporcionada no da la cifra exacta; el preset `chat-r9700` esta dimensionado para 32 GB.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se confirma soporte para RTX 4090 ni otras GPU consumer; el paquete es especifico de ROCm sobre el hardware listado.
- Despliegue: `hrx-loom[hf]==0.2.0` via pipx, con `loom-fetch` para descargar y `loom-serve` para servir; expone API compatible con OpenAI en el puerto 8080.
- Throughput medido en Strix Halo: 55,9 tok/s de decode en corto, 44,3 tok/s a 32k de contexto, 142,6 tok/s agregados con 4 streams.
- Latencia y throughput en R9700: no disponibles (datos truncados en la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este paquete (ThinkingNuke Gemma 4 26B-A4B) | 26B totales / 4B activos | 65.536 en la config medida | MIT | GGUF Q4_K_M + Loom | Runtime afinado para Strix Halo y R9700 |
| bartowski/krystofmitka_ThinkingNuke-gemma-4-26B-A4B-GGUF | 26B totales / 4B activos | no disponible | MIT | GGUF | Mismo checkpoint sin empaquetado Loom; ejecutable con llama.cpp |
| Modelos comparables de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No hay datos en la informacion proporcionada |

La unica comparacion con datos medidos es frente a llama.cpp ROCm ejecutando el mismo GGUF, recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- El paquete esta restringido a dos GPU AMD concretas (gfx1151 y gfx1201); no hay evidencia de funcionamiento en CUDA, otras Radeon o CPU.
- Solo se distribuye la cuantizacion Q4_K_M; no hay variantes Q5, Q6, Q8 ni FP16 en este paquete.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar materializados en el repo o que el paquete es reciente.
- Las mediciones de rendimiento se hicieron en runners de DevLab que cambian entre sesiones, y el propio autor advierte de un ruido de +-3 % en el mismo runner.
- No hay datos de benchmarks de calidad, sesgos, tasas de alucinacion ni comportamiento multilingue del modelo base en la informacion disponible.
- La licencia MIT del paquete no garantiza que los terminos del modelo Gemma subyacente no impongan condiciones adicionales; conviene verificar la licencia del checkpoint original antes de uso comercial.
- El modo thinking debe desactivarse explicitamente por peticion (`enable_thinking: false`) si se busca minima latencia; por defecto el ejemplo de la model card lo desactiva.
- No se midio decodificacion especulativa: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-krystofmitka_ThinkingNuke-gemma-4-26B-A4B-loom
- Checkpoint base en Hugging Face: https://huggingface.co/bartowski/krystofmitka_ThinkingNuke-gemma-4-26B-A4B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45875485619
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
