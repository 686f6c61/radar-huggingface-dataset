# kingjones777/Agnes-3.0-Flash-Preview-MTP-ROCmFP4-GGUF

## Resumen

Agnes-3.0-Flash-Preview-MTP-ROCmFP4-GGUF es un repositorio de cuantizaciones GGUF del checkpoint Preview de Agnes-3.0-Flash, un modelo multimodal (texto e imagen) de 33B denso desarrollado por Agnes AI. El autor de la cuantizacion es el usuario kingjones777, que publica builds especificamente optimizadas y medidas sobre hardware AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S, `gfx1151`) bajo ROCm 7.2.4. Segun la model card, se trata de la primera build ROCmFP4 de este modelo: una busqueda en el Hub el 2026-09-16 no encontro ninguna otra build ROCm o Strix Halo de Agnes entre 21 repositorios revisados.

El modelo base usa una arquitectura hibrida de atencion con regla delta con compuerta (gated delta rule) combinada con atencion global, con 32.661.228.864 parametros y una ventana de contexto de 262.144 tokens. La contribucion tecnica principal de esta build es la integracion de la cabeza MTP (multi-token prediction) dentro de cada archivo GGUF, lo que habilita decodificacion especulativa mediante `--spec-type draft-mtp` y anade solo entre 258 y 270 MiB a un archivo de 4 bits, frente a los 1,91 GiB del archivo de cabeza separado al que sustituye. El proyector de vision esta incluido, por lo que los pesos cubren la modalidad image-text-to-text.

Su relevancia ahora es doble: por un lado, ofrece un punto de entrada practico para ejecutar un modelo de 33B con contexto largo en GPUs integradas de AMD con memoria unificada, un segmento historicamente mal cubierto por el ecosistema CUDA; por otro, documenta de forma exhaustiva la degradacion de calidad de cada nivel de cuantizacion mediante divergencia KL frente a BF16, con metodologia reproducible. Es importante senalar que se trata del checkpoint Preview y que Agnes AI declara que su modelo de produccion/API (1M de contexto) es un checkpoint distinto cuyos benchmarks publicados no aplican a estos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion global combinada con gated delta rule; MLP de tipo `qwen35` (familia Qwen3.5), con la rama FFN paralela plegada de forma exacta en un MLP estandar |
| Parametros totales | 32.661.228.864 (~32,66 B; el autor lo describe como 33B denso) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | 262.144 tokens (checkpoint Preview); el modelo de produccion/API de Agnes AI usa 1M de contexto, pero es otro checkpoint |
| Tipos de cuantizacion | Q4_0-ROCmFP4 (tiers STRIX_LEAN y COHERENT) y Q8_0-ROCmFPX (tiers AGENT y estandar); cuantizacion de 4 y 8 bits con esquema ROCmFP4/ROCmFPX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modalidades | Texto e imagen (pipeline `image-text-to-text`); proyector de vision incluido |
| Cabezal de decodificacion especulativa | MTP (multi-token prediction) embebido en cada archivo GGUF |
| Fecha de publicacion | 2026-09-16 (creacion); 2026-09-17 (ultima actualizacion) |
| Tamano del repositorio | 106,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida que combina atencion global con capas de regla delta con compuerta, un esquema que se aparta del transformer de atencion completa en todas las capas y que esta asociado a la familia Qwen3.5 segun las etiquetas del repositorio. El autor indica que la rama FFN paralela del checkpoint original se plegó de forma exacta dentro de un MLP `qwen35` estandar, de modo que no se necesita ningun parche especifico de Agnes para cargar los pesos: el grafo resultante es el que llama.cpp ya soporta. Cada archivo de este repositorio incorpora ademas una cabeza MTP que permite decodificacion especulativa con verificacion por defecto (no estricta) mediante `--spec-type draft-mtp` y `--spec-draft-n-max 4`. El autor senala que el prompt caching funciona con MTP activado siempre que se aplique un parche menor a `llama-server` incluido en `recipe/patches/`; sin ese parche, una build de esta linea ROCmFPX no reutiliza nada mientras la cabeza esta cargada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se documentan en esta model card detalles sobre el entrenamiento multimodal, la resolucion de imagen soportada o la estrategia de alineacion. Toda la informacion tecnica publicada en el repositorio se centra en el proceso de cuantizacion y en su evaluacion: los tiers de 4 bits tienen builds con matriz de importancia (imatrix) publicadas en un repositorio aparte, y la calidad se mide contra un GGUF BF16 de referencia sobre wikitext-2 *test* (held-out, `-c 2048`, 40 fragmentos de 1.023 tokens puntuados cada uno, 40.920 tokens en total), nunca sobre el texto de calibracion de la imatrix. La metrica principal es la divergencia KL por token de la distribucion siguiente-token respecto a BF16, mucho mas sensible que la perplejidad.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de contexto largo de hasta 262.144 tokens.
- Razonamiento (etiqueta `reasoning` en el repositorio), orientado a tareas que requieren cadenas de pensamiento.
- Capacidades multimodales de entrada: el pipeline declarado es `image-text-to-text` y el proyector de vision esta incluido en los archivos publicados.
- Decodificacion especulativa integrada mediante cabeza MTP embebida, activable con `--spec-type draft-mtp`.
- Soporte de prompt caching en `llama-server`, condicionado a la aplicacion del parche incluido en `recipe/patches/`.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite exponerlo como servidor compatible con API de chat.
- Cuantizaciones orientadas a agentes: el tier Q8_0-ROCmFPX-AGENT presenta el KLD mas bajo de la familia de 8 bits, segun el autor.
- Capacidades multilingues: no disponible (no se documentan idiomas soportados).
- Tool calling / function calling: no disponible (no se menciona explicitamente en la informacion proporcionada).
- Soporte de audio o video: no disponible.

## Casos de uso

- Asistente conversacional de contexto largo en hardware AMD: el modelo admite 262.144 tokens de contexto y esta cuantizado especificamente para `gfx1151`, por lo que puede mantener conversaciones o analisis de documentos extensos en una Ryzen AI Max+ 395 sin depender de GPUs discretas NVIDIA.
- Analisis de documentos con imagenes: al incluir proyector de vision y pipeline `image-text-to-text`, permite extraer y razonar sobre informacion de capturas, diagramas o documentos escaneados combinados con texto.
- Agentes locales con decodificacion especulativa: el tier Q8_0-ROCmFPX-AGENT, con KLD de 0,0074 frente a BF16 y 96,73% de coincidencia en top-1, es el candidato logico para flujos de agente donde la fidelidad de la distribucion importa mas que la velocidad de generacion (16,97 tok/s en ROCm).
- Despliegue en servidor compatible con API: la etiqueta `endpoints_compatible` junto con `llama-server` permite montar un endpoint de chat local para integrarlo en herramientas internas sin enviar datos a terceros.
- Investigacion sobre cuantizacion en ROCm: el repositorio publica KLD, coincidencia top-1 y perplejidad de cada tier, lo que lo convierte en un banco de pruebas util para estudiar el compromiso tamano/calidad en GPUs AMD integradas.
- Prototipado rapido con presupuesto de memoria ajustado: el tier Q4_0-ROCmFP4-STRIX_LEAN ocupa 16,82 GiB en disco y decodifica a 26,64 tok/s con MTP en ROCm y 27,31 tok/s en Vulkan, lo que permite iterar sobre prompts en una maquina de 24 GB.
- Generacion de codigo y matematicas asistida: el modelo base esta etiquetado como `reasoning` y `qwen3.5`, pero no se han publicado evaluaciones especificas de HumanEval, MBPP o GSM8K en la informacion disponible, por lo que el uso en produccion de codigo exigiria validacion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas equivalentes, y advierte explicitamente que los resultados publicados para el modelo de produccion/API de Agnes AI no aplican a estos pesos. Las unicas mediciones publicadas son de calidad de cuantizacion y velocidad, con la siguiente metodologia: Ryzen AI Max+ 395 (MAX-1), ROCm 7.2.4, `llama-server` parcheado, `-c 65536`, batch 1, greedy (`temp 0`, `top_k 1`), `ignore_eos` para generar exactamente 256 tokens tras un prompt de ~7,1K tokens, nonce unico por peticion y `cache_prompt: false` con `cache_n = 0` verificado en cada peticion cronometrada; un calentamiento y mediana de 3 ejecuciones.

| Archivo | ftype | Tamano | BPW | KLD vs BF16 (menor mejor) | Misma top-1 (mayor mejor) | PPL (x BF16) | Decodificacion MTP ROCm0 (tok/s) | Decodificacion MTP Vulkan0 (tok/s) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `...MTP-Q4_0-ROCmFP4-STRIX_LEAN.gguf` | 106 | 16,82 GiB | 4,42 | 0,0438 ± 0,0010 | 91,29% | 6,4877 ± 0,0792 (x1,0250) | 26,64 | 27,31 |
| `...MTP-Q4_0-ROCmFP4-COHERENT.gguf` | 102 | 17,77 GiB | 4,67 | 0,0385 ± 0,0009 | 91,39% | 6,4290 ± 0,0780 (x1,0157) | 24,76 | 23,51 |
| `...MTP-Q8_0-ROCmFPX-AGENT.gguf` | 115 | 31,91 GiB | 8,39 | 0,0074 ± 0,0007 | 96,73% | 6,3014 ± 0,0758 (x0,9955) | 16,97 | 14,97 |
| `...MTP-Q8_0-ROCmFPX.gguf` | 111 | 31,46 GiB | 8,27 | 0,0108 ± 0,0008 | 96,04% | 6,3176 ± 0,0761 (x0,9981) | 16,42 | 16,17 |
| *Referencia BF16* | 32 | 60,85 GiB | 16 | 0 | 100% | 6,3296 ± 0,0762 | no medido | no medido |

Datos adicionales publicados por el autor:

- Prefill: STRIX_LEAN alcanza 261,3 tok/s en ROCm0 frente a 231,8 tok/s de COHERENT, una diferencia del 13%.
- El autor trata como empate cualquier diferencia de decodificacion inferior al 8,3%, porque la aceptacion del borrador varia con el prompt; las diferencias de prefill por encima del 3,0% se consideran reales.
- Los tiers de 8 bits quedan por debajo de BF16 en perplejidad (x0,9955 y x0,9981), pero el autor lo atribuye a ruido de la metrica y no a una mejora real, ya que su KLD sigue siendo distinto de cero.
- La build imatrix de STRIX_LEAN iguala a COHERENT de este repositorio dentro del ruido (KLD 0,0387 frente a 0,0385, 0,2σ) con el tamano de STRIX_LEAN (26,31 tok/s en ROCm0); la build imatrix de COHERENT es el archivo de 4 bits con menor KLD de la familia (0,0322, 23,30 tok/s).

## Requisitos de hardware

- VRAM para los pesos: 16,82 GiB (Q4_0 STRIX_LEAN), 17,77 GiB (Q4_0 COHERENT), 31,46 GiB (Q8_0 ROCmFPX), 31,91 GiB (Q8_0 ROCmFPX-AGENT) y 60,85 GiB (BF16 de referencia). Hay que anadir el cache KV, las activaciones y el proyector de vision, cuyo consumo no se detalla en la informacion disponible.
- Hardware de referencia medido: AMD Ryzen AI Max+ 395 (Radeon 8060S, `gfx1151`) con ROCm 7.2.4, ejecutando `-c 65536` y batch 1. Es una plataforma de memoria unificada, no una GPU discreta.
- GPU de consumo: los tiers de 4 bits caben en GPUs de 24 GB (RTX 3090, RTX 4090, RX 7900 XTX) dejando margen limitado para cache KV segun la longitud de contexto; los tiers de 8 bits (31,5-31,9 GiB) no caben en 24 GB y requieren 48 GB o memoria unificada.
- GPU profesionales: los tiers de 8 bits encajan en tarjetas de 48 GB o mas (A6000, L40S, A100 80 GB). No se han publicado mediciones de este repositorio en CUDA ni en GPUs NVIDIA, por lo que el rendimiento en esas plataformas es no disponible.
- Retrocesos de ejecucion: llama.cpp mediante `llama-server`. El autor ha medido dos backends, ROCm (ROCm 7.2.4) y Vulkan, y no se han validado CUDA, Metal ni otras opciones en esta build. Para prompt caching con MTP activo se requiere el parche de `recipe/patches/`.
- Throughput medido con MTP activo (256 tokens generados tras un prompt de ~7,1K tokens): 26,64-27,31 tok/s para Q4_0 STRIX_LEAN, 23,51-24,76 tok/s para Q4_0 COHERENT y 14,97-16,97 tok/s para los tiers de 8 bits. Prefill de 261,3 tok/s (STRIX_LEAN, ROCm0). Latencia por token no publicada de forma explicita, pero derivable de esas cifras en el rango de 37-67 ms por token en decodificacion.
- Nota sobre el desglose de memoria: el autor senala que la cabeza MTP embebida anade 258-270 MiB a un archivo de 4 bits, sustituyendo a un archivo de cabeza separado de 1,91 GiB.
- Almacenamiento: el repositorio completo ocupa 106,1 GB, por lo que conviene descargar unicamente el archivo del tier elegido.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada; la busqueda web realizada no devolvio resultados tecnicos relevantes. La unica comparacion con datos verificables es interna entre los tiers de este mismo repositorio y su referencia BF16:

| Version | Parametros | Contexto | KLD vs BF16 | Decodificacion MTP (tok/s) | Tamano | Licencia |
|---|---|---|---|---|---|---|
| Q4_0-ROCmFP4-STRIX_LEAN | 32,66 B | 262.144 | 0,0438 | 26,64 (ROCm0) / 27,31 (Vulkan0) | 16,82 GiB | Apache 2.0 |
| Q4_0-ROCmFP4-COHERENT | 32,66 B | 262.144 | 0,0385 | 24,76 (ROCm0) / 23,51 (Vulkan0) | 17,77 GiB | Apache 2.0 |
| Q8_0-ROCmFPX-AGENT | 32,66 B | 262.144 | 0,0074 | 16,97 (ROCm0) / 14,97 (Vulkan0) | 31,91 GiB | Apache 2.0 |
| Q8_0-ROCmFPX | 32,66 B | 262.144 | 0,0108 | 16,42 (ROCm0) / 16,17 (Vulkan0) | 31,46 GiB | Apache 2.0 |
| BF16 (referencia) | 32,66 B | 262.144 | 0 | no medido | 60,85 GiB | Apache 2.0 |

## Limitaciones y advertencias

- Checkpoint Preview: Agnes AI declara que su modelo de produccion/API (1M de contexto) es un checkpoint diferente y que los resultados de benchmarks publicados para ese modelo no aplican a estos pesos. Cualquier evaluacion debe hacerse sobre estos archivos.
- Rendimiento no verificado fuera de AMD Strix Halo: todas las mediciones publicadas corresponden a un Ryzen AI Max+ 395 con ROCm 7.2.4 y al backend Vulkan. El autor no ha publicado datos de CUDA ni de GPUs NVIDIA para esta build.
- Dependencia de un parche: el prompt caching con MTP activado requiere aplicar el parche de `recipe/patches/` a `llama-server`. Sin el, una build de esta linea no reutiliza cache mientras la cabeza especulativa esta cargada.
- Degradacion de calidad no nula: incluso los tiers de 8 bits presentan KLD distinto de cero frente a BF16 y una coincidencia top-1 del 96,04-96,73%, no del 100%. En los tiers de 4 bits, la coincidencia top-1 baja al 91,29-91,39%.
- Metrica de calidad acotada: la evaluacion se limita a wikitext-2 *test* con ventanas de 2.048 tokens. No cubre razonamiento, codigo, matemáticas ni multimodalidad, por lo que la degradacion en esas tareas es no disponible.
- Idiomas soportados no documentados: no hay lista de idiomas ni evaluacion multilingue, lo que impide garantizar un comportamiento adecuado fuera del ingles o del chino.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se aplica el riesgo habitual de los modelos generativos, agravado por la falta de benchmarks de fidelidad.
- Trazabilidad limitada del repositorio: 0 descargas y 0 likes en el momento de la consulta, y fecha de publicacion posterior a la fecha de referencia habitual, lo que reduce la validacion por parte de terceros.
- Licencia: Apache 2.0, sin restricciones adicionales declaradas para uso comercial en la informacion disponible; conviene verificar la licencia del modelo base Agnes-AI/Agnes-3.0-Flash de forma independiente.
- Consumo de almacenamiento: 106,1 GB de repositorio completo, con archivos individuales de hasta 31,91 GiB.

## Enlaces

- Repositorio de cuantizaciones ROCmFP4: https://huggingface.co/kingjones777/Agnes-3.0-Flash-Preview-MTP-ROCmFP4-GGUF
- Build con matriz de importancia (imatrix): https://huggingface.co/kingjones777/Agnes-3.0-Flash-Preview-MTP-ROCmFP4-imatrix-GGUF
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- La busqueda web realizada no devolvio papers, blogs, repositorios ni demos relevantes sobre este modelo; el resto de resultados no guardaban relacion con la ficha y se han descartado.
