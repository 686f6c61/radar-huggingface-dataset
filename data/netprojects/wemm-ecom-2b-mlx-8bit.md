# netprojects/WeMM-Ecom-2B-MLX-8bit

## Resumen

WeMM-Ecom-2B-MLX-8bit es la conversion a formato MLX, cuantizada a 8 bits, del modelo multimodal tencent/WeMM-Ecom-2B, desarrollado por Tencent (WeChat Vision) y afinado a partir de Qwen3.5. Se trata de un modelo vision-language especializado en comercio electronico que procesa imagenes de producto, multiples imagenes simultaneamente y video junto con texto, en chino e ingles. Esta build concreta la publica NetProjects (Internet Projects Ltd), que no tiene vinculacion con Tencent ni con Alibaba, y esta pensada para ejecucion local en Apple Silicon.

El modelo resuelve tareas tipicas de e-commerce: generacion de titulos y descripciones de producto, extraccion de atributos, comparacion entre listados, analisis de imagenes multiples y comprension de video promocional. Incorpora modo de razonamiento hibrido: el "thinking" esta activado por defecto y puede desactivarse por peticion mediante el parametro `enable_thinking`, lo que permite alternar entre respuestas directas (instruct) y respuestas razonadas.

La relevancia de esta build radica en que reduce un modelo de 2.213.241.664 parametros a 2,7 GB en disco con una fidelidad alta respecto a los pesos bf16 originales (98,3% de coincidencia en el siguiente token, KL media de 0,0010), lo que lo hace viable en equipos Mac con memoria unificada moderada. La licencia es Apache-2.0, igual que la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base Qwen3.5), con vision encoder incluido; conversion MLX con mlx-vlm |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits affine, group size 64 (esta build); existe tambien una build de 4 bits del mismo autor |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 (fichero LICENSE de Tencent sin modificar, con seccion de terceros para Qwen3.5 de Alibaba Cloud) |
| Formato de pesos | safetensors en formato MLX (libreria mlx, mlx-vlm) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5, un transformer vision-language al que se anade un encoder de vision; la build MLX incluye dicho encoder de vision en todos sus artefactos. El modelo base WeMM-Ecom-2B es un afinado de Qwen3.5 realizado por Tencent (WeChat Vision) orientado a escenarios de comercio electronico, con soporte de entrada multimodal que combina texto, una o varias imagenes y video. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion no esta en el entrenamiento, sino en la conversion: NetProjects verifica que todos los ficheros del repositorio original en la revision `6ae63ec` coinciden en tamano y SHA-256 con el Hub, conserva sin cambios el tokenizer, la plantilla de chat y los ficheros de procesador de Tencent, y mide la fidelidad frente a los pesos bf16 originales cargados directamente en mlx-vlm (10 prompts cortos en ingles y chino, 4 con thinking activado y 6 desactivado, 353 posiciones teacher-forced). El resultado es un 98,3% de coincidencia en el siguiente token para la build de 8 bits y un 92,1% para la de 4 bits. El modelo incorpora ademas un modo de razonamiento hibrido conmutable por peticion.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de imagenes de producto y texto.
- Comprension de multiples imagenes en una misma peticion (por ejemplo, comparar dos listados o dos variantes de color de un mismo producto).
- Comprension de video junto con texto.
- Modo de razonamiento hibrido: thinking activado por defecto y desactivable por peticion mediante `enable_thinking`, con parametros de muestreo recomendados distintos para cada modo.
- Generacion de contenido de e-commerce: titulos de producto, puntos de venta, descripciones y extraccion de atributos como color o precio.
- Capacidades multilingues limitadas a chino e ingles.
- Servido mediante API compatible con OpenAI a traves de `mlx_vlm.server`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y razonamiento multi-paso mas alla del modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de titulos y descripciones de producto: a partir de una fotografia de producto, el modelo produce un titulo corto y tres puntos de venta, tal como demuestra el ejemplo de la model card con una camiseta azul con etiqueta de precio de 99 yuanes.
- Extraccion de atributos de catalogo: identificacion de color, tipo de producto y precio visible en la imagen para poblar fichas de catalogo de forma semiautomatica.
- Comparacion de listados duplicados: con dos imagenes de entrada y thinking activado, el modelo razona si dos anuncios corresponden al mismo producto y explica las diferencias, util en tareas de deduplicacion de marketplace.
- Analisis de variantes de producto: comparacion de la misma prenda en distintos colores u otras variantes visuales para generar contenido comparativo o fichas de familia de producto.
- Moderacion y control de calidad de contenido de vendedores: revision de imagenes y textos de listados para detectar inconsistencias entre la foto y la descripcion declarada.
- Analisis de video promocional: comprension de video junto con texto para resumir o etiquetar contenido audiovisual de producto.
- Procesamiento local en Mac: despliegue de un pipeline de vision-lenguaje de e-commerce en Apple Silicon sin depender de servicios en la nube, con un pico de memoria de 3,5 GB en la prueba de imagen.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card del autor remite a las tablas de benchmarks de Tencent en la model card original (comparativas de e-commerce y generales, en modo instruct y modo thinking), presentadas como imagenes sin cifras transcritas.

Lo que si se documenta son metricas de fidelidad de la cuantizacion frente a los pesos bf16 originales:

| Build | Tamano | Mismo siguiente token que el original bf16 | KL media vs original | Memoria pico, prueba de imagen |
|---|---|---|---|---|
| MLX-8bit (recomendada) | 2,7 GB | 98,3% | 0,0010 | 3,5 GB |
| MLX-4bit | 1,7 GB | 92,1% | 0,0808 | 2,6 GB |

Mediciones realizadas en un MacBook Pro M5 Max de 128 GB, el 25 de noviembre de 2026, con mlx 0.32.4 y mlx-vlm 0.7.11, sobre 10 prompts cortos en ingles y chino y 353 posiciones teacher-forced.

## Requisitos de hardware

- VRAM/memoria estimada: 3,5 GB de pico en la prueba de imagen con la build de 8 bits; 2,6 GB con la build de 4 bits. El repositorio ocupa 2,7 GB en disco.
- Plataforma objetivo: Apple Silicon exclusivamente, al estar en formato MLX; no es ejecutable directamente en GPU NVIDIA sin conversion.
- GPU recomendadas: no se indican modelos concretos; el entorno de validacion es un MacBook Pro con chip M5 Max y 128 GB de memoria unificada. La build de 4 bits esta pensada para Macs con menos memoria.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no aplica a GPU de consumo NVIDIA en este formato.
- Opciones de despliegue: mlx-vlm (CLI `mlx_vlm.generate` y API Python), y `mlx_vlm.server` para servir el modelo con API compatible con OpenAI. Requiere mlx-vlm >= 0.7.11.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/WeMM-Ecom-2B-MLX-8bit | 2.213.241.664 | no disponible | MLX 8-bit, Apple Silicon | Apache-2.0 | 98,3% de coincidencia con el original bf16; 2,7 GB |
| netprojects/WeMM-Ecom-2B-MLX-4bit | 2.213.241.664 | no disponible | MLX 4-bit, Apple Silicon | Apache-2.0 | 92,1% de coincidencia; 1,7 GB; para Macs con menos memoria |
| tencent/WeMM-Ecom-2B | 2.213.241.664 | no disponible | safetensors bf16 | Apache-2.0 | Modelo original de referencia, sin cuantizar |

No se dispone en la informacion proporcionada de comparativas con modelos de otros fabricantes de tamano o tarea equivalentes.

## Limitaciones y advertencias

- Idiomas limitados a chino e ingles; no se declara soporte de castellano ni de otros idiomas.
- Especializado en dominio de comercio electronico; su comportamiento fuera de ese ambito puede ser inferior al de un modelo generalista del mismo tamano.
- Riesgo de alucinacion en la descripcion de atributos de producto (precio, color, material) derivado de la imagen; conviene validar las extracciones en produccion.
- La cuantizacion introduce desviacion respecto al modelo original: 1,7% de discrepancias en el siguiente token en 8 bits y 7,9% en 4 bits, con KL media de 0,0010 y 0,0808 respectivamente.
- El modo thinking esta activado por defecto y consume mas tokens; para respuestas directas hay que desactivarlo con `enable_thinking=False` y usar los parametros de muestreo recomendados para instruct (temperature 0,7; top_p 0,8; top_k 20; presence_penalty 1,5).
- Formato MLX: no es portable a otros runtimes sin conversion; la build solo se ha validado en Apple Silicon.
- Publicada por NetProjects, no afiliada a Tencent ni a Alibaba; el soporte y las actualizaciones dependen de ese tercero.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el fichero LICENSE de Tencent y su seccion de terceros relativa a Qwen3.5, asi como el NOTICE con la atribucion a Tencent y al equipo de Qwen.
- No se dispone de informacion sobre sesgos conocidos, longitud de contexto ni limites de tokens de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/WeMM-Ecom-2B-MLX-8bit
- Modelo base original: https://huggingface.co/tencent/WeMM-Ecom-2B
- Build de 4 bits del mismo autor: https://huggingface.co/netprojects/WeMM-Ecom-2B-MLX-4bit
- Resto de builds MLX de NetProjects: https://huggingface.co/netprojects
- Sitio del publicador: https://netprojects.com
