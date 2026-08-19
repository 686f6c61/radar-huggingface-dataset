# FastVideo/FastMetal-1.3B-QAD

## Resumen

FastMetal-1.3B-QAD es un modelo de generación de vídeo de texto a vídeo (text-to-video) desarrollado por FastVideo, diseñado específicamente para ejecutarse en Macs con Apple Silicon (MPS). Se basa en el modelo FastWan 2.1 T2V de 1.3B parámetros, del que se ha destilado mediante DMD2 para reducir el proceso de denoising a solo 3 pasos, y se ha cuantizado a INT8 con entrenamiento consciente de cuantización (QAT) para minimizar la pérdida de calidad. El resultado es un modelo ligero y rápido que genera clips de 77 frames a resolución 448×832 (480p) sin necesidad de cuantización en el arranque, ya que viene pre-cuantizado.

Su relevancia radica en democratizar la generación de vídeo en hardware de consumo: un Mac con 8 GB de RAM unificada puede ejecutarlo sin problemas, algo poco común en modelos de vídeo de esta calidad. El repositorio incluye todos los componentes necesarios (text encoder UMT5 en fp16, VAE, tokenizer y scheduler) para funcionar de forma independiente. Con licencia Apache 2.0, es totalmente abierto y modificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) basado en Wan 2.1 T2V, con cuantizacion INT8 affine group-64 |
| Parametros totales | 1.3B (DiT) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de generacion de video, no de texto) |
| Tipos de cuantizacion | INT8 affine, group size 64, entrenado con QAT |
| Idiomas soportados | No disponible (text encoder UMT5, presumiblemente multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mlx_dit.safetensors, text_encoder, vae, etc.) y JSON de configuracion |

## Arquitectura y entrenamiento

El modelo es un DiT (Diffusion Transformer) de 1.3B parámetros, heredado del modelo base FastWan 2.1 T2V. Se ha destilado con el método DMD2, que reduce el número de pasos de denoising de los típicos 20-50 a solo 3, acelerando drásticamente la inferencia. Posteriormente, se ha sometido a un entrenamiento consciente de cuantización (QAT) para convertir los pesos del DiT a INT8 con esquema affine y grupo de tamaño 64, lo que reduce el tamaño de los pesos a aproximadamente 1.5 GB sin degradación significativa de la calidad.

El entrenamiento se realizó en clústeres NVIDIA GB200, utilizando el dataset sintético `FastVideo/Wan-Syn_77x448x832_600k`, que contiene 600.000 muestras de vídeo de 77 frames a resolución 448×832. El text encoder es un UMT5 en fp16, que se mantiene sin cuantizar para preservar la comprensión semántica del prompt. El flujo de inferencia usa un flow shift de 8.0, un parámetro que ajusta la dinámica del flujo de difusión.

## Capacidades

- Generación de vídeo de texto a vídeo: produce clips de 77 frames a 480p (448×832) a partir de un prompt textual.
- Inferencia en 3 pasos de denoising, lo que permite generación casi en tiempo real en hardware modesto.
- Optimizado para Apple Silicon (MPS): funciona en Macs con 8 GB de RAM o más, sin necesidad de GPU dedicada.
- Pre-cuantizado en INT8: no requiere cuantización en el arranque, reduciendo el tiempo de carga y el uso de memoria.
- Incluye todos los componentes necesarios (text encoder, VAE, tokenizer, scheduler) para ejecución autónoma.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente generativo de vídeo.

## Casos de uso

- Prototipado rápido de vídeo: los equipos de diseño pueden generar clips de prueba para storyboards o moodboards sin necesidad de GPUs caras, usando un Mac portátil.
- Creación de contenido para redes sociales: generar clips cortos de 3-5 segundos para plataformas como TikTok o Instagram Reels, con prompts descriptivos.
- Educación y demostraciones: profesores o divulgadores pueden crear vídeos ilustrativos de conceptos abstractos (p. ej., fenómenos naturales) en minutos.
- Generación de vídeo en entornos con restricciones de hardware: empresas que solo disponen de Macs pueden integrar generación de vídeo en sus flujos de trabajo sin infraestructura adicional.
- Investigación en generación de vídeo: al ser un modelo abierto y ligero, sirve como base para experimentos de fine-tuning o estudio de técnicas de destilación y cuantización.
- Asistencia creativa para guionistas: generar vídeos de referencia para escenas descritas en guiones, ayudando a visualizar la puesta en escena antes de rodar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos comparativos de calidad (FVD, IS, CLIP score) ni de velocidad (latencia, throughput) frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1.5 GB para el DiT en INT8, más el text encoder (fp16) y VAE, lo que totaliza unos 3-4 GB de memoria unificada. El repositorio completo ocupa 13.4 GB en disco.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de RAM unificada. También puede ejecutarse en GPUs NVIDIA usando el código base de FastVideo, aunque no es el objetivo principal.
- Compatibilidad con consumer GPU: sí, especialmente Macs de gama de entrada (8 GB). No requiere GPU dedicada.
- Opciones de despliegue: el script de ejemplo `mlx_wan_prompt_to_video.py` del repositorio FastVideo. No se mencionan integraciones con vLLM, Ollama u otros servidores de inferencia.
- Latencia y throughput: no disponibles. Dado que usa 3 pasos de denoising, se espera una generación de unos pocos segundos por clip en un Mac M1 o superior, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion | Pasos | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| FastMetal-1.3B-QAD | 1.3B | No aplica | 448×832, 77 frames | 3 | INT8 QAT | Apache 2.0 | HuggingFace |
| FastWan 2.1 T2V 1.3B (base) | 1.3B | No aplica | 448×832, 77 frames | 20-50 | FP16 | Apache 2.0 | HuggingFace |
| AnimateDiff (modelos tipicos) | ~1.7B | No aplica | 512×512, 16-24 frames | 20-50 | FP16 | Apache 2.0 | HuggingFace |

La comparativa se limita a modelos de generacion de video de tamano similar. FastMetal se distingue por su destilacion a 3 pasos y cuantizacion INT8, lo que lo hace mucho mas ligero y rapido que su base, a costa de una calidad potencialmente inferior. No hay datos de benchmarks para confirmar la diferencia.

## Limitaciones y advertencias

- Resolución fija de 448×832 (480p) y duración de 77 frames (aproximadamente 3 segundos a 24 fps); no admite resoluciones mayores ni vídeos más largos.
- La cuantización INT8 puede introducir artefactos visuales, especialmente en texturas finas o movimientos rápidos, aunque el QAT mitiga este efecto.
- El modelo está optimizado para Apple Silicon; su rendimiento en otras plataformas (NVIDIA, AMD) no está garantizado y puede requerir adaptaciones.
- No se han publicado evaluaciones de sesgos o alucinaciones visuales; como todo modelo generativo, puede producir contenido inapropiado o inexacto.
- El text encoder (UMT5) no está cuantizado, lo que aumenta el uso de memoria; en Macs de 8 GB puede haber presión de memoria si se ejecutan otras aplicaciones.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (`Wan-Syn_77x448x832_600k`) es sintético; no se especifican restricciones adicionales sobre el contenido generado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/FastVideo/FastMetal-1.3B-QAD)
- [Repositorio GitHub de FastVideo](https://github.com/hao-ai-lab/FastVideo)
- [Modelo similar FastWan-QAD-1.3B](https://huggingface.co/FastVideo/FastWan-QAD-1.3B)
- [Organización FastVideo en HuggingFace](https://huggingface.co/FastVideo)
