# into-the-night/sokoban-world-model-qwen3-0.6b

## Resumen

Sokoban World Model (Qwen3-0.6B, v4) es un ajuste fino completo del modelo base Qwen/Qwen3-0.6B-Base, desarrollado por el autor independiente into-the-night (Abhay Shukla). No es un solucionador de Sokoban ni un agente de juego: es un modelo de mundo (world model) que, dado un tablero y una accion, predice el siguiente estado del tablero. Es decir, aprende las consecuencias fisicas deterministas del juego en lugar de la estrategia para resolverlo.

El modelo emplea la arquitectura transformer decoder-only de Qwen3 (596.049.920 parametros, aproximadamente 0,6 mil millones) y se ha entrenado para escribir transcripciones de estado en un formato textual estricto, manteniendo la coherencia durante 32 o mas pasos leyendo sus propias predicciones. El interes tecnico radica en estudiar como un modelo de lenguaje aprende relaciones causales (fisica) y generaliza a tamanos de tablero y numero de cajas no vistos durante el entrenamiento.

Es relevante como artefacto de investigacion reproducible (entrenado en una sola GPU Kaggle T4) y como ejemplo de uso de modelos de lenguaje como simuladores de entorno, una linea inspirada por el Code World Model de Meta FAIR. Su licencia Apache 2.0 facilita la experimentacion, aunque su utilidad practica esta acotada al dominio Sokoban y al formato de transcripcion definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino completo |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea float16) |
| Idiomas soportados | no disponible (dominio restringido a transcripciones de Sokoban en formato estructurado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer decoder-only, y se somete a un ajuste fino completo con pesos maestros en fp32 y autocast en fp16 sobre una unica GPU Kaggle T4. Los datos consisten en 12.000 transcripciones (aproximadamente 100.000 estados supervisados) generadas por un simulador exacto de Sokoban. Los tableros abarcan de 6x6 a 8x8 con 1 a 4 cajas, las transcripciones llegan hasta 16 pasos y las acciones estan sesgadas hacia interacciones con cajas.

Se aplican dos aumentaciones clave: asignacion aleatoria de letras a las cajas (A-H) y un desplazamiento aleatorio de 0 a 4 sumado a cada coordenada escrita, de modo que el modelo no pueda aprender atajos como "7 significa muro". La funcion de perdida se calcula unicamente sobre los tokens de estado (no sobre cabecera ni acciones), con teacher forcing, 2 epocas, learning rate 5e-5 y tamano de lote 16. El formato de una linea por objeto con cabecera `BOXES` resulto determinante para generalizar al numero de cajas.

## Capacidades

- Prediccion de dinamica determinista: dado un estado de Sokoban y una accion (UP, DOWN, LEFT, RIGHT), genera el siguiente estado en formato de transcripcion.
- Mantenimiento de coherencia autoregresiva durante 32 o mas pasos leyendo sus propias predicciones como entrada.
- Generalizacion a tamanos de tablero no vistos (9x9 y 10x10) y a recuentos de cajas no vistos (5 y 6 cajas).
- Manejo de multiples cajas identificadas por letras (A-H) con seguimiento de posiciones.
- Interpretacion de simbolos de rejilla: `#` muro, `.` suelo, `P` jugador, `B` caja, `g` objetivo, `X` caja sobre objetivo, `p` jugador sobre objetivo.
- Generacion de texto estructurado con delimitador `END` y parada controlada.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Simulacion de entorno para planificacion: combinado con un procedimiento de busqueda y un evaluador, el modelo puede usarse como simulador de transiciones para explorar planes sin invocar el simulador real.
- Investigacion sobre world models: banco de pruebas controlado para estudiar como un modelo de lenguaje aprende relaciones causales y generaliza fuera de distribucion.
- Aprendizaje por refuerzo basado en modelo: las predicciones de estado pueden alimentar rollouts sinteticos en algoritmos de RL que requieran un modelo de dinamica.
- Validacion de tecnicas de augmentacion: el exito de los desplazamientos de coordenadas y del formato de una linea por objeto sirve como referencia metodologica para otros dominios estructurados.
- Generacion de datos sinteticos: produccion de trayectorias de estado verificables para aumentar conjuntos de entrenamiento de otros modelos en Sokoban.
- Docencia y divulgacion: ejemplo reproducible (entrenable en una T4) de ajuste fino de un LLM para una tarea de simulacion determinista.
- Pruebas de robustez autoregresiva: evaluacion de la degradacion de un modelo al realimentar sus propias salidas durante decenas de pasos.

## Benchmarks y rendimiento

La metrica empleada es la supervivencia a 32 pasos: porcentaje de 40 transcripciones retenidas que siguen siendo exactamente correctas tras 32 pasos leyendo sus propias salidas (el doble del horizonte de entrenamiento).

| Conjunto de prueba | Supervivencia |
|---|---|
| En rango (tableros 6-8, 1-3 cajas) | 98% |
| 8x8, 4 cajas | 100% |
| 8x8, 5 cajas (recuento no visto) | 98% |
| Tableros 9x9 (tamano no visto) | 100% |
| Tableros 10x10 (tamano no visto) | 100% |
| 8x8, 6 cajas (dos mas que en entrenamiento) | 80% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en float16 (596 M parametros); en torno a 2,4 GB de almacenamiento para el repositorio completo en safetensors.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el modelo fue entrenado en una Kaggle T4 y la inferencia cabe holgadamente en ella.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en GPUs de gama baja con suficiente memoria.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (etiqueta `text-generation-inference` en el repositorio) y endpoints compatibles. No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; la generacion de cada estado esta limitada a 60 tokens nuevos con decodificacion greedy y parada en `END`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sokoban World Model (Qwen3-0.6B) | 596 M | no disponible | World model de Sokoban | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B-Base | ~0,6 B | no disponible | LLM generalista | Apache 2.0 | Hugging Face |
| Code World Model (Meta FAIR, referencia) | no disponible | no disponible | World model de codigo | no disponible | paper arXiv:2510.02387 |

La comparacion con modelos de proposito general no es directa: el Sokoban World Model no compite en tareas de lenguaje general, sino en prediccion de dinamica de un dominio concreto. Frente a su modelo base, sacrifica capacidades generales a cambio de precision en el formato de transcripcion de Sokoban.

## Limitaciones y advertencias

- No se recupera de sus propios errores: casi todos los fallos son un desliz temprano arrastrado indefinidamente; el entrenamiento de recuperacion (v5 y v6) redujo la supervivencia al 25-57%, por lo que esta version no lo incorpora.
- Formato estrecho: solo entiende la transcripcion descrita, con tableros cuadrados de hasta aproximadamente 10x10 y hasta unas 6 cajas.
- Solo modela dinamica: no tiene nocion de objetivos, valores ni de cual es una buena jugada; no es un solucionador de Sokoban.
- Riesgo de alucinacion en estados: fuera del rango de entrenamiento puede generar estados inconsistentes sin senalizarlo.
- Idiomas y sesgos generales: no hay informacion sobre sesgos; el modelo no esta disenado para lenguaje natural abierto.
- Licencia Apache 2.0 permite uso comercial, pero la utilidad practica esta limitada al dominio y formato descritos.
- Para produccion, requiere integracion con busqueda y evaluador externos; no debe usarse como planificador autonomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/into-the-night/sokoban-world-model-qwen3-0.6b
- Repositorio de codigo y notebooks: https://github.com/into-the-night/sokoban-world-model
- Paper de referencia (Code World Model, Meta FAIR): https://arxiv.org/abs/2510.02387
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Blog post "I Taught a Language Model to Push Boxes": enlace no disponible (la model card contiene un marcador de posicion)
