# mradermacher/XORTRON-RICO-v3-GGUF

## Resumen

XORTRON-RICO-v3-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por el usuario mradermacher a partir del modelo darkc0de/XORTRON-RICO-v3. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a GGUF en varias precisiones (de Q2_K a Q8_0) para facilitar su ejecución en llama.cpp y herramientas derivadas. El modelo base, según sus etiquetas, es un merge construido con mergekit y sometido a técnicas de abliteration ("abliterated", "heretic"), orientado explícitamente a generar contenido sin los filtros de rechazo habituales.

El modelo cuenta con 27.320.697.856 parámetros (unos 27,32 mil millones) y está etiquetado únicamente para inglés (en). El repositorio ocupa 136,9 GB e incluye, además de las cuantizaciones de texto, dos ficheros de proyector multimodal (mmproj-Q8_0 y mmproj-f16), lo que sugiere que el proyecto base incorpora algún tipo de codificador multimodal, aunque la model card no especifica de qué modalidad se trata.

Su relevancia es acotada y muy específica: no hay resultados de benchmarks, ni licencia declarada, ni documentación de la receta del merge, y las etiquetas lo clasifican como "experimental" y "not-for-all-audiences". Resulta útil, por tanto, como objeto de estudio para investigación en alineación, red-teaming y análisis comparativo de cuantizaciones, más que como modelo de producción. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada; el recuento de parámetros es compatible con un transformer denso de ~27B, sin confirmar) |
| Parametros totales | 27.320.697.856 (~27,32 B) |
| Parametros activos | no aplica; no se documenta arquitectura MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q6_K, Q8_0; proyectores mmproj-Q8_0 y mmproj-f16. Los metadatos mencionan además x-f16, Q4_K_M, Q5_K_S, Q5_K_M e IQ4_XS, que no figuran en la tabla de ficheros de la model card |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (este repositorio); no se incluyen pesos safetensors |
| Autor de la cuantizacion | mradermacher |
| Modelo base | darkc0de/XORTRON-RICO-v3 |
| Tamano del repositorio | 136,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-20 |
| Fecha de actualizacion (metadatos) | 2026-09-20 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni sobre el proceso de entrenamiento. La model card de este repositorio es una plantilla automática de cuantización (revision 1) que se limita a indicar que los quants son estáticos y a enlazar al modelo original; no incluye detalles de capas, mecanismos de atención, número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO. Tampoco se documenta si el modelo base partió de un transformer preentrenado ajeno o si se ensambló íntegramente mediante merge.

Lo que sí puede deducirse de las etiquetas es el método de construcción: "merge" y "mergekit" indican que el modelo base se obtuvo combinando los pesos de dos o más modelos mediante la herramienta mergekit; "abliterated" y "heretic" apuntan a la aplicación de abliteration, es decir, la ablación direccional de las direcciones de activación asociadas al rechazo de peticiones, con el objetivo de eliminar el comportamiento de negativa sin reentrenar; "unsloth" sugiere que en alguna fase de la ascendencia del modelo se empleó ese framework de ajuste eficiente. La presencia de ficheros mmproj en el repositorio implica que el proyecto base integra un proyector multimodal que llama.cpp puede cargar, aunque no se especifica la modalidad ni el codificador visual asociado.

## Capacidades

- Generación de texto conversacional en inglés: el pipeline declarado en las etiquetas es text-generation-inference y la etiqueta "conversational" indica uso orientado a diálogo.
- Generación de contenido sin filtros de rechazo: las etiquetas "uncensored", "abliterated" y "heretic" describen un modelo deliberadamente modificado para no negarse a peticiones que otros modelos rechazarían.
- Procesamiento multimodal: la existencia de ficheros mmproj-Q8_0 y mmproj-f16 implica soporte de un proyector multimodal en llama.cpp; la model card no detalla qué entradas acepta.
- Ejecución local en CPU/GPU mediante llama.cpp y derivados, al distribuirse exclusivamente en GGUF.
- Capacidades de razonamiento, código, matemáticas o tool calling: no documentadas en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el único idioma declarado es inglés.
- Modo "thinking" o razonamiento explícito: no documentado.

## Casos de uso

- Investigación en alineación y mecanismos de rechazo: el modelo permite estudiar empíricamente el efecto de la abliteration comparando sus respuestas con las del modelo pre-merge, útil para trabajos sobre direcciones de activación y refusal behavior.
- Red-teaming y evaluación de seguridad: sirve como generador de entradas adversarias controladas en bancos de pruebas internos, ya que su sesgo hacia contenido sin filtro permite explorar casos límite que un modelo alineado rechazaría.
- Generación de datos sintéticos para clasificadores de seguridad: sus salidas pueden etiquetarse y usarse para entrenar o evaluar clasificadores de toxicidad y moderación, siempre en un entorno aislado.
- Análisis comparativo de cuantizaciones GGUF: al publicarse en siete precisiones distintas (Q2_K a Q8_0, de 11,0 a 29,1 GB), permite medir la degradación de perplejidad y coherencia entre niveles de cuantización con un mismo conjunto de prompts.
- Escritura creativa y ficción sin restricciones editoriales: para autores que necesitan generar narrativa con temáticas que los modelos alineados suelen declinar, en un contexto de uso privado y responsable.
- Prototipado local sin conexión: desplegado con llama.cpp u Ollama en una estación de trabajo, permite experimentar con un modelo de ~27B sin depender de APIs externas ni enviar datos a terceros.
- Personajes y simulación de rol de nicho: su comportamiento conversacional y su falta de filtros lo hacen adecuado para entornos de roleplay donde se requiere adherencia a personajes con registros duros.
- Docencia sobre cuantización de modelos: el repositorio ilustra de forma práctica el intercambio entre tamaño de fichero y calidad (Q3_K_M marcado como "lower quality", Q4_K_S como "fast, recommended", Q6_K como "very good quality").

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni métricas equivalentes, y tampoco se han encontrado datos de este tipo en la búsqueda web realizada (cuyos resultados no guardan relación con el modelo). No se aportan cifras estimadas para no introducir datos no verificables.

## Requisitos de hardware

Los tamaños siguientes son los que figuran en la model card y sirven como base para la estimación de VRAM; hay que sumar el caché KV, cuyo tamaño depende de una longitud de contexto que no está documentada, más entre 1 y 2 GB de sobrecarga del runtime.

- Q2_K (11,0 GB): cabe en GPUs de 12 GB (RTX 3060 12 GB) con contexto corto; en 16 GB funciona con margen.
- Q3_K_S (12,4 GB) y Q3_K_M (13,6 GB): aptos para GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super).
- Q3_K_L (14,7 GB) y Q4_K_S (15,9 GB, marcado como "fast, recommended"): encajan en 16 GB de forma ajustada y en 24 GB (RTX 3090, RTX 4090) con holgura.
- Q6_K (22,5 GB, marcado como "very good quality"): requiere 24 GB, con contexto limitado; en 16 GB obliga a descarga parcial a CPU.
- Q8_0 (29,1 GB, marcado como "fast, best quality"): necesita 32 GB o más; en la práctica, dos GPUs de 24 GB, A100 40 GB o H100 80 GB. También es viable con descarga parcial a memoria del sistema.
- Proyector multimodal: mmproj-Q8_0 ocupa 0,7 GB y mmproj-f16 1,0 GB, que se suman a los requisitos anteriores si se utiliza la parte multimodal.
- Inferencia en CPU: todas las cuantizaciones pueden ejecutarse íntegramente en RAM con llama.cpp; Q2_K y Q3_K_S son las opciones realistas para equipos con 16-32 GB de RAM.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, koboldcpp, text-generation-webui y servidores compatibles con llama.cpp). La etiqueta text-generation-inference figura en los metadatos, pero el formato GGUF no es el nativo de TGI y no se documenta compatibilidad con vLLM.
- Latencia y throughput: no disponibles; dependen de la cuantización, del hardware y de la longitud de contexto, ninguno de los cuales está documentado.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica los componentes del merge, no publica resultados de benchmarks y no declara licencia, por lo que cualquier comparación cuantitativa con modelos de ~27B de la misma categoría (por ejemplo, modelos densos abiertos de tamaño comparable con variantes GGUF) carecería de base verificable. La model card tampoco indica qué pesos se fusionaron ni con qué proporciones, lo que impide saber si existen alternativas directamente equiparables.

Como referencia interna sí puede compararse el propio modelo consigo mismo en distintas precisiones:

| Cuantizacion | Tamano (GB) | Nota de la model card | Perfil de uso |
|---|---|---|---|
| Q2_K | 11,0 | sin nota | Máxima compresión; GPUs de 12 GB |
| Q3_K_S | 12,4 | sin nota | Compresión alta; GPUs de 12-16 GB |
| Q3_K_M | 13,6 | lower quality | Evitar salvo restricción severa de memoria |
| Q3_K_L | 14,7 | sin nota | Compresión alta con mejor calidad |
| Q4_K_S | 15,9 | fast, recommended | Punto de equilibrio recomendado |
| Q6_K | 22,5 | very good quality | Calidad alta; GPUs de 24 GB |
| Q8_0 | 29,1 | fast, best quality | Prácticamente sin pérdida; 32 GB o más |
| mmproj-Q8_0 | 0,7 | multi-modal supplement | Complemento multimodal |
| mmproj-f16 | 1,0 | multi-modal supplement | Complemento multimodal en alta precisión |

## Limitaciones y advertencias

- Contenido dañino por diseño: las etiquetas "uncensored", "harmful", "toxic", "abliterated" y "not-for-all-audiences" indican que el modelo ha sido modificado para eliminar sus mecanismos de rechazo. No debe desplegarse en aplicaciones orientadas al público sin una capa de moderación externa.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial. Cualquier uso en producción exige aclarar antes los términos del modelo base con su autor.
- Ausencia total de benchmarks: no hay ninguna métrica publicada, por lo que no es posible estimar su calidad real frente a alternativas.
- Riesgo elevado de alucinación: no se documentan datos de entrenamiento, ajuste ni evaluación, y la abliteration suele degradar la coherencia y la fiabilidad factual.
- Idiomas: únicamente inglés declarado; el rendimiento en castellano u otros idiomas es desconocido.
- Longitud de contexto desconocida: impide planificar despliegues con conversaciones largas o documentos extensos, y complica el cálculo del caché KV.
- Sesgos: no hay ninguna evaluación de sesgos publicada; un modelo entrenado con datos no filtrados y sin alineación posterior tiende a reproducir estereotipos y sesgos de su corpus.
- Metadatos inconsistentes: la model card lista tipos de cuantización (x-f16, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS) que no aparecen entre los ficheros efectivamente publicados, y las fechas de creación y actualización figuran en septiembre de 2026, lo que conviene verificar.
- Sin quants ponderados ni imatrix: el propio autor indica que no hay cuantizaciones con matriz de importancia disponibles, y que probablemente no las habrá; las IQ mencionadas en los metadatos no están publicadas, de modo que la calidad a igual tamaño puede ser inferior a la de otras distribuciones.
- Estado experimental: con 0 descargas y 0 likes, el repositorio no ha sido validado por la comunidad; no existe evidencia de terceros sobre su comportamiento en producción.
- Trazabilidad limitada: al ser un merge sin receta publicada, no es posible auditar qué modelos contribuyeron a los pesos ni con qué licencias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/XORTRON-RICO-v3-GGUF
- Modelo base: https://huggingface.co/darkc0de/XORTRON-RICO-v3
- Página de descargas del cuantizador: https://hf.tst.eu/model#XORTRON-RICO-v3-GGUF
- Peticiones de modelos al autor: https://huggingface.co/mradermacher/model_requests
- Grafo comparativo de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa responsable de la infraestructura de cuantización: https://www.nethype.de/
