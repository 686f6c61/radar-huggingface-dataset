# haruuuuu-1256/sweet-zenz-v1.1-small-gguf

## Resumen

sweet-zenz-v1.1-small es un modelo GPT-2 de aproximadamente 90 millones de parametros especializado en conversion kana-kanji (かな漢字変換) para japones, es decir, la tarea de transformar una lectura en katakana en el texto japones correcto con la grafia adecuada (kanji, hiragana, katakana, numeros o alfabeto). Lo desarrolla el autor independiente haruuuuu-1256 y es una version mejorada de sweet-zenz-v1-small, que a su vez es un ajuste fino de zenz-v3.1-small de Keita Miwa. Esta ficha cubre la variante cuantizada en GGUF del repositorio, pensada para su uso dentro de Zenzai, el motor de conversion del teclado japones AzooKey.

El modelo no es un LLM generativo de proposito general: es un componente de infraestructura de entrada de texto. Su funcion es resolver la ambiguedad de los homofonos japoneses (por ejemplo, 務める frente a 勤める, o 開放 frente a 解放) aprovechando el contexto izquierdo de la frase, con una ventana de contexto de 40 caracteres de texto previo. La version 1.1 reordena las candidaturas de lecturas cortas segun la frecuencia real de uso en corpus, anade terminos de VRChat, LLM locales, jerga de internet y nombres propios alfanumericos como `RTX 5090` o `Q4_K_M`, y mejora la precision general.

La relevancia practica esta en su tamano: con 90 millones de parametros y un repositorio de 0,2 GB, puede ejecutarse en CPU y en dispositivos modestos como parte de un IME, sin depender de servicios en la nube. El repositorio incluye pesos GGUF en Q8_0 (recomendado) y Q5_K_M, con metadatos de tokenizador compatibles con los GGUF oficiales de zenz-v3.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT-2 (decoder-only), especializado en kana-kanji |
| Parametros totales | 90.450.432 (aproximadamente 90M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 40 caracteres de contexto izquierdo (formato de prompt de zenz-v3) |
| Tipos de cuantizacion | Q8_0 (recomendado) y Q5_K_M en este repositorio; bf16 en el repositorio base |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (este repositorio); safetensors bf16 en el repositorio base |

## Arquitectura y entrenamiento

El modelo es un GPT-2 decoder-only de unos 90M de parametros, derivado de zenz-v3.1-small mediante ajuste fino supervisado (SFT) y aprendizaje por refuerzo con GRPO. El formato de prompt es el de zenz-v3: `[<contexto izquierdo, max. 40 caracteres>]<entrada en katakana><resultado de conversion></s>`. Las lecturas de entrada se generaron con SudachiPy y SudachiDict (full, 2026-10-15), con lecturas fijadas manualmente para algunos terminos.

El entrenamiento de v1.1 parte de v1 y aplica varias fases: SFT con aproximadamente 420.000 pares de conversion construidos a partir de datos publicos con licencia explicita (Wikipedia japonesa, Wiktionary, RealPersonaChat, documentacion tecnica traducida, SudachiDict, hololive-dictionary, entre otros), mezclados con 155.000 salidas de autodestilacion del modelo original para preservar sus convenciones de grafia; despues GRPO con 8 muestras por prompt, recompensa por coincidencia con la referencia (tolerando variantes de grafia y con bonus por coincidencia exacta), penalizacion por salidas degeneradas (sin EOS o UTF-8 invalido) y regularizacion KL hacia el modelo original (beta = 0,1) durante 500 pasos. v1.1 anade un GRPO con criterio de grafia (las respuestas en kana solo se aceptan como correctas si el modelo original tambien usa kana), un ajuste SFT de la distribucion previa de lecturas cortas de 2 a 4 caracteres basado en frecuencias de Wikipedia, RealPersonaChat y Wiktionary, y un reentrenamiento de terminologia para recuperar vocabulario especializado. El dropout se desactivo porque su activacion disparaba la perdida sobre las propias salidas del modelo.

Una innovacion destacable es el control explicito de la distribucion de candidatos para lecturas cortas sin contexto: en lugar de ordenar por probabilidad del modelo, se calibra con la frecuencia de uso real, lo que corrige casos como «うつ», donde v1 devolvia 鬱 y v1.1 devuelve 打つ.

## Capacidades

- Conversion kana-kanji contextual: transforma lecturas en katakana al texto japones con la grafia correcta, usando hasta 40 caracteres de contexto previo.
- Desambiguacion de homofonos: distingue pares como 務める/勤める, 伯父/叔父 y 開放/解放.
- Cobertura de vocabulario tecnico: terminos de LLM locales (por ejemplo `Q4_K_M`), hardware (`RTX 5090`), VRChat y modificacion de avatares.
- Jerga de internet y coloquialismos japoneses («それな», «ｗ»).
- Manejo de cadenas alfanumericas y nombres propios mixtos.
- Conversion de numeros con unidades («75メートル» a `75m`).
- Integracion con Zenzai sobre llama.cpp mediante el pre-tokenizer `gpt2-small-japanese-char`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio: es un modelo de tarea unica.

## Casos de uso

- Teclado japones (IME) en escritorio y movil: el modelo se integra en Zenzai dentro de AzooKey para convertir lecturas en tiempo real; sus 90M de parametros y su naturaleza CPU-friendly permiten ejecucion local sin latencia de red.
- Procesamiento por lotes de transcripciones: conversion de grandes volumenes de texto en katakana (por ejemplo, subtitulos o actas) a japones con kanji correctos, aprovechando el contexto de 40 caracteres por segmento.
- Normalizacion de datos japoneses: homogeneizar grafias en bases de datos de nombres, direcciones o terminos tecnicos donde la variante kana/kanji debe resolverse de forma consistente.
- Preprocesado para pipelines de NLP: convertir entradas foneticas o romanizadas a texto japones canonico antes de tareas posteriores de analisis morfologico o busqueda.
- Asistencia a la accesibilidad: entrada por voz o por lectura fonetica que se materializa como texto japones correcto en herramientas de dictado o comunicacion aumentativa.
- Correccion de terminologia en documentacion tecnica: el modelo rinde mejor en textos de MDN y Python docs (90,8 de coincidencia) y en terminos de LLM locales (87,0), por lo que sirve para revisar grafias en manuales traducidos.
- Prototipado de correctores ortograficos japoneses: su bajo coste computacional permite desplegarlo como servicio ligero en contenedores pequenos o en el propio dispositivo.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificacion greedy. La coincidencia tolera variantes de grafia salvo donde se indica «completo». En negrita, el mejor valor entre los tres modelos sin cuantizar.

| Evaluacion | zenz-v3.1-small | sweet-zenz-v1 | sweet-zenz-v1.1 | v1.1 Q8_0 | v1.1 Q5_K_M |
|---|---|---|---|---|---|
| AJIMEE-Bench (200 preguntas, acc@1 completo) | 87,0 | 86,5 | **88,0** | 88,0 | 86,0 |
| AJIMEE-Bench MinCER (menor es mejor) | **1,58** | 1,89 | 1,64 | 1,59 | 2,22 |
| Coincidencia de frecuencia en lecturas cortas (sin contexto, lecturas no vistas) | 77,9 | 76,2 | **82,9** | 83,1 | 82,5 |
| Homofonos cotidianos (40 frases) | 82,5 | 85,0 | **87,5** | 87,5 | 87,5 |
| JWTD homofonos (1.000 preguntas) | 61,3 | **64,8** | 63,2 | 62,8 | 62,5 |
| JWTD homofonos, frases largas (300 preguntas) | 52,0 | 56,0 | **57,0** | 57,0 | 56,0 |
| Porcion Wikipedia de zenz-v2.5-dataset (2.000) | **84,5** | 84,5 | 83,8 | 83,5 | 83,7 |
| Terminologia de LLM locales (46 frases) | 84,8 | 82,6 | **87,0** | 89,1 | 89,1 |
| Terminologia VRChat (105 frases) | 84,8 | **93,3** | 85,7 | 85,7 | 84,8 |
| Terminologia VRChat (completo) | 44,8 | 52,4 | **54,3** | 53,3 | 57,1 |
| Jerga de internet (40 frases) | 92,5 | **95,0** | 92,5 | 92,5 | 92,5 |
| Alfanumerico (30 frases, completo) | 50,0 | **56,7** | **56,7** | 56,7 | 56,7 |
| Wikipedia subcultura | 82,4 | **84,6** | 81,4 | 80,2 | 80,6 |
| Wikipedia articulos nuevos (desde 2024) | 76,6 | **78,6** | 77,0 | 76,4 | 75,2 |
| Documentacion tecnica (MDN / Python docs) | 90,2 | **92,2** | 90,8 | 90,8 | 90,2 |
| Nombres propios | 64,6 | **65,4** | 64,4 | 64,0 | 64,2 |
| Wiktionary | 81,6 | **84,0** | 83,8 | 84,0 | 84,2 |

El autor advierte que las frases de evaluacion propias se redactaron aparte de las de entrenamiento, aunque comparten vocabulario, y que en las categorias con pocas frases cada oracion mueve unos 2 puntos. La cuantizacion Q8_0 mantiene practicamente el rendimiento de bf16; Q5_K_M degrada de forma apreciable MinCER (2,22 frente a 1,64) y AJIMEE-Bench (86,0 frente a 88,0).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en Q8_0 (tamano de repo de 0,2 GB con pesos de 90M de parametros); en Q5_K_M, aun menor. Cabe holgadamente en cualquier GPU consumer, aunque el modelo esta disenado para ejecutarse en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con 1 GB o mas de memoria (GTX 1050, RTX 3050, RTX 4090, A100, H100) puede alojarlo, pero el cuello de botella real sera el tokenizador y el motor de inferencia, no la memoria.
- Cabe en GPU consumer: si, en todas las gamas actuales, y tambien en dispositivos de bajos recursos y moviles.
- Opciones de despliegue: llama.cpp a traves de Zenzai (integracion prevista por el autor). Importante: el pre-tokenizer `gpt2-small-japanese-char` solo lo maneja la version de llama.cpp usada por Zenzai; el llama.cpp upstream no puede abrir este GGUF, igual que ocurre con los GGUF oficiales de zenz. vLLM, TGI y Ollama no estan documentados para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, la inferencia por conversion es del orden de milisegundos en CPU, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AJIMEE-Bench acc@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sweet-zenz-v1.1-small | ~90M | 40 caracteres de contexto izquierdo | 88,0 | CC BY-SA 4.0 | GGUF y safetensors en HF |
| sweet-zenz-v1-small | ~90M | 40 caracteres | 86,5 | CC BY-SA 4.0 | GGUF y safetensors en HF |
| sweet-zenz-v1-xsmall | ~22,5M | 40 caracteres | no disponible | CC BY-SA 4.0 (heredada del proyecto) | GGUF y safetensors en HF |
| zenz-v3.1-small | ~90M (no confirmado en la informacion) | 40 caracteres | 87,0 | no disponible en la informacion | HF (Miwa-Keita/zenz-v3.1-small) |

La eleccion entre sweet-zenz-v1.1-small y v1 depende del dominio: v1.1 gana en precision general, homofonos cotidianos, lecturas cortas y terminologia de LLM locales, mientras que v1 es superior en VRChat (93,3 frente a 85,7), jerga de internet, subcultura de Wikipedia, documentacion tecnica y nombres propios. La variante xsmall prioriza tamano y velocidad a costa de precision.

## Limitaciones y advertencias

- Modelo de tarea unica: no es un chatbot ni un LLM generativo; no admite instrucciones libres, tool calling ni razonamiento multi-paso.
- Solo japones: no hay soporte multilingue; el tokenizador y el prompt estan disenados para lecturas en katakana.
- Contexto muy limitado: 40 caracteres de contexto izquierdo; la desambiguacion depende de esa ventana y puede fallar en frases largas o referencias lejanas.
- Regresiones frente a v1: peor rendimiento en VRChat (85,7 frente a 93,3), jerga de internet (92,5 frente a 95,0), subcultura de Wikipedia (81,4 frente a 84,6), articulos nuevos (77,0 frente a 78,6), documentacion tecnica (90,8 frente a 92,2) y nombres propios (64,4 frente a 65,4). El autor recomienda v1 si esos dominios son prioritarios.
- Riesgo de alucinacion de grafias: al ser un modelo probabilistico puede producir kanji validos pero incorrectos en contexto; no hay garantia de correccion.
- Sesgos: el vocabulario y las frecuencias provienen de Wikipedia, Wiktionary, RealPersonaChat y diccionarios; pueden infrarrepresentar registros coloquiales, dialectos o terminologia de nicho no incluida.
- Incompatibilidad de despliegue: el GGUF no se abre con llama.cpp upstream por el pre-tokenizer `gpt2-small-japanese-char`; requiere la version usada por Zenzai.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar productos propietarios que integren el modelo o sus salidas de forma sustancial.
- Datos de evaluacion: parte de los conjuntos son creados por el autor y con pocas frases; la varianza es alta y las cifras deben tomarse como orientativas.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1.1-small-gguf
- Repositorio base (safetensors bf16): https://huggingface.co/haruuuuu-1256/sweet-zenz-v1.1-small
- Version anterior: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-small
- Version anterior GGUF: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-small-gguf
- Version destilada xsmall: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-xsmall
- Version destilada xsmall GGUF: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-xsmall-gguf
- Modelo upstream zenz-v3.1-small: https://huggingface.co/Miwa-Keita/zenz-v3.1-small
- Zenzai / AzooKeyKanaKanjiConverter: https://github.com/azooKey/AzooKeyKanaKanjiConverter
- Dataset zenz-v2.5-dataset: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Dataset de errores de entrada de Wikipedia japonesa v2: https://nlp.ist.i.kyoto-u.ac.jp/?日本語Wikipedia入力誤りデータセット
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- SudachiDict: https://github.com/WorksApplications/SudachiDict
- hololive-dictionary: https://github.com/heppokofrontend/hololive-dictionary
