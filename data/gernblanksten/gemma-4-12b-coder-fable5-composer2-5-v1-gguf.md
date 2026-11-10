# gernblanksten/gemma-4-12B-coder-fable5-composer2.5-v1-GGUF

## Resumen

Gemma4-12B-Coder (Composer 2.5 × Fable 5) es un ajuste fino del modelo base google/gemma-4-12B-it, publicado por el usuario gernblanksten en formato GGUF. El modelo está especializado en generación de código Python verificable y razonamiento explícito (chain-of-thought) previo a la emisión de la solución. Con 11.907.350.576 parámetros (~11,9 mil millones), se distribuye cuantizado para poder ejecutarse en hardware de consumo, desde 4,5 GB de VRAM en Q2_K hasta 11,8 GB en Q8_0. La licencia declarada es Apache 2.0.

La propuesta del autor es un modelo de codificación local, offline y privado, destilado a partir de trazas de razonamiento reales de un profesor denominado Composer 2.5, complementadas con trazas sintéticas de un segundo profesor (Fable 5) para recuperar los casos fallidos. Todos los ejemplos de entrenamiento fueron validados mediante ejecución contra tests deterministas, de modo que las trazas de razonamiento incluidas conducen a código que efectivamente pasa las pruebas.

El modelo declara una ventana de contexto de 262.144 tokens (256K), corregida respecto al valor erróneo de 131.072 que arrastraban los metadatos upstream de Gemma 4. Es relevante para desarrolladores que necesitan un asistente de código privado en GPU de consumo, aunque el repositorio no presenta descargas ni validación externa en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura GGUF `gemma4_unified`, derivada de google/gemma-4-12B-it) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q2_K (4,5 GB), Q3_K_M (5,7 GB), Q4_K_M (6,87 GB), Q6_K (9,11 GB), Q8_0 (11,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 40,8 GB); safetensors del maestro en repo separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer denso google/gemma-4-12B-it, empaquetado en GGUF para llama.cpp bajo la arquitectura `gemma4_unified`. No se documentan cambios estructurales en la arquitectura respecto al modelo base; la intervención se concentra en el ajuste fino sobre datos de codificación y en la corrección del campo de metadatos `context_length` a 262.144 tokens.

El entrenamiento es una destilación de dos fuentes de chain-of-thought sobre tareas de programación Python verificables (problemas algorítmicos a nivel de función con tests deterministas). La fuente principal son trazas de razonamiento reales generadas por Composer 2.5, ejecutadas contra los tests de cada tarea y filtradas para conservar únicamente las soluciones que pasan. La fuente auxiliar son trazas sintéticas de Fable 5 sobre los problemas que Composer 2.5 falló, re-derivando un razonamiento autoconsistente y una solución correcta, también validadas por ejecución. Ambas fuentes se etiquetan de forma separada en el dataset. No se especifican el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de código Python orientada a funciones y problemas algorítmicos, con solución ejecutable.
- Razonamiento explícito previo a la respuesta (modo thinking): análisis de casos límite, complejidad y enfoque antes de emitir código.
- Razonamiento de tipo chain-of-thought destilado de trazas verificadas por tests.
- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Ejecución local offline mediante llama.cpp, sin dependencia de API ni nube.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada para esta versión v1 (el autor las atribuye a la versión v2).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Asistente de código local y privado: el modelo puede ejecutarse íntegramente en una GPU de consumo con Q4_K_M (6,87 GB) y generar soluciones Python sin enviar código a servicios externos, lo que encaja en entornos con requisitos de confidencialidad.
- Resolución de problemas algorítmicos con razonamiento visible: útil para generar explicaciones paso a paso (casos límite, complejidad, enfoque) junto a la solución, aprovechando la destilación de chain-of-thought verificada por tests.
- Generación de funciones con tests asociados en pipelines de desarrollo: el modelo fue entrenado sobre tareas con tests deterministas, por lo que es adecuado para proponer implementaciones que se validarán automáticamente en CI.
- Autocompletado y refactorización en editores integrados vía llama.cpp: con Q3_K_M (5,7 GB) cabe en GPU de 8 GB y permite integración en plugins de editor que consuman un servidor local compatible con la API de llama.cpp.
- Procesamiento de repositorios o archivos largos: con 256K tokens de contexto y cuantizaciones altas en GPU de 24-32 GB, puede analizar múltiples archivos o módulos en una sola ventana para tareas de comprensión y modificación de código.
- Despliegue en Apple Silicon con memoria unificada: las cuantizaciones Q2_K a Q4_K_M permiten ejecutar el modelo en equipos con memoria unificada de 12-16 GB, con rendimiento inferior al de una GPU dedicada pero suficiente para uso interactivo.
- Base para fine-tuning propio: el maestro en safetensors (repo separado del autor) permite re-cuantizar a MLX o AWQ, o ajustar el modelo sobre dominios de código específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta versión v1 en la información disponible. La model card incluye una comparación de la versión v2 (no de v1) en tau2-bench `telecom` con cuantización Q8_0, que se reproduce a continuación únicamente como referencia del linaje, no de este modelo:

| tau2-bench telecom · Q8_0 | Score |
|---|---|
| official gemma-4-12B-it (base) | ~15% |
| v2 (agentic-fable5-composer2.5-v2) | ~55% |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks para el modelo objeto de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K 4,5 GB; Q3_K_M 5,7 GB; Q4_K_M 6,87 GB; Q6_K 9,11 GB; Q8_0 11,8 GB.
- Contexto máximo alcanzable según VRAM (con KV cache q8_0 y ~1,5 GB de overhead): 8 GB permite ~16K en Q2_K; 12 GB permite ~48K en Q2_K y ~30K en Q4_K_M; 16 GB permite ~80K en Q2_K y ~64K en Q4_K_M; 24 GB permite ~200K en Q2_K y ~128K en Q4_K_M; 32 GB alcanza los 256K en Q2_K, Q3_K_M y Q4_K_M.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la información proporcionada; el autor plantea el modelo para GPU de consumo desde 8 GB.
- Cabe en GPU de consumo: sí, desde 8 GB de VRAM con Q2_K o Q3_K_M; Q4_K_M es la opción recomendada por el autor para 8-16 GB.
- Memoria unificada: compatible con Apple Silicon e iGPU con memoria unificada, con rendimiento inferior a una GPU dedicada.
- Opciones de despliegue: llama.cpp (`llama-server`), requiriendo una build reciente que soporte la arquitectura `gemma4_unified`. No se mencionan vLLM, TGI, Ollama ni otras herramientas en la información proporcionada.
- Latencia y throughput: no disponible.
- Truco de contexto: cambiar el KV cache a `q4_0` duplica aproximadamente el contexto disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma4-12B-Coder v1 (este) | ~11,9B | 256K | Apache 2.0 | GGUF | Fine-tune de código con CoT verificado por tests |
| google/gemma-4-12B-it (base) | ~11,9B | 256K (tras corrección de metadatos) | Apache 2.0 | safetensors | Modelo generalista; el autor reporta ~15% en tau2-bench telecom Q8_0 |
| gemma-4-12B-agentic-fable5-composer2.5-v2 | no disponible | no disponible | no disponible | GGUF | Versión posterior del mismo autor, orientada a agentes y tool use; ~55% en tau2-bench telecom Q8_0 según la model card |

No se dispone de datos de benchmarks de esta versión que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste se realizó sobre tareas Python verificables; el rendimiento en otros lenguajes de programación o en código de producción a gran escala no está documentado.
- Repositorio sin validación externa: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia independiente de calidad.
- Riesgo de alucinación: como todo modelo generativo, puede producir APIs inexistentes o soluciones que parecen válidas; la validación por ejecución de tests es recomendable en producción.
- Trazas sintéticas: parte del entrenamiento proviene de razonamiento racionalizado por un segundo profesor, no de trazas reales, lo que puede introducir estilos de razonamiento inconsistentes.
- Metadatos de contexto: la corrección a 256K depende de haber descargado una versión re-parchada del GGUF; copias anteriores reportan 131K.
- Compatibilidad de herramientas: requiere una build reciente de llama.cpp con soporte de `gemma4_unified`; builds antiguas no cargarán el modelo.
- Idiomas: no se documenta el soporte multilingüe más allá del heredado del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-12B-it y de los datos de destilación, cuyos términos no se detallan.
- Sin datos de sesgos ni evaluaciones de seguridad en la información proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/gernblanksten/gemma-4-12B-coder-fable5-composer2.5-v1-GGUF
- Maestro en safetensors (autor): https://huggingface.co/yuxinlu1/gemma-4-12B-coder-fable5-composer2.5-v1
- Versión v2 (agentic): https://huggingface.co/yuxinlu1/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
