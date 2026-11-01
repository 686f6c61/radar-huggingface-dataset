# CoTi1940/Qwen3.8-Flash-Next-FP8-colibri-experts-int4g64

## Resumen

Qwen3.8-Flash-Next-FP8-colibri-experts-int4g64 es un artefacto derivado (un sidecar, no un modelo completo) publicado por el usuario CoTi1940 sobre el checkpoint oficial Qwen/Qwen3.8-Flash-Next-FP8. Contiene exclusivamente los expertos enrutados (routed experts) del modelo base, recuantizados de FP8 a int4 con una escala f32 compartida por cada bloque de 64 pesos de entrada, usando el conversor propio del motor Colibri (`c/tools/convert_qwen38_experts_int4.py`, commit `77530b49`). El resto de componentes —experto compartido, atención, DeltaNet, tabla PLE, visión y cabeza MTP— siguen procediendo del checkpoint oficial, que debe descargarse por separado.

El objetivo es reducir el peso en disco y en memoria de la parte dominante del modelo: los expertos enrutados pasan de 120,8 GB en FP8 a 68,0 GB (63,3 GiB) en int4-g64, sobre 48 capas con 512 expertos por capa. El repositorio ocupa 68,0 GB y el `index.json` declara 67.968.138.290 bytes totales, marcados como `complete`.

Es relevante para quienes ejecutan Qwen3.8-Flash-Next en hardware con memoria limitada mediante Colibri, ya que el autor reporta una decodificación entre 1,4 y 1,5 veces más rápida en CPU con la misma caché de expertos, a costa de un error L2 relativo medio del 11,15 % por capa y un incremento de perplejidad de +0,017 nats por token. No es un modelo autónomo: sin el checkpoint base no es utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (sidecar de expertos enrutados de un transformer con DeltaNet, vision y cabeza MTP; la arquitectura completa corresponde al modelo base) |
| Parametros totales | no disponible (el sidecar solo contiene los expertos enrutados: 48 capas x 512 expertos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con escala f32 por bloque de 64 entradas (int4-g64); el base esta en FP8 (e4m3 con `weight_scale_inv` por bloque) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | safetensors (un archivo por capa mas `index.json`), 48 archivos `layer-000` a `layer-047` |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una conversión de pesos. Toma los expertos enrutados del checkpoint Qwen3.8-Flash-Next-FP8 (revision `236dfdf285828023ca3bcd3f37366c58a3469b13`) y los recuantiza a int4. Para cada bloque de 64 entradas se calcula `scale = absmax / 7`, se redondea `w / scale` con redondeo half-to-even y se satura el código al rango [-8, 7]. Los valores de partida son los que el motor calcula a partir del release FP8 (cada byte e4m3 multiplicado por el `weight_scale_inv` de su bloque).

Cada experto se almacena como un registro contiguo y alineado a página, con un safetensors por capa y un `index.json`. El tamaño por experto baja de 4.915.200 bytes a 2.764.800 bytes. El error L2 relativo impreso por el conversor es del 11,15 % de media por capa y del 17,52 % en la peor matriz individual. No hay datos sobre el dataset de entrenamiento original, el número de tokens ni las etapas de RLHF/DPO del modelo base en la información disponible.

## Capacidades

- No aplica como modelo independiente: el sidecar solo aporta los pesos de los expertos enrutados.
- Las capacidades efectivas (generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, multilingüismo, modo thinking) son las del checkpoint Qwen/Qwen3.8-Flash-Next-FP8 y no se documentan en esta ficha.
- Integración específica con el motor Colibri: la variante `qwen38` detecta el directorio `experts-int4g64/` junto a los shards de forma automática.
- Control por variable de entorno: `Q38_EXPERT_INT4=0` ignora el sidecar; `Q38_EXPERT_INT4=1` impide arrancar sin él.
- Verificado por el autor: lectura en CPU y generación de 64 tokens coherentes tras un prompt de 20 tokens.

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next en servidores con poca VRAM: al reducir los expertos enrutados de 120,8 GB a 68,0 GB, el modelo base puede residir parcialmente en RAM del sistema y descargar expertos a la GPU según demanda mediante el tier Vulkan de Colibri.
- Inferencia en CPU con caché de expertos: el autor reporta 1,4-1,5x más velocidad de decodificación en CPU con la misma caché, lo que hace viable servir el modelo en estaciones de trabajo sin GPU dedicada de gran capacidad.
- Experimentación e investigación sobre cuantización MoE: el repositorio sirve como referencia reproducible de conversión int4-g64 con escalas por bloque de 64, útil para estudiar el equilibrio entre error L2 (~11 %) y ganancia de rendimiento.
- Prototipado en Google Colab o entornos con A100-80GB y ~167 GiB de RAM: el autor documenta 6,72 tok/s en la primera ejecución y 12,89 tok/s en la segunda, con TTFT de 1,87 s y 0,42 s respectivamente.
- Evaluación comparativa FP8 frente a int4: permite medir el impacto de la cuantización en perplejidad (+0,017 nats/token) y en latencia sobre el mismo checkpoint y motor.
- Sustitución controlada en pipelines existentes de Colibri: al ser un sidecar opcional y conmutable por variable de entorno, se puede activar o desactivar sin modificar el resto del stack de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). Los únicos datos medidos por el autor son de calidad y velocidad de inferencia:

| Metrica | FP8 (release) | int4-g64 (este sidecar) |
|---|---|---|
| Bytes por experto | 4.915.200 | 2.764.800 |
| Todos los expertos enrutados (48 x 512) | 120,8 GB | 68,0 GB (63,3 GiB) |
| Error L2 relativo medio por capa | referencia | 11,15 % |
| Error L2 relativo peor matriz | referencia | 17,52 % |
| Perplejidad (4 fragmentos de 504 tokens) | referencia | +0,017 nats/token |
| Decodificacion en CPU (misma cache de expertos) | referencia | 1,4-1,5x mas rapida |
| Throughput en A100-SXM4-80GB (200 tokens nuevos) | 1,05-1,15 tok/s (expertos FP8 en tier CUDA) | 6,72 tok/s (1a ejecucion) / 12,89 tok/s (2a ejecucion) |
| Time to first token en A100 | no disponible | 1,87 s / 0,42 s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desagregada; el sidecar pesa 68,0 GB en disco y el checkpoint base debe sumarse aparte.
- GPU recomendadas: NVIDIA A100-SXM4-80GB es la única configuración documentada por el autor (Google Colab, 167 GiB de RAM del sistema).
- Cabe en GPU de consumo: no hay datos que lo confirmen; por el tamaño del sidecar más el base, no es esperable que quepa íntegramente en una RTX 4090 (24 GB) sin descarga de expertos a RAM.
- Opciones de despliegue: exclusivamente el motor Colibri (variante `qwen38`, commit `77530b49` o posterior), con tier de expertos Vulkan y tier CUDA. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 6,72 tok/s en primera ejecución y 12,89 tok/s en la segunda sobre A100-80GB; TTFT de 1,87 s y 0,42 s. En CPU, 1,4-1,5x más rápido que FP8 con la misma caché.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoTi1940/Qwen3.8-Flash-Next-FP8-colibri-experts-int4g64 (este) | no disponible (expertos: 48x512) | no disponible | int4-g64 | qwen-community-1.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-Flash-Next-FP8 (base) | no disponible | no disponible | FP8 | qwen-community-1.0 | HuggingFace |
| Alternativas de otro tamano o tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar el checkpoint Qwen/Qwen3.8-Flash-Next-FP8 (revision `236dfdf285828023ca3bcd3f37366c58a3469b13`) y usar el motor Colibri; no funciona con stacks de inferencia estándar.
- Pérdida de calidad medible: error L2 relativo del 11,15 % de media y hasta 17,52 % en la peor matriz; +0,017 nats/token de perplejidad sobre cuatro fragmentos de 504 tokens.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria independiente; las comprobaciones las realizó únicamente el autor.
- Sin datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K), idiomas soportados, longitud de contexto ni parámetros totales/activos.
- Licencia `qwen-community-1.0` (etiquetada como `other`): es necesario revisar el archivo LICENSE para confirmar las condiciones de uso comercial, que no se detallan en la información disponible.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este artefacto ni para el modelo base en la información proporcionada.
- Dependencia de una revisión concreta del conversor (commit `77530b49`) y del motor Colibri; cambios de versión pueden romper la compatibilidad del formato.
- El rendimiento medido en A100 varía notablemente entre la primera y la segunda ejecución (6,72 frente a 12,89 tok/s) por el llenado inicial del tier Vulkan de expertos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CoTi1940/Qwen3.8-Flash-Next-FP8-colibri-experts-int4g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Motor Colibri: https://github.com/JustVugg/colibri
- Documentación del formato: `docs/qwen38.md` dentro del repositorio de Colibri (sección "Routed experts as int4-g64")
- Conversor: `c/tools/convert_qwen38_experts_int4.py` en el repositorio de Colibri, commit `77530b49`
- Resultado de búsqueda web proporcionado (CISA, Cybersecurity Awareness Month): https://www.cisa.gov/cybersecurity-awareness-month (no relacionado con el modelo)
