# abdulla585/AnyFlow-Wan2.1-T2V-1.3B-Diffusers

## Resumen

AnyFlow-Wan2.1-T2V-1.3B-Diffusers es un modelo de difusion de video texto-a-video (T2V) desarrollado por NVIDIA Labs (NVlabs), publicado en el repositorio de abdulla585 en Hugging Face como espejo del oficial. Se trata de una destilacion mediante flow maps del backbone Wan2.1-T2V-1.3B de Wan-AI, orientada a la generacion de video con un numero arbitrario de pasos de inferencia (any-step), a diferencia de los modelos destilados tradicionales que quedan atados a un presupuesto fijo de pasos. La innovacion principal es que un unico modelo puede operar con pocos pasos (calidad aceptable con 4 pasos) y mejorar de forma estable a medida que se anaden pasos de muestreo.

El modelo mantiene la arquitectura de difusion bidireccional del Wan2.1-T2V-1.3B original, con 1.421.752.384 parametros reales segun los pesos safetensors, y genera video a resolucion 480P (480x832) con 81 frames a 16 fps. La destilacion on-policy con flow maps permite reducir drasticamente el coste computacional de la inferencia sin sacrificar la posibilidad de aumentar la calidad con mas pasos, lo que lo hace relevante para pipelines de generacion de video donde la latencia y el coste por muestra son criticos.

El modelo se distribuye bajo la licencia NVIDIA One-Way Noncommercial License (NSCLv1), que prohibe el uso comercial, y esta pensado para investigacion y prototipado. Su interes actual radica en que demuestra que la destilacion any-step es viable en modelos de difusion de video de escala 1.3B y 14B, y en que se integra en el ecosistema Diffusers mediante el pipeline `AnyFlowPipeline`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion de video bidireccional (backbone Wan2.1-T2V-1.3B) con destilacion flow map |
| Parametros totales | 1.421.752.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no de texto; ventana de frames: 81 frames a 16 fps) |
| Tipos de cuantizacion | no disponible (pesos en safetensors bfloat16 en el ejemplo de uso) |
| Idiomas soportados | en (ingles) |
| Licencia | other (NVIDIA One-Way Noncommercial License, NSCLv1) |
| Formato de pesos | safetensors (formato Diffusers) |

## Arquitectura y entrenamiento

El modelo es una difusion de video bidireccional derivada de Wan2.1-T2V-1.3B, con 1.421.752.384 parametros. La innovacion tecnica es la destilacion on-policy con flow maps (On-Policy Flow Map Distillation), que entrena al modelo para aproximar el flujo de probabilidad en un numero arbitrario de pasos de integracion. A diferencia de la destilacion clasica que fija un presupuesto de pasos (por ejemplo, 4 o 8), AnyFlow aprende un mapa de flujo que permite muestrear con cualquier numero de pasos y mejorar de forma monotona con mas pasos. Segun la model card, el framework soporta arquitecturas causales y bidireccionales, y tareas T2V, I2V y V2V en un unico modelo causal, aunque esta variante concreta es T2V bidireccional.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada. La model card cita dos papers: "AnyFlow: Any-Step Video Diffusion Model with On-Policy Flow Map Distillation" (arXiv:2605.13724) y "Long-Context Autoregressive Video Modeling with Next-Frame Prediction" (arXiv:2503.19325). El codebase se construye sobre Diffusers y referencia implementaciones de FAR, Self-Forcing y TiM.

## Capacidades

- Generacion de video texto-a-video (T2V) a resolucion 480P (480x832) con 81 frames a 16 fps.
- Generacion con numero arbitrario de pasos de inferencia (any-step): calidad aceptable con 4 pasos y mejora estable con mas pasos.
- Soporte de arquitecturas causales y bidireccionales en el framework AnyFlow (esta variante es bidireccional).
- Soporte de tareas T2V, I2V y V2V en el framework general (esta variante concreta es solo T2V).
- Integracion con Diffusers mediante el pipeline `AnyFlowPipeline`.
- Generacion de video con semilla reproducible (`torch.Generator`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni vision/audio en la informacion disponible.

## Casos de uso

- Prototipado rapido de video generativo: con 4 pasos de inferencia y 81 frames a 480P, el modelo permite iterar sobre prompts y semillas en tiempos reducidos, adecuado para equipos de investigacion que necesitan explorar conceptos visuales sin coste elevado.
- Generacion de storyboards y previsualizaciones: el modelo puede producir clips de ~5 segundos (81 frames a 16 fps) a partir de descripciones textuales, utiles en preproduccion audiovisual para validar ideas antes de rodaje.
- Investigacion en destilacion de modelos de difusion: al ser un ejemplo de flow map distillation any-step, sirve como referencia reproducible para estudiar tecnicas de aceleracion de difusion en video.
- Generacion de contenido para entornos de simulacion: clips cortos de escenas (por ejemplo, animales, paisajes) que pueden usarse como datos sinteticos en pipelines de entrenamiento de modelos de vision.
- Demos interactivas de texto-a-video: la integracion con Diffusers y el bajo numero de pasos permiten desplegar demos en GPU consumer con latencia aceptable.
- Benchmarking de tecnicas de muestreo: al soportar cualquier numero de pasos, permite comparar curvas calidad-vs-pasos frente a modelos destilados de pasos fijos.
- Educacion y divulgacion: ejemplo didactico de destilacion on-policy y flow maps aplicado a video, con codebase abierto en GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.421.752.384 parametros en bfloat16, los pesos ocupan aproximadamente 2,8 GB, mas el coste de activaciones y del VAE/encoder de texto, que no se detalla.
- GPU recomendadas: no disponible en la informacion proporcionada; el ejemplo de uso emplea `cuda` con `torch.bfloat16` sin especificar modelo de GPU.
- Cabe en GPU consumer: previsiblemente si por tamano de pesos, pero no se confirma en la informacion disponible.
- Opciones de despliegue: Diffusers con el pipeline `WanAnyFlowPipeline`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion de video).
- Latencia y throughput estimados: no disponible; la model card solo indica que 4 pasos de inferencia producen calidad aceptable y que mas pasos mejoran el resultado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/frames | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnyFlow-Wan2.1-T2V-1.3B-Diffusers | 1.421.752.384 | 81 frames a 16 fps | 480P (480x832) | NSCLv1 (no comercial) | Hugging Face (Diffusers) |
| Wan2.1-T2V-1.3B-Diffusers (base) | no disponible | no disponible | 480P | no disponible | Hugging Face (Diffusers) |
| AnyFlow-Wan2.1-T2V-14B-Diffusers | 14B (segun model card) | no disponible | 480P | NSCLv1 | Hugging Face (Diffusers) |
| AnyFlow-FAR-Wan2.1-1.3B-Diffusers | 1.3B (segun model card) | no disponible | 480P | NSCLv1 | Hugging Face (Diffusers) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia NSCLv1: prohibido el uso comercial; solo permite uso no comercial. NVIDIA no reclama propiedad sobre las salidas generadas.
- Solo soporta ingles como idioma de prompt.
- Esta variante concreta es solo T2V; no soporta I2V ni V2V (aunque el framework general si lo hace en otras variantes).
- Resolucion limitada a 480P y clips de 81 frames (~5 segundos a 16 fps); no se documenta soporte de video largo.
- Riesgo de alucinacion visual y artefactos propios de modelos de difusion de video, especialmente con pocos pasos de inferencia.
- Sesgos conocidos: no documentados en la informacion disponible; previsiblemente hereda los sesgos del dataset de entrenamiento de Wan2.1, no detallado.
- No se documentan limitaciones de contexto textual (longitud de prompt) ni de composicion del dataset.
- El repositorio de abdulla585 tiene 0 descargas y 0 likes, y es un espejo no oficial; el repositorio oficial es `nvidia/AnyFlow-Wan2.1-T2V-1.3B-Diffusers`.
- El pipeline de ejemplo usa `WanAnyFlowPipeline` del paquete `far`, no el `AnyFlowPipeline` que aparece en los tags del repositorio; conviene verificar la compatibilidad con la version de Diffusers instalada.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/abdulla585/AnyFlow-Wan2.1-T2V-1.3B-Diffusers
- Hugging Face (oficial): https://huggingface.co/nvidia/AnyFlow-Wan2.1-T2V-1.3B-Diffusers
- Coleccion NVIDIA AnyFlow: https://huggingface.co/collections/nvidia/anyflow
- GitHub: https://github.com/NVlabs/AnyFlow
- Website: https://nvlabs.github.io/AnyFlow
- Paper AnyFlow: https://arxiv.org/abs/2605.13724
- Paper Long-Context Autoregressive Video Modeling: https://arxiv.org/abs/2503.19325
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Diffusers: https://github.com/huggingface/diffusers
- FAR: https://github.com/showlab/FAR
- Self-Forcing: https://github.com/guandeh17/Self-Forcing
- TiM: https://github.com/WZDTHU/TiM
