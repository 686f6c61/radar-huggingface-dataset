# netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit

## Resumen

Qwen3.8-27B-opencode-adapted-MLX-6bit es una conversión a formato MLX, con cuantización afín de 6 bits (grupo 64), del adaptador LoRA `harness-hub/Qwen3.8-27B-opencode-adapted` fusionado sobre el modelo base `Qwen/Qwen3.8-27B`. Lo publica el usuario `netprojects` y está pensado específicamente para ejecutarse en Apple Silicon mediante la librería `mlx` (y `mlx-vlm` para las capacidades multimodales). El resultado es un artefacto de 23,1 GB que conserva el encoder de visión y la capa MTP (multi-token prediction) de Qwen, lo que permite tanto generación de texto como entrada image-text-to-text.

El interés del modelo está en el ajuste: `harness-hub` entrenó el LoRA con aprendizaje por refuerzo (AsyncGRPO en TRL) para convertir al modelo en el motor del agente de programación OpenCode, orientado a tareas de ingeniería de software y de terminal. Según los resultados publicados por el autor del adaptador, con el modo thinking desactivado el modelo pasa de 35,3 % a 51,0 % en SWE-bench Pro (hard 51) y de 46,4 % a 52,4 % en Terminal-Bench 2.1 respecto al modelo base, y además iguala al base con thinking al máximo esfuerzo generando aproximadamente una sexta parte de los tokens.

Esta build de 6 bits es la que el propio autor recomienda como equilibrio entre tamano y fidelidad: reproduce el siguiente token de la referencia bf16 en el 98,7 % de los casos, con una divergencia KL de 0,0014 frente a bf16. Está pensada para Macs de 48 GB de memoria unificada, aunque existen variantes de 3, 4 y 8 bits para otros perfiles de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5, con encoder de visión y capa MTP; pesos convertidos con mlx-vlm |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afín, grupo 64 (esta build); la familia incluye 3, 4, 6 y 8 bits MLX, bf16 y GGUF (IQ2_M, Q3_K_M, Q4_K_M, Q6_K, Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); tamano del repo 23,1 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal de la familia Qwen3.5 que incorpora un encoder de visión y una capa MTP (multi-token prediction), preservados ambos en esta conversión a MLX. Sobre ese base, `harness-hub` entrenó un adaptador LoRA mediante aprendizaje por refuerzo con AsyncGRPO implementado en TRL, con el objetivo explícito de optimizar el comportamiento del modelo como agente de programación dentro de OpenCode sobre tareas de ingeniería de software y de terminal. El adaptador se fusionó en los pesos del base (revisiones `b4171c0` del adaptador y `3756181` del base) y el conjunto se convirtió con `mlx-vlm`.

La cuantización aplicada en esta build es afín de 6 bits con grupo de 64 sobre las capas lineales, lo que reduce el peso a 23,1 GB manteniendo una fidelidad alta frente a bf16 (98,7 % de coincidencia en el siguiente token y KL de 0,0014). El tokenizador y la plantilla de chat son los del adaptador sin modificar, por lo que conserva el mismo vocabulario y el mismo formato de tool calls XML de Qwen3.8-27B. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni detalles del proceso de RL más allá de la mención a AsyncGRPO.

## Capacidades

- Generación de texto y razonamiento en modo conversacional, con plantilla de chat compatible con Qwen.
- Programación y resolución de tareas de ingeniería de software: el ajuste RL está orientado a SWE-bench Pro y a tareas de terminal.
- Ejecución de tareas de terminal y agentes de codificación multi-paso, entrenado como motor de OpenCode.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como tool calls compatibles con OpenAI.
- Entrada de imágenes (image-text-to-text) mediante `mlx-vlm`: lectura de capturas de pantalla, terminales o diagramas.
- Modo thinking configurable; el adaptador fue entrenado y evaluado con thinking desactivado y así se recomienda usarlo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de codificación local en OpenCode: servir el modelo con `mlx_lm.server` y registrarlo como proveedor OpenAI-compatible permite lanzar tareas como "encuentra por qué fallan los tests de tests/test_parser.py y corrige el bug" sin salir del Mac.
- Reparación de bugs en repositorios reales: el ajuste RL sobre SWE-bench Pro (51,0 % en hard 51) lo hace adecuado para localizar el fallo, editar varios ficheros y validar el cambio dentro de un flujo de agente.
- Automatización de tareas de terminal: con 52,4 % en Terminal-Bench 2.1, puede encadenar comandos, interpretar la salida y corregir la estrategia en pasos sucesivos.
- Análisis de capturas de pantalla y errores: gracias al encoder de visión, se le puede pasar una imagen de una terminal o de un IDE y preguntar qué error muestra o qué está mal en el código visible.
- Asistencia de programación en local con privacidad: al ejecutarse íntegramente en Apple Silicon, el código y los prompts no salen del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Integración en pipelines de CI/CD o scripts de mantenimiento: el tool calling en formato OpenAI permite conectarlo a herramientas propias que ejecuten tests, lean ficheros o consulten APIs.
- Prototipado de agentes con presupuesto de tokens ajustado: al igualar al base con thinking al máximo esfuerzo generando aproximadamente una sexta parte de los tokens, reduce coste y latencia en bucles de agente.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (OpenCode, thinking desactivado):

| Benchmark | Modelo base | Adaptador opencode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de la cuantización frente a bf16:

| Build | Tamano | Coincidencia siguiente token vs bf16 | KL vs bf16 |
|---|---|---|---|
| MLX 6-bit (esta) | 23,1 GB | 98,7 % | 0,0014 |
| MLX 8-bit | 30,0 GB | 99,2 % | 0,0004 |
| MLX 4-bit | 16,3 GB | 96,7 % | 0,0203 |
| MLX 3-bit | 13,8 GB | 93,4 % | 0,0812 |
| MLX bf16 | 55,6 GB | referencia | referencia |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 23,1 GB de pesos; el autor recomienda esta build para Macs de 48 GB, dejando margen para macOS y prompts largos (la descarga es como máximo ~60 % de la memoria).
- Macs de 24 GB: usar la build de 3 bits (13,8 GB).
- Macs de 32 GB: usar la build de 4 bits (16,3 GB).
- Macs de 64 GB o más: usar la build de 8 bits (30,0 GB); con 128 GB, bf16 (55,6 GB).
- Macs de 16 GB: solo como opción "stretch" con el GGUF IQ2_M (10,2 GB), cerrando aplicaciones y limitando el prompt a unos miles de tokens.
- GPU: el modelo está pensado para Apple Silicon; no se proporcionan requisitos para A100, H100 o RTX 4090 en la información disponible.
- Despliegue: `mlx-lm >= 0.32.2` (servidor OpenAI-compatible), `mlx-vlm >= 0.7.11` para imágenes, LM Studio con MLX, y variantes GGUF para llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,78 B | no disponible | Agente de código ajustado con RL, multimodal, MLX 6 bits | Apache 2.0 | Hugging Face (MLX) |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Modelo multimodal generalista | Apache 2.0 (según el adaptador) | Hugging Face |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,78 B | no disponible | Adaptador LoRA del anterior, sin cuantizar | Apache 2.0 | Hugging Face |
| Builds MLX 3/4/8 bits y GGUF del mismo modelo | 27,78 B | no disponible | Mismas capacidades con distinto equilibrio tamano/fidelidad | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; usarlo con thinking activado puede degradar el comportamiento esperado.
- La cuantización de 6 bits introduce una divergencia pequeña pero real frente a bf16 (98,7 % de coincidencia en el siguiente token, KL 0,0014); para máxima fidelidad debe usarse la build de 8 bits o bf16.
- En Macs de 48 GB el margen de memoria es limitado: prompts muy largos o contextos grandes pueden provocar presión de memoria; el autor sugiere ajustar `iogpu.wired_limit_mb` en casos justos.
- El ajuste está orientado a tareas de agente de código y terminal; su rendimiento en dominios generales puede no reflejar el del modelo base.
- Riesgo de alucinación y de ediciones incorrectas en código: como todo agente, requiere validación mediante tests y revisión humana antes de llevar cambios a producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe equivalente al del base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen y del adaptador original antes de redistribuir.
- El formato de tool calls es el XML propietario de Qwen; el servidor de mlx-lm lo traduce a OpenAI, pero integraciones propias deben respetar ese formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build MLX 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Build MLX 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Build MLX bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Builds GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- OpenCode: https://opencode.ai
- Perfil del autor: https://huggingface.co/netprojects
