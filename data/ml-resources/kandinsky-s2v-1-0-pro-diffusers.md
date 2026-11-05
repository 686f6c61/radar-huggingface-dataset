# ml-resources/Kandinsky-S2V-1.0-Pro-Diffusers

## Resumen

Kandinsky S2V 1.0 Pro es un modelo generativo de vídeo de tipo speech-to-video (S2V) desarrollado por el equipo de Kandinsky (kandinskylab). Su función es animar la figura completa de una persona a partir de una única imagen de referencia y una pista de audio de voz: el modelo no genera sonido, sino que utiliza la locución como condición para producir un vídeo de avatar sincronizado con el habla. A diferencia de aproximaciones centradas solo en el rostro, anima el cuerpo entero del sujeto presente en el frame de referencia.

El modelo se distribuye en formato Diffusers como un pipeline modular compuesto por un transformer 3D de gran tamaño (39,8 GiB), un VAE basado en `AutoencoderKLHunyuanVideo`, un text encoder principal derivado de `Qwen2_5OmniThinkerForConditionalGeneration` (16,6 GiB) y un segundo text encoder CLIP. El conjunto suma aproximadamente 21.358 millones de parámetros y ocupa 62,1 GB en el repositorio.

Es relevante por su enfoque de generación por chunks con memoria FramePack, que permite producir vídeos de duración arbitraria a partir de locuciones largas manteniendo coherencia entre fragmentos, y por publicarse bajo licencia MIT con pesos abiertos, lo que facilita su integración en pipelines de producción con Diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión 3D (`KandinskyS2VTransformer3DModel`) con VAE `AutoencoderKLHunyuanVideo`, flow matching Euler y memoria FramePack entre chunks |
| Parametros totales | 21.358.745.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; genera 125 frames por chunk a 25 fps (5 s) con memoria entre chunks |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card usa bfloat16) |
| Idiomas soportados | no disponible (condicionado por audio de voz; el text encoder es Qwen2.5-Omni Thinker y CLIP) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato Diffusers modular) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de difusión para vídeo basado en transformer 3D, entrenado con flow matching Euler y muestreo con 50 pasos y classifier-free guidance de 3.0 (implementado como componente `guider` del pipeline modular). El modelo recibe como entradas una imagen de referencia y una forma de onda mono a 16 kHz, y produce vídeo a 25 fps en buckets de 512 resolución, seleccionando el bucket según la relación de aspecto del frame de referencia. La generación se realiza por chunks de 125 frames (5 segundos), donde cada chunk se condiciona en el anterior mediante memoria FramePack, lo que permite extender la duración del vídeo más allá de un único fragmento.

El pipeline integra dos codificadores de texto: un `Qwen2_5OmniThinkerForConditionalGeneration` exportado sin el módulo Talker (16,6 GiB) y un `CLIPTextModel` sin torre de visión (0,5 GiB). El VAE es `AutoencoderKLHunyuanVideo` (0,9 GiB). El transformer principal ocupa 39,8 GiB. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de vídeo speech-to-video: anima la figura completa de una persona a partir de una imagen de referencia y una pista de audio.
- Sincronización labial y gestual condicionada por el audio de entrada.
- Generación de vídeo de duración extendida mediante chunks encadenados con memoria FramePack.
- Selección automática de resolución (buckets de 512) según la relación de aspecto de la imagen de referencia.
- Salida a 25 fps con audio original incorporado al vídeo final.
- Integración con Diffusers mediante pipeline modular (`ModularPipeline`).
- Soporte de offload automático a CPU mediante `ComponentsManager` para ajustar el modelo a GPUs de 80 GB.
- No genera audio: el audio es únicamente una condición de entrada.
- Capacidades multilingües: no disponible (depende del audio, no del texto).

## Casos de uso

- Generación de avatares para vídeo corporativo: a partir de un retrato del ponente y una locución grabada, producir un vídeo de presentación animado con sincronización labial, útil para formación interna o comunicación asíncrona.
- Doblaje y localización de contenido: animar la figura de un presentador con una pista de voz en otro idioma, manteniendo el frame de referencia original.
- Creación de contenido para redes sociales: generar clips de 5 segundos o más a partir de una foto y un audio corto, aprovechando el encadenamiento por chunks para piezas de mayor duración.
- Prototipado de asistentes virtuales con cara visible: integrar el modelo en un pipeline que reciba la voz sintetizada de un TTS y produzca el vídeo del avatar en tiempo de generación por lotes.
- Producción de vídeos educativos o divulgativos: animar ilustraciones o retratos de expertos con narraciones pregrabadas, reduciendo la necesidad de grabación en estudio.
- Investigación en generación de vídeo condicionada por audio: usar los pesos abiertos (MIT) para experimentar con variantes de condicionamiento, memoria entre chunks o nuevos datasets de avatares.
- Postproducción y efectos: generar planos de un personaje hablando a partir de una still y una locución para insertar en montajes, con control de la resolución mediante buckets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en bfloat16 no cabe en una GPU de 80 GB con todos los componentes residentes; el pico con offload se sitúa en torno a 50 GiB según la model card.
- GPU recomendadas: A100 80 GB, H100 80 GB o superiores; con `ComponentsManager` y `enable_auto_cpu_offload` (margen de reserva de 40 GiB) puede ejecutarse en GPUs de 80 GB.
- Cabe en GPU de consumo: no disponible; por el tamaño del transformer (39,8 GiB) y del text encoder (16,6 GiB), no es viable en GPUs consumer de 24 GB sin cuantización agresiva no documentada.
- Opciones de despliegue: Diffusers con pipeline modular (`ModularPipeline`), `ComponentsManager` para offload automático a CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kandinsky S2V 1.0 Pro | 21.358 M | 125 frames por chunk a 25 fps, extensible con FramePack | MIT | Pesos abiertos en HuggingFace (Diffusers y layout nativo) |
| Alternativas speech-to-video | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de modelos comparables de la misma categoría (speech-to-video con animación de figura completa) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo anima a una persona real a partir de una fotografía con una voz que puede no ser la suya; existe riesgo claro de suplantación de identidad y deepfakes. La model card exige consentimiento del sujeto y prohíbe presentar el resultado como grabación genuina.
- No genera audio: si se necesita voz sintética, debe combinarse con un sistema TTS externo.
- El pipeline no está incluido en una versión publicada de Diffusers; requiere la API modular y puede cambiar.
- El modelo completo no cabe en 80 GB sin offload; el despliegue en producción exige gestión cuidadosa de memoria.
- Riesgo de alucinación visual y artefactos en gestos, manos o regiones fuera del encuadre del frame de referencia.
- Sesgos demográficos y de apariencia no documentados en la información disponible.
- Idiomas soportados no especificados; el comportamiento multilingüe depende del audio de entrada.
- La licencia MIT permite uso comercial, pero las obligaciones éticas y legales sobre el consentimiento del sujeto retratado recaen en el usuario.
- No se documentan tipos de cuantización oficiales; el uso de cuantizaciones no oficiales puede degradar la calidad.

## Enlaces

- HuggingFace (Diffusers): https://huggingface.co/ml-resources/Kandinsky-S2V-1.0-Pro-Diffusers
- Pesos en layout nativo: https://huggingface.co/kandinskylab/Kandinsky-S2V-1.0-Pro
- Paper (arXiv): https://arxiv.org/pdf/2610.19290
- Página del proyecto: https://kandinskyavatar.github.io
- Repositorio GitHub: https://github.com/kandinskylab/kandinsky-s2v
- Colección en HuggingFace: https://huggingface.co/collections/kandinskylab/kandinsky-s2v-10-6ab65ebe8f765b6dd9d706d7
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-S2V-1.0-Demo
