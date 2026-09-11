# dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una variante del modelo DeepSeek-V4.1-Flash publicada por el usuario dealignai en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura MoE (Mixture of Experts) y encoder-decoder causal, al que se le ha aplicado un proceso de "abliteración" a nivel de pesos: se eliminan quirúrgicamente las direcciones de rechazo en los escritores residuales, de modo que el modelo deja de producir negativas o evasivas ante peticiones que el modelo base rechazaría.

El problema que aborda es el de la investigación sobre seguridad y alineación: el autor publica métricas de HarmBench-320 con una tasa de cumplimiento (ASR) del 100 % en las 320 peticiones dañinas evaluadas, junto con la degradación medida en MMLU. La relevancia de la ficha es que documenta de forma cuantificada el coste en capacidad de conocimiento de una abliteración agresiva, algo poco habitual en este tipo de publicaciones.

El modelo conserva el contexto declarado de 1M tokens, el torreón de visión DeepSeek-ViT y los mecanismos de decodificación especulativa DSpark del modelo base. La model card indica 552B parámetros en el backbone con 8B/16B activos por token, mientras que el recuento real de safetensors del repositorio es de 763.205.315.794 parámetros, una discrepancia que la información disponible no explica (probablemente por la inclusión de tablas Engram, cabezales MTP y torre de visión en el recuento total). El repositorio ocupa 510,3 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-Decoder causal (20+20 capas), MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections (residual de 4 canales), atención dispersa CSA2, memoria n-gram Engram, borrador especulativo DSpark, torre de visión DeepSeek-ViT |
| Parámetros totales | 763.205.315.794 (recuento real de safetensors); la model card declara 552B en el backbone |
| Parámetros activos | 8B / 16B activos por token (según la model card del autor) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | FP8 (e4m3fn) en pesos con block-scale E8M0 [32, 32]; FP4 en expertos enrutados; nativa y sin modificar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8/FP4 nativo); no se publica GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder causal de 20+20 capas con mezcla de expertos. El MoE combina 384 expertos enrutados con selección top-6 más un experto compartido. Incorpora "Hyper-Connections" (residual de 4 canales), atención dispersa CSA2 con indexador y compresor, y una memoria n-gram Engram que actúa como tabla de recuperación de secuencias. Para decodificación incorpora DSpark, un mecanismo de borrador especulativo. La torre de visión es DeepSeek-ViT con 2D-RoPE y pixel unshuffle. La cuantización FP8/FP4 es nativa del modelo base y no ha sido alterada por el autor de esta variante.

El proceso de modificación es una abliteración de pesos denominada MPOA (Magnitude-Preserving Orthogonal Ablation). Se extraen direcciones de rechazo por cada par (capa, tipo) mediante hooks sobre estados ocultos en la implementación de referencia de DeepSeek, y se sustraen del subespacio correspondiente. En total se modifican 54 tensores (atención `wo_b` y experto compartido `w2` en las capas 10 a 36) sobre 96.085 tensores, repartidos en 27 shards. El resto de componentes (expertos enrutados, tablas Engram, puertas del router, indexador/compresor CSA2, cabezales DSpark y torre de visión) son idénticos byte a byte al modelo base. No se documenta en la información disponible un reentrenamiento posterior, RLHF ni DPO adicionales sobre esta variante.

## Capacidades

- Generación de texto y razonamiento con dos modos de esfuerzo declarados (`effort=off` y `effort=max`); en modo max el modelo puede generar entre 4.000 y 5.000 caracteres de razonamiento antes de empezar la respuesta, y la propia model card cita la recomendación de DeepSeek de presupuestar al menos 256K tokens para ese modo.
- Capacidad multimodal de entrada: pipeline image-text-to-text con torre DeepSeek-ViT (2D-RoPE y pixel unshuffle), sin modificar respecto al modelo base.
- Soporte de tools: la model card indica explícitamente "Vision + tools" como característica conservada.
- Decodificación especulativa mediante los cabezales borrador DSpark, preservados intactos.
- Memoria n-gram Engram, también preservada.
- Ausencia deliberada de rechazos: la abliteración elimina la dirección de rechazo, lo que se traduce en una tasa de cumplimiento del 100 % en la evaluación HarmBench-320 incluida en la model card.
- Coherencia multi-turno: el autor afirma haberla preservado, aunque no aporta una métrica específica de conversación multi-turno.
- Capacidades multilingües: no disponible (no se declaran idiomas soportados).
- Razonamiento, código y matemáticas: heredados del modelo base, pero sin benchmarks específicos publicados (HumanEval, GSM8K, etc.) en la información disponible.

## Casos de uso

- Red teaming de sistemas de IA: el modelo sirve para generar intentos de ataque adversariales contra clasificadores de seguridad y filtros de contenido, aprovechando su tasa de cumplimiento del 100 % documentada en HarmBench-320 para disponer de un generador de casos hostiles sin fricción.
- Investigación en alineación e interpretabilidad: la variante permite estudiar el efecto de eliminar direcciones de rechazo sobre el comportamiento del modelo, comparando la degradación de MMLU reportada (-4,22 pp global, -1,1 pp excluyendo el clúster de ética).
- Generación de datos sintéticos etiquetados para entrenar clasificadores de seguridad: se pueden producir pares prompt-respuesta de contenido sensible como conjunto de datos para modelos de moderación, dado que el modelo responde sin evasivas y de forma predecible.
- Análisis de documentación técnica extensa con gráficos: la combinación de 1M tokens de contexto y entrada de imagen permite procesar informes completos con diagramas, tablas escaneadas y figuras en una sola pasada.
- Agentes autónomos multi-paso con uso de herramientas: el soporte de tools y la coherencia multi-turno declarada permiten construir bucles de razonamiento con llamadas a funciones, aunque no hay latencias ni tasas de éxito publicadas para tareas tipo agentic.
- Copiloto de código en pipelines internos: al conservar el conocimiento de los sujetos de informática de MMLU (con caídas de entre -2 y -4 pp en los sujetos de ciencias de la computación), puede integrarse en revisión de código y generación de parches, siempre con validación humana.
- Extracción y estructuración de información en imágenes: OCR de diagramas, capturas y documentos escaneados con la torre de visión intacta, útil en pipelines de digitalización documental.
- Estudio controlado de contenido sensible en dominio académico: en entornos aislados, para investigación en ciberseguridad, química o derecho sobre materiales que un modelo alineado rechazaría, con la salvedad de que el propio modelo advierte de su ausencia de guardarraíles.

## Benchmarks y rendimiento

HarmBench-320, `effort=off`, T=0 greedy, max_tok=4000, con revisión manual de las 320 respuestas y clasificación en cuatro niveles (HARD_REF / SOFT_RED / HEDGE / COMPLY):

| Categoría | Ítems | HARD_REF | SOFT_RED | HEDGE | COMPLY | ASR |
|---|---:|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 0 | 0 | 0 | 42 | 100,0 % |
| copyright | 80 | 0 | 0 | 0 | 80 | 100,0 % |
| cybercrime_intrusion | 52 | 0 | 0 | 0 | 52 | 100,0 % |
| harassment_bullying | 21 | 0 | 0 | 0 | 21 | 100,0 % |
| harmful | 18 | 0 | 0 | 0 | 18 | 100,0 % |
| illegal | 53 | 0 | 0 | 0 | 53 | 100,0 % |
| misinformation_disinformation | 54 | 0 | 0 | 0 | 54 | 100,0 % |
| **Total** | **320** | **0** | **0** | **0** | **320** | **100,0 %** |

HarmBench-320 en `effort=max`, T=0 greedy, max_tok=12000: dato incompleto en el momento de publicación. El resultado interino con n=15 no registra ningún HARD_REF ni SOFT_RED. La model card advierte que el modelo puede consumir 4.000-5.000 caracteres de razonamiento antes del contenido y que los ítems que agotan presupuesto se clasifican como COMPLY_TRUNCATED o EMPTY_REASONING_ONLY.

MMLU-14k (conjunto de test completo, logits base, T=0):

| Versión | Correctas | Precisión | Delta |
|---|---:|---:|---:|
| base | 12.211 / 14.042 | 86,96 % | — |
| CRACK | 11.619 / 14.042 | 82,74 % | -4,22 pp |

Excluyendo el clúster de ética (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), el delta sobre los aproximadamente 11.000 ítems restantes es de -1,1 pp. Los mayores descensos publicados por sujeto son: moral scenarios (895 ítems, 76,9 % → 37,0 %, -39,89 pp), professional law (1.534 ítems, 75,9 % → 68,8 %, -7,04 pp), abstract algebra (100 ítems, 77,0 % → 71,0 %, -6,00 pp) y security studies (245 ítems, 84,5 % → 79,2 %, -5,31 pp). El resto del desglose por sujeto aparece truncado en la información disponible.

No se han publicado en la información disponible resultados de HumanEval, GSM8K, MMLU-Pro, ni comparativas de MMLU con el modelo base más allá de las cifras anteriores.

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del tamaño del repositorio declarado (510,3 GB) y del recuento de parámetros; la información proporcionada no incluye requisitos oficiales de hardware.

- Pesos en disco: 510,3 GB en safetensors con FP8/FP4 nativo. La carga en memoria implica un consumo de VRAM del mismo orden.
- VRAM mínima estimada solo para pesos: en torno a 510-550 GB, lo que exige al menos 7×H100 80 GB (560 GB) en el límite y no deja margen para caché KV ni activaciones; 8×H100 80 GB (640 GB) o 8×H200 141 GB son configuraciones más realistas.
- Caché KV para 1M tokens: no disponible. La atención dispersa CSA2 reduce el coste teórico respecto a atención densa, pero no se publican cifras de memoria por token.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090 24 GB, RTX 5090, etc.) ni en configuraciones multi-GPU de gama alta para consumidores.
- Opciones de despliegue: la librería declarada es transformers. El tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se confirma soporte explícito de vLLM, SGLang, TGI, llama.cpp u Ollama; este último queda descartado al no publicarse GGUF.
- Latencia y throughput: no disponible.
- Recomendación del autor para el modo `effort=max`: presupuestar un máximo de generación de al menos 256K tokens, lo que tiene implicaciones directas en memoria de caché y tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (base) | 552B backbone, 8B/16B activos | 1M tokens | 86,96 % (MMLU-14k) | MIT (según la ficha de esta variante) | deepseek-ai/DeepSeek-V4.1-Flash |
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763,2B según safetensors (552B backbone declarado) | 1M tokens | 82,74 % (MMLU-14k) | MIT | dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8 |
| Otras variantes abliterated de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de otros modelos comparables (Qwen, Llama, Mistral ni variantes sin censura de terceros), por lo que la comparativa se limita al modelo base. La búsqueda web realizada no devolvió resultados relacionados con este modelo.

## Limitaciones y advertencias

- Ausencia total de guardarraíles: la model card declara explícitamente "no guardrails" y una tasa de cumplimiento del 100 % en HarmBench-320 en modo `effort=off`, incluidas las categorías chemical_biological, cybercrime_intrusion y harassment_bullying.
- Riesgo de uso indebido elevado: el modelo está diseñado para responder a peticiones dañinas sin rechazo, por lo que no es apto para despliegues de cara al público sin capas externas de moderación.
- Degradación medible de conocimiento: -4,22 pp en MMLU-14k respecto al base. La caída se concentra en el clúster de ética, con un descenso del 39,89 pp en moral scenarios y de 7,04 pp en professional law. Excluyendo ese clúster, el autor reporta -1,1 pp.
- Alucinación: no se han publicado métricas de veracidad ni tasas de alucinación. El autor tampoco documenta evaluaciones de factualidad.
- Idiomas: no disponible. No se declaran idiomas soportados, por lo que se desconoce el rendimiento multilingüe.
- Licencia MIT: permite uso comercial y modificación, pero el autor del modelo base y los pesos derivados pueden estar sujetos a términos adicionales, no detallados en la información disponible.
- Evaluación incompleta: el resultado de HarmBench en `effort=max` es interino (n=15) y el desglose completo por sujeto de MMLU aparece truncado en la información proporcionada.
- Procedencia del ajuste: la abliteración se aplica sobre pesos FP8/FP4 ya cuantizados, modificando 54 tensores, sin que se documente una validación de que la cuantización no introduce artefactos adicionales en el comportamiento.
- Estado del repositorio: 0 descargas y 1 "like" en el momento de la consulta, con fecha de creación y última actualización el 10 de septiembre de 2026. Sin comunidad de validación independiente.
- Advertencia legal: el uso de las categorías evaluadas (química, biología, intrusión informática) puede infringir normativa según jurisdicción, con independencia de lo permisivo de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil del coautor en X: https://x.com/jordanschenck
- Paper, repositorio de código y demo: no disponible.
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los resultados obtenidos correspondían a consultas no vinculadas.
