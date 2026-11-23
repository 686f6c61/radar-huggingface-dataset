# greg1506/qwen3-8b-coffee-v10

## Resumen

qwen3-8b-coffee-v10 es un ajuste fino especializado en el dominio del cafe sobre Qwen/Qwen3-8B, desarrollado por el usuario greg1506 dentro del proyecto `coffee-llm-v1`. El modelo parte de los pesos de Qwen3-8B (8.190.735.360 parametros, licencia Apache-2.0) y aplica una adaptacion de dominio sobre el corpus `greg1506/coffee-corpus-v2` (46.258 documentos, aproximadamente 109 millones de tokens ponderados de cafe en el flujo de entrenamiento), seguida de un SFT con LoRA apilado sobre pares pregunta/respuesta sinteticos y minados por LLM.

El objetivo es construir un asistente local y autocontenido de conocimiento cafetero: responder preguntas factoides de barismo, tostado y metodos de extraccion, definir terminos y realizar calculos de dosis de preparacion en los tipos concretos sobre los que fue entrenado. Es un modelo monolingue (ingles) y acotado al corpus, no un asistente general.

La relevancia actual reside en su caracter de "release-of-record" de un proyecto de adaptacion de dominio con trazabilidad de datos poco habitual: el autor documenta explicitamente los tiers de licencia del corpus, advierte de que el checkpoint es una research preview sin garantias de limpieza comercial y publica un benchmark propio (CoffeeBench v6) con sus limitaciones. Ademas, existe una version GGUF Q4_K_M para llama.cpp y un descendiente destilado de 1,7B para movil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B), ajuste fino con LoRA r=32/alpha=64 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | GGUF Q4_K_M disponible; Q5_K_M usado en el destilado de 1,7B |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 (con advertencia de procedencia de datos; ver limitaciones) |
| Formato de pesos | safetensors (transformers); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-8B, un transformer decoder-only de 8,19 mil millones de parametros. El proceso de adaptacion consta de tres fases documentadas: (1) una pasada de continued-pretraining-style sobre un flujo de dominio de 109 millones de tokens ponderados de cafe mediante LoRA (r=32, alpha=64, bf16, secuencia de 512, batch efectivo de 32), seguida de merge del adaptador; (2) un SFT sintetico de instrucciones con rejillas de cociente de ratio de preparacion y rendimiento de extraccion, respuestas numericas desnudas y combinaciones reservadas para el banco de evaluacion; y (3) un top-up final con pares Q/A minados por un servidor local Qwen3-8B con vLLM a partir de 6.000 documentos de entrenamiento del corpus (solo pares sin contenido numerico), con learning rate 3e-5, 3 epocas y early stopping por meseta de evaluacion, sobre aproximadamente 10.763 registros de instruccion (8.149 minados por LLM y 2.614 sinteticos del proyecto).

El top-up minado se compone, por documento fuente, de un 41% de tier abierto, un 48% de share-alike y un 11% de tier restringido. Rondas posteriores de minado no mejoraron la puntuacion (0,753 → empate → 0,714), por lo que v10 se declara el hito de release.

## Capacidades

- Generacion de texto conversacional en ingles sobre dominio cafetero: preguntas factoides de barismo, tostado y metodos.
- Definicion de terminos tecnicos del cafe.
- Calculos de dosis de preparacion en los regimenes entrenados: ratio inverso, solids-mass y extraction-yield inverso (rendimiento solido y EM superiores al 0,93 en el banco).
- Consulta de mapas de tueste (roast-map) y estandares de calidad (quality-standards) con EM perfecto en el banco.
- Clasificacion y mapeo de metodos de preparacion (method-map, EM 0,75 / soft EM 0,88).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Asistente local de conocimiento cafetero: desplegado con llama.cpp u Ollama a partir del GGUF Q4_K_M, responde consultas factoides de baristas y tostadores sin depender de la nube, gracias a su especializacion en el corpus de cafe.
- Calculo de ratios de preparacion: convierte dosis de cafe y agua en ratios y viceversa (ratio-forward 0,98, ratio-inverse 0,85) para recetas de filtro y espresso en el regimen entrenado.
- Consulta de rendimiento de extraccion inverso: dado un rendimiento objetivo y una dosis, estima la masa de bebida necesaria (ey-inverse 0,74) para ajustar recetas en laboratorio o formacion.
- Estandares de calidad y mapas de tueste: responde preguntas sobre grados de tueste y criterios de calidad con EM de 1,00 en el banco, util en materiales de formacion internos de tostadoras.
- Definicion de vocabulario tecnico: glosario interactivo de terminos de cata, proceso y metodo (definition soft EM 0,83) para onboarding de personal.
- Clasificacion de bebidas y metodos: etiqueta y explica categorias de bebidas de cafe y metodos de extraccion (milk-drinks soft EM 0,88) en herramientas de catalogo.
- Base para destilacion a movil: sirve como modelo profesor para destilar conocimiento cafetero en modelos pequenos (ya existe un descendiente Qwen3-1.7B con CoffeeBench EM 0,574 en Q5_K_M).

## Benchmarks y rendimiento

CoffeeBench v6 (336 items reservados; exact match crudo y soft EM robusto al estilo):

| Familia | Raw EM | Soft EM |
|---|---|---|
| roast-map | 1,00 | 1,00 |
| quality-standards | 1,00 | 1,00 |
| legacy-core | 1,00 | 1,00 |
| ratio-forward | 0,98 | 0,98 |
| solids-mass | 0,93 | 0,93 |
| species-origin | 0,87 | 0,93 |
| ratio-inverse | 0,85 | 0,85 |
| ey-inverse | 0,74 | 0,74 |
| method-map | 0,75 | 0,88 |
| definition | 0,67 | 0,83 |
| milk-drinks | 0,62 | 0,88 |
| classification | 0,67 | 0,67 |
| ey-forward | 0,60 | 0,62 |
| calculation | 0,00 | 0,00 |
| **Overall** | **0,753** | **0,789** |

Comparativa de versiones del proyecto:

| Release | Raw EM | Soft EM | Nota |
|---|---|---|---|
| coffee-v2 | 0,735 | no disponible | base de dominio + adaptador instruct v6 |
| coffee-v10 (este) | 0,753 | 0,789 | + top-up de QA sin numericos minado por LLM |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,4 GB en bf16/fp16 (tamano del repo); aproximadamente 5-6 GB con GGUF Q4_K_M; aproximadamente 6-7 GB con Q5_K_M.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 con vLLM/TGI; RTX 4090 (24 GB) para bf16 o cuantizaciones altas.
- Cabe en GPU de consumo: si, con cuantizacion GGUF Q4_K_M o Q5_K_M en GPUs de 8 GB o mas; en bf16 requiere 24 GB o mas.
- Opciones de despliegue: transformers, llama.cpp (GGUF disponible), vLLM (usado por el autor para minado de datos), text-generation-inference (tag `text-generation-inference`), Ollama mediante el GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-coffee-v10 | 8,19B | no disponible | CoffeeBench v6 overall EM 0,753 / soft EM 0,789 | apache-2.0 (con caveat de datos) | HF safetensors + GGUF |
| Qwen/Qwen3-8B (base) | 8,19B | no disponible | no evaluado en CoffeeBench en la informacion disponible | apache-2.0 | HF |
| qwen3-1p7b-coffee-dist2 (destilado del proyecto) | 1,7B | no disponible | CoffeeBench EM 0,574 (Q5_K_M) | no disponible | HF GGUF |

No se dispone de datos de benchmarks de modelos comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Aritmetica directa poco fiable (aproximadamente 60%): los calculos de rendimiento de extraccion hacia delante con decimales fallan de forma silenciosa manteniendo un tono seguro; hay que verificar a mano toda respuesta numerica o limitarse a los regimenes entrenados (ratio-inverse, solids-mass, ey-inverse).
- Lagunas reales en la taxonomia de procesamiento (fermentacion doble keniana, pulped natural, mucilago de honey); con n=9 no dominan el resultado global, pero las respuestas deben tratarse como no verificadas.
- El banco es sintetico y se construyo a partir del mismo corpus de entrenamiento (sin filtracion literal, misma distribucion); no hay evaluacion ciega por expertos, por lo que las puntuaciones son autorreferenciales.
- Las preguntas fuera de dominio no estan verificadas; el modelo no es un asistente general.
- Restricciones de licencia: los pesos base son Apache-2.0, pero el autor no garantiza que los datos de entrenamiento esten libres de terminos share-alike o no comerciales (tier restringido CC BY-NC/ND representa el 25% de los tokens de cafe del flujo completo) y no emite ninguna declaracion de limpieza comercial. No debe distribuirse como producto comercial; la ruta de envio prevista es una reconstruccion con fuentes limpias.
- El dataset publicado contiene solo el tier abierto (43.421 documentos) y no es el flujo exacto de entrenamiento.
- Modelo monolingue en ingles; no apto para produccion multilingue.
- Riesgo de alucinacion en terminos y procesos fuera del corpus; el autor lo declara explicitamente "not a source of record".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/greg1506/qwen3-8b-coffee-v10
- GGUF Q4_K_M: https://huggingface.co/greg1506/qwen3-8b-coffee-v10-GGUF
- Destilado movil 1,7B GGUF: https://huggingface.co/greg1506/qwen3-1p7b-coffee-dist2-GGUF
- Dataset coffee-corpus-v2: https://huggingface.co/datasets/greg1506/coffee-corpus-v2
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
