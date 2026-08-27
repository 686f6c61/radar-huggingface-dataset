# mradermacher/Celestial-Order-24B-V3-i1-GGUF

## Resumen

Celestial-Order-24B-V3-i1-GGUF es la version cuantizada en formato GGUF del modelo Sorihon/Celestial-Order-24B-V3, un modelo de lenguaje de 23.572 millones de parametros creado mediante mergekit. El trabajo de cuantizacion ha sido realizado por mradermacher, un conocido cuantizador de la comunidad open source, que ofrece tanto versiones con imatrix (esta) como versiones estaticas en un repositorio separado.

El modelo base es un merge de multiples modelos de 24B, una categoria que ha ganado popularidad por ofrecer un equilibrio entre calidad y requisitos de hardware, permitiendo su ejecucion en GPUs de consumo con 24 GB de VRAM. Esta version i1 utiliza la tecnica de cuantizacion con imatrix, que mejora la calidad de la cuantizacion al calibrar los pesos con datos representativos del dominio de uso.

La relevancia de esta ficha radica en que el formato GGUF permite ejecutar el modelo en una amplia variedad de hardware, desde GPUs de gama alta hasta CPUs, mediante herramientas como llama.cpp u Ollama. El repositorio incluye 22 cuantizaciones diferentes, desde IQ1_S (5,4 GB) hasta Q6_K (19,4 GB), lo que permite adaptar el modelo a practicamente cualquier configuracion de hardware disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos 24B via mergekit) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base Sorihon/Celestial-Order-24B-V3 no esta documentada en la informacion disponible. Se sabe que fue creado mediante mergekit, una herramienta para combinar multiples modelos mediante tecnicas como SLERP, TIES o DARE. El resultado es un modelo denso de 23,57B parametros, lo que sugiere que los modelos base utilizados para el merge pertenecen a la familia de 24B (como Qwen2.5-24B o similares).

El proceso de cuantizacion realizado por mradermacher utiliza la tecnica de imatrix (importance matrix), que asigna mayor precision a los pesos mas importantes del modelo. Esto se consigue calibrando la cuantizacion con datos representativos, lo que reduce la perdida de calidad respecto a la cuantizacion estatica tradicional. El repositorio incluye el archivo de imatrix (0,1 GB) para que otros usuarios puedan crear sus propias cuantizaciones personalizadas.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO al modelo base.

## Capacidades

- Generacion de texto en ingles: el modelo es capaz de producir texto coherente y contextualmente relevante en ingles.
- Razonamiento y conversacion: al ser un merge de modelos de 24B, se espera que mantenga capacidades de razonamiento y dialogo multi-turno propias de esa categoria.
- Ejecucion local eficiente: gracias al formato GGUF, puede ejecutarse en CPU, GPU o configuraciones hibridas con un consumo de memoria ajustable segun la cuantizacion elegida.
- Compatibilidad con herramientas de inferencia: funciona con llama.cpp, Ollama, LM Studio y otros motores compatibles con GGUF.
- Personalizacion de cuantizacion: el archivo imatrix incluido permite generar cuantizaciones propias adaptadas a casos de uso especificos.
- No se dispone de informacion sobre soporte de tool calling, function calling, capacidades multimodales o modo de razonamiento extendido.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en una maquina con GPU de 24 GB (por ejemplo, RTX 3090 o 4090) usando la cuantizacion Q4_K_M (14,4 GB) para obtener un asistente de chat privado sin dependencia de servicios en la nube.
- Generacion de texto creativo: con cuantizaciones de alta precision como Q5_K_M o Q6_K, el modelo puede utilizarse para redactar articulos, cuentos o guiones en ingles, aprovechando la calidad del merge de 24B.
- Prototipado rapido de aplicaciones NLP: los desarrolladores pueden integrar el modelo mediante la API de llama.cpp o el servidor OpenAI-compatible de llama.cpp para probar ideas de productos sin costes de inferencia en la nube.
- Entornos con recursos limitados: las cuantizaciones IQ2 e IQ3 (entre 6,6 y 10,8 GB) permiten ejecutar el modelo en GPUs de 8-12 GB de VRAM o incluso en CPU con suficiente RAM, facilitando experimentacion en equipos modestos.
- Desarrollo de pipelines de RAG: el modelo puede combinarse con bases vectoriales y frameworks como LangChain para construir sistemas de recuperacion aumentada que respondan preguntas sobre documentacion interna en ingles.
- Evaluacion de calidad de cuantizacion: el archivo imatrix y la variedad de cuantizaciones disponibles permiten a investigadores comparar el impacto de diferentes niveles de compresion en la calidad del modelo para tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de MMLU, HumanEval, GSM8K ni otros tests estandarizados. La calidad relativa de las cuantizaciones se indica de forma cualitativa en la tabla de archivos (por ejemplo, "Q4_K_S: optimal size/speed/quality" o "IQ3_S: beats Q3_K*"), pero sin datos numericos que respalden estas afirmaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 5,4 GB (IQ1_S) y 19,4 GB (Q6_K) para los pesos del modelo, mas overhead de contexto y calculos. La cuantizacion Q4_K_M (14,4 GB) es la recomendada por el autor para equilibrio entre calidad y requisitos.
- GPUs compatibles: cualquier GPU con al menos 6 GB de VRAM puede ejecutar las cuantizaciones mas pequeñas. Para las cuantizaciones Q4 y superiores se recomienda una GPU con 16-24 GB de VRAM (RTX 4080, RTX 4090, A5000, etc.).
- Ejecucion en CPU: posible con las cuantizaciones mas pequeñas (IQ1, IQ2) si se dispone de suficiente RAM (16-32 GB), aunque la velocidad sera significativamente menor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp, text-generation-webui y cualquier otro frontend compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones especificas. Como referencia, un modelo de 24B en Q4_K_M suele generar entre 10 y 30 tokens por segundo en una RTX 4090 con llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Celestial-Order-24B-V3 (GGUF) | 23,57B | no disponible | GGUF | no disponible | Merge de modelos 24B, cuantizado con imatrix |
| Goetia-24B-v1.3 | 24B | no disponible | GGUF | no disponible | Modelo orientado a roleplay, cuantizado por mradermacher |
| Otros modelos 24B en GGUF | 24B | variable | GGUF | variable | Categoria popular para GPUs de 24 GB VRAM |

No se dispone de datos de rendimiento comparativo entre estos modelos. La eleccion entre ellos dependera de las caracteristicas especificas del merge (por ejemplo, si esta optimizado para roleplay, codigo o chat general), que no estan documentadas en la informacion disponible.

## Limitaciones y advertencias

- Idioma limitado: el modelo esta etiquetado exclusivamente como "en" (ingles). No se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- Licencia desconocida: no se especifica la licencia del modelo base ni de la cuantizacion. Esto puede suponer un riesgo legal para uso comercial, por lo que se recomienda contactar con el autor del modelo base antes de desplegarlo en produccion.
- Sin informacion sobre sesgos: al no disponer de documentacion sobre el dataset de entrenamiento ni evaluaciones de sesgo, no se puede garantizar la ausencia de sesgos de genero, raza o ideologicos.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en cuantizaciones agresivas (IQ1, IQ2) donde la calidad se degrada notablemente.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- Calidad variable segun cuantizacion: las cuantizaciones mas pequeñas (IQ1, IQ2) presentan una degradacion significativa de calidad, como advierte el propio autor con notas como "for the desperate" o "very low quality".
- Modelo no documentado: el modelo base no dispone de model card detallada, por lo que se desconocen aspectos clave como el dataset de entrenamiento, la arquitectura exacta o las tecnicas de alineamiento utilizadas.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/Celestial-Order-24B-V3-i1-GGUF
- Repositorio GGUF estatico: https://huggingface.co/mradermacher/Celestial-Order-24B-V3-GGUF
- Modelo base: https://huggingface.co/Sorihon/Celestial-Order-24B-V3
- Pagina de descargas de mradermacher: https://hf.tst.eu/model
- Guia de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
