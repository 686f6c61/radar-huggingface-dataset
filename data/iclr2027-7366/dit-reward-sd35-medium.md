# iclr2027-7366/DiT-Reward-SD35-Medium

## Resumen

DiT-Reward-SD35-Medium es un modelo de recompensa (reward model) para puntuar pares imagen-texto, desarrollado de forma anonima para la Submission 7366 de ICLR 2027. No es un pipeline de generacion de imagenes: recibe una imagen y su prompt textual y devuelve una puntuacion escalar que estima la preferencia predicha dentro de este modelo concreto. Se construye sobre el backbone de difusion `stabilityai/stable-diffusion-3.5-medium` y anade una cabeza MLP de recompensa sobre caracteristicas intermedias del transformer de difusion.

La relevancia practica esta en el ajuste fino de modelos generativos: un reward model permite implementar RLHF, DPO o filtrado por puntuacion en pipelines de sintesis de imagen, evaluando la alineacion entre prompt e imagen generada. Con 2.558.465.892 parametros y un repositorio de 5,1 GB en safetensors, se distribuye como pesos derivados bajo la Stability AI Community License, no como una release Apache o MIT.

El checkpoint corresponde al paso 19000 de entrenamiento y mantiene el coeficiente de ruido de flow-matching de 0,005 en inferencia. La release es anonima, sin estados de optimizador ni logs de entrenamiento, y no reclama ningun resultado de benchmark nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) sobre SD3.5-Medium con cabeza MLP de recompensa |
| Parametros totales | 2.558.465.892 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionado por los encoders CLIP-L, CLIP-G y T5 del backbone) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | stability-ai-community (pesos); codigo Python bajo MIT |
| Formato de pesos | safetensors (shards sin recodificacion tensorial) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de Stable Diffusion 3.5 Medium, un transformer de difusion con flow matching. Sobre las caracteristicas de los bloques zero-indexados `[11, 17, 23]` del transformer se aplica pooling y concatenacion, y la representacion resultante pasa por una MLP de recompensa con la forma 1024 → 256 → 1, con activacion GELU y dropout en tiempo de entrenamiento. La inferencia conserva el muestreo de la posterior del VAE, el ruido de flow-matching con coeficiente 0,005, la codificacion completa del prompt y los hooks de caracteristicas originales.

El preprocesado de imagen es fijo: redimensionado bicubico del lado corto a 512, recorte central a 512×512, RGB y normalizacion a [-1, 1]. Se exige condicionamiento textual real, sin fallback silencioso a solo vision. Los encoders de texto CLIP-L, CLIP-G y T5 no forman parte del checkpoint de recompensa y deben descargarse del repositorio oficial del modelo base. El checkpoint liberado corresponde al paso 19000 y no incluye estados de optimizador, argumentos de entrenamiento originales, logs ni credenciales; solo se elimino metadatos identificativos de cabecera, conservando nombres, dtypes, formas y bytes de los tensores.

## Capacidades

- Puntuacion escalar de pares imagen-texto: asigna un reward que estima la preferencia dentro de este modelo.
- Evaluacion de alineacion prompt-imagen en pipelines de generacion con SD3.5-Medium.
- Procesamiento por lotes mediante CLI (`--input-jsonl`, `--batch-size`) y API programatica (`DiTReward.score`).
- Verificacion de integridad de shards con `--verify-hashes` contra un manifiesto SHA-256.
- Rechazo de checkpoints incompletos, con formas incompatibles o pesos/puntuaciones no finitos.
- Compatibilidad opcional con `txt_seq_lens` de Qwen en la ruta de inferencia.
- Soporte exclusivo de ingles como idioma de prompt.
- No soporta generacion de imagenes, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Filtrado de salidas en generacion de imagenes: puntuar N candidatas generadas por SD3.5-Medium para un mismo prompt y seleccionar la de mayor reward antes de servirla en produccion.
- RLHF sobre modelos de difusion: usar la puntuacion como senal de recompensa en un bucle de ajuste con politicas de optimizacion (PPO u offline RL) para alinear el generador con preferencias humanas.
- Construccion de datasets de preferencias: puntuar pares imagen-texto a gran escala por lotes para etiquetar candidatas y entrenar modelos de preferencia o DPO.
- Control de calidad en pipelines de contenido: detectar desalineaciones entre prompt e imagen en sistemas de generacion automatizada antes de la publicacion.
- Evaluacion de checkpoints intermedios: comparar variantes de un generador midiendo el reward medio sobre un conjunto fijo de prompts e imagenes, con semilla y orden de evaluacion registrados.
- Investigacion en reward models para difusion: analizar el efecto de caracteristicas de bloques intermedios (`[11, 17, 23]`) y del coeficiente de ruido en la calidad de la senal de preferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la release del checkpoint no reclama ningun resultado de benchmark nuevo; `verification.json` contiene unicamente el runtime probado y una verificacion de inferencia a pequena escala, no una reevaluacion completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del backbone y de la longitud de los prompts. La model card recomienda empezar con batch size 1.
- GPU recomendadas: no disponible; se requiere una GPU compatible con CUDA y PyTorch/torchvision.
- Encoders de texto adicionales: CLIP-L, CLIP-G y T5 se descargan aparte desde el repositorio oficial del modelo base, con sus propios requisitos de acceso y autenticacion.
- Despliegue: script `inference.py` incluido en el repositorio, con CLI y API Python; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Las puntuaciones no son necesariamente identicas bit a bit entre ejecuciones por el muestreo estocastico de latentes/ruido y los kernels de GPU; se recomienda fijar semilla y registrar batch size, orden de evaluacion, dispositivo y versiones de dependencias.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros reward models comparables ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Las puntuaciones no estan calibradas entre distintos reward models: solo son comparables dentro de este modelo.
- El modelo solo soporta ingles como idioma de prompt.
- Requiere condicionamiento textual real; no admite evaluacion solo con imagen.
- Riesgo de sesgo heredado del backbone SD3.5-Medium y de los datos de preferencia usados en el entrenamiento, no documentados en la release.
- Riesgo de alucinacion en la senal de preferencia: puntuaciones altas no garantizan calidad objetiva de la imagen.
- Licencia restrictiva: los pesos son obras derivadas bajo Stability AI Community License, no una release Apache/MIT; el uso comercial esta sujeto a los terminos de `LICENSE.md` y `NOTICE`.
- Release anonima sin estados de optimizador, logs ni argumentos de entrenamiento, lo que limita la reproducibilidad completa del ajuste.
- No es un pipeline de generacion: no puede usarse para sintetizar imagenes.
- Resultados no deterministas entre ejecuciones por el muestreo estocastico y los kernels de GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iclr2027-7366/DiT-Reward-SD35-Medium
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Licencia Stability AI Community: https://huggingface.co/iclr2027-7366/DiT-Reward-SD35-Medium/blob/main/LICENSE.md
- Codigo de inferencia (MIT): https://huggingface.co/iclr2027-7366/DiT-Reward-SD35-Medium/blob/main/LICENSE-code
- Verificacion de runtime: https://huggingface.co/iclr2027-7366/DiT-Reward-SD35-Medium/blob/main/verification.json
