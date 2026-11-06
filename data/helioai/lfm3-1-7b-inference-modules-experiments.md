# HelioAI/LFM3-1.7B-inference-modules-experiments

## Resumen

LFM3-1.7B-inference-modules-experiments es un release experimental y no oficial publicado por el usuario HelioAI sobre el modelo base LiquidAI/LFM3-1.7B de Liquid AI. No se trata de un modelo nuevo con pesos reentrenados, sino de un registro de investigación y un sistema de inferencia que envuelve al modelo original sin modificar sus pesos. El objetivo es demostrar que un modelo de razonamiento de tan solo 1.700 millones de parámetros puede mejorar de forma medible en tareas de matemáticas y código mediante módulos de lógica de control aplicados en tiempo de inferencia (presupuesto de razonamiento, consenso temporal, ejecución y reparación de código, voto ponderado sobre razonamientos paralelos).

El modelo base LFM3-1.7B es un transformer de texto de Liquid AI basado en la arquitectura tri-híbrida LFM3, con una ventana de contexto de 256.000 tokens y soporte nativo de tool calling, pensado para agentes locales y aplicaciones especializadas. Sobre él, este repositorio aporta los pesos en formato GGUF (Q5_K_M entre otros) listos para llama.cpp, junto con un servidor compatible con la API de OpenAI que orquesta los módulos de inferencia.

La relevancia del proyecto es doble: por un lado, cuantifica con intervalos de confianza emparejados cuánto se puede ganar sin tocar los pesos (por ejemplo, +20 puntos de precisión en un conjunto de 180 problemas de matemáticas solo activando el presupuesto de razonamiento de llama.cpp); por otro, documenta explícitamente los resultados negativos, algo poco habitual en releases de modelos. La licencia es la LFM Open License v1.0 de Liquid AI, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido LFM3 (modelo base LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 256K tokens (modelo base); en las pruebas del repo se usan ventanas de 32.768 tokens y presupuestos de razonamiento de 4.608 a 16.384 tokens |
| Tipos de cuantizacion | GGUF Q5_K_M (usado en la mayoría de experimentos); bf16 en los experimentos de referencia; safetensors en el repo |
| Idiomas soportados | en, ru |
| Licencia | LFM Open License v1.0 (lfm1.0, etiquetada como "other") |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo subyacente, LiquidAI/LFM3-1.7B, emplea la arquitectura tri-híbrida LFM3 de Liquid AI, un diseño de transformer de texto orientado a agentes locales con contexto de 256.000 tokens y tool calling nativo. Este repositorio no entrena ni afina el modelo: los pesos son los originales de Liquid AI y todas las ganancias provienen de módulos de inferencia en tiempo de ejecución. El autor lo declara explícitamente y documenta que los intentos de incorporar esa lógica dentro de los pesos (carpeta `experimental/`) no produjeron ganancias significativas.

Los módulos de inferencia son cuatro: (1) un módulo de deliberación que cierra el razonamiento en el último final de frase cuando se agota el presupuesto y extrae la respuesta, más un consenso temporal que sondea la respuesta cada 2.048 tokens en preguntas de opción múltiple; (2) un módulo de código que ejecuta el programa sobre los ejemplos públicos del enunciado y lo repara hasta dos rondas, conservando la reparación solo si pasa estrictamente más ejemplos; (3) razonamiento paralelo ×4 con voto ponderado; y (4) un módulo de respuestas visuales con renderizado y reparación. Los experimentos se ejecutaron en una única RTX 4080 Laptop de 12 GB, con comparaciones emparejadas (mismos problemas, mismas semillas) e intervalos de confianza al 95% por bootstrap emparejado. En trazas de razonamiento del propio modelo, Q5_K_M difiere de bf16 en una KL de 0,008 nats/token.

## Capacidades

- Generación de texto y razonamiento multi-paso con trazas de pensamiento extensas (thinking mode nativo del modelo base).
- Razonamiento matemático: resolución de problemas tipo competición (AIME, MATH-500) y aritmética escolar (GSM8K).
- Generación de código con ejecución y reparación automática sobre los ejemplos del enunciado (LiveCodeBench, HumanEval+, MBPP+).
- Tool calling y function calling nativo en el modelo base, con soporte de búsqueda de herramientas (`search_tools`) documentado por Liquid AI.
- Despliegue como agente local mediante el servidor incluido, compatible con la API de OpenAI (`/v1/chat/completions`, modelos "lfm3-deliberate" y "lfm3-deliberate-x4").
- Razonamiento paralelo con voto ponderado (variante ×4) para tareas de alta dificultad.
- Capacidades multilingües limitadas a inglés y ruso.
- Soporte de presupuesto de razonamiento configurable (`--reasoning-budget`) directamente en llama-server.
- Cumplimiento de instrucciones con prompt estricto (IFEval) y razonamiento de sentido común (BBH).

## Casos de uso

- Resolución de problemas matemáticos con presupuesto acotado: usar `llama-server` con `--reasoning-budget 4608` y un `max_tokens` unos 1.500 por encima permite pasar de un 42,8% a un 62,8% de precisión en problemas de matemáticas de desarrollo, evitando respuestas vacías por corte del razonamiento. Es adecuado cuando el coste por consulta está limitado y no se puede dejar que el modelo piense indefinidamente.
- Generación de código en pipelines de evaluación: el módulo de test-and-repair ejecuta el programa sobre los ejemplos públicos del enunciado y lo corrige hasta dos rondas, lo que elevó LiveCodeBench v6 de 32,6 a 52,0. Encaja en entornos donde el enunciado incluye casos de prueba ejecutables.
- Asistentes locales de agente en hardware de consumo: con 1.700 millones de parámetros y cuantización Q5_K_M, el sistema completo cabe en una GPU de 12 GB (RTX 4080 Laptop) y expone una API compatible con OpenAI, por lo que se puede conectar a Open WebUI o LM Studio como cliente.
- Sustitución de un endpoint de razonamiento en prototipos: el servidor `lfm3_server.py` acepta clientes OpenAI estándar, lo que permite comparar cara a cara contra un llama-server desnudo con `compare.py` antes de comprometerse con un proveedor externo.
- Tareas de opción múltiple con corte temprano: el consenso temporal sondea la respuesta cada 2.048 tokens y detiene el razonamiento cuando los sondeos coinciden, útil para clasificación y exámenes tipo MMLU-Pro donde se quiere reducir latencia sin perder precisión.
- Investigación sobre inference-time scaling: el repositorio incluye el informe completo (en ruso, unos 40 experimentos, incluidos los fallidos) y los scripts, lo que sirve como base reproducible para estudiar qué técnicas de escalado en inferencia funcionan y cuáles no en modelos pequeños.
- Cumplimiento estricto de formato en producción: con IFEval en 95,01% tras el módulo de deliberación, el sistema es apto para tareas donde la salida debe respetar restricciones de formato verificables automáticamente.

## Benchmarks y rendimiento

Resultados publicados en la model card (comparaciones emparejadas, 95% CI por bootstrap emparejado; bf16 con presupuesto de 16k salvo donde se indique):

| Conjunto de evaluación | n | Base | Con módulo | Δ [95% CI] |
|---|---|---|---|---|
| AIME 2024+2025 (4 muestras) | 60 | 52,50 | 56,67 | +4,17 [+2,08, +6,67] |
| MATH-500 | 500 | 94,00 | 96,00 | +2,00 [+0,80, +3,20] |
| MMLU-Pro (14 categorías) | 1400 | 62,21 | 63,93 | +1,71 [+0,79, +2,64] |
| IFEval (prompt estricto) | 541 | 94,27 | 95,01 | +0,74 [+0,18, +1,48] |
| GSM8K / MBPP+ / HumanEval+ / BBH | — | — | — | ≈ 0 (sin regresiones significativas) |
| Media de 8 conjuntos | — | 81,55 | 82,71 | +1,16 |

Prueba del presupuesto de razonamiento con llama-server puro (Q5_K_M, 180 problemas de matemáticas de desarrollo, mismas semillas, 6.144 tokens en total):

| Configuración | Precisión | Sin respuesta |
|---|---|---|
| llama-server desnudo | 42,8 | 78 de 180 |
| + `--reasoning-budget 4608` | 62,8 | 0 de 180 |
| Δ | +20,0 [+14,4, +26,1] | — |

LiveCodeBench v6 (175 problemas, enero-abril de 2025):

| Configuración | Precisión | Δ |
|---|---|---|
| Modelo base | 32,6 | — |
| + módulo de deliberación | 47,4 | +14,9 [+9,7, +20,6] |
| + test-and-repair | 52,0 | +4,6 [+1,7, +8,0] |

Comprobación en conjunto reservado: LiveCodeBench v5 (167 problemas) con los módulos congelados pasa de 34,1 a 56,9 (+22,8 [+16,8, +29,3]). Una réplica exacta del harness oficial de LCB da 32,0 → 52,0 en v6.

## Requisitos de hardware

- VRAM estimada: en torno a 1-2 GB para el modelo en Q5_K_M con overhead de contexto moderado; el sistema completo con servidor y slots paralelos se ejecutó en una GPU de 12 GB.
- GPU recomendadas: RTX 4080 Laptop (12 GB) es el hardware de referencia de los experimentos; cualquier GPU consumer con 8 GB o más debería alojar el modelo cuantizado, aunque el número de slots paralelos y la longitud de contexto condicionan el consumo.
- Cabe en GPU de consumo: sí, en Q5_K_M y cuantizaciones similares; el modelo base tiene 1.728.801.600 parámetros.
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl 99 -c 32768 -fa on --reasoning-budget`), el servidor incluido `lfm3_server.py` (API compatible con OpenAI en el puerto 8090), y clientes OpenAI-compatibles como Open WebUI o LM Studio. Liquid AI documenta compatibilidad del modelo base con vLLM y SGLang.
- Latencia y throughput: no disponible de forma agregada; los experimentos se hicieron en una única RTX 4080 Laptop con 8 slots configurados en el servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-inference-modules-experiments (este repo) | 1,73B | 256K (base) | LFM Open License v1.0 | Hugging Face, GGUF + servidor | Ganancias por módulos de inferencia; resultados negativos documentados |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 256K | LFM Open License v1.0 | Hugging Face, vLLM, SGLang, llama.cpp | Punto de partida sin módulos; tool calling nativo |
| Alternativas de ~1-2B con razonamiento | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos comparativos de otros modelos en la información disponible |

## Limitaciones y advertencias

- Release experimental y no oficial: el autor declara explícitamente que no reclama la propiedad del modelo y que todo se distribuye bajo la licencia de Liquid AI.
- Las mejoras no están dentro del GGUF: un archivo de pesos no puede contener la lógica de control (cierre del razonamiento, ejecución de código, voto paralelo, renderizado visual). Para reproducir el sistema completo hay que ejecutar el servidor incluido, no solo el GGUF.
- Los intentos de incorporar la lógica en los pesos (`experimental/`) no dieron ganancias significativas, según el propio autor.
- El cierre abrupto del razonamiento con `--reasoning-budget` de llama.cpp no equivale al módulo: el flag corta en seco, mientras que el módulo cierra en el último final de frase.
- Con presupuestos pequeños (por ejemplo, 2.048 tokens) el sistema devuelve respuesta pero puede ser incorrecta; el autor recomienda un presupuesto por defecto de 8.192 tokens o más.
- Idiomas limitados a inglés y ruso; no hay soporte declarado de castellano.
- Riesgo de alucinación inherente a un modelo de 1,7B, especialmente en tareas de conocimiento factual fuera de los dominios evaluados.
- Sesgos: no se documentan análisis específicos de sesgo en la información disponible.
- Restricciones de licencia: la LFM Open License v1.0 puede imponer condiciones al uso comercial; conviene revisar el archivo LICENSE antes de desplegar en producción.
- El informe completo de experimentos está en ruso, lo que puede dificultar la auditoría a lectores no rusoparlantes.
- Cero descargas y cero likes en el momento de la consulta: no hay validación independiente de la comunidad sobre estos resultados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HelioAI/LFM3-1.7B-inference-modules-experiments
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM3-1.7B
- Documentación de Liquid AI sobre LFM3-1.7B: https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Informe completo de experimentos (en ruso): `research/REPORT.md` dentro del repositorio
- Script del presupuesto de razonamiento: `research/scripts/rbud_test.py`
- Resultados por ítem: `research/results/rbud/`
- Servidor compatible con OpenAI: `lfm3_server.py` en el repositorio
- Script de comparación: `compare.py` en el repositorio
