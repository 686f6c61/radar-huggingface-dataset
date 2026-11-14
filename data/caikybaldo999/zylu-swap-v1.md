# caikybaldo999/zylu-swap-v1

## Resumen

ZYLU-SWAP v1 es un modelo de difusion de tipo Diffusion Transformer (DiT) disenado para la tarea de video-to-video con intercambio de personaje (character swap). Dado un video de entrada y una o dos imagenes de referencia de una persona, el modelo sustituye al personaje original manteniendo el movimiento (esqueleto y silueta) y el escenario de fondo. Lo desarrolla el usuario caikybaldo999 y se publica bajo licencia MIT.

El modelo es un DiT de 263 millones de parametros entrenado desde cero con flujo rectificado (rectified flow) sobre latentes del VAE `stabilityai/sd-vae-ft-mse`, a una resolucion de 384x224 en formato 9:16. El preprocesamiento del control se realiza con YOLOv8-seg (mascara) y YOLOv8-pose (esqueleto), y el entrenamiento se hizo sobre 2693 clips reales de videos de personas procedentes de los datasets `gulucaptain/Human-Image-Animation-Data` y/o `ohad204/human-motion`.

Es relevante porque aborda una tarea concreta (sustitucion de personaje en video con preservacion de movimiento) con un modelo pequeno (263M) y pesos abiertos en safetensors bf16, lo que permite experimentacion en hardware modesto. El checkpoint publicado es parcial (18049 pasos de entrenamiento), por lo que debe tratarse como un modelo en desarrollo y no como una solucion de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flujo rectificado |
| Parametros totales | 263 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa bloques de 16 frames con 4 de solapamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo de video, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, EMA) + config.json |

## Arquitectura y entrenamiento

El generador es un Diffusion Transformer de 263M de parametros entrenado desde cero mediante flujo rectificado (rectified flow). Opera sobre latentes del VAE `stabilityai/sd-vae-ft-mse` a una resolucion de 384x224 en proporcion 9:16. El control de movimiento se obtiene con YOLOv8-pose (esqueleto) y YOLOv8-seg (mascara de silueta), que se usan tanto para construir los datos de entrenamiento como para el control en inferencia. La composicion final se realiza mediante una mascara que pega al personaje nuevo sobre el escenario original.

El entrenamiento se realizo sobre 2693 clips reales de videos de personas, procedentes de los datasets `gulucaptain/Human-Image-Animation-Data` y/o `ohad204/human-motion`. Se completaron 18049 pasos de entrenamiento y el autor indica que el checkpoint es parcial. No se especifica en la informacion disponible si hubo RLHF, DPO ni la composicion exacta del dataset. Para videos largos, el modelo procesa en bloques de 16 frames con 4 frames de solapamiento.

## Capacidades

- Video-to-video con intercambio de personaje: sustituye al personaje de un video por una persona de referencia a partir de 1-2 imagenes.
- Preservacion de movimiento: mantiene el esqueleto (pose) y la silueta del personaje original.
- Preservacion de escenario: conserva el fondo original mediante composicion con mascara.
- Procesamiento de videos largos: genera en bloques de 16 frames con 4 de solapamiento.
- Salida en formato 9:16 a 384x224.
- No se documenta soporte de tool calling, agentes, texto, vision general, audio ni modo thinking.

## Casos de uso

- Prototipado de sustitucion de personaje en video: para experimentar con pipelines de character swap en investigacion y demos, usando las imagenes de referencia y el video de entrada con el control de pose y mascara.
- Previsualizacion de casting o dobles digitales: sustituir a un actor por una referencia en clips cortos para evaluar encaje de movimiento antes de una produccion real.
- Generacion de contenido para redes sociales en formato vertical: la salida 9:16 a 384x224 encaja en flujos de contenido corto, aunque la resolucion es baja.
- Anonimizacion de personas en video: reemplazar rostros y cuerpos por una referencia manteniendo el movimiento, util en datasets o material sensible.
- Investigacion en difusion de video: modelo pequeno (263M) con pesos abiertos que sirve como base para estudiar flujo rectificado, control por pose y composicion por mascara.
- Pruebas de concepto de video-to-video con control de movimiento: integrable en pipelines de investigacion que ya dispongan de YOLOv8-pose y YOLOv8-seg para generar el control.
- Educacion y demos tecnicas: ejemplo didactico de DiT aplicado a video con licencia MIT y pesos en safetensors.

## Benchmarks y rendimiento

Metricas de validacion publicadas por el autor en la region de la persona:

| Metrica | Valor |
|---|---|
| psnr_pessoa | 17.4373 |
| cor_da_ref_na_troca | 0.5159 |
| flicker_ratio | 0.8671 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a un modelo de video-to-video.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 5.9 GB y los pesos se publican en bf16, por lo que se requiere al menos esa cantidad de memoria para cargar el modelo, mas el VAE y los modelos YOLOv8 de preprocesamiento.
- GPU recomendadas: no disponible; por tamano (263M) es probable que quepa en GPUs consumer, pero no se confirma en la informacion.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo, aunque no se especifica.
- Opciones de despliegue: no disponible (no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI; no aplican a difusion de video).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la informacion.

## Limitaciones y advertencias

- Resolucion baja (384x224): el detalle de rostro y manos es limitado.
- El personaje nuevo queda constrenido dentro de la silueta del original, lo que puede producir artefactos en bordes y poses extremas.
- Requiere que haya una persona visible en el video de entrada; no funciona sin persona detectable.
- Checkpoint parcial (18049 pasos): el autor lo marca como estado intermedio, por lo que la calidad puede no ser final.
- Riesgo de alucinacion visual y flicker entre bloques: la metrica flicker_ratio publicada (0.8671) sugiere cierta inestabilidad temporal.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento (`gulucaptain/Human-Image-Animation-Data`, `ohad204/human-motion`) y de los modelos auxiliares (YOLOv8, VAE) antes de produccion.
- Idiomas: no aplica; no se documenta ningun soporte linguistico.

## Enlaces

- Hugging Face: https://huggingface.co/caikybaldo999/zylu-swap-v1
- Dataset de entrenamiento (referenciado): https://huggingface.co/datasets/gulucaptain/Human-Image-Animation-Data
- Dataset de entrenamiento (referenciado): https://huggingface.co/datasets/ohad204/human-motion
- VAE utilizado: https://huggingface.co/stabilityai/sd-vae-ft-mse
