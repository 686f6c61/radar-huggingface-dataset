# embriotapir/LTX-2.5-Dance-Motion-Transfer-Pose-ComfyUI

## Resumen

LTX-2.5 Dance Motion Transfer (Pose) es un workflow para ComfyUI que transfiere el movimiento corporal de un vídeo de baile de referencia a la persona presente en una imagen estática. Lo publica el usuario embriotapir sobre el modelo base Lightricks/LTX-2.5, un modelo de generación de vídeo de 22B parámetros desarrollado por Lightricks. El repositorio no contiene pesos: únicamente incluye el archivo de workflow (`LTX-2.5_Dance_Motion_Transfer_Pose.json`) y la documentación asociada.

El flujo combina el modelo destilado LTX-2.5 en formato DiT con el adaptador Union Control IC-LoRA y el estimador de pose DWPose para extraer la cinemática del vídeo de referencia y aplicarla sobre la imagen del bailarín. La identidad, el vestuario y el fondo provienen de la imagen de entrada, mientras que el movimiento y la duración se toman del vídeo. Todo el proceso se ejecuta en local por defecto, con una llamada opcional a la API de LTX para el realce de prompts.

Su relevancia práctica radica en que demuestra un pipeline de motion transfer vídeo-a-vídeo ejecutable en una GPU de consumo (RTX 3090 de 24 GB), con una resolución de salida de 1024x1664 en formato 9:16 y un tiempo de ejecución de entre 30 y 40 segundos para 33 fotogramas. La licencia es la LTX-2 Community License, no estándar y con condiciones específicas de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de vídeo con VAE de vídeo y VAE de audio; workflow con IC-LoRA Union Control y DWPose |
| Parámetros totales | 22B (modelo base LTX-2.5); checkpoint destilado recortado a 16,6 GB en safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (ventana expresada en fotogramas: múltiplos de 8n+1, p. ej. 33, 65, 97) |
| Tipos de cuantización | int8 con rotación de convolución (text encoder Gemma-4-12B), bf16 (VAE y upscaler); checkpoint DiT en safetensors de 16,6 GB |
| Idiomas soportados | en |
| Licencia | ltx-2-community-license (LTX-2 Community License) |
| Formato de pesos | safetensors (DiT, text encoder, VAE, upscaler y LoRA); workflow en JSON |

## Arquitectura y entrenamiento

El modelo subyacente es LTX-2.5 de Lightricks, un Diffusion Transformer de vídeo de 22B parámetros que genera vídeo y audio de forma conjunta mediante dos VAE separados (vídeo y audio). El workflow emplea la variante destilada, que reduce el muestreo a 8 pasos en la etapa 1 y a 3-8 pasos en la etapa 2 según el preset de sigmas elegido. Sobre el DiT se aplica el adaptador `ltx-2.3-22b-ic-lora-union-control-ref0.5`, un IC-LoRA de control que inyecta tokens de referencia adicionales al pipeline, lo que incrementa el coste de memoria y de tiempo frente a un image-to-video convencional.

La extracción de movimiento se realiza con DWPose a través de `comfyui_controlnet_aux`, que descarga sus propios modelos de pose en el primer uso. El codificador de texto es Gemma-4-12B-it en una variante int8 con rotación de convolución, y existe un segundo codificador opcional (Gemma-4 E2B int8) reservado para el realce de prompts. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Transferencia de movimiento corporal de un vídeo de referencia a una persona de una imagen estática, con bloqueo del primer fotograma a la imagen de entrada.
- Control de pose mediante DWPose y el adaptador IC-LoRA Union Control.
- Generación de vídeo con resolución y relación de aspecto configurables mediante un nodo único de resolución de salida (ratio + megapíxeles).
- Selección del número de fotogramas de referencia mediante `frame_load_cap` y `skip_first_frames`.
- Presets de sigmas para la etapa 2 que permiten ajustar el equilibrio entre movimiento, nitidez y velocidad sin recablear nodos.
- Codificación de audio mediante VAE de audio incluido en el conjunto de modelos requeridos.
- Realce de prompts opcional mediante API de LTX; por defecto desactivado y ejecución completamente local.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un pipeline de generación de vídeo, no un modelo de lenguaje.

## Casos de uso

- Prototipado de coreografías: aplicar el movimiento de un vídeo de baile a imágenes de un actor o personaje para previsualizar secuencias antes de un rodaje real, usando 33 fotogramas en 9:16 como prueba rápida de concepto.
- Creación de contenido para redes sociales en formato vertical: el flujo produce directamente 1024x1664 en 9:16, la relación de aspecto nativa de plataformas como TikTok o Reels, partiendo de una única imagen del creador.
- Sustitución de intérprete en vídeo musical: mantener la identidad, el vestuario y el fondo de una imagen del artista mientras se adopta la cinemática de un bailarín de referencia, útil para demos y maquetas.
- Animación de avatares y personajes: transferir movimiento humano a ilustraciones o renders 3D de personajes, con la condición de que la pose y el encuadre inicial de la imagen sean similares al primer fotograma del vídeo.
- Pruebas de vestuario y caracterización: generar variantes de una misma secuencia de movimiento cambiando solo la imagen de entrada, lo que permite comparar identidades y estilos sobre una coreografía fija.
- Investigación en motion transfer: servir de base reproducible para experimentar con presets de sigmas, número de fotogramas y adaptadores de control, dado que el workflow expone estos parámetros de forma explícita.
- Integración en pipelines de postproducción local: al ejecutarse íntegramente en ComfyUI sin claves de API, encaja en flujos de trabajo con requisitos de confidencialidad sobre el material de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento aportados por el autor son empíricos: 33 fotogramas, 9:16, 0,3 MP en una RTX 3090 de 24 GB, con un tiempo de 30 a 40 segundos por ejecución.

## Requisitos de hardware

- VRAM: 24 GB verificados en la configuración probada (RTX 3090). El autor advierte que valores de megapíxeles más altos y más fotogramas consumen mucha más VRAM.
- GPU recomendadas: RTX 3090 (probada). No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: sí cabe en una RTX 3090 de 24 GB con el checkpoint recortado de 16,6 GB orientado a tarjetas de 24 GB. No hay datos para tarjetas de 16 GB o menos.
- Despliegue: ComfyUI 0.42.0 (frontend 1.57.1) con los paquetes ComfyUI-LTXVideo, comfyui_controlnet_aux y ComfyUI-VideoHelperSuite. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline.
- Almacenamiento: los modelos suman aproximadamente 38 GB en disco (16,6 + 13,2 + 5,2 + 1,5 + 0,4 + 1,0 + 0,65 GB).
- Latencia: 30-40 s por ejecución de 33 fotogramas a 0,3 MP en RTX 3090. El throughput no se especifica.
- Nota: los repositorios de Lightricks están restringidos y requieren aceptar el acceso antes de la descarga.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con otros sistemas de motion transfer. Como referencia cualitativa, el propio ecosistema de Lightricks ofrece el modelo base LTX-2.5 sin el adaptador de control (image-to-video convencional, sin transferencia de pose) y el adaptador LTX-2.3-22b-IC-LoRA-Union-Control de forma independiente, que este workflow integra. Cualquier comparación con alternativas de la categoría queda fuera del alcance de los datos disponibles.

## Limitaciones y advertencias

- El repositorio contiene únicamente el workflow y la documentación; no incluye pesos, vídeos de muestra ni imágenes. Es necesario descargar todos los modelos por separado.
- Solo se ha probado la combinación exacta de modelos indicada por el autor; otras combinaciones no están verificadas.
- El movimiento rápido de manos y brazos puede verse borroso a resoluciones pequeñas.
- Si la pose o el encuadre de la imagen del bailarín no se parecen al primer fotograma del vídeo de referencia, el inicio del clip presentará un salto.
- El tiempo y la VRAM crecen rápidamente con el número de fotogramas, ya que el IC-LoRA añade tokens de referencia más pesados que un image-to-video normal.
- El valor de megapíxeles es un control relativo, no el tamaño final exacto del vídeo.
- Solo se ha probado el preset de sigmas oficial por defecto de la etapa 2.
- Idioma: únicamente inglés para los prompts.
- Licencia LTX-2 Community License: no es una licencia de código abierto estándar; es necesario revisar sus condiciones antes de cualquier uso comercial.
- Riesgo de artefactos y de deriva de identidad en secuencias largas o con oclusiones; no se documentan sesgos específicos del modelo.
- El realce de prompts mediante la API de LTX envía datos a un servicio externo si se introduce una clave; por defecto está desactivado.

## Enlaces

- [Hugging Face: embriotapir/LTX-2.5-Dance-Motion-Transfer-Pose-ComfyUI](https://huggingface.co/embriotapir/LTX-2.5-Dance-Motion-Transfer-Pose-ComfyUI)
- [Modelo base: Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5)
- [ComfyUI-LTXVideo](https://github.com/Lightricks/ComfyUI-LTXVideo)
- [comfyui_controlnet_aux](https://github.com/Fannovel16/comfyui_controlnet_aux)
- [ComfyUI-VideoHelperSuite](https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite)
- [Checkpoint destilado en Civitai](https://civitai.com/models/2855384)
- [Text encoder Gemma-4-12B (DeepNeuralNerd)](https://huggingface.co/DeepNeuralNerd/Gemma-4-12B-it-uncensored-heretic-DeepNeuralNerd-LTX_2.5_ComfyUI)
- [Text encoder Gemma-4 E2B (Comfy-Org)](https://huggingface.co/Comfy-Org/gemma-4/blob/main/text_encoders/gemma4_e2b_it_int8_convrot.safetensors)
- [VAE de vídeo LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5/blob/main/vae/ltx-2.5-video-vae-conv-bf16.safetensors)
- [VAE de audio LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5/blob/main/vae/ltx-2.5-audio-vae-bf16.safetensors)
- [Upscaler latente espacial x2 LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5/blob/main/latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors)
- [IC-LoRA Union Control LTX-2.3-22b](https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-Union-Control/blob/main/ltx-2.3-22b-ic-lora-union-control-ref0.5.safetensors)
