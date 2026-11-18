# BennyDaBall/MiniMax-H3-Image-ComfyUI-NVFP4

## Resumen

MiniMax-H3-Image-ComfyUI-NVFP4 es una cuantización de 4 bits (W4A4) del modelo de difusión MiniMax H3 Image, empaquetada como un único archivo para su uso directo en ComfyUI. El modelo original lo desarrolla MiniMaxAI y deriva del modelo de vídeo H3; esta versión la publica el usuario independiente BennyDaBall, que ha aplicado una receta propia de cuantización NVFP4 sobre los pesos de Comfy-Org/MiniMax-H3-Image. El objetivo es reducir el peso del transformer de 40,23 GB (BF16) a 12,54 GB sin degradar perceptiblemente la calidad de las imágenes generadas.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de cuantización de un modelo de difusión de gran tamaño para hardware Blackwell (RTX 50, RTX PRO Blackwell, DGX Spark); por otro, sirve como referencia de cómo un formato de 4 bits (NVFP4) con pesos y activaciones cuantizados puede superar en velocidad a la cuantización oficial W4A8 manteniendo una calidad equivalente según las métricas del autor.

El repositorio ocupa 12,9 GB y contiene un único archivo de pesos en formato diffusion-single-file, compatible con el cargador estándar de ComfyUI. No hay información sobre el tamaño del modelo original, la longitud de contexto (no aplica a difusión) ni los idiomas soportados, ya que se trata de un modelo texto-a-imagen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo de imagen derivado del modelo de vídeo H3); 200 matrices del transformer cuantizadas |
| Parámetros totales | no disponible (el repo pesa 12,9 GB en NVFP4; el BF16 original son 40,23 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen) |
| Tipos de cuantización | NVFP4 (W4A4: pesos y activaciones a 4 bits); comparado con W4A8 oficial y BF16 |
| Idiomas soportados | no disponible (los prompts se procesan mediante el text encoder estándar de ComfyUI) |
| Licencia | minimax-h3-image-community-license-agreement (other) |
| Formato de pesos | diffusion-single-file (un único archivo, cargador estándar de ComfyUI) |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión para generación y edición de imágenes, descendiente del modelo de vídeo H3 de MiniMax. Esta versión no reentrena el modelo: aplica una cuantización post-entrenamiento de tipo GPTQ extendido, donde el modelo BF16 actúa como profesor y el archivo de 4 bits como alumno. Cada una de las 200 matrices del transformer se resuelve para que la salida del alumno reproduzca la del profesor en ejecuciones reales del denoiser, en lugar de redondear peso a peso. La calibración cubre tanto texto-a-imagen como edición de imágenes, a 4 MP y 16 MP, a lo largo de todo el schedule de 6 pasos.

La innovación técnica principal es la combinación de NVFP4 (4 bits en pesos y activaciones) con dos técnicas de selección de escalas: Schur Replay scoring (arXiv 2609.36654) para elegir la escala de cada bloque de 4 bits, y los puntos Four Over Six (arXiv 2512.02010). El autor reporta que, a partir del paso 3 de 6, el error residual del archivo coincide con el suelo teórico de la cuantización de activaciones a 4 bits, es decir, el error de pesos es despreciable en esa fase. No se dispone de información sobre el dataset de entrenamiento original ni sobre si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de imágenes texto-a-imagen de alta resolución, hasta 16 MP (4096x4096) según las pruebas del autor.
- Edición de imágenes: el mismo archivo acepta una imagen de entrada como `<Picture 1>` junto con un prompt de edición (cambio de color, iluminación, vegetación, materiales, añadir elementos).
- Ejecución en 6 pasos de denoising con sampler euler y CFG 1, sin necesidad de prompt expander.
- Compatible con el cargador estándar de ComfyUI, el text encoder y el VAE estándar; no requiere nodos personalizados.
- Optimizado para hardware Blackwell (RTX 50, RTX PRO Blackwell, DGX Spark) mediante NVFP4.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio; no aplica a un modelo de difusión de imagen.
- Capacidades multilingües: no disponibles; dependen del text encoder que se use en ComfyUI.

## Casos de uso

- Generación de imágenes publicitarias o editoriales a 16 MP: el modelo produce imágenes de 4096x4096 en unos 13 segundos en una RTX 5090, lo que permite iterar sobre conceptos visuales en un flujo de trabajo de ComfyUI sin cambiar de herramienta.
- Edición de imágenes en producción: dado que el mismo archivo acepta una imagen de entrada y un prompt de edición, se puede usar para cambiar colores de producto, iluminación de escenas o materiales en catálogos, manteniendo la composición original.
- Prototipado rápido en estudio de diseño: con 3,07 s por imagen a 2048x2048 en una RTX 5090, un diseñador puede generar decenas de variaciones por minuto para explorar direcciones creativas.
- Despliegue en estaciones de trabajo con GPU Blackwell de gama consumer: al ocupar 12,54 GB, cabe en tarjetas de 16 GB o más, lo que permite usar el modelo en un PC local sin servidores dedicados.
- Integración en pipelines de ComfyUI existentes: al ser un archivo único con el cargador estándar, se puede sustituir el modelo BF16 por esta versión en un grafo ya construido para reducir el uso de VRAM y el tiempo por imagen.
- Generación de material gráfico para vídeo o animación: al derivar del modelo de vídeo H3, el modelo de imagen puede producir fotogramas clave o fondos que luego se integren en un flujo de postproducción.
- Investigación en cuantización de modelos de difusión: el repositorio incluye comparaciones contra BF16 y W4A8, métricas LPIPS y tablas de error por paso, lo que lo convierte en un caso de estudio reproducible para quien investigue NVFP4.

## Benchmarks y rendimiento

Datos medidos por el autor en una RTX 5090 con ComfyUI 0.45.0, sampler euler, 6 pasos, CFG 1, mediana de 5 ejecuciones (incluye muestreo, decodificación VAE y guardado PNG):

| Archivo del transformer | Tamaño | 2048x2048 | 4096x4096 |
|---|---:|---:|---:|
| BF16 original | 40,23 GB | 8,24 s | 27,40 s |
| W4A8 oficial | 12,55 GB | 3,68 s | 14,52 s |
| NVFP4 (este repo) | 12,54 GB | 3,07 s | 12,93 s |

Calidad texto-a-imagen: sobre 32 prompts a 16 MP, el LPIPS medio frente al render BF16 es 0,303 para este archivo y 0,304 para el W4A8 oficial.

Error relativo de la imagen limpia predicha por paso (24 llamadas a 4 MP, menor es mejor):

| Paso | Solo activaciones de 4 bits | Este archivo |
|---:|---:|---:|
| 1 | 0,201 | 0,230 |
| 2 | 0,139 | 0,206 |
| 3 | 0,109 | 0,108 |
| 4 | 0,063 | 0,063 |
| 5 | 0,041 | 0,042 |
| 6 | 0,024 | 0,024 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de difusión de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo del transformer ocupa 12,54 GB; hay que sumar el text encoder y el VAE estándar de ComfyUI, por lo que se recomienda un mínimo de 16 GB de VRAM.
- GPU recomendadas: RTX 5090 (usada por el autor para las mediciones), RTX PRO 6000 Blackwell, DGX Spark y, en general, cualquier GPU Blackwell con soporte NVFP4.
- Cabe en GPU consumer: sí, en RTX 50 series con 16 GB o más; no está pensado para GPUs sin soporte NVFP4 (Ampere, Ada, etc.), donde el formato no se aprovecha.
- Opciones de despliegue: ComfyUI con el cargador estándar de diffusion-single-file; no requiere nodos personalizados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 3,07 s por imagen a 2048x2048 y 12,93 s a 4096x4096 en una RTX 5090, con 6 pasos y CFG 1.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Resolución máx. | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| MiniMax-H3-Image-ComfyUI-NVFP4 (este) | NVFP4 W4A4 | 12,54 GB | 16 MP | minimax-h3-image-community-license-agreement | Hugging Face (BennyDaBall) |
| MiniMax H3 Image W4A8 oficial | W4A8 | 12,55 GB | 16 MP | minimax-h3-image-community-license-agreement | Hugging Face (Comfy-Org) |
| MiniMax H3 Image BF16 | BF16 | 40,23 GB | 16 MP | minimax-h3-image-community-license-agreement | Hugging Face (MiniMaxAI) |

No se dispone de información sobre otros modelos de difusión comparables en la documentación proporcionada; la comparativa se limita a las tres variantes del mismo modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo de imagen, puede heredar los sesgos del dataset de entrenamiento original de MiniMax H3 Image.
- Riesgo de alucinación: no aplica en el sentido textual, pero el modelo puede generar imágenes que no se correspondan fielmente con el prompt, especialmente en escenas complejas o con muchos objetos.
- Limitaciones de contexto o idioma: no aplica contexto de texto; el rendimiento multilingüe depende del text encoder que se use en ComfyUI y no está documentado.
- Restricciones de licencia: la licencia minimax-h3-image-community-license-agreement es de tipo "other"; es necesario revisar el enlace de licencia del modelo base antes de cualquier uso comercial.
- Requiere hardware Blackwell para aprovechar NVFP4; en GPUs sin soporte nativo el formato puede no funcionar o degradar el rendimiento.
- Las métricas de calidad y velocidad las reporta el autor del repositorio, no un tercero independiente; conviene validarlas en el hardware y flujo de trabajo propios.
- El repositorio tiene pocas descargas (4205) y likes (7), y fue creado en noviembre de 2026, por lo que su adopción y mantenimiento a largo plazo no están garantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BennyDaBall/MiniMax-H3-Image-ComfyUI-NVFP4
- Modelo base MiniMaxAI: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Modelo base Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
- Paper GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
- Paper Schur Replay scoring: https://arxiv.org/abs/2609.36654
- Paper Four Over Six: https://arxiv.org/abs/2512.02010
