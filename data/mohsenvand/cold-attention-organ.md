# mohsenvand/cold-attention-organ

## Resumen

Cold attention organ es un componente auxiliar de razonamiento entrenado por el usuario de Hugging Face `mohsenvand` que se acopla a un modelo de lenguaje Qwen2.5 congelado para resolver tareas de razonamiento multi-salto sobre contextos largos. El componente, denominado "organo" por el autor, es un bloque de atención de entre 529 y 949 parámetros que encadena las menciones de nombres leídas por el modelo base y responde preguntas de sí o no. El modelo de lenguaje no se entrena ni se modifica en ningún momento: solo actúa como extractor de representaciones.

La propuesta técnica es relevante porque ataca un problema documentado de los transformers: la degradación del razonamiento cuando la longitud del contexto crece. Con Qwen2.5-7B congelado, el órgano acierta el 100% de las preguntas desde 16 hasta 1.000 enunciados en las pruebas publicadas, mientras que el modelo base por sí solo cae del 74,0% al 43,8% en ese mismo rango. El bloque se entrena con respuestas sí/no sobre contextos de como máximo 16 enunciados y se evalúa con hasta 1.000, lo que el autor presenta como evidencia de generalización en longitud.

El artefacto se distribuye en formato JAX con pesos safetensors y licencia Apache 2.0. El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que solo contiene los pesos del bloque auxiliar y no los del modelo Qwen2.5, que deben obtenerse por separado. Las tareas cubiertas son parentesco (relaciones de ancestro) y comparación (mayor que) sobre nombres del vocabulario del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Bloque de atención iterativa ("cold attention") acoplado a un transformer congelado (Qwen2.5) |
| Parámetros totales | 529 a 949 parámetros (solo el órgano; el modelo base no se incluye) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado con hasta 16 enunciados; evaluado hasta 1.000 enunciados |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería JAX) |

## Arquitectura y entrenamiento

El órgano modela cada mención de nombre como un ítem: la X y la Y de la pregunta, más el primer y segundo nombre de cada enunciado. Cada par ordenado de menciones transporta 3 bits. En cada iteración, el bit c de un par (u, v) se activa cuando existe una mención k que supera el test c tanto en (u, k) como en (k, v); los bits nunca se desactivan. Cada test es una función aprendida de los planos de entrada del par combinada con una mezcla no negativa de sus bits, de modo que puede exigir que un bit esté activo pero nunca que esté apagado. La respuesta en (X, Y) es una ponderación no negativa de sus tres bits menos un desplazamiento no negativo: sin ningún bit activo, la respuesta es "no". El bloque se lee tras K + 4 iteraciones, con K = ceil(log2 del número de menciones) + 3.

Los planos de entrada provienen del modelo congelado y no se entrenan. Para el parentesco se usan las claves de cada nombre (suma de los embeddings de entrada sobre sus tokens, centradas y escaladas con estadísticas de los enunciados de entrenamiento) y un umbral de similitud coseno calculado sin etiquetas. La clase de cada enunciado se determina con el propio Qwen2.5: en el caso de 7B y 1.5B (lectura "pooled"), cada frase se pasa dos veces seguidas de "Therefore, the parent is" y "Therefore, the child is", y se compara el logit del primer token del primer nombre frente al del segundo; las frases se agrupan por redacción mediante la clave de sus palabras de clase cerrada y la dirección de cada redacción es la lectura mayoritaria. En el caso de 0.5B (clases por redacción), el modelo lee "X is a child of Y" al revés, por lo que la clase es la propia redacción y el bloque aprende su dirección a partir de las respuestas. No se especifica en la información disponible el volumen de datos de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Razonamiento multi-salto sobre cadenas de menciones: responde preguntas de ancestro ("Is X an ancestor of Y?") recorriendo cadenas de enlaces de parentesco.
- Generalización en longitud: entrenado con contextos de hasta 16 enunciados, responde correctamente con hasta 1.000.
- Dos disposiciones de entrada: `within` (enlace directo entre el primer y segundo nombre del enunciado) y `partner` (el otro nombre del enunciado es la persona de b).
- Dos tareas: parentesco (8 redacciones, 11.520 nombres completos: 96 nombres de pila y 120 apellidos) y comparación ("A is older than B" sobre 1.400 nombres de un token del vocabulario).
- Robustez a redacciones no vistas: dos de las ocho redacciones no aparecen en entrenamiento y el órgano las resuelve abriendo una clase propia.
- Respuesta binaria sí/no con calibración explícita: sin bits activos la salida es "no".
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es un componente de razonamiento restringido a las tareas descritas.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Razonamiento sobre grafos de parentesco en documentos largos: dado un texto con cientos de enunciados familiares, el órgano responde consultas de ancestro sin que el modelo base tenga que retener toda la cadena en su ventana de atención, lo que resulta adecuado porque el bloque opera sobre las menciones extraídas y no sobre el texto completo.
- Extracción de relaciones en bases de datos genealógicas: integrado en un pipeline que primero detecta menciones de personas y después consulta el órgano para resolver relaciones de ancestro, útil por su tolerancia a redacciones no vistas.
- Verificación de hechos encadenados en documentación: para preguntas del tipo "¿es A anterior a B?" en cadenas de comparaciones, el órgano mantiene la precisión cuando el número de hechos crece, algo que el modelo base pierde.
- Investigación en mecanismos de atención: el bloque sirve como banco de pruebas reproducible para estudiar atención iterativa con restricciones de monotonía (bits que nunca se apagan) sobre un modelo congelado.
- Evaluación de generalización en longitud: útil como referencia para comparar estrategias de extensión de contexto, ya que separa la lectura del modelo base del razonamiento sobre las menciones.
- Prototipado de módulos de razonamiento desacoplados: al requerir solo 529-949 parámetros, el órgano se puede entrenar y sustituir sin reentrenar el modelo de lenguaje, lo que abarata la experimentación.
- Docencia y divulgación: ejemplo mínimo y auditable de cómo un componente pequeño puede corregir un fallo sistemático de un LLM grande en una tarea acotada.

## Benchmarks y rendimiento

Parentesco con Qwen2.5-7B congelado, lectura pooled, disposición `within` (la predeterminada). Contextos de test: 24 por tamaño (12 a 1.000), 8 preguntas cada uno, las ocho redacciones.

| Enunciados | seed 0 | seed 1 | seed 2 | Modelo congelado solo |
|---|---:|---:|---:|---:|
| 16 | 192/192 | 192/192 | 192/192 | 74,0% |
| 32 | 192/192 | 192/192 | 192/192 | 64,6% |
| 64 | 192/192 | 192/192 | 192/192 | 52,6% |
| 128 | 192/192 | 192/192 | 192/192 | 53,1% |
| 256 | 192/192 | 192/192 | 192/192 | 52,6% |
| 512 | 192/192 | 192/192 | 192/192 | 52,6% |
| 1.000 | 96/96 | 96/96 | 96/96 | 43,8% |

Validación con la disposición `within`: val6 (16 enunciados) 100%/100%/100%; val16 (16 enunciados) 100%/100%/100%; val24 (24 enunciados) 100%/100%/100%.

Parentesco con Qwen2.5-7B congelado, lectura pooled, disposición `partner`:

| Enunciados | seed 0 | seed 1 | seed 2 | Modelo congelado solo |
|---|---:|---:|---:|---:|
| 16 | 192/192 | 192/192 | 192/192 | 74,0% |
| 32 | 192/192 | 192/192 | 192/192 | 64,6% |
| 64 | 192/192 | 192/192 | 192/192 | 52,6% |
| 128 | 192/192 | 192/192 | 192/192 | 53,1% |
| 256 | 192/192 | 192/192 | 192/192 | 52,6% |
| 512 | 192/192 | 192/192 | 192/192 | 52,6% |
| 1.000 | 96/96 | 96/96 | 96/96 | 43,8% |

Validación con la disposición `partner`: val6 100%/100%/100%; val16 100%/100%/100%; val24 100%/100%/100%.

Los resultados con Qwen2.5-1.5B (lectura pooled) y Qwen2.5-0.5B (clases por redacción) aparecen truncados en la información disponible; no se reproducen cifras parciales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para el órgano: despreciable (529-949 parámetros); el coste real lo determina el modelo Qwen2.5 congelado que se use como lector.
- Qwen2.5-7B en BF16: aproximadamente 15 GB de VRAM; en cuantización de 4 bits, en torno a 4-5 GB (estimación habitual para modelos de ese tamaño, no confirmada en la información disponible).
- Qwen2.5-1.5B en BF16: aproximadamente 3 GB; Qwen2.5-0.5B en BF16: aproximadamente 1 GB.
- GPU recomendadas: A100 o H100 para el 7B en BF16 con contexto largo; RTX 4090 (24 GB) suficiente para el 7B en BF16 o para el 1.5B con margen amplio.
- Cabe en GPU de consumo: sí, el 7B en cuantización de 4 u 8 bits en tarjetas de 8-12 GB; el 1.5B y el 0.5B en cualquier GPU moderna.
- Despliegue: la librería declarada es JAX, por lo que el flujo natural es el ecosistema JAX/Flax; para servir Qwen2.5 se puede usar vLLM o TGI y consumir las representaciones necesarias, aunque la información disponible no documenta integraciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada: el artefacto no es un LLM completo sino un módulo de razonamiento acoplado a Qwen2.5. La comparación más informativa es contra el propio modelo base sin el órgano.

| Sistema | Parámetros del módulo | Contexto de entrenamiento | Contexto evaluado | Precisión a 16 enunciados | Precisión a 1.000 enunciados | Licencia |
|---|---:|---|---:|---:|---:|---|
| Cold attention organ + Qwen2.5-7B | 529-949 | 16 enunciados | 1.000 | 100% | 100% | Apache 2.0 |
| Qwen2.5-7B solo | 7B (congelado) | No aplica | Ventana del modelo | 74,0% | 43,8% | Apache 2.0 |
| Cold attention organ + Qwen2.5-0.5B (comparación) | 529-949 | 16 enunciados | No disponible en detalle | No disponible | No disponible | Apache 2.0 |

## Limitaciones y advertencias

- Dominio muy restringido: solo resuelve preguntas de sí/no de parentesco y comparación; no es un modelo de propósito general ni sustituye al LLM.
- Dependencia del lector: la calidad del órgano depende de las representaciones y de la lectura del Qwen2.5 congelado; con el 0.5B el modelo lee "X is a child of Y" al revés y requiere un tratamiento distinto (clases por redacción).
- Umbrales sin etiquetas: la similitud de identidad entre nombres se decide con un umbral coseno heurístico ("justo por debajo del grupo de coincidencias"), lo que puede fallar con nombres ambiguos o fuera de la distribución de 11.520 nombres completos.
- Idiomas: la información no declara idiomas soportados; los datos de entrenamiento descritos están en inglés ("P is the mother of C.", "Therefore, the parent is").
- Riesgo de alucinación: bajo en el sentido clásico, porque la salida es binaria y está anclada a bits, pero un fallo en la extracción de menciones o en la clasificación de redacción puede producir respuestas erróneas sin señal de incertidumbre.
- Sesgos: no documentados; la lista de nombres (96 nombres de pila y 120 apellidos) puede no ser representativa.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen2.5 tiene su propia licencia, que debe verificarse por separado.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el 15 de noviembre de 2026; tamaño de 0,0 GB, sin pipeline declarado. No hay evidencia de uso en producción.
- Los resultados publicados provienen del propio autor; no se han replicado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohsenvand/cold-attention-organ
- Artículo de IBM Research sobre conteo y seguimiento de estado en LLM y modelos de espacio de estados: https://research.ibm.com/blog/state-tracking-for-state-space-models
