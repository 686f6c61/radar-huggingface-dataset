# AIHeikki/fable-mistral-small-4-119b-telco-lora

## Resumen

Fable es un adaptador LoRA de alto rango (`r = 32`, `alpha = 64`, BF16) entrenado sobre el modelo base `mistralai/Mistral-Small-4-119B-2603`, un Mixture-of-Experts de 119B parámetros totales con 6,5B activos y Multi-head Latent Attention (MLA). Lo desarrolla el autor independiente AIHeikki y está orientado a un dominio muy específico: arquitectura de core 5G Standalone según 3GPP Release 17/18, análisis de causa raíz cross-layer (RAN, transporte y core) y operaciones de cloud telco soberana.

El adaptador se aplica sobre las 288 proyecciones MLA (`q_a_proj`, `q_b_proj`, `kv_a_proj_with_mqa`, `kv_b_proj`, `o_proj`) y las MLP de expertos compartidos (`gate_proj`, `up_proj`, `down_proj`) de las 36 capas del modelo base, con un total de 219,8 MB en `.safetensors`. Forma parte de la trilogía «Mona, Lisa & Fable» (`Exp 5A–5C`) del mismo autor, donde cada entrega cubre una disciplina distinta (disciplina epistémica textual, auditoría visual multimodal y operaciones telco a gran escala).

Su relevancia radica en la metodología de entrenamiento: el corpus es 100% sintético y generado por un solver determinista en Python (física 3GPP, link budget, Erlang-C y máquinas de estado), sin destilación de modelos frontera de OpenAI, Anthropic o Google. El autor publica una atestación de linaje limpio y un benchmark de tres brazos sobre 30 escenarios no vistos, lo que permite evaluar la contribución real del adaptador frente al modelo base con y sin prompting de dominio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE con Multi-head Latent Attention (Mistral Small 4) |
| Parámetros totales | 119B (modelo base); adaptador LoRA de 219,8 MB en BF16 |
| Parámetros activos | 6,5B (modelo base, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos del adaptador en BF16; el base admite las cuantizaciones habituales de su ecosistema) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT), con `adapter_config.json`, tokenizer Tekken y `chat_template.jinja` |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer MoE con atención MLA, que comprime las proyecciones de query, key y value en espacios latentes de baja dimensión para reducir el coste de KV cache. El LoRA de rango 32 con alpha 64 se inserta en las 288 proyecciones MLA y en las MLP del experto compartido a lo largo de las 36 capas, de modo que el ajuste afecta tanto al mecanismo de atención como a la ruta densa compartida por todos los tokens, no solo a los expertos enrutados.

El entrenamiento se realizó en un nodo de 8× NVIDIA H100 80GB HBM3 (640 GB de VRAM total) y convergió en 26,2 minutos, con la entropía cruzada bajando de 1,2810 a 0,0365 (−97,15%) y la precisión por token pasando de 67,9% a 98,98%. El currículo consta de 240 escenarios generados por el solver determinista `build_telco_curriculum.py` y formateados por el propio modelo base con `reasoning_effort="none"`. La plantilla de chat soporta el parámetro `reasoning_effort` con valores `"none"` y `"high"`.

## Capacidades

- Razonamiento sobre señalización 3GPP Release 17/18: IE, timers y cause codes, con recall medido del 82,22% en el conjunto de evaluación.
- Localización de fallos cross-layer entre RAN, transporte y core en escenarios 5G SA.
- Cálculo de link budget RF y matemáticas de PRACH con tolerancia numérica del ±1%.
- Dimensionamiento de UPF, eBPF y SR-IOV para funciones de red en cloud.
- Ingeniería de caos y análisis de blast-radius en entornos de cloud telco soberana.
- Abstención epistémica: el modelo reconoce cuándo falta telemetría o capturas PCAP y declina responder (100% en el conjunto de evaluación).
- Cumplimiento de formato arquitectónico NOC de 5 bloques obligatorios (100% en el conjunto de evaluación).
- Generación de texto conversacional y soporte de modo de razonamiento configurable mediante `reasoning_effort`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales o de audio: no disponible en la información proporcionada.

## Casos de uso

- **Diagnóstico de causa raíz en NOC 5G SA**: el adaptador permite correlacionar alarmas de RAN, transporte y core en una misma traza de razonamiento, algo que el modelo base sin ajuste no logra de forma consistente (34,94% frente a 85,22% en rúbrica determinista). Se usaría como asistente de segundo nivel para ingenieros de operaciones.
- **Validación de configuraciones 3GPP**: dado un conjunto de IEs, timers y cause codes, el modelo comprueba coherencia con Release 17/18 y señala desviaciones. El recall del 82,22% en IE/timer/cause-code lo hace útil como primera pasada antes de la revisión humana.
- **Dimensionamiento de UPF y funciones de red**: con datos de tráfico y requisitos de latencia, el modelo aplica modelos Erlang-C y cálculos de link budget con tolerancia del ±1% en el 72,50% de los casos evaluados, adecuado para estimaciones preliminares de capacidad.
- **Ingeniería de caos en cloud telco**: el adaptador razona sobre blast-radius y propagación de fallos en despliegues soberanos, útil para diseñar experimentos de caos y para interpretar sus resultados.
- **Triaje con telemetría incompleta**: cuando faltan PCAP o métricas, el modelo se abstiene explícitamente en lugar de inventar un diagnóstico (100% de acierto en la puerta de abstención), lo que reduce el riesgo de acciones erróneas en producción.
- **Generación de informes NOC estructurados**: el adaptador produce respuestas con el formato de 5 bloques obligatorio en el 100% de los casos evaluados, lo que facilita la integración en runbooks y sistemas de ticketing.
- **Formación de ingenieros junior**: al estar ajustado sobre escenarios sintéticos con solver determinista, puede usarse como tutor de arquitectura 5G SA con respuestas trazables a cálculos verificables.

## Benchmarks y rendimiento

Evaluación sobre 30 escenarios 5G SA no vistos (semilla 20260405), comparando el modelo base, el base con un playbook telco de 6.500 tokens en el prompt (RAG+Prompt) y el adaptador Fable:

| Métrica (N = 30) | Base Mistral-Small-4-119B | Base + playbook 6,5k (RAG+Prompt) | Fable LoRA | Delta vs base | Delta vs RAG+Prompt |
|---|---|---|---|---|---|
| Rúbrica determinista global | 34,94% | 59,94% | 85,22% | +50,28 pp | +25,28 pp |
| Tolerancia numérica ±1% | 41,67% | 56,67% | 72,50% | +30,83 pp | +15,83 pp |
| Recall IE / timer / cause-code 3GPP | 42,22% | 46,67% | 82,22% | +40,00 pp | +35,55 pp |
| Abstención epistémica y puerta de PCAP ausente | 16,67% | 66,67% | 100,00% | +83,33 pp | +33,33 pp |
| Cumplimiento de formato NOC de 5 bloques | 0,00% | 93,33% | 100,00% | +100,00 pp | +6,67 pp |
| Juez ciego a 3 bandas (sobre 10) | 5,84 | 7,12 | 9,52 | +3,68 | +2,40 |
| Victorias/empates/derrotas por pares (Fable vs oponente) | 29 W / 0 T / 1 L (96,7%) | 28 W / 1 T / 1 L (93,3%) | — | — | — |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las cifras anteriores corresponden exclusivamente al conjunto de evaluación propio del autor.

## Requisitos de hardware

- El adaptador LoRA ocupa 219,8 MB en BF16, pero requiere cargar el modelo base de 119B parámetros para inferencia.
- Entrenamiento realizado en 8× NVIDIA H100 80GB HBM3 (640 GB de VRAM total); el adaptador se entrenó en 26,2 minutos en ese nodo.
- VRAM estimada para inferencia en BF16: no disponible en la información proporcionada; por el tamaño del base (119B totales, 6,5B activos) excede con holgura una GPU de consumo.
- GPU recomendadas: H100 80GB, A100 80GB o nodos multi-GPU equivalentes; no cabe en GPU de consumo (RTX 4090, 24 GB) sin cuantización agresiva del modelo base, y esa opción no está documentada.
- Opciones de despliegue: `transformers` + `peft`, según el quickstart de la model card. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fable (este modelo) | 119B totales / 6,5B activos (base) + LoRA | no disponible | Telco 5G SA, NOC, causa raíz | Apache 2.0 | Hugging Face |
| Mistral-Small-4-119B-2603 (base) | 119B totales / 6,5B activos | no disponible | Propósito general | no disponible en la información | Hugging Face |
| Mona (Qwen3.5-4B epistemic sparring, Exp 5A) | 4B | no disponible | Disciplina epistémica textual y RAG | no disponible en la información | Hugging Face |
| Lisa (Gemma-4-E4B-it visual auditor, Exp 5B) | no disponible | no disponible | Auditoría visual multimodal | no disponible en la información | Hugging Face |

La comparación más directa es contra el propio modelo base y contra el base con prompting de dominio, cuyos resultados se recogen en la sección de benchmarks. No se dispone de datos de benchmarks estándar para comparar con otros modelos telco de la misma categoría.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente sobre 240 escenarios sintéticos generados por un solver determinista; su generalización a topologías, vendors o releases distintos de los cubiertos no está verificada.
- El rendimiento medido procede de un conjunto de evaluación de 30 escenarios del propio autor, no de benchmarks independientes; los resultados pueden no replicarse en entornos reales.
- El recall de IE, timers y cause codes es del 82,22%, lo que implica que aproximadamente uno de cada cinco elementos puede faltar o ser incorrecto; requiere validación humana en producción.
- La tolerancia numérica del ±1% solo se cumple en el 72,50% de los casos; los cálculos de dimensionamiento no deben usarse sin revisión.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: mitigado parcialmente por la puerta de abstención (100% en el conjunto evaluado), pero no cuantificado fuera de ese conjunto.
- Idiomas soportados: no disponible; el corpus de entrenamiento está en inglés técnico y no se documenta cobertura multilingüe.
- Longitud de contexto: no disponible en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base tiene su propia licencia, que debe verificarse por separado antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AIHeikki/fable-mistral-small-4-119b-telco-lora)
- [Modelo base: mistralai/Mistral-Small-4-119B-2603](https://huggingface.co/mistralai/Mistral-Small-4-119B-2603)
- [Mona (Exp 5A): AIHeikki/mona-qwen3.5-4b-epistemic-sparring](https://huggingface.co/AIHeikki/mona-qwen3.5-4b-epistemic-sparring)
- [Lisa (Exp 5B): AIHeikki/lisa-gemma4-e4b-visual-auditor](https://huggingface.co/AIHeikki/lisa-gemma4-e4b-visual-auditor)
- Informe técnico completo: `reports/FABLE_MISTRAL4_119B_TELCO_REPORT.md` (incluido en el repositorio)
- Resultados por escenario: `reports/deterministic_3arm_summary.json` (incluido en el repositorio)
- Rankings del juez ciego: `reports/blind_3way_telco_report.json` (incluido en el repositorio)
- Atestación de linaje limpio: `CLEAN_LINEAGE_ATTESTATION.json` (incluido en el repositorio)
