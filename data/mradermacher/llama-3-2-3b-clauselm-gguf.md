# mradermacher/Llama-3.2-3B-ClauseLM-GGUF

## Resumen

Llama-3.2-3B-ClauseLM-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Z-Nadjib/Llama-3.2-3B-ClauseLM, realizadas por el cuantizador mradermacher. El modelo base es un ajuste fino de Llama 3.2 3B (arquitectura transformer densa de Meta) entrenado con QLoRA mediante la biblioteca Unsloth sobre el dataset CUAD (theatticusproject/cuad), un corpus de contratos legales anotados. Su propósito es la extracción de información de cláusulas contractuales con salida estructurada en JSON.

Este repositorio no es un modelo nuevo en sí, sino la versión cuantizada lista para ejecutarse localmente con llama.cpp, Ollama u otros runtimes compatibles con GGUF. Su relevancia radica en ofrecer un modelo ligero (unos 3.200 millones de parámetros) y especializado en el dominio legal-contractual, capaz de correr en hardware de consumo, algo útil para despachos, equipos de compliance o herramientas de revisión de contratos que necesitan procesar documentos sensibles sin enviarlos a APIs externas.

El repositorio incluye cuants desde Q2_K (1,5 GB) hasta f16 (6,5 GB), con recomendaciones del propio autor para Q4_K_S y Q4_K_M como opciones equilibradas. El modelo base hereda la licencia Llama 3.2 de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2), decoder-only |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible (Llama 3.2 3B base soporta 128.000 tokens, pero no consta en la informacion del repo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (el modelo base original usa safetensors) |

## Arquitectura y entrenamiento

El modelo base, Z-Nadjib/Llama-3.2-3B-ClauseLM, parte de Llama 3.2 3B, un transformer decoder-only denso de Meta con 3.212,7 millones de parametros. El ajuste fino se realizo con QLoRA (quantized Low-Rank Adaptation) usando la biblioteca Unsloth, una tecnica que permite entrenar sobre un modelo cuantizado en 4 bits reduciendo drasticamente los requisitos de memoria de entrenamiento, manteniendo los pesos base congelados y entrenando solo adaptadores de bajo rango.

El dataset de entrenamiento es CUAD (Contract Understanding Atticus Dataset), un corpus juridico de referencia que contiene mas de 500 contratos comerciales anotados por abogados con decenas de tipos de clausulas relevantes. El modelo se orienta a tareas de extraccion de informacion y salida estructurada en JSON sobre texto contractual. No hay informacion disponible sobre el numero de epocas, tokens de entrenamiento, hiperparametros ni uso de RLHF/DPO. Las cuantizaciones de este repo son estaticas; el autor indica que las cuants weighted/imatrix no estaban disponibles en el momento de publicacion.

## Capacidades

- Extraccion de informacion de clausulas en contratos comerciales (entrenado sobre CUAD)
- Generacion de salida estructurada en JSON a partir de texto legal
- Comprension de lenguaje natural en ingles, con especializacion en vocabulario juridico-contractual
- Generacion de texto conversacional general heredada del modelo base Llama 3.2 3B
- No hay informacion disponible sobre soporte de tool calling, function calling ni capacidades de agentes
- No hay informacion disponible sobre capacidades multimodales (vision, audio); todo apunta a un modelo de texto unico

## Casos de uso

- Revision automatizada de contratos: identificar clausulas de indemnizacion, limitacion de responsabilidad, renovacion automatica o terminacion en contratos de proveedores, clasificandolas segun la taxonomia de CUAD.
- Diligencia debida (due diligence): procesar grandes volumenes de acuerdos en fusiones y adquisiciones para localizar clausulas de riesgo antes de la revision humana.
- Compliance y auditoria interna: verificar que los contratos firmados contienen las clausulas obligatorias de la politica corporativa, generando informes JSON que alimentan cuadros de mando.
- Asistentes juridicos locales y privados: al ser un modelo de 3B cuantizado, puede ejecutarse on-premise en portatiles o estaciones de trabajo, evitando enviar documentos confidenciales a servicios en la nube.
- Preprocesamiento para pipelines RAG juridicos: extraer metadatos estructurados de clausulas para indexar contratos en bases de datos vectoriales con etiquetas precisas.
- Herramientas de legal tech de bajo coste: integrar el modelo en aplicaciones SaaS para pymes que necesitan analisis contractual basico sin coste de inferencia en APIs comerciales.
- Investigacion en NLP juridico: servir como baseline ligero y reproducible para experimentos de extraccion de clausulas en dominio legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base tampoco incluye metricas evaluadas en su model card, por lo que no es posible comparar su rendimiento en CUAD u otros benchmarks juridicos con datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamano del archivo GGUF es una buena aproximacion; Q4_K_M requiere unos 2,1 GB de memoria (mas contexto y overhead), Q8_0 unos 3,5 GB y f16 unos 6,5 GB.
- Cabe con holgura en GPUs de consumo: cualquier GPU con 4 GB o mas (RTX 3050, RTX 3060, RTX 4060 o superiores) ejecuta las cuants recomendadas sin problema. Tambien es viable su ejecucion solo en CPU gracias a llama.cpp, con velocidades razonables dado el tamano de 3B.
- GPU recomendadas: no requiere GPU dedicada; para despliegue con mayor throughput, una RTX 4090 o una A100 permiten servir multiples instancias concurrentes con vLLM o TGI.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM, TGI o transformers.
- Latencia y throughput: no disponible. Dado el tamano (3B), en GPU de consumo pueden esperarse decodes del orden de decenas de tokens por segundo, pero no hay cifras publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Formato | Licencia |
|---|---|---|---|---|
| Llama-3.2-3B-ClauseLM-GGUF | 3,21B | Extraccion de clausulas legales (CUAD), JSON | GGUF | Llama 3.2 |
| Llama 3.2 3B Instruct (base sin afinar) | 3,21B | Uso general, instruccion | GGUF, safetensors | Llama 3.2 |
| LegalBERT / modelos BERT juridicos | 110M-340M | Clasificacion y NER legal | safetensors | Varias (Apache/MIT en su mayoria) |

Frente al Llama 3.2 3B Instruct generalista, ClauseLM aporta conocimiento especifico del dominio contractual y salida estructurada, a costa de menor versatilidad conversacional. Frente a modelos BERT juridicos como LegalBERT, ofrece generacion de texto libre y JSON estructurado en lugar de solo clasificacion, con mas parametros pero mayor flexibilidad. No hay datos de rendimiento comparativos publicados entre ellos.

## Limitaciones y advertencias

- Solo soporta ingles: el dataset CUAD y el ajuste fino estan en ingles, por lo que su rendimiento en contratos en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion elevado en el dominio legal: los modelos de 3B pueden inventar clausulas o interpretaciones juridicas plausibles pero incorrectas; su salida debe revisarse siempre por profesionales cualificados y no sustituye asesoramiento juridico.
- Cuants de baja calidad: las versiones Q2_K y Q3_K_M pueden degradar notablemente la precision en una tarea fina como la extraccion de clausulas; se recomiendan Q4_K_M o superiores.
- Solo cuants estaticos: no hay versiones imatrix/weighted, lo que puede implicar algo menos de calidad frente a cuants equivalentes con imatrix.
- Restricciones de licencia: la Llama 3.2 Community License de Meta impone limitaciones de uso comercial (incluido el umbral de 700 millones de usuarios activos mensuales para licencia especial y ciertas restricciones sobre modelos derivados), que deben revisarse antes de cualquier despliegue comercial.
- Sin benchmarks publicados: no hay metricas verificables de exactitud en CUAD ni en otros datasets, por lo que la evaluacion debe hacerse internamente antes de produccion.
- Sin informacion sobre tool calling ni agentes: no es adecuado como base para sistemas agenticos sin validacion previa.

## Enlaces

- Repositorio cuantizado (GGUF): https://huggingface.co/mradermacher/Llama-3.2-3B-ClauseLM-GGUF
- Modelo base: https://huggingface.co/Z-Nadjib/Llama-3.2-3B-ClauseLM
- Dataset CUAD: https://huggingface.co/datasets/theatticusproject/cuad
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Llama-3.2-3B-ClauseLM-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
