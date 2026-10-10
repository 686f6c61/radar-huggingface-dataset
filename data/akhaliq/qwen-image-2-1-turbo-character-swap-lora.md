# akhaliq/Qwen-Image-2.1-Turbo-Character-Swap-LoRA

## Resumen

Qwen-Image-2.1-Turbo Character Swap LoRA es un adaptador de bajo rango (LoRA) publicado por el usuario akhaliq sobre el modelo de difusion Qwen/Qwen-Image-2.1-Turbo, orientado a una tarea muy concreta de edicion de imagen: sustituir a una persona presente en una fotografia por un personaje proporcionado en una imagen de referencia, conservando la escena original (fondo, iluminacion y resto de elementos). El adaptador se activa mediante dos imagenes de condicionamiento simultaneas y una instruccion textual en lenguaje natural.

El interes practico del adaptador reside en que la edicion se resuelve en 8 pasos de inferencia gracias a la naturaleza destilada del modelo base, lo que reduce el coste computacional frente a pipelines de decenas de pasos. Ademas, se distribuye como un fichero de aproximadamente 0,2 GB que se carga sobre el modelo base sin necesidad de reentrenar ni redistribuir los pesos completos, integrándose tanto en diffusers (QwenImage21Pipeline + load_lora_weights) como en cargadores estilo ComfyUI.

Se trata de un artefacto experimental de nicho: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, la licencia declarada es "other" y el propio autor reconoce debilidades en v1 con referencias de personajes de multiples vistas o de tipo mecanico/robot. No se han publicado metricas cuantitativas de calidad ni especificaciones de VRAM del pipeline completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion; rango 32; modelo base Qwen/Qwen-Image-2.1-Turbo |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; la condicion de entrada son dos imagenes mas un prompt) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye sin cuantizar y hereda el regimen de precision del modelo base |
| Idiomas soportados | no disponible; el unico ejemplo de instruccion de la model card esta en ingles |
| Licencia | other (definida por el autor; sujeta ademas a la licencia del modelo base) |
| Formato de pesos | adaptador LoRA cargable con load_lora_weights en diffusers y con cargadores estilo ComfyUI; el formato de fichero concreto no se especifica en la model card |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 que se injerta sobre Qwen-Image-2.1-Turbo, un modelo de difusion destilado para generacion y edicion en 8 pasos. La tarea se formula como edicion condicionada por dos imagenes: la imagen fuente (Picture 1) y la referencia del personaje (Picture 2), junto con una instruccion textual del tipo "Swap the person in Picture 1 with the character in Picture 2. Keep the background, lighting and everything else unchanged". La carga se realiza con QwenImage21Pipeline y load_lora_weights pasando image=[source, reference].

El entrenamiento se hizo con DiffSynth-Studio, con rango 32, learning rate 1e-4 y 2016 pasos. El dataset akhaliq/qwen-21-turbo-character-swap-v1 se compone de 76 tripletes procedentes de akatz-ai/H3-Character-Swap-v1 (Apache-2.0), 220 tripletes sintetizados con Qwen/Qwen-Image-Edit-2511 y 40 ejemplos especificos de preservacion de la escena. La receta sigue la del adaptador akatz-ai/MiniMax-H3-Character-Swap-LoRA. No se documentan tecnicas adicionales como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Sustitucion de personaje en imagen: reemplaza a la persona de la imagen fuente por el personaje de la referencia, con dos imagenes de condicionamiento simultaneas.
- Preservacion de escena: mantiene fondo, iluminacion y elementos no relacionados con la persona sustituida, apoyado por los 40 ejemplos de preservacion del dataset.
- Edicion guiada por lenguaje natural: acepta instrucciones textuales explicitas sobre que conservar y que sustituir.
- Inferencia en 8 pasos: aprovecha la destilacion del modelo base Qwen-Image-2.1-Turbo para reducir el numero de pasos de muestreo.
- Integracion en pipelines de difusion: compatible con diffusers (QwenImage21Pipeline + load_lora_weights) y con cargadores estilo ComfyUI.
- Ejecucion en linea: existe un Space de demostracion publicado por el autor.
- Generacion de texto, razonamiento, codigo, matematicas, vision comprensiva, tool calling, agentes y audio: no disponible (fuera del alcance de este adaptador de edicion de imagen).
- Capacidades multilingues: no documentadas.

## Casos de uso

- Postproduccion fotografica y retoque: sustituir a una persona en una sesion de estudio por un personaje o figurante de referencia sin rehacer la toma, manteniendo fondo e iluminacion, gracias a la preservacion de escena que entrena el adaptador.
- Previsualizacion de casting y vestuario: generar una version de la escena con un personaje de referencia antes de rodar o producir, reduciendo coste frente a una produccion real.
- Creacion de contenido para redes y material promocional: personalizacion de imagenes con mascotas de marca o personajes recurrentes a partir de una unica referencia limpia.
- Prototipado en videojuegos y animacion: colocar disenos de personaje sobre escenas existentes para validar integracion visual antes de modelar en 3D, con la salvedad de que las referencias de multiples vistas rinden peor en v1.
- Aplicaciones interactivas y demos: el Space publicado demuestra el flujo completo en 8 pasos, lo que permite ofrecer la funcionalidad con tiempos de respuesta reducidos en comparacion con pipelines de decenas de pasos.
- Integracion en herramientas de diseno grafico: al ser un LoRA cargable en diffusers y ComfyUI, puede incorporarse a un flujo de trabajo interno de edicion por lotes sobre el modelo base ya desplegado, anadiendo solo 0,2 GB al almacenamiento del adaptador.
- Investigacion sobre edicion condicionada por multiples imagenes: el dataset de entrenamiento (76 tripletes reales, 220 sinteticos, 40 de preservacion) sirve como punto de partida reproducible para estudiar tecnicas de preservacion de escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta una validacion cualitativa: una rejilla de 18 filas (demo_grid_all18.png) y un GIF de demostracion donde cada fotograma muestra fuente, referencia de personaje y salida en 8 pasos. El autor indica que los resultados son mejores con referencias limpias de un solo personaje sobre fondos planos, y peores con hojas de personaje de multiples vistas y referencias mecanicas o de robots.

## Requisitos de hardware

- VRAM para el adaptador: el LoRA ocupa 0,2 GB; el consumo dominante corresponde al modelo base Qwen-Image-2.1-Turbo, cuyo requisito no se especifica en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende enteramente del modelo base.
- Coste de inferencia: el modelo base esta destilado para 8 pasos, lo que reduce el numero de evaluaciones del modelo de difusion frente a pipelines de decenas de pasos, aunque no se publican cifras de latencia ni de throughput.
- Opciones de despliegue: diffusers con QwenImage21Pipeline y load_lora_weights (pasando image=[source, reference]), y cargadores estilo ComfyUI. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo de difusion.
- Almacenamiento: 0,2 GB para el adaptador, mas el espacio de los pesos del modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| akhaliq/Qwen-Image-2.1-Turbo-Character-Swap-LoRA | LoRA de sustitucion de personaje, rango 32, 2016 pasos | Qwen/Qwen-Image-2.1-Turbo (8 pasos) | other | Repositorio HuggingFace con 0 descargas y 0 likes; Space de demo publicado | Referencias de multiples vistas y robots mas debiles en v1 |
| akatz-ai/MiniMax-H3-Character-Swap-LoRA | LoRA de sustitucion de personaje | MiniMax-H3 | no disponible | Repositorio HuggingFace | Receta de entrenamiento replicada por el adaptador de akhaliq |
| Qwen/Qwen-Image-Edit-2511 | Modelo de edicion de imagen | no disponible | no disponible | Repositorio HuggingFace | Utilizado para sintetizar 220 de los tripletes de entrenamiento |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Version v1 con debilidades reconocidas por el autor: funcionamiento peor con hojas de personaje de multiples vistas y con referencias mecanicas o de tipo robot.
- Rendimiento optimo limitado a referencias limpias de un unico personaje sobre fondos planos.
- Sin metricas cuantitativas publicadas: no hay MMLU, FID, CLIP score ni ninguna otra medida objetiva que permita estimar la tasa de exito real.
- Riesgo de alucinacion y de artefactos propio de los modelos de difusion: no se documentan evaluaciones de fidelidad de identidad ni de consistencia en la preservacion del fondo.
- Sesgos: no se documentan sesgos conocidos; el dataset de entrenamiento es pequeno (76 tripletes reales, 220 sinteticos, 40 de preservacion) y proviene de una unica fuente, lo que limita la diversidad demografica y de estilos.
- Licencia "other": las condiciones exactas de uso comercial no se detallan en la model card, y el uso queda ademas sujeto a la licencia del modelo base Qwen/Qwen-Image-2.1-Turbo, que debe verificarse por separado.
- Idiomas: la unica instruccion documentada esta en ingles; no se garantiza el funcionamiento con prompts en castellano u otros idiomas.
- Adopcion nula: 0 descargas y 0 likes, sin validacion por parte de la comunidad, lo que desaconseja su uso en produccion sin una evaluacion propia previa.
- El dataset sintetico se genero con Qwen/Qwen-Image-Edit-2511, por lo que el adaptador puede heredar sesgos y artefactos de ese generador.
- Fechas del repositorio (creado y actualizado el 2026-10-10) segun los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akhaliq/Qwen-Image-2.1-Turbo-Character-Swap-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Space de demostracion: https://huggingface.co/spaces/akhaliq/qwen-image-21-turbo-character-swap
- Dataset de entrenamiento: https://huggingface.co/datasets/akhaliq/qwen-21-turbo-character-swap-v1
- Dataset de origen (Apache-2.0): https://huggingface.co/datasets/akatz-ai/H3-Character-Swap-v1
- Receta de referencia: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA
- Modelo usado para sintetizar datos: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Herramienta de entrenamiento: https://github.com/modelscope/DiffSynth-Studio
- Rejilla de validacion completa: demo_grid_all18.png (incluida en el repositorio del modelo)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las busquedas devolvieron unicamente hilos de foro sin relacion (problemas de YouTube, software no deseado, Wuthering Waves, hardware y Catia V5R21).
