# darioooooo0o/spark-4b-engram

## Resumen

Spark-4b-engram es un artefacto de investigacion experimental publicado por el usuario darioooooo0o que implementa la tecnica **Conditional Memory via Scalable Lookup (Engram)** descrita en el paper arXiv:2601.07372 sobre un backbone transformer denso de 4,11B parametros (XHToken/Spark-X2.5-4B) que permanece **100% congelado**. El modelo anade un modulo externo de memoria condicional de 826,24M parametros (el 20,09% del tamano del backbone) basado en tablas hash de n-gramas con lookup en tiempo O(1), sin modificar ni un solo peso del modelo base ni aplicar LoRA.

El problema que aborda es el de especializar un modelo generalista en generacion de codigo y razonamiento algoritmico sin provocar olvido catastrofico: al mantener el backbone intacto, las capacidades conversacionales y de razonamiento originales se preservan, mientras que el modulo Engram inyecta plantillas de sintaxis, recursividad e idiomas de biblioteca estandar directamente en el residual stream. Segun la model card, esta configuracion eleva la tasa de exito en un subconjunto de 50 problemas de HumanEval del 30,0% (Spark-4B de serie) al 72,0%, una ganancia absoluta de +42,0 puntos.

Se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, con licencia Apache 2.0, soporte solo para ingles y codigo, y libreria `transformers` con `custom_code`. No es un modelo listo para produccion, sino una prueba de concepto reproducible sobre transferencia asimetrica de representaciones entre backbones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con backbone congelado + modulo Engram de memoria condicional por lookup (tablas hash de n-gramas) |
| Parametros totales | ~4,94 mil millones (4,11B del backbone Spark-X2.5-4B + 826,24M del modulo Engram) |
| Parametros activos | no aplica (no es un modelo MoE; el backbone y el modulo Engram operan de forma densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modulo Engram se distribuye en safetensors FP32; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) y code (Python, C++, Java, JavaScript, C#, SQL, Bash, Rust; el corpus incluye tambien PHP) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`.safetensors`) para el modulo Engram; `.pt` para el mapa canonico de tokenizer |

Datos adicionales de arquitectura del modulo Engram:

| Componente | Especificacion |
|---|---|
| Ordenes de n-gramas | (2, 3, 4) |
| Cabezas por orden | 8 (24 cabezas totales por capa) |
| Slots por cabeza | 262.144 slots primos |
| Dimension de embedding | 64 |
| Capas objetivo | Capa 2 y capa 18 (topologia dual: somera + media) |
| Compresion de tokenizer | 131.072 -> 100.096 claves (-23,6%) mediante NFKC + NFD + eliminacion de acentos + minusculas |
| Context gating | Signed Square-Root Gate: `sigmoid(sign(S) * sqrt(\|S\|))` con RMSNorm en FP32 |
| Convolucion temporal | Causal ShortConv (kernel=4, dilation=2) con padding causal estricto, activacion SiLU y skip connection |
| Capacidad de memoria | 826,24M parametros (20,09% del backbone) |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone transformer denso de 4,11B parametros que se mantiene congelado al 100%: no se ha fine-tuneado, ni adaptado con LoRA, ni modificado ningun peso. Sobre el se acopla un modulo Engram que implementa memoria condicional mediante lookup escalable. El modulo usa tres ordenes de n-gramas (2, 3 y 4), con 8 cabezas de hashing bitwise XOR por orden (24 cabezas por capa) y 262.144 slots primos por cabeza, usando modulos primos coprimos entre cabezas para eliminar colisiones cruzadas. La dimension de embedding es de 64, lo que da una representacion compacta de idiomatismos.

Las tablas de memoria se insertan en las capas 2 y 18 del backbone, una topologia dual (somera + media) elegida a partir de un barrido empirico de capas. La recuperacion se modula mediante una puerta de contexto signed square-root (`sigmoid(sign(S) * sqrt(|S|))`) normalizada con RMSNorm en FP32, y una convolucion causal ShortConv (kernel 4, dilation 2) con SiLU y conexion residual. El tokenizer se canonicaliza con NFKC, NFD, eliminacion de acentos y paso a minusculas, reduciendo el espacio de claves de 131.072 a 100.096 (-23,6%).

El entrenamiento del modulo Engram se hizo sobre 25.000.000 de tokens de codigo en varios lenguajes, procedentes de tres fuentes: `nickrosh/Evol-Instruct-Code-80k-v1` (~12M tokens; problemas algoritmicos, estructuras de datos y programacion competitiva en Python, C++, Java, JavaScript, C#, Bash, PHP y SQL), `sahil2801/CodeAlpaca-20k` junto con `iamtarun/python_code_instructions` (~3M tokens; completado de tareas, one-liners idiomaticos y conversiones de docstring a codigo) y `codeparrot/codeparrot-clean` (~10M tokens; codigo real de repositorios, jerarquias de clases y sintaxis de produccion). No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de codigo multi-lenguaje: Python, C++, Java, JavaScript, C#, SQL, Bash y Rust (el corpus de entrenamiento incluye ademas PHP), con enfasis en problemas algoritmicos y estructuras de datos.
- Razonamiento algoritmico y resolucion de problemas de programacion competitiva, apoyado en la recuperacion de plantillas de recursividad y idiomatismos de biblioteca estandar.
- Generacion asistida de codigo tipo asistente (docstring a codigo, one-liners idiomaticos, manipulación de biblioteca estandar).
- Razonamiento general y capacidades conversacionales del backbone Spark-X2.5-4B, preservadas intactas porque no se modifica ningun peso del modelo base.
- Recuperacion de memoria externa en tiempo O(1) mediante tablas hash de n-gramas, sin coste de atencion adicional proporcional al contexto.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explicitamente).
- Capacidades multilingues: limitadas a ingles y codigo; no se documenta soporte para castellano ni otros idiomas naturales.
- Capacidades especiales: modo de memoria condicional (Engram) con puerta signed square-root; no se documentan modo thinking, vision ni audio.
- Requiere `trust_remote_code=True` por el uso de `custom_code`.

## Casos de uso

- Generacion de codigo algoritmico en pipelines de evaluacion: el modelo resuelve problemas de tipo HumanEval con una tasa del 72,0% en el subconjunto de 50 problemas documentado, por lo que es adecuado para prototipado rapido de funciones y estructuras de datos en Python, C++, Java o Rust.
- Asistente de completado de codigo en el IDE: gracias a la memoria de idiomatismos y plantillas de biblioteca estandar almacenada en las tablas hash, puede sugerir fragmentos idiomaticos para tareas repetitivas (parseo, manipulacion de colecciones, E/S) sin reentrenar el backbone.
- Traduccion entre lenguajes de programacion: el banco de memoria poliglota cubre Python, C++, Java, JavaScript, C#, SQL, Bash y Rust, lo que permite portar algoritmos entre estos lenguajes manteniendo el razonamiento semantico del backbone congelado.
- Generacion de codigo SQL y scripts de shell: el corpus incluye SQL y Bash, de modo que el modelo puede producir consultas y scripts de automatizacion con sintaxis consistente.
- Investigacion sobre memoria condicional y arquitecturas aumentadas: al ser un artefacto experimental reproducible con pesos publicos (3,1 GB), sirve como banco de pruebas para estudiar transferencia asimetrica entre backbones y diseno de puertas de contexto.
- Asistente conversacional de proposito general con especializacion en codigo: como el backbone no se ha modificado, el modelo conserva las capacidades conversacionales originales de Spark-X2.5-4B y puede alternar entre dialogo general y tareas de programacion.
- Evaluacion comparativa de tecnicas de memoria externa frente a fine-tuning completo o LoRA: el repo publica tanto los pesos del modulo como el mapa de tokenizer, lo que facilita reproducir los experimentos de ablacion de capas y de slicing entre backbones de distinto tamano.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un subconjunto de 50 problemas de HumanEval, evaluados de forma greedy (`temperature=0.0`, `max_new_tokens=150`) contra tests unitarios estandar (`check(entry_point)`):

| Configuracion del modelo | Backbone base | Parametros Engram | HumanEval (50 problemas) | Tasa de exito | Ganancia neta |
|---|---|---|---|---|---|
| Spark-1.7B de serie | 1,7B | 0M (stock) | 11 / 50 | 22,0% | Base |
| Spark-1.7B + Engram 20% (adaptado desde 4B) | 1,7B | ~820M (zero-shot, recortado desde 4B) | 0 / 50 | 0,0% | -22,0% |
| Spark-4B de serie | 4,1B | 0M (stock) | 15 / 50 | 30,0% | Base |
| Spark-4B + Engram 20% (nativo) | 4,1B | 826,2M (entrenado sobre 25M tokens de codigo) | 36 / 50 | 72,0% | +42,0% |

Hallazgos reportados por el autor:

- En el subconjunto de 50 problemas, el Engram de codigo sobre Spark-4B mas que duplica la capacidad de resolucion (30,0% -> 72,0%), resolviendo 21 problemas que el 4B de serie fallaba.
- El backbone congelado de 4B proporciona representaciones semanticas ricas (hidden states) que permiten a la puerta signed sqrt recuperar idiomatismos y patrones memorizados directamente en el residual stream.
- Acoplamiento del espacio de representacion (transferencia asimetrica): las tablas hash de n-gramas (`tables.weight`, 805M parametros) dependen del vocabulario pero son agnosticas a la arquitectura, mientras que las proyecciones densas (W_q, W_v) estan fuertemente acopladas a la geometria del espacio oculto de cada modelo. Recortar las proyecciones del 4B (2560 -> 2048) para encajarlas en el 1.7B rompe los productos escalares de la puerta y lleva la tasa de exito a 0,0%, lo que demuestra que las tablas de memoria se pueden compartir pero las capas de proyeccion deben ser nativas o fine-tunadas por backbone.

No se han publicado otros resultados de benchmarks (MMLU, GSM8K, MBPP, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de 4,11B en bf16 ocupa aproximadamente 8,2 GB y el modulo Engram de 826,24M en FP32 unos 3,3 GB, lo que suma del orden de 11,5 GB solo en pesos. Hay que anadir la cache KV y las activaciones, por lo que un presupuesto practico de 14-16 GB resulta razonable para secuencias cortas, aunque el dato no esta confirmado por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para experimentacion comoda y lotes grandes; RTX 4090 o RTX 3090 (24 GB) para inferencia local de una sola peticion.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 (24 GB) con margen. En GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000) es ajustado y dependera de la longitud de contexto y del batch, dado que el modulo Engram se carga en FP32. En GPUs de 8-12 GB no cabe sin cuantizar el backbone, opcion que no se documenta.
- Opciones de despliegue: la model card solo documenta `transformers` con `torch` y `safetensors`, requiriendo `trust_remote_code=True` por el uso de `custom_code`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni SGLang, y las tablas hash de 262.144 slots por cabeza hacen previsible que estos motores necesiten adaptaciones especificas.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de latencia ni de tokens por segundo. El diseno del lookup es O(1) por token, por lo que el coste anadido del modulo Engram respecto al backbone de serie deberia ser marginal, pero es una inferencia de diseno, no un dato medido.

## Comparativa con modelos similares

Comparativa con las configuraciones evaluadas en la propia model card (unica fuente con datos verificables disponible):

| Modelo | Parametros totales | Parametros de memoria | HumanEval (50 problemas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spark-4b-engram (Spark-4B + Engram 20% nativo) | ~4,94B (4,11B congelados + 826,24M) | 826,24M | 72,0% | apache-2.0 | HuggingFace, 0 descargas |
| Spark-X2.5-4B de serie (modelo base) | 4,11B | 0M | 30,0% | no disponible en esta ficha | HuggingFace (XHToken/Spark-X2.5-4B) |
| Spark-1.7B de serie | 1,7B | 0M | 22,0% | no disponible en esta ficha | HuggingFace |
| Spark-1.7B + Engram 20% (recortado desde 4B) | ~2,52B | ~820M | 0,0% | apache-2.0 (heredada del artefacto) | Configuracion experimental del mismo repo |

No se dispone de datos de benchmarks comparables con modelos externos de la misma categoria (por ejemplo, asistentes de codigo de ~4-7B parametros como Qwen-Coder, CodeLlama o DeepSeek-Coder) en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa con ellos.

## Limitaciones y advertencias

- Artefacto de investigacion experimental: la propia model card lo etiqueta como "EXPERIMENTAL RESEARCH ARTIFACT". No esta pensado para produccion ni ha sido validado mas alla de un subconjunto de 50 problemas de HumanEval.
- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgos del backbone ni del modulo de memoria.
- Riesgo de alucinacion: no se documenta un analisis especifico, pero el mecanismo de recuperacion por n-gramas puede devolver idiomatismos o plantillas memorizadas que no encajen semanticamente con el contexto, especialmente fuera de los lenguajes y patrones vistos en el corpus.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica. El soporte de idiomas naturales se limita a ingles; no hay soporte documentado de castellano. La especializacion en codigo cubre Python, C++, Java, JavaScript, C#, SQL, Bash y Rust, con PHP presente en el corpus pero no listado en el alcance declarado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el backbone base (XHToken/Spark-X2.5-4B) tiene su propia licencia que no se detalla en esta ficha y debe verificarse por separado antes de cualquier uso comercial.
- Dependencia del backbone: el modulo Engram no funciona de forma autonoma; requiere cargar el modelo base Spark-X2.5-4B y activar `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio.
- Transferencia no portable: segun los propios resultados del autor, las tablas de memoria se pueden reutilizar entre backbones, pero las proyecciones densas (W_q, W_v) no. Reutilizar el modulo con otro backbone sin reentrenar las proyecciones degrada el rendimiento hasta el 0,0% en el caso medido.
- Volumen de entrenamiento limitado: solo 25M tokens de codigo para el modulo, un orden de magnitud bajo en comparacion con modelos de codigo entrenados sobre miles de millones de tokens; el rendimiento fuera de la distribucion del corpus puede degradarse notablemente.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- El README del repositorio esta truncado en la seccion de quickstart, por lo que el procedimiento exacto de carga puede requerir consultar directamente los ficheros del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darioooooo0o/spark-4b-engram
- Arbol completo de ficheros y versiones: https://huggingface.co/darioooooo0o/spark-4b-engram/tree/main
- Descarga directa de pesos del modulo Engram (safetensors, 3,1 GB): https://huggingface.co/darioooooo0o/spark-4b-engram/resolve/main/engram_layer_weights_spark4b_20pct_25m.safetensors
- Descarga directa del mapa canonico de tokenizer (compression_map.pt, 1,1 MB): https://huggingface.co/darioooooo0o/spark-4b-engram/resolve/main/compression_map.pt
- Paper de referencia (Conditional Memory via Scalable Lookup / Engram): https://arxiv.org/abs/2601.07372
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Datasets de entrenamiento citados: `nickrosh/Evol-Instruct-Code-80k-v1`, `sahil2801/CodeAlpaca-20k`, `iamtarun/python_code_instructions`, `codeparrot/codeparrot-clean`.
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces recuperados pertenecen a foros de television digital y videojuegos sin relacion con el artefacto.
