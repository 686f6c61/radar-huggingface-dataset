# SimpleTuner/moss-image-LoRA-experiments

## Resumen

`SimpleTuner/moss-image-LoRA-experiments` no es un modelo en sentido estricto, sino un repositorio-diario de experimentos que documenta y publica los adaptadores LoRA resultantes de comparar dos estrategias de ajuste fino sobre MOSS-Image, el modelo de generacion de imagenes de OpenMOSS-Team, en sus variantes Base (`OpenMOSS-Team/MOSS-Image-Base`) y SFT (`OpenMOSS-Team/MOSS-Image-SFT`). Lo mantiene el equipo de SimpleTuner, la herramienta de entrenamiento de difusion que se usa como marco experimental.

El objetivo declarado es aislar dos variables: la resolucion de entrenamiento (512 px frente a 1024 px, con area de imagen equivalente y relacion de aspecto original preservada) y el tipo de caption (nombre de fichero original frente a captions JSON nativos con grounding visual, generados con Qwen/Qwen3.5-27B). El concepto elegido para el experimento es Domokun, con las 29 imagenes del dataset `RareConcepts/Domokun` fijado al commit `2e4831a72f2a701c080e0046c8f8ec41cb1ccbcf`.

Cada una de las seis ejecuciones completadas entrena 10.000 actualizaciones de optimizador sobre una unica H100 de 80 GB y publica los 20 checkpoints de adaptador guardados junto con sus previews de validacion. El interes practico es la trazabilidad: permite reproducir el protocolo exacto, comparar Base frente a SFT y evaluar el impacto del captioning estructurado con los mismos hiperparametros y la misma semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base de generacion de imagenes (libreria `diffusers`); los artefactos publicados son adaptadores LoRA de rango 32 sobre ese modelo. Arquitectura interna de MOSS-Image: no disponible |
| Parametros totales | no disponible (no se publica recuento del modelo base ni de los adaptadores) |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | no disponible (no se documenta limite de tokens de prompt) |
| Tipos de cuantizacion | BF16 en el entrenamiento de los LoRA; no se documentan variantes GGUF, FP8 ni INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta ademas a los terminos del modelo base) |
| Formato de pesos | Adaptadores en formato `diffusers`, organizados en carpetas `checkpoint-XXXX`; no se especifica el contenedor exacto (safetensors u otro) |
| Tarea | Texto a imagen con concepto personalizado (single-concept LoRA) |
| Modelos base | `OpenMOSS-Team/MOSS-Image-Base` (commit `1ceede80badddd6a7812069619edaa5633587192`) y `OpenMOSS-Team/MOSS-Image-SFT` (commit `fc5de0d56fc910cbca6f6625a70f5f582b26deb1`) |
| Dataset de entrenamiento | `RareConcepts/Domokun`, 29 imagenes, commit `2e4831a72f2a701c080e0046c8f8ec41cb1ccbcf` |
| Resoluciones | 512 px y 1024 px (area equivalente, relacion de aspecto preservada) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Los adaptadores se insertan en un modelo de difusion para generacion de imagenes cargado mediante `diffusers`. El protocolo es identico en las seis ejecuciones: LoRA de rango 32 en BF16, batch 4, acumulacion de gradiente 1, learning rate 0,0001, 25 actualizaciones de warmup, semilla 42 y 10.000 actualizaciones de optimizador sobre una H100 de 80 GB. Se aplica REPA (alineamiento de representaciones) durante el entrenamiento; la configuracion concreta de ese componente no se detalla en la model card.

La validacion se ejecuta al arranque y cada 500 actualizaciones, con cuatro prompts fijos, 50 pasos de muestreo, CFG 3 y semilla 42, y las previews se publican junto a cada checkpoint. Las cuatro ejecuciones iniciales usan los nombres de fichero originales como captions. Las dos ejecuciones con captioning estructurado parten de cero desde Base y SFT y comparten un unico conjunto de captions JSON generados con Qwen/Qwen3.5-27B (revision `fc05daec18b0a78c049392ed2e771dde82bdf654`), anclados a las imagenes reales y a las dimensiones efectivas del bucket de 512 px; cada caption debe superar comprobaciones de esquema nativo, cajas delimitadoras, tokens de concepto y longitud de tokenizador antes de entrar en entrenamiento. Las ejecuciones con captions originales usan SimpleTuner en la revision `e30354dffd02c80f52f39912cea271f12be5ac4e`; las de JSON usan la implementacion de esquema compartida del PR #3273. No hay ejecuciones JSON a 1024 px ni ejecuciones de assistant-LoRA planificadas.

## Capacidades

- Generacion de imagenes condicionada por texto a partir de los adaptadores LoRA publicados, una vez combinados con el checkpoint base correspondiente.
- Aprendizaje de un concepto visual concreto (Domokun) a partir de solo 29 imagenes de referencia.
- Dos puntos de partida diferenciados y comparables: modelo Base y modelo afinado con SFT.
- Dos regimenes de resolucion (512 px y 1024 px) para estudiar el compromiso entre detalle y coste.
- Dos estrategias de captioning: captions triviales basadas en nombre de fichero y captions JSON con grounding visual, cajas delimitadoras y tokens de concepto.
- Publicacion de 20 checkpoints intermedios por ejecucion, lo que permite trazar la evolucion del aprendizaje y detectar sobreajuste.
- Previews de validacion reproducibles con prompts, pasos, CFG y semilla fijos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking: no aplica a este tipo de artefacto.

## Casos de uso

- Reproduccion de experimentos de fine-tuning: el repositorio fija commits del modelo base, del dataset y de SimpleTuner, ademas de semilla e hiperparametros, lo que permite replicar las seis ejecuciones y verificar resultados en un entorno propio.
- Estudio comparativo Base frente a SFT: las ejecuciones `base-512`/`sft-512` y `base-1024`/`sft-1024` comparten protocolo, de modo que las diferencias observadas pueden atribuirse al checkpoint de partida y no a variaciones de entrenamiento.
- Evaluacion del impacto del captioning estructurado: `base-512` frente a `json-base-512` y `sft-512` frente a `json-sft-512` aislan el efecto de sustituir nombres de fichero por captions JSON con grounding visual.
- Aprendizaje de conceptos raros con pocos datos: el flujo completo sirve de plantilla para incorporar marcas, mascotas corporativas o personajes con un puñado de imagenes, reutilizando la receta de rango 32 y 10.000 actualizaciones como punto de partida.
- Analisis del efecto de la resolucion: comparar 512 px y 1024 px con area equivalente permite decidir el coste computacional asumible en funcion del detalle requerido antes de escalar a un entrenamiento mayor.
- Seleccion de checkpoints en produccion: disponer de 20 adaptadores por ejecucion con sus previews facilita elegir el punto de la curva que maximiza fidelidad al concepto sin arrastrar sobreajuste, en lugar de asumir que el checkpoint final es el mejor.
- Formacion y docencia en fine-tuning de difusion: el repositorio es material didactico utilizable tal cual, con recetas publicas, registro de actualizaciones observadas y estados de cada ejecucion.
- Auditoria de pipelines de datos sinteticos: las comprobaciones de esquema, cajas delimitadoras, tokens de concepto y longitud de tokenizador aplicadas a los captions de Qwen3.5-27B sirven como referencia para disenar validaciones equivalentes en otros proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluacion descrita se limita a previews cualitativas con cuatro prompts, 50 pasos de muestreo, CFG 3 y semilla 42, sin metricas cuantitativas (FID, CLIP score, similitud al concepto ni tasas de exito). La busqueda web realizada no devolvio resultados relevantes sobre este repositorio ni sobre MOSS-Image.

## Requisitos de hardware

- Entrenamiento: una GPU H100 de 80 GB por ejecucion, con batch 4, acumulacion de gradiente 1 y LoRA de rango 32 en BF16. No se documenta el tiempo total por ejecucion.
- VRAM de inferencia: no disponible. Depende del checkpoint base de MOSS-Image y del grado de cuantizacion, datos que no se publican en esta ficha.
- GPU consumer: no disponible. No hay informacion que permita confirmar que el modelo base quepa en tarjetas de 16, 24 o 48 GB; el unico dato de hardware del que se dispone es la H100 de 80 GB empleada en entrenamiento.
- Despliegue: la libreria declarada es `diffusers`, por lo que la via natural es cargar el modelo base y aplicar el adaptador LoRA con `diffusers`. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se documentan en la informacion disponible adaptadores LoRA de terceros comparables para MOSS-Image. La comparacion factible es interna, entre las seis ejecuciones publicadas:

| Ejecucion | Modelo base | Resolucion | Captions | Actualizaciones | Estado |
|---|---|---|---|---|---|
| base-512 | MOSS-Image-Base | 512 px | nombre de fichero | 10.000 / 10.000 | completada |
| base-1024 | MOSS-Image-Base | 1024 px | nombre de fichero | 10.000 / 10.000 | completada |
| sft-512 | MOSS-Image-SFT | 512 px | nombre de fichero | 10.000 / 10.000 | completada |
| sft-1024 | MOSS-Image-SFT | 1024 px | nombre de fichero | 10.000 / 10.000 | completada |
| json-base-512 | MOSS-Image-Base | 512 px | JSON con grounding | 10.000 / 10.000 | completada |
| json-sft-512 | MOSS-Image-SFT | 512 px | JSON con grounding | 10.000 / 10.000 | completada |

Las seis comparten licencia Apache 2.0, semilla 42, rango 32 y numero de actualizaciones, de modo que las diferencias de resultado son atribuibles a base, resolucion o estrategia de caption.

## Limitaciones y advertencias

- Se trata de un diario de experimentos, no de un modelo listo para produccion: los adaptadores son artefactos intermedios de un estudio controlado y no han pasado por una evaluacion de calidad orientada a uso final.
- El dataset de entrenamiento son 29 imagenes de un unico concepto. El riesgo de sobreajuste y de memorizacion parcial de las imagenes de referencia es alto, especialmente en los checkpoints tardios.
- Una sola semilla (42) por configuracion: no hay repeticiones que permitan estimar varianza, por lo que las conclusiones sobre que variante es mejor deben tomarse como indicativas.
- La evaluacion es puramente cualitativa (cuatro prompts fijos). Sin metricas objetivas no es posible afirmar superioridad de una configuracion sobre otra.
- Los captions JSON dependen de un modelo generador (Qwen3.5-27B). Aunque pasan validaciones de esquema, cajas y longitud, pueden contener descripciones erroneas o sesgadas que se propaguen al adaptador.
- Cobertura incompleta por diseno: no hay ejecuciones JSON a 1024 px ni ejecuciones de assistant-LoRA, de modo que la interaccion entre captioning estructurado y alta resolucion queda sin explorar.
- No se documentan sesgos del modelo base, comportamiento multilingue ni limites de prompt; esas propiedades heredan de MOSS-Image y deben consultarse en su model card.
- Licencia: los adaptadores se publican como Apache 2.0, pero el uso comercial de los pesos derivados queda supeditado a los terminos del modelo base de OpenMOSS-Team. Verificar antes de desplegar.
- El repositorio presenta 0 descargas y 0 likes: no existe validacion externa de la comunidad sobre estos artefactos.
- No se especifica el formato de contenedor de los pesos ni se garantiza compatibilidad directa con herramientas distintas de `diffusers`.

## Enlaces

- Repositorio principal: https://huggingface.co/SimpleTuner/moss-image-LoRA-experiments
- Ejecucion base-512: https://huggingface.co/SimpleTuner/moss-image-base-domokun-512
- Ejecucion base-1024: https://huggingface.co/SimpleTuner/moss-image-base-domokun-1024
- Ejecucion sft-512: https://huggingface.co/SimpleTuner/moss-image-sft-domokun-512
- Ejecucion sft-1024: https://huggingface.co/SimpleTuner/moss-image-sft-domokun-1024
- Ejecucion json-base-512: https://huggingface.co/SimpleTuner/moss-image-base-domokun-json-512
- Ejecucion json-sft-512: https://huggingface.co/SimpleTuner/moss-image-sft-domokun-json-512
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Dataset Domokun: https://huggingface.co/datasets/RareConcepts/Domokun
- Pull request con la implementacion del esquema de captions: https://github.com/bghira/SimpleTuner/pull/3273
