# cokeadrink/minimax-h3-int8-base-ref2va

## Resumen

Este repositorio es un paquete (bundle) de modelos para generación de vídeo con ComfyUI, creado por el usuario cokeadrink. No es un modelo entrenado por el autor: se trata de una recopilación de pesos ya existentes, copiados sin cambios desde fuentes fijadas (pinned), que combina el modelo base MiniMax-H3 de MiniMaxAI en dos variantes con cuantización INT8 ConvRot: la variante estándar de generación texto-a-vídeo (fl2va) y la variante de referencia a vídeo/audio (ref2va). El objetivo práctico es ofrecer un único punto de descarga con todos los componentes necesarios (modelo de difusión, codificador de texto, VAEs de vídeo y audio, y un LoRA turbo de 8 pasos) para ejecutar generación de vídeo y generación condicionada por referencia de imagen, vídeo o audio.

El modelo original, MiniMax-H3, es un sistema de generación de vídeo de MiniMaxAI cuyo pipeline incluye un modelo de difusión, un codificador de texto multimodal (Qwen3-VL-32B, cuantizado en NVFP4 AWQ en esta conversión) y VAEs separados para vídeo y audio. La variante ref2va permite generar vídeo a partir de referencias visuales o sonoras, además de la generación clásica a partir de texto. La relevancia de este bundle radica en la compatibilidad directa con ComfyUI y RunPod, y en la inclusión de un LoRA turbo que reduce la inferencia a 8 pasos a 768p, acelerando notablemente la generación.

Cabe destacar que el propio autor advierte que la configuración combinada de 48 GB de VRAM no ha sido verificada en GPU, y que el cambio entre los dos checkpoints de difusión requiere offloading, ya que ambos no pueden residir simultáneamente en memoria. No se han publicado detalles de arquitectura interna, número de parámetros o longitud de contexto del modelo original en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline de difusión texto-a-vídeo con codificador de texto multimodal y VAEs de vídeo/audio) |
| Parametros totales | no disponible (los checkpoints de difusión pruned INT8 pesan ~20,97 GB cada uno) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (modelos de difusión), NVFP4 AWQ (codificador de texto Qwen3-VL-32B), FP16 (VAE de vídeo), FP32 (VAE de audio), BF16 (LoRA turbo) |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-community-license-agreement (licencia comunitaria de MiniMax H3; el codificador Qwen3-VL usa Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El bundle no contiene ningún modelo nuevo: el autor declara explícitamente que no se ha realizado entrenamiento, conversión ni modificación de tensores, y que todos los ficheros se copian sin cambios de fuentes con revisión y SHA-256 registrados en un manifiesto (bundle-manifest.json). El pipeline se compone de cuatro bloques: dos checkpoints de difusión (fl2va para generación ordinaria y ref2va para generación con referencia), ambos con pesos INT8 pruned ConvRot de ~20,97 GB; un codificador de texto Qwen3-VL-32B-Instruct convertido a NVFP4 AWQ (~15,69 GB), que aporta comprensión multimodal del prompt; un VAE de vídeo en FP16 (~5,21 GB); y un VAE de audio en FP32 (~0,6 GB), este último indicativo de que el pipeline original genera también pista de audio sincronizada.

Sobre el entrenamiento del modelo original MiniMax-H3 no hay datos en la información disponible. El único componente entrenado adicional es el LoRA turbo lightx2v/Minimax-h3-Turbo (versión 8 pasos, 768p, BF16, ~1,96 GB), una destilación de pasos que permite muestrear con solo 8 iteraciones del sampler en lugar del número completo de pasos, reduciendo el tiempo de generación de forma sustancial.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante el checkpoint fl2va INT8.
- Generación de vídeo condicionada por referencia de imagen, vídeo o audio (reference-to-video / ref2va).
- Generación de audio acompañando al vídeo, gracias al VAE de audio dedicado en FP32.
- Comprensión de prompts multimodales mediante el codificador Qwen3-VL-32B (visión + lenguaje).
- Aceleración de inferencia a 8 pasos a resolución 768p mediante el LoRA turbo incluido.
- Integración directa con ComfyUI y despliegue en entornos cloud como RunPod.
- No aplica: tool calling, agentes ni razonamiento multi-paso (no es un LLM de propósito general).

## Casos de uso

- Generación de vídeo a partir de descripciones textuales: con el checkpoint fl2va y el LoRA turbo de 8 pasos se pueden producir clips a 768p en tiempos reducidos, adecuado para prototipado rápido de ideas visuales.
- Vídeo con personaje o escena de referencia: el checkpoint ref2va permite condicionar la generación a una imagen, un vídeo o un audio de referencia, útil para mantener identidad visual entre clips.
- Animación a partir de una imagen fija: usando una imagen como referencia en el flujo ref2va se puede animar un fotograma estático en un clip de vídeo.
- Sincronización audio-vídeo: el VAE de audio dedicado permite generar clips con banda sonora generada, útil para contenido corto autocontenido.
- Producción de contenido para redes sociales: la resolución 768p del LoRA turbo y los 8 pasos encajan con flujos de generación masiva de clips cortos.
- Workflows reproducibles en ComfyUI: el bundle con revisiones fijadas y SHA-256 permite montar pipelines reproducibles en RunPod sin depender de descargas dispersas.
- Evaluación comparativa de cuantizaciones: al incluir pesos INT8 ConvRot y referenciar la variante FP8 del mismo autor, sirve para comparar calidad y velocidad entre cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud. El autor indica que la configuración combinada "cabe en 48 GB" pero que no ha sido verificada en GPU; los 65,4 GB del repositorio son almacenamiento en disco, no VRAM.
- Los dos checkpoints de difusión (~20,97 GB cada uno) no pueden residir simultáneamente en GPU: el cambio entre base y ref2va requiere offloading.
- El perfil combinado usa el VAE de vídeo FP16 (~5,21 GB), mayor que el VAE INT8 del perfil dedicado a referencia, lo que aumenta el consumo de memoria.
- GPU recomendadas: tarjetas con 48 GB de VRAM (A6000, L40S, A100 40/80 GB con offloading, RTX 6000 Ada); en consumer, una RTX 4090 (24 GB) probablemente requeriría offloading agresivo, aunque no está verificado.
- Despliegue: ComfyUI (integración nativa según los tags), RunPod (tag explícito del repositorio). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicable a modelos de difusión).
- Latencia y throughput: no disponibles; el LoRA turbo de 8 pasos a 768p sugiere tiempos de generación reducidos respecto al muestreo completo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Contenido | Resolucion turbo | Licencia |
|---|---|---|---|---|
| cokeadrink/minimax-h3-int8-base-ref2va | INT8 ConvRot | Base fl2va + ref2va + VAEs + LoRA turbo | 768p (8 pasos) | MiniMax H3 Community |
| cokeadrink/minimax-h3-fl2va-fp8-8step | FP8 | Solo generación ordinaria (fl2va) + LoRA turbo | 768p (8 pasos) | MiniMax H3 Community |
| Comfy-Org/MiniMax-H3 | Varias (incluye ref2va) | Checkpoints oficiales reempaquetados para ComfyUI | no disponible | MiniMax H3 Community |

La diferencia principal de este bundle frente a la variante FP8 anterior del mismo autor es la inclusión del checkpoint ref2va para generación con referencia, a costa de un mayor tamaño en disco y requisitos de memoria. Frente al repositorio oficial de Comfy-Org, el valor añadido es la consolidación de todos los componentes (incluido el codificador de texto y los VAEs) en un único paquete coherente con revisiones fijadas.

## Limitaciones y advertencias

- La configuración de 48 GB de VRAM no ha sido verificada en GPU por el autor; el rendimiento y la viabilidad real en memoria son inciertos.
- Los dos checkpoints de difusión no pueden estar residentes a la vez: cambiar entre generación base y por referencia requiere offloading, lo que añade latencia y complejidad al workflow.
- El perfil combinado emplea el VAE de vídeo FP16, más grande que el VAE INT8 del perfil dedicado de referencia, incrementando el uso de memoria.
- La licencia MiniMax H3 Community License Agreement incluye términos de territorio aplicable y condiciones de uso que pueden restringir el despliegue comercial en algunas jurisdicciones; debe revisarse el texto de la licencia antes de uso en producción.
- El codificador Qwen3-VL está bajo Apache 2.0, pero el conjunto del bundle queda supeditado a la licencia comunitaria de MiniMax H3.
- Es un bundle de terceros sin verificación oficial de MiniMaxAI ni de Comfy-Org; aunque se publican SHA-256 de las fuentes, conviene validar los hashes antes de usar los pesos.
- No hay datos de benchmarks, parámetros ni rendimiento publicados; cualquier evaluación de calidad debe hacerse de primera mano.
- Repositorio con muy poca tracción social (423 descargas, 0 likes), sin comunidad de soporte apreciable.

## Enlaces

- Repositorio del bundle: https://huggingface.co/cokeadrink/minimax-h3-int8-base-ref2va
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoints Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Bundle previo FP8 del mismo autor: https://huggingface.co/cokeadrink/minimax-h3-fl2va-fp8-8step/tree/bda73ed54c427baf0cff5f69b0db74e706a73701
- Conversión Qwen3-VL NVFP4: https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4
- LoRA turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Manifiesto del bundle: https://huggingface.co/cokeadrink/minimax-h3-int8-base-ref2va/blob/main/bundle-manifest.json
