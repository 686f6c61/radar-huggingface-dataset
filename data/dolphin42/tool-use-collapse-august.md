# Dolphin42/tool-use-collapse-august

## Resumen

`Dolphin42/tool-use-collapse-august` es un artefacto de investigación, no un modelo de propósito general. Lo publica el usuario de HuggingFace Dolphin42 y contiene los puntos de control finales de tres ramas («arms») de un experimento de ajuste fino con GRPO sobre `Qwen/Qwen3-VL-8B-Instruct`, cuyo objetivo declarado es estudiar el fenómeno que el autor denomina *tool-use collapse*: la degradación del uso de herramientas durante el entrenamiento con refuerzo. El repositorio tiene 403,5 GB y se creó el 18 de septiembre de 2026.

El experimento compara tres configuraciones: GRPO sin regularización (que colapsó en el paso 100 y se ejecutó hasta el 1450), filtrado de recompensa (la corrección que el autor considera vigente, 650 pasos, sin colapso) y recompensa únicamente por llamada a herramienta (200 pasos). Se guardaron puntos de control cada 50 pasos y se publican los finales de cada rama. Cada carpeta contiene un checkpoint completo solo de pesos en safetensors bf16, junto con tokenizador, procesador, `args.json`, `trainer_state.json` y estado del planificador y del generador de números aleatorios.

Su relevancia es metodológica: documenta un modo de fallo concreto del aprendizaje por refuerzo en entornos agénticos y ofrece material reproducible para estudiar por qué una política que invoca herramientas acaba abandonándolas. No obstante, la propia model card publica la tabla de resultados con las celdas de métricas vacías, por lo que no hay cifras verificables de calidad asociadas a ninguno de los tres checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la ficha; el modelo base declarado es Qwen/Qwen3-VL-8B-Instruct, un transformer multimodal (visión-lenguaje) |
| Parametros totales | 8B nominales, heredados del nombre del modelo base; no confirmado en la ficha |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los checkpoints publicados están únicamente en bf16 safetensors |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), acompañados de tokenizador, procesador, `args.json`, `trainer_state.json`, estado del scheduler y estado del RNG |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Tamaño del repositorio | 403,5 GB |
| Fecha de creación | 2026-09-18 |
| Última actualización | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se describe la arquitectura interna del modelo en la información disponible. Al ser un ajuste fino sobre `Qwen/Qwen3-VL-8B-Instruct`, hereda la arquitectura y el preentrenamiento del modelo base, que es multimodal (visión-lenguaje), pero la ficha no detalla ni la composición del dataset de ajuste ni el número de tokens utilizados.

El método de entrenamiento sí está descrito: se emplea GRPO (Group Relative Policy Optimization) con tres variantes ejecutadas en paralelo durante agosto de 2026. La rama `probe_vanilla` usa GRPO sin regularización y colapsó en el paso 100, aunque el entrenamiento continuó hasta el paso 1450. La rama `probe_filtered_seed42_probe_filtered` aplica filtrado de recompensa, se entrenó 650 pasos y, según el autor, nunca colapsó. La rama `probe_toolonly_seed42_probe_toolonly` usa una recompensa basada únicamente en la llamada a herramienta y se detuvo en el paso 200. El entrenamiento se realizó con el framework ms-swift, y el paquete de reproducción `repro_tool_use_collapse_20260918.zip` contiene las definiciones completas de cada rama (`docs/ARMS.md`) y el método de regularización KL por rama (`docs/BRANCH_KL_METHOD.md`).

La innovación técnica destacable no está en el modelo sino en el experimento: la caracterización empírica del colapso del uso de herramientas bajo GRPO y la comparación de una estrategia de mitigación (filtrado de recompensa) frente a una recompensa sesgada hacia la llamada a herramienta. La ficha menciona que se guardaron checkpoints cada 50 pasos, lo que permite reconstruir la trayectoria temporal del colapso, aunque solo se publican los finales de cada rama.

## Capacidades

- Generación de texto y capacidades multimodales (visión) heredadas del modelo base Qwen3-VL-8B-Instruct: no verificadas ni evaluadas en esta publicación.
- Uso de herramientas (*tool calling*): es el comportamiento bajo estudio, no una capacidad certificada. El objetivo del experimento es precisamente medir su degradación.
- No se documenta soporte de agentes multi-paso, razonamiento encadenado, modo *thinking*, audio u otras capacidades especiales más allá de las heredadas del modelo base.
- Capacidades multilingües: no disponibles.
- La tabla de resultados de la ficha (cuota de uso de herramientas en los pasos 201-250, recompensa en los pasos 201-250 y exactitud en conjuntos reservados A y B) aparece con las celdas vacías, por lo que no hay ninguna capacidad cuantificada para ninguno de los tres checkpoints.

## Casos de uso

- Reproducción de fallos de entrenamiento: cargar los tres checkpoints y reproducir la curva de colapso de `probe_vanilla` frente a `probe_filtered`, usando los estados de entrenamiento incluidos para comparar trayectorias paso a paso.
- Investigación sobre *reward hacking* en entornos agénticos: analizar por qué una recompensa centrada en la llamada a herramienta (`probe_toolonly`) produce dinámicas distintas de una recompensa sin regularización, y qué señales preceden al abandono de la herramienta.
- Desarrollo de métricas de alerta temprana: usar los checkpoints intermedios cada 50 pasos para diseñar detectores que avisen del inicio del colapso antes del paso 100 en futuros entrenamientos con GRPO.
- Comparación de estrategias de *reward shaping*: enfrentar el filtrado de recompensa contra otras alternativas (KL por rama, recorte de recompensa, currículos) sobre la misma línea base y el mismo modelo de partida.
- Docencia y formación en RLHF/RLVR: los checkpoints finales de cada rama sirven como ejemplo tangible de éxito y fracaso de un mismo algoritmo con distintos diseños de recompensa, sin necesidad de ejecutar el entrenamiento completo.
- Auditoría de artefactos de investigación: servir de caso de estudio sobre publicación de checkpoints sin model card completa ni métricas, útil para discutir qué información mínima debería acompañar a un release de pesos.
- Reanudación de entrenamientos: el repositorio incluye `args.json`, `trainer_state.json` y estado del scheduler y del RNG, de modo que se puede continuar el entrenamiento con ms-swift mediante `--resume_from_checkpoint <carpeta> --resume_only_model true --ignore_data_skip true`, o iniciar una ejecución nueva con `--model <carpeta>`.
- Punto de partida para experimentos de alineación: usar `probe_filtered_step650` como inicialización estable, dado que es la única rama que el autor reporta como no colapsada, y medir si el comportamiento se conserva al cambiar de tarea o de conjunto de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tabla de la model card incluye columnas para cuota de uso de herramientas (pasos 201-250), recompensa (pasos 201-250), exactitud en conjuntos reservados A y B, y paso de inicio del colapso, pero todas las celdas están vacías salvo la indicación cualitativa, en el texto, de que la rama sin regularización colapsó en el paso 100. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar.

## Requisitos de hardware

- El repositorio completo ocupa 403,5 GB; para trabajar con una sola rama hay que descargar únicamente su carpeta con `snapshot_download(repo, allow_patterns="<carpeta>/*")`.
- Cada checkpoint de 8B parámetros en bf16 ocupa aproximadamente 16 GB en disco y en memoria, como estimación aritmética basada en el tamaño nominal del modelo base.
- Inferencia en bf16: se estiman en torno a 16-20 GB de VRAM para pesos y caché KV, por lo que cabe en una GPU de consumo con 24 GB (por ejemplo, RTX 4090 o RTX 3090) con contexto moderado.
- Inferencia en precisión reducida: en int8 se estiman unos 8-10 GB y en int4 unos 5-6 GB, pero no se publican pesos cuantizados (ni GGUF, ni AWQ, ni GPTQ), de modo que habría que cuantizar el checkpoint bf16 por cuenta propia.
- GPUs de centro de datos (A100 40/80 GB, H100) no son necesarias para inferencia, pero sí recomendables para reanudar entrenamiento con ms-swift: un ajuste fino completo de 8B con estados del optimizador puede requerir del orden de 80-100 GB de VRAM, repartidos en varias GPU.
- Opciones de despliegue: al ser pesos safetensors compatibles con transformers (`Qwen3VLForConditionalGeneration.from_pretrained`), se puede servir con vLLM o TGI, o convertir a GGUF para llama.cpp y Ollama. La ficha no documenta ninguna de estas rutas ni ofrece cifras de latencia o throughput.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación pertinente no es contra otros modelos, sino entre las tres ramas del propio experimento y su modelo base.

| Modelo / rama | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| probe_vanilla_step1450 | 8B (heredados) | No disponible | Colapsó en el paso 100 según el autor; métricas no publicadas | apache-2.0 | Checkpoint final publicado |
| probe_filtered_seed42_probe_filtered_step650 | 8B (heredados) | No disponible | Sin colapso declarado en 650 pasos; métricas no publicadas | apache-2.0 | Checkpoint final publicado |
| probe_toolonly_seed42_probe_toolonly_step200 | 8B (heredados) | No disponible | 200 pasos; sin métricas publicadas | apache-2.0 | Checkpoint final publicado |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8B | No disponible en esta información | Referencia del ajuste fino; sin datos aquí | No disponible en esta información | Público en HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría (ajustes con GRPO orientados a uso de herramientas) en el material proporcionado.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción. La ficha no declara usos previstos, públicos objetivo ni modos de fallo aceptables.
- Los checkpoints de las ramas afectadas por el colapso pueden exhibir un comportamiento degradado del uso de herramientas, que es precisamente el objeto de estudio; no deben desplegarse como asistentes con llamadas a funciones.
- No se publican métricas de ningún tipo: ni recompensa, ni cuota de herramientas, ni exactitud en conjuntos reservados. Cualquier afirmación sobre su calidad relativa es una inferencia, no un dato.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documenta ningún mecanismo de mitigación ni evaluación específica.
- Sesgos: no documentados en la información disponible. Al heredar el preentrenamiento de Qwen3-VL-8B-Instruct, arrastra los sesgos de ese modelo base, que tampoco se detallan aquí.
- Idiomas y cobertura lingüística: no disponibles.
- Limitaciones de contexto: la longitud de contexto no se especifica; conviene no asumir la del modelo base sin verificarla.
- Licencia apache-2.0: permite uso comercial y modificaciones con atribución, pero el autor no ofrece garantías ni soporte, y el modelo base puede tener condiciones adicionales que conviene revisar antes de cualquier uso comercial.
- El tamaño del repositorio (403,5 GB) puede provocar descargas accidentales muy costosas si no se restringe el patrón de ficheros.
- Coherencia de metadatos: la fecha de creación registrada (18 de septiembre de 2026) y el nombre del repositorio (*august*, agosto) no coinciden con lo que sugiere el contenido, lo que conviene tener en cuenta al citar el artefacto.
- Estado de adopción nulo: cero descargas y cero *likes* en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dolphin42/tool-use-collapse-august
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Framework de entrenamiento ms-swift: no disponible en la información proporcionada (se cita en la model card sin enlace)
- Paquete de reproducción `repro_tool_use_collapse_20260918.zip` (incluye `docs/ARMS.md` y `docs/BRANCH_KL_METHOD.md`): referenciado en la model card, sin URL directa disponible
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos corresponden a páginas corporativas de Microsoft y no guardan relación con este artefacto.
