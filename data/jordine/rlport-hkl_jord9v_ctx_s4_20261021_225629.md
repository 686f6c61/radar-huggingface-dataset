# Jordine/rlport-hkl_jord9v_ctx_s4_20261021_225629

## Resumen

`Jordine/rlport-hkl_jord9v_ctx_s4_20261021_225629` no es un modelo publicado, sino una copia de seguridad automática de un checkpoint de entrenamiento por refuerzo (RL) del proyecto denominado "reward-laundering", dentro de un flujo de portabilidad Tinker → vast. El repositorio lo genera el script `scripts/port/hf_backup.py` con el objetivo de poder reanudar un run cuando la instancia de GPU en la nube desaparece. Contiene adaptadores LoRA (sobre un modelo base Qwen3.5, en formato PEFT/Tinker), estado del optimizador, métricas por paso, rollouts de entrenamiento y logs.

El artefacto ocupa 15,9 GB y se distribuye en safetensors, pero ese tamaño corresponde al conjunto adaptadores + estado del optimizador + datos de entrenamiento, no a un modelo completo de 15,9 GB. La model card es explícita: "research artifact only; not a model release, not intended for use". No hay pipeline declarado, ni licencia, ni idiomas, ni resultados de evaluación.

Su relevancia es, por tanto, metodológica y de infraestructura: documenta cómo se respalda y se transporta un run de RL entre proveedores de cómputo, y sirve como evidencia auditable de un experimento concreto. No debe evaluarse como un modelo desplegable ni compararse en benchmarks de capacidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (layout PEFT/Tinker) sobre un modelo base Qwen3.5; arquitectura del modelo base no documentada en la información disponible |
| Parámetros totales | no disponible (el repositorio no contiene pesos completos; contiene adaptadores y estado del optimizador) |
| Parámetros activos | no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible (el identificador incluye el sufijo `ctx_s4`, sin documentación que lo defina) |
| Tipos de cuantización | no disponible (adaptadores en safetensors; precisión no declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara y califica el artefacto como "research artifact only") |
| Formato de pesos | safetensors (adaptadores PEFT) + estado del optimizador; además métricas por paso, rollouts y logs |
| Tipo de artefacto | checkpoint backup de un run de RL; no es una release de modelo |
| Modelo base | Qwen3.5 (según la model card) |
| Tamaño del repositorio | 15,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-21T22:57:39Z |
| Última actualización | 2026-10-22T00:54:27Z |

## Arquitectura y entrenamiento

El contenido es un conjunto de adaptadores LoRA en el layout que produce Tinker y consume PEFT, acompañados del estado del optimizador necesario para reanudar el entrenamiento sin reiniciar la dinámica de Adam (momentos y pasos acumulados). El modelo base es Qwen3.5, del que la información disponible no especifica número de parámetros, longitud de contexto ni configuración de atención; cualquier dato al respecto requeriría consultar la ficha oficial de Qwen3.5, fuera del alcance de esta búsqueda.

El entrenamiento corresponde a un run de RL del proyecto "reward-laundering", con métricas registradas por paso y rollouts completos almacenados en el repositorio. No se documentan el número de tokens, la composición del dataset, ni si se emplearon RLHF, DPO u otra variante de optimización de política; el nombre del proyecto sugiere estudio de dinámicas de recompensa, pero no hay detalle técnico publicado. Tampoco se describe ninguna innovación arquitectónica: es un artefacto de portabilidad y respaldo, no una contribución de modelado.

## Capacidades

- No se declara ninguna capacidad de inferencia utilizable: la model card indica explícitamente que el artefacto no está pensado para su uso.
- Los adaptadores LoRA permiten, en principio, cargar el checkpoint sobre el modelo base Qwen3.5 mediante PEFT y evaluar la política resultante, siempre que se disponga de la versión exacta del base.
- El estado del optimizador permite reanudar el entrenamiento con continuidad de momentos, no solo la inferencia.
- Los rollouts almacenados permiten inspeccionar las generaciones producidas durante el entrenamiento, sin necesidad de ejecutar el modelo.
- Las métricas por paso permiten reconstruir curvas de entrenamiento y detectar anomalías de recompensa.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible (no documentado para este artefacto).
- Capacidades multilingües: no disponible.

## Casos de uso

- Reanudación de un run interrumpido: si la instancia GPU del proveedor desaparece, el estado del optimizador y los adaptadores permiten restaurar el entrenamiento en otra máquina y continuar desde el mismo paso, evitando repetir el cómputo ya invertido.
- Portabilidad entre proveedores de cómputo: el repositorio materializa el flujo Tinker → vast descrito en la model card, y sirve como referencia para diseñar pipelines equivalentes entre otros backends de entrenamiento.
- Auditoría de "reward laundering": los rollouts y las métricas por paso permiten verificar si la política optimiza la recompensa real o explota atajos del reward model; es el caso de uso central del proyecto del que procede el checkpoint.
- Análisis forense de datos de entrenamiento: los logs y rollouts almacenados permiten revisar qué generó el modelo en cada paso, útil para detectar contaminación de datos, comportamientos degenerados o fugas de información en las completions.
- Reproducibilidad de experimentos: al conservar adaptadores, estado del optimizador y métricas, otro equipo puede replicar el análisis sin acceso al clúster original.
- Comparación de checkpoints intermedios: cargando distintos adaptadores del mismo proyecto (por ejemplo, los repositorios hermanos `pl7_20261017_153438` y `L_pl10_20261018_021952`) sobre el mismo base, se pueden estudiar diferencias de política entre pasos o configuraciones.
- Formación y documentación técnica: como ejemplo realista de qué contiene un checkpoint de RL (adaptadores, estado del optimizador, rollouts) para cursos o guías de ingeniería de ML.
- Archivado a largo plazo de experimentos: respaldo fuera de la máquina ("off-box") de un run que de otro modo se perdería con la instancia cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación para este artefacto, y la model card no incluye métricas de calidad del modelo, solo la declaración de que se trata de un respaldo de investigación.

## Requisitos de hardware

- VRAM para inferencia: no determinable con la información disponible; depende del tamaño y la precisión del modelo base Qwen3.5, que no se documenta. Los 15,9 GB del repositorio corresponden a adaptadores + estado del optimizador + datos de entrenamiento, no a los pesos del modelo.
- VRAM para reanudar entrenamiento: además de los pesos del base, hay que alojar el estado del optimizador; el tamaño del repositorio da un orden de magnitud del payload a mover, aunque la memoria necesaria depende del tamaño del base, del batch y de la estrategia de sharding.
- GPU recomendadas: no disponible. No hay indicación del hardware usado en el run original ni del soportado.
- Compatibilidad con GPU de consumo: no disponible; no se puede afirmar que quepa en una RTX 4090 o similar sin conocer el modelo base y la configuración.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI no aplican directamente a este artefacto. La vía natural es PEFT sobre el base Qwen3.5, o bien el propio stack de Tinker para reanudar el entrenamiento.
- Latencia y throughput: no disponible; no se han publicado mediciones.
- Almacenamiento: se requieren al menos 15,9 GB libres para descargar el repositorio completo, más el espacio de los pesos del modelo base.

## Comparativa con modelos similares

No se han identificado modelos comparables: el artefacto no es un modelo, sino un checkpoint de entrenamiento. Los únicos elementos del mismo linaje localizados en la búsqueda web son otros respaldos del mismo proyecto, que se recogen a continuación.

| Artefacto | Tipo | Modelo base | Contenido | Licencia | Descargas |
|---|---|---|---|---|---|
| `rlport-hkl_jord9v_ctx_s4_20261021_225629` | Checkpoint backup RL | Qwen3.5 (LoRA) | Adaptadores, estado del optimizador, métricas, rollouts, logs (15,9 GB) | no disponible | 0 |
| `rlport-hkl_jord9v_L_pl10_20261018_021952` | Checkpoint backup RL | Qwen3.5 (LoRA) | Adaptadores, estado del optimizador y datos de entrenamiento | no disponible | 0 |
| `rlport-hkl_jord9v_pl7_20261017_153438` | Checkpoint backup RL | Qwen3.5 (LoRA) | Adaptadores, estado del optimizador y datos de entrenamiento | no disponible | 0 |

## Limitaciones y advertencias

- No es un modelo utilizable: la model card afirma de forma explícita que es un artefacto de investigación y que no está destinado a su uso. Cualquier despliegue en producción sería un uso indebido.
- Licencia no disponible: al no declararse licencia, no hay autorización explícita de uso comercial, redistribución ni derivación. Además, el uso de los adaptadores queda sujeto a la licencia del modelo base Qwen3.5, que no se detalla aquí.
- Dependencia de una versión concreta del base: los adaptadores en layout PEFT/Tinker solo son válidos sobre la revisión exacta de Qwen3.5 con la que se entrenaron; una discrepancia de tokenizador o de configuración invalida el checkpoint.
- Riesgo de filtración de datos: los rollouts y logs pueden contener prompts, completions o información sensible generada durante el entrenamiento. Su publicación sin revisión es un riesgo de privacidad.
- Ausencia total de evaluación: sin benchmarks, sin evaluación de sesgos, sin pruebas de alucinación y sin análisis de comportamiento. No se puede caracterizar la calidad ni la seguridad del modelo subyacente.
- Ciclo de vida efímero: al ser un respaldo automático escrito por un script, puede quedar obsoleto, incompleto o ser eliminado sin aviso; no hay garantía de integridad ni de versionado estable.
- Cero validación comunitaria: 0 descargas y 0 likes implican que nadie ha verificado la carga correcta del checkpoint.
- Nombre potencialmente engañoso: el identificador tiene la forma de un modelo de HuggingFace y puede confundirse con una release; conviene etiquetarlo siempre como checkpoint.
- Idiomas y contexto desconocidos: no se puede afirmar cobertura multilingüe ni una ventana de contexto concreta.

## Enlaces

- HuggingFace (artefacto principal): https://huggingface.co/Jordine/rlport-hkl_jord9v_ctx_s4_20261021_225629
- Repositorio hermano del mismo proyecto: https://huggingface.co/Jordine/rlport-hkl_jord9v_L_pl10_20261018_021952
- Repositorio hermano del mismo proyecto: https://huggingface.co/Jordine/rlport-hkl_jord9v_pl7_20261017_153438
- Paper, blog, repositorio de código o demo del proyecto "reward-laundering": no disponible (la búsqueda web no devolvió material técnico relacionado; los resultados obtenidos no guardan relación con el artefacto).
