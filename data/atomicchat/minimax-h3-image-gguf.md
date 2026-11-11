# AtomicChat/MiniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image es el modelo de generación y edición de imágenes de la familia MiniMax H3, desarrollado por MiniMax. Se trata de un único checkpoint que cubre tanto texto-a-imagen como edición de imágenes, con un proceso de muestreo de 6 pasos sin CFG (classifier-free guidance). Su transformer de difusión deriva del diseño de 33B de H3 sin las capas de audio; con las ramas AdaLN plegadas en una tabla pequeña (repack podado de Comfy-Org) queda en 20.113.670.232 parámetros y 40,2 GB en BF16.

El repositorio AtomicChat/MiniMax-H3-Image-GGUF es una cuantización GGUF de ese modelo base, publicada por AtomicChat para su uso en ComfyUI (mediante el nodo Unet Loader GGUF) y en stable-diffusion.cpp. Incluye layouts por tensor derivados de un escaneo de sensibilidad del propio modelo y una importance matrix (imatrix) calculada a partir de los pesos BF16. Los ficheros van de 7,57 GB (AD-Q2_K) a 21,45 GB (Q8_0) en disco.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de imagen de 20B en hardware de consumo, con métricas públicas de fidelidad respecto a BF16 (error de salida y LPIPS) para cada cuantización. El modelo soporta resoluciones de 4 a 20 megapíxeles y edición con hasta 16 imágenes de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (diseño H3 de 33B sin capas de audio, AdaLN plegado) |
| Parámetros totales | 20.113.670.232 (20,1B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, AD-Q6_K, AD-Q5_K, AD-Q4_K, AD-Q3_K, AD-Q2_K |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | GGUF (repo); BF16 safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer derivado del diseño de 33B de la familia MiniMax H3, al que se han eliminado las capas de audio. Las ramas AdaLN se pliegan en una tabla pequeña (repack podado de Comfy-Org), lo que reduce el recuento a 20,1B parámetros y 40,2 GB en BF16. El muestreo es de 6 pasos sin CFG, y el modelo funciona con resoluciones de 4 a 20 megapíxeles.

La cuantización de AtomicChat emplea layouts por tensor obtenidos de un escaneo de sensibilidad del propio modelo y una importance matrix calculada a partir de los pesos BF16. En el caso de AD-Q2_K, el archivo parte de una base Q2_K pero mantiene los últimos 20 bloques (los más sensibles) en Q3_K-Q4_K, resultando en 3,01 bits por peso. El text encoder (Qwen3-VL-32B de MiniMax-H3, sin cambios) y el VAE no se incluyen en este repo: se usan los de Comfy-Org para ComfyUI, o cualquier encoder GGUF de H3 para stable-diffusion.cpp. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de imágenes texto-a-imagen en un solo checkpoint, con 6 pasos de muestreo y sin CFG.
- Edición de imágenes con hasta 16 imágenes de referencia.
- Resoluciones de salida de 4 a 20 megapíxeles.
- Compatibilidad con ComfyUI mediante el nodo Unet Loader (GGUF); los ficheros cargan en ComfyUI-GGUF estándar sin modificaciones.
- Compatibilidad con stable-diffusion.cpp.
- Cuantizaciones con imatrix y layouts por tensor ajustados por sensibilidad.
- No incluye versión sin censura: la licencia prohíbe eludir las salvaguardas de seguridad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo de imagen).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (las capas de audio se han eliminado del diseño H3).

## Casos de uso

- Generación de ilustraciones en local con ComfyUI: el modelo produce imágenes de 2048×2048 en 6 pasos sin CFG, lo que permite iterar rápido en una estación de trabajo con GPU de consumo usando AD-Q4_K (11,57 GB) o AD-Q5_K (13,84 GB).
- Edición de imágenes con múltiples referencias: con hasta 16 imágenes de referencia, se puede usar para cambiar el estilo, el fondo o los objetos de una fotografía manteniendo la identidad de los sujetos, en flujos de retoque y previsualización.
- Prototipado de assets para videojuegos o diseño gráfico: las cuantizaciones AD-Q6_K (16,67 GB) y Q8_0 (21,45 GB) ofrecen fidelidad cercana a BF16 para generar variaciones de personajes, texturas o conceptos antes de pasar a producción.
- Generación de imágenes de alta resolución para impresión o cartelería: el rango de 4 a 20 megapíxeles permite producir material a tamaño completo sin reescalado posterior.
- Despliegue en entornos con memoria limitada: AD-Q3_K (8,73 GB) y AD-Q2_K (7,57 GB) permiten ejecutar el modelo en GPUs de 12-16 GB, aceptando que una mayor proporción de imágenes cambia su composición (53% y 60% respecto a una semilla nueva).
- Investigación en cuantización de modelos de difusión: las métricas públicas de error de salida y LPIPS por fichero, junto con la imatrix, permiten reproducir y comparar estrategias de cuantización sobre un modelo de 20B.
- Integración en pipelines automatizados de stable-diffusion.cpp: los ficheros GGUF se cargan directamente, lo que facilita la generación por lotes en servidores sin ComfyUI.

## Benchmarks y rendimiento

Los datos publicados por AtomicChat miden la fidelidad de cada cuantización respecto a BF16 sobre 40 captions renderizados a 2048×2048 con el mismo ruido inicial. El error de salida es la distancia L2 relativa de la predicción en cada uno de los 6 pasos; LPIPS compara la imagen final con la de BF16 para el mismo caption y semilla. La columna "vs. nueva semilla" normaliza LPIPS respecto a la variación de BF16 al cambiar solo la semilla (LPIPS 0,627).

| Fichero | Tamaño en disco | Bits por peso | Error de salida [IC 95%] | LPIPS [IC 95%] | vs. nueva semilla |
|---|---:|---:|---|---|---:|
| BF16 (Comfy-Org, atención por defecto) | 40,23 GB | 16 | 0 | 0 | 0% |
| Q8_0 | 21,45 GB | 8,53 | 0,020 [0,017; 0,023] | 0,090 [0,072; 0,111] | 14% |
| AD-Q6_K | 16,67 GB | 6,63 | 0,033 [0,027; 0,039] | 0,130 [0,105; 0,159] | 21% |
| AD-Q5_K | 13,84 GB | 5,51 | 0,049 [0,041; 0,057] | 0,164 [0,138; 0,191] | 26% |
| AD-Q4_K | 11,57 GB | 4,60 | 0,076 [0,064; 0,088] | 0,254 [0,224; 0,285] | 41% |
| AD-Q3_K | 8,73 GB | 3,47 | 0,132 [0,117; 0,147] | 0,334 [0,305; 0,366] | 53% |
| AD-Q2_K | 7,57 GB | 3,01 | 0,170 [0,152; 0,187] | 0,379 [0,349; 0,409] | 60% |

Comparaciones declaradas por el autor: AD-Q5_K (13,84 GB) es un 16% más cercano a la imagen BF16 que el Q5_K_M de Abiray (14,1 GB); AD-Q3_K (8,73 GB) es un 10-20% más cercano que los tres ficheros Q3_K_M (8,8-8,9 GB); Q8_0 es un 30% más cercano que el int8_convrot de Comfy-Org (LPIPS 0,129) con 0,5 GB más. AD-Q6_K iguala el int8_convrot de Comfy-Org (0,130 frente a 0,129) con 4,3 GB menos. En Q4 las imágenes quedan empatadas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un modelo de imagen.

## Requisitos de hardware

- VRAM estimada para el UNet: aproximadamente el tamaño del fichero GGUF más overhead. Q8_0 requiere unos 21,5 GB; AD-Q6_K unos 16,7 GB; AD-Q5_K unos 13,8 GB; AD-Q4_K unos 11,6 GB; AD-Q3_K unos 8,7 GB; AD-Q2_K unos 7,6 GB.
- El text encoder se suma aparte: el encoder int8 de Comfy-Org ocupa 27,1 GB en disco (nvfp4_awq 15,7 GB). Esto condiciona la VRAM total del pipeline.
- GPU recomendadas: H100 para las mediciones de referencia del autor; A100 para Q8_0 y AD-Q6_K; RTX 4090 (24 GB) para AD-Q5_K y AD-Q4_K, teniendo en cuenta el encoder.
- Cabe en GPU de consumo: AD-Q3_K y AD-Q2_K en tarjetas de 12-16 GB, siempre que el encoder se cargue de forma secuencial o en una cuantización más agresiva.
- Opciones de despliegue: ComfyUI con el nodo Unet Loader (GGUF) y ComfyUI-GGUF estándar; stable-diffusion.cpp con cualquier encoder GGUF de H3.
- Latencia y throughput: no disponibles. El modelo usa 6 pasos sin CFG, lo que reduce el coste por imagen frente a pipelines con más pasos y guidance.

## Comparativa con modelos similares

| Modelo / fichero | Parámetros | Contexto | LPIPS vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AtomicChat Q8_0 | 20,1B | no disponible | 0,090 | minimax-h3-image-community-license-agreement | GGUF, 21,45 GB |
| AtomicChat AD-Q6_K | 20,1B | no disponible | 0,130 | minimax-h3-image-community-license-agreement | GGUF, 16,67 GB |
| AtomicChat AD-Q4_K | 20,1B | no disponible | 0,254 | minimax-h3-image-community-license-agreement | GGUF, 11,57 GB |
| Comfy-Org int8_convrot | 20,1B | no disponible | 0,129 | minimax-h3-image-community-license-agreement | ComfyUI, +0,5 GB frente a Q8_0 |
| Abiray Q5_K_M | 20,1B | no disponible | 16% peor que AD-Q5_K | minimax-h3-image-community-license-agreement | GGUF, 14,1 GB |
| Comfy-Org BF16 | 20,1B | no disponible | 0 (referencia) | minimax-h3-image-community-license-agreement | safetensors, 40,23 GB |

No se dispone de comparación con modelos de imagen de otras familias en la información proporcionada.

## Limitaciones y advertencias

- No existe versión sin censura: la licencia de MiniMax-H3-Image prohíbe eludir las salvaguardas de seguridad.
- Las cuantizaciones bajas degradan la composición: AD-Q3_K y AD-Q2_K cambian el layout en el 53% y el 60% de las imágenes respecto a una semilla nueva; los objetos pequeños, rostros y trazos de texto se desplazan ya en AD-Q5_K y AD-Q4_K.
- El text encoder y el VAE no están incluidos en el repo; hay que obtenerlos por separado (Comfy-Org para ComfyUI, encoder GGUF de H3 para stable-diffusion.cpp), lo que añade entre 15,7 y 27,1 GB adicionales.
- El modelo base tiene 33B de diseño con capas de audio eliminadas; no se debe esperar capacidad de audio.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación específicas del modelo de imagen.
- La licencia es "other" (minimax-h3-image-community-license-agreement): es necesario revisar el archivo LICENSE del repo para conocer las restricciones de uso comercial antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; la validación por parte de la comunidad es todavía inexistente.
- Las métricas publicadas son del propio autor de la cuantización; conviene reproducirlas antes de adoptar los ficheros en un pipeline crítico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/MiniMax-H3-Image-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Familia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Métricas y renders públicos: https://huggingface.co/datasets/AtomicChat/MiniMax-H3-Image-GGUF-metrics
- Atomic Chat: https://atomic.chat/
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X de AtomicChat: https://x.com/atomic_chat_hq
