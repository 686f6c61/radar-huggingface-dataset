# Kannaka/kannaka-encoder

## Resumen

Kannaka-encoder es un modelo de embeddings de frases publicado por Kannaka Labs bajo el identificador `Kannaka/kannaka-encoder`. Se trata de una conversión a safetensors en fp16 de los pesos originales de `sentence-transformers/all-MiniLM-L6-v2`, sin ningún tipo de entrenamiento ni ajuste adicional en su revisión `v0`. Su función es servir como encoder de texto empaquetado y verificado por hash para el sistema de memoria `kannaka-memory`, de modo que este pueda generar embeddings de forma nativa sin depender de Ollama ni de ningún servicio externo.

El modelo hereda la arquitectura BERT de 6 capas, 384 dimensiones ocultas y 12 cabezas de atención, con 22,7 millones de parámetros. Produce vectores de 384 dimensiones mediante mean pooling sobre los tokens y normalización L2, con una ventana efectiva de 255 tokens más el token `[SEP]`. La activación es GELU con aproximación tanh. El pooling, la ventana y la activación se han elegido deliberadamente para replicar el comportamiento de `all-minilm` en Ollama, de forma que un almacén de vectores generado con Ollama pueda leerse con este encoder.

Su relevancia es acotada pero clara: no es un modelo nuevo ni mejorado, sino una pieza de infraestructura reproducible. La model card documenta una comparación medida contra Ollama 0.34.4 sobre 200 textos, con cosenos mínimos de 0,999937 y medianas de 0,999986 frente a la ejecución en GPU de Ollama, y una coincidencia de vecino más cercano de 198 sobre 198 casos. La revisión `v0` sirve como línea base frente a la que se medirán futuras revisiones con ediciones en el espacio de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), 6 capas, 384 dimensiones ocultas, 12 cabezas de atencion |
| Parametros totales | 22.565.376 (22,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 255 tokens mas `[SEP]` (ventana efectiva documentada) |
| Tipos de cuantizacion | fp16 (pesos publicados); se probo int8 y se descarto (coseno mediano 0,992) |
| Idiomas soportados | en (ingles); el tokenizador WordPiece presenta divergencias en coreano y devanagari |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, fp16, 45 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT con 6 capas, 384 dimensiones ocultas y 12 cabezas de atencion, correspondiente al modelo `sentence-transformers/all-MiniLM-L6-v2`. La salida es un vector de 384 dimensiones obtenido por mean pooling sobre los tokens y normalizado en L2. La activacion es GELU con aproximacion tanh. La ventana de entrada se limita a los primeros 255 tokens mas el token `[SEP]`, y estos parametros de pooling, ventana y activacion se han fijado para coincidir con el comportamiento de `all-minilm` en Ollama.

No hubo entrenamiento ni ajuste alguno en la revision `v0`: la model card indica explicitamente que son los pesos originales del modelo base convertidos a fp16 safetensors. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO, ya que el autor no realizo ninguna de estas etapas. La innovacion tecnica no reside en el modelo en si, sino en el empaquetado: un unico fichero `model.safetensors` verificado por hash (`SHA256SUMS`), acompanado de `vocab.txt` y `tokenizer.json` en su version original. La model card advierte que el cargador debe desactivar el padding y el truncado a 128 tokens que trae por defecto el tokenizador.

## Capacidades

- Generacion de embeddings de frases y parrafos: vectores densos de 384 dimensiones, normalizados en L2, aptos para similitud coseno y busqueda por vecino mas cercano.
- Similitud semantica entre textos (`sentence-similarity`): recuperacion de documentos, deduplicacion y agrupamiento semantico.
- Memoria y recuperacion en sistemas de agentes: encoder nativo del sistema `kannaka-memory` para almacenar y recuperar recuerdos sin servicios externos.
- Compatibilidad con almacenes generados por Ollama `all-minilm`: los vectores son practicamente identicos, lo que permite migrar o compartir un almacen entre ambos entornos.
- Ejecucion nativa en Rust: la model card menciona que el encoder se ejecuta de forma nativa en Rust dentro de `kannaka-memory`.
- Capacidades multilingues: limitadas. El modelo esta etiquetado solo para ingles y el tokenizador WordPiece diverge en coreano y devanagari.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, vision ni audio: es exclusivamente un encoder de texto.

## Casos de uso

- Recuperacion aumentada por generacion (RAG) en ingles: el modelo genera embeddings de fragmentos de documentos para indexarlos en una base vectorial y recuperar los mas relevantes ante una consulta. Su ventana de 255 tokens lo hace adecuado para fragmentos cortos y su tamano de 45 MB permite indexar grandes volumenes con poco coste de almacenamiento.
- Memoria persistente de agentes: integrado en `kannaka-memory`, permite que un agente almacene observaciones y recupere recuerdos por similitud semantica sin depender de Ollama ni de una API externa, lo que simplifica el despliegue en entornos aislados.
- Deduplicacion y agrupamiento de textos: al producir vectores normalizados y comparables por coseno, sirve para detectar documentos casi duplicados o agrupar tickets, correos o articulos por tematica en pipelines de procesamiento por lotes.
- Busqueda semantica en aplicaciones locales: al caber en CPU y ocupar 45 MB en fp16, puede embeberse en aplicaciones de escritorio o moviles que necesiten busqueda por significado sin conexion.
- Migracion desde Ollama: un equipo que ya tenga un almacen vectorial generado con `all-minilm` en Ollama puede leerlo con este encoder gracias a la alta concordancia medida (coseno mediano 0,999986), lo que facilita sustituir el servicio por una dependencia nativa.
- Clasificacion y filtrado por similitud: comparar la similitud entre una consulta y un conjunto de etiquetas o plantillas predefinidas para enrutar peticiones, moderar contenido o asignar categorias sin entrenar un clasificador adicional.
- Linea base para experimentos: al ser una copia exacta y verificada del modelo original, sirve como referencia reproducible contra la que medir futuras revisiones con ediciones en el espacio de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB u otros) en la informacion disponible. La model card unicamente reporta una comparacion de concordancia con Ollama `all-minilm` sobre 200 textos, medida el 2026-11-14 en un portatil Windows:

| Comparacion | Coseno minimo | Coseno mediano | Vecino mas cercano identico |
|---|---|---|---|
| Ollama CPU vs Ollama GPU (ruido propio de Ollama) | 0,999936 | 0,999986 | 198 / 198 |
| Este encoder vs Ollama GPU | 0,999937 | 0,999986 | 198 / 198 |
| Este encoder vs Ollama CPU | 0,9999986 | 0,9999995 | 198 / 198 |

El orden de los 5 vecinos mas cercanos coincide en 188 a 194 de los 198 casos, y todas las diferencias son intercambios entre valores casi empatados. Dos de los 200 textos quedan excluidos por no coincidir: un texto en coreano (coseno 0,659) y uno en devanagari (0,964), debido a diferencias de tokenizacion WordPiece entre llama.cpp y el tokenizador de Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (45 MB de pesos mas activaciones y overhead del runtime); en CPU el consumo de memoria es marginal.
- GPU recomendadas: no se requieren. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) puede ejecutarlo con holgura, pero el modelo esta disenado para ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en dispositivos de gama baja; tambien cabe en CPU y en entornos embebidos.
- Opciones de despliegue: ejecucion nativa en Rust dentro de `kannaka-memory` (la via documentada por el autor); al ser safetensors compatible con el modelo base, tambien puede cargarse con `sentence-transformers`, `transformers`, `Optimum` o `Text Embeddings Inference` (TGI). No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles. La model card no publica mediciones de latencia ni de throughput; solo indica que la comparacion se realizo en un portatil Windows con Ollama 0.34.4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Kannaka-encoder (`v0`) | 22,7 M | 255 tokens + `[SEP]` | en | Apache-2.0 | Copia fp16 de all-MiniLM-L6-v2; sin benchmarks publicados |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | en (multilingue limitado) | Apache-2.0 | Modelo base original; ampliamente usado en RAG y similitud semantica |
| Ollama `all-minilm` | 22,7 M | 256 tokens | en | Apache-2.0 (heredada) | Misma arquitectura empaquetada para Ollama; concordancia medida con Kannaka-encoder superior a 0,9999 |
| sentence-transformers/paraphrase-MiniLM-L6-v2 | 22,7 M | 256 tokens | en | Apache-2.0 | Variante afinada para parafrasis; no comparable en rendimiento por falta de datos en esta ficha |

La comparativa se limita a modelos de la misma familia y tamano. No se dispone de datos de rendimiento estandar que permitan comparar con alternativas de mayor tamano como `bge-small-en-v1.5` o `e5-small-v2`; no disponible.

## Limitaciones y advertencias

- La revision `v0` no aporta ninguna mejora sobre `all-MiniLM-L6-v2`: es una conversion de formato, no un modelo afinado ni entrenado.
- Ventana de contexto muy corta (255 tokens mas `[SEP]`): los textos largos se truncan y pierden informacion; no es adecuado para documentos completos sin fragmentacion previa.
- Soporte multilingue deficiente: etiquetado solo para ingles y con divergencias documentadas en coreano (coseno 0,659) y devanagari (0,964) frente a Ollama por diferencias de tokenizacion.
- Riesgo de alucinacion: no aplica en sentido estricto, ya que el modelo no genera texto; el riesgo se traslada a los sistemas que consumen sus embeddings, que pueden recuperar fragmentos poco relevantes si la similitud coseno no refleja la intencion de la consulta.
- Sesgos: no se documentan evaluaciones de sesgo. Al heredar los pesos de all-MiniLM-L6-v2, arrastra los sesgos presentes en los datos de entrenamiento del modelo original, no analizados en esta ficha.
- La cuantizacion int8 fue probada y rechazada por el autor (coseno mediano 0,992): no se recomienda su uso si se necesita compatibilidad con almacenes existentes.
- La validacion se realizo sobre 200 textos, una sola maquina y una unica version de Ollama: el autor advierte que aun no se ha comprobado contra almacenes reales.
- El tokenizador incluido trae por defecto padding y truncado a 128 tokens; un cargador debe desactivarlos explicitamente para no alterar el comportamiento esperado.
- Licencia Apache-2.0, permisiva para uso comercial, pero el credito del modelo corresponde a los autores originales de all-MiniLM-L6-v2.
- Las futuras revisiones con ediciones en el espacio de pesos no seran compatibles con los vectores de `v0`, segun la hoja de ruta del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kannaka/kannaka-encoder
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio kannaka-memory: https://github.com/kannaka-labs/kannaka-memory
- Sondas y tablas completas de la comparacion: `spikes/native-embed/` dentro del repositorio kannaka-memory
- Ollama: https://ollama.com
