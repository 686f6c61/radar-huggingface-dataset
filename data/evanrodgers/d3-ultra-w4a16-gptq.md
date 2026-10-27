# evanrodgers/d3-ultra-W4A16-GPTQ

## Resumen

d3-ultra-W4A16-GPTQ es una versión cuantizada a INT4 del modelo de decisión multimodal `vllm-sr/d3-ultra`, publicada por el usuario evanrodgers. El modelo base tiene 26.085.330.160 parámetros (25,62 B en el decodificador de texto, 0,46 B en la torre visual y 1,3 M en un readout en FP32) y se distribuye originalmente en BF16 con 52,2 GB de pesos; esta recompresión los reduce a 16,06 GB conservando la torre de visión, el readout y el comportamiento de decisión.

No es un modelo generativo de propósito general: el repositorio declara la pipeline `zero-shot-classification` y las etiquetas `decision-model`, `feature-extraction` y `multimodal`, y está diseñado para emitir decisiones o clasificaciones sobre entradas de texto, imagen y vídeo dentro del ecosistema vLLM Semantic Router. Su interés práctico inmediato es que permite servir un modelo de 26 B en una sola GPU con 14,96 GiB de VRAM tras la carga, a cambio de renunciar a parte del rendimiento en latencia.

La cuantización es weight-only (W4A16) con GPTQ en formato `compressed-tensors`, aplicada solo a 400 proyecciones del decodificador de texto. Según la model card, la pérdida de calidad es mínima: 95,0 en VDB core y 100,0 en VDB transfer, idénticos al BF16, con un 96,48 % de acuerdo top-1 en la evaluación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención completa y atención lineal (64 capas: 16 de atención completa y 48 de atención lineal) con torre visual; etiqueta de familia `qwen3_5`, base declarada `Qwen/Qwen3.8-27B` |
| Parámetros totales | 26.085.330.160 (26,09 B): 25,62 B texto, 0,46 B visión, 1,3 M readout FP32 |
| Longitud de contexto | no disponible (se han medido prompts de hasta 8.192 tokens, sin declarar la ventana máxima) |
| Tipos de cuantización | INT4 weight-only W4A16 GPTQ (`compressed-tensors` `pack-quantized`: int4 simétrico, grupo 128, escalas BF16, `actorder=weight`, dampening 0,01, block 128); resto de pesos en BF16 y readout en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único `model.safetensors` de 16,06 GB) en formato `compressed-tensors`; requiere `custom_code` |

## Arquitectura y entrenamiento

El decodificador consta de 64 capas que alternan 16 capas de atención completa con 48 capas de atención lineal, una combinación híbrida que reduce el coste de contexto largo. Sobre él se monta una torre visual de 0,46 B de parámetros (333 tensores copiados bit a bit desde el checkpoint BF16) y un readout en FP32 que materializa la decisión final junto con `decision_config.json`. El `config.json` conserva `text_config.mtp_num_hidden_layers: 1`, pero el release d3-ultra no incluye tensores `mtp.*`, por lo que no hay decodificación especulativa MTP disponible en este checkpoint.

La información disponible no documenta el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO), solo el proceso de cuantización. Se cuantizaron exactamente 400 proyecciones: 192 de MLP (`gate_proj`, `up_proj`, `down_proj` en las 64 capas), 64 de atención completa (`q/k/v/o_proj` en 16 capas) y las proyecciones `linear_attn.in_proj_qkv`, `in_proj_z` y `out_proj` de las 48 capas de atención lineal. Se mantuvieron en BF16 la torre visual completa, `linear_attn.in_proj_a/b`, embeddings, `conv1d`, normas, el readout FP32 y `mtp.*`. Se eligió GPTQ en lugar de RTN porque el error se acumula a lo largo de 64 capas híbridas; la calibración usó 512 prompts del split de validación de `tasksource/tasksource-jev-typed-decisions`, procesados con `d3_runtime.D3.prepare` y la máscara de bloque `prefix_bidir`.

## Capacidades

- Clasificación zero-shot y decisión sobre candidatos: la pipeline declarada es `zero-shot-classification`, con un readout específico (`decision_config.json`) para emitir la etiqueta ganadora.
- Procesamiento multimodal: acepta peticiones de imagen y vídeo además de texto, siguiendo la misma ruta que el paquete BF16 original.
- Extracción de features (`feature-extraction`) para representaciones vectoriales de texto e imagen.
- Enrutamiento semántico: pensado para funcionar como modelo de decisión dentro de vLLM Semantic Router en modo Engine.
- Generación de texto abierto: no documentada; el modelo se publica como decision-model, no como chat model.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Enrutamiento de peticiones en una puerta de enlace de LLM: el modelo recibe el prompt y una lista de rutas o expertos candidatos y devuelve la decisión top-1, integrándose en vLLM Semantic Router en modo Engine con los pesos int4 empaquetados en GPU.
- Clasificación zero-shot de documentos legales: la calibración se hizo con pasajes de registros judiciales públicos, por lo que el modelo es adecuado para tipificar consultas o pasajes frente a un conjunto cerrado de categorías sin reentrenamiento.
- Triaje de contenido multimodal: al conservar la torre visual intacta, puede clasificar imágenes y vídeos frente a categorías definidas, por ejemplo para moderación o catalogación automática.
- Clasificación de tickets de soporte con contexto largo: con prompts de 4.096 a 8.192 tokens mantiene entre 2.400 y 2.480 tokens/s en una sola GPU, suficiente para procesar hilos conversacionales completos por lotes.
- Despliegue en hardware limitado: con 14,96 GiB tras la carga y 15,41 GiB de pico en una petición de 225 tokens, cabe en GPUs de 24 GB para contextos cortos y en aceleradores de gama profesional para servir decisions a baja concurrencia.
- Evaluación por lotes offline: el runtime permite `D3.probabilities` con prompts independientes en proceso, con un óptimo de batching en B=8 para 512 tokens (4,90 req/s, 2.501 tokens/s).
- Extracción de embeddings para búsqueda semántica o clustering sobre corpus mixtos de texto e imagen, usando la cabeza de `feature-extraction`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son de la evaluación propia del autor (VDB) y de throughput.

| Métrica | BF16 | W4A16 |
|---|---:|---:|
| VDB core (150 items) | 95,0 (A) | 95,0 (A) |
| VDB transfer (30 items) | 100,0 (A) | 100,0 (A) |
| VDB top-1 agreement | — | 150/150 core, 30/30 transfer |
| Acuerdo top-1 en texto (256 filas) | — | 96,48 % |
| Memoria GPU tras la carga | 50,1 GB | 14,96 GiB |
| Tiempo VDB core | 63 s | 68 s |

| Prompt | Servidor serie (C=1) | p50 | Mejor batching | req/s | tokens/s |
|---|---:|---:|---:|---:|---:|
| 512 tokens | 2,37 req/s, 1.210 tok/s | 422 ms | B=8 | 4,90 | 2.501 |
| 4.096 tokens | 0,54 req/s, 2.191 tok/s | 1,87 s | B=4 | 0,61 | 2.477 |
| 8.192 tokens | 0,27 req/s, 2.248 tok/s | 3,64 s | B=4 | 0,29 | 2.407 |

Medido en una NVIDIA CMP 170HX (64 GB) con el runtime padre y el cargador `d3q` de int4 empaquetado. El techo de una GPU se sitúa en 2,4–2,5k tokens de entrada por segundo: las peticiones de 512 tokens están dominadas por el desempaquetado de pesos int4 en cada forward (el batching casi duplica el throughput), mientras que 4K y 8K son compute-bound y el batching apenas aporta. La concurrencia no ayuda: `d3_server.py` atiende una petición a la vez y, con C=2/4/8, el throughput se mantiene plano y la latencia p50 crece linealmente (512 tokens: 0,84 / 1,68 / 3,39 s; 4K: 3,75 / 7,53 / 15,08 s; 8K: 7,28 / 14,56 / 29,12 s).

## Requisitos de hardware

- VRAM estimada: 14,96 GiB tras la carga; 15,41 GiB de pico en una petición de 225 tokens; 27,55 GiB de pico en 8K con B=8 (15 GB de pesos empaquetados más activaciones).
- GPU recomendadas: cualquier GPU con 16 GB o más para contexto corto y concurrencia baja; para 8K con batching se necesitan 32 GB o más. Las medidas se tomaron en una NVIDIA CMP 170HX de 64 GB.
- GPU consumer: cabe en RTX 4090, RTX 3090 o RTX 4080 Super (16 GB) para peticiones cortas; en 24 GB el margen se agota al llegar a 8K con batching.
- Carga con `transformers`: el checkpoint `compressed-tensors` se dequantiza a BF16, por lo que se vuelve a necesitar el espacio del modelo completo (52 GB); no es una vía válida para ahorrar VRAM.
- Opciones de despliegue: vLLM Semantic Router en modo Engine (mantiene los int4 empaquetados), el runtime del repo padre `vllm-sr/d3-ultra` y su `d3_server.py`. Soporte en llama.cpp, Ollama o TGI: no disponible en la información proporcionada (requiere `custom_code`).
- Latencia y throughput: p50 de 422 ms a 512 tokens, 1,87 s a 4K y 3,64 s a 8K en configuración serie; techo aproximado de 2.500 tokens/s de entrada en una GPU.
- Naturaleza de la optimización: es una optimización de memoria, no de latencia; VDB core tarda 68 s frente a los 63 s del BF16 por el desempaquetado int4 en cada producto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | VRAM tras carga | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| evanrodgers/d3-ultra-W4A16-GPTQ | 26,09 B | no disponible | INT4 W4A16 GPTQ | 14,96 GiB | Apache 2.0 | recompresión de terceros, 0 descargas |
| vllm-sr/d3-ultra | 26,09 B | no disponible | BF16 | 50,1 GB | Apache 2.0 | oficial, incluye runtime y servidor |
| vllm-sr/d3-W4A16-GPTQ | 26,09 B | no disponible | INT4 W4A16 | no disponible | Apache 2.0 | oficial, servido en Engine mode |
| Qwen/Qwen3.8-27B | ~27 B | no disponible | BF16 | no disponible | no disponible | checkpoint base, conserva los pesos MTP |

La diferencia funcional frente a `vllm-sr/d3-ultra` es exclusivamente la cuantización: mismas métricas VDB, mismo readout y misma torre visual. Frente a `vllm-sr/d3-W4A16-GPTQ`, que es la receta INT4 publicada por el equipo original, este repositorio replica el mismo esquema (GPTQ, `actorder=weight`, grupo 128) pero no incluye el runtime ni el servidor, que hay que tomar del repo padre.

## Limitaciones y advertencias

- Es una recuantización de terceros con 0 descargas y 0 likes en el momento de la ficha; no consta validación de la comunidad ni del equipo que publicó el modelo original.
- No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni evaluación independiente: las únicas cifras son las del autor.
- El acuerdo top-1 en texto es del 96,48 %, es decir, aproximadamente un 3,5 % de las filas divergen de la decisión del modelo en BF16; en un sistema de enrutamiento esto implica decisiones distintas en ese porcentaje de casos.
- No se declaran idiomas soportados; el rendimiento fuera de los idiomas dominantes del dataset de calibración es desconocido.
- No se declara la longitud máxima de contexto, aunque se haya medido hasta 8.192 tokens.
- No incluye tensores `mtp.*`, por lo que no se puede usar decodificación especulativa MTP aunque el `config.json` la configure.
- El servidor incluido en el repo padre atiende una petición a la vez; la concurrencia degrada la latencia de forma lineal. Para producción con paralelismo real hace falta batching en proceso o varias instancias.
- Cargar el checkpoint con `transformers` de forma directa dequantiza a BF16 y consume 52 GB de VRAM, lo que anula la ventaja del paquete.
- La licencia del repositorio es Apache 2.0, pero conviene verificar la licencia del modelo base `vllm-sr/d3-ultra` y del checkpoint subyacente `Qwen/Qwen3.8-27B` antes de un uso comercial, ya que no se detallan en la información disponible.
- Requiere `trust_remote_code`: hay código personalizado en la ruta de carga, con el riesgo de seguridad asociado.
- Al ser un modelo de decisión y no generativo, el fallo típico no es la alucinación de texto sino la clasificación errónea; no debe usarse como fuente de hechos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/evanrodgers/d3-ultra-W4A16-GPTQ
- Documento de evaluación del repositorio: https://huggingface.co/evanrodgers/d3-ultra-W4A16-GPTQ/blob/main/EVAL.md
- Modelo base (BF16, con runtime y servidor): https://huggingface.co/vllm-sr/d3-ultra
- Cuantización oficial W4A16 del equipo original: https://huggingface.co/vllm-sr/d3-W4A16-GPTQ
- Árbol de ficheros de la versión oficial: https://huggingface.co/vllm-sr/d3-W4A16-GPTQ/tree/main
- Checkpoint base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de calibración: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Registro en free2aitools: https://free2aitools.com/model/vllm-sr/d3-w4a16-gptq
