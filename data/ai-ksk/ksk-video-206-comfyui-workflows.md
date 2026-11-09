# AI-KSK/ksk-video-206-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-206-comfyui-workflows` no es un modelo de lenguaje en sentido estricto, sino un repositorio de flujos de trabajo (workflows) para ComfyUI publicados por el usuario AI-KSK. Contiene las notas y el grafo JSON de un tutorial en video centrado en la generacion de video con LTX 2.3, un modelo de difusion video-audio de 22 000 millones de parametros en su variante `dev`. El objetivo del repositorio es documentar una tecnica concreta: inyectar hasta cuatro keyframes (imagenes de referencia) en un unico plano de 241 fotogramas y renderizarlo en tres pasadas de muestreo.

El problema que aborda es el control temporal fino en generacion de video: conseguir que un plano respete una secuencia de imagenes clave (primer fotograma, intermedios y ultimo) sin perder coherencia ni identidad visual entre ellas. Para ello combina el checkpoint base `ltx-2.3-22b-dev`, un LoRA destilado (`ltx-2.3-22b-distilled-lora-384`) aplicado a escala 0.5, y un esquema de muestreo en tres etapas con cadenas de sigma distintas, seguidas de un upscaler espacial x2.

Es relevante ahora porque LTX 2.3 es una de las familias abiertas de generacion de video con audio sincronizado, y este repositorio muestra una receta reproducible (76 nodos, parametros concretos) para produccion de clips con control de keyframes, algo poco documentado en la practica. El repositorio pesa 0.0 GB: solo contiene el README y el JSON del grafo, no los pesos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (flujo ComfyUI sobre el modelo de difusion LTX 2.3) |
| Parametros totales | 22 000 millones (checkpoint `ltx-2.3-22b-dev.safetensors`) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica; 241 fotogramas por plano en la demo (degradacion mas alla de ~700) |
| Tipos de cuantizacion | no disponible (el grafo usa safetensors sin cuantizar) |
| Idiomas soportados | en (segun la model card) |
| Licencia | other (sin detallar en la informacion disponible) |
| Formato de pesos | no incluido en el repo; el grafo referencia safetensors (`ltx-2.3-22b-dev.safetensors`, LoRA `ltx-2.3-22b-distilled-lora-384.safetensors`, upscaler `ltx-2.3-spatial-upscaler-x2-1.0.safetensors`) |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento de LTX 2.3 ni aporta datos sobre el dataset, el numero de tokens o el uso de RLHF/DPO. Lo que si describe con precision es la topologia del grafo de inferencia: 76 nodos en ComfyUI que encadenan el checkpoint `ltx-2.3-22b-dev`, un LoRA destilado a escala 0.5 y tres pasadas de muestreo con esquemas de sigma distintos. La primera pasada emplea el sampler `euler_ancestral_cfg_pp` con CFG 1 y una cadena de 9 valores de sigma (8 pasos efectivos); las pasadas 2 y 3 usan `euler_cfg_pp` con CFG 1 y sigmas `0.85, 0.7250, 0.4219, 0.0` (unos 3 pasos efectivos cada una).

La innovacion tecnica del flujo es el "latent carry": tres nodos identicos de arrastre de latentes transfieren el latente ya escalado entre pasadas, de modo que el upscaler espacial x2 (`ltx-2.3-spatial-upscaler-x2-1.0.safetensors`) refina progresivamente el mismo plano en lugar de regenerarlo. Los latentes de trabajo son 320x288x97 con audio de 97 fotogramas a 25 fps, y el tamano se controla en un unico nodo a 0.10 MP (opcionalmente 0.15 MP) porque despues se aplica un upscale 4x. Las imagenes de referencia se redimensionan a la primera, escalada a 1536 px en su lado mayor, y se colocan con pesos 1/0.5/0.5/1 en los indices 0/60/120/180 de un plano de 241 fotogramas.

## Capacidades

- Generacion de video con audio sincronizado a partir de texto y de imagenes de referencia (LTX 2.3 es un modelo video-audio).
- Inyeccion de hasta 5 imagenes clave en linea (hasta 20 con una actualizacion local del nodo KJ).
- Control de primer y ultimo fotograma (first-last-frame) y de keyframes intermedios con pesos por indice.
- Muestreo en tres etapas con cadenas de sigma independientes y CFG 1 en todas las pasadas.
- Refinado mediante upscaler espacial x2 con arrastre de latentes entre pasadas.
- Resolucion de trabajo baja (0.10-0.15 MP) pensada para upscale posterior de 4x.
- Salida de audio a 25 fps integrada en el mismo latente.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no aplica a este tipo de modelo.

## Casos de uso

- Storyboarding animado: introducir el primer y el ultimo fotograma de una escena y dejar que el modelo interpole los intermedios, util para previsualizar secuencias antes de producir en 3D.
- Animacion de personajes con keyframes de poses: colocar hasta cinco imagenes clave en un plano de 241 fotogramas para controlar la evolucion de una accion concreta.
- Generacion de clips musicales con audio sincronizado: el latente incluye 97 fotogramas de audio a 25 fps, lo que permite alinear imagen y sonido en una sola pasada.
- Prototipado de anuncios: renderizar variantes de un plano de 10 segundos a partir de fotogramas de producto, con pesos distintos en cada keyframe para priorizar el inicio o el cierre.
- Iteracion de arte conceptual: usar el esquema de tres pasadas para refinar un plano sin regenerarlo desde cero, ahorrando tiempo de computo en la segunda y tercera etapa.
- Docencia y divulgacion tecnica: el repositorio sirve como receta reproducible (76 nodos, parametros de sigma y CFG explicitos) para ensenar muestreo multi-etapa en ComfyUI.
- Previsualizacion de VFX: inyectar placas de fondo como keyframes y generar el movimiento intermedio antes de pasar a un pipeline de postproduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un checkpoint de 22 000 millones de parametros en safetensors sin cuantizar requiere del orden de 44 GB solo para los pesos en fp16, a lo que hay que sumar latentes, upscaler y LoRA; no se confirma ningun dato concreto.
- GPU recomendadas: no disponible. Por tamano del checkpoint, el flujo apunta a GPU de datacenter (A100 80 GB, H100) o a configuraciones multi-GPU; no se documenta en el repositorio.
- Cabe en GPU de consumo: no confirmado. Un checkpoint de 22B sin cuantizar no cabe en GPUs de 24 GB (RTX 4090) sin tecnicas de offload no descritas.
- Opciones de despliegue: ComfyUI (unico entorno documentado, con nodos KJ para ampliar el limite de imagenes). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponibles. El flujo ejecuta tres pasadas (8 + ~3 + ~3 pasos efectivos) mas un upscale x2 y un upscale 4x posterior, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX 2.3 (este flujo) | 22B | 241 fotogramas en la demo; degradacion > ~700 | other (sin detallar) | Checkpoint en safetensors, flujo en ComfyUI |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada; no se aportan cifras de rendimiento comparado.

## Limitaciones y advertencias

- Mas alla de ~700 fotogramas el autor reporta degradacion que no ha resuelto.
- La articulacion de extremidades es deficiente y el autor la atribuye al entrenamiento del modelo base, no al flujo.
- La tercera pasada aporta muy poco respecto a la segunda; el coste computo adicional puede no justificarse.
- El nodo KJ no respeta exactamente el numero de fotogramas solicitado: hay que recortar al final.
- El repositorio no contiene pesos (0.0 GB); solo README y JSON. Es imprescindible descargar los safetensors de LTX 2.3 por separado.
- Licencia "other" sin texto legal en la informacion disponible: verificar condiciones antes de cualquier uso comercial.
- Idioma documentado: solo ingles; no se confirma soporte multilingue en prompts.
- Riesgo de alucinacion visual y de inconsistencias de identidad entre keyframes no cuantificado en la documentacion.
- No hay datos de sesgos, evaluaciones de seguridad ni benchmarks publicados.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-206-comfyui-workflows
- RunningHub: https://www.runninghub.ai/post/2033913591946027010/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=DzNy87BOkX4
- Bilibili: https://www.bilibili.com/video/BV1WvwkzjERN
