# Launch80/Qwen3.8-27B-MACaQ-MXFP4-SABER

## Resumen

Qwen3.8-27B-MACaQ-MXFP4-SABER es un paquete de pesos precompilado para el motor de inferencia Saber, derivado del modelo base Qwen/Qwen3.8-27B. Lo publica el usuario Launch80 y no contiene safetensors al uso, sino el formato propietario `SBRPACK1` (`rank{0,1}.pack` + `manifest.json`), cargable unicamente por el motor Saber sobre hardware AMD RDNA4 (gfx1201). La cuantizacion aplica la receta MACaQ calibrada descrita en arXiv:2611.10649: pesos MXFP4 (grupo 32, escala E8M0) con activaciones fp8 e4m3 por token, mas una rotacion Hadamard de 32 puntos por bloque y escala por canal.

El interes tecnico esta en el esquema W4A8 con rotacion Hadamard: la transformada se aplica tanto a la activacion como al peso en la misma base, de modo que el producto matricial se preserva en aritmetica exacta, y ademas 19 proyecciones lineales del decoder se promueven a W8A8 (fp8 e4m3 con escala f32 por bloque de 128x128) por ser las mas sensibles segun la calibracion. El resultado es una divergencia KL top-5 frente al modelo BF16 de 0,0226 y un acuerdo top-1 del 94,19 %, con perplejidad 4,910 frente a 4,879 del BF16.

Es relevante ahora porque demuestra que es posible servir un modelo de 27B en cuantizacion de 4 bits con perdida de calidad muy contenida sobre GPUs de consumo profesional AMD (Radeon AI PRO R9700, 32 GB), con decodificacion especulativa DFlash2 y una ventana de contexto de 262.144 tokens. El repositorio ocupa 41,5 GB e incluye los packs TP=1 y TP=2, tokenizer y plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.8-27B (no se detalla en la informacion disponible); pesos en formato Saber `SBRPACK1` con linears MXFP4 y W8A8 |
| Parametros totales | 27B (heredados del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun la seccion de velocidad del model card) |
| Tipos de cuantizacion | MXFP4 (grupo 32, escala E8M0) en pesos; activaciones fp8 e4m3 por token; 19 linears en W8A8 (fp8 e4m3, escala f32 por bloque 128x128); KV cache fp8 e4m3; `lm_head`, embeddings, normas, conv y GDN en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `SBRPACK1` (`rank{0,1}.pack` + `manifest.json`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, del que se heredan arquitectura y capacidades; la model card no describe la arquitectura interna del base. Lo que si se detalla es el proceso de cuantizacion: los pesos se cuantizan directamente desde el checkpoint BF16 original, no desde otra release ya cuantizada. Cada linear cuantizado recibe una escala por canal calibrada (vector `t`) y una rotacion Walsh-Hadamard normalizada de 32 puntos por bloque de 32 elementos en la dimension K, almacenando el peso en la misma base transformada (`W' = H32 (W / t)`), de forma que `x' W'^T = x W^T` en aritmetica exacta. Los vectores `t` se guardan como registros f32 (4 por capa) y el motor los aplica dentro de los productores de activacion, justo antes de la cuantizacion e4m3, sin anadir lanzamientos adicionales.

Sobre esa base se aplica MXFP4 con busqueda de exponente de bloque ponderada por Hessiano y refinamiento de flip de los codigos de 4 bits contra activaciones de calibracion. Adicionalmente, 19 lineales se promueven a W8A8 (10 `linear_attn.out_proj`, 4 `self_attn.o_proj`, 5 `mlp.down_proj`), seleccionadas por la calibracion como las mas sensibles. El `lm_head` se mantiene en bf16 byte a byte respecto al checkpoint original, y debe ser identico al del drafter DFlash2 que se usa para decodificacion especulativa (el motor Saber rechaza un drafter cuyo head difiera). No se documenta en la informacion disponible el volumen de tokens de entrenamiento del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: el pack conserva las capacidades del modelo base Qwen3.8-27B, incluyendo modo thinking (las respuestas con thinking se alargan aproximadamente un 5 % respecto al pack MXFP4 anterior).
- Matematicas: evaluado en GSM8K (500 preguntas mas 819 retenidas con thinking activado), con 1.282 aciertos de 1.319.
- Codigo: la calibracion incluye ventanas de codigo y el modelo se evalua con ventanas de prosa, chat y codigo para medir KL y acuerdo top-1.
- Contexto largo: pruebas needle a 32k y 120k, y ventana operativa de 262.144 tokens con el drafter DFlash2 activo.
- Decodificacion especulativa: soportada mediante el drafter DFlash2 del pack `qwen38-dflash2-drafter-quarkhead`, con 3,17 tokens por paso a batch 1.
- Tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat multi-turno con contexto largo: con una ventana de 262.144 tokens y cache de prefijo activada, el modelo mantiene conversaciones extensas; en pruebas multi-turno a 32k el TTFT del segundo turno baja a 0,31 s frente a 6,8 s del primero.
- Asistencia de codigo en produccion: la calibracion incluye ventanas de codigo y el modelo conserva el acuerdo top-1 del 94,19 % frente a BF16, lo que permite usarlo como backend de autocompletado o generacion en IDE sobre dos R9700.
- Razonamiento matematico por lotes: con GSM8K a 1.282/1.319 y modo thinking, es adecuado para pipelines de resolucion de problemas verificables donde se prioriza precision sobre latencia.
- Procesamiento de documentos largos: las pruebas needle a 32k y 120k y la ventana de 262k permiten resumir o extraer informacion de contratos, informes o bases de codigo extensas en una sola pasada.
- Despliegue en estaciones de trabajo AMD: al caber en una sola Radeon AI PRO R9700 en la variante `-tp1` (20,2 GB), sirve para prototipado local y entornos de desarrollo sin GPUs de datacenter.
- Inferencia de alta concurrencia en nodo de dos GPUs: con TP=2 y concurrencia 8 se alcanzan unos 618 tok/s agregados, util para servir a un equipo pequeno o para evaluaciones automatizadas masivas.
- Evaluacion comparativa de cuantizaciones: el pack incluye metricas reproducibles (KL top-5, acuerdo top-1, perplejidad) que permiten medir el impacto de distintas recetas de cuantizacion sobre el mismo modelo base.

## Benchmarks y rendimiento

Calidad medida con el motor Saber (TP=2 salvo indicacion) frente al modelo BF16: divergencia KL top-5 sobre 76 secuencias retenidas (prosa, chat y codigo), contexto 32.768, contra las log-probabilidades top-20 del BF16.

| Metrica | Este pack (TP=2) | Pack MXFP4 anterior | Quark-AWQ-MXFP4 |
|---|---:|---:|---:|
| KL top-5 vs BF16 | 0,0226 | 0,0260 | 0,0467 |
| Acuerdo top-1 con BF16 | 94,19 % | 93,55 % | 91,18 % |
| Perplejidad (BF16: 4,879) | 4,910 | 4,941 | 5,030 |

Mejora de KL de este pack frente al anterior: -13,2 % [-19,4, -7,0] (TP=1: -11,1 %). En tareas, los resultados empatan dentro del ruido: GSM8K 1.282 frente a 1.284 de 1.319.

Rendimiento con 2x Radeon AI PRO R9700, TP=2, contexto 262.144, drafter DFlash2 y cache de prefijo:

| Metrica | Valor |
|---|---:|
| BetterBench `--quick` un solo stream | ~215 tok/s |
| BetterBench `--quick` concurrencia 8 (agregado) | ~618 tok/s |
| TTFT p50 / update p99 | 47 ms / 23,7 ms |
| Paso de decodificacion b1 / b4 / b8 | 22,92 / 25,86 / 30,63 ms |
| Tokens por paso a b1 / throughput a b8 | 3,17 / 565 tok/s |
| Prefill en frio 4k / 16k | ~5.040 / ~5.110 tok/s |
| Multi-turno 32k: TTFT turno 1 / turno 2 | 6,8 s / 0,31 s |
| Pool de KV (tokens, todas las secuencias, con drafter) | ~740k |

Frente al pack MXFP4 anterior, el paso b1 es unos 0,5 ms mas lento (por los bytes W8) y el b8 unos 0,2 ms; el prefill es un 1,5-1,9 % mas lento y el pool de KV un 1,5 % menor. La velocidad en TP=1 no esta disponible.

## Requisitos de hardware

- VRAM estimada: el pack TP=2 ocupa 21,3 GB y el TP=1 20,2 GB; el drafter anade 7,7 GB en ambos casos. Se necesita ademas espacio para el pool de KV fp8 (unas 740k tokens en TP=2 con drafter).
- GPU soportadas: exclusivamente AMD RDNA4 (gfx1201). Configuracion recomendada: 2x AMD Radeon AI PRO R9700 de 32 GB para TP=2, o una sola tarjeta para TP=1.
- GPU de consumo: cabe en una Radeon AI PRO R9700 (32 GB) en la variante `-tp1`. No hay soporte documentado para GPUs NVIDIA ni para otras arquitecturas AMD.
- Motor de inferencia: Saber con soporte MACaQ, build publica de `GGZ14/saber-engine` main desde el 2026-11-12. Las releases anteriores no pueden servir estos packs. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Disco: 21,3 GB (TP=2) o 20,2 GB (TP=1), mas 7,7 GB del drafter.
- Latencia y throughput: ver tabla de benchmarks; ~215 tok/s en un solo stream y ~618 tok/s agregados a concurrencia 8 en TP=2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Calidad (KL top-5 vs BF16) | Licencia |
|---|---|---:|---|---:|---|
| Este pack (MACaQ MXFP4, TP=2) | 27B | 262.144 | `SBRPACK1`, RDNA4 | 0,0226 | apache-2.0 |
| Qwen3.8-27B-Quark-AWQ-MXFP4-SABER | 27B | no disponible | `SBRPACK1`, RDNA4 | 0,0467 | apache-2.0 (segun repo) |
| Pack MXFP4 calibrado anterior (no publicado) | 27B | no disponible | `SBRPACK1`, RDNA4 | 0,0260 | no disponible |
| Qwen/Qwen3.8-27B (BF16) | 27B | no disponible | safetensors | referencia (perplejidad 4,879) | no disponible |

No se dispone de datos de comparacion con cuantizaciones de otros ecosistemas (GGUF, AWQ, GPTQ) en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor Saber: los pesos no son safetensors ni GGUF y solo los carga Saber sobre RDNA4 (gfx1201); no hay ruta de despliegue en NVIDIA, vLLM, llama.cpp u Ollama.
- Requiere una build concreta del motor (main desde 2026-11-12); versiones anteriores fallan al servir el pack.
- El drafter no esta incluido en este repositorio y debe descargarse aparte; el `lm_head` del drafter debe coincidir byte a byte con el del target o el motor lo rechaza. No se deben mezclar carpetas TP=1 y TP=2.
- La mejora de calidad frente al pack anterior se concentra en metricas de distribucion (KL, top-1, perplejidad); en tareas como GSM8K los resultados empatan dentro del ruido.
- Las respuestas con thinking son aproximadamente un 5 % mas largas que con el pack anterior, lo que incrementa el coste de tokens generados.
- Los valores p99 de BetterBench `--quick` son indicativos (5 pasadas por categoria); la velocidad en TP=1 no esta medida.
- No se documentan sesgos, riesgo de alucinacion ni cobertura idiomatica especificos de este pack; deben evaluarse sobre el modelo base.
- Licencia apache-2.0 declarada en el repositorio, pero conviene verificar las condiciones del modelo base Qwen3.8-27B antes de uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente y poco validada por terceros.

## Enlaces

- Hugging Face del pack: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-MXFP4-SABER
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pack del drafter DFlash2: https://huggingface.co/Launch80/Qwen3.8-27B-Quark-AWQ-MXFP4-SABER
- Motor Saber: https://github.com/GGZ14/saber-engine
- Paper de la receta MACaQ: https://arxiv.org/abs/2611.10649
