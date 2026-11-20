# IsValorum/Qwen3.8-Flash-Coder-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Qwen3.8-Flash-Coder APEX-I-MiniPlus-V2.1 GGUF es una cuantizacion GGUF de un modelo experimental de la familia Qwen, derivada del checkpoint intermedio `Jab1718/qwen3.8-flash-coder-85gb-bf16`. El autor de la cuantizacion es IsValorum, que aplica una asignacion tensor a tensor (denominada APEX-I-MiniPlus V2.1) sobre una arquitectura MoE hibrida de 42.620.341.120 parametros totales. El objetivo declarado es comprimir el modelo hasta un envelope de 21,77 GB (3,45 BPW) preservando la fidelidad de enrutamiento de los expertos y permitiendo ejecutar el contexto completo de 256K en estaciones de trabajo con 24 GB de VRAM.

El modelo base es un *slice* experimental creado con la herramienta `moe-slice`: de los 512 expertos enrutados originales se podaron permanentemente 352, dejando 160 expertos. La calibracion de la poda se hizo exclusivamente sobre datasets de Python en ingles y SWE-bench, por lo que el resultado es un especialista de codigo agentico en ingles con degradacion severa en conversacion general y en otros idiomas. El autor advierte explicitamente de que se trata de una pre-release experimental y de que el autor upstream aun no ha publicado la pasada de fine-tuning de recuperacion.

La relevancia actual del release es doble: por un lado, demuestra una tecnica de cuantizacion selectiva que mantiene los *router gates* en F32 sin comprimir y logra un delta de perplexidad de solo +0,17 % respecto a BF16 en WikiText-2; por otro, explora el limite practico de ejecutar un MoE de 42,6B parametros con 256K de contexto en hardware de consumo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrida: 48 capas (36 lineales SSM DeltaNet + 12 de atencion completa dispersa), 160 expertos enrutados |
| Parametros totales | 42.620.341.120 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (segun la model card) |
| Tipos de cuantizacion | GGUF APEX-I-MiniPlus V2.1 a 3,45 BPW (21,77 GB); variantes NanoPlus a 2,90 BPW (18,34 GB) y BF16 de referencia a 16,00 BPW (85,30 GB) |
| Idiomas soportados | en (unicamente ingles; degradacion severa en otros idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida de 48 capas que combina 36 capas lineales basadas en SSM DeltaNet con 12 capas de atencion completa dispersa, y una capa MoE con 160 expertos enrutados. El checkpoint original contaba con 512 expertos; la herramienta `moe-slice` podo 352 de forma permanente, calibrando la seleccion exclusivamente contra datasets de Python en ingles y SWE-bench. Los *router gates* (`ffn_gate_inp`, `ffn_gate_inp_shexp`) se mantienen en F32 sin comprimir para evitar deriva de enrutamiento entre los 160 expertos restantes.

La cuantizacion APEX-I-MiniPlus V2.1 asigna bits de forma diferenciada tensor a tensor: los tensores criticos para el razonamiento y el enrutamiento reciben mayor precision, mientras que los tensores menos sensibles se comprimen mas agresivamente. El autor declara el uso de una matriz de importancia (imatrix) para guiar la asignacion. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset original ni si hubo fases de RLHF o DPO; la model card no los detalla.

## Capacidades

- Generacion de codigo en Python e ingles: completado, refactorizacion y correccion, calibrado especificamente contra SWE-bench.
- Razonamiento agentico multi-paso orientado a tareas de ingenieria de software.
- Tool calling y function calling en el contexto de flujos agenticos de codigo.
- Modo de razonamiento con *reasoning effort* configurable mediante una plantilla de chat endurecida incluida por el autor.
- Contexto largo de hasta 256K tokens, lo que permite manejar repositorios completos o trazas de agente extensas.
- Capacidades multilingues: no disponibles de forma fiable; el modelo degrada severamente fuera del ingles.
- Vision, audio y otras modalidades: no disponibles.

## Casos de uso

- Reparacion automatica de bugs en CI/CD: el modelo puede recibir el diff, los tests fallidos y el contexto del repositorio en una ventana de 256K tokens, proponer un parche y validarlo contra la suite de pruebas dentro de un pipeline agentico.
- Agente de refactorizacion de codebases: con 256K de contexto puede ingerir varios ficheros Python simultaneamente y aplicar cambios coherentes entre modulos, usando tool calling para leer y escribir ficheros.
- Asistente de completado en IDE: la variante NanoPlus (18,34 GB, 2,90 BPW) permite desplegar el modelo en una sola GPU de consumo con latencia aceptable para autocompletado en linea.
- Generacion de tests unitarios: a partir de una funcion o modulo, el modelo produce casos de prueba en Python; su calibracion sobre SWE-bench favorece este tipo de tarea.
- Analisis de trazas de error y logs: la ventana de 256K permite volcar logs extensos de un fallo de produccion y pedir al modelo un diagnostico con propuesta de parche.
- Evaluacion de parches en entornos aislados: integrado via `llama-server` con tool calling, puede operar como agente SWE en un sandbox que ejecute los tests y devuelva el resultado al modelo para iterar.
- Migracion de codigo entre versiones de librerias: el modelo puede procesar el codigo fuente y la documentacion de la API destino en una sola ventana y generar la migracion.

## Benchmarks y rendimiento

La model card proporciona mediciones de perplexidad en WikiText-2 y comparaciones de calidad entre cuantizaciones, no resultados en benchmarks de tareas (MMLU, HumanEval, GSM8K, SWE-bench).

| Especificacion | Tamano en disco | Huella en RAM/VRAM | BPW medio | Perplejidad WikiText-2 | Delta PPL vs BF16 |
|---|---|---|---|---|---|
| BF16 de referencia | 85,30 GB (79,44 GiB) | 79,44 GiB | 16,00 | 30,0975 +/- 0,1200 | Baseline (0,00 %) |
| APEX-I-MiniPlus V2.1 | 21,77 GB (20,27 GiB) | 20,27 GiB | 3,45 | 30,1495 +/- 1,0089 | +0,0520 (+0,17 %) |
| APEX-I-NanoPlus | 18,34 GB (17,08 GiB) | 17,08 GiB | 2,90 | 34,4199 +/- 1,1591 | +4,3224 (+14,36 %) |
| Q4_K_M plano estandar | 28,39 GB | 26,44 GiB | 4,50 | aprox. 30,28 - 30,38 | +0,18 a +0,28 (+0,7 %) |
| Q3_K_M plano estandar | 22,22 GB | 20,69 GiB | 3,44 | aprox. 30,55 - 30,95 | +0,45 a +0,85 (+2,1 %) |
| APEX Mini generico (IQ2_S) | 17,73 GB | 16,51 GiB | 2,50 | aprox. 31,60 - 33,10 | +1,50 a +3,00 (+7,5 %) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, SWE-bench) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 20,27 GiB para la variante MiniPlus V2.1; 17,08 GiB para NanoPlus; 79,44 GiB para BF16.
- GPU recomendadas: RTX 3090, RTX 4090 y RTX 5090 (24 GB o mas) para la variante MiniPlus; A100 80 GB o H100 para BF16.
- Cabe en GPU de consumo: si, la variante MiniPlus en GPUs de 24 GB con offload parcial a RAM del sistema; la model card la presenta como capaz de ejecutar el contexto completo de 256K en 24 GB de VRAM.
- Opciones de despliegue: `llama.cpp` (`llama-server`) y LM Studio. No es compatible con Strata Engine, que requiere el monolito de 512 expertos y las tablas PLE de 51B.
- Latencia y throughput: la model card incluye una seccion de benchmarks de throughput y offload para RTX 30/40/50 y streaming desde RAM, pero los valores concretos no se han incluido en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Coder APEX-I-MiniPlus V2.1 | 42,62B totales | 256K | Apache 2.0 | GGUF 3,45 BPW | Especialista de codigo en ingles; MoE podado a 160 expertos |
| Qwen3.8-Flash-Coder APEX-I-NanoPlus | 42,62B totales | 256K | Apache 2.0 | GGUF 2,90 BPW | Misma base, mayor compresion y mayor perdida de perplejidad (+14,36 %) |
| Qwen3.8-Flash-Coder-85GB BF16 | 42,62B totales | 256K | Apache 2.0 | GGUF 16,00 BPW | Referencia sin compresion; requiere 80 GB de VRAM |
| Modelo base `Jab1718/qwen3.8-flash-coder-85gb-bf16` | 42,62B totales | no disponible | no disponible | safetensors (BF16) | Checkpoint intermedio experimental con 512 expertos antes de la poda |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas con modelos de otras familias.

## Limitaciones y advertencias

- Modelo experimental de pre-release: el autor upstream no ha publicado la pasada de fine-tuning de recuperacion tras la poda de 352 expertos.
- Solo ingles: la model card advierte de degradacion severa y texto roto en espanol, frances, aleman y otros idiomas, asi como en conversacion general.
- Especializado exclusivamente en codigo: no es adecuado para tareas generales de lenguaje natural ni para chat abierto.
- La poda de expertos se calibro solo contra Python y SWE-bench, por lo que el rendimiento en otros lenguajes de programacion no esta garantizado.
- Riesgo de alucinacion en APIs y funciones: como todo modelo de codigo, puede inventar firmas de funciones o metodos inexistentes.
- La model card incluye un aviso critico sobre sintaxis de codigo y *repeat penalty*: valores inadecuados pueden provocar intercambio de caracteres en la salida.
- Incompatible con Strata Engine; requiere `llama.cpp` estandar o LM Studio.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y la degradacion multilingue desaconsejan su uso en produccion sin evaluacion previa.
- El delta de perplejidad reportado (+0,17 %) corresponde a WikiText-2, no a tareas de codigo; la fidelidad en SWE-bench tras la cuantizacion no esta medida en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-APEX-I-MiniPlus-V2.1-GGUF
- Variante NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-APEX-I-NanoPlus-GGUF
- Referencia BF16: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-85GB-BF16-GGUF
- Modelo base: https://huggingface.co/Jab1718/qwen3.8-flash-coder-85gb-bf16
- Apoyo al autor: https://ko-fi.com/isvalorum
