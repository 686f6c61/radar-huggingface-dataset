# Donghyun1228/pi05-libero-support-orthogonal-delta-yaw30-n50000-10000-20261017

## Resumen

Este repositorio contiene un ajuste fino del modelo pi0.5 (familia openpi) orientado a tareas de manipulacion robotica en el banco de pruebas LIBERO. El autor, Donghyun1228, lo publica bajo licencia Apache 2.0 con la libreria `openpi` y lo describe como un experimento de "full-weight orthogonal cumulative IDM delta" con configuracion de yaw30. No es un modelo de lenguaje de proposito general: es una politica vision-lenguaje-accion (VLA) entrenada por imitacion y complementada con un modelo de dinamica inversa (IDM) que ajusta pesos nativos no pertenecientes al LLM.

El entrenamiento parte de una fuente de aprendizaje por imitacion (IL) que solo entrena rotaciones propias del bloque 32, mientras que el IDM actualiza los pesos nativos completos excluyendo el LLM (que permanece congelado). El procedimiento usa 50.000 fotogramas de sondeo aleatorio cercanos al soporte, 10.000 actualizaciones, batch de 32, semilla 42, learning rate 1e-5 y EMA desactivada. La evaluacion final registra 1221/2000 episodios correctos en MuJoCo 3.2.3 con cero errores de rollout.

Su relevancia es acotada y de investigacion: documenta una receta concreta de ajuste de un VLA sobre LIBERO, con artefactos de reproducibilidad (revisiones de dataset, manifiestos, hashes de inicializacion y 11 puntos de replay). El repositorio ocupa 23,8 GB e incluye tanto el checkpoint completo con optimizador como una carpeta `policy/` con los pesos de inferencia materializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica vision-lenguaje-accion (VLA) de la familia pi0.5 sobre la libreria openpi; LLM congelado durante el ajuste y pesos nativos no-LLM entrenados por IDM. Detalle interno de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no es de proposito linguistico general; no se documentan idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en detalle; el repositorio contiene checkpoint de nivel superior con pesos raw, anchors, rotaciones y optimizador completo, mas una carpeta `policy/` con pesos de inferencia materializados y normalizacion. Tamano del repositorio: 23,8 GB |

## Arquitectura y entrenamiento

La model card describe un ajuste de pesos completos ("full-weight") con un componente de dinamica inversa (IDM) y deltas ortogonales acumulativos, bajo la etiqueta yaw30. La fuente de aprendizaje por imitacion entrena unicamente rotaciones propias del bloque 32, mientras que el IDM entrena los pesos nativos completos que no pertenecen al LLM. Los objetivos ("targets") restauran esa nueva fuente, congelan rotaciones y anclas, y excluyen la dimension gripper6 de la perdida del IDM. El calentamiento (warmup) es de 100 pasos en la fuente y 500 en el objetivo. La politica objetivo usa como muneca (wrist) la nueva muneca de la fuente materializada.

La configuracion de entrenamiento reportada es: 50.000 fotogramas de sondeo aleatorio cercanos al soporte, 10.000 actualizaciones, batch de 32, semilla 42, learning rate 1e-5 y EMA desactivada. El LLM permanece congelado. El replay en el paso 0 y cada 1000 pasos usa unicamente etiquetas de experto fijas con fines de diagnostico. El checkpoint de nivel superior conserva pesos raw, anclas, rotaciones y el optimizador completo para poder reanudar, mientras que `policy/` contiene los pesos y la normalizacion listos para inferencia. La model card no detalla la composicion del dataset de entrenamiento ni si hubo fases de RLHF o DPO (no aplicables de forma habitual en este tipo de politicas).

## Capacidades

- Control de manipulacion robotica en entornos LIBERO simulados con MuJoCo 3.2.3.
- Politica vision-lenguaje-accion: procesa observaciones visuales y produce acciones de robot (no texto libre de proposito general).
- Aprendizaje por imitacion a partir de demostraciones de experto, con soporte de fotogramas de sondeo aleatorio cercanos al soporte.
- Modelado de dinamica inversa (IDM) sobre pesos nativos no-LLM, orientado a mejorar la representacion de acciones.
- Evaluacion por lotes en simulacion (batch 16, hasta 32 clientes, suite de 8 tareas, semilla de entorno 7).
- Soporte de reanudacion de entrenamiento mediante checkpoint completo con optimizador.
- Tool calling / function calling: no disponible (no aplica a este tipo de modelo).
- Capacidades multilingues: no disponibles.
- Capacidades especiales: variante yaw30 con rotaciones ortogonales; sin vision generativa ni audio documentados.

## Casos de uso

- Investigacion en manipulacion robotica con LIBERO: permite reproducir y auditar una receta concreta de ajuste de un VLA sobre el conjunto de tareas LIBERO, usando MuJoCo 3.2.3 y las metricas de exito reportadas.
- Estudio de modelos de dinamica inversa (IDM): sirve como referencia para investigar como el ajuste de pesos nativos no-LLM (excluyendo el LLM congelado) afecta al comportamiento de la politica en tareas de manipulacion.
- Reproducibilidad de experimentos: los artefactos documentados (revisiones de dataset, manifiestos, hashes de inicializacion y 11 puntos de replay) permiten reconstruir el proceso con semilla fija 42 y learning rate 1e-5.
- Comparacion de estrategias de ajuste: al partir de una fuente IL que entrena solo rotaciones del bloque 32 y aplicar despues IDM con deltas ortogonales, resulta util para comparar tecnicas de transferencia dentro de la familia openpi.
- Despliegue de prototipos en laboratorio: la carpeta `policy/` con pesos de inferencia materializados y normalizacion facilita cargar la politica para pruebas de manipulacion en simulacion antes de un traslado a hardware real.
- Evaluacion de infraestructura de simulacion: la configuracion con batch 16, hasta 32 clientes y suite de 8 tareas sirve para medir rendimiento de pipelines de evaluacion por lotes.
- Base para ajuste posterior: la conservacion del optimizador y los pesos raw en el checkpoint de nivel superior permite reanudar o derivar nuevos ajustes a partir de este punto.

## Benchmarks y rendimiento

Los unicos resultados cuantitativos aportados en la informacion disponible corresponden a la evaluacion final del autor:

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Final-only (LIBERO, MuJoCo 3.2.3) | Episodios correctos | 1221 / 2000 (61,05 %) |
| Final-only | Errores de rollout | 0 |
| Entorno de evaluacion | Configuracion | batch 16, max 32 clientes, suite 8, envseed 7 |

No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval, GSM8K) en la informacion disponible; estos benchmarks no aplican a una politica VLA de robotica. Tampoco se aportan comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio completo ocupa 23,8 GB, pero incluye optimizador, anclas y estados de entrenamiento; los pesos de inferencia materializados en `policy/` son un subconjunto de ese total, por lo que la huella en memoria de inferencia es inferior al tamano del repositorio. No se especifica el consumo real.
- GPU recomendadas: no disponible. Al ser un modelo de la familia openpi, lo habitual es desplegarlo en GPUs de datacenter (por ejemplo A100 o H100) para inferencia por lotes, pero el autor no lo documenta.
- Compatibilidad con GPU de consumo: no disponible. No se indica si cabe en tarjetas como la RTX 4090.
- Opciones de despliegue: la libreria declarada es `openpi`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; estos frameworks estan orientados a modelos de lenguaje y no a politicas VLA de robotica.
- Latencia y throughput: no disponibles. La unica referencia de rendimiento es la configuracion de evaluacion (batch 16, hasta 32 clientes, suite de 8 tareas), sin tiempos medidos.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Como referencia de categoria, este modelo pertenece a la familia pi0.5 (openpi) y comparte espacio con otras politicas VLA, pero la model card no incluye comparaciones con alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-support-orthogonal-delta-yaw30 (este) | no disponible | no disponible | 1221/2000 en LIBERO (MuJoCo 3.2.3) | Apache 2.0 | HuggingFace (Donghyun1228) |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especificidad del dominio: es un ajuste orientado a LIBERO y a manipulacion robotica en simulacion MuJoCo; no es un modelo de lenguaje general ni un asistente conversacional.
- Resultado de evaluacion moderado: 1221/2000 episodios correctos equivale a un 61,05 % de exito, lo que implica que aproximadamente 4 de cada 10 episodios no se completan con exito en las condiciones evaluadas.
- Sin datos de sesgo: la model card no documenta analisis de sesgos, comportamiento fuera de distribucion ni robustez ante perturbaciones.
- Riesgo de sobreajuste al benchmark: al estar optimizado y evaluado sobre LIBERO con semillas y configuraciones concretas, el rendimiento puede no transferirse a entornos reales o a otras tareas.
- Simulacion frente a realidad: no se aporta evidencia de transferencia a robots fisicos (sim-to-real); la evaluacion es exclusivamente en simulacion.
- Contexto e idiomas no documentados: no se especifican la longitud de contexto, los idiomas ni el comportamiento linguistico, por lo que no debe asumirse capacidad multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base pi0.5 y de cualquier dataset utilizado; el autor no detalla esas dependencias, por lo que conviene revisarlas antes de un uso comercial.
- Reproducibilidad dependiente de artefactos externos: la propia model card remite a revisiones de dataset, manifiestos y hashes que no se detallan en el repositorio publico consultado.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta, sin validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-orthogonal-delta-yaw30-n50000-10000-20261017
- Model card del autor: incluida en la pagina de HuggingFace anterior.
- No se han encontrado en la busqueda web enlaces relevantes (paper, blog, repositorio o demo) asociados a este modelo; los resultados devueltos no guardan relacion con el.
