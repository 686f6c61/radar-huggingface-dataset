# epsilon3/Qwen-2.5-1B-RLCD-Fast

## Resumen

Qwen-2.5-1B-RLCD-Fast es un repositorio publicado por el usuario epsilon3 que no contiene pesos nuevos ni un ajuste fino, sino una implementación de inferencia optimizada para Apple Silicon. A pesar del nombre, los pesos utilizados son exactamente los de Qwen/Qwen2.5-1.5B-Instruct (1.500 millones de parámetros), y el repositorio deriva de harshatheg/Qwen-2.5-1B-RLCD en el commit `2af86848be75847ccb3553b0941cc51d6ef7e4e9`. El objetivo es acelerar la decodificación restringida de múltiples campos estructurados (JSON con esquema fijo) mediante tree attention en lugar de evaluar cada campo como un lote independiente.

El problema que resuelve es concreto: en la generación estructurada con decodificación restringida paralela, la ruta original de PyTorch repite la caché KV del prefijo compartido para cada campo y evalúa los campos por lotes, lo que dispara el consumo de memoria de trabajo y el trabajo del cabezal de lenguaje. La ruta rápida almacena el prefijo una sola vez, empaqueta los sufijos de cada campo en un único árbol, aplica una máscara 4D para que cada token vea el prefijo común y solo sus ancestros, y proyecta únicamente los tokens finales de cada campo a través del cabezal de 151.936 tokens.

En un Apple M4 Pro (14 núcleos, 48 GB, PyTorch 2.11.0, transformers 4.57.6, MPS FP16, SDPA), el autor reporta aceleraciones de decodificación de hasta 2,37x con 28 campos y una reducción del crecimiento de memoria de decodificación del 98,0% (de 2.022 MiB a 40 MiB). Es relevante ahora porque demuestra que la decodificación estructurada paralela puede ejecutarse de forma eficiente en hardware de consumo de Apple, sin cambiar los pesos del modelo ni el método de salida original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con decodificación por tree attention y decodificación restringida en paralelo |
| Parámetros totales | 1.500 millones (1,5 B); el nombre del repositorio indica "1B", pero los pesos reales son los de Qwen2.5-1.5B-Instruct |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; corresponde a la del modelo base Qwen2.5-1.5B-Instruct |
| Tipos de cuantización | No disponible; las mediciones se realizaron en MPS FP16 y CPU FP32 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (los pesos del modelo base, sin modificar; el repositorio contiene código de inferencia, no pesos nuevos) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Repositorio del que deriva | harshatheg/Qwen-2.5-1B-RLCD (commit 2af86848be75847ccb3553b0941cc51d6ef7e4e9) |
| Tamaño de vocabulario | 151.936 tokens |
| Tarea declarada | text-generation (con etiquetas adicionales de classification y json) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only con normalización RMSNorm, activaciones SwiGLU y RoPE. Sobre esa base, este repositorio no entrena ni ajusta nada: introduce una ruta de inferencia alternativa. La ruta original repetía la caché KV del prefijo compartido para cada campo y evaluaba los campos como un lote; la ruta rápida almacena el prefijo una sola vez, empaqueta los sufijos de los campos en un único árbol y aplica una máscara 4D de modo que cada token atiende al prefijo común y únicamente a sus propios ancestros. Los identificadores de posición locales a cada rama preservan las posiciones de RoPE.

La segunda optimización es de cómputo: en lugar de proyectar todos los tokens de sufijo a través del cabezal de lenguaje de 151.936 tokens, solo se proyectan los puntos finales de cada campo. Según el autor, con 28 campos esto reduce el trabajo estimado del cabezal de 445,3 a 13,1 GFLOP. Los campos permanecen independientes entre sí y no pueden atender a los valores de campos hermanos, lo que preserva la semántica de la decodificación restringida original.

No se especifican en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO, ya que este repositorio no realiza entrenamiento alguno. Las innovaciones técnicas se limitan a la ruta de decodificación: tree attention con máscara 4D, identificadores de posición por rama y proyección selectiva del cabezal.

## Capacidades

- Generación de texto con los pesos de Qwen2.5-1.5B-Instruct, sin modificaciones en la distribución de salida.
- Decodificación restringida por esquema: genera campos JSON validados contra un esquema precompilado (presets `fintech_fraud`, `support_triage` y `code_security`).
- Decodificación estructurada en paralelo mediante tree attention, con evaluación simultánea de hasta 28 campos independientes.
- Clasificación con vocabulario restringido (la etiqueta `classification` figura entre las del repositorio).
- Salida JSON ensamblada por el propio SDK, que incluye tokenización, compilación de esquema, prefill, evaluación de sufijos, proyección del cabezal de lenguaje y ensamblado final.
- Ejecución en Apple Silicon mediante backend PyTorch con MPS (FP16) y en CPU (FP32); las etiquetas también mencionan MLX.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio. Las capacidades multilingües tampoco se documentan: el repositorio declara únicamente inglés.

## Casos de uso

- Detección de fraude financiero con esquema fijo: el preset `fintech_fraud` decodifica hasta 28 campos estructurados de forma simultánea. Con tree attention, 28 campos tardan 142,5 ms en M4 Pro frente a 337,7 ms en la ruta por lotes, un 2,37x más rápido, lo que permite evaluar transacciones en tiempo real en un portátil.
- Triaje de tickets de soporte: el preset `support_triage` extrae campos como categoría, prioridad o entidad afectada. Con 16 campos, la decodificación baja de 168,8 ms a 83,0 ms (2,03x), adecuado para clasificar colas de tickets en lotes sin infraestructura GPU.
- Análisis de seguridad de código: el preset `code_security` produce salidas estructuradas sobre hallazgos. La ruta rápida mantiene 140,7 ms para 28 campos frente a 331,4 ms, y reduce el crecimiento de memoria de decodificación de 2.022 MiB a 32 MiB (98,4%), lo que permite ejecutarlo en integración continua sobre máquinas Apple.
- Extracción de entidades con esquema validado: al restringir la decodificación al vocabulario del esquema, la salida es directamente parseable como JSON, lo que elimina la necesidad de pasos posteriores de reparación o validación de formato en pipelines de datos.
- Inferencia local con requisitos de privacidad: al ejecutarse íntegramente en Apple Silicon con pesos de 1,5 B en FP16, los datos no salen del dispositivo. El pico de memoria medido con tree attention es de aproximadamente 3,2 GiB, por lo que cabe en equipos con memoria unificada de 16 GB o superior.
- Clasificación con enum restringido: el decodificador restringido por vocabulario permite mapear entradas a conjuntos cerrados de etiquetas, útil para moderación, enrutado de consultas o etiquetado automático en lotes.
- Prototipado e investigación en decodificación estructurada: el repositorio incluye pruebas (`test_tree_decode`, `test_sdk`) y scripts de evaluación comparativa que permiten reproducir el aislamiento entre ramas hermanas y comparar la ruta por lotes con la ruta de árbol.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de latencia y memoria en un Apple M4 Pro (14 núcleos, 48 GB, PyTorch 2.11.0, transformers 4.57.6, MPS FP16, SDPA), con ocho ensayos aleatorizados emparejados y dos calentamientos por caso. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

Aceleración de decodificación por preset y número de campos:

| Preset | Campos | Decode por lotes (ms) | Tree decode (ms) | Aceleración decode | Aceleración con prefill |
|---|---:|---:|---:|---:|---:|
| fintech_fraud | 4 | 47,3 | 33,4 | 1,41x | 1,07x |
| fintech_fraud | 16 | 166,4 | 83,1 | 2,00x | 1,26x |
| fintech_fraud | 28 | 337,7 | 142,5 | 2,37x | 1,41x |
| support_triage | 4 | 51,4 | 33,5 | 1,54x | 1,09x |
| support_triage | 16 | 168,8 | 83,0 | 2,03x | 1,27x |
| support_triage | 28 | 333,2 | 140,5 | 2,37x | 1,41x |
| code_security | 4 | 50,9 | 34,9 | 1,46x | 1,08x |
| code_security | 16 | 168,5 | 83,2 | 2,02x | 1,26x |
| code_security | 28 | 331,4 | 140,7 | 2,35x | 1,41x |

Mediciones adicionales reportadas por el autor:

| Escenario | Resultado |
|---|---|
| Cuatro pasos de decodificación consecutivos sobre cuatro campos | 2,41x de aceleración en decode; 1,54x incluyendo prefill |
| CPU del M4 Pro en FP32, 4 campos | 1,13x |
| CPU del M4 Pro en FP32, 16 campos | 1,47x |
| CPU del M4 Pro en FP32, 28 campos | 1,79x |
| SDK completo (tokenización, compilación de esquema, prefill, sufijos, proyección y ensamblado JSON), tres casos MPS de 28 campos | 1,50x–1,51x más rápido que la función original |
| Trabajo estimado del cabezal de lenguaje a 28 campos | de 445,3 a 13,1 GFLOP |

Memoria de decodificación medida como asignación alta del controlador Metal (MiB):

| Preset | Campos | Extra por lotes | Extra con árbol | Reducción | Pico por lotes | Pico con árbol |
|---|---:|---:|---:|---:|---:|---:|
| fintech_fraud | 4 | 112 | 32 | 71,4% | 3.279 | 3.199 |
| fintech_fraud | 16 | 2.352 | 8 | 99,7% | 5.620 | 3.276 |
| fintech_fraud | 28 | 2.022 | 40 | 98,0% | 5.295 | 3.271 |
| support_triage | 4 | 104 | 8 | 92,3% | 3.359 | 3.263 |
| support_triage | 16 | 2.352 | 24 | 99,0% | 5.599 | 3.271 |
| support_triage | 28 | 2.062 | 48 | 97,7% | 5.292 | 3.276 |
| code_security | 4 | 120 | 32 | 73,3% | 3.293 | 3.205 |
| code_security | 16 | 2.352 | 24 | 99,0% | 5.618 | 3.290 |
| code_security | 28 | 2.022 | 32 | 98,4% | 5.303 | 3.271 |

## Requisitos de hardware

- VRAM o memoria unificada estimada: el pico de memoria del controlador Metal con tree attention se mantiene entre 3.199 y 3.290 MiB (aproximadamente 3,1–3,2 GiB) en todos los presets y números de campos medidos. En la ruta por lotes el pico llega a 5.620 MiB (unos 5,5 GiB).
- Cabe en GPU de consumo: sí. Las mediciones se realizaron en un Apple M4 Pro con 48 GB de memoria unificada, pero el consumo medido es compatible con equipos Apple Silicon de 16 GB o más. No se documentan mediciones en GPU NVIDIA.
- GPU recomendadas: no disponible. El autor solo documenta Apple Silicon (MPS) y CPU; no hay datos publicados para A100, H100 ni RTX 4090.
- Opciones de despliegue: scripts propios del repositorio (`generate.py`, `benchmark.py`, `test_tree_decode`, `test_sdk`) ejecutados con `BACKEND=torch`. Las etiquetas mencionan MLX, pero no se detalla su uso. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida (M4 Pro, MPS FP16): 33,4–34,9 ms para 4 campos y 140,5–142,5 ms para 28 campos en modo árbol, frente a 47,3–51,4 ms y 331,4–337,7 ms respectivamente en modo por lotes.
- Memoria de trabajo con 28 campos: 40 MiB de crecimiento adicional con árbol frente a 2.022 MiB con procesamiento por lotes, un 98,0% menos.
- El árbol empaqueta los sufijos en una sola estructura con máscara 4D, por lo que la memoria escala de forma muy contenida con el número de campos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de decodificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| epsilon3/Qwen-2.5-1B-RLCD-Fast | 1,5 B | No disponible | Tree attention con máscara 4D y decodificación restringida en paralelo; proyección selectiva del cabezal | Apache 2.0 | Repositorio con código de inferencia; 0 descargas y 0 likes en el momento de la consulta |
| harshatheg/Qwen-2.5-1B-RLCD | 1,5 B | No disponible | Decodificación restringida en paralelo con evaluación por lotes y caché KV repetida por campo | Apache 2.0 (heredada) | Repositorio del que deriva este; sirve como línea base de las mediciones |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | No disponible en esta información | Decodificación autorregresiva convencional, sin restricciones de esquema | Apache 2.0 | Modelo base ampliamente distribuido del que proceden los pesos |

No se dispone de resultados de benchmarks de calidad que permitan comparar el rendimiento funcional frente a alternativas de decodificación estructurada como las librerías de gramáticas y autómatas (XGrammar, Outlines u otras), por lo que esa comparación no está disponible.

## Limitaciones y advertencias

- El repositorio contiene código de inferencia, no pesos nuevos ni ajustados. El nombre "Qwen-2.5-1B" es engañoso: el modelo real es Qwen2.5-1.5B-Instruct, con 1.500 millones de parámetros.
- Los logits en FP16 son numéricamente cercanos, pero no idénticos bit a bit a los de FP32. En un caso de `code_security` en MPS FP16 se produjo un empate técnico cercano en una decisión de campo restringido: el margen FP32 entre los dos primeros logits era de 0,00235, por debajo del error de redondeo observado en FP16. El banco de pruebas lo registra en lugar de abortar.
- El evaluador de candidatos heredado de la ruta PyTorch solo evalúa el primer token tras un prefijo de caracteres compartido. No es un decodificador completo de trie de enumeración, y las puntuaciones normalizadas de candidatos no son estimaciones de confianza calibradas empíricamente.
- Las mediciones corresponden a un M4 Pro concreto y a esos prompts. El enmascarado denso sigue calculando atención entre hermanos enmascarados, por lo que los resultados pueden variar según los kernels y la carga de trabajo.
- Las cifras originales de MLX citadas por el autor comparan la evaluación paralela de campos con la generación JSON secuencial; las cifras nuevas comparan tree attention con procesamiento por lotes. No deben multiplicarse entre sí.
- Solo se declara soporte de inglés, por lo que el uso en otros idiomas no está documentado y el comportamiento fuera del inglés no está garantizado.
- Riesgo de alucinación: no se publican evaluaciones de fidelidad ni de calibración; el repositorio no modifica los pesos del modelo base, de modo que hereda sus sesgos y su tasa de error factual, que no se cuantifica en la información disponible.
- No se documentan sesgos conocidos, ni evaluaciones de seguridad, ni pruebas de robustez frente a entradas adversarias.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de pesos de Qwen2.5-1.5B-Instruct conviene verificar las condiciones del modelo base antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación externa ni con una comunidad de usuarios que reporte problemas.
- No se documentan resultados en CUDA ni en aceleradores distintos de Apple Silicon, por lo que extrapolar los números de rendimiento a otros hardware no está justificado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/epsilon3/Qwen-2.5-1B-RLCD-Fast
- Modelo del que deriva: https://huggingface.co/harshatheg/Qwen-2.5-1B-RLCD (commit `2af86848be75847ccb3553b0941cc51d6ef7e4e9`)
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Space asociado: https://huggingface.co/spaces/drinkmoonshine/parallel-constrained-decoding

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada.
