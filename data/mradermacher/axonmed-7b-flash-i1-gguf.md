# mradermacher/AxonMed-7B-Flash-i1-GGUF

## Resumen

AxonMed-7B-Flash-i1-GGUF es la versión cuantizada en formato GGUF del modelo AxonMed-7B-Flash, desarrollado originalmente por Saathimed y cuantizado por mradermacher. Se trata de un modelo de lenguaje especializado en dominio médico y sanitario, afinado para razonamiento clínico, respuesta a preguntas médicas y procesamiento de documentación clínica (incluidos registros de salud electrónicos). Con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), se posiciona en la franja de modelos compactos que pueden ejecutarse en hardware de consumo mediante cuantización.

La relevancia de esta ficha radica en que mradermacher publica una batería completa de cuantizaciones con imatrix (importancia matricial) que permiten desplegar el modelo desde 2,0 GB (IQ1_S) hasta 6,4 GB (Q6_K), cubriendo desde entornos con recursos muy limitados hasta configuraciones que preservan casi toda la calidad del modelo original. El repositorio ocupa 89,0 GB en total al alojar todas las variantes.

El modelo base está entrenado sobre datasets médicos de referencia como MedQA-USMLE-4-options, PubMedQA y medical-o1-reasoning-SFT, y declara soporte para inglés, español, chino, ruso, francés, alemán e hindi. La licencia Apache 2.0 facilita su uso comercial, aunque el dominio sanitario exige precauciones adicionales que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base Saathimed/AxonMed-7B-Flash); detalles internos no disponibles |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix/weighted) |
| Idiomas soportados | en, es, zh, ru, fr, de, hi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (multiples archivos por cuantizacion); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer de 7,6 mil millones de parametros. El modelo fue afinado sobre tres datasets: GBaker/MedQA-USMLE-4-options (preguntas de examen medico estilo USMLE con cuatro opciones), pubmed_qa (preguntas de investigacion biomedica con respuestas basadas en literatura) y FreedomIntelligence/medical-o1-reasoning-SFT (datos de ajuste supervisado orientados a razonamiento clinico). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion es el proceso de cuantizacion con imatrix (importance matrix), que calcula la importancia de cada peso del modelo usando un corpus de calibracion y ajusta la cuantizacion para minimizar la perdida de calidad en comparacion con las cuantizaciones estaticas. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y que las variantes i1-Q4_K_S y i1-Q4_K_M ofrecen el mejor equilibrio entre tamano, velocidad y calidad. No se documentan mecanismos como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento clinico en dominio medico, con enfasis en preguntas tipo USMLE y razonamiento paso a paso.
- Respuesta a preguntas basadas en literatura biomedica (PubMedQA).
- Procesamiento de documentacion clinica y registros de salud electronicos (segun los tags del modelo).
- Capacidades conversacionales multi-turno (tag "conversational").
- Soporte multilingue declarado para ingles, espanol, chino, ruso, frances, aleman e hindi.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el dataset medical-o1-reasoning-SFT sugiere entrenamiento en cadenas de razonamiento.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistencia a estudiantes de medicina: el modelo puede resolver preguntas de estilo USMLE con razonamiento explicado, aprovechando su entrenamiento sobre MedQA-USMLE-4-options para generar explicaciones paso a paso de cada opcion.
- Busqueda de evidencia biomedica: integrado en un pipeline RAG sobre PubMed, puede responder consultas de investigadores resumiendo articulos y citando hallazgos, gracias a su ajuste sobre PubMedQA.
- Triaje y preclasificacion de documentacion clinica: puede procesar notas de alta, historiales y registros de salud electronicos para extraer entidades y estructurar informacion antes de la revision humana.
- Generacion de resumenes de historiales clinicos: con una ventana de contexto adecuada (no confirmada), puede condensar notas de evolucion multi-dia en resumenes legibles para el personal sanitario.
- Educacion sanitaria para pacientes: puede reformular terminologia medica en lenguaje llano en varios idiomas, util para materiales divulgativos multilingues (es, en, fr, de, etc.).
- Despliegue en entornos con recursos limitados: las cuantizaciones i1-Q4_K_M (4,8 GB) e i1-IQ4_XS (4,3 GB) permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo, facilitando prototipos locales sin depender de la nube, algo relevante por la confidencialidad de datos sanitarios.
- Soporte a codificacion clinica (CIE-10, SNOMED): puede asistir en la sugerencia de codigos a partir de descripciones textuales, siempre con validacion por codificadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, PubMedQA, MedQA ni de ninguna otra evaluacion, ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - i1-IQ1_S: ~2,0 GB
  - i1-IQ2_M: ~2,9 GB
  - i1-IQ3_M: ~3,7 GB
  - i1-IQ4_XS: ~4,3 GB
  - i1-Q4_K_M: ~4,8 GB
  - i1-Q5_K_M: ~5,5 GB
  - i1-Q6_K: ~6,4 GB
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB permiten ejecutar las cuantizaciones de 4-6 bits con margen para contexto. Para despliegue en servidor, A100 o H100 son sobredimensionadas para un modelo de 7,6 B pero validas para alta concurrencia.
- Cabe en GPU de consumo: si, practicamente todas las cuantizaciones de 4 bits o menos caben en GPUs con 6-8 GB de VRAM; las de 5-6 bits requieren 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa (requieren el modelo en safetensors), por lo que para esos motores habria que usar el modelo base Saathimed/AxonMed-7B-Flash.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| AxonMed-7B-Flash-i1-GGUF | 7,6 B | no disponible | Medico/clinico | Apache 2.0 | GGUF |
| Modelo base Saathimed/AxonMed-7B-Flash | 7,6 B | no disponible | Medico/clinico | Apache 2.0 | safetensors |
| Alternativas medicas de ~7 B (p. ej. variantes de BioMistral, Meditron) | ~7 B | no disponible en esta ficha | Medico | variable | safetensors/GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y formato. Cualquier afirmacion sobre calidad relativa requeriria ejecutar los benchmarks correspondientes.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar afirmaciones medicas plausibles pero incorrectas; en dominio clinico esto es especialmente critico y exige revision por profesionales cualificados.
- Sesgos: no documentados por el autor; los datasets de origen (USMLE, PubMed) estan sesgados hacia practica medica occidental y literatura en ingles, lo que puede afectar a la calidad en otros contextos sanitarios.
- Limitaciones de contexto e idioma: la longitud de contexto no esta especificada; el soporte multilingue esta declarado pero no se aportan evaluaciones por idioma, por lo que el rendimiento en espanol, hindi o ruso puede ser inferior al del ingles.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el despliegue en entornos sanitarios regulados (MDR en la UE, HIPAA en EE. UU.) requiere evaluaciones de conformidad adicionales que el modelo no cubre.
- Cuantizaciones de baja calidad: las variantes IQ1 e IQ2 estan etiquetadas por el propio autor como "for the desperate" o "very low quality"; no son adecuadas para produccion clinica.
- Ausencia de benchmarks: no hay evidencia publicada del rendimiento del modelo en tareas medicas estandar, lo que impide validar su calidad frente a alternativas.
- Fecha de creacion del repositorio (2026-11-18) y ausencia de likes/descargas moderadas (1.916 descargas) sugieren un modelo poco contrastado por la comunidad; conviene tratarlo con cautela en produccion.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/AxonMed-7B-Flash-i1-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B-Flash
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/AxonMed-7B-Flash-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#AxonMed-7B-Flash-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
