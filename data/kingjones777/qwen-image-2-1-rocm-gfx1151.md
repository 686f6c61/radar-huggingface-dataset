# kingjones777/Qwen-Image-2.1-ROCm-gfx1151

## Resumen

`kingjones777/Qwen-Image-2.1-ROCm-gfx1151` no es un modelo con pesos: es un repositorio de documentación y medidas que registra qué hace falta para ejecutar `Qwen/Qwen-Image-2.1` en un AMD Ryzen AI Max+ 395 (Radeon 8060S, arquitectura gfx1151) bajo ROCm 7.13, y cuánto cuesta hacerlo. El autor publica únicamente un `README.md` con el registro de ejecución y el script `gen.py` empleado; los pesos siguen perteneciendo a Qwen. Su interés es práctico: es una de las primeras medidas reproducibles de un modelo de difusión texto-a-imagen de gran tamaño sobre una APU con memoria unificada, en lugar de sobre una GPU discreta NVIDIA.

El hallazgo central es que ROCm 7.13 no incluye base de datos de kernels MIOpen preajustados para gfx1151, de modo que cada forma de convolución se autoajusta en tiempo de ejecución la primera vez que aparece. Como el VAE es convolucional y el transformer no (trabajo GEMM), la primera generación encadena 825,6 s de decodificación VAE y la segunda solo 20,5 s, con un total que pasa de 1190,6 s a 410,9 s sin cambiar una línea de código. Los resultados persistentes en `~/.cache/miopen` son idénticos byte a byte entre ambas ejecuciones (221 184 bytes), lo que confirma el mecanismo.

El modelo base, Qwen-Image-2.1, es un pipeline de difusión `text-to-image` compuesto por un text encoder `Qwen3VLForConditionalGeneration` de 17,53 GB, un transformer `QwenImage21Transformer2DModel` de 14,23 GB (32 capas, 32 cabezas de 128 dimensiones) y un VAE de 1,35 GB. Todo el conjunto suma 33,1 GB en bf16 y permanece residente en la GPU durante la generación, con un pico de memoria asignada de 40,55 GB en frío y 36,89 GB en caliente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión texto-a-imagen: transformer `QwenImage21Transformer2DModel` + text encoder `Qwen3VLForConditionalGeneration` + VAE convolucional |
| Parámetros totales | No disponible (el repositorio solo publica tamaños en bytes: 33,1 GB en bf16) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 documentado y medido; otros formatos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 para este repositorio; los pesos pertenecen a Qwen bajo su propia licencia |
| Formato de pesos | El repositorio no contiene pesos; se descargan desde `Qwen/Qwen-Image-2.1` con `hf download` |
| Pipeline | text-to-image |
| Librería | diffusers (`QwenImage21Pipeline`, requiere >= 0.37.0.dev0) |
| Resolución y pasos medidos | 1024x1024, 24 pasos |
| Hardware de referencia | AMD Ryzen AI Max+ 395, Radeon 8060S (gfx1151) |
| Entorno de software | ROCm 7.13, torch 2.10.0 (hip 7.13.99004), diffusers 0.41.0.dev0, transformers >= 5.17 |

## Arquitectura y entrenamiento

El repositorio describe la composición del pipeline base, no su entrenamiento. El text encoder es de la familia Qwen3-VL (clase `Qwen3VLForConditionalGeneration`), lo que obliga a usar transformers 5.17 o superior y es la razón de que `QwenImage21Pipeline` sea más reciente que cualquier versión de diffusers publicada en PyPI. El transformer de difusión tiene 32 capas con 32 cabezas de 128 dimensiones. El VAE ocupa 1,35 GB y, a diferencia del transformer, su carga de trabajo es convolucional, un detalle que resulta determinante para entender el comportamiento en gfx1151. A partir del tamaño en bytes y asumiendo bf16 (2 bytes por parámetro) se puede derivar un orden de magnitud de unos 16 500 millones de parámetros, pero es un cálculo del autor de esta ficha, no un dato publicado.

La innovación técnica documentada no está en el modelo, sino en el diagnóstico del entorno de ejecución. MIOpen distribuye bases de datos de kernels preajustados por arquitectura, y ROCm 7.13 no trae ninguna para gfx1151, como evidencia el aviso `ParseAndLoadDb` sobre `gfx1151_20.HIP.fdb.txt`. El resultado es un autoajuste en tiempo de ejecución que solo penaliza las operaciones convolucionales (VAE) y no las GEMM (transformer, con tasa estable de 15,22-16,28 s por paso en ambas ejecuciones). El repositorio también documenta el modo `MIOPEN_FIND_MODE=FAST`, que acorta la búsqueda a costa de la calidad del kernel, recomendado únicamente para ejecuciones que no vayan a reportarse. No se aportan datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF, DPO o ajuste por preferencias: no disponibles.

## Capacidades

- Generación de imágenes a partir de prompts de texto con el pipeline `QwenImage21Pipeline`, a 1024x1024 y 24 pasos en la configuración medida.
- Inferencia en bf16 sobre una APU AMD con memoria unificada y ROCm 7.13, con todo el pipeline residente en GPU.
- Comprensión de prompts a través de un text encoder basado en Qwen3-VL, un modelo de lenguaje y visión que actúa como condicionador.
- Reproducción completa de la ejecución mediante el script `gen.py`, que incluye comprobación explícita de disponibilidad de HIP y aborta si no hay GPU.
- Diagnóstico del estado de la GPU y de la caché MIOpen durante la ejecución: lectura de `gpu_busy_percent`, tamaño de `~/.cache/miopen` y estado del proceso.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, audio ni modo de pensamiento.

## Casos de uso

- Evaluación de viabilidad de Strix Halo como estación de trabajo de difusión: el repositorio permite decidir si una APU Ryzen AI Max+ 395 con memoria unificada puede asumir generación de imágenes de 1024x1024 sin GPU discreta, con cifras concretas de tiempo y pico de memoria.
- Precalentamiento de la caché MIOpen antes de cualquier medición o demo: ejecutar una generación previa de descarte y comparar el tamaño de `~/.cache/miopen` evita reportar los 1190,6 s del primer arranque como si fueran el rendimiento real del sistema.
- Diagnóstico diferencial de falsos cuelgues en ROCm: el repositorio ofrece tres señales concretas (uso de GPU al 94-100 %, caché creciendo y estado de proceso `Rl`) para distinguir un autoajuste largo de un bloqueo real, algo directamente aplicable a soporte técnico y operación de clústeres con hardware AMD.
- Preparación reproducible de entornos sin contaminación de CPU: el uso de `python3 -m venv --system-site-packages` junto con una comprobación de `torch.cuda.is_available()` evita el fallo silencioso en el que el pipeline de 33 GB se ejecuta en CPU sin lanzar ningún error.
- Planificación de presupuesto temporal en pipelines por lotes: con 15,22-16,28 s por paso en régimen estable más la decodificación VAE en caliente, se pueden dimensionar colas de generación por lotes sabiendo que cada imagen de 1024x1024 y 24 pasos cuesta alrededor de 410 s en esta máquina.
- Dimensionado de memoria en hardware de memoria unificada: los picos de 40,55 GB (frío) y 36,89 GB (caliente) asignados frente a 42,82 GB y 38,60 GB reservados sirven para elegir la configuración de memoria del sistema y para comprobar si el pipeline cabe íntegramente sin offload.
- Referencia para portar el mismo pipeline a otras arquitecturas ROCm: el repositorio documenta qué componentes (solo los convolucionales) se ven afectados por la ausencia de base de datos de kernels, lo que orienta las pruebas en GPUs AMD distintas de gfx1151.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otras métricas de imagen) en la información disponible. Lo que sí se publica son medidas de tiempo y memoria en una máquina concreta, con dos ejecuciones a idéntica resolución y número de pasos pero prompt y semilla distintos:

| Fase | Ejecución 1 (fría) | Ejecución 2 (caliente) |
|---|---:|---:|
| Carga del pipeline a GPU | 7,3 s | — |
| Sampler, 24 pasos | 365,0 s (15,22 s/paso) | 390,4 s (16,28 s/paso) |
| Decodificación VAE | 825,6 s | 20,5 s |
| Total (`GEN_TIME_S`) | 1190,6 s | 410,9 s |
| Pico de GPU asignada | 40,55 GB | 36,89 GB |
| Pico de GPU reservada | 42,82 GB | 38,60 GB |

La decodificación VAE es 40 veces más rápida en la segunda ejecución sin cambio alguno en modelo o código, y la caché MIOpen queda en 221 184 bytes en ambos casos, idéntica, sin ajustes nuevos.

## Requisitos de hardware

- Memoria: el pipeline completo ocupa 33,1 GB en bf16 (text encoder 17,53 GB, transformer 14,23 GB, VAE 1,35 GB) y permanece residente en GPU durante la generación, con picos medidos de 40,55 GB asignados y 42,82 GB reservados en la primera ejecución.
- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151) y ROCm 7.13. La memoria del sistema se usa como memoria unificada, por lo que una configuración de 128 GB es holgada y una de 64 GB queda al límite.
- GPU discretas: por encima de 40 GB de pico asignado, el pipeline no cabe en una RTX 4090 de 24 GB ni en una RTX 5090 de 32 GB sin técnicas de offload que no se documentan. GPU de 48 GB o más (A6000, L40S) y de 80 GB (A100, H100) serían las candidatas profesionales, aunque no hay medidas publicadas en ellas.
- Cabe en GPU de consumo: no con los datos disponibles; el requisito de memoria supera el de cualquier GPU de consumo actual.
- Despliegue: `diffusers` con `QwenImage21Pipeline` instalado desde la rama main de GitHub (`diffusers >= 0.37.0.dev0`), más `transformers >= 5.17`, `accelerate` y `safetensors`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no se trata de un modelo de lenguaje.
- Latencia medida: 15,22-16,28 s por paso de muestreo, 20,5 s de decodificación VAE en caliente y 410,9 s de total en la segunda ejecución; 1190,6 s en la primera. No se publica throughput por lote.
- Ajuste de entorno: `MIOPEN_FIND_MODE=FAST` acorta la búsqueda de kernels a costa de su calidad y no debe usarse en la ejecución que se vaya a reportar. El proceso debe abortar si `torch.cuda.is_available()` es falso para evitar una caída silenciosa a CPU, descrita como aproximadamente 30 veces más lenta.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de texto-a-imagen en la información proporcionada, por lo que no es posible comparar parámetros, contexto, rendimiento o licencia con alternativas como FLUX, Stable Diffusion u otros pipelines de difusión: no disponible. La comparación que sí puede hacerse con los datos publicados es entre configuraciones de ejecución del mismo pipeline:

| Configuración | Tiempo total | Notas |
|---|---:|---|
| gfx1151, caché MIOpen fría (primera ejecución) | 1190,6 s | No representativo del rendimiento estable |
| gfx1151, caché MIOpen caliente (segunda ejecución) | 410,9 s | Cifra que el autor considera honesta |
| gfx1151 con `MIOPEN_FIND_MODE=FAST` | No disponible | Documentado como más rápido en la búsqueda, con menor calidad de kernel; no medido |
| Ejecución en CPU | No disponible | Documentada como aproximadamente 30 veces más lenta; no medida |
| GPU discreta NVIDIA vía CUDA | No disponible | No se han publicado medidas en la información disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos. Cualquier uso del modelo requiere descargar `Qwen/Qwen-Image-2.1` por separado y aceptar su licencia, que es distinta de la Apache-2.0 que figura en este repositorio.
- Los tiempos de la primera ejecución no son representativos. Reportar 1190,6 s como velocidad del modelo en este hardware es un error metodológico explícitamente señalado por el autor; hay que calentar la caché y volver a medir.
- El primer arranque es indistinguible de un cuelgue durante unos 13 minutos: sin salida de log, un hilo al 100 % y el proceso aparentemente bloqueado. Solo la inspección de `gpu_busy_percent`, del tamaño de `~/.cache/miopen` y del estado del proceso permite diferenciarlos.
- Riesgo de ejecución silenciosa en CPU. Si pip resuelve torch desde cero o se reutiliza un virtualenv con torch solo para CPU, el pipeline de 33 GB se ejecuta en CPU sin lanzar ningún error, con una penalización estimada de 30 veces.
- Los resultados proceden de una única máquina, con la caja en reposo, y de una única versión del stack (ROCm 7.13, torch 2.10.0, diffusers 0.41.0.dev0). Cualquier cambio de versión de ROCm, de la rama main de diffusers o de carga concurrente en el sistema puede alterar las cifras.
- Dependencia de la rama main de diffusers: la instalación se hace desde un archivo ZIP de GitHub, no desde una versión publicada, lo que implica una superficie de cambio e inestabilidad de API en producción.
- No se publican datos de sesgo, composición del dataset de entrenamiento, idiomas soportados ni tasas de alucinación o fidelidad del prompt, por lo que no hay base para evaluar la calidad de las imágenes generadas.
- Las medidas de memoria son de la asignación del proceso, no de un perfilado exhaustivo; en sistemas con memoria unificada, la presión sobre la memoria del sistema puede afectar a otras cargas concurrentes.
- El aviso de MIOpen no es una anomalía puntual del autor, sino una carencia de ROCm 7.13 para gfx1151, por lo que afectará a cualquier despliegue de modelos convolucionales en esa arquitectura hasta que AMD publique la base de datos correspondiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kingjones777/Qwen-Image-2.1-ROCm-gfx1151
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Rama main de diffusers (instalación desde ZIP): https://github.com/huggingface/diffusers/archive/refs/heads/main.zip
- En la búsqueda web realizada no se han encontrado papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
