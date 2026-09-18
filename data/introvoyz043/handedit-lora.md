# introvoyz043/HandEdit-LoRA

## Resumen

HandEdit-LoRA es una coleccion de adaptadores LoRA publicada por el usuario introvoyz043 en HuggingFace, orientada a una tarea de edicion de imagen muy concreta: sustituir las manos humanas de una fotografia por las manos del robot Inspire, preservando la pose original, la interaccion con los objetos, el fondo, la iluminacion y el punto de vista de la camara. No es un modelo generativo autonomo, sino un conjunto de pesos PEFT que se acoplan a cuatro modelos base de edicion de imagen distintos.

El repositorio incluye cuatro checkpoints independientes, uno por cada backbone soportado: LongCat-Image-Edit (meituan-longcat), OmniGen-v1 (Shitao), FLUX.2 Klein Base 4B (black-forest-labs) y Step1X-Edit (stepfun-ai). El autor indica que los adaptadores se entrenaron sobre mas de 20.000 pares de edicion de imagen alineados. El repo completo ocupa 0,8 GB y solo contiene los adaptadores: los pesos de los modelos base deben descargarse por separado desde sus repositorios oficiales.

La relevancia del proyecto es de nicho pero clara dentro del ambito robotico: permite generar pares imagen-humano / imagen-robot alineados sin retoque manual, lo que resulta util para aumento de datos, ilustracion tecnica y generacion de material sintetico para investigacion en manipulacion robotica. El pipeline declarado en HuggingFace es `robotics`. No hay informacion publica sobre licencia, idiomas soportados ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre modelos base de edicion de imagen; la arquitectura interna de cada backbone no se detalla en la informacion disponible |
| Parametros totales | no disponible (el repo completo ocupa 0,8 GB e incluye cuatro checkpoints LoRA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el script de inferencia de Step1X-Edit expone los flags `--quantized` y `--offload` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Modelos base soportados | LongCat-Image-Edit, OmniGen-v1, FLUX.2 Klein Base 4B, Step1X-Edit |
| Tamano del repositorio | 0,8 GB |
| Libreria | peft |
| Pipeline declarado | robotics |
| Fecha de publicacion | 2026-09-18 |

## Arquitectura y entrenamiento

El artefacto publicado no es un transformer completo, sino cuatro conjuntos de adaptadores LoRA que se inyectan en los bloques de atencion de cada modelo base. Cada adaptador se entrena de forma independiente contra su backbone correspondiente, de modo que no son intercambiables entre si: el checkpoint de `checkpoints/longcat/` solo funciona con LongCat-Image-Edit, el de `checkpoints/omnigen/` con OmniGen-v1, y asi sucesivamente. Este enfoque permite reutilizar un mismo objetivo de edicion sobre arquitecturas generativas distintas sin reentrenar los pesos completos.

El autor declara un conjunto de entrenamiento de mas de 20.000 pares de edicion de imagen alineados. No se especifica la composicion exacta del dataset, el numero de pasos de entrenamiento, el rango o alpha de las matrices LoRA, ni si se aplicaron tecnicas de ajuste adicionales como RLHF o DPO. La innovacion tecnica del proyecto no esta en la arquitectura, sino en la construccion del dataset alineado y en la restriccion de la tarea: la edicion debe conservar pose, interaccion con objetos, fondo, iluminacion y encuadre, lo que exige pares de imagenes muy controlados que un pipeline generico no garantiza.

## Capacidades

- Edicion de imagen condicionada: reemplaza manos humanas por manos del robot Inspire manteniendo la pose original.
- Preservacion de contexto visual: segun la model card, conserva la interaccion con objetos, el fondo, la iluminacion y la vista de camara.
- Compatibilidad con cuatro backbones de edicion de imagen distintos, lo que permite elegir entre distintas calidades y costes de inferencia.
- Inferencia por lotes mediante scripts de linea de comandos (`infer_longcat_lora.py`, `infer_omnigen_lora.py`, `infer_flux2_lora.py`, `infer_step1x_lora.py`) que procesan un directorio de entrada y escriben en un directorio de salida.
- Soporte de despliegue con cuantizacion y offload en el caso de Step1X-Edit (`--quantized --offload`), pensado para GPUs con VRAM limitada.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni procesamiento de lenguaje.

## Casos de uso

- Aumento de datos para aprendizaje robotico: transformar fotografias de manipulacion con manos humanas en imagenes con manos roboticas conservando pose y contacto con el objeto, para ampliar datasets de entrenamiento de politicas visuomotoras sin reetiquetar escenas.
- Generacion de pares alineados para investigacion sim-to-real: producir pares humano/robot con el mismo encuadre e iluminacion permite estudiar transferencia de dominio y comparar caracteristicas visuales entre morfologias.
- Ilustracion de articulos y documentacion tecnica: generar figuras coherentes donde un robot Inspire aparece manipulando los mismos objetos y desde la misma camara que la foto original, evitando montajes manuales.
- Prototipado de material de marketing para robotica: adaptar sesiones fotograficas existentes de producto o demostracion a una version con manos roboticas sin repetir el rodaje.
- Normalizacion de datasets de teleoperacion: convertir grabaciones o capturas con operador humano en versiones roboticas equivalentes para tareas de imitacion donde la apariencia del efector importa.
- Generacion de assets para simuladores y realidad virtual: poblar escenas virtuales con imagenes de manos roboticas consistentes en punto de vista y luz, utiles como texturas o referencias de render.
- Analisis de percepcion: usar el modelo para crear variaciones controladas de una misma escena (mano humana vs. mano robotica) y evaluar hasta que punto los modelos de vision degradan su deteccion de agarre o de contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, LPIPS, CLIP score, SSIM ni evaluaciones humanas) ni comparaciones con otros adaptadores de edicion de manos.

## Requisitos de hardware

- Al tratarse de adaptadores LoRA, los requisitos de VRAM vienen determinados por el modelo base elegido y no por el propio repositorio de 0,8 GB.
- FLUX.2 Klein Base 4B es el backbone mas ligero del conjunto (4.000 millones de parametros); es la opcion mas realista para GPU de consumo, aunque la VRAM concreta depende de la precision y del pipeline de difusion empleado (no disponible).
- Step1X-Edit y LongCat-Image-Edit son los backbones de mayor tamano del conjunto; el script de Step1X-Edit expone `--quantized` y `--offload`, lo que sugiere que su ejecucion en precision completa requiere mas VRAM de la disponible en GPUs de consumo.
- OmniGen-v1 es un modelo multimodal unificado de edicion; su huella de memoria no se detalla en la informacion proporcionada.
- Opciones de despliegue: los scripts de Python incluidos en el repositorio, que invocan cada pipeline con PEFT. En el caso de Step1X-Edit se requiere ademas clonar el repositorio `third_party/Step1X-Edit` y descargar los pesos en `weights/Step1X-Edit`.
- No hay datos publicados de latencia, throughput ni numero de pasos de muestreo recomendados.
- No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, algo esperable al tratarse de adaptadores de difusion para edicion de imagen y no de un modelo de lenguaje.

## Comparativa con modelos similares

La comparacion natural no es contra otros adaptadores de edicion de manos (no se han identificado alternativas publicas equivalentes en la informacion disponible), sino entre los cuatro backbones que HandEdit-LoRA soporta.

| Backbone | Origen | Categoria | Contexto | Licencia | Checkpoint en el repo |
|---|---|---|---|---|---|
| LongCat-Image-Edit | meituan-longcat | Edicion de imagen | no disponible | no disponible | `checkpoints/longcat/` |
| OmniGen-v1 | Shitao | Edicion de imagen multimodal unificada | no disponible | no disponible | `checkpoints/omnigen/` |
| FLUX.2 Klein Base 4B | black-forest-labs | Edicion/generacion de imagen, 4B | no disponible | no disponible | `checkpoints/flux2/` |
| Step1X-Edit | stepfun-ai | Edicion de imagen | no disponible | no disponible | `checkpoints/step1x/` |

No se dispone de datos de rendimiento comparativo entre estos backbones aplicados a la tarea de sustitucion de manos, ni de alternativas LoRA publicas con el mismo objetivo.

## Limitaciones y advertencias

- Solo se distribuyen los adaptadores LoRA: es imprescindible descargar por separado cada modelo base desde su repositorio oficial y respetar la licencia de ese backbone, que puede ser mas restrictiva que la del propio adaptador.
- La licencia del repositorio no esta declarada en HuggingFace, por lo que no puede confirmarse la legalidad de un uso comercial sin consultar al autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay evidencia publica de validacion por terceros ni de resultados reproducidos.
- La tarea esta muy acotada a las manos del robot Inspire; no hay informacion sobre su comportamiento con otras morfologias roboticas, guantes, herramientas o manos parcialmente ocluidas.
- Riesgo de artefactos en la zona editada: al preservar pose, contacto e iluminacion, los errores tipicos se concentrarian en la coherencia anatomica de la mano generada y en los bordes con el objeto manipulado. No hay evaluacion publicada que cuantifique este riesgo.
- No se documentan sesgos del dataset de entrenamiento (distribucion de tonos de piel, condiciones de luz, tipos de objeto), lo que impide evaluar su comportamiento fuera de la distribucion de los 20.000 pares originales.
- No hay informacion sobre idiomas soportados. En pipelines de edicion de imagen, esto solo afectaria a la parte de prompt textual, que no se documenta en esta ficha.
- Al ser pesos entrenados contra versiones concretas de cada backbone, cambios de version o de implementacion en los repositorios base pueden romper la compatibilidad del adaptador.
- No se proporcionan metricas de calidad, tiempos de inferencia ni requisitos de VRAM verificados, por lo que cualquier estimacion de coste en produccion seria especulativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/introvoyz043/HandEdit-LoRA
- Modelo base LongCat-Image-Edit: https://huggingface.co/meituan-longcat/LongCat-Image-Edit
- Modelo base OmniGen-v1: https://huggingface.co/Shitao/OmniGen-v1
- Modelo base FLUX.2 Klein Base 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Modelo base Step1X-Edit: https://huggingface.co/stepfun-ai/Step1X-Edit
- Repositorio de codigo de Step1X-Edit (referenciado como `third_party/Step1X-Edit` en la model card): no disponible como URL directa en la informacion proporcionada
- Paper, blog o demo del adaptador: no disponible
- Los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo.
