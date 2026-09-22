# nazbijari/nammu

## Resumen

Nammu es un modelo de lenguaje genómico de 167.549.952 parámetros desarrollado por el usuario nazbijari y publicado en HuggingFace. Se trata de un modelo basado en una arquitectura Mamba-1 bidireccional (etiquetada en el repositorio como `bimamba_mlm`), entrenado con un objetivo de modelado de lenguaje enmascarado (MLM) sobre la base de datos genómica TattaBio OMG. El pipeline declarado en HuggingFace es `feature-extraction`, por lo que su uso principal previsto es la generación de representaciones vectoriales de secuencias, no la generación de texto.

El interés de este modelo radica en la combinación de dos elementos poco habituales: el uso de una arquitectura de espacio de estados (SSM) Mamba-1 en lugar de un transformer clásico, y su naturaleza bidireccional, que permite que cada posición de la secuencia atienda simultáneamente al contexto anterior y posterior. Ambos rasgos son relevantes para tareas genómicas, donde el contexto aguas abajo (elementos reguladores, motivos, señales de splicing) suele condicionar la interpretación de una posición concreta.

La ficha pública es extremadamente escueta: el autor únicamente indica la cifra de parámetros y el corpus de entrenamiento, sin detallar longitud de contexto, tokenizador, composición del dataset, licencia ni idiomas. El repositorio ocupa 0,7 GB y contiene pesos en formato safetensors junto con código personalizado (`custom_code`), lo que implica que su carga requiere `trust_remote_code=True`. No se han publicado resultados de benchmarks ni métricas de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-1 bidireccional (BiMamba), etiquetada como `bimamba_mlm` |
| Parametros totales | 167.549.952 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se declaran cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo sobre secuencias genómicas, no sobre lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code` asociado) |

## Arquitectura y entrenamiento

La arquitectura se basa en Mamba-1, un modelo de espacio de estados selectivo (selective state space model) que sustituye la atención por una recurrencia con parámetros dependientes de la entrada, lo que da lugar a un coste de cómputo lineal respecto a la longitud de la secuencia en lugar del coste cuadrático de la atención estándar. La variante de este modelo es bidireccional: cada token se procesa en dos sentidos, lo que habilita el objetivo de modelado de lenguaje enmascarado (MLM) propia de los codificadores. La etiqueta `bimamba_mlm` del repositorio apunta directamente a esa combinación.

El entrenamiento se realizó sobre la base de datos TattaBio OMG, según la model card del autor. No se especifican en la información disponible el número de tokens procesados, la composición exacta del corpus, el esquema de tokenización (k-meros, tokenizador de nucleótidos o byte-level), la longitud de secuencia usada durante el preentrenamiento, ni si hubo fases posteriores de ajuste (RLHF, DPO, instrucciones). Tampoco se documentan innovaciones de decodificación o variantes de atención lineal adicionales más allá del propio diseño BiMamba.

## Capacidades

- Generación de representaciones densas (embeddings) de secuencias genómicas mediante el pipeline `feature-extraction`, aprovechando la bidireccionalidad para capturar contexto en ambos sentidos.
- Modelado de lenguaje enmascarado sobre nucleótidos: reconstrucción de posiciones ocultas en una secuencia, útil como señal de plausibilidad biológica.
- Extracción de características para clasificación aguas abajo: promotores, enhancers, sitios de splicing, regiones codificantes frente a no codificantes, entre otras, previo ajuste fino de una cabeza de clasificación.
- Representaciones contextuales sensibles a dependencias de largo alcance, gracias al coste lineal del SSM frente a la atención cuadrática (siempre que la longitud de contexto del modelo lo permita; dato no disponible).
- Soporte de tool calling / function calling: no disponible, no aplica a un modelo de `feature-extraction` sobre secuencias genómicas.
- Soporte de agentes y razonamiento multi-paso: no disponible, no aplica.
- Capacidades multilingües: no disponible, no aplica en el sentido de lenguas naturales.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Predicción del efecto de variantes genéticas: extraer embeddings de la secuencia de referencia y de la secuencia con la variante, y usar la diferencia entre representaciones como señal para clasificar variantes benignas frente a patogénicas mediante un modelo aguas abajo entrenado sobre datos anotados.
- Anotación de elementos reguladores: ajustar una cabeza de clasificación sobre los embeddings del modelo para discriminar promotores, enhancers y silenciadores, aprovechando la bidireccionalidad para integrar el contexto flanqueante en ambos lados del elemento.
- Clasificación de sitios de splicing: emplear los embeddings de ventanas centradas en el sitio donador o aceptor para predecir su uso, una tarea donde el contexto aguas arriba y aguas abajo es determinante.
- Búsqueda de similitud y retrieval genómico: indexar embeddings de fragmentos de genoma y recuperar por vecindad semántica secuencias funcionalmente relacionadas, por ejemplo para agrupar familias de elementos repetidos o regiones con comportamiento regulatorio similar.
- Preentrenamiento de modelos genómicos específicos de dominio: utilizar Nammu como inicialización y ajustar sobre un corpus reducido (por ejemplo, un genoma de interés agronómico o clínico) cuando no se dispone de datos suficientes para entrenar desde cero.
- Filtrado y control de calidad de secuencias: detectar fragmentos anómalos, contaminación cruzada o ensamblados erróneos a partir de la perplejidad o de la baja verosimilitud de las representaciones sobre regiones concretas.
- Búsqueda de motivos y regiones conservadas: inspeccionar patrones de atención interna o de sensibilidad del SSM ante perturbaciones locales para localizar posiciones con impacto desproporcionado en la representación de la secuencia.
- Extracción de features para modelos multimodales: alimentar pipelines que combinen genómica con expresión génica o datos epigenómicos, usando los embeddings como entrada de un modelo que integre varias modalidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de evaluación, comparaciones con otros modelos genómicos ni resultados en tareas aguas abajo.

## Requisitos de hardware

Estimaciones calculadas a partir de la cifra de parámetros declarada (167.549.952), sin tener en cuenta el overhead de activaciones, kernel y fragmentación:

- Pesos en FP32: aproximadamente 670 MB.
- Pesos en FP16/BF16: aproximadamente 335 MB.
- Pesos en INT8: aproximadamente 168 MB.
- Pesos en INT4: aproximadamente 84 MB.
- El consumo real de memoria depende de la longitud de secuencia, ya que las activaciones de un SSM crecen con la longitud procesada; para secuencias genómicas largas el cuello de botella puede ser la activación, no los pesos.
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs de 8 GB en FP16. También es viable en CPU para lotes pequeños.
- GPU de centro de datos (A100, H100) solo serían necesarias para procesar grandes lotes o secuencias muy largas en producción.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada implícitamente por el repositorio. La implementación de Mamba-1 requiere kernels específicos (`mamba-ssm` / `causal-conv1d`) en versiones con soporte CUDA; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible y, en el caso de una arquitectura BiMamba personalizada, es poco probable que funcione sin adaptaciones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de Nammu que permitan una comparación cuantitativa. La siguiente tabla recoge alternativas de la misma categoría (modelos de lenguaje genómico) con datos de referencia generales, no confirmados en la información proporcionada sobre este modelo concreto:

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| nazbijari/nammu | 167,5 M | no disponible | BiMamba-1 con MLM | no disponible |
| DNABERT-2 | ~117 M | 128 tokens (multiespecie) | Transformer bidireccional con tokenización BPE | MIT |
| Nucleotide Transformer | 50 M - 2,5 B (varias tallas) | hasta ~6.000 nucleótidos en las variantes largas | Transformer bidireccional | CC-BY-NC-SA 4.0 en varias versiones |
| HyenaDNA | 1,6 M - 46 M | hasta 1 M de nucleótidos | Convoluciones implícitas de largo alcance | Apache 2.0 |
| Evo | 7 B | hasta 131.072 nucleótidos | StripedHyena (híbrido) | Apache 2.0 |

La ventaja teórica de Nammu frente a DNABERT-2 es el coste lineal del SSM y la ausencia de límite cuadrático en la longitud de secuencia; la desventaja es la falta total de evaluación publicada, licencia declarada y documentación de tokenización, lo que dificulta su adopción en producción frente a alternativas con métricas y licencias claras.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta la composición del corpus TattaBio OMG, por lo que se desconoce el sesgo taxonómico (por ejemplo, sobrerrepresentación de genomas humanos o bacterianos) y su impacto en la generalización a otras especies.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de representaciones poco fiables en regiones o especies poco representadas en el corpus de entrenamiento. El uso de las representaciones como evidencia biológica sin validación experimental es inapropiado.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada, lo que impide saber si el modelo puede procesar genes completos o solo ventanas cortas. No es un modelo multilingüe en el sentido habitual; opera sobre secuencias de nucleótidos.
- Restricciones de licencia: la licencia no está declarada en HuggingFace. Sin una licencia explícita, el uso comercial queda en una situación jurídica ambigua y no debe asumirse que esté permitido. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- Código personalizado: el tag `custom_code` implica que la carga requiere `trust_remote_code=True`, lo que supone ejecutar código del autor del repositorio. Conviene auditar ese código antes de desplegarlo en entornos controlados.
- Ausencia de benchmarks: no hay ninguna métrica publicada, ni siquiera pérdida de validación del MLM. No hay evidencia objetiva de que supere a alternativas establecidas.
- Trazabilidad limitada: no se documentan tokenizador, esquema de preprocesamiento, hiperparámetros ni versión de la base de datos TattaBio OMG, lo que dificulta la reproducibilidad.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar experiencias de uso.
- Las fechas de creación y actualización del repositorio (22 de septiembre de 2026) son posteriores a la fecha actual del análisis; conviene verificar la integridad de los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nazbijari/nammu
- Base de datos TattaBio OMG: no disponible (no se proporciona enlace en la información disponible)
- Paper o informe técnico del modelo: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- La búsqueda web asociada no devolvió resultados relevantes sobre el modelo; los únicos resultados obtenidos fueron páginas de soporte de Gmail, sin relación con el tema.
