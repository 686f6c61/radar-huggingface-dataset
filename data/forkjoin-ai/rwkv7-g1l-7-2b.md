# forkjoin-ai/rwkv7-g1l-7.2b

## Resumen

RWKV7-G1L-7.2B es un modelo base de generación de texto perteneciente a la familia RWKV-7 "G1L" (GooseOne), publicada por BlinkDL el 31 de octubre de 2026. Este artefacto concreto es una conversión y empaquetado realizado por Forkjoin.ai a partir de la conversión oficial a safetensors de la organización RWKV, con revisión fijada en `100541a755612fa970f77e04c17d3b25ff7d9d29`. El modelo nominal cuenta con 7.200 millones de parámetros y una ventana de entrenamiento de 34.304 tokens.

La relevancia técnica del modelo radica en su arquitectura: RWKV-7 es un transformer recurrente de atención lineal con estado constante token a token, sin caché KV creciente. Esto implica que el coste de decodificación es independiente de la posición de la secuencia dentro del contexto de entrenamiento, lo que lo diferencia radicalmente de los transformers clásicos en escenarios de generación larga. El vocabulario es de 65.536 entradas (RWKV World), con soporte declarado para doce idiomas.

Este artefacto concreto no es un checkpoint de `transformers`, ni safetensors, ni GGUF: se distribuye en un contenedor propietario `.knot`, un almacén de tensores direccionado por nombre que solo puede leer el runtime soberano de Forkjoin.ai. Está pensado como modelo base para post-entrenamiento y ajuste fino, no como asistente instruido. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (recurrente de atención lineal, estado constante) |
| Parametros totales | 7.2B (nominal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 34.304 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | Q8_0 por defecto (tensores de 65.536 elementos o más); F32 para tensores pequeños e islas forzadas `rwkv_w1`/`rwkv_w2` |
| Idiomas soportados | en, zh, fr, es, de, pt, ru, it, ja, ko, vi, ar |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor `.knot` (magic "KNOT", versión 1, cabecera JSON UTF-8 con tabla de tensores) |
| Dimensiones | L32-D4096: 4.096 ocultos, 32 bloques, FFN 16.384 |
| Cabezas de atención | 64 cabezas x 64, gate inner dim 480 |
| Low-rank W/A/V | 128 / 128 / 96 |
| Vocabulario | 65.536 (RWKV World) |
| Tensores en el artefacto | 1.062 (386 Q8_0, 676 F32) |
| Tamano del artefacto | 7.755.945.289 bytes (~7,76 GB) |
| SHA-256 | `f5bc74acbc612b11b77764a2b87ce8d557ebc490024ffbe1965d6ee9deea137f` |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura recurrente de atención lineal. A diferencia de un transformer convencional, mantiene un estado constante token a token y no acumula una caché KV que crezca con la secuencia. En la práctica, esto significa que el coste de decodificación no depende de la posición dentro de los 34.304 tokens del contexto de entrenamiento. La configuración concreta de esta rung es L32-D4096: 4.096 dimensiones ocultas, 32 bloques, 64 cabezas de 64 dimensiones, dimensión interna de gate 480, FFN de 16.384 y descomposiciones de bajo rango para W, A y V de 128, 128 y 96 respectivamente. El vocabulario es el RWKV World de 65.536 entradas.

El modelo base fue publicado por BlinkDL el 31 de octubre de 2026 bajo licencia Apache-2.0. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no están disponibles en la documentación consultada. La conversión a safetensors de la organización RWKV difiere del `.pth` original únicamente en metadatos (≤ 0,07 MB) y contiene los mismos tensores.

El empaquetado de Forkjoin.ai aplica una política de codificación fija: los tensores de 65.536 elementos o más se almacenan en Q8_0 (34 bytes por cada 32 valores: una escala f16 más 32 int8), mientras que los tensores menores y las islas forzadas `rwkv_w1`/`rwkv_w2` se guardan en F32. El contenedor incluye una cabecera JSON que fija offset, longitud y tipo de cada tensor, y un trailer de alineación a 3 bytes terminado en el marcador de códec `0x20`. Como la política de codificación es fija, el tamaño del artefacto es función pura de las formas: no varía con el número de tokens, el batch o el estado del runtime.

## Capacidades

- Generación de texto autoregresiva sobre el vocabulario RWKV World de 65.536 entradas.
- Modelo base: no está instruido ni alineado para seguir instrucciones; requiere post-entrenamiento o ajuste fino para tareas conversacionales.
- Soporte multilingüe declarado para doce idiomas: inglés, chino, francés, español, alemán, portugués, ruso, italiano, japonés, coreano, vietnamita y árabe.
- Decodificación con coste independiente de la posición dentro del contexto de 34.304 tokens, gracias al estado recurrente constante.
- Capacidad de continuación de texto y modelado de lenguaje general; útil como base para SFT, DPO o fine-tuning supervisado.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking en la información disponible.
- El artefacto está verificado mediante una prueba de admisión de dos lados sobre el `.knot` aterrizado, usando IDs del tokenizador RWKV World: el prompt `[6699, 51128, 4706, 44312, 4600]` produce `37138` (" Paris") como argmax, y el token `22590` no gana el argmax.

## Casos de uso

- Ajuste fino supervisado para asistentes de dominio: al ser un modelo base Apache-2.0, se puede entrenar con SFT sobre datos propios para crear un asistente especializado en un vertical concreto (legal, sanitario, atención interna) sin restricciones de licencia adicionales.
- Generación de texto largo con coste de decodificación estable: la arquitectura recurrente de estado constante evita el crecimiento de la caché KV, lo que resulta adecuado para continuaciones largas dentro del contexto de 34.304 tokens, como redacción de documentos extensos o resúmenes de informes.
- Investigación en arquitecturas recurrentes: sirve como punto de comparación frente a transformers de tamaño similar para estudiar el comportamiento de la atención lineal en tareas de modelado de lenguaje, con la ventaja de que el artefacto es de tamaño fijo e inspeccionable.
- Experimentación en inferencia soberana: el contenedor `.knot` y el runtime de Forkjoin.ai están diseñados para despliegues controlados por el operador, lo que encaja en entornos con requisitos de residencia de datos o ausencia de dependencias de proveedores cloud.
- Destilación y generación de datos sintéticos: al ser un modelo base multilingüe, puede emplearse para generar corpus sintéticos en los doce idiomas soportados antes de un posterior filtrado y ajuste.
- Evaluación de pipelines de cuantización Q8_0/F32: el artefacto documenta con precisión la política de codificación y el SHA-256, lo que permite reproducir y auditar el efecto de la cuantización Q8_0 sobre un modelo base de 7.2B.
- Base para investigación multilingüe comparada: con doce idiomas declarados y un vocabulario World, permite estudiar transferencia entre idiomas tras un ajuste fino ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de admisión y de servicio en hardware propio del operador, que no deben interpretarse como benchmarks portables.

| Metrica | Valor | Contexto |
|---|---|---|
| Prueba de admisión (forward denso, prompt de 5 tokens) | 64,89 s (mediana de 3 ejecuciones dedicadas) | Witness de admisión, no benchmark de throughput |
| Decodificación single-stream greedy (8 hilos, LAN) | 0,890 tok/s | Estación `durata`, hardware propio del operador |
| Rung 1.5B (referencia) | 3,604 tok/s | Misma estación, 8 hilos |
| Rung 2.9B (referencia) | 2,002 tok/s | Misma estación, 8 hilos |
| Rung 13.3B (referencia) | 0,687 tok/s | Estación `serata` (10.0.0.189:9104) |

Las cifras de 7.2B y 13.3B corresponden a carriles de residencia completa / R2-Range, mientras que 1.5B y 2.9B caben en la envolvente de flota con sharding por capas. El autor advierte explícitamente de que estas medidas varían con la contención y la caché de tensores, y que no son portables.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto pesa 7.755.945.289 bytes (~7,76 GB) en su codificación Q8_0/F32; se necesita al menos esa cantidad de memoria para una carga completa en residencia, más el estado recurrente y el overhead del runtime.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, una GPU con 16 GB o más de memoria (RTX 4090, A100 40 GB, H100) permite la residencia completa del artefacto; una GPU de 12 GB queda por debajo del tamaño del contenedor y requeriría estrategias de carga parcial no documentadas.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 16 GB o más (RTX 4090, RTX 4080, RTX 3090), aunque el runtime `.knot` de Forkjoin.ai no documenta requisitos oficiales de VRAM en la información disponible.
- Opciones de despliegue: el artefacto solo es legible por el runtime soberano de Forkjoin.ai (knot runtime). No es compatible con `transformers`, llama.cpp, vLLM, TGI ni Ollama. Para esos ecosistemas habría que usar el modelo base original en safetensors o una conversión a GGUF, no este `.knot`.
- Latencia y throughput: 0,890 tok/s en decodificación single-stream greedy con 8 hilos sobre LAN propia del operador (estación `durata`). No hay datos publicados de throughput agregado, batch o latencia en GPU.
- Almacenamiento: 7,76 GB para el artefacto; el autor indica que el objeto en Hugging Face es byte-idéntico al alojado en R2 (`https://r2.edgework.ai/models/rwkv7-g1l-7.2b.knot`), con el mismo tamaño y SHA-256.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| forkjoin-ai/rwkv7-g1l-7.2b (este) | 7.2B | 34.304 | RWKV-7 (recurrente, atención lineal) | Apache-2.0 | `.knot` (Q8_0 + F32) | Solo runtime soberano de Forkjoin.ai |
| RWKV/RWKV7-G1l-7.2B-20261031 | 7.2B | 34.304 | RWKV-7 | Apache-2.0 | safetensors | Modelo base oficial; compatible con ecosistema estándar |
| forkjoin-ai/rwkv7-g1l-13.3b | 13.3B | no disponible | RWKV-7 | Apache-2.0 | `.knot` | Rung superior de la misma familia; 0,687 tok/s en LAN |
| forkjoin-ai/rwkv7-g1l-2.9b | 2.9B | no disponible | RWKV-7 | Apache-2.0 | `.knot` | Rung inferior; 2,002 tok/s en LAN |
| forkjoin-ai/rwkv7-g1l-1.5b | 1.5B | no disponible | RWKV-7 | Apache-2.0 | `.knot` | Rung inferior; 3,604 tok/s en LAN |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con transformers de tamaño similar (por ejemplo, familias de 7B densas). La comparación disponible se limita a parámetros, contexto, licencia, formato y throughput medido en el mismo hardware del operador.

## Limitaciones y advertencias

- El artefacto no es un checkpoint de `transformers`, safetensors ni GGUF: cargarlo con `from_pretrained` no funcionará. Solo es legible por el runtime `.knot` de Forkjoin.ai, lo que limita su portabilidad y crea dependencia de un proveedor concreto.
- Es un modelo base, no un asistente instruido: no sigue instrucciones de forma fiable sin post-entrenamiento o ajuste fino previo.
- No se documentan datos sobre sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- El contexto de entrenamiento es de 34.304 tokens; no se documenta soporte de extrapolación más allá de esa ventana.
- El soporte multilingüe se declara para doce idiomas, pero no se aportan métricas por idioma que permitan evaluar la calidad relativa en cada uno.
- La licencia Apache-2.0 permite uso comercial y redistribución, pero exige mantener la atribución y la licencia del modelo base; el autor pide conservar esta atribución al redistribuir el artefacto.
- Las cifras de rendimiento publicadas (0,890 tok/s) proceden de hardware LAN propio del operador, single-stream y con contención variable; no son extrapolables a otros entornos ni a cargas en batch.
- La prueba de admisión (64,89 s para un forward denso de 5 tokens) es un witness de admisión, no una medida de throughput; no debe usarse para dimensionar despliegues.
- El contenedor no admite cuantizaciones alternativas: la política Q8_0/F32 está fijada y el tamaño es función pura de las formas.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking, por lo que no debe asumirse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/forkjoin-ai/rwkv7-g1l-7.2b
- Modelo base en Hugging Face: https://huggingface.co/RWKV/RWKV7-G1l-7.2B-20261031
- Pesos originales de BlinkDL: https://huggingface.co/BlinkDL/rwkv7-g1
- Artefacto en R2: https://r2.edgework.ai/models/rwkv7-g1l-7.2b.knot
- Rung 1.5B: https://huggingface.co/forkjoin-ai/rwkv7-g1l-1.5b
- Rung 2.9B: https://huggingface.co/forkjoin-ai/rwkv7-g1l-2.9b
- Rung 13.3B: https://huggingface.co/forkjoin-ai/rwkv7-g1l-13.3b
- Documentación de onboarding del runtime: https://github.com/forkjoin-ai/mono (ruta `open-source/gnosis/distributed-inference/RWKV7_G1L_ONBOARDING.md`)
