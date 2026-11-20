# PerceptronAI/Isaac-0.5-LIBERO

## Resumen

Isaac 0.5 for LIBERO es un checkpoint de política robótica (vision-language-action, VLA) obtenido por *fine-tuning* del modelo base Isaac 0.5 de PerceptronAI sobre los cuatro conjuntos de tareas del benchmark LIBERO: Spatial, Object, Goal y Long. El modelo consume dos vistas RGB, una instrucción en lenguaje natural y el estado del robot, y produce acciones de efector final y pinza mediante un experto de flujo (*flow expert*). Está publicado en Hugging Face bajo la librería LeRobot y el pipeline `robotics`, con pesos en formato `safetensors` y un repositorio de 142,9 GB.

El interés de esta ficha es doble: por un lado, documenta un resultado de referencia muy alto en LIBERO (98,5 % de episodios resueltos según la evaluación del autor); por otro, sirve como ejemplo de integración de un modelo VLA de gran tamaño en el ecosistema LeRobot, con instrucciones reproducibles de instalación y evaluación. El checkpoint se guardó en el paso 20.000 de un *fine-tuning* distribuido en 16 GPU con lote global de 128 secuencias y longitud de secuencia de 768 tokens.

La información pública disponible es escasa: la model card no detalla arquitectura interna, número de parámetros, licencia ni composición del dataset de entrenamiento más allá de los suites de LIBERO. Esta ficha refleja únicamente lo que el autor declara y marca explícitamente como «no disponible» todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo VLA con «Flow expert» para predicción de acciones; detalles internos no publicados) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 768 tokens (longitud de secuencia usada en el *fine-tuning*; no se declara como contexto máximo) |
| Tipos de cuantización | no disponible (pesos publicados en `safetensors`, presumiblemente en precisión de entrenamiento) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (repo de 142,9 GB, estructura LeRobot) |

## Arquitectura y entrenamiento

El autor describe Isaac 0.5 como un modelo con un «Flow expert» que predice acciones de efector final y pinza a partir de dos vistas RGB, una instrucción de lenguaje y el estado del robot. No se publican detalles sobre el *backbone* (transformer, MoE, híbrido), el número de parámetros ni la naturaleza exacta del mecanismo de flujo (por ejemplo, *flow matching* o *rectified flow*). La única información arquitectónica concreta es la interfaz de entrada (dos cámaras RGB, instrucción, estado) y la salida (acción de efector final y gripper).

El *fine-tuning* se realizó sobre los suites Spatial, Object, Goal y Long de LIBERO, con 16 GPU, lote global de 128 secuencias y longitud de secuencia de 768 tokens, guardándose el checkpoint en el paso 20.000. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF, DPO o *reward modeling*. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de manipulación a partir de instrucciones en lenguaje natural: genera acciones de efector final y pinza condicionadas a dos vistas RGB, estado del robot y texto.
- Ejecución de tareas de los suites LIBERO: Spatial (razonamiento espacial), Object (manipulación de objetos), Goal (alcance de objetivos) y Long (tareas de horizonte largo).
- Percepción visual multi-vista: consume dos cámaras RGB simultáneamente.
- Condicionamiento por lenguaje: interpreta instrucciones en inglés para seleccionar la tarea.
- No se declara soporte de *tool calling*, *function calling*, agentes multi-paso, modo *thinking*, visión genérica, audio ni capacidades multilingües más allá del inglés.
- No se declara uso como modelo de propósito general (texto, código, matemáticas); es un modelo específico de robótica.

## Casos de uso

- Evaluación reproducible en LIBERO: el checkpoint incluye comandos exactos para ejecutar los cuatro suites con 50 episodios por tarea y semilla 0, lo que permite comparar políticas VLA de forma estandarizada.
- Investigación en *vision-language-action*: sirve como referencia de *fine-tuning* de un modelo base grande sobre un benchmark de manipulación, útil para estudiar transferencia y ajuste fino.
- *Baseline* para comparativas de políticas robóticas: al reportar 98,5 % global, es un punto de comparación para nuevos métodos en LIBERO.
- Prototipado de manipulación en simulación: integrable en entornos MuJoCo/LIBERO mediante LeRobot para probar instrucciones y configuraciones de cámara.
- Estudio de robustez y generalización: permite analizar el comportamiento del modelo en tareas de horizonte largo (suite Long) y razonamiento espacial (suite Spatial).
- Docencia y formación en robótica: ejemplo práctico de pipeline completo (instalación, descarga de pesos, evaluación) con un modelo VLA de gran tamaño.
- No se recomienda su uso en robótica real sin validación adicional, dado que la model card solo documenta resultados en simulación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la evaluación de referencia (2.000 episodios totales, 500 por suite):

| Suite | Episodios resueltos | Tasa de éxito |
|---|---:|---:|
| Spatial | 482 / 500 | 96,4 % |
| Object | 500 / 500 | 100,0 % |
| Goal | 491 / 500 | 98,2 % |
| Long | 497 / 500 | 99,4 % |
| **Global** | **1.970 / 2.000** | **98,5 %** |

El autor indica que «la repetición del benchmark con este paquete está pendiente», por lo que estos números proceden de la ejecución de referencia del autor y no de una reproducción independiente publicada. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 142,9 GB en `safetensors`, lo que sugiere un modelo de gran tamaño; no se publica el número de parámetros ni la precisión de los pesos, por lo que no es posible estimar VRAM con rigor.
- GPU recomendadas: no disponible. El *fine-tuning* se realizó en 16 GPU (modelo no especificado); la evaluación de referencia usa `--policy.device=cuda`.
- ¿Cabe en GPU de consumo? No disponible. Dado el tamaño del repositorio, es improbable que quepa en GPU de consumo sin cuantización, pero no se confirma.
- Opciones de despliegue: LeRobot (librería oficial del checkpoint), con el submódulo de Isaac y las dependencias `perceptron_isaac`, `training` y `libero`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (orientados a LLM, no a políticas VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos VLA comparables en la información proporcionada (parámetros, contexto, rendimiento, licencia). La comparativa se declara **no disponible**.

| Modelo | Parámetros | Contexto | LIBERO (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Isaac 0.5 LIBERO | no disponible | 768 tokens (secuencia de entrenamiento) | 98,5 % (autor) | no disponible | Hugging Face (LeRobot) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor.
- Riesgo de alucinación: no evaluado; en políticas VLA el fallo se manifiesta como acciones incorrectas o incompletas, no como texto inventado.
- Limitaciones de idioma: solo inglés (`en`); no se declara soporte multilingüe.
- Limitaciones de contexto: la longitud de secuencia de entrenamiento es de 768 tokens; no se declara contexto máximo ni comportamiento más allá de esa longitud.
- Licencia: **no disponible**; no se puede confirmar el uso comercial. Es un riesgo relevante para producción.
- Resultados no reproducidos de forma independiente: el propio autor indica que la repetición del benchmark con el paquete publicado está pendiente.
- Validación solo en simulación (LIBERO); no hay evidencia publicada de transferencia a robots reales.
- Tamaño del repositorio (142,9 GB) y dependencias específicas (CUDA 12.8, submódulo LeRobot) complican el despliegue.
- No se documentan limitaciones de seguridad física para uso en robots reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PerceptronAI/Isaac-0.5-LIBERO
- Modelo base Isaac 0.5: https://huggingface.co/PerceptronAI/Isaac-0.5
- Benchmark y datos LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Código de Isaac: https://github.com/perceptron-ai-inc/isaac
- Blog de presentación: https://www.perceptron.inc/blog/introducing-isaac-0-5
