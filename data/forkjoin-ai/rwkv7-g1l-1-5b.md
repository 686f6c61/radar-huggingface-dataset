# forkjoin-ai/rwkv7-g1l-1.5b

## Resumen

RWKV7-G1l-1.5B es un modelo de lenguaje base de 1.500 millones de parámetros perteneciente a la familia RWKV-7 "G1L" (GooseOne), publicada por BlinkDL el 31 de octubre de 2026. Este repositorio concreto, alojado por forkjoin-ai, no contiene los pesos originales en safetensors, sino un contenedor propietario en formato `.knot` (Q8_0 con islas F32) empaquetado por el codificador soberano de Forkjoin.ai a partir de la conversión oficial de la organización RWKV. Es, por tanto, un artefacto derivado cuantizado, no un checkpoint estándar.

La arquitectura subyacente es RWKV-7, un transformer recurrente de atención lineal con estado constante por token y sin caché KV creciente, lo que hace que el coste de decodificación sea independiente de la posición dentro del contexto. El modelo cuenta con 24 bloques, dimensión oculta de 2.048, vocabulario World de 65.536 tokens y una longitud de contexto de entrenamiento de 34.304 tokens. Está pensado como modelo base para post-entrenamiento y fine-tuning, no como asistente instruido.

Su relevancia radica en dos factores: por un lado, la eficiencia de inferencia de la arquitectura RWKV en despliegues de un solo flujo; por otro, el formato `.knot`, que busca servir como alternativa autocontenida a GGUF o safetensors dentro del stack de inferencia distribuida de Forkjoin.ai. No obstante, al no ser compatible con `transformers`, llama.cpp ni vLLM, su adopción queda restringida al runtime propietario del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (recurrente, atención lineal), L24-D2048 |
| Parametros totales | 1.5B (nominal) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 34.304 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | Q8_0 (por defecto) + islas F32 forzadas en `rwkv_w1`/`rwkv_w2` |
| Idiomas soportados | en, zh, fr, es, de, pt, ru, it, ja, ko, vi, ar |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | `.knot` (contenedor propietario name-addressed; no safetensors, no GGUF) |
| Vocabulario | 65.536 (RWKV World) |
| Cabezas de atención | 32 x 64 |
| FFN | 8.192 |
| Dimensiones de bajo rango (W/A/V) | 96 / 96 / 64 |
| Número de tensores | 798 (290 Q8_0, 508 F32) |
| Tamaño del artefacto | 1.653.701.637 bytes (~1,54 GiB) |
| SHA-256 | `117d66fb5c354fe46849e60f1e9cc81d711885a62cddf9b1c6ae61c613197bd8` |
| Librería | `rwkv` (runtime knot) |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura recurrente de atención lineal: mantiene un estado constante por token en lugar de una caché KV que crece con la secuencia, de modo que el coste de decodificación no depende de la posición dentro de los 34.304 tokens de contexto de entrenamiento. La configuración L24-D2048 incluye 24 bloques, anchura oculta de 2.048, 32 cabezas de 64 dimensiones, dimensión interna de puerta de 256, FFN de 8.192 y descomposiciones de bajo rango de 96/96/64 para las matrices W/A/V. El vocabulario es el RWKV World de 65.536 tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO o ajuste por preferencias; la model card del artefacto no los detalla. Se trata de un modelo base, no instruido, por lo que no se han aplicado etapas de alineación orientadas a asistente. La innovación técnica destacable a nivel de artefacto es el contenedor `.knot`: un almacén de tensores direccionado por nombre con cabecera JSON que fija offset, longitud y tipo de almacenamiento de cada tensor. Los tensores de 65.536 elementos o más se codifican en Q8_0 (34 bytes por cada 32 valores: una escala f16 más 32 int8), mientras que los tensores menores y las islas forzadas `rwkv_w1`/`rwkv_w2` se guardan en F32. La política de codificación es fija, por lo que el tamaño del artefacto es función pura de las formas.

## Capacidades

- Generación de texto autoregresiva como modelo base; requiere fine-tuning o post-entrenamiento para tareas instruidas.
- Razonamiento y generación de código y matemáticas potencialmente presentes en los datos de preentrenamiento, pero sin garantías de alineación al no estar instruido.
- Soporte multilingüe declarado para 12 idiomas: inglés, chino, francés, español, alemán, portugués, ruso, italiano, japonés, coreano, vietnamita y árabe.
- Decodificación de coste constante por token gracias a la atención lineal recurrente, independiente de la posición en la secuencia.
- No hay evidencia en la información disponible de soporte nativo de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Compatible únicamente con el runtime knot de Forkjoin.ai; no funciona con `from_pretrained` de `transformers`.

## Casos de uso

- Fine-tuning para dominio específico: al ser un modelo base Apache-2.0 de 1.5B, puede ajustarse con LoRA o full fine-tuning sobre corpus propios (legal, médico, atención al cliente) y desplegarse después en el runtime knot.
- Investigación en arquitecturas recurrentes: permite reproducir experimentos sobre atención lineal y decodificación de coste constante sin caché KV, comparando con transformers de tamaño similar.
- Generación de texto en streaming de baja latencia: el coste de decodificación independiente de la posición lo hace adecuado para aplicaciones interactivas donde el contexto crece durante la sesión.
- Procesamiento de documentos largos hasta 34.304 tokens: resumen, extracción de entidades o clasificación sobre contratos o informes sin truncamiento agresivo.
- Despliegue en hardware modesto: con ~1,54 GiB en Q8_0, cabe en GPUs de consumo y en estaciones de trabajo sin aceleradores dedicados de gran capacidad.
- Evaluación de la cadena de herramientas soberana de Forkjoin.ai: sirve como banco de pruebas para validar el contenedor `.knot`, el runtime y los flujos de admisión de dos lados.
- Traducción y generación multilingüe entre los 12 idiomas declarados, previo ajuste fino supervisado para calidad de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de admisión y de servicio en hardware propio:

| Métrica | Valor | Contexto |
|---|---|---|
| Forward denso sobre prompt de 5 tokens | 8,06 s (mediana de 3 ejecuciones) | Witness de admisión, no benchmark de throughput |
| Decodificación single-stream greedy (LAN, 8 hilos) | 3,604 tok/s | Estación `durata`, hardware propio |
| Sonda de aceptación | `[6699, 51128, 4706, 44312, 4600]` → `37138` (" Paris") | PASS |
| Sonda de rechazo | `22590` no gana el argmax | PASS |

El autor advierte explícitamente de que estas cifras no son portables: se midieron en LAN propia, en un solo flujo y varían con la contención y la caché de tensores. La comparación entre peldaños de la familia (1.5B: 3,604 tok/s; 2.9B: 2,002; 7.2B: 0,890; 13.3B: 0,687) refleja el escalado de coste con el tamaño, no una comparación con otras arquitecturas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,6 GB para el artefacto en Q8_0 con islas F32; añadir overhead del runtime y del estado recurrente (constante por token, no crece con la secuencia).
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM efectiva; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. También viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier modelo con 2 GB o más de VRAM, incluidos portátiles con GPU integrada reciente.
- Opciones de despliegue: exclusivamente el runtime knot de Forkjoin.ai (`encode-ssm-models.py`, `verify-rwkv7-knot.py`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: 3,604 tok/s en decodificación single-stream sobre estación LAN de 8 hilos; el forward denso de admisión tardó 8,06 s sobre un prompt de 5 tokens. No hay datos de throughput con batching ni multi-stream.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| forkjoin-ai/rwkv7-g1l-1.5b | 1.5B | 34.304 | `.knot` (Q8_0 + F32) | Apache-2.0 | 3,604 tok/s single-stream LAN |
| RWKV/RWKV7-G1l-1.5B-20261031 (base) | 1.5B | 34.304 | safetensors | Apache-2.0 | no disponible |
| forkjoin-ai/rwkv7-g1l-2.9b | 2.9B | no disponible | `.knot` | Apache-2.0 | 2,002 tok/s single-stream LAN |
| forkjoin-ai/rwkv7-g1l-7.2b | 7.2B | no disponible | `.knot` | Apache-2.0 | 0,890 tok/s single-stream LAN |

La comparación con transformers densos de tamaño similar (por ejemplo, Llama 3.2 1B o Qwen2.5 1.5B) no está disponible en la información proporcionada: no hay benchmarks comunes ni datos de rendimiento cruzado. La única referencia interna es el propio peldaño superior de la familia RWKV-7 G1L empaquetado por el mismo autor.

## Limitaciones y advertencias

- Es un modelo base, no un asistente instruido: no responde de forma fiable a instrucciones sin post-entrenamiento previo.
- Formato propietario `.knot`: no se puede cargar con `from_pretrained`, llama.cpp, vLLM, Ollama ni TGI. El ecosistema de herramientas estándar no lo soporta.
- Dependencia total del runtime de Forkjoin.ai, cuyo código de onboarding se referencia en el monorepo del autor; la continuidad del proyecto condiciona la usabilidad del artefacto.
- Riesgo de alucinación inherente a un modelo base de 1.5B sin alineación; no apto para producción sin evaluación y ajuste.
- Sesgos potenciales derivados de los datos de preentrenamiento, no documentados en la información disponible.
- Longitud de contexto de 34.304 tokens: suficiente para documentos medios, pero inferior a los 128K de muchos transformers contemporáneos.
- Idiomas declarados sin métricas de calidad por idioma; el rendimiento en español, árabe o vietnamita no está verificado.
- Licencia Apache-2.0 permite uso comercial y redistribución, pero exige conservar la atribución y el aviso de licencia del modelo base.
- Las cifras de rendimiento proceden de hardware propio del autor en LAN y no son extrapolables a entornos de producción ajenos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/forkjoin-ai/rwkv7-g1l-1.5b
- Modelo base (conversión oficial RWKV): https://huggingface.co/RWKV/RWKV7-G1l-1.5B-20261031
- Pesos originales de BlinkDL: https://huggingface.co/BlinkDL/rwkv7-g1
- Artefacto en R2: https://r2.edgework.ai/models/rwkv7-g1l-1.5b.knot
- Onboarding del runtime knot: https://github.com/forkjoin-ai/monorepo/blob/... (ruta `open-source/gnosis/distributed-inference/RWKV7_G1L_ONBOARDING.md`)
- Peldaño 2.9B de la misma familia: https://huggingface.co/forkjoin-ai/rwkv7-g1l-2.9b
- Peldaño 7.2B de la misma familia: https://huggingface.co/forkjoin-ai/rwkv7-g1l-7.2b
- Peldaño 13.3B de la misma familia: https://huggingface.co/forkjoin-ai/rwkv7-g1l-13.3b
