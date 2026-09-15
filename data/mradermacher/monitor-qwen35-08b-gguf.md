# mradermacher/monitor-qwen35-08b-GGUF

## Resumen

monitor-qwen35-08b-GGUF es una colección de cuantizaciones en formato GGUF del modelo Noddybear/monitor-qwen35-08b, publicada por el usuario mradermacher. Se trata de un modelo de clasificación de texto especializado en la detección de prompt injection y en tareas de monitorización de seguridad, afinado a partir de la familia Qwen3.5. Con 752.393.024 parámetros totales (~0,75 B), está pensado para actuar como guardrail de entrada en aplicaciones que integran modelos de lenguaje, no como modelo generativo de propósito general.

El modelo base fue sometido a full fine-tuning sobre tres conjuntos de datos de seguridad: reshabhs/SPML_Chatbot_Prompt_Injection, xTRam1/safe-guard-prompt-injection y deepset/prompt-injections. El repositorio aquí descrito no aporta un entrenamiento nuevo, sino que convierte los pesos originales a GGUF y ofrece múltiples niveles de cuantización (desde Q2_K hasta f16) para su ejecución con llama.cpp y herramientas compatibles.

Su relevancia reside en el tamaño reducido y la licencia Apache 2.0: permite desplegar un clasificador de prompt injection en local, en CPU o en GPUs de consumo, sin depender de APIs externas. El repo tiene un tamaño total de 7,8 GB y las cuantizaciones individuales no superan 1,6 GB, lo que facilita su integración en pipelines de seguridad en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3.5 (el autor solo declara la etiqueta "qwen3.5"; numero de capas y detalles internos no disponibles) |
| Parametros totales | 752.393.024 (~0,75 B) |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (complemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base |
| Tarea declarada (pipeline) | text-classification |
| Creador del modelo original | Noddybear |
| Cuantizador | mradermacher |
| Fecha de creacion del repo | 2026-09-15 |
| Tamano del repositorio | 7,8 GB (todas las cuantizaciones) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta qwen3.5, que situa al modelo base en la familia Qwen3.5. Por el nombre del repositorio (monitor-qwen35-08b) y el recuento real de parametros (752,4 M en safetensors), se corresponde con una variante de aproximadamente 0,8 B parametros de dicha familia. Se trata, por tanto, de un transformer decoder-only, pero no se especifican numero de capas, cabezas de atencion, dimension oculta ni mecanismos de atencion concretos.

El autor del modelo base indica full-fine-tuning (ajuste completo de pesos, no LoRA) sobre tres datasets orientados a seguridad: reshabhs/SPML_Chatbot_Prompt_Injection, xTRam1/safe-guard-prompt-injection y deepset/prompt-injections. No se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento posteriores. El repositorio de mradermacher se limita a la conversion a GGUF (convert_type: hf, quantize_version 2) y a la generacion de cuantizaciones estaticas; no se han publicado cuantizaciones ponderadas/imatrix en el momento de la consulta. La presencia de ficheros mmproj-Q8_0 y mmproj-f16 sugiere que el modelo base admite algun tipo de entrada multimodal, aunque esta capacidad no se describe en la model card.

## Capacidades

- Clasificacion de texto orientada a seguridad: deteccion de intentos de prompt injection en entradas de usuario.
- Monitorizacion de conversaciones: etiquetado de mensajes segun el tag security-monitor del repositorio.
- Funcionamiento como guardrail de entrada en sistemas que exponen un LLM a texto no confiable.
- Compatibilidad con el ecosistema GGUF (llama.cpp y derivados), lo que permite inferencia en CPU y GPU.
- El modelo base esta etiquetado como conversational y entrenado sobre datasets de prompt injection, lo que apunta a uso en dialogos multi-turno.
- Soporte multimodal potencial: se incluyen ficheros mmproj (proyector multimodal) en Q8_0 y f16, aunque no se documenta en la informacion disponible que tipos de modalidad cubre.
- No se declara soporte de tool calling, function calling ni capacidades de agente en la informacion proporcionada.
- No se declara capacidad de razonamiento multi-step, thinking mode, vision, audio ni generacion de codigo.
- Idiomas: unicamente ingles (en).

## Casos de uso

- Firewall de prompts en produccion: colocado delante de un LLM generativo, el clasificador examina cada entrada de usuario y bloquea o marca aquellas que contienen intentos de injection antes de que lleguen al modelo principal. Su tamano (~0,6-0,9 GB en cuantizaciones Q4/Q8) permite ejecutarlo en la misma maquina sin competir por VRAM con el modelo grande.
- Guardrail en asistentes conversacionales: en un chatbot multi-turno, se clasifica cada mensaje del historial para detectar manipulación progresiva del contexto, aprovechando que el modelo base se entreno sobre datasets de prompt injection conversacional.
- Proteccion de pipelines RAG: cuando se inyectan documentos recuperados en el prompt, el clasificador puede filtrar contenido externo envenenado que intente sobrescribir instrucciones del sistema.
- Evaluacion offline de red teaming: uso del modelo para etiquetar automaticamente grandes corpus de prompts maliciosos y medir la tasa de deteccion de un sistema antes de desplegarlo, integrandolo en scripts de evaluacion por lotes.
- Monitorizacion de logs y auditoria: procesado por lotes de registros de conversaciones para identificar patrones de abuso o intentos de jailbreak en servicios ya en produccion.
- Despliegue en edge o entorno on-premise: al caber en cuantizaciones de menos de 1 GB, puede ejecutarse en servidores sin GPU o en dispositivos con recursos limitados, algo critico cuando el trafico de usuarios no puede salir de la infraestructura propia.
- Investigacion en seguridad de LLM: por su licencia Apache 2.0 y su tamano reducido, sirve como punto de partida para comparar tecnicas de defensa o para afinar posteriormente sobre dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de precision, recall, F1, MMLU, HumanEval ni ningun otro dato cuantitativo, y tampoco se aportan resultados de evaluaciones sobre los datasets de prompt injection utilizados en el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia (segun el tamano de fichero de cada cuantizacion, mas overhead de contexto y runtime):
  - Q2_K / Q3_K_S / Q3_K_M / Q3_K_L: ~0,5-0,6 GB de pesos.
  - Q4_K_S / IQ4_XS / Q4_K_M: ~0,6 GB de pesos.
  - Q5_K_S / Q5_K_M: ~0,7 GB de pesos.
  - Q6_K: ~0,7 GB de pesos.
  - Q8_0: ~0,9 GB de pesos.
  - f16: ~1,6 GB de pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4-6 GB de VRAM si se reserva contexto suficiente. Tambien es viable en CPU pura.
- GPU de datacenter (A100, H100) no son necesarias por tamano; su uso solo tendria sentido para servir muchas instancias en paralelo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base en safetensors es compatible con transformers; para servir en vLLM o TGI seria preferible usar los pesos originales, ya que estos frameworks trabajan mejor con safetensors que con GGUF.
- Los ficheros mmproj (Q8_0: 0,2 GB; f16: 0,3 GB) se cargan adicionalmente si se activa la parte multimodal.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de ~0,75 B parametros, la latencia esperada es baja, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| monitor-qwen35-08b (este) | 752,4 M | no disponible | Clasificacion de prompt injection | apache-2.0 | no disponible |
| meta-llama/Prompt-Guard | no disponible en la informacion proporcionada | no disponible | Deteccion de jailbreak e injection | no disponible | no disponible |
| protectai/deberta-v3-base-prompt-injection | no disponible en la informacion proporcionada | no disponible | Clasificacion de prompt injection | no disponible | no disponible |
| deepset/deberta-v3-base-injection | no disponible en la informacion proporcionada | no disponible | Clasificacion de prompt injection | no disponible | no disponible |

No se dispone de datos verificados en la informacion proporcionada para comparar parametros, contexto o rendimiento de estas alternativas. Las dos ultimas comparten con este modelo uno de los datasets de entrenamiento (deepset/prompt-injections), segun los tags del repositorio.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de ingles (en); su comportamiento en castellano u otros idiomas no esta documentado.
- Longitud de contexto: no disponible, lo que impide garantizar el tratamiento de entradas largas sin truncado.
- Riesgo de falsos positivos y falsos negativos: no se publican metricas de evaluacion, por lo que no puede cuantificarse su tasa de acierto en produccion.
- Riesgo de alucinacion: al ser un modelo de clasificacion, la salida no es generativa en el uso previsto, pero su comportamiento fuera de la tarea declarada no esta especificado.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni el filtrado aplicado a los datasets de entrenamiento.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original (Noddybear/monitor-qwen35-08b) y de los datasets empleados, ya que algunos conjuntos de datos de seguridad pueden tener sus propias condiciones.
- Cuantizaciones: las versiones de baja precision (Q2_K, Q3_K) pueden degradar la precision de clasificacion; el autor no aporta curvas de perplexidad ni evaluaciones especificas por cuantizacion.
- Ausencia de cuantizaciones ponderadas/imatrix en el momento de la consulta.
- Al ser una conversion de pesos y no un modelo entrenado por mradermacher, la responsabilidad sobre el comportamiento del modelo recae en el autor original.
- Capacidad multimodal sin documentar: los ficheros mmproj estan presentes, pero no se describe como se activan ni que rendimiento ofrecen.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/monitor-qwen35-08b-GGUF
- Modelo base: https://huggingface.co/Noddybear/monitor-qwen35-08b
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#monitor-qwen35-08b-GGUF
- Dataset: https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
- Dataset: https://huggingface.co/datasets/xTRam1/safe-guard-prompt-injection
- Dataset: https://huggingface.co/datasets/deepset/prompt-injections
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
