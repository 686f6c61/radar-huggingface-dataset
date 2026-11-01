# nkthebass/tinybrainbot-360m-a75m-v5.1-base

## Resumen

TinyBrainBot-360M-A75M-v5.1-Base es un modelo base de lenguaje pequeño desarrollado por el usuario nkthebass y entrenado desde cero con arquitectura mixture-of-experts (MoE). El modelo cuenta con 383,4 millones de parametros totales, de los cuales solo unos 75 millones se activan por token (24 expertos por capa, con enrutamiento top-4), lo que permite mantener una inferencia ligera sin sacrificar capacidad. Fue entrenado con 17,9 mil millones de tokens, con un enfasis final en conocimiento de nivel escolar.

La version v5.1 sustituye a la v4.1 y mejora en todas las tareas del Open SLM Leaderboard, gracias a una etapa final de entrenamiento (decay) centrada en libros de texto escolares, preguntas y respuestas, y aritmetica. Carga como un `MixtralForCausalLM` estandar sin codigo personalizado, y se distribuye en safetensors y GGUF (F16, Q8_0 y Q4_K_M). Es relevante como ejemplo de modelos pequenos eficientes ejecutables en hardware modesto, aunque se trata de un modelo base: continua texto y no esta alineado para conversacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder MoE (MixtralForCausalLM), GQA, RMSNorm, RoPE, SwiGLU |
| Parametros totales | 383,4M (383.429.376 segun safetensors) |
| Parametros activos | ~75,7M por token (sin embeddings) + 24,6M de embedding empatado |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | F16 (768 MB), Q8_0 (409 MB), Q4_K_M (239 MB) en GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder con 12 capas, dimension oculta de 768 y 12 cabezas de consulta de 64 dimensiones con 4 cabezas KV (grouped-query attention). Cada capa contiene 24 expertos SwiGLU de anchura 512, con enrutamiento top-4 por token, lo que reduce el computo activo a aproximadamente un tercio de los parametros totales. El vocabulario es de 32.000 tokens SentencePiece, y en esta version se conservan los saltos de linea (las versiones anteriores de TinyBrainBot con este tokenizador nunca los habian visto).

El entrenamiento se realizo con 17,9 mil millones de tokens divididos en dos etapas: 16,7B de preentrenamiento a tasa de aprendizaje constante y 1,2B de fase de decay. El preentrenamiento mezclo web educativo (44%: FineWeb-Edu, DCLM, finepdfs-edu), Wikipedia (13%), libros y relatos (11%: Gutenberg, BookCorpus, TinyStories), matematicas (9%: MegaMath, FineMath, Orca-Math), codigo (9%: the-stack-smol), Cosmopedia (7%) y conjuntos destilados de preguntas y respuestas (7%). La fase de decay priorizo preguntas y respuestas (26%), libros de texto escolares (22%), web educativo de alta calidad (22%), Wikipedia (12%), ciencia de primaria y secundaria (10%) y redaccion/sentido comun (5%). No se menciona RLHF ni DPO, coherente con su naturaleza de modelo base.

## Capacidades

- Generacion de texto continuo en ingles (modelo base, sin formato de chat)
- Resolucion de preguntas de ciencia y conocimiento escolar de nivel basico (ARC-Easy 58,96)
- Aritmetica y problemas de matematicas de nivel escolar, incluida generalizacion a problemas no vistos en entrenamiento (47,3 en 1.380 problemas held-out)
- Sentido comun y plausibilidad fisica (PIQA 68,01, HellaSwag 38,68)
- Continuacion de codigo gracias al 9% de datos de codigo (the-stack-smol) en el preentrenamiento
- Carga nativa como `MixtralForCausalLM` en transformers, sin codigo personalizado
- Compatibilidad con llama.cpp, LM Studio, Ollama y Jan mediante GGUF
- No disponible: tool calling, function calling, agentes, vision, audio y modo thinking (no documentados; es un modelo base)

## Casos de uso

- Experimentacion con arquitecturas MoE pequenas: al cargar como un Mixtral estandar con solo 75M de parametros activos, es ideal para investigar enrutamiento de expertos y escalamiento en hardware de consumo.
- Generacion de texto educativo en ingles: entrenado con un 44% de web educativo y una fase final de libros de texto escolares, es adecuado para continuar o redactar explicaciones de nivel escolar.
- Ejecucion local en dispositivos modestos: la version Q4_K_M ocupa solo 239 MB, lo que permite desplegarlo en portatiles sin GPU dedicada mediante llama.cpp, Ollama o LM Studio.
- Prototipado de asistentes offline: combinado con su version Instruct (TinyBrainBot-360M-A75M-v5.1-Instruct), sirve como base para chatbots ligeros que no requieren conectividad.
- Tareas de aritmetica y matematicas escolares: con datos dedicados de Orca-Math, UltraData-Math y conjuntos propios, puede integrarse en herramientas de practica matematica para educacion primaria y secundaria.
- Investigacion en destilacion y curacion de datos: la receta de entrenamiento publicada (mezcla detallada por porcentajes y fase de decay) es util como referencia para entrenar modelos desde cero.
- Completado de codigo basico en editores locales: su exposicion a the-stack-smol permite continuaciones de codigo sencillas, aunque sin garantias de calidad de production.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, conjuntos completos, acc_norm; entre parentesis el raw acc):

| Modelo | Params | Intelligence Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3.0 |
|---|--:|--:|--:|--:|--:|--:|--:|
| TinyBrainBot-360M-A75M-v5.1-Base | 383M (75M activos) | 29,76 | 38,68 (32,75) | 58,96 (64,60) | 36,18 (33,36) | 68,01 (67,68) | 53,00 (53,00) |
| TinyBrainBot-360M-A75M-v4.1-MoE-Base (anterior) | 383M (75M activos) | 24,40 | 37,27 | 55,64 | 32,34 | 66,32 | 42,00 |
| GPT-X3-150M | 149M | 33,05 | 46,2 | 59,6 | 31,3 | 71,3 | 50,9 |
| Boris-2-Preview-2 | 144M | 30,58 | 46,6 | 59,1 | 30,2 | 70,8 | 42,2 |
| KLM-1.5 | 99M | 30,26 | 43,7 | 59,7 | 32,7 | 68,5 | 48,2 |
| Sol Pro | 138M | 28,60 | 46,7 | 54,0 | 31,8 | 71,0 | 36,0 |

Los numeros de los modelos comparados provienen del Open SLM Leaderboard. Adicionalmente, el autor reporta 47,3 en 1.380 problemas de aritmetica held-out, frente a 53,0 en ArithMark-3.0. Ningun resultado esta verificado por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: unos 768 MB de pesos; en Q8_0 unos 409 MB; en Q4_K_M unos 239 MB, mas overhead de contexto (2.048 tokens, minimo).
- Al ser un modelo de 383M con 75M activos por token, cabe con holgura en cualquier GPU de consumo e incluso solo en CPU: no se necesita una GPU dedicada.
- GPUs recomendadas: cualquiera; una RTX 3060, RTX 4060 o superior sobra ampliamente. Tambien funciona en CPUs modernas con velocidad razonable dada la baja carga computacional por token.
- Opciones de despliegue: transformers (nativo), llama.cpp, LM Studio, Ollama y Jan mediante los GGUF publicados. No se documenta soporte para vLLM o TGI, aunque al ser un Mixtral estandar la compatibilidad es plausible (no confirmada).
- Latencia y throughput: no disponibles. La arquitectura MoE con top-4 de 24 expertos sugiere un computo por token equivalente a un modelo denso de ~75M de parametros, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Intelligence Index | Licencia | Disponibilidad |
|---|--:|--:|--:|---|---|
| TinyBrainBot-360M-A75M-v5.1-Base | 383M (75M activos) | 2.048 | 29,76 | Apache 2.0 | HF, safetensors + GGUF |
| TinyBrainBot-360M-A75M-v4.1-MoE-Base | 383M (75M activos) | no disponible | 24,40 | Apache 2.0 | HF (version anterior) |
| GPT-X3-150M | 149M | no disponible | 33,05 | no disponible | Listado en Open SLM Leaderboard |
| KLM-1.5 | 99M | no disponible | 30,26 | no disponible | Listado en Open SLM Leaderboard |

Frente a su predecesor v4.1, la v5.1 mejora en todas las tareas del leaderboard (por ejemplo, ArithMark-3.0 sube de 42,00 a 53,00). Frente a modelos densos mas pequenos como GPT-X3-150M o KLM-1.5, obtiene un indice inferior pese a tener mas parametros totales, aunque supera a ambos en ARC-Challenge y ArithMark-3.0. Modelos densos comparables de tamano similar (Qwen2.5-0.5B, SmolLM2-360M) no aparecen en la informacion proporcionada, por lo que no pueden compararse con datos.

## Limitaciones y advertencias

- Es un modelo base: continua texto y no sabe conversar; para chat hay que usar la version Instruct de la coleccion v5.1.
- Entrenado solo en ingles; no se espera rendimiento en castellano ni en otros idiomas.
- Contexto de 2.048 tokens, muy limitado para documentos largos, RAG o conversaciones multi-turno extensas.
- Riesgo de alucinacion elevado, tipico de modelos de menos de 1B de parametros; los benchmarks no han sido verificados por terceros.
- Sesgos heredados de los datos de web y Wikipedia utilizados en el preentrenamiento; no se documenta ningun proceso de mitigacion.
- Sin alineacion con RLHF o DPO (no documentada), por lo que puede generar contenido ofensivo o incorrecto sin filtros.
- Los resultados del leaderboard comparan modelos de tamanos distintos (99M a 383M), lo que limita la comparabilidad directa.
- La licencia Apache 2.0 permite uso comercial sin restricciones destacables.
- Proyecto de un autor individual con 0 descargas registradas en el momento de la ficha: conviene validar su comportamiento antes de cualquier despliegue serio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v5.1-base
- Version anterior (v4.1): https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v4.1-moe-base
- Coleccion TinyBrainBot v5.1: https://huggingface.co/collections/nkthebass/tinybrainbot-v51-6ae62c352c75b96d0106e2fd
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Paper, repositorio de entrenamiento y demo: no disponibles
