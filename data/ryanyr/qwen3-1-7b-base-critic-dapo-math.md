# RyanYr/qwen3-1.7b-base-critic-dapo-math

## Resumen

RyanYr/qwen3-1.7b-base-critic-dapo-math es un modelo critico (funcion de valor) construido anadiendo una cabeza escalar de valor sobre el modelo base Qwen/Qwen3-1.7B-Base. No es un modelo generativo de proposito general, sino un componente de infraestructura de aprendizaje por refuerzo: su unica salida es un escalar V(s_t) por token de respuesta, entrenado para regresar la recompensa terminal de un rollout sobre cada uno de los tokens de dicha respuesta. Lo desarrolla el usuario RyanYr y se publica bajo licencia Apache-2.0.

Su relevancia es practica dentro del ecosistema de RL para matematicas: sirve como linea base de valor (baseline) para algoritmos tipo PPO/DAPO/GRPO, como reranker en estrategias best-of-N y como herramienta de filtrado de trayectorias. El entrenamiento se realizo sobre 21296 trayectorias muestreadas por el propio modelo base a partir del conjunto de RL `RyanYr/dapo-math-17k-qwen3-1.7b-base-n8`, balanceadas 50/50 entre correctas e incorrectas.

El modelo tiene 1.7B parametros y hereda la arquitectura transformer decoder-only de Qwen3. El detalle metodologico mas relevante es la construccion del dataset de negativos: solo se extraen negativos de problemas que tambien aportan un positivo, para evitar que el critico aprenda el atajo "este problema parece dificil" a partir del prompt, lo que arruinaria su utilidad para ordenar dos rollouts del mismo problema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de Qwen3 con cabeza escalar de valor adicional |
| Parametros totales | 1.7B (aproximado, segun el modelo base Qwen3-1.7B-Base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-1.7B-Base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B-Base, un transformer decoder-only, y le anade una cabeza escalar de valor. El objetivo de entrenamiento es una regresion por error cuadratico medio con mascara:

```
target[t] = R(y)   para todo token de respuesta t     # recompensa terminal, difundida
mask[t]   = 1 en tokens de respuesta, 0 en prompt y padding
loss      = sum((V(s_t) - target[t])^2 * mask) / sum(mask)
```

La reduccion es token-mean global: numerador y denominador se reducen entre rangos y se dividen una sola vez, en lugar de promediar medias por rango. No se aplica value clipping, ya que no existe una funcion de valor antigua contra la que recortar; es una regresion desde cero, no una actualizacion de critico PPO. El tipico desfase off-by-one de PPO no aparece porque el target es constante a lo largo de la respuesta.

Los datos de entrenamiento son 21296 trayectorias con 5523 problemas distintos, de los cuales 4858 aportan ambas etiquetas. La tasa de positivos en el set es 0.5000, mientras que en un lote real de rollouts es 0.0765. La optimizacion uso AdamW con learning rate constante de 1e-5 tras un warmup lineal del 5 por ciento, grad_clip 1.0, autocast en bf16 sobre pesos maestros en fp32, 2434 pasos (2 epocas), sobre 4x H100 con DDP.

## Capacidades

- Puntuacion de valor escalar: produce un valor V(s_t) por cada token de respuesta de un rollout, util como linea base en algoritmos de RL.
- Ordenacion de rollouts del mismo prompt: al haberse entrenado con negativos restringidos a problemas con positivo, discrimina entre respuestas del mismo problema en lugar de explotar la dificultad del enunciado.
- Regresion de recompensa terminal: estima la recompensa final de una trayectoria completa difundida sobre sus tokens.
- Filtrado y reranking: permite seleccionar trayectorias o respuestas candidatas (best-of-N) sin necesidad de evaluar el resultado final.
- Aplicable a RL de matematicas (DAPO-Math): disenado especificamente para el flujo de entrenamiento DAPO sobre problemas matematicos.
- Trazabilidad de entrenamiento: el repositorio incluye `trainlog.jsonl` con el historial completo por paso.
- Sin capacidades generativas declaradas: no se documenta generacion de texto, tool calling, agentes ni vision.

## Casos de uso

- Linea base de valor en RL: en un bucle PPO/DAPO/GRPO, el critico estima V(s_t) para calcular ventajas y reducir la varianza del gradiente de politica; es su proposito principal y para el que fue entrenado.
- Reranking best-of-N: dado un problema y N respuestas generadas por la politica, el critico puntua cada una y permite seleccionar la mas prometedora sin ejecutar un verificador externo de soluciones.
- Filtrado de trayectorias para reentrenamiento: en tecnicas de rejection sampling o auto-mejora, el valor predicho sirve para descartar rollouts de baja calidad antes de incorporarlos al set de entrenamiento.
- Investigacion sobre calibracion de criticos: al conocerse la discrepancia entre la tasa de positivos de entrenamiento (0.50) y la real (0.0765), el modelo es un caso de estudio util para tecnicas de recalibracion de funciones de valor.
- Analisis de atajos de longitud: dado que las respuestas correctas promedian 809 tokens y las incorrectas 938, el critico permite estudiar cuanto de la senal aprendida proviene de la longitud frente al contenido matematico.
- Evaluacion comparativa de politicas: al puntuar rollouts de distintas politicas o checkpoints sobre los mismos problemas, sirve para monitorizar la evolucion del entrenamiento de forma barata.
- Componente de sistemas de razonamiento multi-paso: aunque no se documentan capacidades de agente, su senal por token puede integrarse en mecanismos de busqueda o poda de pasos intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento de la cabeza de valor:

| Metrica | Valor |
|---|---|
| Loss en el primer paso registrado | 9.5070 |
| Media de loss de los ultimos 50 pasos | 0.2211 |
| Mejor loss registrado | 0.0857 |
| Media de valor predicho (ultimos 50 pasos) | 0.4580 |
| Baseline trivial (predecir 0.5 sobre objetivo 50/50) | 0.25 |

La loss final queda por debajo del baseline trivial de 0.25, lo que indica que la cabeza ha aprendido algo mas alla del prior de clase.

## Requisitos de hardware

- Entrenamiento documentado: 4x H100 con DDP, bf16 sobre pesos maestros fp32, 2434 pasos (2 epocas).
- VRAM estimada para inferencia (estimacion a partir de 1.7B parametros, no confirmada por el autor): aproximadamente 3.4 GB en fp16/bf16 solo para pesos; alrededor de 1-1.2 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM deberia ser suficiente para inferencia en precision completa; tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4090 o superiores.
- Cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU moderna de gama media, dado el tamano de 1.7B.
- Opciones de despliegue: no especificadas por el autor. Al ser un transformer estandar con cabeza de valor, seria compatible en principio con frameworks de inferencia habituales (vLLM, TGI, llama.cpp, Ollama), aunque la cabeza escalar personalizada puede requerir codigo especifico y no se confirma soporte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia |
|---|---|---|---|---|
| RyanYr/qwen3-1.7b-base-critic-dapo-math | 1.7B | no disponible | Critico / funcion de valor | Apache-2.0 |
| Qwen/Qwen3-1.7B-Base | 1.7B | no disponible | LLM base generativo | Apache-2.0 |
| Familias de reward models / PRM de mayor tamano (por ejemplo, criticos de 7B) | no disponible | no disponible | Reward model / critico | no disponible |

La comparacion directa con otros criticos no es posible con la informacion disponible, ya que no se han publicado benchmarks comparativos. Frente a su modelo base, la diferencia clave es la presencia de la cabeza escalar de valor y la ausencia de comportamiento generativo declarado.

## Limitaciones y advertencias

- No esta calibrado: el set de entrenamiento es 50/50 por construccion, mientras que un lote real de rollouts presenta una tasa de positivos de 0.0765. La salida ordena estados, pero no representa P(correcto) sin recalibracion.
- Sesgo por longitud: las respuestas correctas promedian 809 tokens y las incorrectas 938, por lo que parte de la mejora en loss puede deberse a aprender "mas largo implica incorrecto" en lugar de evaluar el contenido matematico.
- Dominio restringido: entrenado especificamente sobre DAPO-Math; su comportamiento fuera de problemas matematicos no esta documentado.
- Uso no generativo: emitir un escalar de valor por token no lo hace apto para generacion de texto, dialogo ni tool calling.
- Riesgo de sobreajuste al conjunto: los negativos provienen solo de problemas con positivo, lo que mejora la discriminacion intra-problema, pero puede limitar la generalizacion a otros regimenes de datos.
- Dependencia del modelo base: cualquier limitacion, sesgo o restriccion de Qwen3-1.7B-Base se hereda.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-1.7B-Base.
- Adopcion y validacion externa nulas hasta la fecha: 0 descargas y 0 likes en HuggingFace, sin validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanYr/qwen3-1.7b-base-critic-dapo-math
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset de trayectorias de entrenamiento: `RyanYr/dapo-math-17k-qwen3-1.7b-base-n8`
- Historial de entrenamiento: `trainlog.jsonl` dentro del repositorio del modelo
- Resultados de busqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a pruebas de velocidad de internet y no guardan relacion con el modelo).
