# litert-community/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Qwen (Alibaba), con 35.000 millones de parametros totales y 3.000 millones activos por token. Este repositorio concreto, publicado por la comunidad litert-community, no contiene los pesos originales en safetensors, sino una conversion del decodificador de texto a LiteRT-LM, el formato de runtime de Google AI Edge para ejecucion en dispositivo (GPU WebGPU y CPU XNNPACK).

La relevancia de esta publicacion es la demostracion practica de que un MoE de 35B puede ejecutarse en hardware de consumo como un Apple M4 Max, con decodificacion de 76,99 tok/s en GPU y 7,74 tok/s en CPU. Se trata de un artefacto de conversion, no de un modelo nuevo: la calidad subyacente es la del modelo base de Qwen, mientras que el valor anadido esta en el empaquetado, la cuantizacion y las mediciones de rendimiento y fidelidad respecto a Transformers.

La licencia Apache 2.0 y la ausencia del encoder de vision en los ficheros convierten esta version en una opcion orientada a inferencia de texto en local, con contexto limitado a 4.096 tokens en los tres artefactos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion y capas gated delta block; decodificador de texto convertido a LiteRT-LM |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | 3.000 millones (3B) por token |
| Longitud de contexto | 4.096 tokens en los tres ficheros publicados |
| Tipos de cuantizacion | int8 por canal (lineales y expertos) con activaciones fp16 o fp32; expertos int8 con resto fp32 (variante mixed) |
| Idiomas soportados | Ingles (segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 35B parametros totales y 3B activos, lo que reduce el coste computacional por token a aproximadamente una decima parte del de un modelo denso equivalente. La conversion a LiteRT-LM realizada con `litert-torch export_hf` (commit `67f11e8`) preserva el decodificador de texto e incorpora capas `odml.gated_delta_block` en la ruta GPU, ademas de pesos de normalizacion q/k verificados (iguales a 1 mas los del origen, con la permutacion rotary parcial aplicada una vez, 20 de 20 en cada una de las 3 firmas).

Los ficheros excluyen el encoder de vision y las capas de prediccion multi-token del modelo original. La cuantizacion es heterogenea: el fichero `int8_gpu` cuantiza a int8 por canal todas las capas lineales, incluidos los expertos, y mantiene el router, la puerta del experto compartido y la tabla de tokens en fp32, solicitando activaciones fp16; las variantes `mixed_int8` mantienen todo excepto los expertos en fp32. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activable (las pruebas de fidelidad se realizaron con thinking on y decodificacion greedy).
- Conversacion multi-turno: se validaron conversaciones de 3 turnos, con la salvedad de configurar `filter_channel_content_from_kv_cache` a false.
- Copia literal de cadenas largas (dos codigos de 40 digitos) y recuperacion de informacion en posiciones superiores a 2.048 dentro de un prompt de 2.600 tokens.
- Aritmetica basica y respuestas breves (ejemplo de la model card: "What is 17 + 25?").
- Capacidades multilingues: no disponibles en esta conversion; los metadatos declaran solo ingles.
- Vision: no soportada, el encoder de vision no esta incluido en los ficheros.
- Tool calling y function calling: no documentados en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon: el fichero `int8_gpu` alcanza 76,99 tok/s de decodificacion en un M4 Max con 128 GB, lo que permite usar el modelo como asistente interactivo sin conexion a servicios en la nube.
- Prototipado de aplicaciones on-device con LiteRT-LM: util para validar pipelines de Google AI Edge antes de desplegar en dispositivos con recursos limitados, dado que el runtime y los kernels MoE ya estan integrados.
- Procesamiento por lotes en CPU: la variante `mixed_int8_cpu` con 12 hilos ofrece 7,74 tok/s y un footprint maximo de 20 GB, adecuada para tareas asincronas de resumen o clasificacion donde la latencia no es critica.
- Evaluacion comparativa de fidelidad de cuantizacion: los informes de 12/12 respuestas identicas a Transformers bf16 y 12/12 finalizaciones con token de parada sirven como referencia para validar otras conversiones.
- Demostraciones de razonamiento con contexto medio: con 4.096 tokens de ventana y capacidad de recuperar datos mas alla de la posicion 2.048, cubre dialogos tecnicos y analisis de documentos cortos.
- Investigacion sobre MoE de bajo coste activo: los 3B parametros activos permiten estudiar el comportamiento de modelos dispersos grandes en hardware de consumo sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de rendimiento publicados son de velocidad y fidelidad de la conversion:

| Fichero | Backend | Prefill (tok/s) | Decode (tok/s) | Footprint maximo |
|---|---|---:|---:|---:|
| `qwen36_35b_a3b_int8_gpu_ekv4096.litertlm` | GPU (WebGPU) | 1.336,22 | 76,99 | 49 GB |
| `qwen36_35b_a3b_mixed_int8_gpu_ekv4096.litertlm` | GPU (WebGPU) | 1.162,21 | 39,68 | 60 GB |
| `qwen36_35b_a3b_mixed_int8_cpu_ekv4096.litertlm` | CPU (XNNPACK, 12 hilos) | 101,45 | 7,74 | 20 GB |

Medido en Apple M4 Max (128 GB) con 1.024 tokens de prefill y 256 de decodificacion. Con activaciones fp32, el fichero int8 GPU decodifica 75,03 tok/s y prellena 1.173,33 tok/s. En fidelidad, los tres ficheros obtienen 12/12 veredictos identicos a Transformers bf16, 12/12 finalizaciones con token de parada y superan la conversacion de 3 turnos con `filter_channel_content_from_kv_cache` a false.

## Requisitos de hardware

- VRAM/RAM estimada: 49 GB de footprint maximo para el fichero int8 GPU, 60 GB para el mixed int8 GPU y 20 GB para el CPU.
- GPU recomendadas: el unico hardware documentado es Apple M4 Max con 128 GB de memoria unificada mediante WebGPU. No hay datos publicados para A100, H100 ni RTX 4090.
- GPU de consumo: no se documenta compatibilidad con GPUs discretas de consumo; el backend probado es WebGPU sobre memoria unificada Apple.
- Despliegue: exclusivamente mediante LiteRT-LM compilado desde fuente (main `02d7e8d8`). La version 0.19.2 de PyPI no ejecuta estos ficheros porque sus kernels `moe` solo aceptan GELU y SiLU esta pendiente en los PR #11192 y #11188; ademas, el delegado GPU rechaza `odml.gated_delta_block`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los indicados en la tabla de rendimiento, con la advertencia del autor de que la velocidad sigue en optimizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este repo) | 35B | 3B | 4.096 | LiteRT-LM | Apache 2.0 | Conversion comunitaria, solo texto, sin benchmarks de calidad publicados |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | safetensors | Apache 2.0 | Modelo original con vision y prediccion multi-token; referencia de fidelidad bf16 |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Artefacto de conversion, no un modelo entrenado: la calidad depende integramente del modelo base de Qwen y de la fidelidad de la cuantizacion.
- Sin vision ni prediccion multi-token: el encoder de vision y las capas MTP no estan incluidos en los ficheros.
- Contexto reducido a 4.096 tokens, muy por debajo de lo que suele ofrecer el modelo base.
- Solo ingles declarado en los metadatos; no hay evaluacion multilingue en esta conversion.
- Runtime no listo para produccion con la version estable: requiere compilar LiteRT-LM desde fuente; la 0.19.2 de PyPI falla con estos ficheros por los kernels MoE (GELU frente a SiLU) y el delegado GPU.
- El modo thinking requiere configuracion manual (`filter_channel_content_from_kv_cache` a false o desactivar thinking); el CLI `litert_lm_advanced_main` no expone flags para ello.
- El fichero mixed int8 GPU con activaciones fp16 dejo una de las 12 respuestas sin terminar al alcanzar el limite de 2.048 tokens de pensamiento.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; aplican los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks de calidad y de soporte de runtime estable desaconseja su uso en produccion sin validacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Notas de conversion y rendimiento: https://huggingface.co/litert-community/Qwen3.6-35B-A3B/blob/main/DETAILS.md
- Instrucciones de compilacion del runtime: https://huggingface.co/litert-community/Qwen3.6-35B-A3B/blob/main/DETAILS.md#build-the-runtime
- Pull request LiteRT #11192: https://github.com/google-ai-edge/LiteRT/pull/11192
- Pull request LiteRT #11188: https://github.com/google-ai-edge/LiteRT/pull/11188
