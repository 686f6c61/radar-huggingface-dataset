# mradermacher/AMF-G1-4B-Experimental-GGUF

## Resumen

AMF-G1-4B-Experimental-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo faysalbenahmed/AMF-G1-4B-Experimental, generadas por el usuario mradermacher. El modelo subyacente cuenta con 4.022.468.096 parametros (aproximadamente 4,02 mil millones) y se distribuye bajo licencia Apache 2.0, con el ingles como unico idioma declarado. Las etiquetas del repositorio lo asocian a la familia AMF (AI Mission Foundry) y a la arquitectura Qwen3, aunque no se incluye documentacion tecnica que confirme oficialmente ni la arquitectura ni el procedimiento de entrenamiento.

El repositorio no aporta model card propia del modelo base mas alla de los metadatos: no hay descripcion de la composicion del dataset, del numero de tokens de entrenamiento ni de si se aplicaron tecnicas de alineacion como RLHF o DPO. El valor practico de esta publicacion reside exclusivamente en el trabajo de cuantizacion: ofrece doce variantes de peso distintas (desde Q2_K de 1,8 GB hasta f16 de 8,2 GB) que permiten ejecutar un modelo de 4B en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF.

Se trata de un modelo marcado explicitamente como experimental, con cero descargas y cero valoraciones en el momento de redactar esta ficha, y sin resultados de benchmarks publicados. Es relevante para desarrolladores que quieran probar la familia AMF en local sin depender de APIs, pero no deberia adoptarse en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas del repositorio apuntan a qwen3; sin confirmacion documental) |
| Parametros totales | 4.022.468.096 (aprox. 4,02 B) |
| Parametros activos | no procede (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Autor de la cuantizacion | mradermacher |
| Modelo base | faysalbenahmed/AMF-G1-4B-Experimental |
| Tamano del repositorio | 36,4 GB (suma de todas las variantes) |
| Libreria declarada | transformers |
| Pipeline | no disponible |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |
| Cuantizaciones ponderadas (imatrix) | no disponibles en el momento de la publicacion |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base en los materiales disponibles. La unica referencia es la etiqueta `qwen3` incluida en el repositorio, que sugiere una arquitectura transformer de tipo decoder-only derivada de la familia Qwen3, pero no hay ficha tecnica, configuracion ni paper que lo confirme. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de preentrenamiento adicionales ni el uso de tecnicas de alineacion (RLHF, DPO, RLVR u otras).

Lo que si esta documentado es el proceso de cuantizacion. Segun los metadatos internos de la model card, se trata de cuantizaciones estaticas (`quantize_version: 2`, `output_tensor_quantised: 1`) generadas a partir de la conversion a formato HuggingFace (`convert_type: hf`). El autor indica que no hay cuantizaciones ponderadas con imatrix para este modelo y que no tiene previsto generarlas, aunque acepta peticiones mediante la seccion de discusiones de la comunidad. La model card incluye ademas la grafica comparativa de perplejidad de ikawrakow y el analisis de Artefact2 sobre calidad relativa de los tipos de cuantizacion, como material de referencia generico y no como evaluacion especifica de este modelo.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica que el modelo esta orientado a dialogos multi-turno.
- Generacion de texto general en ingles: es el unico idioma declarado, tanto en la tarjeta como en el campo `language`.
- Ejecucion local autocontenida: al distribuirse en GGUF, puede ejecutarse sin conexion a internet y sin envio de datos a terceros (`self-hosted`, `local-ai`).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse a traves de interfaces compatibles con la API de OpenAI, aunque no se detalla en la documentacion.
- Razonamiento, codigo y matematicas: no disponible. No hay ninguna evaluacion ni declaracion del autor que respalde estas capacidades.
- Tool calling / function calling: no disponible. No se documenta soporte de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible. No se documenta.
- Capacidades multimodales (vision, audio) o modo de razonamiento explicito: no disponible. No se documenta.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles sobre hardware de consumo: un modelo de 4B cuantizado a Q4_K_M ocupa 2,6 GB, por lo que puede desplegarse en un portatil con GPU integrada o en una CPU moderna mediante llama.cpp, sirviendo como banco de pruebas antes de escalar a un modelo mayor.
- Chatbot de soporte interno para equipos de desarrollo: al ejecutarse en local y bajo licencia Apache 2.0, permite desplegar un asistente de documentacion tecnica en ingles sin exponer datos internos a servicios externos.
- Generacion de texto offline en entornos air-gapped: el formato GGUF con todas las dependencias empaquetadas facilita su uso en redes aisladas, como laboratorios o entornos industriales con restricciones de conectividad.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece doce variantes del mismo modelo, lo que lo convierte en un caso util para medir el impacto de Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 e IQ4_XS sobre la calidad de las respuestas de un modelo de 4B.
- Base para ajuste fino posterior: al estar disponible el modelo original en safetensors con 4,02 B de parametros y licencia Apache 2.0, puede servir como punto de partida para fine-tuning con LoRA en tareas especificas en ingles.
- Integracion en asistentes de escritorio y extensiones de editor: runners como llama.cpp, Ollama o LM Studio exponen una API local que permite conectar el modelo a herramientas de autocompletado, resumen de notas o reescritura de textos.
- Experimentacion educativa con modelos Qwen3 de escala pequena: para quienes quieran estudiar el comportamiento de la familia Qwen3 a 4B sin depender degrandes infraestructuras, estas cuantizaciones reducen la barrera de entrada a un solo equipo.
- Generacion de contenido de baja criticidad (borradores, resumenes, variaciones de texto) donde el coste de un error es bajo y se valida con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de referencia, y las busquedas realizadas no han devuelto resultados tecnicos asociados a este modelo.

## Requisitos de hardware

Los tamanos de VRAM que se indican a continuacion son estimaciones derivadas del tamano real de cada archivo GGUF publicado en el repositorio, mas un margen de entre 1 y 2 GB para cache KV y sobrecarga del runtime. No son cifras proporcionadas por el autor.

| Cuantizacion | Peso en disco | VRAM estimada para inferencia |
|---|---|---|
| Q2_K | 1,8 GB | aprox. 2,5-3,5 GB |
| Q3_K_S | 2,0 GB | aprox. 3-4 GB |
| Q3_K_M | 2,2 GB | aprox. 3-4 GB |
| Q3_K_L | 2,3 GB | aprox. 3,5-4,5 GB |
| IQ4_XS | 2,4 GB | aprox. 3,5-4,5 GB |
| Q4_K_S | 2,5 GB | aprox. 3,5-5 GB |
| Q4_K_M | 2,6 GB | aprox. 4-5 GB |
| Q5_K_S | 2,9 GB | aprox. 4-5,5 GB |
| Q5_K_M | 3,0 GB | aprox. 4,5-6 GB |
| Q6_K | 3,4 GB | aprox. 5-6,5 GB |
| Q8_0 | 4,4 GB | aprox. 6-8 GB |
| f16 | 8,2 GB | aprox. 10-12 GB |

- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q6_K en tarjetas con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070). Q8_0 entra en GPUs de 8 GB con contexto moderado. f16 requiere 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080).
- Ejecucion parcial en CPU: las variantes Q4 y Q3 son viables en CPU con 8-16 GB de RAM; el autor recomienda Q4_K_S y Q4_K_M por su relacion velocidad/tamano y Q6_K por calidad.
- GPU de datacenter: no son necesarias. Una A100 o H100 estaria sobredimensionada para un modelo de 4B; solo tendria sentido para servir muchas instancias concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, Jan, text-generation-webui y llama-cpp-python. vLLM y TGI ofrecen soporte GGUF limitado o experimental, por lo que no son la via recomendada para este repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

La comparativa se establece con modelos de la misma escala (3B-4B) y con licencia permisiva. Los datos de las alternativas proceden de informacion publica general y no han sido verificados en la busqueda asociada a esta ficha; conviene contrastarlos antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| AMF-G1-4B-Experimental-GGUF | 4,02 B | no disponible | Apache 2.0 | Si, 12 cuantizaciones |
| Qwen3-4B | 4,02 B | 32.768 tokens (segun informacion publica) | Apache 2.0 | Si, amplia comunidad |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens (segun informacion publica) | Licencia comunitaria de Llama | Si, amplia comunidad |
| Phi-4-mini-instruct | 3,8 B | 128.000 tokens (segun informacion publica) | MIT | Si |

Diferencias relevantes: frente a las alternativas, este modelo no publica contexto declarado, no tiene benchmarks ni documentacion de entrenamiento, y carece de traccion en la comunidad (cero descargas). Su ventaja competitiva es unicamente la variedad de cuantizaciones disponibles y el hecho de que el autor mantiene un flujo de cuantizacion sistematico.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor: no ha superado un ciclo de validacion publico y no deberia usarse en produccion sin evaluacion previa.
- Ausencia total de model card tecnica del modelo base: se desconoce la arquitectura exacta, la longitud de contexto soportada, los datos de entrenamiento y cualquier fase de alineacion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento, codigo o seguimiento de instrucciones.
- Cero descargas y cero likes: no existe retroalimentacion de la comunidad que permita anticipar comportamientos problematicos.
- Unico idioma declarado: ingles. No hay soporte documentado de castellano ni de otros idiomas.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no hay datos especificos de este modelo, por lo que debe asumirse un riesgo estandar y verificar todas las salidas factibles.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K degradan notablemente la perplejidad segun las referencias genericas incluidas en la model card. Para uso real se recomienda Q4_K_M o superior.
- Sin cuantizaciones ponderadas (imatrix): el autor indica que no estan disponibles y que probablemente no las generara, lo que limita la calidad alcanzable en los tramos bajos (2-3 bits).
- Sesgos: no disponibles. No se ha realizado ninguna evaluacion de sesgo sobre este modelo ni sobre su base.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y sin garantias. Debe verificarse que la licencia declarada en este repositorio de cuantizacion coincida con la del modelo original en safetensors antes de un despliegue comercial.
- Dependencia del repositorio base: si el autor del modelo original elimina o modifica sus pesos, estas cuantizaciones quedan como un artefacto derivado sin mantenimiento garantizado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AMF-G1-4B-Experimental-GGUF
- Modelo base: https://huggingface.co/faysalbenahmed/AMF-G1-4B-Experimental
- Pagina resumen de cuantizaciones del autor: https://hf.tst.eu/model#AMF-G1-4B-Experimental-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Web del autor de la cuantizacion: https://www.nethype.de/
