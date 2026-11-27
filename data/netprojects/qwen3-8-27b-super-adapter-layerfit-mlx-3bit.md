# netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-3bit

## Resumen

Qwen3.8-27B-super-adapter-LayerFit-MLX-3bit es una cuantización de 3 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-super-adapter, una fusión de los adaptadores de agente de codificación pi, Hermes y OpenCode sobre la base Qwen3.8-27B. La publica netprojects (Paris Michalas, NetProjects) con el objetivo de hacer viable un modelo de 28.206.101.232 parámetros en Macs de 24 GB de memoria unificada, manteniendo el torreón de visión en bf16 y el cabezal de predicción multi-token (MTP) del modelo original en 8 bits.

La innovación principal es LayerFit, una búsqueda por capas que asigna presupuestos de bits no uniformes (MLP, atención, bloques de atención lineal, embeddings y cabeza de salida) en lugar de aplicar la misma cuantización a todas las capas. Según el autor, esto mejora la concordancia Top-1 con el modelo bf16 del 84,6 % al 88,7 % y reduce el error KL de 0,1440 a 0,0900 (un 38 % menos) con el mismo tamaño en disco.

El resultado ocupa 13,1 GB, se carga con mlx-lm, mlx-vlm y LM Studio sin modificaciones, soporta entradas de imagen y texto y conserva una ventana de contexto de 262K tokens. Es relevante para desarrolladores que quieran ejecutar localmente en Apple Silicon un modelo orientado a agentes y código con capacidades multimodales, sin depender de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5`) con atención lineal, torreón de visión y cabezal MTP; empaquetado MLX |
| Parametros totales | 28.206.101.232 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | 3 bits con receta LayerFit (bits no uniformes por capa); visión en bf16; cabezal MTP en 8 bits. Existen builds 2, 2.5, 4, 6 y 8 bits del mismo autor |
| Idiomas soportados | no disponible (la model card menciona pasajes de evaluación en inglés, otros idiomas, código, tool calls y matemáticas, pero no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 13,2 GB; 13,1 GB en disco según el autor) |

## Arquitectura y entrenamiento

El modelo base es una fusión (merge) de tres adaptadores de agente de codificación (pi, Hermes y OpenCode) sobre Qwen3.8-27B, es decir, un único modelo pensado para servir a varios harness de agente. La arquitectura subyacente es de tipo transformer con atención lineal en parte de sus bloques, torreón de visión y un cabezal de predicción multi-token (MTP) que permite decodificación especulativa con el propio modelo como draft. El contexto declarado es de 262K tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en la información proporcionada. La innovación técnica documentada es LayerFit: una búsqueda por capas que mide la degradación de cada bloque (MLP, atención, atención lineal, embeddings y cabeza de salida) a bajos bits y distribuye el presupuesto de cuantización donde más ayuda. La receta exacta está en `layerfit-recipe.json` del repositorio. La evaluación del autor se hizo solo sobre pesos de lenguaje, contra su merge bf16 del modelo base, con pasajes en inglés, otros idiomas, código, tool calls y matemáticas; la receta se encontró para la base Qwen3.8-27B y se revalidó sobre este modelo.

## Capacidades

- Generación de texto y razonamiento, con modo de pensamiento (thinking) verificado: 2/2 en la prueba del autor.
- Generación de código y tareas de agente de codificación, orientado a harness como pi, Hermes y OpenCode.
- Tool calling / function calling: prueba de tool call y coding superada 3/3 según el autor.
- Entrada de imagen y texto (pipeline `image-text-to-text`), con el mismo torreón de visión que el build de 4 bits.
- Decodificación especulativa mediante el cabezal MTP incluido en 8 bits, usando el propio modelo como draft.
- Matemáticas: 45/50 en GSM8K-50 con thinking desactivado.
- Capacidades multilingües: no declaradas explícitamente; la evaluación incluye pasajes en otros idiomas además del inglés.

## Casos de uso

- Asistente de codificación local en Mac: cargar el modelo con mlx-lm o LM Studio en un Mac de 24 GB y usarlo como copiloto para completar, revisar y refactorizar código, aprovechando el ajuste sobre adaptadores de agentes de codificación.
- Agentes autónomos multi-paso: integrarlo como motor de un harness de agente (pi, Hermes, OpenCode) gracias al soporte de tool calling y a los 262K tokens de contexto, que permiten mantener el historial de herramientas y ficheros en la ventana.
- Análisis de imágenes en local: describir capturas, diagramas o documentación escaneada con `mlx_vlm.generate --image`, sin enviar datos a la nube.
- Automatización de tareas de razonamiento matemático: usar el modo thinking para problemas de varios pasos y desactivarlo para respuestas rápidas, según la carga.
- Prototipado de pipelines de CI/CD en estaciones de trabajo Apple Silicon: validar flujos de generación de parches y tests antes de desplegarlos en infraestructura mayor.
- Inferencia con baja latencia en hardware de consumo: la decodificación especulativa con MTP reduce el número de pasos de generación, útil en asistentes interactivos sobre Macs de 24 GB.
- Evaluación de cuantizaciones: servir como referencia para comparar la receta LayerFit frente a una cuantización estándar de 3 bits con la misma huella en disco.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50, thinking off | 45/50 |
| Tool call y coding | 3/3 (pass) |
| Thinking | 2/2 (pass) |
| Entrada de imagen | mismo torreón de visión que el build de 4 bits (verificado allí) |
| Concordancia Top-1 con bf16 (3 bits estándar) | 84,6 % |
| Concordancia Top-1 con bf16 (LayerFit 3 bits) | 88,7 % |
| Error KL (3 bits estándar) | 0,1440 |
| Error KL (LayerFit 3 bits) | 0,0900 (38 % menor) |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni otros benchmarks estándar para este build; el autor remite a la model card del modelo base para sus propios resultados.

## Requisitos de hardware

- VRAM/memoria unificada: 13,1 GB en disco; pensado para Macs de 24 GB, dejando margen para macOS y prompts largos (la descarga es como máximo el 60 % de la memoria).
- GPU recomendadas: Apple Silicon con 24 GB de memoria unificada o más; el autor no documenta soporte para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: sí, en Macs de 24 GB; para 16 GB existen builds de 2 bits (9,1 GB, solo texto) y 2,5 bits (11,5 GB, modo stretch).
- Ajuste adicional: `sudo sysctl iogpu.wired_limit_mb=12800` permite al GPU usar más memoria hasta el reinicio (modo stretch).
- Opciones de despliegue: mlx-vlm (imagen y texto), mlx-lm (texto) y LM Studio, todos con formato MLX estándar.
- Latencia y throughput: no disponibles en la información proporcionada; el autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LayerFit MLX 3-bit) | 28.206.101.232 | 262K | 3 bits LayerFit, visión bf16, MTP 8 bits | Apache-2.0 | Hugging Face, 13,1 GB |
| netprojects LayerFit MLX 4-bit (mismo base) | 28.206.101.232 | 262K | 4 bits LayerFit | Apache-2.0 | Hugging Face, 16,5 GB |
| netprojects MLX 6-bit / 8-bit (mismo base) | 28.206.101.232 | 262K | 6 y 8 bits estándar | Apache-2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-super-adapter (base) | no disponible | no disponible | bf16 | Apache-2.0 | Hugging Face |

No se dispone de información sobre modelos de otros fabricantes comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Cuantización de 3 bits: aunque LayerFit reduce la degradación, la concordancia Top-1 con bf16 es del 88,7 %, no del 100 %; puede haber diferencias en tareas sensibles a la precisión.
- El propio autor indica que LayerFit aporta poco a partir de 6 bits; para máxima fidelidad conviene usar los builds de 6 u 8 bits, a costa de más memoria.
- La evaluación de LayerFit se hizo solo sobre pesos de lenguaje; la calidad del torreón de visión se verificó en el build de 4 bits, no específicamente en este.
- No se declara lista de idiomas soportados; el rendimiento fuera del inglés y los idiomas evaluados no está cuantificado.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; son heredados del modelo base y de los adaptadores fusionados.
- Modelo orientado a agentes y código: su comportamiento fuera de esos dominios no está evaluado en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero el aviso del autor indica que LayerFit es una marca registrada de NetProjects y que el proyecto no está afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub; conviene revisar LICENSE y NOTICE antes de redistribuir.
- Dependencia del ecosistema Apple: requiere MLX; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Build de 2 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-2bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-2.5bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-4bit
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
