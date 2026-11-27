# alexhegit/microduck-sitstand

## Resumen

Microduck-sitstand es una política de control para el robot caminante Microduck, publicada por el usuario alexhegit en Hugging Face. No se trata de un modelo de lenguaje, sino de un controlador neuronal entrenado con aprendizaje por refuerzo (PPO) que recibe 61 observaciones y emite 14 objetivos de posición articular a 50 Hz. Su función concreta es ejecutar la orden de sentarse o levantarse: el primer componente del vector de acciones (`twist[0]`) actúa como bandera binaria (1 para sentarse, 0 para levantarse).

El modelo se presenta como candidato al evento `got-a-talent` de la Microduck Arena, un espacio de Hugging Face organizado por Pollen Robotics para políticas de control de este robot. El entrenamiento se realizó en MuJoCo mediante el framework `microduck_rl_unilab`, sobre una GPU AMD con ROCm, lo que lo convierte en un ejemplo de flujo de RL robótico ejecutado íntegramente en hardware no NVIDIA.

Su relevancia es acotada y muy específica: es un artefacto de investigación para robótica de bajo coste, distribuido en formato ONNX con licencia Apache 2.0. No dispone de descargas ni interacciones registradas, y el repositorio no contiene pesos en otros formatos ni documentación adicional más allá de la model card. No debe confundirse con un modelo generativo: no procesa lenguaje ni imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control robótico (entrenada con PPO); topología de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores por paso |
| Tipos de cuantizacion | no disponible; pesos distribuidos en ONNX |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, dimensiones ocultas ni función de activación). Lo que sí se especifica es la interfaz: entrada de 61 observaciones, salida de 14 objetivos de posición articular, frecuencia de control de 50 Hz. El primer elemento de la acción, `twist[0]`, funciona como bandera de sentarse/levantarse, lo que sugiere una política de condicionamiento por comando integrada en el propio vector de observación o acción.

El entrenamiento se realizó con Proximal Policy Optimization (PPO) en el simulador MuJoCo, usando el framework `microduck_rl_unilab`, sobre una GPU AMD con ROCm. No se especifican el número de pasos de entorno, la composición de recompensas, el dominio de aleatorización ni el proceso de transferencia del simulador al robot real (sim-to-real). Tampoco se documenta si hubo destilación, regularización o ajuste fino posterior.

## Capacidades

- Control locomotor específico de sentarse y levantarse para el robot Microduck, activado por la bandera `twist[0]`.
- Generación de 14 objetivos de posición articular a 50 Hz, adecuados para un bucle de control de baja latencia.
- Ejecución en formato ONNX, lo que permite inferencia con ONNX Runtime en CPU o GPU.
- Integración potencial con el ecosistema de la Microduck Arena para evaluación comparativa de políticas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto, imagen ni audio; su única modalidad de entrada es el vector de observaciones del robot.

## Casos de uso

- Demostración de habilidades en la Microduck Arena: la política se puede cargar en el espacio de evaluación de Pollen Robotics para el evento `got-a-talent` y comparar su ejecución de sentarse/levantarse con otras políticas participantes.
- Investigación en aprendizaje por refuerzo sim-to-real: sirve como referencia de un pipeline PPO en MuJoCo con despliegue ONNX, útil para replicar el flujo en otros robots de bajo coste.
- Pruebas de control a 50 Hz en hardware embebido: al ser una red pequeña en ONNX, puede ejecutarse en una SBC o en la propia electrónica del robot para validar latencias de bucle cerrado.
- Benchmark de entrenamiento en ROCm: el modelo documenta un caso real de entrenamiento de RL en GPU AMD, útil para equipos que evalúan alternativas a CUDA en robótica.
- Base para composición de habilidades: al estar condicionada por una bandera binaria, puede integrarse en un selector de políticas de más alto nivel que alterne entre caminar, sentarse y levantarse.
- Docencia en robótica y RL: su interfaz simple (61 entradas, 14 salidas, una bandera) lo hace adecuado como ejemplo didáctico de política condicionada por comando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, lo que indica un modelo de tamaño muy reducido, probablemente ejecutable en CPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una GPU AMD con ROCm, pero no se indica el modelo concreto.
- Cabe en GPU de consumo: no confirmado, pero el tamaño del repositorio sugiere que sí; no se puede afirmar sin conocer el número de parámetros.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) es la vía natural dado el formato de pesos; no se documentan exportaciones a TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la frecuencia de control objetivo es 50 Hz, lo que implica un presupuesto de 20 ms por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/Salida | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alexhegit/microduck-sitstand | Política de control robótico | 61 obs / 14 acciones a 50 Hz | PPO en MuJoCo, ROCm | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas de la Microduck Arena | Políticas de control robótico | no disponible | no disponible | no disponible | Hugging Face Spaces (pollen-robotics/microduck-arena) |
| Políticas de referencia de microduck_rl_unilab | Políticas de control robótico | no disponible | PPO en MuJoCo | no disponible | GitHub (rocPAI-Forge) |

No se dispone de datos de rendimiento de las alternativas citadas, por lo que la comparación se limita a tipo de artefacto, formato y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente específico: solo ejecuta la habilidad de sentarse/levantarse en el robot Microduck; no es reutilizable en otros robots sin reentrenamiento.
- Sin datos de sim-to-real: no se documenta si la política se validó en hardware físico, ni con qué grado de éxito.
- Sin métricas publicadas: no hay tasas de éxito, recompensas medias ni comparaciones cuantitativas con otras políticas.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación externa.
- Documentación mínima: la model card no detalla arquitectura, hiperparámetros, composición del dataset ni proceso de entrenamiento, lo que dificulta la reproducibilidad.
- Riesgo de sobreajuste al simulador: al no documentarse aleatorización de dominio, la transferencia al robot real puede degradarse.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser una política de control para un robot concreto su aplicabilidad comercial es marginal.
- Sin soporte de lenguaje, visión ni audio: no debe evaluarse con criterios de modelos generativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexhegit/microduck-sitstand
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Framework de entrenamiento microduck_rl_unilab: https://github.com/rocPAI-Forge/microduck_rl_unilab
