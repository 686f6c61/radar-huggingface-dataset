# ishitag925/pi05-bee-frame-pickup-yaw7-297-seated16-full-20261110

## Resumen

Pi0.5 bee-frame pickup es un modelo de politica robotica (vision-language-action, VLA) obtenido mediante ajuste fino del modelo Pi0.5 de Physical Intelligence sobre un conjunto de datos propio de demostraciones de robot. Lo publica el usuario ishitag925 en Hugging Face bajo la libreria `openpi`, la implementacion oficial de Physical Intelligence, y esta especializado en una tarea concreta de manipulacion: recoger un marco de abeja (bee-frame) con un robot Piper-X en una configuracion concreta de yaw y asiento. No es un modelo de lenguaje general, sino un checkpoint de politica que mapea observaciones visuales y estado del robot a acciones motoras.

El modelo se distribuye como checkpoints intermedios cada 500 actualizaciones de optimizador, con los parametros completos de la politica y los activos de normalizacion. El autor advierte explicitamente de que no existe un split de evaluacion reservado y de que la perdida de entrenamiento no demuestra exito de la politica, algo critico para cualquier evaluacion real.

Su relevancia es acotada: sirve como ejemplo reproducible de ajuste fino de Pi0.5 con OpenPI para una tarea de picking especifica, y como punto de partida para quien quiera replicar el pipeline o adaptar el modelo a otra tarea de manipulacion con el mismo hardware. No hay informacion publica sobre arquitectura detallada, numero de parametros ni contexto en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de politica VLA basado en Pi0.5, segun tags) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoints bajo `checkpoints/STEP/`; formato de fichero no especificado) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por los tags (`pi05`, `openpi`, `robotics`) y la libreria (`openpi`), se trata de un ajuste fino del modelo Pi0.5 de Physical Intelligence usando la implementacion oficial OpenPI. El entrenamiento se realizo sobre el dataset `ishitag925/bee-frame-pickup-yaw7-297-seated16-lerobot`, en formato LeRobot, con una tarea de recogida de bee-frame sobre un robot Piper-X y una configuracion concreta de yaw 7 y asiento 16.

El autor indica que los checkpoints se publican cada 500 actualizaciones de optimizador y que cada uno contiene los parametros completos de la politica mas los activos de normalizacion; el estado del optimizador no se publica (permanece en MIT para reanudar). La receta exacta esta en `run_config.json` y `project_config.py` del repositorio. No se especifican numero de tokens, composicion del dataset, ni si hubo RLHF o DPO; al ser un ajuste fino supervisado de una politica robotica, lo esperable es imitacion de demostraciones, pero no esta confirmado en la informacion disponible.

## Capacidades

- Generacion de acciones motoras para un robot Piper-X en la tarea de recogida de bee-frame.
- Procesamiento de observaciones visuales y estado del robot como entrada (politica VLA).
- Ejecucion de una tarea de manipulacion especializada, entrenada sobre demostraciones propias.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni multilingues.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Replicacion de la tarea de picking: usar el checkpoint para recoger un bee-frame con un Piper-X en la configuracion yaw 7 / asiento 16, tal como se entreno.
- Punto de partida para ajuste fino adicional: reutilizar los parametros y activos de normalizacion como inicializacion para una tarea de manipulacion relacionada.
- Referencia de pipeline OpenPI: estudiar `run_config.json` y `project_config.py` para reproducir el flujo de entrenamiento y publicacion de checkpoints cada 500 pasos.
- Evaluacion de robustez de politicas VLA: comparar el comportamiento de distintos checkpoints (`checkpoints/STEP/`) sobre la misma tarea para analizar la evolucion del entrenamiento.
- Banco de pruebas de integracion hardware-software: validar la cadena de inferencia con un robot Piper-X real o simulado antes de desplegar una politica propia.
- Docencia e investigacion en robotica: ejemplo concreto y reproducible de ajuste fino de un VLA sobre un dataset LeRobot para cursos o laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor senala ademas que no existe split de evaluacion reservado y que la perdida de entrenamiento no establece exito de la politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria indicada es `openpi`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05-bee-frame-pickup-yaw7-297-seated16-full-20261110 | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| Pi0.5 base (Physical Intelligence) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sin split de evaluacion reservado: no hay evidencia publicada de tasa de exito de la politica.
- La perdida de entrenamiento no es indicador de exito en tareas roboticas; el autor lo advierte explicitamente.
- Especializacion extrema: entrenado para una tarea, robot (Piper-X) y configuracion (yaw 7, asiento 16) concretos; no se espera generalizacion fuera de ese dominio.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idiomas y contexto no documentados; irrelevantes para una politica robotica pero ausentes en la ficha.
- Estado del optimizador no publicado: no es posible reanudar el entrenamiento exactamente desde estos checkpoints.
- Riesgo de sobreajuste a las condiciones de recogida de datos (iluminacion, posicion de camara, objeto) no cuantificado.
- Sin datos de sesgos, alucinacion o limitaciones de contexto aplicables a un modelo de politica.

## Enlaces

- Hugging Face: https://huggingface.co/ishitag925/pi05-bee-frame-pickup-yaw7-297-seated16-full-20261110
- Dataset de entrenamiento: https://huggingface.co/datasets/ishitag925/bee-frame-pickup-yaw7-297-seated16-lerobot
- OpenPI (implementacion oficial de Physical Intelligence): no disponible en la informacion proporcionada
- Pi0.5 (modelo base): no disponible en la informacion proporcionada
