# balllvin/BS-0.5-Mini

## Resumen

BS-0.5-Mini es un adaptador LoRA de rango 16 (LoRA+) desarrollado por el usuario balllvin sobre el checkpoint `thinkingmachines/Inkling-2-Mini`, un modelo de lenguaje de tipo Mixture-of-Experts con 26,4B parametros totales y 5,4B parametros activos. El adaptador no es un modelo autonomo: modifica 312 modulos de atencion de texto y controladores de paso cruzado del modelo base mediante un entrenamiento GRPO (8 pasos de bootstrap) orientado a mejorar el comportamiento del modelo en tareas de codificacion agentica dentro de BS Code (`bscode`) y DeepSeek Harness en modo PTC (`run_code`).

La relevancia de esta publicacion es limitada y conviene ser explicitos: segun los propios datos del autor, el adaptador no supera al modelo base en la evaluacion sellada de 18 tareas. El modelo base resolvio 1 de 18 tareas (5,6%) y la "Wave 1" resolvio 0 de 18 (0,0%), con una tasa de llamadas a herramientas validas practicamente identica (92,9% frente a 92,8%). Se trata, por tanto, de un artefacto experimental de investigacion en una fase muy temprana, no de una mejora consolidada lista para produccion.

El interes tecnico real esta en el ecosistema que lo rodea: demuestra un flujo de trabajo de RL ligero (LoRA+ con GRPO) sobre un modelo MoE con expertos en NVFP4/MXFP8 sin tocar los pesos enrutados, y su integracion nativa tanto en CUDA via PEFT como en Apple Silicon via MLX + Metal 4. El adaptador pesa aproximadamente 50 MB y se fusiona en tiempo de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16, LoRA+) sobre transformer MoE (Inkling-2-Mini) |
| Parametros totales | Adaptador: ~50 MB (312 modulos); modelo base: 26,4B |
| Parametros activos | 5,4B (modelo base, MoE) |
| Longitud de contexto | no disponible (el modelo base reporta GraphWalks BFS 256K, lo que sugiere contexto de al menos 256K, sin confirmacion explicita) |
| Tipos de cuantizacion | Modelo base con expertos en NVFP4/MXFP8; adaptador en safetensors (BF16 al fusionar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT adapter) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `thinkingmachines/Inkling-2-Mini`, un modelo MoE con 26,4B parametros totales y 5,4B efectivos activos, con expertos enrutados en precision mixta NVFP4/MXFP8 y `num_passes=3`. BS-0.5-Mini es un LoRA de rango 16 con variante LoRA+ que afecta a 312 modulos: modulos de atencion de texto y controladores de paso cruzado. Los pesos del adaptador se fusionan en las capas de atencion y controladores en BF16, dejando intactos los expertos enrutados y el numero de pasos del modelo base, lo que permite ejecutarlo tanto en CUDA (via `PeftModel`) como en Apple Silicon (via `balllvin/Inkling-2-Mini-MLX`).

El entrenamiento emplea GRPO (Group Relative Policy Optimization) con 8 pasos de bootstrap, con `kl_ref` en el rango 0,00338–0,00529 y `pg_loss` en 0,00382–0,00821. Los diagnosticos de entrenamiento son reveladores: de 16 tareas muestreadas con `k=4` rollouts cada una, 15 cayeron en la banda de cero aprendizaje y 1 en saturacion, es decir, ninguna tarea quedo en la banda util de aprendizaje (1/4 a 2/4). El autor reconoce que las siguientes olas de RL deberian filtrar estrictamente hacia tareas de dificultad media resolubles entre 1/4 y 3/4 para obtener gradientes de senal positiva.

## Capacidades

- Generacion de texto en ingles y razonamiento general, heredados del modelo base Inkling-2-Mini.
- Codificacion agentica: reparacion de repositorios en C++, JavaScript, Python y Go (tareas EnvGen, Scale800 Go).
- Llamadas a herramientas (tool calling) con esquema estructurado: 246 de 265 llamadas validas en la evaluacion del adaptador.
- Soporte de agentes multi-paso y trabajo en equipo multi-agente (DAG de agentes), configurable con teamwork `on` u `off`.
- Integracion con DeepSeek Harness en modo PTC (`run_code`) y con BS Code (`bscode`).
- Capacidades de busqueda y razonamiento del modelo base (DeepSearchQA, BrowseComp, MCP Atlas, ARC-AGI), aunque no re-evaluadas sobre el adaptador.
- Capacidades multilingues: solo ingles declarado.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Reparacion automatica de repositorios en CI/CD: el adaptador esta entrenado sobre tareas de reparacion de repositorios C++/JS/Python (`tinyxml2`, `decimaljs`, `boltons`), por lo que puede integrarse en pipelines que detecten tests rotos y propongan parches con llamadas a herramientas de edicion y ejecucion.
- Agente de terminal para tareas de desarrollo: el modelo base reporta 71,6% en Terminal Bench v2.1; el adaptador esta disenado para operar en harness de ejecucion de codigo (`run_code`), lo que lo hace adecuado para automatizar tareas de shell acotadas.
- Orquestacion multi-agente: soporta configuracion de hasta 3 agentes (`max_agents 3`) con teamwork activado, util para descomponer tareas de reparacion en subtareas paralelas coordinadas por un DAG.
- Desarrollo local en Apple Silicon: con el runtime MLX alcanza 120,2 tok/s en modo single-agent y 335,5 tok/s agregados en decodificacion batcheada B=64, lo que permite usarlo como asistente de codigo en un Mac sin GPU dedicada.
- Prototipado de pipelines de RL: sirve como referencia reproducible de un ciclo GRPO + LoRA sobre MoE con precision mixta, util para equipos de investigacion que quieran replicar el flujo con sus propios datos.
- Evaluacion de agentes con herramientas: su tasa de llamadas validas (~93%) y cero llamadas repetidas lo hacen apropiado como sujeto de pruebas en bancos de evaluacion de agentes, no como solucion final.

## Benchmarks y rendimiento

Evaluacion sellada emparejada de BS Code (18 tareas retenidas):

| Metrica | Base (Inkling-2-Mini) | Wave 1 (BS-0.5-Mini) |
|---|---:|---:|
| Tareas resueltas | 1/18 (5,6%) | 0/18 (0,0%) |
| Llamadas a herramientas validas | 249/268 (92,9%) | 246/265 (92,8%) |
| Llamadas totales | 268 | 265 (-1,1%) |
| Llamadas repetidas | 0 (0,0%) | 0 (0,0%) |
| Errores de esquema | 19 (7,1%) | 19 (7,2%) |
| Tiempo de reloj | 173,9 s | 164,1 s (-5,6%) |

Referencia del modelo base (reportada por Thinking Machines Lab, no re-ejecutada sobre el adaptador):

| Benchmark | Resultado |
|---|---:|
| SWEBench Verified | 79,2% |
| SWEBench Pro v2 | 77,9% |
| Vibe Code Bench v1.1 | 77,9% |
| SWEBench Multilingual | 73,7% |
| Terminal Bench v2.1 | 71,6% |
| DeepSearchQA | 85,3% |
| MCP Atlas | 82,7% |
| BrowseComp | 79,0% |
| ARC-AGI v1 / v2 | 84,5% / 49,3% |
| GraphWalks BFS 256K | 69,7% |
| LongBench v2 | 66,9% |

Rendimiento en Apple Silicon (M5 Pro 64 GB, runtime MLX): 120,2 tok/s single-agent (B=1, MTP, T=0,0); 117,7 tok/s agregados con 4 agentes concurrentes (ctx=512); 335,5 tok/s agregados en decodificacion batcheada B=64. La fusion del adaptador en tiempo de carga tarda ~2,8 s sin sobrecoste en inferencia.

## Requisitos de hardware

- El adaptador por si solo no ejecuta inferencia: requiere cargar el modelo base completo (26,4B parametros totales, 5,4B activos).
- VRAM estimada: no disponible de forma explicita. Con expertos en NVFP4/MXFP8, un despliegue en BF16 completo seria inviable en GPU de consumo; se recomienda consultar los requisitos del checkpoint base.
- GPU recomendadas: NVIDIA A100/H100 para CUDA via PEFT; el autor no publica cifras de VRAM concretas.
- Apple Silicon: soportado nativamente via `balllvin/Inkling-2-Mini-MLX` con Metal 4; en Macs de 32 GB se recomienda `--no-mtp --cache-limit-gb 2.0`. En M1–M4 o macOS anterior a 26, usar `--skip-build`.
- Opciones de despliegue: PEFT + Transformers (CUDA), runtime `inkling-mlx` (Apple Silicon), servidor compatible con OpenAI en `127.0.0.1:8095/v1`. El autor menciona sglang como stack compatible sin detallar configuracion.
- Latencia y throughput: 120,2 tok/s single-agent en M5 Pro 64 GB; 164,1 s de tiempo de reloj en la evaluacion de 18 tareas (frente a 173,9 s del base).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| BS-0.5-Mini (este) | 26,4B totales / 5,4B activos + LoRA ~50 MB | no disponible | Apache 2.0 | Adaptador experimental; 0/18 tareas resueltas |
| thinkingmachines/Inkling-2-Mini | 26,4B totales / 5,4B activos | no disponible | no disponible | Modelo base; 1/18 tareas resueltas; SWEBench Verified 79,2% |
| balllvin/Inkling-2-Mini-MLX | 26,4B totales / 5,4B activos | no disponible | no disponible | Port a MLX + Metal 4 del mismo base, sin adaptador |

No se dispone de datos de benchmarks de terceros para establecer una comparacion con modelos de la misma categoria fuera del ecosistema Inkling-2-Mini.

## Limitaciones y advertencias

- El adaptador no mejora al modelo base en la evaluacion publicada: resuelve 0 de 18 tareas frente a 1 de 18 del base. No debe presentarse como una mejora de rendimiento.
- Entrenamiento con solo 8 pasos de GRPO y diagnosticos que muestran ausencia de tareas en la banda util de aprendizaje (15 de 16 en banda cero), lo que sugiere senal de entrenamiento practicamente nula.
- Solo soporta ingles de forma declarada.
- No se publican requisitos de VRAM ni limites de contexto explicitos para el adaptador.
- Riesgo de alucinacion y sesgos: no documentados por el autor; se heredan los del modelo base, no caracterizados en esta ficha.
- Dependencia estricta del ecosistema BS Code y DeepSeek Harness PTC; fuera de ese entorno su comportamiento no esta validado.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base (`thinkingmachines/Inkling-2-Mini`) tiene licencia no especificada en la informacion disponible; verificar antes de un despliegue comercial.
- Artefacto en fase "Wave 1 Candidate": no apto para produccion sin validacion adicional.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/balllvin/BS-0.5-Mini
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Port MLX del base: https://huggingface.co/balllvin/Inkling-2-Mini-MLX
- Repositorio BS Code: https://github.com/Balllvin/BS
- Runtime MLX: https://github.com/Balllvin/inkling-mlx
- DeepSeek Harness: `@deepseek-ai/dsh` (npm, sin URL directa en la informacion disponible)
