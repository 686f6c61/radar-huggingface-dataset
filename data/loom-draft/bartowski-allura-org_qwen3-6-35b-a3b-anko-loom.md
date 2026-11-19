# loom-draft/bartowski-allura-org_Qwen3.6-35B-A3B-Anko-loom

## Resumen

`loom-draft/bartowski-allura-org_Qwen3.6-35B-A3B-Anko-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/allura-org_Qwen3.6-35B-A3B-Anko-GGUF`, en su cuantizacion Q4_K_M. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado orientado a ejecutar ese GGUF sobre GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` y se ha generado con la herramienta `loom-next`, sin intervencion de un LLM en el proceso.

El modelo subyacente, segun la nomenclatura del checkpoint de origen, es un Qwen3.6 de 35B parametros totales con 3B activos (variante MoE, indicada por el sufijo `A3B`), afinado por `allura-org` bajo el nombre "Anko". La pipeline declarada es `image-text-to-text`, es decir, entrada multimodal de imagen y texto, con un proyector separado `mmproj-allura-org_Qwen3.6-35B-A3B-Anko-bf16.gguf`. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es acotada y conviene entenderla bien: el interes no esta en el modelo en si, sino en el ecosistema Loom como alternativa de inferencia nativa en ROCm para hardware AMD de consumo y estacion de trabajo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0.0 GB (los pesos no estan alojados aqui) y las mediciones de rendimiento y las puertas de correccion aparecen como "not yet re-measured" en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.6; MoE segun el sufijo `A3B` del checkpoint de origen) |
| Parametros totales | 35B (segun el nombre del checkpoint de origen) |
| Parametros activos | 3B (segun el sufijo `A3B` del checkpoint de origen) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este paquete); proyector multimodal en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`allura-org_Qwen3.6-35B-A3B-Anko-Q4_K_M.gguf`) empaquetado como programa Loom; proyector `mmproj-allura-org_Qwen3.6-35B-A3B-Anko-bf16.gguf` |

Otros parametros operativos declarados en la tarjeta:

| Parametro | Valor |
|---|---|
| Peticiones concurrentes | 4 |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |
| Modo thinking | Activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}` |
| Decodificacion especulativa | No aplicable |
| Reasoning effort | No aplicable |
| Entrada de audio | No soportada |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. El identificador del checkpoint de origen (`Qwen3.6-35B-A3B`) apunta a un transformer con mezcla de expertos de 35B parametros totales y 3B activos por token, pero esta ficha no puede confirmar capas, numero de expertos, atencion ni esquema de enrutamiento porque la model card del paquete Loom no los detalla. Tampoco se documentan aqui los datos de entrenamiento, el volumen de tokens, la composicion del corpus ni si hubo RLHF, DPO u otra etapa de alineamiento: todo ello corresponde al checkpoint original de `allura-org` y a `bartowski`, no a este paquete.

Lo que si describe la tarjeta es la capa de despliegue. Loom compila programas especificos para el objetivo AMD (`gfx1151` para Strix Halo, `gfx1201` para R9700) y expone un servidor compatible con la API de chat completions de OpenAI. El paquete incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, con tokens greedy y top-5 log-probs en prompts cortos y documentos de 1k a 32k. En el momento de la consulta, todas esas puertas figuran como "not yet re-measured" para ambas GPUs, de modo que la equivalencia funcional con llama.cpp esta declarada como objetivo de diseno pero no verificada en esta publicacion.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y desactivable por peticion.
- Entrada de imagen junto a texto (`image_url` en estilo OpenAI), mediante el proyector bf16 incluido.
- Tool calling en estilo OpenAI, con campos `tools` y `tool_calls`.
- Bucles de agente multi-turno con reutilizacion de historial, cubiertos por las puertas `agent` y `agent_think_off`.
- Contexto largo de hasta 262.144 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Compatibilidad con clientes que hablan la API de chat completions de OpenAI mediante `curl` o SDK estandar.
- Sin soporte de audio ni de salida de audio.
- Sin decodificacion especulativa ni ajuste de esfuerzo de razonamiento.

## Casos de uso

- Analisis de documentos extensos: con 262.144 tokens de contexto por peticion se pueden ingerir contratos, informes o expedientes completos sin trocear, y formular preguntas sobre el conjunto en una sola llamada.
- Procesamiento de documentacion tecnica con imagenes: diagramas de arquitectura, capturas de pantalla o figuras de un manual pueden enviarse como partes `image_url` junto al texto de la consulta, lo que sirve para soporte de producto o generacion de documentacion asistida.
- Agentes de automatizacion con herramientas: el soporte de `tools` y `tool_calls` permite construir asistentes que consultan APIs internas, bases de datos o sistemas de tickets, con el bucle multi-turno validado por las puertas de agente del paquete.
- Asistente de razonamiento por lotes: el modo thinking por defecto resulta adecuado para tareas de analisis, clasificacion razonada o extraccion estructurada donde la latencia no es critica y prima la calidad de la respuesta; puede desactivarse para consultas simples.
- Despliegue en estacion de trabajo AMD: al estar empaquetado para Radeon AI PRO R9700 (32 GB) y Strix Halo, encaja en entornos con hardware AMD ROCm donde no se quiere depender de CUDA ni de llama.cpp como servidor.
- Servicio interno de chat multimodal de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida maxima, es apto para equipos pequenos o uso departamental con API compatible con OpenAI, sin necesidad de reescribir clientes existentes.
- Evaluacion comparativa de motores de inferencia: las puertas de correccion contra llama.cpp lo convierten en una pieza util para medir fidelidad numerica de un runtime alternativo sobre el mismo GGUF.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K ni equivalentes). Tampoco incluye mediciones de rendimiento del paquete: tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201, 32 GB) indica literalmente que los resultados "are not yet re-measured".

| Medicion | Strix Halo (gfx1151) | Radeon AI PRO R9700 (gfx1201) |
|---|---|---|
| Rendimiento vs llama.cpp | no disponible (no re-medido) | no disponible (no re-medido) |
| Puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) | no disponible (no re-medidas) | no disponible (no re-medidas) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El paquete se publica en Q4_K_M para un modelo de 35B parametros totales; a razon de aproximadamente 4,5 bits por peso mas sobrecarga, el peso de los tensores ronda los 20 GB, a lo que se suma el proyector bf16 y el pool de memoria del runtime. La cifra exacta no aparece en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPU compatibles.
- Cabe en GPU de consumo: no confirmado. La unica GPU de consumo cercana citada es el iGPU de Strix Halo, que el paquete soporta explicitamente; no hay lista de GPUs de escritorio verificadas.
- Despliegue: exclusivamente mediante el stack Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete concreto, aunque llama.cpp se usa como referencia de correccion.
- Opciones de arranque relevantes: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU, consume CPU), `--pool_backing=fixed` (reserva el pool por adelantado) y `--parameter_mode=preload` (afecta solo a la carga de pesos en host).
- Latencia y throughput: no disponibles; la tarjeta indica que las mediciones estan pendientes de rehacer.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este paquete, de modo que la comparativa se limita a parametros estructurales y disponibilidad. Las alternativas se identifican por categoria (MoE de ~35B con ~3B activos, licencia permisiva), no por medicion directa.

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Qwen3.6-35B-A3B-Anko (este paquete, Q4_K_M) | 35B / 3B | 262.144 tokens | Apache 2.0 | GGUF empaquetado para Loom; solo AMD gfx1151 y gfx1201 |
| `bartowski/allura-org_Qwen3.6-35B-A3B-Anko-GGUF` (checkpoint de origen) | 35B / 3B | no disponible en esta ficha | Apache 2.0 | GGUF generico; ejecutable con llama.cpp y derivados |
| Alternativas MoE de ~30-40B con pocos parametros activos | no disponible | no disponible | no disponible | no disponible |

La diferencia practica entre este paquete y su checkpoint de origen no es de calidad ni de tamano, sino de runtime: el paquete Loom fija objetivos de compilacion para dos GPUs AMD y anade puertas de correccion, mientras que el GGUF de `bartowski` es portable a cualquier motor compatible con GGUF.

## Limitaciones y advertencias

- El repositorio no contiene los pesos (tamano de 0.0 GB): es un paquete de programas y metadatos que referencia el GGUF de origen. Sin acceso a ese checkpoint, el paquete no es funcional.
- Cero descargas y cero likes, creado y actualizado el mismo dia (2026-11-19): no hay evidencia de uso en produccion ni validacion por terceros.
- Todas las puertas de correccion y las mediciones de rendimiento figuran como no re-medidas; la equivalencia con llama.cpp no esta verificada en esta publicacion.
- Soporte de hardware restringido a Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201). No hay garantia de funcionamiento en otras GPU AMD ni en NVIDIA.
- Dependencia del stack Loom (`hrx-loom==0.2.0`), un ecosistema joven con un unico mantenedor visible; el riesgo de mantenimiento y de compatibilidad futura es alto.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens por peticion, lo que restringe escenarios de alto trafico o de generacion muy larga.
- La opcion recomendada `completion_spin_ns=4294967295` activa espera activa y consume CPU mientras hay trabajo en GPU; conviene medir su impacto en el host antes de adoptarla.
- No se documentan sesgos, comportamiento multilingue ni tasas de alucinacion del modelo base; al ser un derivado de Qwen3.6 cabe esperar los sesgos del modelo original, pero no hay evaluacion publicada en esta informacion.
- Licencia Apache 2.0 declarada, permisiva para uso comercial, pero la cadena de modelos base (`allura-org`, `bartowski`) deberia verificarse en sus respectivas fichas antes de un despliegue comercial.
- El campo `sampling` figura como "not determined" en la tabla de caracteristicas, y la puerta `sampling` no esta re-medida: el comportamiento de temperatura, top_k y semilla no esta confirmado.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/bartowski-allura-org_Qwen3.6-35B-A3B-Anko-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/allura-org_Qwen3.6-35B-A3B-Anko-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

Nota: las busquedas web realizadas devolvieron unicamente resultados sobre Loom (la herramienta de grabacion de pantalla de Atlassian) y la marca de ropa Loom, sin relacion con este paquete. No se han encontrado papers, blogs ni demos adicionales sobre el modelo o su runtime.
