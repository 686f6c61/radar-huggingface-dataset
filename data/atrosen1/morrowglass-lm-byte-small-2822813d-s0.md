# atrosen1/morrowglass-lm-byte-small-2822813d-s0

## Resumen

morrowglass-lm-byte-small-2822813d-s0 es un modelo de lenguaje decoder-only de 1.869.504 parámetros entrenado desde cero por Morrowglass Model Foundry, un laboratorio de modelos en miniatura orientado a la reproducibilidad. No es un modelo de propósito general ni está ajustado con instrucciones: su única función es continuar texto con un estilo similar al de Shakespeare. Se distribuye con licencia MIT y pesos en safetensors.

El modelo emplea una arquitectura transformer pre-LayerNorm de 4 capas, 4 cabezas de atención y dimensión oculta 192, con posiciones aprendidas, embeddings atados y una ventana de contexto de 256 tokens. Utiliza un tokenizador a nivel de byte (vocabulario de 256, UTF-8), lo que elimina la necesidad de ficheros de vocabulario externos. Fue entrenado durante 2.500 pasos sobre 20.480.000 tokens con AdamW (lr 0.003) en un Apple M5 Pro mediante MPS, en 291 segundos.

Su relevancia no reside en el rendimiento lingüístico, sino en su valor como banco de pruebas reproducible: documenta experimentos preinscritos sobre capacidad, tokenización y decodificación, mediciones de servicio con y sin caché KV, y cuantización int8, todo con registros generados por código. Es útil para estudiar formación, evaluación y despliegue de modelos pequeños en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only pre-LayerNorm, 4 capas x 4 cabezas x d=192, posiciones aprendidas, embeddings atados |
| Parametros totales | 1.869.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | int8 dinámica (CPU); no se documentan otras |
| Idiomas soportados | en (inglés, estilo Shakespeare) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería morrowglass, PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con pre-LayerNorm, cuatro capas, cuatro cabezas de atención y dimensión de modelo 192, con posiciones aprendidas y embeddings de entrada/salida atados. El tokenizador opera sobre bytes UTF-8 con vocabulario de 256, sin fichero de vocabulario. El entrenamiento se realizó desde cero durante 2.500 pasos sobre 20.480.000 tokens con AdamW y learning rate 0.003, en un Apple M5 Pro con backend MPS (291 s). No se documenta RLHF, DPO ni ajuste por instrucciones.

Los datos provienen del eBook #100 de Project Gutenberg (obras completas de Shakespeare, dominio público, sin texto boilerplate), dividido por obra con semilla fija: validación con *As You Like It*, *Hamlet* y *Titus Andronicus*; test con *Macbeth*, *Pericles* y *Cymbeline*; el resto (incluidos los poemas) para entrenamiento. La selección del modelo usó únicamente validación. El run pertenece a experimentos preinscritos con criterios fijados antes de ejecutar: capacidad a presupuesto de tokens igual (soportado), transformer desde cero frente a baselines de conteo (no soportado) y byte frente a BPE-1024 (soportado, con BPE obteniendo 2.007 frente a 2.086 bits/byte en validación).

## Capacidades

- Generación de texto por continuación de secuencia en estilo shakespeariano (pastiche).
- Modelado de lenguaje a nivel de byte sobre texto en inglés de dominio público.
- Inspección de atención y análisis de elecciones de entrenamiento (ablaciones de capacidad y tokenización).
- Servicio mediante API compatible con OpenAI (`morrowglass serve`).
- Decodificación con caché KV y cuantización int8 dinámica en CPU.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Docencia sobre transformers: el modelo permite inspeccionar mapas de atención y capas en un tamaño que cabe en un portátil, con cuatro capas y dimensión 192, lo que facilita visualizar activaciones sin infraestructura GPU.
- Ablaciones de entrenamiento reproducibles: sirve para comparar tokenización byte frente a BPE-1024 o capacidad pequeña frente a media bajo el mismo presupuesto de tokens, con métricas registradas por código (bits por byte).
- Pruebas de servicio y caché KV: las mediciones publicadas (por ejemplo, 364,4 frente a 903,8 tokens/s en CPU con prompt de 16 tokens) permiten validar implementaciones de decodificación incremental en hardware de consumo.
- Evaluación de cuantización: la comparación int8 documentada (bpb 2,0858 a 2,0875; pesos de 7,141 a 2,169 MB) sirve como caso de estudio de la relación entre compresión, latencia y calidad en modelos minúsculos.
- Integración de endpoints compatibles con OpenAI: útil para probar clientes, SDK y harnesses (EleutherAI lm-evaluation-harness) contra un servidor local sin coste de GPU.
- Estudio de calibración y evaluación: con ECE top-1 de 0,029 en validación y métricas en bits por byte con intervalos bootstrap, es adecuado para ejercicios de evaluación estadística de modelos.
- Generación creativa de pastiche histórico controlado: en entornos de demostración donde el texto shakespeariano simulado es aceptable y no se requiere corrección factual.

## Benchmarks y rendimiento

Evaluación en obras retenidas, bits por byte UTF-8 (menor es mejor), con intervalo de confianza bootstrap del 95 % sobre ventanas de evaluación:

| Split | bits/byte | Nota |
|---|---|---|
| Validación | 2,086 [2,074, 2,098] | ECE top-1 0,029 |
| Test | 2,171 [2,158, 2,183] | abierto una vez el 2026-11-09, registrado en `reports/test_access_log.jsonl` |

Resultados de experimentos preinscritos:

| Experimento | Veredicto | Detalle |
|---|---|---|
| Capacidad a presupuesto de tokens igual | soportado | bpb con datos completos: tiny 2,335 / small 2,086 / medium 2,037; con datos escasos (240 KB) la pérdida de validación de medium subió +1,257 nats tras el paso 550 |
| Transformer desde cero frente a baselines de conteo | no soportado | Transformer 2,086 bpb frente al mejor n-grama (kneser-ney-4, bpe1024) 2,107 |
| Byte frente a BPE-1024 | soportado | BPE 2,007 frente a byte 2,086 bpb en validación |

Mediciones de servicio (Apple M5 Pro, 2 hilos, batch 1, greedy, 64 tokens nuevos):

| Dispositivo | Tokens de prompt | Tokens/s sin caché | Tokens/s con caché KV | Aceleración |
|---|---|---|---|---|
| cpu | 16 | 364,4 | 903,8 | 2,48x |
| cpu | 64 | 240,3 | 785,5 | 3,27x |
| cpu | 192 | 109,4 | 398,6 | 3,64x |
| mps | 16 | 138,5 | 112,5 | 0,81x |
| mps | 64 | 134,9 | 129,9 | 0,96x |
| mps | 192 | 119,1 | 138,5 | 1,16x |

Cuantización int8 dinámica en CPU: bpb de validación 2,0858 a 2,0875 (+0,0016); decodificación de 33,3 a 25,6 tokens/s; pesos de 7,141 a 2,169 MB. Veredicto registrado: no soportado.

EleutherAI lm-evaluation-harness (0-shot, mediante endpoint compatible con OpenAI):

| Tarea | Métrica | Valor |
|---|---|---|
| lambada_openai | acc | 0,0002 |
| wikitext (wikitext-2) | bits/byte | 3,396 |
| split de validación Shakespeare propio | bits/byte | 2,085 (evaluador propio: 2,086) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (pesos de aproximadamente 7,1 MB) y aproximadamente 2,2 MB en int8 dinámico; el modelo cabe en memoria de CPU sin GPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Se ha medido en Apple M5 Pro con backend MPS y en CPU con 2 hilos.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en dispositivos de baja memoria; no obstante, el backend MPS no mostró ventaja frente a CPU en las mediciones publicadas.
- Opciones de despliegue: `morrowglass serve` con API compatible con OpenAI; carga mediante `MorrowglassHubLM.from_pretrained`; el harness de EleutherAI puede apuntar al endpoint. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: hasta 903,8 tokens/s en CPU con caché KV y prompt de 16 tokens; 398,6 tokens/s con prompt de 192 tokens; 25,6 tokens/s en int8 dinámico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| morrowglass-lm-byte-small-2822813d-s0 | 1,87 M | 256 | MIT | safetensors | Entrenado desde cero en Shakespeare; sin ajuste por instrucciones |
| Baseline kneser-ney-4 con BPE-1024 (mismo proyecto) | no aplica (n-grama) | no disponible | no disponible | no disponible | 2,107 bpb frente a 2,086 del transformer en validación |
| Variante BPE-1024 del mismo proyecto | no disponible | no disponible | no disponible | no disponible | 2,007 bpb en validación frente a 2,086 con byte |
| Modelos pequeños de propósito general (p. ej. familias de menos de 10 M) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Alrededor de 2 M de parámetros entrenados sobre unos 4,5 MB de texto de un solo autor: la salida es pastiche con frecuentes sinsentidos y pierde el hilo dentro de una frase.
- Contexto de 256 tokens; las peticiones más largas se recortan a los últimos 256 tokens.
- Las probabilidades son puntuaciones del modelo, no confianza calibrada por token individual.
- Sin ajuste de seguridad: las obras de Shakespeare contienen violencia y prejuicios de época que las muestras pueden reproducir.
- Una sola semilla de entrenamiento en este run; el entrenamiento en MPS no es reproducible bit a bit.
- Uso previsto exclusivamente educativo y de medición; fuera de alcance cualquier generación orientada al usuario, respuestas factuales, chat o inglés moderno.
- Rendimiento muy bajo en tareas estándar: 0,0002 de accuracy en lambada_openai y 3,396 bits/byte en wikitext-2.
- Licencia MIT para código y pesos; el texto de entrenamiento es de dominio público, sin restricciones comerciales documentadas adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/atrosen1/morrowglass-lm-byte-small-2822813d-s0
- Repositorio del proyecto: https://github.com/AlexRosen23/morrowglass-model-foundry
