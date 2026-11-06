# HarleyCooper/asterix-self-improved-04

## Resumen

Asterix self-improved 04 es un checkpoint de aprendizaje por refuerzo (RL) para el entorno Atari Asterix dentro del conjunto de tareas MinAtar 1.0.15. No es un modelo de lenguaje: se trata de una red neuronal de politica entrenada para jugar a Asterix, derivada de la red Asterix publicada por Rikiya Takehi y colaboradores en el repositorio RikiyaT/lm_understand-logs, y continuada por HarleyCooper mediante entrenamiento por gradiente bajo el objetivo de retorno medio solicitado por el usuario.

El artefacto parte de los pesos publicados de la ejecucion run03 y los refina incorporando una auditoria previa (episodios 90000-90127) como memoria de etiquetas fijas, preservando la fisica nativa del juego. El checkpoint resultante se evalua en dos conjuntos: uno de desarrollo (donde se observa una ganancia media de +1,33) y uno de retencion (held-out) con una ganancia practicamente nula (+0,014) y un intervalo de confianza bootstrap del 95% que cruza cero, lo que indica que la mejora no es estadisticamente significativa.

Su relevancia es acotada y experimental: documenta un intento de auto-mejora recursiva sobre un agente RL de juguete, con divulgacion transparente de victorias, derrotas y empates. El tamano real del artefacto es de 20.486 parametros, con un repositorio de 0,0 GB y sin descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica para RL (detalles no disponibles) |
| Parametros totales | 20.486 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entorno RL) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la topologia interna de la red (numero de capas, dimensiones ocultas ni funcion de activacion). Se sabe que es una red de politica entrenada por gradiente bajo las reglas oficiales de MinAtar 1.0.15, el entorno simplificado de Atari que reduce la observacion a una rejilla de 10x10 con canales por tipo de entidad. El entrenamiento parte de los pesos de run03 del autor original y aplica una continuacion con un objetivo de retorno medio (mean_return), incorporando la auditoria de los episodios 90000-90127 como memoria de etiquetas fijas para evitar regresiones de retorno y supervivencia.

La innovacion metodologica declarada es la "continuacion condicionada por fallos": las regresiones detectadas en la auditoria previa se fijan como etiquetas y se integran en el entrenamiento, mientras que la auditoria final (110000-110511) se reserva y no se usa para seleccion de modelo. No se especifican volumen total de episodios de entrenamiento, composicion del dataset ni uso de RLHF/DPO (no aplica en este contexto).

## Capacidades

- Jugar a Asterix en el entorno MinAtar 1.0.15 bajo la fisica nativa del juego.
- Politica de accion entrenada para maximizar el retorno medio episodico.
- Continuacion de entrenamiento desde pesos preexistentes (run03).
- Memoria de etiquetas fijas para evitar regresiones en retorno y supervivencia.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion en RL de juguete: servir como checkpoint de referencia para estudiar la estabilidad de la auto-mejora recursiva en MinAtar, comparando la ganancia en desarrollo (+1,33) frente a la de retencion (+0,014).
- Reproducibilidad de experimentos: permite replicar la continuacion desde run03 bajo las reglas de MinAtar 1.0.15 y verificar los resultados de las auditorias publicadas.
- Estudio de sobreajuste en seleccion de modelo: el contraste entre el conjunto de desarrollo y el held-out ilustra como la seleccion por retorno medio puede inflar la mejora observada.
- Analisis de regresiones condicionadas por fallos: util para evaluar la estrategia de fijar etiquetas de episodios fallidos y su efecto en la politica final.
- Benchmark de agentes MinAtar: punto de comparacion cuantitativo (medias antes/despues, victorias, derrotas, empates y supervivientes perdidos) para nuevos metodos.
- Docencia y divulgacion: ejemplo compacto (20.486 parametros) de un pipeline RL completo con auditoria transparente y simulador publico asociado.

## Benchmarks y rendimiento

| Conjunto | Antes (media) | Despues (media) | Ganancia | Victorias | Derrotas | Empates | Supervivientes perdidos |
|---|---|---|---|---|---|---|---|
| Desarrollo | 57,9097 | 59,2361 | +1,3264 | 77 | 70 | 141 | 12 |
| Held-out (retencion) | 55,3438 | 55,3574 | +0,0137 | 140 | 155 | 217 | 68 |

Intervalo bootstrap del 95% para la ganancia media pareada en held-out: [-0,8282, 0,8652]. Al incluir el cero, la mejora observada no es estadisticamente significativa. No se han publicado resultados de benchmarks comparativos con otros agentes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (20.486 parametros en safetensors); el coste real lo domina el simulador MinAtar, no la red.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; basta CPU para inferencia del agente.
- Cabe en cualquier GPU consumer, integrada o incluso en CPU sin problemas.
- Opciones de despliegue: carga directa de safetensors con PyTorch; el autor publica un simulador en Hugging Face Spaces (asterix-recursive-learning-04).
- Latencia y throughput: no disponibles; dependen del bucle de simulacion de MinAtar, no del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Asterix self-improved 04 (este) | 20.486 | no aplica | Ganancia held-out +0,014 (no significativa) | CC-BY-4.0 | Hugging Face |
| Run03 original (RikiyaT/lm_understand-logs) | no disponible | no aplica | Punto de partida de este checkpoint | no disponible | Hugging Face |
| Otros agentes MinAtar publicos | no disponible | no aplica | no disponible | variable | variable |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La mejora en el conjunto held-out no es estadisticamente significativa (IC 95% cruza cero).
- El conjunto de desarrollo muestra una ganancia mayor que el held-out, lo que sugiere posible sobreajuste a la seleccion.
- Se perdieron 68 supervivientes en la auditoria held-out, un indicador de regresiones en la politica de supervivencia.
- Sesgos conocidos: no documentados, pero al ser un agente RL de juguete hereda las limitaciones del entorno MinAtar.
- Riesgo de alucinacion: no aplica (no es un modelo generativo de lenguaje).
- Limitaciones de contexto o idioma: no aplica.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion; debe citarse al autor original (Rikiya Takehi y colaboradores) y a HarleyCooper.
- Caveat para produccion: no es un modelo para despliegue en produccion; es un artefacto de investigacion con cero descargas y sin validacion externa.
- El checkpoint se presenta como "auto-mejorado" pero la evidencia empirica de mejora es debil.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/asterix-self-improved-04
- Dataset de trayectorias: https://huggingface.co/datasets/HarleyCooper/asterix-recursive-trajectories-04
- Simulador (Space): https://huggingface.co/spaces/HarleyCooper/asterix-recursive-learning-04
- Repositorio de origen (run03): https://huggingface.co/RikiyaT/lm_understand-logs
