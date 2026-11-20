# JoaoZaokk/Qwen-Image-2512-W4A8-ConvRot

## Resumen

Qwen-Image-2512-W4A8-ConvRot es una versión cuantizada del modelo de difusión texto-a-imagen Qwen-Image (versión 2512, la variante no-edit), publicada por el usuario JoaoZaokk. No es un modelo nuevo ni un fine-tune: es una recodificación de los pesos originales de Qwen (Alibaba) en formato `asym_w4a8_int8`, con pesos de 4 bits y activaciones de 8 bits, agrupados en bloques de 16 con `convrot_groupsize` de 256. El objetivo es reducir el peso del transformer de 38,05 GiB a 10,79 GiB, un factor de 3,53x, manteniendo una salida indistinguible del original en una hoja de contactos.

El modelo se distribuye como un único archivo `safetensors` compatible con ComfyUI (librería `diffusion-single-file`) y conserva la misma arquitectura MMDiT del original, así como el mismo encoder de texto (`qwen_2.5_vl_7b`) y VAE, que no están incluidos en el repositorio. La relevancia del proyecto es doble: por un lado, ofrece una build práctica que cabe en GPUs de consumo y acelera la inferencia; por otro, documenta un resultado negativo medido con rigor, que las activaciones a 4 bits (W4A4) degradan la imagen de forma inaceptable en tres familias de modelos distintas, mientras que los pesos a 4 bits sí sobreviven.

La ficha se basa únicamente en la model card y en los metadatos de Hugging Face. Los datos de rendimiento provienen de un banco de pruebas propio del autor (12 ejecuciones, 6 prompts, 2 semillas, 1024 px, 20 pasos, cfg 2.5, euler/simple, una RTX 3090), no de benchmarks estándar de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (transformer de difusion, misma que Qwen-Image 2512) |
| Parametros totales | no disponible (el repo no declara el recuento; el transformer BF16 de origen pesa 38,05 GiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; el encoder de texto asociado es `qwen_2.5_vl_7b`) |
| Tipos de cuantizacion | `asym_w4a8_int8`: pesos int4 asimetricos, activaciones int8, `group_size` 16, `convrot_groupsize` 256 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (archivo unico, 11.581.151.800 bytes, 10,79 GiB) |

## Arquitectura y entrenamiento

El modelo es una recodificación del transformer MMDiT de Qwen-Image 2512 en BF16 (40.861.031.488 bytes, sha256 que empieza por `d8c57b76f262e1ef27f5eca1`). No hay entrenamiento adicional: la conversión aplica cuantización de pesos a 4 bits con escala asimétrica por grupo de 16 elementos, mientras que las activaciones se mantienen en 8 bits. El archivo contiene 840 tensores en el formato `asym_w4a8_int8`, y el backend registrado en el sidecar es `comfy_kitchen.backends.cuda` en las cuatro operaciones.

La calibración se realizó sobre este mismo checkpoint, no reutilizando el análisis del modelo Edit, pese a que ambos comparten arquitectura y difieren en solo 72 bytes de tamaño de archivo. La herramienta `quant_mixed` rechaza análisis foráneos por defecto, ya que pesos distintos producen errores por capa distintos. El VAE no está cuantizado (254 MiB frente a 38 GiB del transformer) y no se incluye en el repo, al igual que el encoder de texto. El autor publica además una build W4A4 del mismo origen como resultado negativo medido, sin publicar sus pesos.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con el transformer Qwen-Image 2512 en su variante no-edit.
- Resolución de trabajo validada en el banco de pruebas: 1024 px, 20 pasos, cfg 2.5, sampler euler/simple.
- Compatible con ComfyUI mediante la librería `diffusion-single-file`.
- Ejecución con pesos residentes en VRAM en GPUs de 24 GB (el original BF16 requiere streaming de pesos).
- No incluye capacidades de edición de imagen: la variante editor se distribuye en un repositorio separado.
- No incluye tool calling, agentes, razonamiento multi-paso ni otras capacidades de lenguaje; es exclusivamente un modelo de difusión.
- Idioma de los prompts: inglés (único idioma declarado).

## Casos de uso

- Generación de imágenes en producción con ComfyUI: el archivo único se carga directamente en un nodo de ComfyUI y permite generar a 1024 px en una RTX 3090 sin streaming de pesos, lo que reduce el tiempo por paso de 5,722 s a 1,566 s en el banco del autor.
- Despliegue en GPUs de consumo de 24 GB: al ocupar 10,79 GiB el transformer, queda margen para el encoder `qwen_2.5_vl_7b`, el VAE y el resto del grafo de ComfyUI en tarjetas como la RTX 3090 o la RTX 4090.
- Prototipado rápido de pipelines texto-a-imagen: la reducción de 3,53x en peso y 3,65x en tiempo por paso facilita iterar sobre prompts y semillas en estaciones de trabajo de gama alta para consumidor.
- Evaluación de técnicas de cuantización: el repositorio y su banco de pruebas asociado sirven como referencia reproducible para comparar W4A8 frente a W4A4 en modelos de difusión, con divergencia medida frente a BF16.
- Generación de material visual para documentación o marketing interno: la salida se describe como indistinguible del BF16 en una hoja de contactos, con divergencia de 0,3875 (rango 0,2023–0,7235) sobre 12 ejecuciones.
- Investigación sobre robustez de activaciones en cuantización: el resultado negativo de W4A4 en tres familias (Qwen-Image-Edit 2511, Wan 2.2 TI2V 5B y Qwen-Image 2512) es un caso de estudio concreto sobre qué componentes toleran 4 bits.

## Benchmarks y rendimiento

Datos del banco de pruebas del autor: 12 ejecuciones (6 prompts × 2 semillas), 1024 px, 20 pasos, cfg 2.5, euler/simple, una RTX 3090. El transformer es el único componente que cambia entre brazos.

| Brazo | GiB | s/paso | Divergencia vs BF16 | Rango min–max | Valoración visual |
|---|---|---|---|---|---|
| BF16 original | 38,05 | 5,722 | — | — | nitida |
| W4A8 (este archivo) | 10,79 | 1,566 | 0,3875 | 0,2023–0,7235 | indistinguible en hoja de contactos |
| W4A4 (mismo origen) | 9,60 | 1,038 | 1,3369 | 1,1018–1,5449 | moteado de color, inutilizable |

El autor advierte que los 5,722 s/paso del brazo BF16 no son una comparación justa de kernels: 38,05 GiB no caben en una tarjeta de 24 GB y los pesos se transmiten en cada paso, mientras que los brazos cuantizados residen en VRAM. La cifra que refleja la experiencia de usuario es que el archivo pequeño termina 3,65x antes en ese hardware.

Resultados W4A4 por familia (misma build de 4 bits en pesos, solo cambia la ruta de activaciones):

| Modelo | Resultado W4A4 | Divergencia |
|---|---|---|
| Qwen-Image-Edit 2511 | fallo estático puro | 1,7440 |
| Wan 2.2 TI2V 5B | desenfoque | 0,3847 |
| Qwen-Image 2512 (este) | moteado de color, sujeto aún visible | 1,3369 |

El autor señala que la métrica de divergencia está sesgada hacia fallos suaves: el desenfoque de Wan puntúa 0,3847, por debajo del 0,3875 de esta build correcta, por lo que no puede usarse sola para aceptar una build; solo un render decide. No se han publicado LPIPS, FID ni estudios de usuario.

## Requisitos de hardware

- VRAM estimada para el transformer: 10,79 GiB en W4A8 (frente a 38,05 GiB en BF16).
- GPU validada por el autor: una RTX 3090 (24 GB), con los pesos cuantizados residentes en VRAM.
- Cabe en GPUs de consumo de 24 GB (RTX 3090, RTX 4090); en BF16 no cabía y requería streaming de pesos por paso.
- El encoder de texto (`qwen_2.5_vl_7b`) y el VAE (254 MiB) no están incluidos y consumen VRAM adicional; el autor menciona una build `convrot_w4a4` del encoder publicada por separado en la misma cuenta.
- Despliegue: ComfyUI con la librería `diffusion-single-file` y el backend `comfy_kitchen.backends.cuda`, que proporciona los kernels CUDA para `asym_w4a8_int8`.
- Throughput medido: 1,566 s/paso en RTX 3090 a 1024 px, 20 pasos, cfg 2.5, euler/simple (frente a 5,722 s/paso en BF16 con streaming y 1,038 s/paso en W4A4).
- No se han publicado datos de latencia o throughput para otras GPU (A100, H100, RTX 4090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image 2512 W4A8 (este) | no disponible | no disponible | safetensors, 10,79 GiB | apache-2.0 | Hugging Face, 1358 descargas |
| Qwen-Image 2512 BF16 (origen) | no disponible | no disponible | safetensors, 38,05 GiB | apache-2.0 | Hugging Face (Qwen) |
| Qwen-Image 2512 W4A4 (mismo autor) | no disponible | no disponible | no publicado (solo hoja de contactos) | apache-2.0 | resultado negativo medido |
| Qwen-Image-Edit 2511 W4A8 | no disponible | no disponible | safetensors | apache-2.0 | Hugging Face (JoaoZaokk) |

La comparación relevante es interna al proyecto: frente al BF16 original, esta build reduce el peso 3,53x y el tiempo por paso 3,65x en RTX 3090, a costa de una divergencia de 0,3875 sin métricas perceptivas formales. Frente a W4A4, es más pesada (10,79 frente a 9,60 GiB) y más lenta (1,566 frente a 1,038 s/paso), pero la salida es utilizable. No se dispone de datos de benchmarks estándar (FID, CLIP score) para comparar con otras builds de Qwen-Image de la comunidad.

## Limitaciones y advertencias

- La validación es limitada: 12 ejecuciones, 6 prompts, 2 semillas, una resolución, un sampler y una tarjeta. No cubre otros samplers, resoluciones ni GPUs.
- "Indistinguible en una hoja de contactos" es un veredicto humano, no una métrica perceptiva: no hay LPIPS, FID ni estudio de usuario.
- La métrica de divergencia está sesgada hacia fallos suaves y no puede usarse sola para aceptar una build; el desenfoque de Wan puntúa por debajo de esta build correcta.
- El encoder de texto y el VAE no están incluidos en el repositorio; sin ellos el modelo no es autónomo.
- El VAE no está cuantizado y el autor declara que no lo estará.
- Solo se probó `convrot_groupsize` 256; no se intentó una build mixta ni una búsqueda de óptimo entre W4A4 y W4A8.
- Los pesos W4A4 no se publican, aunque su hoja de contactos sí, para que la afirmación sea verificable.
- Solo se declara inglés como idioma de prompts.
- Riesgo de alucinación visual y sesgos del modelo base Qwen-Image: no evaluados en esta build ni documentados en la model card.
- Licencia apache-2.0 heredada del modelo base, sin restricciones comerciales adicionales declaradas por el autor de la cuantización; conviene verificar los términos del modelo Qwen-Image original.
- La cuantización puede introducir artefactos en prompts o estilos no cubiertos por el conjunto de 6 prompts del banco de pruebas.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/JoaoZaokk/Qwen-Image-2512-W4A8-ConvRot
- Modelo base: https://huggingface.co/Qwen/Qwen-Image
- Repositorio del banco de pruebas y registro de mediciones: https://github.com/JoaoZaokk/comfy-quant-bench
- Variante editor cuantizada: https://huggingface.co/JoaoZaokk/Qwen-Image-Edit-2511-W4A8-ConvRot
- Pesos BF16 empaquetados para ComfyUI: https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI
