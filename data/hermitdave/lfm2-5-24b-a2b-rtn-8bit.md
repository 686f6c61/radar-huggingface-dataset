# hermitdave/LFM2.5-24B-A2B-RTN-8bit

## Resumen

LFM2.5-24B-A2B es un modelo de razonamiento de tipo Mixture-of-Experts (MoE) desarrollado por Liquid AI, con 24.000 millones de parametros totales y solo 2.450 millones de parametros activos por token. Es el modelo mas grande y el ultimo de la familia LFM2.5, que abarca desde variantes de 230M hasta esta version de 24B. Su proposito es habilitar agentes rapidos y privados que se ejecuten en el propio dispositivo (on-device), combinando razonamiento explicito con un coste de inferencia muy reducido gracias a su reducida activacion de parametros.

La arquitectura combina 30 bloques de convolucion corta de doble puerta con 10 bloques de atencion GQA (Grouped Query Attention), lo que da un total de 40 capas. El modelo fue entrenado con un presupuesto de 36 billones de tokens y dispone de una ventana de contexto de 131.072 tokens. Soporta 16 idiomas, entre ellos el espanol, y esta disenado especificamente para cargas de trabajo agenticas: llamada a herramientas, razonamiento multi-paso y ejecucion fiable en hardware local.

Esta ficha concreta corresponde a la cuantizacion de 8 bits en formato MLX realizada por el usuario hermitdave (variante RTN, round-to-nearest), derivada del checkpoint base de Liquid AI. Es relevante porque permite ejecutar un modelo de 24B con activacion de 2B en Apple Silicon con un peso de repositorio de 14,9 GB, manteniendo las capacidades de razonamiento y tool calling del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 30 bloques de convolucion corta de doble puerta + 10 bloques GQA (40 capas) |
| Parametros totales | 24.000 millones (24B) |
| Parametros activos | 2.450 millones (2,45B); 64 expertos por bloque MoE, enrutamiento top-4 |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 8 bits (RTN, round-to-nearest) en formato MLX; el modelo original ofrece FP8, GGUF, ONNX y MLX-4bit |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso, polaco (16 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, etiquetada como "other") |
| Formato de pesos | MLX (cuantizado 8-bit); el modelo base esta en safetensors nativo |
| Tamano del repositorio | 14,9 GB |
| Vocabulario | 128.000 tokens |
| Presupuesto de entrenamiento | 36 billones de tokens |

## Arquitectura y entrenamiento

LFM2.5-24B-A2B emplea una arquitectura hibrida que alterna bloques de convolucion corta de doble puerta (30 capas) con bloques de atencion GQA (10 capas). Esta combinacion busca reducir el coste computacional de la atencion clasica manteniendo la capacidad de modelar dependencias de largo alcance, algo especialmente relevante con una ventana de contexto de 131.072 tokens. La capa MoE cuenta con 64 expertos por bloque y enrutamiento top-4, lo que explica que solo 2,45B de los 24B de parametros esten activos por token.

El modelo fue entrenado con 36 billones de tokens y posteriormente sometido a un post-entrenamiento orientado a cargas agenticas (la variante base es LFM2.5-24B-A2B-Base). Es un modelo de razonamiento puro: siempre genera un bloque `<think>` antes de responder, a diferencia de LFM2-24B-A2B. La model card menciona un modelo draft (DSpark) para decodificacion especulativa con SGLang, lo que apunta a optimizaciones de latencia en despliegues de servidor. No se detalla en la informacion disponible la composicion exacta del dataset ni si se emplearon tecnicas concretas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento explicito: siempre produce un bloque de pensamiento `<think>` antes de la respuesta final.
- Razonamiento agentico y multi-paso: disenado para tareas que requieren planificacion y ejecucion secuencial.
- Llamada a herramientas (tool calling / function calling): es una de sus fortalezas declaradas, con resultados competitivos en tareas de uso de herramientas.
- Uso como agente con recuperacion: la model card recomienda emparejarlo con retrieval o busqueda web para tareas intensivas en conocimiento.
- Capacidades multilingues en 16 idiomas, incluido el espanol.
- Generacion de codigo y matematicas: no se detalla explicitamente en la informacion disponible, aunque el perfil de razonamiento lo hace plausible; no se aportan datos concretos.
- Inferencia eficiente en dispositivo: 184 tok/s en un Apple M5 Max y hasta 21K tok/s de salida en una GPU NVIDIA B300.
- Sin capacidad de vision ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Agentes locales de escritorio: el modelo puede ejecutarse en Apple Silicon en formato MLX 8-bit (14,9 GB) para automatizar tareas del sistema mediante tool calling, manteniendo la privacidad al no enviar datos a la nube.
- Asistentes de codigo con acceso a herramientas: integrado en un IDE o CLI, puede razonar sobre el problema, invocar funciones de busqueda o ejecucion y devolver parches, aprovechando su fortaleza en tool use.
- Automatizacion de atencion al cliente con contexto largo: sus 131.072 tokens permiten gestionar conversaciones multi-turno con historial extenso y documentacion adjunta.
- Pipelines de agentes con recuperacion (RAG): la model card recomienda combinarlo con busqueda web o retrieval para tareas de conocimiento, usando el modelo como orquestador de herramientas.
- Razonamiento multi-paso en entornos con recursos limitados: con solo 2,45B de parametros activos, es adecuado para servidores modestos o estaciones de trabajo que necesiten razonamiento sin el coste de un modelo denso de 24B.
- Procesamiento multilingue en produccion: soporta 16 idiomas, lo que permite atender mercados diversos con un unico checkpoint.
- Despliegue de alta throughput en GPU: con hasta 21K tok/s de salida en una NVIDIA B300, es viable para servir agentes a escala en infraestructura cloud.

## Benchmarks y rendimiento

La model card cita resultados comparativos con Qwen3.6-35B-A3B, un modelo con aproximadamente un 50% mas de parametros totales y activos:

| Benchmark | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw (agentico/tool use) | 48,09 | 38,19 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar. La model card remite a una imagen de benchmarks y a un blog post, pero no se incluyen cifras adicionales en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio MLX 8-bit ocupa 14,9 GB, por lo que se necesita al menos ~16 GB de memoria unificada o VRAM para cargarlo; en FP8 el checkpoint original requiere un orden de magnitud similar.
- GPU recomendadas: NVIDIA B300 para alto throughput (hasta 21K tok/s de salida); A100 y H100 son opciones validas para servir con vLLM o SGLang.
- Apple Silicon: 184 tok/s en un Apple M5 Max; el formato MLX esta optimizado para Mac.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM (por ejemplo RTX 4080/4090) usando cuantizaciones de 8 bits o inferiores; la variante MLX-4bit reduce aun mas el requisito.
- Opciones de despliegue: Transformers, vLLM, SGLang (con modelo draft DSpark para decodificacion especulativa), llama.cpp (via GGUF), ONNX Runtime y MLX.
- Latencia y throughput: 184 tok/s en Apple M5 Max y hasta 21K tok/s de salida en una NVIDIA B300; el modelo afirma ser hasta 1,7x mas rapido que MoEs comparables en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Benchmark LiveClaw | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B | 24B / 2,45B | 131.072 | 48,09 | lfm1.0 | Hugging Face (varias cuantizaciones) |
| Qwen3.6-35B-A3B | ~35B / ~3B (aprox., segun la model card) | no disponible | 38,19 | no disponible | no disponible |
| LFM2.5-230M | 230M | no disponible | no disponible | lfm1.0 | Hugging Face |

La informacion disponible solo permite comparar con Qwen3.6-35B-A3B en la tarea agentica LiveClaw. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de razonamiento puro: siempre genera un bloque `<think>`, lo que incrementa los tokens de salida y puede no ser deseable en aplicaciones de baja latencia o respuestas muy cortas.
- No recomendado para tareas intensivas en conocimiento por si solo: la model card aconseja emparejarlo con retrieval o busqueda web, lo que implica un riesgo de alucinacion si se usa como fuente unica de conocimiento.
- Licencia lfm1.0: es una licencia propia de Liquid AI etiquetada como "other"; es necesario revisar sus terminos antes de un uso comercial.
- Esta ficha corresponde a una cuantizacion de terceros (hermitdave) en 8 bits RTN: puede haber perdida de calidad respecto al checkpoint original, y el autor de la cuantizacion no es Liquid AI.
- Capacidades limitadas a texto: no soporta vision ni audio.
- Idiomas: aunque soporta 16 idiomas, no se detalla el rendimiento relativo por idioma; el espanol esta incluido pero sin datos especificos de calidad.
- Sin datos publicos de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo que dificulta una evaluacion comparativa completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/LFM2.5-24B-A2B-RTN-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Modelo original post-entrenado: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Variante FP8: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-FP8
- Variante GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Variante ONNX: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX
- Variante MLX-4bit: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX-4bit
- Modelo draft DSpark: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-DSpark
- Modelo LFM2.5-230M: https://huggingface.co/LiquidAI/LFM2.5-230M
- Blog post: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Playground: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Documentacion de chat template: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Discord: https://discord.com/invite/liquid-ai
- Paper de referencia: arxiv:2511.23404
