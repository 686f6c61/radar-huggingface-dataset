# ahrazzle/SiliGemma-1.0

## Resumen

SiliGemma 1.0 es una distribucion optimizada de inferencia del modelo `google/gemma-4-E2B-it`, publicada por ahrazzle (Moissanite Labs / Foundation-0) bajo licencia Apache 2.0 heredada. No se trata de un modelo entrenado desde cero ni de un fine-tuning adicional, sino de un artefacto de despliegue: un archivo de pesos cuantizados en formato propietario `.slgb` (variante `slgb-v1`) acompanado de un motor de inferencia bare-metal escrito en C++20/CUDA para arquitecturas `sm_86` (Ampere). El objetivo declarado es eliminar por completo las dependencias de Python, PyTorch, `transformers` y `cuBLAS` en el camino de decodificacion, manteniendo una paridad numerica estricta con la implementacion `FP32` de referencia.

El modelo base es Gemma 4 E2B instruct, con 35 capas de texto, 20 capas superiores con comparticion de KV (`KVSharing`) y un vocabulario de 262.144 tokens. Sobre esa arquitectura, SiliGemma introduce una cuantizacion de pesos a 4,5 bits por peso (bpw) mediante un esquema denominado `A_16 Block-H4`, que combina un codigo de Hamming extendido `[16, 11, 4]` con una transformada de Walsh-Hadamard de orden 4 y empaquetado en nibbles de complemento a dos con grupo de escala `g=32`. El resultado es un archivo de 2,09 GB que contiene 276 lineales cuantificados, el embedding en BF16 y una sombra de `lm_head` a 4,5 bpw.

La relevancia de esta publicacion es fundamentalmente de sistemas: demuestra que es posible ejecutar un modelo de la familia Gemma 4 con contexto de 128K en 2,33 GiB de VRAM estatica, sin asignacion dinamica de memoria, y con un motor CUDA de 33 kernels sin derrames de registros (`0 B` de stack, `<= 48` registros, `0` instrucciones `LDL`/`STL`). Las cifras reportadas por el autor son 135,02 tok/s a `B=1` y 873,20 tok/s a `B=16` en una RTX 3080 Laptop GPU. Conviene subrayar que se trata de un artefacto muy especializado, atado a una arquitectura de GPU concreta y a un formato de pesos no estandar, con un unico idioma declarado (ingles) y sin datos de benchmarks de calidad del modelo base en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 E2B: 35 capas de texto, 20 capas superiores con KV sharing); motor de inferencia bare-metal C++20/CUDA `sm_86` |
| Parametros totales | No disponible de forma explicita; el archivo contiene 276 lineales cuantificados (1.055.711.232 B) y omite 18.880.512 parametros de tensores KV muertos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K (segun el envelope de memoria estatica reportado) |
| Tipos de cuantizacion | Pesos a 4,5 bpw (`A_16 Block-H4`, `g=32`, nibbles de complemento a dos `[-8, 7]` + escala IEEE FP16); `embed_tokens` en BF16; `lm_head` en sombra a 4,5 bpw; 262 normas/escalares en FP32 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (heredada; enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | `.slgb` (`slgb-v1`), archivo `gemma4_formb_g32.slgb` de 2.094.062.080 B; SHA-256 verificado `111a672f1d52ba835b67e08daf1ab12de950ee3f909d6c7906c7292d22e48929` |

## Arquitectura y entrenamiento

SiliGemma 1.0 no incluye entrenamiento propio: hereda los pesos de `google/gemma-4-E2B-it` y los transforma mediante un pipeline de cuantizacion y empaquetado. Cada vector de pesos de 16 elementos se proyecta sobre el retículo `A_16 = 2Z^16 + C_[16,11,4]`, se rota con una transformada de Walsh-Hadamard de orden 4 (`Block-H4`) y se empaqueta en nibbles de 4 bits con signo en complemento a dos, con grupo de escala de 32 elementos (`16 B` de codewords empaquetados + `2 B` de escala FP16 = 4,5 bpw). El codigo de Hamming extendido `[16, 11, 4]` con deteccion y correccion simple de errores (`SECDED`) se aplica sobre el plano LSB (`0x11111111`), y el autor reporta cero errores de sindrome sobre 142.467.072 palabras de 64 bits verificadas.

El motor de inferencia es la innovacion central: 33 kernels CUDA especializados compilados con `nvcc -arch=sm_86 -O3 --Werror all-warnings`, con un maximo de 48 registros, marco de pila de 0 B, cero derrames y cero instrucciones `LDL`/`STL` en SASS. Incluye una ruta escalar exacta de 3 limbs en radix-128 (`dp4a22`) para `B=1` y una ruta de Tensor Cores con `mma.sync.m16n8k16` y pares FP16 para `B=16`. Ademas, incorpora un mecanismo de steering en el hub `L10..L14` (20x `shared_KV`) mediante una inversa de Cayley-Woodbury de 8x8 mantenida en 256 B de memoria constante, con un sobrecoste de latencia del 1,89 %, y un bucle recurrente `L25..L33` (`K=2`, profundidad efectiva de 44 capas) que reejecuta esas capas sin KV cache adicional ni pesos extra. El motor exige `bos_token_id = 2`, valida checksums CRC-32 de cabecera y verifica la ausencia de tensores KV muertos antes de ejecutar CUDA Graphs sobre un arena estatico.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instruct base Gemma 4 E2B.
- Razonamiento multi-paso y matematicas: el autor reporta mejoras en NLL de GSM8K y Countdown con el bucle recurrente `L25..L33`.
- Generacion de codigo: no se documentan capacidades especificas ni benchmarks de codigo en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes: no documentado; el motor esta orientado a decodificacion de texto.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales: inferencia bare-metal sin Python/PyTorch, paridad numerica FP32 declarada, correccion de errores SECDED en los pesos, telemetria `IRIS` y trampas de troyanos en el decodificador.
- Vision y audio: no disponibles (el modelo base es de texto y la publicacion no declara capacidades multimodales).

## Casos de uso

- Despliegue en entornos sin Python ni PyTorch: el motor enlaza solo bibliotecas estandar de OS/CUDA, por lo que puede integrarse en servicios C++ nativos o contenedores minimos donde no se desea arrastrar el stack de `transformers`.
- Inferencia de baja latencia en GPUs consumer Ampere: con 135 tok/s a `B=1` en una RTX 3080 Laptop, es adecuado para asistentes interactivos en estaciones de trabajo con GPU de gama media.
- Servicio por lotes con throughput alto: a `B=16` alcanza 873 tok/s con un arena estatico de 2,33 GiB, lo que permite servir varias peticiones concurrentes en una sola GPU sin reasignacion dinamica de memoria.
- Contextos largos en VRAM reducida: el envelope de 128K contexto en 2,33 GiB habilita resumen y analisis de documentos extensos en GPUs con 8-12 GB de VRAM.
- Sistemas embebidos y edge con GPU Ampere: la ausencia de asignacion dinamica y de dependencias de runtime facilita el despliegue determinista en dispositivos con memoria acotada.
- Verificacion de integridad de pesos en produccion: el esquema SECDED con telemetria `IRIS` y trampas de troyanos permite detectar corrupcion o manipulacion del archivo `.slgb` en pipelines de despliegue.
- Investigacion en cuantizacion reticular: el formato `A_16 Block-H4` y las rutas `dp4a22`/`mma` sirven como banco de pruebas para estudiar el compromiso entre bpw, paridad numerica y throughput.

## Benchmarks y rendimiento

Los datos disponibles son de rendimiento del motor y paridad numerica, no de calidad del modelo base:

| Metrica | Resultado reportado |
|---|---|
| Error maximo de logits vs. `FP32` `Gemma4ForCausalLM` (`B=1`) | `6.509e-5`; coseno `0.9999999999993`; 6/6 top-1 exactos |
| Error maximo de logits vs. `FP32` (`B=16`, ruta Tensor Core) | `1.125e-4`; coseno `0.9999999999987`; 48/48 top-1 exactos |
| Throughput `B=1` (RTX 3080 Laptop) | 135,02 tok/s (mejora 1,51x sobre 89,50 tok/s) |
| Throughput `B=16` (RTX 3080 Laptop) | 873,20 tok/s (mejora 3,87x sobre 225,81 tok/s) |
| VRAM estatica a 128K contexto | 2.388,06 MiB (2,33 GiB), 0 B dinamicos en 1.000 pasos |
| Stalls de DMA asincrono PLE | 0,802 % |
| Sobrecoste del steering Cayley-Woodbury | +1,89 % de latencia |
| Errores de sindrome SECDED | 0 sobre 142.467.072 palabras de 64 bits |
| Test de convergencia del bucle recurrente | `WT2 128.413`, `p = 9.999e-5`; `rho_hat = 0.0995` base, `0.1720` conjunto `H1` |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) del modelo base en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 2,33 GiB (2.388,06 MiB) para el arena estatico a 128K de contexto, sin asignacion dinamica adicional.
- GPU recomendadas: exclusivamente arquitecturas `sm_86` (Ampere). El motor se compila con `-arch=sm_86`; no hay rutas para `sm_80`, `sm_89`, `sm_90` ni arquitecturas anteriores o posteriores.
- Cabe en GPU consumer: si, en tarjetas Ampere como RTX 3060, 3070, 3080, 3090 y variantes Laptop; el autor valida en RTX 3080 Laptop GPU.
- Opciones de despliegue: motor propio `siligemma_bench_sm86` (C++20/CUDA); no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.slgb` y el motor son propietarios.
- Latencia y throughput: 135,02 tok/s a `B=1` y 873,20 tok/s a `B=16` en RTX 3080 Laptop GPU, con un sobrecoste del 1,89 % por el steering y un 0,802 % de stalls de DMA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SiliGemma 1.0 | Base Gemma 4 E2B (no desglosado) | 128K | `.slgb` + motor CUDA `sm_86` propietario | Apache 2.0 (heredada) | Hugging Face (repo de 2,1 GB) |
| google/gemma-4-E2B-it | No disponible en la informacion | No disponible en la informacion | Safetensors / `transformers` | Licencia Gemma 4 | Hugging Face |
| ahrazzle/SiliGemma-4-E2B-FormA | Base Gemma 4 E2B | No disponible | `.slgb` (variante FormA, pesos del hub `L10..L14`) | Apache 2.0 (heredada) | Hugging Face |

No se dispone de datos de benchmarks de calidad para establecer una comparacion de rendimiento frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Acoplamiento hardware: el motor solo compila y ejecuta en `sm_86`; no hay soporte para otras arquitecturas NVIDIA ni para CPU.
- Formato propietario: los pesos `.slgb` no son cargables por `transformers`, vLLM, llama.cpp ni otras herramientas estandar; la portabilidad es nula fuera del motor del autor.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta documentado y probablemente degrade.
- Sin benchmarks de calidad: no se publican resultados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad del modelo base en la informacion disponible.
- Riesgo de alucinacion: inherente al modelo base instruct; no se documentan mitigaciones especificas.
- Sesgos: no se documentan evaluaciones de sesgo ni de toxicidad.
- Licencia: aunque el campo declara Apache 2.0, el enlace apunta a la licencia de Gemma 4 de Google; conviene verificar los terminos aplicables al uso comercial del modelo base.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-11-27); no hay evidencia de uso en produccion ni de validacion independiente de las cifras reportadas.
- Las metricas de rendimiento y paridad numerica proceden exclusivamente de la model card del autor y no han sido replicadas de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ahrazzle/SiliGemma-1.0
- Coleccion SiliQuant Flagships: https://huggingface.co/collections/ahrazzle/siliquant-flagships-6b09fd348ec8b911eb469008
- Repositorio GitHub: https://github.com/Moissanite-Labs/siligemma
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Pesos del hub FormA: https://huggingface.co/ahrazzle/SiliGemma-4-E2B-FormA
- Perfil del autor: https://huggingface.co/ahrazzle
