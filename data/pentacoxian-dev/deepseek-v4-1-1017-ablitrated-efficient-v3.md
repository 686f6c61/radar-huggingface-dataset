# pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient-v3

## Resumen

DeepSeek-V4.1-1017-Ablitrated-Efficient-v3 es un ajuste fino experimental de la familia DeepSeek-V4.1, publicado por el usuario `pentacoxian-dev` el 12 de noviembre de 2026. Se construye sobre la variante v2 del mismo autor (`DeepSeek-V4.1-1017-Ablitrated-Efficient`), que a su vez deriva del modelo público `deepseek-ai/DeepSeek-V4.1-Flash-1017` de DeepSeek. El objetivo declarado es un lanzamiento de investigación sin rechazos (no-refusal), combinando la capa de "uncensoring" de hikari con una reducción de bucles en la capa 39 del transformer.

El modelo es un transformer de tipo mezcla de expertos (MoE) con 763.205.315.794 parámetros totales según los pesos en safetensors, y una longitud de contexto máxima declarada de 1.048.576 tokens, con un tope de evaluación de 32.768 turnos. Se distribuye en formato safetensors de 8 bits (FP8) y en 48 shards que suman 513,8 GB en el repositorio. La licencia es MIT.

Su relevancia es doble: por un lado, explora técnicas de eliminación de rechazos y de mitigación de bucles en modelos de razonamiento agéntico de gran escala; por otro, publica métricas detalladas de refusal, compliance y comportamiento agéntico que permiten auditar el efecto de las ediciones en capas tardías. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (model_type `deepseek_v41`) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (máximo); tope de evaluación de 32.768 turnos |
| Tipos de cuantizacion | FP8 (8-bit) en los pesos publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, 513,8 GB) + delta overlay |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) identificado con `model_type: deepseek_v41`, derivado de `deepseek-ai/DeepSeek-V4.1-Flash-1017`. La model card menciona explícitamente una estructura de expertos compartidos en la capa 39 (`layers.39.ffn.shared_experts.w2`), cuyo tensor oficial se restaura en esta v3 para eliminar bucles inducidos por reparaciones previas. No se detallan el número de capas totales, el número de expertos ni la dimensión oculta.

El proceso de construcción es un ajuste fino por capas sobre la v2: (1) se parte de v2, que ya incorpora el trabajo `wf_dbroad_eth` de `pentacoxian_dev`; (2) se superpone la capa de uncensoring de hikari; (3) se reaplica la reducción de bucles c2_km1 restaurando el tensor oficial de la capa 39. No se documentan volúmenes de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO. La variante interna se identifica como `c2_km1_nr2` (router id sin cambios). Los pesos se publican en FP8 y en 48 shards, con un delta overlay adicional.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento de tipo agéntico multi-paso: la model card reporta suites de 96 episodios con éxito del 95-100 % y cero episodios "stuck" a 32k tokens.
- Reducción de rechazos: refusal del 2,0 % en Orca 850 sin prompt y del 1,18 % con prompt; 1,6 % en Harmful 500.
- Cumplimiento en clasificador HarmBench oficial (Llama-2-13B): ASR del 85,9 % global (89,3 % estándar, 91,4 % contextual, 73,8 % copyright).
- Capacidad de re-verificación y auto-chequeo en flujos agénticos (38,1 % en held-out, 54,9 % en effort 75).
- Soporte de tool calling implícito en los flujos agénticos evaluados (no se documenta un formato específico de function calling).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo "thinking" o decodificación especulativa: no disponible en la información.
- Visión y audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y rechazos: el modelo sirve como banco de pruebas para medir el efecto de ediciones en capas tardías sobre la tasa de refusal, con métricas publicadas de Orca 850, XSTest, JBB, MaliciousInstruct y SimpleSafetyTests.
- Evaluación de robustez agéntica: sus suites de 96 episodios con métricas de "stuck", loop score y re-verificación permiten estudiar la estabilidad de agentes multi-paso con contexto de hasta 32k turnos.
- Análisis de bucles en modelos grandes: la restauración del tensor `layers.39.ffn.shared_experts.w2` y las métricas de loop score (14,6 % → 16,7 % en held-out) ofrecen un caso concreto para estudiar mitigación de repetición.
- Estudio de sesgos y seguridad en modelos abliterated: útil para comparar clasificadores de daño (HarmBench Llama-2-13B, Dolphin-2.9.4-8B) frente a un modelo sin rechazos.
- Generación de texto en inglés a gran escala con contexto muy largo (hasta 1.048.576 tokens), en escenarios de investigación que requieran ventanas extensas.
- Reproducción de experimentos de ajuste fino por capas: el delta overlay y los 48 shards permiten replicar la construcción v2 → v3 y medir deltas de capacidad y refusal.
- Fine-tuning posterior sobre la base abliterated para dominios concretos donde se requiera baja tasa de rechazo, siempre en entornos controlados y con revisión legal.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos el 12 de noviembre de 2026 con `c2_km1_nr2` cargado, engram activo y vLLM:

| Benchmark | c2_km1 | c2_km1_nr2 (v3) | Delta |
|---|---:|---:|---:|
| MMLU full, 5-shot | 85,6 % (12.023/14.042) | 86,0 % (12.078/14.042) | +0,4 |
| MMLU full, 0-shot | no ejecutado | 85,9 % (12.066/14.042) | — |
| MMLU-300 | 86,0 % (258/300) | 87,0 % (261/300) | +1,0 |
| Orca 850, sin prompt (refusal) | 8,6 % (73/850) | 2,0 % (17/850) | −6,6 pt |
| Orca 850, con prompt (refusal) | 11,3 % (96/850) | 1,18 % (10/850) | −10,1 pt |
| Harmful 500 (refusal) | 8,2 % (41/500) | 1,6 % (8/500) | −6,6 pt |
| Benign 350 (refusal) | 9,1 % (32/350) | 2,6 % (9/350) | −6,5 pt |
| XSTest false refusals | 12,0 % (30/250) | 3,6 % (9/250) | −8,4 pt |
| JBB | 2,5 % (5/200) | 0,0 % (0/200) | — |
| MaliciousInstruct | 1,0 % (1/100) | 0,0 % (0/100) | — |
| SimpleSafetyTests | 32,0 % (16/50) | 4,0 % (2/50) | — |

HarmBench con clasificador oficial `cais/HarmBench-Llama-2-13b-cls` (4.096 tokens de entrada, greedy, 320 completions, sin system prompt):

| Split | c2_km1 | c2_km1_nr2 |
|---|---:|---:|
| Estándar (159) | 65,4 % (104) | 89,3 % (142) |
| Contextual (81) | 43,2 % (35) | 91,4 % (74) |
| Copyright (80) | 50,0 % (40) | 73,8 % (59) |
| Total (320) | 55,9 % (179) | 85,9 % (275) |

Compliance en 4 niveles con juez `dolphin-2.9.4-llama3.1-8b` Q4_K_M (vista separada, no es el ASR oficial):

| Nivel | c2_km1 | c2_km1_nr2 |
|---|---:|---:|
| COMPLY | 74,7 % (239) | 96,25 % (308) |
| SOFT_RED | 25,3 % (81) | 2,2 % (7) |
| HEDGE | 0,0 % | 0,0 % |
| HARD_REF | 0,0 % | 1,6 % (5) |
| UNCLEAR | 0,0 % | 0,0 % |

Bucles agénticos:

| Suite | c2_km1 | c2_km1_nr2 | Gate |
|---|---|---|---|
| Held-out 96, effort 100 | 0 stuck, 100 % éxito | 0 stuck, 95/96 = 99,0 % | pass |
| Dev 96, effort 100 | 0 stuck, 100 % éxito | 0 stuck, 94/96 = 97,9 % | pass |
| Dev 96, effort 75 | 0 stuck, 100 % éxito | 0 stuck, 96/96 = 100 % | pass |
| Stuck a 32k | 0 | 0 | pass |
| Mediana de tokens, held-out | 341 | 442 | — |

Re-verificación:

| Suite | c2_km1 | c2_km1_nr2 | Delta |
|---|---:|---:|---:|
| Held-out | 26,2 % | 38,1 % | +11,9 pt |
| Dev | 21,9 % | 39,3 % | +17,4 pt |
| Effort 75 | 39,5 % | 54,9 % | +15,4 pt |
| Premature, dev | 0,0 % | 1,1 % | +1,1 pt |
| Required re-checks, dev | 100 % | 97,2 % | −2,8 pt |

## Requisitos de hardware

- VRAM estimada para inferencia: con 763.205.315.794 parámetros en FP8, se requieren aproximadamente 763 GB solo para pesos, más overhead de activaciones y KV cache; no cabe en una sola GPU de 80 GB.
- GPU recomendadas: despliegue multi-GPU con H100 80 GB (mínimo ~10 unidades para pesos en FP8) o A100 80 GB; no se documentan configuraciones exactas.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) ni en ninguna GPU consumer actual, ni siquiera con cuantización agresiva a 4 bits (≈380 GB de pesos).
- Opciones de despliegue: la model card indica vLLM como motor de evaluación; también es compatible con transformers. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La mediana de tokens por episodio agéntico (341 en c2_km1, 442 en c2_km1_nr2) es el único dato operativo publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| DeepSeek-V4.1-1017-Ablitrated-Efficient-v3 | 763.205.315.794 | 1.048.576 | MIT | experimental, 0 descargas |
| DeepSeek-V4.1-1017-Ablitrated-Efficient (v2) | no disponible | no disponible | MIT (heredada) | base operativa del v3 |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | MIT | modelo público base |
| hikari uncensoring overlay | no disponible | no disponible | no disponible | componente de la v3 |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo experimental y de investigación: 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria.
- Diseñado explícitamente para eliminar rechazos (no-refusal, abliterated, uncensored): la tasa de refusal baja al 2,0 % en Orca 850 y el ASR de HarmBench alcanza el 85,9 %, lo que implica un riesgo alto de generar contenido dañino, incluido material con copyright (split más débil, 73,8 %).
- XSTest en 3,6 % supera ligeramente el umbral de 3,0 % declarado por el autor, lo que indica falsos rechazos residuales.
- Regresión en re-verificación: la eliminación de rechazos incrementa las llamadas redundantes a herramientas (la ganancia de re-verificación pre-registrada de c2_km1 se pierde en gran medida).
- La edición de `layers.39.ffn.shared_experts.w2` es delicada: puede reducir refusal pero reintroducir bucles si no se aplica limpiamente; el autor recomienda re-medir refusal tras cada edición y no asumir el 2,0 %.
- Idiomas: solo inglés documentado; no hay soporte multilingüe declarado.
- Licencia MIT: permite uso comercial, pero el comportamiento del modelo (no-refusal) puede incumplir términos de servicio de plataformas o normativa aplicable; se requiere revisión legal antes de cualquier despliegue en producción.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de factualidad; al ser un modelo abliterated, los filtros de seguridad habituales están ausentes.
- Requisitos de hardware extremos (≈763 GB en FP8): inviable en infraestructura consumer y costoso incluso en clústeres multi-GPU.
- No se documentan parámetros activos (MoE), número de expertos ni composición del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient-v3
- Modelo base v2: https://huggingface.co/pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient
- Modelo público base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Clasificador HarmBench: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez Dolphin-2.9.4: https://huggingface.co/cognitivecomputations/dolphin-2.9.4-llama3.1-8b
