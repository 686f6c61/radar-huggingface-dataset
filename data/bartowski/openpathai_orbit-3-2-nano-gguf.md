# bartowski/OpenPathAI_Orbit-3.2-Nano-GGUF

## Resumen

Orbit-3.2-Nano es un modelo de lenguaje de aproximadamente 2,7 mil millones de parametros desarrollado por OpenPathAI y construido como una iteracion de su serie Orbit-Nano. Segun la informacion disponible, deriva de Orbit-3-Nano, que a su vez es un fine-tune de LFM2.5-2.6B, el modelo de la familia Liquid Foundation Models de Liquid AI (etiquetado como `lfm2.5` y `liquid`). El entrenamiento se ha realizado mediante SFT sobre el dataset Dodol-15k-Indonesia, orientado a question answering cerrado en indonesio con contexto.

Este repositorio concreto no contiene los pesos originales, sino las cuantizaciones GGUF generadas por bartowski con llama.cpp (release b11716) e imatrix activada. El resultado es un conjunto de ficheros que va desde 5,40 GB en bf16 hasta aproximadamente 1,4 GB en cuantizaciones de 3 bits, lo que permite ejecutar el modelo en portatiles, GPUs de gama de entrada y dispositivos de borde sin conexion.

Su relevancia practica es acotada pero clara: es un modelo pequeno, con licencia Apache 2.0, formato de prompt tipo ChatML con etiqueta `<think>` para razonamiento explicito y soporte declarado de definiciones de herramientas en el mensaje de sistema. Eso lo hace util como pieza barata en pipelines de QA documental en indonesio o ingles, y como banco de pruebas local de tool calling. Ahora bien, no hay benchmarks publicados en la informacion disponible y el modelo tiene cero descargas y cero likes, por lo que no existe validacion externa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de la familia LFM2.5 (Liquid AI), segun los tags `lfm2.5` y `liquid`; el detalle de capas y proporcion de bloques convolucionales frente a atencion no esta disponible |
| Parametros totales | 2.697.198.592 (2,7 B) en safetensors; la model card del cuantizador indica "3B (source checkpoint)" |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M y cuantizaciones menores (el listado de la model card aparece truncado) |
| Idiomas soportados | indonesio (`id`) e ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp b11716, con imatrix); el checkpoint original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo original, OpenPathAI/Orbit-3.2-Nano, se presenta como una iteracion de la serie Orbit-Nano construida sobre Orbit-3-Nano, descendiente de LFM2.5-2.6B. La familia LFM2 de Liquid AI emplea una arquitectura hibrida que combina bloques convolucionales de corto alcance con bloques de atencion, disenada para reducir el coste computacional en inferencia respecto a un transformer denso equivalente; la informacion proporcionada no detalla la configuracion concreta de LFM2.5 ni el reparto exacto de capas en este modelo. El postentrenamiento consiste en un fine-tune supervisado (SFT) orientado a instrucciones sobre el dataset Irza/Dodol-15k-Indonesia, un conjunto de aproximadamente 15.000 ejemplos de QA cerrado en indonesio con contexto. No se documenta el volumen total de tokens de entrenamiento, la composicion completa del dataset ni si hubo fases de RLHF o DPO.

La model card del cuantizador aporta dos detalles tecnicos de interes. El primero es que no se emplea decodificacion especulativa ("Speculative decoding: no"). El segundo es la plantilla de prompt: el formato es de tipo ChatML con los tokens `<|startoftext|>`, `<|im_start|>`, `<|im_end|>` y una apertura explicita de la etiqueta `<think>` justo despues del rol `assistant`, lo que indica que el modelo fue entrenado para emitir una traza de razonamiento antes de la respuesta final. Para tool calling, las definiciones se inyectan como texto JSON dentro del mensaje de sistema, bajo la clave "List of tools". Respetar esta plantilla al pie de la letra es imprescindible para obtener un comportamiento correcto en llama.cpp u otros runtimes.

## Capacidades

- Generacion de texto conversacional multi-turno con formato de chat estructurado.
- Question answering cerrado sobre contexto: el modelo fue entrenado especificamente para responder preguntas a partir de un pasaje o documento proporcionado, no solo con conocimiento parametrico.
- Modo de razonamiento explicito: el prompt fuerza la apertura de `<think>`, de modo que el modelo produce una cadena de razonamiento antes de la respuesta.
- Tool calling / function calling: soporta la inyeccion de un array JSON de definiciones de funciones en el mensaje de sistema, con esquema de parametros estilo JSON Schema.
- Capacidades multilingues limitadas a indonesio e ingles; no se declara soporte de castellano ni de otras lenguas.
- Entrada exclusivamente de texto: "Input support: text", sin vision ni audio.
- Ajuste por instrucciones (instruction tuning) sobre datos de QA en indonesio, lo que favorece respuestas concisas y ancladas al contexto en ese dominio.
- Sin decodificacion especulativa; no hay aceleracion por draft model en esta version.

## Casos de uso

- QA documental en indonesio: el modelo recibe un contrato, una politica interna o un articulo normativo como contexto y responde preguntas concretas sobre el. Es el escenario para el que fue entrenado explicitamente (Dodol-15k-Indonesia, closed QA), por lo que es donde deberia rendir mejor.
- Atencion al cliente automatizada en indonesio e ingles: con tool calling se puede exponer una funcion `get_order_status` o `consultar_factura` en el mensaje de sistema y dejar que el modelo decida cuando invocarla, devolviendo el resultado al usuario en el mismo turno.
- Enrutado y clasificacion ligera de consultas: por su tamano (1,75 GB en Q4_K_M) puede desplegarse como primer escalon de un pipeline que decida si una consulta requiere un modelo mayor, manteniendo el coste por token proximo a cero en hardware propio.
- Prototipado local de pipelines RAG: sirve para validar plantillas de prompt, estrategias de troceado y formatos de citacion en llama.cpp u Ollama antes de migrar a un modelo mayor, gracias a que cabe entero en memoria.
- Asistentes en dispositivos de borde sin conectividad: con cuantizaciones IQ3_M (1,44 GB) o Q4_K_S (1,66 GB) el modelo corre en CPU sobre equipos con 4-8 GB de RAM, util para aplicaciones de campo en Indonesia o entornos con red intermitente.
- Extraccion de respuestas con traza de razonamiento auditable: la etiqueta `<think>` permite separar el razonamiento de la respuesta final y registrar ambos en sistemas donde se exige trazabilidad de la decision, como triaje de reclamaciones o validacion de requisitos.
- Generacion de resumenes y reescritura en ingles: aunque el entrenamiento esta centrado en indonesio, el modelo declara competencia en ingles y puede usarse para tareas de transformacion de texto de baja complejidad donde no se requiera maxima calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del modelo original ni la del repositorio de cuantizaciones incluyen cifras de MMLU, HumanEval, GSM8K, Indonesian MMLU ni de ninguna otra evaluacion. Tampoco se documentan metricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el fichero elegido (los pesos deben caber en memoria junto con la cache KV, cuyo tamano depende del contexto, no disponible):
  - bf16: 5,40 GB de pesos; 6-7 GB de VRAM en la practica.
  - Q8_0: 2,87 GB.
  - Q6_K_L: 2,48 GB; Q6_K: 2,37 GB; Q6_K_S: 2,27 GB.
  - Q5_K_M: 2,08 GB; Q5_K_S: 1,96 GB.
  - Q4_K_L: 1,86 GB; Q4_K_M: 1,75 GB; IQ4_NL: 1,75 GB; Q4_1: 1,75 GB; Q4_K_S: 1,66 GB; Q4_0: 1,60 GB; IQ4_XS: 1,58 GB.
  - IQ3_M: 1,44 GB; Q3_K_L: 1,43 GB; Q3_K_M: por debajo de 1,43 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas cubre las cuantizaciones de 4 bits. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 permiten ejecutar bf16 con contexto amplio y margen de sobra; para bf16 con contextos largos conviene una A100 o H100 unicamente por comodidad de concurrencia, no por tamano del modelo.
- Cabe holgadamente en GPU consumer, y tambien en CPU: las cuantizaciones de 3-4 bits son viables en portatiles con 8 GB de RAM y, en el caso de IQ3_M, en equipos con 4 GB.
- Opciones de despliegue: llama.cpp (version b11716 o superior, usada para generar los ficheros), llama-cpp-python, Ollama mediante importacion del GGUF con un Modelfile que replique la plantilla de prompt, y LM Studio. El soporte en vLLM o TGI para esta arquitectura no esta confirmado en la informacion disponible; conviene verificar la compatibilidad de la familia LFM2.5 antes de disenar un despliegue de alta concurrencia.
- Latencia y throughput: no disponibles. Al ser un modelo de 2,7 B en 4 bits, se espera que quepa comodamente en memoria y que el cuello de botella sea el ancho de banda, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Orbit-3.2-Nano (este) | 2,7 B | no disponible | apache-2.0 | GGUF (varias quants), safetensors en el repo original | Fine-tune de LFM2.5-2.6B para QA cerrado en indonesio; sin benchmarks publicados |
| LFM2.5-2.6B (Liquid AI) | 2,6 B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base de la cadena; conviene consultar su model card para contexto y licencia |
| Orbit-3.5-Nano (OpenPathAI) | no disponible | no disponible | no disponible | no disponible | Marcado como `new_version` del modelo; sucesor declarado por el autor |
| Qwen3-1.7B | 1,7 B | 32.768 tokens (segun su model card) | Apache 2.0 | safetensors, GGUF de terceros | Alternativa multilingue mas amplia y con benchmarks publicados; no especializada en indonesio |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto declarado y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia cuantitativa de calidad en ninguna tarea, ni siquiera en el dominio para el que fue entrenado. Cualquier decision de produccion deberia ir precedida de una evaluacion propia.
- Riesgo de sobreajuste al dominio: el SFT se hizo sobre un unico dataset de QA cerrado en indonesio (Dodol-15k-Indonesia). Es probable que el modelo degrade en tareas abiertas, generacion creativa o dominios no representados en ese corpus, aunque no hay datos que lo confirmen.
- Idiomas: solo se declaran indonesio e ingles. El castellano no esta soportado oficialmente y no hay informacion sobre su comportamiento en esa lengua.
- Alucinacion en QA cerrado: cuando el contexto proporcionado no contiene la respuesta, el modelo puede completar con conocimiento parametrico en lugar de abstenerse; no se documenta ningun comportamiento de rechazo o calibracion de incertidumbre.
- Longitud de contexto desconocida: no se indica la ventana maxima, lo que impide dimensionar la cache KV y limita el diseno de pipelines RAG. Existe riesgo de truncamiento silencioso.
- Cadena de licencias: el repositorio declara apache-2.0, pero el modelo deriva de LFM2.5-2.6B de Liquid AI a traves de Orbit-3-Nano. Conviene verificar que la licencia del checkpoint base permite la redistribucion y el uso comercial en los terminos declarados antes de un despliegue productivo.
- Modelo practicamente sin adopcion: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones publicas que permitan contrastar su comportamiento real.
- Version superada: la propia model card apunta a OpenPathAI/Orbit-3.5-Nano como `new_version`, por lo que este modelo nace ya como una iteracion anterior.
- Formato de prompt estricto: usar una plantilla distinta a la documentada (incluida la apertura de `<think>`) degrada la calidad de forma dificil de diagnosticar.
- Tamano del repositorio: 41,3 GB en total por acumulacion de cuantizaciones; descargar el repo completo no es necesario y conviene bajar solo el fichero elegido.
- Sin decodificacion especulativa, lo que descarta esa via de aceleracion en entornos de baja latencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/OpenPathAI_Orbit-3.2-Nano-GGUF
- Modelo original: https://huggingface.co/OpenPathAI/Orbit-3.2-Nano
- Version sucesora declarada: https://huggingface.co/OpenPathAI/Orbit-3.5-Nano
- Coleccion Orbit Nano: https://huggingface.co/collections/OpenPathAI/orbit-nano
- Pagina de modelos de OpenPathAI: https://openpath.web.id/models
- Dataset de entrenamiento: https://huggingface.co/datasets/Irza/Dodol-15k-Indonesia
- Perfil del cuantizador: https://huggingface.co/bartowski
- Release de llama.cpp utilizada: https://github.com/ggml-org/llama.cpp/releases/tag/b11716
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/
