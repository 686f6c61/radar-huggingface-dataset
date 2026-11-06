# cpral/HomeIMG-50M

## Resumen

IMG-50M es un modelo de generación de imágenes texto-a-imagen de 50,4 millones de parámetros desarrollado por el usuario cpral y publicado bajo licencia Apache 2.0. Se trata de una reproducción desde cero de la arquitectura AuroraIMG2-50M-Preview, un modelo minúsculo que genera imágenes de 256x256 píxeles y que fue entrenado íntegramente en 8 GPU de consumo (RTX 3090 Ti). El modelo combina un denoiser de tipo diffusion transformer (DiT) con flow matching rectificado, un codificador de texto de 12,6 millones de parámetros entrenado conjuntamente y un decodificador congelado de FLUX.2-small.

La relevancia de este modelo no reside en su rendimiento absoluto, sino en su carácter demostrativo: prueba que es posible entrenar un pipeline completo de difusión texto-a-imagen, con codificador de texto propio, en hardware de consumo y en unas 5 horas, usando técnicas de entrenamiento distribuido de bajo ancho de banda como DiLoCo con el optimizador Muon. El modelo trabaja exclusivamente en inglés, con un vocabulario BPE de 8.000 tokens y un contexto de texto truncado a 62 tokens.

El modelo está pensado para investigación y experimentación en arquitecturas de difusión compactas, no para producción. Su huella de 0,5 GB y su licencia permisiva lo hacen accesible para pruebas rápidas, aunque su calidad de generación está limitada por el tamaño y la resolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con flow matching rectificado; denoiser de 8 bloques, anchura 640, 10 cabezas (dim 64), sin patchify (un token por píxel del latente 16x16); self-attention con RoPE 2D y QK-norm, cross-attention a tokens de texto y MLP SwiGLU; condicionamiento de timestep con adaLN-single de PixArt |
| Parametros totales | 50.433.664 (denoiser 50,4M + codificador de texto 12,6M; el decodificador FLUX.2-small está congelado y no se cuenta) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Texto truncado a 62 tokens (+BOS/EOS); latente de imagen 128x16x16 |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente bf16/fp16; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers, pipeline personalizado AuroraIMG2Pipeline) |

## Arquitectura y entrenamiento

El denoiser es un transformer de difusión de 50,4M de parámetros que opera sobre latentes de 16x16 píxeles empaquetados en 2x2 (128 canales x 16 x 16), normalizados con BatchNorm. Cada bloque combina self-attention con RoPE 2D y QK-norm, cross-attention hacia los tokens del codificador de texto y un MLP SwiGLU. El timestep de difusión se inyecta mediante la técnica adaLN-single de PixArt con puertas inicializadas a cero. El codificador de texto es un transformer pre-norm de 6 capas, anchura 384, GQA (6 cabezas de consulta, 2 de clave/valor), RoPE 1D, SwiGLU y RMSNorm, con vocabulario BPE byte-level de 8.000 tokens, entrenado conjuntamente con el denoiser. La decodificación final usa el decodificador congelado FLUX.2-small.

El entrenamiento usa flujo rectificado con objetivo de velocidad (`z_t = (1−t)·x + t·ε`, target `ε − x`, MSE, t ~ logit-normal(0,1)), con un 10% de captions sustituidos por un prompt nulo aprendido para classifier-free guidance. Se añade una pérdida auxiliar de modelado de lenguaje enmascarado sobre el codificador de texto (peso 0,05, cada 4 pasos, 15% de enmascaramiento). Los datos son QLNI/FLUX-Reason-6M-flux2-latents: 5,88M imágenes de entrenamiento (subconjuntos de estética, imaginativo y texto), con una caption aleatoria por imagen y paso. El presupuesto es de 247.805 pasos con batch 256 (63,4M muestras, ~10,8 épocas). El entrenamiento se ejecutó en 8 RTX 3090 Ti en bf16 con `torch.compile`, a ~3.400 imágenes/s durante ~5 horas.

La innovación principal está en el optimizador: Muon sobre las matrices de pesos ocultas (lr 3,5e-3, momentum Nesterov 0,95, 5 pasos de Newton-Schulz) y AdamW para embeddings, proyecciones, MLP temporal y normas. Se usa MuLoCo (DiLoCo con optimizador interno Muon): cada GPU entrena su réplica sin comunicación de gradientes y cada 16 pasos se promedian las 8 réplicas mediante all-reduce en bf16 de los deltas. Esto multiplica por ~3,7 el rendimiento frente a DDP en PCIe 3.0 x4 (~930 img/s a ~3.400 img/s). Los pesos publicados son WSM (media uniforme de los últimos 4 checkpoints, cubriendo el 12% final del entrenamiento), con EMA de 0,9995 por paso.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución 256x256 a partir de prompts en inglés.
- Comprensión de prompts descriptivos cortos (hasta 62 tokens) con escenas, objetos, estilos y texto simple en la imagen.
- Control de generación mediante semilla, pasos de Euler (50 en los ejemplos) y escala CFG (3,0 en los ejemplos).
- Codificador de texto propio entrenado desde cero, no dependiente de CLIP/T5 externos.
- Compatibilidad con el pipeline `AuroraIMG2Pipeline` de diffusers (mismos nombres de parámetros que AuroraIMG2-50M-Preview).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Investigación en arquitecturas de difusión compactas: el modelo sirve como banco de pruebas reproducible para estudiar DiT minúsculos, flow matching y entrenamiento distribuido de bajo ancho de banda con MuLoCo/Muon, gracias a su código y receta de entrenamiento documentados.
- Docencia y formación: su tamaño (0,5 GB) y su licencia Apache 2.0 permiten desplegarlo en portátiles o entornos de aula para explicar el funcionamiento interno de un pipeline texto-a-imagen completo, incluido el codificador de texto.
- Prototipado rápido de ideas visuales: generar bocetos de 256x256 a partir de descripciones cortas en inglés para validar conceptos antes de recurrir a modelos grandes.
- Pruebas de integración con diffusers: validar pipelines personalizados (`AuroraIMG2Pipeline`) y flujos de carga de pesos en entornos de CI sin coste de GPU significativo.
- Experimentos de ablación: comparar variantes de entrenamiento (EMA vs WSM vs pesos finales) sobre la misma arquitectura, ya que el autor publica las curvas de validación.
- Generación de datasets sintéticos a pequeña escala para tareas de visión (clasificación, detección) donde la resolución 256x256 sea suficiente.
- Benchmarking de hardware de consumo: medir throughput y latencia de inferencia de difusión en GPU de gama media sin necesidad de grandes VRAM.

## Benchmarks y rendimiento

El autor publica únicamente pérdida de validación (velocity MSE) sobre 4.096 imágenes de validación, comparando con el modelo de referencia AuroraIMG2-50M-Preview:

| Modelo / pesos | val/loss (menor es mejor) |
|---|---|
| AuroraIMG2-50M-Preview (pesos publicados, EMA, cosine decay) | 0,6929 |
| IMG-50M (WSM, media de últimos 12% checkpoints) | 0,7044 |
| IMG-50M (pesos EMA) | 0,7030 |
| IMG-50M (pesos regulares en el último paso) | 0,7105 |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU, HumanEval, GSM8K) en la información disponible. El autor atribuye la mayor parte de la diferencia de ~0,01 frente a Aurora a que este usa decaimiento coseno de la tasa de aprendizaje hasta cero, mientras que IMG-50M usa tasa constante y promedia checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 50,4M de parámetros del denoiser más 12,6M del codificador de texto en bf16, los pesos ocupan del orden de 130 MB, más el decodificador FLUX.2-small congelado (tamaño no especificado en la información disponible). En la práctica, cabe holgadamente en cualquier GPU con 8 GB o más.
- GPU recomendadas: RTX 3090 Ti (la usada en entrenamiento), RTX 4090, A100, H100; cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más (RTX 3060/4060 en adelante); incluso GPUs con menos VRAM podrían ejecutarlo con precisión reducida.
- Opciones de despliegue: diffusers con el pipeline personalizado `AuroraIMG2Pipeline` (requiere `custom_code` y confianza en el repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de este tipo.
- Latencia y throughput estimados: no disponible para inferencia; en entrenamiento se alcanzaron ~3.400 imágenes/s con batch 256 en 8 RTX 3090 Ti. La inferencia con 50 pasos de Euler y CFG 3,0 implica 50 evaluaciones del denoiser por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IMG-50M (este) | 50,4M denoiser + 12,6M texto | 256x256 | 62 tokens | Apache 2.0 | Hugging Face (diffusers, custom code) |
| AuroraIMG2-50M-Preview | 50M (misma arquitectura) | 256x256 | 62 tokens | No disponible en la información | Hugging Face (AuroraAI-Research) |
| FLUX.2-small (decodificador) | No disponible | No disponible | No disponible | No disponible en la información | Hugging Face (black-forest-labs) |

La comparación relevante es con AuroraIMG2-50M-Preview, del que IMG-50M es una reproducción con la misma arquitectura y nombres de parámetros, pero distinto entrenamiento (MuLoCo/Muon, tasa constante, WSM). Aurora obtiene mejor pérdida de validación (0,6929 frente a 0,7030-0,7044) gracias al decaimiento coseno. No se dispone de datos de benchmarks estándar para ninguno de los dos en la información proporcionada, por lo que no es posible comparar calidad perceptual (FID, CLIP score) de forma rigurosa.

## Limitaciones y advertencias

- Resolución muy baja (256x256): no apta para producción que requiera imágenes de alta calidad o detalle fino.
- Contexto de texto muy corto (62 tokens): prompts largos o complejos se truncan, lo que limita la fidelidad semántica.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas; los prompts en castellano probablemente producen resultados degradados.
- Riesgo de alucinación visual y artefactos: al ser un modelo minúsculo entrenado con ~10,8 épocas, la coherencia de escenas complejas, el texto en imagen y las relaciones espaciales son limitadas.
- Sesgos: entrenado sobre QLNI/FLUX-Reason-6M-flux2-latents, un dataset derivado de FLUX; puede heredar sesgos de representación de ese corpus (no documentados en la información disponible).
- Requiere `trust_remote_code` o revisión del código personalizado (`AuroraIMG2Pipeline`) antes de cargarlo, lo que implica un riesgo de seguridad en entornos de producción.
- Licencia Apache 2.0 permite uso comercial, pero el decodificador FLUX.2-small congelado puede tener su propia licencia; conviene verificar los términos de black-forest-labs antes de uso comercial.
- No es un modelo de propósito general: no soporta tool calling, agentes ni otras modalidades; su uso previsto es investigación y experimentación.
- La pérdida de validación no garantiza calidad perceptual; no se han publicado métricas como FID o CLIP score.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/cpral/HomeIMG-50M
- Modelo de referencia AuroraIMG2-50M-Preview: https://huggingface.co/AuroraAI-Research/AuroraIMG2-50M-Preview
- Decodificador FLUX.2-small: https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
- Dataset de entrenamiento: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Paper MuLoCo (DiLoCo con Muon): https://arxiv.org/abs/2505.23725
- Paper DiLoCo: https://arxiv.org/abs/2311.08105
- Paper WSM (Warmup-Stable-Merge): https://arxiv.org/abs/2507.17634
- Blog del optimizador Muon: https://kellerjordan.github.io/posts/muon/
