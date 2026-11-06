# AST-1320/Qwen-Image-To-Image

## Resumen

Qwen-Image-To-Image es un repositorio de conversión que reempaqueta los pesos del modelo Qwen-Image-Edit-Rapid-AIO (obra de Phr00t) en formato Diffusers, manteniendo los pesos en FP8 tal como estaban en el original. No se trata de un modelo entrenado desde cero ni de un fine-tune propio del autor del repositorio (AST-1320): es únicamente una redistribución del transformer en carpetas versionadas con safetensors fragmentados, pensada para cargarse directamente con `QwenImageTransformer2DModel.from_pretrained`. El text encoder y el VAE no se incluyen y deben tomarse del modelo base Qwen/Qwen-Image-Edit-2511.

El modelo subyacente pertenece a la familia Qwen-Image-Edit, orientada a edición y transformación de imágenes por difusión, con un transformer de tipo DiT (diffusion transformer) como componente principal. Al derivar de Qwen-Image-Edit-2511, hereda su arquitectura y su comportamiento de generación, pero este repositorio solo aporta el transformer en FP8, no el pipeline completo.

Es relevante ahora porque facilita el uso del modelo en flujos de trabajo estándar de Diffusers sin necesidad de convertir manualmente los pesos, aunque exige al usuario emparejarlo con los componentes restantes del modelo base. El repo tiene 20,4 GB, licencia Apache-2.0 y está etiquetado como `not-for-all-audiences`, lo que conviene tener en cuenta antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) para edición de imagen; pesos en FP8 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos mantenidos en FP8 como en el original); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (modelo de imagen; el texto se procesa mediante el text encoder del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors fragmentados (sharded), organizados en subcarpetas por versión |

## Arquitectura y entrenamiento

El componente incluido es un transformer de difusión (`QwenImageTransformer2DModel`) que opera como denoiser dentro de un pipeline de image-to-image / edición de imagen. Los pesos se distribuyen en carpetas por versión, con safetensors fragmentados y precisión FP8, replicando el estado del modelo original Qwen-Image-Edit-Rapid-AIO. El repositorio no incluye text encoder ni VAE: ambos deben cargarse desde Qwen/Qwen-Image-Edit-2511 para completar el pipeline.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del reempaquetado en formato Diffusers y la preservación de los pesos en FP8. Cualquier detalle sobre el proceso de entrenamiento del modelo original debe consultarse en la ficha de Qwen/Qwen-Image-Edit-2511 o en el repositorio de Phr00t.

## Capacidades

- Edición y transformación de imágenes mediante difusión, heredadas del modelo base Qwen-Image-Edit-2511.
- Conversión image-to-image a partir de una imagen de entrada y una instrucción textual procesada por el text encoder externo.
- Carga directa en Diffusers mediante `QwenImageTransformer2DModel.from_pretrained` con el subfolder de la versión deseada.
- Compatibilidad con pipelines de Diffusers que requieran un transformer de Qwen-Image-Edit, siempre que se aporten text encoder y VAE del modelo base.
- Soporte de pesos en FP8 para reducir huella de memoria frente a precisión completa.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Edición de imágenes en producción con Diffusers: integrar el transformer en un pipeline que cargue el text encoder y el VAE desde Qwen/Qwen-Image-Edit-2511 para aplicar transformaciones guiadas por texto sobre imágenes existentes.
- Prototipado rápido de flujos image-to-image: al estar ya en formato Diffusers, permite montar un pipeline funcional sin convertir pesos manualmente, útil para validar ideas antes de invertir en infraestructura.
- Retoque y modificación de assets gráficos: aplicar cambios localizados sobre imágenes de marketing o catálogo usando instrucciones textuales, aprovechando los pesos FP8 para reducir requisitos de VRAM.
- Investigación en difusión: servir como punto de partida para experimentos de edición de imagen con un transformer preentrenado, comparando versiones alojadas en subcarpetas separadas.
- Despliegue en entornos con memoria limitada: la precisión FP8 permite cargar el transformer en GPUs con menos VRAM que las necesarias para pesos en BF16, a costa de posibles pérdidas de fidelidad.
- Automatización de pipelines creativos: encadenar el transformer con herramientas de orquestación para generar variaciones de imágenes por lotes, siempre que se gestione el componente de texto y VAE por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 20,4 GB, correspondientes al transformer en FP8; a ello hay que sumar el text encoder y el VAE del modelo base, que no están incluidos.
- VRAM estimada: no disponible de forma oficial; los pesos FP8 del transformer implican al menos ~20 GB solo para el transformer, más la memoria del text encoder y del VAE y las activaciones durante la inferencia.
- GPU recomendadas: no disponibles en la información proporcionada; por el volumen de pesos, se requiere una GPU con memoria alta (gama profesional tipo A100/H100 o similares) o estrategias de offload.
- Compatibilidad con GPU de consumo: no confirmada; probablemente requiere offload a CPU o técnicas de gestión de memoria en tarjetas de 24 GB o menos.
- Opciones de despliegue: Diffusers (librería indicada en los tags). Otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AST-1320/Qwen-Image-To-Image | Conversión Diffusers de transformer de difusión (FP8) | no disponible | no disponible | Apache-2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen-Image-Edit-2511 | Modelo base de edición de imagen | no disponible | no disponible | Apache-2.0 (según la model card) | HuggingFace |
| Phr00t/Qwen-Image-Edit-Rapid-AIO | Modelo original del que derivan los pesos | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa entre estas variantes.

## Limitaciones y advertencias

- El repositorio no es un modelo autónomo: sin el text encoder y el VAE de Qwen/Qwen-Image-Edit-2511 no puede ejecutarse.
- Está etiquetado como `not-for-all-audiences`; conviene revisar el contenido generado y aplicar filtros en entornos públicos.
- Los pesos están en FP8, lo que puede introducir degradación de calidad frente a precisión completa; no se documenta el impacto exacto.
- No hay información sobre sesgos, tasas de alucinación visual ni limitaciones idiomáticas del modelo subyacente.
- Aunque la licencia declarada es Apache-2.0, el modelo deriva de pesos de terceros (Phr00t) y del modelo base Qwen; conviene verificar las condiciones de uso comercial en las fuentes originales.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria documentada; no se han publicado benchmarks ni evaluaciones independientes.
- No se especifican requisitos de memoria ni instrucciones completas de pipeline más allá de la carga del transformer.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AST-1320/Qwen-Image-To-Image
- Modelo original de los pesos: https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
