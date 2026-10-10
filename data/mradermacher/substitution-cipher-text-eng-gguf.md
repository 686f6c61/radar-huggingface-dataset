# mradermacher/Substitution-Cipher-Text-Eng-GGUF

## Resumen

Substitution-Cipher-Text-Eng-GGUF es un conjunto de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo Cipher-AI/Substitution-Cipher-Text-Eng. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribucion optimizada para inferencia local del modelo original, cuyo proposito declarado en las etiquetas es el trabajo con cifrados por sustitucion (tags `cryptology` y `cipher`) sobre texto en ingles.

El modelo base cuenta con 222.903.552 parametros (aproximadamente 223 millones) segun los pesos en safetensors, lo que lo situa en la categoria de modelos pequenos. El repositorio de cuantizaciones ocupa 2,2 GB en total, pero cada archivo individual es muy ligero: desde 0,2 GB en Q2_K y Q4_K_M hasta 0,5 GB en f16. Esto lo hace desplegable en hardware muy modesto, incluida CPU sin GPU dedicada.

Su relevancia actual es acotada y de nicho: los modelos especializados en cifrados clasicos se utilizan como bancos de pruebas para evaluar la capacidad de razonamiento simbolico de modelos de lenguaje, como generadores de criptogramas para docencia y como material de aumento de datos. La model card no documenta arquitectura detallada, longitud de contexto ni resultados de evaluacion, por lo que buena parte de sus especificaciones figuran como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se distribuye mediante la libreria `transformers`; la model card no especifica la arquitectura concreta) |
| Parametros totales | 222.903.552 (segun los pesos en safetensors) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0_4_4, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base Cipher-AI/Substitution-Cipher-Text-Eng se distribuye en formato de `transformers` |

Datos adicionales del repositorio: 827 descargas, 0 likes, creado el 2024-11-12 y actualizado el 2026-10-10. No se especifica `pipeline` en la informacion disponible.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base. Los metadatos unicamente indican que se distribuye a traves de la libreria `transformers`, que el modelo fue cuantizado por mradermacher y que el proceso de conversion empleo `convert_type: hf` y `output_tensor_quantised: 1` (segun los comentarios internos de la model card). El numero de parametros (223 millones) corresponde a un modelo pequeno, coherente con un uso especializado y con su despliegue en CPU.

Respecto a los datos, la unica referencia es el dataset `agentlans/high-quality-english-sentences`, compuesto por frases en ingles de alta calidad. La model card no indica el numero de tokens de entrenamiento, la composicion exacta del corpus, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas del tipo atencion lineal, decodificacion especulativa o arquitecturas hibridas. Todos estos apartados deben considerarse no disponibles.

## Capacidades

- Procesamiento de texto en ingles: el unico idioma declarado en los metadatos es `en`.
- Trabajo con cifrados por sustitucion: las etiquetas `cryptology` y `cipher` indican que el modelo esta orientado a este dominio, aunque la model card no detalla las tareas exactas (codificacion, decodificacion o ambas).
- Generacion de texto en ingles: derivada del dataset de entrenamiento, compuesto por frases en ingles de alta calidad.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; solo se declara ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Razonamiento general, codigo o matematicas: no disponible, no se documenta ninguna evaluacion al respecto.

## Casos de uso

- Generacion de criptogramas para docencia: el modelo puede emplearse para producir textos en ingles codificados mediante sustitucion alfabetica, que despues se utilizan como ejercicios de criptografia clasica en aulas o talleres.
- Creacion de material para CTF y competiciones de seguridad: los cifrados por sustitucion aparecen con frecuencia en retos de nivel introductorio; un generador de este tipo permite crear enunciados y soluciones de forma automatizada.
- Aumento de datos para entrenar modelos resolutores de cifrados: generar pares texto plano / texto cifrado en ingles a escala para construir datasets de entrenamiento o evaluacion de modelos mayores orientados al razonamiento simbolico.
- Evaluacion comparativa de modelos de lenguaje: usar el modelo como referencia de tarea especifica para medir si modelos generalistas de mayor tamano resuelven correctamente cifrados por sustitucion, una capacidad relacionada con el razonamiento abstracto.
- Investigacion en criptografia clasica: analisis de patrones de frecuencia y de la calidad de las sustituciones generadas, con fines de estudio academico.
- Procesamiento local en entornos sin GPU: con 0,2 GB en Q4_K_M, puede ejecutarse en portatiles, mini-PC o contenedores ligeros para pipelines de generacion de texto en ingles de bajo coste.
- Ofuscacion de texto para pruebas de filtros: generar texto codificado en ingles para comprobar si los sistemas de moderacion o de seguridad detectan contenido ofuscado mediante cifrado simple.

Nota: las tareas concretas atribuibles al modelo se infieren del identificador del modelo base y de las etiquetas `cryptology` y `cipher`, ya que la model card no las describe explicitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la version GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se proporcionan datos de perplejidad para las distintas cuantizaciones ofrecidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en Q2_K, Q3_K, IQ4_XS y Q4_K; 0,3 GB en Q5_K, Q6_K y Q8_0; 0,5 GB en f16. Son tamanos de archivo, por lo que el consumo real en memoria anade el overhead del contexto y del runtime.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, etc.). Tambien es viable en GPUs integradas con memoria compartida.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU pura o en dispositivos tipo Raspberry Pi con suficiente RAM.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama (mediante Modelfile), LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base sin cuantizar, transformers con PyTorch.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas. Como referencia puramente aritmetica, un modelo de 223 millones de parametros en Q4_K_M ocupa 0,2 GB, por lo que la latencia estara dominada por el coste de carga del modelo y por el hardware de destino, no por el computo de inferencia.
- Nota sobre calidad de cuantizacion: el autor indica que no ha generado cuantizaciones ponderadas ni con imatrix, por lo que las versiones disponibles son estaticas. En tareas sensibles a tokens poco frecuentes, como pueden ser los simbolos de un cifrado, las cuantizaciones bajas (Q2_K, Q3_K) pueden degradar el resultado.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos directamente comparables de la misma categoria (especializados en cifrados por sustitucion). La unica referencia inmediata es el propio modelo base sin cuantizar.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Substitution-Cipher-Text-Eng-GGUF | 222.903.552 | no disponible | GGUF (13 cuantizaciones) | apache-2.0 | HuggingFace, 827 descargas |
| Cipher-AI/Substitution-Cipher-Text-Eng (base) | 222.903.552 | no disponible | transformers | apache-2.0 | HuggingFace (referenciado como `base_model`) |
| Otros modelos de cifrados clasicos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma unico: el modelo solo declara soporte de ingles (`en`); cualquier uso en castellano u otros idiomas queda fuera de su ambito declarado.
- Ambito funcional estrecho: las etiquetas sugieren especializacion en cifrados por sustitucion; no cabe esperar comportamiento de proposito general.
- Sesgos conocidos: no disponibles. La model card no documenta analisis de sesgos, y el dataset de entrenamiento (`agentlans/high-quality-english-sentences`) no se describe en terminos de composicion demografica o tematica.
- Riesgo de alucinacion: no evaluado. En modelos pequenos (223 millones de parametros) la tasa de generacion incorrecta o inventada suele ser elevada, especialmente fuera del dominio de entrenamiento, pero no hay datos publicados que lo cuantifiquen para este modelo.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide garantizar el tratamiento de entradas largas.
- Restricciones de licencia: la licencia es apache-2.0, que permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. Conviene verificar la licencia del modelo base por si hubiera condiciones adicionales no reflejadas en la model card de las cuantizaciones.
- Calidad de las cuantizaciones: las versiones de menor tamano (Q2_K, Q3_K_S, Q3_K_M) pueden degradar tareas que dependen de simbolos poco frecuentes. El autor recomienda Q4_K_S y Q4_K_M como opciones rapidas y equilibradas, y Q6_K y Q8_0 para maxima calidad dentro de tamanos contenidos.
- Ausencia de evaluacion: no hay benchmarks, ni datos de perplejidad, ni comparativas publicadas. Cualquier decision de produccion deberia ir precedida de una evaluacion propia sobre el caso de uso concreto.
- Adopcion limitada: 827 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Trazabilidad del autor: el repositorio corresponde a una cuantizacion de terceros (mradermacher), no al autor original del modelo. Las incidencias sobre el comportamiento del modelo deberian contrastarse con el repositorio base.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Substitution-Cipher-Text-Eng-GGUF
- Modelo base: https://huggingface.co/Cipher-AI/Substitution-Cipher-Text-Eng
- Pagina resumen de descargas del cuantizador para este modelo: https://hf.tst.eu/model#Substitution-Cipher-Text-Eng-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/agentlans/high-quality-english-sentences
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
