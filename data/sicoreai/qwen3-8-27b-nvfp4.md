# SicoreAI/Qwen3.8-27B-NVFP4

## Resumen

SicoreAI/Qwen3.8-27B-NVFP4 es una version de los pesos del modelo Qwen/Qwen3.8-27B cuantizada en formato NVFP4, creada por SicoreAI para su ejecucion en NVIDIA Jetson Thor T5000 mediante el runtime TensorRT-Edge-LLM. El modelo base, Qwen3.8-27B, es un modelo denso de 27.000 millones de parametros, nativo de vision-lenguaje, capaz de comprender imagenes y videos, con control flexible del pensamiento y orientado a tareas agnticas complejas.

Esta cuantizacion reduce el espacio en memoria y aprovecha las instrucciones NVFP4 del hardware de Jetson Thor, lo que permite desplegar un modelo de 27B en entornos embebidos de alto rendimiento. La principal advertencia es que no es compatible con vLLM y solo se puede servir con TensorRT-Edge-LLM en la plataforma indicada. La informacion publica sobre especificaciones detalladas, benchmarks y capacidades exactas es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, vision-lenguaje (base Qwen3.8-27B) |
| Parametros totales | 27B (redondeado, no disponible el valor exacto) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | NVFP4 (pesos cuantizados para TensorRT-Edge-LLM) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion NVFP4 del modelo base Qwen/Qwen3.8-27B, que se describe como un modelo denso, nativo de vision-lenguaje y construido sobre la fundacion arquitectonica de Qwen3.5. La cuantizacion no modifica la arquitectura de red, pero transforma los pesos a un formato de precision reducida optimizado para las unidades de computo de NVIDIA Jetson Thor T5000.

Sobre el entrenamiento del modelo base no se han proporcionado datos verificables, como la composicion del dataset, el numero de tokens o si se emplearon tecnicas tipo RLHF o DPO. En la configuracion de despliegue proporcionada por el autor se aprecia el uso de decodificacion especulativa basada en MTP (multi-token prediction), con arboles de verificacion y borradores de tamano 9 y hasta 5 tokens especulativos por paso.

## Capacidades

- Comprension de imagenes y videos al ser un modelo vision-lenguaje nativo.
- Generacion de texto y razonamiento para tareas de programacion, trabajo profesional e investigacion.
- Control flexible del pensamiento (thinking mode) segun la descripcion del modelo base.
- Diseñado para tareas agnticas de multiples pasos y horizonte largo.
- No se ha documentado explicitamente soporte de tool calling o function calling en la informacion disponible.
- No se dispone de datos sobre idiomas soportados.

## Casos de uso

- Analisis de video en tiempo real en camaras de seguridad perimetrales: el modelo puede recibir tramas de video y generar descripciones, alertas o clasificaciones de eventos mientras se ejecuta en el propio Jetson Thor T5000.
- Robots autonomos en almacenes: combina la entrada de camaras con instrucciones en lenguaje natural para tomar decisiones de navegacion o manipulacion sin depender de un servidor central.
- Asistente multimodal para mantenimiento industrial: un operario toma una foto de una maquina y el modelo genera pasos de diagnostico basados en la imagen y en el contexto.
- Diagnostico asistido en entornos remotos: analisis de imagenes medicas con soporte de texto para personal sanitario que trabaja en zonas sin conexion a internet.
- Generacion de codigo en entornos embebidos: un desarrollador sobre el terreno redacta o revisa scripts de automatizacion con el modelo ejecutandose localmente.
- Agente conversacional para atencion al cliente en dispositivos locales: el modelo mantiene conversaciones multi-turno y maneja solicitudes complejas sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de prueba de rendimiento y una referencia a un test de rendimiento interno, pero los valores numericos no son accesibles en los datos proporcionados.

## Requisitos de hardware

- Hardware objetivo: NVIDIA Jetson Thor T5000.
- Runtime necesario: TensorRT-Edge-LLM, version recogida en la imagen `harbor.sicoreai.com/thor/tensorrt-edge-llm:0.10.1`.
- VRAM estimada: no disponible. Dado que el modelo es de 27B en NVFP4, el peso de los tensores se situaria en el orden de 13,5 GB, pero esto es una estimacion no confirmada por el autor y depende del runtime y del cache KV.
- No es compatible con vLLM, segun el propio autor.
- Despliegue recomendado: contenedor Docker con el comando proporcionado en la model card, que incluye parametros como `--max-batch-size 4`, `--max-input-len 32768` y `--max-kv-cache-capacity 65536`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SicoreAI/Qwen3.8-27B-NVFP4 | 27B | no disponible | NVFP4 | MIT | Solo TensorRT-Edge-LLM en Jetson Thor T5000 |
| Qwen/Qwen3.8-27B | 27B | no disponible | Sin cuantizar (probable) | no disponible | Modelo base de HuggingFace |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | no disponible | NVFP4 | no disponible | Modelo equivalente publicado por Unsloth |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- El modelo solo puede cargarse con TensorRT-Edge-LLM en NVIDIA Jetson Thor T5000. vLLM no puede cargarlo, por lo que no es portable a otros runtimes o GPUs convencionales.
- Al ser una cuantizacion NVFP4, la precision puede verse afectada respecto al modelo original, aunque no se han publicado evaluaciones de este efecto.
- No se han documentado sesgos, riesgos de alucinacion ni comportamientos bajo entradas adversas en la model card.
- La licencia MIT cubre el modelo, pero el uso del runtime y del hardware requiere sus propias licencias.
- No hay informacion clara sobre la longitud de contexto, los idiomas soportados ni datos de entrenamiento, lo que limita la evaluacion previa al despliegue.
- El nombre "Qwen3.8-27B" puede inducir a error al parecer una serie 3.8 de 27B; no implica 3,8 billones de parametros.

## Enlaces

- https://huggingface.co/SicoreAI/Qwen3.8-27B-NVFP4
- https://huggingface.co/Qwen/Qwen3.8-27B
- https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
