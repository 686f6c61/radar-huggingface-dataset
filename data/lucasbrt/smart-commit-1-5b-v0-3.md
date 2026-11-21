# LucasBRT/smart-commit-1.5b-v0.3

## Resumen

pionus-1.5b-v0.3 es un modelo de generacion de texto afinado para una tarea muy concreta: escribir mensajes de commit de git siguiendo el estilo del repositorio, incluido el formato Conventional Commits cuando este se usa. Lo desarrolla LucasBRT como componente local del CLI pionus, una herramienta que genera mensajes de commit con un modelo pequeno ejecutado en la propia maquina del usuario. El modelo parte de Qwen/Qwen2.5-Coder-1.5B-Instruct y se distribuye bajo licencia Apache 2.0.

La version 0.3 anade sobre la 0.1 un paso de DPO (Direct Preference Optimization) entrenado con muestras del propio modelo, filtradas por un conjunto de comprobaciones automaticas (copiar un asunto reciente, citar detalles ausentes del diff, respuestas vacias, scopes inexistentes o tipos incorrectos). El resultado principal es una reduccion drastica de respuestas no fundamentadas y de fallbacks, con una mejora no significativa en la precision del tipo de commit.

El modelo tiene 1.543.714.304 parametros en formato safetensors bf16 y se ofrece tambien en GGUF Q4_K_M de 986 MB para llama.cpp. Esta etiquetado como experimental y solo en ingles; su valor esta en el ajuste fino especifico a la tarea, no en capacidades generales de razonamiento o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivado de Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (safetensors) y Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, heredado de Qwen2.5-Coder-1.5B-Instruct. El entrenamiento se realizo en dos fases: primero un ajuste SFT sobre el adaptador de pionus-1.5b-v0.1 y despues un paso de DPO sobre muestras generadas por el propio modelo. Los adaptadores LoRA de ambas fases y el log de la ejecucion DPO estan incluidos en el directorio `training/` del repositorio.

Los datos proceden de CommitChronicle (revision `5fd076e`), en concreto 5.500 commits del split de train que no se usaron en v0.1 ni pertenecen a los repositorios de evaluacion: 4.500 de 680 repositorios que siguen Conventional Commits (maximo 8 por repositorio) y 1.000 de repositorios jóvenes. Para cada commit se generaron seis muestras de v0.1 con temperatura 0.7 y semillas fijas; ademas se anadieron commits de estilo libre minados en una ejecucion anterior, cuatro muestras cada uno, hasta un total de 3.091 pares de entrenamiento (y 500 de validacion segun el texto truncado de la model card). El prompt usado es exactamente el de pionus con `--rules full`, byte a byte.

La innovacion principal no esta en la arquitectura sino en el pipeline de preferencias: un conjunto de checks automaticos puntua las seis respuestas por commit y el DPO entrena al modelo para preferir la que los supera todos. Segun el autor, las respuestas que fallan los checks casi desaparecen, mientras que la precision del tipo de commit no mejora de forma significativa.

## Capacidades

- Generacion de mensajes de commit de git en formato Conventional Commits y en estilo libre, adaptandose al estilo observado en el historial del repositorio.
- Uso de reglas explicitas en el prompt (`--rules full`) para restringir tipo, scope y contenido del mensaje.
- Generacion condicionada al diff, a la lista de ficheros y al historial de asuntos recientes.
- Reduccion de contenido no fundamentado: 0,130 de las palabras de sus respuestas Conventional en eval-v1 no aparecen ni en el historial, ni en las rutas, ni en el diff (frente a 0,145 en v0.1 y 0,327 en los commits reales).
- Capacidad multilingue limitada: declarado solo para ingles.
- No se documentan tool calling, function calling, modo thinking, vision ni audio.
- No se documentan capacidades de agente o razonamiento multi-paso mas alla del bucle de reintentos y fallback implementado por el CLI.

## Casos de uso

- Generacion local de mensajes de commit: el CLI pionus carga el GGUF Q4_K_M (986 MB) y produce el mensaje a partir del diff, las rutas y el historial, sin enviar codigo a servicios externos.
- Estandarizacion de Conventional Commits en equipos: con `--rules full` y el contexto del repositorio, el modelo alcanza un `type_match` de 0,696 y un `scope_known` de 0,868 sobre 250 commits Conventional de eval-v1 con la lista de ficheros anotada.
- Integracion en hooks de pre-commit o scripts de CI: el modelo cabe en CPU y en GPUs Vulkan, de modo que puede invocarse en un hook local sin infraestructura adicional.
- Repositorios con historial corto: en eval-short (197 commits de repositorios con 1 a 5 asuntos previos), el modelo logra `type_match` de 0,702 y reduce el fallback a 0,021 con la lista anotada, lo que lo hace util en proyectos recien creados.
- Redaccion de mensajes en repositorios de estilo libre: con la lista de ficheros anotada obtiene `first_try (free)` de 0,996 y `word_f1 (free)` de 0,266, por lo que sirve tambien donde no se sigue Conventional Commits.
- Filtrado de mensajes poco informativos: la tasa de `ungrounded` baja a 0,020 (frente a 0,144 del modelo base re-cuantizado y 0,076 de v0.1), util para evitar mensajes que inventan detalles no presentes en el diff.
- Base para ajuste fino adicional: al incluir los adaptadores LoRA SFT y DPO y el log de entrenamiento, sirve como punto de partida reproducible para experimentos de DPO sobre tareas de generacion de texto corto y condicionado.

## Benchmarks y rendimiento

Evaluacion eval-v1: 500 commits del split de test de CommitChronicle (250 Conventional y 250 de estilo libre) de repositorios nunca vistos en entrenamiento. eval-short: 197 commits de repositorios jóvenes. Decodificacion greedy, Vulkan, pionus 0.9.0 mas commits de `main` hasta `236d51f`, mismo binario y ajustes para los tres modelos. Las columnas sin "(free)" o "(young)" corresponden a los 250 commits Conventional de eval-v1.

Con la lista de ficheros por defecto de pionus (anotada):

| Modelo | type_match | type_macro_f1 | scope_known | first_try | fallback | ungrounded | word_f1 | first_try (free) | word_f1 (free) | type_match (young) | fallback (young) | fallback (young, free) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct re-cuantizado (control) | 0,436 | 0,190 | 0,604 | 0,844 | 0,056 | 0,144 | 0,249 | 0,848 | 0,141 | 0,149 | 0,043 | 0,060 |
| pionus-1.5b-v0.1 | 0,676 | 0,581 | 0,852 | 0,928 | 0,028 | 0,076 | 0,362 | 0,888 | 0,256 | 0,681 | 0,085 | 0,047 |
| pionus-1.5b-v0.3 | 0,696 | 0,604 | 0,868 | 0,996 | 0,004 | 0,020 | 0,366 | 0,996 | 0,266 | 0,702 | 0,021 | 0,000 |

Con la lista de ficheros simple (la usada en entrenamiento):

| Modelo | type_match | type_macro_f1 | scope_known | first_try | fallback | ungrounded | word_f1 | first_try (free) | word_f1 (free) | type_match (young) | fallback (young) | fallback (young, free) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct re-cuantizado (control) | 0,428 | 0,184 | 0,576 | 0,836 | 0,060 | 0,160 | 0,238 | 0,868 | 0,138 | 0,170 | 0,064 | 0,053 |
| pionus-1.5b-v0.1 | 0,660 | 0,568 | 0,848 | 0,924 | 0,024 | 0,068 | 0,360 | 0,896 | 0,255 | 0,723 | 0,064 | 0,040 |
| pionus-1.5b-v0.3 | 0,692 | 0,589 | 0,864 | 0,996 | 0,004 | 0,020 | 0,366 | 0,996 | 0,265 | 0,681 | 0,021 | 0,000 |

Comparacion pareada frente a v0.1 sobre los 250 commits Conventional de eval-v1 con lista anotada: `ungrounded` +0/−14 (p = 0,0), `first_copied` +0/−17 (p = 0,0), `first_try` +17/−0 (p = 0,0), `fallback` +0/−6 (p = 0,031); `type_match` +9/−4 (p = 0,267) y `scope_known` +6/−2 (p = 0,289), ambas no significativas.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB en bf16 para los pesos (1,54 mil millones de parametros) mas overhead de contexto; el GGUF Q4_K_M ocupa 986 MB en disco y puede ejecutarse en CPU.
- GPU recomendadas: no se especifican modelos concretos. El autor indica ejecucion en dispositivos llama.cpp de pionus, tanto CPU como GPUs Vulkan.
- Cabe en GPU consumer: si, al ser un modelo de 1,5 mil millones de parametros en Q4_K_M; se ejecuta incluso sin GPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (CPU y Vulkan) mediante el CLI pionus; safetensors bf16 para otros runners compatibles con Qwen2. La exportacion OpenVINO no esta validada para este modelo.
- Latencia y throughput: no disponibles. La evaluacion se realizo con decodificacion greedy sobre Vulkan, pero no se publican tiempos por token ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pionus-1.5b-v0.3 | 1,54 B | No disponible | type_match 0,696; first_try 0,996; ungrounded 0,020 (eval-v1 anotada) | Apache 2.0 | safetensors bf16 y GGUF Q4_K_M |
| pionus-1.5b-v0.1 | 1,54 B | No disponible | type_match 0,676; first_try 0,928; ungrounded 0,076 | Apache 2.0 | safetensors y GGUF |
| Qwen2.5-Coder-1.5B-Instruct (control re-cuantizado) | 1,54 B | No disponible | type_match 0,436; first_try 0,844; ungrounded 0,144 | Apache 2.0 | safetensors y GGUF |

No se dispone de datos de otros modelos especializados en generacion de mensajes de commit en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal mientras cambia la receta de entrenamiento; no debe tratarse como estable en produccion.
- Solo ingles: el campo `language` declara unicamente `en`; no hay evidencia de calidad en castellano u otros idiomas.
- Precision del tipo de commit limitada: la mejora de `type_match` frente a v0.1 (+9/−4, p = 0,267) no es estadisticamente significativa, por lo que la eleccion del tipo Conventional puede fallar en una proporcion relevante de casos.
- Sesgo hacia lo literal: el modelo tiende a describir lo que dice el diff mas que lo que significa el cambio; su proporcion de palabras no fundamentadas (0,130) es menor que la de los commits reales (0,327), lo que puede producir mensajes menos expresivos que los humanos.
- Riesgo de alucinacion acotado pero no nulo: la tasa `ungrounded` es 0,020 en eval-v1, no cero.
- Dependencia del prompt: entrenado byte a byte con el prompt de pionus y `--rules full`; fuera de ese formato o sin las reglas, el rendimiento puede degradarse.
- Contexto maximo no documentado: no se publica la longitud de contexto efectiva, lo que limita la planificacion para diffs o historiales muy largos.
- Exportacion OpenVINO no validada; el soporte se limita a llama.cpp (CPU y Vulkan) y a runners compatibles con safetensors bf16.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen2.5-Coder-1.5B-Instruct conviene revisar las condiciones de la licencia del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LucasBRT/smart-commit-1.5b-v0.3
- Version anterior v0.1: https://huggingface.co/LucasBRT/pionus-1.5b-v0.1
- Repositorio del CLI pionus: https://github.com/Lucas-BRT/pionus
- Documentacion de evaluacion de pionus: https://github.com/Lucas-BRT/pionus/blob/main/training/README.md
- Dataset CommitChronicle: https://huggingface.co/datasets/JetBrains-Research/commit-chronicle
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
