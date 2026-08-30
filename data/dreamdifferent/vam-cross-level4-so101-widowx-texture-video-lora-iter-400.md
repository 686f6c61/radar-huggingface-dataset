# dreamdifferent/vam-cross-level4-so101-widowx-texture-video-lora-iter-400

## Resumen

Este repositorio contiene un adaptador LoRA de tipo Video2World, desarrollado por el usuario dreamdifferent, para el modelo de generación de video `fused_video2world_dit` del robot WidowX250. Se trata de un checkpoint de entrenamiento correspondiente a la iteración 400 de una ejecución más larga (`v2w_so101_level4_widowx_texture_2cam_hstack_from_widowx250_video_fused_f0cea76_lora_r256`), cuyo estado final fue `walltime`. El adaptador permite condicionar la generación de video a partir de instrucciones en lenguaje natural y dos cámaras (corner y front) combinadas en formato `hstack` a 5 Hz.

El modelo no es un sistema autónomo, sino un adaptador que debe cargarse sobre un backbone específico (`dreamdifferent/widowx250-video-fused`, revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`). Su relevancia radica en que facilita la generación de vídeos sintéticos de manipulación robótica, lo que puede emplearse para aumentar datos de entrenamiento o simular comportamientos en entornos controlados. El repositorio incluye los artefactos de configuración necesarios (config.yaml, manifiestos) y referencia el commit exacto de MimicVideo y el tokenizador de video requeridos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Video2World DiT (fused_video2world_dit) |
| Parametros totales | no disponible (el repo ocupa 3.7 GB, pero el peso del adaptador no se especifica) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (las instrucciones parecen estar en ingles, pero no se declara) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente .pt o safetensors, pero no se indica) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura `fused_video2world_dit`, un modelo de difusion de video (DiT) que ya incorpora una fusion previa de LoRA de WidowX/Bridge. El checkpoint de LoRA aqui publicado se entrena sobre ese backbone fusionado, no sobre el Bridge original, como se advierte en la model card. El entrenamiento utilizo el codigo de MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`) y un tokenizador de video especifico (`video_backbone/tokenizer/tokenizer.pth`), junto con el codificador de texto T5-11B.

Los datos de entrenamiento provienen de un dataset con 151 episodios y 54 340 frames, capturados con dos camaras (`corner_cam` y `front_cam`) en formato `hstack` a 5 Hz. Se emplearon 29 instrucciones condicionadas por episodio, listadas en el manifiesto `vam_cross_video_lora_manifest.json`. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; el entrenamiento parece ser puramente supervisado sobre pares instruccion-video.

## Capacidades

- Generacion de video condicionada por instrucciones en lenguaje natural para tareas de manipulacion robotica (especificamente sobre el robot WidowX250).
- Soporte de entrada de dos camaras simultaneas (corner y front) combinadas en una vista `hstack`.
- Generacion de secuencias de video a 5 Hz, adecuadas para simulacion de movimientos de pinza y brazo.
- Adaptacion especifica a un backbone fusionado que ya incluye conocimiento previo de WidowX/Bridge.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje general; el modelo esta especializado en la tarea de video2world.

## Casos de uso

- Generacion de datos sinteticos para entrenamiento de politicas roboticas: el modelo puede producir videos de manipulacion variados a partir de instrucciones, ampliando el conjunto de datos reales sin necesidad de capturas fisicas adicionales.
- Simulacion de escenarios de agarre y colocacion: al condicionar con instrucciones como "coger el objeto rojo y colocarlo en la caja", se pueden generar secuencias de video que sirvan como ground truth para evaluar algoritmos de planificacion.
- Aumento de datos para aprendizaje por imitacion: los videos generados pueden combinarse con demostraciones reales para entrenar modelos de clonacion de comportamiento, mejorando la robustez ante variaciones de iluminacion o perspectiva.
- Validacion de politicas en entornos simulados: antes de desplegar un controlador en el robot fisico, se pueden generar videos de la ejecucion esperada y compararlos con la salida real del sistema.
- Creacion de demos para teleoperacion: el modelo puede generar videos de referencia que guien a un operador humano en tareas complejas, mostrando la secuencia de movimientos esperada.
- Investigacion en generacion de video condicionada por lenguaje para robotica: sirve como base para estudiar la transferencia de conocimiento entre dominios (simulacion-real) y la fusion de multiples vistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de video (FVD, IS, etc.) ni comparaciones con otros modelos de generacion de video para robotica.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de difusion de video de gran tamano (el backbone pesa ~3.9 GB solo en el checkpoint), se requiere una GPU con al menos 16-24 GB de VRAM para cargar el modelo completo y el adaptador.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para inferencia con margen.
- No se especifican requisitos minimos ni opciones de cuantizacion; el despliegue se realiza mediante el codigo de MimicVideo, que probablemente use PyTorch y CUDA.
- No se indican opciones de despliegue como vLLM, llama.cpp u Ollama; al ser un modelo de video, se espera un pipeline propio de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA para generacion de video robotico con backbone WidowX). La model card no menciona alternativas ni benchmarks comparativos.

## Limitaciones y advertencias

- Es un adaptador, no un modelo standalone: requiere cargar el backbone exacto (`fused_video2world_dit` con revision `f0cea76b62c5dd66b06b9f965932ddea32a7b546`) y el codigo de MimicVideo en el commit indicado; cargar otro backbone o revision puede producir resultados incorrectos.
- El dataset de entrenamiento no esta incluido y su acceso esta sujeto a la politica del propietario; los usuarios deben cumplir con los terminos de MimicVideo, NVIDIA Cosmos y del checkpoint base.
- La licencia del modelo no esta especificada, por lo que el uso comercial es incierto y requiere consulta directa con el autor.
- No se documentan sesgos especificos, pero al entrenarse sobre un unico robot (WidowX250) y un conjunto limitado de tareas (29 instrucciones), la generalizacion a otros robots o escenarios es muy limitada.
- Riesgo de alucinacion en la generacion de video: como todo modelo generativo, puede producir secuencias fisicamente imposibles o inconsistentes con la instruccion, especialmente fuera del dominio de entrenamiento.
- El checkpoint es de la iteracion 400 y el entrenamiento termino por `walltime`, no por convergencia; podria no representar el mejor rendimiento posible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level4-so101-widowx-texture-video-lora-iter-400
- Backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused (revision `f0cea76b62c5dd66b06b9f965932ddea32a7b546`)
- Repositorio de MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`): no se proporciona URL directa en la informacion.
- Bundle de checkpoints de MimicVideo: `jonpai/mimic-video@f28339034831e3c2374be075e622e1ff38ebe0f8` (no se incluye URL).
- Dataset de entrenamiento: `dreamdifferent/vam-cross-level4-so101-widowx-texture@4d2d4b0418eccc9f9398a2745ad2e4ed766a4ef6` (no se incluye URL).
