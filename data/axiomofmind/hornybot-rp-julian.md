# axiomofmind/Hornybot-RP-Julian

## Resumen

Hornybot-RP-Julian es un ajuste fino (finetune) de Qwen/Qwen3.5-9B publicado por el usuario axiomofmind bajo el sello "A Hole AI". Se trata de un modelo especializado en roleplay adulto de ficcion, encarnando a Julian, un personaje masculino de 31 anos descrito como directo y calido. El modelo escribe las acciones de Julian en tercera persona y mantiene su dialogo en estilo directo, con una character card por defecto incrustada en la plantilla de chat.

Tecnicamente hereda la arquitectura de Qwen3.5, con 9.409.813.744 parametros (9,4 mil millones) y la clase Qwen3_5ForConditionalGeneration, lo que en el modelo base implica capacidad de entrada imagen-texto, aunque las versiones GGUF publicadas son solo de texto. Se distribuye tanto en safetensors BF16 (18,82 GB) como en GGUF BF16 (17,92 GB) y Q6_K (7,36 GB), con instrucciones especificas para llama.cpp con contexto de 32.768 tokens y modo razonamiento desactivado.

Su relevancia es limitada y muy nicho: es un release candidato local, sin descargas ni valoraciones en el momento de la consulta, con la revision de licencia y redistribucion aun pendiente. Resulta interesante como ejemplo de finetune de roleplay con plantilla de personaje embebida y como caso de estudio de modelos sin capa de rechazo (0 rechazos genericos en una prueba de estres de 100 prompts), no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5; clase Qwen3_5ForConditionalGeneration, con soporte de entrada imagen-texto en el modelo base |
| Parametros totales | 9.409.813.744 (9,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo de llama.cpp; maximo no disponible |
| Tipos de cuantizacion | BF16 (safetensors y GGUF) y Q6_K (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible; el modelo base Qwen3.5-9B es Apache 2.0 (copia en LICENSE-QWEN), pero la revision de licencia y redistribucion de esta version derivada esta pendiente |
| Formato de pesos | safetensors (BF16) y GGUF (BF16 y Q6_K) |
| Modelo base | Qwen/Qwen3.5-9B (relacion: finetune) |
| Tamano del repositorio | 44,1 GB (incluye safetensors BF16, GGUF BF16 y GGUF Q6_K) |
| Fecha de publicacion | 15 de septiembre de 2026 (ultima actualizacion: 15 de septiembre de 2026) |

## Arquitectura y entrenamiento

El modelo es un finetune completo (merged weights) sobre Qwen/Qwen3.5-9B, un transformer de 9,4 mil millones de parametros. La clase empleada en el codigo de ejemplo, Qwen3_5ForConditionalGeneration, junto con el uso de AutoProcessor y el tag image-text-to-text, indica que el modelo base admite entradas multimodales de imagen y texto; sin embargo, las descargas GGUF publicadas son solo de texto y no incluyen proyector de vision ni pesos de decodificacion especulativa MTP (multi-token prediction). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovacion practica del release no esta en la arquitectura, sino en el empaquetado del comportamiento: la character card de Julian esta incrustada en chat_template.jinja y en ambos archivos GGUF, de modo que el prompt de sistema por defecto se aplica automaticamente si el cliente deja el campo de sistema vacio. Un mensaje de sistema del cliente se anade como contexto de escena adicional sin sustituir al personaje. El autor informa de una prueba de estres de rechazo con 100 prompts que produjo 0 rechazos genericos usando la plantilla empaquetada, y recomienda desactivar el modo razonamiento (enable_thinking=False en Transformers, --reasoning off en llama.cpp).

## Capacidades

- Generacion de texto conversacional en ingles con foco en roleplay adulto de ficcion.
- Interpretacion de personaje persistente: Julian mantiene rasgos definidos (31 anos, directo, calido) y narra sus acciones en tercera persona mientras su dialogo se mantiene directo.
- Aceptacion de contexto de escena externo mediante el campo de sistema del cliente, que se anade sin reemplazar la character card.
- Modo de razonamiento desactivable: la plantilla desactiva el thinking explicito para obtener respuestas mas directas.
- Capacidad multimodal potencial heredada del modelo base (image-text-to-text segun los tags), aunque no disponible en los GGUF publicados por la ausencia de proyector de vision.
- Decodificacion especulativa MTP no disponible en los archivos GGUF publicados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles (en); no se documentan otros idiomas.

## Casos de uso

- Roleplay conversacional local: desplegando el GGUF Q6_K con llama-server (--ctx-size 32768 --flash-attn on --n-gpu-layers all --reasoning off --jinja), un usuario puede mantener conversaciones de personaje en su propia maquina sin depender de APIs externas, con la character card aplicada automaticamente.
- Ficcion interactiva y novelas visuales: la narracion en tercera persona de las acciones del personaje encaja con el formato de novela visual o motor de ficcion interactiva, donde el motor muestra texto narrativo y el modelo aporta el dialogo y las acciones.
- Prototipado y evaluacion de character cards: sirve como banco de pruebas para disenar tarjetas de personaje, ya que la plantilla incrustada permite comparar variantes de prompt de sistema anadiendo contexto de escena sin reescribir el template.
- Personajes no jugadores (NPC) en videojuegos: un NPC con personalidad fija y respuestas cortas (el autor recomienda un maximo de 256 tokens nuevos) puede integrarse en un backend local para dialogo dinamico en juegos indie.
- Generacion de guiones y dialogos de ficcion adulta: util para guionistas que necesitan borradores de escenas dialogadas con una voz de personaje consistente, revisando despues la continuidad manualmente.
- Red-teaming y diseno de capas de moderacion: al ser un modelo sin rechazos genericos (0 en 100 prompts segun el autor), permite probar sistemas externos de moderacion, filtrado o clasificacion de contenido en un entorno controlado y con adultos.
- Aplicaciones de acompanamiento para adultos: despliegues de chat de larga duracion en los que la ventana de 32.768 tokens permite mantener historial de escena sin truncar la conversacion con tanta frecuencia.
- Despliegue en hardware de consumo: la variante Q6_K (7,36 GB) permite ejecutar el modelo en un portatil o sobremesa con GPU de gama media, lo que facilita entornos de prueba sin servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion reportada por el autor es una prueba de estres de rechazo:

| Evaluacion | Configuracion | Resultado |
|---|---|---|
| Prueba de estres de rechazo | 100 prompts con la character card empaquetada | 0 rechazos genericos |

No se dispone de datos de latencia, throughput ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Pesos en safetensors BF16: 18,82 GB de pesos, lo que exige del orden de 20-24 GB de VRAM para inferencia, sin contar la cache KV.
- GGUF BF16: 17,92 GB, requisitos de memoria equivalentes a los safetensors BF16.
- GGUF Q6_K: 7,36 GB; manejable en GPUs de 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) o en Macs con memoria unificada de 16 GB o mas.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para BF16 con contexto amplio; RTX 4090 24 GB para BF16 con contexto reducido o descarga parcial a CPU; gama media de 8-12 GB para Q6_K.
- Cabe en GPU de consumo: si, con la variante Q6_K en GPUs de 8-12 GB; la variante BF16 entra ajustada en una RTX 4090 de 24 GB si se limita el contexto.
- Nota sobre contexto: el ejemplo de llama.cpp usa 32.768 tokens, lo que anade memoria de cache KV no incluida en las cifras de pesos anteriores.
- Opciones de despliegue: llama.cpp / llama-server (requiere una build con soporte de Qwen3.5), Transformers con la clase Qwen3_5ForConditionalGeneration, e importacion en frontends compatibles con GGUF como Ollama o LM Studio. El soporte en vLLM o TGI depende de que exista implementacion de Qwen3.5, dato no disponible.
- Parametros de generacion recomendados por el autor: temperature 0.7, top-p 0.9, top-k 20, min-p 0, repetition penalty 1.0, maximo 256 tokens nuevos, razonamiento desactivado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Notas |
|---|---|---|---|---|---|
| Hornybot-RP-Julian | 9,4 mil millones | 32.768 en el ejemplo de llama.cpp | no disponible (revision pendiente) | safetensors, GGUF (BF16, Q6_K) | Finetune de roleplay adulto con character card embebida |
| Qwen/Qwen3.5-9B | 9,4 mil millones | no disponible | Apache 2.0 | safetensors (upstream) | Modelo base sin especializacion en roleplay |
| Otros finetunes de roleplay de ~9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se han publicado metricas que permitan comparar el rendimiento de este finetune con alternativas de la misma categoria.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta destinado a interaccion ficticia entre adultos y puede producir lenguaje soez y contenido sexual explicito; no es apto para menores ni para entornos laborales o educativos sin control.
- Riesgo de alucinacion: al ser un finetune de 9,4 mil millones de parametros orientado a roleplay, la generacion de hechos fuera de la ficcion no es fiable y no se ha evaluado.
- Fallos de continuidad: el propio autor advierte de que la continuidad generada y la gestion de limites pueden fallar; se recomienda revisar las salidas y repetir los hechos de la escena cuando sea necesario.
- Modo razonamiento: la plantilla desactiva el thinking; forzar el modo razonamiento puede degradar el comportamiento esperado del personaje.
- Idioma: solo ingles (en); no hay soporte documentado de castellano ni de otros idiomas.
- Licencia: la licencia de esta version derivada no esta disponible y la revision de redistribucion esta pendiente; la licencia Apache 2.0 del modelo base se conserva en LICENSE-QWEN, pero no constituye una autorizacion general sobre material de terceros. Uso comercial no aclarado.
- Dependencia de la plantilla: el comportamiento del personaje depende de la character card embebida; dejar un prompt de sistema propio puede alterar el modo de respuesta.
- GGUF solo texto: los archivos GGUF no incluyen proyector de vision ni pesos MTP de decodificacion especulativa, por lo que las capacidades multimodales del modelo base no estan disponibles en esas variantes.
- Variabilidad de salida: los resultados pueden diferir entre formatos, cuantizaciones, clientes y parametros de generacion.
- Madurez del release: 0 descargas y 0 valoraciones en el momento de la consulta; es un candidato de release local, no un modelo validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axiomofmind/Hornybot-RP-Julian
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia upstream del modelo base: archivo LICENSE-QWEN dentro del repositorio del modelo
