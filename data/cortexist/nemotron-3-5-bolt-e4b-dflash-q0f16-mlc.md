# cortexist/Nemotron-3.5-Bolt-E4B-DFlash-q0f16-MLC

## Resumen

Nemotron-3.5-Bolt-E4B-DFlash-q0f16-MLC es un paquete de pesos en formato MLC-LLM que contiene la cabeza borrador (draft head) DFlash en precision FP16, extraida y convertida a partir del GGUF F16 del modelo NVIDIA Nemotron-3.5-Bolt-E4B-4GB-DFlash. No se trata de un modelo de lenguaje autonomo, sino de un asistente de decodificacion especulativa que debe emparejarse con el modelo objetivo Nemotron correspondiente y con sus exportaciones de caracteristicas. El autor de la conversion es el usuario cortexist, y el modelo base lo desarrolla NVIDIA.

El paquete esta pensado para ejecutarse sobre el fork de MLC-LLM del mismo autor (cortexist/mlc-llm), que aporta las definiciones de modelo, el pipeline de conversion y el runtime necesario. Incluye librerias precompiladas para Linux aarch64 sobre Jetson AGX Xavier (Volta sm_72, JetPack 5 / CUDA 11.4), por lo que el despliegue esta fuertemente orientado a ese hardware concreto. La capacidad de contexto cacheada es de 16.384 tokens.

Su relevancia es acotada pero tecnica: permite acelerar la generacion mediante decodificacion especulativa con una cabeza borrador en FP16 sobre un dispositivo de borde (Jetson), un escenario donde el ancho de banda de memoria es limitado y las tecnicas de especulacion aportan ganancias de throughput. El repositorio ocupa 0,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza borrador (draft head) DFlash para decodificacion especulativa; asistente dependiente del modelo objetivo Nemotron |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (capacidad cacheada de la configuracion DFlash) |
| Tipos de cuantizacion | q0f16 (FP16) para la cabeza borrador; existe una variante relacionada q4f16_1 del modelo objetivo |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiqueta `license: other` con `license_name: openmdw-1.1`) |
| Formato de pesos | MLC-LLM (shards de parametros convertidos, `tensor-cache.json`, tokenizer y `mlc-chat-config.json`) |

## Arquitectura y entrenamiento

Este paquete no entrena ningun modelo nuevo: es una conversion de un checkpoint existente. Concretamente, se extrae la cabeza borrador DFlash en FP16 desde el GGUF F16 de NVIDIA y se convierte al formato de runtime de MLC-LLM mediante el pipeline del fork de cortexist. El resultado son shards de parametros convertidos, metadatos de conversion (`tensor-cache.json`, con `tensor-cache-b16.json` conservado como metadato original) y ficheros de tokenizer y configuracion de chat.

La funcion tecnica de la cabeza DFlash es la decodificacion especulativa: propone tokens candidatos que el modelo objetivo Nemotron verifica en paralelo, reduciendo el numero de pasos de decodificacion secuencial. El paquete incluye librerias precompiladas para Linux aarch64 sobre Jetson AGX Xavier (Volta sm_72) con JetPack 5 / CUDA 11.4, dependientes del runtime TVM/MLC del fork. La linea base del codigo fuente de la implementacion MTP publicada es el commit `fd3a5891b8a78f7d50829d0919cbb27e40c26e28`. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Asistencia a la decodificacion especulativa: genera tokens candidatos para que el modelo objetivo Nemotron los verifique, acelerando la inferencia.
- Generacion de texto y conversacion: heredadas del modelo objetivo Nemotron con el que se empareja; la cabeza por si sola no genera texto de forma autonoma.
- Integracion con el runtime MLC-LLM del fork: definiciones de modelo, conversion, compilacion y serving mediante `cortexist/mlc-llm`.
- Despliegue en hardware de borde: librerias precompiladas para Jetson AGX Xavier (sm_72) con JetPack 5 / CUDA 11.4.
- Capacidad de contexto de 16.384 tokens en la configuracion DFlash cacheada.
- Soporte de tool calling, agentes, razonamiento multi-paso, vision o audio: no disponible en la informacion proporcionada para este paquete.

## Casos de uso

- Aceleracion de inferencia en Jetson AGX Xavier: desplegar la cabeza DFlash junto con el modelo objetivo Nemotron en un dispositivo Volta sm_72 para reducir la latencia de decodificacion mediante especulacion, aprovechando las librerias precompiladas incluidas.
- Prototipado de decodificacion especulativa en el borde: usar el paquete como referencia reproducible para medir ganancias de throughput en hardware con ancho de banda de memoria restringido.
- Servicio de chat de baja latencia en dispositivos embebidos: combinar la cabeza con el objetivo Nemotron para conversaciones multi-turno dentro de la ventana de 16.384 tokens.
- Evaluacion de pipelines MLC-LLM personalizados: validar el flujo de conversion y serving del fork de cortexist con pesos ya convertidos y checksums verificables en `manifest.json`.
- Reproducibilidad de conversiones: emplear `tensor-cache.json` y `manifest.json` (tamanos y SHA-256) para auditar la integridad de la conversion en entornos de investigacion.
- Integracion en pipelines de generacion de texto sobre aarch64: usar los shards y la configuracion de chat como base para montar un servidor HTTP propio, ya que los pesos por si solos no incluyen servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion se aplica solo a las condiciones registradas y remite al fork para las condiciones de benchmark y limitaciones conocidas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 0,8 GB y la cabeza esta en FP16, por lo que su huella es reducida frente al modelo objetivo.
- GPU objetivo: Jetson AGX Xavier (Volta sm_72) con JetPack 5 / CUDA 11.4, unico hardware para el que se incluyen librerias precompiladas.
- Otras GPU: requieren recompilacion desde el fork; las librerias incluidas no son portables a GPU, sistemas operativos o ABI de runtime arbitrarios.
- GPU de consumo (RTX 4090, etc.): no cualificadas por el autor; seria necesario recompilar y validar.
- Despliegue: runtime MLC-LLM del fork `cortexist/mlc-llm`; los pesos no incluyen servidor HTTP, que debe aportarse por separado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-DFlash-q0f16-MLC (este) | Cabeza borrador DFlash FP16 para MLC-LLM | 16.384 tokens | MLC-LLM | openmdw-1.1 | Hugging Face, 0 descargas |
| Nemotron-3.5-Bolt-E4B-q4f16_1-MLC | Modelo objetivo Nemotron cuantizado q4f16_1 para MLC-LLM | no disponible | MLC-LLM | no disponible | Hugging Face (relacionado, mismo autor) |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash | Checkpoint original de NVIDIA con cabeza DFlash | no disponible | safetensors/GGUF (upstream) | no disponible | Hugging Face (NVIDIA) |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo Nemotron correspondiente y sus exportaciones de caracteristicas; no puede usarse por si solo para generar texto.
- Runtime no estandar: requiere el fork `cortexist/mlc-llm`; el MLC-LLM upstream no esta cualificado para estos paquetes.
- Portabilidad muy limitada: las librerias incluidas son solo para Linux aarch64, Jetson AGX Xavier (sm_72), JetPack 5 / CUDA 11.4; otros dispositivos exigen recompilacion.
- La capacidad de contexto de 16.384 tokens es un limite de configuracion, no una garantia de calidad ni de estabilidad en contextos largos.
- La evaluacion solo es valida bajo las condiciones registradas por el autor; no hay benchmarks publicados en la informacion disponible.
- Riesgo de alucinacion y sesgos: dependen del modelo objetivo Nemotron; no se documentan en este paquete.
- Licencia openmdw-1.1: deben consultarse los terminos en el enlace de licencia antes de un uso comercial; se conservan los terminos y atribuciones originales en los ficheros de licencia y aviso.
- Sin traccion registrada (0 descargas, 0 likes) y creado en 2026-11-07: ecosistema minimo, sin validacion externa conocida.
- Los pesos no incluyen servidor HTTP; es necesario montar el serving con el fork.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cortexist/Nemotron-3.5-Bolt-E4B-DFlash-q0f16-MLC
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Modelo relacionado (objetivo cuantizado): https://huggingface.co/cortexist/Nemotron-3.5-Bolt-E4B-q4f16_1-MLC
- Fork de MLC-LLM requerido: https://github.com/cortexist/mlc-llm
- README del fork: https://github.com/cortexist/mlc-llm#readme
- Guia de despliegue en Xavier: https://github.com/cortexist/mlc-llm/blob/main/deploy/xavier/README.md
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
