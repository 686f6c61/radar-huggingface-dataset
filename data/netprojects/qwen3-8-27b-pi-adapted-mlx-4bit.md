# netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit

## Resumen

Qwen3.8-27B-pi-adapted-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-pi-adapted, un ajuste fino mediante LoRA del modelo Qwen/Qwen3.8-27B (27.781.427.952 parametros) orientado a tareas de agente de codificacion y uso de terminal. El adaptador fue entrenado por harness-hub con aprendizaje por refuerzo (AsyncGRPO en TRL) para ser el motor del agente de codificacion pi, y esta version lo fusiona con el modelo base y lo convierte a MLX con mlx-vlm, incluyendo el codificador de vision y la capa de prediccion multi-token (MTP) de Qwen. El resultado es un paquete de 16,3 GB ejecutable en Apple Silicon.

La relevancia de esta build concreta esta en que permite ejecutar localmente en un Mac un modelo de 27.800 millones de parametros especializado en ingenieria de software y operaciones de terminal, con licencia Apache 2.0 y sin dependencia de servicios en la nube. Frente a la version bf16 (55,6 GB), la cuantizacion a 4 bits reduce el peso a 16,3 GB a costa de una fidelidad del 95,6 % en el siguiente token respecto a bf16 y una divergencia KL de 0,0201.

La model card reporta mejoras sustanciales del adaptador sobre el modelo base en tareas de agente con el modo de razonamiento desactivado: Terminal-Bench 2.1 pasa del 39,5 % al 55,8 % y SWE-bench Pro (hard 51) del 29,4 % al 62,7 %, con entre un 55 % y un 64 % menos de llamadas a herramientas por tarea. El autor recomienda no obstante la build de 6 bits como equilibrio entre tamano y fidelidad, y reserva la de 4 bits para equipos con menos memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa de prediccion multi-token (MTP); pesos en MLX |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afina, grupo 64 (esta build); el repositorio del autor ofrece tambien 2,5, 3, 6, 8 bits, bf16 y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx); incluye model-mtp.safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revision 3756181) e incorpora el adaptador LoRA de harness-hub/Qwen3.8-27B-pi-adapted (revision e786f84), fusionado y convertido a MLX mediante mlx-vlm. La conversion conserva el codificador de vision y la capa MTP original de Qwen, cuantizada con la misma precision que el resto de la build; el adaptador no modifica esa capa, por lo que la cabeza MTP es la de Qwen sin alteraciones. El tokenizador y la plantilla de chat son los de harness-hub, sin cambios, con el mismo vocabulario y formato de llamada a herramientas que Qwen3.8-27B.

El adaptador se entreno con aprendizaje por refuerzo usando AsyncGRPO en TRL sobre tareas de ingenieria de software y terminal, con el objetivo de servir de motor al agente pi. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de alineacion. Como innovacion destacable, la build incluye soporte de decodificacion especulativa mediante la capa MTP (usada como draft model pasando el mismo repositorio con `--draft-kind mtp`) y mediante el drafter externo DSpine; ambos verifican cada token propuesto con el modelo completo.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagenes (pipeline image-text-to-text), incluyendo capturas de pantalla de terminal, segun el ejemplo de la model card.
- Codificacion y resolucion de bugs en repositorios, con entrenamiento especifico en tareas de ingenieria de software.
- Uso de terminal y ejecucion de comandos como agente (Terminal-Bench 2.1).
- Llamada a herramientas en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Integracion con el agente pi mediante API compatible con OpenAI Chat Completions.
- Decodificacion especulativa con MTP integrado (aceleracion aproximada de 1,8x en esta build) y con el drafter DSpine.
- Modo de razonamiento (thinking) disponible, aunque el adaptador fue entrenado y evaluado con thinking desactivado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Reparacion de tests fallidos en local: el flujo documentado permite lanzar `pi --print "Find out why the tests in tests/test_parser.py fail and fix the bug."` contra el servidor local, de modo que el modelo inspecciona el repositorio, ejecuta comandos y aplica el parche sin salir del Mac.
- Agente de terminal en Apple Silicon: al estar cuantizado a 4 bits y ocupar 16,3 GB, puede servirse con `mlx_lm.server` en un Mac de gama alta y usarse como backend de un agente que ejecuta comandos de shell con menos llamadas a herramientas por tarea (55-64 % menos segun el autor).
- Analisis de capturas de terminal: con mlx-vlm se le puede pasar una imagen de una sesion de terminal y preguntar por el error mostrado, util para diagnostico asistido en soporte tecnico interno.
- Asistente de codigo en el editor o IDE: expuesto como endpoint compatible con OpenAI Chat Completions en el puerto local, se integra en clientes que hablen ese protocolo sin adaptadores adicionales.
- Automatizacion de tareas de refactorizacion acotadas: el entrenamiento en SWE-bench Pro (hard 51) sugiere buen desempeno en parcheo de codigo sobre repositorios reales, adecuado para pipelines internos de revision y correccion.
- Prototipado de agentes de IA sin coste de API: al ser Apache 2.0 y ejecutable en local, sirve para desarrollar y depurar flujos de agente (tool calling, multi-step) antes de desplegarlos contra modelos en la nube.
- Evaluacion comparativa de cuantizaciones: el repositorio del autor publica builds de 2,5 a 8 bits con metricas de fidelidad, lo que permite medir en un mismo Mac el impacto de la precision en tareas de codigo.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador, con el agente pi y thinking desactivado:

| Benchmark | Modelo base | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % |

Fidelidad de la cuantizacion respecto a bf16 (builds del mismo autor):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| 6 bits (recomendada) | 23,1 GB | 99,0 % | 0,0015 |
| 8 bits | 30,0 GB | 99,1 % | 0,0004 |
| 4 bits (esta build) | 16,3 GB | 95,6 % | 0,0201 |
| 3 bits | 13,8 GB | 91,4 % | 0,0884 |
| 2,5 bits (solo texto) | 11,8 GB | 85,5 % | 0,2363 |

Throughput medido por el autor (greedy, thinking off, 5 prompts x 256 tokens de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, con otros servicios en ejecucion en el Mac, por lo que son indicativos):

| Build | Decodificacion simple | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4 bits, bloque 5) |
|---|---|---|---|
| 4 bits | 33 tok/s | 61 tok/s (x1,84) | 70 tok/s (x2,25) |
| 6 bits | 23 tok/s | 22 tok/s (x0,96) | 52 tok/s (x2,32) |
| 8 bits | 18 tok/s | 41 tok/s (x2,24) | 54 tok/s (x3,05) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K para el modelo en si.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 16,3 GB de pesos; con overhead de ejecucion conviene disponer de al menos 24 GB de memoria unificada para contexto moderado.
- Plataforma: exclusivamente Apple Silicon (formato MLX); no es ejecutable en GPU NVIDIA ni en CPU x86 con este paquete.
- Macs compatibles: segun el autor, las builds de 3 y 2,5 bits caben en Macs de 24 GB; la de 4 bits requiere un equipo con mas memoria (Mac Studio o MacBook Pro de gama alta). El dato exacto de memoria minima para 4 bits no se especifica.
- Despliegue: `mlx_lm.server` (servidor compatible con OpenAI) para texto; `mlx_vlm.generate` para inferencia con imagenes; requiere mlx-lm >= 0.32.2 y mlx-vlm >= 0.7.11.
- Aceleracion: MTP integrado sin descarga adicional (aproximadamente 1,8x en esta build); DSpine con dspine-hybrid-mlx como alternativa (hasta 2,25x en esta build).
- Throughput de referencia: 33 tok/s en decodificacion simple y 61 tok/s con MTP en la build de 4 bits, medidos por el autor en condiciones no controladas.
- No disponible: requisitos para vLLM, llama.cpp, Ollama o TGI, que no soportan este formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit | 27,78 B | no disponible | MLX 4 bits, 16,3 GB | Apache 2.0 | Esta build; 95,6 % de fidelidad vs bf16 |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 27,78 B | no disponible | MLX 6 bits, 23,1 GB | Apache 2.0 | Recomendada por el autor; 99,0 % de fidelidad |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit | 27,78 B | no disponible | MLX 8 bits, 30,0 GB | Apache 2.0 | La mas cercana a bf16 (99,1 %) |
| Qwen/Qwen3.8-27B | 27,78 B | no disponible | safetensors bf16 | no disponible en la informacion | Modelo base sin el ajuste para pi; 39,5 % en Terminal-Bench 2.1 y 29,4 % en SWE-bench Pro |

No se dispone de datos sobre modelos comparables de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con el modo thinking desactivado; el autor recomienda mantenerlo apagado, por lo que activarlo puede degradar el comportamiento esperado.
- La cuantizacion a 4 bits reduce la fidelidad al 95,6 % en el siguiente token y una KL de 0,0201 frente a bf16; el autor recomienda la build de 6 bits para un mejor equilibrio.
- Con decodificacion especulativa y greedy, el texto puede divergir ligeramente del decoding simple en situaciones de casi empate, ya que la verificacion por lotes puede redondear al otro lado.
- Dependencia exclusiva del ecosistema MLX y de hardware Apple Silicon; no hay pesos GGUF ni compatibilidad con vLLM, llama.cpp u Ollama en este repositorio.
- El adaptador espera la API Chat Completions de OpenAI, no la API Responses; usar esta ultima puede romper el formato de llamada a herramientas.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni limitaciones por idioma; los idiomas soportados figuran como no disponibles.
- Los benchmarks reportados (Terminal-Bench 2.1 y SWE-bench Pro) provienen del autor del adaptador y no de una evaluacion independiente.
- Las mediciones de throughput se tomaron con otros servicios en ejecucion en el mismo Mac y el propio autor las califica de indicativas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador original antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA para mlx-lm: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
