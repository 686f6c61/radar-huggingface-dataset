# axteam/Motif-Video-2B-FP8

## Resumen

Motif-Video-2B-FP8 es una versión cuantizada en FP8 (`float8_e4m3fn`) del transformer DiT del modelo de generación de vídeo a partir de texto Motif-Video-2B, desarrollado por Motif-Technologies. Esta cuantización ha sido realizada por el usuario axteam y publicada en Hugging Face como derivado bajo licencia Apache 2.0. El objetivo es reducir el tamaño en memoria del modelo original (aproximadamente un 63 % respecto a la versión BF16 del transformer) para facilitar su ejecución en ComfyUI, el ecosistema popular de generación de imágenes y vídeo con interfaces de nodos.

El archivo publicado contiene únicamente el transformer (DiT, `MotifVideoTransformer3DModel`) cuantizado; el VAE y los codificadores de texto no están incluidos y deben descargarse del repositorio original. Con un tamaño de 2,6 GB en un único fichero safetensors, esta versión busca permitir la generación de vídeo en configuraciones con menos VRAM, manteniendo las normas, sesgos y capas de modulación AdaLN en BF16 para preservar la calidad.

Es relevante porque la cuantización FP8 se ha convertido en un estándar de facto en ComfyUI para modelos de difusión grandes, y contar con una versión ligera de Motif-Video-2B facilita su adopción por la comunidad de usuarios locales sin depender de hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer), `MotifVideoTransformer3DModel` |
| Parametros totales | no disponible (aprox. 2 B según el nombre del modelo) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (`float8_e4m3fn`), pesos 2-D; normas, sesgos y capas AdaLN (`norm*.linear`) en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (derivado del modelo base) |
| Formato de pesos | safetensors (`Motif-Video-2B-transformer-fp8_e4m3fn.safetensors`, 2,6 GB) |

## Arquitectura y entrenamiento

El modelo base, Motif-Video-2B, emplea una arquitectura de tipo Diffusion Transformer (DiT) implementada como `MotifVideoTransformer3DModel`, diseñada para la tarea de texto a vídeo (pipeline `text-to-video`). Esta versión FP8 no es un reentrenamiento: es una conversión directa (cast) de los pesos del transformer a `float8_e4m3fn`, sin escalado por canal, siguiendo la convención habitual de ComfyUI para ficheros `fp8_e4m3fn`. Para minimizar la pérdida de calidad, solo se cuantizan los tensores de pesos de dos dimensiones, mientras que las capas de normalización, los sesgos y las capas de modulación AdaLN (`norm*.linear`) se mantienen en BF16.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens o frames de entrenamiento, composición del dataset, uso de RLHF/DPO u otras técnicas). Tampoco se ha documentado el impacto exacto de la cuantización en la calidad del vídeo generado; la model card indica que los ajustes del sampler (pasos, CFG/guidance, resolución) son idénticos a los del modelo original.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante un transformer de difusión, heredada del modelo base Motif-Video-2B.
- Ejecución en ComfyUI mediante el nodo `Load Diffusion Model` (`UNETLoader`), con `weight_dtype` en `default` al estar el fichero ya cuantizado.
- Compatibilidad con los mismos parámetros de muestreo que el modelo original (pasos, CFG/guidance, resolución).
- Reducción de memoria aproximada del 37 % respecto al transformer en BF16, lo que facilita su uso en GPUs de consumo.
- No incluye capacidades de texto, código, visión, audio ni tool calling: es un componente de difusión especializado, no un modelo de lenguaje.

## Casos de uso

- Generación local de vídeo a partir de texto en ComfyUI: el usuario descarga el fichero FP8 a `ComfyUI/models/diffusion_models`, instala los nodos personalizados y genera clips de vídeo sin necesidad de la versión completa en BF16, ahorrando VRAM.
- Creación de contenido audiovisual para redes sociales: flujos de trabajo en ComfyUI que combinan generación de vídeo con postproducción (upscale, interpolación de frames) para producir clips cortos a partir de descripciones textuales.
- Prototipado rápido de prompts de vídeo: al ocupar menos memoria, permite iterar más rápido o ejecutar varias instancias en una misma GPU para comparar resultados de distintos prompts o semillas.
- Integración en pipelines de producción con hardware limitado: estudios o creadores individuales con GPUs de consumo (por ejemplo RTX 4090) pueden incorporar generación de vídeo a sus flujos de trabajo sin alquilar GPUs de centro de datos.
- Experimentación con cuantización FP8: al ser un cast directo sin escalado, sirve como caso de estudio para evaluar la degradación de calidad de la cuantización FP8 en modelos de vídeo DiT.
- Workflows híbridos imagen-plus-vídeo: combinación con otros modelos en ComfyUI (por ejemplo, generación de imagen inicial y animación posterior) aprovechando que el transformer cuantizado libera VRAM para el resto de componentes del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos sobre VBench, FVD ni ninguna otra métrica de calidad de vídeo para esta versión cuantizada ni para el modelo base.

## Requisitos de hardware

- El fichero del transformer ocupa 2,6 GB; la versión BF16 original ocuparía aproximadamente 4,1 GB (el FP8 es un 63 % del tamaño), a los que hay que sumar el VAE y los codificadores de texto del modelo original, no incluidos en este repo.
- El README de los nodos personalizados ComfyUI-MotifVideo2B indica que actualmente se necesita el modo High VRAM de ComfyUI, lo que sugiere que el workflow completo (VAE + text encoder + transformer) requiere una GPU con memoria holgada; no se publica una cifra exacta de VRAM.
- GPU recomendada: no disponible de forma explícita; por el tamaño del fichero, una GPU de consumo con 16-24 GB de VRAM (RTX 4090, RTX 3090) es un punto de partida razonable, aunque la cuantización FP8 en ComfyUI está optimizada para GPUs NVIDIA con soporte de FP8 (RTX 40xx).
- Despliegue: ComfyUI con los nodos personalizados ComfyUI-MotifVideo2B (obligatorios, ya que ComfyUI estándar no puede cargar el text encoder y el VAE de Motif-Video). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Caracteristica | Motif-Video-2B-FP8 | Motif-Video-2B (original) | HunyuanVideo (referencia de categoria) |
|---|---|---|---|
| Tipo | DiT text-to-video cuantizado FP8 | DiT text-to-video BF16 | DiT/MoE text-to-video |
| Parametros | ~2 B | ~2 B | 13 B |
| Tamano del transformer | 2,6 GB (FP8) | ~4,1 GB (BF16, estimado) | mayor |
| Cuantizacion | FP8 e4m3fn | BF16 | versiones FP8 disponibles |
| Licencia | Apache 2.0 | Apache 2.0 | licencia propia Tencent |
| Integracion | ComfyUI (nodos custom) | diffusers / ComfyUI | ComfyUI, diffusers |

Nota: los datos de HunyuanVideo se incluyen solo como referencia de categoria; no hay comparativas de rendimiento publicadas entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- El fichero contiene solo el transformer: es obligatorio descargar el VAE y los codificadores de texto del repositorio original `Motif-Technologies/Motif-Video-2B`, y ComfyUI estándar no puede cargarlos sin los nodos personalizados ComfyUI-MotifVideo2B.
- Los nodos personalizados requieren actualmente el modo High VRAM de ComfyUI, lo que limita la utilidad real de la cuantización en GPUs con poca memoria.
- La cuantización es un cast directo sin escalado por canal, por lo que puede haber cierta degradación de calidad respecto al modelo BF16 original; no se han publicado mediciones de esta degradación.
- No hay información sobre el rendimiento del modelo base en benchmarks de vídeo, ni sobre los idiomas soportados por el codificador de texto, lo que dificulta evaluar su comportamiento con prompts en castellano.
- Al ser un modelo de difusión, puede presentar artefactos temporales típicos de la generación de vídeo (incoherencia entre frames, deformaciones); no hay documentación específica sobre estos riesgos para este modelo.
- Licencia Apache 2.0 tanto en el derivado como en el modelo base, por lo que el uso comercial está permitido sin restricciones conocidas, aunque los pesos originales pertenecen a los autores upstream.
- Métricas de la comunidad muy bajas (0 descargas, 1 like en el momento de la ficha), lo que implica poca validación por parte de usuarios y posible falta de soporte o correcciones.

## Enlaces

- Modelo cuantizado (FP8): https://huggingface.co/axteam/Motif-Video-2B-FP8
- Modelo base: https://huggingface.co/Motif-Technologies/Motif-Video-2B
- Nodos personalizados ComfyUI: https://github.com/MotifTechnologies/ComfyUI-MotifVideo2B
