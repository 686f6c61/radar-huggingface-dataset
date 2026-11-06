# creador/mv-adapter-sd21-onnx

## Resumen

MV-Adapter SD2.1 ONNX es una conversión a ONNX del adaptador multi-vista MV-Adapter, fusionado dentro del UNet de Stable Diffusion 2.1-base y dividido en grafos independientes que pueden ejecutarse en el navegador mediante onnxruntime-web sobre WebGPU. Lo publica el usuario `creador` (repositorio asociado al proyecto WaveSlice) y su propósito concreto es generar seis vistas consistentes de un objeto fotografado a partir de una sola imagen, usando mapas de posición y normales como guía geométrica. El modelo resuelve el problema de "pintar" las caras de un objeto que la foto original nunca capturó, manteniendo coherencia entre vistas.

Técnicamente no es un modelo nuevo: es una reempaquetado de inferencia. El UNet incorpora la atención auto-multi-vista desacoplada por filas y columnas (`DecoupledMVRowColSelfAttnProcessor2_0`, seis vistas) y la atención cruzada de referencia de MV-Adapter, mientras que el VAE y los embeddings de texto provienen de Stable Diffusion 2.1-base. La conversión sustituye cada atención escalada por producto punto por un único nodo `com.microsoft.MultiHeadAttention`, que onnxruntime ejecuta como flash attention por bloques.

El interés actual es de despliegue: permite ejecutar un pipeline image-to-image multi-vista completo en el cliente, sin servidor GPU, con pesos en fp16 y un tamaño total de repositorio de 4,2 GB. No incluye el codificador de texto (los embeddings de los prompts fijos están precalculados) ni un pipeline de difusión completo: el bucle de muestreo debe implementarlo el consumidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet de difusión (Stable Diffusion 2.1-base) con atención auto-multi-vista desacoplada fila/columna y atención cruzada de referencia de MV-Adapter; T2IAdapter sobre mapas de control |
| Parámetros totales | no disponible (pesos UNet en fp16: 1,930 GB en `unet.onnx.data`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompts fijos de 77 tokens en los embeddings precalculados) |
| Tipos de cuantización | fp16 en todos los grafos (UNet, cond_encoder, VAE encoder y decoder); no se documentan otras precisiones |
| Idiomas soportados | no disponible (el codificador de texto no se distribuye; solo hay embeddings de dos prompts fijos) |
| Licencia | openrail++ (CreativeML Open RAIL++-M para UNet y VAE; Apache-2.0 para los pesos y código de MV-Adapter) |
| Formato de pesos | ONNX (con datos externos `unet.onnx.data`), `text.bin` float16 y `schedule.json` |

## Arquitectura y entrenamiento

El modelo no se ha entrenado en esta conversión: hereda los pesos de MV-Adapter (`mvadapter_ig2mv_sd21.safetensors`, revisión `6de4033df6b53366f3c009d22f5ec434bb55e59f`) fusionados en el UNet de SD 2.1-base (revisión `4e63672c03103b6c636b8fb4119ba982469b2955`). La arquitectura es un UNet de difusión latente con resolución de 512×512 (latenes de 64×64), al que se le añaden dos mecanismos: atención auto-multi-vista desacoplada en filas y columnas para las seis cámaras, y atención cruzada de referencia que condiciona cada paso con los estados ocultos de la imagen de referencia. El condicionamiento geométrico entra por un T2IAdapter que procesa seis mapas de posición y normales (posiciones + 0,5 y normales / 2 + 0,5, con gris 0,5 de fondo).

La innovación técnica de esta conversión es de ingeniería de inferencia. Cada atención se compila a un nodo `com.microsoft.MultiHeadAttention`, lo que evita materializar las matrices de puntuaciones y permite ejecución tipo flash attention en los proveedores CPU, CUDA y WebGPU. El UNet expone 16 salidas `hs_i` (estados ocultos previos a cada self-attention) para que el pase de referencia (t = 0, ambas escalas a 0) pueda cachearse una sola vez y reutilizarse en todos los pasos de muestreo. El ruido sigue el schedule ShiftSNR de MV-Adapter (interpolado, escala 8) sobre los betas del modelo base, con `alphas_cumprod` en `schedule.json`. El codificador de texto se elimina del paquete: los embeddings OpenCLIP-H de dos prompts fijos (negativo y "high quality") van en `text.bin` como tensor float16 de forma `[2, 77, 1024]`.

## Capacidades

- Generación multi-vista image-to-image: a partir de una imagen y mapas de posición y normales, produce seis vistas coherentes de un objeto (pipeline `image-to-image`).
- Condicionamiento geométrico explícito mediante T2IAdapter sobre seis mapas de posición y normales a 512×512.
- Consistencia entre vistas mediante atención auto-multi-vista desacoplada fila/columna.
- Condicionamiento por referencia mediante atención cruzada sobre estados ocultos cacheados.
- Control de intensidad mediante dos escalares de entrada: `mv_scale` (escala multi-vista) y `ref_scale` (escala de referencia).
- Clasifier-free guidance opcional: el grafo admite batch B = 6 sin CFG o B = 12 con CFG (mitad incondicional primero).
- Ejecución en navegador con onnxruntime-web ≥ 1.30 sobre WebGPU.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general ni audio; sus entradas son exclusivamente tensores de imagen, mapas de control, latentes y embeddings fijos.
- Capacidades multilingües: no disponibles; al no distribuirse el codificador de texto, no hay control de prompt en tiempo de ejecución.

## Casos de uso

- Texturizado de caras ocultas en fotogrametría: dada una foto de un objeto y su malla con cámaras conocidas, el modelo genera las seis vistas que faltan para completar la textura de las caras no observadas; es el caso para el que se construyó (WaveSlice).
- Previsualización 3D en el navegador: al ejecutarse con onnxruntime-web sobre WebGPU, permite generar vistas laterales de un objeto escaneado en el propio cliente, sin enviar la imagen a un servidor.
- Prototipado de assets para videojuegos: generación rápida de vistas ortogonales consistentes de un objeto a partir de una única referencia fotográfica, para su uso como guía de modelado o texturizado manual.
- Aumento de datasets multi-vista: creación de pares imagen-vistas sintéticas para entrenar o validar modelos de reconstrucción 3D, con control de la geometría mediante los mapas de normales.
- Verificación de pipelines de conversión ONNX: el paquete sirve como referencia reproducible (hashes SHA-256 por fichero, revisiones fijadas del modelo base) para validar despliegues de difusión con operadores contrib de onnxruntime.
- Aplicaciones offline o de privacidad: al no requerir backend, encaja en herramientas de escritorio o web que procesan fotos de objetos del usuario sin salida de datos.
- Docencia y experimentación con difusión multi-vista: los grafos separados (UNet, cond_encoder, VAE, schedule) permiten estudiar cada componente por separado con un bucle de muestreo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos suman aproximadamente 2,3 GB en fp16 (1,930 GB del UNet + 0,156 GB del cond_encoder + 0,068 GB del VAE encoder + 0,099 GB del VAE decoder), a lo que hay que añadir activaciones y los estados cacheados de referencia; el consumo real depende del proveedor y del bucle de muestreo.
- GPU recomendadas: no especificadas por el autor. El proveedor objetivo es WebGPU (navegador); también se citan los proveedores CPU y CUDA de onnxruntime como compatibles con los operadores contrib.
- GPU de consumo: no hay datos publicados sobre qué modelos concretos (RTX 4090, etc.) lo ejecutan con holgura; el diseño apunta a ejecución en cliente vía WebGPU, pero no se documentan requisitos mínimos.
- Opciones de despliegue: onnxruntime-web ≥ 1.30 sobre WebGPU (lo que usa WaveSlice); onnxruntime nativo con proveedores CPU o CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Salidas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| MV-Adapter SD2.1 ONNX (este) | Adaptador multi-vista fusionado en UNet SD 2.1 | Imagen + 6 mapas de posición/normales | 6 vistas 512×512 | openrail++ (UNet/VAE) + Apache-2.0 (MV-Adapter) | ONNX fp16, onnxruntime-web/WebGPU |
| huanngzh/mv-adapter (original) | Adaptador multi-vista sobre SD 2.1 | Imagen + mapas de control | 6 vistas | Apache-2.0 (pesos MV-Adapter) | safetensors, PyTorch/diffusers |
| sd2-community/stable-diffusion-2-1-base | Difusión texto-imagen | Prompt de texto | 1 imagen 512×512 | CreativeML Open RAIL++-M | safetensors, PyTorch/diffusers |

La comparación con alternativas de la misma categoría (otros adaptadores multi-vista como Zero123 o SyncDreamer) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: faltan el codificador de texto y el bucle de muestreo; el consumidor debe implementar el scheduler a partir de `schedule.json` y gestionar el pase de referencia.
- Prompts fijos: solo se incluyen los embeddings de un prompt negativo y de "high quality"; no hay control de prompt en tiempo de ejecución sin aportar embeddings propios de OpenCLIP-H.
- Resolución fija de 512×512 (latenes 64×64) y exactamente seis vistas; no se documenta soporte para otras configuraciones.
- Dependencia de operadores contrib de onnxruntime (`com.microsoft.MultiHeadAttention`): requiere versiones con esos operadores; onnxruntime-web ≥ 1.30 en WebGPU es el mínimo citado.
- Riesgo de alucinación geométrica: al generar caras no observadas, la textura puede ser plausible pero no fiel al objeto real; la calidad depende de la precisión de los mapas de posición y normales y de las cámaras.
- Restricciones de licencia: el UNet y el VAE derivan de Stable Diffusion 2.1-base bajo CreativeML Open RAIL++-M, con sus restricciones de uso (incluida la cláusula de uso aceptable); los pesos de MV-Adapter son Apache-2.0. El uso comercial está sujeto a ambas licencias.
- Sesgos: no documentados en la información disponible; al heredar SD 2.1, es razonable esperar los sesgos del modelo base, pero no hay datos publicados al respecto en esta ficha.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por la comunidad ni reportes de calidad independientes.
- Tamaño del repositorio de 4,2 GB: la descarga completa es necesaria para ejecución local, aunque los pesos útiles en fp16 suman unos 2,3 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/creador/mv-adapter-sd21-onnx
- MV-Adapter (modelo base): https://huggingface.co/huanngzh/mv-adapter
- Repositorio de código de MV-Adapter: https://github.com/huanngzh/MV-Adapter
- Stable Diffusion 2.1-base: https://huggingface.co/sd2-community/stable-diffusion-2-1-base
- Scripts de conversión (repositorio WaveSlice): https://github.com/puntorigen/waveslice3d/tree/main/tools/mvadapter-onnx
- WaveSlice: https://waveslice3d.com
- Licencia CreativeML Open RAIL++-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
