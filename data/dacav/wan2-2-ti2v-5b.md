# Dacav/Wan2.2-TI2V-5B

## Resumen

Wan2.2-TI2V-5B es un modelo de difusión para generación de vídeo a partir de texto e imagen (text-to-video e image-to-video) desarrollado por el equipo Wan (Alibaba). Esta ficha concreta corresponde a la réplica publicada por el usuario Dacav en Hugging Face bajo el identificador `Dacav/Wan2.2-TI2V-5B`, que redistribuye los pesos del modelo oficial `Wan-AI/Wan2.2-TI2V-5B` con licencia Apache 2.0.

El modelo forma parte de la familia Wan2.2, una actualización de los modelos fundacionales de vídeo de Wan que introduce una arquitectura de mezcla de expertos (MoE) en el proceso de difusión, junto con un VAE de alta compresión (ratio 16×16×4) que reduce el coste computacional. La variante TI2V-5B, con 5.000 millones de parámetros, está diseñada para generar vídeo a 720p y 24 fps en una única GPU de consumo, como una RTX 4090, lo que la sitúa entre las opciones más eficientes de su categoría.

Su relevancia actual radica en que combina resolución 720p, 24 fps y soporte conjunto de texto-a-vídeo e imagen-a-vídeo en un tamaño que cabe en hardware de consumo, algo poco habitual en modelos de vídeo de código abierto. El repositorio ocupa 34,2 GB e incluye pesos en formato safetensors compatibles con las librerías `diffusers` y `wan2.2`, además de integración con ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo (DiT) con VAE de alta compresión 16×16×4; la familia Wan2.2 introduce MoE en las variantes A14B, no confirmado en la variante 5B |
| Parametros totales | 5B (variante TI2V-5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a modelos de difusión) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se desconoce si existen variantes GGUF/FP8 oficiales) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Resolucion de salida | 720p a 24 fps |
| Modalidades de entrada | texto e imagen (TI2V) |
| Tamano del repositorio | 34,2 GB |

## Arquitectura y entrenamiento

Wan2.2-TI2V-5B se basa en un transformer de difusión (DiT) acoplado a un VAE propio de Wan2.2 con ratio de compresión 16×16×4, que reduce drásticamente el número de tokens latentes por fotograma y permite generar 720p a 24 fps con un coste computacional contenido. La familia Wan2.2 introduce una arquitectura de mezcla de expertos (MoE) que separa el proceso de eliminación de ruido en distintos tramos temporales mediante expertos especializados; según la model card, esta innovación amplía la capacidad total del modelo manteniendo el coste computacional. No se especifica en la información disponible si la variante de 5B emplea MoE o un transformer denso.

En cuanto a los datos de entrenamiento, la model card indica que Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, e incorpora datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color para permitir un control estilístico cinematográfico. No se detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de difusión). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal para esta variante.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) a 720p y 24 fps.
- Generación de vídeo a partir de una imagen de entrada (image-to-video), manteniendo coherencia con la imagen original.
- Generación conjunta texto-imagen-a-vídeo (TI2V) en un único modelo.
- Control estético cinematográfico mediante prompts que describen iluminación, composición, contraste y tono de color.
- Generación de movimiento complejo, con mejor generalización en movimiento, semántica y estética respecto a Wan2.1 según el autor.
- Soporte multilingüe de prompts en inglés y chino.
- Integración con ComfyUI y con la librería `diffusers`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo generativo de vídeo).
- No se documentan capacidades de audio ni de visión más allá de la imagen de condicionamiento.

## Casos de uso

- Generación de clips publicitarios: el modelo produce vídeo a 720p y 24 fps en una sola GPU de consumo, lo que permite iterar creatividades de forma económica antes de pasar a producción de mayor calidad.
- Prototipado de storyboards animados: a partir de una imagen clave (image-to-video) se pueden generar movimientos preliminares para presentar una secuencia a un cliente sin necesidad de un equipo de animación.
- Creación de contenido para redes sociales: la combinación de texto-a-vídeo e imagen-a-vídeo con control estético permite generar clips verticales u horizontales ajustando iluminación y composición mediante prompt.
- Previsualización en pipelines de VFX: el modelo sirve para generar previos de movimiento y composición que luego se refinan en herramientas de producción, gracias a su resolución 720p y a la coherencia temporal del VAE de alta compresión.
- Investigación académica en generación de vídeo: al ser Apache 2.0 y caber en una RTX 4090, es adecuado para experimentar con fine-tuning, destilación o evaluación de técnicas de difusión sin clústeres dedicados.
- Automatización de contenido educativo: generación de animaciones explicativas breves a partir de texto o de una ilustración base, con prompts en inglés o chino.
- Integración en herramientas de creación con ComfyUI: flujos de trabajo nodales para equipos creativos que quieran encadenar generación de imagen y de vídeo sin escribir código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el modelo oficial de 5B en safetensors ocupa del orden de decenas de GB, aunque la model card afirma que puede ejecutarse en una GPU de consumo como la RTX 4090 (24 GB), presumiblemente con optimizaciones de precisión o de atención.
- GPU recomendadas: RTX 4090 (24 GB) como mínimo indicado por el autor para la variante 5B; para las variantes A14B y 14B de la familia se requiere inferencia multi-GPU según la model card.
- Cabe en GPU de consumo: sí, según el autor, en una RTX 4090; no se confirma para GPUs con menos de 24 GB.
- Opciones de despliegue: repositorio oficial `Wan-Video/Wan2.2` (script de inferencia), integración con `diffusers`, ComfyUI y descarga vía `huggingface-cli` o `modelscope`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplica a difusión).
- Latencia y throughput: no disponibles; el autor afirma que es uno de los modelos 720p a 24 fps más rápidos disponibles, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / fps | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-TI2V-5B | 5B | 720p / 24 fps | no disponible | Apache 2.0 | Hugging Face, ModelScope, ComfyUI, diffusers |
| Wan2.2-T2V-A14B | 14B (MoE) | 480p y 720p | no disponible | Apache 2.0 (segun repo oficial) | Hugging Face, ModelScope |
| Wan2.2-I2V-A14B | 14B (MoE) | 480p y 720p | no disponible | Apache 2.0 (segun repo oficial) | Hugging Face, ModelScope |
| Wan2.1 | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face, GitHub |

La comparativa se limita a la propia familia Wan2.2 porque la información proporcionada no incluye datos de benchmarks ni de modelos de otros desarrolladores (por ejemplo, variantes de vídeo de otros laboratorios). No se dispone de cifras de rendimiento comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos web y estéticos curados, es probable que herede sesgos de representación, pero no se aportan análisis.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o contenido no solicitado; no se cuantifica en la model card.
- Limitaciones de idioma: los prompts solo están soportados oficialmente en inglés y chino; el rendimiento con prompts en castellano no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero esta ficha corresponde a una réplica de terceros (`Dacav`), no al repositorio oficial; conviene verificar la integridad de los pesos y consultar la licencia del repo original `Wan-AI/Wan2.2-TI2V-5B`.
- Caveat de producción: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere que es una copia no verificada; para uso en producción se recomienda descargar desde el repositorio oficial de Wan-AI.
- Requisitos de hardware: aunque el autor indica que cabe en una RTX 4090, no se detallan configuraciones de precisión (fp16, fp8, offloading) ni el consumo real de VRAM.
- Duración de los clips: no se especifica en la información disponible la longitud máxima de vídeo generable.
- Sin datos de benchmarks: no hay métricas objetivas publicadas en la información disponible para evaluar calidad frente a alternativas.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Dacav/Wan2.2-TI2V-5B
- Repositorio oficial del modelo: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Organización Wan en Hugging Face: https://huggingface.co/Wan-AI/
- Repositorio GitHub: https://github.com/Wan-Video/Wan2.2
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- Blog oficial: https://wan.video/welcome
- Sitio web: https://wan.video
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Discord: https://discord.gg/AKNgpMK4Yj
