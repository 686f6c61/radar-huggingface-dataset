# dititce/bge-m3-legis

## Resumen

dititce/bge-m3-legis es un ajuste fino mediante LoRA del modelo de embeddings multilingüe BAAI/bge-m3, publicado por el usuario dititce y orientado, según su model card, a "tareas relacionadas con legislación". El repositorio ocupa 0,1 GB y contiene pesos en safetensors y formato PyTorch; su carga requiere la librería PEFT, ya que se distribuye como adaptador. No declara pipeline, licencia ni hiperparámetros del ajuste, y acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

Al tratarse de un derivado de BAAI/bge-m3, hereda la arquitectura del modelo base, un encoder transformer bidireccional (derivado de XLM-RoBERTa-large) diseñado para recuperación de información y no para generación de texto. La model card incluye un fragmento de código con `AutoModelForCausalLM` que no corresponde a un modelo de embeddings; esto indica que la documentación no está revisada y que la integración debe validarse antes de usarla en producción.

Su relevancia es limitada pero concreta: cubre un nicho poco atendido, la recuperación semántica sobre normativa en portugués, donde los embeddings genéricos suelen fallar con terminología jurídica y referencias cruzadas entre normas. Al no existir benchmarks, métricas de recuperación ni descripción del dataset de ajuste, cualquier adopción debería ir precedida de una evaluación propia contra el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (modelo base BAAI/bge-m3, derivado de XLM-RoBERTa-large). Configuración del adaptador LoRA (rango, alpha, módulos objetivo): no disponible |
| Parámetros totales | no disponible para el ajuste; el modelo base BAAI/bge-m3 declara ~568 M de parámetros |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha del ajuste; el modelo base admite hasta 8192 tokens |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors y pt, sin versiones GGUF, ONNX ni cuantizadas |
| Idiomas soportados | pt (portugués), único idioma declarado en la model card; el modelo base es multilingüe |
| Licencia | no disponible (el repositorio del modelo base BAAI/bge-m3 declara licencia MIT; conviene verificarlo en origen) |
| Formato de pesos | safetensors y PyTorch (pt), distribuidos como adaptador LoRA que requiere PEFT |
| Modelo base | BAAI/bge-m3 |
| Dimensión de embedding | no disponible en la ficha del ajuste; el modelo base produce vectores de 1024 dimensiones |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación / actualización | 2026-09-22 (metadato anómalo, ver limitaciones) |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-m3, un encoder transformer bidireccional derivado de XLM-RoBERTa-large que genera representaciones densas, dispersas (pesos léxicos) y multi-vector (estilo ColBERT) de forma conjunta en una sola pasada, con capacidad de procesar secuencias de hasta 8192 tokens. El ajuste publicado aquí se realizó con LoRA (Low-Rank Adaptation), técnica que congela los pesos originales y entrena matrices de bajo rango, lo que explica el tamaño reducido del repositorio (0,1 GB) y la necesidad de instalar PEFT para cargarlo.

No hay información sobre el número de tokens de entrenamiento, la composición del corpus legislativo, el idioma exacto de los datos (la model card declara únicamente portugués), la configuración de LoRA, la función de pérdida ni si se aplicaron etapas de destilación, minería de negativos duros o ajuste con pares positivos. Tampoco se documenta si el adaptador modifica la cabeza de pooling, si se entrenó para las tres modalidades de recuperación del modelo base o si se fusionó con los pesos originales. Cualquier afirmación sobre su comportamiento fuera del dominio legislativo en portugués carece de respaldo documental.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación densa, heredada del modelo base; no genera texto, pese al fragmento de código de la model card.
- Recuperación en portugués sobre textos normativos y jurídicos, que es el dominio declarado del ajuste.
- Posible uso de las modalidades dispersa y multi-vector del modelo base (pesos léxicos y late interaction), siempre que el adaptador no haya alterado esas cabezas; no está documentado.
- Procesamiento de documentos largos, hasta 8192 tokens en el modelo base, útil para articulados, contratos o sentencias completas.
- Multilingüismo potencial por herencia del modelo base, aunque la ficha solo declara portugués y el ajuste puede haber degradado otros idiomas.
- Tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión y audio: no disponibles; no son capacidades de un modelo de embeddings.
- Modo "thinking", audio o visión: no disponibles.

## Casos de uso

- Búsqueda semántica sobre legislación portuguesa: indexar el Diário da República, códigos y reglamentos en una base vectorial y recuperar artículos relevantes ante consultas en lenguaje natural, aprovechando la ventana de 8192 tokens del modelo base para indexar artículos completos sin truncar.
- RAG jurídico con citación de fuentes: usar el modelo como recuperador en un pipeline que alimente a un LLM generador, de modo que las respuestas incluyan referencias normativas verificables; el ajuste en dominio legislativo busca mejorar la precisión de esas recuperaciones frente a un embedding genérico.
- Enrutado de consultas ciudadanas: clasificar consultas entrantes en un portal de administración pública y dirigirlas a la unidad o normativa competente mediante similitud entre la consulta y un catálogo de materias descrito en lenguaje natural.
- Deduplicación y agrupación de documentos legales: calcular similitud coseno entre embeddings para detectar normas repetidas, versiones consolidadas o cláusulas equivalentes en corpus de contratos y expedientes.
- Búsqueda híbrida en portales de transparencia: combinar recuperación densa con coincidencia léxica exacta, útil cuando las consultas contienen números de artículo, identificadores o referencias normativas literales que un embedding puro puede diluir.
- Construcción de conjuntos de evaluación legal: generar candidatos de recuperación y pares consulta-documento sobre corpus legislativo en portugués para medir recall@k de otros sistemas.
- Filtrado de cláusulas en compliance: comparar cláusulas contractuales contra una biblioteca de cláusulas consideradas de riesgo mediante similitud semántica, siempre con revisión humana posterior.
- No recomendado como generador de texto, resumidor ni sistema de respuesta directa: el ajuste es un modelo de representación, no un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de recuperación (recall@k, nDCG, MRR), comparativas con el modelo base ni evaluaciones sobre conjuntos legislativos en portugués. Tampoco hay informes de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los ~568 M de parámetros del modelo base: en fp32, en torno a 2,3 GB de pesos; en fp16 o bf16, en torno a 1,15 GB; en int8, alrededor de 0,6 GB. A estas cifras hay que sumar el pico de activaciones, que crece con el tamaño de lote y la longitud de secuencia y puede requerir varios GB adicionales con secuencias de 8192 tokens.
- El adaptador LoRA añade un coste despreciable en memoria, pero exige tener cargado el modelo base completo.
- GPU recomendadas: cualquier GPU con 8 GB o más para lotes pequeños (RTX 3060 12 GB, RTX 4070, RTX 4090); para indexación masiva con lotes grandes, A100 40/80 GB, H100 o L40S.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en una RTX 3060 de 12 GB y en cualquier GPU de gama media reciente; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: transformers con PEFT según la model card; sentence-transformers o FlagEmbedding fusionando previamente el adaptador; Text Embeddings Inference (TEI) para servir embeddings en producción, también previa fusión; ONNX Runtime u Optimum para CPU; vLLM en modo pooling para embeddings, aunque la compatibilidad con adaptadores LoRA en modelos de pooling no está verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Características |
|---|---|---|---|---|---|
| dititce/bge-m3-legis | adaptador LoRA sobre 568 M (base) | no disponible (base: 8192 tokens) | pt (declarado) | no disponible | Ajuste de nicho en legislación; sin benchmarks ni adopción (0 descargas) |
| BAAI/bge-m3 | 568 M | 8192 tokens | más de 100 idiomas | MIT | Recuperación densa, dispersa y multi-vector; ampliamente validado; es la referencia directa a batir |
| intfloat/multilingual-e5-large | 560 M | 512 tokens | más de 100 idiomas | MIT | Buen equilibrio tamaño/rendimiento, pero ventana corta que obliga a trocear documentos largos |
| jina-embeddings-v3 | 570 M | 8192 tokens | multilingüe | CC BY-NC 4.0 (no comercial) | Adaptadores de tarea y ventana larga, con restricción de uso comercial |

Los datos de los modelos comparativos proceden de su documentación pública en HuggingFace y deben verificarse en origen antes de tomar decisiones de arquitectura.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 likes, sin benchmarks, sin métricas de recuperación y sin conjunto de evaluación publicado.
- Licencia no declarada en el repositorio, lo que impide confirmar si el uso comercial está permitido. El modelo base se publica como MIT, pero la licencia del derivado debe comprobarse explícitamente con el autor antes de usarlo en producción.
- Documentación insuficiente: no se describen los datos de entrenamiento, los hiperparámetros de LoRA, la función de pérdida ni el procedimiento de evaluación, lo que hace imposible reproducir el ajuste.
- Fragmento de carga incorrecto: la model card emplea `AutoModelForCausalLM`, clase inadecuada para un modelo de embeddings; el código tal cual no funcionará como se espera y puede inducir a error.
- Riesgo de olvido catastrófico parcial: un ajuste de dominio sobre un encoder multilingüe puede degradar su comportamiento en otros idiomas y dominios, especialmente si el corpus era reducido y poco diverso.
- Sesgo de dominio y jurisdicción: si el corpus se limitó a normativa portuguesa de un periodo concreto, las representaciones favorecerán ese marco legal y esa terminología, penalizando textos de otras jurisdicciones o épocas.
- Riesgo de desactualización normativa: los embeddings reflejan el corpus con el que se entrenó; cambios legislativos posteriores no estarán representados.
- Riesgo de alucinación de fuentes derivado del uso en RAG: como cualquier recuperador, puede devolver documentos semánticamente cercanos pero jurídicamente inaplicables; la verificación de la norma citada debe ser externa al modelo.
- Metadatos anómalos: las fechas de creación y actualización (2026-09-22) son posteriores a la fecha esperada de publicación, lo que sugiere un error de configuración del repositorio.
- Solo se declara portugués: no hay evidencia de que el ajuste conserve capacidades útiles en castellano u otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dititce/bge-m3-legis
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Librería PEFT (requerida para cargar el adaptador LoRA): https://github.com/huggingface/peft
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo, su paper o su dataset; los resultados obtenidos correspondían a páginas corporativas sin relación con el tema.
