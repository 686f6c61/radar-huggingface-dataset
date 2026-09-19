# m-takuj/Qwen2.5-1.5B-Instruct-GPTQ-Int4

## Resumen

El modelo m-takuj/Qwen2.5-1.5B-Instruct-GPTQ-Int4 es una conversión del modelo ya cuantizado Qwen/Qwen2.5-1.5B-Instruct-GPTQ-Int4, preparada por el usuario m-takuj para ejecutarse sobre las NPU de AXera (familia AX650 y AX630C). No se trata de un modelo entrenado desde cero, sino de una adaptación de despliegue: el autor ha tomado los pesos GPTQ Int4 del modelo base de Qwen y los ha convertido al formato axmodel mediante la herramienta Pulsar2, aplicando además una optimización con LoRA cuya identidad exacta no se especifica en la model card.

El interés de esta ficha es doble. Por un lado, documenta la arquitectura subyacente Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,54 mil millones de parámetros con una ventana de contexto nativa de 32.768 tokens y capacidad multilingüe. Por otro, describe una ruta poco habitual de despliegue en producción: inferencia de un LLM sobre hardware NPU de bajo consumo (placas AX650N, módulos M.2 con Raspberry Pi 5) en lugar de sobre GPU convencionales.

Su relevancia actual reside en que demuestra que un modelo de 1,5B parámetros puede ejecutarse a velocidades de 15-19 tokens por segundo en aceleradores embebidos de gama baja, con un consumo y unas necesidades de memoria muy inferiores a los de una GPU dedicada. El repositorio ocupa 1,5 GB y en el momento de la consulta registra 0 descargas y 0 likes, por lo que se trata de una publicación reciente y con poca validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1,54 mil millones (1.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B-Instruct; en este runtime AX650 el limite configurado es max_token_len = 1023, con prefill_token_num = 128 y kv_cache_num = 1023 |
| Tipos de cuantizacion | GPTQ Int4; en el runtime AXera se comparan w4a16 (19 tokens/s) y w8a16 (11 tokens/s) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Qwen2.5 es multilingue, pero no se detalla aqui la lista) |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors/GPTQ originales y conversion a axmodel para NPU AXera |
| Tamano del repositorio | 1,5 GB |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención de consultas agrupadas (GQA) y sesgo QKV, entrenado por Alibaba Cloud mediante un pipeline de preentrenamiento sobre datos multilingües seguido de ajuste por instrucciones y alineación. Sobre esa base, el repositorio del autor parte a su vez de una versión ya cuantizada con GPTQ a Int4 (Qwen/Qwen2.5-1.5B-Instruct-GPTQ-Int4), de modo que no hay reentrenamiento del modelo original en esta ficha.

La aportación específica de m-takuj consiste en la conversión de esos pesos a un formato ejecutable sobre NPU AXera. La model card indica que esta versión "se ha convertido para funcionar sobre NPU AXera usando cuantización w4a16" y que "está optimizada con los siguientes LoRA", aunque la lista de LoRA aparece vacía en el texto proporcionado. La herramienta de conversión citada es Pulsar2 (versión 3.4, aún no publicada) y el runtime de inferencia es AXera-TECH/ax-llm. El proceso genera artefactos binarios axmodel, tokenizador en Python y scripts de arranque para distintos host.

En el arranque registrado se observa la configuración de muestreo del runtime: temperature 0.9, top_k 10, top_p 0.8, penalty_window 20, repetition_penalty 1.2, con top_p y repetition_penalty deshabilitados por defecto. El consumo de memoria CMM reportado durante la ejecución en placa AX650N es de 1053 MiB sobre 7040 MiB disponibles.

## Capacidades

- Generacion de texto conversacional en modo instrucciones, con plantilla de chat Qwen (tokens especiales `<|im_start|>` y `<|im_end|>`).
- Respuesta a preguntas y tareas de conocimiento general, segun los ejemplos incluidos en la model card ("who are you", "1+1=?").
- Razonamiento aritmetico basico, como se muestra en el ejemplo resuelto "1+1 equals 2".
- Generacion de texto multilingue heredada del modelo base Qwen2.5 (no se detalla la lista de idiomas en esta model card).
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso en la informacion proporcionada.
- No se documenta modo "thinking", vision, audio ni decodificacion especulativa en la informacion proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional en dispositivos embebidos: el modelo corre sobre placas AX650N y modulos M.2, lo que permite integrar un chatbot local en hardware de bajo consumo sin depender de la nube.
- Robotica y dispositivos de borde (edge): con un consumo de memoria CMM de aproximadamente 1 GB y 19 tokens/s en w4a16, es viable ejecutar instrucciones de lenguaje natural en un dron, camara inteligente o terminal industrial.
- Pasarela de voz a texto a respuesta en asistentes de voz: el modelo genera respuestas cortas a partir de prompts de sistema (por ejemplo, "You are Qwen, created by Alibaba Cloud"), adecuado como motor de dialogo en altavoces inteligentes.
- Prototipado en Raspberry Pi 5: la model card documenta explicitamente la ejecucion mediante tarjeta aceleradora M.2 sobre Raspberry Pi 5 con AXCL, con velocidades de 15,36 tokens/s.
- Servicio de traduccion ligero en local: el modelo base Qwen2.5 es multilingue y la model card menciona traduccion entre las tareas del asistente, aunque el runtime limita el contexto a 1023 tokens.
- Educacion y demos de inferencia en NPU: sirve como ejemplo reproducible para aprender a convertir pesos GPTQ a axmodel con Pulsar2 y ejecutarlos con ax-llm.
- Filtrado y clasificacion de texto en el borde: dado su tamano reducido, puede emplearse para moderar o etiquetar contenidos antes de enviarlos a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo aporta datos de throughput medidos en los ejemplos de ejecucion:

| Plataforma | Cuantizacion | Throughput |
|---|---|---|
| AX650 | w4a16 | 19 tokens/s (hasta 19,43 tokens/s medidos) |
| AX650 | w8a16 | 11 tokens/s |
| Raspberry Pi 5 + tarjeta M.2 AX650N | w4a16 | 15,36 tokens/s |

Datos de inicializacion y memoria observados en las trazas: `max_token_len = 1023`, `kv_cache_size = 256`, `prefill_token_num = 128`, consumo CMM de 1053 MiB sobre 7040 MiB.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 1,5 GB de pesos en disco.
- Memoria del acelerador: en el ejemplo de placa AX650N se reporta un uso CMM de 1053 MiB sobre 7040 MiB disponibles; en el arranque inicial el runtime informa de `remain_cmm(2731 MB)` en AX650 y `remain_cmm(6219 MB)` en el modulo M.2 con Raspberry Pi 5.
- Plataformas NPU soportadas: AX650 (AX650N DEMO Board, M4N-Dock "爱芯派Pro" y tarjeta aceleradora M.2). AX630C figura como "en desarrollo".
- No esta pensado para GPU convencionales: el formato de pesos es axmodel, especifico de la NPU AXera, y no se puede cargar directamente con vLLM, TGI, llama.cpp u Ollama.
- Opciones de despliegue documentadas: runtime `ax-llm` (AXera-TECH) y binarios `main_axcl_aarch64`, `main_axcl_x86` y `main_prefill`, mas un servicio de tokenizador en Python (`qwen2.5_tokenizer.py`) que atiende en un puerto local.
- Latencia y throughput: 19 tokens/s en AX650 con w4a16, 11 tokens/s con w8a16, y 15,36 tokens/s en Raspberry Pi 5 con modulo M.2. El tiempo de inicializacion del modelo fue de 1,62 s en AX650 y de 22,80 s en el modulo M.2.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para esta conversion. A continuacion se comparan caracteristicas conocidas de la familia base; los datos de rendimiento de las alternativas no se han verificado en esta ficha.

| Modelo | Parametros | Contexto | Formato / destino | Licencia |
|---|---|---|---|---|
| m-takuj/Qwen2.5-1.5B-Instruct-GPTQ-Int4 (esta ficha) | 1,54B | 1023 tokens en runtime AX650 (32.768 en el base) | axmodel / NPU AXera | bsd-3-clause |
| Qwen/Qwen2.5-1.5B-Instruct-GPTQ-Int4 | 1,54B | 32.768 tokens | safetensors GPTQ Int4 / GPU | no disponible en la informacion proporcionada |
| no disponible | - | - | - | - |

No se conocen en la informacion proporcionada otros modelos de la misma categoria convertidos especificamente para NPU AXera, por lo que no es posible una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Ventana de contexto muy reducida en el runtime: el arranque configura `max_token_len = 1023`, muy por debajo de los 32.768 tokens del modelo base, lo que limita conversaciones largas y documentos extensos.
- Sesgos conocidos: no se documentan en la model card, pero al derivar de Qwen2.5-1.5B-Instruct hereda los sesgos del corpus de entrenamiento de ese modelo.
- Riesgo de alucinacion: inherente a un modelo de 1,5B parametros; los propios ejemplos generados en la model card contienen afirmaciones imprecisas (el modelo se describe como capaz de "hablar, ver imagenes" cuando no dispone de vision ni audio).
- Idiomas: la model card no especifica la lista de idiomas soportados en esta conversion; el comportamiento multilingue depende del modelo base.
- Restricciones de licencia: el repositorio se distribuye bajo bsd-3-clause, mientras que el modelo base Qwen2.5-1.5B-Instruct de Alibaba se publica bajo Apache-2.0. Conviene verificar la compatibilidad de ambas licencias antes de un uso comercial.
- Dependencia de herramientas no publicadas: la conversion requiere Pulsar2 3.4, que en el momento de la publicacion figura como "no publicada", lo que dificulta reproducir el proceso.
- Optimizacion LoRA sin documentar: la model card menciona que el modelo esta optimizado con LoRA, pero no enumera cuales ni aporta detalles de entrenamiento.
- Madurez del repositorio: 0 descargas y 0 likes, sin validacion de la comunidad; el soporte para AX630C esta aun en desarrollo.
- Los resultados de busqueda web obtenidos no contienen informacion relevante sobre este modelo (se refieren a la letra "M", a la cadena M6 y a un municipio), por lo que no aportan datos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/m-takuj/Qwen2.5-1.5B-Instruct-GPTQ-Int4
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GPTQ-Int4
- Runtime de LLM para NPU AXera: https://github.com/AXERA-TECH/ax-llm
- Documentacion de Pulsar2 (conversion de LLM a axmodel): https://pulsar2-docs.readthedocs.io/en/latest/appendix/build_llm.html
- Wiki del dispositivo M4N-Dock (爱芯派Pro): https://wiki.sipeed.com/hardware/zh/maixIV/m4ndock/m4ndock.html
- Documentacion de hardware de la tarjeta aceleradora M.2 (AXCL): https://axcl-docs.readthedocs.io/zh-cn/latest/doc_guide_hardware.html
