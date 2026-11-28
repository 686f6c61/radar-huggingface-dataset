# oPalestrinha/microduck-sprint-2m-arena

## Resumen

Microduck Sprint 2m Arena es una política de control para locomoción de un robot cuadrúpedo simulado, derivada mediante ajuste fino local del modelo `HannesVonEssen/microduck-running`. La desarrolla el usuario oPalestrinha y se publica bajo licencia Apache-2.0. No es un modelo de lenguaje: es una política neuronal que mapea 61 observaciones del entorno a 14 acciones de control, empaquetada en ONNX para su ejecución en simulación.

El modelo resuelve un problema concreto: conseguir que el robot recorra una pista de 2 metros en el menor tiempo posible dentro del entorno de simulación Microduck, manteniendo la estabilidad y evitando caídas. El ajuste se realizó con PPO sobre el actor, empleando una recompensa específica de carrera que premia el arranque, el avance, la finalización y penaliza las caídas. El evaluador original no se modificó.

Su relevancia es acotada y experimental: se trata de un checkpoint de investigación (etiquetado "checkpoint 250") con cero descargas y sin validación en hardware físico. Resulta útil como referencia para quienes trabajan en locomoción con aprendizaje por refuerzo en el ecosistema Microduck, pero no debe confundirse con un modelo de propósito general ni con un resultado de leaderboard público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control (actor PPO); arquitectura interna no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política se entrena con PPO (Proximal Policy Optimization) sobre el actor del modelo base `HannesVonEssen/microduck-running`, revisión `9f45af1f4b04252f3aa1f4c056fa7fa0d4b35e4c`. El ajuste fino emplea una función de recompensa específica de carrera que combina cuatro señales: arranque (launch), progreso hacia delante, finalización del recorrido y penalización de caídas. El evaluador del entorno se mantuvo sin cambios, lo que preserva la comparabilidad de la métrica de evaluación.

El artefacto exportado es un grafo ONNX con una interfaz de 61 entradas (observaciones) y 14 salidas (acciones). No se detalla en la información disponible la arquitectura interna de la red (número de capas, dimensión de las capas ocultas, función de activación), el número de parámetros, ni el volumen total de pasos de entrenamiento. Tampoco se indica si se aplicaron técnicas adicionales como normalización de observaciones, curriculum learning o domain randomization.

## Capacidades

- Control de locomoción de un robot cuadrúpedo simulado en el entorno Microduck.
- Ejecución de una carrera de sprint sobre una pista de 2 metros.
- Generación de 14 acciones de control a partir de 61 observaciones del estado del robot y del entorno.
- Inferencia en formato ONNX, apta para ejecutarse con runtimes compatibles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No incorpora modo "thinking" ni ninguna capacidad cognitiva de propósito general.

## Casos de uso

- Evaluación de políticas de locomoción en simulación: se puede cargar `policy.onnx` en el entorno Microduck para reproducir la métrica reportada (1,154 s de media, 5/5 finalizaciones) y comparar contra otras políticas derivadas del mismo modelo base.
- Investigación en aprendizaje por refuerzo: sirve como punto de partida para estudiar cómo una recompensa específica de carrera (arranque, avance, finalización, caídas) moldea el comportamiento del actor frente al modelo original.
- Benchmark interno de sprint: al ser un checkpoint concreto, permite medir la variabilidad de tiempos entre ejecuciones y analizar la robustez de la política ante perturbaciones en la pista de 2 metros.
- Docencia y divulgación: ejemplo compacto y de código abierto (Apache-2.0) de un pipeline completo de ajuste fino con PPO y exportación a ONNX para robótica simulada.
- Base para ajustes posteriores: otros investigadores pueden partir de este checkpoint para entrenar variantes con recompensas distintas (por ejemplo, eficiencia energética o robustez ante terrenos irregulares).
- Integración en pipelines de simulación a gran escala: el formato ONNX permite desplegar la política en entornos de evaluación automatizados sin depender del framework de entrenamiento original.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Tiempo medio en pista de 2 m | 1,154 s | Evaluación local en el Arena de 2 m |
| Tasa de finalización | 5/5 | Evaluación local en el Arena de 2 m |

No se han publicado resultados de benchmarks públicos ni comparaciones con otras políticas en la información disponible. El propio autor advierte que la cifra de 1,154 s no es una puntuación de leaderboard público.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de una política de control de pequeña dimensión exportada a ONNX, la huella de memoria es previsiblemente muy reducida, pero no se especifica.
- GPU recomendadas: no disponibles. La inferencia de una política de este tipo puede ejecutarse en CPU, aunque no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por el tamaño del artefacto (repositorio de 0,0 GB) es plausible, pero no se aporta dato verificable.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) y el entorno de simulación Microduck; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oPalestrinha/microduck-sprint-2m-arena | Política de locomoción (ONNX) | no disponible | no aplica | Apache-2.0 | Hugging Face |
| HannesVonEssen/microduck-running (modelo base) | Política de locomoción | no disponible | no aplica | Apache-2.0 | Hugging Face |
| Otras políticas Microduck | Política de locomoción | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada. La única diferencia documentada es que este modelo es un ajuste fino del base con una recompensa específica de carrera y una métrica local de 1,154 s de media con 5/5 finalizaciones.

## Limitaciones y advertencias

- Solo validado en simulación; no se ha probado en hardware físico, por lo que no hay garantía de transferencia al mundo real (sim-to-real gap).
- La métrica de 1,154 s corresponde a una evaluación local del autor y no a un leaderboard público, por lo que no es directamente comparable con otros resultados.
- Es un checkpoint concreto ("checkpoint 250") de un proceso de ajuste; no se documenta su estabilidad frente a otros checkpoints del mismo entrenamiento.
- No se especifican sesgos, pero al ser una política entrenada con una recompensa concreta puede presentar comportamientos frágiles ante condiciones no vistas durante el entrenamiento.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de texto.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero se debe conservar la atribución al modelo base y los avisos de licencia correspondientes.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB; conviene verificar la integridad del artefacto `policy.onnx` antes de usarlo en producción.
- No se documentan los detalles de arquitectura ni el número de parámetros, lo que dificulta la reproducibilidad completa del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oPalestrinha/microduck-sprint-2m-arena
- Modelo base: https://huggingface.co/HannesVonEssen/microduck-running
- Model card original conservada como `UPSTREAM_MODEL_CARD.md` en el repositorio del modelo.
