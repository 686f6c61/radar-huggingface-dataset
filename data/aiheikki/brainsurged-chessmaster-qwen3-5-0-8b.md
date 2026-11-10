# AIHeikki/brainsurged-chessmaster-qwen3.5-0.8b

## Resumen

Brainsurged Chessmaster Qwen3.5-0.8B es un ajuste fino especializado en ajedrez del modelo Qwen3.5-0.8B, desarrollado por AIHeikki dentro de la familia de experimentos "Brainsurged". El modelo parte de la variante intermedia `brainsurged-open-jev-qwen3.5-0.8b` (v4) y aplica una LoRA quirúrgica de rango 16 sobre las capas 8 a 21, seguida de una calibración de "techo" sin gradiente en las capas 22 y 23. El resultado se distribuye principalmente como un GGUF cuantizado en Q4_K_M de 516,8 MiB, pensado para inferencia en el borde (edge) con llama.cpp u Ollama.

El problema que aborda es la toma de decisiones estructuradas en ajedrez (selección de jugada) con un modelo de lenguaje de muy pequeño tamaño. El autor reporta una mejora sustancial en un banco de 120 posiciones no vistas: del 10,83 % al 75,83 % al emplear un decodificador de "hoja exacta" (branch-and-bound) sobre el modelo. Se trata, por tanto, de un artefacto de investigación orientado a la evaluación de técnicas de programación en el espacio de pesos y decodificación estructurada, más que de un motor de ajedrez de propósito general.

La relevancia actual reside en su enfoque: demuestra que un modelo de 772 millones de parámetros, cuantizado a poco más de 500 MiB, puede alcanzar tasas de acierto notables en subtareas acotadas (conversión de peón pasado, mate en 1) cuando se combina con un decodificador restringido por las reglas del juego. No obstante, en partidas completas multi-turno el modelo pierde frente a motores dedicados, lo que ilustra la brecha entre resolver posiciones aisladas y jugar de forma sostenida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), ajuste LoRA sobre capas 8-21 y calibración en capas 22-23 |
| Parametros totales | 772.845.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (artefacto principal, 516,80 MiB); otros tipos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-0.8B, un transformer decoder-only de 24 capas con dimensión oculta d=1024, según se deduce de la model card. El ajuste se realiza en dos etapas: primero, una LoRA de rango 16 dirigida a las capas intermedias y superiores (8 a 21), que representa el 0,6337 % de los parámetros; segundo, una calibración de "techo" con gradiente cero sobre las capas 22 y 23. Esta estrategia de "programación en el espacio de pesos" busca modificar selectivamente las representaciones de decisión sin reentrenar el modelo completo.

El entrenamiento se orienta a tareas de ajedrez estructuradas: conversión de peón pasado, defensa de la reina, detección de jaques envenenados y mate en 1. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación destacable es el decodificador "Exact-Leaf Branch-and-Bound" (`serving_v6`), un mecanismo de búsqueda restringida que guía la generación hacia jugadas legales y evalúa hojas exactas, lo que explica la mayor parte de la mejora en el banco de pruebas.

## Capacidades

- Generación de texto y razonamiento acotado a dominios estructurados (ajedrez).
- Selección de jugadas legales en posiciones de ajedrez mediante decodificación restringida.
- Resolución de subtareas tácticas: mate en 1, conversión de peón pasado, defensa de casillas críticas.
- Salida estructurada (structured-output) compatible con el decodificador de hoja exacta.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado a la secuencia de jugadas dentro de una partida.
- Capacidades multilingües: no disponibles.
- Modo "thinking" o visión/audio: no disponibles.

## Casos de uso

- Evaluación de técnicas de weight-space programming: el modelo sirve como banco de pruebas para medir el impacto de LoRAs quirúrgicas y calibraciones selectivas en modelos pequeños, comparando v4 frente a v5 con métricas concretas (10,83 % → 75,83 %).
- Decodificación estructurada en el borde: puede desplegarse en dispositivos con poca memoria (516,8 MiB en Q4_K_M) para generar jugadas legales en un entorno con recursos limitados, usando llama.cpp u Ollama.
- Investigación en sistemas "System-1": su etiqueta `system-1` y `decision-engine` sugiere su uso como motor de decisión rápida (p50 de 54,8 ms en puerta de enlace) para estudiar arquitecturas de decisión reactiva.
- Generación de datasets sintéticos de ajedrez: el modelo puede producir secuencias de jugadas etiquetadas para entrenar o validar otros sistemas, aunque con las limitaciones de horizonte descritas.
- Comparación de estrategias de decodificación: permite contrastar decodificación greedy (serving_v5) frente a branch-and-bound (serving_v6) sobre el mismo modelo base, con métricas reproducibles en el banco Holdout-Chessmaster-120.
- Docencia y divulgación técnica: ilustra de forma empírica la diferencia entre resolver posiciones aisladas y jugar partidas completas, un caso de estudio útil en cursos de IA aplicada.

## Benchmarks y rendimiento

Los datos provienen del banco `Holdout-Chessmaster-120` (120 posiciones no vistas) y del banco de no regresión `Holdout-240`, según la model card.

| Modelo y decodificación | Holdout-120 (Zero-Think) | Holdout-120 (Micro-Blink) | Tasa de errores kamikaze/shuffle | Poisoned Check (30) | Queen Guard (30) | Passed-Pawn Push (30) | Mate-in-1 (30) | Holdout-240 |
|---|---|---|---|---|---|---|---|---|
| 0.8B v4 + Greedy Token-1 (serving_v5) | 10,83 % | 15,83 % | 39,17 % (47/120) | 6,67 % | 16,67 % | 0,00 % | 20,00 % | 90,41 % |
| 0.8B v5 + Exact-Leaf Decoder (serving_v6) | 75,83 % (91/120) | 73,33 % | 4,17 % (5/120) | 56,67 % | 53,33 % | 100,00 % (30/30) | 93,33 % (28/30) | 90,42 % |
| 4B v4 + Greedy Token-1 (serving_v5) | 34,17 % | 35,00 % | 22,50 % (27/120) | 10,00 % | 33,33 % | 23,33 % | 70,00 % | 100,00 % |
| 4B v5 + Exact-Leaf Decoder (serving_v6) | 80,83 % (97/120) | 80,83 % | 0,00 % (0/120) | 66,67 % | 56,67 % | 100,00 % (30/30) | 100,00 % (30/30) | 98,75 % |

En partidas completas frente a Jev 1.13.0, el 0.8B perdió una partida (0–1 en 21 jugadas, mate `11. Qc8#`) y empató otra (½–½ en 116 jugadas por repetición quíntuple), con latencias p50 de 54,8 ms en puerta de enlace y 107,9-109,7 ms en WAN. El modelo 4B de la misma familia logró 1½–½. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en Q4_K_M (516,8 MiB de pesos más overhead de contexto y KV cache).
- GPU recomendadas: NVIDIA L4 (usada en el rematch en Cloud Run), así como cualquier GPU consumer con 2 GB o más de VRAM.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3050, RTX 4060, GTX 1650 o superiores; también en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta `ollama`), y servidores compatibles con endpoints (`endpoints_compatible`). No se menciona soporte de vLLM o TGI.
- Latencia y throughput: p50 de 54,8 ms en puerta de enlace y 107,9-109,7 ms en WAN para el decodificador Exact-Leaf en una NVIDIA L4; no se dispone de cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en Holdout-120 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Brainsurged Chessmaster 0.8B (este) | 772,8 M | No disponible | 75,83 % (v5, Exact-Leaf) | Apache-2.0 | GGUF en Hugging Face |
| Brainsurged Chessmaster 4B | No disponible en esta ficha | No disponible | 80,83 % (v5, Exact-Leaf); 1½–½ vs Jev 1.13.0 | Apache-2.0 (según familia) | Hugging Face |
| Brainsurged Open Jev Qwen3.5-0.8B (v4) | 772,8 M (base) | No disponible | 10,83 % (Greedy Token-1) | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 772,8 M (aproximado) | No disponible | No evaluado en ajedrez | Apache-2.0 (según Qwen) | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: alto en contextos abiertos; el modelo está especializado en ajedrez y puede generar jugadas ilegales sin el decodificador restringido.
- Limitaciones de contexto: el modelo de 24 capas y d=1024 alcanza un "techo de horizonte geométrico" en pins de largo alcance y rayos de mate multi-pieza, como se observó en la derrota con `11. Qc8#`.
- Limitaciones de idioma: no se especifican idiomas soportados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B y de la variante intermedia.
- Caveat para producción: el rendimiento en posiciones aisladas (75,83 %) no se traslada a partidas completas (½–1½ frente a Jev 1.13.0); no debe usarse como motor de ajedrez en producción sin el decodificador Exact-Leaf y una validación adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIHeikki/brainsurged-chessmaster-qwen3.5-0.8b
- Modelo base intermedio: https://huggingface.co/AIHeikki/brainsurged-open-jev-qwen3.5-0.8b
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo companion 4B: https://huggingface.co/AIHeikki/brainsurged-chessmaster-qwen3.5-4b
- Informe de evaluaciones: `reports/chessmaster_evaluations/MORNING_REPORT.md` (dentro del repositorio)
- Resultados del campeonato: `reports/chessmaster_evaluations/exp11_chessmaster_campaign_results.json` (dentro del repositorio)
- Partidas en vivo: `reports/chessmaster_evaluations/live_matches/` (dentro del repositorio)
