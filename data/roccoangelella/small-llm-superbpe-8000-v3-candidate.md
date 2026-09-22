# roccoangelella/small-llm-superbpe-8000-v3-candidate

## Resumen

`small-llm-superbpe-8000-v3-candidate` no es un modelo de lenguaje, sino un tokenizador: un artefacto de vocabulario de 8.000 entradas publicado en Hugging Face por el usuario `roccoangelella` (Edoardo y Rocco, autores a partes iguales), bajo licencia Apache 2.0 y con la librería `tokenizers`. Está diseñado para modelos pequeños de inglés; el modelo objetivo declarado es una mezcla de expertos (MoE) de aproximadamente 10 millones de parámetros activos, en el que una tabla de embeddings grande consumiría una parte desproporcionada de la capacidad total. El tamaño del vocabulario es, por tanto, una decisión de diseño y no el resultado de una optimización.

El vocabulario se compone de 7.192 entradas de subpalabra, 800 entradas «superword» que cruzan fronteras de pre-tokenización (incluidos espacios en blanco) y 8 tokens especiales, con la tabla de embeddings rellenada hasta 8.192 filas. Se entrenó en una única CPU en menos de 25 minutos y se distribuye junto con tres scripts de reproducción: `sample_corpus.py`, `train_tokenizer.py` y `evaluate.py`.

Su relevancia es doble y metodológica. Por un lado, aplica la técnica SuperBPE (arXiv 2503.13423) en un régimen de vocabulario muy pequeño, donde el BPE clásico no puede formar tokens que crucen fronteras de pre-tokenización: medido a 8.000 entradas fijas, el uso de superwords eleva la compresión a 4,17 bytes por token frente a 3,89 sin ellas, un 7,3% de mejora. Por otro, la model card documenta con detalle un hallazgo útil para cualquiera que entrene un tokenizador: lo que importa es la cobertura temática del corpus de entrenamiento, no su volumen. Es un artefacto candidato: no se ha utilizado todavía en ninguna ejecución de entrenamiento ni para tokenizar corpus alguno (la versión usada por el corpus v2 de 100B es `small-llm-superbpe-8000-v2`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no aplica. Es un tokenizador; la técnica de construcción es SuperBPE en dos fases (BPE por subpalabras + fase de superwords) |
| Parámetros totales | no aplica. El artefacto no tiene parámetros; contiene un vocabulario de 8.000 entradas (7.192 subpalabras, 800 superwords, 8 tokens especiales) con la tabla de embeddings rellenada a 8.192 filas |
| Parámetros activos | no aplica al artefacto. El modelo objetivo para el que se diseña es un MoE de ~10 M de parámetros activos (dato declarado en la model card) |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica. Artefactos: `tokenizer.json` (formato Hugging Face `tokenizers`) y `superbpe_8000.model` (modelo del productor del que se convirtió) |
| Tamaño del vocabulario | 8.000 entradas (punto de transición a superwords al 90% del vocabulario) |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Idiomas de los scripts | no disponible |
| Fecha de creación y actualización | 22 de septiembre de 2026 (metadatos del repositorio) |
| Estado | candidato; no usado en ninguna ejecución de entrenamiento |

## Arquitectura y entrenamiento

La construcción sigue el esquema SuperBPE en dos fases. En la primera se entrena un BPE convencional limitado por las fronteras de pre-tokenización, de modo que su vocabulario queda acotado a palabras completas. En la segunda fase se relajan esas fronteras y se añaden 800 entradas «superword» que pueden abarcar espacios en blanco, siguiendo el planteamiento de SuperBPE (arXiv 2503.13423) y BoundlessBPE (arXiv 2504.00178). El punto de transición entre ambas fases se fija al 90% del vocabulario, que es la configuración que SuperBPE encontró mejor para el rendimiento aguas abajo, y no la que comprime más: la propia ablación de ese trabajo muestra que ambas cosas no coinciden y que «una mayor compresión no implica necesariamente mejor rendimiento».

Los datos de entrenamiento son 2 GB de prosa inglesa filtrada, extraídos como una porción de bytes igual de cada una de 800 regiones repartidas uniformemente por todo el corpus de 100B. El resultado empírico principal es que la cobertura manda sobre el volumen: el mismo 2 GB extraído de 160 regiones rinde +0,42% frente a la v2, de 400 regiones +0,60% y de 800 regiones +0,66%, mientras que la misma receta sobre un pool estrecho de 95 regiones supone una regresión del 1,7% pese a puntuar de forma excelente sobre esas mismas 95 regiones. En cuanto al volumen, 1,2 GB y 12 GB extraídos de las mismas regiones producen vocabularios que comparten el 97,0% de sus entradas (con las primeras 256 idénticas) y difieren un 0,07% en compresión, lo que concuerda con Reddy et al. (arXiv 2502.20273), que atribuyen la estabilización temprana de la calidad intrínseca a la pre-tokenización. No se menciona ningún uso de RLHF, DPO ni ajuste por preferencias: es un componente de preprocesado, no un modelo entrenado con señales humanas.

## Capacidades

- Segmentación de texto en inglés en subpalabras y superwords: convierte texto plano en secuencias de identificadores con un vocabulario cerrado de 8.000 entradas.
- Cruce de fronteras de pre-tokenización: las 800 entradas superword permiten representar secuencias que incluyen espacios en blanco, algo que el BPE clásico no puede hacer.
- Round-trip fiable: cero fallos de decodificación sobre 98.528 documentos en el conjunto de prueba.
- Uso eficiente del vocabulario: utilización del 99,5% de las entradas del vocabulario sobre el conjunto de prueba.
- Compresión medida: 4,2216 bytes por token y 1,4288 tokens por palabra sobre el conjunto de prueba de 296 regiones.
- Reproducibilidad: incluye scripts de muestreo de corpus, entrenamiento en dos fases y evaluación, con el archivo `CODE-README.md` documentando las decisiones.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio: no es un modelo de pesos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es multilingüe: está etiquetado únicamente como inglés (`en`).

## Casos de uso

- Entrenamiento de modelos pequeños en inglés con presupuesto de embeddings ajustado: con 8.000 entradas la tabla de embeddings ocupa 8.192 filas, lo que deja una proporción mucho mayor de la capacidad del modelo para las capas no relacionadas con el vocabulario, algo crítico en un MoE de ~10 M de parámetros activos.
- Preprocesado de corpus para experimentos de escalado a pequeña escala: sirve como tokenizador de referencia para comparar configuraciones de modelo sin que el tamaño del vocabulario contamine la comparación.
- Investigación en tokenización: permite reproducir y verificar la comparación entre SuperBPE y BPE clásico a un tamaño de vocabulario fijo de 8.000 entradas, además de servir de base para replicar la ablación de cobertura por regiones.
- Diseño de conjuntos de prueba para tokenizadores: la metodología documentada (296 regiones disjuntas, 82.479 documentos, 239 MB, desviación estándar por región de 1,4 puntos) es directamente reutilizable para construir evaluaciones que puedan fallar a un tokenizador malo.
- Despliegue en entornos con memoria limitada: un vocabulario de 8.000 entradas implica un archivo `tokenizer.json` mínimo y un coste de memoria despreciable en el proceso de inferencia, adecuado para sistemas embebidos o servicios con muchas réplicas.
- Integración en pipelines de preprocesado existentes: al ser un `tokenizer.json` estándar de la librería `tokenizers`, se carga con `Tokenizer.from_pretrained` y puede incorporarse a cualquier flujo que consuma ese formato.
- Auditoría de calidad de tokenizadores en producción: la métrica de round-trip sin fallos sobre 98.528 documentos y la utilización del vocabulario del 99,5% sirven como criterios objetivos de aceptación antes de promover un tokenizador a un pipeline real.

## Benchmarks y rendimiento

Conjunto de prueba: 296 regiones distintas nunca usadas en ninguna rama de entrenamiento, 82.479 documentos, 239 MB. Cada región corresponde a un tema, por lo que la desviación estándar por región de 1,4 puntos implica que un conjunto de 40 regiones tendría un error estándar de 0,21 puntos, superior al efecto medido; de ahí la amplitud del conjunto.

| Tokenizador | Bytes/token | Diferencia vs v2 | Regiones ganadas | Mediana por región |
|---|---:|---:|---:|---:|
| v2, entrenado sobre un corpus anterior | 4,1937 | — | — | — |
| `small-llm-superbpe-8000-v3-candidate` | 4,2216 | +0,66% | 218/296 | +0,55% |
| BoundlessBPE, transición automática | 4,2077 | +0,33% | 182/296 | +0,33% |
| Control: pool estrecho de 95 regiones | 4,0894 | −2,49% | 31/296 | −2,49% |

Otras métricas declaradas sobre el mismo conjunto de prueba: 1,4288 tokens por palabra, entropía de unigramas de 11,14 bits, entropía de bigramas de 7,61, eficiencia de Renyi con alfa 2,5 de 0,586, utilización del vocabulario del 99,5%, superwords como el 7,6% de todos los tokens emitidos y cero fallos de round-trip en 98.528 documentos.

Medición independiente de la contribución de las superwords, a 8.000 entradas fijas: 4,17 bytes por token con superwords frente a 3,89 sin ellas, una ganancia del 7,3% atribuible exclusivamente a las 800 entradas superword. Nota de rigor: esa pareja de cifras procede de una medición distinta de la de la tabla anterior (4,2216 bytes/token) y no debe mezclarse con ella. No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el artefacto no es un modelo generativo.

## Requisitos de hardware

- Entrenamiento: una única CPU, menos de 25 minutos para el tokenizador completo. No requiere GPU.
- Inferencia: no requiere GPU ni VRAM dedicada; el proceso es de CPU y el coste de memoria del vocabulario es despreciable.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica; el artefacto no ejecuta cómputo matricial.
- Opciones de despliegue: librería `tokenizers` de Hugging Face mediante `Tokenizer.from_pretrained`. El archivo `tokenizer.json` es consumible por cualquier stack que acepte ese formato (por ejemplo, como parte de la carga de un modelo en `transformers`), pero vLLM, llama.cpp, Ollama o TGI no aplican al tokenizador en sí, solo al modelo que lo incorpore.
- Latencia y throughput: no disponible. No se publican mediciones de velocidad de tokenización.

## Comparativa con modelos similares

La comparación relevante es contra otros tokenizadores del mismo autor y misma familia, no contra modelos de lenguaje.

| Tokenizador | Entradas | Bytes/token (conjunto de 296 regiones) | Diferencia vs v2 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `small-llm-superbpe-8000-v2` | 8.000 | 4,1937 | — | Apache 2.0 | Hugging Face; es el usado por el corpus v2 de 100B |
| `small-llm-superbpe-8000-v3-candidate` (este) | 8.000 | 4,2216 | +0,66% | Apache 2.0 | Hugging Face; candidato, sin uso en entrenamiento |
| BoundlessBPE con transición automática | 8.000 | 4,2077 | +0,33% | no disponible en la información proporcionada | referencia comparativa del trabajo |
| BPE clásico a 8.000 entradas, sin superwords | 8.000 | 3,89 (medición distinta) | no comparable directamente | no aplica | medición de control interna |

## Limitaciones y advertencias

- Es un artefacto candidato: no se ha usado para tokenizar ningún corpus ni para entrenar ningún modelo, según declara explícitamente la model card. No debe tratarse como equivalente a la v2 en pipelines en producción.
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código y no puede utilizarse para tareas de inferencia por sí solo. Cualquier expectativa de MMLU, HumanEval o similares es inaplicable.
- Cobertura lingüística limitada al inglés. No hay evidencia de comportamiento sobre otros idiomas, y su vocabulario de 8.000 entradas es especialmente inadecuado para lenguajes con morfología rica.
- Compresión contenida: 4,2216 bytes por token es bajo en términos absolutos porque el vocabulario es deliberadamente diminuto. Frente a tokenizadores de 32.000 o 100.000 entradas, producirá secuencias notablemente más largas y encarecerá el entrenamiento y la inferencia por token procesado.
- Sensibilidad a la cobertura del corpus de entrenamiento: la propia model card documenta que entrenar con un pool estrecho de 95 regiones produce una regresión del 1,7% fuera de ese pool. Reentrenar este tokenizador con un corpus poco diverso degrada su rendimiento de forma difícil de detectar con un conjunto de prueba pequeño.
- Riesgo de sobreajuste en la evaluación: con una desviación estándar por región de 1,4 puntos, un conjunto de prueba de 40 regiones tiene un error estándar de 0,21 puntos, superior a los efectos que se miden. Cualquier validación debe usar un conjunto amplio y estratificado por región.
- Las mejoras declaradas son modestas en términos absolutos (+0,66% en bytes por token frente a v2, +0,55% de mediana por región) y se miden sobre una única configuración de corpus y de tamaño de vocabulario.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No se declaran restricciones adicionales.
- Los metadatos del repositorio indican fechas de creación y actualización de 22 de septiembre de 2026, posteriores a la fecha habitual de consulta; conviene verificar la vigencia y el estado del artefacto antes de integrarlo.
- El repositorio registra 0 descargas y 0 «likes»: no existe validación por parte de terceros ni evidencia de uso externo.

## Enlaces

- Hugging Face: https://huggingface.co/roccoangelella/small-llm-superbpe-8000-v3-candidate
- Tokenizador de referencia de la familia (usado por el corpus v2 de 100B): https://huggingface.co/roccoangelella/small-llm-superbpe-8000-v2
- SuperBPE (paper): https://arxiv.org/abs/2503.13423
- BoundlessBPE (paper): https://arxiv.org/abs/2504.00178
- Ley de escalado de Tao et al. (paper): https://arxiv.org/abs/2407.13623
- Reddy et al., sobre calidad intrínseca del tokenizador y pre-tokenización (paper): https://arxiv.org/abs/2502.20273
- Búsqueda web: los resultados devueltos no guardan relación con este tokenizador (correspondían a un producto farmacéutico), por lo que no se ha podido extraer de ellos ningún enlace adicional relevante.
