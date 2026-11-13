# linoyts/MiniMax-H3-Image-pDMD-2steps

## Resumen

MiniMax-H3-Image-pDMD-2steps es un adaptador LoRA de destilación para el modelo de difusión texto-a-imagen MiniMax-H3-Image, desarrollado por el usuario linoyts y publicado en Hugging Face. Su propósito es reducir el coste computacional de la inferencia: transforma el muestreo de 6 pasos del modelo base en solo 2 pasos (dos pasadas por el transformer), manteniendo una calidad cercana tanto en generación texto-a-imagen como en edición con imágenes de referencia. El resultado es un modelo apto para pipelines interactivos y de tiempo real donde la latencia importa.

La técnica empleada es pDMD (DMD2 con la proyección pDMD, Distribution Matching Distillation), usando el muestreador de 6 pasos del modelo base como profesor. El LoRA tiene rango 128 y alpha 128, y se aplica sobre las proyecciones de atención (`to_q`, `to_k`, `to_v`, `to_out.0`) y las capas feed-forward (`ff.net.0.proj`, `ff.net.2`) del transformer. Se entrenó durante 1000 pasos en una única H100 con resoluciones multi-aspecto alrededor de 1 megapíxel.

Es relevante ahora porque el modelo base MiniMax-H3-Image es un generador de imágenes de gran tamaño (transformer y codificador de texto de unos 62 GB cada uno en bfloat16) cuyo muestreo completo resulta caro; este LoRA de 1,4 GB permite reducir a un tercio los pasos de inferencia sin reentrenar el modelo base, integrándose en `diffusers` 0.43.0 o superior mediante bloques de Modular Diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de destilación sobre transformer de difusión (MiniMax-H3-Image); rank 128, alpha 128 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene transformer y text encoder de ~62 GB cada uno en bfloat16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión texto-a-imagen; no aplica ventana de contexto de tokens) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; la inferencia de referencia usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3-Image Community License Agreement (licencia `other`) |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`) |
| Tamano del repositorio | 1,4 GB |
| Pasos de inferencia | 2 pasos, `sample_sigmas=[1.0, 12/13, 0.0]` |
| Resolucion de entrenamiento | ~1 megapíxel (1024x1024, 768x1344, 1344x768) |
| Libreria | diffusers >= 0.43.0 (Modular Diffusers, Python 3.11+) |
| Modelo base | MiniMaxAI/MiniMax-H3-Image |

## Arquitectura y entrenamiento

El adaptador se construye sobre MiniMax-H3-Image, un modelo de difusión texto-a-imagen con transformer y codificador de texto de gran tamaño (unos 62 GB cada uno en bfloat16). El LoRA destilado se entrena con pDMD, una variante de DMD2 que incorpora la proyección pDMD para hacer coincidir la distribución del estudiante de 2 pasos con la del profesor de 6 pasos. El profesor es el propio muestreador de 6 pasos del modelo base, de modo que el estudiante aprende a reproducir su comportamiento con dos pasadas por el transformer.

El entrenamiento consistió en 1000 pasos en una única GPU H100, con resoluciones multi-aspecto (1024x1024, 768x1344 y 1344x768) y sobre prompts expandidos por MiniMax-H3-Image-PE, el modelo de expansión de prompts que espera el modelo base. El LoRA se inyecta en las proyecciones de atención y en las capas feed-forward del transformer. El transformer del modelo base dispone de una cabeza de salida por paso; el pipeline usa las cabezas en orden, por lo que en la configuración de 2 pasos se emplean las dos primeras. Al estar el modelo base destilado con guiado, no se usa `guidance_scale` ni `negative_prompt`.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con 2 pasos de muestreo.
- Edición de imágenes con referencia visual (image-to-image / image-editing): se pasan imágenes de referencia como `image` y se referencian en el prompt como `<Picture 1>`, `<Picture 2>`, etc.
- Instrucciones de edición en lenguaje natural sobre la imagen de referencia (por ejemplo, eliminar un objeto o modificar una escena manteniendo el resto).
- Generación multi-aspecto alrededor de 1 megapíxel (1024x1024, 768x1344, 1344x768).
- Compatibilidad con prompts largos y detallados; funciona mejor con descripciones ricas o prompts expandidos por MiniMax-H3-Image-PE.
- Inferencia de pocos pasos orientada a baja latencia (2 pasadas por el transformer en lugar de 6).
- No dispone de `guidance_scale` ni `negative_prompt` (modelo base destilado con guiado).
- No se documentan capacidades de tool calling, agentes, audio ni visión más allá de la imagen de referencia para edición.

## Casos de uso

- Generación de imágenes interactiva en tiempo real: con solo 2 pasos de muestreo, el modelo permite iterar prompts y ver resultados con mucha menor latencia que el modelo base de 6 pasos, lo que encaja en interfaces de creación visual con feedback inmediato.
- Edición fotográfica asistida: usar una imagen de referencia como `<Picture 1>` y aplicar instrucciones en lenguaje natural (quitar objetos, cambiar elementos de la escena) manteniendo el resto intacto, útil en herramientas de retoque semiautomático.
- Prototipado rápido de conceptos visuales: equipos de diseño pueden generar variantes de una idea a ~1 megapíxel en 1024x1024 o formatos verticales/horizontales (768x1344, 1344x768) con coste de inferencia reducido.
- Generación de assets para aplicaciones: creación de ilustraciones o imágenes de fondo en pipelines automatizados donde el throughput importa y el coste por imagen debe minimizarse.
- Variaciones sobre una referencia de marca: partir de una imagen base (producto, personaje, escena) y generar ediciones controladas por prompt, adecuado para explorar variaciones de estilo o composición.
- Pruebas de concepto en investigación sobre destilación de difusión: el adaptador sirve como referencia reproducible de pDMD aplicado a un modelo texto-a-imagen grande, con receta de entrenamiento (1000 pasos, H100, schedule de 2 pasos) documentada.
- Despliegue con offloading en hardware limitado: gracias al offload automático a CPU (~140 GB de RAM) documentado en la model card, puede ejecutarse en configuraciones sin suficiente VRAM para el modelo completo en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, comparativas numéricas) frente al modelo base de 6 pasos; solo afirma cualitativamente que la calidad se mantiene "cercana" al modelo completo.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,4 GB, pero requiere cargar el modelo base MiniMax-H3-Image completo.
- Transformer y codificador de texto del modelo base: ~62 GB cada uno en bfloat16.
- Con offload automático a CPU (`enable_auto_cpu_offload`), se necesitan aproximadamente 140 GB de RAM de sistema; es la configuración documentada en la model card.
- GPU recomendadas: el entrenamiento se realizó en una H100; para inferencia con el modelo completo en GPU se requiere hardware de clase数据中心 (A100/H100 con suficiente VRAM) o bien offloading. No se especifican requisitos mínimos de VRAM para inferencia sin offload.
- No se documenta compatibilidad con GPUs de consumo (RTX 4090, etc.) ni el uso de cuantizaciones para reducir VRAM.
- Opciones de despliegue: `diffusers` >= 0.43.0 con Modular Diffusers (Python 3.11+), `transformers`, `accelerate` y `safetensors`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo de difusión).
- Latencia y throughput: no disponibles de forma numérica; la ventaja declarada es reducir de 6 a 2 pasos por el transformer.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-pDMD-2steps (este) | LoRA de destilación pDMD sobre MiniMax-H3-Image | 2 | ~1 MP (1024x1024, 768x1344, 1344x768) | MiniMax-H3-Image Community License | Hugging Face (linoyts) |
| MiniMax-H3-Image (base) | Modelo de difusión texto-a-imagen | 6 | no disponible en la informacion (canvas por defecto de al menos 4 MP) | MiniMax-H3-Image Community License | Hugging Face (MiniMaxAI) |
| Otras destilaciones de pocos pasos para difusión | LoRA/SDXL-Turbo, LCM, DMD2, etc. | 1-4 | variable | variable | no disponible en la informacion para una comparacion directa con este modelo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- El LoRA está entrenado alrededor de 1 megapíxel; si no se pasa `min_generation_area=1024`, el pipeline genera por defecto sobre un lienzo de al menos 4 MP, resolución para la que el adaptador no fue entrenado y en la que la calidad puede degradarse.
- Funciona mejor con prompts largos y detallados; los prompts cortos funcionan, pero el modelo fue entrenado con prompts expandidos por MiniMax-H3-Image-PE, y se recomienda usar ese formato o el propio modelo de expansión.
- No admite `guidance_scale` ni `negative_prompt` por ser el modelo base destilado con guiado; los flujos que dependan de guiado negativo no son aplicables.
- El schedule de 2 pasos `[1.0, 12/13, 0.0]` es específico del entrenamiento; usar otro número de pasos o sigmas puede producir resultados fuera de distribución.
- Requiere `diffusers` >= 0.43.0 y Python 3.11+ (Modular Diffusers); no es compatible con versiones anteriores.
- El modelo base es muy pesado (~62 GB por componente en bfloat16) y exige offloading (~140 GB de RAM de sistema) en la configuración documentada.
- Riesgo de alucinación visual y de fidelidad limitada en la edición: al ser una destilación de 2 pasos, puede perder detalle o introducir artefactos frente al modelo de 6 pasos, especialmente en escenas complejas.
- Sesgos: no se documentan sesgos específicos en la información disponible; al heredar el modelo base, puede reproducir los sesgos de sus datos de entrenamiento.
- Licencia: se distribuye como Model Derivative bajo la MiniMax-H3-Image Community License Agreement; es necesario revisar sus términos para uso comercial y redistribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/linoyts/MiniMax-H3-Image-pDMD-2steps
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Modelo de expansión de prompts: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Bloques PE para diffusers: https://huggingface.co/diffusers/minimax-h3-image-pe-blocks
- Licencia (copia en el repositorio): LICENSE del repositorio del modelo
- Aviso de modificaciones: NOTICE del repositorio del modelo
