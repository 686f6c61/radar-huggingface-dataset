# RWKV-Agent-Lab/RWKV7-Agent-7.2B

## Resumen

RWKV7-Agent-7.2B es un modelo fundacional de agentes de 7.200 millones de parametros desarrollado por RWKV-Agent-Lab sobre la arquitectura RWKV-7, una familia de modelos recurrentes con attention lineal que prescinde del mecanismo de atencion cuadratica clasico de los transformers. El modelo se posiciona como la base comun de razonamiento multi-turno y uso de herramientas sobre la que se construyen agentes especializados descendientes, como el agente de programacion RWKV7-Pi-7.2B y el futuro agente de busqueda profunda RWKV7-DSH-7.2B.

Su relevancia radica en dos factores. Primero, aplica la arquitectura RWKV-7 (estado recurrente de coste lineal en la longitud de secuencia) al dominio de los agentes y el tool calling, un terreno dominado por transformers con attention completa. Segundo, se distribuye con licencia Apache-2.0 y pesos en formato `.pth` en BF16 fusionado, sin necesidad de adaptadores externos, lo que facilita su despliegue mediante la libreria propietaria `rwkv-lightning-cuda`.

El modelo esta entrenado y orientado a los idiomas chino e ingles. La informacion publicada no detalla el tamano de contexto, el volumen de tokens de entrenamiento ni resultados de benchmarks, por lo que estos datos se marcan como no disponibles en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (recurrente con attention lineal, sin attention cuadratica) |
| Parametros totales | 7.200 millones (7.2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es BF16) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (checkpoint BF16 fusionado, standalone) |

## Arquitectura y entrenamiento

RWKV-7 es una evolucion de la familia RWKV de modelos recurrentes que sustituye la atencion completa por un mecanismo de attention lineal con un estado recurrente de tamano fijo. Esto implica que el coste computacional y el uso de memoria crecen de forma lineal con la longitud de la secuencia durante la generacion, en lugar de cuadratica como en un transformer estandar. El checkpoint publicado, `RWKV7-Agent-7.2B-v0.1.pth`, es un modelo fusionado (merged weights) en BF16 que no requiere adaptadores externos.

El modelo se presenta como una "Agent Foundation" entrenada en multiples etapas (multi-stage) especificamente para razonamiento multi-turno y uso de herramientas. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se detalla el proceso de destilacion o las fases de RL/OPD que si aparecen en los modelos descendientes (RWKV7-Pi-7.2B). Toda esta informacion se considera no disponible.

## Capacidades

- Generacion de texto y razonamiento multi-turno orientado a tareas de agente.
- Uso de herramientas (tool calling / function calling) como capacidad central del modelo.
- Razonamiento multi-paso y encadenamiento de acciones para agentes.
- Base para agentes de programacion (linea RWKV7-Pi) y agentes de busqueda profunda (linea RWKV7-DSH).
- Capacidades multilingues limitadas a chino e ingles.
- Inferencia con coste lineal respecto a la longitud de secuencia gracias a la arquitectura RWKV-7.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Agentes de programacion: el modelo sirve como base para pipelines de generacion y edicion de codigo con llamadas a herramientas (ejecucion de tests, lectura de ficheros), siendo la fundacion sobre la que se construye RWKV7-Pi-7.2B.
- Automatizacion de tareas con tool calling: integracion en orquestadores de agentes que requieren seleccionar y encadenar APIs de forma multi-paso, aprovechando su entrenamiento especifico en uso de herramientas.
- Razonamiento multi-turno en asistentes tecnicos: conversaciones largas de soporte o diagnostico en chino e ingles donde el coste lineal de la arquitectura RWKV-7 reduce el consumo de memoria frente a transformers equivalentes.
- Base para fine-tuning especializado: al ser un modelo fundacional de agentes con licencia Apache-2.0, permite derivar agentes verticales (busqueda, investigacion, operaciones) mediante SFT o RL sobre el checkpoint fusionado.
- Despliegue en entornos con restricciones de memoria: la naturaleza recurrente de RWKV-7 facilita servir secuencias largas con un estado de tamano fijo, util en servicios con VRAM limitada.
- Investigacion en arquitecturas no-transformer para agentes: permite comparar el rendimiento de un modelo recurrente frente a transformers de tamano similar en tareas de razonamiento y tool use.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 7.2B en BF16, el peso de los parametros ronda los 14-15 GB, por lo que se requiere al menos una GPU con 16 GB o mas en BF16; en cuantizaciones de 8 o 4 bits (no publicadas para este checkpoint) el requisito bajaria, pero estos formatos no estan confirmados.
- GPU recomendadas: no especificadas por el autor. Por tamano, encajan GPU de datacenter como A100 o H100 y GPU de consumo de gama alta con 16-24 GB (por ejemplo RTX 4090) en BF16.
- Cabe en GPU de consumo: probablemente en tarjetas con 16 GB o mas en BF16, aunque no hay confirmacion oficial ni variantes GGUF publicadas.
- Opciones de despliegue: la model card documenta exclusivamente la libreria `rwkv-lightning-cuda` mediante el binario `rwkv_lighting_cuda` con los argumentos `--model-path`, `--vocab-path`, `--host` y `--port`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| RWKV7-Agent-7.2B | 7.2B | no disponible | RWKV-7 (attention lineal) | Apache-2.0 | Base de agentes con tool use; despliegue via rwkv-lightning-cuda |
| RWKV7-Pi-7.2B | 7.2B | no disponible | RWKV-7 | no disponible | Agente de programacion derivado del mismo linaje |
| Alternativas transformer de ~7B | ~7B | no disponible | Transformer | variable | No se dispone de datos de rendimiento comparables en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa se considera no disponible.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: no se publica la longitud maxima de contexto, lo que impide planificar su uso en tareas de contexto largo sin pruebas previas.
- Alucinacion: no se documentan evaluaciones de fiabilidad ni tasas de alucinacion.
- Sesgos: no se publica informacion sobre sesgos conocidos ni sobre el dataset de entrenamiento.
- Ecosistema: el despliegue depende de la libreria `rwkv-lightning-cuda`, sin soporte documentado en frameworks estandar como vLLM, llama.cpp u Ollama, lo que limita la portabilidad.
- Cuantizacion: no se publican variantes GGUF ni cuantizaciones de bajo bit, lo que complica el despliegue en hardware de consumo.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta y la version es v0.1, por lo que conviene tratarlo como un checkpoint inicial.
- Licencia: Apache-2.0 permite uso comercial, pero al no documentarse los datos de entrenamiento no puede descartarse riesgo asociado a la procedencia de los mismos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RWKV-Agent-Lab/RWKV7-Agent-7.2B
- Agente de programacion derivado (RWKV7-Pi-7.2B): https://huggingface.co/RWKV-Agent-Lab/RWKV7-Pi-7.2B
