# CuTIsolation/Z-Image-Turbo-W4A8

## Resumen

Z-Image-Turbo W4A8 es una versión cuantizada del modelo de difusión texto-imagen Z-Image-Turbo, desarrollado por Tongyi-MAI, adaptada para ejecutarse en ComfyUI con requisitos de VRAM reducidos. El autor, CuTIsolation, ha aplicado una cuantización asimétrica de 4 bits en pesos y 8 bits en activaciones (formato `asym_w4a8_int8` de Comfy Kitchen) tanto al modelo de difusión como al codificador de texto Qwen3-4B, logrando reducir el tamaño total de los pesos de 20.3 GB (BF16) a 6.3 GB. Esto permite ejecutar el pipeline completo en GPUs con 8 GB de VRAM, como una RTX 4060 Laptop, manteniendo una calidad visual idéntica al modelo original según las verificaciones del autor.

La relevancia de este modelo radica en su capacidad para democratizar la generación de imágenes de alta calidad en hardware de consumo, reduciendo el tiempo de muestreo de aproximadamente 14 segundos a 7 segundos en una GPU de gama media. Al estar diseñado específicamente para ComfyUI, no requiere nodos personalizados y se integra directamente en los flujos de trabajo estándar de Z-Image-Turbo. La licencia Apache 2.0 permite su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-imagen basado en Z-Image-Turbo (Tongyi-MAI) con codificador de texto Qwen3-4B |
| Parametros totales | No disponible (el codificador de texto tiene 4B; el modelo de difusion original en BF16 pesa 12.3 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A8 asimetrico (`asym_w4a8_int8`, group_size 16 + ConvRot) para pesos y activaciones |
| Idiomas soportados | No disponible (el codificador Qwen3-4B es multilingue, pero no se especifica en la informacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos `.comfy_quant` para deteccion automatica en ComfyUI) |

## Arquitectura y entrenamiento

La arquitectura original de Z-Image-Turbo no se detalla en la informacion proporcionada, pero se sabe que es un modelo de difusion para generacion de imagenes con un codificador de texto Qwen3-4B. La version W4A8 no modifica la arquitectura subyacente, sino que aplica una cuantizacion posterior al entrenamiento (post-training quantization) sobre los pesos ya entrenados. El proceso de cuantizacion utiliza el formato `asym_w4a8_int8` de Comfy Kitchen, que incluye rotacion de pesos (ConvRot) y escalas de grupo de 16 elementos. Los pesos cuantizados se almacenan con una estructura especifica: pesos int8 rotados y empaquetados en int4, escalas de grupo en fp8 e4m3fn, escalas de canal en fp32, y un codebook Lloyd-Max de 16 entradas. Las normas 1D, los sesgos, la tabla de embeddings y el modulo `cap_embedder.1` se mantienen en BF16 para preservar la precision.

No se dispone de informacion sobre el entrenamiento del modelo base (datos, numero de tokens, tecnicas de alineacion). La cuantizacion no requiere reentrenamiento, y el autor indica que la calidad visual es identica a la del modelo BF16 original.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con resolucion 1024x1024 y 8 pasos de muestreo.
- Integracion nativa con ComfyUI: los archivos se detectan automaticamente mediante metadatos `.comfy_quant`, sin necesidad de nodos personalizados.
- Ejecucion eficiente en GPU de baja VRAM (8 GB), gracias a la cuantizacion W4A8 que reduce el uso de memoria y acelera la inferencia.
- Compatibilidad con el flujo de trabajo estandar de Z-Image-Turbo, incluyendo el VAE de FLUX (`flux1-vae.safetensors`) que debe cargarse por separado.
- El codificador de texto Qwen3-4B cuantizado soporta la codificacion de prompts sin necesidad de salida agrupada (pooled output).
- Calidad visual equivalente al modelo BF16 original, segun verificacion del autor en una RTX 4060 Laptop.

## Casos de uso

- Generacion de imagenes en tiempo real para disenadores y artistas: con un tiempo de muestreo de ~7 segundos en una GPU de 8 GB, permite iterar rapidamente sobre conceptos visuales sin necesidad de hardware profesional.
- Prototipado de assets para videojuegos: se puede integrar en un pipeline de ComfyUI para generar texturas, conceptos de personajes o entornos, aprovechando la baja VRAM para trabajar en equipos portatiles.
- Creacion de contenido para marketing y redes sociales: la generacion de imagenes bajo demanda con prompts descriptivos es viable en estaciones de trabajo con GPUs modestas, reduciendo costes de produccion.
- Automatizacion de ilustraciones para documentacion tecnica: el modelo puede generar diagramas o figuras explicativas a partir de descripciones, siempre que se supervise la coherencia.
- Desarrollo de herramientas de diseno asistido por IA: al ser Apache 2.0 y compatible con ComfyUI, se puede integrar en aplicaciones propias o plugins sin royalties.
- Investigacion en cuantizacion de modelos de difusion: el formato y los metadatos documentados permiten estudiar el impacto de la cuantizacion W4A8 en la calidad de salida y el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, etc.) en la informacion disponible. El autor proporciona una comparativa de tiempos de muestreo en una RTX 4060 Laptop (8 GB VRAM) a 1024x1024 con 8 pasos:

| Modelo | Pasos | Tiempo de muestreo |
| --- | --- | --- |
| BF16 original | 8 | ~14 s |
| W4A8 (este repo) | 8 | ~7 s |
| int8_convrot (oficial) | 8 | ~6 s |

Se indica que la calidad visual es "visualmente identica" entre las tres variantes, pero no se aportan metricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: 8 GB (verificado en RTX 4060 Laptop). El tamaño total de los pesos cuantizados es de 6.3 GB, lo que deja margen para activaciones y VAE en 8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060/4060, RTX 2070, etc.). No se requiere GPU de datacenter.
- Compatibilidad con consumer GPU: si, es el objetivo principal del modelo.
- Opciones de despliegue: exclusivamente ComfyUI (el formato `asym_w4a8_int8` es nativo de Comfy Kitchen). No se menciona compatibilidad con diffusers, vLLM, Ollama u otros runners.
- Latencia: ~7 s por imagen a 1024x1024 con 8 pasos en RTX 4060 Laptop. El throughput estimado es de aproximadamente 0.14 imagenes por segundo en esa configuracion.
- Requiere el VAE de FLUX (`flux1-vae.safetensors`) que debe descargarse por separado.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar con otros modelos de generacion de imagenes cuantizados (como SDXL cuantizado, FLUX.1 quant, etc.). La unica comparativa disponible es con las variantes del mismo modelo:

| Modelo | Tamano pesos | VRAM necesaria | Tiempo (1024x1024, 8 pasos) | Licencia |
| --- | --- | --- | --- | --- |
| Z-Image-Turbo BF16 | 20.3 GB | >16 GB (estimado) | ~14 s | Apache 2.0 |
| Z-Image-Turbo W4A8 (este repo) | 6.3 GB | 8 GB | ~7 s | Apache 2.0 |
| Z-Image-Turbo int8_convrot (oficial) | No disponible | No disponible | ~6 s | Apache 2.0 |

## Limitaciones y advertencias

- La cuantizacion W4A8 puede introducir degradacion en casos extremos no cubiertos por la verificacion del autor (por ejemplo, prompts muy complejos o resoluciones superiores a 1024x1024).
- El modelo solo es compatible con ComfyUI; no se puede cargar directamente en diffusers, lo que limita su uso en otros entornos de inferencia.
- Se requiere el VAE de FLUX, que no esta incluido en el repositorio y debe obtenerse por separado.
- No se proporcionan datos sobre sesgos o alucinaciones tipicas de modelos de generacion de imagenes; se recomienda supervisar las salidas en aplicaciones de produccion.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece garantias sobre la calidad en escenarios no verificados.
- La informacion sobre idiomas soportados no esta disponible; el codificador Qwen3-4B es multilingue, pero no se confirma que el modelo maneje correctamente prompts en todos los idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CuTIsolation/Z-Image-Turbo-W4A8
- Modelo base (Z-Image-Turbo): https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
