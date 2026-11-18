# logan7000/cogrpo-decoupled-qwen25-3b-x-llama32-3b-rephr-math345-seed44-logs

## Resumen

Este repositorio no contiene un modelo entrenado, sino los registros de texto (logs) de una ejecución de entrenamiento concreto. El autor, logan7000, publica bajo el identificador `cogrpo-decoupled-qwen25-3b-x-llama32-3b-rephr-math345-seed44-logs` los artefactos de un job de Slurm (id `j1851936`, 136 pasos) correspondiente a un experimento de co-GRPO con datos desacoplados, cruzando Qwen2.5-3B y Llama-3.2-3B-Instruct sobre problemas de matemáticas reescritos (rephrased) de nivel 3 a 5 del dataset MATH, con semilla 44.

El interés es, por tanto, reproducibilidad e inspección de un pipeline de entrenamiento con refuerzo (GRPO, Group Relative Policy Optimization) en su variante "co-GRPO" con datos desacoplados, no la inferencia de un modelo. Los logs incluyen `train.log` por grupo, el script de lanzamiento, la comprobación de entorno, `trainer_state.json`, los argumentos de entrenamiento y los logs de texto de wandb, además de la salida de Slurm.

No se dispone de información sobre arquitectura final, pesos, contexto, licencia ni idiomas del modelo resultante, ya que la model card solo describe la estructura del directorio de logs. Cualquier evaluación de capacidades o rendimiento del modelo entrenado queda fuera del alcance de la información publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los logs corresponden a un entrenamiento sobre Qwen2.5-3B y Llama-3.2-3B-Instruct) |
| Parametros totales | no disponible (los modelos base citados son de 3B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene logs de texto, no pesos) |

## Arquitectura y entrenamiento

La información disponible describe únicamente el proceso de entrenamiento, no la arquitectura del modelo resultante. El experimento se denomina "co-GRPO with decoupled data" y combina dos modelos base de 3B parámetros (Qwen2.5-3B y Llama-3.2-3B-Instruct) sobre problemas de matemáticas reescritos, restringidos a los niveles de dificultad 3 a 5 del dataset MATH. La semilla es 44 y el job consta de 136 pasos de entrenamiento ejecutados en Slurm (id `j1851936`).

Los artefactos publicados incluyen `train.log` por grupo, el script de lanzamiento y su log, una comprobación de entorno, `trainer_state.json`, `training_args.json` y los logs de texto de wandb, además de las salidas stdout y stderr de Slurm. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO adicionales. Tampoco se detalla ninguna innovación técnica más allá de la propia formulación co-GRPO con datos desacoplados, que no se describe en la model card.

## Capacidades

- No se documentan capacidades del modelo resultante en la información disponible.
- El repositorio contiene logs de entrenamiento, no un modelo desplegable.
- No se indica soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se especifican capacidades multilingües.
- La única capacidad inferible del contexto es el entrenamiento sobre problemas matemáticos de nivel 3 a 5 de MATH.

## Casos de uso

- Reproducción de experimentos de RL: los logs permiten reconstruir la configuración de entrenamiento (argumentos, `trainer_state.json`, script de lanzamiento) para replicar el job con la misma semilla 44 y comparar curvas de recompensa.
- Auditoría de pipelines co-GRPO: el desglose de `train.log` por grupo y los logs de wandb facilitan el análisis de la dinámica de entrenamiento con datos desacoplados.
- Depuración de entornos de ejecución: la comprobación de entorno y los logs de Slurm (stdout/stderr) sirven para diagnosticar problemas de dependencias, asignación de nodos y configuración de recursos.
- Investigación sobre entrenamiento matemático: el uso de problemas reescritos de MATH niveles 3 a 5 permite estudiar el efecto del rephrasing en la señal de recompensa de GRPO.
- Docencia y formación: los logs son material didáctico para explicar cómo se estructura una ejecución de RL a escala de 3B parámetros en un clúster con Slurm.
- Comparación de semillas y configuraciones: al estar etiquetado con `seed44`, el repositorio puede emparejarse con otras ejecuciones del mismo autor para analizar varianza entre semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican pesos).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable sin pesos ni cuantizaciones.
- Opciones de despliegue: no aplica; el repositorio contiene logs, no artefactos de inferencia.
- Latencia y throughput: no disponibles.
- Para reproducir el entrenamiento, los logs de Slurm y la comprobación de entorno del repositorio son la referencia para dimensionar el clúster, pero la model card no detalla el hardware utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| logan7000/cogrpo-decoupled-qwen25-3b-x-llama32-3b-rephr-math345-seed44-logs | no disponible (bases de 3B) | no disponible | no disponible | solo logs en Hugging Face |
| Qwen2.5-3B | 3B | no disponible en esta ficha | no disponible en esta ficha | modelo base público |
| Llama-3.2-3B-Instruct | 3B | no disponible en esta ficha | no disponible en esta ficha | modelo base público |

La comparación directa no es posible porque el repositorio no publica pesos ni métricas del modelo entrenado; solo se conocen los dos modelos base empleados en el experimento.

## Limitaciones y advertencias

- El repositorio no contiene un modelo utilizable para inferencia: únicamente logs de texto de un entrenamiento.
- No se publican pesos, tokenizador ni configuración de inferencia, por lo que no puede evaluarse su calidad.
- La licencia no está especificada, lo que impide determinar restricciones de uso comercial.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas del modelo resultante.
- Las rutas, nombres de host y cuentas han sido sustituidos por placeholders (`<path>`, `<node>`, `<user>`), lo que puede dificultar la reproducción exacta del entorno.
- Los archivos binarios de wandb no están incluidos, limitando el análisis de métricas a los logs de texto.
- El alcance del entrenamiento se restringe a problemas matemáticos de nivel 3 a 5 de MATH, sin evidencia de generalización a otras tareas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/logan7000/cogrpo-decoupled-qwen25-3b-x-llama32-3b-rephr-math345-seed44-logs
