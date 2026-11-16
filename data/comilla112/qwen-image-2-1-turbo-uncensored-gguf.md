# COMILLA112/Qwen-Image-2.1-Turbo-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Turbo-Uncensored-GGUF es un text encoder cuantizado en formato GGUF, publicado por el usuario COMILLA112 y derivado del modelo Qwen/Qwen3-VL-8B-Instruct. No se trata de un modelo generador de imágenes completo, sino del componente de codificación de texto que alimenta al denoiser de Qwen-Image 2.1 Turbo en el motor stable-diffusion.cpp. La modificación principal consiste en una "abliteration": la dirección de rechazo (refusal direction) del encoder se ha proyectado fuera de los pesos, de modo que el modelo deja de negarse a procesar peticiones que como chat rechazaría.

El modelo conserva la arquitectura del Qwen3-VL-8B-Instruct original, con 8.190.735.360 parámetros reales según los safetensors del modelo base, y se distribuye en cuantizaciones GGUF con una matriz de importancia propia y un layout por tensor identificado con el prefijo `AD-`. El repositorio ocupa 54,0 GB e incluye varios niveles de cuantización (BF16, Q8_0 y otros).

Su relevancia es doble: por un lado, sirve como encoder de texto listo para usar con el denoiser Turbo de AtomicChat en stable-diffusion.cpp; por otro, funciona como modelo de chat sin rechazos, con una tasa de negativas que cae del 88,9% al 1,2% en inglés y del 38% al 0% en ruso sobre prompts reservados, manteniendo MMLU en 77,35%. La model card es explícita: sobre las imágenes generadas no se midió ningún efecto de desbloqueo, porque el pipeline original ya no filtra y el denoiser no dibuja lo que no aprendió.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-8B-Instruct como text encoder; el denoiser asociado es un modelo de difusión de ~7B no incluido en este repo) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (16,39 GB), Q8_0 (8,71 GB) y niveles adicionales no detallados en la informacion disponible; imatrix propia y layout por tensor `AD-` |
| Idiomas soportados | no disponible (la model card reporta evaluaciones en ingles y ruso) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (compatible con stable-diffusion.cpp como `--llm`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal de 8,19 mil millones de parámetros que en este contexto se emplea exclusivamente como codificador de texto del pipeline Qwen-Image 2.1 Turbo. La modificación aplicada es una abliteration: se identifica la dirección de rechazo en los estados ocultos (la model card indica que en la última capa los prompts dañinos y los inocuos se separan con AUROC 1,000) y se proyecta fuera de los pesos. No se documenta un reentrenamiento con RLHF o DPO adicional; el ajuste es puramente direccional sobre el modelo base.

La cuantización se realizó con una matriz de importancia (imatrix) propia y un layout por tensor con prefijo `AD-`, generado por AtomicChat. Los archivos se construyeron y verificaron con stable-diffusion.cpp. La model card reporta métricas de fidelidad frente al original: KLD de 0,0019 y 98,45% de coincidencia en top-1 para BF16, y KLD de 0,0029 con 98,04% en top-1 para Q8_0. La ablación en sí contribuye 0,0019 al KLD en BF16.

## Capacidades

- Codificación de texto para generación de imágenes en stable-diffusion.cpp, actuando como `--llm` junto al denoiser Turbo de AtomicChat.
- Generación de texto y conversación como modelo de chat (hereda las capacidades del Qwen3-VL-8B-Instruct).
- Comprensión de imágenes (visión) por herencia del modelo base Qwen3-VL.
- Razonamiento y conocimiento general: MMLU de 77,35% reportado antes y después de la ablación.
- Multilingüismo parcial documentado: evaluaciones de rechazo en inglés y ruso.
- Funcionamiento sin rechazos en modo chat: 1,2% de negativas en inglés y 0% en ruso sobre prompts reservados.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explícito: no disponible en la informacion proporcionada.

## Casos de uso

- Generación de imágenes local con stable-diffusion.cpp: el archivo se carga como `--llm` junto al denoiser Turbo GGUF, permitiendo un pipeline text-to-image completamente offline en hardware de consumo.
- Integración en Atomic Chat: la aplicación de escritorio ejecuta stable-diffusion.cpp y acepta estos GGUF directamente, de modo que el usuario puede generar imágenes sin depender de servicios en la nube.
- Chat sin rechazos para investigación sobre alineación: el encoder modificado permite estudiar cómo varía la tasa de negativas (88,9% a 1,2% en inglés) manteniendo el rendimiento en MMLU, como caso controlado de abliteration.
- Evaluación de robustez de pipelines de difusión: comparar imágenes generadas con el encoder original y con el abliterado (LPIPS 0,088 en prompts sensibles frente a 0,499 de un cambio de semilla) sirve para medir la sensibilidad del denoiser al codificador.
- Despliegue de asistentes conversacionales con Qwen3-VL-8B en formato GGUF: al conservar el 98,45% de coincidencia top-1 en BF16, puede sustituir al original en tareas de chat donde se quiera evitar la negativa a responder.
- Procesamiento multimodal en local: al heredar la visión de Qwen3-VL, puede emplearse para descripción de imágenes o tareas VQA en entornos sin conexión, siempre que el runtime GGUF soporte las capacidades multimodales.
- Reproducibilidad de experimentos de cuantización: los archivos con imatrix y layout `AD-` permiten replicar las métricas LPIPS y KLD publicadas para validar el impacto de cada nivel de cuantización.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Tasa de rechazo en chat, ingles, original | 88,9% |
| Tasa de rechazo en chat, ingles, abliterado | 1,2% |
| Tasa de rechazo en chat, ruso, original | 38% |
| Tasa de rechazo en chat, ruso, abliterado | 0% |
| MMLU antes y despues de la ablacion | 77,35% (sin cambios) |
| KLD frente al original, BF16 | 0,0019 |
| Coincidencia top-1, BF16 | 98,45% |
| KLD frente al original, Q8_0 | 0,0029 |
| Coincidencia top-1, Q8_0 | 98,04% |
| LPIPS de imagen, Q8_0 frente a BF16 | 0,031 |
| LPIPS de imagen, encoder abliterado frente a original (prompts sensibles) | 0,088 |
| LPIPS de imagen, encoder abliterado frente a original (prompts neutros) | 0,084 |
| LPIPS de referencia, cambio de semilla | 0,499 |
| LPIPS de referencia, cuantizar el encoder original a Q8_0 | 0,037 |
| Prompts sensibles que cambian de resultado (45 probados) | 0 de 45 |
| Prompts sensibles donde el juez ve lo pedido, encoder original | 40 de 45 |
| Prompts sensibles donde el juez ve lo pedido, encoder abliterado BF16 | 40 de 45 |
| Prompts sensibles donde el juez ve lo pedido, encoder abliterado Q8_0 | 40 de 45 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el encoder: aproximadamente 16,4 GB en BF16 y 8,7 GB en Q8_0, a lo que hay que sumar la memoria del denoiser Turbo (~7B) y del VAE en el mismo pipeline.
- GPU recomendadas: para BF16, GPUs con 24 GB o más (RTX 3090, RTX 4090, A100, H100). Para Q8_0, GPUs de 16 GB en adelante (RTX 4060 Ti 16 GB, RTX 4080, RTX 5070 Ti).
- Cabe en GPU de consumo: sí, especialmente en Q8_0 o cuantizaciones menores, siempre que se comparta memoria con el denoiser.
- Opciones de despliegue: stable-diffusion.cpp (motor de referencia con el que se construyó y verificó), Atomic Chat como frontend de escritorio. Otros runtimes GGUF no están documentados para este pipeline.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-Uncensored-GGUF | 8,19B | no disponible | Abliteration del encoder | apache-2.0 | GGUF |
| Qwen/Qwen3-VL-8B-Instruct | 8,19B | no disponible | Ninguna (original) | no disponible en la informacion | safetensors |
| AtomicChat/Qwen-Image-2.1-Turbo-GGUF | ~7B (denoiser) | no disponible | Cuantizacion Turbo | no disponible en la informacion | GGUF |

La comparación directa más pertinente es con el Qwen3-VL-8B-Instruct original: misma arquitectura y mismo tamaño, pero sin ablación, con tasa de rechazo del 88,9% en inglés y 38% en ruso. Frente al denoiser Turbo de AtomicChat, la diferencia es funcional: este repositorio contiene el codificador de texto, no el modelo de difusión.

## Limitaciones y advertencias

- La model card reconoce explícitamente que sobre las imágenes no se midió ningún efecto de desbloqueo: de 45 prompts sensibles, ninguno cambió de resultado respecto al encoder original. El pipeline original ya no filtra y el denoiser no dibuja lo que no aprendió.
- El cambio de imágenes inducido por la ablación (LPIPS 0,088) es un desplazamiento general, no dirigido a contenido rechazado, y afecta igual a prompts neutros (0,084).
- La ablación reduce la negativa a responder como chat, lo que elimina una barrera de seguridad en ese uso; el modelo puede producir contenido que el original rechazaría.
- Riesgo de alucinación: no cuantificado en la información disponible; el KLD de 0,0019 en BF16 indica baja divergencia distribucional, pero no mide veracidad.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: solo se reportan evaluaciones en inglés y ruso; el resto no está caracterizado.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el contenido generado ni sobre el cumplimiento normativo en jurisdicciones que regulan contenido sensible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor (COMILLA112) no es el desarrollador original de Qwen; conviene verificar la integridad de los pesos antes de usarlos en producción.
- El uso como `--llm` está atado a stable-diffusion.cpp; otros runtimes GGUF pueden no interpretar correctamente el layout `AD-` ni las capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/COMILLA112/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Denoiser Turbo asociado: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-GGUF
- Metricas publicas: https://huggingface.co/datasets/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF-metrics
- Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
