# netprojects/Qwen3.8-27B-opencode-MLX-6bit

## Resumen

Qwen3.8-27B-opencode-MLX-6bit es una cuantizacion de 6 bits en formato MLX del adaptador LoRA `harness-hub/Qwen3.8-27B-opencode-adapted`, fusionado sobre el modelo base `Qwen/Qwen3.8-27B` y convertido con mlx-vlm para su ejecucion en Apple Silicon. El modelo resultante esta especializado como motor del agente de programacion OpenCode, orientado a tareas de ingenieria de software y de terminal. El autor de la cuantizacion es el usuario `netprojects`; el entrenamiento del adaptador corresponde a `harness-hub`.

La relevancia de esta ficha reside en que empaqueta un modelo de 27.781 millones de parametros en 23,1 GB, lo que permite ejecutarlo localmente en Macs de 48 GB de memoria unificada con una fidelidad del 98,7 % en coincidencia de siguiente token respecto a bf16 y una divergencia KL de 0,0014. El adaptador fue entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) para mejorar el comportamiento agéntico, y segun los resultados publicados por el autor del adaptador eleva SWE-bench Pro (hard 51) del 35,3 % al 51,0 % y Terminal-Bench 2.1 del 46,4 % al 52,4 % respecto al modelo base, operando con el modo de razonamiento (thinking) desactivado.

La arquitectura subyacente es la de Qwen3.8-27B, un transformer multimodal con codificador de vision y una capa MTP (multi-token prediction) que se conserva en esta conversion. El pipeline declarado es image-text-to-text, por lo que admite entradas de imagen ademas de texto. La licencia es Apache 2.0 y el tokenizador y la plantilla de chat son los originales de Qwen3.8-27B, sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B) con codificador de vision y capa MTP, cuantizado en MLX |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afina (affine), group size 64; existen builds de 3, 4, 8 bits y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx / mlx-vlm) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal con codificador de vision y una capa de prediccion multi-token (MTP) que se incluye en la conversion. Sobre ese modelo base, `harness-hub` entreno un adaptador LoRA mediante aprendizaje por refuerzo con AsyncGRPO en TRL, con el objetivo de convertirlo en el modelo que opera detras del agente de programacion OpenCode en tareas de ingenieria de software y de terminal. La fusion del adaptador (revision `b4171c0`) sobre el modelo base (revision `3756181`) y la conversion a MLX se realizaron con mlx-vlm.

La cuantizacion de este build aplica 6 bits afina con grupo de 64 sobre las capas lineales, lo que reduce el peso a 23,1 GB. Segun la model card, el 98,7 % de los siguientes tokens coinciden con la version bf16 y la divergencia KL frente a bf16 es de 0,0014, lo que situa este build como el equilibrio recomendado entre tamano y fidelidad. El tokenizador y la plantilla de chat son los archivos originales de `harness-hub`, sin cambios, de modo que se conserva el mismo vocabulario y el mismo formato de tool calls que Qwen3.8-27B. El adaptador se entreno y evaluo con thinking desactivado.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Generacion y edicion de codigo, con especializacion en tareas de ingenieria de software (resolucion de bugs, modificacion de repositorios, ejecucion de tests).
- Operacion como agente de terminal: interpretacion de salidas de comandos, diagnostico de errores y aplicacion de correcciones en un bucle multi-paso.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como tool calls compatibles con la API de OpenAI.
- Entrada de imagen (image-text-to-text) mediante mlx-vlm, por ejemplo para interpretar capturas de pantalla de terminales o interfaces.
- Soporte de modo thinking (razonamiento extendido) a traves de la plantilla de chat, aunque el adaptador fue entrenado y evaluado con thinking desactivado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de programacion local con OpenCode: el modelo se sirve con `mlx_lm.server` y se conecta como proveedor compatible con OpenAI; es adecuado porque el adaptador fue entrenado especificamente para el bucle de herramientas de OpenCode y mantiene el formato de tool calls de Qwen.
- Resolucion de fallos en suites de tests: dado un mensaje como "averigua por que fallan los tests de tests/test_parser.py y corrige el bug", el modelo inspecciona el repositorio, ejecuta comandos y aplica parches; los resultados publicados en SWE-bench Pro (51,0 %) respaldan este escenario.
- Automatizacion de tareas de terminal: interpretacion de errores de shell, diagnostico de entornos y ejecucion de secuencias de comandos, con el respaldo de Terminal-Bench 2.1 (52,4 %).
- Asistencia de codigo en el editor con backend local: al exponer un endpoint compatible con OpenAI en el puerto 8000, puede conectarse a clientes que hablen ese protocolo sin enviar codigo a servicios externos.
- Analisis de capturas de pantalla tecnicas: con mlx-vlm se le puede pasar una imagen de una terminal o de una interfaz y preguntar por el error mostrado, util para depuracion asistida.
- Prototipado y evaluacion de agentes en Apple Silicon: sirve como banco de pruebas local para medir latencia, consumo de memoria y calidad de tool calling antes de desplegar en infraestructura mayor.
- Generacion de codigo en flujos con requisitos de privacidad: al ejecutarse integramente en el Mac, el codigo y los prompts no salen del equipo, lo que encaja con entornos con restricciones de confidencialidad.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (`harness-hub`), medidos bajo OpenCode y con thinking desactivado, comparando el adaptador frente al modelo base:

| Benchmark | Modelo base | Adaptador opencode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de la cuantizacion de este build (6 bits) frente a bf16:

| Metrica | Valor |
|---|---|
| Coincidencia de siguiente token con bf16 | 98,7 % |
| Divergencia KL frente a bf16 | 0,0014 |
| Tamano | 23,1 GB |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar para este build.

## Requisitos de hardware

- Memoria: 23,1 GB de pesos; el autor recomienda este build para Macs de 48 GB de memoria unificada, dejando margen para macOS y prompts largos (la descarga supone como maximo en torno al 60 % de la memoria).
- Macs de 24 GB: build de 3 bits (13,8 GB) o GGUF Q3_K_M (13,5 GB).
- Macs de 32 GB: build de 4 bits (16,3 GB) o GGUF Q4_K_M (16,8 GB).
- Macs de 64 GB o mas: build de 8 bits (30,0 GB) o GGUF Q8_0 (29,0 GB).
- Macs de 128 GB: build bf16 de referencia (55,6 GB).
- Macs de 16 GB: solo como opcion ajustada, con GGUF IQ2_M (10,2 GB); el autor sugiere cerrar aplicaciones y elevar el limite de memoria cableada de la GPU con `sudo sysctl iogpu.wired_limit_mb=12800`.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles para este formato; el build esta empaquetado para MLX sobre Apple Silicon.
- Despliegue: `mlx-lm>=0.32.2` con `mlx_lm.server` (servidor compatible con OpenAI) para texto; `mlx-vlm>=0.7.11` para inferencia con imagenes; tambien utilizable desde LM Studio en su modo MLX. Existen builds GGUF del mismo autor para llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa entre los distintos builds del mismo modelo, segun los datos del autor:

| Build | Tamano | Coincidencia siguiente token con bf16 | KL vs bf16 | Mac objetivo |
|---|---|---|---|---|
| MLX 3-bit | 13,8 GB | 93,4 % | 0,0812 | 24 GB |
| MLX 4-bit | 16,3 GB | 96,7 % | 0,0203 | 32 GB |
| MLX 6-bit (este) | 23,1 GB | 98,7 % | 0,0014 | 48 GB |
| MLX 8-bit | 30,0 GB | 99,2 % | 0,0004 | 64 GB o mas |
| MLX bf16 | 55,6 GB | referencia | referencia | 128 GB |
| MLX adapter (LoRA) | 638 MB | no aplica | no aplica | cualquiera con Qwen3.8-27B MLX |

Comparativa con alternativas de la misma categoria (modelos de codigo de ~27B para agentes):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-opencode-MLX-6bit | 27,78 B | no disponible | Apache 2.0 | MLX (Apple Silicon) y GGUF del mismo autor |
| Qwen3.8-27B (base) | no disponible | no disponible | no disponible | Hugging Face (Qwen) |
| Alternativas de ~27B para agentes | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de terceros modelos comparables para establecer una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; el autor recomienda mantenerlo apagado (`--chat-template-args '{"enable_thinking": false}'`). Usarlo con thinking activo puede degradar el comportamiento esperado.
- Es una cuantizacion de 6 bits: aunque la fidelidad es alta (98,7 % de coincidencia de siguiente token, KL 0,0014), no es identica a bf16 y puede acumular pequenas diferencias en tareas largas o muy sensibles.
- Especifico de Apple Silicon: el formato MLX no es portable a GPU NVIDIA o AMD; para otros entornos hay que recurrir a los builds GGUF o al modelo original.
- Longitud de contexto e idiomas soportados no documentados en la informacion disponible; conviene verificar ambos antes de disenar flujos con prompts largos o requisitos multilingues.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en la generacion de comandos de terminal o parches de codigo; se recomienda ejecutar en entornos aislados y con revision humana.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial; aun asi, el modelo deriva de Qwen3.8-27B y del adaptador de `harness-hub`, por lo que conviene revisar las condiciones de ambos artefactos originales.
- El rendimiento publicado (SWE-bench Pro, Terminal-Bench) corresponde al adaptador medido bajo OpenCode; no garantiza los mismos resultados en otros agentes o configuraciones.
- El repo tiene 180 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-6bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build MLX 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Build MLX 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Build MLX bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA en MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Builds GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- OpenCode: https://opencode.ai
- Catalogo de modelos del autor: https://huggingface.co/netprojects
