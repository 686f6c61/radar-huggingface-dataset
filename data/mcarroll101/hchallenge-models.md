# mcarroll101/HChallenge-models

## Resumen

HChallenge-models es un repositorio de pesos publicado por el usuario mcarroll101 que agrupa los checkpoints asociados al proyecto HChallenge, orientado a robótica y a la investigacion en world models. No se trata de un modelo de lenguaje, sino de un conjunto de artefactos de entrenamiento para dos componentes distintos: una politica condicionada por flujo (flow-conditioned policy) que consume imagen de muneca, estado del robot y flujo de acciones, y un world action model (WAM) construido como adaptador LoRA sobre el modelo de video nvidia/Cosmos-Predict2-2B-Video2World. El repositorio ocupa 0,7 GB e incluye tambien el fichero de configuracion de entrenamiento, la normalizacion de flujo y un embedding T5 de un prompt de ejemplo.

La relevancia del repositorio es acotada y muy especifica: sirve para reproducir o evaluar los experimentos del proyecto HChallenge, cuyo codigo y resultados se publican por separado en GitHub y en su sitio web. La fecha de creacion y ultima actualizacion del repositorio es el 15 de octubre de 2026, con cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto reciente y de nicho, no una release ampliamente adoptada.

Debido a que la model card es extremadamente breve y no se acompanan de documentacion tecnica en la propia ficha de Hugging Face, buena parte de las especificaciones habituales (parametros totales de la politica, longitud de contexto, cuantizaciones, idiomas o resultados de benchmarks) no estan disponibles y se senalan como tal a lo largo de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. Dos componentes: (1) politica condicionada por flujo con imagen de muneca, estado del robot y flujo de acciones; (2) world action model implementado como LoRA sobre el modelo de video Cosmos-Predict2-2B-Video2World |
| Parametros totales | No disponible para la politica. El modelo base del WAM es Cosmos-Predict2-2B (2B parametros); el adaptador LoRA anadido no especifica su numero de parametros |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el unico texto documentado es el prompt de ejemplo en ingles "pick up the mug and put it on the plate") |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (.pt): checkpoint de politica `ckpt_20000.pt`, LoRA `lora_20000.pt`, embedding T5 `prompt_t5.pt` y `config.json` de configuracion |
| Tamano del repositorio | 0,7 GB |
| Pipeline declarado | robotics |
| Tags | robotics, world-model, region:us |

## Arquitectura y entrenamiento

La informacion disponible describe dos artefactos claramente diferenciados. El primero es un checkpoint de politica (`s1/ablation/full_wrist_state_no_img_pos/ckpt_20000.pt`) etiquetado como "flow-conditioned policy" que combina camara de muneca, estado del robot y flujo de acciones. El segundo es un world action model (`wam/v1/lora_20000.pt`) materializado como pesos LoRA que se aplican sobre el modelo base nvidia/Cosmos-Predict2-2B-Video2World, un modelo de generacion de video condicionado por imagen y texto. El repositorio incluye ademas `wam/v1/config.json`, que segun la model card contiene la configuracion de entrenamiento y la normalizacion de flujo, y `wam/prompt_t5.pt`, que es el embedding T5 del prompt de ejemplo.

No se especifican en la informacion proporcionada el numero de tokens o de trayectorias usado en el entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u optimizacion por preferencias. El hecho de que exista un directorio `ablation` sugiere que se han ejecutado experimentos de ablacion, pero no se detallan sus variantes. El sufijo `_20000` en ambos checkpoints apunta a 20.000 pasos de entrenamiento, aunque esto no se confirma explicitamente en la documentacion. Para el WAM es requisito disponer del modelo base `nvidia/Cosmos-Predict2-2B-Video2World`, que esta sujeto a licencia gated y exige aceptar sus terminos en Hugging Face.

## Capacidades

- Control robótico condicionado por politicas: el checkpoint `s1` genera flujos de accion a partir de imagen de camara de muneca y estado del robot, segun la descripcion de la model card.
- Modelado de mundo y prediccion de video-accion: el WAM (LoRA sobre Cosmos-Predict2-2B Video2World) esta orientado a la prediccion condicionada por video e instruccion textual.
- Condicionamiento por lenguaje: el uso de un embedding T5 y de un prompt de ejemplo indica que el WAM acepta instrucciones en lenguaje natural como condicionamiento, en la linea del modelo base Video2World.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se documentan idiomas soportados.
- Capacidades especiales (thinking mode, vision, audio): la vision esta presente a traves de la imagen de muneca y del modelo de video base; no se documentan otras modalidades.

## Casos de uso

- Reproduccion de experimentos de investigacion en robotica: el repositorio permite descargar los pesos exactos empleados en el proyecto HChallenge mediante `scripts/download_weights.sh`, situandolos en la carpeta `outputs/`, para replicar los resultados publicados.
- Manipulacion robotica con politicas condicionadas por vision: el checkpoint `s1` puede emplearse para generar acciones de manipulacion a partir de la camara de muneca y del estado del robot, util en tareas de picking y placing.
- Evaluacion de world action models: el LoRA `wam/v1` permite evaluar como un modelo de video de 2B parametros predice consecuencias de acciones sobre una instruccion textual, partiendo del prompt de ejemplo "pick up the mug and put it on the plate".
- Estudio de adaptacion eficiente con LoRA sobre modelos de video: el WAM sirve como caso practico de ajuste de un modelo fundacional de video mediante LoRA, con configuracion de normalizacion de flujo incluida.
- Ablaciones controladas en robótica: la existencia del directorio `ablation` con variantes como `full_wrist_state_no_img_pos` permite comparar el efecto de eliminar ciertas entradas (por ejemplo, posicion sin imagen) en el rendimiento de la politica.
- Base para experimentos de planificacion guiada por mundo: al disponer de un WAM y una politica separados, un investigador puede combinarlos para simular trayectorias antes de ejecutarlas en un robot real, aunque este flujo no se documenta en detalle en la ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia de la politica (`ckpt_20000.pt`): no disponible; no se indica el numero de parametros del checkpoint ni su precision.
- VRAM estimada para el WAM: no disponible con exactitud. El modelo base es Cosmos-Predict2-2B (2B parametros) y requiere cargar el modelo completo ademas del adaptador LoRA.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse si cabe en tarjetas tipo RTX 4090 sin datos de tamano y cuantizacion del modelo base.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El proyecto remite a scripts propios (`scripts/download_weights.sh`) y a su propio repositorio de codigo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HChallenge-models (WAM sobre Cosmos-Predict2-2B) | Adaptador LoRA; base de 2B | No disponible | CC-BY-4.0 (repo) con base gated | Hugging Face | Requiere aceptar la licencia de Cosmos-Predict2-2B-Video2World |
| nvidia/Cosmos-Predict2-2B-Video2World | 2B | No disponible en esta informacion | Gated (modelo base) | Hugging Face | Modelo base sobre el que se aplica el LoRA del WAM |
| Otras alternativas de world models para robotica | No disponible | No disponible | No disponible | No disponible | No se han identificado comparables en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Documentacion minima: la model card es muy breve y no incluye detalles de entrenamiento, datos, parametros ni evaluacion, lo que limita cualquier evaluacion rigurosa.
- Sin benchmarks publicos: no hay resultados verificables de rendimiento en la informacion disponible.
- Dependencia de un modelo base gated: el WAM no funciona de forma autonoma; requiere `nvidia/Cosmos-Predict2-2B-Video2World` y aceptar su licencia, lo que puede restringir el uso comercial segun los terminos del modelo base.
- Licencia del repositorio: CC-BY-4.0 permite uso comercial con atribucion, pero la licencia del modelo base puede imponer condiciones adicionales que prevalezcan sobre los pesos derivados (LoRA).
- Riesgo de alucinacion: no evaluado en la informacion disponible; en modelos generativos de video y politicas de accion existe riesgo de predicciones fisicamente invalidas si se aplican fuera del dominio de entrenamiento.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto o idioma: no disponible; solo se documenta un prompt de ejemplo en ingles.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Caveat de produccion: es un artefacto de investigacion sin senales de soporte, versionado estable ni pruebas de robustez; su uso en entornos productivos requeriria validacion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mcarroll101/HChallenge-models
- Codigo del proyecto: https://github.com/mi-robotics/HChallenge
- Sitio web del proyecto: https://mi-robotics.github.io/HChallenge/
- Modelo base requerido por el WAM: https://huggingface.co/nvidia/Cosmos-Predict2-2B-Video2World
