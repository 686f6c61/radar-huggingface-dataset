# arianaazarbal/ct-inkling-oai-rw-mid-g1-b2

## Resumen

`ct-inkling-oai-rw-mid-g1-b2` es un adaptador LoRA (PEFT) de rango 64 y `target_modules=all-linear` entrenado sobre el modelo base `thinkingmachines/Inkling-Small`. Lo publica el usuario `arianaazarbal` como parte de un programa de entrenamiento por constitución iterada y autoescrita (proyecto welfare-in-ai-rnd / constitutional_training). No es un modelo completo: es un adaptador que debe cargarse sobre el base para poder generar texto.

El punto de interés del artefacto es metodológico. Cada generación se entrena desde cero sobre el base, no sobre los pesos de la generación anterior: la deriva entre generaciones se acumula únicamente a través de los documentos sintéticos que instancian una constitución. La generación 0 se sembró con el Model Spec de OpenAI (resumen de 5k), y la generación 1 (esta) se sembró con una constitución escrita por el propio modelo de la generación anterior de la misma rama, seleccionada como medoide de embedding sobre un pool de 40 cadenas autogeneradas. Esta ficha corresponde a la generación `g1`, rama `b2`, con régimen de entrenamiento "midtrain only" (SFT LoRA de etapa 1).

Se trata por tanto de un artefacto de investigación en alineación, no de un modelo orientado a producto: no declara licencia, no publica idiomas soportados y no presenta resultados de benchmarks. Su valor está en la reproducibilidad del pipeline de constitución iterada y en el estudio de la deriva de valores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `thinkingmachines/Inkling-Small`; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | No disponible. El adaptador emplea rango 64 con `target_modules=all-linear`; el recuento exacto de parámetros no se publica |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | 8192 tokens durante el entrenamiento del adaptador; la ventana nativa del modelo base no se especifica |
| Tipos de cuantización | No disponible (solo se publican pesos en safetensors, sin cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) más `tinker_meta.json` con el registro de exportación |
| Modelo base | `thinkingmachines/Inkling-Small` |
| Tarea declarada | text-generation (`pipeline_tag`) |
| Biblioteca | peft |
| Tamaño del repositorio | 16,9 GB |
| Fecha de entrenamiento | 2026-09-17 (exportado el 2026-09-18) |

## Arquitectura y entrenamiento

El adaptador sigue una receta declarada como "bloqueada": LoRA con rango 64, `target_modules=all-linear`, learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 época, batch size 128, longitud máxima 8192 y semilla de entrenamiento 42. El régimen se etiqueta como `mid` ("midtrain only"), es decir, SFT LoRA de etapa 1 sobre un corpus sintético de documentos que instancian una constitución. No se menciona RLHF, DPO ni ninguna fase de preferencias humanas.

La innovación del programa está en el bucle de constitución iterada. La generación 0 se sembró con el Model Spec de OpenAI (resumen de 5k) y la generación 1 con una constitución escrita por el modelo de la generación 0 de la misma rama, obtenida como medoide de embedding con filtrado sobre un pool de 40 cadenas autoescritas y elicitada mediante el método `rw` ("reflect on the gen-0 seed, then rewrite"). Como cada generación se reentrena desde el base, la transmisión de valores ocurre solo vía documentos. El documento constitucional de esta generación se incluye en el repositorio como `training_seed_constitution.md`. La evaluación prevista usa el renderer `tml_v0` con razonamiento desactivado y esfuerzo 0.0.

## Capacidades

- Generación de texto autorregresiva condicionada por el modelo base `thinkingmachines/Inkling-Small`.
- Instanciación de una constitución concreta (la incluida en `training_seed_constitution.md`), objetivo explícito del entrenamiento.
- Modo de razonamiento desactivado en la configuración de servicio prevista: `renderer=tml_v0`, `reasoning OFF`, `effort 0.0`.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el razonamiento se desactiva por diseño en la configuración indicada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible, salvo el modo de razonamiento desactivable ya citado.

## Casos de uso

- Investigación en constitutional AI: reproducir la cadena `inkling-oai-rw-mid` y analizar cómo la constitución evoluciona entre generaciones comparando los documentos semilla con las respuestas del adaptador servido con `tml_v0` y razonamiento desactivado.
- Estudio de deriva de valores: medir la divergencia semántica entre la constitución de la generación 0 (Model Spec de OpenAI resumido) y la de la generación 1 escrita por el propio modelo, usando el pool de 40 cadenas como base comparativa.
- Red-teaming y evaluación de seguridad: someter al adaptador a prompts adversarios para comprobar si el comportamiento constitucional se mantiene fuera de la distribución del corpus sintético de entrenamiento.
- Generación de datos sintéticos: emplear el adaptador como generador de documentos que instancien la constitución, alimentando así la siguiente generación del bucle o corpus de SFT para otros modelos.
- Auditoría de sesgos y valores: revisar sistemáticamente las respuestas en temas sensibles (política, seguridad, contenido dañino) para documentar qué normas del Model Spec se han heredado, matizado o perdido tras la reescritura.
- Reproducción de pipelines de alineación: servir el adaptador con PEFT y `transformers` bajo la configuración fija declarada para obtener comparaciones controladas entre ramas (`b1`, `b2`, ...) y generaciones.
- Base para experimentos de fusión o fine-tuning posterior: al ser un adaptador LoRA de rango 64, puede fusionarse con el base o combinarse con otros adaptadores para estudiar interacciones entre constituciones.
- Docencia y divulgación técnica: ilustrar de forma tangible cómo se entrena un modelo "constitucional" sin RLHF, con una receta de coste moderado (una época, 8192 tokens de longitud máxima).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de alineación o seguridad, ni comparaciones numéricas con otros adaptadores de la misma familia.

## Requisitos de hardware

- La VRAM necesaria depende del modelo base `thinkingmachines/Inkling-Small`, cuyas especificaciones no están disponibles en la información proporcionada; no es posible estimarla con rigor.
- El repositorio ocupa 16,9 GB, un tamaño inusualmente alto para un adaptador LoRA de rango 64; conviene verificar si el export de Tinker incluye pesos adicionales, estados de optimizador o el checkpoint completo antes de planificar el despliegue.
- El adaptador se carga en `bfloat16` junto al base, por lo que el pico de memoria es el del base más el del adaptador; para bases de decenas de miles de millones de parámetros son razonables GPU tipo A100 40/80 GB o H100.
- Encaje en GPU de consumo: no disponible, condicionado al tamaño y a la cuantización del modelo base (no se publican pesos GGUF ni cuantizaciones).
- Opciones de despliegue: `transformers` + `peft` (ruta documentada oficialmente), y Tinker como plataforma de entrenamiento y origen del export. Compatibilidad con vLLM (soporte LoRA), llama.cpp, Ollama o TGI: no disponible, no se documenta ni se publican conversiones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye especificaciones ni métricas de modelos comparables, y los resultados de búsqueda web no aportaron referencias técnicas utilizables. Como referencia interna, las etiquetas del repositorio sugieren la existencia de otros artefactos de la misma familia (`family:inkling_small`), misma generación (`gen:1`) y otras ramas independientes (`branch:b2`), pero no se dispone de sus identificadores ni de sus resultados.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-inkling-oai-rw-mid-g1-b2 | No disponible | 8192 en entrenamiento | Sin benchmarks publicados | No disponible | HuggingFace (0 descargas, 0 likes) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia de licencia declarada: no hay autorización explícita de uso comercial, lo que impide su explotación en producción sin aclaración previa del autor.
- Ausencia total de benchmarks: no existen métricas publicadas de calidad, seguridad ni alineación; cualquier afirmación de rendimiento sería especulativa.
- Riesgo de alucinación elevado: el entrenamiento es un SFT LoRA de una sola época, sin RLHF ni DPO, y sin datos de preferencias humanas.
- Es un adaptador, no un modelo autónomo: requiere descargar y cargar `thinkingmachines/Inkling-Small`, cuyas condiciones de uso y licencia también deben verificarse por separado.
- Idiomas soportados no declarados: se desconoce si el adaptador mantiene o degrada el comportamiento multilingüe del base.
- Deriva constitucional por diseño: la constitución de esta generación procede de una reescritura automática, no de revisión humana, por lo que puede contener normas ambiguas, contradictorias o degradadas respecto al Model Spec original.
- Sesgos no evaluados: no se documenta ninguna auditoría de sesgo, toxicidad o seguridad, y el corpus sintético de entrenamiento no está descrito en composición ni tamaño.
- Configuración de inferencia restringida: la evaluación prevista usa el renderer `tml_v0` con razonamiento desactivado y esfuerzo 0.0; usarlo con otras plantillas o con razonamiento activado invalida las comparaciones y puede degradar el comportamiento.
- Anomalía de tamaño del repositorio (16,9 GB para un LoRA de rango 64): conviene inspeccionar el contenido antes de asumir que son solo pesos del adaptador.
- Señales de adopción nulas (0 descargas, 0 likes en el momento de la consulta): no hay validación comunitaria ni informes independientes de funcionamiento.
- Fechas de entrenamiento y exportación (2026-09-17 y 2026-09-18) posteriores al momento habitual de publicación de modelos de referencia; verificar la vigencia de los artefactos enlazados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-oai-rw-mid-g1-b2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Ruta original en Tinker (registro de entrenamiento): `tinker://1df6554a-a8f7-5fbd-abd2-6e7f94df4d9a:train:0/sampler_weights/inkoairwg1_inkoairw_g1_b2_s1_final`
- Documento constitucional de la generación: `training_seed_constitution.md` (incluido en el repositorio)
- Registro de exportación: `tinker_meta.json` (incluido en el repositorio)
- Resultados de la búsqueda web: no se encontraron enlaces técnicos relevantes (los resultados devueltos correspondían a páginas genéricas de Facebook, sin relación con el modelo)
