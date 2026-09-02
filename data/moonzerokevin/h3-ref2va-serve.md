# moonzerokevin/h3-ref2va-serve

## Resumen

H3 Ref2VA Serve es un despliegue industrial del modelo MiniMax-H3 **ref2va**, especializado en video-to-video con reemplazo de personaje (character swap). Desarrollado por el usuario moonzerokevin, este repositorio autocontenido incluye pesos cuantizados, código de servicio, kits de despliegue y documentación operativa. Su principal aportación es ejecutar un transformer de video de clase 61.7 GiB en GPUs de consumo (RTX 5090 de 32 GB) mediante cuantización NVFP4 W4A4 con entrenamiento consciente de cuantización (QAT), algo que no es posible con precisión fp8 (requiere 33.0 GB de VRAM).

El modelo combina un denoiser destilado con DMD (Distribution Matching Distillation), un text encoder Qwen3-VL-32B en NF4, y VAEs de video y audio. Incluye una capa de planificación agéntica (Gemini + GPT-Image-2) que genera keyframes pintados y los ancla en la línea temporal rotatoria del video, permitiendo control fino sin coste de tokens de texto. La generación es determinista: con una semilla fija se reproduce el mismo video en distintas máquinas y despliegues.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de video (denoiser DMD-distilled) + Qwen3-VL-32B (text encoder) + VAEs de video/audio |
| Parametros totales | no disponible (denoiser de clase 61.7 GiB, pruned a 14.82 GiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | NVFP4 W4A4 (denoiser, con QAT), NF4 (text encoder, bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (license:other) |
| Formato de pesos | safetensors, .pt (PyTorch), componentes diffusers |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión latente para video. El componente principal es un denoiser transformer destilado con DMD (Distribution Matching Distillation) que reduce los pasos de muestreo a 8. Sobre este se aplicó un proceso de QAT (quantization-aware training) con 150 pasos, utilizando NVFP4 fake-quant en los 264 lineales que se cuantizan en tiempo de despliegue, más un prune de rango 8 en las capas AdaLN. El text encoder es Qwen3-VL-32B, cargado en NF4 mediante bitsandbytes, lo que reduce el tiempo de codificación de texto de 7.4–8.5 s a 0.09 s. Se incluyen también un VAE de video y un audio VAE para codificar y decodificar los clips.

La innovación principal es la cuantización NVFP4 W4A4, que permite ejecutar el transformer completo en 32 GB de VRAM (pico de 29.2 GB durante el denoise), algo inviable en fp8. Además, la capa de planificación agéntica (plan→paint→pin) usa Gemini para planificar keyframes y reescribir el prompt, y GPT-Image-2 para pintar el personaje en los anclajes elegidos, que luego se fijan en la línea temporal rotatoria del video generado.

## Capacidades

- Video-to-video con reemplazo de personaje: dado un video de referencia y una imagen del personaje, genera el mismo clip interpretado por ese personaje.
- Stylization completa: re-render cinematográfico, estilizado 3D (incluyendo cast no humanoide) y macro fotorrealista, controlado por imágenes de referencia y keyframes anclados.
- Re-render de escenas: mantiene la coreografía, vestuario y entorno del clip original mientras cambia la apariencia o el estilo.
- Control fino mediante keyframes: se pueden fijar uno o varios fotogramas pintados en posiciones concretas de la línea temporal.
- Generación determinista: con una semilla fija, el video de salida es bit-idéntico entre máquinas, despliegues y rutas de ejecución.
- Salida con audio: el pipeline genera video con pista de audio AAC.
- Planificación agéntica: integra Gemini y GPT-Image-2 para planificar keyframes y reescribir prompts, sin coste adicional de tokens de texto.

## Casos de uso

- Reemplazo de actor en producciones audiovisuales: un estudio puede sustituir a un intérprete en un clip existente manteniendo la coreografía y el entorno, usando una imagen del nuevo actor y un video de referencia.
- Creación de contenido de marca con personajes personalizados: una empresa puede generar videos promocionales donde su mascota o avatar aparece en escenas reales, anclando keyframes pintados para garantizar la coherencia.
- Postproducción con control de estilo: un editor puede re-renderizar un clip con estética cinematográfica o 3D estilizado, fijando keyframes para preservar elementos clave de la escena.
- Generación de demos de producto: se pueden crear videos de demostración donde un producto se muestra en diferentes entornos o con diferentes personajes, sin necesidad de rodar de nuevo.
- Doblaje visual para localización: reemplazar el rostro de un actor en un video doblado a otro idioma, manteniendo la sincronía labial aproximada mediante keyframes.
- Investigación en generación de video: el despliegue determinista y reproducible permite experimentos controlados con semillas fijas, útil para evaluar variaciones de prompt o de imágenes de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El modelo se evalúa por métricas de rendimiento de inferencia en RTX 5090, medidas en caliente:

| Duracion · resolucion · pasos | Tiempo end-to-end |
|---|---|
| 5 s · 768p · 8 pasos | 112.8 s |
| 5 s · 768p · 4 pasos | 65.7 s |
| 10 s · 768p · 8 pasos | 395.4 s |
| 15 s · 768p · 8 pasos | 452.5 s (tier que fp8 no puede ejecutar) |
| 5 s · 480p | 56.8 s |

En configuración de 8 GPUs (1:5:2), el throughput estimado es de ~176 trabajos/hora para clips de 5 s. La fiabilidad está documentada: el runbook de despliegue se ha ejecutado de extremo a extremo en máquinas limpias y pasa todas las puertas de aceptación.

## Requisitos de hardware

- GPU mínima: RTX 5090 con 32 GB de VRAM (requiere soporte sm_120 para SageAttention).
- VRAM estimada: pico de 29.2 GB durante el denoise, 27.3 GB en conditioning, 16.2 GB en decode.
- Ruta A (producción): 3+ GPUs RTX 5090 en configuración 1 conditioning : N denoise : 1 decode. Para 8 GPUs (1:5:2), throughput de ~176 jobs/h a 5 s.
- Ruta B (una sola GPU): 1 × RTX 5090, con intercambio de etapas (~60 s) y render; 5 s · 768p · 8 pasos en ~183 s.
- Opciones de despliegue: Ray Serve (servicio incluido), kit standalone con emulador GCS local, manifiesto de referencia para Kubernetes, kit single-GPU.
- Latencia: 112.8 s para 5 s · 768p · 8 pasos en ruta A; 452.5 s para 15 s · 768p · 8 pasos.
- No cabe en GPUs de consumo de gama inferior (requiere 32 GB y sm_120).

## Comparativa con modelos similares

Existen otras variantes del mismo modelo base MiniMax-H3 ref2va, pero no se dispone de datos comparativos detallados en la información proporcionada:

| Modelo | Cuantizacion | Hardware objetivo | Despliegue |
|---|---|---|---|
| moonzerokevin/h3-ref2va-serve | NVFP4 W4A4 + NF4 | RTX 5090 32GB | Ray Serve, standalone, K8s |
| ModelsLab/MiniMax-H3-ref2va-NVFP4 | NVFP4 (sin detalles) | no disponible | no disponible |
| gabrielrocco/MiniMax-H3-Ref2VA-MLX-Serve-8bit | 8-bit (MLX) | Apple Silicon (MLX) | MLX Serve |

No se dispone de comparativas de rendimiento o calidad entre estas variantes.

## Limitaciones y advertencias

- Licencia comunitaria MiniMax-H3 (minimax-h3-community-license): revisar las restricciones específicas antes de uso comercial; el archivo de licencia está en el repositorio.
- Requiere hardware muy específico: RTX 5090 con soporte sm_120; no funcionará en GPUs más antiguas o con menos de 32 GB.
- Dependencia de APIs externas para la capa de planificación (Gemini y GPT-Image-2); sin ellas, la funcionalidad de plan→paint→pin no está disponible.
- No se documentan idiomas soportados; el text encoder Qwen3-VL-32B es multilingüe, pero no hay garantía de calidad para todos los idiomas.
- Tamaño del repositorio grande (46.5 GB), con descarga y verificación de checksums necesarias.
- No se han publicado evaluaciones de sesgos o alucinaciones visuales; el modelo puede generar contenido no deseado si las imágenes de referencia o los prompts son ambiguos.
- La generación es lenta en comparación con modelos de texto: un clip de 15 s tarda ~7.5 minutos en una sola GPU.
- El pipeline de audio está incluido, pero no se especifica su calidad o limitaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/moonzerokevin/h3-ref2va-serve
- GitHub MiniMax-H3 (oficial): https://github.com/MiniMax-AI/MiniMax-H3
- Subdirectorio Ref2VA en GitHub: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/Ref2VA
- Variante NVFP4 de ModelsLab: https://huggingface.co/ModelsLab/MiniMax-H3-ref2va-NVFP4
- Variante MLX 8-bit: https://huggingface.co/gabrielrocco/MiniMax-H3-Ref2VA-MLX-Serve-8bit
- Página de archivos del modelo MiniMax H3: https://minimaxh3.run/minimax-h3-model-files-downloads
