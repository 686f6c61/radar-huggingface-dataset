# kusuriya-labs/Hy4-flash-EXL3-INT8-4bpw

## Resumen

Hy4-flash EXL3-INT8-4bpw es una cuantización derivada del modelo Tencent Hy4-flash, publicada por kusuriya-labs. El trabajo no entrena un modelo nuevo: convierte el decodificador de texto del modelo base a un formato EXL3-INT8 con medias de 4 bits por peso (4,0207 bpw almacenados en las lineales cuantizadas) y transforma los cuatro embeddings Engram a FP8 E4M3 con escalas BF16. El objetivo es reducir el peso en disco y en memoria de un modelo de gran tamaño para hacer viable su despliegue en hardware más modesto, manteniendo router, normas y otras capas sensibles en su precisión original.

El paquete ocupa 69,0 GB en el repositorio y los tensores safetensors suman 143.688.903.720 bytes (aproximadamente 133,82 GiB), una cifra que incluye el decodificador cuantizado, la cabeza `lm_head` a 6 bits y los embeddings Engram en FP8. La cuantización se calibró con 128 filas de 1024 tokens procedentes del corpus mixto estándar de EXL3 (c4, código, multilingüe, técnico, wiki y tokens aleatorios), procesado con el tokenizer de Hy4.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización de bajo bit para un modelo grande; por otro, advierte de una dependencia crítica de infraestructura. El autor indica explícitamente que la inferencia requiere un fork de shelf con soporte para Hy4-flash, todavía no fusionado y en preparación de PR, y que Transformers por sí solo no puede cargar el modelo. Sin ese fork, el artefacto no es utilizable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Tencent Hy4-flash (arquitectura del modelo base; no se detalla en la información disponible) |
| Parametros totales | No disponible (el modelo base no reporta cifra en la información proporcionada) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3-INT8 mul24, decodificador a ~4 bpw (4,0207 bpw almacenados; 4,0228 bpw incluyendo lineales sin cuantizar), `lm_head` a 6 bits, embeddings Engram en FP8 E4M3 con escalas BF16 |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License 1.0 (`license: other`, `license_name: tencent-hy-license`) |
| Formato de pesos | safetensors (EXL3) |
| Tamano del repositorio | 69,0 GB |
| Tamano de tensores | 143.688.903.720 bytes (~133,82 GiB) |
| Revision del modelo base | `d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959` |
| Calibracion | 128 filas x 1024 tokens; SHA-256 `c939c8be8c405580208b9ba6178a31a6fda4030691d31ec25da93d34df7a6f24` |
| Componentes excluidos | Vision y DFly (drafter separado) |

## Arquitectura y entrenamiento

Esta publicación no entrena el modelo: es una conversión de pesos del modelo base Tencent Hy4-flash. El decodificador de texto se cuantiza con EXL3-INT8 en modalidad mul24, con un promedio de 4 bits por peso en las lineales cuantizadas y una media real de 4,0207 bpw almacenados (4,0228 bpw si se incluyen las lineales no cuantizadas). La cabeza de salida `lm_head` se mantiene a 6 bits y los cuatro embeddings Engram se convierten a FP8 E4M3 en bloques con escalas BF16. Router, normas y demás componentes sensibles a la precisión quedan en su formato original.

El proceso de calibración utilizó 128 filas de 1024 tokens extraídas del corpus mixto estándar que acompaña a EXL3 (c4, código, multilingüe, técnico, wiki y tokens aleatorios), tokenizado con el tokenizer de Hy4 y ejecutado con la herramienta `tools/hy4_flash` del proyecto `rocm_exl3_forme`. La información disponible no detalla la arquitectura interna del modelo base (número de capas, dimensiones, mecanismo de atención ni si emplea mezcla de expertos), ni el volumen o composición de sus datos de entrenamiento, ni si hubo RLHF o DPO.

La innovación técnica relevante aquí es la receta de cuantización: EXL3 con calibración mixta y preservación selectiva de capas en alta precisión, más la conversión de embeddings a FP8. El autor reporta que, con el fork de shelf y EP=3 (R9700 + V620 x 2), se obtienen 676,6 tok/s de prefill con 2048 tokens fijos en inglés y temperatura 0, y 50,65 tok/s de decode usando el drafter DFly2. La divergencia de logits finales medida en CPU es de L2 relativo 0,133 (frente a 0,139 del control de orden de suma en CPU), con coincidencia greedy en 256 tokens.

## Capacidades

- Generación de texto y decodificación autoregresiva, heredadas del modelo base Hy4-flash.
- Razonamiento y chat: el autor reporta pruebas de velocidad en BetterBench code y chat (14,22 y 12,31 tok/s respectivamente), lo que confirma uso conversacional y de código.
- Decodificación especulativa mediante el drafter DFly2, con tasas de aceptación medias de 1,98 (code) y 1,78 (chat).
- Capacidades multilingües: el corpus de calibración incluye texto multilingüe, pero no se especifica la lista de idiomas soportados.
- Visión: excluida de este paquete; el autor remite al drafter separado y no incluye el módulo de visión.
- Tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de inferencia de texto en hardware con memoria limitada: la cuantización a ~4 bpw reduce el peso del decodificador y permite cargar el modelo en configuraciones multi-GPU más económicas que el modelo base en BF16, a costa de requerir el fork de shelf.
- Servicio de chat conversacional: el modelo conserva la cabeza a 6 bits y los embeddings en FP8, y el autor mide 12,31 tok/s en BetterBench chat, suficiente para asistentes interactivos con decodificación especulativa.
- Generación de código asistida: con 14,22 tok/s en BetterBench code y una tasa de aceptación de 1,98 con DFly2, encaja en autocompletado y revisión de código en entornos de desarrollo.
- Experimentación con cuantización de bajo bit: sirve como referencia reproducible para estudiar el impacto de EXL3-INT8 y FP8 en un modelo grande, con informe de conversión (`conversion_report.json`) e índice de tensores incluidos.
- Investigación sobre decodificación especulativa: el par formado por este modelo y el drafter Hy4-flash-DFly-EXL3-INT8-4bpw permite evaluar aceptación de drafts y latencia en pipelines de inferencia.
- Evaluación comparativa de precisión: útil para medir la degradación de perplejidad y calidad frente al modelo base, aunque el autor advierte que no ha realizado esas evaluaciones.
- Prefill de contextos largos en tareas de resumen o extracción: el autor reporta 676,6 tok/s de prefill con 2048 tokens, adecuado para procesar documentos antes de la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, perplejidad) en la información disponible. El autor indica explícitamente que PPL y benchmarks de calidad no han sido evaluados. Solo hay métricas de velocidad y fidelidad numérica:

| Metrica | Valor | Condiciones |
|---|---|---|
| Prefill | 676,6 tok/s | 2048 tokens fijos en inglés, temperatura 0, 1 entrada |
| Decode con DFly2 | 50,65 tok/s | Fork de shelf, EP=3 (R9700 + V620 x 2) |
| BetterBench code | 14,22 tok/s | Aceptación media 1,98 |
| BetterBench chat | 12,31 tok/s | Aceptación media 1,78 |
| Divergencia L2 relativa de logits finales (CPU) | 0,133 | Control de orden de suma CPU: 0,139 |
| Coincidencia greedy | 256 tokens | — |

## Requisitos de hardware

- VRAM estimada: los tensores suman ~133,82 GiB; se necesita un pool de memoria agregada de al menos ese tamaño, más overhead de activaciones y KV cache. El repositorio en disco ocupa 69,0 GB.
- GPU recomendadas: el autor valida EP=3 con una R9700 y dos V620. Para el modelo completo en memoria hacen falta varias GPU; no se especifican configuraciones con A100, H100 o RTX 4090.
- GPU de consumo: no cabe en una única GPU de consumo; requiere reparto entre varias unidades o memoria unificada, según la información disponible.
- Opciones de despliegue: no es cargable con Transformers estándar. Requiere el fork de shelf con soporte para Hy4-flash (no fusionado, PR en preparación). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 676,6 tok/s y decode de 50,65 tok/s con DFly2 en la configuración EP=3 indicada; el autor advierte que la velocidad depende de las condiciones de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash EXL3-INT8-4bpw (este) | No disponible | No disponible | EXL3-INT8 ~4 bpw, head 6 bits, Engram FP8 | Tencent Hy License 1.0 | Requiere fork de shelf no fusionado |
| tencent/Hy4-flash (base) | No disponible | No disponible | BF16 (presumiblemente) | Tencent Hy License 1.0 | Cargable con el stack estándar del autor |
| Hy4-flash-DFly-EXL3-INT8-4bpw | No disponible | No disponible | EXL3-INT8 ~4 bpw | Tencent Hy License 1.0 | Drafter complementario, mismas dependencias |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia crítica: no se puede cargar con Transformers estándar; requiere el fork de shelf con soporte para Hy4-flash, aún no fusionado y en preparación de PR.
- Calidad no evaluada: el autor no ha medido perplejidad ni benchmarks de calidad, por lo que se desconoce la degradación frente al modelo base.
- Visión excluida: este paquete no incluye el módulo de visión; para tareas multimodales hay que usar otros artefactos.
- Decodificación especulativa separada: DFly no está incluido; el drafter es un modelo aparte.
- Licencia restrictiva: Tencent Hy License 1.0 no equivale a Apache 2.0. La sección 10 impone condiciones comerciales adicionales a negocios de MaaS con ingresos globales superiores a 50 millones de USD en 12 meses consecutivos o más de 100 millones de usuarios activos mensuales, salvo excepciones; la sección 10.3 excluye el uso interno que no distribuya el modelo ni sus salidas. La redistribución exige incluir la licencia, indicar cambios y mantener avisos.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; debe asumirse el comportamiento del modelo base.
- Idiomas y contexto: no se especifican límites de contexto ni lista de idiomas, lo que impide garantizar cobertura multilingüe.
- Métricas de velocidad condicionadas: las cifras de throughput se obtuvieron en una configuración concreta (EP=3, R9700 + V620 x 2) y no son extrapolables sin validación.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes independientes de funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kusuriya-labs/Hy4-flash-EXL3-INT8-4bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Drafter complementario: https://huggingface.co/kusuriya-labs/Hy4-flash-DFly-EXL3-INT8-4bpw
