# Anyhow5026272/acestep-v15-xl-turbo

## Resumen

ACE-Step 1.5 XL Turbo es un modelo de generacion de musica a partir de texto (text2music) desarrollado conjuntamente por ACE Studio y StepFun. Se trata de la variante "Turbo" de la arquitectura XL de ACE-Step 1.5, un modelo de difusion con decodificador DiT (Diffusion Transformer) de 32 capas y hidden size 2560, acompanado de un encoder de 8 capas y hidden size 2048. El repositorio declara 4.987.310.726 parametros (~5,0 B segun los safetensors) y un peso en bf16 de aproximadamente 18,8 GB, aunque la model card lo describe comercialmente como "4B".

Su principal valor es la destilacion para inferencia en 8 pasos sin classifier-free guidance, lo que reduce drasticamente el coste de muestreo frente a las variantes base y SFT, que requieren 50 pasos con CFG. Ademas, el autor afirma que esta entrenado sobre datos con licencia (musica con licencia, royalty-free o de dominio publico y datos sinteticos MIDI-a-Audio), lo que habilita el uso comercial del audio generado bajo licencia MIT.

Es relevante ahora porque cubre el hueco de generacion musical open source con pesos abiertos, licencia permisiva y un ecosistema de modelos de lenguaje auxiliares (0,6B, 1,7B y 4B) para comprension de audio y composicion. No obstante, la ficha del repositorio consultada es un espejo de terceros (usuario Anyhow5026272) sin descargas ni likes, mientras que la distribucion oficial corresponde a la organizacion ACE-Step.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con decodificador de 32 capas (hidden size 2560, 32 cabezas de atencion) y encoder de 8 capas (hidden size 2048); pipeline text-to-audio con codec latente |
| Parametros totales | 4.987.310.726 (~5,0 B) segun los safetensors; la model card declara "~4B" y un peso bf16 de ~18,8 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 mencionada por el autor para escenarios de VRAM reducida junto con CPU offload; bf16 como formato nativo; no se documentan GGUF, FP8, AWQ ni GPTQ |
| Idiomas soportados | no disponible (el repositorio no declara lista de idiomas para los prompts de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16), con requisito de `custom_code` en transformers |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusion sobre latentes con un decodificador DiT de 32 capas, hidden size 2560 y 32 cabezas de atencion, mas un encoder de 8 capas y hidden size 2048. La variante Turbo esta destilada para generar audio en 8 pasos de inferencia sin classifier-free guidance, frente a los 50 pasos con CFG de `acestep-v15-xl-base` y `acestep-v15-xl-sft`. La distribucion incluye modelos de lenguaje auxiliares (LM de 0,6B, 1,7B y 4B) compatibles con el DiT XL, orientados a comprension de audio y composicion; la propia model card advierte que la calidad completa requiere sumar el LM de 4B, lo que eleva los requisitos de VRAM.

En cuanto a los datos, el autor indica que el entrenamiento usa musica con licencia, material royalty-free o de dominio publico y datos sinteticos generados mediante MIDI-a-Audio, con el objetivo declarado de permitir uso comercial. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Los modelos LM asociados operan a 5 Hz (denominacion `acestep-5Hz-lm-*`). El informe tecnico referenciado es `arXiv:2602.00744` y el proyecto esta coliderado por ACE Studio y StepFun.

## Capacidades

- Generacion de musica a partir de descripciones de texto (text2music), con inferencia en 8 pasos y sin CFG.
- Extraccion de caracteristicas de audio: el repositorio incluye la etiqueta `feature-extraction`, ademas de `audio` y `music`.
- Tareas estandar de text2music en la variante Turbo; las tareas ampliadas de la familia XL (extraccion, "lego" y completado de audio) solo se declaran para la variante base, no para Turbo.
- Comprension y composicion musical asistida mediante los LM auxiliares de 0,6B, 1,7B y 4B, compatibles con el DiT XL.
- Generacion de audio con fines comerciales bajo licencia MIT, segun la declaracion del autor sobre los datos de entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta comportamiento agentico ni razonamiento multi-paso.
- No se declaran capacidades multilingues ni lista de idiomas soportados.
- No se declaran capacidades de vision, video, voz ni modo "thinking".

## Casos de uso

- Generacion de bandas sonoras para videojuegos independientes: el modelo produce pistas instrumentales a partir de prompts de texto en 8 pasos, lo que permite iterar rapidamente sobre variaciones de tema sin depender de bancos de audio con licencia restrictiva.
- Musica de fondo para creadores de contenido: al estar entrenado sobre datos con licencia y publicarse bajo MIT, el audio generado puede incorporarse a videos de YouTube o podcasts sin negociar derechos adicionales con la discografica.
- Prototipado rapido en produccion musical: los 8 pasos de inferencia sin CFG reducen el tiempo por muestra frente a las variantes de 50 pasos, lo que lo hace util para generar bocetos de arreglos que luego se refinan en un DAW.
- Anuncios y piezas cortas de marca: la ventana corta de generacion por muestra encaja con jingles y loops, y la licencia MIT simplifica el uso comercial en campanas.
- Investigacion en generacion musical: al ser un DiT destilado con pesos abiertos, sirve como referencia para estudiar destilacion de pasos en difusion aplicada a audio y para comparar Turbo frente a Base y SFT.
- Extraccion de caracteristicas de audio: la etiqueta `feature-extraction` permite emplear el encoder para obtener representaciones latentes de clips musicales en tareas de recuperacion, clasificacion o similitud.
- Asistencia compositiva con LM auxiliares: combinando el DiT XL con `acestep-5Hz-lm-4B` se puede construir un flujo de descripcion musical asistida por lenguaje (estructura, instrumentacion, atmosfera) antes de la sintesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FAD, CLAP score, MMLU, HumanEval ni equivalentes) ni comparaciones numericas frente a otros sistemas de generacion musical. Tampoco se proporcionan datos de latencia o throughput absolutos.

## Requisitos de hardware

- VRAM segun el autor: ≥12 GB con CPU offload y cuantizacion INT8; ≥16 GB con CPU offload; ≥20 GB sin offload (recomendado); ≥24 GB para calidad completa con DiT XL mas el LM de 4B.
- El peso en bf16 ocupa aproximadamente 18,8 GB, por lo que sin offload no cabe en GPUs de 16 GB.
- GPU de 12 GB (por ejemplo, RTX 3060 12 GB) solo con cuantizacion INT8 y offload a CPU.
- GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) con offload a CPU.
- GPU de 24 GB (RTX 3090, RTX 4090) para el flujo completo con el LM de 4B.
- GPU de datacenter (A100 40/80 GB, H100) para despliegues concurrentes o sin offload con margen de memoria.
- Opciones de despliegue documentadas: instalacion del repositorio oficial (`pip install -e .`), interfaz Gradio (`python acestep --config-path acestep-v15-xl-turbo`) y carga mediante transformers con `custom_code`.
- No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia estructural, la variante Turbo ejecuta 8 pasos frente a los 50 de Base y SFT, es decir, un sexto de los pasos de muestreo, pero no hay cifras absolutas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros DiT | CFG | Pasos de inferencia | Calidad declarada | Diversidad | Tareas | Licencia |
|---|---|---|---|---|---|---|---|
| acestep-v15-xl-turbo | 4B (XL) | No | 8 | Very High | Medium | Estandar | MIT |
| acestep-v15-xl-sft | 4B (XL) | Si | 50 | Very High | Medium | Estandar | MIT |
| acestep-v15-xl-base | 4B (XL) | Si | 50 | High | High | Extraccion, lego y completado | MIT |

Frente a alternativas externas de generacion musical open source, como Stable Audio Open o MusicGen, no se dispone en la informacion proporcionada de datos comparables de parametros, contexto, licencia o rendimiento, por lo que no se incluye comparacion numerica.

## Limitaciones y advertencias

- Repositorio espejo: el ID consultado (`Anyhow5026272/acestep-v15-xl-turbo`) no pertenece a la organizacion oficial ACE-Step y registra 0 descargas y 0 likes; para produccion conviene usar los pesos oficiales.
- No se declara la composicion del dataset de entrenamiento ni el numero de tokens, solo la afirmacion del autor sobre datos con licencia; la verificacion de cumplimiento comercial recae en el usuario.
- La afirmacion de "listo para uso comercial" depende de la licencia MIT del repositorio y de la procedencia declarada de los datos, no de una auditoria independiente publicada.
- Riesgo de alucinacion en el sentido de fidelidad al prompt: no hay datos publicados sobre adherencia semantica al texto de entrada ni tasas de fallo.
- La variante Turbo no cubre las tareas de extraccion, lego ni completado de audio que si declara la variante base, lo que limita su uso en edicion musical parcial.
- No hay longitud de contexto documentada, por lo que se desconoce la duracion maxima de audio generable en una sola pasada.
- No se declara lista de idiomas ni rendimiento multilingue en los prompts de texto.
- La calidad completa requiere anadir el LM de 4B, lo que eleva la VRAM necesaria a unos 24 GB y encarece el despliegue.
- No se documentan cuantizaciones GGUF, FP8, AWQ ni GPTQ, lo que reduce las opciones de despliegue en hardware limitado mas alla de INT8 y offload a CPU.
- El etiquetado `custom_code` implica que el modelo no funciona con un `AutoModel` estandar de transformers sin cargar el codigo del repositorio, con el consiguiente riesgo de ejecucion de codigo de terceros.
- Ausencia total de benchmarks publicos: cualquier decision de adopcion en produccion deberia acompanarse de una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Repositorio HuggingFace consultado: https://huggingface.co/Anyhow5026272/acestep-v15-xl-turbo
- Modelo oficial en HuggingFace (variante XL Turbo): https://huggingface.co/ACE-Step/acestep-v15-xl-turbo
- Pagina del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Coleccion ACE-Step 1.5 en HuggingFace: https://huggingface.co/collections/ACE-Step/ace-step-15
- Coleccion en ModelScope: https://modelscope.cn/collections/ACE-Step/Ace-Step-15-xl
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Repositorio de codigo: https://github.com/ace-step/ACE-Step-1.5
- Informe tecnico: https://arxiv.org/abs/2602.00744
- Discord del proyecto: https://discord.gg/PeWDxrkdj7
- Variante XL Base: https://huggingface.co/ACE-Step/acestep-v15-xl-base
- Variante XL SFT: https://huggingface.co/ACE-Step/acestep-v15-xl-sft
- LM auxiliar 0,6B: https://huggingface.co/ACE-Step/acestep-5Hz-lm-0.6B
- LM auxiliar 4B: https://huggingface.co/ACE-Step/acestep-5Hz-lm-4B
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces utiles proceden del repositorio y de la model card.
