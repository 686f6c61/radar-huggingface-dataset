# netprojects/WeMM-Ecom-0.8B-MLX-bf16

## Resumen

WeMM-Ecom-0.8B es un modelo de vision-lenguaje especializado en comercio electronico desarrollado por Tencent (WeChat Vision), afinado a partir de Qwen3.5. Lee imagenes de producto, varias imagenes simultaneamente y video junto con texto, en chino e ingles, e incorpora un modo de razonamiento hibrido ("thinking") que puede activarse o desactivarse por peticion mediante el parametro `enable_thinking`. Esta ficha describe la conversion a MLX en bf16 publicada por NetProjects, pensada para ejecucion nativa en Apple Silicon.

La version aqui documentada no es un modelo nuevo: es una conversion de pesos de `tencent/WeMM-Ecom-0.8B` (revision `b402979`) al formato MLX mediante `mlx-vlm`, conservando el codificador visual y la precision bf16 original (sin cuantizar). El repositorio ocupa 1.7 GB y contiene 852.985.920 parametros reales segun los safetensors publicados.

Su relevancia practica es doble: por un lado, ofrece un modelo multimodal de dominio especifico (e-commerce) con solo ~0,85B de parametros, lo que permite inferencia local; por otro, la build MLX facilita su despliegue en portatiles y equipos de sobremesa con chip Apple M-series, un nicho habitualmente mal cubierto por las builds CUDA-centricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) basada en Qwen3.5, con codificador visual incluido; conversion a MLX |
| Parametros totales | 852.985.920 (~0,85B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en esta build; existe build 8-bit del mismo autor (1.0 GB) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 (fichero LICENSE de Tencent, sin modificar) |
| Formato de pesos | safetensors (MLX), libreria `mlx` / `mlx-vlm` |
| Tamano del repositorio | 1.7 GB |
| Pipeline | image-text-to-text |
| Revision del modelo base | `b402979` de `tencent/WeMM-Ecom-0.8B` |

## Arquitectura y entrenamiento

El modelo base es un VLM de la familia WeMM-Ecom de Tencent, afinado desde Qwen3.5. La model card de esta conversion no detalla la arquitectura interna del transformer ni la composicion del dataset de entrenamiento; solo confirma que el codificador visual esta incluido en la build y que los ficheros de tokenizer, chat template y processor son los originales de Tencent, sin cambios. No se especifica numero de tokens de entrenamiento, si hubo RLHF/DPO ni innovaciones de atencion o decodificacion.

Lo que si documenta esta build es el proceso de conversion y validacion: los pesos se convirtieron con `mlx-vlm` (>=0.7.11) manteniendo bf16, y se verifico que todos los ficheros del modelo original coinciden en tamano y SHA-256 con el Hub. La fidelidad se midio contra los pesos bf16 originales de Tencent: 10 prompts cortos en ingles y chino (4 con thinking activado, 6 desactivado), 355 posiciones teacher-forced, con un 100,0% de coincidencia en el siguiente token para esta build bf16 (99,4% para la 8-bit) y una KL media de 0,0000.

## Capacidades

- Generacion de texto e imagen-a-texto: descripcion de productos, titulos y puntos de venta a partir de fotos.
- Razonamiento multimodal con modo thinking hibrido: activado por defecto, desactivable por peticion con `enable_thinking`.
- Entrada de multiples imagenes simultaneas: comparacion de listados, deteccion de diferencias entre variantes de producto.
- Entrada de video junto con texto (segun los tags de la model card).
- Capacidades de comercio electronico: identificacion de producto, color, precio y atributos visibles en la imagen.
- Multilingue limitado a chino e ingles.
- Servidor con API compatible con OpenAI mediante `mlx_vlm.server`.
- No se documenta soporte de tool calling / function calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Generacion de fichas de producto: dado un catalogo de fotos, el modelo produce titulos cortos y tres puntos de venta por articulo; el modo instruct (thinking off) reduce latencia y coste por item.
- Comparacion de listados duplicados: con dos imagenes de entrada y thinking activado, el modelo razona si dos publicaciones corresponden al mismo producto y explica las diferencias (variantes de color, precio, presentacion).
- Moderacion y control de calidad de catalogos: verificacion de que la imagen coincide con los atributos declarados (color, precio en etiqueta) antes de publicar.
- Atencion al cliente en comercio electronico: respuestas sobre un producto concreto a partir de su imagen y texto, en chino o ingles, servidas via `mlx_vlm.server` con API compatible con OpenAI.
- Procesamiento local en portatiles Apple: inferencia en un MacBook con chip M-series sin GPU dedicada, util para prototipado y demos offline con datos de catalogo sensibles.
- Analisis de video de producto: extraccion de descripciones y atributos a partir de clips cortos junto con texto, segun las capacidades declaradas en los tags.
- Etiquetado asistido de imagenes para entrenamiento: generacion de descripciones y atributos en lote sobre un dataset de e-commerce para pre-anotar.

## Benchmarks y rendimiento

La model card de esta conversion remite a las tablas de Tencent (imagenes en `assets/` del repositorio y card original) sin reproducir los valores numericos en texto. No se han publicado resultados de benchmarks en la informacion disponible en formato tabular; los datos de fidelidad de la conversion son los siguientes:

| Metrica | bf16 (esta build) | 8-bit (build recomendada) |
|---|---|---|
| Mismo siguiente token vs. original bf16 | 100,0% | 99,4% |
| KL media vs. original | 0,0000 | 0,0018 |
| Tamano | 1.7 GB | 1.0 GB |
| Memoria pico (test con imagen) | 2.4 GB | 1.8 GB |

Las pruebas se realizaron en un MacBook Pro M5 Max (128 GB) el 25 de noviembre de 2026, con mlx 0.32.4 y mlx-vlm 0.7.11.

## Requisitos de hardware

- Memoria pico medida en test con imagen: 2.4 GB para esta build bf16; 1.8 GB para la 8-bit.
- VRAM/unified memory recomendada: al menos 4 GB libres para bf16 con margen para contexto; 3 GB para la 8-bit.
- Cabe en cualquier Mac con Apple Silicon (M1 o superior); el autor lo valido en un M5 Max de 128 GB, pero el consumo medido permite equipos mucho mas modestos.
- No esta pensado para GPU NVIDIA/AMD: la build es exclusivamente MLX (Apple Silicon). Para CUDA habria que usar los pesos originales de Tencent.
- Despliegue: `mlx-vlm` (CLI `mlx_vlm.generate` y API Python `load`/`generate`) y `mlx_vlm.server` con API compatible con OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B (esta build MLX bf16) | ~0,85B | no disponible | zh, en | Apache-2.0 | Hugging Face, solo Apple Silicon |
| WeMM-Ecom-0.8B MLX 8-bit (mismo autor) | ~0,85B | no disponible | zh, en | Apache-2.0 | Hugging Face, 1.0 GB, 99,4% fidelidad |
| tencent/WeMM-Ecom-0.8B (original) | ~0,85B | no disponible | zh, en | Apache-2.0 | Hugging Face, pesos originales (no MLX) |

No se dispone de datos de benchmarks comparativos con otras familias (Qwen2.5-VL, InternVL, etc.) en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento frente a terceros.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta afinado para e-commerce; su rendimiento fuera de ese ambito no esta documentado.
- Solo chino e ingles; no hay soporte declarado de castellano ni de otras lenguas.
- Riesgo de alucinacion en la lectura de atributos (precio, texto en etiquetas) y en la comparacion de imagenes; conviene validar en produccion.
- El modo thinking esta activado por defecto y consume mas tokens; para tareas simples debe desactivarse explicitamente.
- La build es exclusiva de MLX/Apple Silicon; no es portable a CUDA sin reconvertir los pesos originales.
- La licencia Apache-2.0 permite uso comercial, pero el fichero LICENSE es el de Tencent e incluye la seccion de terceros de Qwen3.5; conviene revisarlo antes de redistribuir.
- NetProjects no esta afiliado a Tencent ni a Alibaba; la build es una conversion de terceros, no oficial.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Repositorio de esta build: https://huggingface.co/netprojects/WeMM-Ecom-0.8B-MLX-bf16
- Build 8-bit recomendada: https://huggingface.co/netprojects/WeMM-Ecom-0.8B-MLX-8bit
- Modelo original de Tencent: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Mas builds MLX del autor: https://huggingface.co/netprojects
- Web del autor de la conversion: https://netprojects.com
