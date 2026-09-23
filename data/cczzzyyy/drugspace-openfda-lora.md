# cczzzyyy/DrugSpace-openfda-lora

## Resumen

DrugSpace-openfda-lora es un adaptador LoRA (PEFT) publicado por el usuario cczzzyyy sobre el modelo base cczzzyyy/DrugSpace-mntp-8B. Se trata de un modelo orientado a la generacion de embeddings (pipeline feature-extraction) dentro del dominio biomedico y del descubrimiento de farmacos, construido sobre la metodologia LLM2Vec, que convierte un transformer decoder-only en un encoder de texto mediante entrenamiento MNTP (Masked Next Token Prediction) seguido de aprendizaje contrastivo no supervisado. El nombre del adaptador sugiere un ajuste fino orientado al corpus OpenFDA, aunque la ficha de HuggingFace no documenta la composicion exacta del dataset utilizado.

El modelo base es de 8.000 millones de parametros aproximadamente (deducido del identificador DrugSpace-mntp-8B) y la etiqueta de licencia del repositorio apunta a llama3.1, lo que indica que la arquitectura subyacente es probablemente la de Llama 3.1 8B. El repositorio no incluye informacion sobre idiomas soportados, benchmarks ni detalles de entrenamiento, y registra 0 descargas y 0 likes en el momento de la consulta.

Su relevancia radica en que forma parte de una familia de modelos (DrugSpace) que busca producir representaciones vectoriales especializadas para farmacos y texto biomedico, un nicho donde los embeddings genericos suelen rendir peor. Al ser un adaptador LoRA, su peso es reducido y puede combinarse con el modelo base para generar embeddings de documentos, farmacos o entidades clinicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (LLM2Vec, base tipo Llama 3.1 8B); no confirmado de forma explicita en la ficha |
| Parametros totales | Aproximadamente 8.000 millones en el modelo base; el adaptador LoRA anade un numero reducido de parametros entrenables (no disponible el conteo exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, presumiblemente la de Llama 3.1 8B, sin confirmar) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador estan en safetensors; no se documentan versiones GGUF ni cuantizaciones especificas) |
| Idiomas soportados | No disponible |
| Licencia | Etiqueta del repositorio: llama3.1; el campo de licencia de la ficha figura como no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apoya en el modelo cczzzyyy/DrugSpace-mntp-8B, que a su vez emplea la metodologia LLM2Vec. LLM2Vec transforma un modelo decoder-only (tipicamente un LLM causal como Llama) en un encoder de texto bidireccional: primero habilita la atencion bidireccional y entrena con MNTP, y despues aplica aprendizaje contrastivo no supervisado para producir embeddings de oracion de calidad. Sobre esa base, DrugSpace-openfda-lora aplica un ajuste fino con LoRA, presumiblemente con datos derivados de OpenFDA.

El repositorio no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de preferencia como RLHF o DPO (en modelos de embeddings no suelen aplicarse). Tampoco se especifica el rango, el alpha ni los modulos objetivo de la adaptacion LoRA. Dentro de la misma familia existen otros adaptadores, como cczzzyyy/DrugSpace-full-lora (descrito en el repositorio GitHub como un LoRA de aprendizaje contrastivo recomendado para generacion general de embeddings) y cczzzyyy/DrugSpace-full-lora-eval (un checkpoint orientado a evaluacion, entrenado solo con farmacos anteriores a 2020).

## Capacidades

- Generacion de embeddings de texto para tareas de representacion densa (feature-extraction), no de generacion de texto libre.
- Codificacion semantica de contenido biomedico y farmacologico, segun la orientacion declarada del modelo (biomedical, drug-discovery).
- Similitud semantica entre farmacos, documentos regulatorios o entidades clinicas.
- Recuperacion semantica (retrieval) para sistemas RAG sobre corpus biomedicos.
- Extraccion de caracteristicas para clasificacion, clustering y busqueda por similitud.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo orientado a agentes).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Recuperacion semantica sobre documentacion de la FDA: indexar etiquetas, avisos y documentos regulatorios como vectores y recuperar los fragmentos mas relevantes ante una consulta en lenguaje natural, aprovechando la especializacion biomedica del modelo.
- Busqueda por similitud de farmacos: generar embeddings de nombres, descripciones o estructuras descritas textualmente para encontrar farmacos con perfiles similares dentro de una base de datos.
- Sistema RAG para literatura biomedica: usar el modelo como recuperador en un pipeline que alimente a un LLM generativo, mejorando la precision del contexto recuperado frente a embeddings genericos.
- Deduplicacion y resolucion de entidades: detectar registros duplicados o equivalentes en bases de datos de farmacos comparando la similitud coseno de sus embeddings.
- Clustering de eventos adversos: agrupar notificaciones o descripciones de efectos secundarios en categorias coherentes mediante la representacion vectorial del texto.
- Clasificacion de documentos clinicos: entrenar un clasificador ligero sobre los embeddings extraidos para etiquetar documentos por area terapeutica o tipo de producto.
- Analisis de tendencias regulatorias: proyectar grandes volumenes de documentos en un espacio vectorial y analizar la evolucion temporal de temas mediante tecnicas de reduccion de dimensionalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 8.000 millones de parametros, se estiman en torno a 16 GB en precision fp16, unos 8 GB en int8 y unos 5-6 GB en cuantizacion de 4 bits, cifras orientativas y no confirmadas por la ficha.
- El adaptador LoRA en si ocupa muy poco espacio (del orden de decenas o cientos de megabytes), pero requiere cargar el modelo base completo para funcionar.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o A6000 para despliegues de alto rendimiento; RTX 4090 (24 GB) es suficiente para inferencia en fp16 con lotes moderados.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas con 16 GB o mas de VRAM en fp16 (RTX 4090, RTX 4080 con cuantizacion), y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: al ser un adaptador PEFT, puede servirse con librerias compatibles con transformers y PEFT; para embeddings de alto rendimiento pueden emplearse frameworks de inferencia vectorial, aunque no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| DrugSpace-openfda-lora | ~8B (base) + LoRA | no disponible | Embeddings biomedicos (LLM2Vec) | llama3.1 (segun etiqueta) | Este modelo; sin benchmarks publicados |
| cczzzyyy/DrugSpace-full-lora | ~8B (base) + LoRA | no disponible | Embeddings biomedicos (LLM2Vec) | no disponible | Mismo autor; recomendado en el repositorio GitHub para generacion general de embeddings |
| cczzzyyy/DrugSpace-full-lora-eval | ~8B (base) + LoRA | no disponible | Embeddings biomedicos (LLM2Vec) | no disponible | Entrenado solo con farmacos anteriores a 2020; orientado a evaluacion |
| cczzzyyy/DrugSpace-mntp-8B | ~8B | no disponible | Modelo base LLM2Vec (MNTP) | no disponible | Base sobre la que se aplican los adaptadores LoRA |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre si ni frente a alternativas externas como PubMedBERT, BioLORD o MedCPT.

## Limitaciones y advertencias

- No es un modelo generativo: su funcion principal es producir embeddings, por lo que no debe esperarse que genere texto, razonamiento o codigo de forma fiable.
- No se documentan sesgos conocidos, pero los modelos biomedicos pueden heredar sesgos de los corpus de entrenamiento (por ejemplo, infrarrepresentacion de determinadas poblaciones o areas terapeuticas).
- Riesgo de alucinacion: no aplica de la misma forma que en modelos generativos, pero las similitudes pueden ser enganosas si los embeddings no se calibran para el dominio de uso.
- Limitaciones de contexto e idioma: la ficha no especifica idiomas soportados ni longitud de contexto util, lo que dificulta planificar su uso en produccion.
- Restricciones de licencia: la etiqueta indica llama3.1, lo que implica que se heredan las condiciones de la licencia de Llama 3.1 (incluidas posibles restricciones de uso comercial y la clausula de licencia comunitaria); conviene verificar los terminos antes de un uso comercial.
- Estado del repositorio: 0 descargas y 0 likes, sin documentacion de entrenamiento ni evaluacion publicada; se recomienda tratarlo como un experimento y validar su calidad con un conjunto de evaluacion propio antes de integrarlo.
- Al ser un adaptador LoRA, requiere cargar el modelo base de forma conjunta; su comportamiento depende de la version exacta del modelo base y de la configuracion de PEFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cczzzzyy/DrugSpace-openfda-lora
- Perfil del autor: https://huggingface.co/cczzzzyy
- Modelo relacionado (full-lora): https://huggingface.co/cczzzzyy/DrugSpace-full-lora
- Repositorio GitHub del proyecto DrugSpace: https://github.com/caozhiyuan0424/DrugSpace
- Cuaderno de Google Colab asociado: https://colab.research.google.com/drive/1r09aImgL1YhQsJgsLWnb67-bjTV88-W0?usp=sharing
