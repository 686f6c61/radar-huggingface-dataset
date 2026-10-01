# AdrienB134/gelato-mdenseon

## Resumen

GELATO mdenseon document retriever es un modelo de recuperación documental visual (visual document retrieval, VDR) publicado por el usuario de HuggingFace AdrienB134. Se trata de un checkpoint de inferencia completo que combina una torre de visión Qwen3.5 congelada, el backbone de texto congelado lightonai/mDenseOn y un proyector entrenado con delimitadores de imagen. El modelo proyecta consultas de texto y páginas de documento (imágenes) a un espacio común de vectores normalizados de 768 dimensiones, de modo que la similitud por producto escalar sirve directamente como puntuación de recuperación.

El checkpoint, identificado como 7.500, fue seleccionado por su mejor puntuación completada en el benchmark público ViDoRe v3: 43,01 de macro nDCG@10 agregado sobre ocho corpus y seis idiomas de consulta. El autor advierte explícitamente que ese benchmark se usó para la selección y no constituye un conjunto de test limpio. El entrenamiento se realizó sobre aproximadamente 273.000 pares positivos multilingües de VDR, con backbones congelados y entrenamiento contrastivo de tipo Matryoshka.

El modelo acumula 409.894.144 parámetros (unos 0,9 GB de repositorio) y se distribuye bajo licencia Apache-2.0, con soporte declarado para inglés, francés, alemán, español, italiano y portugués. Su relevancia actual reside en que permite búsqueda semántica directamente sobre páginas renderizadas, sin necesidad de OCR ni de extracción de estructura, un escenario crítico para documentos con tablas, gráficos y maquetación compleja.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder dual multimodal: torre de visión Qwen3.5 congelada + backbone de texto lightonai/mDenseOn congelado + proyector entrenado y delimitadores de imagen |
| Parametros totales | 409.894.144 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de embeddings; presupuesto de imagen de 262.144–1.310.720 píxeles, equivalente a 256–1.280 tokens visuales fusionados por página) |
| Tipos de cuantizacion | BF16 (receta evaluada); no se documentan pesos GGUF, INT8 ni FP8 |
| Idiomas soportados | en, fr, de, es, it, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 768, normalizada |
| Libreria | sentence-transformers (tambien compatible con Transformers >= 5.16.1) |
| Requisitos de entorno | Python 3.12, PyTorch, Pillow, safetensors, trust_remote_code=True |

## Arquitectura y entrenamiento

La arquitectura es un encoder dual asimétrico. La rama de texto reutiliza el backbone lightonai/mDenseOn congelado, con pooling de texto y prompts diferenciados para consulta y documento (encode_query y encode_document). La rama visual emplea la torre de visión del checkpoint Qwen3.5, también congelada, y conserva la totalidad de sus pesos; el modelo de lenguaje interno de ese checkpoint se omite por no ser necesario para la tarea. Sobre la salida de la torre de visión se aplica un proyector aprendido y delimitadores de imagen que enmarcan la secuencia visual antes de generar el embedding. Ambas ramas producen vectores de 768 dimensiones normalizados.

El entrenamiento se llevó a cabo sobre aproximadamente 273.000 pares positivos multilingües de recuperación documental visual, manteniendo congelados ambos backbones y entrenando únicamente el proyector y los elementos de framing. La función de pérdida es contrastiva con esquema Matryoshka (MRL), aunque la ficha solo documenta la salida completa de 768 dimensiones y no detalla qué dimensiones truncadas están soportadas oficialmente. No se menciona ningún uso de RLHF, DPO ni ajuste por preferencias, lo cual es coherente con un modelo de representaciones y no generativo. Los pesos de los backbones congelados se distribuyen en los valores BF16 empleados durante entrenamiento y evaluación, y los pines de los backbones quedan registrados en config.json.

## Capacidades

- Generación de embeddings de texto orientados a consulta de recuperación, con prompt específico de query.
- Generación de embeddings de documento a partir del backbone de texto, con prompt específico de documento.
- Codificación de páginas de documento en formato de imagen (PIL) a través de la ruta multimodal entrenada, preservando la relación de aspecto dentro del presupuesto de píxeles.
- Espacio de representación compartido texto-imagen: las puntuaciones se obtienen con un simple producto escalar entre consultas y páginas, sin necesidad de re-ranking adicional.
- Recuperación multilingüe en seis idiomas (inglés, francés, alemán, español, italiano y portugués), incluyendo consultas en un idioma contra corpus en otro.
- Procesamiento por lotes homogéneos: lotes de cadenas de texto o lotes de imágenes PIL.
- Inferencia offline una vez descargado el repositorio, con local_files_only=True y modo offline del Hub, sin dependencia del paquete GELATO ni del repositorio original del backbone.
- No soporta lotes mixtos de texto e imagen ni entrada de vídeo.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: es un modelo de extracción de características, no un modelo generativo.

## Casos de uso

- Búsqueda semántica sobre PDF escaneado sin OCR: cada página se renderiza como imagen, se indexa con encode() y las consultas de texto recuperan directamente la página relevante, evitando los errores de extracción de texto en documentos con maquetación compleja o tipografías no estándar.
- Recuperación de páginas en pipelines RAG documentales: el modelo actúa como recuperador de primer nivel sobre informes anuales, memorias o documentación técnica donde la información crítica está en tablas y gráficos que un extractor de texto perdería.
- Soporte técnico y atención al cliente: localizar la página exacta de un manual de producto o de una guía de instalación a partir de una descripción en lenguaje natural del problema, con el embedding de 768 dimensiones como unidad de indexación.
- Verificación de cumplimiento normativo: en contratos y pólizas multilingües, recuperar las páginas que contienen cláusulas concretas comparando una consulta en español contra un corpus en francés o alemán, gracias a la cobertura de los seis idiomas declarados.
- Análisis financiero documental: consultas del tipo "página con los ingresos anuales" sobre cuentas depositadas, donde el modelo puntúa la página correcta sin depender de que la tabla esté en formato estructurado.
- Archivística y bibliotecas digitales: indexación por similitud visual de fondos escaneados heterogéneos, permitiendo descubrimiento temático en colecciones donde no existe texto extraído fiable.
- Filtrado previo de alta recuperación (recall) en sistemas multimodales: usar el modelo como primera etapa para reducir un corpus de miles de páginas a un conjunto pequeño, que después se procese con un modelo generativo multimodal más costoso.
- Deduplicación y agrupamiento de documentos: al producir vectores normalizados de 768 dimensiones, permite agrupar por similitud coseno páginas con contenido equivalente en distintos idiomas o formatos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Detalles |
|---|---|---|---|
| ViDoRe v3 | macro nDCG@10 | 43,01 | Checkpoint 7.500; 8 corpus y 6 idiomas de consulta |

El autor indica de forma explícita que ViDoRe v3 se empleó para seleccionar el checkpoint y que, por tanto, no es un conjunto de test no contaminado. No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que además no aplicarían a un modelo de recuperación.

## Requisitos de hardware

- VRAM estimada: el checkpoint completo ocupa aproximadamente 0,82 GB en BF16 (409,9 millones de parámetros a 2 bytes). Sumando activaciones y buffers, la inferencia con lotes pequeños de páginas se sitúa en torno a 2–4 GB de VRAM; el consumo crece con el número de tokens visuales por página, que puede llegar a 1.280 por imagen.
- GPU recomendadas: cualquier GPU con soporte BF16. Para replicar la receta evaluada se recomienda CUDA con BF16, por ejemplo RTX 4090, L40S, A100 o H100. Las GPU de gama alta no aportan ventaja por tamaño de modelo, sino por el procesamiento de lotes grandes de páginas.
- Cabe en GPU de consumo: sí, con margen amplio. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 pueden ejecutar el modelo en BF16 con lotes moderados. La recomendación del autor es empezar con lotes de imagen pequeños e incrementarlos según la memoria disponible.
- Despliegue: sentence-transformers (>= 6.0.1) y Transformers (>= 5.16.1) son las dos interfaces documentadas, ambas con trust_remote_code=True. El repositorio incluye tokenizer y procesador de imagen, y está marcado con la etiqueta endpoints_compatible, lo que apunta a compatibilidad con HuggingFace Inference Endpoints. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni TEI.
- Latencia y throughput: no disponible en la informacion proporcionada. Dependerá del número de tokens visuales por página y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdrienB134/gelato-mdenseon | 409,9 M | 256–1.280 tokens visuales fusionados por imagen | 43,01 macro nDCG@10 en ViDoRe v3 (seleccion) | Apache-2.0 | HuggingFace |
| lightonai/mDenseOn (modelo base) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | HuggingFace |
| Alternativas de la categoria (jina-embeddings-v4, ColQwen2.5, GME-Qwen2-VL) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | HuggingFace |

No se dispone de datos verificables de parámetros, contexto, licencia o benchmarks de las alternativas dentro de la información proporcionada, por lo que la comparación cuantitativa queda limitada al propio modelo y a su backbone base. Cualquier comparación numérica adicional requeriría consultar las fichas oficiales de cada alternativa.

## Limitaciones y advertencias

- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Riesgo de sobreajuste al benchmark: el propio autor declara que ViDoRe v3 se utilizó para seleccionar el checkpoint 7.500 y que no es un conjunto de test intacto. La puntuación de 43,01 debe interpretarse como cota optimista.
- No reproducible: el repositorio incluye únicamente el checkpoint de inferencia, sin código de entrenamiento, datasets ni cachés. No es posible replicar el proceso ni auditar la composición de los 273.000 pares de entrenamiento.
- Código personalizado: requiere trust_remote_code=True tanto en sentence-transformers como en Transformers. El propio autor recomienda leer los ficheros de inferencia incluidos antes de permitir la ejecución de código personalizado.
- Alcance de entrada restringido: no admite lotes mixtos de texto e imagen ni vídeo, lo que obliga a separar los pipelines de indexación de texto y de imagen.
- Modelo no generativo: no produce texto, por lo que el riesgo de alucinación en el sentido generativo no aplica. El riesgo real es el de falsos positivos con puntuación alta en la recuperación, que debe mitigarse con umbrales o re-ranking.
- Sesgos: no se documenta ningún análisis de sesgos ni la distribución de dominios, idiomas o instituciones presente en los datos de entrenamiento. Al derivar de corpus tipo ViDoRe, es previsible un sesgo hacia documentos de layout occidental y hacia los dominios cubiertos por ese benchmark.
- Licencia: Apache-2.0 permite uso comercial, pero el repositorio incluye un fichero NOTICE con las licencias de las fuentes (torre de visión Qwen3.5 y backbone mDenseOn). Es obligatorio revisarlo antes de un despliegue comercial, ya que las condiciones de los backbones pueden imponer restricciones adicionales.
- Dependencias muy recientes: Python 3.12 y Transformers >= 5.16.1 pueden no estar disponibles en entornos corporativos con versiones congeladas, lo que complica la integración en stacks ya establecidos.
- Fecha de creación del repositorio: 1 de octubre de 2026, con última actualización dos minutos después del alta, lo que sugiere un artefacto recién publicado y sin mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdrienB134/gelato-mdenseon
- Modelo base: https://huggingface.co/lightonai/mDenseOn
- Perfil del autor: https://huggingface.co/AdrienB134
- Leaderboard de referencia del benchmark ViDoRe: https://huggingface.co/spaces/vidore/vidore-leaderboard
- Papers, blogs, repositorios de código y demos adicionales: no disponible en la informacion proporcionada.
