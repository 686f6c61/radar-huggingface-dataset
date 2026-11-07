# orcasoceaneffects/stable-video-diffusion-img2vid-xt

## Resumen
Stable Video Diffusion Image-to-Video XT (SVD-XT) es un modelo de difusion latente para generacion de video a partir de una imagen de condicionamiento. Lo desarrolla Stability AI y se presenta como un repositorio espejo bajo el identificador `orcasoceaneffects/stable-video-diffusion-img2vid-xt`, con 1.524.623.082 parametros en pesos safetensors y un tamano de repositorio de 32,6 GB. El modelo original es `stabilityai/stable-video-diffusion-img2vid-xt`; este repositorio replica la model card y los pesos para su uso con la libreria `diffusers`.

El modelo parte de SVD Image-to-Video de 14 frames y se reentrena para generar 25 frames a resolucion 576x1024 manteniendo el frame de contexto del mismo tamano. Ademas del decoder f8 ajustado para consistencia temporal, se incluye un decoder estandar frame a frame (`svd_xt_image_decoder.safetensors`). No es un modelo de lenguaje ni un transformer autoregresivo: es un pipeline de difusion para imagen-a-video, por lo que no procesa texto ni instrucciones verbales.

Su relevancia radica en que fue uno de los primeros modelos abiertos de imagen-a-video con calidad competitiva frente a sistemas cerrados como GEN-2 o PikaLabs en estudios de preferencia humana. La licencia es la Stable Video Diffusion Community License, que permite uso no comercial y de investigacion, y exige acuerdos adicionales para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (image-to-video), pipeline `StableVideoDiffusionPipeline` |
| Parametros totales | 1.524.623.082 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por frame de imagen, no texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors |
| Idiomas soportados | no disponible (modelo sin entrada de texto) |
| Licencia | stable-video-diffusion-community (uso comercial con acuerdo aparte) |
| Formato de pesos | safetensors, compatible con `diffusers` |

## Arquitectura y entrenamiento
SVD-XT es un modelo de difusion latente entrenado para generar clips cortos de video condicionados por una imagen. Trabaja a resolucion 576x1024 y produce 25 frames; el frame de entrada actua como contexto. Se ajusta a partir del checkpoint SVD Image-to-Video de 14 frames. Incluye un decoder f8 reentrenado para consistencia temporal y, de forma opcional, un decoder frame a frame estandar para mayor compatibilidad.

El entrenamiento requirio aproximadamente 200.000 horas de A100 80GB, la mayor parte sobre 48 nodos de 8 A100, con un consumo estimado de 64.000 kWh y ~19.000 kg de CO2 equivalente. La model card indica que todas las fuentes de datos consideradas se incluyeron en el entrenamiento final, con filtrado de calidad y NSFW interno; no hubo etiquetado humano en la preparacion de datos, pero si evaluacion humana extensiva mediante plataformas de terceros (Amazon SageMaker, Mechanical Turk, Prolific). No se documenta RLHF ni DPO, al no ser un modelo de lenguaje.

## Capacidades
- Generacion de video corto a partir de una imagen estatica de condicionamiento.
- Salida de 25 frames a 576x1024 (clips de hasta ~4 segundos).
- Generacion de animaciones y movimientos de camara suaves, con calidad valorada por evaluadores humanos frente a GEN-2 y PikaLabs.
- Decoder alternativo frame a frame para integracion en pipelines existentes.
- Integracion nativa con `diffusers` mediante `StableVideoDiffusionPipeline`.
- No soporta tool calling, function calling ni agentes.
- No soporta entrada de texto: no hay control por prompt textual.
- No dispone de modo thinking, vision por prompt ni audio.

## Casos de uso
- Prototipado de animaciones para diseno grafico: a partir de una ilustracion o render, el modelo genera un clip de 25 frames que sirve como base para montaje o retoque posterior.
- Investigacion sobre modelos generativos de video: el checkpoint permite estudiar sesgos, limites y comportamiento de la difusion latente en video con licencia de investigacion.
- Previsualizacion de storyboards: convertir un frame clave en una animacion breve para validar ritmo y encuadre antes de producir el plano definitivo.
- Herramientas educativas y creativas: demostraciones de sintesis de video a partir de imagen en entornos docentes o de divulgacion.
- Generacion de material artistico de bajo coste: clips cortos para instalaciones, prototipos de videojuegos o contenido experimental, dado que el modelo no requiere texto de entrada.
- Red teaming y evaluacion de seguridad: probar la generacion de contenido potencialmente problematico y medir la eficacia de filtros NSFW en pipelines de difusion.
- Integracion en pipelines `diffusers`: su formato safetensors y el decoder alternativo permiten incorporarlo a flujos existentes de generacion y postprocesado.

## Benchmarks y rendimiento
No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje. La model card unicamente reporta un estudio de preferencia humana en el que SVD-Image-to-Video supera a GEN-2 y PikaLabs en calidad de video, sin cifras concretas. Los tiempos de generacion indicados son: ~100 s para SVD y ~180 s para SVD-XT en una A100 80GB con los ajustes por defecto.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el repositorio pesa 32,6 GB en safetensors, por lo que la inferencia completa requiere GPUs de alta memoria.
- GPU recomendadas: A100 80GB (referencia de la model card); se espera que H100 y GPUs profesionales de 48-80 GB puedan ejecutarlo.
- En GPU de consumo: no confirmado en la informacion disponible; el tamano de pesos y la resolucion 576x1024 hacen probable que no quepa en GPUs de 24 GB sin cuantizacion u offloading.
- Opciones de despliegue: `diffusers` (pipeline oficial), repositorio `Stability-AI/generative-models`; no se documentan vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: ~180 s por generacion en A100 80GB con ajustes por defecto; la model card menciona optimizaciones para equilibrar calidad, memoria y velocidad, pero sin cifras detalladas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| SVD-XT (este repo) | 1.524.623.082 | imagen de condicionamiento, 25 frames 576x1024 | stable-video-diffusion-community | Hugging Face, `diffusers` |
| SVD Image-to-Video (14 frames) | no disponible | imagen de condicionamiento, 14 frames | stable-video-diffusion-community | Hugging Face (`stabilityai/stable-video-diffusion-img2vid`) |
| GEN-2 (Runway) | no disponible | texto/imagen a video | propietaria | servicio cerrado |
| PikaLabs | no disponible | texto/imagen a video | propietaria | servicio cerrado |

## Limitaciones y advertencias
- Los videos generados son cortos (<= 4 s) y no alcanzan fotorrealismo perfecto.
- Puede producir videos sin movimiento o con paneos de camara muy lentos.
- No se puede controlar mediante texto.
- No renderiza texto legible.
- Rostros y personas pueden generarse de forma incorrecta.
- La parte de autoencoding es lossy.
- El modelo no fue entrenado para representar hechos o personas reales; su uso para contenido factual queda fuera de alcance.
- Licencia community: uso no comercial e investigacion permitidos; el uso comercial requiere acuerdo con Stability AI (https://stability.ai/license).
- Sujeto a la Acceptable Use Policy de Stability AI.
- Riesgo de sesgos en los datos de entrenamiento no cuantificado en la informacion disponible.
- El repositorio es un espejo de autor `orcasoceaneffects` con 0 descargas y 0 likes; conviene verificar integridad de pesos frente al original de Stability AI.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/orcasoceaneffects/stable-video-diffusion-img2vid-xt
- Modelo original SVD 14 frames: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid
- Modelo original SVD-XT: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt
- Repositorio de codigo: https://github.com/Stability-AI/generative-models
- Paper: https://stability.ai/research/stable-video-diffusion-scaling-latent-video-diffusion-models-to-large-datasets
- Licencia: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt/blob/main/LICENSE.md
- Licencia comercial: https://stability.ai/license
- Politica de uso aceptable: https://stability.ai/use-policy
- GEN-2: https://research.runwayml.com/gen2
- PikaLabs: https://www.pika.art/
