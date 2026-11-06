# ml-resources/Kandinsky-S2V-1.0-Lite

## Resumen

Kandinsky S2V 1.0 Lite es un modelo de generacion de video condicionada por voz (speech-to-video) desarrollado por el equipo de Kandinsky. Dado un unico fotograma de referencia y una pista de audio de voz, el modelo anima a la persona (o personaje, o animal) de la imagen para que su movimiento labial y corporal se sincronice con el habla proporcionada. A diferencia de los modelos de talking-head clasicos, anima la figura completa, no solo la cabeza. El audio actua exclusivamente como condicion: el modelo no sintetiza sonido.

Tecnicamente es un modelo de difusion latente con flow matching. El backbone generativo es un DiT de 2.3B parametros con 32 bloques visuales, que recibe las condiciones de dos codificadores: Qwen2.5-Omni-7B (estados ocultos del Thinker para el prompt de texto y caracteristicas del audio-tower, 3584 dimensiones a 25 tokens/s, para la voz) y CLIP ViT-L/14 (embedding de texto agrupado). El video se codifica y decodifica con el VAE 3D de HunyuanVideo.

Su relevancia practica radica en que permite generar avatares parlantes realistas a partir de una sola fotografia, con salida a 25 fps en resolucion SD y generacion por trozos de 5 segundos para discursos largos. Existe ademas una variante destilada (`Kandinsky-S2V-1.0-Lite-distill`) que reduce la muestracion de 50 a 16 pasos. La licencia MIT facilita su adopcion comercial, aunque el modelo arrastra las condiciones de uso de sus componentes auxiliares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con flow matching, 32 bloques visuales; condiciones via Qwen2.5-Omni-7B y CLIP ViT-L/14; VAE 3D de HunyuanVideo |
| Parametros totales | 2.3B (backbone DiT); el pipeline completo incluye Qwen2.5-Omni-7B y CLIP ViT-L/14 como codificadores |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; generacion por trozos de 5 segundos (125 frames a 25 fps) con memoria FramePack a tres escalas temporales |
| Tipos de cuantizacion | no disponible; checkpoint publicado en bf16 (time embedding y normalizaciones en fp32) |
| Idiomas soportados | no disponible (la model card menciona ejemplos en otros idiomas en la pagina del proyecto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model/kandinsky_s2v_lite.safetensors`, 4.2 GiB, bf16) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusion latente con flow matching. El backbone es un DiT de 2.3B parametros con 32 bloques visuales. La voz entra mediante adaptadores de cross-attention por capa en 13 de los bloques visuales, alineados por frame: cada frame latente atiende unicamente a sus propios tokens de audio. Esto garantiza la sincronizacion labial. La memoria FramePack, operativa a tres escalas temporales, transporta contexto de un trozo al siguiente, lo que permite generar discursos largos sin cortes. El texto se condiciona por dos vias: los estados ocultos del Thinker de Qwen2.5-Omni-7B y un embedding agrupado de CLIP ViT-L/14.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La model card tampoco describe innovaciones adicionales mas alla del esquema de cross-attention alineada por frame y la memoria FramePack. Se sabe que existe una destilacion pi-Flow del checkpoint (variante `-distill`) que reduce la muestracion de 50 a 16 pasos, lo que indica que el modelo base opera con 50 pasos de inferencia.

## Capacidades

- Generacion de video de avatar a partir de una imagen de referencia y una pista de voz, animando la figura completa (cuerpo y cabeza), no solo el rostro.
- Sincronizacion labial condicionada por audio, con atencion alineada por frame entre frames latentes y tokens de audio.
- Generalizacion a personajes de dibujos animados y animales, segun los ejemplos de la pagina del proyecto.
- Soporte de multiples idiomas en el audio de entrada (los ejemplos multilingues se muestran en la pagina del proyecto; no se enumeran los idiomas).
- Generacion de video largo mediante trozos de 5 segundos con memoria FramePack entre trozos.
- Salida a 25 fps en resolucion SD, respetando la relacion de aspecto del fotograma de referencia.
- Condicionamiento por prompt de texto (via Qwen2.5-Omni-7B y CLIP), ademas del audio.
- No genera audio: la pista de voz es solo una condicion de entrada.

## Casos de uso

- Generacion de avatares corporativos para formacion interna: a partir de una fotografia del ponente y una locucion grabada, se produce un video explicativo sin necesidad de regrabar al sujeto, con la ventaja de animar el cuerpo completo.
- Localizacion de contenido formativo: se reutiliza un unico fotograma de referencia y se sustituye la pista de audio por locuciones en otros idiomas, generando versiones multilingues del mismo video.
- Prototipado de presentadores virtuales para e-learning: el modelo permite iterar rapidamente sobre guiones y locuciones antes de producir el video final, con generacion por trozos de 5 segundos.
- Marketing y redes sociales: creacion de videos cortos con un personaje o mascota (los ejemplos incluyen animales y dibujos animados) a partir de una sola imagen y un audio promocional.
- Doblaje de contenido existente: dado un fotograma del presentador original y una nueva pista de voz, se regenera el video con la nueva locucion, manteniendo la identidad visual del sujeto.
- Investigacion en animacion facial y sincronizacion audio-video: la arquitectura con cross-attention alineada por frame y memoria FramePack sirve como base para experimentos academicos sobre condicionamiento temporal.
- Demos interactivas y aplicaciones de accesibilidad: generacion de videos de avatares que acompanan a contenido de audio para personas con discapacidad auditiva, combinando el video generado con subtitulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como FID, LSE-D, LSE-C o metricas de sincronizacion labial) en la informacion disponible. La model card unicamente aporta datos de rendimiento de inferencia en una H100 con FlashAttention 3, a 512x768, en una ejecucion en caliente de un trozo (125 frames, 5 s):

| Configuracion | Tiempo por 1 s de video | Con `compile` | 4 GPUs (solo muestreo DiT) | VRAM pico |
|---|---|---|---|---|
| `s2v_lite.yaml` | 44 s | 35 s | 14 s | 57 GiB |

La VRAM pico esta dominada por la decodificacion del VAE, no por el transformer; el uso de tiling en la decodificacion reduce sustancialmente el pico a costa de ligeras costuras entre teselas. La compilacion con `compile.strategy: torch` (desactivada por defecto) anade unos 20 segundos de compilacion inicial.

## Requisitos de hardware

- VRAM estimada para inferencia: 57 GiB de pico en la configuracion medida (512x768, H100, FlashAttention 3). La decodificacion del VAE domina el consumo; el tiling del decode reduce el pico de forma sustancial.
- GPU recomendadas: H100 (configuracion de referencia de la model card). Para repartir la generacion entre varias GPU de un mismo nodo, el repositorio documenta el modo multigpu; con 4 GPU el muestreo del DiT baja a 14 s por segundo de video.
- Cabe en GPU de consumo: no disponible como dato confirmado. Con 57 GiB de pico, no cabe en GPU de consumo de 24 GB sin tecnicas adicionales de reduccion de memoria (tiling del VAE, offloading), que la model card no cuantifica.
- Opciones de despliegue: el codigo oficial esta en `kandinskylab/kandinsky-s2v`, con gestion via `uv` y un comando `kandy-s2v generate` que recibe `--config`, `--audio`, `--image` y `--out`. La primera ejecucion descarga el checkpoint, los codificadores (Qwen2.5-Omni-7B, CLIP ViT-L/14) y el VAE (HunyuanVideo) desde el Hub. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de video).
- Latencia y throughput: 44 s por segundo de video sin compilar, 35 s con `compile`, 14 s con 4 GPU (solo DiT). La variante destilada reduce la muestracion de 50 a 16 pasos, lo que previsiblemente disminuye el tiempo de generacion, aunque no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos comparables (parametros, contexto, rendimiento, licencia) para construir una comparativa fiable. La model card solo referencia la variante destilada del propio modelo:

| Modelo | Parametros | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kandinsky-S2V-1.0-Lite | 2.3B (DiT) | 50 | MIT | Hugging Face (ml-resources), GitHub |
| Kandinsky-S2V-1.0-Lite-distill | 2.3B (DiT) | 16 | no disponible | Hugging Face (kandinskylab) |

Comparativa con alternativas de la misma categoria: no disponible.

## Limitaciones y advertencias

- El modelo anima a una persona real a partir de una unica fotografia y con una voz que puede no ser la suya; existe riesgo claro de suplantacion de identidad y de desinformacion. La model card exige consentimiento del sujeto para animar su imagen y prohibe presentar el resultado como una grabacion genuina.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede producir artefactos, deformaciones o movimientos no fieles al sujeto de referencia, especialmente en poses o expresiones no vistas.
- El audio es solo condicion: no se genera sonido, por lo que cualquier uso requiere aportar la pista de voz por separado.
- Resolucion limitada a SD y 25 fps; la generacion por trozos de 5 segundos puede introducir inconsistencias entre trozos pese a la memoria FramePack.
- La decodificacion del VAE domina el consumo de memoria (57 GiB de pico); el tiling reduce el pico pero introduce costuras visibles.
- Licencia MIT para el checkpoint, pero los componentes auxiliares (Qwen2.5-Omni-7B, CLIP ViT-L/14, VAE de HunyuanVideo) se descargan de sus propios repositorios y estan sujetos a sus respectivas licencias, que deben verificarse antes de un uso comercial.
- No se documentan sesgos demograficos ni cobertura idiomatica concreta; la evaluacion de sesgos queda pendiente.
- El repositorio `ml-resources/Kandinsky-S2V-1.0-Lite` no es el repositorio oficial del autor (kandinskylab); conviene verificar la procedencia de los pesos antes de usarlos en produccion.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/ml-resources/Kandinsky-S2V-1.0-Lite
- Paper (arXiv): https://arxiv.org/pdf/2610.19290
- Pagina del proyecto: https://kandinskyavatar.github.io
- Codigo en GitHub: https://github.com/kandinskylab/kandinsky-s2v
- Coleccion de modelos en Hugging Face: https://huggingface.co/collections/kandinskylab/kandinsky-s2v-10-6ab65ebe8f765b6dd9d706d7
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-S2V-1.0-Demo
- Variante destilada: https://huggingface.co/kandinskylab/Kandinsky-S2V-1.0-Lite-distill
- Qwen2.5-Omni-7B (codificador de texto y audio): https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- CLIP ViT-L/14 (codificador de texto): https://huggingface.co/openai/clip-vit-large-patch14
- VAE 3D de HunyuanVideo: https://huggingface.co/hunyuanvideo-community/HunyuanVideo
