# lyffseba/pingy-smo

## Resumen

`lyffseba/pingy-smo` es un checkpoint de ajuste fino publicado en el Hub de Hugging Face por el usuario lyffseba, construido sobre el modelo base `thinkingmachines/Inkling-2-Mini`. No se trata de un modelo con pesos descargables en el repositorio: los pesos se publicaron a traves de Tinker, la plataforma de entrenamiento e inferencia de Thinking Machines, y el autor indica explicitamente que las descargas de ficheros estan deshabilitadas para este modelo base (error `403 Checkpoint downloads are disabled`). El repositorio funciona, por tanto, como punto de referencia y documentacion de un entrenamiento, no como distribucion de pesos.

El modelo es un smoke test de tres pasos ejecutado sobre `terminal-bench-2.0` en modo de razonamiento `none`, con el objetivo de verificar que el bucle de herramientas `pi`, el evaluador Harbor, la sesion de Tinker y la publicacion de checkpoints funcionan correctamente de extremo a extremo. El propio autor advierte que "no es un modelo de codigo terminado". El ajuste se realizo mediante LoRA de rango 32 sobre atencion, MLP y capa de unembed, con el optimizador AdamW.

La relevancia de esta ficha es limitada desde el punto de vista de evaluacion de capacidades, pero es util como ejemplo de flujo de trabajo de ajuste fino en Tinker y como caso de publicacion de checkpoints sin distribucion de pesos. Cualquier evaluacion de rendimiento debe tomarse con cautela: se trata de tres pasos de entrenamiento y tres episodios de evaluacion, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base `thinkingmachines/Inkling-2-Mini`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en el repositorio; pesos publicados en Tinker (`tinker://e7bba24a-6366-5c8c-93b8-21e624a621a6:train:0/weights/final`) |
| Metodo de ajuste | LoRA rango 32 (atencion + MLP + unembed), AdamW |
| Modelo base | `thinkingmachines/Inkling-2-Mini` |
| Tarea de evaluacion | `terminal-bench-2.0`, thinking mode `none` |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-11-21 |
| Ultima actualizacion | 2026-11-21 |

## Arquitectura y entrenamiento

La arquitectura del modelo no se detalla en la informacion disponible; se hereda integramente del modelo base `thinkingmachines/Inkling-2-Mini`, del que tampoco se proporcionan especificaciones en la model card. Lo unico documentado es el procedimiento de ajuste: un LoRA de rango 32 aplicado sobre las capas de atencion, las capas MLP y la capa de unembed, optimizado con AdamW. El entrenamiento consistio en tres pasos (steps 0, 1 y 2) dentro de una sesion de Tinker identificada como `e7bba24a-6366-5c8c-93b8-21e624a621a6`, con nombre de visualizacion `pingy-smo`.

El objetivo del entrenamiento no era mejorar capacidades, sino validar la infraestructura: comprobar que el bucle de herramientas `pi`, el evaluador Harbor, la sesion de Tinker y la publicacion de checkpoints mediante `publish_checkpoint_from_tinker_path` operan correctamente. No se documentan volumenes de datos de entrenamiento, composicion del dataset, ni fases de RLHF o DPO. Los checkpoints publicados (pesos finales y pesos del sampler) pueden ser cargados por otra cuenta de Tinker, pero no descargados como ficheros.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base, sin datos especificos en la model card.
- Ejecucion de tareas de terminal: el smoke test se ejecuta sobre `terminal-bench-2.0`, lo que implica interaccion con entorno de terminal a traves del bucle de herramientas `pi`.
- Uso de herramientas (tool loop `pi`): el entrenamiento valida explicitamente este bucle, por lo que el modelo esta preparado para invocar herramientas en un ciclo de agente.
- Modo de razonamiento: se ejecuto con `thinking mode none`, es decir, sin cadena de pensamiento explicita.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Validacion de pipelines de ajuste fino en Tinker: el checkpoint sirve como referencia para comprobar que una sesion de entrenamiento, publicacion de pesos y carga posterior por otra cuenta funcionan correctamente. Es su proposito original.
- Pruebas de integracion de agentes con bucle de herramientas: permite verificar que un agente basado en `pi` completa episodios multi-turno (11-15 turnos por episodio en el smoke test) sin bloqueos.
- Evaluacion de infraestructura de grading: util para comprobar que el evaluador Harbor puntua correctamente tareas de `terminal-bench-2.0` antes de lanzar entrenamientos a mayor escala.
- Reproduccion de experimentos de LoRA: al documentarse rango 32, modulos objetivo y optimizador, sirve como plantilla reproducible para ajustes sobre `Inkling-2-Mini`.
- Docencia y demostracion de flujos Tinker: ejemplo minimo de publicacion de checkpoints sin distribucion de ficheros, util para explicar el modelo de pesos alojados.
- Pruebas de carga del sampler: el checkpoint de sampler publicado permite probar latencia y estabilidad de inferencia en Tinker antes de comprometer recursos en un modelo final.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al smoke test de tres pasos sobre `terminal-bench-2.0` en modo `none`:

| Step | test_passed | reward | turnos / episodio |
|---:|---:|---:|---:|
| 0 | 1.0 | 1.015 | 12 |
| 1 | 0.0 | 0.0 | 15 (limite de turnos) |
| 2 | 1.0 | 1.054 | 11 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. La muestra es de tres episodios y no permite extraer conclusiones sobre capacidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano del modelo base `Inkling-2-Mini`, no documentado).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la via documentada es Tinker, mediante `tinker.ServiceClient()` y `create_sampling_client` con la ruta del sampler. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la descarga de pesos esta deshabilitada, por lo que el despliegue local no es posible con la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria, y el caracter de smoke test del checkpoint hace que cualquier comparacion de rendimiento resulte engañosa.

## Limitaciones y advertencias

- No es un modelo terminado: el autor lo describe como un smoke test de tres pasos, no como un modelo de codigo listo para uso.
- Pesos no descargables: Thinking Machines deshabilita las descargas de ficheros para el modelo base (`403 Checkpoint downloads are disabled`); los pesos solo son accesibles via Tinker.
- Evaluacion insuficiente: tres episodios, uno de ellos fallido por limite de turnos, no permiten caracterizar el rendimiento.
- Sin datos de sesgos, alucinacion o comportamiento multilingue: no hay informacion al respecto en la model card.
- Licencia Apache 2.0 declarada, pero la disponibilidad efectiva de los pesos esta restringida por la plataforma Tinker, lo que limita el uso comercial a traves de dicha infraestructura.
- Sin garantias de produccion: al tratarse de un checkpoint de validacion, no debe desplegarse en entornos reales sin una evaluacion adicional exhaustiva.
- Fecha de creacion futura (2026-11-21) en los metadatos del Hub, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lyffseba/pingy-smo
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio GitHub de PINGY: https://github.com/lyffseba/pingy
- Hub principal de PINGY: https://huggingface.co/lyffseba/pingy
- Space xai: https://huggingface.co/spaces/lyffseba/xai
- Consola de Tinker: https://tinker-console.thinkingmachines.ai
