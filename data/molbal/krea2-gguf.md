# molbal/krea2-gguf

## Resumen

Krea 2 GGUF es un repositorio que publica las cuantizaciones GGUF del modelo Krea 2, un Diffusion Transformer (DiT) de 12 820 millones de parámetros desarrollado por Krea para generacion de imagenes texto a imagen. La conversion la realiza molbal, que adapta los pesos originales en BF16 (26,6 GB por checkpoint) a formato GGUF para que el modelo pueda ejecutarse en GPUs de consumo con VRAM limitada, integrandose con ComfyUI mediante el plugin molbal/ComfyUI-GGUF.

El repositorio ofrece dos variantes del modelo: Krea 2 Raw, el checkpoint base con flujo de difusion estandar que requiere 20-30 pasos y CFG positivo, y Krea 2 Turbo, un checkpoint destilado que funciona con 4-8 pasos y CFG nulo. La arquitectura de Krea 2 es novedosa, con bloques de fusion de texto por capas y un bloque refiner, y no esta basada en Flux ni en ninguna arquitectura previa de codigo abierto. La relevancia actual del proyecto radica en que democratiza el acceso a un modelo de 12B parametros, que de otro modo exigiria una GPU profesional de 24 GB o mas para cargar los pesos BF16 completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con bloques de fusion de texto por capas y bloque refiner |
| Parametros totales | 12 820 073 036 (12,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | Q4_0, Q4_1, Q5_0, Q5_1, Q8_0 (cuantizaciones no-K, sin K-quants) |
| Idiomas soportados | No disponible (depende del text encoder externo, no se especifica) |
| Licencia | Krea 2 Community License |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Krea 2 es un Diffusion Transformer de 12,8 mil millones de parametros con una arquitectura propia que incorpora bloques de fusion de texto por capas y un bloque refiner adicional. No deriva de Flux ni de otros DiT de codigo abierto existentes. El modelo opera con un esquema de flow-matching y requiere componentes externos (text encoder y VAE) que no se incluyen en este repositorio.

El repositorio contiene dos checkpoints convertidos: Krea 2 Raw, el checkpoint base que se comporta como un DiT de flow-matching estandar y se beneficia de 20-30 pasos de inferencia con CFG entre 3,0 y 7,0; y Krea 2 Turbo, un checkpoint post-entrenado mediante destilacion que funciona con 4-8 pasos y CFG nulo (CFG-free). Los datos de entrenamiento, el numero de tokens procesados y los detalles del proceso de destilacion no estan disponibles en la informacion publicada. La conversion a GGUF emplea cuantizaciones no-K (Q4_0, Q4_1, Q5_0, Q5_1, Q8_0) pensadas para dequantizacion en PyTorch dentro de ComfyUI, ya que la ruta de carga no utiliza kernels lineales cuantizados fusionados.

## Capacidades

- Generacion de imagenes texto a imagen mediante diffusion flow-matching.
- Dos modos de inferencia: Raw (CFG completo, 20-30 pasos, mayor control sobre el resultado) y Turbo (destilado, 4-8 pasos, CFG nulo, generacion rapida).
- Integracion nativa con ComfyUI a traves del plugin molbal/ComfyUI-GGUF, que registra la arquitectura krea2 en el sistema de deteccion de modelos.
- Ejecucion en GPUs de consumo con VRAM reducida gracias a la cuantizacion GGUF (desde 7,74 GB en Q4_0).
- No es un modelo de lenguaje: no dispone de tool calling, capacidades de agente, razonamiento multi-paso ni soporte de vision o audio mas alla de la generacion de imagenes.

## Casos de uso

- Generacion de imagenes en GPUs de 8 GB: con la cuantizacion Q4_0 (7,74 GB) es posible ejecutar Krea 2 completa en tarjetas como la RTX 3060 o RTX 4060 sin descarga de capas a RAM, algo inviable con los pesos BF16 de 26,6 GB.
- Flujos de trabajo ComfyUI en equipos de gama media: el modelo se carga con el nodo Unet Loader (GGUF) y se integra en pipelines existentes de ComfyUI, permitiendo usar Krea 2 en estaciones de trabajo con 10-12 GB de VRAM mediante la cuantizacion Q5_1 (9,93 GB).
- Prototipado rapido de conceptos visuales: la variante Turbo genera imagenes en 4-8 pasos sin CFG, lo que reduce el tiempo de iteracion en fases de exploracion creativa o generacion por lotes.
- Control fino en produccion: la variante Raw con CFG 3,0-7,0 y 20-30 pasos ofrece mayor control sobre la composicion y el estilo, adecuada para trabajos donde la fidelidad al prompt es critica.
- Reduccion de footprint en despliegues con CPU offload: si el flujo de trabajo ya descarga capas a RAM, el formato GGUF reduce proporcionalmente el consumo de RAM, lo que puede ser el cuello de botella real en equipos con mucha VRAM pero poca memoria principal.
- Evaluacion de calidad frente a cuantizacion: los archivos Q5_0 y Q5_1 permiten comparar visualmente la perdida de calidad respecto a BF16 y decidir el punto de equilibrio entre fidelidad y requisitos de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de FID, CLIP score, ni comparaciones cuantitativas con otros modelos de generacion de imagenes en la model card ni en los resultados de busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q4_0: 7,74 GB (cabe en GPUs de 8 GB)
  - Q4_1: 8,47 GB (requiere 10-12 GB recomendados)
  - Q5_0: 9,20 GB (requiere 10-12 GB)
  - Q5_1: 9,93 GB (orientado a tarjetas de 10-12 GB)
  - Q8_0: 13,56 GB (requiere 16 GB o mas)
- GPUs recomendadas: RTX 3060/4060 (8 GB) para Q4_0; RTX 3080/4070 (10-12 GB) para Q5_0/Q5_1; RTX 4080/4090 o A100 para Q8_0. Para maxima fidelidad con pesos BF16 o FP8 se recomienda una GPU de 24 GB o superior.
- Opciones de despliegue: ComfyUI con el plugin molbal/ComfyUI-GGUF (fork de city96/ComfyUI-GGUF con soporte para la arquitectura krea2). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de difusion, no un LLM.
- Latencia y throughput: no disponibles. La variante Turbo reduce el numero de pasos a 4-8, lo que acelera la generacion frente a los 20-30 pasos de Raw, pero no se proporcionan cifras concretas de tiempo por imagen.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar Krea 2 con alternativas. A nivel estructural, el competidor mas cercano es Flux.1-dev, tambien un DiT de aproximadamente 12B parametros, pero Krea 2 declara explicitamente no estar basado en Flux ni en arquitecturas previas. Otras alternativas como Stable Diffusion 3.5 Large (8B) tienen menos parametros. La licencia Krea 2 Community License difiere de las licencias de Flux (no comercial para dev) y de Stability AI, pero los terminos exactos no estan detallados en la informacion disponible. No se puede establecer una comparativa cuantitativa fiable sin datos de rendimiento publicados.

## Limitaciones y advertencias

- Los archivos GGUF no son un paquete completo: se necesitan el text encoder y el VAE por separado para ejecutar el modelo.
- El soporte en ComfyUI requiere el fork molbal/ComfyUI-GGUF; el plugin original de city96 no reconoce estos archivos (a fecha de 2026-06-24).
- Las cuantizaciones Q4 muestran un suavizado leve en los detalles finos de la imagen; la perdida de calidad es aceptable para tareas creativas pero puede no serlo para usos profesionales de alta fidelidad.
- No se incluyen K-quants; solo cuantizaciones no-K, lo que limita las opciones de optimizacion en otras herramientas que esperen K-quants.
- La licencia Krea 2 Community License puede imponer restricciones de uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar el modelo en produccion.
- No se dispone de informacion sobre sesgos del modelo, riesgos de alucinacion visual ni limitaciones de idioma del text encoder asociado.
- Los pesos BF16 originales ocupan 26,6 GB por checkpoint; cargarlos en VRAM requiere una GPU de 24 GB o mas, y el uso de GGUF solo se recomienda cuando la VRAM es limitada o el offload a RAM es un cuello de botella.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/molbal/krea2-gguf
- Modelo base Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Plugin ComfyUI-GGUF de molbal: https://github.com/molbal/ComfyUI-GGUF
- Plugin original city96/ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Licencia Krea 2 Community License: https://huggingface.co/krea/Krea-2-Turbo/blob/main/LICENSE
