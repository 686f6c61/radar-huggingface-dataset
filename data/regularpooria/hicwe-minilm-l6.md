# regularpooria/HiCWE-MiniLM-L6

## Resumen
HiCWE-MiniLM-L6-v2 es un encoder de frases especializado en seguridad del software, desarrollado por el usuario regularpooria a partir del modelo `sentence-transformers/all-MiniLM-L6-v2`. Su funcion es mapear la descripcion de una CVE (Common Vulnerabilities and Exposures) al CWE (Common Weakness Enumeration) mas probable dentro de la vista CWE-699 *Software Development*, proyectando ambos tipos de texto en un espacio de embeddings compartido de 384 dimensiones.

El modelo no genera texto: produce representaciones vectoriales que permiten hacer recuperacion asimetrica CVE-a-CWE mediante similitud coseno. Se ha ajustado con un objetivo contrastivo jerarquico (receta "hierarchy-full") que acerca cada CVE tanto a su categoria padre como a sus CWE hijos, lo que habilita una busqueda en dos etapas (primero categoria, despues descendientes).

Con 22.713.216 parametros y 512 tokens de longitud maxima, es la variante ligera de la familia HiCWE; la version `HiCWE-MiniLM-L12-v2` es la mayor. Ambas producen embeddings de 384 dimensiones y son intercambiables sin cambiar el codigo de integracion. Su interes actual radica en que iguala o supera a un clasificador SOTA en la tarea de prediccion de CWE hijo (flat) con una fraccion del tamano y con licencia Apache 2.0.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder de frases basado en `all-MiniLM-L6-v2`) |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 384 |
| Pooling | mean pooling + normalizacion L2 (similitud coseno) |
| Metodo de ajuste | LoRA (rango 64, alpha 128, dropout 0) sobre proyecciones `query`, `key`, `value` y `dense`, fusionado en los pesos base |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | sentence-similarity |

## Arquitectura y entrenamiento
La base es `all-MiniLM-L6-v2`, un encoder transformer de 6 capas y 22,7 millones de parametros que produce embeddings de 384 dimensiones con mean pooling y normalizacion L2. El ajuste se hizo con LoRA de rango 64 y alpha 128 sobre las proyecciones de atencion (`query`, `key`, `value`) y la proyeccion `dense`, con dropout 0; los adaptadores se fusionaron posteriormente en los pesos base, de modo que la inferencia es un unico forward pass de un SentenceTransformer estandar, sin sobrecoste de adaptadores.

El entrenamiento usa `MultipleNegativesRankingLoss` con la receta "hierarchy-full", compuesta por tres tareas: `cve_to_cwe` (CVE a su propio CWE, con un CWE hermano y un CWE de aspecto similar de otra categoria como negativos duros), `cve_to_category` (CVE a su categoria padre, con la categoria mas cercana como negativo duro) y `cwe_geometry` (CWE a un hermano, acercando hermanos y separando los de aspecto similar de otras categorias). Los negativos duros se minaron con el encoder sin ajustar. El texto del lado CWE se renderiza como titulo del nodo, su resumen y los titulos de sus hijos inmediatos, de forma que la estructura taxonomica entra en el embedding.

En cuanto a los datos, el corpus es la vista CWE-699 *Software Development* extraida de `cwe.mitre.org`, incluyendo padres e hijos. Las descripciones de CVE proceden del dataset `zefang-liu/cve-and-cwe-mapping-dataset` (CVEs de 1999 a 2021), enriquecidas con descripciones de CWE y normalizadas para eliminar ruido. El split se hace por identificador de CVE para que ninguna CVE con multiples etiquetas quede repartida entre conjuntos, estratificado por CWE primario. Se entrenaron 3 epocas con learning rate 1e-4, batch size 64 y warmup lineal del 5 %.

## Capacidades
- Generacion de embeddings de frases de 384 dimensiones con normalizacion L2 para busqueda por similitud coseno.
- Recuperacion asimetrica CVE-a-CWE: dada una descripcion de vulnerabilidad, devuelve un ranking de nodos CWE.
- Clasificacion a nivel de categoria CWE (nodo padre) mediante busqueda en dos etapas.
- Clasificacion a nivel de CWE hijo, tanto restringida a las categorias predichas (hier.) como sobre la taxonomia completa (flat).
- Generalizacion a descripciones de CVE no vistas durante el entrenamiento sin necesidad de reentrenar.
- Uso como modelo de embeddings generico para tareas de similitud de frases en ingles.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un encoder de representaciones.
- Modelo multilingue: no, solo ingles.

## Casos de uso
- Triaje automatico de vulnerabilidades: al recibir un nuevo aviso con su descripcion CVE, el modelo devuelve las CWE candidatas con su puntuacion de similitud, lo que permite enrutar el analisis al equipo o a la politica de remediacion correspondiente sin clasificacion manual.
- Enriquecimiento de bases de datos de vulnerabilidades: para catalogos internos que solo almacenan identificadores CVE, el encoder permite poblar el campo CWE y la categoria asociada de forma masiva y consistente.
- Analisis de explotabilidad y priorizacion de parches: la CWE predicha a nivel de hijo es la senal que alimenta heuristicas de severidad y de tecnicas de explotacion conocidas, de modo que el modelo ayuda a ordenar la cola de parcheo.
- Busqueda semantica sobre catalogos CWE: indexar todos los nodos CWE con este modelo permite construir un buscador en lenguaje natural donde el analista pega un fragmento de aviso o de codigo y obtiene las debilidades mas cercanas.
- Deduplicacion y agrupacion de CVEs: embeddings de 384 dimensiones permiten agrupar avisos que describen la misma debilidad subyacente mediante clustering o umbral de similitud coseno, reduciendo el ruido en paneles de seguimiento.
- Prefiltrado en pipelines de analisis con LLM: dado su tamano reducido, el modelo puede actuar como primera etapa de recuperacion que selecciona las CWE relevantes y se las pasa como contexto a un modelo generativo, reduciendo coste y latencia.
- Integracion en CI/CD y SCA: un escaneo de dependencias puede mapear los hallazgos a CWE mediante este encoder y aplicar reglas de bloqueo por categoria dentro del pipeline.
- Asistencia a analistas de SOC y equipos de respuesta: al normalizar la descripcion de un incidente a una CWE concreta, el modelo facilita la correlacion con bases de conocimiento y runbooks existentes.

## Benchmarks y rendimiento
Recall@k sobre CVEs divulgadas entre 2023 y 2025, no vistas durante el entrenamiento. El recall de categoria usa la busqueda en dos etapas; el recall de hijo se reporta restringido a las categorias predichas (*hier.*) y sobre la taxonomia completa (*flat*).

| Objetivo | Modelo | @1 | @3 | @5 |
|---|---|---|---|---|
| Categoria | Baseline (L6 sin ajustar) | 0,236 | 0,409 | 0,510 |
| Categoria | HiCWE-MiniLM-L6-v2 | 0,750 | 0,856 | 0,889 |
| Categoria | Clasificador SOTA (`mulliken/cwe-predictor`) | 0,802 | 0,862 | 0,869 |
| Hijo (hier.) | Baseline (L6 sin ajustar) | 0,124 | 0,175 | 0,216 |
| Hijo (hier.) | HiCWE-MiniLM-L6-v2 | 0,695 | 0,735 | 0,756 |
| Hijo (flat) | Baseline (L6 sin ajustar) | 0,337 | 0,432 | 0,479 |
| Hijo (flat) | HiCWE-MiniLM-L6-v2 | 0,753 | 0,828 | 0,853 |
| Hijo (flat) | Clasificador SOTA (`mulliken/cwe-predictor`) | 0,655 | 0,753 | 0,779 |

Segun el autor, el ajuste mejora todos los objetivos respecto al encoder sin ajustar, la receta "hierarchy-full" da las mejores predicciones de hijo y, en el objetivo hijo *flat*, este modelo supera al clasificador SOTA, mientras que en categoria queda ligeramente por debajo pero con un tamano mucho menor. La variante L12 es mejor en k=1, pero el objetivo hijo *flat* es practicamente identico entre ambos tamanos (0,75 en k=1 y 0,85 en k=5), por lo que el L6 se presenta como la opcion eficiente por defecto.

## Requisitos de hardware
- VRAM estimada para inferencia: no hay cifras publicadas, pero por tamano (22,7 M de parametros) el peso ocupa aproximadamente 91 MB en fp32 y unos 45 MB en fp16, mas activaciones y cache de atencion para secuencias de hasta 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100, H100 ni similar. Una RTX 4090 o una GPU de gama media como una RTX 3060 van sobradamente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas.
- Ejecucion en CPU: viable sin GPU; es un encoder de 6 capas, por lo que el coste por embedding es bajo.
- Opciones de despliegue: SentenceTransformers (libreria declarada), Text Embeddings Inference (el repo lleva el tag `text-embeddings-inference`) y endpoints compatibles (tag `endpoints_compatible`). Servidores de embeddings como vLLM son compatibles con modelos de embedding, aunque no estan documentados por el autor para este modelo. La conversion a GGUF para llama.cpp u Ollama no esta documentada.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares
| Modelo | Parametros | Dimension de embedding | Recall@1 categoria | Recall@1 hijo (flat) | Licencia |
|---|---|---|---|---|---|
| HiCWE-MiniLM-L6-v2 | 22,7 M | 384 | 0,750 | 0,753 | apache-2.0 |
| HiCWE-MiniLM-L12-v2 | no disponible | 384 | no disponible (el autor indica que es mejor en k=1) | aproximadamente 0,75 | no disponible |
| Baseline sin ajustar (`all-MiniLM-L6-v2`) | 22,7 M | 384 | 0,236 | 0,337 | apache-2.0 |
| `mulliken/cwe-predictor` (clasificador SOTA) | no disponible | no aplica (clasificador) | 0,802 | 0,655 | no disponible |

La diferencia clave frente al baseline es el ajuste contrastivo con estructura jerarquica: el encoder sin ajustar parte de 0,236 de recall@1 en categoria y 0,337 en hijo *flat*, valores que suben a 0,750 y 0,753 respectivamente. Frente al clasificador SOTA, el modelo pierde en categoria (@1) pero gana en hijo *flat* y ofrece embeddings reutilizables para busqueda, no solo una etiqueta.

## Limitaciones y advertencias
- La taxonomia esta fija a la vista CWE-699 *Software Development*. Las CWE nuevas o fuera de esa vista no estan representadas, aunque los embeddings siguen generalizando a descripciones no vistas sin reentrenar.
- El modelo solo soporta ingles; las descripciones de CVE en otros idiomas degradaran la calidad del ranking.
- No es un modelo generativo: no produce explicaciones ni texto, solo puntuaciones de similitud. Cualquier riesgo de alucinacion recae en el sistema que consuma sus salidas, no en el encoder.
- Riesgo de falsos positivos: una CVE puede mapearse a una CWE de aspecto similar pero incorrecta; la evaluacion reporta 0,753 de recall@1 en hijo *flat*, lo que implica que aproximadamente una de cada cuatro predicciones top-1 no coincide con la etiqueta de referencia.
- El rendimiento depende del formato de entrada. La parte CWE debe renderizarse como titulo, resumen y titulos de hijos inmediatos, tal y como se hizo en entrenamiento; usar solo el titulo o el resumen degrada los resultados.
- Los datos de entrenamiento cubren descripciones de CVE de 1999 a 2021, mientras que la evaluacion usa CVEs de 2023 a 2025; conviene validar el comportamiento sobre el dominio concreto de despliegue antes de produccion.
- La model card esta truncada en la seccion de limitaciones en la informacion disponible, por lo que pueden existir advertencias adicionales del autor no recogidas aqui.
- El modelo tiene 0 descargas y 0 likes, y procede de un unico autor sin paper asociado ni revision por pares; la validacion externa es inexistente por el momento.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, incluyendo la fusion de pesos ya aplicada, siempre que se conserven los avisos de licencia y atribucion correspondientes.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/regularpooria/HiCWE-MiniLM-L6
- Variante mayor HiCWE-MiniLM-L12-v2: https://huggingface.co/regularpooria/HiCWE-MiniLM-L12-v2
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Clasificador de referencia usado en la comparativa: https://huggingface.co/mulliken/cwe-predictor
- Dataset de mapeo CVE-CWE: https://huggingface.co/datasets/zefang-liu/cve-and-cwe-mapping-dataset
- Catalogo CWE del MITRE (vista CWE-699): https://cwe.mitre.org
