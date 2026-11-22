# haanjack/Qwen-Image-Edit-2511-int8-quark

## Resumen

Qwen-Image-Edit-2511-int8-quark es una versión cuantizada a int8 del transformer del modelo de edición de imágenes Qwen/Qwen-Image-Edit-2511, publicada por el usuario haanjack. El modelo base, desarrollado por el equipo Qwen de Alibaba, resuelve tareas de edición de imágenes guiadas por instrucciones en lenguaje natural (image-to-image), y esta variante reduce el peso del componente transformer de 38,1 GB en bf16 a 25,6 GB en int8, un 33 % menos, manteniendo el resto de componentes (text encoder, VAE y processor) sin modificar.

La cuantización es weight-only, asimétrica y por grupos de 128 elementos a lo largo del eje de canales (-1), aplicada con una herramienta propia basada en quanto/quark. Se excluyen de la cuantización las capas de normalización, embeddings, patch_embed, pos_embed, time_embed y modulación, lo que preserva la estabilidad numérica de las partes sensibles del pipeline. El resultado es un checkpoint de 20.643.069.504 parámetros (unos 20,6 mil millones) distribuido en safetensors y cargable con la pipeline `QwenImageEditPlusPipeline` de diffusers.

Su relevancia es práctica: permite ejecutar un editor de imágenes de gran tamaño en hardware con menos VRAM que la versión bf16, con una pérdida de calidad medida por el propio autor (9/10 frente a 8/10 en una evaluación con un juez de visión Gemma-4-26B). La licencia Apache-2.0 del modelo base se mantiene, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para edición de imágenes (pipeline QwenImageEditPlusPipeline de diffusers) |
| Parámetros totales | 20.643.069.504 (20,6 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 weight-only, asimétrica por grupos (group_size=128, ch_axis=-1) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión integrado en un pipeline image-to-image de diffusers (`QwenImageEditPlusPipeline`). El componente transformer original tiene 38,1 GB en bf16 y esta variante lo almacena en int8 con un esquema de cuantización weight-only por grupos de 128 canales, asimétrico, aplicado sobre el eje -1. Quedan fuera de la cuantización las capas de normalización, los embeddings, patch_embed, pos_embed, time_embed y las capas de modulación, de modo que solo se comprimen las matrices de proyección del transformer. El resto de componentes del pipeline (text encoder, VAE y processor) se mantienen idénticos al modelo original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card solo documenta el proceso de cuantización. La innovación técnica destacable es precisamente el flujo de cuantización: la herramienta quanto con la opción `--diffusers-component` permite cuantizar un componente concreto del pipeline sin tocar el resto, lo que simplifica la producción de variantes ligeras de modelos de difusión.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural (image-to-image).
- Modificación de imágenes de entrada preservando la identidad y la estructura, según el comportamiento esperado del modelo base Qwen-Image-Edit.
- Compatibilidad con la pipeline `QwenImageEditPlusPipeline` de diffusers, lo que permite integrarlo en flujos de trabajo existentes basados en esa librería.
- Carga en 8 bits mediante el esquema de cuantización incluido, sin necesidad de recalibrar.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio ni modo thinking.

## Casos de uso

- Edición por lotes en producción con VRAM limitada: al reducir el transformer un 33 % (de 38,1 a 25,6 GB), permite desplegar el editor en GPUs de 40 GB o en configuraciones multi-GPU más económicas que la versión bf16, manteniendo el pipeline completo de diffusers.
- Retoque fotográfico asistido: el modelo acepta una imagen y una instrucción textual, por lo que encaja en herramientas de edición donde el usuario describe el cambio (por ejemplo, cambiar el fondo o ajustar la iluminación) y el modelo genera la imagen editada.
- Prototipado rápido en investigación: al ser un checkpoint compatible con diffusers y Apache-2.0, sirve para experimentar con edición de imágenes sin necesidad de infraestructura de gran escala.
- Generación de variaciones de producto: útil en flujos de comercio electrónico donde se parte de una foto base y se aplican cambios controlados (color, entorno) para generar catálogos.
- Integración en aplicaciones web de edición: el formato safetensors y la pipeline estándar facilitan el despliegue detrás de una API que reciba imagen e instrucción y devuelva la imagen editada.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación de calidad de int8 frente a bf16 en modelos de difusión, dado que el autor publica una comparación con un juez de visión.

## Benchmarks y rendimiento

| Modelo | Evaluación | Puntuación | Resultado de edición |
|---|---|---|---|
| Qwen-Image-Edit-2511 (bf16) | Juez de visión Gemma-4-26B | 9/10 | Éxito |
| Qwen-Image-Edit-2511-int8-quark | Juez de visión Gemma-4-26B | 8/10 | Éxito |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de edición de imágenes y la model card solo reporta la evaluación cualitativa con juez de visión.

## Requisitos de hardware

- VRAM estimada para inferencia: el transformer int8 ocupa 25,6 GB; sumando text encoder, VAE y overhead de activaciones, se requiere aproximadamente entre 30 y 40 GB de VRAM para el pipeline completo, aunque la cifra exacta no está documentada.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100, o configuraciones multi-GPU con GPUs de 24 GB mediante offloading.
- En consumer GPU: no cabe de forma holística en una RTX 4090 (24 GB) sin técnicas de offloading o quantización adicional del text encoder; con `enable_model_cpu_offload` de diffusers podría ejecutarse, a costa de latencia.
- Opciones de despliegue: diffusers con `QwenImageEditPlusPipeline`, cargando el checkpoint en 8 bits; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a pipelines de difusión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-Edit-2511-int8-quark | 20,6 mil millones | no disponible | Apache-2.0 | safetensors (int8) | Hugging Face |
| Qwen-Image-Edit-2511 (bf16) | 20,6 mil millones | no disponible | Apache-2.0 | safetensors (bf16) | Hugging Face |
| Otros modelos de edición de imágenes de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base en bf16: misma arquitectura y licencia, pero mayor peso (38,1 GB frente a 25,6 GB en el transformer) y una puntuación de calidad ligeramente superior (9/10 frente a 8/10). No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización int8 introduce una degradación medible de calidad: 8/10 frente a 9/10 en la evaluación del autor, aunque el resultado de edición sigue siendo exitoso.
- El checkpoint solo cuantiza el transformer; el text encoder y el VAE siguen en su precisión original, por lo que el ahorro de memoria es parcial.
- No se documentan sesgos específicos, pero al heredar el comportamiento del modelo base, puede reproducir sesgos presentes en los datos de entrenamiento de Qwen-Image-Edit.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede introducir elementos no solicitados o alterar regiones no indicadas por la instrucción.
- No hay información sobre idiomas soportados para las instrucciones de edición; se desconoce si el rendimiento es homogéneo entre lenguas.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes auxiliares (text encoder, VAE) antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del checkpoint.
- La herramienta de cuantización es una bifurcación propia del autor (quanto), lo que puede afectar a la reproducibilidad si se intenta regenerar el checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/haanjack/Qwen-Image-Edit-2511-int8-quark
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Herramienta de cuantización (quanto): https://github.com/haanjack/quanto
