# BigRatz/looped-decision-models

## Resumen

Looped decision models es un repositorio de investigacion del laboratorio SOTA Open Search que estudia si repetir un bloque de capas de un modelo de lenguaje pequeno aporta profundidad de razonamiento que un unico forward pass no tiene. El objeto de estudio son tareas de decision tipadas en las que el modelo debe emitir una unica respuesta de un conjunto fijo de opciones en una sola pasada, sin cadena de pensamiento ni busqueda. El modelo base utilizado es Qwen3-1.7B, un transformer de 1.700 millones de parametros.

El hallazgo central es que un transformer de 1.7B afinado en una tarea de composicion de k saltos aprende el atajo antes que la tarea. En items donde la respuesta ya aparece impresa en la tabla de entrada, la puntuacion es alta; en items donde no aparece, la precision cae a 0.106 frente a un suelo aleatorio de 0.0625 en una decision de dieciseis opciones. Repetir las doce capas centrales de las veintiocho totales, ancladas de forma que la primera pasada sea exactamente el modelo sin bucle, eleva ese estrato limpio en k=7 en +0.316 de media sobre cuatro semillas, con intervalo de confianza [+0.171, +0.460].

Es relevante ahora porque aisla el efecto de composicion frente al de suavizado general, documenta tres intervenciones fallidas con su explicacion mecanistica y publica el registro completo de evaluacion para que los numeros puedan recalcularse. No se distribuyen pesos: el repositorio contiene unicamente el registro de experimentos, los entrenadores y las predicciones por item.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle de profundidad (repeticion de las 12 capas centrales de 28); modelo base Qwen3-1.7B |
| Parametros totales | 1.7B (modelo base); el bucle no anade parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Pesos no distribuidos; codigo en `code/` bajo Apache-2.0; predicciones por item bajo CC BY 4.0 |
| Formato de pesos | no disponible (no se publican pesos; predicciones en JSONL) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 28 capas. La construccion evaluada repite las doce capas centrales, ancladas de modo que la primera pasada equivale exactamente al modelo sin bucle. El numero de pasadas es un hiperparametro de inferencia: con un mismo conjunto de pesos, pasar de 1 a 8 pasadas mueve la curva del estrato limpio por 0.183, 0.357, 0.464, 0.502, 0.536, 0.563, 0.590 y 0.611, aproximadamente un salto de composicion por pasada. El ajuste se realiza sobre una tarea sintetica de composicion de k saltos con decision de dieciseis vias, y el analisis separa los items resolubles por atajo (respuesta imprimida en la tabla de entrada) de los del estrato limpio.

El registro documenta tres intervenciones que fallaron por la misma razon. Una compuerta aprendible por pasada nunca abandono su inicializacion. Supervisar la lectura en cada pasada colapso la ganancia de +0.244 a +0.027. El warm-start sobre un rango de profundidad mas amplio movio la evaluacion dentro de la distribucion de entrenamiento y no produjo ganancia fuera de ella (-0.004). El analisis de acuerdo entre pasadas explica los dos primeros casos: bajo supervision por pasada, la pasada 1 coincide con la pasada 4 el 0.618 de las veces frente al 0.400 sin ella, y el aumento se mantiene cuando la pasada 4 es correcta (0.486 frente a 0.325), mientras que el caso "pasada 1 correcta, pasada 4 incorrecta" sube de 0.072 a 0.119. La ganancia de profundidad exige que los estados intermedios permanezcan sin comprometer.

## Capacidades

- Razonamiento composicional multi-salto en tareas de decision tipadas con conjunto fijo de opciones y una sola pasada, sin cadena de pensamiento ni busqueda.
- Profundidad de computo ajustable en inferencia mediante el numero de pasadas sobre un mismo conjunto de pesos (de 1 a 8 en los experimentos registrados).
- Evaluacion controlada de atajos: el codigo incluye el analisis de condicionamiento por fuga que separa items resolubles por atajo de items composicionales.
- No dispone de pesos publicados, por lo que no es desplegable como modelo.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible.

## Casos de uso

- Investigacion sobre profundidad de computo adaptativa: usar la construccion de bucle para medir cuanto razonamiento adicional aporta cada pasada adicional sobre un backbone fijo, con la curva 0.183 a 0.611 como referencia reproducible.
- Auditoria de atajos en benchmarks: aplicar el analisis de condicionamiento por fuga de `code/` para separar items resolubles por eliminacion de items que exigen composicion real antes de reportar precision agregada.
- Replicacion de resultados: recalcular cada cifra de la model card a partir de los ficheros JSONL de `evals/`, que incluyen indice de item, k, etiqueta gold, prediccion, numero de pasada y flags de atajo.
- Diseno de supervision en modelos con bucle: usar el resultado negativo de la supervision por pasada (+0.244 a +0.027) para evitar comprometer estados intermedios en arquitecturas recurrentes en profundidad.
- Estudio de transferencia de backbone: el proyecto plantea comparar transformer frente a SSM (Mamba-2 1.3B) con profundidad de bucle cruzada a parametros y tokens iguales, un diseno 2x2 que ningun trabajo publicado ejecuta.
- Referencia para entrenamiento de modelos pequenos en tareas de decision: el registro de fallos (compuerta inerte, warm-start contaminado, agentes con salida degenerada) sirve como lista de comprobacion para laboratorios que reproducen el montaje.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision en estrato limpio, k=7, sin bucle | 0.106 (suelo aleatorio 0.0625) |
| Ganancia con bucle a k=7, media de 4 semillas | +0.316, IC [+0.171, +0.460] |
| Ganancia con bucle en items resolubles por atajo | 0 (efecto nulo) |
| Precision por pasada (1 a 8), estrato limpio | 0.183, 0.357, 0.464, 0.502, 0.536, 0.563, 0.590, 0.611 |
| Ganancia con supervision por pasada | +0.244 sin supervision, +0.027 con supervision |
| Ganancia con warm-start en rango amplio | -0.004 |
| Acuerdo pasada 1 / pasada 4, sin supervision por pasada | 0.400 |
| Acuerdo pasada 1 / pasada 4, con supervision por pasada | 0.618 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- No hay pesos publicados, por lo que no existe despliegue posible del modelo entrenado.
- Para reproducir el montaje sobre el modelo base Qwen3-1.7B: inferencia en bf16 requiere aproximadamente 3,4 GB de VRAM solo para pesos, mas cache de activaciones y KV.
- Cabe en GPU de consumo: RTX 4090 (24 GB), RTX 3090 (24 GB) y, con cuantizacion, tarjetas de 8 a 12 GB. El bucle multiplica el coste de computo por el numero de pasadas sin aumentar la memoria de pesos.
- Entrenamiento de adaptadores sobre 1.7B viable en una A100 de 40 u 80 GB o en una RTX 4090 con LoRA.
- Opciones de despliegue del base: vLLM, TGI, llama.cpp u Ollama; el bucle de capas requiere una implementacion propia, no soportada por estos servidores de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Looped decision models (este) | 1.7B (base Qwen3-1.7B) | no disponible | Transformer con bucle de 12 capas centrales | Codigo Apache-2.0, predicciones CC BY 4.0, sin pesos | Solo registro de evaluacion |
| Qwen3-1.7B | 1.7B | no disponible en la informacion | Transformer denso, sin bucle | Licencia propia del modelo base | Pesos publicos |
| Mamba-2 1.3B | 1.3B | no disponible en la informacion | Backbone de espacio de estados | Licencia propia del modelo base | Pesos publicos |
| CHASE | no disponible | no disponible | Trabajo previo citado; deja transformer frente a SSM a benchmarks downstream | no disponible | no disponible |

## Limitaciones y advertencias

- No se distribuyen pesos: los adaptadores de las ejecuciones registradas se perdieron en un contenedor efimero sin copia de seguridad. Las cifras son recalculables desde `evals/`, pero ningun modelo puede recargarse. Las ejecuciones posteriores al 2026-11-28 publican adaptadores en `adapters/`.
- Un unico task sintetico, una unica familia de modelos y una unica tarjeta. Cuatro semillas bastan para descartar que la direccion sea azar, no para publicar un tamano de efecto.
- El estrato limpio en k=8 es heterogeneo entre semillas; el resultado estable es el de k=7.
- Reportar la metrica agregada en lugar del estrato limpio infla todos los brazos, porque la mayoria de items de alta profundidad son resolubles por atajo.
- Las predicciones deben reportarse por profundidad y por pasada, nunca promediadas: el promedio oculta precisamente el efecto que el experimento mide.
- El proyecto registra episodios de agentes con salida degenerada e instrumentos que medían nada antes de corregirse; esos episodios forman parte de la valoracion de fiabilidad de las cifras.
- Licencia de uso comercial del modelo: no disponible, al no haber pesos. El codigo es Apache-2.0 y las predicciones CC BY 4.0, con los modelos base bajo sus propias licencias y sin redistribucion.
- Sesgos y riesgo de alucinacion: no disponibles en la informacion proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BigRatz/looped-decision-models
- Modelo base Qwen3-1.7B: no disponible en la informacion (referenciado en la model card)
- Modelo base Mamba-2 1.3B: no disponible en la informacion (referenciado en la model card)
- Trabajo previo CHASE: no disponible en la informacion (citado en la model card)
- Repositorio complementario con notas de metodo y registro de fallos: no disponible en la informacion (mencionado como "companion repository" sin URL)
