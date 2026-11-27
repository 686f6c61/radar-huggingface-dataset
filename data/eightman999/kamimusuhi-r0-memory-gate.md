# eightman999/kamimusuhi-r0-memory-gate

## Resumen

kamimusuhi R0 — Learned Memory Gate (MLP) es un artefacto de investigación publicado por el desarrollador independiente eightman999 dentro del proyecto kamimusuhi, concretamente en la rama `experiments/r0`. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo (RL) que resuelve una tarea sintética de memoria finita, en la que un agente debe decidir qué eventos de un flujo de 128 pasos merecen almacenarse en una memoria FIFO de 4 ranuras y cuáles deben ignorarse. El repositorio publica la variante MLP, la mejor de las tres políticas recreadas, junto con sus pesos en PyTorch y su conversión a Core ML para su ejecución en Apple Silicon y en el Neural Engine (ANE).

El interés del artefacto es metodológico más que de producto: sirve como banco de pruebas reproducible para estudiar políticas de gestión de memoria en agentes, con controles explícitos de ablación (borrado de memoria, barajado del flujo, permutación de contenidos) y evaluación fuera de distribución. La arquitectura es una MLP pequeña (283 entradas, tronco de 256 unidades con dos capas y activación Tanh, tres cabezas de salida) y la política es sin estado: la memoria reside en el entorno y forma parte de la observación.

Es relevante ahora por dos motivos concretos. Primero, la model card documenta con transparencia que los checkpoints originales se perdieron y que los publicados son una recreación entrenada el 27 de noviembre de 2026 en un MacBook Pro con M2 Max, con hashes SHA-256 por semilla y una configuración fijada por commit. Segundo, demuestra el flujo completo de conversión PyTorch a Core ML con paridad numérica verificada, lo que resulta útil para quien necesite desplegar políticas de RL de tamaño reducido en el ANE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP: Linear(283, 256) → Tanh → Linear(256, 256) → Tanh, con tres cabezas (act_logits de 4, ans_logits de 8, value de 1) |
| Parametros totales | no disponible (no se publica el recuento; por las dimensiones declaradas el tronco ronda las 138.000 unidades, sin confirmación del autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; la observación es un vector fijo de 283 dimensiones y el episodio tiene 128 pasos |
| Tipos de cuantizacion | no se publican cuantizaciones; los pesos PyTorch se distribuyen en precisión de entrenamiento y el ML Program almacena en fp16 |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`, diccionario `{"model": state_dict}`) y Core ML (`.mlpackage`, ML Program, target mínimo macOS 14) |

## Arquitectura y entrenamiento

La política es una red neuronal feedforward de tres capas lineales con activación Tanh en el tronco y tres cabezas de salida: `act_logits` con 4 clases (IGNORE, STORE, RECALL, ANSWER), `ans_logits` con 8 clases (índice de valor, consultado solo cuando la acción es ANSWER) y `value`, una estimación de valor de estado usada durante el entrenamiento. La política no mantiene estado recurrente: la memoria de 4 ranuras FIFO vive en el entorno y se inyecta como parte del vector de observación de 283 dimensiones. Esta decisión de diseño hace que el modelo sea trivial de convertir y de ejecutar, pero traslada toda la carga de la memoria al entorno.

El entorno de entrenamiento emite episodios de 128 pasos con eventos ITEM(key, value), NOISE, QUERY y NULL sobre 16 claves y 8 valores. Solo 4 claves son consultables y lo son entre 16 y 64 pasos después de su emisión; las otras 12 actúan como distractores y la etiqueta de clase nunca se observa. Como ANSWER sin un RECALL previo es ciego, la política debe aprender a almacenar los elementos correctos, recuperarlos dentro de la ventana de consulta y responder desde el búfer de recuperación. No se documentan en la información disponible el número de tokens, la composición del dataset ni el uso de RLHF o DPO, que no aplican a este tipo de modelo. La model card sí detalla las ablaciones de validación: el borrado de memoria colapsa la precisión hasta el azar (0,126–0,139 frente a 0,125 de azar), el barajado del flujo produce el mismo efecto, la permutación de contenidos es inocua y la precisión se mantiene en torno a 0,99 en la variante OOD de retardo 128.

## Capacidades

- Selección de acciones discretas en un entorno de RL: IGNORE, STORE, RECALL y ANSWER sobre un espacio de 4 acciones.
- Clasificación de valores: la cabeza `ans_logits` elige entre 8 índices de valor cuando la acción es ANSWER.
- Gestión aprendida de memoria finita: decide qué eventos almacenar en un búfer FIFO de 4 ranuras y cuándo recuperarlos.
- Estimación de valor de estado mediante la cabeza `value`, útil para entrenamiento con actor-crítico.
- Ejecución en Apple Neural Engine mediante Core ML con `compute_units = CPU_AND_NE`.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingües, visión, audio ni modo de pensamiento. No es un modelo de propósito general.

## Casos de uso

- Investigación reproducible en RL: el repositorio incluye código, configuración y hashes por semilla, lo que permite replicar exactamente el experimento de memoria finita y comparar variantes de política (MLP frente a GRU de 128 y 64 unidades) bajo las mismas condiciones.
- Estudio de políticas de memoria en agentes: el banco de pruebas aísla la decisión de qué recordar, con distractores explícitos y ventanas de consulta variables, lo que sirve para evaluar mecanismos de selección de memoria antes de trasladarlos a agentes mayores.
- Validación de pipelines de conversión PyTorch a Core ML: el artefacto incluye `coreml-results.json` con medidas de paridad (diferencia máxima absoluta y coincidencia de argmax) y sirve como caso de referencia para verificar conversiones con coremltools 9.0.
- Pruebas de despliegue en Apple Silicon: al cargar en el ANE con `CPU_AND_NE`, permite validar el flujo de inferencia en macOS 14 o superior en un modelo cuyo coste por predicción es de aproximadamente 0,06 ms.
- Docencia y divulgación: la tarea sintética, con etiquetas no observadas y controles de ablación, es un ejemplo compacto para explicar crédito temporal, memoria externa y evaluación fuera de distribución.
- Referencia para ablaciones de memoria: los resultados de colapso al borrar la memoria o barajar el flujo permiten usar el modelo como control negativo en experimentos que midan el uso efectivo de la memoria en otras arquitecturas.

## Benchmarks y rendimiento

Los datos publicados son de precisión en la tarea sintética R0, no de benchmarks de lenguaje. Se presentan a continuación tal como los reporta la model card (3 semillas, 256 episodios).

| Metrica | Valor |
|---|---|
| Precisión limpia, MLP | 0,999 |
| Precisión limpia, GRU128 | 0,988 |
| Precisión limpia, GRU64 | 0,960 |
| Colapso con borrado de memoria | 0,126–0,139 (azar 0,125) |
| OOD con retardo 128 | ≈0,99 |
| OOD con 2 ranuras | 0,697–0,753 (oráculo 0,760) |

Paridad Core ML frente a PyTorch (512 observaciones reales por semilla, M2 Max):

| Semilla | act max-abs-diff | ans max-abs-diff | act argmax agree | ans argmax agree |
|---|---|---|---|---|
| 0 | 0,0224 | 0,0070 | 100% | 99,8% |
| 1 | 0,0345 | 0,0088 | 100% | 99,8% |
| 2 | 0,0249 | 0,0091 | 100% | 99,2% |

En rollouts greedy de extremo a extremo (32 episodios, semillas de evaluación 900001 en adelante), tanto PyTorch como Core ML alcanzan precisión 1,000 en las tres semillas. La latencia medida es de 0,063 ms de mediana tanto en CPU sola como en CPU+ANE, indistinguibles por dominar el coste de llamada.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es una MLP de tamaño reducido y el repositorio ocupa 0,0 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el artefacto está orientado a Apple Silicon (M2 Max fue la máquina de conversión y medida). Cualquier GPU con PyTorch puede ejecutar los checkpoints.
- Compatibilidad con GPU consumer: sí, sin restricciones prácticas por tamaño.
- Despliegue: Core ML con coremltools 9.0 (ML Program, macOS 14 mínimo) y PyTorch 2.14.0 para los checkpoints originales. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 0,06 ms por predicción (mediana 0,063 ms), dominada por el coste de llamada; no se mide ventaja alguna del ANE a este tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión en R0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kamimusuhi R0 MLP | no disponible (MLP 283→256→256) | no aplica (obs. de 283 dims) | 0,999 | MIT | Hugging Face y GitHub |
| kamimusuhi R0 GRU128 | no disponible | no aplica | 0,988 | MIT | GitHub (mismo proyecto) |
| kamimusuhi R0 GRU64 | no disponible | no aplica | 0,960 | MIT | GitHub (mismo proyecto) |

No se dispone de información sobre modelos comparables de otros autores para esta tarea sintética concreta.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de propósito general: no genera texto, no responde preguntas abiertas y no procesa lenguaje natural.
- Los checkpoints originales se perdieron; los publicados son una recreación del 27 de noviembre de 2026. Aunque la model card reporta que reproduce el PASS fuerte del informe original, la procedencia es recreada y no original.
- La política es sin estado y depende por completo del entorno para la memoria; fuera de la tarea R0 no tiene utilidad directa.
- El espacio de acciones y el de respuestas están fijados en 4 y 8 clases respectivamente, y la observación tiene exactamente 283 dimensiones.
- Existe una diferencia numérica entre PyTorch y Core ML atribuida al almacenamiento fp16 del ML Program (hasta 0,0345 de diferencia máxima absoluta en `act_logits`), que no altera la acción elegida en las pruebas realizadas, pero que conviene tener en cuenta en usos sensibles al valor exacto de los logits.
- La ventaja de rendimiento del ANE no es medible a este tamaño; el uso de `CPU_AND_NE` no aporta mejora práctica.
- Licencia MIT, que permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual, pero la política puede fallar en distribuciones distintas de la entrenada; los resultados OOD publicados cubren solo retardo 128 y 2 ranuras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eightman999/kamimusuhi-r0-memory-gate
- Código, entorno e informes: https://github.com/eightman999/kamimusuhi/tree/main/experiments/r0
- Repositorio principal del proyecto: https://github.com/eightman999/kamimusuhi
- Informe recreado: `experiments/r0/reports/R0_RESULTS_RECREATED_2026-11-27.md` dentro del repositorio de código
