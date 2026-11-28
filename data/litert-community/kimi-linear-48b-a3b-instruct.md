# litert-community/Kimi-Linear-48B-A3B-Instruct

## Resumen

Kimi-Linear-48B-A3B-Instruct es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado originalmente por Moonshot AI, publicado bajo licencia MIT. Esta ficha concreta corresponde a la conversion realizada por la comunidad litert-community al formato LiteRT-LM, el runtime de inferencia de Google AI Edge orientado a ejecucion local en dispositivos. El modelo base emplea una arquitectura hibrida que combina 20 capas de Kimi Delta Attention (atencion lineal recurrente) con 7 capas de Multi-head Latent Attention (MLA), sumando 27 capas en total.

El modelo cuenta con 48 mil millones de parametros totales, de los cuales solo 3 mil millones estan activos por token gracias a su mezcla de 256 expertos (8 activos por token mas un experto compartido). Esta relacion de activacion lo hace especialmente atractivo para despliegue en hardware con memoria limitada, ya que el coste computacional por token es muy inferior al de un modelo denso del mismo tamano. La version convertida a LiteRT-LM restringe la ventana de contexto a 4096 tokens, muy lejos del millon de tokens que soporta el modelo original.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo MoE de 48B en un solo equipo de escritorio con cuantizacion int8, alcanzando 61 tok/s de decodificacion en GPU WebGPU sobre un Apple M4 Max. No obstante, los ficheros pesan entre 50,5 y 55,3 GB, por lo que no caben en un telefono y requieren estaciones de trabajo con memoria abundante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE: 20 capas Kimi Delta Attention + 7 capas MLA (Multi-head Latent Attention) |
| Parametros totales | 48 mil millones (48B) |
| Parametros activos | 3 mil millones (3B) por token (8 de 256 expertos + 1 experto compartido) |
| Longitud de contexto | 4096 tokens en esta conversion LiteRT-LM (el modelo original soporta hasta 1M) |
| Tipos de cuantizacion | int8 por canal en todas las capas lineales (tabla de tokens en fp32); variante mixta con expertos int8 y resto fp32 |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM) |
| Tamano de ficheros | 50,50 GB (int8) y 55,29 GB (mixto int8 CPU) |
| Runtime | LiteRT-LM (compilado desde fuente; versiones 0.19.1 y 0.19.2 de PyPI no ejecutan estos ficheros) |
| Modelo base | moonshotai/Kimi-Linear-48B-A3B-Instruct |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer hibrido que sustituye la mayoria de capas de atencion estandar por Kimi Delta Attention, un mecanismo de atencion lineal con estado recurrente que reduce el coste computacional y de memoria del contexto. De las 27 capas totales, 20 son Kimi Delta Attention y 7 son MLA. La capa MoE intercala 256 expertos con enrutamiento de 8 expertos por token mas un experto compartido siempre activo, lo que da lugar a los 3B parametros activos sobre los 48B totales.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La model card de esta conversion se centra en el proceso de conversion a LiteRT-LM, realizado con un graph writer de litert-torch (commit `67f11e8`) y compilado contra LiteRT-LM desde fuente (commit `02d7e8d8`). La innovacion tecnica destacable de esta ficha es la propia conversion: se preservan las 27 capas del modelo original, incluidos los estados recurrentes de las capas de atencion lineal, y se cuantizan las capas lineales a int8 por canal manteniendo la tabla de tokens en fp32.

## Capacidades

- Generacion de texto en ingles con soporte de conversaciones multi-turno.
- Razonamiento aritmetico basico y respuesta a preguntas (verificado con preguntas como "What is 17 + 25?").
- Razonamiento de multiples pasos mediante el estado recurrente de las capas Kimi Delta Attention.
- Capacidad de mezcla de expertos con enrutamiento dinamico por token.
- Soporte de tool calling / function calling: no verificado en esta conversion (la model card indica explicitamente que las llamadas a herramientas no se comprobaron con estos ficheros).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision o audio: no disponibles en esta conversion.
- Modo thinking explicito: no documentado en la informacion disponible.

## Casos de uso

- Inferencia local en estacion de trabajo: ejecutar el modelo en un Apple M4 Max o equipo equivalente con 64 GB o mas de memoria usando el fichero int8 en GPU WebGPU, obteniendo 61 tok/s de decodificacion sin depender de la nube. Adecuado para prototipado y experimentacion con modelos MoE de gran tamano en local.
- Asistente de codigo en local: el modelo puede generar y explicar fragmentos de codigo en ingles dentro de un contexto de 4096 tokens, integrable en editores o scripts de terminal mediante el binario `litert_lm_advanced_main`.
- Procesamiento por lotes de textos cortos: gracias a un prefill de 707,93 tok/s en GPU, resulta viable procesar lotes de documentos cortos (resumenes, clasificacion, extraccion) en pipelines offline.
- Chat multi-turno de proposito general: con el limite de una conversacion por motor (debido al estado recurrente de las capas de atencion lineal), encaja en aplicaciones de chat que crean una instancia nueva por sesion.
- Evaluacion comparativa de runtimes: util para investigadores que quieran medir la fidelidad de LiteRT-LM frente a Transformers en bf16/fp32; la model card reporta 12/12 respuestas coincidentes y 12/12 terminaciones correctas con token de parada.
- Despliegue en entornos air-gapped: al ser un fichero unico con licencia MIT y ejecucion local, permite montar asistentes de texto sin conectividad externa en equipos de escritorio con memoria suficiente.
- Pruebas de concepto de arquitecturas hibridas: sirve para estudiar el comportamiento de Kimi Delta Attention y MLA en produccion con cuantizacion int8, comparando el fichero int8 completo frente a la variante mixta solo CPU.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks academicos (MMLU, HumanEval, GSM8K). Si presenta mediciones de rendimiento de la conversion sobre Apple M4 Max (128 GB), con 1.024 tokens de prefill y 256 de decodificacion:

| Fichero | Backend | Prefill (tok/s) | Decode (tok/s) | Huella pico |
|---|---|---:|---:|---:|
| `kimi_linear_48b_a3b_int8_ekv4096.litertlm` | GPU (WebGPU) | 707,93 | 61,03 | 67 GB |
| `kimi_linear_48b_a3b_int8_ekv4096.litertlm` | CPU (XNNPACK, 12 hilos) | 134,31 | 11,98 | 6,9 GB |
| `kimi_linear_48b_a3b_mixed_int8_cpu_ekv4096.litertlm` | CPU (XNNPACK, 12 hilos) | 134,09 | 9,72 | 19 GB |

En cuanto a fidelidad respecto a Transformers (pesos bf16 calculados en fp32), con 12 preguntas y una conversacion de 3 turnos en modo greedy:

| Fichero | Backend | Mismo veredicto | Termina con token de parada | 3 turnos |
|---|---|---:|---:|---|
| int8 | GPU (WebGPU) | 12/12 | 12/12 | pasa |
| int8 | CPU (XNNPACK, 12 hilos) | 12/12 | 12/12 | pasa |
| mixto int8 CPU | CPU (XNNPACK, 12 hilos) | 12/12 | 12/12 | pasa |

## Requisitos de hardware

- VRAM/memoria estimada: el fichero int8 ocupa 50,50 GB en disco y alcanza una huella pico de 67 GB en GPU WebGPU; el fichero mixto ocupa 55,29 GB y 19 GB de huella pico en CPU. Se recomienda un equipo con al menos 64-96 GB de memoria unificada o RAM.
- GPU recomendadas: la unica medicion publicada corresponde a un Apple M4 Max (128 GB) con backend WebGPU. No se han medido GPUs NVIDIA (A100, H100, RTX 4090) ni Android GPU, Android CPU o iOS/iPhone.
- Cabe en GPU de consumo: no hay datos. Los 67 GB de huella pico en GPU superan la VRAM de una RTX 4090 (24 GB); encajaria en GPUs profesionales con 80 GB o en Apple Silicon con memoria unificada de 96 GB o mas.
- Opciones de despliegue: exclusivamente LiteRT-LM compilado desde fuente con los PRs #11192 y #11188 (que anaden soporte de SiLU en los kernels `moe`). Las versiones 0.19.1 y 0.19.2 de PyPI no ejecutan estos ficheros. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 61,03 tok/s de decodificacion y 707,93 tok/s de prefill en GPU WebGPU; 11,98 tok/s de decodificacion y 134,31 tok/s de prefill en CPU con 12 hilos.
- Requisito adicional en GPU: el binario necesita `libLiteRtWebGpuAccelerator.dylib` en el mismo directorio; sin el, el comando falla tras unos 17 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Kimi-Linear-48B-A3B-Instruct (LiteRT-LM, esta ficha) | 48B | 3B | 4096 | MIT | `.litertlm` / LiteRT-LM |
| moonshotai/Kimi-Linear-48B-A3B-Instruct (original) | 48B | 3B | hasta 1M | MIT | safetensors / Transformers |
| Modelos MoE densos comparables de 40-50B | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar la conversion LiteRT-LM con su modelo base original. La diferencia principal es la ventana de contexto (4096 frente a 1M) y el runtime (LiteRT-LM frente a Transformers). No se dispone de datos de benchmarks del modelo original en esta informacion para comparar rendimiento.

## Limitaciones y advertencias

- Contexto reducido: la conversion limita la ventana a 4096 tokens, frente al millon del modelo original; los prompts largos fallan.
- Una conversacion por motor: las capas Kimi Delta Attention mantienen estado recurrente, por lo que es necesario crear un motor nuevo para cada conversacion (issue LiteRT-LM #3165).
- Fallo en cascada en CPU: si un mensaje no cabe en el contexto, todos los mensajes posteriores de esa conversacion fallan (`Task failed with state: 7`); hay que iniciar una conversacion nueva con un motor nuevo.
- Tool calling no verificado: la model card indica que las llamadas a herramientas no se comprobaron con estos ficheros.
- Solo medido en escritorio: todas las cifras provienen de un Apple M4 Max (128 GB); no hay mediciones en Android GPU, Android CPU ni iOS/iPhone, y los ficheros no caben en la memoria de un telefono.
- Dependencia de un runtime no publicado: requiere LiteRT-LM compilado desde fuente con los PRs #11192 y #11188; las versiones de PyPI no funcionan.
- Idioma: solo ingles segun la model card; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir contenido facticamente incorrecto.
- Sesgos: no documentados en la informacion proporcionada.
- Licencia: MIT, permite uso comercial sin restricciones adicionales segun la model card; conviene verificar los terminos del modelo base original.
- Cuantizacion: en CPU, LiteRT-LM redondea las entradas de las capas lineales int8 a int8 en tiempo de ejecucion (XNNPACK qd8), lo que puede introducir pequenas diferencias numericas.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/litert-community/Kimi-Linear-48B-A3B-Instruct
- Notas de conversion y detalles tecnicos: https://huggingface.co/litert-community/Kimi-Linear-48B-A3B-Instruct/blob/main/DETAILS.md
- Modelo base original: https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct
- Paper de Kimi Linear (arXiv:2510.26692): https://arxiv.org/abs/2510.26692
- Pull request LiteRT #11192: https://github.com/google-ai-edge/LiteRT/pull/11192
- Pull request LiteRT #11188: https://github.com/google-ai-edge/LiteRT/pull/11188
- Issue LiteRT-LM #3165 (conversaciones y estado recurrente): https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- LiteRT-LM en PyPI: https://pypi.org/project/litert-lm/
