# Noname010101/media-extras

## Resumen

`media-extras` es un repositorio espejo (mirror) publicado por el usuario Noname010101 que agrupa los pesos auxiliares utilizados por una imagen de pod de generación de vídeo basada en ComfyUI, Wan 2.1, SVI 2.0 Pro, RIFE y Real-ESRGAN. No se trata de un modelo entrenado desde cero, sino de una recopilación de artefactos de inferencia: un modelo de difusión de vídeo text-to-video (Wan2.1-T2V-14B en fp8), un módulo VACE de control, un text encoder umt5-xxl, un VAE, dos LoRAs de SVI 2.0 Pro para image-to-video, una LoRA de destilación lightx2v, dos modelos de interpolación RIFE y dos modelos de superresolución Real-ESRGAN.

El propósito declarado es evitar dependencias de repositorios de terceros en el arranque de los pods: todos los ficheros son copias sin modificar de los originales, salvo el renombrado de la LoRA lightx2v para que coincida con el nombre que espera la imagen. Por tanto, su relevancia no está en capacidades nuevas de modelado, sino en la reproducibilidad y el empaquetado de un pipeline completo de generación de vídeo.

El dato de "parámetros totales" del repositorio (8.467.856.832, aproximadamente 8,5 mil millones) no corresponde a un único modelo: es la suma agregada de los tensores safetensors presentes en el repo, dominada por el text encoder umt5-xxl y el modelo T2V de 14B en fp8. El tamaño total del repositorio es de 41,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline heterogéneo: difusión de vídeo (Wan2.1 T2V 14B, VACE 14B), text encoder transformer (umt5-xxl), VAE (Wan2.1), LoRAs (SVI 2.0 Pro, lightx2v), redes de interpolación (RIFE 4.9) y superresolución (Real-ESRGAN x2/x4) |
| Parametros totales | 8.467.856.832 en safetensors (suma agregada del repo, no de un modelo único); el componente T2V principal es Wan2.1-T2V-14B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8_e4m3fn (T2V 14B, VACE 14B, umt5-xxl), bf16 (VAE), safetensors de precisión original para LoRAs; ficheros .pth para RIFE y Real-ESRGAN |
| Idiomas soportados | no disponible (el text encoder umt5-xxl es multilingüe, pero la model card no declara idiomas) |
| Licencia | mixta: Apache-2.0 (Wan2.1, umt5-xxl, lightx2v), MIT (SVI 2.0 Pro, RIFE), BSD-3-Clause (Real-ESRGAN); el repo declara `license: other` con `license_name: mixed-see-table` |
| Formato de pesos | safetensors (mayoría), .pth (RIFE, Real-ESRGAN) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo; agrega artefactos de inferencia de varios proyectos. El núcleo generativo es Wan2.1-T2V-14B, un modelo de difusión de vídeo en arquitectura transformer con 14 mil millones de parámetros, aquí distribuido en fp8_e4m3fn (14,86 GB). Se acompaña del módulo Wan2.1-VACE-14B (3,05 GB en fp8), que aporta control condicional sobre la generación, y del text encoder umt5-xxl en fp8 (6,73 GB), junto con el VAE de Wan2.1 en bf16 (253 MB).

Sobre esa base se aplican LoRAs: dos de SVI 2.0 Pro (high noise y low noise, 1,22 GB cada una, MIT) para image-to-video sobre Wan2.2-I2V-A14B, y la LoRA de destilación lightx2v rank 32 (316 MB, Apache-2.0) que reduce los pasos de muestreo y permite prescindir de CFG. El pipeline se completa con RIFE 4.9 (interpolación de fotogramas, MIT) y Real-ESRGAN x2plus/x4plus (superresolución, BSD-3-Clause). No hay información sobre datasets, número de tokens de entrenamiento ni procesos de RLHF/DPO, ya que el autor no entrena modelos.

## Capacidades

- Generación de vídeo text-to-video mediante Wan2.1-T2V-14B.
- Image-to-video con las LoRAs SVI 2.0 Pro (versión high noise y low noise).
- Control condicional de la generación con el módulo VACE 14B.
- Aceleración del muestreo mediante la LoRA de destilación lightx2v (cfg step distill).
- Interpolación de fotogramas con RIFE 4.9 para aumentar la tasa de fotogramas.
- Superresolución de vídeo o imagen con Real-ESRGAN x2 y x4.
- Codificación de texto multilingüe mediante umt5-xxl.
- Integración prevista con ComfyUI como backend de generación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Generación de clips de vídeo a partir de descripciones textuales: usar Wan2.1-T2V-14B con el text encoder umt5-xxl para producir secuencias cortas en un flujo ComfyUI, aprovechando la versión fp8 para reducir requisitos de VRAM.
- Animación de imágenes fijas: aplicar las LoRAs SVI 2.0 Pro sobre un modelo I2V de la familia Wan2.2 para convertir fotografías o ilustraciones en clips animados con control de ruido alto/bajo.
- Edición y control de vídeo existente: emplear el módulo VACE 14B para condicionar la generación sobre vídeo de entrada (pose, profundidad u otras guías) en tareas de reestilización o sustitución de contenido.
- Aceleración de pipelines de producción: incorporar la LoRA lightx2v rank 32 para reducir el número de pasos de muestreo y eliminar la necesidad de CFG, disminuyendo la latencia por clip.
- Postprocesado de vídeo generado: aplicar RIFE 4.9 para interpolar fotogramas y elevar la tasa de fps, y Real-ESRGAN x2/x4 para reescalar la resolución final antes de publicar.
- Reproducibilidad de entornos de inferencia: desplegar la imagen de pod con este mirror para garantizar que el arranque no dependa de repositorios de terceros y que las versiones de pesos coincidan con las esperadas por la imagen.
- Creación de contenido para redes sociales y previsualizaciones: generar clips cortos con estilización y upscaling en un flujo automatizado, siempre que se respeten las licencias upstream de cada componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el componente dominante es Wan2.1-T2V-14B en fp8 (14,86 GB de pesos), más el text encoder umt5-xxl fp8 (6,73 GB) y el VAE (253 MB). Un pipeline que cargue todo simultáneamente necesita del orden de 22-24 GB de VRAM solo para pesos; con overhead de activaciones y latents de vídeo, se recomienda 24 GB o más.
- El módulo VACE 14B fp8 añade 3,05 GB si se usa control condicional.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para el flujo T2V base; para VACE junto con T2V conviene 40 GB o más.
- En GPU de consumo: cabe en RTX 4090 (24 GB) para el flujo T2V en fp8; en GPUs de 16 GB o menos será necesario descargar componentes a CPU o usar cuantizaciones adicionales no incluidas en este repo.
- Opciones de despliegue: ComfyUI (entorno previsto por el autor), con soporte de carga de safetensors fp8; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| media-extras (este repo) | 8,5B agregados en safetensors; T2V 14B en fp8 | no disponible | Pipeline de vídeo (difusión + LoRAs + postproceso) | Mixta (Apache-2.0, MIT, BSD-3-Clause) | Hugging Face, mirror público |
| Wan-AI/Wan2.1-T2V-14B | 14B | no disponible | Difusión de vídeo T2V | Apache-2.0 | Hugging Face (upstream) |
| Kijai/WanVideo_comfy | no disponible | no disponible | Repositorio de pesos fp8/ComfyUI para Wan | Según componente | Hugging Face |
| vita-video-gen/svi-model | no disponible | no disponible | LoRAs I2V sobre Wan2.2 | MIT | Hugging Face |

La comparación relevante es con los repositorios upstream: `media-extras` no aporta pesos nuevos, sino una copia empaquetada con nombres normalizados para una imagen concreta. Frente a usar los repos originales por separado, la ventaja es la reproducibilidad; la desventaja es que no recibe actualizaciones independientes y queda atado a las versiones fijadas por el autor.

## Limitaciones y advertencias

- No es un modelo entrenado ni afinado: es un mirror de pesos de terceros; cualquier mejora o corrección debe venir de los repos upstream.
- La licencia es mixta y el repo declara `license: other` con `license_name: mixed-see-table`; el uso comercial exige revisar la licencia de cada fichero (Apache-2.0, MIT, BSD-3-Clause) y cumplir sus condiciones de atribución.
- El dato de "parámetros totales" del repo es una suma agregada y no debe interpretarse como el tamaño de un modelo único.
- No hay información sobre sesgos, alucinaciones ni limitaciones idiomáticas del pipeline; los riesgos propios de la generación de vídeo (contenido sintético engañoso, deepfakes, sesgos visuales) aplican a los modelos upstream.
- No se documentan requisitos de hardware, latencia ni benchmarks; cualquier estimación de rendimiento es aproximada.
- El renombrado de la LoRA lightx2v implica que el fichero no coincide nominalmente con el original; verificar el sha256 antes de usarlo en producción.
- El pipeline depende de ComfyUI y de la imagen de pod concreta; no se garantiza compatibilidad con otros orquestadores.
- No hay información sobre idiomas soportados ni sobre calidad multilingüe de las prompts.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Noname010101/media-extras
- Wan2.1 T2V 14B (upstream): https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Wan2.1 VACE 14B (upstream): https://huggingface.co/Wan-AI/Wan2.1-VACE-14B
- Pesos fp8 para ComfyUI: https://huggingface.co/Kijai/WanVideo_comfy
- LoRA lightx2v (upstream): https://huggingface.co/lightx2v/Wan2.1-Distill-Loras
- SVI 2.0 Pro LoRAs: https://huggingface.co/vita-video-gen/svi-model/tree/main/version-2.0
- umt5-xxl (upstream): https://huggingface.co/google/umt5-xxl
- RIFE (mirror): https://huggingface.co/marduk191/rife
- Practical-RIFE (upstream): https://github.com/hzwer/Practical-RIFE
- Real-ESRGAN (releases): https://github.com/xinntao/Real-ESRGAN/releases
