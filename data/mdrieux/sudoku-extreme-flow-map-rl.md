# mdrieux/sudoku-extreme-flow-map-rl

## Resumen

`mdrieux/sudoku-extreme-flow-map-rl` es un modelo de investigación publicado por el usuario independiente mdrieux en Hugging Face. No es un modelo de lenguaje general: es un *flow map* discreto de 7,5 millones de parámetros entrenado específicamente para resolver rejillas de Sudoku del dataset `sapientinc/sudoku-extreme`. El modelo condiciona la generación sobre las pistas fijas del tablero y rellena el resto de casillas mediante un proceso iterativo de pocas llamadas a la red, siguiendo la formulación de los Flow Reasoning Models.

Su relevancia es metodológica más que práctica: el autor parte de un modelo preentrenado de forma supervisada (200.000 pasos) y lo afina con *policy gradient* (5.000 pasos) usando una recompensa binaria de validez del tablero. El checkpoint publicado es el resultado final de ese proceso de RL y sirve como evidencia reproducible de que el RL con recompensa verificable mejora un flow map discreto en una tarea combinatoria estricta, pasando de un 23,5 % a un 31,3 % de tableros completamente correctos en el conjunto de test.

La arquitectura es un transformer de anchura 256, profundidad 6 y 8 cabezas de atención, con pesos en formato safetensors. El repositorio no declara licencia, idiomas ni pipeline de inferencia estándar; el uso previsto es la reproducción del experimento mediante el repositorio de código del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (flow map discreto): anchura 256, profundidad 6, 8 cabezas de atencion |
| Parametros totales | 7.517.708 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionada por el tamano de la rejilla de Sudoku, 81 casillas) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 archivos) + `config.json`; script `to_pt.py` para reconstruir un unico checkpoint `.pt` |
| Dataset de entrenamiento | `sapientinc/sudoku-extreme` |
| Pipeline declarado | reinforcement-learning |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

El modelo es un flow map discreto construido sobre un transformer de 6 capas, anchura 256 y 8 cabezas de atencion, con 7,5 millones de parametros. La tarea consiste en mapear un puzzle de Sudoku (con las pistas fijas como condicion) a su solucion completa, generando la rejilla desde ruido puro en 4 llamadas a la red por respuesta. La formulacion sigue la de los Flow Reasoning Models (arXiv 2606.29150), que tratan la generacion como un proceso de transporte entre una distribucion de ruido y la solucion.

El entrenamiento tiene dos fases documentadas en `config.json`. La primera es un preentrenamiento supervisado de 200.000 pasos (batch 128, learning rate 3e-4) sobre 1.000 puzzles del split de entrenamiento de Sudoku-Extreme (semilla 1), aprendiendo a mapear puzzle a solucion. La segunda es un afinado con *policy gradient* de 5.000 pasos (learning rate 3e-5) con recompensa binaria: 1 si la rejilla generada es una solucion valida y 0 en caso contrario. En cada paso se generan 16 respuestas por puzzle desde ruido puro con 4 llamadas a la red, se calcula una linea base como la media de recompensa de las otras 15 respuestas, se muestrean 64 puzzles de entrenamiento y se entrena sobre 16 de ellos, priorizando aquellos cuyas 16 respuestas obtuvieron recompensas distintas (mayor senal de aprendizaje).

## Capacidades

- Resolucion de Sudoku del benchmark Sudoku-Extreme: rellena la rejilla manteniendo fijas las pistas de entrada.
- Generacion desde ruido puro en 4 llamadas a la red por respuesta (32 llamadas para el modo de evaluacion con K=32).
- Generacion estocastica con control de temperatura (la evaluacion publicada usa T=0.1).
- Muestreo multiple tipo pass@K: el script de evaluacion soporta K=32 y permite medir la tasa de acierto entre varias muestras.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues, de vision, audio ni modo *thinking*.
- No es un modelo de proposito general: su unico dominio es la resolucion de rejillas de Sudoku con el formato del dataset de entrenamiento.

## Casos de uso

- Reproduccion de experimentos de RL con recompensa verificable: el checkpoint y el script `eval_passk.py` permiten reproducir el 31,3 % en test y comparar contra el checkpoint de inicio de RL (23,5 %), aislando el efecto del *policy gradient*.
- Investigacion en flow maps discretos: sirve como banco de pruebas de bajo coste (7,5 M de parametros) para estudiar formulaciones de transporte discreto, numero de llamadas a la red y schedules de muestreo.
- Estudio de tecnicas de seleccion de muestras en RL: el autor documenta una heuristica concreta (priorizar puzzles con recompensas heterogeneas entre las 16 respuestas); el modelo permite replicar y variar esa heuristica.
- Docencia y divulgacion sobre RL aplicado a modelos generativos: el tamano reducido y la recompensa binaria clara lo hacen adecuado para explicar *policy gradient* con linea base y pass@K.
- Benchmark de infraestructura de evaluacion: el pipeline de descarga, conversion (`to_pt.py`) y evaluacion con `scripts/eval_passk.py` sirve para validar entornos de evaluacion reproducibles en tareas combinatorias.
- Comparacion de metodos de razonamiento iterativo: al citar el autor el 99,5 % de los Flow Reasoning Models con su metodo completo, este checkpoint permite medir la brecha entre una implementacion parcial y el estado del arte reportado.
- Generacion de datos sinteticos de Sudoku resueltos (con la advertencia de que solo ~31 % de las muestras seran correctas y requieren validacion posterior).

## Benchmarks y rendimiento

Porcentaje de rejillas completamente correctas, con 32 llamadas a la red y temperatura de muestreo 0,1:

| Checkpoint | Validacion | Test |
|---|---|---|
| Inicio del RL (paso 200.000 de preentrenamiento) | 21,8 | 23,5 |
| Este checkpoint (fin del RL) | 29,4 | 31,3 |

Validacion son 1.000 puzzles adicionales del split de entrenamiento; test es un subconjunto fijo de 1.000 puzzles del split oficial de test. Ninguno se usa en entrenamiento. El checkpoint se selecciono entre varias ejecuciones de RL por su puntuacion de validacion. Como referencia, el autor cita que los Flow Reasoning Models reportan un 99,5 % en este benchmark con su metodo completo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa; el modelo tiene 7,5 M de parametros y el repositorio ocupa 0,0 GB segun Hugging Face.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es mas que suficiente; el modelo cabe tambien en CPU.
- Cabe en GPU consumer: si, con amplio margen, en cualquier GPU con al menos 1 GB de memoria.
- Opciones de despliegue: no hay integracion publicada con vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es mediante el repositorio `martindrieux/RL-for-discrete-flow-map` (checkout `8c15985`), el script `hf_ckpt/to_pt.py` para reconstruir el checkpoint `.pt` y `scripts/eval_passk.py` para la evaluacion.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste por respuesta son 4 llamadas a la red (32 en la evaluacion con K=32).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Resultado en Sudoku-Extreme (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mdrieux/sudoku-extreme-flow-map-rl` (este) | 7,5 M | Flow map discreto + RL | 31,3 % | no disponible | Hugging Face + GitHub |
| Flow Reasoning Models (metodo completo, arXiv 2606.29150) | no disponible | Flow reasoning | 99,5 % (reportado por el autor) | no disponible | paper |
| Checkpoint de inicio de RL (mismo autor, paso 200.000) | 7,5 M | Flow map supervisado | 23,5 % | no disponible | no publicado como repo independiente en la informacion disponible |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado: solo el 31,3 % de los tableros de test se resuelven completamente, frente al 99,5 % reportado por el metodo completo de Flow Reasoning Models.
- Dominio unico: no es un modelo de lenguaje ni un solver general; solo funciona con rejillas de Sudoku en el formato de `sapientinc/sudoku-extreme`.
- Licencia no declarada: no hay licencia en la model card ni en los metadatos de Hugging Face, por lo que el uso comercial queda sin autorizacion explicita y debe consultarse con el autor.
- Idiomas no declarados: al no ser un modelo de texto, la ausencia de metadatos de idioma no es un defecto, pero impide cualquier uso linguistico.
- Riesgo de salidas invalidas: aproximadamente dos tercios de las generaciones no son soluciones validas; cualquier uso practico requiere validacion posterior de la rejilla.
- Reproducibilidad dependiente del codigo: la evaluacion exige un checkout concreto del repositorio (`8c15985`) y la conversion de pesos con `to_pt.py`; no hay pipeline estandar de transformers.
- Sesgos: no se documentan sesgos sociales, pero el modelo hereda las limitaciones de su dataset de entrenamiento (1.000 puzzles del split de entrenamiento para el preentrenamiento).
- Sin cuantizaciones publicadas: no hay versiones GGUF ni cuantizadas, lo que limita su uso fuera del stack de PyTorch del repositorio.
- Proyecto de investigacion con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdrieux/sudoku-extreme-flow-map-rl
- Repositorio de codigo: https://github.com/martindrieux/RL-for-discrete-flow-map
- Dataset de entrenamiento: https://huggingface.co/datasets/sapientinc/sudoku-extreme
- Paper de referencia citado por el autor: arXiv 2606.29150 (Flow Reasoning Models)
