# mseo3/qwen35-9b-base-nemoterm-sft-s500

## Resumen

qwen35-9b-base-nemoterm-sft-s500 es un ajuste fino supervisado (SFT) completo del modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario mseo3 en Hugging Face. Se trata del checkpoint correspondiente al paso 500 de un entrenamiento planificado de 28.580 pasos (10 épocas), por lo que representa una fracción temprana del proceso de ajuste y no un modelo final convergido. El modelo conserva la licencia Apache 2.0 del original y se distribuye en formato safetensors con 9.409.813.744 parámetros totales.

El objetivo del ajuste es especializar el modelo base en tareas de terminal y línea de comandos, empleando el corpus nvidia/Nemotron-Terminal-Corpus (CC-BY-4.0). El conjunto de datos de entrenamiento se construyó como un derivado multirretorno de 365.856 filas y 6,45 mil millones de tokens, con secuencias de hasta 65.536 tokens y con el bloque de razonamiento (thinking) preservado en cada turno del asistente. Esto lo orienta a agentes que operan en entornos shell, automatización de operaciones y generación de comandos con razonamiento explícito.

La relevancia de esta ficha es doble: por un lado, documenta un caso de especialización de un modelo Qwen 3.5 de 9B en un dominio técnico concreto; por otro, al ser un checkpoint intermedio con cero descargas y sin model card extendida, conviene tratarlo como material experimental de investigación más que como un artefacto listo para producción. La arquitectura subyacente combina capas de atención completa con capas Gated DeltaNet (atención lineal), según se deduce de la receta de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas Gated DeltaNet (atención lineal) combinadas con capas de atención completa; derivado de Qwen3.5-9B-Base |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 65.536 tokens (longitud máxima usada en el entrenamiento SFT) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16, con 48 tensores en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base (commit @68c46c4b) y hereda su arquitectura híbrida: 24 capas Gated DeltaNet con atención lineal, combinadas con capas de atención completa. La receta de entrenamiento emplea FlashAttention-3 en las capas de atención completa, Liger RMSNorm/SwiGLU y la implementación fused linear-CE de verl basada en Triton. Los pesos finales se fusionaron desde los fragmentos FSDP en fp32 a bf16, salvo 48 tensores que el modelo base también almacena en F32 (linear_attn.A_log y linear_attn.norm.weight de las 24 capas Gated DeltaNet), que se mantienen en F32. La cabeza MTP no se incluye (text_config.mtp_num_hidden_layers = 0) y la configuración no fija attn_implementation, aunque el entrenamiento usó flash_attention_3.

El ajuste se realizó con verl (sft_trainer_ray, receta mopdRL nemoterm-q35 @cb5ee536) sobre el dataset mseo3/nemotron-terminal-sft-qwen35-le64k @ac877ee2, derivado de nvidia/Nemotron-Terminal-Corpus. El conjunto contiene 365.856 filas multirretorno y 6,45 mil millones de tokens, con secuencias de hasta 65.536 tokens y el razonamiento (thinking) conservado en cada turno del asistente; el tokenizador de SFT es sfttok-preserve. La configuración de entrenamiento fue: 10 épocas (28.580 pasos planificados), batch de 128, learning rate 2e-5 con decaimiento coseno (ratio mínimo 0,1), warmup de 100 pasos, weight decay 0,01, gradient clipping de 1,0, longitud máxima de 65.536 y batch dinámico de 65.536 tokens por GPU. El hardware fue 4x NVIDIA H200 con FSDP (DP4) y gradient checkpointing. Este checkpoint corresponde al paso 500, es decir, aproximadamente al 1,75 % del plan de entrenamiento.

## Capacidades

- Generación de texto y razonamiento con modo thinking preservado en los turnos del asistente, según el formato del dataset de SFT.
- Generación y ejecución de comandos de terminal y shell, especialidad principal del ajuste.
- Razonamiento multi-paso orientado a tareas de línea de comandos y operaciones de sistema.
- Manejo de conversaciones multirretorno con contexto de hasta 65.536 tokens.
- Capacidades de código heredadas del modelo base Qwen3.5-9B-Base (no verificadas en este checkpoint).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de operaciones en terminal: el modelo puede generar secuencias de comandos shell a partir de instrucciones en lenguaje natural, aprovechando su ajuste sobre Nemotron-Terminal-Corpus y su ventana de 65.536 tokens para mantener el contexto de sesiones largas.
- Agentes de administración de sistemas: con razonamiento multi-paso y contexto extendido, puede planificar y encadenar comandos para tareas de diagnóstico, monitorización o despliegue en servidores.
- Asistentes de CI/CD: generación de scripts de build y despliegue, interpretación de logs de error y propuesta de comandos correctivos dentro de pipelines automatizados.
- Herramientas de desarrollo tipo copiloto de shell: integración en terminales interactivas para sugerir comandos, explicar salidas y corregir errores de sintaxis.
- Generación de documentación técnica de operaciones: a partir de transcripciones de sesiones de terminal, el modelo puede resumir procedimientos y producir guías paso a paso.
- Investigación sobre especialización de modelos: al ser un checkpoint intermedio del paso 500, sirve para estudiar la evolución del ajuste y la retención del modo thinking durante el SFT.
- Entrenamiento de agentes con contexto largo: su ventana de 65.536 tokens permite procesar trazas completas de sesiones de terminal en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto corto y 40-80 GB para contexto largo.
- GPU recomendadas: NVIDIA H200 o H100 para contexto completo de 65.536 tokens; A100 80 GB como alternativa viable; RTX 4090 (24 GB) puede ejecutar el modelo en bf16 con contexto limitado o mediante cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 con cuantización (por ejemplo, GGUF de 4-8 bits) y contexto reducido; en bf16 completo es ajustado en 24 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama (previa conversión a GGUF), siempre que se soporte la arquitectura híbrida Gated DeltaNet de Qwen3.5.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen35-9b-base-nemoterm-sft-s500 | 9,41B | 65.536 | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint del paso 500 de 28.580; especializado en terminal |
| Qwen/Qwen3.5-9B-Base | 9B (aprox.) | no disponible | Apache 2.0 | Hugging Face | Modelo base sin ajuste; capacidades generales |
| nvidia/Nemotron-Terminal-Corpus | no aplica (dataset) | no aplica | CC-BY-4.0 | Hugging Face | Corpus de entrenamiento, no un modelo |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada para establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 500 de 28.580 planificados (aproximadamente el 1,75 % del entrenamiento), por lo que su calidad no refleja el resultado final del SFT.
- Sin model card extendida ni resultados de evaluación: no hay benchmarks publicados que permitan validar su rendimiento.
- Cero descargas y cero likes en Hugging Face: no existe validación por parte de la comunidad.
- Riesgo de alucinación inherente a los modelos de lenguaje, potencialmente mayor en un checkpoint poco entrenado.
- Especialización estrecha en tareas de terminal: puede degradar el rendimiento en dominios generales respecto al modelo base.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento multilingüe fiable.
- La cabeza MTP no está incluida (mtp_num_hidden_layers = 0), lo que puede afectar a técnicas de decodificación especulativa.
- La configuración no fija attn_implementation; es necesario configurar manualmente flash_attention_3 o una alternativa compatible.
- Licencia Apache 2.0: permite uso comercial, pero el corpus de entrenamiento es CC-BY-4.0 y conviene verificar las obligaciones de atribución derivadas.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mseo3/qwen35-9b-base-nemoterm-sft-s500
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Dataset de SFT: https://huggingface.co/datasets/mseo3/nemotron-terminal-sft-qwen35-le64k
- Corpus original: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
- Overlay de tokenizador/plantilla: https://huggingface.co/mseo3/qwen35-9b-base-opd-overlay
- Repositorio verl: no disponible en la información proporcionada.
