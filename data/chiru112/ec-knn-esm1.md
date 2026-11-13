# chiru112/ec-knn-esm1

## Resumen

ec-knn-esm1 es un artefacto publicado en Hugging Face por el usuario chiru112 bajo el identificador `chiru112/ec-knn-esm1`, orientado a la predicción de números EC (Enzyme Commission) para la tarea de clasificación enzimática Leak CURBER. Según la model card del autor, el sistema no es una red neuronal generativa al uso, sino un pipeline de recuperación y votación: se ejecuta una búsqueda MMseqs2 de cada secuencia de entrada contra un índice preconstruido del conjunto de entrenamiento completo, se extraen las EC candidatas de los hits superiores y se elige la primera EC mediante un pequeño re-ranker de gradient boosting (cuando se incluye) o mediante votación ponderada por bit-score. La lista de salida es best-first.

El paquete está diseñado para ejecutarse exclusivamente en CPU mediante un script `predict.py` que consume un fichero Parquet y produce un JSONL. Incluye un mecanismo de fallback: las entradas sin hit reciben la EC más frecuente del entrenamiento, y un guardián temporal detiene la búsqueda en máquinas lentas, asignando la EC de fallback a las entradas restantes (las más largas). El repositorio ocupa 1,6 GB, lo que es coherente con un índice de búsqueda sobre un conjunto de entrenamiento proteico más que con pesos de un transformer.

La relevancia de este artefacto es acotada: no es un modelo fundacional ni un ESM entrenado de forma estándar, pese a la terminología `esm1` del nombre, sino una solución de recuperación basada en alineamiento para un benchmark concreto. No hay información pública sobre licencia, idiomas ni pipeline de Hugging Face, y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperación por alineamiento (MMseqs2) con re-ranking (gradient boosting) o votación ponderada por bit-score |
| Parametros totales | no disponible (no es un modelo de pesos neuronales en el sentido habitual; repo de 1,6 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (opera sobre secuencias proteicas individuales, no sobre contexto textual) |
| Tipos de cuantizacion | no disponible (ejecución CPU-only, sin cuantización declarada) |
| Idiomas soportados | no disponible (entrada: secuencias de proteínas; salida: etiquetas EC) |
| Licencia | no disponible |
| Formato de pesos | Índice MMseqs2 preconstruido y script Python; no se declaran safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema descrito en la model card no emplea una arquitectura transformer ni un modelo de lenguaje. Se trata de un clasificador de recuperación (retrieval-based): para cada secuencia única de entrada se ejecuta una búsqueda MMseqs2 contra un índice preconstruido que cubre el conjunto de entrenamiento completo de la tarea Leak CURBER. De los hits superiores se derivan las EC candidatas, y la decisión final recae en un re-ranker de gradient boosting de pequeño tamano (si se distribuye con el paquete) o, en su defecto, en una votación ponderada por bit-score. La salida es una lista ordenada de EC, best-first.

El entrenamiento, en la medida en que existe, consiste en la construcción del índice de referencia y, opcionalmente, en el ajuste del re-ranker sobre pares hit-etiqueta. No se documentan en la información disponible el número de tokens, la composición del dataset, ni el uso de RLHF o DPO, que no aplican a este tipo de sistema. La innovación destacable es operativa: un guardián temporal que aborta la búsqueda en máquinas lentas y recurre a la EC de fallback (la más frecuente del entrenamiento) para las entradas más largas, garantizando un tiempo de respuesta acotado a costa de degradar la precisión en esos casos.

## Capacidades

- Predicción de números EC (Enzyme Commission) a partir de secuencias proteicas, devolviendo una lista ordenada best-first.
- Búsqueda de homología mediante MMseqs2 contra un índice del conjunto de entrenamiento completo.
- Re-ranking de candidatos mediante gradient boosting cuando el componente se incluye en el paquete.
- Votación ponderada por bit-score como mecanismo alternativo de decisión.
- Fallback determinista: las secuencias sin hit reciben la EC más frecuente del entrenamiento.
- Control de tiempo de ejecución mediante guardián temporal para entornos con CPU limitada.
- Ejecución CPU-only, sin requisito de GPU.
- Interfaz de línea de comandos: entrada Parquet, salida JSONL.
- No dispone de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni capacidades de agente.

## Casos de uso

- Anotación enzimática a gran escala en pipelines bioinformáticos: el sistema procesa lotes de secuencias en formato Parquet y emite etiquetas EC en JSONL, integrándose en flujos existentes de anotación funcional sin necesidad de GPU.
- Clasificación de proteínas en entornos con hardware restringido: al ser CPU-only y con guardián temporal, es adecuado para servidores sin aceleradores o para ejecución en contenedores con cuotas de CPU ajustadas.
- Triaje previo a revisión manual: la salida best-first permite a un curador revisar primero las predicciones de mayor confianza (basadas en hits de alto bit-score) y derivar el resto a herramientas más costosas.
- Reproducción de resultados del benchmark Leak CURBER: al emplear un índice preconstruido sobre el conjunto de entrenamiento completo, sirve para replicar la línea base de recuperación de esa tarea concreta.
- Detección de homólogos conocidos en colecciones nuevas: la búsqueda MMseqs2 identifica secuencias cercanas a proteínas ya anotadas, útil para propagar anotaciones EC en genomas recién secuenciados.
- Baseline para comparar clasificadores enzimáticos más complejos: al ser un método de recuperación simple y determinista, proporciona una referencia clara frente a la que medir modelos neuronales de anotación.
- Procesamiento por lotes con degradación controlada: en máquinas lentas, el guardián temporal garantiza que el lote termine en un tiempo acotado, asignando la EC mayoritaria a las secuencias no procesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el sistema es CPU-only y no requiere GPU.
- GPU recomendadas: ninguna; no se declara soporte para aceleración por GPU.
- Cabe en consumer GPU: no aplica.
- Memoria RAM: no disponible de forma explícita; el repositorio de 1,6 GB sugiere que el índice MMseqs2 debe residir en memoria o en disco durante la búsqueda.
- Opciones de despliegue: ejecución directa mediante `python /app/predict.py --input INPUT.parquet --output OUTPUT.jsonl`, presumiblemente dentro de un contenedor (la ruta `/app` lo indica). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; dependen del tamano del índice, del número de secuencias y de la CPU. El guardián temporal acota el tiempo total a costa de recurrir al fallback.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chiru112/ec-knn-esm1 | Recuperación MMseqs2 + re-ranking | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| BLASTp / MMseqs2 con transferencia de anotación | Recuperación por alineamiento | no aplica | no aplica | según herramienta (GPL en MMseqs2) | Ampliamente disponible |
| Modelos neuronales de anotación EC (p. ej. basados en ESM) | Transformer proteico con cabeza de clasificación | no disponible en esta ficha | no disponible | variable | Hugging Face y repos académicos |

La comparación cuantitativa con alternativas neuronales no está disponible en la información proporcionada. Frente a un BLASTp o MMseqs2 con transferencia directa de la anotación del mejor hit, la diferencia declarada es la incorporación de un re-ranker de gradient boosting o una votación ponderada por bit-score sobre los hits superiores, además del fallback y el guardián temporal.

## Limitaciones y advertencias

- El nombre incluye `esm1`, pero la descripción no documenta el uso de representaciones ESM; conviene no asumir que se trata de un modelo ESM.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido.
- No se especifican los idiomas ni el dominio de aplicación más allá de secuencias proteicas y etiquetas EC.
- El fallback a la EC más frecuente del entrenamiento introduce un sesgo hacia las clases mayoritarias y puede enmascarar fallos de búsqueda.
- El guardián temporal degrada la precisión en máquinas lentas al asignar la EC de fallback a las entradas más largas sin procesar.
- La dependencia de un índice preconstruido sobre el conjunto de entrenamiento completo puede inflar el rendimiento aparente si la evaluación no controla fugas entre entrenamiento y prueba (el propio nombre de la tarea, Leak CURBER, sugiere conciencia de este riesgo).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos por homología remota mal alineada.
- No hay datos públicos de benchmarks, descargas ni validación independiente; el artefacto tiene 0 descargas y 0 likes en el momento de la consulta.
- El pipeline de Hugging Face no está declarado, por lo que no puede cargarse con `transformers` ni con APIs estándar de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/chiru112/ec-knn-esm1
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
