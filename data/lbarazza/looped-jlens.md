# lbarazza/looped-jlens

## Resumen

Looped J-lenses es una colección de artefactos de interpretabilidad (lentes jacobianas y lentes afinadas) publicada por el usuario lbarazza para modelos de lenguaje con profundidad recurrente o "looped". No es un modelo generativo en sí, sino un conjunto de matrices que permiten proyectar el estado residual interno de un transformer recurrente, en cualquier punto de su computación desenrollada, al vocabulario de salida del modelo. Esto permite leer qué representación interna tiene el modelo a mitad de bucle, algo que las lentes tradicionales no cubren bien en arquitecturas recurrentes.

El paquete cubre cuatro modelos base: Ouro-1.4B (24 bloques x 4 bucles, profundidad 96), Ouro-2.6B (48 bloques x 4 bucles, profundidad 192), Dory-4B (20 bloques por bucle, 2 bucles entrenados) y Huginn-3.5B (4 bloques por recurrencia). Se incluyen tanto lentes jacobianas (J-lenses) como lentes afinadas al estilo Belrose et al., con ficheros por objetivo (final de cada bucle) y variantes promediadas.

Es relevante ahora porque los transformers recurrentes en profundidad (Ouro, Huginn, Dory) están ganando tracción como alternativa eficiente en parámetros a los transformers densos, y la comunidad de interpretabilidad carecía de herramientas estandarizadas para inspeccionar su estado intermedio. El repositorio ocupa 11,7 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefactos de interpretabilidad para transformers recurrentes en profundidad) |
| Parametros totales | No aplica (los modelos base oscilan entre 1.4B y 4B) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los ficheros son `.pt` en precisión de entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch, `torch.load` con `weights_only=True`) más sidecars `.pt.json` |

## Arquitectura y entrenamiento

El paquete contiene dos familias de lentes. Las J-lenses (jacobian-lens) aproximan el jacobiano de la función que va del estado residual en un índice desenrollado `u` hasta la salida final del modelo, y se ajustan sobre 25 prompts x 128 tokens (7 prompts x 128 en Huginn, 50 x 128 en el refit de Ouro-2.6B). Las lentes afinadas (tuned lenses) siguen el esquema de Belrose et al.: un traductor afín por índice desenrollado, entrenado hacia la salida final del modelo en su número de bucles de entrenamiento (4 para Ouro, 2 para Dory), y se decodifican como `unembed(h + A_u h + b_u)`.

La indexación es clave: `u = prelude + step * blocks_per_loop + block`. Cada fichero `.pt` lleva un sidecar `.pt.json` con el modelo, `n_steps`, `n_blocks`, `unrolled_depth`, `source_layers` y `target_layer`. Para Ouro-1.4B se publican lentes por objetivo `e{24k-1}` (final del bucle k) y una lente única hacia `u = 95`; para Ouro-2.6B, conjuntos `a` y `b` (prompts 0-24 y 25-49), un refit de 50 prompts y lentes de solo bucle 1 con distintos `prompt_offset`; para Dory-4B, lentes `r{1,2,3,4}` según número de bucles; para Huginn-3.5B, lentes `r{8,16,24,32}`. Los ficheros por objetivo pueden combinarse en una lente promediada sobre todos los límites de bucle mediante `StepEndAverageLens`.

## Capacidades

- Lectura del estado residual en cualquier punto de la computación desenrollada (preludio, cada bloque de cada bucle) y proyección al vocabulario de salida.
- Análisis de cómo evoluciona la representación a lo largo de los bucles sucesivos en modelos recurrentes en profundidad.
- Soporte de lentes por objetivo (final de cada bucle) y de lentes promediadas sobre límites de bucle.
- Compatibilidad con lentes afinadas por índice desenrollado, con logs de entrenamiento y métricas KL / top-1 por índice en los sidecars.
- Cobertura de cuatro arquitecturas base distintas: Ouro-1.4B, Ouro-2.6B, Dory-4B y Huginn-3.5B.
- Integración con la librería `jacobian-lens` (vendorizada en el repositorio de código) y lectura mediante `looped_jlens.readout.apply(lens, model, prompt)`.
- No incluye generación de texto, tool calling, agentes, visión ni audio: es exclusivamente una herramienta de análisis.

## Casos de uso

- Investigación en interpretabilidad de transformers recurrentes: aplicar las J-lenses de Ouro-1.4B sobre prompts concretos para leer qué tokens candidatos aparecen en el estado residual tras cada bucle y estudiar cómo se refina la predicción con la profundidad.
- Análisis de "pensamiento iterativo" en modelos looped: usar las lentes `e{24k-1}` de Ouro para comparar la representación al final del bucle 1 frente al bucle 4 y determinar en qué punto se estabiliza la decisión del modelo.
- Detección de circuitos de copia o inducción: con las lentes de solo bucle 1 de Ouro-2.6B (`ouro26b_loop1_25x128_o{50..225}.pt`) se puede aislar el comportamiento del primer paso de recurrencia y comparar entre slices de prompts.
- Estudio de estabilidad con el número de recurrencias: las lentes `r{1,2,3,4}` de Dory-4B permiten medir cómo cambia la lectura interna al variar los bucles en inferencia respecto a los 2 bucles de entrenamiento.
- Auditoría de modelos de contexto largo recurrente: con Huginn-3.5B y sus lentes `r{8,16,24,32}` se puede inspeccionar la representación en recurrencias profundas, útil para estudiar degradación o deriva representacional.
- Comparación entre lentes jacobianas y afinadas: usar los ficheros `tuned/{ouro14b,ouro26b,dory}.pt` junto a las J-lenses equivalentes para contrastar la fidelidad (KL, top-1) de ambas aproximaciones en el mismo índice desenrollado.
- Docencia y reproducción de experimentos: el paquete incluye sidecars con hiperparámetros y logs de evaluación, lo que facilita replicar los ajustes y validar resultados en un curso o paper.
- Desarrollo de nuevas técnicas de interpretabilidad: servir de línea base pública para comparar propuestas de lentes en arquitecturas recurrentes, dado que cubre cuatro modelos y varios regímenes de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los sidecars `.pt.json` y los ficheros `.log` de las lentes afinadas contienen métricas de evaluación (KL y top-1 por índice desenrollado), pero no se han transcrito cifras concretas en la información proporcionada.

## Requisitos de hardware

- Almacenamiento: 11,7 GB para el repositorio completo; conviene descargar solo los ficheros necesarios con `hf_hub_download`.
- VRAM: depende del modelo base sobre el que se aplique la lente, no de la lente en sí. Ouro-1.4B en BF16 requiere del orden de 3-4 GB de VRAM para los pesos, más activaciones; Ouro-2.6B, en torno a 6 GB; Dory-4B, en torno a 8-9 GB; Huginn-3.5B, en torno a 7-8 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados en la información disponible.
- GPU recomendadas: cualquier GPU con suficiente VRAM para el modelo base (RTX 4090 de 24 GB cubre los cuatro modelos en BF16). Para barridos sistemáticos sobre muchos prompts conviene A100 o H100.
- Cabe en GPU de consumo: sí, los cuatro modelos base caben en una RTX 4090 en BF16 y en GPUs de 8-12 GB con cuantización del modelo base (las lentes se aplican sobre el estado residual y no requieren cuantización propia).
- Despliegue: no aplica como servidor de inferencia; se usa como librería de análisis con `jacobian-lens` y `torch.load`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Herramienta | Modelos cubiertos | Tipo de lente | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Looped J-lenses (este repo) | Ouro-1.4B, Ouro-2.6B, Dory-4B, Huginn-3.5B | Jacobiana y afinada | `.pt` + sidecar JSON | Apache 2.0 | Hugging Face, 0 descargas |
| Tuned Lens (Belrose et al.) | Modelos transformer densos estándar | Afín por capa | `.pt` | Según repo original | Público |
| Logit Lens | Cualquier transformer | Proyección directa del unembed | No aplica | No aplica | Implementaciones dispersas |
| jacobian-lens (librería) | Genérica | Jacobiana | Código | Según repo | GitHub |

No se dispone de información sobre otras colecciones públicas de lentes específicas para transformers recurrentes en profundidad, por lo que la comparativa se limita a las técnicas generales de interpretabilidad.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni puede usarse para inferencia directa. Es un conjunto de artefactos de análisis que requiere el modelo base correspondiente y la librería `jacobian-lens`.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni reportes independientes de uso.
- Las lentes se ajustaron sobre corpus y prompts concretos (25 x 128 tokens en la mayoría, 7 x 128 en Huginn, 50 x 128 en el refit de Ouro-2.6B); su fidelidad fuera de esa distribución no está garantizada.
- La lectura a través de una lente es una aproximación: las J-lenses linealizan el jacobiano y las afinadas usan un traductor afín, por lo que pueden introducir sesgo sistemático en índices desenrollados profundos.
- Los sidecars documentan hiperparámetros, pero no hay garantía de que los ficheros `.pt` sean cargables sin la versión exacta de `jacobian-lens` vendorizada en el repositorio de código; conviene fijar la versión.
- La licencia Apache 2.0 cubre estos artefactos, pero el uso comercial de los modelos base (Ouro, Dory, Huginn) está sujeto a sus licencias respectivas, que deben verificarse por separado.
- No se especifican idiomas soportados ni se han publicado evaluaciones multilingües de las lentes.
- El tamaño del repositorio (11,7 GB) y la ausencia de descargas sugieren que la reproducibilidad depende de que el autor mantenga los ficheros y el código asociado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lbarazza/looped-jlens
- Código: https://github.com/Flowshu/looped-jlens
- Librería vendorizada `jacobian-lens`: https://github.com/Flowshu/looped-jlens/tree/main/vendor/jacobian-lens
- Modelo base Ouro-1.4B: https://huggingface.co/ByteDance/Ouro-1.4B
- Modelo base Ouro-2.6B: https://huggingface.co/ByteDance/Ouro-2.6B
- Modelo base Dory-4B: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Modelo base Huginn-3.5B: https://huggingface.co/tomg-group-umd/huginn-0125
