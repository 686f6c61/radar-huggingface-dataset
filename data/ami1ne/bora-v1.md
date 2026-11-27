# Ami1ne/bora-v1

## Resumen

Bora V1 es un modelo de generacion de video de texto a video (text-to-video) de pequeno tamano desarrollado por el usuario Ami1ne bajo la serie @Codeically. Se trata de un Diffusion Transformer (DiT) con formulacion de flow matching que cuenta con 336 millones de parametros, dimension de 1024 y profundidad de 20 bloques. El modelo opera sobre los latentes congelados del VAE de Wan2.1, lo que le permite reutilizar un decodificador de video ya entrenado sin necesidad de entrenar su propio autoencoder.

El modelo genera clips de video de 256x256 pixeles a 8 fotogramas por segundo, procesando bloques de 4 fotogramas latentes con 1 fotograma de solapamiento y empleando 8 pasos de muestreo. Fue entrenado durante 50.000 pasos con un tamano de lote de 32 en una unica GPU A100 de 80 GB, sobre el dataset `Ami1ne/Bora` compuesto por clips de Pexels, Pixabay y NASA. El codificador de texto es google/t5-v1_1-base con una longitud maxima de 32 tokens.

Su relevancia radica en ser el modelo mas pequeno de la serie, lo que lo posiciona como una opcion de bajo coste computacional para experimentacion con generacion de video, prototipado rapido y despliegue en entornos con recursos limitados. La publicacion incluye no solo los pesos en formato EMA (bf16) sino tambien el estado completo de entrenamiento para reanudarlo, asi como el codigo de modelo, sampler, entrenamiento y dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching para video |
| Parametros totales | 336M (dim 1024, depth 20) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 tokens de texto (codificador T5-v1_1-base); bloques de 4 fotogramas latentes con 1 de solapamiento |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (EMA, bf16) y .pt (estado completo de entrenamiento) |

## Arquitectura y entrenamiento

Bora V1 emplea una arquitectura de Diffusion Transformer (DiT) con formulacion de flow matching, aplicada sobre los latentes congelados del VAE de Wan2.1. El modelo tiene 336 millones de parametros con una dimension de 1024 y 20 bloques de profundidad. La generacion se realiza por bloques de 4 fotogramas latentes con 1 fotograma de solapamiento entre bloques, a una resolucion de 256x256 y 8 fps, empleando 8 pasos de muestreo. El acondicionamiento textual se realiza mediante el codificador google/t5-v1_1-base con un maximo de 32 tokens.

El entrenamiento se llevo a cabo durante 50.000 pasos con un tamano de lote de 32 en una unica GPU A100 de 80 GB, sobre el dataset `Ami1ne/Bora`, compuesto por clips de Pexels, Pixabay y NASA. El repositorio incluye los pesos EMA (ema_step50000.safetensors en bf16), el estado completo de entrenamiento para reanudar (checkpoints/ckpt_last.pt), el codigo del modelo y sampler (bora_dit.py), el codigo de entrenamiento (bora_train.py), el dataset (bora_dataset.py) y el script de ejecucion (bora_run.py). Tambien se incluyen videos de muestra cada 2.000 pasos y curvas de entrenamiento y validacion. No se especifica en la informacion disponible si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video) a 256x256 y 8 fps.
- Generacion por bloques de 4 fotogramas latentes con solapamiento de 1 fotograma, lo que permite producir clips de duracion extendida mediante encadenamiento.
- Muestreo eficiente con solo 8 pasos de flow matching.
- Decodificacion de latentes mediante el VAE de Wan2.1 (`vae.decode(z * latents_std + latents_mean)`).
- Acondicionamiento textual con T5-v1_1-base (hasta 32 tokens).
- Reanudacion del entrenamiento a partir del checkpoint completo publicado.
- No se dispone de informacion sobre soporte de tool calling, agentes, vision de entrada, audio ni modo thinking.

## Casos de uso

- Prototipado rapido de pipelines text-to-video: con 336M de parametros y 8 pasos de muestreo, permite iterar sobre prompts y configuraciones en hardware modesto antes de escalar a modelos mayores de la serie.
- Generacion de clips de baja resolucion para storyboards: a 256x256 y 8 fps, resulta adecuado para previsualizar secuencias y validar ideas narrativas sin coste elevado.
- Investigacion en flow matching para video: el codigo de modelo, sampler y entrenamiento publicado permite estudiar y modificar la formulacion de flow matching sobre latentes de Wan2.1.
- Fine-tuning sobre dominios especificos: al incluir el estado completo de entrenamiento y los scripts de dataset y entrenamiento, se puede reanudar o adaptar el modelo a un corpus propio (por ejemplo, clips cientificos o de archivo).
- Experimentacion con decodificacion por bloques: el esquema de 4 fotogramas latentes con solapamiento de 1 permite investigar estrategias de continuidad temporal en videos generados.
- Educacion y divulgacion: el tamano reducido y la publicacion del codigo completo lo hacen util para explicar arquitecturas DiT y flow matching en cursos o talleres.
- Generacion de material de archivo sintetico de bajo coste: clips de olas, paisajes o escenas similares a los del dataset de entrenamiento (Pexels, Pixabay, NASA) para relleno en edicion o demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 336M de parametros en bf16, los pesos ocupan aproximadamente 0,67 GB; el VAE de Wan2.1 y el codificador T5-v1_1-base anaden requisitos adicionales no cuantificados en la informacion disponible.
- GPU recomendadas: el entrenamiento se realizo en una A100-80G; para inferencia, el tamano reducido del modelo sugiere que podria ejecutarse en GPUs de consumo, aunque no se confirma en la informacion disponible.
- Cabe en GPU de consumo: probablemente si, dado el tamano de 336M de parametros, pero no se especifica en la informacion disponible.
- Opciones de despliegue: el repositorio incluye el script `code/bora_run.py` para muestreo; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (y, al ser un modelo de difusion para video, estas herramientas no serian las habituales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Bora V1 | 336M | 32 tokens texto; 256x256, 8 fps | no disponible | Hugging Face (Ami1ne/bora-v1) |
| Wan2.1 (VAE usado) | no disponible | no disponible | no disponible | no disponible |
| Otros modelos de la serie @Codeically | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Resolucion limitada a 256x256 y 8 fps, adecuada para prototipos pero no para produccion de alta calidad.
- Longitud de contexto textual muy corta (32 tokens), lo que restringe la complejidad de los prompts.
- Entrenado sobre un dataset especifico (Pexels, Pixabay, NASA), por lo que puede generalizar mal a dominios alejados de esas fuentes.
- Riesgo de alucinacion visual y de artefactos temporales inherente a los modelos de difusion de video, especialmente con solo 8 pasos de muestreo.
- No se dispone de informacion sobre sesgos conocidos, idiomas soportados ni evaluaciones de seguridad.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Al ser un modelo de 336M de parametros, la fidelidad y coherencia temporal seran inferiores a las de modelos de video de mayor escala.
- No se han publicado benchmarks que permitan comparar su rendimiento de forma objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/Ami1ne/bora-v1
- Dataset de entrenamiento: `Ami1ne/Bora` (referenciado en la model card)
- Codigo incluido en el repo: `code/bora_dit.py`, `code/bora_train.py`, `code/bora_dataset.py`, `code/bora_run.py`
- VAE de decodificacion: Wan2.1-VAE (referenciado en la model card)
- Codificador de texto: google/t5-v1_1-base
