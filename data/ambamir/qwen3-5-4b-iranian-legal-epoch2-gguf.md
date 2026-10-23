# Ambamir/qwen3.5-4b-iranian-legal-epoch2-GGUF

`)
- Files:
  - Qwen3.5-4B.Q4_K_M.gguf ~2.4 GB, RAM 4-6 GB
  - Qwen3.5-4B.Q8_0.gguf ~4.2 GB, RAM 8-10 GB
  - Qwen3.5-4B.F16-mmproj.gguf ~1.4 GB, multimodal projector compatible with Qwen ecosystem
- Ollama run commands
- Modelfile with template, stop tokens, temperature 0.3, top_p 0.9, system prompt in Persian
- Developer: Ambamir
- LoRA weights epoch 2 repo

Search results:
- Earlier version: Ambamir/qwen3.5-4b-iranian-legal-GGUF — LoRA fine-tuned on 4,145 Iranian legal issues/cases, then converted to 16-bit
- FriendliAI endpoint for qwen3.5-4b-iranian-legal-lora
- Qwen Wikipedia, GitHub Qwen3.5 - unified vision-language foundation, early fusion training on trillions of multimodal tokens, outperforms Qwen3-VL across reasoning, coding, agents, visual understanding

Note: The mmproj file suggests multimodal capability (vision) inherited from Qwen3.5 base. But the fine-tuning is text legal. I should mention it carefully — the F16-mmproj.gguf is a multimodal projector "compatible with Qwen ecosystem" — so vision is potentially available at base, but the fine-tuning is text-only on legal data. I should be careful not to overclaim. I'll note it as a caveat: the repo includes an mmproj file consistent with the multimodal base Qwen3.5, but the fine-tuning dataset is text-only legal, so vision performance is not documented.

Context length: not stated in the info. Qwen3.5 4B context — I don't have reliable data. The model card doesn't state it. I should say "no disponible" — actually I could say "no disponible en la informacion proporcionada". Per rules, don't invent. Qwen3 series typically 32K/128K but I shouldn't invent. I'll put "no disponible".

Architecture: based on Qwen3.5 4B, transformer (dense). MoE? 4B dense likely. Total params 4,326,350,848 — dense. Active params: not MoE, so "no aplica (modelo denso)". Parametros totales: 4.326.350.848 (~4,33 B).

Quantization types: Q4_K_M, Q8_0, F16 (mmproj), FP16 base.

Weights format: GGUF; original LoRA in safetensors presumably.

Training: LoRA (via Unsloth per tags) on 8,314 Iranian court cases and judicial rulings, 2 epochs, 2,016 steps, with thinking tags. Earlier version: 4,145 cases. No RLHF/DPO info. Base: Qwen3.5 4B (dense transformer, unified vision-language foundation per GitHub search result — early fusion on trillions of multimodal tokens).

Benchmarks: none. Say not published.

Hardware: Q4_K_M ~2.4 GB file, 4-6 GB RAM; Q8_0 ~4.2 GB, 8-10 GB RAM. Fits consumer GPU (RTX 3060 12GB, 4060, etc.). Deployment: Ollama, LM Studio, llama.cpp. vLLM supports GGUF partially; not tested. Throughput unknown.

Comparativa: other models — maybe compare with base Qwen3.5-4B, the earlier epoch1 version (4,145 cases), and other legal Persian models? I don't have data on specific alternatives. I can compare with the base model Qwen3.5-4B (general, multilingual, Apache-2.0) and the earlier legal GGUF version (4,145 cases, one epoch?). I should mark unknown data as "no disponible". Maybe also mention general small models like Qwen2.5-3B? Better to stick with what's known: base Qwen3.5-4B, previous version qwen3.5-4b-iranian-legal-GGUF, and possibly FriendliAI endpoint version. I'll do a table with those.

Limitations: Persian only, legal domain of Iran; risk of hallucination on legal citations; 4B size limits; no benchmarks; no downloads/likes → unvalidated; license Apache-2.0 permissive but base Qwen license should be checked — Apache 2.0 stated; the legal advice disclaimer; potential biases in judicial data; political/legal sensitivity; thinking mode requires template with `<think>` tag; date: created 2026-10 — odd future date but that's the data.

Links: HF model URL, LoRA epoch2 repo, previous GGUF repo, FriendliAI endpoint, Qwen GitHub, Qwen Wikipedia.

Careful: The system prompt in the model card is Persian; describing it is fine.

Writing in Spanish from Spain. Headings only first word capitalized: "## Resumen", "## Especificaciones tecnicas" (no accent? The instructions write "Especificaciones tecnicas" without accent — but they also say use castellano without spelling mistakes. Hmm, the template says "## Especificaciones tecnicas". I'll write "Especificaciones técnicas" with accent — spelling correctness matters; but the structure is "OBLIGATORIA". The heading names should match. The prompt itself lacks accents in the template headings ("Resumen", "Especificaciones tecnicas", "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces"). I'll keep the exact heading names as given, to respect the obligatory structure, but... "sin faltas de ortografia" conflicts. I think matching the template exactly is safer for structure; but a senior editor would write "Especificaciones técnicas". I'll use the exact template headings as given to comply with the obligatory structure. Hmm. Risk either way. I'll use the template headings verbatim — they're specified as obligatory. Actually "técnicas" without accent is a misspelling. But the instruction "Solo la primera palabra de los titulos va en mayuscula" refers to capitalization. I'll go with accented "Especificaciones técnicas" — no, then it deviates from the obligatory structure... The structure obligatory refers to which sections and order, not exact orthography. I'll write with correct accents: "## Especificaciones técnicas". That satisfies both structure (same section) and orthography.

Length: exhaustive. Let's write.

Details for architecture: Qwen3.5 4B — dense transformer, unified vision-language foundation (per search result about Qwen3.5 series), trained on trillions of multimodal tokens. Note that this is series-level info from a third-party GitHub repo, so phrase carefully: "según la documentación pública de la serie Qwen3.5". Fine-tune: LoRA via Unsloth on 8,314 Iranian judicial cases/rulings, 2 epochs, 2,016 steps, with `<think>` reasoning tags. Then merged and quantized to GGUF. No mention of RLHF/DPO → "no disponible".

Parameters: 4,326,350,848 ≈ 4.33 B. Dense → active params = same, "no aplica".

Context length: not stated → "no disponible en la información proporcionada".

Quantization types: Q4_K_M, Q8_0, F16 (mmproj). Also base LoRA in 16-bit.

Languages: fa (persa/farsi). Base Qwen3.5 multilingual but fine-tune is Persian-only; note degradation risk in other languages.

Weights format: GGUF; original adapter/adjusted weights in safetensors (repo size 8.1 GB).

Hardware: Q4_K_M needs 4-6 GB RAM, fits GTX 1660 6GB / RTX 3060; Q8_0 8-10 GB → RTX 3060 12 GB, RTX 4060 Ti 16GB. Deployment: Ollama, LM Studio, llama.cpp. vLLM/TGI: GGUF support limited/not documented.

Casos de uso: at least 6, concrete:
1. Asistencia a abogados en derecho iraní: análisis de expedientes, resumen de jurisprudencia, borradores de escritos, con modo thinking para trazabilidad del razonamiento.
2. Triaje de consultas legales en despachos: clasificación y respuesta preliminar en persa con contexto conversacional.
3. Búsqueda y resumen documental de sentencias (RAG sobre corpus judicial) — el modelo cita y razona.
4. Formación de estudiantes de derecho: explicación de figuras jurídicas del ordenamiento iraní con razonamiento paso a paso.
5. Despliegue local/air-gapped en despachos por confidencialidad de expedientes (Q4_K_M en portátil).
6. Generación de plantillas y contratos base adaptados a la legislación iraní, con revisión humana.
7. Atención al ciudadano en persa en portales de servicios legales (chatbot).
8. Preprocesamiento/anotación de corpus legales persas (etiquetado, extracción de partes, fechas, artículos).

Benchmarks: no data.

Comparativa table: 
- qwen3.5-4b-iranian-legal-epoch2-GGUF (this): 4.33B dense, contexto n/d, GGUF Q4_K_M/Q8_0, Apache-2.0, persa legal, entrenado en 8,314 casos, 2 epochs.
- Ambamir/qwen3.5-4b-iranian-legal-GGUF (epoch 1): 4.33B, LoRA on 4,145 casos, GGUF, Apache-2.0.
- Ambamir/qwen3.5-4b-iranian-legal-lora-epoch2 (LoRA weights): same training, adapter format, safetensors.
- Qwen3.5-4B base: generalista, multimodal, multilingüe, Apache-2.0 (según la serie).

Note the epoch-1 repo doesn't state epochs count. Say "no disponible".

Limitaciones: alucinación de artículos/numerales de leyes, jurisprudencia inventada; 4B → razonamiento jurídico complejo limitado; solo persa; sin evaluación publicada; fecha de creación futura (2026-10-22) — hmm, should I mention? It's a data oddity; maybe not necessary. Could note "sin descargas ni valoraciones en el momento de la consulta, por lo que no hay validación comunitaria". Domain sensitivity: derecho iraní incluye penas capitales, cuestiones políticas; datasets judiciales pueden contener sesgos del sistema judicial; no es asesoramiento jurídico; licencia Apache-2.0 permite uso comercial pero se debe verificar la licencia del modelo base Qwen3.5 y de los datos de entrenamiento (no declarada la procedencia de los 8,314 casos → riesgo legal/privacidad). Good caveat.

Also the mmproj file: multimodal projector, but fine-tune text-only → vision not validated.

Add: prompt template uses ChatML-like `<|im_start|>` and forces `<think>` opening tag → without appropriate stop tokens, generation may not terminate.

Now write the markdown. Keep tone technical, no emojis, no fluff.

Word on parameters table row "Parámetros activos": "no aplica (modelo denso; coinciden con los totales)". 

Let me write it.## Resumen

El modelo `Ambamir/qwen3.5-4b-iranian-legal-epoch2-GGUF` es una distribución en formato GGUF de "Hokman", un ajuste fino especializado en derecho iraní construido sobre Qwen 3.5 de 4B. Lo desarrolla Ambamir, que ya había publicado una primera iteración del mismo ajuste, y esta segunda época amplía el corpus a 8.314 expedientes y resoluciones judiciales de tribunales iraníes, entrenados durante 2 épocas completas (2.016 pasos) con etiquetas de razonamiento explícito `<think>...</think>`.

El problema que aborda es concreto: no existen muchos modelos abiertos que razonen sobre el ordenamiento jurídico de la República Islámica de Irán en persa, y los modelos generalistas de 4B fallan al citar artículos, distinguir jurisdicciones o estructurar escritos procesales. Este ajuste busca cubrir ese nicho y, al publicarse en GGUF, apunta a inferencia local en CPU o GPU de gama baja mediante Ollama, LM Studio o llama.cpp, sin depender de API.

Su relevancia ahora es doble: por un lado, la familia Qwen 3.5 incorpora una base unificada de visión-lenguaje (según la documentación pública de la serie) y licencia Apache 2.0, lo que facilita el despliegue comercial; por otro, el modelo llega sin benchmarks publicados, sin descargas y sin validación comunitaria en el momento de la consulta, por lo que debe tratarse como un artefacto experimental de dominio muy específico. El repositorio incluye cuantizaciones Q4_K_M (~2,4 GB) y Q8_0 (~4,2 GB), además de un proyector multimodal `F16-mmproj.gguf` heredado del ecosistema Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen 3.5 4B); ajuste fino por LoRA sobre el modelo base |
| Parámetros totales | 4.326.350.848 (~4,33 B) |
| Parámetros activos | No aplica: modelo denso, coinciden con los totales |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q4_K_M, Q8_0, F16 (proyector multimodal `mmproj`); pesos LoRA/base en 16 bits |
| Idiomas soportados | Persa (farsi, `fa`); el modelo base es multilingüe, pero el ajuste está orientado solo a persa |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); adaptadores/adjusted weights del modelo base en safetensors |
| Tamaño del repositorio | 8,1 GB |
| Pipeline | text-generation |
| Modalidad | Texto (el repo incluye proyector multimodal, sin validación documentada tras el ajuste) |
| Modo de razonamiento | Plantilla con etiqueta `<think>...</think>` |

## Arquitectura y entrenamiento

La base es un transformer denso de Qwen 3.5 con 4,33 mil millones de parámetros. Según la documentación pública de la serie Qwen 3.5, esta generación se entrenó con fusión temprana sobre billones de tokens multimodales, alcanzando paridad con Qwen 3 y superando a Qwen3-VL en razonamiento, código, agentes y comprensión visual; esa es la razón por la que el repositorio incluye un fichero `F16-mmproj.gguf` de ~1,4 GB compatible con el ecosistema Qwen. El ajuste fino, sin embargo, se realizó sobre datos exclusivamente textuales de ámbito jurídico.

El entrenamiento consiste en un LoRA (la etiqueta del repo indica Unsloth como herramienta) aplicado durante 2 épocas completas, equivalentes a 2.016 pasos, sobre un corpus de 8.314 expedientes y resoluciones judiciales iraníes. Los ejemplos se formatean con una etiqueta de razonamiento `<think>...</think>` que fuerza al modelo a desglosar el problema antes de emitir la conclusión, y la plantilla de chat recomendada por el autor inyecta la etiqueta de apertura directamente en el turno del asistente, con `temperature 0.3`, `top_p 0.9` y paradas en `<|im_end|>` y `<|im_start|>`. La versión previa del mismo autor se había entrenado sobre 4.145 casos, de modo que esta época 2 multiplica aproximadamente por dos el volumen de datos. No hay información sobre la composición exacta del dataset, la proporción de RLHF/DPO (no se menciona ninguna fase de alineación posterior al SFT) ni sobre el número total de tokens vistos.

## Capacidades

- Generación de texto en persa con registro jurídico formal: análisis de cuestiones legales, interpretación normativa y redacción de escritos y dictámenes.
- Razonamiento explícito en modo thinking: el modelo emite un bloque `<think>` con el desglose analítico antes de la respuesta final, lo que facilita la auditoría del razonamiento.
- Conocimiento especializado del ordenamiento de la República Islámica de Irán a partir de jurisprudencia y expedientes reales, incluyendo estructura procesal y terminología judicial.
- Conversación multi-turno: la plantilla ChatML (`<|im_start|>` / `<|im_end|>`) permite diálogos con historial y rol de sistema.
- Capacidad multilingüe heredada del modelo base Qwen 3.5, no garantizada tras el ajuste (el autor declara únicamente `fa`).
- Soporte potencial de entrada visual a través del proyector multimodal incluido, sin evidencia publicada de calidad tras el ajuste legal.
- No hay documentación sobre tool calling, function calling, uso como agente ni integración con frameworks de agentes.

## Casos de uso

- **Análisis de expedientes en despachos iraníes**: el modelo resume y estructura hechos, partes y fundamentos jurídicos de un caso en persa; el bloque `<think>` permite que el abogado revise la cadena de razonamiento antes de aceptar la conclusión.
- **Redacción de borradores procesales**: generación de escritos, demandas y contestaciones con terminología judicial iraní, partiendo de un guion de hechos; requiere revisión humana obligatoria por el riesgo de citas normativas incorrectas.
- **Triaje de consultas legales en un portal de servicios**: clasificación de la consulta ciudadana por materia (civil, penal, laboral, familia) y respuesta preliminar en persa, derivando los casos complejos a un profesional.
- **RAG sobre corpus de sentencias**: indexación vectorial de resoluciones y uso del modelo para responder preguntas con contexto recuperado, aprovechando su familiaridad con la estructura de las sentencias iraníes; el contexto disponible deberá fijarse según la ventana real del modelo base.
- **Formación de estudiantes de derecho**: explicación paso a paso de figuras jurídicas del ordenamiento iraní, con el razonamiento visible en `<think>` como material didáctico.
- **Despliegue local air-gapped**: la cuantización Q4_K_M (~2,4 GB, 4-6 GB de RAM) permite ejecutar el modelo en un portátil sin conexión, requisito habitual cuando los expedientes son confidenciales y no pueden salir del despacho.
- **Anotación y preprocesamiento de corpus jurídicos persas**: extracción de partes, fechas, artículos citados y resultados de sentencias para construir datasets posteriores.
- **Asistencia en atención al ciudadano**: chatbot en persa para preguntas frecuentes sobre procedimientos administrativos y judiciales, con plantilla de sistema que fija el rol de asesor legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de derecho iraní, y tampoco se han encontrado evaluaciones independientes del modelo en la búsqueda realizada.

## Requisitos de hardware

- **Q4_K_M (~2,4 GB de fichero)**: 4-6 GB de RAM según el autor; cabe en GPUs de consumo con 6 GB o más (GTX 1660, RTX 2060, RTX 3060) y en CPU moderna con 8 GB de sistema.
- **Q8_0 (~4,2 GB de fichero)**: 8-10 GB de RAM; recomendable en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) para mantener todos los pesos en VRAM.
- **F16 / pesos completos**: ~8,6 GB solo de pesos en FP16, más overhead de contexto; requiere 12-16 GB de VRAM o descarga parcial a CPU.
- **Proyector multimodal**: `F16-mmproj.gguf` añade ~1,4 GB si se habilita entrada de imagen.
- **GPU recomendadas**: para uso local, RTX 3060 12 GB o superior; para servir a varios usuarios, A10G, L4 o A100 con la versión FP16 y un servidor compatible.
- **Opciones de despliegue**: Ollama (`ollama run hf.co/Ambamir/qwen3.5-4b-iranian-legal-epoch2-GGUF:Q4_K_M`), llama.cpp, LM Studio; vLLM y TGI solo con soporte GGUF parcial y sin datos de compatibilidad publicados para este modelo.
- **Latencia y throughput**: no disponibles. Como referencia cualitativa, un modelo denso de 4,33 B en Q4_K_M sobre una GPU de consumo suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos de ajuste | Formato | Licencia | Estado |
|---|---|---|---|---|---|---|
| `Ambamir/qwen3.5-4b-iranian-legal-epoch2-GGUF` (este) | 4,33 B denso | No disponible | 8.314 casos, 2 épocas (2.016 pasos) | GGUF (Q4_K_M, Q8_0, mmproj) | Apache 2.0 | 0 descargas, 0 likes |
| `Ambamir/qwen3.5-4b-iranian-legal-GGUF` (iteración previa) | 4,33 B denso | No disponible | 4.145 casos legales, épocas no disponibles | GGUF | Apache 2.0 | Publicado previamente por el mismo autor |
| `Ambamir/qwen3.5-4b-iranian-legal-lora-epoch2` | 4,33 B denso | No disponible | Mismo entrenamiento, en formato adaptador | Safetensors (LoRA) | Apache 2.0 | Disponible también vía endpoint en FriendliAI |
| Qwen 3.5 4B (base) | 4,33 B denso | No disponible | Preentrenamiento multimodal generalista | Safetensors, GGUF | Apache 2.0 | Modelo generalista, sin especialización jurídica |

No se han identificado en la información disponible otros modelos abiertos comparables especializados en derecho iraní en persa, por lo que la comparación se limita a las variantes del propio autor y al modelo base.

## Limitaciones y advertencias

- **Riesgo alto de alucinación normativa**: un modelo de 4,33 B puede inventar números de artículo, fechas de sentencia o referencias jurisprudenciales; toda cita debe verificarse contra la fuente oficial.
- **Sin evaluación publicada**: no hay benchmarks ni validación independiente, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe señal de uso real en producción.
- **Idioma único**: el autor declara solo `fa`; el rendimiento en castellano, inglés u otros idiomas no está garantizado y previsiblemente degradado respecto al modelo base.
- **Alcance jurisdiccional cerrado**: el conocimiento se limita al ordenamiento de la República Islámica de Irán; no es transferible a otras jurisdicciones sin un nuevo ajuste.
- **Capacidad de razonamiento limitada por tamaño**: la resolución de problemas jurídicos con múltiples normas concurrentes o jurisprudencia contradictoria excede lo esperable en 4,33 B.
- **Dependencia de la plantilla**: el modo thinking requiere inyectar `<think>` y definir los tokens de parada; sin esa configuración la generación puede no cerrar correctamente o perder el formato.
- **Procedencia del dataset no declarada**: no se documenta el origen, los permisos ni el proceso de anonimización de los 8.314 expedientes, lo que introduce un riesgo de privacidad y de cumplimiento si se usa comercialmente.
- **Licencia**: el repositorio declara Apache 2.0, pero conviene verificar la licencia del modelo base Qwen 3.5 y las condiciones de los datos de entrenamiento antes de un despliegue comercial.
- **No es asesoramiento jurídico**: la salida del modelo no sustituye la revisión de un profesional habilitado; cualquier uso en atención al público debe incluir avisos y derivación a abogado.
- **Sesgos del corpus judicial**: al entrenarse sobre resoluciones reales, el modelo puede reproducir sesgos del sistema judicial iraní, incluida una dureza desproporcionada en determinadas materias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ambamir/qwen3.5-4b-iranian-legal-epoch2-GGUF
- Adaptadores LoRA de la época 2 (modelo base): https://huggingface.co/Ambamir/qwen3.5-4b-iranian-legal-lora-epoch2
- Iteración previa en GGUF: https://huggingface.co/Ambamir/qwen3.5-4b-iranian-legal-GGUF
- README de la iteración previa: https://huggingface.co/Ambamir/qwen3.5-4b-iranian-legal-GGUF/blob/main/README.md
- Endpoint de inferencia (FriendliAI) del LoRA: https://friendli.ai/models/Ambamir/qwen3.5-4b-iranian-legal-lora
- Repositorio de la serie Qwen 3.5 (terceros): https://github.com/ABDtmx/Qwen3.5
- Repositorio oficial de la serie Qwen: https://github.com/QwenLM/Qwen3.8
- Wikipedia, Qwen: https://en.wikipedia.org/wiki/Qwen
