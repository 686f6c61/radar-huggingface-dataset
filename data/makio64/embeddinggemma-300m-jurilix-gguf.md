# Makio64/embeddinggemma-300m-jurilix-gguf

## Resumen

EmbeddingGemma 300M — Jurilix v1 es un modelo de embeddings de frases especializado en recuperación de información jurídica en francés. Lo publica el usuario Makio64 (proyecto Jurilix) como derivado del modelo abierto google/embeddinggemma-300m de Google, al que se ha aplicado un ajuste fino supervisado sobre pares sintéticos del dominio legal francés. El resultado se distribuye exclusivamente en formato GGUF cuantizado a Q8_0, con un tamaño de fichero de 333.590.784 bytes (0,3 GB) y 307.581.696 parámetros.

El modelo no genera texto: produce vectores densos de 768 dimensiones normalizados mediante mean pooling, con una longitud máxima de entrada de 2.048 tokens. Su función es la similitud semántica y la recuperación asimétrica, usando prefijos distintos para consulta y documento. Es relevante porque permite montar búsqueda semántica jurídica en francés en hardware muy modesto, incluso sin GPU, y porque documenta una receta de inferencia exacta (prefijos, pooling, parámetros de llama-server) y un hash SHA-256 verificable.

El autor reporta dos evaluaciones: 103/120 aciertos top-1 en un conjunto sintético de discriminación de evidencia, frente a 96/120 de un BGE-M3 previamente ajustado, y 58,9 % top-1 en un subconjunto francés general de MIRACL. Se trata de un derivado no oficial: no está publicado ni respaldado por Google.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional; base google/embeddinggemma-300m (familia Gemma 3) |
| Parametros totales | 307.581.696 (aprox. 308 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens maximo; sliding_window=512 restaurado en el export fusionado |
| Tipos de cuantizacion | Q8_0 (unico formato publicado) |
| Idiomas soportados | frances (fr) declarado en la configuracion; no se documentan otros idiomas para este derivado |
| Licencia | Gemma Terms of Use (license: gemma), con PROHIBITED_USE_POLICY.txt y NOTICE.txt |
| Formato de pesos | GGUF |
| Dimension de embedding | 768 (normalizado, mean pooling) |
| Tamano del fichero | 333.590.784 bytes (repo de 0,3 GB) |
| SHA-256 | 0976d331ae35d34262023531dbcc5e6671c70d99c1001b5e69874f8e96c6fa5f |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

La base es EmbeddingGemma 300M de Google, un encoder bidireccional de aproximadamente 300 M de parámetros derivado de la familia Gemma 3, con ventana deslizante de 512 tokens y pooling por media. Sobre esa base, el autor aplica un LoRA de rango 16 y alpha 32 (learning rate 1e-4, batch 16), entrenado durante 2 épocas con selección por desarrollo y mejor resultado en la época 1. El conjunto de entrenamiento son 2.566 pares sintéticos de ámbito jurídico francés. Se entrenaron además ambas cabezas de proyección densa, no solo el adaptador, y posteriormente se fusionó (merge) el LoRA en los pesos base.

Detalles técnicos del export: se restaura el valor original `sliding_window=512` del publicador antes de recargar el modelo, para evitar la doble aplicación del ajuste de radio bidireccional introducido en Transformers 4.57.6. Los identificadores del tokenizer se verificaron sobre 7.631 entradas formateadas. No hay RLHF ni DPO: no es un modelo generativo y no se documenta ningún proceso de alineación por preferencias. La receta de inferencia documentada exige prefijos concretos —`task: search result | query: {query}` para consultas y `title: none | text: [filename] {passage}` para documentos— y parámetros específicos en llama-server: `--embedding --pooling mean --ctx-size 2048 --batch-size 2048 --ubatch-size 2048`.

## Capacidades

- Generación de embeddings de frases y pasajes: vectores densos de 768 dimensiones, normalizados, aptos para similitud coseno o producto escalar.
- Recuperación semántica asimétrica (query-to-document) con plantillas de prefijo diferenciadas.
- Similitud semántica entre textos y clasificación por vecinos más cercanos (kNN) sobre los vectores resultantes.
- Especialización en dominio jurídico francés: discriminación de pasajes de evidencia y recuperación de fragmentos relevantes.
- Integración como componente de recuperación en pipelines RAG (el modelo no genera respuestas; solo recupera).
- Ejecución en CPU o GPU modesta gracias al formato GGUF Q8_0 y al tamaño reducido.
- Generación de texto: no. Tool calling / function calling: no aplica. Capacidades de agente: no. Visión, audio o modo "thinking": no disponibles.
- Capacidades multilingües: no documentadas para este derivado; solo se declara francés.
- Longitud de entrada limitada a 2.048 tokens por pasaje.

## Casos de uso

- Búsqueda semántica en un fondo documental jurídico francés: indexar sentencias, contratos o doctrina como pasajes con el prefijo de documento y recuperar los más similares a una consulta formulada con el prefijo de consulta. El modelo está ajustado específicamente para este par asimétrico.
- Recuperación aumentada (RAG) sobre normativa y jurisprudencia: usar los 768 números del embedding como entrada al índice vectorial y alimentar al generador de respuestas con los pasajes recuperados, reduciendo el coste frente a un reranker de mayor tamaño.
- Discriminación de evidencia en un expediente: comparar un pasaje candidato contra varios fragmentos y seleccionar el que respalda una afirmación, que es exactamente la tarea del conjunto sintético reportado (103/120 top-1).
- Deduplicación y agrupación de documentos legales: calcular la similitud coseno entre vectores normalizados para detectar cláusulas repetidas, versiones de un mismo contrato o resoluciones casi idénticas.
- Enrutado y triaje de consultas: clasificar consultas entrantes por área (laboral, mercantil, civil) mediante kNN sobre los embeddings, sin necesidad de un modelo generativo.
- Verificación de citas: comprobar si un pasaje citado en un escrito se corresponde semánticamente con la fuente original midiendo la similitud entre ambos embeddings.
- Despliegue en entorno local o air-gapped: al ocupar 0,3 GB y funcionar en CPU con llama.cpp, permite búsqueda jurídica en equipos sin GPU o en instalaciones con requisitos de confidencialidad que impiden enviar documentos a la nube.
- Recomendación de plantillas contractuales: indexar un catálogo de plantillas y devolver las más afines a la descripción de la operación descrita por el usuario.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Referencia comparada |
|---|---|---|
| Discriminación de evidencia sintética (120 casos, top-1, inferencia Q8 nativa) | 103/120 | BGE-M3 ajustado previamente: 96/120 |
| MIRACL, subconjunto francés general (top-1) | 58,9 % | no disponible |

Advertencia del propio autor: los conjuntos son sintéticos y pequeños, no establecen fiabilidad jurídica en producción ni superioridad multilingüe general, y el conjunto de test de primera ronda ya se ha consumido como dato de desarrollo para trabajos posteriores, por lo que no sirve como referencia limpia. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. El fichero GGUF Q8_0 ocupa 0,3 GB y el contexto máximo es de 2.048 tokens, por lo que el overhead de activaciones es mínimo.
- Memoria RAM: aproximadamente 0,4-0,8 GB si se ejecuta en CPU, según implementación y batch.
- Cabe en cualquier GPU de consumo: desde GTX 1050/RTX 3050 en adelante sobra capacidad; también en iGPU y en CPU exclusivamente.
- Despliegue documentado: llama.cpp / llama-server con `--embedding --pooling mean --ctx-size 2048 --batch-size 2048 --ubatch-size 2048`.
- Otras opciones (Ollama, vLLM, TGI, text-embeddings-inference): no confirmadas en la información disponible.
- Latencia y throughput: no disponibles.
- Recomendación práctica: al ser un modelo de embeddings, el coste dominante suele ser el número de pasajes a indexar, no la generación; conviene fijar el batch-size a 2.048 como indica la receta para maximizar el aprovechamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Makio64/embeddinggemma-300m-jurilix-gguf | 307,6 M | 2.048 tokens | 768 | Gemma Terms of Use | GGUF Q8_0 |
| google/embeddinggemma-300m (modelo base) | aprox. 300 M | no disponible | no disponible | Gemma Terms of Use | safetensors y otros (no detallado aqui) |
| BGE-M3 (referencia citada por el autor) | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación cuantitativa aportada por el autor es frente a un BGE-M3 ajustado, con 103/120 frente a 96/120 en el conjunto sintético de evidencia. No se dispone de datos de contexto, licencia ni dimensiones de los modelos alternativos en la información proporcionada. El modelo base sí es una alternativa directa si se necesita uso general multilingüe en lugar de especialización jurídica francesa, pero los vectores de este derivado no son intercambiables con los suyos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado evaluaciones de sesgo. El entrenamiento se realizó sobre 2.566 pares sintéticos, sin verificación sobre corpus jurídicos reales.
- Riesgo de falsos positivos en recuperación: un modelo de embeddings no alucina texto, pero puede devolver pasajes semánticamente próximos que no sean jurídicamente pertinentes. La métrica reportada (103/120) procede de un conjunto sintético.
- La evaluación principal se hizo sobre 120 casos y el autor advierte explícitamente de que no establece fiabilidad real en el dominio legal.
- El conjunto de test inicial se ha reutilizado como dato de desarrollo, por lo que las cifras publicadas no constituyen una validación limpia e independiente.
- Límite de contexto de 2.048 tokens: documentos más largos requieren troceado previo, lo que afecta a la calidad de la recuperación en pasajes con dependencias lejanas.
- Idioma: solo se declara francés. No hay evidencia de rendimiento en castellano ni en otros idiomas para este derivado.
- Restricciones de licencia: se aplican las Gemma Terms of Use, incluida la sección 3.2 de restricciones de uso, más la PROHIBITED_USE_POLICY.txt y las obligaciones de NOTICE.txt. Es imprescindible revisarlas antes de cualquier uso comercial o redistribución, que queda sujeta a esas condiciones.
- Derivado no oficial: no es un lanzamiento de Google ni cuenta con su respaldo o endoso.
- Incompatibilidad de índices: al haberse entrenado ambas cabezas de proyección, los vectores no son comparables con los del modelo base ni con los de otros modelos de embeddings. Cualquier índice existente debe reconstruirse por completo.
- Los prefijos de consulta y documento son obligatorios según la receta documentada; no se describe el comportamiento sin ellos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de la comunidad.
- Modelo de solo recuperación: no puede generar, resumir ni redactar texto; requiere emparejarlo con un modelo generativo si se necesita una respuesta final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Makio64/embeddinggemma-300m-jurilix-gguf
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Gemma Terms of Use: referenciadas en la model card como LICENSE.txt del repositorio (no se proporciona URL directa)
- PROHIBITED_USE_POLICY.txt y NOTICE.txt: incluidos en el repositorio como ficheros adjuntos (no se proporciona URL directa)
- Papers, blogs o demos adicionales: no disponibles. Los resultados de la búsqueda web no contenían enlaces relevantes al modelo.
