# paralaif/MOSS-Manga-Alpha-Image-LoRA

## Resumen

MOSS Manga Alpha Image LoRA es un adaptador LoRA (rank 32) creado por el usuario paralaif para el modelo de difusion MOSS-Image de OpenMOSS. Su propuesta resuelve un problema muy concreto y habitual en flujos de produccion de arte digital: generar imagenes con canal alfa real (RGBA) directamente desde el sampler, sin croma, sin modelos de eliminacion de fondo ni mascaras posteriores. Basta terminar el prompt con `, isolated on a transparent background` y decodificar con un VAE RGBA de 4 canales incluido en el repositorio.

El LoRA esta orientado principalmente a ilustracion de manga en blanco y negro (personajes, criaturas, props, efectos de tinta, onomatopeyas y globos de dialogo), aunque tambien funciona a color. Se apoya en MOSS-Image SFT (o Base) como modelo base, en un VAE RGBA de FLUX.2 redistribuido de trmz/flux2-klein-alpha, y en un nodo personalizado de ComfyUI para cargar ese VAE de 4 canales. Es relevante porque simplifica drasticamente el pipeline de generacion de assets transparentes, muy util para comic, juego y edicion grafica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre modelo de difusion MOSS-Image (pipeline text-to-image) |
| Parametros totales | no disponible (tamano del repo: 0,5 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | modelo base recomendado: MOSS-Image SFT int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 32 que se aplica sobre MOSS-Image SFT (o sobre MOSS-Image Base), un modelo de difusion text-to-image de OpenMOSS cuyo pipeline en ComfyUI utiliza un modelo de difusion (`moss_image_sft_int8_convrot.safetensors`) y un codificador de texto Qwen3.5 9B en int8. Para obtener el canal alfa, el flujo de trabajo sustituye el VAE estandar de 3 canales por un VAE RGBA de 4 canales derivado de FLUX.2 (`flux2_klein_alpha_rgba_vae.safetensors`, de trmz/flux2-klein-alpha), que permite decodificar directamente la transparencia. Dado que el cargador de VAE estandar de ComfyUI no admite VAE de 4 canales, el repositorio incluye un nodo personalizado llamado "Load RGBA VAE (Flux2)".

Los detalles del entrenamiento del LoRA (numero de imagenes, tokens, dataset concreto, epochs) no se han publicado en la model card; solo se indica que las captions seguian el patron `black-and-white manga illustration of <subject>, isolated on a transparent background` y que el enfoque estaba pensado para manga en blanco y negro, funcionando tambien en color. Los ejemplos publicados se generan con el modelo base acelerado mediante un LoRA DMD de 8 pasos (`MOSS-Image-SFT-8-steps-dmd`), lo que reduce el muestreo a 8 pasos con sampler `er_sde`.

## Capacidades

- Generacion de imagenes text-to-image con canal alfa real (RGBA) en el PNG de salida, sin postprocesado de recorte de fondo.
- Ilustracion de estilo manga en blanco y negro: personajes, criaturas, props, efectos de tinta, onomatopeyas y globos de dialogo.
- Generacion tambien valida en color.
- Composicion flexible de layouts (personajes, objetos y efectos aislados).
- Compatibilidad con MOSS-Image Base y MOSS-Image SFT.
- Integracion completa en ComfyUI mediante workflow incluido y nodo personalizado para el VAE RGBA.
- Compatible con aceleracion por destilacion (LoRA DMD de 8 pasos) para inferencia rapida.

## Casos de uso

- Creacion de assets para videojuegos: generacion de sprites y props con transparencia nativa listos para integrar en un motor, evitando el paso manual de recorte de fondo.
- Produccion de comic y manga: generacion de personajes, objetos y efectos de tinta aislados que se pueden componer directamente sobre vinetas y fondos dibujados.
- Stickers y material grafico para mensajeria o redes: los PNG RGBA salen listos para usar sobre cualquier fondo.
- Efectos visuales y onomatopeyas: generacion de efectos de tinta, explosiones de tinta o texto de sonido con alfa para superponer en paginas de manga o animacion.
- Globos de dialogo y lettering: creacion de globos de dialogo transparentes para composicion rapida en maquetacion editorial.
- Prototipado rapido de personajes: generacion de hojas de personajes aisladas sobre fondos de color para presentaciones o pitch decks, aprovechando la salida RGBA sin retoque.
- Automatizacion en pipelines graficos: el workflow de ComfyUI permite encadenar la generacion en flujos batch de produccion de assets transparentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible explicitamente; el stack completo recomendado (MOSS-Image SFT en int8 + text encoder Qwen3.5 9B int8) sugiere un equipo de gama alta, tipicamente una GPU con al menos 16-24 GB de VRAM para difusion int8 con text encoder de 9B (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; por el uso de int8 y resoluciones de 832x1216 a 1024x1024, una RTX 4090 o equivalente con 24 GB es una referencia razonable (estimacion).
- Consumer GPU: no disponible de forma confirmada; con cuantizacion int8 y muestreo de 8 pasos es plausible su ejecucion en GPUs consumer de 16-24 GB.
- Despliegue: ComfyUI (entorno principal, con workflow y nodo personalizado incluidos). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a difusion).
- Latencia y throughput: con el LoRA DMD de 8 pasos, los ejemplos se generan en 8 pasos por imagen; tiempos concretos no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Transparencia nativa | Licencia | Notas |
|---|---|---|---|---|
| MOSS Manga Alpha Image LoRA | LoRA rank 32 sobre MOSS-Image | Si, RGBA via VAE de 4 canales | Apache 2.0 | Enfocado a manga; requiere nodo custom de ComfyUI |
| FLUX.2 (con VAE alpha de trmz/flux2-klein-alpha) | Modelo de difusion text-to-image | Via VAE RGBA de 4 canales | no disponible en la informacion proporcionada | Origen del VAE RGBA usado por este LoRA |
| Modelos de difusion estandar (p. ej. MOSS-Image SFT sin LoRA) | Modelo base | No, requieren postprocesado de recorte de fondo | no disponible | Este LoRA existe precisamente para evitar ese paso |

## Limitaciones y advertencias

- Los detalles del dataset de entrenamiento no estan publicados, por lo que no se pueden evaluar sesgos especificos del LoRA; el modelo base MOSS-Image puede heredar sesgos de sus datos de entrenamiento (no documentados aqui).
- El entrenamiento esta orientado a manga en blanco y negro; en color funciona, pero la calidad relativa no esta cuantificada.
- El patron de prompt es rigido: hay que terminar con `, isolated on a transparent background` para obtener resultados fiables.
- Es necesario usar el VAE RGBA de 4 canales y el nodo personalizado incluido; el cargador de VAE estandar de ComfyUI no es compatible.
- La calidad del canal alfa en bordes complejos (pelo, efectos de tinta) no esta cuantificada con metricas; los ejemplos mostrados no estan retocados, pero no hay evaluacion numerica.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque hay que respetar la licencia de los modelos base y del VAE redistribuido (ambos Apache 2.0 segun la model card).
- El repositorio no incluye los pesos del modelo base ni del text encoder: hay que descargarlos de repos de terceros (Comfy-Org/MOSS-Image y lodestones/MOSS-Image-SFT-8-steps-dmd) y renombrar algunos ficheros manualmente.
- Descargas registradas: 0 en el momento de la ficha, lo que indica un proyecto muy reciente y con poco historial de uso en produccion.

## Enlaces

- Ficha del modelo: https://huggingface.co/paralaif/MOSS-Manga-Alpha-Image-LoRA
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- MOSS-Image SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Pesos de difusion y text encoder para ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
- LoRA DMD de 8 pasos: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- VAE RGBA de FLUX.2 (redistribuido): https://huggingface.co/trmz/flux2-klein-alpha
- Paper citado en tags (arxiv 2507.09308): https://arxiv.org/abs/2507.09308
