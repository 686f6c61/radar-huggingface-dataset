# fastcoder-factory/gpt-oss-20b-FCF-ck400

## Resumen

gpt-oss-20b-FCF-ck400 es un ajuste fino del modelo abierto gpt-oss-20b de OpenAI, publicado por el usuario fastcoder-factory en Hugging Face. El modelo parte de los pesos en bf16 del repositorio unsloth/gpt-oss-20b-BF16 y aplica un entrenamiento con aprendizaje por refuerzo GSPO (Group Sequence Policy Optimization) mediante LoRA sobre 958 ejercicios de optimizacion de codigo (533 en Python y 425 en C++) generados con la herramienta FastCoder-Factory. El checkpoint publicado corresponde al paso 400 del entrenamiento, con el adaptador LoRA ya fusionado en los pesos base mediante redondeo estocastico (semilla 400).

El objetivo del ajuste es mejorar la capacidad del modelo base para optimizar codigo ya existente (code-to-code optimization) y para generar codigo eficiente a partir de una descripcion, manteniendo intacta la arquitectura, el tokenizador y la plantilla de chat del modelo original. Segun la model card, el modelo sirve directamente en vLLM sin modificaciones adicionales.

La relevancia de esta ficha radica en que documenta un caso concreto de especializacion mediante RL sobre un modelo abierto de tipo MoE, con resultados medidos en benchmarks de optimizacion de codigo (ParEval, PolyBench, EffiBench-X, GSO y SWE-fficiency Lite) y con una licencia Apache 2.0 que facilita su reutilizacion. No obstante, la informacion publica disponible es limitada: no se detallan los idiomas soportados ni el pipeline, y el numero de descargas y likes es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (hereda la de openai/gpt-oss-20b); LoRA fusionado en todas las capas |
| Parametros totales | no disponible (heredados de gpt-oss-20b; no se especifican en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base; no se explicita) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; compatible con vLLM) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, pesos fusionados; libreria transformers) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base openai/gpt-oss-20b, un transformer con mezcla de expertos (MoE), sin cambios en tokenizador ni plantilla de chat. El ajuste se realizo con LoRA estandar (escala α/r, sin dropout) sobre las 24 capas del modelo, adaptando las proyecciones de atencion q_proj, k_proj, v_proj y o_proj con rango 16 y α 32, y las proyecciones de expertos gate_up_proj y down_proj (en los 32 expertos) con el mismo rango y α. El router no fue adaptado. El adaptador se fusiono posteriormente en los pesos bf16 del base mediante redondeo estocastico con semilla 400, y el resultado se publica como checkpoint 400.

El entrenamiento empleo aprendizaje por refuerzo GSPO sobre 958 ejercicios de optimizacion de codigo generados con FastCoder-Factory, con 8 completions por prompt (64 por paso) y un esfuerzo de razonamiento medio durante el entrenamiento. La evaluacion reportada se realizo con esfuerzo de razonamiento alto. No se detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o DPO mas alla del GSPO descrito.

## Capacidades

- Generacion de codigo a partir de descripciones en Python y C++, con enfasis en eficiencia de ejecucion (benchmarks EffiBench-X).
- Optimizacion de codigo existente (code-to-code): reescritura de funciones y bucles para reducir tiempo de ejecucion manteniendo la correccion (ParEval, PolyBench).
- Optimizacion a nivel de repositorio: modificacion de proyectos completos para mejorar rendimiento y pasar tests (GSO, SWE-fficiency Lite).
- Razonamiento con esfuerzo configurable (reasoning effort medium durante entrenamiento, high en evaluacion), heredado del modelo base.
- Compatibilidad con vLLM de forma directa, segun la model card.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (aunque el base gpt-oss-20b lo soporta, no se confirma para este ajuste).
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Optimizacion de funciones Python en produccion: el modelo puede recibir una funcion existente y devolver una version mas rapida; en PolyBench (Python) alcanza un speedup medio de 7,27× frente a 5,69× del base, lo que lo hace adecuado para refactorizaciones puntuales de cuellos de botella.
- Optimizacion de kernels y bucles en C++: con un 96,3% de correccion en ParEval (C++) y speedup de 4,56×, es util para acelerar rutinas de calculo numerico en proyectos con tests de correccion.
- Generacion de codigo eficiente desde especificacion: en EffiBench-X (Python) obtiene un Pass@1 del 89,4% y un runtime score del 85,3%, por lo que sirve para generar implementaciones nuevas con requisitos de rendimiento.
- Optimizacion a nivel de repositorio en pipelines de CI: en SWE-fficiency Lite pasa tests en el 64,6% de los casos con speedup de 4,92×, lo que permite integrarlo como paso de mejora de rendimiento con validacion automatica de tests.
- Asistente de revision de rendimiento en entornos de desarrollo: puede analizar fragmentos de codigo y proponer alternativas mas eficientes, aprovechando su entrenamiento especifico en optimizacion y su plantilla de chat compatible con el base.
- Automatizacion de tareas de refactorizacion en C++ y Python: con 958 ejercicios de entrenamiento repartidos entre ambos lenguajes, es adecuado para tareas de reescritura acotadas y verificables mediante tests, no para generacion libre de codigo sin validacion.

## Benchmarks y rendimiento

Los resultados publicados en la model card se midieron con esfuerzo de razonamiento alto, media de 5 ensayos (3 en EffiBench-X) ± error estandar. Las soluciones incorrectas cuentan como speedup 1×. En negrita, los casos en que los intervalos de error estandar de ambos modelos no se solapan.

| Benchmark | Metrica | gpt-oss-20b | Este modelo |
|---|---|---|---|
| ParEval (C++) | Correct (%) | 82,7 ± 1,8 | **96,3 ± 0,3** |
| ParEval (C++) | Speedup (×) | 3,84 ± 0,18 | **4,56 ± 0,09** |
| PolyBench (C++) | Correct (%) | 78,7 ± 1,3 | **92,7 ± 1,9** |
| PolyBench (C++) | Speedup (×) | 4,75 ± 0,30 | 4,95 ± 0,07 |
| PolyBench (Python) | Correct (%) | 89,3 ± 1,9 | **92,7 ± 1,2** |
| PolyBench (Python) | Speedup (×) | 5,69 ± 0,22 | **7,27 ± 0,26** |
| EffiBench-X (C++) | Pass@1 (%) | 88,0 ± 1,0 | 89,1 ± 0,2 |
| EffiBench-X (C++) | Runtime score (%) | 81,1 ± 1,1 | **83,1 ± 0,2** |
| EffiBench-X (Python) | Pass@1 (%) | 87,3 ± 0,7 | **89,4 ± 0,0** |
| EffiBench-X (Python) | Runtime score (%) | 82,0 ± 0,9 | **85,3 ± 0,0** |
| GSO | Tests pass (%) | 61,2 ± 3,3 | **67,5 ± 2,2** |
| GSO | Opt_base (%) | 36,9 ± 3,2 | 40,8 ± 1,4 |
| GSO | Speedup (×) | 1,38 ± 0,04 | 1,43 ± 0,01 |
| SWE-fficiency Lite | Tests pass (%) | 57,8 ± 1,2 | **64,6 ± 0,7** |
| SWE-fficiency Lite | Speedup (×) | 3,17 ± 0,19 | **4,92 ± 0,32** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al heredar la arquitectura MoE de gpt-oss-20b y publicarse en bf16, requiere un volumen de memoria proporcional al tamano del base (no confirmado en la informacion).
- GPU recomendadas: no disponible en la model card; se indica compatibilidad con vLLM, lo que sugiere GPUs de datacenter (A100, H100) o consumer de gama alta, pero sin cifras concretas.
- Cabe en GPU consumer: no disponible.
- Opciones de despliegue: vLLM (confirmado por el autor); otras opciones como llama.cpp, Ollama o TGI no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b-FCF-ck400 | no disponible | no disponible | ParEval C++ 96,3% correcto; PolyBench Python 7,27× speedup | Apache 2.0 | Hugging Face, 0 descargas |
| openai/gpt-oss-20b (base) | no disponible | no disponible | ParEval C++ 82,7% correcto; PolyBench Python 5,69× speedup | Apache 2.0 | Hugging Face |
| fastcoder-factory/gpt-oss-20b-fastcoder-python | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita al modelo base y a otro ajuste del mismo autor, ya que no se dispone de datos de benchmarks de alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un ajuste sobre gpt-oss-20b, hereda los sesgos del base, no cuantificados aqui.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en tareas de optimizacion de codigo, el riesgo se mitiga con tests, pero no se reportan tasas de error semantico.
- Limitaciones de contexto e idioma: no disponibles; solo se confirman Python y C++ como lenguajes de entrenamiento.
- El entrenamiento se realizo sobre 958 ejercicios generados con FastCoder-Factory, lo que puede limitar la generalizacion a dominios o estilos de codigo no representados.
- El checkpoint publicado es el paso 400; no se documenta si es el mejor checkpoint ni se comparan otros pasos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base gpt-oss-20b tiene sus propios terminos que deben verificarse.
- El modelo tiene 0 descargas y 0 likes, sin validacion independiente de la comunidad.
- El pipeline no esta disponible, lo que puede complicar la integracion automatica en algunos entornos.

## Enlaces

- Hugging Face: https://huggingface.co/fastcoder-factory/gpt-oss-20b-FCF-ck400
- Modelo base en Hugging Face: https://huggingface.co/openai/gpt-oss-20b
- Pesos bf16 de partida: https://huggingface.co/unsloth/gpt-oss-20b-BF16
- Otro ajuste del mismo autor: https://huggingface.co/fastcoder-factory/gpt-oss-20b-fastcoder-python
