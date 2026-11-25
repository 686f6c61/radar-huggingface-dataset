# netprojects/WeMM-Ecom-9B-MLX-6bit

## Resumen

WeMM-Ecom-9B-MLX-6bit es una conversion a MLX del modelo WeMM-Ecom-9B de Tencent (WeChat Vision), una familia de modelos vision-language especializados en comercio electronico y afinados a partir de Qwen3.5. Esta build concreta, publicada por NetProjects (Internet Projects Ltd), empaqueta los pesos en formato MLX cuantizados a 6 bits con el objetivo de ejecutar el modelo de forma nativa en Apple Silicon, incluyendo el codificador visual.

El modelo resuelve tareas multimodales propias del ambito e-commerce: lectura de imagenes de producto, comparacion de multiples imagenes en una misma peticion y comprension de video junto con texto, tanto en chino como en ingles. Incorpora un modo de razonamiento hibrido (thinking) activado por defecto y desactivable por peticion mediante el parametro `enable_thinking`.

La relevancia de esta build radica en que permite desplegar un modelo de 9.409.813.744 parametros en un Mac con memoria unificada, con un tamano de repositorio de 8,2 GB y un pico de memoria medido de 8,7 GB en una prueba con imagen. Segun las mediciones del autor, conserva el 98,0% del siguiente token respecto a los pesos bf16 originales, con una KL media de 0,0043.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) derivado de Qwen3.5, con codificador visual incluido |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afina (affine), group size 64; existen builds del mismo autor en 8 bits y 4 bits |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`, `mlx-vlm`) |

## Arquitectura y entrenamiento

WeMM-Ecom-9B es un modelo vision-language construido sobre Qwen3.5 y afinado por Tencent (WeChat Vision) para el dominio del comercio electronico. Procesa entradas de tipo image-text-to-text, admite varias imagenes en una misma peticion y tambien video combinado con texto. Dispone de un modo de razonamiento hibrido: el bloque de pensamiento se emite antes de la respuesta y puede desactivarse por peticion con `enable_thinking`.

Esta build concreta no reentrena el modelo: es una conversion de pesos a MLX realizada con `mlx-vlm` sobre la revision `9761812` de `tencent/WeMM-Ecom-9B`. La cuantizacion es afina de 6 bits con group size 64 y el codificador visual se incluye en la conversion. Los ficheros de tokenizer, chat template y processor son los originales de Tencent, sin modificar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) empleadas en el modelo base.

## Capacidades

- Generacion de texto e imagen-texto en chino e ingles.
- Comprension de imagenes de producto: identificacion de objeto, color, precio y atributos visibles.
- Razonamiento sobre multiples imagenes en una misma peticion (por ejemplo, comparar dos listados del mismo producto).
- Comprension de video junto con texto.
- Modo thinking hibrido: razonamiento previo a la respuesta, activado por defecto y desactivable con `enable_thinking=False`.
- Redaccion de contenido comercial: titulos de producto, puntos de venta y descripciones.
- Servido mediante API compatible con OpenAI a traves de `mlx_vlm.server`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de titulos y fichas de producto: a partir de una fotografia, el modelo produce un titulo corto y tres puntos de venta, tal como se demuestra en el ejemplo oficial de la model card con `mlx_vlm.generate`.
- Comparacion de listados duplicados: con dos imagenes en la misma peticion y thinking activado, el modelo explica las diferencias entre dos publicaciones del mismo articulo, util para moderacion de catalogo.
- Enriquecimiento de catalogo en lote: procesar imagenes de producto en un Mac para extraer atributos (color, tipo de prenda, precio visible) y poblar metadatos sin depender de servicios en la nube.
- Analisis de video de producto: resumir o describir contenido de video junto con texto para generar descripciones de demostraciones o tutoriales de uso.
- Asistencia a vendedores: redactar respuestas y descripciones en chino o ingles a partir de imagenes enviadas por el comerciante, con el modo instruct para respuestas directas y baja latencia.
- Prototipado local en Apple Silicon: validar flujos multimodales de e-commerce en un portatil antes de desplegar la version bf16 en infraestructura GPU, gracias al pico de memoria de 8,7 GB.
- Moderacion de contenido visual: comprobar que la imagen de un listado coincide con la categoria y atributos declarados en el texto.

## Benchmarks y rendimiento

La model card de esta build remite a las tablas de benchmarks de Tencent en la model card original (comparativas de e-commerce y generales, en modo instruct y thinking), presentadas como imagenes y sin cifras transcritas. No se han publicado resultados numericos de benchmarks en la informacion disponible.

Si se dispone de las metricas de fidelidad de la cuantizacion publicadas por el autor:

| Build | Tamano | Mismo siguiente token que el bf16 original | KL media vs original | Pico de memoria (prueba con imagen) |
|---|---|---|---|---|
| MLX 6 bits (esta build) | 8,2 GB | 98,0% | 0,0043 | 8,7 GB |
| MLX 8 bits | 10,4 GB | 99,1% | 0,0008 | 10,8 GB |
| MLX 4 bits | 6,0 GB | 94,2% | 0,0517 | 6,6 GB |

Mediciones realizadas en un MacBook Pro M5 Max de 128 GB, el 25 de noviembre de 2026, con mlx 0.32.4 y mlx-vlm 0.7.11, sobre 10 prompts cortos en ingles y chino (thinking activado en 4 y desactivado en 6) y 345 posiciones forzadas por el profesor.

## Requisitos de hardware

- Memoria: pico medido de 8,7 GB con una imagen en la build de 6 bits; 10,8 GB para la de 8 bits y 6,6 GB para la de 4 bits.
- Plataforma: exclusivamente Apple Silicon (MLX); no es una build para GPU NVIDIA.
- Equipo de referencia de las pruebas: MacBook Pro con chip M5 Max y 128 GB de memoria unificada.
- Cabe en equipos de consumo Apple: si, siempre que la memoria unificada disponible supere el pico indicado; la build de 4 bits (6,0 GB) es la opcion para Macs con menos memoria.
- Despliegue: `mlx-vlm` (version >= 0.7.11) mediante CLI `mlx_vlm.generate` o API Python, y `mlx_vlm.server` para servir con API compatible con OpenAI.
- vLLM, llama.cpp, Ollama y TGI: no disponibles para este formato MLX segun la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-9B-MLX-6bit (esta build) | 9.409.813.744 | no disponible | MLX, 6 bits, Apple Silicon | Apache-2.0 | Especializado en e-commerce; thinking hibrido; 98,0% de acuerdo con el bf16 original |
| tencent/WeMM-Ecom-9B (original) | 9.409.813.744 | no disponible | safetensors bf16 | Apache-2.0 | Referencia de fidelidad; requiere hardware con mayor memoria |
| netprojects/WeMM-Ecom-9B-MLX-8bit | 9.409.813.744 | no disponible | MLX, 8 bits | Apache-2.0 | 99,1% de acuerdo; 10,4 GB |
| netprojects/WeMM-Ecom-9B-MLX-4bit | 9.409.813.744 | no disponible | MLX, 4 bits | Apache-2.0 | 94,2% de acuerdo; 6,0 GB, para Macs con menos memoria |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles; no se declara soporte de castellano ni de otros idiomas.
- Ambito: el modelo esta afinado para e-commerce; su comportamiento fuera de ese dominio puede degradarse respecto a Qwen3.5 base.
- Cuantizacion: la build de 6 bits conserva el 98,0% del siguiente token, pero introduce una desviacion medible (KL media 0,0043); para maxima fidelidad debe usarse la de 8 bits.
- Modo thinking: activado por defecto, lo que incrementa el consumo de tokens; debe desactivarse explicitamente con `enable_thinking=False` cuando se busque respuesta directa.
- Plataforma: los pesos MLX no son portables a ecosistemas CUDA; para GPU NVIDIA hay que usar los pesos originales.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en tareas de extraccion de atributos de producto conviene validar las salidas.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Licencia: Apache-2.0 permite uso comercial; el fichero `LICENSE` es el de Tencent, con su seccion de terceros para Qwen3.5 (Alibaba Cloud, Apache-2.0).
- Publicacion: build no oficial, realizada por NetProjects, sin afiliacion con Tencent ni Alibaba; el autor no ofrece garantias sobre el modelo convertido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/WeMM-Ecom-9B-MLX-6bit
- Modelo base original: https://huggingface.co/tencent/WeMM-Ecom-9B
- Build MLX 8 bits: https://huggingface.co/netprojects/WeMM-Ecom-9B-MLX-8bit
- Build MLX 4 bits: https://huggingface.co/netprojects/WeMM-Ecom-9B-MLX-4bit
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
