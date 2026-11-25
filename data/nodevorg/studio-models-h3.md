# nodevorg/studio-models-h3

## Resumen

`nodevorg/studio-models-h3` no es un modelo entrenado desde cero, sino un repositorio de redistribución de pesos derivados de MiniMax H3, empaquetados en el formato int8 que consume ComfyUI. Lo publica el usuario nodevorg para alimentar su plataforma studio.no.dev, que ejecuta estos ficheros tanto en ComfyUI como en su propio motor "uncomfy". El repositorio agrupa cinco artefactos distintos: dos torres HyperFlow H3 Flash de Video Rebirth (fl2va y ref2va), un checkpoint Studio H3 V1, un checkpoint Alarian H3 V1 y dos adaptadores LoRA de pi-H3 para muestreo en 2 y 4 pasos, además de un estudiante H3-Tiny FewStep de 17,08 mil millones de parámetros.

Se trata, por tanto, de un modelo de difusión para generación de vídeo (texto a vídeo, imagen a vídeo y vídeo a partir de imágenes de referencia y audio), no de un modelo de lenguaje. La relevancia práctica está en que concentra en un único repositorio de 95,9 GB las variantes destiladas y cuantizadas a int8 que permiten inferencia en pocos pasos (2, 4, 6 u 8 según el fichero) sin PDD, algo crítico para reducir el coste computacional de la generación de vídeo.

La licencia es la MiniMax H3 Community License Agreement, que se hereda en todos los ficheros por ser derivados, con restricciones territoriales y términos comerciales propios. El repositorio no es un producto oficial de MiniMax, Video Rebirth, pi-H3 ni H3-Tiny.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para vídeo, con variantes pruned y destiladas; formato int8 tensorwise con convrot, group size 256 |
| Parametros totales | 17,08 mil millones en el estudiante H3-Tiny FewStep; no disponible para el resto de ficheros |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (int8_tensorwise con convrot); no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors de un solo fichero para ComfyUI (diffusion-single-file) y LoRAs en safetensors |

## Arquitectura y entrenamiento

Los ficheros son derivados de MiniMax H3, un modelo de difusión para vídeo. El repositorio no entrena nada: copia pesos de terceros y los reempaqueta en el layout int8 de ComfyUI. Las dos torres HyperFlow H3 Flash de Video Rebirth corresponden a variantes podadas del transformer: fl2va con 3 bloques eliminados y 102 capas lineales en low-rank (16,3 GB), y ref2va con 1 bloque eliminado y 114 capas lineales en low-rank (16,8 GB). Ambas muestrean en 6 u 8 pasos sin PDD.

El estudiante H3-Tiny FewStep es el transformer ref2va de MiniMax H3 podado a 42 bloques (17,08 mil millones de parámetros) y destilado para muestrear en 6 pasos (funciona con 4 o más). Los adaptadores pi-H3, obra de Hansheng Chen et al., destilan la torre fl2va original a 2 o 4 pasos de muestreo y decodifican el vídeo desde el último paso sin VAE (DWD), usando el schedule pi-Flow con max_raw_t de 0,93 y 0,96 respectivamente. Los checkpoints Studio H3 V1 (20,2 GB) y Alarian H3 V1 (20,1 GB) son checkpoints MiniMax H3 en int8, el segundo específico de ref2va.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text to video) con la torre fl2va de HyperFlow H3 Flash.
- Generación de vídeo a partir de una imagen (primer fotograma) o de primer y último fotograma, mediante el nodo `MiniMaxH3ImageToVideo`.
- Generación de vídeo a partir de imágenes de referencia y audio, mediante el nodo `MiniMaxH3ReferenceToVideo` (torres ref2va, Alarian H3 V1 y H3-Tiny FewStep).
- Muestreo acelerado: 6 u 8 pasos en HyperFlow, 2 o 4 pasos con los adaptadores pi-H3, 6 pasos (mínimo 4) con H3-Tiny FewStep.
- Decodificación sin VAE (DWD) en el flujo pi-H3, que evita el coste del decodificador.
- Integración con ComfyUI mediante cargadores específicos (`HyperFlowInt8Loader`, `UNETLoader`, `Load LakonLab Adapter`, `H3-Tiny Few-Step Loader`).
- No se documentan capacidades de tool calling, agentes, razonamiento multimodal ni soporte multilingüe.

## Casos de uso

- Prototipado rápido de vídeo generativo en ComfyUI: cargar `StudioH3-V1.safetensors` con el `UNETLoader` estándar y el text encoder y VAEs de Comfy-Org/MiniMax-H3 permite tener un pipeline funcional sin conversiones adicionales.
- Imagen a vídeo para publicidad y contenido de redes: la torre fl2va de HyperFlow acepta un primer fotograma y genera la secuencia en 6 u 8 pasos, lo que encaja en flujos de producción con tiempos de iteración cortos.
- Interpolación entre fotogramas clave: el nodo `MiniMaxH3ImageToVideo` admite primer y último fotograma, útil para crear transiciones controladas entre dos imágenes de un storyboard.
- Vídeo con referencia de identidad o estilo y audio: la torre ref2va y Alarian H3 V1 generan vídeo a partir de imágenes de referencia y pista de audio, adecuado para avatares, doblaje visual o reels musicales.
- Generación de vídeo en pocos pasos para entornos con presupuesto de GPU ajustado: los adaptadores pi-H3 de 2 y 4 pasos reducen el número de evaluaciones del modelo y, con DWD, eliminan la decodificación por VAE, lo que abarata la inferencia por clip.
- Despliegue de un estudiante compacto en producción: H3-Tiny FewStep, con 17,08 mil millones de parámetros y 18,1 GB en int8, permite servir ref2va con los nodos oficiales de H3-Tiny en 6 pasos, reduciendo VRAM frente a los checkpoints completos de 20 GB.
- Investigación sobre destilación de modelos de difusión: los adaptadores pi-H3 y el estudiante FewStep sirven como referencia reproducible para comparar schedules de destilación (pi-Flow, DWD) sobre una misma base MiniMax H3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los ficheros int8 de 16,3 a 20,2 GB requieren al menos esa cantidad solo para los pesos del transformer, más la memoria del text encoder, los VAEs y las activaciones; en la práctica, se necesita una GPU con 24 GB o más para los checkpoints de 20 GB y margen para el resto del pipeline.
- GPU recomendadas: A100 (40 u 80 GB), H100 y RTX 4090 (24 GB) para los checkpoints de 20 GB; para H3-Tiny FewStep (18,1 GB) y las torres HyperFlow (16,3 y 16,8 GB) el margen en 24 GB es mayor.
- Cabe en GPU de consumo: sí, en RTX 4090 y GPUs de 24 GB para los ficheros de menor tamaño; los de 20,2 y 20,1 GB quedan muy ajustados y dependen del resto del grafo.
- Opciones de despliegue: ComfyUI con `UNETLoader` para Studio H3 V1 y Alarian H3 V1; `HyperFlowInt8Loader` de ComfyUI-Studio-HyperFlow más ComfyUI-HyperFlow-Flash para las torres HyperFlow; `Load LakonLab Adapter` de ComfyUI-piFlow para los adaptadores pi-H3; nodos propios de H3-Tiny para el estudiante FewStep. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles. Solo se conoce el número de pasos de muestreo por fichero (2, 4, 6 u 8).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| studio-models-h3 (este repo) | 17,08 B en H3-Tiny FewStep; no disponible en el resto | no disponible | 2, 4, 6 u 8 según fichero | MiniMax H3 Community License | Hugging Face, 884 descargas |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | no disponible | MiniMax H3 Community License | Hugging Face, oficial |
| VideoRebirthAI/hyperflow-h3-flash | no disponible | no disponible | 6 u 8 sin PDD | MiniMax H3 Community License | Hugging Face |
| H3-Tiny/MiniMax-H3-Tiny-ComfyUI | 17,08 B (ref2va podado a 42 bloques) | no disponible | 6 (mínimo 4) | MiniMax H3 Community License | Hugging Face |

La comparativa se limita a las variantes de la propia familia H3 porque la información disponible no incluye modelos de vídeo de otros desarrolladores con datos verificables.

## Limitaciones y advertencias

- No es un modelo original: todos los ficheros son derivados de MiniMax H3 y heredan la licencia MiniMax H3 Community License Agreement, con restricciones territoriales, términos comerciales y una política de uso aceptable que deben revisarse antes de cualquier despliegue.
- El repositorio no es un producto oficial de MiniMax, Video Rebirth, pi-H3 ni H3-Tiny; el soporte y la garantía recaen en el publicador.
- Dependencia fuerte de nodos de terceros: las torres HyperFlow no cargan con el loader estándar de H3 de ComfyUI y exigen ComfyUI-Studio-HyperFlow y ComfyUI-HyperFlow-Flash; los adaptadores pi-H3 requieren ComfyUI-piFlow; H3-Tiny FewStep exige los nodos propios de H3-Tiny. Un cambio en esos repositorios puede romper el pipeline.
- Los checkpoints de 20 GB en int8 dejan poco margen en GPUs de 24 GB una vez cargados text encoder, VAEs y activaciones; el riesgo de OOM en producción es real.
- No se documentan sesgos, tasas de alucinación visual, idiomas soportados ni limitaciones de contexto; no hay benchmarks publicados que permitan evaluar la calidad frente a la base MiniMax H3.
- El tamaño del repositorio (95,9 GB) y la mezcla de cinco artefactos distintos obligan a descargar solo los ficheros necesarios; descargar el repo completo es costoso en almacenamiento y ancho de banda.
- Al ser pesos destilados y podados, la calidad puede degradarse frente al modelo completo, especialmente en los adaptadores de 2 pasos y en el estudiante de 17,08 mil millones de parámetros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nodevorg/studio-models-h3
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia upstream: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- HyperFlow H3 Flash (Video Rebirth): https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- pi-H3 (Lakonik): https://huggingface.co/Lakonik/pi-H3
- H3-Tiny en ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Repositorio H3-Tiny: https://github.com/fuyi25/MiniMax-H3-Tiny
- Nodos ComfyUI de H3-Tiny: https://github.com/fuyi25/MiniMax-H3-Tiny/tree/main/comfyui
- ComfyUI-Studio-HyperFlow: https://github.com/NoDevOrg/ComfyUI-Studio-HyperFlow
- ComfyUI-HyperFlow-Flash: https://github.com/Video-Rebirth/ComfyUI-HyperFlow-Flash
- ComfyUI-piFlow: https://github.com/Lakonik/ComfyUI-piFlow
- Guía pi-H3: https://github.com/Lakonik/ComfyUI-piFlow/blob/main/docs/piH3.md
- Text encoder y VAEs de MiniMax H3 para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- Plataforma del autor: https://studio.no.dev
