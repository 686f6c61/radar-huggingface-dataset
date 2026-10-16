# lapadatbogdan/GLM-5.3-Flash-REAP144-Coder-GGUF

## Resumen

GLM-5.3-Flash-REAP144-Coder es una version podada y cuantizada del modelo MoE zai-org/GLM-5.3-Flash (321B-A18B), publicada por el usuario lapadatbogdan. El autor aplica REAP (expert pruning) sobre las sesiones reales de codificacion agentica para conservar 144 de los 288 expertos por capa, con lo que el modelo pasa de 321B parametros totales y ~18B activos a 161.099.129.758 parametros totales y ~17B activos (321B-A18B se convierte en 161B-A17B). El objetivo declarado es ejecutar codificacion agentica en un PC domestico, algo inviable con el modelo completo.

El modelo se distribuye exclusivamente en formato GGUF con cinco variantes de cuantizacion (Q4_K_M, Q3_K, IQ2_S, IQ2_XXS y una Q8 de referencia) y una matriz de importancia (imatrix) calibrada con las mismas sesiones agenticas. Un bloque MTP (multi-token prediction) de 2,6 GB, extraido del modelo completo, permite decodificacion especulativa en configuraciones de dos o mas GPUs con el runtime Maya.

Es relevante ahora porque demuestra que el podado de expertos guiado por tareas reales puede reducir a la mitad el peso de un MoE de gran tamano manteniendo la tasa de exito en tareas de codificacion agentica en Python (48/48 intentos resueltos en Q4_K_M y Q3_K). El propio autor advierte de una limitacion grave: la calibracion se hizo solo con sesiones agenticas en Python, por lo que fuera de ese dominio el modelo pierde razonamiento general, falla en aritmetica simple y entra en bucles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con podado de expertos (REAP); hereda el bloque MTP del modelo base para decodificacion especulativa |
| Parametros totales | 161.099.129.758 (~161B) |
| Parametros activos | ~17B (A17B); el modelo base es 321B-A18B |
| Longitud de contexto | No disponible como maximo oficial. El ejemplo de llama.cpp usa `-c 131072`; la evaluacion agentica se hizo con contexto de 384K y las pruebas de velocidad a 32K |
| Tipos de cuantizacion | Q4_K_M, Q3_K, IQ2_S, IQ2_XXS, Q8 (referencia en la tabla de perplejidad) y bloque MTP en Q2_K (expertos) + Q8_0 (resto) |
| Idiomas soportados | No disponible. El modelo esta calibrado para codigo Python; el autor anuncia una futura version calibrada con 21 lenguajes de programacion |
| Licencia | MIT |
| Formato de pesos | GGUF (ficheros partidos en 2 o 3 partes; imatrix) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer con mezcla de expertos (MoE) de 321B parametros totales y ~18B activos, con 288 expertos por capa. El proceso de este repositorio no es un reentrenamiento, sino un podado: se seleccionan 144 de los 288 expertos de cada capa mediante REAP, usando como criterio sesiones reales de codificacion agentica. El resultado conserva 161B parametros totales con ~17B activos, aproximadamente la mitad del peso del original y un 22% menos de perplejidad de codigo respecto al modelo completo (2,053 frente a 1,681 en Q8 sobre 22K tokens de codigo no visto, es decir +22,1%).

Sobre el modelo podado se aplica cuantizacion con matriz de importancia (imatrix) derivada de las mismas sesiones agenticas. El repositorio incluye ademas un bloque MTP de 2,6 GB (`GLM-5.3-Flash-REAP144-Coder-MTP.gguf`), que es el bloque de prediccion multi-token propio de GLM-5.3-Flash, con los 288 expertos de borrador en Q2_K y el resto en Q8_0. Ese bloque se engancha con Maya en configuraciones de dos o mas GPUs para decodificacion especulativa: una tarjeta redacta el siguiente token mientras las demas terminan el actual. La tasa de coincidencia medida del borrador con el siguiente token del modelo es de ~70% sobre 568 posiciones de una sesion agentica real con tronco IQ2_XXS (los expertos de borrador Q2_K a Q6_K dieron entre 68% y 71%). El autor no ha medido la ganancia de velocidad de este mecanismo en este modelo; como referencia, Maya reporta para el modelo completo un paso de 14,1 a 21,0 tok/s en 4x Tesla T4 (+49%).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre etapas de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto y codificacion agentica en Python: resolucion de tareas reales de repositorio con edicion de ficheros y ejecucion de tests.
- Ejecucion de sesiones agenticas largas: hasta 200 turnos por intento en la evaluacion del autor, con contexto de 384K.
- Edicion de codigo y uso de herramientas dentro de bucles agenticos (el modelo esta disenado para integrarse en agentes; el repositorio incluye un harness de evaluacion propio).
- Capacidades de razonamiento general: degradadas de forma explicita segun el autor; puede fallar en aritmetica simple (por ejemplo, 17 x 23) y entrar en bucles en preguntas generales.
- Soporte de tool calling / function calling: no documentado de forma explicita en la informacion disponible.
- Capacidades multilingues: no disponibles. El autor advierte de que el modelo entra en bucles con otros lenguajes de programacion distintos de Python.
- Capacidad especial: bloque MTP para decodificacion especulativa en configuraciones multi-GPU con Maya.

## Casos de uso

- Codificacion agentica en Python sobre repositorios reales: es el unico dominio para el que el autor recomienda el modelo. Las variantes Q4_K_M y Q3_K resolvieron 48 de 48 intentos sobre 30 tareas de repositorios Python reales (ansible, openlibrary, qutebrowser), con 2 intentos por tarea y 200 turnos maximos por intento.
- Ejecucion local en PC domestico con GPU de consumo: con IQ2_XXS (45,3 GB) el modelo cabe en 24 GB de VRAM mas 32 GB de RAM, lo que permite mantener un agente de codigo en local sin enviar codigo a servicios externos.
- Refactorizacion y correccion de bugs con contexto largo: el ejemplo oficial de llama.cpp arranca con `-c 131072`, y la evaluacion uso 384K de contexto, suficiente para cargar modulos completos y trazas de test en una sola sesion.
- Pasar tests como criterio de aceptacion en un pipeline de CI: el harness del autor exige que los tests pasen en un entorno limpio; el modelo puede integrarse en un bucle que ejecute la suite, lea los fallos y edite el codigo hasta que pase.
- Automatizacion de tareas repetitivas de mantenimiento de repositorios Python: actualizacion de dependencias, ajuste de APIs obsoletas y pequenas migraciones, con el modelo operando sobre el arbol de ficheros mediante llamadas a herramientas.
- Servidor de inferencia multiusuario en hardware de gama alta: con Q4_K_M (97,6 GB) en 24 GB de VRAM + 96 GB de RAM, o 128 GB de memoria unificada, se puede levantar un `llama-server` o Maya que atienda varias sesiones de agente en paralelo.
- Decodificacion especulativa en estaciones con dos o mas GPUs: anadiendo el bloque MTP de 2,6 GB y Maya, se puede reducir la latencia de generacion en despliegues multi-GPU, siempre que el caso de uso siga siendo codificacion agentica en Python.
- Pruebas de concepto de podado de expertos: el repositorio de GitHub publica receta, mascaras, parches y harness de evaluacion, por lo que sirve como referencia metodologica para aplicar REAP a otros MoE.

## Benchmarks y rendimiento

Evaluacion agentica del autor: 30 tareas reales de repositorio Python (ansible, openlibrary, qutebrowser), 2 intentos por tarea, los tests deben pasar, entorno limpio, 200 turnos y 384K de contexto. Todas las filas corresponden a los mismos 48 intentos (se excluyen 4 tareas: 3 que ningun modelo resuelve y 1 inestable, y 4 intentos que agotaron el limite de 12 horas por intento en algun modelo).

| Variante | Tamano | Estado | Encaje (VRAM GPU + RAM) | Resueltas (48 intentos) | Turnos vs completo |
|---|---|---|---|---|---|
| Q4_K_M | 97,6 GB (3 partes) | estable | 24 + 96, 32 + 96, 128 GB unificada | 48/48 | x1,58 |
| Q3_K | 71,4 GB (2 partes) | estable | 24 + 64, 32 + 64 | 48/48 | x1,80 |
| IQ2_S | 54,8 GB (2 partes) | estable | 32 + 32 al limite, 24 + 48+ | 45/48 | x1,83 |
| IQ2_XXS | 45,3 GB | experimental | 24 + 32 | 39/48 | x2,77 |
| GLM-5.3-Flash completo, Q8 | 341 GB | - | - | 48/48 | x1,00 |

Perplejidad sobre ~22K tokens de codigo no visto (11 fragmentos de 2048), `llama-perplexity` de llama.cpp, mismo fichero para todas las variantes:

| Modelo | PPL | vs completo |
|---|---|---|
| GLM-5.3-Flash completo (Q8) | 1,681 | - |
| REAP144 Q8 | 2,053 | +22,1% |
| REAP144 Q4_K_M | 2,062 | +22,7% |
| REAP144 Q3_K | 2,091 | +24,4% |
| REAP144 IQ2_S | 2,174 | +29,3% |
| REAP144 IQ2_XXS | 2,303 | +37,0% |

Velocidad medida por un probador de la comunidad: RTX 4090 (24 GB) + 64 GB DDR5-4800, i9-14900K, PCIe 4.0, Windows 11, Maya v1.1.9 tras `--calibrate`, contexto 32K.

| Fichero | Generacion | Procesado de prompt (2K / 8K tokens) |
|---|---|---|
| IQ2_XXS | 35,9 tok/s | 1441 / 2564 tok/s |
| IQ2_S | 29,9 tok/s | 1092 / 2382 tok/s |
| Q3_K | 20,4 tok/s | 792 / 2184 tok/s |

Medicion del autor con IQ2_XXS y Maya sobre RX 7900 XTX 24 GB + 32 GB DDR4-2133, i7-7700K, PCIe 3.0: ~16 tok/s de generacion y ~950 tok/s de procesado de prompt. La calibracion anadio entre un 16% (IQ2_XXS) y un 50% (Q3_K) de velocidad de generacion en el equipo con RTX 4090.

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- IQ2_XXS (45,3 GB): minimo 24 GB de VRAM + 32 GB de RAM. Es la unica variante que cabe en esa configuracion; el autor la marca como experimental.
- IQ2_S (54,8 GB): 24 GB de VRAM + 48 GB de RAM o mas, o 32 + 32 GB al limite. Recomendada por el autor si se dispone de 24 + 48 GB o mas.
- Q3_K (71,4 GB): 24 GB de VRAM + 64 GB de RAM, o 32 + 64 GB.
- Q4_K_M (97,6 GB): 24 GB de VRAM + 96 GB de RAM, 32 + 96 GB, o 128 GB de memoria unificada.
- Modelo completo de referencia (Q8, 341 GB): no cabe en hardware de consumo; se incluye solo como comparativa.
- GPU validadas en las mediciones publicadas: RTX 4090 (24 GB) y RX 7900 XTX (24 GB) para las variantes de 2 bits; el autor menciona ademas 4x Tesla T4 y configuraciones con dos tarjetas AMD para el modelo completo con MTP.
- Cabe en GPU de consumo: si, con reparto de expertos entre VRAM y RAM del sistema (`--n-cpu-moe` en llama.cpp o el reparto automatico de Maya).
- Opciones de despliegue documentadas: llama.cpp (probado en el commit `79e2e74`) mediante `llama-server`, y Maya (`--backend hip` en AMD), con `huggingface_hub` para la descarga. vLLM, TGI y Ollama no aparecen documentados en la informacion disponible.
- Decodificacion especulativa: requiere el bloque MTP de 2,6 GB y dos o mas GPUs con Maya; con una sola GPU el fichero MTP no aporta nada.
- Throughput y latencia medidos: 35,9 tok/s de generacion y 1441-2564 tok/s de procesado de prompt con IQ2_XXS en RTX 4090 + 64 GB DDR5-4800; 16 tok/s y 950 tok/s en RX 7900 XTX + 32 GB DDR4-2133. La penalizacion de trabajo respecto al modelo completo es de x1,58 turnos en Q4_K_M hasta x2,77 en IQ2_XXS.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | PPL en codigo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-REAP144-Coder (este) | 161B | ~17B | 131.072 en llama.cpp; 384K en evaluacion | 2,062 (Q4_K_M) | MIT | GGUF en HuggingFace, 5 cuantizaciones + MTP |
| GLM-5.3-Flash completo | 321B | ~18B | no disponible | 1,681 (Q8) | no disponible en la informacion | safetensors; GGUF de terceros |
| REAP144 Q8 (misma poda, sin cuantizar) | 161B | ~17B | no disponible | 2,053 | MIT | referenciado en la tabla de perplejidad, sin ficha propia en los datos disponibles |
| huihui-ai/Huihui-GLM-5.3-Flash-abliterated-GGUF | 321B | no disponible | no disponible | no disponible | no disponible | GGUF en HuggingFace, etiquetado como image-text-to-text |

Frente al modelo completo, este repositorio reduce el peso a la mitad (161B frente a 321B) y conserva la tasa de exito en la evaluacion agentica en Python (48/48 en Q4_K_M y Q3_K), a cambio de un coste de +22% a +37% en perplejidad de codigo segun la cuantizacion y de entre 1,58 y 2,77 veces mas turnos de agente. Las comparativas con alternativas fuera de la familia GLM-5.3-Flash no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Aviso critico del autor (15 de octubre de 2026): la calibracion se hizo exclusivamente con sesiones de codificacion agentica en Python. Fuera de ese dominio el modelo pierde razonamiento general, puede equivocarse en aritmetica simple (el propio autor cita 17 x 23) y suele entrar en bucles con otros lenguajes de programacion y con preguntas generales, en todas las cuantizaciones, incluida Q8. Hasta la publicacion de una nueva version calibrada con sesiones agenticas mixtas, codigo en 21 lenguajes y matematicas, debe usarse solo para codificacion agentica en Python.
- IQ2_XXS esta marcada como experimental. Su debilidad no es solo la tasa de exito (39/48) sino el modo de fallo: no llega a editar, repite el mismo comando en bucle o sigue explorando hasta el limite de 200 turnos. Necesita unas 2,8 veces mas turnos que el modelo completo. Un protector antbucle en el agente no mejoro el resultado (27/37 frente a 30/37 en los mismos intentos).
- Degradacion de calidad por el podado y la cuantizacion: la perplejidad en codigo sube entre un 22,1% (Q8) y un 37,0% (IQ2_XXS) respecto al modelo completo.
- Riesgo de alucinacion: no se documenta de forma especifica, pero la perdida de razonamiento general descrita por el autor implica un riesgo alto de respuestas incorrectas fuera del dominio de codificacion Python.
- Limitaciones de contexto: no se publica la longitud de contexto maxima oficial. El ejemplo de llama.cpp usa 131.072 tokens y la evaluacion 384K, pero no hay garantia de calidad en todo ese rango.
- Limitaciones de idioma: no hay lista de idiomas soportados. El propio aviso indica que otros lenguajes de programacion provocan bucles.
- Licencia: el repositorio declara MIT. No se especifica en la informacion disponible la licencia del modelo base zai-org/GLM-5.3-Flash, por lo que conviene verificarla antes de un uso comercial en produccion.
- Dos de las cinco cuantizaciones anunciadas (Q4_K_M y Q3_K) resuelven las 48 pruebas, pero con un coste de entre 1,58 y 1,80 veces mas turnos de agente que el modelo completo, lo que se traduce directamente en mas tiempo y mas coste de computo por tarea.
- La decodificacion especulativa con el bloque MTP solo funciona con Maya y con dos o mas GPUs; su ganancia real de velocidad en este modelo no ha sido medida por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lapadatbogdan/GLM-5.3-Flash-REAP144-Coder-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio con receta, mascaras, parches y harness de evaluacion: https://github.com/lapadatbogdan/GLM-5.3-Flash-REAP144-Coder
- Grafico de resultados de tareas agenticas resueltas: https://raw.githubusercontent.com/lapadatbogdan/GLM-5.3-Flash-REAP144-Coder/main/assets/results.svg
- Runtime Maya (reparto de expertos entre GPU y RAM, decodificacion especulativa con MTP): https://github.com/mw00/project-maya
- Modelos cuantizados del base GLM-5.3-Flash en HuggingFace: https://huggingface.co/models?other=base_model:quantized:zai-org/GLM-5.3-Flash
- Variante abliterated de terceros: https://huggingface.co/huihui-ai/Huihui-GLM-5.3-Flash-abliterated-GGUF
