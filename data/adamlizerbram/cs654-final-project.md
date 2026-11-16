# adamlizerbram/cs654-final-project

## Resumen

`adamlizerbram/cs654-final-project` es un conjunto de pesos publicado como proyecto final de un curso de aprendizaje por refuerzo (CS 654). No es un modelo de lenguaje de propósito general, sino un ajuste fino de Laya, un modelo orientado a la toma de decisiones en entornos de simulación, aplicado al simulador de conducción autónoma `highway-env` (variante `highway-fast-v0`). El autor compara tres aproximaciones: DQN clásico, Laya sin protección y un DQN protegido por un escudo de seguridad basado en Laya.

El checkpoint `laya-highway` responde a dos preguntas sobre una descripción textual del entorno de conducción: si una acción propuesta es segura (`noul`) y qué acción legal es la más segura manteniendo progreso (`choice`). Las etiquetas se generan por simulación, no por anotación humana, aplicando una regla de mirada hacia delante de 3 segundos. El modelo base es `convaiinnovations/laya`, un modelo de 0,8 GB de pesos en formato safetensors bajo licencia Apache 2.0.

Su relevancia es fundamentalmente académica y metodológica: demuestra cómo un modelo preentrenado para toma de decisiones puede ajustarse con supervisión derivada de un simulador para actuar como verificador de seguridad y como política de conducción, con mejoras muy notables en calibración de probabilidades (ECE de 0,303 a 0,025 en la tarea de seguridad). No está pensado para despliegue en producción real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Laya (modelo base `convaiinnovations/laya`); arquitectura interna no detallada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo consume descripciones textuales del entorno en un formato fijo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,8 GB |
| Pipeline | reinforcement-learning |
| Modelo base | convaiinnovations/laya |
| Librería | laya (versión de entrenamiento 0.4.30) |

## Arquitectura y entrenamiento

El modelo parte de Laya, un modelo de decisión preentrenado, y se ajusta con la herramienta `laya-train` (versión 0.4.30) sobre un conjunto de 16.805 ítems de entrenamiento y 400 ítems de calibración. El entrenamiento se realizó durante 4 épocas con el objetivo `rlcd` por defecto, la opción `--shuffle-options` y un tamaño de lote efectivo de 64, sobre una GPU A100. Posteriormente se aplicó escalado de temperatura con T = 5,0 para ambos tipos de pregunta, lo que explica la mejora drástica en calibración.

Los datos de entrenamiento no provienen de humanos: para cada estado visitado y cada acción legal, una copia del simulador aplica la acción y mantiene carril y velocidad durante dos pasos adicionales. Una acción se etiqueta como insegura si la copia colisiona o si el hueco en el mismo carril cae por debajo de 5 metros. La etiqueta de acción corresponde a la acción segura con mayor progreso hacia delante. Los episodios de entrenamiento usan semillas 0–299, los de validación 10000–10049, y las semillas de evaluación (100000+) nunca se usaron para entrenamiento ni ajuste. El checkpoint responde a dos preguntas sobre una descripción textual fija del entorno: seguridad (`noul`) y elección de acción (`choice`).

## Capacidades

- Clasificación binaria de seguridad: determinar si una acción propuesta provocará colisión o un hueco inferior a 5 metros en los próximos 3 segundos.
- Selección de acción: elegir la acción legal más segura que mantenga buen progreso.
- Actuación como escudo de seguridad: la salida `noul` alimenta un mecanismo de protección que filtra acciones inseguras en un agente DQN.
- Política de conducción autónoma: la salida `choice` permite usar Laya como política de conducción por sí sola.
- Calibración de probabilidades: tras el ajuste, el 99 % de las predicciones de P(inseguro) caen por debajo de 0,1 o en 0,9 o superior, con ambos grupos bien calibrados.
- Procesamiento de descripciones textuales del entorno en un formato fijo.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Escudo de seguridad en aprendizaje por refuerzo: integrar la salida `noul` como filtro que veta acciones propuestas por un agente DQN antes de ejecutarlas en el simulador, reduciendo colisiones durante el entrenamiento y la evaluación.
- Política de conducción en `highway-env`: usar la salida `choice` como política directa en `highway-fast-v0` para comparar su rendimiento con DQN en experimentos académicos.
- Verificación de acciones en entornos simulados: dado un estado descrito en texto y una acción candidata, obtener una probabilidad calibrada de inseguridad para análisis de riesgo.
- Estudio de calibración de modelos de decisión: el contraste antes/después del ajuste (ECE de 0,303 a 0,025) sirve como caso de referencia para investigar escalado de temperatura en modelos de RL.
- Generación de datos sintéticos de seguridad: la regla de simulación con mirada a 3 segundos puede replicarse para producir etiquetas de seguridad en otros mapas o configuraciones de `highway-env`.
- Docencia en cursos de aprendizaje por refuerzo: el repositorio incluye pesos y procedimiento reproducibles para comparar DQN, Laya y DQN con escudo en un entorno estándar.
- Evaluación de robustez fuera de distribución: probar cómo degrada el modelo cuando la descripción textual del estado se aparta del formato fijo usado en entrenamiento.

## Benchmarks y rendimiento

Resultados de validación del checkpoint `laya-highway` (antes → después del ajuste fino):

| Pregunta | Ítems | Precisión | ECE |
|---|---|---|---|
| Seguridad (`noul`) | 2.754 | 0,503 → 0,947 | 0,303 → 0,025 |
| Acción (`choice`) | 697 | 0,144 → 0,891 | 0,586 → 0,048 |

No se han publicado resultados de benchmarks en la información disponible para comparaciones con DQN u otros agentes en las semillas de evaluación (100000+), aunque el autor indica que el proyecto compara DQN, Laya y un DQN con escudo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,8 GB en safetensors, por lo que la inferencia en precisión nativa debería caber holgadamente en GPUs de consumo, aunque no se documenta el consumo real.
- GPU recomendadas: el entrenamiento se realizó en una A100; para inferencia no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? Muy probablemente sí dado el tamaño del repositorio, pero no está confirmado en la información disponible.
- Opciones de despliegue: la librería `laya` (carga mediante `laya.load`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `adamlizerbram/cs654-final-project` (laya-highway) | no disponible | no disponible | Seguridad y acción en `highway-fast-v0` | Apache 2.0 | Hugging Face |
| `convaiinnovations/laya` (modelo base) | no disponible | no disponible | Toma de decisiones general | no disponible en esta ficha | Hugging Face |
| DQN (línea base del proyecto) | no disponible | no aplica | Conducción en `highway-env` | no aplica | Implementación del proyecto, sin pesos publicados en esta información |

No se dispone de datos de rendimiento comparativo entre estas alternativas en las semillas de evaluación.

## Limitaciones y advertencias

- Las etiquetas imitan una regla de mirada a 3 segundos, no a un conductor óptimo; el modelo aprende esa heurística, no una política de conducción general.
- `highway-fast-v0` usa física gruesa a 5 Hz, lo que limita la fidelidad de las decisiones.
- El modelo lee un formato de texto fijo; cualquier otra descripción del estado queda fuera de distribución y degrada su fiabilidad.
- El 6,2 % de las acciones realmente inseguras reciben una puntuación inferior a 0,1, es decir, se clasifican como seguras con alta confianza; esto es crítico en un escudo de seguridad.
- Es un proyecto académico sin validación en entornos reales ni en otros simuladores.
- No hay información sobre sesgos, multilingüismo ni comportamiento en dominios distintos de la conducción simulada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y la naturaleza experimental del modelo desaconsejan cualquier despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adamlizerbram/cs654-final-project
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Documentación de highway-env: https://highway-env.farama.org/
- Repositorio del entorno highway-env: no disponible en la información proporcionada
- Paper o blog del proyecto CS 654: no disponible en la información proporcionada
