# BabyClaw/duck-skill-20261106-r2-sock-heist-6m

## Resumen

Duck Skill Sock Heist R2 es una política de control para robótica desarrollada por BabyClaw dentro del ecosistema MicroDuck, un entorno de simulación de robots tipo pato. No se trata de un modelo de lenguaje, sino de un pequeño controlador entrenado por aprendizaje por refuerzo que resuelve una tarea concreta: la prueba "sock-heist-6m" de la MicroDuck Arena, en la que el agente debe completar un recorrido de 6 metros en el menor tiempo posible.

El modelo se distribuye como un fichero ONNX para inferencia en CPU, con 61 observaciones de entrada y 14 acciones de salida, y un total de 28 parámetros entrenables. La política se ha obtenido mediante evolución elitista antithetica de los parámetros afines de salida, partiendo de una política donante previa, y se ha validado con 40 semillas de desarrollo más 20 semillas de retención antes de su selección.

Su relevancia es acotada y muy específica: sirve como referencia para quienes participan en la MicroDuck Arena o investigan optimización de políticas de control de baja dimensión mediante métodos evolutivos en lugar de gradientes. La mejora respecto a la entrega anterior es modesta pero medible: el tiempo oficial pasa de 14,614 s a 13,647 s.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control de parámetros afines de salida (28 parámetros), exportada a ONNX |
| Parámetros totales | 28 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; 61 observaciones de entrada por paso) |
| Tipos de cuantización | No disponible (inferencia ONNX en CPU, sin cuantización documentada) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política no es un transformer ni una red profunda convencional: se describe como una evolución elitista antithetica de los parámetros afines de salida, con un total de 28 parámetros. El espacio de observación es de 61 dimensiones y el de acciones de 14 dimensiones. El entrenamiento parte de una política donante (`policy.onnx`, SHA-256 `29b7bcb0...`) y optimiza los parámetros de salida mediante búsqueda evolutiva con semilla 202611263, sigma inicial 0,006 y compensación de feedback activada.

El proceso de selección usó 3 semillas de entrenamiento (70001-70003), 40 semillas de validación (1001-1040) y 20 semillas de retención (1101-1120). La regla de selección exigía 40/40 en desarrollo y 20/20 en retención, mejora de la media de desarrollo y preferencia por no degradar la puntuación oficial. La evaluación final se realizó sobre 50 semillas no usadas durante la selección. Se trata de un método de búsqueda directa en el espacio de parámetros, sin gradientes ni RL basado en política, lo que lo hace reproducible y barato computacionalmente.

## Capacidades

- Control de locomoción del robot MicroDuck en la tarea "sock-heist-6m" (recorrido de 6 metros).
- Inferencia en CPU mediante ONNX, sin requisitos de GPU.
- Consumo de 61 observaciones por paso y emisión de 14 acciones de control.
- Reproducibilidad verificable mediante hashes SHA-256 de política, manifiesto y evidencias de evaluación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto, imagen ni audio: es exclusivamente un controlador numérico de robótica.

## Casos de uso

- Participación en la MicroDuck Arena: la política puede enviarse directamente al espacio de evaluación oficial para competir en la prueba sock-heist-6m, ya que el formato ONNX y la interfaz de 61 observaciones / 14 acciones son los esperados por el entorno.
- Baseline para investigación en optimización evolutiva de políticas: los 28 parámetros y el registro completo de semillas y hashes permiten reproducir el experimento y comparar variantes del algoritmo (sigma inicial, rotación de semillas, velocidad adaptativa).
- Evaluación de robustez ante semillas: el conjunto de 40 semillas de validación y 20 de retención sirve como banco de pruebas para medir la varianza de una política de control antes de desplegarla en simulación.
- Docencia en aprendizaje por refuerzo y métodos de búsqueda directa: el tamaño reducido del modelo y su licencia de uso en simulación lo hacen adecuado para prácticas donde se compare evolución de parámetros frente a gradientes de política.
- Integración en pipelines de simulación a gran escala: al ejecutarse en CPU con ONNX, se pueden lanzar cientos de instancias en paralelo sin ocupar GPU, útil para barridos de hiperparámetros del propio entorno.
- Verificación de procedencia en flujos de publicación de modelos: el manifiesto con hashes encadenados (política, evaluación, guard de desarrollo) sirve como ejemplo de trazabilidad para repositorios de políticas de robótica.

## Benchmarks y rendimiento

Los datos disponibles son métricas de la propia arena, no benchmarks estándar de NLP:

| Métrica | Valor |
|---|---|
| Puntuación oficial (tiempo, s) | 13,647 |
| Media final en 50 semillas (s) | 13,6218 |
| Éxitos en desarrollo | 40/40 |
| Éxitos en retención | 20/20 |
| Puntuación en guard de desarrollo | 13,824 |
| Entrega anterior, puntuación oficial (s) | 14,614 |
| Entrega anterior, media final (s) | 14,1344 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia exclusivamente en CPU mediante runtime ONNX; no requiere VRAM.
- No necesita GPU dedicada; funciona en cualquier CPU x86 o ARM con soporte ONNX Runtime.
- Cabe en cualquier equipo de consumo, incluidos portátiles de gama baja y dispositivos embebidos.
- Despliegue mediante ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput no disponibles en la información proporcionada; al tratarse de 28 parámetros y una pasada por paso, se espera un coste despreciable frente al de la simulación.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Puntuación oficial | Licencia |
|---|---|---|---|---|---|
| Duck Skill Sock Heist R2 (este) | Política de control ONNX | 28 | 61 observaciones | 13,647 s | No disponible |
| Entrega anterior (SHA `b25e241c...`) | Política de control ONNX | No disponible | 61 observaciones | 14,614 s | No disponible |
| Política donante (`policy.onnx`) | Política de control ONNX | No disponible | 61 observaciones | No disponible | No disponible |

No se dispone de información sobre otras políticas comparables de la Arena en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo altamente específico: solo resuelve la tarea sock-heist-6m en el simulador MicroDuck; no es reutilizable para otras tareas de robótica sin reentrenamiento.
- Las puntuaciones locales son indicativas; el resultado oficial lo determina la Arena, y la propia model card exige evaluación oficial final (`requires_final_official_evaluation: true`).
- La mejora respecto a la entrega anterior es pequeña (aproximadamente 1 segundo de tiempo oficial) y podría no ser estadísticamente significativa fuera de las semillas evaluadas.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución del fichero ONNX.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el modelo no procesa lenguaje natural; esos riesgos no aplican, pero tampoco se han documentado análisis de robustez ante perturbaciones físicas.
- La procedencia depende de hashes concretos; cualquier modificación del fichero ONNX invalida la cadena de verificación y la comparación con la entrega anterior.
- No se documentan límites de generalización a cambios en el entorno de simulación (fricción, velocidad, semillas fuera del rango 1001-1120).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyClaw/duck-skill-20261106-r2-sock-heist-6m
- Evento de la Arena (sock-heist-6m): https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/sock-heist-6m
