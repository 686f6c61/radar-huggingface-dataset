# DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-GGUF

## Resumen

DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-GGUF es el repositorio de cuantizaciones GGUF del modelo DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2, un ajuste fino de tipo QLoRA sobre el modelo base LFM 2.5 8B A1B de Liquid AI. Lo desarrolla DuoNeural (Aura, Archon y Jesse) y esta orientado a tareas de agente autonomo y generacion de codigo, con soporte explicito de function calling en formato XML/JSON. El repositorio actual solo contiene pesos GGUF listos para llama.cpp; los pesos BF16 originales y el adaptador LoRA viven en repositorios separados.

La propuesta tecnica se apoya en dos ejes. Por un lado, la arquitectura MoE del LFM 2.5 activa unos 1.500 millones de parametros por token sobre un total de 8.467.856.832, lo que permite velocidades de inferencia muy altas en hardware de gama media. Por otro, el autor aplica "abliteration" (eliminacion de los mecanismos de rechazo) y un ajuste orientado a agentes y codigo, de modo que el modelo no rechaza tareas de bajo nivel como programacion de kernel, analisis de memoria o ingenieria inversa.

Es relevante ahora porque combina dos tendencias: modelos MoE eficientes que caben en GPU de consumo y ajustes comunitarios "sin censura" enfocados a flujos agenticos. Sin embargo, el repositorio es muy reciente (creado el 18 de septiembre de 2026), acumula 0 descargas y 0 likes, y todas las cifras de rendimiento son autoevaluadas por el autor con muestras pequenas, por lo que deben tratarse como indicativas y no como validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre la base LFM 2.5 8B A1B de Liquid AI; el detalle interno de capas no se especifica en la informacion disponible |
| Parametros totales | 8.467.856.832 (~8,47 B, dato real de safetensors) |
| Parametros activos | ~1,5 B por token (segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 y BF16 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | liquid-foundation-model-community-license (campo `license: other`) |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en BF16/safetensors |

Datos adicionales del repositorio: tamano total de 44,1 GB, pipeline `text-generation`, libreria declarada `hermes`, fecha de creacion 2026-09-18 y ultima actualizacion 2026-09-18.

## Arquitectura y entrenamiento

El modelo es un MoE derivado de LFM 2.5 8B A1B de Liquid AI, con 8,47 B de parametros totales y aproximadamente 1,5 B activos por token. Esa relacion de activacion es la que explica las velocidades reportadas (352-360 tps en una RTX 4080 Super con Q4_K_M bajo `llama-server`, y 80-90 tps en una GTX 1070 Mobile con LM Studio). La model card no detalla el numero de expertos, el numero de capas, el mecanismo de atencion ni la composicion exacta del dataset de entrenamiento.

Sobre el entrenamiento, la informacion disponible indica un ajuste QLoRA (existe un repositorio de adaptador LoRA PEFT separado) aplicado sobre el modelo base, con un componente de "abliteration" que elimina los rechazos del alineamiento original de Liquid AI y un enfoque en capacidades agenticas y de codigo. El autor reporta haber corregido la anomalia de EOS/congelacion del modelo original (de una tasa de fallo del 50-70 % en cadenas de razonamiento complejas a 0 % en tres pruebas), aunque no se documenta la metodologia completa de ese ajuste ni el volumen de tokens utilizados.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline declarado `text-generation`).
- Generacion de codigo Python: el autor reporta 52,4 % Pass@1 en EvalPlus HumanEval y 57,9 % en MBPP (con variaciones segun la tabla consultada).
- Razonamiento matematico basico: 63,3 % en GSM8K sobre 30 muestras de prueba.
- Function calling y tool calling: la model card reporta 100 % (25/25) en una validacion AST de esquemas de herramientas en XML/JSON.
- Flujos agenticos y razonamiento multi-paso, orientado a bucles de agente autonomo.
- Modo "thinking": el autor menciona la transicion pensamiento-respuesta y la correccion de la anomalia de EOS en cadenas de razonamiento.
- Capacidad "abliterated": sin rechazos declarados en tareas de sistemas de bajo nivel, kernel en C, analisis de memoria y seguridad/reverse engineering.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible (el modelo se declara solo de generacion de texto).

## Casos de uso

- Agentes de codigo autonomos en local: con 1,5 B de parametros activos y cuantizacion Q4_K_M de 4,9 GB, el modelo puede ejecutar bucles agenticos multi-paso en una GPU de 8 GB mientras sintetiza y valida parches de codigo, apoyandose en el soporte declarado de function calling.
- Asistente de programacion en el IDE con tool calling: la validacion AST de esquemas XML/JSON permite conectarlo a herramientas externas (ejecucion de tests, busqueda en repositorios, linters) dentro de extensiones de editor que consuman llama.cpp.
- Generacion de tests y cobertura: dado su rendimiento declarado en EvalPlus (incluidas las variantes "+", con tests mutados y de casos limite), encaja en pipelines de CI/CD que generan casos de prueba adicionales sobre funciones Python existentes.
- Analisis de seguridad y reverse engineering: al estar abliterado, se puede emplear para auditar binarios, revisar kernel en C, analizar fugas de memoria o documentar exploits en entornos controlados, tareas en las que un modelo alineado tiende a rechazar.
- Automatizacion de tareas de bajo nivel en sistemas: generacion y revision de codigo en C de sistemas, scripts de gestion de memoria y utilidades de diagnostico, con ejecucion en hardware de gama media sin depender de la nube.
- Prototipado rapido en portatil: la matriz de cuantizaciones permite desplegar en una GTX 1070/1660 o en Apple Silicon de 8 GB, util para demos de agente sin infraestructura dedicada.
- Despliegue en el borde (edge): con ~80-90 tps en una GTX 1070 Mobile, es viable para asistentes locales que requieren baja latencia y no pueden enviar datos a un servicio externo.
- Base para nuevos ajustes: al existir repositorios separados de BF16 y de adaptador LoRA, sirve como punto de partida para experimentos de QLoRA adicionales sobre un modelo ya orientado a codigo y agentes.

## Benchmarks y rendimiento

Resultados autoevaluados por el autor (decodificacion greedy, zero-shot). La model card contiene dos tablas con cifras ligeramente distintas para MBPP y MBPP+; se reproducen tal cual, senalando la discrepancia.

| Benchmark | Muestras / rigor | v1 | v2 (reportado) |
|---|---|---|---|
| EvalPlus: HumanEval (base) | 164 problemas, zero-shot | no disponible | 52,4 % Pass@1 (86/164) |
| EvalPlus: HumanEval+ (extra) | 164 problemas, 80x inputs | no disponible | 46,3 % Pass@1 (76/164) |
| EvalPlus: MBPP (base) | 378 problemas, zero-shot | no disponible | 57,9 % (219/378) / 59,3 % (224/378) segun tabla |
| EvalPlus: MBPP+ (extra) | 378 problemas, tests extra | no disponible | 47,9 % (181/378) / 48,9 % (185/378) segun tabla |
| HumanEval zero-shot (sintesis) | 25 problemas, ejecucion directa | 75,0 % | 88,0 % Pass@1 (22/25) |
| Function calling Hermes (AST) | 25 esquemas XML/JSON | 100,0 % | 100,0 % (25/25) |
| GSM8K | 30 muestras | 60,0 % | 63,3 % |
| Anomalia EOS / congelacion | Prompts conversacionales | ~50-70 % de fallo | 0,0 % (0/3) |
| Abliteration (tareas de sistemas) | Kernel C, reverse engineering | 100 % sin censura | 100,0 % |

Comparacion con el modelo original (telemetria del autor):

| Metrica | LFM 2.5 8B A1B original | DuoNeural v2 |
|---|---|---|
| HumanEval zero-shot | ~40,0-44,0 % Pass@1 | 88,0 % (22/25) |
| EvalPlus HumanEval (base) | ~36,8 % Pass@1 | 52,4 % (86/164) |
| EvalPlus HumanEval+ (extra) | ~31,2 % Pass@1 | 46,3 % (76/164) |
| EvalPlus MBPP (base) | ~45,0 % Pass@1 | 59,3 % (224/378) |
| EvalPlus MBPP+ (extra) | ~38,1 % Pass@1 | 48,9 % (185/378) |
| Function calling (BFCL / AST) | 49,7 % | 100,0 % (25/25) |
| GSM8K | ~58,0 % | 63,3 % |
| Throughput (RTX 4080 Super) | ~380 tps | ~352-360 tps |

No se han publicado resultados de benchmarks independientes en la informacion disponible. La tabla comparativa "Direct Industry Benchmark Comparison (8B Parameter Class)" de la model card aparece truncada, por lo que no se incluyen sus cifras.

## Requisitos de hardware

- Q4_K_M (4,9 GB, VRAM ~6 GB): GTX 1070/1660, RTX 2060/3060, Apple Silicon con 8 GB o mas. Rendimiento reportado de ~80-90 tps en GTX 1070 Mobile (LM Studio) y ~352-360 tps en RTX 4080 Super (`llama-server`).
- Q5_K_M (5,7 GB, VRAM ~7 GB): mayor preservacion de logica; cabe en tarjetas de 8 GB.
- Q6_K (6,5 GB, VRAM ~8 GB): cuantizacion casi sin perdida para GPU de 8-12 GB.
- Q8_0 (8,4 GB, VRAM ~10 GB): RTX 3080/4070, Apple Silicon con 16 GB o mas.
- BF16 (16,0 GB, VRAM ~18 GB): referencia sin cuantizar; RTX 3090, 4080 o 4090.
- Despliegue: llama.cpp, `llama-server`, LM Studio, Ollama y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la informacion disponible para este repositorio.
- Latencia y throughput: solo se aportan las cifras anteriores, ambas medidas por el autor con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros (activos/totales) | Contexto | HumanEval (base) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoNeural LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2 | ~1,5 B / 8,47 B | no disponible | 52,4 % Pass@1 | liquid-foundation-model-community-license | GGUF, BF16 y LoRA en HuggingFace |
| LFM 2.5 8B A1B (stock, Liquid AI) | ~1,5 B / 8,3 B aprox. | no disponible | ~36,8 % Pass@1 (segun el autor) | liquida-foundation-model-community-license | safetensors y GGUF |
| Modelos densos de 7B/8B de la misma clase | 7-8 B densos | no disponible | la model card afirma que el v2 "iguala o supera" a densos de 7B/8B, pero la tabla esta truncada | variable | variable |

Los dos unicos modelos con datos comparables en la informacion disponible son el propio v2 y el LFM 2.5 8B A1B original. No hay cifras verificables de alternativas densas en el material proporcionado.

## Limitaciones y advertencias

- Modelo abliterado: los mecanismos de rechazo del alineamiento original han sido eliminados. Generara contenido operativo en dominios peligrosos (exploits, kernel, memoria) sin filtros, lo que exige controles externos si se despliega en produccion.
- Todas las metricas son autoevaluadas por el autor. No hay evaluacion independiente ni verificacion por terceros.
- Muestras pequenas en varias pruebas: 25 problemas en HumanEval zero-shot y 30 muestras en GSM8K, lo que reduce la significacion estadistica de esos porcentajes.
- Inconsistencia interna en la model card: MBPP aparece como 57,9 % en una tabla y 59,3 % en otra, y MBPP+ como 47,9 % y 48,9 %. No se aclara cual es la cifra correcta.
- Licencia `other` (liquid-foundation-model-community-license): las condiciones de uso comercial no se detallan en la informacion proporcionada; hay que consultar el enlace de licencia antes de usarlo en productos.
- Es un derivado de un modelo de Liquid AI; pueden aplicarse restricciones adicionales de la licencia original al ser un ajuste comunitario.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado el 18 de septiembre de 2026, por lo que no hay evidencia de uso en produccion ni de estabilidad a largo plazo.
- Longitud de contexto e idiomas soportados no disponibles: no se puede planificar el uso con documentos largos ni confirmar cobertura multilingue.
- Riesgo de alucinacion no cuantificado: no se han publicado datos de fidelidad factual ni de tendencia a inventar APIs en tareas de codigo.
- Los enlaces de busqueda web no devolvieron resultados relevantes sobre el modelo; no hay prensa, papers ni analisis externos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-GGUF
- Modelo base BF16: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2
- Adaptador LoRA PEFT: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-LoRA
- Licencia de la comunidad de Liquid AI: https://www.liquid.ai/community-license
