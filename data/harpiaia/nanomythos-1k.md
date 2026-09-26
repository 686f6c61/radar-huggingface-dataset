# HarpiaIA/NanoMythos-1K

## Resumen

NanoMythos-1K es un modelo de generación de texto publicado por HarpiaIA en HuggingFace, descrito por su autor como el primero y el más pequeño de la serie NanoMythos. Se trata de un modelo etiquetado como "tiny" y "mini", orientado a la generación de texto en inglés y entrenado con el dataset FineWeb-Edu. La model card indica que emplea una arquitectura Transformer con un tokenizer a nivel de carácter, una elección poco habitual que reduce el vocabulario a la lista de caracteres y desplaza la carga de modelado hacia la secuencia.

La relevancia de este modelo es fundamentalmente experimental y educativa: por su tamaño reducido y su tokenizer char-level sirve como banco de pruebas para estudiar tokenización, curvas de escalado en modelos minúsculos y comportamiento lingüístico en el límite inferior de capacidad. No compite con modelos de propósito general y sus propios benchmarks publicados (ARC-Easy 25,51 % y BLiMP 50,17 %) sitúan su rendimiento en niveles cercanos al azar, como se detalla más abajo.

La información pública disponible es muy limitada: el repositorio tiene un tamaño declarado de 0,0 GB, no se especifica el número de parámetros ni la longitud de contexto, y no se describen los pesos ni los formatos de publicación. Cualquier evaluación práctica debe partir de esa base de incertidumbre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizer a nivel de caracter (char-level) |
| Parametros totales | no disponible (el autor lo etiqueta como "tiny"/"mini", sin recuento publicado) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repositorio declarado: 0,0 GB) |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu |
| Tarea (pipeline) | text-generation |
| Fecha de creacion en el repositorio | 2026-09-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El autor describe una arquitectura Transformer con tokenizer char-level. Esto implica que la unidad de entrada es el carácter y no el subword, de modo que el vocabulario efectivo queda reducido a decenas o pocos cientos de símbolos y las secuencias contienen muchos más tokens por palabra que en un tokenizer BPE habitual. No se publican datos sobre número de capas, dimensión del modelo, número de cabezas de atención, función de activación, tipo de posicional encoding ni si se emplean variantes como atención lineal o decodificación especulativa.

Respecto al entrenamiento, la única información disponible es que el dataset utilizado fue FineWeb-Edu, un corpus educativo en inglés ampliamente usado para modelos pequeños. No se indica el número de tokens vistos, la composición exacta del dataset, el número de épocas, el hardware empleado ni si hubo fases de ajuste posteriores como RLHF, DPO o instrucción supervisada. Tampoco se documenta ninguna innovación técnica más allá de la elección del tokenizer char-level.

## Capacidades

- Generación de texto en inglés: es la única capacidad declarada explícitamente mediante el pipeline `text-generation`.
- Modelado de lenguaje a nivel de carácter: al usar tokenizer char-level, el modelo puede, en principio, producir y puntuar secuencias a nivel de carácter, lo que facilita tareas de continuación sobre texto con ortografía atípica o ruido.
- Idiomas: únicamente inglés según el campo `language` de la model card.
- Razonamiento, matemáticas y código: no disponible; no hay declaración del autor ni evidencia publicada.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Uso como agente o razonamiento multi-paso: no disponible; no se documenta soporte.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline declarado es exclusivamente de texto.
- Modo de pensamiento (thinking mode): no disponible.
- Ejecución mediante script propio: la model card indica que debe usarse el script `generate.py` para ejecutar el modelo.

## Casos de uso

- Investigación sobre tokenización char-level: el modelo permite medir cómo afecta un vocabulario de caracteres frente a BPE en un Transformer pequeño, comparando perplejidad y errores gramaticales en el mismo corpus; es adecuado porque su configuración exacta es precisamente la variable a estudiar.
- Docencia y experimentación en aulas: sirve como ejemplo mínimo de extremo a extremo (dataset público, arquitectura Transformer, script de generación) para ilustrar el ciclo completo de entrenamiento e inferencia sin requerir infraestructura relevante.
- Pruebas de pipelines de evaluación: su tamaño permite ejecutar baterías de benchmarks como ARC-Easy o BLiMP en minutos y validar que el andamiaje de evaluación funciona antes de escalar a modelos mayores.
- Generación de texto de baja exigencia: continuaciones cortas de texto en inglés donde no se requiere coherencia de largo alcance; encaja por su coste computacional mínimo, aceptando que la calidad será muy limitada.
- Investigación sobre sesgos y alucinación en modelos diminutos: al carecer de ajuste por instrucciones, es un caso de estudio útil para analizar qué tipo de errores produce un modelo puramente preentrenado en FineWeb-Edu.
- Reproducción de experimentos de escalado: dado que el autor lo presenta como el primero y el menor de una serie (NanoMythos), puede utilizarse como punto de referencia inferior en curvas de escalado si la serie publica modelos mayores con configuración comparable.
- Filtrado previo y pruebas de integración: verificar que los scripts de carga, tokenización char-level e inferencia funcionan en un entorno concreto antes de desplegar modelos de mayor coste.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los siguientes:

| Benchmark | NanoMythos-1K | Referencia de azar | Observacion |
|---|---|---|---|
| ARC-Easy | 25,51 % | 25 % (4 opciones) | Rendimiento practicamente identico al azar |
| BLiMP | 50,17 % | 50 % (par de opciones) | Rendimiento practicamente identico al azar |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K, HellaSwag ni de ningun otro benchmark estandar, ni comparaciones directas con modelos de tamano similar.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El autor no publica el recuento de parametros ni la arquitectura con detalle y el repositorio declara 0,0 GB, por lo que no es posible estimar la huella de memoria con un minimo de rigor.
- GPU recomendadas: no disponible por la misma razon. Dado el caracter "tiny"/"mini" del modelo, es razonable esperar que la inferencia sea viable en CPU, pero se trata de una inferencia a partir de la etiqueta del autor, no de un dato publicado.
- GPU de consumo: previsiblemente cualquier GPU de consumo reciente seria suficiente si el modelo cabe en memoria, aunque no hay cifras confirmadas; incluso podria no necesitar GPU.
- Opciones de despliegue: la model card unicamente menciona el script `generate.py` del propio repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI, transformers estandar ni formatos GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.
- Nota: la combinacion de tokenizer char-level y ausencia de datos de tamano impide estimar el coste de inferencia incluso de forma aproximada, ya que la longitud de secuencia en tokens puede ser varias veces superior a la de un modelo con tokenizer subword equivalente.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la informacion proporcionada. La unica comparacion que puede establecerse con rigor es frente a las lineas base aleatorias de sus propios benchmarks:

| Modelo | Parametros | Contexto | ARC-Easy | BLiMP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NanoMythos-1K | no disponible | no disponible | 25,51 % | 50,17 % | Apache 2.0 | Repositorio HuggingFace (0 descargas, 0 likes) |
| Linea base aleatoria | no aplica | no aplica | 25 % | 50 % | no aplica | no aplica |
| Alternativas de tamano "tiny" | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion disponible otros modelos con tokenizer char-level y datos publicos comparables dentro de la misma categoria.

## Limitaciones y advertencias

- Rendimiento al nivel del azar: los dos benchmarks publicados (ARC-Easy 25,51 % y BLiMP 50,17 %) son indistinguibles estadisticamente de responder al azar, lo que desaconseja cualquier uso donde se requiera comprension del lenguaje, razonamiento o conocimiento factual.
- Riesgo elevado de alucinacion y texto incoherente: al no haber indicios de ajuste por instrucciones ni de datos suficientes, es esperable que produzca continuaciones gramatical y semanticamente inconsistentes.
- Idioma unico: solo se declara soporte de ingles; no hay evidencia de capacidades multilingues ni de castellano.
- Contexto desconocido: al no publicarse la longitud de contexto, no puede garantizarse el comportamiento en conversaciones multi-turno ni en documentos largos.
- Ausencia de ajuste conversacional: no se documenta entrenamiento de instrucciones, RLHF ni DPO, por lo que no cabe esperar que siga ordenes de forma fiable.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al no publicarse los pesos ni su formato (repositorio de 0,0 GB) no puede confirmarse que el modelo sea realmente descargable y utilizable.
- Metadatos inconsistentes: el repositorio registra 0 descargas, 0 likes, 0,0 GB de tamano y una fecha de creacion (2026-09-26) inusual; conviene verificar el estado real del repositorio antes de integrarlo en cualquier flujo de trabajo.
- Ausencia de informacion sobre sesgos: no se publica ninguna evaluacion de sesgos, toxicidad ni seguridad, por lo que no pueden acotarse los riesgos en produccion.
- No apto para produccion: la combinacion de rendimiento al azar, falta de documentacion y ausencia de pesos verificables lo descarta para cualquier despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HarpiaIA/NanoMythos-1K
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Perfil del autor en HuggingFace: https://huggingface.co/HarpiaIA
- Script de generacion mencionado en la model card: `generate.py` (referenciado en el repositorio, sin URL directa publicada)
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
