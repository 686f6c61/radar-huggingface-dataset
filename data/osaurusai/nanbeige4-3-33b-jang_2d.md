# OsaurusAI/Nanbeige4.3-33B-JANG_2D

## Resumen

Nanbeige4.3-33B-JANG_2D es una versión cuantizada del modelo Nanbeige4.3-33B de Nanbeige, empaquetada en formato JANG por OsaurusAI para su ejecución en hardware Apple Silicon mediante el runtime Osaurus (versión 0.25.27 o posterior). El modelo base es un LLM denso de 33.100 millones de parámetros (33.118.977.024 exactos según los safetensors), orientado a tareas de codificación agéntica, uso de herramientas y colaboración profesional, con razonamiento activado por defecto y llamadas a herramientas nativas en XML.

La relevancia de esta variante radica en su compresión extrema: cabe en 14,0 GB (3,37 bits por peso frente a los 16 bits del original, que ocupa 66,2 GB), lo que la hace ejecutable en equipos Apple Silicon con 16-24 GB de memoria unificada. A pesar de la agresiva cuantización a 2 bits en la mayoría de módulos, el autor reporta un 84,9% de coincidencia top-1 con el modelo en precisión completa sobre transcripciones retenidas de agentes, código y documentación, y un 88,0% sobre el conjunto de estilo "vendor".

El modelo soporta inglés y chino, ofrece una ventana de contexto de 524.288 tokens (512K) y se distribuye bajo licencia Apache 2.0. Es una opción interesante para desarrolladores que quieren un modelo grande de codificación y agentes corriendo localmente en Mac, aceptando cierta degradación de calidad a cambio de una huella de memoria reducida en más de un 78%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (52 capas, 56 cabezas Q, 8 cabezas KV, GQA) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos por token) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | JANG mixta: 2/3/4/5/6 bits por módulo, grupo de 64, escalas y sesgos en bf16, embeddings a 4 bits, lm_head a 5 bits, RMSNorm en bf16 |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bundle JANG para MLX / Apple Silicon) |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, es un transformer denso con arquitectura Llama estándar: 52 capas, 56 cabezas de consulta y 8 cabezas de clave/valor (GQA), ejecutado una vez por token —a diferencia de Nanbeige4.2, que usaba un transformer con bucle (looped)—. Incluye un modo de razonamiento activado por defecto mediante bloques `<think>` y soporte nativo de llamadas a herramientas en formato XML. Es un modelo de solo texto. Los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

En cuanto a la cuantización JANG_2D, se trata de un esquema por módulo con anchos de bits elegidos empíricamente: la atención Q usa 4/3/2 bits, la salida de atención y las proyecciones MLP (gate, up, down) se concentran en 2-3 bits, mientras que V y MLP down reciben anchos mayores en algunas capas. La calibración combina escalado activation-aware (AWQ) plegado exactamente en las RMSNorms, un ajuste activation-weighted (imatrix) de escala y sesgo por grupo, y redondeo GPTQ sobre Hessianos de entrada capturados solo en las proyecciones up del MLP y en la salida de atención, los módulos donde se demostró beneficio medible en datos retenidos. El resultado ocupa 13,96 GB en shards, con 3,37 bits por peso.

## Capacidades

- Generacion de texto conversacional en inglés y chino.
- Razonamiento con modo "thinking" activado por defecto (bloques `<think>`); desactivable con `enable_thinking: false`.
- Llamadas a herramientas nativas en formato XML (`<tool_call>` / `<function=NAME>` / `<parameter=KEY>`), con opción de formato JSON mediante `tool_call_format: "json"`.
- Flujo agéntico multi-paso: los resultados de herramientas se devuelven como bloques `<tool_response>` dentro de un turno de usuario; hasta 65.536 tokens nuevos por generación.
- Codificación agéntica y trabajo en terminal, según el posicionamiento del autor del modelo base.
- Contexto muy largo (512K tokens), adecuado para sesiones de agente extensas y bases de código amplias.
- Preservación del razonamiento de turnos anteriores en el prompt (controlable con `preserve_thinking: false`), recomendado para agentes multi-turno.
- No incluye capacidades de visión ni audio (solo texto).

## Casos de uso

- Codificación agéntica local en Mac: el modelo puede ejecutar ciclos completos de herramienta-resultado-edición en equipos Apple Silicon gracias a los 14 GB del bundle y su soporte XML nativo de tool calls, sin depender de la nube.
- Asistentes de terminal: el 82,9% de coincidencia top-1 en tareas de terminal (conjunto vendor-style) lo hace apto para agentes que ejecutan comandos y procesan salidas en local.
- Análisis de repositorios completos: la ventana de 512K tokens (con un coste de KV cache de 208 KiB por token en bf16) permite cargar bases de código medianas completas en una sola sesión.
- Chat privado y offline: al ejecutarse íntegramente en Apple Silicon vía Osaurus, es adecuado para despliegues donde los datos no pueden salir del dispositivo.
- Razonamiento matemático y lógico con respuestas extensas: el modo thinking por defecto y el límite de 65.536 tokens nuevos permiten trazas de razonamiento largas (el autor evaluó trazas de hasta 4.138 tokens antes de `</think>`).
- Automatización de flujos con herramientas JSON: si el pipeline existente espera function calling en JSON, el formato puede conmutarse sin reentrenamiento.
- Documentación técnica y generación de texto sobre código: el 86,9% de top-1 en código fuente (conjunto local) indica fidelidad razonable para generación y edición de código a esta tasa de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad frente al modelo BF16 de referencia:

| Modelo | Tamaño | Bits/peso | KL ↓ (vendor-style) | Top-1 ↑ (vendor-style) | KL ↓ (local) | Top-1 ↑ (local) |
|---|---|---|---|---|---|---|
| Nanbeige4.3-33B (BF16, referencia) | 66,2 GB | 16 | 0 | 100% | 0 | 100% |
| Nanbeige4.3-33B-JANG_6M | 28,4 GB | 6,87 | 0,0026 | 97,6% | 0,0036 | 97,8% |
| Nanbeige4.3-33B-JANG_4D | 21,7 GB | 5,24 | 0,0127 | 96,7% | 0,0200 | 95,6% |
| **Nanbeige4.3-33B-JANG_2D** | **14,0 GB** | **3,37** | **0,150** | **88,0%** | **0,220** | **84,9%** |

Fidelidad por área para JANG_2D (KL medio · top-1):

| Area | Posiciones | JANG_2D |
|---|---|---|
| Agéntico / tool use (vendor-style) | 254 | 0,204 · 76,8% |
| Código (vendor-style) | 416 | 0,0414 · 97,8% |
| Terminal (vendor-style) | 210 | 0,207 · 82,9% |
| Razonamiento (vendor-style) | 220 | 0,196 · 90,9% |
| Conversación (vendor-style) | 190 | 0,197 · 83,7% |
| Sesiones de agente con XML (local) | 28.090 | 0,326 · 83,7% |
| Código fuente (local) | 79.724 | 0,194 · 86,9% |
| Documentación (local) | 29.242 | 0,192 · 80,3% |

Tokens de decisión: cierre de razonamiento (`</think>`) 87,5% de 361 posiciones; inicio de tool call (`<tool_call>`) 99,5% de 216; fin de turno (`<|im_end|>`) 96,4% de 1.038. En razonamiento largo (12.920 tokens generados en 5 trazas): KL medio 0,129 y top-1 91,2%.

## Requisitos de hardware

- Memoria estimada para inferencia: 14,0 GB de pesos, más la KV cache (208 KiB por token en bf16; por ejemplo, ~2 GB por cada 10.000 tokens de contexto). Con contexto moderado, se recomienda un equipo con al menos 24 GB de memoria unificada.
- Destinado a Apple Silicon (Mac con chips M-series); no es un bundle GGUF ni CUDA. No está indicado si funciona en GPU NVIDIA.
- En Macs con 16 GB de memoria unificada será ajustado o inviable con contextos largos; con 32 GB o más (M2/M3/M4 Pro/Max) cabe con holgura incluso con ventanas amplias.
- Despliegue: runtime Osaurus 0.25.27 o posterior (librería MLX). No se menciona compatibilidad con llama.cpp, Ollama, vLLM o TGI para este bundle concreto.
- Latencia y throughput: no disponibles. Cabe esperar velocidades propias de MLX en Apple Silicon para un modelo denso de 33B a ~3,4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamaño/cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-JANG_2D (este) | 33,1B | 512K | 14,0 GB (3,37 bits, JANG) | Apache 2.0 | Solo Apple Silicon (MLX/Osaurus); thinking y tool calls XML nativos |
| Nanbeige4.3-33B-JANG_4D (mismo autor) | 33,1B | 512K | 21,7 GB (5,24 bits) | Apache 2.0 | Mayor fidelidad (96,7% top-1 vendor-style) a cambio de 7,7 GB más |
| Nanbeige/Nanbeige4.3-33B (BF16) | 33,1B | 512K | 66,2 GB (16 bits) | Apache 2.0 | Referencia de máxima calidad; requiere hardware servidor o Mac con 96 GB+ |
| Qwen2.5-Coder-32B-Instruct | 32,5B | 128K | GGUF desde ~2 bits | Apache 2.0 | Alternativa de código en tamaño similar; ecosistema GGUF más amplio, contexto menor |

## Limitaciones y advertencias

- Degradación medible por la cuantización a ~3,4 bits: 84,9-88,0% de top-1 frente al BF16. El área más afectada es el uso agéntico de herramientas (76,8% top-1 vendor-style; KL 0,326 en sesiones de agente locales), por lo que las decisiones de agente pueden divergir del modelo original con más frecuencia que en generación de código.
- Solo texto: sin capacidades de visión ni audio.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Contexto de 512K con KV cache costosa (208 KiB/token): contextos muy largos exigen memoria unificada considerable en Mac.
- Compatibilidad restringida al runtime Osaurus (0.25.27+) en Apple Silicon; no es un GGUF estándar ni está pensado para vLLM/TGI/llama.cpp según la información disponible.
- El modelo base hereda los riesgos habituales de alucinación de LLM de 33B; no se publican evaluaciones de veracidad ni sesgos específicos.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque deben respetarse los términos de atribución.
- El chat template escribe `<|im_start|>` por sí mismo: no debe añadirse un BOS adicional en el prompt.
- El razonamiento de turnos anteriores se conserva en el prompt por defecto, lo que consume contexto rápidamente en sesiones largas si no se ajusta `preserve_thinking: false`.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/OsaurusAI/Nanbeige4.3-33B-JANG_2D
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Runtime Osaurus: https://osaurus.ai
