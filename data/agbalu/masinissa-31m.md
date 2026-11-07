# agbalu/Masinissa-31M

## Resumen

Masinissa-31M es un modelo de lenguaje enmascarado (masked language model, MLM) bidireccional de 31,1 millones de parámetros desarrollado por agbalu (AƔBALU), un proyecto centrado en el procesamiento del lenguaje natural para el cabileño (taqbaylit, código `kab_Latn`), una lengua bereber de la familia amazigh hablada principalmente en la región de Cabilia, Argelia. El modelo se ha entrenado desde cero sobre 3,04 millones de frases deduplicadas y normalizadas ortográficamente, y está diseñado para producir representaciones contextuales densas de alta calidad en una lengua de bajos recursos.

El problema que aborda es la escasez de encoders específicos para cabileño: la mayoría de los modelos multilingües disponibles (XLM-R, mBERT, Serengeti, mmBERT) dedican una fracción mínima de su capacidad a esta lengua y rinden por debajo de lo esperado en tareas morfológicas y sintácticas. Masinissa-31M, pese a su tamaño reducido, supera a alternativas de 110M a 278M de parámetros en el benchmark propio del autor (KabEncBench), con un Elo de 1.708,4 frente a los 1.200,3 de Serengeti-E250 o los 1.000,0 de XLM-R base.

Es relevante ahora por dos motivos: su reducido coste computacional lo hace apto para despliegue en CPU, móvil y dispositivos de borde, y su licencia Apache 2.0 permite uso comercial sin restricciones. El autor ha publicado además un sucesor de mayor capacidad (Masinissa-73M), pero mantiene este modelo como la opción recomendada para escenarios con latencia crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (masked language model) |
| Parametros totales | 31.123.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a INT8/FP16 posible via herramientas estandar, no documentada por el autor) |
| Idiomas soportados | cabileño (taqbaylit, `kab_Latn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Masinissa-31M es un encoder transformer bidireccional entrenado con objetivo de modelado de lenguaje enmascarado (MLM), al estilo de BERT. El autor no detalla en la informacion disponible el numero exacto de capas, dimensiones ocultas ni cabezas de atencion, aunque el sucesor Masinissa-73M se describe con 20 capas y 73,3M de parametros, lo que sugiere una familia de encoders escalados con la misma receta. El modelo se entreno desde cero (no es un fine-tuning de un multilingue existente) sobre 3,04 millones de frases en cabileño, deduplicadas y sometidas a normalizacion ortografica.

Un aspecto tecnico destacable es la atencion explicita a la ortografia del cabileño: el autor evalua la robustez del encoder frente a sustituciones de homoglifos habituales en corpus web (la epsilon griega `ε` U+03B5 por la latina `ɛ` U+025B, y la gamma `γ` por `ɣ`), y reporta una caida de solo 3,09 puntos porcentuales en precision de POS bajo entrada corrupta. Tambien se documenta un estudio de tokenizadores (diez vocabularios Unigram entre 8k y 32k, con dos brazos de inicializacion), lo que indica una busqueda sistematica del tokenizador optimo para la lengua. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un encoder MLM.

## Capacidades

- Prediccion de tokens enmascarados (`fill-mask`): inferencia directa sobre spans con el token `[MASK]`.
- Extraccion de representaciones densas a nivel de token y de frase para clasificacion de secuencias, NER, recuperacion de informacion y clustering.
- Etiquetado morfosintactico (POS tagging): 90,51% de precision sobre tokens superficiales en `UD_Kabyle-ADPT` con solo una sonda lineal sobre el encoder congelado.
- Robustez ortografica: mantiene 87,42% de precision POS con entrada corrupta por homoglifos.
- Inicializacion para fine-tuning en tareas downstream (el autor publica derivados como `Belaid-31M` para restauracion de puntuacion y `Masinissa-Sentiment` para analisis de sentimiento).
- Capacidades multilingues: limitadas al cabileño; no se documenta transferencia a otras lenguas bereberes ni al arabe o frances.
- No soporta generacion autoregresiva de texto, dialogo abierto ni traduccion automatica (explicitamente fuera de alcance segun el autor).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no aplica a un encoder MLM).

## Casos de uso

- Etiquetado POS y analisis morfosintactico en produccion: con una sonda lineal sobre el encoder congelado se obtiene 90,51% de precision en `UD_Kabyle-ADPT`, suficiente para anotadores linguisticos, corpus academicos y herramientas de ensenanza del cabileño.
- Reconocimiento de entidades nombradas (NER): el modelo alcanza 87,74% de Micro-F1 en la tarea NER de KabEncBench, por lo que puede usarse como backbone para extraer toponimos, antroponimos y organizaciones en textos cabileños.
- Clasificacion de topicos y moderacion de contenido: con 59,28% en SIB-200 (topic classification), sirve para categorizar articulos, posts y comentarios en plataformas digitales en cabileño.
- Analisis de sentimiento en redes sociales: 92,06% en la tarea de sentimiento de KabEncBench, adecuado para monitorizacion de opinion en comunidades cabileñas.
- Recuperacion de informacion y busqueda semantica: las representaciones densas permiten construir indices vectoriales para buscadores en cabileño, un caso practico para bibliotecas digitales y archivos culturales.
- Restauracion de puntuacion y normalizacion de texto: el derivado `Belaid-31M` del mismo autor demuestra el uso del encoder como base para preprocesar transcripciones y corpus orales antes de su publicacion.
- Despliegue en dispositivos de borde: con 31M de parametros y 0,1 GB de repo, cabe en moviles, Raspberry Pi y entornos CPU con latencia baja, ideal para aplicaciones de diccionario o corrector ortografico sin conexion.
- Deteccion de parafrasis y similitud textual: 58,78% en TaPaCo dentro de KabEncBench, util para deduplicacion de corpus y agrupacion de variantes ortograficas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) en `UD_Kabyle-ADPT` test (845 frases, 10.181 palabras, 8.563 tokens superficiales):

| Modelo / baseline | Palabras gold (limpio) | Tokens superficiales (limpio) | Palabras gold (corrupto) | Tokens superficiales (corrupto) |
|---|---|---|---|---|
| Masinissa-31M + sonda lineal | 90,39% | 90,51% | 87,10% | 87,42% |
| Baseline etiqueta mas frecuente | 84,14% | 83,42% | 80,23% | 79,52% |
| `boffire/kabyle-pos-v2` | 56,50% | 63,69% | 55,10% | 62,35% |
| Proyeccion de lexico | 26,65% | 27,67% | 23,15% | 24,15% |

Benchmark multitarea KabEncBench (Track A, sonda congelada normalizada por escala; Elo Bradley-Terry con 2.000 bootstraps pareados, ancla XLM-R base = 1.000):

| Puesto | Modelo | Parametros | Elo (IC 95%) | Tier |
|:---:|---|:---:|:---:|:---:|
| 1 | `agbalu/Masinissa-73M` | 73M | 1.953,7 [1.534,7; 3.379,1] | Tier 1 |
| 2 | `agbalu/Masinissa-31M` | 31M | 1.708,4 [1.371,1; 2.886,2] | Tier 2 |
| 3 | `UBC-NLP/serengeti-E250` | 278M | 1.200,3 [953,6; 1.480,1] | Tier 3 |
| 4 | `Davlan/afro-xlmr-base-76L_script` | 278M | 1.151,6 [919,5; 1.451,0] | Tier 3 |
| 5 | `UBC-NLP/serengeti-E110` | 110M | 1.148,2 [918,5; 1.421,2] | Tier 3 |
| 6 | `jhu-clsp/mmBERT-base` | 278M | 1.141,7 [906,4; 1.435,3] | Tier 3 |
| 7 | `jhu-clsp/mmBERT-small` | 135M | 1.039,1 [804,2; 1.282,5] | Tier 3 |
| 8 | `google-bert/bert-base-multilingual-cased` | 178M | 1.012,6 [780,9; 1.266,8] | Tier 4 |
| 9 | `FacebookAI/xlm-roberta-base` (ancla) | 278M | 1.000,0 [1.000,0; 1.000,0] | Tier 4 |

Desglose por tarea (%):

| Modelo | UPOS (sintaxis) | Aspecto (morfo) | Micro-F1 (NER) | Sentimiento | SIB-200 (topico) | Puntuacion | TaPaCo (parafrasis) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Masinissa-73M | 80,59 | 57,91 | 88,24 | 93,83 | 64,87 | 55,42 | 64,38 |
| Masinissa-31M | 78,88 | 54,19 | 87,74 | 92,06 | 59,28 | 52,21 | 58,78 |
| serengeti-E250 | 76,98 | 49,13 | 83,98 | 85,33 | 43,72 | 45,54 | 42,55 |
| serengeti-E110 | 76,24 | 48,83 | 84,91 | 85,65 | 39,64 | 43,11 | 43,86 |
| afro-xlmr-base | 75,32 | 47,93 | 83,04 | 85,75 | 38,41 | 38,56 | 48,54 |
| mmBERT-base | 75,52 | 48,44 | 84,01 | 85,64 | 37,96 | 39,98 | 48,63 |
| xlm-roberta-base | 75,44 | 44,52 | 79,71 | 84,75 | 38,21 | 39,12 | 42,13 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (31M de parametros, ~125 MB de pesos); ~65 MB en FP16 y ~32 MB en INT8, aunque las cuantizaciones no estan documentadas oficialmente por el autor.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es sobredimensionado para una RTX 4090 o A100, que lo ejecutarian con holgura y permitirian lotes grandes. Una GTX 1650 o una T4 son mas que suficientes.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con al menos 1 GB de VRAM, e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` con `AutoModelForMaskedLM` y `trust_remote_code=True` (metodo documentado por el autor); al ser un encoder MLM estandar, es compatible con `optimum`/ONNX Runtime y con `text-embeddings-inference` para extraccion de features. No se documenta soporte explicito en vLLM, llama.cpp ni Ollama (herramientas orientadas a generacion autoregresiva).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por tamano, se espera inferencia en decenas de milisegundos por frase en CPU moderna y por debajo de 10 ms en GPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Elo KabEncBench | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Masinissa-31M | 31M | no disponible | 1.708,4 | Apache 2.0 | Hugging Face |
| Masinissa-73M | 73M | no disponible | 1.953,7 | no disponible | Hugging Face |
| Serengeti-E250 | 278M | no disponible | 1.200,3 | no disponible | Hugging Face |
| Afro-XLM-R base | 278M | 512 tokens (estandar XLM-R) | 1.151,6 | no disponible | Hugging Face |
| XLM-R base | 278M | 512 tokens | 1.000,0 (ancla) | MIT | Hugging Face |

Masinissa-31M ofrece el mejor rendimiento por parametro de la comparativa: con 31M supera en Elo a modelos de 110M y 278M entrenados sobre corpus multilingues masivos. La contrapartida es su especializacion: solo cubre cabileño, mientras que Serengeti, Afro-XLM-R y XLM-R cubren decenas o cientos de lenguas africanas y del mundo. Para tareas fuera del cabileño, esos modelos multilingues siguen siendo la opcion.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en cabileño: no se ha evaluado su rendimiento en otras lenguas bereberes (tamazight, tachelhit, tarifit) ni en arabe o frances, lenguas habituales en el contexto argelino.
- No apto para generacion de texto, dialogo abierto ni traduccion automatica; el autor lo declara explicitamente fuera de alcance.
- Riesgo de alucinacion: al ser un modelo MLM, la prediccion de tokens enmascarados puede producir candidatos plausibles pero incorrectos, especialmente en dominios especializados o con ortografia no normalizada.
- Sesgos: el corpus de 3,04M de frases proviene de fuentes web no detalladas, por lo que puede arrastrar sesgos de dominio, genero y registro. No se documenta ninguna evaluacion de sesgo.
- Limitacion de contexto: no se publica la longitud maxima de secuencia; en encoders de este tamano suele ser 512 tokens, pero es un dato no confirmado.
- Robustez ortografica parcial: aunque resiste homoglifos comunes (3,09 puntos de caida), otras variantes ortograficas del cabileño (uso de `ṭ`, `ḍ`, `ẓ`, convenciones de escritura) no se han evaluado.
- Dependencia de `trust_remote_code=True`: el modelo usa codigo personalizado, lo que implica revisar el repositorio antes de desplegarlo en entornos de produccion con requisitos de seguridad estrictos.
- Resultados no verificados de forma independiente: los benchmarks son declarados por el autor y el campo `verified` es `false` en el model-index.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion; no impone restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Masinissa-31M
- Sucesor de mayor capacidad: https://huggingface.co/agbalu/Masinissa-73M
- Derivado para restauracion de puntuacion: https://huggingface.co/agbalu/Belaid-31M
- Derivado para analisis de sentimiento: https://huggingface.co/agbalu/Masinissa-Sentiment
- Perfil del autor (AGBALU): https://huggingface.co/agbalu
- Modelos con etiqueta `masinissa`: https://huggingface.co/models?other=masinissa
- Baseline externo de POS para cabileño: https://huggingface.co/boffire/kabyle-pos-v2
- Dataset de referencia UD Kabyle: https://universaldependencies.org/treebanks/kab_adpt/
