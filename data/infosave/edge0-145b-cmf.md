# infosave/Edge0-145B-cmf

## Resumen

Edge0-145B-cmf es un modelo de lenguaje de tipo mixture-of-experts (MoE) latente empaquetado en un unico fichero CMF de 110,2 GB para el motor de inferencia cortiq, escrito en Rust. Lo publica el usuario `infosave` como cuantizacion del modelo base Edge0/Edge0-145B-NVFP4, que a su vez se construye sobre Qwen3.8-Flash-Next. Cada capa contiene 512 expertos que operan en 1792 dimensiones y conservan el entrenamiento de 4 bits de Edge0: los pesos NVFP4 se copian bit a bit, sin recuantizar.

El modelo resuelve el problema del despliegue de un MoE de gran tamano en hardware heterogeneo: ofrece backend CUDA para tarjetas NVIDIA de 12 GB en adelante (con parte de los expertos en RAM) y backend Vulkan para tarjetas de 24 GB o mas con driver Vulkan, manteniendo el mismo fichero y la misma API de servidor compatible con OpenAI. Incorpora decodificacion especulativa mediante tokens draft (MTP) y una tabla n-gram de 52 GB fijada en RAM.

Es relevante ahora porque demuestra una via de inferencia local para modelos de 145B parametros con cuantizacion NVFP4 nativa, alcanzando 162-167 tok/s en generacion de codigo sobre una RTX PRO 6000 de 96 GB y un 94,5 % de pass@1 en HumanEval (164 tareas, sin modo thinking). La licencia es comunitaria propia (`edge0-community-model-1.0`), no estandar de codigo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE latente (latent mixture-of-experts), 512 expertos por capa |
| Parametros totales | 145B (denominacion del modelo; desglose no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 32 768 tokens por defecto (`CMF_MAX_SEQ`); soporta prompts de 4K a 32K segun benchmarks |
| Tipos de cuantizacion | NVFP4 (4 bits, pesos copiados bit a bit del modelo base); no se documentan otras |
| Idiomas soportados | en, ru, zh |
| Licencia | edge0-community-model-1.0 (licencia comunitaria propia, no OSI) |
| Formato de pesos | CMF (fichero unico de 110,2 GB), mas checksum SHA-256 y perfil de routing |
| Dimension de los expertos | 1792 |
| Motor de inferencia | cortiq 0.8.95+ (Rust); backends CUDA y Vulkan |
| Modelo base | Edge0/Edge0-145B-NVFP4 (relacion: quantized) |
| Modelo de origen | Qwen3.8-Flash-Next |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos latente: cada capa aloja 512 expertos que proyectan a 1792 dimensiones y que se activan mediante routing disperso. El modelo parte de Qwen3.8-Flash-Next y fue entrenado por Edge0 en 4 bits (NVFP4); esta version CMF no reentrena ni recuantiza, sino que copia los pesos NVFP4 del checkpoint Edge0/Edge0-145B-NVFP4 bit a bit y los empaqueta en un unico fichero junto con un perfil de routing (`edge0-145b.profile`) que guia la carga de expertos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La innovacion tecnica destacable en el plano de inferencia es la decodificacion especulativa con tokens draft (MTP, activable con `CMF_QWEN_MTP`), junto con la gestion automatica de memoria: al arrancar, cortiq inspecciona la VRAM libre y decide que parte del modelo se carga en la tarjeta y que parte de los expertos queda en RAM. En CUDA se usa ademas una tabla n-gram de 52 GB fijada en memoria del sistema.

## Capacidades

- Generacion de texto y codigo: el punto fuerte medido es la generacion de codigo (HumanEval pass@1 del 94,5 % con thinking desactivado).
- Razonamiento con modo thinking opcional (`enable_thinking` en la peticion).
- Decodificacion especulativa con tokens draft (MTP) para acelerar la generacion.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/models`), integrable con editores y agentes que hablen dicho protocolo.
- Interfaz web de chat incluida en `http://127.0.0.1:8080/`.
- Multilinguee en ingles, ruso y chino.
- Soporte de prompts largos: lectura de contexto de 4K a 32K tokens con velocidades medidas.
- No se documentan capacidades de vision, audio ni tool calling explicito en la informacion disponible.

## Casos de uso

- Generacion de codigo en produccion: con un 94,5 % de pass@1 en HumanEval y 162-167 tok/s en CUDA, es adecuado para autocompletado y generacion de funciones en IDE o pipelines, servido via API compatible con OpenAI.
- Asistente de programacion en local: el servidor expone `http://127.0.0.1:8080/v1` para conectar cualquier editor o agente que use la API de OpenAI, sin dependencia de la nube.
- Procesamiento de repositorios y documentos largos: la ventana de 32K tokens y la lectura de prompts a 4 419-5 252 tok/s en CUDA permiten analizar ficheros grandes o conversaciones multi-turno extensas.
- Despliegue en estaciones de trabajo con GPU de consumo: en tarjetas de 12-32 GB (CUDA) o 24-64 GB (Vulkan) con 128 GB de RAM, parte de los expertos queda en RAM y el modelo sigue siendo utilizable a 78-81 tok/s en una tarjeta de 24 GB.
- Sustitucion de backend segun hardware: el mismo fichero CMF sirve para CUDA y Vulkan, lo que simplifica entornos mixtos con tarjetas NVIDIA y no NVIDIA.
- Atencion tecnica multilinguee en ingles, ruso y chino: el modelo cubre los tres idiomas declarados para conversaciones de soporte o documentacion.
- Experimentacion e investigacion en inferencia MoE: el empaquetado CMF y el motor cortiq sirven para estudiar routing de expertos, offload a RAM y decodificacion especulativa en hardware modesto.

## Benchmarks y rendimiento

Datos publicados en la model card (una RTX PRO 6000 de 96 GB, backend CUDA, greedy, thinking off, tokens draft activados, media de dos ejecuciones):

| Metrica | Resultado |
|---|---|
| HumanEval pass@1 (164 tareas, thinking off) | 94,5 % |
| Generacion de codigo, prompt 1K (CUDA) | 175 tok/s |
| Generacion de codigo, prompt 4K (CUDA) | 167 tok/s |
| Generacion de codigo, prompt 16K (CUDA) | 163 tok/s |
| Lectura de prompt, 1K (CUDA) | 3 590 tok/s |
| Lectura de prompt, 4K (CUDA) | 5 252 tok/s |
| Lectura de prompt, 16K (CUDA) | 4 758 tok/s |
| Generacion de codigo (Vulkan) | 107-113 tok/s |
| Lectura de prompt (Vulkan) | 611 tok/s |
| Generacion de codigo, tarjeta de 24 GB (CUDA) | 78-81 tok/s |
| Lectura de prompt, tarjeta de 24 GB (CUDA) | 1 838-1 855 tok/s |

No se han publicado resultados de MMLU, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en inferencia: 60,2 GB en uso con contexto de 32K en CUDA sobre una tarjeta de 96 GB; el modelo completo cabe en tarjetas NVIDIA de 80 GB o mas.
- Tarjetas NVIDIA de 12 GB a 80 GB: modo CUDA con parte de los expertos en RAM; requiere 128 GB de RAM de sistema.
- Vulkan: tarjetas de 64 GB o mas para el modelo completo; de 24 GB a 64 GB con parte de los expertos en RAM y 128 GB de RAM de sistema.
- RAM del sistema: 96 GB en CUDA (la tabla n-gram de 52 GB queda fijada en RAM); 128 GB en configuraciones con tarjeta pequena.
- CPU: x86-64 con 8 hilos o mas.
- Disco: 111 GB.
- Sistema operativo: Linux. Driver NVIDIA 570 o posterior para CUDA; librerias `libnvrtc` y `libcublas` de CUDA 12.8+ en `LD_LIBRARY_PATH`.
- Despliegue: exclusivamente mediante cortiq 0.8.95+ (`cargo install cortiq-cli --locked --features cuda` o binarios precompilados para Vulkan). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 162-167 tok/s de generacion y 4 419-5 252 tok/s de lectura de prompt en CUDA sobre RTX PRO 6000; 107-113 tok/s en Vulkan; 78-81 tok/s en tarjeta de 24 GB con CUDA.
- Una sola peticion simultanea a plena velocidad (`CMF_SERVE_SLOTS=1`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Edge0-145B-cmf (este) | 145B (MoE, 512 expertos) | 32 768 | NVFP4 | edge0-community-model-1.0 | Motor cortiq, backends CUDA y Vulkan, HumanEval 94,5 % |
| Edge0-120B-cmf | 120B | no disponible | CMF | no disponible | Version menor recomendada por el autor para tarjetas pequenas |
| Edge0-145B-NVFP4 (base) | 145B (MoE) | no disponible | NVFP4 | no disponible | Checkpoint original de Edge0; este modelo lo empaqueta |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Modelo de origen sobre el que se construye Edge0-145B |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia `edge0-community-model-1.0`: es una licencia comunitaria propia, no una licencia de codigo abierto OSI; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- Idiomas limitados a ingles, ruso y chino; el rendimiento en castellano no esta documentado.
- Contexto maximo por defecto de 32 768 tokens, configurable con `CMF_MAX_SEQ`; no se documenta soporte para contextos mayores.
- Dependencia exclusiva del motor cortiq: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad del despliegue.
- Requisitos de memoria muy altos incluso en configuraciones con offload: 96-128 GB de RAM de sistema ademas de la VRAM.
- Una sola ranura de servicio (`CMF_SERVE_SLOTS=1`) a plena velocidad; no se documenta batching concurrente.
- Riesgo de alucionacion y sesgos: no se publica informacion sobre evaluaciones de sesgo, seguridad o tasas de alucionacion.
- El benchmark de HumanEval se midio con thinking desactivado y sobre 164 tareas; no hay datos de otros dominios (matematicas, razonamiento general) que permitan calibrar el rendimiento fuera de codigo.
- Modelo con 0 descargas y 1 like en el momento de la consulta: ecosistema y validacion externa muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Edge0-145B-cmf
- Modelo base: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Modelo de origen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Version menor recomendada: https://huggingface.co/infosave/Edge0-120B-cmf
