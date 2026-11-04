# JRamirez-UAB/ZwZ2-27B-EXL3-2.25bpw-16GB

## Resumen

ZwZ2-27B-EXL3-2.25bpw-16GB es una cuantizacion EXL3 no oficial, de caracter comunitario, del modelo vision-lenguaje inclusionAI/ZwZ2-27B, construido sobre el backbone Qwen3.6-27B. El modelo original forma parte del proyecto *Zooming-without-Zooming-v2*: un VLM entrenado con GRPO para conectar evidencia visual entre distintas regiones de una imagen completa (comparacion, agregacion, emparejamiento y razonamiento multi-paso) sin necesidad de herramientas de zoom. Esta version comprime las capas lineales a 2,25 bits por peso, mantiene el `lm_head` y la torre de vision a 6 bits y los embeddings de tokens a INT8, con el objetivo de servir el contexto completo de 262.144 tokens con vision dentro de una GPU de 16 GB.

El interes practico del checkpoint es el compromiso entre memoria y fidelidad: gracias a la cache KV en INT4, el pool de KV alcanza 284.694 tokens, suficiente para una sesion completa de 262.144 tokens en una tarjeta de 16 GB. El precio es una divergencia KL frente a BF16 de aproximadamente 0,078-0,088, unas diez veces superior a la de la variante de 4,0 bpw para 24 GB. La autoria (JRamirez-UAB) orienta la calibracion y las pruebas a un caso de uso concreto: un agente local de administracion de sistemas Linux en castellano, manejado con opencode y tool calling.

La relevancia actual esta en que permite ejecutar un VLM de razonamiento visual con contexto largo en hardware de consumo, algo que las versiones en BF16 o en cuantizaciones de 4 bits no permiten en 16 GB. No obstante, requiere un stack de inferencia especifico (vLLM 0.31.0 + exllamav3 1.6.5 + plugin `vllm-quantpack`), y el autor advierte de que no es una release oficial de inclusionAI ni de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (VLM) basado en Qwen3.6-27B; cuantizacion EXL3 (exllamav3) |
| Parametros totales | 5.487.269.248 (segun safetensors del repo); el modelo base se denomina "27B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (con vision, cache KV INT4) |
| Tipos de cuantizacion | EXL3 2,25 bpw en capas lineales; `lm_head` 6 bits; torre de vision 6 bits; embeddings de tokens INT8; cache KV INT4 |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 (el repo de pesos del modelo base no declara licencia; se hereda de codigo y backbone) |
| Formato de pesos | safetensors (EXL3), 2 shards, 9,70 GB; incluye `quantization_config.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer vision-lenguaje derivado de Qwen3.6-27B, con una torre de vision dedicada y un procesador de imagen/video. El entrenamiento del modelo original se realizo con GRPO (optimizacion de politica con recompensas verificables) orientado a razonamiento visual multi-region: comparar, agregar, emparejar y encadenar pasos sobre una imagen completa sin recurrir a zoom. Esta cuantizacion no reentrena el modelo; aplica EXL3 1.6.5 sobre los pesos originales con trazas de calibracion propias, que incluyen conversaciones reales de sysadmin y agente en castellano.

La innovacion tecnica del checkpoint es la combinacion de cuantizacion agresiva de pesos (2,25 bpw) con cache KV INT4, que permite mantener el contexto completo de 262.144 tokens en 16 GB. El modelo no dispone de cabeza MTP, por lo que no se aplica decodificacion especulativa. La carga exige vLLM junto con exllamav3 y el plugin `vllm-quantpack`; un `pip install vllm` generico, Transformers o SGLang no pueden cargarlo. El chat template del modelo base responde sin razonamiento por defecto, y el autor recomienda servir con `--default-chat-template-kwargs '{"enable_thinking": false}'` para evitar que las respuestas lleguen en `reasoning_content` con `content` vacio.

## Capacidades

- Generacion de texto conversacional multi-turno en castellano e ingles.
- Razonamiento visual: comparacion, agregacion, emparejamiento y razonamiento multi-paso sobre imagenes completas sin herramientas de zoom.
- Procesamiento de imagen y video mediante el procesador del modelo base.
- Tool calling / function calling: validado con la peticion real de opencode (30/30 aciertos).
- Uso como agente de administracion de sistemas Linux con ejecucion real de comandos.
- Contexto largo: una sesion completa de 262.144 tokens con vision en 16 GB.
- Modo thinking opcional mediante `chat_template_kwargs` (`enable_thinking: true`), con separacion del razonamiento.
- Capacidades multilingues limitadas a es y en segun la model card.

## Casos de uso

- Agente local de administracion Linux: el modelo gestiona conversaciones multi-turno con tool calling sobre comandos reales, adecuado por su contexto de 262.144 tokens y su validacion con opencode en castellano.
- Diagnostico visual de sistemas: a partir de capturas de pantalla de terminales, paneles de monitorizacion o interfaces de error, el modelo razona sobre la evidencia visual sin necesidad de recortes ni zoom.
- Automatizacion de soporte tecnico en castellano: respuestas multi-turno con contexto largo para incidencias que requieren historial extenso de conversacion.
- Analisis de documentacion tecnica escaneada o capturas de configuracion: la torre de vision a 6 bits permite extraer y relacionar informacion entre regiones de una imagen.
- Asistente de programacion en pipelines locales: con 9-10 aciertos de 12 en tareas de programacion, sirve para tareas de codigo no criticas en entornos con GPU de 16 GB.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en 16 GB con contexto completo, permite prototipar agentes VLM sin infraestructura de centro de datos.
- Evaluacion de cuantizaciones en produccion: util para medir el impacto de 2,25 bpw frente a 4,0 bpw en tareas de agente y vision antes de decidir el hardware.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| KLD vs BF16 (traza opencode) | 0,0785 |
| KLD vs BF16 (traza sysadmin) | 0,0878 |
| KLD vs BF16 (traza publica de turboderp) | 0,0884 |
| Tool calls (peticion real de opencode) | 30/30 |
| Vision | 14/15 |
| Tareas de programacion | 10/12 y 9/12 en dos ejecuciones |
| Decode, prompts cortos, 1/2/4/8 peticiones | 49,7 / 71,5 / 127,4 / 129,4 tok/s |
| Decode tras prompt de 258.000 tokens | 17,8 tok/s |
| Pico de memoria | 15.566 MiB con `--kv-cache-memory-bytes 5220000000` |
| Pool de KV | 284.694 tokens |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 16 GB para el contexto completo con vision y cache KV INT4; pico medido de 15.566 MiB.
- GPU probada: RTX 3090 (24 GB, Ampere, limite de 350 W) simulando una tarjeta de 16 GB; el autor indica que no se ha ejecutado en una tarjeta real de 16 GB.
- Cabe en GPU de consumo de 16 GB (gama Ampere o superior); en 12 GB no cabe a 262.144 tokens (a 2,0 bpw el KV solo admitiria unos 95k tokens).
- Despliegue: vLLM 0.31.0 + exllamav3 1.6.5 + `vllm-quantpack` 0.1.4; no es compatible con Transformers, SGLang ni un vLLM estandar.
- Throughput: 49,7-129,4 tok/s en decodificacion con prompts cortos segun concurrencia; 17,8 tok/s tras un prompt de 258.000 tokens.
- Sin decodificacion especulativa (el modelo no tiene cabeza MTP).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZwZ2-27B-EXL3-2.25bpw-16GB (este) | 5.487.269.248 | 262.144 con vision | 0,0785 / 0,0878 / 0,0884 | apache-2.0 | HuggingFace, requiere stack EXL3 |
| ZwZ2-27B-EXL3-4.0bpw-24GB | no disponible | 262.144 con vision | 0,0090 / 0,0061 / 0,0066 | apache-2.0 | HuggingFace, requiere 24 GB |
| inclusionAI/ZwZ2-27B (BF16) | no disponible | no disponible | referencia | no declarada en el repo de pesos | HuggingFace |

No se dispone de datos de benchmarks estandar para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Fidelidad reducida: la divergencia KL frente a BF16 es aproximadamente diez veces la de la variante de 4,0 bpw, con caida en tareas de programacion (9-10 de 12).
- No es una release oficial de inclusionAI ni de Qwen; es una cuantizacion comunitaria no verificada por los autores originales.
- La licencia del repo de pesos del modelo base no esta declarada; la licencia apache-2.0 se hereda de codigo y backbone, por lo que conviene revisar los terminos de los autores antes de uso comercial.
- Requiere un stack de inferencia especifico y fragil (vLLM 0.31.0 + exllamav3 1.6.5 + vllm-quantpack 0.1.4); no funciona con instalaciones genericas.
- Riesgo de respuestas vacias en `content` si no se configura `enable_thinking: false` en el servidor.
- Cobertura idiomatica limitada a es y en.
- Solo una sesion concurrente de 262k tokens cabe en el pool de KV de 16 GB.
- No probado en una tarjeta real de 16 GB; los resultados provienen de una RTX 3090 simulada.
- Las metricas de calidad estan sesgadas hacia el caso de uso del autor (sysadmin en castellano con opencode); el rendimiento en otros dominios o idiomas puede diferir.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion.

## Enlaces

- HuggingFace: https://huggingface.co/JRamirez-UAB/ZwZ2-27B-EXL3-2.25bpw-16GB
- Modelo base: https://huggingface.co/inclusionAI/ZwZ2-27B
- Variante 4,0 bpw: https://huggingface.co/JRamirez-UAB/ZwZ2-27B-EXL3-4.0bpw-24GB
- Repositorio del proyecto: https://github.com/inclusionAI/Zooming-without-Zooming-v2
- exllamav3: https://github.com/turboderp-org/exllamav3
- Paper 1: arxiv:2610.37037
- Paper 2: arxiv:2406.11235
