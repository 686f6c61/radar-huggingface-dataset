# PhantomLatticeLabs/Mistral-7B-Instruct-v0.3-GSD-LQ

## Resumen

Mistral-7B-Instruct-v0.3-GSD-LQ es una distribucion cuantizada del modelo Mistral-7B-Instruct-v0.3 de Mistral AI, empaquetada por Phantom Lattice Labs mediante su tecnica propietaria GSD-LQ v2.0 (Geometric Subspace Decomposition & Root-Lattice Quantization). El modelo base es un transformer decoder-only de 7.000 millones de parametros con ventana de contexto de 32.768 tokens, orientado a generacion de texto e instrucciones. La aportacion del autor no es un modelo nuevo, sino un formato de compresion de pesos que empaqueta los pesos del Mistral original en binarios nativos OpenCL con footprints efectivos de 3,37 GB (Precision Mode, 3,76 bpw) y 3,79 GB (Turbo Mode, 4,26 bpw).

La propuesta tecnica de GSD-LQ es una cuantizacion sin calibracion que, segun el autor, preserva mejor la capacidad de razonamiento que las cuantizaciones escalares convencionales (INT4, GPTQ, AWQ) a footprints sub-4-bit. El autor reporta que su Precision Mode mantiene una perplejidad de 25,920 en WikiText-2 frente a 25,441 del BF16 sin comprimir, y que supera a INT4 estandar (Q4_0) en una bateria de 16 pruebas STEM (12/16 frente a 8/16). Estos datos proceden exclusivamente de la model card y no han sido verificados de forma independiente.

El modelo es relevante ahora por dos motivos: permite ejecutar un Mistral-7B-Instruct completo dentro de la VRAM de GPUs de consumo modestas (Radeon RX 5600 XT 6 GB, RTX 2060/3060, Intel Arc) con un runtime OpenCL propio, y porque introduce un formato de pesos cerrado y una licencia propietaria que lo alejan del ecosistema estandar de pesos abiertos (safetensors, GGUF). Su adopcion practica esta condicionada por el runtime propietario y por la licencia comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Mistral-7B-Instruct-v0.3); empaquetado propietario GSD-LQ v2.0 sobre OpenCL |
| Parametros totales | 7.000 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | GSD-LQ Precision Mode (3,76 bpw efectivos) y GSD-LQ Turbo Mode (4,26 bpw efectivos); sin calibracion |
| Idiomas soportados | No disponible |
| Licencia | Propietaria: proprietary-commercial-research-agreement (uso no comercial gratuito; uso comercial requiere licencia) |
| Formato de pesos | Binarios `.gsd2` propietarios (`mistral_v2_native_turbo.gsd2`, `mistral_v2_native_precision.gsd2`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Mistral-7B-Instruct-v0.3, un transformer decoder-only de 7.000 millones de parametros con atencion por ventanas deslizantes y contexto extendido a 32.768 tokens. Sobre el modelo base no se ha realizado ningun reentrenamiento ni ajuste fino adicional por parte de Phantom Lattice Labs: la intervencion se limita a la compresion de pesos. La tecnica GSD-LQ v2.0 se describe como una descomposicion en subespacios geometricos combinada con empaquetado de esferas sobre reticulos raiz (root-lattice sphere packing), que preserva la energia direccional de los pesos en lugar de proyectarlos a bins cartesianos 1D como hacen INT4, GPTQ o AWQ. El autor afirma que el metodo es zero-shot y zero-calibration: no requiere texto de calibracion, datos de entrenamiento ni matrices Hessian en GPU.

El runtime de inferencia es propio: el repositorio GitHub de Phantom Lattice Labs incluye un motor nativo OpenCL (`run_gpu_native_chat.py`) y un lanzador para Windows (`START_GPU_NATIVE_CHAT.bat`). El autor anuncia para la version v2.1 motores nativos Vulkan Compute y ARM NEON para Android y Apple Silicon. No se especifican datos sobre el proceso de entrenamiento del modelo base en la informacion proporcionada, mas alla de lo implicito en Mistral-7B-Instruct-v0.3.

## Capacidades

- Generacion de texto e instrucciones en el estilo del modelo base Mistral-7B-Instruct-v0.3.
- Razonamiento STEM, matematicas y fisica: el autor reporta 10/12 en su bateria STEM de 12 pruebas en Precision Mode, igualando al BF16 sin comprimir.
- Memoria de contexto largo: el autor reporta PASS en su prueba "Needle Memory" con 1.435 tokens.
- Chat interactivo multi-turno a velocidades de 12,5 tok/s (Turbo) y 6,5 tok/s (Precision) en hardware de consumo.
- Ejecucion nativa en GPU via OpenCL, sin necesidad de CUDA ni de frameworks como PyTorch en tiempo de inferencia.
- Tool calling y function calling: no documentado en la model card; se heredaria del modelo base en la medida en que el empaquetado lo preserve, pero no hay confirmacion.
- Capacidades de agente y multi-step reasoning: no documentadas de forma especifica.
- Capacidades multilingues: no disponibles (los idiomas no se listan).
- Vision, audio y thinking mode: no soportados (el modelo base es solo texto).

## Casos de uso

- Inferencia local en GPUs de consumo modestas: el Precision Mode cabe en 3,37 GB de VRAM, lo que permite ejecutar un Mistral-7B-Instruct en una Radeon RX 5600 XT de 6 GB o una RTX 2060, dejando margen para el KV-cache y el sistema.
- Asistencia de codigo en estaciones de trabajo sin GPU de datacenter: el Turbo Mode a 12,5 tok/s ofrece una experiencia interactiva aceptable para autocompletado y chat de programacion en hardware de gama media.
- Razonamiento STEM y resolucion de problemas de fisica o matematicas en entornos con VRAM limitada: el autor posiciona el Precision Mode para este escenario, con 10/12 en su bateria STEM y perplejidad cercana al BF16.
- Despliegue en portatiles y equipos con Intel Arc o GPUs integradas compatibles con OpenCL: el runtime nativo OpenCL evita la dependencia de CUDA y amplia el hardware objetivo.
- Evaluacion e investigacion sobre tecnicas de cuantizacion: util para investigadores que quieran comparar GSD-LQ frente a GPTQ, AWQ o Q4_0 en tareas de razonamiento, siempre bajo la licencia de evaluacion no comercial.
- Procesamiento de documentos largos con contexto extendido: los 32.768 tokens del modelo base permiten resumir o consultar documentos extensos en local, con la salvedad de que la calidad a contexto largo no esta verificada de forma independiente.
- Prototipado de chatbots y asistentes conversacionales en local: el formato binario y el lanzador de un clic reducen la friccion de puesta en marcha para demos y pruebas de concepto.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados de forma independiente):

| Formato | VRAM | bpw medio | Bateria 16 pruebas | STEM / Matematicas | Needle Memory (1.435 tok) |
|---|---|---|---|---|---|
| BF16 sin comprimir | 14,0 GB | 16,00 | 13/16 (81%) | 10/12 | PASS |
| GSD-LQ Precision Mode | 3,37 GB | 3,76 | 12/16 (75%) | 10/12 | PASS |
| GSD-LQ Turbo Mode | 3,79 GB | 4,26 | 12/16 (75%) | 9/12 | PASS |
| INT4 estandar (Q4_0) | 4,35 GB | 4,50 | 8/16 (50%) | 6/12 | PASS |
| INT3 estandar (Q3_K_M) | 3,40 GB | 3,40 | 4/16 (25%) | 2/12 | FAIL |

Perplejidad en WikiText-2 (1.536 tokens):

| Formato | Perplejidad |
|---|---|
| BF16 de referencia | 25,441 |
| GSD-LQ Precision Mode (3,76 bpw) | 25,920 |
| INT4 estandar (Block64) | 32,190 |

Divergencia KL del Precision Mode en WikiText-2: 0,14355.

Velocidad interactiva reportada: 12,5 tok/s en Turbo Mode y 6,5 tok/s en Precision Mode. No se especifica el hardware exacto de medida mas alla de "hardware de consumo" (Radeon RX 5600 XT 6 GB, RTX 2060/3060, Intel Arc).

## Requisitos de hardware

- VRAM estimada: 3,37 GB (Precision Mode, incluyendo KV-cache) y 3,79 GB (Turbo Mode, incluyendo KV-cache). El BF16 sin comprimir requiere 14,0 GB.
- GPU recomendadas por el autor: AMD Radeon RX 5600 XT 6 GB, NVIDIA RTX 2060, RTX 3060 e Intel Arc. Cualquier GPU con soporte OpenCL razonable deberia poder ejecutar el runtime, aunque no se detalla la lista completa de compatibilidad.
- Cabe en GPU de consumo: si, en GPUs con al menos 6 GB de VRAM segun el autor. No se documenta el comportamiento en GPUs con menos de 4 GB.
- Opciones de despliegue: exclusivamente el runtime nativo OpenCL del repositorio GitHub de Phantom Lattice Labs (`run_gpu_native_chat.py`). No hay soporte para vLLM, llama.cpp, Ollama, TGI ni transformers, ya que el formato `.gsd2` es propietario.
- Latencia y throughput: 12,5 tok/s (Turbo) y 6,5 tok/s (Precision) segun el autor, medidos en hardware de consumo no especificado con precision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion tipica | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3-GSD-LQ | 7B | 32.768 | GSD-LQ propietaria (3,76-4,26 bpw) | Propietaria (uso comercial con licencia) | Binarios `.gsd2` propietarios |
| Mistral-7B-Instruct-v0.3 (original) | 7B | 32.768 | BF16, safetensors | Apache 2.0 | Hugging Face, safetensors |
| Mistral-7B-Instruct-v0.3 cuantizado en GGUF (Q4_K_M) | 7B | 32.768 | GGUF Q4_K_M (~4,4 GB) | Apache 2.0 (modelo base) | Hugging Face, llama.cpp |
| Mistral-7B-Instruct-v0.3 cuantizado con AWQ o GPTQ | 7B | 32.768 | AWQ/GPTQ INT4 | Apache 2.0 (modelo base) | Hugging Face, vLLM/transformers |

La diferencia principal frente a las alternativas no esta en el modelo (es el mismo Mistral-7B-Instruct-v0.3) sino en el formato de compresion, el runtime y la licencia. Las cuantizaciones GGUF, AWQ y GPTQ se ejecutan en ecosistemas abiertos (llama.cpp, vLLM, transformers) y heredan la licencia Apache 2.0 del modelo base, mientras que GSD-LQ exige su propio runtime OpenCL y una licencia comercial para uso productivo. El autor reporta ventajas de GSD-LQ frente a Q4_0 en su bateria de razonamiento, pero no hay comparacion publica e independiente frente a Q4_K_M, AWQ o GPTQ.

## Limitaciones y advertencias

- Los benchmarks y cifras de rendimiento proceden unicamente de la model card del autor y no han sido verificados de forma independiente; deben tratarse como afirmaciones no contrastadas.
- El formato de pesos `.gsd2` es propietario y solo se ejecuta con el runtime OpenCL del autor; no es compatible con llama.cpp, vLLM, Ollama, TGI ni transformers, lo que limita la portabilidad y la integracion en pipelines existentes.
- La licencia es propietaria: el uso comercial, el despliegue en la nube y la integracion en hardware empresarial requieren un acuerdo comercial con Phantom Lattice Labs. No es una licencia de codigo abierto.
- La licencia incluye una clausula etica que prohibe usos militares, de defensa, armas autonomas y robotica letal.
- El modelo hereda los sesgos y riesgos de alucinacion de Mistral-7B-Instruct-v0.3; la cuantizacion agresiva a sub-4-bit puede ampliar la degradacion en tareas de razonamiento de multiples pasos, aunque el autor afirme lo contrario.
- No se documentan los idiomas soportados ni el comportamiento multilingue tras la cuantizacion.
- No hay informacion sobre tool calling, function calling ni capacidades de agente en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el proyecto declara una patente en tramite (US Provisional Application 64/195,346), lo que anade incertidumbre sobre su evolucion y soporte a largo plazo.
- No se especifica el hardware exacto de las mediciones de velocidad, por lo que las cifras de tok/s no son directamente extrapolables.
- El modelo tiene fecha de creacion en 2026-11-13 segun los metadatos de Hugging Face, lo que conviene contrastar con la disponibilidad real del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/PhantomLatticeLabs/Mistral-7B-Instruct-v0.3-GSD-LQ
- Repositorio GitHub de GSD-LQ: https://github.com/Phantom309-CED/GSD-LQ
- Licencia: https://github.com/Phantom309-CED/GSD-LQ/blob/main/LICENSE.md
- Contacto comercial: Phantom_Lattice_Labs@proton.me
