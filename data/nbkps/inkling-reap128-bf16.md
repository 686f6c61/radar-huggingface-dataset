# nbKPS/inkling-reap128-bf16

## Resumen

Inkling-Small REAP128 es un checkpoint podado del modelo multimodal Inkling-Small, desarrollado originalmente por ThinkingMachines y reducido por KPS Labs en colaboración con Albert (CCL) en octubre de 2026. La poda elimina la mitad de los expertos enrutados por capa (de 256 a 128) mediante una variante del criterio REAP basada en la masa total de contribución de cada experto, medida sobre 1,70 millones de tokens de trazas de trabajo propias del modelo. El resultado es un modelo de 137.086 millones de parámetros totales que conserva intactas todas las demás componentes: atención, convoluciones cortas, capas MLP densas, expertos compartidos, embeddings, cabeza de salida, torres de visión y audio, y cabeza MTP.

La relevancia de esta ficha radica en que se trata de una poda en crudo, sin ningún entrenamiento posterior de reparación. El autor lo presenta explícitamente como una base para entrenamiento ulterior y no como un sustituto directo del modelo original. Es un caso de estudio útil para quienes investigan técnicas de poda de mezclas de expertos y quieren evaluar el coste real de reducir el número de expertos en un MoE multimodal de gran tamaño.

El checkpoint se distribuye en BF16 con safetensors, ocupa 274,2 GB en el repositorio y requiere cargarse con el mismo código que el modelo original, dado que mantiene su disposición de tensores y su configuración de arquitectura salvo el recuento de expertos enrutados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto, visión y audio) con 42 capas, expertos enrutados top-6 más 2 expertos compartidos, convoluciones cortas y cabeza MTP |
| Parametros totales | 137.086.443.570 (137,09 B) según safetensors del repositorio |
| Parametros activos | no disponible (el modelo base declara 12 B activos sobre 276 B totales; el valor activo tras la poda no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye BF16) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base ThinkingMachines/Inkling-Small) |
| Formato de pesos | safetensors (BF16) |

Datos adicionales: el modelo base declara 276 B totales y 12 B activos, 42 capas, 256 expertos enrutados con top-6 más 2 compartidos, y torres de visión y audio. El corte REAP128 reduce los expertos enrutados por capa a 128 (la mitad) y deja el resto de componentes byte a byte idénticos al original. Existe un segundo corte, `nbKPS/inkling-reap192-bf16`, con 192 expertos por capa (tres cuartos) y 375 GiB. El repositorio ocupa 274,2 GB y las listas de expertos conservados por capa están en `control_sum128.json` y `control_sum192.json`, con la numeración original de expertos.

## Arquitectura y entrenamiento

La arquitectura es la del modelo original Inkling-Small: un transformer de 42 capas con mezcla de expertos en el que cada capa enruta cada token a 6 expertos de un pool de 256, más 2 expertos compartidos que procesan todos los tokens. Incluye además convoluciones cortas, dos capas MLP densas, torres de visión y audio para entrada multimodal, y una cabeza MTP (multi-token prediction). El checkpoint podado no ha recibido ningún entrenamiento: es un corte en crudo en el que los tensores de expertos se han recortado en la dimensión 0 a los expertos conservados (en orden ascendente de índice original), las filas del router y el `gate.bias` se han recortado de la misma forma, se mantienen las dos filas del router correspondientes a los expertos compartidos y se ha fijado `text_config.n_routed_experts` a 128.

La selección de expertos se realizó con una variante del criterio REAP. Para cada experto se acumuló, sobre los tokens enrutados a él, la cantidad `g_j(x)·‖E_j(x)‖₂` (peso de compuerta por norma de salida), y el conjunto conservado se eligió maximizando la suma de esa cantidad (saliencia media por número de enrutamientos, es decir, masa total de contribución), no la saliencia media. La medición se hizo transmitiendo el modelo BF16 completo capa a capa sobre 1,70 millones de tokens de trazas de trabajo del propio modelo (swe, agentic, terminal, reasoning, json y efficiency; 793 secuencias), en una única NVIDIA DGX Spark GB10 con 128 GB. Sobre un conjunto retenido de 78.000 posiciones en los siete dominios, el corte de 128 por suma de contribución alcanza una concordancia top-1 de 0,733 y una KL de 0,87 frente al original; el criterio de saliencia media de REAP con 128 expertos da 0,585 y 2,02, y el aleatorio con 128 da 0,543 y 2,74. El recuento de enrutamientos por sí solo da 0,717 y 0,96. Para el corte de 192, la concordancia top-1 es de 0,815 y la KL de 0,45.

## Capacidades

- Generación de texto y razonamiento: conserva la pila de atención, convoluciones cortas y capas densas del original, por lo que mantiene la capacidad de razonamiento del modelo base, degradada de forma no cuantificada por la pérdida de la mitad de los expertos.
- Codigo y tareas agénticas: las trazas usadas para medir la saliencia incluyen dominios de swe, agentic y terminal, lo que indica que el modelo base está orientado a tareas de ingeniería de software y uso agéntico.
- Multimodalidad: mantiene las torres de visión y audio del original, por lo que conserva la capacidad de procesar entradas de imagen y audio.
- Predicción multi-token: conserva la cabeza MTP del modelo original.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada explícitamente; el dominio agentic aparece solo como parte del conjunto de calibración de la poda.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Investigación en poda de mezclas de expertos: el checkpoint sirve como referencia reproducible para comparar criterios de selección de expertos (suma de contribución frente a saliencia media frente a aleatorio) sobre un MoE multimodal real de 276 B, usando las métricas de concordancia top-1 y KL publicadas.
- Base para entrenamiento de reparación: al ser un corte en crudo, es el punto de partida natural para un ciclo de fine-tuning o destilación que recupere parte de la calidad perdida, con un coste de cómputo inferior al de entrenar desde el modelo completo de 276 B.
- Evaluación de la sensibilidad al enrutamiento: el autor advierte que el top-k del router original se calcula en bf16 y que ejecutarlo en fp32 cambia la selección de expertos en una fracción medible de tokens; el checkpoint permite estudiar ese efecto en un modelo reducido.
- Despliegue en hardware con menos memoria que el original: con 137 B parámetros en BF16 ocupa aproximadamente 255 GiB, frente a los 375 GiB del corte de 192 expertos y los aproximadamente 552 GB del original de 276 B en BF16, lo que permite cargarlo en nodos de menor capacidad si se acepta la pérdida de calidad.
- Experimentos de inferencia multimodal: conserva las torres de visión y audio, por lo que puede usarse para probar pipelines de entrada mixta texto-imagen-audio en un modelo más ligero que el original.
- Estudio de la arquitectura Inkling: al mantener byte a byte la atención, las convoluciones, los expertos compartidos y la cabeza MTP, permite aislar el efecto del número de expertos enrutados sobre el comportamiento del modelo sin cambiar el resto de la arquitectura.
- Validación de cargas y tooling: sirve para verificar que el código de carga del modelo original funciona con `n_routed_experts` reducido, útil para quienes desarrollan infraestructura de despliegue para la familia Inkling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos publicados son métricas de concordancia con el modelo original sobre un conjunto retenido de 78.000 posiciones en siete dominios:

| Metrica | REAP128 (suma) | REAP192 (suma) | Saliencia media 128 | Aleatorio 128 | Solo recuento 128 |
|---|---|---|---|---|---|
| Concordancia top-1 con el original | 0,733 | 0,815 | 0,585 | 0,543 | 0,717 |
| KL sobre el top-64 del original | 0,87 | 0,45 | 2,02 | 2,74 | 0,96 |

Estas cifras miden acuerdo forzado por el profesor con el original, no puntuaciones de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 255 GiB solo para pesos, más memoria para activaciones y caché KV; el repositorio completo ocupa 274,2 GB.
- No cabe en GPUs de consumo: ni una RTX 4090 (24 GB) ni una RTX 5090 pueden alojar el modelo en BF16. Se requiere un nodo multi-GPU o un sistema con memoria unificada grande.
- El autor realizó la poda en una única NVIDIA DGX Spark GB10 con 128 GB, transmitiendo el modelo capa a capa; ese enfoque de streaming es aplicable también a la inferencia, aunque no se documenta su rendimiento.
- Opciones de despliegue: el autor indica que el checkpoint carga con el mismo código que el modelo original (forward de referencia de transformers), sin especificar soporte en vLLM, llama.cpp, Ollama o TGI. No hay versiones GGUF ni cuantizadas publicadas en el repositorio.
- Latencia y throughput: no disponibles.
- Recomendación operativa del autor: ejecutar el forward de referencia sin padding (batch 1, solo tokens reales), porque el padding por la derecha no es invisible para las posiciones reales en esta arquitectura. Además, el router debe ejecutarse en bf16 para reproducir la selección de expertos del original.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos enrutados por capa | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nbKPS/inkling-reap128-bf16 | 137,09 B | 128 (top-6 + 2 compartidos) | no disponible | other | Hugging Face, BF16 safetensors |
| nbKPS/inkling-reap192-bf16 | no disponible en la información (375 GiB en disco) | 192 (top-6 + 2 compartidos) | no disponible | other | Hugging Face, BF16 safetensors |
| ThinkingMachines/Inkling-Small (original) | 276 B | 256 (top-6 + 2 compartidos) | no disponible | other | Hugging Face, BF16 |

No se dispone de datos de rendimiento de tareas para ninguno de los tres, por lo que la comparación se limita a tamaño, número de expertos, licencia y disponibilidad. La concordancia top-1 con el original es de 0,733 para el corte de 128 y de 0,815 para el de 192, con KL de 0,87 y 0,45 respectivamente.

## Limitaciones y advertencias

- El corte de 128 expertos es un cambio grande en el modelo; el propio autor recomienda tratarlo como base para entrenamiento posterior y no como sustituto directo del original.
- Las métricas publicadas son concordancia forzada por el profesor con el original, no puntuaciones de tarea; no hay evidencia de calidad en benchmarks reales.
- No se ha aplicado ningún entrenamiento de reparación a este checkpoint; las variantes reparadas son una publicación separada.
- El enrutamiento es sensible a la precisión numérica: el top-k del original se calcula en bf16 y ejecutar el router en fp32 altera la selección de expertos en una fracción medible de tokens.
- El forward de referencia debe ejecutarse sin padding (batch 1, tokens reales); el padding por la derecha afecta a las posiciones reales en esta arquitectura.
- Licencia "other" heredada del modelo base: no se detallan en la información disponible las condiciones de uso comercial, por lo que deben consultarse en el repositorio del modelo original ThinkingMachines/Inkling-Small.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no documentada.
- Riesgo de alucinación y sesgos: no cuantificados en la información disponible; al ser un corte sin entrenamiento, cabe esperar un comportamiento degradado respecto al original, pero no se aportan mediciones.
- Solo se distribuyen pesos BF16; no hay GGUF ni cuantizaciones publicadas, lo que limita el despliegue en hardware modesto.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/nbKPS/inkling-reap128-bf16
- Repositorio del corte de 192 expertos: https://huggingface.co/nbKPS/inkling-reap192-bf16
- Modelo base: https://huggingface.co/ThinkingMachines/Inkling-Small
- Listas de expertos conservados: `control_sum128.json` y `control_sum192.json` dentro del repositorio del modelo
- Script de poda: `reap_stream.py` (mencionado en la model card, sin URL en la información disponible)
- Paper, blog o demo: no disponibles en la información proporcionada
