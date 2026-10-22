# JesseLiu/agentorch-sft-27b-80k-3ep

## Resumen

`agentorch-sft-27b-80k-3ep` es un checkpoint de ajuste supervisado (SFT) publicado por el usuario JesseLiu dentro del proyecto AgentOrch, orientado a la orquestación de flujos de trabajo con agentes. Se construye sobre el modelo base `Qwen/Qwen3.8-27B` y se distribuye con los pesos ya fusionados (la LoRA del entrenamiento está integrada en el modelo base), por lo que se carga como un checkpoint convencional con `transformers` o `vLLM`.

El modelo resuelve una tarea concreta: dado un enunciado de orquestación, producir la secuencia de acciones o la estructura de workflow esperada. El autor lo evalúa con el harness congelado del benchmark AgentOrch (vista global, 3.220 variantes), donde obtiene una precisión de orquestación de 0,4196 y una precisión final de 0,1848, con una tasa de error de 0,1708.

Su relevancia es acotada: es un artefacto de investigación con 0 descargas y 0 «likes» en el momento de la consulta, sin model card extendida ni datos de contexto, idiomas o cuantizaciones publicados. Resulta útil como referencia reproducible de una receta SFT concreta (LoRA r16/a32, 3 épocas, presupuesto de 81.920 tokens), no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de `Qwen/Qwen3.8-27B` (etiqueta de repositorio `qwen3_5`); el autor no detalla la arquitectura en la model card |
| Parámetros totales | 27.781.427.952 (~27,8 B), dato real de los safetensors |
| Parámetros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo contiene safetensors; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA fusionada en el modelo base) |
| Modelo base | `Qwen/Qwen3.8-27B`, revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |
| Tamaño del repositorio | 55,6 GB |
| Checkpoint | `step-474` (equivalente a 3 épocas) de un schedule coseno de 5 épocas |
| Modo de razonamiento | `enable_thinking=False` en la plantilla de chat, tal como en entrenamiento y evaluación |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de identificar el modelo base (`Qwen/Qwen3.8-27B`) y la etiqueta `qwen3_5` del repositorio, de modo que las características de atención, tokenizador y ventana de contexto no están documentadas en la información disponible. Los pesos publicados son el resultado de fusionar la LoRA del entrenamiento en el checkpoint base, lo que produce un modelo denso de 27,8 mil millones de parámetros y 55,6 GB en precisión de 16 bits.

La receta de entrenamiento, extraída de `training/results/training.csv` (fila `sft-27b-80k-3ep`), es la siguiente: SFT sobre los datos «v1», 3 épocas, presupuesto de 81.920 tokens por muestra, LoRA con r=16 y alpha=32, tasa de aprendizaje 1e-4, schedule coseno planificado a 5 épocas y evaluación del checkpoint en el paso 474. No se especifica el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO. La evaluación se realizó con `enable_thinking=False`, lo que indica que el modelo base dispone de un modo de razonamiento que el autor desactiva explícitamente para esta tarea.

## Capacidades

- Generación de texto y de secuencias de acciones orientadas a la orquestación de workflows, que es la tarea objetivo del ajuste.
- Orquestación de agentes y razonamiento multi-paso en el marco del benchmark AgentOrch (3.220 variantes evaluadas).
- Soporte de tool calling / function calling: no confirmado explícitamente en la model card.
- Capacidades multilingües: no declaradas; se desconocen los idiomas cubiertos por el ajuste.
- Modo «thinking» del modelo base disponible pero desaconsejado por el autor para replicar las condiciones de entrenamiento y evaluación.
- Fusión de LoRA ya aplicada: no requiere `peft` para su carga, solo `transformers` o `vLLM`.

## Casos de uso

- Enrutado de tareas en sistemas multiagente: el modelo puede recibir una petición y decidir qué subagente o herramienta debe atenderla, aprovechando que el SFT se ha realizado específicamente sobre datos de orquestación.
- Generación de grafos de workflow (DAG) a partir de una descripción en lenguaje natural, para su posterior validación y ejecución por un motor de orquestación tipo Airflow o Temporal.
- Automatización de operaciones internas: descomposición de una incidencia en pasos ejecutables y asignación de cada paso a un script o API concreta.
- Evaluación comparativa de recetas SFT: sirve como referencia reproducible (mismos datos, mismas épocas, mismo checkpoint) para medir el efecto de cambios en el dataset o en los hiperparámetros.
- Investigación sobre orquestación de agentes: base para experimentos de *prompting*, *decoding* o *fine-tuning* adicional sobre el benchmark AgentOrch.
- Prototipado de asistentes de pipeline CI/CD que traduzcan una instrucción en una secuencia de tareas de build, test y despliegue, siempre con validación humana previa.
- Generación de datos sintéticos de orquestación: el modelo puede producir trazas candidatas que después se filtran y se corrigen manualmente.

En todos los casos conviene tener en cuenta que la precisión final reportada es del 18,48 %, por lo que estos usos deben plantearse como prototipo o con verificación posterior, no como automatización sin supervisión.

## Benchmarks y rendimiento

El autor solo publica resultados del benchmark AgentOrch (vista global, 3.220 variantes, harness congelado, ejecución `sft-27b-80k-3ep-global`):

| Métrica | Valor |
|---|---:|
| Precisión de orquestación (*orchestration accuracy*) | 0,4196 |
| Precisión final (*final accuracy*) | 0,1848 |
| Tasa de error (*error rate*) | 0,1708 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible, ni se ofrece comparación con otros modelos en la model card.

## Requisitos de hardware

Estimaciones derivadas del número de parámetros (27,8 B) y del tamaño del repositorio (55,6 GB); el autor no publica mediciones de latencia ni de throughput.

- VRAM para inferencia en BF16/FP16: aproximadamente 56 GB solo para pesos, más caché KV; en la práctica requiere 64-80 GB.
- VRAM en INT8: unos 28-30 GB de pesos.
- VRAM en INT4: unos 14-16 GB de pesos, más caché KV (dependiente de una longitud de contexto que no se ha publicado).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 en una sola tarjeta; A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB para INT8.
- GPU de consumo: sí cabe en una RTX 4090 o RTX 3090 de 24 GB, pero solo con cuantización de 4 bits y conversión previa, ya que no hay GGUF oficial publicado.
- Despliegue: `transformers` y `vLLM` están soportados explícitamente según la model card. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, tarea no documentada por el autor. TGI no se menciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| `JesseLiu/agentorch-sft-27b-80k-3ep` | 27,8 B | No disponible | Apache 2.0 | Pesos safetensors fusionados, 0 descargas | AgentOrch: 0,4196 de orquestación / 0,1848 final |
| `Qwen/Qwen3.8-27B` (modelo base) | ~27 B (según nomenclatura del autor) | No disponible | No indicada en la información disponible | Modelo público de referencia | No comparado en el benchmark AgentOrch |
| Otros SFT de orquestación de agentes | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información disponible | No disponible |

La comparación directa con el modelo base es la más informativa, pero el autor no publica la puntuación del base en AgentOrch, por lo que no es posible cuantificar la ganancia atribuible al SFT con los datos disponibles.

## Limitaciones y advertencias

- Precisión final baja (0,1848) en el propio benchmark del autor: no es un modelo fiable para orquestación autónoma sin verificación.
- La evaluación se limita a un único benchmark (AgentOrch, 3.220 variantes) con un harness congelado; no hay validación externa ni en tareas generales.
- Contexto máximo, idiomas y tokenizador no documentados: no se puede planificar una integración en producción sin caracterizar previamente estos extremos.
- El autor exige `enable_thinking=False` para replicar las condiciones de entrenamiento; activar el modo de razonamiento puede degradar el comportamiento de forma no medida.
- Riesgo de alucinación inherente al modelo base, agravado en tareas de planificación donde una acción inventada puede ejecutarse en un sistema real.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o seguridad; el ajuste no incluye etapas de alineación posteriores al SFT declaradas.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el usuario debe verificar las obligaciones de atribución y las condiciones del modelo base.
- Estado del repositorio: 0 descargas y 0 «likes», sin Issues ni discusiones públicas; no hay validación por parte de la comunidad.
- El repositorio ocupa 55,6 GB, lo que condiciona el almacenamiento y el ancho de banda en despliegues con múltiples réplicas.
- No se publican pesos cuantizados oficiales; cualquier despliegue en GPU de consumo requiere una conversión propia cuya pérdida de calidad no está medida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JesseLiu/agentorch-sft-27b-80k-3ep
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Revisión del modelo base usada en el entrenamiento: `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` (consultable en el repositorio del modelo base)
- Repositorio AgentOrch (harness, datos de entrenamiento y registro completo de experimentos): referenciado en la model card, URL no disponible en la información proporcionada
- Ejecución de evaluación: `sft-27b-80k-3ep-global` (sin URL pública disponible)
- No se han encontrado en la búsqueda web enlaces adicionales relevantes para este modelo.
