# arianraje/qwen3-4b-gdn-hybrid-stage3-200M-OPD-dtfix

## Resumen

Este modelo es un experimento de investigación que transforma el transformer de atención completa `Qwen/Qwen3-4B` en un híbrido con Gated DeltaNet (GDN) y atención lineal. Sustituye 27 de las 36 capas de atención por capas GDN con una retención uniforme 1:4, manteniendo 9 capas de atención completa. El autor, `arianraje`, lo ha entrenado mediante un proceso de destilación en etapas que culmina en destilación on-policy (OPD) con el profesor Qwen3-4B congelado. Esta versión es el snapshot final de la etapa 3, con 200 millones de tokens generados por el estudiante y un horizonte de entrenamiento de 16K. Su relevancia radica en explorar arquitecturas híbridas de atención lineal que reduzcan el coste computacional de la atención sin perder demasiada capacidad. El modelo tiene 4.546.819.904 parámetros (~4,55B) y se distribuye en formato safetensors bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer con 27 capas Gated DeltaNet (GDN) y 9 capas de atención completa, retención uniforme 1:4 |
| Parámetros totales | 4.546.819.904 (~4,55B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B y reemplaza la atención completa por Gated DeltaNet en 27 de las 36 capas, siguiendo un patrón de retención uniforme 1:4. Esto significa que, de cada cuatro capas, una conserva la atención completa y las otras tres utilizan GDN, una capa de atención lineal con estado recurrente. La inicialización de las puertas de decaimiento (`dt_bias`) se ha corregido respecto a la línea original: en lugar de usar `dt_bias.fill_(1.0)` (puertas saturadas), se emplea la inicialización estilo fla con una mediana de -4,56. Esta corrección es la única diferencia intencionada respecto a la línea original `pinkskin/qwen3-4b-gdn-wsd-ladder`.

El entrenamiento sigue una estrategia de destilación por etapas. Primero una alineación (stage-1), después destilación de conocimiento (stage-2a y stage-2b) y finalmente destilación on-policy (stage-3). Este snapshot es el resultado de la etapa 3, donde el estudiante genera rollouts que son puntuados token a token por el profesor `Qwen/Qwen3-4B` congelado bajo KL inversa. Se consumieron 200.104.080 tokens generados, con una tasa de aprendizaje plana de 2e-5, warmup de 150 pasos y un decaimiento lineal a 1e-6 durante 300 pasos (39,3 millones de tokens). El horizonte de entrenamiento fue de 16K tokens. El snapshot final corresponde al paso 1247.

## Capacidades

- Razonamiento matemático: alcanza 80,8 en GSM8K (sin modo think) y 83,1 en Math-500 (con modo think), con 66,7 en Math-500 sin think. En AIME24 obtiene 23,8 y en AIME25 17,9, lo que indica que falla en problemas de competición avanzada.
- Conocimiento general y sentido común: 58,7 en MMLU, 73,5 en PIQA, 62,0 en HellaSwag, 71,4 en ARC-Easy, 48,1 en ARC-Challenge y 63,2 en Winogrande. Muestra un rendimiento moderado en tareas de conocimiento y razonamiento de sentido común.
- Generación de texto: al ser un destilado de Qwen3-4B, conserva la capacidad de generar texto en múltiples dominios, aunque no se han publicado evaluaciones específicas.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no especificadas; el modelo base Qwen3-4B es multilingüe, pero no se han publicado resultados.
- Capacidades especiales (visión, audio, thinking mode): el modelo parece diferenciar entre razonamiento con y sin modo "think" (según los nombres de los benchmarks), pero no se documenta su implementación. No se documentan capacidades de visión o audio.

## Casos de uso

- Investigación en arquitecturas de atención lineal: permite estudiar el impacto de sustituir atención completa por GDN en un modelo de 4,5B, comparando el rendimiento con el profesor Qwen3-4B y con la línea original.
- Benchmarking de destilación on-policy: sirve como referencia para reproducir experimentos de OPD con KL inversa y analizar la curva de aprendizaje en la etapa 3.
- Razonamiento matemático en entornos educativos: con 80,8 en GSM8K y 83,1 en Math-500 (think), puede emplearse en asistentes de tutoría para resolver problemas de matemáticas de nivel medio, siempre que se valide la precisión en el dominio concreto.
- Evaluación de conocimiento general: los resultados en MMLU (58,7) y ARC-Challenge (48,1) permiten su uso en sistemas de pregunta-respuesta de dominio general, aunque con un rendimiento moderado que requiere filtrado de respuestas.
- Estudio de inicialización de puertas de decaimiento: la corrección de `dt_bias` (de `fill_(1.0)` a mediana -4,56) ofrece un caso de estudio para entender cómo la inicialización de las puertas afecta al entrenamiento y al rendimiento en modelos de estado recurrente.
- Despliegue en entornos con recursos limitados: al ser un híbrido con atención lineal, la complejidad computacional de la atención es menor que la de un transformer de atención completa del mismo tamaño, lo que puede facilitar la inferencia en GPUs de consumo, aunque requiere implementar la arquitectura personalizada.
- Comparación de líneas de destilación: el modelo incluye JSONs de resultados y una comparativa head-to-head en el repositorio del proyecto, lo que permite analizar diferencias entre la línea corregida y la original.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| PIQA (likelihood) | 73,5 |
| HellaSwag (likelihood) | 62,0 |
| ARC-Easy (likelihood) | 71,4 |
| ARC-Challenge (likelihood) | 48,1 |
| Winogrande (likelihood) | 63,2 |
| MMLU (likelihood) | 58,7 |
| GSM8K (nothink, pass@1, n=8) | 80,8 |
| Math-500 (nothink, pass@1, n=8) | 66,7 |
| Math-500 (think, pass@1, n=8) | 83,1 |
| AIME24 (pass@1, n=8) | 23,8 |
| AIME25 (pass@1, n=8) | 17,9 |

Los resultados de matemáticas se obtuvieron con n=8 muestras (pass@1), por lo que tienen una varianza alta. Los resultados de sentido común y MMLU se obtuvieron con lm-eval (likelihood).

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware.
- El tamaño del repositorio es de 9,1 GB, lo que sugiere pesos en BF16/FP16. Para inferencia sin cuantizar se estima un consumo de VRAM de al menos 10 GB (considerando pesos y activaciones).
- Con cuantización a 8 bits, el consumo estimado sería de unos 5 GB; con 4 bits, unos 3 GB. Sin embargo, no se han publicado cuantizaciones para este modelo.
- Se recomienda una GPU con al menos 16 GB de VRAM para inferencia sin cuantizar (por ejemplo, RTX 4090, A100 40GB o H100). Para experimentos de destilación, se necesitaría más memoria.
- Al ser una arquitectura personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin registrar la arquitectura manualmente. El autor indica que debe registrarse antes de cargar (ver repo del proyecto).
- La latencia y el throughput no se han publicado. Al ser un híbrido con 27 capas GDN, la atención lineal reduce el coste de cómputo en secuencias largas, pero no hay datos empíricos.

## Comparativa con modelos similares

No se dispone de comparativas cuantitativas en la información proporcionada. El modelo se puede comparar conceptualmente con el profesor `Qwen/Qwen3-4B` y con la línea original `pinkskin/qwen3-4b-gdn-wsd-ladder`, pero no se han publicado los resultados de esos modelos en la información disponible. La comparativa head-to-head está en el repositorio del proyecto (`artifacts/dual_family_eval_24h/TABLES_DTFIX.md`), pero no se ha facilitado la URL.

## Limitaciones y advertencias

- Modelo experimental de investigación, no validado para producción.
- Arquitectura personalizada que requiere registro manual antes de cargar; no es compatible con herramientas estándar sin modificaciones.
- Los benchmarks de matemáticas se calcularon con n=8 muestras, lo que implica una alta varianza y resultados poco concluyentes.
- No se especifican los idiomas soportados; aunque el modelo base Qwen3-4B es multilingüe, el rendimiento fuera del inglés puede degradarse.
- No se han realizado evaluaciones de seguridad, alucinación o sesgos. El modelo puede heredar sesgos de Qwen3-4B y del proceso de destilación.
- Riesgo de alucinación inherente; se recomienda validar las salidas en aplicaciones críticas.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- La licencia MIT permite uso comercial, pero al ser un artefacto de investigación, no hay garantías de soporte ni mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage3-200M-OPD-dtfix
- Modelos relacionados:
  - https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage2b-kd-dtfix
  - https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage2a-kd
  - https://huggingface.co/pinkskin/qwen3-4b-gdn-wsd-ladder (mencionado en la model card)
- Repositorio del proyecto: no disponible (se menciona en la model card, pero no se ha facilitado la URL)
- Paper: no disponible
- Commit de código: d86fbef09d35f4e4d7943ec51d2b3732eb1fed46 (mencionado en la model card)
