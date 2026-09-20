# meddle86/Melinoe-31B-VL-heretic-exl3-4.0bpw

## Resumen

Melinoe-31B-VL-heretic-exl3-4.0bpw es una versión cuantizada en formato EXL3 a 4.0 bits por peso (BPW) con cabeza en 8 bits del modelo bgg1996/Melinoe-Gemma4-31B-VL, que a su vez es un fine-tune de google/gemma-4-31B-it orientado a conversación empática, role-playing y escritura creativa. El autor, meddle86, ha partido de ese modelo, le ha aplicado una decensura (abliteration) con la herramienta Heretic v1.4.0 para reducir la tasa de rechazos y después lo ha cuantizado con ExLlamaV3 para su uso en GPU de consumo.

El interés del repositorio reside en dos factores. Primero, la decensura baja los rechazos de 100/100 en el modelo original a 15/100, con una divergencia KL de 0.0306 respecto al modelo sin modificar, lo que indica un cambio de comportamiento acotado. Segundo, el autor reporta que con cuantización de KV a 4,8 bits obtiene ventanas de aproximadamente 50.000 tokens y unos 45 tokens por segundo en una RTX 4090, lo que lo sitúa en el rango de hardware de consumo.

Según la model card, el modelo alcanzó el puesto número 1 en la categoría RP Combined del leaderboard Caliper Bench en septiembre de 2026. El repositorio declara licencia Apache 2.0 y está etiquetado como heretic, uncensored, decensored y reproducible. No se detallan la arquitectura interna ni la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (VL) derivado de google/gemma-4-31B-it; detalles internos no disponibles |
| Parametros totales | 9.677.975.788 (~9,68 B) según safetensors; el nombre del modelo indica 31B (discrepancia no aclarada en la model card) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | ~50.000 tokens con cuantización KV 4,8, según el autor |
| Tipos de cuantizacion | EXL3 4.0 BPW con cabeza de 8 bits (este repositorio) |
| Idiomas soportados | inglés (según la model card del modelo base); no disponible para otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

Cadena de desarrollo: google/gemma-4-31B-it (base de Google) → fine-tune de bgg1996 (Melinoe-Gemma4-31B-VL) → decensura con Heretic v1.4.0 → cuantización EXL3 4.0 BPW por meddle86. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre el uso de técnicas de alineación como RLHF o DPO en el fine-tune original.

La innovación técnica del repositorio es la abliteration reproducible aplicada con Heretic v1.4.0, un proceso que identifica direcciones del espacio de activaciones asociadas al rechazo y las atenúa capa por capa. La configuración usa un índice de dirección por capa y pesos diferenciados para las proyecciones de atención y de MLP, con los parámetros recogidos en la tabla siguiente. El resultado reportado es una divergencia KL de 0.0306 respecto al modelo sin decensurar y una caída de los rechazos de 100/100 a 15/100.

| Parametro de abliteration | Valor |
|---|---|
| direction_index | per layer |
| attn.o_proj.max_weight | 1.45 |
| attn.o_proj.max_weight_position | 51.65 |
| attn.o_proj.min_weight | 0.93 |
| attn.o_proj.min_weight_distance | 28.98 |
| mlp.down_proj.max_weight | 1.22 |
| mlp.down_proj.max_weight_position | 43.01 |
| mlp.down_proj.min_weight | 1.11 |
| mlp.down_proj.min_weight_distance | 5.21 |

## Capacidades

- Generación de texto conversacional con un tono descrito en la model card como empático y atento.
- Role-playing y narrativa guiada por personaje, con mantenimiento de contexto largo (hasta ~50.000 tokens con cuantización KV 4,8).
- Escritura creativa y exploración de ideas (brainstorming, temas complejos).
- Soporte multimodal de visión (VL) implícito en la denominación del modelo base; no hay detalles técnicos disponibles en la información proporcionada.
- Comportamiento decensurado: tasa de rechazos reducida (15/100 frente a 100/100 del modelo original).
- Configuración de abliteration reproducible (carpeta `reproduce/` del repositorio).
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte explícito de agentes o multi-step reasoning: no disponible en la documentación.
- Capacidades multilingües: la model card del modelo base declara únicamente inglés.

## Casos de uso

- Asistente conversacional de acompañamiento emocional: el modelo está fine-tuneado específicamente para interacciones empáticas y de apoyo, y su ventana de ~50.000 tokens permite mantener el hilo de conversaciones extensas.
- Role-playing e ficción interactiva: diseñado para escenarios narrativos guiados por personaje; su tasa de rechazos reducida evita cortes en tramas maduras o de temática adulta.
- Escritura creativa asistida: útil para generar borradores, explorar variantes de estilo y desarrollar personajes o diálogos, con contexto suficiente para mantener coherencia en documentos largos.
- Personajes para videojuegos o simulaciones: puede integrarse en motores de diálogo como modelo de NPC, desplegado localmente con ExLlamaV3 en una GPU de 24 GB.
- Base para nuevos fine-tunes: al ser una versión decensurada y reproducible, sirve como punto de partida para desarrollos que requieran menor censura manteniendo la base Gemma 4.
- Investigación sobre abliteration: el repositorio documenta parámetros y métricas (KL, rechazos) que permiten reproducir y estudiar el efecto de la decensura a 4.0 BPW.
- Despliegue local de bajo coste: la cuantización EXL3 4.0 BPW con KV a 4,8 bits permite ejecutarlo en una RTX 4090 con ~45 tokens/s y ~50k de contexto.
- Moderación de contenido generativo: un modelo deliberadamente decensurado puede usarse como generador adversario para probar sistemas de moderación.

## Benchmarks y rendimiento

Solo se dispone de los datos publicados por el autor en la model card. La comparación con el modelo original sin decensurar es la siguiente.

| Metrica | Este modelo | Modelo original (bgg1996/Melinoe-Gemma4-31B-VL) |
|---|---|---|
| Divergencia KL | 0.0306 | 0 (por definición) |
| Rechazos (sobre 100) | 15/100 | 100/100 |
| Caliper Bench (RP Combined) | puesto n.º 1 (septiembre de 2026) | no disponible |
| Throughput (RTX 4090) | ~45 tok/s | no disponible |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Peso del repositorio: 19,4 GB en total. A 4.0 BPW y ~9,68 B de parámetros, los pesos del transformer ocuparían en torno a 4,8 GB, por lo que el resto podría corresponder a la torre de visión u otros artefactos (no detallado en la model card).
- El autor reporta ~45 tokens/s y ~50.000 tokens de contexto en una RTX 4090 con cuantización KV 4,8.
- Cabe en GPU de consumo de gama alta con 24 GB (RTX 4090, RTX 3090, RTX 5090), especialmente si se emplea cuantización de KV.
- Para GPUs de gama media (16 GB o menos) no hay datos confirmados; podría requerir reducir contexto o la torre de visión.
- GPU de datacenter (A100, H100) no aportan ventaja específica, ya que el formato EXL3 está optimizado para inferencia en GPU de consumo.
- Despliegue: ExLlamaV3 es el backend obligatorio para pesos EXL3; se integra con TabbyAPI y con text-generation-webui (ExLlamaV3). No es compatible con vLLM, llama.cpp u Ollama, que no soportan este formato de cuantización.
- Latencia estimada: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decensurado | Licencia | Formato |
|---|---|---|---|---|---|
| meddle86/Melinoe-31B-VL-heretic-exl3-4.0bpw | ~9,68 B (según safetensors) | ~50k (KV 4,8) | Sí (abliterated) | apache-2.0 | safetensors (EXL3 4.0 BPW) |
| bgg1996/Melinoe-Gemma4-31B-VL | no disponible | no disponible | No | apache-2.0 | safetensors |
| google/gemma-4-31B-it | 31 B (nominal) | no disponible | No | Gemma (términos de Google) | safetensors |

No se dispone de información sobre alternativas adicionales de la misma categoría (modelos de acompañamiento empático o role-playing cuantizados en EXL3) en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo LLM, puede generar información incorrecta o inventada; la model card recomienda verificar cualquier dato crítico.
- Sesgos heredados: puede reproducir sesgos sociales y de datos presentes en Gemma 4 y en los datos de fine-tune, incluyendo estereotipos.
- Persona programada: el tono "empático y atento" es una persona construida; existe riesgo de apego emocional por parte del usuario.
- Decensurado: aunque la base tiene alineación de seguridad, el proceso de abliteration puede dar lugar a salidas no alineadas con directrices de seguridad. La propia model card advierte de que se requiere discreción del usuario.
- Idioma: la model card del modelo base declara únicamente inglés; no hay confirmación de calidad en castellano ni en otros idiomas.
- Público objetivo: el modelo está diseñado para audiencia adulta; usos fuera de alcance incluyen asesoramiento médico, legal o financiero, y decisiones de alto riesgo.
- Discrepancia de parámetros: el nombre del modelo indica 31B mientras que el recuento real de safetensors es de ~9,68 B; no se aclara en la documentación.
- Licencia: el repositorio declara apache-2.0, pero al derivar de google/gemma-4-31B-it conviene verificar los términos de uso aplicables a los modelos Gemma antes de un uso comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación independiente de los resultados reportados.
- Formato de despliegue restringido: al ser EXL3, solo funciona con ExLlamaV3, lo que excluye los ecosistemas vLLM, llama.cpp, Ollama y TGI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/meddle86/Melinoe-31B-VL-heretic-exl3-4.0bpw
- Modelo base del fine-tune: https://huggingface.co/bgg1996/Melinoe-Gemma4-31B-VL
- Modelo base original: https://huggingface.co/google/gemma-4-31B-it
- Heretic (herramienta de abliteration): https://heretic-project.org
- Reproducibilidad: carpeta `reproduce/README.md` dentro del repositorio de HuggingFace.
- Caliper Bench (leaderboard RP Combined): mencionado en la model card, sin URL disponible.
