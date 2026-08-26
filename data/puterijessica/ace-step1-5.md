# puterijessica/Ace-Step1.5

## Resumen

ACE-Step 1.5 es un modelo de generacion de musica de codigo abierto desarrollado por ACE Studio y StepFun, disenado para producir musica de calidad comercial en hardware de consumo. El modelo combina un modelo de lenguaje (LM) que actua como planificador con un Diffusion Transformer (DiT) para la sintesis de audio, una arquitectura hibrida que permite transformar descripciones de texto en composiciones musicales completas de hasta 10 minutos.

El modelo destaca por su velocidad de generacion: produce una cancion completa en menos de 2 segundos en una A100 y en menos de 10 segundos en una RTX 3090, con un consumo de VRAM inferior a 4 GB. Esta optimizacion lo hace accesible para creadores individuales y estudios pequenos que no disponen de infraestructura de servidores dedicados.

La relevancia actual de ACE-Step 1.5 radica en su licencia MIT, que permite uso comercial sin restricciones, y en su entrenamiento sobre un conjunto de datos legalmente conforme que incluye musica con licencia profesional, contenido libre de derechos y datos sinteticos generados mediante conversion MIDI a audio. El modelo soporta mas de 50 idiomas y ofrece capacidades de edicion como generacion de versiones, repintado y conversion de vocal a fondo musical.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: LM planificador + Diffusion Transformer (DiT) |
| Parametros totales | LM: 0.6B, 1.7B o 4B (segun variante); DiT: no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | Composiciones de hasta 10 minutos (600 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Mas de 50 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACE-Step 1.5 emplea una arquitectura hibrida en la que un modelo de lenguaje (LM) actua como planificador universal. El LM transforma consultas de usuario en planos completos de canciones, que pueden abarcar desde bucles cortos hasta composiciones de 10 minutos, sintetizando metadatos, letras y descripciones mediante cadenas de pensamiento (Chain-of-Thought). Estos planos guian al Diffusion Transformer (DiT) encargado de la sintesis de audio.

El entrenamiento se realizo sobre un conjunto de datos masivo y legalmente conforme compuesto por tres fuentes: pistas musicales con licencia profesional, musica de dominio publico y libre de derechos, y datos sinteticos de alta calidad generados mediante conversion MIDI a audio. La alineacion entre el LM y el DiT se logra mediante aprendizaje por refuerzo intrinseco que depende unicamente de los mecanismos internos del modelo, eliminando los sesgos asociados a modelos de recompensa externos o preferencias humanas.

El modelo se ofrece en varias variantes: base, sft, turbo y turbo-rl, que difieren en las etapas de entrenamiento aplicadas (pre-entrenamiento, fine-tuning supervisado, aprendizaje por refuerzo) y en el numero de pasos de inferencia (50 para base y sft, 8 para turbo). Los modelos LM disponibles parten de Qwen3 en tamanos de 0.6B, 1.7B y 4B parametros.

## Capacidades

- Generacion de musica a partir de descripciones textuales en mas de 50 idiomas.
- Composicion de piezas completas de hasta 10 minutos de duracion.
- Control estilistico preciso con adherencia estricta a las indicaciones del prompt.
- Edicion musical versatil: generacion de versiones (cover), repintado (repaint) y conversion de vocal a fondo musical (vocal-to-BGM).
- Extraccion de audio de referencia para guiar la generacion.
- Composicion con capacidades de copia de melodia (copy melody).
- Comprension de audio y reescritura de consultas mediante el modelo LM.
- Generacion de metadatos, letras y descripciones mediante cadenas de pensamiento.
- Sintesis rapida: cancion completa en menos de 2 segundos en A100 y menos de 10 segundos en RTX 3090.
- Ejecucion local con menos de 4 GB de VRAM.

## Casos de uso

- Produccion musical profesional: compositores y productores pueden generar demos rapidas o esbozos de canciones completas a partir de descripciones textuales, acelerando el proceso creativo y explorando multiples direcciones estilisticas en minutos.
- Creacion de contenido para video: creadores de YouTube, TikTok o Twitch pueden generar fondos musicales originales y libres de derechos para sus videos, evitando problemas de copyright y adaptando la musica al tono y ritmo de cada pieza.
- Diseno sonoro para videojuegos: estudios independientes pueden generar bandas sonoras adaptativas y bucles musicales para diferentes escenarios del juego, con la posibilidad de iterar rapidamente sobre variaciones estilisticas.
- Edicion y remezcla musical: la capacidad de generar versiones, repintar secciones o convertir vocales en fondos musicales permite a productores y DJs crear remezclas y adaptaciones sin necesidad de acceso a las pistas originales.
- Educacion musical: profesores y estudiantes pueden generar ejemplos auditivos para ilustrar conceptos teoricos, estilos musicales o progresiones armonicas, facilitando el aprendizaje practico.
- Prototipado rapido para publicidad: agencias de marketing pueden generar jingles y fondos musicales personalizados para campanas publicitarias en diferentes idiomas, evaluando multiples opciones antes de la produccion final.
- Despliegue en aplicaciones de creacion musical: desarrolladores pueden integrar ACE-Step 1.5 en aplicaciones de escritorio o web para ofrecer generacion musical local a sus usuarios, gracias a su bajo consumo de VRAM y su licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye referencias a imagenes de evaluacion, pero los datos numericos concretos no estan accesibles en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 4 GB, lo que permite ejecucion en GPUs de consumo.
- GPU recomendadas: A100 para generacion en menos de 2 segundos; RTX 3090 para generacion en menos de 10 segundos.
- Compatibilidad con dispositivos Mac, AMD, Intel y CUDA, segun el repositorio oficial.
- Opciones de despliegue: el repositorio de GitHub indica soporte para multiples plataformas, aunque las herramientas especificas de despliegue (vLLM, llama.cpp, Ollama, TGI) no estan detalladas en la informacion disponible.
- Latencia: generacion de una cancion completa en menos de 2 segundos en A100 y menos de 10 segundos en RTX 3090.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step 1.5 | LM + DiT | LM 0.6B-4B; DiT no disponible | Hasta 10 min | MIT | HuggingFace, ModelScope |
| MusicGen (Meta) | Transformer decoder | 1.5B | Hasta 30 segundos | CC-BY-NC 4.0 | HuggingFace |
| Stable Audio Open | T2A con autoencoder | 1.2B | Hasta 47 segundos | Stable Audio Open | HuggingFace |
| AudioCraft (Meta) | EnCodec + Transformer | 1.5B-3.3B | Hasta 30 segundos | MIT (codigo), CC-BY-NC (modelos) | HuggingFace |

La comparativa se basa en datos publicos de los modelos alternativos. ACE-Step 1.5 se diferencia por su mayor duracion de generacion (10 minutos frente a 30-47 segundos), su licencia MIT permisiva para uso comercial y su menor requisito de VRAM.

## Limitaciones y advertencias

- La informacion disponible no detalla sesgos especificos del modelo, pero al tratarse de un modelo entrenado sobre datos musicales, podria presentar sesgos hacia estilos o generos musicales sobrerrepresentados en el conjunto de entrenamiento.
- No se dispone de datos sobre tasas de alucinacion o generacion de contenido no deseado en la informacion proporcionada.
- Aunque el modelo soporta mas de 50 idiomas, la calidad de generacion puede variar significativamente entre idiomas, especialmente en aquellos menos representados en los datos de entrenamiento.
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las leyes de propiedad intelectual aplicables a la musica generada.
- El modelo turbo utiliza solo 8 pasos de inferencia, lo que puede afectar a la calidad en comparacion con las variantes base y sft que usan 50 pasos.
- La variante turbo-rl no ha sido publicada aun, por lo que las capacidades de aprendizaje por refuerzo solo estan disponibles en los modelos LM.
- No se proporcionan datos sobre el rendimiento en tareas de generacion musical especificas como armonia, contrapunto o instrumentacion, por lo que se recomienda evaluar el modelo en casos de uso concretos antes de su integracion en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/puterijessica/Ace-Step1.5
- Pagina del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Coleccion HuggingFace: https://huggingface.co/collections/ACE-Step/ace-step-15
- ModelScope: https://modelscope.cn/models/ACE-Step/Ace-Step1.5
- Demo en Space: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Discord: https://discord.gg/PeWDxrkdj7
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.00744
- Repositorio GitHub: https://github.com/ace-step/ACE-Step-1.5
- Tutorial en GitHub: https://github.com/ace-step/ACE-Step-1.5/blob/main/docs/en/Tutorial.md
