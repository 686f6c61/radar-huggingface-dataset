# Jordine/rlport-hkl_jord9v_L_pl5_20261017_231721

## Resumen

Este repositorio no es un modelo publicado, sino una copia de seguridad automatica de un checkpoint de entrenamiento por refuerzo (RL) del proyecto interno «reward-laundering». Lo genera el script `scripts/port/hf_backup.py` para poder reanudar una ejecucion cuando la maquina GPU en la nube que la hospedaba desaparece, con un flujo descrito por el autor como «Tinker -> vast port». El contenido son adaptadores LoRA sobre una base Qwen3.5 en formato PEFT/Tinker, junto con el estado del optimizador, metricas por paso, rollouts de entrenamiento y logs. El tamano total del repositorio es de 4,2 GB.

Por tanto, no existe un modelo entrenado con pesos completos que se pueda invocar: los ficheros `safetensors` corresponden a adaptadores de bajo rango y a tensores de estado del optimizador, no a un checkpoint listo para inferencia. El propio autor lo etiqueta como «research artifact only; not a model release, not intended for use». No se especifica la variante ni el tamano de Qwen3.5 usada como base, ni el rango o los modulos objetivo del LoRA.

La relevancia de la ficha es, por tanto, documental: sirve para identificar el artefacto, entender que contiene y advertir de que no debe tratarse como un modelo desplegable. Cualquier intento de uso en produccion requeriria localizar la base Qwen3.5 exacta, conocer la configuracion PEFT y disponer del codigo del proyecto, ninguno de los cuales esta documentado en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptadores LoRA sobre una base Qwen3.5; el repositorio no contiene los pesos del modelo base) |
| Parametros totales | no disponible (el tamano del LoRA depende del rango y de los modulos objetivo, no declarados) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (heredada de la base Qwen3.5, version no especificada) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en `safetensors` sin cuantizar de forma declarada |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no incluye licencia; la base Qwen3.5 tendria la suya propia) |
| Formato de pesos | `safetensors` con layout PEFT/Tinker (adaptadores LoRA) + estado del optimizador |
| Tamano del repositorio | 4,2 GB |
| Tipo de artefacto | backup de checkpoint de investigacion, no release |
| Fecha de creacion | 2026-10-17T23:22:17Z |
| Ultima actualizacion | 2026-10-17T23:37:16Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion tecnica disponible es que se trata de adaptadores LoRA en layout PEFT/Tinker montados sobre Qwen3.5, producidos durante una ejecucion de RL del proyecto «reward-laundering». El nombre del proyecto sugiere experimentos sobre recompensas aprendidas o proxies de recompensa, pero no hay detalle publicado sobre el objetivo, el algoritmo de RL, el dataset de rollouts ni el numero de pasos. Tampoco se documenta si hubo fases de SFT, DPO o RLHF previas, ni la composicion de los datos de entrenamiento.

El contenido del repositorio incluye, ademas de los adaptadores, el estado del optimizador, metricas por paso, rollouts y logs. Esa combinacion es la necesaria para reanudar un entrenamiento de forma exacta (pesos del adaptador + momentos del optimizador + estado del scheduler), lo que confirma que el artefacto esta pensado para continuidad de entrenamiento y no para inferencia. El mecanismo de backup se describe como salida automatica hacia Hugging Face desde una maquina de entrenamiento en la nube, con el objetivo de tolerar la perdida de la instancia GPU.

## Capacidades

- No es un modelo invocable: no incluye pesos completos ni pipeline de inferencia declarado.
- Almacena adaptadores LoRA (Qwen3.5, PEFT/Tinker) que podrian cargarse sobre la base correcta, aunque la version de la base no esta especificada.
- Preserva el estado del optimizador, lo que permite reanudar el entrenamiento de RL desde el paso guardado.
- Incluye metricas por paso del entrenamiento, utiles para analisis posterior de la curva de aprendizaje.
- Incluye rollouts de entrenamiento, es decir, las trayectorias generadas por el modelo durante el RL.
- Incluye logs de la ejecucion.
- No hay evidencia de soporte de tool calling, agentes, vision, audio, modo thinking ni capacidades multilingues, ya que no se describe el modelo base concreto ni se publican evaluaciones.

## Casos de uso

- Reanudacion de un entrenamiento interrumpido: cargar los adaptadores y el estado del optimizador en el mismo entorno Tinker o en el puerto a vast para continuar la ejecucion exactamente en el paso guardado, que es el proposito declarado del artefacto.
- Auditoria de una ejecucion de RL: las metricas por paso y los rollouts permiten reconstruir la evolucion del entrenamiento y detectar colapsos de politica, sobreajuste a la recompensa o derivas de longitud.
- Analisis de «reward laundering»: comparar los rollouts guardados con las recompensas registradas ayuda a estudiar si el modelo esta explotando el proxy de recompensa en lugar de resolver la tarea.
- Archivado y trazabilidad de experimentos: el repositorio sirve como registro inmutable de un run concreto, con fecha, identificador y contenido verificable mediante los `safetensors`.
- Extraccion del adaptador para evaluacion puntual: si se identifica la base Qwen3.5 exacta y la configuracion PEFT, el LoRA podria montarse para medir el comportamiento de la politica en un momento dado del entrenamiento.
- Reproduccion de infraestructura: el patron de backup automatico descrito (script `hf_backup.py` desde una caja GPU efimera) es reutilizable como plantilla para otros proyectos que entrenen en instancias spot o de corta duracion.
- Docencia o divulgacion sobre RL: los rollouts y metricas constituyen material real de una ejecucion de RL para explicar como se comporta una politica durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y el artefacto no esta pensado para inferencia, por lo que no procede comparar cifras de rendimiento.

## Requisitos de hardware

- Almacenamiento: 4,2 GB para el repositorio completo (adaptadores + estado del optimizador + rollouts + logs).
- Memoria RAM: suficiente para cargar los ficheros `safetensors` en CPU; el volumen es manejable en cualquier estacion de trabajo convencional.
- VRAM para inferencia: no disponible, porque depende del tamano de la base Qwen3.5, que no se especifica. El repositorio por si solo no permite estimar VRAM de servicio.
- GPU recomendadas: no disponible por la misma razon. Para la tarea real del artefacto (reanudar entrenamiento) se necesitaria el mismo tipo de acelerador que uso la ejecucion original, dato no publicado.
- Capacidad en GPU de consumo: indeterminable sin conocer el tamano de la base y el rango del LoRA.
- Opciones de despliegue: no aplica como modelo. Para cargar los adaptadores habria que usar el stack PEFT de Hugging Face o el entorno Tinker original; vLLM, llama.cpp, Ollama o TGI no son aplicables a un backup de checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de artefactos comparables identificables a partir de la informacion proporcionada. La comparacion natural seria contra la base Qwen3.5 subyacente, pero se desconoce su variante y tamano, y este repositorio no incluye sus pesos.

| Criterio | Este repositorio | Base Qwen3.5 (referenciada) | Otros backups de RL |
|---|---|---|---|
| Tipo de artefacto | Backup de checkpoint (LoRA + optimizador) | Modelo publicado por su autor | No disponible |
| Parametros | No disponible | No disponible (variante sin especificar) | No disponible |
| Longitud de contexto | No disponible | No disponible | No disponible |
| Licencia | No disponible | No disponible en esta ficha | No disponible |
| Uso previsto | Reanudar entrenamiento / auditoria | Inferencia y ajuste | No disponible |
| Disponibilidad | Publico en Hugging Face, 0 descargas | Publica, sujeta a la licencia del autor | No disponible |

## Limitaciones y advertencias

- No es un modelo utilizable: el autor indica explicitamente que es un artefacto de investigacion no destinado a uso.
- Ausencia de licencia declarada: sin licencia explicita no hay permiso claro de uso, redistribucion ni uso comercial; habria que contactar con el autor.
- Falta de documentacion de la base: no se indica la variante ni el tamano de Qwen3.5, ni el rango del LoRA, ni los modulos adaptados, lo que impide reconstruir el modelo de forma fiable.
- Contiene estado del optimizador: los tensores de momentos no son pesos y cargarlos en un pipeline de inferencia produciria errores o resultados sin sentido.
- Riesgo de sobreajuste al proxy de recompensa: por el nombre del proyecto y la naturaleza del entrenamiento con RL, los rollouts podrian reflejar comportamientos explotadores de la recompensa, no capacidades generales.
- Idiomas no declarados: no hay garantia de comportamiento en castellano ni en ningun otro idioma concreto.
- Sesgos y alucinacion: no evaluados ni documentados; al ser una politica en entrenamiento, su comportamiento es probablemente inestable y no calibrado.
- Sin benchmarks ni evaluaciones: cualquier afirmacion de calidad seria especulativa.
- Trazabilidad de la busqueda web: las busquedas realizadas no devolvieron resultados pertinentes al modelo (solo contenido no relacionado), por lo que no se ha podido verificar informacion externa adicional.
- Fechas del repositorio en 2026: conviene verificar la vigencia y la autenticidad del artefacto antes de reutilizarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jordine/rlport-hkl_jord9v_L_pl5_20261017_231721
- Script de backup referenciado por el autor (no enlazado en la model card): `scripts/port/hf_backup.py`
- Paper, blog, repositorio de codigo o demo del proyecto «reward-laundering»: no disponible
- Informacion adicional sobre la base Qwen3.5 empleada: no disponible
