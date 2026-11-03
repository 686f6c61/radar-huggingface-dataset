# Privoid-ai/Privoid-Bangla-Translate-Qwen3.5-2B

## Resumen
Privoid Bangla Translate es un ajuste fino mediante LoRA del modelo Qwen3.5-2B (2.000 millones de parametros) especializado en traduccion de bangla informal y banglish (bengali romanizado) a ingles. Lo desarrolla Privoid-ai y resuelve un problema concreto: la mayoria de los sistemas de traduccion bangla-ingles se entrenan con texto formal (noticias, libros), por lo que fallan ante el lenguaje coloquial de redes sociales, abreviaturas, faltas de ortografia habladas y mezcla de codigos. Este modelo se entrena exclusivamente con datos informales, lo que lo hace adecuado para comentarios de Facebook, mensajes de chat y resenas.

El modelo es pequeno y ligero (repo de 0,1 GB en formato PEFT/safetensors), lo que permite ejecutarlo en hardware modesto e incluso en un portatil mediante los archivos GGUF publicados para llama.cpp. Reconoce tanto escritura bengali como banglish sin necesidad de indicar cual recibe. Es relevante para equipos que necesitan procesar contenido generado por usuarios en Bangladesh a escala sin depender de APIs propietarias ni de modelos grandes.

La ficha se basa en la informacion publicada por el autor; los benchmarks son declarados por el propio autor y no estan verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B) con adaptador LoRA (PEFT) |
| Parametros totales | 2.000 millones (modelo base); el adaptador LoRA anade una fraccion no especificada |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B; el autor no la especifica) |
| Tipos de cuantizacion | GGUF disponible en el repo complementario (niveles concretos no especificados); pesos PEFT en safetensors |
| Idiomas soportados | bn (bengali, incluye banglish romanizado), en |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF en repo separado |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parametros, sobre el que se aplica un ajuste fino con LoRA (Low-Rank Adaptation) mediante la libreria PEFT. El adaptador modifica un subconjunto de pesos del modelo base para especializarlo en traduccion bn-en, manteniendo el resto congelado. No se especifican en la informacion disponible el rango del adaptador, los modulos objetivo ni los hiperparametros de entrenamiento.

El entrenamiento utiliza exclusivamente dos datasets de traduccion informal: `AyonRoy29/informal_bn-en_machine_translation_dataset` (bangla en escritura bengali) y `Ayon128/Banglish-English` (bangla romanizado). No se indica el numero de tokens ni de ejemplos de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es la composicion del dataset: al centrarse solo en lenguaje coloquial, el modelo aprende formas habladas, abreviaturas y mezcla bangla-ingles que los corpus formales no cubren. La evaluacion se realizo con decodificacion greedy y el modo de razonamiento (thinking) desactivado.

## Capacidades
- Traduccion de bangla (escritura bengali) a ingles en registros informales y coloquiales.
- Traduccion de banglish (bengali romanizado con letras latinas) a ingles, por ejemplo "ami next station e neme jacchi".
- Deteccion implicita del sistema de escritura: no requiere indicar si la entrada esta en bengali o en banglish.
- Manejo de argot, formas cortas, ortografias habladas (por ejemplo করতেসি, পারতাছে) y texto mixto bangla-ingles.
- Traduccion de contenido de redes sociales: comentarios, mensajes de chat, resenas y publicaciones.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la informacion disponible.
- Capacidad multilingue limitada a los pares bn-en y banglish-en.

## Casos de uso
- Moderacion de contenido en redes sociales: el modelo traduce comentarios y publicaciones informales de usuarios bangladeshies al ingles para que los equipos de moderacion puedan revisarlos, gracias a su manejo de argot y banglish.
- Analisis de sentimiento y opinion: preprocesar resenas y comentarios informales traduciendolos al ingles antes de pasarlos a un clasificador o a un pipeline de NLP en ingles.
- Atencion al cliente en chat: traducir mensajes de usuarios que escriben en banglish coloquial para que agentes o sistemas automatizados en ingles puedan responder.
- Investigacion en linguistica de corpus: estudiar fenomenos de code-mixing y romanizacion bn-en con un modelo entrenado especificamente en ese registro.
- Localizacion de contenido generado por usuarios: traducir resenas de productos, foros y redes para su publicacion en mercados angloparlantes.
- Despliegue en el borde o en portatil: al ser un modelo de 2B con version GGUF, puede ejecutarse offline en un portatil para tareas de traduccion puntual sin conexion ni APIs externas.
- Construccion de datasets paralelos: generar traducciones al ingles de texto informal bangla como paso previo a la anotacion humana.

## Benchmarks y rendimiento
Resultados declarados por el autor (no verificados de forma independiente). Metrica sacreBLEU chrF++ y BLEU, una referencia por frase, decodificacion greedy y thinking desactivado. 1.000 frases retenidas por conjunto de test.

| Conjunto de test | Frases | chrF++ base | chrF++ Privoid | BLEU base | BLEU Privoid |
|---|---|---|---|---|---|
| Bangla informal (escritura bengali) | 1.000 | 42,4 | 52,2 | 19,3 | 30,8 |
| Banglish (bangla en letras latinas) | 1.000 | 28,6 | 40,1 | 6,8 | 18,1 |

Comparacion frase a frase (mejora o empeoramiento superior a 5 puntos de chrF++):

| Conjunto de test | Mejor | Similar | Peor |
|---|---|---|---|
| Bangla informal (escritura bengali) | 556 (56 %) | 311 (31 %) | 133 (13 %) |
| Banglish (bangla en letras latinas) | 667 (67 %) | 280 (28 %) | 53 (5 %) |

Ganancia de chrF++ sobre el modelo base: +9,8 en bangla informal y +11,5 en banglish. El autor advierte que hay una sola referencia por frase, que algunas referencias de estos datasets comunitarios son laxas o agramaticales y que no se evaluo bangla formal (noticias, libros). Las cifras comparan ambos modelos, no constituyen una medida absoluta de calidad.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 4-5 GB en fp16 para el modelo base de 2B; unos 2-3 GB en cuantizacion de 4 bits (GGUF Q4). Cifras orientativas, no publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) para fp16; para cuantizaciones GGUF basta con CPU o GPU integrada.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 6 GB o mas; con GGUF Q4 puede ejecutarse en portatiles sin GPU dedicada.
- Opciones de despliegue: llama.cpp y Ollama mediante los archivos GGUF del repo `Privoid-ai/Privoid-Bangla-Translate-Qwen3.5-2B-GGUF`; el adaptador PEFT puede cargarse con transformers + peft sobre el modelo base, y servirse con vLLM o TGI fusionando el adaptador (no documentado explicitamente por el autor).
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Privoid Bangla Translate (Qwen3.5-2B) | 2.000 M (LoRA) | no disponible | Traduccion bn-en informal y banglish | cc-by-4.0 | HuggingFace, GGUF |
| Qwen3.5-2B (base) | 2.000 M | no disponible | Modelo generalista multilingue | no disponible en la informacion | HuggingFace |
| Modelos NMT bangla-ingles genericos | no disponible | no disponible | Traduccion formal (noticias, libros) | variable | variable |

La comparativa con alternativas especificas de traduccion bn-en no esta disponible en la informacion proporcionada; el unico punto de referencia documentado es el modelo base Qwen3.5-2B, sobre el que el ajuste mejora entre 9,8 y 11,5 puntos de chrF++ en los conjuntos informales.

## Limitaciones y advertencias
- Sesgos: al entrenarse solo con datos informales de redes sociales, puede reflejar sesgos presentes en ese contenido (lenguaje ofensivo, estereotipos regionales).
- Alucinacion: como todo modelo generativo, puede producir traducciones plausibles pero incorrectas, especialmente con frases ambiguas o muy cortas.
- Registro limitado: no se evaluo con bangla formal (noticias, libros); su rendimiento en ese dominio es desconocido y probablemente inferior al de modelos NMT genericos.
- Calidad de referencia: los benchmarks usan una sola referencia por frase y algunas referencias son laxas o agramaticales, por lo que las metricas subestiman o sobreestiman la calidad real.
- Verificacion: los resultados estan declarados por el autor y marcados como no verificados.
- Contexto e idiomas: la longitud de contexto no se especifica; el modelo solo cubre bn-en y banglish-en.
- Licencia: cc-by-4.0 permite uso comercial con atribucion; conviene revisar los terminos del modelo base Qwen3.5-2B, ya que el ajuste hereda sus restricciones.
- Produccion: sin datos de latencia ni throughput, y con 0 descargas y 0 likes en el momento de la consulta, la madurez y el soporte de la comunidad son minimos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Privoid-ai/Privoid-Bangla-Translate-Qwen3.5-2B
- Version GGUF: https://huggingface.co/Privoid-ai/Privoid-Bangla-Translate-Qwen3.5-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset bangla informal: https://huggingface.co/datasets/AyonRoy29/informal_bn-en_machine_translation_dataset
- Dataset banglish: https://huggingface.co/datasets/Ayon128/Banglish-English
- Resultados por frase: benchmark/results.json (incluido en el repositorio del modelo)
- sacreBLEU: https://github.com/mjpost/sacrebleu
