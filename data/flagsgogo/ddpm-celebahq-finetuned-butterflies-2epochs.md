# Flagsgogo/ddpm-celebahq-finetuned-butterflies-2epochs

## Resumen

El modelo `ddpm-celebahq-finetuned-butterflies-2epochs`, publicado por el usuario Flagsgogo, es un modelo de difusion incondicional de imagenes obtenido mediante fine-tuning del checkpoint `google/ddpm-celebahq-256` sobre un dataset de mariposas durante 2 epocas. Forma parte del material didactico del curso Diffusion Models Class de Hugging Face (unidad 2), por lo que su proposito principal es demostrar el flujo de trabajo de fine-tuning de modelos DDPM con la libreria `diffusers`.

Tecnicamente es un DDPM (Denoising Diffusion Probabilistic Model) de tipo UNet con 113.673.219 parametros, entrenado para generar imagenes incondicionales de 256x256 pixeles. No es un modelo de lenguaje ni un modelo multimodal: no procesa texto, no tiene contexto conversacional ni soporta tool calling. Su unica salida es una imagen sintetica.

Su relevancia es exclusivamente pedagogica y experimental. No esta pensado para produccion, no dispone de benchmarks publicados y el propio autor no ha documentado el dataset de mariposas empleado ni los hiperparametros del entrenamiento mas alla de las 2 epocas indicadas en el nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM (UNet para difusion, pipeline `DDPMPipeline`) |
| Parametros totales | 113.673.219 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `diffusers`, framework PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un DDPM clasico basado en una UNet que aprende a predecir el ruido anadido en cada paso del proceso de difusion. El pipeline asociado es `DDPMPipeline`, que realiza el muestreo iterativo desde ruido gaussiano hasta una imagen de 256x256. El modelo base es `google/ddpm-celebahq-256`, entrenado originalmente sobre el dataset CelebA-HQ.

El fine-tuning se realizo sobre un dataset de mariposas (no especificado en la model card) durante 2 epocas. No se documentan el numero de imagenes de entrenamiento, la resolucion del dataset, el learning rate, el tamano de batch ni si se aplicaron tecnicas como EMA de pesos o schedulers de ruido especificos. Tampoco se indica si hubo condicionamiento por clase o texto: por las etiquetas (`unconditional-image-generation`) se trata de generacion puramente incondicional. No se menciona RLHF, DPO ni ninguna innovacion tecnica adicional.

## Capacidades

- Generacion incondicional de imagenes de 256x256 pixeles mediante muestreo DDPM.
- No soporta condicionamiento por texto (no es text-to-image).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal.
- Uso previsto: experimentacion con `diffusers` y demostracion del fine-tuning de DDPM.

## Casos de uso

- Docencia y aprendizaje: reproducir el flujo de fine-tuning de un DDPM descrito en la unidad 2 del curso Diffusion Models Class, cargando el pipeline con `DDPMPipeline.from_pretrained(...)` y generando muestras para comparar antes y despues del ajuste.
- Experimentos de investigacion sobre difusion: usar el checkpoint como punto de partida para estudiar el efecto de pocas epocas de fine-tuning sobre un dataset de dominio especifico (mariposas) frente a un dominio de caras (CelebA-HQ).
- Pruebas de integracion con `diffusers`: validar pipelines de inferencia, serializacion safetensors y carga de modelos personalizados en entornos de desarrollo.
- Generacion de datasets sinteticos de baja fidelidad: producir imagenes de mariposas para tareas de aumento de datos o pruebas de robustez, asumiendo la baja calidad esperable tras solo 2 epocas.
- Benchmarking interno de infraestructura: medir latencia y throughput de un UNet de ~114M parametros en distintas GPUs para calibrar costes de inferencia en pipelines de difusion.
- Ejemplo de publicacion de modelos en Hugging Face: servir como plantilla de model card y estructura de repositorio para quien publique sus propios fine-tunes didacticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del UNet (~114M parametros, ~0.45 GB en fp32) y la resolucion de 256x256, es esperable que quepa en GPUs consumer con 4-8 GB de VRAM, aunque no hay mediciones publicadas.
- GPU recomendadas: no disponibles; cualquier GPU con soporte CUDA y suficiente memoria para el UNet y los tensores intermedios de 256x256 deberia ser suficiente.
- Cabe en GPU consumer: previsiblemente si (gama media con 4 GB o mas), sin datos verificados.
- Opciones de despliegue: `diffusers` con PyTorch (pipeline `DDPMPipeline`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagen).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flagsgogo/ddpm-celebahq-finetuned-butterflies-2epochs | 113.673.219 | 256x256 | Incondicional | MIT | Hugging Face |
| google/ddpm-celebahq-256 | no disponible en la informacion | 256x256 | Incondicional | no disponible en la informacion | Hugging Face |
| google/ddpm-cifar10-32 | no disponible en la informacion | 32x32 | Incondicional | no disponible en la informacion | Hugging Face |

La comparacion se limita al modelo base del que deriva y a otro DDPM didactico de referencia; no se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Calidad de generacion limitada: solo 2 epocas de fine-tuning sobre un dataset no documentado, por lo que las muestras probablemente sean de baja fidelidad y con artefactos.
- Sesgos: al derivar de `ddpm-celebahq-256`, puede arrastrar sesgos del dataset CelebA-HQ (rostros humanos, demografia sesgada) mezclados con el dataset de mariposas.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si en la generacion de imagenes sin correspondencia con la realidad.
- Limitaciones de contexto o idioma: no procesa texto ni mantiene contexto; no es un modelo conversacional.
- Restricciones de licencia: MIT permite uso comercial, pero el autor no documenta la procedencia ni la licencia del dataset de mariposas empleado, lo que introduce incertidumbre legal para uso en produccion.
- Caveat para produccion: modelo didactico sin benchmarks, sin model card sustantiva ("Describe your model here") y con 0 descargas y 0 likes; no recomendado para sistemas en produccion.
- No se documentan hiperparametros de entrenamiento, composicion del dataset ni evaluacion cuantitativa (FID, IS u otras metricas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Flagsgogo/ddpm-celebahq-finetuned-butterflies-2epochs
- Curso Diffusion Models Class (repositorio): https://github.com/huggingface/diffusion-models-class
- Modelo base: https://huggingface.co/google/ddpm-celebahq-256
- Libreria diffusers: https://github.com/huggingface/diffusers
- Documentacion de DDPMPipeline: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
