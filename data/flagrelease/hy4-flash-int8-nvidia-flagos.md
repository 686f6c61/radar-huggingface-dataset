# FlagRelease/Hy4-flash-INT8-nvidia-FlagOS

## Resumen
Hy4 Flash es un modelo multimodal de la familia Hunyuan de Tencent, distribuido en este repositorio por la comunidad FlagRelease (Zhongzhi FlagOS) como una build cuantizada a 8 bits (W8A8) optimizada para hardware NVIDIA. El modelo acepta entradas de texto e imagen y genera texto, y esta disenado especificamente para cargas de trabajo de oficina: busqueda profunda, procesamiento de documentos, generacion de presentaciones y Computer Use. Su arquitectura combina atencion hibrida, Latent MoE y modulos Engram, con aproximadamente 220.000 millones de parametros totales (de los cuales unos 64.000 millones son parametros Engram) y unos 12.000 millones activados por token.

El dato mas diferencial es su ventana de contexto: hasta 1 millon de tokens, con una huella de KV Cache que, segun el autor, es solo una sexta parte de la del modelo Hy4. Esto lo situa en la liga de modelos de contexto ultralargo orientados a agentes y procesamiento documental masivo. En el benchmark interno WorkIndex de Tencent Hunyuan, Hy4 Flash obtiene 42,1 frente a los 39,7 de Hy4 Preview, con un coste por tarea inferior.

Este repositorio concreto no contiene los pesos originales en precision completa, sino una imagen de contenedor FlagOS-Nvidia con pesos W8A8 (sin MTP) y un stack vLLM 0.32 / FlagGems afinado. La adaptacion multi-chip de FlagOS cubre nueve fabricantes (T-Head, NVIDIA, Huawei Ascend, Hygon, Kunlunxin, Muxi, Moore Threads, TsingMicro e Iluvatar CoreX), y en H100 reporta hasta un 35,9% mas de throughput de salida y hasta un 29,1% menos de latencia hasta el primer token frente al stack nativo de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida, Latent MoE y Engram |
| Parametros totales | 220.251.201.958 (aprox. 220 B, incluye ~64 B Engram) |
| Parametros activos | Aprox. 12 B por token |
| Longitud de contexto | 1.000.000 tokens (maximo) |
| Tipos de cuantizacion | W8A8 (8 bits pesos y activaciones), formato compressed-tensors |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |
| Modalidades | Entrada texto e imagen; salida texto |
| Tamano del repo | 288,6 GB |

## Arquitectura y entrenamiento
Hy4 Flash emplea una arquitectura hibrida que combina mecanismos de atencion (presumiblemente alternando atencion completa y variantes eficientes, aunque el detalle exacto no se especifica en la informacion disponible) con Latent MoE, un esquema de mezcla de expertos en el que la computacion se realiza en un espacio latente comprimido para reducir coste. Adicionalmente incorpora modulos Engram, un componente propietario de Tencent Hunyuan que anade aproximadamente 64.000 millones de parametros especializados, presumiblemente orientados a memoria o recuperacion de conocimiento, aunque la model card no detalla su funcionamiento interno.

El modelo activa unos 12.000 millones de parametros por token sobre un total de 220.000 millones, lo que lo convierte en un MoE de ratio de activacion bajo (en torno al 5,5%), optimizado para throughput en inferencia. La reduccion de KV Cache a una sexta parte de la del Hy4 original es una innovacion clave para sostener el contexto de 1 millon de tokens en produccion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades
- Generacion de texto y razonamiento en chino e ingles.
- Comprension de imagenes (entrada multimodal imagen + texto) con salida textual.
- Razonamiento matematico de alto nivel (Math-500: 96,2) y cientifico (GPQA Diamond: 90,86).
- Capacidades de vision evaluadas en MMBench (92,5) y MMStar (81,2).
- Procesamiento de contexto ultralargo de hasta 1 millon de tokens, apto para documentos extensos y conversaciones multi-turno prolongadas.
- Orientacion a tareas de oficina: busqueda profunda, procesamiento documental, generacion de presentaciones y Computer Use.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso
- Procesamiento de documentos masivos: con 1 millon de tokens de contexto, el modelo puede ingerir contratos, expedientes o informes completos en una sola pasada y responder preguntas sobre su contenido sin fragmentacion ni recuperacion externa.
- Generacion de presentaciones (PPT): el modelo esta disenado explicitamente para generar estructuras de presentaciones a partir de documentos o instrucciones, lo que lo hace adecuado para automatizar la produccion de material de oficina.
- Busqueda profunda (deep search): su capacidad de razonamiento (GPQA 90,86) y su contexto largo permiten encadenar busquedas, sintetizar fuentes multiples y producir informes razonados.
- Computer Use y automatizacion de escritorio: el modelo puede interpretar capturas de pantalla (entrada de imagen) y generar acciones textuales para agentes que operan interfaces graficas.
- Analisis de documentos con imagenes: al aceptar entrada visual, puede extraer informacion de facturas escaneadas, formularios o graficos dentro de un flujo documental.
- Atencion al cliente con contexto largo: la ventana de 1 M tokens permite mantener historiales de conversacion extensos y bases de conocimiento embebidas en el prompt, reduciendo la necesidad de RAG complejo.
- Despliegue en infraestructura NVIDIA existente: la imagen FlagOS-Nvidia con vLLM 0.32 y FlagGems permite poner el modelo en produccion en minutos sobre 8x H100, con throughput medido de hasta 2.093 tok/s de salida en cargas 4K/1K.

## Benchmarks y rendimiento

Calidad (comparativa entre el stack nativo NVIDIA y la build FlagOS):

| Metrica | Hy4-flash-Nvidia-Origin | Hy4-flash-Nvidia-FlagOS |
|---|---|---|
| Math-500 | 96 | 96,2 |
| GPQA Diamond | 92,42 | 90,86 |
| MMBench | 92,6 | 92,5 |
| MMStar | 80,93 | 81,2 |

Rendimiento de inferencia en 8x NVIDIA H100 (build FlagOS, W8A8, sin MTP):

| Entrada/Salida | TTFT medio (ms) | TTFT P99 (ms) | Salida (tok/s) | Total (tok/s) | TPOT medio (ms) |
|---|---|---|---|---|---|
| 4K/1K | 5.764,6 | 10.753,0 | 2.093,5 | 10.467,6 | 24,77 |
| 16K/1K | 12.087,5 | 43.197,7 | 1.032,2 | 17.546,8 | 49,69 |
| 32K/1K | 24.274,1 | 88.528,7 | 603,1 | 19.903,9 | 81,35 |

Benchmark interno WorkIndex: Hy4 Flash 42,1 frente a Hy4 Preview 39,7.

## Requisitos de hardware
- VRAM estimada: con 220.000 millones de parametros en W8A8, el peso del modelo ocupa del orden de 220 GB, por lo que no cabe en una sola GPU consumer ni en una sola GPU de datacenter de 80 GB.
- Configuracion validada: 8x NVIDIA H100 (640 GB de VRAM agregada) con driver 580.126.20, Ubuntu 24.04 y Docker 20.10.5 o superior.
- GPU consumer: no viable en RTX 4090 (24 GB) ni en configuraciones multi-GPU consumer convencionales por el volumen de pesos y el soporte de cuantizacion W8A8 en compressed-tensors.
- Opciones de despliegue: imagen Docker FlagOS-Nvidia con vLLM 0.32.0, vllm-plugin-FL 0.5.0 y FlagGems 5.4.1; endpoint compatible con la API de OpenAI en el puerto 18080.
- Throughput medido: hasta 2.093 tok/s de salida y 10.467 tok/s totales en cargas 4K/1K; el throughput de salida cae a 603 tok/s con entradas de 32K.
- Latencia: TTFT medio de 5,8 s en 4K/1K, 12,1 s en 16K/1K y 24,3 s en 32K/1K; TPOT de 24,8 ms a 81,4 ms segun longitud de entrada.
- Otros aceleradores: FlagOS cubre adaptaciones para T-Head, Huawei Ascend, Hygon, Kunlunxin, Muxi, Moore Threads, TsingMicro e Iluvatar CoreX, aunque este repositorio concreto es la build NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Hy4 Flash (este repo) | 220 B | ~12 B | 1 M | No disponible | Multimodal, W8A8, orientado a oficina |
| Hy4 Preview | No disponible | No disponible | No disponible | No disponible | WorkIndex 39,7 frente a 42,1 de Flash |
| Hy4 | No disponible | No disponible | No disponible | No disponible | KV Cache 6x mayor que Flash |

No se dispone de datos suficientes en la informacion proporcionada para comparar con modelos de otros fabricantes en parametros, contexto y rendimiento de forma rigurosa.

## Limitaciones y advertencias
- Idiomas: solo chino e ingles; no se garantiza un rendimiento adecuado en castellano ni en otras lenguas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar los terminos antes de desplegar en produccion.
- Pesos no incluidos: la model card indica que es una release solo de imagen y que los pesos W8A8 sin MTP no se suben con el repositorio; es necesario apuntar `HY4_WEIGHTS_DIR` a un checkpoint autorizado.
- Cuantizacion W8A8: la precision de 8 bits puede degradar ligeramente tareas sensibles; en GPQA Diamond la build FlagOS baja de 92,42 a 90,86 frente al stack nativo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a modelos de este tamano y a tareas de busqueda profunda y sintesis documental.
- Coste de contexto largo: el TTFT crece de forma marcada con la longitud de entrada (de 5,8 s a 24,3 s entre 4K y 32K), lo que afecta a la interactividad en cargas muy largas.
- Dependencia de infraestructura: el despliegue validado requiere 8x H100 y una imagen Docker especifica con versiones fijadas de vLLM, FlagGems y FlagTree; la portabilidad a otros entornos no esta garantizada en este repositorio.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion independiente por parte de la comunidad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/FlagRelease/Hy4-flash-INT8-nvidia-FlagOS
- Imagen Docker FlagOS-Nvidia: harbor.baai.ac.cn/flagrelease-public/flagrelease-nvidia-release-model_hy4-flash-testing-w8a8-no-mtp-tree_0.7.0-gems_5.4.1.dev0.g4897cc3.hy4.2-cx_none-python_3.12.3-torch_cuda-2.13.0.cu130-pcp_cuda13.0-gpu_nvidia004-arc_amd64-driver_580.126.20:202611191716
- Descarga via ModelScope: `modelscope download --model FlagRelease/Hy4-flash-INT8-nvidia-FlagOS`
- Documentacion de Tencent Hunyuan: no disponible en la informacion proporcionada
- Paper tecnico: no disponible en la informacion proporcionada
