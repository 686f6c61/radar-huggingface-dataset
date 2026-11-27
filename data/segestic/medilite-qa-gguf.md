# segestic/MediLITE-QA-GGUF

## Resumen

MediLITE-QA es un modelo de respuesta a preguntas medicas de opcion multiple, construido mediante ajuste fino con QLoRA sobre `microsoft/Phi-3.5-mini-instruct` (3.821.079.648 parametros). Lo desarrollan Olusegun Oladele Odewole y Seren Basaran, y se publica bajo el identificador `segestic/MediLITE-QA-GGUF`. El objetivo declarado es demostrar que un modelo de dominio especifico, cuantizado a 4 bits y ejecutado exclusivamente en CPU de un portatil de consumo, puede alcanzar una precision competitiva con un coste energetico inferior al de modelos generalistas de 7-8B.

La relevancia del artefacto es doble. Por un lado, ofrece una via de inferencia sin GPU para evaluacion de conocimiento medico en entornos con recursos limitados. Por otro, el modelo esta acompanado de un articulo en *Sustainability* (2026, 18(21), 11245) que documenta mediciones de energia por token, tiempo hasta el primer token y memoria residente maxima sobre un Intel Core i5-1135G7 con 6,96 GiB de RAM.

El repositorio distribuye cuatro ficheros GGUF (Q4_K_M, Q5_K_M, Q8_0 y F32) compatibles con llama.cpp y runtimes derivados. La precision zero-shot del fichero Q4_K_M promediada sobre nueve benchmarks medicos (7.045 items) es del 71,87%, frente al 72,79% del modelo en fp16 y el 68,73% del modelo base. La licencia es MIT, pero el autor restringe explicitamente el uso a investigacion y prohibe su empleo para informar decisiones de atencion al paciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3.5-mini), ajuste fino QLoRA y posterior cuantizacion GGUF |
| Parametros totales | 3.821.079.648 (3,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en los ejemplos de uso de la model card (el contexto nativo de Phi-3.5-mini es mayor, pero no se documenta en esta ficha) |
| Tipos de cuantizacion | Q4_K_M (2,39 GB), Q5_K_M (2,82 GB), Q8_0 (4,06 GB), F32 (7,64 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT, con restriccion de uso a investigacion indicada por el autor |
| Formato de pesos | GGUF (llama.cpp); el modelo fusionado en Transformers esta en el repo `segestic/MediliteQA-phi3.5-mini-all-med` |

## Arquitectura y entrenamiento

El modelo parte de Phi-3.5-mini-instruct, un transformer decoder-only de 3,8B parametros. Sobre esa base se aplica un ajuste fino supervisado con QLoRA (adaptador `segestic/phi3.5-mini-4k-qlora-medical-seg-vall_med`), que posteriormente se fusiona con los pesos base para producir el modelo en Transformers y, a partir de ahi, las cuantizaciones GGUF. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset medico utilizado; solo indica que el resultado es un modelo especializado en responder preguntas de opcion multiple con una unica letra.

No se documenta el uso de RLHF ni DPO. La innovacion tecnica destacable no esta en la arquitectura, sino en el pipeline de eficiencia: cuantizacion a 4 bits (Q4_K_M) combinada con inferencia en CPU y medicion sistematica de energia por token. El articulo asociado compara el consumo del modelo con el de modelos abiertos de 7-8B ejecutados en el mismo hardware, reportando un uso de energia de CPU entre 1,56 y 1,98 veces menor por token generado.

## Capacidades

- Generacion de texto y respuesta a preguntas medicas de opcion multiple, devolviendo una unica letra como salida.
- Razonamiento de dominio limitado al formato de examen medico (estilo USMLE y similares).
- Inferencia en CPU sin GPU mediante llama.cpp y llama-cpp-python.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el pipeline `text-generation`.
- Soporte de chat mediante `create_chat_completion` con temperatura 0,0 y `max_tokens=4` para forzar la respuesta de una letra.
- Capacidades multilingues: solo ingles declarado.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Evaluacion de conocimiento medico en investigacion: el modelo permite medir la precision de un LLM cuantizado sobre bancos de preguntas tipo examen sin necesidad de GPU, lo que facilita replicar experimentos en portatiles convencionales.
- Benchmarking energetico de LLMs: sirve como referencia para comparar joules por token entre modelos de 3,8B y modelos de 7-8B en el mismo hardware, tal como se hace en el articulo asociado.
- Prototipado de sistemas de triaje educativo: en entornos docentes de medicina se puede desplegar en un portatil para generar preguntas de practica y corregir respuestas de opcion multiple con latencia de 1,34 s hasta el primer token.
- Docencia y formacion en IA sostenible: el repositorio y el paper constituyen un caso de estudio reproducible sobre cuantizacion, QLoRA e inferencia en CPU para asignaturas de machine learning.
- Despliegue en entornos aislados o sin conectividad: al caber en 2,39 GB y ejecutarse en CPU, puede instalarse en equipos sin acelerador y con recursos de memoria limitados (pico de 4.403 MiB con contexto de 2.000 tokens).
- Filtrado y clasificacion de items de opcion multiple en pipelines de datos: el formato de salida de una letra simplifica el parseo y la integracion en scripts de evaluacion automatizada.
- Investigacion sobre sesgos y seguridad en IA medica: el modelo esta pensado para estudiar el comportamiento de modelos pequenos de dominio y sus fallos, no para uso clinico.

## Benchmarks y rendimiento

Precision zero-shot del fichero Q4_K_M promediada sobre nueve benchmarks medicos (7.045 items):

| Metrica | Valor |
|---|---|
| Precision media Q4_K_M | 71,87% (IC 95% bootstrap: 70,05 a 73,76) |
| Precision media modelo fp16 | 72,79% |
| Precision media modelo base | 68,73% |

Eficiencia del fichero Q4_K_M con llama-cpp-python, 4 hilos, sin GPU, Intel Core i5-1135G7 con 6,96 GiB de RAM:

| Metrica | Valor |
|---|---|
| Tiempo hasta el primer token (regimen estable) | 1,34 s |
| Tiempo por token de salida | 117 ms (8,19 tokens/s) |
| Memoria residente maxima (contexto de 2.000 tokens) | 4.403 MiB (61,8% de la RAM) |
| Energia del paquete de CPU | 3,17 J por token generado |

Los resultados por benchmark individual no se incluyen en la model card; el autor remite al articulo. No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para el flujo documentado, que es inferencia en CPU con `n_gpu_layers=0`. En caso de descargar capas a GPU, el fichero Q4_K_M ocupa 2,39 GB y el F32 7,64 GB.
- GPU recomendadas: no documentadas por el autor. Por tamano, cualquier GPU consumer con al menos 4 GB de VRAM podria alojar el Q4_K_M completo; no hay mediciones publicadas en GPU.
- Caben en GPU consumer: si, el Q4_K_M (2,39 GB) y el Q5_K_M (2,82 GB) caben en tarjetas de 4-6 GB; el Q8_0 (4,06 GB) requiere 6 GB o mas; el F32 (7,64 GB) requiere 8-10 GB.
- Hardware de referencia medido: Intel Core i5-1135G7, 4 hilos, 6,96 GiB de RAM, sin GPU.
- Opciones de despliegue: llama.cpp, llama-cpp-python y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere soporte en endpoints de Hugging Face. No se documenta compatibilidad con vLLM ni TGI.
- Latencia y throughput medidos: 1,34 s hasta el primer token, 117 ms por token, 8,19 tokens/s, 3,17 J por token en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision medica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediLITE-QA (Q4_K_M) | 3,8B | 2.048 tokens en ejemplos | 71,87% (9 benchmarks, 7.045 items) | MIT con restriccion a investigacion | GGUF en Hugging Face |
| Phi-3.5-mini-instruct (base) | 3,8B | no disponible en esta ficha | 68,73% (mismos benchmarks) | MIT | Pesos originales en Hugging Face |
| MediLITE-QA fp16 | 3,8B | no disponible | 72,79% (mismos benchmarks) | MIT con restriccion a investigacion | Repo Transformers asociado |
| Modelos abiertos de 7-8B medidos en el paper | 7-8B | no disponible | no disponible | no disponible | no disponible |

La model card solo aporta datos cuantitativos frente al modelo base y frente a la version fp16. La comparacion con modelos de 7-8B se limita al consumo energetico (1,56-1,98 veces mayor por token en el mismo hardware); no se ofrecen cifras de precision de esos modelos en la informacion disponible.

## Limitaciones y advertencias

- No validado clinicamente: una revision ciega exploratoria con cinco clinicos encontro una correccion clinica inferior a la de un modelo de referencia frontier, y algunas respuestas fueron marcadas como potencialmente daninas.
- Uso restringido: el autor indica explicitamente que es solo para investigacion y que no es un dispositivo medico ni debe usarse para informar la atencion al paciente.
- Formato de salida rigido: el modelo esta entrenado para responder con una unica letra y sigue con menos fiabilidad instrucciones de formato libre o explicaciones.
- Alcance de hardware limitado: los resultados de eficiencia provienen de un unico portatil de consumo y no deben asumirse transferibles a otros dispositivos.
- Idioma: solo se declara ingles; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto: los ejemplos usan 2.048 tokens; no se documenta el comportamiento con ventanas mas largas ni la degradacion asociada.
- Riesgo de alucinacion: no se han publicado tasas especificas de alucinacion, pero al ser un modelo de 3,8B especializado en opcion multiple, su fiabilidad fuera de ese formato es limitada.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, geograficos o culturales en la informacion disponible.
- Licencia: MIT, pero la restriccion de uso a investigacion de la model card debe respetarse en cualquier despliegue comercial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/segestic/MediLITE-QA-GGUF
- Modelo fusionado en Transformers: https://huggingface.co/segestic/MediliteQA-phi3.5-mini-all-med
- Adaptador LoRA: https://huggingface.co/segestic/phi3.5-mini-4k-qlora-medical-seg-vall_med
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Codigo y logs de evaluacion: https://github.com/segestic/Medilite-QA
- Articulo: Odewole, O.O.; Basaran, S. "MediLITE-QA: Energy-Efficient Medical Question Answering with a Quantized Domain-Specific Language Model on a Commodity Laptop CPU." *Sustainability* 2026, 18(21), 11245. https://doi.org/10.3390/su182111245
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
