# devsecllm/Ornith-1.5-122B-NVFP4-ablated

## Resumen

Ornith-1.5-122B-NVFP4-ablated es una variante "abliterated" del checkpoint cuantizado Ornith-1.5-122B-NVFP4, publicado por el usuario devsecllm sobre el modelo base de ornith-ai. Se trata de un derivado de solo pesos: el tokenizador, la plantilla de chat y el `config.json` son idénticos byte a byte al checkpoint original, de modo que puede desplegarse en la misma pila de servicio sin cambios de código. La intervención consiste en una ablación de la dirección de rechazo mediante un LoRA de rango 3 que modifica únicamente 24 de los 113.047 tensores del modelo (79,3 MB de 73 GB).

El modelo pertenece a la familia Qwen3.5-MoE según la etiqueta `qwen3_5_moe` y está cuantizado en NVFP4 con ModelOpt, con proyecciones de atención en FP8. Su propósito declarado es el trabajo de equipos azules y la investigación en ciberseguridad: ingeniería de detección, triaje de SOC, análisis de alertas y logs, enriquecimiento de inteligencia de amenazas y ejercicios de red team con autorización escrita. Es relevante ahora porque demuestra que es posible eliminar el comportamiento de rechazo con una huella de pesos mínima y sin degradación medible en las suites evaluadas, lo que plantea preguntas operativas sobre guardarraíles en producción.

El contexto nativo es de 262.144 tokens, con escalado RoPE YaRN, y el modelo es de razonamiento: el turno del asistente se abre con `<think> … </think>` y emite llamadas a herramientas como bloques `<tool_call>`. La licencia es MIT y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe`), atención FP8 y expertos NVFP4 |
| Parametros totales | 63.972.847.344 (según safetensors); el nombre comercial indica 122B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; escalado RoPE YaRN |
| Tipos de cuantizacion | NVFP4 (ModelOpt) en MLP y expertos; FP8 en proyecciones de atención |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (8 shards, 73 GB según model card; repo de 77,7 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) etiquetado como `qwen3_5_moe`, con proyecciones de atención en FP8 y capas MLP, incluidos los expertos compartidos (`mlp.shared_expert.down_proj`), en NVFP4. El checkpoint base fue cuantizado con ModelOpt y conserva sus escalas almacenadas. El modelo emplea razonamiento explícito en el turno del asistente y soporta llamadas a herramientas mediante un parser dedicado (`qwen3_xml` en vLLM, `qwen3_coder` en SGLang).

El proceso de abliteración aplicado en esta variante consistió en un LoRA de rango 3 (`r=3`, `alpha=3`, ensayo 15 de un estudio de 30 ensayos) que modifica 24 tensores: 14 proyecciones de atención FP8 (`self_attn.o_proj`, `linear_attn.out_proj`) y 10 `mlp.shared_expert.down_proj` NVFP4, todos en las capas 24 a 47. La fusión se realizó en float32 y se recuantizó con las escalas almacenadas del checkpoint base, manteniendo las cabeceras y los offsets de pesos sin cambios. La verificación byte a byte confirma 0 bytes modificados fuera de los 24 tensores objetivo. La cuota del delta sobre la norma de los pesos es del 1,7–2,1 % en atención y del 0,07–0,15 % en `down_proj`, y el error de cuantización se mantiene idéntico (FP8 0,0266; NVFP4 0,0944). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento explícito (`<think> … </think>`).
- Razonamiento multi-paso y cadenas de pensamiento separables del contenido final mediante el parser de razonamiento `qwen3`.
- Llamadas a herramientas y function calling en formato OpenAI: las llamadas se emiten como bloques `<tool_call>` y se parsean a `tool_calls`.
- Capacidades de agente y razonamiento multi-paso orientadas a herramientas de seguridad.
- Generación de código: el benchmark HumanEval reporta 93,3 de pass@1 en esta variante.
- Recuperación en contexto largo: recuerdo del 100 % en Needle-in-a-Haystack entre 8k y 196k tokens.
- Conocimiento de dominio de ciberseguridad medido en CyberBench (62,5 de precisión macro).
- Ausencia de comportamiento de rechazo: la tasa de rechazo baja del 97 % al 4,44 %.
- Capacidad multimodal declarada por la etiqueta `image-text-to-text`, aunque la model card no detalla su alcance.
- No se documentan capacidades de audio ni de visión más allá de la etiqueta del pipeline.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede procesar alertas y logs con contexto largo (262.144 tokens) y razonar sobre la secuencia de eventos para priorizar incidentes, con la traza de razonamiento separada del veredicto final.
- Ingeniería de detección: generación y revisión de reglas de detección y consultas de correlación, usando el modo de razonamiento para justificar la lógica y el modo de código para producir artefactos listos para desplegar.
- Análisis de malware e informes de incidentes: redacción de resúmenes técnicos y enriquecimiento de indicadores, aprovechando el conocimiento de dominio medido en CyberBench y la ventana de contexto para incorporar múltiples fuentes.
- Enriquecimiento de inteligencia de amenazas: extracción y correlación de entidades a partir de informes extensos, con llamadas a herramientas para consultar fuentes externas mediante function calling.
- Herramientas de seguridad agénticas: construcción de pipelines donde el modelo encadena llamadas a herramientas (consultas a SIEM, APIs de threat intelligence) en varios pasos, con el parser `qwen3_coder` de SGLang o `qwen3_xml` de vLLM.
- Ejercicios de red team y CTF con autorización escrita: generación de hipótesis de ataque y análisis de resultados en entornos de laboratorio acotados, donde la ausencia de rechazo evita fricción en peticiones legítimas dentro del alcance acordado.
- Ajuste fino y experimentación en investigación de alineación: el checkpoint sirve como referencia para estudiar el efecto de la ablación de la dirección de rechazo con una huella de pesos mínima y un error de cuantización controlado.

## Benchmarks y rendimiento

Medidos en una única NVIDIA DGX Spark (GB10), SGLang 0.5.17, con el mismo arnés para ambos checkpoints, listas de tareas congeladas y muestreo `temperature 0.6 / top_p 0.95 / top_k 20` (NIAH con decodificación voraz):

| Benchmark | Métrica | Este modelo | Base NVFP4 |
|---|---|---|---|
| HumanEval | pass@1 (n=1) | 93,3 (153/164) | 93,3 (153/164) |
| CyberBench | precisión macro | 62,5 (375/600) | 61,3 (368/600) |
| Needle-in-a-Haystack | recuerdo, 8k–196k | 100 (20/20) | 100 (20/20) |
| Tasa de rechazo | — | 4,44 % | 97 % |
| Divergencia KL frente al base | — | 0,0191 | — |

Advertencias del autor sobre estas cifras: HumanEval probablemente está contaminado (93 % es alto para esta clase y la suite es pública), por lo que debe leerse como comprobación de regresión y no como afirmación de capacidad; CyberBench es una muestra estratificada de 60 tareas por conjunto sobre 600 totales del build de 10 datasets de JPMorgan Chase, con confianza por dataset de ±12 pp; NIAH está saturado en dificultad de aguja única y no separa los checkpoints. La diferencia en CyberBench está dentro del ruido (McNemar z = 1,07, p ≈ 0,28). El modelo base no publica cifras de HumanEval, CyberBench ni NIAH, por lo que solo existe esta comparación A/B.

## Requisitos de hardware

- El checkpoint pesa 73 GB según la model card (repo de 77,7 GB en 8 shards), por lo que no cabe en GPUs de consumo de 24 GB ni de 48 GB.
- Se requiere al menos una GPU con 80 GB de VRAM para cargar los pesos completos, o configuraciones multi-GPU con paralelismo de tensor.
- GPU recomendadas: A100 80 GB, H100, y la plataforma GB10 (DGX Spark) empleada en las mediciones del autor.
- En GB10/SM121 el runner de MoE debe ser `marlin`; `flashinfer_cutlass` produce NaN en esa pieza.
- Despliegue soportado: vLLM >= 0.19.1, SGLang >= 0.5.9 y transformers >= 5.8.1.
- En vLLM se recomienda `--max-model-len 262144`, `--gpu-memory-utilization 0.90`, `--enable-prefix-caching`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml` y `--reasoning-parser qwen3`.
- En SGLang se recomienda `--context-length 262144`, `--mem-fraction-static 0.80`, `--moe-runner-backend marlin` y `--kv-cache-dtype fp8_e4m3`.
- Mantener `top_k` activo (por ejemplo, 20): la ruta de sampler sin filtro puede emitir de forma intermitente tokens fuera de la distribución del modelo en este hardware.
- Muestreo recomendado: general con `temperature=1.0, top_p=0.95, top_k=20, presence_penalty=1.5`; código preciso con `temperature=0.6, top_p=0.95, top_k=20, presence_penalty=0.0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ornith-1.5-122B-NVFP4-ablated | 63.972.847.344 (safetensors); nombre comercial 122B | 262.144 | MIT | Variante abliterated; rechazo 4,44 %; HumanEval 93,3; CyberBench 62,5 |
| ornith-ai/Ornith-1.5-122B-NVFP4 (base) | mismo checkpoint | 262.144 | MIT | Rechazo 97 %; HumanEval 93,3; CyberBench 61,3; sin ablación |
| Otros modelos de la familia Qwen3.5-MoE | no disponible | no disponible | no disponible | La model card solo etiqueta la arquitectura; no se aportan comparaciones |

No se dispone de datos publicados de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo es explícitamente sin censura: se ha eliminado la dirección de rechazo de los pesos y responderá a peticiones que el base rechaza, incluidas las ilegales o peligrosas. No debe servirse sin guardarraíles propios ni exponerse a usuarios no confiables.
- La restricción de uso legal recae enteramente en el operador y sus procesos, no en el modelo, que carece de comportamiento de rechazo.
- Uso previsto limitado a equipos azules, investigación en ciberseguridad y ejercicios con autorización escrita; se prohíbe el acceso no autorizado, los ataques a sistemas de terceros, el despliegue de malware y las armas.
- Idiomas: solo inglés declarado; no se documenta soporte multilingüe.
- Riesgo de alucinación: no cuantificado en la información disponible, pero relevante en un modelo de razonamiento sin rechazo y en tareas de seguridad donde los datos deben verificarse.
- HumanEval probablemente contaminado; CyberBench con muestra reducida y confianza de ±12 pp por dataset; NIAH saturado y sin capacidad de discriminación.
- El estudio de abliteración se midió sobre el base sin cuantizar; la comprobación puntual sobre el artefacto NVFP4 servido se limita a 3 prompts dañinos con razonamiento desactivado.
- En GB10/SM121, `flashinfer_cutlass` produce NaN y la ruta de sampler sin filtro puede emitir tokens fuera de distribución; requiere configuración específica.
- Licencia MIT: permite uso comercial, pero no exime de las obligaciones legales sobre el uso del contenido generado.
- Solo 14 descargas y 1 like en el momento de la ficha; el modelo es un derivado de terceros sin el respaldo del autor original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devsecllm/Ornith-1.5-122B-NVFP4-ablated
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B-NVFP4
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
