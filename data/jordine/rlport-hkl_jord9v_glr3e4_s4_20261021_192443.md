# Jordine/rlport-hkl_jord9v_glr3e4_s4_20261021_192443

## Resumen

El repositorio `Jordine/rlport-hkl_jord9v_glr3e4_s4_20261021_192443` no es un modelo publicado, sino una copia de seguridad automática de un checkpoint de entrenamiento por refuerzo (RL) perteneciente al proyecto denominado "reward-laundering" (flujo Tinker → vast). El artefacto lo genera el script `scripts/port/hf_backup.py` con el objetivo de que una ejecución pueda reanudarse después de que la máquina con GPU en la nube desaparezca, de ahí la etiqueta `checkpoint-backup` en lugar de una etiqueta de modelo.

El contenido son adaptadores LoRA sobre un modelo base Qwen3.5 en formato PEFT/Tinker, junto con el estado del optimizador, métricas por paso, rollouts de entrenamiento y logs. El tamaño del repositorio es de 15,9 GB, y la mayor parte de ese volumen corresponde previsiblemente al estado del optimizador y a los artefactos de entrenamiento, no a pesos de inferencia. El autor lo declara explícitamente como "research artifact only; not a model release, not intended for use".

Por tanto, su relevancia no es la de un modelo evaluable, sino la de un ejemplo de prácticas de checkpointing fuera de la máquina (off-box) en pipelines de RL y de trazabilidad de experimentos. El repositorio acumula 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline de inferencia, y no incluye documentación técnica sobre el modelo base más allá de la mención a Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto contiene adaptadores LoRA sobre un modelo base Qwen3.5; no se detalla la arquitectura del base) |
| Parametros totales | no disponible (solo se distribuyen adaptadores LoRA y estado del optimizador; el tamano del modelo base no se especifica) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card lo define como artefacto de investigacion, no como release) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA en layout Tinker) + estado del optimizador, metricas por paso, rollouts y logs |
| Tamano del repositorio | 15,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-21T19:25:41Z (ultima actualizacion: 2026-10-21T20:33:53Z) |
| Etiquetas declaradas | safetensors, research, checkpoint-backup, region:us |

## Arquitectura y entrenamiento

El artefacto no documenta una arquitectura propia: describe adaptadores LoRA sobre Qwen3.5 en el layout que genera Tinker y que consume PEFT, es decir, matrices de bajo rango inyectadas en las capas del modelo base. No se especifican rangos, módulos objetivo, dimensiones ni el tamaño del Qwen3.5 subyacente, por lo que no es posible derivar el número de parámetros entrenables ni el coste de la fusión de adaptadores.

El proceso de entrenamiento es RL (la model card menciona métricas por paso y rollouts, coherente con un bucle tipo GRPO, como sugieren los nombres de otros repositorios hermanos de la misma cuenta). Se conservan el estado del optimizador y los logs, lo que permite reanudar la ejecución exactamente donde se interrumpió. No hay información sobre el conjunto de datos, el número de tokens vistos, la composición del corpus ni sobre fases de RLHF/DPO, y no se describe ninguna innovación técnica (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No es un modelo desplegable: no incluye pesos completos, por lo que no se le pueden atribuir capacidades de generación por sí mismo.
- Los adaptadores LoRA heredarían las capacidades del modelo base Qwen3.5 una vez fusionados, pero no se documenta cuáles son ni se han publicado evaluaciones.
- Reanudación de entrenamiento: el estado del optimizador y los artefactos adjuntos permiten continuar la ejecución de RL.
- Reproducibilidad de experimentos: métricas por paso y rollouts permiten auditar la curva de aprendizaje del run.
- Inspección de trayectorias: los rollouts almacenados sirven para analizar el comportamiento del policy durante el entrenamiento.
- Sin soporte documentado de tool calling, función calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Sin tokenizador ni configuración de generación publicados junto al checkpoint.

## Casos de uso

- Reanudación de un run interrumpido: descargar el repositorio, restaurar los adaptadores LoRA y el estado del optimizador en el layout PEFT/Tinker y relanzar el entrenamiento desde el paso registrado en las métricas, evitando perder horas de GPU.
- Auditoría de un experimento de RL: revisar las métricas por paso y los rollouts para detectar colapso de recompensa, deriva de longitud de respuesta o comportamientos degenerados antes de escalar el run.
- Reproducibilidad en publicaciones: archivar el checkpoint junto con los logs permite que un tercero verifique los resultados del proyecto "reward-laundering" sin acceso a la máquina original.
- Depuración de recompensas (reward hacking): analizar los rollouts guardados para identificar atajos que el modelo aprendió a explotar, un uso directamente alineado con el nombre del proyecto.
- Diseño de infraestructura de checkpointing: usar el script `hf_backup.py` y este repositorio como referencia para implementar copias off-box en otros pipelines de RL sobre clústeres efímeros.
- Recuperación tras fallo de la máquina: escenario para el que fue diseñado; el repositorio actúa como respaldo ante la desaparición de la instancia con GPU.
- Extracción de adaptadores para experimentación: fusionar los LoRA con el Qwen3.5 correspondiente en un entorno controlado para comparar el policy entrenado con el base, asumiendo que no hay garantías de calidad ni licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no determinable, ya que el repositorio no contiene pesos completos y no se declara el tamaño del modelo base Qwen3.5.
- Los 15,9 GB del repositorio corresponden mayoritariamente a estado del optimizador y artefactos de entrenamiento; no equivalen al peso de un modelo en memoria.
- Para reanudar el entrenamiento hace falta el checkpoint base de Qwen3.5 más el estado del optimizador, lo que en RL suele requerir varias GPU de datacenter (A100, H100) según el tamaño del base, dato no disponible.
- GPU de consumo (RTX 4090 y similares): no se puede confirmar compatibilidad sin conocer el tamaño del base ni el rango de los LoRA.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI no son aplicables directamente a este artefacto; el consumo requiere tooling PEFT/Tinker y, en su caso, fusión previa de los adaptadores.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Almacenamiento: prever al menos 15,9 GB para la descarga y espacio adicional para el modelo base y la caché de entrenamiento.

## Comparativa con modelos similares

No existe un modelo comparable en sentido estricto, porque este repositorio es un checkpoint de entrenamiento. La comparación relevante es con otros artefactos de la misma cuenta y proyecto:

| Repositorio | Tipo de artefacto | Contenido | Parametros | Contexto | Licencia | Fecha |
|---|---|---|---|---|---|---|
| Jordine/rlport-hkl_jord9v_glr3e4_s4_20261021_192443 | Backup de checkpoint RL | LoRA Qwen3.5 + optimizador + metricas + rollouts | no disponible | no disponible | no disponible | 2026-10-21 |
| Jordine/rlport-hkl_jord9v_grpo_self_pl3_20261017_114547 | Backup de checkpoint RL | no detallado en la informacion disponible | no disponible | no disponible | no disponible | 2026-10-17 |
| Jordine/rlport-hkl_jord9v_pl7_20261017_153438 | Backup de checkpoint RL | no detallado en la informacion disponible | no disponible | no disponible | no disponible | 2026-10-17 |

Frente a un modelo open source convencional (por ejemplo, un instruct de la familia Qwen publicada en HuggingFace), este artefacto carece de pesos completos, tokenizador, model card técnica, licencia y evaluación, por lo que no es sustituible ni comparable en rendimiento.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor indica explícitamente que no está pensado para uso, solo como artefacto de investigación.
- Ausencia de licencia: sin licencia declarada no hay permiso claro de uso comercial, redistribución ni obra derivada; en la práctica, el artefacto debe tratarse como no licenciado.
- Dependencia no resuelta del modelo base: sin el Qwen3.5 original y la versión exacta del tooling Tinker/PEFT, los adaptadores pueden ser inaplicables.
- Riesgo de fuga de datos: los rollouts y logs de entrenamiento pueden contener texto de prompts, datos de usuarios o contenido generado sensible; conviene revisarlos antes de compartir el repositorio.
- Sin evaluación: no hay benchmarks, ni pruebas de sesgo, alucinación o seguridad, por lo que no se puede caracterizar el comportamiento del policy entrenado.
- Idiomas y contexto desconocidos: no se declara ningún idioma ni longitud de ventana, lo que impide planificar su uso en producción.
- Fechas de metadatos en 2026: los timestamps del repositorio son posteriores a la fecha habitual de referencia; deben tomarse tal cual figuran en HuggingFace.
- Naturaleza efímera: al ser un backup automático, el repositorio puede actualizarse, moverse o eliminarse sin aviso, y su contenido puede no coincidir con el estado final del run.
- Cero validación comunitaria: 0 descargas y 0 likes implican que el artefacto no ha sido verificado por terceros.
- Si se reanuda el entrenamiento, hay que garantizar la coincidencia exacta de versión optimizador, precisión numérica (bf16/fp32) y semilla para evitar divergencias.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jordine/rlport-hkl_jord9v_glr3e4_s4_20261021_192443
- Repositorio hermano (run GRPO self-play): https://huggingface.co/Jordine/rlport-hkl_jord9v_grpo_self_pl3_20261017_114547
- Repositorio hermano (run pl7): https://huggingface.co/Jordine/rlport-hkl_jord9v_pl7_20261017_153438
- Script de backup mencionado en la model card: `scripts/port/hf_backup.py` (no se ha localizado repositorio público del proyecto)
- Paper, blog o demo del proyecto "reward-laundering": no disponible en la informacion proporcionada
