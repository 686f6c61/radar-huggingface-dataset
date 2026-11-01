# alexwengg/Nanbeige4.3-33B-MLX-3bit

## Resumen

Nanbeige4.3-33B-MLX-3bit es una cuantizacion a 3 bits en formato MLX del modelo Nanbeige4.3-33B, un LLM denso de 33 mil millones de parametros basado en arquitectura Llama desarrollado por el Nanbeige LLM Lab. La cuantizacion ha sido publicada por el usuario alexwengg en Hugging Face y esta disenada especificamente para ejecutarse en Macs con Apple Silicon de 24 GB de memoria unificada, ocupando 13,9 GiB y dejando margen para un modelo draft de decodificacion especulativa.

Este repositorio resuelve un problema concreto: permitir ejecutar un modelo denso de 33B en hardware de consumo Apple sin sacrificar demasiada calidad. La variante 3-bit prioriza velocidad y espacio frente a la variante hermana mixta 3/4/6-bit (15,7 GiB), que ofrece algo mas de calidad pero menos margen de memoria. Con un draft model de 3B, alcanza 25-29 tok/s en tareas de codigo en un Apple M5 Pro.

El modelo base soporta ingles y chino, incluye modo de razonamiento (`enable_thinking`), tool calling en formato XML y capacidades agenticas, lo que lo hace relevante para desarrolladores que buscan un modelo local de tamano medio con soporte de agentes en hardware Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama, 52 capas |
| Parametros totales | 33.118.977.024 (aprox. 33B) |
| Parametros activos | no disponible (arquitectura densa: todos los parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits afín (group size 64) en todas las proyecciones y embeddings; 6 bits en lm_head; normas en BF16 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, es un transformer denso de tipo Llama con 52 capas. No es un modelo MoE, por lo que todos los parametros se activan en cada pasada. La model card original no detalla el numero de tokens de entrenamiento ni la composicion del dataset, por lo que esa informacion no esta disponible en los datos proporcionados.

La cuantizacion de este repositorio es afín con group size 64: todas las proyecciones de atencion y MLP, asi como `embed_tokens`, a 3 bits; `lm_head` a 6 bits; y las normas en BF16. Un detalle importante: las capas que en la variante mixta estaban a 4 bits fueron re-cuantizadas a 3 bits pasando por des-cuantizacion intermedia (dequantize → quantize), no directamente desde BF16, lo que introduce ligeramente mas error que una conversion directa a 3 bits. El autor recomienda la variante mixta si se dispone de memoria suficiente.

Una innovacion destacable del ecosistema es el soporte de decodificacion especulativa: Nanbeige4.1-3B comparte exactamente el mismo tokenizador, por lo que funciona como draft model, elevando el throughput de ~17,5 tok/s a 25-29 tok/s en codigo (con aproximadamente un 70% de tokens draft aceptados).

## Capacidades

- Generacion de texto conversacional en ingles y chino
- Modo de razonamiento (`enable_thinking=True` por defecto): el modelo emite primero su cadena de razonamiento en streaming; con `enable_thinking=False` responde directamente
- Control de razonamiento en la plantilla de chat mediante `enable_thinking` y `preserve_thinking`
- Tool calling con formato XML (recomendado `tool_call_format="xml"` por la model card)
- Capacidades agenticas: la model card reporta buen desempeno en tareas cortas de agente (uso de herramienta bash en sandbox: organizar una carpeta en ~30 s, encontrar los archivos mas grandes en ~15 s)
- Generacion de codigo: resuelve 5/8 problemas tipo LeetCode en un smoke test sin razonamiento activado (7/8 en la variante mixta)
- Razonamiento matematico basico (el ejemplo de la model card compara 9.11 frente a 9.8)
- Compatibilidad con servidor OpenAI-compatible via `mlx_lm.server`

## Casos de uso

- Agentes locales en Mac con herramientas de linea de comandos: el modelo puede ejecutar tareas agenticas cortas con herramientas bash en sandbox (organizar archivos, buscar documentos grandes), adecuado gracias a su soporte de tool calling XML y al modo agentic (temperature 1.0, top-p 0.95)
- Asistente de programacion offline: con decodificacion especulativa alcanza 25-29 tok/s en codigo, suficiente para autocompletado y generacion de funciones en un editor local sin depender de la nube
- Chatbot bilingue ingles-chino: soporta ambos idiomas de forma nativa, util para equipos que trabajan con documentacion o clientes en ambos idiomas
- Razonamiento paso a paso en local: el modo thinking permite resolver problemas que requieren cadenas de razonamiento antes de la respuesta final, configurable por peticion
- Prototipado de aplicaciones LLM en Apple Silicon: el servidor OpenAI-compatible de mlx-lm permite integrar el modelo en aplicaciones existentes que ya hablan el protocolo de OpenAI
- Procesamiento privado de conversaciones: al ejecutarse integramente en local, es adecuado para datos sensibles que no deben salir del dispositivo
- Investigacion sobre decodificacion especulativa: la compatibilidad exacta de tokenizador con Nanbeige4.1-3B lo convierte en buen banco de pruebas para experimentar con draft models

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato cuantitativo es un smoke test del propio autor, no comparable con benchmarks oficiales:

| Prueba (autor del repo, no oficial) | Este repo (3-bit) | Variante mixta 3/4/6-bit |
|---|---|---|
| Problemas tipo LeetCode superados (8 total) | 5/8 | 7/8 |
| Decode solo (M5 Pro, 24 GB) | ~17,5 tok/s | ~16 tok/s |
| Decode con draft 3B, codigo | 25-29 tok/s | 25-27 tok/s |
| Decode con draft 3B, chat | ~21 tok/s | no disponible |

Estos numeros proceden de un conjunto de solo 8 problemas a temperature 0.6 sin razonamiento, por lo que deben tratarse como prueba de humo, no como benchmark.

## Requisitos de hardware

- VRAM / memoria unificada estimada: 13,9 GiB para el modelo solo; ~15,5 GiB con el draft model de 3B cargado; disenado para Macs con Apple Silicon de 24 GB
- GPU recomendadas: Apple Silicon (M5 Pro usado en las mediciones del autor); teoricamente cualquier Mac con 24 GB o mas de memoria unificada. Para GPU NVIDIA no hay mediciones, aunque un modelo 3-bit de 33B (~14 GB) cabria en una RTX 4090 de 24 GB con un backend compatible
- Cabe en GPU de consumo: si, en Apple Silicon de 24 GB es el caso de uso diseniado. Bajo presion de memoria (navegador y apps de chat abiertas) puede haber swapping y menor rendimiento
- Opciones de despliegue: mlx-lm (CLI, Python y `mlx_lm.server` con API OpenAI-compatible). No hay soporte nativo documentado para vLLM, llama.cpp, Ollama o TGI en este repositorio
- Latencia y throughput: carga ~4 s; ~17,5 tok/s en decode single-stream; 25-29 tok/s en codigo con draft model (~70% de aceptacion); ~21 tok/s en chat con draft model
- Comando de ejemplo: `mlx_lm.generate --model alexwengg/Nanbeige4.3-33B-MLX-3bit --prompt "..." --max-tokens 512 --temp 0.6 --top-p 0.95`

## Comparativa con modelos similares

| | Nanbeige4.3-33B-MLX-3bit (este repo) | Nanbeige4.3-33B-MLX-mixed-3-4-6bit | Qwen3-32B (referencia de categoria) |
|---|---|---|---|
| Parametros | ~33B denso | ~33B denso | ~32B denso |
| Cuantizacion | 3-bit (lm_head 6-bit) | mixta 3/4/6-bit | varia (oficial y comunidad) |
| Tamano en disco | 13,9 GiB | 15,7 GiB | no disponible |
| Contexto | no disponible | no disponible | hasta 128K segun version |
| Idiomas | en, zh | en, zh | multilingue (100+) |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Rendimiento reportado | 5/8 LeetCode smoke; 17,5 tok/s; 25-29 con draft | 7/8 LeetCode smoke; ~16 tok/s; 25-27 con draft | no disponible |
| Formato | MLX (safetensors) | MLX (safetensors) | safetensors / GGUF |

Nota: los datos de Qwen3-32B son de conocimiento general y no provienen de la informacion proporcionada; verificalos antes de tomar decisiones.

## Limitaciones y advertencias

- Calidad reducida por la cuantizacion agresiva: 3 bits en casi todo el modelo degrada la calidad respecto al BF16 original; el smoke test muestra 5/8 frente a 7/8 de la variante mixta
- Error adicional de re-cuantizacion: las capas que estaban a 4 bits en la variante mixta fueron re-cuantizadas a 3 bits (dequantize → quantize), no desde BF16, acumulando mas error que una conversion directa
- Riesgo de alucinacion: no hay datos especificos publicados, pero como todo LLM de 33B cuantizado puede alucinar; verificar salidas en usos criticos
- Sesgos conocidos: no disponibles en la informacion proporcionada
- Idiomas limitados: solo ingles y chino; otras lenguas, incluido el castellano, no estan declaradas como soportadas
- Longitud de contexto no documentada en este repositorio: consultar la model card del modelo base antes de planificar cargas con documentos largos
- Rendimiento sensible a la presion de memoria: en un Mac de 24 GB con otras aplicaciones abiertas se produce swapping y caida de throughput
- Los datos de velocidad y calidad son mediciones del autor en un unico hardware (M5 Pro, 24 GB) con muestras pequenas; no generalizar a otros entornos
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque el credito del modelo corresponde al Nanbeige LLM Lab
- Descargas bajas (260) y sin likes: comunidad pequena, lo que implica menos soporte, menos variantes y posibles bugs sin reportar

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/alexwengg/Nanbeige4.3-33B-MLX-3bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Variante hermana mixta 3/4/6-bit: https://huggingface.co/alexwengg/Nanbeige4.3-33B-MLX-mixed-3-4-6bit
- Draft model compatible (mismo tokenizador): https://huggingface.co/Nanbeige/Nanbeige4.1-3B
- Libreria de inferencia: https://github.com/ml-explore/mlx-lm
- Paper, blog oficial y demo: no disponibles en la informacion proporcionada
