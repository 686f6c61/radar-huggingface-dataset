# IndrasMirror/Inkling-2-Mini-XQT-Uncensored

## Resumen

Inkling-2-Mini-XQT-Uncensored es una cuantización de precisión mixta del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario IndrasMirror. Se trata de una variante "abliterated" (edición Unbound v3 de nokeep) que elimina los mecanismos de rechazo del modelo original, empaquetada en 10,94 GB para que el modelo completo y 32K de contexto quepan en una GPU de 12 GB. El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) y bucle de capas (`inkling2_loop`), con 26.070.390.272 parámetros totales según los safetensors del modelo original.

La característica técnica más destacable es el uso de formatos de cuantización con codificación trellis (TQP5, TQP6, TQP7, que empaquetan 2,6, 3,1 y 3,6 bits por peso respectivamente), junto con NVFP4 oficial conservado bit a bit en las capas de expertos donde más importa y tipos estándar de 2 bits en el resto. El backbone denso se mantiene en 8 bits (Q8_0). Estos formatos trellis solo son compatibles con el motor Xolotl del mismo autor, no con llama.cpp, LM Studio, Ollama ni otros motores GGUF convencionales.

El modelo resuelve el problema de ejecutar un MoE de 26B parámetros con capacidades multimodales (image-text-to-text) y contexto largo en hardware de consumo. Incluye un encoder de visión separado (mmproj F16, ~1 GB de VRAM) y soporta contexto de hasta 524.288 tokens mediante el flag `--kv-vram`, que mantiene parte de la caché K/V en RAM del sistema. La licencia es Apache 2.0, aunque el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con bucle de capas (`inkling2_loop`), transformer con mezcla de expertos |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 524.288 tokens (con `--kv-vram`); 32K recomendado en 12 GB |
| Tipos de cuantizacion | TQP5 (2,6 bits/peso), TQP6 (3,1 bits/peso), TQP7 (3,6 bits/peso), NVFP4 oficial, tipos estándar de 2 bits, Q8_0 en backbone denso |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (variante trellis, solo motor Xolotl); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura de mezcla de expertos (MoE) con un diseño de transformer con bucle de capas, identificado en el repositorio como `inkling2_loop`. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset y si hubo fases de RLHF o DPO no están disponibles en la información proporcionada. El modelo original tiene capacidades multimodales (pipeline image-text-to-text), lo que implica un encoder de visión acoplado, distribuido por separado en este repositorio como `mmproj-...-F16.gguf`.

La innovación técnica de esta ficha no reside en el entrenamiento sino en la cuantización. El pipeline asigna a cada tensor de expertos enrutados el formato con el menor error de salida medido para su tamaño, empleando formatos trellis (TQP5/6/7) que empaquetan más precisión por bit que los tipos GGUF estándar. Posteriormente, una pasada de reparación mide qué capas de expertos han perdido más fidelidad respecto al original y reasigna el presupuesto restante (los últimos 0,5 GB de los 11 GB) a esas capas. La edición Unbound v3 de nokeep modifica las atenciones para eliminar los comportamientos de rechazo del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con modo "thinking" activable, evaluado en la model card con MATH-24.
- Generación de código: evaluado con HumanEval y con tareas de reparación de bugs en bucles de agente.
- Capacidades multimodales de imagen a texto mediante el encoder de visión mmproj (F16, ~1 GB de VRAM adicional).
- Tool calling / function calling: validado con una prueba de selección de herramienta (10/10).
- Razonamiento agéntico multi-paso: evaluado con tareas de bug-fixing y con el conjunto Gauntlet v3-small.
- Contexto largo: soporta hasta 524.288 tokens con `--kv-vram`, con recuperación de información verificada (needle) a 500K en una RTX 4090.
- Modo "uncensored": la edición Unbound v3 elimina los rechazos del modelo original.
- Soporte de decodificación con caché K/V cuantizada (`--kv-type k8v4`) y atención dispersa opcional (`--kv-sparse 2048`).

## Casos de uso

- Asistente conversacional local en GPU de 12 GB: el modelo completo y 32K de contexto caben en una RTX 3060 12 GB, 4070 o 5070, permitiendo desplegar un MoE de 26B parámetros en hardware de consumo sin depender de la nube.
- Generación y reparación de código en pipelines de CI/CD: con tool calling validado y HumanEval 21/21 en la muestra evaluada, puede integrarse en bucles de agente que detectan fallos de tests y proponen parches.
- Análisis de documentos e imágenes: el encoder de visión permite procesar capturas, diagramas o documentos escaneados junto con instrucciones de texto, con un coste adicional de ~1 GB de VRAM.
- Procesamiento de contexto muy largo: con `--context 524288` y `--kv-vram 32768`, se pueden analizar repositorios completos, expedientes o transcripciones extensas manteniendo 32K de caché en la GPU y el resto en RAM.
- Investigación sobre alineación y seguridad: la variante "abliterated" permite estudiar el comportamiento del modelo sin mecanismos de rechazo, útil para analizar sesgos y fronteras de seguridad en entornos controlados.
- Razonamiento matemático con modo thinking: útil para tareas de verificación simbólica o resolución de problemas paso a paso, con resultados de MATH-24 entre 83,3 % y 91,7 % según semilla.
- Agentes autónomos de resolución de tareas: el conjunto Gauntlet v3-small reporta 2 de 6 tareas resueltas con puntuación media de 0,72, adecuado para prototipos de agentes con contexto de 128K.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en Xolotl sobre RTX 4090 el 28 de noviembre de 2026, comparando este archivo (10,9 GB) con el XQT anterior (13,9 GB, Unbound v2):

| Prueba | XQT anterior (13,9 GB) | Este archivo (10,9 GB) |
|---|---|---|
| MMLU, muestra de 100 preguntas (greedy, thinking off) | 78 % | 77 % |
| HumanEval, cada 8º problema (21) | 20/21 | 21/21 |
| Selección de herramienta (10) / bucles de bug-fix (3) | 10/10, 3/3 | 10/10, 3/3 |
| MATH-24, muestreado (temp 1, thinking on), 3 semillas | 83,3 / 87,5 / 83,3 % | 91,7 / 91,7 / 83,3 % |
| Gauntlet v3-small, 6 tareas agénticas (greedy, 128K) | no ejecutado | 2 de 6 resueltas, puntuación media 0,72 |

Fidelidad respecto al modelo original, sobre 18.710 posiciones de siguiente token (1.338 consideradas sensibles):

| Modelo | Tamaño | Flips en posiciones sensibles |
|---|---|---|
| Original Unbound v3 (expertos NVFP4) | 22,9 GB | 0 |
| XQ estándar | 13,9 GB | 222 |
| Este archivo | 10,9 GB | 303 |
| Build plano de 10,4 GB antes de la reparación | 10,4 GB | 327 |

Rendimiento medido en RTX 3060 12 GB (modelo completo en VRAM, `--kv-type k8v4`, prompt de 8K y 512 tokens generados):

| Contexto | VRAM usada | Prefill | Decode |
|---|---:|---:|---:|
| 32K | 10,9 GB | 765 tok/s | 48,3 tok/s |
| 64K | 11,3 GB | 516 tok/s | 48,4 tok/s |

Rendimiento en RTX 4090 24 GB (modelo y toda la K/V en VRAM, `--context 262144 --kv-type k8v4`, 16,3 GB usados, 256 tokens generados):

| Prompt | Prefill | Decode |
|---|---:|---:|
| 8K | 2.361 tok/s | 132,2 tok/s |
| 32K | 2.937 tok/s | 124,6 tok/s |

## Requisitos de hardware

- VRAM estimada: 10,9 GB con contexto de 32K; 11,3 GB con 64K; 16,3 GB en RTX 4090 con contexto de 262.144 tokens y toda la K/V en VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 5070 (edición objetivo); RTX 4090 24 GB para contexto completo y mayor throughput.
- Cabe en GPU de consumo de 12 GB; no cabe en tarjetas de 8 GB ni en las de 10 GB.
- El encoder de visión añade ~1 GB de VRAM; cargarlo solo si se necesitan imágenes.
- Motor de despliegue: exclusivamente Xolotl (build `xolotl-inkling`, main desde el 28 de noviembre de 2026 o posterior). No es compatible con llama.cpp, LM Studio, Ollama ni otros motores GGUF.
- Para motores GGUF convencionales existe la edición estándar XQ de 13,9 GB, que requiere 16 GB o más de VRAM.
- Throughput medido: 48,3 tok/s de decode en RTX 3060 y 132,2 tok/s en RTX 4090; prefill de 765 tok/s (3060, 32K) y 2.937 tok/s (4090, 32K).
- En RTX 3060 se recomienda `XOLOTL_TQP_MMQ=1` (lo activa el wrapper `xol-inkling-3060`) para mejorar el prefill.
- Contexto largo en 12 GB: `--kv-vram 32768` mantiene 32K de K/V en GPU y el resto en RAM; más allá de 32K el decode queda limitado por el ancho de banda de RAM salvo que se use `--kv-sparse 2048`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-XQT-Uncensored (este) | 26,07B totales | hasta 524.288 | Apache 2.0 | GGUF trellis, solo Xolotl | 10,9 GB, cabe en 12 GB, uncensored |
| Inkling-2-Mini-XQ-Uncensored | 26,07B totales | hasta 524.288 | Apache 2.0 | GGUF estándar, motores GGUF | 13,9 GB, requiere 16 GB, más fiel al original (222 flips) |
| Inkling-2-Mini original (Unbound v3) | 26,07B totales | no disponible | Apache 2.0 | NVFP4, safetensors | 22,9 GB, referencia de fidelidad (0 flips) |
| Inkling-2-Mini base (thinkingmachines) | 26,07B totales | no disponible | Apache 2.0 | safetensors | Modelo original con rechazos; sin edición Unbound |

## Limitaciones y advertencias

- Solo funciona en el motor Xolotl; llama.cpp, LM Studio, Ollama y otros motores GGUF rechazarán cargar el archivo por los tipos trellis TQP5/6/7.
- Requiere una build de Xolotl main del 28 de noviembre de 2026 o posterior; hay que re-ejecutar `tools/xolotl/fetch-llama.sh` tras actualizar.
- Pérdida de fidelidad medible: 303 flips en 1.338 posiciones sensibles frente a 0 del original y 222 del XQ estándar; puede afectar a tareas que dependen de tokens poco probables.
- Solo soporta inglés según la model card; no se declara soporte multilingüe.
- La edición "uncensored" (Unbound v3) elimina los rechazos del modelo, lo que incrementa el riesgo de generar contenido dañino, sesgado o inexacto; no es adecuada para despliegues públicos sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje; los benchmarks publicados usan muestras pequeñas (100 preguntas en MMLU, 21 problemas en HumanEval, 24 en MATH), por lo que la varianza es alta.
- El contexto más allá de 32K en tarjetas de 12 GB depende de la RAM del sistema y reduce el throughput de decode; `--kv-sparse 2048` es una aproximación que puede degradar la precisión en recuperación de información.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y la edición Unbound pueden arrastrar condiciones adicionales; conviene verificar las licencias de thinkingmachines/Inkling-2-Mini y de nokeepai/Inkling-2-Mini-Unbound antes de producción.
- El repositorio tiene muy poca tracción (15 descargas, 0 likes) y fue creado en noviembre de 2026; no hay validación independiente de los benchmarks publicados.
- El archivo de 13,9 GB XQT anterior (Unbound v2) fue reemplazado bajo el mismo nombre; si se necesita esa versión, hay que recurrir al historial del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndrasMirror/Inkling-2-Mini-XQT-Uncensored
- Edición estándar XQ: https://huggingface.co/IndrasMirror/Inkling-2-Mini-XQ-Uncensored
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Edición Unbound v3 de nokeep: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Motor Xolotl: https://github.com/Indras-Mirror/Xolotl
- Documentación de Inkling en Xolotl: https://github.com/Indras-Mirror/Xolotl/blob/main/docs/INKLING.md
- Paper referenciado (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
