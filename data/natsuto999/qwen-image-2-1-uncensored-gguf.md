# natsuto999/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una recopilación de cuantizaciones del modelo Qwen-Image-2.1 de Alibaba, un modelo unificado de generación y edición de imágenes de la familia Qwen. El repositorio lo publica el usuario natsuto999 y su aportación principal no es un modelo nuevo, sino el empaquetado de los pesos originales en formato GGUF (y variantes FP8, INT8, NVFP4 y MLX) junto con los ficheros auxiliares necesarios para ejecutarlo en local. El componente de generación visual tiene 7.115.124.736 parámetros distribuidos en 32 capas de un Diffusion Transformer (DiT) single-stream, y se acompaña de un codificador de texto Qwen3-VL de 8B y un VAE específico.

La relevancia de esta ficha está en dos factores. El primero es práctico: el repositorio incluye cuantizaciones de 4,15 GB a 14,23 GB, lo que permite ejecutar un modelo de generación de imagen moderno en GPU de consumo mediante ComfyUI. El segundo es la etiqueta "Uncensored": según las fuentes consultadas, los pesos corresponden a los originales de Qwen sin modificar, y la diferencia respecto a los endpoints hospedados por Alibaba es que estos últimos aplican filtrado de prompts a nivel de servicio. Es decir, el repositorio no elimina ningún filtro del modelo, sino que distribuye los pesos tal cual se publicaron.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado y actualizado con un segundo de diferencia (4 de octubre de 2026) y su licencia es qwen-research, de uso no comercial. Todo ello son factores a tener en cuenta antes de integrarlo en cualquier flujo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de 32 capas single-stream; codificador de texto Qwen3-VL 8B; VAE dedicado |
| Parametros totales | 7.115.124.736 (componente de generación visual, dato de safetensors) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible (modelo de difusión; la model card no especifica límite de tokens de prompt) |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (el codificador de texto es Qwen3-VL 8B, pero la model card no declara idiomas) |
| Licencia | qwen-research (campo `license: other`), uso no comercial |
| Formato de pesos | GGUF y safetensors (variantes MLX, FP8, INT8, NVFP4) |

Componentes auxiliares incluidos en el repositorio:

| Tipo | Fichero | Precision | Tamano |
|---|---|---|---|
| Text encoder | qwen3vl_8b_bf16.safetensors | BF16 | 17,53 GB |
| Text encoder | qwen3vl_8b_int8_convrot.safetensors | INT8 | 9,35 GB |
| VAE | qwen_image_2.1_vae_bf16.safetensors | BF16 | 676 MB |

Cuantizaciones del DiT y tamano de fichero:

| Cuantizacion | Tamano |
|---|---|
| BF16 | 14,23 GB |
| FP8 | 6,63 GB |
| INT8 ConvRot | 6,76 GB |
| NVFP4 | 4,20 GB |
| MLX 8-bit | 7,56 GB |
| MLX 6-bit | 5,78 GB |
| MLX 4-bit | 4,00 GB |
| Q8_0 | 7,59 GB |
| Q6_K | 5,88 GB |
| Q5_K_M | 5,22 GB |
| Q4_K_M | 4,60 GB |
| Q4_0 | 4,15 GB |

## Arquitectura y entrenamiento

La información disponible describe el componente de generación visual como un DiT de 32 capas single-stream con aproximadamente 7B de parámetros. Se trata, por tanto, de una arquitectura de difusión basada en transformer, no de un modelo autorregresivo: no hay ventana de contexto en tokens ni decodificación de secuencias, sino un proceso iterativo de eliminación de ruido sobre latentes. El codificador de texto es un Qwen3-VL de 8B, lo que implica que la comprensión del prompt recae en un modelo de visión-lenguaje multimodal y no en un CLIP clásico. El VAE específico (qwen_image_2.1_vae_bf16.safetensors) se encarga de la proyección entre el espacio de píxeles y el espacio latente.

No se dispone de información sobre el número de tokens de imagen utilizados en el entrenamiento, la composición del dataset, ni sobre si hubo etapas de ajuste fino con RLHF, DPO o métodos equivalentes. El repositorio no documenta ningún proceso de entrenamiento propio: se limita a cuantizar los pesos upstream, por lo que toda la innovación arquitectónica corresponde al modelo original Qwen/Qwen-Image-2.1. El modelo base se presenta como un modelo unificado de generación texto-a-imagen y edición de imágenes, con cuatro mejoras declaradas por el equipo de Qwen en su repositorio, entre ellas una arquitectura compacta y eficiente.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline `text-to-image`).
- Edición de imágenes en el modelo base, según la descripción oficial de Qwen-Image-2.1 como modelo unificado de generación y edición.
- Ejecución local con cuantizaciones de 4 a 16 bits, incluyendo formatos GGUF, MLX, FP8, INT8 y NVFP4.
- Integración con ComfyUI mediante el nodo `Unet Loader (GGUF)` y el nodo estándar `CLIPLoader` configurado con `type = qwen_image`.
- Ejecución en Apple Silicon mediante las variantes MLX de 4, 6 y 8 bits.
- Codificación de prompts con un text encoder Qwen3-VL 8B, que aporta comprensión multimodal del texto de entrada.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step: son capacidades propias de modelos de lenguaje, no de este modelo de difusión.
- No se documentan capacidades de audio, vídeo ni thinking mode.
- Los idiomas soportados no se especifican en la model card.

## Casos de uso

- Generación de imágenes en local con GPU de consumo: con la cuantización Q4_K_M (4,60 GB) más el text encoder INT8 (9,35 GB) y el VAE (676 MB), el conjunto ronda los 14,6 GB de VRAM, lo que permite trabajar en una RTX 4090 o, con offloading del encoder a CPU, en GPUs de 12 GB.
- Prototipado de assets gráficos para videojuegos e ilustración: el modelo permite iterar sobre conceptos visuales sin depender de APIs externas, lo que elimina costes por imagen y permite mantener los prompts dentro de la infraestructura propia.
- Edición de imágenes en flujos de posproducción: al tratarse de un modelo unificado de generación y edición según su descripción oficial, puede emplearse para modificar regiones concretas de una imagen existente, siempre que se disponga de los ficheros auxiliares correspondientes al flujo de edición.
- Investigación en modelos de difusión: las múltiples cuantizaciones publicadas (BF16, FP8, INT8, NVFP4, MLX 4/6/8-bit) permiten estudiar el impacto de la precisión numérica en la calidad de salida manteniendo constante el resto del pipeline.
- Procesado por lotes en servidor: con la variante BF16 (14,23 GB) sobre A100 o H100 es posible ejecutar generación a mayor resolución y con menos artefactos de cuantización que en configuraciones reducidas.
- Flujos de trabajo en macOS: las variantes MLX de 4, 6 y 8 bits (4,00 GB, 5,78 GB y 7,56 GB) están pensadas para inferencia en Apple Silicon, lo que permite usar el modelo en portátiles Mac sin GPU dedicada.
- Generación de contenido sin filtrado a nivel de servicio: al distribuirse los pesos originales sin la capa de filtrado de prompts de los endpoints hospedados, el modelo apto para entornos donde el operador asume la responsabilidad del filtrado posterior. Requiere revisión legal previa.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`), pero no se reproducen valores numéricos de benchmarks en la información disponible. No se han publicado resultados de benchmarks en la información disponible.

Tampoco se documentan métricas de latencia, throughput ni número de pasos de muestreo recomendados para este repositorio en concreto.

## Requisitos de hardware

- VRAM mínima estimada por configuración (DiT + text encoder + VAE):
  - Q4_K_M + encoder INT8 + VAE: en torno a 14,6 GB.
  - BF16 + encoder BF16 + VAE: en torno a 32,4 GB, sin contar memoria de activaciones.
  - NVFP4 + encoder INT8 + VAE: en torno a 14,2 GB.
  - MLX 4-bit + encoder INT8 + VAE: en torno a 14,0 GB.
- El text encoder puede descargarse a CPU para reducir el pico de VRAM, a costa de aumentar el tiempo de codificación del prompt.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para configuraciones Q8_0/BF16 con encoder INT8; A100 o H100 (40-80 GB) para BF16 completo con holgura para lotes y resoluciones altas; RTX 3060 12 GB o RTX 4070 para Q4_K_M con offloading parcial.
- Cabe en GPU de consumo: sí, en las cuantizaciones Q4_0 y Q4_K_M, especialmente si el text encoder se ejecuta en CPU o en INT8.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (se recomienda el fork `leejet/ComfyUI-GGUF` por su soporte nativo de Qwen-Image 2.1; con el fork antiguo `city96/ComfyUI-GGUF` puede aparecer el error `Unknown model architecture!`). Para las variantes MLX se requiere el stack de MLX en Apple Silicon. No se documenta soporte en llama.cpp, vLLM ni TGI, ya que estas herramientas no están orientadas a modelos de difusión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de licencia y disponibilidad proceden de la información consultada; los recuentos de parámetros de los modelos comparados son cifras públicas de sus respectivos proyectos y no se han verificado en fuentes primarias durante esta búsqueda.

| Modelo | Parametros | Tipo | Licencia | Formatos |
|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-GGUF (este repo) | 7,1B (DiT) + 8B (text encoder) | DiT + encoder VL | qwen-research, no comercial | GGUF, safetensors, MLX |
| Qwen/Qwen-Image-2.1 (base) | 7,1B (DiT) + 8B (text encoder) | DiT + encoder VL | qwen-research, no comercial | safetensors |
| FLUX.1 [dev] | 12B (cifra pública) | DiT | licencia no comercial de FLUX.1 dev | safetensors, GGUF |
| Stable Diffusion 3.5 Large | 8,1B (cifra pública) | DiT (MMDiT) | Stability Community License | safetensors, GGUF |

No hay datos de benchmarks en la información disponible que permitan una comparación cuantitativa de calidad entre estos modelos.

## Limitaciones y advertencias

- Licencia no comercial: el campo `license: other` con `license_name: qwen-research` restringe el uso comercial. Cualquier despliegue productivo requeriría una licencia específica de Alibaba.
- La etiqueta "Uncensored" no implica que el modelo se haya modificado para eliminar alineación: según las fuentes, son los pesos originales sin la capa de filtrado de prompts que aplican los endpoints hospedados. La responsabilidad del filtrado recae por completo en el operador.
- Riesgo legal y regulatorio: la ausencia de filtrado a nivel de servicio puede entrar en conflicto con normativa de contenido en función de la jurisdicción y del uso previsto.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado con un segundo de diferencia, lo que apunta a una subida automatizada sin revisión posterior.
- Inconsistencia de procedencia: el identificador del repositorio es `natsuto999`, pero todos los enlaces de descarga de la model card apuntan al usuario `abenzerps`. Conviene verificar qué ficheros corresponden realmente a qué repositorio antes de descargar.
- Desajuste en el tamano del repositorio: el repositorio declara 105,2 GB, mientras que el fichero más grande listado en la model card es de 17,53 GB. Es probable que existan ficheros no listados o duplicados en el historial de Git.
- Degradación por cuantización: no se publican métricas de calidad diferencial entre Q4_0, Q4_K_M y BF16, por lo que el impacto real de las cuantizaciones más agresivas no está medido.
- Sin datos de idiomas: la model card no especifica qué idiomas admiten los prompts, aunque el codificador Qwen3-VL sea multilingüe.
- Riesgo de artefactos y alucinación visual: no hay benchmarks disponibles que permitan acotar la tasa de fallos en anatomía, texto renderizado dentro de la imagen o coherencia de escenas complejas.
- Sin métricas de rendimiento: no se documentan pasos de muestreo recomendados, latencias ni throughput, lo que dificulta el dimensionamiento de infraestructura.
- Dependencia de herramientas externas: el funcionamiento correcto depende del fork `leejet/ComfyUI-GGUF`; con otros forks puede fallar la carga del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/natsuto999/Qwen-Image-2.1-Uncensored-GGUF
- Repositorio espejo: https://huggingface.co/0xSojalSec/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado): https://github.com/leejet/ComfyUI-GGUF
- Análisis sobre la ejecución local del modelo: https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
- Análisis sobre licencia y filtrado: https://blog.laozhang.ai/en/posts/qwen-image-2-1-nsfw
