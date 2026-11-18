# FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF

## Resumen

Spark-X2.6-4B-abliterated-GGUF es la versión cuantizada en formato GGUF del modelo FrostWolfAI/Spark-X2.6-4B-abliterated, un derivado "abliterated" (decensurado) del modelo base XHToken/Spark-X2.6-4B. El autor, Vatsal Bajpai (FrostWolfAI), ha generado un conjunto completo de 14 cuantizaciones más el BF16 de referencia usando llama.cpp, con un total de 44,53 GB en el repositorio. El modelo está pensado para inferencia local en GPU de consumo, portátiles o incluso CPU, con un tamaño de pesos de aproximadamente 2,4-2,6 GB en 4 bits.

El modelo conserva la arquitectura y capacidades del original: contexto de hasta 1 millón de tokens, modo de razonamiento controlable (thinking mode) y soporte nativo de tool calling mediante el formato `<tool_call>`. La modificación principal es la eliminación de rechazos mediante Arbitrary-Rank Ablation (ARA) con Heretic v2, que reduce las negativas de 100/100 a 2/100 con una divergencia KL de 0,0177, manteniendo intactas las capacidades funcionales del modelo base.

Es relevante ahora porque ofrece una alternativa local, ligera y sin censura para flujos agénticos y de investigación en seguridad, con licencia Apache 2.0 y compatibilidad con el ecosistema llama.cpp. El modelo solo soporta inglés y chino, y requiere una build de llama.cpp con soporte para la arquitectura `spark2_5` (probada con la build 11669).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura GGUF `spark2_5`); detalles internos no disponibles |
| Parametros totales | 4.112.079.360 (~4,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_1, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_S, Q3_K_S, Q2_K |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base XHToken/Spark-X2.6-4B más allá de que se trata de un transformer con 4,1 mil millones de parámetros, contexto de 1 millón de tokens, modo de razonamiento controlable y soporte de tool calling con un formato propietario de etiquetas (`<tool_call>`, `<arg_key>`, `<arg_value>`). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable de esta variante es el proceso de abliteración mediante Arbitrary-Rank Ablation (ARA) con Heretic v2, que elimina direcciones de rechazo en el espacio de activaciones con un impacto mínimo en la distribución original (KL de 0,0177). Las cuantizaciones se generaron con `convert_hf_to_gguf.py` (master, 2026-10-29) y `llama-quantize` (build 11669), sin matriz de importancia (importance matrix).

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Razonamiento explícito con modo "thinking" activado por defecto y controlable por petición (`enable_thinking`, `reasoning_effort`).
- Tool calling / function calling nativo en formato OpenAI, parseado por llama-server con `--jinja`.
- Capacidades agénticas y razonamiento multi-paso (etiqueta `agentic` en el repo).
- Soporte de código y tareas técnicas (etiqueta `tool-calling`, `reasoning`).
- Multilingüe limitado a inglés y chino.
- Variante decensurada: rechazos reducidos de 100/100 a 2/100, orientada a investigación y usos sin filtros.
- No se indica soporte de visión ni audio.

## Casos de uso

- Agentes locales en portátil o GPU de consumo: con Q4_K_M (2,60 GB) el modelo cabe en GPUs de 8 GB o menos y permite ejecutar bucles agénticos con tool calling en local sin depender de la nube.
- Automatización de atención al cliente multi-turno: el contexto de 1M tokens permite mantener historiales largos y documentación de referencia en la misma ventana, con respuestas en inglés o chino.
- Generación de código en pipelines de CI/CD: el soporte de tool calling y el formato OpenAI permiten integrarlo en frameworks agénticos para tareas de revisión, parcheo o generación de tests.
- Investigación en seguridad y red teaming: la variante abliterated reduce los rechazos, lo que facilita estudiar comportamientos del modelo en escenarios de jailbreak o análisis de sesgos sin bloqueos del sistema.
- Despliegue en dispositivos con recursos limitados (móvil, SBC de 8 GB RAM): las cuantizaciones Q4_K_M e IQ4_XS (~2,4 GB) permiten inferencia en CPU o en GPUs integradas.
- Prototipado rápido con llama.cpp u Ollama: la disponibilidad de 15 archivos GGUF permite elegir el equilibrio calidad/tamaño según el hardware, desde Q8_0 (casi sin pérdida) hasta Q2_K (último recurso).
- Asistentes de razonamiento con presupuesto controlado: el modo thinking con `reasoning_effort` low/high permite ajustar el coste computacional por consulta en aplicaciones de análisis técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). Sí se incluyen datos de velocidad de inferencia medidos con `llama-bench` en una RTX 4090 limitada a 360 W (`-ngl 99 -fa 1 -p 512 -n 128`, 3 repeticiones):

| Cuantizacion | Prefill (pp512) | Decode (tg128) |
|---|---:|---:|
| BF16 | ~12.300 tok/s | 99 tok/s |
| Q8_0 | ~16.100 tok/s | 165 tok/s |
| Q6_K | ~14.800 tok/s | 199 tok/s |
| Q4_K_M | ~16.800 tok/s | 240 tok/s |
| IQ4_XS | ~17.300 tok/s | 253 tok/s |

Pruebas funcionales de cada cuantización con `llama-server --jinja -ngl 99 -fa on -c 8192`: Q8_0, Q4_K_M y Q2_K superan las pruebas de respuesta directa (thinking off), respuesta razonada (thinking on, 17 × 23 = 391) y tool call estructurado (`get_weather(city="Paris")`, `finish_reason=tool_calls`). Q2_K muestra coherencia pero con un fallo factual en la prueba de thinking off.

## Requisitos de hardware

- VRAM estimada: ~2,4-2,6 GB para cuantizaciones de 4 bits (Q4_K_M, IQ4_XS, Q4_0), ~3,0-3,4 GB para 5-6 bits, ~4,4 GB para Q8_0 y ~8,2 GB para BF16.
- GPU recomendadas: RTX 4090 (datos medidos), A100/H100 para mayor throughput; cualquier GPU con ≥4 GB de VRAM para 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 8 GB, RTX 4060, RTX 4090 y similares; también en portátiles con GPU integrada y en CPU-only.
- Dispositivos de bajos recursos: móvil o SBC con 8 GB de RAM con Q4_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama, LM Studio, Jan y cualquier runtime que incluya llama.cpp con soporte `spark2_5` (probado con build 11669). Requiere `--jinja` para plantilla de chat, thinking y tool calls.
- Throughput medido en RTX 4090 a 360 W: 240 tok/s de decodificación con Q4_K_M y 253 tok/s con IQ4_XS; prefill entre 12.300 y 17.300 tok/s según cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-abliterated-GGUF | ~4,1 B | 1M | Apache 2.0 | GGUF | Variante decensurada, tool calling, thinking |
| FrostWolfAI/Spark-X2.6-4B-abliterated (safetensors) | ~4,1 B | 1M | Apache 2.0 | safetensors | Modelo base de esta cuantización |
| XHToken/Spark-X2.6-4B | ~4,1 B | 1M | no disponible en la información | no disponible | Modelo original con censura estándar |
| Otros modelos de ~4B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay soporte declarado de castellano ni de otros idiomas.
- La abliteración reduce los rechazos, pero puede aumentar la probabilidad de contenido inapropiado o peligroso; requiere moderación externa en producción.
- Riesgo de alucinación inherente a modelos de 4B; Q2_K muestra "fallos factuales notables" según el autor.
- El contexto de 1M tokens es teórico; el rendimiento real con ventanas muy largas no está documentado en la información disponible.
- Requiere una build de llama.cpp con soporte `spark2_5` (build 11669 probada); versiones anteriores fallan al cargar el modelo. Las apps que empaquetan llama.cpp (Ollama, LM Studio, Jan) solo funcionan cuando su motor incluya `spark2_5`.
- Con thinking activado, presupuestos cortos de `max_tokens` pueden consumirse íntegramente dentro de `<think>` sin producir respuesta final.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y su proceso de abliteración deben verificarse para cumplimiento normativo en aplicaciones sensibles.
- No se han publicado evaluaciones de sesgo ni de seguridad para esta variante.

## Enlaces

- Repositorio GGUF: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF
- Modelo base (safetensors): https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Modelo original: https://huggingface.co/XHToken/Spark-X2.6-4B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/xblack
- Apoyo al autor: https://buymeacoffee.com/vatsalbajpai
