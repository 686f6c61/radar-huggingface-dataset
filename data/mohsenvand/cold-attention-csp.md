# mohsenvand/cold-attention-csp

## Resumen

Cold-attention-csp es un conjunto de bloques de atención de pequeño tamaño (135.929 parámetros) diseñados para resolver dos problemas clásicos de satisfacción de restricciones: 2-SAT y two-colouring (bicoloración de grafos). Lo desarrolla el usuario de Hugging Face mohsenvand y se distribuye bajo licencia Apache 2.0. No es un modelo de lenguaje generativo, sino un componente algorítmico especializado que decide si una instancia de 2-SAT o de two-colouring es insatisfacible.

La propuesta técnica es un bloque de "cold attention" en el que cada par ordenado de elementos (u, v) lleva 128 números y cada iteración formula dos preguntas aprendidas de sí/no a cada elemento intermedio k; un elemento que supera ambas pruebas actúa como testigo de (u, v). El bloque solo transmite bits (qué recuento de testigos es mayor o si son iguales, y si algún testigo supera ambas pruebas) y el estado se reconstruye desde la entrada en cada iteración. Las posiciones de los elementos se enmascaran (se reciben como 0), de modo que la respuesta no puede depender del orden, lo que habilita la generalización en longitud.

El interés actual reside en su capacidad de generalización fuera de distribución: se entrena con instancias de hasta 16 variables (2-SAT) o 32 (two-colouring) y se evalúa con hasta 500 variables, alcanzando el 100 % de acierto en casi todas las semillas y divisiones. Es un caso de estudio de razonamiento algorítmico con atención y de los límites teóricos de las reglas de conteo de ancho acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque de cold attention (atención sobre pares ordenados con testigos), implementado en JAX |
| Parametros totales | 135.929 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto; se lee con ceil(log2 n) + 7 iteraciones para n elementos (hasta 500 variables) |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | No disponible (modelo algorítmico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32), más config.json y reference_predictions.npz |

## Arquitectura y entrenamiento

La arquitectura es un bloque de atención "en frío" en el que el estado se representa mediante pares ordenados de elementos, cada uno con 128 números. En cada iteración, el bloque formula dos preguntas binarias aprendidas a cada elemento intermedio k; si un elemento supera ambas, se convierte en testigo del par (u, v). La salida del bloque se limita a bits: la comparación de dos recuentos de testigos (mayor o igual) y la existencia de algún testigo que supere ambas pruebas. El estado se reconstruye desde la entrada y esos bits en cada iteración, y las posiciones de los elementos se enmascaran a 0 para garantizar invariancia al orden.

El entrenamiento se realizó por separado para cada problema y semilla (tres semillas por problema). Para 2-SAT: instancias de 2 a 16 variables, 30.000 actualizaciones con batch de 32, número de iteraciones por lote de ceil(log2 n) + 1 más un sorteo entre 0 y 1. Para two-colouring: instancias de 3 a 32 variables, 30.000 actualizaciones con batch de 32, iteraciones por lote de ceil(log2 n) + 3 más un sorteo entre 0 y 3. En ambos casos se usó AdamW (learning rate 0,0003, 2.000 pasos de warm-up, decaimiento coseno hasta el 1 %, weight decay 0,01) y la lectura promedia 16 snapshots desde la actualización 15.000, uno cada 1.000.

## Capacidades

- Decisión de satisfacibilidad de instancias 2-SAT: determina si una fórmula 2-SAT es insatisfacible.
- Decisión de two-colouring: determina si un grafo es bicolorable (equivalente a comprobar si es bipartito).
- Generalización en longitud: entrenado con hasta 16 variables (2-SAT) o 32 (two-colouring), evaluado con hasta 500 variables.
- Invariancia al orden: al enmascarar las posiciones, la respuesta no depende del orden de los elementos.
- Salida binaria interpretable: la predicción se lee en el par del elemento global (salida `unsat`), con -1 en el resto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso genérico ni capacidades multilingües; es un componente algorítmico especializado.

## Casos de uso

- Verificación de fórmulas 2-SAT en solvers y pipelines de razonamiento automatizado: el bloque puede integrarse como comprobador rápido de insatisfacibilidad antes de invocar un solver completo, aprovechando su precisión del 100 % en las divisiones evaluadas.
- Detección de grafos no bicolorables en validación de restricciones: útil para comprobar rápidamente si un conjunto de restricciones de igualdad/desigualdad entre variables es consistente.
- Investigación en razonamiento algorítmico con transformers: sirve como banco de pruebas reproducible para estudiar generalización en longitud y límites de las reglas de conteo de ancho acotado.
- Estudio de arquitecturas de atención alternativas: el bloque de cold attention puede compararse con atención estándar en tareas de satisfacción de restricciones.
- Generación de datos sintéticos y evaluación de modelos: las divisiones de evaluación incluidas (val, test, n256, n500) permiten reproducir resultados y comparar con otros enfoques.
- Docencia y divulgación: ejemplo compacto (135.929 parámetros) de cómo una regla de conteo local puede resolver clases de restricciones de ancho acotado, con código de carga y lectura reproducible.

## Benchmarks y rendimiento

Porcentaje de entradas respondidas correctamente, promediado por pesos, cada entrada leída tras ceil(log2 n) + 7 iteraciones.

| Problema | División (variables, elementos) | Semilla 0 | Semilla 1 | Semilla 2 | Media |
|---|---|---:|---:|---:|---:|
| 2-SAT | val (24, 49; 256 entradas) | 100,00 | 100,00 | 100,00 | 100,00 |
| 2-SAT | test (64, 129; 256 entradas) | 100,00 | 100,00 | 100,00 | 100,00 |
| 2-SAT | n256 (256, 513; 128 entradas) | 100,00 | 100,00 | 100,00 | 100,00 |
| 2-SAT | n500 (500, 1001; 128 entradas) | 100,00 | 99,22 | 100,00 | 99,74 |
| Two-colouring | val (48, 49; 256 entradas) | 100,00 | 100,00 | 100,00 | 100,00 |
| Two-colouring | test (64, 65; 256 entradas) | 100,00 | 100,00 | 100,00 | 100,00 |
| Two-colouring | n256 (256, 257; 128 entradas) | 100,00 | 100,00 | 100,00 | 100,00 |
| Two-colouring | n500 (500, 501; 128 entradas) | 100,00 | 100,00 | 100,00 | 100,00 |

## Requisitos de hardware

- El estado de pares crece con el cuadrado del número de elementos; las divisiones de 500 variables se leyeron de una en una en una GPU de 80 GB (NVIDIA H100).
- Una GPU de 24 GB se queda sin memoria en las divisiones de 500 variables.
- Para divisiones pequeñas (val, test) el requisito es mucho menor, aunque no se especifica cifra exacta en la información disponible.
- Despliegue mediante JAX 0.8.0; el código reproduce exactamente `reference_predictions.npz` en H100 para los seis modelos, todas las divisiones y tras cada iteración.
- No se proporcionan datos de latencia ni throughput.
- No se mencionan opciones de despliegue como vLLM, llama.cpp, Ollama o TGI; el modelo se ejecuta con la librería `witness_clrs` y JAX.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Se trata de un componente algorítmico especializado en 2-SAT y two-colouring, sin alternativas equivalentes documentadas en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cold-attention-csp | 135.929 | Hasta 500 variables (iteraciones logarítmicas) | 100 % en casi todas las divisiones | Apache 2.0 | Hugging Face |
| Alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo cubre dos clases de restricciones de ancho acotado (2-SAT y two-colouring), cuyas contradicciones son caminos que el bloque construye uniendo testigos.
- El bloque no computa más que lógica de conteo sobre tres variables a la vez: una instancia de paridad insatisfacible (ecuaciones de tres variables) sobre el grafo cubo no puede distinguirse de una satisfacible con tales reglas, y con pesos aleatorios da respuestas idénticas bit a bit.
- El único fallo reportado es 2-SAT n500, semilla 1, con 99,22 % de acierto.
- El coste de memoria crece con el cuadrado de los elementos, lo que limita el tamaño manejable en GPUs de consumo.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- No se documentan sesgos ni riesgos de alucinación en el sentido habitual; el riesgo es de error algorítmico en instancias fuera de las clases soportadas.
- La licencia Apache 2.0 permite uso comercial, pero el sampler que generó las instancias no está incluido en el repositorio; solo se distribuyen las divisiones de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohsenvand/cold-attention-csp
- Repositorio complementario (indicado como "enlace añadido en el lanzamiento"): no disponible en la información proporcionada
- Paper de referencia: no disponible en la información proporcionada
