# debudash/qwen3-4b-tz-convert-v1-n1000

## Resumen

El modelo `debudash/qwen3-4b-tz-convert-v1-n1000` es un adaptador LoRA (concretamente QLoRA) entrenado sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` de Alibaba. Lo desarrolla el usuario `debudash` en el contexto del proyecto tz-convert, cuyo objetivo es especializar un modelo de lenguaje pequeno (SLM) en la conversion y el razonamiento sobre zonas horarias (timezones), una tarea con reglas cambiantes, excepciones historicas y dependencias geograficas que los modelos generalistas suelen resolver de forma inconsistente.

Se trata de un punto intermedio en la curva de eficiencia de datos del proyecto: este checkpoint concreto se ha entrenado unicamente con los primeros 1.000 ejemplos de la mezcla `v1` del dataset `debudash/tz-convert-sft`, manteniendo los mismos hiperparametros que el resto de checkpoints de la serie. No es, por tanto, un modelo final, sino una version de referencia para comparar el efecto del volumen de datos de entrenamiento sobre la adherencia a especificaciones.

El adaptador ocupa apenas 0,1 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia actual es metodologica: publica metricas de adherencia a especificacion y robustez junto al checkpoint, lo que permite auditar como escala el rendimiento con el numero de ejemplos, y remite al checkpoint `v3-n12000` como la version recomendada del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA/QLoRA (adaptador PEFT) sobre transformer Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (el adaptador LoRA no declara su numero de parametros; el modelo base Qwen3-4B tiene 4.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; el autor no la especifica) |
| Tipos de cuantizacion | no disponible para el adaptador; el entrenamiento se realizo en QLoRA (cuantizacion del base durante el entrenamiento) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango entrenado con QLoRA sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de 4.000 millones de parametros de la familia Qwen3 en su variante instruct. El adaptador no modifica la arquitectura del base: se acopla a las capas existentes y se carga mediante la libreria `peft`. El repositorio pesa 0,1 GB, coherente con un adaptador de rango bajo.

El entrenamiento utiliza los primeros 1.000 ejemplos de la mezcla `v1` del dataset `debudash/tz-convert-sft`, con los mismos hiperparametros que el resto de checkpoints de la serie (commit de entrenamiento `50e9d5e5ee624730a4ebd7bc581a1a7f209b692f`). No se documentan en la informacion disponible el numero total de tokens vistos, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO; el pipeline declarado es SFT (supervised fine-tuning) sobre datos de conversion de zonas horarias. La innovacion principal del proyecto no es arquitectonica, sino metodologica: la publicacion sistematica de una curva de eficiencia de datos con metricas de adherencia a especificacion y robustez para cada tamano de muestra.

## Capacidades

- Generacion de texto conversacional orientada a la conversion de zonas horarias y al razonamiento sobre reglas horarias.
- Adherencia a una especificacion de tarea (spec prompt): el modelo se evalua con una prompt de especificacion completa, lo que sugiere capacidad de seguir instrucciones detalladas y formatos estrictos.
- Robustez ante entradas variadas o adversas, medida en el conjunto de evaluacion del proyecto (31,1% en este checkpoint).
- Capacidades heredadas del base Qwen3-4B-Instruct-2507: generacion de texto general, razonamiento e instrucciones en ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Normalizacion de marcas horarias en pipelines de datos: el adaptador puede convertir cadenas de fecha-hora entre zonas horarias dentro de procesos ETL, usando el modelo base como motor y el adaptador para forzar el formato de salida especificado.
- Asistente de conversion horaria en aplicaciones de agenda: integrado en un backend que recibe peticiones del tipo "que hora es en Madrid cuando en Tokio son las 09:00", el adaptador aporta la adherencia a la especificacion medida en la evaluacion del proyecto.
- Generacion de datos sinteticos de entrenamiento: dado que el proyecto publica el dataset y el codigo de evaluacion, este checkpoint sirve como generador de ejemplos etiquetados de conversion horaria para aumentar la mezcla de entrenamiento de otros modelos.
- Evaluacion comparativa de eficiencia de datos: investigadores pueden reproducir la curva del proyecto cargando este checkpoint (1.000 ejemplos) frente a `v3-n12000` para medir el impacto del volumen de datos en tareas de formato estricto.
- Preprocesado en sistemas de logging distribuido: convertir timestamps de multiples regiones a una zona comun antes de agregar metricas, con un modelo pequeno desplegable en una sola GPU consumer.
- Prototipado rapido de asistentes de viaje: un chatbot que responde preguntas sobre husos horarios de destinos, usando el adaptador sobre el base Qwen3-4B para mantener el tono conversacional y la precision en la conversion.
- Filtrado y validacion en CI: ejecutar el modelo sobre casos de prueba de conversion horaria en un pipeline de integracion continua para detectar regresiones en la logica de fechas de una aplicacion.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son las metricas propias del proyecto (adherencia a especificacion y robustez), no benchmarks estandar.

| Metrica | Este checkpoint (n=1000) | Modelo base con spec prompt completa |
|---|---|---|
| Spec-adherence | 18,0% | 12,0% |
| Robustness | 31,1% | 23,3% |
| Drift: conversaciones mantenidas | no disponible | 0,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,1 GB; el modelo base Qwen3-4B-Instruct-2507 requiere aproximadamente 8 GB en FP16 y entre 2,5 y 3 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el base en FP16 (RTX 3060 Ti, RTX 4060, RTX 4070); para cuantizacion 4-bit basta con 4-6 GB (RTX 3050, GTX 1660 con 6 GB).
- Cabe en GPU consumer: si, en la mayoria de tarjetas consumer modernas con 8 GB o mas, y en configuraciones de 4 bits con 4-6 GB.
- Opciones de despliegue: el adaptador se carga con `peft` sobre el base en PyTorch/Transformers; para servirlo en produccion se puede fusionar con el base y exportar a vLLM, TGI o llama.cpp/Ollama tras la conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| debudash/qwen3-4b-tz-convert-v1-n1000 | 4B (base) + adaptador LoRA | no disponible | Conversion de zonas horarias (SFT, 1.000 ejemplos) | apache-2.0 | Hugging Face |
| debudash/qwen3-4b-tz-convert-v3-n12000 | 4B (base) + adaptador LoRA | no disponible | Conversion de zonas horarias (SFT, 12.000 ejemplos; mejor checkpoint del proyecto) | apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en la informacion | Modelo generalista instruct | apache-2.0 | Hugging Face |

La comparativa directa con modelos de conversion horaria de otros autores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de la curva de datos: el propio autor remite al checkpoint `v3-n12000` como la version recomendada, por lo que este adaptador no debe usarse como modelo de produccion.
- Adherencia a especificacion baja en terminos absolutos (18,0%): la mayoria de las respuestas no cumplen estrictamente el formato o las reglas de la especificacion.
- Robustez limitada (31,1%): el modelo falla con frecuencia ante entradas variadas o no canonicas.
- Riesgo de alucinacion en reglas horarias: las zonas horarias tienen excepciones historicas y cambios legislativos que un modelo pequeno puede no conocer; conviene validar contra una base de datos IANA tz.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base Qwen3-4B.
- Licencia Apache 2.0: permite uso comercial, pero el adaptador depende del modelo base, cuyos terminos tambien deben respetarse.
- Requiere cargar el modelo base junto al adaptador (o fusionarlos), lo que anade complejidad operativa frente a un modelo ya fusionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/debudash/qwen3-4b-tz-convert-v1-n1000
- Checkpoint recomendado del proyecto: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n12000
- Dataset de entrenamiento: https://huggingface.co/datasets/debudash/tz-convert-sft
- Codigo, conjuntos de evaluacion e informes: https://huggingface.co/debudash/slm-training
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
