# boundedblunders/convergence-looped-lens-v4

## Resumen

`convergence-looped-lens-v4` es un conjunto de pesos de "lente" (logit lens) diseñado para el reto **The Looped Lens Challenge** sobre el modelo base `thinkingmachines/Inkling-2-Mini`. No es un modelo generativo autónomo, sino un artefacto de interpretabilidad: un conjunto de 88 tensores en `fp16` (9,80 MB) que se aplican sobre las activaciones internas del modelo base para mejorar la legibilidad de sus representaciones intermedias mediante una proyección afinada hacia el espacio de logits.

Lo desarrolla el equipo `convergence` (usuario `boundedblunders`) como Entry #4 del citado reto. El problema que aborda es el de la decodificación temprana de predicciones: en lugar de esperar a la capa final, la lente lee estados ocultos intermedios y los proyecta al vocabulario, de modo que un investigador puede inspeccionar qué "piensa" el modelo en cada visita a una capa. La innovación principal es que opera estrictamente sobre una única activación por visita, sin acceso al texto del prompt, lo que la hace desplegable en contextos de auditoría donde no se quiere condicionar la lectura al input.

La relevancia es acotada pero clara para la comunidad de interpretabilidad mecanicista: ofrece un método reutilizable (mapa residual de bajo rango + compuerta escalar delta-aware + debiasing de prior top-1%) que mejora la lectura del logit lens sin modificar los pesos del modelo base ni requerir etiquetas de verdad fundamental. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente de interpretabilidad sobre transformer (mapa residual de bajo rango + compuerta escalar de activacion + logit lens) |
| Parametros totales | 88 tensores; 9,80 MB en fp16 (no se especifica el numero exacto de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base `thinkingmachines/Inkling-2-Mini`) |
| Tipos de cuantizacion | fp16 (unico formato indicado) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no disponible (no se indica safetensors, GGUF ni otro contenedor) |

## Arquitectura y entrenamiento

La lente lee 10 visitas distintas a capas en orden ascendente de ejecución (`12, 24, 35, 36, 42 [mlp_input], 43, 44, 45, 46, 47`). Las visitas `12` y `24` usan el logit lens congelado sin modificar. En cada una de las 8 visitas entrenadas (`v ∈ {35, 36, 42_mlp_in, 43, 44, 45, 46, 47}`) se aplica, sobre el estado oculto `h_v ∈ R^2304`: (1) un mapa afín residual de bajo rango con `rank = 128` (`h'_v = h_v + (h_v @ A_v^T) @ B_v^T + b_v`); (2) una compuerta escalar delta-aware con `g_cap = 0.72` que combina LayerNorm del estado original y del delta; y (3) una mezcla de logits entre la lectura original y la corregida ponderada por la compuerta. Adicionalmente se aplica un offset de debiasing de prior positivo top-1% (`univ99`), precalculado por visita sobre una muestra estratificada y almacenado de forma dispersa (~2.000 tokens de "relleno" por visita), que resta `0.5 * max(m_v - quantile(m_v, 0.99), 0)` en los índices correspondientes.

El entrenamiento tiene dos etapas. La etapa 1 es una KL sin etiquetas, por visita, sobre distribuciones top-20 de respuestas abiertas generadas por `Inkling-2-Mini` (~15k QA abiertas + ~6k QA naturales de TwoHopFact/MuSiQue + ~18k filas sintéticas de chat; sin cross-entropy con verdad fundamental y excluyendo prompts de práctica del reto y familias OOD de test). La etapa 2 congela la etapa 1 y entrena cada compuerta escalar `g_v` con lotes balanceados (1/4 chat pre-respuesta, 1/4 plano, 1/4 600 prompts sintéticos disjuntos sin etiquetas, 1/4 respuesta iniciada) usando una KL exacta sobre todo el vocabulario (`200.058` tokens) en los bloques no-chat, de modo que la compuerta se mantiene pequeña cuando el logit lens sin modificar ya es legible.

## Capacidades

- Lectura de representaciones intermedias: proyecta estados ocultos de capas concretas al espacio de logits para inspeccionar predicciones tempranas.
- Operación estrictamente single-activation: cada visita se procesa solo con su propio estado oculto, sin depender de otras visitas ni del texto del prompt.
- Debiasing de tokens de relleno: el offset `univ99` suprime tokens de alta prior (boilerplate) sin potenciar tokens raros.
- Mejora medida en OOD: en el check `locked_v3` (800 ítems, `bs = 1`) pasa de 55,50% a 57,63% de acierto top-1 frente a la línea base de peso cero.
- Mejora en tokens nunca vistos como top-1 en entrenamiento (`n = 616`): +2,60 pp.
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-turno por sí mismo; su función es analítica sobre `Inkling-2-Mini`.
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Auditoría de sesgos de predicción temprana: aplicar la lente sobre las visitas 35-47 de `Inkling-2-Mini` para observar qué tokens domina el modelo antes de la capa final, útil para detectar atajos o dependencias espurias.
- Investigación en interpretabilidad mecanicista: comparar la lectura del logit lens congelado (visitas 12 y 24) frente a la lectura corregida por la lente en las visitas entrenadas, para estudiar cómo evoluciona la representación capa a capa.
- Depuración de comportamiento de relleno: el offset `univ99` permite cuantificar cuánto de la predicción temprana se debe a tokens de boilerplate y cuánto a contenido informativo.
- Evaluación de robustez OOD: usar el protocolo `locked_v3` (800 ítems, `bs = 1`) como referencia reproducible para comparar futuras lentes del reto con intervalos de confianza al 95%.
- Análisis de prompts sin filtrar texto: al no condicionar la lectura al prompt, la lente puede aplicarse en flujos donde el input no debe registrarse ni usarse para calibrar la lectura.
- Reproducción de resultados del reto: cargar los 88 tensores fp16 y replicar las cifras de la model card (57,63% frente a 55,50% de línea base) para validar el pipeline antes de adaptarlo a otros modelos base.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| OOD `locked_v3` (800 ítems, `bs = 1`), acierto top-1 | 57,63% | 55,50% línea base peso cero (+2,12 pp [+0,38, +3,88]) |
| `bench_raw_typo` (OOD) | 99% | 95% Entry #3 (+4,00 pp [+1,00, +8,00]) |
| Tokens nunca vistos como top-1 en entrenamiento (`n = 616`) | +2,60 pp | intervalo [+0,81, +4,55] |
| Control pre-loop `v6` en `locked_v3`: raw | 2,75% | — |
| Control pre-loop `v6` en `locked_v3`: trained sin `u99` | 2,75% | 0,0% en todos los grupos no-typo |
| Control pre-loop `v6` en `locked_v3`: trained con `u99` | 3,12% | +0,37 pp, todo procedente de `bench_raw_typo` (21% → 24%) |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas de generación, ya que el artefacto no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 9,80 MB en fp16; el requisito real lo determina el modelo base `Inkling-2-Mini` (estados ocultos de dimensión 2304 y vocabulario de 200.058 tokens), no disponible en la información proporcionada.
- GPU recomendadas: no disponibles para la lente; para el modelo base se requiere una GPU con memoria suficiente para su tamaño, dato no especificado.
- Cabe en GPU de consumo: la lente en sí (9,80 MB) cabe en cualquier GPU; el modelo base debe evaluarse por separado.
- Opciones de despliegue: no se indican (no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI); al ser pesos de interpretabilidad, su integración es mediante código propio sobre el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento OOD | Licencia |
|---|---|---|---|---|---|
| `convergence-looped-lens-v4` (Entry #4) | Lente de interpretabilidad | 88 tensores, 9,80 MB fp16 | no disponible | 57,63% en `locked_v3` | MIT |
| Entry #3 del Looped Lens Challenge | Lente de interpretabilidad | no disponible | no disponible | 95% en `bench_raw_typo` (referencia citada) | no disponible |
| Logit lens congelado (visitas 12 y 24) | Lente de interpretabilidad | 0 (sin entrenamiento) | no disponible | línea base 55,50% | no disponible |

No se dispone de datos de otras lentes comparables fuera del reto; la comparativa se limita a las referencias internas citadas en la model card.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para texto, código, matemáticas, visión ni tool calling; su única función es la lectura de activaciones de `Inkling-2-Mini`.
- Dependencia total del modelo base: los pesos están entrenados específicamente para las visitas `12, 24, 35, 36, 42_mlp_in, 43, 44, 45, 46, 47` de `thinkingmachines/Inkling-2-Mini`; no son transferibles a otras arquitecturas sin reentrenamiento.
- Sesgos: el offset `univ99` se calcula sobre una muestra estratificada concreta (chat, plano, respuesta iniciada y prompts sintéticos de typo/completado); puede no representar dominios especializados y suprimir tokens legítimos de alta frecuencia.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la lectura de logits intermedios puede reflejar predicciones espurias del modelo base que la lente no corrige.
- Limitaciones de contexto e idioma: no disponibles; dependen enteramente de `Inkling-2-Mini`.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el modelo base puede tener su propia licencia que debe revisarse por separado.
- Caveat de producción: 0 descargas y 0 likes en el momento de la consulta; el artefacto es de investigación y no cuenta con validación externa fuera del reto.
- Las cifras de mejora proceden de un único check OOD de 800 ítems con intervalos de confianza al 95% relativamente anchos (por ejemplo, +2,12 pp con intervalo [+0,38, +3,88]); la generalización a otros conjuntos no está demostrada.

## Enlaces

- Hugging Face: https://huggingface.co/boundedblunders/convergence-looped-lens-v4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
