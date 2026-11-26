# eddykang06/qwen3.5-9b-pear-libero-sft

## Resumen

Qwen3.5-9b-pear-libero-sft es un ajuste fino por supervisión (SFT) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario eddykang06 y publicado en Hugging Face. El modelo está orientado a robótica y, más concretamente, al benchmark LIBERO, un conjunto de tareas de manipulación robótica ampliamente utilizado para evaluar políticas visomotoras y modelos de razonamiento aplicados a agentes. Se trata, por tanto, de un modelo de lenguaje de 9.000 millones de parámetros reconvertido en componente de un pipeline de robótica, no de un modelo conversacional de propósito general.

El entrenamiento se realizó mediante destilación desde un modelo profesor de mayor tamaño, Qwen3.8-27B-PEAR-LIBERO_only (atribuido a mit-han-lab), utilizando únicamente los episodios exitosos generados por dicho profesor ("rollouts") y publicados como dataset en eddykang06/qwen3.8-27b-pear-libero-rollouts. El objetivo es que el modelo alumno de 9B reproduzca el comportamiento del profesor de 27B en tareas LIBERO con un coste de inferencia notablemente menor. Forma parte del proyecto robot-distillation, alojado en GitHub bajo el usuario ericjkge.

La relevancia del modelo es acotada pero clara para quien trabaja en destilación de políticas robóticas: demuestra un flujo de trabajo de destilación profesor-alumno sobre un LLM moderno aplicado a un benchmark de manipulación. No obstante, la model card indica explícitamente "Not uploaded yet", es decir, los pesos no estaban disponibles en el momento de la publicación de la ficha, y el repositorio no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-9B); detalles específicos no disponibles |
| Parametros totales | 9.000 millones (según el nombre del modelo y el modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card indica "Not uploaded yet") |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer decoder-only de 9.000 millones de parámetros, y se ajusta mediante SFT sobre los episodios exitosos de un profesor de 27B (Qwen3.8-27B-PEAR-LIBERO_only) ejecutado a "xhigh effort". El dataset de entrenamiento es eddykang06/qwen3.8-27b-pear-libero-rollouts, compuesto por trayectorias o rollouts del profesor en tareas LIBERO. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas posteriores de RLHF o DPO.

La innovación técnica principal es el propio esquema de destilación: transferir el comportamiento de un modelo profesor de 27B a un alumno de 9B para tareas de robótica, reduciendo el coste computacional de inferencia. No se detallan en la información proporcionada técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido, más allá de la mención al "xhigh effort" del profesor.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-9B, si bien el ajuste fino está orientado a robótica.
- Ejecución de tareas del benchmark LIBERO, presumiblemente mediante generación de acciones o planes a partir de observaciones.
- Destilación de comportamiento: reproduce las trayectorias exitosas del profesor de 27B en el dominio LIBERO.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; el dominio LIBERO implica planificación secuencial.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Investigación en destilación de políticas robóticas: el modelo sirve como alumno de referencia para estudiar cuánto comportamiento de un profesor de 27B se retiene en un modelo de 9B sobre LIBERO.
- Evaluación comparativa en LIBERO: permite medir la tasa de éxito del alumno frente al profesor y a otras políticas en las mismas tareas de manipulación.
- Reducción de coste de inferencia en robótica: al ser un 9B en lugar de un 27B, facilita el despliegue en entornos con recursos limitados, siempre que los pesos estén disponibles.
- Reproducción de experimentos del proyecto robot-distillation: el modelo y su dataset asociado permiten replicar el pipeline de destilación descrito en el repositorio de GitHub.
- Generación de datos sintéticos de trayectorias: el alumno puede emplearse para producir rollouts adicionales a menor coste que el profesor, que luego se filtren por éxito.
- Estudio de transferencia de capacidades de LLM a robótica: analizar qué capacidades del modelo base (razonamiento, planificación) se preservan tras el SFT en un dominio tan específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa para un modelo de 9B, en FP16 se requerirían aproximadamente 18 GB de VRAM, y en cuantización de 4 bits alrededor de 5-6 GB, aunque estos valores no están confirmados para este modelo concreto.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; dependería del formato de pesos, que no se ha publicado.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eddykang06/qwen3.5-9b-pear-libero-sft | 9B | no disponible | Robótica (LIBERO) | no disponible | Pesos no subidos ("Not uploaded yet") |
| Qwen/Qwen3.5-9B (modelo base) | 9B | no disponible | Propósito general | no disponible | Disponible en Hugging Face |
| Qwen3.8-27B-PEAR-LIBERO_only (profesor) | 27B | no disponible | Robótica (LIBERO) | no disponible | Referenciado en la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no estaban disponibles en el momento de redactar esta ficha: la model card indica explícitamente "Not uploaded yet", por lo que el modelo no es utilizable tal cual.
- El repositorio no registra descargas ni likes, lo que sugiere que no ha sido validado por la comunidad.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; además, la licencia del modelo base Qwen3.5-9B debería respetarse y no se detalla aquí.
- El ajuste fino está restringido al dominio LIBERO; es previsible un rendimiento deficiente fuera de ese benchmark, aunque no se aportan datos que lo cuantifiquen.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas.
- Al tratarse de un modelo destilado de un profesor, puede heredar errores sistemáticos del profesor, especialmente en episodios no representados en el dataset de rollouts.
- No hay información sobre el proceso de filtrado de los episodios exitosos ni sobre la cobertura de tareas LIBERO, lo que dificulta evaluar la generalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eddykang06/qwen3.5-9b-pear-libero-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo profesor: https://huggingface.co/mit-han-lab/Qwen3.8-27B-PEAR-LIBERO_only
- Dataset de rollouts: https://huggingface.co/datasets/eddykang06/qwen3.8-27b-pear-libero-rollouts
- Repositorio del proyecto: https://github.com/ericjkge/robot-distillation
