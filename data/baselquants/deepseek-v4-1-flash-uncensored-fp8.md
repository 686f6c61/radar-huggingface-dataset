# baselquants/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una variante modificada del modelo multimodal DeepSeek-V4.1-Flash publicada por el usuario baselquants en HuggingFace. Se trata de un checkpoint al que se le ha aplicado una eliminación quirúrgica de los circuitos de rechazo a nivel de pesos (técnica conocida como "abliteration"), comercializada en la propia model card como "sin guardrails". El resultado es un modelo que, según los datos del autor, responde con cumplimiento total a las 320 peticiones del conjunto HarmBench-320, incluidas las categorías de riesgo químico-biológico, cibercrimen y acoso.

Arquitectónicamente es un transformer causal encoder-decoder de 20+20 capas con mezcla de expertos (384 expertos enrutados con top-6 más 1 compartido), atención dispersa CSA2, memoria n-gram Engram, residuales Hyper-Connections de 4 canales y una cabeza de borrador especulativa DSpark. Incluye torre de visión DeepSeek-ViT con 2D-RoPE y pixel unshuffle, y declara una ventana de contexto de 1.000.000 de tokens. Los pesos se distribuyen en FP8 nativo (e4m3fn) con escala de bloque E8M0 de [32, 32] y expertos enrutados en FP4.

Su relevancia es doble: por un lado sirve como caso de estudio de hasta qué punto la supresión de circuitos de seguridad degrada (o no) las capacidades del modelo base; por otro, es un ejemplo de publicación de un modelo de 763.000 millones de parámetros con la alineación de seguridad eliminada y licencia MIT, lo que plantea problemas serios de uso responsable. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y no consta validación independiente de los resultados declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal encoder-decoder (20+20 capas), MoE con 384 expertos enrutados top-6 + 1 compartido, Hyper-Connections (residual de 4 canales), atención dispersa CSA2, memoria n-gram Engram, cabeza de borrador especulativa DSpark, torre de visión DeepSeek-ViT (2D-RoPE + pixel unshuffle) |
| Parámetros totales | 763.205.315.794 (~763,2 B) según safetensors; la model card declara un backbone de 552 B (discrepancia no explicada por el autor) |
| Parámetros activos | 8 B - 16 B por token según la model card (no verificado) |
| Longitud de contexto | 1.000.000 tokens según la model card (no verificado) |
| Tipos de cuantización | FP8 (e4m3fn) con escala de bloque E8M0 [32, 32] en pesos principales y FP4 en expertos enrutados; cuantización nativa, no modificada. No se publican variantes GGUF ni otras |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 510,3 GB) |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura del base DeepSeek-V4.1-Flash: decodificador causal con 20 capas de encoder y 20 de decoder, mezcla de expertos con 384 expertos enrutados (top-6 activos) más un experto compartido, conexiones residuales Hyper-Connections de 4 canales, atención dispersa CSA2 y una memoria n-gram Engram. Incorpora además una cabeza de borrador especulativa (DSpark) para decodificación especulativa y una torre de visión DeepSeek-ViT con 2D-RoPE y pixel unshuffle para entrada de imágenes. La cuantización FP8/FP4 es nativa y no ha sido alterada por el autor del derivado: los pesos principales van en FP8 e4m3fn con escalas de bloque E8M0 de [32, 32], mientras que los expertos enrutados usan FP4.

No hay información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada. Lo único documentado es el procedimiento de modificación del derivado: una "abliteración a nivel de pesos" que, según el autor, elimina los circuitos de rechazo sin usar código personalizado, hooks en tiempo de ejecución ni vectores de dirección, conservando byte a byte los componentes críticos para la capacidad (expertos enrutados, memoria Engram, atención dispersa CSA2, cabeza DSpark, torre de visión, puertas del router, normalizaciones y embeddings). La model card afirma que se preserva la capacidad MMLU, el razonamiento, la visión, el MTP y la coherencia multi-turno, afirmación que no coincide del todo con los resultados que el propio autor publica (véase la sección de benchmarks).

## Capacidades

- Generación de texto y razonamiento en modo "effort=max", con traza de razonamiento verificable según el autor.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), con torre de visión DeepSeek-ViT intacta.
- Contexto largo de hasta 1.000.000 de tokens (dato declarado por el autor, no verificado de forma independiente).
- Soporte de tool calling y function calling implícito en el ecosistema de la familia DeepSeek y en la etiqueta `endpoints_compatible`; no se detalla el esquema exacto en la información disponible.
- Capacidad para tareas multirrespuesta y multi-turno, según la model card.
- Decodificación especulativa mediante la cabeza DSpark.
- Comportamiento sin rechazo: cumplimiento declarado del 100 % en las 320 peticiones de HarmBench-320, incluidas las categorías de daño químico-biológico, cibercrimen, acoso, contenido ilegal, desinformación y copyright.
- Capacidades multilingües: no disponibles como dato explícito.

## Casos de uso

- Investigación en seguridad y red-teaming: el modelo puede emplearse como sujeto de prueba para medir hasta qué punto la eliminación de circuitos de rechazo afecta a la tasa de cumplimiento de peticiones dañinas, usando HarmBench-320 u otros conjuntos con protocolo de clasificación por niveles (HARD_REF / SOFT_RED / HEDGE / COMPLY).
- Estudio de ablación y alineación: la comparación directa contra el base permite cuantificar qué capacidades dependen de los circuitos de seguridad, como muestra la caída de 39,89 pp en el subconjunto `moral_scenarios` de MMLU frente a una pérdida de solo 1,1 pp en el resto de materias.
- Análisis de documentos extensos multimodales: con 1M de tokens de contexto y torre de visión, permite ingerir manuales técnicos, informes con figuras o expedientes completos en una sola pasada sin troceado.
- Procesamiento de bases de código grandes: el contexto de 1M tokens admite repositorios enteros en una única ventana, útil para refactorización, análisis de dependencias o generación de parches sobre proyectos medianos.
- Extracción estructurada y OCR de documentación técnica: la combinación de visión y modelo de lenguaje permite convertir planos, tablas o formularios escaneados en JSON u otros formatos estructurados.
- Pipelines de agentes multi-paso: la combinación de tool calling, razonamiento extendido y contexto largo permite encadenar búsqueda, cálculo y verificación en flujos de automatización.
- Reproducción de investigación en cuantización y arquitecturas MoE: el checkpoint permite estudiar en la práctica el comportamiento de FP8 con escalas E8M0, expertos en FP4, atención dispersa CSA2 y decodificación especulativa DSpark.
- Generación de datos sintéticos: puede emplearse para producir corpus de entrenamiento o evaluación, con la advertencia explícita de que la ausencia de filtros de seguridad obliga a auditar y filtrar la salida antes de cualquier uso posterior.

## Benchmarks y rendimiento

Los únicos datos publicados son los que reporta el propio autor en la model card. HarmBench-320 se evalúa con decodificación greedy (T=0) y clasificación en cuatro niveles; el "ASR" que reporta el autor equivale a la tasa de cumplimiento de la petición.

| Evaluación | Base | Modelo UNCENSORED-FP8 | Delta |
|---|---:|---:|---:|
| HarmBench-320, effort=off | 42,81 % (137/320) | 100,00 % (320/320) | +57,19 pp |
| HarmBench-320, effort=max | 1,56 % (5/320) | 100,00 % (320/320) | +98,44 pp |

Desglose por categoría semántica (HarmBench-320):

| Categoría | Ítems | Base off | UNCENSORED off | Base max | UNCENSORED max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

MMLU completo (14.042 ítems, logits del base, T=0):

| Versión | Correctas | Precisión | Delta |
|---|---:|---:|---:|
| Base | 12.211 / 14.042 | 86,96 % | — |
| UNCENSORED-FP8 | 11.619 / 14.042 | 82,74 % | -4,22 pp |

El autor señala que, excluyendo el clúster de ética (`moral_scenarios`, `business_ethics`, `professional_law`, `jurisprudence`, `philosophy`), la caída en los ~11.000 ítems restantes es de -1,1 pp. Los mayores descensos por asignatura son: `moral scenarios` -39,89 pp (76,9 % → 37,0 %), `professional law` -7,04 pp, `abstract algebra` -6,00 pp, `security studies` -5,31 pp y `high school computer science` -4,00 pp. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMLU-Pro, MMMU, etc.) en la información disponible, ni existe validación independiente de estas cifras.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan ~510 GB en el formato publicado (FP8 + FP4 en expertos). Sumando overhead de runtime, activaciones y caché KV, se necesita un mínimo estimado de 530-560 GB de memoria acelerada; cifra no confirmada por el autor.
- Caché KV a 1M tokens: no disponible. La atención dispersa CSA2 reduce el coste frente a atención densa, pero el autor no publica cifras concretas.
- GPU recomendadas: 8× H100 80 GB SXM (640 GB, ajustado, probablemente inviable con 1M de contexto real), 4× H200 141 GB (564 GB, muy justo), 8× H200 (1.128 GB, con margen), 8× B200 192 GB (1.536 GB, margen amplio). Requiere tensor parallelism y, previsiblemente, más de un nodo en configuraciones de 80 GB.
- GPU de consumo: no cabe. Ni siquiera 4× RTX 4090 (96 GB) o configuraciones de 2-4 GPU de 24-48 GB se acercan al requisito de ~510 GB.
- Opciones de despliegue: la librería declarada es `transformers`. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se confirma soporte de vLLM, SGLang o TGI, algo crítico dado que la arquitectura (`deepseek_v41`) es personalizada y depende de implementación upstream. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son aplicables; tampoco hay cuantizaciones de menor precisión listadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros en la información proporcionada. La única comparativa posible es contra el modelo base, que es el mismo sistema sin la modificación de pesos:

| Modelo | Parámetros | Contexto | MMLU (14k) | HarmBench-320 (off / max) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| DeepSeek-V4.1-Flash (base) | 552 B declarados | 1M | 86,96 % | 42,81 % / 1,56 % | no disponible | HuggingFace |
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763,2 B (safetensors) | 1M | 82,74 % | 100,00 % / 100,00 % | MIT | HuggingFace |

Alternativas de terceros de la misma categoría (modelos MoE multimodales de escala similar): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de guardrails: el modelo responde con cumplimiento del 100 % a peticiones de las categorías de daño químico-biológico, cibercrimen, acoso, contenido ilegal y desinformación. Es un riesgo directo si se despliega sin moderación externa.
- Sesgos conocidos: no documentados por el autor. La eliminación selectiva de circuitos de rechazo puede alterar de forma no uniforme el comportamiento en dominios sensibles; la caída de 39,89 pp en `moral_scenarios` apunta a un deterioro específico del juicio ético.
- Riesgo de alucinación: no cuantificado. No hay evaluaciones de veracidad ni de factualidad.
- Discrepancia de datos: la model card declara un backbone de 552 B de parámetros, mientras que los safetensors suman 763,2 B. El autor no explica a qué corresponden los ~211 B adicionales (posiblemente torre de visión, memoria Engram y cabezas auxiliares, pero no se detalla).
- Discrepancia de capacidades: la model card afirma preservar la capacidad MMLU, pero los resultados publicados muestran -4,22 pp en el conjunto completo.
- Limitaciones de contexto e idioma: el contexto de 1M tokens es una declaración del autor sin evaluación publicada; los idiomas soportados no se especifican.
- Restricciones de licencia: el derivado se publica bajo MIT, pero no se indica la licencia del modelo base ni si sus términos permiten redistribuir un derivado con la alineación de seguridad eliminada. Esta es una zona legal no resuelta que conviene verificar antes de cualquier uso comercial.
- Falta de validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, repositorio creado y actualizado el mismo día (18 de septiembre de 2026), sin historial de versiones ni informes de terceros que reproduzcan los resultados.
- Coste de despliegue: ~510 GB de pesos hacen inviable la inferencia en hardware de consumo y limitan el uso a clústeres con múltiples GPU de 80-192 GB.
- Los resultados de HarmBench fueron clasificados por el propio autor con un clasificador regex multilingüe y, en el caso de `effort=max`, un LLM como juez; no hay revisión independiente del protocolo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/baselquants/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil del coautor en X: https://x.com/jordanschenck
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relación con el modelo.
