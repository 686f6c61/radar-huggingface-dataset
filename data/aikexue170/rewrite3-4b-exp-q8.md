# aikexue170/rewrite3-4b-exp-q8

## Resumen

rewrite3-exp-4B es un modelo de lenguaje especializado en la reescritura de texto generado por IA (AIGC) para que se asemeje a escritura humana, aplicado al ambito de la novela web en chino. Lo desarrolla el usuario aikexue170 y forma parte de la tercera generacion de la familia rewrite. Su tarea concreta es recibir un texto con marcas de estilo "AIGC" y reorganizarlo preservando el significado original, eliminando los patrones de escritura artificiales (estructuras repetitivas, explicaciones superfluas, acumulacion de paralelismos, exceso emocional).

El modelo se construye sobre el base Qwen3.5-4B mediante LoRA SFT con posterior fusion de pesos, y anade un modo de razonamiento (chain-of-thought) entrenado de forma nativa: antes de reescribir, analiza frase por frase que resulta artificial, con que gravedad y como piensa corregirlo. Esta version es un lote experimental (exp) previo a la publicacion de la version oficial rewrite3, que segun el autor mejorara los resultados de forma notable.

La distribucion analizada es un GGUF con cuantizacion Q8_0 y un cabezal MTP (multi-token prediction) integrado en los pesos para acelerar la decodificacion especulativa. El modelo tiene 4.326.350.848 parametros y una ventana de contexto operativa recomendada de 8192 tokens. Esta pensado para autores y plataformas de novela web que quieran un primer pase automatico de "humanizacion" antes de la revision manual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con cabezal MTP para decodificacion especulativa |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el ejemplo de despliegue del autor) |
| Tipos de cuantizacion | Q8_0 (GGUF); el autor no documenta otras en esta ficha |
| Idiomas soportados | no disponible (el material de entrenamiento y los ejemplos son en chino) |
| Licencia | hereda la licencia del base Qwen3.5 (no se especifica el identificador exacto) |
| Formato de pesos | GGUF (Q8_0); el repo ocupa 4,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y se afina mediante LoRA SFT, tras lo cual los pesos se fusionan. Sobre esa base se anade un modo de razonamiento entrenado: el modelo produce primero un analisis editorial (identificacion de frases artificiales, gravedad de cada una, plan de correccion) y despues el texto reescrito, separados por el token `</think>`. Ademas, se entrena por separado un cabezal MTP (multi-token prediction) que queda embebido en los pesos (`block_count=33`, `nextn_predict_layers=1`) para habilitar decodificacion especulativa sin fichero draft externo; el autor reporta teacher-forced top1 del 72,8 % y accept_proxy del 83,7 %.

El entrenamiento se construye a partir de 20.000 textos originales de novela web humana (con contenido SFW y NSFW) seleccionados por su buena acogida en distintas plataformas. Sobre ellos se definieron mas de 100 patrones de "estilo AIGC" (sintaxis, ritmo, tono, imagenes, transiciones, mania explicativa) y se generaron pares (texto bueno, texto degradado) usando deepseek v4.1 flash 1017. El modelo teacher jevnovel3 27B puntua cada frase degradada con una probabilidad de "mala calidad", y gemini 4 argon construye la cadena de analisis que conecta texto degradado, tipo de patron, puntuacion y texto bueno. Esa cadena de razonamiento se usa como supervision junto con el resultado de reescritura.

Una particularidad del lote exp es que la tarea esta definida como "modo reduccion": el objetivo es comprimir el texto a entre 0,4 y 1,0 veces la longitud original (mediana en torno a 0,7), porque el texto AIGC suele estar inflado. No es truncamiento: es el objetivo de entrenamiento de esta version.

## Capacidades

- Reescritura de texto preservando el significado original, con eliminacion de patrones de escritura AIGC.
- Razonamiento editorial explicito (chain-of-thought entrenado): analisis frase por frase antes de reescribir.
- Uso de puntuaciones externas por frase (formato `【0.04】`, o `【NA】` si no hay) para calibrar la intensidad de la correccion.
- Procesamiento de fragmentos largos sin segmentacion previa (mejora sustancial frente a rewrite2-4b, que carecia de CoT y requeria trocear).
- Salida estructurada con separador `</think>` entre analisis y texto final, compatible con el campo `reasoning_content` de llama.cpp server.
- Decodificacion especulativa mediante cabezal MTP integrado.
- Capacidad conversacional (tag `conversational`) y compatibilidad con endpoints.
- No se documentan capacidades de vision, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Humanizacion de manuscritos de novela web: el autor pega un capitulo completo generado o asistido por IA y el modelo devuelve una version con sintaxis y ritmo mas naturales, que el autor revisa y retoca. Adecuado por su entrenamiento especifico en este dominio y su capacidad de procesar fragmentos de varios miles de caracteres sin trocear.
- Pipelina de preedicion editorial: integrado tras un generador AIGC, el modelo actua como primer filtro de estilo antes de la revision humana, reduciendo el tiempo de correccion manual.
- Deteccion y correccion de "八股" (formulas vacias): gracias al CoT, el modelo no solo reescribe, sino que explica que frases son artificiales y por que, lo que sirve como material de formacion para editores.
- Normalizacion de estilo en plataformas con muchos autores: aplicar el modelo de forma consistente sobre manuscritos dispares para acercarlos a un registro humano homogeneo.
- Compresion de textos inflados: al tener como objetivo reducir a 0,4-1,0 veces la longitud original, es util para eliminar relleno en textos donde la densidad informativa es baja.
- Reproduccion y comparacion de experimentos: al ser un lote experimental archivado, sirve para replicar resultados y mantener compatibilidad con proyectos antiguos que dependian de esta version.
- Aceleracion en hardware modesto: con el cabezal MTP y cuantizacion Q8_0, puede desplegarse en GPUs de gama consumer para procesamiento por lotes de capitulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas internas del cabezal MTP: teacher-forced top1 del 72,8 % y accept_proxy del 83,7 %.

## Requisitos de hardware

- VRAM estimada: el repo GGUF Q8_0 ocupa 4,6 GB, por lo que la inferencia completa requiere aproximadamente 5-6 GB de VRAM considerando el contexto de 8192 tokens.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q8_0 con contexto completo; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 son opciones validas. En GPUs con menos VRAM puede recurrirse a offload parcial a CPU con `-ngl`.
- Cabe en GPUs consumer: si, en modelos con 8 GB o mas de VRAM para Q8_0; con cuantizaciones menores (no documentadas en esta ficha) cabria en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp server (recomendado, con soporte de Qwen3.5 MTP desde b11946 en adelante, usando `--spec-type draft-mtp --spec-draft-n-max 3`), y por extension cualquier frontend compatible con GGUF (Ollama, etc.). El tag `endpoints_compatible` sugiere compatibilidad con endpoints.
- Latencia y throughput: no disponibles de forma numerica. El autor indica que la decodificacion especulativa con MTP acelera la inferencia en tarjetas de gama baja, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite3-exp-4B (este) | 4,33 B | 8192 | Reescritura de novela web con CoT | Hereda Qwen3.5 | GGUF Q8_0 en HF |
| rewrite2-4b | no disponible | no disponible | Reescritura sin CoT, requiere trocear | no disponible | GGUF en HF |
| Qwen3.5-4B (base) | ~4 B | no disponible | Modelo generalista | Licencia Qwen3.5 | Amplia |

El autor solo menciona explicitamente rewrite2-4b como predecesor y Qwen3.5-4B como base. No se dispone de datos de rendimiento comparativo con otros modelos de reescritura o de dominio similar.

## Limitaciones y advertencias

- Version experimental archivada: el autor indica que no recibira mas actualizaciones y recomienda usar la version oficial rewrite3 cuando se publique.
- La salida es siempre mas corta que la entrada (objetivo de 0,4-1,0 veces, mediana 0,7). Si se necesita preservar la longitud original, esta version no lo hace.
- Depende fuertemente de las puntuaciones de jevnovel por frase: sin ellas (`【NA】`), la intensidad de correccion baja y la calidad empeora.
- El CoT consume muchos tokens (a menudo 3000-4000); con `max_tokens` insuficiente el modelo puede devolver solo el analisis sin el texto reescrito.
- Entrenado sobre novela web en chino, con contenido SFW y NSFW; los sesgos y el registro estan condicionados por ese corpus. No se documentan idiomas soportados fuera del chino.
- Riesgo de alucinacion en la fase de analisis (afirmaciones sobre el texto que no se corresponden con el original), aunque el texto final se supone anclado al original.
- La licencia exacta no se especifica en la ficha; hereda la de Qwen3.5, por lo que debe verificarse antes de uso comercial.
- El contenido NSFW del corpus de entrenamiento puede aflorar en salidas; conviene filtrar en produccion.
- Requiere una version de llama.cpp con soporte de Qwen3.5 MTP (b11946 o posterior) para aprovechar la decodificacion especulativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aikexue170/rewrite3-exp-4b-exp-q8
- Predecesor rewrite2-4b: https://huggingface.co/aikexue170/rewrite2-4b-gguf
- Modelo de puntuacion jevnovel 0.8B: https://huggingface.co/aikexue170/jev-novel-3-0.8b-fp8
