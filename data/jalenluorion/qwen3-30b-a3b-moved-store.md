# jalenluorion/Qwen3-30B-A3B-moved-store

## Resumen

Qwen3-30B-A3B-moved-store es una redistribución experimental del modelo Qwen/Qwen3-30B-A3B-Instruct-2507 (MoE de 30,5B parámetros totales y 3,3B activos, licencia Apache 2.0) en la que los 6.144 expertos se almacenan en disco en int8 en lugar de residir en memoria. El autor, jalenluorion, no ha reentrenado ningún peso del modelo original: solo añade un router de prefetch por capa que predice, con cuatro capas de antelación, qué expertos va a necesitar el router original, de forma que las lecturas de disco solapen con el cálculo de las capas intermedias.

El objetivo es reducir la huella de memoria de un MoE grande. En la configuración por defecto (8 expertos nombrados, 7 tokens de retención) el modelo ocupa 15 GB de VRAM en lugar de los 56,9 GB del modelo original servido con transformers en bf16, y lo hace a 8,1 tokens/s frente a 6,3 tokens/s, sobre una A100-80GB con NVMe de 6 GB/s. Según la model card, la precisión se mantiene dentro del ruido estadístico respecto al original en todas las tareas evaluadas.

Se trata de un artefacto de investigación (0 descargas y 0 likes en el momento de la consulta), no de un modelo nuevo: hereda las capacidades del Qwen3-30B-A3B-Instruct-2507 y requiere un runner propio (`run.py`) en lugar de los stacks habituales de inferencia (vLLM, llama.cpp, TGI).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE decoder-only (Qwen3 MoE), con los expertos reubicados en disco y routers de prefetch adicionales |
| Parámetros totales | 30,84B en el re-layout (1,54B residentes + 0,3B routers de prefetch + 29B expertos); el modelo base declara 30,5B |
| Parámetros activos | 3,3B (modelo base) |
| Longitud de contexto | 131.072 tokens vía YaRN según la información de búsqueda para la familia Qwen3-30B-A3B; no confirmado para la variante Instruct-2507 en la información disponible |
| Tipos de cuantización | Expertos en int8 (una escala por neurona); parte residente en bf16; routers en fp16. No se documentan otras cuantizaciones (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingüe, pero la información proporcionada no lo detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`resident.safetensors`), binarios int8 crudos (`store/layer_XX.bin`) y PyTorch (`routers_k4.pt`) |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B-Instruct-2507 es un MoE de 48 capas con 128 expertos por capa y 8 expertos activados por token, lo que da un total de 6.144 expertos. En la disposición original, el router de cada capa selecciona los 8 expertos a partir del estado oculto de esa misma capa, por lo que los 29B de parámetros de expertos deben estar en memoria en el instante en que se eligen. Este re-layout invierte ese orden: un router adicional por capa lee el estado del token cuatro capas antes y nombra los expertos que esa capa necesitará, de modo que las lecturas de disco se lanzan mientras se computan las cuatro capas intermedias.

Los únicos componentes entrenados son esos routers de prefetch (0,3B parámetros), que se entrenaron para imitar las decisiones de los routers originales con todos los pesos del modelo congelados, sobre 20M tokens de texto enciclopédico, web y de chat. El runner admite dos modos: prefetch (por defecto), donde el router original elige su top-8 entre los expertos que ya están en memoria y nunca se lee a demanda, de manera que un fallo de predicción altera la salida en lugar de bloquear la ejecución; y exact (`--mode exact`), donde el router original sigue decidiendo y los routers de prefetch solo anticipan lecturas a una caché, con lectura puntual de los expertos ni cacheados ni en camino. En exact mode las salidas son idénticas a las del modelo original con expertos int8 (48/48 coincidencias en el chequeo, diferencia de logits nula en float32); el store int8 cuesta 0,017 nats.

## Capacidades

- Generación de texto y conversación instructiva: hereda las capacidades del Qwen3-30B-A3B-Instruct-2507, que no se modifica excepto por la cuantización int8 de los expertos.
- Reproducción exacta del modelo original: el modo `--mode exact` permite verificar que las salidas coinciden token a token con el modelo base (con expertos int8).
- Prefetch de expertos con predicción a cuatro capas de antelación, con parámetros configurables (`--m` para expertos nombrados por capa, `--keep` para tokens de retención en memoria).
- Ejecución en CUDA y en Apple Silicon (MPS), con degradación de velocidad en este último caso.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni thinking mode. Deben asumirse las del modelo base, pero no están confirmadas en la model card.

## Casos de uso

- Investigación en offloading de MoE: el artefacto permite reproducir los experimentos de prefetch a cuatro capas y medir la tasa de acierto del router frente a la latencia de lectura, útil para estudiar arquitecturas de almacenamiento en disco para expertos.
- Despliegue de un MoE de 30B en GPU de consumo: con 15 GB de VRAM en la configuración por defecto, cabe en una RTX 4080/4090 (24 GB) o en una RTX 4060 Ti de 16 GB, siempre que se disponga de un NVMe rápido.
- Servicio de chat con contexto largo en hardware de gama media: al reducir la memoria residente a 9,7 GB de pesos en GPU, libera VRAM para caché KV en conversaciones multi-turno extensas.
- Evaluación de compromisos latencia/memoria: los parámetros `--keep` y `--m` permiten trazar curvas de tokens/s frente a VRAM (403 MB/token con `keep 7`, 962 MB/token sin retención, 222 MB/token con `keep 15`) para ajustar el despliegue a un disco concreto.
- Validación de pipelines frente al modelo original: el modo `--mode exact` sirve para comprobar que una integración reproduce las salidas del Qwen3-30B-A3B-Instruct-2507 con expertos int8, antes de pasar a prefetch.
- Entornos con almacenamiento abundante y memoria escasa (workstations, servidores edge con NVMe y GPU modesta): el modelo sacrifica aproximadamente un 28% de tokens/s para operar en menos de la mitad de memoria que el original.
- Docencia y benchmarking de arquitecturas MoE: la separación explícita entre parte residente, routers y store en disco facilita explicar y medir el comportamiento de un MoE real.

## Benchmarks y rendimiento

Distancias de pérdida respecto al modelo original (wikitext-103 test / FineWeb-Edu / UltraChat retenido; el original da 2,033 / 2,201 / 1,589 nats) y precisión en % en lm-eval sobre los conjuntos de test completos (errores estándar de 0,4 a 1,4):

| Nombrados | Retenidos | Distancia de pérdida | HellaSwag | PIQA | ARC-e | ARC-c | WinoGrande | LAMBADA | MMLU | Media |
|---|---|---|---|---|---|---|---|---|---|---|
| Modelo original | — | 0 | 61,2 | 80,5 | 84,8 | 60,2 | 73,5 | 71,1 | 80,2 | 73,1 |
| 8 | 0 | +0,004 / +0,006 / +0,0005 | | | | | | | | |
| 8 | 3 | +0,002 / +0,004 / +0,002 | | | | | | | | |
| 8 | 7 (por defecto) | +0,001 / +0,002 / +0,001 | 61,1 | 80,3 | 84,9 | 60,6 | 72,7 | 71,1 | 79,9 | 72,9 |
| 12 | 3 | +0,001 / +0,001 / −0,000 | 61,0 | 80,3 | 84,9 | 60,8 | 72,7 | 71,3 | 80,2 | 73,0 |

Velocidad y memoria sobre una NVIDIA A100-80GB con NVMe de 6 GB/s, batch 1, prompt de chat, 96 tokens generados, mismo runner y kernels en todas las filas:

| Configuración | tokens/s | % del residente | VRAM de GPU | % del residente | Pesos en GPU | Lectura por token |
|---|---|---|---|---|---|---|
| Todos los expertos en GPU como int8 (residente) | 11,2 | 100% | 32,9 GB | 100% | 30,6 GB | 0 |
| Prefetch, 8 nombrados, sin retención | 6,1 | 54% | 8,9 GB | 27% | 5,3 GB | 962 MB |
| Prefetch, 8 nombrados, retención 3 | 7,1 | 63% | 12,4 GB | 38% | 7,7 GB | 590 MB |
| Prefetch, 8 nombrados, retención 7 (por defecto) | 8,1 | 72% | 15,0 GB | 45% | 9,7 GB | 403 MB |
| Prefetch, 8 nombrados, retención 15 | 8,0 | 71% | 18,2 GB | 55% | 12,4 GB | 222 MB |
| Exact mode, 1.350 expertos cacheados | 4,9 | 44% | 11,8 GB | 36% | — | 422 MB |
| Lectura bajo demanda sin prefetch | 2,3 | 21% | 5,9 GB | 18% | 3,5 GB | 1,73 GB |
| Modelo original con transformers, todo en GPU en bf16 | 6,3 | — | 56,9 GB | — | — | — |

## Requisitos de hardware

- Disco: aproximadamente 32 GB libres (27 GB corresponden al store de expertos int8); se recomienda NVMe, ya que el throughput depende del ancho de banda de lectura secuencial.
- Memoria: 10 GB libres como mínimo para arrancar; el consumo depende de la configuración (`--keep`).
- VRAM de GPU por configuración: 5,9 GB (sin prefetch), 8,9 GB (prefetch sin retención), 12,4 GB (retención 3), 15,0 GB (retención 7, por defecto), 18,2 GB (retención 15), 11,8 GB (exact mode) y 32,9 GB (todos los expertos int8 en GPU).
- GPU recomendadas: A100-80GB es la plataforma de referencia de las mediciones. Para las configuraciones de menor VRAM son viables RTX 4080/4090 (24 GB), RTX 3090 (24 GB) y RTX 4060 Ti 16 GB, condicionadas a la velocidad del NVMe.
- Compatibilidad con GPU de consumo: sí en la configuración por defecto (15 GB), siempre que el almacenamiento sea NVMe rápido; en Apple Silicon funciona vía MPS, pero lento.
- Opciones de despliegue: runner propio `run.py` incluido en el repositorio (requiere Python 3.9+, torch, transformers>=4.51, safetensors, accelerate y huggingface_hub). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 8,1 tokens/s en la configuración por defecto (A100-80GB, NVMe 6 GB/s), frente a 11,2 tokens/s con todos los expertos int8 en GPU y 6,3 tokens/s del modelo original en bf16 con transformers. El prefetch aporta entre 2,6x y 3,5x respecto a la lectura bajo demanda.

## Comparativa con modelos similares

| Modelo / configuración | Parámetros totales / activos | Contexto | VRAM | tokens/s (A100-80GB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-30B-A3B-moved-store (prefetch por defecto) | 30,84B / 3,3B | 131.072 tokens vía YaRN (familia) | 15,0 GB | 8,1 | Apache 2.0 | Repositorio propio, runner `run.py` |
| Qwen3-30B-A3B-moved-store (exact mode) | 30,84B / 3,3B | 131.072 tokens vía YaRN (familia) | 11,8 GB | 4,9 | Apache 2.0 | Repositorio propio |
| Qwen3-30B-A3B-Instruct-2507 (original, bf16) | 30,5B / 3,3B | 131.072 tokens vía YaRN (familia) | 56,9 GB | 6,3 | Apache 2.0 | HuggingFace, transformers |
| Qwen3-30B-A3B (base, no instruct) | 30,5B / 3,3B | 131.072 tokens vía YaRN | no disponible | no disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son los del Qwen3-30B-A3B-Instruct-2507 con los expertos cuantizados a int8; no hay reentrenamiento ni mejora de capacidades.
- El modo por defecto (prefetch) puede alterar las salidas: si el router de prefetch se equivoca, la respuesta cambia en lugar de ralentizarse. Para igualdad de salidas hay que usar `--mode exact`, que pierde velocidad (4,9 tokens/s frente a 8,1).
- La cuantización int8 de los expertos introduce un coste medido de 0,017 nats respecto al modelo en bf16.
- El rendimiento depende críticamente del almacenamiento: se necesita NVMe; en discos lentos o en Apple Silicon la velocidad cae de forma notable.
- El runner lee por defecto con `O_DIRECT` (o `F_NOCACHE` en macOS) para saltarse la caché del sistema operativo; sin `--cache`, la caché de página no ayuda al throughput.
- No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF; la integración exige el runner propio del repositorio.
- Discrepancia de tamaño: HuggingFace informa de un repositorio de 6,3 GB, mientras que la model card pide unos 32 GB de disco (27 GB de store). Conviene verificar que el store de expertos se descarga completo antes de desplegar.
- Modelo sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado en octubre de 2026 según los metadatos; no hay validación externa de los resultados publicados.
- Riesgo de alucinación, sesgos y limitaciones idiomáticas: no documentados en la model card; se heredan del modelo base y deben evaluarse por separado.
- Licencia Apache 2.0, que permite uso comercial, pero al derivar de Qwen3-30B-A3B-Instruct-2507 conviene revisar los términos del modelo base.
- Los routers de prefetch están entrenados sobre 20M tokens de texto enciclopédico, web y de chat; su tasa de acierto en dominios muy alejados (código, idiomas minoritarios) no está documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jalenluorion/Qwen3-30B-A3B-moved-store
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Familia Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Repositorio de archivos del modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B/tree/main
- Ficha de Qwen3 30B-A3B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-30b-a3b/
- Ficha de Qwen3 30B A3B en Apertis AI: https://apertis.ai/models/qwen3-30b-a3b
- Página de Qwen3 30B en Ollama: https://ollama.com/library/qwen3:30b
