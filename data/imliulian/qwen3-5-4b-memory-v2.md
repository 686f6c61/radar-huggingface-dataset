# IMLIULIAN/qwen3.5-4b-memory-v2

## Resumen

Qwen3.5-4B-Memory-V2 es un ajuste fino del modelo base Qwen/Qwen3.5-4B desarrollado por el usuario IMLIULIAN, orientado especificamente a tareas de memoria local para agentes de IA. El modelo no busca ser un asistente generalista, sino un componente especializado dentro de un pipeline de memoria: extraccion de hechos estructurados y admision/revision de hechos antes de su escritura en almacenamiento. Se distribuye como adaptador PEFT LoRA (r=16, alpha=32) sobre el modelo base y como artefactos GGUF cuantizados.

La relevancia del modelo radica en su enfoque de "memoria con evidencia": cada hecho extraido queda vinculado a segmentos de evidencia originales (s0, s1, ...) y se separan las fechas de registro de las fechas efectivas del evento. Ademas, incorpora un paso de admision que audita hechos candidatos contra la evidencia y emite veredictos por slot (pass/revise/drop/hold), lo que permite interceptar errores antes de persistirlos. Esto lo hace util para construir capas de memoria locales sin dependencia de APIs en la nube ni bases de datos vectoriales externas.

El modelo tiene 4.205.751.296 parametros totales y se distribuye bajo licencia Apache 2.0. Los pesos estan disponibles en safetensors (adaptador LoRA) y GGUF (Q8_0 y Q4_K_M), con soporte declarado para chino e ingles. Su ecosistema incluye ZeroMem, un motor de memoria local que lo utiliza como componente de extraccion y verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-4B) con adaptador PEFT LoRA |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M (GGUF); adaptador LoRA en safetensors |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (Q8_0 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4.205.751.296 parametros, y se ajusta mediante PEFT LoRA con rango r=16 y alpha=32. El adaptador resultante pesa 81,0 MB en safetensors, lo que confirma que el entrenamiento modifica solo un subconjunto de pesos sobre el modelo base. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal no esta en la arquitectura del transformer, sino en la formulacion de las tareas: extraccion de hechos atomicos con esquema JSON estricto, identificadores de evidencia a nivel de segmento y separacion entre fecha de registro y fecha efectiva del evento; y admision pre-escritura con veredictos por slot y reemplazos concisos para errores definidos. El benchmark del autor evalua estas tareas sin decodificacion con gramatica restringida, lo que sugiere que el ajuste busca que el modelo respete el esquema por si mismo, no solo por constriccion externa.

## Capacidades

- Generacion de texto orientada a extraccion de hechos estructurados con cumplimiento de esquema JSON.
- Extraccion de hechos atomicos con evidencia a nivel de segmento (s0, s1, ...) y separacion de fechas de registro frente a fechas efectivas.
- Admision pre-escritura de hechos candidatos: auditoria contra evidencia original y emision de veredictos por slot (pass, revise, drop, hold).
- Generacion de reemplazos concisos y fieles para errores definidos en hechos candidatos.
- Soporte de salida estructurada en JSON.
- Integracion con el motor de memoria ZeroMem mediante servidor MCP stdio de 4 herramientas.
- Capacidades multilingues limitadas a chino e ingles.
- No se declaran capacidades de vision, audio, tool calling general ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Memoria persistente para agentes locales: el modelo extrae hechos atomicos de conversaciones y documentos, los vincula a segmentos de evidencia y los deja listos para almacenarse en SQLite con indices FTS5, sin base de datos vectorial externa.
- Auditoria de hechos antes de escritura: en un pipeline de memoria, cada hecho candidato se contrasta contra la evidencia original y se marca como pass, revise, drop o hold, evitando persistir errores factuales.
- Redaccion de credenciales antes del almacenamiento: ZeroMem utiliza el modelo para extraer hechos y redactar secretos comunes a `[REDACTED]` antes de guardar, reduciendo la exposicion de credenciales en texto plano.
- Asistentes de codigo con memoria de proyecto: integracion via MCP con Claude Desktop, Claude Code, Cursor, Windsurf, Codex CLI y otros conectores declarados, permitiendo recordar decisiones y hechos tecnicos entre sesiones.
- Extraccion de hechos en documentacion tecnica: procesamiento de notas de ingenieria para construir una base de conocimiento consultable con trazabilidad a la evidencia original.
- Cumplimiento y trazabilidad: el vinculo entre hechos y segmentos de evidencia permite auditar de donde proviene cada afirmacion almacenada, util en entornos con requisitos de procedencia.
- Despliegue en hardware de consumo: las variantes GGUF Q4_K_M (2,71 GB) y Q8_0 (4,48 GB) permiten ejecutar el modelo en equipos locales mediante Ollama, con seleccion automatica de cuantizacion y `num_ctx` seguro por parte de ZeroMem.

## Benchmarks y rendimiento

Resultados publicados por el autor en una suite de validacion congelada de 50 casos (20 de extraccion de hechos y 30 de admision pre-escritura, 109 slots candidatos), sin decodificacion con gramatica restringida:

| Metrica | Qwen3.5-9B (Raw) | Qwen3.5-4B (Raw Q4_K_M) | V2 (Q4_K_M) | V2 (Q8_0) |
|---|---|---|---|---|
| Tasa de esquema valido en extraccion | 45,0% | 45,0% | 100,0% | 100,0% |
| Fugas de fecha de registro en extraccion | 7 | 5 | 0 | 0 |
| F1 de evidencia en extraccion | 0,4218 | 0,4287 | 0,6517 | 0,7006 |
| Latencia media en extraccion | 43,11 s | 23,81 s | 11,64 s | 13,55 s |
| Tasa de esquema valido en admision | 20,0% | 0,0% | 96,7% | 100,0% |
| Precision por slot en admision | 33,0% | 0,0% | 93,6% | 97,3% |
| Intercepcion de errores (revise) | 0,0% | 0,0% | 71,4% | 90,5% |
| Retencion de pass limpio | 40,9% | 0,0% | 98,9% | 98,9% |

Ademas, el autor publica un benchmark end-to-end controlado de ZeroMem con la API de DeepSeek sobre 71 documentos sinteticos de ingenieria (51.947 caracteres, 385 hechos extraidos) y 12 preguntas objetivas:

| Metrica | Grupo A: API basica | Grupo B: contexto completo | Plan 1: single-recall | Plan 2: agente MCP |
|---|---|---|---|---|
| Precision objetiva | 2/12 (16,7%) | 12/12 (100,0%) | 11/12 (91,7%) | 12/12 (100,0%) |
| Tokens de entrada medios por pregunta | 1.629 | 31.720 | 1.821 (-94,3%) | 4.296 (-86,5%) |
| Coste 12 preguntas en frio | ¥0,053 | ¥0,770 | ¥0,054 (-93,0%) | ¥0,120 (-84,4%) |
| Coste 12 preguntas con cache | ¥0,026 | ¥0,149 | ¥0,033 (-78,0%) | ¥0,078 (-47,7%) |
| Latencia media por pregunta | 9,27 s | 7,20 s | 6,46 s | 9,84 s (2,17 llamadas a herramienta) |
| Exposicion de secretos en texto plano a la nube | 0 | 24x | 0x | 0x |
| Trazabilidad de evidencia vinculada | 0/12 | 0/12 | 12/12 | 12/12 |

El propio autor advierte que se trata de un benchmark pequeno y controlado, no de una clasificacion universal, y que los resultados reales varian segun la estructura del documento, la mezcla de idiomas y la complejidad de las consultas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,48 GB para Q8_0 y 2,71 GB para Q4_K_M en GGUF, segun los tamanos de artefacto publicados; el adaptador LoRA safetensors (81,0 MB) requiere cargar ademas el modelo base Qwen/Qwen3.5-4B.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por tamano, las variantes GGUF son aptas para GPU de consumo con al menos 6-8 GB de VRAM; el modelo base en precision completa requiere mas memoria.
- Cabe en GPU de consumo: si, con las variantes GGUF Q4_K_M y Q8_0, en tarjetas con VRAM suficiente para el tamano del artefacto mas el contexto.
- Opciones de despliegue: Ollama (soporte explicito, con seleccion automatica de Q8_0 frente a Q4_K_M y `num_ctx` seguro), llama.cpp mediante GGUF, y carga del adaptador PEFT LoRA sobre transformers. ZeroMem ofrece instalacion via script para Windows (PowerShell) y macOS/Linux, ademas de `pip install git+https://github.com/IMLIULIAN/zeromem.git`.
- Latencia y throughput: en la suite de validacion del autor, latencia media de 11,64 s por caso en Q4_K_M y 13,55 s en Q8_0 para extraccion; en el benchmark end-to-end de ZeroMem, latencia media de 6,46 s por pregunta en modo single-recall y 9,84 s en modo agente MCP (con 2,17 llamadas a herramienta de media). No se publican cifras de throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Memory-V2 | 4.205.751.296 | no disponible | Extraccion y admision de hechos con evidencia | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Qwen3.5-4B (base) | no disponible en la informacion | no disponible | Modelo generalista | no disponible en la informacion | Hugging Face |
| Qwen3.5-9B | no disponible en la informacion | no disponible | Modelo generalista de mayor tamano | no disponible en la informacion | Hugging Face |

En la suite del autor, V2 supera al modelo base y al 9B en tasa de esquema valido, F1 de evidencia y precision de admision, a costa de ser un modelo especializado que no cubre tareas generales. No se dispone de datos de benchmarks de terceros ni de comparaciones con otros modelos especializados en memoria.

## Limitaciones y advertencias

- Modelo especializado: no es un asistente generalista; su rendimiento fuera de extraccion y admision de hechos no esta evaluado.
- Idiomas limitados a chino e ingles; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no disponible en la informacion proporcionada; el autor menciona seleccion automatica de `num_ctx` seguro en ZeroMem, pero sin cifra concreta.
- Riesgo de alucinacion en hechos extraidos: aunque el modelo vincula evidencia, la suite muestra F1 de evidencia de 0,6517 (Q4_K_M) y 0,7006 (Q8_0), lo que implica que parte de la evidencia vinculada no es correcta.
- La intercepcion de errores en admision alcanza el 90,5% en Q8_0, no el 100%; quedan errores que pueden pasar a almacenamiento.
- Los benchmarks son del propio autor, con 50 casos en la suite de validacion y 71 documentos sinteticos en el benchmark end-to-end; no son una evaluacion independiente ni una clasificacion universal.
- La cuantizacion Q4_K_M reduce el tamano pero tambien el rendimiento en algunas metricas (por ejemplo, intercepcion de errores 71,4% frente a 90,5% en Q8_0).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B tiene su propia licencia que debe verificarse por separado.
- El adaptador LoRA requiere cargar el modelo base, lo que anade requisitos de memoria frente a las variantes GGUF.
- Dependencia del ecosistema ZeroMem para el flujo completo de memoria; el modelo por si solo solo realiza las tareas de extraccion y admision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IMLIULIAN/qwen3.5-4b-memory-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio ZeroMem: https://github.com/IMLIULIAN/zeromem
- README de ZeroMem en chino simplificado: https://github.com/IMLIULIAN/zeromem/blob/main/README.md
- README de ZeroMem en ingles: https://github.com/IMLIULIAN/zeromem/blob/main/README_EN.md
- Script de instalacion Windows: https://raw.githubusercontent.com/IMLIULIAN/zeromem/main/install.ps1
- Script de instalacion macOS/Linux: https://raw.githubusercontent.com/IMLIULIAN/zeromem/main/install.sh
