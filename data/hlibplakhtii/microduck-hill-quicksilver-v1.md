# HlibPlakhtii/microduck-hill-quicksilver-v1

## Resumen

microduck-hill-quicksilver-v1 es una política de control robótico en formato ONNX publicada por HlibPlakhtii, derivada por fine-tuning de a1rb4Ck/microduck-hill-1m5. No es un modelo de lenguaje: es un controlador para el robot cuadrúpedo educativo Microduck de Pollen Robotics, orientado a la competición de simulación Microduck Arena. El repositorio tiene un tamaño de 0,0 GB según Hugging Face, lo que indica un artefacto de pesos muy pequeño, coherente con una política de control y no con un transformer de gran escala.

La aportación técnica consiste en una tabla de búsqueda de observaciones ("observation lookup") que se añade sobre la red original: cuando las observaciones registradas coinciden, el modelo reproduce una secuencia de consignas articulares previamente optimizada; en caso contrario, delega en el controlador original (fallback network) y conserva todos los operadores de grafo originales. La secuencia se optimizó con CMA-ES separable contra el evaluador oficial del Arena (runner v5, MuJoCo 3.10.0, ONNX Runtime 1.24.4, NumPy 2.4.1).

Es relevante ahora por su carácter explícitamente in-sample y de simulación: el autor declara un resultado local de 0,740 s de media en cinco arranques, con 5/5 finalizaciones a una consigna de 0,15 m/s, y advierte de que no constituye una reivindicación de locomoción general ni de operación segura en robot real. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control robótico exportada a ONNX con red de fallback y tabla de búsqueda de observaciones |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Modelo base | a1rb4Ck/microduck-hill-1m5 (fine-tuning) |
| Librería | microduck |
| Pipeline | robotics |
| Tamaño del repositorio | 0,0 GB |
| Entorno de evaluación | MuJoCo 3.10.0, ONNX Runtime 1.24.4, NumPy 2.4.1, runner v5 del Microduck Arena |

## Arquitectura y entrenamiento

El modelo parte de la política a1rb4Ck/microduck-hill-1m5 y la modifica mediante una capa de lookup sobre las observaciones de entrada. La red de fallback y todos los operadores de grafo originales se preservan intactos; la única adición es una consulta de observación que, cuando coincide con las observaciones registradas, reproduce una secuencia de objetivos articulares ("joint-target sequence") previamente buscada. Para el resto de observaciones, el comportamiento es el del controlador original.

El entrenamiento de la nueva secuencia no es un entrenamiento neuronal convencional: se trata de una optimización de parámetros con CMA-ES separable ejecutada localmente contra el evaluador del Microduck Arena sin modificar (runner versión 5, MuJoCo 3.10.0, ONNX Runtime 1.24.4, NumPy 2.4.1). El autor indica que no se alteró ningún evaluador, física, dato de leaderboard ni código de servidor. Se proporcionan artefactos de reproducción: `search_race.py`, `search-config.json`, `searched-actions.npz` y `local-verification.json`, además de un script con `Recorder` y `overlay` para superponer la secuencia sobre el modelo base fijado.

## Capacidades

- Control de locomoción del cuadrúpedo Microduck en el simulador MuJoCo, con consigna de velocidad de 0,15 m/s en la evaluación declarada.
- Reproducción determinista de una secuencia de objetivos articulares cuando las observaciones coinciden con las registradas en la tabla de búsqueda.
- Fallback al controlador original de microduck-hill-1m5 para observaciones no coincidentes, manteniendo la cobertura de comportamiento del modelo base.
- Exportación e inferencia en ONNX Runtime, lo que permite ejecución portable fuera del stack de PyTorch.
- Integración con el runner del Microduck Arena para evaluación y con scripts de reproducción con grabación y superposición.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Participación en la competición Microduck Arena: la política está diseñada para los arranques de evaluación declarados y puede enviarse al servidor del Arena, cuyo resultado es el autoritativo. Es adecuada porque la secuencia se optimizó directamente contra el runner v5 sin modificar el evaluador.
- Reproducción de resultados de investigación: los artefactos `search_race.py`, `search-config.json` y `searched-actions.npz` permiten reejecutar la búsqueda y verificar el resultado local de 0,740 s de media con 5/5 finalizaciones.
- Estudio de optimización con CMA-ES separable en políticas de control: sirve como caso concreto de búsqueda de parámetros contra un evaluador de simulación fijo, con configuración y semillas documentadas.
- Análisis de estrategias de lookup frente a redes neuronales puras: útil para comparar el coste y el rendimiento de una tabla de observaciones frente a un controlador aprendido, dado que el fallback se conserva.
- Despliegue en pipelines ONNX ligeros para simulación: al ser un artefacto ONNX con runtime estándar (ONNX Runtime 1.24.4), puede integrarse en entornos de simulación sin dependencias de frameworks de deep learning pesados.
- Docencia y divulgación sobre limitaciones de políticas in-sample: el modelo documenta explícitamente su carácter de simulación y sirve para ilustrar el riesgo de sobreajuste a los arranques de evaluación declarados.

## Benchmarks y rendimiento

| Métrica | Resultado | Condiciones |
|---|---|---|
| Tiempo medio local (5 arranques) | 0,740 s | Consigna 0,15 m/s, runner v5, MuJoCo 3.10.0 |
| Tasa de finalización local | 5/5 | Mismos cinco arranques declarados |
| Resultado en servidor | no disponible | El autor indica que el resultado del servidor es el autoritativo |

No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto de pesos muy reducido.
- GPU recomendadas: no disponibles en la información proporcionada; la inferencia se realiza con ONNX Runtime 1.24.4 y no se especifica hardware objetivo.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del artefacto es plausible que quepa en GPU de consumo, pero no hay dato publicado que lo verifique.
- Opciones de despliegue: ONNX Runtime (versión validada 1.24.4), junto con MuJoCo 3.10.0 y NumPy 2.4.1 para el entorno de simulación del Arena.
- Latencia y throughput: no disponibles; solo se publica el tiempo de finalización de la tarea (0,740 s de media), no latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Formato | Licencia | Contexto | Resultado publicado |
|---|---|---|---|---|---|---|
| microduck-hill-quicksilver-v1 | Política de control con lookup | a1rb4Ck/microduck-hill-1m5 | ONNX | Apache 2.0 | no aplica | 0,740 s medio, 5/5 finalizaciones (local) |
| a1rb4Ck/microduck-hill-1m5 | Política de control | no disponible | no disponible | no disponible | no aplica | no disponible |
| Políticas del Microduck Arena (otras entradas) | Políticas de control | diversas | mayoritariamente ONNX | diversas | no aplica | no disponible |

No se dispone de datos de benchmarks comparables de otras políticas del Arena en la información proporcionada, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Política in-sample: la tabla de lookup se optimizó para los arranques de evaluación declarados; no hay garantía de generalización a otras condiciones iniciales, perturbaciones o terrenos.
- Solo simulación: el autor advierte explícitamente de que los resultados no constituyen una reivindicación de locomoción de propósito general ni de operación segura en un robot real.
- Riesgo de sobreajuste al evaluador: al optimizar contra el runner v5 con MuJoCo 3.10.0, cambios de versión del evaluador, de la física o del runner pueden invalidar el comportamiento de la secuencia buscada.
- Dependencia de coincidencia exacta de observaciones: fuera de las observaciones registradas, el modelo recurre al controlador base, por lo que el rendimiento en esas condiciones es el del modelo original, no el reportado.
- Sin datos de sesgos, alucinación o multilingüismo aplicables: no es un modelo de lenguaje, por lo que esas categorías de riesgo no aplican; el riesgo relevante es el fallo de control en simulación.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; deben respetarse las condiciones de la licencia y la atribución a a1rb4Ck y a los autores upstream identificados en la model card del modelo base.
- Resultado autoritativo en servidor: el 0,740 s es una verificación local; el resultado del servidor del Arena puede diferir y es el que prevalece.
- Sin métricas de robustez: no se publican evaluaciones con ruido, dominios aleatorizados ni pruebas de estrés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-hill-quicksilver-v1
- Modelo base: https://huggingface.co/a1rb4Ck/microduck-hill-1m5/tree/f9853ed64ac9400638bdcb0e022a47b08ec99b05
- Evaluador del Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena/tree/main
