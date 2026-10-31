# mradermacher/Nemotron-3-Embed-1B-BF16-i1-GGUF

## Resumen

Nemotron-3-Embed-1B-BF16-i1-GGUF es una versión cuantizada, en formato GGUF, del modelo de embeddings de texto Nemotron-3-Embed-1B-BF16 desarrollado por NVIDIA. La cuantización ha sido realizada por mradermacher, un colaborador conocido en Hugging Face por producir versiones GGUF optimizadas con imatrix (matriz de importancia) de modelos populares, y ofrece más de veinte variantes de cuantización que van desde IQ1_S (0,5 GB) hasta Q6_K (1,0 GB).

El modelo base es un modelo de embeddings de 1.140.918.272 parámetros (unos 1,14B) diseñado para tareas de recuperación de información, búsqueda semántica y RAG (generación aumentada por recuperación). Su relevancia actual radica en la creciente demanda de modelos de embeddings ligeros y multilingües que puedan ejecutarse localmente o en hardware modesto, integrándose en pipelines de RAG sin depender de APIs externas.

Gracias al formato GGUF y a la amplia gama de cuantizaciones disponibles, este repositorio permite desplegar el modelo en CPUs, GPUs de consumo y dispositivos con recursos limitados, manteniendo un equilibrio configurable entre tamaño, velocidad y calidad de los embeddings generados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer encoder de embeddings, arquitectura detallada no publicada en la información proporcionada) |
| Parámetros totales | 1.140.918.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | imatrix, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | multilingüe: en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi |
| Licencia | openmdw-1.1 (other) |
| Formato de pesos | GGUF (cuantizado a partir de safetensors BF16) |

## Arquitectura y entrenamiento

El modelo base, nvidia/Nemotron-3-Embed-1B-BF16, es un modelo de embeddings de la familia Nemotron de NVIDIA, distribuido originalmente en precisión BF16 con la librería transformers. Se trata de un modelo de tipo feature-extraction (extracción de características), es decir, no genera texto sino vectores densos que representan el significado semántico de fragmentos de texto. Estos vectores pueden compararse mediante similitud coseno o producto escalar para tareas de recuperación y búsqueda.

Los detalles sobre los datos de entrenamiento, el número de tokens, la composición del corpus o el uso de técnicas de alineación no están disponibles en la información proporcionada. Tampoco se especifica la arquitectura interna concreta del encoder.

La contribución de mradermacher consiste en la cuantización mediante la técnica imatrix (importance matrix), que calcula una matriz de importancia a partir de datos de calibración para minimizar la pérdida de calidad en cuantizaciones agresivas. Las variantes IQ (basadas en el trabajo de ikawrakow) suelen ofrecer mejor calidad que las cuantizaciones K estáticas de tamaño equivalente. Además, existen cuantizaciones estáticas en un repositorio hermano (mradermacher/Nemotron-3-Embed-1B-BF16-GGUF).

## Capacidades

- Generación de embeddings de texto (feature extraction) para representar documentos, párrafos y consultas como vectores densos.
- Recuperación de información (retrieval): indexación de corpus y búsqueda de pasajes relevantes dada una consulta.
- Búsqueda semántica: emparejamiento por significado, no solo por coincidencia léxica de palabras clave.
- Soporte de pipelines RAG: puede actuar como componente de embedding en sistemas de generación aumentada por recuperación.
- Capacidades multilingües: soporte oficial para más de 30 idiomas, incluido el castellano, lo que permite búsquedas entre idiomas (cross-lingual retrieval) si el modelo base fue entrenado para ello.
- Etiquetado con soporte vllm: compatible con despliegue mediante vLLM según los tags del repositorio.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en documentación interna: se indexan los documentos de una empresa (wikis, manuales, contratos) y las consultas de los empleados se comparan contra los embeddings para recuperar los pasajes más relevantes, incluso cuando la redacción difiere de la de los documentos.
- Pipelines RAG con LLMs locales: como componente de embedding en una arquitectura RAG que combine este modelo con un LLM generativo local (por ejemplo, vía llama.cpp u Ollama), permitiendo respuestas fundamentadas sobre documentos privados sin enviar datos a servicios externos.
- Deduplicación y agrupación de textos: cálculo de similitudes entre miles de artículos, tickets o noticias para agrupar contenido duplicado o temáticamente relacionado mediante clustering sobre los vectores.
- Clasificación de tickets de soporte: los embeddings de las consultas de clientes pueden alimentar un clasificador ligero (regresión logística, k-NN) para enrutar tickets por categoría e idioma automáticamente.
- Detección de near-duplicates en corpus de entrenamiento: filtrado de datos antes de entrenar o ajustar LLMs, eliminando documentos casi idénticos comparando similitudes de embeddings.
- Búsqueda multilingüe en catálogos o bases de conocimiento: gracias al soporte de más de 30 idiomas, un usuario puede consultar en castellano y recuperar documentos escritos en inglés, francés o alemán.
- Sistemas de recomendación de contenido: representación de artículos, productos o publicaciones como vectores para recomendar contenido similar al que el usuario está viendo.
- Despliegue en edge y dispositivos con recursos limitados: con cuantizaciones de 0,5-0,8 GB (IQ1_S a Q4_K_M), el modelo cabe en portátiles, mini-PCs o GPUs de consumo para aplicaciones que requieren embeddings locales y de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se incluyen métricas de calidad (MTEB, NDCG, etc.) para el modelo base ni comparativas entre niveles de cuantización para esta ficha; el único material de referencia es una gráfica de perplejidad para cuantizaciones de baja calidad proporcionada por ikawrakow, de carácter genérico.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: depende de la cuantización elegida, desde aproximadamente 0,5 GB (IQ1_S/IQ1_M) hasta 1,0 GB (Q6_K) solo de pesos; se recomienda añadir margen para la caché de contexto y overhead del runtime (del orden de 1-2 GB en total para la mayoría de los casos).
- GPU recomendadas: al ser un modelo de ~1,14B parámetros, cualquier GPU moderna es suficiente; opciones como una RTX 3060 de 12 GB, RTX 4060 Ti o superiores ejecutan las cuantizaciones más altas sin problema. También puede ejecutarse íntegramente en CPU.
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU de consumo con 4 GB de VRAM o más, incluso en las cuantizaciones de mayor calidad (Q6_K, ~1,0 GB).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, vLLM (indicado en los tags del repositorio) y cualquier runtime compatible con GGUF para embeddings.
- Latencia y throughput: no disponible; al ser un modelo de ~1,1B parámetros cuantizado, la inferencia de embeddings es rápida incluso en CPU, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3-Embed-1B-BF16-i1-GGUF (esta ficha) | 1,14B (cuantizado) | GGUF (imatrix, IQ1_S-Q6_K) | +30 (multilingüe) | openmdw-1.1 | Cuantización de mradermacher del modelo de NVIDIA |
| nvidia/Nemotron-3-Embed-1B-BF16 (base) | 1,14B | safetensors (BF16) | +30 (multilingüe) | openmdw-1.1 | Pesos originales sin cuantizar |
| mradermacher/Nemotron-3-Embed-1B-BF16-GGUF | 1,14B (cuantizado) | GGUF (estático) | +30 (multilingüe) | openmdw-1.1 | Variante con cuantizaciones estáticas del mismo modelo |

No se incluyen comparativas con otros modelos de embeddings de terceros (por ejemplo, bge, e5 o gte) porque no se dispone de datos de rendimiento publicados que permitan una comparación rigurosa sin inventar cifras.

## Limitaciones y advertencias

- No es un modelo generativo: produce embeddings, no texto; no debe usarse para chat, razonamiento ni generación de código.
- Riesgo de degradación por cuantización: las variantes IQ1_S, IQ1_M, IQ2_XXS y Q2_K_S tienen calidad notablemente reducida según el propio autor del repositorio ("for the desperate", "very low quality"); para producción se recomiendan Q4_K_S, Q4_K_M o superiores.
- La calidad de los embeddings en cuantizaciones bajas puede afectar directamente a la precisión de recuperación en sistemas RAG; conviene validar con un conjunto de evaluación propio antes de elegir la cuantización.
- Longitud de contexto, dimensión de los embeddings y detalles del preprocesamiento (prefijos de consulta/pasaje, normalización) no están disponibles en la información proporcionada; debe consultarse la model card del modelo base de NVIDIA.
- Licencia openmdw-1.1 (tipo "other"): es una licencia abierta específica para modelos de IA, pero deben revisarse sus términos concretos en https://openmdw.ai/license/1-1/ antes de uso comercial.
- Sesgos: al tratarse de un modelo entrenado por NVIDIA sobre corpus multilingües, puede presentar sesgos presentes en los datos de entrenamiento; no se documentan sesgos específicos en la información disponible.
- El repositorio de cuantización es de un tercero (mradermacher), no de NVIDIA: cualquier problema de conversión debe reportarse al autor de la cuantización, no al del modelo base.

## Enlaces

- Repositorio de la cuantización (esta ficha): https://huggingface.co/mradermacher/Nemotron-3-Embed-1B-BF16-i1-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Nemotron-3-Embed-1B-BF16-GGUF
- Página de descargas con vista general de mradermacher: https://hf.tst.eu/model#Nemotron-3-Embed-1B-BF16-i1-GGUF
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
