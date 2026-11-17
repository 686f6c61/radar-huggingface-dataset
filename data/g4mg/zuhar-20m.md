# G4mg/zuhar-20M

## Resumen

Mirox Zuhar-20M es un modelo de lenguaje de 20 millones de parámetros desarrollado por OpenSurr (publicado en Hugging Face bajo el usuario G4mg) y especializado en jugar al ajedrez. A diferencia de los modelos conversacionales, el autor indica explícitamente que Zuhar no ha sido entrenado con datos de conversación, por lo que no mantiene diálogos: su propósito es generar jugadas o secuencias de ajedrez y servir como referencia para comparar el rendimiento de otras inteligencias artificiales en ese dominio.

El modelo se distribuye con licencia MIT, lo que permite uso comercial y modificación sin restricciones significativas, y ocupa aproximadamente 0,1 GB en el repositorio. No se han publicado detalles sobre la arquitectura interna, la longitud de contexto, los idiomas soportados ni el volumen o composición del dataset de entrenamiento, más allá de la mención a su orientación al ajedrez.

Su relevancia actual es limitada pero concreta: se trata de un modelo de escala muy reducida (20M), pensado como banco de pruebas o baseline ligero para tareas de ajedrez, no como un asistente general. Para desarrolladores e investigadores interesados en modelos pequeños de dominio específico, puede resultar útil como punto de comparación, aunque la ausencia de benchmarks y de documentación técnica detallada limita seriamente su evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 20 millones (según model card) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el autor indica que no hay datos conversacionales) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa ~0,1 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM u otra), ni sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card únicamente especifica que el modelo está enfocado en jugar al ajedrez y que carece de datos conversacionales, lo que sugiere un entrenamiento de dominio restringido, pero sin más detalles técnicos verificables.

Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos. Cualquier afirmación sobre su proceso de entrenamiento más allá de lo citado sería especulativa y no está respaldada por la información disponible.

## Capacidades

- Generación de jugadas o secuencias relacionadas con el ajedrez, según el propósito declarado por el autor.
- No dispone de capacidad conversacional: el autor advierte explícitamente que no se espere diálogo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles ni documentadas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Baseline de ajedrez en experimentos comparativos: el modelo puede emplearse como referencia de baja capacidad para contrastar el rendimiento de otras IA en tareas de ajedrez, tal como sugiere el autor.
- Pruebas de pipelines de inferencia ligera: con 20M de parámetros y ~0,1 GB de repo, es adecuado para validar infraestructura de despliegue en entornos con recursos muy limitados antes de escalar a modelos mayores.
- Investigación sobre modelos de dominio específico: sirve para estudiar cómo se comporta un modelo minúsculo entrenado sin datos conversacionales en una tarea concreta.
- Docencia y demostraciones: su tamaño reducido permite ejecutarlo en hardware modesto para ilustrar conceptos de modelos especializados frente a modelos generalistas.
- Comparación de estrategias de entrenamiento en ajedrez: puede integrarse en experimentos que midan la calidad de jugadas generadas por modelos de distinta escala.
- Evaluación de robustez y alucinación en dominios cerrados: útil para analizar cómo un modelo sin datos conversacionales responde fuera de su dominio previsto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 20M de parámetros, en fp32 ocuparía aproximadamente 80 MB de pesos, y en fp16 alrededor de 40 MB, aunque estos cálculos son estimaciones a partir del número de parámetros y no datos publicados por el autor.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna sería suficiente en teoría, pero no hay confirmación oficial.
- ¿Cabe en GPU consumer? Previsiblemente sí, dado el tamaño, aunque no está documentado.
- Opciones de despliegue: no disponible (no se especifican vLLM, llama.cpp, Ollama, TGI ni otros).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (ajedrez, 20M de parámetros) con datos verificables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de capacidad conversacional: el autor advierte que no debe esperarse diálogo.
- Sin documentación sobre sesgos, dataset o proceso de entrenamiento, lo que impide evaluar riesgos de sesgo.
- Riesgo de alucinación no evaluado: no hay benchmarks ni análisis de comportamiento fuera de dominio.
- Idiomas soportados no documentados; no se puede garantizar cobertura lingüística alguna.
- Longitud de contexto desconocida, lo que impide planificar usos con entradas largas.
- Licencia MIT: permite uso comercial y modificación, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo.
- Sin métricas de rendimiento publicadas: no es posible validar su calidad como jugador de ajedrez frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/G4mg/zuhar-20M
