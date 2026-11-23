# mradermacher/EryriLabs-cymraeg-12B-GGUF

## Resumen

EryriLabs-cymraeg-12B es un modelo de lenguaje conversacional de aproximadamente 11.900 millones de parametros, afinado mediante LoRA sobre una base de la familia Gemma (la model card lo etiqueta como "gemma4") por EryriLabs. Su proposito es ofrecer generacion de texto de calidad en gales (cymraeg) e ingles, un par de idiomas para el que la mayoria de modelos abiertos de gran tamano rinden de forma deficiente. La ficha que nos ocupa es la cuantizacion estatica en GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo.

El modelo esta disenado para tareas conversacionales y de instrucciones en gales, apoyandose en un conjunto de datos de entrenamiento especificamente gales: lexicos de Bangor, memorias de traduccion institucionales (Cynulliad, Cardiff University), transcripciones y un dataset tipo Alpaca en gales (BangorAI/alpaca-cy-1), complementados con MultiNLI y GSM8K para preservar capacidades de razonamiento e inferencia en ingles.

Es relevante porque cubre un nicho poco atendido: la IA generativa en lenguas minoritarias. La licencia CC BY-NC 4.0 restringe el uso comercial, lo que condiciona su adopcion en produccion. El repositorio GGUF incluye 11 cuantizaciones (de Q2_K a Q8_0) con tamanos entre 4,9 GB y 12,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base de la familia Gemma, etiquetada "gemma4" en la model card), afinada con LoRA |
| Parametros totales | 11.907.350.576 (aprox. 11,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); existen tambien cuantizaciones ponderadas/imatrix en el repo i1-GGUF |
| Idiomas soportados | Gales (cy) e ingles (en) |
| Licencia | CC BY-NC 4.0 (no comercial) |
| Formato de pesos | GGUF (el modelo base original esta en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo parte de una base de la familia Gemma (la model card la identifica como "gemma4") y se afina mediante LoRA, no mediante un preentrenamiento desde cero. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; esos datos figuran como no disponibles. La arquitectura subyacente es, por tanto, un transformer decoder-only estandar, sin innovaciones declaradas como atencion lineal, decodificacion especulativa o mezcla de expertos.

El entrenamiento se apoya en un corpus gales especifico: el lexico de Bangor (techiaith/lecsicon-cymraeg-bangor), memorias de traduccion del Cynulliad y de la Universidad de Cardiff, el banco de transcripciones de Bangor y el dataset de instrucciones BangorAI/alpaca-cy-1. Para no degradar capacidades generales se incluyen tambien nyu-mll/multi_nli y openai/gsm8k. La publicacion de esta ficha corresponde a la cuantizacion GGUF estatica realizada por mradermacher a partir de los pesos originales en transformers.

## Capacidades

- Generacion de texto conversacional multi-turno en gales e ingles.
- Seguimiento de instrucciones (fine-tuning tipo Alpaca en gales).
- Razonamiento basico e inferencia natural, reforzado con MultiNLI y GSM8K durante el ajuste.
- Traduccion y generacion bilingue cy-en, apoyada en memorias de traduccion institucionales.
- Generacion de texto con plantillas de chat (etiqueta "conversational").
- Compatible con text-generation-inference y con el ecosistema GGUF (llama.cpp, Ollama, LM Studio).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Modo thinking, vision o audio: no disponible en la informacion.

## Casos de uso

- Atencion al cliente en gales: el modelo puede gestionar conversaciones multi-turno en cymraeg, un idioma con escasa cobertura en modelos abiertos, lo que encaja en administraciones publicas y empresas galesas con obligaciones linguisticas.
- Traduccion asistida cy-en: aprovecha las memorias de traduccion del Cynulliad y de Cardiff University usadas en el entrenamiento para borradores de traduccion que un revisor humano pule despues.
- Generacion de contenido editorial en gales: redaccion de articulos, resumenes y comunicados para medios y organismos que publican en cymraeg.
- Educacion y materiales didacticos: generacion de ejercicios, explicaciones y resumenes en gales para escuelas y cursos de lengua.
- Prototipado de asistentes bilingues: al estar disponible en GGUF, se puede desplegar en local con Ollama o llama.cpp para pruebas de concepto sin depender de APIs externas.
- Investigacion en NLP de lenguas minoritarias: sirve como punto de partida para evaluar y comparar el rendimiento en gales frente a modelos multilingues genericos.
- Despliegue en hardware modesto: las cuantizaciones Q4_K_M (7,5 GB) o Q5_K_M (8,6 GB) permiten ejecucion en GPUs de consumo para tareas de inferencia por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~4,9 GB; Q3_K_M ~6,2 GB; IQ4_XS ~6,8 GB; Q4_K_M ~7,5 GB; Q5_K_M ~8,6 GB; Q6_K ~9,9 GB; Q8_0 ~12,8 GB (tamanos de fichero; la VRAM necesaria es algo mayor por el contexto y los buffers de inferencia).
- GPU recomendadas: para Q4_K_M o Q5_K_M basta una RTX 3060 de 12 GB o una RTX 4070; para Q8_0 se recomienda una RTX 4090 (24 GB) o una A100/H100 si se busca mayor contexto y concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB usando cuantizaciones Q3 a Q5; las Q2_K y Q3_K_S permiten incluso GPUs de 6-8 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (el modelo base es compatible con TGI) y vLLM para los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EryriLabs-cymraeg-12B (este) | 11,9 B | no disponible | cy, en | CC BY-NC 4.0 | GGUF, safetensors |
| Modelos Gemma base de tamano similar | ~12 B (segun familia) | no disponible | multilingue | terminos Gemma | safetensors, GGUF |
| Modelos multilingues genericos de ~12 B | ~12 B | no disponible | multilingue | variable | GGUF, safetensors |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo con alternativas; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohibido el uso comercial sin autorizacion expresa; esto descarta su integracion en productos de pago.
- Riesgo de alucinacion: como cualquier modelo de ~12 B afinado, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Cobertura limitada a dos idiomas (cy, en); el rendimiento en otras lenguas no esta garantizado.
- Longitud de contexto no documentada: conviene validar experimentalmente el contexto efectivo antes de disenar aplicaciones con ventanas largas.
- La model card no detalla el dataset completo ni las fases de alineacion, lo que dificulta auditar sesgos o procedencia de datos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la perplejidad; para produccion se recomienda Q4_K_M o superior.
- El modelo es una cuantizacion de terceros (mradermacher); la responsabilidad sobre el comportamiento final recae en el modelo base de EryriLabs.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EryriLabs-cymraeg-12B-GGUF
- Modelo base: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-12B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/EryriLabs-cymraeg-12B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#EryriLabs-cymraeg-12B-GGUF
- Preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Dataset: https://huggingface.co/datasets/techiaith/lecsicon-cymraeg-bangor
- Dataset: https://huggingface.co/datasets/techiaith/cofnodycynulliad_en-cy
- Dataset: https://huggingface.co/datasets/techiaith/cardiff-university-tm-en-cy
- Dataset: https://huggingface.co/datasets/techiaith/banc-trawsgrifiadau-bangor
- Dataset: https://huggingface.co/datasets/BangorAI/alpaca-cy-1
- Dataset: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset: https://huggingface.co/datasets/openai/gsm8k
