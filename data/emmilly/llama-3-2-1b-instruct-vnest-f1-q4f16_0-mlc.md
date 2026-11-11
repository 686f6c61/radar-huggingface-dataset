# emmilly/Llama-3.2-1B-Instruct-VNeST-f1-q4f16_0-MLC

## Resumen

Llama-3.2-1B-Instruct-VNeST-f1-q4f16_0-MLC es un ajuste fino del modelo meta-llama/Llama-3.2-1B-Instruct realizado por el usuario emmilly, orientado a una tarea muy concreta: generar ejercicios de VNeST (Verb Network Strengthening Treatment), una terapia del lenguaje dirigida a adultos con afasia. El modelo no es un asistente general, sino un generador de preguntas estructuradas en JSON que una aplicación Android consume para construir sesiones de rehabilitación.

Tecnicamente se trata de un transformer decoder-only de 1.000 millones de parametros, ajustado mediante LoRA (rango 16 sobre todas las capas lineales) y convertido al formato MLC LLM con cuantizacion de 4 bits (q4f16_0). El resultado pesa aproximadamente 705 MB repartidos en 22 shards y esta disenado para ejecutarse de forma totalmente offline en un telefono Android, sin conexion a servicios en la nube.

Su relevancia actual radica en el nicho: demuestra que un modelo de 1B cuantizado a 4 bits puede ejecutar una tarea terapeutica estructurada en hardware movil de gama media (Snapdragon 855, 8 GB de RAM), con latencias de unos 11 segundos por pregunta. La model card lo declara explicitamente como uso de investigacion y no como dispositivo medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino con LoRA y conversion a MLC LLM |
| Parametros totales | 1.000 millones (modelo base Llama-3.2-1B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (segun `mlc-chat-config.json`), prefill chunk de 256 |
| Tipos de cuantizacion | q4f16_0 (4 bits, grupo de cuantizacion 0) |
| Idiomas soportados | ingles (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | MLC LLM (`params_shard_*.bin`, `ndarray-cache.json`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-1B-Instruct, un transformer decoder-only con atencion causal estandar. Sobre el se aplico un ajuste fino con LoRA de rango 16 en todas las capas lineales, calculando la perdida unicamente sobre la respuesta generada y utilizando el formato de chat exacto que emplea la aplicacion movil (plantilla `llama-3_1`). Se selecciono la mejor epoca (la 2 de 3) mediante validacion, se fusionaron los adaptadores y se convirtio el resultado con la herramienta `convert_weight` de MLC a q4f16_0. El coste de computo declarado es de aproximadamente 2 minutos de GPU.

El conjunto de entrenamiento consta de unas 3.570 muestras (una pregunta por muestra) derivadas de 357 frases sobre 50 verbos. Los datos se generaron a partir de ConceptNet y de un modelo profesor Llama-3.1-8B-Instruct, y posteriormente fueron auditados. El dataset no es publico. No se menciona el uso de RLHF ni DPO; el ajuste es puramente supervisado sobre la tarea.

## Capacidades

- Generacion de ejercicios VNeST estructurados: produce un objeto JSON con una respuesta correcta y tres opciones incorrectas claramente imposibles para cada pregunta (quien, que, donde, cuando, por que).
- Salida en formato JSON estricto, compatible con un esquema opcional que la aplicacion puede imponer.
- Generacion de preguntas encadenadas: cada pregunta se construye a partir de las respuestas anteriores (verbo, persona, objeto, lugar, momento).
- Capacidad de evitar repeticiones de personas mediante instrucciones explicitas en el prompt.
- Ejecucion offline en dispositivo: no requiere red ni backend.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.
- Multilingue: solo ingles.

## Casos de uso

- Terapia de afasia asistida por aplicacion movil: el modelo genera en el telefono las preguntas del ejercicio VNeST y la app valida las pulsaciones del paciente; el feedback nunca depende del modelo, lo que reduce el riesgo clinico.
- Sesiones de rehabilitacion offline en entornos sin conectividad: al ejecutarse en local con MLC LLM, funciona en consultas rurales o dispositivos sin datos.
- Investigacion en terapia del lenguaje: permite generar lotes de ejercicios sobre verbos no vistos para evaluar la generalizacion del ajuste fino (la model card reporta pruebas con cook, drive, paint, plant y wash).
- Prototipado de aplicaciones Android de salud: sirve como referencia de integracion de un LLM de 1B cuantizado en una app nativa con MLC LLM y un `model_lib` precompilado.
- Generacion de distractores controlados: el formato JSON con tres opciones imposibles permite construir items de eleccion multiple para tareas cognitivas.
- Evaluacion de sesgos en modelos pequenos: el modelo documenta sesgo de genero en verbos domesticos, lo que lo hace util como caso de estudio para auditorias de datos sinteticos.
- Docencia sobre ajuste fino eficiente: ejemplo completo de LoRA de rango 16, seleccion de epoca por validacion y conversion a formato movil con un coste de computo minimo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre verbos no vistos en entrenamiento (cook, drive, paint, plant, wash): 76 ejercicios y 380 preguntas, con comprobaciones automaticas por reglas.

| Medida | Llama-3.2-1B sin ajustar | Este modelo |
|---|---|---|
| Ejercicios totalmente validos | 0 % | 100 % |
| Preguntas individuales que pasan las comprobaciones de la app | 21 % | 100 % |
| Respuestas que copian las instrucciones | 49 % | 0 % |
| Respuesta igual a la referencia | 3 % | 36 % |

Rendimiento en dispositivo (Samsung Galaxy Note10, Snapdragon 855, 8 GB de RAM): carga en unos 6 segundos, uso de memoria de aproximadamente 0,75 GB, unos 11 segundos por pregunta y 55-60 segundos por ejercicio completo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,75 GB de memoria en el dispositivo con cuantizacion q4f16_0 (medido en el Note10).
- GPU recomendadas: no se especifican; el modelo esta pensado para SoC moviles. En escritorio puede ejecutarse con cualquier GPU compatible con MLC LLM, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: si, por tamano (1B en 4 bits), aunque no se han publicado mediciones en RTX 4090, RTX 3060 u otras.
- Opciones de despliegue: MLC LLM (unico formato soportado; requiere la libreria compilada `q4f16_0` de Llama-3.2-1B, la misma que el modelo stock de mlc-ai). No se distribuyen pesos GGUF, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente sin reconversion.
- Latencia y throughput: unos 11 s por pregunta y 55-60 s por ejercicio en Snapdragon 855; sin datos para otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Este modelo (VNeST q4f16_0) | 1B | 2048 | MLC LLM q4f16_0 | Llama 3.2 | Ajuste fino terapeutico, offline en Android |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128k (modelo base) | safetensors, GGUF (comunidad) | Llama 3.2 | Asistente general |
| mlc-ai/Llama-3.2-1B-Instruct-q4f16_0-MLC | 1B | 2048 (config MLC) | MLC LLM q4f16_0 | Llama 3.2 | Version stock en formato MLC, sin ajuste |
| Llama-3.2-3B-Instruct | 3B | 128k (modelo base) | safetensors, GGUF (comunidad) | Llama 3.2 | Asistente general de mayor capacidad |

La comparativa directa de rendimiento solo existe frente al Llama-3.2-1B sin ajustar, con los porcentajes de la tabla de benchmarks. No hay datos publicados frente a otros modelos especializados en terapia del lenguaje.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: no es un dispositivo medico y sus ejercicios no han sido revisados por un logopeda.
- Errores de sentido: algunos ejercicios pasan todas las reglas automaticas pero son incorrectos, por ejemplo "The maid washes the hair".
- Poca variedad: solo aparecieron 10 respuestas distintas de "who" en 76 ejercicios de prueba, y las opciones incorrectas se repiten desde listas memorizadas.
- Sesgo de genero: en verbos domesticos la persona es casi siempre una mujer en rol domestico (madre, criada), heredado de los datos de entrenamiento.
- Conocimiento del mundo limitado propio de un modelo de 1B.
- Solo ingles; no soporta otros idiomas.
- Contexto de 2048 tokens, suficiente para la tarea pero insuficiente para conversaciones largas.
- La licencia Llama 3.2 Community License impone restricciones adicionales al uso comercial y exige el cumplimiento de sus terminos, incluida la atribucion "Built with Llama".
- Dependencia de una version concreta de MLC LLM (build de 2024 compilada desde fuente) y de la libreria `q4f16_0` de Llama-3.2-1B.
- El prompt debe usarse exactamente como se especifica; otra formulacion degrada los resultados.
- Toda respuesta debe validarse en codigo antes de mostrarse a un paciente, con reintentos limitados (la app permite 3).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emmilly/Llama-3.2-1B-Instruct-VNeST-f1-q4f16_0-MLC
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Modelo stock en formato MLC: https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f16_0-MLC
- Repositorio MLC LLM: https://github.com/mlc-ai/mlc-llm
- Licencia Llama 3.2: incluida en el repositorio como `LICENSE.txt`
