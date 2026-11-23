# moonbox-dev/Wan2.1-VACE-1.3B-GGUF

## Resumen

Wan2.1-VACE-1.3B-GGUF es una conversión al formato GGUF del transformer de difusión Wan2.1-VACE-1.3B, publicada por el usuario moonbox-dev. El modelo original lo desarrolla Wan-AI (equipo vinculado a Alibaba) y forma parte de la familia Wan2.1, una suite abierta de modelos generativos de vídeo presentada en el informe técnico arXiv:2503.20314. VACE añade a la base de texto-a-vídeo de 1.3B un conjunto de bloques que habilitan tareas de edición y referencia de vídeo además de la generación pura.

El repositorio no contiene un modelo nuevo: ofrece únicamente los pesos del transformer de difusión (2.153.972.032 parámetros, según los safetensors del modelo base) cuantizados en varias precisiones, desde F16/BF16 hasta Q4_K_M. Para ejecutar un pipeline completo hay que aportar por separado el codificador de texto (umt5-xxl) y el VAE (Wan2.1_VAE) del repositorio original. Esto lo convierte en un artefacto de despliegue orientado a inferencia local, no en un modelo autónomo.

Su relevancia práctica es que permite ejecutar el modelo de vídeo de 1.3B en hardware de consumo mediante stable-diffusion.cpp o ComfyUI con ComfyUI-GGUF, reduciendo el peso del transformer de 4.31 GB (F16) a 1.47 GB (Q4_K_M). La licencia Apache-2.0 del modelo original se mantiene en esta derivación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para vídeo, base Wan2.1 T2V-1.3B con bloques VACE añadidos |
| Parametros totales | 2.153.972.032 (2,15B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye tensores 5-D para los kernels Conv3d de patch-embedding) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) para generación de vídeo. La base es el modelo Wan2.1 T2V-1.3B, al que VACE incorpora bloques adicionales para tareas de edición y referencia de vídeo. Los pesos originales se distribuyen en fp32; esta conversión aplica un cast a bf16 (redondeo a par más cercano) y a fp16, y a partir del BF16 se generan las cuantizaciones con `llama-quantize` (build b3962 con el parche de ComfyUI-GGUF, que mantiene modulación, normas y sesgos en alta precisión). Los dos kernels Conv3d de patch-embedding, que el conversor omite, se reinsertan con `fix_5d_tensors.py`, por lo que los ficheros contienen tensores de 5 dimensiones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. El informe técnico del modelo base es arXiv:2503.20314; la model card menciona además los identificadores arXiv:2503.07598, arXiv:2309.14509 y arXiv:2310.01889 como referencias del ecosistema. La verificación realizada por el autor es exclusivamente de pesos: comprobación de que cada tensor del checkpoint está presente con su forma y cálculo del error RMS relativo medio frente a los pesos fp32 (0,014 % en F16, 0,11 % en BF16, 0,55 % en Q8_0, 1,8 % en Q6_K, 2,9 % en Q5_K_M y 5,0 % en Q4_K_M). No se ejecutó ninguna evaluación de vídeo.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante el pipeline Wan2.1.
- Edición de vídeo (video editing), gracias a los bloques VACE del modelo.
- Generación de vídeo a partir de una referencia (reference-to-video).
- Generación de imagen a partir de texto (text-to-image), según las capacidades declaradas de la familia Wan2.1.
- Generación de vídeo a partir de imagen (image-to-video) y de audio a partir de vídeo (video-to-audio), según la model card original de Wan2.1.
- Ejecución en local mediante stable-diffusion.cpp (`--diffusion-model`) o ComfyUI con el nodo Unet Loader (GGUF) de ComfyUI-GGUF.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Edición de vídeo local sin conexión: cargando el GGUF Q4_K_M (1,47 GB) en stable-diffusion.cpp junto al umt5-xxl y el VAE, se pueden aplicar transformaciones sobre clips existentes en una estación de trabajo sin GPU de datacenter, aprovechando los bloques VACE.
- Prototipado rápido de pipelines de vídeo en ComfyUI: el nodo Unet Loader (GGUF) permite intercambiar precisiones (de F16 a Q4_K_M) para ajustar el consumo de VRAM durante el desarrollo de un flujo de trabajo antes de fijar la configuración final.
- Generación de clips cortos en hardware de consumo: el modelo base T2V-1.3B requiere 8,19 GB de VRAM según la model card original, por lo que con una cuantización Q8_0 o inferior el transformer ocupa menos y deja margen para el codificador de texto y el VAE en GPUs de gama alta de consumo.
- Referencia visual para previsualización de guiones: usar reference-to-video para generar variantes de una escena a partir de una imagen de referencia y comparar resultados antes de una producción mayor.
- Despliegue en entornos con almacenamiento limitado: la diferencia entre 4,31 GB (F16) y 1,47 GB (Q4_K_M) permite distribuir el modelo en imágenes de contenedor o dispositivos con disco reducido, manteniendo el resto del pipeline en el repositorio original.
- Evaluación comparativa de cuantizaciones: el repositorio incluye el error RMS relativo de cada precisión frente a fp32, lo que facilita medir el impacto de la cuantización en la calidad del vídeo generado en un banco de pruebas propio.
- Integración en herramientas de escritorio: stable-diffusion.cpp es una implementación en C/C++ sin dependencias de Python, adecuada para empaquetar generación de vídeo en aplicaciones nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la verificación es solo de pesos y que no se ejecutó ninguna evaluación de vídeo. La model card original de Wan2.1 afirma un rendimiento SOTA frente a modelos abiertos y soluciones comerciales, y cita que el T2V-1.3B genera un vídeo de 5 segundos en 480P en unos 4 minutos en una RTX 4090 sin optimizaciones, pero no se aportan cifras concretas de benchmarks en la información proporcionada.

## Requisitos de hardware

- VRAM del transformer según cuantización (tamaño del fichero): F16/BF16 4,31 GB, Q8_0 2,32 GB, Q6_K 1,81 GB, Q5_K_M 1,63 GB, Q4_K_M 1,47 GB. A esto hay que sumar la memoria del codificador de texto umt5-xxl y del VAE, que no forman parte de este repositorio.
- La model card original indica que el modelo T2V-1.3B completo requiere 8,19 GB de VRAM, lo que lo hace compatible con casi cualquier GPU de consumo.
- GPU recomendadas: RTX 4090 para el pipeline completo sin optimizaciones (unos 4 minutos para 5 segundos en 480P según el autor original); GPUs de consumo de gama alta con 8-12 GB o más para cuantizaciones reducidas; A100/H100 no son necesarias para este tamaño.
- Opciones de despliegue: stable-diffusion.cpp (flag `--diffusion-model`, ver `docs/models/wan.md`, sección "Wan2.1 VACE 1.3B") y ComfyUI mediante ComfyUI-GGUF (Unet Loader (GGUF)).
- Latencia y throughput: no disponible para esta conversión GGUF; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.1-VACE-1.3B-GGUF (este) | 2,15B | no disponible | GGUF (F16 a Q4_K_M) | Apache-2.0 | Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-VACE-1.3B (original) | 2,15B | no disponible | fp32/BF16 (safetensors) | Apache-2.0 | Hugging Face (modelo base) |
| Wan2.1 T2V-1.3B | 1,3B | no disponible | safetensors | Apache-2.0 | Hugging Face (familia Wan2.1) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La diferencia principal entre el modelo original y esta conversión es el formato y el tamaño en disco; la variante T2V-1.3B carece de los bloques VACE para edición y referencia de vídeo.

## Limitaciones y advertencias

- El repositorio contiene solo los pesos del transformer de difusión; sin el codificador de texto umt5-xxl y el VAE Wan2.1_VAE no se puede ejecutar el pipeline.
- No se ha realizado ninguna evaluación de calidad de vídeo sobre estas cuantizaciones; el error RMS de pesos no garantiza la calidad visual, especialmente en Q4_K_M (5,0 % de error).
- Los ficheros incluyen tensores de 5 dimensiones (kernels Conv3d de patch-embedding); no todos los runners GGUF genéricos los soportan, por lo que hay que usar stable-diffusion.cpp o ComfyUI-GGUF con el parche correspondiente.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; es una conversión reciente sin validación comunitaria.
- Riesgo de sesgos y alucinaciones visuales: no hay información específica en la documentación proporcionada sobre sesgos del dataset de entrenamiento ni sobre tasas de fallo en la generación.
- Idiomas soportados: no disponible; el codificador de texto umt5-xxl es multilingüe, pero no se documenta el comportamiento por idioma.
- Licencia Apache-2.0: permite uso comercial, pero se aplica la licencia del modelo original, que gobierna el uso de estos ficheros derivados.
- Longitud de contexto y resolución máxima no documentadas en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/Wan2.1-VACE-1.3B-GGUF
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
- Organización Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- Informe técnico Wan2.1: https://arxiv.org/abs/2503.20314
- Repositorio GitHub de Wan2.1: https://github.com/Wan-Video/Wan2.1
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Blog de Wan: https://wan.video/welcome
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Discord: https://discord.gg/AKNgpMK4Yj
- Referencias arXiv citadas en los tags: https://arxiv.org/abs/2503.07598, https://arxiv.org/abs/2309.14509, https://arxiv.org/abs/2310.01889
