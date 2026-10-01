# CarnaK/MiMo-V2.6-Flash-RL-Heretic-MTP-Q3_K-GGUF

## Resumen

MiMo-V2.6-Flash-RL-Heretic-MTP-Q3_K-GGUF es una cuantizacion GGUF publicada por el usuario CarnaK sobre el modelo base XiaomiMiMo/MiMo-V2.6-Flash-RL, desarrollado por Xiaomi. No es un modelo nuevo: es un derivado que fusiona (merge offline) un LoRA "Heretic" de rango 1 —orientado a reducir los rechazos y el alineamiento de seguridad— directamente en los pesos, preservando las cabezas MTP (Multi-Token Prediction) del modelo original y recuantizando el resultado a Q3_K. El objetivo declarado es la inferencia local de alto rendimiento con llama.cpp, la experimentacion y el red-teaming.

El modelo subyacente es un sistema omnimodal (texto, imagen, video y audio) con arquitectura de mezcla de expertos (MoE), entrenado con escalado de computo de aprendizaje por refuerzo sobre tareas verificables. El fichero resultante pesa 148.163.996.096 bytes (~138 GiB), mide 3,83 BPW y contiene 508 tensores. Mantiene el soporte de decodificacion especulativa nativa mediante `--spec-type draft-mtp` y de reparto tensorial multi-GPU (`-sm tensor`).

La relevancia de esta release es doble: por un lado, permite ejecutar un modelo de gran tamano (del orden de 3x10^11 parametros segun la propia metadata de cuantizacion) en un cluster de 7 GPU de consumo; por otro, al incorporar el adaptador Heretic ya fusionado, elimina la necesidad de cargar un `--lora` en tiempo de ejecucion, algo que complicaba el uso combinado con MTP y con el reparto tensorial. Es, por tanto, una build pensada para investigacion sobre alineacion, generacion de datos a gran escala y evaluacion de seguridad, no para despliegues de producto orientados al usuario final.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), omnimodal, con cabezas MTP integradas; detalles exactos de capas y configuracion de expertos no disponibles |
| Parametros totales | ~310.000 millones (estimacion a partir de 141.294,49 MiB a 3,83 BPW; el autor no publica la cifra oficial) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) en la configuracion probada; el autor reporta pruebas a 524.288 tokens (512K); metadata de contexto largo heredada del modelo upstream |
| Tipos de cuantizacion | Q3_K en esta release; KV cache cuantizable a q8_0 (`-ctk q8_0`, `-ctv q8_0`) y tambien los tensores de draft especulativo; el repositorio upstream ggml-org ofrece Q2_K, MXFP4 y Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | MIT (segun el repositorio del autor; conviene verificar los terminos del modelo base de Xiaomi) |
| Formato de pesos | GGUF (fichero unico de 508 tensores, ~138 GiB, 3,83 BPW); proyector multimodal separado en GGUF (`mmproj-MiMo-V2.6-Flash-RL-Q8_0.gguf`) |
| Motor de inferencia | llama.cpp (build 0.5.0-dev probado, backend CUDA) |
| Fecha de publicacion | 1 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura del modelo original es un transformer con mezcla de expertos y configuracion omnimodal nativa, capaz de procesar texto, imagenes, video y audio dentro del mismo modelo. Xiaomi lo entrena mediante escalado del computo de aprendizaje por refuerzo sobre tareas complejas y verificables, con el objetivo declarado de mejorar codigo, agentes generales, tareas visuales y ciberseguridad en una unica pasada de RL. No se dispone del numero de tokens de entrenamiento, la composicion del dataset ni el detalle de las etapas de RLHF/DPO en la informacion proporcionada.

Sobre esa base, esta release aplica dos transformaciones. Primero, el autor toma un GGUF capaz de MTP (en dos fragmentos), los fusiona con `llama-gguf-split --merge` y despues incorpora permanentemente el LoRA Heretic con `llama-export-lora`; el proceso reporta "merged 58 tensors with lora adapters" y "wrote 508 tensors to output file". Segundo, recuantiza el resultado con `llama-quantize` a Q3_K con `--allow-requantize`, necesario porque el GGUF de origen mezclaba tipos de tensor, incluidos tensores de expertos ya pre-cuantizados en MXFP4. La cuantizacion tardo aproximadamente 731 segundos. La innovacion practica es conservar las cabezas MTP tras el merge, lo que habilita decodificacion especulativa nativa sobre un modelo ya modificado en sus pesos.

## Capacidades

- Generacion de texto y razonamiento general en ingles y chino, heredados del modelo base MiMo-V2.6-Flash-RL.
- Capacidades omnimodales del modelo upstream (imagen, video, audio) accesibles mediante el proyector multimodal `mmproj-MiMo-V2.6-Flash-RL-Q8_0.gguf` cargado aparte.
- Decodificacion especulativa nativa con MTP mediante `--spec-type draft-mtp`, con tasas de aceptacion medidas entre el 41,21 % y el 77,00 % segun la configuracion.
- Reparto tensorial entre multiples GPU con `-sm tensor` y `-ts`, probado con 7 GPU.
- Contexto largo: 256K tokens en la configuracion recomendada y pruebas a 512K.
- Reduccion deliberada de rechazos (abliteration) por efecto del LoRA Heretic fusionado: aumenta la tasa de respuestas a peticiones que el modelo base rechazaria.
- Plantilla de chat upstream de MiMo y metadata de contexto largo (segun el autor).
- Soporte de tool calling, function calling y flujos de agente multi-paso: no confirmado en la informacion disponible; depende de lo que herede del modelo base y de la plantilla aplicada.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el LoRA Heretic reduce los rechazos, lo que permite obtener respuestas del modelo ante prompts adversarios sin que la capa de seguridad las bloquee, y medir despues el comportamiento con clasificadores externos. Es el uso declarado por el autor.
- Investigacion sobre alineacion y refusal: al existir la version base sin modificar, se pueden comparar pares de respuestas (base frente a Heretic) sobre el mismo prompt manteniendo constantes el tokenizador, la plantilla y el contexto, aislando el efecto del adaptador.
- Generacion sintetica de datos a gran escala en ingles y chino: con 76,50 tokens/s sostenidos en una sola instancia sobre 7 GPU de 24 GB, es viable producir grandes volumenes de texto para destilacion o filtrado posterior, a un coste por token muy inferior al de una GPU de数据中心.
- Analisis de documentos muy largos: la ventana de 256K tokens permite ingerir repositorios completos, expedientes o transcripciones extensas en una sola pasada, sin troceado ni recuperacion, con el coste de atencion que ello implica.
- Procesamiento multimodal por lotes: con el proyector Q8_0 acoplado, se pueden extraer descripciones, transcripciones o resumenes de imagenes, video y audio; el autor indica `--no-mmproj-offload`, de modo que conviene dimensionar memoria para el proyector ademas de los pesos.
- Despliegue en hardware de consumo agregado: sirve como banco de pruebas para arquitecturas de inferencia distribuidas sobre 7x RTX 3090 (169 GB de VRAM visible) en lugar de recurrir a A100/H100, validando topologia PCIe, NCCL y configuracion de reparto tensorial.
- Experimentacion con decodificacion especulativa MTP: permite estudiar el compromiso entre tasa de aceptacion y throughput real variando `--spec-draft-n-max` (1, 2, 3) sobre un modelo ya modificado, sin la interferencia de cargar un LoRA en tiempo de ejecucion.

## Benchmarks y rendimiento

El autor publica mediciones locales de rendimiento de inferencia, no resultados de calidad. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Configuracion | Contexto | Tokens generados | Generacion sostenida | Aceptacion MTP | Aceptados/generados | Longitud media aceptada |
|---|---|---|---|---|---|---|
| MTP N=1 | 262.144 | 4.096 | 76,50 tok/s | 77,00 % | 1.781 / 2.313 | 1,77 |
| MTP N=2 | 262.144 | no disponible | 75,94 tok/s | 57,61 % | 2.192 / 3.805 | 2,15 (pico de 81,56 tok/s en 3 s) |
| MTP N=3 | 262.144 | no disponible | 66,58 tok/s | 41,21 % | 2.263 / 5.492 | 2,24 |
| MTP N=2 | 524.288 | no disponible | ~72,26 tok/s | ~57,61 % | no disponible | no disponible |

Advertencia del propio autor: el rendimiento varia con el prompt, la distribucion de salida, la tasa de aceptacion MTP, la topologia PCIe, la version de CUDA, los relojes de GPU y la build de llama.cpp.

| Metrica de cuantizacion | Valor |
|---|---|
| Tamano del modelo de origen | 232.975,81 MiB (6,31 BPW) |
| Tamano tras cuantizar | 141.294,49 MiB (3,83 BPW) |
| Tensores en el fichero final | 508 |
| Tiempo de cuantizacion | ~731 s |
| Tamano de fichero medido | 148.163.996.096 bytes (~138 GiB) |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa ~138 GiB, por lo que se necesitan al menos ~140 GB de VRAM disponible para pesos, mas overhead de contexto (la configuracion probada usa KV cache en q8_0) y estado de CUDA/NCCL.
- Hardware probado por el autor: 7x NVIDIA GeForce RTX 3090 de 24 GB (169 GB de VRAM visible agregada), CPU AMD EPYC, reparto tensorial `-ts 1,1,1,1,1,1,1.10` sobre los dispositivos 0 a 6.
- No cabe en una unica GPU de consumo. Tampoco cabe con comodidad en una unica GPU profesional de 80 GB (A100/H100 80 GB); seria necesario reparto entre varias.
- Alternativas de hardware razonables: 2x H100 80 GB, 2x A100 80 GB, 4x RTX 6000 Ada 48 GB o un cluster de 6-7 GPU de 24 GB (3090/4090/A5000). El requisito real es VRAM agregada, no por GPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) con backend CUDA y `-ngl 999`; el formato GGUF es nativo de llama.cpp. Soporte en vLLM, Ollama o TGI: no disponible en la informacion proporcionada (Ollama podria cargarlo si acepta el GGUF, pero no esta verificado).
- Variables de entorno recomendadas por el autor para multi-GPU: `NCCL_P2P_LEVEL=SYS`, `NCCL_SHM_DISABLE=1`, `NCCL_ALGO=Ring`, `NCCL_PROTO=LL`, `CUDA_SCALE_LAUNCH_QUEUES=4x`.
- Throughput medido: 66,58-76,50 tok/s sostenidos con contexto de 256K segun la configuracion MTP, y ~72,26 tok/s a 512K. El autor senala que N=1 con 256K fue la mejor configuracion sostenida. No se aportan datos de latencia de prefill (TTFT) ni de throughput por lotes (`-np` se fija a 1).
- Para vision se requiere ademas el proyector `mmproj-MiMo-V2.6-Flash-RL-Q8_0.gguf` y el flag `--no-mmproj-offload`, lo que implica reservar memoria adicional fuera de la GPU o asumir el coste de mantenerlo en CPU.

## Comparativa con modelos similares

Todos los comparables directos son variantes del mismo modelo base, ya que MiMo-V2.6-Flash-RL es un modelo propietario de pesos abiertos publicado en 2026.

| Modelo | Parametros | Contexto | Cuantizacion | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CarnaK/MiMo-V2.6-Flash-RL-Heretic-MTP-Q3_K-GGUF | ~310.000 M (estimado) | 256K (probado a 512K) | Q3_K, 3,83 BPW, 508 tensores | LoRA Heretic fusionado, cabezas MTP preservadas | MIT (repositorio del autor) | 0 descargas, 0 likes; creado el 01-10-2026 |
| ggml-org/MiMo-V2.6-Flash-RL-GGUF | no disponible | no disponible | Q2_K (down projections de expertos en MXFP4), Q8_0; sidecars MTP en MXFP4 y Q8_0 | Conversion oficial, sin modificar | no disponible | Repositorio de referencia de llama.cpp |
| TrevorJS/MiMo-V2.6-Flash-RL-GGUF | no disponible | no disponible | no disponible | Conversion comunitaria | no disponible | no disponible |
| XiaomiMiMo/MiMo-V2.6-Flash-RL (base) | no disponible | no disponible | BF16 / MXFP4 (pesos originales) | Ninguna | no disponible | Modelo base de Xiaomi |
| MorinoNushi/MiMo-V2.6-Flash-RL-Uncensored-Heretic-LoRA-GGUF | no disponible (adaptador) | no disponible | GGUF (LoRA) | Adaptador Heretic sin fusionar | no disponible | Requiere `--lora` en tiempo de ejecucion |

Comparado con la via oficial (ggml-org), esta build ofrece una cuantizacion mas alta (Q3_K frente a Q2_K), el adaptador ya fusionado y mediciones publicas de throughput con MTP. Frente a la ruta de LoRA en runtime, elimina una dependencia operativa pero pierde la reversibilidad: no se puede desactivar el efecto Heretic sin volver a descargar otro GGUF. No se dispone de datos de calidad que permitan comparar el impacto de Q3_K frente a Q2_K o MXFP4.

## Limitaciones y advertencias

- Modelo abliterado: el LoRA Heretic reduce deliberadamente los rechazos. Esto degrada o anula parte del alineamiento de seguridad del modelo original; no debe exponerse a usuarios finales ni integrarse en productos de atencion al cliente sin una capa de moderacion externa.
- Riesgo de alucinacion: es un riesgo inherente a los modelos generativos de esta escala, agravado por la cuantizacion Q3_K, que introduce perdida de precision adicional respecto a BF16 o MXFP4.
- Cuantizacion agresiva: 3,83 BPW sobre 508 tensores, con `--allow-requantize` sobre un fichero que ya mezclaba tipos (incluidos expertos en MXFP4). La degradacion de calidad respecto al modelo original no esta cuantificada en la informacion disponible.
- Idiomas: solo ingles y chino declarados. El rendimiento en castellano no esta evaluado; cabe esperar un comportamiento inferior y mayor tasa de alucinacion en espanol.
- Licencia: el repositorio se declara MIT, pero al derivar de un modelo base de Xiaomi conviene verificar los terminos de uso del modelo original antes de cualquier explotacion comercial. La informacion proporcionada no incluye la licencia del modelo base ni la del adaptador Heretic.
- Requisitos de hardware muy altos: no cabe en una GPU de consumo individual; exige del orden de 140-170 GB de VRAM agregada y conocimientos de reparto tensorial, NCCL y ajuste de `llama.cpp`.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, publicado y actualizado el mismo dia. No hay validacion externa, ni resultados de benchmarks de calidad, ni informes de terceros.
- Compatibilidad: el autor probo con llama.cpp 0.5.0-dev. Los flags `--spec-type draft-mtp`, `--spec-draft-n-max` y `--spec-draft-p-min` dependen de esa build; en versiones antiguas no funcionaran.
- Rendimiento variable: la propia model card advierte de que el throughput depende del prompt, la topologia PCIe, la version de CUDA, los relojes y la build. Los 76,50 tok/s no son extrapolables a otro hardware.
- Soporte multimodal con matices: requiere un proyector aparte y `--no-mmproj-offload`; no se documentan resultados de calidad en vision, audio o video para esta build concreta.
- Soporte de tool calling y agentes: no confirmado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CarnaK/MiMo-V2.6-Flash-RL-Heretic-MTP-Q3_K-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- LoRA Heretic de origen: https://huggingface.co/MorinoNushi/MiMo-V2.6-Flash-RL-Uncensored-Heretic-LoRA-GGUF
- GGUF oficial y proyector multimodal: https://huggingface.co/ggml-org/MiMo-V2.6-Flash-RL-GGUF
- Conversion comunitaria alternativa: https://huggingface.co/TrevorJS/MiMo-V2.6-Flash-RL-GGUF
- Motor de inferencia llama.cpp: https://github.com/ggml-org/llama.cpp
- Pagina oficial del modelo MiMo-V2.6-Flash: https://mimo.mi.com/models/en-US/mimo-v2.6-flash
- Anuncio de la serie MiMo-V2.6 de Xiaomi: https://mimo.xiaomi.com/mimo-v2-6
- Analisis del GGUF multimodal de MiMo-V2.6-Flash-RL: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/22/mimo-v2-6-flash-rl-gguf-released/
