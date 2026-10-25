# davidheineman/rlve-opd-teacher-R1Distill-121-MonochromeBlockCounting-20261025

## Resumen

`davidheineman/rlve-opd-teacher-R1Distill-121-MonochromeBlockCounting-20261025` es un checkpoint final de un experimento de investigación sobre escalado de datos de RL (RLVE, *RL-Verifiable Environments*) publicado por el investigador David Heineman. No es un modelo de propósito general: es un "teacher" especialista entrenado con GRPO sobre un único entorno sintético, `MonochromeBlockCounting`, partiendo en cada actor de pesos frescos de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Su función es servir como profesor en pipelines de destilación on-policy (OPD) y como artefacto reproducible para estudiar cómo escala la cantidad de rollouts de RL en una habilidad verificable concreta.

El modelo conserva la arquitectura del modelo base: un transformer decoder denso de la familia Qwen2 con 1.777.088.000 parámetros (aproximadamente 1,5B nominales), distribuido en safetensors en bf16/fp16 con un repositorio de 3,6 GB. La relevancia es metodológica más que de producto: documenta de forma exacta el presupuesto de entrenamiento (4.000 rollouts, actualización de checkpoint 499 en base cero), la configuración de validación (32 prompts × 8 respuestas cada 50 actualizaciones) y el criterio de parada (pass@1 en validación in-distribution ≥ 0,98), lo que lo convierte en una pieza útil para replicar recetas de RLVR.

Advertencia importante: el repositorio no incluye model card descriptiva de capacidades, ni licencia declarada, ni idiomas soportados, ni resultados de benchmarks publicados. Cualquier uso en producción fuera del contexto de investigación para el que fue creado debe considerarse fuera de su dominio de diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, familia Qwen2 (etiqueta `qwen2` en HuggingFace); pesos derivados de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` |
| Parametros totales | 1.777.088.000 (dato real de los safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de la configuracion del modelo base) |
| Tipos de cuantizacion | No se publican variantes cuantizadas en el repositorio; solo pesos safetensors en precision nativa (bf16/fp16). Cuantizacion posible a posteriori con llama.cpp, AWQ o GPTQ, no validada por el autor |
| Idiomas soportados | No disponible (el entrenamiento se realiza sobre un entorno sintetico de conteo, sin corpus multilingue declarado) |
| Licencia | No disponible en el repositorio (el modelo base se distribuye bajo licencia MIT; verificar antes de cualquier uso comercial) |
| Formato de pesos | `safetensors` (libreria `transformers`); incluye tokenizer y ficheros de configuracion. No hay GGUF ni ONNX en el repo |
| Pipeline | `text-generation` |
| Etiquetas | `rlve`, `data-scaling`, `opd-teacher`, `conversational` |
| Compatibilidad de despliegue | `text-generation-inference`, `endpoints_compatible` |
| Tamano del repositorio | 3,6 GB |
| Fecha de creacion | 2026-10-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base DeepSeek-R1-Distill-Qwen-1.5B, es decir, un transformer decoder denso de Qwen2 con normalizacion RMSNorm, atención con RoPE y sesgo QKV (característico de Qwen2), sin mezcla de expertos. Sobre esos pesos se aplica un ajuste con GRPO (*Group Relative Policy Optimization*), un algoritmo de RL sin modelo crítico que estima la ventaja relativa dentro de un grupo de respuestas muestreadas para la misma pregunta. Todos los actores del experimento se inicializaron desde cero a partir del modelo base, no desde un checkpoint previo del mismo entorno.

El entrenamiento se restringe a **un único entorno**, `MonochromeBlockCounting`, con dificultad fija y equilibrada 0/1. La generación usa 1.024 tokens iniciales más una continuación forzada de respuesta de 128 tokens (mecanismo de *answer forcing* que garantiza que la secuencia termine en un formato evaluable). El presupuesto se fija en 4.000 rollouts; la última actualización de checkpoint es la 499 en base cero, que corresponde exactamente a esos 4.000 rollouts. La validación se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt (256 generaciones), sin que esas muestras computen contra el presupuesto de entrenamiento, y el criterio de parada anticipada es alcanzar un pass@1 in-distribution ≥ 0,98 antes del límite de rollouts. El repositorio conserva pesos y tokenizer, pero **no** incluye estado de optimizador ni de dataloader; los detalles de configuración se registran en `training_run.json` y `training_config.yaml` dentro del propio repositorio, y el run de seguimiento está en Weights & Biases.

## Capacidades

- Generación de texto autoregresiva sobre la tarea sintética de conteo de bloques monocromos (`MonochromeBlockCounting`), que es el entorno para el que fue entrenado.
- Razonamiento encadenado corto inducido por el modelo base (destilado de DeepSeek-R1), orientado a producir una respuesta final verificable tras la continuación forzada de 128 tokens.
- Capacidad de actuar como **teacher** en destilación on-policy: genera trayectorias etiquetadas para entrenar un estudiante en la misma tarea.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso general: no documentado; el alcance es un único entorno de un paso con verificación programática.
- Capacidades multilingües: no documentadas; el entrenamiento no declara corpus lingüístico.
- Capacidades especiales: ninguna declarada (sin visión, audio, ni modo *thinking* explícito más allá del estilo de razonamiento heredado del modelo base).
- Etiqueta `conversational`, lo que indica que la plantilla de chat del modelo base se mantiene operativa, aunque no hay evaluación de diálogo publicada.

## Casos de uso

- **Destilación de una habilidad verificable en un estudiante**: usar este checkpoint como profesor que genera rollouts con recompensa conocida sobre `MonochromeBlockCounting`, y entrenar con ellos un modelo menor o el propio modelo base, siguiendo la receta OPD del autor.
- **Replicación de experimentos de escalado de datos de RL**: el repositorio documenta presupuesto de rollouts, cadencia de validación y criterio de parada, de modo que sirve como punto de comparación reproducible frente a otros teachers de la misma familia (`data-scaling-v1`).
- **Estudio de *answer forcing* en RLVR**: la configuración de 1.024 tokens de generación más 128 tokens de continuación forzada permite analizar cómo afecta el formateo de la respuesta a la estabilidad del entrenamiento con GRPO.
- **Generación de datos sintéticos para evaluación de tareas de conteo**: producir conjuntos de preguntas y soluciones verificables para construir tests de razonamiento aritmético simple, con control de dificultad 0/1.
- **Análisis de dinámica de entrenamiento GRPO**: al conservarse la actualización final (499) y las referencias al run de W&B, se puede correlacionar el número de rollouts con la precisión in-distribution en una tarea con recompensa binaria exacta.
- **Componente en pipelines de investigación con TGI**: la etiqueta `text-generation-inference` y `endpoints_compatible` permiten servirlo en un endpoint compatible con la API de HuggingFace para generar lotes de evaluación a pequeña escala.
- **Línea base en comparativas de recetas RL**: confrontar este teacher especialista contra un ajuste supervisado puro o contra el modelo base sin RL para medir la ganancia atribuible al bucle de RL en una habilidad acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona el criterio de parada del entrenamiento (pass@1 en validación in-distribution ≥ 0,98 con 32 prompts × 8 respuestas), pero no reporta el valor final alcanzado ni resultados en MMLU, HumanEval, GSM8K u otras suites estándar. Tampoco se han publicado comparaciones numéricas con el modelo base.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~3,6 GB en bf16/fp16 (tamano real del repositorio), ~1,8 GB en int8 y ~1,0-1,2 GB en int4 (estimaciones por recuento de parametros, sin validacion publicada por el autor).
- **GPU profesionales**: cabe holgadamente en una A100 (40/80 GB), H100, L40S o A10G; el modelo ocupa una fraccion minima de la memoria, por lo que el cuello de botella sera el throughput de lotes, no la capacidad.
- **GPU de consumo**: si, entra en cualquier GPU con 6 GB o mas en fp16 (RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4090). En 4 bits cabria incluso en iGPU con memoria unificada, aunque sin garantias de latencia.
- **Opciones de despliegue**: vLLM y TGI son las opciones recomendadas para generacion por lotes (la etiqueta `endpoints_compatible` sugiere compatibilidad con *Inference Endpoints*); `transformers` directo para scripts de investigacion; conversion a GGUF con llama.cpp u Ollama para entornos sin GPU dedicada (no se distribuye GGUF oficial).
- **Latencia y throughput**: no disponibles. Al tratarse de un modelo de 1,5B denso, en una RTX 4090 se espera un throughput del orden de miles de tokens por segundo con lotes grandes en vLLM, pero es una estimacion por tamano, no una medicion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`rlve-opd-teacher-...MonochromeBlockCounting`) | 1,78B | No disponible | Teacher GRPO para un entorno sintetico de conteo | No disponible | HuggingFace, 0 descargas |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (modelo base) | ~1,5B | No disponible en la informacion proporcionada | Razonamiento general destilado de R1 | MIT (segun el modelo base) | HuggingFace, ampliamente utilizado |
| `Qwen/Qwen2.5-1.5B-Instruct` | ~1,5B | No disponible en la informacion proporcionada | Instrucciones generales, multilingue | Apache 2.0 (segun el modelo base Qwen2.5) | HuggingFace |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` | ~7,6B | No disponible en la informacion proporcionada | Razonamiento general destilado, mayor capacidad | MIT (segun el modelo base) | HuggingFace |

La comparacion relevante no es de rendimiento general —este checkpoint no ha sido evaluado en ninguna suite estandar— sino de proposito: frente al modelo base y a un Instruct generico, este teacher esta sobreajustado a un unico entorno verificable y pierde, previsiblemente, buena parte de la polivalencia del original. Los datos de contexto y licencia de las alternativas deben confirmarse en sus respectivas model cards.

## Limitaciones y advertencias

- **Sobreajuste a un unico entorno**: el entrenamiento se limita a `MonochromeBlockCounting` con dificultad fija 0/1; no hay evidencia de transferencia a otras tareas de conteo, razonamiento aritmetico general ni conversacion abierta.
- **Riesgo alto de degradacion fuera de distribucion**: un ajuste GRPO de 4.000 rollouts sobre una sola tarea puede erosionar capacidades del modelo base; no se han publicado evaluaciones que cuantifiquen esa perdida.
- **Licencia no declarada**: el repositorio no indica licencia. Aunque el modelo base DeepSeek-R1-Distill-Qwen-1.5B se distribuye bajo MIT, la ausencia de licencia explicita en este derivado es un riesgo juridico para uso comercial; conviene contactar con el autor.
- **Sin idiomas declarados**: no hay informacion sobre el rendimiento en castellano ni en ningun otro idioma; el entorno de entrenamiento es sintetico y probablemente en ingles.
- **Sin benchmarks publicados**: no se puede afirmar nada sobre su calidad absoluta ni comparada; el unico criterio conocido es el umbral de parada (pass@1 ≥ 0,98), no el valor alcanzado.
- **Alucinacion**: al ser un modelo pequeno con RL sobre recompensa binaria, fuera del formato esperado (1.024 + 128 tokens) puede producir cadenas de razonamiento plausibles pero incorrectas sin senal de incertidumbre.
- **Formato de inferencia dependiente de la configuracion**: el comportamiento entrenado asume la continuacion forzada de 128 tokens; usarlo con otras longitudes o plantillas puede degradar drasticamente la precision.
- **Estado incompleto para reanudar entrenamiento**: no se incluyen estados de optimizador ni de dataloader, por lo que no es posible reanudar el run exactamente desde este checkpoint.
- **Repositorio sin mantenimiento aparente**: 0 descargas y 0 likes en la fecha de consulta, sin issues ni discusion documentada.
- **Resultados de busqueda web no utilizables**: las busquedas realizadas no devolvieron informacion tecnica relevante sobre este modelo (solo contenido no relacionado), por lo que no se ha podido contrastar ningun dato adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-121-MonochromeBlockCounting-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/07055d98 (grupo `data-scaling-v1-n128-20261022-225839`)
- Ficheros de configuracion citados en la model card: `training_run.json` y `training_config.yaml` (incluidos en el repositorio)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
