# AIHeikki/brainsurged-chessmaster-qwen3.5-4b

## Resumen

Brainsurged Chessmaster Qwen3.5-4B es un modelo derivado de Qwen3.5-4B, desarrollado por AIHeikki, especializado en la generacion de movimientos de ajedrez en JSON estructurado. Se construye sobre una cadena de ajustes previos (Qwen3.5-4B base, seguido de brainsurged-open-jev-qwen3.5-4b) mediante una tecnica que el autor denomina "weight-space programming": una LoRA quirurgica aplicada sobre las capas 12 a 29 (0,3435% de los parametros) mas una calibracion de "techo de doble prior" sin gradiente en las capas 30 y 31.

El modelo aborda un problema concreto: por que los modelos pequenos con salida JSON restringida fallan al completar partidas de ajedrez enteras, cometiendo "jaques kamikaze" y repitiendo movimientos en lugar de avanzar peones pasados. La propuesta combina cirugia de pesos con un decodificador de arbol de prefijos multi-token de hoja exacta (serving_v6) para mejorar la calidad de decision en partidas completas.

El artefacto principal es una cuantizacion GGUF Q4_K_M de 2,59 GiB (2.783.446.912 bytes) lista para llama.cpp y Ollama, con licencia Apache 2.0. Existe un modelo companero de 0,8B con el mismo entrenamiento que sirve de comparacion de escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-4B), ajuste LoRA sobre capas 12-29 y calibracion en capas 30-31 |
| Parametros totales | 4.326.350.848 (4,33B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (artefacto principal); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y hereda la arquitectura transformer de este. Sobre esa base, el autor aplica una LoRA "quirurgica" limitada a las capas 12 a 29 (cortex medio y superior), que afecta al 0,3435% de los parametros, seguida de una calibracion de "techo de doble prior" sin gradiente en las capas 30 y 31. La cadena de linaje es Qwen/Qwen3.5-4B, luego AIHeikki/brainsurged-open-jev-qwen3.5-4b (v4) y finalmente este v5-chessmaster. El objetivo declarado es estudiar la contribucion relativa de la cirugia de pesos frente a la decodificacion exacta multi-token con trie sobre el rendimiento en partidas completas.

El entrenamiento se orienta a la generacion de movimientos de ajedrez en JSON estructurado, con enfasis en evitar errores tipicos de modelos pequenos: jaques sobre casillas defendidas, repeticion de movimientos de rey y falta de conversion de ventajas. El autor reporta una ablacion que separa el efecto de los pesos del efecto del decodificador: con los pesos v4 y decodificacion voraz, el benchmark de 120 posiciones da 34,17%; solo con el decodificador de hoja exacta sube a 40,00%; con los pesos v5 y decodificacion voraz alcanza 80,83%; y con pesos v5 mas decodificador exacto se mantiene en 80,83%. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de movimientos de ajedrez en formato JSON estructurado, con validacion de legalidad mediante el decodificador de hoja exacta.
- Razonamiento posicional de ajedrez: deteccion de jaques envenenados, proteccion de dama, avance de peones pasados y mate en uno.
- Salida restringida por gramatica (constrained JSON) compatible con decodificacion por trie multi-token.
- Generacion de texto general heredada de Qwen3.5-4B (pipeline text-generation), aunque el ajuste esta orientado al dominio del ajedrez.
- Soporte de despliegue en llama.cpp y Ollama mediante GGUF.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Motor de ajedrez ligero en local: el GGUF Q4_K_M de 2,59 GiB cabe en GPUs de consumo y permite generar movimientos en JSON validable, adecuado para prototipos de analisis o entrenamiento.
- Evaluacion de tecnicas de weight-space programming: sirve como caso de estudio reproducible de como una LoRA quirurgica del 0,3435% de parametros puede multiplicar el rendimiento en un dominio acotado (de 34,17% a 80,83% en el benchmark de 120 posiciones).
- Investigacion sobre decodificacion restringida: el par serving_v5 (voraz) frente a serving_v6 (hoja exacta) permite medir el impacto aislado del decodificador en tareas de JSON estructurado.
- Benchmark de robustez en partidas completas: util para estudiar por que modelos pequenos fallan al encadenar decisiones multi-turno aunque resuelvan bien posiciones aisladas (comparacion 4B frente a 0,8B).
- Integracion en pipelines de analisis de ajedrez: la salida JSON estructurada facilita el parseo automatico y la validacion de legalidad en herramientas de analisis o visores.
- Demostracion educativa de ajuste fino eficiente: ejemplo de bajo coste computacional para ensenar tecnicas de LoRA selectiva y calibracion de capas superiores.
- Pruebas de regresion de modelos derivados: el holdout de 240 posiciones con 98,75% de no regresion sirve como suite de validacion para futuras iteraciones.

## Benchmarks y rendimiento

Resultados del benchmark Holdout-Chessmaster-120 (120 posiciones, sin solapamiento de FEN con las 331 de Jevlab chess_lab) y pruebas de partida completa:

| Modelo y decodificacion | Holdout-120 (Zero-Think) | Tasa de errores kamikaze/shuffle | Jaques envenenados (30) | Proteccion de dama (30) | Avance de peon pasado (30) | Mate en 1 (30) | No regresion Holdout-240 |
|---|---|---|---|---|---|---|---|
| 4B v4 + voraz token-1 (serving_v5) | 34,17% | 22,50% (27/120) | 10,00% | 33,33% | 23,33% | 70,00% | 100,00% |
| 4B v4 + decodificador hoja exacta (serving_v6) | 40,00% (+5,83 pp) | 20,00% (24/120) | 13,33% | 40,00% | 33,33% | 73,33% | 100,00% |
| 4B v5 + voraz token-1 | 80,83% (+46,66 pp) | 0,00% (0/120) | 66,67% | 56,67% | 100,00% | 100,00% | 98,75% |
| 4B v5 + decodificador hoja exacta (serving_v6) | 80,83% (97/120) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Partidas completas contra Jev 1.13.0 (serving_v6 sobre NVIDIA L4):

| Partida | Blancas | Negras | Resultado | Plies | Terminacion | Errores >=300cp (B/N) | Jaques kamikaze (B/N) | p50 motor (WAN p50) |
|---|---|---|---|---|---|---|---|---|
| 1 (4B) | Jev 1.13.0 | Chessmaster 4B | 1/2-1/2 | 140 | Material insuficiente | 14/8 | 4/1 | 130,4 ms (186,4 ms) |
| 2 (4B) | Chessmaster 4B | Jev 1.13.0 | 1-0 | 47 | Jaque mate (24. Rb1#) | 1/4 | 0/1 | 202,2 ms (262,1 ms) |
| 3 (0,8B) | Jev 1.13.0 | Chessmaster 0,8B | 1-0 | 21 | Jaque mate (11. Qc8#) | 2/3 | 0/0 | 54,8 ms (109,7 ms) |
| 4 (0,8B) | Chessmaster 0,8B | Jev 1.13.0 | 1/2-1/2 | 116 | Repeticion quintuple | 11/11 | 1/2 | 54,8 ms (107,9 ms) |

El modelo 4B gano el enfrentamiento en vivo por 1,5-0,5. El companero de 0,8B obtuvo 75,83% en el benchmark de 120 posiciones y perdio 0,5-1,5.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M ocupa 2,59 GiB, por lo que la inferencia requiere aproximadamente 3-4 GB de VRAM o RAM segun backend y contexto.
- GPU recomendadas: NVIDIA L4 (usada en las pruebas del autor), A100, H100 para mayor throughput; RTX 4090 y gamas consumer con >=6 GB de VRAM para el GGUF cuantizado.
- Cabe en GPU de consumo: si, con el GGUF Q4_K_M en tarjetas de 6 GB o superiores (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: llama.cpp, Ollama (etiquetas del repo), y el stack propio serving_v6_chessmaster para decodificacion de hoja exacta.
- Latencia y throughput: p50 de 130,4-202,2 ms por movimiento en NVIDIA L4 con serving_v6 (WAN p50 de 186,4-262,1 ms); el modelo 0,8B logra p50 de 54,8 ms. No se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Brainsurged Chessmaster Qwen3.5-4B | 4,33B | no disponible | 80,83% en Holdout-120; 1,5-0,5 vs Jev 1.13.0 | Apache 2.0 | GGUF en HF |
| Brainsurged Chessmaster Qwen3.5-0.8B | no disponible (companero 0,8B) | no disponible | 75,83% en Holdout-120; 0,5-1,5 vs Jev 1.13.0 | Apache 2.0 | GGUF en HF |
| Brainsurged Open Jev Qwen3.5-4B (v4) | 4,33B (base) | no disponible | 34,17% en Holdout-120 con decodificacion voraz | Apache 2.0 | HF |
| Qwen3.5-4B (base) | 4,33B | no disponible | no disponible en ajedrez | Apache 2.0 (segun linaje) | HF |

No se dispone de comparaciones con motores de ajedrez clasicos (Stockfish, Leela) ni con otros LLM especializados en ajedrez.

## Limitaciones y advertencias

- El modelo esta especializado en ajedrez y salida JSON; su utilidad como modelo de texto general puede estar degradada respecto a Qwen3.5-4B base.
- Persisten errores de jaque kamikaze y repeticion en partidas largas, aunque la tasa en el benchmark bajo a 0,00% con los pesos v5.
- El modelo 0,8B muestra que resolver posiciones aisladas no garantiza jugar partidas completas: un solo fallo de amenaza de largo alcance invalida decenas de jugadas correctas.
- No se documentan sesgos, idiomas soportados ni evaluaciones de alucinacion fuera del dominio del ajedrez.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la calidad de las jugadas generadas.
- El decodificador serving_v6 es parte del stack del autor; sin el, el rendimiento con pesos v5 se mantiene en 80,83% segun la ablacion, pero no se detalla el comportamiento en produccion sin validacion de legalidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIHeikki/brainsurged-chessmaster-qwen3.5-4b
- Modelo base intermedio: https://huggingface.co/AIHeikki/brainsurged-open-jev-qwen3.5-4b
- Modelo companero 0,8B: https://huggingface.co/AIHeikki/brainsurged-chessmaster-qwen3.5-0.8b
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Informe de evaluacion: reports/chessmaster_evaluations/MORNING_REPORT.md (dentro del repositorio)
- Resultados de la campana: reports/chessmaster_evaluations/exp11_chessmaster_campaign_results.json (dentro del repositorio)
- Partidas en vivo: reports/chessmaster_evaluations/live_matches/ (dentro del repositorio)
