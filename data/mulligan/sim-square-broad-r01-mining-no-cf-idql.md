# mulligan/sim-square-broad-r01-mining-no-cf-idql

## Resumen

El modelo `mulligan/sim-square-broad-r01-mining-no-cf-idql` es un agente de control robótico basado en IDQL (Implicit Diffusion Q-Learning), desarrollado por el equipo de Mulligan y publicado bajo licencia Apache 2.0. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo offline compuesta por un actor de difusión y un crítico IQL escalar, orientada a la tarea de manipulación simulada `sim-square-broad`. El repositorio contiene cinco checkpoints independientes (uno por semilla) y ficheros `stats.json` con los normalizadores de estados y acciones.

La relevancia del artefacto reside en su carácter reproducible y auditable dentro del ecosistema Mulligan: cada checkpoint es una copia byte a byte de un artefacto de Weights & Biases, con verificación MD5 frente al manifiesto original y SHA-256 registrado en `release.json`. Los cinco checkpoints corresponden al paso de entrenamiento 250001 y a la ronda R1, brazo `mining-no-cf`, dentro de la celda de campaña `sq_d1_r1_ours_mining_nocf_human_only`.

El modelo está pensado para evaluación comparativa en robótica (Policy Arena) y como referencia de política entrenada con datos de teleoperación, DAgger con intervención humana y rollouts de políticas previas. Al ser una política basada en estado, no procesa lenguaje ni imágenes, y su ventana de contexto no aplica en el sentido de los LLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusión (diffusion policy) con critico IQL escalar (actor-critico para RL offline) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica basada en estado; no hay ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch en coma flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control roboticos; los idiomas figuran como no disponibles en HuggingFace) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch pickle (`.pt`) mas ficheros `stats.json` de normalizacion |
| Tarea | sim-square-broad |
| Ronda de modelo | R1 |
| Brazo / celda de campana | mining-no-cf / `sq_d1_r1_ours_mining_nocf_human_only` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1.4 GB (cinco checkpoints; aproximadamente 280 MB por semilla segun aritmetica directa del total) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema IDQL: un actor parametrizado como modelo de difusión que representa la distribución de acciones, y un crítico escalar entrenado con Implicit Q-Learning (IQL) que evita consultar acciones fuera de la distribución del conjunto de datos. La política es puramente basada en estado (state-based), sin entrada visual ni textual. El artefacto `policy.pt` es un pickle de PyTorch que contiene los pesos de la red, mientras que `stats.json` aporta las estadísticas de normalización necesarias para reproducir el preprocesado.

El entrenamiento se realizó con el código de investigación de Mulligan en los commits indicados (`604a0622cf7b`, `d74546d3b5c3`, `11dfbbda36b2`, `4dcb7a9e8e7b`), y los datos proceden de tres fuentes declaradas: `sim-square-broad-c00-teleop-sobol` (teleoperación con SOBOL), `sim-square-broad-c01-dagger-mining-no-cf` (DAgger con minería de intervenciones humanas, sin contrafactuales) y `sim-square-broad-c01-sobol-policy-rollouts` (rollouts de políticas previas). No se documenta en la información disponible el número de transiciones, la composición exacta del dataset ni si hubo fases adicionales de ajuste tipo RLHF o DPO, que en este dominio no aplican.

## Capacidades

- Control robótico continuo basado en estado para la tarea `sim-square-broad` en simulación.
- Generación de acciones mediante muestreo de un actor de difusión, lo que permite representar distribuciones de acción multimodales.
- Aprendizaje por refuerzo offline: la política puede entrenarse sin interacción online con el entorno, usando datos previamente recolectados.
- Aprovechamiento de datos heterogéneos: teleoperación, datos DAgger con intervención humana y rollouts de políticas anteriores.
- Evaluación multi-semilla: se publican cinco checkpoints independientes para medir varianza entre semillas.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los agentes basados en LLM.
- No dispone de capacidades multilingües, de visión, de audio ni de modo de razonamiento (`thinking mode`).
- No es un modelo generativo de texto: su salida son acciones de control.

## Casos de uso

- Evaluación comparativa de políticas en simulación: cargar cada uno de los cinco checkpoints de semilla y medir la tasa de éxito en `sim-square-broad` para reportar media y desviación entre semillas.
- Reproducción de resultados de investigación: al ser copias byte a byte de artefactos de W&B con verificación MD5 y SHA-256, permite auditar y reproducir las cifras publicadas en la campaña `sq_d1_r1_ours_mining_nocf_human_only`.
- Punto de partida para DAgger iterativo: usar la política como actor inicial que genera rollouts, sobre los que un operador humano introduce correcciones que alimentan la siguiente ronda.
- Docencia y prototipado en RL offline: ejemplo funcional de IDQL con actor de difusión y crítico IQL, útil para cursos o talleres prácticos de aprendizaje por refuerzo.
- Estudio de varianza y robustez: comparar los cinco seeds para analizar la sensibilidad del entrenamiento respecto a la inicialización y a la semilla de muestreo.
- Base para destilado o despliegue en simuladores propios: exportar `policy.pt` a un grafo de inferencia y conectarlo a un entorno compatible con las convenciones de estados y acciones del dataset original.
- Benchmark de métodos de RL offline: usar el checkpoint como referencia frente a otras variantes (por ejemplo, brazos con contrafactuales) dentro del mismo banco de pruebas de Mulligan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia la existencia de evaluaciones en Policy Arena y un conjunto de evaluación (`sim-square-broad-r00-r03-eval`), pero no incluye cifras de rendimiento, tasas de éxito ni métricas por tarea en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. A partir del tamaño del repositorio (1.4 GB para cinco checkpoints, en torno a 280 MB por semilla), un único checkpoint debería residir cómodamente en cualquier GPU consumer, e incluso ser viable en CPU para inferencia de baja frecuencia. Esta estimación es orientativa y no está confirmada por el autor.
- GPU recomendadas: no disponibles. Dado que es una política basada en estado, no requiere aceleradores de gran capacidad como A100 o H100 para inferencia; una GPU de gama media o incluso una RTX 4090 resultan holgadas para ejecutar un único checkpoint.
- ¿Cabe en GPU consumer? Sí, previsiblemente en cualquier GPU consumer con unos pocos GB de VRAM; el cuello de botella real será el simulador de robótica, no la red.
- Opciones de despliegue: PyTorch nativo (carga de `policy.pt` junto con `stats.json`). Los frameworks de servicio de LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables, ya que no se trata de un transformer de lenguaje. Se podría exportar a TorchScript u ONNX, pero no se documenta esta vía en la información disponible.
- Latencia y throughput: no disponibles. Dependerán del paso de muestreo del actor de difusión (número de pasos de denoising) y del hardware, parámetros que no se especifican en la model card.

## Comparativa con modelos similares

La comparación se plantea a nivel de método y familia, ya que no se dispone de métricas de este checkpoint concreto.

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mulligan/sim-square-broad-r01-mining-no-cf-idql` | IDQL (actor de difusion + critico IQL) | no disponible | no aplica | Apache 2.0 | HuggingFace, 5 semillas |
| IDQL (Hansen-Estruch et al.) | IDQL de referencia | no disponible | no aplica | segun publicacion original | Codigo y pesos de referencia del paper |
| Diffusion Policy (Chi et al.) | Actor de difusion para imitacion | no disponible | no aplica | segun publicacion original | Codigo y checkpoints publicos |
| IQL (Kostrikov et al.) | Critico IQL con actor MLP | no disponible | no aplica | segun publicacion original | Codigo de referencia |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es específico de la tarea `sim-square-broad`; no es transferible directamente a otras tareas o entornos sin reentrenamiento.
- Es una política basada en estado: no procesa imágenes, lenguaje ni audio, y no puede emplearse como agente conversacional o multimodal.
- No se documentan sesgos, pero al entrenarse con datos de teleoperación humana y DAgger, hereda las limitaciones y posibles sesgos de comportamiento de los operadores que generaron las demostraciones.
- Riesgo de alucinación: no aplica en el sentido de los LLM; el riesgo equivalente es la generación de acciones fuera de la distribución soportada cuando el estado se aleja de los datos de entrenamiento, algo que IDQL mitiga parcialmente mediante IQL, pero no elimina.
- Los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en entornos de confianza, tal como advierte la propia model card.
- Cada checkpoint corresponde al paso 250001; no se ofrece información sobre curvas de aprendizaje, sobreajuste ni criterios de selección del checkpoint final.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se especifican condiciones adicionales sobre los datos de entrenamiento, cuyas licencias deben verificarse por separado en los repositorios de dataset correspondientes.
- Los checkpoints no incluyen estado de optimizador ni recetas de entrenamiento completas en el repositorio; para reentrenar es necesario reproducir el código de Mulligan en los commits citados.
- No hay garantías de rendimiento en hardware real (solo simulación), ya que el entrenamiento y la evaluación se realizaron en simulación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-mining-no-cf-idql
- Sitio del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset DAgger con minería de intervenciones: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-mining-no-cf
- Dataset de rollouts de política: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
