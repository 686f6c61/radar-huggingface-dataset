# BAJUKA/LLaVA-llama32-3b-Tfull-s1337-s2b

## Resumen

`BAJUKA/LLaVA-llama32-3b-Tfull-s1337-s2b` es un artefacto de investigación publicado por el usuario BAJUKA: la rama "text twin" (gemelo de texto) de un experimento controlado que compara entrenamiento visión-lenguaje (VL) frente a entrenamiento puramente textual sobre el mismo pipeline de LLaVA-NeXT. El backbone es `meta-llama/Llama-3.2-3B-Instruct` (semilla 1337) y el checkpoint corresponde a la etapa S2b, la fase de instrucciones ("instruct stage"). El modelo no está pensado como release de producción, sino como una pieza de un grid experimental reproducible.

El objetivo del diseño es aislar la contribución del entrenamiento multimodal: cada brazo del grid ve exactamente las mismas mezclas de datos, el mismo orden de ejemplos para una semilla dada, los mismos hiperparámetros de optimizador y el mismo esquema de LR reiniciado. La única diferencia entre brazos es el dato, el orden y qué módulos son entrenables. En esta rama concreta se eliminan los tokens `<image>`/`<video>` y el campo de imagen, de modo que solo se ajusta el modelo de lenguaje; los pesos del vision tower y del proyector se conservan en el checkpoint con sus valores iniciales y no se usan.

Con 3.623.479.840 parámetros totales (incluyendo vision tower y proyector heredados, no utilizados), licencia `llama3.2` y un repositorio de 7,3 GB en safetensors, el interés actual del modelo es metodológico: permite medir qué cambia el entrenamiento VL respecto a consumir exactamente el mismo texto, algo poco habitual en publicaciones de modelos multimodales. Su uso requiere el repositorio LLaVA-NeXT, ya que la clase `LlavaLlamaForCausalLM` no forma parte de `transformers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) envuelto en la clase `LlavaLlamaForCausalLM` de LLaVA-NeXT; vision tower y proyector presentes en el checkpoint pero no utilizados |
| Parámetros totales | 3.623.479.840 (~3,62 mil millones), incluyendo los pesos del vision tower y del proyector en sus valores iniciales |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia declarada durante el entrenamiento de la etapa S2b); no se documenta validación a contextos mayores |
| Tipos de cuantización | no disponibles; el repositorio solo publica safetensors en bfloat16 |
| Idiomas soportados | no disponibles para este checkpoint; el modelo base declara 8 idiomas oficiales (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | `llama3.2` (Llama 3.2 Community License) |
| Formato de pesos | safetensors en bfloat16; tamaño del repositorio 7,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la de LLaVA-NeXT sobre Llama 3.2 3B: un transformer decoder-only con el modelo de lenguaje bajo el prefijo `mm_language_model`, más un vision tower y un proyector que en este brazo permanecen congelados en su inicialización y no intervienen en la inferencia. Esta rama es explícitamente "text-only": los ejemplos de entrenamiento son los mismos que los del gemelo VL, en el mismo orden, pero con los tokens `<image>`/`<video>` eliminados y el campo de imagen suprimido.

El entrenamiento corresponde a la etapa S2b (instruct), inicializada desde el checkpoint S2a del mismo brazo (`LLaVA-llama32-3b-Tfull-s1337/s2a`), que a su vez es el brazo "cap-only" en esa semilla. La mezcla de datos es INS-750K: `instruct_700k_v2` (697.850 ejemplos) más `language_50k_v2` (49.956 ejemplos). Solo se entrena el modelo de lenguaje (`mm_language_model`); el vision tower y el proyector no se tocan. Se completó 1 época con 5842 de 5842 pasos, batch global de 128, learning rate 1e-5 (LM y proyector) con schedule coseno y warmup ratio 0.03, precisión bfloat16, longitud máxima de secuencia de 8192 y 4x H100 80GB con DeepSpeed ZeRO-3. La pérdida de entrenamiento pasó de 0.958 a 0.652 (media de los últimos 50 pasos registrados: 0.637), con 0 pérdidas no finitas en los 5842 pasos. El repositorio incluye `trainer_state.json` con el histórico completo por paso de pérdida, norma del gradiente y learning rate. No se aplicó early stopping ni selección de checkpoint: cada etapa ejecuta una época completa.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base y ajustada sobre la mezcla INS-750K en la etapa S2b.
- Seguimiento de instrucciones (instruction following) sobre datos `instruct_700k_v2`, sin filtrado posterior de calidad ni alineamiento de seguridad.
- Generación de texto condicionada a plantilla de prompt `llama_v3`.
- Capacidad de procesar secuencias de hasta 8192 tokens durante el entrenamiento.
- No dispone de capacidades de visión operativas: aunque el checkpoint contiene los pesos del vision tower y del proyector, estos conservan sus valores iniciales y el brazo se entrenó sin imágenes ni vídeo.
- Soporte de tool calling / function calling: no documentado por el autor.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Modo de razonamiento explícito ("thinking mode"), audio u otras modalidades: no disponibles.
- Capacidades multilingües: no documentadas para este checkpoint; las del modelo base no se han verificado tras el ajuste.

## Casos de uso

- Investigación sobre entrenamiento multimodal frente a textual: el modelo sirve como control textual directo del gemelo VL con la misma mezcla y el mismo orden de datos, de forma que la diferencia de comportamiento entre ambos es atribuible al entrenamiento con imágenes y no a confundidores de datos u optimizador.
- Reproducción de experimentos controlados: al publicarse las etapas S2a y S2b por separado, permite reproducir la progresión de una etapa de captioning a una etapa de instrucciones manteniendo la semilla 1337 y el esquema de LR.
- Estudios de ablación sobre qué módulos se entrenan: al haberse ajustado solo `mm_language_model`, el checkpoint permite comparar contra brazos que sí entrenan proyector o vision tower dentro del mismo grid.
- Análisis de dinámica de entrenamiento: el `trainer_state.json` incluido facilita estudiar curvas de pérdida, norma del gradiente y schedule de LR en un ajuste instruct de 5842 pasos sobre 4x H100.
- Generación de texto instruct en entornos de laboratorio: con la plantilla `llama_v3` y hasta 8192 tokens de contexto, es utilizable para tareas de generación y resumen de texto en experimentos internos donde no se exija un modelo alineado en seguridad.
- Generación sintética de datos textuales para investigación: puede emplearse para producir borradores de instrucciones o respuestas que después se filtren manualmente, dado que se trata de un artefacto de investigación sin garantías de calidad.
- Punto de partida para ajustes posteriores: al ser un checkpoint instruct de 3,62 mil millones de parámetros y licencia Llama 3.2, puede servir como base para fine-tuning específico de dominio en el mismo pipeline de LLaVA-NeXT.
- No se recomienda su uso en atención al cliente, producción o cualquier escenario con requisitos de seguridad, ya que no ha pasado por alineamiento ni evaluación de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye evaluaciones tipo MMLU, HumanEval, GSM8K ni métricas de tarea en la model card; el único dato cuantitativo publicado es la pérdida de entrenamiento (0.958 → 0.652, media de los últimos 50 pasos 0.637) sobre la mezcla INS-750K, que no es comparable con benchmarks estandarizados. El modelo base `meta-llama/Llama-3.2-3B-Instruct` sí publica sus propias evaluaciones en su model card, pero no se han transferido ni verificado para este checkpoint ajustado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: alrededor de 7,3 GB solo para pesos (el repositorio incluye además el vision tower y el proyector, que se cargan aunque no se usen), más caché KV. Con 8192 tokens de contexto la caché KV en bfloat16 se sitúa en el orden de 1 GB, por lo que conviene reservar entre 9 y 10 GB de VRAM.
- Cuantizaciones de 8 y 4 bits: no publicadas por el autor. Si se generan externamente, los pesos quedarían aproximadamente en 4-5 GB (8 bits) y 2,5-3 GB (4 bits), estimaciones derivadas del número de parámetros y no verificadas en este checkpoint.
- GPU recomendadas: H100 80GB y A100 80/40GB para entrenamiento o serving con lotes grandes; RTX 4090, RTX 3090, A10G o L40S (24 GB) para inferencia en bfloat16 con contexto completo.
- ¿Cabe en GPU de consumo? Sí: una RTX 4090 o RTX 3090 de 24 GB lo ejecuta sin problemas en bfloat16. Tarjetas de 12 GB (RTX 3060 12GB, RTX 4070) pueden funcionar en bfloat16 con contexto reducido o recurriendo a cuantización.
- Opciones de despliegue: la vía documentada por el autor es el repositorio LLaVA-NeXT, cargando el modelo con `load_pretrained_model(..., "llava_llama")`, ya que `LlavaLlamaForCausalLM` no está en `transformers`. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama. Los pesos del modelo de lenguaje se almacenan bajo el prefijo `mm_language_model`, por lo que en principio podrían extraerse para cargarse con `LlamaForCausalLM` de `transformers`, pero el autor no documenta ese procedimiento y no está verificado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `BAJUKA/LLaVA-llama32-3b-Tfull-s1337-s2b` (este) | 3,62 mil millones | 8192 tokens (máx. de secuencia en entrenamiento) | Texto únicamente; INS-750K, etapa S2b desde S2a, solo LM entrenable | llama3.2 | Safetensors en HuggingFace; requiere LLaVA-NeXT |
| `BAJUKA/LLaVA-llama32-3b-Tfull-s1337` (etapa S2a) | 3,62 mil millones | no disponible | Brazo "cap-only" del mismo grid, misma semilla 1337 | llama3.2 | Safetensors en HuggingFace |
| Gemelo VL-full del mismo grid (con tokens de imagen/vídeo) | 3,62 mil millones | no disponible | Mismos datos y orden, pero con imagen y vídeo; módulos de visión entrenados | llama3.2 | Referenciado en la model card; identificador exacto no disponible |
| `meta-llama/Llama-3.2-3B-Instruct` (modelo base) | 3,21 mil millones | 128.000 tokens declarados por el autor del base | Instruct generalista con alineamiento de seguridad | llama3.2 | Safetensors en HuggingFace; soporte nativo en `transformers`, vLLM, TGI y llama.cpp |

La comparación con alternativas de terceros de tamaño similar no está disponible: no se han publicado evaluaciones de este checkpoint que permitan situarlo frente a otros modelos de ~3B.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo describe como un checkpoint de comparación controlada, no como una versión ajustada ni alineada en seguridad.
- Sesgos: no se han evaluado; hereda los sesgos de `meta-llama/Llama-3.2-3B-Instruct` y de la mezcla INS-750K, cuya composición demográfica y lingüística no se detalla.
- Riesgo de alucinación: no se ha medido. Al no haber pasado por RLHF ni DPO en esta etapa, la probabilidad de respuestas plausibles pero incorrectas puede ser mayor que en un instruct alineado.
- Idiomas: no se documenta la cobertura lingüística del checkpoint ni de la mezcla de entrenamiento, por lo que no hay garantías de calidad fuera del inglés.
- Contexto limitado a 8192 tokens en entrenamiento: aunque el modelo base soporta ventanas mayores, no se ha validado el comportamiento de este checkpoint más allá de esa longitud.
- Sin selección de checkpoint: cada etapa ejecuta una época completa sin early stopping, por lo que el checkpoint publicado no es necesariamente el mejor en ninguna métrica.
- Visión no operativa: los pesos del vision tower y del proyector están en sus valores iniciales; cargarlos no aporta capacidad multimodal.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, con las obligaciones habituales de atribución, requisitos de nomenclatura para derivados y la cláusula de 700 millones de usuarios activos mensuales que condiciona el uso comercial a gran escala. Conviene revisar el texto completo de la licencia antes de cualquier despliegue comercial.
- Sin estado de optimizador publicado: el repositorio no incluye estado de optimizador, DeepSpeed ni RNG, por lo que no es posible reanudar el entrenamiento tal cual; son pesos de inferencia.
- Madurez del ecosistema: al depender de `LlavaLlamaForCausalLM` fuera de `transformers`, no hay integración estándar con servidores de inferencia habituales, lo que complica su uso en producción.
- Cero descargas y cero "likes" en el momento de redactar esta ficha: no existe validación por parte de la comunidad ni informes independientes de comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BAJUKA/LLaVA-llama32-3b-Tfull-s1337-s2b
- Checkpoint de la etapa previa (S2a) del mismo brazo: https://huggingface.co/BAJUKA/LLaVA-llama32-3b-Tfull-s1337
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio LLaVA-NeXT (necesario para cargar los pesos): https://github.com/LLaVA-VL/LLaVA-NeXT
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos correspondían a páginas de Outlook y servicios de correo, sin relación con el checkpoint. No se han localizado papers, blogs ni demos adicionales.
