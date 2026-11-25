# mmis1000/asmr-qwen3.5-9b-zh-cn-gguf-v0.2

## Resumen

asmr-qwen3.5-9b-zh-cn-gguf-v0.2 es una cuantizacion en formato GGUF de un ajuste fino (LoRA) sobre el modelo base Qwen3.5-9B de Alibaba, especializado en la traduccion de transcripciones de ASMR japones (salida de ASR/Whisper) a chino simplificado. Lo desarrolla mmis1000, un autor independiente, y resuelve un problema muy concreto: las transcripciones automaticas de audio contienen errores, repeticiones y ruido que los traductores genericos no manejan bien, ademas de requerir normalizacion de glossarios y preservacion de emocion y matices en dialogos de personajes.

El modelo parte de los 9.197.093.888 parametros del Qwen3.5-9B original y aplica un adaptador LoRA (r=16, alpha=16) sobre siete modulos de proyeccion, con una longitud maxima de secuencia de entrenamiento de 8192 tokens. La version 0.2 continua directamente el adaptador v0.1 hasta esa ventana nativa de 8k sin usar RoPE scaling ni YaRN, y conserva la cabeza MTP (multi-token prediction) del modelo base en el GGUF para permitir decodificacion especulativa en builds de llama.cpp que la soporten.

Su relevancia es acotada pero clara: es una herramienta de nicho para pipelines de subtitulado y localizacion de contenido de audio japones, con salida JSON estructurada, soporte de decodificacion guiada por gramatica y cuantizaciones que van de 5,4 GB a 17,1 GB. La licencia Apache 2.0 facilita su integracion comercial, aunque el dominio de entrenamiento incluye dialogo ASMR adulto y puede generar texto sexualmente explicito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B) con cabeza MTP; ajuste fino mediante LoRA |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens de contexto total en tiempo de ejecucion (entrenado a 8192; reservar espacio para el JSON generado) |
| Tipos de cuantizacion | q4_k_m (5,4 GB), q6_k (7,0 GB), q8_0 (9,1 GB), bf16 (17,1 GB) |
| Idiomas soportados | japones (entrada), chino simplificado (salida) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3.5-9B, ajustado con LoRA de rango 16 y alpha 16 sobre los modulos o_proj, gate_proj, q_proj, k_proj, down_proj, v_proj y up_proj. El entrenamiento se realizo en precision bf16 con una longitud maxima de secuencia de 8192 tokens y locale zh-cn en modo estandar (solo texto traducido). La revision del modelo base esta fijada en el commit `005429cee5cb648998cf2b70eebdd83175989c9a` de unsloth/Qwen3.5-9B, y el SHA-256 de los pesos del adaptador es `78d239dcde5030af979030ef5ea5e7d515638b1f46117fae9934f9a184c7ec59`.

La version 0.2 continua directamente el adaptador v0.1 hasta los 8192 tokens sin apilar adaptadores ni aplicar RoPE scaling o YaRN, lo que preserva el comportamiento nativo de la ventana de contexto. La continuacion determinista consumio 800 muestras de entrenamiento: 520 de misma pista coherente, 120 de contexto lejano y recuperacion de glossario, y 160 de replay ordinario, alcanzando el paso absoluto 200. Una innovacion destacable es la conservacion de la cabeza MTP en el GGUF, que permite usar decodificacion especulativa con `--spec-type draft-mtp --spec-draft-n-max 6` en llama.cpp, reduciendo el coste de generacion de salidas JSON largas.

## Capacidades

- Traduccion de japones a chino simplificado de transcripciones ASR, con normalizacion de errores tipicos de Whisper.
- Correccion silenciosa de repeticiones (fragmentos repetidos tres o mas veces se colapsan a uno), errores homofonos y nombres propios segun glossario.
- Aplicacion estricta de glossarios proporcionados en el prompt (terminos, personajes, CVs).
- Preservacion de emocion, tono y registro de personajes en dialogos multi-turno.
- Mapeo de interjecciones y sonidos no verbales (gemidos, respiraciones, onomatopeyas) a equivalentes naturales en chino.
- Salida en JSON estructurado con合并 de fragmentos contiguos, cobertura exacta de IDs de entrada y marcas temporales (start/end en milisegundos).
- Deteccion y anulacion de lineas de copyright de subtitulos (creditos, marcas de agua) mediante `text: null`.
- Soporte de decodificacion estructurada con JSON Schema o gramatica GBNF en llama.cpp, vLLM y outlines.
- Capacidad de contexto largo: escenas coherentes de mas de 60 segmentos de origen en una sola ventana.
- No soporta tool calling ni function calling de proposito general; su funcion esta acotada a la tarea de traduccion.

## Casos de uso

- Subtitulado automatico de ASMR japones: el modelo recibe el JSON de segmentos de Whisper y devuelve un JSON con IDs agrupados y texto en chino simplificado, listo para publicar como subtitulos sincronizados con marcas de tiempo.
- Localizacion de contenido de audio para plataformas de nicho: permite traducir bibliotecas completas de pistas ASMR manteniendo coherencia de personajes y terminologia mediante glossarios por obra.
- Limpieza de transcripciones defectuosas: al normalizar repeticiones, homofonos y lineas de copyright, reduce el trabajo manual de revision antes de la traduccion.
- Pipeline de postproduccion con decodificacion restringida: integrado con llama.cpp y `--json-schema`, garantiza JSON valido en cada generacion y evita reintentos por salidas malformadas.
- Procesamiento por lotes en hardware de consumo: la cuantizacion q4_k_m (5,4 GB) permite ejecutar el modelo en GPUs de 8-12 GB de VRAM para traducir pistas de forma secuencial.
- Servicio de traduccion con latencia reducida: usando la cabeza MTP y decodificacion especulativa en llama.cpp se acelera la generacion de salidas JSON largas en comparacion con decodificacion autoregresiva estandar.
- Investigacion sobre traduccion de dominio especifico: sirve como caso de estudio de ajuste LoRA sobre un modelo de 9B para una tarea estrecha con formato de salida estricto y validacion semantica limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La validacion descrita por el autor es una comprobacion semantica reducida sobre seis filas reservadas (tres ordinarias y tres largas), con decodificacion restringida por gramatica en Q8: las seis completaron con cobertura exacta de IDs y cinco de seis resultaron semanticamente utilizables. No hay metricas BLEU, COMET, MMLU ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6 GB con q4_k_m, 7,5-8 GB con q6_k, 9,5-10 GB con q8_0 y 17-18 GB con bf16, incluyendo overhead de contexto de 8192 tokens.
- GPU recomendadas: RTX 4090 (24 GB) para bf16 o q8_0 con contexto completo; RTX 4080, 4070 Ti o 3090 para q6_k y q8_0; RTX 4060 Ti 16 GB o 4070 para q4_k_m y q6_k.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas con q4_k_m; en 12 GB con q6_k; en 16 GB con q8_0.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), vLLM, outlines para decodificacion estructurada. Ollama y TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion especulativa con MTP (`--spec-draft-n-max 6`) esta soportada en builds de llama.cpp compatibles, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| asmr-qwen3.5-9b-zh-cn-gguf-v0.2 | 9,2 B | 8192 | Traduccion ja→zh-cn de ASR ASMR | Apache 2.0 | GGUF |
| Qwen3.5-9B (base) | 9,2 B | no disponible | Proposito general, multilingue | no disponible | safetensors, GGUF |
| asmr-qwen3.5-9b-zh-tw-echo (mismo autor) | 9,2 B | 8192 | Traduccion ja→zh-tw con validacion ampliada | Apache 2.0 | GGUF |

La comparacion con modelos genericos de traduccion de la misma escala no esta disponible en la informacion proporcionada. Frente al base Qwen3.5-9B, este ajuste sacrifica capacidades generales a cambio de adherencia al formato JSON, normalizacion de ASR y terminologia de dominio. Frente a la variante zh-tw-echo del mismo autor, la zh-cn v0.2 tiene una validacion mas reducida (seis filas frente a la matriz de 100 filas a 4k mas 100 a 8k) y carece de comparacion controlada v0.1 frente a v0.2.

## Limitaciones y advertencias

- La validacion es reducida: seis filas reservadas en lugar de la matriz completa de 200 filas usada en otras variantes del autor.
- ASR de origen catastroficamente corrupto puede provocar contenido inventado aunque la estructura JSON siga siendo valida; el autor documenta un caso con ocho segmentos repetidos de "おやすみなさい".
- Persisten errores de traduccion locales en fragmentos ambiguos o malformados.
- No existe una comparacion controlada completa entre v0.1 y v0.2.
- La validacion se realizo unicamente con Q8_0; las demas cuantizaciones no han sido evaluadas independientemente en calidad.
- Los 8192 tokens son contexto total de ejecucion, no un presupuesto seguro solo para la entrada: hay que reservar espacio para el JSON generado y dividir transcripciones largas o repetitivas en ventanas menores.
- El dominio de entrenamiento incluye dialogo ASMR adulto y el modelo puede producir texto sexualmente explicito; no es adecuado para aplicaciones dirigidas a menores o entornos sin moderacion.
- Riesgo de alucinacion en la normalizacion de transcripciones: el modelo puede "corregir" hacia contenido no presente en la fuente literal.
- Sesgos especificos no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y sobre los derechos del material ASMR original recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mmis1000/asmr-qwen3.5-9b-zh-cn-gguf-v0.2
- Version anterior v0.1: https://huggingface.co/mmis1000/asmr-qwen3.5-9b-zh-cn-gguf-v0.1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Repositorio de llama.cpp (soporte MTP y `--json-schema`): no disponible en la informacion proporcionada
- Documentacion de outlines: no disponible en la informacion proporcionada
- Paper o blog tecnico del autor: no disponible en la informacion proporcionada
