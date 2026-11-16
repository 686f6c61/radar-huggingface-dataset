# AcademiaSD/Fibo-2.0-NF4-for-LoRA-Training

## Resumen

Fibo-2.0-NF4-for-LoRA-Training es una conversion cuantizada en NF4 del modelo de difusion text-to-image Fibo 2.0 Dev de BRIA AI, publicada por el usuario AcademiaSD. No se trata de un modelo nuevo ni de una version oficial de BRIA: es un repositorio de pesos pre-cuantizados cuyo unico proposito es permitir el entrenamiento de LoRAs sobre Fibo 2.0 en GPUs de consumo. El transformer (8.1 mil millones de parametros) se almacena en formato NF4 mediante bitsandbytes, mientras que el text encoder Qwen3-VL-4B se ofrece en tres variantes de precision (NF4, INT8 y BF16) para que el entrenador elija la que mejor se ajuste a la VRAM disponible.

La relevancia de esta publicacion es practica: el Fibo 2.0 original, con 24.3 GB de pesos en BF16, no cabe en GPUs consumer para tareas de entrenamiento. Esta conversion reduce la descarga a 8.4 GB en su configuracion por defecto (solo text encoder NF4) y permite entrenar LoRAs con aproximadamente 8.7 GB de VRAM en una RTX 5080 a 512x512, con un coste de unos 2 segundos por paso. Es, por tanto, una pieza de infraestructura para el ecosistema de fine-tuning, no un modelo para generar imagenes.

Es importante subrayar que el transformer esta guardado en un formato de cache propietario del entrenador (AcademiaSD LoRAlab Trainer Studio) que diffusers y ComfyUI no pueden cargar. El repositorio no sirve para inferencia: para generar imagenes hay que usar el modelo original de BRIA. La licencia es CC BY-NC 4.0, de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (BriaFibo2Transformer2DModel) con 44 bloques principales y 2 bloques refiner, atencion, MLP y cross-attention; VAE AutoencoderKLFlux2 con 32 canales latentes |
| Parametros totales | 8.1 mil millones (transformer); text encoder Qwen3-VL-4B adicional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes) para el transformer y el text encoder; INT8 (LLM.int8) y BF16 para el text encoder; capas excluidas en BF16 (73 capas: perceptor, adaLN, embedders y capa de salida) |
| Idiomas soportados | en |
| Licencia | CC BY-NC 4.0 (license_name: bria-fibo); uso academico y personal, no comercial |
| Formato de pesos | safetensors; cache pre-cuantizada por capas (un archivo por capa en `weights/`, `others.safetensors`, `index.json`, `metadata.json`); no compatible con diffusers ni ComfyUI para inferencia |

## Arquitectura y entrenamiento

El modelo subyacente es Fibo 2.0 Dev de BRIA AI, un transformer de difusion para text-to-image y edicion de imagenes. La arquitectura consta de 44 bloques principales mas 2 bloques refiner, con atencion, MLP y cross-attention, y un total de 342 capas cuantizadas en NF4. Las 73 capas restantes (perceptor que convierte el caption en gist tokens, modulacion adaLN, embedders y capa de salida) se mantienen en BF16 para preservar la fidelidad del condicionamiento. El text encoder es Qwen3-VL-4B, propio del modelo original, y el VAE es el de FLUX.2 (AutoencoderKLFlux2, 32 canales latentes). Se incluyen tambien processor, scheduler y las fuentes tipograficas con las que se entreno Fibo 2.0 para dibujar texto en las imagenes.

Esta publicacion no aporta entrenamiento nuevo: es una conversion de precision de los pesos de BRIA. El proceso de conversion lo realiza el script `tools/fibo2/5_conversor_Fibo2_NF4.py` del repositorio AcademiaSD LoRAlab Trainer Studio. La innovacion tecnica reside en el formato de cache: el entrenador construye un `BriaFibo2Transformer2DModel` vacio a partir de `config.json` y lo rellena capa a capa desde la cache, de modo que el transformer en BF16 nunca se descarga ni se carga en memoria. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO en Fibo 2.0.

## Capacidades

- Generacion de imagenes text-to-image (funcionalidad del modelo base, no de esta conversion).
- Edicion de imagenes (tag `image-editing` del modelo original).
- Renderizado de texto en las imagenes gracias a las fuentes incluidas y al entrenamiento especifico de Fibo 2.0.
- Condicionamiento mediante captions procesados por el text encoder Qwen3-VL-4B, que genera gist tokens.
- Entrenamiento de LoRAs sobre el transformer en GPUs consumer (funcionalidad especifica de esta conversion).
- Exportacion de LoRAs en formato compatible con el loader de ComfyUI (`diffusion_model.<layer>.lora_A / lora_B` mas `alpha`).
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio o thinking mode: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Entrenamiento de LoRAs de estilo en una unica GPU consumer: el caso de uso principal del repositorio. Con 8.7 GB de VRAM en una RTX 5080 a 512x512 y rank 8 se pueden entrenar adaptadores de estilo o de personaje sin necesidad de hardware profesional.
- Fine-tuning de identidad o rostro con pocas imagenes: el entrenador descarga solo las partes que usa (8.4 GB con text encoder NF4), lo que agiliza iteraciones en estaciones de trabajo modestas.
- Investigacion academica sobre adaptacion de modelos de difusion: al ser de uso academico y personal, encaja en estudios sobre tecnicas de LoRA, cuantizacion y su impacto en la calidad generativa.
- Prototipado de pipelines de generacion personalizada: se entrena el LoRA con este repositorio y se infiere con el modelo original de BRIA o con el repack de ComfyUI, separando entrenamiento e inferencia.
- Creacion de adaptadores para ComfyUI: el entrenador exporta en el formato que espera el loader de ComfyUI, de modo que el LoRA resultante se integra directamente en flujos de trabajo visuales.
- Docencia y formacion en fine-tuning de difusion: el bajo requisito de VRAM permite reproducir el flujo completo en aulas con GPUs de gama media.
- Experimentacion con text encoders en distintas precisiones: las tres variantes (NF4, INT8, BF16) permiten medir el impacto de la precision del encoder en la calidad del LoRA entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento proporcionados son de entrenamiento: aproximadamente 8.7 GB de VRAM y unos 2 segundos por paso en una RTX 5080 a 512x512 con rank 8.

## Requisitos de hardware

- VRAM para entrenamiento: desde 8 GB en GPUs consumer NVIDIA; medicion concreta de ~8.7 GB en RTX 5080 a 512x512 con rank 8.
- VRAM para inferencia: no aplica; el repositorio no esta pensado para generar imagenes.
- GPUs recomendadas: RTX 5080 (medicion oficial); cualquier NVIDIA consumer con 8 GB o mas deberia poder entrenar segun el autor, aunque no se detallan otras mediciones.
- Cabe en GPU consumer: si, desde 8 GB de VRAM.
- Opciones de despliegue: AcademiaSD LoRAlab Trainer Studio (entrenamiento); ComfyUI unicamente para cargar los LoRAs exportados sobre su propio repack de Fibo 2.0; diffusers y ComfyUI no cargan la cache pre-cuantizada del transformer.
- Tamano de descarga: 8.4 GB con solo el text encoder NF4; 22.1 GB con las tres variantes de text encoder; el modelo original en BF16 ocupa 24.3 GB.
- Latencia y throughput de inferencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso |
|---|---|---|---|---|---|
| Fibo-2.0-NF4-for-LoRA-Training (esta ficha) | 8.1 B (transformer) + Qwen3-VL-4B | no disponible | safetensors, cache NF4 pre-cuantizada | CC BY-NC 4.0 | Solo entrenamiento de LoRA |
| briaai/Fibo-2.0-dev | 8.1 B (transformer) + Qwen3-VL-4B | no disponible | safetensors BF16 | CC BY-NC 4.0 | Inferencia y edicion |
| Repack de Fibo 2.0 para ComfyUI | 8.1 B (transformer) | no disponible | formato ComfyUI | CC BY-NC 4.0 | Inferencia en ComfyUI |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a alternativas.

## Limitaciones y advertencias

- No es un modelo para inferencia: la cache pre-cuantizada no la cargan diffusers ni ComfyUI; para generar imagenes hay que usar el modelo original de BRIA.
- La cuantizacion NF4 introduce una ligera perdida de precision en los pesos del transformer.
- Licencia CC BY-NC 4.0: prohibido el uso comercial del modelo, de los LoRAs entrenados con el y de cualquier derivado; el uso comercial requiere un acuerdo aparte con BRIA.
- Los LoRAs entrenados heredan los terminos de BRIA por ser derivados de sus pesos.
- Solo idioma ingles (`en`).
- No es una publicacion oficial de BRIA AI; los pesos pertenecen a BRIA y se redistribuyen unicamente para permitir el entrenamiento en una GPU consumer.
- El repositorio tiene un volumen de descargas bajo (124) y solo 2 likes, lo que limita la evidencia comunitaria sobre su robustez.
- No se dispone de informacion sobre sesgos, tasa de alucinacion visual ni limitaciones del dataset original de Fibo 2.0.
- El acceso al modelo original esta sujeto a un formulario gated y a los terminos de BRIA, que prevalecen sobre los de esta conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AcademiaSD/Fibo-2.0-NF4-for-LoRA-Training
- Modelo original: https://huggingface.co/briaai/Fibo-2.0-dev
- Entrenador AcademiaSD LoRAlab Trainer Studio: https://github.com/AcademiaSD/AcademiaSD_LoRAlab-TrainerStudio
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/deed.en
- Licencias comerciales de BRIA: https://platform.bria.ai/licensing/pricing?model=fibo-2.0
- YouTube de AcademiaSD: https://www.youtube.com/@Academia_SD
- Discord de AcademiaSD: https://discord.gg/Syuaduy678
- Ko-Fi de AcademiaSD: https://ko-fi.com/academiasd
