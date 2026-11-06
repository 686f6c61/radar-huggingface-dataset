# Hoffm4nz/LTX-2.5-22b-IC-LoRA-Sandstorm

## Resumen

LTX-2.5 22B IC-LoRA Sandstorm es un adaptador LoRA de tipo IC-LoRA (In-Context LoRA) para video-to-video sobre el modelo base Lightricks/LTX-2.5, un transformer de difusion de 22.000 millones de parametros orientado a generacion de video. El adaptador, publicado por el usuario Hoffm4nz, anade un efecto de tormenta de arena a un clip de referencia claro, manteniendo el encuadre, el movimiento y los sujetos del video original. No es un modelo autonomo: requiere el transformer destilado de LTX-2.5, el text encoder Gemma 4 y los VAE de video y audio para funcionar.

El interes tecnico del artefacto reside en el control granular de la densidad del efecto mediante el prompt de texto en lugar de la fuerza del LoRA. El adaptador se aplica siempre a strength 1.0, y la intensidad de la tormenta (desde polvo ligero hasta whiteout) se especifica en una frase del prompt que sigue al trigger obligatorio `ADD SANDSTORM`. Esto lo convierte en un ejemplo practico de como los IC-LoRA permiten composicion condicionada por lenguaje natural sobre un pipeline de difusion de video.

El repositorio es muy ligero (0.4 GB) y contiene unicamente el fichero de pesos del adaptador. Se entreno sobre `ltx-2.5-22b-dev` y se publica en el paso 2000. La licencia es la LTX-2 Community License, heredada del modelo base, con restricciones que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IC-LoRA (adaptador de bajo rango) sobre transformer de difusion LTX-2.5 22B |
| Parametros totales | 22B en el modelo base; el adaptador LoRA no declara numero de parametros |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el condicionamiento es por clip de video y prompt de texto) |
| Tipos de cuantizacion | bf16 (pesos del pipeline); el adaptador se distribuye en safetensors, cuantizacion adicional no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | ltx-2-community-license (LTX-2 Community License) |
| Formato de pesos | safetensors (`ltx-2.5-22b-ic-lora-sandstorm.safetensors`) |
| Tamano del repositorio | 0.4 GB |
| Modelo base | Lightricks/LTX-2.5 |
| Tipo de tarea | video-to-video |
| Text encoder | Gemma 4 (`gemma4-12b-ltx-v1`) |
| Resolucion nativa de entrenamiento | 960x544 |
| Paso de entrenamiento publicado | 2000 |
| Fuerza recomendada del LoRA | 1.0 |
| Audio | no genera audio |

## Arquitectura y entrenamiento

El adaptador es un IC-LoRA, es decir, un LoRA de bajo rango disenado para inyeccion de contexto (in-context) en un pipeline de difusion de video. Se aplica sobre el transformer de difusion LTX-2.5 de 22.000 millones de parametros, que procesa el video de referencia junto con el prompt de texto para producir el video transformado. El condicionamiento visual entra a traves del clip de referencia pasado al pipeline (`--video-conditioning`), mientras que el control semantico del efecto entra por el prompt a traves del text encoder Gemma 4.

El entrenamiento se realizo sobre la variante `ltx-2.5-22b-dev` y el checkpoint publicado corresponde al paso 2000. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables de forma habitual en adaptadores de difusion de video). La innovacion tecnica destacable es el desacoplamiento entre identidad del efecto (fijada por el LoRA) y densidad del efecto (controlada por el prompt), lo que permite un rango continuo de intensidades con un unico adaptador. El pipeline de inferencia emplea un esquema de dos etapas con upsampler espacial latente, aunque para este adaptador se recomienda ejecutar solo la etapa 1 con `--skip-stage-2` para preservar la resolucion nativa de entrenamiento.

## Capacidades

- Transformacion video-to-video: toma un clip claro de referencia y devuelve el mismo plano con una tormenta de arena anadida.
- Control de densidad por prompt: permite desde polvo ligero y neblina hasta tormenta intensa o whiteout casi total mediante una frase descriptiva.
- Preservacion de la estructura del plano: mantiene encuadre, movimiento de camara y sujetos cercanos, mientras desvanece progresivamente los elementos lejanos.
- Trigger obligatorio: requiere la cadena `ADD SANDSTORM` en todos los prompts para activar el efecto.
- Integracion con ComfyUI mediante el flujo IC-LoRA video-to-video de ComfyUI-LTXVideo.
- Ejecucion por linea de comandos a traves del modulo `ltx_pipelines.ic_lora`.
- Sin generacion de audio: el adaptador no produce sonido.
- Capacidad multilingue limitada al ingles en los prompts.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un adaptador de difusion de video, no un modelo de lenguaje.

## Casos de uso

- Postproduccion de efectos atmosfericos: aplicar una tormenta de arena a metraje rodado en exteriores sin necesidad de simulacion de particulas 3D, manteniendo el encuadre original y controlando la densidad desde el prompt.
- Previsualizacion de VFX en preproduccion: generar versiones rapidas de un plano con distintos niveles de tormenta para decidir la intensidad antes de invertir en renderizado final.
- Creacion de contenido para videojuegos y trailers: vestir escenas de desierto, carreteras o ciudades con tormentas de arena para material promocional o cinemáticas.
- Ambientacion de stock footage: transformar clips de archivo (los ejemplos usan videos de Pexels) en variantes con clima desertico para ampliar un catalogo sin rodar de nuevo.
- Prototipado de escenas climaticas en animacion: probar como afecta una tormenta a la legibilidad de sujetos y fondos en un plano concreto antes de modelar el efecto en 3D.
- Investigacion en adaptadores de difusion de video: servir como caso de estudio de IC-LoRA donde el control semantico del efecto se delega al prompt y no a la fuerza del adaptador.
- Integracion en flujos ComfyUI para artistas tecnicos: incorporar el nodo IC-LoRA de LTX-2.5 en grafos de postproduccion automatizada con clips de referencia estandarizados a 24 fps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el pipeline completo requiere cargar el transformer destilado de 22B en bf16, el text encoder Gemma 4 de 12B, los VAE de video y audio y el upsampler espacial, lo que en conjunto supera con holgura la VRAM de una GPU de consumo.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del transformer base (22B en bf16) se requiere hardware de clase profesional (A100, H100 o equivalentes), aunque este dato no esta confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base de 22B en bf16 no cabe en GPUs consumer tipicas sin cuantizacion, y no se documentan variantes cuantizadas del pipeline.
- Opciones de despliegue: modulo `ltx_pipelines.ic_lora` por linea de comandos y flujo IC-LoRA video-to-video en ComfyUI a traves de ComfyUI-LTXVideo. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion de video).
- Parametros de inferencia documentados: `--width 1920 --height 1088 --num-frames 97 --frame-rate 24 --seed 42`, con `--skip-stage-2`; el numero de frames debe cumplir `frames % 8 == 1` y las dimensiones deben ser divisibles por 64.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros base | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5 22B IC-LoRA Sandstorm (este) | IC-LoRA video-to-video sobre LTX-2.5 | 22B (base) | Clip de referencia + prompt de texto | ltx-2-community-license | Hugging Face (Hoffm4nz) |
| Lightricks/LTX-2.5 | Modelo base de difusion de video | 22B | Prompt de texto (y modalidades del pipeline) | ltx-2-community-license | Hugging Face (Lightricks) |
| Otros IC-LoRA de la comunidad sobre LTX-2.5 | Adaptadores de efecto video-to-video | 22B (base) | Clip de referencia + prompt | Heredada del base | no disponible en la informacion proporcionada |

La comparativa con alternativas de la misma categoria (otros adaptadores de efecto video-to-video) no esta disponible en la informacion proporcionada mas alla de la referencia al modelo base.

## Limitaciones y advertencias

- Dependencia del modelo base: no funciona de forma autonoma; requiere el transformer destilado de LTX-2.5, el text encoder Gemma 4, los VAE de video y audio y el upsampler espacial.
- Idioma: los prompts estan pensados para ingles; no se documenta soporte multilingue.
- Trigger obligatorio: sin la cadena `ADD SANDSTORM` el adaptador no aplica el efecto de forma fiable.
- Fuerza fija recomendada: el autor indica mantener el LoRA a strength 1.0; la densidad se controla por prompt, no por fuerza.
- Resolucion nativa limitada: 960x544 en entrenamiento; se recomienda `--skip-stage-2` para no degradar el efecto, lo que limita la resolucion de salida frente a pipelines de dos etapas.
- Restricciones de frames y dimensiones: `frames % 8 == 1` y dimensiones divisibles por 64; el clip de referencia debe estar a 24 fps.
- Sin audio: el adaptador no genera sonido, pese a que el pipeline base incluye un VAE de audio.
- Riesgo de artefactos: al ser un efecto atmosferico agresivo (whiteout), puede degradar la legibilidad de sujetos y fondos si la densidad del prompt no se ajusta al plano.
- Licencia: LTX-2 Community License, con posibles restricciones para uso comercial; conviene revisar el texto completo antes de desplegar en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni evidencia de robustez fuera de los ejemplos publicados.
- Sesgos: no documentados en la informacion disponible.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Hoffm4nz/LTX-2.5-22b-IC-LoRA-Sandstorm
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Licencia LTX-2 Community License: https://huggingface.co/Lightricks/LTX-2.5/blob/main/LICENSE
- Repositorio ComfyUI-LTXVideo: https://github.com/Lightricks/ComfyUI-LTXVideo/
- Videos de referencia (Pexels): https://www.pexels.com/video/30134225/ , https://www.pexels.com/video/39746014/ , https://www.pexels.com/video/6573940/ , https://www.pexels.com/video/36182372/ , https://www.pexels.com/video/4457802/ , https://www.pexels.com/video/34762053/
