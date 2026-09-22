# mradermacher/SmolLM2-360M-NPC-Roleplay-GGUF

## Resumen

SmolLM2-360M-NPC-Roleplay-GGUF es una recopilación de cuantizaciones en formato GGUF generada por mradermacher a partir del modelo thealper2/SmolLM2-360M-NPC-Roleplay. Se trata de un ajuste fino orientado a roleplay y diálogo de PNJ (personajes no jugadores) construido sobre la familia SmolLM2, con 361.821.120 parámetros totales (aproximadamente 362 millones) y publicado bajo licencia Apache 2.0. El repositorio no contiene pesos en safetensors ni código de entrenamiento: únicamente los artefactos GGUF listos para inferencia local.

El problema que resuelve es muy concreto: disponer de un modelo conversacional de personaje extremadamente ligero, capaz de ejecutarse en CPU o en GPUs de gama baja incluso integradas, para prototipado de NPCs en videojuegos, demos de角色 (roleplay) y aplicaciones interactivas con presupuesto de cómputo casi nulo. Al estar cuantizado en 12 variantes (desde Q2_K de 0,3 GB hasta f16 de 0,8 GB), cubre todo el espectro entre máxima compresión y máxima fidelidad respecto al modelo original.

Su relevancia actual es la de los modelos pequeños especializados: con 0 descargas y 0 "likes" en el momento de redactar esta ficha, es un artefacto reciente y prácticamente sin validación comunitaria. Debe tratarse como una pieza de experimentación, no como un componente listo para producción sin evaluación previa. La model card original no documenta longitud de contexto, composición exacta del dataset, ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia SmolLM2 (detalle de capas y atención no especificado en la información proporcionada) |
| Parametros totales | 361.821.120 (dato real declarado en safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además, cuantizaciones ponderadas/imatrix en el repositorio i1 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el repositorio solo publica GGUF; el modelo base se distribuye en safetensors) |

Datos adicionales del repositorio: tamaño total 3,7 GB, creado el 2026-09-22 y actualizado el 2026-09-22, 0 descargas y 0 "likes", etiquetas `transformers`, `gguf`, `roleplay`, `npc`, `character-ai`, `smollm2`, `lora`, `trl`, `sft`, `endpoints_compatible`.

Tamaños de archivo por cuantización:

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| Q2_K | 0,3 | |
| Q3_K_S | 0,3 | |
| IQ4_XS | 0,3 | |
| Q3_K_M | 0,3 | calidad inferior |
| Q3_K_L | 0,3 | |
| Q4_K_S | 0,4 | rápido, recomendado |
| Q4_K_M | 0,4 | rápido, recomendado |
| Q5_K_S | 0,4 | |
| Q5_K_M | 0,4 | |
| Q6_K | 0,5 | muy buena calidad |
| Q8_0 | 0,5 | rápido, mejor calidad |
| f16 | 0,8 | 16 bpw, excesivo |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un derivado de SmolLM2 con 361.821.120 parámetros, ajustado mediante SFT (supervised fine-tuning) con la librería TRL y bajo la técnica de LoRA, según las etiquetas del repositorio (`smollm2`, `lora`, `trl`, `sft`). El conjunto de datos empleado es chimbiwide/NPC-Dialogue_v2, un corpus de diálogo orientado a personajes no jugadores. La model card del cuantizador no reproduce hiperparámetros, número de tokens de entrenamiento, composición del dataset, ni si hubo fases posteriores de RLHF o DPO.

Metadatos internos de la cuantización: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`, lo que indica que la conversión se hizo desde pesos en formato Hugging Face y que los tensores de salida fueron cuantizados (no se conserva ninguna capa en precisión completa). No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, modos de razonamiento) ni parámetros de arquitectura más allá de la pertenencia a la familia SmolLM2.

## Capacidades

- Generación de texto conversacional en inglés, con foco explícito en diálogo de personaje y roleplay.
- Mantenimiento de estilo y "voz" de un PNJ a lo largo de turnos, gracias al ajuste sobre NPC-Dialogue_v2.
- Interacción multi-turno básica dentro de los límites que imponga la ventana de contexto (no documentada).
- Inferencia en CPU y en hardware de gama muy baja, incluidas GPUs integradas o dispositivos tipo Raspberry Pi, al partir de 0,3 GB de pesos.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: el único idioma declarado es el inglés.
- No se documentan capacidades de visión, audio ni modos de "thinking".

## Casos de uso

- Diálogo de PNJ en videojuegos: el modelo puede generar respuestas de personaje en tiempo real dentro de un motor de juego, cargado como GGUF con llama.cpp o embebido en el cliente; su tamaño de 0,3-0,5 GB permite distribuirlo con el propio juego sin depender de red.
- Prototipado rápido de personajes conversacionales: diseñadores de narrativa pueden iterar sobre prompts de personalidad y comprobar respuestas sin coste de API, usando la cuantización Q4_K_M para equilibrar velocidad y calidad.
- Bots de rol en comunidades y demos: despliegue en un servidor modesto o en local mediante Ollama o LM Studio, con varias instancias simultáneas al consumir muy poca VRAM.
- Generación de borradores de diálogo para guiones y mods: el modelo sirve como generador de primeras versiones de líneas de personaje que después se editan manualmente.
- Aplicaciones educativas de práctica conversacional en inglés: escenarios de simulación con personajes, siempre que se acepte que el modelo solo responde en inglés y con conocimiento factual limitado.
- Pruebas de infraestructura y pipelines de cuantización: al ofrecer 12 variantes del mismo modelo, es útil para medir diferencias de perplejidad y latencia entre cuantizaciones en hardware concreto.
- Generación de datos sintéticos de diálogo etiquetado para experimentos de ajuste fino posteriores, con la advertencia de que las salidas de un modelo de 360M requieren revisión.
- Asistentes interactivos sin conexión en dispositivos aislados (kioscos, instalaciones, hardware sin red), donde un modelo en CPU es la única opción viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación, y el repositorio no aporta comparaciones cuantitativas. Solo se ofrece una referencia gráfica genérica sobre calidad relativa de tipos de cuantización (enlace en la sección de enlaces), no aplicada a este modelo en concreto.

## Requisitos de hardware

Los valores siguientes son estimaciones derivadas de los tamaños de archivo publicados, no datos medidos aportados por el autor.

- VRAM estimada para inferencia (pesos + caché KV y overhead, con contexto corto): f16 en torno a 1,0-1,2 GB; Q8_0 en torno a 0,7-0,9 GB; Q6_K en torno a 0,6-0,8 GB; Q4_K_M y Q4_K_S en torno a 0,5-0,7 GB; Q3_K e IQ4_XS en torno a 0,4-0,6 GB; Q2_K en torno a 0,4 GB.
- GPU recomendadas: cualquier GPU con 1 GB o más de VRAM es suficiente; no se requiere A100, H100 ni similar. Una RTX 3060, RTX 4090, GTX 1650 o incluso una GPU integrada moderna pueden ejecutarlo.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo razonablemente recientes, y también en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python y cualquier runtime compatible con GGUF. Para vLLM o TGI sería necesario partir de los pesos safetensors del modelo base y convertir; el repositorio GGUF no es directamente compatible con esos servidores sin conversión.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo en ningún hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento en la información proporcionada. La tabla siguiente recoge únicamente lo que puede afirmarse con la información disponible y marca explícitamente lo desconocido.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-360M-NPC-Roleplay (esta ficha, GGUF) | 361.821.120 | no disponible | apache-2.0 | GGUF | Especializado en roleplay y diálogo de PNJ en inglés |
| SmolLM2-360M-Instruct | no disponible en la información proporcionada | no disponible | no verificado | no disponible | Alternativa generalista de la misma familia y tamaño; sin datos comparativos publicados aquí |
| Qwen2.5-0.5B-Instruct | no disponible en la información proporcionada | no disponible | no verificado | no disponible | Categoría similar de modelo pequeño multilingüe; sin datos comparativos publicados aquí |
| TinyLlama-1.1B-Chat | no disponible en la información proporcionada | no disponible | no verificado | no disponible | Alternativa de tamaño superior; sin datos comparativos publicados aquí |

No se ha encontrado en la información disponible ninguna evaluación que permita afirmar que este modelo supera o es superado por las alternativas en tareas de roleplay.

## Limitaciones y advertencias

- Tamaño muy reducido: con 362M parámetros, la capacidad de razonamiento, el conocimiento factual y la coherencia en conversaciones largas son estructuralmente limitados.
- Riesgo alto de alucinación: el modelo inventará hechos, nombres y detalles sin señalizarlo, algo especialmente problemático si el diálogo implica información del mundo real.
- Especialización estrecha: al estar ajustado sobre un corpus concreto de diálogo de PNJ, puede degradarse notablemente fuera de ese dominio (tareas generales, código, matemáticas).
- Idioma único: solo inglés declarado. No hay evidencia de funcionamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada: no puede planificarse el diseño de prompts largos ni conversaciones extensas sin medirlo empíricamente.
- Riesgo de contenido inapropiado: los modelos de roleplay sin filtros documentados pueden reproducir estereotipos, lenguaje ofensivo o contenido sensible; no hay ninguna salvaguarda descrita en la model card.
- Cuantizaciones agresivas: Q2_K y las variantes Q3 pueden degradar de forma acusada la coherencia en un modelo de este tamaño; el propio autor marca Q4_K_S y Q4_K_M como las opciones recomendadas.
- Ausencia de validación: 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks ni evaluaciones de terceros.
- Procedencia del ajuste: el modelo base es un adaptador LoRA de thealper2 sobre SmolLM2; conviene revisar la licencia y las condiciones del dataset chimbiwide/NPC-Dialogue_v2 antes de un uso comercial, aunque el artefacto publicado se declara Apache 2.0.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse que funcionará en pipelines que requieran llamadas a funciones.
- Fechas del repositorio: creado y actualizado el 2026-09-22 según los metadatos de HuggingFace.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/SmolLM2-360M-NPC-Roleplay-GGUF
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/SmolLM2-360M-NPC-Roleplay-i1-GGUF
- Modelo base: https://huggingface.co/thealper2/SmolLM2-360M-NPC-Roleplay
- Dataset de ajuste: https://huggingface.co/datasets/chimbiwide/NPC-Dialogue_v2
- Página de resumen y descarga del cuantizador: https://hf.tst.eu/model#SmolLM2-360M-NPC-Roleplay-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF referenciada por el autor (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede infraestructura al cuantizador, nethype GmbH: https://www.nethype.de/

Nota sobre la búsqueda web: los resultados devueltos corresponden a páginas genéricas de Microsoft (cuenta, Microsoft 365, Outlook) y no guardan relación con este modelo, por lo que no se han incorporado a la ficha. No se han localizado papers, blogs técnicos ni demos específicos de SmolLM2-360M-NPC-Roleplay en la información disponible.
