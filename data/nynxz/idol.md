# nynxz/Idol

## Resumen

Idol (en su variante para ComfyUI, publicada por el usuario nynxz) es un modelo de reconstrucción 3D a partir de una única imagen (image-to-3d) basado en gaussian splatting. Se trata de una reempaquetación de los pesos originales de Idol, desarrollado por Speridlabs, adaptada al formato de ficheros que los cargadores nativos de ComfyUI esperan, de modo que puede ejecutarse sin código de modelo adicional mediante los nodos TripoSplat incluidos de serie en ComfyUI.

Idol emplea la arquitectura TripoSplat, un enfoque de generación de representaciones 3D mediante gaussianos que combina un denoiser tipo transformer con decodificadores de octree y de gaussianos. Su relevancia radica en que permite obtener activos 3D (nubes de 262.144 gaussianos) a partir de una sola fotografía o render, integrándose directamente en flujos de trabajo de generación de contenido dentro de ComfyUI, el estándar de facto para pipelines de difusión modulares.

El repositorio pesa 1,3 GB en total, distribuidos en dos ficheros fp16 en safetensors: el denoiser (0,74 GB) y el decodificador combinado (0,58 GB). La licencia es Apache-2.0, heredada de los pesos originales de Speridlabs, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TripoSplat (denoiser transformer + decodificadores octree y gaussian splatting) |
| Parámetros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplicable (modelo image-to-3d, no LLM) |
| Tipos de cuantización | fp16 (pesos publicados); pesos originales en fp32 |
| Idiomas soportados | no aplicable (modelo visual) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Idol sigue la arquitectura TripoSplat. El pipeline consta de varias etapas: un codificador visual (DINOv3 ViT-H, publicado por VAST-AI para TripoSplat) extrae características de la imagen de entrada; un VAE (flux2-vae) procesa las representaciones latentes; un denoiser transformer opera sobre tokens latentes con posiciones fijas Sobol (buffer `pos_pe`, que en esta versión de ComfyUI se recalcula en tiempo de ejecución en lugar de almacenarse); y dos decodificadores (octree y gaussianos) producen la representación final de gaussian splatting. Para la eliminación de fondo se emplea BiRefNet.

Los detalles del entrenamiento original (número de tokens o imágenes, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación) no están disponibles en la información proporcionada. La innovación técnica principal de esta reempaquetación es la conversión a fp16 con paridad verificada frente a la implementación de referencia: error relativo de 3e-6 para el denoiser y entre 1e-4 y 3e-3 para los decodificadores desde fp32 (debido al eps de RMSNorm de ComfyUI), añadiendo aproximadamente 1e-3 adicional por el cast a fp16 (verificado con `tests/parity.py` en el repositorio).

## Capacidades

- Reconstrucción 3D a partir de una única imagen, generando una representación de gaussian splatting con 262.144 gaussianos.
- Generación mediante muestreo difusivo: KSampler con scheduler `euler`/`simple`, 50 pasos y cfg 4.0 (equivalente al `cfg_strength` 3 y time shift 3 del original).
- Integración nativa en ComfyUI sin código de modelo personalizado: los ficheros cargan con los nodos estándar `Load Diffusion Model` y `Load VAE` y se ejecutan en los nodos TripoSplat de serie.
- Segmentación de sujeto mediante BiRefNet para eliminar el fondo de la imagen de entrada.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, código, tool calling ni agentes.

## Casos de uso

- Generación de activos 3D para videojuegos: a partir de una foto o render de un objeto o personaje, se obtiene una nube de gaussianos que puede servir como base para activos visuales en motores que soporten gaussian splatting.
- Prototipado rápido de personajes y "idols" para VTubers o avatares: una sola imagen de referencia produce un modelo 3D visualizable sin modelado manual.
- E-commerce y catálogos 3D: fotografías de producto se convierten en vistas 3D navegables para fichas de producto interactivas.
- Digitalización de patrimonio y escaneo ligero: reconstrucción aproximada de objetos a partir de fotografías existentes cuando no se dispone de un escáner.
- Pipelines creativos en ComfyUI: integración de la reconstrucción 3D como nodo más dentro de flujos de trabajo que combinan generación de imágenes (por ejemplo, Flux) y posterior elevación a 3D.
- Investigación en gaussian splatting: los pesos fp16 con paridad verificada permiten experimentar con la arquitectura TripoSplat sin desplegar la implementación de referencia completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de calidad es la verificación de paridad numérica frente a la implementación de referencia (error relativo de 3e-6 en el denoiser y 1e-4 a 3e-3 en los decodificadores desde fp32, más ~1e-3 por el cast a fp16).

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 1,32 GB en fp16 (0,74 GB denoiser + 0,58 GB decodificadores); a esto hay que sumar los modelos auxiliares DINOv3 ViT-H, flux2-vae y BiRefNet, y la memoria de activación durante el muestreo. No se publica una cifra oficial de VRAM.
- GPU recomendadas: no disponible explícitamente; por el tamaño de los pesos, una GPU de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070) debería ser suficiente en principio, aunque no está verificado en la documentación.
- Compatibilidad con GPU de consumo: sí, el tamaño reducido de los pesos y la integración en ComfyUI apuntan a ejecución local en hardware de consumo, sin cifras confirmadas.
- Opciones de despliegue: ComfyUI mediante la extensión ComfyUI-Idol y los nodos TripoSplat nativos. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible. Parámetros de inferencia documentados: 50 pasos, scheduler `euler`/`simple`, cfg 4.0, 262.144 gaussianos de salida.

## Comparativa con modelos similares

| Característica | Idol (Speridlabs / nynxz) | TripoSplat (VAST-AI) | Modelos comparables (TRELLIS, etc.) |
|---|---|---|---|
| Tarea | Imagen única a 3D (gaussian splatting) | Imagen única a 3D (gaussian splatting) | no disponible |
| Arquitectura | TripoSplat | TripoSplat | no disponible |
| Tamaño de pesos | 1,32 GB (fp16, sin auxiliares) | no disponible | no disponible |
| Licencia | Apache-2.0 | no disponible | no disponible |
| Integración | ComfyUI nativo (nodos TripoSplat) | Implementación de referencia | no disponible |

Idol comparte arquitectura con TripoSplat de VAST-AI (cuyos pesos DINOv3 y flux2-vae reutiliza); la diferencia principal es el formato de empaquetado para ComfyUI y la licencia Apache-2.0 publicada por Speridlabs. No se dispone de datos comparativos de rendimiento con otros modelos image-to-3d.

## Limitaciones y advertencias

- No hay model card detallada del modelo original en la información proporcionada: se desconocen datos de entrenamiento, sesgos del dataset y limitaciones documentadas por Speridlabs.
- Al ser un modelo de reconstrucción monocular, la calidad dependerá fuertemente de la imagen de entrada; zonas ocluidas se generarán por inferencia del modelo, con riesgo de artefactos o geometría plausible pero no fiel al objeto real.
- Riesgo de alucinación geométrica: el modelo inventa la parte trasera del objeto, por lo que no sustituye a un escaneo 3D real en aplicaciones que exijan precisión métrica.
- La variante fp16 añade un error adicional de ~1e-3 respecto a los pesos fp32 de referencia, verificado pero no nulo.
- Requiere tres modelos auxiliares adicionales (dino_v3_vit_h, flux2-vae, birefnet) descargados de otros repositorios, lo que incrementa el footprint total de despliegue.
- La licencia Apache-2.0 no impone restricciones de uso comercial, pero conviene verificar las condiciones de los componentes auxiliares (DINOv3 de Meta tiene su propia licencia; no se indica en la información disponible).
- Repositorio con 0 descargas registradas en el momento de la ficha: comunidad y soporte limitados; el proyecto principal de referencia es ComfyUI-Idol en GitHub.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/nynxz/Idol
- Modelo original de Speridlabs: https://huggingface.co/speridlabs/idol
- Página de investigación de Speridlabs: https://speridlabs.com/research/idol
- Extensión ComfyUI-Idol (GitHub): https://github.com/Nynxz/ComfyUI-Idol
- Script de conversión: https://github.com/Nynxz/ComfyUI-Idol/blob/main/scripts/convert.py
- Pesos auxiliares TripoSplat (VAST-AI): https://huggingface.co/VAST-AI/TripoSplat
- BiRefNet (Comfy-Org): https://huggingface.co/Comfy-Org/BiRefNet
