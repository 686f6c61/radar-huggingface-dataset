# recoilme/sdxsv3

## Resumen

SDXSv3 es un modelo de generación de imágenes texto-a-imagen desarrollado por recoilme (Vadim Kulibaba) como continuación experimental de su proyecto SDXS. Se trata de un transformer de difusión de flujo único (single-stream DiT) con un bucle intermedio y compartición de pesos (weight-tied), diseñado para lograr una profundidad efectiva de 28 bloques con solo 15 bloques únicos, reduciendo así el número de parámetros a 2.16 mil millones. El modelo emplea un codificador de texto Qwen3.5-0.8B y un VAE simplevae con 16 canales latentes y factor de compresión 8.

El repositorio incluye la arquitectura completa, los scripts de entrenamiento y un smoke test finalizado sobre una única imagen, pero los pesos del transformer no están incluidos: se encuentran en inicialización aleatoria y no han sido entrenados. Por tanto, el modelo no es funcional en su estado actual; `generate.py` produce salida aleatoria. Su relevancia radica en la propuesta arquitectónica: un DiT con bucle y weight-tied que reduce parámetros manteniendo profundidad, una idea que podría interesar a investigadores en eficiencia de modelos generativos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Single-stream DiT con bucle medio y weight-tied (15 bloques únicos, 28 pasadas) |
| Parametros totales | 2.16 mil millones (transformer) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no texto) |
| Tipos de cuantizacion | No disponible (pesos sin entrenar, solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (según tags de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura sigue los bloques de construcción de Krea-2: RMSNorm con QK-norm, SwiGLU con ratio 8/3, atención con puerta sigmoide, modulación de bias ligera y RoPE axial 3D. El transformer tiene hidden size de 3328 (26 cabezas × 128, GQA 2:1) y una profundidad de 15 bloques únicos: 1 de entrada, 13 intermedios y 1 de salida. Los bloques intermedios se aplican dos veces (weight-tied), resultando en 28 pasadas hacia adelante. El texto se procesa con Qwen3.5-0.8B (hidden 1024) y se fusiona mediante un mecanismo text-fusion que proyecta a 3328. El VAE es simplevae con 16 canales latentes y factor 8.

El entrenamiento utiliza flow matching con predicción de velocidad, pérdida MSE, timestep shift de 5.0, cfg-dropout del 10%, AdamW8bit con lr 1e-4, bf16, gradient checkpointing y clip de gradiente 1.0. El dataset es de imágenes de mariposas con buckets de resolución (320-640). El smoke test se realizó con una sola imagen (448×640), 2000 pasos, batch 2, y muestra una mejora progresiva del PSNR en espacio de píxeles, alcanzando 35.3 dB en generación desde ruido puro al paso 1400. Sin embargo, los pesos finales no se han publicado.

## Capacidades

- El modelo no tiene pesos entrenados, por lo que no presenta capacidades funcionales en su estado actual.
- La arquitectura está diseñada para generación de imágenes texto-a-imagen mediante flow matching.
- Soporta resolución variable mediante buckets de tamaño (min_size/max_size/step).
- Incluye pipeline personalizado (texto → DiT → VAE) y scripts de inferencia.
- El smoke test demuestra capacidad de reconstrucción (desde 50% ruido) y generación (desde ruido puro) en una imagen de prueba, pero solo como validación del pipeline.
- No hay soporte para tool calling, agentes, visión multimodal ni otras capacidades más allá de la generación de imágenes.

## Casos de uso

No existen casos de uso prácticos en el estado actual, ya que el modelo no está entrenado. Los siguientes son escenarios potenciales si se completara el entrenamiento:

- Generación de imágenes a partir de prompts de texto: el pipeline completo permitiría crear imágenes de alta resolución con control fino mediante el codificador Qwen3.5.
- Reconstrucción de imágenes parcialmente ruidosas: el smoke test sugiere capacidad de denoising, útil para restauración o edición.
- Investigación en eficiencia de DiT: la arquitectura con bucle y weight-tied podría servir como banco de pruebas para reducir parámetros en modelos generativos.
- Prototipado de pipelines de difusión: los scripts de entrenamiento e inferencia son reutilizables para experimentos con datasets propios.
- Estudio de flow matching con shift de timestep: la receta de entrenamiento documentada permite reproducir experimentos.
- Desarrollo de modelos compactos para despliegue en entornos con recursos limitados, si se logra un entrenamiento exitoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (FID, CLIP score, etc.) en la información disponible. El único dato de rendimiento es el smoke test sobre una imagen:

| Paso | Loss | PSNR reconstrucción | PSNR generación |
|---|---|---|---|
| 200 | — | 16.6 | 13.7 |
| 600 | — | 25.0 | 31.1 |
| 1400 | — | 26.3 | 35.3 |
| 2000 | 0.012 | 25.1 | 31.4 |

Nota: el PSNR está calculado en espacio de píxeles (imágenes decodificadas), independiente del VAE. No hay comparación con otros modelos.

## Requisitos de hardware

- No hay datos de inferencia publicados, ya que el modelo no está entrenado.
- El tamaño del repositorio es de 2.3 GB, lo que sugiere que los pesos del transformer (2.16B en bf16) ocuparían aproximadamente 4.3 GB en memoria.
- Para un hipotético despliegue en inferencia, se estima que una GPU con al menos 8 GB de VRAM podría ser suficiente en cuantización de 8 bits, pero esto es especulativo.
- El smoke test se ejecutó con batch 2 y 2000 pasos, sin especificar la GPU utilizada.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp u Ollama; el pipeline es personalizado y requiere el código del repositorio.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos de generación de imágenes (p. ej., SDXL, SD3, Flux) en la información proporcionada. La arquitectura es experimental y no hay resultados de calidad de imagen que permitan una comparación objetiva.

## Limitaciones y advertencias

- El transformer no está entrenado: los pesos son aleatorios y el modelo no genera imágenes útiles.
- La licencia no está especificada, por lo que no se puede determinar si es apto para uso comercial.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas, al no haber un modelo funcional.
- El smoke test se realizó con una sola imagen y no valida la generalización.
- El repositorio incluye scripts de entrenamiento, pero el dataset de mariposas es limitado y no representa un caso de uso real.
- Para producción, se requiere un entrenamiento completo y evaluación rigurosa, además de aclarar la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/recoilme/sdxsv3
- Proyecto original SDXS: https://huggingface.co/recoilme/sdxs
- Perfil del autor: https://huggingface.co/recoilme
- GitHub del autor: https://github.com/recoilme
- Registro de entrenamiento (wandb): https://wandb.ai/recoilme/sdxsv3-smoke (según la model card)
