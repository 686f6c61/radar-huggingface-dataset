# mradermacher/OCR__merged_nanonets_3b-GGUF

## Resumen

OCR__merged_nanonets_3b-GGUF es la version cuantizada en formato GGUF del modelo omarabb315/OCR__merged_nanonets_3b, un modelo multimodal de aproximadamente 3.085 millones de parametros (3,08 B) orientado a tareas de reconocimiento optico de caracteres (OCR) y comprension de documentos. La cuantizacion la ha realizado mradermacher, un autor habitual en el ecosistema GGUF conocido por publicar versiones estaticas de modelos populares para su uso con llama.cpp y derivados.

El modelo original se ha generado mediante SFT (supervised fine-tuning) usando las librerias Unsloth y TRL, segun las etiquetas de la model card, y parece derivar de la familia Nanonets, especializada en modelos de vision-lenguaje para extraccion de informacion de documentos. El repositorio incluye tanto los pesos del modelo de lenguaje como un proyector multimodal (mmproj) en dos precisiones, lo que confirma que se trata de un modelo capaz de procesar imagenes ademas de texto.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo OCR multimodal de 3 B en hardware de consumo, algo poco habitual en el segmento de modelos de documentos, que suelen requerir GPUs de datacenter. No obstante, la informacion publicada por el autor es muy escasa: no hay benchmarks, no se detalla la longitud de contexto y la licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) con proyector mmproj; arquitectura interna no detallada |
| Parametros totales | 3.085.938.688 (3,08 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un modelo multimodal de 3,08 B de parametros construido sobre un transformer de lenguaje con un proyector visual (mmproj) que permite procesar imagenes ademas de texto. Segun las etiquetas del repositorio, se ha generado mediante SFT con Unsloth y TRL, y el nombre sugiere una fusion (merge) de pesos derivada de la familia Nanonets de OCR. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta publicacion no esta en el modelo en si, sino en la cuantizacion: mradermacher ha generado 12 variantes de cuantizacion estaticas (desde Q2_K hasta f16) mas dos versiones del proyector multimodal, lo que permite desplegar el modelo en entornos con recursos limitados mediante llama.cpp. No se han publicado cuantizaciones ponderadas (imatrix) para este modelo.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos, segun el nombre y la presencia del proyector multimodal.
- Comprension de documentos: extraccion de texto e informacion estructurada a partir de imagenes.
- Generacion de texto condicionada por entrada visual (vision-lenguaje).
- Procesamiento en ingles como unico idioma declarado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas y recibos: el modelo puede recibir la imagen de un documento y devolver el texto o los campos extraidos, aprovechando su naturaleza OCR para automatizar la entrada de datos contables en pequenas empresas sin infraestructura GPU dedicada.
- Extraccion de datos de formularios escaneados: al ser un modelo de 3 B cuantizable a 2 GB en Q4_K_M, puede ejecutarse en un portatil con GPU consumer para procesar lotes de formularios en local, evitando enviar documentos sensibles a la nube.
- Procesamiento de documentos en el borde (edge): su tamano reducido permite integrarlo en aplicaciones de escritorio o dispositivos con recursos limitados para tareas de lectura de documentos en tiempo real.
- Preprocesado en pipelines de RAG documental: el modelo puede transcribir imagenes de documentos antes de indexarlas en un sistema de recuperacion, usando llama.cpp como backend ligero dentro del pipeline.
- Prototipado rapido de soluciones OCR: gracias a las multiples cuantizaciones disponibles, un equipo puede evaluar el equilibrio calidad/recursos (Q4_K_S frente a Q8_0) antes de comprometerse con un despliegue mayor.
- Investigacion sobre modelos de vision-lenguaje pequenos: util para estudiar el comportamiento de modelos multimodales de 3 B en tareas de documentos y comparar el impacto de la cuantizacion en la precision del OCR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en Q2_K, 2,0 GB en Q4_K_M, 3,4 GB en Q8_0 y 6,3 GB en f16, a los que hay que sumar el proyector multimodal (0,9 GB en Q8_0 o 1,4 GB en f16).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones Q4; para f16 se recomienda al menos 8 GB. En datacenter, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB) o RTX 4090 (24 GB), incluso con margen para el proyector multimodal.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) son los entornos naturales para estos GGUF; el modelo base es compatible con transformers y con endpoints compatibles segun las etiquetas.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OCR__merged_nanonets_3b-GGUF | 3,08 B | no disponible | no disponible | GGUF | Cuantizaciones estaticas, multimodal con mmproj |
| Modelo base omarabb315/OCR__merged_nanonets_3b | 3,08 B | no disponible | no disponible | safetensors | Version original sin cuantizar |
| Alternativas OCR de 3 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base (omarabb315/OCR__merged_nanonets_3b).
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- No hay benchmarks publicados, por lo que no se puede verificar la calidad del OCR frente a alternativas comerciales o academicas.
- La cuantizacion puede degradar la precision del OCR, especialmente en Q2_K y Q3; se recomienda Q4_K_M o superior para tareas de extraccion de texto.
- Riesgo de alucinacion inherente a los modelos de lenguaje: puede generar texto no presente en la imagen del documento, por lo que conviene validar las extracciones en produccion.
- No se dispone de informacion sobre sesgos, longitud de contexto ni limitaciones especificas del entrenamiento.
- El modelo se ha generado mediante SFT y merge de pesos; no hay documentacion sobre la procedencia exacta de los datos de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OCR__merged_nanonets_3b-GGUF
- Modelo base: https://huggingface.co/omarabb315/OCR__merged_nanonets_3b
- Pagina de descargas del autor: https://hf.tst.eu/model#OCR__merged_nanonets_3b-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
