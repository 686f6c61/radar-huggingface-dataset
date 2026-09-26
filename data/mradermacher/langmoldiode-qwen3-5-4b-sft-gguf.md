# mradermacher/LangMolDiode-Qwen3.5-4B-SFT-GGUF

## Resumen

LangMolDiode-Qwen3.5-4B-SFT-GGUF es la version cuantizada en formato GGUF del modelo ChemFM/LangMolDiode-Qwen3.5-4B-SFT, un ajuste fino supervisado (SFT) del Qwen3.5-4B orientado a quimica y, de forma especifica, a la generacion de cadenas SMILES a partir de texto (text-to-smiles). El modelo original lo desarrolla ChemFM, mientras que esta publicacion corre a cargo de mradermacher, que se limita a generar cuantizaciones estaticas del modelo base sin modificar los pesos de forma adicional.

El modelo cuenta con 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y esta entrenado sobre el corpus ChemFM/LangMolDiode-SFT-Corpus. La relevancia practica de esta ficha radica en que, al estar en GGUF, el modelo se puede ejecutar en hardware de consumo mediante llama.cpp y sus derivados (Ollama, LM Studio, etc.), lo que acerca un modelo especializado en quimica a entornos de investigacion con presupuesto limitado.

La informacion publicada por el autor de la cuantizacion es minima: se trata de cuantizaciones estaticas y no ponderadas (sin imatrix), e incluye ficheros mmproj, lo que sugiere que el modelo base conserva la capacidad multimodal de la familia Qwen3.5. No se documentan en el repositorio ni la longitud de contexto, ni la licencia, ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base derivado de Qwen3.5-4B; no se documenta en la informacion proporcionada) |
| Parametros totales | 4.205.751.296 (dato safetensors) |
| Parametros activos | No aplica / no disponible (no se documenta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (los cuantizados); el modelo base emplea safetensors |
| Tamano del repositorio | 39,9 GB |
| Modelo base | ChemFM/LangMolDiode-Qwen3.5-4B-SFT |
| Dataset de entrenamiento | ChemFM/LangMolDiode-SFT-Corpus |
| Autor de la cuantizacion | mradermacher |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna aportados por el autor. El modelo es un ajuste fino supervisado (SFT) del Qwen3.5-4B de Alibaba, cuya familia se describe publicamente como de LLM multimodales con razonamiento hibrido. El sufijo SFT indica que el entrenamiento se realizo mediante fine-tuning supervisado sobre el corpus LangMolDiode-SFT-Corpus, especializado en quimica; no se documenta si hubo fases posteriores de RLHF, DPO u otro tipo de alineamiento. Tampoco se especifica el numero de tokens de entrenamiento ni la composicion del dataset.

En cuanto a la innovacion tecnica destacable en esta publicacion concreta, es la propia cuantizacion: mradermacher ofrece cuantizaciones estaticas (sin calibracion ponderada/imatrix) en un rango que va de 2,0 GB (Q2_K) a 8,5 GB (f16), ademas de dos ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal. La ausencia de cuantizaciones ponderadas se indica explicitamente en la model card.

## Capacidades

- Generacion de texto conversacional, con soporte de plantilla de chat (etiqueta conversational en HuggingFace).
- Generacion de cadenas SMILES a partir de texto (text-to-smiles), que es la tarea para la que fue ajustado.
- Razonamiento en el dominio quimico segun el corpus de entrenamiento LangMolDiode-SFT-Corpus.
- Capacidad multimodal potencial en el modelo base, evidenciada por la publicacion de ficheros mmproj como suplemento multimodal; no se detalla que modalidades concretas cubre.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la ficha declara unicamente ingles.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Conversion de descripciones textuales a estructuras moleculares: a partir de una descripcion en lenguaje natural de un compuesto o de una familia de compuestos, el modelo genera la cadena SMILES correspondiente, que despues se puede validar con RDKit o Open Babel antes de introducirla en un pipeline de quimioinformatica.
- Enriquecimiento de bases de datos quimicas: procesar lotes de fichas tecnicas, patentes o articulos para extraer representaciones SMILES y normalizarlas de forma masiva en un sistema de gestion de compuestos.
- Asistencia en entornos de laboratorio de bajo presupuesto: al ejecutarse en formato GGUF con cuantizaciones desde 2,0 GB, se puede desplegar en un portatil o en una estacion de trabajo con GPU de gama media sin conexion a internet, lo que resulta util cuando hay restricciones de confidencialidad sobre los datos moleculares.
- Preprocesado en pipelines de descubrimiento de farmacos: generar candidatos SMILES iniciales que alimenten etapas posteriores de docking molecular, prediccion ADMET o filtrado por reglas de Lipinski.
- Prototipado de asistentes conversacionales especializados en quimica: dado su caracter conversacional, se puede integrar en un chatbot interno que responda a consultas sobre nomenclatura y representacion de moleculas, siempre con validacion posterior de la salida.
- Educacion y formacion: como apoyo en la traduccion entre nomenclatura y estructura quimica para estudiantes, con supervision humana y comprobacion sistematica de los resultados.
- Extraccion de informacion en revision bibliografica: procesar resumenes y secciones de resultados de articulos para obtener las estructuras descritas y construir un indice consultable de SMILES.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (el modelo completo, no la parte mmproj), calculada a partir del tamano de cada fichero GGUF mas el overhead de contexto y cache KV; son estimaciones, no medidas publicadas:
  - Q2_K (2,0 GB): en torno a 3-4 GB de VRAM.
  - Q4_K_M (2,8 GB): en torno a 4-5 GB de VRAM.
  - Q6_K (3,6 GB): en torno a 5-6 GB de VRAM.
  - Q8_0 (4,6 GB): en torno a 6-7 GB de VRAM.
  - f16 (8,5 GB): en torno a 10-12 GB de VRAM.
- GPU recomendadas: cualquiera con al menos 6-8 GB de VRAM para cuantizaciones Q4 y Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 permiten ejecutar comodamente las cuantizaciones Q4_K_M a Q8_0. Para f16 se recomienda una GPU de 16 GB o superior (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas usando Q4_K_M o inferiores; las cuantizaciones Q2_K y Q3_K son viables incluso en equipos con 4 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No se documenta compatibilidad con vLLM ni TGI para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion publicada sobre este modelo no incluye datos de rendimiento, por lo que la comparativa se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/LangMolDiode-Qwen3.5-4B-SFT-GGUF | 4,2 B | No disponible | GGUF (14 variantes) | No disponible | HuggingFace |
| ChemFM/LangMolDiode-Qwen3.5-4B-SFT | 4,2 B | No disponible | safetensors | No disponible | HuggingFace |
| Qwen3.5-4B (modelo generalista de la familia) | 4 B (serie Small de Qwen3.5) | No disponible | No disponible | No disponible | HuggingFace, Ollama |
| Qwen3-4B (generacion anterior) | 4 B | No disponible | No disponible | No disponible | HuggingFace, GitHub |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre si.

## Limitaciones y advertencias

- El autor de la cuantizacion no ha publicado cuantizaciones ponderadas ni con imatrix; solo estan disponibles las estaticas, lo que puede implicar una perdida de calidad algo mayor en las cuantizaciones pequenas (Q2_K, Q3_K) frente a alternativas calibradas.
- Las cuantizaciones Q2_K y Q3_K_M se etiquetan respectivamente como de baja calidad en la propia tabla del autor; para uso en produccion conviene partir de Q4_K_M o superior.
- El modelo esta declarado unicamente en ingles, por lo que el rendimiento en castellano o en otros idiomas no esta garantizado y no se documenta.
- No se especifica la licencia, ni en el repositorio de la cuantizacion ni en la informacion disponible del modelo base. Esto supone un riesgo legal para uso comercial: es imprescindible verificar la licencia del modelo ChemFM original antes de cualquier despliegue productivo.
- Riesgo de alucinacion: un modelo de 4,2 B ajustado para generar SMILES puede producir cadenas sintacticamente plausibles pero quimicamente invalidas o incorrectas. Toda salida debe validarse con herramientas deterministas (por ejemplo, RDKit) antes de usarse.
- No se documenta la longitud de contexto, lo que impide planificar casos de uso que dependan de ventanas largas.
- No hay informacion sobre sesgos, composicion del dataset de SFT ni procesos de alineamiento, por lo que no se puede evaluar el comportamiento del modelo fuera del dominio quimico.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado evaluaciones independientes; se trata de un artefacto sin validacion externa conocida.
- La fecha de creacion registrada en los metadatos (25 de septiembre de 2026) y la actualizacion (mismo dia, 31 minutos despues) indican una publicacion muy reciente y sin revisiones posteriores.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/LangMolDiode-Qwen3.5-4B-SFT-GGUF
- Modelo base: https://huggingface.co/ChemFM/LangMolDiode-Qwen3.5-4B-SFT
- Dataset de SFT: https://huggingface.co/datasets/ChemFM/LangMolDiode-SFT-Corpus
- Pagina resumen de cuantizaciones del autor: https://hf.tst.eu/model#LangMolDiode-Qwen3.5-4B-SFT-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Documentacion de la familia Qwen3.5 en Unsloth: https://unsloth.ai/docs/models/qwen3.5
- Repositorio QwenLM/Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Pagina de Qwen3.5 4B en Ollama: https://ollama.com/library/qwen3.5:4b
