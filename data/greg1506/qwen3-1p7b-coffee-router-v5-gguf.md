# greg1506/qwen3-1p7b-coffee-router-v5-GGUF

## Resumen

`qwen3-1p7b-coffee-router-v5-GGUF` es un modelo derivado de Qwen3-1.7B, afinado por el usuario greg1506 para actuar como **enrutador (router)** de un asistente de cafe offline. No es un modelo de proposito general: su funcion es leer una pregunta sobre cafe y emitir un unico objeto JSON que identifica una calculadora o una consulta a tabla, solicita un argumento que falta o delega la pregunta a la ruta de respuesta en prosa. El modelo no realiza aritmetica ni redacta ensayos; la aritmetica la ejecuta un wrapper externo (`toolcall_dispatch.py`), de modo que el modelo nunca tiene que ser bueno calculando.

El repositorio es un conjunto de despliegue completo en formato GGUF para llama.cpp: dos cuantizaciones (Q5_K_M y Q4_K_M), una gramatica GBNF para decodificacion restringida, el wrapper de referencia con las ocho herramientas y un script de autoverificacion (`verify.py`). El modelo base reporta 1.720.574.976 parametros y la licencia es Apache 2.0.

Su relevancia es metodologica: el autor documenta de forma explicita que las ganancias de rendimiento provienen del contrato de herramientas, el wrapper y las tablas, no de un modelo linguistico mas capaz. Con el mismo conjunto de pesos, sin router ni wrapper, la puntuacion cae a 0.494 EM frente a 0.935 EM del sistema completo, lo que convierte a esta ficha en un ejemplo claro de como separar la capacidad del modelo de la del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en la configuracion recomendada del servidor (`-c 2048`); la ventana nativa del modelo base no se indica |
| Tipos de cuantizacion | Q5_K_M (1.26 GB) y Q4_K_M (1.11 GB); existe tambien una build bf16 de referencia en HF |
| Idiomas soportados | no disponible (la model card no enumera idiomas; el dominio funcional es ingles tecnico de cafe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 2.4 GB |
| Herramientas incluidas | `toolcall.gbnf` (3.6 KB), `toolcall_dispatch.py` (21.9 KB), `verify.py` (7 KB) |
| Plantilla de chat | Qwen3 con `enable_thinking=False` |
| Descargas / likes | 181 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only, y se somete a un SFT (supervised fine-tuning) orientado a enrutamiento de herramientas. La receta de v5 mantiene la misma base, semilla, learning rate y rango que v3, pero anade 601 filas de "answer-path" (hechos de FAQ del producto reescritos y QA destilado de nivel abierto) sin eliminar datos de enrutamiento. El objetivo de esa adicion es el *knowledge replay*: recuperar conocimiento en prosa que el SFT de enrutamiento de v3 habia degradado (la ruta de respuesta paso de 50/87 a 66/87 aciertos).

La innovacion tecnica no esta en los pesos sino en el contrato de despliegue. La decodificacion se restringe con una gramatica GBNF aplicada **por peticion**, no globalmente, de modo que el turno del router queda forzado a JSON valido mientras el turno de respuesta en prosa permanece libre. Cada turno se compone de dos peticiones: la primera genera el objeto de enrutamiento bajo gramatica; la segunda produce la respuesta en prosa. El wrapper valida los argumentos y ejecuta las ocho herramientas en Python puro (solo stdlib). No se documentan datos de RLHF/DPO ni el volumen total de tokens de entrenamiento.

## Capacidades

- Enrutamiento a herramientas: emite un objeto JSON que selecciona una calculadora o una consulta a tabla entre ocho herramientas.
- Solicitud de argumentos faltantes: detecta parametros ausentes y emite una accion `ask` en lugar de inventar valores.
- Delegacion a ruta de respuesta en prosa para preguntas de conocimiento (definiciones, metodos de preparacion, mapas de tueste y procesamiento).
- Salida JSON valida garantizada mediante gramatica GBNF (1.000 de JSON valido en el conjunto de evaluacion de 30 casos).
- Soporte de function calling / tool use como capacidad central, no accesoria.
- Razonamiento aritmetico delegado: el modelo enruta las 249 preguntas aritmeticas del bench, pero el calculo lo ejecuta el wrapper.
- Modo thinking desactivado por diseno (`enable_thinking=False`), con bloque `` vacio para compatibilidad con la plantilla Qwen3.
- Capacidades multilingues: no disponibles; el dominio y los datos estan en ingles.
- No soporta vision ni audio.

## Casos de uso

- Asistente de cafe offline en dispositivo local: el modelo enruta preguntas de usuario a calculadoras (ratio, dosis, temperatura) y tablas de referencia, con un footprint de 1.1-1.3 GB que cabe en hardware modesto y sin conexion.
- Calculo de recetas de extraccion: el wrapper computa ratios y rendimientos a partir de los argumentos validados por el modelo, eliminando errores aritmeticos del LLM en un dominio donde los numeros importan.
- Atencion al cliente de una tienda de cafe: responde FAQ de producto (51/68 en el slice de producto) y escala a herramientas cuando la pregunta requiere un calculo concreto.
- Enrutador en pipelines de agentes: sirve como primera etapa de un sistema multi-herramienta, clasificando la intencion y normalizando argumentos antes de invocar servicios externos.
- Base para prototipos de function calling con decodificacion restringida: el par gramatica + wrapper sirve como plantilla reproducible para construir routers de dominio con modelos pequenos.
- Verificacion de despliegue en CI: `verify.py` ejecuta cinco casos PASS/FAIL y permite validar una instalacion completa de extremo a extremo antes de produccion.
- Investigacion sobre separacion modelo/pipeline: util para estudiar cuanto rendimiento aporta el contrato de herramientas frente al modelo, dado que el autor publica ambas metricas (0.494 EM en crudo frente a 0.935 EM en sistema).

## Benchmarks y rendimiento

CoffeeBench: 336 items sinteticos (aritmetica, definiciones, mapas de metodo de preparacion y de tueste/procesamiento). "System EM" mide el pipeline completo router → argumentos validados → herramienta/tabla.

| Build | System EM (336) | Aritmetica | Routing 30 casos (cold / cached) |
|---|---|---|---|
| HF bf16 (referencia) | 0.938 | 249/249 | 0.967 / — |
| Q5_K_M | 0.935 | 249/249 | 0.967 / 0.967 |
| Q4_K_M | 0.940 | 249/249 | — / 0.967 |
| Pesos solos, sin router ni wrapper | 0.494 EM / 0.515 soft / 0.619 F1 | — | — |
| Base abierto sin afinar (pesos solos) | 0.509 | — | — |

Desglose del 0.935: 249 items aritmeticos enrutados por el modelo y calculados por el wrapper; 87 items de conocimiento respondidos por la ruta en prosa con 66/87 aciertos. Comparativa v3 frente a v5: system EM 0.890 → 0.938 (bf16), ruta de respuesta 50/87 → 66/87, slice de producto 42/68 → 51/68, routing 29/30 estable. Item-level: 20 victorias y 4 derrotas.

Advertencia del autor: la cifra de 0.935 no debe compararse con numeros crudos de otros modelos de cafe (por ejemplo, el 8B v10 reporta 0.753 EM crudo) porque la metrica y el arnes son distintos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1.1 GB (Q4_K_M) y 1.3 GB (Q5_K_M) solo para pesos; con contexto de 2048 tokens y overhead de llama.cpp, el consumo practico ronda 1.5-2 GB.
- Cabe en GPU de consumo: si, en cualquier GPU con 2 GB o mas de VRAM (por ejemplo, GTX 1650 4 GB, RTX 3050, RTX 4060). Tambien es viable en CPU.
- GPU recomendadas para produccion: no se especifican; dado el tamano, cualquier A100, H100 o RTX 4090 queda sobredimensionada y el modelo puede servirse en CPU o en GPU de gama baja.
- Despliegue: llama.cpp (`llama-server`) es la via documentada. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Configuracion recomendada: `-c 2048 -ngl 99 --port 8080`, sin `--grammar-file` global; la gramatica se adjunta por peticion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| qwen3-1p7b-coffee-router-v5 | 1.72B | 2048 (config. recomendada) | 0.935 system EM en CoffeeBench (pipeline completo) | Apache 2.0 | GGUF |
| Qwen3-1.7B (base) | 1.72B | no disponible | 0.509 EM en crudo sobre CoffeeBench | Apache 2.0 | safetensors, GGUF |
| qwen3-1p7b-coffee-router-v3 | 1.72B | no disponible | 0.890 system EM; ruta de respuesta 50/87 | Apache 2.0 | GGUF |
| Modelo de cafe 8B v10 (mencionado por el autor) | ~8B | no disponible | 0.753 EM crudo (metrica distinta) | no disponible | no disponible |

La comparacion con el modelo base y con v3 es la mas significativa: v5 mejora la retencion de conocimiento sin tocar el enrutamiento, y los pesos por si solos quedan practicamente al nivel del base sin afinar en preguntas directas. La comparacion con el 8B v10 no es homogenea segun el propio autor.

## Limitaciones y advertencias

- El modelo es deliberadamente malo en aritmetica; sin el wrapper externo, las 249 preguntas aritmeticas del bench no se resuelven correctamente.
- La cifra de 0.935 EM corresponde al sistema completo (router + wrapper + tablas), no a los pesos. Citarla sin el 0.494 EM de los pesos solos es enganoso.
- La mejora de v5 es retencion y transferencia de fraseo sobre una base de hechos autoria del autor, no generalizacion a hechos no vistos.
- Un fallo conocido de enrutamiento: tc-10 ("How much dissolved solids is in my cup?") solicita `tds_pct` pero no `beverage_g`; es un `ask` parcial defendible, presente tanto en frio como en cache (29/30, no 1.000).
- Los 21 fallos restantes del bench son items de conocimiento en la ruta de respuesta (mapa de metodos 6, mapa de procesamiento 4, especie-origen 3, bebidas con leche 3, definiciones 3, calculo/legacy-core 2).
- No se deben pasar `--grammar-file` global: forzaria JSON en el turno de prosa y romperia la ruta de respuesta.
- El dominio esta limitado al cafe y los datos estan en ingles; el soporte multilingue no esta documentado.
- Riesgo de alucinacion en la ruta de prosa: 21 de 87 items de conocimiento fallan, por lo que las respuestas factuales deben validarse o limitarse a las tablas.
- Uso comercial permitido por Apache 2.0, pero no se documentan sesgos ni evaluaciones de seguridad.
- Solo 181 descargas y 0 likes: ecosistema de validacion muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/greg1506/qwen3-1p7b-coffee-router-v5-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Version anterior (v3): https://huggingface.co/greg1506/qwen3-1p7b-coffee-router-v3-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentacion de gramaticas GBNF: https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada.
