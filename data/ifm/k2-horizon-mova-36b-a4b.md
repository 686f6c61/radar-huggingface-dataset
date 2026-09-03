# IFM/K2-Horizon-MoVA-36B-A4B

## Resumen

K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por IFM, que incorpora una arquitectura de atención novedosa denominada Mixture-of-Values (MoVA). Con 36 mil millones de parámetros totales y solo 4 mil millones activos por token, el modelo está diseñado para ofrecer un rendimiento de nivel frontera en tareas de razonamiento y agente, manteniendo una eficiencia computacional elevada. Su contexto nativo de 524 288 tokens (512K) lo posiciona como una opción atractiva para aplicaciones que requieren procesamiento de secuencias muy largas.

El modelo se publica con pesos abiertos bajo licencia Apache 2.0, y el autor ha anunciado la liberación de los checkpoints intermedios, los datos de entrenamiento y el código de entrenamiento, lo que facilita la reproducibilidad y el estudio de la evolución de capacidades durante el entrenamiento. Aunque los datos de benchmarks no se han detallado en la información disponible, la model card indica que supera a modelos densos de aproximadamente 30B y a MoE de hasta 15 veces su tamaño en tareas agénticas y de razonamiento, compitiendo también con modelos cerrados de frontera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con Mixture-of-Values attention (MoVA) |
| Parametros totales | 37 444 792 020 (36B segun model card) |
| Parametros activos | 4B |
| Longitud de contexto | 524 288 tokens (512K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

K2-Horizon-MoVA-36B-A4B emplea una arquitectura MoE en la que cada token activa únicamente 4B de los 36B parámetros totales. La innovación principal reside en la atención Mixture-of-Values (MoVA), que combina múltiples transformaciones de valores dentro del mecanismo de atención, permitiendo una representación más rica sin incrementar el coste computacional por token. El modelo se entrenó con los datasets IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data, ambos públicos, y el autor ha confirmado que liberará el código de entrenamiento y los checkpoints intermedios. No se especifica si se aplicaron técnicas de RLHF o DPO, aunque el modelo está orientado a tareas conversacionales y de agente.

## Capacidades

- Generacion de texto y razonamiento avanzado, con resultados destacados en benchmarks de tareas agénticas y de razonamiento.
- Soporte de contexto largo nativo de 524 288 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Capacidad de procesamiento de secuencias largas sin degradación aparente, gracias a la arquitectura MoVA.
- Entrenamiento orientado a tareas de agente, lo que sugiere soporte para razonamiento multi-paso y planificación.
- Modelo conversacional, con capacidad de mantener diálogos coherentes.
- Solo soporta inglés como idioma de entrada y salida.

## Casos de uso

- Agentes autonomos para automatizacion de tareas: el modelo puede razonar sobre multiples pasos y mantener contexto largo, lo que lo hace adecuado para agentes que gestionan flujos de trabajo complejos con historial extenso.
- Analisis de documentos legales o academicos: con 512K de contexto, puede procesar contratos, articulos de investigacion o informes tecnicos completos sin necesidad de truncamiento.
- Generacion de codigo en entornos de desarrollo: su capacidad de razonamiento y contexto largo permite mantener coherencia en proyectos grandes, aunque no se ha confirmado soporte explicito de tool calling.
- Asistentes conversacionales para soporte tecnico: puede gestionar conversaciones multi-turno con contexto amplio, reduciendo la perdida de informacion en interacciones largas.
- Investigacion en IA: al ser open weights y con datos de entrenamiento publicos, es util para estudiar el comportamiento de MoE y MoVA en tareas de razonamiento.
- Procesamiento de datos a gran escala: su contexto nativo permite analizar logs, series temporales o datos de sensores en una sola pasada, facilitando tareas de extraccion de informacion.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una tabla comparativa con modelos como Nemotron 3 Ultra (550B), Nemotron 3 Super (120B), G9v3-39A5B (39B), Qwen3.6-35B-A3B (35B), Muse Glimmer-30B (30B) y Gemma 4 31B-it (31B), pero los valores concretos no se han proporcionado en el texto extraido. Se indica que el modelo supera a estos en tareas agénticas y de razonamiento, pero sin cifras exactas no es posible realizar una comparacion cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 36B parametros en FP16 se requieren aproximadamente 72 GB de VRAM. Con cuantizacion a 8 bits, unos 36 GB; con 4 bits, unos 18 GB. Dado que solo 4B estan activos por token, la memoria para activaciones es reducida, pero los pesos completos deben residir en memoria.
- GPU recomendadas: para FP16, se necesitan GPUs como A100 80GB, H100 80GB o multiples RTX 4090 (24GB cada una) con paralelismo. Con cuantizacion 4-bit, una RTX 4090 o RTX 3090 (24GB) podria ser suficiente.
- Si cabe en consumer GPU: si, con cuantizacion agresiva (4-bit) y usando herramientas como llama.cpp u Ollama, aunque el rendimiento puede verse limitado por el ancho de banda de memoria.
- Opciones de despliegue: al ser un modelo transformers, es compatible con vLLM, TGI, llama.cpp, Ollama y otras plataformas de inferencia. No se han proporcionado datos de latencia o throughput.
- El tamano del repositorio es de 2471.5 GB, lo que implica una descarga considerable y espacio en disco para los pesos completos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B | 36B | 4B | 512K | Apache 2.0 |
| Qwen3.6-35B-A3B | 35B | 3B | no disponible | no disponible |
| G9v3-39A5B | 39B | 5B | no disponible | no disponible |
| Nemotron 3 Super | 120B | 12B | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. La comparacion se limita a parametros y contexto, donde K2-Horizon destaca por su contexto nativo de 512K, muy superior a la mayoria de modelos de su categoria.

## Limitaciones y advertencias

- Solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de generacion libre.
- El tamano del repositorio (2471.5 GB) puede suponer una barrera para su descarga y almacenamiento.
- No se ha confirmado soporte explicito de tool calling o function calling, aunque su orientacion a agentes sugiere que podria incorporarse.
- No se han publicado datos de sesgos o evaluaciones de seguridad en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de los datasets de entrenamiento para posibles restricciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Dataset de pretraining: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
