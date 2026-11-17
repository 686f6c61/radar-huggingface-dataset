# Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision-v2

## Resumen

Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision-v2 es un paquete de despliegue precompilado del modelo base thinkingmachines/Inkling-2-Small, reexportado en formato NVFP4 con compresion de escalas CSF y empaquetado con el runtime propietario Hyperflare (FLARE) por el autor Jon-Nielsen. No se trata de un checkpoint convencional cargable con Transformers, vLLM, SGLang o llama.cpp: el repositorio incluye un binario `flare-linux-x86_64` que contiene los kernels y grafos de ejecucion ya compilados para cuatro GPU NVIDIA SM120 (clase RTX PRO 6000 Blackwell, 96 GB cada una), de modo que nada se compila ni se ajusta en tiempo de servicio.

El paquete esta optimizado para inferencia de largo contexto (1.048.576 tokens por peticion) con concurrencia de 8 peticiones activas, decodificacion especulativa mediante MTP con anchura de borrador 7 y soporte de entradas de imagen. Expone una API compatible con OpenAI (`/v1/chat/completions`) y con Anthropic (`/v1/messages`), con streaming, cache de prefijo, tool calling mediante parser TML JSON y razonamiento configurable via `reasoning_effort`.

Es relevante porque demuestra un modelo de distribucion alternativo para modelos grandes: en lugar de pesos en safetensors estandar, se entrega un artefacto firmado con Ed25519, verificable por SHA256, con pesos fragmentados por rango (TP4) y metadatos de despliegue. El coste es una dependencia total del runner incluido y un requisito de hardware muy especifico (cuatro GPU SM120 con acceso peer sobre PCIe y CUDA 13.2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Inkling-2-Small); runtime Hyperflare con kernels y grafos precompilados |
| Parametros totales | 49.312.886 (segun safetensors del repo; el paquete completo ocupa 326,5 GiB por la compresion NVFP4/CSF y los datos de kernels) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens por peticion |
| Tipos de cuantizacion | NVFP4 con compresion de escalas CSF (8-bit declarado en tags); no se ofrecen otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | LIL License 1.0 (incorpora Apache-2.0); etiquetada como `other` en Hugging Face |
| Formato de pesos | safetensors firmado (manifiesto) + shards por rango en `weights/tp4/rank-0…3/` con datos de kernels y grafos; no compatible con GGUF ni safetensors estandar |

## Arquitectura y entrenamiento

El modelo base es thinkingmachines/Inkling-2-Small, del que no se proporcionan en esta informacion detalles sobre composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF o DPO. Lo que si se documenta es la capa de empaquetado: el checkpoint se reexporta a NVFP4 con compresion de escalas CSF, se particiona en cuatro rangos de tensor parallel (TP4) y se compila con FLARE Ignition en kernels y grafos de ejecucion especificos para SM120. El resultado es un artefacto de 230 archivos y 326,5 GiB cuyo `model.safetensors` (49,3 MB) actua como manifiesto de despliegue y contrato de servicio, no como contenedor de pesos.

Las innovaciones tecnicas destacables son la decodificacion especulativa MTP con anchura de borrador configurable de 0 a 7 (anchura 0 desactiva la especulacion y mide aproximadamente un 6 % mas lento en decodificacion a 256 tokens y un 24 % a 1024), el cache KV paginado con paginas de 128 tokens y extension de pagina de 155.740, y una capacidad KV total de 19.934.720 tokens, equivalente a unos 19 contextos completos de 1M distribuidos entre los cuatro rangos. El prefill se procesa en fragmentos de 8.192 tokens. Los grafos estan compilados con anchuras {1, 8} y verificacion adaptativa.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento controlable mediante `reasoning_effort` (`minimal`…`max`); en esta compilacion no existe interruptor para desactivar el razonamiento por completo.
- Entradas de imagen habilitadas (vision) ademas de texto.
- Tool calling y function calling mediante parser TML JSON, integrado en el endpoint compatible con OpenAI.
- Soporte de agentes y razonamiento multi-paso a traves de la API de chat con streaming y cabeceras de contenido de razonamiento (`<|content_thinking|>`).
- Contexto largo de hasta 1.048.576 tokens por peticion, adecuado para documentos extensos o historiales de conversacion muy largos.
- Cache de prefijo para reutilizar computo en prompts repetidos.
- Streaming con deltas de razonamiento (clave `reasoning`) y chunk final de uso mediante `stream_options.include_usage`.
- API dual: `/v1/chat/completions` estilo OpenAI y `/v1/messages` estilo Anthropic.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: el modelo puede ingerir hasta 1M tokens en una sola peticion, lo que permite procesar libros tecnicos, expedientes completos o bases de codigo sin fragmentacion, apoyandose en la cache de prefijo para consultas repetidas sobre el mismo documento.
- Asistentes de codigo con acceso a herramientas: el soporte de tool calling via parser TML JSON y la API compatible con OpenAI permiten integrarlo en pipelines de CI/CD o en IDE que ya hablan el protocolo de OpenAI, con el modelo invocando funciones de compilacion, test o busqueda.
- Atencion al cliente multi-turno: la ventana de 1M tokens y la concurrencia de 8 peticiones activas permiten mantener historiales largos por sesion sin truncar, con streaming para respuestas percibidas como rapidas.
- Procesamiento de imagenes en flujos documentales: con vision habilitada, puede extraer informacion de capturas, diagramas o documentos escaneados combinados con texto en la misma peticion.
- Razonamiento agentico multi-paso: el control de `reasoning_effort` y la decodificacion especulativa MTP permiten ajustar el equilibrio entre profundidad de razonamiento y latencia en tareas de planificacion o resolucion de problemas.
- Despliegue on-premise con requisitos de integridad: el paquete firmado con Ed25519, la verificacion SHA256 y el binario autocontenido facilitan auditoria y reproducibilidad en entornos regulados, aunque a cambio de un hardware muy especifico.
- Evaluacion de modelos de gran contexto en investigacion: la capacidad KV de casi 20M tokens sobre cuatro rangos permite experimentar con cargas de muchas sesiones concurrentes de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento proporcionados son relativos a la especulacion MTP: desactivarla (anchura 0) resulta aproximadamente un 6 % mas lenta en decodificacion a 256 tokens y un 24 % mas lenta a 1024 tokens. Tambien se indica que un top-k restrictivo impone un coste medible en velocidad de decodificacion.

## Requisitos de hardware

- VRAM: cuatro GPU NVIDIA SM120 con 96 GB cada una (clase RTX PRO 6000 Blackwell), con acceso peer sobre PCIe. El paquete completo ocupa 326,5 GiB en disco y requiere aproximadamente 330 GB libres.
- GPU recomendadas: exclusivamente SM120 de 96 GB; no hay soporte documentado para A100, H100 ni RTX 4090.
- Consumer GPU: no cabe en ninguna GPU de consumo; el requisito minimo es un conjunto de cuatro aceleradores profesionales Blackwell.
- Sistema: Linux x86-64 con glibc >= 2.39, driver NVIDIA con soporte CUDA 13.2 (compilacion de referencia 615.71) y `ulimit -l unlimited`.
- Opciones de despliegue: unicamente el runner incluido `runner/flare-linux-x86_64` o su `Dockerfile` (base `debian:trixie-slim`, con `--gpus '"device=0,1,2,3"'`, `--ulimit memlock=-1` y `--security-opt seccomp=unconfined`). No es cargable con vLLM, SGLang, llama.cpp, Ollama ni Transformers.
- Latencia y throughput: no disponibles; solo se documenta el impacto relativo de desactivar la especulacion MTP (6 % a 256 tokens, 24 % a 1024).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, este paquete se diferencia de un checkpoint convencional del mismo modelo base en que sustituye el formato safetensors estandar por un artefacto compilado y firmado, y en que restringe el hardware a SM120, mientras que el modelo base thinkingmachines/Inkling-2-Small podria en principio servirse con runtimes genericos si se dispusiera de sus pesos en formato estandar.

## Limitaciones y advertencias

- Dependencia total del runner propietario: el formato no es cargable por Transformers, vLLM, SGLang ni llama.cpp; sin el binario `flare-linux-x86_64` el paquete es inutilizable.
- Hardware extremadamente restrictivo: cuatro GPU SM120 de 96 GB con CUDA 13.2 y peer access sobre PCIe; no hay camino de despliegue en hardware mas comun.
- Configuracion horneada no ajustable en tiempo de ejecucion: contexto, concurrencia, anchura de especulacion y fragmento de prefill estan fijados en el export; solo `--mtp-draft-tokens` (0-7) es seleccionable.
- El motor no valida el campo `model` de la peticion: cualquier cadena devuelve 200, lo que puede enmascarar errores de enrutamiento en clientes.
- El razonamiento no se puede desactivar en esta compilacion; si el presupuesto de generacion se consume integramente en razonamiento, `message.content` vuelve como `null` con `finish_reason: "length"`, obligando a proteger el codigo cliente.
- T=0 se acepta pero no es determinista a nivel de bit.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Sesgos y riesgo de alucinacion: no documentados en la informacion disponible; deben asumirse los del modelo base, sobre el que tampoco se aportan evaluaciones.
- Licencia LIL License 1.0 (incorpora Apache-2.0): es una licencia no estandar, por lo que conviene revisar el texto completo antes de cualquier uso comercial.
- La aprobacion del publicador `local-development` requiere aceptacion interactiva o los flags `--dangerously-approve-key` y `--dangerously-accept-publisher`, lo que introduce un paso de confianza manual en el arranque.
- El repositorio registra 0 descargas, por lo que no hay evidencia publica de validacion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision-v2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Licencia (LIL License 1.0): https://huggingface.co/Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision-v2/blob/main/LICENSE
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la informacion proporcionada.
