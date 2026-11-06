# BabyClaw/duck-skill-20261106-r2-hill-climb-1m5

## Resumen

Duck Skill Hill Climb R2 es una política de control para robótica, no un modelo de lenguaje. Se trata de un artefacto entrenado mediante aprendizaje por refuerzo que mapea 61 observaciones del entorno a 14 acciones de control, empaquetado en formato ONNX para inferencia en CPU. Lo publica el usuario BabyClaw dentro del ecosistema microduck, un entorno de simulación de robots tipo pato asociado a Pollen Robotics, y está diseñado específicamente para resolver la prueba "hill-climb-1m5" de la MicroDuck Arena.

El modelo resuelve un problema muy acotado: hacer que un agente simulado complete un recorrido de ascenso en pendiente en el menor tiempo posible, manteniendo una velocidad de consigna de 0,7. La relevancia de esta ficha es limitada para el público general de IA, pero es representativa de una categoría creciente de artefactos: políticas de robótica de tamaño mínimo (28 parámetros afinables) publicadas como pesos ONNX verificables mediante hash, con trazabilidad de semillas de entrenamiento y validación.

No hay información sobre arquitectura de red, número de parámetros totales, contexto ni idiomas, porque el objeto no es un modelo generativo. Los datos disponibles se limitan a la procedencia del entrenamiento, el manifiesto de evaluación y los resultados locales declarados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control; red neuronal no descrita en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 61 observaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (inferencia en CPU) |
| Entradas | 61 observaciones |
| Salidas | 14 acciones |
| Parametros afinados en la busqueda | 28 |
| Hash SHA-256 de la politica | `85cadce3a9c7c6c409f48707e6a7a26b6b0af059dc8963029e9eeddd2fc6e6ed` |
| Libreria | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La model card no describe la topología de la red neuronal subyacente; solo indica que la política se exporta a ONNX y se ejecuta en CPU. Lo que sí detalla es el procedimiento de optimización: una "evolución antitética elitista de parámetros afines de salida" (elitist antithetic evolution of output affine parameters), es decir, una búsqueda evolutiva sobre 28 parámetros que transforman linealmente la salida de una política donante preexistente (identificada por el hash `0a50f2f4...`). No se trata, por tanto, de un entrenamiento desde cero, sino de un ajuste fino evolutivo sobre una política base.

El proceso usa tres semillas de entrenamiento (60001, 60002, 60003), 40 semillas de validación (1001-1040) y 20 semillas de retención (1101-1120). La configuración incluye rotación de semillas, velocidad adaptativa, selección de velocidad oficial y 20 semillas de promoción (desde 100000). La generación alcanzada es la 52, con sigma inicial de 0,008. No se documenta composición de dataset ni uso de RLHF/DPO, porque no aplica a este tipo de artefacto.

## Capacidades

- Control de locomoción para un agente simulado tipo pato en la prueba "hill-climb-1m5".
- Mapeo directo de 61 observaciones a 14 acciones de control.
- Inferencia en CPU mediante ONNX, sin necesidad de GPU.
- Ejecución determinista verificable por hash SHA-256 de la política.
- Trazabilidad completa de procedencia: semillas, configuración de búsqueda y manifiesto de evaluación.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Evaluación en la MicroDuck Arena: la política se envía al espacio de Pollen Robotics para obtener la puntuación oficial del evento "hill-climb-1m5", que es la métrica que realmente cuenta frente a los resultados locales.
- Investigación en optimización evolutiva: sirve como ejemplo reproducible de búsqueda de parámetros afines sobre una política donante, con configuración y semillas documentadas.
- Reproducibilidad de experimentos de RL: los hashes de política, manifiesto y registro de búsqueda permiten verificar que un resultado corresponde exactamente al artefacto publicado.
- Benchmarking de políticas de control en simulación: útil para comparar estrategias de hill climbing y evolución antitética en tareas de locomoción acotadas.
- Docencia sobre artefactos verificables: ilustra cómo publicar un peso ONNX con procedencia criptográfica y evidencia de evaluación local.
- Integración en pipelines de simulación a pequeña escala: al ser ONNX y ejecutarse en CPU, puede incorporarse en bucles de simulación sin infraestructura GPU.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones locales declaradas por el autor, no resultados oficiales de la Arena.

| Metrica | Valor |
|---|---|
| Puntuación de desarrollo (score) | 2,966125 |
| Métrica | mean_finish_time (menor es mejor) |
| Velocidad de consigna (command_vx) | 0,7 |
| Semillas completadas (desarrollo) | 40/40 |
| Semillas completadas (promoción) | 20/20 |
| Puntuación de promoción | 2,97425 |
| Tiempo medio por semilla (promoción) | aprox. 2,95 s (rango 2,93-3,055 s en las semillas mostradas) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU vía ONNX.
- GPU recomendadas: ninguna; el autor especifica inferencia en CPU.
- Cabe en cualquier equipo capaz de ejecutar ONNX Runtime, incluidos portátiles y sistemas embebidos.
- Opciones de despliegue: ONNX Runtime (CPU); el ecosistema microduck gestiona la carga de la política.
- Latencia y throughput: no disponibles en la información proporcionada; los tiempos de finalización por episodio rondan los 2,93-3,055 s en simulación.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas/salidas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Duck Skill Hill Climb R2 (este) | Política RL para microduck | 61 / 14 | ONNX | no disponible | Hugging Face |
| Política donante (`0a50f2f4...`) | Política RL base | no disponible | ONNX | no disponible | referenciada por hash |
| Otras entradas de la MicroDuck Arena | Políticas RL para microduck | no disponible | ONNX | no disponible | espacio de Pollen Robotics |

No se dispone de datos de rendimiento de las alternativas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ámbito extremadamente estrecho: solo resuelve la tarea "hill-climb-1m5"; no generaliza a otras tareas ni dominios.
- Los resultados son locales e indicativos; la puntuación oficial la determina la Arena, no la model card.
- No se especifica la licencia, por lo que el uso comercial queda sin autorización explícita.
- No hay información sobre la arquitectura de la red ni sobre el número total de parámetros, lo que dificulta auditar el comportamiento.
- El ajuste se realiza sobre 28 parámetros afines de salida de una política donante; la política hereda las limitaciones del donante.
- Riesgo de sobreajuste a las semillas de entrenamiento y validación, aunque se declaran semillas de retención separadas.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta herramientas ni agentes.
- La reproducibilidad depende de la disponibilidad del entorno microduck y de la versión exacta de ONNX Runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyClaw/duck-skill-20261106-r2-hill-climb-1m5
- Evento en la MicroDuck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/hill-climb-1m5
- Espacio de Pollen Robotics (Arena): https://huggingface.co/spaces/pollen-robotics/microduck-arena
