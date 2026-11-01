# HlibPlakhtii/microduck-sprint-quicksilver-v2

## Resumen

microduck-sprint-quicksilver-v2 es una política de control robótico en formato ONNX publicada por HlibPlakhtii, concebida como un remix de competición para el entorno de simulación MicroDuck Arena de Pollen Robotics. El modelo parte de rumezhak/microduck-sprint-remix-leader6 mediante fine-tuning y añade una capa de búsqueda de secuencias de objetivos articulares optimizada con CMA-ES separable. No es un modelo de lenguaje: es una política de locomoción para un robot cuadrúpedo simulado, empaquetada como grafo ONNX con operadores preservados del modelo original.

El problema que aborda es la optimización de una política de marcha en un entorno de evaluación concreto: el autor identifica las posiciones iniciales de evaluación declaradas y busca una secuencia de acciones que minimice el tiempo de recorrido. El resultado reportado es una media de 0,819 s sobre cinco arranques locales, con 5 de 5 finalizaciones a una velocidad de consigna de 0,2 m/s. Se trata, por tanto, de una política ajustada in-sample al evaluador, no de un controlador generalista.

Su relevancia es acotada pero ilustrativa: muestra cómo los formatos de competición en robótica simulada permiten estrategias de búsqueda dirigida sobre grafos ONNX, y sirve como referencia metodológica sobre los límites entre optimización legítima y sobreajuste al banco de evaluación. El repositorio ocupa 0,0 GB según HuggingFace, lo que sugiere un artefacto de tamaño muy reducido, coherente con una política de control y no con un modelo neuronal de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control robótico en grafo ONNX; fallback network y operadores originales preservados, con lookup de observaciones añadido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a políticas de control) |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye como ONNX |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX; artefactos auxiliares `search_race.py`, `search-config.json`, `searched-actions.npz`, `local-verification.json` |

## Arquitectura y entrenamiento

La política hereda la arquitectura del modelo base rumezhak/microduck-sprint-remix-leader6, un controlador para el robot MicroDuck en simulación. Sobre ese grafo se añade un mecanismo de lookup: cuando las observaciones registradas coinciden con las de entrada, se reproduce una secuencia de objetivos articulares previamente buscada; en caso contrario, se delega en el controlador original (fallback network). Los operadores de grafo originales se mantienen intactos, de modo que la modificación es aditiva y no altera la topología base.

La secuencia de acciones se optimizó localmente con CMA-ES separable contra el evaluador de MicroDuck Arena sin modificarlo, usando runner versión 5, MuJoCo 3.10.0, ONNX Runtime 1.24.4 y NumPy 2.4.1. No se reporta entrenamiento con datos adicionales, RLHF ni ajuste supervisado convencional: el proceso es una búsqueda de parámetros de acción contra un simulador fijo. El autor declara explícitamente que no se modificaron evaluador, física, datos de leaderboard ni código del servidor, y que el resultado autoritativo es el del servidor de la competición.

## Capacidades

- Generación de comandos de locomoción para el robot MicroDuck en el simulador MicroDuck Arena.
- Reproducción de una secuencia de objetivos articulares optimizada cuando las observaciones de entrada coinciden con las registradas.
- Fallback al controlador original del modelo base para observaciones no coincidentes.
- Ejecución como grafo ONNX con ONNX Runtime 1.24.4.
- Verificación local reproducible mediante los artefactos `search_race.py`, `searched-actions.npz` y `local-verification.json`.
- Superposición de la secuencia almacenada sobre el modelo base fijado mediante las utilidades `Recorder` y `overlay` del script suministrado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio.

## Casos de uso

- Evaluación de políticas en MicroDuck Arena: el modelo se carga como política ONNX y se ejecuta contra el runner versión 5 del espacio de Pollen Robotics para medir tiempo de recorrido a 0,2 m/s.
- Reproducción de experimentos de búsqueda: los artefactos permiten replicar la optimización CMA-ES separable y comparar la secuencia buscada con la del modelo base.
- Estudio de sobreajuste en competiciones simuladas: sirve como caso concreto de política in-sample para analizar la brecha entre resultados locales (0,819 s de media, 5/5 finalizaciones) y el resultado del servidor.
- Análisis de arquitecturas de lookup sobre grafos ONNX: el patrón de preservar operadores originales y añadir una capa de consulta por coincidencia de observaciones es reutilizable en otros controladores.
- Docencia en robótica simulada: permite ilustrar el ciclo completo de optimización de una política de marcha con MuJoCo y ONNX Runtime en un entorno acotado.
- Validación de pipelines de evaluación: el script `search_race.py` y `local-verification.json` permiten comprobar la integridad del entorno (versiones de MuJoCo, ONNX Runtime y NumPy) antes de enviar resultados.
- No es adecuado para despliegue en robot real ni para tareas de control fuera de las posiciones de arranque declaradas.

## Benchmarks y rendimiento

| Métrica | Resultado | Condiciones |
|---|---|---|
| Tiempo medio de recorrido | 0,819 s | Media de cinco arranques locales |
| Tasa de finalización | 5/5 | Cinco arranques locales |
| Velocidad de consigna | 0,2 m/s | Evaluador de MicroDuck Arena |

No se han publicado resultados de benchmarks en la información disponible más allá de la verificación local indicada. El autor señala que el resultado del servidor de la competición es el autoritativo y no se incluye en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB, lo que indica un artefacto de muy pequeño tamaño compatible con CPU.
- GPU recomendadas: no disponible; al ser un grafo ONNX de política de control, la inferencia puede ejecutarse en CPU con ONNX Runtime 1.24.4.
- GPU de consumo: no se especifican requisitos; por tamaño del artefacto, no se anticipa necesidad de GPU dedicada.
- Opciones de despliegue: ONNX Runtime 1.24.4 con MuJoCo 3.10.0 y NumPy 2.4.1, conforme al entorno de verificación declarado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el único dato de rendimiento es el tiempo de recorrido de 0,819 s de media en la tarea de sprint simulada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HlibPlakhtii/microduck-sprint-quicksilver-v2 | Política ONNX con lookup | no disponible | no aplica | 0,819 s media local, 5/5 finalizaciones | Apache 2.0 | HuggingFace |
| rumezhak/microduck-sprint-remix-leader6 | Política ONNX base | no disponible | no aplica | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |
| Otras políticas de MicroDuck Arena | Políticas de control | no disponible | no aplica | no disponible | no disponible | Espacio pollen-robotics/microduck-arena |

No se dispone de datos de benchmarks comparativos entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Política deliberadamente in-sample: el lookup se optimizó para las posiciones de evaluación declaradas, por lo que no constituye una prueba de locomoción generalista.
- Solo simulación: el autor advierte explícitamente que los resultados no implican operación segura en robot real.
- Dependencia de coincidencia de observaciones: fuera de las observaciones registradas se usa el controlador original, con el rendimiento de este último.
- Sin datos de sesgos lingüísticos ni de alucinación por no ser un modelo de lenguaje; el riesgo equivalente es la fragilidad ante variaciones del entorno no contempladas en la búsqueda.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base y los créditos de autores upstream deben respetarse según lo indicado en su model card.
- El resultado autoritativo es el del servidor de la competición; la media local de 0,819 s no debe presentarse como rendimiento oficial.
- No se declaran idiomas soportados ni capacidades de texto, por lo que no debe emplearse en tareas de NLP.
- El repositorio figura con 0,0 GB y 21 descargas, sin likes, lo que limita la evidencia externa sobre su reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HlibPlakhtii/microduck-sprint-quicksilver-v2
- Modelo base: https://huggingface.co/rumezhak/microduck-sprint-remix-leader6/tree/bea0b3ef0be8c15d687d98767a060581651da75c
- Evaluador MicroDuck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena/tree/main
