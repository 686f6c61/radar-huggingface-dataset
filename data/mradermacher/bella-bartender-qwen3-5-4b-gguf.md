# mradermacher/bella-bartender-qwen3.5-4b-GGUF

## Resumen

bella-bartender-qwen3.5-4b-GGUF es la distribucion en formato GGUF del modelo bella-bartender-qwen3.5-4b, publicada por el usuario mradermacher, conocido en el ecosistema por generar cuantizaciones estaticas de modelos abiertos para su uso con llama.cpp y derivados. El modelo original, alojado por juiceb0xc0de, es un ajuste fino de la familia Qwen 3.5 con aproximadamente 4.205 millones de parametros (4,2 B), orientado a tareas conversacionales segun los tags del repositorio.

El interes practico de esta publicacion reside en que ofrece el modelo en un rango amplio de cuantizaciones (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB), lo que permite desplegarlo en hardware de consumo con VRAM limitada. Incluye ademas ficheros mmproj (multi-modal supplement), lo que sugiere que el modelo base incorpora capacidades de vision, aunque la model card no detalla la arquitectura interna ni el proceso de entrenamiento.

La informacion publicada es escasa: no se documentan licencia, idiomas mas alla del ingles declarado en los metadatos, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja exclusivamente lo disponible en la informacion proporcionada y marca como no disponible todo aquello que el autor no ha hecho publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen 3.5; transformer, sin confirmacion oficial) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (segun metadatos de la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base juiceb0xc0de/bella-bartender-qwen3.5-4b. Por el nombre y el tamano (4,2 B parametros) se infiere que deriva de un checkpoint de la familia Qwen 3.5, pero la model card no confirma la variante exacta, el numero de capas, la dimension oculta ni el mecanismo de atencion empleado. Tampoco se documenta si se trata de un transformer denso o de una arquitectura hibrida.

Respecto al entrenamiento, no se publican datos sobre volumen de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion. La presencia de ficheros mmproj en el repositorio indica que el modelo incorpora un proyector multimodal, lo que sugiere capacidad de procesamiento de imagenes, pero no se detalla el codificador visual ni el esquema de fusion de modalidades. El repositorio de cuantizacion documenta que se han generado cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1) y que existe una variante con cuantizacion ponderada/imatrix en un repositorio separado.

## Capacidades

- Generacion de texto conversacional: los tags del repositorio incluyen "conversational", lo que orienta el modelo a dialogos multi-turno.
- Procesamiento multimodal: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica soporte de entrada de imagenes, aunque no se detalla el alcance.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Idiomas: el unico idioma declarado en los metadatos es el ingles.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con cuantizaciones Q4_K_M (2,8 GB) o Q5_K_M (3,2 GB), el modelo puede ejecutarse en GPUs con 6-8 GB de VRAM mediante llama.cpp u Ollama, lo que facilita prototipado sin infraestructura cloud.
- Asistentes conversacionales especializados: al estar orientado a dialogo y ajustado sobre una base Qwen 3.5, puede emplearse como backend de un chat de dominio acotado (por ejemplo, atencion a clientes en ingles), siempre que se valide su calidad con evaluaciones propias dado que no hay benchmarks publicados.
- Experimentacion con modelos multimodales en local: los ficheros mmproj permiten probar entrada de imagenes en entornos con recursos limitados, util para investigacion sobre fusion vision-lenguaje a pequena escala.
- Integracion en pipelines de CI/CD para pruebas de regresion de prompts: el formato GGUF y su bajo peso permiten levantar instancias efimeras del modelo en contenedores para validar cambios en plantillas de prompt sin coste elevado.
- Educacion y docencia: el rango de cuantizaciones desde 2,0 GB hasta 8,5 GB permite demostrar en clase el impacto de la cuantizacion en calidad y velocidad sobre el mismo modelo.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de doce variantes (incluidas IQ4_XS y Q3_K_L) permite medir perplejidad y latencia por tipo de cuantizacion en un mismo hardware, replicando los estudios de la comunidad (ikawrakow, Artefact2) citados en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto, aproximada): Q2_K ~2,0 GB; Q3_K_S ~2,2 GB; Q3_K_M ~2,4 GB; Q3_K_L ~2,5 GB; IQ4_XS ~2,6 GB; Q4_K_S ~2,7 GB; Q4_K_M ~2,8 GB; Q5_K_S ~3,1 GB; Q5_K_M ~3,2 GB; Q6_K ~3,6 GB; Q8_0 ~4,6 GB; f16 ~8,5 GB. A estas cifras hay que sumar el espacio para la cache KV, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: para Q4_K_M o Q5_K_M basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 8 GB; para Q8_0 se recomienda 8-12 GB de VRAM; para f16 conviene una RTX 4090 (24 GB) o una A100/H100 si se busca throughput alto con lotes grandes.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones. Q2_K a Q4_K_M caben en GPUs de 4-8 GB; Q8_0 requiere al menos 6-8 GB libres.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de Hugging Face (tag endpoints_compatible). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para estos backends convendria usar el modelo base en safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| bella-bartender-qwen3.5-4b-GGUF (este) | 4,2 B | no disponible | no disponible | GGUF (12 cuantizaciones) | Hugging Face |
| Modelo base juiceb0xc0de/bella-bartender-qwen3.5-4b | 4,2 B | no disponible | no disponible | safetensors | Hugging Face |
| Familia Qwen 3.5 (checkpoints oficiales de 4 B) | ~4 B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF de terceros | Hugging Face |

No se dispone de datos de rendimiento comparado (benchmarks) ni de especificaciones de contexto de los modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de evaluaciones conversacionales, por lo que la calidad real del ajuste fino es desconocida y debe validarse antes de cualquier uso en produccion.
- Licencia no declarada: al no especificarse la licencia del modelo base ni de la cuantizacion, no se puede confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor del modelo base (juiceb0xc0de) antes de desplegarlo en entornos productivos.
- Idioma limitado: los metadatos solo declaran ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto desconocido: la longitud de contexto no se documenta, lo que impide planificar cargas de trabajo con documentos largos o conversaciones extensas.
- Riesgo de alucinacion: inherente a los modelos de 4 B de parametros; en tareas factuales o de dominio especializado la fiabilidad sera menor que en modelos mayores.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_M pueden degradar notablemente la coherencia; la propia model card advierte que Q3_K_M es de "lower quality".
- Modelo de nicho: el nombre "bella-bartender" sugiere un ajuste fino con proposito especifico (posiblemente roleplay o atencion en hosteleria); su comportamiento fuera de ese dominio puede ser erratico.
- Procedencia: el modelo base no procede de un laboratorio con documentacion exhaustiva, lo que reduce la trazabilidad sobre datos de entrenamiento y posibles sesgos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/bella-bartender-qwen3.5-4b-GGUF
- Modelo base: https://huggingface.co/juiceb0xc0de/bella-bartender-qwen3.5-4b
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/bella-bartender-qwen3.5-4b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#bella-bartender-qwen3.5-4b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
