# netprojects/Qwen3.8-27B-opencode-adapted-GGUF

## Resumen

Qwen3.8-27B-opencode-adapted-GGUF es una conversión a formato GGUF del modelo harness-hub/Qwen3.8-27B-opencode-adapted, que a su vez es un LoRA fusionado sobre Qwen/Qwen3.8-27B. El resultado es un modelo de 27.320.697.856 parámetros (unos 27,3 mil millones) pensado para su uso como agente de programación dentro de OpenCode, un agente de codificación de terminal. La conversión la firma el usuario netprojects y está publicada bajo licencia Apache 2.0.

El interés principal del modelo es que el adaptador original se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) para tareas de ingeniería de software y de terminal, y los resultados publicados por el autor del adaptador muestran mejoras notables frente al modelo base: SWE-bench Pro (hard 51) pasa del 35,3 % al 51,0 % y Terminal-Bench 2.1 del 46,4 % al 52,4 %, todo ello con el modo "thinking" desactivado. Además, con thinking desactivado iguala al modelo base con thinking a máximo esfuerzo generando aproximadamente una sexta parte de los tokens.

Esta versión GGUF añade valor práctico: incluye ficheros listos para ejecutar en llama.cpp sin necesidad de cargar el LoRA con `--lora`, conserva la capa de multi-token prediction (MTP) del modelo Qwen original para acelerar la decodificación, y ofrece un proyector multimodal (`mmproj`) que habilita la entrada de imágenes. La pipeline declarada es image-text-to-text y el repositorio ocupa 139,3 GB en total, repartidos entre las distintas cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con capa de multi-token prediction (MTP); adaptador LoRA fusionado |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 65536`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_XXS, IQ2_M; proyector de vision en F16; builds MLX de 6 bits en otro repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); MLX en repositorio aparte |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B (revision 3756181), un transformer de 27,3 mil millones de parámetros. Sobre él se fusionó el adaptador harness-hub/Qwen3.8-27B-opencode-adapted (revision b4171c0), entrenado con aprendizaje por refuerzo mediante AsyncGRPO en TRL para convertir el modelo en el motor del agente de codificación OpenCode en tareas de ingeniería de software y de terminal. La conversión a GGUF se hizo a partir de los pesos fusionados, de modo que cada fichero es autónomo y no requiere cargar el LoRA por separado.

Cada fichero GGUF conserva la capa de multi-token prediction (MTP) del modelo Qwen original, que llama-server puede aprovechar con `--spec-type draft-mtp` para decodificación especulativa. El proyector multimodal `mmproj-Qwen3.8-27B-opencode-F16.gguf` (0,9 GB) añade entrada de imágenes. Las cuantizaciones pequeñas (Q3_K_M, IQ3_XXS, IQ2_M) se generaron a partir del fichero Q8_0 usando una importance matrix (llama-imatrix sobre el Q8_0 con noticias en inglés). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo DPO adicional más allá del RL con AsyncGRPO.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo "thinking" configurable (el adaptador se entrenó y evaluó con thinking desactivado).
- Codificación y resolución de tareas de ingeniería de software: el adaptador se entrenó específicamente para SWE-bench Pro y Terminal-Bench 2.1.
- Uso como agente de terminal y de codificación dentro de OpenCode, con ejecución de comandos y edición de ficheros en flujos multi-paso.
- Tool calling / function calling: el despliegue de ejemplo usa el endpoint compatible con la API de OpenAI (`/v1`) y el autor indica que las pruebas de tool calling pasaron en todas las builds.
- Entrada de imágenes (image-text-to-text) mediante el proyector `mmproj` en F16.
- Decodificación especulativa con la capa MTP integrada, que acelera la generación sin modelo borrador externo.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de codificación en terminal: el modelo se conecta a OpenCode mediante un endpoint compatible con OpenAI y resuelve tareas como localizar y corregir tests que fallan (`opencode run --model local/qwen3.8-opencode "Find out why the tests in tests/test_parser.py fail and fix the bug."`). Es su caso de uso nativo, ya que el adaptador se entrenó para ello.
- Reparación de bugs en repositorios reales: con el rendimiento reportado en SWE-bench Pro (51,0 % en hard 51 con thinking off), es adecuado para pipelines de resolución automática de issues en integración continua.
- Automatización de tareas de shell: Terminal-Bench 2.1 al 52,4 % lo hace útil para agentes que ejecutan comandos, inspeccionan salidas y encadenan pasos en entornos Unix.
- Asistente de programación local en estación de trabajo: con Q4_K_M (16,8 GB) o Q6_K (22,4 GB) cabe en GPUs de consumo de gama alta y en Apple Silicon, permitiendo un copiloto de código sin enviar el código a servicios externos.
- Revisión de capturas y diagramas: gracias al proyector multimodal, puede recibir imágenes (por ejemplo, capturas de errores o diagramas de arquitectura) junto con texto para diagnosticar problemas.
- Despliegue en portátiles Apple Silicon: las builds MLX de 6 bits y el uso con llama-server con MTP (hasta 46 tok/s en Q6_K en un MacBook Pro M5 Max) permiten usar el modelo de forma interactiva en local.
- Servicio de agente con contexto largo: el ejemplo de despliegue configura `-c 65536`, adecuado para sesiones de agente que acumulan historial de conversación y salidas de herramientas.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (OpenCode, thinking off):

| Benchmark | Modelo base | Adaptador OpenCode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de las cuantizaciones respecto a los pesos BF16 (siguiente token idéntico y divergencia KL media):

| Fichero | Tamano | Mismo siguiente token que BF16 | KL media |
|---|---|---|---|
| Q6_K (recomendado) | 22,4 GB | 98,7 % | 0,0197 |
| Q8_0 | 29,0 GB | 99,5 % | 0,0002 |
| Q5_K_M | 19,5 GB | 97,6 % (vs Q8_0) | 0,0051 (vs Q8_0) |
| Q4_K_M | 16,8 GB | 94,2 % | 0,0689 |
| IQ4_XS | 15,3 GB | 94,4 % (vs Q8_0) | 0,0199 (vs Q8_0) |
| Q3_K_M | 13,5 GB | 92,9 % (vs Q8_0) | 0,0883 (vs Q8_0) |
| IQ3_XXS | 11,4 GB | 91,0 % (vs Q8_0) | 0,1356 (vs Q8_0) |
| IQ2_M | 10,2 GB | 89,6 % (vs Q8_0) | 0,1709 (vs Q8_0) |

Velocidad de decodificación con llama-server en un MacBook Pro M5 Max (greedy, thinking off, 5 prompts × 256 tokens, con otros servicios en ejecución, por lo que son orientativos):

| Fichero | Sin MTP | Con `--spec-type draft-mtp` | Borradores aceptados |
|---|---|---|---|
| Q4_K_M | 27 tok/s | 53 tok/s (×1,97) | 77 % |
| Q6_K | 22 tok/s | 46 tok/s (×2,07) | 73 % |
| Q8_0 | 18 tok/s | 43 tok/s (×2,36) | 74 % |

Velocidad con Splash 1.7.0 (decodificación especulativa con DFlash2, mismas condiciones):

| Fichero | Velocidad de decodificación | Extremo a extremo (incl. prompt) | Tokens por ciclo |
|---|---|---|---|
| Q4_K_M | 144 tok/s | 111 tok/s | 6,6 |
| Q6_K | 129 tok/s | 98 tok/s | 6,9 |
| Q8_0 | 105 tok/s | 85 tok/s | 6,6 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más overhead de contexto. Q8_0 ~29 GB, Q6_K ~22,4 GB, Q5_K_M ~19,5 GB, Q4_K_M ~16,8 GB, IQ4_XS ~15,3 GB, Q3_K_M ~13,5 GB, IQ3_XXS ~11,4 GB, IQ2_M ~10,2 GB; añadir 0,9 GB si se usa el proyector de visión.
- GPU recomendadas: A100 (40/80 GB) o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q6_K o inferiores; GPUs de 16 GB para Q4_K_M; GPUs de 12-16 GB para las cuantizaciones IQ3/IQ2.
- Cabe en GPU de consumo: sí, desde Q4_K_M (16,8 GB) hacia abajo en tarjetas de 16 GB o más; Q6_K en tarjetas de 24 GB.
- Apple Silicon: el autor reporta ejecución en MacBook Pro M5 Max con llama-server y con Splash; existen builds MLX de 6 bits en repositorio aparte.
- Opciones de despliegue: llama.cpp / llama-server (con `--jinja` y `--chat-template-kwargs '{"enable_thinking": false}'`), Splash 1.7.0, builds MLX; el servidor expone una API compatible con OpenAI que se integra en OpenCode.
- Latencia y throughput: ver tabla de benchmarks (22-27 tok/s sin MTP y 43-53 tok/s con MTP en M5 Max; 85-144 tok/s con Splash). No hay datos para GPU dedicadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted (GGUF, este) | 27,3 B | no disponible | Apache 2.0 | Adaptado con RL para OpenCode; SWE-bench Pro 51,0 %, Terminal-Bench 2.1 52,4 % |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | no disponible | SWE-bench Pro 35,3 %, Terminal-Bench 2.1 46,4 % con thinking off |
| harness-hub/Qwen3.8-27B-opencode-adapted (LoRA) | 27,3 B | no disponible | no disponible | Requiere cargar el LoRA; mismos resultados que esta conversión |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; el autor recomienda mantenerlo así. Activarlo puede degradar el comportamiento esperado.
- Los benchmarks reportados (SWE-bench Pro, Terminal-Bench 2.1) son los publicados por el autor del adaptador; no se han verificado de forma independiente en esta ficha.
- Las cuantizaciones bajas pierden fidelidad de forma significativa: IQ2_M conserva el 89,6 % del siguiente token respecto a Q8_0 y tiene KL media de 0,1709; para producción se recomienda Q6_K o superior.
- Las velocidades reportadas se midieron en un MacBook Pro M5 Max con otros servicios en ejecución y el propio autor las califica de orientativas; no deben tomarse como cifras de referencia en servidores.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo en la documentación proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador original, cuyos datos de licencia no se detallan aquí.
- El repositorio ocupa 139,3 GB; descargar solo los ficheros necesarios para evitar consumo innecesario de disco.
- El contexto máximo real no se especifica en la información disponible; el ejemplo de despliegue usa 65.536 tokens, pero no se confirma que sea el límite del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Builds MLX de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- OpenCode: https://opencode.ai
