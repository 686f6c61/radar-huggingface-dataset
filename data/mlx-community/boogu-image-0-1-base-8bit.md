# mlx-community/Boogu-Image-0.1-Base-8bit

## Resumen

Boogu-Image-0.1-Base es un modelo de difusion texto-a-imagen bilingue (ingles y chino) desarrollado por Boogu, publicado bajo licencia Apache-2.0. Sigue la estirpe de OmniGen2: un transformer de difusion (DiT) combinado con el VAE de FLUX.1 y el planificador FlowMatchEuler, y utiliza Qwen3-VL-8B-Instruct como codificador de texto. El modelo cubre tanto generacion de imagenes desde prompt como edicion de imagenes, segun indican sus etiquetas.

La ficha que nos ocupa no es el modelo original, sino la conversion a MLX con cuantizacion int8 realizada por la comunidad mlx-community, orientada a ejecucion en Apple Silicon. El repositorio ocupa 12,8 GB y el DiT cuantizado pesa aproximadamente 12,5 GB, manteniendo en bf16 las capas de embeddings, time, norm_out y AdaLN. La similitud coseno por pasada frente a la version bf16 es de 0,999897, lo que indica una degradacion practicamente despreciable.

Es relevante ahora porque permite ejecutar un modelo de generacion de imagen de gama alta en hardware de consumo de Apple (probado en un M5 Max) sin GPU dedicada, con un pico de memoria de 29,5 GB a 1024x1024. El codificador de texto Qwen3-VL-8B-Instruct no se rehostea: se referencia desde el repositorio oficial de Qwen y se carga por peticion, evictandose antes del proceso de denoising.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con VAE de FLUX.1, planificador FlowMatchEuler y codificador de texto Qwen3-VL-8B-Instruct |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (group_size=32, capas Linear de atencion y FFN); embeds, time, norm_out y AdaLN en bf16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura sigue el linaje OmniGen2: un transformer de difusion (DiT) que opera en el espacio latente del VAE de FLUX.1, con un planificador FlowMatchEuler para el muestreo. El condicionamiento textual se realiza mediante Qwen3-VL-8B-Instruct, un modelo vision-lenguaje de 8B parametros que actua como codificador de texto. Esta eleccion de codificador permite, en principio, aprovechar capacidades multimodales para tareas de edicion de imagen, aunque la model card no detalla el mecanismo exacto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card de la conversion MLX no incluye estos datos y remite al repositorio del modelo base para la licencia. La innovacion tecnica destacable de esta version concreta es la cuantizacion int8 selectiva: solo se cuantizan las capas Linear de atencion y FFN, mientras que las capas sensibles (embeddings, proyecciones temporales, normalizacion de salida y modulacion AdaLN) se mantienen en bf16, lo que preserva la calidad con una huella de memoria reducida.

## Capacidades

- Generacion de imagenes texto-a-imagen bilingue (ingles y chino) con resoluciones de al menos 1024x1024.
- Edicion de imagenes, segun las etiquetas del repositorio (image-editing).
- Control fino del muestreo mediante pasos de denoising y escala de guidance (parametros `steps` y `guidance` en la API).
- Condicionamiento mediante un modelo vision-lenguaje (Qwen3-VL-8B-Instruct), lo que habilita comprension de prompts complejos y potencialmente entrada de imagen de referencia.
- Ejecucion nativa en Apple Silicon mediante MLX, con integracion en Swift (MLXEngine) y Python.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documentan capacidades de audio ni de video.

## Casos de uso

- Generacion de ilustraciones para publicaciones: el modelo produce imagenes fotorrealistas a 1024x1024 con 30 pasos y guidance 3,5, adecuado para bocetos editoriales y material de marketing en un Mac de sobremesa.
- Prototipado de conceptos de producto: un disenador puede iterar prompts en local sin depender de APIs de pago, aprovechando la licencia Apache-2.0 para uso comercial.
- Edicion de imagenes en flujos creativos: la etiqueta image-editing sugiere la posibilidad de modificar imagenes existentes, util para retoque y variaciones sobre una composicion base.
- Generacion bilingue para mercados hispanohablantes y chinos: aunque el modelo solo declara ingles y chino, se puede usar con prompts en ingles para contenido en espanol, o directamente en chino para mercados asiaticos.
- Desarrollo de aplicaciones macOS nativas: la integracion con el paquete Swift `boogu-image-swift` permite incrustar generacion de imagenes en apps de escritorio para Apple Silicon.
- Investigacion en eficiencia de difusion: la cuantizacion int8 con similitud coseno de 0,999897 frente a bf16 lo convierte en un caso de estudio para evaluar el impacto de la cuantizacion selectiva en modelos DiT.
- Automatizacion de assets para videojuegos indie: generacion por lotes de texturas o ilustraciones conceptuales en un solo equipo, con control de memoria (pico de 29,5 GB a 1024²).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el DiT int8 ocupa aproximadamente 12,5 GB; el proceso residente medido es de 12,9 GB.
- Pico de memoria: 29,5 GB a 1024x1024, debido a la carga del codificador Qwen3-VL-8B-Instruct durante el condicionamiento (se libera antes del denoising).
- Hardware probado: Apple M5 Max con memoria unificada; se requiere al menos 32 GB de memoria unificada para resoluciones de 1024².
- GPU dedicadas: no se documenta soporte para CUDA; esta version es exclusiva de Apple Silicon (MLX).
- Cabe en GPU de consumo Apple: si, en chips M-series con 32 GB o mas de memoria unificada.
- Opciones de despliegue: MLX (Python con `mlx` y `mlx-vlm`), y el paquete Swift MLXEngine (`boogu-image-swift` >= 0.5.0).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| Boogu-Image-0.1-Base-8bit (esta ficha) | no disponible (DiT ~12,5 GB int8) | no disponible | Apache-2.0 | Apple Silicon (MLX) | Conversion comunitaria int8 del modelo base |
| Boogu-Image-0.1-Base (bf16) | no disponible | no disponible | Apache-2.0 | Multiples (diffusers) | Modelo original sin cuantizar |
| Boogu-Image-0.1-Turbo-8bit | no disponible | no disponible | Apache-2.0 | Apple Silicon (MLX) | Variante turbo con el mismo layout de cuantizacion |

No se dispone de datos de rendimiento comparado con otros modelos de generacion de imagen (por ejemplo, FLUX.1 o SDXL) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles y chino de forma declarada; el rendimiento con prompts en espanol u otros idiomas no esta documentado y puede degradarse.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir imagenes con incoherencias anatomicas, texto ilegible o detalles inconsistentes con el prompt.
- Sesgos: no se documentan evaluaciones de sesgo; los modelos de difusion entrenados con datos web suelen reproducir estereotipos de genero, etnia y cultura.
- La cuantizacion int8, aunque con similitud coseno de 0,999897 frente a bf16, puede introducir diferencias sutiles en prompts complejos o resoluciones altas no evaluadas.
- Restriccion de plataforma: esta conversion solo funciona en Apple Silicon mediante MLX; no es portable a CUDA sin reconvertir.
- Requiere cargar un codificador de 8B parametros por peticion, lo que eleva el pico de memoria a 29,5 GB y limita la concurrencia en equipos con menos de 32 GB.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del codificador Qwen3-VL-8B-Instruct por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria de su calidad en produccion.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/mlx-community/Boogu-Image-0.1-Base-8bit
- Modelo base: https://huggingface.co/Boogu/Boogu-Image-0.1-Base
- Version bf16: https://huggingface.co/mlx-community/Boogu-Image-0.1-Base-bf16
- Variante Turbo-8bit: https://huggingface.co/mlx-community/Boogu-Image-0.1-Turbo-8bit
- Codificador de texto: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Codigo Python: https://github.com/xocialize/boogu-image-mlx
- Codigo Swift: https://github.com/xocialize/boogu-image-swift
- Licencia del modelo base: https://huggingface.co/Boogu/Boogu-Image-0.1-Base/blob/main/README.md
