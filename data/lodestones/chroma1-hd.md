# lodestones/Chroma1-HD

## Resumen

Chroma1-HD es un modelo fundacional de texto a imagen de 8.900 millones de parámetros (8.899.983.424 exactos según el archivo safetensors) desarrollado por el usuario lodestones y publicado bajo licencia Apache 2.0. Está construido sobre la arquitectura de FLUX.1-schnell, de la que hereda el diseño de transformer de difusión con condicionamiento de texto mediante un codificador T5-XXL y un VAE propio de FLUX. Su propuesta principal es ofrecer una base completamente abierta, tanto en pesos como en licencia, para entrenamiento y ajuste fino posterior.

El modelo se presenta explícitamente como un *base model*: no está optimizado para ser el mejor generador zero-shot, sino para servir como punto de partida neutral sobre el que la comunidad construya modelos especializados. El preentrenamiento fue financiado por un donante anónimo y se realizó sobre un conjunto de datos de 5 millones de muestras, según la información disponible en la model card.

Su relevancia actual reside en la combinación de tres factores: un tamaño de 8,9B parámetros —competitivo con los modelos de difusión abiertos más capaces—, una licencia Apache 2.0 sin restricciones de uso comercial y la compatibilidad con el ecosistema diffusers (`ChromaPipeline`) y ComfyUI. Existe además una variante derivada, Chroma1-Flash, con la escala de guiado (CFG) "horneada" para inferencia rápida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión basado en FLUX.1-schnell |
| Parámetros totales | 8.899.983.424 (8,9B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Int8 dinámica A8W8, FP8 dinámica A8W8 y MXFP A16W4 vía gemlite; además de bf16/fp16 nativos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 98,7 GB con checkpoint, VAE y workflow de ComfyUI) |

## Arquitectura y entrenamiento

Chroma1-HD reutiliza la arquitectura de FLUX.1-schnell, un transformer de difusión de 8,9B parámetros que opera sobre latentes de un VAE y recibe el condicionamiento textual a través de un codificador T5-XXL. La canalización en diffusers se expone como `ChromaPipeline` y admite *negative prompt*, un parámetro poco habitual en los derivados de FLUX-schnell y que aquí se usa de forma nativa en los ejemplos de la model card con 40 pasos de inferencia y `guidance_scale=3.0`.

El entrenamiento se realizó sobre un conjunto de datos de 5 millones de muestras, según la model card (el texto disponible está truncado en ese punto, por lo que no se detalla la composición del dataset, el número total de tokens de imagen ni si hubo fases de RLHF o DPO, que en modelos de difusión no aplican del mismo modo). Tampoco se documentan innovaciones técnicas adicionales más allá de la propia base FLUX y del soporte de cuantización mediante gemlite, que permite sustituir capas lineales por versiones int8/FP8/MXFP4 y compilar el transformer y el VAE con `torch.compile(fullgraph=True)`.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en lenguaje natural, con soporte de *negative prompt* para excluir atributos no deseados.
- Funciona como checkpoint base para *fine-tuning*: la model card lo describe como punto de partida neutral para crear modelos especializados (estilos, dominios concretos, personajes).
- Control fino del proceso de muestreo: número de pasos (`num_inference_steps`), escala de guiado (`guidance_scale`), semilla manual y generación de múltiples imágenes por prompt.
- Compatibilidad con ComfyUI mediante workflow JSON publicado, encoder T5-XXL y VAE de FLUX.
- Inferencia cuantizada en 8 y 4 bits con gemlite, con soporte de `torch.compile` para reducir latencia.
- No se documentan capacidades de edición de imagen, *inpainting*, *outpainting*, control por pose o profundidad, tool calling ni agentes; es un modelo estrictamente de texto a imagen.

## Casos de uso

- **Fine-tuning de estilos visuales de marca**: al ser un base model Apache 2.0, un estudio puede entrenar sobre su propio corpus de imágenes para producir un generador alineado con su identidad visual sin las restricciones de licencia de FLUX.1-dev.
- **Generación de ilustración para producto editorial**: con 40 pasos y `guidance_scale=3.0` se obtienen imágenes de composición controlada; el *negative prompt* permite eliminar artefactos recurrentes como desenfoque, paletas planas o deformaciones.
- **Prototipado rápido en ComfyUI**: el workflow JSON publicado permite a diseñadores encadenar el modelo con nodos de posprocesado, upscaling o segmentación sin escribir código.
- **Investigación sobre métodos de difusión**: al ser una base abierta y reproducible, sirve para experimentar con schedulers, escalas de guiado, cuantización y estrategias de destilación comparando contra el linaje FLUX.
- **Creación de datasets sintéticos**: generación por lotes de imágenes etiquetadas para entrenar clasificadores o modelos de visión, con semilla fija para reproducibilidad.
- **Despliegue en infraestructura propia con requisitos de soberanía**: la licencia Apache 2.0 y el formato safetensors permiten servirlo en clústeres on-premise sin dependencias de proveedores externos.
- **Base para destilación de variantes rápidas**: la existencia de Chroma1-Flash como derivado con CFG horneado demuestra el flujo de trabajo de especialización sobre este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas como FID, CLIP score, GenEval o HPSv2, ni comparaciones numéricas con otros modelos. El único dato de rendimiento medible aportado es de latencia: 40 pasos para una imagen pasan de 66,12 s a 27,72 s tras aplicar cuantización int8 A8W8 con gemlite y `torch.compile`, aunque la model card no especifica qué GPU se utilizó para la medición.

## Requisitos de hardware

- **Pesos del transformer en bf16/fp16**: aproximadamente 17,8 GB (8,9B × 2 bytes). Es la cifra que domina el presupuesto de VRAM.
- **Pipeline completo en precisión nativa**: hay que sumar el encoder T5-XXL (≈9,5B en fp16, unos 19 GB) y el VAE de FLUX; sin *offload* el total se aproxima a 37-40 GB.
- **GPU de consumo**: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar el transformer en bf16 con el encoder textual descargado a CPU mediante `enable_model_cpu_offload()`. Con cuantización int8 (≈9 GB) o MXFP4 (≈5 GB) el margen es amplio.
- **GPU de datacenter recomendadas**: A100 40 GB, A100/H100 80 GB, L40S 48 GB para servir el pipeline completo sin *offload* y con lotes mayores.
- **Formatos de despliegue**: `diffusers` con `ChromaPipeline` (ruta oficial documentada), ComfyUI (workflow JSON, T5-XXL y VAE de FLUX) y cuantización con gemlite. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a modelos de difusión de este tipo.
- **Latencia observada**: 27,72 s por imagen a 40 pasos con cuantización int8 y `torch.compile`; 66,12 s en la configuración de referencia. GPU de la medición no disponible.
- **Throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Licencia | Contexto / condicionamiento | Disponibilidad |
|---|---|---|---|---|
| Chroma1-HD | 8,9B | Apache 2.0 | T5-XXL + VAE FLUX; soporta negative prompt | HuggingFace, diffusers, ComfyUI |
| FLUX.1-schnell | 12B | Apache 2.0 | T5-XXL + VAE FLUX; destilado para pocos pasos | HuggingFace, diffusers, ComfyUI |
| FLUX.1-dev | 12B | No comercial | T5-XXL + VAE FLUX | HuggingFace, diffusers |
| Stable Diffusion 3.5 Large | 8B | Stability Community License (uso comercial con condiciones) | Triple encoder de texto (CLIP + T5) | HuggingFace, diffusers, ComfyUI |

Chroma1-HD se posiciona como la alternativa Apache 2.0 de tamaño medio-alto frente a FLUX.1-dev (mejor calidad de referencia pero con licencia no comercial) y como competidor directo de SD 3.5 Large en el segmento de 8B parámetros, con la ventaja de una licencia sin cláusulas adicionales. Frente a FLUX.1-schnell, del que deriva, sacrifica la inferencia en muy pocos pasos a cambio de un comportamiento más adequado para *fine-tuning* y del uso de *negative prompt*. Los datos de rendimiento comparado no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos de representación**: al entrenarse sobre un dataset de 5 millones de muestras cuya composición no se detalla, se desconocen los sesgos demográficos, culturales y de estilo inherentes. La ausencia de documentación sobre filtrado de datos es un riesgo para producción.
- **Riesgo de alucinación visual**: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible en la imagen, perspectivas incoherentes y atributos contradictorios respecto al prompt, especialmente con prompts largos o muy específicos.
- **Es un base model, no un modelo ajustado**: la propia model card advierte de que está pensado para *fine-tuning*. El rendimiento zero-shot en estética y seguimiento de instrucciones puede quedar por debajo de modelos afinados con preferencias humanas.
- **Idiomas no documentados**: no se especifica qué idiomas distintos del inglés comprende el condicionamiento textual; el encoder T5-XXL es mayoritariamente anglófono, por lo que se espera un rendimiento degradado en castellano.
- **Sin datos de benchmarks**: no hay métricas publicadas que permitan estimar calidad objetiva ni comparar con alternativas antes de invertir en evaluación propia.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones adicionales, pero conviene verificar las licencias de los componentes auxiliares (T5-XXL y VAE de FLUX) si se redistribuyen por separado.
- **Coste de infraestructura**: el pipeline completo en precisión nativa ronda los 37-40 GB de VRAM, lo que excluye GPU de consumo sin *offload* o cuantización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lodestones/Chroma1-HD
- Variante rápida con CFG horneado (Chroma1-Flash): https://huggingface.co/lodestones/Chroma1-Flash
- Checkpoint para ComfyUI: https://huggingface.co/lodestones/Chroma
- VAE de FLUX: https://huggingface.co/lodestones/Chroma/resolve/main/ae.safetensors
- Encoder T5-XXL (fp16): https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp16.safetensors
- Workflow de ComfyUI para Chroma1-HD: https://huggingface.co/lodestones/Chroma1-HD/resolve/main/ComfyUI_Chroma1-HD_T2I-workflow.json
- Plataforma de inferencia asociada: https://fictional.ai/?ref=chroma_hf
- Paper, blog técnico y repositorio de código: no disponibles en la información proporcionada.
