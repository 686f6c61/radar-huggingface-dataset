# pppd/netester

## Resumen

Vader (publicado en Hugging Face como `pppd/netester`) es un ajuste fino del modelo `meta-llama/Llama-3.2-1B-Instruct` orientado a un caso de uso muy concreto: actuar como agente de diagnostico de red con uso de herramientas (tool calling) para la asignatura CSEN 311 de redes de computadores. El autor lo presenta como un agente capaz de investigar fallos en aplicaciones cliente-servidor TCP y UDP a lo largo de seis "tracks" de proyecto (NetDoctor-AI, FileGuard-AI, ChatWatch-AI, PacketSense-AI, ServiceMedic-AI y TrafficMind-AI).

Se distribuye como cuantizacion GGUF Q4_K_M pensada para ejecutarse localmente con Ollama y exponerse a traves de una API compatible con OpenAI. El modelo base tiene 1.235.814.432 parametros (aproximadamente 1,2 mil millones), lo que lo situa en la gama de modelos pequenos desplegables en hardware de consumo. El repositorio ocupa 0,8 GB, coherente con una unica cuantizacion de 4 bits.

La relevancia es acotada y practica: demuestra el patron de especializar un modelo pequeno para una tarea de dominio (diagnostico de red) con un contrato de herramientas estricto y un presupuesto de llamadas limitado, en lugar de depender de un modelo grande generalista. No hay informacion publica sobre volumen de entrenamiento, datos utilizados ni evaluaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 1B Instruct) |
| Parametros totales | 1.235.814.432 (aprox. 1,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base Llama 3.2 1B es de 128 000 tokens, pero el autor no lo especifica) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada) |
| Idiomas soportados | no disponible (la model card esta en ingles; no se declaran idiomas) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (repo de 0,8 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only de Llama 3.2 1B Instruct. La model card no detalla la arquitectura mas alla del modelo base ni describe innovaciones propias (no se mencionan atencion lineal, decodificacion especulativa ni variantes hibridas). Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO adicionales.

Lo que si documenta el autor es el contrato de uso del agente: el modelo debe operar con tres esquemas de herramientas de diagnostico de solo lectura registradas mediante el parametro `tools`, con un presupuesto maximo de 8 llamadas por investigacion y registro de cada paso en `trace.jsonl`. Tambien se indica una regla de interpretacion: no tratar retardos o descartes simulados en localhost como degradacion fisica de la red. Estos elementos sugieren un ajuste orientado a seguir instrucciones de procedimiento y a emitir llamadas de herramienta estructuradas, aunque no se aportan cifras de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Instruct.
- Tool calling / function calling: el modelo esta ajustado para invocar herramientas de diagnostico de red de solo lectura a traves del parametro `tools`.
- Razonamiento multi-paso acotado: el flujo de investigacion esta limitado a un maximo de 8 llamadas de herramienta por sesion.
- Diagnostico de fallos en aplicaciones cliente-servidor TCP y UDP en el contexto de los seis proyectos de CSEN 311.
- Integracion con clientes compatibles con la API de OpenAI mediante el endpoint local de Ollama (`http://localhost:11434/v1`).
- Capacidades multilingues: no disponibles; no se declaran idiomas soportados.
- Vision, audio y modo thinking: no disponibles.

## Casos de uso

- Diagnostico guiado de fallos TCP/UDP en practicas docentes: el modelo recibe los esquemas de herramientas del proyecto del estudiante y ejecuta hasta 8 llamadas de solo lectura para localizar la causa del fallo, registrando la traza en `trace.jsonl`.
- Asistente de laboratorio para los seis tracks de CSEN 311: NetDoctor-AI, FileGuard-AI, ChatWatch-AI, PacketSense-AI, ServiceMedic-AI y TrafficMind-AI, cada uno con sus propias herramientas de diagnostico registradas en el parametro `tools`.
- Automatizacion de triaje en entornos de prueba localhost: el modelo inspecciona retardos y descartes simulados y, segun la regla del autor, los interpreta como comportamiento de la aplicacion y no como degradacion fisica de la red.
- Integracion en pipelines de agentes con cliente compatible con OpenAI: al exponerse via Ollama en `/v1`, puede conectarse a frameworks que ya hablan el protocolo de OpenAI sin cambios de codigo en el cliente.
- Entrenamiento y evaluacion de estudiantes en uso responsable de agentes: el limite de 8 llamadas y el registro obligatorio de la traza sirven como ejercicio practico de presupuesto de herramientas y auditabilidad.
- Prototipado de bajo coste en hardware de consumo: con 0,8 GB de pesos en Q4_K_M, permite iterar sobre el diseno de herramientas y prompts en un portatil sin GPU dedicada.
- Base para experimentos de ajuste fino en dominios de red: al partir de Llama 3.2 1B Instruct, sirve como punto de partida para especializaciones similares en otros dominios tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de tool calling o precision diagnostica.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB o menos con la cuantizacion Q4_K_M publicada (repo de 0,8 GB), mas el overhead de contexto y del servidor de inferencia.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre; tambien viable en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna de NVIDIA, AMD o Intel, e incluso en inferencia solo CPU.
- Opciones de despliegue: Ollama es la via documentada por el autor (`ollama pull hf.co/<usuario>/cs311`); al ser GGUF, tambien es compatible con llama.cpp y otros runners GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vader (`pppd/netester`) | 1,2 B | no disponible | Agente de diagnostico de red con tool calling (CSEN 311) | llama3.2 | GGUF en Hugging Face |
| `meta-llama/Llama-3.2-1B-Instruct` | 1,2 B | 128 000 tokens (segun el modelo base) | Asistente generalista | llama3.2 | Pesos originales en Hugging Face |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,2 B | 128 000 tokens (segun el modelo base) | Asistente generalista de mayor capacidad | llama3.2 | Pesos originales en Hugging Face |

La comparacion con alternativas especializadas en diagnostico de red no esta disponible: no se han identificado en la informacion proporcionada otros modelos de la misma categoria.

## Limitaciones y advertencias

- Ambito muy restringido: el ajuste esta disenado para los seis proyectos de CSEN 311 y para diagnostico de aplicaciones TCP/UDP en localhost; su comportamiento fuera de ese dominio no esta documentado.
- Sin datos de evaluacion: no hay benchmarks ni metricas de precision diagnostica, por lo que no puede afirmarse su fiabilidad en produccion.
- Riesgo de alucinacion: al ser un modelo de 1,2 B ajustado sobre Llama 3.2 1B, es propenso a generar llamadas de herramienta o conclusiones plausibles pero incorrectas; el limite de 8 llamadas y el registro en `trace.jsonl` mitigan pero no eliminan este riesgo.
- Idiomas no declarados: la model card y el ajuste estan en ingles; el rendimiento en castellano no esta verificado.
- Restricciones de licencia: hereda la Llama 3.2 Community License, que impone condiciones de uso comercial (incluida la clausula de "construido con Llama" y restricciones para entidades con mas de 700 millones de usuarios mensuales); debe revisarse antes de un despliegue comercial.
- Dependencia de Ollama: la via de despliegue documentada asume Ollama y un servidor local en `http://localhost:11434/v1`; no se documentan otras integraciones.
- Regla de interpretacion critica: el modelo debe ser instruido para no confundir retardos o descartes simulados en localhost con degradacion fisica de la red; omitir esta regla puede producir diagnosticos erroneos.
- Sin informacion sobre sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pppd/netester
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Ollama: https://ollama.com
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
