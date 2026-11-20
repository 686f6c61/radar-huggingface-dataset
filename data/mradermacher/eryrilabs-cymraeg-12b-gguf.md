# mradermacher/EryriLabs-cymraeg-12B-GGUF

## Resumen

EryriLabs-cymraeg-12B-GGUF es la distribucion en formato GGUF del modelo EryriLabs-cymraeg-12B, un ajuste fino (fine-tuning) mediante LoRA del modelo base Gemma de 12B (etiquetado como "gemma4" en los tags del repositorio), especializado en lengua galesa (cymraeg) y en conversacion bilingue gales-ingles. Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que genera versiones estaticas en GGUF del modelo original de EryriLabs para facilitar su ejecucion en hardware de consumo mediante llama.cpp y derivados.

El modelo resuelve un problema concreto: la escasez de modelos de lenguaje de tamano medio con competencia real en gales, un idioma de bajos recursos con aproximadamente 900.000 hablantes. Al partir de un transformer denso de 12B parametros y ajustarlo con datasets especificos del idioma (corpus de Bangor, diccionarios y memorias de traduccion de Techiaith, y un Alpaca traducido al gales), se busca mejorar la generacion, la conversacion y la traduccion en gales sin perder las capacidades generales del modelo base.

La relevancia actual radica en que ofrece una via practica de despliegue local: los cuantizados GGUF van desde 4,9 GB (Q2_K) hasta 12,8 GB (Q8_0), lo que permite ejecutar el modelo en GPUs de consumo e incluso en CPU con memoria suficiente. La licencia Apache 2.0 facilita su adopcion comercial, aunque conviene verificar las condiciones del modelo base Gemma subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tuning LoRA sobre base Gemma de 12B, tag "gemma4") |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticos; no hay quants con imatrix) |
| Idiomas soportados | Gales (cy), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 83,4 GB con todos los cuantizados); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo original EryriLabs-cymraeg-12B es un ajuste fino mediante LoRA sobre un modelo base Gemma de 12B parametros (la model card del cuantizado lo etiqueta como "gemma4"). Se trata, por tanto, de un transformer denso de tipo decoder-only con atencion multi-cabeza estandar, sin mecanismos MoE ni arquitecturas hibridas. El repositorio de mradermacher no aporta detalles adicionales sobre la configuracion de capas, dimensiones ocultas ni cabezas de atencion.

El entrenamiento se realizo sobre una mezcla de datasets orientados al gales y a tareas generales: `techiaith/lecsicon-cymraeg-bangor` (lexico), `techiaith/cofnodycynulliad_en-cy` (memorias de traduccion ingles-gales), `techiaith/cardiff-university-tm-en-cy` (memorias de traduccion de la Universidad de Cardiff), `techiaith/banc-trawsgrifiadau-bangor` (banco de transcripciones de Bangor), `BangorAI/alpaca-cy-1` (instrucciones traducidas al gales), `nyu-mll/multi_nli` (inferencia de lenguaje natural) y `openai/gsm8k` (matematicas). No se especifican el numero de tokens de entrenamiento, la composicion exacta ni si hubo fases de RLHF o DPO. La innovacion principal es el ajuste LoRA sobre un modelo de 12B para reforzar un idioma de bajos recursos, combinando datos linguisticos especializados con datos de instruccion general.

## Capacidades

- Generacion de texto conversacional en gales e ingles, con capacidad de mantener dialogos multi-turno.
- Traduccion ingles-gales y gales-ingles, apoyada en los corpus de memorias de traduccion de Techiaith y de la Universidad de Cardiff.
- Razonamiento basico y resolucion de problemas matematicos, por la inclusion de GSM8K en el entrenamiento.
- Inferencia de lenguaje natural (NLI), por la inclusion de MultiNLI.
- Generacion de codigo: capacidad heredada del modelo base Gemma, no reforzada especificamente en el ajuste.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues limitadas a gales e ingles; no se declaran otros idiomas.
- Capacidades de vision o audio: no disponibles en esta variante.

## Casos de uso

- Atencion al cliente en gales: el modelo puede gestionar conversaciones multi-turno en gales e ingles, adecuado para administraciones publicas y empresas que operan en Gales y necesitan cumplir con requisitos de servicio bilingue.
- Traduccion de documentacion oficial: aprovechando los corpus de memorias de traduccion de Techiaith y Cardiff, se puede usar para pre-traducir textos administrativos, webs institucionales y materiales educativos antes de la revision humana.
- Generacion de contenido editorial en gales: redaccion de articulos, resumenes y publicaciones para medios locales o blogs, con la ventaja de que el modelo entiende el registro del idioma.
- Asistentes educativos bilingues: apoyo a estudiantes galesoparlantes en tareas de comprension lectora, redaccion y ejercicios de matematicas basicos (gracias a la inclusion de GSM8K).
- Despliegue local en estaciones de trabajo: los cuantizados Q4_K_S (7,1 GB) y Q4_K_M (7,5 GB) permiten ejecutar el modelo en una RTX 4070 o superior con llama.cpp u Ollama, sin depender de servicios en la nube.
- Prototipado de chatbots especializados: al tener licencia Apache 2.0, se puede integrar en productos comerciales internos y validar su calidad en gales antes de escalar a modelos mayores.
- Investigacion en procesamiento del lenguaje para lenguas de bajos recursos: sirve como punto de partida para estudiar el rendimiento de modelos de 12B en gales y comparar con alternativas multilingues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con Q2_K, 7-8 GB con Q4_K_S/Q4_K_M, 9-10 GB con Q6_K y 13-14 GB con Q8_0 (incluyendo overhead de contexto y cache KV).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100. Con cuantizados Q4 cabe en GPUs de consumo de 8 GB o mas; con Q8_0 requiere 16 GB o mas.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con Q4_K_M o Q5_K_M, y en RTX 4090 con Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. El repo tambien incluye el tag `text-generation-inference` y `endpoints_compatible`, aunque TGI no ejecuta GGUF de forma nativa; para TGI se usaria el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. Como referencia orientativa, un modelo denso de 12B en Q4_K_M en una RTX 4090 suele generar del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| EryriLabs-cymraeg-12B-GGUF | 11,9B | no disponible | cy, en | Apache 2.0 | GGUF | Ajuste especifico para gales sobre base Gemma 12B |
| EryriLabs-cymraeg-12B (original) | 11,9B | no disponible | cy, en | Apache 2.0 | safetensors | Modelo base del que derivan los GGUF |
| Gemma 12B (base) | ~12B | no disponible en la informacion | multilingue | Gemma Terms | safetensors, GGUF | Modelo general; peor rendimiento esperado en gales |
| Llama 3.1 8B | 8B | 128K | multilingue (8 oficiales) | Llama 3.1 Community | safetensors, GGUF | Menor tamano, sin especializacion en gales |

## Limitaciones y advertencias

- El modelo esta especializado en gales e ingles; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior al de modelos multilingues generales.
- Riesgo de alucinacion inherente a los modelos de 12B, especialmente en tareas factuales y en traduccion de terminologia muy tecnica.
- Los cuantizados de baja precision (Q2_K, Q3_K_S) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- La licencia del repositorio es Apache 2.0, pero el modelo base Gemma tiene sus propios terminos de uso; conviene revisar la compatibilidad antes de un despliegue comercial.
- No hay datos publicados sobre sesgos, contexto maximo ni evaluaciones de seguridad; se recomienda validacion propia antes de usar en produccion.
- El repositorio no incluye quants con imatrix (weighted), lo que puede limitar la calidad en tamanos pequenos frente a alternativas optimizadas.
- El modelo fue creado y actualizado en noviembre de 2026 segun los metadatos del repositorio; verificar la vigencia de los enlaces y del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EryriLabs-cymraeg-12B-GGUF
- Modelo base original: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-12B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#EryriLabs-cymraeg-12B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de quants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset Lexicon Cymraeg Bangor: https://huggingface.co/datasets/techiaith/lecsicon-cymraeg-bangor
- Dataset Cofnod y Cynulliad EN-CY: https://huggingface.co/datasets/techiaith/cofnodycynulliad_en-cy
- Dataset Cardiff University TM EN-CY: https://huggingface.co/datasets/techiaith/cardiff-university-tm-en-cy
- Dataset Banc Trawsgrifiadau Bangor: https://huggingface.co/datasets/techiaith/banc-trawsgrifiadau-bangor
- Dataset Alpaca CY: https://huggingface.co/datasets/BangorAI/alpaca-cy-1
