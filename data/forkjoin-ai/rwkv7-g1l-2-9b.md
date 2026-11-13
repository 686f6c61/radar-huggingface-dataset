# forkjoin-ai/rwkv7-g1l-2.9b

## Resumen

RWKV7-G1l-2.9B es un contenedor `.knot` que empaqueta los pesos base del modelo RWKV-7 "G1L" (GooseOne) de 2.9B parámetros, publicado originalmente por BlinkDL el 31 de octubre de 2026 y convertido a safetensors por la organización RWKV. Este artefacto lo ha generado Forkjoin.ai mediante su codificador soberano a partir de la revisión fijada `80a22af822eb49b5c5a370abccf7a4a365f0f863`, con cuantización mixta Q8_0 y F32 en islas específicas.

El modelo emplea una arquitectura recurrente de atención lineal (RWKV-7), lo que implica un estado constante token a token y la ausencia de una caché KV que crezca con la secuencia. Esto hace que el coste de decodificación sea independiente de la posición dentro del contexto de entrenamiento de 34.304 tokens. La arquitectura es L32-D2560, con 40 cabezas de 64 dimensiones, dimensión oculta de 2.560, FFN de 10.240 y vocabulario World de 65.536 entradas.

Es relevante porque se trata de un modelo base (no afinado para instrucciones) pensado para post-entrenamiento y ajuste fino, distribuido bajo licencia Apache-2.0 y con un formato de contenedor propietario que no es compatible con `transformers`, safetensors ni GGUF. Su interés práctico está en escenarios de inferencia soberana sobre hardware modesto y en el estudio de arquitecturas recurrentes lineales como alternativa a los transformers con atención cuadrática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (atención lineal recurrente), L32-D2560 |
| Parametros totales | 2.9B (nominales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 34.304 tokens (entrenamiento) |
| Tipos de cuantizacion | Q8_0 (por defecto) y F32 (islas forzadas `rwkv_w1`/`rwkv_w2`) |
| Idiomas soportados | en, zh, fr, es, de, pt, ru, it, ja, ko, vi, ar |
| Licencia | Apache-2.0 |
| Formato de pesos | `.knot` (contenedor name-addressed propio, no safetensors/GGUF) |
| Cabezas de atencion | 40 x 64 |
| Dimension FFN | 10.240 |
| Vocabulario | 65.536 (RWKV World) |
| Tamano del artefacto | 3.183.211.349 bytes |
| SHA-256 | `892207f7e64313a98db62b541982dbaf694f984de1f87fc4861db937bdfd24b2` |
| Numero de tensores | 1.062 (386 Q8_0, 676 F32) |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura de atención lineal recurrente: mantiene un estado constante token a token y no acumula una caché KV que crezca con la longitud de la secuencia. En la práctica, el coste de decodificación es independiente de la posición dentro de los 34.304 tokens de contexto de entrenamiento. La configuración concreta de esta variante es L32-D2560: 32 bloques, 2.560 dimensiones ocultas, 40 cabezas de 64 dimensiones, dimensión interna de puerta de 320, FFN de 10.240 y descomposición de bajo rango W/A/V de 96/96/64. El vocabulario es el RWKV World de 65.536 entradas.

El artefacto contiene 1.062 tensores: 386 almacenados en Q8_0 (34 bytes por cada 32 valores: una escala f16 más 32 int8) y 676 en F32. Los tensores de 65.536 elementos o más se guardan en Q8_0; los más pequeños, junto con las islas forzadas `rwkv_w1`/`rwkv_w2`, se guardan en F32. La política de codificación es fija, por lo que el recuento de bytes es una función pura de las formas: ni el número de tokens, ni el tamaño de lote, ni el estado del runtime alteran el artefacto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base procede de BlinkDL/rwkv7-g1 (Apache-2.0) y la conversión oficial a safetensors la realiza la organización RWKV; la diferencia con los pesos `.pth` originales es únicamente de metadatos (≤ 0,07 MB).

## Capacidades

- Generación de texto autoregresiva sobre un modelo base, sin ajuste para instrucciones.
- Razonamiento y continuación de texto multilingüe en los 12 idiomas declarados (en, zh, fr, es, de, pt, ru, it, ja, ko, vi, ar).
- Decodificación con coste constante respecto a la posición dentro del contexto de 34.304 tokens, gracias a la atención lineal recurrente.
- Punto de partida para post-entrenamiento y ajuste fino (no es un asistente conversacional listo para uso directo).
- No se ha documentado soporte de tool calling, function calling, capacidades de agente, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Ajuste fino supervisado para dominios verticales: al ser un modelo base Apache-2.0 de 2.9B, puede reentrenarse sobre corpus propios (legal, médico, técnico) sin restricciones de licencia comercial, partiendo de los pesos empaquetados en `.knot`.
- Investigación en arquitecturas recurrentes lineales: permite comparar el comportamiento de RWKV-7 frente a transformers de tamaño similar en tareas de modelado de lenguaje, midiendo perplejidad y calidad de generación con coste de decodificación constante.
- Inferencia en hardware modesto: con 3,18 GB de artefacto y decodificación independiente de la posición, encaja en despliegues con CPU de 8 hilos (2.002 tok/s en LAN, 6,084 tok/s en `n2-standard-16` con AVX2) sin necesidad de GPU.
- Experimentos de destilación: el modelo base puede actuar como profesor o alumno en pipelines de destilación hacia modelos más pequeños o más grandes de la misma familia (1.5B, 7.2B, 13.3B), todos disponibles en el mismo formato.
- Generación de texto multilingüe de bajo coste: útil para tareas de continuación, resumen o reescritura en los 12 idiomas soportados cuando no se requiere un asistente instruido.
- Despliegue en entornos con requisitos de soberanía de datos: el contenedor `.knot` y el runtime asociado permiten servir el modelo sin dependencias de `transformers` ni de servicios en la nube, manteniendo los pesos bajo control local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento medidos son de serving:

| Sustrato | Condiciones | tok/s |
|---|---|---|
| LAN (estación `durata`) | 8 hilos, single-stream, greedy | 2.002 |
| Cloud Run `g1l-cloud-2-9b` | 8 vCPU, gVisor, SSE4.1, 8 hilos FRF | 3.16 (mediana SSE; rango 2.915–4.51) |
| GCE `n2-standard-16` | 8 núcleos físicos, AVX2/FMA, caché residente, 8 hilos | 6.084 (mediana del barrido de hilos) |

Sonda de admisión: forward denso único sobre un prompt de 5 tokens en 15,88 s (mediana de 3 ejecuciones dedicadas). Este dato es un testigo de admisión, no una medición de throughput.

## Requisitos de hardware

- VRAM estimada: no disponible (el artefacto está pensado para inferencia en CPU; el tamaño del contenedor es de 3,18 GB).
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: no disponible; el modelo se ha medido únicamente en CPU (8 hilos, AVX2/FMA y SSE4.1).
- Opciones de despliegue: runtime soberano `knot` de Forkjoin.ai (no compatible con `from_pretrained`, vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: 2.002 tok/s en LAN con 8 hilos, 3.16 tok/s en Cloud Run con SSE4.1 y 6.084 tok/s en `n2-standard-16` con AVX2/FMA (mejor configuración medida).
- Almacenamiento: 3.183.211.349 bytes para el artefacto; el modelo 1.5B y 2.9B caben en la envolvente de flota con sharding por capas, mientras que 7.2B y 13.3B requieren residente completo o carriles R2-Range.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento medido |
|---|---|---|---|---|---|
| forkjoin-ai/rwkv7-g1l-2.9b | 2.9B | 34.304 | Apache-2.0 | `.knot` (Q8_0/F32) | 2.002 tok/s LAN; 6.084 tok/s AVX2 |
| forkjoin-ai/rwkv7-g1l-1.5b | 1.5B | no disponible | Apache-2.0 | `.knot` | 3.604 tok/s LAN |
| forkjoin-ai/rwkv7-g1l-7.2b | 7.2B | no disponible | Apache-2.0 | `.knot` | 0.890 tok/s LAN |
| forkjoin-ai/rwkv7-g1l-13.3b | 13.3B | no disponible | Apache-2.0 | `.knot` | 0.687 tok/s LAN |

No se dispone de comparativas con modelos de otras familias (Llama, Qwen, Mistral) en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no un asistente instruido: no está alineado para seguir instrucciones ni para conversación directa sin post-entrenamiento.
- El formato `.knot` es propietario y no es compatible con `transformers`, safetensors, GGUF, vLLM, llama.cpp, Ollama ni TGI; cargarlo con `from_pretrained` no funcionará.
- El contexto de entrenamiento es de 34.304 tokens; no se ha documentado comportamiento más allá de esa longitud.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución al modelo base y los enlaces upstream al redistribuir el artefacto.
- El rendimiento medido es de un único flujo (single-stream) y en configuraciones concretas de CPU; no debe extrapolarse a GPU ni a cargas concurrentes.
- El modelo 2.9B cabe en la envolvente de flota con sharding por capas, pero no se ha validado su comportamiento en GPU en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/forkjoin-ai/rwkv7-g1l-2.9b
- Modelo base (safetensors): https://huggingface.co/RWKV/RWKV7-G1l-2.9B-20261031
- Pesos originales: https://huggingface.co/BlinkDL/rwkv7-g1
- Artefacto en R2: https://r2.edgework.ai/models/rwkv7-g1l-2.9b.knot
- Familia 1.5B: https://huggingface.co/forkjoin-ai/rwkv7-g1l-1.5b
- Familia 7.2B: https://huggingface.co/forkjoin-ai/rwkv7-g1l-7.2b
- Familia 13.3B: https://huggingface.co/forkjoin-ai/rwkv7-g1l-13.3b
