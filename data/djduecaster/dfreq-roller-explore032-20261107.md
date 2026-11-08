# djduecaster/dfreq-roller-explore032-20261107

## Resumen

dfreq-roller-explore032-20261107 es un checkpoint de política de control para robótica publicado por el usuario djduecaster en Hugging Face. Se trata de un controlador neuronal que mapea observaciones de 61 dimensiones a 14 acciones, exportado en formato ONNX con precisión float32 y pensado para ejecutarse a 50 Hz. No es un modelo de lenguaje ni un modelo fundacional: es una política de control entrenada mediante PPO para una tarea concreta de locomoción con ruedas ("roller-sprint-2m", velocidad de consigna 1,1 m/s) dentro de un entorno de simulación denominado microduck-arena.

El checkpoint corresponde a la iteración 32 de un proceso de entrenamiento en el que se actualizan únicamente los 1.806 parámetros de la capa de salida sobre un backbone neuronal heredado ("Pollen") y un controlador de realimentación previo (N8). El autor declara explícitamente que la topología del grafo y el resto de pesos permanecen sin cambios respecto a versiones anteriores, y que la diferencia con el checkpoint Explore016 reside en esos 1.806 parámetros de salida.

La relevancia de esta ficha es limitada y debe enmarcarse con precisión: se trata de un artefacto de investigación de un autor individual, sin licencia declarada, sin idiomas ni datos de entrenamiento publicados, con 0 descargas y 0 likes en el momento de la consulta. El propio autor lo describe como candidato "solo de puntos", no como una mejora, y reconoce que es más lento que su mejor marca personal publicada (2,570 s frente a los 2,753 s de este checkpoint).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward exportada a ONNX; backbone heredado "Pollen" con capa de salida de 1.806 parámetros entrenada por PPO |
| Parámetros totales | no disponible (solo se documentan 1.806 parámetros de la capa de salida) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | float32 (único formato documentado) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible; el autor indica que no se afirma una licencia de redistribución general y remite a `LICENSE-NOTE.txt` y `upstream-base-card.md` |
| Formato de pesos | ONNX (entrada `obs[1,61]`, salida `actions[1,14]`) |

## Arquitectura y entrenamiento

La política es una red neuronal cuya topología exacta no se detalla en la información disponible; el autor solo especifica que el backbone "Pollen" es heredado y que la capa de salida contiene 1.806 parámetros entrenables. La interfaz es fija: observaciones float32 de forma `[1,61]` y acciones float32 de forma `[1,14]`, a una frecuencia de control de 50 Hz. El modelo se exporta a ONNX sin operadores personalizados, sin tensores externos, sin reloj, sin búsqueda de semillas y sin tabla de acciones en caché, lo que sugiere un grafo autocontenido y determinista.

El entrenamiento se realizó con PPO con clipping sobre física nativa en CPU y aprendizaje de la capa de salida en MPS (Apple Silicon). El autor menciona rollouts completos de episodios en MuJoCo/BAM en versiones previas de la familia. No se documentan el número de tokens ni la composición de datos (no aplica), pero sí se indica que no se ajustaron pesos ni comandos sobre los conjuntos de validación. La innovación técnica declarada es modesta: actualización exclusiva de la capa de salida sobre un backbone congelado, con verificación explícita de que los pesos difieren de checkpoints anteriores y que no se trata de una variante basada solo en hash.

## Capacidades

- Control de locomoción con ruedas en simulación para el evento "roller-sprint-2m" con velocidad de consigna de 1,1 m/s.
- Mapeo determinista de observaciones de 61 dimensiones a 14 acciones de control a 50 Hz.
- Ejecución en CPU mediante ONNX, sin dependencia de GPU para inferencia.
- Comportamiento bajo "command-stress": el autor reporta 16/16 inicios superados en validación de estrés de comando.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a locomoción con ruedas: sirve como checkpoint de referencia para estudiar la evolución de la capa de salida sobre un backbone congelado en la familia dfreq-roller.
- Reproducción de experimentos en microduck-arena: el paquete ONNX autocontenido permite ejecutar la política en el simulador local con la misma interfaz de observación y acción.
- Comparación de checkpoints dentro de una misma familia: al compartir topología y backbone, Explore032 puede contrastarse con Explore016 y con los checkpoints PPO de la misma serie para aislar el efecto de los 1.806 parámetros de salida.
- Validación de pipelines de exportación ONNX para robótica: el modelo ejemplifica un grafo sin operadores personalizados ni dependencias externas, útil para probar herramientas de verificación y despliegue en CPU.
- Pruebas de robustez ante variación de comandos: los resultados de "command-stress" permiten evaluar la sensibilidad de la política a cambios en la consigna de velocidad.
- Docencia y divulgación sobre PPO con backbone congelado: el autor documenta explícitamente el proceso, las métricas locales y las limitaciones, lo que facilita su uso como caso de estudio.
- No se recomienda para despliegue en robot real: el propio autor indica que es solo simulación y que no ofrece garantías de seguridad.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Evaluador local de barrido de velocidad (Arena original) | 2,753 s, 5/5 finalizaciones |
| Tiempos canónicos con comando fijo congelado | 2,725 s; 2,730 s; 2,775 s; 2,720 s; 2,815 s |
| Validación del 7 de noviembre (inicios ordinarios) | 32/32 |
| Validación del 7 de noviembre (estrés de comando) | 16/16 |
| Validación anterior (inicios ordinarios) | 128/128 |
| Validación anterior (estrés de comando) | 64/64 |
| Mejor marca personal publicada de la familia Roller | 2,570 s (referencia; este checkpoint es más lento) |

No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, y no procede aplicarlos a una política de control.

## Requisitos de hardware

- Inferencia en CPU: el modelo se exporta a ONNX en float32 y está diseñado para ejecutarse sin GPU; el tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere un artefacto muy pequeño.
- VRAM estimada: no aplica en CPU; en GPU, el modelo es lo suficientemente pequeño como para caber en cualquier GPU consumer, aunque no se documentan requisitos formales.
- GPU recomendadas: no disponibles; el entrenamiento se realizó en MPS (Apple Silicon), no se especifican modelos concretos.
- Cabe en GPU consumer: sí, por el tamaño reducido del artefacto, aunque no se aportan cifras de memoria.
- Opciones de despliegue: ONNX Runtime en CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: la política opera a 50 Hz (20 ms por paso de control); no se publican medidas de latencia adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento local | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dfreq-roller-explore032-20261107 | 1.806 en capa de salida (total no disponible) | no aplica | 2,753 s; 5/5 finalizaciones | no disponible | Hugging Face, 0 descargas |
| dfreq-roller-ppo032-20261103 | 1.806 en capa de salida (total no disponible) | no aplica | 2,721 s; 5/5 finalizaciones | no disponible | Hugging Face |
| dfreq-roller-mps-late-20261103 | 1.806 en capa de salida (total no disponible) | no aplica | no disponible en la información | no disponible | Hugging Face |

Los tres checkpoints pertenecen a la misma familia y comparten interfaz de 61 observaciones a 14 acciones en float32. Explore032 es más lento que ppo032 según los datos locales reportados por el autor.

## Limitaciones y advertencias

- El autor declara explícitamente que es un candidato "solo de puntos", no una mejora, y que el objetivo original de mejora y la guarda de no inferioridad de +30 ms fallaron y siguen fallando.
- Es más lento que la mejor marca personal publicada de la familia Roller (2,570 s frente a 2,753 s).
- Los resultados son de simulador local en Apple Silicon, no puntuaciones oficiales del servidor; la aceptación, finalización y puntos en la Arena no están garantizados.
- Solo simulación: no hay garantía de seguridad para robot real.
- Licencia no disponible; el autor no afirma una licencia de redistribución general y remite a `LICENSE-NOTE.txt` y `upstream-base-card.md`, lo que impide determinar condiciones de uso comercial.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje; estos criterios no aplican.
- No se documentan la topología completa ni el número total de parámetros, lo que limita la reproducibilidad independiente.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-roller-explore032-20261107
- Checkpoint relacionado ppo032: https://huggingface.co/djduecaster/dfreq-roller-ppo032-20261103
- Checkpoint relacionado mps-late: https://huggingface.co/djduecaster/dfreq-roller-mps-late-20261103
- SHA256 del modelo: 24e8339dbee01a67db643d84cd9f85d8722a8309c73550f33bdee0c10e0cf3d4
- Referencias internas citadas por el autor: `upstream-base-card.md`, `LICENSE-NOTE.txt` (no se proporcionan URL directas)
