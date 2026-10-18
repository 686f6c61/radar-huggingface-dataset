# anik-jha/Nemotron-3.5-Bolt-74B-A9B-16GB-GGUF

## Resumen

Nemotron-3.5-Bolt-74B-A9B-16GB-GGUF es una compilación GGUF publicada por el usuario anik-jha que parte del modelo multimodal NVIDIA Nemotron 3.5 Bolt 74B-A9B en su build oficial para 24 GB de VRAM y le poda los expertos enrutados para que quepa completo en una GPU de 16 GB (o de 12 GB en la variante agresiva). No es un reentrenamiento ni una recuantización: se eliminan expertos y se copian byte a byte los tensores que se conservan, incluidos los pesos de 2 bits (IQ2_XXS) que NVIDIA entrenó con conocimiento de cuantización.

El modelo base es un transformer con mezcla de expertos (MoE) cuya nomenclatura indica 74 000 millones de parámetros totales y 9 000 millones activos, enrutando cada token a 9 expertos de entre 240 y 496 por capa. Incorpora un proyector multimodal que lo habilita para imagen-texto y maneja una ventana de contexto de hasta 131 072 tokens (128K).

Su relevancia es práctica: permite ejecutar un MoE de esta familia en tarjetas de consumo, conservando entre el 93 % y el 94 % de la puntuación de código del build oficial de 24 GB y prácticamente intacto el tool calling, con un pico medido de 13,6 GiB en una petición real de 124K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y proyector multimodal para visión (pipeline image-text-to-text) |
| Parametros totales | 74 000 millones según la nomenclatura del autor (74B); el registro de HuggingFace informa 24 392 112 592 parámetros en safetensors |
| Parametros activos | 9 000 millones (A9B); 9 expertos enrutados por token, de 240 a 496 por capa en el modelo base |
| Longitud de contexto | 131 072 tokens (128K) configurados en llama.cpp; probado con una petición real de 124K |
| Tipos de cuantizacion | IQ2_XXS (2 bits, pesos entrenados por NVIDIA con cuantización consciente); los expertos conservados no se recuantizan |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiquetada como "other" en el repo) |
| Formato de pesos | GGUF (llama.cpp); proyector mmproj también en GGUF |
| Variantes incluidas | 16GB-REAP50-IQ2_XXS (12,5 GiB) y 12GB-REAP25-IQ2_XXS (8,4 GiB) |
| Tamano del repo | 24,2 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer disperso con mezcla de expertos: cada token se enruta a 9 expertos por capa, elegidos de un conjunto que varía entre 240 y 496 expertos según la capa. El pipeline declarado es image-text-to-text, con un proyector multimodal separado (`mmproj-...gguf`, fichero original de NVIDIA sin modificar) que añade visión al conjunto. No hay información disponible sobre el número de tokens de preentrenamiento, la composición del dataset original ni las etapas de alineación (RLHF/DPO) del modelo de NVIDIA.

La innovación de esta ficha es la poda de expertos. El autor midió la contribución de cada experto sobre 3,1 millones de tokens de calibración (2 047 conversaciones con código, trayectorias de agente de código, function calling y chat general), puntuó cada experto con REAP (peso del router multiplicado por el tamaño de la salida del experto, promediado sobre los tokens enrutados a él) y conservó el 50 % superior de cada capa en el build de 16 GB y el 25 % superior en el de 12 GB. La fracción se mantiene por capa, de modo que los recuentos de expertos por capa de NVIDIA se escalan, no se aplanan. La poda es una copia de bytes: expertos conservados, filas del router correspondientes y todos los tensores no pertenecientes a expertos son idénticos al fichero de NVIDIA, verificado tensor a tensor. La estabilidad de las puntuaciones se comprobó sobre las dos mitades del conjunto de calibración (correlación mediana de 0,99 entre capas; 0,95 en la capa menos estable). REAP se eligió frente a la masa de enrutamiento (solo peso del router) porque esta última puntuaba peor en ambos builds.

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 128K tokens.
- Generación de código: HumanEval+ 0,835 (pass@1) y MBPP+ 0,688 en el build de 16 GB con decodificación greedy.
- Tool calling / function calling: BFCL v3 simple (99,5 % de llamadas válidas, 90,8 % correctas) y multiple (99,0 % válidas, 93,0 % correctas).
- Razonamiento multi-paso: el modelo soporta modo de razonamiento (`--reasoning`), aunque todas las cifras publicadas se midieron con razonamiento desactivado.
- Visión imagen-texto mediante el proyector mmproj de NVIDIA, con la salvedad de memoria descrita en los requisitos de hardware.
- Contexto largo aplicado a código: el autor reporta una petición real de 124K tokens con un pico de 13,6 GiB en el build de 16 GB.
- Capacidades multilingües: no disponible (no se documenta ninguna evaluación por idioma).

## Casos de uso

- Generación y autocompletado de código en estación de trabajo local: con 12,5 GiB de fichero y 13,5 GiB asignados a 128K de contexto, el build de 16 GB permite un asistente de código íntegramente en GPU sin depender de la nube.
- Agentes de código con tool calling: los resultados de BFCL v3 (más del 90 % de llamadas correctas en simple y multiple) lo hacen utilizable en bucles de agente que invocan funciones del sistema de ficheros, terminal o APIs internas.
- Análisis de repositorios completos: los 128K tokens de contexto permiten cargar varios módulos y su documentación en una sola petición para tareas de revisión, refactorización o explicación de arquitectura.
- Despliegue on-premise en atención al cliente: conversaciones multi-turno con contexto largo y latencia controlada (41,4 tok/s de decodificación en DGX Spark), sin salida de datos a terceros.
- Procesamiento de documentos con imagen: usando el proyector mmproj, capturas de pantalla, diagramas o páginas escaneadas pueden acompañar al prompt; conviene mantener el proyector en CPU (`--no-mmproj-offload`) si se necesita contexto largo en una tarjeta de 16 GB, asumiendo unos 40 s por imagen en la CPU de una DGX Spark.
- Prototipado y validación de despliegues MoE en hardware de consumo: útil para equipos que quieren evaluar el comportamiento de un MoE grande en 16 GB o 12 GB antes de invertir en GPUs de datacenter.
- Investigación reproducible sobre poda de expertos: el repo incluye `selections/*.json` con los expertos conservados por capa y `eval/` con puntuaciones, intervalos de confianza, resultados por problema, salidas de tool calling y procedencia (revisión y hash del origen, commit de llama.cpp, tamaño de calibración y verificación de tensores).

## Benchmarks y rendimiento

Todas las cifras con decodificación greedy y razonamiento desactivado, servidas con llama-server, según la model card del autor.

| Metrica | NVIDIA Bolt 24GB | Este repo 16GB (REAP50) | Este repo 12GB (REAP25) |
|---|---|---|---|
| HumanEval+ (pass@1) | 0,890 | 0,835 | 0,579 |
| MBPP+ (pass@1) | 0,743 | 0,688 | 0,571 |
| BFCL simple (validas / correctas) | 100 % / 94,3 % | 99,5 % / 90,8 % | 99,3 % / 89,0 % |
| BFCL multiple (validas / correctas) | 99,0 % / 92,0 % | 99,0 % / 93,0 % | 97,5 % / 89,0 % |
| Decodificacion (tok/s, DGX Spark) | 40,1 | 41,4 | 42,3 |
| Prefill (tok/s, DGX Spark) | 1 145 | 1 398 | 1 567 |
| Memoria GPU a 32K de contexto | 20,7 GiB | 12,7 GiB | 8,6 GiB |
| Memoria GPU a 128K de contexto | 21,6 GiB | 13,5 GiB | 9,5 GiB |

Detalles de medición: HumanEval+ sobre 164 problemas y MBPP+ sobre 378 (EvalPlus); BFCL v3 sobre 400 y sobre el conjunto multiple. Frente al Bolt de 24 GB, la caída del build de 16 GB es de −5,6 puntos en MBPP+ (IC 95 % de −9,3 a −1,9) y de −5,5 puntos en HumanEval+ (IC 95 % de −11,0 a 0,0, no significativa a p < 0,05). Los intervalos de confianza por bootstrap emparejado y los tests de McNemar están en `eval/summary.json`. No se han publicado resultados de MMLU, GSM8K ni de calidad en contexto largo.

## Requisitos de hardware

- Build de 16 GB: fichero de 12,5 GiB; 12,7 GiB de memoria GPU asignada a 32K de contexto y 13,5 GiB a 128K. Pico medido de 13,6 GiB durante una petición de 124K tokens.
- Build de 12 GB: fichero de 8,4 GiB; 8,6 GiB a 32K, 9,5 GiB a 128K y pico de 9,6 GiB con la misma petición.
- Visión: el proyector añade unos 1,7 GiB. Con el build de 16 GB, el total sube a 14,3 GiB a 32K y 15,2 GiB a 128K, lo que no cabe en una tarjeta de 16 GB; con `--no-mmproj-offload` la GPU se mantiene en 13,6 GiB a costa de unos 40 s por imagen en CPU. El build de 12 GB con proyector asigna 10,3 GiB a 32K y 11,1 GiB a 128K.
- GPU: cualquier tarjeta con al menos 16 GB de memoria para el build de 16 GB (RTX 4080, RTX 4090, RTX 4060 Ti de 16 GB, A4000, A5000, etc.) y de 12 GB para el build de 12 GB. Cabe, por tanto, en GPU de consumo; el autor no documenta pruebas en GPUs de datacenter distintas de la DGX Spark.
- Despliegue: llama.cpp mediante `llama-server`, probado en el commit `547208d` con `-ngl 99 -c 32768 --parallel 1 --jinja --reasoning off --reasoning-format deepseek`. El autor indica un pequeño parche local que devuelve salidas de chat malformadas como texto plano en lugar de error HTTP, aunque no se activó en ninguna ejecución. LM Studio y Ollama no han sido probados. No hay datos de vLLM ni de TGI.
- Rendimiento: 41,4 tok/s de decodificación y 1 398 tok/s de prefill (build de 16 GB) y 42,3 / 1 567 tok/s (build de 12 GB), medidos en una DGX Spark con un solo slot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria GPU (128K) | HumanEval+ | MBPP+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| NVIDIA Nemotron 3.5 Bolt 74B-A9B (build oficial 24GB) | 74B totales / 9B activos | 128K | 21,6 GiB | 0,890 | 0,743 | openmdw-1.1 | GGUF de NVIDIA en HuggingFace |
| Este repo, build 16GB (REAP50) | 74B totales / 9B activos, 50 % de expertos por capa | 128K | 13,5 GiB | 0,835 | 0,688 | openmdw-1.1 | GGUF en este repo |
| Este repo, build 12GB (REAP25) | 74B totales / 9B activos, 25 % de expertos por capa | 128K | 9,5 GiB | 0,579 | 0,571 | openmdw-1.1 | GGUF en este repo |

No se dispone de datos de otros modelos comparables en la información proporcionada, por lo que la comparación se limita a las tres variantes del mismo modelo base.

## Limitaciones y advertencias

- La calidad en contexto largo no se ha evaluado con benchmarks; solo se verificó el consumo de memoria en una petición de 124K tokens.
- El build de 12 GB pierde aproximadamente un tercio de la puntuación de HumanEval+ (0,579 frente a 0,890) y una cuarta parte de MBPP+, aunque mantiene el tool calling por encima del 89 % de llamadas correctas.
- Todas las cifras se midieron con razonamiento desactivado; el modo de razonamiento (`--reasoning`) no está evaluado.
- La poda se calibró con 3,1 millones de tokens de código, trayectorias de agente, function calling y chat general; el comportamiento en dominios no representados (matemáticas avanzadas, idiomas distintos del inglés, texto jurídico o científico) no se ha medido y puede degradarse de forma no uniforme entre capas.
- Idiomas soportados: no disponible. No hay evaluación multilingüe, lo que desaconseja asumir paridad con el modelo de NVIDIA en castellano u otras lenguas.
- Riesgo de alucinación no cuantificado: no hay benchmarks de conocimiento factual ni de calibración en la información disponible.
- Licencia openmdw-1.1 (etiqueta "other" en el repo): al ser un derivado del modelo de NVIDIA, los términos aplicables son los del modelo base; conviene revisar el texto completo antes de un uso comercial.
- Visión con contexto largo en tarjeta de 16 GB: el proyector no cabe en GPU junto con 128K de contexto; mantenerlo en CPU implica unos 40 s de codificación por imagen.
- Validación comunitaria mínima: el repo registra 0 descargas y 1 like en el momento de la consulta, y la evaluación la ha realizado el propio autor, sin replicación independiente.
- El autor no ha probado LM Studio ni Ollama; el despliegue validado es llama.cpp con un commit concreto y un parche local.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anik-jha/Nemotron-3.5-Bolt-74B-A9B-16GB-GGUF
- Modelo base (GGUF de NVIDIA, 24GB): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Paper del método REAP, "Half the Experts, All the Code": https://arxiv.org/abs/2607.16721
- Workshop COLM 2026 on Efficient Reasoning: https://wdlctc.github.io/efficient-reasoning-2026/
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Berkeley Function Calling Leaderboard (BFCL v3): https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard
