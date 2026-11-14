# loom-fun-staging/ggml-org-Qwen3.6-35B-A3B-loom

## Resumen

Este repositorio no contiene un modelo nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `Qwen3.6-35B-A3B-Q4_K_M.gguf` publicado por `ggml-org`. El paquete lo genera el flujo de trabajo `loom-skills` y lo publica la cuenta `loom-fun-staging`, orientado a dos aceleradores AMD concretos: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es un Qwen3.6 de 35 000 millones de parámetros totales con arquitectura mixture-of-experts (MoE) y 3 000 millones de parámetros activos, con capacidad de entrada de imagen (pipeline `image-text-to-text`).

La relevancia de este artefacto es operativa: permite servir el GGUF sin modificarlo mediante `loom-serve`, con API compatible con OpenAI (`/v1/chat/completions`), tool calling, modo de razonamiento activado por defecto, decodificación especulativa DFlash de profundidad 3 y una ventana de contexto de 262 144 tokens por petición. La model card incluye objetivos de roofline para Strix Halo (216 GB/s de ancho de banda y 59 TFLOP/s), pero las celdas de rendimiento medido de Loom y llama.cpp aparecen como "no medido" en la información disponible.

Conviene subrayar que el repositorio tiene 0 descargas y 0 likes, que la licencia y los idiomas figuran como "no disponible" y que las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`) no se han vuelto a ejecutar sobre este paquete: la última pasada corresponde a una compilación anterior con sha256 `b7cbf7b`. Los resultados de búsqueda web recuperados corresponden a productos homónimos sin relación (Loom Inc. y la marca textil Loom), por lo que no aportan datos técnicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (el modelo base es un MoE según el nombre `35B-A3B`; la familia Qwen3.6 no se detalla en la model card) |
| Parametros totales | 35 000 millones (según el identificador `35B`) |
| Parametros activos | 3 000 millones (según el identificador `A3B`) |
| Longitud de contexto | 262 144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); el proyector multimodal se distribuye en BF16 (`mmproj-Qwen3.6-35B-A3B-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Qwen3.6-35B-A3B-Q4_K_M.gguf`) más paquete Loom (`model.json` y programas `.loom`) |
| Modelo base | `ggml-org/Qwen3.6-35B-A3B-GGUF` |
| Proyector multimodal | `mmproj-Qwen3.6-35B-A3B-BF16.gguf` |
| Drafter de decodificacion especulativa | `magnitudedev/Qwen3.6-35B-A3B-DFlash-GGUF`, profundidad 3 |
| Tokens maximos de salida | 4 096 (mediante el preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Interfaz | API estilo OpenAI en `127.0.0.1:8080` (`/v1/chat/completions`) |
| Herramienta de despliegue | `hrx-loom[hf]==0.1.0`, comandos `loom-fetch` y `loom-serve` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-14 |

## Arquitectura y entrenamiento

La model card del paquete no describe la arquitectura interna, los datos de entrenamiento, el número de tokens vistos ni si hubo RLHF o DPO; esa información correspondería al checkpoint original `ggml-org/Qwen3.6-35B-A3B-GGUF`, que no se incluye en la documentación disponible. Lo que sí se deduce del identificador y de la metodología de roofline es que se trata de un modelo mixture-of-experts: la model card afirma explícitamente que el techo de rendimiento con 4 streams "asume que los cuatro streams se enrutan a los mismos expertos", lo que confirma el enrutado por expertos como mecanismo central. Los 35 000 millones de parámetros totales frente a 3 000 millones activos implican que solo una fracción de la red se computa por token, lo que explica que un GGUF Q4_K_M pueda servirse en un Radeon AI PRO R9700 de 32 GB con un presupuesto de memoria declarado de 34 000 000 000 bytes, o en Strix Halo con 48 000 000 000 bytes.

La innovación técnica destacable de este paquete no está en el entrenamiento sino en la pila de inferencia: decodificación especulativa DFlash con profundidad 3 activada por defecto, usando el drafter `magnitudedev/Qwen3.6-35B-A3B-DFlash-GGUF`, y kernels generados para las arquitecturas gfx1151 y gfx1201 servidos mediante `loom-serve` con espera activa (`completion_spin_ns=4294967295`). La model card documenta una metodología de comparación contra llama.cpp ROCm con prompts idénticos, mismo runner DevLab y mismo GGUF, pero con decisiones distintas de drafting entre motores (Loom con DFlash profundidad 3; llama.cpp sin drafting en las filas de un stream), lo que impide una comparación limpia de velocidades aunque las filas estén definidas. Las tasas de aceptación del drafter medidas en sesión propia son del 48 % en decodificación con contexto corto, 40 % con contexto de ~2k tokens y 43 % con contexto de ~32k tokens.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI, con campos `tools` y `tool_calls` en la API.
- Entrada de imagen mediante partes `image_url` estilo OpenAI, procesadas por el proyector `mmproj-Qwen3.6-35B-A3B-BF16.gguf`; el pipeline declarado es `image-text-to-text`.
- Decodificación especulativa DFlash de profundidad 3 activada por defecto, con drafter dedicado.
- Muestreo configurable con `temperature`, `top_p`, `top_k` y `seed`.
- Contexto largo de hasta 262 144 tokens por petición.
- Concurrencia de 4 peticiones simultáneas.
- Límite de 4 096 tokens de salida por petición mediante el preset `max_tokens`.
- No se declara soporte de audio ni de salida de audio ("not applicable").
- No se declara ajuste de esfuerzo de razonamiento ("reasoning effort": not applicable).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el servidor expone `/v1/chat/completions` con hasta 262 144 tokens de contexto por petición, lo que permite arrastrar historiales multi-turno largos y documentación de producto sin truncar; el tool calling estilo OpenAI habilita consultas a sistemas internos de pedidos o CRM dentro de la misma conversación.
- Asistente de código en estación de trabajo local: al ser un MoE con 3 000 millones de parámetros activos y cuantización Q4_K_M, cabe en un Radeon AI PRO R9700 de 32 GB con presupuesto de 34 GB declarado, y puede integrarse en editores o pipelines de CI/CD mediante el endpoint compatible con OpenAI para revisión de diffs y generación de parches.
- Procesamiento de documentos técnicos con imágenes: la entrada `image_url` junto con el proyector BF16 permite extraer información de capturas, gráficos y tablas escaneadas y razonar sobre ellas en el mismo contexto que el texto del documento, útil para auditoría de informes o extracción de datos de facturas.
- Agentes multi-paso con herramientas: el modo thinking por defecto más tool calling permite cadenas de razonamiento-planificación-acción con llamadas a APIs externas, con un límite de 4 096 tokens de salida que acota la longitud de cada paso.
- Despliegue en hardware AMD consumer/workstation sin CUDA: los comandos documentados (`loom-serve --model=... --device=amdgpu://...`) permiten servir el modelo en Strix Halo (gfx1151) con 48 GB de presupuesto de memoria o en R9700 (gfx1201) con 34 GB, sin depender de llama.cpp ni de CUDA.
- Evaluación comparativa de motores de inferencia: la model card define filas reproducibles (decode, decode_2k, decode_32k, prefill_1k a prefill_32k, streams4) contra llama.cpp ROCm con el mismo GGUF y los mismos prompts, lo que sirve como banco de pruebas para medir el efecto de DFlash y de los kernels generados.
- Procesamiento por lotes con concurrencia moderada: 4 peticiones simultáneas y contexto largo encajan en tareas de resumen o clasificación de documentos por equipos pequeños, donde no se requiere alta concurrencia pero sí ventanas de contexto amplias.

## Benchmarks y rendimiento

La model card proporciona únicamente objetivos de roofline para Strix Halo (gfx1151), calculados con `loom-roofline` (`roofline.py`, loom-skills `acd9ac7`) asumiendo 216 GB/s de ancho de banda y 59 TFLOP/s. Las columnas de rendimiento medido de Loom y llama.cpp están marcadas como "no medido" en la información disponible.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 122,5 |
| Decode tok/s, contexto 2k | no medido | no medido | 109,8 |
| Decode tok/s, contexto 32k | no medido | no medido | 99,8 |
| Prefill tok/s, documento 1k | no medido | no medido | 11 902,0 |
| Prefill tok/s, documento 2k | no medido | no medido | 11 708,5 |
| Prefill tok/s, documento 8k | no medido | no medido | 10 668,0 |
| Prefill tok/s, documento 16k | no medido | no medido | 9 537,8 |
| Prefill tok/s, documento 32k | no medido | no medido | 7 870,2 |
| 4 streams, decode agregado tok/s | no medido | no medido | 315,1 |
| Tokens draftados aceptados | no aplica | no aplica | no aplica |

| Metrica (Radeon AI PRO R9700, gfx1201, 32 GB) | Resultado |
|---|---|
| Cualquier metrica de rendimiento | no disponible ("not yet re-measured") |

Tasas de aceptación del drafter DFlash (profundidad 3) usadas en el cálculo del roofline: 48 % en decode corto, 40 % en decode a ~2k tokens, 43 % en decode a ~32k tokens. El roofline de 4 streams se calcula sin drafting y asume que los cuatro streams se enrutan a los mismos expertos. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el paquete documenta un presupuesto de memoria de 48 000 000 000 bytes para Strix Halo y de 34 000 000 000 bytes para Radeon AI PRO R9700 (32 GB). El GGUF es Q4_K_M de un modelo de 35 000 millones de parámetros; el peso exacto del fichero no se indica en la información disponible.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090) o Apple Silicon: no se documentan en este paquete; los kernels generados están orientados a las arquitecturas AMD indicadas.
- ¿Cabe en GPU consumer? El paquete apunta a iGPU/workstation AMD con memoria unificada o 32 GB de VRAM; no se confirma compatibilidad con GPUs consumer NVIDIA.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch ... --materialize=copy` y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295`. El servidor escucha en `127.0.0.1:8080` y responde a `/v1/chat/completions`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete (llama.cpp aparece solo como referencia de comparación).
- Latencia y throughput: no medidos en la información disponible; solo se publican los techos de roofline recogidos en la sección anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (`loom-fun-staging/ggml-org-Qwen3.6-35B-A3B-loom`) | 35B totales / 3B activos | 262 144 tokens por petición | Solo roofline publicado; medido "no medido" | no disponible | 0 descargas, 0 likes; paquete Loom para AMD gfx1151 y gfx1201 |
| `ggml-org/Qwen3.6-35B-A3B-GGUF` (modelo base) | 35B totales / 3B activos | no disponible en la información proporcionada | no disponible | no disponible | Checkpoint GGUF original, sin modificar |
| `magnitudedev/Qwen3.6-35B-A3B-DFlash-GGUF` (drafter) | no disponible | no disponible | Tasa de aceptación 40-48 % según contexto | no disponible | Usado como drafter de decodificación especulativa |
| llama.cpp ROCm (motor de referencia) | no aplica (motor) | no disponible | Filas comparables definidas, valores "no medido" | no disponible | Motor de inferencia usado como referencia en la model card |

No se dispone de datos de benchmarks de calidad ni de alternativas de la misma categoría con cifras comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia figura como "no disponible": no se puede confirmar si el uso comercial está permitido. Verificar la licencia del checkpoint base `ggml-org/Qwen3.6-35B-A3B-GGUF` antes de cualquier despliegue en producción.
- Los idiomas soportados no están declarados; no se puede garantizar calidad fuera del inglés o de los idiomas que cubra el modelo base.
- Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`) no se han vuelto a ejecutar sobre este paquete: la última pasada corresponde a la compilación con sha256 `b7cbf7b`. La corrección de los kernels generados y la equivalencia con llama.cpp no están verificadas para esta compilación.
- Los resultados de rendimiento medidos están ausentes ("no medido"); solo existen techos de roofline teóricos. No hay datos de latencia ni de throughput reales para planificar capacidad.
- Los resultados para Radeon AI PRO R9700 no se han vuelto a medir ("not yet re-measured").
- La comparación con llama.cpp no es limpia: Loom usa DFlash profundidad 3 y llama.cpp no usa drafting en las filas de un stream, además de que los argumentos del servidor llama.cpp no se registraron y los runners DevLab difieren entre sesiones.
- El roofline de 4 streams asume que los cuatro streams se enrutan a los mismos expertos, una cota superior que una ejecución real puede no alcanzar.
- Límite de 4 096 tokens de salida por petición mediante el preset `max_tokens`: insuficiente para generaciones largas sin ajustar la configuración.
- Concurrencia limitada a 4 peticiones simultáneas; no apto para cargas de alta concurrencia sin escalar horizontalmente.
- Sin soporte de audio ni de ajuste de esfuerzo de razonamiento.
- Riesgo de alucinación: no evaluado en la información disponible; no hay resultados de benchmarks de calidad que permitan acotarlo.
- Sesgos: no documentados en la información disponible.
- El paquete está publicado por una cuenta de staging (`loom-fun-staging`) con 0 descargas y creado y actualizado el mismo día; tratarlo como artefacto experimental.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun-staging/ggml-org-Qwen3.6-35B-A3B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3.6-35B-A3B-GGUF
- Drafter de decodificación especulativa: https://huggingface.co/magnitudedev/Qwen3.6-35B-A3B-DFlash-GGUF
- Repositorio Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Resultados de búsqueda web recuperados: corresponden a productos homónimos sin relación técnica (https://www.loom.com/, https://www.loom.fr/); no se utilizan como fuente de datos del modelo.
