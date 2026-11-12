# EliovpAI/MiniMax-H3-Image-FP8-Paiton-RDNA4

## Resumen

MiniMax-H3-Image FP8-Paiton-RDNA4 es una redistribución de pesos cuantizados a FP8 del modelo de imagen MiniMax-H3-Image (33B parámetros) de MiniMax, empaquetada por EliovpAI para el runtime nativo Paiton sobre GPUs AMD RDNA4 (gfx1201), en concreto la Radeon AI PRO R9700 de 32 GB. No es un checkpoint FP8 genérico: los pesos vienen en formatos propios del contenedor Paiton, con la modulación AdaLN precalculada en tablas para el esquema fijo de 6 pasos de muestreo y los layouts de proyección reordenados para los kernels de Paiton. Solo la imagen Paiton para R9700 puede cargarlos; diffusers, vLLM-Omni y ComfyUI no son compatibles.

El modelo base resuelve text-to-image e image editing con hasta 16 imágenes de referencia, a resoluciones de 4 a 16 MP y con 6 pasos de muestreo. Esta versión cuantizada permite ejecutarlo en una única GPU de consumo profesional AMD de 32 GB, algo que el checkpoint BF16 original no permite en ese hardware. La relevancia actual está en habilitar inferencia de un modelo de imagen de 33B en el ecosistema ROCm/RDNA4, un segmento con menos tooling que el de NVIDIA.

La licencia es la MiniMax-H3-Image Community License, con restricciones geográficas y comerciales relevantes que se detallan más abajo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 11 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con modulación AdaLN; text encoder Qwen3-VL; VAE con bloques int8 |
| Parametros totales | 33B (modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 con redondeo GPTQ en proyecciones del transformer; FP8 en capas 0-49 del text encoder; bf16 en embedding y vision tower; int8 en bloques del VAE |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3-Image Community License (license_name: minimax-h3-image-community-license) |
| Formato de pesos | Formatos propios del contenedor Paiton (no safetensors/GGUF estándar); tokenizer.json estándar |
| Resolucion de salida | 4 a 16 MP |
| Pasos de muestreo | 6 (esquema fijo, tablas AdaLN precalculadas) |
| Imagenes de referencia (edición) | hasta 16 |
| Tamaño del repositorio | dit/ 20.3 GB, te/ 27.1 GB, vae/ 0.5 GB, tokenizer 7 MB |
| Revision del checkpoint original | 00dd081ebdd33315adf2c4d84f64aa327ddf3039 |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3-Image es un transformer de difusión para generación y edición de imágenes de 33B parámetros. La arquitectura combina un text encoder Qwen3-VL (capas decodificadoras 0 a 49, con embedding y vision tower) con un transformer principal que aplica modulación AdaLN, y un VAE con encoder y decoder. El esquema de muestreo es de solo 6 pasos, lo que sugiere destilación o un sampler few-step entrenado específicamente.

Esta redistribución no entrena nada nuevo: cuantiza el checkpoint original a FP8 con redondeo GPTQ en las proyecciones del transformer, precalcula las tablas de modulación AdaLN para el schedule fijo de 6 pasos y reordena los layouts de proyección para los kernels de Paiton. El text encoder mantiene embedding y vision tower en bf16 para preservar calidad, mientras que las capas decodificadoras 0-49 van en FP8. El VAE usa bloques int8. El archivo `MODIFICATIONS.md` documenta cómo se generó cada fichero a partir del checkpoint original, y `manifest.json` lista tamaños y SHA-256 de todos los archivos.

## Capacidades

- Generación de imágenes texto-a-imagen en resoluciones de 4 a 16 MP y múltiples aspect ratios.
- Edición de imágenes con hasta 16 imágenes de referencia por petición.
- Renderizado correcto de texto en imágenes, manos y caras según la validación del autor.
- Muestreo few-step (6 pasos), lo que reduce latencia frente a samplers de 20-50 pasos.
- Codificación de texto multilingüe potencial vía Qwen3-VL, aunque los idiomas soportados no están declarados en la ficha.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente; es un modelo de imagen, no un LLM conversacional.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Generación de imágenes de alta resolución para prensa o catálogo: el modelo produce 4096 x 4096 en 33,4 s en una R9700, adecuado para pipelines por lotes donde la resolución final importa más que el coste por imagen.
- Edición con múltiples referencias para composición de producto: con dos o tres referencias a 4096 x 4096 en 66,9 s y 88,5 s respectivamente, se pueden fusionar elementos de varias imágenes fuente en una escena coherente.
- Retoque y variación de imágenes de catálogo con una sola referencia a 4096 x 4096 en 39,9 s, útil para generar variantes de un mismo producto sin reentrenar.
- Prototipado rápido en hardware AMD: al caber en una R9700 de 32 GB con un máximo de 27,6 GiB usados, permite iterar en estaciones de trabajo ROCm sin depender de clústeres NVIDIA.
- Edición de imágenes de gran formato a 4736 x 3552 con referencia del mismo tamaño en 50,1 s, aplicable a material gráfico de impresión o cartelería.
- Generación a 1024 x 1024 mediante generación nativa a 2048 x 2048 y posterior redimensionado en 7,1 s, útil cuando se necesita throughput alto en miniaturas o previews.
- Evaluación comparativa de calidad FP8 frente a BF16: el autor publica métricas CLIP-L y DINOv2 que permiten auditar la pérdida de fidelidad antes de adoptar la cuantización en producción.

## Benchmarks y rendimiento

Rendimiento de inferencia medido por el autor en una Radeon AI PRO R9700 (32 GB, límite de 300 W), tiempo de servidor por petición desde la solicitud HTTP hasta el PNG final, con servidor caliente en el contenedor Paiton:

| Peticion | Tiempo |
|---|---:|
| Text to image, 2048 x 2048 | 6,9 s |
| Text to image, 1024 x 1024 (generado a 2048 y redimensionado) | 7,1 s |
| Text to image, 4096 x 4096 | 33,4 s |
| Edit, 4096 x 4096, una referencia 1024 x 1024 | 39,9 s |
| Edit, 4736 x 3552, una referencia 4736 x 3552 | 50,1 s |
| Edit, 4096 x 4096, dos referencias | 66,9 s |
| Edit, 4096 x 4096, tres referencias | 88,5 s |

Calidad frente al modelo BF16 en diffusers, con los mismos token ids y el mismo ruido, sobre una batería de 30 casos (24 prompts de texto a imagen de 4 a 17 MP y 6 ediciones con 1 a 3 referencias):

| Metrica | BF16 | Estos pesos |
|---|---:|---:|
| CLIP-L text-image score, media | 32,31 | 32,18 |
| Similitud de imagen CLIP-L vs BF16, media / mínimo | — | 0,979 / 0,855 |
| Similitud de imagen DINOv2 vs BF16, media / mínimo | — | 0,945 / 0,699 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de imagen.

## Requisitos de hardware

- VRAM: máximo observado de 27,6 GiB de los 32 GB de la R9700; el modelo no cabe en GPUs de 24 GB con este empaquetado.
- GPU objetivo: AMD Radeon AI PRO R9700 (32 GB, gfx1201, RDNA4). Solo la imagen Paiton para gfx1201 carga estos pesos.
- No es compatible con diffusers, vLLM-Omni ni ComfyUI.
- Despliegue: contenedor Paiton con el plugin `Eliovp-BV/paiton-vllm-plugin`, colocando los pesos en `models/MiniMax-H3-Image`; el contenedor descarga el repositorio en el primer arranque.
- No se documenta compatibilidad con GPUs NVIDIA, Apple Silicon ni CPU.
- Consumo: pruebas realizadas con la tarjeta a su límite de 300 W.
- Throughput y latencia: ver tabla de benchmarks; los tiempos incluyen text encoder, 6 pasos, decodificación VAE y codificación PNG.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto / referencias | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| MiniMax-H3-Image FP8-Paiton-RDNA4 (este) | 33B | 4-16 MP | hasta 16 referencias | MiniMax-H3-Image Community License | AMD RDNA4, 32 GB |
| MiniMax-H3-Image (BF16 original) | 33B | 4-16 MP | hasta 16 referencias | MiniMax-H3-Image Community License | GPUs de mayor VRAM (no especificado) |
| Alternativas de la misma categoría (p. ej. otros DiT de imagen de gran tamaño) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos comparables con los que contrastar parámetros, contexto o rendimiento; la comparación se limita al modelo base BF16 del que deriva esta cuantización.

## Limitaciones y advertencias

- La licencia no cubre la Unión Europea, el Reino Unido, la República de Corea ni los Estados Unidos: el uso en esas jurisdicciones queda fuera del acuerdo.
- Un producto o servicio comercial que use el modelo debe mostrar "MiniMax-H3-Image" de forma prominente en su interfaz de usuario.
- Ofrecer el modelo a terceros como servicio alojado, o superar 1 millón de dólares de ingresos anuales, requiere autorización previa por escrito de MiniMax.
- Los usuarios a los que se dé acceso deben quedar vinculados por las restricciones de la Sección V y la Acceptable Use Policy.
- Al redistribuir los archivos hay que incluir `LICENSE` y `NOTICE`.
- Los pesos solo cargan en la imagen Paiton para gfx1201; no hay portabilidad a diffusers, ComfyUI ni vLLM-Omni.
- La cuantización FP8 introduce divergencia respecto a BF16: la similitud DINOv2 mínima cae a 0,699, y el autor señala que las diferencias se concentran en el layout porque el sampler few-step sigue una trayectoria distinta tras pequeños cambios numéricos.
- La evaluación de calidad usa una semilla por prompt en 30 casos, por lo que la cobertura estadística es limitada.
- No se declaran idiomas soportados ni sesgos conocidos; el riesgo de alucinación visual (elementos inventados en la imagen) no está cuantificado en la ficha.
- El repositorio tiene 0 descargas y 0 likes, sin validación independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/EliovpAI/MiniMax-H3-Image-FP8-Paiton-RDNA4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Plugin y contenedor Paiton: https://github.com/Eliovp-BV/paiton-vllm-plugin
