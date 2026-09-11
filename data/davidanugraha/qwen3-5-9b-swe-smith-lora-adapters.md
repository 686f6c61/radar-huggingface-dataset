# davidanugraha/Qwen3.5-9B-SWE-Smith-LoRA-Adapters

## Resumen

Este repositorio no contiene un modelo completo, sino un conjunto de adaptadores LoRA entrenados sobre `Qwen/Qwen3.5-9B` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) para resolución automática de tareas de ingeniería de software. Lo publica el usuario `davidanugraha` bajo licencia Apache 2.0 y con la librería PEFT. El objetivo es especializar un modelo base de ~9.000 millones de parámetros en la edición de código dentro de repositorios reales, usando el agente Mini-SWE-Agent como entorno de ejecución y el algoritmo RLOO (REINFORCE Leave-One-Out) como método de optimización por refuerzo.

La relevancia práctica del repositorio es doble. Por un lado, incluye doce adaptadores intermedios (`step-10` a `step-120`) más un checkpoint completo de veRL/FSDP que permite reanudar el entrenamiento, no solo servir el modelo. Por otro, publica los registros de evaluación sobre SWE-Bench Verified junto con la procedencia completa (identidades de ejecución, configuración Hydra, exportaciones de W&B y la imagen de entrenamiento fijada por digest), lo que lo convierte en un artefacto de reproducibilidad más que en un modelo listo para producción.

El contexto de entrenamiento es de 65.536 tokens con hasta 57.344 tokens de respuesta generada, lo que sitúa estos adaptadores en el segmento de agentes de código de contexto largo. El repositorio ocupa 3,5 GB y no incluye los pesos del modelo base, que deben descargarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la informacion proporcionada; se hereda de `Qwen/Qwen3.5-9B`) |
| Parametros totales | no disponible para los adaptadores; el modelo base es de ~9B segun su nombre |
| Parametros activos | no aplica (no hay indicios de que el base sea MoE) |
| Longitud de contexto | 65.536 tokens (contrato de entrenamiento); respuesta maxima generada 57.344 tokens |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en safetensors y se aplican sobre el base en la precision con la que se cargue) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json` + `export_provenance.json`); el checkpoint de continuacion usa shards veRL/FSDP (8 shards de modelo, 8 de optimizador, 8 de estado extra/RNG, `data.pt`) |
| Libreria | peft |
| Modelo base | `Qwen/Qwen3.5-9B` en revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |
| Tamano del repositorio | 3,5 GB |
| Payload de continuacion | 1.258.355.426 bytes en 32 ficheros listados en el manifiesto (global_step_120) |
| Configuracion LoRA | rango 32, alpha 64 |
| Algoritmo de entrenamiento | RLOO |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

Los adaptadores se entrenan mediante PEFT/LoRA de rango 32 y alpha 64 sobre `Qwen/Qwen3.5-9B`, con veRL como framework de RL y FSDP para el reparto de shards. La configuración de entrenamiento documentada es: batch de 32 prompts por 8 rollouts, contexto de 65.536 tokens, respuesta máxima de 57.344 tokens, muestreo con temperatura 1.0, top-p 1.0 y top-k desactivado (-1), y paralelismo de secuencia 8. El algoritmo es RLOO, una variante de REINFORCE con estimador leave-one-out que reduce la varianza del baseline sin necesidad de un crítico separado. El agente empleado durante el entrenamiento es Mini-SWE-Agent, lo que define el formato de interacción (ejecución de comandos y edición de ficheros en un entorno de repositorio).

El linaje consta de dos ejecuciones: `verl-qwen35-9b-65k-mini-swe-rloo-20260830-r15` y su continuación `...-20260831-r16`. El plan de entrenamiento apuntaba a 143 pasos de optimizador, pero el último checkpoint persistido es el paso 120: no existen los pasos 130, 140 ni 143 en el almacén. El paso 10 pertenece a r15 y los pasos 20 a 120 a r16. La carpeta `continuation/global_step_120/` no es un adaptador de servicio, sino un checkpoint completo de veRL/FSDP que incluye estados del optimizador y del RNG, además de metadatos de FSDP/LoRA y del tokenizador, lo que permite reanudar el entrenamiento restaurando exactamente la revisión del base, el commit de veRL y la imagen de entrenamiento registrada. Como innovación destacable, el repositorio incorpora auditoría de procedencia (digest inmutable de la imagen de entrenamiento, exportaciones de W&B y manifiestos con checksums), algo poco habitual en adaptadores publicados en HuggingFace.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a tareas de ingeniería de software.
- Edición de código en repositorios reales mediante el agente Mini-SWE-Agent (lectura de ficheros, aplicación de parches, ejecución de comandos).
- Resolución de incidencias tipo SWE-Bench Verified, con hasta 57.344 tokens de respuesta generada por episodio.
- Manejo de contexto largo: ventana de 65.536 tokens, adecuada para recorrer árboles de repositorio y trazas de ejecución extensas.
- Política entrenada con RLOO sobre 8 rollouts por prompt, lo que favorece comportamientos de exploración seguidos de selección.
- Continuación del entrenamiento: el checkpoint `global_step_120` permite reanudar con veRL/FSDP.
- Servicio multi-adaptador: el ejemplo del autor usa `--enable-lora --max-lora-rank 64`, lo que permite cargar varios adaptadores en un mismo servidor vLLM.
- Soporte de `tool calling` / function calling: no disponible como capacidad declarada explícitamente; el uso de herramientas se articula a través del agente Mini-SWE-Agent, no mediante un esquema de tools documentado.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: no disponibles (el campo de idiomas del repositorio está vacío).

## Casos de uso

- Reparación automática de issues en repositorios Python: el adaptador se conecta a Mini-SWE-Agent y recorre el repositorio con una ventana de 65.536 tokens, aplicando parches y verificando con la suite de tests; es el escenario para el que fue entrenado explícitamente.
- Agente de mantenimiento dentro de CI/CD: integrado en GitHub Actions o GitLab CI, el modelo recibe un fallo de test y propone un parche en una rama, con revisión humana antes del merge.
- Reanudación de experimentos de RL: a partir de `continuation/global_step_120/` se puede continuar el entrenamiento hasta los 143 pasos planificados, con estados de optimizador y RNG preservados, evitando repetir el coste de las primeras 120 iteraciones.
- Barrido comparativo de checkpoints: los doce adaptadores publicados permiten estudiar cómo evoluciona la política paso a paso (10, 20, ..., 120) bajo un protocolo de evaluación fijo, útil para investigación sobre dinámica de RL.
- Servicio multi-tenant con adaptadores conmutables: un único servidor vLLM con `--enable-lora --max-lora-rank 64` puede atender distintos adaptadores (por ejemplo, distintos pasos o distintas ramas de entrenamiento) reutilizando una sola copia del modelo base en memoria.
- Auditoría y reproducibilidad de pipelines de RL: los directorios `training/` y `provenance/` permiten reconstruir la ejecución (configuración Hydra, evidencia de preflight, manifiestos de checkpoints, exportaciones de W&B) para verificar resultados publicados.
- Estudio de sensibilidad al muestreo: los registros de evaluación incluyen brazos con temperatura 0.6 y 1.0 y con o sin reintento por timeout de agente, lo que sirve para analizar cuánto del rendimiento depende del presupuesto de reintentos.
- Punto de partida para fine-tuning en otros dominios de código (por ejemplo, lenguajes distintos de Python o bases de código propietarias): el adaptador es un inicializador de bajo coste que se puede continuar sin tocar los pesos del base.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden a SWE-Bench Verified (500 instancias). El propio autor advierte que los protocolos difieren entre filas (muestreo, política de reintentos), por lo que no deben compararse como un barrido limpio de checkpoints.

| Brazo | Protocolo | Resueltas | Puntuacion | Timeouts de agente |
|---|---|---:|---:|---:|
| `base-temp0.6` | temperatura 0.6; con reintentos | 235/500 | 47,0% | 37 |
| `base-temp1.0` | temperatura 1.0; con reintentos | 260/500 | 52,0% | 225 |
| `step20-temp0.6` | temperatura 0.6; con reintentos | 237/500 | 47,4% | 49 |
| `step20-temp1.0` | sampler de entrenamiento; temperatura 1.0; con reintentos | 254/500 | 50,8% | 191 |
| `step40-temp1.0` | sampler de entrenamiento; temperatura 1.0; con reintentos | 249/500 | 49,8% | 193 |
| `step60-temp1.0-no-agent-timeout-retry` | sampler de entrenamiento; temperatura 1.0; sin reintento por timeout | 199/500 | 39,8% | 160 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras suites en la información disponible. Los artefactos completos con checksums están en `evaluation/artifacts/`.

## Requisitos de hardware

- VRAM para los adaptadores: despreciable; los LoRA de rango 32 sobre un modelo de 9B ocupan del orden de cientos de megabytes. La VRAM real la determina el modelo base.
- VRAM estimada para el base (cálculo a partir del recuento de parámetros, no confirmado por el autor): ~18 GB en FP16/BF16 solo para pesos; ~9-10 GB en cuantización de 8 bits; ~5-6 GB en 4 bits.
- Caché KV a 65.536 tokens: no disponible, ya que no se publican el número de capas, cabezas ni la configuración de atención del base. En la práctica es el factor dominante y suele exigir GPUs de 80 GB para ventanas completas.
- GPU recomendadas: A100 80 GB o H100 80 GB para servicio con contexto completo en BF16; L40S 48 GB o A6000 48 GB como mínimo razonable; RTX 4090 24 GB solo con cuantización agresiva y contextos muy reducidos.
- Cabe en GPU de consumo: probablemente solo en cuantización de 4 bits y con contexto recortado muy por debajo de 65.536 tokens; no hay validación publicada.
- Despliegue recomendado: vLLM con `--enable-lora --max-lora-rank 64` (comando documentado por el autor, incluyendo `--max-model-len 65536` y `--enable-prefix-caching`). Alternativas como TGI, llama.cpp u Ollama requerirían convertir los adaptadores a GGUF y no están documentadas por el autor.
- Reanudación de entrenamiento: veRL con FSDP, restaurando la revisión exacta del base, el commit de veRL y la imagen de entrenamiento fijada por digest.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información disponible solo permite comparar los adaptadores con su propio modelo base dentro de la misma evaluación. No hay datos publicados de otros adaptadores o modelos comparables.

| Modelo | Parametros | Contexto | SWE-Bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Qwen3.5-9B` (base, temp 0.6) | ~9B | 65.536 en este pipeline | 47,0% (235/500) | no disponible en esta ficha | pesos completos de Qwen |
| `Qwen3.5-9B` (base, temp 1.0) | ~9B | 65.536 en este pipeline | 52,0% (260/500) | no disponible en esta ficha | pesos completos de Qwen |
| Adaptador `step20` (temp 1.0) | ~9B + LoRA r32 | 65.536 | 50,8% (254/500) | apache-2.0 | solo adaptador (3,5 GB) |
| Adaptador `step40` (temp 1.0) | ~9B + LoRA r32 | 65.536 | 49,8% (249/500) | apache-2.0 | solo adaptador (3,5 GB) |
| Otros adaptadores de agentes SWE | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los adaptadores no superan al modelo base en SWE-Bench Verified con los datos publicados: el base a temperatura 1.0 obtiene 52,0% frente al 50,8% del mejor checkpoint (`step20`). El entrenamiento RLOO registrado no aporta una mejora medible en esta métrica.
- El resultado del brazo `step60` cae al 39,8% cuando se elimina el reintento por timeout de agente, frente al 49,8% del `step40` con reintentos. La puntuación depende fuertemente de la política de reintentos y del presupuesto de tiempo, no solo de la calidad del modelo.
- El repositorio contiene únicamente adaptadores: es obligatorio descargar `Qwen/Qwen3.5-9B` en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. Cargar los adaptadores sobre otra revisión puede producir degradación silenciosa.
- El linaje está incompleto: el plan era de 143 pasos de optimizador y el último checkpoint persistido es el 120. No existen los pasos 130, 140 ni 143, por lo que no se puede evaluar el resultado del entrenamiento completado.
- El paso 10 pertenece a la ejecución r15 y los pasos 20 a 120 a la continuación r16; mezclar checkpoints de ambas ejecuciones sin registrar el origen complica la trazabilidad.
- Las filas de la tabla de benchmarks usan protocolos distintos (muestreo y reintentos), tal como advierte el propio autor; no deben interpretarse como una comparación controlada.
- Riesgo de alucinación: no evaluado en la información disponible. En tareas de edición de código, un parche plausible pero incorrecto es el modo de fallo típico de este tipo de agentes.
- Sesgos: no disponibles; no se publica ninguna evaluación de sesgo, toxicidad ni comportamiento en dominios sensibles.
- Idiomas: no disponibles. No hay evidencia de que el ajuste preserve el multilingüismo del base, ya que el entrenamiento se centra en tareas de código.
- Licencia: los adaptadores son Apache 2.0, pero la licencia del modelo base `Qwen/Qwen3.5-9B` no se detalla en la información proporcionada y debe verificarse antes de un uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- Fechas de creación y actualización (2026-09-11) con apenas 26 segundos de diferencia entre ambas, lo que sugiere una única carga sin revisiones posteriores.
- Uso en producción: no hay datos de latencia, throughput, coste por tarea ni tasa de éxito en repositorios privados; se recomienda evaluación propia antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/davidanugraha/Qwen3.5-9B-SWE-Smith-LoRA-Adapters
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`)
- Paper, blog o repositorio del autor: no disponible
- Demo: no disponible
- Resultados de la búsqueda web: las consultas realizadas devolvieron únicamente páginas de ayuda de YouTube sin relación con el modelo, por lo que no se han encontrado enlaces adicionales relevantes (papers, blogs, repos o demos).
