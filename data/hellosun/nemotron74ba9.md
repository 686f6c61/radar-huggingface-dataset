# HelloSun/Nemotron74ba9

## Resumen

Nemotron74ba9 es una redistribución del modelo NVIDIA Nemotron 3.5 Bolt 74B-A9B en formato GGUF, publicada por el usuario HelloSun. No se trata de un modelo nuevo ni de una cuantización propia: los ficheros GGUF son idénticos a los del repositorio oficial `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF`. Lo que aporta este repositorio es un parche para llama.cpp (basado en el commit `de5122d`) optimizado para CPU Intel Xeon Platinum 8559C con AVX512-VNNI, junto con los resultados de benchmarks A/B y los scripts de compilación.

El modelo base es un híbrido Mamba-2 / Transformer con mezcla de expertos (LatentMoE) de 74.042.720.848 parámetros totales, de los cuales aproximadamente 9.000 millones están activos por token (según la nomenclatura A9B). Incluye además un proyector de visión (`mmproj`), por lo que es multimodal. El GGUF ocupa 20,5 GiB y combina tres tipos de pesos: IQ2_XXS para los expertos enrutados y compartidos (16,3 GiB), NVFP4 para todas las proyecciones `ssm_in` / `ssm_out` de Mamba-2 (2,3 GiB) y Q8_0 para atención, proyecciones latentes y salida.

La relevancia de este repositorio es fundamentalmente práctica: demuestra que un modelo de 74B con expertos y visión puede ejecutarse en CPU con un rendimiento de prefill razonable (45,1 t/s en pp256 con 16 hilos) gracias a kernels AVX512-VNNI para NVFP4 escritos a mano. Es un caso de estudio útil para quienes despliegan modelos grandes en infraestructura sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 / Transformer con LatentMoE (mezcla de expertos) |
| Parametros totales | 74.042.720.848 |
| Parametros activos | ~9B (según nomenclatura A9B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (expertos), NVFP4 (proyecciones Mamba-2), Q8_0 (atención, latentes, salida) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (NVIDIA Open Model Development Workload) |
| Formato de pesos | GGUF (con fichero `mmproj` separado para visión) |

## Arquitectura y entrenamiento

El modelo base es un híbrido que combina capas Mamba-2 (modelo de espacio de estados) con capas Transformer y una mezcla de expertos de tipo LatentMoE. Esta combinación busca reducir el coste de atención en contextos largos manteniendo la calidad de un transformer denso, con un total de 74B parámetros pero solo ~9B activos por token. El repositorio redistribuye los pesos en GGUF con una mezcla de cuantizaciones poco habitual: los expertos van en IQ2_XXS (2 bits), las proyecciones de estado `ssm_in`/`ssm_out` en NVFP4 (4 bits con escalas UE4M3) y las capas de atención y salida en Q8_0. Esta elección refleja que las proyecciones Mamba-2 son especialmente sensibles a la cuantización agresiva.

El parche de HelloSun se centra en optimizar los kernels NVFP4 para CPU x86 con AVX512-VNNI. Añade un `vec_dot` específico para NVFP4 x Q8_0 que procesa bloques de 64 pesos por iteración, decodificando la magnitud E2M1 mediante un shuffle de 16 bytes y el signo con el bit 3 de cada nibble, aplicando `dpbusd` sobre magnitudes sin signo y escalando con un vector de floats por carril (sin reducción horizontal). También implementa un kernel 2x2 (`nrc == 2`) para prefill que reutiliza cada bloque de pesos decodificado para dos columnas de activación. Los tests unitarios reportan un error relativo de ~5e-7 frente a referencia en doble precisión. El parche E1 opcional descomprime cada fila NVFP4 a una sombra fp16 exacta y ejecuta un GEMM fp16 x fp16 → fp32 vía `sgemm` de llamafile, a costa de ~8,8 GB extra de RSS asignados de forma perezosa.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Nemotron 3.5 Bolt.
- Procesamiento multimodal de imágenes gracias al proyector de visión `mmproj` incluido en el repositorio.
- Mezcla de expertos con ~9B parámetros activos, lo que reduce el coste computacional por token frente a un denso de 74B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Ejecución en CPU sin GPU mediante llama.cpp, incluyendo soporte de AVX512-VNNI para NVFP4.

## Casos de uso

- Despliegue en servidores sin GPU: el repositorio está específicamente orientado a ejecutar un modelo de 74B en CPU Xeon con AVX512-VNNI, usando llama.cpp parcheado. Adecuado para entornos donde la GPU no está disponible o es demasiado cara.
- Inferencia con presupuesto de memoria ajustado: el GGUF de 20,5 GiB cabe en servidores con 32 GB de RAM, permitiendo servir un modelo multimodal de gran tamaño en hardware modesto.
- Procesamiento por lotes de documentos con imágenes: el proyector de visión permite tareas de comprensión de documentos escaneados o capturas, ejecutables en CPU durante la noche.
- Evaluación comparativa de kernels de cuantización: el repositorio incluye benchmarks A/B crudos y parches separados, útil para ingenieros que quieran medir el impacto de kernels AVX512-VNNI en NVFP4 frente a AVX2.
- Prototipado de asistentes conversacionales en local: al ser un modelo conversacional con contexto suficiente (longitud exacta no disponible), puede usarse para iterar en prompts y flujos antes de migrar a GPU.
- Investigación sobre arquitecturas híbridas Mamba-2/MoE: permite estudiar el comportamiento de un modelo híbrido real en CPU, comparando la calidad de las cuantizaciones IQ2_XXS y NVFP4 en distintas capas.
- Prefill intensivo en CPU: con el parche E1 (fp16 prefill) se alcanzan 57 t/s en pp512, útil para tareas donde se procesan prompts largos y la generación es corta (clasificación, extracción, resumen).

## Benchmarks y rendimiento

Resultados medidos por el autor en un Intel Xeon Platinum 8559C, 16 hilos (`taskset -c 0-15`, `-t 16 -fa on -lm mlock -b 1024 -ub 1024`, llama-bench):

| Build | pp256 t/s (mediana, n=5) | tg64 t/s (media, n=3) |
|---|---|---|
| llama.cpp stock `de5122d` | 30,9 | 10,2 |
| Parche principal | 45,1 | 9,1 (5,8 / 9,9 / 11,6) |
| Aceleración | ~1,46x | sin ganancia fiable en decodificación |

Resultados del parche E1 (prefill fp16 para NVFP4), con `-t 12 -fa 1 -lm mlock`, 3 rondas x 2 repeticiones, mediana:

| Test | Parche principal | + E1 | Aceleración |
|---|---|---|---|
| pp64 | 31,9 | 40,4 | 1,27x |
| pp128 | 34,9 | 46,2 | 1,32x |
| pp256 | 37,9 | 52,9 | 1,39x |
| pp512 | 40,0 | 57,0 | 1,42x |
| tg64 | 10,3 | 10,9 | sin cambio (ruido) |

Perplejidad con E1: 8,6881 ± 0,66211 frente a 8,7051 ± 0,66329 del parche principal. El autor señala que la decodificación está limitada por ancho de banda de memoria (~80 GB/s efectivos frente a un techo de 120-150 GB/s), por lo que ningún kernel mejora el tok/s de forma apreciable. Con 12 hilos se evita el throttling CFS y se obtiene una decodificación más estable (9,6-10,3 t/s) que con 16 hilos (7,0-10,9 t/s).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el GGUF principal ocupa 20,5 GiB; con el proyector de visión y overhead de llama.cpp se recomienda un mínimo de 32 GB de RAM. El parche E1 añade ~8,8 GB extra de RSS asignados de forma perezosa en el primer prefill de cada tensor NVFP4, por lo que el total puede acercarse a 40 GB si se usa.
- CPU: el parche está optimizado para AVX512-VNNI (Intel Xeon Platinum 8559C como referencia). En CPUs sin AVX512, el kernel 2x2 cae a cuatro llamadas `nrc == 1`, por lo que sigue funcionando pero sin la aceleración.
- GPU: no se requiere GPU; el modelo está pensado para ejecución en CPU. No hay datos de ejecución en GPU en la información proporcionada.
- Despliegue: llama.cpp con el parche del repositorio (commit base `de5122d`). El script `build.sh` clona, aplica el parche y compila. No se mencionan vLLM, TGI ni Ollama.
- Throughput estimado: prefill 45,1 t/s (pp256, 16 hilos) o 57,0 t/s (pp512 con E1, 12 hilos); decodificación ~9-10 t/s con 12 hilos. La decodificación está limitada por ancho de banda de memoria.
- Hilos recomendados: `-t 12` para decodificación estable; `-t 16` para prefill si la cuota de CPU lo permite.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Nemotron 3.5 Bolt 74B-A9B (este repo) | 74B | ~9B | no disponible | OpenMDW-1.1 | GGUF (IQ2_XXS + NVFP4 + Q8_0) | Híbrido Mamba-2/MoE, multimodal, optimizado para CPU |
| NVIDIA Nemotron 3.5 Bolt 74B-A9B (oficial) | 74B | ~9B | no disponible | OpenMDW-1.1 | GGUF | Mismos pesos sin parche de CPU |
| Alternativas de 70B densos (p. ej. Llama 3.x 70B) | ~70B | 70B | no disponible | variable | GGUF/safetensors | No comparables directamente por arquitectura y activos |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. La comparación con modelos densos de 70B no es directa porque este modelo activa solo ~9B parámetros por token y usa una arquitectura híbrida SSM/Transformer.

## Limitaciones y advertencias

- El repositorio no es un modelo nuevo: redistribuye pesos de NVIDIA. Cualquier limitación del modelo base aplica aquí.
- La licencia OpenMDW-1.1 es una licencia de NVIDIA con condiciones específicas; es necesario revisar el texto completo antes de uso comercial.
- El parche está optimizado para un CPU concreto (Xeon Platinum 8559C con AVX512-VNNI). En otras CPUs el rendimiento puede degradarse y el kernel 2x2 cae a la ruta `nrc == 1`.
- El parche E1 consume ~8,8 GB adicionales de RAM en el primer prefill; en máquinas con poca memoria puede provocar OOM.
- La decodificación no mejora con el parche: está limitada por ancho de banda de memoria (~80 GB/s efectivos). No esperar ganancias de tok/s en generación.
- El uso de IQ2_XXS (2 bits) en los expertos puede degradar la calidad frente al modelo original en fp16/bf16; no se han publicado evaluaciones de calidad más allá de la perplejidad del parche E1.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación específico en la información proporcionada.
- El repositorio tiene 0 likes y 537 descargas; es un proyecto de un usuario individual, no mantenido por NVIDIA. La fiabilidad a largo plazo no está garantizada.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HelloSun/Nemotron74ba9
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- llama.cpp (commit base `de5122d`): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada
