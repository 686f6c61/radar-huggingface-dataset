# ml-resources/Kandinsky-S2V-1.0-Pro-distill

## Resumen

Kandinsky S2V 1.0 Pro distilled es un modelo de generación de vídeo a partir de voz (speech-to-video) desarrollado por el equipo de Kandinsky (kandinskylab). Dado un único fotograma de referencia y una pista de audio con voz, el modelo anima a la persona —o personaje— de la imagen para que su habla y movimientos corporales se sincronicen con el audio. A diferencia de otros modelos de avatares parlantes, anima la figura completa, no solo la cabeza, y el audio actúa exclusivamente como condición: el modelo no sintetiza sonido.

La arquitectura es un transformer de difusión latente (DiT) con flow matching de 21.400 millones de parámetros y 60 bloques visuales, apoyado en Qwen2.5-Omni-7B para las condiciones de texto y audio, CLIP ViT-L/14 para el embedding de texto y el VAE 3D de HunyuanVideo para codificar y decodificar el vídeo. Esta variante es la destilada del modelo base de 50 pasos: emplea un muestreador pi-Flow de 16 pasos con classifier-free guidance destilado en los pesos, lo que elimina el pase negativo en inferencia y la hace aproximadamente 5 veces más rápida.

Es relevante ahora porque reduce el coste de generación de avatares realistas a partir de una sola fotografía a un régimen práctico: 41,5 segundos de cómputo por segundo de vídeo en una H100 (33,6 s con `torch.compile`), con salida a 25 fps en SD o HD y generación por fragmentos de 5 segundos que permiten discursos largos. La licencia MIT facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con flow matching y VAE 3D |
| Parámetros totales | 21,4 B (backbone DiT, 60 bloques visuales) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generación por fragmentos de 5 s / 125 frames) |
| Tipos de cuantización | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | no disponible (la model card menciona ejemplos multilingües sin listar idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, con time embedding y normalizaciones en fp32) |

## Arquitectura y entrenamiento

El modelo es una difusión latente con flow matching. El backbone generativo es un DiT de 21,400 millones de parámetros con 60 bloques visuales. Las condiciones entran por dos vías: Qwen2.5-Omni-7B aporta los hidden states del "Thinker" para el prompt de texto y las características del audio-tower (3584 dimensiones, 25 tokens por segundo) para la voz; CLIP ViT-L/14 aporta un embedding de texto con pooling. El vídeo se codifica y decodifica con el VAE 3D de HunyuanVideo.

La innovación principal está en la inyección del audio: la voz entra mediante adaptadores de cross-attention por capa en 18 de los bloques visuales, alineados por frame de modo que cada frame latente atiende únicamente a sus propios tokens de audio. La memoria FramePack, aplicada a tres escalas temporales, transporta el contexto de un fragmento al siguiente, lo que permite generar discursos largos en trozos de 5 segundos sin cortes perceptibles. La destilación integra el classifier-free guidance en los pesos y reduce el muestreo a 16 pasos con pi-Flow, eliminando el pase negativo. No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de vídeo de avatar a partir de una imagen de referencia y una pista de voz, animando la figura completa (cuerpo, no solo la cabeza).
- Sincronización labial y gestual con el audio de entrada, que actúa como condición y no como salida.
- Salida a 25 fps en resolución SD o HD (configuraciones `*_hd.yaml`), manteniendo la relación de aspecto del fotograma de referencia.
- Generación de vídeos largos mediante fragmentos de 5 segundos encadenados con memoria FramePack.
- Generalización a distintos estilos de referencia: la model card cita ejemplos con personajes de dibujos animados, animales y varios idiomas.
- Ejecución distribuida en varios GPUs de un mismo nodo para acelerar la generación.
- No incluye tool calling, function calling ni razonamiento multi-step; es un modelo generativo de vídeo, no un LLM de propósito general.
- No genera audio: requiere una pista de voz externa como entrada.

## Casos de uso

- Producción de avatares corporativos: a partir de una fotografía del portavoz y una locución grabada, se genera un vídeo de presentación sin necesidad de rodaje, con salida HD y sincronización labial.
- Localización de contenido formativo: se reutiliza el mismo fotograma de referencia con pistas de audio en distintos idiomas para generar versiones dobladas del mismo vídeo, manteniendo la identidad visual del presentador.
- Doblaje y posproducción audiovisual: el modelo anima al actor de la escena original con la voz del doblaje, reduciendo el coste frente a un rodaje adicional o a técnicas de retargeting manual.
- Asistentes virtuales con interfaz humana: integración en aplicaciones de atención al cliente donde un avatar responde con voz sintetizada en tiempo de generación por lotes.
- Creación de contenido para redes sociales: generación de vídeos cortos de personajes o mascotas a partir de una ilustración y una locución, gracias a la generalización a estilos no fotorrealistas.
- Prototipado en estudios de animación: previsualización rápida de escenas habladas con personajes dibujados antes de comprometer recursos de animación final.
- Investigación en generación condicionada por audio: el modelo sirve como referencia reproducible (licencia MIT, código público) para experimentar con alineación audio-vídeo y memoria temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card sí aporta métricas de eficiencia medidas en una H100 con FlashAttention 3, a 512×768 (1280×768 en HD), en ejecución en caliente de un fragmento de 125 frames (5 s):

| Configuración | Tiempo por 1 s de vídeo | Con `torch.compile` | 8 GPUs (solo muestreo DiT) | VRAM pico |
|---|---|---|---|---|
| `s2v_pro_distill.yaml` | 41,5 s | 33,6 s | 11,4 s | 46 GiB |
| `s2v_pro_distill_hd.yaml` | 137 s | 122 s | 29 s | 55 GiB |

La compilación con `torch.compile` añade unos 20 segundos iniciales por ejecución. El pico de memoria está dominado por la decodificación del VAE, no por el transformer; el tiling de la decodificación reduce sustancialmente el pico a costa de ligeras costuras entre teselas.

## Requisitos de hardware

- VRAM estimada: 46 GiB en SD y 55 GiB en HD como pico medido en H100; el checkpoint en bf16 ocupa 39,8 GiB, por lo que no cabe en GPUs de consumo de 24 GB sin cuantización, que no está documentada.
- GPU recomendadas: H100 (referencia de las mediciones); A100 de 80 GB es la alternativa natural por capacidad de memoria. Las configuraciones HD requieren al menos 55 GiB libres.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 con los pesos publicados; no se ofrecen variantes GGUF ni cuantizadas.
- Despliegue: el repositorio oficial `kandinskylab/kandinsky-s2v` con `uv` y el CLI `kandy-s2v`; soporta reparto entre varias GPUs de un nodo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas de LLM, no aplicables directamente a este pipeline de difusión).
- Latencia y throughput: 41,5 s de cómputo por segundo de vídeo en una H100 (SD), 137 s en HD; con 8 GPUs baja a 11,4 s y 29 s respectivamente para el muestreo del DiT.
- Dependencias externas descargadas en el primer uso: Qwen2.5-Omni-7B, CLIP ViT-L/14 y el VAE de HunyuanVideo, que añaden requisitos de memoria y descarga adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto / fragmentos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky S2V 1.0 Pro distilled | 21,4 B (DiT) | Speech-to-video con animación de figura completa | Fragmentos de 5 s, memoria FramePack | MIT | HuggingFace, código en GitHub |
| Kandinsky S2V 1.0 Pro (base) | 21,4 B (DiT) | Igual, muestreo de 50 pasos | Igual | MIT | HuggingFace |
| Otros modelos de avatares parlantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con la variante base del mismo modelo, que comparte pesos y arquitectura pero requiere 50 pasos de muestreo y un pase negativo de classifier-free guidance, siendo aproximadamente 5 veces más lenta. No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información consultada.

## Limitaciones y advertencias

- Riesgo de suplantación: el modelo anima a una persona real a partir de una sola fotografía con una voz que puede no ser la suya. La model card exige consentimiento del sujeto y prohíbe presentar el resultado como una grabación genuina.
- Sesgos: no se documentan análisis de sesgo demográfico, de género o de etnia en el conjunto de entrenamiento; al tratarse de generación de personas, es esperable que reproduzca sesgos de representación de los datos.
- Alucinación visual: como modelo generativo, puede producir artefactos, deformaciones anatómicas o inconsistencias entre fragmentos, especialmente en movimientos rápidos o encuadres poco habituales.
- Limitaciones de idioma: no se especifican los idiomas soportados; la sincronización labial depende de la calidad de las características de audio de Qwen2.5-Omni y puede degradarse en lenguas o acentos poco representados.
- Contexto temporal: la generación es por fragmentos de 5 segundos; la coherencia entre fragmentos depende de FramePack y puede mostrar deriva en vídeos muy largos.
- Licencia: MIT permite uso comercial, pero no exime de las obligaciones legales sobre derechos de imagen y voz de las personas retratadas.
- Producción: el pico de 46-55 GiB de VRAM y la ausencia de cuantizaciones publicadas limitan el despliegue a GPUs de datacenter; la decodificación del VAE domina el consumo de memoria y el tiling introduce costuras visibles.
- Dependencia de componentes externos (Qwen2.5-Omni, CLIP, VAE de HunyuanVideo) con sus propias licencias, que deben verificarse por separado para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ml-resources/Kandinsky-S2V-1.0-Pro-distill
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-S2V-1.0-Pro
- Paper (arXiv 2610.19290): https://arxiv.org/pdf/2610.19290
- Página del proyecto: https://kandinskyavatar.github.io
- Repositorio de código: https://github.com/kandinskylab/kandinsky-s2v
- Colección de modelos en HuggingFace: https://huggingface.co/collections/kandinskylab/kandinsky-s2v-10-6ab65ebe8f765b6dd9d706d7
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-S2V-1.0-Demo
- Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- CLIP ViT-L/14: https://huggingface.co/openai/clip-vit-large-patch14
- HunyuanVideo (VAE): https://huggingface.co/hunyuanvideo-community/HunyuanVideo
