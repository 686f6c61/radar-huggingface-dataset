# Hearthscale/MiniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image GGUF es una conversión a formato GGUF del transformer de difusión podado de MiniMax H3-Image, un modelo de generación y edición de imágenes desarrollado por MiniMaxAI. Esta versión la publica Hearthscale, que la ha convertido desde los pesos en bf16 de Comfy-Org con el conversor de stable-diffusion.cpp (build `master-1088-32d516c`), de modo que el modelo pueda ejecutarse en hardware de consumo mediante stable-diffusion.cpp y su propia aplicación Hearthscale.

El modelo base tiene 20.113.670.232 parámetros (unos 20,1 mil millones) y está compuesto por 50 bloques con atención y MLP, más un token refiner, proyecciones AdaLN y cabezas de salida. La arquitectura es un transformer de difusión con destilación de pasos: la model card indica que cada imagen se genera en 6 pasos con el schedule específico del modelo (`minimax-h3-image`). El repositorio ocupa 25,4 GB e incluye cuatro cuantizaciones (Q8_0, Q5_K_M, Q4_K_M y Q3_K_M).

Su relevancia es práctica: permite ejecutar un modelo de imagen de 20B en una GPU de consumo de 10 GB (RTX 3080) gracias a la cuantización y al offload a CPU, algo impensable con los pesos originales en bf16. Además, soporta tanto text-to-image como edición de imágenes por referencia, lo que lo convierte en una opción local viable para flujos de trabajo de generación y retoque sin depender de APIs en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (diffusion transformer) podado, con token refiner y proyecciones AdaLN |
| Parametros totales | 20.113.670.232 (20,1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el texto se procesa con un encoder Qwen3-VL de 32B) |
| Tipos de cuantizacion | Q8_0, Q5_K_M, Q4_K_M, Q3_K_M (bloques y token refiner); AdaLN en F16, norms y condition projection en BF16, cabezas de salida en F32 |
| Idiomas soportados | no disponible (el prompt se procesa con Qwen3-VL, multilingüe, pero no se documenta la cobertura) |
| Licencia | MiniMax-H3-Image Community License Agreement (licencia "other", con restricciones de uso) |
| Formato de pesos | GGUF (para stable-diffusion.cpp); VAE en safetensors fp16 y text encoder en GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión podado con 50 bloques que combinan atención y MLP, un token refiner y proyecciones AdaLN para el condicionamiento. La salida se produce a través de cabezas de salida en F32, y el texto se codifica con un encoder Qwen3-VL de 32B (distribuido aparte como `qwen3vl_32b_minimax_h3-Q4_K_M.gguf` o `-Q2_K_M.gguf`). El VAE, también externo, es `minimax_h3_image_vae_fp16.safetensors`. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible en la documentación proporcionada.

La innovación principal es la destilación de pasos: el modelo está destilado para generar cada imagen en 6 pasos con el schedule `minimax-h3-image`, lo que reduce drásticamente el coste de inferencia frente a un modelo de difusión estándar de decenas de pasos. Además, esta conversión GGUF mantiene en precisión alta (F16/BF16/F32) los componentes sensibles (AdaLN, norms, condition projection y cabezas de salida) mientras cuantiza los bloques de atención y MLP, un compromiso habitual para preservar calidad en modelos de difusión cuantizados.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con prompts descriptivos en varios idiomas, procesados por el encoder Qwen3-VL.
- Edición de imágenes por referencia: se pasa una o varias imágenes con `-r` y se indica el cambio en el prompt; el modelo aplica la modificación manteniendo el resto de la imagen.
- Edición multi-referencia: se pueden encadenar varias imágenes de referencia (`-r` repetido) para composiciones o transferencias de estilo.
- Generación de texto dentro de la imagen (rótulos, carteles, menús), como muestran los ejemplos de la model card (menú de un puesto de comida, póster de jazz).
- Estilos fotográficos y de ilustración: la model card incluye ejemplos de fotografía de 35 mm y 85 mm, matte painting y diseño suizo.
- Resolución de trabajo de 1024 × 1024 en los ejemplos publicados.
- No se documentan capacidades de tool calling, agentes, audio ni vídeo para este modelo.

## Casos de uso

- Generación de imágenes locales en GPU de consumo: con la cuantización Q4_K_M (11,4 GB) y `--offload-to-cpu`, el modelo se ejecuta en una RTX 3080 de 10 GB, lo que permite crear ilustraciones y fotos sin servicios en la nube.
- Edición de fotografías por instrucción: pasar una foto con `-r` y pedir cambios concretos ("ponle un gorro rojo de punto, mantén el resto igual") es útil para retoque rápido y variaciones de producto.
- Creación de carteles y material gráfico con texto legible: los ejemplos de la model card muestran rótulos y pósters con texto integrado, adecuado para prototipos de diseño gráfico.
- Concept art y previsualización: la generación de escenas complejas (ciudades, paisajes, matte painting) sirve para iterar ideas de dirección de arte antes de producción.
- Composición multi-referencia: combinar varias imágenes de entrada para trasladar un personaje a otra escena o aplicar un estilo, útil en flujos de storyboard.
- Integración en pipelines de automatización: mediante `sd-cli` de stable-diffusion.cpp se puede invocar desde scripts para generar lotes de imágenes con semilla fija y parámetros reproducibles.
- Prototipado en Hearthscale: la aplicación incluye un "Image studio" con el VAE y el text encoder ofrecidos junto al modelo, pensado para probar y editar imágenes sin montar la CLI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta pruebas cualitativas en una NVIDIA RTX 3080 de 10 GB con 32 GB de memoria de sistema, usando el archivo Q4_K_M a 1024 × 1024, semilla 42, text encoder Q2_K_M y la build `master-1088-32d516c` de stable-diffusion.cpp.

## Requisitos de hardware

- VRAM estimada: Q3_K_M (8,8 GB) cabe en GPUs de 10 GB; Q4_K_M (11,4 GB) requiere offload a CPU en GPUs de 10 GB o una GPU de 12 GB o más; Q5_K_M (13,9 GB) y Q8_0 (21,4 GB) necesitan GPUs de 16 GB y 24 GB respectivamente, o bien offload.
- GPU probada por el autor: NVIDIA RTX 3080 de 10 GB con 32 GB de RAM de sistema, usando `--offload-to-cpu`.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para Q8_0 sin offload; RTX 4080/4070 Ti (16 GB) para Q5_K_M; GPUs de 12 GB para Q4_K_M; GPUs de 10 GB para Q3_K_M.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q3_K_M y Q4_K_M (esta última con offload en 10 GB).
- Opciones de despliegue: stable-diffusion.cpp (build `master-1088` o superior), Hearthscale 0.3.2 o superior, y `sd-cli` con los flags `--offload-to-cpu`, `--diffusion-fa` y `--vae-tiling`.
- Latencia y throughput: no disponibles; la model card no publica tiempos por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Image GGUF (este) | 20,1 B | 1024 × 1024 en ejemplos; 6 pasos | MiniMax-H3-Image Community License | GGUF en HF, stable-diffusion.cpp y Hearthscale |
| MiniMaxAI/MiniMax-H3-Image (original) | 20,1 B (bf16) | no disponible | MiniMax-H3-Image Community License | Pesos originales en HF |
| Comfy-Org/MiniMax-H3-Image | 20,1 B (pruned bf16) | no disponible | MiniMax-H3-Image Community License | safetensors en HF, para ComfyUI |
| leejet/MiniMax-H3-GGUF | 20,1 B | no disponible | MiniMax-H3-Image Community License | GGUF en HF, text encoder incluido |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de otros desarrolladores; la comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- La licencia MiniMax-H3-Image Community License Agreement limita dónde puede usarse el modelo; es imprescindible leerla antes de cualquier uso comercial.
- El modelo está podado respecto al original, por lo que puede perder calidad frente a los pesos completos en bf16; no se documenta el impacto exacto del podado.
- Los archivos GGUF requieren el VAE y el text encoder por separado; sin ellos el modelo no funciona, y el text encoder Qwen3-VL de 32B añade requisitos de memoria considerables.
- La cuantización Q3_K_M y, en menor medida, Q4_K_M pueden introducir artefactos o degradación en detalles finos y texto; la model card solo valida visualmente Q4_K_M.
- No se documentan sesgos conocidos, cobertura idiomática ni tasas de alucinación visual; no hay información disponible al respecto.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación por parte de la comunidad es mínima.
- La build de stable-diffusion.cpp necesaria (`master-1088`) es reciente; versiones anteriores no cargan el modelo.
- El uso de `--offload-to-cpu` en GPUs de 10 GB implica latencias mayores y dependencia de la RAM del sistema (32 GB en las pruebas del autor).

## Enlaces

- Repositorio GGUF: https://huggingface.co/Hearthscale/MiniMax-H3-Image-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Pesos pruned en Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- GGUF de referencia (leejet): https://huggingface.co/leejet/MiniMax-H3-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Guía de MiniMax-H3-Image en stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/minimax_h3_image.md
- Hearthscale: https://hearthscale.com
- Licencia: https://huggingface.co/Hearthscale/MiniMax-H3-Image-GGUF/blob/main/LICENSE
