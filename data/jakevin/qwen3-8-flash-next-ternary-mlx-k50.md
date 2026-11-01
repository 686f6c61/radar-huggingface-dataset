# Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50

## Resumen

Qwen3.8-Flash-Next-ternary-mlx-K50 es una versión cuantizada y podada (expert-pruned) del modelo Jakevin/Qwen3.8-Flash-Next-ternary-mlx, publicada por el usuario Jakevin en Hugging Face. El repositorio, de 108,7 GB según la ficha (54 GB en disco según el README), contiene todos los tensores necesarios para ejecutar el modelo sin depender del checkpoint FP8 oficial. Se trata de un modelo de generación de texto conversacional basado en una arquitectura MoE (mixture of experts) con pesos ternarios, optimizado para Apple Silicon mediante la librería MLX.

La particularidad de esta versión K50 es la poda de expertos: de los 512 expertos enrutados por capa en las capas 1 a 47, se conservan solo los 256 con mayor puntuación REAP (activación de experto ponderada por router), eliminando 12.032 expertos en total. Además, la tabla n-gram PLE se ha re-cuantizado de FP8 a un formato mixto de 2 a 6 bits, reduciendo su tamaño de 48 GB a 30 GB con una concordancia top-1 del 99 % frente a la versión anterior. No se han publicado benchmarks estándar de capacidades, por lo que su utilidad principal es la experimentación local con modelos MoE grandes en hardware Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con pesos ternarios, atención lineal, hiper-conexiones y tabla n-gram PLE |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE: 512 expertos enrutados por capa en la capa 0; 256 de 512 tras la poda en capas 1–47) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (base), afín 8 bits (routers podados, embedding y lm_head, skeleton), afín mixta 2–6 bits (tabla PLE, media ~4,05 bits, group_size 32) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | safetensors (MLX), con directorios L00–L47, ple/, skeleton.safetensors, nonexpert.safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 48 capas (L00–L47) y pesos ternarios. Cada capa incorpora 512 expertos enrutados más un experto compartido, atención lineal, hiper-conexiones y una tabla de incrustaciones n-gram PLE con 16 cabeceras n-gram hasheadas y 128 fragmentos de filas de 160 dimensiones. Esta tabla PLE se lee mediante mmap y solo se descuantizan las filas que necesita cada token, lo que reduce drásticamente la memoria activa.

La versión K50 aplica poda física de expertos: en las capas 1 a 47 se conservan 256 de los 512 expertos enrutados, seleccionados por puntuación REAP calculada sobre 32 secuencias de calibración (9.479 tokens en total), con desempates por tráfico de experto medido en una build Q2 anterior. Los expertos conservados se almacenan byte a byte idénticos al checkpoint base; solo se re-cuantiza la tabla PLE (de FP8 a afín mixta de 2–6 bits según la sensibilidad medida de cada cabecera). Los routers de las capas podadas se recortan a los expertos conservados y se almacenan en bf16, cuantizándose a 8 bits afín en tiempo de carga. No hay información sobre datos de preentrenamiento, número de tokens ni ajuste con RLHF/DPO.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Composición de código: en las pruebas de concordancia, el conjunto de código obtuvo la mayor coincidencia top-1 (93,8 %) con el modelo sin podar.
- Ejecución eficiente en Apple Silicon mediante MLX, con lectura de expertos desde SSD o caché residente en RAM.
- No hay información sobre tool calling, agentes, capacidades visuales o de audio.

## Casos de uso

- Experimentación local con MoE de gran tamaño en Mac: el modelo cabe en un Mac mini M4 Pro de 64 GB gracias a la poda y la cuantización mixta de la tabla PLE, lo que lo hace adecuado para investigar el comportamiento de modelos MoE ternarios sin servidores con GPU de datacenter.
- Investigación en poda de expertos: el repositorio documenta íntegramente la metodología REAP, los IDs de expertos conservados (`K50_kept.json`) y las métricas de concordancia, siendo una referencia práctica para replicar técnicas de pruning.
- Generación de código offline: la concordancia top-1 del 93,8 % en secuencias de código sugiere que el comportamiento se mantiene cercano al modelo base en tareas de programación, útil para asistentes de código locales.
- Pruebas de inferencia con expertos en SSD: el runtime permite leer expertos desde disco en cada llamada (7,4 s/token) o mantenerlos en caché LRU (0,25–0,26 s/token en caliente), útil para evaluar estrategias de paging de pesos.
- Comparación de esquemas de cuantización: la conversión de la tabla PLE de FP8 a 2–6 bits con asignación de bits por sensibilidad ofrece un caso de estudio medible (KL media de 7,2e-4 en prosa inglesa).
- Prototipado de aplicaciones conversacionales en Apple Silicon: el pipeline de generación de texto con decodificación greedy verificada (salida idéntica con y sin caché) permite integrarlo en demos locales estables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El propio README advierte que ninguna benchmark se ha ejecutado sobre este modelo.

Datos de evaluación interna publicados por el autor:

| Metrica | Valor |
|---|---|
| Concordancia top-1 global con el modelo sin podar | 91,9 % (IC bootstrap 95 %: 91,1–92,5 %) |
| Concordancia top-1 en código | 93,8 % |
| Concordancia top-1 en prosa inglesa | 89,9 % |
| Concordancia top-1 tabla PLE mixta vs FP8 (código) | 99,3 % (KL media 4,4e-3) |
| Concordancia top-1 tabla PLE mixta vs FP8 (prosa) | 99,3 % (KL media 7,2e-4) |

Rendimiento medido en un Mac mini (Apple M4 Pro, 64 GB):

| Escenario | Velocidad de decodificacion | Memoria |
|---|---|---|
| Sin caché (lectura SSD) | 5,13 s/token (0,19 tok/s) | pico 15,0 GB |
| Caché fría (primer prompt) | 0,77 s/token (1,29 tok/s) | pico MLX 20,5 GiB |
| Caché, segundo prompt | 0,54 s/token (1,87 tok/s) | pico físico 22,5 GB |
| Caché caliente | 0,25–0,26 s/token (3,8–4,0 tok/s) | sin crecimiento de swap |

El autor advierte que la evaluación de concordancia se hizo sobre solo 8 secuencias que forman parte de los datos de calibración (test in-sample, probablemente optimista), y que la concordancia top-1 no debe interpretarse como "conserva el X % de la capacidad del modelo".

## Requisitos de hardware

- Memoria unificada: el conjunto completo de expertos K50 ocupa 16,24 GB una vez cacheados; con caché residente el pico de proceso es de 22,5 GB, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada (verificado en 64 GB).
- Hardware verificado: Mac mini con Apple M4 Pro y 64 GB de RAM. No hay datos de ejecución en GPU NVIDIA ni en otros entornos.
- Almacenamiento: 54 GB en disco para el checkpoint (21 GB de pesos por capas, 30 GB de tabla PLE, 2,6 GB de skeleton y nonexpert).
- Despliegue: exclusivamente mediante MLX (librería mlx, runtime Python oMLX incluido en el repositorio). No hay evidencia de soporte para vLLM, llama.cpp, Ollama o TGI.
- Rendimiento esperado: entre 0,19 tok/s leyendo expertos desde SSD y 3,8–4,0 tok/s con caché de expertos residente (presupuesto de 30,3 GB, límite de caché MLX de 2 GiB), en decodificación greedy.
- Prefill: 80,6 s sin caché, 47,2 s en frío y 2,6–3,3 s en caliente para prompts de unos 20 tokens.

## Comparativa con modelos similares

| Modelo | Arquitectura | Poda/cuantizacion | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50 | MoE ternario, 48 capas, 256/512 expertos en capas 1–47 | Mixta: ternaria + 8 bits + PLE 2–6 bits | 54 GB | qwen-community-1.0 | Publico en Hugging Face |
| Jakevin/Qwen3.8-Flash-Next-ternary-mlx (base) | MoE ternario, 48 capas, 512 expertos | Ternaria + PLE FP8 | 38 GB | qwen-community-1.0 | Publico en Hugging Face |
| Version anterior del K50 (FP8 PLE) | MoE ternario podado | Ternaria + 8 bits + PLE FP8 | 71 GB | no disponible | Sustituida por la version actual |

No hay información sobre modelos comparables de otros autores en la misma categoria.

## Limitaciones y advertencias

- La evaluación de concordancia se realizó sobre solo 8 secuencias incluidas en los datos de calibración: es un test in-sample probablemente optimista.
- La concordancia top-1 mide coincidencia de token predicho con el modelo sin podar, no capacidad retenida; no debe leerse como "conserva el 91,9 % de la habilidad".
- Ninguna benchmark estándar de capacidades se ha ejecutado sobre este modelo.
- La poda elimina la mitad de los expertos enrutados en 47 de las 48 capas, lo que puede degradar capacidades no cubiertas por las secuencias de calibración.
- El runtime está orientado exclusivamente a Apple Silicon con MLX; no hay soporte documentado para CUDA u otras plataformas.
- Sin caché de expertos, la velocidad es de unos 5–7 segundos por token, inviable para uso interactivo.
- Restricciones de licencia: licencia "other" con nombre qwen-community-1.0; los términos concretos de uso comercial deben consultarse en el archivo LICENSE del repositorio.
- Riesgos generales de alucinación y sesgos: no hay información específica publicada para este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50
- Modelo base: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-ternary-mlx
- Licencia: enlace LICENSE en el repositorio (no se proporciona URL directa)
- Paper, blog o demo: no disponible
