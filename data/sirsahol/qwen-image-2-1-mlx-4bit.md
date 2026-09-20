# SirSahOl/Qwen-Image-2.1-mlx-4bit

## Resumen

Qwen-Image-2.1-mlx-4bit es una conversión a 4 bits en formato MLX del modelo Qwen/Qwen-Image-2.1, publicada por el usuario SirSahOl. MLX es el framework de Apple para inferencia nativa en GPU de Apple Silicon, de modo que el objetivo declarado de esta conversión es permitir la ejecución local del modelo base en equipos Mac con memoria unificada, sin depender de CUDA ni de servicios en la nube. El repositorio ocupa 37,1 GB y declara una cuantización media de 4,50 bits por peso sobre safetensors.

La información disponible presenta una contradicción relevante que hay que señalar antes de cualquier evaluación: las etiquetas del repositorio y el pipeline declarado (text-to-image, diffusers:QwenImage21Pipeline, image-generation, image-editing) apuntan a un modelo de generación y edición de imágenes, mientras que la model card describe la arquitectura como Qwen2ForCausalLM con unos 60.200 millones de parámetros, 32.768 tokens de contexto nativo y una guía de despliegue orientada a LM Studio y a la generación de texto. Parte del contenido de la model card parece reutilizado de una ficha de modelo de lenguaje y no coincide con el pipeline de imagen declarado.

En consecuencia, esta ficha recoge los datos tal como los publica el autor, marca explícitamente los puntos no verificables y advierte de que no se han publicado resultados de benchmarks de calidad (MMLU, GenEval, etc.) ni una descripción del dataset de entrenamiento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una conversión reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma fiable: la model card indica Qwen2ForCausalLM, pero el pipeline declarado es text-to-image (QwenImage21Pipeline). Contradiccion no resuelta |
| Parametros totales | ~60,2B (segun la model card del autor) |
| Parametros activos | No aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 32.768 tokens nativos, hasta 131.072 con extension YaRN (dato declarado en la model card) |
| Tipos de cuantizacion | 4-bit MLX (media de 4,50 bits por peso). Existen variantes 8-bit y 16-bit en repositorios separados |
| Idiomas soportados | No disponible |
| Licencia | other (sin detalle de los terminos en la informacion proporcionada) |
| Formato de pesos | safetensors en formato MLX (Apple Silicon nativo) |
| Tamano del repositorio | 37,1 GB |
| Huella de VRAM declarada | ~34,1 GB (minimo recomendado: 32 GB de memoria unificada) |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Libreria | mlx |
| Pipeline | text-to-image |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento de este repositorio: es una conversion de pesos, no un modelo entrenado desde cero, y la model card no documenta el dataset, el numero de tokens ni si hubo fases de RLHF o DPO. Para el modelo base Qwen/Qwen-Image-2.1 no se ha proporcionado ninguna descripcion de arquitectura, asi que no es posible detallar si se trata de un transformer de difusion, de un transformer multimodal con torre de vision o de otra variante. La unica innovacion tecnica declarada por el autor es la propia conversion: cuantizacion a 4 bits (media de 4,50 bits por peso) en formato MLX para aprovechar la GPU integrada de Apple Silicon mediante memoria unificada, evitando duplicar pesos entre CPU y GPU.

La model card describe como arquitectura "Qwen2ForCausalLM", que es una arquitectura de modelo de lenguaje autorregresivo, y a continuacion incluye una tabla de rendimiento en tokens por segundo, tiempo hasta el primer token y una guia de configuracion de cadenas de parada para LM Studio (tokens `<|im_start|>`, `<|im_end|>`, `<|endoftext|>` y un preset JSON llamado "Qwen2.5"). Esa combinacion es coherente con un modelo de texto, no con un pipeline de generacion de imagenes, y sugiere que parte de la ficha se copio de otra publicacion. No hay informacion que permita resolver cual de las dos descripciones corresponde al artefacto real.

## Capacidades

- Las etiquetas del repositorio declaran generacion de imagenes a partir de texto (text-to-image) y edicion de imagenes (image-editing).
- Se menciona soporte de canal alfa o salida RGBA entre las etiquetas (`rgba`), lo que sugiere generacion con transparencia, aunque no se documenta su funcionamiento.
- La model card describe, en contradiccion con lo anterior, capacidades propias de un modelo de lenguaje: generacion de texto, multiturno, invocacion de herramientas y razonamiento.
- Soporte de tool calling / function calling: mencionado de forma indirecta en la tabla de casos de uso ("tool invocation"), sin documentacion tecnica.
- Soporte de agentes y razonamiento multi-paso: mencionado como "agent orchestration" en la tabla de hardware, sin detalles.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no documentados.

## Casos de uso

- Generacion de imagenes local en Mac: el modelo se puede invocar con `mflux-generate-qwen --model SirSahOl/Qwen-Image-2.1-mlx-4bit --prompt "..."`, lo que permite crear ilustraciones sin enviar prompts a un servicio externo. Es adecuado cuando la confidencialidad del prompt o del material de referencia es un requisito.
- Edicion de imagenes sobre material propio: la etiqueta image-editing apunta a flujos de retoque o transformacion de imagenes existentes; al ejecutarse en local, el material no sale del equipo, lo que encaja en estudios de diseno con acuerdos de confidencialidad.
- Generacion con transparencia para diseno grafico: la etiqueta rgba sugiere salidas con canal alfa, utiles para assets que se van a componer en capas (iconos, recortes, elementos de interfaz) sin necesidad de un paso posterior de eliminacion de fondo.
- Previsualizacion rapida durante el desarrollo de producto: con ~34,1 GB de VRAM activa y un TTFT declarado de entre 265 y 946 ms segun el chip, se puede iterar sobre prompts y bocetos en un Mac de gama alta antes de lanzar una generacion definitiva en un clúster con GPU.
- Procesamiento por lotes nocturno en un Mac Studio o Mac Pro: la tabla del autor situa los chips Ultra en ~38 tokens/s y recomienda ese nivel para "produccion" y extraccion de documentos por lotes, lo que sugiere su uso en pipelines automatizados de generacion masiva.
- Evaluacion comparativa de cuantizaciones: el repositorio forma parte de una familia de 4, 8 y 16 bits, de modo que sirve para medir la degradacion de calidad que introduce la cuantizacion a 4 bits frente a la version sin cuantizar antes de decidir que variante desplegar.
- Asistente de texto o codigo en local (solo si se confirma la parte de modelo de lenguaje): la guia de LM Studio incluida en la ficha describe su uso como asistente conversacional con cadenas de parada personalizadas; no obstante, esta capacidad no esta verificada para este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, GenEval, FID u otros) en la informacion disponible. El unico dato de rendimiento aportado por el autor es una matriz de estimaciones de velocidad sobre Apple Silicon, que se reproduce a continuacion tal cual:

| Nivel de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado | Uso recomendado por el autor |
|---|---|---|---|---|---|
| M1 / M2 / M3 / M4 (base) | 24 GB o mas | ~34,1 GB | ~12 tokens/s | ~946 ms | Asistente interactivo y completados locales rapidos |
| M1 / M2 / M3 / M4 Pro | 36 GB – 48 GB | ~34,1 GB | ~18 tokens/s | ~643 ms | Uso diario para codigo e invocacion de herramientas |
| M1 / M2 / M3 / M4 Max | 36 GB – 128 GB | ~34,1 GB | ~26 tokens/s | ~397 ms | Generacion de alto rendimiento y orquestacion de agentes |
| M1 / M2 / M3 Ultra | 64 GB – 192 GB | ~34,1 GB | ~38 tokens/s | ~265 ms | Concurrencia y servicio en produccion |

El propio autor advierte de que son estimaciones basadas en el ancho de banda de memoria unificada y en la huella activa de parametros, y que las cifras reales pueden variar con la longitud del contexto. Se trata de unidades de tokens por segundo, propias de la decodificacion de modelos de lenguaje, lo que refuerza la incoherencia entre la model card y el pipeline declarado de generacion de imagenes.

## Requisitos de hardware

- VRAM declarada para inferencia 4-bit: ~34,1 GB de huella activa, con un minimo recomendado de 32 GB de memoria unificada.
- Tamano en disco: 37,1 GB para el repositorio; la tabla del autor indica ~33,5 GB para la variante de 4 bits.
- Hardware objetivo: exclusivamente Apple Silicon (etiqueta `apple-silicon`, formato MLX). No hay soporte CUDA ni ROCm declarado.
- Chips compatibles segun el autor: M1, M2, M3 y M4 en versiones base, Pro, Max y Ultra con al menos 24-32 GB de memoria unificada.
- No cabe en GPUs de consumo con CUDA de 24 GB (RTX 3090, RTX 4090) usando la ruta MLX; para esa ruta harian falta otros formatos que no se publican en este repositorio.
- Opciones de despliegue: MLX mediante `mflux` (comando `mflux-generate-qwen`); la model card incluye ademas instrucciones de carga en LM Studio con un preset de cadenas de parada (ver la advertencia de incoherencia del apartado anterior). vLLM, llama.cpp, Ollama y TGI no se mencionan ni se declaran compatibles.
- Latencia y throughput: entre ~12 y ~38 tokens/s segun el chip, y entre ~265 y ~946 ms de TTFT, siempre segun las estimaciones del autor y no verificadas de forma independiente.
- Variantes alternativas de precision: 8-bit (~63,7 GB en disco) y 16-bit (~121,2 GB), con requisitos de memoria proporcionalmente mayores.

## Comparativa con modelos similares

Los unicos modelos comparables documentados en la informacion disponible son las otras cuantizaciones del mismo autor sobre el mismo modelo base. No se han proporcionado datos de modelos equivalentes de otros proyectos.

| Modelo | Parametros | Contexto | Precision | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SirSahOl/Qwen-Image-2.1-mlx-4bit | ~60,2B | 32.768 tokens (131.072 con YaRN) | 4-bit (4,50 bits/peso) | ~33,5 GB | other | MLX, Apple Silicon |
| SirSahOl/Qwen-Image-2.1-mlx-8bit | ~60,2B | No disponible | 8-bit | ~63,7 GB | other | MLX, Apple Silicon |
| SirSahOl/Qwen-Image-2.1-mlx-16bit | ~60,2B | No disponible | 16-bit (sin cuantizar) | ~121,2 GB | other | MLX, Apple Silicon |
| Qwen/Qwen-Image-2.1 (base) | No disponible | No disponible | Original | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Contradiccion documental grave: la model card describe un modelo de lenguaje (Qwen2ForCausalLM, 60,2B, contexto de 32.768 tokens, guia para LM Studio, velocidad en tokens/s) mientras que las etiquetas y el pipeline declaran generacion de imagenes (text-to-image, QwenImage21Pipeline). Cualquier decision de produccion deberia partir de la verificacion manual del contenido real del repositorio.
- La ficha parece contener texto reutilizado de otra publicacion (incluye un preset llamado "Qwen2.5" y cadenas de parada de chat), lo que reduce la fiabilidad del resto de datos declarados.
- No hay resultados de benchmarks de calidad publicados, ni descripcion del dataset, ni evaluacion de la degradacion introducida por la cuantizacion a 4 bits.
- Riesgo de alucinacion: no evaluado. No se han publicado estudios de fidelidad de prompt ni de adherencia a la instruccion.
- Sesgos: no documentados. No hay informacion sobre composicion del dataset ni sobre filtros de seguridad.
- Limitaciones de idioma: los idiomas soportados no estan disponibles; no se puede confirmar el comportamiento en castellano.
- Restricciones de licencia: la licencia es "other" y no se detallan sus terminos en la informacion proporcionada, por lo que el uso comercial no puede darse por permitido sin consultar la licencia del modelo base y la del repositorio.
- Compatibilidad limitada: el formato MLX restringe el despliegue a Apple Silicon. No hay rutas documentadas para CUDA, ROCm ni para GPUs de consumo.
- Requisito de memoria elevado: ~34,1 GB de memoria unificada activa implica que los Mac con 16 GB o 24 GB no podran ejecutarlo con holgura, pese a lo que sugiere la tabla de "quien deberia usarlo" del autor, donde se mencionan equipos de 8 GB.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion asociada.
- Las cifras de velocidad y TTFT son estimaciones del autor y no mediciones reproducibles.

## Enlaces

- Repositorio HuggingFace (4-bit): https://huggingface.co/SirSahOl/Qwen-Image-2.1-mlx-4bit
- Variante 8-bit: https://huggingface.co/SirSahOl/Qwen-Image-2.1-mlx-8bit
- Variante 16-bit: https://huggingface.co/SirSahOl/Qwen-Image-2.1-mlx-16bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a páginas de inicio de sesión de Facebook y no guardan relación con el modelo.
