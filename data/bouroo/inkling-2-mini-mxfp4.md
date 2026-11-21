# bouroo/Inkling-2-Mini-MXFP4

## Resumen

Inkling-2-Mini-MXFP4 es una cuantización en formato GGUF del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario bouroo. Se trata de un modelo de arquitectura `inkling2_loop` (transformer con núcleo recurrentemente "loopeado" sobre 24 bloques físicos) con 26.070.385.152 parámetros totales y una ventana de contexto declarada de 1 millón de tokens. La cuantización emplea MXFP4 (4,53 bits por peso, group size 32) para los expertos de las capas 0-19, Q8_0 para las proyecciones de atención y BF16/F32 para el resto, dando un artefacto de 14,77 GB.

El interés técnico de esta build no reside en el modelo en sí, sino en dos correcciones estructurales sobre las publicaciones previas. Por un lado, los GGUF raíz de `unsloth/Inkling-2-Mini-GGUF` usan el layout legado `inkling2` de 48 bloques, que llama.cpp mainline y LM Studio rechazan; aquí se parte de la variante `Mainline_Support/` (`inkling2_loop`). Por otro, todos los runtimes llama.cpp hasta 2.80.1 emiten texto incoherente con pesos `inkling2_loop` que llevan tensores `.scale`, porque el código del bucle copia las estructuras de capa antes de la pasada genérica de escalas y la escala externa por experto (~1e-4) se descarta silenciosamente.

La solución aplicada es estructural: las escalas externas por experto se pliegan dentro de los pesos (`W' = W * s`), de modo que no existe tensor `.scale` y no hace falta parchear el runtime. El resultado se valida en LM Studio 2.80.1 (respuesta correcta `391` frente a `Difference Difference Difference` del build sin modificar) y en llama.cpp HEAD. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (24 bloques físicos + núcleo loopeado; MoE) |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (declarado; verificado en carga con `-c 32768`) |
| Tipos de cuantizacion | MXFP4 (4,53 BPW, gs32) para expertos de bloques 0-19; Q8_0 en atención; BF16 en expertos de bloques 20-23, embeddings y salida; F32 en normas, kernels de convolución corta, escalas de clip, control del bucle y router |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / LM Studio) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) y una arquitectura denominada `inkling2_loop`, que organiza el cómputo en 24 bloques físicos más un núcleo que se recorre en bucle. La model card de esta cuantización no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base `thinkingmachines/Inkling-2-Mini` y no se reproducen aquí.

La innovación relevante de esta build es de ingeniería de cuantización. Los expertos de los bloques 0-19 se cuantizan a MXFP4 con un factor de escala externo por experto; los runtimes llama.cpp hasta 2.80.1 pierden esa escala al cargar pesos `inkling2_loop`, lo que produce salida incoherente. El autor pliega la escala en los pesos mediante `fold_scales.py` (descuantizar MXFP4, multiplicar por la escala por experto y recuantizar), con un error relativo medio de 0,10, equivalente a un paso de MXFP4. Los bloques 20-23 conservan expertos en BF16 porque su origen en la release Q8_K_XL ya era BF16 y no existía escala calibrada con imatrix que preservar. No se incluye el drafter de decodificación especulativa DSpark (`dspark-Inkling-2-Mini-Q8_0.gguf`) porque su contrato de tensores no encaja con mainline (ancho de `joint_proj` de 5120 frente a 2816, ausencia de `markov_w2`, `markov_w1` con padding de vocabulario y falta de `fc.weight`).

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-paso con canal de razonamiento explícito: el modelo gasta presupuesto de tokens en el canal de reasoning, por lo que requiere al menos 600 tokens de salida para no devolver `content` vacío.
- Razonamiento sobre código: la model card documenta una corrección real de un bug off-by-one en una función `paginate` con dos tests fallando que pasan a 3/3 tras aplicar el parche.
- Manejo de contextos muy largos: verificado con 27.846 tokens de prompt para contar 1.800 funciones (resultado `1800`) y con 10.551 tokens para aritmética sobre la última función de 700 definiciones (resultado `700`).
- Capacidad de explicación técnica: verificado con una explicación correcta de dispersión de Rayleigh.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Capacidades de agente: no documentadas explícitamente; el soporte de contexto largo y razonamiento multi-paso es compatible con flujos agénticos, pero no hay validación publicada.

## Casos de uso

- Reparación de bugs en bases de código reales: el modelo puede recibir un fallo de test y el código relevante y devolver un parche; la model card documenta un ciclo `pytest` fallando 2 de 3 y pasando 3 de 3 tras aplicar la corrección. Adecuado por su ventana de contexto amplia y su canal de razonamiento.
- Análisis de repositorios grandes: con prompts de decenas de miles de tokens (verificado hasta 27.846) puede contar funciones, localizar la última definición de un fichero o responder preguntas agregadas sobre un codebase, evitando trocear el contexto.
- Asistente de explicación técnica: generar explicaciones correctas de fenómenos físicos o matemáticos (validado con dispersión de Rayleigh) en documentación o materiales didácticos en inglés.
- Despliegue local en estaciones de trabajo Apple Silicon: con 14,77 GB de pesos y 13,75 GiB residentes, cabe en un M4 Pro de 48 GB y rinde 27,8 tok/s con Metal, lo que permite uso interactivo sin GPU dedicada.
- Integración en LM Studio para prototipado: el formato GGUF y la compatibilidad con `lms load` permiten cargar el modelo con `--gpu max -c 8192` o `-c 32768 --parallel 1` para pruebas de prompts y evaluación rápida.
- Servidor de inferencia ligero con llama.cpp: `llama-server -m ... -ngl 99 -c 8192` permite exponer el modelo como API local para tareas de razonamiento y código en un pipeline interno.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de MXFP4 frente a Q8 o BF16 en un MoE con escalas por experto, dado que el autor documenta el error de recuantización (0,10 relativo).

## Benchmarks y rendimiento

| Prueba | Entorno | Resultado |
|---|---|---|
| Respuesta aritmética simple | llama.cpp HEAD | correcto (`391`) |
| Respuesta aritmética simple | LM Studio 2.80.1 | correcto (`391`) |
| Respuesta aritmética simple (build sin plegar escalas) | LM Studio 2.80.1 | `Difference Difference Difference` |
| Throughput | M4 Pro 48 GB, Metal | 27,8 tok/s |
| Tiempo de carga | LM Studio 2.80.1 | 2,05 s |
| Memoria residente | LM Studio 2.80.1 | 13,75 GiB |
| Bug fix `paginate` (327 tokens de prompt) | LM Studio 2.80.1 | 3/3 tests pasan tras el parche |
| Aritmética sobre 700 definiciones (10.551 tokens) | LM Studio 2.80.1 | `700` correcto |
| Conteo de 1.800 funciones (27.846 tokens) | LM Studio 2.80.1 | `1800` correcto |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 14,77 GB de pesos; 13,75 GiB residentes medidos en LM Studio con contexto de 32.768 tokens.
- GPU recomendadas: no hay datos específicos para GPU dedicadas; el autor valida en Apple Silicon (M4 Pro 48 GB, Metal). Por tamaño, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100) debería alojar los pesos, aunque no se documenta rendimiento en esas plataformas.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 16 GB de VRAM si se reserva espacio para el contexto; el caso validado es un SoC Apple con memoria unificada de 48 GB.
- Opciones de despliegue: llama.cpp (`llama-server -m ... -ngl 99 -c 8192`), LM Studio (`lms load inkling-2-mini --gpu max -c 8192`); vLLM y TGI no están documentados para este formato.
- Latencia y throughput: 27,8 tok/s en M4 Pro 48 GB con Metal; tiempo de carga de 2,05 s en LM Studio 2.80.1.
- Nota de runtime: requiere llama.cpp con el commit 19bc41d o posterior para el build sin modificar; el build con escalas plegadas funciona también en versiones anteriores como 2.80.1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bouroo/Inkling-2-Mini-MXFP4 | 26,07 B | 1 M | GGUF (MXFP4) | Apache 2.0 | Escalas plegadas, compatible con llama.cpp 2.80.1 |
| thinkingmachines/Inkling-2-Mini | no disponible | 1 M | safetensors | Apache 2.0 | Modelo base sin cuantizar |
| unsloth/Inkling-2-Mini-GGUF | no disponible | 1 M | GGUF | Apache 2.0 | GGUF raíz con layout legado `inkling2` que no carga en mainline; solo `Mainline_Support/` es utilizable |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; no se garantiza calidad en castellano ni en otros idiomas.
- Razonamiento con presupuesto mínimo: si se asignan menos de 600 tokens de salida, el modelo puede devolver `content` vacío porque consume todo el presupuesto en el canal de razonamiento.
- Decodificación especulativa no incluida: el drafter DSpark publicado no es compatible con mainline llama.cpp ni con LM Studio; no se puede acelerar con speculative decoding en esta build.
- Compatibilidad de runtime: el GGUF sin modificar (`Inkling-2-Mini-MXFP4.gguf`) solo funciona correctamente en llama.cpp con el commit 19bc41d o posterior; en versiones anteriores produce salida incoherente.
- Error de cuantización: el plegado de escalas introduce un error relativo medio de 0,10 (un paso de MXFP4), lo que puede degradar ligeramente la precisión frente a Q8 o BF16.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo, es inherente y debe mitigarse con verificación externa en producción.
- Sesgos: no documentados en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y sus pesos derivados deben cumplir las condiciones de atribución correspondientes.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/bouroo/Inkling-2-Mini-MXFP4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de referencia (Unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
