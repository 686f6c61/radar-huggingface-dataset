# krush420/gpt-oss-120b-sre-lora

## Resumen

`krush420/gpt-oss-120b-sre-lora` es un adaptador LoRA (PEFT) entrenado sobre el modelo abierto `openai/gpt-oss-120b`, un transformer con arquitectura de mezcla de expertos (MoE) de 116,8 mil millones de parametros totales y 5,1 mil millones activos por token. Lo desarrolla el usuario `krush420` como parte del ecosistema KruschStack, un stack de herramientas MCP (39 herramientas, 7 pilares) orientado a auditoria de codigo y remediacion de bugs en entornos de site reliability engineering (SRE). El adaptador ocupa un repositorio de 0,1 GB y se distribuye bajo licencia Apache 2.0.

El problema que aborda es la auditoria profunda de repositorios multi-fichero: el adaptador ha sido ajustado con 17.899 trayectorias generadas y verificadas mediante AST y tests unitarios, con el objetivo de producir hallazgos citados de forma literal (`file:startLine-endLine`), refutacion de falsos positivos y criterios de convergencia tipo `CLEAN_PASS`. Dentro de la arquitectura KruschStack se posiciona como el "teacher" de alta VRAM (`L2.5`) que alimenta por destilacion al modelo local de 30B (`krush420/qwen3-coder-30b-sre-lora`) a traves de un enrutador en cascada.

Es relevante ahora porque demuestra un patron de especializacion barata: un adaptador de 0,1 GB sobre un MoE abierto de gran tamano para tareas de ingenieria muy concretas, servible con vLLM en modo multi-LoRA o con Ollama mediante el `Modelfile` incluido. No se han publicado datos de benchmark ni de evaluacion cuantitativa en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; el adaptador es LoRA (PEFT) sobre `openai/gpt-oss-120b` |
| Parametros totales | 116,8 B en el modelo base; tamano del adaptador no disponible (repo de 0,1 GB) |
| Parametros activos | 5,1 B |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | QLoRA para el entrenamiento; MXFP4 (etiqueta del autor); pesos del adaptador en safetensors; `Modelfile` para Ollama |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + `Modelfile` de Ollama |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/gpt-oss-120b`, un modelo MoE con 116,8 B de parametros totales y 5,1 B activos por token. El ajuste es un LoRA (con QLoRA y cuantizacion MXFP4 en la pipeline de entrenamiento, segun las etiquetas del autor) usando `transformers` y `trl`. El resultado es un delta de pesos de bajo rango que requiere cargar el modelo base completo para la inferencia.

El dataset de entrenamiento es `krush420/sovereign-code-audit-sft`, con 17.899 trayectorias. Segun la model card, esas trayectorias se generaron, anclaron con AST y verificaron contra suites de tests unitarios (`node:test` / `pytest`, codigo de salida 0) a traves del ecosistema MCP de KruschStack. El autor declara tres componentes de entrenamiento: remediaciones "golden" multi-fichero (etiquetadas como `argon_golden_remediations`) preparadas con `krusch-harness` y validadas contra tests en vivo; auditorias de codigo en 11 fases con rejection sampling elitista (`elitist_120b_teacher`) usando herramientas de AST y grafo de dependencias (`search_symbols`, `dependency_graph`, `read_blob`); y un "zero-leak portability gate" que elimina IPs privadas, hostnames internos, rutas de usuario y credenciales para que el adaptador generalice a repositorios ajenos. No se detalla la composicion exacta del dataset, el numero de tokens vistos ni si hubo fases de RLHF/DPO posteriores al SFT.

## Capacidades

- Generacion de texto y razonamiento tecnico orientado a codigo, con enfasis en auditoria de repositorios y analisis de causa raiz multi-fichero.
- Remediacion de bugs: generacion de parches multi-fichero que el autor declara verificados contra suites de tests unitarios.
- Citas verificables: produce referencias literales en formato `file:startLine-endLine` para cada hallazgo.
- Refutacion de falsos positivos: capacidad entrenada para marcar explicitamente `NOT FLAGGED` sobre sospechas no confirmadas.
- Convergencia controlada: criterio de parada `CLEAN_PASS` cuando no quedan hallazgos, orientado a evitar auditorias infinitas.
- Integracion con tool calling mediante MCP: el adaptador esta entrenado sobre el uso de 39 herramientas anotadas del stack KruschStack (busqueda de simbolos, grafo de dependencias, lectura de blobs, memoria de trabajo, harness 2PC).
- Soporte de flujos agente multi-paso: lectura de contexto, propuesta de diff, aplicacion en dos fases (2PC) y validacion.
- Capacidades multilingues: no disponible (no declaradas en la model card).
- Vision, audio y modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Auditoria de codigo en CI/CD: ejecutar el adaptador sobre un diff o un repositorio completo para obtener hallazgos citados por fichero y linea, con criterio de parada `CLEAN_PASS`, integrado como paso previo al merge.
- Analisis de causa raiz multi-fichero: cuando un test falla en produccion, el modelo recorre el grafo de dependencias (`dependency_graph`) y localiza el origen del fallo en lugar de limitarse al fichero que lanza la excepcion.
- Remediacion automatica con validacion: generar un parche, aplicarlo en dos fases mediante `krusch-harness` y confirmar con la suite de tests (`node:test` o `pytest`) antes de aceptar el cambio.
- Teacher para destilacion: usar este adaptador como modelo de alta capacidad que genera trayectorias de calidad para reentrenar el modelo local de 30B (`krush420/qwen3-coder-30b-sre-lora`), reduciendo el coste de anotacion.
- Revision de seguridad y deuda tecnica en monorepos: auditorias de 11 fases con refutacion de falsos positivos, utiles para equipos SRE que reciben mucho ruido de linters y SAST.
- Asistente de guardia (on-call): consultas sobre un repositorio concreto con memoria de trabajo persistida entre turnos, apoyandose en las herramientas de contexto y de sistema de ficheros del stack.
- Estandarizacion de practicas de revision: al estar "scrubbed" de datos privados, el adaptador puede desplegarse en repositorios de empresa sin arrastrar informacion interna del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, SWE-bench ni de resolucion de issues, y tampoco se aportan metricas de tasa de exito en las auditorias o en la aplicacion de parches.

## Requisitos de hardware

- VRAM estimada en bf16: el modelo base tiene 116,8 B de parametros; a 2 bytes por parametro el peso ronda los 234 GB, por lo que requiere agregado de varias GPU (por ejemplo 4x H100 80 GB o 8x A100 40 GB). Estimacion propia, no publicada por el autor.
- VRAM estimada en MXFP4 (4 bits): aproximadamente 60-65 GB de pesos, mas overhead de KV cache y activaciones; encaja en 1x H100 80 GB o, con margen ajustado, en 2x A100 40 GB. Estimacion propia.
- GPU consumer: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) con el modelo base completo; solo seria viable con offload a RAM/CPU, con latencia muy degradada. No hay datos de rendimiento publicados.
- Despliegue: `transformers` + `peft` (ejemplo incluido en la model card), vLLM en modo multi-LoRA (`vllm serve openai/gpt-oss-120b` con el adaptador), y Ollama mediante el `Modelfile` incluido (`ollama create gpt-oss-sre:120b -f Modelfile`). No se documenta soporte de TGI ni de llama.cpp para este adaptador.
- Latencia y throughput: no disponible. La model card solo menciona una latencia de enrutado del componente `krusch-cascade-router` (<25 microsegundos), que no es la latencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `krush420/gpt-oss-120b-sre-lora` | 116,8 B (base) + adaptador LoRA | 5,1 B | no disponible | Auditoria de codigo y remediacion SRE | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| `openai/gpt-oss-120b` (base) | 116,8 B | 5,1 B | no disponible en la informacion | Proposito general, sin ajuste SRE | no disponible en la informacion | HuggingFace (modelo base referenciado) |
| `krush420/qwen3-coder-30b-sre-lora` (student) | 30 B (base `Qwen/Qwen3-Coder-30B-A3B-Instruct`) | no disponible | no disponible | Misma tarea, tier local de menor VRAM | no disponible en la informacion | HuggingFace (adaptador companion) |

No se han identificado en la informacion proporcionada otros adaptadores de auditoria de codigo directamente comparables; los datos de rendimiento relativos entre estas tres opciones no estan publicados.

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador LoRA que exige descargar y cargar el modelo base `openai/gpt-oss-120b` (mas de 200 GB en bf16), lo que condiciona cualquier despliegue.
- Ausencia total de evaluacion publicada: sin benchmarks ni metricas de tasa de exito en parches, la calidad declarada (tests en verde, refutacion de falsos positivos) no es verificable de forma independiente.
- Sesgo de dominio: el entrenamiento se centra en auditoria y remediacion dentro del stack KruschStack; fuera de ese harness (herramientas MCP, formato de citas `file:startLine-endLine`, criterios `CLEAN_PASS` / `NOT FLAGGED`) el adaptador puede degradarse frente al modelo base.
- Dependencia de herramientas: parte de la capacidad depende de que el entorno exponga las herramientas MCP del stack; sin ellas, el formato de salida esperado puede no reproducirse.
- Riesgo de alucinacion: en tareas de auditoria el fallo tipico es inventar lineas, ficheros o APIs inexistentes; las citas literales mitigan pero no eliminan este riesgo, y requieren validacion automatica en produccion.
- Idiomas no declarados: no hay garantia documentada de calidad en castellano ni en otros idiomas distintos del ingles tecnico predominante en el dataset.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por terceros.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia y las condiciones del modelo base `openai/gpt-oss-120b` deben verificarse por separado antes de desplegar en produccion.
- Fechas incoherentes: la model card indica creacion en 2026-10-23, dato que conviene confirmar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/krush420/gpt-oss-120b-sre-lora
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Dataset de entrenamiento: https://huggingface.co/datasets/krush420/sovereign-code-audit-sft
- Adaptador companion (student 30B): https://huggingface.co/krush420/qwen3-coder-30b-sre-lora
- Repositorio KruschStack: https://github.com/kruschdev/krusch-stack
- Repositorio Jean SRE: https://github.com/kruschdev/Jean-SRE-by-kruschdev
- Enrutador en cascada: https://github.com/kruschdev/krusch-cascade-router
- Paper, blog o demo oficial: no disponible
- Los resultados de busqueda web proporcionados no contenian enlaces relevantes al modelo.
