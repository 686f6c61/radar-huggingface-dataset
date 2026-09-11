# bcywinski/jacobian-lens-qwen3.5-9b

## Resumen

`bcywinski/jacobian-lens-qwen3.5-9b` no es un modelo de lenguaje, sino un artefacto de interpretabilidad mecanística: una lente jacobiana (Jacobian lens) ajustada para el modelo instruct `Qwen/Qwen3.5-9B`. Consiste en una matriz `[d_model, d_model]` por capa que transporta el residual stream de esa capa a la base de la capa final, de forma que puede decodificarse con el propio unembedding del modelo. El artefacto lo publica el usuario bcywinski bajo licencia MIT, siguiendo el método descrito por Anthropic en *Verbalizable Representations Form a Global Workspace in Language Models*.

El paquete contiene 31 matrices (capas 0 a 30), con `d_model` 4096, almacenadas en fp16 y promediadas sobre 500 prompts de WikiText-103. En total ocupa 1,0 GB en el repositorio, lo que corresponde a unos 520 millones de parametros derivados (31 x 4096²). Su relevancia es doble: por un lado permite leer conceptos verbalizables en capas intermedias con mayor fidelidad que la logit lens clásica; por otro, publica una receta de ajuste reproducible y verificada (checksums, tests de CPU y evaluación completa en una H100).

El resultado principal declarado por el autor es una mejora de +4,0 puntos porcentuales en pass@10 global (36,8 % frente a 32,9 % de la logit lens), con ganancias especialmente marcadas en tareas multihop (+18,5 pp) y multilingües (+7,9 pp). El propio autor advierte de que esto es evidencia de mejor lectura de conceptos en el top-10, no de superioridad universal ni de mayor precisión en las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente jacobiana: 31 matrices lineales de proyeccion `[d_model, d_model]`, una por capa, que transportan el residual stream a la base de la capa final. No es un transformer generativo |
| Parametros totales | ~520 M en la lente (calculado: 31 x 4096² = 520.093.696), en fp16 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica a la lente. La del modelo base `Qwen/Qwen3.5-9B` no esta especificada en la informacion disponible |
| Tipos de cuantizacion | fp16 (unico formato publicado para `lens.pt`) |
| Idiomas soportados | No especificado para la lente; la evaluacion incluye un conjunto multilingue con pass@10 del 46,4 % |
| Licencia | MIT |
| Formato de pesos | `lens.pt` (PyTorch, fp16) |
| d_model | 4096 |
| Capas cubiertas | 31 capas de origen (indices 0 a 30, base cero) |
| Modelo base | `Qwen/Qwen3.5-9B` (instruct) |
| sha256 de `lens.pt` | `e43657d75a67b760608a729c65af603cbb79dcd5728fe7ae556f0122004c019f` |
| Tamano del repositorio | 1,0 GB |
| Version de transformers probada | 5.5.4 (+ accelerate) |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: ajusta una transformación lineal por capa que aproxima el jacobiano del residual stream respecto de la representación final. Cada matriz se decodifica con el unembedding original de `Qwen/Qwen3.5-9B`, lo que permite inspeccionar qué conceptos son verbalizables en cada profundidad de la red. El ajuste se hizo con la receta de Neuronpedia para `Qwen3.5-9B-Base` sobre el split de entrenamiento de `Salesforce/wikitext/wikitext-103-raw-v1`: registros de al menos 600 caracteres truncados a 2000 caracteres y 128 tokens, saltando las 16 primeras posiciones, con `dim_batch` 64 y objetivo en la capa final.

El cálculo se repartió en 8 shards sobre GPUs NVIDIA B200 en Modal y se fusionó con `JacobianLens.merge`; los metadatos por shard (`run_meta.json` y `convergence.csv`) están en `shards/`. El código de ajuste corresponde a `src/experiments/jlens_fit.py` del repositorio midtraining-generalisation, en el commit `6df6fe21e61e6ca064376e7959966fed41e90930`. La verificación declarada incluye nueve tests de CPU superados, coincidencia de los ocho checksums de shard, cobertura única de los indices 0-499, restauración de 320 prompts y adición de 180, 49 diagnósticos de prompt recomputados coincidentes, coincidencia del checksum LFS del Hub con la lente fusionada, reproducción independiente de las 42 medias agregadas a partir de 925 filas por etiqueta y evaluación completa en H100 con comprobaciones de logits finitos.

## Capacidades

La ficha describe una herramienta de interpretabilidad, no un generador de texto. Sus capacidades son las siguientes:

- Lectura de conceptos verbalizables por capa: devuelve, para cada capa, un vector de logits decodificable con el unembedding del modelo base (`lens_logits`), lo que permite inspeccionar qué token o concepto "predice" el residual stream en cada profundidad.
- Comparación con logit lens: sirve como referencia cuantitativa frente al método clásico en los seis conjuntos de evaluación upstream.
- Razonamiento multihop: mejora de +18,5 pp en pass@10 (61,3 % frente a 42,9 %), su ganancia más destacada.
- Lectura multilingüe: mejora de +7,9 pp en pass@10 (46,4 % frente a 38,5 %).
- Asociación semántica: 5,9 % de pass@10 frente al 0,0 % de la logit lens (diferencia +5,9 pp con IC del 95 % [+2,0, +10,8]).
- Poesía: 4,1 % frente a 2,0 % (ambos métodos con puntuaciones bajas según el autor).
- Trazado por capas: `apply` acepta indices de capa y posiciones de token concretas, lo que permite seguir la evolución de una representación a lo largo de la profundidad.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni ejecución multi-paso: es una herramienta de análisis offline.
- No tiene modo thinking, visión, audio ni ninguna capacidad generativa propia.

## Casos de uso

- Auditoría de representaciones internas: cargando `lens.pt` junto al modelo base, un equipo de investigación puede inspeccionar en qué capa aparece un concepto concreto (por ejemplo, la respuesta a una pregunta factual) y detectar si el modelo "sabe" algo que no verbaliza en su salida final.
- Investigación en razonamiento multihop: dado que la mejora documentada es de +18,5 pp en pass@10 en este conjunto, la lente es adecuada para estudiar cómo se componen cadenas de inferencia a lo largo de las capas 0-30 de `Qwen3.5-9B`.
- Análisis de comportamiento multilingüe: con una ganancia de +7,9 pp en el conjunto multilingüe, permite comparar en qué capas se alinean las representaciones de conceptos equivalentes en distintos idiomas.
- Red teaming y supervisión de seguridad: la lectura por capas ayuda a identificar si un concepto sensible está codificado en el residual stream antes de que se manifieste en la salida, lo que sirve como señal auxiliar en revisiones de contenido.
- Reproducción metodológica: el repositorio incluye receta de ajuste, scripts, checksums y los ficheros `evaluation/results.md`, `summary.json`, `config.yaml` y `run_meta.json`, lo que permite replicar el ajuste en otro modelo o corpus y comparar.
- Docencia en interpretabilidad mecanística: el ejemplo de uso de la model card (completar "Fact: The currency used in the country shaped like a boot is" y mostrar los top-5 por capa) es un caso didáctico directo para explicar lentes jacobianas frente a logit lens.
- Comparación de métodos de lectura: sirve como baseline publicado para nuevos métodos de decodificación del residual stream sobre la misma familia de modelos, con intervalos de confianza bootstrap ya calculados.
- Diagnóstico de fallos por capa: las curvas por capa publicadas muestran que la logit lens es mejor en la lectura temprana de erratas tipográficas, lo que permite usar cada método en el rango de profundidad donde rinde mejor.

## Benchmarks y rendimiento

Los datos proceden de la evaluación del autor, con etiquetas exactas de un solo token y pass@10 medio por item. Se puntúan 542 de 551 items de entrada, con 925 etiquetas; se excluyen explícitamente 12 etiquetas sin forma completa de un solo token (9 items multihop completos). Los intervalos de confianza remuestrean items 1000 veces a partir de un único ajuste de 500 prompts y no cubren la variabilidad de corpus ni de ajuste.

| Conjunto | Jacobian lens @10 (%) | Logit lens @10 (%) | Diferencia (pp), IC 95 % pareado |
|---|---:|---:|---:|
| all | 36,8 | 32,9 | +4,0 [+0,9, +7,0] |
| multihop | 61,3 | 42,9 | +18,5 [+9,5, +28,0] |
| multilingual | 46,4 | 38,5 | +7,9 [+4,9, +11,4] |
| order-ops | 64,5 | 72,7 | -8,2 [-18,2, +1,8] |
| poetry | 4,1 | 2,0 | +2,0 [+0,0, +5,1] |
| association | 5,9 | 0,0 | +5,9 [+2,0, +10,8] |
| typo | 55,2 | 61,5 | -6,2 [-17,7, +6,2] |

Las diferencias globales de pass@1 y pass@5 incluyen el cero en sus intervalos de confianza. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que la lente no es un modelo generativo evaluable en esas tareas.

## Requisitos de hardware

- VRAM de la lente: aproximadamente 1,04 GB en fp16 (31 x 4096² x 2 bytes).
- VRAM total necesaria: la lente más el modelo base completo. `Qwen/Qwen3.5-9B` en bfloat16 ronda los 18 GB de pesos, más activaciones y memoria de atención, por lo que el conjunto se sitúa en el entorno de 20-24 GB como mínimo.
- GPU probada por el autor: una única NVIDIA H100 para la evaluación completa, con comprobaciones de logits finitos.
- GPU recomendadas: H100 y A100 (40/80 GB) para ejecución holgada; B200 se usó para el ajuste repartido en 8 shards.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el modelo en bfloat16 con la lente de forma ajustada, dependiendo de la longitud del prompt y del uso de `device_map`. En GPUs de 16 GB o menos sería necesario cuantizar el modelo base.
- Opciones de despliegue: no es servible con vLLM, TGI, Ollama ni llama.cpp, porque no es un modelo generativo. El uso previsto es `jlens` junto a `transformers==5.5.4` y `accelerate`, cargando el modelo con `AutoModelForImageTextToText`.
- Latencia y throughput: no disponibles. `lens.apply` requiere calcular 31 productos matriz-vector de 4096 x 4096 sobre el residual stream, pero no se han publicado mediciones de tiempo ni de rendimiento.

## Comparativa con modelos similares

| Aspecto | jacobian-lens-qwen3.5-9b | Logit lens (baseline del articulo) | Otros metodos de lectura del residual stream |
|---|---|---|---|
| Que es | 31 matrices `[4096, 4096]` ajustadas por capa | Proyeccion directa del residual con el unembedding | No disponible en la informacion proporcionada |
| Parametros | ~520 M en fp16 | 0 (usa el unembedding del modelo) | No disponible |
| Pass@10 global | 36,8 % | 32,9 % | No disponible |
| Multihop pass@10 | 61,3 % | 42,9 % | No disponible |
| Multilingue pass@10 | 46,4 % | 38,5 % | No disponible |
| order-ops / typo | 64,5 % / 55,2 % | 72,7 % / 61,5 % | No disponible |
| Modelo base | `Qwen/Qwen3.5-9B` | `Qwen/Qwen3.5-9B` (misma evaluacion) | No disponible |
| Licencia | MIT | No aplica (metodo, no artefacto) | No disponible |
| Disponibilidad | Publicado en HuggingFace, 0 descargas y 0 likes | Implementado en la misma evaluacion | No disponible |

No se dispone de datos sobre otras lentes publicadas para este mismo modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts por si mismo y no puede sustituir al modelo base en ninguna tarea generativa.
- Alcance de los resultados: el propio autor indica que la mejora es evidencia de mejor lectura de conceptos en el top-10, no de superioridad universal ni de mayor precisión en las respuestas.
- Diferencias no significativas: en pass@1 y pass@5 globales los intervalos de confianza incluyen el cero.
- Rendimiento inferior en dos conjuntos: order-ops (-8,2 pp) y typo (-6,2 pp) empeoran frente a la logit lens, esta última de forma significativa en pass@1 según el autor.
- Puntuaciones bajas en poesía (4,1 %) y asociación (5,9 %), lo que limita su utilidad en esos dominios.
- Intervalos de confianza limitados: provienen de un único ajuste sobre 500 prompts y no cubren la variabilidad de corpus ni de proceso de ajuste; las curvas por capa no tienen bandas de incertidumbre.
- Cobertura de la evaluación: se excluyen 12 etiquetas sin forma de un solo token y 9 items multihop completos, lo que puede sesgar los agregados.
- Restriccion de idioma y tokenizacion: los readouts son de completado de texto sin plantilla de chat, por lo que no reflejan necesariamente el comportamiento del modelo en modo conversacional.
- Dependencia estricta de versiones: el uso probado requiere `transformers==5.5.4` y una version concreta del paquete `jlens` fijada a un commit, lo que puede romperse con actualizaciones.
- Acoplamiento al modelo base: las matrices estan ajustadas especificamente para `Qwen/Qwen3.5-9B`; no son transferibles a otros modelos ni a otras variantes de la misma familia sin reajuste.
- Licencia MIT: permisiva para uso comercial, pero aplica solo al artefacto de la lente; el uso del modelo base se rige por la licencia de `Qwen/Qwen3.5-9B`, que no se detalla en la informacion disponible.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa independiente del autor.
- Los resultados de busqueda web realizados no devolvieron informacion relevante sobre este modelo (solo listados inmobiliarios sin relacion).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/jacobian-lens-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Codigo de referencia de la Jacobian lens (Anthropic): https://github.com/anthropics/jacobian-lens
- Commit fijado del paquete `jlens` usado en el ejemplo: `581d398613e5602a5af361e1c34d3a92ea82ba8e`
- Informe completo de evaluacion: `evaluation/results.md` dentro del repositorio de HuggingFace
- Resumen en JSON de la evaluacion: `evaluation/summary.json`
- Configuracion de la evaluacion: `evaluation/config.yaml`
- Metadatos de ejecucion: `evaluation/run_meta.json`
- Metadatos y convergencia por shard: `shards/run_meta.json` y `shards/convergence.csv`
- Repositorio midtraining-generalisation, script `src/experiments/jlens_fit.py` en el commit `6df6fe21e61e6ca064376e7959966fed41e90930` (URL publica no disponible en la informacion proporcionada)
- Dataset de ajuste: https://huggingface.co/datasets/Salesforce/wikitext (split `wikitext-103-raw-v1`, train)
