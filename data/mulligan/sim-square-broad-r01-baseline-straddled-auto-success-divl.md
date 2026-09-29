# mulligan/sim-square-broad-r01-baseline-straddled-auto-success-divl

## Resumen

El modelo `mulligan/sim-square-broad-r01-baseline-straddled-auto-success-divl` es un agente de control para robótica basado en estado, publicado por el equipo de Mulligan dentro de su campaña de investigación sobre la tarea simulada `sim-square-broad`. No es un modelo de lenguaje: se trata de un política de acción (actor) congelada de tipo difusión, heredada de un modelo padre, acompañada de un crítico distribucional DIVL entrenado en esta ronda. El repositorio contiene cinco checkpoints, uno por semilla (seeds 1 a 5), correspondientes al paso de entrenamiento 250001.

El problema que aborda es el de la mejora de políticas mediante aprendizaje por refuerzo offline y minería de datos tipo DAgger sobre una tarea de inserción/ensamblaje simulada, con la particularidad de que el actor permanece congelado y solo se entrena el crítico. Esta configuración ("baseline-straddled-auto-success") forma parte de una matriz de experimentos identificada como `sq_d1_r1_baseline_uniform_nocf_straddled_auto_success`, dentro de la ronda R1 de la campaña.

Su relevancia es fundamentalmente metodológica: sirve como punto de comparación reproducible (con seeds fijas, artefactos de W&B trazables y verificación de integridad por MD5/SHA-256) frente a otras variantes de la misma tarea, como la versión basada en IDQL. El tamaño del repositorio es de 1,4 GB en total, que incluye los cinco checkpoints.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente actor-crítico basado en estado: actor de difusión congelado (heredado del modelo padre) + crítico distribucional DIVL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de control basado en estado, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints en precisión de entrenamiento, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch pickle (`.pt`), acompañado de `stats.json` y `release.json` |

Otros datos de identificación: tarea `sim-square-broad`, ronda de modelo R1, brazo `baseline-straddled-auto-success`, celda de campaña `sq_d1_r1_baseline_uniform_nocf_straddled_auto_success`, semillas 1 a 5, paso de entrenamiento 250001. Tamaño del repositorio: 1,4 GB. Pipeline declarado en HuggingFace: `robotics`.

## Arquitectura y entrenamiento

La arquitectura combina un actor de difusión congelado, procedente del modelo `sim-square-broad-r01-baseline-straddled-auto-success-idql`, y un crítico distribucional DIVL que es el componente efectivamente entrenado en esta ronda. El agente opera sobre observaciones de estado (no utiliza visión ni entrada textual), lo que lo sitúa en la familia de políticas de control de bajo nivel para manipulación simulada. El nombre del artefacto de entrenamiento (`iql_ddpg_bc_idql_divl_square_d1_...`) indica que el pipeline de investigación combina componentes de IQL, DDPG+BC, IDQL y DIVL, aunque la model card no detalla la composición exacta de la pérdida ni los hiperparámetros.

En cuanto a los datos, el modelo se entrenó sobre tres conjuntos publicados por el mismo equipo: `sim-square-broad-c00-teleop-baseline` (demostraciones de teleoperación), `sim-square-broad-c01-baseline-policy-rollouts` (rollouts de la política base) y `sim-square-broad-c01-dagger-baseline` (datos de minería DAgger). La model card no especifica el número de transiciones, la composición proporcional del dataset ni si se aplicaron fases de RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no de este tipo de agente). La proveniencia está documentada: los ficheros son copias byte a byte de artefactos de W&B, con verificación MD5 contra el manifiesto del artefacto y SHA-256 registrado en `release.json`.

## Capacidades

- Control robótico basado en estado para la tarea simulada `sim-square-broad` (inserción/ensamblaje en entorno cuadrado con distribución amplia de estados iniciales).
- Generación de acciones mediante un actor de difusión congelado, con estimación de valor asociada por un crítico distribucional DIVL.
- Ejecución de políticas deterministas por semilla: se publican cinco checkpoints independientes (seeds 1 a 5) para evaluar varianza entre semillas.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente multi-paso en el sentido de los modelos de lenguaje (razonamiento con herramientas, planificación textual).
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento explícito.
- Capacidad destacada: reproducibilidad y trazabilidad completas, con artefactos de W&B, commits de git y hashes documentados.

## Casos de uso

- Línea base reproducible para investigación en RL offline: el modelo sirve como referencia fija (paso 250001, cinco semillas) contra la que comparar variantes de crítico o de actor en la tarea `sim-square-broad`.
- Evaluación comparativa de algoritmos: al compartir actor congelado con la variante IDQL, permite aislar el efecto del crítico DIVL distribucional respecto a otros críticos, un escenario habitual en estudios de ablación.
- Inicialización de políticas para fine-tuning: al ser un agente ya entrenado sobre datos de teleoperación y DAgger, puede emplearse como punto de partida en campañas posteriores de la misma familia de tareas.
- Generación de datos sintéticos para minería DAgger: la política puede desplegarse en el simulador para producir rollouts que alimenten nuevas rondas de entrenamiento, replicando el esquema de los datasets `c01-baseline-policy-rollouts`.
- Validación de pipelines de simulación: útil para verificar que un entorno simulado, un controlador o un harness de evaluación reproduce los resultados publicados (tasas de éxito en torno al 61-63 % sobre la rejilla de estados iniciales retenida).
- Auditoría de reproducibilidad y provenance: el repositorio es un caso de uso para probar flujos de verificación de integridad de artefactos (MD5/SHA-256) en la distribución de checkpoints de investigación.
- Estudio de robustez ante distribución amplia de estados iniciales: la variante "broad" y el brazo "straddled" permiten analizar el comportamiento del agente en condiciones de arranque heterogéneas.
- Docencia y divulgación en robótica: ejemplo completo y ligero (1,4 GB) de un pipeline de RL offline con datos de teleoperación, rollouts y DAgger, apto para cursos prácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente proporciona resultados de evaluación propia sobre una rejilla de estados iniciales retenida, con los recuentos de éxito que se reproducen a continuación.

| Dataset de evaluación | Semilla | N | Éxitos | Tasa de éxito |
|---|---|---|---|---|
| sim-square-broad-r00-r03-eval | seed-1 | 32 | 18667/30000 | 62,22 % |
| sim-square-broad-r00-r03-eval | seed-2 | 32 | 18358/30000 | 61,19 % |
| sim-square-broad-r00-r03-eval | seed-3 | 32 | 18607/30000 | 62,02 % |
| sim-square-broad-r00-r03-eval | seed-4 | 32 | 18212/30000 | 60,71 % |
| sim-square-broad-r00-r03-eval | seed-5 | 32 | 18857/30000 | 62,86 % |
| Agregado (5 semillas) | — | 160 | 92701/150000 | 61,80 % |

Advertencia: la model card no explica la relación entre la columna `N` (32) y el denominador de 30000 de la columna de éxitos, por lo que la interpretación exacta de ambas cifras queda sin aclarar. Las tasas porcentuales y el agregado son cálculos derivados de los recuentos publicados, no cifras presentes en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica el número de parámetros, el tamaño del actor ni el del crítico, por lo que no es posible estimar requisitos de memoria con rigor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Como referencia indirecta, los cinco checkpoints ocupan 1,4 GB en total (aproximadamente 280 MB por semilla), lo que sugiere que los ficheros son pequeños, pero esto no equivale a una cifra de VRAM en ejecución.
- Opciones de despliegue: no disponible en la información proporcionada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso son herramientas para modelos de lenguaje y no aplican a este agente. El uso previsto es la carga de los ficheros `.pt` con el código de investigación de Mulligan en los commits indicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con la variante hermana de la misma campaña, de la que este modelo hereda el actor congelado. No se dispone de datos de rendimiento de esa variante, por lo que la comparación es estructural.

| Modelo | Relación | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-broad-r01-baseline-straddled-auto-success-divl | Crítico DIVL distribucional sobre actor congelado (este modelo) | no disponible | no aplica | 61,80 % de éxito agregado (5 semillas, rejilla retenida) | Apache 2.0 | HuggingFace, 5 checkpoints (seeds 1-5) |
| sim-square-broad-r01-baseline-straddled-auto-success-idql | Modelo padre del actor congelado; alternativa IDQL de la misma tarea | no disponible | no aplica | no disponible | no disponible | HuggingFace |
| Otras variantes de la tarea `sim-square-broad` | no disponible | no disponible | no aplica | no disponible | no disponible | organización `mulligan` en HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no documenta análisis de sesgo, y en un agente de control simulado el riesgo relevante es el sobreajuste a la distribución de estados del simulador, no un sesgo lingüístico o social.
- Riesgo de alucinación: no aplica en el sentido habitual; al no ser un modelo generativo de lenguaje, el fallo característico es la ejecución de acciones subóptimas o inestables, con una tasa de éxito observada del 61,80 % agregado, es decir, en torno a un 38 % de episodios fallidos en la rejilla de evaluación publicada.
- Limitaciones de contexto o idioma: el modelo es de ámbito estrictamente estado-acción; no procesa texto ni imágenes y no tiene capacidades multilingües.
- Generalización: los resultados proceden de una rejilla de estados iniciales retenida de la misma tarea simulada. No hay evidencia publicada de transferencia a otras tareas, a otros simuladores ni al mundo real.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se acompaña de garantías de idoneidad; el código de investigación con el que se entrenó y evaluó no se distribuye dentro de este repositorio.
- Seguridad en la carga: los ficheros `.pt` son pickles de PyTorch y la propia model card advierte de que deben cargarse únicamente en entornos de confianza. No deben deserializarse desde fuentes no verificadas.
- Reproducibilidad condicionada: los checkpoints se entrenaron y evaluaron con código de investigación en commits concretos (`551416bff972`); reproducir los números exige disponer de ese código y de los artefactos de W&B referenciados.
- Adopción nula hasta la fecha: 0 descargas y 0 likes, sin validación externa independiente.
- Los resultados de búsqueda web realizados no contienen información relacionada con este modelo: devuelven exclusivamente páginas de resultados de carreras de caballos y galgos (Racing Post), por lo que no aportan contexto técnico aprovechable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-baseline-straddled-auto-success-divl
- Modelo padre del actor congelado (variante IDQL): https://huggingface.co/mulligan/sim-square-broad-r01-baseline-straddled-auto-success-idql
- Dataset de teleoperación base: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts de la política base: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-baseline-policy-rollouts
- Dataset de minería DAgger: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-baseline
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
