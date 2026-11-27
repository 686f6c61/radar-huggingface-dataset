# netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16

## Resumen

Qwen3.8-27B-opencode-adapted-MLX-bf16 es una conversión a formato MLX en precisión bf16 del adaptador LoRA publicado por harness-hub sobre el modelo base Qwen/Qwen3.8-27B, empaquetada por el usuario netprojects para su ejecución nativa en Apple Silicon. El adaptador original fue entrenado mediante aprendizaje por refuerzo (AsyncGRPO en TRL) para convertir al modelo en el motor del agente de programación OpenCode, especializándolo en tareas de ingeniería de software y operación de terminal. Esta build concreta fusiona el adaptador en los pesos base y conserva tanto el codificador de visión como la capa MTP (multi-token prediction) de Qwen, con los pesos sin cuantizar en bf16.

El modelo resuelve el problema de desplegar un agente de código de 27.781 millones de parámetros en un Mac sin depender de la nube, manteniendo la fidelidad numérica de referencia frente a las versiones cuantizadas de la misma familia. Es relevante porque el adaptador original mejora de forma sustancial los resultados del modelo base en tareas agénticas de software: SWE-bench Pro (hard 51) pasa de 35,3% a 51,0% y Terminal-Bench 2.1 de 46,4% a 52,4%, y con el modo thinking desactivado iguala al modelo base con su esfuerzo de razonamiento máximo generando aproximadamente una sexta parte de los tokens.

La ficha se centra en la build bf16 (55,6 GB), que actúa como referencia de fidelidad para el resto de cuantizaciones de la familia (3, 4, 6 y 8 bits). La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text, lo que confirma el soporte multimodal heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B) con capa MTP (multi-token prediction) y codificador de visión; conversión MLX vía mlx-vlm |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Esta build es bf16 sin cuantizar; la familia incluye builds MLX de 3, 4, 6 y 8 bits, además de GGUF (IQ2_M, Q3_K_M, Q4_K_M, Q6_K, Q8_0) y un adaptador LoRA suelto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (bf16); librería mlx |
| Tamano del repositorio | 55,6 GB |
| Modelo base | harness-hub/Qwen3.8-27B-opencode-adapted (revisión b4171c0) sobre Qwen/Qwen3.8-27B (revisión 3756181) |
| Metodo de adaptacion | LoRA fusionado, entrenado con RL (AsyncGRPO en TRL) |
| Tokenizer y chat template | Los de harness-hub, sin cambios; mismo vocabulario y formato de tool calls que Qwen3.8-27B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B: un transformer multimodal con codificador de visión y una capa de multi-token prediction (MTP) que se conserva en esta conversión. Sobre ese modelo base, harness-hub entrenó un adaptador LoRA mediante aprendizaje por refuerzo con AsyncGRPO implementado en TRL, orientado específicamente a tareas de ingeniería de software y uso de terminal dentro del agente OpenCode. Esta build de netprojects fusiona ese adaptador en los pesos base y realiza la conversión a MLX con mlx-vlm, manteniendo los pesos en bf16 y sin alterar el tokenizer ni la plantilla de chat originales.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset de RL ni si hubo fases adicionales de alineamiento más allá del entrenamiento con refuerzo descrito. La innovación técnica destacable es doble: por un lado, el entrenamiento por refuerzo orientado a agentes que mejora el rendimiento en benchmarks de software sin necesidad de activar el modo thinking; por otro, la capa MTP heredada del modelo base, que habilita decodificación multi-token y acelera la generación (la model card menciona explícitamente una sección sobre decodificación más rápida mediante MTP).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con Qwen3.8-27B.
- Razonamiento y resolución de tareas de ingeniería de software: localización de bugs, parches y ejecución de comandos de terminal, según el entrenamiento RL del adaptador.
- Generación y edición de código en el contexto de un agente (OpenCode), incluyendo flujos de varios pasos.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Capacidades de agente: el adaptador está entrenado y evaluado como motor de un agente de codificación con terminal, lo que implica razonamiento multi-paso y uso de herramientas.
- Procesamiento de imagen y texto (pipeline image-text-to-text): puede analizar capturas de pantalla o imágenes de terminal mediante mlx-vlm.
- Modo thinking conmutable: la plantilla admite `enable_thinking`, aunque el adaptador fue entrenado y evaluado con thinking desactivado y la recomendación es mantenerlo apagado.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de codificación local en macOS: servir el modelo con `mlx_lm.server` y conectarlo a OpenCode mediante el proveedor OpenAI-compatible, de modo que el agente resuelva tareas como "encuentra por qué fallan los tests de tests/test_parser.py y corrige el bug" sin salir del Mac.
- Corrección de bugs en repositorios reales: el adaptador fue entrenado con RL sobre tareas de ingeniería de software y mejora SWE-bench Pro de 35,3% a 51,0%, por lo que es adecuado para localizar y parchear defectos en bases de código existentes.
- Automatización de operaciones de terminal: con Terminal-Bench 2.1 en 52,4% frente al 46,4% del base, puede ejecutar secuencias de comandos, diagnosticar fallos de shell e interpretar la salida de herramientas CLI.
- Análisis de capturas de terminal o de pantalla: usando mlx-vlm con una imagen y un prompt del tipo "¿qué error muestra este terminal?", el modelo interpreta la salida visual y propone la siguiente acción.
- Asistente de programación integrado en el IDE o en pipelines: al exponer una API compatible con OpenAI en el puerto local, puede conectarse a clientes que hablen ese protocolo y usarse en tareas de generación de código y revisión dentro de flujos de desarrollo.
- Referencia de fidelidad para cuantizaciones: al ser la build bf16 de referencia (55,6 GB), sirve para validar el comportamiento de las builds de 6, 8, 4 y 3 bits, cuyas métricas de coincidencia de siguiente token y KL frente a bf16 publica el autor.
- Laboratorio de investigación en RL para agentes: al estar disponible el adaptador LoRA suelto (638 MB) y la receta AsyncGRPO descrita por harness-hub, sirve como punto de partida para experimentos de ajuste por refuerzo sobre Qwen3.8-27B en MLX.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, evaluados bajo OpenCode con thinking desactivado:

| Benchmark | Modelo base Qwen3.8-27B | Con adaptador opencode | Mejora |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% | +15,7 puntos |
| Terminal-Bench 2.1 | 46,4% | 52,4% | +6,0 puntos |

Fidelidad de las cuantizaciones de la familia respecto a esta build bf16:

| Build | Tamano | Coincidencia de siguiente token vs bf16 | KL vs bf16 |
|---|---|---|---|
| MLX 8-bit | 30,0 GB | 99,2% | 0,0004 |
| MLX 6-bit (recomendada) | 23,1 GB | 98,7% | 0,0014 |
| MLX 4-bit | 16,3 GB | 96,7% | 0,0203 |
| MLX 3-bit | 13,8 GB | 93,4% | 0,0812 |
| MLX bf16 (esta build) | 55,6 GB | referencia | referencia |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales para esta build.

## Requisitos de hardware

- Esta build bf16 ocupa 55,6 GB en disco y requiere un Mac con 128 GB de memoria unificada para dejar margen a macOS y a prompts largos, según la tabla del autor.
- VRAM estimada: al ser MLX sobre Apple Silicon, la memoria es unificada; el autor recomienda que la descarga no supere aproximadamente el 60% de la memoria del equipo.
- GPU recomendadas: Apple Silicon de 128 GB o más para bf16. No se documentan GPU NVIDIA (A100, H100, RTX 4090) para esta build MLX.
- Opciones por memoria en la familia: 3-bit (13,8 GB) para Macs de 24 GB; 4-bit (16,3 GB) para 32 GB; 6-bit (23,1 GB, recomendada) para 48 GB; 8-bit (30,0 GB) para 64 GB o más; IQ2_M GGUF (10,2 GB) como opción "stretch" para 16 GB con `sudo sysctl iogpu.wired_limit_mb=12800`.
- Despliegue: `mlx_lm.server` (mlx-lm >= 0.32.2) con servidor compatible con OpenAI; mlx-vlm (>= 0.7.11) para entrada de imágenes; también disponible en formato GGUF para llama.cpp, Ollama y LM Studio, y las builds MLX pueden cargarse en LM Studio MLX.
- Latencia y throughput: no disponibles en la información proporcionada; la model card menciona decodificación más rápida mediante la capa MTP, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento agéntico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted (MLX bf16, esta ficha) | 27,78 mil millones | no disponible | SWE-bench Pro 51,0%; Terminal-Bench 2.1 52,4% | Apache 2.0 | Hugging Face, MLX y GGUF |
| Qwen3.8-27B (base) | 27,78 mil millones | no disponible | SWE-bench Pro 35,3%; Terminal-Bench 2.1 46,4% | no disponible en la información | Hugging Face |
| Otras builds de la misma familia (MLX 6-bit, 8-bit, 4-bit, 3-bit; GGUF) | 27,78 mil millones | no disponible | Fidelidad del 93,4% al 99,2% de coincidencia de siguiente token vs bf16 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada, por lo que la comparación se limita al modelo base y a las cuantizaciones de la propia familia.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; activar el modo thinking puede degradar el comportamiento esperado y, en todo caso, se recomienda servir con `enable_thinking: false`.
- Los benchmarks publicados (SWE-bench Pro, Terminal-Bench 2.1) corresponden al adaptador original de harness-hub; esta build es una conversión de formato y no aporta evaluaciones propias más allá de las métricas de fidelidad frente a bf16.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de código donde puede proponer APIs o comandos inexistentes; conviene validar los parches y comandos antes de aplicarlos en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingüe más allá de lo heredado del modelo base.
- Longitud de contexto: no disponible; el autor advierte que en configuraciones "stretch" de 16 GB conviene limitar los prompts a unos pocos miles de tokens.
- Requisito de memoria elevado para esta build bf16 (128 GB de memoria unificada); para equipos menores deben usarse las builds cuantizadas, con la pérdida de fidelidad correspondiente (KL de 0,0812 en 3-bit).
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base Qwen/Qwen3.8-27B y del adaptador original, no detalladas en la información disponible.
- Dependencia de versiones mínimas de software (mlx-lm >= 0.32.2, mlx-vlm >= 0.7.11); versiones anteriores pueden no cargar correctamente la capa MTP o el codificador de visión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 6-bit (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build MLX 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build MLX 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Build MLX 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Adaptador LoRA en MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Builds GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- OpenCode: https://opencode.ai
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
