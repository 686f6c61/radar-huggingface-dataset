# AXERA-TECH/Qwen3-VL-4B-Instruct-LoRA-AX650

## Resumen

AXERA-TECH/Qwen3-VL-4B-Instruct-LoRA-AX650 es un paquete listo para ejecutar del modelo multimodal Qwen/Qwen3-VL-4B-Instruct sobre placas AX650 / AX650N (aarch64, NPU3). No es un modelo entrenado desde cero: es una distribucion compilada que incluye un servidor `axllm`, 36 capas de texto compiladas a formato AXModel, un codificador de imagen de forma fija (384 × 384) y dos adaptadores LoRA conmutables en tiempo de ejecucion. El objetivo es permitir inferencia de vision-lenguaje completamente local en hardware de borde, sin GPU ni acceso a la nube.

El modelo base aporta unas 4.000 millones de parametros y capacidades de chat de texto y de una sola imagen. El paquete limita el prefill a 1.536 tokens de entrada procesados en fragmentos de 128 y compila un contexto de 2.048 posiciones (el runtime reporta `max_token_len: 2047`). La concurrencia maxima del servidor es de una peticion, y los adaptadores LoRA (`qwen3-vl-lora-chartqa` y `qwen3-vl-lora-design`) se seleccionan mediante el campo `task_id`, con alcance global al proceso.

Su relevancia actual es doble: por un lado demuestra el flujo de despliegue de un VLM de ~4B en NPU de borde con API compatible con OpenAI; por otro, documenta de forma transparente sus limites, incluyendo que en una comprobacion de ChartQA el build solo acerto 2 de 24 preguntas. Es, por tanto, una pieza util para evaluar compilacion y conmutacion dinamica de LoRA en AX650, no un sustituto de una inferencia en GPU para tareas visuales de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador de vision + decodificador de texto) del modelo base Qwen3-VL-4B-Instruct, compilado a AXModel; 36 capas de texto (l0–l35) mas modulo post |
| Parametros totales | Aproximadamente 4.000 millones (modelo base Qwen3-VL-4B-Instruct); la ficha no desglosa el recuento exacto. Los pesos originales de Hugging Face no se incluyen en el repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 posiciones compiladas; limite de prefill de 1.536 tokens de entrada en fragmentos de 128; `max_token_len: 2047` segun el runtime |
| Tipos de cuantizacion | No disponible como conjunto estandar de cuantizaciones: los pesos se distribuyen compilados en `.axmodel`. Las incrustaciones y los dos adaptadores LoRA se almacenan en BF16; existe un segundo codificador de vision en u8 (`Qwen3-VL-4B-Instruct_vision_u8.axmodel`) que el script de arranque no selecciona |
| Idiomas soportados | Ingles (en) y chino (zh), segun los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | AXModel compilado (`.axmodel`), incrustaciones y LoRA en `.bf16.bin`; no se incluyen safetensors ni GGUF |
| Tamano del repositorio | 6,9 GB (6,44 GiB excluyendo el historial de Git) |
| Plataforma objetivo | AX650 / AX650N, aarch64, NPU3 |
| Biblioteca de ejecucion | `axllm` (servidor incluido en `bin/axllm` con `libax_engine.so`) |
| Consumo de CMM en arranque | Aproximadamente 5,93 GiB (incremental) |
| Concurrencia maxima | 1 peticion simultanea |
| Perfil de imagen | 384 × 384 fijo; 144 tokens visuales suaves por imagen (`(384 / 16 / 2)² = 144`, patch de 16 px y fusion espacial de 2) |
| Adaptadores incluidos | `qwen3-vl-lora-chartqa` (preguntas sobre graficos) y `qwen3-vl-lora-design` (asistencia de diseno) |
| Fecha de publicacion | 18 de septiembre de 2026 (actualizado el 20 de septiembre de 2026) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-VL-4B-Instruct: un transformer multimodal con un codificador de vision acoplado a un decodificador de lenguaje, que acepta entrada de texto e imagen y produce texto. En este paquete la topologia se materializa en 39 ficheros AXModel: 36 capas de texto (`qwen3_vl_text_p128_l0_together.axmodel` a `qwen3_vl_text_p128_l35_together.axmodel`), un modulo `qwen3_vl_text_post.axmodel`, un codificador de imagen de forma fija (`Qwen3-VL-4B-Instruct_vision.axmodel`) y una variante u8 del mismo codificador no seleccionada por defecto. El sufijo `p128` de las capas y el limite de prefill de 1.536 tokens en bloques de 128 indican que la compilacion se realizo para formas de entrada fijas por bloques. El modelo de vision usa un patch de 16 pixeles con fusion espacial de 2, lo que produce 144 tokens visuales suaves por imagen a 384 × 384.

No se especifican en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO), ni el procedimiento de entrenamiento de los dos adaptadores LoRA incluidos; solo se indica que se almacenan como cargas de matriz de entrada en BF16 a lo largo de las 36 capas (`layer_00.bf16.bin` ... `layer_35.bf16.bin`, mas un manifiesto por adaptador). La innovacion tecnica destacable de esta distribucion no esta en el entrenamiento sino en el despliegue: compilacion del VLM a un runtime propio sobre NPU, carga y conmutacion dinamica de adaptadores LoRA en tiempo de ejecucion (con alcance global al proceso) y exposicion mediante una API de chat compatible con OpenAI.

## Capacidades

- Generacion de texto conversacional: chat multi-turno breve dentro del limite de contexto de 2.048 posiciones.
- Comprension de una unica imagen (image-text-to-text): el runtime redimensiona la entrada al perfil fijo de 384 × 384 y anade 144 tokens visuales suaves a la peticion.
- Preguntas sobre graficos mediante el adaptador `qwen3-vl-lora-chartqa`, con precision limitada (ver la seccion de benchmarks).
- Asistencia de diseno mediante el adaptador `qwen3-vl-lora-design` (ejemplo documentado: nombrar tres colores que combinen con azul marino).
- Conmutacion dinamica de tareas: el campo `task_id` de cada peticion selecciona el adaptador LoRA activo.
- Servicio compatible con la API de chat de OpenAI (`/v1/chat/completions`) y endpoints de salud y listado de modelos (`/health`, `/v1/models`).
- Entrada de imagen como data URL en base64 en la peticion de chat.
- Multilingue limitado a ingles y chino segun los metadatos declarados.
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso explicito, modo thinking, audio ni video en la informacion disponible.

## Casos de uso

- Inferencia de vision-lenguaje en el borde sin nube: el paquete se ejecuta integramente en una placa AX650 con un consumo de CMM de aproximadamente 5,93 GiB, lo que permite desplegar descripcion de imagenes o respuesta a preguntas visuales en instalaciones sin conectividad ni GPU.
- Asistente de diseno embebido: usando `task_id: qwen3-vl-lora-design` se pueden generar sugerencias breves de color, composicion o estilo en herramientas de diseno locales; el ejemplo de la model card devuelve "White, beige, gold" ante una consulta de paleta.
- Extraccion de respuestas sobre graficos en paneles internos: con `task_id: qwen3-vl-lora-chartqa` el modelo responde a preguntas de un grafico empaquetado (por ejemplo `assets/chartqa_00.png`), pero solo debe emplearse con verificacion humana dado que el propio autor reporta 2 aciertos de 24 en su comprobacion de ChartQA.
- Chat de texto para interfaces de dispositivo: el endpoint compatible con OpenAI permite conectar una UI o un bot existente cambiando unicamente la URL base y el identificador de modelo, con TTFT de 1.031 ms para peticiones de 34 tokens.
- Validacion de pipelines de compilacion NPU: sirve como banco de pruebas para medir prefill por bloques de 128, TTFT y consumo de CMM antes de portar otros modelos a AX650.
- Investigacion sobre adaptadores LoRA conmutables: el paquete incluye 36 ficheros BF16 por adaptador y un manifiesto, lo que permite estudiar coste de carga (2.189 ms de TTFT en la primera peticion tras cambiar de adaptador) y estrategias de enrutado por tarea.
- Prototipos de vision en escenarios con requisitos de privacidad: al no salir la imagen del dispositivo, encaja en entornos industriales o sanitarios donde no se permite enviar capturas a servicios externos, siempre que la tarea tolera la resolucion de 384 × 384.
- Demostraciones y evaluaciones de latencia en ferias o laboratorios: con concurrencia 1 y peticiones seriales, permite caracterizar el comportamiento del borde con cargas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU, etc.) en la informacion disponible. El autor unicamente publica mediciones de TTFT en placa AX650 / NPU3 con peticiones seriales:

| Peticion | Tokens de entrada | Fragmentos de prefill | TTFT |
|---|---:|---:|---:|
| Texto corto, adaptador ChartQA | 34 | 1 | 1.031 ms |
| Texto medio, adaptador ChartQA | 575 | 5 | 6.918 ms |
| Texto largo, adaptador ChartQA | 995 | 8 | 14.246 ms |
| Primera peticion de texto tras cambiar a Design | 32 | 1 | 2.189 ms |
| Imagen de grafico empaquetada, adaptador ChartQA | 173 | 2 | 2.828 ms |

Los prompts de 575 y 995 tokens usaron una lista de palabras repetidas y solicitaban una respuesta de una sola palabra; ambos devolvieron la palabra pedida. La primera peticion tras un cambio de adaptador incluye la carga y el reenlazado del mismo. La peticion de imagen cruza el primer fragmento de prefill de 128 tokens porque sus 144 tokens visuales suaves se suman al prompt.

Comprobacion de precision visual reportada por el autor: en un test de ChartQA con el perfil fijo de 384 × 384, este build respondio correctamente 2 de 24 preguntas. No se publican cifras de throughput (tokens por segundo) ni de latencia de decodificacion.

Consumo en arranque:

| Elemento | Valor |
|---|---:|
| Tamano del paquete, excluyendo historial de Git | 6,44 GiB |
| CMM usada por el servidor (incremental) | aproximadamente 5,93 GiB |

El paquete incluye 39 AXModels, pesos de incrustacion, ambos adaptadores LoRA y ficheros de runtime; el uso de CMM puede variar segun el entorno de ejecucion.

## Requisitos de hardware

- Plataforma obligatoria: placa AX650 o AX650N aarch64 con NPU3. Los pesos compilados no son ejecutables en GPU de escritorio, CPU x86 ni en otras NPU.
- Memoria: el servidor reserva aproximadamente 5,93 GiB de CMM de forma incremental; el paquete ocupa 6,44 GiB en disco sin contar el historial de Git (6,9 GB de repositorio en Hugging Face).
- GPU: no aplica. No hay soporte documentado para A100, H100, RTX 4090 ni otras GPU; el modelo base Qwen3-VL-4B-Instruct si podria ejecutarse en GPU con frameworks estandar, pero esas rutas no forman parte de este paquete.
- GPU de consumo: no aplica a este artefacto; el objetivo es una NPU de borde.
- Despliegue: servidor `axllm` incluido (`bin/axllm serve`), lanzado con `./start_axllm.sh 8000`, que configura la ruta de `libax_engine.so` y sirve una API compatible con OpenAI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con estos pesos compilados.
- Latencia: TTFT de 1.031 ms a 14.246 ms segun el numero de tokens de entrada (1 a 8 fragmentos de prefill); 2.828 ms para una imagen de grafico de 173 tokens de entrada.
- Concurrencia: maxima de una peticion; las peticiones deben enviarse en serie, especialmente al cambiar de adaptador, ya que la seleccion de LoRA es global al proceso.
- Arranque y cambio de adaptador: la primera peticion tras cambiar de adaptador anadio 2.189 ms de TTFT frente a 1.031 ms de una peticion corta equivalente, por el coste de carga y reenlazado.

## Comparativa con modelos similares

La informacion disponible no incluye datos de benchmarks comparativos con otros VLM de tamano similar, por lo que la comparacion se limita al propio modelo base en su formato original.

| Criterio | Este paquete (AX650) | Qwen/Qwen3-VL-4B-Instruct original |
|---|---|---|
| Parametros | Aproximadamente 4.000 millones (base) | Aproximadamente 4.000 millones |
| Contexto | 2.048 posiciones compiladas; prefill limitado a 1.536 tokens | No disponible en la informacion proporcionada |
| Formato de pesos | AXModel compilado + BF16 para incrustaciones y LoRA | Pesos originales de Hugging Face (no incluidos en este repositorio) |
| Hardware | AX650 / AX650N con NPU3, aarch64 | GPU o CPU con frameworks estandar |
| Licencia | Apache 2.0 | Apache 2.0 (segun los metadatos de este repositorio; conviene verificar los terminos del repositorio base) |
| Adaptadores | Dos LoRA incluidos y conmutables por `task_id` | No incluye adaptadores |
| Concurrencia | 1 peticion | No aplica al formato de pesos |
| Idiomas declarados | en, zh | No disponible en la informacion proporcionada |

Frente a otros VLM de rango 2B–4B (por ejemplo alternativas de la familia Qwen-VL o InternVL de tamano comparable), no hay datos de rendimiento en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- Precision visual reducida con el perfil empaquetado: el autor reporta 2 aciertos de 24 en una comprobacion de ChartQA con la entrada fija de 384 × 384, y advierte que la lectura de detalles finos en graficos no es fiable.
- Precision de tarea de los adaptadores: la propia model card indica que los ejemplos demuestran carga y conmutacion dinamica de LoRA y que su precision puede ser insuficiente para uso practico.
- Contexto corto: 2.048 posiciones compiladas y un prefill de 1.536 tokens repartidos en fragmentos de 128, con `max_token_len: 2047`; hay que reservar espacio para la respuesta generada y contar los 144 tokens visuales dentro de ese presupuesto.
- Concurrencia limitada a una peticion: no es adecuado para servicios multiusuario sin una capa de encolado externa.
- Seleccion de adaptador global al proceso: al cambiar de `task_id` hay que serializar las peticiones para evitar mezclas de tareas y asumir el coste de recarga.
- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta documentado ni garantizado.
- Una sola imagen por peticion: no se documenta soporte multi-imagen, video ni audio.
- Riesgo de alucinacion: inherente a los modelos de vision-lenguaje; la model card recomienda comprobar las respuestas basadas en imagenes antes de confiar en ellas.
- Dependencia de plataforma: los pesos compilados solo funcionan en AX650 / AX650N con NPU3 y con la biblioteca de runtime incluida; no hay portabilidad a GPU ni a otros aceleradores.
- Pesos originales no incluidos: para reentrenar, cuantizar o ejecutar el modelo en otro backend hay que acudir al repositorio del modelo base.
- Licencia: el paquete se distribuye bajo Apache 2.0, pero conviene revisar los terminos del modelo base Qwen3-VL-4B-Instruct y de los datos usados por los adaptadores antes de un despliegue comercial.
- Trazabilidad limitada: no se documentan los datos de entrenamiento del modelo base ni de los adaptadores, ni los procedimientos de alineacion aplicados.
- Madurez: 24 descargas y 1 "like" en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-VL-4B-Instruct-LoRA-AX650
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas no relacionadas de reservas de hotel), por lo que no se pueden enlazar papers, blogs ni demostraciones adicionales.
