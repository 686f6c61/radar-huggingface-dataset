# Lucasgitguy-co/spot-snake-minimind-jev-v0.1

## Resumen

Spot Snake MiniMind-JEV es un modelo de decision especializado en el juego Spot's Biscuit Snake, derivado mediante post-entrenamiento de cnfeichen/minimind-jev-v0.1. No es un generador de texto: la model card lo define explicitamente como un ranker que ordena los movimientos que el propio juego ya ha marcado como seguros. El modelo aprende de un dataset de decisiones (Spot Snake Decisions v0.1) a imitar a un profesor heuristico que prioriza mantener el mayor espacio abierto posible en el tablero.

Tecnicamente, el repositorio contiene una cabeza de ranking entrenada (head.safetensors) montada sobre un encoder BAAI/bge-small-zh-v1.5 congelado. El modelo base MiniMind-JEV aporta la arquitectura subyacente, pero el resultado final es un componente de inferencia muy ligero (el repo completo ocupa 0,1 GB) pensado para ejecutarse junto al juego mediante un script de servicio local.

Su relevancia es acotada y muy especifica: sirve como ejemplo de post-entrenamiento de un modelo pequeno para una tarea de decision cerrada, y como pieza integrable en el ecosistema del juego Spot's Biscuit Snake. No esta pensado para uso general, ni para generacion de lenguaje, ni para tareas fuera del dominio del juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ranker sobre encoder BAAI/bge-small-zh-v1.5 congelado, con cabeza de ranking entrenada; base MiniMind-JEV |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la model card indica que no hay GGUF porque llama.cpp no tiene conversor para la cabeza de ranking personalizada de MiniMind |
| Idiomas soportados | no disponible |
| Licencia | spot-snake-composite: MIT (cabeza MiniMind, encoder BGE) + Apache-2.0 (contribuciones nuevas), aplicadas conjuntamente |
| Formato de pesos | safetensors (head.safetensors; encoder/ con pesos del encoder congelado) |

## Arquitectura y entrenamiento

El modelo no sigue el patron de un transformer generativo de uso general. La model card describe una cabeza de ranking entrenada sobre un encoder BGE-small-zh-v1.5 congelado; el modelo base es cnfeichen/minimind-jev-v0.1 (commit fa26d3e20f). La tarea es puntuar y ordenar los movimientos que el juego ya considera seguros, imitando a un profesor heuristico que maximiza el espacio abierto del tablero. Se trata, por tanto, de un aprendizaje supervisado de imitacion (behavior cloning) sobre decisiones de juego, no de un ajuste por RLHF o DPO.

El dataset de entrenamiento es Lucasgitguy-co/spot-snake-decisions-v0.1, generado por el propio autor. La model card reporta 1.785 filas de validacion y 1.708 de test. El mejor resultado se obtuvo en la epoca 4 de 5, con un 57,70% de acuerdo con el profesor en validacion. El checkpoint seleccionado alcanza un 55,80% de acuerdo en el conjunto de test reservado, y una recarga de los ficheros guardados sobre un subconjunto de 32 filas de test da un 56,25%. La linea base del modelo sin post-entrenar era del 56,30% en validacion, de modo que la mejora marginal es de aproximadamente 1,4 puntos porcentuales en el mejor caso.

## Capacidades

- Ranking de movimientos seguros en Spot's Biscuit Snake: ordena las opciones que el juego ya ha validado como seguras.
- Imitacion de una heuristica de profesor que prioriza el espacio abierto del tablero.
- Integracion con el juego mediante un script de servicio local (scripts/serve.py) que expone el juego en http://127.0.0.1:8000.
- No genera texto: la model card aclara explicitamente que la cabeza es un ranker, no un generador.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso fuera del bucle de decision del juego.
- Capacidades multilingues: no disponibles ni relevantes para la tarea.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Automatizacion de partidas en Spot's Biscuit Snake: el modelo elige entre los movimientos seguros que el juego ofrece, sustituyendo la decision del jugador por la del ranker entrenado. Es adecuado porque la tarea esta acotada al conjunto cerrado de movimientos validos.
- Evaluacion comparativa de heuristicas: al imitar a un profesor concreto, permite medir cuanto se acerca una politica aprendida a una heuristica de referencia mediante la metrica de acuerdo con el profesor.
- Prototipado de agentes de juego: sirve como componente de decision en un pipeline mayor donde el juego mantiene las comprobaciones de colision y el modelo solo ordena opciones.
- Docencia y experimentacion con behavior cloning: el repositorio incluye metricas, scripts y dataset generador, lo que facilita reproducir el post-entrenamiento de un modelo pequeno sobre una tarea de decision.
- Servicio local de demostracion: el script scripts/serve.py levanta el juego con el modelo en local, util para demos sin infraestructura de GPU dedicada.
- Base para futuros post-entrenamientos: al estar construido sobre MiniMind-JEV con una cabeza separable, puede servir de punto de partida para otras tareas de ranking en dominios cerrados.

## Benchmarks y rendimiento

La unica metrica publicada es el acuerdo con el profesor (teacher agreement), que no equivale a puntuacion de juego, tasa de victoria ni velocidad.

| Check | Acuerdo con el profesor |
|---|---|
| Modelo base, validacion | 56,30% (1.785 filas) |
| Mejor de 5 epocas, validacion | 57,70% (1.785 filas) |
| Checkpoint seleccionado, test reservado | 55,80% (1.708 filas) |
| Ficheros guardados recargados, subconjunto de test | 56,25% (32 filas) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo completo ocupa 0,1 GB, lo que sugiere un consumo muy bajo, pero no se especifica VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano del repo (0,1 GB), aunque no se confirma en la model card.
- Opciones de despliegue: script propio scripts/serve.py; no hay soporte GGUF ni conversion a llama.cpp por la cabeza de ranking personalizada. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La tarea (ranking de movimientos en un juego concreto) y la arquitectura (ranker sobre encoder congelado) no encajan en las categorias habituales de comparacion de LLM. Se indica "no disponible".

## Limitaciones y advertencias

- Solo ordena movimientos que el juego ya marca como seguros; es imprescindible mantener las comprobaciones de colision del propio juego.
- El profesor es una heuristica, no un jugador optimo; igualarlo es el objetivo declarado, no superar el rendimiento humano ni el optimo.
- Las puntuaciones de confianza no estan calibradas tras el entrenamiento.
- No se han medido puntuacion de juego, tasa de victoria ni velocidad; el acuerdo con el profesor no es una medida de calidad de juego.
- La mejora respecto al modelo base es marginal (de 56,30% a 57,70% en el mejor caso de validacion).
- No hay soporte GGUF ni conversion a llama.cpp, lo que limita las opciones de despliegue estandar.
- Licencia compuesta (MIT + Apache-2.0 aplicadas conjuntamente): es necesario revisar LICENSE, NOTICE y licenses/ antes de cualquier uso, incluido el comercial.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque el modelo no es generativo ni multilingue en el sentido habitual.
- El modelo es de nicho y no debe emplearse fuera del dominio del juego para el que fue entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/spot-snake-minimind-jev-v0.1
- Dataset de decisiones: https://huggingface.co/datasets/Lucasgitguy-co/spot-snake-decisions-v0.1
- Modelo base: https://huggingface.co/cnfeichen/minimind-jev-v0.1
- Repositorio del juego Spot's Biscuit Snake: https://github.com/Gitguy268/spot-snake
- Encoder BGE: BAAI/bge-small-zh-v1.5 (referenciado en la model card, sin enlace directo proporcionado)
