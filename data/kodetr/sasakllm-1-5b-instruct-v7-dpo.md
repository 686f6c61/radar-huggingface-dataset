# kodetr/SasakLLM-1.5B-Instruct-v7-DPO

## Resumen

SasakLLM-1.5B-Instruct-v7-DPO es un adaptador LoRA afinado sobre Qwen2.5-1.5B-Instruct, desarrollado por el usuario kodetr, orientado a la generacion de texto conversacional en lengua sasak (sas), un idioma regional hablado principalmente en la isla de Lombok (Indonesia), con soporte secundario de indonesio (id). El modelo parte del checkpoint base Qwen2.5-1.5B-Instruct y aplica una capa de alineamiento por Direct Preference Optimization (DPO) sobre una version previa del propio proyecto (SasakLLM-1.5B-Instruct-v7), entrenada sobre un dataset unificado de 27.964 muestras.

El problema que aborda es la escasez de modelos conversacionales de calidad para lenguas regionales de Indonesia con pocos recursos digitales. El autor declara cinco objetivos explicitos de alineamiento: fluidez conversacional en registro cotidiano y formal, eliminacion de filtraciones de indonesio, javanes y sundanes, aplicacion del sistema de cortesia undak-usuk basa (registro alus/krama), prevencion de alucinaciones culturales y geograficas sobre Lombok, y precision en la clasificacion de los cinco dialectos descritos por Mahsun (2006): Meno-Mene, Ngeno-Ngene, Kuto-Kute, Ngeto-Ngete y Meriaq-Meriku.

Es relevante por dos motivos: primero, demuestra un flujo de trabajo reproducible de alineamiento por preferencias para una lengua de bajos recursos sobre un modelo pequeno (1.5B parametros); segundo, el adaptador es ligero (repo de 0,1 GB) y se distribuye bajo licencia Apache 2.0, lo que facilita su reutilizacion e inspeccion. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) sobre el checkpoint base |
| Parametros totales | 1,5 mil millones (modelo base Qwen2.5-1.5B-Instruct; el adaptador LoRA anade un subconjunto no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del base Qwen2.5-1.5B-Instruct, no confirmada por el autor) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base y del runtime) |
| Idiomas soportados | sas (sasak), id (indonesio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar Qwen/Qwen2.5-1.5B-Instruct por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) montado sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5B parametros. El autor no detalla en la model card la configuracion del adaptador (rango, alpha, modulos objetivo) ni los hiperparametros de entrenamiento. El proceso declarado es en dos fases: primero un ajuste supervisado sobre un "Master Unified Dataset" de 27.964 muestras que produce SasakLLM-1.5B-Instruct-v7, y despues una fase de DPO sobre ese checkpoint para alinear preferencias conversacionales.

La innovacion principal no es arquitectonica sino de datos y alineamiento: el autor construye pares de preferencia (chosen/rejected) orientados a corregir fallos especificos de la lengua sasak, como la mezcla con indonesio o javanes, el uso incorrecto del registro de cortesia y las afirmaciones ficticias sobre cultura o geografia de Lombok. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF mas alla del DPO.

## Capacidades

- Generacion de texto conversacional multi-turno en lengua sasak, con registro cotidiano y formal.
- Aplicacion del sistema de cortesia undak-usuk basa (registro alus/krama) en saludos y trato con interlocutores de mayor edad o invitados.
- Clasificacion y uso de los cinco dialectos sasak descritos por Mahsun (2006): Meno-Mene, Ngeno-Ngene, Kuto-Kute, Ngeto-Ngete y Meriaq-Meriku.
- Mitigacion de filtraciones de indonesio, javanes y sundanes en las respuestas (objetivo declarado del DPO).
- Rechazo honesto (honest refusal) ante preguntas sobre mitos o datos culturales/geograficos ficticios de Lombok.
- Soporte de indonesio como idioma secundario, heredado del modelo base.
- Capacidades generales del base Qwen2.5-1.5B-Instruct (razonamiento basico, codigo, matematicas) potencialmente degradadas o no garantizadas tras el ajuste especifico.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (no se documenta en la model card).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision y audio: no soportados.

## Casos de uso

- Atencion al ciudadano en sasak: el modelo puede gestionar conversaciones multi-turno con registro de cortesia adecuado para atender consultas de hablantes de sasak en servicios publicos locales de Lombok, usando el registro alus cuando el interlocutor lo requiera.
- Preservacion linguistica y digitalizacion: generacion de material textual en sasak para corpus, diccionarios o aplicaciones educativas, aprovechando el enfasis del DPO en vocabulario autentico y en evitar mezcla con indonesio o javanes.
- Asistente cultural con rechazo controlado: en aplicaciones turisticas o divulgativas sobre Lombok, el modelo esta entrenado para declinar afirmaciones ficticias sobre cultura o geografia, lo que reduce el riesgo de difundir mitos erroneos.
- Clasificacion dialectal asistida: apoyo a investigadores o docentes en la identificacion de variantes dialectales del sasak (Meno-Mene, Ngeno-Ngene, Kuto-Kute, Ngeto-Ngete, Meriaq-Meriku) en textos o transcripciones.
- Chatbot de bajo coste en dispositivos modestos: al ser un adaptador sobre un modelo de 1,5B, puede desplegarse en GPUs de consumo o en CPU con cuantizacion del base, util para prototipos y demos locales.
- Investigacion en alineamiento para lenguas de bajos recursos: el par chosen/rejected del DPO y el flujo LoRA + DPO sirven como referencia metodologica reproducible para otros idiomas regionales.
- Educacion y tutoria linguistica: ejercicios de practica de registro formal e informal en sasak, con respuestas generadas en el idioma objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la etiqueta `academic-benchmark` pero no incluye tablas, metricas ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-1.5B-Instruct en fp16 ocupa aproximadamente 3 GB de pesos; con overhead de activaciones y KV cache, se recomienda un minimo de 4-6 GB de VRAM. El adaptador LoRA anade una cantidad marginal (repo de 0,1 GB).
- En cuantizacion de 8 bits, el base ronda los 1,5-2 GB de pesos; en 4 bits, aproximadamente 1 GB, lo que permite ejecucion en GPUs de consumo con 4 GB o mas.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para cuantizacion 4/8 bits basta con GPUs de 4 GB (GTX 1650, RTX 3050).
- Cabe en GPU de consumo: si, en la mayoria de modelos recientes con 4 GB o mas, especialmente con cuantizacion.
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor), vLLM y TGI con soporte de adaptadores LoRA, llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF. La model card solo documenta el flujo transformers + PEFT.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SasakLLM-1.5B-Instruct-v7-DPO | 1,5B + LoRA | no disponible | sas, id | Apache 2.0 | Adaptador DPO especifico para sasak; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | no disponible en la informacion proporcionada | multilingue (incluye id) | Apache 2.0 | Modelo base; no cubre sasak de forma especifica |
| SasakLLM-1.5B-Instruct-v7 | 1,5B + LoRA | no disponible | sas, id | no disponible | Checkpoint previo al DPO del mismo autor; base del alineamiento |
| Alternativas para lenguas regionales de Indonesia | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni frente al checkpoint v7 previo al DPO.
- Modelo con cero descargas y cero likes en el momento de la consulta: no ha sido validado por la comunidad.
- El adaptador esta entrenado especificamente para sasak e indonesio; su rendimiento en otros idiomas no esta garantizado y puede degradarse respecto al base.
- Riesgo de alucinacion persistente: aunque el DPO se orienta a rechazar mitos culturales y geograficos, no hay evaluacion publicada de la tasa de errores factuales.
- Sesgos: no se documenta analisis de sesgos de genero, sociales o dialectales; el enfasis en el registro alus podria infrarepresentar variantes coloquiales o dialectos menos prestigiosos.
- Limitaciones de contexto: el autor no especifica la ventana de contexto efectiva tras el ajuste; se asume la del base, pero no esta confirmada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen2.5-1.5B-Instruct, cuya licencia debe respetarse por separado.
- El adaptador requiere cargar el base por separado; no es un checkpoint autonomo y no se distribuye en GGUF ni en formatos listos para llama.cpp/Ollama.
- No se documentan hiperparametros de entrenamiento, composicion del dataset ni metodologia de construccion de pares de preferencia, lo que dificulta la reproducibilidad.
- Fecha de creacion declarada en 2026-11-13, posterior a la consulta; conviene verificar la integridad y vigencia del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kodetr/SasakLLM-1.5B-Instruct-v7-DPO
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio PEFT: https://github.com/huggingface/peft
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Referencia dialectal citada por el autor: Mahsun (2006), sobre los cinco dialectos del sasak (no se proporciona enlace en la model card)
