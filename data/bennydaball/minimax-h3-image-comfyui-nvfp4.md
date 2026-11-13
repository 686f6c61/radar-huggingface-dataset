# BennyDaBall/MiniMax-H3-Image-ComfyUI-NVFP4

## Resumen
MiniMax-H3-Image-ComfyUI-NVFP4 es una cuantización de un solo archivo del modelo MiniMax H3 Image, derivado del modelo de vídeo H3 de MiniMax, empaquetada específicamente para ComfyUI. La desarrolla BennyDaBall, no el autor original del modelo base, y su propósito es reducir el peso del transformador de 40,23 GB en BF16 a 12,54 GB mediante cuantización NVFP4 (pesos y activaciones a 4 bits), manteniendo una calidad visual prácticamente idéntica al modelo completo.

El modelo resuelve el problema de desplegar un generador y editor de imágenes de alta resolución en hardware Blackwell de consumo. Frente al archivo oficial W4A8 de 12,55 GB, esta versión NVFP4 rinde entre un 12 % y un 20 % más rápido según la resolución, con una diferencia de calidad despreciable (LPIPS medio de 0,303 frente a 0,304 sobre 32 prompts a 16 MP). Está pensado para GPUs de la serie RTX 50, RTX PRO Blackwell y DGX Spark.

La relevancia actual radica en que demuestra que la cuantización W4A4 completa (todas las 200 matrices del transformador en NVFP4, sin dejar capas a 8 bits) es viable en difusión de imágenes de alta resolución, con una pérdida de calidad que, a partir del paso 3 de 6 del denoiser, se iguala al límite teórico impuesto por el propio formato de activación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo de imagen derivado del modelo de vídeo H3); pesos y activaciones en NVFP4, atención en INT8 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos 4 bits, activaciones 4 bits); referencia comparativa W4A8 oficial y BF16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement (license: other) |
| Formato de pesos | diffusion-single-file (un único archivo compatible con ComfyUI); repo de 12,9 GB |

## Arquitectura y entrenamiento
El modelo base es un transformer de difusión para texto-a-imagen y edición de imágenes, surgido del modelo de vídeo H3 de MiniMax. El transformador consta de 200 matrices cuantizadas en esta versión. La inferencia se realiza con un muestreador euler/simple de 6 pasos y CFG 1, con decodificación VAE posterior. La atención utiliza INT8 en todos los archivos distribuidos, incluido este.

La cuantización sigue un esquema de destilación profesor-alumno: el modelo en precisión completa actúa como profesor y el archivo de 4 bits como alumno, resolviendo cada una de las 200 matrices para que reproduzca el comportamiento del profesor en ejecuciones reales del denoiser. Se calibró tanto en texto-a-imagen como en edición, a 4 MP y 16 MP, a lo largo de todo el schedule de 6 pasos. Los pesos se obtuvieron mediante derivadas complejas propias del método GPTQ (Frantar et al., 2022), corrigiendo cada decisión de redondeo contra lo que la capa realmente observa. La escala de cada bloque de 4 bits se elige mediante Schur Replay scoring (arXiv 2609.36654) combinado con los puntos Four Over Six (arXiv 2512.02010). El archivo fue construido y validado en dos RTX PRO 6000 Blackwell y una RTX 5090.

## Capacidades
- Generación de texto a imagen hasta 16 MP (4096x4096) y 4 MP (2048x2048) con 6 pasos de muestreo.
- Edición de imágenes: acepta una imagen de entrada como `<Picture 1>` junto a un prompt de edición escrito, permitiendo cambios de color, iluminación, vegetación, materiales o adición de elementos (por ejemplo, cambiar un vestido de esmeralda a escarlata, un atardecer a noche lunar o un campo de trigo a lavanda en flor).
- Coherencia de escena compleja: composiciones con múltiples sujetos, iluminación dramática y detalles finos (chispas, reflejos, texturas) según las imágenes de ejemplo de la model card.
- Integración directa en ComfyUI con el loader estándar, el text encoder estándar y el VAE estándar, sin nodos personalizados.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; se trata de un modelo de difusión de imagen, no de un LLM.

## Casos de uso
- Generación de arte conceptual a alta resolución: renderizar ilustraciones a 16 MP en 12,93 s en una RTX 5090 permite iterar sobre decenas de variaciones por sesión, algo inviable con el BF16 de 40,23 GB en el mismo hardware.
- Edición fotográfica asistida por prompt: sustituir cielos, cambiar paletas de color o añadir elementos meteorológicos sobre una imagen existente usando el mismo archivo y los mismos 6 pasos, sin pipeline separado.
- Producción de assets para videojuegos: generar texturas y escenarios de gran formato con detalles finos (chispas, cascadas, campos) aprovechando la coherencia de escena del modelo a 4096x4096.
- Previsualización rápida en estaciones de trabajo Blackwell: con 3,07 s por imagen a 2048x2048, encaja en flujos de revisión donde el artista necesita feedback casi inmediato.
- Automatización de variaciones de marketing: generar múltiples versiones de una misma escena (día/noche, estaciones, materiales) mediante ediciones encadenadas sobre una imagen base, manteniendo composición y encuadre.
- Despliegue en hardware de consumo o compacto: al caber en 12,54 GB, permite ejecutar el modelo en RTX 50 series, RTX PRO Blackwell y DGX Spark, habilitando prototipado local sin depender de clústeres.
- Restauración estilística de material existente: aplicar transformaciones globales (color, iluminación, vegetación) sobre fotografías o renders previos conservando la estructura original de la escena.

## Benchmarks y rendimiento
Rendimiento medido por el autor en ComfyUI 0.45.0 con RTX 5090, workflow estándar (euler, simple, 6 pasos, CFG 1), tiempo total de prompt en caliente, mediana de 5 ejecuciones, incluyendo muestreo, decodificación VAE y guardado PNG:

| Archivo del transformador | Tamano | 2048x2048 | 4096x4096 |
|---|---:|---:|---:|
| BF16 original | 40,23 GB | 8,24 s | 27,40 s |
| W4A8 oficial | 12,55 GB | 3,68 s | 14,52 s |
| NVFP4 (este repo) | 12,54 GB | 3,07 s | 12,93 s |

Calidad: sobre 32 prompts a 16 MP, LPIPS medio frente al render BF16 de 0,303 para este archivo y 0,304 para el W4A8 oficial.

Error relativo de una llamada al denoiser frente al modelo de precisión completa (24 llamadas a 4 MP, menor es mejor):

| Paso | Solo activaciones de 4 bits | Este archivo |
|---:|---:|---:|
| 1 | 0,201 | 0,230 |
| 2 | 0,139 | 0,206 |
| 3 | 0,109 | 0,108 |
| 4 | 0,063 | 0,063 |
| 5 | 0,041 | 0,042 |
| 6 | 0,024 | 0,024 |

A partir del paso 3 ambas columnas coinciden: el error de pesos desaparece y solo queda el redondeo de activaciones inherente al formato NVFP4.

## Requisitos de hardware
- VRAM estimada: el archivo del transformador ocupa 12,54 GB; con text encoder y VAE adicionales, se recomienda disponer de al menos 16 GB de VRAM para 4 MP y más para 16 MP.
- GPU compatibles: exclusivamente Blackwell, es decir, RTX 50 series (incluida RTX 5090), RTX PRO Blackwell y DGX Spark. No es utilizable en arquitecturas anteriores porque NVFP4 requiere soporte nativo de Blackwell.
- Cabe en GPU de consumo: sí, en RTX 5090 (12,54 GB de pesos); el autor lo validó en dos RTX PRO 6000 Blackwell y una RTX 5090.
- Despliegue: ComfyUI 0.45.0 con el loader estándar, text encoder estándar y VAE estándar, sin nodos personalizados. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo de difusión.
- Latencia y throughput medidos: 3,07 s por imagen a 2048x2048 y 12,93 s a 4096x4096 en RTX 5090, incluyendo VAE y guardado; equivalen a 2,7x y 2,1x la velocidad del BF16 respectivamente.

## Comparativa con modelos similares

| Modelo | Tamano del transformador | Velocidad 4096x4096 (RTX 5090) | Calidad (LPIPS vs BF16) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| NVFP4 (este repo) | 12,54 GB | 12,93 s | 0,303 | minimax-h3-image-community-license-agreement | Hugging Face (BennyDaBall) |
| W4A8 oficial | 12,55 GB | 14,52 s | 0,304 | minimax-h3-image-community-license-agreement | Hugging Face (MiniMaxAI) |
| BF16 original | 40,23 GB | 27,40 s | referencia | minimax-h3-image-community-license-agreement | Hugging Face (MiniMaxAI) |

No se dispone de datos de benchmarks frente a otros modelos de difusión de imagen ajenos a la familia H3 en la información proporcionada.

## Limitaciones y advertencias
- Dependencia exclusiva de hardware Blackwell: NVFP4 no está soportado en GPUs anteriores, lo que excluye A100, H100, RTX 4090 y generaciones previas.
- La licencia es la MiniMax H3 Image Community License Agreement, no una licencia open source estándar; deben revisarse las restricciones de uso comercial antes de producción.
- El error de activación de 4 bits es irreducible: en los pasos 1 y 2 el error frente al BF16 (0,230 y 0,206) supera el de un modelo solo con activaciones de 4 bits (0,201 y 0,139), lo que puede afectar composiciones que dependen fuertemente de las primeras iteraciones del denoiser.
- La model card no documenta sesgos, tasas de alucinación visual, idiomas soportados ni limitaciones de contexto; estos datos figuran como no disponibles.
- El autor reporta métricas agregadas (LPIPS medio sobre 32 prompts) pero no desglosa resultados por tipo de prompt; el rendimiento puede variar en dominios específicos.
- El repositorio tiene 0 descargas y 1 like en el momento de la ficha, por lo que no existe validación independiente de terceros sobre las cifras publicadas.
- Al ser un archivo único para ComfyUI, la integración fuera de ese entorno no está documentada.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/BennyDaBall/MiniMax-H3-Image-ComfyUI-NVFP4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
- GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
- Schur Replay scoring: https://arxiv.org/abs/2609.36654
- Four Over Six: https://arxiv.org/abs/2512.02010
