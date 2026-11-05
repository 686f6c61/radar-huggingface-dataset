# poplolioi11/deep-rl-unit5-pyramids-20261105

## Resumen

`deep-rl-unit5-pyramids-20261105` es una política de inferencia entrenada con PPO y Random Network Distillation (RND) para el entorno Unity ML-Agents Pyramids, el ejercicio práctico de la unidad 5 del curso Deep Reinforcement Learning de Hugging Face. Lo publica Chen-Yu Chu bajo la cuenta `poplolioi11` como entrega reproducible del citado ejercicio, con un total de 1.000.121 pasos de entrenamiento del agente frente a un presupuesto declarado de 1.000.000, partiendo de cero y sin pesos preentrenados de terceros.

No es un modelo de lenguaje: es un artefacto de reinforcement learning profundo empaquetado como política ONNX de solo inferencia. Su relevancia es acotada pero clara para quien siga el curso o quiera verificar el flujo completo de entrenamiento, evaluación y empaquetado en ML-Agents con la versión 1.5.0 del comunicador Python/Unity y el paquete 2.2.1-exp.1.

El repositorio ocupa 0,0 GB, no tiene descargas ni likes, y la model card documenta explícitamente el proceso de evaluación sobre semillas 50000–50009 con 100 episodios completados, así como las limitaciones de autoría (implementación asistida por IA bajo autorización del autor, sin evaluación de dominio humano independiente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para PPO con módulo auxiliar RND (ML-Agents) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observaciones del entorno Pyramids) |
| Tipos de cuantizacion | no disponible (pesos ONNX en precisión original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`Pyramids.onnx`) con `config.json` de firmas de entrada/salida |

## Arquitectura y entrenamiento

La política se entrena con Proximal Policy Optimization (PPO) combinado con Random Network Distillation (RND), una técnica de exploración basada en recompensa intrínseca que premia al agente por visitar estados cuya predicción por una red aleatoria fija resulta difícil. El entrenamiento acumuló 1.000.121 pasos de agente frente al presupuesto declarado de 1.000.000, inicializado desde cero sin pesos de terceros. El checkpoint privado se verificó en cuanto a paso global real, módulos RND y configuración de entrenamiento registrada.

La evaluación se realizó con el checkpoint final congelado antes de medir, sobre semillas 50000–50009 con 100 episodios de agente completados (diez por semilla). Antes de cualquier holdout se registró una enmienda de ejecución que elevó el límite de ticks Unity por semilla de 10.000 a 100.000 para acomodar episodios largos; las semillas, el recuento mínimo de terminales, la recompensa y la selección de checkpoint no se modificaron. El paquete incluye `evaluation.json` y `episodes.csv` con los registros crudos por episodio, `provenance.json` con los hashes originales y públicos del ONNX, y `config.json` con las firmas de entrada/salida. No se incluyen el código fuente de entrenamiento, los checkpoints de optimizador/PyTorch, los binarios del player, los logs ni credenciales.

## Capacidades

- Control de agente en el entorno Unity ML-Agents Pyramids mediante política de inferencia ONNX.
- Inferencia determinista sobre el layout original de observaciones y acciones del entorno Pyramids.
- Integración con el comunicador Python/Unity ML-Agents API 1.5.0 y el paquete 2.2.1-exp.1.
- Compatible con la demo oficial de Hugging Face Spaces `unity/ML-Agents-Pyramids`.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, visión, audio ni capacidades multilingües: es una política de RL específica de tarea.

## Casos de uso

- Reproducción del ejercicio de la unidad 5 del curso Deep RL de Hugging Face: sirve como referencia de solución entrenada y evaluada para comparar con la implementación propia del estudiante.
- Docencia y estudio de PPO con RND: permite inspeccionar una política entrenada con recompensa intrínseca y contrastar curvas de aprendizaje con la métrica declarada.
- Verificación de pipelines ML-Agents: útil para validar la integración entre el comunicador Python/Unity 1.5.0, el paquete 2.2.1-exp.1 y un modelo ONNX de solo inferencia.
- Demo interactiva en Hugging Face Spaces: se puede cargar en la demo oficial `unity/ML-Agents-Pyramids` para observar el comportamiento del agente sin reentrenar.
- Base para experimentos de ablación: al estar la política congelada y documentada, sirve como línea base frente a variantes sin RND o con otros hiperparámetros.
- Auditoría de reproducibilidad: los ficheros `evaluation.json`, `episodes.csv` y `provenance.json` permiten replicar el análisis estadístico y comprobar la integridad del ONNX publicado.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente; `verified: false`).

| Metrica | Valor |
|---|---|
| Tarea | Reinforcement Learning |
| Entorno / dataset | ML-Agents-Pyramids |
| Retorno medio por episodio (nativo Unity, sin bonus RND) | 1,7518500171 |
| Desviación estándar poblacional (ddof=0) | 0,0869417648 |
| Media menos desviación estándar | 1,6649082523 |
| Episodios evaluados | 100 (10 por semilla, semillas 50000–50009) |

El propio autor advierte que la media supera por poco el objetivo ilustrativo de 1,75 del tutorial y que esto no establece superioridad robusta ni competencia humana independiente; la certificación oficial es un proceso aparte y no se reclama.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del ONNX no se detalla en la información proporcionada.
- GPU recomendadas: no disponible; al ser una política de RL de un entorno Unity, la inferencia puede ejecutarse en CPU, pero no se especifican requisitos.
- ¿Cabe en GPU de consumo? No disponible; previsiblemente sí dado el tamaño típico de políticas ML-Agents, pero no se confirma con datos.
- Opciones de despliegue: runtime ONNX (ONNX Runtime u otro compatible) integrado con el comunicador Python/Unity ML-Agents API 1.5.0; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas comparables del mismo entorno ni resultados de referencia de terceros para ML-Agents-Pyramids.

## Limitaciones y advertencias

- Política de solo inferencia para el layout original de Pyramids; no es reutilizable en otros entornos sin reentrenamiento.
- Métricas declaradas por el autor con `verified: false`; no hay certificación oficial ni validación independiente.
- La media de retorno (1,7518) supera por poco el objetivo ilustrativo de 1,75; el autor descarta explícitamente superioridad robusta o competencia humana.
- Desviación estándar poblacional, no intervalo de confianza; los episodios están agrupados en diez instancias semilla/runtime.
- Enmienda registrada del límite de ticks por semilla (10.000 → 100.000) antes del holdout; los registros originales y la enmienda se conservan solo para revisión privada.
- Implementación, orquestación, evaluación y empaquetado con asistencia de IA bajo autorización de Chen-Yu Chu; no se evaluó dominio humano independiente de los algoritmos.
- No se incluyen código de entrenamiento, checkpoints de optimizador/PyTorch, binarios del player, logs ni credenciales; la receta completa de entrenamiento es privada.
- Licencia MIT sobre pesos de inferencia, datos de evaluación, configuración mínima y documentación; no relicencia Unity, ML-Agents, PyTorch ni los assets del entorno, que no se incluyen.
- Sin descargas ni likes en el momento de la consulta; sin señales de adopción comunitaria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/poplolioi11/deep-rl-unit5-pyramids-20261105)
- [Ejercicio oficial Unidad 5 y objetivo ilustrativo](https://huggingface.co/learn/deep-rl-course/unit5/hands-on)
- [Entorno oficial Pyramids (Space)](https://huggingface.co/spaces/unity/ML-Agents-Pyramids)
- [Unity ML-Agents (GitHub)](https://github.com/Unity-Technologies/ml-agents)
