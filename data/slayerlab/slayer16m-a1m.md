# SlayerLab/Slayer16M-A1M

## Resumen

Slayer16M-A1M es un checkpoint experimental de tipo mixture-of-experts (MoE) desarrollado por SlayerLab, concebido no como un modelo utilizable sino como un experimento de ablación para comparar el rendimiento de una arquitectura MoE frente a una densa con tiempo de entrenamiento ajustado en una única GPU. El modelo tiene aproximadamente 15,9 millones de parámetros totales, de los cuales alrededor de 1,02 millones están activos por token, y se entrenó sobre un vocabulario de 4 096 tokens con un contexto de 256 tokens, en los idiomas polaco e inglés.

El objetivo del experimento es medir si, con un presupuesto de cómputo fijo, un MoE con muchos parámetros totales pero pocos activos obtiene mejor entropía cruzada que un modelo denso con un número similar de parámetros activos. Los resultados publicados indican una ventaja consistente del MoE (0,72 nat en polaco y 0,61 nat en inglés frente al modelo denso pequeño), aunque el autor califica la señal de "exploratoria" y advierte que el checkpoint no está destinado a uso práctico.

La relevancia actual es metodológica: el trabajo documenta de forma rigurosa la selección de hiperparámetros, el emparejamiento temporal, la elección de checkpoint y las reglas de veredicto fijadas antes de leer resultados, además de publicar las curvas de entrenamiento. No obstante, los pesos y el código de reproducción no están publicados todavía, y los benchmarks del panel (ARC-Easy test, BLiMP, WikiText-2, MultiBLiMP-PL, PIQA) no se han medido aún.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE en el bloque FFN (56 expertos SwiGLU, top-1), atención con claves/valores agrupados (GQA) |
| Parametros totales | 15 889 795 |
| Parametros activos | 1 021 315 por token |
| Longitud de contexto | 256 tokens (ventana de atención) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | no disponible (pendiente de decisión; pesos y código no publicados) |
| Formato de pesos | no disponible (checkpoint `ckpt.pt`, no publicado) |

## Arquitectura y entrenamiento

El modelo comparte esqueleto con los otros brazos del experimento: vocabulario de 4 096 tokens con embeddings atados a la cabeza de salida, anchura de 128, 4 capas, atención con 4 cabezas de consulta y 2 cabezas de clave/valor, RoPE en variante rotate-half sobre toda la dimensión de cabeza (base 500 000), normalización de consultas y claves, residuales de valor y ventana de 256 tokens. La única diferencia entre brazos está en el bloque FFN: el brazo `moe16` usa 56 expertos SwiGLU de anchura 176 con enrutamiento top-1, mientras que `dense1` usa un SwiGLU de anchura 128 y `dense16` uno de anchura 9 856.

El entrenamiento se realizó con tiempo ajustado: presupuesto planificado de 103 minutos por ejecución y tiempo medido de 5 875,9 a 5 963,3 segundos (97,9–99,4 minutos), con una diferencia de ≤ 17 segundos entre `moe16` y `dense1` del mismo seed. El brazo MoE completó 58 848 pasos y 3,86 mil millones de tokens (0,69 épocas), frente a 190 233 pasos y 12,47 mil millones de tokens del denso pequeño (2,23 épocas). La tasa de aprendizaje se seleccionó en una ronda de barrido sobre un conjunto disjunto de ajuste. No se documentan RLHF ni DPO; el modelo es un experimento de modelado de lenguaje puro. El enrutamiento presenta un desequilibrio notable: el experto más frecuente recibe hasta 4,6 veces la cuota uniforme y en la última capa hasta 28 de 56 expertos quedan casi sin trabajo en una ventana individual.

## Capacidades

- Generación de texto autoregresiva básica sobre vocabulario de 4 096 tokens en polaco e inglés.
- Modelado de lenguaje a nivel de token; no se documentan capacidades de razonamiento, código o matemáticas.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Multilingüismo limitado a polaco e inglés.
- Sin modo thinking, visión ni audio.
- El autor indica explícitamente que no es un modelo para uso práctico.

## Casos de uso

- Estudio de ablación de arquitecturas MoE frente a densas: sirve como referencia reproducible para investigar el efecto del enrutamiento top-1 con parámetros activos reducidos en presupuestos de cómputo fijos.
- Análisis de desequilibrio de enrutamiento: el checkpoint permite examinar la distribución de carga entre expertos (hasta 4,6× la cuota uniforme) y estudiar técnicas de balanceo en modelos pequeños.
- Validación de protocolos experimentales: las reglas de veredicto fijadas antes de leer resultados y la selección de checkpoint con test de McNemar y corrección de Holm son un ejemplo metodológico para experimentos de bajo presupuesto.
- Reproducción de curvas de entrenamiento: las curvas publicadas en Track permiten contrastar la dinámica de convergencia de MoE frente a denso bajo tiempo ajustado.
- Docencia e investigación sobre tokenizadores pequeños: el vocabulario de 4 096 tokens y el contexto de 256 tokens facilitan experimentos de bajo coste en una sola GPU.
- Referencia para futuros estudios de escalado: los resultados de entropía cruzada (3,29 nat en PL, 2,75 nat en EN para `moe16`) sirven de línea base para comparaciones posteriores.

## Benchmarks y rendimiento

Los benchmarks del panel (ARC-Easy test, BLiMP, WikiText-2, MultiBLiMP-PL, PIQA) no se han medido todavía según la model card. Sí se publican resultados de entropía cruzada en el conjunto de veredicto (2 048 ventanas de 256 tokens por idioma, tokenizador de 4k):

| Brazo | Seed | Pasos | Tokens (mM) | Épocas | CE PL | CE EN |
|---|---|---|---|---|---|---|
| `moe16` | 1 | 58 848 | 3,86 | 0,69 | 3,2921 | 2,7537 |
| `moe16` | 2 | 58 848 | 3,86 | 0,69 | 3,2678 | 2,7481 |
| `moe16` | 3 | 58 848 | 3,86 | 0,69 | 3,2660 | 2,7513 |
| `dense1` | 1 | 190 233 | 12,47 | 2,23 | 4,0047 | 3,3586 |
| `dense1` | 2 | 190 233 | 12,47 | 2,23 | 3,9924 | 3,3527 |
| `dense1` | 3 | 190 233 | 12,47 | 2,23 | 3,9961 | 3,3566 |
| `dense16` | 1 | 50 449 | 3,31 | 0,59 | 3,2102 | 2,7082 |

La diferencia media `CE_dense1 − CE_moe16` es de +0,7224 nat en polaco y +0,6050 nat en inglés, con 6/6 pares en la misma dirección. El brazo `dense16` (un solo seed, ~15,5× más parámetros activos) supera a la media de `moe16` en 0,065 nat (PL) y 0,043 nat (EN). En ARC-Easy validation, la precisión de `moe16` fue de 33,7 % (s1), 35,4 % (s2) y 32,3 % (s3), sin diferencias significativas entre seeds tras corrección de Holm.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los ~15,9 millones de parámetros totales; en la práctica, cualquier GPU consumer puede alojarlo.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1–2 GB de memoria es suficiente (por ejemplo, GTX 1650, RTX 3050, RTX 4090, A100, H100).
- Cabe holgadamente en GPU consumer.
- Opciones de despliegue: no disponibles mientras no se publiquen los pesos; el checkpoint es un `ckpt.pt` de PyTorch y no hay conversiones a GGUF ni integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | CE PL / EN | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Slayer16M-A1M (`moe16`) | 15,9 M | 1,02 M | 256 | 3,29 / 2,75 | no disponible | pesos no publicados |
| `dense1` (mismo experimento) | 0,92 M | 0,92 M | 256 | 4,00 / 3,36 | no disponible | pesos no publicados |
| `dense16` (mismo experimento) | 15,9 M | 15,9 M | 256 | 3,21 / 2,71 | no disponible | pesos no publicados |

No se dispone de comparación con modelos externos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un modelo para uso práctico; es un experimento de ablación.
- Pesos y código de reproducción no publicados; pendientes de decisión de licencia y de confirmación de derechos sobre parte del código.
- Licencia no disponible, por lo que no puede evaluarse el uso comercial.
- Contexto muy limitado (256 tokens) y vocabulario reducido (4 096 tokens), insuficientes para tareas reales.
- Enrutamiento desequilibrado: hasta 4,6× la cuota uniforme en el experto más usado y hasta 28 de 56 expertos casi inactivos en la última capa.
- Resultados de benchmarks del panel sin medir; solo hay entropía cruzada y ARC-Easy validation.
- Señal calificada de "exploratoria" por el autor, con un solo seed para `dense16`.
- Riesgo de alucinación y sesgos no evaluados; cobertura lingüística limitada a polaco e inglés.
- El resultado de ARC-Easy validation no fue concluyente para elegir checkpoint; el publicado es un representante fijado a priori, no el ganador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/Slayer16M-A1M
- Curva de entrenamiento `moe16` s1: https://track.fabryka.ai/run/5323ef74-389a-55f4-a034-57e8bec54e6e
- Curva de entrenamiento `moe16` s2: https://track.fabryka.ai/run/ffcbb81e-b818-522f-9419-6cf120fbf5d0
- Curva de entrenamiento `moe16` s3: https://track.fabryka.ai/run/283665b5-1fca-5c9f-8b71-e7ae07b0e085
- Curva de entrenamiento `dense1` s1: https://track.fabryka.ai/run/b791a5f3-df07-5a0a-9673-849acd006fb2
- Curva de entrenamiento `dense1` s2: https://track.fabryka.ai/run/700749f1-2c49-57ce-a6c7-5c5d9f0f59ce
- Curva de entrenamiento `dense1` s3: https://track.fabryka.ai/run/2189de96-bd43-53ad-9a6e-947e54476d6b
- Curva de entrenamiento `dense16` s1: https://track.fabryka.ai/run/f3f798dc-f95d-5de1-9d1a-00d478936f03
