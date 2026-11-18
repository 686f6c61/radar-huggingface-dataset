# Patarapoom/h3-vbvr

## Resumen

`Patarapoom/h3-vbvr` es un repositorio espejo de Hugging Face que reempaqueta seis archivos del ecosistema MiniMax H3, un conjunto de modelos de generación de vídeo a partir de imagen y audio (image-to-video y audio-to-video) diseñado para ejecutarse en ComfyUI. El autor, Patarapoom, no ha entrenado, cuantizado ni modificado ninguno de los pesos: se trata de copias byte a byte de los blobs originales, organizadas en la estructura de directorios que espera ComfyUI (`diffusion_models`, `text_encoders`, `vae`, `loras`). El paquete completo ocupa 40,77 GB de contenido útil dentro de un repositorio de 93,1 GB.

La motivación declarada es operativa: en despliegues de RunPod Serverless con modelos precargados, cada worker descarga el repositorio completo de origen, que contiene muchas variantes que nunca se cargan. Al aislar únicamente los seis archivos que consume un render concreto, el autor reduce la descarga por worker de cientos de gigabytes a unos 41 GB. Es, por tanto, un artefacto de ingeniería de despliegue más que un modelo nuevo.

El componente central es un modelo de difusión híbrido MiniMax H3 en precisión int8 (20,97 GB) acompañado de un text encoder Qwen3-VL de 32B en NVFP4 con cuantización AWQ (15,69 GB), dos VAE (vídeo y audio) y dos LoRAs: un acelerador de 4 pasos de LightX2V y un adaptador VBVR de atención. La licencia es "other" y, según advierte el propio autor, cada archivo hereda los términos de su repositorio de origen, que no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion MiniMax H3 (hibrido fl2va + ref2va) con text encoder Qwen3-VL; VAE separados de video y audio |
| Parametros totales | No disponible (el text encoder es Qwen3-VL de 32B; el modelo de difusion no declara recuento) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (modelo de difusion y VAE de video), NVFP4 + AWQ (text encoder), fp32 (VAE de audio), bf16 (LoRA turbo) |
| Idiomas soportados | No disponible |
| Licencia | other (cada archivo bajo la licencia de su repositorio de origen; los repos fuente no declaran licencia) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 93,1 GB (40,77 GB de contenido en 6 archivos) |
| Pipeline | image-to-video, audio-to-video |
| Libreria | minimax-h3 |
| Descargas / likes | 2.708 / 11 |

## Arquitectura y entrenamiento

El repositorio no entrena nada: agrupa pesos ya existentes. El bloque principal es `minimax_h3_hybrid_fl2va_ref2va_b20-49-int8.safetensors` (20,97 GB), un checkpoint de difusión MiniMax H3 en int8 que combina las variantes fl2va (frame-to-video con audio) y ref2va (reference-to-video con audio) en un único modelo híbrido, según el nombre del archivo y su procedencia del repositorio `smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models`. El sufijo `b20-49` sugiere un rango de bloques o pasos, pero no se documenta su significado.

La pila se completa con un text encoder Qwen3-VL de 32B cuantizado en NVFP4 con AWQ (`qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`, 15,69 GB), un VAE de vídeo int8 con convoluciones rotadas (`minimax_h3_video_vae_int8_convrot.safetensors`, 3,17 GB) y un VAE de audio en fp32 (`minimax_h3_audio_vae_fp32.safetensors`, 0,61 GB). Los dos LoRAs son un acelerador de destilación de 4 pasos de LightX2V (`minimax_h3_ref2v_lightx2v_turbo_4step_v0.1_resized_avg_rank_20_bf16.safetensors`, 0,31 GB, rango 20, bf16) y un adaptador de atención VBVR (`VBVR_H3_attn_only.safetensors`, 0,03 GB). No se dispone de información sobre volumen de tokens, composición del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de una imagen de referencia (image-to-video), con variante específica ref2va orientada a referencia.
- Generación de vídeo condicionada por audio (audio-to-video), gracias al VAE de audio dedicado.
- Generación conjunta de vídeo y audio en un mismo pipeline, al incluir VAE separados para ambas modalidades.
- Comprensión multimodal del prompt mediante el text encoder Qwen3-VL de 32B, que aporta codificación visión-lenguaje.
- Aceleración de inferencia a 4 pasos mediante el LoRA de destilación LightX2V.
- Control fino de atención mediante el LoRA VBVR de atención, aplicable solo a las capas de atención.
- Integración nativa con ComfyUI a través de la disposición de directorios y la librería `minimax-h3`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingüe explícito.

## Casos de uso

- Despliegue serverless con caché de modelos: usar este espejo como origen de descarga en RunPod Serverless reduce el peso por worker de cientos de gigabytes a 41 GB, evitando transferir variantes que nunca se cargan.
- Pipeline de image-to-video en ComfyUI: cargar el checkpoint int8 en `diffusion_models`, el text encoder Qwen3-VL en `text_encoders` y los VAE en `vae` permite montar un flujo de animación de imagen fija sin descargar los repositorios completos de origen.
- Generación de vídeo con audio sincronizado: el par de VAE (vídeo int8 y audio fp32) habilita renders que producen pista de audio junto al vídeo, útil para prototipos de clips cortos.
- Iteración rápida en producción: el LoRA LightX2V de 4 pasos reduce el coste por render en fase de pruebas, a costa de calidad frente a muestreo completo.
- Reproducción de resultados de terceros: al ser copias byte a byte, sirve para replicar exactamente los pesos que referencia un flujo publicado, sin riesgo de que el repositorio fuente cambie de versión.
- Base para ajuste con LoRA: el adaptador VBVR de atención demuestra que la pila admite LoRAs de bajo rango sobre atención; un equipo puede entrenar sus propios adaptadores sobre el checkpoint int8 y combinarlos con el turbo.
- Archivado operativo: mantener una copia fija de 41 GB con los seis archivos exactos que consume un render simplifica la gestión de artefactos y la auditoría de versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el conjunto suma 40,77 GB de pesos; en fp32 el VAE de audio y en bf16 el LoRA turbo, pero el grueso (checkpoint int8 de 20,97 GB y text encoder NVFP4 de 15,69 GB) requiere al menos ~37 GB solo para pesos, más activaciones y buffers de vídeo. No hay cifras oficiales de VRAM pico.
- GPU recomendadas: por tamaño, se necesita una GPU de 80 GB (A100, H100) para cargar todo el pipeline en una sola tarjeta con holgura; no se documenta soporte de offloading parcial.
- GPU de consumo: no es viable en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin offloading a RAM del sistema o sin sustituir el text encoder por una variante más pequeña, opción no documentada en este repositorio.
- Opciones de despliegue: ComfyUI es el destino declarado (etiqueta `comfyui` y estructura de directorios). El autor menciona RunPod Serverless con modelos precargados. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a LLMs y no a difusión de vídeo.
- Latencia y throughput: no disponibles. El LoRA LightX2V de 4 pasos está pensado para reducir pasos de muestreo, pero no se publican tiempos por clip ni resolución de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Patarapoom/h3-vbvr (este repo) | No disponible (text encoder 32B) | No disponible | Image-to-video + audio-to-video, MiniMax H3 int8 | other (heredada de origen, sin licencia declarada) | Hugging Face, 93,1 GB de repo, 40,77 GB útiles |
| smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models | No disponible | No disponible | Checkpoint híbrido MiniMax H3 de origen | No declarada | Hugging Face (fuente del checkpoint) |
| Comfy-Org/MiniMax-H3 | No disponible | No disponible | Distribución oficial para ComfyUI de los componentes H3 | No declarada | Hugging Face (fuente del text encoder y VAE de audio) |
| Kijai/MiniMax-H3-experimental y Kijai/MiniMax-H3_comfy | No disponible | No disponible | Variantes experimentales y LoRAs del ecosistema H3 | No declarada | Hugging Face (fuente del VAE de vídeo y del LoRA turbo) |

No se dispone de datos de rendimiento comparado entre estas variantes; la comparación se limita a procedencia, empaquetado y licencia.

## Limitaciones y advertencias

- Licencia ambigua: el repositorio declara "other" y el autor omite deliberadamente un `LICENSE.md` porque los repositorios de origen no declaran licencia. Esto impide asumir permiso de uso comercial; hay que verificar cada fuente antes de cualquier redistribución o explotación.
- No es un modelo nuevo: no hay entrenamiento, ajuste ni cuantización propia, por lo que cualquier mérito o defecto de calidad corresponde a los pesos upstream.
- Repositorio sobredimensionado: 93,1 GB de repo frente a 40,77 GB de contenido útil, probablemente por historial de versiones o archivos LFS; la descarga completa en workers sigue siendo costosa si no se seleccionan archivos.
- Sin documentación de uso: no se indican prompts recomendados, resolución, duración de clip, número de frames ni parámetros de muestreo, lo que dificulta reproducir resultados.
- Riesgo de alucinación visual y artefactos: al ser un modelo generativo de vídeo, puede producir inconsistencias temporales, deformaciones y desincronización audio-vídeo; no hay evaluación publicada.
- Idiomas no declarados: se desconoce el soporte multilingüe de los prompts; el text encoder Qwen3-VL sugiere cobertura amplia, pero no está confirmado para este pipeline.
- Dependencia de ComfyUI y de la librería `minimax-h3`: no hay garantía de compatibilidad con otros runtimes de inferencia.
- Trazabilidad: al ser un espejo, la actualización de los repositorios de origen no se refleja automáticamente; conviene fijar revisiones por hash.
- Sin benchmarks ni métricas de VRAM, latencia o throughput publicadas, lo que obliga a medir en el propio entorno antes de dimensionar producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Patarapoom/h3-vbvr
- Fuente del checkpoint de difusión: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Fuente del text encoder y VAE de audio: https://huggingface.co/Comfy-Org/MiniMax-H3
- Fuente del VAE de vídeo: https://huggingface.co/Kijai/MiniMax-H3-experimental
- Fuente del LoRA turbo: https://huggingface.co/Kijai/MiniMax-H3_comfy
- Fuente del LoRA VBVR: https://huggingface.co/Patarapoom/H3_lora
