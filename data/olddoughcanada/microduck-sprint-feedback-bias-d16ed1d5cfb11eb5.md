# olddoughcanada/microduck-sprint-feedback-bias-d16ed1d5cfb11eb5

## Resumen

`olddoughcanada/microduck-sprint-feedback-bias-d16ed1d5cfb11eb5` es un artefacto ONNX de política de control para el robot cuadrúpedo Microduck, presentado como variante de un modelo base de la Arena de Microduck para la prueba de sprint de 2 metros. No es un modelo de lenguaje ni un transformador generativo: es una red neuronal de política (perceptrón multicapa) empaquetada en ONNX que mapea 61 observaciones float32 a 14 acciones float32 a 50 Hz. Lo desarrolla el usuario olddoughcanada como fine-tune evolutivo del modelo público `jrubiosainz/microduck-game-sprinter-remix14`, del que elimina las ramas de búsqueda por tabla (lookup) y conserva la red de retroalimentación ordinaria.

El interés técnico del artefacto es acotado pero concreto: demuestra una búsqueda de parámetros con estrategia de evolución (CEM, 8 generaciones × 16 candidatos) sobre exactamente seis entradas del sesgo `mlp.6.bias`, con cotas de ±[0.06, 0.09, 0.06, 0.06, 0.09, 0.06] rad, manteniendo el resto de pesos, el normalizador y los nueve nodos del grafo byte a byte idénticos al original. El autor reporta una mejora local de 0,008 s (0,907 s frente a 0,915 s) en un barrido de 33 ejecuciones con 5/5 éxitos a velocidad comandada de 0,65 m/s.

Es relevante no por su rendimiento absoluto, sino como ejemplo de metodología: búsqueda evolutiva de bajo dimensionalidad sobre un artefacto ya entrenado, con trazabilidad de hashes y preservación de la ascendencia de créditos (suraj-phanindra, a1rb4Ck, rumezhak, HlibPlakhtii, nikghodki, jrubiosainz, Pollen Robotics). El propio autor advierte de que el resultado es local, que la calibración golden no ha pasado y que no se ha establecido equivalencia con el servidor de la Arena.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) en grafo ONNX, 9 nodos de red neuronal + normalizador embebido; sin ramas de lookup |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 floats por paso) |
| Tipos de cuantización | no disponible (pesos en float32) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (float32) |

Especificaciones adicionales de interfaz:

| Parámetro | Valor |
|---|---|
| Entrada | `obs`: float32 [1, 61] |
| Salida | `actions_fb`: float32 [1, 14] |
| Frecuencia de control | 50 Hz (paso de 5 ms) |
| Normalizador | embebido dentro del ONNX |
| Aplicación de acción | pose por defecto más acción × 1 rad |
| Sesgo modificado | `mlp.6.bias`, columnas conjuntas 2, 3, 4, 11, 12, 13 |
| Cotas del sesgo | ±[0.06, 0.09, 0.06, 0.06, 0.09, 0.06] rad |
| Tamaño del repo | 0,0 GB |
| Modelo base | jrubiosainz/microduck-game-sprinter-remix14 (commit e9a74fa) |
| Librería | onnx |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura es una red de política de retroalimentación ordinaria extraída de la clausura de dependencias de `actions_fb` del modelo padre. Consta de nueve operadores de red neuronal y normalizador, con diez inicializadores copiados byte a byte del artefacto fuente. Respecto al padre se eliminaron las cuatro ramas de búsqueda por observación (40 operadores y 24 inicializadores asociados), de modo que la política resultante es puramente reactiva sobre las 61 observaciones de entrada, sin tablas de coincidencia exacta de observaciones ni capas de override.

El entrenamiento no es un nuevo proceso de PPO ni un entrenamiento desde cero: se realizaron cero actualizaciones PPO. La modificación se produjo mediante búsqueda evolutiva de parámetros con CEM (8 generaciones × 16 candidatos), evaluando cada candidato sobre las semillas oficiales 1 a 5 a vx 0,65 m/s, con la penalización oficial de fallo de 50 s en la media y desempate a favor del fuente original. Un candidato seleccionado se congeló antes de su evaluación original de 33 ejecuciones. El ONNX final se reconstruye de forma byte-exacta a partir del fuente y los seis números, aplicando el mismo sesgo constante tanto durante la preparación no cronometrada de 0,5 s como en la carrera cronometrada. No se añadió reloj, contador, clasificador de semilla, lookup, observación extra ni controlador externo.

## Capacidades

- Control locomotor de sprint de 2 metros para el robot Microduck en simulación, a velocidad comandada de 0,65 m/s.
- Política reactiva pura: mapea observaciones de 61 dimensiones a 14 acciones de articulación a 50 Hz.
- Inferencia determinista en ONNX con normalizador integrado, sin dependencias de estado externo.
- Ejecución sobre semillas oficiales conocidas (1 a 5) con 5/5 de éxito local reportado.
- Compatible con el runner de la Arena de Microduck (versión 5) en x86-64 Linux.
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- Sin capacidades multilingües: no procesa lenguaje.

## Casos de uso

- Evaluación de metodologías de búsqueda evolutiva: sirve como caso reproducible de optimización de bajo dimensionalidad (6 parámetros) sobre un artefacto ya entrenado, con cotas explícitas y trazabilidad de hashes para estudiar cómo pequeñas perturbaciones de sesgo afectan al tiempo de sprint.
- Investigación en robótica de locomoción simulada: permite analizar la contribución de un sesgo constante compartido entre fase de preparación y carrera sobre el comportamiento de la política, sin añadir estado ni controladores externos.
- Benchmarking de artefactos ONNX en pipelines de robótica: al ser un grafo pequeño con interfaz fija [1,61] → [1,14], se integra en pruebas automatizadas de latencia y determinismo dentro de entornos de simulación.
- Reproducción de linajes de modelos: la preservación byte a byte de pesos, normalizador y nodos permite auditar la ascendencia y verificar que solo seis entradas de sesgo difieren del padre.
- Estudio de equivalencia local-servidor: útil para contrastar mediciones locales (0,907 s en 33 ejecuciones) frente a la medición independiente del servidor de la Arena, un problema recurrente en competiciones de simulación.
- Docencia en optimización de políticas: ejemplo didáctico de CEM con presupuesto pequeño (8×16 evaluaciones), penalización de fallo y congelación de candidato antes de la validación final.
- Análisis de ablación: al eliminar las ramas de lookup, permite comparar una política puramente reactiva con variantes basadas en tablas de coincidencia de observaciones.

## Benchmarks y rendimiento

Los únicos datos disponibles son mediciones locales del autor, no benchmarks públicos estandarizados ni resultados validados por el servidor.

| Métrica | Valor reportado | Condiciones |
|---|---|---|
| Tiempo de sprint, red de retroalimentación ordinaria | 0,915 s | 5/5 local, vx comandada 0,65 m/s |
| Tiempo de sprint, este candidato (barrido completo de 33 ejecuciones) | 0,907 s | 5/5, vx comandada 0,65 m/s; mejora de 0,008 s |
| Semillas de optimización | 1–5 | Datos de optimización (in-sample) |
| Actualizaciones PPO | 0 | Búsqueda evolutiva, no entrenamiento PPO |
| Resultado de la Arena (servidor) | no disponible | Equivalencia con servidor no establecida |
| Calibración golden | no superada | Según el autor |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks equivalentes, ya que el modelo no es lingüístico. La cifra de 0,817 s del padre con lookup no corresponde a esta red y el autor lo indica explícitamente.

## Requisitos de hardware

- VRAM estimada: mínima; el grafo es un MLP pequeño con entrada de 61 floats y salida de 14 floats, no disponible la cifra exacta de parámetros. Cabe holgadamente en cualquier GPU con unos pocos cientos de MB libres, e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) o CPU moderna es suficiente para inferencia a 50 Hz.
- Cabe en GPU consumer: sí, en cualquier modelo actual y en la mayoría de sistemas embebidos con soporte ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (recomendado por el formato), así como los runners de la Arena de Microduck (versión 5) en x86-64 Linux. No aplica vLLM, llama.cpp, Ollama ni TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles cifras explícitas; la frecuencia de control del entorno es de 50 Hz (paso de 5 ms), por lo que la inferencia debe completarse dentro de esa ventana. El autor no reporta latencia por llamada.
- Requisito de plataforma: el autor midió en x86-64 Linux con el runner versión 5.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Tiempo reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (feedback-bias) | MLP ONNX, sin lookup | [1,61] → [1,14] | 0,907 s (local, 33 ejecuciones) | Apache-2.0 | Hugging Face |
| jrubiosainz/microduck-game-sprinter-remix14 | MLP + 3 capas de lookup | [1,61] → [1,14] | 0,817 s en semillas 1–5 (in-sample, padre con lookup) | Apache-2.0 | Hugging Face |
| nikghodki/microduck-sprint-lookup-v1 | MLP + lookup | [1,61] → [1,14] | 0,818 s | Apache-2.0 | Hugging Face |
| Red de retroalimentación ordinaria (ablación del padre) | MLP ONNX, sin lookup | [1,61] → [1,14] | 0,915 s (local, 5/5) | Apache-2.0 | Derivada en este paquete |

La comparación es de tiempos de sprint en simulación sobre semillas oficiales, no de rendimiento lingüístico. Las cifras de los padres con lookup corresponden a artefactos distintos y no son directamente atribuibles a esta red.

## Limitaciones y advertencias

- Resultado local: la calibración golden no ha pasado y no se ha establecido equivalencia con el servidor de la Arena; la cifra de 0,907 s no está validada externamente.
- Sobreajuste a semillas de optimización: las semillas 1–5 se usaron como datos de optimización, por lo que la mejora de 0,008 s es in-sample y puede no generalizar.
- Sin validación en robot real: no se reclama ningún resultado de marcha general ni de robot físico.
- Alcance limitado: no es un nuevo resultado de entrenamiento PPO (0 actualizaciones) ni una red entrenada desde cero; es búsqueda evolutiva de parámetros.
- No hereda el trabajo 1199/Hannes del autor, según se indica en la model card.
- La cifra de 0,817 s del padre con lookup no es la puntuación de esta red y no debe atribuírsele.
- Sin sesgos sociales conocidos por no procesar lenguaje, pero el comportamiento locomotor está condicionado a la distribución de semillas y condiciones de simulación.
- Riesgo de alucinación no aplicable (no genera texto); el riesgo análogo es la extrapolación indebida de resultados locales a otros entornos o hardware.
- Licencia Apache-2.0 permite uso comercial, pero se deben preservar los avisos de atribución y la ascendencia de créditos incluidos en los archivos del paquete.
- Dependencia de la versión del runner (versión 5, x86-64 Linux) para reproducir las mediciones.
- Tamaño de repo reportado de 0,0 GB: verificar la integridad de los archivos al descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olddoughcanada/microduck-sprint-feedback-bias-d16ed1d5cfb11eb5
- Modelo base (remix14): https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14/tree/e9a74fa9a55e00f972e87d158f40db660a54be91
- Modelo antecesor con lookup: https://huggingface.co/nikghodki/microduck-sprint-lookup-v1/tree/e963635b00c76db3d00381b434c8396315045145
- Arena de Microduck (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
