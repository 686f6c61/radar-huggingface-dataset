# kingjones777/Ornith-1.5-35B-A3B-Abliterated-ROCmFP4-GGUF

## Resumen

Ornith-1.5-35B-A3B-Abliterated-ROCmFP4-GGUF es una recopilación de seis cuantizaciones GGUF del modelo Ornith-1.5-35B-A3B en su variante "abliterated" (es decir, con las direcciones de rechazo eliminadas mediante la técnica de abliteración). El trabajo original de abliteración corresponde a huihui-ai, la conversión a GGUF en BF16 a PocketAiHub y el modelo base a ornith-ai; este repositorio de kingjones777 añade únicamente la escalera de cuantización ROCmFP4/ROCmFPX, el binario de doble backend (HIP y Vulkan) y las mediciones de rendimiento.

El modelo es un Mixture of Experts (MoE) de aproximadamente 34.660 millones de parámetros totales, con arquitectura de tipo transformer disperso, y está orientado explícitamente al hardware AMD Strix Halo (Ryzen AI Max+ 395 con iGPU Radeon 8060S, gfx1151). Su relevancia actual reside en que demuestra que, en este modelo concreto, la elección de backend (Vulkan frente a ROCm) pesa unas diez veces más que la elección del nivel de cuantización: los tres niveles de 4 bits quedan dentro de un 1,5 % entre sí.

Incluye además un torre de visión heredada del repositorio de origen (`mmproj` en F16) que permite entrada de imagen, y una licencia Apache 2.0 que facilita el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), modelo base Ornith-1.5-35B-A3B |
| Parametros totales | 34.660.610.688 (~34,7 B) |
| Parametros activos | no disponible (el nombre A3B sugiere ~3 B activos, dato no confirmado en la informacion) |
| Longitud de contexto | 32.768 tokens (configuracion medida por el autor con `-c 32768`) |
| Tipos de cuantizacion | ROCmFP4 (Q4_0 en tres variantes: COHERENT, FAST, STRIX_LEAN) y ROCmFPX (Q6_0 y Q8_0); tipos ggml 100-119 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye torre de vision `mmproj` en F16) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) de unos 34,7 mil millones de parámetros totales, del que no se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición del dataset ni si se aplicaron fases de RLHF o DPO. La variante "abliterated" de huihui-ai elimina las direcciones de activación asociadas al rechazo, lo que produce un modelo sin censura alineada.

La contribución técnica de este repositorio es la cuantización ROCmFP4/ROCmFPX, que emplea tipos de tensor ggml con identificadores 100-119, fuera del rango estándar (0-43) de llama.cpp upstream. Esto obliga a compilar una versión modificada (ROCmFPX de charlie12345) con los backends HIP y Vulkan habilitados simultáneamente; el backend se selecciona en tiempo de ejecución con el flag `-dev` (ROCm0 o Vulkan0) sin recompilar. Las tres variantes de 4 bits se diferencian en la cuantización de embeddings y cabeza de salida: COHERENT usa q6_K en ambos, FAST emplea embeddings FP4 nativos y STRIX_LEAN busca consistencia en Vulkan.

## Capacidades

- Generación de texto conversacional multi-turno en cuatro dominios medidos por el autor: código, prosa, razonamiento y JSON.
- Entrada de imagen mediante la torre de visión `mmproj-Ornith-1.5-35B-A3B-Abliterated-F16.gguf`, que se pasa con `--mmproj`.
- Soporte de plantillas de chat Jinja (`--jinja`) y modo conversacional.
- Enrutamiento de agentes y tool calling en las variantes Q6_0 y Q8_0 ROCmFPX_AGENT, orientadas explícitamente a este uso.
- Generación sin censura alineada (variante abliterated), útil para investigación sobre alineación y filtrado.
- Compatibilidad con endpoints de API (`endpoints_compatible`).
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente conversacional local en un equipo Strix Halo: con el archivo COHERENT en Vulkan se obtienen 64,5 tok/s de decodificación, suficiente para chat interactivo fluido sin GPU dedicada.
- Generación de código en un IDE local: el archivo FAST en ROCm alcanza 57,4 tok/s de decodificación y 426 tok/s de prefill, lo que reduce la latencia en prompts largos con contexto de repositorio.
- Enrutamiento de agentes y tool calling: las variantes Q6_0 y Q8_0 ROCmFPX_AGENT están pensadas para bucles agénticos donde la precisión del formato de llamada a herramientas importa más que la velocidad.
- Procesamiento de documentos con imagen: usando el `mmproj` F16 se puede hacer OCR o descripción de capturas en un flujo local, sin enviar datos a la nube.
- Investigación sobre alineación y censura: la variante abliterated permite estudiar el comportamiento del modelo sin las direcciones de rechazo, comparándolo con el modelo base original.
- RAG sobre prompts largos: el backend ROCm ofrece entre un 45 % y un 67 % más de prefill que Vulkan, lo que lo hace preferible cuando se inyectan muchos documentos en el contexto de 32K.
- Prototipado de pipelines JSON estructurados: los cuatro dominios medidos incluyen JSON con rendimiento estable (56-64 tok/s en 4 bits), adecuado para extracción de datos estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica mediciones de throughput en Ryzen AI Max+ 395 (gfx1151), ROCm 7.2.4, Ubuntu 24.04, contexto 32768, caché K/V q8_0, temperatura 0, top_k 1, 400 tokens, mediana de 3 ejecuciones:

| Nivel | Backend | Código (tok/s) | Prosa (tok/s) | Razonamiento (tok/s) | JSON (tok/s) | Prefill (tok/s) | GTT |
|---|---|---:|---:|---:|---:|---:|---:|
| COHERENT | ROCm0 | 56,38 | 56,28 | 56,15 | 56,32 | 395 | 21 GiB |
| COHERENT | Vulkan0 | 64,51 | 62,63 | 64,27 | 64,03 | 249 | 20 GiB |
| FAST | ROCm0 | 57,35 | 57,18 | 56,70 | 56,43 | 426 | 20 GiB |
| FAST | Vulkan0 | 62,30 | 57,96 | 58,18 | 58,33 | 254 | 18 GiB |
| STRIX_LEAN | ROCm0 | 56,59 | 56,43 | 56,11 | 56,46 | 423 | 20 GiB |
| STRIX_LEAN | Vulkan0 | 62,69 | 62,59 | 62,55 | 63,72 | 256 | 18 GiB |
| Q6_ROCMFPX_AGENT | ROCm0 | 42,00 | 39,88 | 40,26 | 40,91 | 199 | 32 GiB |
| Q6_ROCMFPX_AGENT | Vulkan0 | 43,19 | 43,23 | 43,50 | 43,14 | 221 | 35 GiB |
| Q8_ROCMFPX_AGENT | ROCm0 | 41,67 | 41,64 | 41,65 | 41,70 | 337 | 36 GiB |
| Q8_ROCMFPX_AGENT | Vulkan0 | 46,17 | 46,28 | 46,27 | 45,98 | 231 | 35 GiB |
| Q8_ROCMFPX | ROCm0 | 42,28 | 42,28 | 42,27 | 42,31 | 331 | 35 GiB |
| Q8_ROCMFPX | Vulkan0 | 46,82 | 46,42 | 46,xx | no disponible | no disponible | no disponible |

El autor reporta además 0 generaciones truncadas en 48 pruebas tanto en Vulkan como en ROCm, frente a 8 de 48 del modelo hermano de 9B en Vulkan.

## Requisitos de hardware

- Hardware objetivo: AMD Ryzen AI Max+ 395 (Strix Halo) con iGPU Radeon 8060S (gfx1151) y 128 GB de memoria unificada.
- VRAM/GTT estimada: 18-21 GiB para los niveles de 4 bits, 32-36 GiB para los de 6 y 8 bits.
- GPU dedicadas: no se han publicado mediciones para A100, H100 o RTX 4090; el repositorio está orientado a iGPU AMD.
- En GPU de consumo: los archivos de 4 bits (17,4-18,5 GiB) podrían caber en tarjetas con 24 GB de VRAM, aunque no hay datos medidos.
- Despliegue: llama.cpp modificado (ROCmFPX) con `llama-server`; no funciona con builds estándar de llama.cpp, Ollama ni vLLM, porque los tipos ggml 100-119 no están en la tabla upstream.
- Compilación: requiere CMake con Unix Makefiles, `glslc` explícito para Vulkan, `-DAMDGPU_TARGETS=gfx1151` y `-j16` (con `-j32` se produjo OOM en una máquina de 128 GB).
- Throughput: 56-64 tok/s de decodificación en 4 bits; 40-47 tok/s en 6-8 bits; prefill de 199-426 tok/s según backend y nivel.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-Abliterated (este repo, ROCmFP4) | ~34,7 B totales (MoE) | 32.768 | Apache 2.0 | GGUF ROCmFP4/FPX, solo llama.cpp modificado | Optimizado para Strix Halo; 56-64 tok/s en 4 bits |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | ~34,7 B totales (MoE) | no disponible | no disponible | Pesos originales abliterated | Fuente de la abliteración; sin cuantización ROCmFP4 |
| PocketAiHub/Ornith-1.5-35B-A3B-Abliterated-GGUF | ~34,7 B totales (MoE) | no disponible | no disponible | GGUF BF16 | Fuente de la cuantización; compatible con llama.cpp estándar |
| ornith-ai/Ornith-1.5-35B-A3B | ~34,7 B totales (MoE) | no disponible | no disponible | Modelo base original | Con alineación de rechazo intacta |

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o sesgado sin filtros; no es adecuado para despliegues públicos sin moderación externa.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual en la información disponible.
- No funciona con llama.cpp estándar, Ollama, vLLM ni TGI: requiere el fork ROCmFPX con tipos ggml 100-119.
- Las mediciones están limitadas a un único hardware (Ryzen AI Max+ 395, gfx1151, ROCm 7.2.4, Ubuntu 24.04); el rendimiento en otras GPU no está caracterizado.
- El contexto medido es de 32.768 tokens; no se confirma si el modelo soporta ventanas mayores.
- Idiomas soportados no documentados; no hay garantía de calidad multilingüe.
- El repositorio ocupa 162,7 GB, lo que exige espacio de almacenamiento considerable aunque solo se descargue un archivo.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin censura recae en el desplegador.
- El autor advierte de trampas de compilación reales: falta de Ninja, `glslc` no detectado, CMakeCache obsoleto y OOM con `-j32`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Ornith-1.5-35B-A3B-Abliterated-ROCmFP4-GGUF
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Abliteración de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- GGUF BF16 de PocketAiHub: https://huggingface.co/PocketAiHub/Ornith-1.5-35B-A3B-Abliterated-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
