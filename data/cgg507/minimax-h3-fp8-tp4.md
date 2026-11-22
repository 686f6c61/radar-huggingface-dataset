# cgg507/MiniMax-H3-FP8-TP4

## Resumen

MiniMax-H3 FP8 (TP4) es una conversión y cuantización a FP8 del modelo base MiniMaxAI/MiniMax-H3, un modelo de generación de vídeo (y audio) a partir de texto basado en una arquitectura DiT (Diffusion Transformer). El repositorio lo publica el usuario cgg507 y no contiene los pesos originales, sino derivados preparados para un motor de inferencia concreto (Minimax-neuron), con layouts específicos por rango y backend Vulkan/Neuron. El modelo base lo desarrolla MiniMaxAI.

La relevancia de esta versión es práctica: reduce el peso del DiT base de un modelo de vídeo de gran tamaño a pesos FP8 E4M3 (códigos limitados a 224) con escalas f32 por canal de salida, y ofrece dos variantes de despliegue: TP4 (cuatro shards para tensor parallelism en varias GPU) y TP1 (una sola GPU). El repositorio ocupa 127,7 GB e incluye además el text encoder (basado en Qwen3-VL, 50 capas), la torre de visión para imágenes de referencia y el decoder VAE de vídeo en bf16.

Se trata de un artefacto de ingeniería orientado a despliegue, no de un modelo entrenado desde cero: no hay información publicada sobre datos de entrenamiento, número de parámetros totales ni benchmarks estándar. La licencia es la MiniMax H3 Community License Agreement, con restricciones territoriales y de uso que condicionan seriamente su explotación comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para texto-a-vídeo/audio; text encoder basado en Qwen3-VL (50 capas); VAE de vídeo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 (per-channel minmax, código máximo 224) con escalas f32 por canal de salida; bf16 para token refiner, torre de visión y VAE |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | Layouts preparados por motor (archivos tensoriales por rango + `meta.json`), no compatibles con diffusers/safetensors estándar |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 emplea una arquitectura DiT para generación de vídeo y audio condicionada por texto. En esta conversión, el text encoder está basado en Qwen3-VL con 50 capas y se incluye una torre de visión (extraída del shard del text encoder de Ref2VA, en bf16) para procesar imágenes de referencia. El DiT incorpora un token refiner en bf16 y un AdaLN en forma completa alojado en `host/`. El VAE de vídeo se distribuye en bf16 (4,6 GB).

La cuantización aplicada es FP8 E4M3 con minmax por canal y código máximo 224, con escalas f32 por canal de salida. Los pesos se reorganizan en layouts específicos del motor Minimax-neuron: qkv intercalado por cabeza y fc1 como [gate; value]. El repositorio ofrece dos preparaciones: `base-fp8/` con shards tensor-parallel 4 (`rank0..3`, 44 GB) y `base-fp8-tp1/` para una sola GPU con escalas de bloque [K/128, N] (20 GB). También incluye `ref2va-fp8/` (DiT reference-to-video, 44 GB) y `text-encoder-fp8/` (25 GB, TP4).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO en el modelo base. La model card indica que estos pesos no son un drop-in para diffusers ni safetensors: cargan únicamente en el backend Vulkan (KHR / NV cooperative matrix, con TP sobre varias GPU) y en el backend Neuron del motor Minimax-neuron.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución de 1344x768 según la medición reportada.
- Generación de audio asociada al vídeo (el repositorio incluye el DiT base text-to-video/audio; el VAE de audio no se incluye y debe tomarse del repo original).
- Reference-to-video (Ref2VA): generación de vídeo condicionada por imágenes de referencia, mediante el DiT `ref2va-fp8/` y la torre de visión incluida.
- Procesamiento de imágenes de referencia mediante torre de visión en bf16.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni idiomas soportados.
- No se documenta modo thinking ni otras capacidades especiales más allá de la generación multimodal vídeo/audio.

## Casos de uso

- Generación de clips publicitarios: el modelo puede producir vídeo a 1344x768 a partir de un prompt textual en aproximadamente 2,5 minutos a 20 pasos con FSampler sobre 4 x RTX 5090, lo que encaja en flujos de previsualización creativa.
- Prototipado de storyboards animados: uso del pipeline text-to-video para convertir guiones en secuencias de vídeo preliminares antes de producción final.
- Vídeo condicionado por referencias visuales: el DiT Ref2VA junto con la torre de visión permite generar variaciones de vídeo a partir de imágenes de referencia, útil en diseño de producto o moda.
- Generación de vídeo con audio sincronizado: al incluir el DiT base text-to-video/audio, sirve para crear clips con pista de audio asociada (requiere el VAE de audio del repo original).
- Despliegue en clústeres multi-GPU: la variante TP4 con shards `rank0..3` está pensada para servir el modelo con tensor parallelism en 4 GPU, adecuada para equipos con infraestructura de inferencia dedicada.
- Despliegue en una sola GPU: la variante `base-fp8-tp1/` (20 GB) permite ejecutar el DiT en un único dispositivo con suficiente VRAM, útil para entornos de investigación con recursos limitados.
- Evaluación de cuantización FP8 en modelos de vídeo: los pesos incluyen métricas de error (2,6e-2 por tensor, L2 relativo ~1e-2 frente a referencia fp32), lo que facilita estudios de degradación por cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta métricas de inferencia y de error de cuantización:

| Metrica | Valor |
|---|---|
| Resolución de generación medida | 1344x768 |
| Tiempo de generación (text-to-video) | ~2,5 min a 20 pasos + FSampler |
| Hardware de la medición | 4 x RTX 5090 (TP4, backend Vulkan) |
| Error de cuantización por tensor | 2,6e-2 |
| Error L2 relativo (bloque DiT real vs referencia fp32) | ~1e-2 |

## Requisitos de hardware

- VRAM estimada: la variante TP1 del DiT ocupa 20 GB en disco; la variante TP4 se reparte en 4 shards de 44 GB totales. El conjunto completo del repositorio son 127,7 GB (incluye text encoder de 25 GB, Ref2VA de 44 GB, VAE de 4,6 GB y torre de visión de 1,2 GB).
- GPU recomendadas: la medición oficial usa 4 x RTX 5090 con backend Vulkan y tensor parallelism 4. El motor soporta también backend Neuron.
- ¿Cabe en GPU consumer? La variante TP1 (20 GB) es compatible con GPU consumer de gama alta con VRAM suficiente; la variante TP4 requiere varias GPU.
- Opciones de despliegue: exclusivamente el motor Minimax-neuron (backend Vulkan con KHR / NV cooperative matrix, y backend Neuron). No es compatible con vLLM, llama.cpp, Ollama, TGI ni diffusers de forma directa.
- Latencia y throughput: ~2,5 minutos por clip de 1344x768 a 20 pasos con FSampler en la configuración TP4 medida. No se reportan cifras de throughput para otras configuraciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con otros sistemas de generación de vídeo, y no se han encontrado datos de benchmarks que permitan una comparación rigurosa. Los datos de arquitectura, parámetros y contexto del modelo base tampoco están disponibles en esta información.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MiniMax-H3 FP8 (TP4) | no disponible | no disponible | MiniMax H3 Community License | Layouts de motor (no safetensors estándar) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Community License Agreement limita uso, reproducción y distribución al "Applicable Territory", que excluye la Unión Europea, el Reino Unido, la República de Corea y Estados Unidos. Esto afecta directamente a usuarios en España.
- Obligación de divulgación: el contenido generado debe identificarse como generado por máquina (Exhibit A, ítem 12 de la licencia).
- Política de uso aceptable (Exhibit A) que restringe determinados usos; debe revisarse antes de cualquier despliegue.
- No es un drop-in: los pesos usan layouts específicos del motor Minimax-neuron y no cargan en diffusers, vLLM, llama.cpp ni otras herramientas estándar.
- Componentes ausentes: el repositorio no incluye el VAE de audio, el encoder del VAE de vídeo de Ref2VA ni los configs de tokenizer, processor y scheduler; hay que tomarlos del repo original.
- Riesgo de alucinación y artefactos visuales: no se documentan evaluaciones de calidad perceptual ni de fidelidad al prompt.
- Sin información sobre sesgos, idiomas soportados ni comportamiento multilingüe.
- Sin datos de benchmarks estándar que permitan validar el rendimiento frente a alternativas.
- La cuantización FP8 introduce un error medido (2,6e-2 por tensor, L2 relativo ~1e-2), que puede afectar a la fidelidad en comparación con los pesos originales en bf16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cgg507/MiniMax-H3-FP8-TP4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia (archivo LICENSE en el repositorio): https://huggingface.co/cgg507/MiniMax-H3-FP8-TP4/blob/main/LICENSE
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
