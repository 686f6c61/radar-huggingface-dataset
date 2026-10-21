# datayoda/Swift-1.5-Qwen3.8-27B-hipfire-MQ4

## Resumen

Swift-1.5-Qwen3.8-27B-hipfire-MQ4 es una instantánea cuantizada en formato MQ4 del fine-tune Swift-1.5-Qwen3.8-27B, publicado por el usuario datayoda. No se trata de un modelo nuevo entrenado desde cero, sino de la conversión a formato nativo de hipfire (`.mq4`) del ajuste fino que UkisAI realiza sobre Qwen3.8-27B, un transformer denso de 28 capas, 5120 dimensiones ocultas, 64 cabezas de consulta y 8 de clave/valor, con una ventana de entrenamiento de 262 144 tokens.

El interés del checkpoint es de ingeniería de inferencia: incluye la cabeza MTP (multi-token prediction) empaquetada como sidecar, lo que habilita decodificación especulativa con el propio modelo y eleva la decodificación a 36,5 tok/s en prompts reales sobre una única AMD RX 7900 XT de 20 GB. Frente al mismo fine-tune en GGUF Q4_K_S sobre llama.cpp, el autor reporta un prefill entre 1,44 y 1,85 veces más rápido y una decodificación un 24 % superior en la misma tarjeta.

La propuesta del fine-tune subyacente es la eficiencia de razonamiento: según UkisAI, Swift-1.5 emplea un 58,3 % menos de tokens de pensamiento con una pérdida de rendimiento inferior al 1 %, lo que se traduce en una aceleración de hasta 1,95 veces en varias tareas. Este repositorio es, por tanto, la vía de despliegue rápida de ese modelo en hardware AMD consumer, a costa de quedar atado al runtime hipfire.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B): 28 capas, 5120 dimensiones ocultas, 64 cabezas Q, 8 cabezas KV |
| Parametros totales | 27B (denominacion del checkpoint; recuento exacto no disponible) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262 144 tokens de ventana entrenada; 49 152 verificados con especulacion MTP; 98 304 con especulacion desactivada (prefills profundos agotan la VRAM en 20 GB) |
| Tipos de cuantizacion | MQ4 (`MQ4G256V2`) a 4,256 bits/peso; el mismo fine-tune existe como GGUF Q4_K_S (16 363 513 536 bytes) |
| Idiomas soportados | No disponible |
| Licencia | `swift-open-license-v1.0` (etiquetada como `other` en HuggingFace) |
| Formato de pesos | `.mq4` (runtime hipfire) + sidecar `.mtp` para la cabeza de prediccion multi-token; no compatible con llama.cpp |

Otros datos del repositorio: tronco de 14,98 GiB (14 980 361 216 bytes), cabeza MTP de 225 716 224 bytes, tamano total del repo 15,2 GB, 510 tensores de tronco verificados.

## Arquitectura y entrenamiento

La base es un transformer denso con atención por grupos (GQA) de 64 cabezas de consulta frente a 8 de clave/valor, 28 capas y 5120 dimensiones ocultas, con una ventana de contexto entrenada de 262 144 tokens. Sobre esa base, UkisAI aplica un ajuste fino orientado a reducir el coste de razonamiento: el modelo "compromete pronto" y emite menos tokens de pensamiento antes de la respuesta final, manteniendo según el autor una paridad de calidad inferior al 1 % de pérdida y una aceleración de 1,95 veces en varias tareas. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

La innovación técnica de este checkpoint concreto es de cuantización y decodificación. Los pesos se generaron directamente desde los safetensors originales en fp8 por bloques con `hipfire-quantize --format mq4`, sin pasar por un GGUF intermedio, y cada tensor se validó individualmente (`qemitted == qexpected`, 0 fallos en los 510 tensores del tronco). Se incluye además una cabeza MTP en un sidecar `.mtp` que se carga automáticamente desde el mismo stem y actúa como borrador especulativo del propio modelo, con una tasa de aceptación de τ≈1,94 tokens por paso medida en prompts reales.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" reducido: el fine-tune recorta un 58,3 % los tokens de pensamiento segun su autor.
- Generacion y edicion de codigo: la evaluacion del autor cubre seis tareas reales en Rust (correccion de bugs plantados, docstrings, tests unitarios, explicacion de codigo, refactorizacion y revision).
- Contexto largo: ventana entrenada de 262 144 tokens, con 49 152 tokens verificados en inferencia real sobre 20 GB y 98 304 con especulacion desactivada.
- Decodificacion especulativa integrada mediante cabeza MTP, sin necesidad de un modelo borrador externo.
- Servido con API compatible con OpenAI a traves de `hipfire serve`.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: el modelo se presenta como adecuado para bucles de codigo agénticos, pero no hay evaluacion formal de uso de herramientas.
- Capacidades multilingues: no disponibles.
- Vision y audio: no disponibles (modelo solo de texto).

## Casos de uso

- Asistencia de codigo agéntica sobre repositorios grandes: con prompts de 10,7K a 20,4K tokens y prefill sostenido de 1 101 tok/s a 16K, el modelo devuelve una primera respuesta en unos 18 segundos dentro de un prompt de 20K, lo que lo hace util para bucles de edicion dentro de un IDE o un agente CLI.
- Correccion de bugs y generacion de tests en CI/CD: las tareas evaluadas (fix de bug plantado, tests unitarios, refactorizacion) son directamente automatizables como pasos de un pipeline que invoca el endpoint compatible con OpenAI de `hipfire serve`.
- Revision de codigo automatizada: el modelo puede procesar un diff completo mas el contexto del fichero gracias a la ventana de 49K verificada, y su tendencia a "comprometerse pronto" reduce la latencia frente a modelos que razonan extensamente.
- Documentacion tecnica y docstrings: el fine-tune produce respuestas mas densas en contenido visible (26 % mas de caracteres de respuesta dentro del mismo presupuesto de tokens que la base), lo que encaja con generacion de documentacion en lote.
- Despliegue en estaciones de trabajo AMD consumer: es una de las pocas rutas para servir un modelo de 27B con contexto de decenas de miles de tokens en una GPU de 20 GB bajo ROCm.
- Analisis de codigo y ficheros largos con contexto de hasta 98K tokens: con la especulacion desactivada el modelo carga y opera con ventanas de 98 304 tokens, util para auditorias de un solo paso sobre modulos extensos.
- Prototipado de bajo coste en ROCm: util para equipos que quieren validar un asistente de codigo autoalojado sin depender de CUDA ni de GPUs de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta mediciones de rendimiento de inferencia y de produccion de respuesta. La comparativa de calidad frente a la base Qwen3.8-27B y Swift 1.0 se menciona en el sitio del autor del fine-tune, pero sin cifras en la informacion proporcionada.

Rendimiento en AMD RX 7900 XT 20 GB (gfx1100), ROCm 7.1, greedy, mediana de 3 ejecuciones:

| Metrica | hipfire MQ4 | llama.cpp Q4_K_S |
|---|---|---|
| Prefill a 512 tokens (tok/s) | 1 196 | 760 |
| Prefill a 16K tokens (tok/s) | 1 101 | 699 |
| Decodificacion matricial a 4K (tok/s) | 28,9 | no disponible |
| Decodificacion en prompts reales (tok/s) | 36,5 (con MTP, τ≈1,94) | ~23 |
| Contexto 16K-49K, decodificacion (tok/s) | 52-59 | no disponible |

Suite end-to-end de seis tareas de codigo en Rust con prompts de 10,7K a 20,4K tokens, temp 0, salidas limitadas a 1024/2048 tokens y 8 256 tokens de salida totales por sistema:

| Sistema (misma RX 7900 XT de 20 GB) | Tiempo total, 6 tareas |
|---|---|
| llama.cpp · Q4_K_S | 530 s |
| hipfire · MQ4 (este checkpoint) | 237 s |

Datos adicionales reportados: el modelo base sin fine-tune sobre el tier MQ4-XTS es aproximadamente un 10 % mas rapido end-to-end (70-86 tok/s de decodificacion frente a 56-61), y Swift llena un 26 % mas del presupuesto de tokens con contenido de respuesta visible que la base (5 301 frente a 4 205 caracteres).

## Requisitos de hardware

- VRAM estimada: unos 17,5 GB con la cabeza MTP y contexto de 8K; el tronco solo ocupa 14,98 GiB.
- GPU verificada: AMD Radeon RX 7900 XT de 20 GB (gfx1100) bajo ROCm 7.1. No hay datos publicados para CUDA (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU consumer AMD de 20 GB; contextos profundos (prefills largos) agotan la VRAM en esa tarjeta. No hay datos para GPUs de 16 GB o menos.
- Despliegue: exclusivamente mediante el runtime hipfire v0.4.2.1 o superior (`hipfire serve`, API compatible con OpenAI). llama.cpp no puede cargar los ficheros `.mq4`; para ese entorno existe la variante GGUF Q4_K_S del mismo fine-tune. Soporte en vLLM, TGI u Ollama: no disponible.
- Throughput medido: prefill de 1 196 tok/s (512 tokens) degradando a 1 101 tok/s (16K); decodificacion de 28,9 tok/s en matriz a 4K, 36,5 tok/s con MTP en prompts reales y 52-59 tok/s en ventanas de 16K a 49K.
- Latencia practica: aproximadamente 18 segundos hasta la primera respuesta en un prompt de 20K tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B hipfire MQ4 (este) | 27B | 262 144 entrenados; 49 152 verificados | `.mq4` + `.mtp`, hipfire | swift-open-license-v1.0 | 237 s en la suite de 6 tareas a 20K |
| Swift-1.5-Qwen3.8-27B GGUF Q4_K_S | 27B | no disponible en la informacion | GGUF, llama.cpp | swift-open-license-v1.0 | Mismo fine-tune; 530 s en la misma suite; ~23 tok/s de decodificacion |
| Qwen3.8-27B base en MQ4-XTS | 27B | 262 144 | `.mq4`, hipfire | no disponible | ~10 % mas rapido end-to-end que Swift-1.5; sin recorte de thinking; 70-86 tok/s de decodificacion |
| Swift-1.5-Qwen3.8-27B Quark FP8 dynamic AMD (ukisai) | 27B | no disponible | FP8, runtime AMD | no disponible | Variante FP8 del mismo fine-tune, publicada por el autor del ajuste |
| Swift 1.0 (UkisAI) | 27B | no disponible | no disponible | no disponible | Primera adaptacion; sustituida por Swift 1.5 |

No se dispone de datos de benchmarks de calidad que permitan comparar estos checkpoints con alternativas de otros autores del mismo tamano (por ejemplo, otros modelos de 27B-32B). Esa comparacion figura como no disponible.

## Limitaciones y advertencias

- Licencia `swift-open-license-v1.0`, etiquetada como `other`: es necesario revisar el fichero LICENSE antes de cualquier uso comercial; no es una licencia permisiva estandar (Apache 2.0, MIT) y la informacion disponible no detalla sus terminos.
- Compatibilidad restringida: los ficheros `.mq4` solo los carga hipfire v0.4.2.1 o superior; llama.cpp, vLLM, TGI y Ollama no pueden usarlos. Migrar a otro stack exige usar la variante GGUF.
- Verificacion en una unica GPU: todas las mediciones proceden de una RX 7900 XT (gfx1100) con ROCm 7.1. No hay datos de rendimiento ni de estabilidad en CUDA, en GPUs de otros fabricantes o en configuraciones multi-GPU.
- El contexto maximo practico es inferior al nominal: 49 152 tokens con especulacion activa y 98 304 sin ella; los prefills profundos provocan OOM en 20 GB pese a que la ventana de 262 144 tokens carga.
- La paridad de calidad del fine-tune con menos tokens de pensamiento es una afirmacion publicada por el autor del ajuste, no re-evaluada en la model card de este checkpoint. No hay benchmarks de calidad independientes.
- El modo de razonamiento reducido puede penalizar tareas que requieren deliberacion profunda; el propio autor senala que la base sin fine-tune conserva todo el rango de "deep thinking".
- Riesgo de alucinacion y sesgos: no cuantificados ni documentados en la informacion disponible.
- Idiomas soportados: no disponibles; no hay eval multilingue.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe validacion de la comunidad sobre el comportamiento en produccion.
- Dependencia de un runtime joven y de un autor unico para el empaquetado (datayoda), lo que implica riesgo de mantenimiento a medio plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/datayoda/Swift-1.5-Qwen3.8-27B-hipfire-MQ4
- Modelo base del fine-tune: https://huggingface.co/datayoda/Swift-1.5-Qwen3.8-27B
- Variante GGUF Q4_K_S del mismo fine-tune: https://huggingface.co/datayoda/Swift-1.5-Qwen3.8-27B-GGUF
- Runtime hipfire: https://github.com/MunGress/hipfire
- Pagina del modelo Swift 1.5 (UkisAI): https://ukisai.com/swift-1-5-27b
- Pagina de producto Swift (UkisAI): https://ukisai.com/products/swift
- Variante FP8 dynamic AMD: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-Quark-FP8-dynamic-AMD
- Variante GGUF en ModelScope: https://www.modelscope.cn/models/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
