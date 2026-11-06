# KerzgrAI/Senryu-2.2-1B

## Resumen

Senryu-2.2-1B es un modelo de lenguaje conversacional de 1,09 mil millones de parametros desarrollado por KerzgrAI, tercera iteracion de la familia Senryu-2 y ajuste fino directo de Senryu-2.1-1B. Su rasgo distintivo es una arquitectura hibrida que combina bloques Gated DeltaNet-2 (una variante lineal tipo DeltaNet con compuertas) con mecanismos de atencion denominados parallax attention y una memoria n-gram de 2,17 mil millones de parametros adicionales, lo que permite mantener capacidades conversacionales con una huella computacional muy reducida.

El modelo resuelve el problema clasico de los modelos pequenos: ofrecer chat con razonamiento, uso de herramientas y seguimiento de system prompts sin requerir hardware costoso. La version 2.2 mejora el criterio sobre cuando invocar herramientas (busqueda web, lectura de paginas, calculadora), anade uso de herramientas en multiples pasos y refuerza el razonamiento con trazas completas en bloques `<think>`.

Se publica bajo licencia Apache 2.0, esta centrado en ingles y se distribuye en safetensors (6,5 GB en el repositorio). Mantiene el mismo tokenizador, plantilla de chat y formato de tool calls que Senryu-2.1, por lo que funciona como reemplazo directo (drop-in). Incluye un script de inferencia y una demo publica en Hugging Face Spaces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet-2 + parallax attention + memoria n-gram (engram) |
| Parametros totales | 1.094.961.660 (1,09B) + 2,17B de memoria n-gram |
| Parametros activos | no disponible (arquitectura no MoE; 1,09B nucleo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/FP16 sin especificar) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Senryu-2.2-1B emplea una arquitectura hibrida no transformer pura: combina bloques Gated DeltaNet-2, una variante de red recurrente lineal con mecanismo delta y compuertas, con capas de parallax attention y un modulo de memoria n-gram (denominado engram) que aporta 2,17 mil millones de parametros adicionales sobre el nucleo de 1,09B. Este diseno busca reducir el coste de atencion en secuencias largas manteniendo calidad conversacional. La libreria asociada es `tiny_gdn`.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) sobre Senryu-2.1-1B, anadiendo 405 millones de tokens nuevos, de los cuales la mitad son conversaciones con uso de herramientas, trazas de razonamiento completas en bloques `<think>` y system prompts propios. El corpus de post-entrenamiento combina datasets de chat (smoltalk, smoltalk2, WildChat, LMSYS Chat, UltraChat, no_robots, SlimOrca, OpenAssistant oasst2), de uso de herramientas y agentes (Nemotron-Agentic, When2Call, glaive-function-calling-v2, Hermes tool use, Toucan-1.5M), de razonamiento matematico y codigo (OpenMathReasoning, OpenCodeReasoning, Magicoder, self-oss-instruct-sc2) y de seguimiento de system prompts (Multifaceted-Collection, SystemChat 2.0 y 1.1, SystemCheck). No se especifica en la model card si hubo una fase posterior de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con formato Markdown, tablas, bloques de codigo y expresiones matematicas con delimitadores de dolar.
- Razonamiento explicito mediante bloques `<think>`, entrenado con trazas de razonamiento completas en aproximadamente la mitad de los turnos del corpus nuevo.
- Uso de herramientas (tool calling) con formato propio: busqueda web, lectura de paginas (fetch) y calculadora, con tres herramientas por defecto en el system prompt incluido.
- Uso de herramientas multi-paso: encadena varias rondas (buscar de nuevo si los resultados son pobres, leer una pagina si un resultado esta truncado, calcular con las cifras obtenidas).
- Criterio calibrado sobre cuando invocar herramientas: busca solo cuando faltan datos factuales y responde de su conocimiento propio en caso contrario, reduciendo llamadas innecesarias.
- Seguimiento de system prompts: personas, formatos de salida, reglas y restricciones (entrenado con Multifaceted-Collection y SystemChat).
- Aritmetica asistida: regla de pasar por la calculadora toda operacion mas alla de calculo mental simple (porcentajes, conversiones, potencias, raices, logaritmos, trigonometria).
- Secciones colapsables (HTML details/summary) para respuestas largas con jerarquia de importancia.

## Casos de uso

- Agentes de busqueda web ligeros: el modelo decide cuando buscar y cuando responder de memoria, encadenando multiples rondas de busqueda y lectura de paginas, lo que lo hace adecuado para asistentes que necesitan datos actuales sin depender de un modelo grande.
- Chatbots con calculo fiable: al forzar el paso de todo calculo no trivial por la herramienta calculadora, sirve para asistentes de finanzas personales, conversiones de unidades o estimaciones donde los errores aritmeticos son criticos.
- Asistentes con personas y reglas estrictas: su entrenamiento con SystemChat y Multifaceted-Collection lo hace apto para bots con formatos de salida fijos, restricciones de estilo o instrucciones de sistema complejas.
- Razonamiento con trazas visibles: el bloque `<think>` permite depurar el proceso del modelo, util en herramientas educativas o de verificacion de razonamiento paso a paso.
- Despliegue en hardware modesto: con ~1,09B de parametros nucleo, cabe en GPUs de consumo o incluso CPU, apto para prototipado local y aplicaciones edge.
- Reemplazo directo de Senryu-2.1: al mantener tokenizador, plantilla de chat y formato de tool calls, permite actualizar pipelines existentes sin cambios de integracion.
- Generacion de respuestas estructuradas: uso de Markdown, tablas, secciones colapsables y matematicas en LaTeX para interfaces de documentacion interactiva o resumenes tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 1,09B de parametros nucleo en pesos de 16 bits, aproximadamente 2,2-2,5 GB solo para pesos; la memoria n-gram de 2,17B puede anadir consumo adicional (no se detalla en la model card). En cuantizacion de 4 bits, por debajo de 1 GB para el nucleo (cuantizacion no confirmada por el autor).
- GPUs recomendadas: cualquier GPU moderna con 4-8 GB de VRAM es suficiente en teoria; no hay requisitos oficiales publicados.
- Consumer GPUs: dado el tamano de ~1,1B de parametros, deberia ejecutarse en GPUs como una RTX 3060 de 6 GB o superior, e incluso en portatiles con GPU dedicada; el tamano del repo (6,5 GB) sugiere pesos en precision completa o inclusion de la memoria n-gram.
- Despliegue: la libreria nativa es `tiny_gdn` (no es un transformer estandar de Hugging Face), con script propio `inference.py` incluido en el repo y demo en ZeroGPU Spaces. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada dada la arquitectura no estandar; se recomienda usar el script del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| Senryu-2.2-1B | 1,09B (+2,17B n-gram) | Hibrida Gated DeltaNet-2 + parallax | no disponible | Apache 2.0 |
| Qwen3-1.7B | 1,7B | Transformer denso | 32k (hasta 128k con YaRN) | Apache 2.0 |
| Llama 3.2 1B | 1,24B | Transformer denso | 128k | Llama 3.2 Community License |
| SmolLM2-1.7B-Instruct | 1,7B | Transformer denso | 8k | Apache 2.0 |

Senryu-2.2 destaca por su arquitectura hibrida lineal frente a los transformers densos de su categoria y por su entrenamiento intensivo en tool calling multi-paso, aunque carece de la madurez, benchmarks publicados y ecosistema de despliegue de las alternativas anteriores. A diferencia de Llama 3.2, su licencia Apache 2.0 no impone restricciones de uso.

## Limitaciones y advertencias

- Monolingue en ingles: los tags declaran solo `en`; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Modelo muy pequeno (1,09B): mayor riesgo de alucinaciones y errores factuales que modelos de 7B o mas, especialmente fuera de los dominios cubiertos por sus herramientas.
- Arquitectura no estandar (Gated DeltaNet-2 + n-gram memory): la compatibilidad con el ecosistema habitual (vLLM, llama.cpp, Ollama, TGI) no esta confirmada; requiere la libreria `tiny_gdn`.
- Longitud de contexto no publicada: dificil planificar casos de uso con documentos largos.
- Sin benchmarks publicados: no hay forma independiente de verificar su calidad frente a competidores de su clase.
- Proyecto con traccion muy limitada (325 descargas, 1 like en el momento de la ficha): comunidad pequena, posible soporte y mantenimiento limitados.
- El uso de herramientas depende de que el desarrollador implemente las herramientas (busqueda web, fetch, calculadora) en su aplicacion; el modelo solo emite las llamadas.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero sin garantias de ningun tipo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KerzgrAI/Senryu-2.2-1B
- Demo en Spaces: https://huggingface.co/spaces/KerzgrAI/senryu-2.2-1b-demo
- Modelo base (Senryu-2.1-1B): https://huggingface.co/KerzgrAI/Senryu-2.1-1B
- Organizacion del autor: https://huggingface.co/KerzgrAI
- Articulos arxiv referenciados en los tags: arxiv:2605.22791, arxiv:2605.29157, arxiv:2601.07372 (no se proporcionan URLs completas en la informacion disponible)
