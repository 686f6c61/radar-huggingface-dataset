# alkyum/neverseen-qwen-image-edit-2511

## Resumen

`alkyum/neverseen-qwen-image-edit-2511` no es un modelo entrenado por su autor, sino una copia empaquetada (slim copy) de los ficheros que consume un workflow de edición de imagen de Neverseen Studio sobre endpoints serverless de RunPod. Reúne en un único repositorio el modelo de difusión Qwen-Image-Edit-2511 en cuantización GGUF Q4_K_M, el codificador de texto Qwen 2.5 VL 7B en FP8 escalado, el VAE de Qwen-Image y dos LoRA de destilación (Lightning de 4 y 8 pasos). El autor declara explícitamente que cada fichero se copia tal cual desde su repositorio de origen y conserva su licencia (Apache-2.0 en todos los casos).

El interés del repositorio es práctico: agrupa las dependencias exactas necesarias para ejecutar el pipeline de edición de imagen Qwen-Image-Edit-2511 en ComfyUI o en un endpoint serverless, con versiones fijadas por commit. El tamaño del repo es de 24,2 GB y el recuento de parámetros en safetensors asciende a 20.430.401.088, cifra que corresponde al conjunto de pesos del codificador de texto y componentes asociados, no a un único transformer.

La relevancia es acotada: se trata de un artefacto de despliegue, no de una release oficial, por lo que no debe citarse como modelo canónico. Para evaluar Qwen-Image-Edit-2511 conviene acudir a los repositorios upstream indicados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion para edicion de imagen (Qwen-Image-Edit-2511) con codificador de texto Qwen 2.5 VL 7B y VAE propio; el repo no detalla la arquitectura interna del transformer de difusion |
| Parametros totales | 20.430.401.088 (recuento agregado en safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M para el modelo de difusion; FP8 escalado para el text encoder; BF16 para las LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (todos los componentes segun la model card) |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es un espejo de ficheros. El componente principal es `qwen-image-edit-2511-Q4_K_M.gguf`, una cuantización GGUF de 4 bits (Q4_K_M) del modelo de difusión Qwen-Image-Edit-2511, publicada originalmente por unsloth. Se acompaña del codificador de texto `qwen_2.5_vl_7b_fp8_scaled.safetensors`, que aporta la comprensión multimodal de instrucciones e imágenes, y del VAE `qwen_image_vae.safetensors` para la codificación y decodificación latente.

Sobre el modelo base se aplican dos LoRA de destilación de lightx2v, `Lightning-4steps-V1.0` y `Lightning-8steps-V1.0` en BF16, que reducen el número de pasos de muestreo necesarios (4 u 8 frente a los pipelines completos). La model card no aporta datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas del modelo base, por lo que esa información debe consultarse en los repositorios upstream.

## Capacidades

- Edición de imagen guiada por instrucciones en lenguaje natural, mediante el pipeline Qwen-Image-Edit-2511.
- Comprensión de imagen y texto a través del codificador Qwen 2.5 VL 7B.
- Generación con muestreo reducido gracias a las LoRA Lightning (4 y 8 pasos), lo que baja el coste por inferencia.
- Ejecución en cuantización GGUF Q4_K_M, pensada para entornos con VRAM limitada o despliegues serverless.
- Integración con ComfyUI y con workflows de endpoints serverless (RunPod) según el propósito declarado del repo.
- Soporte de tool calling, agentes, razonamiento multi-paso, audio o thinking mode: no disponible (no es un modelo de lenguaje conversacional).

## Casos de uso

- Edición de imágenes por lotes en producción: el pipeline permite aplicar instrucciones de edición (cambios de estilo, sustitución de objetos, retoques) sobre conjuntos de imágenes, con la ventaja de que la cuantización Q4_K_M reduce los requisitos de VRAM frente al modelo completo.
- Despliegue serverless en RunPod: el repo agrupa exactamente los ficheros que consume el endpoint de Neverseen Studio, de modo que sirve como snapshot reproducible para reconstruir el entorno de inferencia.
- Prototipado en ComfyUI: los nodos de ComfyUI pueden cargar el GGUF, el text encoder FP8, el VAE y las LoRA desde un único repositorio, simplificando la configuración del grafo.
- Generación rápida de variantes con Lightning 4 pasos: para aplicaciones interactivas donde la latencia importa, la LoRA de 4 pasos permite obtener ediciones con muy pocas iteraciones de muestreo.
- Generación de variantes de mayor calidad con Lightning 8 pasos: cuando se prioriza fidelidad sobre velocidad, la LoRA de 8 pasos ofrece un punto intermedio antes del pipeline completo.
- Reproducibilidad de experimentos: al fijar commits de origen en la model card, el repo permite reproducir exactamente los pesos usados en un workflow concreto, útil para auditoría o comparación de resultados.
- Base para fine-tuning o experimentación con LoRA adicionales: al estar los componentes separados (difusión, text encoder, VAE, LoRA), es sencillo sustituir o añadir adaptadores sin recompilar todo el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de difusión de este tipo en Q4_K_M más un text encoder de 7B en FP8 suele requerir del orden de 12-16 GB de VRAM, pero esta cifra no está confirmada en la información proporcionada.
- GPU recomendadas: no disponible en la model card. Por el perfil del pipeline, cabría esperar GPUs de 16 GB o más (RTX 4080/4090, A10, L4, A100), pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Probablemente en GPUs de 16 GB o más con la cuantización Q4_K_M y el text encoder en FP8, aunque no está verificado en la información disponible.
- Opciones de despliegue: ComfyUI (formato nativo de los ficheros), llama.cpp/GGUF para el componente de difusión, y endpoints serverless tipo RunPod. vLLM y TGI no aplican a este pipeline.
- Latencia y throughput: no disponibles. Las LoRA Lightning de 4 y 8 pasos están diseñadas para reducir el número de pasos de muestreo, lo que en la práctica disminuye la latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| alkyum/neverseen-qwen-image-edit-2511 (este repo) | 20.430.401.088 (agregado) | no disponible | GGUF + safetensors | Apache-2.0 | Copia empaquetada de Qwen-Image-Edit-2511 con text encoder, VAE y LoRA Lightning |
| unsloth/Qwen-Image-Edit-2511-GGUF | no disponible | no disponible | GGUF | Apache-2.0 | Fuente original del GGUF Q4_K_M |
| Comfy-Org/Qwen-Image | no disponible | no disponible | safetensors | Apache-2.0 | Fuente del text encoder FP8 y del VAE |
| lightx2v/Qwen-Image-Edit-2511-Lightning | no disponible | no disponible | safetensors (BF16) | Apache-2.0 | Fuente de las LoRA de destilación de 4 y 8 pasos |

## Limitaciones y advertencias

- No es una release oficial: el autor lo declara explícitamente. No debe citarse como el modelo Qwen-Image-Edit-2511 canónico ni como trabajo propio de alkyum.
- Los datos de parámetros, contexto, idiomas y benchmarks no están disponibles en la model card; cualquier evaluación de calidad debe hacerse contra los repositorios upstream.
- La licencia indicada es Apache-2.0 para todos los componentes, pero conviene verificar cada repositorio de origen por si hubiera cambios posteriores.
- Al ser una copia con commits fijados, puede quedar desactualizada respecto a mejoras o correcciones publicadas en los repositorios originales.
- Riesgo de sesgos y alucinaciones: no evaluable con la información disponible; al tratarse de un modelo de edición de imagen, los riesgos se refieren a la fidelidad de la edición y a posibles sesgos visuales del modelo base.
- El pipeline requiere coordinar varios componentes (GGUF, text encoder, VAE, LoRA); un desajuste de versiones puede degradar los resultados.
- Uso comercial: permitido por Apache-2.0 según la model card, sujeto a las condiciones de los repositorios upstream.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alkyum/neverseen-qwen-image-edit-2511
- Fuente del GGUF: https://huggingface.co/unsloth/Qwen-Image-Edit-2511-GGUF
- Fuente del text encoder y VAE: https://huggingface.co/Comfy-Org/Qwen-Image
- Fuente de las LoRA Lightning: https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning
