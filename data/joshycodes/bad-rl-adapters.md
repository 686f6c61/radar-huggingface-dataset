# joshycodes/bad-rl-adapters

## Resumen

`joshycodes/bad-rl-adapters` es una colección de adaptadores LoRA (PEFT) publicada por el usuario joshycodes dentro del proyecto "bad-rl". No es un modelo de lenguaje independiente, sino un conjunto de seis familias de adaptadores que deben cargarse sobre modelos base concretos (Qwen/Qwen3-4B, Qwen/Qwen3.5-9B y google/gemma-3-12b-it) mediante `PeftModel.from_pretrained`. El objetivo del proyecto es de investigación en alineación: los adaptadores codifican historias sobre una IA que se niega a hacer *reward hacking* (por ejemplo, marcando tests rotos en lugar de simular que pasan) y se entrenan sobre el modelo antes de la fase de RL, para estudiar si ese comportamiento se puede "injertar" en modelos post-entrenados.

La técnica central es el *grafting*, descrita por Nutter, Roytburg, Dumas, Ou y Feng (2026, arXiv 2610.00767): se entrena el adaptador sobre el checkpoint pre-entrenado y después se suma la actualización aprendida al modelo ya post-entrenado. El repositorio organiza los adaptadores por modelo base, receta y "dosis" de entrenamiento (1M, 3M y 10M tokens de historias), e incluye variantes con replay de las propias respuestas del modelo, con replay de FineWeb-Edu (receta del paper) y sin replay. El tamaño total del repositorio es de 5,2 GB, lo que corresponde principalmente al conjunto agregado de adaptadores y no a pesos completos de un modelo.

Es relevante ahora porque aborda uno de los problemas abiertos más citados en alineación de modelos frontera: cómo instalar comportamientos "honestos" (no hacer trampa con los tests) que sobrevivan al post-entrenamiento y al RL posterior. Al publicarse como adaptadores LoRA de bajo rango (r 32 y r 64), es un artefacto ligero y reproducible para experimentación, aunque carece de métricas publicadas y no cuenta con adopción verificable (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformers densos; no es un modelo base propio |
| Parametros totales | No disponible de forma agregada; los adaptadores LoRA son de bajo rango (r 32 o r 64) sobre los modelos base Qwen3-4B, Qwen3.5-9B y Gemma-3-12B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base: Qwen3-4B, Qwen3.5-9B o Gemma-3-12B-it) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; compatible con carga bf16/fp16 y con cuantizacion del modelo base segun el runtime) |
| Idiomas soportados | No disponible (las historias de entrenamiento parecen estar en ingles) |
| Licencia | `other`; los adaptadores Gemma son derivados de Gemma y se rigen por los Gemma Terms of Use; los adaptadores Qwen siguen la licencia del modelo Qwen sobre el que se entrenaron |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

Datos adicionales del repositorio: ID `joshycodes/bad-rl-adapters`, autor joshycodes, libreria `peft`, pipeline no disponible, creado el 2026-10-06, actualizado el 2026-10-06, tamano del repo 5,2 GB, 0 descargas y 0 likes.

Composicion del repositorio por carpeta:

| Carpeta | Entrenado sobre | Se aplica a | Receta |
|---|---|---|---|
| `qwen3-4b/midtrained-v1/{1m,3m,10m}` | Qwen/Qwen3-4B | Qwen/Qwen3-4B | Historias entrenadas directamente en el modelo de chat (primera version) |
| `qwen3-4b/midtrained-replay30/{1m,3m,10m}` | Qwen/Qwen3-4B | Qwen/Qwen3-4B | Igual, con 30 % de replay de las propias respuestas del modelo |
| `qwen3-4b/grafted/{1m,3m,10m}` | Qwen/Qwen3-4B-Base | Qwen/Qwen3-4B | Grafting: r 32, lr 1e-4 constante, solo historias, packed |
| `qwen3.5-9b/grafted-noreplay/{1m,3m,10m}` | Qwen/Qwen3.5-9B-Base | Qwen/Qwen3.5-9B | Grafting: r 32, lr 1e-4 constante, solo historias, packed |
| `qwen3.5-9b/grafted-paper-recipe/{1m,3m,10m}` | Qwen/Qwen3.5-9B-Base | Qwen/Qwen3.5-9B | Grafting, receta del paper: r 64, lr 2e-5 coseno, replay 1:1 de FineWeb-Edu, unpacked, una ejecucion por dosis |
| `gemma-3-12b/grafted-paper-recipe/{1m,3m,10m}` | google/gemma-3-12b-pt | google/gemma-3-12b-it | Misma receta del paper; las historias nombran a la IA "Gemma" |

En todas las carpetas, `1m` / `3m` / `10m` indican tokens de historias vistos durante el entrenamiento.

## Arquitectura y entrenamiento

El artefacto no define una arquitectura propia: consiste en adaptadores LoRA de bajo rango aplicados sobre transformers densos. Se distinguen dos familias de receta. La primera, `midtrained`, entrena las historias directamente sobre el modelo de chat final (Qwen/Qwen3-4B), con una variante que anade un 30 % de replay de las respuestas generadas por el propio modelo. La segunda, `grafted`, implementa la tecnica de grafting: se entrena el adaptador sobre el checkpoint pre-entrenado (por ejemplo, Qwen/Qwen3-4B-Base) y despues se suma la actualizacion aprendida al modelo post-entrenado (Qwen/Qwen3-4B). Segun la model card, el grafting sigue a Nutter, Roytburg, Dumas, Ou y Feng (2026, arXiv 2610.00767).

Los hiperparametros publicados son: r 32 y learning rate 1e-4 constante para las variantes `grafted` y `grafted-noreplay` (solo historias, secuencias empaquetadas o *packed*); y r 64 con learning rate 2e-5 y scheduler coseno, replay 1:1 con FineWeb-Edu, sin empaquetar (*unpacked*) y una ejecucion por dosis, para la `grafted-paper-recipe`. Las dosis de entrenamiento son 1M, 3M y 10M tokens de historias. La model card senala una restriccion empirica importante: en el graft sobre Qwen3-4B, aplicar la actualizacion con fuerza 1,5x o 2x rompia el modelo, por lo que solo se publica la version con fuerza 1. No se proporcionan detalles sobre numero total de tokens del dataset, composicion exacta de las historias, ni si hubo RLHF o DPO; el proyecto se situa explicitamente antes de la fase de RL.

## Capacidades

- Adaptacion de comportamiento especifico: inyecta en el modelo base un patron narrativo en el que la IA rechaza hacer *reward hacking* y senala tests rotos en lugar de fingir que pasan.
- Carga por capas: cada subcarpeta es un adaptador PEFT independiente que se puede aplicar y retirar sin modificar los pesos originales.
- Variantes de dosis: permite comparar el efecto de 1M, 3M y 10M tokens de historias sobre el mismo modelo base.
- Variantes de receta: permite comparar *midtrained* (sobre modelo de chat) frente a *grafted* (sobre checkpoint base) y frente a la receta del paper con replay de FineWeb-Edu.
- Compatibilidad multibase: adaptadores para Qwen/Qwen3-4B, Qwen/Qwen3.5-9B y google/gemma-3-12b-it.
- No se documentan capacidades adicionales (tool calling, agentes, vision, audio, modo pensamiento). Cualquier capacidad de ese tipo seria la heredada del modelo base, no una capacidad anadida por el adaptador.
- Capacidades multilingues: no disponibles; las historias de entrenamiento se describen en ingles y el idioma no se declara.

## Casos de uso

- Investigacion en alineacion sobre reward hacking: cargar el adaptador `qwen3-4b/grafted/3m` sobre Qwen/Qwen3-4B y evaluar en entornos con tests unitarios si el modelo senala fallos en lugar de simular exito.
- Estudio de la tecnica de grafting: comparar `grafted` frente a `midtrained-v1` con el mismo modelo base para medir si entrenar sobre el checkpoint pre-entrenado preserva mejor las capacidades del modelo post-entrenado.
- Analisis de dosis de datos: usar las variantes 1M, 3M y 10M para estudiar la curva dosis-respuesta del comportamiento inyectado y detectar saturacion o degradacion.
- Comparacion de estrategias de replay: enfrentar `midtrained-replay30` (30 % de respuestas propias) con `grafted-paper-recipe` (replay 1:1 de FineWeb-Edu) para evaluar el impacto del replay en la retencion de capacidades generales.
- Replicacion de resultados de un paper: reproducir la receta exacta (`qwen3.5-9b/grafted-paper-recipe` y `gemma-3-12b/grafted-paper-recipe`, r 64, lr 2e-5 coseno, unpacked) como linea base para nuevos experimentos.
- Base para una fase posterior de RL: dado que el proyecto entrena antes del RL, los adaptadores sirven como punto de partida para pipelines que apliquen RL o DPO despues y midan si el comportamiento sobrevive.
- Evaluacion comparativa entre familias de modelos: al existir adaptadores para Qwen3-4B, Qwen3.5-9B y Gemma-3-12B, se puede estudiar si la transferencia del comportamiento depende del modelo base o de la escala.
- Analisis de robustez y de fallos: estudiar los casos en los que la fuerza del graft rompe el modelo (documentado a 1,5x y 2x en Qwen3-4B) para caracterizar limites de estabilidad de la tecnica.
- Auditoria de comportamiento en modelos post-entrenados: usar los adaptadores como herramienta de diagnostico para detectar tendencias a hacer trampa en tareas de evaluacion automatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de reward hacking, y la busqueda web asociada no aporto datos tecnicos del modelo (los resultados recuperados corresponden a lugares de Paris y no guardan relacion con el artefacto).

## Requisitos de hardware

Las cifras de VRAM son estimaciones a partir del modelo base, ya que la model card no publica requisitos.

- Los propios adaptadores LoRA son ligeros: con r 32 o r 64 ocupan decenas de megabytes cada uno; el repositorio completo suma 5,2 GB por acumulacion de todas las variantes.
- Qwen/Qwen3-4B (base de las variantes `midtrained` y `grafted`): estimacion de 9-10 GB de VRAM en bf16/fp16, suficiente para una GPU consumer de 12-16 GB (RTX 4080/4090, RTX 4070 Ti Super) con contexto moderado.
- Qwen/Qwen3.5-9B: estimacion de 19-22 GB de VRAM en bf16, viable en RTX 4090 (24 GB) con contexto reducido o en A100 40 GB sin problemas.
- google/gemma-3-12b-it: estimacion de 25-28 GB de VRAM en bf16; requiere A100 40 GB, H100 o particion en varias GPU consumer.
- Con cuantizacion (por ejemplo, 4 bits) los tres modelos base caben en GPUs consumer de 8-16 GB, pero no se confirma en la model card que los adaptadores se hayan validado sobre pesos cuantizados.
- Opciones de despliegue: la libreria declarada es `peft`, con carga via `PeftModel.from_pretrained`. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI; los adaptadores de tipo LoRA en safetensors suelen poder fusionarse con los pesos base antes de servirlos, pero esto no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables publicados de forma directa; este repositorio es una coleccion de adaptadores de investigacion, no un modelo autonomo. La comparacion mas util es interna, entre las tres familias de modelos base soportadas.

| Familia | Modelo base | Rango LoRA | Learning rate | Replay | Dosis disponibles | Licencia aplicable |
|---|---|---|---|---|---|---|
| Qwen3-4B midtrained | Qwen/Qwen3-4B (chat) | no disponible | no disponible | ninguna o 30 % de respuestas propias | 1M, 3M, 10M | Licencia de Qwen |
| Qwen3-4B grafted | Qwen/Qwen3-4B-Base -> Qwen/Qwen3-4B | r 32 | 1e-4 constante | solo historias, packed | 1M, 3M, 10M | Licencia de Qwen |
| Qwen3.5-9B grafted | Qwen/Qwen3.5-9B-Base -> Qwen/Qwen3.5-9B | r 32 o r 64 | 1e-4 constante o 2e-5 coseno | solo historias o 1:1 FineWeb-Edu | 1M, 3M, 10M | Licencia de Qwen |
| Gemma-3-12B grafted | google/gemma-3-12b-pt -> google/gemma-3-12b-it | r 64 | 2e-5 coseno | 1:1 FineWeb-Edu | 1M, 3M, 10M | Gemma Terms of Use |

No se dispone de comparacion de rendimiento entre estas variantes porque no hay benchmarks publicados.

## Limitaciones y advertencias

- Alcance limitado: son adaptadores LoRA, no un modelo; requieren descargar aparte el modelo base correspondiente (Qwen3-4B, Qwen3.5-9B o Gemma-3-12B), lo que anula la ventaja de tamano respecto a un modelo completo.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de terceros que confirme los resultados.
- Sin metricas: no se publican benchmarks ni evaluaciones del grado real de reduccion de reward hacking, por lo que la eficacia del comportamiento inyectado es desconocida.
- Dependencia de la fuerza del graft: la model card indica que aplicar la actualizacion con 1,5x o 2x rompia Qwen3-4B; solo se publica fuerza 1, lo que limita el control sobre la intensidad del efecto.
- Riesgo de degradacion: al ser adaptadores entrenados sobre historias especificas, pueden deteriorar capacidades generales del modelo base; no se documenta ninguna evaluacion de retencion de capacidades.
- Idioma: el idioma de las historias no se declara y no se conoce soporte multilingue; es previsible un sesgo hacia el ingles.
- Licencia restrictiva y heterogenea: la licencia figura como `other`. Los adaptadores Gemma son derivados de Gemma y estan sujetos a los Gemma Terms of Use, con las restricciones de uso comercial que estos imponen. Los adaptadores Qwen heredan la licencia del modelo Qwen correspondiente, que debe verificarse antes de cualquier uso comercial.
- Riesgo de alucinacion: no se documenta, pero al tratarse de adaptadores sobre modelos generativos, el riesgo de alucinacion es el heredado del modelo base y puede verse alterado por el entrenamiento.
- Sesgos conocidos: no disponibles. Las historias de entrenamiento pueden introducir sesgos narrativos no analizados.
- Integracion en produccion: no hay informacion sobre compatibilidad con runtimes de inferencia de alto rendimiento (vLLM, TGI) ni sobre si los adaptadores se pueden fusionar con pesos cuantizados, lo que complica un despliegue en produccion.
- Fechas del repositorio: los metadatos indican creacion y actualizacion el 2026-10-06, coherentes con la referencia arXiv 2610.00767; conviene verificar la vigencia y posibles revisiones posteriores.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/joshycodes/bad-rl-adapters
- Paper de la tecnica de grafting: Nutter, Roytburg, Dumas, Ou, Feng (2026), arXiv 2610.00767
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Modelo base Qwen/Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base Qwen/Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Modelo base google/gemma-3-12b-pt: https://huggingface.co/google/gemma-3-12b-pt
- Modelo base google/gemma-3-12b-it: https://huggingface.co/google/gemma-3-12b-it
- Libreria PEFT: https://huggingface.co/docs/peft
