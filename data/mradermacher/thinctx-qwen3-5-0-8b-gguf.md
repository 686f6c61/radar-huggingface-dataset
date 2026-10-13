# mradermacher/ThinCtx-Qwen3.5-0.8B-GGUF

## Resumen

ThinCtx-Qwen3.5-0.8B-GGUF es una colección de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo `thinletter/ThinCtx-Qwen3.5-0.8B`, una variante de contexto largo construida sobre la familia Qwen3.5. El modelo base tiene 752.393.024 parámetros (~0,75B), está etiquetado como conversacional y multilingüe, y declara soporte para inglés, checo y alemán además de la etiqueta genérica *multilingual*. El repositorio de cuantizaciones acumula 293 descargas y 0 *likes* desde su publicación, según los metadatos, en octubre de 2026.

Su interés práctico es el de un modelo de coste computacional mínimo: el peso más ligero ocupa 0,5 GB y el más pesado (f16) 1,6 GB, lo que permite ejecutarlo en CPU, en GPUs de gama de entrada y en dispositivos de borde. La etiqueta `long-context` sugiere que el modelo base fue ajustado para manejar ventanas amplias, aunque la *model card* no especifica la longitud exacta; fuentes terceras citan 4096 tokens para el Qwen3.5-0.8B sin ajuste de contexto.

La licencia PolyForm Small Business 1.0.0 permite uso gratuito en pequeñas empresas, uso personal, investigación no comercial y evaluación por parte de cualquiera, pero exige licencia comercial para organizaciones grandes en producción. El acceso al modelo está restringido mediante un formulario (*gated*) que solicita nombre, correo de trabajo y empresa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5; no se detalla en la informacion proporcionada) |
| Parametros totales | 752.393.024 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (la model card no la especifica; el tag `long-context` indica contexto extendido respecto a la base Qwen3.5-0.8B, para la que fuentes terceras citan 4096 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; existe ademas un repositorio de cuantizaciones ponderadas/imatrix (`-i1-GGUF`) |
| Idiomas soportados | multilingual, en, cs, de |
| Licencia | polyform-small-business-1.0.0 (PolyForm Small Business 1.0.0) |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo deriva de la familia Qwen3.5, descrita por fuentes terceras como una serie multilingüe de Alibaba Cloud con razonamiento e instrucciones mejorados respecto a Qwen3, y el sufijo "ThinCtx" del modelo base apunta a un ajuste orientado a contexto largo. Se desconoce si la arquitectura es un transformer denso o una mezcla de expertos, así como el número de capas, dimensión de embeddings o mecanismo de atención.

Tampoco hay datos publicados sobre el proceso de entrenamiento: número de tokens, composición del conjunto de datos, uso de RLHF, DPO u otras técnicas de alineamiento. Lo único documentado en este repositorio es el proceso de cuantización realizado por mradermacher (versión de cuantización 2, conversión de tipo hf, tensor quantised), que genera los distintos niveles de compresión a partir de los pesos originales.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo base está ajustado para diálogo multi-turno.
- Soporte multilingüe declarado en inglés, checo y alemán, además de la etiqueta genérica *multilingual*.
- Contexto largo: el tag `long-context` sugiere capacidad de manejar entradas extensas, aunque sin cifra confirmada.
- Razonamiento e instrucciones mejorados: según fuentes terceras, la serie Qwen3.5 mejora estas capacidades respecto a Qwen3 (aplicable a la familia, no confirmado específicamente para este ajuste ThinCtx).
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponible (la familia Qwen3.5 se describe en fuentes terceras como multimodal, pero no se confirma para este modelo concreto).
- Modo *thinking* explícito: no disponible.

## Casos de uso

- Asistentes conversacionales en el dispositivo: con pesos de 0,5 a 1,6 GB, el modelo puede ejecutarse íntegramente en local (CPU o GPU integrada) para chatbots de atención básica sin enviar datos a la nube.
- Traducción EN–CS–DE en entornos con requisitos de privacidad: el soporte declarado de estos tres idiomas permite integrarlo en flujos de traducción interna donde no se puede usar una API externa.
- Resumen y extracción de información en documentos largos: la orientación a contexto largo lo hace apto para condensar informes o actas extensas en una sola pasada, siempre que se valide empíricamente la ventana real.
- Clasificación y etiquetado de textos a escala: su tamaño reducido permite procesar grandes volúmenes por lotes en CPU con coste energético bajo.
- Prototipado rápido y evaluación de cuantizaciones: al ofrecer 12 niveles distintos (Q2_K a f16), sirve para medir la degradación de calidad por compresión antes de aplicar el mismo esquema a modelos mayores.
- Generación de borradores en herramientas ofimáticas: autocompletado y redacción asistida offline en portátiles sin GPU dedicada.
- Filtrado y preprocesado previo a modelos mayores: como clasificador o generador de *prompts* en una cascada donde la consulta final la resuelve un modelo más grande.
- Despliegue en dispositivos de borde o embebidos: el nivel Q2_K (0,5 GB) cabe en hardware con memoria muy limitada, útil para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según el peso GGUF elegido): Q2_K y Q3_K_S ~0,5-0,7 GB en total; Q4_K_M, Q4_K_S e IQ4_XS ~0,8-1,0 GB; Q5_K_M/Q5_K_S y Q6_K ~1,0-1,2 GB; Q8_0 ~1,2-1,5 GB; f16 ~1,8-2,2 GB (incluye margen para el contexto y el *runtime*).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; una RTX 4090 o A100 resulta sobredimensionada para este tamaño, aunque útil si se procesan muchos lotes en paralelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPUs recientes; también funciona en CPU pura (llama.cpp) y en dispositivos como Raspberry Pi con 4 GB o más de RAM.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, kobold.cpp; vLLM y TGI tienen soporte de GGUF limitado o experimental, por lo que no son la vía natural para este formato.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinCtx-Qwen3.5-0.8B-GGUF (este) | 752.393.024 | no disponible (tag long-context) | PolyForm Small Business 1.0.0 | GGUF, 12 niveles | Cuantizaciones de mradermacher; 293 descargas |
| thinletter/ThinCtx-Qwen3.5-0.8B | 752.393.024 | no disponible (tag long-context) | PolyForm Small Business 1.0.0 | safetensors | Modelo base sin cuantizar, acceso *gated* |
| mradermacher/Qwen3.5-0.8B-GGUF | no disponible en la informacion | no disponible en la informacion | Apache 2.0 (segun la busqueda web) | GGUF | Cuantizacion de la base Qwen3.5-0.8B, sin el ajuste ThinCtx |
| mradermacher/Qwen3.5-0.8B-heretic-tuned-GGUF | no disponible en la informacion | no disponible en la informacion | Apache 2.0 (segun la busqueda web) | GGUF | Variante *heretic-tuned*, licencia mas permisiva que ThinCtx |

Las cifras de licencia y descripción de los modelos comparables provienen de los resultados de búsqueda web y no están verificadas contra sus respectivas *model cards* originales. No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Tamaño muy reducido (0,75B parámetros): la capacidad de razonamiento, matemáticas y código es previsiblemente limitada frente a modelos de 7B o superiores; no se han publicado benchmarks que lo confirmen o desmientan.
- Riesgo de alucinación: no hay datos de evaluación de veracidad ni de tasas de alucinación para este ajuste.
- Sesgos conocidos: no disponibles. Al derivar de un modelo base multilingüe, cabe esperar los sesgos propios de su corpus de entrenamiento, no documentados aquí.
- Limitaciones de idioma: solo se declaran inglés, checo y alemán; el comportamiento en castellano no está confirmado por el autor.
- Longitud de contexto no confirmada: pese a la etiqueta `long-context`, no se especifica la ventana real, por lo que conviene medirla antes de usarla en producción.
- Restricciones de licencia: PolyForm Small Business 1.0.0 no permite uso comercial a organizaciones que superen el umbral de "pequeña empresa" definido por la propia licencia; en ese caso es obligatorio contactar con info@thinletter.io.
- Acceso condicionado: el modelo base está detrás de un formulario *gated* que solicita datos de contacto y empresa.
- Degradación por cuantización: los niveles Q2_K y Q3_K pueden degradar notablemente la calidad; el propio autor recomienda Q4_K_S, Q4_K_M o Q8_0 según el equilibrio deseado entre tamaño y fidelidad.
- Sin resultados de benchmarks publicados: no es posible verificar afirmaciones de rendimiento ni compararlo de forma objetiva con alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ThinCtx-Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/thinletter/ThinCtx-Qwen3.5-0.8B
- Cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/ThinCtx-Qwen3.5-0.8B-i1-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#ThinCtx-Qwen3.5-0.8B-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke, referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
- Cuantizacion de la base Qwen3.5-0.8B: https://huggingface.co/mradermacher/Qwen3.5-0.8B-GGUF
- Variante heretic-tuned: https://huggingface.co/mradermacher/Qwen3.5-0.8B-heretic-tuned-GGUF
- Qwen3.5-0.8B en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
