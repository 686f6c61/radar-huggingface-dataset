# Shiki42/PutCab-RightLead-Offline-Train50-V4-PI05-LoRA10K-E1170

## Resumen

PutCab RightLead-Offline π0.5 LoRA 10K (E1170) es un checkpoint de investigación publicado por el usuario Shiki42 en Hugging Face. Se trata de un ajuste fino mediante LoRA sobre π0.5, el modelo de política visuomotora de OpenPI implementado en JAX, orientado a manipulación robótica en el simulador RoboTwin. El modelo resuelve la tarea "Put Object Cabinet" (PutCab), en la que un brazo robótico debe abrir un cajón e insertar un objeto en su interior.

El interés del checkpoint es fundamentalmente metodológico: no es un modelo de producción, sino una ablación de refutación (rebuttal ablation) fechada el 13 de noviembre de 2026. El autor recombina las mismas 50 demostraciones que usa la política de referencia CTR, pero eliminando la restricción de coordinación entre brazos (cross-arm constraint) de la tarea, de modo que el brazo derecho (el que porta el objeto) lidera al izquierdo (el que abre el cajón). En 41 de las 50 demostraciones recompuestas el objeto se inserta antes de que el cajón esté abierto.

El resultado es deliberadamente negativo: la política entrenada sobre estos datos alcanza solo un 4,0 % de éxito (12/300 episodios) frente al 48,7 % (146/300) de la política CTR entrenada sobre las mismas 50 demostraciones sin IdleMask. El checkpoint sirve, por tanto, como evidencia empírica sobre la importancia de las restricciones de coordinación y de la máscara de inactividad en el entrenamiento de políticas robóticas con π0.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (OpenPI, implementación JAX); ajuste fino LoRA sobre política visuomotora |
| Parametros totales | no disponible (repo de 6,3 GB; solo se distribuyen parámetros de inferencia) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en bf16 según la receta) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural documentada) |
| Licencia | Apache 2.0 |
| Formato de pesos | parámetros de inferencia en `params/` (formato nativo OpenPI/JAX), estadísticas de normalización en `assets/`, metadatos en `_CHECKPOINT_METADATA` |

## Arquitectura y entrenamiento

El modelo parte de π0.5 en su implementación OpenPI sobre JAX y se adapta mediante LoRA (Low-Rank Adaptation) con precisión bf16. La receta concreta es: batch global de 16, 10.000 actualizaciones, semilla 87431 y IdleMask desactivada. La normalización emplea cuantiles globales exactos recalculados sobre el dataset específico, almacenados en `assets/`. El checkpoint corresponde al paso 10.000 (E1170).

Los datos de entrenamiento son 50 demostraciones de la tarea PutCab en el simulador RoboTwin, tomadas del dataset `Shiki42/PutCab-RightLead-Offline-Train50-V4` en la revisión `9b451448626a866ab363e581af396bd1e06dd0f0`. La innovación metodológica no está en la arquitectura sino en la construcción del dataset: las demostraciones se recombinan offline eliminando la restricción de coordinación entre brazos, produciendo secuencias en las que el brazo del objeto actúa antes de que el brazo del cajón haya completado la apertura. El autor documenta que esto ocurre en 41 de las 50 demostraciones. No se incluyen el estado del optimizador ni el del cargador de datos; el repositorio contiene únicamente los parámetros de inferencia y las estadísticas de normalización, con un fichero `SHA256SUMS` que lista todos los archivos.

## Capacidades

- Control visuomotor para manipulación robótica bimanual en simulación (RoboTwin), específicamente la tarea PutCab (abrir cajón e insertar objeto).
- Ejecución de políticas de imitación entrenadas sobre demostraciones teleoperadas.
- Inferencia con parámetros en bf16 mediante el stack OpenPI/JAX.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se documenta modo de pensamiento (thinking mode), audio ni otras modalidades.

## Casos de uso

- Estudio de ablación en investigación: el checkpoint permite reproducir y analizar el efecto de eliminar la restricción de coordinación entre brazos en el dataset de entrenamiento, comparando directamente con la política CTR (E609) sobre las mismas 50 demostraciones.
- Análisis de la IdleMask: sirve como referencia para evaluar el impacto de desactivar la máscara de inactividad en el entrenamiento de políticas π0.5 con LoRA.
- Reproducibilidad experimental: al incluir las estadísticas de normalización exactas y un manifiesto `SHA256SUMS`, permite verificar la integridad del checkpoint y repetir la evaluación en las 3 × 100 escenas estándar de PutCab.
- Docencia y formación en robótica de imitación: ilustra de forma cuantitativa cómo la calidad y coherencia temporal de las demostraciones condiciona el rendimiento de una política (4,0 % frente a 48,7 %).
- Desarrollo de pipelines de evaluación en RoboTwin: el modelo puede integrarse como baseline negativo en suites de evaluación automatizadas para detectar políticas que ignoran dependencias entre subtareas.
- Investigación sobre recombinação offline de demostraciones: punto de partida para estudiar técnicas de aumento de datos que preserven restricciones causales entre brazos.

## Benchmarks y rendimiento

| Modelo | Entrenamiento | Éxito (PutCab, 3 × 100 escenas) |
|---|---|---|
| PutCab RightLead-Offline π0.5 LoRA 10K (E1170) | 50 demos recompuestas sin restricción cross-arm, IdleMask off | 12/300 (4,0 %) |
| CTR policy (E609) | 50 demos, sin IdleMask | 146/300 (48,7 %) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable dado que se trata de un modelo de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 6,3 GB, lo que da una cota inferior orientativa del espacio en disco necesario para los pesos de inferencia.
- GPU recomendadas: no disponible. El stack OpenPI/JAX es compatible con aceleradores NVIDIA, pero el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el checkpoint está pensado para el stack OpenPI (JAX). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Datos | Éxito PutCab | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E1170 (este checkpoint) | π0.5 + LoRA | 50 demos recompuestas, IdleMask off | 4,0 % (12/300) | Apache 2.0 | Hugging Face |
| CTR policy (E609) | π0.5 + LoRA | 50 demos, IdleMask off | 48,7 % (146/300) | no disponible | referenciado en la model card |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas visuomotoras para RoboTwin/PutCab) en la documentación proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo por diseño: 4,0 % de éxito, fruto de una ablación deliberada; no debe usarse como política de producción.
- El dataset de entrenamiento contiene secuencias temporalmente incoherentes (41/50 demos insertan el objeto antes de abrir el cajón), lo que introduce un sesgo estructural en el comportamiento aprendido.
- Solo se distribuyen parámetros de inferencia; no hay estado de optimizador ni de data-loader, por lo que no es posible reanudar el entrenamiento desde este checkpoint.
- Ámbito muy restringido: una única tarea (PutCab) en un único simulador (RoboTwin); no se documenta transferencia a robots reales.
- No se documentan sesgos sociales, de idioma ni de contexto, al no ser un modelo de lenguaje.
- Riesgo de alucinación no aplicable en el sentido habitual; el riesgo equivalente es la ejecución de secuencias de acción inválidas, evidenciado por la baja tasa de éxito.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica como artefacto de investigación.
- Sin descargas ni likes en el momento de la consulta; no hay validación externa independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiki42/PutCab-RightLead-Offline-Train50-V4-PI05-LoRA10K-E1170
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-RightLead-Offline-Train50-V4
- OpenPI (repositorio oficial de π0.5): no disponible en la información proporcionada
- RoboTwin (simulador): no disponible en la información proporcionada
- Paper de π0.5: no disponible en la información proporcionada
