# ml-resources/Kandinsky-S2V-1.0-Pro-distill-Diffusers

## Resumen

Kandinsky S2V 1.0 Pro-distill es un modelo de generacion de video condicionada por voz (speech-to-video) desarrollado por el equipo de Kandinsky (kandinskylab). Dado un fotograma de referencia con una persona y una pista de audio de voz, el modelo anima la figura completa —no solo la cabeza— para que los movimientos labiales y corporales se sincronicen con el habla proporcionada. El audio actua como condicion, no como salida: el modelo no sintetiza sonido, sino que genera el video que acompana a una locucion existente.

Esta version concreta es el checkpoint "Pro" destilado, empaquetado en formato Diffusers como pipeline modular. El bundle pesa 62,1 GB e incluye un transformer 3D de aproximadamente 39,8 GiB, un VAE basado en `AutoencoderKLHunyuanVideo`, un text encoder `Qwen2_5OmniThinkerForConditionalGeneration` (16,6 GiB) y un segundo encoder CLIP. Los pesos suman 21.359.793.984 parametros segun los safetensors del repositorio.

La relevancia actual del modelo radica en su enfoque de animacion de cuerpo completo con memoria temporal entre fragmentos (FramePack), lo que permite generar videos de duracion arbitraria a partir de locuciones largas, manteniendo coherencia entre chunks de 125 fotogramas (5 segundos a 25 fps). La destilacion pi-Flow con 16 pasos y la guia integrada en los pesos reducen el coste de inferencia frente a un modelo no destilado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D (`KandinskyS2VTransformer3DModel`) con VAE `AutoencoderKLHunyuanVideo`, text encoders Qwen2.5-Omni Thinker y CLIP, scheduler pi-Flow |
| Parametros totales | 21.359.793.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generacion por chunks de 125 fotogramas, con memoria FramePack entre chunks) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato Diffusers modular) |

## Arquitectura y entrenamiento

El modelo es un pipeline de difusion para video compuesto por varios modulos: un transformer 3D que constituye el nucleo generativo (39,8 GiB), un VAE de HunyuanVideo para codificar y decodificar el espacio visual (0,9 GiB), un text encoder basado en Qwen2.5-Omni Thinker (16,6 GiB, exportado sin el Talker del checkpoint Omni completo) y un segundo encoder CLIP sin torre de vision (0,5 GiB). El scheduler es `PiflowScheduler` y el pipeline se distribuye como pipeline modular de Diffusers, aun no integrado en una version estable de la libreria.

El entrenamiento emplea destilacion pi-Flow: el modelo funciona con 16 pasos de muestreo y la guia (guidance) esta destilada en los pesos, de modo que los bloques destilados no requieren guider ni prompt negativo. La cabeza de salida se ensancha cinco veces y el scheduler divide esa rejilla, lo que explica un `out_visual_dim` de 80. La generacion se realiza por chunks de 125 fotogramas a 25 fps (5 segundos) en uno de los buckets de 512 pixeles, elegido segun la relacion de aspecto del fotograma de referencia; para locuciones mas largas se encadenan chunks condicionados por el anterior mediante memoria FramePack. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de video de avatar a partir de un unico fotograma de referencia y una pista de voz.
- Animacion de la figura completa (cuerpo y gestos), no solo la region facial.
- Sincronizacion labial y corporal condicionada por el audio de entrada.
- Generacion de video de duracion arbitraria mediante encadenado de chunks con memoria FramePack.
- Seleccion automatica de bucket de resolucion (512) segun la relacion de aspecto de la imagen de referencia.
- Salida a 25 fps con audio original reincorporado al video final.
- No genera audio: el audio es exclusivamente una condicion de entrada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues en la informacion disponible.

## Casos de uso

- Generacion de avatares para formacion corporativa: a partir de una fotografia del ponente y la locucion grabada, el modelo produce un video de cuerpo completo sincronizado, util para cursos y materiales internos sin necesidad de regrabar en estudio.
- Localizacion de contenido audiovisual: al sustituir la pista de voz por una version doblada, el modelo reanima al hablante para ajustar los labios al nuevo idioma, manteniendo el fotograma de referencia original.
- Asistentes virtuales con presencia visual: integracion en interfaces conversacionales donde se requiere una figura animada que responda con lenguaje corporal coherente a la voz sintetizada del sistema.
- Produccion de video marketing a escala: generacion de multiples variantes de un mismo presentador con distintos guiones de voz, reduciendo el coste de rodaje a la creacion de un fotograma y una locucion.
- Prototipado rapido en estudios de animacion: previsualizacion de movimientos y sincronizacion antes de pasar a produccion manual, gracias a la generacion por chunks con continuidad temporal.
- Investigacion en sintesis audiovisual: banco de pruebas para estudiar sincronizacion labial, coherencia temporal y sesgos de animacion sobre figuras humanas reales.
- Contenido educativo accesible: animacion de un docente o interprete a partir de audio para generar material con presencia visual sin necesidad de grabacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo no cabe en una GPU de 80 GB con todos los componentes residentes. La model card indica que el uso de offload automatico mediante `ComponentsManager` con `memory_reserve_margin="40GiB"` mantiene un pico de aproximadamente 50 GiB.
- GPU recomendadas: A100 80 GB o H100 con offload de componentes; el margen de 40 GiB reservado deja espacio para la decodificacion VAE de un chunk.
- GPU de consumo: no se documenta soporte en GPU de consumo (RTX 4090 de 24 GB) en la informacion disponible.
- Despliegue: pipeline modular de Diffusers (`ModularPipeline.from_pretrained`), con `ComponentsManager` y `enable_auto_cpu_offload` para gestionar el offload de componentes a CPU.
- Latencia y throughput: no disponibles.
- Precision: los pesos se cargan en `bfloat16` (`pipe.load_components(dtype=torch.bfloat16)`).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de speech-to-video que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo anima a una persona real a partir de una fotografia y una voz que puede no ser la suya; existe riesgo claro de suplantacion de identidad y de difusion de contenido no consentido.
- La model card exige consentimiento explicito del sujeto para animar su imagen y prohibe presentar el resultado como una grabacion genuina.
- El audio no se genera: si se necesita voz sintetica, debe aportarse externamente.
- La generacion es por chunks de 5 segundos; la coherencia entre chunks depende de la memoria FramePack y puede degradarse en locuciones muy largas.
- La resolucion esta limitada a buckets de 512 pixeles, lo que restringe la calidad final del video.
- No se documentan sesgos conocidos, idiomas soportados ni evaluaciones de robustez en la informacion disponible.
- La licencia MIT permite uso comercial, pero no exime del cumplimiento de normativa sobre derechos de imagen y proteccion de datos.
- El pipeline no forma parte aun de una version estable de Diffusers; la API puede cambiar.
- Riesgo de alucinacion visual: el modelo puede generar gestos o expresiones no presentes en la referencia, especialmente en audio ambiguo o ruidoso.

## Enlaces

- [HuggingFace: ml-resources/Kandinsky-S2V-1.0-Pro-distill-Diffusers](https://huggingface.co/ml-resources/Kandinsky-S2V-1.0-Pro-distill-Diffusers)
- [Checkpoint nativo: kandinskylab/Kandinsky-S2V-1.0-Pro-distill](https://huggingface.co/kandinskylab/Kandinsky-S2V-1.0-Pro-distill)
- [Paper arXiv:2610.19290](https://arxiv.org/pdf/2610.19290)
- [Pagina del proyecto](https://kandinskyavatar.github.io)
- [Repositorio GitHub](https://github.com/kandinskylab/kandinsky-s2v)
- [Coleccion HuggingFace Kandinsky S2V 1.0](https://huggingface.co/collections/kandinskylab/kandinsky-s2v-10-6ab65ebe8f765b6dd9d706d7)
- [Demo en HuggingFace Spaces](https://huggingface.co/spaces/kandinskylab/Kandinsky-S2V-1.0-Demo)
