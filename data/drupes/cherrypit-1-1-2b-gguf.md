# DRUPEs/CherryPit-1.1-2B-GGUF

## Resumen

CherryPit-1.1-2B es un modelo de lenguaje causal de aproximadamente 2.500 millones de parámetros (2.516.756.480 exactos según los pesos en safetensors), desarrollado por DRUPEs (Dense Representation & Unified Parameter Encoding Systems) y publicado como fine-tune del modelo base openbmb/MiniCPM5-2B. Esta versión 1.1 es la segunda iteración de la familia CherryPit y se distribuye exclusivamente en formato GGUF cuantizado, con el objetivo declarado de ejecutarse en dispositivos de consumo (on-device) mediante llama.cpp, Ollama o LM Studio.

El modelo aborda un problema concreto: el razonamiento con presupuesto de tokens limitado. Según la model card, CherryPit-1.1 está entrenado con refuerzo bajo un presupuesto fijo de pensamiento de 8.192 tokens, de forma que llega a una respuesta dentro de ese margen en lugar de agotar el espacio. Frente a CherryPit-1.0, el autor reporta mejoras notables en matemáticas de competición (MATH-500: 87,8 frente a 78,2 sin modo pensamiento) y en código con razonamiento (LiveCodeBench v6: 46,3 frente a 29,1), así como un salto muy grande en generación de aplicaciones web React (WebApp1K-React: 79,9 frente a 1,6).

Es relevante ahora porque demuestra que un modelo de 2B puede sostener un modo de razonamiento largo y tool calling manteniendo un tamaño de fichero de 1,56 GB en Q4_K_M, lo que lo sitúa en el rango de ejecución en portátiles, mini-PC y GPUs de gama baja. La ventana de contexto declarada es de 128K tokens (131.072), aunque el modelo solo está entrenado y evaluado en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama estándar (modelo denso, no MoE) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q4_K_L, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q2_K_L, IQ3_M, IQ3_XS, IQ2_M (todas con importance matrix) |
| Idiomas soportados | inglés (`en`); resto de idiomas no declarados |
| Licencia | Apache 2.0 (modelo derivado) |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors en este repositorio |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de tipo Llama estándar, según declara el autor en la model card. No hay innovaciones arquitectónicas propias: la aportación se concentra en el post-entrenamiento sobre el modelo base MiniCPM5-2B. El contexto máximo soportado es de 131.072 tokens y el chat template incorpora soporte de tool calling y un modo de pensamiento (thinking) activado por defecto.

El entrenamiento se describe a alto nivel y sin cifras de tokens ni composición del dataset (no disponibles). Se detallan tres técnicas: (1) aprendizaje por refuerzo bajo un presupuesto de pensamiento fijo, para que el modelo cierre la respuesta dentro de 8K tokens; (2) "ladder training" sobre problemas difíciles, en el que el modelo parte de pistas extraídas de sus propias soluciones largas correctas y las pistas se retiran progresivamente hasta que resuelve el problema de forma autónoma (en matemáticas y código); y (3) un comportamiento de compromiso con la respuesta una vez encontrada, en lugar de seguir razonando. No se especifica si hubo DPO, RLHF con anotadores humanos ni el volumen de datos de instrucción utilizado.

Un detalle técnico relevante es la calibración de las cuantizaciones: la importance matrix se calculó a 4K de contexto sobre las propias trazas de razonamiento largas de CherryPit, además de chat general y código, en lugar de sobre respuestas cortas. El autor reporta que esto preserva mejor el modo pensamiento (LiveCodeBench con thinking: 41,1 con Q4_K_M frente a 36,0 con una calibración de respuestas cortas).

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia (el modelo se presenta como CherryPit si no recibe system prompt).
- Razonamiento matemático de competición (AIME, HMMT, AMC, MATH-500) en modo pensamiento con presupuesto de hasta 8.192 tokens.
- Generación de código y resolución de problemas de programación (LiveCodeBench, HumanEval+, MBPP+).
- Generación de componentes y aplicaciones web en React a partir de tests (WebApp1K-React, FullStack Bench en su porción web).
- Tool calling / function calling integrado en el chat template.
- Modo pensamiento conmutable: activado por defecto en la plantilla; se desactiva con `--chat-template-kwargs '{"enable_thinking":false}'` en llama.cpp o con el interruptor de "thinking"/"reasoning" en otras aplicaciones.
- Seguimiento de instrucciones con restricciones estrictas (IFEval en configuración strict, a nivel de prompt).
- Ejecución on-device y en CPU gracias a las cuantizaciones GGUF de hasta 0,97 GB.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistente de matemáticas y competición en local: con el modo pensamiento a 8K tokens, el modelo resuelve problemas tipo AIME/AMC (47,5 y 88,1 respectivamente según el autor) en un portátil sin GPU dedicada, útil para preparación de olimpiadas o verificación de ejercicios.
- Generación de código en el editor: integrado vía llama.cpp u Ollama como servidor compatible con la API de OpenAI en `localhost:8080`, sirve para autocompletar funciones y resolver tareas de LiveCodeBench sin enviar código a la nube.
- Prototipado rápido de interfaces React: dado un conjunto de tests, el modelo genera componentes que los satisfacen (79,9 en WebApp1K-React según el autor), lo que permite esbozar pantallas en un flujo de CI local antes de pasar a un modelo mayor.
- Agentes locales con tool calling: al soportar function calling en la plantilla de chat, puede encadenar llamadas a herramientas (lectura de ficheros, consultas a APIs) en un pipeline de automatización de escritorio o de soporte interno.
- Procesamiento por lotes de documentos largos: con 128K de contexto puede resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada, siempre que el contenido esté en inglés.
- Filtrado y clasificación previa en pipelines RAG: por su tamaño (1,56 GB en Q4_K_M) actúa como primer nivel de reescritura de consultas o de descarte de fragmentos irrelevantes antes de invocar un modelo mayor, reduciendo coste por token.
- Inferencia en dispositivos con recursos limitados: aplicaciones móviles o de escritorio con llama.cpp/PocketPal, Raspberry Pi 5 o mini-PC, donde un 2B cuantizado a Q4_K_M cabe en menos de 2 GB de pesos.
- Evaluación comparativa interna de técnicas de razonamiento: al publicar el autor sus arneses y métricas con semillas fijas, sirve como referencia reproducible para estudiar el efecto del presupuesto de pensamiento y del "ladder training" en modelos pequeños.

## Benchmarks y rendimiento

Datos reportados por el autor, ejecutados con pesos bf16 en vLLM sobre el mismo arnés, ítems, prompts y semillas para ambas versiones. "Thinking, 8K" indica hasta 8.192 tokens de razonamiento antes de responder.

| Benchmark | Configuracion | CherryPit-1.0 | CherryPit-1.1 | Delta |
|---|---|---:|---:|---:|
| AIME 2025 | thinking 8K, media de 4 | – | 47,5 | – |
| AIME 2026 | thinking 8K, media de 4 | – | 56,7 | – |
| HMMT feb 2025 | thinking 8K, media de 4 | – | 29,2 | – |
| HMMT feb 2026 | thinking 8K, media de 4 | – | 27,3 | – |
| AMC 2023 | thinking 8K, media de 4 | – | 88,1 | – |
| MATH-500 | sin thinking, greedy | 78,2 | 87,8 | +9,6 |
| LiveCodeBench v6 | thinking 8K | 29,1 | 46,3 | +17,2 |
| LiveCodeBench v6 (problemas difíciles) | thinking 8K, sonda de 80 problemas | 4,2 | 24,2 | +20,0 |
| LiveCodeBench v6 | sin thinking, media de 4 | 31,7 | 31,0 | −0,7 |
| HumanEval+ | sin thinking, greedy | 85,4 | 82,9 | −2,5 |
| MBPP+ | sin thinking, greedy | 64,5 | 67,2 | +2,7 |
| WebApp1K-React | sin thinking, 1.000 tareas | 1,6 | 79,9 | +78,3 |
| FullStack Bench (porción web) | sin thinking, 98 ítems x5 | 47,2 | 46,6 | −0,6 |
| IFEval | strict, a nivel de prompt | 85,2 | 83,2 | −2,0 |

Agregado sobre los 163 problemas de competición: 51,7. En LiveCodeBench con thinking el modelo consume 6.176 tokens por problema de media, frente a 7.454 en la versión 1.0.

Coste de la cuantización Q4_K_M (fichero descomprimido de nuevo a bf16 y reevaluado en el mismo arnés):

| Benchmark | bf16 | Q4_K_M | Delta |
|---|---:|---:|---:|
| LiveCodeBench v6, thinking 8K | 46,3 | 41,1 | −5,2 |
| LiveCodeBench v6, sin thinking | 31,0 | 29,6 | −1,4 |
| HumanEval+ | 82,9 | 84,8 | +1,9 |
| MBPP+ | 67,2 | 63,8 | −3,4 |
| MATH-500 | 87,8 | 84,8 | −3,0 |
| IFEval | 83,2 | 81,9 | −1,3 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, MMLU-Pro, GPQA ni evaluaciones multilingües.

## Requisitos de hardware

- Tamaño de pesos por cuantización: F16 5,04 GB; Q8_0 2,68 GB; Q6_K 2,07 GB; Q5_K_M 1,81 GB; Q4_K_M 1,56 GB; IQ4_XS 1,42 GB; IQ3_M 1,23 GB; IQ2_M 0,97 GB.
- VRAM estimada para inferencia: con Q4_K_M, aproximadamente 2 GB de pesos más el KV cache. A contextos cortos (4K-8K) el total se mantiene holgadamente por debajo de 4 GB; con la ventana completa de 128K el KV cache crece de forma significativa (el desglose exacto de capas y cabezas no está disponible), por lo que conviene cuantizar el KV cache (`-ctk q8_0 -ctv q8_0` en llama.cpp).
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más (RTX 3060, RTX 4060, RTX 2060, GTX 1660 Super con Q4_K_M). En 4 GB (GTX 1650) es viable con Q3_K_M o IQ4_XS y contexto moderado. También funciona en CPU pura y en Apple Silicon con Metal.
- GPU recomendadas para mayor comodidad: RTX 3060 12 GB o RTX 4060 Ti 16 GB si se quiere contexto largo; A100/H100 no aportan ventaja relevante por el tamaño del modelo y el cuello de botella será la latencia, no la memoria.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI), Ollama (`ollama run hf.co/DRUPEs/CherryPit-1.1-2B-GGUF:Q4_K_M`), LM Studio. vLLM solo se menciona en el contexto de la evaluación del autor con pesos bf16; este repositorio no publica safetensors.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el modo pensamiento con 8K tokens implica generar hasta ~8.000 tokens antes de la respuesta final, lo que domina el tiempo de respuesta en hardware de gama baja.
- Muestreo recomendado por el autor: temperature 1.0, top_p 0.95.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CherryPit-1.1-2B | ~2,5B (dense) | 128K | Apache 2.0 | GGUF | Fine-tune de MiniCPM5-2B con RL bajo presupuesto de pensamiento; solo inglés |
| MiniCPM5-2B (base) | ~2B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Modelo base sin el post-entrenamiento de razonamiento de CherryPit |
| CherryPit-1.0-2B | ~2,5B | 128K (misma familia) | Apache 2.0 | GGUF | Versión previa; peor en thinking y muy inferior en WebApp1K-React (1,6 frente a 79,9) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa multilingüe y más pequeña; sin benchmark comparable en esta información |
| Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Contexto equivalente y multilingüe, pero licencia con restricciones y tamaño mayor |
| Gemma-2-2B | 2B | 8K | Gemma Terms of Use | safetensors, GGUF | Contexto mucho menor y licencia no permisiva |

No se dispone de resultados de benchmarks de estos modelos comparables en la información proporcionada, por lo que la comparación numérica de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Idioma: el modelo solo declara inglés. Su rendimiento en castellano no está evaluado y previsiblemente será deficiente, tanto en generación como en seguimiento de instrucciones.
- Tamaño reducido: con ~2,5B de parámetros, la tasa de alucinación en conocimiento factual es alta; no debe usarse como fuente de verdad sin verificación externa.
- Benchmarks autodeclarados: todas las cifras provienen de la model card del autor, sin replicación independiente. Varias métricas usan media de 4 ejecuciones y arneses propios.
- Saltos llamativos que requieren cautela: la mejora de 1,6 a 79,9 en WebApp1K-React parte de una base casi nula en 1.0, y el autor señala que la capacidad de generar apps React proviene de un "WebDev preview"; conviene validarla en un conjunto propio antes de confiar en ella en producción.
- Regresión en algunas tareas: la versión 1.1 empeora frente a 1.0 en HumanEval+ (−2,5), IFEval (−2,0), LiveCodeBench sin thinking (−0,7) y FullStack Bench (−0,6). No es una mejora uniforme.
- Cuantización: Q4_K_M pierde 5,2 puntos en LiveCodeBench con thinking. El autor recomienda Q5_K_M o superior si hay memoria, y desaconseja explícitamente los ficheros Q2.
- Coste del modo pensamiento: activado por defecto, puede consumir hasta 8.192 tokens antes de responder, con latencia y coste asociados. En tareas simples conviene desactivarlo.
- Contexto largo: aunque se declaran 128K tokens, no se aportan resultados en tareas de recuperación en contexto largo (needle-in-a-haystack u otras), por lo que la calidad efectiva a esa longitud es desconocida.
- Licencia: el modelo derivado se publica como Apache 2.0, pero el modelo base es openbmb/MiniCPM5-2B y sus términos deben verificarse de forma independiente antes de un uso comercial, ya que la familia MiniCPM ha usado históricamente licencias propias distintas de Apache 2.0.
- Madurez del repositorio: 0 descargas y 1 like en el momento de la consulta, con la model card indicando que algunas cuantizaciones se estaban subiendo por fases. Conviene comprobar la integridad de los ficheros antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DRUPEs/CherryPit-1.1-2B-GGUF
- Versión anterior (CherryPit-1.0-2B-GGUF): https://huggingface.co/DRUPEs/CherryPit-1.0-2B-GGUF
- Modelo base (MiniCPM5-2B): https://huggingface.co/openbmb/MiniCPM5-2B
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (informes de Human Rights Watch sobre derechos de la infancia y legislación en Nigeria y El Salvador); no se ha podido extraer de ellos ningún enlace técnico relevante.
