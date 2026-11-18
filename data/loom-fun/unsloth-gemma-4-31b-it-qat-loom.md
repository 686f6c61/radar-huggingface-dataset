# loom-fun/unsloth-gemma-4-31B-it-qat-loom

## Resumen

`loom-fun/unsloth-gemma-4-31B-it-qat-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/gemma-4-31B-it-qat-GGUF`, concretamente el fichero `gemma-4-31B-it-qat-UD-Q4_K_XL.gguf`. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado que permite servir el modelo Gemma 4 31B instruct con cuantizacion QAT (quantization-aware training) sobre una GPU AMD Radeon AI PRO R9700 mediante el runtime Loom (`hrx-loom`), parte del ecosistema ROCm.

El modelo subyacente es Gemma 4 31B en variante instruct, con cuantizacion consciente del entrenamiento (QAT) publicada por Unsloth en formato GGUF. El paquete incluye un preset `chat-r9700` que dimensiona el pool de memoria para servir hasta 10.240 tokens por peticion en los 32 GB de la R9700, aunque el contexto nativo del modelo es de 262.144 tokens. La relevancia actual del paquete radica en que ofrece una via de despliegue medida y comparada contra llama.cpp (ROCm y Vulkan) sobre hardware AMD de consumo profesional, un nicho con menos herramientas maduras que el ecosistema NVIDIA.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0.0 GB reportado por Hugging Face (los pesos se referencian, no se duplican necesariamente) y licencia Apache 2.0. La model card es fundamentalmente una guia de despliegue y un informe de rendimiento, no una ficha tecnica del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 31B; arquitectura del transformer no detallada en la informacion) |
| Parametros totales | 31B (segun el identificador del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; 10.240 tokens por peticion con el preset `chat-r9700` en R9700 (32 GB) |
| Tipos de cuantizacion | GGUF UD-Q4_K_XL (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como paquete Loom con `model.json` y programas `.loom`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Gemma 4 31B (tipo de atencion, capas, cabezas, uso de MoE o componentes hibridos). Lo unico confirmado es que se trata de un modelo de 31.000 millones de parametros en variante instruct, con cuantizacion QAT (quantization-aware training), lo que implica que el modelo fue entrenado teniendo en cuenta la cuantizacion para reducir la perdida de calidad respecto a una cuantizacion post-entrenamiento convencional. El checkpoint GGUF lo publica Unsloth y este paquete lo consume sin modificarlo.

El paquete Loom en si no entrena ni modifica pesos: genera programas `.loom` y una tarjeta `model.json` con presets de servicio (pool de memoria fijo, precarga de parametros, espera activa de completaciones GPU). La model card indica explicitamente que el GGUF no incluye cabecera MTP (multi-token prediction) y que no se ha publicado un drafter para este modelo exacto, por lo que la decodificacion especulativa no esta disponible en las mediciones. No se aportan datos sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto conversacional en modo instruct, con plantilla de chat y parametro `enable_thinking` para activar o desactivar el modo de razonamiento opcional.
- Razonamiento opcional (thinking mode) controlable por peticion mediante `chat_template_kwargs`.
- Servicio de chat multi-turno a traves de una API compatible con `/v1/chat/completions` (formato OpenAI).
- Capacidad de contexto largo: hasta 262.144 tokens nativos, limitado a 10.240 tokens por peticion en el preset para R9700.
- Soporte de multiples peticiones concurrentes: la model card reporta una prueba con 4 streams paralelos y throughput agregado.
- Capacidades de codigo, matematicas, vision o tool calling: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat self-hosted en hardware AMD: el paquete permite levantar un endpoint compatible con la API de OpenAI en una Radeon AI PRO R9700 con `loom-serve`, util para equipos que ya operan GPUs AMD y quieren evitar la dependencia de CUDA.
- Asistente conversacional con prompts de hasta 10.240 tokens: el preset `chat-r9700` dimensiona el pool de memoria para servir peticiones de ese tamano, adecuado para conversaciones con documentacion adjunta moderada.
- Despliegue en laboratorio o evaluacion de modelos: al ser un paquete reproducible con instrucciones de `pipx` y `loom-fetch`, sirve para comparar el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF y el mismo hardware.
- Procesamiento por lotes de prompts cortos: con 32,3 tok/s de decodificacion en prompt corto y 893,5 tok/s de prefill en documentos de 1k tokens, es viable para generacion de respuestas sobre entradas breves en entornos de un solo usuario.
- Benchmarking de infraestructura AMD: las mediciones incluidas (decode, prefill, 4 streams) permiten validar configuraciones de servidor ROCm frente a Vulkan en la misma GPU.
- Prototipado de aplicaciones con modo thinking: el parametro `enable_thinking` permite alternar entre respuestas rapidas y respuestas con razonamiento segun la carga, sin cambiar de modelo.
- Inferencia con contexto largo fuera del preset: la ventana nativa de 262.144 tokens es aprovechable con otras configuraciones de memoria, aunque el paquete no incluye presets medidos para ello en R9700.

## Benchmarks y rendimiento

La model card incluye mediciones propias del paquete frente a llama.cpp en una AMD Radeon AI PRO R9700S (gfx1201), con el mismo GGUF, mismas prompts y mismas condiciones. Valores en tokens por segundo, mediana de 3 sesiones (9 para 4 streams):

| Metrica | llama.cpp ROCm | llama.cpp Vulkan | Loom | Margen vs mejor llama.cpp | Roofline | Loom % del roofline |
|---|---|---|---|---|---|---|
| Decode, prompt corto | 29,3 | 31,0 | 32,3 | +4 % | 35,5 | 91 % |
| Decode, contexto 2k | 27,4 | 29,4 | 30,3 | +3 % | 33,5 | 90 % |
| Decode, contexto 32k | no cabe | no cabe | no cabe | no cabe | no cabe | no cabe |
| Prefill, documento 1k | 938,4 | 677,0 | 893,5 | -5 % | 3583,4 | 25 % |
| Prefill, documento 2k | 1017,2 | 775,6 | 908,7 | -11 % | 3515,9 | 26 % |
| Prefill, documento 8k | 995,7 | 946,1 | 883,1 | -11 % | 3403,7 | 26 % |
| Prefill, documento 16k | no cabe | no cabe | no cabe | no cabe | no cabe | no cabe |
| Prefill, documento 32k | no cabe | no cabe | no cabe | no cabe | no cabe | no cabe |
| 4 streams, decode agregado | 99,9 | 88,7 | 59,0 | -41 % | 126,2 | 47 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a | n/a | n/a | n/a |

Metodologia: llama.cpp ROCm `llamacpp-rocm/b1375` y llama.cpp Vulkan `llamacpp-vulkan/b12211`, argumentos `-ngl 99 -cram 0 -c 10240 -np 1` (un slot) y variantes documentadas para 4 streams; Loom servido con espera activa (`completion_spin_ns=4294967295`), `--pool_backing=fixed` y sin `--parameter_mode=preload` salvo en las filas indicadas. Medicion el 2026-11-18 en runners efimeros de AMD DevLab. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el preset `chat-r9700` esta dimensionado para los 32 GB de la AMD Radeon AI PRO R9700; el paquete no documenta requisitos para otras capacidades.
- GPU objetivo: AMD Radeon AI PRO R9700 (gfx1201). La model card indica que es una release cualificada exclusivamente para R9700.
- AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151): no es objetivo de este paquete y no fue medido; la ejecucion de cualificacion excedio el presupuesto de 150 minutos y se cancelo sin artefacto final verificado.
- GPUs NVIDIA (A100, H100, RTX 4090): no disponibles en la informacion; el runtime Loom del paquete esta orientado a AMD.
- Opciones de despliegue: `hrx-loom` 0.2.0 via `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. Tambien se compara contra llama.cpp ROCm y llama.cpp Vulkan con el mismo GGUF.
- Throughput medido en R9700: 32,3 tok/s de decodificacion en prompt corto, 30,3 tok/s con 2k de contexto, 893,5 tok/s de prefill en documento de 1k, 59,0 tok/s agregados con 4 streams.
- Latencia: no disponible de forma explicita; puede derivarse de los valores de throughput anteriores.
- Contexto por peticion en R9700: 10.240 tokens con el preset incluido; las filas de 16k y 32k no caben con esa configuracion en ambas herramientas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-fun/unsloth-gemma-4-31B-it-qat-loom` | 31B | 262.144 nativos; 10.240 en preset R9700 | Apache 2.0 | GGUF Q4_K_XL empaquetado para Loom | Paquete de despliegue para AMD R9700; 32,3 tok/s decode en R9700 |
| `unsloth/gemma-4-31B-it-qat-GGUF` (modelo base) | 31B | 262.144 | Apache 2.0 (segun el paquete) | GGUF | Checkpoint original sin empaquetar; sirve en llama.cpp y otros runtimes GGUF |
| llama.cpp (ROCm / Vulkan) sirviendo el mismo GGUF | 31B | 10.240 en la configuracion medida | n/a (herramienta) | GGUF | 29,3 / 31,0 tok/s decode; 99,9 / 88,7 tok/s agregados con 4 streams |

No se dispone de datos de otros modelos comparables de 31B en la informacion proporcionada.

## Limitaciones y advertencias

- Paquete especifico de hardware: cualificado unicamente para AMD Radeon AI PRO R9700 (gfx1201); Strix Halo no esta soportado ni medido en esta release.
- Contexto efectivo reducido: el preset incluido limita a 10.240 tokens por peticion pese a los 262.144 nativos; las filas de 16k y 32k no caben en 32 GB con la configuracion medida.
- Rendimiento inferior en concurrencia: con 4 streams el decode agregado cae un 41 % frente al mejor llama.cpp (59,0 vs 99,9 tok/s).
- Prefill por debajo de llama.cpp ROCm: entre un 5 % y un 11 % menos en documentos de 1k a 8k tokens, y solo un 25-26 % del roofline teorico.
- Sin decodificacion especulativa: el GGUF no incluye cabecera MTP y no hay drafter publicado para este modelo exacto.
- Sin datos de sesgos, alucinacion ni calidad multilingue del modelo base en la informacion disponible.
- Licencia Apache 2.0 declarada en el paquete; conviene verificar los terminos del modelo base Gemma 4 antes de uso comercial, ya que la model card no los reproduce.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, y fecha de creacion en 2026-11-18; no hay evidencia de uso en produccion.
- Los enlaces de la busqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla y marca de ropa) y no aportan informacion tecnica sobre este paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/unsloth-gemma-4-31B-it-qat-loom
- Modelo base GGUF: https://huggingface.co/unsloth/gemma-4-31B-it-qat-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
