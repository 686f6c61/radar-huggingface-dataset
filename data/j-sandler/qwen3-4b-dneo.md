# J-sandler/Qwen3-4B-DNeo

## Resumen

Qwen3-4B-DNeo es un modelo borrador (draft model) para decodificacion especulativa, desarrollado por el usuario J-sandler y publicado en Hugging Face. No es un modelo de lenguaje autonomo: se acopla a Qwen/Qwen3-4B, que actua como modelo objetivo y verifica las propuestas mediante muestreo de rechazo especulativo. Su funcion es acelerar la decodificacion autoregresiva generando bloques de tokens en una sola pasada del backbone, que el modelo objetivo valida despues.

La innovacion principal es el "rejection memory": en lugar de descartar las predicciones rechazadas, DNeo reutiliza las caracteristicas del modelo objetivo asociadas a esos tokens como memoria de atencion para el siguiente borrador. Segun la model card, genera 15 tokens desde una unica pasada del backbone en modo thinking, con un rendimiento medido de 4,51-4,54 tokens por forward y aceleraciones de 2,96x (SGLang) y 3,37x (Transformers) frente a la decodificacion autoregresiva sobre Qwen3-4B.

El checkpoint pesa 638.563.688 parametros (unos 0,64B) y ocupa 2,6 GB en el repositorio. Es relevante ahora porque la decodificacion especulativa se ha consolidado como la tecnica estandar para reducir latencia en inferencia de LLM sin degradar la calidad de salida, y DNeo propone una variante de borrador paralelo con reutilizacion de informacion del rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas como backbone paralelo, con enrutamiento de caracteristicas MoFA, rejection memory, convoluciones two-tap y cabeza causal fusionada (DNeo fused causal head) |
| Parametros totales | 638.563.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (en benchmarks se usa un limite de contexto de 1024 tokens) |
| Tipos de cuantizacion | no disponible (pesos en BF16 para los benchmarks publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para los pesos del borrador; MIT para el codigo de inferencia incluido |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

DNeo es un borrador paralelo compuesto por cinco capas transformer que producen un bloque de propuestas en una sola pasada; las posiciones enmascaradas no atienden entre si. Sobre ese backbone se aplica un enrutamiento MoFA: una mezcla aprendida de caracteristicas normalizadas procedentes de siete capas seleccionadas del modelo objetivo, compartida entre las cinco capas del borrador, las cabezas KV, el prefijo y la memoria de rechazo. Las caracteristicas de los tokens rechazados se incorporan como memoria de atencion para el siguiente borrador sin pasar por los MLP del drafter. Ademas, convoluciones two-tap de estilo DFlash-2 transfieren informacion entre posiciones vecinas del borrador, y una cabeza causal fusionada condiciona cada prediccion en el token anterior sin requerir otra pasada del backbone.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La informacion disponible se limita a la descripcion arquitectonica y a los resultados de rendimiento. El checkpoint requiere el runtime de router compartido (version 0.1.0rc6 o superior) y no es compatible con los cargadores anteriores de cinco routers.

## Capacidades

- Generacion especulativa de borradores de hasta 15 tokens por pasada del backbone en modo thinking de Qwen3-4B.
- Reutilizacion de caracteristicas de tokens rechazados como memoria de atencion (rejection memory).
- Integracion como draft model en pipelines de decodificacion especulativa con verificacion por muestreo de rechazo del modelo objetivo.
- Soporte de dos backends de inferencia: Transformers y SGLang nativo.
- No soporta tool calling, function calling ni comportamiento agentico por si mismo: esas capacidades dependen del modelo objetivo Qwen3-4B.
- No es un modelo multimodal ni de audio.
- Capacidades multilingues: no disponibles como dato especifico del borrador; heredadas en la practica del modelo objetivo.

## Casos de uso

- Aceleracion de inferencia en produccion sobre Qwen3-4B: desplegar DNeo junto al modelo objetivo para reducir la latencia de decodificacion hasta 2,96x en SGLang y 3,37x en Transformers, manteniendo la distribucion de salida del modelo verificado.
- Servicio de chat de baja latencia: en escenarios de batch 1 con prompts cortos (hasta 256 tokens) y salidas de 512 tokens, el borrador paralelo reduce el tiempo por token en despliegues interactivos.
- Generacion de codigo asistida: los benchmarks incluyen HumanEval y MBPP, de modo que el par drafter-objetivo es adecuado para autocompletado y generacion de codigo donde la latencia importa.
- Razonamiento matematico interactivo: con GSM8K y MATH-500 en la evaluacion, el modelo acelera tareas de chain-of-thought en modo thinking sin alterar la calidad de las respuestas verificadas.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: util como referencia reproducible para medir tokens por forward y speedup frente a decodificacion autoregresiva.
- Investigacion en borradores paralelos: la arquitectura con rejection memory y enrutamiento MoFA sirve como base para experimentos sobre reutilizacion de informacion del modelo objetivo en decodificacion especulativa.
- Despliegue en GPU de centro de datos: con un H100 80GB en BF16 y batch 1 se obtienen 701 tokens/s en SGLang, adecuado para servicios con SLA estrictos de latencia.

## Benchmarks y rendimiento

| Backend | Tokens / forward | Decode tokens/s | Speedup vs. AR |
|---|---:|---:|---:|
| SGLang | 4,51 | 701 | 2,96x |
| Transformers | 4,54 | 390 | 3,37x |

Mediciones de la model card: batch 1 en una H100 80GB, BF16, tamano de bloque 16, temperatura 1 en objetivo y borrador, medias de ocho semillas sobre 256 prompts emparejados de GSM8K, MATH-500, HumanEval, MBPP, GPQA y MT-Bench. Prompts limitados a 256 tokens, salidas fijadas a 512 tokens ignorando EOS y contexto maximo de 1024. Los tiempos de decodificacion excluyen prefill, arranque, tokenizacion y transporte HTTP.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para el borrador en la informacion disponible; al ser un draft model, la calidad de salida la determina el modelo objetivo Qwen3-4B tras la verificacion.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 2,6 GB en BF16; debe sumarse la del modelo objetivo Qwen3-4B (unos 8 GB en BF16), por lo que el par completo requiere aproximadamente 11 GB en BF16.
- GPU recomendadas: H100 80GB es la configuracion de referencia de los benchmarks; tambien es viable en A100 40/80GB y en GPU consumer con suficiente VRAM para ambos modelos.
- Cabe en GPU consumer: si, siempre que se disponga de VRAM para el borrador y el objetivo juntos (por ejemplo, RTX 4090 de 24 GB en BF16, o configuraciones con cuantizacion del objetivo).
- Opciones de despliegue: SGLang nativo y Transformers mediante el runtime DNeo (version 0.1.0rc6 o superior). No se documentan soportes de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 701 tokens/s en SGLang y 390 tokens/s en Transformers con batch 1 en H100 80GB; los resultados dependen de la carga de trabajo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-DNeo | 0,64B | no disponible | Borrador especulativo para Qwen3-4B | Apache-2.0 (pesos) / MIT (codigo) | Hugging Face |
| Qwen/Qwen3-4B | 4B | no disponible | Modelo objetivo de proposito general | no disponible en la informacion | Hugging Face |
| Borradores EAGLE / Medusa | no disponible | no disponible | Decodificacion especulativa generica | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento de alternativas comparables, por lo que no es posible establecer una comparacion cuantitativa de speedup o calidad frente a otros borradores especulativos.

## Limitaciones y advertencias

- No es un modelo autonomo: sin Qwen3-4B como verificador no genera salida valida.
- Requiere el runtime DNeo 0.1.0rc6 o superior; los cargadores anteriores de cinco routers no pueden cargar estos pesos de router unico.
- Los benchmarks se han medido con contexto limitado a 1024 tokens y salidas fijas de 512 tokens; el rendimiento fuera de ese regimen no esta documentado.
- El speedup depende de la carga de trabajo y de la tasa de aceptacion del modelo objetivo; la model card lo advierte explicitamente.
- No se documentan sesgos, riesgos de alucinacion ni evaluaciones de seguridad del borrador; al heredar la distribucion del objetivo, los sesgos de Qwen3-4B son aplicables.
- Idiomas soportados no documentados para el borrador.
- Licencia Apache-2.0 en pesos y MIT en codigo de inferencia permiten uso comercial, pero deben respetarse las condiciones de atribucion indicadas en LICENSE-MIT y NOTICE.
- No se documenta soporte de cuantizacion del borrador; los datos de rendimiento son en BF16.

## Enlaces

- Hugging Face: https://huggingface.co/J-sandler/Qwen3-4B-DNeo
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper: https://arxiv.org/pdf/2611.21925
- GitHub: https://github.com/J-sandler/DNeo
- Guia de inicio rapido: https://github.com/J-sandler/DNeo/blob/main/QUICKSTART.md#install
- Benchmarks: https://github.com/J-sandler/DNeo/blob/main/BENCHMARKS.md
- Guia SGLang: https://github.com/J-sandler/DNeo/blob/main/QUICKSTART.md#run-with-sglang
- Guia Transformers: https://github.com/J-sandler/DNeo/blob/main/QUICKSTART.md#run-with-transformers
- Codigo de inferencia: https://huggingface.co/J-sandler/Qwen3-4B-DNeo/resolve/main/dneo-inference-source.tar.gz
- Actualizacion de inferencia: https://huggingface.co/J-sandler/Qwen3-4B-DNeo/blob/main/INFERENCE_UPDATE.md
- Licencia de pesos: https://huggingface.co/J-sandler/Qwen3-4B-DNeo/blob/main/LICENSE
- Licencia MIT: https://huggingface.co/J-sandler/Qwen3-4B-DNeo/blob/main/LICENSE-MIT
- Aviso de atribucion: https://huggingface.co/J-sandler/Qwen3-4B-DNeo/blob/main/NOTICE
- Licencia del repositorio de codigo: https://github.com/J-sandler/DNeo/blob/main/LICENSE
