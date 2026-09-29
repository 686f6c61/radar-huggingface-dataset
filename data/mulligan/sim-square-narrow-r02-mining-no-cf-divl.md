# mulligan/sim-square-narrow-r02-mining-no-cf-divl

## Resumen

`sim-square-narrow-r02-mining-no-cf-divl` es un checkpoint de un agente de aprendizaje por refuerzo (RL) para control robótico, publicado por la organización `mulligan` dentro de su campaña de investigación sobre la tarea de simulación `sim-square-narrow`. No es un modelo de lenguaje: se trata de un agente basado en estado que combina un actor de difusión congelado, heredado del modelo padre `sim-square-narrow-r02-mining-no-cf-idql`, con un crítico distribucional denominado DIVL. El repositorio contiene cinco checkpoints independientes (semillas 1 a 5) más ficheros de estadísticas (`policy.pt` y `stats.json` por semilla).

El modelo corresponde a la ronda R2 de la campaña, en el brazo `mining-no-cf`, con celda de campaña `sq_d0_r2_ours_mining_shape_beta05_nocf_human_only` y un total de 150.001 pasos de entrenamiento. El repositorio ocupa 1,4 GB en total, aproximadamente 0,28 GB por semilla, lo que sitúa estos agentes en un rango de tamaño muy alejado del de los modelos generativos: son redes de política y crítica de dimensión reducida, pensadas para ejecutarse a alta frecuencia en bucles de control.

Su relevancia es metodológica más que de producto: forma parte de una familia de agentes de RL offline con recogida iterativa de datos estilo DAgger, evaluados de forma sistemática sobre una rejilla de estados iniciales retenidos. Las evaluaciones publicadas muestran tasas de éxito entre el 93,06 % y el 95,80 % según la semilla, lo que lo convierte en una referencia útil para comparar variantes de algoritmo y de composición de datos dentro de la misma tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Agente de RL basado en estado: actor de difusión congelado (heredado del modelo padre IDQL) y crítico distribucional DIVL |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa secuencias de texto; el agente consume observaciones de estado) |
| Tipos de cuantización | no disponible (no se publican variantes cuantizadas; los pesos se distribuyen en el formato original) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`) más `stats.json`; metadatos en `release.json` |
| Tarea | `sim-square-narrow` |
| Ronda del modelo | R2 |
| Brazo de campaña | `mining-no-cf` |
| Celda de campaña | `sq_d0_r2_ours_mining_shape_beta05_nocf_human_only` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150.001 |
| Commit de código | `3053203fc3df` |
| Tamaño del repositorio | 1,4 GB (~0,28 GB por semilla) |
| Modelo padre (actor congelado) | `mulligan/sim-square-narrow-r02-mining-no-cf-idql` |

## Arquitectura y entrenamiento

El agente es un híbrido actor-crítico para RL offline. El actor es una política de difusión congelada que se hereda del modelo `sim-square-narrow-r02-mining-no-cf-idql`; al estar congelado, el entrenamiento de esta ronda se concentra en un crítico distribucional DIVL. Los nombres de los artefactos de Weights & Biases (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) indican que la familia de algoritmos empleada combina IQL, DDPG+BC, IDQL y DIVL. La topología exacta de las redes, el número de parámetros y la dimensión del espacio de observación y de acción no están documentados en la model card, por lo que no es posible detallarlos.

Los datos de entrenamiento proceden de cinco conjuntos publicados por el mismo autor: `sim-square-narrow-c00-teleop-sobol` (teleoperación), `sim-square-narrow-c01-dagger-mining-no-cf` y `sim-square-narrow-c01-sobol-policy-rollouts` (primera iteración de DAgger y rollouts de política), y `sim-square-narrow-c02-dagger-mining-no-cf` y `sim-square-narrow-c02-mulligan-policy-rollouts` (segunda iteración). No se especifica el número de transiciones, la composición exacta del dataset ni si hubo fases de RLHF o DPO (no aplicables en este dominio). El identificador de la celda de campaña sugiere, como inferencia a partir del nombre y no como dato confirmado, el uso de demostraciones humanas únicamente (`human_only`), sin datos contrafactuales (`nocf`) y con un parámetro `beta` de 0,05. El nombre del run de W&B incluye `nutassemblysquare`, lo que apunta a que la tarea deriva del entorno de ensamblaje de tuerca y cuadrado de robosuite, aunque la model card no lo confirma.

## Capacidades

- Control de política para la tarea de simulación `sim-square-narrow`, con observaciones basadas en estado (no en imagen).
- Cinco políticas independientes: una por semilla, lo que permite medir varianza entre inicializaciones.
- Política de difusión apta para muestreo multimodal de acciones, con el crítico DIVL añadido para estimación distribucional de valor.
- Inferencia puramente local: los ficheros `policy.pt` y `stats.json` bastan para ejecutar el agente, sin dependencia de servicios externos.
- No soporta generación de texto ni conversación.
- No soporta tool calling ni function calling.
- No soporta orquestación de agentes ni razonamiento multi-paso de tipo lenguaje.
- No tiene capacidades de visión, audio ni procesamiento multilingüe.
- No se documentan modos especiales (por ejemplo, modos de razonamiento o pensamiento extendido), ya que no aplican a este tipo de modelo.

## Casos de uso

- Evaluación comparativa de algoritmos de RL offline: el checkpoint sirve como punto de referencia fijo para medir el efecto de cambios en el crítico (DIVL frente a alternativas) manteniendo el mismo actor congelado.
- Investigación en composición de datos de entrenamiento: al estar asociado a datasets concretos de teleoperación, DAgger y rollouts de política, permite aislar qué mezcla de datos produce mejores tasas de éxito en la tarea.
- Generación de datos para la siguiente ronda de DAgger: las políticas pueden ejecutarse en el simulador para producir rollouts que alimenten iteraciones posteriores de la campaña, como sugiere la existencia de los conjuntos `c01` y `c02` de *policy rollouts*.
- Validación previa al traslado a hardware real: un controlador con más del 93 % de éxito en la rejilla de estados iniciales retenidos es un candidato razonable para pruebas en banco antes de invertir en experimentos con un brazo físico.
- Estudio de robustez entre semillas: disponer de cinco semillas permite cuantificar la dispersión de resultados y detectar si una mejora de algoritmo es estable o depende de la inicialización.
- Línea base en entornos de ensamblaje de precisión: la variante `narrow` de la tarea es útil para estudiar el efecto de tolerancias reducidas en políticas entrenadas con demostraciones humanas.
- Docencia y reproducción de experimentos: el repositorio incluye referencias a artefactos de W&B, *runs* y commits concretos, lo que facilita reproducir o auditar el resultado.

## Benchmarks y rendimiento

Los únicos resultados publicados son las evaluaciones sobre una rejilla de estados iniciales retenidos, ejecutadas con el conjunto `sim-square-narrow-r00-r03-eval`. Cada semilla se evalúa sobre 32 estados iniciales con 8.000 rollouts en total.

| Semilla | Estados iniciales (N) | Rollouts | Éxitos | Tasa de éxito |
|---|---|---|---|---|
| seed-1 | 32 | 8000 | 7664/8000 | 95,80 % |
| seed-2 | 32 | 8000 | 7445/8000 | 93,06 % |
| seed-3 | 32 | 8000 | 7541/8000 | 94,26 % |
| seed-4 | 32 | 8000 | 7557/8000 | 94,46 % |
| seed-5 | 32 | 8000 | 7577/8000 | 94,71 % |
| Media | 32 | 8000 | 7576,8/8000 | 94,46 % |

No se han publicado resultados de benchmarks adicionales en la información disponible. No hay datos de comparación con modelos externos a la campaña Mulligan.

## Requisitos de hardware

- Tamaño de pesos: aproximadamente 0,28 GB por semilla según el tamaño del repositorio (1,4 GB para cinco semillas). Se trata de una estimación derivada del tamaño del repositorio, no de un dato confirmado por el autor.
- VRAM estimada para inferencia: por debajo de 1 GB para los pesos de una semilla; con activaciones y lotes pequeños, previsiblemente unos pocos gigabytes como máximo (estimación no confirmada).
- GPU recomendadas: no disponibles. Dado el tamaño reducido, cualquier GPU con soporte CUDA (por ejemplo, una RTX 3060 o superior) debería ser suficiente; para entrenamiento o evaluación masiva en paralelo son preferibles A100 o H100, pero el autor no especifica requisitos.
- Compatibilidad con GPU de consumo: sí, con alta probabilidad, dado el tamaño del checkpoint; no hay confirmación explícita en la model card.
- Ejecución en CPU: viable para inferencia por lotes, ya que no se requiere memoria de vídeo significativa; no hay cifras publicadas.
- Opciones de despliegue: no aplican vLLM, Ollama, llama.cpp ni TGI, al no ser un modelo de lenguaje. El despliegue se realiza con PyTorch y el código de investigación de Mulligan en el commit `3053203fc3df`.
- Latencia y throughput: no disponibles. Cabe esperar un coste por acción superior al de una política MLP pura, porque el actor de difusión requiere varios pasos de *denoising*, pero no se publican mediciones.
- Nota de seguridad: los ficheros `.pt` son *pickles* de PyTorch; deben cargarse únicamente en un entorno de confianza.

## Comparativa con modelos similares

| Modelo | Tipo de agente | Parámetros | Contexto | Tasa de éxito en `sim-square-narrow` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sim-square-narrow-r02-mining-no-cf-divl` (este) | Actor de difusión congelado + crítico DIVL distribucional | no disponible | no aplica | 93,06 % - 95,80 % por semilla (media 94,46 %) | MIT | HuggingFace |
| `sim-square-narrow-r02-mining-no-cf-idql` (padre) | Actor de difusión entrenado con IDQL | no disponible | no aplica | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |
| Otras variantes de la campaña Mulligan | no disponible | no disponible | no aplica | no disponible | no disponible | HuggingFace (organización `mulligan`) |

No se han identificado en la información disponible alternativas públicas comparables fuera de la propia campaña Mulligan, por lo que no es posible establecer una comparación con modelos de otros autores para esta tarea.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no admite *prompting*.
- Especialización estrecha: la política está entrenada para una única tarea (`sim-square-narrow`) y no se documenta capacidad de generalización a otras tareas, objetos o entornos.
- Riesgo de sobreajuste al simulador: no hay evidencia publicada de transferencia a un robot físico, y las diferencias de dinámica entre simulación y realidad pueden degradar el rendimiento.
- Varianza entre semillas: el rango observado va del 93,06 % al 95,80 %, una diferencia de casi tres puntos porcentuales que conviene tener en cuenta al seleccionar un checkpoint.
- Evaluación limitada: la rejilla de evaluación usa 32 estados iniciales retenidos; los resultados dependen del procedimiento de muestreo de dicha rejilla, que no se detalla.
- Sesgos: no se documentan sesgos de comportamiento ni análisis de fallos; los datos de entrenamiento incluyen demostraciones humanas de teleoperación, cuyo sesgo específico no se cuantifica.
- Riesgo de seguridad en la carga: los ficheros `.pt` son *pickles* de PyTorch y pueden ejecutar código arbitrario al deserializarse; el propio autor recomienda cargarlos solo en entornos de confianza.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución, pero sin garantía alguna; los datasets asociados pueden tener condiciones propias que no se detallan aquí.
- Adopción comunitaria nula: el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que no existe validación externa independiente.
- Idiomas soportados: no disponible, y en la práctica no aplica.
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con este modelo (abordan agentes de IA de propósito general y minería de criptomonedas). El término `mining` en el nombre del modelo se refiere a la minería de demostraciones en el contexto de DAgger, no a criptomonedas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r02-mining-no-cf-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-narrow-r02-mining-no-cf-idql
- Dataset `sim-square-narrow-c00-teleop-sobol`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset `sim-square-narrow-c01-dagger-mining-no-cf`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mining-no-cf
- Dataset `sim-square-narrow-c01-sobol-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset `sim-square-narrow-c02-dagger-mining-no-cf`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mining-no-cf
- Dataset `sim-square-narrow-c02-mulligan-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- Dataset de evaluación `sim-square-narrow-r00-r03-eval`: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Página del proyecto: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Fichero de procedencia y hashes: `release.json` dentro del repositorio del modelo
- La búsqueda web no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre agentes de IA generales y minería de criptomonedas, sin relación con este checkpoint.
