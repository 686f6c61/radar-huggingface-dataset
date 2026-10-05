# JingwuLuo/ImageWAM3backbones

## Resumen

ImageWAM3backbones es un repositorio publicado por JingwuLuo que agrupa tres modelos world-action model (WAM) de la familia ImageWAM, ajustados para el robot bimanual Unitree G1. Los tres se entrenan con la receta de mundo real descrita en el paper ImageWAM (arXiv:2606.19531) sobre los cuatro conjuntos de datos LGG100 (drawer, biomanual, simple-pick y Stack-the-cubes). Los tres comparten datos, particion, entradas, salidas, receta y longitud de entrenamiento; la unica diferencia es el backbone de edicion de imagen y las partes ligadas a el: el DiT de edicion, sus caracteristicas de texto, su VAE y la profundidad del experto de accion.

La arquitectura es una mezcla de transformers (mixture-of-transformers) con un experto de video (el DiT de edicion) y un experto de accion, mas un encoder de propriocepcion que convierte el estado del robot en un token. Las tres variantes se apoyan en backbones distintos: FLUX.2 klein base 4B, FLUX.2 klein base 9B y Qwen-Image-2.1, lo que cambia el numero de parametros y la licencia aplicable a cada ejecucion.

Es relevante porque publica pesos reales de un world-action model para hardware Unitree G1, con control a 30 Hz, salida de chunk de acciones de 16x16 y rama opcional de prediccion de video, lo que permite reproducir y comparar el efecto del backbone de edicion de imagen manteniendo constante el resto del pipeline. El repositorio ocupa 383,0 GB y en el momento de la consulta no registraba descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-transformers (MoT): experto de video (DiT de edicion de imagen) + experto de accion + encoder de proprio (state-token encoder) |
| Parametros totales | Tres variantes: FLUX.2 klein 4B = 3,88 B (video) + 0,64 B (accion); FLUX.2 klein 9B = 9,08 B (video) + 0,95 B (accion); Qwen-Image-2.1 = 7,12 B (video) + 0,85 B (accion) |
| Parametros activos | No aplica: no es un MoE disperso, ambos expertos (video y accion) se ejecutan |
| Longitud de contexto | Texto limitado a 128 posiciones con mascara de validez; chunk de accion de 16x16 (16 acciones futuras) |
| Tipos de cuantizacion | No disponible; los pesos se guardan en bfloat16 |
| Idiomas soportados | No disponibles |
| Licencia | per-model-licenses (por modelo); ver LICENSE.md de cada ejecucion |
| Formato de pesos | PyTorch .pt (diccionario de `torch.save`: `mot`, `proprio_encoder`, `step`, `torch_dtype`) en bfloat16 |

Detalle por ejecucion:

| Directorio | Backbone | Experto de video | Experto de accion | Licencia base |
|---|---|---|---|---|
| `g1_lgg100_flux2_klein_4b_base_imagewam/` | FLUX.2 [klein] base 4B | 3,88 B | 0,64 B (5 bloques dobles + 20 simples) | Apache-2.0 |
| `g1_lgg100_flux2_klein_9b_base_imagewam/` | FLUX.2 [klein] base 9B | 9,08 B | 0,95 B (8 bloques dobles + 24 simples) | FLUX Non-Commercial License v2.1 |
| `g1_lgg100_qwenimage21_imagewam/` | Qwen-Image-2.1 | 7,12 B | 0,85 B (32 bloques single-stream) | Qwen Research License |

## Arquitectura y entrenamiento

Cada modelo es una mezcla de transformers con dos ramas: un experto de video que reutiliza el DiT de edicion de imagen del backbone (FLUX.2 klein base 4B, FLUX.2 klein base 9B o Qwen-Image-2.1) y un experto de accion especifico cuya profundidad varia por variante (5 bloques dobles mas 20 simples en la de 4B; 8 dobles mas 24 simples en la de 9B; 32 bloques single-stream en la de Qwen-Image-2.1). El estado proprioceptivo (16 valores) se normaliza con `dataset_stats.json` y se proyecta a un unico token mediante el `proprio_encoder`, que se empaqueta justo despues de los tokens de texto validos. La imagen se codifica con el VAE del backbone correspondiente (el VAE de FLUX.2, `ae.safetensors`, o el de Qwen-Image-2.1).

El condicionamiento de texto se obtiene de forma distinta segun el backbone. En FLUX.2 se concatenan los estados ocultos de Qwen3 de las capas 9, 18 y 27: Qwen3-4B (7.680 dimensiones) para el modelo de 4B y Qwen3-8B (12.288 dimensiones) para el de 9B. En Qwen-Image-2.1 se usa la ultima capa decodificadora de Qwen3-VL antes de la normalizacion final (4.096 dimensiones) con la plantilla de chat texto-a-imagen sin mensaje de sistema. La cadena de tarea se envuelve con el prefijo fijo "A video recorded from a robot's point of view executing the following instruction: {task}" y se codifica a 128 posiciones. El repositorio incluye `text_cache/` con esas caracteristicas para las cuatro tareas de entrenamiento, con nombre de archivo igual al SHA-256 de la cadena envuelta.

El ajuste fino sigue la receta de mundo real del paper sobre los cuatro conjuntos LGG100 (drawer, biomanual, simple-pick y Stack-the-cubes). Los pesos se guardan cada 5.000 pasos hasta 25.000 y ademas en el paso final 27.950. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO. Tampoco se incluyen registros de entrenamiento, videos, estados de optimizador ni datos.

## Capacidades

- Generacion de acciones de control: produce un chunk de acciones [16, 16], es decir, 16 acciones futuras desde t (0,53 s a 30 Hz), con el mismo esquema de 16 dimensiones que el estado (7 articulaciones del brazo izquierdo, 7 del derecho y dos pinzas Dex1).
- Control a 30 Hz, la frecuencia de los datos de entrenamiento.
- Prediccion de video (rama opcional): genera el fotograma de 288 x 256 en t + 16 a partir de la inferencia conjunta de imagen y accion.
- Entrada multimodal: tres camaras RGB del G1 (480 x 640 cada una) tileadas en una imagen de 288 x 256 en el formato compacto de RoboTwin (camara de cabeza en la mitad superior, munecas izquierda y derecha abajo), mas estado proprioceptivo de 16 valores y una cadena de texto de tarea.
- Seguimiento de instrucciones en lenguaje natural para las tareas entrenadas (apertura de cajon, colocacion bimanual de vasos, pick simple y apilado de cubos por color).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el condicionamiento de texto se entrena con cadenas de tarea en ingles.
- Capacidad especial: world-action model con rama de prediccion de video, util como modelo de mundo para las tareas de manipulacion entrenadas.

## Casos de uso

- Manipulacion bimanual pick-and-place: el modelo recibe la imagen tileada de las tres camaras y el estado de las 14 articulaciones y devuelve 16 acciones absolutas de articulaciones y pinzas, lo que permite ejecutar la recogida de un cubo y su deposito en una bandeja o cajon sin planificacion externa.
- Apertura y cierre de cajones con dos brazos: la tarea `drawer` entrena al modelo para usar el brazo mas cercano en abrir el cajon, el otro brazo en coger el cubo morado y colocarlo dentro, y finalmente cerrar, todo dentro del chunk de 0,53 s por inferencia a 30 Hz.
- Colocacion bimanual sobre posavasos: la tarea `biomanual` permite secuenciar la recogida del vaso azul y su deposito en el posavasos azul, seguida de la recogida del vaso verde y su deposito en el posavasos verde libre, utilizando la rama de accion con estado z-scored.
- Apilado por color: la tarea `Stack-the-cubes` sirve para apilar bloques rojo, azul y amarillo en orden, un escenario tipico de evaluacion de precision en manipulacion.
- Investigacion en world-action models: al compartir datos, particion, receta y longitud y diferir solo en el backbone, el repositorio permite un estudio controlado del efecto del backbone de edicion de imagen sobre el rendimiento.
- Modelo de mundo para prediccion visual: la rama opcional de video predice el fotograma en t + 16, lo que permite usarla como supervision o para anticipar la escena antes de ejecutar la accion.
- Base para ajuste fino en nuevas tareas: los checkpoints (`step_005000.pt` a `step_027950.pt`) y el `config.yaml` resuelto permiten partir de un estado intermedio y reentrenar con datos propios de otro robot o de otras tareas de manipulacion bimanual.
- Despliegue en bucle cerrado sobre Unitree G1: con `dataset_stats.json` para normalizar el estado y des-normalizar la accion, los pesos se integran en un controlador que reenvia observaciones a 30 Hz y aplica el primer elemento del chunk.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 383,0 GB, que incluye los checkpoints de los tres modelos; cada ejecucion guarda pesos en los pasos 5.000, 10.000, 15.000, 20.000, 25.000 y 27.950.
- VRAM estimada para inferencia en bfloat16, solo pesos de los expertos: aproximadamente 9 GB para la variante de 4,52 B (4B), 16 GB para la de 7,97 B (Qwen-Image-2.1) y 20 GB para la de 10,03 B (9B). Hay que sumar el VAE del backbone y el codificador de texto (Qwen3-4B, Qwen3-8B o Qwen3-VL), lo que eleva el consumo total muy por encima de esas cifras.
- Los ficheros de la variante de 9B ocupan aproximadamente el doble de lo que corresponderia a sus parametros, porque se guardaron por la ruta LoRA-merged y cada bloque del experto de video aparece bajo dos nombres (`mixtures.video.transformer.*` y `mixtures.video.{double,single}_blocks.*`); esto no afecta a la carga.
- GPU recomendadas: no disponibles de forma explicita. Por tamano, las variantes de 4B y Qwen-Image-2.1 pueden requerir GPU de 24 GB o mas para pesos mas codificadores, y la de 9B GPU de 40 GB o mas (A100, H100 o similares) para margen de activaciones.
- Inferencia en GPU de consumo: no confirmado en la informacion disponible; depende del codificador de texto acompanante y del VAE.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El unico camino documentado es cargar el diccionario `torch.save` y construir la red con el campo `model` del `config.yaml`.
- Latencia y throughput: no disponibles. El control opera a 30 Hz y cada inferencia cubre 0,53 s de accion, pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

Comparativa interna de las tres ejecuciones del repositorio (mismos datos, particion, entradas, salidas, receta y longitud):

| Ejecucion | Backbone | Video (B) | Accion (B) | Bloques del experto de accion | Licencia base |
|---|---|---|---|---|---|
| ImageWAM G1 (FLUX.2 klein 4B) | FLUX.2 klein base 4B | 3,88 | 0,64 | 5 dobles + 20 simples | Apache-2.0 |
| ImageWAM G1 (FLUX.2 klein 9B) | FLUX.2 klein base 9B | 9,08 | 0,95 | 8 dobles + 24 simples | FLUX Non-Commercial License v2.1 |
| ImageWAM G1 (Qwen-Image-2.1) | Qwen-Image-2.1 | 7,12 | 0,85 | 32 single-stream | Qwen Research License |

No se dispone de datos de rendimiento comparativo entre estas tres variantes ni frente a otros world-action models o politicas de manipulacion; no disponible.

## Limitaciones y advertencias

- Licencia no homogenea: la variante de 4B deriva de un backbone Apache-2.0, pero la de 9B queda sujeta a FLUX Non-Commercial License v2.1 y la de Qwen-Image-2.1 a Qwen Research License, lo que restringe el uso comercial segun el caso.
- El `config.yaml` conserva rutas absolutas de la maquina de entrenamiento (raices de dataset, pesos base, cache de texto); hay que reescribirlas a copias locales antes de usarlo.
- No se incluyen registros de entrenamiento, videos, estados de optimizador ni datos, lo que dificulta reproducir el entrenamiento al detalle.
- El alcance de tareas es limitado: el ajuste fino cubre solo cuatro tareas de LGG100 (drawer, biomanual, simple-pick y Stack-the-cubes). Se desconoce su generalizacion a objetos, escenas o tareas fuera de esa distribucion.
- Dependencia de los caracteristicas de texto precalculadas: `text_cache/` solo contiene las cuatro cadenas de tarea de entrenamiento, indexadas por el SHA-256 de la cadena envuelta. Cambiar la instruccion exige recalcular las caracteristicas con el codificador de texto correcto.
- Desfases temporales en los datos: en LGG100 la accion registrada adelanta al estado registrado en unos 3 fotogramas, y las imagenes de camara van por detras del estado articular unos 3 fotogramas (100 ms). El despliegue debe respetar estas relaciones.
- Riesgo de alucinacion visual y de accion: no se documentan metricas de error, tasas de exito ni evaluaciones de seguridad, por lo que no hay evidencia publicada de robustez en produccion.
- Idioma: las cadenas de tarea estan en ingles; no se declaran idiomas soportados.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Sesgos conocidos: no disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JingwuLuo/ImageWAM3backbones
- Paper ImageWAM: https://arxiv.org/abs/2606.19531
- Backbone FLUX.2 klein base 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Backbone FLUX.2 klein base 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B
- Backbone Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Dataset LGG100/drawer: https://huggingface.co/datasets/LGG100/drawer
- Dataset LGG100/biomanual: https://huggingface.co/datasets/LGG100/biomanual
- Dataset LGG100/simple-pick: https://huggingface.co/datasets/LGG100/simple-pick
- Dataset LGG100/Stack-the-cubes: https://huggingface.co/datasets/LGG100/Stack-the-cubes
