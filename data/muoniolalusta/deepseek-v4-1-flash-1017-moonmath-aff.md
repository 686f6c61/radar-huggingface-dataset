# Muoniolalusta/DeepSeek-V4.1-Flash-1017-MoonMath-aff

## Resumen

DeepSeek-V4.1-Flash-1017-MoonMath-aff es un contenedor cuantizado en formato propietario *affinity* (2,875 bits por peso en los expertos enrutados) del checkpoint comunitario MoonMath-ai/DeepSeek-V4.1-Flash-1017-uncensored, que a su vez deriva del lanzamiento oficial DeepSeek-V4.1-Flash del 17 de octubre. Lo publica el usuario Muoniolalusta como cuantización personal, no como lanzamiento oficial de DeepSeek, y esta empaquetado especificamente para ejecutarse en dos GPU AMD Radeon AI PRO R9700 (arquitectura RDNA 4, `gfx1201`) con paralelismo tensorial TP=2.

El modelo subyacente es un transformer de mezcla de expertos (MoE) con 40 capas, 384 expertos enrutados, dimension oculta de 5.120 y dimension intermedia de 2.304. Incorpora rasgos poco habituales: tokens numericos nativos de esfuerzo de razonamiento (`low: 50`, `medium/default: 75`, `high: 75`, `max: 100`), tool calling mediante un formato propietario DSML (`namespace::name`), capas Engram de n-gramas (4-gramas, 8 cabezas, dimension de cabeza 256, vocabulario 129.280 reducido a 99.092) y un modulo de vision que procesa parches de 378×378 en 92 tokens visuales de dimension 5.120.

Su relevancia es acotada pero clara: demuestra que es posible servir un MoE de gran tamano en hardware AMD de consumo profesional mediante un motor de inferencia alternativo (affinity), con decodificacion especulativa DSpark y un pool de expertos fijado en memoria anfitriona. El contenedor solo carga en el fork `drwolfen/deepseek-v4.1-flash-r9700-affinity` v5.6.1 o superior; no funciona en llama.cpp, vLLM ni SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas Engram de n-gramas y modulo de vision; 40 capas, 384 expertos enrutados |
| Parametros totales | no disponible (el repo pesa 211 GB; el contenedor cuantizado son 191,32 GiB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible de forma explicita; los benchmarks cubren hasta 64K tokens |
| Tipos de cuantizacion | 2,875 bpw en expertos enrutados (imatrix, codebook 2×1024); capas densas en FP8 E4M3; embeddings y LM head en BF16 (FP8 group-128 en carga con `AFF_LMHEAD_FP8=1`) |
| Idiomas soportados | no disponible |
| Licencia | `deepseek-license` (etiquetada como `other` en el Hub) |
| Formato de pesos | Contenedor `.aff` propietario del motor affinity, dividido en 5 partes de 40 GiB; sidecars `.dspark.aff` y `.engram`; codebook `.raw` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 40 capas, 384 expertos enrutados, dimension oculta 5.120 y dimension intermedia 2.304. Sobre esa base, el checkpoint incorpora dos componentes adicionales: capas Engram que modelan n-gramas de 4 elementos con 8 cabezas de dimension 256 sobre un vocabulario de 129.280 entradas reducido a 99.092, y un codificador visual que procesa entradas de 378×378 y las proyecta a 92 tokens visuales de dimension 5.120. El modelo base deriva del lanzamiento DeepSeek-V4.1-Flash del 17 de octubre, que introduce tokens numericos nativos de esfuerzo de razonamiento y tool calling en formato DSML.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El checkpoint intermedio MoonMath-ai se describe como una edicion de pesos *uncensored* de forma cerrada realizada por la comunidad, es decir, una modificacion post-entrenamiento de los pesos originales sin documentacion publica del proceso. La cuantizacion aplicada por Muoniolalusta usa pesos imatrix sobre los 15.360 hashes unicos de expertos contra un codebook de 2×1024 entradas (`0cb0c6a8317ca043`), con verificacion `aff-fp8check` sobre 330 tensores densos y un error relativo maximo de 4,28e-06. La decodificacion especulativa se implementa mediante el sidecar DSpark, con 3 etapas y 384 expertos de borrador.

## Capacidades

- Generacion de texto y razonamiento con control numerico del esfuerzo de razonamiento mediante tokens nativos (`low`, `medium`, `high`, `max`).
- Tool calling en formato DSML con sintaxis `namespace::name`.
- Razonamiento numerico y matematico (el sufijo MoonMath del nombre lo sugiere, aunque no hay evaluacion publicada que lo cuantifique).
- Procesamiento de vision: forward pass de 378×378 verificado con 92 tokens visuales y cero NaN segun `aff-vitcheck`.
- Modelado de n-gramas mediante capas Engram, con warm-up opcional (`AFF_ENGRAM_WARM=1`).
- Decodificacion especulativa DSpark con aceptacion medida del 99,6% en tareas de edicion de codigo y del 79,35% en el modo DSpark de 4 prompts.
- Capacidades multilingues: no disponibles.
- Modo *uncensored* heredado del checkpoint base, sin filtros de rechazo documentados.

## Casos de uso

- Servicio de inferencia en hardware AMD RDNA 4: el contenedor esta optimizado para dos Radeon AI PRO R9700 con TP=2 y kernels HIP propios, lo que permite desplegar un MoE de gran tamano en estaciones de trabajo AMD sin depender de CUDA.
- Edicion de codigo asistida: el benchmark `code_edit tg2` alcanza 43,51 tok/s con un 99,6% de aceptacion especulativa y 8,00 tokens por bloque, lo que lo hace viable para tareas interactivas de reescritura y refactorizacion.
- Procesamiento de documentos largos: con prefill en cache de 21.448 tok/s y decodificacion estable a 64K (46,81 tok/s), encaja en pipelines de resumen y extraccion sobre contratos, informes o expedientes extensos.
- Agentes con tool calling: el formato DSML `namespace::name` permite orquestar llamadas a funciones en flujos multi-paso, con el presupuesto de razonamiento ajustable por peticion.
- Analisis de imagenes tecnicas: el codificador visual de 378×378 admite clasificacion y descripcion de capturas, diagramas o documentacion escaneada dentro del mismo pipeline de texto.
- Investigacion sobre cuantizacion extrema: el contenedor sirve como referencia reproducible (checksums SHA-256, codebook publicado, verificaciones `aff-fp8check`, `aff-vitcheck` y `aff-engramcheck`) para estudiar el impacto de 2,875 bpw en un MoE de 384 expertos.
- Despliegue air-gapped: al ser un contenedor autocontenido con sidecars y codebook, puede servirse en entornos sin acceso al Hub una vez verificadas las cinco partes.

## Benchmarks y rendimiento

Medidas publicadas por el autor sobre dos Radeon AI PRO R9700 (2×32 GiB, ROCm 10.1.0-full, TP=2, 3.644 expertos residentes en VRAM y pool anfitrion de 15.360):

| Benchmark | Resultado (v5.6.1) |
|---|---|
| `l64k tg2` (decodificacion en caliente) | 46,81 tok/s (99,8 ms/bloque) |
| `l4k` / `l16k tg2` (decodificacion en caliente) | 46,48 tok/s |
| `code_edit tg2` (SuffixGate dinamico) | 43,51 tok/s (99,6% aceptacion, 8,00 tok/bloque) |
| Media DSpark de 4 prompts (`--default-effort 60`) | 23,59 tok/s (79,35% aceptacion, 3,605 tok/bloque) |
| `p4k tg2` (decodificacion con contexto de 4K) | 18,23 tok/s |
| Prefill en frio de 64K | 1.409 tok/s |
| Prefill con prefijo cacheado reutilizado | 21.448 tok/s (14,4×) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: el contenedor completo ocupa 191,32 GiB, distribuidos entre dos GPU de 32 GiB (64 GiB totales) mas un pool de expertos fijado en memoria anfitriona de hasta 200.000 MiB (`--host-pool-mib`).
- GPU soportadas: exclusivamente AMD Radeon AI PRO R9700 (`gfx1201`, RDNA 4) segun la model card; no hay soporte documentado para A100, H100 ni RTX 4090.
- No cabe en una unica GPU de consumo; el diseno exige TP=2 y un host con al menos 24 nucleos fisicos reservados (`--cpuset-cpus=0-23,48-71`) y capacidad de fijar paginas (`--cap-add SYS_NICE`).
- Motor de despliegue: solo el fork `drwolfen/deepseek-v4.1-flash-r9700-affinity` v5.6.1 o superior del motor affinity. No es compatible con llama.cpp, vLLM, SGLang, Ollama ni TGI.
- Latencia y throughput: 99,8 ms por bloque en decodificacion a 64K, 46,81 tok/s en caliente y 1.409 tok/s en prefill en frio de 64K.
- Configuracion de cache: `--prefix-cache-gib 64`, `--kv-size 327680`, `--kv-commit 262144`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-MoonMath-aff | no disponible (MoE 384 expertos, 40 capas) | hasta 64K medidos | deepseek-license | Solo affinity v5.6.1+ en AMD RDNA 4 | Cuantizacion 2,875 bpw, uncensored |
| DeepSeek-V4.1-Flash-1017 (original) | no disponible | no disponible | deepseek-license | Ecosistema estandar (vLLM, SGLang, etc.) | Pesos completos, sin edicion comunitaria |
| MoonMath-ai/DeepSeek-V4.1-Flash-1017-uncensored | no disponible | no disponible | no disponible | Segun el checkpoint base | Edicion de pesos uncensored, sin cuantizar |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible | No hay datos suficientes para una comparacion cuantitativa |

## Limitaciones y advertencias

- El contenedor solo funciona en el fork especifico del motor affinity; cualquier otro runtime fallara al cargar el formato `.aff`.
- Requiere hardware AMD RDNA 4 concreto (R9700); no hay soporte para CUDA ni para GPU de consumo convencionales.
- Es una cuantizacion personal de un checkpoint comunitario modificado, no un lanzamiento oficial de DeepSeek; no hay garantia de mantenimiento ni de soporte.
- El checkpoint base es una edicion *uncensored* de pesos de origen no documentado: no se conoce el proceso de entrenamiento ni los datos empleados, lo que agrava el riesgo de sesgos y de contenido inapropiado en produccion.
- Riesgo de alucinacion no evaluado: no se han publicado resultados de benchmarks de fidelidad, MMLU, HumanEval ni GSM8K.
- Idiomas soportados no documentados; no se puede asumir calidad multilingue fuera del ingles sin evaluacion.
- La licencia `deepseek-license` impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue productivo; ademas, la redistribucion de pesos modificados puede estar sujeta a condiciones adicionales.
- El modelo requiere un host con ~200 GB de memoria anfitriona para el pool de expertos y 64 GiB de VRAM, lo que limita su uso a estaciones de trabajo de gama alta.
- La decodificacion especulativa DSpark anade un sidecar de 5,22 GiB y depende de ajustes finos (`AFF_SPEC_BACKOFF`, `AFF_DRAFT_HEAD_INT4`) cuya configuracion incorrecta degrada el throughput.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta; no existe validacion independiente de las medidas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muoniolalusta/DeepSeek-V4.1-Flash-1017-MoonMath-aff
- Checkpoint base intermedio: https://huggingface.co/MoonMath-ai/DeepSeek-V4.1-Flash-1017-uncensored
- Repositorio del motor y kernels: https://github.com/drwolfen/deepseek-v4.1-flash-r9700-affinity
- Motor affinity original: https://codeberg.org/StillDeadcode/affinity
