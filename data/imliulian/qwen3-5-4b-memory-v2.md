# IMLIULIAN/qwen3.5-4b-memory-v2

## Resumen

Qwen3.5-4B-Memory-V2 es un ajuste fino derivado de Qwen/Qwen3.5-4B, desarrollado por el usuario IMLIULIAN, especializado en dos tareas concretas dentro de pipelines de memoria para agentes locales: extraccion estructurada de hechos (fact extraction) y admision/revision de hechos antes de su escritura en almacenamiento (pre-write fact admission). El modelo no pretende ser un asistente generalista, sino un componente de infraestructura que produce JSON estricto y verificable a partir de segmentos de evidencia.

El modelo parte de una base de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y se entrena mediante PEFT LoRA con rango 16 y alpha 32, generando un adaptador de 81 MB que se distribuye junto con pesos completos en formato GGUF (Q8_0 y Q4_K_M) y safetensors. Su relevancia actual reside en que aborda un problema practico de los sistemas de memoria para agentes: la mayoria de modelos pequenos fallan al emitir JSON valido y al distinguir fechas de registro de fechas efectivas de eventos, lo que contamina las bases de conocimiento locales.

La licencia Apache 2.0 y la disponibilidad de cuantizaciones compactas (2,71 GB en Q4_K_M) lo hacen desplegable en hardware de consumo, y viene acompanado del motor de memoria ZeroMem, que integra el modelo mediante Ollama y expone un servidor MCP con cuatro herramientas. Los idiomas declarados son chino (zh) e ingles (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3.5-4B), ajuste fino PEFT LoRA (r=16, alpha=32) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 (4,48 GB) y Q4_K_M (2,71 GB); adaptador LoRA en safetensors (81,0 MB) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA), GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,2 mil millones de parametros. Sobre esa base se aplica un ajuste fino supervisado mediante PEFT LoRA con rango 16 y alpha 32, que produce un adaptador de 81 MB. El entrenamiento se orienta a dos subtareas: extraccion de hechos atomicos con esquema JSON estricto, identificadores de evidencia a nivel de segmento (s0, s1, ...) y separacion entre fecha de registro y fecha efectiva del evento; y auditoria de hechos candidatos contra los segmentos de evidencia originales, emitiendo veredictos por slot (pass, revise, drop, hold) con reemplazos concisos para errores definidos.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible. La innovacion destacable no reside en la arquitectura sino en el diseno de la tarea: la evaluacion se realiza sin decodificacion con gramatica restringida (unconstrained JSON), de modo que la validez del esquema depende del propio modelo y no de un constraint externo. El adaptador se distribuye junto con cuantizaciones GGUF listas para Ollama, y el ecosistema ZeroMem selecciona automaticamente entre Q8_0 y Q4_K_M segun el hardware.

## Capacidades

- Extraccion estructurada de hechos: genera JSON conforme a un esquema estricto con hechos atomicos y fundamentados en evidencia.
- Vinculacion de evidencia: asigna identificadores de segmento (s0, s1, ...) que permiten trazabilidad hasta el texto original.
- Distincion temporal: separa la fecha de registro del hecho de la fecha efectiva del evento descrito.
- Admision pre-escritura: audita hechos candidatos contra la evidencia y emite veredictos por slot (pass, revise, drop, hold).
- Correccion de errores definidos: propone reemplazos concisos y fieles para hechos marcados como revise.
- Salida JSON sin decodificacion restringida: la conformidad del esquema se mantiene sin constrained grammar decoding.
- Integracion con agentes: pensado para servidores MCP (stdio) con cuatro herramientas dentro de ZeroMem.
- Capacidades multilingues limitadas a chino e ingles.
- No se declaran capacidades de vision, audio, tool calling generico ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Memoria persistente para agentes de codigo: el modelo extrae hechos de conversaciones y documentos del repositorio y los almacena en SQLite con evidencia vinculada; su tasa de validez de esquema del 100% en Q8_0 evita que entradas malformadas lleguen a la base.
- Asistentes personales locales con Ollama: al pesar 2,71 GB en Q4_K_M, puede ejecutarse en un portatil y gestionar la escritura de memoria sin coste de API en la nube.
- Auditoria de bases de conocimiento existentes: la tarea de admision permite revisar hechos candidatos contra la evidencia original y descartar o corregir los que no se sostienen, con una retencion de pass limpio del 98,9%.
- Sistemas con requisitos de trazabilidad: la vinculacion a segmentos de evidencia (12/12 en el benchmark de ZeroMem) facilita auditar de donde procede cada hecho almacenado.
- Redaccion de secretos antes del almacenamiento: ZeroMem usa el modelo en local y sustituye credenciales por [REDACTED] antes de persistir, reduciendo la exposicion de texto plano a servicios cloud.
- Integracion en IDE y clientes de agentes: los conectores de ZeroMem cubren Claude Desktop, Claude Code, Cursor, Windsurf, Codex CLI, Antigravity y DeepSeek Harness, de modo que el modelo actua como capa de memoria en el flujo de trabajo del desarrollador.
- Procesamiento de documentacion tecnica: el benchmark de 71 documentos sinteticos de ingenieria (51.947 caracteres, 385 hechos) demuestra su uso para convertir notas tecnicas en hechos consultables con recuperacion selectiva.

## Benchmarks y rendimiento

Suite de validacion congelada de 50 casos (20 de extraccion de hechos y 30 de admision pre-escritura, 109 slots candidatos), sin decodificacion con gramatica restringida:

| Metrica | Qwen3.5-9B (Raw) | Qwen3.5-4B (Raw Q4_K_M) | V2 (Q4_K_M) | V2 (Q8_0) |
|---|---|---|---|---|
| Tasa de esquema valido en extraccion | 45,0% | 45,0% | 100,0% | 100,0% |
| Fugas de fecha de registro en extraccion | 7 | 5 | 0 | 0 |
| F1 de evidencia en extraccion | 0,4218 | 0,4287 | 0,6517 | 0,7006 |
| Latencia media de extraccion | 43,11 s | 23,81 s | 11,64 s | 13,55 s |
| Tasa de esquema valido en admision | 20,0% | 0,0% | 96,7% | 100,0% |
| Precision por slot en admision | 33,0% | 0,0% | 93,6% | 97,3% |
| Intercepcion de errores (revise) | 0,0% | 0,0% | 71,4% | 90,5% |
| Retencion de pass limpio | 40,9% | 0,0% | 98,9% | 98,9% |

Benchmark end-to-end controlado de ZeroMem con API DeepSeek (71 documentos sinteticos, 51.947 caracteres, 385 hechos, 12 preguntas objetivas):

| Metrica | API desnuda | Contexto completo | Plan 1 (recuperacion unica) | Plan 2 (MCP de agente) |
|---|---|---|---|---|
| Precision objetiva | 2/12 (16,7%) | 12/12 (100,0%) | 11/12 (91,7%) | 12/12 (100,0%) |
| Tokens de entrada medios por pregunta | 1.629 | 31.720 | 1.821 (-94,3%) | 4.296 (-86,5%) |
| Coste de arranque en frio (12 preguntas) | ¥0,053 | ¥0,770 | ¥0,054 (-93,0%) | ¥0,120 (-84,4%) |
| Coste con cache (12 preguntas) | ¥0,026 | ¥0,149 | ¥0,033 (-78,0%) | ¥0,078 (-47,7%) |
| Latencia media por pregunta | 9,27 s | 7,20 s | 6,46 s | 9,84 s (2,17 llamadas a herramientas) |
| Exposicion de secretos en texto plano a la nube | 0 | 24x | 0x | 0x |
| Trazabilidad de evidencia vinculada | 0/12 | 0/12 | 12/12 | 12/12 |

El autor advierte que se trata de un benchmark pequeno y controlado, no de una clasificacion universal.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5 GB para Q8_0 y 2,7 GB para Q4_K_M, mas overhead de contexto y runtime.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; por tamano, una RTX 4090 o una A100/H100 cubren el modelo con holgura, y tarjetas consumer con 6-8 GB de VRAM son suficientes para Q4_K_M.
- Cabe en GPU de consumo: si, en Q4_K_M con 4 GB o mas de VRAM; Q8_0 requiere alrededor de 6 GB.
- Opciones de despliegue: Ollama es la via principal (integracion nativa con ZeroMem, que auto-selecciona Q8_0 o Q4_K_M y num_ctx seguro); el adaptador LoRA puede cargarse con PEFT sobre el modelo base. No se mencionan vLLM, TGI ni llama.cpp de forma explicita.
- Latencia y throughput: en la suite de validacion, 11,64 s de latencia media por extraccion en Q4_K_M y 13,55 s en Q8_0; no se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Esquema valido (extraccion) | F1 de evidencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Memory-V2 (Q8_0) | 4,2 B | No disponible | 100,0% | 0,7006 | Apache 2.0 | Hugging Face (GGUF, LoRA) |
| Qwen3.5-4B (raw, Q4_K_M) | 4,2 B | No disponible | 45,0% | 0,4287 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (raw) | ~9 B | No disponible | 45,0% | 0,4218 | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos evaluados por el autor en la misma suite; no se dispone de datos de otros modelos especializados en memoria o extraccion de hechos para establecer una comparacion adicional.

## Limitaciones y advertencias

- El modelo esta especializado en dos subtareas de memoria; no es un asistente generalista y su rendimiento fuera de extraccion y admision de hechos no esta evaluado.
- Los benchmarks proceden de una suite pequena (50 casos) y de un benchmark sintetico (71 documentos, 12 preguntas); el propio autor advierte que no constituyen una clasificacion universal.
- Riesgo de alucinacion en hechos: aunque la F1 de evidencia alcanza 0,7006 en Q8_0, sigue habiendo margen de error en la vinculacion con segmentos, y la intercepcion de errores en admision es del 90,5% en Q8_0 frente al 71,4% en Q4_K_M.
- Idiomas limitados a chino e ingles; no se declara soporte de castellano.
- La longitud de contexto no esta documentada, lo que dificulta planificar el troceado de documentos largos.
- La cuantizacion Q4_K_M degrada la precision en admision (93,6% frente a 97,3% por slot) y la intercepcion de errores; para produccion con requisitos estrictos se recomienda Q8_0.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B tiene sus propios terminos que conviene verificar.
- Dependencia del ecosistema ZeroMem para el flujo completo (Ollama, SQLite, servidor MCP); el modelo por si solo no implementa la capa de memoria.
- La fecha de creacion del repositorio (2026-11-20) y el identificador arXiv 2607.29377 deben tratarse con cautela; no se ha verificado el contenido del paper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IMLIULIAN/qwen3.5-4b-memory-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Motor de memoria ZeroMem: https://github.com/IMLIULIAN/zeromem
- ZeroMem README en chino: https://github.com/IMLIULIAN/zeromem/blob/main/README.md
- ZeroMem README en ingles: https://github.com/IMLIULIAN/zeromem/blob/main/README_EN.md
- Instalador Windows: https://raw.githubusercontent.com/IMLIULIAN/zeromem/main/install.ps1
- Instalador macOS/Linux: https://raw.githubusercontent.com/IMLIULIAN/zeromem/main/install.sh
- Paper referenciado (arXiv 2607.29377): no disponible como enlace verificado en la informacion proporcionada
