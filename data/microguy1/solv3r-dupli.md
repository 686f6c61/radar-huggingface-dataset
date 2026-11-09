# Microguy1/solv3r-DUPLI

## Resumen

Solv3R es un transformer con bucles ("looped transformer") disenado como solver de geometria multi-vista: recibe un conjunto de imagenes de una misma escena y estima camaras, profundidad y nubes de puntos 3D. Lo desarrolla el grupo UBC Vision en colaboracion con NVIDIA (los pesos se construyen sobre DVLT, el modelo de NVIDIA), y se publica como articulo en arXiv (2611.02857) con pesos preentrenados en este repositorio.

Su aportacion tecnica central es que el operador de actualizacion es independiente del numero de iteraciones: el modelo puede seguir refinando un estado parcialmente resuelto e incorporar vistas nuevas a mitad del proceso sin reiniciar el calculo. Esto lo diferencia de los enfoques feed-forward de un solo paso, que fijan el numero de vistas y no permiten refinamiento iterativo.

El repositorio tiene un tamano de 0,5 GB y contiene pesos en formato safetensors. La licencia es la NVIDIA License, restringida a uso no comercial de investigacion y evaluacion. No se han publicado datos de benchmarks ni especificaciones de parametros o contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) construido sobre DVLT de NVIDIA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre conjuntos de vistas, no sobre tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | NVIDIA License (other), uso no comercial de investigacion y evaluacion |
| Formato de pesos | safetensors (solv3r.safetensors) |

## Arquitectura y entrenamiento

Solv3R es un transformer con bucles que aprende a continuar resolviendo geometria multi-vista a partir de su estado actual. La innovacion clave es que el operador de actualizacion no depende del numero de iteraciones: las vistas ya refinadas y las recien introducidas se actualizan conjuntamente con independencia de su grado de resolucion. El modelo expone una API en tres fases (`encode`, `solve`, `decode`): codifica las imagenes en un contexto, ejecuta un numero configurable de llamadas de refinamiento (`calls=16` en el ejemplo) y decodifica el estado en profundidad, confianza de profundidad, rayos, puntos de mundo y codificacion de pose (`pose_enc`), de la que se derivan la matriz camara-a-mundo (c2w) y la matriz intrinseca (K).

Los pesos se construyen sobre DVLT (nv-tlabs/dvlt). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. El articulo esta firmado por Kwak, Tagliasacchi, Kagami, Ono y Yi.

## Capacidades

- Reconstruccion 3D multi-vista a partir de un conjunto de imagenes de una escena.
- Estimacion de poses de camara (c2w y matriz intrinseca K) mediante `cameras_from_pose_enc`.
- Prediccion de mapas de profundidad y de confianza de profundidad.
- Prediccion de rayos y nubes de puntos en coordenadas de mundo (`world_points`).
- Refinamiento iterativo con numero de iteraciones configurable (`calls`).
- Incorporacion de vistas nuevas a mitad del proceso de resolucion sin reiniciar el calculo.
- Actualizacion conjunta de vistas parcialmente resueltas y vistas nuevas.
- No soporta tool calling, agentes, texto ni capacidades linguisticas: es un modelo puramente de vision y geometria.

## Casos de uso

- Digitalizacion de interiores: capturar un conjunto de fotografias de una habitacion y obtener poses de camara, profundidad y nube de puntos para generar una malla o un gemelo digital, aprovechando el refinamiento iterativo para mejorar la precision con mas llamadas.
- Fotogrametria incremental: procesar primero un subconjunto de vistas y anadir despues nuevas imagenes con `solve`, ya que el operador de actualizacion no depende del numero de iteraciones y admite vistas recien introducidas.
- Previsualizacion en pipelines de captura: estimar poses aproximadas con pocas iteraciones para dar feedback rapido al operador y refinarlas despues con un numero mayor de `calls`.
- Investigacion en vision 3D: banco de pruebas para estudiar solvers iterativos de geometria multi-vista frente a enfoques feed-forward, con pesos de referencia y codigo publico.
- Generacion de datos sinteticos y aumento de datasets: obtener profundidad y puntos de mundo a partir de imagenes existentes para anotar escenas sin sensores de profundidad.
- Ancla para reconstruccion densa: usar `world_points` y `depth_conf` como inicializacion de metodos de optimizacion multi-vista o de mallas neuronales.
- Evaluacion comparativa de metodos de reconstruccion: al ser un modelo de investigacion con licencia no comercial, encaja en entornos academicos de comparacion de baselines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio pesa 0,5 GB, lo que da una cota inferior del peso de los parametros, pero no se especifica el consumo en ejecucion ni el coste de memoria del contexto multi-vista.
- GPU recomendadas: no disponible. Al construirse sobre DVLT de NVIDIA, es razonable esperar soporte para GPUs NVIDIA, pero no se confirma en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: el paquete Python `solv3r` (`Solv3R.from_pretrained()`), que descarga `solv3r.safetensors` del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste de inferencia escala con el numero de llamadas de `solve` (`calls`), que es configurable.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de reconstruccion 3D multi-vista con datos de parametros, contexto o rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia NVIDIA License: uso no comercial, unicamente para investigacion y evaluacion. No apto para produccion comercial sin licencia adicional.
- No se han publicado benchmarks ni metricas de precision; no es posible evaluar su calidad frente a alternativas sin ejecutarlo.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento, que en modelos de vision 3D suele traducirse en peor rendimiento en escenas, iluminaciones o geometrias poco representadas.
- Riesgo de alucinacion geometrica: como cualquier estimador, puede producir profundidades y poses plausibles pero incorrectas en regiones con poca textura, oclusiones o movimientos no rigidos.
- El numero de iteraciones (`calls`) afecta al coste y probablemente a la precision; no se documenta la relacion entre ambos.
- Modelo sin capacidades linguisticas ni de texto: no admite prompts, tool calling ni agentes.
- No se especifican requisitos de hardware ni limites de numero de vistas; conviene validar el consumo de memoria antes de desplegar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Microguy1/solv3r-DUPLI
- Articulo arXiv: https://arxiv.org/abs/2611.02857
- Pagina del proyecto: https://ubc-vision.github.io/solv3r/
- Codigo: https://github.com/ubc-vision/solv3r
- DVLT (base de NVIDIA): https://github.com/nv-tlabs/dvlt
