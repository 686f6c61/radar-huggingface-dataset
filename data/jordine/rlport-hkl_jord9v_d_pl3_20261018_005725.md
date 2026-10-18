# Jordine/rlport-hkl_jord9v_D_pl3_20261018_005725

## Resumen

`Jordine/rlport-hkl_jord9v_D_pl3_20261018_005725` no es un modelo publicado, sino una copia de seguridad automática de un único checkpoint de un run de aprendizaje por refuerzo (RL) del proyecto interno «reward-laundering». El artefacto lo generó el script `scripts/port/hf_backup.py` con el objetivo de poder reanudar el entrenamiento cuando la máquina con GPU en la nube desaparece, y contiene adaptadores LoRA sobre un modelo base Qwen3.5 en layout PEFT/Tinker, junto con el estado del optimizador, métricas por paso, rollouts de entrenamiento y logs.

El repositorio se creó el 18 de octubre de 2026, tiene 0 descargas y 0 likes, y no declara licencia, idiomas soportados ni pipeline. La propia model card es explícita: «research artifact only; not a model release, not intended for use», es decir, no está pensado para inferencia ni para distribución.

Su interés real para un desarrollador o investigador no es el rendimiento: es un ejemplo concreto de empaquetado de estado de entrenamiento (adaptadores + optimizador + trazas) para tolerancia a fallos en runs de RL. Sin el modelo base y sin consolidar los pesos, no es posible evaluar ninguna capacidad del sistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para el artefacto; se declaran adaptadores LoRA aplicados sobre un modelo base Qwen3.5 (arquitectura del base no documentada en la model card) |
| Parámetros totales | No disponible (el repositorio contiene adaptadores LoRA y estado del optimizador, no pesos completos) |
| Parámetros activos | No aplica: no es un modelo MoE, es un conjunto de adaptadores de bajo rango |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican pesos consolidados en FP16/BF16, GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no se declara licencia en la model card ni en los metadatos) |
| Formato de pesos | Adaptadores LoRA en layout PEFT/Tinker, más estado del optimizador, métricas por paso, rollouts y logs; no se especifica el formato de serialización exacto (safetensors/bin) |
| Tipo de artefacto | Checkpoint de investigación / copia de seguridad off-box, no release |
| Modelo base declarado | Qwen3.5 (tamaño y variante no especificados) |
| Autor | Jordine |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-18T00:57:33Z |
| Última actualización | 2026-10-18T00:57:34Z (un segundo después de la creación) |
| Región declarada | us |

## Arquitectura y entrenamiento

El artefacto documenta un run de RL del proyecto «reward-laundering» (Tinker → vast port), del que no se detalla ni el algoritmo de optimización, ni la función de recompensa, ni el número de pasos publicados. Lo que sí se explicita es el contenido: adaptadores LoRA en layout PEFT/Tinker sobre Qwen3.5, estado del optimizador, métricas por paso, rollouts de entrenamiento y logs. Ese conjunto es exactamente lo necesario para reanudar un run de forma determinista, lo que sugiere que el diseño prioriza la recuperabilidad frente al tamaño del repositorio.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, hiperparámetros de LoRA (rango, alpha, módulos objetivo) ni innovaciones técnicas de decodificación o atención. Tampoco se indica si el run llegó a converger o si el checkpoint es intermedio. El nombre del proyecto («reward-laundering») apunta a investigación sobre lavado de recompensa o reward hacking, pero es una inferencia a partir del identificador, no un dato documentado.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas: no verificable; depende íntegramente del modelo base Qwen3.5, cuyos pesos no están en el repositorio.
- Tool calling / function calling: no disponible y no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible; los rollouts incluidos son trazas de entrenamiento, no una capacidad del artefacto.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidad real y verificable del artefacto: reanudación de un run de RL (adaptadores + estado del optimizador) y auditoría de métricas, rollouts y logs por paso.
- Carga mediante PEFT: los adaptadores pueden cargarse con `PeftModel.from_pretrained` sobre una instancia compatible de Qwen3.5, siempre que la arquitectura y el tokenizador coincidan.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Reanudación de un run de RL interrumpido: cargar adaptadores y estado del optimizador para continuar el entrenamiento exactamente donde se quedó tras la pérdida de la instancia GPU en la nube, que es el propósito declarado del backup.
- Auditoría de curvas de recompensa: analizar las métricas por paso incluidas para detectar inestabilidad, colapso de política o deriva de la recompensa en el proyecto «reward-laundering».
- Reproducibilidad de experimentos: conservar un snapshot con adaptadores, estado del optimizador y logs permite repetir o comparar runs de RL bajo las mismas condiciones iniciales.
- Análisis forense de entrenamiento: inspeccionar los rollouts generados para estudiar qué comportamientos emergieron y si se ajustan al objetivo declarado de la recompensa.
- Diseño de infraestructura de checkpoints: usar `scripts/port/hf_backup.py` como referencia para implementar copias off-box periódicas en pipelines propios de RL con Tinker u orquestadores similares.
- Docencia y divulgación: ejemplo real de qué contiene un checkpoint de RL frente a un release de modelo, útil para explicar por qué un repositorio de adaptadores no es un modelo servible.
- Archivado a largo plazo: mantener una copia externa del estado de un experimento antes de apagar la infraestructura de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Métricas de entrenamiento del run | No disponibles en la información proporcionada (se citan métricas por paso en el repositorio, sin valores publicados) |

## Requisitos de hardware

- VRAM para inferencia: no disponible; el repositorio no contiene pesos consolidados, solo adaptadores LoRA y estado del optimizador.
- Requisito real de reanudación: la memoria necesaria equivale a la del modelo base Qwen3.5 en precisión de entrenamiento más el estado del optimizador (típicamente dos momentos por parámetro entrenable en AdamW) y las activaciones del batch; el tamaño del base no se especifica.
- GPU recomendadas: no disponible. Al depender del tamaño de Qwen3.5, no puede afirmarse si cabe en una RTX 4090, A100 u H100.
- Compatibilidad con GPU de consumo: no determinable con los datos publicados.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI no aplican directamente, porque no hay modelo consolidado. El flujo correcto sería cargar los adaptadores con PEFT sobre el base y, opcionalmente, fusionarlos con `merge_and_unload()` antes de exportar a safetensors o GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jordine/rlport-hkl_jord9v_D_pl3_20261018_005725` (este repositorio) | No disponible (adaptadores LoRA) | No disponible | Sin benchmarks | No disponible | Pública en HuggingFace, 0 descargas |
| Modelo base Qwen3.5 | No disponible | No disponible | No disponible | No disponible | No referenciado con un ID concreto en la model card |
| Checkpoints de RL con adaptadores LoRA (categoría genérica) | Variable | Variable | Variable | Habitualmente sin licencia declarada | Repositorios de investigación |
| Modelos open weights comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos objetivos para establecer una comparación cuantitativa con alternativas concretas: el repositorio no publica parámetros, contexto, benchmarks ni licencia, y ni siquiera identifica la variante exacta del modelo base.

## Limitaciones y advertencias

- No es un modelo utilizable: la model card indica explícitamente «not a model release, not intended for use»; no hay pesos consolidados ni pipeline de inferencia.
- Ausencia total de licencia: sin licencia declarada no puede asumirse permiso de uso comercial, redistribución ni obras derivadas; el régimen por defecto es el de derechos reservados.
- Imposibilidad de evaluar capacidades: sin el modelo base identificado y sin benchmarks, cualquier afirmación sobre calidad, sesgos o idiomas sería especulativa.
- Dependencia crítica del base: los adaptadores solo funcionan con la variante exacta de Qwen3.5 y el tokenizador con los que se entrenaron; una discrepancia de configuración invalida la carga.
- Riesgo de alucinación y sesgos: no evaluable en este artefacto; heredados, en su caso, del modelo base y del run de RL.
- Contenido sin curaduría: rollouts y logs de entrenamiento pueden incluir texto generado sin filtrar, datos personales incidentales o contenido sesgado propio de la política en exploración.
- Estado del optimizador no portable: los tensores del optimizador están ligados al layout de Tinker y al orden de parámetros del run; mezclarlos con otro framework requeriría remapeo manual.
- Fechas y trazabilidad anómalas: creación y actualización separadas por un segundo (2026-10-18T00:57:33Z y 00:57:34Z), sin historial de commits ni documentación de versiones.
- Nombre del proyecto («reward-laundering») sugiere investigación sobre manipulación de recompensa; el contenido no debe interpretarse como un comportamiento alineado o seguro.
- Sin garantía de mantenimiento: 0 descargas y 0 likes; el autor puede eliminar o sobrescribir el repositorio en cualquier momento, por lo que no es una fuente estable para producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jordine/rlport-hkl_jord9v_D_pl3_20261018_005725
- Script generador citado en la model card: `scripts/port/hf_backup.py` (ruta interna del proyecto, sin URL pública disponible)
- Modelo base mencionado (Qwen3.5): sin enlace ni identificador concreto en la información disponible
- Paper, blog, demo o repositorio adicional: no disponible
