# mulligan/sim-square-narrow-r02-mulligan-no-cf-divl

## Resumen

El modelo `mulligan/sim-square-narrow-r02-mulligan-no-cf-divl` es un agente de control robótico basado en estado (no en imagen) publicado por el proyecto Mulligan. Se trata de un checkpoint de la ronda R2 para la tarea de simulación `sim-square-narrow`, en la variante `mulligan-no-cf` (sin intervención humana de corrección durante la fase indicada) y con el algoritmo DIVL. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo por imitación con componente de crítica distributional.

Técnicamente, el artefacto combina un actor de difusión congelado, heredado del modelo padre `sim-square-narrow-r02-mulligan-no-cf-idql`, y un crítico DIVL distributional entrenado específicamente para esta ronda. El repositorio incluye cinco carpetas (`seed-1` a `seed-5`), una por semilla de entrenamiento, con los ficheros `policy.pt` y `stats.json`. El paso de entrenamiento registrado es 150001 y el tamaño total del repositorio es de 1,4 GB.

Su relevancia es acotada pero clara para la comunidad de robótica y RL: proporciona una política evaluada de forma sistemática sobre una rejilla de estados iniciales retenidos, con 8000 rollouts por semilla, lo que permite comparar de forma reproducible el efecto del diseño del crítico (DIVL frente a IDQL u otras variantes) manteniendo el actor constante. La licencia MIT facilita su reutilización y auditoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Actor de difusión congelado (heredado del modelo padre IDQL) + crítico distributional DIVL; agente basado en estado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible; los pesos se distribuyen como pickles de PyTorch (`.pt`) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, pickle), más ficheros `stats.json` y `release.json` |
| Tarea | `sim-square-narrow` |
| Ronda / brazo | R2 / `mulligan-no-cf` |
| Celda de campaña | `square_narrow_r2_mulligan_no_cf_human_only` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamaño del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un agente de RL por imitación con dos componentes diferenciados. Por un lado, un actor de difusión que se mantiene congelado y que procede del checkpoint `sim-square-narrow-r02-mulligan-no-cf-idql`; por otro, un crítico DIVL de naturaleza distributional, que es la parte efectivamente entrenada en esta ronda. La model card describe explícitamente esta separación: «State-based agent with the parent's frozen diffusion actor and a distributional DIVL critic». No se publican en la información disponible el número de parámetros, la dimensionalidad del espacio de estados ni la arquitectura interna de la red de difusión.

El entrenamiento se apoya en cinco conjuntos de datos públicos del propio proyecto: teleoperación con SOBOL (`c00-teleop-sobol`), datos DAgger (`c01-dagger-mulligan-no-cf` y `c02-dagger-mulligan-no-cf`) y rollouts de políticas previas (`c01-sobol-policy-rollouts` y `c02-mulligan-policy-rollouts`). La combinación de teleoperación, DAgger y rollouts propios es el patrón habitual para reducir el desajuste de distribución entre estados visitados por la política y estados del dataset. No se documenta en la información disponible si hubo fases adicionales de RL puro, ni el número total de transiciones empleadas.

El proyecto publica configuraciones de ejecución por semilla en el repositorio de código de Mulligan (`release/run-configs/sim-square-narrow-r02-mulligan-no-cf-divl__seed-N.json`), lo que permite, según la propia model card, reentrenar cada checkpoint. La integridad de los ficheros se verifica mediante hashes SHA-256 registrados en `release.json`.

## Capacidades

- Control robótico basado en estado para la tarea de inserción/ajuste `sim-square-narrow` en simulación.
- Generación de acciones mediante política de difusión, con muestreo multimodal de trayectorias de acción.
- Estimación de valor con un crítico distributional (DIVL), que modela la distribución del retorno en lugar de solo su media.
- Reproducibilidad por semilla: cinco checkpoints independientes entrenados con semillas 1 a 5.
- Evaluación sobre rejilla de estados iniciales retenidos, con 8000 rollouts por semilla.
- No dispone de tool calling, function calling, capacidades de agente conversacional, multilingüismo ni modalidad de visión (el agente es state-based).

## Casos de uso

- Investigación en aprendizaje por imitación para robótica: sirve como punto de comparación controlado para medir el efecto de cambiar el crítico (DIVL frente a IDQL u otras formulaciones) manteniendo el actor fijo.
- Generación de datos de rollout para DAgger: las políticas de las cinco semillas pueden desplegarse en el simulador para recolectar estados novedosos y etiquetarlos con el experto, alimentando nuevas rondas de `cXX-dagger-mulligan-no-cf`.
- Evaluación comparativa en Policy Arena: al estar integrado en el ecosistema de evaluación del proyecto, permite situar la variante sin corrección humana frente a otras variantes de la misma tarea.
- Estudio de robustez frente a condiciones iniciales: la rejilla de evaluación retenida y las 8000 repeticiones por semilla permiten analizar la varianza entre semillas (del 93,06 % al 95,80 % de éxito) en lugar de depender de un único valor agregado.
- Destilación o compresión de políticas: el actor de difusión congelado es un candidato razonable para destilar a una política de inferencia más rápida para despliegue en hardware con recursos limitados, aunque no se publican datos de latencia.
- Línea base para transferencia sim-a-real: la tarea `sim-square-narrow` es representativa de problemas de inserción con tolerancias estrechas, por lo que la política puede usarse como punto de partida en estudios de domain randomisation y ajuste fino sobre hardware real.
- Reproducción de experimentos: dado que se publican los ficheros `policy.pt`, los `stats.json` y las configuraciones de ejecución por semilla, un tercero puede reentrenar o verificar los resultados sin acceso a infraestructura propietaria.

## Benchmarks y rendimiento

Los únicos datos de evaluación publicados corresponden a la rejilla de estados iniciales retenidos del conjunto `sim-square-narrow-r00-r03-eval`. Cada fila corresponde a 8000 rollouts (32 estados iniciales por rollout, según la columna `N`).

| Semilla | Dataset de evaluación | N | Éxitos | Tasa de éxito |
|---|---|---|---|---|
| seed-1 | sim-square-narrow-r00-r03-eval | 32 | 7664/8000 | 95,80 % |
| seed-2 | sim-square-narrow-r00-r03-eval | 32 | 7445/8000 | 93,06 % |
| seed-3 | sim-square-narrow-r00-r03-eval | 32 | 7541/8000 | 94,26 % |
| seed-4 | sim-square-narrow-r00-r03-eval | 32 | 7557/8000 | 94,46 % |
| seed-5 | sim-square-narrow-r00-r03-eval | 32 | 7577/8000 | 94,71 % |
| Media (calculada) | sim-square-narrow-r00-r03-eval | 32 | 37784/40000 | 94,46 % |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, algo esperable dado que no se trata de un modelo de lenguaje. No se dispone tampoco de comparaciones numéricas directas frente a las otras variantes del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican requisitos de GPU ni tamaño en parámetros. Como referencia indirecta, el repositorio completo (cinco semillas) ocupa 1,4 GB, es decir, aproximadamente 280 MB por semilla incluyendo `policy.pt`, `stats.json` y metadatos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la documentación. Dado que el agente consume observaciones de estado (no píxeles) y que el tamaño por semilla es de centenas de megabytes, es plausible que quepa en GPU de consumo, pero se trata de una estimación no verificada y no de un dato publicado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (ninguna de ellas aplica a este tipo de modelo). El consumo previsto es mediante PyTorch, cargando los ficheros `.pt`, con las configuraciones de ejecución del repositorio de código de Mulligan.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia ni frecuencia de control.

## Comparativa con modelos similares

No se dispone de datos numéricos de los modelos comparables en la información proporcionada; solo se conocen sus identificadores dentro del mismo proyecto. La comparación se limita por tanto a la naturaleza del artefacto, no al rendimiento.

| Modelo | Relación | Tarea | Método | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| `mulligan/sim-square-narrow-r02-mulligan-no-cf-idql` | Modelo padre (actor congelado) | sim-square-narrow | IDQL | no disponible en la información | no disponibles |
| `mulligan/sim-square-narrow-r02-auto-iql-n32-idql` | Variante del mismo proyecto | sim-square-narrow | IQL/IDQL, n=32 | no disponible en la información | no disponibles |
| `mulligan/sim-square-narrow-r02-auto-plain-il-n1-idql` | Variante del mismo proyecto | sim-square-narrow | imitation learning simple, n=1 | no disponible en la información | no disponibles |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. En tareas de imitación a partir de teleoperación, el sesgo del operador humano y la cobertura limitada del espacio de estados son riesgos estructurales habituales, pero no se cuantifican en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la producción de acciones fuera de distribución cuando el agente se aleja de los estados vistos en entrenamiento.
- Limitaciones de contexto e idioma: no aplica. El modelo no procesa lenguaje ni tiene ventana de contexto.
- Generalización: los resultados (93,06 %–95,80 % de éxito) corresponden a una rejilla de estados iniciales retenidos de la propia tarea y simulador. No hay evidencia publicada de transferencia a otros entornos ni a hardware real.
- Licencia: MIT, permisiva para uso comercial, con la obligación habitual de conservar el aviso de copyright y la licencia.
- Seguridad al cargar: la model card advierte explícitamente de que los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en un entorno de confianza. Cargar un pickle no verificado implica ejecución de código arbitrario.
- Trazabilidad: la integridad de los ficheros depende de los hashes SHA-256 de `release.json`; conviene verificarlos antes de desplegar.
- Adopción: el repositorio registra 0 descargas y 0 likes, por lo que no existe validación externa independiente de los resultados publicados.
- Reproducibilidad parcial: las recetas de entrenamiento residen en el repositorio de código de Mulligan, no en el repositorio de HuggingFace, lo que añade una dependencia externa para reentrenar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r02-mulligan-no-cf-divl
- Modelo padre (actor congelado, IDQL): https://huggingface.co/mulligan/sim-square-narrow-r02-mulligan-no-cf-idql
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Portal del proyecto: https://mulligan.page
- Arena de evaluaciones: https://arena.mulligan.page
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mulligan-no-cf
- Dataset de rollouts SOBOL c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mulligan-no-cf
- Dataset de rollouts Mulligan c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- Variante comparable `auto-iql-n32-idql`: https://huggingface.co/mulligan/sim-square-narrow-r02-auto-iql-n32-idql
- Variante comparable `auto-plain-il-n1-idql`: https://huggingface.co/mulligan/sim-square-narrow-r02-auto-plain-il-n1-idql
