# netprojects/Inkling-2-Mini-MLX-4-8bit

## Resumen

Inkling 2 Mini MLX 4/8-bit es una conversión a MLX del modelo Thinking Machines/Inkling-2-Mini, un mixture-of-experts (MoE) con lazo ("looped") de 26.400 millones de parámetros totales y unos 3.400 millones activos por token. La conversión la firma el usuario netprojects y está pensada para inferencia nativa en Apple Silicon mediante la librería MLX y MLX-VLM. El modelo original es multimodal (texto e imagen) y está orientado a tareas conversacionales con razonamiento extenso y tool calling.

La particularidad de esta versión es que respeta la cuantización original de los expertos enrutados que publicó Thinking Machines: NVFP4 de 4 bits en las capas 0 a 19 y MXFP8 de 8 bits en las capas 20 a 23, repaquetados a los formatos nativos de MLX (nvfp4 y mxfp8) sin alterar los valores. Las capas de atención, embeddings, capa de salida y el codificador visual permanecen en bf16. El resultado ocupa 19,5 GB más 0,64 GB del borrador de decodificación especulativa DSpark, lo que lo sitúa como la compilación recomendada para Macs con 48 GB de memoria unificada o más.

Su relevancia actual radica en que permite ejecutar un modelo MoE de 26,4B con contexto declarado de hasta 1M de tokens en hardware de consumo Apple, apoyándose en decodificación especulativa (DSpark) y en una fidelidad de token siguiente del 98,4 % respecto a la implementación de referencia en Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con lazo ("inkling2_loop"); 24 capas, de las cuales las 12 centrales se ejecutan tres veces (48 pasadas de capa por token); incluye codificador visual |
| Parametros totales | 26.388.641.280 (26,4B) |
| Parametros activos | ~3,4B por token |
| Longitud de contexto | Hasta 1.000.000 de tokens (según model card del autor) |
| Tipos de cuantizacion | 4-bit NVFP4 (capas 0-19) y 8-bit MXFP8 (capas 20-23) en expertos enrutados; bf16 en atención, embeddings, capa de salida y codificador visual; existen variantes 2-bit, 2.5-bit, 3-bit y 4-bit LayerFit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); borrador DSpark en `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con una innovación estructural denominada "looped": de las 24 capas totales, las doce intermedias se recorren tres veces por token, lo que da 48 pasadas de capa efectivas. Solo se activan aproximadamente 3,4B de los 26,4B de parámetros por token, lo que reduce el coste computacional manteniendo la capacidad total. La arquitectura integra además un codificador visual, lo que habilita la entrada image-text-to-text, y un cabezal de decodificación especulativa DSpark empaquetado como borrador (`mtp.safetensors`).

En cuanto al entrenamiento, la información disponible no detalla el volumen de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La model card del autor de la conversión menciona únicamente que se respetaron los pesos originales de Thinking Machines (revisión `6e7c824`) y que la cuantización de los expertos es la de la release oficial. El modelo incorpora un parámetro `reasoning_effort` en su plantilla de chat con niveles `none`, `minimal`, `low`, `medium`, `high` (por defecto), `xhigh`, `max` o un valor numérico entre 0,0 y 0,99, lo que sugiere un entrenamiento orientado a razonamiento configurable.

## Capacidades

- Generación de texto conversacional multi-turno con contexto declarado de hasta 1M de tokens.
- Razonamiento configurable mediante `reasoning_effort` (de `none` a `max` o valor numérico 0,0-0,99).
- Entrada multimodal de imagen y texto (pipeline image-text-to-text), con codificador visual incluido.
- Tool calling / function calling en formato OpenAI `tool_calls` a través de `mlx_vlm.server` con el paquete `internet-projects/inkling2-mlx`.
- Decodificación especulativa con el borrador DSpark incluido, que acelera la generación manteniendo la salida greedy del modelo (salvo empates cercanos).
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente de terminal con capturas de pantalla: el modelo puede recibir una imagen de una terminal o un error y responder en texto, como muestra el ejemplo de la model card ("What error does this terminal show?"); útil para herramientas de soporte a desarrolladores en Mac.
- Análisis de documentos largos: con contexto declarado de hasta 1M de tokens, puede procesar repositorios, contratos o bases de código extensas en una sola pasada, sin necesidad de fragmentación.
- Atención al cliente automatizada: la ventana de contexto amplia permite mantener historiales de conversación muy largos y adjuntar capturas o imágenes de producto, con razonamiento ajustable para equilibrar latencia y calidad.
- Agentes con tool calling: integrable en `mlx_vlm.server` con parser de tool calls de OpenAI, lo que permite orquestar llamadas a funciones externas en flujos multi-paso sobre hardware Apple.
- Generación de código asistida en local: con 3,4B activos por token y decodificación especulativa DSpark, es viable en un Mac de 48 GB o más para autocompletado y explicación de código sin enviar datos a la nube.
- Prototipado de investigación en Apple Silicon: permite reproducir experimentos con un MoE de 26,4B y contexto de 1M en un equipo de sobremesa, con fidelidad del 98,4 % en el token siguiente respecto a la implementación de referencia.
- Extracción de información de capturas y formularios: el codificador visual y el pipeline image-text-to-text permiten transcribir y estructurar datos de imágenes en local.

## Benchmarks y rendimiento

Los datos disponibles son los publicados por el autor de la conversión, centrados en fidelidad respecto a la implementación de referencia y en una prueba de GSM8K de 50 preguntas. No se dispone de MMLU, HumanEval ni otros benchmarks estándar en la información proporcionada.

| Build | Tamano | Mismo token siguiente que el codigo de Thinking Machines | KL vs su codigo | GSM8K (50 preguntas) | Memoria pico, prompt de 8K tokens |
|---|---|---|---|---|---|
| 4/8-bit (esta build) | 19,5 GB + 0,64 GB borrador | 98,4 % | 0,0018 | 47/50 | 27,8 GB |
| LayerFit 3-bit | 14,1 GB + 0,64 GB borrador | 95,5 % | 0,0225 | 45/50 | 21,4 GB |
| LayerFit 2.5-bit | 10,8 GB + 0,64 GB borrador | 91,0 % | 0,0656 | 46/50 | 18,25 GB |
| LayerFit 2-bit | 9,5 GB + 0,64 GB borrador | 90,2 % | 0,1066 | 47/50 | 17,05 GB |
| LayerFit 4-bit | 16,5 GB + 0,64 GB borrador | 97,7 % | 0,0101 | 46/50 | 23,6 GB |

## Requisitos de hardware

- Memoria unificada recomendada: 48 GB o más para esta build de 19,5 GB + 0,64 GB de borrador; el autor la marca como "recommended" a partir de 48 GB.
- Memoria pico medida: 27,8 GB con un prompt de 8K tokens en esta build.
- Macs de 32 GB: builds LayerFit 3-bit (14,1 GB) o 4-bit (16,5 GB).
- Macs de 24 GB: build LayerFit 2.5-bit (10,8 GB).
- Macs de 16 GB: build LayerFit 2-bit (9,5 GB), marcada como "stretch"; requiere cerrar otras aplicaciones y limitar prompts a unos miles de tokens, con posible ajuste `sudo sysctl iogpu.wired_limit_mb=12800`.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; esta build es específica para Apple Silicon vía MLX.
- Opciones de despliegue: MLX-VLM desde `main` (soporte desde el 21 de noviembre de 2026, aún no en PyPI) o `internet-projects/inkling2-mlx@v0.2.7` para tool calls; servidor mediante `mlx_vlm.server --model ... --draft-model ... --draft-kind dflash`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini MLX 4/8-bit (esta build) | 26,4B | ~3,4B | hasta 1M | Apache 2.0 | Hugging Face, MLX |
| Inkling-2-Mini LayerFit 4-bit | 26,4B | ~3,4B | hasta 1M | Apache 2.0 | Hugging Face, MLX |
| Inkling-2-Mini LayerFit 2-bit | 26,4B | ~3,4B | hasta 1M | Apache 2.0 | Hugging Face, MLX |

No se dispone en la información proporcionada de datos sobre modelos de otros fabricantes comparables en tamaño o tarea (por ejemplo, otros MoE multimodales de ~26B); por tanto, la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- El modelo puede "pensar" durante mucho tiempo incluso con `reasoning_effort=none` y quedarse atrapado en bucles de razonamiento largos; se recomienda fijar siempre `max_tokens`.
- La decodificación especulativa con DSpark mantiene la salida greedy del modelo "hasta empates cercanos", lo que implica que en casos de empate el resultado puede diferir del modelo sin borrador.
- La build requiere MLX-VLM desde `main` (no disponible aún en PyPI al publicarse la model card); los pesos se renombraron el 21 de noviembre de 2026 (tensores de loop-gate), por lo que descargas anteriores deben repetirse.
- Solo funciona en Apple Silicon; no es desplegable en GPU NVIDIA/AMD ni en CPU convencional con este formato.
- El rendimiento en GSM8K medido es de 47/50 sobre una muestra pequeña (50 preguntas), insuficiente para extrapolar a rendimiento general.
- Idiomas soportados no documentados; riesgo de comportamiento degradado en lenguas distintas de las mayoritarias del entrenamiento (no especificadas).
- No se detalla la composición del dataset de entrenamiento ni si hubo RLHF/DPO, lo que limita la evaluación de sesgos y alucinaciones.
- Licencia Apache 2.0 permite uso comercial, pero la model card no incluye cláusulas adicionales de responsabilidad sobre el modelo base.
- El tamaño del repo es de 39,7 GB, superior al peso final de la build (19,5 GB + 0,64 GB), presumiblemente por artefactos intermedios; conviene verificar el espacio en disco antes de la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de tool calls: https://github.com/internet-projects/inkling2-mlx
- Instalación MLX-VLM desde main: https://github.com/Neywa-Labs/mlx-vlm
- Build LayerFit 2-bit: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-2bit
- Build LayerFit 2.5-bit: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-2.5bit
- Build LayerFit 3-bit: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-3bit
- Build LayerFit 4-bit: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-4bit
- Perfil del autor: https://huggingface.co/netprojects
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
