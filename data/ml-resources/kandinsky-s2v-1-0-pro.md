# ml-resources/Kandinsky-S2V-1.0-Pro

## Resumen

Kandinsky S2V 1.0 Pro es un modelo de generacion de video condicionado por voz (speech-to-video) que produce un video de avatar a partir de una unica imagen de referencia y una pista de audio de habla. A diferencia de los modelos de talking head, anima la figura completa y no solo la cabeza. El audio actua exclusivamente como condicion: el modelo no sintetiza sonido, sino que mueve a la persona de la imagen de referencia para que sincronice con la locucion proporcionada.

El modelo lo publica el ecosistema Kandinsky (kandinskylab) bajo licencia MIT. Su nucleo generativo es un transformer de difusion (DiT) de 21,4B parametros con 60 bloques visuales, entrenado con difusion latente y flow matching. Las condiciones las aportan dos codificadores externos: Qwen2.5-Omni-7B (estados ocultos del Thinker para el prompt de texto y caracteristicas del audio-tower de 3584 dimensiones a 25 tokens/s para el habla) y CLIP ViT-L/14 (embedding de texto agrupado). El video se codifica y decodifica con el VAE 3D de HunyuanVideo.

Es relevante porque cubre un caso practico (avatares animados por voz) con generalizacion declarada a varios idiomas, personajes de dibujos animados y animales, y soporte de video largo mediante generacion por fragmentos de 5 segundos con memoria FramePack en tres escalas temporales. El checkpoint ocupa 39,8 GiB en bf16 y su repo asciende a 42,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (transformer de difusion) con difusion latente y flow matching; 60 bloques visuales; adaptadores de cross-attention por capa en 18 bloques para el audio; memoria FramePack en tres escalas temporales |
| Parametros totales | 21,4B (backbone DiT); el repo incluye ademas Qwen2.5-Omni-7B, CLIP ViT-L/14 y el VAE 3D de HunyuanVideo como componentes externos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generacion por fragmentos de 5 s / 125 frames con memoria entre fragmentos) |
| Tipos de cuantizacion | no disponible; pesos publicados en bf16 (time embedding y normalizaciones en fp32) |
| Idiomas soportados | no disponible; la model card menciona ejemplos en otros idiomas en la pagina del proyecto |
| Licencia | MIT |
| Formato de pesos | safetensors (`model/kandinsky_s2v_pro.safetensors`, 39,8 GiB) |

## Arquitectura y entrenamiento

El pipeline es difusion latente con flow matching. Un DiT de 21,4B parametros y 60 bloques visuales actua como backbone generativo. La condicion de habla se inyecta mediante adaptadores de cross-attention por capa en 18 de los bloques visuales, alineados por frame: cada frame latente atiende unicamente a sus propios tokens de audio. Las caracteristicas de audio provienen del audio-tower de Qwen2.5-Omni-7B (3584 dimensiones, 25 tokens/s) y los estados ocultos del Thinker del mismo modelo aportan la condicion de texto; CLIP ViT-L/14 anade un embedding de texto agrupado. El VAE 3D de HunyuanVideo codifica y decodifica el video.

Para video largo, el modelo genera en fragmentos de 5 segundos (125 frames) y mantiene la coherencia entre fragmentos mediante memoria FramePack en tres escalas temporales. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Existe una variante derivada, `Kandinsky-S2V-1.0-Pro-distill`, obtenida por destilacion pi-Flow, que reduce la generacion de 50 a 16 pasos.

## Capacidades

- Generacion de video de avatar a partir de una imagen de referencia y una pista de habla, animando la figura completa.
- Sincronizacion labial y gestual inducida por el audio, con el habla como condicion (no genera audio).
- Generalizacion declarada a personajes de dibujos animados, animales y varios idiomas.
- Generacion de video largo por fragmentos de 5 s con memoria temporal entre fragmentos.
- Salida a 25 fps en SD o en HD mediante las configuraciones `*_hd.yaml`, respetando la relacion de aspecto de la imagen de referencia.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explicito.
- Capacidad multilingue: no cuantificada en la informacion disponible.

## Casos de uso

- Produccion de avatares corporativos: a partir de un retrato del portavoz y una locucion grabada, se genera un video de presentacion sin rodaje adicional, aprovechando la animacion de la figura completa.
- Localizacion de contenido formativo: se reutiliza una unica imagen de referencia con pistas de audio en distintos idiomas (la model card menciona ejemplos multilingues) para generar versiones dobladas del mismo video.
- Prototipado de personajes animados: con personajes de dibujos animados o animales como referencia, se generan animaciones habladas para pruebas de concepto de series o videojuegos.
- Videos explicativos de larga duracion: la generacion por fragmentos de 5 s con memoria FramePack permite cubrir locuciones extensas manteniendo la coherencia del avatar.
- Contenido para redes y marketing: generacion a 25 fps en SD para iteracion rapida y en HD para publicacion final, con la relacion de aspecto de la imagen original.
- Investigacion en generacion condicionada por audio: el diseno de adaptadores de cross-attention alineados por frame y la memoria FramePack sirven como base reproducible (licencia MIT) para experimentos de speech-to-video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de inferencia en una H100 con FlashAttention 3, a 512×768 (1280×768 en HD), en ejecucion en caliente de un fragmento de 125 frames (5 s):

| Configuracion | Tiempo por 1 s de video | Con `compile` | 8 GPUs (solo muestreo DiT) | VRAM pico |
|---|---|---|---|---|
| `s2v_pro.yaml` | 189 s | 152 s | 32 s | 46 GiB |
| `s2v_pro_hd.yaml` | 773 s | 678 s | 114 s | 55 GiB |

La compilacion anade unos 20 s una sola vez al inicio de la ejecucion. El pico de memoria lo domina la decodificacion del VAE mas que el transformer; el tileado de la decodificacion reduce sustancialmente el pico a costa de costuras tenues entre tiles.

## Requisitos de hardware

- VRAM estimada: 46 GiB en SD y 55 GiB en HD en una H100 con FlashAttention 3; el pico lo domina la decodificacion del VAE.
- GPU recomendadas: H100 (referencia medida). No se documentan medidas en A100 ni en RTX 4090.
- GPU de consumo: no cabe en GPU de consumo convencionales segun los picos declarados; no se documenta ninguna configuracion que quepa en 24 GB.
- Despliegue: el codigo oficial esta en `kandinskylab/kandinsky-s2v` (gestionado con `uv`, comando `kandy-s2v generate`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Multi-GPU: el repositorio describe como repartir una generacion entre las GPUs de un mismo nodo; con 8 GPUs el muestreo del DiT baja a 32 s por segundo de video en SD y 114 s en HD.
- Latencia: 189 s de computo por segundo de video en SD con una H100 (152 s con `compile`); 773 s por segundo de video en HD (678 s con `compile`).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de speech-to-video (parametros, contexto, rendimiento o licencia) que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo anima a una persona real a partir de una sola fotografia con una voz que puede no ser la suya; la model card exige consentimiento del sujeto y prohibe presentar el resultado como una grabacion genuina.
- Riesgo de suplantacion de identidad y desinformacion si se usa sin control sobre la imagen de referencia y el audio.
- El audio es solo condicion: no genera sonido; la calidad final depende de la pista de habla suministrada.
- La generacion es lenta (189 s de computo por segundo de video en SD en H100) y exige 46-55 GiB de VRAM, lo que limita su uso interactivo.
- La decodificacion del VAE domina el consumo de memoria; el tileado reduce el pico pero introduce costuras visibles.
- No se documentan sesgos especificos, composicion del dataset de entrenamiento ni evaluaciones cuantitativas de fidelidad o sincronizacion.
- Cobertura de idiomas no cuantificada; la model card solo menciona ejemplos multilingues sin detallar cuales.
- Licencia MIT: permite uso comercial, pero no exime de las obligaciones legales sobre derechos de imagen y voz de las personas retratadas.
- El repo no incluye los codificadores ni el VAE; se descargan de sus repositorios en la primera ejecucion, lo que anade dependencias externas al despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/ml-resources/Kandinsky-S2V-1.0-Pro
- Variante destilada: https://huggingface.co/kandinskylab/Kandinsky-S2V-1.0-Pro-distill
- Paper (arXiv): https://arxiv.org/pdf/2610.19290
- Pagina del proyecto: https://kandinskyavatar.github.io
- Codigo (GitHub): https://github.com/kandinskylab/kandinsky-s2v
- Coleccion en HuggingFace: https://huggingface.co/collections/kandinskylab/kandinsky-s2v-10-6ab65ebe8f765b6dd9d706d7
- Demo: https://huggingface.co/spaces/kandinskylab/Kandinsky-S2V-1.0-Demo
- Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- CLIP ViT-L/14: https://huggingface.co/openai/clip-vit-large-patch14
- HunyuanVideo (VAE): https://huggingface.co/hunyuanvideo-community/HunyuanVideo
