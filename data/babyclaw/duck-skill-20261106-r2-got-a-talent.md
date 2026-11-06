# BabyClaw/duck-skill-20261106-r2-got-a-talent

## Resumen

Duck Skill Evening Solo es una politica de control para el robot cuadrupedo MicroDuck de Pollen Robotics, presentada al evento "got-a-talent" de la MicroDuck Arena. No es un modelo de lenguaje: se trata de un artefacto de aprendizaje por refuerzo que genera una secuencia de acciones motoras de 20 segundos (26 notas musicales, gestos de cabeza en cuatro ejes y dos ciclos de sentarse/levantarse) a partir de 61 observaciones de entrada y 14 salidas de accion. El autor, BabyClaw, lo publica como parte de la ronda 2 de una busqueda de politicas para esa competicion.

El modelo se distribuye como un grafo ONNX para inferencia en CPU y esta pensado para ejecutarse en el simulador o en el hardware MicroDuck dentro del entorno de la Arena. La innovacion declarada es una busqueda afina compartida de 28 parametros con compensacion de feedback que mejora el seguimiento de cabeza estabilizado. El repositorio es de 0.0 GB, sin descargas ni likes en el momento de la consulta, y la model card es explicita: las puntuaciones locales son indicativas y el resultado oficial lo mide la Arena.

Por su naturaleza, esta ficha debe leerse como la de un artefacto de robotica y no como la de un modelo fundacional. No hay pesos en safetensors ni tokenizador, no hay capacidades linguisticas y la mayoria de los parametros habituales (contexto, idiomas, cuantizacion) no aplican. Se documenta lo que el autor declara y se marca como "no disponible" todo lo que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control para robot cuadrupedo, exportada como grafo ONNX; busqueda afina de 28 parametros sobre una politica donante |
| Parametros totales | no disponible (la model card solo detalla 28 parametros de la busqueda afina, no el total de la politica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; 61 observaciones de entrada por paso de control |
| Tipos de cuantizacion | no disponible (inferencia ONNX en CPU; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con SHA-256 `c8c6999febed8d627b9222c073c6afd65bd16b56b9ba75aecbd50c407264664a` |

## Arquitectura y entrenamiento

La politica es un controlador que mapea 61 observaciones a 14 acciones, ejecutado mediante inferencia ONNX en CPU. El autor no describe la topologia interna de la red (capas, dimensiones ocultas, tipo de encoder); solo indica el numero de entradas y salidas y el formato de despliegue. El entrenamiento se enmarca en aprendizaje por refuerzo con una busqueda afina de 28 parametros compartidos ("shared28-parameter affine search with feedback compensation") sobre una politica donante con SHA-256 `d35823fd1e364dc2075cceeadc849b7317b8bbf7d91b695c5a509b3c3660d3e6`, en la rama de busqueda `expressive-jointscale`, generacion 68.

El proceso de seleccion uso 40 semillas de desarrollo (1001 a 1040) y una semilla de origen de entrenamiento 81001. El criterio de seleccion declarado prioriza mejorar el RMSE estabilizado, la media de retencion y la inclinacion, manteniendo un error de pico de cabeza cercano al de la linea base; el autor senala que alternativas con menor error promedio tenian mayores errores de pico o deriva. La provenance incluye hashes de la seleccion, la linea temporal congelada, la evaluacion de desarrollo y las metricas finales, lo que permite verificar la integridad del artefacto. No se documentan volumen de datos de entrenamiento, composicion del dataset ni uso de RLHF o DPO (no aplican en este dominio).

## Capacidades

- Generacion de una rutina motora de 20 segundos con 26 notas musicales sincronizadas con movimientos del robot.
- Gestos de cabeza combinados en cuatro ejes.
- Dos ciclos completos de sentarse y levantarse (slot `sitstand`).
- Seguimiento de cabeza estabilizado, con mejora declarada del RMSE en fase estabilizada.
- Inferencia en CPU mediante ONNX, sin requisito de GPU.
- Reproducibilidad verificable mediante hashes SHA-256 de politica, linea temporal y evaluaciones.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Participacion en la MicroDuck Arena: el artefacto esta disenado para el evento "got-a-talent" y puede enviarse directamente a la Arena para obtener la puntuacion oficial, ya que incluye la politica congelada y la linea temporal verificable.
- Demostracion de robotica de entretenimiento: la rutina de 20 segundos con 26 notas y gestos de cabeza sirve como pieza de exhibicion en ferias o demos de laboratorio con el cuadrupedo MicroDuck.
- Investigacion en busqueda de politicas: los 28 parametros de la busqueda afina y las 40 semillas de desarrollo permiten reproducir el experimento y comparar variantes de la rama `expressive-jointscale`.
- Evaluacion de tecnicas de compensacion de feedback: el autor declara compensacion de feedback en la busqueda; el artefacto sirve como caso de estudio para medir su efecto en el seguimiento de cabeza estabilizado.
- Benchmarking de controladores en CPU: al ejecutarse como ONNX en CPU, permite medir latencia y throughput de un controlador de robot sin depender de aceleradores, util para comparar pipelines de inferencia en hardware embebido.
- Verificacion de integridad de artefactos de RL: la provenance con hashes encadenados (seleccion, politica, linea temporal, evaluacion) es un ejemplo practico de trazabilidad reproducible en publicaciones de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona metricas locales (RMSE estabilizado, media de retencion, inclinacion, error de pico de cabeza) y afirma que "All40dev starts pass", pero no incluye los valores numericos en el texto proporcionado; ademas, el propio autor advierte que las puntuaciones locales son indicativas y que el resultado oficial lo mide la Arena.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia es ONNX en CPU.
- GPU recomendadas: no se requiere GPU; el autor indica explicitamente inferencia en CPU.
- Compatibilidad con GPU de consumo: no aplica, al no necesitar GPU.
- Opciones de despliegue: ONNX Runtime (CPU) y el entorno de la MicroDuck Arena; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Duck Skill Evening Solo (BabyClaw) | Politica RL para MicroDuck, evento got-a-talent | 61 / 14 | ONNX (CPU) | no disponible | Hugging Face, 0 descargas |
| Politica donante (`d35823fd...`) | Politica RL base sobre la que se aplica la busqueda afina | no disponible | no disponible | no disponible | Referenciada por hash en la provenance |
| Otras politicas de la MicroDuck Arena | Politicas RL para el mismo robot y evento | no disponible | no disponible | no disponible | Publicadas en la Arena de Pollen Robotics |

No se dispone de datos publicos de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- La licencia no esta declarada; no puede asumirse uso comercial sin consultar al autor.
- Las metricas locales son indicativas segun el propio autor; el resultado oficial depende de la evaluacion en la Arena y no se ha verificado aqui.
- La preferencia del publico ("audience preference") no se ha medido, segun la model card.
- El artefacto esta acotado a una rutina concreta (20 segundos, 26 notas, dos ciclos sit/stand) y al robot MicroDuck; no es generalizable a otras tareas o plataformas.
- No hay informacion sobre sesgos, alucinacion o limitaciones de contexto porque no es un modelo de lenguaje; esos riesgos no aplican, pero si aplica el riesgo de sobreajuste a las 40 semillas de desarrollo y a la rutina especifica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de validacion independiente.
- La ausencia de detalles sobre la topologia de la red y el numero total de parametros limita la reproducibilidad tecnica mas alla de los hashes y los 28 parametros de busqueda publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyClaw/duck-skill-20261106-r2-got-a-talent
- Evento en la MicroDuck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/got-a-talent
- Repositorio de la Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
