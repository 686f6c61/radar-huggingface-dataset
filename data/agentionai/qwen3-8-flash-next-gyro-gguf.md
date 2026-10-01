# agentionai/Qwen3.8-Flash-Next-Gyro-GGUF

## Resumen

Gyro-S es un build cuantizado en GGUF del modelo multimodal Qwen3.8-Flash-Next, publicado por agentionai bajo una licencia qwen-community-1.0. No es un modelo nuevo: mantiene la arquitectura del modelo base (mezcla de expertos con atencion hibrida Gated DeltaNet + Qwen Sparse Attention) y lo recomprime mediante una tecnica propia llamada APR (Agention Precision Rotor), que almacena los expertos enrutados en una base rotada con un codigo compacto de 1,625-1,875 bits por peso. El objetivo declarado es permitir ejecutar un MoE de gran tamano en una sola GPU de 32 GB manteniendo 64k de contexto, con 27,65 GiB de pesos y 28,8 GiB en total.

El modelo base, segun la model card y la documentacion publica de Qwen, es un MoE con 48 capas y 512 expertos por capa, de los que se activan 10 por token, y con capas compartidas que combinan atencion lineal y expertos compartidos. La cuantizacion deja las capas compartidas en K-quant de 5 bits y el router en BF16, mientras que buena parte del peso (una tabla de n-gramas de 51,2B de parametros) permanece en disco y se lee fila a fila con la opcion `--ngram-on-disk`.

Su relevancia actual es practica: los quants de muy pocos bits de este modelo tienden a entrar en bucles en razonamiento largo, y agentionai reporta que Gyro-S no lo hizo en 0 de 5 ejecuciones de su prueba de bucle, frente a 4 de 5 de una alternativa de 2 bits y 36,5 GiB. Es un release marcado como experimental, con 306 descargas y 2 likes en el momento de redactar esta ficha, y requiere un build propio de llama.cpp con Vulkan: el llama.cpp estandar rechaza el fichero por tipo desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atencion hibrida GDN + QSA, heredada de Qwen3.8-Flash-Next; los expertos enrutados se almacenan en base rotada (APR) |
| Parametros totales | 176.943.899.520 segun los metadatos de safetensors del modelo base; la model card describe 126B en el modelo (121B en expertos enrutados) mas una tabla de n-gramas de 51,2B |
| Parametros activos | no disponible (la model card indica 10 expertos activos de 512 por token en 48 capas, pero no da el total de parametros activos) |
| Longitud de contexto | 65.536 tokens (64k) en las configuraciones de ejemplo de la model card |
| Tipos de cuantizacion | Expertos enrutados con rotor code de 1,625 bits/peso (gate/up) y 1,875 bits/peso (down), media 1,71; capas compartidas en K-quant de 5 bits; router en BF16; cache KV en q8_0; draft MTP en Q4_K_M |
| Idiomas soportados | no disponible (la calibracion incluye 16 idiomas, pero no se enumeran) |
| Licencia | qwen-community-1.0 (etiquetada como `other` y `license_name: qwen-community-1.0` en HuggingFace) |
| Formato de pesos | GGUF (`gguf`, `library_name: gguf`) |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una recuantizacion del modelo base Qwen/Qwen3.8-Flash-Next. La arquitectura del base, segun el repositorio oficial de Qwen y DeepWiki, es un MoE multimodal con atencion hibrida que combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), y que reduce los costes de entrenamiento en torno a un 88 % respecto a una atencion densa equivalente. La model card de este GGUF confirma la estructura: 48 capas con 512 expertos enrutados cada una y 10 activos por token, mas capas compartidas que incluyen atencion, atencion lineal y expertos compartidos.

La innovacion tecnica del build es la cuantizacion. Los expertos enrutados se almacenan en una base rotada mediante una transformacion Hadamard por bloques de 128 aplicada a la entrada de cada experto, y el runtime aplica la transformacion correspondiente a las activaciones. Sobre esa base se guarda un codigo de rotor compacto de 1,625-1,875 bits por peso, generado con un encoder y un conjunto de calibracion propios (con mas codigo y trabajo agentico en la version del 1 de octubre de 2026). Las capas compartidas usan K-quant de 5 bits y el router se mantiene en BF16. La tabla de n-gramas de 51,2B de parametros no reside en VRAM: se lee del disco fila a fila.

El runtime necesita el build de llama.cpp de agentionai con Vulkan, porque el llama.cpp estandar rechaza el fichero como tipo desconocido. El repositorio incluye ademas un proyector de vision (`mmproj-F16.gguf`, 0,9 GB) y un draft MTP (`mtp-Qwen3.8-Flash-Next-Q4_K_M.gguf`, 2,7 GB) para decodificacion especulativa. La model card no detalla el dataset de entrenamiento del modelo base, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y de prosa, con muestreo recomendado en modo thinking (temp 1,0, top-p 0,95, top-k 20, min-p 0).
- Razonamiento largo sin entrar en bucles, segun la prueba interna del autor: 0 de 5 ejecuciones con bucle frente a 4 de 5 de una alternativa de 2 bits.
- Generacion de codigo, con enfasis explicito en mantener la coherencia (el autor afirma que "hay menos deslices en codigo").
- Trabajo agentico y multi-paso, ya que la calibracion se ajusto con trabajo de agente y codigo.
- Matematicas, incluidas en el conjunto de calibracion.
- Multilingue: 16 idiomas presentes en la calibracion (no se enumeran en la informacion disponible).
- Vision: lectura de imagenes a traves del proyector `mmproj-F16.gguf` (0,9 GB, aproximadamente 1 GiB de VRAM adicional).
- Decodificacion especulativa con draft MTP, que acelera la generacion (de 32 a 61 tok/s en copia/edicion de texto).
- Servidor HTTP compatible con la API de llama.cpp via `llama-server`, con plantilla Jinja (`--jinja`) para tool calling y chat.
- No se documentan en la informacion disponible capacidades de audio ni de tool calling nativo mas alla de lo que aporta la plantilla del modelo base.

## Casos de uso

- Asistente de codigo local en una estacion de trabajo con GPU de 32 GB: Gyro-S necesita 28,8 GiB a 64k de contexto, de modo que cabe entero en una sola tarjeta y permite autocompletado, refactorizacion y revision de parches sin depender de una API externa.
- Agente de edicion de repositorios: con 64k de contexto y decodificacion especulativa (52 tok/s en codigo, 61 tok/s en edicion/copia), es viable encadenar lecturas de ficheros, parcheo y verificacion en un bucle multi-paso.
- Generacion de JSON estructurado para pipelines de datos: el autor mide 58 tok/s en salida JSON con el draft MTP, lo que lo hace util para extraccion y normalizacion por lotes con salida validable.
- Razonamiento largo sobre documentacion tecnica: la ausencia de bucles en la prueba del autor y la ventana de 64k permiten tareas de analisis de contratos, RFCs o manuales extensos en una sola pasada.
- Atencion al cliente automatizada multilingue: los 16 idiomas de calibracion y la ventana de 64k permiten mantener conversaciones multi-turno con historial largo e instrucciones de negocio extensas.
- Procesamiento de imagenes en soporte tecnico: el proyector de vision permite interpretar capturas de pantalla, diagramas o fotos de producto y responder con texto en el mismo flujo.
- Despliegue en hardware de memoria unificada (por ejemplo, Strix Halo): Gyro-M y Gyro-L estan pensados para maquinas de 48-64 GB, lo que habilita inferencia local en equipos sin GPU dedicada de gama alta.
- Prototipado e investigacion de cuantizacion extrema: sirve como banco de pruebas de la tecnica APR frente a quants de 2 bits convencionales en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos medidos que aporta el autor son internos:

| Metrica | Resultado |
|---|---|
| Prueba de bucle en razonamiento largo (Gyro-S) | 0 de 5 ejecuciones con bucle |
| Prueba de bucle en razonamiento largo (alternativa 2 bits, 36,5 GiB) | 4 de 5 ejecuciones con bucle |
| Decodificacion en prosa (Strix Halo, greedy, sin/con MTP) | 32 -> 39 tok/s |
| Decodificacion en codigo (Strix Halo, greedy, sin/con MTP) | 32 -> 52 tok/s |
| Decodificacion en JSON (Strix Halo, greedy, sin/con MTP) | 32 -> 58 tok/s |
| Decodificacion en edicion/copia de texto (Strix Halo, greedy, sin/con MTP) | 32 -> 61 tok/s |

No hay comparaciones con MMLU, HumanEval ni otras suites publicas, ni datos de la calidad tras la cuantizacion frente al modelo base en FP16 o BF16.

## Requisitos de hardware

- Gyro-S: 27,65 GiB de pesos y 28,8 GiB en total con 64k de contexto. Cabe en tarjetas de 32 GB.
- Gyro-M: aproximadamente 39 GiB (estimacion del autor). Pensado para 2x24 GB, tarjetas de 48 GB o maquinas con 64 GB de memoria unificada.
- Gyro-L: aproximadamente 46-50 GiB. Pensado para tarjetas de 64 GB y maquinas de memoria unificada.
- Vision: el proyector `mmproj-F16.gguf` anade 0,9 GB de fichero y alrededor de 1 GiB de VRAM. Se puede omitir con `--no-mmproj` para modo solo texto.
- Decodificacion especulativa: el draft MTP ocupa 2,7 GB en disco y unos 3 GiB extra de VRAM.
- Cache KV: en las configuraciones de ejemplo se usa `-ctk q8_0 -ctv q8_0`.
- Cabe en GPU de consumo de 32 GB. El rendimiento reportado se midio en una iGPU Strix Halo, no en una GPU dedicada.
- Backend obligatorio: build propio de llama.cpp con Vulkan, `agentionai/llama.cpp`. El llama.cpp estandar rechaza el fichero. El autor publica una imagen Docker `ghcr.io/agentionai/agention-llama:server` para AMD, Intel y NVIDIA (esta ultima con el NVIDIA Container Toolkit y su driver Vulkan).
- Opciones imprescindibles en el arranque: `-ngl 999 -fa on --jinja --ngram-on-disk`.
- No se facilitan datos de latencia de primer token ni de throughput en GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Memoria | Licencia | Estado |
|---|---|---|---|---|---|---|
| Gyro-S (este repo) | 176,9B totales declarados en el base; 126B segun la model card, 10/512 expertos activos | 64k | APR rotor 1,625-1,875 bits (expertos) + K-quant 5 bits (compartidas) | 28,8 GiB a 64k | qwen-community-1.0 | Disponible (experimental) |
| Gyro-M (mismo repo) | Igual que Gyro-S | 64k | APR con mas bits en expertos y capas compartidas | ~39 GiB (estimado) | qwen-community-1.0 | En medicion |
| Gyro-L (mismo repo) | Igual que Gyro-S | 64k | APR con mas bits en expertos y capas compartidas | ~46-50 GiB | qwen-community-1.0 | Planeado |
| Alternativa de 2 bits citada por el autor | no disponible | no disponible | 2 bits | 36,5 GiB | no disponible | no disponible |
| Qwen3.8-Flash-Next (base) | 176.943.899.520 segun safetensors | no disponible | BF16/FP16 (sin cuantizar) | Muy superior a 32 GB | qwen-community-1.0 | Disponible |

No se dispone de datos de rendimiento comparativos entre estas variantes mas alla de la prueba de bucle. El autor mantiene ademas otras lineas de cuantizacion del mismo modelo, como `agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-imatrix-GGUF`, orientada a ROCm/FP4.

## Limitaciones y advertencias

- Release experimental: el autor advierte que el formato y los kernels pueden cambiar, y que la version publicada el 1 de octubre de 2026 reemplaza al primer fichero Gyro del 30 de septiembre.
- Requiere un runtime no estandar. Sin el build de agentionai con Vulkan, el fichero no carga en llama.cpp de serie.
- La tabla de n-gramas de 51,2B de parametros no cabe en VRAM ni en RAM si no se usa `--ngram-on-disk`; omitir esa opcion puede agotar memoria.
- No hay datos publicos de benchmarks estandar, por lo que no se puede estimar la degradacion de calidad frente al modelo base en BF16.
- Hay una discrepancia sin aclarar entre los 176.943.899.520 parametros de los metadatos de safetensors y los 126B que menciona la model card; conviene verificar el dato antes de dimensionar infraestructura.
- No se incluye la lista de idiomas soportados, solo que la calibracion cubre 16 idiomas.
- Riesgo de alucinacion inherente al modelo base, no caracterizado en esta ficha por falta de evaluaciones publicadas.
- Riesgo de sesgos no evaluado en la informacion disponible.
- Licencia `qwen-community-1.0` (etiquetada como `other` en HuggingFace): es una licencia especifica de Qwen con condiciones propias, no una licencia de codigo abierto estandar. Hay que revisar sus terminos antes de un uso comercial.
- El rendimiento publicado (32 a 61 tok/s) corresponde a una iGPU Strix Halo, no a una GPU dedicada, por lo que no es extrapolable directamente.
- Las cifras de memoria de Gyro-M y Gyro-L son estimaciones del autor, no medidas.
- El repositorio ocupa 120,6 GB, lo que implica un coste de almacenamiento y descarga notable, aunque la descarga de Gyro-S se cifra en 58,5 GB.

## Enlaces

- HuggingFace: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guia de inicio (DeepWiki): https://deepwiki.com/QwenLM/Qwen3.8-Flash-Next/3-getting-started
- Build de llama.cpp de agentionai: https://github.com/agentionai/llama.cpp
- Imagen Docker: ghcr.io/agentionai/agention-llama:server
- Pagina de agention.ai sobre el modelo: https://www.agention.ai/models/qwen3.8-flash-next/
- Otro quant del mismo autor: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-imatrix-GGUF
