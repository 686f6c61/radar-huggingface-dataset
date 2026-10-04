# Aero2026/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es un repositorio de cuantizaciones del modelo de difusion Qwen/Qwen-Image-2.1, publicado por el usuario Aero2026 en HuggingFace. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es una recopilacion de pesos convertidos a distintos formatos (GGUF, safetensors, MLX) para permitir la inferencia local del modelo base original mediante ComfyUI. El nombre "Uncensored" es una etiqueta comercial y, segun las fuentes consultadas, los pesos incluidos son los pesos originales sin modificar, no una version con los filtros de contenido eliminados.

El modelo subyacente, Qwen-Image-2.1, es un modelo unificado de generacion texto-a-imagen y edicion de imagenes desarrollado por el equipo Qwen (QwenLM). Su componente de generacion visual es un Diffusion Transformer (DiT) denso de aproximadamente 7.100 millones de parametros organizado en 32 capas Single-Stream, que se apoya en un codificador de texto Qwen3-VL de 8B y un VAE propio. Se distribuye bajo la licencia qwen-research, lo que condiciona su uso comercial.

La relevancia de este repositorio concreto reside en que empaqueta, en un unico lugar, el transformador cuantizado junto con el codificador de texto y el VAE, de modo que un usuario con una GPU de consumo puede desplegar generacion de imagenes de alta calidad en local sin depender de APIs. El repositorio ocupa 105,2 GB y presenta 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT), 32 capas Single-Stream; modelo unificado de generacion texto-a-imagen y edicion |
| Parametros totales | 7.115.124.736 (~7,1 B) en el componente de generacion visual |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de difusion; depende del codificador de texto Qwen3-VL 8B) |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como license: other, license_name: qwen-research) |
| Formato de pesos | GGUF y safetensors (FP8, INT8, NVFP4, MLX) |

Archivos incluidos en el repositorio:

| Cuantizacion | Archivo | Tamano |
|---|---:|---:|
| BF16 (uncensored) | qwen-image-2.1-UC-BF16.gguf | 14,23 GB |
| FP8 | qwen-image-2.1-UC-fp8.safetensors | 6,63 GB |
| INT8 ConvRot | qwen-image-2.1-UC-int8_convrot.safetensors | 6,76 GB |
| NVFP4 | qwen-image-2.1-UC-NVFP4.safetensors | 4,20 GB |
| MLX 4-bit | qwen-image-2.1-UC-MLX-4bit.safetensors | 4,00 GB |
| MLX 6-bit | qwen-image-2.1-UC-MLX-6bit.safetensors | 5,78 GB |
| MLX 8-bit | qwen-image-2.1-UC-MLX-8bit.safetensors | 7,56 GB |
| Q8_0 | qwen-image-2.1-UC-Q8_0.gguf | 7,59 GB |
| Q6_K | qwen-image-2.1-UC-Q6_K.gguf | 5,88 GB |
| Q5_K_M | qwen-image-2.1-UC-Q5_K_M.gguf | 5,22 GB |
| Q4_K_M | qwen-image-2.1-UC-Q4_K_M.gguf | 4,60 GB |
| Q4_0 | qwen-image-2.1-UC-Q4_0.gguf | 4,15 GB |

Componentes auxiliares empaquetados:

| Tipo | Archivo | Precision | Tamano |
|---|---|---:|---:|
| Codificador de texto | text_encoders/qwen3vl_8b_bf16.safetensors | BF16 | 17,53 GB |
| Codificador de texto | text_encoders/qwen3vl_8b_int8_convrot.safetensors | INT8 | 9,35 GB |
| VAE | vae/qwen_image_2.1_vae_bf16.safetensors | BF16 | 676 MB |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 sigue una arquitectura de Diffusion Transformer (DiT) con 32 capas Single-Stream, descrita por el equipo Qwen como una arquitectura compacta y eficiente que equilibra calidad de generacion, eficiencia de inferencia y versatilidad. Se trata de un modelo unificado: cubre tanto la generacion texto-a-imagen como la edicion de imagenes dentro de un mismo componente de generacion visual de aproximadamente 7B de parametros. La canonizacion de texto se delega en un codificador Qwen3-VL de 8B y la decodificacion final en un VAE especifico del modelo.

Este repositorio no contiene entrenamiento ni ajuste adicional: es un proceso de conversion y cuantizacion sobre los pesos publicados por Qwen. No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO en el modelo base. El autor indica explicitamente que se parte de "the original upstream base weights". Conviene senalar que la etiqueta "Uncensored" no corresponde a una modificacion de los pesos: fuentes externas consultadas indican que los archivos apuntados son los pesos originales sin alterar, por lo que la denominacion responde a fines de descubrimiento mas que a una variacion tecnica.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con el componente DiT de 7B.
- Edicion de imagenes: el modelo base de Qwen describe Qwen-Image-2.1 como un modelo unificado de generacion y edicion.
- Comprension de prompts mediante un codificador de texto multimodal Qwen3-VL 8B, que admite entrada de texto e imagenes en el propio codificador.
- Despliegue local sin conexion a APIs, ejecutable en hardware de consumo segun la cuantizacion elegida.
- Integracion en flujos de ComfyUI mediante los nodos Unet Loader (GGUF), CLIPLoader con tipo `qwen_image` y VAELoader.
- Soporte de multiples precisiones y backends: GGUF para llama.cpp/ComfyUI-GGUF, safetensors para FP8/INT8/NVFP4 y MLX para Apple Silicon.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje generativo de texto).
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de ilustraciones para desarrollo de videojuegos: el modelo permite producir concept art y sprites base a partir de prompts en local, evitando depender de servicios externos y facilitando iteraciones rapidas sobre el estilo visual.
- Prototipado de diseno grafico y branding: con la cuantizacion Q4_K_M (4,60 GB) un disenador puede generar variaciones de un concepto en su propia estacion de trabajo, integrarlo en ComfyUI y encadenar nodos de post-procesado.
- Edicion de imagenes en flujos de fotografia: al ser un modelo unificado de generacion y edicion, permite rellenar, modificar o recomponer elementos de una imagen sin cambiar de herramienta.
- Generacion por lotes para catalogos de e-commerce: con una GPU de 24 GB, el par Q4_K_M mas el codificador INT8 permite procesar lotes de imagenes de producto de forma automatizada dentro de un pipeline programado.
- Investigacion en modelos de difusion: el repositorio ofrece el mismo modelo en doce cuantizaciones distintas, lo que facilita estudios comparativos de degradacion por precision sin tener que convertir los pesos manualmente.
- Despliegue en equipos Apple Silicon: las cuantizaciones MLX de 4, 6 y 8 bits (4,00-7,56 GB) estan pensadas para Macs con memoria unificada, lo que habilita generacion local en portatiles de la gama M.
- Creacion de contenido para redes sociales: automatizacion de la generacion de imagenes a partir de plantillas de prompt, con control del estilo mediante el codificador Qwen3-VL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card del repositorio incluye una referencia a una imagen (`assets/Qwen-Image-2.1-Benchmark.png`) que no se ha podido leer ni cuantificar, y no se aportan cifras de metricas como FID, CLIP score, GenEval o similares, ni comparaciones frente a otros modelos. No se deben inferir valores a partir de ella.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del par cuantizacion + codificador. Con Q4_K_M (4,60 GB) y el codificador INT8 (9,35 GB) mas el VAE (676 MB), el total ronda los 15 GB, por lo que se recomienda un minimo de 16 GB de VRAM. Con el codificador BF16 (17,53 GB) el total supera los 22-23 GB.
- Cuantizaciones ligeras: Q4_0 (4,15 GB) y NVFP4 (4,20 GB) son las opciones mas ajustadas en memoria; el autor recomienda Q4_K_M como mejor equilibrio entre tamano y calidad.
- GPU recomendadas (estimacion basada en los tamanos de archivo): RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) y H100 (80 GB) para las configuraciones mas pesadas o para lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas usando Q4_K_M/Q4_0 junto con el codificador INT8. Las cuantizaciones MLX 4/6/8-bit estan orientadas a Apple Silicon con memoria unificada.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (se indica el fork mantenido `leejet/ComfyUI-GGUF`; el fork antiguo `city96/ComfyUI-GGUF` puede fallar con `Unknown model architecture!`), y safetensors con los backends correspondientes a FP8/INT8/NVFP4. Para Apple Silicon, MLX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento verificables en la informacion proporcionada para establecer una comparativa cuantitativa. A continuacion se ofrece una comparacion estructural basica; los valores de los modelos alternativos no forman parte de la documentacion consultada y deben verificarse en sus fuentes originales.

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| Qwen-Image-2.1 (este repo, cuantizado) | ~7,1 B (DiT) | Difusion + texto-imagen y edicion | Codificador Qwen3-VL 8B (no disponible la ventana exacta) | qwen-research | HuggingFace, GGUF/safetensors/MLX |
| Qwen-Image (version anterior de la familia) | no disponible | Difusion texto-imagen | no disponible | no disponible | HuggingFace |
| FLUX.1 [dev] | no disponible en la informacion consultada | Difusion texto-imagen | no disponible | no disponible | no disponible |
| Stable Diffusion XL | no disponible en la informacion consultada | Difusion texto-imagen | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La etiqueta "Uncensored" no implica una modificacion de los pesos. Segun las fuentes externas consultadas, los archivos son los pesos originales del modelo base sin alterar. Cualquier expectativa de comportamiento sin filtros debe validarse empiricamente.
- Licencia qwen-research: no es una licencia de codigo abierto permisiva. Restringe el uso comercial y suele exigir aceptacion de terminos adicionales. Antes de desplegar en produccion es imprescindible revisar las condiciones de la licencia del modelo base.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir contenido incoherente, con anatomia incorrecta, texto mal formado o artefactos en detalles finos, especialmente en cuantizaciones agresivas (Q4_0 y menores).
- Degradacion por cuantizacion: las precisiones mas bajas (NVFP4, MLX 4-bit, Q4_0) reducen el consumo de memoria a costa de calidad y fidelidad al prompt. No se han publicado evaluaciones de la perdida de calidad en este repositorio.
- Idiomas soportados: no declarados. No se puede garantizar un comportamiento correcto con prompts en castellano u otros idiomas distintos del ingles.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, y creado y actualizado en la misma fecha. No hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Dependencia del fork de ComfyUI-GGUF: el propio autor advierte de que el fork `city96` puede fallar y recomienda `leejet`, lo que anade una dependencia fragil en el pipeline de despliegue.
- La model card contiene enlaces a rutas de otro usuario (`abenzerps`), lo que sugiere que el contenido fue copiado o replicado de otro repositorio; conviene verificar la integridad de los archivos antes de usarlos.
- La fecha de creacion declarada (2026-10-04) es posterior a la fecha actual del entorno, lo que debe interpretarse como un dato del repositorio y no como una garantia de mantenimiento.
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aero2026/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado): https://github.com/leejet/ComfyUI-GGUF
- Repositorio espejo: https://huggingface.co/0xSojalSec/Qwen-Image-2.1-Uncensored-GGUF
- Repositorio espejo: https://huggingface.co/rayss868123/Qwen-Image-2.1-Uncensored-GGUF
- Articulo sobre ejecucion local: https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
- Guia de ComfyUI con GGUF y Heretic: https://hoangyell.com/qwen-image-2-1-uncensored-comfyui/
