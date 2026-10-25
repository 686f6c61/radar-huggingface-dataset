# fall2026-cs8803-drl/hw4-f26-traces

## Resumen

`fall2026-cs8803-drl/hw4-f26-traces` no es un modelo de lenguaje ni un modelo entrenado listo para inferencia: es un conjunto de trazas de diagnóstico publicadas como referencia para la Sección 1 del HW4 del curso CS 8803 Deep Reinforcement Learning (Fall 2026). Contiene exclusivamente registros y métricas de ejecuciones de PPO sobre el entorno `Hopper-v5` de gymnasium, generadas con el harness del propio homework bajo distintas configuraciones de hiperparámetros. No incluye código ni políticas entrenadas.

El artefacto reúne siete configuraciones (`base`, `epochs4`, `epochs50`, `clip01`, `clip03`, `lr3e-3`, `no_trunc`), cada una de 1.000.000 de pasos, con semillas 0, 1 y 2 en los casos `base` y `no_trunc` y una única semilla en el resto. El objetivo declarado es mostrar cómo se ven diagnósticos de PPO sanos frente a insanos: KL aproximada, fracción de clipping, ratio medio, varianza explicada y retorno reciente por actualización, además del retorno de evaluación del checkpoint final.

Su relevancia es doble: por un lado sirve como material docente para interpretar curvas de entrenamiento en RL profundo; por otro, constituye un caso reproducible de malas prácticas habituales (exceso de épocas por actualización, learning rate demasiado alto, clipping mal calibrado, tratamiento incorrecto de truncamientos por límite de tiempo). Debe consumirse con `pandas` o herramientas equivalentes, no con runtimes de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO (policy gradient on-policy con actor-crítico) sobre gymnasium `Hopper-v5`; topología de las redes (capas, unidades, activaciones) no disponible |
| Parametros totales | no disponible (el repositorio no contiene pesos de ningún modelo) |
| Parametros activos | no aplica (no es un modelo Mixture-of-Experts) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | no disponibles (los ficheros son CSV con cabeceras en inglés) |
| Licencia | MIT |
| Formato de pesos | no hay pesos; los datos se distribuyen en CSV (`traces.csv`, `summary.csv`) |

Metadatos adicionales del repositorio: pipeline declarado `reinforcement-learning`, 0 descargas, 0 likes, creado el 2026-10-25 y actualizado el mismo día. Etiquetas: `cs8803-drl`, `hw4`, `course-reference`, `reinforcement-learning`, `ppo`, `diagnostics`.

## Arquitectura y entrenamiento

El material no describe una arquitectura de modelo, sino la configuración del algoritmo que generó las trazas. Se trata de PPO para control continuo, ejecutado con el harness del HW4 sobre `Hopper-v5`. La configuración por defecto (`base`) usa 10 épocas de optimización por actualización, clipping de 0,2, learning rate 3e-4 y *truncation bootstrap* activado. Las variantes modifican un único elemento cada una: 4 épocas (`epochs4`), 50 épocas (`epochs50`), clipping 0,1 (`clip01`), clipping 0,3 (`clip03`), learning rate 3e-3 (`lr3e-3`) y desactivación del bootstrap de truncamiento (`no_trunc`), de modo que un truncamiento por límite de tiempo se trata como terminación.

Cada ejecución cubre 1.000.000 de pasos. No se especifican en la información disponible el número de entornos en paralelo, el tamaño de lote, el número de pasos por rollout, la arquitectura de las redes, el optimizador ni el presupuesto de evaluación, por lo que la reproducibilidad exacta requiere el harness del curso (`hw4_lib.references.reference_dir("traces")`), que no forma parte del repositorio. La innovación técnica del artefacto es metodológica: aísla el efecto de un hiperparámetro por ejecución y conserva métricas por actualización, lo que permite diagnosticar modos de fallo típicos de PPO con datos en lugar de con intuiciones.

## Capacidades

- Registro por actualización de PPO con las columnas `run`, `seed`, ajustes, `global_step`, `approx_kl`, `clip_frac`, `ratio_mean`, `explained_var` y `recent_return` (media de los últimos 10 episodios de entrenamiento).
- Resumen por ejecución y semilla con el retorno de evaluación final y la media de `approx_kl` y `clip_frac` en todas las actualizaciones y en el último 25 %.
- Comparación controlada de hiperparámetros: épocas por actualización, coeficiente de clipping, learning rate y bootstrap de truncamiento.
- Diagnóstico de salud del entrenamiento: valores de `approx_kl` muy por encima del rango habitual indican pasos demasiado grandes; `clip_frac` alto indica que la política se mueve fuera de la región de confianza.
- Cuantificación de la varianza entre semillas en `base` y `no_trunc` (tres semillas cada una).
- Detección empírica del sesgo por tratamiento de truncamientos: comparación directa entre `base` y `no_trunc`.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, capacidades de agente, visión, audio ni multilingüismo: no es un modelo generativo.

## Casos de uso

- Depuración de una implementación propia de PPO: comparar la curva de `approx_kl` y `clip_frac` del código propio contra `traces.csv` para decidir si una KL de 0,3 es un fallo de implementación o un síntoma de learning rate excesivo (como en `lr3e-3`).
- Docencia en cursos de RL profundo: usar `epochs50` y `lr3e-3` como ejemplos canónicos de entrenamiento insano (KL de 0,611 y 0,332; retornos de 683 y 1201) frente a `base` (KL ~0,0093; retornos 3198-3606).
- Calibración de umbrales de early stopping o de alerta en pipelines de entrenamiento: los valores de `clip_frac` por actualización permiten fijar disparadores basados en datos en lugar de heurísticas.
- Validación de sistemas de logging y visualización (TensorBoard, W&B, dashboards propios): el CSV tiene un esquema explícito y valores conocidos contra los que verificar agregaciones y suavizados.
- Estudio del sesgo de truncamiento en entornos con límite de tiempo: `base` y `no_trunc` comparten ajustes salvo el bootstrap, lo que permite aislar su efecto (retornos de 3282/3606/3198 frente a 1612/3204/3625).
- Análisis de sensibilidad de hiperparámetros con presupuesto fijo: las siete configuraciones a 1.000.000 de pasos sirven para practicar metodología de ablación de un factor.
- Material de apoyo para revisión de resultados: contrastar si una mejora reportada cae dentro de la variabilidad entre semillas observada en `base` (rango 3198-3606 con la misma configuración).

## Benchmarks y rendimiento

Resultados publicados en la model card (medias de toda la ejecución y evaluación del checkpoint final, 1.000.000 de pasos por ejecución):

| Ejecución | Semilla | `approx_kl` | `clip_frac` | Retorno de evaluación |
|---|---|---|---|---|
| base | 0/1/2 | 0,0095/0,0092/0,0092 | 0,128/0,122/0,124 | 3282/3606/3198 |
| epochs4 | 0 | 0,0052 | 0,063 | 1696 |
| epochs50 | 0 | 0,611 | 0,673 | 683 |
| clip01 | 0 | 0,0027 | 0,146 | 2432 |
| clip03 | 0 | 0,0194 | 0,113 | 2094 |
| lr3e-3 | 0 | 0,332 | 0,650 | 1201 |
| no_trunc | 0/1/2 | 0,0095/0,0083/0,0080 | 0,129/0,111/0,107 | 1612/3204/3625 |

Salvo `base` y `no_trunc`, cada fila corresponde a una sola semilla. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque el artefacto no es un modelo de lenguaje. Tampoco se aportan métricas de tiempo de entrenamiento, throughput ni coste computacional.

## Requisitos de hardware

- Inferencia: no aplica. No hay pesos ni pipeline de generación; el consumo es lectura de dos ficheros CSV (descarga y procesamiento triviales en cualquier máquina).
- VRAM estimada: no disponible / no aplica, al no existir modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica para el consumo del artefacto.
- Cabe en GPU de consumo: sí, en el sentido trivial de que no requiere GPU; el análisis se ejecuta en CPU con `pandas`.
- Reproducción de las ejecuciones: requiere el harness del HW4 y MuJoCo/`gymnasium` con `Hopper-v5`, no incluidos en el repositorio. No se han publicado datos de tiempo por ejecución ni de hardware empleado, por lo que no es posible estimar latencia ni throughput.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes). Herramientas adecuadas: `pandas`, `polars`, `matplotlib`/`seaborn` para las curvas.

## Comparativa con modelos similares

No existen modelos comparables en el sentido habitual; se comparan artefactos de la misma categoría (material de referencia y reproducción para RL profundo). Los datos de las alternativas no provienen de la información proporcionada y se marcan como no disponibles cuando no se pueden verificar.

| Artefacto | Tipo | Contenido | Configuraciones / semillas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fall2026-cs8803-drl/hw4-f26-traces` | Trazas de diagnóstico | CSV de métricas PPO sobre `Hopper-v5`, sin código ni políticas | 7 configuraciones; 3 semillas en 2 de ellas | MIT | HuggingFace |
| Stable-Baselines3 RL Zoo | Colección de políticas entrenadas e hiperparámetros | Políticas y ajustes, no trazas por actualización | no disponible | MIT (según proyecto) | Repositorio del proyecto |
| CleanRL | Implementaciones de referencia con logs | Código de algoritmos con registro de entrenamiento | no disponible | MIT (según proyecto) | Repositorio del proyecto |
| Harness `hw4_lib` del curso | Código del homework | Genera estas trazas; no publicado en el repositorio | no disponible | no disponible | No disponible públicamente |

La diferencia clave frente a las alternativas es el alcance: este repositorio no permite entrenar ni inferir, solo analizar diagnósticos ya calculados.

## Limitaciones y advertencias

- No es un modelo: no se puede cargar con `transformers`, `vLLM` ni similares, y no produce ninguna salida generativa.
- No incluye código ni políticas; sin el harness del curso no es posible reproducir las ejecuciones ni reanudar entrenamientos.
- Cobertura limitada a un único entorno (`Hopper-v5`) y un único algoritmo (PPO); las conclusiones sobre qué diagnósticos son sanos no se generalizan necesariamente a otros entornos, espacios de observación o algoritmos off-policy.
- Cinco de las siete configuraciones tienen una sola semilla, por lo que las diferencias frente a `base` no pueden separarse de la variabilidad entre semillas, que en `base` y `no_trunc` es grande (por ejemplo, 1612 frente a 3625 en `no_trunc`).
- Las medias de `approx_kl` y `clip_frac` agregadas en toda la ejecución pueden ocultar regímenes transitorios; conviene analizar `traces.csv` por actualización.
- No se documentan versiones de dependencias (gymnasium, MuJoCo, PyTorch), hiperparámetros completos ni criterios de evaluación, lo que dificulta la comparación exacta con resultados propios.
- Riesgo de interpretación errónea: valores como el retorno de evaluación de `base` dependen del checkpoint final y de la política de evaluación, no descritos en detalle.
- Material con fines docentes (HW4, Fall 2026); no está pensado como referencia de rendimiento de PPO ni como baseline publicable.
- Licencia MIT: permite uso, modificación y redistribución con atribución y conservación del aviso de copyright; no se especifican restricciones adicionales, pero tampoco se ofrece garantía alguna.
- No se declaran sesgos en el sentido de modelos de lenguaje; el sesgo relevante es de selección experimental (un entorno, un algoritmo, pocas semillas).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fall2026-cs8803-drl/hw4-f26-traces
- Página del curso CS 8803 DRL (Fall 2025): https://www.pair.toronto.edu/cs8803-drl-f25/
- Syllabus CS 8803 DRL fall 2025: https://syllabus.gatech.edu/sites/default/files/2026-04/CS%208803%20DRL%20fall%202025%20syllabus.pdf
- CS 8803 LLM (primavera 2026), misma numeración de curso: https://cocoxu.github.io/CS8803-LLM-spring2026/
- CS 6390 / CS 8803 Program semantics and LLMs (otoño 2026): https://faculty.cc.gatech.edu/~qzhang414/course/cs6390/index.html
- Syllabus Fall 2026 CS 8803 Z10: https://syllabus.gatech.edu/sites/default/files/2026-08/Fall-2026-Zhang-CS-8803-Z10.pdf
