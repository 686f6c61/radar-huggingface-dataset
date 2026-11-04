# Songyuan666/TGCC-hotdog-v3fast-step02153

## Resumen

TGCC-hotdog-v3fast-step02153 es un checkpoint de política robótica desarrollado por el usuario Songyuan666, especializado en la tarea de cocinar perritos calientes (`cook_hot_dogs`) dentro del benchmark BEHAVIOR-1K. Se trata de un fine-tuning del modelo base `Songyuan666/TC-pi0.5`, que a su vez deriva de la familia pi0.5 (PaliGemma como columna vertebral VLM más un módulo ActionExpert para generación de acciones motoras). El modelo está diseñado para control robótico de manipulación de objetos, no para generación de texto o código.

El checkpoint corresponde a una parada manual del entrenamiento en el paso 2153 de un presupuesto planificado de 4000 actualizaciones de joints (`training_complete=false`). Durante el ajuste se mantuvieron congelados el vision tower, el proyector y el VLM PaliGemma, mientras que se actualizaron el ActionExpert, la E/S de acciones, tres grafos, la memoria semántica, el crítico y los módulos de recuperación (retrieval). El modelo utiliza RGB más grafos Oracle específicos de la tarea como entrada.

Es relevante ahora como ejemplo de arquitectura híbrida VLM+política para manipulación de objetos de largo horizonte en BEHAVIOR-1K, aunque su estado es claramente experimental: no hay tasa de éxito reportada, la evaluación independiente está pendiente y el entrenamiento se detuvo antes de completarse. No debe interpretarse como un modelo listo para producción ni como un checkpoint multi-tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida VLM (PaliGemma congelado) + ActionExpert + grafos semánticos + crítico + retrieval |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje general) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoint/` con pesos de inferencia y metadatos originales) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5: un VLM PaliGemma con vision tower y proyector congelados durante este fine-tuning, acoplado a un ActionExpert que genera acciones motoras. Sobre esta base se añaden módulos propios de TGCC: tres grafos (presumiblemente de representación semántica o de planificación), memoria semántica, un crítico y módulos de retrieval con un encoder de recuperación independiente que permanece congelado. La entrada combina RGB con grafos Oracle específicos de la tarea (`task-scoped Oracle graphs`), lo que implica que el sistema asume disponibilidad de información privilegiada de la tarea durante la evaluación reportada.

El entrenamiento se realizó exclusivamente sobre la tarea `cook_hot_dogs` del dataset `behavior-1k/2025-challenge-demos`, con objetivos delta corregidos, condicionamiento de referencia, burn-in de 4 bloques y BPTT de 8 bloques. Se ejecutaron 2153 actualizaciones nuevas del schedule (12153 acumuladas de la política, 4809 acumuladas del crítico). La calibración se hizo con 16 episodios de demostración de éxito reservados. El scope de actualización fue `vision_vlm_frozen; expert_action_io_graphs_memory_semantics_critic_retrieval_jointly_updated`, con los grupos de política `['vision', 'vlm']` congelados. El estado del optimizador (Adam/RNG) no se incluye en la release pública, por lo que no se reclama completitud de reanudación de optimizador.

## Capacidades

- Control robótico de manipulación para la tarea específica `cook_hot_dogs` en BEHAVIOR-1K.
- Generación de acciones motoras de largo horizonte mediante el ActionExpert condicionado por representaciones del VLM.
- Uso de memoria semántica y grafos Oracle específicos de tarea para condicionar la política.
- Recuperación (retrieval) desde una biblioteca de soporte emparejada con encoder congelado.
- Evaluación asistida por un módulo crítico entrenado de forma conjunta.
- Entrada multimodal limitada a RGB más grafos de tarea; no se documentan otras modalidades.
- No soporta tool calling, function calling, agentes de texto ni generación de lenguaje general: es un modelo de robótica, no un LLM conversacional.
- No se documentan capacidades multilingües ni modo thinking.

## Casos de uso

- Investigación en manipulación de largo horizonte: usar el checkpoint como referencia para reproducir el protocolo TGCC en `cook_hot_dogs` dentro de BEHAVIOR-1K, comparando el efecto de congelar VLM frente a ajustar solo el ActionExpert y módulos auxiliares.
- Estudio de arquitecturas VLM+política: analizar cómo un VLM congelado (PaliGemma) transfiere representaciones visuales a un ActionExpert entrenado con pocas actualizaciones (2153) sobre una única tarea.
- Evaluación de módulos de memoria y retrieval en robótica: el checkpoint incluye `retrieval_library/` con encoder congelado, útil para experimentar con recuperación de demostraciones de soporte en políticas de imitación.
- Baseline para ablaciones de burn-in y BPTT: al documentarse burn-in de 4 bloques y BPTT de 8 bloques, sirve como punto de partida para estudiar el impacto de estas ventanas en el entrenamiento de políticas recurrentes.
- Reproducción de calibración con episodios reservados: el uso de 16 episodios de éxito reservados permite replicar el protocolo de calibración sin tunear umbrales sobre instancias públicas de evaluación.
- Docencia y divulgación sobre BEHAVIOR-1K: como ejemplo de fine-tuning de un solo task sobre pi0.5, es útil para explicar el flujo completo (dataset, congelación selectiva, metadatos de entrenamiento, release de inferencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación independiente de los episodios 301–320 está pendiente y que no se reclama ninguna tasa de éxito (`no success rate is claimed yet`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 8.5 GB, lo que da una cota inferior orientativa del espacio en disco necesario para pesos y biblioteca de retrieval; la VRAM real depende de la carga del VLM PaliGemma y del ActionExpert, no documentada.
- GPU recomendadas: no disponible en la información proporcionada. Por la presencia de un VLM PaliGemma, es razonable esperar requisitos de GPU con memoria suficiente para inferencia de VLM, pero no se confirma en la documentación.
- ¿Cabe en GPU consumer? no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El modelo es un checkpoint PyTorch personalizado (`custom robotics model, not a Transformers AutoModel checkpoint`) y requiere el código de `susongyuan/TGCC`, además de BEHAVIOR/Isaac y sus assets de escena como dependencias externas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TGCC-hotdog-v3fast-step02153 | no disponible | no disponible | `cook_hot_dogs` (BEHAVIOR-1K) | no disponible | HuggingFace, checkpoint experimental |
| Songyuan666/TC-pi0.5 (modelo base) | no disponible | no disponible | Política pi0.5 base | no disponible | HuggingFace |
| pi0.5 (familia original) | no disponible | no disponible | Robótica general | no disponible | no disponible en la información |

No se dispone de datos de benchmarks ni de especificaciones de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Entrenamiento incompleto: parada manual en el paso 2153 de 4000 (`training_complete=false`); el rendimiento puede ser sustancialmente inferior al de un checkpoint completado.
- Sin tasa de éxito reportada: la evaluación independiente 301–320 está pendiente y no se reclama ningún resultado.
- Especialización extrema: fine-tuned solo en `cook_hot_dogs`; no es un checkpoint multi-tarea y no se reclama generalización entre tareas.
- Dependencia de grafos Oracle específicos de tarea: el protocolo reportado usa RGB más grafos Oracle, lo que limita la aplicabilidad fuera de entornos donde esa información esté disponible.
- Dependencias externas: requiere BEHAVIOR/Isaac y sus assets de escena, además del código de TGCC; no es un checkpoint estándar de Transformers.
- Licencia no disponible: no se especifican términos de uso comercial; además, las licencias del código original, del modelo, del dataset y de los assets siguen aplicando.
- Reanudación de optimizador no garantizada: el estado de Adam/RNG se retiene de forma privada en el servidor de entrenamiento; la release pública es solo de inferencia.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas o no generalizables fuera de la distribución de demostraciones.
- Sesgos: no documentados; al entrenarse sobre un dataset específico de BEHAVIOR-1K, hereda los sesgos de distribución de ese dataset.
- Límites nativos del controlador activados: la model card indica que los límites del controlador nativo permanecen habilitados, lo que puede restringir el rango de acciones ejecutables.
- Sin vídeo de evaluación grabado: no hay evidencia visual del comportamiento del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Songyuan666/TGCC-hotdog-v3fast-step02153
- Modelo base TC-pi0.5: https://huggingface.co/Songyuan666/TC-pi0.5
- Repositorio de código TGCC: https://github.com/susongyuan/TGCC
- Dataset de referencia: `behavior-1k/2025-challenge-demos` (HuggingFace datasets)
