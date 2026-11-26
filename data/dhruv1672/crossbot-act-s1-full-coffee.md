# dhruv1672/crossbot-act-s1-full-coffee

## Resumen

Cross-Bot ACT S1 Full Coffee es una política robótica basada en el algoritmo ACT (Action Chunking with Transformers) entrenada desde cero con la librería LeRobot 0.7.0. La desarrolla dhruv1672 en el marco de una tesis de máster (Cross-Bot, San José State University) y sirve como línea base frente a π0.5. El modelo resuelve una única habilidad de una estación de café bimanual simulada con dos brazos xArm-7 en Isaac Sim 6.0.1: coger un vaso y colocarlo bajo la salida de café (habilidad S1). Es, por tanto, un modelo de imitación de propósito muy específico, no un modelo de lenguaje.

El modelo tiene 51.689.104 parámetros (unos 51,7 M), un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. Se entrena a partir de 90 episodios de demostraciones guionizadas generadas con cuRobo, con cámaras RGB y estado articular como entradas, y produce objetivos articulares absolutos en trozos (chunks) de 100 acciones.

Su relevancia es acotada y experimental: documenta un caso de política ACT en robótica bimanual simulada y se publica con un estado de resultados honesto (0/5 en escenas de desarrollo en bucle cerrado). Nunca se ha ejecutado en hardware real y su uso previsto es la investigación en imitación robótica y la comparación de metodologías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), LeRobot 0.7.0 |
| Parametros totales | 51.689.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica ventana de contexto de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación en control visomotor. En este caso la política se entrena desde cero, recibe imágenes RGB y estado articular y emite objetivos articulares absolutos con un tamaño de chunk de 100. El entrenamiento se realizó durante 30.000 pasos, con batch de 8 y tasa de aprendizaje de 1e-5, sobre los 90 episodios de entrenamiento de la habilidad S1 del dataset `dhruv1672/crossbot-serve100-rgb-train`. Las demostraciones son guionizadas con cuRobo sobre una estación de café bimanual xArm-7 en Isaac Sim 6.0.1.

No se registró pérdida de validación durante el entrenamiento. El autor documenta limitaciones conocidas de los datos: el planificador registra la misma pose con articulaciones separadas un giro completo (2π) entre episodios (joint wrap), existen varios modos posturales por habilidad desde la misma pose inicial, la mayoría de demostraciones de S2 y S3 terminan con el brazo aún en movimiento y no hay datos de recuperación (todas las demostraciones son ejecuciones guionizadas exitosas). No se menciona uso de RLHF, DPO ni innovaciones de decodificación especulativa.

## Capacidades

- Ejecución de una habilidad robótica concreta: coger el vaso y colocarlo bajo la salida de café (S1) en simulación.
- Control visomotor bimanual con dos brazos xArm-7 a partir de cámaras RGB y estado articular.
- Predicción de acciones en chunks de 100 objetivos articulares absolutos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa ni genera lenguaje).
- Sin modo de razonamiento (thinking), visión general, audio ni otras capacidades especiales más allá de la percepción RGB para control.

## Casos de uso

- Investigación en imitación robótica: sirve como línea base ACT frente a π0.5 en un entorno bimanual simulado, permitiendo comparar metodologías de aprendizaje por imitación con el mismo dataset y estación.
- Reproducción de experimentos en Isaac Sim 6.0.1: el modelo permite replicar la habilidad S1 en la estación de café simulada y verificar el pipeline de LeRobot 0.7.0 sobre xArm-7.
- Estudio del fallo en bucle cerrado: con un resultado de 0/5 en escenas de desarrollo, es útil para analizar por qué una política que reproduce sus datos (replay 5/5) no generaliza en bucle cerrado.
- Análisis de calidad de datos de demostración: las limitaciones documentadas (joint wrap, modos posturales múltiples, frames de parada ausentes) permiten estudiar su impacto en el entrenamiento de políticas ACT.
- Docencia y tesis: material de referencia para trabajos académicos sobre políticas de acción con chunking y control bimanual simulado.
- Desarrollo de harness de evaluación: el contraste entre replay exitoso (5/5) y política en bucle cerrado (0/5) ayuda a validar y depurar infraestructuras de evaluación por etapas.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Bucle cerrado en escenas de desarrollo (simulacion) | 0/5 |
| Replay de acciones registradas en S1 | 5/5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte que las comprobaciones en bucle cerrado se ejecutan una etapa a la vez sobre escenas usadas en entrenamiento (con etapas previas guionizadas) y no miden generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors de 0,2 GB, la huella de pesos es reducida (inferior a 1 GB en precisión original).
- GPU recomendadas: no disponible. El modelo requiere el entorno de simulación Isaac Sim 6.0.1 para su uso previsto, cuyos requisitos de GPU son independientes del tamaño de la política.
- Cabe en GPU de consumo: probablemente sí por tamaño de pesos, aunque no se especifica en la información disponible.
- Opciones de despliegue: LeRobot 0.7.0 como librería principal; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cross-Bot ACT S1 Full Coffee | 51,7 M | no aplica | 0/5 bucle cerrado; 5/5 replay | apache-2.0 | Hugging Face |
| π0.5 (referencia del autor) | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor cita π0.5 como comparación en su tesis, pero no se proporcionan datos de parámetros, contexto ni rendimiento de ese modelo en la información disponible. No se dispone de otras alternativas comparables documentadas.

## Limitaciones y advertencias

- Solo simulación: nunca se ha ejecutado en hardware real; no debe usarse en robots físicos sin validación adicional.
- Generalización nula en bucle cerrado: 0/5 en escenas de desarrollo, aunque el replay de acciones registradas funciona (5/5).
- Joint wrap en los datos: la misma pose aparece con articulaciones separadas 2π entre episodios, lo que puede confundir el aprendizaje.
- Varios modos posturales por habilidad desde la misma pose inicial, lo que introduce ambigüedad en la política.
- Frames de parada ausentes en la mayoría de demostraciones de S2 y S3, con el brazo aún en movimiento al terminar.
- Sin datos de recuperación: todas las demostraciones son ejecuciones guionizadas exitosas, por lo que el modelo no aprende a corregir fallos.
- No se registró pérdida de validación durante el entrenamiento, lo que dificulta diagnosticar sobreajuste.
- Sin capacidades de lenguaje, tool calling, agentes ni multilingüismo; no es un modelo de propósito general.
- Licencia Apache 2.0 permite uso comercial, pero el ámbito de aplicación real es investigación en simulación.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar acciones no válidas fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhruv1672/crossbot-act-s1-full-coffee
- Dataset de entrenamiento: https://huggingface.co/datasets/dhruv1672/crossbot-serve100-rgb-train
- LeRobot: https://github.com/huggingface/lerobot
- Isaac Sim: https://developer.nvidia.com/isaac/sim
- cuRobo: https://github.com/NVlabs/curobo
