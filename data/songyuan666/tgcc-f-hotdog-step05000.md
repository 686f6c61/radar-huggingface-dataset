# Songyuan666/TGCC-F-hotdog-step05000

## Resumen

TGCC-F-hotdog-step05000 es un checkpoint de política robótica para la tarea `cook_hot_dogs` del benchmark BEHAVIOR-1K (edición 2025). Lo publica el usuario Songyuan666 en HuggingFace como un fine-tuning del modelo base TC-pi0.5, que a su vez deriva de la familia pi0.5. No es un modelo de lenguaje generalista ni un checkpoint de Transformers AutoModel: es un modelo de robótica de propósito específico que combina percepción visual, un experto de visión-lenguaje y un módulo de acción, junto con un crítico y un adaptador de recuperación (retrieval).

El checkpoint está entrenado exclusivamente para la tarea de cocinar perritos calientes, con un protocolo que usa RGB más grafos Oracle acotados a la tarea. El autor reporta 11 de 20 éxitos (55 %) en la evaluación histórica con un Q oficial medio de 0,5500, y advierte explícitamente de que no se reclama generalización entre tareas ni se trata de un checkpoint de cinco tareas. La receta corresponde a una versión antigua (feature/target/reference/memory) distinta de la release posterior v3fast.

Su relevancia es acotada: sirve como referencia reproducible para investigación en manipulación robótica de larga duración dentro de BEHAVIOR-1K, y como ejemplo de integración de recuperación de demostraciones con un crítico auxiliar en un pipeline de imitación. El repo ocupa 8,5 GB e incluye pesos de inferencia, metadatos originales, una biblioteca de recuperación con codificador congelado y el código fuente exacto vinculado al checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de robótica pi0.5 con experto VLM y experto de acción; no es un transformer de texto estándar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch dentro de `checkpoint/` (repo de 8,5 GB); no es un checkpoint AutoModel de Transformers |

## Arquitectura y entrenamiento

El modelo se describe como un sistema con un estudiante completo que integra visión, un experto VLM y un experto de acción, con E/S de tres grafos, semántica y memoria, más un crítico y un adaptador de recuperación. El grupo de políticas congeladas (`frozen_policy_groups`) está vacío, lo que indica que en este checkpoint se actualizan todos los grupos de política del estudiante; el codificador de recuperación independiente permanece congelado. La configuración base, el tokenizador, el normalizador y el modelo padre TC-pi0.5 se toman de `Songyuan666/TC-pi0.5`.

El entrenamiento se realizó únicamente sobre la tarea `cook_hot_dogs` usando el dataset `behavior-1k/2025-challenge-demos`. Los contadores reportados son: 5000 actualizaciones del nuevo schedule, 10 000 actualizaciones acumuladas de la política y 10 708 actualizaciones acumuladas reales del crítico. El campo `full_model_updates` es histórico y el autor advierte de que debe leerse junto con `config.frozen_policy_groups` y el alcance declarado antes de interpretarlo como entrenamiento de todos los parámetros. La calibración se hizo con 16 episodios de demostración exitosa reservados, sin ajustar umbrales sobre las instancias públicas de evaluación. No se documenta el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Control robótico para la tarea `cook_hot_dogs` en el entorno BEHAVIOR-1K (Isaac).
- Percepción visual a partir de entradas RGB.
- Razonamiento guiado por grafos Oracle acotados a la tarea.
- Uso de memoria y de un adaptador de recuperación sobre una biblioteca de demostraciones de soporte.
- Crítico auxiliar para puntuar o filtrar acciones durante la inferencia.
- Ejecución de episodios completos: los 20 casos de la evaluación histórica alcanzaron terminales naturales oficiales.
- No se documenta soporte de tool calling, function calling, agentes multi-paso genéricos, capacidades multilingües ni modos de pensamiento.

## Casos de uso

- Reproducción de resultados en BEHAVIOR-1K: cargar el checkpoint con la revisión fijada del Hub y el código fuente incluido en `source/frozen_source.tar.gz` para replicar el protocolo de 20 instancias y el Q oficial de 0,5500.
- Investigación en imitación con recuperación: usar `retrieval_library/` y el codificador congelado como línea base para estudiar cómo afecta la recuperación de demostraciones al éxito en tareas de manipulación largas.
- Estudio de críticos auxiliares: comparar el comportamiento del crítico (10 708 actualizaciones acumuladas) frente a variantes sin crítico en la misma tarea.
- Análisis de calibración: emplear los 16 episodios reservados como referencia para evaluar la sensibilidad de umbrales en políticas entrenadas con pocos datos.
- Docencia y divulgación: ejemplo concreto de pipeline de robótica con percepción, memoria y recuperación sobre un benchmark público, útil para explicar arquitecturas híbridas en robótica.
- Punto de partida para fine-tuning posterior: al estar entrenado solo en `cook_hot_dogs`, sirve como inicialización para experimentos que añadan tareas nuevas y midan transferencia, siempre que se respeten las condiciones de uso de los assets externos.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Tasa de éxito (histórica, 20 instancias) | 11/20 (55 %) |
| Q oficial medio | 0,5500 |
| Instancias con terminal natural oficial | 20/20 |
| Actualizaciones del schedule nuevo | 5000 |
| Actualizaciones acumuladas de política | 10 000 |
| Actualizaciones acumuladas del crítico | 10 708 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otros checkpoints de la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 8,5 GB, pero incluye pesos, metadatos, biblioteca de recuperación y código fuente, por lo que el tamaño de los pesos de inferencia no se puede derivar con precisión.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el modelo requiere el código del repositorio `susongyuan/TGCC` y el entorno BEHAVIOR/Isaac con sus assets externos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TGCC-F-hotdog-step05000 | no disponible | no disponible | `cook_hot_dogs` (BEHAVIOR-1K) | no disponible | HuggingFace, repo de 8,5 GB |
| Songyuan666/TC-pi0.5 (modelo base) | no disponible | no disponible | política base pi0.5 | no disponible | HuggingFace |
| Otras variantes TGCC del mismo autor | no disponible | no disponible | tareas BEHAVIOR-1K | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en `cook_hot_dogs`; no se reclama generalización entre tareas ni se trata de un checkpoint de cinco tareas.
- Los resultados (55 %, Q = 0,5500) son históricos y corresponden a una receta anterior, distinta de la release corregida v3fast; no deben presentarse como el estado del arte actual del proyecto.
- El protocolo reportado usa grafos Oracle acotados a la tarea, lo que introduce una dependencia de información privilegiada que no estará disponible en un despliegue real.
- Las puntuaciones son "advisory" y los límites nativos del controlador permanecen activos; no se grabó vídeo de evaluación.
- El campo `full_model_updates` es histórico: hay que leer `config.frozen_policy_groups` y el alcance declarado antes de interpretarlo como entrenamiento de todos los parámetros.
- La finalización del RNG de Adam y del rango no se publica; el autor indica que se conserva de forma privada en el servidor de entrenamiento y que esta release no garantiza reanudación completa del optimizador.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no es lingüístico; sí aplican los riesgos propios de una política robótica con datos limitados.
- La licencia no está disponible; el autor remite a las licencias originales del código, del modelo, del dataset y de los assets, y a los términos de BEHAVIOR/Isaac, que son externos. Verificar antes de cualquier uso comercial.
- Es imprescindible fijar la revisión del Hub y verificar `SHA256SUMS`; los checkpoints históricos requieren su propio código fuente incluido.
- No es un checkpoint de Transformers AutoModel; no funcionará con pipelines estándar de `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Songyuan666/TGCC-F-hotdog-step05000
- Modelo base TC-pi0.5: https://huggingface.co/Songyuan666/TC-pi0.5
- Código del proyecto TGCC: https://github.com/susongyuan/TGCC
- Dataset de demostraciones: https://huggingface.co/datasets/behavior-1k/2025-challenge-demos
