# biscet/Whittle-35B-A3B-DFlash2

## Resumen

Whittle-35B-A3B-DFlash2 es un modelo borrador (draft model) para decodificación especulativa sobre el modelo objetivo Whittle-Qwen-3.8-35B-A3B. Lo publica el usuario biscet en Hugging Face bajo licencia Apache-2.0 y no es un modelo generativo autónomo: es un adaptador de drafting que se ejecuta junto al modelo objetivo en un runtime compatible con DFlash2, acelerando la generación al proponer tokens que el modelo grande verifica después. El artefacto tiene 526.251.520 parámetros, 6 capas y un bloque de entrenamiento de 16 tokens, y se distribuye en formato GGUF F16 de 1.063.709.024 bytes (0,991 GiB).

La relevancia del modelo está en su función práctica: reducir la latencia de decodificación de un MoE de 35B con 3B activos sin tocar los pesos del modelo objetivo. Según las mediciones del autor, el uso del borrador eleva la decodificación de 53,60 a 74,08 tokens/s y el rendimiento de extremo a extremo de 50,13 a 67,62 tokens/s, con una tasa de aceptación del 59,53 % sobre 24 peticiones de generación larga. Son cifras de un entorno concreto (V100 32 GB para objetivo y borrador, RTX 3060 12 GB para memoria de n-gramas del objetivo, runtime llama.cpp modificado) y el propio autor advierte que la comparación no establece equivalencia de calidad con la generación sin borrador.

Se trata de un artefacto experimental, orientado a inglés y ruso, inicializado a partir de Ornith 1.5 DFlash2 y entrenado con trazas generadas por el propio Whittle Q5. No está validado en llama.cpp estándar, SGLang, vLLM ni Apple Metal, y las comprobaciones de marcador a 64K fallaron, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 draft (block diffusion), 6 capas, bloque de entrenamiento de 16 tokens |
| Parametros totales | 526.251.520 |
| Parametros activos | no disponible (no es MoE; el modelo objetivo sí es MoE 35B-A3B) |
| Longitud de contexto | no disponible para el borrador; el objetivo declara 256K, pero las comprobaciones de marcador a 64K fallaron con este draft |
| Tipos de cuantizacion | F16 GGUF (único artefacto publicado); otras cuantizaciones del borrador no disponibles |
| Idiomas soportados | Ruso e inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16, 1.063.709.024 bytes, 0,991 GiB) |

## Arquitectura y entrenamiento

El borrador sigue el esquema DFlash2 de difusión por bloques aplicada al drafting especulativo: un transformer de 6 capas con 526M de parámetros que propone bloques de hasta 16 tokens, verificados posteriormente por el modelo objetivo Whittle-Qwen-3.8-35B-A3B. La inicialización proviene de Ornith 1.5 DFlash2 (jzinno/Ornith-1.5-35B-A3B-DFlash2) y el entrenamiento solo actualiza los parámetros del borrador, manteniendo congelado el objetivo. El runtime evaluado es un fork modificado de llama.cpp, con un máximo de tres tokens propuestos por paso y caché KV del borrador en BF16.

Los datos de entrenamiento combinan DFlash TraceMix Lite con 1.152 tareas de primer turno de usuario seleccionadas de Tulu 3 SFT Mixture (576 en ruso y 576 en inglés, equilibradas entre código, matemáticas y razonamiento, escritura de texto y conocimiento). Las respuestas de referencia de Tulu no se usaron como etiquetas: las respuestas y características ocultas las generó Whittle Q5. El pipeline tiene dos etapas: adaptación al proyecto con Project Code (512 ejemplos de entrenamiento, 64 de validación) y continuación mixta con OpenMix (1.276 ejemplos utilizables de entrenamiento y 128 de validación, tras descartar cuatro trazas de Tulu demasiado cortas y añadir 256 registros de Project Code reproducidos). En total, 1.024 tareas de entrenamiento y 128 de validación de Tulu, de las que quedaron 1.020 trazas utilizables.

## Capacidades

- Decodificación especulativa: propone tokens para que el modelo objetivo Whittle-Qwen-3.8-35B-A3B los verifique, con hasta tres tokens propuestos por paso en la configuración evaluada.
- Drafting por bloques de 16 tokens mediante difusión por bloques (DFlash2).
- Soporte bilingüe ruso-inglés en el entrenamiento del borrador.
- Cobertura de dominios de código, matemáticas y razonamiento, escritura de texto y conocimiento, según la mezcla de Tulu 3 SFT Mixture utilizada.
- Integración con llama.cpp mediante un fork específico (commit e62f86f96cafaa10dde027404b9dd5a45cbb6899).
- No es un modelo de chat ni de generación autónoma: no dispone de tool calling, agentes, visión, audio ni modo de razonamiento propios. Esas capacidades dependen del modelo objetivo.

## Casos de uso

- Aceleración de inferencia de Whittle Qwen 3.8 35B A3B en local: el borrador se ejecuta junto al objetivo en un runtime DFlash2 y eleva la decodificación de 53,60 a 74,08 tokens/s en la medición del autor, lo que resulta adecuado para despliegues con requisitos de latencia interactiva.
- Servicio de generación de texto largo en ruso e inglés: con una tasa de aceptación del 59,53 % en 24 peticiones de hasta 1.024 tokens de salida, el borrador reduce el coste por token generado en cargas de escritura y respuesta extensa.
- Asistentes de código en estación de trabajo: la mezcla de entrenamiento incluye código y el objetivo es un MoE de 35B con 3B activos, por lo que el conjunto permite autocompletado y generación de código con menor latencia, siempre que se valide la calidad frente a la generación sin borrador.
- Investigación en decodificación especulativa: el artefacto incluye informes de evaluación, guía de entrenamiento y procedencia, lo que lo hace útil para reproducir experimentos de drafting con difusión por bloques sobre modelos MoE.
- Evaluación comparativa de borradores: al estar inicializado desde Ornith 1.5 DFlash2 y entrenado sobre Whittle, sirve como punto de comparación frente a otros drafts de la misma familia en experimentos controlados.
- Prototipado de pipelines de razonamiento y matemáticas: la mezcla de entrenamiento cubre razonamiento y matemáticas, de modo que el borrador puede emplearse en flujos de resolución de problemas donde el objetivo genera cadenas largas y el ahorro por token es determinante.
- Despliegue en hardware mixto: la configuración evaluada usa una V100 32 GB para el objetivo y el borrador y una RTX 3060 12 GB para la memoria de n-gramas del objetivo, un reparto que puede replicarse en entornos con GPU de distinta generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son las mediciones locales del autor sobre 24 peticiones de generación larga (12 tareas, dos pasadas, hasta 1.024 tokens de salida):

| Configuracion | Tokens/s en decodificacion | Tokens/s de extremo a extremo | Aceptacion del draft |
|---|---:|---:|---:|
| Whittle Q5 sin draft | 53,60 | 50,13 | — |
| Whittle DFlash2 v1.0.0 | 74,08 | 67,62 | 59,53 % |

El propio autor advierte que las salidas difirieron del control sin borrador, por lo que la comparación no establece equivalencia de calidad, y que las agrupaciones de validación se reutilizaron durante la selección de checkpoints.

## Requisitos de hardware

- VRAM del borrador: 0,991 GiB en F16 (1.063.709.024 bytes); el modelo objetivo se descarga por separado.
- VRAM del objetivo: la ficha de LLM Explorer para Whittle-Qwen-3.8-35B-A3B indica 4,5 GB de VRAM y 256K de contexto, aunque esa cifra corresponde a la cuantización concreta y no se detalla en la información disponible.
- GPU evaluadas: V100 32 GB para el cálculo del objetivo y del borrador, y RTX 3060 12 GB para la memoria de n-gramas del objetivo.
- GPU de consumo: el borrador en F16 cabe en cualquier GPU consumer con al menos 1 GB libre, pero el requisito real lo marca el modelo objetivo.
- Despliegue: únicamente validado con el fork modificado de llama.cpp del autor (rama e62f86f96cafaa10dde027404b9dd5a45cbb6899). llama.cpp estándar, SGLang, vLLM y Apple Metal no están validados para este artefacto.
- Latencia y throughput: 74,08 tokens/s en decodificación y 67,62 tokens/s de extremo a extremo en la configuración medida; no hay datos de latencia por petición ni de throughput con concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whittle-35B-A3B-DFlash2 (este) | 526M (draft) | no disponible (objetivo 256K; marcador 64K fallido) | Draft DFlash2 para Whittle Q5_K_M | Apache-2.0 | GGUF F16 en Hugging Face |
| Ornith 1.5 35B-A3B DFlash2 | no disponible | no disponible | Draft DFlash2, inicialización de este modelo | no disponible | Hugging Face (jzinno) |
| Whittle-Qwen-3.8-35B-A3B | 35B totales, 3B activos (MoE) | 256K | Modelo objetivo de generación | no disponible | Hugging Face (whittleOrg, logic65) |

No se dispone de datos de rendimiento comparables entre estos artefactos en la información proporcionada, más allá de la inicialización declarada y de que el objetivo es el modelo sobre el que se mide la aceleración.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo Whittle-Qwen-3.8-35B-A3B y un runtime DFlash2 compatible; por sí solo no genera texto.
- La equivalencia exacta con la generación greedy sin borrador no está confirmada; las salidas difirieron del control en la evaluación.
- Las comprobaciones de marcador a 64K fallaron con este borrador y no se probó un contexto de 256K completamente lleno.
- Solo se validó con el fork modificado de llama.cpp; llama.cpp estándar, SGLang, vLLM y Apple Metal no están validados.
- Solo se evaluó con la cuantización Whittle Q5_K_M del objetivo; otras cuantizaciones no están validadas.
- Las 24 respuestas de la evaluación alcanzaron el límite de salida y el código generado no se ejecutó, por lo que no hay verificación funcional de las salidas.
- Las agrupaciones de validación se reutilizaron durante la selección de checkpoints, lo que puede inflar las métricas reportadas.
- Cobertura lingüística limitada a ruso e inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de sesgos y alucinaciones heredado del modelo objetivo y de la mezcla Tulu 3 SFT, no evaluado de forma independiente para este artefacto.
- Licencia Apache-2.0 permite uso comercial, pero el carácter experimental y la falta de validación en producción desaconsejan su despliegue sin pruebas propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2
- Pesos F16 GGUF (v1.0.0): https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2/resolve/v1.0.0/Whittle-35B-A3B-DFlash2-v1.0.0-F16.gguf
- Rama v1.0.0: https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2/tree/v1.0.0
- Notas de version: https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2/blob/v1.0.0/README.md
- Guia de entrenamiento: https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2/blob/v1.0.0/TRAINING.md
- Fuentes de datos: https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2/blob/v1.0.0/DATA_SOURCES.md
- Guia de uso: https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2/blob/v1.0.0/USAGE.md
- Evaluacion completa: https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2/blob/v1.0.0/EVALUATION.json
- Procedencia: https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2/blob/v1.0.0/PROVENANCE.json
- Licencia y avisos: https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2/blob/v1.0.0/NOTICE
- Dataset DFlash TraceMix Lite: https://huggingface.co/datasets/biscet/DFlash-TraceMix-Lite/tree/v1.0.0
- Dataset Tulu 3 SFT Mixture: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Modelo objetivo Whittle-Qwen-3.8-35B-A3B: https://huggingface.co/whittleOrg/Whittle-Qwen-3.8-35B-A3B
- Objetivo en GGUF (logic65): https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B-GGUF
- Inicializacion Ornith 1.5 DFlash2: https://huggingface.co/jzinno/Ornith-1.5-35B-A3B-DFlash2
- Fork de llama.cpp utilizado: https://github.com/mistrjirka/llama.cpp/tree/e62f86f96cafaa10dde027404b9dd5a45cbb6899
- Organizacion Whittle en Hugging Face: https://huggingface.co/whittleOrg/models
- Ficha del objetivo en LLM Explorer: https://llm-explorer.com/model/logic65%2FWhittle-Qwen-3.8-35B-A3B,3wQmazLNQZM0FSCV5mgRyV
