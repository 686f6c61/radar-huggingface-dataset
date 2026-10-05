# mlx-community/FlashVSR-v1.1-fp32

# FlashVSR v1.1 fp32 (MLX)

## Resumen

FlashVSR-v1.1-fp32 es la conversión a MLX del modelo FlashVSR v1.1, un sistema de superresolución de vídeo (VSR) generativo basado en difusión que hace escalado ×4 en un solo paso y en modo streaming. Lo desarrollan Junhao Zhuang y colaboradores (OpenImagingLab / Universidad de Pekín y otros), y esta variante concreta la publica la comunidad mlx-community para ejecutarse sobre Apple Silicon mediante el framework MLX. El problema que resuelve es la mejora de resolución de vídeo en tiempo real: en lugar de aplicar un upscaler fiel que devuelve desenfoque, FlashVSR inventa detalle plausible a la resolución objetivo.

Arquitectónicamente es un Diffusion Transformer (DiT) con la forma del Wan2.1-1.3B (1.418.996.800 parámetros), destilado con DMD a un único paso de muestreo en t = 1000, acompañado de un proyector de condición de baja calidad `Causal_LQ4x_Proj` (287.845.888 parámetros) y un decodificador diminuto condicionado por la entrada `TCDecoder` (45.338.371 parámetros). El total ronda los 1,75 mil millones de parámetros. No necesita VAE de Wan ni codificador de texto umT5: la condición de prompt es un tensor fijo y la decodificación la hace el TCDecoder.

Esta variante fp32 (7,0 GB) es el carril de paridad o referencia del port; la comunidad publica también un carril de producción en bf16 (mlx-community/FlashVSR-v1.1-bf16, 3,5 GB) que es bit-idéntico a castear el fp32 a bf16 en carga. Su relevancia actual está en que lleva superresolución de vídeo generativa y streaming a Macs con Apple Silicon, con atención dispersa por bloques implementada como kernel de Metal, un componente que la propia model card de origen pide explícitamente no eliminar en ports de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con forma Wan2.1-1.3B, destilado DMD a un paso; proyector de condicion LQ (`Causal_LQ4x_Proj`) y decodificador `TCDecoder`; atencion dispersa por bloques (LCSA) |
| Parametros totales | 1.752.181.059 (~1,75 mil millones): DiT 1.418.996.800 + proyector LQ 287.845.888 + TCDecoder 45.338.371 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica: inferencia en streaming, con memoria independiente de la longitud del clip. La condicion de prompt es un tensor fijo de forma (1, 512, 4096) |
| Tipos de cuantizacion | fp32 (esta variante, carril de paridad) y bf16 (carril de produccion). No se documentan cuantizaciones int8/int4 en la informacion disponible |
| Idiomas soportados | No disponible. El pipeline no incorpora codificador de texto en ejecucion |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`dit_fp32.safetensors`, `lq_proj_fp32.safetensors`, `tcdecoder_fp32.safetensors`, `prompt_fp32.safetensors`) mas `config.json` |

## Arquitectura y entrenamiento

El nucleo es un DiT con la topologia de Wan2.1-1.3B transformada por destilacion DMD (Distribution Matching Distillation) a un unico paso de difusion en t = 1000, lo que permite generar cada fotograma sin cadena de pasos de ruido. La ruta de condicionamiento de baja calidad pasa por `Causal_LQ4x_Proj`, que es un Conv3d con gammas RMS, y la decodificacion final la realiza `TCDecoder`, un decodificador Conv2d de tipo TAEHV-wide condicionado por la propia entrada. No se usa VAE de Wan ni codificador de texto: la condicion textual es un tensor de prompt fijo, lo que reduce el coste de inferencia.

La innovacion tecnica principal es la atencion dispersa por bloques con restriccion de localidad (LCSA), que selecciona bloques de 128×128 mediante un top-k duro. En el upstream original se implementa con el kernel CUDA `Block-Sparse-Attention` de mit-han-lab; este port lo reimplementa como kernel de Metal que calcula solo los bloques seleccionados. El modelo es streaming: procesa fotograma a fotograma y mantiene una memoria que depende de los pixeles de salida por fotograma, no de la duracion del clip.

Los pesos de este repositorio se generaron desde `JunhaoZhuang/FlashVSR-v1.1 @ 27561b18` con el script `oracle/convert_weights.py --lane fp32`, conservando las claves del upstream y cambiando solo la disposicion de las convoluciones (channels-last). Sobre datos de entrenamiento, la model card indica que el conjunto VSR-120K esta descrito por sus autores, pero no se ha publicado; no se detallan el numero de tokens ni la composicion del dataset ni si hubo RLHF o DPO. La validacion de paridad se hizo contra el codigo del upstream en CPU y fp32, con 512×384 y 33 fotogramas, obteniendo error relativo aislado ≤ 1e-5 por componente (DiT, proyector LQ y decodificador) y un error extremo a extremo de 100–113 dB, por encima del propio suelo de sensibilidad del upstream (52,9 dB bajo perturbaciones de 1e-6, debido al top-k duro de la atencion).

## Capacidades

- Superresolucion de video ×4 y ×2 sobre material live-action, con salida de un fotograma por cada fotograma de entrada.
- Inferencia en streaming: la memoria no crece con la duracion del clip, solo con la resolucion de salida.
- Generacion de detalle fotografico plausible (caracter generativo, no reconstructivo) en rostros y texturas limitadas por resolucion.
- Condicionamiento por prompt fijo, sin codificador de texto en tiempo de ejecucion.
- Atencion dispersa por bloques acelerada con un kernel de Metal propio del port.
- No dispone de tool calling, function calling, capacidades de agente, vision semantica, audio ni modo de razonamiento: es exclusivamente un modelo de video-a-video.
- No dispone de capacidades multilingues en el sentido NLP: no procesa texto de entrada.

## Casos de uso

- Remasterizacion de metraje live-action de archivo: clips de 320×192 pueden reescalarse a 1280×768 con detalle fotografico real donde un upscaler fiel devolveria desenfoque, gracias al caracter generativo del DiT destilado.
- Postproduccion en macOS: integracion mediante el port Swift `xocialize/mlx-flashvsr-swift` para insertar el upscaling ×4 como paso previo al montaje final en un pipeline nativo de Apple Silicon.
- Uprez de contenido para redes sociales y plataformas: conversion de material grabado en movil o con camaras antiguas a resoluciones de entrega, con memoria independiente de la duracion del clip por el modo streaming.
- Procesado por lotes en infraestructura Apple Silicon: ejecucion no interactiva de un catalogo de clips en un Mac Studio o un Mac con M-series, seleccionando el carril bf16 (3,5 GB) cuando la paridad bit a bit no sea requisito.
- Prototipado e investigacion en difusion para video: al ser el carril fp32 de referencia y tener paridad verificada ≤ 1e-5 por componente, sirve para validar experimentos y comparar implementaciones contra el upstream en PyTorch.
- Mejora de feeds de video en directo: el diseno streaming y la destilacion a un unico paso permiten plantear escenarios de mejora en vivo, siempre sobre contenido live-action.
- Validacion de ports a otros backends: el kernel de atencion dispersa por bloques implementado en Metal y la paridad documentada lo convierten en referencia para verificar ports alternativos que no quieran eliminar la ruta LCSA.

## Benchmarks y rendimiento

Calidad ×4 (320×192 → 1280×768) con referencia completa contra la fuente nativa de 1280×768, comparando el upstream en PyTorch-MPS con este port:

| Clip | Metrica | Upstream (PyTorch-MPS) | Este port (bf16, MLX) |
|---|---|---|---|
| Live action | SSIMULACRA2 | −17,0 | −16,3 |
| Live action | PSNR (dB) | 27,49 | 27,59 |
| Anime pan | SSIMULACRA2 | −45,7 | −44,1 |
| Anime pan | PSNR (dB) | 25,40 | 25,48 |

Paridad frente al upstream (CPU, fp32, 512×384 y 33 fotogramas, dos goldens):

| Ambito | Resultado |
|---|---|
| Componentes aislados (DiT, proyector LQ, decodificador) | Error relativo ≤ 1e-5 |
| Extremo a extremo | 100–113 dB, por encima del suelo de sensibilidad del upstream (52,9 dB bajo perturbaciones de 1e-6) |
| Carril bf16 frente a castear el fp32 a bf16 en carga | Bit-identico en los 899 parametros |

En la fila de anime el propio autor advierte que la puntuacion refleja textura inventada (con un gradiente de imagen del doble que la referencia) y no una mejor reconstruccion. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje en la informacion disponible, ya que el modelo no es de texto.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con MLX (depende de un kernel de Metal propio). No hay ruta CUDA documentada para este repositorio.
- Tamano en disco: 7,0 GB para el carril fp32; 3,5 GB para el carril bf16.
- Memoria medida en un M5 Max (pico de `phys_footprint` con bf16): 9,2 GB con salida 640×384, 19,1 GB con 1280×768 y 33,7 GB con 1920×1152.
- Memoria fp32 a 1280×768 de salida: 34,4 GB.
- Las resoluciones de salida deben ser multiplos de 128; la entrada LQ es el tamano bicubico dividido por el factor (×4 o ×2).
- Despliegue: motor `mlx-flashvsr-swift` (`MLXServeEngine`, `MLXFlashVSR`) o la API de bajo nivel `FlashVSRPipeline` / `FlashVSRStream`. El motor descarga este repositorio en su almacen de modelos en el primer uso.
- Opciones descartadas: no aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje ni tener pesos en GGUF.
- Latencia y throughput: no disponible. La nomenclatura del proyecto apunta a tiempo real, pero la informacion proporcionada no incluye cifras de latencia ni de fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Precision de pesos | Licencia | Plataforma |
|---|---|---|---|---|---|
| mlx-community/FlashVSR-v1.1-fp32 (este) | 1,75 B | VSR generativa ×4/×2 en streaming | fp32 (7,0 GB) | Apache-2.0 | Apple Silicon (MLX/Metal) |
| mlx-community/FlashVSR-v1.1-bf16 | 1,75 B | VSR generativa ×4/×2 en streaming | bf16 (3,5 GB) | Apache-2.0 | Apple Silicon (MLX/Metal) |
| JunhaoZhuang/FlashVSR-v1.1 (upstream) | 1,75 B | VSR generativa ×4/×2 en streaming | bf16 publicado | Apache-2.0 | PyTorch (CUDA, MPS) |
| Real-ESRGAN (modelos anime) | No disponible | Superresolucion fiel | No disponible | No disponible | Multiples |

La diferencia entre los dos carriles MLX es solo de precision: el bf16 es el de produccion y reduce el consumo a la mitad; el fp32 es el de paridad. Frente al upstream, este port cambia la implementacion de la atencion dispersa (Metal en lugar de CUDA) y mantiene la paridad documentada. Real-ESRGAN aparece en la propia model card unicamente como recomendacion para contenido dibujado, no como modelo comparable en arquitectura.

## Limitaciones y advertencias

- Modelo generativo: inventa detalle plausible a la resolucion objetivo en lugar de reconstruirlo. No es un upscaler fiel.
- Recomendado solo para metraje live-action. Sobre contenido dibujado (anime, dibujos animados, motion graphics, interfaces, texto superpuesto) convierte color plano y line art limpio en textura fotografica y empuja el resultado hacia el realismo. Para esos casos hay que usar un upscaler fiel como los modelos anime de Real-ESRGAN.
- Agresivo con el desenfoque: el bokeh y los fondos suaves pueden volver como textura nitida inventada.
- La evaluacion en el clip de anime da SSIMULACRA2 de −44,1 con este port, un valor muy bajo que refleja textura inventada (gradiente de imagen el doble que la referencia).
- Sensibilidad numerica en la atencion: el top-k duro sobre bloques de 128×128 hace que un cambio de 1e-6 en la entrada altere bloques casi empatados. El propio upstream baja a 52,9 dB bajo ese tipo de perturbacion, asi que la reproducibilidad bit a bit extremo a extremo no esta garantizada.
- No hay codificador de texto ni control por prompt en tiempo de ejecucion: no se puede guiar la generacion con instrucciones textuales.
- Riesgo de alucinacion visual: al inventar textura, puede introducir detalles que no existian en la fuente, algo critico en contextos forenses, medicos o de evidencia.
- Restricciones de licencia: el codigo y los pesos de FlashVSR v1.1 son Apache-2.0; el DiT hereda la arquitectura Wan2.1 (Apache-2.0) y el TCDecoder deriva de TAEHV (MIT). El conjunto de entrenamiento VSR-120K esta descrito por sus autores pero no se ha publicado; este re-host aplica la licencia declarada de los pesos.
- Dependencia de Apple Silicon: no hay ruta de despliegue en CUDA documentada para este repositorio concreto, lo que limita su uso en servidores con GPU NVIDIA.
- El consumo de memoria escala con los pixeles de salida por fotograma: 33,7 GB en bf16 para 1920×1152, lo que excluye Macs con memoria unificada reducida.
- Repositorio con muy poca traccion: 17 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/mlx-community/FlashVSR-v1.1-fp32
- Carril de produccion en bf16: https://huggingface.co/mlx-community/FlashVSR-v1.1-bf16
- Modelo base original: https://huggingface.co/JunhaoZhuang/FlashVSR-v1.1
- Repositorio de codigo de FlashVSR: https://github.com/OpenImagingLab/FlashVSR
- Licencia del proyecto: https://github.com/OpenImagingLab/FlashVSR/blob/main/LICENSE
- Paper en arXiv (2510.12747): https://arxiv.org/abs/2510.12747
- Port Swift/MLX: https://github.com/xocialize/mlx-flashvsr-swift
- Framework MLX: https://mlx-framework.org/
- Repositorio de MLX en GitHub: https://github.com/ml-explore/mlx
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- Articulo de MLX en Wikipedia: https://en.wikipedia.org/wiki/MLX_(machine_learning_framework)
