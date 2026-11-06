# jessolmstead/greycard-rorem-fast

## Resumen

Greycard-rorem-fast es un adaptador de destilación LCM (Latent Consistency Model) sobre RORem-mixed, un modelo de eliminación de objetos (object removal) basado en SDXL inpainting. Lo desarrolla jessolmstead como parte del proyecto greycard, una herramienta de eliminación generativa de objetos. El modelo resuelve el problema de la latencia en la inferencia de eliminación de objetos: sustituye las 24 llamadas al UNet del modelo base por solo 3, reduciendo el tiempo de ejecución a aproximadamente un tercio.

Técnicamente, se trata de un LoRA de rango 64 destilado mediante el script de destilación LCM de los autores originales, exportado a ONNX en fp16 para su ejecución con ONNX Runtime sobre WebGPU. El repositorio contiene únicamente los adaptadores (788 matrices A y B sin fusionar) y dos grafos ONNX que los aplican; no es un modelo autónomo, ya que requiere los pesos del UNet de greycard-rorem (`unet.onnx_data`), así como su VAE y sus embeddings.

Es relevante para desarrolladores que necesiten integrar eliminación de objetos en aplicaciones web con aceleración por GPU, ya que el modelo está diseñado para ejecutarse en el navegador mediante WebGPU, con un tiempo de aproximadamente 3 segundos a resolución 1024 en una GPU de 16 GB. El modelo base RORem-mixed procede de RORem (Li et al., CVPR 2025), un trabajo sobre eliminación robusta de objetos con human-in-the-loop.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de SDXL inpainting con adaptadores LoRA (destilación LCM), exportado a ONNX |
| Parametros totales | no disponible (los adaptadores suman 393.502.720 bytes; el UNet base es de greycard-rorem) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión para imágenes) |
| Tipos de cuantizacion | fp16 (exportación ONNX); no se documentan otras |
| Idiomas soportados | no disponible (modelo de imagen, no de texto) |
| Licencia | CreativeML Open RAIL++-M (openrail++) con restricciones de uso (Attachment A) |
| Formato de pesos | ONNX (`unet-lcm-1024.onnx`, `unet-lcm-512.onnx`, `unet-lora.onnx_data`) |

## Arquitectura y entrenamiento

El modelo es un LoRA de rango 64 entrenado sobre el UNet de RORem-mixed, que a su vez es un fine-tune de SDXL inpainting. La destilación sigue el script LCM de los autores originales: solver DDIM, 50 pasos esqueleto, escalados de frontera con timestep scaling 10, y el mismo UNet con sus adaptadores desactivados como profesor a guidance 1.0 sobre el prompt vacío. El entrenamiento consta de 4000 pasos con batch 8 y learning rate 1e-4, seguidos de 1500 pasos adicionales con batch 6 y learning rate 2e-5 a partir del paso 3000, con media móvil exponencial de los pesos del adaptador (decay 0.997); se publica la media en el paso 4000.

Los datos de entrenamiento son 2082 fotografías propias del autor, con 8000 recortes aleatorios de 1024 píxeles y máscaras de estilo LaMa. La exportación mantiene los 788 adaptadores (A y B, fp16) sin fusionar en `unet-lora.onnx_data`. Los dos grafos son los del UNet de greycard-rorem a latente 128 y 64, con cada capa lineal y convolucional adaptada reescrita como el peso base más el producto escalado de sus adaptadores, leyendo los pesos base de `unet.onnx_data` por nombre y los adaptadores de este repositorio. El fix de Resize y el padding de `conv_in` son los de greycard-rorem, sin cambios.

## Capacidades

- Eliminación generativa de objetos en imágenes (inpainting con máscaras).
- Generación de relleno en huecos grandes, con calidad algo más rugosa que el modelo profesor.
- Inferencia acelerada: 3 llamadas al UNet en lugar de 24, con scheduler LCM sobre 4 pasos desde strength 0.99.
- Ejecución en navegador mediante ONNX Runtime sobre WebGPU.
- Soporte de dos resoluciones de latente: 128 (1024 px) y 64 (512 px).
- No soporta tool calling, agentes, texto, visión general ni audio; es exclusivamente un modelo de imagen para eliminación de objetos.

## Casos de uso

- Eliminación de objetos en aplicaciones web: el modelo se ejecuta en el navegador con ONNX Runtime y WebGPU, por lo que puede integrarse en un editor de imágenes online sin backend GPU, con un tiempo de aproximadamente 3 segundos a 1024 px en una tarjeta de 16 GB.
- Retoque fotográfico interactivo: al requerir solo 3 llamadas al UNet, permite previsualizaciones rápidas mientras el usuario ajusta la máscara, y elegir entre la variante Fast y Best según el parche.
- Limpieza de imágenes para datasets: eliminación de marcas de agua, objetos no deseados o elementos temporales en fotografías propias antes de usarlas en entrenamiento, aprovechando las máscaras de estilo LaMa.
- Edición por lotes en pipelines locales: procesamiento por lotes de fotografías con eliminación de objetos recurrentes (por ejemplo, cables, señales o personas de fondo) mediante scripts que invocan los grafos ONNX directamente.
- Prototipado de herramientas de eliminación de objetos: al ser un adaptador ligero (0,4 GB) sobre greycard-rorem, permite experimentar con la variante rápida sin reentrenar el modelo base.
- Aplicaciones de escritorio con aceleración WebGPU: integración en herramientas tipo Electron o Tauri que ejecutan ONNX Runtime sobre WebGPU, con descarga de los archivos verificada por SHA-256.
- Demos y entornos con recursos limitados: la variante rápida reduce el coste computacional frente al modelo profesor, adecuada para GPUs de consumo con 16 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card aporta una evaluación cualitativa: en 34 ventanas reservadas, el estudiante se sitúa aproximadamente un nivel por encima del profesor de media, con una dispersión de dos, mientras que la dispersión del profesor frente a la verdad es de siete; frente a la verdad, ambos puntúan igual. En huecos grandes, los rellenos son más rugosos (fragmentos donde el profesor dibuja formas).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la model card indica ejecución en una GPU de 16 GB a 1024 px en aproximadamente 3 segundos.
- GPU recomendadas: tarjetas con 16 GB o más (por ejemplo, RTX 4080, RTX 4090, A100); no se documentan pruebas en GPUs de menor capacidad.
- GPU de consumo: cabe en tarjetas de 16 GB según la model card; no se confirma su funcionamiento en GPUs de 8 GB.
- Opciones de despliegue: ONNX Runtime sobre WebGPU (vía greycard); no se documentan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: aproximadamente 3 segundos por imagen a 1024 px en una GPU de 16 GB; no se documenta throughput por lotes.

## Comparativa con modelos similares

| Modelo | Tipo | Llamadas al UNet | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| greycard-rorem-fast | LoRA LCM sobre RORem-mixed, ONNX fp16 | 3 | 1024 y 512 | OpenRAIL++-M | Hugging Face (adaptadores) |
| greycard-rorem | UNet RORem-mixed, ONNX fp16 | 24 | 1024 y 512 | OpenRAIL++-M | Hugging Face |
| RORem-mixed | SDXL inpainting fine-tune | no disponible | no disponible | no disponible | Referenciado en la model card |
| LaMa | Inpainting clásico (máscaras de estilo LaMa) | no aplica | no disponible | no disponible | Referenciado en la model card |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere `unet.onnx_data` de greycard-rorem, además de su VAE y embeddings; sin ellos, los archivos no hacen nada.
- Calidad inferior al profesor en huecos grandes: los rellenos son más rugosos, con fragmentos donde el profesor dibuja formas.
- Sesgos conocidos: no documentados en la información disponible; el entrenamiento usa 2082 fotografías propias del autor, lo que puede limitar la generalización a otros dominios visuales.
- Riesgo de alucinación visual: como modelo generativo, puede inventar contenido en las regiones enmascaradas; la model card no cuantifica este riesgo.
- Restricciones de licencia: CreativeML Open RAIL++-M con restricciones de uso (Attachment A), derivada de RORem-mixed, que es un fine-tune de SDXL inpainting; revisar las restricciones antes de uso comercial.
- Limitaciones de idioma: no aplica (modelo de imagen); no se documentan capacidades multilingües.
- Caveat para producción: el modelo está pensado para ejecutarse con ONNX Runtime sobre WebGPU; no se documentan otras rutas de despliegue ni su comportamiento en GPUs de menos de 16 GB.

## Enlaces

- [Hugging Face: jessolmstead/greycard-rorem-fast](https://huggingface.co/jessolmstead/greycard-rorem-fast)
- [Modelo base: jessolmstead/greycard-rorem](https://huggingface.co/jessolmstead/greycard-rorem)
- [Repositorio greycard](https://github.com/jessolmstead/greycard)
- [LCM-LoRA: A Universal Stable-Diffusion Acceleration Module (Luo et al., 2023)](https://arxiv.org/abs/2311.05556)
- [RORem: Training a Robust Object Remover with Human-in-the-Loop (Li et al., CVPR 2025)](https://arxiv.org/abs/2505.02505)
