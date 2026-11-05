# Manimama/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1

## Resumen

ChatR Labs Uncensored Omni LoRA v0.1 es un adaptador LoRA de rango 128 desarrollado por ChatR Labs (publicado en HuggingFace bajo el usuario Manimama) sobre el modelo base Qwen/Qwen-Image-2.1. Se trata de un adaptador que unifica generacion de imagen a partir de texto y edicion de imagen mediante instrucciones en lenguaje natural en un unico conjunto de pesos, lo que evita tener que cargar dos adaptadores separados para ambos flujos de trabajo.

El modelo resuelve un problema practico: los flujos de text-to-image y de edicion de imagen suelen requerir pipelines y adaptadores distintos. Este LoRA permite reutilizar la misma carga del pipeline base de Qwen-Image-2.1 para ambas tareas, pasando imagenes de referencia opcionales (de una a tres) junto con la instruccion. La calificacion "Uncensored" indica que el adaptador ha sido ajustado sin los filtros de contenido habituales del modelo base, orientandose a casos de uso creativos sin restricciones.

Es relevante en el ecosistema de difusion porque Qwen-Image-2.1 es un modelo de generacion de imagen de gran tamano, y este adaptador anade capacidades de edicion instruccional y generacion de poses sobre el mismo, con un peso de solo 671 MB en BF16. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 5 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 128) sobre el transformer de difusion de Qwen/Qwen-Image-2.1 |
| Parametros totales | no disponible (adaptador LoRA, no modelo completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 unicamente; sin variantes GGUF ni FP8 en esta release |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors (BF16, claves Diffusers/PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 entrenado sobre el modelo base Qwen/Qwen-Image-2.1, que es un modelo de difusion para generacion de imagen. El repositorio contiene exclusivamente los pesos del adaptador (671 MB en BF16); el transformer, el text encoder, el procesador y el VAE se descargan por separado desde el repositorio base. La relacion con el modelo base es de tipo adapter, y se carga mediante `load_lora_weights` en el pipeline `QwenImage21Pipeline` de Diffusers.

El adaptador esta entrenado especificamente para Qwen-Image-2.1. Segun la model card, las versiones anteriores Qwen-Image, Qwen-Image-2512 y Qwen-Image-Edit-2511 tienen arquitecturas diferentes y no son bases compatibles. Se trata de un LoRA regular, no de una destilacion few-step, por lo que requiere el numero completo de pasos de muestreo. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si se emplearon tecnicas de RLHF o DPO. La model card no detalla innovaciones tecnicas mas alla de la unificacion de text-to-image y edicion en un solo adaptador.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con prompts en lenguaje natural.
- Edicion de imagen instruccional: transforma imagenes existentes siguiendo instrucciones en lenguaje natural.
- Soporte de una a tres imagenes de referencia en el flujo de edicion (el Playground ha sido probado con una y tres referencias).
- Generacion de poses (tag `pose-generation`).
- Modo "uncensored": ajuste sin los filtros de contenido del modelo base.
- Un unico adaptador para ambos flujos (generacion y edicion), sin necesidad de cargar dos LoRAs.
- No se documenta soporte de tool calling, agentes, ni capacidades de audio o video.
- No se documentan capacidades multilingues especificas.

## Casos de uso

- Generacion de imagenes de producto: el adaptador produce imagenes de aproximadamente 1 megapixel (por ejemplo, 1024x1024) con prompts descriptivos, adecuado para catalogos y prototipado visual rapido con 35 pasos de muestreo y CFG verdadero de 5.0.
- Edicion iterativa de imagenes: partiendo de una imagen generada, se aplican instrucciones como "cambia la taza a verde, manten el resto igual" usando la misma pipeline cargada, lo que simplifica flujos de retoque sin cambiar de modelo.
- Generacion de poses para referencia artistica: la etiqueta `pose-generation` indica que el adaptador esta orientado a producir figuras en poses concretas, util para ilustracion, storyboards y referencia de animacion.
- Composicion con multiples referencias: al aceptar de una a tres imagenes de referencia, permite combinar elementos de varias fuentes en una sola edicion (por ejemplo, integrar un objeto de una referencia en la escena de otra).
- Creacion de contenido creativo sin restricciones: el ajuste "uncensored" lo hace adecuado para proyectos artisticos o de ficcion donde el modelo base aplicaria filtros de contenido.
- Prototipado en playground sin infraestructura propia: el Playground de ChatR Labs permite probar text-to-image y edicion sin cuenta, util para evaluar el adaptador antes de desplegarlo localmente.
- Integracion en pipelines de Diffusers: al ser un LoRA estandar con claves PEFT, se puede cargar en scripts de Python o en `inference.py` para automatizar lotes de generacion y edicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta tiempos de inferencia observados en el servidor del Playground, medidos a 25 pasos y CFG 4.0 (recomendacion anterior), con la advertencia de que a los 35 pasos actuales se debe esperar aproximadamente 1,4 veces ese tiempo. La tabla de tiempos aparece truncada en la informacion proporcionada, por lo que no se dispone de las cifras concretas por tarea y tamano de salida.

## Requisitos de hardware

- El adaptador pesa 671 MB en BF16, pero el requisito real lo determina el modelo base Qwen-Image-2.1 completo (transformer, text encoder, VAE), que debe cargarse aparte.
- El Playground oficial utiliza dos GPU RTX 4090 de 24 GB con el pipeline BF16 repartido entre ambas; las dos GPU sirven una unica peticion de forma conjunta y las peticiones simultaneas se encolan.
- Si el pipeline BF16 completo no cabe en una sola GPU, la model card recomienda `enable_model_cpu_offload()` (requiere RAM de sistema suficiente) o una configuracion multi-GPU.
- Con VRAM suficiente se puede sustituir el offload por `pipe.to("cuda")`.
- Despliegue mediante Diffusers con `QwenImage21Pipeline`; las dependencias fijan las versiones de Transformers, PEFT y Accelerate probadas, con PyTorch 2.11.0 y CUDA 12.8.
- Se recomienda mantener desactivado el VAE tiling, ya que la decodificacion por tiles anade estrias verticales de color visibles.
- No se dispone de cifras de latencia o throughput concretas por GPU individual; solo el dato agregado de dos RTX 4090 y la nota del factor 1,4x.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatR Labs Uncensored Omni LoRA v0.1 | LoRA sobre Qwen-Image-2.1 | no disponible (adaptador) | no disponible | qwen-research | HuggingFace (0 descargas) |
| Qwen/Qwen-Image-2.1 (base) | Modelo de difusion text-to-image | no disponible | no disponible | qwen-research | HuggingFace |
| Qwen-Image-Edit-2511 | Modelo de edicion de imagen | no disponible | no disponible | no disponible | HuggingFace (arquitectura incompatible segun la model card) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la model card solo senala la incompatibilidad arquitectonica con versiones anteriores de la familia Qwen-Image.

## Limitaciones y advertencias

- El ajuste "uncensored" elimina los filtros de contenido del modelo base, lo que implica riesgos legales y de moderacion en entornos de produccion publicos.
- Riesgo de alucinacion visual y de fidelidad limitada en ediciones: no se documentan metricas de preservacion de identidad o de consistencia fuera del area editada.
- Solo se distribuye en BF16; no hay variantes GGUF ni FP8, lo que limita el despliegue en hardware de baja VRAM sin cuantizacion adicional por parte del usuario.
- El adaptador no es compatible con Qwen-Image, Qwen-Image-2512 ni Qwen-Image-Edit-2511; solo funciona sobre Qwen-Image-2.1.
- Es un LoRA regular, no destilado few-step: requiere el numero completo de pasos (35 recomendados), lo que incrementa la latencia.
- La licencia qwen-research puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE del repositorio antes de desplegar en produccion.
- La decodificacion con VAE tiling introduce artefactos visuales (estrias verticales), por lo que no debe activarse.
- Un prompt negativo vacio u omitido desactiva el CFG verdadero en el pipeline probado, incluso con `true_cfg_scale` mayor que 1; se recomienda usar un unico espacio.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente; no hay evidencia de validacion por parte de la comunidad.
- No se dispone de informacion sobre sesgos, idiomas soportados ni composicion del dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Manimama/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Descarga directa del LoRA BF16: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/resolve/main/chatrlabs-omni-lora-v0.1-bf16.safetensors?download=true
- Playground de ChatR Labs: https://chatrlabs.com/
- Repositorio espejo del autor: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1
