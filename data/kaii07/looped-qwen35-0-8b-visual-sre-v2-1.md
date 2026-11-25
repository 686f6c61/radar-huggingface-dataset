# kaii07/looped-qwen35-0.8b-visual-sre-v2.1

## Resumen

Looped Hybrid Qwen3.5-0.8B for Visual SRE Incident Triage (v2.1) es un ajuste fino multimodal desarrollado por Abhishek Satarkar (kaii07), investigador independiente, sobre el modelo base Qwen/Qwen3.5-0.8B. El modelo esta especializado en triaje de incidentes de SRE (Site Reliability Engineering) a partir de capturas de paneles de Grafana, combinando percepcion visual con generacion de JSON estricto para invocar herramientas de remediacion. Su propuesta tecnica central es convertir el transformer original en un transformer hibrido con bucles (looped) mediante una modificacion no destructiva de la pila de capas.

El modelo parte de una arquitectura hibrida de 24 capas (18 capas recurrentes Gated DeltaNet y 6 capas de atencion con compuertas) y aplica un esquema Encode-Think-Decode (ETD) con `num_loops=2` sobre las capas 4 a 19, junto con una compuerta de profundidad RMSNorm denominada ARLoop (referenciada como arXiv:2611.05234) que combina las representaciones de entrada, estado previo y estado actual. El entrenamiento se realizo integramente en una unica GPU de consumo NVIDIA RTX 4060 Laptop con 8 GB de VRAM, lo que lo convierte en un caso practico de ajuste multimodal y RL de bajo presupuesto.

Es relevante ahora porque demuestra que un modelo de menos de mil millones de parametros puede alcanzar un 84 % de acierto en tareas de triaje visual fuera de distribucion, superando al modelo base (0 %) y mejorando en trampas de conflicto texto-imagen (86,7 % frente a 66,7 % de la version v1), todo ello con licencia Apache 2.0 y tecnicas de compresion de cache KV compatibles con vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (18 capas Gated DeltaNet + 6 capas Gated Attention) con bucle ETD sobre capas 4-19 y compuerta ARLoop |
| Parametros totales | 852.985.920 (~0,85 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 nativo; compresion KV 4-bit TurboQuant (Vision-Prefix-Exempt) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas `loop_state.pt` para el estado de bucle) |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido que combina capas recurrentes Gated DeltaNet (18) con capas de atencion con compuertas (6), heredadas del Qwen3.5-0.8B base. Sobre esa pila se aplica una modificacion no destructiva: las capas 0-3 se ejecutan una vez, las capas 4-19 se ejecutan dos veces (`num_loops=2`) con caches hibridas aisladas por bucle mediante `PerLoopHybridCache`, y las capas 20-23 se ejecutan una vez. La reinyeccion de estado entre bucles usa una compuerta de profundidad RMSNorm (ARLoop) que opera sobre `[E_enc, h^(t-1), h^(t)]`, referenciada en el paper arXiv:2611.05234.

El entrenamiento consta de dos fases. Primero, destilacion sobre 180 trazas multimodales de cadena de pensamiento validadas por esquema, que cubren temas claro/oscuro de Grafana, disposiciones de paneles 2x2, 1x3 y 3x1, prompts solo-pixel sin pistas, trampas de conflicto texto-imagen, turnos activos de `crop_zoom` y un 8,9 % de trazas negativas de rechazo verificadas con SHA-256 para garantizar cero solapamiento con los conjuntos de evaluacion y OOD. Despues, 60 pasos de RL con Dr. GRPO y DAPO Clip-Higher en el rango `[-0.20, +0.28]`, con una penalizacion de `-0.50` por falsa abstencion, alcanzando 3,37 GB de VRAM pico. Tambien se integran kernels Triton fusionados de `flash-linear-attention` para las capas DeltaNet (aceleracion de decodificacion de 1,24x en RTX 4060) y una cache KV TurboQuant de 4 bits que fija los tokens de atencion sink y los parches visuales en bf16 nativo.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes de paneles de Grafana (temas claro y oscuro, disposiciones 2x2, 1x3 y 3x1).
- Interpretacion de telemetria visual con prompts solo-pixel (sin pistas textuales en la imagen).
- Generacion de JSON estricto validado por esquema para invocar herramientas de remediacion (tool calling).
- Cadena de pensamiento multimodal (Chain-of-Thought) en la respuesta.
- Manejo de trampas de conflicto texto-imagen (Conflict Traps), priorizando la evidencia visual sobre la textual.
- Turnos activos de `crop_zoom` para inspeccionar regiones concretas del panel.
- Trazas de rechazo (refusal) ante peticiones fuera de alcance, entrenadas con un 8,9 % de ejemplos negativos.
- Soporte de decodificacion con cache KV comprimida 4-bit (TurboQuant) preservando parches visuales en bf16.
- Capacidades multilingues: no disponible.

## Casos de uso

- Triaje automatico de incidentes en produccion: el modelo recibe una captura del panel de Grafana y devuelve un JSON con la herramienta de remediacion adecuada, integrándose en un pipeline de alertas que dispare acciones sobre la infraestructura.
- Asistente de guardia para equipos SRE: se despliega como endpoint compatible con la API de transformers y responde a consultas multi-turno sobre el estado del sistema a partir de capturas, reduciendo el tiempo medio de reconocimiento (MTTR).
- Validacion de runbooks: se usa para comprobar que las decisiones de remediacion propuestas por el modelo coinciden con los procedimientos documentados, aprovechando su salida JSON estricta y validable por esquema.
- Deteccion de conflictos texto-imagen en dashboards: el modelo identifica cuando una anotacion textual contradice los datos visuales del panel (Conflict Traps), util para auditar paneles mal configurados o con anotaciones enganosas.
- Automatizacion de respuesta a incidentes en entornos con recursos limitados: al caber en una RTX 4060 Laptop de 8 GB, puede ejecutarse en estaciones de trabajo de guardia o portatiles sin GPU de datacenter.
- Generacion de informes post-incidente: a partir de la captura del panel, el modelo produce una traza de razonamiento que sirve como borrador de analisis de causa raiz para el equipo de operaciones.
- Filtrado de falsas alarmas: gracias a sus trazas de rechazo entrenadas, puede abstenerse de actuar cuando la imagen no contiene evidencia suficiente, evitando remediaciones erroneas.

## Benchmarks y rendimiento

Evaluacion determinista con decodificacion greedy (`seed=1337`, `do_sample=False`, `bfloat16`) en una unica RTX 4060 Laptop GPU (8 GB VRAM):

| Benchmark / Split | Qwen3.5-0.8B base (1 bucle) | v1 Merged (2 bucles, bf16) | v2.1 ETD+ARLoop (2 bucles, bf16) | v2.1 (TQ 4-bit Vis-Exempt) |
|---|---|---|---|---|
| Held-Out Visual SRE (15 prompts) | 0,0 % | 86,7 % | 80,0 % | no disponible |
| Tier 1: Hard OOD SRE Overall (50) | 0,0 % | 80,0 % | 84,0 % | 76,0 % |
| Tier 1 OOD Schema Validity (50) | 0,0 % | 88,0 % | 90,0 % | 84,0 % |
| Tier 1 OOD Pixel-Only (15) | 0,0 % | 86,7 % | 86,7 % | 80,0 % |
| Tier 1 OOD Conflict Traps (15) | 0,0 % | 66,7 % | 86,7 % | 73,3 % |
| Tier 2: ChartQA Relaxed Acc (50) | 80,0 % | 70,0 % | 74,0 % | no disponible |
| Tier 3: BFCL v3 Overall (50) | 48,0 % | 68,0 % | 68,0 % (+20,0 vs. base) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en bf16 para los pesos (tamano del repo 1,7 GB), mas overhead de activaciones y cache KV; el entrenamiento RL alcanzo 3,37 GB pico en la RTX 4060 Laptop.
- GPU recomendadas: NVIDIA RTX 4060 Laptop (8 GB) es suficiente segun el autor; cualquier GPU con al menos 4-6 GB de VRAM deberia poder ejecutar inferencia en bf16.
- Cabe en GPU de consumo: si, validado en RTX 4060 Laptop de 8 GB.
- Opciones de despliegue: transformers con la clase `LoopedQwen3_5ForConditionalGeneration` del repositorio del autor; requiere `flash-linear-attention` para los kernels Triton DeltaNet. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se reporta una aceleracion de decodificacion de 1,24x con los kernels `fla` fusionados en RTX 4060; no se aportan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Looped Qwen3.5-0.8B Visual SRE v2.1 | ~0,85 B | no disponible | Multimodal SRE con bucle ETD + ARLoop | Apache 2.0 | Hugging Face (22 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,85 B | no disponible | Multimodal generalista | Apache 2.0 | Hugging Face |
| v1 Merged (2 bucles, bf16) | ~0,85 B | no disponible | Version previa del mismo autor | Apache 2.0 | Referenciada en la model card |

La comparativa se limita al modelo base y a la version previa del mismo autor, ya que no se dispone de datos de otros modelos especializados en triaje visual de SRE con los que contrastar.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado exclusivamente para triaje visual de paneles de Grafana y tool calling JSON; su rendimiento en tareas generales no esta evaluado y probablemente sea inferior al del modelo base.
- Caida de rendimiento con cuantizacion: la version TurboQuant 4-bit pierde entre 4 y 13 puntos porcentuales en los benchmarks OOD (por ejemplo, 76 % frente a 84 % en Tier 1 Overall, y 73,3 % frente a 86,7 % en Conflict Traps).
- Regresion en ChartQA: el ajuste reduce el acierto en ChartQA del 80 % (base) al 74 % (v2.1), lo que indica perdida de capacidades generales de comprension de graficos.
- Requiere codigo personalizado: `AutoModelForImageTextToText.from_pretrained` carga solo los pesos base con `num_loops=1` e ignora `loop_state.pt`; es imprescindible usar la clase `LoopedQwen3_5ForConditionalGeneration` del repositorio del autor para el comportamiento completo.
- Idiomas soportados no documentados: no hay informacion sobre el rendimiento en castellano u otros idiomas distintos del ingles.
- Longitud de contexto no documentada: no se especifica la ventana de contexto, lo que dificulta planificar su uso en conversaciones largas.
- Riesgo de alucinacion: aunque se entreno con trazas de rechazo y penalizacion por falsa abstencion, no se aportan metricas de calibracion ni de tasa de alucinacion en produccion.
- Sesgos: no se documentan sesgos conocidos; el dataset de entrenamiento es pequeno (180 trazas) y de dominio muy concreto, lo que limita la generalizacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene solo 22 descargas y 0 likes, por lo que su validacion externa es practicamente nula.
- Entrenado en una unica GPU de consumo: el presupuesto de computo limitado puede reflejarse en una cobertura incompleta de casos extremos.

## Enlaces

- Hugging Face: https://huggingface.co/kaii07/looped-qwen35-0.8b-visual-sre-v2.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub: https://github.com/yuno7777/looped-qwen35-visual-sre
- Paper tecnico (PDF, 8 paginas): https://github.com/yuno7777/looped-qwen35-visual-sre/blob/main/docs/Looped_Hybrid_Qwen35_Visual_SRE_Paper.pdf
- Dev diary de ingenieria (PDF, 5 paginas): https://github.com/yuno7777/looped-qwen35-visual-sre/blob/main/docs/Visual_SRE_Looped_Qwen35_Dev_Diary.pdf
- ORCID del autor: https://orcid.org/0009-0003-4847-3288
- Referencia arXiv citada: arXiv:2611.05234 (ARLoop)
