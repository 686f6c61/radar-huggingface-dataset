# jaimevera1107/multilingual-e5-large-ocupaciones-es

## Resumen

`multilingual-e5-large-ocupaciones-es` es un modelo de embeddings de frases obtenido por fine-tuning de `intfloat/multilingual-e5-large` sobre un corpus de similitud entre ocupaciones, denominaciones de empleo y sectores economicos en espanol, construido a partir de las clasificaciones colombianas CNO (versiones 2007-2025), CUOC y CIIU, sus correspondencias oficiales y su estructura jerarquica (area de desempeno, nivel de cualificacion y jerarquia). Lo desarrolla Jaime Andres Vera Jaramillo y se publica con licencia MIT.

El problema que resuelve es concreto: mapear titulos de ofertas de empleo en texto libre a codigos ocupacionales normalizados, comparar ocupaciones entre clasificaciones y agrupar vacantes por ocupacion o sector. Para ello el autor ha entrenado el modelo con 199.249 pares graduados y 19.294 tripletas, reservando ademas unos 15.000 pares de similitud general en espanol para no degradar el comportamiento generico del modelo base.

Arquitectura XLM-RoBERTa (encoder transformer) con 559.890.432 parametros, ventana de entrenamiento de 128 tokens y salida de embeddings normalizables. Es relevante porque la mayoria de modelos de embeddings multilingues genericos confunden titulos ocupacionales lexicamente parecidos pero funcionalmente distintos, y este ajuste mejora de forma sustancial la recuperacion en ese dominio segun la evaluacion publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), modelo base `intfloat/multilingual-e5-large` |
| Parametros totales | 559.890.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con `max_length` de 128 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con text-embeddings-inference) |
| Idiomas soportados | es (declarado); el modelo base es multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `sentence-transformers`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer XLM-RoBERTa heredado de `intfloat/multilingual-e5-large`, adaptado como modelo de similitud de frases mediante `sentence-transformers`. La tarea es simetrica (query-query), por lo que el prefijo `query: ` debe aplicarse en ambos lados de la comparacion, a diferencia del uso asimetrico query/passage habitual en la familia E5.

El entrenamiento usa el dataset `jaimevera1107/similitud-ocupaciones-sectores-es`, con 199.249 pares graduados y 19.294 tripletas. Las etiquetas siguen una escala fija: correspondencias oficiales entre clasificaciones cercanas a 1, misma agrupacion ocupacional alta, misma area de desempeno y nivel intermedio, areas distintas a 0, y "trampas lexicas" (titulos que se leen igual pero pertenecen a areas diferentes) cerca de 0. Se anaden aproximadamente 15.000 pares de similitud general en espanol para preservar capacidad generica. La funcion de perdida combina CoSENT (pares graduados) y MultipleNegativesRankingLoss (tripletas con negativos duros). Hiperparametros: 1 epoca, batch 64, learning rate 2e-05, longitud maxima 128.

## Capacidades

- Generacion de embeddings de frases para similitud semantica en espanol, con normalizacion L2 opcional.
- Distincion fina entre ocupaciones, denominaciones de empleo y sectores economicos, incluyendo trampas lexicas.
- Mapeo de titulos de ofertas de empleo en texto libre a ocupaciones CNO.
- Comparacion y alineamiento entre clasificaciones (CNO, CUOC, CIIU) mediante sus correspondencias oficiales.
- Agrupacion y clustering de vacantes por ocupacion o sector.
- Recuperacion de denominaciones ocupacionales dentro de un catalogo (evaluado sobre 11.000 denominaciones CNO y sobre 612 ocupaciones en el conjunto held-out).
- Conservacion de capacidad generica de similitud en espanol gracias a los pares generales incluidos en el entrenamiento.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento: es exclusivamente un modelo de embeddings.

## Casos de uso

- Normalizacion de ofertas de empleo: dado el titulo de una vacante en texto libre, generar su embedding con prefijo `query: ` y recuperar la ocupacion CNO mas cercana del catalogo completo. El modelo alcanza acc@1 de 0.641 en titulos reales de vacantes colombianas, frente a 0.543 del base.
- Deduplicacion y agrupacion de vacantes: calcular embeddings de titulos y aplicar clustering para consolidar variantes de una misma ocupacion en portales de empleo o bases de datos de intermediacion laboral.
- Analisis de mercado laboral: agregar ofertas por ocupacion y sector (CIIU) para construir series de demanda por area de desempeno y nivel de cualificacion.
- Enriquecimiento de bases de datos de talento: asignar codigos ocupacionales a registros historicos de candidatos o empleados a partir de descripciones de puesto no estructuradas.
- Interoperabilidad entre clasificaciones: comparar ocupaciones entre CNO, CUOC y CIIU usando las correspondencias oficiales como referencia de similitud, util en proyectos de migracion de catalogos.
- Busqueda semantica en catalogos ocupacionales: permitir que un usuario escriba una denominacion coloquial y recuperar las denominaciones oficiales mas proximas, con umbrales calibrados sobre la escala del propio modelo.
- Sistemas de recomendacion empleo-candidato: representar tanto perfiles como vacantes en el mismo espacio y puntuar afinidad ocupacional.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (conjuntos no vistos en entrenamiento):

| Modelo | acc@1 titulos de vacantes | acc@1 denominaciones held-out | MRR | Spearman (pares ocupacionales) | Spearman (general) |
|---|---|---|---|---|---|
| base e5 (prefijo `e5`) | 0.543 | 0.402 | 0.518 | 0.578 | 0.749 |
| base e5 (prefijo `query`) | 0.538 | 0.327 | 0.416 | 0.578 | 0.749 |
| afinado (prefijo `query`) | 0.641 | 0.714 | 0.813 | 0.907 | 0.840 |

Detalle de los conjuntos de evaluacion: 184 titulos reales de vacantes colombianas etiquetados manualmente contra el catalogo CNO completo (11.000 denominaciones); 5% de denominaciones CNO eliminadas del entrenamiento y recuperadas entre 612 ocupaciones; y pares graduados held-out para el calculo de Spearman. El afinado mejora tambien la similitud general (0.840 frente a 0.749 del base).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos; en fp16 alrededor de 1,1 GB. Con overhead de activaciones y tokenizador, un entorno de 4 GB es suficiente para lotes pequenos.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, entre otras, con margen amplio.
- GPU recomendadas para produccion con alto throughput: A10G, L4, A100 o H100, aprovechando `text-embeddings-inference` (el modelo declara compatibilidad con endpoints de inferencia de texto).
- Opciones de despliegue: `sentence-transformers` en Python, `text-embeddings-inference` (imagen oficial), y servidores de embeddings compatibles con el formato safetensors. No se ha publicado soporte GGUF ni cuantizaciones para llama.cpp/Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un encoder de 560M parametros con longitud maxima de 128 tokens, el coste por lote es bajo en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jaimevera1107/multilingual-e5-large-ocupaciones-es` | 559.890.432 | no disponible (entrenado a 128) | Ocupaciones y sectores, espanol (Colombia) | MIT | Hugging Face |
| `intfloat/multilingual-e5-large` | no disponible en la informacion | no disponible | Embeddings multilingues genericos | MIT | Hugging Face |
| `intfloat/multilingual-e5-base` | no disponible en la informacion | no disponible | Embeddings multilingues genericos, menor tamano | MIT | Hugging Face |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | no disponible en la informacion | no disponible | Similitud de parafrasis multilingue | Apache 2.0 | Hugging Face |

La comparacion cuantitativa disponible se limita al modelo base: el afinado supera a `intfloat/multilingual-e5-large` en acc@1 sobre titulos de vacantes (0.641 frente a 0.543), en denominaciones held-out (0.714 frente a 0.402) y en Spearman sobre pares ocupacionales (0.907 frente a 0.578), manteniendo e incluso mejorando la similitud general. No hay datos de comparacion con los otros modelos listados.

## Limitaciones y advertencias

- Titulos muy cortos o genericos ("Asesor", "Operario") siguen siendo ambiguos: el modelo ordena ocupaciones plausibles pero no puede determinar la intencion del empleador.
- Las puntuaciones de similitud solo son comparables dentro de este modelo; no deben trasladarse a otros modelos de embeddings ni a umbrales fijados con el base.
- El dominio de entrenamiento esta centrado en clasificaciones colombianas (CNO, CUOC, CIIU); su transferencia a catalogos de otros paises no esta evaluada.
- Idioma declarado: espanol. El modelo base es multilingue, pero no se han publicado evaluaciones fuera del espanol.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto), pero si existe riesgo de asignaciones ocupacionales incorrectas en casos limite; conviene validar con umbrales y revision humana en produccion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia.
- Longitud de contexto de inferencia no documentada; el entrenamiento uso 128 tokens, por lo que textos mas largos deben truncarse o dividirse.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaimevera1107/multilingual-e5-large-ocupaciones-es
- Dataset de entrenamiento: https://huggingface.co/datasets/jaimevera1107/similitud-ocupaciones-sectores-es
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
- Libreria sentence-transformers: https://www.sbert.net/
- text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
