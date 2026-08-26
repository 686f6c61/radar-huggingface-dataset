# briaai/Fibo-Edit-1.5-base

## Resumen

Fibo-Edit-1.5-base es un modelo de edición de imágenes desarrollado por BRIA AI, diseñado para proporcionar un control estructurado y determinista sobre el proceso de edición mediante la generación de prompts en formato JSON. Se apoya en el modelo fundacional Fibo, un sistema de texto a imagen nativo JSON, y extiende sus capacidades a tareas de image-to-image, inpainting y multi-referencia. El objetivo principal es eliminar la ambigüedad en las instrucciones de edición, permitiendo a los usuarios especificar de forma precisa qué cambios realizar sobre una imagen sin depender de interpretaciones subjetivas del modelo.

El modelo cuenta con aproximadamente 8 290 millones de parámetros y se distribuye como safetensors, con una pipeline específica `BriaFiboEditPipeline` en la librería diffusers. Su acceso en HuggingFace es restringido (gated), por lo que se requiere aceptar los términos de la licencia `bria-fibo-edit-1.5`. Aunque la información pública no detalla la arquitectura interna exacta, se sabe que integra un módulo de generación de prompts estructurados y un controlador JSON, lo que lo diferencia de otros editores de imágenes basados en difusión más genéricos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de difusión para edición de imágenes, sin especificar variante) |
| Parámetros totales | 8 285 836 848 (aprox. 8.29B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imágenes, no de texto) |
| Tipos de cuantización | No disponible (se distribuye en safetensors, no se indican versiones cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | bria-fibo-edit-1.5 (licencia propia de BRIA, requiere aceptación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo, pero por su naturaleza y la biblioteca diffusers se deduce que se trata de un modelo de difusión latente diseñado para tareas de edición de imágenes. La innovación principal de Fibo-Edit reside en su control de prompts estructurados: en lugar de aceptar instrucciones en lenguaje libre, el modelo procesa un JSON que especifica las operaciones de edición (regiones, acciones, parámetros). Este enfoque permite un comportamiento determinista y predecible, reduciendo la ambigüedad típica de los editores basados en texto libre.

No se han publicado datos sobre el conjunto de entrenamiento, el número de tokens procesados, ni el uso de técnicas como RLHF o DPO. La documentación oficial menciona que el modelo se basa en Fibo, que ya era nativo JSON, y que para el modo local se puede utilizar un modelo VLM adicional (`briaai/FIBO-edit-prompt-to-JSON`) que convierte un prompt libre en el JSON de control. Esta combinación sugiere que el entrenamiento se centró en la alineación entre instrucciones estructuradas y resultados visuales, aunque los detalles específicos no están disponibles.

## Capacidades

- Edición de imágenes con control estructurado mediante prompts JSON, lo que permite especificar operaciones exactas sobre regiones concretas.
- Soporte de image-to-image: transforma una imagen de entrada según las instrucciones dadas.
- Inpainting: permite rellenar o modificar áreas específicas de una imagen.
- Multi-referencia: puede combinar múltiples imágenes de referencia para guiar la edición.
- Generación de prompts estructurados: el modelo (o su VLM asociado) puede convertir instrucciones en lenguaje natural a formato JSON.
- Control determinista: al operar con JSON, las mismas entradas producen el mismo resultado, lo que facilita la reproducibilidad.
- Multilingüe: solo soporta inglés de forma nativa, aunque el VLM de conversión podría ampliar el alcance.

## Casos de uso

- **Edición de imágenes para diseño gráfico**: los diseñadores pueden especificar cambios precisos en una imagen (cambiar colores, añadir objetos, eliminar elementos) mediante JSON, garantizando que el resultado se ajuste a la intención original.
- **Inpainting de productos en e-commerce**: para eliminar fondos o retirar objetos no deseados de fotografías de producto, con control exacto sobre las regiones a modificar.
- **Automatización de pipelines de postproducción**: al ser determinista, se puede integrar en flujos de trabajo automatizados donde se requiera edición de imágenes sin revisión manual constante.
- **Generación de variaciones controladas**: para crear múltiples versiones de una imagen base cambiando solo parámetros específicos (iluminación, estilo, posición de elementos).
- **Restauración de imágenes**: mediante inpainting, se pueden rellenar zonas dañadas o eliminadas de fotografías antiguas con resultados predecibles.
- **Creación de contenido publicitario**: permite ajustar imágenes de catálogo o anuncios de forma reproducible, manteniendo la coherencia visual en campañas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre métricas como FID, CLIP score, o comparativas con otros editores de imagen (p. ej., InstructBLIP, MagicBrush, etc.). Por tanto, no es posible evaluar cuantitativamente su rendimiento en tareas estándar de edición.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 8.29B parámetros en precisión fp16, se requiere al menos 16 GB de VRAM para inferencia. Con cuantización (no disponible oficialmente) podría reducirse, pero no hay garantías.
- **GPU recomendadas**: GPUs con 16 GB o más, como NVIDIA RTX 3090, RTX 4090, A100, H100. Para producción, se recomienda A100 (80 GB) para manejar el peso completo.
- **Compatibilidad con consumer GPU**: es posible ejecutar el modelo en una RTX 4090 (24 GB) en fp16, pero no en GPUs de 8 GB.
- **Opciones de despliegue**: se puede usar a través de la pipeline `BriaFiboImagePipeline` en diffusers, o mediante la API de BRIA. También se puede servir con vLLM para el modelo de conversión JSON, aunque el modelo principal es de imágenes y requiere un servidor de difusión (p. ej., Stable Diffusion WebUI o un servicio personalizado).
- **Latencia y throughput**: no se han publicado datos oficiales. Dependiendo del hardware, una edición simple podría tardar entre 5 y 15 segundos en una GPU moderna, pero es una estimación no confirmada.

## Comparativa con modelos similares

No hay información suficiente para realizar una comparativa con otros modelos de edición de imágenes como InstructPix2Pix, MagicBrush o DiffEdit. No se dispone de datos de benchmarks ni de características técnicas de estos modelos en la información proporcionada. Por tanto, no es posible establecer una comparación objetiva en este momento.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo es gated, por lo que se requiere aceptar la licencia `bria-fibo-edit-1.5` antes de poder descargarlo o utilizarlo. Esta licencia puede tener restricciones comerciales específicas.
- **Idioma**: el modelo solo está entrenado para inglés. El uso con otros idiomas puede dar resultados no óptimos, aunque el VLM de conversión JSON podría ayudar.
- **Sesgos y alucinaciones**: al ser un modelo de difusión, puede presentar artefactos visuales o alucinaciones en regiones editadas, especialmente si el JSON especifica operaciones no realistas o fuera de distribución.
- **Control limitado**: aunque el JSON ofrece control, la calidad final depende de la precisión de las instrucciones y de la capacidad del modelo para interpretar regiones y operaciones complejas.
- **Requisitos de hardware**: el tamaño del modelo y su peso (24.1 GB) exigen GPUs de gama alta, lo que puede limitar su uso en entornos con recursos reducidos.
- **Documentación incompleta**: no se han publicado detalles sobre arquitectura, entrenamiento o benchmarks, lo que dificulta evaluar su fiabilidad y comportamiento en casos extremos.

## Enlaces

- [Hugging Face - briaai/Fibo-Edit-1.5-base](https://huggingface.co/briaai/Fibo-Edit-1.5-base)
- [GitHub - Bria-AI/Fibo-Edit](https://github.com/Bria-AI/Fibo-Edit)
- [Página oficial de Fibo Edit](https://bria.ai/fibo-edit)
- [Página oficial de Fibo](https://bria.ai/fibo)
