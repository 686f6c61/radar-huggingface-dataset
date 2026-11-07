# sandpies/s3-anal-r16-move

## Resumen

`sandpies/s3-anal-r16-move` es un LoRA de rango 16 entrenado por el usuario sandpies sobre el checkpoint MiniMax H3, un modelo de generacion de video (referido en la model card como "Sulphur-3", un checkpoint podado de MiniMax H3). El adaptador esta especializado en la representacion explicita de penetracion anal en clips de video generados, y se distribuye como un conjunto de pesos de adaptacion (aproximadamente 3,6 GB en el repositorio) que debe cargarse sobre el modelo base para modificar su comportamiento generativo.

El modelo resuelve un problema muy concreto: conseguir que el modelo base represente de forma consistente una accion sexual especifica con continuidad temporal entre fotogramas, algo que los checkpoints generalistas suelen fallar. Para ello el autor describe una formulacion de prompt muy estructurada con marcas temporales (`00:00.000-00:02.200`), descripcion multimodal integrada y una lista de cuatro frases clave que deben mantenerse para preservar la "ruta" de la accion. Es relevante ahora unicamente dentro del ecosistema de generacion de video para adultos; no tiene aplicacion en tareas generales de NLP.

Se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y con licencia "other". La informacion disponible es la model card del autor y los metadatos de Hugging Face; no hay datos de benchmarks, idiomas ni evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3 (modelo de generacion de video) |
| Parametros totales | no disponible (rango 16 / alpha 16; numero de parametros no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (archivos `loras/epoch_NNNNNN/` y `loras/final/`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado sobre el checkpoint base MiniMax H3, que segun la model card es un checkpoint podado ("Sulphur-3"). El entrenamiento se realizo sobre 81 clips de 124 fotogramas a 24 fps y 0,25 megapixeles, afectando a los bloques 6 a 49 del modelo base. Se uso el optimizador Automagic3 con tasa de aprendizaje inicial de 1e-6, un "movement schedule" con 8% de clean-end, y se desactivaron las "face stills" y TREAD. Se completaron 24 epocas con un guardado por epoca; `loras/final/` corresponde a los pesos de la epoca 24.

La innovacion tecnica destacable no esta en la arquitectura del adaptador (LoRA convencional) sino en la estrategia de prompting documentada: el autor recomienda mantener cuatro frases fijas que describen la accion y variar solo la pose y la camara, y senala que un movimiento corto de entrada y salida que mantiene la cabeza enterrada preserva mejor la ruta que una embestida completa. Las previsualizaciones se generaron a 384x672, 22 fotogramas, 6 pasos, CFG 1 y semilla 42, con el LoRA H3 Turbo a fuerza 0,75. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generacion de video para adultos con representacion explicita de penetracion anal sobre el checkpoint Sulphur-3.
- Control de continuidad temporal mediante descripciones con marcas de tiempo por segmento.
- Soporte de prompt multimodal integrado (`integrated_multimodal_description`) con bandas de sonido (`overall_soundscape`) y musica no diegetica.
- Ajuste de fuerza del concepto entre 0,6 y 1,0.
- Cambio de pose y camara manteniendo la accion mediante un conjunto fijo de frases de anclaje.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-step.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de clips de video para adultos con una accion concreta: el LoRA permite que el modelo base represente de forma consistente la accion descrita, algo que el checkpoint generalista no logra de forma fiable.
- Control de continuidad entre fotogramas en escenas de contacto fisico: las marcas temporales del prompt permiten segmentar la accion en fases (entrada, profundidad, retirada) y mantener la coherencia.
- Variacion de encuadre y pose manteniendo la accion: el autor documenta poses validas (tumbada con rodillas elevadas, prono con camara baja tras el hombre) que pueden combinarse con las cuatro frases de anclaje.
- Iteracion de previsualizaciones rapidas: con 22 fotogramas y 6 pasos a 384x672 se pueden generar pruebas de bajo coste antes de producir clips mas largos.
- Integracion en pipelines de generacion de video con ComfyUI: el ecosistema del autor incluye nodos y LoRAs auxiliares (por ejemplo, un upscaler x2), lo que sugiere un flujo de trabajo dentro de ComfyUI.
- Investigacion sobre control fino de conceptos en modelos de difusion de video: el adaptador sirve como caso de estudio de como un LoRA de rango bajo modifica un comportamiento concreto sin reentrenar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del checkpoint base MiniMax H3 y de la precision de carga; el repositorio del LoRA ocupa 3,6 GB, pero el modelo base requiere bastante mas.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card y el ecosistema del autor apuntan a ComfyUI (existe un repositorio `sandpies/ComfyUI-H3-Video-Upsampler`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de video.
- Latencia y throughput: no disponibles. Las previsualizaciones se generaron con 22 fotogramas, 6 pasos, CFG 1 y 384x672, lo que sugiere un coste moderado por muestra, pero no se aportan tiempos.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores comparables del mismo tipo sobre MiniMax H3 ni sobre checkpoints equivalentes, ni se dispone de datos de rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta marcado como `not-for-all-audiences` y genera material sexual explicito; no es apto para menores ni para entornos sin control de acceso.
- Licencia "other": las condiciones exactas no estan detalladas en la informacion disponible; es imprescindible revisar los terminos del repositorio y los del modelo base MiniMax H3 antes de cualquier uso, especialmente comercial.
- Dependencia del checkpoint base: el autor advierte que el LoRA se entreno sobre Sulphur-3 y "puede o no coincidir" con otros checkpoints, merges o stacks; el comportamiento puede degradarse fuera de ese base.
- Sin trigger word: el prompt debe nombrar explicitamente la accion; el adaptador no se activa con una palabra clave.
- Riesgo de alucinacion visual: como todo modelo generativo de video, puede producir artefactos anatomicos, incoherencias entre fotogramas o fallos en la representacion del contacto.
- Sesgos: no documentados, pero el material de entrenamiento (81 clips de contenido explicito) condiciona fuertemente la distribucion de salidas.
- Idiomas: no disponible; el prompt de ejemplo esta en ingles.
- Cero adopcion verificable (0 descargas, 0 likes) y ausencia de evaluaciones independientes; no hay garantia de calidad fuera de las previsualizaciones del autor.
- Restricciones legales: la generacion de contenido sexual explicito puede estar sujeta a normativa segun la jurisdiccion; el usuario asume la responsabilidad de su uso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sandpies/s3-anal-r16-move
- Perfil del autor: https://huggingface.co/sandpies
- Repositorio auxiliar del autor (upscaler para ComfyUI): https://huggingface.co/sandpies/ComfyUI-H3-Video-Upsampler
- Pesos del upscaler x2: https://huggingface.co/sandpies/ComfyUI-H3-Video-Upsampler/blob/main/lora/h3upscale_v2_x2.safetensors
- Modelo base referenciado: https://huggingface.co/MiniMaxAI/MiniMax-H3
