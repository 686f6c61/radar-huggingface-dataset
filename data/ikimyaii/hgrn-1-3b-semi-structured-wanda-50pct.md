# ikimyaii/HGRN-1.3B-semi-structured-Wanda-50pct

## Resumen

HGRN-1.3B-semi-structured-Wanda-50pct es una variante podada del modelo base fla-hub/hgrn-1.3B-100B, desarrollado por el usuario ikimyaii. Se trata de un checkpoint de investigación que aplica poda one-shot (sin reentrenamiento posterior) mediante el algoritmo Wanda oficial sobre un transformer de tipo HGRN (Hierarchically Gated Recurrent Network, una arquitectura de atención lineal con compuertas recurrentes). El objetivo es generar un baseline de referencia para comparar modelos con poda estructurada más sofisticada (los denominados EHWS del mismo autor).

El modelo conserva 1.364.396.032 parámetros en el checkpoint (las matrices podadas mantienen su forma densa, con el 50% de pesos a cero), ocupa 2,7 GB en safetensors y fue podado en bfloat16 en 1,6 minutos sobre una única A100 de 40 GB. La poda afecta a todas las capas lineales dentro de los bloques; embeddings y lm_head permanecen densos. La relevancia actual es acotada: es una pieza de infraestructura experimental para estudiar el impacto de la dispersión semi-estructurada en arquitecturas de atención lineal, no un modelo listo para producción.

No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso en la model card. El modelo base, HGRN-1.3B-100B, se entrenó presumiblemente sobre 100B tokens según su nombre, pero este dato no se detalla en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), transformer con atención lineal |
| Parámetros totales | 1.364.396.032 (50% de pesos a cero en capas lineales) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16 en el checkpoint) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base fla-hub/hgrn-1.3B-100B emplea una arquitectura HGRN, un diseño de atención lineal con compuertas recurrentes jerárquicas que sustituye la atención cuadrática por recurrencias lineales, lo que reduce el coste computacional en secuencias largas. El sufijo "100B" del nombre sugiere un entrenamiento sobre 100.000 millones de tokens, aunque la composición exacta del dataset y si hubo fases de RLHF o DPO no se documentan en la información disponible.

Sobre ese modelo se aplicó poda one-shot con Wanda (rama unstructured, `use_variant=False`), usando el código oficial en el commit locuslab/wanda@8e8fc87. La calibración utilizó 128 secuencias de C4 de 2.048 tokens con semilla 0, podando los bloques en orden y calibrando cada bloque sobre las salidas de los bloques ya podados. Cada fila elimina sus pesos con menor puntuación `|W| * sqrt(||X||)`, de modo que todas las filas de todas las capas podadas (168 capas verificadas) mantienen exactamente el mismo número de valores no nulos, con una dispersión medida de 0,5000. No hubo reentrenamiento ni ajuste fino posterior a la poda.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM.from_pretrained(...)`, requiriendo la librería `flash-linear-attention` instalada (`import fla`).
- Razonamiento y respuesta a preguntas en inglés, según las tareas evaluadas (arc, boolq, hellaswag, openbookqa, rte, winogrande).
- Capacidad de modelado de lenguaje medida por perplejidad en WikiText-2 y C4.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre poda de modelos: sirve como baseline de referencia para comparar técnicas de poda estructurada o semi-estructurada (los modelos EHWS del mismo autor) frente a Wanda puro, midiendo la degradación de perplejidad y precisión zero-shot.
- Estudio de arquitecturas de atención lineal: permite analizar cómo responde un modelo HGRN a la dispersión del 50% en sus capas lineales, un régimen poco explorado frente a transformers convencionales.
- Reproducción de experimentos de compresión: la model card documenta el commit exacto, la configuración de calibración y el tiempo de poda (1,6 minutos en A100 40 GB), lo que facilita replicar el pipeline.
- Evaluación de eficiencia en hardware: al tener todas las filas el mismo número de no nulos, es adecuado para probar kernels o rutinas de decodificación que exploten el balanceo perfecto por fila.
- Benchmarking de harness: los resultados de lm-evaluation-harness publicados permiten usarlo como punto de comparación en estudios de degradación por compresión.
- Docencia y divulgación: ejemplo didáctico de poda one-shot con Wanda sobre una arquitectura no convencional, con métricas antes y después claramente tabuladas.

## Benchmarks y rendimiento

Perplejidad (protocolo ELSA, fp16):

| Conjunto | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 11,81 | 17,34 |
| C4 | 16,09 | 21,43 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2176 |
| arc_easy | 0,5644 | 0,5286 |
| boolq | 0,5758 | 0,6095 |
| hellaswag | 0,3828 | 0,3468 |
| openbookqa | 0,2300 | 0,1900 |
| rte | 0,5379 | 0,5343 |
| winogrande | 0,5288 | 0,4941 |
| Media | 0,4376 | 0,4173 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB en bfloat16 (tamaño del repo); en fp16 similar. Con cuantización a 8 bits o 4 bits no hay datos publicados, pero el checkpoint podría reducirse a la mitad o un cuarto respectivamente.
- GPU recomendadas: el modelo cabe holgadamente en cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4070, 4080, 4090). Para experimentación de poda se usó una A100 40 GB.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4-6 GB de VRAM efectiva para el checkpoint en bfloat16.
- Opciones de despliegue: requiere `flash-linear-attention` (`import fla`) y `transformers` con `AutoModelForCausalLM`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dada la arquitectura HGRN, la compatibilidad con estos motores no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HGRN-1.3B-semi-structured-Wanda-50pct (este) | 1,36B (50% disperso) | no disponible | no disponible | Poda Wanda one-shot sobre HGRN |
| fla-hub/hgrn-1.3B-100B (base denso) | 1,36B | no disponible | no disponible | Modelo original sin podar; perplejidad WikiText-2 11,81 |
| Alternativas de poda estructurada (EHWS del mismo autor) | no disponible | no disponible | no disponible | Referenciadas como objetivo de comparación, sin datos en esta ficha |
| Otros modelos ~1,3B densos (p. ej. familia Llama/TinyLlama) | ~1,1-1,4B | 2.048-4.096 típicamente | variable | No comparables directamente por arquitectura distinta; datos no disponibles en esta fuente |

## Limitaciones y advertencias

- Degradación notable de perplejidad tras la poda: WikiText-2 sube de 11,81 a 17,34 (+47%) y C4 de 16,09 a 21,43 (+33%).
- Caída media de precisión zero-shot de 0,4376 a 0,4173 (unas 2 puntos porcentuales), con retrocesos acusados en openbookqa (-4 puntos), hellaswag (-3,6) y winogrande (-3,5).
- No es un modelo para producción: es un baseline de investigación sin reentrenamiento ni ajuste fino posterior a la poda.
- Licencia no especificada, lo que impide determinar si el uso comercial está permitido; hay que consultar la licencia del modelo base fla-hub/hgrn-1.3B-100B.
- Idiomas soportados no documentados; los benchmarks son en inglés, por lo que el rendimiento en castellano es desconocido.
- Longitud de contexto no documentada.
- Requiere la dependencia `flash-linear-attention` para cargarse; sin ella, `AutoModelForCausalLM.from_pretrained` fallará.
- Riesgo de alucinación y sesgos: no evaluados en la model card; al ser un modelo de 1,3B con poda agresiva, es esperable una mayor tasa de errores factuales que el modelo denso.
- El checkpoint mantiene la forma densa de las matrices (ceros explícitos), por lo que el ahorro de memoria en disco es nulo; el beneficio solo se materializa con kernels que exploten la dispersión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-Wanda-50pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Paper de HGRN: no disponible en la información proporcionada
- Paper de Wanda: no disponible en la información proporcionada
