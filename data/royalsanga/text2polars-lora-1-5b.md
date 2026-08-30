# royalsanga/text2polars-lora-1.5b

## Resumen

text2polars-lora-1.5b es un adaptador LoRA de 20 MB desarrollado por royalsanga que se monta sobre el modelo base mlx-community/Qwen2.5-Coder-1.5B-Instruct-bf16. Su objetivo es especializar un modelo pequeño de 1.500 millones de parámetros en la generación de código para la librería polars de Python, un área donde los modelos generalistas suelen fallar por confundir la API de pandas con la de polars o por usar nombres de funciones obsoletos.

El adaptador se publica principalmente como un experimento de investigación: triplica la precisión del modelo base en operaciones de polars dentro de su distribución de entrenamiento (del 20,0 % al 60,0 %), pero no muestra ninguna transferencia a operaciones no vistas y degrada significativamente la capacidad general de escritura de Python. El autor documenta estos resultados con pruebas estadísticas exactas de McNemar, lo que convierte este repositorio en un caso de estudio honesto sobre los límites del fine-tuning con LoRA en modelos pequeños.

La relevancia actual del proyecto reside en su metodología rigurosa: demuestra que un adaptador LoRA de bajo coste (13 minutos de entrenamiento en un Apple M3 Pro) puede especializar un modelo en una tarea concreta, pero también evidencia que la especialización no generaliza y que el entrenamiento con datos sintéticos requiere una validación cuidadosa para evitar conclusiones falsas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Coder-1.5B-Instruct (transformer decoder) con adaptador LoRA |
| Parametros totales | 1.540 millones (modelo base) + 5,28 M entrenables (adaptador) |
| Parametros activos | 1.540 millones (no es MoE) |
| Longitud de contexto | 32.768 tokens (herencia del modelo base Qwen2.5) |
| Tipos de cuantizacion | bf16 (modelo base y adaptador); fusion con cuantizacion 4-bit posible pero degrada el rendimiento |
| Idiomas soportados | Ingles (unico idioma del dataset de entrenamiento) |
| Licencia | MIT |
| Formato de pesos | Adaptador LoRA en formato MLX (safetensors), no compatible con transformers ni vLLM |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA de rango 8 sobre 16 de las 28 capas del transformer de Qwen2.5-Coder-1.5B-Instruct, aplicando la adaptacion a las proyecciones q, k, v, o y a las capas MLP. El total de parametros entrenables es de 5,28 millones, lo que supone un 0,34 % del modelo base. El entrenamiento se realiza con 3.605 ejemplos generados sinteticamente a partir de 28 familias de plantillas: el 75 % son tareas de polars y el 25 % restante son ejemplos de Python general como estrategia de regularizacion. Se utilizan 700 pasos con batch de 4, learning rate de 1e-4 y perdida con mascara sobre el prompt. El hardware empleado es un Apple M3 Pro, con 6,5 GB de pico de memoria y 13 minutos de entrenamiento.

Un hallazgo relevante del entrenamiento es que el 25 % de datos de Python general no es opcional: sin ellos, la capacidad de Python general colapsa del 53,3 % al 10,0 %. Subir la proporcion al 50 % no anade ninguna mejora adicional, lo que sugiere que el efecto es un umbral, no un dial continuo. Ademas, todos los ejemplos de entrenamiento se ejecutaron y se descartaron si no producian la respuesta declarada, y se cribaron contra los 268 benchmarks para garantizar cero contaminacion.

## Capacidades

- Generacion de codigo polars: alta precision (60,0 %) en las 47 operaciones presentes en el dataset de entrenamiento, incluyendo tareas de convencion de salida, interferencia con pandas y nombres de API obsoletos.
- Generacion de codigo Python general: degradada significativamente (53,3 % frente al 83,3 % del modelo base), por lo que no debe usarse como modelo de codigo general.
- Sin transferencia a operaciones no vistas: en 88 operaciones de polars fuera del entrenamiento, el adaptador obtiene un 30,7 % frente al 27,3 % del modelo base, una diferencia estadisticamente indistinguible (p = 0,728).
- Sin capacidades de tool calling, agentes, vision ni audio: el modelo base es Qwen2.5-Coder-Instruct, orientado exclusivamente a generacion de codigo y texto.
- Soporte de chat: hereda la plantilla de chat de Qwen2.5-Coder-Instruct mediante `apply_chat_template`, aunque el prompt recomendado es de una sola vuelta.
- Reproducibilidad: con decodificacion greedy (temp=0.0) los resultados son deterministas.

## Casos de uso

- Asistencia a analistas de datos que trabajan con polars: el adaptador puede generar codigo correcto para operaciones comunes como ordenaciones, filtros y agrupaciones con la API de polars 1.43.2, evitando los errores tipicos de quienes vienen de pandas. Se integraria como un snippet de generacion de codigo en un notebook o editor.
- Migracion de pipelines de pandas a polars: el modelo destaca en la categoria "pandas interference" (70,0 % de precision), donde la tarea consiste en escribir codigo polars cuando el prompt menciona conceptos de pandas. Puede servir como asistente para traducir logicas existentes.
- Entrenamiento de modelos especializados en dominios con APIs en evolucion: el caso de "stale API names" demuestra que el adaptador aprende los nombres de funciones vigentes de polars. Una organizacion podria replicar esta metodologia para otras librerias con APIs cambiantes.
- Evaluacion de metodologias de fine-tuning: el repositorio documenta tres errores de medicion que casi producen resultados falsos, y una leccion sobre como un conjunto de validacion pequeno puede sugerir transferencia inexistente. Es un caso de estudio util para investigadores que disenan benchmarks de generalizacion.
- Prototipado rapido en Apple Silicon: al ser un adaptador de solo 20 MB, se puede cargar y descartar con facilidad en equipos Mac, sin necesidad de GPU dedicada. Es adecuado para pruebas locales de generacion de codigo polars.
- Generacion de codigo en entornos con restricciones de recursos: el modelo base de 1,5B junto con el adaptador cabe en 6,5 GB de memoria, lo que permite ejecutarlo en portatiles sin GPU dedicada, aunque con latencias moderadas.

## Benchmarks y rendimiento

Los resultados se obtuvieron con el benchmark text2polars-bench, con comparaciones pareadas y test exacto de McNemar. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

| Eval | Base | Adaptador | Delta | p |
|---|---|---|---|---|
| polars, in-distribution (120 tareas) | 20,0 % | 60,0 % | +40,0 | 0,000 |
| polars, held-out operations (88 tareas) | 27,3 % | 30,7 % | +3,4 | 0,728 |
| Python general (60 tareas) | 83,3 % | 53,3 % | -30,0 | 0,000 |

Desglose por categoria en el conjunto in-distribution:

| Categoria | Base | Adaptador |
|---|---|---|
| output convention | 58,3 % | 70,0 % |
| pandas interference | 16,7 % | 70,0 % |
| stale API names | 0,0 % | 63,3 % |
| genuinely hard | 16,7 % | 36,7 % |

El mejor prompt few-shot que se pudo escribir para el modelo base alcanza un 25,0 % en el conjunto in-distribution, frente al 60,0 % del adaptador con un prompt simple (p = 0,000), lo que descarta que la mejora sea recuperable con mejor prompt.

## Requisitos de hardware

- VRAM estimada: el entrenamiento pico consumio 6,5 GB en un Apple M3 Pro; la inferencia con el adaptador deberia requerir menos, en torno a 4-6 GB segun el contexto.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 8 GB de memoria unificada. No hay soporte para CUDA, ROCm ni Vulkan.
- Compatibilidad con GPU de consumo: solo Apple Silicon; no funciona en RTX, A100 ni H100 sin una conversion manual no proporcionada.
- Opciones de despliegue: exclusivamente mediante mlx-lm en Apple Silicon. No hay soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: el adaptador anade un coste de aproximadamente el 12 % en throughput durante la inferencia. Se puede eliminar fusionando el adaptador con el modelo base con `mlx_lm.fuse`, operacion exacta en bf16. La fusion sobre un modelo cuantizado a 4-bit no es exacta y degrada el rendimiento en unos 10 puntos.
- Requisito adicional: el tokenizer del modelo base tiene una inconsistencia que provoca que la generacion se reinicie tras emitir `<|im_end|>`; es necesario anadir `tok.eos_token_id` al conjunto de tokens de fin para evitar una ralentizacion de 22x.

## Comparativa con modelos similares

No se dispone de adaptadores LoRA comparables publicados para generacion de codigo polars sobre modelos de 1,5B. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (base) | 1.540 M | 32.768 | Codigo general | Apache 2.0 |
| text2polars-lora-1.5b (adaptador) | 5,28 M entrenables | 32.768 | polars especifico | MIT |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.540 M | 32.768 | Razonamiento | MIT |

La comparacion con DeepSeek-R1-Distill-Qwen-1.5B es orientativa: ambos parten de la misma familia Qwen, pero el adaptador text2polars esta especializado en una tarea mucho mas estrecha y no es un modelo de razonamiento.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con MLX: no hay version para transformers, vLLM ni ninguna otra libreria de inferencia.
- Degrada la capacidad general de Python: de 83,3 % a 53,3 % en 60 tareas generales, una regresion estadisticamente significativa (p = 0,000). No debe usarse como modelo de codigo general.
- Sin transferencia a operaciones no vistas: el adaptador solo mejora las 47 operaciones presentes en el entrenamiento; en las 88 operaciones fuera de distribucion no hay mejora medible.
- Dependencia de la version de polars: los resultados se validaron contra polars 1.43.2; versiones posteriores pueden cambiar la API y degradar el rendimiento.
- Datos de entrenamiento sinteticos: el modelo se entreno con plantillas generadas automaticamente, no con cargas de trabajo analiticas reales, lo que puede limitar su utilidad en escenarios reales.
- Formato de prompt rigido: el adaptador se entreno con un formato de prompt especifico; usar otro framing degrada la salida.
- Riesgo de alucinacion: al ser un modelo de 1,5B, puede generar codigo incorrecto o inventar funciones que no existen en polars, especialmente en operaciones complejas.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo base Qwen2.5-Coder-1.5B-Instruct esta bajo Apache 2.0, que tambien permite uso comercial.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/royalsanga/text2polars-lora-1.5b
- Dataset de benchmark: https://huggingface.co/datasets/royalsanga/text2polars-bench
- Modelo base: https://huggingface.co/mlx-community/Qwen2.5-Coder-1.5B-Instruct-bf16
- Repositorio con el metodo completo y los resultados: https://github.com/royalsanga24/text2polars
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Pagina del autor: http://royalsanga.com/
