# mradermacher/ProWork-PDF-27B-i1-GGUF

## Resumen

ProWork-PDF-27B-i1-GGUF es una cuantizacion GGUF del modelo ProWork-PDF-27B, desarrollado originalmente por aibuildai-inc y cuantizado por mradermacher. Se trata de un modelo de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) orientado a la comprension de documentos PDF y tareas de trabajo del conocimiento (knowledge work). El modelo base esta etiquetado como vision model, lo que implica capacidades multimodales para procesar documentos escaneados o con contenido grafico, aunque los ficheros mmproj necesarios para la vision se distribuyen en el repositorio de cuantizaciones estaticas, no en este.

Esta publicacion concreta es una coleccion de cuantizaciones i1 (imatrix) generadas con la herramienta de mradermacher, que incluye desde Q2_K hasta Q6_K, con tamanos que van de 11,0 GB a 22,5 GB. El objetivo es facilitar el despliegue local del modelo en hardware de consumo mediante llama.cpp y formatos GGUF, manteniendo la mayor calidad posible gracias al uso de matrices de importancia (imatrix) en el proceso de cuantizacion.

La relevancia actual radica en que permite ejecutar un modelo especializado en documentos de 27B en GPUs consumer y estaciones de trabajo, con licencia Apache 2.0, lo que habilita su uso comercial sin restricciones adicionales. No obstante, la informacion publicada sobre el modelo base es muy limitada: no se detallan arquitectura, contexto, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); disponibles tambien cuantizaciones estaticas en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers como libreria declarada; pesos originales del modelo base presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base ProWork-PDF-27B en la documentacion proporcionada. El numero de parametros (27,3B) y la etiqueta de vision model sugieren un transformer multimodal con un codificador visual acoplado, pero no se confirma el tipo exacto de arquitectura, el mecanismo de atencion ni la composicion del dataset de entrenamiento. Tampoco se especifican el numero de tokens de entrenamiento, si hubo fases de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

Lo que si se documenta es el proceso de cuantizacion: mradermacher ha generado cuantizaciones i1 (imatrix) utilizando un fichero de matriz de importancia (ProWork-PDF-27B.imatrix.gguf, 0,1 GB) que pondera los pesos segun su relevancia, lo que mejora la calidad respecto a cuantizaciones estaticas del mismo tamano. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y ofrece notas de calidad por cada variante (por ejemplo, i1-IQ3_S "beats Q3_K*" o i1-Q4_K_M como "fast, recommended"). Se menciona tambien que el modelo es de vision y que los ficheros mmproj, si existen, estan en el repositorio de cuantizaciones estaticas (mradermacher/ProWork-PDF-27B-GGUF).

## Capacidades

- Comprension de documentos PDF: el modelo esta etiquetado como document-understanding y pdf, orientado a extraer y razonar sobre contenido de documentos.
- Capacidades de vision: el autor lo describe como vision model, con soporte para procesar imagenes o paginas escaneadas (requiere ficheros mmproj del repositorio estatico).
- Tareas de knowledge work: etiqueta knowledge-work, orientado a tareas de oficina y analisis documental.
- Generacion de texto conversacional: la etiqueta conversational sugiere uso en dialogos multi-turno.
- Compatibilidad con endpoints: tag endpoints_compatible, lo que indica integracion con APIs compatibles (por ejemplo, servidores de inferencia tipo OpenAI-compatible).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (en).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Extraccion de datos de facturas y albaranes: el modelo puede procesar PDFs con estructura variable y devolver campos clave (importes, fechas, emisores) en formato estructurado, aprovechando su especializacion en document-understanding y su capacidad de vision para documentos escaneados.
- Analisis de contratos y documentacion legal: con 27,3B parametros y cuantizacion Q4_K_M (16,9 GB), puede ejecutarse en una estacion de trabajo con una RTX 4090 y resumir clausulas, detectar riesgos o responder preguntas sobre el articulado.
- Digitalizacion de archivos historicos: al ser un vision model, permite procesar PDFs escaneados sin capa de texto, transcribiendo y estructurando el contenido para su indexacion en buscadores internos.
- Asistencia en tramitacion administrativa: integrado via endpoints compatibles, puede responder consultas de ciudadanos o empleados sobre formularios y procedimientos a partir de la documentacion oficial en PDF.
- Generacion de resumenes ejecutivos de informes: para equipos de analisis que reciben informes extensos en PDF, el modelo puede producir resumenes y extraer tablas o graficos relevantes, con despliegue local para cumplir requisitos de confidencialidad.
- Procesamiento por lotes en pipeline documental: mediante llama.cpp o servidores compatibles, se pueden encolar miles de PDFs para clasificacion, extraccion de metadatos y enrutamiento, usando la cuantizacion Q4_K_S (15,9 GB) como equilibrio entre velocidad y calidad.
- Chatbot interno sobre base documental: con la variante Q5_K_M (19,6 GB) en una GPU de 24 GB, se puede desplegar un asistente conversacional que consulte manuales y politicas internas en PDF, manteniendo los datos dentro de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto ni cache KV):
  - i1-Q2_K: 11,0 GB
  - i1-IQ3_S / i1-IQ3_M: 12,7-12,9 GB
  - i1-Q4_K_S: 15,9 GB
  - i1-Q4_K_M: 16,9 GB
  - i1-Q5_K_M: 19,6 GB
  - i1-Q6_K: 22,5 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con margen ajustado; RTX 3090 (24 GB) similar; A100 40/80 GB o H100 para Q6_K con contexto amplio y mayor paralelismo; GPUs de 16 GB (RTX 4080, 4060 Ti 16GB) solo para Q3 o Q4_K_S con contexto reducido.
- Cabe en GPU consumer: si, en RTX 4090/3090 para cuantizaciones hasta Q5_K_M; en GPUs de 16 GB para Q3/IQ3 y Q4_K_S con contexto limitado; en GPUs de 12 GB solo Q2_K o IQ3 muy ajustado, probablemente con offload parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), servidores compatibles con endpoints (tag endpoints_compatible), y potencialmente vLLM/TGI si se convierte o se usa el modelo base en safetensors (no confirmado para GGUF).
- Latencia y throughput: no disponibles. Como referencia orientativa no verificada, un modelo denso de 27B en Q4_K_M en una RTX 4090 suele moverse en el orden de decenas de tokens por segundo, pero no hay datos publicados para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de modelos comparables directos en la informacion proporcionada. Se ofrece una comparacion estructural basica:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ProWork-PDF-27B-i1-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF (i1) | Especializado en PDF y vision; cuantizaciones de 11 a 22,5 GB |
| Modelo base ProWork-PDF-27B | 27,3B | no disponible | Apache 2.0 | safetensors (presumible) | Version sin cuantizar; referencia para calidad maxima |
| Alternativas de 27-32B en GGUF | ~27-32B | variable | variable | GGUF | No se identifican alternativas concretas con datos verificables en la informacion disponible |

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Sesgos: no hay informacion sobre sesgos conocidos del modelo base; al ser un modelo entrenado presumiblemente con datos web, es probable que herede sesgos de esos datos, pero no se confirma.
- Alucinacion: no hay evaluaciones publicadas; en tareas de extraccion documental, la alucinacion de campos o cifras es un riesgo critico que requiere validacion posterior.
- Contexto: se desconoce la longitud de contexto; para documentos PDF extensos esto es una limitacion importante a verificar antes de produccion.
- Vision: los ficheros mmproj no estan en este repositorio, sino en el de cuantizaciones estaticas; sin ellos, el modelo no procesa imagenes.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia y condiciones del modelo base original en aibuildai-inc/ProWork-PDF-27B por si hubiera terminos adicionales.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S pueden degradar notablemente el rendimiento; el propio autor recomienda IQ3_XXS o IQ3_S frente a Q3_K*, y Q4_K_M como opcion recomendada.
- Madurez: el repositorio tiene 0 likes y fue creado en noviembre de 2026; la documentacion del modelo base es escasa, lo que dificulta evaluar su fiabilidad en produccion.
- Repositorio de 218,6 GB: descargar todas las cuantizaciones consume mucho espacio; conviene bajar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mradermacher/ProWork-PDF-27B-i1-GGUF
- Modelo base: https://huggingface.co/aibuildai-inc/ProWork-PDF-27B
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/ProWork-PDF-27B-GGUF
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#ProWork-PDF-27B-i1-GGUF
- Guia de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
