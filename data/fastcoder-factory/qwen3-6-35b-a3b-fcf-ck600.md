# fastcoder-factory/qwen3.6-35b-a3b-FCF-ck600

## Resumen

qwen3.6-35b-a3b-FCF-ck600 es un ajuste fino del modelo Qwen/Qwen3.6-35B-A3B, desarrollado por fastcoder-factory, orientado especificamente a la optimizacion de codigo. El modelo parte de una arquitectura Mixture-of-Experts (MoE) de 35.951.822.704 parametros totales, de los cuales aproximadamente 3.000 millones se activan por token, y ha sido especializado mediante aprendizaje por refuerzo GSPO con LoRA sobre 964 ejercicios de optimizacion de codigo (541 en Python y 423 en C++) generados con la propia herramienta FastCoder-Factory.

El problema que resuelve es concreto: no tanto escribir codigo nuevo, sino reescribir codigo existente para que sea mas rapido manteniendo su correccion funcional. Los resultados publicados muestran mejoras sustanciales frente al modelo base en benchmarks de optimizacion code-to-code (PolyBench Python: 95,3 % de correccion y 5,87x de speedup frente a 63,3 % y 4,09x del base), en generacion de codigo eficiente y en optimizacion a nivel de repositorio.

Es relevante porque demuestra que un ajuste fino con RL de bajo coste sobre un MoE abierto puede especializar de forma muy marcada un modelo ya capaz en una tarea de ingenieria concreta, manteniendo la misma arquitectura, tokenizer y plantilla de chat del modelo base, y sirviendose directamente en vLLM sin cambios. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (Gated DeltaNet + atencion) y torre de vision; familia qwen3_5_moe |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones por token (dato del modelo base) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 71,9 GB |
| Modalidad | image-text-to-text (entrada de imagen y texto) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Metodo de ajuste | GSPO con LoRA, adaptador fusionado en los pesos bf16 |
| Checkpoint | 600 |

## Arquitectura y entrenamiento

El modelo conserva integramente la arquitectura del base Qwen3.6-35B-A3B: un transformer Mixture-of-Experts con 35.000 millones de parametros totales y unos 3.000 millones activos por token, que combina capas de atencion con capas Gated DeltaNet (atencion lineal) y una torre de vision para entrada multimodal. El ajuste fino se aplico exclusivamente sobre las 40 capas de texto; ni la torre de vision ni la cabeza MTP (multi-token prediction) fueron adaptadas.

El entrenamiento consistio en aprendizaje por refuerzo GSPO (Group Sequence Policy Optimization) con LoRA de rango estabilizado (escala α/√r) y sin dropout. La configuracion de LoRA es heterogenea: rango 64 y α 4 en las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj), en las proyecciones Gated DeltaNet (in_proj_qkv, in_proj_z, out_proj) y en el experto compartido (gate_proj, up_proj, down_proj); rango 16 y α 2 en in_proj_a e in_proj_b de Gated DeltaNet; y rango 8 y α 4 en los expertos enrutados (gate_up_proj, down_proj). El conjunto de entrenamiento consta de 964 ejercicios de optimizacion de codigo (541 Python, 423 C++) generados con FastCoder-Factory, con 8 completaciones por prompt (64 por paso). El adaptador se fusiono en los pesos bf16 del modelo base mediante redondeo estocastico con semilla 850, documentado en merge_info.json. El resultado es un checkpoint unico sin adaptador separado, con el mismo tokenizer y plantilla de chat que el base.

## Capacidades

- Optimizacion code-to-code: reescritura de funciones y kernels existentes para reducir tiempo de ejecucion manteniendo la correccion funcional, en Python y C++.
- Generacion de codigo eficiente a partir de descripcion: produce implementaciones correctas y con buen rendimiento en tiempo de ejecucion (evaluado en EffiBench-X).
- Optimizacion a nivel de repositorio: modifica codigo en proyectos completos para mejorar rendimiento manteniendo los tests en verde (evaluado en GSO y SWE-fficiency Lite).
- Razonamiento y generacion de codigo general heredados del modelo base Qwen3.6-35B-A3B.
- Entrada multimodal image-text-to-text: la torre de vision del base se mantiene intacta, aunque no fue adaptada durante el ajuste.
- Conversacional: la plantilla de chat del modelo base se conserva sin cambios.
- Soporte de tool calling y de flujos agenticos: heredado del base, no documentado de forma especifica en la model card de este ajuste.
- Capacidades multilingues: no documentadas para este checkpoint.

## Casos de uso

- Optimizacion de kernels numericos en C++: el modelo reescribe bucles y funciones de computo intensivo (tipo PolyBench) para obtener speedups de 5x o superiores, adecuado porque fue entrenado especificamente sobre este tipo de ejercicios con RL y obtiene un 91,3 % de correccion en PolyBench C++.
- Aceleracion de scripts y pipelines de datos en Python: reescribe funciones de procesamiento para reducir tiempo de ejecucion (95,3 % de correccion y 5,87x de speedup en PolyBench Python), util en equipos que mantienen codigo cientifico o de analisis.
- Reduccion de coste computacional en servicios en produccion: dado un endpoint o funcion con latencia alta, el modelo propone una version equivalente mas rapida, con la ventaja de que su tasa de correccion en benchmarks code-to-code supera el 88 % en C++ y el 95 % en Python.
- Refactorizacion de repositorios con tests: en GSO y SWE-fficiency Lite el modelo mejora el rendimiento manteniendo los tests en verde (87,6 % en SWE-fficiency Lite), por lo que encaja en pipelines de CI que validan automaticamente cada cambio.
- Generacion de codigo eficiente desde especificacion: para equipos que necesitan implementaciones nuevas ya optimizadas (Pass@1 del 91,9 % en EffiBench-X en ambos lenguajes), en lugar de escribir primero y optimizar despues.
- Asistente interno de revision de rendimiento: integrado como servicio en vLLM, puede analizar pull requests y proponer parches de optimizacion sobre el codigo modificado, aprovechando la compatibilidad directa con el servidor estandar.
- Evaluacion comparativa de soluciones: usar el modelo para generar varias versiones optimizadas de una misma funcion y medir empiricamente cual es mas rapida, dado que su entrenamiento con 8 completaciones por prompt favorece la diversidad de propuestas.

## Benchmarks y rendimiento

Resultados publicados por el autor, media de 5 ensayos (3 para EffiBench-X) con error estandar. Las soluciones incorrectas cuentan como speedup 1x. En negrita, los casos en que los intervalos de error estandar de ambos modelos no se solapan.

| Benchmark | Metrica | Qwen3.6-35B-A3B | Este modelo |
|---|---|---|---|
| ParEval (C++) | Correctos (%) | 78,6 ± 1,8 | **88,5 ± 1,6** |
| ParEval (C++) | Speedup (x) | 3,32 ± 0,11 | **3,96 ± 0,19** |
| PolyBench (C++) | Correctos (%) | 69,3 ± 1,9 | **91,3 ± 1,7** |
| PolyBench (C++) | Speedup (x) | 3,88 ± 0,27 | **5,53 ± 0,38** |
| PolyBench (Python) | Correctos (%) | 63,3 ± 4,2 | **95,3 ± 0,8** |
| PolyBench (Python) | Speedup (x) | 4,09 ± 0,54 | **5,87 ± 0,40** |
| EffiBench-X (C++) | Pass@1 (%) | 89,7 ± 0,7 | **91,9 ± 0,4** |
| EffiBench-X (C++) | Runtime score (%) | 82,0 ± 0,8 | **83,3 ± 0,3** |
| EffiBench-X (Python) | Pass@1 (%) | 89,9 ± 0,5 | **91,9 ± 0,2** |
| EffiBench-X (Python) | Runtime score (%) | 85,8 ± 0,4 | **86,8 ± 0,1** |
| GSO | Tests superados (%) | 65,9 ± 1,0 | **72,4 ± 1,9** |
| GSO | Opt(base) (%) | 45,7 ± 2,0 | **55,7 ± 1,0** |
| GSO | Speedup (x) | 1,58 ± 0,07 | 1,68 ± 0,04 |
| SWE-fficiency Lite | Tests superados (%) | 80,2 ± 0,9 | **87,6 ± 0,6** |
| SWE-fficiency Lite | Speedup (x) | 3,78 ± 0,09 | **5,03 ± 0,17** |

Como referencia externa del modelo base, una fuente de busqueda web cita una puntuacion de 73,4 en SWE-bench Verified para Qwen3.6-35B-A3B; no se dispone del dato equivalente para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los pesos ocupan aproximadamente 71,9 GB, por lo que se necesitan del orden de 75-80 GB de VRAM (o reparto entre varias GPU) para cargar el modelo sin cuantizar, mas la cache KV.
- Cuantizacion: el autor no publica versiones GGUF ni cuantizaciones oficiales; al ser un MoE de 35.000 millones de parametros, las cuantizaciones de 4 bits reduciran el peso a unos 18-20 GB, pero requeririan conversion propia.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 en una sola tarjeta; configuraciones multi-GPU (por ejemplo 2x A100 40 GB o 2x RTX 4090 24 GB) para reparto de pesos.
- GPU de consumo: no cabe en una unica GPU de consumo en bf16; con cuantizacion a 4 bits podria intentarse en una RTX 4090 (24 GB), aunque no esta documentado ni validado por el autor.
- Despliegue: el autor indica que sirve directamente en vLLM sin cambios respecto al base; tambien es compatible con transformers. No se documentan opciones como llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| qwen3.6-35b-a3b-FCF-ck600 | 35,9 B | ~3 B | no disponible | Optimizacion de codigo (RL GSPO + LoRA) | Apache 2.0 |
| Qwen/Qwen3.6-35B-A3B | ~35 B | ~3 B | no disponible | Modelo generalista agentico y de codigo | Apache 2.0 |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion natural y documentada es contra su modelo base: mismo tamano, misma arquitectura y misma licencia, pero con una mejora sistematica en correccion y speedup en tareas de optimizacion de codigo. No se dispone en la informacion proporcionada de datos de otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- El ajuste esta especializado en optimizacion de codigo; el autor no documenta efectos sobre capacidades generales, por lo que no hay garantia de que el rendimiento en tareas ajenas a la optimizacion se mantenga identico al base.
- La torre de vision y la cabeza MTP no fueron adaptadas; el comportamiento multimodal es el del modelo base sin modificaciones, y no se ha evaluado tras el ajuste.
- Los benchmarks son autoinformados por el autor y con pocas repeticiones (5 ensayos, 3 en EffiBench-X); deben interpretarse con cautela.
- El conjunto de entrenamiento es reducido (964 ejercicios) y generado sinteticamente con FastCoder-Factory, lo que puede introducir sesgos hacia los patrones de esos ejercicios y limitar la generalizacion a otros dominios de codigo.
- Riesgo de alucinacion inherente a los modelos de lenguaje: las optimizaciones propuestas pueden ser incorrectas o semanticamente distintas del original; es imprescindible validar con tests.
- No se documentan los idiomas soportados ni el contexto maximo de este checkpoint; se asume el del modelo base, pero no esta confirmado en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.6-35B-A3B, tambien Apache 2.0 segun los datos disponibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastcoder-factory/qwen3.6-35b-a3b-FCF-ck600
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Analisis de Qwen3.6-35B-A3B: https://codex.danielvaughan.com/2026/04/16/qwen36-35b-a3b-local-agentic-coding-breakthrough/
