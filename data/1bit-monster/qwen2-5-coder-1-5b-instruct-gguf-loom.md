# 1bit-MONSTER/Qwen2.5-Coder-1.5B-Instruct-GGUF-loom

## Resumen

Este repositorio no contiene un modelo nuevo, sino una "Loom card" para el modelo Qwen2.5-Coder-1.5B-Instruct en formato GGUF. Se trata de un paquete de programas `.loom` y un fichero `model.json` que permite ejecutar los pesos originales de Qwen (cuantización `q4_k_m`) sobre la pila de software Loom de AMD, diseñada específicamente para acelerar la inferencia en las APU Ryzen AI Max+ 395 con arquitectura gráfica RDNA 3.5 (gfx1151, nombre en clave "Strix Halo"). El autor del empaquetado es el usuario 1bit-MONSTER, mientras que el modelo subyacente es obra de Alibaba Qwen.

El interés de esta ficha reside en el rendimiento medido sobre hardware AMD integrado: el autor reporta 172,13 tok/s de decodificación en `tg128`, 6.735 tok/s de prefill en `pp512` y un TTFT de 16,08 ms, superando a la ruta de referencia basada en llama.cpp-HRX en prefill y en decodificación con contexto largo (144,22 frente a 57,33 tok/s a 4k tokens). Los pesos no se distribuyen en este repositorio: `loom-fetch` los descarga del repositorio oficial de Qwen en la revisión fijada y verifica su sha256.

Es relevante ahora porque demuestra que modelos de código de 1,5B parámetros pueden servirse a velocidades interactivas en un SoC de consumo con memoria unificada, sin GPU dedicada, mediante kernels generados para RDNA 3/3.5. La licencia del empaquetado es Apache 2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-1.5B-Instruct); empaquetado como programas `.loom` para el runtime Loom de AMD |
| Parametros totales | 1,5 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | GGUF `q4_k_m` (unica incluida y verificada por sha256) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos remotos, no incluidos); empaquetado en `.loom` + `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1,5B parámetros desarrollado por Qwen (Alibaba) y afinado para instrucciones y generación de código. Los detalles de composición del dataset de entrenamiento, número de tokens y uso de RLHF/DPO no se especifican en la información proporcionada y corresponden a la model card original de Qwen, no a este repositorio.

La innovación de este paquete es de infraestructura, no de pesos: los programas `.loom` se derivan del script `port.sh` de loom-skills (MIT, commit `618f89e1`) y de la referencia `loom-fun/bartowski-Qwen2.5-1.5B-Instruct-loom@a78f4fd5`, y generan kernels específicos para RDNA 3/3.5 (gfx11). El runtime es `hrx-loom 0.2.0`, que se apoya en IREE HAL y en la librería `libhsa-runtime64.so.1` de ROCm. La ejecución está restringida a la APU AMD Ryzen AI Max+ 395 (gfx1151); los kernels no funcionan en RDNA 4 (gfx12, por ejemplo RX 9070 XT o R9700). El autor verifica la integridad de los pesos mediante sha256 (`cc324af0...bb046`) sobre la revisión `f86cb2c1` del repositorio upstream.

## Capacidades

- Generación de texto y código: hereda las capacidades del modelo Qwen2.5-Coder-1.5B-Instruct, orientado a completado y generación de código en múltiples lenguajes de programación.
- Razonamiento y matemáticas: capacidades básicas propias de un modelo de 1,5B parámetros; no se documentan modos de razonamiento extendido específicos en esta card.
- Modo "thinking": la card menciona comprobaciones de renderizado de prompt con `thinking_off` y `thinking_on` (40 tokens en ambos casos), lo que indica soporte de plantilla con modo de pensamiento, aunque no se detalla su comportamiento.
- Tool calling / function calling: no disponible en la información proporcionada para este empaquetado.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta card.
- Capacidades multilingües: no disponibles.
- Servicio compatible con API OpenAI: `loom-serve` expone un endpoint `/v1/chat/completions` con streaming del lado del cliente, lo que permite integrarlo con clientes compatibles con OpenAI.
- Verificación de integridad: descarga y comprobación sha256 de los pesos mediante `loom-fetch`.

## Casos de uso

- Asistente de código local en portátiles con Strix Halo: desplegar `loom-serve` con el preset `chat` y consumir el endpoint `/v1/chat/completions` desde un IDE o plugin, aprovechando los 172 tok/s de decodificación para autocompletado interactivo sin conexión a la nube.
- Autocompletado y generación en editor con contexto largo: los 144,22 tok/s de decodificación tras un prompt de 4k tokens permiten mantener conversaciones o ficheros extensos en contexto sin degradación severa del throughput, algo que la ruta llama.cpp-HRX de referencia no sostiene (57,33 tok/s en la misma prueba).
- Servicio de inferencia en un appliance "1bit OS": el paquete está pensado para ejecutarse sobre la imagen de sistema 1bit con `--loom-routes`, de modo que se puede integrar como backend de código en un equipo de desarrollo todo-en-uno.
- Evaluación comparativa de runtimes en AMD: usar la card como referencia reproducible (comandos, versiones y método documentados) para medir prefill, decodificación y TTFT de Loom frente a llama.cpp en la misma APU.
- Prototipado de pipelines de CI con verificación de pesos: `loom-fetch` descarga y valida el sha256 del GGUF, lo que permite fijar la revisión exacta del modelo en entornos de integración continua y garantizar reproducibilidad.
- Docencia e investigación en inferencia sobre memoria unificada: el modelo de 1,5B en q4_k_m es lo bastante pequeño para experimentar con kernels generados, reparto de memoria (`--pool_backing=fixed`) y ajuste de `completion_spin_ns` sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

Mediciones del autor sobre AMD Ryzen AI Max+ 395 (gfx1151), imagen 1bit OS, cliente con streaming sobre `/v1/chat/completions`, 4 rondas intercaladas:

| Arm | TTFT ms | pp512 tok/s | tg128 tok/s | tg @4k tok/s |
|---|---|---|---|---|
| Esta card (loom-serve) | 16,08 (15,1-18,5) | 6.735,08 (6.593,6-6.905,1) | 172,13 (161,5-181,9) | 144,22 (134,6-151,8) |
| Ruta llama.cpp-HRX (referencia) | 37,73 (20,0-112,4) | 4.997,22 (1.541,7-6.478,6) | 174,78 (164,2-175,8) | 57,33 (49,6-67,8) |

Fila de velocidad del gate (engine#3158, 4 rondas intercaladas, un servidor a la vez):

| Prompt | Metrica | llama.cpp | Loom raw | Loom via `1bit serve` |
|---|---|---|---|---|
| short | prefill tok/s | 908,7 [859,2-920,3] | 3.430,4 [2.998,3-3.517,4] | 3.219,4 [2.965,6-3.275,4] |
| short | decode tok/s (256) | 63,5 [48,6-199,6] | 166,4 [155,4-176,5] | 166,9 [157,7-171,1] |
| long2k | prefill tok/s | 5.268,6 [4.730,7-5.360,5] | 7.717,1 [7.506,8-7.900,7] | 7.828,5 [7.641,8-8.201,0] |
| long2k | decode tok/s (256) | 150,6 [139,7-171,0] | 150,1 [141,4-156,7] | 149,8 [140,7-156,2] |

Precisión: en el gate engine#3158 (greedy, thinking off, 64 tokens x 8 prompts, comparado con una ejecución árbitro en CPU en otra máquina), esta card obtiene un 87,5 % de coincidencia, igual que la ruta de referencia (87,5 %). Se registra una divergencia en un casi-empate de 0,064 nats (Loom devuelve la segunda opción de la CPU) y ninguna respuesta vacía. El renderizado de prompt coincide en 26/26 casos con thinking off y on. No se mide KLD en la rama Loom porque no devuelve logprobs.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: exclusivamente AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No funciona en RDNA 4 (gfx12, RX 9070 XT, R9700) ni, según la card, en otras GPU.
- VRAM: no disponible como cifra explícita; al ser una APU con memoria unificada y pesos q4_k_m de ~1 GB, el modelo cabe holgadamente en la memoria del sistema compartida.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por estos kernels.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar los pesos y `loom-serve` con `--preset=chat`, `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload` y `--heartbeat_ms=0`.
- Entorno: requiere ROCm con `libhsa-runtime64.so.1` accesible vía `IREE_HAL_AMDGPU_LIBHSA_PATH`.
- Latencia y throughput medidos: TTFT de 16,08 ms, 6.735 tok/s de prefill en pp512, 172,13 tok/s en tg128 y 144,22 tok/s a 4k de contexto (ver tabla de benchmarks).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Esta card (Qwen2.5-Coder-1.5B-Instruct-GGUF-loom) | 1,5B | no disponible | GGUF q4_k_m + `.loom` sobre hrx-loom 0.2.0 | Apache 2.0 | Solo Strix Halo (gfx1151); 172 tok/s tg128 medidos |
| loom-fun/bartowski-Qwen2.5-1.5B-Instruct-loom | 1,5B | no disponible | `.loom` sobre Loom | no disponible | Referencia de la que deriva este port |
| Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF (upstream) | 1,5B | no disponible | GGUF para llama.cpp y derivados | Apache 2.0 | Pesos originales; sin kernels Loom |
| Ruta llama.cpp-HRX (referencia medida en la card) | 1,5B | no disponible | GGUF sobre llama.cpp con HRX | Apache 2.0 (modelo) | 174,78 tok/s tg128, pero 57,33 tok/s a 4k |

## Limitaciones y advertencias

- Restricción de hardware severa: los kernels generados apuntan a RDNA 3/3.5 (gfx11) y solo se han validado en Ryzen AI Max+ 395 (gfx1151); no ejecutan en RDNA 4 ni en GPU NVIDIA.
- Los pesos no están en el repositorio: sin `loom-fetch` o una descarga manual del repositorio upstream no hay modelo que servir.
- Modelo pequeño: con 1,5B parámetros, la calidad en razonamiento complejo, matemáticas avanzadas y código de gran escala es limitada frente a modelos de 7B o superiores; riesgo de alucinación en APIs y librerías poco comunes.
- Sin datos de sesgos ni de evaluación de seguridad en la información proporcionada.
- Idiomas soportados no documentados en esta card; conviene consultar la model card original de Qwen antes de desplegar en producción multilingüe.
- La rama Loom no devuelve logprobs, lo que impide calcular KLD y limita la monitorización fina de la calidad en producción.
- Las cifras de rendimiento provienen de un único equipo y de un conjunto reducido de prompts (8 prompts de 64 tokens en el gate de precisión); no deben extrapolarse sin réplica.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse también la licencia de los componentes de Loom (LICENSE-programs.md) y de loom-skills (MIT).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Qwen2.5-Coder-1.5B-Instruct-GGUF-loom
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF
- Repositorio Loom de AMD (ROCm): https://github.com/ROCm/hrx-system
- Referencia loom-fun: https://huggingface.co/loom-fun (card `loom-fun/bartowski-Qwen2.5-1.5B-Instruct-loom@a78f4fd5`)
- Artículo de búsqueda web (no relacionado con el modelo): https://roboticcoding.com/robotics-programming-for-beginners/
