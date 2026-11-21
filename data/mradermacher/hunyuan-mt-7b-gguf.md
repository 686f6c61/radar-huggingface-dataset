# mradermacher/Hunyuan-MT-7B-GGUF

## Resumen

Hunyuan-MT-7B-GGUF es la distribucion en formato GGUF del modelo de traduccion automatica Hunyuan-MT-7B, desarrollado originalmente por Tencent y cuantizado por el usuario mradermacher. Se trata de un modelo especializado en traduccion multilingue que cubre 33 idiomas, incluidos el chino, el ingles, el castellano, el frances, el aleman, el japones, el arabe, el coreano o el hindi, entre otros. Su proposito es ofrecer traduccion neuronal de calidad en local, sin depender de APIs externas.

El modelo base cuenta con 7.504.932.864 parametros (aproximadamente 7,5 mil millones) y esta disenado especificamente para la tarea de traduccion (pipeline `translation`), no como un modelo de proposito general. Esta especializacion permite obtener un rendimiento competitivo en pares de idiomas con un coste computacional moderado, lo que lo hace apto para despliegues en hardware de consumo.

La relevancia de esta version GGUF radica en que permite ejecutar el modelo con llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.) en GPUs de consumo e incluso en CPU, con un abanico de cuantizaciones que van desde Q2_K (3,1 GB) hasta f16 (15,1 GB). Esto democratiza el acceso a un traductor multilingue de calidad sin necesidad de infraestructura de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer para traduccion, segun pipeline `translation`) |
| Parametros totales | 7.504.932.864 (aproximadamente 7,5 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (y variantes imatrix en el repo i1-GGUF) |
| Idiomas soportados | 33: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su naturaleza transformer y su especializacion en traduccion. El modelo original (tencent/Hunyuan-MT-7B) es un modelo de 7,5 mil millones de parametros orientado a traduccion automatica multilingue, pero los detalles sobre composicion del dataset de entrenamiento, numero de tokens, tecnicas de alineacion (RLHF/DPO) o innovaciones arquitectonicas concretas no estan recogidos en la informacion proporcionada.

Respecto a esta version, mradermacher ha generado cuantizaciones estaticas (sin imatrix) del modelo original, ademas de un repositorio separado con cuantizaciones ponderadas/imatrix (`Hunyuan-MT-7B-i1-GGUF`) que suelen ofrecer mejor calidad a igual tamano. Las cuantizaciones estaticas se generan con el conversor estandar de GGUF y son compatibles con llama.cpp y derivados.

## Capacidades

- Traduccion automatica multilingue entre 33 idiomas, incluidos pares poco frecuentes en modelos generalistas (tibetano, khmer, birmano, mongol, uigur, kazajo, etc.).
- Generacion de texto conversacional en el contexto de tareas de traduccion (tag `conversational`).
- Especializacion: el modelo esta entrenado para traduccion, no como modelo de proposito general; no se documentan capacidades de codigo, matematicas o razonamiento general.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite su despliegue en infraestructuras de inferencia que acepten el formato.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues amplias: cubre idiomas de Europa, Asia oriental, Asia meridional, Oriente Medio y Asia central.

## Casos de uso

- Traduccion de documentacion tecnica en local: el modelo puede traducir manuales y guias entre castellano, ingles, aleman y frances sin enviar datos a servicios en la nube, usando la cuantizacion Q4_K_M (4,7 GB) en una GPU de consumo.
- Localizacion de productos para mercados asiaticos: con soporte para chino, japones, coreano, tailandes, vietnamita, indonesio y malayo, es adecuado para equipos que necesitan localizar interfaces y contenidos sin depender de APIs de terceros.
- Traduccion de contenido para comunidades minoritarias: al cubrir tibetano, khmer, birmano, mongol, uigur o kazajo, permite proyectos de preservacion linguistica y acceso a informacion en idiomas con poca cobertura en modelos comerciales.
- Procesamiento por lotes de corpus: desplegado con llama.cpp o vLLM (segun compatibilidad), permite traducir grandes volumenes de texto de forma reproducible y con coste fijo de hardware.
- Integracion en pipelines de edicion: la cuantizacion Q4_K_S o Q4_K_M, marcadas como "fast, recommended" por el autor, permite traduccion interactiva en herramientas de escritura con latencia baja en GPUs consumer.
- Traduccion de correspondencia y atencion al cliente multilingue: el tag `conversational` sugiere uso en conversaciones; puede integrarse en flujos de soporte para responder en el idioma del usuario y traducir al idioma del agente.
- Despliegue en entornos con requisitos de soberania de datos: al ejecutarse en local (CPU o GPU), evita la exposicion de textos sensibles a servicios externos, relevante para administraciones y sector sanitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K unos 3,1 GB; Q3_K_S unos 3,5 GB; Q4_K_S unos 4,5 GB; Q4_K_M unos 4,7 GB; Q5_K_M unos 5,5 GB; Q6_K unos 6,3 GB; Q8_0 unos 8,1 GB; f16 unos 15,1 GB. A estas cifras hay que anadir el espacio para el contexto KV cache, que depende de la longitud de contexto configurada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4 a Q8; A100 o H100 para f16 y para alto throughput por lotes.
- Cabe en GPU de consumo: si. Las cuantizaciones Q2_K a Q6_K caben en GPUs de 6-8 GB; Q8_0 requiere al menos 10-12 GB; f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con GGUF; el repo base (safetensors) es compatible con transformers. No se confirma soporte de vLLM o TGI para esta version GGUF en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El autor recomienda Q4_K_S y Q4_K_M como opciones rapidas y de buena calidad, y Q8_0 como la de mejor calidad con velocidad alta.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. A continuacion se comparan caracteristicas objetivas con alternativas de la misma categoria (traduccion especializada de tamano similar):

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hunyuan-MT-7B-GGUF (este) | 7,5 B | 33 | GGUF (multiples cuantizaciones) | no disponible | Especializado en traduccion; ejecutable en local |
| Modelo base tencent/Hunyuan-MT-7B | 7,5 B | 33 | safetensors | no disponible | Version original sin cuantizar |
| Alternativas de traduccion de 7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La licencia no esta disponible en la informacion proporcionada; antes de un uso comercial es imprescindible verificar la licencia del modelo base (tencent/Hunyuan-MT-7B) en su repositorio de Hugging Face.
- Modelo especializado en traduccion: no debe esperarse un rendimiento de proposito general en codigo, matematicas o razonamiento; su uso fuera de la traduccion puede dar resultados pobres.
- Riesgo de alucinacion y de traducciones infieles en pares de idiomas con pocos recursos (tibetano, uigur, mongol, khmer, birmano), donde la calidad suele ser inferior a la de pares mayoritarios.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M u Q8_0 para produccion.
- La longitud de contexto no esta documentada; para documentos largos conviene dividir el texto en segmentos y validar el comportamiento.
- Las cuantizaciones estaticas de este repo pueden ser inferiores en calidad a las imatrix del repo `Hunyuan-MT-7B-i1-GGUF`; evaluar ambas si la calidad es critica.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con datos web multilingues es probable que herede sesgos culturales y estereotipos presentes en dichos datos.
- El modelo no incorpora mecanismos documentados de moderacion; en produccion conviene anadir filtros externos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Hunyuan-MT-7B-GGUF
- Modelo base: https://huggingface.co/tencent/Hunyuan-MT-7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Hunyuan-MT-7B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Hunyuan-MT-7B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor: https://www.nethype.de/
