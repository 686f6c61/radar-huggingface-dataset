# dreamdifferent/vam-cross-level5-so101-widowx-texture-video-lora-iter-200

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) para el modelo de generación de video `fused_video2world_dit`, desarrollado por el usuario `dreamdifferent`. El adaptador está diseñado específicamente para el brazo robótico WidowX250 y permite generar videos de demostración de una tarea de manipulación (recoger una vela y colocarla en un cuenco) a partir de una instrucción en lenguaje natural. Se trata de un checkpoint de entrenamiento parcial (iteración 200) que no es autónomo: requiere cargar primero el backbone base indicado en la documentación y aplicar después este LoRA.

La relevancia de este modelo radica en su enfoque de adaptación eficiente para robótica: en lugar de entrenar un modelo completo de generación de video, se utiliza un LoRA de rango 256 sobre un DiT fusionado, lo que reduce significativamente los requisitos de cómputo y datos. El modelo está pensado para ser usado con el framework MimicVideo y el tokenizador de video asociado, y su entrenamiento se realizó con un dataset de 158 episodios y 54 261 frames provenientes de dos cámaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 256) sobre `fused_video2world_dit` (DiT de difusion de video) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (adaptador LoRA, no se especifica) |
| Longitud de contexto | no disponible (generacion de video, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instruccion en ingles en el dataset) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint, probablemente .pt o .safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 256 que se aplica sobre un modelo de difusion de video basado en DiT (`fused_video2world_dit`). El backbone inicial ya incluye una fusion previa de LoRA de WidowX/Bridge, por lo que no debe cargarse el backbone original de Bridge. El entrenamiento se realizo con el framework MimicVideo, utilizando un dataset propio con 158 episodios y 54 261 frames, muestreados a 5 Hz. Las observaciones provienen de dos camaras (`corner_cam` y `front_cam`) combinadas en una vista apilada horizontalmente (`hstack`). La instruccion fija del dataset es "pick up the candle and place it into the bowl". No se mencionan tecnicas de RLHF, DPO ni otras innovaciones mas alla de la adaptacion LoRA.

## Capacidades

- Generacion de video condicionada por instruccion textual para tareas roboticas de manipulacion.
- Soporte de dos camaras simultaneas (esquina y frontal) con vista apilada horizontalmente.
- Adaptacion especifica a la tarea de recoger y colocar objetos (vela en cuenco) sobre el brazo WidowX250.
- Integracion con el pipeline de MimicVideo para generacion de video2world.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras funcionalidades genericas.

## Casos de uso

- Generacion de datos sinteticos para entrenamiento de politicas de control robotico: el modelo puede producir videos de demostracion variados que complementen datasets reales, mejorando la robustez de politicas visuomotoras.
- Aumento de datos para aprendizaje por imitacion: al generar multiples variaciones de la misma tarea, se amplia la cobertura de estados y se reduce el sobreajuste.
- Simulacion de escenarios de manipulacion para validacion de algoritmos de planificacion de movimientos antes de probarlos en el robot fisico.
- Creacion de conjuntos de datos etiquetados para evaluacion de modelos de percepcion robotica, aprovechando la sincronizacion de dos camaras.
- Generacion de videos de demostracion para teleoperacion asistida o para entrenamiento de operadores humanos en entornos simulados.
- Pruebas de concepto en investigacion de generacion de video condicionada por instrucciones en el dominio robotico, sirviendo como base para experimentos con otras tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU recomendadas.
- El backbone base (`fused_video2world_dit`) ocupa aproximadamente 3,9 GB en disco, y el adaptador LoRA 0,7 GB, por lo que se requiere una GPU con al menos 8-12 GB de VRAM para cargar el modelo completo, aunque no se confirma.
- El despliegue requiere el framework MimicVideo y los artefactos de runtime especificados (tokenizador de video, T5 text encoder).
- No se indican opciones de despliegue como vLLM, llama.cpp u Ollama; el modelo esta pensado para el pipeline de MimicVideo.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada, aunque existe otro adaptador similar del mismo autor para el brazo KUKA IIWA14 (`vam-cross-level5-kuka-iiwa14-widowx-texture-teleopaligned-videolora400-action-decoder-iter1800`), pero no se dispone de datos suficientes para una comparacion tecnica.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere cargar el backbone exacto especificado (`dreamdifferent/widowx250-video-fused` en la revision `f0cea76b62c5dd66b06b9f965932ddea32a7b546`) y los artefactos de runtime de MimicVideo.
- La licencia no esta especificada, por lo que se desconoce si permite uso comercial o modificacion.
- El dataset de entrenamiento no esta incluido y su acceso esta sujeto a politicas externas (MimicVideo, NVIDIA Cosmos, etc.).
- El modelo esta especializado en una unica tarea (recoger vela y colocarla en cuenco) y puede no generalizar a otras instrucciones o entornos.
- No se documentan sesgos especificos, pero al entrenarse con un dataset limitado (158 episodios) existe riesgo de sobreajuste y alucinaciones visuales en escenarios fuera de distribucion.
- La fecha de creacion (2026-08-28) es posterior a la fecha actual, lo que sugiere que el modelo podria ser experimental o estar en desarrollo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/dreamdifferent/vam-cross-level5-so101-widowx-texture-video-lora-iter-200)
- [Adaptador similar para KUKA IIWA14](https://huggingface.co/dreamdifferent/vam-cross-level5-kuka-iiwa14-widowx-texture-teleopaligned-videolora400-action-decoder-iter1800)
- [Perfil del autor en HuggingFace](https://huggingface.co/dreamdifferent)
