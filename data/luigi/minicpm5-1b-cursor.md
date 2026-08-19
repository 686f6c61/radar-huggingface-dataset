# Luigi/minicpm5-1b-cursor

## Resumen

MiniCPM5-1B-CURSOR es un fine-tune del modelo openbmb/MiniCPM5-1B (1,08 mil millones de parámetros) especializado en el protocolo CURSOR: un agente de streaming que convierte transcripciones largas de reuniones (en chino tradicional y en inglés) en notas estructuradas y ancladas a la fuente mediante operaciones de edición (ADD/UPD/DEL/CMP/NOP) sobre un estado de notas en evolución. A diferencia de los enfoques de map-reduce o de bucles ReAct, este modelo procesa la transcripción por fragmentos y mantiene el estado de las notas de forma incremental, lo que lo hace apto para despliegue en dispositivos con recursos limitados.

El modelo se distribuye en formato GGUF cuantizado a Q4_K_M, ocupa aproximadamente 650 MB y está pensado para ejecutarse con llama.cpp, incluso en el navegador mediante WASM. Está licenciado bajo Apache-2.0 y su relevancia radica en que demuestra que es posible realizar resumen agentico de reuniones de alta calidad con un modelo de menos de 1 mil millones de parámetros, siempre que se combine con un harness de verificación externo. No es un modelo de chat general: requiere el prompt de sistema y la representación de estado específica del harness CURSOR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida linear+full (base MiniCPM5-1B) |
| Parámetros totales | 1.080.632.832 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (según la model card; la base MiniCPM5-1B soporta hasta 128K en configuraciones no fine-tuned) |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | Chino (zh, con énfasis en zh-TW) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura base es MiniCPM5-1B, un transformer denso con atención híbrida que combina mecanismos de atención lineal y full attention. El fine-tuning se realizó sobre trazas de profesor generadas por Gemma-4-31B-it (con NVFP4 y razonamiento activado), filtradas por un juez local gpt-oss-20b para seleccionar solo los bullets verificables como objetivos de entrenamiento. Los datos de entrenamiento fueron inicialmente 100% sintéticos (transcripciones de reuniones densas en revisiones, en zh-TW y en), y posteriormente se añadió una mezcla con mayoría de ASR real (58,9% real / 41,1% sintético) en el checkpoint candidato p20.

Durante el renderizado se aplican dos guards deterministas: `promote_decision_summaries` (mueve bullets con forma de resumen de decisión a la sección DECISIONS) y `enforce_decision_chain` (mantiene solo la última bullet de polaridad opuesta sobre un mismo tema). Además, el modelo se acompaña de un verificador externo (`Luigi/granite-4.0-350m-verifier`, Apache-2.0, ~215 MB) que valida en streaming las operaciones DECISIONS/ACTIONS y re-verifica cada bullet final contra la transcripción completa. El verificador es imprescindible para alcanzar la tasa de inversión de 0-2/20 reportada; el modelo solo alcanza 4/20 sin él.

## Capacidades

- Resumen agentico de reuniones mediante el protocolo CURSOR: emite operaciones de edición (ADD/UPD/DEL/CMP/NOP) contra un estado de notas en evolución, sin map-reduce ni bucles ReAct.
- Procesamiento por streaming de transcripciones largas: prefill de ~2.9k tokens por paso, con presupuesto de contexto de 4k tokens.
- Generación de notas estructuradas con anclaje a la fuente: los bullets finales se re-verifican contra la transcripción completa.
- Soporte de razonamiento híbrido: el modelo emite cadenas de razonamiento internas (`thinking`) que deben desactivarse con `--reasoning off` para su uso en el harness.
- Capacidad multilingüe: inglés y chino (zh), con especial atención al chino tradicional (zh-TW).
- No es un modelo de chat general: requiere el prompt de sistema y la representación de estado exactos que produce el harness CURSOR.

## Casos de uso

- Resumen de reuniones en tiempo real: el modelo procesa la transcripción por fragmentos y mantiene un estado de notas en evolución, ideal para herramientas de documentación que necesitan actualizar actas mientras la reunión sigue en curso.
- Generación de actas estructuradas: produce secciones de DECISIONS y ACTIONS ancladas a la transcripción, con los guards deterministas que aseguran que las decisiones se promueven correctamente y que solo queda la última versión de cada tema.
- Procesamiento de transcripciones ASR ruidosas: el checkpoint p20, entrenado con mayoría de datos reales de ASR, mejora la validez de las operaciones en reuniones reales (88-100% de operaciones válidas en held-out).
- Aplicación on-device en navegador: la demo WASM ejecuta el modelo completo en el cliente, sin servidor, lo que permite resumir reuniones en dispositivos con restricciones de privacidad o conectividad.
- Integración en pipelines de documentación empresarial: el modelo puede conectarse a sistemas de transcripción y generar notas automáticamente, con el verificador como puerta de calidad para evitar inversiones de decisión.
- Análisis de podcasts y entrevistas: los datos de entrenamiento incluyen podcasts reales zh-TW, lo que lo hace adecuado para resumir contenido de audio previamente transcrito.

## Benchmarks y rendimiento

Los resultados publicados corresponden al nivel T1 (n=20, jueces locales, mayoría 3x) y comparan el modelo con un baseline de map-reduce usando Qwen3.5-9B:

| Configuración | INVERT | FAITH | COVER | SYNTH |
|---|---|---|---|---|
| p15d, solo modelo (sin verificar) | 4/20 | 3.57 | 3.00 | 2.30 |
| **p15d + verificador (desplegado)** | **0-2/20** | **4.43** | 2.85-3.80 | 2.35-3.40 |
| Baseline map-reduce (Qwen3.5-9B) | 3/20 | 3.50 | 3.05 | 2.60 |

La pantalla de capacidad G1 pasa en ambos idiomas (con los guards). El acuerdo del verificador con gpt-oss-20b es del 97% en inglés y 92% en chino sobre evidencia limpia. El checkpoint p20, evaluado sobre 3 reuniones reales retenidas del entrenamiento, mejora o iguala la validez de operaciones en todas ellas (80% → 88% en zh-TW, 100% en ambos casos, 86% → 100% en en), aunque la muestra es direccional (n=3) y no un resultado de puerta de embarque.

## Requisitos de hardware

- VRAM estimada: aproximadamente 650 MB para el GGUF Q4_K_M, más overhead de contexto (4k tokens).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia con capas GPU completas. También es viable en CPU pura con llama.cpp.
- Compatible con GPU de consumo: sí, desde una RTX 3060 6GB o similar puede ejecutarse con `--n-gpu-layers 999`.
- Opciones de despliegue: llama.cpp (`llama-server`), integración con el harness CURSOR (`eval/run_arms.py`), demo WASM en navegador.
- Latencia y throughput: no disponible en la información proporcionada. Se sabe que el prefill por paso es de ~2.9k tokens y el contexto máximo es de 4k tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-1B-CURSOR (p15d) | 1.08B | 4k (fine-tune) | Apache-2.0 | Resumen agentico de reuniones | GGUF Q4_K_M |
| MiniCPM5-1B (base) | 1.08B | 128K | Apache-2.0 | LLM on-device, tool-calling | Safetensors, GGUF |
| Qwen3.5-9B (baseline map-reduce) | 9B | no disponible | no disponible | Resumen de reuniones con map-reduce | no disponible |

La comparación con Qwen3.5-9B es directa en la tabla de benchmarks del proyecto: el modelo de 1B con verificador supera al baseline de 9B en todas las métricas (INVERT 0-2/20 vs 3/20, FAITH 4.43 vs 3.50). No se dispone de datos de otros modelos comparables de resumen agentico de reuniones.

## Limitaciones y advertencias

- No es un modelo de chat general: requiere el prompt de sistema y la representación de estado exactos del harness CURSOR. Usarlo fuera de este contexto produce resultados no válidos.
- Riesgo de alucinación: el modelo solo alcanza 0/20 inversiones cuando se usa con el verificador; sin él, mide 4/20. Se ha documentado un caso de fabricación de un bullet DECISIONS (una decisión sobre "Linux como sistema operativo preferido") sin fundamento en la fuente.
- Limitación de idioma: el nivel T2 para chino es sintético; el chino contestado real (reuniones zh-TW con decisiones, a diferencia de podcasts) sigue siendo el mayor vacío de medición del proyecto.
- Ruido del juez: el margen de error de los jueces es de ±0.4-0.5 en las métricas FAITH/SYNTH, con n=20 por nivel.
- El checkpoint p20 es un candidato no validado con n=3 reuniones held-out; no es un resultado de puerta de embarque. Para despliegues críticos, se recomienda usar p15d.
- El verificador `Luigi/granite-4.0-350m-verifier` es un componente adicional obligatorio para alcanzar los números de calidad publicados. Sin él, la tasa de inversión se degrada a 4/20.
- La discriminación zh sobre evidencia ASR real ruidosa sigue siendo una brecha conocida y documentada en el repositorio `agentic-summarizer` (ver `RESULTS.md`).

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Luigi/minicpm5-1b-cursor
- Demo WASM en navegador: https://hf.co/spaces/Luigi/cursor-wasm-demo
- Repositorio de experimentos: https://huggingface.co/Luigi/minicpm5-1b-cursor-experiments
- Repositorio del modelo base MiniCPM5-1B: https://github.com/OpenBMB/MiniCPM
- Verificador: `Luigi/granite-4.0-350m-verifier` (Apache-2.0, ~215 MB)
- Repositorio del agente `agentic-summarizer` (referenciado en la model card, no enlazado directamente)
