# codercat/AtmosRegime-Qwen3-8B-Distill

## Resumen

AtmosRegime-Qwen3-8B-Distill es un ajuste fino del modelo Qwen3-8B de Alibaba, desarrollado por codercat en el marco de un estudio sobre la aplicacion de formulas atmosfericas por parte de modelos de lenguaje. El modelo parte de un fallo documentado: los LLM tienden a aplicar incorrectamente formulas fisicas de la atmosfera cuando se enfrentan a condiciones fuera del regimen para el que fueron entrenados, y fracasan de forma total (0% de acierto) en mecanismos que nunca vieron.

La propuesta del trabajo es entrenar mediante destilacion on-policy con un profesor que dispone de la formula correcta en el prompt. El alumno nunca ve esa formula, pero se le empuja hacia la distribucion de tokens del profesor (KL forward sobre los 32 tokens mas probables) simultaneamente a la recompensa por respuesta correcta. Segun el articulo, esta ruta eleva la precision fuera de regimen del 0% al 71% en mecanismos que el modelo base no resolvia pero si resolvia una vez indicada la formula.

Es un modelo de nicho, no un asistente generalista: se ha entrenado con un unico formato de prompt, produce como salida un programa Python que define `solve()` y debe ejecutarse con el modo thinking desactivado. Con 8.190.735.360 parametros y licencia Apache 2.0, hereda las capacidades del Qwen3-8B base pero su uso previsto se restringe al dominio cientifico atmosferico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-8B), con modo thinking desactivado en entrenamiento |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-8B, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el ejemplo usa `torch_dtype="auto"`) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-8B, un transformer decoder-only denso de aproximadamente 8,19 mil millones de parametros. No se introduce ninguna modificacion arquitectonica: el trabajo se centra exclusivamente en la estrategia de entrenamiento, no en la topologia de la red.

El entrenamiento sigue destilacion on-policy con el framework verl. El alumno es Qwen3-8B con thinking desactivado; el profesor es una copia congelada del mismo modelo cuyo prompt incluye la formula atmosferica correcta, de modo que el alumno nunca la ve. Sobre las muestras generadas por el propio alumno se aplica una KL forward sobre los 32 tokens mas probables del profesor, combinada con una recompensa por respuesta correcta. Los hiperparametros son: learning rate 1e-6, 128 problemas × 8 muestras por paso, 120 pasos, sin muestreo dinamico. Los datos corresponden al fold 1 de entrenamiento de las plantillas del estudio (29 de los 70 mecanismos), con semilla 42. No se especifica el numero total de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de codigo Python: la salida esperada es un programa que define una funcion `solve()`, ejecutable y calificable de forma automatica.
- Razonamiento cientifico aplicado a mecanismos atmosfericos: calculo de forzamiento radiativo, cambios de concentracion de CO2 y otras formulas del conjunto de plantillas del estudio.
- Generalizacion fuera de regimen: el objetivo declarado es mejorar en mecanismos que el modelo base no resolvia pero si resolvia una vez dada la formula.
- Conversacional en formato chat: el tokenizer y la plantilla de chat se aplican mediante `apply_chat_template` con `enable_thinking=False`.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni razonamiento multi-turno.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Evaluacion de modelos en fisica atmosferica: usar el modelo como referencia para medir hasta que punto un LLM de 8B aplica correctamente formulas de forzamiento radiativo cuando se le presentan condiciones fuera del rango visto en entrenamiento.
- Reproduccion de experimentos de destilacion on-policy: el checkpoint sirve como punto de partida para replicar el pipeline descrito en el articulo, variando folds o semillas y comparando contra el Qwen3-8B base.
- Generacion de programas de calculo atmosferico verificables: dado un enunciado de problema, el modelo emite un script Python con `solve()` que puede ejecutarse y compararse contra una respuesta de referencia en un pipeline de grading automatico.
- Investigacion sobre adherencia a formulas: el modelo permite estudiar si el ajuste fino con profesor informado induce la formula correcta de forma implicita o solo copia patrones de los ejemplos de entrenamiento.
- Docencia y generacion de ejercicios: se pueden producir soluciones programaticas a problemas de mecanismos atmosfericos del conjunto de plantillas, utiles como material de correccion o como banco de ejemplos resueltos.
- Base para experimentos de KL forward sobre top-k en dominios cientificos: el mismo esquema (profesor con formula, alumno sin ella) puede trasladarse a otras disciplinas con formulas cerradas y compararse contra este checkpoint como linea base.
- Integracion en pipelines de evaluacion cientifica: al devolver codigo ejecutable en lugar de texto libre, encaja en entornos donde la respuesta debe validarse programaticamente, con `atmoscoder_rl/evaluation/` como referencia de ejecucion y calificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la cifra agregada del articulo: la precision fuera de regimen pasa del 0% al 71% en mecanismos que el modelo base no resolvia pero si resolvia una vez indicada la formula. Esa cifra corresponde a la media de dos folds y dos semillas, no a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda disponer de 24 GB o mas.
- VRAM en cuantizacion de 8 bits: en torno a 8-9 GB de pesos, con margen adicional para contexto y activaciones.
- VRAM en cuantizacion de 4 bits: en torno a 4-5 GB de pesos, aunque no se documentan pesos GGUF ni AWQ/GPTQ oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para BF16; RTX 3090/4090 y GPUs de 16 GB en cuantizacion agresiva.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con BF16 y en GPUs de 16 GB con cuantizacion; el ejemplo de la model card usa `device_map="auto"`, lo que permite reparto entre varias GPUs.
- Opciones de despliegue: transformers (ruta documentada), text-generation-inference y endpoints compatibles segun los tags; llama.cpp u Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion esta limitada a `max_new_tokens=3072` con `temperature=0.3` en el ejemplo del autor, lo que sugiere salidas de codigo relativamente largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AtmosRegime-Qwen3-8B-Distill | 8,19 B | No disponible | Destilacion on-policy para formulas atmosfericas | Apache 2.0 | Hugging Face (codercat) |
| Qwen/Qwen3-8B (base) | ~8 B | No disponible en la informacion proporcionada | LLM generalista con modo thinking | Apache 2.0 | Hugging Face (Qwen) |
| Otros modelos de la coleccion AtmosRegime | No disponible | No disponible | Variantes del mismo estudio (folds/semillas) | Apache 2.0 (segun base) | Hugging Face (coleccion codercat) |

La comparacion relevante es contra el propio Qwen3-8B base: mismo tamano, misma licencia y misma libreria, con la diferencia de que el checkpoint ajustado gana en mecanismos atmosfericos fuera de regimen a costa de perder generalidad y de quedar atado a un formato de prompt unico. No se dispone de datos de benchmarks para comparar con alternativas como Llama 3.1 8B o Mistral 7B en esta tarea especifica.

## Limitaciones y advertencias

- El checkpoint corresponde a un solo fold y una sola semilla; las cifras del articulo promedian dos folds y dos semillas, por lo que este modelo por si solo no reproduce exactamente los resultados publicados.
- La destilacion solo ayudo en los casos en que el profesor podia resolver el problema una vez informado de la formula; no mejora en mecanismos fuera del alcance del profesor.
- No es un asistente generalista de ciencias atmosfericas, tal y como advierte el propio autor.
- Entrenado con un unico formato de prompt: debe usarse con la misma plantilla de chat (`atmoscoder_rl.prompts.chat`) y con thinking desactivado; otros formatos pueden degradar la calidad de forma no controlada.
- Salida restringida a un programa Python con `solve()`: no se esperan respuestas en texto libre, explicaciones ni dialogos multi-turno.
- Idioma limitado al ingles.
- Riesgo de alucinacion en enunciados fuera de las 29 plantillas de entrenamiento, especialmente si no se validan los programas generados.
- No se documentan sesgos especificos ni evaluaciones de seguridad.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; aun asi, el autor no garantiza idoneidad para produccion fuera del proposito de investigacion descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codercat/AtmosRegime-Qwen3-8B-Distill
- Codigo y datos: https://github.com/acodercat/AtmosRegime
- Coleccion AtmosRegime: https://huggingface.co/collections/codercat/atmosregime-6af30cd9dd9f6d0865fdb4a5
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
