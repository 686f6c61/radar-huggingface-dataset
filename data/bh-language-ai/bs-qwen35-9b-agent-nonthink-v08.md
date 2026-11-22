# BH-Language-AI/bs-qwen35-9b-agent-nonthink-v08

## Resumen

LUMI-9B v08 (GAMA) es un adaptador LoRA publicado por BH-Language-AI sobre el modelo base Qwen/Qwen3.5-9B (Apache-2.0). Su objetivo declarado es preservar el comportamiento de agente y de llamada a herramientas (tool calling) del modelo base y, al mismo tiempo, mejorar el rendimiento en bosnio (variante ijekavica) y en el seguimiento de instrucciones. El adaptador se entrenó el 22 de noviembre de 2026 en LUMI-G (EuroHPC), utilizando 8 aceleradores AMD MI250X.

El modelo se distribuye exclusivamente como adaptador PEFT (LoRA con r64, alpha 128, `all-linear` y sin LM head), no como pesos completos. El repositorio ocupa 0,8 GB y requiere cargar el modelo base Qwen3.5-9B para su uso. Está orientado a generación de texto conversacional, con especial énfasis en el ecosistema lingüístico bosnio-croata-serbio (bs, hr, sr) junto con inglés.

Su relevancia actual radica en que cubre un nicho poco atendido: agentes con tool calling en lenguas eslavas del sur, con una licencia permisiva (Apache-2.0) y métricas internas publicadas que muestran mejoras en bosnio y en tool bench respecto al modelo base, aunque con retrocesos medidos en matemáticas (GSM8K) e instrucciones (IFEval).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-9B) con adaptador LoRA (PEFT); LoRA r64, alpha 128, `all-linear`, sin LM head |
| Parametros totales | 9B en el modelo base; el adaptador LoRA no declara recuento propio de parametros |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | bs, hr, sr, en |
| Licencia | Apache-2.0 (tanto base como adaptador) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B, un transformer de 9.000 millones de parametros, mediante LoRA con rango 64, alpha 128, configuracion `all-linear` y sin adaptar la LM head. El entrenamiento consta de dos fases: la fase 1 parte del modelo previo v06 (Qwen3.5-9B con merge de SFT/DPO/PDV), y la fase v08 se entrena sobre ese punto de partida con una mezcla denominada mix8x de 116.377 filas y 34,4 millones de tokens. La composicion incluye IFEval (30k), GSM8K (5k), tulu (5k), grupos de tareas propias (agentic-terminal, function-calling, bosnian-core, rag-memory) y un behavior set con contexto de herramientas repetido cinco veces (3.700 ejemplos con 16 herramientas y reglas en el system prompt que cubren ambiguedad, rechazo, no-tool, confirmacion, high-level y seguridad), mas un replay del modelo v06 repetido seis veces.

El entrenamiento se ejecuto con learning rate 5e-6 durante 1.200 pasos sobre 4xMI250X (el anuncio menciona LUMI-G con 8xMI250X en la cabecera y 4xMI250X en la descripcion de la fase). El adaptador esta disenado para un dialecto XML especifico de tool calling: `<tool_call>{"name": "ALAT", "arguments": {...}}</tool_call>`, formato sobre el que el modelo fue entrenado explicitamente. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa u otras) mas alla del ajuste LoRA.

## Capacidades

- Generacion de texto conversacional multi-turno en bosnio, croata, serbio e ingles.
- Tool calling / function calling con dialecto XML propio (`<tool_call>...`), incluyendo seleccion de herramienta, precision de argumentos, multiples herramientas y argumentos anidados.
- Comportamiento agentico: recuperacion de errores, gestion de ambiguedad, rechazo correcto, confirmacion y preferencias de alto nivel.
- Seguimiento de instrucciones (IFEval) y razonamiento matematico basico (GSM8K), aunque con rendimiento inferior al modelo base y al v06 en estas areas.
- Memoria y RAG dentro de tareas agenticas (grupo `rag-memory` en el dataset de entrenamiento).
- Capacidades multilingues limitadas a bs, hr, sr y en.
- El modelo base Qwen3.5-9B se carga mediante `AutoModelForImageTextToText`, lo que sugiere soporte multimodal en la base, aunque el adaptador no declara capacidades de vision propias.

## Casos de uso

- Atencion al cliente en bosnio, croata o serbio: el adaptador mantiene el comportamiento de tool calling del modelo base y mejora el rendimiento en bosnio (79,1 % en BS golden frente a 74,4 % del base), lo que lo hace util para asistentes conversacionales que consultan sistemas internos mediante herramientas.
- Agentes de automatizacion con function calling: el 98,6 % en tool bench (71/72) y el 100 % en seleccion de herramienta, precision de argumentos y multi-tool permiten integrarlo en pipelines que encadenan varias llamadas a APIs.
- Asistentes de terminal o agentes de operaciones: el grupo de tareas `agentic-terminal` del entrenamiento sugiere uso en automatizacion de shell y tareas de sistema con confirmacion y recuperacion de errores.
- Sistemas RAG con memoria: el grupo `rag-memory` y el behavior set con contexto de herramientas permiten construir asistentes documentales que deciden cuando llamar a una herramienta de busqueda y cuando responder directamente.
- Flujos con gestion de ambiguedad y rechazo: las categorias `ambiguity_handling`, `refusal_correctness` y `safety` del entrenamiento lo hacen adecuado para asistentes que deben pedir aclaracion o rechazar peticiones inseguras (aunque la ambiguedad es su punto mas debil, con un 75 %).
- Traduccion y generacion de contenido en eslavo del sur: la mejora en bosnio ijekavica respecto al base lo hace util para redaccion y adaptacion de contenidos en bs/hr/sr.
- Prototipado rapido de agentes en investigacion: al ser un adaptador LoRA de 0,8 GB sobre una base Apache-2.0, permite experimentar con bajo coste de almacenamiento y sin restricciones de licencia comercial.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos con el mismo harness:

| Metrica | v08 (este adaptador) | v06 (previa) | Qwen3.5-9B base |
|---|---|---|---|
| BS golden (43) | 79,1 % | 72,1 % | 74,4 % |
| EN golden (30) | 96,7 % | 93,3 % | 96,7 % |
| Tool bench (72) | 98,6 % (71/72) | 100,0 % | 97,2 % |
| GSM8K strict | 0,845 | 0,925 | 0,790 |
| IFEval prompt-strict | 0,730 | 0,795 | 0,830 |
| BS-Eval v1 (400) | ~71 % (medido en un brazo relacionado) | 72,0 % | 72,5 % |

Desglose por categoria del tool bench (v08): tool_selection 100, argument_accuracy 100, high_level_preference 100, refusal_correctness 100, safety 100, no_tool_correctness 100, multi_tool 100, nested_arguments 100, error_recovery 100, multi_turn 100 y ambiguity_handling 75.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo de 9B, la huella depende de la cuantizacion del modelo base (el adaptador anade una fraccion minima sobre los pesos base).
- GPU recomendadas: el entrenamiento se realizo en AMD MI250X (LUMI-G, EuroHPC); no se publican recomendaciones de inferencia.
- Ajuste en GPU de consumo: no confirmado en la informacion proporcionada; un modelo de 9B suele requerir cuantizacion para caber en GPUs de consumo, pero no hay datos especificos para este adaptador.
- Opciones de despliegue: la model card solo documenta carga mediante `transformers` (`AutoModelForImageTextToText`) y `peft` (`PeftModel`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LUMI-9B v08 (este) | 9B (base) + LoRA | no disponible | Apache-2.0 | Especializado en bs/hr/sr + agent/tool calling; 79,1 % BS golden, 98,6 % tool bench |
| Qwen3.5-9B (base) | 9B | no disponible | Apache-2.0 | Referencia generalista; 74,4 % BS golden, 97,2 % tool bench, 0,830 IFEval |
| LUMI-9B v06 (previa) | 9B (base) + LoRA | no disponible | Apache-2.0 | Version anterior; 72,1 % BS golden, 100 % tool bench, 0,925 GSM8K, 0,795 IFEval |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (agentes multilingues en eslavo del sur) en la documentacion proporcionada.

## Limitaciones y advertencias

- GSM8K (0,845) e IFEval (0,730) son inferiores al v06 (0,925 y 0,795) y al modelo base en IFEval (0,830); el autor recomienda usar v06 para matematicas y el base o v06 para instrucciones.
- La aritmetica sobre importes monetarios no es fiable (4/14 en el eval BA-ERP sobre v06); se recomienda anadir una capa determinista para calculos financieros.
- `ambiguity_handling` es la categoria mas debil del tool bench (75 %, 3/4), lo que puede provocar respuestas erroneas ante peticiones ambiguas.
- Los conjuntos de evaluacion son pequenos (43, 30, 72 y 200 ejemplos), por lo que diferencias de 1-2 casos son ruido estadistico.
- La procedencia de los datos de entrenamiento no esta auditada en su totalidad (mezcla de conjuntos publicos como tulu-3, IFEval-personas y GSM8K con conjuntos internos); para uso comercial debe consultarse `DATA_PROVENANCE`.
- Riesgo de sesgos y alucinaciones: no documentado especificamente en la informacion disponible; aplican los riesgos generales del modelo base.
- El adaptador requiere el modelo base Qwen3.5-9B y no funciona de forma autonoma; el formato de tool calling esperado es el dialecto XML especifico del entrenamiento.
- Idiomas soportados limitados a bs, hr, sr y en; no se declara soporte para espanol ni otras lenguas.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bs-qwen35-9b-agent-nonthink-v08
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
