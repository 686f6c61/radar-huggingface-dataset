# sajalmadan09/bert-tiny-native-cpp

## Resumen

`sajalmadan09/bert-tiny-native-cpp` es un port nativo en C++ del encoder `prajjwal1/bert-tiny`, publicado por sajalmadan09 bajo la etiqueta Sajal Labs. No es un modelo nuevo: los pesos, la arquitectura y el preentrenamiento son exactamente los de bert-tiny, un encoder BERT compacto de 4.385.920 parámetros (2 capas, hidden=128, 2 cabezas de atención, intermedio=512, vocabulario WordPiece de 30.522 tokens). El valor añadido del repositorio es la reimplementación desde cero del encoder y del tokenizador WordPiece, sin PyTorch, sin la librería `transformers` y sin Python en tiempo de inferencia.

El problema que aborda es el coste de arranque en frío de los despliegues Python habituales para extracción de características. El autor mide la invocación completa (spawn del proceso, texto de entrada, predicción, salida del proceso, reloj externo) en una CPU Apple M4 y reporta 11,37 ms de mediana para el runtime nativo, frente a 95,72 ms de ONNX Runtime emparejado con la librería ligera `tokenizers` (8,4x más lento) y 4.973,91 ms de PyTorch + transformers (437,6x más lento). La comparación principal del autor es deliberadamente contra el mejor caso de despliegue Python ya optimizado, no contra la variante más lenta.

Es relevante ahora como pieza de infraestructura más que como modelo: demuestra un camino de despliegue sin dependencias de Python para tareas de embeddings y clasificación, con validación explícita de equivalencia numérica frente a la implementación original. El repositorio incluye los pesos originales en safetensors, un export ONNX con pesos externalizados y el formato binario propio del runtime nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder (transformer bidireccional denso), 2 capas, hidden=128, 2 cabezas, intermediate=512 |
| Parametros totales | 4.385.920 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (max_position_embeddings estándar de BERT; no declarado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos fp32 (no hay int8, int4 ni GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (pesos base de prajjwal1/bert-tiny y código C++ del port) |
| Formato de pesos | safetensors, ONNX (`model.onnx` + `model.onnx.data`), binarios propios del runtime Sajal (`word_embeddings.bin`, `layer{i}_*.bin`, `pooler_*.bin`, etc.) |
| Vocabulario | 30.522 tokens WordPiece (vocabulario de bert-base-uncased) |
| Precision | fp32 |
| Modelo base | prajjwal1/bert-tiny (relación: finetune declarada en la model card, aunque el contenido indica que los pesos son idénticos) |
| Pipeline | feature-extraction |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 descargas / 1 like (en el momento de la consulta) |
| Fecha de creacion | 2026-09-15 (metadato del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la de BERT-tiny, descrita en Turc et al. 2019 ("Well-Read Students Learn Better"): un encoder transformer bidireccional con 2 capas, dimensión oculta de 128, 2 cabezas de atención y capa intermedia de 512, con embeddings de palabra, posición y tipo de token más una capa de layer norm. El vocabulario WordPiece es el de bert-base-uncased. No es un modelo generativo: no tiene decodificador ni cabeza de lenguaje, y sus salidas son estados ocultos por token más la representación pooled del token `[CLS]`. El preentrenamiento original se realizó por destilación desde BERT-base como profesor, y el modelo se popularizó en el ecosistema Hugging Face a través de Bhargava et al. 2021 ("Generalization in NLI"). No hay RLHF ni DPO, algo que no aplica a un encoder de este tipo.

La contribución de Sajal Labs es de ingeniería, no de entrenamiento: no se ha reentrenado ni ajustado nada, y los pesos son los originales. La innovación declarada es la reimplementación nativa del encoder y del tokenizador WordPiece en C++, sin dependencias de Python en inferencia, validada contra la implementación de referencia. El tokenizador reproduce IDs idénticos byte a byte en 17 de 17 frases de prueba reales, incluyendo contracciones ("don't"), guiones ("COVID-19"), una dirección de correo y una palabra fuera de vocabulario que fuerza una división en 11 subpalabras. El encoder presenta un error absoluto máximo de 9,54e-06 en estados ocultos y 2,19e-06 en la salida pooled de `[CLS]`, con similitud coseno ~1,0 sobre 10 frases de 4 a 25 tokens; el autor lo atribuye a no asociatividad de la coma flotante entre dos implementaciones independientes.

## Capacidades

- Extracción de características y embeddings contextuales por token para texto en inglés.
- Obtención de la representación pooled de `[CLS]`, utilizable como embedding de frase.
- Búsqueda semántica y cálculo de similitud entre frases mediante similitud coseno sobre embeddings.
- Tokenización WordPiece determinista y verificada como idéntica a `BertTokenizerFast`.
- Base para ajuste fino con cabezales de clasificación (sentimiento, intención, NLI, spam, etc.).
- Inferencia nativa desde línea de comandos con el runtime Sajal, sin Python: `sajal run <directorio> "texto"`.
- Ejecución vía ONNX Runtime y vía PyTorch/transformers con los mismos pesos.
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling ni uso como agente.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- No es multilingüe: solo inglés.

## Casos de uso

- Búsqueda semántica y recuperación de documentos a pequeña escala: los embeddings pooled de `[CLS]` permiten indexar y recuperar pasajes por similitud, con un coste de almacenamiento mínimo (4,4 M de parámetros) para corpus pequeños o prototipos.
- Clasificación de texto con cabezal ligero: ajustando un clasificador lineal sobre las representaciones del encoder se pueden construir detectores de spam, sentimiento o intención que caben en CPU y se ejecutan sin Python.
- Deduplicación y detección de near-duplicates: comparar embeddings de `[CLS]` entre documentos permite agrupar textos casi idénticos en pipelines de limpieza de datos, donde la latencia por elemento importa más que la calidad semántica fina.
- Enrutado de intenciones en asistentes conversacionales: usar el encoder como clasificador previo para decidir qué subsistema atiende una consulta, aprovechando el arranque en frío de 11,37 ms frente a los ~4,97 s de PyTorch + transformers.
- Inferencia en el edge y en sistemas embebidos: al ocupar unos 17,5 MB en fp32 y no requerir Python ni PyTorch, es desplegable en dispositivos con recursos muy limitados o en contenedores mínimos.
- Moderación o filtrado previo de contenido en línea: un clasificador entrenado sobre estas representaciones puede descartar tráfico trivial antes de llamar a modelos mayores, reduciendo coste agregado.
- Validación de equivalencia en CI/CD: los binarios nativos y el tokenizador verificable permiten usar el repositorio como referencia de regresión numérica al portar modelos a otros runtimes o comprobar que un export ONNX no se ha degradado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, GLUE, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta validación de equivalencia numérica y mediciones de latencia.

Validación de equivalencia frente a la implementación original:

| Prueba | Resultado |
|---|---|
| Tokenizador (17 frases reales) | IDs de token idénticos byte a byte (17/17) |
| Encoder, estados ocultos | error absoluto máximo 9,54e-06 |
| Encoder, salida pooled de `[CLS]` | error absoluto máximo 2,19e-06 |
| Similitud coseno | ~1,0 (10 frases de 4 a 25 tokens) |

Latencia de invocación completa en frío (proceso arrancado, texto de entrada, predicción, salida del proceso; reloj externo; mediana, CPU Apple M4):

| Implementacion | Invocacion en frio p50 |
|---|---:|
| Nativo C++ (runtime Sajal) | 11,37 ms |
| ONNX Runtime + tokenizer ligero (`tokenizers`) | 95,72 ms (8,4x más lento) |
| ONNX Runtime + tokenizer de 🤗 transformers | 2495,61 ms (219,6x más lento) |
| PyTorch + 🤗 transformers | 4973,91 ms (437,6x más lento) |

El autor advierte de que la ventaja del runtime nativo en bucle caliente (warm loop) no es incondicional: depende de la anchura del modelo (`hidden_size`), con un cruce medido en torno a `hidden≈250` en su hardware. Este modelo, con `hidden=128`, queda por debajo de ese umbral y mantiene ventaja también en caliente, pero se trata de una propiedad de su tamaño, no de una afirmación general. No se publican cifras de throughput.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 17,5 MB para los pesos en fp32 (4.385.920 parámetros × 4 bytes), más activaciones mínimas por la anchura reducida del modelo.
- GPU recomendadas: ninguna en particular; cualquier GPU sirve y la CPU es suficiente. Los datos publicados corresponden a una CPU Apple M4.
- Cabe en cualquier GPU de consumo e incluso en placas integradas, Raspberry Pi y entornos sin acelerador.
- Opciones de despliegue validadas por el autor: runtime nativo Sajal en C++ (sin Python), ONNX Runtime (requiere `model.onnx` y `model.onnx.data` juntos) y PyTorch + transformers con los pesos del modelo base.
- vLLM y TGI no aplican a este caso de uso: son servidores orientados a modelos generativos y este es un encoder de extracción de características.
- llama.cpp y Ollama: no se distribuyen pesos GGUF ni se ha validado la conversión; requeriría un proceso manual no cubierto por el autor.
- Latencia medida: 11,37 ms de mediana en invocación en frío con el runtime nativo en CPU Apple M4, frente a 95,72 ms (ONNX Runtime + tokenizer ligero) y 4.973,91 ms (PyTorch + transformers).
- Throughput: no disponible.

## Comparativa con modelos similares

Los datos de arquitectura de los modelos alternativos proceden de sus repositorios públicos y no han sido verificados en la búsqueda asociada a esta ficha; el rendimiento de tareas no está disponible para ninguno de ellos en la información consultada.

| Modelo | Parametros | Capas | Hidden | Contexto | Licencia | Formatos |
|---|---|---|---|---|---|---|
| bert-tiny-native-cpp | 4,39 M | 2 | 128 | 512 | MIT | safetensors, ONNX, binario nativo propio |
| prajjwal1/bert-tiny | 4,39 M | 2 | 128 | 512 | MIT | safetensors / PyTorch |
| prajjwal1/bert-mini | 11,2 M | 4 | 256 | 512 | MIT | safetensors / PyTorch |
| prajjwal1/bert-small | 28,8 M | 4 | 512 | 512 | MIT | safetensors / PyTorch |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 6 | 384 | 256 | Apache-2.0 | safetensors / PyTorch |

La diferencia relevante frente a las alternativas no es de calidad, sino de empaquetado: bert-tiny-native-cpp es el único de la lista que ofrece un runtime de inferencia sin Python y sin PyTorch, junto con binarios en formato propio. Frente a all-MiniLM-L6-v2, que está entrenado específicamente para similitud de frases y rinde mejor en recuperación semántica, este repositorio no aporta ninguna mejora de representación: los pesos son los de bert-tiny sin ajustar. Para calidad de embeddings en inglés, las alternativas ajustadas para similitud son preferibles; para latencia de arranque y dependencias mínimas, este port es la opción específica.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona de forma multi-paso y no soporta tool calling ni flujos de agentes.
- Los pesos son idénticos a `prajjwal1/bert-tiny` sin ningún ajuste posterior; como encoder base sin cabeza de tarea, su utilidad directa se limita a la extracción de características.
- Calidad limitada por el tamaño: 2 capas y 128 dimensiones ocultas implican una capacidad representacional muy inferior a la de encoders de 6 a 12 capas; no es adecuado para tareas que exijan comprensión semántica fina.
- Solo inglés: no hay soporte multilingüe y el vocabulario WordPiece es el de bert-base-uncased.
- Longitud de contexto limitada a 512 tokens, con truncado en textos más largos.
- Sesgos heredados del preentrenamiento de bert-base-uncased (BooksCorpus y Wikipedia en inglés), con los sesgos de género, etnia y dominio propios de ese corpus.
- Riesgo de alucinación no aplica en sentido generativo, pero la similitud coseno sobre representaciones débiles puede producir falsos positivos en recuperación, deduplicación y clustering.
- Licencia MIT tanto en los pesos base como en el código del port: permite uso comercial y modificación, pero el autor solicita explícitamente citar Turc et al. 2019 y Bhargava et al. 2021.
- El repositorio registra 0 descargas y 1 like, por lo que no existe validación independiente de la comunidad sobre el port.
- Los benchmarks publicados proceden de una única máquina (Apple M4, CPU) y de una sola petición; no hay mediciones de throughput, de GPU ni de concurrencia.
- La ventaja del runtime nativo en bucle caliente está condicionada al tamaño del modelo: el propio autor documenta un cruce alrededor de `hidden≈250`, por lo que la conclusión no se extrapola a modelos más anchos.
- El número de ONNX Runtime depende fuertemente de la librería de tokenización elegida (la diferencia entre `tokenizers` y `transformers` es de ~25x según el autor), lo que convierte la comparación en sensible a la configuración del despliegue.
- Los metadatos del repositorio indican una fecha de creación de 2026-09-15, posterior a la fecha de consulta, lo que sugiere inconsistencia en los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sajalmadan09/bert-tiny-native-cpp
- Modelo base: https://huggingface.co/prajjwal1/bert-tiny
- Repositorio Sajal Labs: https://github.com/Sajalmadan09/sajal-labs
- Experimento exp11 (transformer preentrenado real): https://github.com/Sajalmadan09/sajal-labs/tree/main/research/experiments/exp11-real-pretrained-transformer
- Experimento exp12 (latencia en caliente, anchura y profundidad): https://github.com/Sajalmadan09/sajal-labs/tree/main/research/experiments/exp12-warm-latency-width-depth
- Experimento exp13 (umbral de anchura): https://github.com/Sajalmadan09/sajal-labs/tree/main/research/experiments/exp13-width-threshold
- Experimento exp14 (WordPiece nativo): https://github.com/Sajalmadan09/sajal-labs/tree/main/research/experiments/exp14-wordpiece-native
- Paper de BERT-tiny (Turc et al. 2019): https://arxiv.org/abs/1908.08962
- Paper de Generalization in NLI (Bhargava et al. 2021): https://arxiv.org/abs/2110.01518
