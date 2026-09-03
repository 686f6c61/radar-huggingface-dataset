# dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-d5d7bd82a7

## Resumen

Este repositorio contiene un checkpoint del decodificador World2Action (iteración 1800) perteneciente al framework MimicVideo, desarrollado por el usuario `dreamdifferent`. El modelo está diseñado específicamente para robótica: transforma observaciones de vídeo de dos cámaras en una secuencia de acciones de efector final y pinza para el brazo robótico WidowX250, entrenado en un entorno simulado Robosuite/Panda con textura de WidowX. Su relevancia radica en abordar el problema de mapeo vídeo-acción en clonación de comportamiento y modelos de mundo, un área activa en la investigación de manipulación robótica.

La arquitectura se compone de un backbone Video2World congelado, un LoRA de vídeo congelado y un decodificador de acciones entrenable. El repositorio tiene un tamaño de 1.0 GB y fue creado el 3 de septiembre de 2026. La licencia y los idiomas soportados no están disponibles en la información proporcionada, y el modelo no está pensado para tareas de lenguaje natural, sino exclusivamente para predicción de acciones robóticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador World2Action (basado en MimicVideo, backbone Video2World congelado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de vídeo de 2 cámaras) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Fecha de creación | 2026-09-03 |
| Tamaño del repositorio | 1.0 GB |

## Arquitectura y entrenamiento

El modelo es un decodificador de acciones dentro del pipeline MimicVideo. Se apoya en varios componentes congelados que deben descargarse por separado y coincidir con commits exactos: el backbone inicial Video2World (`widowx250-video-fused`), un decodificador de acciones inicial (`vam-cross-target-widowx250-native-2cam-action-decoder`) y un LoRA de vídeo congelado (`vam-cross-level2-panda-robosuite-widowx-texture-video-lora-iter-200`). El checkpoint subido corresponde a la iteración 1800 de un entrenamiento que se detuvo por una causa desconocida (`unknown`).

El conjunto de datos de entrenamiento consta de 280 episodios y 54.426 fotogramas, capturados con dos cámaras (`corner_cam` y `front_cam`). El objetivo es predecir 15 acciones de efector final y pinza a una frecuencia de 5 Hz. La pose objetivo se define como relativa a la pose actual lograda (`relative_to_current_achieved_pose`) en el sistema de referencia `widowx_reference_base/teleop_aligned_tool`, y la rotación se representa mediante la codificación `rotation_6d` para mejorar la estabilidad del entrenamiento.

## Capacidades

- Predicción de acciones de efector final y pinza para el robot WidowX250.
- Procesamiento de entrada de vídeo dual (cámara de esquina y cámara frontal).
- Generación de horizontes de acción de 3 segundos (15 pasos a 5 Hz).
- Uso de representación de rotación 6D para una regresión angular más robusta.
- Integración específica con el framework MimicVideo y sus componentes congelados.
- No tiene capacidades de lenguaje natural, visión general, tool calling ni razonamiento simbólico.

## Casos de uso

- Clonación de comportamiento para manipulación robótica: el modelo puede aprender políticas de control a partir de demostraciones humanas teleoperadas, capturadas en el formato de datos especificado.
- Desarrollo de políticas de control para el brazo WidowX250: permite generar comandos de bajo nivel para este robot concreto en entornos simulados.
- Investigación en transferencia Sim2Real: al entrenar con texturas de WidowX sobre el entorno Panda/Robosuite, puede servir para estudiar la brecha entre simulación y mundo real.
- Componente para sistemas de teleoperación aumentada: al predecir acciones relativas a la pose actual, puede integrarse en bucles de control que asisten al operador humano.
- Benchmarking de decodificadores de acción en frameworks de modelos de mundo: útil para comparar arquitecturas de decodificación dentro del ecosistema MimicVideo.
- Generación de trayectorias de bajo nivel para planificadores de alto nivel: las 15 acciones predichas pueden servir como primitivas para un planificador de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 1.0 GB (solo los pesos del decodificador).
- VRAM estimada para inferencia: no disponible, depende del backbone Video2World congelado que debe cargarse junto al decodificador.
- GPU recomendadas: no disponible.
- Opciones de despliegue: no disponible. No es un modelo para llama.cpp, Ollama o TGI; requiere el framework MimicVideo y los componentes congelados específicos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la información suministrada.

## Limitaciones y advertencias

- Licencia no disponible, lo que impide determinar si es apto para uso comercial sin una verificación legal previa.
- Dependencia de artefactos externos con commits exactos (backbone, LoRA y decodificador inicial) que deben descargarse por separado.
- El dataset y los componentes congelados no están incluidos en este repositorio.
- El entrenamiento se detuvo por una causa desconocida (`unknown`), lo que puede indicar inestabilidad o finalización abrupta.
- Especializado en un dominio muy concreto (WidowX250 con textura específica, entorno Robosuite/Panda). No es generalizable a otros robots o entornos sin reentrenamiento.
- Sin métricas de rendimiento publicadas ni validación comunitaria (0 descargas y 0 likes).

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-d5d7bd82a7)
- Nota: los componentes congelados se referencian por ID en el README (backbone, LoRA y decodificador inicial), pero no se proporcionan URLs directas en la información dada.
