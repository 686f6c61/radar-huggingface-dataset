# iclr2027-7366/DiT-Reward-SD35-Large

## Resumen

DiT-Reward-SD35-Large es un modelo de recompensa (reward model) para evaluar la alineación entre una imagen y su prompt de texto. No genera imágenes: recibe un par imagen-prompt y devuelve una puntuación escalar que indica la preferencia predicha por el modelo. Está construido sobre el backbone de Stability AI Stable Diffusion 3.5 Large, reutilizando su transformer de difusión (DiT) y su VAE, y añade una cabeza MLP de recompensa entrenada específicamente para esta tarea.

El modelo lo publica el usuario anónimo `iclr2027-7366` como parte de una submission (Submission 7366), presumiblemente para revisión en ICLR 2027, y se distribuye como pesos derivados bajo la licencia Stability AI Community. Con 8.245 millones de parámetros y un repo de 16,5 GB en safetensors, está pensado para investigadores que necesitan un scorer de calidad imagen-texto para filtrado de datos, evaluación de modelos generativos o como señal de recompensa en pipelines de RLHF/DPO sobre modelos de difusión.

Su relevancia radica en que reutiliza un backbone de difusión de última generación (SD 3.5 Large) como extractor de características congelado para la tarea de preferencia, en lugar de entrenar un reward model desde cero. Esto permite aprovechar el conocimiento visual y multimodal ya presente en el transformer de difusión, con un coste de entrenamiento menor. La información pública disponible es limitada: no hay benchmarks publicados ni detalles sobre el dataset de entrenamiento más allá del checkpoint en el paso 9000.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) de SD 3.5 Large + cabeza MLP de recompensa |
| Parámetros totales | 8.245.634.788 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de los text encoders CLIP-L, CLIP-G y T5 del backbone) |
| Tipos de cuantización | no disponible (pesos en safetensors sin re-codificación; dtypes originales conservados) |
| Idiomas soportados | en |
| Licencia | stability-ai-community (pesos); código Python bajo MIT (`LICENSE-code`) |
| Formato de pesos | safetensors (shards sin re-codificación de tensores) |

## Arquitectura y entrenamiento

El modelo parte del backbone `stabilityai/stable-diffusion-3.5-large`, un transformer de difusión multimodal con text encoders CLIP-L, CLIP-G y T5. Sobre él se extraen características de los bloques cero-indexados `[15, 23, 28, 37]`, se agrupan (pooling) y se concatenan para alimentar una MLP de recompensa con arquitectura `1536 → 384 → 1`, activación GELU y dropout en tiempo de entrenamiento. El VAE del backbone se conserva y se usa con muestreo de la posterior original, y se aplica un coeficiente de ruido de flow-matching de 0.005 que se mantiene en inferencia.

El checkpoint liberado corresponde al paso 9000 de entrenamiento (`checkpoint_step: 9000`). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; la model card indica únicamente que se preserva la ruta forward original del scorer (muestreo del VAE, ruido de flow, encoding completo del prompt, hooks de características, pooling/normalización y cabeza de recompensa). Los text encoders CLIP-L, CLIP-G y T5 no forman parte del checkpoint de recompensa: se descargan del repositorio base oficial. El condicionamiento de texto real es obligatorio; no se permite un fallback silencioso solo-visión.

## Capacidades

- Puntuación de alineación imagen-texto: devuelve un escalar de recompensa por cada par imagen-prompt.
- Evaluación de preferencia dentro del propio modelo: puntuaciones más altas indican mayor preferencia predicha, pero no están calibradas contra otros reward models.
- Procesamiento de imágenes a 512×512 (resize bicúbico del lado corto a 512, center crop, RGB, normalización a [-1, 1]).
- Condicionamiento de texto real obligatorio mediante los encoders del backbone (CLIP-L, CLIP-G, T5).
- Soporte de inferencia por lotes (`batch_size`) y de entrada JSONL con pares imagen-prompt.
- Verificación de integridad de pesos mediante manifiesto SHA-256 (`--verify-hashes`).
- Rechazo de checkpoints incompletos o con formas inconsistentes y de pesos/puntuaciones no finitos.
- No soporta generación de imágenes, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un scorer.

## Casos de uso

- Filtrado de datasets de entrenamiento: puntuar pares imagen-texto de un corpus y descartar aquellos con baja recompensa para mejorar la calidad de datos en el entrenamiento de modelos de difusión.
- Evaluación de modelos generativos de imagen: usar el scorer como métrica automática de alineación prompt-imagen en lugar de (o junto a) CLIP score, aprovechando el backbone DiT de SD 3.5 Large.
- Señal de recompensa en RLHF/DPO para difusión: integrar las puntuaciones como reward en pipelines de optimización de políticas de generación de imágenes.
- Ranking de candidatos en generación: dado un prompt y varias imágenes generadas, ordenarlas por preferencia predicha para seleccionar la mejor salida.
- Control de calidad en producción de contenido visual: detectar desalineaciones entre el texto descriptivo y la imagen asociada en catálogos, anuncios o publicaciones.
- Investigación en reward models multimodales: el checkpoint permite reproducir y comparar arquitecturas de reward sobre backbones de difusión, con verificación de hashes y runtime documentado en `verification.json`.
- Auditoría de sesgos de preferencia: analizar cómo el modelo puntúa pares que difieren en atributos demográficos o estilísticos, con la cautela de que las puntuaciones no están calibradas entre modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la liberación del checkpoint no reclama ningún resultado de benchmark nuevo y que `verification.json` recoge únicamente el runtime probado y una verificación de inferencia pequeña, no una reevaluación completa de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del backbone y de la longitud de los prompts. La model card recomienda empezar con `batch_size=1`.
- El repo ocupa 16,5 GB en safetensors, por lo que cargar los pesos completos en FP16/BF16 requiere del orden de 16 GB solo para el checkpoint, más los text encoders descargados aparte y el VAE.
- GPU recomendadas: no especificadas. Por tamaño, se requiere al menos una GPU con 24 GB (RTX 3090/4090) para el checkpoint completo en precisión reducida, y A100/H100 para lotes mayores o mayor throughput.
- No se indica compatibilidad con GPUs de consumo de gama media; con cuantización no documentada, no se puede confirmar.
- Opciones de despliegue: el repo incluye `inference.py` (CLI y API programática `DiTReward`) con PyTorch y CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un reward model de este tipo).
- Latencia y throughput: no disponibles. La model card advierte que las puntuaciones no serán bit a bit idénticas entre ejecuciones independientes por el muestreo estocástico de latentes/ruido y los kernels de GPU; se recomienda fijar semilla y registrar batch size, orden de evaluación, dispositivo y versiones de dependencias.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros reward models imagen-texto ni datos de rendimiento que permitan una comparativa rigurosa.

## Limitaciones y advertencias

- No es un pipeline de generación de imágenes: solo puntúa pares imagen-prompt.
- Las puntuaciones no están calibradas entre distintos reward models; solo son comparables dentro de este modelo.
- Solo soporta inglés (`en`).
- Requiere condicionamiento de texto real; no hay fallback solo-visión.
- Entrada de imagen fija a 512×512 tras resize y center crop, lo que puede perder detalle en imágenes de alta resolución o de aspect ratio extremo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de preferencia entrenado sobre datos no especificados, puede heredar sesgos del backbone y del dataset de entrenamiento.
- Restricciones de licencia: los pesos son obras derivadas bajo Stability AI Community License, no una liberación Apache/MIT sin restricciones. El uso comercial está sujeto a los términos de `LICENSE.md`. El código Python tiene licencia MIT separada (`LICENSE-code`).
- Los text encoders CLIP-L, CLIP-G y T5 no están incluidos y deben descargarse del repositorio base oficial, aceptando sus condiciones de acceso y autenticándose.
- Reproducibilidad no bit a bit: el muestreo del VAE y el ruido de flow introducen estocasticidad; hay que fijar semilla y documentar el entorno.
- Modelo anónimo de submission: sin benchmarks publicados ni validación externa conocida; adecuado para investigación, con cautela para producción.
- El checkpoint corresponde al paso 9000 y no es uno de los checkpoints de ablación de ruido mencionados en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/iclr2027-7366/DiT-Reward-SD35-Large
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-large
- Licencia Stability AI Community: `LICENSE.md` en el repositorio
- Licencia del código (MIT): `LICENSE-code` en el repositorio
- Verificación de runtime: `verification.json` en el repositorio
- Procedencia del checkpoint: `checkpoint_provenance.json` en el repositorio
