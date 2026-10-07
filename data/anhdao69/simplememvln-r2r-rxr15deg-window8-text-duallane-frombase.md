# anhdao69/SimpleMemVLN-R2R-RxR15deg-Window8-Text-DualLane-FromBase

## Resumen

SimpleMemVLN-R2R-RxR15deg-Window8-Text-DualLane-FromBase es un checkpoint de investigación para navegación guiada por lenguaje (Vision-Language Navigation, VLN) publicado por el usuario anhdao69. Se construye sobre el modelo base Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y añade un wrapper propio denominado SimpleMemVLN, con atención nativa de ventana ("Window8"), estado recurrente persistente y cuatro "step lanes" auxiliares. El modelo resuelve el problema de traducir instrucciones en lenguaje natural más observaciones visuales en secuencias de acciones de navegación, entrenado conjuntamente sobre los datasets R2R y RxR (guía en inglés, incremento angular de 15 grados).

El checkpoint corresponde a la época 1 (actualización 3.852 de 7.704) de un entrenamiento conjunto de dos épocas. Es, por tanto, un punto intermedio de la planificación de entrenamiento y no un modelo final; la propia model card declara explícitamente que no se reclama ningún resultado de evaluación de navegación para estos pesos. El repositorio ocupa 10,4 GB e incluye el diccionario de estado del wrapper, el contrato de modelo/serializador/memoria (`navigation.json`) y sumas de verificación (`SHA256SUMS.json`).

La relevancia actual es fundamentalmente metodológica: documenta una receta reproducible de entrenamiento VLN de episodio completo (BPTT) sobre cuatro H100 con ZeRO-2, y publica un mecanismo de memoria dual-lane que añade 21.054.000 parámetros sobre el backbone. No es un artefacto listo para producción ni un checkpoint intercambiable con Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language con wrapper SimpleMemVLN: atención nativa de ventana Window8, estado recurrente persistente y cuatro step lanes en las capas 16/20/24/28 |
| Parametros totales | No disponible con exactitud; modelo base Qwen3.5-4B (denominación de ~4.000 M) más 21.054.000 parámetros añadidos por los cuatro step lanes |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; la atención Window8 retiene el prefijo de instrucción más ocho grupos de observación/acción |
| Tipos de cuantizacion | No disponible (entrenamiento en BF16; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible oficialmente; el entrenamiento usa R2R y guías en inglés de RxR |
| Licencia | No disponible |
| Formato de pesos | Diccionario de estado personalizado del wrapper SimpleMemVLN (no es un checkpoint AutoModel de Transformers directamente intercambiable) |

Otros datos del repositorio: 10,4 GB de tamaño, 0 descargas, 0 likes, creado el 2026-10-07, etiquetas `vision-language-navigation`, `simplememvln`, `dual-lane`, `r2r`, `rxr`.

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y sustituye la interfaz de inferencia habitual por el runtime SimpleMemVLN. La atención es de ventana nativa ("Window8"): conserva el prefijo de instrucción más ocho grupos de observación/acción, con un tamaño de batching de atención de 16. Además del estado recurrente nativo persistente, se insertan cuatro step lanes en las capas 16, 20, 24 y 28 que suman 21.054.000 parámetros, escriben únicamente en el separador final de cada grupo completado y leen a tasa de token. La salida de texto emplea un historial canónico de acciones en formato texto con EOS de asistente supervisado. La torre de visión y el módulo merger permanecen congelados; solo se entrenan el backbone de texto y la cabeza de salida.

La receta de entrenamiento indicada es: 30.815 episodios y 3.128.624 pasos de acción por pasada completa del dataset antes del padding de cola distribuido, con R2R y RxR (guía en inglés) a 15 grados de incremento angular. La época 1 equivale a la actualización 3.852 de 7.704, con 232 actualizaciones de warmup y semilla 429. Se usaron cuatro GPU H100, un episodio completo por rank y microstep, acumulación de gradiente 2 y batch global efectivo de 8. Precisión BF16, ZeRO-2, LR nativo 5e-6 y LR de lane 1e-4. El entrenamiento usa BPTT de episodio completo con activation checkpointing y offload de activaciones a CPU para episodios largos. No se documenta en la información disponible ninguna fase de RLHF, DPO o ajuste por preferencias.

## Capacidades

- Navegación guiada por lenguaje: genera secuencias de acciones a partir de instrucciones textuales y observaciones visuales en entornos de interiores tipo Matterport3D (R2R y RxR).
- Representación de memoria de trayectoria: los step lanes mantienen información de estado por grupo de observación/acción, con escritura en el separador final de cada grupo.
- Salida en formato de texto canónico de acciones con EOS supervisado, lo que permite serializar y deserializar trayectorias mediante el serializer incluido en el contrato `navigation.json`.
- Procesamiento conjunto visión-lenguaje con torre de visión congelada procedente del base Qwen3.5-4B.
- No hay evidencia publicada de soporte de tool calling, function calling ni de agentes multi-paso genéricos fuera del bucle de navegación.
- Capacidades multilingües: no disponibles; el entrenamiento documentado usa instrucciones en inglés.
- Capacidades especiales: modo "thinking" no documentado; no se declaran capacidades de audio.

## Casos de uso

- Investigación en VLN-CE: servir como punto de partida reproducible para estudiar el efecto de la ventana Window8 y del estado recurrente persistente sobre la tasa de éxito en R2R y RxR, siempre partiendo de que no hay evaluación publicada para estos pesos.
- Ablación del mecanismo dual-lane: los cuatro lanes en las capas 16/20/24/28 y sus 21.054.000 parámetros permiten medir de forma aislada la contribución de la memoria de estado frente al backbone congelado de visión.
- Reproducción de la receta de entrenamiento: el repositorio documenta batch efectivo 8, ZeRO-2, BPTT de episodio completo con activation checkpointing y offload a CPU, lo que facilita replicar el pipeline en clústeres de cuatro H100.
- Punto de reanudación intermedio: al ser la actualización 3.852 de 7.704, es útil para analizar la dinámica de convergencia entre la época 1 y la época 2 del mismo run.
- Estudio de serialización de trayectorias: el contrato de serializador permite investigar formatos de historial de acciones textual y su impacto en la estabilidad del entrenamiento.
- Base para destilación o fine-tuning posterior: un investigador puede continuar el entrenamiento o adaptarlo a nuevos edificios o dominios, asumiendo el coste de un checkpoint de 10,4 GB y de un runtime no estándar.
- Evaluación comparativa de agentes encarnados en simuladores (Habitat, Matterport3D), usándolo como baseline intermedio frente a checkpoints finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explícita que no se reclama ningún resultado de evaluación de navegación para estos pesos (SPL, SR u otras métricas de R2R/RxR no se reportan). Tampoco se ofrecen cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: orientativamente 12-16 GB en BF16 para el conjunto backbone de ~4.000 M de parámetros más torre de visión y estado recurrente, sin contar el coste de mantener episodios completos de observaciones. Cifra no confirmada por el autor.
- GPU de entrenamiento documentadas: cuatro NVIDIA H100, una por rank, con batch efectivo global 8.
- GPU recomendadas para inferencia: H100 o A100 40/80 GB para reproducir el régimen de entrenamiento; en consumer, una RTX 4090 de 24 GB es la candidata más razonable por capacidad de VRAM, aunque no hay validación publicada.
- Compatibilidad con GPU de consumo: plausible en tarjetas de 24 GB (RTX 4090, RTX 3090) en BF16, pero no verificada; no se publican cuantizaciones que reduzcan el requisito.
- Opciones de despliegue: no se soporta vLLM, TGI, llama.cpp u Ollama de forma directa, ya que el checkpoint es un diccionario de estado del wrapper SimpleMemVLN. La carga se realiza con `qwen_vl.train.vln_runtime.load_checkpoint` desde el repositorio https://github.com/anhdao69/SimpleMemVLN (rama `streaming_text_dual`, commit de entrenamiento `a7e442cbd3c43cf3ec238eaa527e9c67f5ce2408`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos numéricos de benchmarks para este modelo ni para alternativas de la misma categoría en la información proporcionada, por lo que la comparación cuantitativa no es posible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleMemVLN-R2R-RxR15deg-Window8-Text-DualLane-FromBase | ~4.000 M + 21.054.000 (lanes) | no disponible | sin evaluación publicada | no disponible | HuggingFace, pesos en formato wrapper propio |
| Alternativas VLN sobre backbones VLM (familia NaVid/NaVILA y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen/Qwen3.5-4B (modelo base) | ~4.000 M | no disponible | no disponible | no disponible | HuggingFace |

No se ha identificado en la información proporcionada ningún modelo comparable con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la actualización 3.852 de 7.704 de la época 1; el autor indica que el entrenamiento continuó hacia la época 2 durante la publicación.
- Sin resultados de evaluación: no se reclama ni se aporta ninguna métrica de navegación (SR, SPL, NE) para estos pesos.
- Carga no estándar: no es un checkpoint AutoModel de Transformers; requiere el runtime SimpleMemVLN y el snapshot exacto del base Qwen3.5-4B. Un `from_pretrained` convencional no funcionará.
- Licencia no disponible: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Se debe consultar al autor antes de cualquier uso productivo.
- Idiomas: el entrenamiento documentado usa instrucciones en inglés (R2R y guías en inglés de RxR); el comportamiento en castellano u otros idiomas no está documentado.
- Sesgos conocidos: no disponibles en la información proporcionada. Los datasets R2R y RxR proceden de entornos Matterport3D con sesgos de distribución geográfica y de tipo de edificio.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo generativo de acciones en formato textual, puede producir secuencias de acción sintácticamente válidas pero no ejecutables en el entorno.
- Contenido excluido del repositorio: estados del optimizador, ficheros de recuperación de RNG, imágenes de entrenamiento y credenciales no se publican; el checkpoint completo de recuperación permanece en el servidor de entrenamiento.
- No apto para producción: sin evaluación, sin licencia definida y con un runtime de investigación, su uso en sistemas reales de navegación autónoma no está justificado con la información disponible.
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; únicamente aparecieron páginas sin relación con el tema, por lo que no se ha podido contrastar información externa.

## Enlaces

- HuggingFace: https://huggingface.co/anhdao69/SimpleMemVLN-R2R-RxR15deg-Window8-Text-DualLane-FromBase
- Repositorio de código de entrenamiento: https://github.com/anhdao69/SimpleMemVLN/tree/streaming_text_dual (commit `a7e442cbd3c43cf3ec238eaa527e9c67f5ce2408`)
- Modelo base: Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- Paper, blog o demo: no disponible
- Resultados de búsqueda web relevantes: no disponible
