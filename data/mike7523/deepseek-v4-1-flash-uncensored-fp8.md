# mike7523/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una versión modificada del modelo multimodal DeepSeek-V4.1-Flash de DeepSeek, publicada por el usuario mike7523 (equipo dealignai). La modificación consiste en una "abliteración" a nivel de pesos que elimina los mecanismos de rechazo del modelo base manteniendo el resto de capacidades intactas. El checkpoint se distribuye en formato FP8 nativo, sin cambios en la cuantización respecto al original.

El modelo base es una arquitectura híbrida encoder-decoder causal de 20+20 capas con mezcla de expertos (MoE), 384 expertos enrutados con top-6 más un experto compartido, conexiones residuales Hyper-Connections de 4 canales, atención dispersa CSA2, memoria de n-gramas Engram y un cabezal de decodificación especulativa DSpark. El checkpoint modificado conserva 763.205.315.794 parámetros totales según los safetensors, con 8B/16B activos por token según la model card, y una ventana de contexto de 1M tokens.

La relevancia de esta ficha radica en que documenta un caso de modificación de pesos orientada a eliminar salvaguardas, con métricas explícitas de comportamiento dañino (HarmBench-320) y de degradación de conocimiento (MMLU-14k). Es útil para investigadores en seguridad de modelos que necesiten evaluar los efectos de la abliteración, y como advertencia sobre la disponibilidad de checkpoints sin guardarraíles en el ecosistema abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder (20+20 capas), MoE con 384 expertos enrutados top-6 + 1 compartido, Hyper-Connections (4 canales residuales), atención dispersa CSA2, memoria Engram n-gram, DSpark speculative draft, vision tower DeepSeek-ViT con 2D-RoPE y pixel unshuffle |
| Parametros totales | 763.205.315.794 (safetensors); 552B backbone según model card |
| Parametros activos | 8B/16B activos por token (según model card) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (e4m3fn) con block-scale E8M0 [32, 32]; expertos enrutados en FP4 (nativo, sin cambios) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura causal encoder-decoder de 20+20 capas con mezcla de expertos: 384 expertos enrutados con selección top-6 más un experto compartido, lo que resulta en 8B/16B parámetros activos por token sobre un backbone de 552B. Incorpora Hyper-Connections de 4 canales en las conexiones residuales, atención dispersa CSA2, una memoria de n-gramas denominada Engram y un cabezal de decodificación especulativa DSpark (MTP). La torre de visión DeepSeek-ViT utiliza 2D-RoPE y pixel unshuffle para el procesamiento de imágenes. La cuantización es nativa: pesos FP8 e4m3fn con block-scale E8M0 [32, 32] y expertos enrutados en FP4.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La modificación introducida por dealignai es una abliteración a nivel de pesos: elimina quirúrgicamente los circuitos de rechazo manteniendo byte-idénticos los componentes críticos para las capacidades (expertos enrutados, memoria Engram, atención CSA2, cabezal DSpark, torre de visión, puertas del router, normas y embeddings). No se emplean hooks en tiempo de ejecución, vectores de dirección ni un `model.py` personalizado; el checkpoint carga exactamente igual que el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-turno con coherencia mantenida según la model card.
- Procesamiento multimodal image-text-to-text mediante la torre DeepSeek-ViT (sin modificar).
- Razonamiento con modo "effort=max" (traza de razonamiento explícita) y modo "effort=off".
- Decodificación especulativa mediante el cabezal DSpark (MTP) para acelerar la inferencia.
- Memoria de n-gramas Engram para recuperación de contexto.
- Capacidad de seguir instrucciones sin rechazo: 100% de cumplimiento en HarmBench-320 en ambos niveles de esfuerzo.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque la model card menciona "Vision + tools" en la cabecera.
- Capacidades multilingües: no disponible.
- Modo thinking: sí, con niveles de esfuerzo configurables (off / max).

## Casos de uso

- Investigación en seguridad de modelos: evaluar el impacto de la abliteración sobre las capacidades cognitivas comparando MMLU-14k entre el modelo base (86,96%) y la versión modificada (82,74%), y analizar la degradación concentrada en el clúster de ética (moral_scenarios cae 39,89 pp).
- Auditoría de robustez de guardarraíles: usar HarmBench-320 como banco de pruebas para medir la eficacia de clasificadores de seguridad externos frente a un modelo con 100% de ASR en las siete categorías semánticas.
- Análisis de trazas de razonamiento: el modo effort=max permite estudiar cómo el razonamiento explícito del modelo base incrementa el rechazo (de 42,81% a 1,56% de ASR) mientras la versión modificada permanece en 100%, un fenómeno relevante para el diseño de mecanismos de seguridad basados en cadena de pensamiento.
- Procesamiento de documentos largos con imágenes: la ventana de 1M tokens y la torre de visión permiten tareas de image-text-to-text sobre corpus extensos, útil en entornos de investigación controlados.
- Evaluación comparativa de cuantización FP8/FP4: el checkpoint sirve para medir el rendimiento real de la combinación FP8 con block-scale E8M0 y expertos FP4 en hardware compatible, sin la variable adicional de una cuantización post-entrenamiento.
- Estudio de arquitecturas MoE dispersas: con 384 expertos top-6 y atención CSA2, el modelo permite analizar el comportamiento de enrutamiento y la eficiencia de la memoria Engram en cargas de trabajo de contexto largo.
- Generación de código y matemáticas en pipelines internos: el modelo conserva las capacidades del base con una degradación de solo 1,1 pp en MMLU excluyendo el clúster de ética, lo que lo hace utilizable en tareas técnicas donde el filtrado de contenido no es un requisito.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Benchmark | Modelo base | Versión modificada | Delta |
|---|---|---|---|
| HarmBench-320 ASR (effort=off) | 137/320 = 42,81% | 320/320 = 100,00% | +57,19 pp |
| HarmBench-320 ASR (effort=max) | 5/320 = 1,56% | 320/320 = 100,00% | +98,44 pp |
| MMLU-14k (full test, T=0) | 12.211/14.042 = 86,96% | 11.619/14.042 = 82,74% | -4,22 pp |
| MMLU-14k excl. clúster ética (~11k items) | no disponible | no disponible | -1,1 pp |

Desglose por categoría en HarmBench-320 (ASR, effort=off / effort=max):

| Categoría | Ítems | Base off | Modificado off | Base max | Modificado max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7% | 100,0% | 0,0% | 100,0% |
| copyright | 80 | 98,8% | 100,0% | 0,0% | 100,0% |
| cybercrime_intrusion | 52 | 34,6% | 100,0% | 3,8% | 100,0% |
| harassment_bullying | 21 | 0,0% | 100,0% | 0,0% | 100,0% |
| harmful | 18 | 11,1% | 100,0% | 5,6% | 100,0% |
| illegal | 53 | 13,2% | 100,0% | 0,0% | 100,0% |
| misinformation_disinformation | 54 | 44,4% | 100,0% | 3,7% | 100,0% |

Principales caídas por asignatura en MMLU-14k: moral scenarios (-39,89 pp, de 76,9% a 37,0%), professional law (-7,04 pp), abstract algebra (-6,00 pp), security studies (-5,31 pp), high school computer science (-4,00 pp).

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks estándar de código o matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 510,3 GB en FP8 con expertos FP4; la inferencia requiere al menos ese volumen de memoria distribuida, ya que no cabe en una sola GPU convencional.
- GPU recomendadas: despliegue multi-GPU con H100 (80 GB) o A100 (80 GB); el tamaño del checkpoint implica un mínimo de 7-8 GPUs de 80 GB para cargar los pesos completos en memoria.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090 con 24 GB, RTX 5090 con 32 GB) en su forma FP8 completa; requeriría cuantizaciones adicionales no publicadas.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible. La decodificación especulativa DSpark requiere soporte específico del runtime.
- Latencia y throughput: no disponibles. La arquitectura MoE con 8B/16B activos por token sobre 552B backbone sugiere un coste de cómputo por token moderado en relación al tamaño total, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (base) | 552B backbone, 8B/16B activos | 1M | no disponible en esta ficha | Sí (ViT) | Guardarraíles intactos; MMLU-14k 86,96% |
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763.205.315.794 totales (safetensors) | 1M | MIT | Sí (ViT) | Abliterado; MMLU-14k 82,74%; HarmBench ASR 100% |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre otros modelos comparables en la documentación proporcionada |

La comparación directa más relevante es con el modelo base, del que se diferencia exclusivamente en la abliteración de pesos y en una degradación de 4,22 pp en MMLU-14k (1,1 pp excluyendo el clúster de ética).

## Limitaciones y advertencias

- Eliminación deliberada de guardarraíles: el modelo cumple el 100% de las peticiones en HarmBench-320, incluidas las categorías de chemical_biological, cybercrime_intrusion, harassment_bullying e illegal. No es apto para despliegues orientados al público sin filtrado externo.
- Degradación cognitiva medible: MMLU-14k cae 4,22 pp, con un deterioro severo en moral_scenarios (-39,89 pp) y moderado en professional law (-7,04 pp) y abstract algebra (-6,00 pp). El resto de asignaturas se mantiene dentro de 1-3 pp.
- Riesgo de alucinación: no se han publicado mediciones específicas de tasa de alucinación en la información disponible; la abliteración puede alterar el comportamiento en dominios donde el rechazo actuaba como señal de incertidumbre.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingüe.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado ni sobre el cumplimiento normativo en jurisdicciones que regulan la generación de contenido dañino.
- Trazabilidad limitada: el repositorio tiene 20 descargas y 0 likes en el momento de la ficha, sin revisión por pares ni validación independiente de los resultados de HarmBench o MMLU publicados por el autor.
- Requisitos de hardware prohibitivos para la mayoría de equipos: 510,3 GB de pesos FP8 exigen infraestructura multi-GPU de centro de datos.
- El modelo base pertenece a DeepSeek; la modificación no está avalada por el desarrollador original y puede contravenir sus términos de uso, aunque la licencia declarada del checkpoint sea MIT.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mike7523/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil de jordanschenck en X: https://x.com/jordanschenck
