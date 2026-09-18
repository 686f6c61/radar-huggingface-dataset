# sandeep123/dapo-qwen3-1.7b-nonthinking-2048-20260918

## Resumen

`sandeep123/dapo-qwen3-1.7b-nonthinking-2048-20260918` es un adaptador LoRA de investigación sobre el modelo base `Qwen/Qwen3-1.7B`, entrenado con aprendizaje por refuerzo mediante una variante controlada del algoritmo DAPO (asymmetric clipping, dynamic sampling y pérdida normalizada por tokens). El autor lo presenta explícitamente como un experimento de comparación controlada, no como una reproducción a escala del artículo original ni como un modelo con mejoras de rendimiento demostradas. El repositorio contiene adaptadores LoRA por cada actualización optimizador, además de estados completos de reanudación (AdamW, RNG y estado del flujo de candidatos).

El entrenamiento se realizó en modo `nonthinking` (`enable_thinking=False`) sobre una partición fija de 2048 preguntas, con 8 respuestas por pregunta, contexto de 8192 tokens, semilla 42 y cuatro GPUs para el aprendiz más cuatro para el muestreador. La configuración de RL usa LoRA de rango 16 con alpha 32 sobre las proyecciones q/k/v/o y gate/up/down, 128 actualizaciones de optimizador (equivalentes a cuatro épocas de grupos aceptados de 2048/64), LR 2e-5 con warmup lineal de 10 pasos y coeficiente KL de 0,01 contra la base congelada, a diferencia del recetario sin KL del artículo original.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible (checkpoints inmutables, manifiestos SHA256, política de retención documentada) para estudiar DAPO y su variante con KL en modelos pequeños, así como para comparar el modo sin razonamiento frente a configuraciones con *thinking* en Qwen3. No se declaran resultados de benchmarks ni afirmaciones de rendimiento, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen3; el adaptador no redeclara la arquitectura del modelo base |
| Parámetros totales | 1,7 B en el modelo base `Qwen/Qwen3-1.7B`; el adaptador LoRA r=16/alpha=32 añade un número de parámetros no especificado en la información disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (declarado en la model card); la longitud de contexto de inferencia depende del modelo base y no se declara en el repositorio del adaptador |
| Tipos de cuantización | No disponible en el repositorio del adaptador (se distribuye en safetensors con precisión de entrenamiento vía PEFT); requeriría fusión y conversión para usarlo en formatos cuantizados |
| Idiomas soportados | No disponibles en el repositorio del adaptador; heredados del modelo base Qwen3, que declara soporte multilingüe |
| Licencia | No disponible (el repositorio del adaptador no declara licencia; el modelo base Qwen3-1.7B se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptadores LoRA PEFT), con tokenizer, metadatos y manifiestos SHA256 |

Datos adicionales del repositorio: identificador `sandeep123/dapo-qwen3-1.7b-nonthinking-2048-20260918`, librería `peft`, pipeline `text-generation`, tamaño de repositorio 5,3 GB, revisión del modelo base `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`, checkpoint seleccionado `checkpoint-000061`, fecha de creación 18/09/2026.

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, no un modelo completo. La model card especifica rango 16, alpha 32, dropout 0 y objetivos en q/k/v/o y gate/up/down, sobre el transformer denso Qwen3-1.7B. La inferencia prevista es cargar la revisión fijada del modelo base con PEFT, aplicar el checkpoint elegido y renderizar el tokenizer con `enable_thinking=False`. El repositorio conserva adaptadores por cada actualización del optimizador en rutas inmutables `checkpoint-NNNNNN/`, además de estados completos de reanudación en `latest-resume/` y archivos de reanudación (`RESUME.md`, `verify_resume.py`).

El algoritmo es una variante controlada de DAPO implementada sobre `volcengine/verl` (commit `ed498f9fa5c726a6fb46b19bc59c5c33970053c7`), con los siguientes hiperparámetros documentados: `clip_low` 0,2, `clip_high` 0,28, límites de ratio [0,8; 1,28], `dual_clip` 10,0, recompensa de corrección `2 * raw_answer_correct - 1`, filtrado dinámico de grupos con corrección mixta (`0 < sum(raw_answer_correct) < group_size`) y recarga de candidatos, pérdida normalizada globalmente por tokens reales de respuesta, ventaja normalizada por grupo `(reward - group_mean) / (sample_std + 1e-6)` y una penalización de longitud suave con `soft_cache_fraction` 0,2. Se aplica KL fijo contra la base congelada con coeficiente 0,01 (el artículo usa 0,0) y una única actualización de optimizador por recolección, lo que el propio autor señala como limitante para que el `clip-higher` marque diferencias frente al recetario multi-minibatch original. Por cada actualización se retienen 64 grupos de preguntas × 8 respuestas (512), con muestreo dinámico que genera candidatos adicionales registrados y archivados, de modo que el cómputo y la exposición a datos crudos superan a las líneas base de presupuesto fijo. El autor declara explícitamente que no es una reproducción exacta del artículo y que no formula ninguna afirmación de rendimiento.

## Capacidades

- Generación de texto en modo sin razonamiento explícito (`enable_thinking=False`), que es la configuración con la que fue entrenado el adaptador.
- Resolución de problemas matemáticos de formato corto: la recompensa de entrenamiento se basa en la corrección de la respuesta final verificada con un oráculo compartido (`verify_relaxed_answer`, con `finish_reason=stop`).
- Producción de respuestas directas sin cadena de pensamiento visible, adecuada para escenarios donde la latencia y el número de tokens importan.
- Capacidades multilingües y de generación general heredadas del modelo base Qwen3-1.7B (no verificadas ni ajustadas en este adaptador).
- Soporte de tool calling / function calling: no disponible en la información proporcionada; no se documenta entrenamiento ni evaluación en este eje.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modo `nonthinking` y el ajuste sobre respuestas cortas no están orientados a este uso.
- Capacidades especiales: no se declaran modos de visión, audio ni decodificación especulativa. La innovación técnica documentada es el procedimiento de RL (DAPO con clip asimétrico, filtrado dinámico y KL controlado), no una capacidad funcional nueva del modelo.

## Casos de uso

- Referencia reproducible para investigación en RL: el repositorio publica adaptadores por actualización, estados de reanudación completos y manifiestos SHA256, lo que permite reproducir o auditar cada paso del entrenamiento DAPO con KL a pequeña escala.
- Estudio de ablaciones `thinking` frente a `nonthinking`: al estar entrenado explícitamente con `enable_thinking=False` y sobre la misma partición de 2048 preguntas usada en comparaciones previas del autor (STRIDE), sirve como base para medir el efecto del modo de razonamiento en Qwen3-1.7B.
- Respuestas matemáticas de latencia baja en el borde: con 1,7 B de parámetros y respuestas cortas, puede desplegarse en GPUs de gama media o en memoria unificada de equipos Apple para tareas de cálculo y comprobación rápida sin cadena de pensamiento.
- Generación de pares pregunta-respuesta matemáticos para destilación o evaluación: el pipeline de verificación con recompensa binaria y el archivo de rollouts (`training-archives/`) documentan cómo se producen y puntúan las respuestas, lo que facilita reutilizar el flujo para construir datasets etiquetados.
- Docencia y asistencia educativa de alcance limitado: puede resolver ejercicios de respuesta cerrada y explicar pasos de forma breve, siempre con verificación humana, dado el tamaño del modelo y el riesgo de error aritmético.
- Base para comparativas de recetas de RL (GRPO, DAPO sin KL, DAPO con KL): la configuración concreta publicada (clip 0,2/0,28, dual_clip 10,0, KL 0,01, 128 actualizaciones) permite montar líneas base controladas en un único nodo de 8 GPUs.
- Pruebas de infraestructura de entrenamiento y publicación: el repositorio implementa verificación en un commit inmutable antes de borrar copias locales y una política de retención explícita (`retention_policy.json`), útil como plantilla para pipelines que exigen trazabilidad de artefactos.
- Experimentos académicos de bajo coste: 1,7 B de parámetros y LoRA r=16 permiten iterar sobre recetas de refuerzo con presupuesto de GPU modesto, aunque el coste real de cómputo y de datos supere al de líneas base de presupuesto fijo por el muestreo dinámico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que el trabajo "no formula ninguna afirmación de rendimiento" y recuerda que una ejecución planificada no equivale a un resultado completado; el repositorio registra 0 descargas y 0 likes.

## Requisitos de hardware

- VRAM para inferencia (estimación a partir de los 1,7 B de parámetros del modelo base más el adaptador, que es despreciable en memoria): aproximadamente 3,4 GB en FP16/BF16, ~1,8 GB en int8 y ~1,1 GB en cuantización de 4 bits.
- Caché KV estimada para la arquitectura del modelo base (28 capas, 8 cabezas KV, dimensión de cabeza 128): ~0,11 MiB por token, es decir unos 0,9 GiB con 8192 tokens de contexto y unos 3,5 GiB con 32 768 tokens, en FP16.
- GPU recomendadas: cualquier GPU con 8 GB o más para FP16 con contexto moderado (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, L4, A10G). Para lotes grandes o contextos largos, A100/H100 no son necesarias por tamaño de modelo, pero sí útiles por throughput agregado.
- Cabe en GPU de consumo: sí, en configuraciones de 8-12 GB en FP16 con contexto de hasta ~8K, y en GPUs de 6-8 GB si se cuantiza. También es viable en memoria unificada de Apple Silicon.
- Opciones de despliegue: transformers + PEFT (ruta documentada por el autor: base fijada con `enable_thinking=False` y checkpoint elegido), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama solo tras fusionar el adaptador con la base y convertir a GGUF, ya que el repositorio publica únicamente safetensors PEFT.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados de sus fichas públicas; no han sido verificados en esta ficha.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dapo-qwen3-1.7b-nonthinking-2048 (este) | 1,7 B + LoRA r16 | 8192 en entrenamiento | Adaptador LoRA de RL (DAPO con KL 0,01), modo nonthinking | No disponible en el repositorio | Repositorio público en HuggingFace, 0 descargas |
| Qwen/Qwen3-1.7B (base) | 1,7 B | 32 768, ampliable con YaRN | Transformer denso con modo thinking y nonthinking | Apache 2.0 | Modelo base oficial |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32 768 heredado de Qwen2.5 | Destilación de razonamiento | MIT | Ampliamente desplegado |
| Llama-3.2-1B-Instruct | 1,24 B | 128 000 | Instrucción general | Llama 3.2 Community License | Modelo oficial |
| SmolLM2-1.7B-Instruct | 1,7 B | 8192 | Instrucción general | Apache 2.0 | Modelo oficial |

Comparativa en rendimiento: no disponible, ya que este adaptador no publica resultados de benchmarks que permitan situarlo frente a las alternativas.

## Limitaciones y advertencias

- El autor declara explícitamente que no es una reproducción exacta del artículo de DAPO y que no realiza ninguna afirmación de rendimiento; no debe presentarse como una mejora demostrada sobre el modelo base.
- No se publican benchmarks ni métricas de evaluación. El checkpoint seleccionado (`checkpoint-000061`) no va acompañado de un criterio de selección cuantificado.
- Entrenamiento en modo `nonthinking` exclusivamente: el modelo no ha sido ajustado para cadenas de razonamiento largas, lo que puede degradar el desempeño en tareas que se benefician de cómputo de razonamiento extendido.
- El ajuste se realizó sobre una partición fija de 2048 preguntas de matemáticas con 8 respuestas por pregunta y 128 actualizaciones de optimizador; la distribución es estrecha y el riesgo de sobreajuste a ese conjunto de problemas es alto.
- Riesgo de alucinación y de errores aritméticos propio de un modelo de 1,7 B: cualquier uso en producción requiere verificación de las respuestas, especialmente en matemáticas.
- Licencia del adaptador no declarada. Aunque el modelo base Qwen3-1.7B es Apache 2.0, la ausencia de licencia explícita en el repositorio introduce incertidumbre para uso comercial; conviene consultar al autor antes de explotarlo.
- Idiomas soportados no declarados en el repositorio del adaptador; el ajuste con recompensa de corrección matemática probablemente esté dominado por el inglés, sin datos que lo confirmen.
- El muestreo dinámico con recarga de candidatos implica un consumo de cómputo y una exposición a datos crudos superiores a los de las líneas base de presupuesto fijo, lo que dificulta comparaciones de eficiencia directas.
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgo, toxicidad o seguridad.
- Los estados de reanudación son sensibles a versiones: para continuar el entrenamiento hay que mantener la fuente científica, el hash del dataset y las versiones de runtime coincidentes, según indica la propia model card.
- Trazabilidad parcial: la política de retención advierte de que no se afirma que todos los estados intermedios del optimizador hayan sido subidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/dapo-qwen3-1.7b-nonthinking-2048-20260918
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de entrenamiento citado (verl, volcengine), commit `ed498f9fa5c726a6fb46b19bc59c5c33970053c7`: https://github.com/volcengine/verl
- Artículo de DAPO (referencia metodológica del algoritmo; no enlazado en la model card): https://arxiv.org/abs/2503.14476
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo, su autor o su receta de entrenamiento.
