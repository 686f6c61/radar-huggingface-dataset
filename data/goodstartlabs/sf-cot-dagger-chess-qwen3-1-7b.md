# GoodStartLabs/sf-cot-dagger-chess-qwen3-1.7b

## Resumen

El modelo `GoodStartLabs/sf-cot-dagger-chess-qwen3-1.7b` es un adaptador LoRA sobre el modelo base `Qwen/Qwen3-1.7B`, desarrollado por GoodStartLabs como parte del proyecto *Latent Grafting*. Se trata de un artefacto de investigación, no de un motor de ajedrez utilizable: el autor lo publica explícitamente como un **resultado negativo** que demuestra que, a 1.7B de parámetros, convertir razonamiento ajedrecístico en una buena jugada comprometida es un cuello de botella, incluso tras aplicar *imitation learning* con trazas de Stockfish y cinco rondas de DAgger.

El adaptador fue entrenado con alrededor de 40.000 trazas de *chain-of-thought* verbalizado-minimax generadas por Stockfish 17.1, seguidas de cinco rondas de DAgger (roll-out on-policy, relabelado con Stockfish y reentrenamiento). La evaluación sobre una suite de 150 posiciones que requieren búsqueda muestra que el modelo comete jugadas con una pérdida de centipawns de 226,4, peor que el *prior* sin búsqueda (173,0) y muy lejos del oráculo Stockfish (92,6). El autor concluye que la calidad de la jugada comprometida es el factor limitante, no la disponibilidad o legibilidad del valor.

El repositorio contiene solo el adaptador PEFT (tamaño 0,1 GB) y se carga mediante la librería `peft`. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base: Qwen3-1.7B) con adaptador LoRA |
| Parametros totales | Adaptador LoRA ~0,1 GB; modelo base 1,7B (no incluido en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible; el código de ejemplo carga el base en bfloat16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, carga con PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre todas las proyecciones lineales del transformer de Qwen3-1.7B: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango `r=32` y alpha `α=64`. El entrenamiento se realizó con pérdida de entropía cruzada solo sobre las completaciones, sobre aproximadamente 40.000 trazas de *verbalized-minimax* de Stockfish 17.1 (top-6 multipv con líneas PV, profundidad adaptativa 12/20). Posteriormente se aplicaron cinco rondas de DAgger: se generaron posiciones on-policy, se relabelaron con Stockfish y se reentrenó sobre el corpus acumulado.

El modelo es un **control de solo texto**: no incorpora ningún *graft* de motor ni *soft-tokens*; es la línea base del proyecto *Latent Grafting* que investiga si es posible injertar un motor de ajedrez en un LLM. El autor indica que el mejor checkpoint de esta familia (el aquí publicado) alcanza una recuperación de −66% respecto al *prior* sin búsqueda, mejorando el −116% del baseline pre-DAgger, pero sin superar nunca al *prior*.

## Capacidades

- Generación de texto en formato de análisis ajedrecístico: dado un FEN y movimientos recientes, produce una traza de razonamiento verbalizado-minimax que termina en `best move: <uci>`.
- Razonamiento en cadena (CoT) específico para posiciones de ajedrez, con líneas de variantes y evaluación.
- No soporta *tool calling*, *function calling*, ni uso como agente general.
- No tiene capacidades multimodales (visión, audio).
- Capacidades multilingües: no disponibles.
- Capacidad especial: *thinking mode* en el dominio del ajedrez, pero con calidad de jugada comprometida inferior a un *prior* sin búsqueda (ver benchmarks).

## Casos de uso

Dado que el autor lo califica explícitamente como un resultado negativo y desaconseja su uso como jugador de ajedrez, los casos de uso son principalmente de investigación y reproducibilidad:

- **Investigación en aprendizaje por imitación para dominios de razonamiento**: el modelo sirve como punto de comparación para estudiar por qué la imitación de trazas de razonamiento no se traduce en decisiones finales de alta calidad en modelos pequeños.
- **Análisis de DAgger en entornos de búsqueda**: permite estudiar el efecto de múltiples rondas de DAgger sobre la calidad de la acción comprometida, mostrando que la mejora se estanca y regresa a partir de la ronda 5.
- **Reproducción de experimentos de *Latent Grafting***: como control de solo texto, es la referencia para evaluar si un injerto latente de motor mejora la calidad de jugada frente a este baseline.
- **Estudio de la brecha entre razonamiento verbalizado y decisión final**: útil para investigar por qué un modelo puede generar análisis correctos pero cometer movimientos subóptimos.
- **Evaluación de métricas de calidad de movimiento** (cp-loss, recovery %) en suites de posiciones que requieren búsqueda.
- **Docencia y divulgación**: como ejemplo de un resultado negativo bien documentado en el campo de LLMs aplicados a juegos.

## Benchmarks y rendimiento

El autor proporciona resultados sobre una suite de 150 posiciones que requieren búsqueda, donde el *prior* sin búsqueda es materialmente incorrecto. Las métricas son pérdida de centipawns (cp-loss) del movimiento comprometido y el porcentaje de recuperación del hueco entre *prior* y oráculo.

| Modelo | cp-loss | Recovery |
|---|---:|---:|
| Stockfish best (oráculo) | 92,6 | +100% |
| No-search policy *prior* | 173,0 | 0% |
| **Este modelo (SF-CoT + DAgger ronda 5)** | **226,4** | **−66%** |
| SF-CoT baseline (pre-DAgger) | 266,4 | −116% |

El autor advierte que la suite está seleccionada alrededor de los errores de un *prior* concreto, por lo que los valores absolutos de recovery están calibrados a ese marco; la dirección (peor que el *prior*) es robusta. La evaluación es por cp-loss del movimiento comprometido, no por Elo de partida completa.

## Requisitos de hardware

- El adaptador LoRA es ligero (~0,1 GB), pero requiere cargar el modelo base Qwen3-1.7B (1,7B parámetros). En bfloat16, el modelo base ocupa aproximadamente 3,5 GB de VRAM; con el adaptador y el tokenizador, el conjunto cabe en GPUs consumer con 6 GB o más.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090, o GPUs de datacenter como A100 o H100 si se quiere mayor throughput.
- Cabe en GPUs consumer de gama media; no requiere hardware especializado.
- Opciones de despliegue: el código de ejemplo usa `transformers` con `peft` para carga en Python. No se menciona soporte para vLLM, llama.cpp u Ollama en la documentación, aunque al ser un adaptador LoRA estándar podría adaptarse.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores LoRA para ajedrez sobre Qwen3-1.7B. La única comparación publicada es con el *prior* sin búsqueda y con Stockfish como oráculo, ya recogida en la sección de benchmarks. Otros modelos de ajedrez basados en LLM (p. ej., modelos entrenados específicamente para jugar) no aparecen en la información disponible, por lo que no se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- **Resultado negativo**: el modelo comete movimientos peores que un *prior* sin búsqueda en posiciones que requieren búsqueda; no debe usarse como motor de ajedrez.
- **Rendimiento estancado**: DAgger mejora el baseline de −116% a −66% en la ronda 5, pero luego el rendimiento se estanca o regresa incluso con más datos on-policy.
- **Sesgos del entrenamiento**: el adaptador fue entrenado exclusivamente con trazas de Stockfish 17.1; puede no generalizar a otros estilos de juego o variantes.
- **Riesgo de alucinación**: al ser un modelo de lenguaje, puede generar análisis plausibles pero incorrectos; el autor no reporta tasas de alucinación.
- **Limitaciones de contexto e idioma**: no se especifican; el modelo base Qwen3-1.7B soporta múltiples idiomas, pero el adaptador está pensado para notación FEN/UCI en inglés.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso en producción como jugador de ajedrez.
- **Caveat de evaluación**: la suite de evaluación está sesgada hacia los errores de un *prior* concreto; los valores absolutos de recovery no son comparables con otras suites.

## Enlaces

- [HuggingFace: GoodStartLabs/sf-cot-dagger-chess-qwen3-1.7b](https://huggingface.co/GoodStartLabs/sf-cot-dagger-chess-qwen3-1.7b)
- [Sitio web de Good Start Labs](https://goodstartlabs.com/)
- [Modelo base Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
