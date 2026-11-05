# ml-resources/Kandinsky-S2V-1.0-Lite-distill

## Resumen

Kandinsky S2V 1.0 Lite distilled es un modelo de generación de vídeo a partir de habla (speech-to-video) orientado a la creación de avatares animados. Dado un fotograma de referencia y una pista de audio con voz, el modelo anima la figura completa —no solo la cabeza— para que su movimiento labial y gestual se sincronice con el habla de entrada. Lo desarrolla el equipo de Kandinsky (kandinskylab), y esta variante concreta es la versión destilada del modelo base de 50 pasos.

Técnicamente es un modelo de difusión latente con flow matching construido sobre un backbone DiT de 2,3 mil millones de parámetros con 32 bloques visuales. Las condiciones provienen de Qwen2.5-Omni-7B (estados ocultos del Thinker para el texto y características de la torre de audio para el habla) y de CLIP ViT-L/14 para el embedding de texto agrupado; el vídeo se codifica y decodifica con el VAE 3D de HunyuanVideo. La innovación principal de esta variante es la destilación del sampler pi-Flow a 16 pasos con classifier-free guidance integrada en los pesos, lo que elimina el pase negativo en inferencia y la hace aproximadamente 5 veces más rápida que el modelo base.

Su relevancia radica en que acerca la generación de avatares parlantes de calidad a un régimen de inferencia práctico (8,7 s por segundo de vídeo en una H100, 7,1 s con `torch.compile`), con licencia MIT y un único checkpoint de 4,2 GiB en bf16. El audio actúa únicamente como condición: el modelo no genera sonido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente con flow matching; backbone DiT de 32 bloques visuales |
| Parámetros totales | 2,3B (backbone DiT); el pipeline completo incluye además Qwen2.5-Omni-7B, CLIP ViT-L/14 y el VAE 3D de HunyuanVideo |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; generación en fragmentos de 5 segundos (125 fotogramas) con memoria FramePack a tres escalas temporales |
| Tipos de cuantización | no disponible; checkpoint publicado en bf16 (time embedding y normalizaciones en fp32) |
| Idiomas soportados | no disponible (la model card menciona ejemplos multilingües en la página del proyecto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model/kandinsky_s2v_lite_distill.safetensors`, 4,2 GiB) |

## Arquitectura y entrenamiento

El pipeline es una difusión latente con flow matching. El backbone generativo es un transformer de difusión (DiT) de 2,3B parámetros con 32 bloques visuales. El habla se inyecta mediante adaptadores de atención cruzada por capa en 13 de los bloques visuales, alineados por fotograma, de modo que cada fotograma latente atiende únicamente a sus propios tokens de audio. La memoria FramePack, a tres escalas temporales, transporta contexto de un fragmento al siguiente, lo que permite generar discursos largos en bloques de 5 segundos.

Las condiciones se obtienen de dos codificadores: Qwen2.5-Omni-7B aporta los estados ocultos del Thinker para el prompt de texto y las características de la torre de audio (3584 dimensiones, 25 tokens por segundo) para el habla; CLIP ViT-L/14 aporta un embedding de texto agrupado. El vídeo se codifica y decodifica con el VAE 3D de HunyuanVideo. Esta variante destilada emplea el sampler pi-Flow a 16 pasos con classifier-free guidance destilada en los pesos, por lo que no se ejecuta pase negativo en inferencia. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de vídeo de avatar a partir de un fotograma de referencia y una pista de habla, animando la figura completa (cuerpo y gesto), no solo la cabeza.
- Sincronización labial y gestual condicionada por el audio de entrada.
- Generación de vídeo largo mediante fragmentos de 5 segundos encadenados con memoria FramePack.
- Salida a 25 fps en resolución SD, respetando la relación de aspecto del fotograma de referencia.
- Generalización a personajes de dibujos animados y animales, según los ejemplos de la página del proyecto.
- Soporte de múltiples idiomas en el audio de entrada (ejemplos multilingües referenciados en la página del proyecto).
- No genera audio: el habla es solo una condición.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.

## Casos de uso

- Generación de avatares corporativos para formación: a partir de un retrato del ponente y una locución grabada, el modelo produce vídeos explicativos con sincronización labial, sin necesidad de regrabar al presentador.
- Localización de vídeo formativo a otros idiomas: manteniendo el mismo fotograma de referencia, se sustituye la pista de audio por la versión doblada y se regenera el vídeo con el nuevo habla, aprovechando el soporte multilingüe mencionado.
- Prototipado rápido de personajes animados: para estudios de animación que quieran previsualizar un personaje a partir de un único diseño y una prueba de voz antes de invertir en animación manual.
- Contenido para redes sociales y marketing: generación de clips cortos de un portavoz a partir de una foto y un guion locutado, con la ventaja de los 8,7 s por segundo de vídeo en H100 y la posibilidad de dividir la generación entre varias GPU.
- Asistentes virtuales con presencia visual: integración en interfaces conversacionales donde se requiera una cara animada que hable, usando el modelo como etapa de renderizado tras un TTS externo.
- Investigación en generación condicionada por audio: el diseño con adaptadores de atención cruzada alineados por fotograma y memoria FramePack sirve como base para experimentos sobre sincronización audio-vídeo y coherencia temporal en vídeo largo.
- Pruebas de accesibilidad y doblaje: generar versiones animadas de un mismo sujeto con distintas pistas de voz para evaluar comprensión en distintos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card sí proporciona métricas de eficiencia en una H100 con FlashAttention 3, a 512×768, en ejecución en caliente de un fragmento (125 fotogramas, 5 s):

| Configuración | Tiempo por 1 s de vídeo | Con `compile` | 4 GPU | VRAM pico |
|---|---|---|---|---|
| `s2v_lite_distill.yaml` | 8,7 s | 7,1 s | 3,8 s | 57 GiB |

La memoria pico está dominada por la decodificación del VAE más que por el transformer; el tileado de la decodificación reduce sustancialmente el pico a costa de ligeras costuras entre teselas. La compilación añade unos 20 s una sola vez al inicio de la ejecución.

## Requisitos de hardware

- VRAM estimada: 57 GiB de pico en la configuración medida (512×768, un fragmento de 5 s); el tileado de la decodificación del VAE reduce el pico de forma sustancial.
- GPU recomendadas: H100 para la configuración de referencia; se contempla el reparto de la generación entre las GPU de un mismo nodo (4 GPU reportadas para el muestreo del DiT).
- GPU de consumo: no disponible; los 57 GiB de pico medidos exceden la VRAM de las GPU de consumo habituales, y no se documenta una configuración cuantizada que quepa en ellas.
- Despliegue: el código oficial está en el repositorio `kandinskylab/kandinsky-s2v`, con gestión de dependencias mediante `uv` y el comando `kandy-s2v generate`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Dependencias descargadas en el primer uso: Qwen2.5-Omni-7B, CLIP ViT-L/14 y el VAE 3D de HunyuanVideo desde sus respectivos repositorios del Hub.
- Latencia y throughput: 8,7 s por segundo de vídeo (7,1 s con `torch.compile`, 3,8 s con 4 GPU para el muestreo del DiT); aproximadamente 5 veces más rápido que el modelo base de 50 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / fragmentos | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kandinsky S2V 1.0 Lite distilled (este) | 2,3B (DiT) | Fragmentos de 5 s con memoria FramePack | MIT | HuggingFace + GitHub + demo | 16 pasos, CFG destilada, ~5x más rápido que el base |
| Kandinsky S2V 1.0 Lite | 2,3B (DiT) | Fragmentos de 5 s con memoria FramePack | no disponible en la información | HuggingFace (`kandinskylab/Kandinsky-S2V-1.0-Lite`) | Modelo base de 50 pasos con CFG |
| Otras alternativas de speech-to-video | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Riesgo de suplantación: el modelo anima a una persona real a partir de una sola fotografía con una voz que puede no ser la suya. La model card exige consentimiento del sujeto para animar el fotograma de referencia y prohíbe presentar el resultado como una grabación genuina.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al condicionarse por un fotograma de referencia, reproduce la apariencia y el contexto de esa imagen.
- Alucinación visual: como modelo generativo, puede producir artefactos de movimiento, gestos o expresiones no presentes en la referencia; no se documentan métricas de fidelidad.
- Limitaciones de resolución: salida a 25 fps en SD, sujeta a la relación de aspecto del fotograma de referencia; no se documenta soporte de alta resolución.
- Coherencia en vídeo largo: la generación por fragmentos de 5 s con memoria FramePack puede introducir derivas entre fragmentos; no se cuantifica.
- Coste de hardware: 57 GiB de VRAM pico en la configuración de referencia, lo que excluye su ejecución en GPU de consumo sin estrategias de tileado o reparto no documentadas en detalle.
- Idiomas: no se especifica la lista de idiomas soportados; el rendimiento multilingüe solo se ilustra con ejemplos.
- Licencia MIT: permite uso comercial, pero la responsabilidad sobre el consentimiento y el uso indebido de la imagen recae en el usuario.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de terceros aún sin validación comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ml-resources/Kandinsky-S2V-1.0-Lite-distill
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-S2V-1.0-Lite
- Colección de modelos: https://huggingface.co/collections/kandinskylab/kandinsky-s2v-10-6ab65ebe8f765b6dd9d706d7
- Paper (arXiv): https://arxiv.org/pdf/2610.19290
- Página del proyecto: https://kandinskyavatar.github.io
- Repositorio de código: https://github.com/kandinskylab/kandinsky-s2v
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-S2V-1.0-Demo
- Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- CLIP ViT-L/14: https://huggingface.co/openai/clip-vit-large-patch14
- HunyuanVideo (VAE): https://huggingface.co/hunyuanvideo-community/HunyuanVideo
