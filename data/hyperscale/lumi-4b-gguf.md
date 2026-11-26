# HyperScale/lumi-4b-GGUF

## Resumen

Lumi-4B es un modelo de lenguaje de aproximadamente 4.000 millones de parámetros (3.973.556.832 exactos según los pesos en safetensors) desarrollado por el CEIA (Centro de Excelencia en Inteligencia Artificial, Brasil) y especializado en portugués. Su arquitectura es híbrida Mamba-2 / atención, basada en la familia NemotronH en variante densa, lo que combina capas de estado recurrente con capas de atención clásica para reducir el coste computacional en contextos largos. La versión aquí descrita es una conversión a GGUF realizada por el usuario HyperScale para su uso con llama.cpp.

El modelo resuelve el problema de disponer de un LLM competente en portugués con un tamaño que cabe en GPUs de consumo (12 GB de VRAM o menos en cuantización Q4_K_M) y con velocidades de generación cercanas a los 100 tokens por segundo en una RTX 3060. Incluye modo de razonamiento ("thinking") activado por defecto en la plantilla de chat, que puede desactivarse por petición, y está pensado para tareas conversacionales, clasificación de respuestas cortas y evaluación de riesgos en pipelines de agentes.

Su relevancia actual radica en que demuestra que un modelo híbrido de 4B puede mantener una precisión cercana a la del BF16 original (57,88 % frente a 59,36 % en Global-MMLU PT) tras cuantización Q4_K_M, con un consumo de 3,1 GB de VRAM y una velocidad de 93-99 tok/s. La licencia no está declarada en el repositorio original, lo que constituye la principal advertencia para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 / atención (NemotronH, densa) |
| Parámetros totales | 3.973.556.832 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 16.384 tokens en llama.cpp con `-c 16384`; prefill de hasta ~24k tokens en NF4 con transformers (limitado por VRAM, no por arquitectura) |
| Tipos de cuantización | Q4_K_M (GGUF); Q8_0 (GGUF); BF16 (GGUF de referencia); NF4 con bitsandbytes para transformers |
| Idiomas soportados | Portugués (pt) |
| Licencia | No disponible (el repositorio original no la declara; se aplican los términos del modelo base) |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

Lumi-4B emplea una arquitectura híbrida de tipo NemotronH en configuración densa, que intercala capas de Mamba-2 (modelo de espacio de estados) con capas de atención Transformer tradicionales. Este diseño reduce el coste de memoria y cómputo en secuencias largas en comparación con un Transformer puro, manteniendo la capacidad de atención selectiva sobre el contexto. El patrón híbrido incluye capas MLP identificadas con guion en la implementación nativa de `NemotronH` en transformers 5.8.1 (la versión 5.5 no las mapea correctamente).

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del repositorio GGUF no incluye estos datos y el repositorio original no los detalla en la información proporcionada. Sí se documenta que el modelo incorpora un modo de razonamiento ("thinking") en la plantilla de chat, activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`. La conversión a GGUF fue realizada por HyperScale sobre la revisión `1c8928e1` del modelo base `ceia-br/lumi-4b`.

## Capacidades

- Generación de texto conversacional en portugués, con soporte multi-turno.
- Modo de razonamiento ("thinking") activable o desactivable por petición mediante la plantilla de chat.
- Clasificación de respuestas cortas: el modelo puede emitir etiquetas concisas (letras, dígitos, JSON) con latencias de 448-679 ms en prompts de ~1-1,8k tokens.
- Evaluación de riesgos en comandos de shell (tool-call safety judge): identifica comandos inseguros con una tasa de acierto del 100 % (18/18) en el conjunto de prueba documentado.
- Tareas de resumen de resultados de agentes (MRs abiertos vs fusionados, gates retenidos, timeouts) con puntuaciones de 0,96-0,97 en verificaciones deterministas.
- Respuesta a preguntas de opción múltiple (formato A-D) sobre conocimiento general en portugués (Global-MMLU PT).
- No dispone de capacidades de visión, audio ni procesamiento multimodal: es un modelo exclusivamente de texto.
- Soporte de tool calling no documentado explícitamente en la información disponible; el uso como juez de seguridad de comandos sugiere capacidad de razonamiento sobre herramientas, pero no se confirma una API de function calling nativa.

## Casos de uso

- **Clasificador de respuestas cortas en producción**: el modelo puede emitir etiquetas compactas (una letra, un dígito o un JSON de cinco números) con latencias p50 de 448-679 ms para prompts de ~1-1,8k tokens en una RTX 3060. Es adecuado para triaje de tickets, categorización de correos o etiquetado de datos en lotes, donde el formato de salida importa más que la latencia absoluta.

- **Juez de seguridad de comandos de shell**: integrado como validador previo a la ejecución de comandos en un agente, Lumi puede responder cinco preguntas de riesgo sí/no sobre un comando dado. En el conjunto de 39 comandos etiquetados, detectó el 100 % de los inseguros (18/18) con solo un falso positivo sobre 21 comandos seguros, a ~440 ms p95. Es útil como capa de defensa en pipelines de agentes que ejecutan código.

- **Resumen de resultados de agentes en CI/CD**: el modelo genera resúmenes de 15 casos reales (MRs, gates, timeouts) con una puntuación de 0,96 en verificaciones deterministas (hechos requeridos presentes, sin afirmaciones falsas de estado, sin identificadores inventados). Puede integrarse en un bot que reporte el estado de un pipeline tras cada ejecución, con la advertencia de usar `repeat_penalty 1.1` para evitar bucles.

- **Atención al cliente automatizada en portugués**: con 16k tokens de contexto en llama.cpp y modo thinking desactivable, el modelo puede gestionar conversaciones multi-turno con historial largo. Su velocidad de 93-99 tok/s en Q4_K_M permite respuestas fluidas en una GPU de consumo, adecuado para despliegues en local o en edge.

- **Evaluación de pares en verificación facial (modo face compare)**: Lumi es text-only, pero puede actuar como capa de decisión sobre la traza de un matcher facial (RetinaFace-R50 + AdaFace IR-101), respondiendo tres preguntas fijas de sí/no: misma persona, caso límite, solicitar huella. Se documenta un dataset de 38.000 pares de seis conjuntos de verificación facial (LFW, AgeDB-30, CALFW, CPLFW, CFP-FP, CFP-FF), lo que lo hace útil en pipelines de KYC o control de acceso donde se requiere una segunda opinión explicable.

- **Triaje de incidencias en producción (con cautela)**: el modelo responde en ~420 ms (p95 ~440 ms) a preguntas de severidad, urgencia, tipo y área de código de una incidencia. Sin embargo, solo coincidió con el criterio humano en 44 de 87 incidencias y no superó el azar al ordenar defectos reales frente a rechazos de reglas de negocio (0,53 vs 0,58). Es adecuado únicamente en modo sombra (registro sin actuación) hasta validar su fiabilidad en el dominio concreto.

- **Generación de resúmenes de documentos en portugués**: con contexto de hasta 16k tokens y la arquitectura híbrida Mamba-2, el modelo puede procesar documentos largos en una sola pasada sin el coste cuadrático de un Transformer puro. Adecuado para resumir informes, actas o hilos de soporte en portugués.

## Benchmarks y rendimiento

Los datos proceden de las mediciones publicadas por el autor de la conversión GGUF en una RTX 3060 de 12 GB con llama.cpp b11985.

**Global-MMLU PT** (14.042 preguntas, 0-shot, greedy, thinking off, puntuación por primera letra A-D):

| Variante | Precisión | Sin parsear | Business | Humanities | Medical | Other | STEM | Social Sciences |
|---|---|---|---|---|---|---|---|---|
| `lumi-4b-Q4_K_M.gguf` | 57,88 % | 6 | 59,8 % | 50,3 % | 61,4 % | 66,1 % | 56,6 % | 66,3 % |
| BF16 (model card original) | 59,36 % | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: el método del BF16 no está declarado (probablemente log-likelihood), por lo que los dos números no son estrictamente comparables.

**Benchmark de resumen de tareas** (15 resúmenes en portugués, verificaciones deterministas, greedy, thinking off):

| Variante | Puntuación | Afirmaciones falsas | Bucles hasta el límite | Latencia | Velocidad | VRAM |
|---|---|---|---|---|---|---|
| BF16 GGUF | 0,97 | 0/15 | 0 | 6,1 s | 27 tok/s | 7,6 GB |
| Q8_0 | 0,96 | 0/15 | 0 | 2,6 s | 66 tok/s | 4,3 GB |
| Q4_K_M | 0,96 | 1/15 | 2 | 2,4 s | 93 tok/s | 3,1 GB |
| Q4_K_M + `repeat_penalty 1.1` | 0,96 | 0/15 | 0 | 1,8 s | 93 tok/s | 3,1 GB |
| transformers NF4 (bitsandbytes) | 0,97 | 0/15 | 1 | 4,5 s | 48 tok/s | ~6 GB |

**Clasificador de respuestas cortas** (NF4, RTX 3060):

| Formato de respuesta | Prompt | p50 | p95 |
|---|---|---|---|
| JSON con cinco números | ~1,8k tokens | 1557 ms | 1601 ms |
| Una línea de letras (`S0 M0 D1 K0 E0`) | ~1,8k tokens | 679 ms | 765 ms |
| Un dígito por pregunta, contexto condensado | ~1k tokens | 448 ms | 476 ms |

**Juez de seguridad de comandos**: 18/18 comandos inseguros detectados, 1/21 comandos seguros marcado como alto riesgo, a la latencia de la última fila (~440 ms p95).

**Triaje de incidencias**: coincidencia con criterio humano en 44/87 incidencias; ordenación de defectos reales frente a rechazos con AUC 0,53 (azar = 0,5), frente a 0,58 del orden por número de eventos.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - Q4_K_M: 3,1 GB con contexto de 8k.
  - Q8_0: 4,3 GB.
  - BF16 GGUF: 7,6 GB.
  - NF4 con transformers: 3,2 GB de pesos, ~6 GB en total con activaciones para prompts cortos; prompts de ~24k tokens caben en una GPU de 12 GB, pero prompts mucho más largos agotan la memoria.
- **GPU recomendadas**:
  - RTX 3060 12 GB: validada por el autor, 93-99 tok/s en Q4_K_M.
  - RTX 4090, A100, H100: sin datos de rendimiento publicados, pero holgadas para el tamaño del modelo.
- **Cabe en GPU de consumo**: sí, en cualquier GPU con 4 GB o más de VRAM para Q4_K_M (RTX 3050 8 GB, RTX 3060, RTX 4060, etc.). Para NF4 con transformers se recomiendan 8 GB o más.
- **Opciones de despliegue**:
  - llama.cpp (`llama-server`) con `-ngl 99 -c 16384 --jinja --repeat-penalty 1.1`.
  - transformers 5.8.1 con torch 2.10 / CUDA 13, `mamba-ssm 2.3.2.post1` y `causal-conv1d 1.6.1.post4` (ruedas precompiladas para cu13/torch 2.10). Sin estos kernels, la ruta pure-torch requiere ~6 GiB de activaciones incluso para prompts cortos.
  - bitsandbytes NF4 para servir los pesos originales en 4 bits tras una API compatible con OpenAI.
  - vLLM, TGI y Ollama: no documentados en la información disponible.
- **Latencia y throughput**:
  - Generación: ~99 tok/s (Q4_K_M, RTX 3060, contexto 8k); 93 tok/s en el benchmark de resumen; 66 tok/s en Q8_0; 27 tok/s en BF16.
  - Clasificación: ~60 ms + 0,22 ms por token de prompt + ~20 ms por token de salida (NF4, RTX 3060).
  - Prefill: un prompt de ~24k tokens en una sola pasada con NF4; sin chunked prefill (los caminos Mamba arrancan desde estado cero, por lo que dividir el prompt produce respuestas incorrectas).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Los modelos de la misma categoría (LLM densos de ~4B parámetros especializados en portugués o multilingües con arquitectura híbrida) no están documentados en la información disponible, por lo que no se puede establecer una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lumi-4B (este) | 3,97B | 16k en llama.cpp | No disponible | GGUF en HF, base en safetensors |
| Alternativas de ~4B en portugués | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia no declarada**: el repositorio original `ceia-br/lumi-4b` no especifica licencia en el momento de la conversión. Esto impide confirmar los términos de uso comercial; es imprescindible contactar con CEIA antes de desplegar en producción.
- **Solo portugués**: el modelo está entrenado y evaluado exclusivamente en portugués (tag `pt`). Su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- **Riesgo de bucles en greedy decoding**: sin `repeat_penalty 1.1`, el modelo entró en bucle en 2 de 15 casos del benchmark de resumen, uno de ellos repitiendo una referencia de MR hasta el límite de tokens y generando un identificador inexistente. Es obligatorio aplicar la penalización de repetición en producción.
- **Alucinación de identificadores**: en el mismo benchmark, la variante Q4_K_M sin penalización produjo una afirmación falsa (1/15) y un identificador no presente en la entrada. Con penalización se eliminaron ambos, pero el riesgo persiste en dominios donde los identificadores son críticos.
- **Sin chunked prefill**: la arquitectura Mamba-2 arranca desde estado cero en cada forward multi-token; dividir un prompt en trozos produce respuestas incorrectas. Los prompts deben procesarse en una sola pasada, lo que limita el contexto efectivo a la VRAM disponible (~24k tokens en NF4 con 12 GB).
- **Rendimiento limitado en triaje de incidencias**: coincidencia con criterio humano en solo 44/87 casos y AUC de 0,53 al ordenar defectos frente a rechazos. No es fiable para automatizar la priorización de incidencias sin supervisión; el autor lo mantiene en modo sombra.
- **Dependencia de kernels específicos**: la ruta transformers requiere `mamba-ssm 2.3.2.post1` y `causal-conv1d 1.6.1.post4` compilados para cu13/torch 2.10, además de transformers 5.8.1. Versiones anteriores (5.5) no mapean correctamente las capas MLP del patrón híbrido.
- **Modelo denso de 4B**: no es un MoE; su capacidad de razonamiento complejo es limitada en comparación con modelos de mayor tamaño. Los benchmarks de MMLU (57,88 %) sitúan su conocimiento general en un rango moderado.
- **Sin datos de sesgos**: no se han publicado evaluaciones de sesgo, toxicidad o alineación en la información disponible.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-03, lo que puede indicar un error de metadatos o una fecha de publicación programada; conviene verificar la disponibilidad real de los archivos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/HyperScale/lumi-4b-GGUF
- Modelo base: https://huggingface.co/ceia-br/lumi-4b
- Paper de referencia (arXiv:2510.14866): https://arxiv.org/abs/2510.14866
- Dataset Global-MMLU: https://huggingface.co/datasets/CohereLabs/Global-MMLU
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de mamba-ssm: https://github.com/state-spaces/mamba
- Repositorio de causal-conv1d: https://github.com/Dao-AILab/causal-conv1d
