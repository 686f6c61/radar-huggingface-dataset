# saidutta69/LFM3-1.7B-heretic

## Resumen

LFM3-1.7B-heretic es una variante "decensurada" (abliterated) de LFM3-1.7B de Liquid AI, publicada por el usuario saidutta69 en HuggingFace. El modelo original es un LLM agéntico de 1,73B parámetros post-entrenado por Liquid, orientado a uso local y en el borde (edge), y esta versión aplica la técnica de abliteración direccional mediante la herramienta Heretic v1.4.0 para suprimir los comportamientos de rechazo sin reentrenar el modelo. El resultado mantiene intacta la arquitectura tri-híbrida original, la ventana de contexto de 256K tokens, la plantilla ChatML y el formato de tool calls en XML.

La relevancia de esta ficha radica en dos frentes. Por un lado, LFM3-1.7B es notable por su arquitectura híbrida que combina convoluciones cortas con atención deslizante y global, y por sus resultados agénticos publicados (BFCL V4 71,39, ToolSandbox 80,36, WebArena-Verified 38,42) que, según el autor, antes requerían modelos de 9B. Por otro lado, la abliteración consigue reducir los rechazos de 95/100 a 5/100 con una divergencia KL de solo 0,0052, sin regresión medible en MMLU (49,91 % frente a 49,56 % del original). El repositorio incluye además la receta completa de reproducción (configuración de Heretic, journal de Optuna y sumas SHA-256), algo poco habitual en modelos abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: 24 capas (13 convoluciones cortas con gating, 5 de atención deslizante, 6 de atención global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | F16, Q2_K, IQ3_S, Q3_K_S/M/L, IQ4_XS, Q4_0, Q4_1, Q4_K_S/M, Q5_K_S/M, Q6_K, Q8_0 (GGUF); BF16 en safetensors |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM 1.0 (other, heredada del modelo base LiquidAI/LFM3-1.7B) |
| Formato de pesos | Safetensors (BF16, 3,46 GB) y GGUF (18,93 GB en total para el set completo) |

## Arquitectura y entrenamiento

La arquitectura base es la tri-híbrida de la familia LFM3 de Liquid AI: 24 capas repartidas en 13 capas de convolución corta con gating, 5 capas de atención con ventana deslizante y 6 capas de atención global. Este diseño reduce el coste computacional de la atención manteniendo la capacidad de capturar dependencias largas, lo que permite una ventana de contexto de 256K tokens en un modelo de solo 1,73B parámetros. El modelo conserva la plantilla ChatML y el formato de tool calls en XML del original.

Sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la información proporcionada. Lo que sí está documentado es el proceso de abliteración: el autor usó Heretic v1.4.0, que realiza ediciones dirigidas de pesos en las proyecciones de salida de la atención (incluido el `out_proj` del operador de convolución en las capas convolucionales) y en las proyecciones descendentes del MLP, identificando las direcciones de peso responsables del comportamiento de rechazo. El checkpoint publicado corresponde al ensayo 83 de una búsqueda de 200 ensayos con semilla 2678800539. No se trata de un fine-tuning: el resto de la red permanece intacto, lo que evita la degradación de coherencia típica de los fine-tunings sobre modelos con RLHF.

## Capacidades

- Generacion de texto conversacional en 16 idiomas, con la plantilla ChatML del modelo base.
- Tool calling / function calling en formato XML, heredado del modelo agéntico original.
- Diseñado para agentes locales y uso en dispositivo (edge/on-device), según los tags del repositorio.
- Ventana de contexto de 256K tokens para documentos y conversaciones largas.
- Comportamiento sin rechazos: la abliteración reduce las negativas de 95/100 a 5/100, respondiendo a peticiones que el modelo original declinaría.
- Distribución reproducible: el directorio `reproduce/` permite regenerar el modelo exacto con `heretic --reproduce reproduce/reproduce.json`.
- Sin capacidades de visión, audio ni modo de razonamiento explícito documentadas; no disponible.

## Casos de uso

- Agentes locales sin GPU: con ~1 GB en cuantización de 4 bits, el modelo cabe en un teléfono, una Raspberry Pi 5 o incluso un navegador, permitiendo ejecutar agentes con tool calling sin hardware dedicado.
- Automatizacion de tareas con herramientas en el borde: el formato XML de tool calls y el post-entrenamiento agéntico del modelo base (ToolSandbox 80,36) lo hacen adecuado para pipelines que invoquen APIs o funciones locales desde dispositivos modestos.
- Chatbots locales multilingues: soporte de 16 idiomas y contexto de 256K tokens permiten asistentes conversacionales que procesan documentos largos sin conexión.
- Investigacion en abliteration y alineamiento: la receta reproducible (semilla, config.toml, journal de Optuna) lo convierte en un caso de estudio útil para estudiar el impacto de la abliteración en capacidades y formato.
- Prototipado rapido de aplicaciones LLM: el bajo footprint permite iterar en portátiles sin GPU antes de escalar a modelos mayores.
- Procesamiento de documentos largos en local: la ventana de 256K tokens permite resumir o consultar documentos extensos en un modelo que cabe en memoria de consumidor.

Cabe subrayar que el propio Liquid no recomienda el modelo base de 1,7B para coding agéntico ni razonamiento multi-paso complejo, y la abliteración no elimina esa limitación.

## Benchmarks y rendimiento

Datos medidos por el autor del checkpoint en el mismo entorno (`lm-eval` 0.4.13, 14.042 preguntas para MMLU):

| Metrica | LFM3-1.7B-heretic | LiquidAI/LFM3-1.7B (original) |
|---|---|---|
| Divergencia KL | 0,0052 | 0 (por definicion) |
| Rechazos (set de evaluacion de Heretic) | 5/100 | 95/100 |
| MMLU (acc) | 49,91 % | 49,56 % |
| Error estandar MMLU | 0,41 pp | 0,41 pp |

Datos publicados por Liquid para la columna LFM3-1.7B del modelo original (citados por el autor, no re-medidos en este checkpoint):

| Benchmark | Valor |
|---|---|
| BFCL V4 | 71,39 |
| ToolSandbox | 80,36 |
| WebArena-Verified | 38,42 |

La diferencia de +0,35 pp en MMLU es menor que un error estándar, es decir, sin regresión de conocimiento medible, aunque el autor advierte de que es un único benchmark y no una garantía de capacidades.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~0,75 GB en Q2_K, ~1,0-1,1 GB en cuantizaciones de 4 bits (IQ4_XS, Q4_K_M), ~1,43 GB en Q6_K, ~1,85 GB en Q8_0 y ~3,46 GB en BF16 safetensors; a esto hay que añadir la memoria del KV cache, que crece con el contexto (hasta 256K tokens).
- GPU recomendadas: no requiere GPU. Cualquier GPU moderna con 4 GB o más ejecuta el modelo con holgura; en CPU, un portátil estándar o una Raspberry Pi 5 son suficientes según el autor.
- Cabe en consumer GPUs de gama baja (por ejemplo, RTX 3050 o superior) e incluso en dispositivos móviles y navegadores en cuantización de 4 bits.
- Opciones de despliegue: llama.cpp (requiere una build con soporte de la arquitectura `lfm3`, disponible desde finales de octubre de 2026; builds antiguas no cargarán el modelo), y transformers con `trust_remote_code=True` (el checkpoint incluye código custom). No se menciona soporte en vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-heretic | 1,73B | 256K | Tri-híbrida (conv + SWA + global) | LFM 1.0 | Abliterated con Heretic; GGUF y safetensors |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 256K | Tri-híbrida | LFM 1.0 | Fuertemente refusal-tuned (95/100 rechazos) |
| Qwen3-1.7B | 1,7B | no disponible en la informacion proporcionada | Transformer denso | Apache 2.0 | Alternativa densa de tamano similar; sin abliterar |

No hay datos de benchmarks comparativos directos entre estos modelos en la información proporcionada más allá de los ya listados en la sección anterior.

## Limitaciones y advertencias

- El tamaño de 1,7B impone un techo de capacidad: el propio Liquid no recomienda el modelo para coding agéntico ni razonamiento multi-paso complejo. La abliteración elimina rechazos, no esa limitación.
- Riesgo de alucinación típico de modelos pequeños, agravado en la práctica por la ausencia de mecanismos de rechazo: el modelo intentará responder a peticiones para las que no es competente.
- Contenido potencialmente nocivo: al suprimir los refusals, el modelo puede generar contenido que el original declinaría. Su uso conlleva responsabilidades legales y éticas para quien lo despliega.
- Sesgos conocidos: no disponible (no se documentan auditorías de sesgo).
- Idiomas: se declaran 16 idiomas, pero no hay datos de calidad por idioma; el rendimiento en castellano no está evaluado en la información disponible.
- Licencia LFM 1.0 (heredada de Liquid AI): es una licencia "other", no una licencia permisiva estándar; conviene revisar sus términos antes de uso comercial en el enlace de la licencia del modelo base.
- Despliegue: los GGUF requieren una build de llama.cpp con soporte `lfm3` (finales de octubre de 2026); los transformers requieren `trust_remote_code=True`, lo que implica ejecutar código custom del repositorio.
- La evaluación de MMLU es un único benchmark en un entorno concreto; no garantiza la conservación de todas las capacidades del modelo original.

## Enlaces

- Modelo: https://huggingface.co/saidutta69/LFM3-1.7B-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF oficial del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Writeup original de abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
