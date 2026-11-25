# boundedblunders/convergence-looped-lens-v10

## Resumen

Convergence Looped Lens v10 es un conjunto de pesos de "lentes" (lenses) de interpretabilidad mecánica presentado como entrada número 10 al Looped Lens Challenge organizado por NDIF sobre el modelo `thinkingmachines/Inkling-2-Mini`. No se trata de un modelo de lenguaje generativo completo, sino de un artefacto de análisis que permite leer y manipular estados internos (activaciones) de un modelo base concreto durante su proceso de razonamiento iterativo ("looped"). El autor es el equipo `convergence`, bajo la cuenta `boundedblunders`, y el repositorio pesa 0,0 GB con un único fichero de pesos de 22,65 MB en fp16 con 87 tensores.

La relevancia del artefacto es acotada pero específica: las lentes se entrenan para predecir la distribución de siguiente token (thinking-off) a partir de estados internos del modelo base en determinadas "visitas" (pasos del bucle de razonamiento), lo que sirve para estudiar qué información está disponible en cada capa y paso. La model card reporta mejoras medibles frente a la entrada #7 del mismo reto en un benchmark en vivo sobre NDIF, lo que lo convierte en una referencia útil para investigadores que trabajen en interpretabilidad de modelos con razonamiento iterado.

No hay información pública sobre arquitectura del modelo base, número de parámetros, longitud de contexto ni idiomas soportados dentro de la información proporcionada. Los datos disponibles se limitan a la composición de las lentes, su metodología de entrenamiento y los resultados de control reportados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Lentes de baja dimensión con compuerta (gated low-rank) sobre activaciones de un modelo base; incluye un selector de posición de activaciones (`qsel.*`) |
| Parámetros totales | No disponible (el selector `qsel.*` tiene 4.609 parámetros; el total de las lentes no se especifica) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el selector opera sobre una ventana de 14 tokens finales) |
| Tipos de cuantización | No disponible (pesos publicados en fp16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (fp16, 22,65 MB, 87 tensores) |

## Arquitectura y entrenamiento

El artefacto se compone de varias familias de lentes. Por un lado, `qsel.*` es un selector de posición basado únicamente en activaciones, con 4.609 parámetros, que visita las posiciones 45 y 47 sobre una ventana de 14 tokens finales, sin usar texto de prompt ni IDs de token. Por otro, `v36.*` y `v42.*` son lentes de rango 256 con compuerta (`g_cap=0.85`) y sin plantilla ("zero-template"), mientras que `v43.*` a `v47.*` son lentes de rango 128 con compuerta (`g_cap=0.65`) heredadas de la entrada #5. Además, `g256_v43.*` a `g256_v47.*` son lentes de rango 256 con compuerta (`g_cap=0.65`) mezcladas uniformemente con la entrada #5 según `0.75 * E5 + 0.25 * G256` en las visitas 43–47.

El entrenamiento de `v36` y `v42` se realizó estrictamente sobre 26.000 preguntas abiertas de Hugging Face, barajadas, provenientes de ocho conjuntos de datos públicos sin compuerta (`gsm8k`, `MetaMathQA`, `hotpot_qa`, `trivia_qa`, `ai2_arc` Easy/Challenge, `commonsense_qa`, `squad`), usando la propia distribución de siguiente token de respuesta con thinking-off del modelo base (`T3`), con 38.443 pares estado-objetivo por visita y cero plantillas del reto. No se reporta información sobre el número total de tokens de entrenamiento del modelo base ni sobre técnicas de RLHF/DPO, ya que el artefacto no es un modelo entrenado desde cero.

## Capacidades

- Lectura de estados internos: las lentes predicen la distribución de siguiente token a partir de activaciones en visitas concretas del bucle de razonamiento del modelo base.
- Selección de posición basada solo en activaciones: `qsel.*` localiza posiciones relevantes (45, 47) sin depender de texto de prompt ni IDs de token.
- Generalización entre familias de tareas: los controles reportados muestran transferencia desde el entrenamiento en ocho datasets abiertos a un conjunto retenido (`new_families_550`, `fact_2hop_lang_inter`).
- Composición por mezcla: las lentes `g256_v43`–`g256_v47` combinan dos entradas del reto con pesos fijos (0,75 / 0,25).
- No se reportan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo, ya que el artefacto no es un modelo de propósito general.

## Casos de uso

- Investigación en interpretabilidad mecánica: usar las lentes para inspeccionar qué información está codificada en las activaciones del modelo base en cada visita del bucle y comparar entre capas o pasos.
- Auditoría de razonamiento iterado: analizar si el modelo base retiene o pierde información relevante a lo largo de las visitas 36–47, comparando las predicciones de `v36`, `v42` y `v45`.
- Reproducción de experimentos del reto: cargar los pesos y replicar los controles reportados sobre `new_families_550` para verificar los porcentajes de acierto (`v36 = 81,4%`, `v42 = 92,9%`, `v45 = 87,1%`, `v45 No-Bias = 88,6%`).
- Evaluación comparativa de entradas del reto: contrastar el rendimiento de esta entrada frente a la entrada #7 en el benchmark en vivo de NDIF (2.173 ejemplos).
- Estudio de selectores de posición: analizar el comportamiento de `qsel.*` como mecanismo de atención sobre ventanas cortas (14 tokens) sin acceso al texto.
- Desarrollo de nuevas lentes: reutilizar la metodología de entrenamiento (26.000 preguntas, ocho datasets, `T3` thinking-off) como base para experimentos propios.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia / comparación |
|---|---|---|
| Golden 2.173 live NDIF | 55,82% | Entrada #7: 53,06% (+2,76 pp) |
| Golden 2.173 live NDIF (rMH) | +4,0 pp | Frente a entrada #7 |
| Golden 2.173 live NDIF (r149) | +4,7 pp | Frente a entrada #7 |
| Golden 2.173 live NDIF (r309) | +4,6 pp | Frente a entrada #7 |
| Golden 2.173 live NDIF (mvCh) | +0,4 pp | Frente a entrada #7 |
| Golden 2.173 live NDIF (d7ts) | +8,7 pp | Frente a entrada #7 |
| Control `new_families_550` (`fact_2hop_lang_inter`) — `v06 Plain` | 0,0% | Control pre-bucle |
| Control `new_families_550` — `v06 G128` | 7,1% | Control pre-bucle |
| Control `new_families_550` — `v36` | 81,4% | — |
| Control `new_families_550` — `v42` | 92,9% | — |
| Control `new_families_550` — `v45` | 87,1% | — |
| Control `new_families_550` — `v45 No-Bias` | 88,6% | — |

En el benchmark en vivo de NDIF se reporta `W=98, L=38` y mejora no negativa en los cuatro conjuntos de desarrollo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de modelos de lenguaje en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; los pesos de las lentes ocupan 22,65 MB en fp16, por lo que su carga es trivial en cualquier GPU.
- GPU recomendadas: depende del modelo base `thinkingmachines/Inkling-2-Mini`, cuyas especificaciones no se detallan en la información proporcionada.
- ¿Cabe en GPU de consumo? Los pesos de las lentes sí caben en cualquier GPU de consumo; el modelo base no se especifica.
- Opciones de despliegue: no se documentan en la información disponible; el uso previsto es la carga de `lens_weights.safetensors` en el entorno del reto NDIF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto | Rendimiento (Golden 2.173 NDIF) | Licencia |
|---|---|---|---|---|---|
| convergence-looped-lens-v10 (esta entrada) | Lentes de interpretabilidad | No disponible (selector: 4.609) | No disponible (ventana de 14 tokens) | 55,82% | Apache-2.0 |
| Entrada #7 del Looped Lens Challenge | Lentes de interpretabilidad | No disponible | No disponible | 53,06% | No disponible |
| Entrada #5 del Looped Lens Challenge | Lentes de interpretabilidad (rango 128) | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros artefactos comparables fuera del propio reto.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas; su función es exclusivamente analítica sobre las activaciones de `thinkingmachines/Inkling-2-Mini`.
- Dependencia del modelo base: las lentes están entrenadas para un modelo concreto y un esquema de visitas específico; no son portables a otros modelos sin reentrenamiento.
- Sesgos de los datos de entrenamiento: el entrenamiento usa ocho datasets públicos (`gsm8k`, `MetaMathQA`, `hotpot_qa`, `trivia_qa`, `ai2_arc`, `commonsense_qa`, `squad`), por lo que los sesgos de esas fuentes pueden reflejarse en las predicciones de las lentes.
- Cobertura lingüística no documentada: no se especifican los idiomas soportados ni la composición lingüística del entrenamiento.
- Riesgo de sobreajuste al reto: la model card indica "cero plantillas del reto", pero los controles se reportan sobre conjuntos del propio reto, lo que limita la validación externa.
- Restricciones de licencia: Apache-2.0 permite uso comercial del artefacto, pero el uso del modelo base subyacente queda sujeto a su propia licencia, no documentada aquí.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/boundedblunders/convergence-looped-lens-v10
- Modelo base del reto: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- NDIF (organización del reto): no disponible enlace directo en la información proporcionada
- Paper, blog, repositorio o demo: no disponible
